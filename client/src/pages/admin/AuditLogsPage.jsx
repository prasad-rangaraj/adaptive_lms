import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '../../services/api.service';
import {
  Activity, RefreshCw, UserPlus, BookOpen, Shield,
  ShieldAlert, Globe, User as UserIcon, Search, Filter,
  CheckCircle, AlertTriangle, AlertOctagon, Info, Download, Calendar
} from 'lucide-react';
import Loader from '../../components/ui/Loader';

const ACTION_CONFIG = {
  // Green — creation / positive
  user_created:       { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', icon: UserPlus,       label: 'User Created',        severity: 'success' },
  course_published:   { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', icon: BookOpen,       label: 'Course Published',    severity: 'success' },
  // Red — destructive
  tenant_suspended:   { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', icon: AlertOctagon,   label: 'Tenant Suspended',    severity: 'danger' },
  user_deleted:       { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', icon: AlertOctagon,   label: 'User Deleted',        severity: 'danger' },
  // Amber — security
  impersonation_started: { color: '#d97706', bg: '#fffbeb', border: '#fde68a', icon: Shield,      label: 'Impersonation',       severity: 'warning' },
  // Cyan — default
  default:            { color: '#0e7490', bg: '#ecfeff', border: '#a5f3fc', icon: Info,           label: 'System Event',        severity: 'info' },
};

function getActionConfig(action) {
  return ACTION_CONFIG[action] || ACTION_CONFIG.default;
}

const SEVERITY_FILTERS = [
  { key: 'all',     label: 'All Events',  icon: Filter },
  { key: 'success', label: 'Success',     icon: CheckCircle },
  { key: 'danger',  label: 'Critical',    icon: AlertOctagon },
  { key: 'warning', label: 'Security',    icon: AlertTriangle },
  { key: 'info',    label: 'Info',        icon: Info },
];

const DATE_RANGES = [
  { key: 'all',  label: 'All Time' },
  { key: '1d',   label: 'Today' },
  { key: '7d',   label: 'Last 7 Days' },
  { key: '30d',  label: 'Last 30 Days' },
];

export default function AuditLogsPage() {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');

  const { data: logs, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => adminAPI.listAuditLogs().then(r => r.data),
  });

  const inDateRange = (log) => {
    if (dateRange === 'all') return true;
    const ms = { '1d': 86400000, '7d': 604800000, '30d': 2592000000 }[dateRange];
    return Date.now() - new Date(log.created_at).getTime() <= ms;
  };

  const filtered = logs?.filter(log => {
    const matchSearch = log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.resource.toLowerCase().includes(search.toLowerCase());
    const cfg = getActionConfig(log.action);
    const matchSeverity = severityFilter === 'all' || cfg.severity === severityFilter;
    return matchSearch && matchSeverity && inDateRange(log);
  });

  const handleExportCSV = () => {
    if (!filtered?.length) return;
    const headers = ['Timestamp', 'Action', 'Resource', 'User ID', 'Tenant ID'];
    const rows = filtered.map(l => [
      new Date(l.created_at).toISOString(),
      l.action, l.resource,
      l.user_id || 'System',
      l.tenant_id || 'Global',
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'audit-logs.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const counts = logs?.reduce((acc, log) => {
    const cfg = getActionConfig(log.action);
    acc[cfg.severity] = (acc[cfg.severity] || 0) + 1;
    return acc;
  }, {}) || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title">Platform Audit Logs</h1>
          <p className="page-subtitle">Immutable chronological record of all global system events.</p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="btn btn-secondary"
          style={{ gap: 8 }}
        >
          <RefreshCw size={15} style={{ animation: isFetching ? 'spin 1s linear infinite' : 'none' }} />
          {isFetching ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Severity Filter Chips */}
      <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
        {SEVERITY_FILTERS.map(({ key, label, icon: Icon }) => {
          const active = severityFilter === key;
          const colorMap = { success: '#059669', danger: '#e11d48', warning: '#d97706', info: '#4f46e5' };
          const bgMap = { success: '#ecfdf5', danger: '#fff1f2', warning: '#fffbeb', info: '#eef2ff' };
          const c = colorMap[key] || 'var(--brand-500)';
          const bg = bgMap[key] || 'var(--brand-50)';
          return (
            <button
              key={key}
              onClick={() => setSeverityFilter(key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 14px', borderRadius: 999,
                border: `2px solid ${active ? c : 'var(--glass-border)'}`,
                background: active ? bg : 'transparent',
                color: active ? c : 'var(--text-muted)',
                fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <Icon size={13} /> {label}
              {key !== 'all' && (
                <span style={{ background: active ? c : 'var(--surface-3)', color: active ? 'white' : 'var(--text-secondary)', borderRadius: 999, padding: '1px 7px', fontSize: '0.6875rem', fontWeight: 700 }}>
                  {counts[key] || 0}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Timeline Card */}
      <div className="glass-card" style={{ padding: 0 }}>
        {/* Search header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', background: 'var(--surface-1)', borderTopLeftRadius: 'inherit', borderTopRightRadius: 'inherit' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
            <Activity size={18} color="var(--brand-500)" />
            <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>Event Stream</span>
          </div>
          <div style={{ position: 'relative', maxWidth: 280 }}>
            <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Filter by action or resource..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '2.25rem', width: '100%', height: 36, fontSize: '0.875rem' }}
            />
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, background: 'var(--surface-0)', padding: '4px 10px', borderRadius: 999, border: '1px solid var(--glass-border)', flexShrink: 0 }}>
            {filtered?.length || 0} events
          </span>
        </div>

        {isLoading ? (
          <Loader text="Loading audit events..." />
        ) : !filtered?.length ? (
          <div style={{ padding: '4rem', textAlign: 'center' }}>
            <ShieldAlert size={32} color="var(--text-muted)" style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
            <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>No events match your filters.</p>
          </div>
        ) : (
          /* Timeline */
          <div style={{ padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: 0 }}>
            {filtered.map((log, i) => {
              const cfg = getActionConfig(log.action);
              const Icon = cfg.icon;
              const isLast = i === filtered.length - 1;
              return (
                <div key={log.id} style={{ display: 'flex', gap: '1.25rem', position: 'relative', paddingBottom: isLast ? 0 : '1.5rem' }}>
                  {/* Vertical line */}
                  {!isLast && (
                    <div style={{ position: 'absolute', left: 19, top: 40, bottom: 0, width: 2, background: 'var(--surface-3)' }} />
                  )}

                  {/* Icon bubble */}
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                    background: cfg.bg, border: `2px solid ${cfg.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1,
                  }}>
                    <Icon size={16} color={cfg.color} />
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, paddingTop: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                      <div>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                          {log.action.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: 4, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`, padding: '2px 7px', borderRadius: 4 }}>
                            {log.resource}
                          </span>
                          {log.user_id && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                              <UserIcon size={11} /> User #{log.user_id}
                            </span>
                          )}
                          {log.tenant_id && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                              <Globe size={11} /> Org #{log.tenant_id}
                            </span>
                          )}
                        </div>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', flexShrink: 0, marginTop: 2 }}>
                        {new Date(log.created_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
