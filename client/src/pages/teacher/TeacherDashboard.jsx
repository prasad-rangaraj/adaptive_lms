import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowUpRight, Play, AlertCircle, Clock, CheckCircle2, ChevronRight,
  BarChart2, Users, Brain, Activity
} from 'lucide-react';

const batchSkills = [
  { topic: 'Database Normalization', mastery: 35, trend: 'down', recommendation: 'Schedule Remedial Class' },
  { topic: 'REST APIs', mastery: 85, trend: 'up', recommendation: 'Proceed to Next Unit' },
  { topic: 'Graph Algorithms', mastery: 55, trend: 'flat', recommendation: 'Assign Additional Practice' },
  { topic: 'System Design', mastery: 20, trend: 'down', recommendation: 'Urgent Review Required' },
];

export default function TeacherDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div style={{ position: 'relative', minHeight: '100%', paddingBottom: '4rem', overflow: 'hidden' }}>
      
      {/* ── Background Organic Orbs ── */}
      <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(14,116,144,0.06) 0%, transparent 70%)', filter: 'blur(80px)', zIndex: 0, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '20%', right: '-10%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(16,185,129,0.04) 0%, transparent 70%)', filter: 'blur(80px)', zIndex: 0, pointerEvents: 'none' }} />
      
      {/* ── Content Container ── */}
      <div style={{ position: 'relative', zIndex: 10 }}>

        {/* ── Editorial Header ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', paddingTop: '2rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '2rem' }}>
            <div style={{ maxWidth: '600px' }}>
              <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--brand-500)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1rem' }}>
                Command Center
              </p>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
                Good morning,<br/>
                <span style={{ color: 'var(--text-muted)' }}>Professor Smith.</span>
              </h1>
            </div>

            <div style={{ display: 'flex', gap: '3rem', paddingBottom: '0.5rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                  <span style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-0.03em' }}>342</span>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center' }}><ArrowUpRight size={14} /> 12</span>
                </div>
                <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: '0.375rem' }}>Active Students</p>
              </div>
              
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                  <span style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-0.03em' }}>88%</span>
                </div>
                <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: '0.375rem' }}>Class Average</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '3rem', marginBottom: '3rem', borderBottom: '1px solid var(--surface-3)' }}>
          {[
            { id: 'overview', label: 'Action Feed & Overview', icon: Activity },
            { id: 'analytics', label: 'Batch Cognitive Analytics', icon: Brain },
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'transparent', border: 'none', cursor: 'pointer', padding: '0 0 1rem 0', fontSize: '0.9375rem', fontWeight: 800, color: activeTab === t.id ? 'var(--text-primary)' : 'var(--text-muted)', borderBottom: activeTab === t.id ? '2px solid var(--text-primary)' : '2px solid transparent', marginBottom: '-1px', transition: 'all 0.2s' }}>
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>

        {/* ── Tab Content ── */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '3.5rem' }}>
            
            {/* Left Column: Courses */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Your Active Courses</h2>
                <button style={{ background: 'transparent', border: 'none', color: 'var(--brand-600)', fontSize: '0.875rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', padding: 0 }}>View All <ChevronRight size={16} /></button>
              </div>

              <div style={{ display: 'flex', gap: '2rem', overflowX: 'auto', paddingBottom: '2rem', margin: '0 -2.5rem', padding: '0 2.5rem' }} className="hide-scrollbar">
                {[
                  { id: 1, title: 'Advanced Machine Learning', progress: 65, students: 124, img: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80', color: '#0e7490' },
                  { id: 2, title: 'Data Structures 101', progress: 30, students: 218, img: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80', color: '#16a34a' }
                ].map((course) => (
                  <div key={course.id} style={{ minWidth: '400px', flexShrink: 0, position: 'relative', cursor: 'pointer' }} onClick={() => navigate('/teacher/studio')}>
                    <div style={{ width: '100%', height: '280px', borderRadius: '32px 32px 8px 32px', overflow: 'hidden', position: 'relative' }}>
                      <img src={course.img} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)' }} />
                      
                      <div style={{ position: 'absolute', bottom: '2rem', left: '2rem', right: '2rem' }}>
                        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>{course.students} Students</p>
                        <h3 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 800, lineHeight: 1.2 }}>{course.title}</h3>
                      </div>

                      <div style={{ position: 'absolute', top: '2rem', right: '2rem', width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                        <Play size={20} fill="currentColor" />
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 800, color: course.color }}>{course.progress}%</span>
                      <div style={{ flex: 1, height: '4px', background: 'var(--surface-3)', borderRadius: '999px', overflow: 'hidden' }}>
                        <div style={{ width: `${course.progress}%`, height: '100%', background: course.color, borderRadius: '999px' }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
                <button style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: 0 }} onClick={() => navigate('/teacher/studio')}>
                  Create New Course <ArrowUpRight size={18} color="var(--brand-500)" />
                </button>
                <button style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: 0 }} onClick={() => navigate('/teacher/live')}>
                  Schedule Webinar <ArrowUpRight size={18} color="var(--brand-500)" />
                </button>
              </div>

            </div>

            {/* Right Column: Action Feed */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '2.5rem' }}>Action Feed</h2>

              <div style={{ position: 'relative', paddingLeft: '2rem' }}>
                <div style={{ position: 'absolute', top: 0, bottom: 0, left: '7px', width: '2px', background: 'linear-gradient(to bottom, var(--surface-3) 0%, transparent 100%)' }} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                  
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '-2rem', width: '16px', height: '16px', borderRadius: '50%', background: '#ef4444', border: '4px solid var(--surface-1)' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <AlertCircle size={14} color="#ef4444" />
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.05em' }}>High Priority</span>
                    </div>
                    <h4 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Proctoring Flags Detected</h4>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>3 students triggered AI webcam flags during the Midterm Exam.</p>
                    <button style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '0.875rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', padding: 0 }} onClick={() => navigate('/teacher/assessment')}>
                      Review Footage <ArrowUpRight size={16} />
                    </button>
                  </div>

                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '-2rem', width: '16px', height: '16px', borderRadius: '50%', background: '#f59e0b', border: '4px solid var(--surface-1)' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <CheckCircle2 size={14} color="#f59e0b" />
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Needs Grading</span>
                    </div>
                    <h4 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>14 Pending Assignments</h4>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>AI Evaluator has pre-graded the essay submissions. Final sign-off required.</p>
                    <button style={{ background: 'transparent', border: 'none', color: '#f59e0b', fontSize: '0.875rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', padding: 0 }} onClick={() => navigate('/teacher/assessment')}>
                      Start Grading <ArrowUpRight size={16} />
                    </button>
                  </div>

                </div>
              </div>
            </div>

          </div>
        )}

        {/* ── Cognitive Analytics Tab ── */}
        {activeTab === 'analytics' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '3.5rem' }}>
            
            {/* Heatmap & Alerts */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)' }}>Batch Mastery Heatmap</h2>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>AI-aggregated cognitive data for Batch 2026.</p>
                </div>
                <select style={{ padding: '8px 16px', background: 'var(--surface-0)', border: '1.5px solid var(--surface-3)', borderRadius: 10, color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 700 }}>
                  <option>Data Structures 101</option>
                  <option>Advanced Machine Learning</option>
                </select>
              </div>

              <div style={{ background: 'var(--surface-0)', border: '1px solid var(--surface-3)', borderRadius: 16, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ background: 'var(--surface-1)', borderBottom: '1px solid var(--surface-3)' }}>
                    <tr>
                      <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Topic</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Batch Mastery</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>AI Recommendation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batchSkills.map(skill => (
                      <tr key={skill.topic} style={{ borderBottom: '1px solid var(--surface-2)' }}>
                        <td style={{ padding: '1rem', fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-primary)' }}>{skill.topic}</td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span style={{ fontSize: '0.875rem', fontWeight: 900, color: skill.mastery < 40 ? '#ef4444' : skill.mastery < 70 ? '#f59e0b' : '#10b981', width: '32px' }}>
                              {skill.mastery}%
                            </span>
                            <div style={{ width: '100px', height: 6, background: 'var(--surface-2)', borderRadius: 999 }}>
                              <div style={{ width: `${skill.mastery}%`, height: '100%', background: skill.mastery < 40 ? '#ef4444' : skill.mastery < 70 ? '#f59e0b' : '#10b981', borderRadius: 999 }} />
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: skill.mastery < 40 ? '#ef4444' : 'var(--text-secondary)', background: skill.mastery < 40 ? '#fef2f2' : 'var(--surface-1)', padding: '4px 10px', borderRadius: 8 }}>
                            {skill.recommendation}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* At-Risk Students */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 20, padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
                  <AlertCircle size={18} color="#ef4444" />
                  <h3 style={{ fontSize: '1rem', fontWeight: 900, color: '#991b1b' }}>At-Risk Students</h3>
                </div>
                <p style={{ fontSize: '0.8125rem', color: '#b91c1c', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                  The AI has identified 4 students whose performance has drastically dropped over the last 2 weeks.
                </p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {['Rahul M.', 'Priya S.', 'Arun K.'].map(student => (
                    <div key={student} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '0.75rem 1rem', borderRadius: 12, border: '1px solid #fca5a5' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#7f1d1d' }}>{student}</span>
                      <button style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}>Message</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
