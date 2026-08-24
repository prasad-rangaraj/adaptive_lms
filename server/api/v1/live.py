from fastapi import APIRouter, HTTPException, Depends, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from db.database import get_db
from core.config import settings
from core.security import get_current_user, require_role
from models.user import User
from models.live_session import LiveSession
from schemas.schemas import LiveSessionCreateRequest, LiveSessionResponse
from livekit.api import AccessToken, VideoGrants
from typing import List, Optional
import uuid, json
from datetime import datetime, timezone

router = APIRouter(prefix="/api/live", tags=["Live Classes"])

# ── WebSocket connection manager ──────────────────────────────────────────────
chat_connections: dict[int, list[WebSocket]] = {}

class ChatManager:
    async def connect(self, session_id: int, ws: WebSocket):
        await ws.accept()
        chat_connections.setdefault(session_id, []).append(ws)

    def disconnect(self, session_id: int, ws: WebSocket):
        if session_id in chat_connections:
            try:
                chat_connections[session_id].remove(ws)
            except ValueError:
                pass

    async def broadcast(self, session_id: int, message: dict):
        dead = []
        for ws in chat_connections.get(session_id, []):
            try:
                await ws.send_json(message)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(session_id, ws)

    def get_count(self, session_id: int) -> int:
        return len(chat_connections.get(session_id, []))

chat_manager = ChatManager()


# ── LiveKit token helper ──────────────────────────────────────────────────────
def _mint_token(user: User, room_name: str, can_publish: bool = True) -> str:
    if not settings.LIVEKIT_API_KEY or not settings.LIVEKIT_API_SECRET:
        raise HTTPException(status_code=500, detail="LiveKit credentials not configured")
    grant = VideoGrants(room_join=True, room=room_name, can_publish=can_publish, can_subscribe=True)
    token = AccessToken(settings.LIVEKIT_API_KEY, settings.LIVEKIT_API_SECRET)
    token.with_identity(str(user.id)).with_name(user.full_name).with_grants(grant)
    return token.to_jwt()


# ── Helpers ───────────────────────────────────────────────────────────────────
def _enrich(session: LiveSession) -> LiveSessionResponse:
    """Build a response object with computed fields."""
    r = LiveSessionResponse.model_validate(session)
    if session.teacher:
        r.teacher_name = session.teacher.full_name
    # Compute duration
    if session.started_at and session.ended_at:
        delta = session.ended_at - session.started_at
        r.duration_minutes = int(delta.total_seconds() / 60)
    elif session.started_at and session.status == "live":
        delta = datetime.now(timezone.utc) - session.started_at
        r.duration_minutes = int(delta.total_seconds() / 60)
    return r


# ── Session CRUD ──────────────────────────────────────────────────────────────

@router.post("/sessions", response_model=LiveSessionResponse, status_code=201)
async def create_session(
    payload: LiveSessionCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("teacher", "tenant_admin")),
):
    """Create a new live session (scheduled or instant)."""
    room_name = f"session-{current_user.tenant_id}-{uuid.uuid4().hex[:10]}"
    session = LiveSession(
        tenant_id=current_user.tenant_id,
        teacher_id=current_user.id,
        course_id=payload.course_id,
        title=payload.title,
        description=payload.description,
        room_name=room_name,
        status="scheduled",
        scheduled_at=payload.scheduled_at,
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return _enrich(session)


@router.get("/sessions", response_model=List[LiveSessionResponse])
async def list_sessions(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    List sessions for the current tenant.
    Filter: ?status=live  or  ?status=live,scheduled  (comma-separated)
    """
    q = db.query(LiveSession).filter(LiveSession.tenant_id == current_user.tenant_id)
    if status:
        statuses = [s.strip() for s in status.split(",")]
        q = q.filter(LiveSession.status.in_(statuses))
    sessions = q.order_by(LiveSession.created_at.desc()).all()
    return [_enrich(s) for s in sessions]


@router.get("/sessions/{session_id}", response_model=LiveSessionResponse)
async def get_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = db.query(LiveSession).filter(
        LiveSession.id == session_id,
        LiveSession.tenant_id == current_user.tenant_id,
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return _enrich(session)


@router.delete("/sessions/{session_id}", status_code=204)
async def delete_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("teacher", "tenant_admin")),
):
    """Teacher can delete a scheduled (not yet live) session."""
    session = db.query(LiveSession).filter(
        LiveSession.id == session_id,
        LiveSession.teacher_id == current_user.id,
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session.status == "live":
        raise HTTPException(status_code=400, detail="Cannot delete a live session. End it first.")
    db.delete(session)
    db.commit()


# ── Session Lifecycle ─────────────────────────────────────────────────────────

@router.post("/sessions/{session_id}/start")
async def start_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("teacher", "tenant_admin")),
):
    """Teacher starts a session → status=live, returns LiveKit token."""
    session = db.query(LiveSession).filter(
        LiveSession.id == session_id,
        LiveSession.teacher_id == current_user.id,
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found or not yours")
    if session.status == "ended":
        raise HTTPException(status_code=400, detail="Cannot restart an ended session")

    session.status = "live"
    session.started_at = datetime.now(timezone.utc)
    db.commit()

    token = _mint_token(current_user, session.room_name, can_publish=True)
    return {"token": token, "url": settings.LIVEKIT_URL, "room_name": session.room_name, "session_id": session.id}


@router.post("/sessions/{session_id}/join")
async def join_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Student/anyone joins a live session → returns LiveKit token."""
    session = db.query(LiveSession).filter(
        LiveSession.id == session_id,
        LiveSession.tenant_id == current_user.tenant_id,
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session.status != "live":
        raise HTTPException(status_code=400, detail="Session is not live yet")

    can_publish = current_user.role in ("teacher", "tenant_admin", "super_admin")
    token = _mint_token(current_user, session.room_name, can_publish=can_publish)
    return {"token": token, "url": settings.LIVEKIT_URL, "room_name": session.room_name, "session_id": session.id}


@router.post("/sessions/{session_id}/end")
async def end_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("teacher", "tenant_admin")),
):
    """Teacher ends a live session."""
    session = db.query(LiveSession).filter(
        LiveSession.id == session_id,
        LiveSession.teacher_id == current_user.id,
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    session.status = "ended"
    session.ended_at = datetime.now(timezone.utc)
    db.commit()
    return {"message": "Session ended"}


@router.get("/sessions/{session_id}/participants")
async def get_participants(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return {"session_id": session_id, "count": chat_manager.get_count(session_id)}


# ── WebSocket Chat ────────────────────────────────────────────────────────────

@router.websocket("/sessions/{session_id}/chat")
async def session_chat(session_id: int, websocket: WebSocket, token: str, db: Session = Depends(get_db)):
    """
    Real-time chat. Connect with ?token=<jwt>.
    Send: {"type": "message"|"reaction"|"raise_hand", "text": "..."}
    """
    from core.security import decode_token
    try:
        payload = decode_token(token)
        user = db.query(User).filter(User.id == int(payload["sub"])).first()
        if not user:
            await websocket.close(code=4001); return
    except Exception:
        await websocket.close(code=4001); return

    await chat_manager.connect(session_id, websocket)
    now = lambda: datetime.now(timezone.utc).isoformat()

    await chat_manager.broadcast(session_id, {
        "type": "system", "text": f"{user.full_name} joined",
        "sender_name": "System", "sender_id": 0, "timestamp": now(),
    })

    try:
        while True:
            raw = await websocket.receive_text()
            data = json.loads(raw)
            msg_type = data.get("type", "message")

            if msg_type == "raise_hand":
                await chat_manager.broadcast(session_id, {
                    "type": "raise_hand", "text": f"{user.full_name} raised their hand ✋",
                    "sender_name": user.full_name, "sender_id": user.id,
                    "role": user.role, "timestamp": now(),
                })
            elif msg_type == "reaction":
                await chat_manager.broadcast(session_id, {
                    "type": "reaction", "text": data.get("emoji", "👍"),
                    "sender_name": user.full_name, "sender_id": user.id,
                    "role": user.role, "timestamp": now(),
                })
            else:
                await chat_manager.broadcast(session_id, {
                    "type": "message", "text": data.get("text", ""),
                    "sender_name": user.full_name, "sender_id": user.id,
                    "role": user.role, "timestamp": now(),
                })
    except WebSocketDisconnect:
        chat_manager.disconnect(session_id, websocket)
        await chat_manager.broadcast(session_id, {
            "type": "system", "text": f"{user.full_name} left",
            "sender_name": "System", "sender_id": 0, "timestamp": now(),
        })


# ── Legacy: generic room token ────────────────────────────────────────────────

@router.post("/rooms")
async def create_or_get_room(room_name: str, current_user: User = Depends(get_current_user)):
    """Ad-hoc room token for MeetingArena / office hours."""
    token = _mint_token(current_user, room_name, can_publish=True)
    return {"url": settings.LIVEKIT_URL, "token": token, "name": room_name}
