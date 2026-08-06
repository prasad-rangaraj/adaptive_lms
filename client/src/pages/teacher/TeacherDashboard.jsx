import { LayoutDashboard, TrendingUp, Users, AlertTriangle, Star, Brain, ArrowRight, MoreHorizontal } from 'lucide-react';

const stats = [
  { label: 'Total Students', value: '248', icon: Users, color: '#6366f1', bg: '#eef2ff', change: '+12 this week' },
  { label: 'Avg. Class Score', value: '76%', icon: Star, color: '#f59e0b', bg: '#fffbeb', change: '+3% from last week' },
  { label: 'At-Risk Students', value: '12', icon: AlertTriangle, color: '#ef4444', bg: '#fef2f2', change: '-2 improved' },
  { label: 'Completion Rate', value: '68%', icon: TrendingUp, color: '#10b981', bg: '#f0fdf4', change: '+5% this month' },
];

const topStudents = [
  { name: 'Priya Sharma', score: 96, track: 'Advanced', avatar: 'P', color: '#6366f1' },
  { name: 'Arjun Mehta', score: 91, track: 'Advanced', avatar: 'A', color: '#10b981' },
  { name: 'Fatima Al-Hassan', score: 88, track: 'Standard', avatar: 'F', color: '#f59e0b' },
  { name: 'Liu Wei', score: 85, track: 'Advanced', avatar: 'L', color: '#0ea5e9' },
];

const atRiskStudents = [
  { name: 'Ravi Kumar', score: 42, risk: 78, issue: 'Low attendance' },
  { name: 'Mei Lin', score: 38, risk: 85, issue: 'Failing quizzes' },
  { name: 'Tom Bradley', score: 51, risk: 62, issue: 'Inconsistent effort' },
];

export default function TeacherDashboard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Teacher Dashboard</h1>
          <p className="page-subtitle">Class performance overview and AI-driven student insights.</p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        {stats.map(({ label, value, icon: Icon, color, bg, change }, i) => (
          <div key={label} className="stat-card animate-fade-up" style={{ animationDelay: `${i * 0.07}s`, opacity: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.875rem' }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={19} color={color} />
              </div>
            </div>
            <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</p>
            <p style={{ fontSize: '0.8125rem', color: '#6b7280', marginTop: 4 }}>{label}</p>
            <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: 6, borderTop: '1px solid #f0f1f3', paddingTop: 8 }}>{change}</p>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Top Performers */}
        <div className="card animate-fade-up delay-200" style={{ padding: '1.5rem', opacity: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Star size={17} color="#f59e0b" /> Top Performers
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {topStudents.map((s, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '0.75rem',
                borderRadius: 12, background: i === 0 ? '#fafbff' : 'transparent',
                border: i === 0 ? '1px solid #e0e7ff' : '1px solid transparent',
                transition: 'all 0.18s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = '#f9fbff'; e.currentTarget.style.borderColor = '#e0e7ff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = i === 0 ? '#fafbff' : 'transparent'; e.currentTarget.style.borderColor = i === 0 ? '#e0e7ff' : 'transparent'; }}
              >
                <span style={{ fontWeight: 800, color: '#9ca3af', fontSize: '0.8125rem', width: 18, textAlign: 'right' }}>#{i + 1}</span>
                <div className="avatar" style={{ width: 34, height: 34, fontSize: '0.8125rem', background: `linear-gradient(135deg, ${s.color}, ${s.color}99)` }}>
                  {s.avatar}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>{s.name}</p>
                  <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{s.track} Track</p>
                </div>
                <div style={{
                  padding: '4px 10px', borderRadius: 999,
                  background: '#f0fdf4', color: '#059669',
                  fontSize: '0.8125rem', fontWeight: 700,
                }}>
                  {s.score}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* At-Risk */}
        <div className="card animate-fade-up delay-300" style={{ padding: '1.5rem', opacity: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Brain size={17} color="#ef4444" /> At-Risk Students
            </h2>
            <span className="badge badge-danger">{atRiskStudents.length} flagged</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {atRiskStudents.map((s, i) => (
              <div key={i} style={{
                padding: '0.875rem 1rem', borderRadius: 12,
                background: '#fef2f2', border: '1px solid #fecaca',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <p style={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>{s.name}</p>
                    <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: 2 }}>{s.issue}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Risk</p>
                    <p style={{ fontWeight: 800, color: '#dc2626', fontSize: '0.9375rem' }}>{s.risk}%</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div className="progress-bar" style={{ flex: 1 }}>
                    <div className="progress-fill" style={{ width: `${s.score}%`, background: '#ef4444' }} />
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', flexShrink: 0 }}>{s.score}% score</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
