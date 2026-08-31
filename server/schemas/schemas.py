from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# --- Auth Schemas ---

class UserRegisterRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: str = "student"
    tenant_id: Optional[int] = None


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    role: str
    full_name: str
    tenant_id: Optional[int]


# --- User Profile Schemas ---

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    tenant_id: Optional[int]
    avatar_url: Optional[str]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# --- Tenant Schemas ---

class TenantCreateRequest(BaseModel):
    name: str
    subdomain: str
    plan: str = "basic"
    primary_color: str = "#6366F1"
    secondary_color: str = "#8B5CF6"


class TenantResponse(BaseModel):
    id: int
    name: str
    subdomain: str
    plan: str
    logo_url: Optional[str]
    primary_color: str
    secondary_color: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# --- Course Schemas ---

class CourseCreateRequest(BaseModel):
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    difficulty: str = "beginner"
    price: float = 0.0


class CourseResponse(BaseModel):
    id: int
    tenant_id: int
    title: str
    description: Optional[str]
    thumbnail_url: Optional[str]
    category: Optional[str]
    difficulty: str
    is_published: bool
    price: float
    created_at: datetime

    class Config:
        from_attributes = True


# --- AI Tutor Schemas ---

class AiTutorMessageRequest(BaseModel):
    course_id: int
    message: str


class AiTutorMessageResponse(BaseModel):
    answer: str
    sources: list[str] = []
    response_type: str = "explanation"  # explanation, quiz, flashcard, diagram_prompt


# --- Cognitive Profile Schemas ---

class CognitiveProfileResponse(BaseModel):
    id: int
    user_id: int
    focus_score: float
    learning_speed: float
    retention_score: float
    engagement_score: float
    weak_areas: list
    strength_areas: list
    learning_track: str
    last_assessed_at: Optional[datetime]

    class Config:
        from_attributes = True


# --- Assignment Schemas ---

class AssignmentEvaluationResponse(BaseModel):
    submission_id: int
    ai_score: float
    grammar_score: float
    plagiarism_score: float
    ai_generated_probability: float
    logic_score: float
    feedback: dict
    status: str


# --- Proctoring Schemas ---

class ProctoringViolationEvent(BaseModel):
    exam_attempt_id: int
    violation_type: str
    severity: str = "medium"
    description: Optional[str] = None
    screenshot_base64: Optional[str] = None
