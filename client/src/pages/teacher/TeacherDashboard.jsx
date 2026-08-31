import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import {
  ArrowUpRight, Play, AlertCircle, CheckCircle2, ChevronRight,
  Brain, Activity, Radio, BookOpen, FileText, Users, Clock,
  Loader2, Plus, Zap, TrendingUp, ShieldAlert
} from 'lucide-react';
import { coursesAPI, liveAPI, assignmentsAPI } from '../../services/api.service';

/* ── Time-aware greeting ──────────────────────────────────────────────────── */
function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

/* ── Course color palette ─────────────────────────────────────────────────── */
const COURSE_COLORS = [
  { bg: '#0e7490', accent: 'rgba(14,116,144,0.9)' },
  { bg: '#16a34a', accent: 'rgba(22,163,74,0.9)' },
  { bg: '#7c3aed', accent: 'rgba(124,58,237,0.9)' },
  { bg: '#db2777', accent: 'rgba(219,39,119,0.9)' },
  { bg: '#d97706', accent: 'rgba(217,119,6,0.9)' },
];

/* ── Fallback cover images ────────────────────────────────────────────────── */
const COURSE_IMGS = [
  'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80',
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80',
  'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?w=800&q=80',
  'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&q=80',
];

const batchSkills = [
  { topic: 'Database Normalization', mastery: 35, recommendation: 'Schedule Remedial Class' },
  { topic: 'REST APIs',              mastery: 85, recommendation: 'Proceed to Next Unit' },
  { topic: 'Graph Algorithms',       mastery: 55, recommendation: 'Assign Additional Practice' },
  { topic: 'System Design',          mastery: 20, recommendation: 'Urgent Review Required' },
];

export default function TeacherDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  /* ── Real data ── */
  const [courses, setCourses]         = useState([]);
  const [liveSessions, setLiveSessions] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingLive, setLoadingLive]   = useState(true);

  /* ── Derived stats ── */
  const totalStudents  = courses.reduce((s, c) => s + (c.student_count || 0), 0);
  const publishedCount = courses.filter(c => c.is_published).length;
  const draftCount     = courses.filter(c => !c.is_published).length;
  const liveNow        = liveSessions.filter(s => s.status === 'live').length;
  const scheduledCount = liveSessions.filter(s => s.status === 'scheduled').length;

  useEffect(() => {
    coursesAPI.myCourses()
      .then(r => setCourses(r.data))
      .catch(() => {})
      .finally(() => setLoadingCourses(false));

    liveAPI.listSessions()
      .then(r => setLiveSessions(r.data))
      .catch(() => {})
      .finally(() => setLoadingLive(false));
  }, []);

  /* ── Quick Action Feed items (static but navigable) ── */
  const feedItems = [
    liveNow > 0 && {
      dot: '#dc2626',
      tag: 'LIVE NOW',
      tagColor: '#dc2626',
      title: `${liveNow} Active Broadcast${liveNow > 1 ? 's' : ''}`,
      body: 'You have a live session running. Rejoin or manage from Live Sessions.',
      cta: 'Go to Live →',
      ctaColor: '#dc2626',
      route: '/teacher/live',
    },
    draftCount > 0 && {
      dot: '#f59e0b',
      tag: 'DRAFTS',
      tagColor: '#f59e0b',
      title: `${draftCount} Unpublished Course${draftCount > 1 ? 's' : ''}`,
      body: 'Some courses are still drafts. Publish them so students can enroll.',
      cta: 'Open Studio →',
      ctaColor: '#f59e0b',
      route: '/teacher/studio',
    },
    scheduledCount > 0 && {
      dot: '#0891b2',
      tag: 'UPCOMING',
      tagColor: '#0891b2',
      title: `${scheduledCount} Scheduled Session${scheduledCount > 1 ? 's' : ''}`,
      body: 'You have upcoming live sessions. Review and prepare your broadcast.',
      cta: 'View Sessions →',
      ctaColor: '#0891b2',
      route: '/teacher/live',
    },
    {
      dot: '#ef4444',
      tag: 'HIGH PRIORITY',
      tagColor: '#ef4444',
      title: 'Proctoring Flags Detected',
      body: '3 students triggered AI webcam flags during the last Midterm Exam.',
      cta: 'Review Evidence →',
      ctaColor: '#ef4444',
      route: '/teacher/assessment',
    },
    {
      dot: '#f59e0b',
      tag: 'NEEDS GRADING',
      tagColor: '#f59e0b',
      title: 'Pending Assignment Reviews',
      body: 'AI Evaluator has pre-graded submissions. Final sign-off required.',
      cta: 'Start Grading →',
      ctaColor: '#f59e0b',
      route: '/teacher/assessment',
    },
  ].filter(Boolean);

  return (
    <div style={{ position: 'relative', minHeight: '100%', paddingBottom: '4rem', overflow: 'hidden' }}>

      {/* ── Background Orbs ── */}
      <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(14,116,144,0.06) 0%, transparent 70%)', filter: 'blur(80px)', zIndex: 0, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '20%', right: '-10%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(16,185,129,0.04) 0%, transparent 70%)', filter: 'blur(80px)', zIndex: 0, pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 10 }}>

        {/* ── Hero Header ── */}
        <div style={{ paddingTop: '2rem', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '2rem' }}>

            <div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
                {greeting()},<br />
                <span style={{ color: 'var(--text-muted)' }}>{user?.full_name || 'Professor'}.</span>
              </h1>
            </div>

            {/* ── Real Stats ── */}
            <div style={{ display: 'flex', gap: '3rem', paddingBottom: '0.5rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                  {loadingCourses
                    ? <Loader2 size={20} className="animate-spin" color="var(--text-muted)" />
                    : <span style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-0.03em' }}>{courses.length}</span>
                  }
                  {!loadingCourses && publishedCount > 0 && (
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center' }}>
                      <ArrowUpRight size={14} /> {publishedCount} Live
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: '0.375rem' }}>My Courses</p>
              </div>

              {liveNow > 0 && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#dc2626', boxShadow: '0 0 0 4px rgba(220,38,38,0.2)' }} />
                    <span style={{ fontSize: '2.25rem', fontWeight: 900, color: '#dc2626', lineHeight: 1, letterSpacing: '-0.03em' }}>{liveNow}</span>
                  </div>
                  <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: '0.375rem' }}>Live Now</p>
                </div>
              )}

              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                  {loadingLive
                    ? <Loader2 size={20} className="animate-spin" color="var(--text-muted)" />
                    : <span style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-0.03em' }}>{scheduledCount}</span>
                  }
                </div>
                <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: '0.375rem' }}>Scheduled Sessions</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div style={{ display: 'flex', gap: '3rem', marginBottom: '3rem', borderBottom: '1px solid var(--surface-3)' }}>
          {[
            { id: 'overview',  label: 'Action Feed & Overview',     icon: Activity },
            { id: 'analytics', label: 'Batch Cognitive Analytics',   icon: Brain },
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'transparent', border: 'none', cursor: 'pointer', padding: '0 0 1rem 0', fontSize: '0.9375rem', fontWeight: 800, color: activeTab === t.id ? 'var(--text-primary)' : 'var(--text-muted)', borderBottom: activeTab === t.id ? '2px solid var(--text-primary)' : '2px solid transparent', marginBottom: '-1px', transition: 'all 0.2s' }}>
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* TAB: OVERVIEW */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '3.5rem' }}>

            {/* ── Left: Courses ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Your Courses</h2>
                <button
                  onClick={() => navigate('/teacher/studio')}
                  style={{ background: 'transparent', border: 'none', color: 'var(--brand-600)', fontSize: '0.875rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', padding: 0 }}
                >
                  Open Studio <ChevronRight size={16} />
                </button>
              </div>

              {/* Loading state */}
              {loadingCourses && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-muted)', padding: '2rem 0' }}>
                  <Loader2 size={20} className="animate-spin" /> Loading your courses...
                </div>
              )}

              {/* Empty state */}
              {!loadingCourses && courses.length === 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 240, gap: '1rem', background: 'var(--surface-1)', borderRadius: 24, border: '2px dashed var(--surface-3)', padding: '3rem' }}>
                  <BookOpen size={40} color="var(--surface-4)" />
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>No Courses Yet</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center' }}>Create your first course from the Studio and publish it for students.</p>
                  <button onClick={() => navigate('/teacher/studio')} className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
                    <Plus size={16} /> Create First Course
                  </button>
                </div>
              )}

              {/* Course cards (horizontal scroll) */}
              {!loadingCourses && courses.length > 0 && (
                <div style={{ display: 'flex', gap: '2rem', overflowX: 'auto', paddingBottom: '1rem', marginLeft: '-2.5rem', marginRight: '-2.5rem', paddingLeft: '2.5rem', paddingRight: '2.5rem' }} className="hide-scrollbar">
                  {courses.map((course, i) => {
                    const palette = COURSE_COLORS[i % COURSE_COLORS.length];
                    const img = COURSE_IMGS[i % COURSE_IMGS.length];
                    return (
                      <div key={course.id} style={{ minWidth: '380px', flexShrink: 0, cursor: 'pointer' }} onClick={() => navigate('/teacher/studio')}>
                        <div style={{ width: '100%', height: '260px', borderRadius: '28px 28px 8px 28px', overflow: 'hidden', position: 'relative' }}>
                          <img src={img} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, ${palette.accent} 0%, transparent 60%)` }} />

                          {/* Draft badge */}
                          {!course.is_published && (
                            <div style={{ position: 'absolute', top: '1.25rem', left: '1.25rem', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', padding: '4px 12px', borderRadius: 20, fontSize: '0.6875rem', fontWeight: 800, color: 'white', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                              Draft
                            </div>
                          )}

                          <div style={{ position: 'absolute', bottom: '1.75rem', left: '1.75rem', right: '1.75rem' }}>
                            <h3 style={{ color: 'white', fontSize: '1.375rem', fontWeight: 800, lineHeight: 1.25 }}>{course.title}</h3>
                            {course.is_published && (
                              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', fontWeight: 700, marginTop: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Published</p>
                            )}
                          </div>

                          <div style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                            <Play size={18} fill="currentColor" />
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Add new course card */}
                  <div
                    onClick={() => navigate('/teacher/studio')}
                    style={{ minWidth: '200px', flexShrink: 0, height: '260px', borderRadius: '28px 28px 8px 28px', border: '2px dashed var(--surface-3)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, cursor: 'pointer', transition: 'all 0.2s', color: 'var(--text-muted)' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand-400)'; e.currentTarget.style.color = 'var(--brand-600)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--surface-3)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                  >
                    <Plus size={28} />
                    <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>New Course</span>
                  </div>
                </div>
              )}

              {/* ── Quick Action Links ── */}
              <div style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap', paddingTop: '0.5rem' }}>
                {[
                  { label: 'Create New Course', route: '/teacher/studio', icon: BookOpen },
                  { label: 'Schedule Live Session', route: '/teacher/live', icon: Radio },
                  { label: 'Grade Assignments', route: '/teacher/assessment', icon: FileText },
                  { label: 'Create Exam', route: '/teacher/forge', icon: Zap },
                ].map(a => (
                  <button key={a.label}
                    onClick={() => navigate(a.route)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '0.9375rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: 0, transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--brand-600)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-primary)'}
                  >
                    <a.icon size={16} color="var(--brand-500)" />
                    {a.label} <ArrowUpRight size={16} color="var(--brand-500)" />
                  </button>
                ))}
              </div>
            </div>

            {/* ── Right: Action Feed ── */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '2.5rem' }}>Action Feed</h2>

              <div style={{ position: 'relative', paddingLeft: '2rem' }}>
                {/* Timeline line */}
                <div style={{ position: 'absolute', top: 0, bottom: 0, left: '7px', width: '2px', background: 'linear-gradient(to bottom, var(--surface-3) 0%, transparent 100%)' }} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                  {feedItems.map((item, i) => (
                    <div key={i} style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '-2rem', width: 16, height: 16, borderRadius: '50%', background: item.dot, border: '3px solid var(--surface-1)' }} />
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                        <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: item.tagColor, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{item.tag}</span>
                      </div>
                      <h4 style={{ fontSize: '1.0625rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{item.title}</h4>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.75rem' }}>{item.body}</p>
                      <button
                        style={{ background: 'transparent', border: 'none', color: item.ctaColor, fontSize: '0.8125rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', padding: 0 }}
                        onClick={() => navigate(item.route)}
                      >
                        {item.cta} <ArrowUpRight size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* TAB: COGNITIVE ANALYTICS */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {activeTab === 'analytics' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '3.5rem' }}>

            {/* Left: Mastery Heatmap */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)' }}>Batch Mastery Heatmap</h2>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>AI-aggregated cognitive data for your active cohorts.</p>
                </div>
                {courses.length > 0 && (
                  <select className="input" style={{ width: 'auto', fontSize: '0.875rem', fontWeight: 700 }}>
                    {courses.map(c => <option key={c.id}>{c.title}</option>)}
                  </select>
                )}
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
                    {batchSkills.map(skill => {
                      const color = skill.mastery < 40 ? '#ef4444' : skill.mastery < 70 ? '#f59e0b' : '#10b981';
                      return (
                        <tr key={skill.topic} style={{ borderBottom: '1px solid var(--surface-2)' }}>
                          <td style={{ padding: '1rem', fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-primary)' }}>{skill.topic}</td>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <span style={{ fontSize: '0.875rem', fontWeight: 900, color, width: 36 }}>{skill.mastery}%</span>
                              <div style={{ width: 100, height: 6, background: 'var(--surface-2)', borderRadius: 999 }}>
                                <div style={{ width: `${skill.mastery}%`, height: '100%', background: color, borderRadius: 999, transition: 'width 0.8s ease' }} />
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: skill.mastery < 40 ? '#ef4444' : 'var(--text-secondary)', background: skill.mastery < 40 ? '#fef2f2' : 'var(--surface-1)', padding: '4px 10px', borderRadius: 8 }}>
                              {skill.recommendation}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Trend Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '2rem' }}>
                {[
                  { label: 'Avg Mastery', value: `${Math.round(batchSkills.reduce((s, k) => s + k.mastery, 0) / batchSkills.length)}%`, icon: TrendingUp, color: '#0891b2' },
                  { label: 'Struggling Topics', value: batchSkills.filter(k => k.mastery < 40).length, icon: ShieldAlert, color: '#ef4444' },
                  { label: 'Ready to Advance', value: batchSkills.filter(k => k.mastery >= 80).length, icon: CheckCircle2, color: '#10b981' },
                ].map(stat => (
                  <div key={stat.label} style={{ background: 'var(--surface-0)', border: '1px solid var(--surface-3)', borderRadius: 16, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <stat.icon size={20} color={stat.color} />
                    <span style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>{stat.value}</span>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: At-Risk Students */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 20, padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
                  <AlertCircle size={18} color="#ef4444" />
                  <h3 style={{ fontSize: '1rem', fontWeight: 900, color: '#991b1b' }}>At-Risk Students</h3>
                </div>
                <p style={{ fontSize: '0.8125rem', color: '#b91c1c', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                  AI identified students whose performance dropped significantly in the last 2 weeks.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {['Rahul M.', 'Priya S.', 'Arun K.', 'Meena T.'].map(student => (
                    <div key={student} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '0.75rem 1rem', borderRadius: 12, border: '1px solid #fca5a5' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.875rem', color: '#991b1b' }}>
                          {student.charAt(0)}
                        </div>
                        <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#7f1d1d' }}>{student}</span>
                      </div>
                      <button
                        onClick={() => navigate('/teacher/inbox')}
                        style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', padding: '4px 8px', borderRadius: 6, transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        Message
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Sessions Widget */}
              {!loadingLive && liveSessions.length > 0 && (
                <div style={{ background: 'var(--surface-0)', border: '1px solid var(--surface-3)', borderRadius: 20, padding: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
                    <Radio size={16} color="var(--brand-600)" />
                    <h3 style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-primary)' }}>Recent Sessions</h3>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {liveSessions.slice(0, 3).map(s => (
                      <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.625rem 0', borderBottom: '1px solid var(--surface-2)' }}>
                        <div>
                          <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>{s.title}</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{s.status}</p>
                        </div>
                        <span style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '3px 8px', borderRadius: 6, background: s.status === 'live' ? '#fef2f2' : s.status === 'scheduled' ? '#fffbeb' : 'var(--surface-2)', color: s.status === 'live' ? '#dc2626' : s.status === 'scheduled' ? '#d97706' : 'var(--text-muted)' }}>
                          {s.status}
                        </span>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => navigate('/teacher/live')} style={{ marginTop: '1rem', background: 'transparent', border: 'none', color: 'var(--brand-600)', fontSize: '0.8125rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', padding: 0 }}>
                    View All Sessions <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
