from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
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
