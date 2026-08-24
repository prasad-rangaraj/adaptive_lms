import { useState, useEffect } from 'react';
import { Loader2, ArrowLeft, Copy } from 'lucide-react';
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
} from '@livekit/components-react';
import '@livekit/components-styles';
import toast from 'react-hot-toast';
import { liveAPI } from '../../services/api.service';
import { useParams, useNavigate } from 'react-router-dom';

export default function MeetingArena() {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  
  const [token, setToken] = useState('');
  const [serverUrl, setServerUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  
  const joinMeeting = async () => {
    try {
      setLoading(true);
      setError(false);
      // Generate a unique room name for this meeting
      const roomName = `meet-${meetingId}`;
      const res = await liveAPI.createOrGetRoom(roomName);
      
      setToken(res.data.token);
      setServerUrl(res.data.url);
    } catch (err) {
      console.error(err);
      toast.error("Failed to join meeting.");
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Meeting link copied!");
  };
  
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#111', display: 'flex', flexDirection: 'column', zIndex: 9999 }}>
      
      {/* ── Header ── */}
      {!token && (
        <div style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
              <ArrowLeft size={24} />
            </button>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white' }}>
              Meeting: {meetingId}
            </h1>
          </div>
          <button onClick={copyLink} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <Copy size={16} /> Copy Link
          </button>
        </div>
      )}

      {/* ── Main Stage ── */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>
          
        {!token ? (
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
            <h2 style={{ fontSize: '1.5rem', color: 'white', marginBottom: '2rem' }}>Ready to join?</h2>
            {error && <p style={{ color: '#ef4444', marginBottom: '1rem' }}>Could not connect to server.</p>}
            <button 
              onClick={joinMeeting} 
              disabled={loading} 
              style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '16px 32px', borderRadius: 999, fontSize: '1.125rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : null} 
              {loading ? 'Joining...' : 'Join Meeting'}
            </button>
          </div>
        ) : (
          <LiveKitRoom
            video={true}
            audio={true}
            token={token}
            serverUrl={serverUrl}
            onDisconnected={() => navigate(-1)}
            style={{ height: '100vh' }}
            data-lk-theme="default"
          >
            <VideoConference />
            <RoomAudioRenderer />
          </LiveKitRoom>
        )}

      </div>
    </div>
  );
}
