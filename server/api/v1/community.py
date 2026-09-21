from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from db.database import get_db
from core.security import get_current_user
from models.user import User
import crud.community as crud_community
import schemas.schemas as schemas

router = APIRouter()

@router.get("/bounties", response_model=List[schemas.BountyResponse])
def get_bounties(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.tenant_id:
        return []
    return crud_community.get_bounties(db, current_user.tenant_id)

@router.get("/leaderboard", response_model=List[schemas.LeaderboardEntryResponse])
def get_leaderboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.tenant_id:
        return []
    return crud_community.get_leaderboard(db, current_user.tenant_id)

@router.get("/events", response_model=List[schemas.EventResponse])
def get_events(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.tenant_id:
        return []
    return crud_community.get_events(db, current_user.tenant_id)
