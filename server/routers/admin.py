from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from core.database import get_db
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
