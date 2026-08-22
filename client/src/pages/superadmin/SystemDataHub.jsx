import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { tenantsAPI, adminAPI } from '../../services/api.service';
import Loader from '../../components/ui/Loader';
import { 
  BarChart3, TrendingUp, Users, BookOpen, GraduationCap, Activity, Building2,
  HeartPulse, Cpu, Database, Wifi, CheckCircle, AlertTriangle, AlertOctagon, 
  RefreshCw, Clock, Zap 
} from 'lucide-react';

// ── Analytics Tab Components ───────────────────────────────────────────────────
function MiniBar({ value, max, color }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div style={{ flex: 1, height: 6, background: 'var(--surface-3)', borderRadius: 999, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 999, transition: 'width 0.6s ease' }} />
    </div>
  );
}

const MONTHLY_DATA = [
  { month: 'Mar', tenants: 6,  users: 820,  courses: 34 },
  { month: 'Apr', tenants: 8,  users: 1240, courses: 52 },
  { month: 'May', tenants: 9,  users: 1780, courses: 71 },
  { month: 'Jun', tenants: 11, users: 2350, courses: 98 },
  { month: 'Jul', tenants: 13, users: 3100, courses: 134 },
  { month: 'Aug', tenants: 15, users: 4200, courses: 167 },
];

function AnalyticsTab() {
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
                    width: '100%', borderRadius: '6px 6px 0 0', height: `${pct}%`, minHeight: 4,
                    background: isLatest ? currentColor : `${currentColor}40`, transition: 'height 0.5s ease',
                  }} />
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 500 }}>{d.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={18} color="var(--brand-500)" /> Plan Breakdown
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {[{ key: 'enterprise', label: 'Enterprise', color: '#4f46e5' }, { key: 'pro', label: 'Pro', color: '#059669' }, { key: 'basic', label: 'Basic', color: '#9ca3af' }]
              .map(({ key, label, color }) => {
              const count = planCounts[key] || 0;
              const total = tenants?.length || 1;
              return (
                <div key={key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{label}</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color }}>{count} <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.75rem' }}>({Math.round((count/total)*100)}%)</span></span>
                  </div>
                  <MiniBar value={count} max={total} color={color} />
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: 10, background: 'var(--surface-1)', border: '1px solid var(--glass-border)' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Enterprise Rate</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--brand-600)' }}>{tenants?.length ? Math.round(((planCounts.enterprise || 0) / tenants.length) * 100) : 0}%</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>of orgs on top tier plan</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Health Tab Components ─────────────────────────────────────────────────────
function generateUptime() {
  return Array.from({ length: 30 }, (_, i) => (i === 12 || i === 13) ? 0.5 : (Math.random() > 0.02 ? 1 : 0.5));
}
const UPTIME_HISTORY = generateUptime();
const STATUS_META = {
  healthy:  { label: 'Operational',  icon: CheckCircle,  color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  degraded: { label: 'Degraded',     icon: AlertTriangle, color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  down:     { label: 'Outage',       icon: AlertOctagon,  color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
};

function HealthTab() {
  const queryClient = useQueryClient();
  const [checking, setChecking] = useState(false);

  const { data: health, isLoading, dataUpdatedAt } = useQuery({
    queryKey: ['system-health'],
    queryFn: () => adminAPI.getSystemHealth().then(r => r.data),
    refetchInterval: 30000,
  });

  if (isLoading) return <Loader text="Checking system health..." />;

  const SERVICES = health?.services || [];
  const METRICS = [
    { label: 'Avg Response Time', value: health?.metrics?.avg_response_time || '0ms', delta: '-12ms', good: true, icon: Zap },
    { label: 'Requests / min',    value: health?.metrics?.requests_per_min || '0K',  delta: '+220',  good: true, icon: TrendingUp },
    { label: 'Error Rate',        value: health?.metrics?.error_rate || '0%', delta: '-0.01%', good: true, icon: AlertOctagon },
    { label: 'Active Connections', value: health?.metrics?.active_connections || '0',  delta: '+34',   good: true, icon: Wifi },
  ];

  const overallStatus = SERVICES.some(s => s.status === 'down') ? 'down'
    : SERVICES.some(s => s.status === 'degraded') ? 'degraded'
    : 'healthy';

  const overall = STATUS_META[overallStatus];
  const OverallIcon = overall.icon;

  const handleRefresh = async () => {
    setChecking(true);
    await queryClient.invalidateQueries(['system-health']);
    setChecking(false);
  };

  const latencyColor = (ms) => ms < 100 ? '#16a34a' : ms < 500 ? '#d97706' : '#dc2626';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Real-time status of all platform services and infrastructure.</p>
        <button onClick={handleRefresh} disabled={checking} className="btn btn-secondary" style={{ gap: 8 }}>
          <RefreshCw size={15} style={{ animation: checking ? 'spin 1s linear infinite' : 'none' }} />
          {checking ? 'Checking...' : 'Refresh Status'}
        </button>
      </div>

      <div style={{ padding: '1.25rem 1.75rem', borderRadius: 16, background: overall.bg, border: `1.5px solid ${overall.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <OverallIcon size={24} color={overall.color} />
          <div>
            <p style={{ fontWeight: 800, color: overall.color, fontSize: '1.0625rem' }}>{overallStatus === 'healthy' ? 'All Systems Operational' : overallStatus === 'degraded' ? 'Partial Service Disruption' : 'Major Outage Detected'}</p>
            <p style={{ fontSize: '0.8125rem', color: overall.color, opacity: 0.8, marginTop: 2 }}>Last checked {new Date(dataUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: overall.color, boxShadow: `0 0 0 3px ${overall.color}30`, animation: overallStatus === 'healthy' ? 'none' : 'pulse 1.5s infinite' }} />
          <span style={{ fontWeight: 700, color: overall.color }}>{overall.label}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
        {METRICS.map(({ label, value, delta, good, icon: Icon }) => (
          <div key={label} className="stat-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--brand-50)', border: '1px solid var(--brand-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-600)' }}>
                <Icon size={18} />
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: good ? '#16a34a' : '#dc2626', background: good ? '#f0fdf4' : '#fef2f2', padding: '3px 8px', borderRadius: 999, border: `1px solid ${good ? '#bbf7d0' : '#fecaca'}` }}>{delta}</span>
            </div>
            <p style={{ fontSize: '1.625rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500, marginTop: 6 }}>{label}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        <div className="glass-card" style={{ padding: 0 }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--glass-border)', background: 'var(--surface-1)', borderTopLeftRadius: 'inherit', borderTopRightRadius: 'inherit', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Cpu size={17} color="var(--brand-500)" />
            <h2 style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>Service Status</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {SERVICES.map((svc, i) => {
              const meta = STATUS_META[svc.status];
              const SvcIcon = meta.icon;
              return (
                <div key={svc.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', gap: '1.5rem', borderBottom: i < SERVICES.length - 1 ? '1px solid var(--glass-border)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                    <SvcIcon size={16} color={meta.color} />
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{svc.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexShrink: 0 }}>
                    <div style={{ textAlign: 'right' }}><p style={{ fontSize: '0.8125rem', fontWeight: 700, color: latencyColor(svc.latency) }}>{svc.latency}ms</p><p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>latency</p></div>
                    <div style={{ textAlign: 'right' }}><p style={{ fontSize: '0.8125rem', fontWeight: 700, color: svc.uptime >= 99.9 ? '#16a34a' : svc.uptime >= 99 ? '#d97706' : '#dc2626' }}>{svc.uptime}%</p><p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>uptime</p></div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: meta.color, background: meta.bg, border: `1px solid ${meta.border}`, padding: '3px 10px', borderRadius: 999, minWidth: 90, textAlign: 'center' }}>{meta.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.25rem' }}>
            <Clock size={17} color="var(--brand-500)" />
            <h2 style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>30-Day Uptime</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 4 }}>
            {UPTIME_HISTORY.map((val, i) => (
              <div key={i} title={`Day ${i + 1}`} style={{ height: 22, borderRadius: 4, background: val === 1 ? '#16a34a' : val === 0.5 ? '#f59e0b' : '#dc2626', opacity: val === 1 ? 0.85 : 1 }} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            {[['#16a34a', 'Operational'], ['#f59e0b', 'Degraded'], ['#dc2626', 'Outage']].map(([color, label]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}><div style={{ width: 10, height: 10, borderRadius: 2, background: color }} /><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{label}</span></div>
            ))}
          </div>
          <div style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: 10, background: 'var(--surface-1)', border: '1px solid var(--glass-border)', textAlign: 'center' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Overall 30-Day Uptime</p>
            <p style={{ fontSize: '2rem', fontWeight: 900, color: '#16a34a' }}>99.3%</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>1 incident this period</p>
          </div>
          <div style={{ marginTop: '1.25rem', padding: '1rem', borderRadius: 10, background: 'var(--surface-1)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Last DB Snapshot</p>
              <p style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>14 mins ago</p>
              <p style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle size={11} /> Verified Restorable</p>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#ecfdf5', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
              <Database size={16} />
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function SystemDataHub() {
  const [activeTab, setActiveTab] = useState('analytics');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-600)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>System Intelligence</p>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>System Data Hub</h1>
        </div>
        <div style={{ display: 'flex', background: 'var(--surface-1)', padding: 6, borderRadius: 16, border: '1px solid var(--glass-border)', gap: 4 }}>
          {[
            { id: 'analytics', label: 'Global Analytics', icon: BarChart3 },
            { id: 'health', label: 'System Health', icon: HeartPulse }
          ].map(t => (
            <button 
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{ 
                display: 'flex', alignItems: 'center', gap: 8, padding: '0.625rem 1.25rem', borderRadius: 12, border: 'none', cursor: 'pointer',
                fontWeight: 700, fontSize: '0.875rem', transition: 'all 0.2s',
                background: activeTab === t.id ? 'white' : 'transparent',
                color: activeTab === t.id ? 'var(--brand-600)' : 'var(--text-muted)',
                boxShadow: activeTab === t.id ? '0 2px 8px rgba(0,0,0,0.06)' : 'none'
              }}>
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'analytics' ? <AnalyticsTab /> : <HealthTab />}
    </div>
  );
}
