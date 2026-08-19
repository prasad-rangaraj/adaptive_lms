import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '../../services/api.service';
import { CreditCard, TrendingUp, Building2, AlertCircle, Download, Crown, Zap, Star } from 'lucide-react';
import Loader from '../../components/ui/Loader';

const PLAN_CONFIG = {
  basic:      { label: 'Basic',      icon: Star,  color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb', price: 0,   priceLabel: 'Free' },
  pro:        { label: 'Pro',        icon: Zap,   color: '#059669', bg: '#ecfdf5', border: '#a7f3d0', price: 299, priceLabel: '$299/mo' },
  enterprise: { label: 'Enterprise', icon: Crown, color: '#4f46e5', bg: '#eef2ff', border: '#c7d2fe', price: 999, priceLabel: '$999/mo' },
};

export default function BillingPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['billing-stats'],
    queryFn: () => adminAPI.getBillingStats().then(r => r.data),
  });

  if (isLoading) return <Loader text="Loading financial data..." />;

  const mrr = stats?.mrr || 0;
  const planDist = stats?.plan_distribution || {};
  const totalTenants = (planDist.basic || 0) + (planDist.pro || 0) + (planDist.enterprise || 0);
  const maxPlanCount = Math.max(...Object.values(planDist), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title">Billing & Revenue</h1>
          <p className="page-subtitle">Track platform revenue, subscriptions, and financial health.</p>
        </div>
        <button className="btn btn-secondary" style={{ gap: 8 }}>
          <Download size={15} /> Export Report
        </button>
      </div>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
        {/* MRR Hero */}
        <div className="stat-card" style={{ padding: '1.75rem', gridColumn: 'span 1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: 'var(--brand-50)', border: '1px solid var(--brand-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-600)' }}>
              <CreditCard size={22} />
            </div>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '4px 9px', borderRadius: 999, border: '1px solid #a7f3d0' }}>
              <TrendingUp size={12} /> +12%
            </span>
          </div>
          <p style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-0.04em' }}>
            ${mrr.toLocaleString()}
          </p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500, marginTop: 8 }}>Monthly Recurring Revenue</p>
          <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--glass-border)' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              ARR: <strong style={{ color: 'var(--text-primary)' }}>${(mrr * 12).toLocaleString()}</strong>
            </p>
          </div>
        </div>

        <div className="stat-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: '#ecfdf5', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
              <Building2 size={22} />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#059669', background: '#ecfdf5', padding: '4px 9px', borderRadius: 999, border: '1px solid #a7f3d0' }}>
              +{stats?.active_tenants ? Math.ceil(stats.active_tenants * 0.15) : 0} this month
            </span>
          </div>
          <p style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-0.04em' }}>{stats?.active_tenants || 0}</p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500, marginTop: 8 }}>Active Organizations</p>
          <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--glass-border)' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Suspended: <strong style={{ color: '#e11d48' }}>{stats?.suspended_tenants || 0}</strong>
            </p>
          </div>
        </div>

        <div className="stat-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: '#fff1f2', border: '1px solid #fecdd3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e11d48' }}>
              <AlertCircle size={22} />
            </div>
          </div>
          <p style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-0.04em' }}>{stats?.suspended_tenants || 0}</p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500, marginTop: 8 }}>Suspended Accounts</p>
          <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--glass-border)' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Revenue at risk: <strong style={{ color: '#e11d48' }}>${((stats?.suspended_tenants || 0) * 299).toLocaleString()}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Plan Distribution */}
      <div className="glass-card" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.75rem' }}>
          Subscription Plan Distribution
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {Object.entries(PLAN_CONFIG).map(([key, meta]) => {
            const count = planDist[key] || 0;
            const percentage = totalTenants > 0 ? Math.round((count / totalTenants) * 100) : 0;
            const barWidth = totalTenants > 0 ? (count / maxPlanCount) * 100 : 0;
            const Icon = meta.icon;
            return (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: 130, flexShrink: 0 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: meta.bg, border: `1px solid ${meta.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={15} color={meta.color} />
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{meta.label}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{meta.priceLabel}</p>
                  </div>
                </div>

                {/* Bar */}
                <div style={{ flex: 1, height: 8, background: 'var(--surface-3)', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ width: `${barWidth}%`, height: '100%', background: meta.color, borderRadius: 999, transition: 'width 0.6s ease' }} />
                </div>

                <div style={{ width: 80, flexShrink: 0, textAlign: 'right' }}>
                  <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>{count}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 4 }}>({percentage}%)</span>
                </div>

                <div style={{ width: 90, flexShrink: 0, textAlign: 'right' }}>
                  <span style={{ fontWeight: 700, color: meta.color, fontSize: '0.875rem' }}>
                    ${(count * meta.price).toLocaleString()}<span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.75rem' }}>/mo</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: '1.75rem', paddingTop: '1.5rem', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Total across {totalTenants} organizations
          </span>
          <span style={{ fontWeight: 800, fontSize: '1.125rem', color: 'var(--brand-600)' }}>
            ${mrr.toLocaleString()}<span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.875rem' }}>/mo</span>
          </span>
        </div>
      </div>
    </div>
  );
}
