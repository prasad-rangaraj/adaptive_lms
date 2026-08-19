import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tenantsAPI } from '../../services/api.service';
import { BarChart3, TrendingUp, Users, BookOpen, GraduationCap, Activity, Building2 } from 'lucide-react';
import Loader from '../../components/ui/Loader';

// CSS-only mini bar chart
function MiniBar({ value, max, color }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div style={{ flex: 1, height: 6, background: 'var(--surface-3)', borderRadius: 999, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 999, transition: 'width 0.6s ease' }} />
    </div>
  );
}

// Mock monthly growth data
const MONTHLY_DATA = [
  { month: 'Mar', tenants: 6,  users: 820,  courses: 34 },
  { month: 'Apr', tenants: 8,  users: 1240, courses: 52 },
  { month: 'May', tenants: 9,  users: 1780, courses: 71 },
  { month: 'Jun', tenants: 11, users: 2350, courses: 98 },
  { month: 'Jul', tenants: 13, users: 3100, courses: 134 },
  { month: 'Aug', tenants: 15, users: 4200, courses: 167 },
];

const MAX_USERS = Math.max(...MONTHLY_DATA.map(d => d.users));

export default function AnalyticsPage() {
  const [metric, setMetric] = useState('users');

  const { data: tenants, isLoading } = useQuery({
    queryKey: ['tenants'],
    queryFn: () => tenantsAPI.list().then(r => r.data),
  });

  if (isLoading) return <Loader text="Compiling analytics..." />;

  const activeTenants = tenants?.filter(t => t.is_active).length || 0;
  const planCounts = tenants?.reduce((acc, t) => { acc[t.plan] = (acc[t.plan] || 0) + 1; return acc; }, {}) || {};
  const maxBar = Math.max(...MONTHLY_DATA.map(d => d[metric]));

  const metricColors = { users: 'var(--brand-500)', tenants: '#7c3aed', courses: '#059669' };
  const currentColor = metricColors[metric];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title">Platform Analytics</h1>
          <p className="page-subtitle">Growth trends, engagement metrics, and platform health.</p>
        </div>
      </div>

      {/* Top KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
        {[
          { label: 'Total Organizations', value: tenants?.length || 0, sub: `${activeTenants} active`, icon: Building2, color: '#4f46e5', bg: '#eef2ff', border: '#c7d2fe' },
          { label: 'Estimated Users', value: '4,821', sub: '+384 this month', icon: Users, color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
          { label: 'Total Courses', value: '167', sub: '+33 this month', icon: BookOpen, color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
          { label: 'Completions', value: '89.2%', sub: 'avg completion rate', icon: GraduationCap, color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
        ].map(({ label, value, sub, icon: Icon, color, bg, border }) => (
          <div key={label} className="stat-card" style={{ padding: '1.5rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: bg, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, marginBottom: '1rem' }}>
              <Icon size={20} />
            </div>
            <p style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-0.03em' }}>{value}</p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500, marginTop: 6 }}>{label}</p>
            <p style={{ fontSize: '0.75rem', color: '#059669', marginTop: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
              <TrendingUp size={11} /> {sub}
            </p>
          </div>
        ))}
      </div>

      {/* Growth Chart + Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Growth Chart */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <BarChart3 size={18} color="var(--brand-500)" /> Growth Trend (6 months)
            </h2>
            <div style={{ display: 'flex', gap: 4 }}>
              {[['users', 'Users'], ['tenants', 'Orgs'], ['courses', 'Courses']].map(([key, label]) => (
                <button key={key} onClick={() => setMetric(key)} style={{
                  padding: '4px 10px', borderRadius: 6, border: `1.5px solid`,
                  borderColor: metric === key ? currentColor : 'var(--glass-border)',
                  background: metric === key ? `${currentColor}15` : 'transparent',
                  color: metric === key ? currentColor : 'var(--text-muted)',
                  fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                }}>{label}</button>
              ))}
            </div>
          </div>

          {/* Bar chart */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: 160 }}>
            {MONTHLY_DATA.map((d, i) => {
              const val = d[metric];
              const pct = maxBar > 0 ? (val / maxBar) * 100 : 0;
              const isLatest = i === MONTHLY_DATA.length - 1;
              return (
                <div key={d.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: isLatest ? currentColor : 'var(--text-muted)' }}>
                    {typeof val === 'number' && val >= 1000 ? `${(val/1000).toFixed(1)}k` : val}
                  </span>
                  <div style={{
                    width: '100%', borderRadius: '6px 6px 0 0',
                    height: `${pct}%`, minHeight: 4,
                    background: isLatest ? currentColor : `${currentColor}40`,
                    transition: 'height 0.5s ease',
                  }} />
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 500 }}>{d.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Plan Breakdown */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={18} color="var(--brand-500)" /> Plan Breakdown
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {[
              { key: 'enterprise', label: 'Enterprise', color: '#4f46e5' },
              { key: 'pro',        label: 'Pro',        color: '#059669' },
              { key: 'basic',      label: 'Basic',      color: '#9ca3af' },
            ].map(({ key, label, color }) => {
              const count = planCounts[key] || 0;
              const total = tenants?.length || 1;
              return (
                <div key={key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{label}</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color }}>
                      {count} <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.75rem' }}>({Math.round((count/total)*100)}%)</span>
                    </span>
                  </div>
                  <MiniBar value={count} max={total} color={color} />
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: 10, background: 'var(--surface-1)', border: '1px solid var(--glass-border)' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Enterprise Rate</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--brand-600)' }}>
              {tenants?.length ? Math.round(((planCounts.enterprise || 0) / tenants.length) * 100) : 0}%
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>of orgs on top tier plan</p>
          </div>
        </div>
      </div>
    </div>
  );
}
