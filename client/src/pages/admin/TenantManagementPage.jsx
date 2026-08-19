import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { tenantsAPI } from '../../services/api.service';
import { Building2, Plus, Globe, Palette, Search, ArrowRight, CheckCircle, Loader2, Zap, Crown, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const PLAN_META = {
  basic:      { label: 'Basic',      icon: Star,   color: '#4b5563', bg: '#f9fafb', border: '#e5e7eb' },
  pro:        { label: 'Pro',        icon: Zap,    color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  enterprise: { label: 'Enterprise', icon: Crown,  color: '#155e75', bg: '#ecfeff', border: '#a5f3fc' },
};

export default function TenantManagementPage() {
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

  const filtered = tenants?.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.subdomain.toLowerCase().includes(search.toLowerCase())
  );

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title">Tenant Organizations</h1>
          <p className="page-subtitle">Deploy and manage organizations on the platform.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            {tenants?.length || 0} organizations
          </span>
        </div>
      </div>

      {/* Split Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: '1.5rem', alignItems: 'start' }}>

        {/* Left — Tenant Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Search bar */}
          <div style={{ position: 'relative' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Search organizations..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '2.5rem', width: '100%', height: 42 }}
            />
          </div>

          {/* Tenant cards */}
          {isLoading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
          ) : !filtered?.length ? (
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
              <Building2 size={32} color="var(--text-muted)" style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
              <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>No organizations found.</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 4 }}>Create your first tenant using the form →</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filtered.map(t => {
                const plan = PLAN_META[t.plan] || PLAN_META.basic;
                const PlanIcon = plan.icon;
                return (
                  <div
                    key={t.id}
                    className="glass-card"
                    onClick={() => navigate(`/super-admin/tenants/${t.id}`)}
                    style={{ padding: '1.25rem 1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1.25rem' }}
                  >
                    {/* Avatar */}
                    <div style={{
                      width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                      background: `linear-gradient(135deg, ${t.primary_color}, ${t.secondary_color})`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: 800, fontSize: '1.125rem',
                      boxShadow: `0 4px 12px ${t.primary_color}40`,
                    }}>
                      {t.name[0]?.toUpperCase()}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>{t.name}</p>
                        <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: plan.color, background: plan.bg, border: `1px solid ${plan.border}`, padding: '2px 7px', borderRadius: 999, display: 'flex', alignItems: 'center', gap: 3 }}>
                          <PlanIcon size={10} /> {plan.label}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 2 }}>{t.subdomain}.lms.com</p>
                    </div>

                    {/* Status + Arrow */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: t.is_active ? '#22c55e' : '#dc2626' }} />
                        <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: t.is_active ? '#16a34a' : '#dc2626' }}>
                          {t.is_active ? 'Active' : 'Suspended'}
                        </span>
                      </div>
                      <ArrowRight size={16} color="var(--text-muted)" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right — Create Form */}
        <div style={{ position: 'sticky', top: '1rem' }}>
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.5rem' }}>
              <Plus size={20} color="var(--brand-500)" /> Deploy New Tenant
            </h2>

            {created && (
              <div style={{ marginBottom: '1.5rem', padding: '1rem', borderRadius: 12, background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                <p style={{ fontWeight: 700, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <CheckCircle size={16} /> Deployed!
                </p>
                <p style={{ fontSize: '0.8125rem', color: '#15803d' }}>{created.name} is now live at <strong>{created.subdomain}.lms.com</strong></p>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Organization Name *</label>
                <input name="name" value={form.name} onChange={handleChange} placeholder="Sunrise University" className="input-field" style={{ width: '100%' }} required />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  <Globe size={13} style={{ display: 'inline', marginRight: 4 }} />Subdomain *
                </label>
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
                      <label key={key} style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                        padding: '0.75rem 0.5rem', borderRadius: 10, cursor: 'pointer',
                        border: `2px solid ${form.plan === key ? meta.color : 'var(--glass-border)'}`,
                        background: form.plan === key ? meta.bg : 'transparent',
                        transition: 'all 0.15s',
                      }}>
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
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    <Palette size={13} style={{ display: 'inline', marginRight: 4 }} />Primary
                  </label>
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

              {/* Brand Preview */}
              <div style={{ padding: '1rem', borderRadius: 12, background: `${form.primary_color}0A`, border: `1px solid ${form.primary_color}30` }}>
                <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Preview</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${form.primary_color}, ${form.secondary_color})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '0.9375rem', boxShadow: `0 4px 12px ${form.primary_color}40` }}>
                    {form.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{form.name || 'Organization Name'}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{form.subdomain || 'subdomain'}.lms.com</p>
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
    </div>
  );
}
