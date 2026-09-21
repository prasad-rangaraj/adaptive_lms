from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime

from db.database import Base

class JobListing(Base):
    __tablename__ = "job_listings"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"))
    title = Column(String)
    company = Column(String)
    location = Column(String)
    type = Column(String)  # 'Full-time', 'Internship'
    stipend = Column(String)
    match_score = Column(Integer)  # AI computed match
    skills_required = Column(String)  # comma separated
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class JobApplication(Base):
    __tablename__ = "job_applications"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("job_listings.id"))
    student_id = Column(Integer, ForeignKey("users.id"))
    status = Column(String, default="Applied")  # 'Applied', 'Under Review', 'Interviewing', 'Rejected', 'Offered'
    applied_at = Column(DateTime, default=datetime.utcnow)

    job = relationship("JobListing")
    student = relationship("User")

class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String)
    issuer = Column(String)
    issued_date = Column(String)
    grade = Column(String, nullable=True)
    verified = Column(Boolean, default=False)
    image_url = Column(String, nullable=True)

    student = relationship("User")
