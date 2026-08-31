from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.database import get_db
from core.security import get_current_user
from models.user import User
from models.cognitive_profile import CognitiveProfile
from services.ai_cognitive import evaluate_performance

router = APIRouter(prefix="/api/cognitive", tags=["Cognitive Analytics"])

@router.get("/me")
async def get_my_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Fetch the current user's cognitive profile. Creates a baseline if none exists."""
    profile = db.query(CognitiveProfile).filter(CognitiveProfile.user_id == current_user.id).first()
    
    if not profile:
        profile = CognitiveProfile(
            user_id=current_user.id,
            focus_score=50.0,
            learning_speed=50.0,
            retention_score=50.0,
            confidence_score=50.0,
            engagement_score=50.0,
            consistency_score=50.0,
            motivation_score=50.0,
            risk_score=50.0,
            weak_areas=[],
            strength_areas=[],
            learning_track="standard"
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)

    return {
        "profile": profile,
        # Provide some default recommendations if none are stored dynamically yet.
        "recommendations": [
            {
                "icon": "🚀",
                "title": "Welcome to Adaptive Learning",
                "reason": "Complete more quizzes to calibrate your AI tutor.",
                "urgency": "Anytime",
                "urgencyColor": "#3b82f6"
            }
        ]
    }


@router.post("/evaluate")
async def trigger_evaluation(
    performance_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Trigger an AI evaluation based on recent activity (e.g. quiz submission).
    Expects a payload like {"event": "Quiz Completed", "score": 85, "topic": "Calculus"}
    """
    profile = db.query(CognitiveProfile).filter(CognitiveProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Cognitive profile not found.")

    updated_profile, recommendations = evaluate_performance(db, profile, performance_data)
    
    return {
        "profile": updated_profile,
        "recommendations": recommendations
    }
