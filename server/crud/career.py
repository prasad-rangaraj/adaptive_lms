from sqlalchemy.orm import Session
from models.career import JobListing, JobApplication, Certificate

def get_jobs(db: Session, tenant_id: int):
    jobs = db.query(JobListing).filter(JobListing.tenant_id == tenant_id, JobListing.is_active == True).all()
    return [
        {
            "id": j.id,
            "match": j.match_score or 85,
            "title": j.title,
            "company": j.company,
            "type": j.type,
            "skills": [s.strip() for s in j.skills_required.split(",")] if j.skills_required else [],
            "aiReady": True
        }
        for j in jobs
    ]

def get_student_applications(db: Session, student_id: int):
    apps = db.query(JobApplication).filter(JobApplication.student_id == student_id).all()
    return [
        {
            "id": a.id,
            "role": a.job.title if a.job else "Unknown Role",
            "status": a.status,
            "company": a.job.company if a.job else "Unknown Company",
            "date": a.applied_at.strftime("%b %d, %Y") if a.applied_at else "Recently"
        }
        for a in apps
    ]

def get_student_certificates(db: Session, student_id: int):
    certs = db.query(Certificate).filter(Certificate.student_id == student_id).all()
    return [
        {
            "id": c.id,
            "title": c.title,
            "grade": c.grade,
            "issued": c.issued_date or (c.created_at.strftime("%b %Y") if hasattr(c, "created_at") else "2024"),
            "verified": c.verified
        }
        for c in certs
    ]
