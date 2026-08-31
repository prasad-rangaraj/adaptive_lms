import json
from sqlalchemy.orm import Session
from openai import OpenAI
from core.config import settings
from models.cognitive_profile import CognitiveProfile
from datetime import datetime, timezone

# Initialize OpenAI Client (using Gemini proxy for consistency)
openai_client = OpenAI(
    api_key=settings.OPENAI_API_KEY,
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
)

def evaluate_performance(db: Session, profile: CognitiveProfile, performance_data: dict) -> CognitiveProfile:
    """
    Evaluates new performance data against the student's existing cognitive profile.
    Uses an LLM to adjust scores, update strengths/weaknesses, and assign a learning track.
    """
    system_prompt = """You are an AI Cognitive Analytics Engine for an Adaptive LMS.
Your task is to analyze a student's recent performance data and update their Cognitive Profile.

Inputs you will receive:
1. Current Profile (Focus, Speed, Retention, Confidence, etc.)
2. Recent Performance Data (e.g. Quiz results, Assignment scores, time taken)

Rules for output:
1. Return a JSON object with the exact keys provided below.
2. Scores are floats between 0 and 100.
3. 'weak_areas' and 'strength_areas' must be string arrays (topics).
4. 'learning_track' must be exactly one of: "basic", "standard", "advanced".

Output JSON structure:
{
  "focus_score": 75.5,
  "learning_speed": 82.0,
  "retention_score": 60.5,
  "confidence_score": 88.0,
  "engagement_score": 90.0,
  "consistency_score": 70.0,
  "motivation_score": 85.0,
  "risk_score": 10.0,
  "weak_areas": ["Thermodynamics"],
  "strength_areas": ["Calculus", "Algebra"],
  "recommended_style": "Visual",
  "learning_track": "advanced",
  "recommendations": [
    {
      "icon": "🎯",
      "title": "Review Thermodynamics",
      "reason": "Scored low on the recent quiz.",
      "urgency": "Today",
      "urgencyColor": "#ef4444"
    }
  ]
}
"""

    current_state = {
        "focus_score": profile.focus_score,
        "learning_speed": profile.learning_speed,
        "retention_score": profile.retention_score,
        "confidence_score": profile.confidence_score,
        "engagement_score": profile.engagement_score,
        "consistency_score": profile.consistency_score,
        "motivation_score": profile.motivation_score,
        "risk_score": profile.risk_score,
        "weak_areas": profile.weak_areas,
        "strength_areas": profile.strength_areas,
        "learning_track": profile.learning_track,
    }

    user_prompt = f"""CURRENT PROFILE:
{json.dumps(current_state, indent=2)}

RECENT PERFORMANCE EVENT:
{json.dumps(performance_data, indent=2)}

Please generate the updated cognitive profile JSON."""

    response = openai_client.chat.completions.create(
        model=settings.CHAT_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        response_format={"type": "json_object"},
        temperature=0.4,
    )

    try:
        updated_data = json.loads(response.choices[0].message.content)
        
        # Apply updates to the profile
        profile.focus_score = updated_data.get("focus_score", profile.focus_score)
        profile.learning_speed = updated_data.get("learning_speed", profile.learning_speed)
        profile.retention_score = updated_data.get("retention_score", profile.retention_score)
        profile.confidence_score = updated_data.get("confidence_score", profile.confidence_score)
        profile.engagement_score = updated_data.get("engagement_score", profile.engagement_score)
        profile.consistency_score = updated_data.get("consistency_score", profile.consistency_score)
        profile.motivation_score = updated_data.get("motivation_score", profile.motivation_score)
        profile.risk_score = updated_data.get("risk_score", profile.risk_score)
        
        profile.weak_areas = updated_data.get("weak_areas", profile.weak_areas)
        profile.strength_areas = updated_data.get("strength_areas", profile.strength_areas)
        profile.recommended_style = updated_data.get("recommended_style", profile.recommended_style)
        profile.learning_track = updated_data.get("learning_track", profile.learning_track)
        
        profile.last_assessed_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(profile)
        
        # We optionally return the recommendations block as well if needed by the frontend directly,
        # but the main goal is updating the DB.
        return profile, updated_data.get("recommendations", [])
    
    except Exception as e:
        print(f"Error parsing AI response for cognitive profile: {e}")
        return profile, []
