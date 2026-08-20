import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tenantsAPI } from '../../services/api.service';
import { useAuthStore } from '../../store/authStore';
import { ClipboardList, Download, Search, User, BookOpen, Database, Shield, RefreshCw, Activity, Filter } from 'lucide-react';
import Loader from '../../components/ui/Loader';

// ── Action badge colours ────────────────────────────────────────────────────
const ACTION_STYLE = {
  CREATE: { bg: '#ecfdf5', color: '#059669', border: '#bbf7d0' },
  UPDATE: { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
  DELETE: { bg: '#fff1f2', color: '#e11d48', border: '#fecdd3' },
  LOGIN:  { bg: '#f0f9ff', color: '#0284c7', border: '#bae6fd' },
  SUSPEND:{ bg: '#fdf4ff', color: '#9333ea', border: '#e9d5ff' },
};

const RESOURCE_ICON = {
  user:   User,
  course: BookOpen,
  tenant: Database,
  auth:   Shield,
};

function timeAgo(isoStr) {
  if (!isoStr) return '—';
  const diff = Date.now() - new Date(isoStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function OrgAuditLogsPage() {
  const { user } = useAuthStore();
  const tenantId = user?.tenant_id;
  const [search, setSearch] = useState('');

  const { data: logs, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['tenant-audit-logs', tenantId],
    queryFn: () => tenantsAPI.getAuditLogs(tenantId).then(r => r.data),
    enabled: !!tenantId,
    refetchInterval: 30000,
  });

  if (isLoading) return <Loader text="Loading audit trail..." />;

  const allLogs = logs || [];
  const filtered = allLogs.filter(l =>
    l.action?.toLowerCase().includes(search.toLowerCase()) ||
    l.resource?.toLowerCase().includes(search.toLowerCase()) ||
    l.actor_name?.toLowerCase().includes(search.toLowerCase()) ||
    l.actor_email?.toLowerCase().includes(search.toLowerCase())
  );

  const actionCounts = allLogs.reduce((acc, l) => {
    const k = l.action?.toUpperCase() || 'OTHER';
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});

  return (
    <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'flex-start' }}>

      {/* ── Left: Audit Log Canvas ── */}
      <div style={{ flex: 1, background: 'var(--surface-1)', borderRadius: 24, border: '1px solid var(--glass-border)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
        
        {/* Header & Search */}
        <div style={{ padding: '2rem 2.5rem 1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Audit Trail</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginTop: 4 }}>Tamper-proof chronological record of all administrative actions.</p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => refetch()} className="btn btn-ghost" style={{ gap: 6, padding: '0 1.25rem', height: 40, borderRadius: 10 }}>
                <RefreshCw size={14} style={{ animation: isFetching ? 'spin 1s linear infinite' : 'none' }} />
                Refresh
              </button>
              <button className="btn btn-secondary" style={{ gap: 6, padding: '0 1.25rem', height: 40, borderRadius: 10 }}>
                <Download size={14} /> Export CSV
              </button>
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter by action (e.g., CREATE), resource, or user email..."
              style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: 12, border: '1px solid var(--surface-3)', background: 'var(--surface-1)', fontSize: '0.9375rem', outline: 'none', color: 'var(--text-primary)', transition: 'all 0.2s' }}
              onFocus={e => { e.target.style.background = 'white'; e.target.style.borderColor = 'var(--brand-400)'; e.target.style.boxShadow = 'var(--glow-brand)'; }}
              onBlur={e => { e.target.style.background = 'var(--surface-1)'; e.target.style.borderColor = 'var(--surface-3)'; e.target.style.boxShadow = 'none'; }}
            />
          </div>
        </div>

        {/* Seamless Feed */}
        {filtered.length === 0 ? (
          <div style={{ padding: '6rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: 'var(--surface-1)', border: '1px dashed var(--surface-4)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <ClipboardList size={28} color="var(--text-muted)" />
            </div>
            <p style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1.125rem', marginBottom: 4 }}>No audit events found</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>Adjust your filters to see more events.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filtered.map((log, i) => {
              const as = ACTION_STYLE[log.action?.toUpperCase()] || { bg: '#f3f4f6', color: '#6b7280', border: '#e5e7eb' };
              const RI = RESOURCE_ICON[log.resource?.toLowerCase()] || Database;
              const isLast = i === filtered.length - 1;
              
              return (
                <div key={log.id} style={{
                  display: 'grid', gridTemplateColumns: '100px 140px 1fr 2fr auto', gap: '1.5rem', alignItems: 'center',
                  padding: '1.25rem 2.5rem', borderBottom: isLast ? 'none' : '1px solid var(--surface-2)',
                  background: 'transparent', transition: 'background 0.2s'
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Action */}
                  <span style={{ 
                    background: as.bg, color: as.color, border: `1px solid ${as.border}`, 
                    borderRadius: 8, padding: '4px 10px', fontSize: '0.75rem', fontWeight: 800, 
                    textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'center' 
                  }}>
                    {log.action}
                  </span>

                  {/* Resource Info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <RI size={14} color="var(--text-muted)" />
                    </div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, textTransform: 'capitalize' }}>{log.resource}</span>
                  </div>

                  {/* Actor */}
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.actor_name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.actor_email}</p>
                  </div>

                  {/* Details payload */}
                  <div style={{ 
                    background: 'var(--surface-1)', border: '1px solid var(--glass-border)', borderRadius: 8, 
                    padding: '8px 12px', fontSize: '0.75rem', color: 'var(--text-secondary)', 
                    fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' 
                  }}>
                    {log.details ? JSON.stringify(log.details) : 'No payload details'}
                  </div>

                  {/* Time */}
                  <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap', textAlign: 'right', minWidth: 70 }}>
                    {timeAgo(log.created_at)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Right: Insights Panel ── */}
      <div style={{ width: 320, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: '5.5rem' }}>
        
        {/* Compliance Card */}
        <div style={{ background: 'var(--surface-1)', borderRadius: 24, padding: '2rem', border: '1px solid var(--glass-border)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={14} color="var(--brand-500)" /> Activity Breakdown
          </h3>
          
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: '2rem' }}>
            <span style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-0.04em' }}>{allLogs.length}</span>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>total events</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {Object.entries(actionCounts).map(([action, count]) => {
              const s = ACTION_STYLE[action] || { bg: '#f3f4f6', color: '#6b7280', border: '#e5e7eb' };
              const isActive = search.toUpperCase() === action;
              return (
                <button key={action} onClick={() => setSearch(isActive ? '' : action)} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: isActive ? s.bg : 'var(--surface-1)', border: `1px solid ${isActive ? s.border : 'transparent'}`,
                  padding: '0.75rem 1rem', borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s', width: '100%',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = s.bg; e.currentTarget.style.borderColor = s.border; }}
                  onMouseLeave={e => { if(!isActive) { e.currentTarget.style.background = 'var(--surface-1)'; e.currentTarget.style.borderColor = 'transparent'; } }}
                >
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: s.color, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Filter size={12} style={{ opacity: isActive ? 1 : 0.3 }} />
                    {action}
                  </span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}
