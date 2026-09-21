from sqlalchemy.orm import Session
from models.community import Bounty, LeaderboardEntry, Event

def get_bounties(db: Session, tenant_id: int):
    bounties = db.query(Bounty).filter(Bounty.tenant_id == tenant_id).order_by(Bounty.created_at.desc()).all()
    # Populate author name
    for b in bounties:
        if b.author:
            b.author_name = b.author.full_name
    return bounties

def get_leaderboard(db: Session, tenant_id: int):
    entries = db.query(LeaderboardEntry).filter(LeaderboardEntry.tenant_id == tenant_id).order_by(LeaderboardEntry.reputation.desc()).limit(10).all()
    for e in entries:
        if e.student:
            e.student_name = e.student.full_name
    return entries

def get_events(db: Session, tenant_id: int):
    return db.query(Event).filter(Event.tenant_id == tenant_id).order_by(Event.created_at.desc()).all()
