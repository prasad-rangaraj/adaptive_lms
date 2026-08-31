import { useState, useEffect, useRef, useCallback } from 'react';
import {
  VideoOff, Radio, Calendar, Clock, Users, MessageSquare,
  Plus, Send, StopCircle, PlayCircle, Loader2, Trash2, X,
  ChevronDown, Signal, Check, CircleDot, BookOpen
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { LiveKitRoom, VideoConference, RoomAudioRenderer } from '@livekit/components-react';
import '@livekit/components-styles';
import toast from 'react-hot-toast';
import api from '../../services/api.service';

const BASE_WS = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace('http', 'ws');
const TABS = ['all', 'scheduled', 'live', 'ended'];

/* ─── Utility ─────────────────────────────────────────────────────────────── */
function fmtDate(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}
function fmtDuration(mins) {
  if (!mins && mins !== 0) return null;
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}
function useElapsedTimer(startedAt, active) {
  const [elapsed, setElapsed] = useState('00:00:00');
  useEffect(() => {
    if (!active || !startedAt) return;
    const update = () => {
      const secs = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
      const h = String(Math.floor(secs / 3600)).padStart(2, '0');
      const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0');
      const s = String(secs % 60).padStart(2, '0');
      setElapsed(`${h}:${m}:${s}`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [active, startedAt]);
  return elapsed;
}

/* ─── Status config ──────────────────────────────────────────────────────── */
const STATUS = {
  live:      { label: 'Live',      bg: '#fef2f2', text: '#dc2626', border: '#fecaca',  icon: Radio },
  scheduled: { label: 'Scheduled', bg: '#fffbeb', text: '#d97706', border: '#fde68a',  icon: Calendar },
  ended:     { label: 'Ended',     bg: '#f8fafc', text: '#64748b', border: '#e2e8f0',  icon: CircleDot },
};

/* ─── Chat Message ───────────────────────────────────────────────────────── */
function ChatMessage({ msg }) {
  if (msg.type === 'system') {
    return (
      <div style={{ textAlign: 'center', padding: '2px 0' }}>
        <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', background: 'var(--surface-2)', padding: '3px 12px', borderRadius: 20, fontStyle: 'italic' }}>{msg.text}</span>
      </div>
    );
  }
  if (msg.type === 'raise_hand') {
    return (
      <div style={{ textAlign: 'center', padding: '2px 0' }}>
        <span style={{ fontSize: '0.75rem', color: '#d97706', background: '#fffbeb', border: '1px solid #fde68a', padding: '3px 12px', borderRadius: 20 }}>✋ {msg.text}</span>
      </div>
    );
  }
  if (msg.type === 'reaction') {
    return (
      <div style={{ textAlign: 'center', padding: '2px 0' }}>
        <span style={{ fontSize: '1rem' }}>{msg.text}</span>
        <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginLeft: 4 }}>from {msg.sender_name}</span>
      </div>
    );
  }
  const isTeacher = msg.role === 'teacher' || msg.role === 'tenant_admin';
  return (
    <div className="animate-fade-up" style={{ display: 'flex', gap: 8 }}>
      <div style={{ width: 30, height: 30, borderRadius: '50%', background: isTeacher ? 'var(--brand-600)' : '#e2e8f0', color: isTeacher ? '#fff' : 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6875rem', fontWeight: 800, flexShrink: 0, marginTop: 1 }}>
        {msg.sender_name?.charAt(0).toUpperCase()}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 2, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>{msg.sender_name}</span>
          {isTeacher && <span className="badge badge-brand" style={{ fontSize: '0.5625rem', padding: '1px 5px' }}>Host</span>}
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>{new Date(msg.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, wordBreak: 'break-word' }}>{msg.text}</p>
      </div>
    </div>
  );
}

/* ─── Session Card ───────────────────────────────────────────────────────── */
function SessionCard({ session, onGoLive, onDelete, starting }) {
  const [deleting, setDeleting] = useState(false);
  const cfg = STATUS[session.status] || STATUS.ended;
  const Icon = cfg.icon;

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${session.title}"?`)) return;
    try {
      setDeleting(true);
      await api.delete(`/api/live/sessions/${session.id}`);
      onDelete(session.id);
      toast.success('Session deleted');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Cannot delete session');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className="card"
      style={{ padding: '1rem 1.125rem', display: 'flex', alignItems: 'center', gap: '0.875rem', transition: 'all 0.15s', borderLeft: session.status === 'live' ? '3px solid #dc2626' : '3px solid transparent' }}
    >
      {/* Icon */}
      <div style={{ width: 40, height: 40, borderRadius: 10, background: cfg.bg, border: `1px solid ${cfg.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {session.status === 'live'
          ? <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#dc2626', boxShadow: '0 0 0 6px rgba(220,38,38,0.15)' }} />
            </div>
          : <Icon size={17} color={cfg.text} />
        }
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{session.title}</p>
          <span style={{ fontSize: '0.5625rem', fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}`, textTransform: 'uppercase', letterSpacing: '0.08em', flexShrink: 0 }}>{cfg.label}</span>
        </div>
        <div style={{ display: 'flex', align: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
            <Clock size={10} /> {session.scheduled_at ? fmtDate(session.scheduled_at) : 'No time set'}
          </span>
          {session.duration_minutes !== null && session.duration_minutes !== undefined && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
              <Signal size={10} /> {fmtDuration(session.duration_minutes)}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        {session.status !== 'ended' && (
          <button
            onClick={() => onGoLive(session)}
            disabled={!!starting}
            className="btn btn-sm"
            style={{ background: session.status === 'live' ? 'var(--brand-600)' : '#16a34a', color: 'white', border: 'none', gap: 5, opacity: starting === session.id ? 0.6 : 1 }}
          >
            {starting === session.id ? <Loader2 size={12} className="animate-spin" /> : <PlayCircle size={12} />}
            {session.status === 'live' ? 'Rejoin' : 'Go Live'}
          </button>
        )}
        {session.status === 'scheduled' && (
          <button onClick={handleDelete} disabled={deleting} className="btn btn-ghost btn-sm btn-icon" style={{ color: 'var(--text-muted)' }}>
            {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Create Session Modal ───────────────────────────────────────────────── */
function CreateModal({ onClose, onCreate }) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [creating, setCreating] = useState(false);

  const submit = async () => {
    if (!title.trim()) return toast.error('Session title required');
    try {
      setCreating(true);
      const res = await api.post('/api/live/sessions', { title, description: desc || null, scheduled_at: scheduledAt || null });
      onCreate(res.data);
      toast.success('Session scheduled!');
      onClose();
    } catch (err) {
      toast.error('Failed to create session');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={onClose}>
      <div
        className="card animate-scale-in"
        style={{ width: '100%', maxWidth: 480, padding: '1.75rem', boxShadow: '0 24px 64px rgba(0,0,0,0.16)', borderRadius: 20 }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)' }}>New Live Session</h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 2 }}>Schedule a class for your students</p>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon"><X size={18} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="label">Session Title <span style={{ color: '#dc2626' }}>*</span></label>
            <input autoFocus value={title} onChange={e => setTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} placeholder="e.g. Neural Networks Q&A" className="input" />
          </div>
          <div>
            <label className="label">Description <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="What will you cover in this session?" className="input" rows={2} style={{ resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5 }} />
          </div>
          <div>
            <label className="label">Schedule Date & Time <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
            <input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} className="input" />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button onClick={submit} disabled={creating || !title.trim()} className="btn btn-primary" style={{ minWidth: 120 }}>
            {creating ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
            {creating ? 'Creating…' : 'Create Session'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────── */
export default function TeacherLiveHub() {
  const { token: authToken } = useAuthStore();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [showModal, setShowModal] = useState(false);

  const [activeSession, setActiveSession] = useState(null);
  const [lkToken, setLkToken] = useState('');
  const [lkUrl, setLkUrl] = useState('');
  const [isLive, setIsLive] = useState(false);
  const [startingCall, setStartingCall] = useState(null);

  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatTab, setChatTab] = useState('chat');
  const [wsConnected, setWsConnected] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);
  const wsRef = useRef(null);
  const chatEndRef = useRef(null);

  const elapsed = useElapsedTimer(activeSession?.started_at, isLive);

  useEffect(() => { fetchSessions(); }, []);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);
  useEffect(() => () => { wsRef.current?.close(); }, []);

  // Participant count poll
  useEffect(() => {
    if (!isLive || !activeSession) return;
    const interval = setInterval(async () => {
      try {
        const r = await api.get(`/api/live/sessions/${activeSession.id}/participants`);
        setParticipantCount(r.data.count);
      } catch (_) {}
    }, 5000);
    return () => clearInterval(interval);
  }, [isLive, activeSession]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/live/sessions');
      setSessions(res.data);
    } catch { toast.error('Failed to load sessions'); }
    finally { setLoading(false); }
  };

  const connectChat = (sessionId) => {
    wsRef.current?.close();
    setChatMessages([]);
    setWsConnected(false);
    const ws = new WebSocket(`${BASE_WS}/api/live/sessions/${sessionId}/chat?token=${authToken}`);
    ws.onopen = () => setWsConnected(true);
    ws.onmessage = e => setChatMessages(p => [...p, JSON.parse(e.data)]);
    ws.onerror = () => setWsConnected(false);
    ws.onclose = () => setWsConnected(false);
    wsRef.current = ws;
  };

  const startBroadcast = async (session) => {
    try {
      setStartingCall(session.id);
      const res = await api.post(`/api/live/sessions/${session.id}/start`);
      setLkToken(res.data.token);
      setLkUrl(res.data.url);
      setIsLive(true);
      setActiveSession({ ...session, status: 'live', started_at: new Date().toISOString() });
      setSessions(p => p.map(s => s.id === session.id ? { ...s, status: 'live' } : s));
      connectChat(session.id);
      setParticipantCount(1);
      toast.success('You\'re live! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to start');
    } finally { setStartingCall(null); }
  };

  const endBroadcast = useCallback(async () => {
    if (activeSession) {
      try { await api.post(`/api/live/sessions/${activeSession.id}/end`); } catch (_) {}
      setSessions(p => p.map(s => s.id === activeSession.id ? { ...s, status: 'ended' } : s));
    }
    wsRef.current?.close();
    setIsLive(false); setLkToken(''); setLkUrl('');
    setActiveSession(null); setChatMessages([]); setWsConnected(false);
    toast('Broadcast ended');
  }, [activeSession]);

  const sendMessage = (type = 'message', extra = {}) => {
    if (!wsRef.current || !wsConnected) return;
    if (type === 'message' && !chatInput.trim()) return;
    wsRef.current.send(JSON.stringify({ type, text: chatInput, ...extra }));
    if (type === 'message') setChatInput('');
  };

  const deleteSession = (id) => setSessions(p => p.filter(s => s.id !== id));
  const addSession = (s) => setSessions(p => [s, ...p]);

  // Computed
  const filtered = sessions.filter(s => activeTab === 'all' || s.status === activeTab);
  const stats = {
    total: sessions.length,
    live: sessions.filter(s => s.status === 'live').length,
    scheduled: sessions.filter(s => s.status === 'scheduled').length,
    ended: sessions.filter(s => s.status === 'ended').length,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', height: '100%', overflow: 'hidden' }}>

      {/* ── HEADER ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            {isLive
              ? <><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#dc2626', boxShadow: '0 0 0 4px rgba(220,38,38,0.15)', marginLeft: 4, animation: 'pulse-ring 1.5s ease-in-out infinite' }} /><span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Broadcasting</span></>
              : <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', paddingLeft: 4 }}>Live Sessions</span>
            }
          </div>
          <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.025em', lineHeight: 1.1 }}>
            {isLive ? activeSession?.title : 'Broadcast Studio'}
          </h1>
          {isLive && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6 }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontFamily: 'monospace', fontWeight: 600 }}>{elapsed}</span>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}><Users size={13} /> {participantCount} participant{participantCount !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {!isLive && <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ gap: 7 }}><Plus size={15} /> Schedule Session</button>}
          {isLive && <button onClick={endBroadcast} className="btn btn-danger" style={{ gap: 7 }}><StopCircle size={15} /> End Broadcast</button>}
        </div>
      </div>

      {/* ── STATS BAR (offline only) ── */}
      {!isLive && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
          {[
            { label: 'Total Sessions', value: stats.total, color: 'var(--brand-600)', bg: 'var(--brand-50)', border: 'var(--brand-200)' },
            { label: 'Live Now',        value: stats.live,      color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
            { label: 'Scheduled',       value: stats.scheduled, color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
            { label: 'Completed',       value: stats.ended,     color: '#64748b', bg: '#f8fafc', border: '#e2e8f0' },
          ].map(stat => (
            <div key={stat.label} style={{ background: stat.bg, border: `1px solid ${stat.border}`, borderRadius: 12, padding: '0.875rem 1rem' }}>
              <p style={{ fontSize: '1.5rem', fontWeight: 800, color: stat.color, lineHeight: 1 }}>{stat.value}</p>
              <p style={{ fontSize: '0.75rem', color: stat.color, fontWeight: 600, marginTop: 4, opacity: 0.8 }}>{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── MAIN STAGE ── */}
      <div style={{ display: 'grid', gridTemplateColumns: isLive ? '1fr 300px' : '1fr 320px', gap: '1.25rem', flex: 1, minHeight: 0 }}>

        {/* LEFT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: 0 }}>

          {/* Video Stage */}
          <div style={{ borderRadius: 20, overflow: 'hidden', background: '#0f172a', border: '1px solid #1e293b', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', flex: isLive ? 1 : 'none', minHeight: isLive ? 380 : 200 }}>
            {!isLive || !lkToken ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 200, gap: 12 }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <VideoOff size={22} color="#334155" />
                </div>
                <p style={{ color: '#475569', fontWeight: 600, fontSize: '0.875rem' }}>Studio Offline</p>
                <p style={{ color: '#334155', fontSize: '0.75rem' }}>Pick a session below and click Go Live</p>
              </div>
            ) : (
              <LiveKitRoom video audio token={lkToken} serverUrl={lkUrl} onDisconnected={endBroadcast} data-lk-theme="default" style={{ height: '100%', minHeight: 380 }}>
                <VideoConference /><RoomAudioRenderer />
              </LiveKitRoom>
            )}
          </div>

          {/* Session List (offline) */}
          {!isLive && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {/* Tab pills */}
              <div style={{ display: 'flex', gap: 6 }}>
                {TABS.map(t => {
                  const count = t === 'all' ? sessions.length : sessions.filter(s => s.status === t).length;
                  const active = activeTab === t;
                  return (
                    <button
                      key={t}
                      onClick={() => setActiveTab(t)}
                      style={{ background: active ? 'var(--brand-50)' : 'transparent', border: active ? '1px solid var(--brand-200)' : '1px solid transparent', color: active ? 'var(--brand-700)' : 'var(--text-muted)', borderRadius: 8, padding: '5px 12px', fontSize: '0.8125rem', fontWeight: active ? 700 : 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s' }}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                      {count > 0 && <span style={{ background: active ? 'var(--brand-200)' : 'var(--surface-3)', color: active ? 'var(--brand-700)' : 'var(--text-muted)', borderRadius: 4, padding: '1px 6px', fontSize: '0.625rem', fontWeight: 800 }}>{count}</span>}
                    </button>
                  );
                })}
              </div>

              {/* Session cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', overflowY: 'auto', maxHeight: 320 }} className="hide-scrollbar">
                {loading ? (
                  [...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 68, borderRadius: 12 }} />)
                ) : filtered.length === 0 ? (
                  <div className="card" style={{ padding: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                    <BookOpen size={28} color="var(--surface-4)" />
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{activeTab === 'all' ? 'No sessions yet. Click "Schedule Session" to create one.' : `No ${activeTab} sessions.`}</p>
                    {activeTab === 'all' && <button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm"><Plus size={13} /> Create First Session</button>}
                  </div>
                ) : (
                  filtered.map(s => (
                    <SessionCard key={s.id} session={s} onGoLive={startBroadcast} onDelete={deleteSession} starting={startingCall} />
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Chat Panel */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden', padding: 0, borderRadius: 16 }}>

          {/* Panel Header */}
          <div style={{ padding: '1rem 1rem 0.75rem', borderBottom: '1px solid var(--card-border)' }}>
            {/* Tab switcher */}
            <div style={{ display: 'flex', gap: 2, background: 'var(--surface-1)', borderRadius: 8, padding: 3, marginBottom: wsConnected && isLive ? 8 : 0 }}>
              {[['chat', MessageSquare, 'Chat'], ['roster', Users, 'Roster']].map(([key, Icon, label]) => (
                <button
                  key={key}
                  onClick={() => setChatTab(key)}
                  style={{ flex: 1, background: chatTab === key ? 'var(--card-bg)' : 'transparent', border: 'none', borderRadius: 6, padding: '6px 0', color: chatTab === key ? 'var(--text-primary)' : 'var(--text-muted)', fontSize: '0.8125rem', fontWeight: chatTab === key ? 700 : 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, boxShadow: chatTab === key ? 'var(--shadow-xs)' : 'none', transition: 'all 0.12s' }}
                >
                  <Icon size={13} />
                  {label}
                  {key === 'roster' && isLive && participantCount > 0 && <span style={{ background: '#dc2626', color: 'white', borderRadius: 4, padding: '0px 5px', fontSize: '0.5625rem', fontWeight: 800 }}>{participantCount}</span>}
                </button>
              ))}
            </div>
            {/* WS status */}
            {isLive && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: wsConnected ? '#16a34a' : '#e2e8f0' }} />
                <span style={{ fontSize: '0.6875rem', color: wsConnected ? '#16a34a' : 'var(--text-muted)', fontWeight: 600 }}>{wsConnected ? 'Chat live' : 'Connecting…'}</span>
              </div>
            )}
          </div>

          {chatTab === 'chat' ? (
            <>
              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '0.875rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }} className="hide-scrollbar">
                {!isLive && chatMessages.length === 0 && (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 120 }}>
                    <MessageSquare size={28} color="var(--surface-4)" />
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textAlign: 'center' }}>Chat will appear here<br />once you go live</p>
                  </div>
                )}
                {chatMessages.map((msg, i) => <ChatMessage key={i} msg={msg} />)}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--card-border)' }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                    placeholder={isLive && wsConnected ? 'Message the class…' : 'Go live to chat'}
                    disabled={!isLive || !wsConnected}
                    className="input"
                    style={{ fontSize: '0.875rem', padding: '0.5rem 0.75rem' }}
                  />
                  <button onClick={() => sendMessage()} disabled={!isLive || !wsConnected || !chatInput.trim()} className="btn btn-primary btn-icon" style={{ width: 36, height: 36, borderRadius: 8, flexShrink: 0 }}>
                    <Send size={14} />
                  </button>
                </div>
                {/* Quick actions */}
                {isLive && wsConnected && (
                  <div style={{ display: 'flex', gap: 5, marginTop: 6 }}>
                    {['👍', '❤️', '🔥', '👏'].map(emoji => (
                      <button key={emoji} onClick={() => sendMessage('reaction', { emoji })} style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-3)', borderRadius: 8, padding: '4px 8px', fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.12s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-1)'}
                      >{emoji}</button>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '1.5rem' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={22} color="var(--text-muted)" />
              </div>
              {isLive
                ? <><p style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{participantCount}</p><p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>participant{participantCount !== 1 ? 's' : ''} in session</p></>
                : <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textAlign: 'center' }}>Roster visible<br />when live</p>
              }
            </div>
          )}
        </div>
      </div>

      {/* ── CREATE MODAL ── */}
      {showModal && <CreateModal onClose={() => setShowModal(false)} onCreate={addSession} />}
    </div>
  );
}
