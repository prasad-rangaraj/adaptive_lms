from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from db.database import get_db
from core.security import get_current_user
from models.user import User
import crud.community as crud_community
import schemas.schemas as schemas

class MessageCreateRequest(BaseModel):
    receiver_id: int
    content: str

class OfficeHourBookingRequest(BaseModel):
    teacher_id: int
    topic: str
    date: str
    time: str

class MentorshipRequest(BaseModel):
    alumni_id: int
    topic: str
    message: str

class BountyCreateRequest(BaseModel):
    subject: str
    title: str
    body: str
    reward_amount: Optional[int] = 50
    tags: Optional[str] = ""

router = APIRouter()

@router.get("/bounties")
def get_bounties(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.tenant_id:
        return []
    return crud_community.get_bounties(db, current_user.tenant_id)

@router.get("/leaderboard")
def get_leaderboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.tenant_id:
        return []
    return crud_community.get_leaderboard(db, current_user.tenant_id)

@router.get("/events")
def get_events(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.tenant_id:
        return []
    return crud_community.get_events(db, current_user.tenant_id)

@router.get("/synapse-matches")
def get_synapse_matches(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.tenant_id:
        return []
    return crud_community.get_synapse_matches(db, current_user.id, current_user.tenant_id)

@router.get("/team-requests")
def get_team_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return crud_community.get_team_requests(db, current_user.tenant_id) if current_user.tenant_id else []

@router.get("/clubs")
def get_clubs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return crud_community.get_clubs(db, current_user.tenant_id) if current_user.tenant_id else []

@router.get("/alumni")
def get_alumni(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return crud_community.get_alumni(db, current_user.tenant_id) if current_user.tenant_id else []

@router.get("/teacher/inbox")
def get_teacher_inbox(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from models.community import Message
    messages = db.query(Message).filter(Message.receiver_id == current_user.id).order_by(Message.created_at.desc()).limit(20).all()
    return [
        {
            "id": m.id,
            "sender_id": m.sender_id,
            "sender": m.sender.full_name if m.sender else "Unknown",
            "course": "Direct Message",
            "subject": m.content[:30] + "..." if len(m.content) > 30 else m.content,
            "content": m.content,
            "time": m.created_at.strftime("%b %d, %H:%M"),
            "unread": m.read_at is None
        } for m in messages
    ]

@router.get("/teacher/office-hours")
def get_teacher_office_hours(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Mocking for MVP since OfficeHourBooking model isn't built yet
    return [
        {
            "id": 1,
            "student": "Alex M.",
            "topic": "Assignment 2 Help",
            "time": "2026-10-10 14:00",
            "status": "Scheduled"
        },
        {
            "id": 2,
            "student": "Sarah K.",
            "topic": "Project Guidance",
            "time": "2026-10-10 14:30",
            "status": "Scheduled"
        }
    ]

@router.get("/teacher/bounties")
def get_teacher_bounties(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from models.community import Bounty
    bounties = db.query(Bounty).filter(Bounty.tenant_id == current_user.tenant_id).order_by(Bounty.created_at.desc()).limit(10).all()
    return [
        {
            "id": b.id,
            "title": b.title,
            "student": b.author.full_name if b.author else "Unknown",
            "bounty": b.reward_amount,
            "tags": [tag.strip() for tag in b.tags.split(",")] if b.tags else [],
            "answers": 0,
            "status": 'Needs Endorsement' if not b.is_solved else 'Solved'
        } for b in bounties
    ]

@router.get("/teacher/mentees")
def get_teacher_mentees(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from models.community import Mentorship
    mentorships = db.query(Mentorship).filter(Mentorship.mentor_id == current_user.id).all()
    return [
        {
            "id": m.id,
            "name": m.mentee.full_name if m.mentee else "Unknown",
            "goal": m.focus_area or "General Mentorship",
            "progress": 50,
            "nextMeeting": "Unscheduled",
            "status": m.status.lower()
        } for m in mentorships
    ]

@router.put("/teacher/mentees/{mentorship_id}/accept")
def accept_mentorship(
    mentorship_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from models.community import Mentorship
    m = db.query(Mentorship).filter(Mentorship.id == mentorship_id).first()
    if m:
        m.status = "active"
        db.commit()
    return {"status": "success"}

@router.get("/message-recipients")
def get_message_recipients(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from models.user import User as UserModel
    query = db.query(UserModel).filter(UserModel.tenant_id == current_user.tenant_id, UserModel.id != current_user.id)
    if current_user.role == "student":
        query = query.filter(UserModel.role.in_(["teacher", "admin", "super_admin", "tenant_admin"]))
    users = query.all()
    return [{"id": u.id, "name": u.full_name, "role": u.role} for u in users]

@router.post("/messages")
def send_message(
    payload: MessageCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from models.community import Message
    msg = Message(sender_id=current_user.id, receiver_id=payload.receiver_id, content=payload.content)
    db.add(msg)
    db.commit()
    return {"status": "success"}

@router.get("/chat/messages")
def get_chat_messages(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from models.community import Message
    from sqlalchemy import or_
    messages = db.query(Message).filter(
        or_(Message.sender_id == current_user.id, Message.receiver_id == current_user.id)
    ).order_by(Message.created_at.asc()).all()
    
    return [
        {
            "id": m.id,
            "sender_id": m.sender_id,
            "receiver_id": m.receiver_id,
            "content": m.content,
            "timestamp": m.created_at.isoformat() + "Z" if m.created_at else None
        } for m in messages
    ]

@router.post("/office-hours/book")
def book_office_hour(
    payload: OfficeHourBookingRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Mocking booking success for MVP since model doesn't exist yet
    return {"status": "success"}

@router.post("/mentorships/request")
def request_mentorship(
    payload: MentorshipRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from models.community import Mentorship
    m = Mentorship(
        mentor_id=payload.alumni_id,
        mentee_id=current_user.id,
        focus_area=payload.topic,
        status="Pending"
    )
    db.add(m)
    db.commit()
    return {"status": "success"}

@router.post("/bounties")
def create_bounty(
    payload: BountyCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from models.community import Bounty
    tenant_id = current_user.tenant_id or 1
    b = Bounty(
        tenant_id=tenant_id,
        author_id=current_user.id,
        subject=payload.subject,
        title=payload.title,
        body=payload.body,
        reward_amount=payload.reward_amount or 50,
        tags=payload.tags or payload.subject
    )
    db.add(b)
    db.commit()
    db.refresh(b)
    return {"status": "success", "id": b.id}

@router.post("/bounties/{bounty_id}/endorse")
def endorse_bounty(
    bounty_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from models.community import Bounty
    bounty = db.query(Bounty).filter(Bounty.id == bounty_id).first()
    if bounty:
        bounty.is_solved = True
        db.commit()
    return {"status": "success"}
