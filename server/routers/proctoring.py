from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from core.security import decode_token
from models.proctor_log import ProctorLog
from models.exam import ExamAttempt
from schemas.schemas import ProctoringViolationEvent
import json
import redis.asyncio as aioredis
from core.config import settings

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
):
    """Generate a full proctoring violation report for a given exam."""
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
