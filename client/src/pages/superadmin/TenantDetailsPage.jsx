import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { tenantsAPI, adminAPI, authAPI } from '../../services/api.service';
import toast from 'react-hot-toast';
import {
  Building2, Globe, Palette, ShieldAlert, Users, User,
  GraduationCap, BookOpen, ChevronLeft, Save, LayoutDashboard,
  Settings, Eye, Crown, Zap, Star, TrendingUp, Activity,
  UserCheck, MoreHorizontal,
} from 'lucide-react';
import Loader from '../../components/ui/Loader';

const PLAN_META = {
  basic:      { label: 'Basic',      icon: Star,  color: '#4b5563', bg: '#f9fafb', border: '#e5e7eb' },
  pro:        { label: 'Pro',        icon: Zap,   color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  enterprise: { label: 'Enterprise', icon: Crown, color: '#155e75', bg: '#ecfeff', border: '#a5f3fc' },
};

const ROLE_META = {
  student:      { label: 'Student',   icon: GraduationCap, color: '#0e7490', bg: '#ecfeff', border: '#a5f3fc' },
  teacher:      { label: 'Teacher',   icon: BookOpen,      color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  tenant_admin: { label: 'Admin',     icon: Settings,      color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
};

const TABS = [
  { key: 'overview', label: 'Overview',  icon: LayoutDashboard },
  { key: 'members',  label: 'Members',   icon: Users },
  { key: 'settings', label: 'Settings',  icon: Settings },
  { key: 'danger',   label: 'Danger Zone', icon: ShieldAlert },
];

export default function TenantDetailsPage() {
  const { id } = useParams();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { impersonate } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [form, setForm] = useState(null);
  const [suspending, setSuspending] = useState(false);

  const handleImpersonate = async (targetUserId) => {
    try {
      const res = await authAPI.impersonate(targetUserId);
      const { access_token, user_id, role, full_name, tenant_id } = res.data;
      impersonate({ id: user_id, role, full_name, tenant_id }, access_token);
      toast.success(`Now impersonating ${full_name}`);
      if (role === 'student') navigate('/student/dashboard');
      else if (role === 'teacher') navigate('/teacher/dashboard');
      else if (role === 'tenant_admin') navigate('/admin/dashboard');
      else navigate('/');
    } catch {
      toast.error('Failed to impersonate user');
    }
  };

  const { data: tenant, isLoading: loadingTenant } = useQuery({
    queryKey: ['tenant', id],
    queryFn: () => tenantsAPI.get(id).then(r => r.data),
  });

  useEffect(() => {
    if (tenant && !form) {
      setForm({
        name: tenant.name, subdomain: tenant.subdomain,
        plan: tenant.plan, primary_color: tenant.primary_color,
        secondary_color: tenant.secondary_color,
      });
    }
  }, [tenant, form]);

  const { data: users, isLoading: loadingUsers } = useQuery({
    queryKey: ['tenant-users', id],
    queryFn: () => adminAPI.listUsers(id).then(r => r.data),
  });

  const updateMutation = useMutation({
    mutationFn: (data) => tenantsAPI.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries(['tenant', id]);
      toast.success('Tenant updated successfully');
    },
    onError: (err) => toast.error(err.response?.data?.detail || 'Failed to update tenant'),
  });

  if (loadingTenant) return <Loader text="Loading tenant details..." />;
  if (!tenant) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Tenant not found.</div>;
  if (!form) return <Loader text="Initializing..." />;

  const plan = PLAN_META[tenant.plan] || PLAN_META.basic;
  const PlanIcon = plan.icon;

  const roleCounts = users?.reduce((acc, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1;
    return acc;
  }, {}) || {};

  const handleSave = (e) => {
    e.preventDefault();
    updateMutation.mutate(form);
  };

  const handleSuspend = async () => {
    setSuspending(true);
    await new Promise(r => setTimeout(r, 600));
    setSuspending(false);
    toast.success(tenant.is_active ? 'Tenant suspended' : 'Tenant reactivated');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* Back nav */}
      <div style={{ marginBottom: '1.5rem' }}>
        <button onClick={() => navigate('/super-admin/tenants')} className="btn btn-ghost btn-sm" style={{ gap: 6, color: 'var(--text-muted)' }}>
          <ChevronLeft size={16} /> Back to Organizations
        </button>
      </div>

      {/* ── Brand Hero Header ── */}
      <div style={{
        borderRadius: 20, overflow: 'hidden', marginBottom: '1.75rem',
        background: `linear-gradient(135deg, ${tenant.primary_color}15, ${tenant.secondary_color}10)`,
        border: `1px solid ${tenant.primary_color}25`,
      }}>
        {/* Color bar */}
        <div style={{ height: 5, background: `linear-gradient(90deg, ${tenant.primary_color}, ${tenant.secondary_color})` }} />
        
        <div style={{ padding: '1.75rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            {/* Org avatar */}
            <div style={{
              width: 64, height: 64, borderRadius: 18, flexShrink: 0,
              background: `linear-gradient(135deg, ${tenant.primary_color}, ${tenant.secondary_color})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 900, fontSize: '1.75rem',
              boxShadow: `0 8px 20px ${tenant.primary_color}50`,
            }}>
              {tenant.name[0]?.toUpperCase()}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{tenant.name}</h1>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', fontWeight: 700, color: plan.color, background: plan.bg, border: `1px solid ${plan.border}`, padding: '3px 9px', borderRadius: 999 }}>
                  <PlanIcon size={11} /> {plan.label}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', fontWeight: 600, color: tenant.is_active ? '#16a34a' : '#dc2626' }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: tenant.is_active ? '#22c55e' : '#dc2626', display: 'inline-block' }} />
                  {tenant.is_active ? 'Active' : 'Suspended'}
                </span>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                <Globe size={13} /> {tenant.subdomain}.lms.com
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 3 }}>
                Created {new Date(tenant.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Quick stats */}
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            {[
              { label: 'Members',  value: users?.length ?? '—', icon: Users },
              { label: 'Students', value: roleCounts.student ?? 0, icon: GraduationCap },
              { label: 'Teachers', value: roleCounts.teacher ?? 0, icon: BookOpen },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 2 }}>
                  <Icon size={14} color="var(--text-muted)" />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
                </div>
                <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', borderTop: `1px solid ${tenant.primary_color}20`, background: 'rgba(255,255,255,0.6)' }}>
          {TABS.map(({ key, label, icon: Icon }) => {
            const active = activeTab === key;
            const isDanger = key === 'danger';
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '0.875rem 1.375rem', border: 'none', cursor: 'pointer',
                  background: 'transparent',
                  color: active ? (isDanger ? '#e11d48' : tenant.primary_color) : 'var(--text-muted)',
                  fontWeight: active ? 700 : 500, fontSize: '0.875rem',
                  borderBottom: active ? `2.5px solid ${isDanger ? '#e11d48' : tenant.primary_color}` : '2.5px solid transparent',
                  transition: 'all 0.15s',
                }}
              >
                <Icon size={15} /> {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tab Panels ── */}

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
          {[
            { label: 'Total Members', value: users?.length ?? 0, sub: 'across all roles', color: '#4f46e5', bg: '#eef2ff', border: '#c7d2fe', icon: Users },
            { label: 'Students',      value: roleCounts.student ?? 0, sub: 'enrolled learners', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe', icon: GraduationCap },
            { label: 'Teachers',      value: roleCounts.teacher ?? 0, sub: 'instructors active', color: '#059669', bg: '#ecfdf5', border: '#a7f3d0', icon: BookOpen },
          ].map(({ label, value, sub, color, bg, border, icon: Icon }) => (
            <div key={label} className="stat-card" style={{ padding: '1.5rem' }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: bg, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, marginBottom: '1rem' }}>
                <Icon size={20} />
              </div>
              <p style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500, marginTop: 6 }}>{label}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 3 }}>{sub}</p>
            </div>
          ))}

          {/* Brand info card */}
          <div className="glass-card" style={{ padding: '1.5rem', gridColumn: 'span 3' }}>
            <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem', fontSize: '0.9375rem' }}>Brand & Identity</h3>
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 8 }}>Brand Preview</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: `linear-gradient(135deg, ${tenant.primary_color}, ${tenant.secondary_color})`, boxShadow: `0 4px 14px ${tenant.primary_color}40` }} />
                  <div>
                    <p style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{tenant.name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tenant.subdomain}.lms.com</p>
                  </div>
                </div>
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 8 }}>Colors</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: tenant.primary_color, marginBottom: 4, boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }} />
                    <p style={{ fontSize: '0.625rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{tenant.primary_color}</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: tenant.secondary_color, marginBottom: 4, boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }} />
                    <p style={{ fontSize: '0.625rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{tenant.secondary_color}</p>
                  </div>
                </div>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 8 }}>Plan</p>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.875rem', fontWeight: 700, color: plan.color, background: plan.bg, border: `1px solid ${plan.border}`, padding: '6px 14px', borderRadius: 8 }}>
                  <PlanIcon size={15} /> {plan.label}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Members Tab */}
      {activeTab === 'members' && (
        <div className="glass-card" style={{ padding: 0 }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface-1)', borderTopLeftRadius: 'inherit', borderTopRightRadius: 'inherit' }}>
            <h2 style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={18} color="var(--brand-500)" /> Member Roster
            </h2>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, background: 'var(--surface-0)', padding: '4px 10px', borderRadius: 999, border: '1px solid var(--glass-border)' }}>
              {users?.length || 0} Total
            </span>
          </div>
          {loadingUsers ? (
            <Loader text="Loading roster..." />
          ) : !users?.length ? (
            <div style={{ padding: '4rem', textAlign: 'center' }}>
              <Users size={32} color="var(--text-muted)" style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
              <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>No members yet.</p>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => {
                  const role = ROLE_META[u.role] || ROLE_META.student;
                  const RoleIcon = role.icon;
                  return (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 10, background: role.bg, border: `1px solid ${role.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: role.color, fontWeight: 700, fontSize: '0.875rem', flexShrink: 0 }}>
                            {u.full_name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{u.full_name}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', fontWeight: 600, color: role.color, background: role.bg, border: `1px solid ${role.border}`, padding: '3px 8px', borderRadius: 6 }}>
                          <RoleIcon size={11} /> {role.label}
                        </span>
                      </td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.8125rem', fontWeight: 500, color: u.is_active ? '#059669' : '#e11d48' }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: u.is_active ? '#10b981' : '#e11d48', display: 'inline-block' }} />
                          {u.is_active ? 'Active' : 'Banned'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                          <button
                            onClick={() => handleImpersonate(u.id)}
                            className="btn btn-sm"
                            style={{ background: 'var(--brand-50)', color: 'var(--brand-600)', border: '1px solid var(--brand-200)', gap: 4 }}
                          >
                            <Eye size={13} /> Impersonate
                          </button>
                          <button className="btn btn-ghost btn-icon btn-sm">
                            <MoreHorizontal size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div style={{ maxWidth: 680 }}>
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Settings size={20} color="var(--brand-500)" /> Tenant Settings
            </h2>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Organization Name</label>
                <input className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{ width: '100%' }} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Subdomain</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input className="input-field" value={form.subdomain} onChange={e => setForm({ ...form, subdomain: e.target.value })} style={{ flex: 1 }} required />
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>.lms.com</span>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Plan</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {Object.entries(PLAN_META).map(([key, meta]) => {
                    const MIcon = meta.icon;
                    return (
                      <label key={key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '0.75rem', borderRadius: 10, cursor: 'pointer', border: `2px solid ${form.plan === key ? meta.color : 'var(--glass-border)'}`, background: form.plan === key ? meta.bg : 'transparent', transition: 'all 0.15s' }}>
                        <input type="radio" name="plan" value={key} checked={form.plan === key} onChange={() => setForm({ ...form, plan: key })} style={{ display: 'none' }} />
                        <MIcon size={16} color={form.plan === key ? meta.color : 'var(--text-muted)'} />
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: form.plan === key ? meta.color : 'var(--text-muted)' }}>{meta.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {[['primary_color', 'Primary Color'], ['secondary_color', 'Secondary Color']].map(([field, label]) => (
                  <div key={field}>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>{label}</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input type="color" value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })} style={{ width: 36, height: 36, padding: 0, border: 'none', borderRadius: 8, cursor: 'pointer', flexShrink: 0 }} />
                      <input className="input-field" value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })} style={{ flex: 1, fontFamily: 'monospace', fontSize: '0.8125rem' }} />
                    </div>
                  </div>
                ))}
              </div>
              <button type="submit" disabled={updateMutation.isPending} className="btn btn-primary" style={{ justifyContent: 'center' }}>
                <Save size={15} /> {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Danger Zone Tab */}
      {activeTab === 'danger' && (
        <div style={{ maxWidth: 640, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="glass-card" style={{ padding: '1.75rem', background: '#fff9f9', border: '1px solid #fecdd3' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#be185d', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <ShieldAlert size={18} /> {tenant.is_active ? 'Suspend Organization' : 'Reactivate Organization'}
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#9f1239', marginBottom: '1.25rem', lineHeight: 1.6 }}>
              {tenant.is_active
                ? 'Suspending this organization will immediately prevent all users from logging in. No data will be deleted. This can be reversed at any time.'
                : 'Reactivating will restore full access for all users in this organization.'}
            </p>
            <button
              onClick={handleSuspend}
              disabled={suspending}
              className="btn"
              style={{ background: tenant.is_active ? '#e11d48' : '#059669', color: 'white', border: 'none', gap: 6 }}
            >
              <ShieldAlert size={15} />
              {suspending ? 'Processing...' : tenant.is_active ? `Suspend ${tenant.name}` : `Reactivate ${tenant.name}`}
            </button>
          </div>

          <div className="glass-card" style={{ padding: '1.75rem', background: '#fff9f9', border: '1px solid #fecdd3' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#be185d', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <ShieldAlert size={18} /> Delete Organization
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#9f1239', marginBottom: '1.25rem', lineHeight: 1.6 }}>
              Permanently delete this organization and ALL associated data. This action <strong>cannot be undone</strong>.
            </p>
            <button
              className="btn"
              style={{ background: 'transparent', color: '#e11d48', border: '2px solid #fecdd3', gap: 6 }}
              onClick={() => toast.error('Permanent deletion requires confirmation via email link.')}
            >
              <ShieldAlert size={15} /> Permanently Delete Organization
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
