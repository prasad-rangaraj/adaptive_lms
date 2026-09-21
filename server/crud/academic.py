from sqlalchemy.orm import Session
from models.academic import TimetableEvent, AttendanceRecord, LeaveRequest

def get_timetable_by_tenant(db: Session, tenant_id: int):
    return db.query(TimetableEvent).filter(TimetableEvent.tenant_id == tenant_id).all()

def get_student_attendance(db: Session, student_id: int):
    return db.query(AttendanceRecord).filter(AttendanceRecord.student_id == student_id).all()

def get_student_leave_requests(db: Session, student_id: int):
    return db.query(LeaveRequest).filter(LeaveRequest.student_id == student_id).order_by(LeaveRequest.created_at.desc()).all()
