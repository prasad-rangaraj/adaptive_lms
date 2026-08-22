import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { tenantsAPI, adminAPI } from '../../services/api.service';
import {
  Building2, Plus, TrendingUp, Server, Globe, ArrowRight,
  DollarSign, Users, Activity, BarChart3, Megaphone,
  ClipboardList, Settings, HeartPulse, Crown, Zap, Star, Shield, BrainCircuit
} from 'lucide-react';
import Loader from '../../components/ui/Loader';

const PLAN_META = {
  enterprise: { icon: Crown, color: '#155e75', bg: '#ecfeff', border: '#a5f3fc', label: 'Enterprise' },
  pro:        { icon: Zap,   color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', label: 'Pro' },
  basic:      { icon: Star,  color: '#4b5563', bg: '#f9fafb', border: '#e5e7eb', label: 'Basic' },
};

const QUICK_ACTIONS = [
  { label: 'New Org',      icon: Plus,          color: '#155e75', bg: '#ecfeff', to: '/super-admin/directory' },
  { label: 'Communication',icon: Megaphone,      color: '#16a34a', bg: '#f0fdf4', to: '/super-admin/announcements' },
  { label: 'Security & Audit', icon: Shield,         color: '#d97706', bg: '#fffbeb', to: '/super-admin/audit-logs' },
  { label: 'System Data',  icon: BarChart3,      color: '#7c3aed', bg: '#f5f3ff', to: '/super-admin/system-data' },
  { label: 'AI Hub',       icon: BrainCircuit,   color: '#0ea5e9', bg: '#e0f2fe', to: '/super-admin/ai-hub' },
  { label: 'Monetization', icon: Crown,          color: '#dc2626', bg: '#fef2f2', to: '/super-admin/plans' },
  { label: 'Settings',     icon: Settings,       color: '#4b5563', bg: '#f3f4f6', to: '/super-admin/settings' },
];

export default function SuperAdminDashboard() {
  const navigate = useNavigate();

  const { data: tenants, isLoading: loadingTenants } = useQuery({
    queryKey: ['tenants'],
    queryFn: () => tenantsAPI.list().then(r => r.data),
  });

  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => adminAPI.getDashboardStats().then(r => r.data),
  });

  const { data: logs, isLoading: loadingLogs } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => adminAPI.listAuditLogs().then(r => r.data),
  });

  if (loadingTenants || loadingStats || loadingLogs) return <Loader text="Loading dashboard..." />;

  const mrr = stats?.mrr || 0;
  const activeTenants = stats?.active_tenants || 0;
  const suspendedTenants = stats?.suspended_tenants || 0;

  // Top orgs by "rank" - sort by plan tier
  const planOrder = { enterprise: 0, pro: 1, basic: 2 };
  const topOrgs = [...(tenants || [])].sort((a, b) => (planOrder[a.plan] ?? 3) - (planOrder[b.plan] ?? 3)).slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* Header */}
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title">Platform Control Center</h1>
          <p className="page-subtitle">Global overview across all {tenants?.length || 0} organizations.</p>
        </div>
        <button className="btn btn-primary" style={{ gap: 8 }} onClick={() => navigate('/super-admin/directory')}>
          <Plus size={16} /> Deploy Organization
        </button>
      </div>

      {/* Quick Actions Tray */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.75rem' }}>
        {QUICK_ACTIONS.map(({ label, icon: Icon, color, bg, to }) => (
          <button
            key={label}
            onClick={() => navigate(to)}
            className="glass-card"
            style={{
              padding: '1rem', border: 'none', cursor: 'pointer', background: 'white',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              transition: 'all 0.18s', textAlign: 'center',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = ''; }}
          >
            <div style={{ width: 38, height: 38, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
              <Icon size={18} />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{label}</span>
          </button>
        ))}
      </div>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
        {/* MRR */}
        <div className="stat-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--brand-50)', border: '1px solid var(--brand-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-600)' }}>
              <DollarSign size={20} />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a', background: '#f0fdf4', padding: '4px 9px', borderRadius: 999, border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: 4 }}>
              <TrendingUp size={12} /> +12%
            </span>
          </div>
          <p style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-0.03em' }}>${mrr.toLocaleString()}</p>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500, marginTop: 6 }}>Monthly Recurring Revenue</p>
        </div>

        {/* Active Orgs */}
        <div className="stat-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: '#f5f3ff', border: '1px solid #ddd6fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed' }}>
              <Building2 size={20} />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a', background: '#f0fdf4', padding: '4px 9px', borderRadius: 999, border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: 4 }}>
              <TrendingUp size={12} /> +2
            </span>
          </div>
          <p style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-0.03em' }}>{activeTenants}</p>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500, marginTop: 6 }}>Active Organizations</p>
        </div>

        {/* API Requests */}
        <div className="stat-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: '#fffbeb', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
              <Activity size={20} />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', background: 'var(--surface-2)', padding: '4px 9px', borderRadius: 999, border: '1px solid var(--glass-border)' }}>
              100% uptime
            </span>
          </div>
          <p style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-0.03em' }}>92.3<span style={{ fontSize: '1.25rem', color: 'var(--text-muted)', fontWeight: 600 }}>K</span></p>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500, marginTop: 6 }}>API Requests Today</p>
        </div>

        {/* Suspended */}
        <div className="stat-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: suspendedTenants > 0 ? '#fef2f2' : '#f0fdf4', border: `1px solid ${suspendedTenants > 0 ? '#fecaca' : '#bbf7d0'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: suspendedTenants > 0 ? '#dc2626' : '#16a34a' }}>
              <Server size={20} />
            </div>
          </div>
          <p style={{ fontSize: '2rem', fontWeight: 900, color: suspendedTenants > 0 ? '#dc2626' : 'var(--text-primary)', lineHeight: 1, letterSpacing: '-0.03em' }}>{suspendedTenants}</p>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500, marginTop: 6 }}>Suspended Orgs</p>
        </div>
      </div>

      {/* Main Content: Orgs + Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>

        {/* Top Organizations */}
        <div className="glass-card" style={{ padding: 0 }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-1)', borderTopLeftRadius: 'inherit', borderTopRightRadius: 'inherit' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Globe size={17} color="var(--brand-500)" /> Deployed Organizations
            </h2>
            <button onClick={() => navigate('/super-admin/directory')} className="btn btn-ghost btn-sm" style={{ fontWeight: 600 }}>
              All Orgs <ArrowRight size={13} />
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Organization</th>
                  <th>Plan</th>
                  <th>Members</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {topOrgs.map(t => {
                  const plan = PLAN_META[t.plan] || PLAN_META.basic;
                  const PlanIcon = plan.icon;
                  return (
                    <tr key={t.id} onClick={() => navigate(`/super-admin/tenants/${t.id}`)} style={{ cursor: 'pointer' }}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: `linear-gradient(135deg, ${t.primary_color}, ${t.secondary_color})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.9rem', boxShadow: `0 2px 8px ${t.primary_color}40` }}>
                            {t.name[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{t.name}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.subdomain}.lms.com</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', fontWeight: 700, color: plan.color, background: plan.bg, border: `1px solid ${plan.border}`, padding: '3px 8px', borderRadius: 6 }}>
                          <PlanIcon size={10} /> {plan.label}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Users size={13} /> —
                        </span>
                      </td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.8125rem', fontWeight: 500, color: t.is_active ? '#059669' : '#e11d48' }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.is_active ? '#10b981' : '#e11d48', display: 'inline-block' }} />
                          {t.is_active ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="glass-card" style={{ padding: 0 }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-1)', borderTopLeftRadius: 'inherit', borderTopRightRadius: 'inherit' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Activity size={17} color="var(--brand-500)" /> Live Activity
            </h2>
            <button onClick={() => navigate('/super-admin/audit-logs')} className="btn btn-ghost btn-sm" style={{ fontWeight: 600 }}>
              Full Log <ArrowRight size={13} />
            </button>
          </div>
          <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {!logs?.length ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', margin: '2rem 0' }}>No recent activity.</p>
            ) : logs.slice(0, 6).map((log, i) => {
              const isLast = i === Math.min(logs.length, 6) - 1;
              const color = log.action.includes('created') || log.action.includes('published') ? '#059669'
                : log.action.includes('deleted') || log.action.includes('suspended') ? '#e11d48'
                : log.action.includes('impersonation') ? '#d97706'
                : '#6366f1';
              return (
                <div key={log.id} style={{ display: 'flex', gap: '0.875rem', position: 'relative' }}>
                  {!isLast && <div style={{ position: 'absolute', left: 15, top: 32, bottom: -20, width: 1.5, background: 'var(--surface-3)' }} />}
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${color}15`, border: `2px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, flexShrink: 0 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                  </div>
                  <div style={{ paddingTop: 2 }}>
                    <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{log.action.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      {log.resource} · {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
