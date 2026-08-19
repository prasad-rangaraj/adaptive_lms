from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from db.database import get_db
from core.security import require_role
from models.user import User
from models.course import Course
from schemas.schemas import UserResponse, CourseResponse

router = APIRouter(prefix="/api/admin", tags=["Super Admin"])

@router.get("/users/global", response_model=List[UserResponse])
async def get_all_users(
    db: Session = Depends(get_db),
    _: User = Depends(require_role("super_admin")),
):
    """Super Admin only: Fetch all users across all tenants."""
    return db.query(User).order_by(User.created_at.desc()).all()


@router.get("/courses/global", response_model=List[CourseResponse])
async def get_all_courses(
    db: Session = Depends(get_db),
    _: User = Depends(require_role("super_admin")),
):
    """Super Admin only: Fetch all courses across all tenants."""
    return db.query(Course).order_by(Course.created_at.desc()).all()


from models.audit_log import AuditLog
from schemas.schemas import AuditLogResponse

@router.get("/audit-logs", response_model=List[AuditLogResponse])
async def get_audit_logs(
    limit: int = 50,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("super_admin")),
):
    """Super Admin only: Fetch the global audit logs."""
    return db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit).all()


@router.get("/billing")
async def get_billing_stats(
    db: Session = Depends(get_db),
    _: User = Depends(require_role("super_admin")),
):
    """Super Admin only: Aggregate billing data across tenants."""
    from models.tenant import Tenant
    tenants = db.query(Tenant).all()
    
    plan_counts = {"basic": 0, "pro": 0, "enterprise": 0}
    for t in tenants:
        if t.plan in plan_counts:
            plan_counts[t.plan] += 1
            
    # Mock MRR Calculation
    mrr = (plan_counts["basic"] * 0) + (plan_counts["pro"] * 299) + (plan_counts["enterprise"] * 999)
    
    return {
        "mrr": mrr,
        "active_tenants": len([t for t in tenants if t.is_active]),
        "suspended_tenants": len([t for t in tenants if not t.is_active]),
        "plan_distribution": plan_counts
    }


@router.get("/stats")
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    _: User = Depends(require_role("super_admin")),
):
    """Super Admin only: Overall dashboard stats."""
    from models.tenant import Tenant
    tenants = db.query(Tenant).all()
    users_count = db.query(User).count()
    courses_count = db.query(Course).count()
    
    plan_counts = {"basic": 0, "pro": 0, "enterprise": 0}
    for t in tenants:
        if t.plan in plan_counts:
            plan_counts[t.plan] += 1
            
    mrr = (plan_counts["basic"] * 0) + (plan_counts["pro"] * 299) + (plan_counts["enterprise"] * 999)
    
    return {
        "mrr": mrr,
        "total_tenants": len(tenants),
        "total_users": users_count,
        "total_courses": courses_count,
        "active_tenants": len([t for t in tenants if t.is_active]),
    }


import random
from datetime import datetime
import time

@router.get("/health")
async def get_system_health(
    _: User = Depends(require_role("super_admin")),
):
    """Mock health data for Super Admin."""
    db_latency = random.randint(5, 45)
    
    return {
        "services": [
            { "name": 'Authentication API',       "status": 'healthy',  "latency": random.randint(20, 60),   "uptime": 99.99 },
            { "name": 'AI Tutor Engine',          "status": 'healthy',  "latency": random.randint(200, 400), "uptime": 99.87 },
            { "name": 'Exam Proctor Service',     "status": 'healthy',  "latency": random.randint(100, 200), "uptime": 99.9  },
            { "name": 'Database (PostgreSQL)',    "status": 'healthy',  "latency": db_latency,               "uptime": 99.99 },
            { "name": 'File Storage (S3)',        "status": 'healthy',  "latency": random.randint(40, 80),   "uptime": 100   },
            { "name": 'Email / Notification Bus', "status": 'healthy',  "latency": random.randint(150, 250), "uptime": 99.92 },
        ],
        "metrics": {
            "avg_response_time": f"{random.randint(100, 150)}ms",
            "requests_per_min": f"{random.uniform(3.0, 4.0):.1f}K",
            "error_rate": "0.04%",
            "active_connections": random.randint(800, 900)
        }
    }


@router.get("/tickets")
async def get_support_tickets(
    _: User = Depends(require_role("super_admin")),
):
    """Mock support tickets."""
    def get_iso(hours_ago):
        return datetime.fromtimestamp(time.time() - hours_ago * 3600).isoformat() + "Z"
        
    return [
      { "id": 'TK-001', "subject": 'AI Tutor not responding to student queries', "priority": 'critical', "status": 'open',        "org": 'Sunrise University', "orgId": 1, "createdAt": get_iso(2),  "replies": 0, "category": 'AI Feature' },
      { "id": 'TK-002', "subject": 'Unable to export course completion reports', "priority": 'high',     "status": 'in_progress', "org": 'Metro Academy',      "orgId": 2, "createdAt": get_iso(8),  "replies": 2, "category": 'Reporting' },
      { "id": 'TK-003', "subject": 'Request to upgrade plan from Pro to Enterprise', "priority": 'medium', "status": 'open',     "org": 'Tech Institute',     "orgId": 3, "createdAt": get_iso(24),      "replies": 1, "category": 'Billing' },
      { "id": 'TK-004', "subject": 'Student login issues after password reset', "priority": 'high',      "status": 'in_progress', "org": 'Global Learning Co', "orgId": 4, "createdAt": get_iso(48), "replies": 3, "category": 'Auth' },
      { "id": 'TK-005', "subject": 'Proctoring camera not activating on Safari',  "priority": 'medium', "status": 'open',        "org": 'Sunrise University', "orgId": 1, "createdAt": get_iso(72), "replies": 0, "category": 'Proctor' },
      { "id": 'TK-006', "subject": 'Custom branding colors not applying',          "priority": 'low',    "status": 'resolved',    "org": 'Metro Academy',      "orgId": 2, "createdAt": get_iso(120), "replies": 4, "category": 'Branding' },
    ]


@router.post("/users/{user_id}/suspend")
async def suspend_user(
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("super_admin")),
):
    """Super Admin only: Toggle user active status (suspend/unsuspend)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Toggle active status
    user.is_active = not user.is_active
    db.commit()
    
    return {"message": "User status updated", "is_active": user.is_active}
