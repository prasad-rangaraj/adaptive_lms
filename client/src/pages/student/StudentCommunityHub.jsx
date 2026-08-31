import { useState } from 'react';
import {
  MessageSquare, Users, Bell, ChevronRight,
  Search, Plus, MapPin, Target, Zap, Briefcase, 
  Award, Trophy, Calendar, CheckCircle2, Star, Sparkles, Building2, Link as LinkIcon, Clock
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────
const bounties = [
  { id: 1, author: 'Priya S.',   avatar: 'P', subject: 'Data Structures', title: 'Need help optimizing this graph traversal algorithm', body: 'My current DFS implementation is hitting O(V^2) for some reason. Can someone review the snippet?', replies: 2,  bounty: 150, time: '2h ago',  solved: false, tags: ['Graphs', 'Optimization'] },
  { id: 2, author: 'Rahul M.',  avatar: 'R', subject: 'DBMS', title: 'Need handwritten notes for Unit 4 (Transactions)', body: 'I missed the entire week of classes. Offering a solid bounty for clean, readable PDF notes.', replies: 5, bounty: 300, time: '5h ago',  solved: true, tags: ['Notes Request', 'Transactions'] },
  { id: 3, author: 'Arun K.',   avatar: 'A', subject: 'Mathematics III', title: 'Laplace transform edge case doubt', body: 'How do you handle the inverse transform when the denominator has repeated complex roots?', replies: 1,  bounty: 100, time: '1d ago',  solved: false,  tags: ['Laplace', 'Calculus'] },
];

const leaderboard = [
  { rank: 1, name: 'Karthik R.', rep: 4520, badge: 'Campus Legend', avatar: 'K', color: '#f59e0b' },
  { rank: 2, name: 'Divya L.',   rep: 3890, badge: 'Expert Mentor', avatar: 'D', color: '#8b5cf6' },
  { rank: 3, name: 'Sneha P.',   rep: 2100, badge: 'Rising Star',   avatar: 'S', color: '#10b981' },
];

const synapseMatches = [
  { id: 1, name: 'Varun T.', score: 92, strong: ['DBMS', 'SQL'], weak: ['Data Structures'], reason: 'Skill Barter: You can teach him DS, he can teach you DBMS.' },
  { id: 2, name: 'Ananya K.', score: 85, strong: ['React', 'Frontend'], weak: ['Backend'], reason: 'Hackathon Synergy: Matches your exact skill gaps for the upcoming Web3 Hackathon.' },
  { id: 3, name: 'Siddharth M.', score: 78, strong: ['Mathematics III'], weak: ['OS Theory'], reason: 'Study Buddy: High alignment with your current OS Theory focus schedule.' },
];

const teamRequests = [
  { id: 1, project: 'Smart India Hackathon 2026', role: 'Full Stack Dev', lookingFor: ['React', 'Node.js', 'PostgreSQL'], by: 'Team Innovators', deadline: 'Sep 10' },
  { id: 2, project: 'Final Year Blockchain Project', role: 'Smart Contract Dev', lookingFor: ['Solidity', 'Web3.js'], by: 'Arjun & Co.', deadline: 'Oct 1' },
];

const events = [
  { id: 1, title: 'CodeSprint 2026: 24Hr Hackathon', org: 'Coding Club', date: 'Sep 15, 2026', time: '10:00 AM', venue: 'Main Auditorium', type: 'Hackathon', rsvp: true },
  { id: 2, title: 'Guest Lecture: AI in Fintech', org: 'Tech Council', date: 'Aug 28, 2026', time: '2:00 PM', venue: 'Seminar Hall 2', type: 'Lecture', rsvp: false },
  { id: 3, title: 'Annual Cultural Fest - Auditions', org: 'Cultural Committee', date: 'Sep 2, 2026', time: '4:30 PM', venue: 'Open Air Theatre', type: 'Fest', rsvp: false },
];

const clubs = [
  { name: 'GDSC (Google Developer Student Clubs)', members: 340, active: true },
  { name: 'Robotics & IoT Society', members: 120, active: false },
  { name: 'Debate & Literature Club', members: 85, active: false },
];

const alumni = [
  { id: 1, name: 'Vikram S.', batch: '2022', company: 'Google', role: 'L3 Software Engineer', offers: ['Referrals', 'Resume Review'] },
  { id: 2, name: 'Riya M.', batch: '2023', company: 'Microsoft', role: 'Product Manager', offers: ['Mock Interviews'] },
  { id: 3, name: 'Akash J.', batch: '2021', company: 'Stripe', role: 'Backend Dev', offers: ['Mentorship', 'Referrals'] },
];

// ─────────────────────────────────────────────────────────────
// Tab: Bounty Board & Exchange
// ─────────────────────────────────────────────────────────────
function BountyBoardTab() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '3rem', alignItems: 'start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--text-primary)' }}>Bounty Exchange</h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 4 }}>Help peers, solve doubts, and earn Campus Reputation.</p>
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--brand-500)', color: 'white', border: 'none', padding: '9px 18px', borderRadius: 999, fontSize: '0.8125rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(8,145,178,0.2)' }}>
            <Plus size={16} /> Place Bounty
          </button>
        </div>
        
        {bounties.map(b => (
          <div key={b.id} style={{ padding: '1.5rem', background: 'var(--surface-0)', border: '1px solid var(--surface-3)', borderRadius: 16, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand-300)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--surface-3)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--brand-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-600)', fontWeight: 900, fontSize: '1.125rem', flexShrink: 0 }}>{b.avatar}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {b.solved && <span style={{ fontSize: '0.625rem', fontWeight: 900, color: '#10b981', background: '#f0fdf4', padding: '2px 8px', borderRadius: 999, textTransform: 'uppercase' }}>✓ Solved</span>}
                    <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--text-secondary)', background: 'var(--surface-2)', padding: '2px 8px', borderRadius: 999 }}>{b.subject}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fffbeb', border: '1px solid #fde68a', padding: '4px 10px', borderRadius: 999 }}>
                    <Award size={14} color="#f59e0b" />
                    <span style={{ fontSize: '0.8125rem', fontWeight: 900, color: '#d97706' }}>{b.bounty} Rep</span>
                  </div>
                </div>
                <h3 style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1.0625rem', lineHeight: 1.3, marginBottom: '0.5rem' }}>{b.title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>{b.body}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Posted by {b.author} · {b.time}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-600)', display: 'flex', alignItems: 'center', gap: 4 }}><MessageSquare size={14} /> {b.replies} Solutions</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Right: Leaderboard */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: '2rem' }}>
        <div style={{ background: 'var(--surface-0)', border: '1px solid var(--surface-3)', borderRadius: 20, padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.5rem' }}>
            <Trophy size={20} color="#f59e0b" />
            <h3 style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-primary)' }}>Top Contributors</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {leaderboard.map(l => (
              <div key={l.rank} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 900, color: 'var(--text-muted)', width: 16 }}>#{l.rank}</span>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${l.color}15`, border: `1px solid ${l.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: l.color, fontWeight: 900, fontSize: '0.9375rem', flexShrink: 0 }}>{l.avatar}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>{l.name}</p>
                  <p style={{ fontSize: '0.6875rem', color: l.color, fontWeight: 700 }}>{l.badge}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--surface-1)', padding: '2px 8px', borderRadius: 6 }}>
                  <Award size={12} color="#f59e0b" />
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)' }}>{l.rep}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: 'var(--brand-50)', border: '1px solid var(--brand-100)', borderRadius: 20, padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--brand-500)', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Award size={20} color="white" />
          </div>
          <h3 style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--brand-700)', marginBottom: '0.5rem' }}>Your Reputation</h3>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--brand-900)', lineHeight: 1, marginBottom: '0.5rem' }}>340</h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--brand-600)', lineHeight: 1.5 }}>Rank #42 • 160 more Rep to unlock 'Rising Star' badge.</p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Tab: Synapse Matchmaking
// ─────────────────────────────────────────────────────────────
function MatchmakingTab() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '3rem', alignItems: 'start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        
        {/* Cognitive Matches */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.5rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--brand-500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={16} color="white" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--text-primary)' }}>Synapse Matches</h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>AI-suggested study partners based on your Cognitive Profile.</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {synapseMatches.map(m => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.25rem', background: 'var(--surface-0)', border: '1px solid var(--surface-3)', borderRadius: 16 }}>
                
                {/* Match Score */}
                <div style={{ position: 'relative', width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="60" height="60" viewBox="0 0 36 36" style={{ position: 'absolute' }}>
                    <path stroke="var(--surface-3)" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path stroke="#10b981" strokeWidth="3" strokeDasharray={`${m.score}, 100`} fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" style={{ strokeLinecap: 'round' }} />
                  </svg>
                  <span style={{ fontSize: '0.875rem', fontWeight: 900, color: 'var(--text-primary)' }}>{m.score}%</span>
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{m.name}</h3>
                    <button style={{ background: 'var(--brand-50)', color: 'var(--brand-600)', border: '1px solid var(--brand-100)', padding: '6px 16px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}>Connect</button>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Strong In:</span>
                      {m.strong.map(s => <span key={s} style={{ fontSize: '0.6875rem', fontWeight: 700, background: '#f0fdf4', color: '#16a34a', padding: '2px 6px', borderRadius: 4 }}>{s}</span>)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Weak In:</span>
                      {m.weak.map(w => <span key={w} style={{ fontSize: '0.6875rem', fontWeight: 700, background: '#fef2f2', color: '#ef4444', padding: '2px 6px', borderRadius: 4 }}>{w}</span>)}
                    </div>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Sparkles size={14} color="#f59e0b" /> {m.reason}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Project Teams */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--text-primary)' }}>Project & Hackathon Teams</h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Find teammates for upcoming competitions and final year projects.</p>
            </div>
            <button style={{ background: 'var(--surface-2)', border: 'none', color: 'var(--text-primary)', padding: '8px 16px', borderRadius: 8, fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer' }}>Post Request</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {teamRequests.map(t => (
              <div key={t.id} style={{ background: 'var(--surface-0)', border: '1px solid var(--surface-3)', borderRadius: 16, padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.625rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--brand-600)', background: 'var(--brand-50)', padding: '4px 8px', borderRadius: 6 }}>{t.role}</span>
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem', lineHeight: 1.4 }}>{t.project}</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>By {t.by} • Closes {t.deadline}</p>
                
                <p style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Looking For:</p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                  {t.lookingFor.map(s => <span key={s} style={{ fontSize: '0.6875rem', fontWeight: 700, background: 'var(--surface-1)', color: 'var(--text-secondary)', padding: '4px 8px', borderRadius: 4, border: '1px solid var(--surface-3)' }}>{s}</span>)}
                </div>
                
                <button style={{ width: '100%', background: 'var(--text-primary)', color: 'white', border: 'none', padding: '10px 0', borderRadius: 8, fontSize: '0.875rem', fontWeight: 800, cursor: 'pointer' }}>Apply to Team</button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Right Sidebar: Active Study Groups */}
      <div style={{ background: 'var(--surface-0)', border: '1px solid var(--surface-3)', borderRadius: 20, padding: '1.5rem', position: 'sticky', top: '2rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Casual Study Groups</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            { name: 'DS Night Owls', members: 12, mode: 'Online' },
            { name: 'DBMS Lab Squad', members: 5, mode: 'Library' }
          ].map(g => (
            <div key={g.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid var(--surface-2)' }}>
              <div>
                <p style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>{g.name}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{g.members} members • {g.mode}</p>
              </div>
              <button style={{ background: 'var(--surface-1)', border: 'none', padding: '6px 12px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', cursor: 'pointer' }}>Join</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Tab: Campus Live
// ─────────────────────────────────────────────────────────────
function CampusLiveTab() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '3rem', alignItems: 'start' }}>
      
      {/* Events Feed */}
      <div>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Upcoming Events</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {events.map(e => (
            <div key={e.id} style={{ display: 'flex', background: 'var(--surface-0)', border: '1px solid var(--surface-3)', borderRadius: 16, overflow: 'hidden' }}>
              <div style={{ width: 100, background: 'var(--brand-50)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid var(--brand-100)', flexShrink: 0, padding: '1rem' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--brand-600)', textTransform: 'uppercase' }}>{e.date.split(' ')[0]}</span>
                <span style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--brand-900)', lineHeight: 1, margin: '4px 0' }}>{e.date.split(' ')[1].replace(',', '')}</span>
              </div>
              <div style={{ padding: '1.5rem', flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.625rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', background: 'var(--surface-2)', padding: '4px 8px', borderRadius: 4, marginBottom: '0.5rem', display: 'inline-block' }}>{e.type}</span>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{e.title}</h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>By {e.org}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.75rem' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={14} /> {e.time}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={14} /> {e.venue}</p>
                  </div>
                </div>
                <button style={{ background: e.rsvp ? '#f0fdf4' : 'var(--brand-500)', color: e.rsvp ? '#10b981' : 'white', border: e.rsvp ? '1px solid #bbf7d0' : 'none', padding: '10px 24px', borderRadius: 999, fontSize: '0.875rem', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {e.rsvp ? <><CheckCircle2 size={16} /> RSVP'd</> : 'RSVP Now'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Clubs & Live Occupancy */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Live Occupancy Widget */}
        <div style={{ background: 'var(--brand-50)', border: '1px solid var(--brand-100)', borderRadius: 20, padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.5rem' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--brand-500)', boxShadow: '0 0 10px rgba(8,145,178,0.5)' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--brand-900)' }}>Campus Live Occupancy</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { loc: 'Central Library', occ: '85%', color: '#f59e0b', status: 'Filling Fast' },
              { loc: 'Innovation Lab', occ: '30%', color: '#10b981', status: 'Available' },
              { loc: 'Cafeteria', occ: '95%', color: '#ef4444', status: 'Crowded' }
            ].map(l => (
              <div key={l.loc} style={{ background: 'white', border: '1px solid var(--brand-100)', padding: '1rem', borderRadius: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--brand-900)' }}>{l.loc}</p>
                  <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: l.color }}>{l.status}</p>
                </div>
                <div style={{ width: '100%', height: 4, background: 'var(--brand-100)', borderRadius: 999 }}>
                  <div style={{ width: l.occ, height: '100%', background: l.color, borderRadius: 999 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Club Directory */}
        <div style={{ background: 'var(--surface-0)', border: '1px solid var(--surface-3)', borderRadius: 20, padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Club Directory</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {clubs.map(c => (
              <div key={c.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid var(--surface-2)' }}>
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 2 }}>{c.name}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.members} Members</p>
                </div>
                <button style={{ background: c.active ? 'var(--brand-500)' : 'var(--surface-1)', color: c.active ? 'white' : 'var(--text-secondary)', border: 'none', padding: '6px 14px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                  {c.active ? 'Apply' : 'View'}
                </button>
              </div>
            ))}
          </div>
          <button style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem', background: 'transparent', border: '1.5px dashed var(--surface-3)', color: 'var(--text-secondary)', borderRadius: 12, fontWeight: 800, fontSize: '0.8125rem', cursor: 'pointer' }}>View All 42 Clubs</button>
        </div>
      </div>

    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Tab: Alumni Network
// ─────────────────────────────────────────────────────────────
function AlumniTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: 900 }}>
      
      <div style={{ background: 'var(--brand-50)', border: '1px solid var(--brand-100)', borderRadius: 20, padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--brand-900)', marginBottom: '0.5rem' }}>Lumina Alumni Network</h2>
          <p style={{ fontSize: '0.9375rem', color: 'var(--brand-700)', maxWidth: 400, lineHeight: 1.5 }}>Connect with verified alumni in top tech companies for mentorship, mock interviews, and internal referrals.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ background: 'white', padding: '1rem 1.5rem', borderRadius: 12, border: '1px solid var(--brand-100)', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--brand-600)' }}>1.2k+</h3>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Verified Alumni</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input placeholder="Search by company, role, or name..." style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 2.75rem', background: 'var(--surface-0)', border: '1.5px solid var(--surface-3)', borderRadius: 12, color: 'var(--text-primary)', fontSize: '0.9375rem', outline: 'none' }} onFocus={e => e.target.style.borderColor = 'var(--brand-500)'} onBlur={e => e.target.style.borderColor = 'var(--surface-3)'} />
        </div>
        <select style={{ padding: '0.875rem 1rem', background: 'var(--surface-0)', border: '1.5px solid var(--surface-3)', borderRadius: 12, color: 'var(--text-primary)', fontSize: '0.9375rem', fontWeight: 700, outline: 'none', cursor: 'pointer' }}>
          <option>All Companies</option>
          <option>MAANG</option>
          <option>Startups</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {alumni.map(a => (
          <div key={a.id} style={{ background: 'var(--surface-0)', border: '1px solid var(--surface-3)', borderRadius: 16, padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'var(--brand-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '1.25rem' }}>{a.name[0]}</div>
              <div>
                <h3 style={{ fontSize: '1.0625rem', fontWeight: 900, color: 'var(--text-primary)' }}>{a.name}</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Class of {a.batch}</p>
              </div>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}><Building2 size={14} /> {a.company}</p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}><Briefcase size={14} /> {a.role}</p>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: '1.5rem', flex: 1 }}>
              {a.offers.map(o => (
                <span key={o} style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--brand-700)', background: 'var(--brand-50)', border: '1px solid var(--brand-100)', padding: '4px 10px', borderRadius: 999 }}>{o}</span>
              ))}
            </div>

            <button style={{ width: '100%', background: 'var(--surface-1)', color: 'var(--text-primary)', border: '1px solid var(--surface-3)', padding: '10px 0', borderRadius: 10, fontSize: '0.875rem', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.background = 'var(--text-primary)'; e.currentTarget.style.color = 'white'; }} onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface-1)'; e.currentTarget.style.color = 'var(--text-primary)'; }}>
              Request Connect
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Hub
// ─────────────────────────────────────────────────────────────
export default function StudentCommunityHub() {
  const [activeTab, setActiveTab] = useState('bounty');

  const tabs = [
    { id: 'bounty',  label: 'Bounty Board',       icon: Award },
    { id: 'synapse', label: 'Synapse Match',      icon: Zap },
    { id: 'campus',  label: 'Campus Live',        icon: Calendar },
    { id: 'alumni',  label: 'Alumni Network',     icon: Briefcase },
  ];

  return (
    <div style={{ position: 'relative', minHeight: '100%', paddingBottom: '3rem', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, right: '5%', width: '25vw', height: '25vw', background: 'radial-gradient(circle, rgba(16,185,129,0.04) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0, pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 10 }}>
        <div style={{ marginBottom: '2rem' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-500)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Peers · Seniors · Alumni</p>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>Community Hub</h1>

          <div style={{ display: 'flex', gap: '0.25rem', marginTop: '2rem', borderBottom: '1px solid var(--surface-3)' }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'transparent', border: 'none', cursor: 'pointer',
                  padding: '0.625rem 1rem 0.875rem', fontSize: '0.875rem', fontWeight: 700, marginBottom: '-1px',
                  color: activeTab === t.id ? 'var(--text-primary)' : 'var(--text-muted)',
                  borderBottom: activeTab === t.id ? '2px solid var(--text-primary)' : '2px solid transparent',
                  transition: 'all 0.2s',
                }}>
                <t.icon size={15} /> {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          {activeTab === 'bounty'  && <BountyBoardTab />}
          {activeTab === 'synapse' && <MatchmakingTab />}
          {activeTab === 'campus'  && <CampusLiveTab />}
          {activeTab === 'alumni'  && <AlumniTab />}
        </div>
      </div>
    </div>
  );
}
