import { useState } from 'react';
import { Users, Search, Plus, MoreHorizontal, GraduationCap, Calendar, Check, X, Building2, Activity, Play, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DUMMY_COHORTS = [
  { id: 1, name: 'Fall 2026 Bootcamp', students: 142, courses: 4, teachers: 2, status: 'active', progress: 68 },
  { id: 2, name: 'Enterprise Onboarding Q3', students: 56, courses: 2, teachers: 1, status: 'active', progress: 42 },
  { id: 3, name: 'Advanced AI Specialization', students: 89, courses: 6, teachers: 3, status: 'upcoming', progress: 0 },
  { id: 4, name: 'Spring 2026 Foundations', students: 120, courses: 3, teachers: 2, status: 'completed', progress: 100 },
];

export default function OrgCohortsPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const filtered = DUMMY_COHORTS.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filter === 'all' || c.status === filter;
    return matchSearch && matchStatus;
  });

  const activeCount = DUMMY_COHORTS.filter(c => c.status === 'active').length;
  const upcomingCount = DUMMY_COHORTS.filter(c => c.status === 'upcoming').length;

  return (
    <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'flex-start' }}>

      {/* ── Add Cohort Modal Mockup ── */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(6px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'var(--surface-1)', borderRadius: 24, padding: '2.5rem', maxWidth: 480, width: '100%', boxShadow: '0 32px 80px rgba(0,0,0,0.14)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div>
                <h3 style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1.25rem' }}>Create New Cohort</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginTop: 4 }}>Group students and assign them bulk curriculum.</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'var(--surface-2)', border: 'none', borderRadius: 10, padding: 8, cursor: 'pointer', display: 'flex', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label className="label">Cohort Name</label>
                <input className="input" placeholder="e.g. Winter 2026 Intro" style={{ padding: '0.75rem 1rem', fontSize: '0.9375rem' }} />
              </div>
              <div>
                <label className="label">Primary Instructor</label>
                <select className="input" style={{ padding: '0.75rem 1rem', fontSize: '0.9375rem', cursor: 'pointer' }}>
                  <option>Select an instructor...</option>
                  <option>Dr. Alan Turing</option>
                  <option>Ada Lovelace</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: '1rem' }}>
                <button onClick={() => setShowModal(false)} className="btn btn-secondary" style={{ flex: 1, height: 50, fontSize: '0.9375rem' }}>Cancel</button>
                <button onClick={() => setShowModal(false)} className="btn btn-primary" style={{ flex: 2, height: 50, borderRadius: 12, fontSize: '0.9375rem' }}>
                   Create Cohort
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Left: Cohort Canvas ── */}
      <div style={{ flex: 1, background: 'var(--surface-1)', borderRadius: 24, border: '1px solid var(--glass-border)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
        
        {/* Unified Header & Toolbar */}
        <div style={{ padding: '2rem 2.5rem 1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Cohorts & Batches</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginTop: 4 }}>Manage grouped learning tracks and bulk enrollments.</p>
            </div>
            <button className="btn btn-primary" style={{ gap: 8, height: 44, padding: '0 1.25rem', borderRadius: 12 }} onClick={() => setShowModal(true)}>
              <Plus size={16} /> New Cohort
            </button>
          </div>

          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search cohorts..."
                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: 12, border: '1px solid var(--surface-3)', background: 'var(--surface-1)', fontSize: '0.9375rem', outline: 'none', color: 'var(--text-primary)', transition: 'all 0.2s' }}
                onFocus={e => { e.target.style.background = 'white'; e.target.style.borderColor = 'var(--brand-400)'; e.target.style.boxShadow = 'var(--glow-brand)'; }}
                onBlur={e => { e.target.style.background = 'var(--surface-1)'; e.target.style.borderColor = 'var(--surface-3)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
            <div style={{ display: 'flex', background: 'var(--surface-1)', borderRadius: 12, padding: 4 }}>
              {[['all', 'All'], ['active', 'Active'], ['upcoming', 'Upcoming'], ['completed', 'Completed']].map(([val, lbl]) => (
                <button key={val} onClick={() => setFilter(val)} style={{
                  padding: '0.5rem 1.25rem', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)',
                  background: filter === val ? 'white' : 'transparent',
                  color: filter === val ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontWeight: 700, fontSize: '0.875rem', borderRadius: 8,
                  boxShadow: filter === val ? '0 2px 6px rgba(0,0,0,0.04)' : 'none',
                  transition: 'all 0.2s',
                }}>{lbl}</button>
              ))}
            </div>
          </div>
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div style={{ padding: '6rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: 'var(--surface-1)', border: '1px dashed var(--surface-4)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Users size={28} color="var(--text-muted)" />
            </div>
            <p style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1.125rem', marginBottom: 4 }}>No cohorts found</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>Adjust your filters or create a new cohort.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filtered.map((c, i) => {
              const isLast = i === filtered.length - 1;
              const statusColor = c.status === 'active' ? '#10b981' : c.status === 'upcoming' ? '#f59e0b' : '#6b7280';
              const statusBg = c.status === 'active' ? '#ecfdf5' : c.status === 'upcoming' ? '#fffbeb' : '#f3f4f6';
              const statusBorder = c.status === 'active' ? '#bbf7d0' : c.status === 'upcoming' ? '#fde68a' : '#e5e7eb';
              
              return (
                <div key={c.id} style={{
                  display: 'grid', gridTemplateColumns: '2.5fr 1.5fr auto auto auto', gap: '1.5rem', alignItems: 'center',
                  padding: '1.5rem 2.5rem', borderBottom: isLast ? 'none' : '1px solid var(--surface-2)',
                  background: 'transparent', transition: 'background 0.2s'
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--brand-50)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 0 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                      background: `linear-gradient(135deg, var(--brand-600), var(--brand-400))`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: 800, fontSize: '1rem',
                      boxShadow: `0 4px 12px var(--brand-500)30`
                    }}>
                      <Users size={20} color="white" />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4, fontSize: '0.8125rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}><GraduationCap size={14} /> {c.students} Students</span>
                        <span style={{ color: 'var(--surface-3)' }}>•</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}><Calendar size={14} /> {c.courses} Courses</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Avg Progress</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--brand-600)' }}>{c.progress}%</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 999, background: 'var(--surface-2)', overflow: 'hidden' }}>
                      <div style={{ width: `${c.progress}%`, height: '100%', background: 'var(--brand-500)', borderRadius: 999 }} />
                    </div>
                  </div>

                  {/* Status */}
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6, width: 'fit-content',
                    padding: '4px 10px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 800,
                    color: statusColor, background: statusBg, border: `1px solid ${statusBorder}`,
                    textTransform: 'uppercase', letterSpacing: '0.04em'
                  }}>
                    {c.status}
                  </span>

                  <button className="btn btn-secondary btn-sm" style={{ padding: '0.5rem 1rem', borderRadius: 8, fontWeight: 700 }}>
                    Manage
                  </button>
                  
                  <button className="btn btn-ghost btn-icon" style={{ borderRadius: 8 }}>
                     <MoreHorizontal size={18} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Right: Insights Panel ── */}
      <div style={{ width: 340, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: '5.5rem' }}>
        
        <div style={{ background: 'var(--surface-1)', borderRadius: 24, padding: '2rem', border: '1px solid var(--glass-border)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={14} color="var(--brand-500)" /> Cohort Insights
          </h3>
          
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: '2rem' }}>
            <span style={{ fontSize: '3.5rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-0.04em' }}>{DUMMY_COHORTS.length}</span>
            <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-muted)' }}>total cohorts</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)' }}>
                <Play size={16} color="#10b981" /> <span style={{ fontSize: '0.9375rem', fontWeight: 600 }}>Active</span>
              </div>
              <span style={{ fontSize: '1rem', fontWeight: 800 }}>{activeCount}</span>
            </div>
            <div style={{ height: 1, background: 'var(--surface-2)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)' }}>
                <Calendar size={16} color="#f59e0b" /> <span style={{ fontSize: '0.9375rem', fontWeight: 600 }}>Upcoming</span>
              </div>
              <span style={{ fontSize: '1rem', fontWeight: 800 }}>{upcomingCount}</span>
            </div>
          </div>
        </div>

        <div style={{ background: 'var(--brand-50)', borderRadius: 24, padding: '2rem', border: '1px solid var(--brand-100)', color: 'var(--brand-800)' }}>
          <Settings size={28} color="var(--brand-500)" style={{ marginBottom: 12 }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 800, marginBottom: 8 }}>Bulk Operations</h3>
          <p style={{ fontSize: '0.9375rem', opacity: 0.9, lineHeight: 1.5 }}>
            Assign multiple courses to a cohort at once, and all enrolled students will instantly receive access.
          </p>
        </div>

      </div>
    </div>
  );
}
