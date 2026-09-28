from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from db.database import get_db
from core.security import get_current_user
from models.user import User
from models.organization import TenantAISettings

router = APIRouter()

class AISettingsUpdate(BaseModel):
    tutor_active: Optional[bool] = None
    tutor_model: Optional[str] = None
    evaluator_active: Optional[bool] = None
    evaluator_model: Optional[str] = None
    generator_active: Optional[bool] = None
    generator_model: Optional[str] = None
    community_active: Optional[bool] = None
    community_model: Optional[str] = None
    pii_masking: Optional[bool] = None
    zero_retention: Optional[bool] = None
    strictness_threshold: Optional[int] = None
    system_prompt: Optional[str] = None

@router.get("/tenants/{tenant_id}/ai-settings")
def get_tenant_ai_settings(
    tenant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ("tenant_admin", "super_admin"):
        raise HTTPException(status_code=403, detail="Forbidden")
    if current_user.role == "tenant_admin" and current_user.tenant_id != tenant_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    settings = db.query(TenantAISettings).filter(TenantAISettings.tenant_id == tenant_id).first()
    if not settings:
        # Create default settings
        settings = TenantAISettings(tenant_id=tenant_id)
        db.add(settings)
        db.commit()
        db.refresh(settings)

    return settings

@router.patch("/tenants/{tenant_id}/ai-settings")
def update_tenant_ai_settings(
    tenant_id: int,
    payload: AISettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ("tenant_admin", "super_admin"):
        raise HTTPException(status_code=403, detail="Forbidden")
    if current_user.role == "tenant_admin" and current_user.tenant_id != tenant_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    settings = db.query(TenantAISettings).filter(TenantAISettings.tenant_id == tenant_id).first()
    if not settings:
        settings = TenantAISettings(tenant_id=tenant_id)
        db.add(settings)

    update_data = payload.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(settings, key, value)

    db.commit()
    db.refresh(settings)
    return settings
