import { useAuthStore } from '../../store/authStore';
import { Flame, Sparkles, ArrowRight, ChevronRight, Play, AlertCircle, Clock, CheckCircle2, FileText, Calendar } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const recentItems = [
  { id: 1, type: 'video', title: 'AVL Tree Rotations', course: 'Data Structures', progress: 85, timeleft: '2 mins left', img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80', color: '#4f46e5' },
  { id: 2, type: 'pdf', title: 'Unit 2: Normalization Notes', course: 'DBMS', progress: 45, timeleft: 'Page 12 of 28', img: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&q=80', color: '#0891b2' },
  { id: 3, type: 'video', title: 'Process Scheduling', course: 'OS Theory', progress: 10, timeleft: '42 mins left', img: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80', color: '#7c3aed' },
];

const path = [
  { step: 1, type: 'urgent_exam', title: 'CA1 Exam: Data Structures', course: 'Tomorrow 9:00 AM', done: false, active: true },
  { step: 2, type: 'assignment', title: 'Submit DBMS Mini Project', course: 'Due Today 11:59 PM', done: false, active: false, warning: true },
  { step: 3, type: 'video', title: 'Watch: B-Trees (Important for CA1)', course: 'Data Structures', done: false, active: false },
  { step: 4, type: 'quiz', title: 'Practice: Tree Traversals', course: 'Data Structures', done: false, active: false },
  { step: 5, type: 'live', title: 'Live Revision: OS Theory', course: 'Today 5:00 PM', done: false, active: false },
];

const typeColors = { video: '#4f46e5', quiz: '#0891b2', live: '#f59e0b', assignment: '#ef4444', urgent_exam: '#ef4444' };

export default function StudentNexus() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening';

  return (
    <div style={{ position: 'relative', minHeight: '100%', paddingBottom: '3rem', overflow: 'hidden' }}>

      {/* ── Organic Background Orbs ── */}
      <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(79,70,229,0.05) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '40%', right: '0', width: '25vw', height: '25vw', background: 'radial-gradient(circle, rgba(14,116,144,0.04) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0, pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 10 }}>

        {/* ── Header Row ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-500)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              {greeting}, {user?.full_name?.split(' ')[0] || 'Scholar'}
            </p>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
              Your Learning <span style={{ color: 'var(--text-muted)' }}>Nexus.</span>
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            {/* Streak */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b, #ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Flame size={18} color="white" />
              </div>
              <div>
                <p style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>12</p>
                <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', marginTop: 2 }}>Day Streak</p>
              </div>
            </div>
            <button onClick={() => navigate('/student/ai-tutor')} style={{ background: 'var(--text-primary)', color: 'white', border: 'none', padding: '9px 18px', borderRadius: 999, fontSize: '0.875rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={15} /> Ask AI Tutor
            </button>
          </div>
        </div>

        {/* ── Academic Pulse Strip ── */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 12, padding: '0.875rem 1.25rem', background: 'var(--surface-0)', border: '1px solid var(--surface-3)', borderRadius: 14 }}>
            <Calendar size={18} color="var(--brand-500)" />
            <div>
              <p style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Next Class</p>
              <p style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>OS Theory · 10:00 AM</p>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 12, padding: '0.875rem 1.25rem', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 14 }}>
            <Clock size={18} color="#d97706" />
            <div>
              <p style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Urgent Deadline</p>
              <p style={{ fontSize: '0.875rem', fontWeight: 800, color: '#92400e' }}>DBMS Project · Due Today</p>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 12, padding: '0.875rem 1.25rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 14 }}>
            <AlertCircle size={18} color="#ef4444" />
            <div>
              <p style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Attendance Warning</p>
              <p style={{ fontSize: '0.875rem', fontWeight: 800, color: '#991b1b' }}>Maths III · 72% (Danger)</p>
            </div>
          </div>
        </div>

        {/* ── Main 2-Column Layout ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '3rem', alignItems: 'start' }}>

          {/* LEFT: Pick up where you left off */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', minWidth: 0 }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)' }}>Pick Up Where You Left Off</h2>
              <button style={{ background: 'transparent', border: 'none', color: 'var(--brand-600)', fontSize: '0.8125rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', padding: 0 }}>All Courses <ChevronRight size={14} /></button>
            </div>

            {/* Recent Items Stack */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recentItems.map(item => (
                <Link key={item.id} to={`/student/course/${item.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{ borderRadius: 20, overflow: 'hidden', position: 'relative', height: '120px', cursor: 'pointer', flexShrink: 0, border: '1px solid var(--surface-3)' }}>
                    <img src={item.img} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease', opacity: 0.85 }}
                      onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                      onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 40%, transparent 100%)' }} />

                    <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '1.5rem', right: '7rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.375rem' }}>
                        {item.type === 'video' ? <Play size={14} color="var(--brand-300)" /> : <FileText size={14} color="#0891b2" />}
                        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{item.course}</p>
                      </div>
                      <h3 style={{ color: 'white', fontSize: '1rem', fontWeight: 800, lineHeight: 1.25, marginBottom: '0.625rem' }}>{item.title}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ height: 4, borderRadius: 999, background: 'rgba(255,255,255,0.2)', width: '60%' }}>
                          <div style={{ width: `${item.progress}%`, height: '100%', background: 'white', borderRadius: 999 }} />
                        </div>
                        <span style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.8)', fontWeight: 700 }}>{item.timeleft}</span>
                      </div>
                    </div>

                    <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: '1.5rem', width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                      <ChevronRight size={18} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Quick Links */}
            <div style={{ display: 'flex', gap: '1.5rem', paddingTop: '0.5rem' }}>
              <button onClick={() => navigate('/student/cognitive')} style={{ background: 'transparent', border: 'none', padding: 0, color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                Cognitive Profile <ArrowRight size={16} color="var(--brand-500)" />
              </button>
              <button onClick={() => navigate('/student/academic')} style={{ background: 'transparent', border: 'none', padding: 0, color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                Academic Hub <ArrowRight size={16} color="var(--brand-500)" />
              </button>
            </div>
          </div>

          {/* RIGHT: Today's Path Timeline */}
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-primary)' }}>Today's Path</h2>
              <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#ef4444', background: '#fef2f2', border: '1px solid #fecaca', padding: '3px 8px', borderRadius: 999, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Flame size={12} /> Exam Mode
              </span>
            </div>

            <div style={{ position: 'relative', paddingLeft: '1.5rem' }}>
              <div style={{ position: 'absolute', top: 6, bottom: 6, left: '5px', width: 2, background: 'linear-gradient(to bottom, var(--brand-500) 40%, var(--surface-3) 100%)' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {path.map((item) => (
                  <div key={item.step} style={{ position: 'relative', opacity: item.done ? 0.45 : 1 }}>
                    <div style={{ position: 'absolute', left: '-1.5rem', width: 12, height: 12, borderRadius: '50%', background: item.done ? 'var(--surface-4)' : item.active ? typeColors[item.type] : 'var(--surface-1)', border: `2px solid ${item.done ? 'var(--surface-4)' : typeColors[item.type]}`, top: 4 }} />

                    <div style={{ padding: '0.75rem', background: item.active ? `${typeColors[item.type]}08` : item.warning ? '#fffbeb' : 'transparent', borderRadius: 10, border: item.active ? `1px solid ${typeColors[item.type]}25` : item.warning ? '1px solid #fde68a' : '1px solid transparent' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.125rem' }}>
                        <span style={{ fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: typeColors[item.type] }}>
                          {item.type === 'urgent_exam' ? 'CRITICAL EXAM' : item.type}
                        </span>
                        {item.active && <span style={{ fontSize: '0.625rem', fontWeight: 800, color: 'white', background: typeColors[item.type], padding: '1px 6px', borderRadius: 999 }}>Up Next</span>}
                        {item.warning && <span style={{ fontSize: '0.625rem', fontWeight: 800, color: '#d97706', background: '#fef3c7', padding: '1px 6px', borderRadius: 999 }}>Warning</span>}
                      </div>
                      <h4 style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: '0.125rem' }}>{item.title}</h4>
                      <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: item.type === 'urgent_exam' ? '#ef4444' : 'var(--text-muted)' }}>{item.course}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
