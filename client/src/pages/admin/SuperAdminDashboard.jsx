import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { tenantsAPI, adminAPI } from '../../lib/api';
import { Building2, Plus, TrendingUp, TrendingDown, Server, Globe, ArrowRight, DollarSign, Users, Activity } from 'lucide-react';
import Loader from '../../components/ui/Loader';

const planBadge = {
  enterprise: { class: 'badge-brand', label: 'Enterprise' },
  pro: { class: 'badge-success', label: 'Pro' },
  basic: { class: 'badge-gray', label: 'Basic' },
};

export default function SuperAdminDashboard() {
  const navigate = useNavigate();

  const { data: tenants, isLoading: loadingTenants } = useQuery({
    queryKey: ['tenants'],
    queryFn: () => tenantsAPI.list().then(r => r.data),
  });

  const { data: billing, isLoading: loadingBilling } = useQuery({
    queryKey: ['billing-stats'],
    queryFn: () => adminAPI.getBillingStats().then(r => r.data),
  });

  const { data: logs, isLoading: loadingLogs } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => adminAPI.listAuditLogs().then(r => r.data),
  });

  const isLoading = loadingTenants || loadingBilling || loadingLogs;

  if (isLoading) {
    return <Loader text="Loading dashboard..." />;
  }

  const mrr = billing?.mrr || 0;
  const activeTenants = billing?.active_tenants || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title">Super Admin Dashboard</h1>
          <p className="page-subtitle">Platform-wide overview across all tenant organizations.</p>
        </div>
        <button className="btn btn-primary" style={{ gap: 8 }} onClick={() => navigate('/super-admin/tenants')}>
          <Plus size={16} /> Deploy Tenant
        </button>
      </div>

      {/* Main KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--brand-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-600)', border: '1px solid var(--brand-100)' }}>
              <DollarSign size={20} />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#059669', background: '#ecfdf5', padding: '4px 8px', borderRadius: 999, border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', gap: 4 }}>
              <TrendingUp size={12} /> +12%
            </span>
          </div>
          <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>${mrr.toLocaleString()}</p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500, marginTop: 8 }}>Monthly Recurring Revenue</p>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed', border: '1px solid #ddd6fe' }}>
              <Building2 size={20} />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#059669', background: '#ecfdf5', padding: '4px 8px', borderRadius: 999, border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', gap: 4 }}>
              <TrendingUp size={12} /> +2 
            </span>
          </div>
          <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{activeTenants}</p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500, marginTop: 8 }}>Active Organizations</p>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706', border: '1px solid #fde68a' }}>
              <Activity size={20} />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', background: 'var(--surface-2)', padding: '4px 8px', borderRadius: 999, border: '1px solid var(--glass-border)' }}>
              100% Uptime
            </span>
          </div>
          <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>92.3<span style={{ fontSize: '1.25rem', color: 'var(--text-muted)' }}>K</span></p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500, marginTop: 8 }}>API Requests Today</p>
        </div>

      </div>

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        
        {/* Organizations Table */}
        <div className="glass-card table-wrapper" style={{ padding: 0 }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-1)' }}>
            <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Globe size={18} color="var(--brand-500)" /> Deployed Environments
            </h2>
            <button onClick={() => navigate('/super-admin/tenants')} className="btn btn-ghost btn-sm" style={{ fontWeight: 600 }}>
              Directory <ArrowRight size={14} />
            </button>
          </div>
          
          <div style={{ padding: '0', overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Organization</th>
                  <th>Plan</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {tenants?.slice(0, 5).map((t) => {
                  const badge = planBadge[t.plan] || planBadge.basic;
                  return (
                    <tr key={t.id} onClick={() => navigate(`/super-admin/tenants/${t.id}`)} style={{ cursor: 'pointer' }} className="hover:bg-slate-50 transition-colors">
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="avatar" style={{ width: 34, height: 34, fontSize: '0.875rem', background: t.primary_color, color: 'white' }}>
                            {t.name[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{t.name}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.subdomain}.lms.com</p>
                          </div>
                        </div>
                      </td>
                      <td><span className={`badge ${badge.class}`}>{badge.label}</span></td>
                      <td>
                        {t.is_active ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div className="live-dot" style={{ width: 6, height: 6 }} />
                            <span style={{ fontSize: '0.8125rem', color: '#059669', fontWeight: 500 }}>Active</span>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.8125rem', color: '#e11d48', fontWeight: 500 }}>Suspended</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="glass-card table-wrapper" style={{ padding: 0 }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-1)' }}>
            <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Server size={18} color="var(--brand-500)" /> Activity Feed
            </h2>
            <button onClick={() => navigate('/super-admin/audit-logs')} className="btn btn-ghost btn-sm" style={{ fontWeight: 600 }}>
              Logs <ArrowRight size={14} />
            </button>
          </div>
          
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {!logs?.length ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', margin: '2rem 0' }}>No recent activity.</p>
            ) : (
              logs.slice(0, 5).map((log, i) => (
                <div key={log.id} style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
                  {i !== Math.min(logs.length, 5) - 1 && (
                    <div style={{ position: 'absolute', left: 15, top: 32, bottom: -20, width: 2, background: 'var(--surface-2)' }} />
                  )}
                  
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--surface-0)', border: '2px solid var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, flexShrink: 0 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--brand-400)' }} />
                  </div>
                  
                  <div>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {log.action.replace(/_/g, ' ')}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      {log.resource} &bull; User #{log.user_id || 'System'}
                    </p>
                    <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: 4, opacity: 0.7 }}>
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
