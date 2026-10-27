from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Dict, Any

from db.database import get_db
from core.security import get_current_user
from models.user import User
from models.enrollment import Enrollment
from models.course import Course

router = APIRouter()

@router.get("/summary")
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    import datetime
    now_utc = datetime.datetime.now(datetime.timezone.utc)
    today_date = now_utc.date()

    # Aggregate endpoint for the student dashboard
    enrollments = db.query(Enrollment).filter(Enrollment.student_id == current_user.id).all()
    enrolled_course_ids = [enr.course_id for enr in enrollments if enr.course_id]

    recent_items = []
    path = []

    for enr in enrollments:
        if enr.course:
            recent_items.append({
                "id": enr.course.id,
                "type": "video",
                "title": f"Continue: {enr.course.title}",
                "course": enr.course.title,
                "progress": enr.progress_percentage or 0,
                "timeleft": "Active",
                "img": enr.course.thumbnail_url,
                "color": "#4f46e5"
            })

            if (enr.progress_percentage or 0) < 100:
                path.append({
                    "step": len(path) + 1,
                    "type": "assignment",
                    "title": f"Complete Modules in {enr.course.title}",
                    "course": "Ongoing",
                    "done": False,
                    "active": len(path) == 0,
                    "warning": False
                })

    # ─────────────────────────────────────────────────────────────
    # 1. DYNAMIC NEXT CLASS
    # ─────────────────────────────────────────────────────────────
    from models.live_session import LiveSession
    from models.academic import TimetableEvent

    pulse_next_class = None

    # Check for active live session in student's enrolled courses or tenant
    active_live = None
    if enrolled_course_ids:
        active_live = db.query(LiveSession).filter(
            LiveSession.status == "live",
            LiveSession.course_id.in_(enrolled_course_ids)
        ).first()

    if not active_live:
        active_live = db.query(LiveSession).filter(
            LiveSession.status == "live",
            LiveSession.tenant_id == (current_user.tenant_id or 1)
        ).first()

    if active_live:
        pulse_next_class = {
            "title": f"{active_live.course.title if active_live.course else active_live.title} · Live Now",
            "subtitle": "Live Class Active",
            "is_live": True,
            "link": f"/student/live/{active_live.course_id or ''}"
        }
    else:
        scheduled_live = None
        if enrolled_course_ids:
            scheduled_live = db.query(LiveSession).filter(
                LiveSession.status == "scheduled",
                LiveSession.course_id.in_(enrolled_course_ids),
                LiveSession.scheduled_at >= now_utc
            ).order_by(LiveSession.scheduled_at.asc()).first()

        if scheduled_live and scheduled_live.scheduled_at:
            time_str = scheduled_live.scheduled_at.strftime("%I:%M %p")
            pulse_next_class = {
                "title": f"{scheduled_live.title} · {time_str}",
                "subtitle": "Next Class",
                "is_live": False,
                "link": "/student/live"
            }
        else:
            day_name = now_utc.strftime("%A")
            tt_query = db.query(TimetableEvent).filter(
                TimetableEvent.tenant_id == (current_user.tenant_id or 1)
            )
            if current_user.cohort_id:
                tt_query = tt_query.filter(TimetableEvent.cohort_id == current_user.cohort_id)
            elif current_user.department_id:
                tt_query = tt_query.filter(TimetableEvent.department_id == current_user.department_id)
            elif enrolled_course_ids:
                tt_query = tt_query.filter(TimetableEvent.course_id.in_(enrolled_course_ids))

            tt_events = tt_query.all()
            today_events = [e for e in tt_events if e.day_of_week and e.day_of_week.lower() == day_name.lower()]
            selected_event = today_events[0] if today_events else (tt_events[0] if tt_events else None)

            if selected_event:
                start_str = selected_event.start_time.strftime("%I:%M %p") if selected_event.start_time else "Scheduled"
                title_str = selected_event.title or (selected_event.course.title if selected_event.course else "Lecture")
                pulse_next_class = {
                    "title": f"{title_str} · {start_str}",
                    "subtitle": "Next Class",
                    "is_live": False,
                    "link": "/student/academic"
                }
            elif enrollments and enrollments[0].course:
                pulse_next_class = {
                    "title": f"{enrollments[0].course.title} · Self-Paced",
                    "subtitle": "Next Class",
                    "is_live": False,
                    "link": f"/student/course/{enrollments[0].course_id}"
                }
            else:
                pulse_next_class = {
                    "title": "No Classes Scheduled Today",
                    "subtitle": "Next Class",
                    "is_live": False,
                    "link": "/student/explore"
                }

    # ─────────────────────────────────────────────────────────────
    # 2. DYNAMIC URGENT DEADLINE
    # ─────────────────────────────────────────────────────────────
    from models.assignment import Assignment, AssignmentSubmission
    from models.exam import Exam, ExamAttempt

    pulse_deadline = None

    if enrolled_course_ids:
        submitted_ids = db.query(AssignmentSubmission.assignment_id).filter(
            AssignmentSubmission.student_id == current_user.id
        ).scalar_subquery()

        pending_assignment = db.query(Assignment).filter(
            Assignment.course_id.in_(enrolled_course_ids),
            Assignment.is_published == True,
            ~Assignment.id.in_(submitted_ids)
        ).order_by(Assignment.due_date.asc().nullslast()).first()

        if pending_assignment:
            due_str = "Due Soon"
            if pending_assignment.due_date:
                p_due = pending_assignment.due_date
                if p_due.tzinfo is None:
                    p_due = p_due.replace(tzinfo=datetime.timezone.utc)
                diff = p_due - now_utc
                if diff.total_seconds() < 0:
                    due_str = "Overdue"
                elif diff.days == 0:
                    due_str = "Due Today"
                elif diff.days == 1:
                    due_str = "Due Tomorrow"
                else:
                    due_str = f"Due in {diff.days}d"

            pulse_deadline = {
                "title": f"{pending_assignment.title} · {due_str}",
                "subtitle": "Urgent Deadline",
                "type": "assignment",
                "is_urgent": True,
                "link": f"/student/course/{pending_assignment.course_id}"
            }
        else:
            attempted_exam_ids = db.query(ExamAttempt.exam_id).filter(
                ExamAttempt.student_id == current_user.id
            ).scalar_subquery()

            pending_exam = db.query(Exam).filter(
                Exam.course_id.in_(enrolled_course_ids),
                Exam.is_published == True,
                ~Exam.id.in_(attempted_exam_ids)
            ).order_by(Exam.due_date.asc().nullslast()).first()

            if pending_exam:
                pulse_deadline = {
                    "title": f"{pending_exam.title} · Assessment Active",
                    "subtitle": "Exam Assessment",
                    "type": "exam",
                    "is_urgent": True,
                    "link": f"/student/exam/{pending_exam.id}"
                }

    if not pulse_deadline:
        pulse_deadline = {
            "title": "All Caught Up · No Pending Dues",
            "subtitle": "Deadlines",
            "type": "none",
            "is_urgent": False,
            "link": "/student/course"
        }

    # ─────────────────────────────────────────────────────────────
    # 3. DYNAMIC ATTENDANCE WARNING / STANDING
    # ─────────────────────────────────────────────────────────────
    from models.academic import AttendanceRecord

    records = db.query(AttendanceRecord).filter(AttendanceRecord.student_id == current_user.id).all()
    pulse_attendance = None

    if records:
        stats_by_course = {}
        for r in records:
            if r.course_id not in stats_by_course:
                stats_by_course[r.course_id] = {
                    "course_id": r.course_id,
                    "course_name": r.course.title if r.course else f"Course #{r.course_id}",
                    "held": 0,
                    "present": 0
                }
            stats_by_course[r.course_id]["held"] += 1
            if r.status and r.status.lower() == "present":
                stats_by_course[r.course_id]["present"] += 1

        course_pcts = []
        for s in stats_by_course.values():
            pct = round((s["present"] / s["held"]) * 100, 1) if s["held"] > 0 else 100.0
            course_pcts.append({
                "course_name": s["course_name"],
                "percentage": pct
            })

        course_pcts.sort(key=lambda x: x["percentage"])
        lowest = course_pcts[0]

        if lowest["percentage"] < 75.0:
            pulse_attendance = {
                "title": f"{lowest['course_name']} · {lowest['percentage']}% (Danger)",
                "subtitle": "Attendance Warning",
                "severity": "danger",
                "link": "/student/academic"
            }
        elif lowest["percentage"] < 85.0:
            pulse_attendance = {
                "title": f"{lowest['course_name']} · {lowest['percentage']}% (Borderline)",
                "subtitle": "Attendance Alert",
                "severity": "warning",
                "link": "/student/academic"
            }
        else:
            pulse_attendance = {
                "title": f"{lowest['course_name']} · {lowest['percentage']}% (Good Standing)",
                "subtitle": "Attendance Standing",
                "severity": "good",
                "link": "/student/academic"
            }
    else:
        pulse_attendance = {
            "title": "All Classes · 100% (No Records Yet)",
            "subtitle": "Attendance Standing",
            "severity": "good",
            "link": "/student/academic"
        }

    return {
        "recentItems": recent_items[:3],
        "path": path[:5],
        "pulse": {
            "nextClass": pulse_next_class,
            "urgentDeadline": pulse_deadline,
            "attendance": pulse_attendance
        }
    }

@router.get("/study-buddies")
def get_study_buddies(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Mocking live buddy activity in the tenant
    return [
        {"name": "Alex M.", "action": "taking the DBMS Quiz", "time": "Just now"},
        {"name": "Sarah K.", "action": "studying OS Theory", "time": "5m ago"},
        {"name": "David L.", "action": "completed Advanced Python", "time": "12m ago"},
    ]

@router.get("/teacher-summary")
def get_teacher_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from sqlalchemy.sql import func
    
    # Get courses taught by this teacher
    teacher_courses = db.query(Course.id).filter(Course.teacher_id == current_user.id).subquery()
    
    # Aggregate data from Enrollments
    enrollments_query = db.query(Enrollment).filter(Enrollment.course_id.in_(teacher_courses))
    
    total_students = enrollments_query.count()
    
    avg_progress = db.query(func.avg(Enrollment.progress_percentage)).filter(Enrollment.course_id.in_(teacher_courses)).scalar() or 0
    avg_progress = round(avg_progress, 1)
    
    at_risk_count = enrollments_query.filter(Enrollment.progress_percentage < 40).count()
    
    return {
        "stats": [
            {"label": "Active Students", "value": str(total_students), "trend": "Real-time"},
            {"label": "Avg Progress", "value": f"{avg_progress}%", "trend": "Real-time"},
            {"label": "At-Risk Students", "value": str(at_risk_count), "trend": "Action Needed"},
            {"label": "Total Courses", "value": str(db.query(Course).filter(Course.teacher_id == current_user.id).count()), "trend": "Active"}
        ],
        "feedItems": [
            {"type": "alert", "title": "Dashboard Online", "desc": "Live monitoring initialized", "time": "Just now"}
        ],
        "batchSkills": [
            {"name": "React.js", "level": avg_progress},
            {"name": "Python Core", "level": max(0, avg_progress - 10)},
            {"name": "System Design", "level": max(0, avg_progress - 20)},
            {"name": "Machine Learning", "level": max(0, avg_progress - 30)}
        ]
    }

@router.get("/teacher-students")
def get_teacher_students(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Retrieve at-risk students for teacher
    teacher_courses = db.query(Course.id).filter(Course.teacher_id == current_user.id).subquery()
    enrollments = db.query(Enrollment).filter(
        Enrollment.course_id.in_(teacher_courses),
        Enrollment.progress_percentage < 50
    ).order_by(Enrollment.progress_percentage.asc()).limit(5).all()
    
    return [
        {
            "name": en.student.full_name if en.student else "Unknown",
            "course": en.course.title if en.course else "Unknown",
            "progress": en.progress_percentage
        } for en in enrollments
    ]
