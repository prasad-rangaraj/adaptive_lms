import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tenantsAPI } from '../../services/api.service';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { 
  Settings, Palette, Globe, Upload, Check, AlertCircle, Building2,
  Search, Plus, Webhook, Video, MessageSquare, CreditCard, Puzzle, Link2,
  Download, ExternalLink, Zap, CheckCircle2, FileText
} from 'lucide-react';
import Loader from '../../components/ui/Loader';

// ── General Profile / Branding ───────────────────────────────────────────────
function LivePreview({ name, primary, secondary }) {
  return (
    <div style={{ background: 'var(--surface-1)', borderRadius: 24, overflow: 'hidden', border: '1px solid var(--glass-border)', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
      <div style={{ display: 'flex', height: 260 }}>
        <div style={{ width: 72, background: `linear-gradient(180deg, ${primary} 0%, ${secondary} 100%)`, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.25rem 0', gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 900, color: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            {name?.[0]?.toUpperCase() || 'A'}
          </div>
          {[0.6, 0.5, 0.4].map((op, i) => <div key={i} style={{ width: 32, height: 6, borderRadius: 999, background: `rgba(255,255,255,${op})` }} />)}
        </div>
        <div style={{ flex: 1, padding: '1.5rem', background: 'var(--surface-1)' }}>
          <div style={{ width: '55%', height: 16, borderRadius: 6, background: primary, opacity: 0.15, marginBottom: 12 }} />
          <div style={{ width: '40%', height: 12, borderRadius: 4, background: 'var(--surface-2)', marginBottom: '1.5rem' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: '1.25rem' }}>
            {[primary, secondary].map((c, i) => (
              <div key={i} style={{ padding: '1rem', borderRadius: 12, background: `${c}10`, border: `1px solid ${c}25` }}>
                <div style={{ width: '50%', height: 10, borderRadius: 4, background: c, opacity: 0.6, marginBottom: 8 }} />
                <div style={{ width: '85%', height: 16, borderRadius: 6, background: c, opacity: 0.9 }} />
              </div>
            ))}
          </div>
          <div style={{ padding: '0.75rem 1.25rem', borderRadius: 10, background: `linear-gradient(135deg, ${primary}, ${secondary})`, display: 'flex', alignItems: 'center', gap: 8, width: 'fit-content', boxShadow: `0 4px 12px ${primary}40` }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.8)' }} />
            <div style={{ width: 56, height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.9)' }} />
          </div>
        </div>
      </div>
      <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--glass-border)', background: 'var(--surface-1)' }}>
        <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textAlign: 'center', letterSpacing: '0.04em' }}>Live Theme Preview — {name || 'Organization'}</p>
      </div>
    </div>
  );
}

function ColorRow({ label, value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '1rem', background: 'var(--surface-1)', borderRadius: 16, border: '1px solid var(--surface-3)' }}>
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <input type="color" value={value} onChange={e => onChange(e.target.value)} style={{ width: 48, height: 48, padding: 4, borderRadius: 12, border: '1px solid var(--glass-border)', cursor: 'pointer', background: 'var(--surface-1)' }} />
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)', marginBottom: 4 }}>{label}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input value={value} onChange={e => onChange(e.target.value)} style={{ width: 90, fontFamily: 'monospace', fontWeight: 800, fontSize: '0.875rem', textTransform: 'uppercase', background: 'transparent', border: 'none', color: 'var(--text-secondary)', outline: 'none' }} />
          <div style={{ flex: 1, height: 8, borderRadius: 999, background: `linear-gradient(90deg, ${value}20, ${value})` }} />
        </div>
      </div>
    </div>
  );
}

function GeneralTab({ tenantId }) {
  const qc = useQueryClient();
  const { data: tenant, isLoading } = useQuery({ queryKey: ['tenant', tenantId], queryFn: () => tenantsAPI.get(tenantId).then(r => r.data), enabled: !!tenantId });
  const [form, setForm] = useState({ name: '', subdomain: '', primary_color: '#0e7490', secondary_color: '#0891b2' });

  useEffect(() => {
    if (tenant) setForm({ name: tenant.name || '', subdomain: tenant.subdomain || '', primary_color: tenant.primary_color || '#0e7490', secondary_color: tenant.secondary_color || '#0891b2' });
  }, [tenant]);

  const mutation = useMutation({
    mutationFn: (data) => tenantsAPI.update(tenantId, data),
    onSuccess: (res) => {
      qc.invalidateQueries(['tenant', tenantId]);
      toast.success('Organization settings saved!');
      document.documentElement.style.setProperty('--brand-600', res.data.primary_color);
      document.documentElement.style.setProperty('--brand-500', res.data.secondary_color);
    },
    onError: (err) => toast.error(err.response?.data?.detail || 'Failed to save settings'),
  });

  if (isLoading) return <Loader text="Loading settings..." />;
  const set = (field) => (val) => setForm(f => ({ ...f, [field]: val }));

  return (
    <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'flex-start' }}>
      <div style={{ flex: 1, background: 'var(--surface-1)', borderRadius: 24, border: '1px solid var(--glass-border)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
        <div style={{ padding: '2rem 2.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Branding & Identity</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginTop: 4 }}>Configure your workspace identity and white-label branding.</p>
          </div>
          <button onClick={() => mutation.mutate(form)} disabled={mutation.isPending} className="btn btn-primary" style={{ height: 44, gap: 8, padding: '0 1.25rem', borderRadius: 12, background: form.primary_color, borderColor: form.primary_color, boxShadow: `0 4px 16px ${form.primary_color}50` }}>
            {mutation.isPending ? <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> : <><Check size={16} /> Save Changes</>}
          </button>
        </div>

        <div style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.5rem' }}>
              <Building2 size={20} color="var(--brand-600)" /> General Profile
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: 500 }}>
              <div>
                <label className="label" style={{ fontWeight: 700, marginBottom: 8 }}>Workspace Name</label>
                <input value={form.name} onChange={e => set(f => ({ ...f, name: e.target.value }))} className="input" placeholder="e.g. Sunrise University" style={{ fontSize: '0.9375rem', padding: '0.75rem 1rem' }} />
              </div>
              <div>
                <label className="label" style={{ fontWeight: 700, marginBottom: 8 }}>Subdomain</label>
                <div style={{ display: 'flex', background: 'var(--surface-1)', border: '1.5px solid var(--glass-border)', borderRadius: 12, overflow: 'hidden' }}>
                  <span style={{ padding: '0 1rem', display: 'flex', alignItems: 'center', background: 'var(--surface-1)', borderRight: '1.5px solid var(--glass-border)', color: 'var(--text-muted)', fontSize: '0.9375rem', fontWeight: 600 }}>https://</span>
                  <input value={form.subdomain} onChange={e => set('subdomain')(e.target.value)} style={{ flex: 1, border: 'none', outline: 'none', padding: '0.75rem', fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', background: 'transparent' }} placeholder="your-org" />
                  <span style={{ padding: '0 1rem', display: 'flex', alignItems: 'center', background: 'var(--surface-1)', borderLeft: '1.5px solid var(--glass-border)', color: 'var(--text-muted)', fontSize: '0.9375rem', fontWeight: 600 }}>.lumina.io</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ height: 1, background: 'var(--surface-2)' }} />

          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.5rem' }}>
              <Palette size={20} color="var(--brand-600)" /> Theming & Appearance
            </h2>
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 260 }}>
                <p style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)', marginBottom: 8 }}>Brand Logo</p>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: '2rem', borderRadius: 16, border: '2px dashed var(--surface-3)', background: 'var(--surface-1)', cursor: 'pointer' }}>
                  <div style={{ width: 64, height: 64, borderRadius: 16, background: `linear-gradient(135deg, ${form.primary_color}, ${form.secondary_color})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    {tenant?.logo_url ? <img src={tenant.logo_url} alt="logo" style={{ width: '100%', height: '100%', borderRadius: 16, objectFit: 'cover' }} /> : <span style={{ fontSize: '1.75rem', fontWeight: 900, color: 'white' }}>{form.name?.[0]?.toUpperCase() || 'A'}</span>}
                  </div>
                  <button className="btn btn-secondary btn-sm" style={{ gap: 6, borderRadius: 10, background: 'var(--surface-1)' }}><Upload size={14} /> Upload Image</button>
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 300, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>Color Palette</p>
                <ColorRow label="Primary Color" value={form.primary_color} onChange={set('primary_color')} />
                <ColorRow label="Accent Color" value={form.secondary_color} onChange={set('secondary_color')} />
              </div>
            </div>
          </div>

          <div style={{ height: 1, background: 'var(--surface-2)' }} />

          <div style={{ padding: '1.5rem 2rem', borderRadius: 16, border: '1px solid #fecdd3', background: '#fff1f2', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontWeight: 800, color: '#e11d48', fontSize: '1rem', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}><AlertCircle size={18} /> Danger Zone</h3>
              <p style={{ fontSize: '0.875rem', color: '#be123c' }}>Permanently suspend your organization or export all data.</p>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn" style={{ background: 'var(--surface-1)', border: '1px solid #fecdd3', color: '#e11d48', fontWeight: 700, borderRadius: 10 }}>Export Data</button>
              <button className="btn" style={{ background: '#e11d48', border: 'none', color: 'white', fontWeight: 700, borderRadius: 10 }}>Suspend Org</button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ width: 340, flexShrink: 0, position: 'sticky', top: '5.5rem' }}>
        <LivePreview name={form.name} primary={form.primary_color} secondary={form.secondary_color} />
      </div>
    </div>
  );
}

// ── Integrations Tab ──────────────────────────────────────────────────────────
const DUMMY_INTEGRATIONS = [
  { id: 1, name: 'Zoom Video Communications', category: 'Virtual Classroom', status: 'connected', icon: Video, color: '#2D8CFF' },
  { id: 2, name: 'Slack', category: 'Notifications', status: 'connected', icon: MessageSquare, color: '#E01E5A' },
  { id: 3, name: 'Stripe', category: 'Payments', status: 'disconnected', icon: CreditCard, color: '#635BFF' },
  { id: 4, name: 'Custom Webhook', category: 'Developer', status: 'connected', icon: Webhook, color: '#10B981' },
];

function IntegrationsTab() {
  const [search, setSearch] = useState('');
  return (
    <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'flex-start' }}>
      <div style={{ flex: 1, background: 'var(--surface-1)', borderRadius: 24, border: '1px solid var(--glass-border)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
        <div style={{ padding: '2rem 2.5rem 1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Integrations & Webhooks</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginTop: 4 }}>Connect your LMS to external tools and automate workflows.</p>
            </div>
            <button className="btn btn-primary" style={{ gap: 8, height: 44, padding: '0 1.25rem', borderRadius: 12 }}><Plus size={16} /> Add Integration</button>
          </div>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search integrations..." style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: 12, border: '1px solid var(--surface-3)', background: 'var(--surface-1)', fontSize: '0.9375rem', outline: 'none', color: 'var(--text-primary)' }} />
          </div>
        </div>

        <div style={{ padding: '2rem 2.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {DUMMY_INTEGRATIONS.map(int => (
            <div key={int.id} style={{ border: '1px solid var(--glass-border)', borderRadius: 20, padding: '1.5rem', background: 'var(--surface-0)', cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: `${int.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <int.icon size={24} color={int.color} />
                </div>
                <span style={{ padding: '4px 10px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 800, background: int.status === 'connected' ? '#ecfdf5' : '#f3f4f6', color: int.status === 'connected' ? '#10b981' : '#6b7280' }}>
                  {int.status.toUpperCase()}
                </span>
              </div>
              <p style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1.125rem', marginBottom: 4 }}>{int.name}</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{int.category}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ width: 340, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ background: 'var(--surface-1)', borderRadius: 24, padding: '2rem', border: '1px solid var(--glass-border)' }}>
          <h3 style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.5rem' }}>
            <Puzzle size={14} color="#8b5cf6" /> Developer API
          </h3>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.5rem' }}>Build custom apps or sync data directly with our GraphQL API.</p>
          <button className="btn btn-secondary" style={{ width: '100%', gap: 8 }}><Link2 size={16} /> View Documentation</button>
        </div>
      </div>
    </div>
  );
}

// ── Billing Tab ─────────────────────────────────────────────────────────────
function BillingTab() {
  return (
    <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'flex-start' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ background: 'var(--surface-1)', borderRadius: 24, border: '1px solid var(--glass-border)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', padding: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Current Plan</p>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 12 }}>
              Enterprise Tier
              <span style={{ padding: '4px 10px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 800, background: '#ecfdf5', color: '#10b981', border: '1px solid #bbf7d0', letterSpacing: '0.04em' }}>ACTIVE</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginTop: 8 }}>Next billing date: <strong>October 1, 2026</strong></p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-secondary" style={{ gap: 8, height: 44, borderRadius: 12 }}><ExternalLink size={16} /> Manage in Stripe</button>
            <button className="btn btn-primary" style={{ gap: 8, height: 44, borderRadius: 12 }}><Zap size={16} /> Upgrade Plan</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {[{ label: 'Active Members', used: 1250, total: 5000, color: 'var(--brand-500)' }, { label: 'AI Compute Credits', used: 8500, total: 10000, color: '#8b5cf6' }].map((q, i) => {
            const pct = (q.used / q.total) * 100;
            return (
              <div key={i} style={{ background: 'var(--surface-1)', borderRadius: 20, border: '1px solid var(--glass-border)', padding: '2rem' }}>
                <p style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1rem', marginBottom: '1.5rem' }}>{q.label}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{q.used.toLocaleString()} used</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>{q.total.toLocaleString()} limit</span>
                </div>
                <div style={{ height: 8, borderRadius: 999, background: 'var(--surface-2)', overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: q.color, borderRadius: 999 }} />
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ background: 'var(--surface-1)', borderRadius: 24, border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
          <div style={{ padding: '2rem 2.5rem', borderBottom: '1px solid var(--glass-border)' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)' }}>Billing History</h3>
          </div>
          <div>
            {[
              { date: 'Sep 1, 2026', amount: '$499.00', status: 'Paid', invoice: 'INV-2026-09' },
              { date: 'Aug 1, 2026', amount: '$499.00', status: 'Paid', invoice: 'INV-2026-08' },
            ].map((inv, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2.5rem', borderBottom: i < 1 ? '1px solid var(--surface-2)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FileText size={16} color="var(--text-muted)" /></div>
                  <div>
                    <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>{inv.date}</p>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 2 }}>{inv.invoice}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                  <p style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{inv.amount}</p>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#10b981', fontSize: '0.8125rem', fontWeight: 700 }}><CheckCircle2 size={14} /> {inv.status}</span>
                  <button className="btn btn-ghost btn-icon"><Download size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ width: 340, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ background: 'var(--surface-1)', borderRadius: 24, padding: '2rem', border: '1px solid var(--glass-border)' }}>
          <h3 style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.5rem' }}>
            <CreditCard size={14} color="var(--brand-500)" /> Payment Method
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '1rem', border: '1px solid var(--surface-3)', borderRadius: 12, marginBottom: '1.5rem' }}>
            <div style={{ width: 40, height: 26, background: '#1a1f36', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.6rem', fontWeight: 900, fontStyle: 'italic' }}>VISA</div>
            <div>
              <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>•••• •••• •••• 4242</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Expires 12/28</p>
            </div>
          </div>
          <button className="btn btn-secondary" style={{ width: '100%', gap: 8 }}>Update Payment Method</button>
        </div>
      </div>
    </div>
  );
}

// ── Main Settings Hub ─────────────────────────────────────────────────────────
export default function OrgSettingsHub() {
  const { user } = useAuthStore();
  const tenantId = user?.tenant_id;
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'integrations' | 'billing'

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'integrations', label: 'Integrations', icon: Puzzle },
    { id: 'billing', label: 'Billing', icon: CreditCard },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header with Horizontal Tabs */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1.5rem' }}>
        <div style={{ display: 'flex', background: 'var(--surface-1)', padding: 6, borderRadius: 16, border: '1px solid var(--glass-border)', gap: 4 }}>
          {tabs.map(t => (
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

      {activeTab === 'general' && <GeneralTab tenantId={tenantId} />}
      {activeTab === 'integrations' && <IntegrationsTab />}
      {activeTab === 'billing' && <BillingTab />}
    </div>
  );
}
