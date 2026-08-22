import { useState } from 'react';
import { 
  CheckCircle2, Target, HeartHandshake, Users, ArrowUpRight, MessageSquare, ShieldCheck
} from 'lucide-react';

// ── Tab: Bounty Board Moderation ──────────────────────────────────────────
function BountyTab() {
  const bounties = [
    { id: 1, title: 'How does Backpropagation actually update weights in a CNN?', student: 'Alex Chen', bounty: 50, tags: ['Machine Learning', 'CNN'], answers: 3, status: 'Needs Endorsement' },
    { id: 2, title: 'I am getting O(N^2) instead of O(N log N) on Merge Sort', student: 'Sarah Jenkins', bounty: 20, tags: ['Algorithms', 'Python'], answers: 1, status: 'Needs Endorsement' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '4rem', alignItems: 'start' }}>
      
      {/* ── Left: Bounties ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Bounty Board Moderation</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Endorse correct answers to grant students bonus reputation points.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {bounties.map(bounty => (
            <div key={bounty.id} style={{ background: 'var(--surface-0)', border: '1px solid var(--surface-3)', borderRadius: 16, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.4 }}>{bounty.title}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fef3c7', padding: '4px 10px', borderRadius: 999 }}>
                  <Target size={14} color="#d97706" />
                  <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#b45309' }}>{bounty.bounty} REP</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {bounty.tags.map(t => (
                  <span key={t} style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', background: 'var(--surface-2)', padding: '4px 10px', borderRadius: 8 }}>{t}</span>
                ))}
              </div>

              {/* Best Answer Section to Endorse */}
              <div style={{ marginTop: '1rem', borderTop: '1px solid var(--surface-3)', paddingTop: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
                  <MessageSquare size={16} color="var(--text-muted)" />
                  <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>Top Answer by <span style={{ color: 'var(--brand-600)' }}>Michael Chang</span></span>
                </div>
                <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem', background: 'var(--surface-1)', padding: '1rem', borderRadius: 12 }}>
                  "Backpropagation uses the chain rule of calculus to compute the gradient of the loss function with respect to each weight..."
                </p>
                
                <button style={{ background: '#10b981', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 8, fontSize: '0.875rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShieldCheck size={16} /> Endorse Answer (Awards 2x Rep)
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* ── Right: AI Insights ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ background: 'var(--brand-50)', border: '1px solid var(--brand-100)', borderRadius: 20, padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--brand-900)', marginBottom: '1rem' }}>Top Contributors</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--brand-700)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            These students are actively helping peers in your courses.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '12px', borderRadius: 12 }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>Michael Chang</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#10b981' }}>+450 REP</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '12px', borderRadius: 12 }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>Priya Sharma</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#10b981' }}>+320 REP</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

// ── Tab: Mentorship ───────────────────────────────────────────────────────
function MentorshipTab() {
  const mentees = [
    { id: 1, name: 'David Kim', goal: 'Backend Engineering', progress: 65, nextMeeting: 'Tomorrow, 2 PM' },
    { id: 2, name: 'Sarah Jenkins', goal: 'Data Science', progress: 40, nextMeeting: 'Aug 25, 10 AM' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '4rem', alignItems: 'start' }}>
      
      {/* ── Left: Mentees ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Your Assigned Mentees</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Track their career goals and schedule 1-on-1 sessions.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {mentees.map(mentee => (
            <div key={mentee.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface-0)', border: '1px solid var(--surface-3)', borderRadius: 16, padding: '1.5rem' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1rem' }}>
                  {mentee.name.charAt(0)}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{mentee.name}</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Goal: <span style={{ fontWeight: 700 }}>{mentee.goal}</span></p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--brand-500)' }}>{mentee.progress}%</span>
              </div>

              <div style={{ display: 'flex', gap: '1rem', flexShrink: 0 }}>
                <button style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-3)', color: 'var(--text-primary)', padding: '10px 16px', borderRadius: 8, fontSize: '0.875rem', fontWeight: 800, cursor: 'pointer' }}>
                  Review Profile
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* ── Right: Incoming Requests ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ background: 'var(--surface-0)', border: '1px solid var(--surface-3)', borderRadius: 20, padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '1rem' }}>Mentorship Requests</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            2 students have requested you as their primary faculty mentor.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {['Arun Patel', 'Jessica Liu'].map(name => (
              <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--surface-2)', paddingBottom: '1rem' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>{name}</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button style={{ background: '#10b981', color: 'white', border: 'none', padding: '4px 8px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}>Accept</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}

// ── Main Hub ──────────────────────────────────────────────────────────────
export default function TeacherMentorshipHub() {
  const [activeTab, setActiveTab] = useState('bounty');

  return (
    <div style={{ position: 'relative', minHeight: '100%', paddingBottom: '4rem', overflow: 'hidden' }}>
      
      {/* ── Background Organic Orbs ── */}
      <div style={{ position: 'absolute', top: '10%', right: '10%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(217,119,6,0.04) 0%, transparent 70%)', filter: 'blur(80px)', zIndex: 0, pointerEvents: 'none' }} />
      
      <div style={{ position: 'relative', zIndex: 10 }}>

        {/* ── Editorial Header ── */}
        <div style={{ marginBottom: '2rem' }}>
          <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#d97706', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1rem' }}>
            Faculty Guidance
          </p>
          
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
            Mentorship Hub
          </h1>

          {/* Borderless Text Tabs */}
          <div style={{ display: 'flex', gap: '3rem', marginTop: '3rem', borderBottom: '1px solid var(--surface-3)' }}>
            {[
              { id: 'bounty', label: 'Bounty Board Moderation' },
              { id: 'mentorship', label: 'My Mentees' },
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
          {activeTab === 'bounty' && <BountyTab />}
          {activeTab === 'mentorship' && <MentorshipTab />}
        </div>

      </div>
    </div>
  );
}
