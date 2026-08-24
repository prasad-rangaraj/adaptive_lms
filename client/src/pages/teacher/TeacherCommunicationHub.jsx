import { useState } from 'react';
import { 
  MessageSquare, Calendar as CalendarIcon, Clock, Video, Reply, CheckCircle2, ChevronRight, Check
} from 'lucide-react';

// ── Tab: Unified Inbox ────────────────────────────────────────────────────
function InboxTab() {
  const [activeMessage, setActiveMessage] = useState(1);

  const messages = [
    { id: 1, sender: 'Alex Chen', course: 'Advanced Machine Learning', subject: 'Question regarding Assignment 2', time: '10:42 AM', unread: true },
    { id: 2, sender: 'Sarah Jenkins', course: 'Data Structures 101', subject: 'Sick leave approval needed', time: 'Yesterday', unread: false },
    { id: 3, sender: 'Michael Chang', course: 'Mentorship', subject: 'Career advice: Startup vs Big Tech', time: 'Aug 20', unread: false },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '4rem', alignItems: 'start' }}>
      
      {/* ── Left: Message List ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Direct Messages</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {messages.map(msg => (
            <div 
              key={msg.id} 
              onClick={() => setActiveMessage(msg.id)}
              style={{ background: activeMessage === msg.id ? 'var(--surface-1)' : 'transparent', border: '1px solid', borderColor: activeMessage === msg.id ? 'var(--surface-3)' : 'transparent', borderRadius: 12, padding: '1rem', cursor: 'pointer', transition: 'all 0.2s', position: 'relative' }}
            >
              {msg.unread && <div style={{ position: 'absolute', top: 16, right: 16, width: 8, height: 8, borderRadius: '50%', background: 'var(--brand-500)' }} />}
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.25rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: msg.unread ? 900 : 700, color: 'var(--text-primary)' }}>{msg.sender}</h3>
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
        
        {/* Thread Header */}
        <div style={{ padding: '2rem', borderBottom: '1px solid var(--surface-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Question regarding Assignment 2</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>From <span style={{ fontWeight: 700 }}>Alex Chen</span> • Advanced Machine Learning</p>
          </div>
          <button style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-3)', padding: '8px 16px', borderRadius: 8, fontSize: '0.8125rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-primary)' }}>
            <Check size={14} /> Mark as Resolved
          </button>
        </div>

        {/* Messages */}
        <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem', overflowY: 'auto' }}>
          
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.875rem' }}>A</div>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-primary)' }}>Alex Chen</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>10:42 AM</span>
              </div>
              <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Hi Professor, I was looking at the requirements for Assignment 2. Are we allowed to use PyTorch Lightning for the training loop, or do we need to write the raw PyTorch training loop from scratch?
              </p>
            </div>
          </div>

        </div>

        {/* Reply Box */}
        <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid var(--surface-2)' }}>
          <textarea 
            placeholder="Write your reply..." 
            style={{ width: '100%', minHeight: '100px', padding: '1rem', background: 'var(--surface-1)', border: '1px solid var(--surface-3)', borderRadius: 12, color: 'var(--text-primary)', fontSize: '0.9375rem', resize: 'vertical', outline: 'none', marginBottom: '1rem' }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button style={{ background: 'var(--text-primary)', color: 'white', border: 'none', padding: '10px 24px', borderRadius: 8, fontSize: '0.9375rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Reply size={16} /> Send Reply
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}

// ── Tab: Office Hours ─────────────────────────────────────────────────────
function OfficeHoursTab() {
  const bookings = [
    { id: 1, student: 'Michael Chang', topic: 'Mentorship 1-on-1', time: '2:00 PM - 2:15 PM', status: 'upcoming' },
    { id: 2, student: 'Priya Sharma', topic: 'Project Architecture Review', time: '2:30 PM - 2:45 PM', status: 'upcoming' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '4rem', alignItems: 'start' }}>
      
      {/* ── Left: Scheduler & Rules ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Office Hours Configuration</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Set your availability. Students can automatically book open slots.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'var(--surface-0)', border: '1px solid var(--surface-3)', borderRadius: 20, padding: '2rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1.5rem', borderBottom: '1px solid var(--surface-2)' }}>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Weekly Availability</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Tuesdays & Thursdays, 2 PM - 4 PM</p>
            </div>
            <button style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-3)', padding: '8px 16px', borderRadius: 8, fontSize: '0.8125rem', fontWeight: 800, cursor: 'pointer' }}>Edit Rules</button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1.5rem', borderBottom: '1px solid var(--surface-2)' }}>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Slot Duration</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>15 minutes</p>
            </div>
            <button style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-3)', padding: '8px 16px', borderRadius: 8, fontSize: '0.8125rem', fontWeight: 800, cursor: 'pointer' }}>Edit Duration</button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Meeting Location</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Lumina Built-in Video Conf</p>
            </div>
            <button style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-3)', padding: '8px 16px', borderRadius: 8, fontSize: '0.8125rem', fontWeight: 800, cursor: 'pointer' }}>Edit Location</button>
          </div>

        </div>
      </div>

      {/* ── Right: Today's Schedule ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        <div style={{ background: 'var(--brand-50)', border: '1px solid var(--brand-100)', borderRadius: 20, padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.5rem' }}>
            <CalendarIcon size={20} color="var(--brand-600)" />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--brand-900)' }}>Today's Bookings</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {bookings.map(b => (
              <div key={b.id} style={{ background: 'white', borderRadius: 12, padding: '1rem', border: '1px solid var(--brand-100)' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--brand-600)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: '0.5rem' }}>
                  <Clock size={12} /> {b.time}
                </p>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{b.student}</h4>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>{b.topic}</p>
                <button onClick={() => window.location.href = `/meet/booking-${b.id}`} style={{ width: '100%', background: 'var(--brand-500)', color: 'white', border: 'none', padding: '8px', borderRadius: 8, fontSize: '0.8125rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <Video size={14} /> Join Meeting
                </button>
              </div>
            ))}
            
            {bookings.length === 0 && (
              <p style={{ fontSize: '0.875rem', color: 'var(--brand-700)', textAlign: 'center', padding: '1rem 0' }}>No bookings for today.</p>
            )}
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
          <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#3b82f6', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1rem' }}>
            Faculty Inbox & Calendar
          </p>
          
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
            Communications Hub
          </h1>

          {/* Borderless Text Tabs */}
          <div style={{ display: 'flex', gap: '3rem', marginTop: '3rem', borderBottom: '1px solid var(--surface-3)' }}>
            {[
              { id: 'inbox', label: 'Unified Inbox' },
              { id: 'office_hours', label: 'Office Hours Scheduler' },
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
          {activeTab === 'office_hours' && <OfficeHoursTab />}
        </div>

      </div>
    </div>
  );
}
