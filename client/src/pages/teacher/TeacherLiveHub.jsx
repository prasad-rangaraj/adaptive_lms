import { useState } from 'react';
import { 
  Video, Mic, MicOff, VideoOff, Settings, Users, MessageSquare, ScreenShare,
  Disc, CircleDot, PlayCircle, MoreHorizontal, ArrowRight
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function TeacherLiveHub() {
  const { user } = useAuthStore();
  const [isLive, setIsLive] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  
  return (
    <div style={{ position: 'relative', minHeight: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      
      {/* ── Background Organic Orbs ── */}
      <div style={{ position: 'absolute', top: '0%', left: '30%', width: '30vw', height: '30vw', background: 'radial-gradient(circle, rgba(239,68,68,0.05) 0%, transparent 70%)', filter: 'blur(80px)', zIndex: 0, pointerEvents: 'none' }} />
      
      <div style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* ── Editorial Header ── */}
        <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem' }}>
          
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--brand-500)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Live Broadcast</p>
              {isLive && <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.6875rem', fontWeight: 800, color: 'white', background: '#ef4444', padding: '2px 8px', borderRadius: 999, animation: 'pulse 2s infinite' }}><CircleDot size={10} /> LIVE</span>}
            </div>
            <h1 style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.04em', lineHeight: 1.05 }}>
              Neural Networks Q&A
            </h1>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, padding: 0 }}>
              <Settings size={18} /> Stream Settings
            </button>
            {!isLive ? (
              <button onClick={() => setIsLive(true)} style={{ background: '#10b981', color: 'white', border: 'none', padding: '12px 24px', borderRadius: 999, fontSize: '0.9375rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
                <PlayCircle size={16} /> Go Live
              </button>
            ) : (
              <button onClick={() => setIsLive(false)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '12px 24px', borderRadius: 999, fontSize: '0.9375rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
                End Broadcast
              </button>
            )}
          </div>
        </div>

        {/* ── Main Stage (Borderless Split) ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '4rem', flex: 1, minHeight: 0 }}>
          
          {/* Left: Video Feed */}
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, paddingBottom: '2rem' }}>
            
            <div style={{ flex: 1, borderRadius: '32px', overflow: 'hidden', position: 'relative', background: '#111', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
              
              {/* Fake Video Feed */}
              {camOn ? (
                 <img src="https://images.unsplash.com/photo-1573164713988-8665fc963095?w=1200&q=80" alt="Teacher Cam" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                 <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#444' }}><VideoOff size={64} /></div>
              )}

              {/* Floating Controls Overlay (Glass Pill) */}
              <div style={{ position: 'absolute', bottom: '2rem', left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
                <div style={{ display: 'flex', gap: '1rem', background: 'rgba(20,20,20,0.4)', backdropFilter: 'blur(20px)', padding: '0.75rem 1.5rem', borderRadius: 999, border: '1px solid rgba(255,255,255,0.05)' }}>
                  
                  <button onClick={() => setMicOn(!micOn)} style={{ width: 48, height: 48, borderRadius: '50%', background: micOn ? 'rgba(255,255,255,0.1)' : '#ef4444', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}>
                    {micOn ? <Mic size={20} /> : <MicOff size={20} />}
                  </button>
                  <button onClick={() => setCamOn(!camOn)} style={{ width: 48, height: 48, borderRadius: '50%', background: camOn ? 'rgba(255,255,255,0.1)' : '#ef4444', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}>
                    {camOn ? <Video size={20} /> : <VideoOff size={20} />}
                  </button>
                  
                  <div style={{ width: 1, height: 48, background: 'rgba(255,255,255,0.1)' }} />
                  
                  <button style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}>
                    <ScreenShare size={20} />
                  </button>
                  <button style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}>
                    <Disc size={20} />
                  </button>
                  <button style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}>
                    <MoreHorizontal size={20} />
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Right: Borderless Chat/Attendees */}
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, paddingBottom: '2rem' }}>
            
            <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid var(--surface-3)' }}>
              <button style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', borderBottom: '2px solid var(--text-primary)', padding: '0 0 1rem 0', marginBottom: '-1px', fontSize: '0.9375rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                <MessageSquare size={16} /> Chat
              </button>
              <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', borderBottom: '2px solid transparent', padding: '0 0 1rem 0', marginBottom: '-1px', fontSize: '0.9375rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Users size={16} /> Roster <span style={{ color: 'var(--brand-500)' }}>124</span>
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', paddingTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="hide-scrollbar">
              
              {/* Chat Timeline */}
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, flexShrink: 0 }}>JS</div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: 2 }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>John Smith</span>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)' }}>10:45 AM</span>
                  </div>
                  <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>Could you explain the backpropagation part again?</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, flexShrink: 0 }}>AC</div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: 2 }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>Alex Chen</span>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)' }}>10:46 AM</span>
                  </div>
                  <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>I think it's updating weights backwards through the layers.</p>
                </div>
              </div>

            </div>

            {/* Borderless Chat Input */}
            <div style={{ marginTop: '1rem', borderTop: '1px solid var(--surface-3)', paddingTop: '1.5rem', position: 'relative' }}>
               <input 
                 placeholder="Send a message..." 
                 style={{ width: '100%', padding: '0.75rem 0', background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 500 }} 
               />
               <button style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', background: 'var(--text-primary)', color: 'white', border: 'none', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                 <ArrowRight size={16} />
               </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
