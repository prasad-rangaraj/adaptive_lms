import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { tenantsAPI, adminAPI } from '../../services/api.service';
import {
  Building2, Plus, Globe, Search, ArrowUpRight, CheckCircle, Loader2,
  Zap, Crown, Star, Users, ShieldCheck, GraduationCap, BookOpen,
  Ban, ChevronRight, Palette, MoreHorizontal, X, TrendingUp,
  AlertCircle, Activity, Server, Eye
} from 'lucide-react';

// ─── Design Tokens ────────────────────────────────────────────────────────────
const PLAN_META = {
  basic:      { label: 'Basic',      icon: Star,   color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb', gradient: 'linear-gradient(135deg,#6b7280,#9ca3af)' },
  pro:        { label: 'Pro',        icon: Zap,    color: '#059669', bg: '#ecfdf5', border: '#6ee7b7', gradient: 'linear-gradient(135deg,#059669,#10b981)' },
  enterprise: { label: 'Enterprise', icon: Crown,  color: '#7c3aed', bg: '#f5f3ff', border: '#c4b5fd', gradient: 'linear-gradient(135deg,#7c3aed,#a78bfa)' },
};

const ROLE_META = {
  student:      { label: 'Student',     icon: GraduationCap, color: '#0891b2', bg: '#ecfeff',  border: '#a5f3fc' },
  teacher:      { label: 'Teacher',     icon: BookOpen,      color: '#16a34a', bg: '#f0fdf4',  border: '#bbf7d0' },
  tenant_admin: { label: 'Admin',       icon: Building2,     color: '#d97706', bg: '#fffbeb',  border: '#fde68a' },
  super_admin:  { label: 'Super Admin', icon: ShieldCheck,   color: '#db2777', bg: '#fdf2f8',  border: '#fbcfe8' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function initials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── Mini Components ──────────────────────────────────────────────────────────
function Badge({ color, bg, border, icon: Icon, label, small }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: small ? '0.7rem' : '0.75rem',
      fontWeight: 700, padding: small ? '2px 6px' : '3px 8px',
      borderRadius: 6, color, background: bg, border: `1px solid ${border}`,
      whiteSpace: 'nowrap'
    }}>
      {Icon && <Icon size={small ? 10 : 11} />}
      {label}
    </span>
  );
}

function StatusDot({ active }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <span style={{
        width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
        background: active ? '#22c55e' : '#ef4444',
        boxShadow: active ? '0 0 0 2px #dcfce7' : '0 0 0 2px #fee2e2'
      }} />
      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: active ? '#16a34a' : '#dc2626' }}>
        {active ? 'Active' : 'Suspended'}
      </span>
    </span>
  );
}

function Avatar({ name, color, size = 38 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.28, flexShrink: 0,
      background: color || 'var(--brand-500)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'white', fontWeight: 800, fontSize: size * 0.35,
      letterSpacing: '-0.02em'
    }}>
      {initials(name)}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <p style={{
      fontSize: '0.6875rem', fontWeight: 800, letterSpacing: '0.1em',
      textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem'
    }}>
      {children}
    </p>
  );
}

function StatPill({ icon: Icon, label, value, color }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '0.875rem 1.125rem',
      background: 'var(--surface-0)', border: '1px solid var(--glass-border)',
      borderRadius: 14, flex: 1, minWidth: 0
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
        background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <Icon size={17} color={color} />
      </div>
      <div>
        <p style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</p>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{label}</p>
      </div>
    </div>
  );
}

// ─── Deploy Panel (slide-in side drawer) ─────────────────────────────────────
function DeployDrawer({ open, onClose, onDeployed }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    name: '', subdomain: '', plan: 'basic',
    primary_color: '#6366f1', secondary_color: '#8b5cf6'
  });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await tenantsAPI.create(form);
      setDone(res.data);
      qc.invalidateQueries(['tenants']);
      toast.success(`"${res.data.name}" deployed!`);
      setForm({ name: '', subdomain: '', plan: 'basic', primary_color: '#6366f1', secondary_color: '#8b5cf6' });
      onDeployed?.();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Deploy failed');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)',
          backdropFilter: 'blur(2px)', zIndex: 40
        }}
      />
      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 440,
        background: 'var(--surface-0)', borderLeft: '1px solid var(--glass-border)',
        boxShadow: '-24px 0 60px rgba(0,0,0,0.12)', zIndex: 50,
        display: 'flex', flexDirection: 'column', overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.75rem 2rem 1.5rem', borderBottom: '1px solid var(--glass-border)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Server size={17} color="white" />
              </div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Deploy New Tenant
              </h2>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Provision a new organization on the platform.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              border: 'none', background: 'var(--surface-2)', borderRadius: 8,
              width: 32, height: 32, display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)', flexShrink: 0
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: '1.75rem 2rem', flex: 1 }}>
          {done && (
            <div style={{
              marginBottom: '1.5rem', padding: '1rem 1.25rem', borderRadius: 12,
              background: '#f0fdf4', border: '1px solid #86efac',
              display: 'flex', gap: 10, alignItems: 'flex-start'
            }}>
              <CheckCircle size={17} color="#16a34a" style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <p style={{ fontWeight: 700, color: '#15803d', fontSize: '0.875rem' }}>Deployed successfully!</p>
                <p style={{ fontSize: '0.8rem', color: '#166534', marginTop: 2 }}>
                  {done.name} is live at <strong>{done.subdomain}.lms.com</strong>
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Name */}
            <div>
              <SectionLabel>Organization Details</SectionLabel>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Organization Name *
              </label>
              <input
                value={form.name} onChange={e => set('name', e.target.value)}
                placeholder="e.g. Sunrise University"
                className="input-field" style={{ width: '100%' }} required
              />
            </div>

            {/* Subdomain */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                <Globe size={12} style={{ display: 'inline', marginRight: 4 }} />
                Subdomain *
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  value={form.subdomain} onChange={e => set('subdomain', e.target.value)}
                  placeholder="sunrise-univ"
                  className="input-field" style={{ flex: 1 }} required
                />
                <span style={{
                  fontSize: '0.8125rem', color: 'var(--text-muted)',
                  whiteSpace: 'nowrap', padding: '0 4px'
                }}>.lms.com</span>
              </div>
            </div>

            {/* Plan */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>
                Subscription Plan
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {Object.entries(PLAN_META).map(([key, meta]) => {
                  const PlanIcon = meta.icon;
                  const active = form.plan === key;
                  return (
                    <label key={key} style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '0.875rem 1rem',
                      borderRadius: 12, cursor: 'pointer',
                      border: `2px solid ${active ? meta.color : 'var(--glass-border)'}`,
                      background: active ? meta.bg : 'transparent',
                      transition: 'all 0.15s'
                    }}>
                      <input type="radio" name="plan" value={key} checked={active} onChange={() => set('plan', key)} style={{ display: 'none' }} />
                      <div style={{
                        width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                        background: active ? meta.gradient : 'var(--surface-2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <PlanIcon size={16} color={active ? 'white' : 'var(--text-muted)'} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 700, fontSize: '0.875rem', color: active ? meta.color : 'var(--text-primary)' }}>
                          {meta.label}
                        </p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 1 }}>
                          {key === 'basic' ? 'Up to 500 users · Core features' :
                           key === 'pro' ? 'Up to 5,000 users · Advanced analytics' :
                           'Unlimited users · Full feature access'}
                        </p>
                      </div>
                      {active && <CheckCircle size={16} color={meta.color} />}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Brand Colors */}
            <div>
              <SectionLabel>Brand Identity</SectionLabel>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                {[['primary_color', 'Primary Color'], ['secondary_color', 'Secondary Color']].map(([key, label]) => (
                  <div key={key}>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                      <Palette size={11} style={{ display: 'inline', marginRight: 4 }} />{label}
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px', borderRadius: 10, border: '1px solid var(--glass-border)', background: 'var(--surface-1)' }}>
                      <input
                        type="color" value={form[key]}
                        onChange={e => set(key, e.target.value)}
                        style={{ width: 32, height: 32, padding: 0, border: 'none', borderRadius: 6, cursor: 'pointer', flexShrink: 0, background: 'none' }}
                      />
                      <input
                        value={form[key]}
                        onChange={e => set(key, e.target.value)}
                        className="input-field"
                        style={{ flex: 1, fontFamily: 'monospace', fontSize: '0.8rem', border: 'none', background: 'none', padding: '4px 0' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              {/* Preview */}
              <div style={{
                marginTop: 12, borderRadius: 10, padding: '0.75rem 1rem',
                background: `linear-gradient(135deg, ${form.primary_color}, ${form.secondary_color})`,
                display: 'flex', alignItems: 'center', gap: 10
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '0.875rem'
                }}>
                  {form.name?.[0]?.toUpperCase() || 'O'}
                </div>
                <div>
                  <p style={{ color: 'white', fontWeight: 700, fontSize: '0.875rem' }}>{form.name || 'Organization Name'}</p>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem' }}>{form.subdomain || 'subdomain'}.lms.com</p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '0.875rem', fontSize: '0.9375rem', borderRadius: 12, gap: 8 }}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Server size={16} />}
              {loading ? 'Deploying…' : 'Deploy Tenant'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

// ─── Organizations Tab ────────────────────────────────────────────────────────
function OrganizationsTab() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data: tenants = [], isLoading } = useQuery({
    queryKey: ['tenants'],
    queryFn: () => tenantsAPI.list().then(r => r.data),
  });

  const filtered = useMemo(() => tenants.filter(t => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
                        t.subdomain.toLowerCase().includes(search.toLowerCase());
    const matchPlan = planFilter === 'all' || t.plan === planFilter;
    return matchSearch && matchPlan;
  }), [tenants, search, planFilter]);

  // Stats
  const stats = useMemo(() => ({
    total: tenants.length,
    active: tenants.filter(t => t.is_active).length,
    enterprise: tenants.filter(t => t.plan === 'enterprise').length,
    pro: tenants.filter(t => t.plan === 'pro').length,
  }), [tenants]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Stats row */}
      <div style={{ display: 'flex', gap: '0.875rem' }}>
        <StatPill icon={Building2} label="Total Orgs" value={stats.total} color="#6366f1" />
        <StatPill icon={Activity} label="Active" value={stats.active} color="#22c55e" />
        <StatPill icon={Crown} label="Enterprise" value={stats.enterprise} color="#7c3aed" />
        <StatPill icon={Zap} label="Pro" value={stats.pro} color="#059669" />
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 340, minWidth: 200 }}>
          <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input
            type="text" placeholder="Search organizations…"
            value={search} onChange={e => setSearch(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '2.25rem', width: '100%', height: 40 }}
          />
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          {['all', 'basic', 'pro', 'enterprise'].map(key => {
            const meta = key !== 'all' ? PLAN_META[key] : null;
            const active = planFilter === key;
            return (
              <button
                key={key}
                onClick={() => setPlanFilter(key)}
                style={{
                  padding: '6px 14px', borderRadius: 8, border: `1.5px solid ${active ? (meta?.color || 'var(--brand-500)') : 'var(--glass-border)'}`,
                  background: active ? (meta?.bg || 'var(--brand-50)') : 'transparent',
                  color: active ? (meta?.color || 'var(--brand-600)') : 'var(--text-muted)',
                  fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s'
                }}
              >
                {key === 'all' ? 'All Plans' : PLAN_META[key].label}
              </button>
            );
          })}
        </div>

        <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
          <button
            className="btn btn-primary"
            onClick={() => setDrawerOpen(true)}
            style={{ gap: 7, padding: '0 1.125rem', height: 40 }}
          >
            <Plus size={16} /> Deploy New
          </button>
        </div>
      </div>

      {/* Count */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          Showing <strong style={{ color: 'var(--text-primary)' }}>{filtered.length}</strong> of {tenants.length} organizations
        </p>
      </div>

      {/* List */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ height: 80, borderRadius: 16, background: 'var(--surface-1)', border: '1px solid var(--glass-border)', animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      ) : !filtered.length ? (
        <div style={{ padding: '4rem', textAlign: 'center', borderRadius: 20, border: '2px dashed var(--glass-border)' }}>
          <Building2 size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
          <p style={{ fontWeight: 700, color: 'var(--text-secondary)', fontSize: '1rem' }}>No organizations found</p>
          <p style={{ color: 'var(--text-muted)', marginTop: 6, fontSize: '0.875rem' }}>
            {search ? `No results for "${search}"` : 'Deploy your first tenant to get started.'}
          </p>
          {!search && (
            <button className="btn btn-primary" onClick={() => setDrawerOpen(true)} style={{ marginTop: '1.25rem', gap: 7 }}>
              <Plus size={15} /> Deploy First Tenant
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {filtered.map(t => {
            const plan = PLAN_META[t.plan] || PLAN_META.basic;
            const PlanIcon = plan.icon;
            return (
              <div
                key={t.id}
                onClick={() => navigate(`/super-admin/tenants/${t.id}`)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '1.25rem',
                  padding: '1.125rem 1.5rem', borderRadius: 16, cursor: 'pointer',
                  background: 'var(--surface-0)', border: '1px solid var(--glass-border)',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)'; e.currentTarget.style.borderColor = 'var(--brand-200, #c7d2fe)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'var(--glass-border)'; }}
              >
                {/* Brand avatar */}
                <div style={{
                  width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                  background: `linear-gradient(135deg, ${t.primary_color}, ${t.secondary_color})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 800, fontSize: '1.125rem',
                  boxShadow: `0 4px 14px ${t.primary_color}50`
                }}>
                  {t.name[0]?.toUpperCase()}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9375rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.name}
                    </p>
                    <Badge color={plan.color} bg={plan.bg} border={plan.border} icon={PlanIcon} label={plan.label} small />
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    {t.subdomain}.lms.com
                  </p>
                </div>

                {/* Right side */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexShrink: 0 }}>
                  <StatusDot active={t.is_active} />
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'none' }}>
                    {fmtDate(t.created_at)}
                  </p>
                  <div style={{
                    width: 32, height: 32, borderRadius: 9, background: 'var(--surface-1)',
                    border: '1px solid var(--glass-border)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center'
                  }}>
                    <ChevronRight size={15} color="var(--text-muted)" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <DeployDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onDeployed={() => setDrawerOpen(false)}
      />
    </div>
  );
}

// ─── Global Users Tab ──────────────────────────────────────────────────────────
function GlobalUsersTab() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [orgFilter, setOrgFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['global-users'],
    queryFn: () => adminAPI.listGlobalUsers().then(r => r.data),
  });

  const { data: tenants = [] } = useQuery({
    queryKey: ['tenants'],
    queryFn: () => tenantsAPI.list().then(r => r.data),
  });
  const tenantMap = useMemo(() =>
    tenants.reduce((a, t) => { a[t.id] = t; return a; }, {}),
    [tenants]
  );

  const toggleStatus = useMutation({
    mutationFn: (userId) => adminAPI.suspendUser(userId),
    onSuccess: (data) => {
      toast.success(data.data.message);
      queryClient.invalidateQueries(['global-users']);
      setSelected(null);
    },
    onError: () => toast.error('Failed to update user status'),
  });

  const filtered = useMemo(() => users.filter(u => {
    const matchSearch = u.full_name.toLowerCase().includes(search.toLowerCase()) ||
                        u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const matchOrg = orgFilter === 'all' || (orgFilter === 'platform' ? !u.tenant_id : String(u.tenant_id) === String(orgFilter));
    return matchSearch && matchRole && matchOrg;
  }), [users, search, roleFilter, orgFilter]);

  const orgScopedUsers = useMemo(() =>
    users.filter(u => orgFilter === 'all' || (orgFilter === 'platform' ? !u.tenant_id : String(u.tenant_id) === String(orgFilter))),
    [users, orgFilter]
  );

  const roleCounts = useMemo(() =>
    orgScopedUsers.reduce((a, u) => { a[u.role] = (a[u.role] || 0) + 1; return a; }, {}),
    [orgScopedUsers]
  );

  const stats = useMemo(() => ({
    total: orgScopedUsers.length,
    active: orgScopedUsers.filter(u => u.is_active).length,
    students: orgScopedUsers.filter(u => u.role === 'student').length,
    teachers: orgScopedUsers.filter(u => u.role === 'teacher').length,
  }), [orgScopedUsers]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Stats */}
      <div style={{ display: 'flex', gap: '0.875rem' }}>
        <StatPill icon={Users} label="Total Users" value={stats.total} color="#6366f1" />
        <StatPill icon={Activity} label="Active" value={stats.active} color="#22c55e" />
        <StatPill icon={GraduationCap} label="Students" value={stats.students} color="#0891b2" />
        <StatPill icon={BookOpen} label="Teachers" value={stats.teachers} color="#16a34a" />
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 300, minWidth: 180 }}>
          <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input
            type="text" placeholder="Search users by name or email…"
            value={search} onChange={e => setSearch(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '2.25rem', width: '100%', height: 40 }}
          />
        </div>

        {/* Organization Dropdown Filter */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Building2 size={15} color={orgFilter !== 'all' ? 'var(--brand-600)' : 'var(--text-muted)'} style={{ position: 'absolute', left: 12, pointerEvents: 'none' }} />
          <select
            value={orgFilter}
            onChange={e => setOrgFilter(e.target.value)}
            style={{
              padding: '0 32px 0 34px',
              borderRadius: 10,
              border: `1.5px solid ${orgFilter !== 'all' ? 'var(--brand-500)' : 'var(--glass-border)'}`,
              background: orgFilter !== 'all' ? 'var(--brand-50)' : 'var(--surface-0)',
              color: orgFilter !== 'all' ? 'var(--brand-600)' : 'var(--text-secondary)',
              fontSize: '0.8125rem',
              fontWeight: 700,
              cursor: 'pointer',
              outline: 'none',
              height: 40,
              appearance: 'none',
              backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239ca3af%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 12px center',
              backgroundSize: '9px auto',
              transition: 'all 0.15s'
            }}
          >
            <option value="all">All Organizations ({users.length})</option>
            <option value="platform">Platform Core ({users.filter(u => !u.tenant_id).length})</option>
            {tenants.map(t => {
              const count = users.filter(u => u.tenant_id === t.id).length;
              return (
                <option key={t.id} value={t.id}>
                  {t.name} ({count})
                </option>
              );
            })}
          </select>
        </div>

        {/* Role filters */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button
            onClick={() => setRoleFilter('all')}
            style={{
              padding: '6px 14px', borderRadius: 8, fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
              border: `1.5px solid ${roleFilter === 'all' ? 'var(--brand-500)' : 'var(--glass-border)'}`,
              background: roleFilter === 'all' ? 'var(--brand-50)' : 'transparent',
              color: roleFilter === 'all' ? 'var(--brand-600)' : 'var(--text-muted)',
            }}
          >
            All <span style={{ fontSize: '0.75rem', opacity: 0.75 }}>({orgScopedUsers.length})</span>
          </button>
          {Object.entries(ROLE_META).map(([key, meta]) => {
            const active = roleFilter === key;
            return (
              <button key={key} onClick={() => setRoleFilter(key)} style={{
                padding: '6px 14px', borderRadius: 8, fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
                border: `1.5px solid ${active ? meta.color : 'var(--glass-border)'}`,
                background: active ? meta.bg : 'transparent',
                color: active ? meta.color : 'var(--text-muted)',
              }}>
                {meta.label} <span style={{ fontSize: '0.75rem', opacity: 0.75 }}>({roleCounts[key] || 0})</span>
              </button>
            );
          })}
        </div>
      </div>

      <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
        Showing <strong style={{ color: 'var(--text-primary)' }}>{filtered.length}</strong> of {users.length} users
      </p>

      {/* Table */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1,2,3,4,5].map(i => (
            <div key={i} style={{ height: 64, borderRadius: 12, background: 'var(--surface-1)', border: '1px solid var(--glass-border)' }} />
          ))}
        </div>
      ) : !filtered.length ? (
        <div style={{ padding: '4rem', textAlign: 'center', borderRadius: 20, border: '2px dashed var(--glass-border)' }}>
          <Users size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
          <p style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>No users match your search</p>
        </div>
      ) : (
        <div style={{
          borderRadius: 16, border: '1px solid var(--glass-border)',
          background: 'var(--surface-0)', overflow: 'hidden'
        }}>
          {/* Table header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 1fr 1fr auto',
            padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--glass-border)',
            background: 'var(--surface-1)'
          }}>
            {['User', 'Role', 'Organization', 'Status', 'Joined', ''].map((h, i) => (
              <p key={i} style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                {h}
              </p>
            ))}
          </div>

          {/* Rows */}
          {filtered.map((u, idx) => {
            const role = ROLE_META[u.role] || ROLE_META.student;
            const RoleIcon = role.icon;
            const tenant = tenantMap[u.tenant_id];
            const isLast = idx === filtered.length - 1;
            return (
              <div
                key={u.id}
                style={{
                  display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 1fr 1fr auto',
                  padding: '0.875rem 1.25rem', alignItems: 'center',
                  borderBottom: isLast ? 'none' : '1px solid var(--glass-border)',
                  transition: 'background 0.1s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {/* User */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  <Avatar name={u.full_name} color={role.color} size={36} />
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {u.full_name}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {u.email}
                    </p>
                  </div>
                </div>

                {/* Role */}
                <div>
                  <Badge color={role.color} bg={role.bg} border={role.border} icon={RoleIcon} label={role.label} small />
                </div>

                {/* Org */}
                <div style={{ minWidth: 0 }}>
                  {tenant ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{
                        width: 20, height: 20, borderRadius: 5, flexShrink: 0,
                        background: `linear-gradient(135deg, ${tenant.primary_color}, ${tenant.secondary_color})`
                      }} />
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {tenant.name}
                      </span>
                    </div>
                  ) : (
                    <Badge color="var(--brand-600)" bg="var(--brand-50)" border="var(--brand-100, #e0e7ff)" icon={ShieldCheck} label="Platform" small />
                  )}
                </div>

                {/* Status */}
                <div><StatusDot active={u.is_active} /></div>

                {/* Joined */}
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{fmtDate(u.created_at)}</p>

                {/* Actions */}
                <button
                  onClick={() => toggleStatus.mutate(u.id)}
                  disabled={toggleStatus.isPending || u.role === 'super_admin'}
                  title={u.role === 'super_admin' ? 'Cannot suspend Super Admin' : u.is_active ? 'Suspend User' : 'Activate User'}
                  style={{
                    border: 'none', borderRadius: 8, width: 30, height: 30,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: u.role === 'super_admin' ? 'not-allowed' : 'pointer',
                    background: u.is_active ? '#fee2e2' : '#dcfce7',
                    color: u.is_active ? '#ef4444' : '#16a34a',
                    opacity: u.role === 'super_admin' ? 0.35 : 1,
                    transition: 'all 0.15s'
                  }}
                >
                  {u.is_active ? <Ban size={14} /> : <CheckCircle size={14} />}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main Hub ──────────────────────────────────────────────────────────────────
export default function GlobalDirectoryHub() {
  const [activeTab, setActiveTab] = useState('orgs');

  const TABS = [
    { id: 'orgs',  label: 'Organizations', icon: Building2 },
    { id: 'users', label: 'Global Users',   icon: Users     },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: 1200, margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%', background: '#22c55e',
              boxShadow: '0 0 0 3px #dcfce7'
            }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Global Directory
            </span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.04em', lineHeight: 1.1 }}>
            Platform Overview
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginTop: 6 }}>
            Manage all organizations and users across the platform.
          </p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--glass-border)', gap: 0 }}>
        {TABS.map(tab => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '0.875rem 1.5rem', border: 'none', background: 'transparent',
                cursor: 'pointer', fontWeight: active ? 700 : 600,
                fontSize: '0.9rem',
                color: active ? 'var(--brand-600)' : 'var(--text-muted)',
                borderBottom: `2px solid ${active ? 'var(--brand-500)' : 'transparent'}`,
                marginBottom: -1, transition: 'all 0.15s'
              }}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'orgs' ? <OrganizationsTab /> : <GlobalUsersTab />}
    </div>
  );
}
