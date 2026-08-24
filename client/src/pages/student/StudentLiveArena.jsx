import { useState, useEffect, useRef, useCallback } from 'react';
import {
  PlayCircle, VideoOff, Loader2, Clock, MessageSquare,
  Users, Send, RefreshCw, Radio, Calendar, Video,
  Hand, LogOut, Signal, BookOpen
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { LiveKitRoom, VideoConference, RoomAudioRenderer } from '@livekit/components-react';
import '@livekit/components-styles';
import toast from 'react-hot-toast';
import api from '../../services/api.service';

const BASE_WS = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace('http', 'ws');

/* ─── Utility ─────────────────────────────────────────────────────────────── */
function fmtDate(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}

function fmtDuration(mins) {
  if (!mins && mins !== 0) return null;
  if (mins < 60) return `${mins} min`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

function useCountdown(targetIso) {
  const [label, setLabel] = useState('');
  useEffect(() => {
    if (!targetIso) return;
    const update = () => {
      const diff = new Date(targetIso).getTime() - Date.now();
      if (diff <= 0) { setLabel('Starting soon'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      if (h > 0) setLabel(`in ${h}h ${m}m`);
      else if (m > 0) setLabel(`in ${m}m ${s}s`);
      else setLabel(`in ${s}s`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [targetIso]);
  return label;
}

function useElapsedTimer(startedAt, active) {
  const [elapsed, setElapsed] = useState('00:00');
  useEffect(() => {
    if (!active || !startedAt) return;
    const update = () => {
      const secs = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
      const m = String(Math.floor(secs / 60)).padStart(2, '0');
      const s = String(secs % 60).padStart(2, '0');
      setElapsed(`${m}:${s}`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [active, startedAt]);
  return elapsed;
}

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
        <span style={{ fontSize: '0.75rem', color: '#d97706', background: '#fffbeb', border: '1px solid #fde68a', padding: '3px 12px', borderRadius: 20 }}>{msg.text}</span>
      </div>
    );
  }
  if (msg.type === 'reaction') {
    return (
      <div style={{ textAlign: 'center', padding: '2px 0' }}>
        <span style={{ fontSize: '1.125rem' }}>{msg.text}</span>
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
          {isTeacher && <span className="badge badge-brand" style={{ fontSize: '0.5625rem', padding: '1px 5px' }}>Teacher</span>}
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>{new Date(msg.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, wordBreak: 'break-word' }}>{msg.text}</p>
      </div>
    </div>
  );
}

/* ─── Upcoming Session Card ──────────────────────────────────────────────── */
function UpcomingCard({ session }) {
  const countdown = useCountdown(session.scheduled_at);
  return (
    <div className="card" style={{ padding: '1rem 1.125rem', display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
      <div style={{ width: 42, height: 42, borderRadius: 12, background: '#fffbeb', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Calendar size={18} color="#d97706" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem', marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{session.title}</p>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Clock size={10} /> {fmtDate(session.scheduled_at)} · By {session.teacher_name || 'Teacher'}
        </p>
      </div>
      {countdown && (
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '4px 10px', flexShrink: 0 }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#d97706', whiteSpace: 'nowrap' }}>{countdown}</span>
        </div>
      )}
    </div>
  );
}

/* ─── Live Session Card ──────────────────────────────────────────────────── */
function LiveCard({ session, onJoin, joining }) {
  const isJoining = joining === session.id;
  return (
    <div
      className="card animate-fade-up"
      style={{ padding: '1.125rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid #fecaca', background: 'linear-gradient(to right, #fff8f8, #fff)', cursor: 'pointer', transition: 'all 0.15s' }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
    >
      {/* Live pulse */}
      <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fef2f2', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative' }}>
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#dc2626', boxShadow: '0 0 0 6px rgba(220,38,38,0.15)', animation: 'pulse-ring 1.5s ease-in-out infinite' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9375rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{session.title}</p>
          <span style={{ fontSize: '0.5625rem', fontWeight: 800, padding: '2px 7px', borderRadius: 4, background: '#dc2626', color: 'white', textTransform: 'uppercase', letterSpacing: '0.1em', flexShrink: 0 }}>● Live</span>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Hosted by {session.teacher_name || 'Teacher'}
          {session.started_at && ` · Started ${new Date(session.started_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`}
        </p>
      </div>
      <button
        onClick={() => onJoin(session)}
        disabled={isJoining}
        className="btn btn-sm"
        style={{ background: '#dc2626', color: 'white', border: 'none', gap: 6, flexShrink: 0, opacity: isJoining ? 0.7 : 1, minWidth: 90 }}
      >
        {isJoining ? <Loader2 size={13} className="animate-spin" /> : <PlayCircle size={13} />}
        Join Now
      </button>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────── */
export default function StudentLiveArena() {
  const { token: authToken, user } = useAuthStore();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSession, setActiveSession] = useState(null);
  const [lkToken, setLkToken] = useState('');
  const [lkUrl, setLkUrl] = useState('');
  const [inCall, setInCall] = useState(false);
  const [joining, setJoining] = useState(null);

  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [wsConnected, setWsConnected] = useState(false);
  const [chatTab, setChatTab] = useState('chat');
  const [handRaised, setHandRaised] = useState(false);
  const wsRef = useRef(null);
  const chatEndRef = useRef(null);

  const elapsed = useElapsedTimer(activeSession?.started_at, inCall);

  useEffect(() => { fetchSessions(); }, []);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);
  useEffect(() => () => { wsRef.current?.close(); }, []);

  // Auto-poll every 20s when idle
  useEffect(() => {
    if (inCall) return;
    const id = setInterval(fetchSessions, 20000);
    return () => clearInterval(id);
  }, [inCall]);

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

  const joinSession = async (session) => {
    try {
      setJoining(session.id);
      const res = await api.post(`/api/live/sessions/${session.id}/join`);
      setLkToken(res.data.token);
      setLkUrl(res.data.url);
      setInCall(true);
      setActiveSession(session);
      connectChat(session.id);
      toast.success(`Joined "${session.title}"!`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to join session');
    } finally { setJoining(null); }
  };

  const leaveClass = useCallback(() => {
    wsRef.current?.close();
    setInCall(false); setLkToken(''); setLkUrl('');
    setActiveSession(null); setChatMessages([]);
    setWsConnected(false); setHandRaised(false);
    fetchSessions();
    toast('Left the session');
  }, []);

  const sendMessage = (type = 'message', extra = {}) => {
    if (!wsRef.current || !wsConnected) return;
    if (type === 'message' && !chatInput.trim()) return;
    wsRef.current.send(JSON.stringify({ type, text: chatInput, ...extra }));
    if (type === 'message') setChatInput('');
  };

  const raiseHand = () => {
    if (!wsRef.current || !wsConnected) return;
    wsRef.current.send(JSON.stringify({ type: 'raise_hand' }));
    setHandRaised(true);
    toast.success('Hand raised! ✋');
    setTimeout(() => setHandRaised(false), 10000);
  };

  // Computed
  const liveSessions = sessions.filter(s => s.status === 'live');
  const upcomingSessions = sessions.filter(s => s.status === 'scheduled');
  const endedSessions = sessions.filter(s => s.status === 'ended').slice(0, 3);
  const nextUpcoming = upcomingSessions[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', height: '100%', overflow: 'hidden' }}>

      {/* ── HEADER ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            {inCall
              ? <><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#dc2626', boxShadow: '0 0 0 4px rgba(220,38,38,0.15)', marginLeft: 4, animation: 'pulse-ring 1.5s ease-in-out infinite' }} /><span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.1em' }}>In Session</span></>
              : <><div style={{ width: 8, height: 8, borderRadius: '50%', background: liveSessions.length > 0 ? '#dc2626' : '#cbd5e1', marginLeft: 4, animation: liveSessions.length > 0 ? 'pulse-ring 1.5s ease-in-out infinite' : 'none' }} /><span style={{ fontSize: '0.6875rem', fontWeight: 700, color: liveSessions.length > 0 ? '#dc2626' : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{liveSessions.length > 0 ? `${liveSessions.length} Live Now` : 'Campus Live'}</span></>
            }
          </div>
          <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.025em', lineHeight: 1.1 }}>
            {inCall ? activeSession?.title : 'Live Arena'}
          </h1>
          {inCall && activeSession && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6 }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>By {activeSession.teacher_name || 'Teacher'}</span>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontFamily: 'monospace', fontWeight: 600 }}>{elapsed}</span>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {inCall
            ? <button onClick={leaveClass} className="btn btn-danger" style={{ gap: 6 }}><LogOut size={14} /> Leave Class</button>
            : <button onClick={fetchSessions} disabled={loading} className="btn btn-ghost btn-sm" style={{ gap: 6 }}><RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh</button>
          }
        </div>
      </div>

      {/* ── HERO BANNER (idle, has upcoming) ── */}
      {!inCall && !loading && nextUpcoming && liveSessions.length === 0 && (
        <div className="card-brand animate-fade-up" style={{ borderRadius: 16, padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Next Live Session</p>
            <p style={{ fontSize: '1.125rem', fontWeight: 800, color: 'white' }}>{nextUpcoming.title}</p>
            <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>By {nextUpcoming.teacher_name || 'Teacher'} · {fmtDate(nextUpcoming.scheduled_at)}</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: '0.75rem 1.25rem', backdropFilter: 'blur(8px)' }}>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600, marginBottom: 2 }}>Starts</p>
            <CountdownBig targetIso={nextUpcoming.scheduled_at} />
          </div>
        </div>
      )}

      {/* ── MAIN STAGE ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.25rem', flex: 1, minHeight: 0 }}>

        {/* LEFT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: 0 }}>

          {/* Video Stage */}
          <div style={{ borderRadius: 20, overflow: 'hidden', background: '#0f172a', border: '1px solid #1e293b', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', flex: inCall ? 1 : 'none', minHeight: inCall ? 380 : 180 }}>
            {!inCall || !lkToken ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 180, gap: 10 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <VideoOff size={20} color="#334155" />
                </div>
                <p style={{ color: '#475569', fontWeight: 600, fontSize: '0.8125rem' }}>
                  {liveSessions.length > 0 ? 'Select a live session to join' : 'No active stream'}
                </p>
              </div>
            ) : (
              <LiveKitRoom video audio token={lkToken} serverUrl={lkUrl} onDisconnected={leaveClass} data-lk-theme="default" style={{ height: '100%', minHeight: 380 }}>
                <VideoConference /><RoomAudioRenderer />
              </LiveKitRoom>
            )}
          </div>

          {/* Session Discovery */}
          {!inCall && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', maxHeight: 420 }} className="hide-scrollbar">

              {/* LIVE NOW */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: '0.625rem', paddingLeft: '4px' }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#dc2626', boxShadow: '0 0 0 3px rgba(220,38,38,0.2)', flexShrink: 0, animation: liveSessions.length > 0 ? 'pulse-ring 1.5s ease-in-out infinite' : 'none' }} />
                  <p className="section-label" style={{ margin: 0, color: '#dc2626' }}>Live Now</p>
                </div>

                {loading ? (
                  <div className="skeleton" style={{ height: 74, borderRadius: 14 }} />
                ) : liveSessions.length === 0 ? (
                  <div className="card" style={{ padding: '1.125rem 1.25rem', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Radio size={16} color="var(--text-muted)" />
                    </div>
                    <div>
                      <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 2 }}>No sessions live right now</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Page refreshes every 20 seconds automatically</p>
                    </div>
                  </div>
                ) : liveSessions.map(s => (
                  <LiveCard key={s.id} session={s} onJoin={joinSession} joining={joining} />
                ))}
              </div>

              {/* UPCOMING */}
              {upcomingSessions.length > 0 && (
                <div>
                  <p className="section-label" style={{ marginBottom: '0.625rem' }}>Upcoming Sessions</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {upcomingSessions.map(s => <UpcomingCard key={s.id} session={s} />)}
                  </div>
                </div>
              )}

              {/* RECENTLY ENDED */}
              {endedSessions.length > 0 && (
                <div>
                  <p className="section-label" style={{ marginBottom: '0.625rem' }}>Recently Ended</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {endedSessions.map(s => (
                      <div key={s.id} className="card" style={{ padding: '0.875rem 1.125rem', display: 'flex', alignItems: 'center', gap: '0.875rem', opacity: 0.7 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Video size={15} color="var(--text-muted)" />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.title}</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            {s.duration_minutes != null && <><Signal size={10} /> {fmtDuration(s.duration_minutes)} ·</>} By {s.teacher_name || 'Teacher'}
                          </p>
                        </div>
                        <span className="badge badge-gray">Ended</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!loading && sessions.length === 0 && (
                <div className="card" style={{ padding: '2.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                  <BookOpen size={32} color="var(--surface-4)" />
                  <p style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>No sessions available yet</p>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Your teacher hasn't scheduled any live sessions.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT: Chat Panel */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden', padding: 0, borderRadius: 16 }}>

          {/* Panel Header */}
          <div style={{ padding: '1rem 1rem 0.75rem', borderBottom: '1px solid var(--card-border)' }}>
            <div style={{ display: 'flex', gap: 2, background: 'var(--surface-1)', borderRadius: 8, padding: 3, marginBottom: inCall ? 8 : 0 }}>
              {[['chat', MessageSquare, 'Chat'], ['roster', Users, 'Roster']].map(([key, Icon, label]) => (
                <button
                  key={key}
                  onClick={() => setChatTab(key)}
                  style={{ flex: 1, background: chatTab === key ? 'var(--card-bg)' : 'transparent', border: 'none', borderRadius: 6, padding: '6px 0', color: chatTab === key ? 'var(--text-primary)' : 'var(--text-muted)', fontSize: '0.8125rem', fontWeight: chatTab === key ? 700 : 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, boxShadow: chatTab === key ? 'var(--shadow-xs)' : 'none', transition: 'all 0.12s' }}
                >
                  <Icon size={13} />
                  {label}
                </button>
              ))}
            </div>
            {inCall && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: wsConnected ? '#16a34a' : '#e2e8f0' }} />
                <span style={{ fontSize: '0.6875rem', color: wsConnected ? '#16a34a' : 'var(--text-muted)', fontWeight: 600 }}>{wsConnected ? 'Chat live' : 'Connecting…'}</span>
              </div>
            )}
          </div>

          {chatTab === 'chat' ? (
            <>
              <div style={{ flex: 1, overflowY: 'auto', padding: '0.875rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }} className="hide-scrollbar">
                {!inCall && chatMessages.length === 0 && (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 120 }}>
                    <MessageSquare size={28} color="var(--surface-4)" />
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textAlign: 'center' }}>Join a session<br />to see the chat</p>
                  </div>
                )}
                {chatMessages.map((msg, i) => <ChatMessage key={i} msg={msg} />)}
                <div ref={chatEndRef} />
              </div>

              <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--card-border)' }}>
                <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                  <input
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                    placeholder={inCall && wsConnected ? 'Ask a question…' : 'Join a session to chat'}
                    disabled={!inCall || !wsConnected}
                    className="input"
                    style={{ fontSize: '0.875rem', padding: '0.5rem 0.75rem' }}
                  />
                  <button onClick={() => sendMessage()} disabled={!inCall || !wsConnected || !chatInput.trim()} className="btn btn-primary btn-icon" style={{ width: 36, height: 36, borderRadius: 8, flexShrink: 0 }}>
                    <Send size={14} />
                  </button>
                </div>

                {/* Student actions */}
                {inCall && wsConnected && (
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    <button
                      onClick={raiseHand}
                      disabled={handRaised}
                      className="btn btn-sm"
                      style={{ background: handRaised ? '#fffbeb' : 'var(--surface-1)', border: `1px solid ${handRaised ? '#fde68a' : 'var(--surface-3)'}`, color: handRaised ? '#d97706' : 'var(--text-muted)', gap: 5, flex: 1, opacity: handRaised ? 0.7 : 1 }}
                    >
                      <Hand size={12} /> {handRaised ? 'Hand Raised' : 'Raise Hand'}
                    </button>
                    {['👍', '❤️', '🔥'].map(emoji => (
                      <button key={emoji} onClick={() => sendMessage('reaction', { emoji })} style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-3)', borderRadius: 8, padding: '4px 8px', fontSize: '0.875rem', cursor: 'pointer' }}>{emoji}</button>
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
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                {inCall ? 'Participants are connected to this room' : 'Join a session to see participants'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Big countdown for hero banner ─────────────────────────────────────── */
function CountdownBig({ targetIso }) {
  const label = useCountdown(targetIso);
  return <p style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', fontFamily: 'monospace' }}>{label || '—'}</p>;
}
