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
            "sender": m.sender.full_name if m.sender else "Unknown",
            "course": "Direct Message",
            "subject": m.content[:30] + "..." if len(m.content) > 30 else m.content,
            "time": m.created_at.strftime("%b %d, %H:%M"),
            "unread": m.read_at is None
        } for m in messages
    ]

@router.get("/teacher/office-hours")
def get_teacher_office_hours(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from models.community import OfficeHourBooking
    bookings = db.query(OfficeHourBooking).filter(OfficeHourBooking.teacher_id == current_user.id).all()
    return [
        {
            "id": b.id,
            "student": b.student.full_name if b.student else "Unknown",
            "topic": b.topic,
            "time": f"{b.date} {b.time}",
            "status": b.status
        } for b in bookings
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
            "progress": 50, # mock progress
            "nextMeeting": "Unscheduled"
        } for m in mentorships
    ]

@router.post("/messages")
def send_message(
    payload: schemas.MessageCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from models.community import Message
    msg = Message(sender_id=current_user.id, receiver_id=payload.receiver_id, content=payload.content)
    db.add(msg)
    db.commit()
    return {"status": "success"}

@router.post("/office-hours/book")
def book_office_hour(
    payload: schemas.OfficeHourBookingRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from models.community import OfficeHourBooking
    booking = OfficeHourBooking(
        teacher_id=payload.teacher_id,
        student_id=current_user.id,
        topic=payload.topic,
        date=payload.date,
        time=payload.time,
        status="Scheduled"
    )
    db.add(booking)
    db.commit()
    return {"status": "success"}

@router.post("/mentorships/request")
def request_mentorship(
    payload: schemas.MentorshipRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from models.community import Mentorship
    m = Mentorship(
        mentor_id=payload.mentor_id,
        mentee_id=current_user.id,
        focus_area=payload.focus_area,
        status="Pending"
    )
    db.add(m)
    db.commit()
    return {"status": "success"}

@router.post("/bounties")
def create_bounty(
    payload: schemas.BountyCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from models.community import Bounty
    b = Bounty(
        tenant_id=current_user.tenant_id,
        author_id=current_user.id,
        subject=payload.subject,
        title=payload.title,
        body=payload.body,
        reward_amount=payload.reward_amount,
        tags=payload.tags
    )
    db.add(b)
    db.commit()
    return {"status": "success"}

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
