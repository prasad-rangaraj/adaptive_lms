from sqlalchemy.orm import Session
from models.academic import TimetableEvent, AttendanceRecord, LeaveRequest
from models.assignment import Assignment, AssignmentSubmission
from models.enrollment import Enrollment
from models.course import Course

def get_timetable_by_tenant(db: Session, tenant_id: int):
    return db.query(TimetableEvent).filter(TimetableEvent.tenant_id == tenant_id).all()

def get_student_attendance(db: Session, student_id: int):
    return db.query(AttendanceRecord).filter(AttendanceRecord.student_id == student_id).all()

def get_student_leave_requests(db: Session, student_id: int):
    return db.query(LeaveRequest).filter(LeaveRequest.student_id == student_id).order_by(LeaveRequest.created_at.desc()).all()

def get_student_assignments(db: Session, student_id: int):
    enrolled_course_ids = [r[0] for r in db.query(Enrollment.course_id).filter(Enrollment.student_id == student_id).all()]
    if not enrolled_course_ids:
        return []
    
    assignments = db.query(Assignment).filter(
        Assignment.course_id.in_(enrolled_course_ids),
        Assignment.is_published == True
    ).order_by(Assignment.due_date.asc()).all()
    
    results = []
    for a in assignments:
        course = db.query(Course).filter(Course.id == a.course_id).first()
        results.append({
            "id": a.id,
            "title": a.title,
            "subject": course.title if course else "Unknown",
            "priority": "high", # Mocking priority
            "due": a.due_date.strftime('%d %b, %H:%M') if a.due_date else "No due date"
        })
    return results

def get_student_pyqs(db: Session, student_id: int):
    # Mocking PYQs for now
    return [
        {"title": "Mathematics III - 2024 End Sem", "type": "PYQ", "size": "2.4 MB"},
        {"title": "Algorithms Cheat Sheet", "type": "Notes", "size": "1.1 MB"}
    ]

def get_student_marks(db: Session, student_id: int):
    # Mocking Marks/Credits for CGPA calculation
    return [
        {"subject": "Mathematics III", "credits": 4},
        {"subject": "Data Structures", "credits": 4},
        {"subject": "Computer Networks", "credits": 3},
        {"subject": "Operating Systems", "credits": 3},
        {"subject": "Software Engineering", "credits": 3}
    ]
