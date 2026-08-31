from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from openai import OpenAI
from db.database import get_db
from core.security import get_current_user
from core.config import settings
from models.user import User
from models.vector_embedding import VectorEmbedding
from schemas.schemas import AiTutorMessageRequest, AiTutorMessageResponse
import json

def parse_llm_json(content: str) -> dict:
    """Robustly parse JSON, stripping out any markdown formatting blocks if present."""
    content = content.strip()
    if content.startswith("```"):
        content = content.split("\n", 1)[-1]
        if content.endswith("```"):
            content = content[:-3]
        if content.startswith("json\n"):
            content = content[5:]
    return json.loads(content)

router = APIRouter(prefix="/api/ai-tutor", tags=["AI Tutor"])
openai_client = OpenAI(
    api_key=settings.OPENAI_API_KEY,
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
)

import httpx

def get_question_embedding(text: str) -> list[float]:
    """Convert a text string to a vector embedding using Gemini REST API."""
    model = settings.EMBEDDING_MODEL
    api_key = settings.OPENAI_API_KEY # This holds the Gemini key in our .env
    
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:embedContent?key={api_key}"
    payload = {
        "model": f"models/{model}",
        "content": {
            "parts": [{"text": text}]
        },
        "outputDimensionality": 1536
    }
    
    # We use a synchronous httpx client here for simplicity, matching the old sync openai call
    with httpx.Client() as client:
        response = client.post(url, json=payload)
        response.raise_for_status()
        data = response.json()
        return data["embedding"]["values"]

def retrieve_context(
    db: Session,
    question_vector: list[float],
    tenant_id: int,
    course_id: int,
    top_k: int = 5,
) -> list[str]:
    """
    RAG Retrieval: Find the top-K most semantically similar text chunks
    from pgvector using cosine distance. Strictly filtered by tenant_id + course_id.
    """
    results = (
        db.query(VectorEmbedding)
        .filter(
            VectorEmbedding.tenant_id == tenant_id,
            VectorEmbedding.course_id == course_id,
        )
        .order_by(VectorEmbedding.embedding.cosine_distance(question_vector))
        .limit(top_k)
        .all()
    )
    return [r.text_chunk for r in results]


@router.post("/ask", response_model=AiTutorMessageResponse)
async def ask_ai_tutor(
    payload: AiTutorMessageRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Full RAG-powered AI Tutor endpoint:
    1. Embed the student's question.
    2. Retrieve relevant course content from pgvector.
    3. Send enriched prompt to GPT-4o.
    4. Return structured response.
    """
    # Step 1: Embed the question
    question_vector = get_question_embedding(payload.message)

    # Step 2: Retrieve relevant context from this tenant's course materials
    context_chunks = retrieve_context(
        db=db,
        question_vector=question_vector,
        tenant_id=current_user.tenant_id,
        course_id=payload.course_id,
    )

    if not context_chunks:
        # Fallback: No embeddings indexed yet for this course
        context_text = "No specific course material found for this course yet."
    else:
        context_text = "\n\n---\n\n".join(context_chunks)

    # Step 3: Build the prompt and call the LLM
    if payload.persona == "viva":
        persona_instructions = "You are a strict but fair Viva Examiner. Ask probing, challenging questions one by one based on the context to test the student's deep understanding."
    elif payload.persona == "debug":
        persona_instructions = "You are an expert Code Debugger. The student will provide code or errors. Use the context to help them debug efficiently, explaining why the error occurred."
    else:
        persona_instructions = "You are an expert, friendly AI Tutor for an adaptive learning management system. Answer the student's question based on the provided course context. Be concise, educational, and encouraging."

    system_prompt = f"""{persona_instructions}
If the context doesn't contain enough information, say so honestly.
Always respond in JSON format with these exact keys:
{{
  "answer": "...",
  "response_type": "explanation | quiz | flashcard | summary",
  "sources": ["..."]
}}"""

    user_prompt = f"""COURSE CONTEXT:
{context_text}

STUDENT QUESTION:
{payload.message}"""

    response = openai_client.chat.completions.create(
        model=settings.CHAT_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        response_format={"type": "json_object"},
        temperature=0.7,
    )

    result = parse_llm_json(response.choices[0].message.content)

    return AiTutorMessageResponse(
        answer=result.get("answer", ""),
        sources=result.get("sources", []),
        response_type=result.get("response_type", "explanation"),
    )


@router.post("/generate-quiz")
async def generate_quiz(
    course_id: int,
    topic: str,
    difficulty: str = "medium",
    num_questions: int = 5,
    current_user: User = Depends(get_current_user),
):
    """Auto-generate quiz questions using GPT-4o on a given topic."""
    prompt = f"""Generate {num_questions} multiple choice quiz questions about "{topic}".
Difficulty: {difficulty}.
Return as JSON array: [{{"question": "...", "options": ["A", "B", "C", "D"], "answer": "A", "explanation": "..."}}]"""

    response = openai_client.chat.completions.create(
        model=settings.CHAT_MODEL,
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
        temperature=0.8,
    )

    return parse_llm_json(response.choices[0].message.content)


@router.post("/generate-flashcards")
async def generate_flashcards(
    topic: str,
    num_cards: int = 10,
    current_user: User = Depends(get_current_user),
):
    """Auto-generate study flashcards using GPT-4o."""
    prompt = f"""Generate {num_cards} study flashcards about "{topic}".
Return as JSON: {{"flashcards": [{{"front": "...", "back": "..."}}]}}"""

    response = openai_client.chat.completions.create(
        model=settings.CHAT_MODEL,
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
    )

    return parse_llm_json(response.choices[0].message.content)
