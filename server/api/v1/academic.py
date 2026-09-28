from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from db.database import get_db
from core.security import get_current_user
from models.user import User
import crud.academic as crud_academic
import schemas.schemas as schemas

router = APIRouter()

@router.get("/timetable", response_model=List[schemas.TimetableEventResponse])
def get_timetable(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.tenant_id:
        return []
    return crud_academic.get_timetable_by_tenant(db, current_user.tenant_id)

@router.get("/attendance", response_model=List[schemas.AttendanceRecordResponse])
def get_attendance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return crud_academic.get_student_attendance(db, current_user.id)

@router.get("/leave-requests", response_model=List[schemas.LeaveRequestResponse])
def get_leave_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return crud_academic.get_student_leave_requests(db, current_user.id)

@router.get("/assignments")
def get_assignments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return crud_academic.get_student_assignments(db, current_user.id)

@router.get("/pyqs")
def get_pyqs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return crud_academic.get_student_pyqs(db, current_user.id)

@router.get("/marks")
def get_marks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return crud_academic.get_student_marks(db, current_user.id)

@router.get("/teacher/attendance")
def get_teacher_attendance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from models.course import Course
    from models.enrollment import Enrollment
    from models.academic import AttendanceRecord
    from sqlalchemy import func

    teacher_courses = db.query(Course.id).filter(Course.teacher_id == current_user.id).subquery()
    enrollments = db.query(Enrollment).filter(Enrollment.course_id.in_(teacher_courses)).all()

    res = []
    for en in enrollments:
        if not en.student:
            continue
        total = db.query(AttendanceRecord).filter(
            AttendanceRecord.student_id == en.student.id,
            AttendanceRecord.course_id == en.course_id
        ).count()
        present = db.query(AttendanceRecord).filter(
            AttendanceRecord.student_id == en.student.id,
            AttendanceRecord.course_id == en.course_id,
            AttendanceRecord.status == "Present"
        ).count()
        pct = round((present / total * 100) if total else 0, 1)
        res.append({
            "id": en.student.id,
            "name": en.student.full_name,
            "roll": f"{en.student.id}CS01",
            "status": "present" if pct >= 75 else "at-risk",
            "attendance": pct
        })
    return res

@router.get("/teacher/leave-requests")
def get_teacher_leave_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from models.academic import LeaveRequest
    from models.course import Course
    from models.enrollment import Enrollment

    teacher_courses = db.query(Course.id).filter(Course.teacher_id == current_user.id).subquery()
    enrolled_students = db.query(Enrollment.student_id).filter(Enrollment.course_id.in_(teacher_courses)).subquery()

    leaves = db.query(LeaveRequest).filter(LeaveRequest.student_id.in_(enrolled_students)).all()

    return [
        {
            "id": lv.id,
            "student": lv.student.full_name if lv.student else "Unknown",
            "type": lv.type,
            "dates": f"{lv.start_date} - {lv.end_date}",
            "reason": lv.reason,
            "docs": 0,
            "status": lv.status.lower()
        } for lv in leaves
    ]

@router.get("/teacher/questions")
def get_teacher_questions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from models.exam import ExamQuestion, Exam
    from models.course import Course

    teacher_courses = db.query(Course.id).filter(Course.teacher_id == current_user.id).subquery()
    teacher_exams = db.query(Exam.id).filter(Exam.course_id.in_(teacher_courses)).subquery()

    questions = db.query(ExamQuestion).filter(ExamQuestion.exam_id.in_(teacher_exams)).limit(50).all()

    return [
        {
            "id": q.id,
            "text": q.question_text,
            "type": q.question_type,
            "difficulty": q.difficulty or "medium",
            "tags": []
        } for q in questions
    ]
