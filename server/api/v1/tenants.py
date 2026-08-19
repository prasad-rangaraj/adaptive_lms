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

