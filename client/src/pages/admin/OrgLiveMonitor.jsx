import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { liveAPI } from '../../services/api.service';
import { 
  Video, Users, Search, ShieldCheck, EyeOff, Radio, RefreshCw, Clock, 
  PlayCircle, StopCircle, Zap, ShieldAlert, Sparkles, CheckCircle2, AlertCircle
} from 'lucide-react';
import Loader from '../../components/ui/Loader';
import toast from 'react-hot-toast';

function ActiveRoomsTab() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [launchingTest, setLaunchingTest] = useState(false);
  const [stoppingId, setStoppingId] = useState(null);

  const { data: rawSessions = [], isLoading, refetch } = useQuery({
    queryKey: ['adminLiveSessions'],
    queryFn: () => liveAPI.listSessions().then(res => res.data),
    refetchInterval: 8000, // 8s auto-refresh for live status
  });

  const sessions = Array.isArray(rawSessions) ? rawSessions : [];
  const liveSessions = sessions.filter(s => s.status === 'live');
  const scheduledSessions = sessions.filter(s => s.status === 'scheduled');
  const endedSessions = sessions.filter(s => s.status === 'ended');
  
  const filtered = sessions.filter(s => {
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    if (search && !s.title?.toLowerCase().includes(search.toLowerCase()) && !s.teacher_name?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleJoin = (session, silent = false) => {
    const targetRoom = session.room_name || `session-${session.id}`;
    if (silent) {
      toast.success(`Entering stealth shadow mode for "${session.title}"...`);
      navigate(`/meet/${targetRoom}?shadow=true`);
    } else {
      toast.success(`Connecting to virtual classroom "${session.title}"...`);
      navigate(`/meet/${targetRoom}`);
    }
  };

  const handleLaunchSandbox = async () => {
    try {
      setLaunchingTest(true);
      const title = `Sandbox Lecture • ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      const res = await liveAPI.createSession({
        title,
        description: "Ad-hoc live classroom spawned by Admin for live monitoring and shadow observation testing.",
      });
      await liveAPI.startSession(res.data.id);
      toast.success("Active live classroom launched! Session is now LIVE.");
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to launch live classroom");
    } finally {
      setLaunchingTest(false);
    }
  };

  const handleStartSession = async (sessionId, title) => {
    try {
      await liveAPI.startSession(sessionId);
      toast.success(`Classroom "${title || sessionId}" is now LIVE!`);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to start broadcast");
    }
  };

  const handleEndSession = async (sessionId, title) => {
    if (!window.confirm(`Force terminate live broadcast for "${title}"?`)) return;
    try {
      setStoppingId(sessionId);
      await liveAPI.endSession(sessionId);
      toast.success(`Broadcast for "${title}" ended.`);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to end broadcast");
    } finally {
      setStoppingId(null);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'flex-start' }}>
      <div className="glass-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: '0.6875rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '2px 8px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Radio size={11} className="animate-pulse" /> Live Telemetry
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                {liveSessions.length} Online • {scheduledSessions.length} Scheduled
              </span>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
              Live Operations Control Room
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
              Real-time audit &amp; silent shadow inspection across institution WebRTC rooms.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Status Pills */}
            <div style={{ display: 'flex', background: 'var(--surface-0)', padding: 3, borderRadius: 10, border: '1px solid var(--glass-border)', gap: 2 }}>
              {[
                { id: 'all', label: `All (${sessions.length})` },
                { id: 'live', label: `Live (${liveSessions.length})` },
                { id: 'scheduled', label: `Scheduled (${scheduledSessions.length})` },
                { id: 'ended', label: `Ended (${endedSessions.length})` },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setStatusFilter(f.id)}
                  style={{
                    padding: '5px 12px', borderRadius: 8, border: 'none',
                    background: statusFilter === f.id ? 'var(--brand-600)' : 'transparent',
                    color: statusFilter === f.id ? 'white' : 'var(--text-muted)',
                    fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.15s'
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search session or instructor..." 
                style={{ padding: '0.5rem 1rem 0.5rem 2.25rem', borderRadius: 10, border: '1px solid var(--glass-border)', background: 'var(--surface-0)', outline: 'none', color: 'var(--text-primary)', fontSize: '0.8125rem', minWidth: 200 }} 
              />
            </div>
            
            <button 
              onClick={handleLaunchSandbox}
              disabled={launchingTest}
              className="btn btn-primary"
              style={{ fontSize: '0.8125rem', gap: 6, padding: '0.5rem 1rem' }}
              title="Spawn an ad-hoc live classroom to test video streaming and shadow mode"
            >
              <Zap size={14} /> {launchingTest ? 'Spawning Room...' : 'Launch Test Room'}
            </button>

            <button onClick={() => refetch()} className="btn btn-secondary btn-icon" title="Refresh Live Streams">
              <RefreshCw size={15} />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div style={{ padding: '4rem', textAlign: 'center' }}><Loader text="Scanning WebRTC gateways..." /></div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', background: 'var(--surface-0)', borderRadius: 20, border: '1px dashed var(--glass-border)' }}>
            <Video size={42} style={{ margin: '0 auto 12px', color: 'var(--text-muted)', opacity: 0.4 }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px' }}>No Active Classrooms</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0 0 1.5rem', maxWidth: 440, marginLeft: 'auto', marginRight: 'auto' }}>
              Instructors have not launched any live streams at this moment. You can launch a sandbox classroom to test LiveKit broadcasting and stealth shadow observation.
            </p>
            <button 
              onClick={handleLaunchSandbox} 
              disabled={launchingTest}
              className="btn btn-primary"
              style={{ gap: 8, margin: '0 auto' }}
            >
              <Zap size={15} /> {launchingTest ? 'Starting Stream...' : 'Launch Test Classroom Now'}
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {filtered.map(room => {
              const isLive = room.status === 'live';
              return (
                <div 
                  key={room.id} 
                  style={{ 
                    display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.35rem', 
                    background: 'var(--surface-0)', 
                    border: `1.5px solid ${isLive ? 'rgba(239, 68, 68, 0.4)' : 'var(--glass-border)'}`, 
                    borderRadius: 16, 
                    boxShadow: isLive ? '0 8px 25px rgba(239, 68, 68, 0.12)' : 'none' 
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        {isLive ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.6875rem', fontWeight: 900, color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '2px 8px', borderRadius: 999, border: '1px solid rgba(239, 68, 68, 0.25)' }}>
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', animation: 'pulse 1.5s infinite' }} /> LIVE
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.6875rem', fontWeight: 800, color: 'var(--text-muted)', background: 'var(--surface-1)', padding: '2px 8px', borderRadius: 999 }}>
                            <Clock size={10} /> {room.status}
                          </span>
                        )}
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                          Room #{room.id}
                        </span>
                      </div>
                      <p style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.9375rem', margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {room.title}
                      </p>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>
                        Host: <strong>{room.teacher_name || 'Instructor'}</strong>
                      </p>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--glass-border)', paddingTop: '0.875rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)', fontSize: '0.8125rem', fontWeight: 700 }}>
                        <Users size={14} color="var(--brand-500)" /> {room.attendee_count || 1} Present
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)', fontSize: '0.8125rem', fontWeight: 700 }}>
                        <Clock size={14} /> {room.duration_minutes ? `${room.duration_minutes}m` : 'Active'}
                      </div>
                    </div>

                    {isLive && (
                      <button
                        onClick={() => handleEndSession(room.id, room.title)}
                        disabled={stoppingId === room.id}
                        className="btn btn-ghost btn-sm"
                        style={{ color: '#ef4444', fontSize: '0.75rem', padding: '4px 8px', gap: 4 }}
                        title="Force end broadcast"
                      >
                        <StopCircle size={13} /> End
                      </button>
                    )}
                  </div>

                  {/* Actions: Join Room vs Shadow Mode */}
                  <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
                    {!isLive && room.status === 'scheduled' && (
                      <button 
                        onClick={() => handleStartSession(room.id, room.title)}
                        className="btn btn-secondary" 
                        style={{ padding: '8px 12px', fontSize: '0.8125rem', fontWeight: 800, gap: 6, justifyContent: 'center', borderRadius: 10, color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.4)' }}
                        title="Broadcast this scheduled room immediately"
                      >
                        <Radio size={14} color="#10b981" /> Go Live
                      </button>
                    )}
                    <button 
                      onClick={() => handleJoin(room, false)}
                      className="btn btn-secondary" 
                      style={{ flex: 1, padding: '8px 12px', fontSize: '0.8125rem', fontWeight: 800, gap: 6, justifyContent: 'center', borderRadius: 10 }}
                      title="Enter virtual room as an active admin participant"
                    >
                      <Video size={14} /> Join Room
                    </button>
                    <button 
                      onClick={() => handleJoin(room, true)}
                      className="btn btn-primary" 
                      style={{ 
                        flex: 1, padding: '8px 12px', fontSize: '0.8125rem', fontWeight: 800, gap: 6, 
                        justifyContent: 'center', background: '#2563eb', border: 'none', borderRadius: 10,
                        boxShadow: '0 4px 14px rgba(37,99,235,0.3)'
                      }}
                      title="Join in invisible observation mode without broadcasting camera or audio"
                    >
                      <EyeOff size={14} /> Shadow
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Right Sidebar: Infrastructure Status & Shadow Protocol */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: 6 }}>
            <ShieldCheck size={16} color="#10b981" /> Live Infrastructure
          </h3>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 900, color: liveSessions.length ? '#ef4444' : 'var(--text-primary)', lineHeight: 1 }}>
              {liveSessions.length}
            </span>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              Active Classrooms
            </span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.8125rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>WebRTC Engine:</span>
              <strong style={{ color: '#10b981' }}>LiveKit Cloud SFU</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Encryption:</span>
              <strong style={{ color: 'var(--text-primary)' }}>DTLS-SRTP E2EE</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Total Scheduled:</span>
              <strong style={{ color: 'var(--text-primary)' }}>{scheduledSessions.length}</strong>
            </div>
          </div>

          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
            LiveKit WebRTC gateway is operational. All audio/video channels are encrypted with sub-50ms latency.
          </p>
        </div>

        {/* Shadow Mode Protocol Explanation */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(37,99,235,0.08), rgba(99,102,241,0.08))',
          borderRadius: 20, padding: '1.75rem', border: '1px solid rgba(59,130,246,0.3)',
          display: 'flex', flexDirection: 'column', gap: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: '#2563eb', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <EyeOff size={16} />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                Shadow Mode Protocol
              </h4>
              <span style={{ fontSize: '0.6875rem', color: '#2563eb', fontWeight: 800 }}>Stealth Audit Active</span>
            </div>
          </div>
          
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
            When joining in <strong>Shadow</strong> mode, the administrator's camera and microphone are disconnected at the WebRTC signaling layer, rendering the inspection invisible to both instructors and students.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={13} color="#10b981" /> No audio broadcast
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={13} color="#10b981" /> No camera stream transmitted
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={13} color="#10b981" /> Isolated from participant roster
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrgLiveMonitor() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <ActiveRoomsTab />
    </div>
  );
}
