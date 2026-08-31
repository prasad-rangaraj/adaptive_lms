"""
Celery background tasks for all heavy AI processing.
These run asynchronously, without blocking the main FastAPI server.
"""
from celery_worker import celery_app
from sqlalchemy.orm import Session
from db.database import SessionLocal
from core.config import settings
from openai import OpenAI
import httpx

openai_client = OpenAI(
    api_key=settings.OPENAI_API_KEY,
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
)


def get_db() -> Session:
    db = SessionLocal()
    try:
        return db
    except Exception:
        db.close()
        raise


# ----------------------------------------------------------------
# TASK 1: Process Course Material → Extract Text → Generate pgvector Embeddings
# ----------------------------------------------------------------

@celery_app.task(name="tasks.process_material_embeddings", bind=True, max_retries=3)
def process_material_embeddings(self, material_id: int, tenant_id: int):
    """
    Pipeline:
    1. Fetch material from DB
    2. Download PDF from S3
    3. Extract text & chunk into paragraphs
    4. For each chunk: call OpenAI Embeddings API
    5. Store each chunk + vector in PostgreSQL (pgvector)
    6. Mark material as processed
    """
    import boto3
    import io
    from PyPDF2 import PdfReader
    from models.course import CourseMaterial
    from models.vector_embedding import VectorEmbedding

    db = get_db()
    try:
        material = db.query(CourseMaterial).filter(CourseMaterial.id == material_id).first()
        if not material or material.material_type not in ["pdf", "doc"]:
            return {"status": "skipped", "reason": "Not a text-based material"}

        # Download file from S3/MinIO
        s3 = boto3.client(
            "s3",
            endpoint_url=settings.S3_ENDPOINT_URL,
            aws_access_key_id=settings.S3_ACCESS_KEY,
            aws_secret_access_key=settings.S3_SECRET_KEY,
        )
        s3_key = material.s3_url.split(f"{settings.S3_BUCKET_NAME}/")[-1]
        file_bytes = io.BytesIO()
        s3.download_fileobj(settings.S3_BUCKET_NAME, s3_key, file_bytes)
        file_bytes.seek(0)

        # Extract text from PDF
        reader = PdfReader(file_bytes)
        full_text = " ".join(page.extract_text() or "" for page in reader.pages)

        # Chunk text into ~500 word paragraphs
        words = full_text.split()
        chunks = [" ".join(words[i:i+500]) for i in range(0, len(words), 500)]

        # For each chunk: generate embedding and save to DB
        for idx, chunk in enumerate(chunks):
            if not chunk.strip():
                continue

            # Generate embedding via Gemini REST API
            model = settings.EMBEDDING_MODEL
            api_key = settings.OPENAI_API_KEY
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:embedContent?key={api_key}"
            payload = {
                "model": f"models/{model}",
                "content": {"parts": [{"text": chunk}]},
                "outputDimensionality": 1536
            }
            
            with httpx.Client() as client:
                resp = client.post(url, json=payload)
                resp.raise_for_status()
                vector = resp.json()["embedding"]["values"]

            vec_record = VectorEmbedding(
                tenant_id=tenant_id,
                course_id=material.course_id,
                material_id=material.id,
                text_chunk=chunk,
                embedding=vector,
                chunk_index=idx,
            )
            db.add(vec_record)

        material.is_processed = True
        db.commit()

        return {"status": "success", "chunks_processed": len(chunks)}

    except Exception as exc:
        db.rollback()
        raise self.retry(exc=exc, countdown=60)
    finally:
        db.close()


# ----------------------------------------------------------------
# TASK 2: AI Assignment Evaluation Pipeline
# ----------------------------------------------------------------

@celery_app.task(name="tasks.evaluate_assignment_submission", bind=True, max_retries=2)
def evaluate_assignment_submission(self, submission_id: int):
    """
    Pipeline:
    1. Download submission from S3
    2. OCR if needed (image/scanned PDF)
    3. Send to GPT-4o with rubric for structured evaluation
    4. Parse scores: grammar, plagiarism proxy, logic, AI detection
    5. Update submission record in DB
    """
    import boto3
    import io
    import json
    from PyPDF2 import PdfReader
    from models.assignment import AssignmentSubmission, Assignment
    from datetime import datetime, timezone

    db = get_db()
    try:
        submission = db.query(AssignmentSubmission).filter(
            AssignmentSubmission.id == submission_id
        ).first()
        if not submission:
            return {"status": "error", "reason": "Submission not found"}

        submission.status = "processing"
        db.commit()

        # Download file
        s3 = boto3.client(
            "s3",
            endpoint_url=settings.S3_ENDPOINT_URL,
            aws_access_key_id=settings.S3_ACCESS_KEY,
            aws_secret_access_key=settings.S3_SECRET_KEY,
        )
        s3_key = submission.file_url.split(f"{settings.S3_BUCKET_NAME}/")[-1]
        file_bytes = io.BytesIO()
        s3.download_fileobj(settings.S3_BUCKET_NAME, s3_key, file_bytes)
        file_bytes.seek(0)

        # Extract text
        try:
            reader = PdfReader(file_bytes)
            text = " ".join(page.extract_text() or "" for page in reader.pages)
        except Exception:
            text = file_bytes.read().decode("utf-8", errors="ignore")

        submission.ocr_text = text[:5000]  # Store first 5000 chars

        # Get assignment rubric
        assignment = db.query(Assignment).filter(
            Assignment.id == submission.assignment_id
        ).first()
        rubric = assignment.rubric or {"criteria": ["content accuracy", "grammar", "logic", "originality"]}

        # GPT-4o Evaluation
        eval_prompt = f"""You are an expert academic evaluator. Evaluate the following student assignment submission.

RUBRIC: {json.dumps(rubric)}

STUDENT SUBMISSION (first 3000 chars):
{text[:3000]}

Respond in JSON format:
{{
  "overall_score": 0-100,
  "grammar_score": 0-100,
  "logic_score": 0-100,
  "content_score": 0-100,
  "plagiarism_risk": 0-100,
  "ai_generated_probability": 0-100,
  "strengths": ["..."],
  "improvements": ["..."],
  "detailed_feedback": "..."
}}"""

        response = openai_client.chat.completions.create(
            model=settings.CHAT_MODEL,
            messages=[{"role": "user", "content": eval_prompt}],
            response_format={"type": "json_object"},
        )

        result = json.loads(response.choices[0].message.content)

        # Update submission with results
        submission.ai_score = result.get("overall_score", 0)
        submission.grammar_score = result.get("grammar_score", 0)
        submission.logic_score = result.get("logic_score", 0)
        submission.plagiarism_score = result.get("plagiarism_risk", 0)
        submission.ai_generated_probability = result.get("ai_generated_probability", 0)
        submission.feedback_json = result
        submission.final_score = result.get("overall_score", 0)
        submission.status = "evaluated"
        submission.evaluated_at = datetime.now(timezone.utc)
        db.commit()

        return {"status": "success", "submission_id": submission_id, "score": submission.ai_score}

    except Exception as exc:
        db.rollback()
        raise self.retry(exc=exc, countdown=30)
    finally:
        db.close()
