from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from openai import OpenAI
from db.database import get_db
from core.security import get_current_user
from core.config import settings
from models.user import User
from models.vector_embedding import VectorEmbedding
from schemas.schemas import AiTutorMessageRequest, AiTutorMessageResponse

router = APIRouter(prefix="/api/ai-tutor", tags=["AI Tutor"])
openai_client = OpenAI(api_key=settings.OPENAI_API_KEY)


def get_question_embedding(text: str) -> list[float]:
    """Convert a text string to a vector embedding using OpenAI."""
    response = openai_client.embeddings.create(
        input=text,
        model=settings.EMBEDDING_MODEL,
    )
    return response.data[0].embedding


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
    system_prompt = """You are an expert, friendly AI Tutor for an adaptive learning management system.
Answer the student's question based on the provided course context.
Be concise, educational, and encouraging.
If the context doesn't contain enough information, say so honestly.
Always respond in JSON format with these exact keys:
{
  "answer": "...",
  "response_type": "explanation | quiz | flashcard | summary",
  "sources": ["..."]
}"""

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

    import json
    result = json.loads(response.choices[0].message.content)

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

    import json
    return json.loads(response.choices[0].message.content)


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

    import json
    return json.loads(response.choices[0].message.content)
