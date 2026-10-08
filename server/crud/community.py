from sqlalchemy.orm import Session
from models.community import Bounty, LeaderboardEntry, Event
from models.cognitive_profile import CognitiveProfile
from models.user import User

def get_bounties(db: Session, tenant_id: int):
    bounties = db.query(Bounty).filter(Bounty.tenant_id == tenant_id).order_by(Bounty.created_at.desc()).all()
    results = []
    for b in bounties:
        author_name = b.author.full_name if b.author else "Unknown"
        tag_list = [t.strip() for t in b.tags.split(",")] if b.tags else []
        results.append({
            "id": b.id,
            "avatar": author_name[0].upper(),
            "solved": b.is_solved,
            "subject": tag_list[0] if tag_list else "General",
            "bounty": b.reward_amount,
            "title": b.title,
            "body": b.body,
            "author": author_name,
            "time": b.created_at.strftime("%b %d") if b.created_at else "Now",
            "replies": len(b.replies) if hasattr(b, 'replies') else 0
        })
    return results

def get_leaderboard(db: Session, tenant_id: int):
    entries = db.query(LeaderboardEntry).filter(LeaderboardEntry.tenant_id == tenant_id).order_by(LeaderboardEntry.reputation.desc()).limit(10).all()
    results = []
    colors = ["#f59e0b", "#94a3b8", "#b45309", "#8b5cf6", "#3b82f6", "#10b981", "#ef4444", "#06b6d4", "#f43f5e", "#84cc16"]
    for i, e in enumerate(entries):
        name = e.student.full_name if e.student else "Unknown"
        results.append({
            "rank": i + 1,
            "color": colors[i % len(colors)],
            "avatar": name[0].upper(),
            "name": name,
            "badge": e.badge or "Contributor",
            "rep": e.reputation
        })
    return results

def get_events(db: Session, tenant_id: int):
    events = db.query(Event).filter(Event.tenant_id == tenant_id).order_by(Event.created_at.desc()).all()
    results = []
    for e in events:
        results.append({
            "id": e.id,
            "date": e.date or "Jan 1, 2024",
            "type": e.type or "Event",
            "title": e.title,
            "org": e.organization or "University",
            "time": e.time or "TBA",
            "venue": e.venue or "Campus",
            "rsvp": False
        })
    return results

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
