import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tenantsAPI } from '../../services/api.service';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, Award, Plus, Layers, Edit, Eye, Trash2, 
  Settings, Users, FileText, CheckCircle2, PlayCircle, BarChart, Calendar, ShieldCheck, UserCheck, Search, Filter
} from 'lucide-react';
import Loader from '../../components/ui/Loader';

// ── Tab 1: Courses ────────────────────────────────────────────────────────
function CoursesTab() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['org-courses', user?.tenant_id],
    queryFn: () => tenantsAPI.getCourses(user?.tenant_id),
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-primary" style={{ gap: 8 }} onClick={() => navigate('/teacher/courses/builder')}><Plus size={16} /> Create Course</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {data?.courses?.map(c => (
          <div key={c.id} className="glass-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'relative', height: 140 }}>
              <img src={c.thumbnail_url || 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=800&q=80'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }} />
              <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 6 }}>
                {c.is_published ? (
                  <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#10b981', background: 'rgba(16,185,129,0.2)', backdropFilter: 'blur(4px)', padding: '4px 10px', borderRadius: 999, border: '1px solid rgba(16,185,129,0.3)' }}>PUBLISHED</span>
                ) : (
                  <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#f59e0b', background: 'rgba(245,158,11,0.2)', backdropFilter: 'blur(4px)', padding: '4px 10px', borderRadius: 999, border: '1px solid rgba(245,158,11,0.3)' }}>DRAFT</span>
                )}
              </div>
              <div style={{ position: 'absolute', bottom: 12, left: 16, right: 16 }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{c.title}</h3>
              </div>
            </div>
            
            <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{c.description}</p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: '0.8125rem', fontWeight: 600 }}><PlayCircle size={14} /> {c.modules_count || 0}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: '0.8125rem', fontWeight: 600 }}><Users size={14} /> {Math.floor(Math.random() * 500) + 50}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-secondary" style={{ padding: 8 }} title="View Details"><Eye size={16} /></button>
                  <button className="btn btn-secondary" style={{ padding: 8 }} title="Edit"><Edit size={16} /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Tab 2: Certificates ──────────────────────────────────────────────────────
function CertificatesTab() {
  const { user } = useAuthStore();
  const { data, isLoading } = useQuery({
    queryKey: ['org-certificates', user?.tenant_id],
    queryFn: () => tenantsAPI.getCertificates(user?.tenant_id),
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-primary" style={{ gap: 8 }}><Plus size={16} /> New Template</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {data?.templates?.map(t => (
          <div key={t.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--brand-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-600)' }}><Award size={20} /></div>
            <div>
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 800, color: 'var(--text-primary)' }}>{t.name}</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Created {new Date(t.created_at).toLocaleDateString()}</p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem', marginTop: '0.5rem' }}>
              <div><p style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)' }}>{t.issued_count}</p><p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Issued</p></div>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                <button className="btn btn-secondary" style={{ padding: 6 }}><Settings size={14} /></button>
                <button className="btn btn-secondary" style={{ padding: 6, color: '#ef4444' }}><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Tab 3: Exams & Assignments ──────────────────────────────────────────────
function ExamsTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="glass-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10 }}><FileText size={22} color="var(--brand-500)" /> Global Exams Bank</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 4 }}>Manage standardized exams and rubrics that can be attached to any course.</p>
          </div>
          <button className="btn btn-primary" style={{ gap: 8 }}><Plus size={16} /> Create Exam</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            { id: 1, title: 'Midterm Evaluation - Fall 2026', type: 'Standardized', color: '#4f46e5', proctoring: 'Strict (AI)', proctorColor: '#10b981', items: '45 Questions' },
            { id: 2, title: 'Software Engineering Final', type: 'Project', color: '#059669', proctoring: 'Off', proctorColor: 'var(--text-muted)', items: '1 Rubric' },
          ].map(e => (
            <div key={e.id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', transition: 'all 0.2s', cursor: 'pointer' }} onMouseEnter={ev => ev.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={ev => ev.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 2 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${e.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: e.color }}>
                  <FileText size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{e.title}</h3>
                  <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: e.color, background: `${e.color}15`, padding: '2px 8px', borderRadius: 6 }}>{e.type}</span>
                  </div>
                </div>
              </div>
              
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 2 }}>Proctoring</p>
                <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: e.proctorColor }}>{e.proctoring}</p>
              </div>

              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 2 }}>Content</p>
                <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{e.items}</p>
              </div>

              <div>
                <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>Edit Rules</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Tab 4: Enrollments Management ─────────────────────────────────────────────
function EnrollmentsTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* High Level Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: '#10b98115', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><UserCheck size={24} /></div>
          <div><p style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Enrollments</p><p style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)' }}>1,482</p></div>
        </div>
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: '#3b82f615', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckCircle2 size={24} /></div>
          <div><p style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Completion Rate</p><p style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)' }}>78%</p></div>
        </div>
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: '#8b5cf615', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Calendar size={24} /></div>
          <div><p style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Expiring Soon</p><p style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)' }}>45</p></div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>
        {/* Active Enrollments Table/List */}
        <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)' }}>Recent Enrollments</h2>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input placeholder="Search user or course..." style={{ padding: '0.5rem 1rem 0.5rem 2.25rem', borderRadius: 8, border: '1px solid var(--surface-3)', background: 'var(--surface-1)', outline: 'none', color: 'var(--text-primary)', fontSize: '0.875rem' }} />
              </div>
              <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem', gap: 8 }}><Filter size={16} /> Filter</button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { id: 1, user: 'Alex Chen', course: 'Advanced Machine Learning', progress: 45, expires: 'In 3 months' },
              { id: 2, user: 'Sarah Jenkins', course: 'Software Engineering Final', progress: 100, expires: 'Completed' },
              { id: 3, user: 'Engineering Cohort B', course: 'Data Structures 101', progress: 12, expires: 'In 1 month' },
            ].map(e => (
              <div key={e.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--surface-0)', border: '1px solid var(--surface-2)', borderRadius: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 2 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'var(--text-secondary)' }}>
                    {e.user.charAt(0)}
                  </div>
                  <div>
                    <p style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{e.user}</p>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{e.course}</p>
                  </div>
                </div>
                
                <div style={{ flex: 1 }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                     <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Progress</span>
                     <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--brand-500)' }}>{e.progress}%</span>
                   </div>
                   <div style={{ height: 6, borderRadius: 999, background: 'var(--surface-2)' }}>
                     <div style={{ height: '100%', borderRadius: 999, background: e.progress === 100 ? '#10b981' : 'var(--brand-500)', width: `${e.progress}%` }} />
                   </div>
                </div>

                <div style={{ flex: 1, textAlign: 'right' }}>
                  <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: e.expires === 'Completed' ? '#10b981' : 'var(--text-secondary)' }}>{e.expires}</p>
                </div>

                <div style={{ display: 'flex', gap: 8, marginLeft: '2rem' }}>
                  <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>Extend</button>
                  <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem', color: '#ef4444' }}>Revoke</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bulk Enrollment Actions */}
        <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', height: 'fit-content' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Users size={20} color="var(--brand-500)" />
            Bulk Enrollment
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Quickly assign courses to individuals or entire cohorts.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>Select Course</label>
              <select style={{ width: '100%', padding: '0.75rem', borderRadius: 8, border: '1px solid var(--surface-3)', background: 'var(--surface-1)', outline: 'none', color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                <option>Advanced Machine Learning</option>
                <option>Data Structures 101</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>Select User or Cohort</label>
              <select style={{ width: '100%', padding: '0.75rem', borderRadius: 8, border: '1px solid var(--surface-3)', background: 'var(--surface-1)', outline: 'none', color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                <option>Cohort: Engineering Fall 2026</option>
                <option>User: Alex Chen</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>Expiration Date</label>
              <input type="date" style={{ width: '100%', padding: '0.75rem', borderRadius: 8, border: '1px solid var(--surface-3)', background: 'var(--surface-1)', outline: 'none', color: 'var(--text-primary)', fontSize: '0.875rem' }} />
            </div>
          </div>
          
          <button className="btn btn-primary" style={{ width: '100%', padding: '0.875rem', marginTop: '0.5rem', fontWeight: 800 }}>Enroll Users</button>
        </div>
      </div>
    </div>
  );
}

// ── Main Hub ──────────────────────────────────────────────────────────────────
export default function OrgContentHub() {
  const [activeTab, setActiveTab] = useState('courses');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1.5rem' }}>
        <div style={{ flexShrink: 0 }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--brand-500)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Content Management</p>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.04em', lineHeight: 1.1 }}>Content Hub</h1>
        </div>
        
        <div className="hide-scrollbar" style={{ display: 'flex', background: 'var(--surface-1)', padding: 6, borderRadius: 16, border: '1px solid var(--glass-border)', gap: 4, overflowX: 'auto', flexWrap: 'nowrap' }}>
          {[
            { id: 'courses', label: 'Courses', icon: BookOpen },
            { id: 'enrollments', label: 'Enrollments', icon: Users },
            { id: 'exams', label: 'Exams Bank', icon: FileText },
            { id: 'certificates', label: 'Certificates', icon: Award },
          ].map(t => (
            <button 
              key={t.id} onClick={() => setActiveTab(t.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.625rem 1.25rem', borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '0.875rem', transition: 'all 0.2s', whiteSpace: 'nowrap', background: activeTab === t.id ? 'white' : 'transparent', color: activeTab === t.id ? 'var(--brand-600)' : 'var(--text-muted)', boxShadow: activeTab === t.id ? '0 4px 12px rgba(0,0,0,0.08)' : 'none' }}>
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'courses' && <CoursesTab />}
      {activeTab === 'enrollments' && <EnrollmentsTab />}
      {activeTab === 'exams' && <ExamsTab />}
      {activeTab === 'certificates' && <CertificatesTab />}
    </div>
  );
}
