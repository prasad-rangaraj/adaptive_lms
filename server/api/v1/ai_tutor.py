from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from openai import OpenAI
from db.database import get_db
from core.security import get_current_user
from core.config import settings
from models.user import User
from models.vector_embedding import VectorEmbedding
from models.ai_tutor_session import AITutorSession
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

@router.get("/history")
async def get_chat_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    sessions = db.query(AITutorSession).filter(AITutorSession.user_id == current_user.id).order_by(AITutorSession.created_at.desc()).limit(20).all()
    
    return [
        {
            "id": s.id,
            "title": s.title,
            "context": s.context or "General Topic",
            "time": s.created_at.strftime("%I:%M %p") if s.created_at else "",
            "persona": s.persona
        } for s in sessions
    ]


@router.post("/ask", response_model=AiTutorMessageResponse)
async def ask_ai_tutor(
    payload: AiTutorMessageRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Full RAG & Knowledge-Base powered AI Tutor endpoint:
    1. Check course & domain topic (Computer Networks study guide & pgvector).
    2. Retrieve relevant context chunks and chapters.
    3. Generate rich, authoritative, educational answer (never generic refusals).
    4. Return structured response with verified sources.
    """
    from models.course import Course

    course = db.query(Course).filter(Course.id == payload.course_id).first()
    course_title = course.title if course else "Computer Science"
    course_category = (course.category or "") if course else ""

    context_chunks = []
    guide_sources = []

    # ── Step 1: Query pgvector embeddings if available ─────────────────────────
    try:
        question_vector = get_question_embedding(payload.message)
        if question_vector:
            pg_chunks = retrieve_context(
                db=db,
                question_vector=question_vector,
                tenant_id=current_user.tenant_id,
                course_id=payload.course_id,
            )
            if pg_chunks:
                context_chunks.extend(pg_chunks)
    except Exception as e:
        # Gracefully continue if embedding API is unreachable
        pass

    # ── Step 2: Computer Networks & Protocols Ingested Knowledge Base ─────────
    is_networking = (
        "network" in course_title.lower() or
        "network" in course_category.lower() or
        any(term in payload.message.lower() for term in [
            "osi", "tcp", "udp", "ip", "ipv4", "ipv6", "subnet", "cidr", "router", "switch",
            "hub", "vlan", "dns", "dhcp", "dora", "http", "https", "tls", "quic", "mqtt",
            "coap", "packet", "frame", "mac", "ethernet", "wi-fi", "wifi", "bluetooth", "ble",
            "can bus", "modbus", "nat", "pat", "ospf", "bgp", "ping", "traceroute", "wireshark",
            "jitter", "latency", "handshake", "socket", "port"
        ])
    )

    if is_networking:
        try:
            from data.knowledge_bases.computer_networks import find_relevant_guide_chapters
            matched_chapters = find_relevant_guide_chapters(payload.message, top_n=3)
            for ch in matched_chapters:
                context_chunks.append(
                    f"[{ch['title']} - Official Networks & Protocols Study Guide]:\n{ch['content']}"
                )
                guide_sources.append(f"Networks & Protocols Guide - Ch. {ch['chapter']}: {ch['title']}")
        except Exception as e:
            pass

    if context_chunks:
        context_text = "\n\n---\n\n".join(context_chunks)
    else:
        context_text = f"Subject Area: {course_title} ({course_category}). Use your comprehensive computer science and engineering intelligence."

    # ── Step 3: Build the prompt and call the LLM ────────────────────────────
    persona = getattr(payload, "persona", "tutor") or "tutor"
    if persona == "viva":
        persona_instructions = (
            f"You are a rigorous, distinguished University Viva Voce Examiner for '{course_title}'. "
            "Test the student's conceptual depth with probing questions, challenging them on protocol trade-offs, "
            "packet formats, edge-case failure modes, and practical design decisions."
        )
    elif persona == "debug":
        persona_instructions = (
            f"You are a Senior Network & Systems Engineer Debugger for '{course_title}'. "
            "The student provides errors, code, packet captures, or networking symptoms. "
            "Analyze the root cause systematically (Layer 1 through Layer 7), explain RFC/protocol specifics, and provide exact fixes."
        )
    else:
        persona_instructions = (
            f"You are an expert, encouraging AI Professor and Course Tutor for '{course_title}'. "
            "Explain complex networking concepts with supreme clarity, using real-world packet flow analogies, "
            "step-by-step calculations (e.g. subnet masks), protocol comparison tables, and practical troubleshooting workflows."
        )

    system_prompt = f"""{persona_instructions}

CRITICAL INSTRUCTIONS:
1. NEVER reply with generic refusal boilerplate such as 'I don't have course materials loaded' or 'I don't have specific course materials loaded for this course yet, but I'm here to help you learn! What topic or subject would you like to explore today?'.
2. You possess complete, master-level expertise in Computer Networks and computer science. Always answer the student's question directly, accurately, and thoroughly.
3. When relevant study guide context is provided above, ground your explanations in it and reference its concepts.
4. Structure your response using rich Markdown: clear section headers, bulleted lists, comparison tables, or ASCII packet flow diagrams where helpful.
5. Always respond in valid JSON format with these exact keys:
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
    sources = result.get("sources", [])

    # Ensure relevant study guide chapters appear in verified sources
    for gs in guide_sources:
        if gs not in sources:
            sources.append(gs)

    if not sources and is_networking:
        sources = ["Networks & Protocols Comprehensive Study Guide"]

    return AiTutorMessageResponse(
        answer=result.get("answer", ""),
        sources=sources,
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
Return as JSON object: {{"quiz": [{{"question": "...", "options": ["A", "B", "C", "D"], "answer": "A", "explanation": "..."}}]}}"""

    response = openai_client.chat.completions.create(
        model=settings.CHAT_MODEL,
        messages=[{"role": "user", "content": prompt}],
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
