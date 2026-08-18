import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '../../lib/api';
import { CreditCard, TrendingUp, Users, AlertCircle, Building2, Download } from 'lucide-react';
import Loader from '../../components/ui/Loader';

export default function BillingPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['billing-stats'],
    queryFn: () => adminAPI.getBillingStats().then(r => r.data),
  });

  if (isLoading) {
    return <Loader text="Loading financial data..." />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CreditCard size={24} color="var(--brand-500)" /> Billing & Subscriptions
          </h1>
          <p className="page-subtitle">Track platform revenue, active subscriptions, and MRR.</p>
        </div>
        <button className="btn btn-primary" style={{ gap: 8 }}>
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="stat-label">Monthly Recurring Revenue</p>
            <p className="stat-value">${stats?.mrr?.toLocaleString() || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#eef2ff', color: '#4f46e5' }}>
            <Building2 size={20} />
          </div>
          <div>
            <p className="stat-label">Active Tenants</p>
            <p className="stat-value">{stats?.active_tenants || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fff1f2', color: '#e11d48' }}>
            <AlertCircle size={20} />
          </div>
          <div>
            <p className="stat-label">Suspended Tenants</p>
            <p className="stat-value">{stats?.suspended_tenants || 0}</p>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.5rem' }}>
          <Users size={18} color="var(--brand-500)" /> Subscription Plan Distribution
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
          <div style={{ padding: '1.5rem', border: '1px solid var(--glass-border)', borderRadius: 12, background: 'var(--surface-0)' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Basic Plan</p>
            <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.5rem 0' }}>{stats?.plan_distribution?.basic || 0}</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Free tier</p>
          </div>
          
          <div style={{ padding: '1.5rem', border: '1px solid var(--glass-border)', borderRadius: 12, background: 'var(--surface-0)' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Pro Plan</p>
            <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.5rem 0' }}>{stats?.plan_distribution?.pro || 0}</p>
            <p style={{ fontSize: '0.875rem', color: '#059669', fontWeight: 500 }}>$299/mo</p>
          </div>
          
          <div style={{ padding: '1.5rem', border: '1px solid var(--glass-border)', borderRadius: 12, background: 'linear-gradient(135deg, var(--brand-50), var(--brand-100))' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-700)', textTransform: 'uppercase' }}>Enterprise Plan</p>
            <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--brand-700)', margin: '0.5rem 0' }}>{stats?.plan_distribution?.enterprise || 0}</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--brand-600)', fontWeight: 500 }}>$999/mo</p>
          </div>
        </div>
      </div>
    </div>
  );
}
