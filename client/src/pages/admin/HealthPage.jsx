import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../../services/api.service';
import Loader from '../../components/ui/Loader';
import {
  HeartPulse, Cpu, Database, Wifi, CheckCircle, AlertTriangle,
  AlertOctagon, RefreshCw, Clock, TrendingUp, Zap,
} from 'lucide-react';

// Uptime generator
function generateUptime() {
  return Array.from({ length: 30 }, (_, i) => {
    if (i === 12 || i === 13) return 0.5; // simulated incident
    return Math.random() > 0.02 ? 1 : 0.5;
  });
}

const UPTIME_HISTORY = generateUptime();

const STATUS_META = {
  healthy:  { label: 'Operational',  icon: CheckCircle,  color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  degraded: { label: 'Degraded',     icon: AlertTriangle, color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  down:     { label: 'Outage',       icon: AlertOctagon,  color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
};


export default function HealthPage() {
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
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title">System Health</h1>
          <p className="page-subtitle">Real-time status of all platform services and infrastructure.</p>
        </div>
        <button onClick={handleRefresh} disabled={checking} className="btn btn-secondary" style={{ gap: 8 }}>
          <RefreshCw size={15} style={{ animation: checking ? 'spin 1s linear infinite' : 'none' }} />
          {checking ? 'Checking...' : 'Refresh'}
        </button>
      </div>

      {/* Overall status banner */}
      <div style={{ padding: '1.25rem 1.75rem', borderRadius: 16, background: overall.bg, border: `1.5px solid ${overall.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <OverallIcon size={24} color={overall.color} />
          <div>
            <p style={{ fontWeight: 800, color: overall.color, fontSize: '1.0625rem' }}>
              {overallStatus === 'healthy' ? 'All Systems Operational' : overallStatus === 'degraded' ? 'Partial Service Disruption' : 'Major Outage Detected'}
            </p>
            <p style={{ fontSize: '0.8125rem', color: overall.color, opacity: 0.8, marginTop: 2 }}>
              Last checked {new Date(dataUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: overall.color, boxShadow: `0 0 0 3px ${overall.color}30`, animation: overallStatus === 'healthy' ? 'none' : 'pulse 1.5s infinite' }} />
          <span style={{ fontWeight: 700, color: overall.color }}>{overall.label}</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
        {METRICS.map(({ label, value, delta, good, icon: Icon }) => (
          <div key={label} className="stat-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--brand-50)', border: '1px solid var(--brand-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-600)' }}>
                <Icon size={18} />
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: good ? '#16a34a' : '#dc2626', background: good ? '#f0fdf4' : '#fef2f2', padding: '3px 8px', borderRadius: 999, border: `1px solid ${good ? '#bbf7d0' : '#fecaca'}` }}>
                {delta}
              </span>
            </div>
            <p style={{ fontSize: '1.625rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500, marginTop: 6 }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Services Table + Uptime History */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>

        {/* Service Status Table */}
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
                <div key={svc.name} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '1rem 1.5rem', gap: '1.5rem',
                  borderBottom: i < SERVICES.length - 1 ? '1px solid var(--glass-border)' : 'none',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                    <SvcIcon size={16} color={meta.color} />
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{svc.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexShrink: 0 }}>
                    {/* Latency */}
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: latencyColor(svc.latency) }}>{svc.latency}ms</p>
                      <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>latency</p>
                    </div>
                    {/* Uptime */}
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: svc.uptime >= 99.9 ? '#16a34a' : svc.uptime >= 99 ? '#d97706' : '#dc2626' }}>{svc.uptime}%</p>
                      <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>uptime</p>
                    </div>
                    {/* Status Badge */}
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: meta.color, background: meta.bg, border: `1px solid ${meta.border}`, padding: '3px 10px', borderRadius: 999, minWidth: 90, textAlign: 'center' }}>
                      {meta.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 30-day Uptime Calendar */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.25rem' }}>
            <Clock size={17} color="var(--brand-500)" />
            <h2 style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>30-Day Uptime</h2>
          </div>

          {/* Grid of day boxes */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 4 }}>
            {UPTIME_HISTORY.map((val, i) => (
              <div
                key={i}
                title={`Day ${i + 1}: ${val === 1 ? 'Operational' : val === 0.5 ? 'Degraded' : 'Outage'}`}
                style={{
                  height: 22, borderRadius: 4,
                  background: val === 1 ? '#16a34a' : val === 0.5 ? '#f59e0b' : '#dc2626',
                  opacity: val === 1 ? 0.85 : 1,
                  cursor: 'default',
                }}
              />
            ))}
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            {[['#16a34a', 'Operational'], ['#f59e0b', 'Degraded'], ['#dc2626', 'Outage']].map(([color, label]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{label}</span>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: 10, background: 'var(--surface-1)', border: '1px solid var(--glass-border)', textAlign: 'center' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Overall 30-Day Uptime</p>
            <p style={{ fontSize: '2rem', fontWeight: 900, color: '#16a34a' }}>99.3%</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>1 incident this period</p>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
    </div>
  );
}
