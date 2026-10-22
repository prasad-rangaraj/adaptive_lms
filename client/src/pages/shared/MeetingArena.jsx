import { useState, useEffect } from 'react';
import { Loader2, ArrowLeft, Copy, EyeOff, ShieldCheck, Video, VideoOff, MicOff } from 'lucide-react';
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
} from '@livekit/components-react';
import '@livekit/components-styles';
import toast from 'react-hot-toast';
import { liveAPI } from '../../services/api.service';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';

export default function MeetingArena() {
  const { meetingId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const isShadow = searchParams.get('shadow') === 'true';
  const [token, setToken] = useState('');
  const [serverUrl, setServerUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // Correctly match room name without redundant meet- prefix if already structured
  const roomName = meetingId.startsWith('session-') || meetingId.startsWith('meet-')
    ? meetingId
    : `meet-${meetingId}`;

  const joinMeeting = async () => {
    try {
      setLoading(true);
      setError(false);
      const res = await liveAPI.createOrGetRoom(roomName, isShadow);
      
      setToken(res.data.token);
      setServerUrl(res.data.url);
      if (isShadow) {
        toast.success("Joined in stealth shadow mode. You are observing silently.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to connect to virtual classroom.");
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isShadow && !token && !loading) {
      // Automatically connect for seamless admin shadow observation
      joinMeeting();
    }
  }, [isShadow]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Meeting link copied!");
  };
  
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0a0d14', display: 'flex', flexDirection: 'column', zIndex: 9999 }}>
      
      {/* ── Header ── */}
      {!token && (
        <div style={{ padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.6)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <ArrowLeft size={22} />
            </button>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'white', margin: 0 }}>
                  Classroom: {meetingId}
                </h1>
                {isShadow && (
                  <span style={{ fontSize: '0.6875rem', fontWeight: 900, background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '2px 8px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <EyeOff size={11} /> SHADOW MODE
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '2px 0 0' }}>
                {isShadow ? 'Observing classroom feed in silent stealth mode' : 'Interactive WebRTC Virtual Classroom'}
              </p>
            </div>
          </div>
          <button onClick={copyLink} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 700 }}>
            <Copy size={15} /> Copy Link
          </button>
        </div>
      )}

      {/* ── Main Stage ── */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          
        {!token ? (
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#888', padding: '2rem' }}>
            <div style={{ maxWidth: 440, width: '100%', textAlign: 'center', background: 'rgba(255,255,255,0.03)', padding: '2.5rem', borderRadius: 24, border: '1px solid rgba(255,255,255,0.08)' }}>
              {isShadow ? (
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                  <EyeOff size={28} />
                </div>
              ) : (
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                  <Video size={28} />
                </div>
              )}
              
              <h2 style={{ fontSize: '1.25rem', color: 'white', fontWeight: 900, margin: '0 0 8px' }}>
                {isShadow ? 'Stealth Shadow Observation' : 'Ready to Join Classroom?'}
              </h2>
              <p style={{ fontSize: '0.8125rem', color: '#94a3b8', margin: '0 0 1.5rem', lineHeight: 1.5 }}>
                {isShadow
                  ? 'You will join the session invisibly without broadcasting video or audio. Host and participants will not be disturbed.'
                  : 'Connect audio and video devices to enter the virtual lecture space.'}
              </p>

              {error && <p style={{ color: '#ef4444', fontSize: '0.8125rem', marginBottom: '1rem' }}>Could not connect to WebRTC gateway.</p>}
              
              <button 
                onClick={joinMeeting} 
                disabled={loading} 
                style={{
                  width: '100%',
                  background: isShadow ? '#2563eb' : '#10b981',
                  color: 'white', border: 'none', padding: '14px 24px', borderRadius: 12,
                  fontSize: '0.9375rem', fontWeight: 800, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  boxShadow: isShadow ? '0 4px 18px rgba(37,99,235,0.35)' : '0 4px 18px rgba(16,185,129,0.35)'
                }}
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : (isShadow ? <EyeOff size={18} /> : <Video size={18} />)} 
                {loading ? 'Connecting to Room...' : (isShadow ? 'Enter Shadow Observation' : 'Join Classroom')}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            {/* Top Shadow Banner */}
            {isShadow && (
              <div style={{
                position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)',
                zIndex: 1000, display: 'flex', alignItems: 'center', gap: 12,
                background: 'rgba(15, 23, 42, 0.92)', backdropFilter: 'blur(12px)',
                border: '1px solid rgba(59, 130, 246, 0.45)', borderRadius: 999,
                padding: '8px 20px', color: '#93c5fd', boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
                fontSize: '0.8125rem', fontWeight: 800
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <EyeOff size={15} color="#60a5fa" />
                  <span>Stealth Shadow Mode Active</span>
                </div>
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(147, 197, 253, 0.4)' }} />
                <span style={{ fontSize: '0.75rem', color: '#bfdbfe', fontWeight: 600 }}>Mic &amp; Cam Muted (Invisible)</span>
                <button
                  onClick={() => navigate('/admin/live')}
                  style={{
                    background: 'rgba(239, 68, 68, 0.25)', border: '1px solid rgba(239, 68, 68, 0.5)',
                    color: '#fca5a5', padding: '3px 12px', borderRadius: 999, fontSize: '0.75rem',
                    cursor: 'pointer', fontWeight: 800, marginLeft: 6
                  }}
                >
                  Exit Shadow
                </button>
              </div>
            )}

            <LiveKitRoom
              video={!isShadow}
              audio={!isShadow}
              token={token}
              serverUrl={serverUrl}
              onDisconnected={() => navigate('/admin/live')}
              style={{ height: '100vh' }}
              data-lk-theme="default"
            >
              <VideoConference />
              <RoomAudioRenderer />
            </LiveKitRoom>
          </div>
        )}

      </div>
    </div>
  );
}
