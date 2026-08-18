import { useNavigate } from 'react-router-dom';
import { Building2, Users, DollarSign, Activity, MoreHorizontal, Plus, TrendingUp, TrendingDown, UserPlus, GraduationCap, BookOpen, ArrowRight } from 'lucide-react';

const stats = [
  { label: 'Total Tenants', value: '14', icon: Building2, color: '#4f46e5', bg: '#eef2ff', border: '#c7d2fe', trend: '+2 this month', up: true },
  { label: 'Total Users', value: '4,821', icon: Users, color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe', trend: '+384 this month', up: true },
  { label: 'Monthly Revenue', value: '$18.4K', icon: DollarSign, color: '#059669', bg: '#ecfdf5', border: '#bbf7d0', trend: '+12% vs last month', up: true },
  { label: 'API Calls Today', value: '92.3K', icon: Activity, color: '#d97706', bg: '#fffbeb', border: '#fde68a', trend: 'Within quota', up: true },
];

const tenants = [
  { name: 'Sunrise University', subdomain: 'sunrise-univ', plan: 'enterprise', users: 1240, revenue: '$6,200', status: 'active', growth: '+8%', growthUp: true },
  { name: 'TechCorp Inc.', subdomain: 'techcorp', plan: 'pro', users: 384, revenue: '$1,920', status: 'active', growth: '+22%', growthUp: true },
  { name: 'Global Institute', subdomain: 'global-inst', plan: 'basic', users: 820, revenue: '$820', status: 'active', growth: '+3%', growthUp: true },
  { name: 'Legacy Academy', subdomain: 'legacy-acad', plan: 'basic', users: 95, revenue: '$95', status: 'inactive', growth: '-5%', growthUp: false },
  { name: 'Future Skills Hub', subdomain: 'future-skills', plan: 'pro', users: 532, revenue: '$2,660', status: 'active', growth: '+15%', growthUp: true },
];

const planBadge = {
  enterprise: { class: 'badge-brand', label: 'Enterprise' },
  pro: { class: 'badge-success', label: 'Pro' },
  basic: { class: 'badge-gray', label: 'Basic' },
};

const tenantAvatarColors = [
  'linear-gradient(135deg, #4f46e5, #7c3aed)',
  'linear-gradient(135deg, #059669, #0d9488)',
  'linear-gradient(135deg, #0369a1, #0ea5e9)',
  'linear-gradient(135deg, #9333ea, #db2777)',
  'linear-gradient(135deg, #d97706, #ef4444)',
];

export default function AdminDashboard() {
  const navigate = useNavigate();
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

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
        {[
          { label: 'Manage Members', desc: 'Add students & teachers to your org', icon: UserPlus, color: '#4f46e5', bg: '#eef2ff', border: '#c7d2fe', path: '/admin/users' },
          { label: 'View Students', desc: 'Browse all enrolled students', icon: GraduationCap, color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe', path: '/admin/users' },
          { label: 'View Teachers', desc: 'Manage course instructors', icon: BookOpen, color: '#059669', bg: '#ecfdf5', border: '#bbf7d0', path: '/admin/users' },
        ].map(({ label, desc, icon: Icon, color, bg, border, path }) => (
          <div key={label} onClick={() => navigate(path)} style={{
            background: 'white', border: `1px solid ${border}`, borderRadius: 16, padding: '1.25rem',
            cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 14,
          }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 4px 20px ${color}18`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={22} color={color} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, color: '#111827', fontSize: '0.9375rem' }}>{label}</p>
              <p style={{ color: '#9ca3af', fontSize: '0.8125rem', marginTop: 2 }}>{desc}</p>
            </div>
            <ArrowRight size={16} color="#9ca3af" />
          </div>
        ))}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        {stats.map(({ label, value, icon: Icon, color, bg, border, trend, up }, i) => (
          <div key={label} className="stat-card animate-fade-up" style={{ animationDelay: `${i * 0.07}s` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: bg, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 16px ${color}20` }}>
                <Icon size={20} color={color} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: up ? '#059669' : '#e11d48', fontSize: '0.75rem', fontWeight: 600, background: up ? '#ecfdf5' : '#fff1f2', padding: '3px 8px', borderRadius: 999, border: `1px solid ${up ? '#a7f3d0' : '#fecdd3'}`, height: 'fit-content' }}>
                {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              </div>
            </div>
            <p style={{ fontSize: '1.875rem', fontWeight: 900, color: '#111827', letterSpacing: '-0.04em', lineHeight: 1 }}>{value}</p>
            <p style={{ fontSize: '0.8125rem', color: '#6b7280', marginTop: 6 }}>{label}</p>
            <p style={{ fontSize: '0.75rem', color: up ? '#059669' : '#9ca3af', marginTop: 10, paddingTop: 10, borderTop: '1px solid #f0f1f3' }}>{trend}</p>
          </div>
        ))}
      </div>

      {/* Tenants Table */}
      <div className="animate-fade-up delay-200">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.0625rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Building2 size={18} color="#818cf8" /> Active Organizations
          </h2>
          <a href="/admin/tenants" style={{ fontSize: '0.875rem', color: '#818cf8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
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
                return (
                  <tr key={i}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="avatar" style={{ width: 34, height: 34, fontSize: '0.875rem', background: tenantAvatarColors[i % tenantAvatarColors.length] }}>
                          {t.name[0]}
                        </div>
                        <div>
                          <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{t.name}</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.subdomain}.lms.com</p>
                        </div>
                      </div>
                    </td>
                    <td><span className={`badge ${badge.class}`}>{badge.label}</span></td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.users.toLocaleString()}</td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.revenue}</td>
                    <td>
                      <span style={{
                        fontWeight: 700, fontSize: '0.8125rem',
                        color: t.growthUp ? '#059669' : '#be185d',
                        background: t.growthUp ? '#ecfdf5' : '#fdf2f8',
                        border: `1px solid ${t.growthUp ? '#bbf7d0' : '#fbcfe8'}`,
                        padding: '3px 10px', borderRadius: 999,
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                      }}>
                        {t.growthUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                        {t.growth}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {t.status === 'active'
                          ? <><div className="live-dot" style={{ width: 7, height: 7 }} /><span style={{ fontSize: '0.8125rem', color: '#059669', fontWeight: 500 }}>Active</span></>
                          : <><div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--text-muted)' }} /><span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500 }}>Inactive</span></>
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
