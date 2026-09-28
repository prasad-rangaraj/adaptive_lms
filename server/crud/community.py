from sqlalchemy.orm import Session
from models.community import Bounty, LeaderboardEntry, Event
from models.cognitive_profile import CognitiveProfile
from models.user import User

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

def get_synapse_matches(db: Session, current_user_id: int, tenant_id: int):
    current_prof = db.query(CognitiveProfile).filter(CognitiveProfile.user_id == current_user_id).first()
    if not current_prof:
        return []
    
    current_weak = set(current_prof.weak_areas or [])
    
    other_profs = db.query(CognitiveProfile).join(User).filter(
        User.tenant_id == tenant_id,
        User.id != current_user_id
    ).all()
    
    matches = []
    for p in other_profs:
        other_strong = set(p.strength_areas or [])
        intersection = current_weak.intersection(other_strong)
        
        score = 65
        reason = "A solid partner with complementary skills."
        
        if intersection:
            score = min(99, 75 + (len(intersection) * 10))
            reason = f"Excels in your weak areas ({', '.join(intersection)})."
            
        matches.append({
            "id": p.user_id,
            "name": p.user.full_name,
            "score": score,
            "strong": p.strength_areas or ["General Studies"],
            "weak": p.weak_areas or ["TBD"],
            "reason": reason
        })
        
    matches.sort(key=lambda x: x["score"], reverse=True)
    return matches[:5]

def get_team_requests(db: Session, tenant_id: int):
    from models.community import TeamRequest
    requests = db.query(TeamRequest).filter(TeamRequest.tenant_id == tenant_id).all()
    return [
        {
            "id": r.id,
            "role": r.role,
            "project": r.project,
            "by": r.student.full_name if r.student else "Unknown",
            "deadline": r.deadline,
            "lookingFor": r.looking_for or []
        }
        for r in requests
    ]

def get_clubs(db: Session, tenant_id: int):
    from models.community import Club
    clubs = db.query(Club).filter(Club.tenant_id == tenant_id).all()
    return [
        {"name": c.name, "members": c.members_count, "active": c.is_active}
        for c in clubs
    ]

def get_alumni(db: Session, tenant_id: int):
    from models.community import Alumni
    alumni_list = db.query(Alumni).filter(Alumni.tenant_id == tenant_id).all()
    return [
        {
            "id": a.id,
            "name": a.name,
            "batch": a.batch,
            "company": a.company,
            "role": a.role,
            "offers": a.offers or []
        }
        for a in alumni_list
    ]
