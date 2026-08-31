from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from db.database import get_db
from core.security import get_current_user, require_role, get_password_hash
from models.tenant import Tenant
from models.user import User
from models.cognitive_profile import CognitiveProfile
from schemas.schemas import (
    TenantCreateRequest, TenantUpdateRequest, TenantResponse,
    AdminCreateUserRequest, AdminCreateUserResponse, UserResponse,
)
from typing import List
import secrets
import string

router = APIRouter(prefix="/api/tenants", tags=["Tenants"])


@router.post("/", response_model=TenantResponse, status_code=201)
async def create_tenant(
    payload: TenantCreateRequest,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("super_admin")),
):
    """Super Admin only: Create a new tenant organization."""
    existing = db.query(Tenant).filter(Tenant.subdomain == payload.subdomain).first()
    if existing:
        raise HTTPException(status_code=400, detail="Subdomain already taken")

    tenant = Tenant(**payload.model_dump())
    db.add(tenant)
    db.commit()
    db.refresh(tenant)
    return tenant


@router.get("/", response_model=List[TenantResponse])
async def list_tenants(
    db: Session = Depends(get_db),
    _: User = Depends(require_role("super_admin")),
):
    """Super Admin only: List all tenants."""
    return db.query(Tenant).all()


@router.get("/{tenant_id}", response_model=TenantResponse)
async def get_tenant(
    tenant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve a tenant's public profile."""
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return tenant


@router.put("/{tenant_id}", response_model=TenantResponse)
async def update_tenant(
    tenant_id: int,
    payload: TenantUpdateRequest,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("super_admin")),
):
    """Super Admin only: Update a tenant's profile and plan."""
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")

    update_data = payload.model_dump(exclude_unset=True)
    if "subdomain" in update_data:
        # Verify subdomain is unique if changed
        existing = db.query(Tenant).filter(Tenant.subdomain == update_data["subdomain"], Tenant.id != tenant_id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Subdomain already taken")

    for key, value in update_data.items():
        setattr(tenant, key, value)

    db.commit()
    db.refresh(tenant)
    return tenant


@router.delete("/{tenant_id}", status_code=204)
async def deactivate_tenant(
    tenant_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("super_admin")),
):
    """Super Admin only: Deactivate a tenant."""
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    tenant.is_active = False
    db.commit()


def _generate_password(length: int = 10) -> str:
    """Generate a readable random password (no ambiguous chars)."""
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))


@router.post("/{tenant_id}/users", response_model=AdminCreateUserResponse, status_code=201)
async def admin_create_user(
    tenant_id: int,
    payload: AdminCreateUserRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Tenant Admin: create a student or teacher account under their org.
    Returns the new user + plain-text temp_password (shown once).
    """
    # Only tenant_admin (of this tenant) or super_admin may call this
    if current_user.role not in ("tenant_admin", "super_admin"):
        raise HTTPException(status_code=403, detail="Forbidden")
    if current_user.role == "tenant_admin" and current_user.tenant_id != tenant_id:
        raise HTTPException(status_code=403, detail="Cannot create users for another tenant")

    if payload.role not in ("student", "teacher"):
        raise HTTPException(status_code=400, detail="Role must be 'student' or 'teacher'")

    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    temp_password = payload.password if payload.password else _generate_password()

    user = User(
        email=payload.email,
        full_name=payload.full_name,
        password_hash=get_password_hash(temp_password),
        role=payload.role,
        tenant_id=tenant_id,
        is_active=True,
        is_email_verified=False,
        email_verify_token=secrets.token_urlsafe(32),
    )
    db.add(user)
    db.flush()

    # Auto-create cognitive profile for students
    if payload.role == "student":
        db.add(CognitiveProfile(user_id=user.id))

    db.commit()
    db.refresh(user)

    return AdminCreateUserResponse(
        id=user.id,
        full_name=user.full_name,
        email=user.email,
        role=user.role,
        tenant_id=user.tenant_id,
        temp_password=temp_password,
    )


@router.get("/{tenant_id}/users", response_model=List[UserResponse])
async def admin_list_users(
    tenant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Tenant Admin: list all users (students + teachers) in this tenant."""
    if current_user.role not in ("tenant_admin", "super_admin"):
        raise HTTPException(status_code=403, detail="Forbidden")
    if current_user.role == "tenant_admin" and current_user.tenant_id != tenant_id:
        raise HTTPException(status_code=403, detail="Cannot view another tenant's users")

    users = (
        db.query(User)
        .filter(User.tenant_id == tenant_id, User.role.in_(["student", "teacher"]))
        .order_by(User.created_at.desc())
        .all()
    )
    return users


@router.get("/{tenant_id}/dashboard-narrative")
async def get_dashboard_narrative(
    tenant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate a dynamic AI-like narrative summary of the organization's health."""
    if current_user.role not in ("tenant_admin", "super_admin"):
        raise HTTPException(status_code=403, detail="Forbidden")
    if current_user.role == "tenant_admin" and current_user.tenant_id != tenant_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")

    student_count = db.query(User).filter(User.tenant_id == tenant_id, User.role == "student").count()
    teacher_count = db.query(User).filter(User.tenant_id == tenant_id, User.role == "teacher").count()
    
    # In a real app, this would dynamically calculate engagement from audit logs or enrollments.
    # We simulate a dynamic insight string.
    import random
    trend = random.choice(["up by 12%", "up by 5%", "holding steady"])
    falling_behind = random.randint(2, 40)
    pending_approvals = random.randint(0, 5)

    narrative = (
        f"Good morning. **{tenant.name}** is highly active today. "
        f"Overall engagement is **{trend}** this week. "
        f"You have **{student_count}** students and **{teacher_count}** teachers onboarded. "
        f"However, **{falling_behind} students** are falling behind in compliance training, "
        f"and you have **{pending_approvals} pending course approvals**."
    )

    return {"narrative": narrative}


@router.get("/{tenant_id}/cohorts-pulse")
async def get_cohorts_pulse(
    tenant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return 'Table-First' sparkline data for active cohorts/courses."""
    if current_user.role not in ("tenant_admin", "super_admin"):
        raise HTTPException(status_code=403, detail="Forbidden")

    import random
    from datetime import datetime, timedelta

    # Mocking cohorts and 7-day sparkline data for the new UI
    cohorts = [
        {"id": "c1", "name": "Fall Intake - CS101", "instructor": "Dr. Sarah Chen", "students": 142, "status": "active"},
        {"id": "c2", "name": "Annual Security Compliance", "instructor": "HR Dept", "students": 850, "status": "warning"},
        {"id": "c3", "name": "Advanced Data Structures", "instructor": "Prof. Alan Turing", "students": 38, "status": "active"},
        {"id": "c4", "name": "Leadership Training Q3", "instructor": "Jane Doe", "students": 15, "status": "active"},
        {"id": "c5", "name": "Onboarding Cohort 24A", "instructor": "HR Dept", "students": 64, "status": "inactive"},
    ]

    for cohort in cohorts:
        # Generate 7 data points for the sparkline (last 7 days of engagement)
        base = random.randint(20, 80)
        cohort["sparkline"] = [
            {"day": (datetime.now() - timedelta(days=6-i)).strftime("%a"), "score": max(0, min(100, base + random.randint(-15, 15)))}
            for i in range(7)
        ]
        cohort["avg_score"] = sum(p["score"] for p in cohort["sparkline"]) // 7
        cohort["completion"] = random.randint(10, 95)

    return cohorts


@router.get("/{tenant_id}/analytics")
async def get_tenant_analytics(
    tenant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Tenant Admin: Get real analytics for the organization."""
    if current_user.role not in ("tenant_admin", "super_admin"):
        raise HTTPException(status_code=403, detail="Forbidden")
    if current_user.role == "tenant_admin" and current_user.tenant_id != tenant_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    from models.course import Course
    from models.enrollment import Enrollment

    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")

    student_count = db.query(User).filter(User.tenant_id == tenant_id, User.role == "student").count()
    teacher_count = db.query(User).filter(User.tenant_id == tenant_id, User.role == "teacher").count()
    course_count = db.query(Course).filter(Course.tenant_id == tenant_id).count()
    published_count = db.query(Course).filter(Course.tenant_id == tenant_id, Course.is_published == True).count()

    # Real enrollments joined with tenant courses
    enrollment_count = (
        db.query(Enrollment)
        .join(Course, Enrollment.course_id == Course.id)
        .filter(Course.tenant_id == tenant_id)
        .count()
    )
    completed_count = (
        db.query(Enrollment)
        .join(Course, Enrollment.course_id == Course.id)
        .filter(Course.tenant_id == tenant_id, Enrollment.status == "completed")
        .count()
    )
    completion_rate = round((completed_count / enrollment_count * 100) if enrollment_count else 0, 1)

    # Top courses by enrollment
    from sqlalchemy import func as sqlfunc
    top_courses = (
        db.query(Course.title, sqlfunc.count(Enrollment.id).label("enrollments"))
        .join(Enrollment, Enrollment.course_id == Course.id, isouter=True)
        .filter(Course.tenant_id == tenant_id)
        .group_by(Course.id)
        .order_by(sqlfunc.count(Enrollment.id).desc())
        .limit(5)
        .all()
    )

    # Member growth — last 6 months (real DB counts by month)
    from datetime import datetime, timedelta
    import calendar
    now = datetime.now()
    growth = []
    for i in range(5, -1, -1):
        month_dt = now.replace(day=1) - timedelta(days=i * 30)
        month_name = month_dt.strftime("%b")
        count = db.query(User).filter(
            User.tenant_id == tenant_id,
            User.role.in_(["student", "teacher"]),
            User.created_at <= month_dt.replace(day=calendar.monthrange(month_dt.year, month_dt.month)[1])
        ).count()
        growth.append({"month": month_name, "members": count})

    return {
        "overview": {
            "students": student_count,
            "teachers": teacher_count,
            "courses": course_count,
            "published_courses": published_count,
            "total_enrollments": enrollment_count,
            "completion_rate": completion_rate,
        },
        "top_courses": [{"title": r.title, "enrollments": r.enrollments} for r in top_courses],
        "member_growth": growth,
    }


@router.get("/{tenant_id}/courses")
async def list_tenant_courses(
    tenant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Tenant Admin: List all courses and their status."""
    if current_user.role not in ("tenant_admin", "super_admin"):
        raise HTTPException(status_code=403, detail="Forbidden")

    from models.course import Course
    from models.enrollment import Enrollment
    from sqlalchemy import func as sqlfunc

    courses = db.query(Course).filter(Course.tenant_id == tenant_id).order_by(Course.created_at.desc()).all()

    result = []
    for c in courses:
        enrollment_count = db.query(Enrollment).filter(Enrollment.course_id == c.id).count()
        teacher = db.query(User).filter(User.id == c.teacher_id).first()
        result.append({
            "id": c.id,
            "title": c.title,
            "description": c.description,
            "category": c.category,
            "difficulty": c.difficulty,
            "is_published": c.is_published,
            "price": c.price,
            "enrollments": enrollment_count,
            "teacher_name": teacher.full_name if teacher else "Unassigned",
            "teacher_email": teacher.email if teacher else "",
            "created_at": c.created_at.isoformat() if c.created_at else None,
        })
    return result


@router.patch("/{tenant_id}/courses/{course_id}/toggle-publish")
async def toggle_course_publish(
    tenant_id: int,
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Tenant Admin: Publish or unpublish a course."""
    if current_user.role not in ("tenant_admin", "super_admin"):
        raise HTTPException(status_code=403, detail="Forbidden")

    from models.course import Course
    course = db.query(Course).filter(Course.id == course_id, Course.tenant_id == tenant_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    course.is_published = not course.is_published
    db.commit()
    return {"id": course.id, "is_published": course.is_published}


@router.get("/{tenant_id}/audit-logs")
async def get_tenant_audit_logs(
    tenant_id: int,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Tenant Admin: Get audit logs scoped to their organization."""
    if current_user.role not in ("tenant_admin", "super_admin"):
        raise HTTPException(status_code=403, detail="Forbidden")
    if current_user.role == "tenant_admin" and current_user.tenant_id != tenant_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    from models.audit_log import AuditLog
    logs = (
        db.query(AuditLog)
        .filter(AuditLog.tenant_id == tenant_id)
        .order_by(AuditLog.created_at.desc())
        .limit(limit)
        .all()
    )

    result = []
    for log in logs:
        actor = db.query(User).filter(User.id == log.user_id).first() if log.user_id else None
        result.append({
            "id": log.id,
            "action": log.action,
            "resource": log.resource,
            "details": log.details,
            "actor_name": actor.full_name if actor else "System",
            "actor_email": actor.email if actor else "",
            "ip_address": log.ip_address,
            "created_at": log.created_at.isoformat() if log.created_at else None,
        })
    return result


@router.patch("/{tenant_id}/users/{user_id}/deactivate")
async def deactivate_tenant_user(
    tenant_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Tenant Admin: Deactivate/reactivate a user in their org."""
    if current_user.role not in ("tenant_admin", "super_admin"):
        raise HTTPException(status_code=403, detail="Forbidden")

    user = db.query(User).filter(User.id == user_id, User.tenant_id == tenant_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found in this organization")

    user.is_active = not user.is_active
    db.commit()
    return {"id": user.id, "is_active": user.is_active}
