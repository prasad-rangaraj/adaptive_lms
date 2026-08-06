import { Building2, Users, DollarSign, Activity, CheckCircle, XCircle, MoreHorizontal, Plus, TrendingUp } from 'lucide-react';

const stats = [
  { label: 'Total Tenants', value: '14', icon: Building2, color: '#6366f1', bg: '#eef2ff', trend: '+2 this month' },
  { label: 'Total Users', value: '4,821', icon: Users, color: '#8b5cf6', bg: '#f5f3ff', trend: '+384 this month' },
  { label: 'Monthly Revenue', value: '$18,400', icon: DollarSign, color: '#10b981', bg: '#f0fdf4', trend: '+12% vs last month' },
  { label: 'API Calls Today', value: '92,344', icon: Activity, color: '#f59e0b', bg: '#fffbeb', trend: 'Within quota' },
];

const tenants = [
  { name: 'Sunrise University', subdomain: 'sunrise-univ', plan: 'enterprise', users: 1240, revenue: '$6,200', status: 'active', growth: '+8%' },
  { name: 'TechCorp Inc.', subdomain: 'techcorp', plan: 'pro', users: 384, revenue: '$1,920', status: 'active', growth: '+22%' },
  { name: 'Global Institute', subdomain: 'global-inst', plan: 'basic', users: 820, revenue: '$820', status: 'active', growth: '+3%' },
  { name: 'Legacy Academy', subdomain: 'legacy-acad', plan: 'basic', users: 95, revenue: '$95', status: 'inactive', growth: '-5%' },
  { name: 'Future Skills Hub', subdomain: 'future-skills', plan: 'pro', users: 532, revenue: '$2,660', status: 'active', growth: '+15%' },
];

const planBadge = {
  enterprise: { class: 'badge-brand', label: 'Enterprise' },
  pro: { class: 'badge-success', label: 'Pro' },
  basic: { class: 'badge-gray', label: 'Basic' },
};

export default function AdminDashboard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">Platform-wide overview across all tenant organizations.</p>
        </div>
        <button className="btn btn-primary" style={{ gap: 8 }}>
          <Plus size={16} /> Add Tenant
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        {stats.map(({ label, value, icon: Icon, color, bg, trend }, i) => (
          <div key={label} className="stat-card animate-fade-up" style={{ animationDelay: `${i * 0.07}s`, opacity: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={19} color={color} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#10b981', fontSize: '0.75rem', fontWeight: 600 }}>
                <TrendingUp size={12} />
              </div>
            </div>
            <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</p>
            <p style={{ fontSize: '0.8125rem', color: '#6b7280', marginTop: 4 }}>{label}</p>
            <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: 8, paddingTop: 8, borderTop: '1px solid #f0f1f3' }}>{trend}</p>
          </div>
        ))}
      </div>

      {/* Tenants Table */}
      <div className="animate-fade-up delay-200" style={{ opacity: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontWeight: 700, color: '#111827', fontSize: '1.0625rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Building2 size={18} color="#6366f1" /> Active Organizations
          </h2>
          <a href="/admin/tenants" style={{ fontSize: '0.875rem', color: '#6366f1', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            View all
          </a>
        </div>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Organization</th>
                <th>Plan</th>
                <th>Users</th>
                <th>Revenue</th>
                <th>Growth</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((t, i) => {
                const badge = planBadge[t.plan];
                const growthPos = t.growth.startsWith('+');
                return (
                  <tr key={i}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="avatar" style={{ width: 32, height: 32, fontSize: '0.8125rem' }}>
                          {t.name[0]}
                        </div>
                        <div>
                          <p style={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>{t.name}</p>
                          <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{t.subdomain}.lms.com</p>
                        </div>
                      </div>
                    </td>
                    <td><span className={`badge ${badge.class}`}>{badge.label}</span></td>
                    <td style={{ fontWeight: 600, color: '#374151' }}>{t.users.toLocaleString()}</td>
                    <td style={{ fontWeight: 600, color: '#374151' }}>{t.revenue}</td>
                    <td>
                      <span style={{
                        fontWeight: 700, fontSize: '0.8125rem',
                        color: growthPos ? '#059669' : '#dc2626',
                        background: growthPos ? '#f0fdf4' : '#fef2f2',
                        padding: '2px 8px', borderRadius: 999,
                      }}>
                        {t.growth}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {t.status === 'active'
                          ? <><div className="live-dot" style={{ width: 7, height: 7, background: '#10b981' }} /><span style={{ fontSize: '0.8125rem', color: '#059669', fontWeight: 500 }}>Active</span></>
                          : <><div style={{ width: 7, height: 7, borderRadius: '50%', background: '#d1d5db' }} /><span style={{ fontSize: '0.8125rem', color: '#9ca3af', fontWeight: 500 }}>Inactive</span></>
                        }
                      </div>
                    </td>
                    <td>
                      <button className="btn btn-ghost btn-icon btn-sm">
                        <MoreHorizontal size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
