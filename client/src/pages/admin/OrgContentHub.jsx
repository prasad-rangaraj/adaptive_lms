import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tenantsAPI } from '../../services/api.service';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import {
  Search, Command, Bell, Sparkles, ArrowRight, Table2, 
  Filter, Plus, PlayCircle, Users, Eye, Edit, UserCheck, FileText
} from 'lucide-react';
import Loader from '../../components/ui/Loader';

export default function OrgContentHub() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['org-courses', user?.tenant_id],
    queryFn: () => tenantsAPI.getCourses(user?.tenant_id),
  });

  const courses = data?.courses || [];
  const filtered = courses.filter(c => {
    if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: 1400, margin: '0 auto' }}>
      
      {/* ── 1. The Decision Intelligence Header (Command Palette Style) ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Command size={18} color="var(--text-muted)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search courses or type a command (Cmd+K)..." 
            style={{ 
              width: '100%', padding: '0.875rem 1rem 0.875rem 3rem', 
              borderRadius: 16, border: '1px solid var(--glass-border)', background: 'var(--surface-0)',
              fontSize: '0.9375rem', color: 'var(--text-primary)', outline: 'none',
              boxShadow: '0 2px 10px rgba(0,0,0,0.02)', transition: 'all 0.2s'
            }}
            onFocus={e => { e.target.style.borderColor = 'var(--brand-400)'; e.target.style.boxShadow = '0 0 0 4px var(--brand-50)'; }}
            onBlur={e => { e.target.style.borderColor = 'var(--glass-border)'; e.target.style.boxShadow = '0 2px 10px rgba(0,0,0,0.02)'; }}
          />
          <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', background: 'var(--surface-2)', padding: '2px 6px', borderRadius: 6, border: '1px solid var(--glass-border)' }}>
            ⌘K
          </span>
        </div>
        
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-ghost btn-icon"><Bell size={18} /></button>
          <button className="btn btn-primary" style={{ gap: 8 }} onClick={() => navigate('/teacher/courses/builder')}>
            <Plus size={16} /> Create Course
          </button>
        </div>
      </div>

      {/* ── 2. AI Insight Banner ── */}
      <div style={{ 
        background: 'linear-gradient(135deg, var(--surface-0), var(--brand-50))', 
        borderRadius: 24, padding: '2.5rem', border: '1px solid var(--brand-100)',
        boxShadow: '0 12px 30px rgba(0,0,0,0.03)', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', right: -40, top: -60, opacity: 0.05, transform: 'scale(1.5)', pointerEvents: 'none' }}>
          <Sparkles size={300} color="var(--brand-600)" />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem', position: 'relative', zIndex: 1, maxWidth: 900 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, var(--brand-500), var(--brand-700))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 16px var(--brand-500)40' }}>
            <Sparkles size={22} color="white" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.4, letterSpacing: '-0.02em' }}>
              Content velocity is high. <strong style={{ color: 'var(--brand-700)', fontWeight: 800 }}>"Advanced Machine Learning"</strong> has seen a 24% spike in enrollments this week.
            </h2>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button className="btn btn-secondary btn-sm" style={{ gap: 6, fontSize: '0.8125rem', background: 'white' }}>
                View Course Analytics <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Table-First Data Canvas (1fr 340px) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'flex-start' }}>
        
        {/* Main Canvas: Courses Table */}
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-0)' }}>
            <div>
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Table2 size={18} color="var(--brand-500)" /> Global Course Catalog
              </h3>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
               <button className="btn btn-secondary btn-sm" style={{ gap: 6 }}><Filter size={14} /> Filter</button>
            </div>
          </div>
          
          <div style={{ overflowX: 'auto', maxHeight: 500 }} className="hide-scrollbar">
            {isLoading ? (
               <div style={{ padding: '3rem' }}><Loader /></div>
            ) : (
              <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                  <tr style={{ background: 'var(--surface-1)' }}>
                    <th style={{ padding: '1rem 1.5rem' }}>Course Name</th>
                    <th>Modules</th>
                    <th>Enrollments</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No courses found.</td>
                    </tr>
                  ) : filtered.map((c, i) => (
                    <tr key={c.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--glass-border)' : 'none', transition: 'background 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-1)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 40, height: 40, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
                            <img src={c.thumbnail_url || 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=100&q=80'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                          <div>
                            <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>{c.title}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{c.description}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                           <PlayCircle size={14} /> {c.modules_count || 0}
                        </span>
                      </td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                           <Users size={14} /> {Math.floor(Math.random() * 300) + 20}
                        </span>
                      </td>
                      <td>
                        {c.is_published ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700, background: '#ecfdf5', color: '#059669', border: '1px solid #bbf7d0' }}>
                            Published
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700, background: '#fff7ed', color: '#d97706', border: '1px solid #fed7aa' }}>
                            Draft
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right', paddingRight: '1.5rem' }}>
                         <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                           <button className="btn btn-secondary" style={{ padding: 6 }} title="View"><Eye size={14} /></button>
                           <button className="btn btn-secondary" style={{ padding: 6 }} title="Edit"><Edit size={14} /></button>
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Side Canvas: Command Center & Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Command Center
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.875rem 1rem', background: 'var(--surface-1)', border: '1px solid var(--glass-border)', borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s' }}>
                 <UserCheck size={16} color="var(--brand-600)" />
                 <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>Bulk Enrollment</span>
              </button>
              <button style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.875rem 1rem', background: 'var(--surface-1)', border: '1px solid var(--glass-border)', borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s' }}>
                 <FileText size={16} color="var(--brand-600)" />
                 <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>Manage Exams Bank</span>
              </button>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem' }}>
             <h3 style={{ fontSize: '0.875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
               Content Summary
             </h3>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Total Published</span>
                  <span style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-primary)' }}>{courses.filter(c => c.is_published).length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Total Drafts</span>
                  <span style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-primary)' }}>{courses.filter(c => !c.is_published).length}</span>
                </div>
                <div style={{ width: '100%', height: 1, background: 'var(--surface-3)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Avg. Completion Rate</span>
                  <span style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#10b981' }}>78%</span>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
