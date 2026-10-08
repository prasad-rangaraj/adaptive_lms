import { useState, useEffect } from 'react';
import { 
  CheckCircle2, Target, HeartHandshake, Users, ArrowUpRight, MessageSquare, ShieldCheck, Clock, Video, Calendar as CalendarIcon
} from 'lucide-react';
import { communityAPI } from '../../services/api.service';

// ── Tab: Bounty Board Moderation ──────────────────────────────────────────
function BountyTab() {
  const [bounties, setBounties] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      communityAPI.getTeacherBounties(),
      communityAPI.getLeaderboard()
    ]).then(([bountiesRes, leaderboardRes]) => {
      setBounties(bountiesRes.data);
      setLeaderboard(leaderboardRes.data.slice(0, 5)); // top 5
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '4rem', alignItems: 'start' }}>
      
      {/* ── Left: Bounties ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Bounty Board Moderation</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Endorse correct answers to grant students bonus reputation points.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
          ) : bounties.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No bounties available.</div>
          ) : bounties.map(bounty => (
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

              {/* Proposed Solution Section */}
              <div style={{ marginTop: '1rem', borderTop: '1px solid var(--surface-3)', paddingTop: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
                  <MessageSquare size={16} color="var(--text-muted)" />
                  <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>Proposed Solution</span>
                </div>
                <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem', background: 'var(--surface-1)', padding: '1rem', borderRadius: 12 }}>
                  This bounty requires teacher endorsement to award the reputation points and close out the thread.
                </p>
                
                <button 
                  onClick={async () => {
                    await communityAPI.endorseBounty(bounty.id);
                    setBounties(bounties.map(b => b.id === bounty.id ? { ...b, status: 'Solved' } : b));
                  }}
                  disabled={bounty.status === 'Solved'}
                  style={{ background: bounty.status === 'Solved' ? 'var(--surface-2)' : '#10b981', color: bounty.status === 'Solved' ? 'var(--text-muted)' : 'white', border: 'none', padding: '10px 20px', borderRadius: 8, fontSize: '0.875rem', fontWeight: 800, cursor: bounty.status === 'Solved' ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShieldCheck size={16} /> {bounty.status === 'Solved' ? 'Endorsed' : 'Endorse Answer (Awards 2x Rep)'}
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
            {leaderboard.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--brand-700)', fontSize: '0.8125rem' }}>No contributors yet.</div>
            ) : leaderboard.map(student => (
              <div key={student.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '12px', borderRadius: 12 }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>{student.name}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#10b981' }}>+{student.reputation} REP</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}

// ── Tab: Mentorship ───────────────────────────────────────────────────────
function MentorshipTab() {
  const [mentees, setMentees] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMentees = () => {
    setLoading(true);
    communityAPI.getTeacherMentees()
      .then(res => setMentees(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMentees();
  }, []);

  const activeMentees = mentees.filter(m => m.status === 'active');
  const pendingRequests = mentees.filter(m => m.status === 'pending');

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '3rem', alignItems: 'start' }}>
      
      {/* ── Left: Mentees ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Your Assigned Mentees</h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Track their career goals and schedule 1-on-1 sessions.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
          ) : activeMentees.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No assigned mentees.</div>
          ) : activeMentees.map(mentee => (
            <div key={mentee.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface-0)', border: '1px solid var(--surface-3)', borderRadius: 12, padding: '1.25rem' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.875rem' }}>
                  {mentee.name.charAt(0)}
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{mentee.name}</h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Goal: <span style={{ fontWeight: 700 }}>{mentee.goal}</span></p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--brand-500)' }}>{mentee.progress}%</span>
              </div>

              <div style={{ display: 'flex', gap: '1rem', flexShrink: 0 }}>
                <button style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-3)', color: 'var(--text-primary)', padding: '8px 12px', borderRadius: 8, fontSize: '0.8125rem', fontWeight: 800, cursor: 'pointer' }}>
                  Review Profile
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* ── Right: Incoming Requests ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ background: 'var(--surface-0)', border: '1px solid var(--surface-3)', borderRadius: 16, padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Mentorship Requests</h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
            {pendingRequests.length} student{pendingRequests.length !== 1 ? 's' : ''} requested you as their primary faculty mentor.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {pendingRequests.length === 0 ? (
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>No pending requests.</p>
            ) : pendingRequests.map(req => (
              <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--surface-2)', paddingBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--text-primary)' }}>{req.name}</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button 
                    onClick={async () => {
                      await communityAPI.acceptMentorship(req.id);
                      fetchMentees();
                    }}
                    style={{ background: '#10b981', color: 'white', border: 'none', padding: '4px 8px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}>Accept</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}

// ── Tab 3: Office Hours Scheduler ─────────────────────────────────────────
function OfficeHoursTab() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    communityAPI.getTeacherOfficeHours()
      .then(res => setBookings(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading bookings...</div>
          ) : bookings.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No upcoming bookings</div>
          ) : bookings.map(b => (
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
export default function TeacherMentorshipHub() {
  const [activeTab, setActiveTab] = useState('bounty');

  return (
    <div style={{ position: 'relative', minHeight: '100%', paddingBottom: '4rem', overflow: 'hidden' }}>
      
      {/* ── Background Organic Orbs ── */}
      <div style={{ position: 'absolute', top: '10%', right: '10%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(217,119,6,0.04) 0%, transparent 70%)', filter: 'blur(80px)', zIndex: 0, pointerEvents: 'none' }} />
      
      <div style={{ position: 'relative', zIndex: 10 }}>

        {/* ── Editorial Header ── */}
        <div style={{ marginBottom: '2rem' }}>
          

          {/* Borderless Text Tabs */}
          <div style={{ display: 'flex', gap: '3rem', marginTop: '0', borderBottom: '1px solid var(--surface-3)' }}>
            {[
              { id: 'bounty', label: 'Bounty Board Moderation' },
              { id: 'mentorship', label: 'My Mentees' },
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
          {activeTab === 'bounty' && <BountyTab />}
          {activeTab === 'mentorship' && <MentorshipTab />}
          {activeTab === 'office_hours' && <OfficeHoursTab />}
        </div>

      </div>
    </div>
  );
}
