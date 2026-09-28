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
    # This is an aggregate endpoint for the student dashboard.
    enrollments = db.query(Enrollment).filter(Enrollment.student_id == current_user.id).all()
    
    # We will build recent_items and path (urgent items) from enrollments and courses
    recent_items = []
    path = []
    
    for enr in enrollments:
        if enr.course:
            recent_items.append({
                "id": enr.course.id,
                "type": "video",  # mock for now since material progress tracking isn't fully implemented
                "title": f"Continue: {enr.course.title}",
                "course": enr.course.title,
                "progress": enr.progress_percentage or 0,
                "timeleft": "Active",
                "img": enr.course.thumbnail_url,
                "color": "#4f46e5"
            })
            
            # If progress < 100, put it in path
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

    return {
        "recentItems": recent_items[:3],
        "path": path[:5]
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
