from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException
from sqlalchemy.orm import Session
from db.database import get_db
from core.security import decode_token, require_role
from models.user import User
from models.proctor_log import ProctorLog
from models.exam import ExamAttempt, Exam
from models.course import Course
from schemas.schemas import ProctoringViolationEvent
import json
import base64
import numpy as np
import cv2
import asyncio
from concurrent.futures import ThreadPoolExecutor
import redis.asyncio as aioredis
from core.config import settings

# Thread pool for running YOLO without blocking the async event loop
_yolo_executor = ThreadPoolExecutor(max_workers=1)

# Lazy load YOLO to avoid massive startup overhead
yolo_model = None
def get_yolo_model():
    global yolo_model
    if yolo_model is None:
        import torch
        from ultralytics import YOLO
        yolo_model = YOLO("yolov8s.pt")
        # Use FP16 half-precision if GPU available (2x faster, half the memory)
        if torch.cuda.is_available():
            yolo_model.model.half()
            print("[Proctoring] YOLO running on GPU with FP16")
        else:
            print("[Proctoring] YOLO running on CPU")
        # Warm up the model with a dummy frame to avoid first-frame latency spike
        import numpy as np
        dummy = np.zeros((416, 416, 3), dtype=np.uint8)
        yolo_model.predict(dummy, imgsz=416, verbose=False)
        print("[Proctoring] YOLO warmed up and ready")
    return yolo_model

router = APIRouter(prefix="/api/proctoring", tags=["Proctoring"])

# Severity weights used to compute rolling cheat risk score
VIOLATION_WEIGHTS = {
    "tab_switch": 5,
    "clipboard_use": 8,
    "no_face": 15,
    "multiple_faces": 25,
    "phone_detected": 20,
    "eye_off_screen": 3,
    "background_noise": 5,
    "screen_resize": 3,
}

# Track active WebSocket connections: {exam_id: {user_id: WebSocket}}
active_connections: dict[int, dict[int, WebSocket]] = {}

# Track teacher monitor connections: {exam_id: [WebSocket]}
teacher_connections: dict[int, list[WebSocket]] = {}


class ProctorConnectionManager:
    async def connect_student(self, exam_id: int, user_id: int, websocket: WebSocket):
        await websocket.accept()
        if exam_id not in active_connections:
            active_connections[exam_id] = {}
        active_connections[exam_id][user_id] = websocket

    async def connect_teacher(self, exam_id: int, websocket: WebSocket):
        await websocket.accept()
        if exam_id not in teacher_connections:
            teacher_connections[exam_id] = []
        teacher_connections[exam_id].append(websocket)

    def disconnect_student(self, exam_id: int, user_id: int):
        if exam_id in active_connections:
            active_connections[exam_id].pop(user_id, None)

    def disconnect_teacher(self, exam_id: int, websocket: WebSocket):
        if exam_id in teacher_connections:
            teacher_connections[exam_id].discard(websocket)

    async def broadcast_to_teachers(self, exam_id: int, message: dict):
        """Send a real-time violation alert to all connected teachers monitoring this exam."""
        if exam_id in teacher_connections:
            dead_connections = []
            for ws in teacher_connections[exam_id]:
                try:
                    await ws.send_json(message)
                except Exception:
                    dead_connections.append(ws)
            for ws in dead_connections:
                teacher_connections[exam_id].discard(ws)


manager = ProctorConnectionManager()


@router.websocket("/ws/student/{exam_id}")
async def student_proctor_ws(
    exam_id: int,
    websocket: WebSocket,
    token: str,
    db: Session = Depends(get_db),
):
    """
    Real-time WebSocket for students during a proctored exam.
    The student's browser sends violation events (JSON) as they are detected
    by in-browser ML (TensorFlow.js / MediaPipe).
    """
    payload = decode_token(token)
    user_id = int(payload["sub"])

    # Verify exam belongs to student's tenant
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        await websocket.close(code=4001)
        return
        
    exam = db.query(Exam).join(Course, Course.id == Exam.course_id).filter(
        Exam.id == exam_id,
        Course.tenant_id == user.tenant_id
    ).first()
    
    if not exam:
        await websocket.close(code=4003)
        return

    await manager.connect_student(exam_id, user_id, websocket)

    # Get or create exam attempt
    attempt = db.query(ExamAttempt).filter(
        ExamAttempt.exam_id == exam_id,
        ExamAttempt.student_id == user_id,
        ExamAttempt.status == "in_progress",
    ).first()

    try:
        while True:
            raw = await websocket.receive_text()
            event = json.loads(raw)
            violation_type = event.get("violation_type", "unknown")
            severity = event.get("severity", "medium")

            # Calculate weight
            weight = VIOLATION_WEIGHTS.get(violation_type, 5)
            new_risk = min(100.0, (attempt.cheat_risk_score if attempt else 0) + weight)

            # Persist log to DB
            log = ProctorLog(
                exam_id=exam_id,
                user_id=user_id,
                violation_type=violation_type,
                severity=severity,
                description=event.get("description"),
                cumulative_risk_score=new_risk,
            )
            db.add(log)

            if attempt:
                attempt.cheat_risk_score = new_risk
            db.commit()

            # Broadcast to all monitoring teachers in real-time
            await manager.broadcast_to_teachers(exam_id, {
                "event": "violation",
                "student_id": user_id,
                "violation_type": violation_type,
                "severity": severity,
                "risk_score": new_risk,
            })

            # Acknowledge back to student
            await websocket.send_json({"status": "logged", "risk_score": new_risk})

    except WebSocketDisconnect:
        manager.disconnect_student(exam_id, user_id)


@router.websocket("/ws/teacher/{exam_id}")
async def teacher_monitor_ws(exam_id: int, websocket: WebSocket, token: str):
    """
    Real-time WebSocket for teachers monitoring all students in an exam.
    Receives violation alerts pushed from student WebSocket events.
    """
    decode_token(token)  # Validate token
    await manager.connect_teacher(exam_id, websocket)
    try:
        while True:
            await websocket.receive_text()  # Keep alive
    except WebSocketDisconnect:
        manager.disconnect_teacher(exam_id, websocket)


@router.get("/reports/{exam_id}")
async def get_proctor_report(
    exam_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("teacher", "tenant_admin", "super_admin")),
):
    """Generate a full proctoring violation report for a given exam."""
    from models.course import Course
    
    exam = db.query(Exam).join(Course, Course.id == Exam.course_id).filter(
        Exam.id == exam_id,
        Course.tenant_id == current_user.tenant_id
    ).first()
    
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
        
    logs = db.query(ProctorLog).filter(ProctorLog.exam_id == exam_id).all()

    # Group by student
    report = {}
    for log in logs:
        sid = log.user_id
        if sid not in report:
            report[sid] = {"student_id": sid, "violations": [], "max_risk_score": 0}
        report[sid]["violations"].append({
            "type": log.violation_type,
            "severity": log.severity,
            "timestamp": log.timestamp.isoformat(),
            "risk_score": log.cumulative_risk_score,
        })
        report[sid]["max_risk_score"] = max(report[sid]["max_risk_score"], log.cumulative_risk_score)

    return {"exam_id": exam_id, "student_reports": list(report.values())}


@router.get("/flags/recent")
async def get_recent_flags(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("teacher", "tenant_admin", "super_admin")),
):
    from models.course import Course
    from models.exam import Exam

    # Get exams for courses taught by this teacher
    teacher_courses = db.query(Course.id).filter(Course.teacher_id == current_user.id).subquery()
    teacher_exams = db.query(Exam.id).filter(Exam.course_id.in_(teacher_courses)).subquery()

    # Get the latest proctor logs with violations
    logs = db.query(ProctorLog).filter(
        ProctorLog.exam_id.in_(teacher_exams),
        ProctorLog.violation_type != None
    ).order_by(ProctorLog.timestamp.desc()).limit(20).all()

    res = []
    for log in logs:
        # Resolve risk level based on cumulative score
        risk = 'Low'
        color = '#3b82f6'
        if log.cumulative_risk_score > 70:
            risk = 'High'
            color = '#ef4444'
        elif log.cumulative_risk_score > 30:
            risk = 'Medium'
            color = '#f59e0b'

        res.append({
            "id": log.id,
            "student": log.user.full_name if log.user else "Unknown",
            "course": log.exam.title if log.exam else "Exam",
            "risk": risk,
            "type": log.violation_type.replace('_', ' ').title(),
            "time": log.timestamp.strftime("%H:%M %p"),
            "duration": "Snapshot",
            "color": color
        })
    return res


@router.websocket("/ws/vision/{exam_id}")
async def vision_proctor_ws(
    exam_id: int,
    websocket: WebSocket,
    token: str = "mock-token",
):
    """
    WebSocket for processing raw camera frames using YOLOv8.
    Expects frames as base64 encoded JPEGs.
    """
    # Validate token if real
    user_id = 1 
    if token and token != "mock-token":
        try:
            payload = decode_token(token)
            user_id = int(payload.get("sub", 1))
        except:
            pass

    await websocket.accept()
    model = get_yolo_model()

    try:
        while True:
            # Receive frame data (text base64)
            data = await websocket.receive_text()
            
            try:
                if data.startswith("data:image"):
                    header, encoded = data.split(",", 1)
                    data = encoded
                
                # Fix missing padding
                missing_padding = len(data) % 4
                if missing_padding:
                    data += "=" * (4 - missing_padding)

                # Decode base64 to numpy array for OpenCV
                img_bytes = base64.b64decode(data)
                np_arr = np.frombuffer(img_bytes, np.uint8)
                img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

                if img is not None:
                    # Run YOLO in a thread pool so it doesn't block the async event loop
                    # imgsz=416 is faster than 640 with minimal accuracy loss for our use case
                    loop = asyncio.get_event_loop()
                    results = await loop.run_in_executor(
                        _yolo_executor,
                        lambda: model.predict(img, classes=[0, 67], conf=0.15, imgsz=416, verbose=False)
                    )

                    person_count = 0
                    phone_detected = False

                    for r in results:
                        for box in r.boxes:
                            cls_id = int(box.cls[0])
                            if cls_id == 0:
                                person_count += 1
                            elif cls_id == 67:
                                phone_detected = True

                    violation = None
                    if phone_detected:
                        violation = "phone_detected"
                    elif person_count > 1:
                        violation = "multiple_faces"

                    if violation:
                        # Annotated frame with bounding boxes on violation
                        annotated_frame = results[0].plot()
                        _, buffer = cv2.imencode('.jpg', annotated_frame, [cv2.IMWRITE_JPEG_QUALITY, 70])
                        encoded_img = base64.b64encode(buffer).decode('utf-8')
                        await websocket.send_json({"status": "violation", "type": violation, "frame": encoded_img})
                    else:
                        # Always send back annotated frame so camera feed shows live CV detections
                        annotated_frame = results[0].plot()
                        _, buffer = cv2.imencode('.jpg', annotated_frame, [cv2.IMWRITE_JPEG_QUALITY, 60])
                        encoded_img = base64.b64encode(buffer).decode('utf-8')
                        await websocket.send_json({"status": "ok", "frame": encoded_img})
            except Exception as e:
                print(f"Error processing vision frame: {e}")
                
    except WebSocketDisconnect:
        pass

