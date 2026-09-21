from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Date, Time, Text
from sqlalchemy.orm import relationship
from datetime import datetime

from db.database import Base

class TimetableEvent(Base):
    __tablename__ = "timetable_events"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"))
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=True)
    
    title = Column(String)  # If it's not a direct course mapping
    day_of_week = Column(String)  # 'Monday', 'Tuesday', etc.
    start_time = Column(Time)
    end_time = Column(Time)
    type = Column(String)  # 'Theory', 'Lab', 'Seminar'
    venue = Column(String)
    
    faculty_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    faculty_name = Column(String, nullable=True)  # Fallback if no user linked

    # Relationships
    course = relationship("Course")
    faculty = relationship("User")


class AttendanceRecord(Base):
    __tablename__ = "attendance_records"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    course_id = Column(Integer, ForeignKey("courses.id"))
    date = Column(Date)
    status = Column(String)  # 'Present', 'Absent', 'Late', 'Excused'
    
    # Relationships
    student = relationship("User", foreign_keys=[student_id])
    course = relationship("Course")


class LeaveRequest(Base):
    __tablename__ = "leave_requests"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    start_date = Column(Date)
    end_date = Column(Date)
    type = Column(String)  # 'Medical', 'On-Duty', 'Personal'
    reason = Column(Text)
    status = Column(String, default="Pending")  # 'Pending', 'Approved', 'Rejected'
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    student = relationship("User")
