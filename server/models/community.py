from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime

from db.database import Base

class Bounty(Base):
    __tablename__ = "bounties"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"))
    author_id = Column(Integer, ForeignKey("users.id"))
    subject = Column(String)
    title = Column(String)
    body = Column(Text)
    reward_amount = Column(Integer)
    tags = Column(String) # comma separated
    is_solved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    author = relationship("User")

class LeaderboardEntry(Base):
    __tablename__ = "leaderboard_entries"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"))
    student_id = Column(Integer, ForeignKey("users.id"))
    reputation = Column(Integer, default=0)
    badge = Column(String)
    
    student = relationship("User")

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"))
    title = Column(String)
    organization = Column(String)
    date = Column(String)
    time = Column(String)
    venue = Column(String)
    type = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"))
    receiver_id = Column(Integer, ForeignKey("users.id"))
    content = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    read_at = Column(DateTime, nullable=True)

    sender = relationship("User", foreign_keys=[sender_id])
    receiver = relationship("User", foreign_keys=[receiver_id])

class Mentorship(Base):
    __tablename__ = "mentorships"

    id = Column(Integer, primary_key=True, index=True)
    mentor_id = Column(Integer, ForeignKey("users.id"))
    mentee_id = Column(Integer, ForeignKey("users.id"))
    status = Column(String, default="active") # active, completed
    focus_area = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    mentor = relationship("User", foreign_keys=[mentor_id])
    mentee = relationship("User", foreign_keys=[mentee_id])

class OfficeHourBooking(Base):
    __tablename__ = "office_hour_bookings"

    id = Column(Integer, primary_key=True, index=True)
    teacher_id = Column(Integer, ForeignKey("users.id"))
    student_id = Column(Integer, ForeignKey("users.id"))
    topic = Column(String)
    date = Column(String)
    time = Column(String)
    status = Column(String, default="upcoming") # upcoming, completed, cancelled
    created_at = Column(DateTime, default=datetime.utcnow)

    teacher = relationship("User", foreign_keys=[teacher_id])
    student = relationship("User", foreign_keys=[student_id])

class TeamRequest(Base):
    __tablename__ = "team_requests"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"))
    student_id = Column(Integer, ForeignKey("users.id"))
    
    role = Column(String)  # e.g. 'Frontend', 'ML Engineer'
    project = Column(String)
    deadline = Column(String)
    looking_for = Column(JSON)  # e.g. ["React", "UI/UX"]
    
    student = relationship("User")


class Club(Base):
    __tablename__ = "clubs"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"))
    
    name = Column(String, nullable=False)
    members_count = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)


class Alumni(Base):
    __tablename__ = "alumni"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True) # Optional link to user table
    
    name = Column(String, nullable=False)
    batch = Column(String)
    company = Column(String)
    role = Column(String)
    offers = Column(JSON)  # e.g. ["Mentorship", "Referrals"]
    
    user = relationship("User")
