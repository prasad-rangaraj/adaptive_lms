from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Date, Time, Text
from sqlalchemy.orm import relationship
from datetime import datetime

from db.database import Base

class Department(Base):
    __tablename__ = "departments"
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"))
    name = Column(String, nullable=False)
    code = Column(String, nullable=False)
    
    tenant = relationship("Tenant")
    cohorts = relationship("Cohort", back_populates="department")

class Cohort(Base):
    __tablename__ = "cohorts"
    id = Column(Integer, primary_key=True, index=True)
    department_id = Column(Integer, ForeignKey("departments.id"))
    name = Column(String, nullable=False)  # e.g., "Year 1 - Sec A"
    
    department = relationship("Department", back_populates="cohorts")

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
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    cohort_id = Column(Integer, ForeignKey("cohorts.id"), nullable=True)

    # Relationships
    course = relationship("Course")
    faculty = relationship("User")
    department = relationship("Department")
    cohort = relationship("Cohort")


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


class StudentMark(Base):
    __tablename__ = "student_marks"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    course_id = Column(Integer, ForeignKey("courses.id"))
    assessment_type = Column(String)  # 'Internal', 'Midterm', 'Final', 'Assignment'
    marks_obtained = Column(Integer)
    total_marks = Column(Integer)
    credits = Column(Integer, default=3)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    student = relationship("User", foreign_keys=[student_id])
    course = relationship("Course")


class AcademicResource(Base):
    __tablename__ = "academic_resources"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"))
    course_id = Column(Integer, ForeignKey("courses.id"))
    title = Column(String)
    resource_type = Column(String) # 'PYQ', 'Notes', 'Syllabus'
    file_url = Column(String)
    file_size = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    course = relationship("Course")
