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
