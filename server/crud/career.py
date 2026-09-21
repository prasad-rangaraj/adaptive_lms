from sqlalchemy.orm import Session
from models.career import JobListing, JobApplication, Certificate

def get_jobs(db: Session, tenant_id: int):
    return db.query(JobListing).filter(JobListing.tenant_id == tenant_id, JobListing.is_active == True).all()

def get_student_applications(db: Session, student_id: int):
    return db.query(JobApplication).filter(JobApplication.student_id == student_id).all()

def get_student_certificates(db: Session, student_id: int):
    return db.query(Certificate).filter(Certificate.student_id == student_id).all()
