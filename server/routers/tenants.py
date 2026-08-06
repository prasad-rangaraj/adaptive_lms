from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from core.database import get_db
from core.security import get_current_user, require_role
from models.tenant import Tenant
from models.user import User
from schemas.schemas import TenantCreateRequest, TenantResponse
from typing import List

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
