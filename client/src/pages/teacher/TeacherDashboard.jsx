import { TrendingUp, Users, AlertTriangle, Star, Brain, Shield } from 'lucide-react';

const stats = [
  { label: 'Total Students', value: '248', icon: Users, color: '#4f46e5', bg: '#eef2ff', border: '#c7d2fe', change: '+12 this week', up: true },
  { label: 'Avg. Class Score', value: '76%', icon: Star, color: '#d97706', bg: '#fffbeb', border: '#fde68a', change: '+3% from last week', up: true },
  { label: 'At-Risk Students', value: '12', icon: AlertTriangle, color: '#be185d', bg: '#fdf2f8', border: '#fbcfe8', change: '-2 improved', up: true },
  { label: 'Completion Rate', value: '68%', icon: TrendingUp, color: '#059669', bg: '#ecfdf5', border: '#bbf7d0', change: '+5% this month', up: true },
];

const topStudents = [
  { name: 'Priya Sharma', score: 96, track: 'Advanced', avatar: 'P', gradient: 'linear-gradient(135deg, #4f46e5, #7c3aed)', glow: 'rgba(99,102,241,0.4)' },
  { name: 'Arjun Mehta', score: 91, track: 'Advanced', avatar: 'A', gradient: 'linear-gradient(135deg, #059669, #0d9488)', glow: 'rgba(16,185,129,0.4)' },
  { name: 'Fatima Al-Hassan', score: 88, track: 'Standard', avatar: 'F', gradient: 'linear-gradient(135deg, #d97706, #b45309)', glow: 'rgba(245,158,11,0.4)' },
  { name: 'Liu Wei', score: 85, track: 'Advanced', avatar: 'L', gradient: 'linear-gradient(135deg, #0369a1, #0ea5e9)', glow: 'rgba(14,165,233,0.4)' },
];

const atRiskStudents = [
  { name: 'Ravi Kumar', score: 42, risk: 78, issue: 'Low attendance', riskColor: '#f472b6' },
  { name: 'Mei Lin', score: 38, risk: 85, issue: 'Failing quizzes', riskColor: '#ef4444' },
  { name: 'Tom Bradley', score: 51, risk: 62, issue: 'Inconsistent effort', riskColor: '#fcd34d' },
];

const rankMedals = ['🥇', '🥈', '🥉', '4️⃣'];

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
        {stats.map(({ label, value, icon: Icon, color, bg, border, change, up }, i) => (
          <div key={label} className="stat-card animate-fade-up" style={{ animationDelay: `${i * 0.07}s` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: bg, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 16px ${color}20` }}>
                <Icon size={20} color={color} />
              </div>
              <span style={{ fontSize: '0.7rem', color: up ? '#059669' : '#be185d', background: up ? '#ecfdf5' : '#fdf2f8', padding: '2px 8px', borderRadius: 999, border: `1px solid ${up ? '#bbf7d0' : '#fbcfe8'}` }}>{change}</span>
            </div>
            <p style={{ fontSize: '1.875rem', fontWeight: 900, color: '#111827', letterSpacing: '-0.04em', lineHeight: 1 }}>{value}</p>
            <p style={{ fontSize: '0.8125rem', color: '#6b7280', marginTop: 6 }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

        {/* Top Performers */}
        <div className="card animate-fade-up delay-200" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Star size={17} color="#fcd34d" /> Top Performers
            </h2>
            <span className="badge badge-brand">{topStudents.length} students</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {topStudents.map((s, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '0.75rem',
                borderRadius: 12,
                background: i === 0 ? '#fafbff' : '#ffffff',
                border: i === 0 ? '1px solid #e0e7ff' : '1px solid #f0f1f3',
                transition: 'all 0.18s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = '#f5f7ff'; e.currentTarget.style.borderColor = '#e0e7ff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = i === 0 ? '#fafbff' : '#ffffff'; e.currentTarget.style.borderColor = i === 0 ? '#e0e7ff' : '#f0f1f3'; }}
              >
                <span style={{ fontWeight: 800, color: 'var(--text-muted)', fontSize: '1rem', width: 24, textAlign: 'center', flexShrink: 0 }}>{rankMedals[i]}</span>
                <div className="avatar" style={{ width: 34, height: 34, fontSize: '0.8125rem', background: s.gradient, boxShadow: `0 4px 10px ${s.glow}`, flexShrink: 0 }}>
                  {s.avatar}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{s.name}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.track} Track</p>
                </div>
                <div style={{
                  padding: '4px 12px', borderRadius: 999,
                  background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
                  color: '#059669', fontSize: '0.8125rem', fontWeight: 700,
                }}>
                  {s.score}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* At-Risk */}
        <div className="card animate-fade-up delay-300" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Brain size={17} color="#f472b6" /> At-Risk Students
            </h2>
            <span className="badge badge-danger">{atRiskStudents.length} flagged</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {atRiskStudents.map((s, i) => (
              <div key={i} style={{
                padding: '1rem', borderRadius: 12,
                background: '#ffffff',
                border: `1px solid ${s.riskColor}20`,
                borderLeft: `3px solid ${s.riskColor}90`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{s.name}</p>
                    <p style={{ fontSize: '0.75rem', color: s.riskColor, marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Shield size={11} /> {s.issue}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Risk Score</p>
                    <p style={{ fontWeight: 900, color: s.riskColor, fontSize: '1.125rem', letterSpacing: '-0.03em' }}>{s.risk}%</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div className="progress-bar" style={{ flex: 1 }}>
                    <div className="progress-fill" style={{ width: `${s.score}%`, background: s.riskColor }} />
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', flexShrink: 0 }}>{s.score}% score</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
