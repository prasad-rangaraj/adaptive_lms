from sqlalchemy.orm import Session
from models.academic import TimetableEvent, AttendanceRecord, LeaveRequest, Department, Cohort
from models.assignment import Assignment, AssignmentSubmission
from models.enrollment import Enrollment
from models.course import Course
from datetime import datetime

def get_departments(db: Session, tenant_id: int):
    t_id = tenant_id or 1
    depts = db.query(Department).filter((Department.tenant_id == t_id) | (Department.tenant_id == 1)).all()
    if not depts:
        defaults = [
            {"name": "Computer Science & Engineering", "code": "CSE"},
            {"name": "Information Technology", "code": "IT"},
            {"name": "Electronics & Communication", "code": "ECE"},
            {"name": "Business & Finance", "code": "BAF"},
        ]
        created = []
        for d in defaults:
            new_dept = Department(tenant_id=t_id, name=d["name"], code=d["code"])
            db.add(new_dept)
            db.commit()
            db.refresh(new_dept)
            for yr in range(1, 5):
                db.add(Cohort(department_id=new_dept.id, name=f"Year {yr} - Sec A"))
            db.commit()
            created.append(new_dept)
        return created
    return depts

def get_cohorts(db: Session, department_id: int):
    return db.query(Cohort).filter(Cohort.department_id == department_id).all()

def create_timetable_event(db: Session, event_data: dict):
    event = TimetableEvent(**event_data)
    db.add(event)
    db.commit()
    db.refresh(event)
    return event

def get_timetable_by_tenant(db: Session, tenant_id: int):
    events = db.query(TimetableEvent).filter(TimetableEvent.tenant_id == tenant_id).all()
    results = []
    for e in events:
        start_str = e.start_time.strftime("%I:%M %p") if e.start_time else ""
        end_str = e.end_time.strftime("%I:%M %p") if e.end_time else ""
        
        # Calculate duration in minutes if both exist
        duration_str = "60 min"
        if e.start_time and e.end_time:
            # Need a full datetime to subtract times
            from datetime import datetime
            dt1 = datetime.combine(datetime.today(), e.start_time)
            dt2 = datetime.combine(datetime.today(), e.end_time)
            mins = int((dt2 - dt1).total_seconds() / 60)
            duration_str = f"{mins} min"
            
        results.append({
            "id": e.id,
            "day": e.day_of_week,
            "time": start_str,
            "duration": duration_str,
            "subject": e.title or (e.course.title if e.course else "Unknown Subject"),
            "type": e.type or "Theory",
            "faculty": e.faculty_name or (e.faculty.full_name if e.faculty else "TBA"),
            "venue": e.venue or "TBA"
        })
    return results

def get_student_attendance(db: Session, student_id: int):
    from models.academic import AttendanceRecord
    from models.course import Course
    records = db.query(AttendanceRecord).filter(AttendanceRecord.student_id == student_id).all()
    
    # Needs to return { subject, attended, held, color }
    stats = {}
    for r in records:
        course = db.query(Course).filter(Course.id == r.course_id).first()
        subj = course.title if course else "Unknown"
        
        if subj not in stats:
            # Assign a random color if not set, or default
            stats[subj] = {"subject": subj, "attended": 0, "held": 0, "color": "#8b5cf6"}
            
        stats[subj]["held"] += 1
        if r.status.lower() == "present":
            stats[subj]["attended"] += 1
            
    return list(stats.values())

def get_student_leave_requests(db: Session, student_id: int):
    records = db.query(LeaveRequest).filter(LeaveRequest.student_id == student_id).order_by(LeaveRequest.created_at.desc()).all()
    results = []
    for r in records:
        days = (r.end_date - r.start_date).days + 1 if r.end_date and r.start_date else 1
        results.append({
            "id": r.id,
            "type": r.type,
            "date": r.start_date.strftime("%d %b %Y") if r.start_date else "Unknown",
            "days": days,
            "status": r.status
        })
    return results

def get_student_assignments(db: Session, student_id: int):
    enrolled_course_ids = [r[0] for r in db.query(Enrollment.course_id).filter(Enrollment.student_id == student_id).all()]
    if not enrolled_course_ids:
        return []
    
    assignments = db.query(Assignment).filter(
        Assignment.course_id.in_(enrolled_course_ids),
        Assignment.is_published == True
    ).order_by(Assignment.due_date.asc()).all()
    
    import datetime
    
    results = []
    now = datetime.datetime.utcnow()
    for a in assignments:
        course = db.query(Course).filter(Course.id == a.course_id).first()
        
        # Derive priority based on time left
        priority = "low"
        if a.due_date:
            days_left = (a.due_date - now).days
            if days_left < 2:
                priority = "high"
            elif days_left < 7:
                priority = "medium"
                
        # Also determine if submitted
        submission = db.query(AssignmentSubmission).filter(
            AssignmentSubmission.assignment_id == a.id,
            AssignmentSubmission.student_id == student_id
        ).first()
                
        results.append({
            "id": a.id,
            "title": a.title,
            "subject": course.title if course else "Unknown",
            "priority": priority,
            "due": a.due_date.strftime('%d %b, %H:%M') if a.due_date else "No due date",
            "submitted": bool(submission)
        })
    return results

def get_student_pyqs(db: Session, student_id: int):
    from models.academic import AcademicResource
    # Find courses student is enrolled in
    enrolled_courses = [r[0] for r in db.query(Enrollment.course_id).filter(Enrollment.student_id == student_id).all()]
    if not enrolled_courses:
        return []
        
    resources = db.query(AcademicResource).filter(
        AcademicResource.course_id.in_(enrolled_courses),
        AcademicResource.resource_type == 'PYQ'
    ).all()
    
    return [
        {
            "id": r.id,
            "title": r.title,
            "type": r.resource_type,
            "size": r.file_size or "1.0 MB",
            "url": r.file_url
        } for r in resources
    ]

def get_student_marks(db: Session, student_id: int):
    from models.academic import StudentMark
    marks = db.query(StudentMark).filter(StudentMark.student_id == student_id).all()
    
    grouped = {}
    for m in marks:
        course = db.query(Course).filter(Course.id == m.course_id).first()
        subj = course.title if course else "Unknown"
        if subj not in grouped:
            grouped[subj] = {"subject": subj, "credits": m.credits, "ca1": 0, "ca2": 0, "ca3": 0, "model": 0}
            
        atype = m.assessment_type.lower()
        if atype == 'ca1': grouped[subj]["ca1"] = m.marks_obtained
        elif atype == 'ca2': grouped[subj]["ca2"] = m.marks_obtained
        elif atype == 'ca3': grouped[subj]["ca3"] = m.marks_obtained
        elif atype == 'model': grouped[subj]["model"] = m.marks_obtained
        
    return list(grouped.values())
