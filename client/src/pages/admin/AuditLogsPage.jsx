import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '../../lib/api';
import { Settings, ShieldAlert, Globe, Server, User as UserIcon, RefreshCw } from 'lucide-react';
import Loader from '../../components/ui/Loader';

export default function AuditLogsPage() {
  const { data: logs, isLoading, refetch } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => adminAPI.listAuditLogs().then(r => r.data),
  });

  const getActionColor = (action) => {
    if (action.includes('created') || action.includes('published')) return '#10b981'; // emerald
    if (action.includes('deleted') || action.includes('suspended')) return '#e11d48'; // rose
    if (action.includes('impersonation')) return '#f59e0b'; // amber
    return '#6366f1'; // indigo
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Settings size={24} color="var(--brand-500)" /> Platform Audit Logs
          </h1>
          <p className="page-subtitle">Immutable chronological record of global system events.</p>
        </div>
        <button onClick={() => refetch()} className="btn btn-ghost" style={{ gap: 8, background: 'var(--surface-0)', border: '1px solid var(--glass-border)' }}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className="glass-card table-wrapper">
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface-1)' }}>
          <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Server size={18} color="var(--brand-500)" /> Event Stream
          </h2>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, background: 'var(--surface-0)', padding: '4px 10px', borderRadius: 999, border: '1px solid var(--glass-border)' }}>
            Latest 50 events
          </span>
        </div>

        {isLoading ? (
          <Loader text="Loading audit events..." />
        ) : !logs?.length ? (
          <div style={{ padding: '4rem', textAlign: 'center' }}>
            <ShieldAlert size={32} color="var(--text-muted)" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>No audit logs found.</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Action</th>
                <th>Resource</th>
                <th>Actor (User ID)</th>
                <th>Tenant ID</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id}>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td>
                    <span style={{ 
                      fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', borderRadius: 6, 
                      color: getActionColor(log.action),
                      background: `${getActionColor(log.action)}15`,
                      border: `1px solid ${getActionColor(log.action)}30`
                    }}>
                      {log.action.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ textTransform: 'capitalize', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                    {log.resource}
                  </td>
                  <td>
                    {log.user_id ? (
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <UserIcon size={12} /> #{log.user_id}
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>System</span>
                    )}
                  </td>
                  <td>
                    {log.tenant_id ? (
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Globe size={12} /> #{log.tenant_id}
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Global</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
