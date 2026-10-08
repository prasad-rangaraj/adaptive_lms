import { useState, useEffect } from 'react';
import { 
  MessageSquare, Calendar as CalendarIcon, Clock, Video, Reply, CheckCircle2, ChevronRight, Check
} from 'lucide-react';

import { communityAPI } from '../../services/api.service';

// ── Tab: Unified Inbox ──────────────────────────────────────────────────
function InboxTab() {
  const [activeMessage, setActiveMessage] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);


  const fetchMessages = () => {
    communityAPI.getTeacherInbox()
      .then(res => {
        setMessages(res.data);
        if (res.data.length > 0 && !activeMessage) setActiveMessage(res.data[0].id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleSendReply = async () => {
    if (!replyText.trim() || !activeMsgData) return;
    setIsSending(true);
    try {
      await communityAPI.sendMessage({ receiver_id: activeMsgData.sender_id, content: replyText });
      setReplyText('');
      fetchMessages();
    } catch (e) {
      console.error(e);
    }
    setIsSending(false);
  };

  const activeMsgData = messages.find(m => m.id === activeMessage);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '4rem', alignItems: 'start' }}>
      
      {/* ── Left: Message List ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Direct Messages</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
          ) : messages.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No messages</div>
          ) : messages.map(msg => (
            <div 
              key={msg.id} 
              onClick={() => setActiveMessage(msg.id)}
              style={{ background: 'var(--surface-0)', border: '1px solid', borderColor: activeMessage === msg.id ? 'var(--brand-400)' : 'var(--surface-2)', boxShadow: activeMessage === msg.id ? 'var(--shadow-md)' : 'var(--shadow-xs)', borderRadius: 12, padding: '1rem', cursor: 'pointer', transition: 'all 0.2s', position: 'relative' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: msg.unread ? 900 : 700, color: 'var(--text-primary)' }}>{msg.sender}</h3>
                  {msg.unread && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--brand-500)', flexShrink: 0 }} />}
                </div>
                <span style={{ fontSize: '0.75rem', color: msg.unread ? 'var(--brand-600)' : 'var(--text-muted)' }}>{msg.time}</span>
              </div>
              <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>{msg.course}</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{msg.subject}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right: Message Thread ── */}
      <div style={{ background: 'var(--surface-0)', border: '1px solid var(--surface-3)', borderRadius: 20, display: 'flex', flexDirection: 'column', minHeight: '500px' }}>
        
        {activeMsgData ? (
          <>
            {/* Thread Header */}
            <div style={{ padding: '2rem', borderBottom: '1px solid var(--surface-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{activeMsgData.course}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>From <span style={{ fontWeight: 700 }}>{activeMsgData.sender}</span></p>
              </div>
              <button style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-3)', padding: '8px 16px', borderRadius: 8, fontSize: '0.8125rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-primary)' }}>
                <Check size={14} /> Mark as Resolved
              </button>
            </div>

            {/* Messages */}
            <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem', overflowY: 'auto' }}>
              
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.875rem' }}>{activeMsgData.sender.charAt(0).toUpperCase()}</div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-primary)' }}>{activeMsgData.sender}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{activeMsgData.time}</span>
                  </div>
                  <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {activeMsgData.content}
                  </p>
                </div>
              </div>

            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            Select a message to view
          </div>
        )}

        {/* Reply Box */}
        <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid var(--surface-2)' }}>
          <textarea 
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write your reply..." 
            style={{ width: '100%', minHeight: '100px', padding: '1rem', background: 'var(--surface-1)', border: '1px solid var(--surface-3)', borderRadius: 12, color: 'var(--text-primary)', fontSize: '0.9375rem', resize: 'vertical', outline: 'none', marginBottom: '1rem' }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button disabled={isSending || !replyText.trim()} onClick={handleSendReply} style={{ background: 'var(--text-primary)', color: 'white', border: 'none', padding: '10px 24px', borderRadius: 8, fontSize: '0.9375rem', fontWeight: 800, cursor: isSending ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8, opacity: (isSending || !replyText.trim()) ? 0.7 : 1 }}>
              <Reply size={16} /> {isSending ? 'Sending...' : 'Send Reply'}
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}



// ── Main Hub ──────────────────────────────────────────────────────────────
export default function TeacherCommunicationHub() {
  const [activeTab, setActiveTab] = useState('inbox');

  return (
    <div style={{ position: 'relative', minHeight: '100%', paddingBottom: '4rem', overflow: 'hidden' }}>
      
      {/* ── Background Organic Orbs ── */}
      <div style={{ position: 'absolute', top: '10%', right: '10%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(59,130,246,0.04) 0%, transparent 70%)', filter: 'blur(80px)', zIndex: 0, pointerEvents: 'none' }} />
      
      <div style={{ position: 'relative', zIndex: 10 }}>

        {/* ── Editorial Header ── */}
        <div style={{ marginBottom: '2rem' }}>
          

          {/* Borderless Text Tabs */}
          <div style={{ display: 'flex', gap: '3rem', marginTop: '0', borderBottom: '1px solid var(--surface-3)' }}>
            {[
              { id: 'inbox', label: 'Unified Inbox' },
            ].map(t => (
              <button 
                key={t.id} onClick={() => setActiveTab(t.id)}
                style={{ 
                  background: 'transparent', border: 'none', cursor: 'pointer', 
                  padding: '0 0 1rem 0', 
                  fontSize: '1rem', fontWeight: 800, 
                  color: activeTab === t.id ? 'var(--text-primary)' : 'var(--text-muted)',
                  borderBottom: activeTab === t.id ? '2px solid var(--text-primary)' : '2px solid transparent',
                  transition: 'all 0.2s',
                  marginBottom: '-1px'
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab Content ── */}
        <div style={{ minHeight: '600px', paddingTop: '1rem' }}>
          {activeTab === 'inbox' && <InboxTab />}
        </div>

      </div>
    </div>
  );
}
