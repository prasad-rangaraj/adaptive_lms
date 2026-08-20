import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { tenantsAPI, adminAPI } from '../../services/api.service';
import Loader from '../../components/ui/Loader';
import { 
  Building2, Plus, Globe, Palette, Search, ArrowRight, CheckCircle, Loader2, 
  Zap, Crown, Star, Users, Filter, ShieldCheck, GraduationCap, BookOpen, 
  UserX, Ban 
} from 'lucide-react';

// ── Shared Config ─────────────────────────────────────────────────────────────
const PLAN_META = {
  basic:      { label: 'Basic',      icon: Star,   color: '#4b5563', bg: '#f9fafb', border: '#e5e7eb' },
  pro:        { label: 'Pro',        icon: Zap,    color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  enterprise: { label: 'Enterprise', icon: Crown,  color: '#155e75', bg: '#ecfeff', border: '#a5f3fc' },
};

const ROLE_META = {
  student:     { label: 'Student',     icon: GraduationCap, color: '#0e7490', bg: '#ecfeff', border: '#a5f3fc' },
  teacher:     { label: 'Teacher',     icon: BookOpen,      color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  tenant_admin:{ label: 'Admin',       icon: Building2,     color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  super_admin: { label: 'Super Admin', icon: ShieldCheck,   color: '#db2777', bg: '#fdf2f8', border: '#fbcfe8' },
};

// ── Organizations Tab ────────────────────────────────────────────────────────
function OrganizationsTab() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', subdomain: '', plan: 'basic', primary_color: '#6366f1', secondary_color: '#8b5cf6' });
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(null);

  const { data: tenants, isLoading } = useQuery({
    queryKey: ['tenants'],
    queryFn: () => tenantsAPI.list().then(r => r.data),
  });

  const filtered = tenants?.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.subdomain.toLowerCase().includes(search.toLowerCase()));

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await tenantsAPI.create(form);
      setCreated(res.data);
      qc.invalidateQueries(['tenants']);
      toast.success(`"${res.data.name}" deployed successfully!`);
      setForm({ name: '', subdomain: '', plan: 'basic', primary_color: '#6366f1', secondary_color: '#8b5cf6' });
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create tenant');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: '1.5rem', alignItems: 'start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input type="text" placeholder="Search organizations..." value={search} onChange={e => setSearch(e.target.value)} className="input-field" style={{ paddingLeft: '2.5rem', width: '100%', height: 42 }} />
        </div>

        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
        ) : !filtered?.length ? (
          <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
            <Building2 size={32} color="var(--text-muted)" style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
            <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>No organizations found.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filtered.map(t => {
              const plan = PLAN_META[t.plan] || PLAN_META.basic;
              const PlanIcon = plan.icon;
              return (
                <div key={t.id} className="glass-card" onClick={() => navigate(`/super-admin/tenants/${t.id}`)} style={{ padding: '1.25rem 1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, flexShrink: 0, background: `linear-gradient(135deg, ${t.primary_color}, ${t.secondary_color})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '1.125rem', boxShadow: `0 4px 12px ${t.primary_color}40` }}>
                    {t.name[0]?.toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>{t.name}</p>
                      <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: plan.color, background: plan.bg, border: `1px solid ${plan.border}`, padding: '2px 7px', borderRadius: 999, display: 'flex', alignItems: 'center', gap: 3 }}><PlanIcon size={10} /> {plan.label}</span>
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 2 }}>{t.subdomain}.lms.com</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: t.is_active ? '#22c55e' : '#dc2626' }} />
                      <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: t.is_active ? '#16a34a' : '#dc2626' }}>{t.is_active ? 'Active' : 'Suspended'}</span>
                    </div>
                    <ArrowRight size={16} color="var(--text-muted)" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ position: 'sticky', top: '1rem' }}>
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.5rem' }}>
            <Plus size={20} color="var(--brand-500)" /> Deploy New Tenant
          </h2>
          {created && (
            <div style={{ marginBottom: '1.5rem', padding: '1rem', borderRadius: 12, background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
              <p style={{ fontWeight: 700, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}><CheckCircle size={16} /> Deployed!</p>
              <p style={{ fontSize: '0.8125rem', color: '#15803d' }}>{created.name} is now live at <strong>{created.subdomain}.lms.com</strong></p>
            </div>
          )}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Organization Name *</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Sunrise University" className="input-field" style={{ width: '100%' }} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}><Globe size={13} style={{ display: 'inline', marginRight: 4 }} />Subdomain *</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input name="subdomain" value={form.subdomain} onChange={handleChange} placeholder="sunrise-univ" className="input-field" style={{ flex: 1 }} required />
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>.lms.com</span>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Subscription Plan</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {Object.entries(PLAN_META).map(([key, meta]) => {
                  const PlanIcon = meta.icon;
                  return (
                    <label key={key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '0.75rem 0.5rem', borderRadius: 10, cursor: 'pointer', border: `2px solid ${form.plan === key ? meta.color : 'var(--glass-border)'}`, background: form.plan === key ? meta.bg : 'transparent', transition: 'all 0.15s' }}>
                      <input type="radio" name="plan" value={key} checked={form.plan === key} onChange={handleChange} style={{ display: 'none' }} />
                      <PlanIcon size={16} color={form.plan === key ? meta.color : 'var(--text-muted)'} />
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: form.plan === key ? meta.color : 'var(--text-muted)' }}>{meta.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}><Palette size={13} style={{ display: 'inline', marginRight: 4 }} />Primary</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="color" name="primary_color" value={form.primary_color} onChange={handleChange} style={{ width: 36, height: 36, padding: 0, border: 'none', borderRadius: 8, cursor: 'pointer', flexShrink: 0 }} />
                  <input value={form.primary_color} onChange={(e) => setForm(f => ({ ...f, primary_color: e.target.value }))} className="input-field" style={{ flex: 1, fontFamily: 'monospace', fontSize: '0.75rem' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Secondary</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="color" name="secondary_color" value={form.secondary_color} onChange={handleChange} style={{ width: 36, height: 36, padding: 0, border: 'none', borderRadius: 8, cursor: 'pointer', flexShrink: 0 }} />
                  <input value={form.secondary_color} onChange={(e) => setForm(f => ({ ...f, secondary_color: e.target.value }))} className="input-field" style={{ flex: 1, fontFamily: 'monospace', fontSize: '0.75rem' }} />
                </div>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              {loading ? 'Deploying...' : 'Deploy Tenant'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ── Global Users Tab ──────────────────────────────────────────────────────────
function GlobalUsersTab() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const { data: users, isLoading } = useQuery({
    queryKey: ['global-users'],
    queryFn: () => adminAPI.listGlobalUsers().then(r => r.data),
  });

  const toggleStatus = useMutation({
    mutationFn: (userId) => adminAPI.suspendUser(userId),
    onSuccess: (data) => {
      toast.success(data.data.message);
      queryClient.invalidateQueries(['global-users']);
    },
    onError: () => toast.error('Failed to update user status'),
  });

  const filtered = users?.filter(u => {
    const matchSearch = u.full_name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const roleCounts = users?.reduce((acc, u) => { acc[u.role] = (acc[u.role] || 0) + 1; return acc; }, {}) || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button onClick={() => setRoleFilter('all')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 999, border: '2px solid', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', borderColor: roleFilter === 'all' ? 'var(--brand-500)' : 'var(--glass-border)', background: roleFilter === 'all' ? 'var(--brand-50)' : 'transparent', color: roleFilter === 'all' ? 'var(--brand-600)' : 'var(--text-muted)', transition: 'all 0.15s' }}>
          <Filter size={13} /> All Roles
          <span style={{ background: roleFilter === 'all' ? 'var(--brand-500)' : 'var(--surface-3)', color: roleFilter === 'all' ? 'white' : 'var(--text-secondary)', borderRadius: 999, padding: '1px 7px', fontSize: '0.6875rem', fontWeight: 700 }}>{users?.length || 0}</span>
        </button>
        {Object.entries(ROLE_META).map(([key, meta]) => {
          const Icon = meta.icon;
          const active = roleFilter === key;
          return (
            <button key={key} onClick={() => setRoleFilter(key)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 999, border: '2px solid', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', borderColor: active ? meta.color : 'var(--glass-border)', background: active ? meta.bg : 'transparent', color: active ? meta.color : 'var(--text-muted)', transition: 'all 0.15s' }}>
              <Icon size={13} /> {meta.label}
              <span style={{ background: active ? meta.color : 'var(--surface-3)', color: active ? 'white' : 'var(--text-secondary)', borderRadius: 999, padding: '1px 7px', fontSize: '0.6875rem', fontWeight: 700 }}>{roleCounts[key] || 0}</span>
            </button>
          );
        })}
      </div>

      <div className="glass-card" style={{ padding: 0 }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', background: 'var(--surface-1)', borderTopLeftRadius: 'inherit', borderTopRightRadius: 'inherit' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 340 }}>
            <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input type="text" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} className="input-field" style={{ paddingLeft: '2.25rem', width: '100%', height: 36, fontSize: '0.875rem' }} />
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, background: 'var(--surface-0)', padding: '4px 10px', borderRadius: 999, border: '1px solid var(--glass-border)', flexShrink: 0 }}>{filtered?.length || 0} shown</span>
        </div>

        {isLoading ? (
          <Loader text="Loading global users..." />
        ) : !filtered?.length ? (
          <div style={{ padding: '4rem', textAlign: 'center' }}>
            <UserX size={32} color="var(--text-muted)" style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
            <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>No users match your filters.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead><tr><th>User</th><th>Role</th><th>Organization</th><th>Status</th><th>Joined</th><th></th></tr></thead>
              <tbody>
                {filtered.map(u => {
                  const role = ROLE_META[u.role] || ROLE_META.student;
                  const RoleIcon = role.icon;
                  return (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 38, height: 38, borderRadius: 12, flexShrink: 0, background: role.bg, border: `1px solid ${role.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: role.color, fontWeight: 700, fontSize: '0.9375rem' }}>
                            {u.full_name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{u.full_name}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td><span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', fontWeight: 700, color: role.color, background: role.bg, border: `1px solid ${role.border}`, padding: '3px 8px', borderRadius: 6 }}><RoleIcon size={11} /> {role.label}</span></td>
                      <td>
                        {u.tenant_id ? (
                          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}><Building2 size={12} color="var(--text-muted)" /> Org #{u.tenant_id}</span>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--brand-600)', fontWeight: 700, background: 'var(--brand-50)', padding: '2px 7px', borderRadius: 4 }}>Platform</span>
                        )}
                      </td>
                      <td>
                        {u.is_active ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.8125rem', fontWeight: 500, color: '#16a34a' }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} /> Active</span>
                        ) : (
                          <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#dc2626' }}>Suspended</span>
                        )}
                      </td>
                      <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{new Date(u.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                      <td>
                        <button onClick={() => toggleStatus.mutate(u.id)} className="btn btn-ghost btn-icon btn-sm" title={u.is_active ? "Suspend User" : "Activate User"} disabled={toggleStatus.isLoading || u.role === 'super_admin'}>
                          {u.is_active ? <Ban size={16} color="var(--text-muted)" /> : <CheckCircle size={16} color="var(--text-muted)" />}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Hub ──────────────────────────────────────────────────────────────────
export default function GlobalDirectoryHub() {
  const [activeTab, setActiveTab] = useState('orgs'); // 'orgs' | 'users'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1.5rem' }}>
        <div>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-600)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Global Directory</p>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>Organizations & Users</h1>
        </div>
        
        <div style={{ display: 'flex', background: 'var(--surface-1)', padding: 6, borderRadius: 16, border: '1px solid var(--glass-border)', gap: 4 }}>
          {[
            { id: 'orgs', label: 'Organizations', icon: Building2 },
            { id: 'users', label: 'Global Users', icon: Users },
          ].map(t => (
            <button 
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{ 
                display: 'flex', alignItems: 'center', gap: 8, padding: '0.625rem 1.25rem', borderRadius: 12, border: 'none', cursor: 'pointer',
                fontWeight: 700, fontSize: '0.875rem', transition: 'all 0.2s',
                background: activeTab === t.id ? 'white' : 'transparent',
                color: activeTab === t.id ? 'var(--brand-600)' : 'var(--text-muted)',
                boxShadow: activeTab === t.id ? '0 2px 8px rgba(0,0,0,0.06)' : 'none'
              }}>
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'orgs' ? <OrganizationsTab /> : <GlobalUsersTab />}
    </div>
  );
}
