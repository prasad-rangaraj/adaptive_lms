import os
import sys

# Ensure the server directory is in the path
sys.path.append(r'c:\projects\adaptive_lms\server')

from db.database import SessionLocal
from models.career import JobListing, JobApplication, Certificate
from models.user import User

def run():
    db = SessionLocal()
    
    # Check if there are any jobs
    if db.query(JobListing).count() == 0:
        print("Seeding JobListings...")
        # Get first tenant
        student = db.query(User).filter(User.role == 'student').first()
        tenant_id = student.tenant_id if student else 1
        
        j1 = JobListing(
            tenant_id=tenant_id,
            title="Backend Engineer",
            company="Tech Innovators Inc",
            type="Full-Time",
            match_score=95,
            skills_required="Python, FastAPI, PostgreSQL",
            is_active=True
        )
        j2 = JobListing(
            tenant_id=tenant_id,
            title="Frontend Developer",
            company="Creative Web Solutions",
            type="Internship",
            match_score=82,
            skills_required="React, JavaScript, CSS",
            is_active=True
        )
        j3 = JobListing(
            tenant_id=tenant_id,
            title="Data Analyst",
            company="DataCorp",
            type="Part-Time",
            match_score=75,
            skills_required="SQL, Python, Data Visualization",
            is_active=True
        )
        db.add_all([j1, j2, j3])
        db.commit()
    
    if db.query(JobApplication).count() == 0:
        print("Seeding JobApplications...")
        student = db.query(User).filter(User.role == 'student').first()
        job = db.query(JobListing).first()
        if student and job:
            app1 = JobApplication(
                student_id=student.id,
                job_id=job.id,
                status="Interviewing"
            )
            app2 = JobApplication(
                student_id=student.id,
                job_id=db.query(JobListing).offset(1).first().id,
                status="Under Review"
            )
            db.add_all([app1, app2])
            db.commit()

    if db.query(Certificate).count() == 0:
        print("Seeding Certificates...")
        student = db.query(User).filter(User.role == 'student').first()
        if student:
            c1 = Certificate(
                student_id=student.id,
                title="Advanced Data Structures",
                grade="A+",
                verified=True
            )
            c2 = Certificate(
                student_id=student.id,
                title="React & Node.js Masterclass",
                grade="B",
                verified=True
            )
            c3 = Certificate(
                student_id=student.id,
                title="System Design Fundamentals",
                grade=None,
                verified=False
            )
            db.add_all([c1, c2, c3])
            db.commit()

    print("Career data seeding complete!")

if __name__ == '__main__':
    from dotenv import load_dotenv
    load_dotenv()
    run()
