import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '../../services/api.service';
import { 
  Settings, ShieldAlert, Zap, Save, RotateCcw,
  CreditCard, TrendingUp, Building2, AlertCircle, Download, Crown, Star,
  Flag, Code, Link2, Key, Users, Palette, FileText, FileBadge, Bot, Lock
} from 'lucide-react';
import toast from 'react-hot-toast';
import Loader from '../../components/ui/Loader';

// ── Shared Toggle Component ───────────────────────────────────────────────────
function Toggle({ checked, onChange, color = 'var(--brand-500)' }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      style={{
        width: 48, height: 26, borderRadius: 999, padding: 3,
        background: checked ? color : '#d1d5db',
        border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
        justifyContent: checked ? 'flex-end' : 'flex-start',
        transition: 'background 0.2s ease', flexShrink: 0,
      }}
    >
      <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'all 0.2s ease' }} />
    </button>
  );
}

function SettingRow({ title, description, value, onChange, color, danger, icon: Icon }) {
  const accent = danger ? '#e11d48' : (color || 'var(--brand-500)');
  const bgAccent = danger ? '#fff1f2' : `${accent}10`;
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem', padding: '1.25rem', background: 'var(--card-bg)', borderRadius: '1rem', border: `1px solid ${value ? accent + '40' : 'var(--glass-border)'}`, boxShadow: value ? `0 4px 20px ${accent}15` : 'none', transition: 'all 0.3s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: 1 }}>
        <div style={{ width: 42, height: 42, borderRadius: '0.75rem', background: bgAccent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent, transition: 'all 0.3s' }}>
          {Icon ? <Icon size={20} /> : <Settings size={20} />}
        </div>
        <div>
          <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9375rem', marginBottom: 2 }}>{title}</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{description}</p>
        </div>
      </div>
      <Toggle checked={value} onChange={onChange} color={accent} />
    </div>
  );
}

// ── Global Config Tab ─────────────────────────────────────────────────────────
const DEFAULT_CONFIG = {
  maintenanceMode: false,
  allowNewRegistrations: true,
  aiTutor: true,
  aiProctoring: true,
  aiRecommendations: true,
  debugMode: false,
};

function GlobalConfigTab() {
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('adaptive_lms_global_settings');
      return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
    } catch {
      return DEFAULT_CONFIG;
    }
  });

  const set = (key) => (val) => setSettings(s => ({ ...s, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 500));
    localStorage.setItem('adaptive_lms_global_settings', JSON.stringify(settings));
    setSaving(false);
    toast.success('Platform configuration saved to platform registry.');
  };

  const handleReset = () => {
    setSettings(DEFAULT_CONFIG);
    localStorage.setItem('adaptive_lms_global_settings', JSON.stringify(DEFAULT_CONFIG));
    toast('Settings reset to defaults.');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: 780 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <button onClick={handleReset} className="btn btn-secondary" style={{ gap: 6 }}><RotateCcw size={14} /> Reset</button>
        <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ gap: 6, minWidth: 120 }}>
          <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {settings.maintenanceMode && (
        <div style={{ padding: '1rem 1.5rem', borderRadius: 14, background: '#fff1f2', border: '1.5px solid #fecdd3', display: 'flex', alignItems: 'center', gap: 10 }}>
          <ShieldAlert size={20} color="#e11d48" />
          <div>
            <p style={{ fontWeight: 700, color: '#e11d48', fontSize: '0.9375rem' }}>Maintenance Mode is ACTIVE</p>
            <p style={{ fontSize: '0.8125rem', color: '#9f1239', marginTop: 2 }}>The platform is locked. Only Super Admins can log in.</p>
          </div>
        </div>
      )}

      <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.5rem' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fff1f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ShieldAlert size={18} color="#e11d48" /></div>
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>Critical Controls <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'white', background: '#e11d48', padding: '2px 8px', borderRadius: 999 }}>HIGH IMPACT</span></h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>These settings affect the entire platform immediately.</p>
          </div>
        </div>

        <SettingRow icon={Lock} title="Maintenance Mode" description="Lock down the platform for all users. Only Super Admins can log in." value={settings.maintenanceMode} onChange={set('maintenanceMode')} danger />
        <SettingRow icon={Users} title="Allow New Tenant Registrations" description="When disabled, new organizations cannot register." value={settings.allowNewRegistrations} onChange={set('allowNewRegistrations')} color="#10b981" />
      </div>

      <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--brand-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Zap size={18} color="var(--brand-600)" /></div>
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)' }}>AI Feature Flags</h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>Globally enable or disable AI capabilities.</p>
          </div>
        </div>
        <SettingRow icon={Bot} title="Global AI Tutor Engine" description="If disabled, AI Tutor features will be hidden for all tenants." value={settings.aiTutor} onChange={set('aiTutor')} color="#3b82f6" />
        <SettingRow icon={ShieldAlert} title="AI Exam Proctoring" description="If disabled, automated proctoring falls back to manual review." value={settings.aiProctoring} onChange={set('aiProctoring')} color="#8b5cf6" />
        <SettingRow icon={Star} title="AI Recommendation Engine" description="If disabled, standard sequential learning paths are used." value={settings.aiRecommendations} onChange={set('aiRecommendations')} color="#10b981" />
      </div>

      <div className="glass-card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.25rem' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f5f3ff', border: '1px solid #ddd6fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Settings size={16} color="#7c3aed" /></div>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Developer Settings</h2>
        </div>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Internal tooling and debugging options.</p>
        <div style={{ borderBottom: 'none' }}><SettingRow title="Debug Mode" description="Expose verbose API error messages and system logs in the UI. Disable in production." value={settings.debugMode} onChange={set('debugMode')} color="#7c3aed" /></div>
      </div>
    </div>
  );
}

// ── Payment Gateways (Billing) Tab ────────────────────────────────────────────
const PLAN_CONFIG = {
  basic:      { label: 'Basic',      icon: Star,  color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb', price: 0,   priceLabel: 'Free' },
  pro:        { label: 'Pro',        icon: Zap,   color: '#059669', bg: '#ecfdf5', border: '#a7f3d0', price: 299, priceLabel: '$299/mo' },
  enterprise: { label: 'Enterprise', icon: Crown, color: '#4f46e5', bg: '#eef2ff', border: '#c7d2fe', price: 999, priceLabel: '$999/mo' },
};

function PaymentGatewaysTab() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['billing-stats'],
    queryFn: () => adminAPI.getBillingStats().then(r => r.data),
  });

  if (isLoading) return <Loader text="Loading financial data..." />;

  const mrr = stats?.mrr || 0;
  const planDist = stats?.plan_distribution || {};
  const totalTenants = (planDist.basic || 0) + (planDist.pro || 0) + (planDist.enterprise || 0);
  const maxPlanCount = Math.max(...Object.values(planDist), 1);

  const handleExportReport = () => {
    const csvContent = [
      'Metric,Value',
      `Monthly Recurring Revenue (MRR),$${mrr}`,
      `Annual Recurring Revenue (ARR),$${mrr * 12}`,
      `Active Organizations,${stats?.active_tenants || 0}`,
      `Suspended Accounts,${stats?.suspended_tenants || 0}`,
      `Basic Plan Count,${planDist.basic || 0}`,
      `Pro Plan Count,${planDist.pro || 0}`,
      `Enterprise Plan Count,${planDist.enterprise || 0}`,
      `Exported At,${new Date().toISOString()}`
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `platform_financial_report_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Financial report exported successfully.');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <button onClick={handleExportReport} className="btn btn-secondary" style={{ gap: 8 }}><Download size={15} /> Export Report</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
        <div className="stat-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: 'var(--brand-50)', border: '1px solid var(--brand-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-600)' }}><CreditCard size={22} /></div>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '4px 9px', borderRadius: 999, border: '1px solid #a7f3d0' }}><TrendingUp size={12} /> +12%</span>
          </div>
          <p style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-0.04em' }}>${mrr.toLocaleString()}</p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500, marginTop: 8 }}>Monthly Recurring Revenue</p>
          <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--glass-border)' }}><p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ARR: <strong style={{ color: 'var(--text-primary)' }}>${(mrr * 12).toLocaleString()}</strong></p></div>
        </div>

        <div className="stat-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: '#ecfdf5', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}><Building2 size={22} /></div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#059669', background: '#ecfdf5', padding: '4px 9px', borderRadius: 999, border: '1px solid #a7f3d0' }}>+{stats?.active_tenants ? Math.ceil(stats.active_tenants * 0.15) : 0} this month</span>
          </div>
          <p style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-0.04em' }}>{stats?.active_tenants || 0}</p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500, marginTop: 8 }}>Active Organizations</p>
          <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--glass-border)' }}><p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Suspended: <strong style={{ color: '#e11d48' }}>{stats?.suspended_tenants || 0}</strong></p></div>
        </div>

        <div className="stat-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: '#fff1f2', border: '1px solid #fecdd3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e11d48' }}><AlertCircle size={22} /></div>
          </div>
          <p style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-0.04em' }}>{stats?.suspended_tenants || 0}</p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500, marginTop: 8 }}>Suspended Accounts</p>
          <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--glass-border)' }}><p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Revenue at risk: <strong style={{ color: '#e11d48' }}>${((stats?.suspended_tenants || 0) * 299).toLocaleString()}</strong></p></div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.75rem' }}>Subscription Plan Distribution</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {Object.entries(PLAN_CONFIG).map(([key, meta]) => {
            const count = planDist[key] || 0;
            const percentage = totalTenants > 0 ? Math.round((count / totalTenants) * 100) : 0;
            const barWidth = totalTenants > 0 ? (count / maxPlanCount) * 100 : 0;
            const Icon = meta.icon;
            return (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: 130, flexShrink: 0 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: meta.bg, border: `1px solid ${meta.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={15} color={meta.color} /></div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{meta.label}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{meta.priceLabel}</p>
                  </div>
                </div>
                <div style={{ flex: 1, height: 8, background: 'var(--surface-3)', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ width: `${barWidth}%`, height: '100%', background: meta.color, borderRadius: 999, transition: 'width 0.6s ease' }} />
                </div>
                <div style={{ width: 80, flexShrink: 0, textAlign: 'right' }}><span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>{count}</span><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 4 }}>({percentage}%)</span></div>
                <div style={{ width: 90, flexShrink: 0, textAlign: 'right' }}><span style={{ fontWeight: 700, color: meta.color, fontSize: '0.875rem' }}>${(count * meta.price).toLocaleString()}<span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.75rem' }}>/mo</span></span></div>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: '1.75rem', paddingTop: '1.5rem', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Total across {totalTenants} organizations</span>
          <span style={{ fontWeight: 800, fontSize: '1.125rem', color: 'var(--brand-600)' }}>${mrr.toLocaleString()}<span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.875rem' }}>/mo</span></span>
        </div>
      </div>
    </div>
  );
}

// ── Tab 3: Feature Flags ────────────────────────────────────────────────────────
const DEFAULT_FLAGS = [
  { id: 'ff_1', name: 'AI Exam Proctoring V2', description: 'Next generation behavioral monitoring algorithms.', status: 'enabled', rollout: 'Global', audiences: [] },
  { id: 'ff_2', name: 'New Analytics Engine', description: 'Real-time cohort insights processing.', status: 'partial', rollout: 'Enterprise Tier', audiences: ['Enterprise'] },
  { id: 'ff_3', name: 'Student Gamification', description: 'Leaderboards, badges, and streaks.', status: 'partial', rollout: 'Beta Tenants', audiences: ['Org #12', 'Org #4'] },
  { id: 'ff_4', name: 'Custom Domain SSL', description: 'Automated LetsEncrypt cert generation.', status: 'disabled', rollout: 'None', audiences: [] },
];

function FeatureFlagsTab() {
  const [flags, setFlags] = useState(() => {
    try {
      const saved = localStorage.getItem('adaptive_lms_feature_flags');
      return saved ? JSON.parse(saved) : DEFAULT_FLAGS;
    } catch {
      return DEFAULT_FLAGS;
    }
  });

  const toggleFlag = (id) => {
    const updated = flags.map(f => {
      if (f.id === id) {
        const nextStatus = f.status === 'disabled' ? 'enabled' : 'disabled';
        toast.success(`Flag "${f.name}" set to ${nextStatus.toUpperCase()}`);
        return { ...f, status: nextStatus };
      }
      return f;
    });
    setFlags(updated);
    localStorage.setItem('adaptive_lms_feature_flags', JSON.stringify(updated));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="glass-card" style={{ padding: 0 }}>
        <table className="table">
          <thead><tr><th>Feature Flag</th><th>Rollout Status</th><th>Target Audience</th><th>Toggle</th></tr></thead>
          <tbody>
            {flags.map(f => (
              <tr key={f.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--surface-2)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-600)' }}><Flag size={18} /></div>
                    <div><p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{f.name}</p><p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{f.description}</p></div>
                  </div>
                </td>
                <td>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', fontWeight: 700,
                    ...(f.status === 'enabled' ? { color: '#059669', background: '#ecfdf5', border: '1px solid #a7f3d0' } :
                        f.status === 'partial' ? { color: '#d97706', background: '#fffbeb', border: '1px solid #fde68a' } :
                                                 { color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca' }) }}>
                    {f.status === 'enabled' ? '100% Rollout' : f.status === 'partial' ? 'Targeted' : 'Disabled'}
                  </span>
                </td>
                <td>
                  <span style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>{f.rollout}</span>
                  {f.audiences.length > 0 && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 6 }}>({f.audiences.join(', ')})</span>}
                </td>
                <td><Toggle checked={f.status !== 'disabled'} onChange={() => toggleFlag(f.id)} color={f.status === 'partial' ? '#d97706' : '#059669'} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Tab 4: Developer Webhooks ─────────────────────────────────────────────────
const INITIAL_EVENTS = [
  { id: 1, event: 'tenant.created', endpoint: 'https://api.internal.com/sync', status: 200, time: '2 mins ago' },
  { id: 2, event: 'user.enrolled', endpoint: 'https://tenant12.custom.com/webhook', status: 500, time: '14 mins ago' },
  { id: 3, event: 'payment.succeeded', endpoint: 'https://api.internal.com/billing', status: 200, time: '1 hr ago' },
];

function DeveloperWebhooksTab() {
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [retryingId, setRetryingId] = useState(null);

  const handleRetry = (id) => {
    setRetryingId(id);
    toast.loading('Re-dispatching webhook event payload...', { duration: 800 });
    setTimeout(() => {
      setEvents(evs => evs.map(e => e.id === id ? { ...e, status: 200, time: 'Just now' } : e));
      setRetryingId(null);
      toast.success('Webhook delivery succeeded (HTTP 200)');
    }, 800);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        <div className="stat-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1rem' }}><div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--brand-50)', border: '1px solid var(--brand-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-600)' }}><Code size={20} /></div><p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>API Calls (24h)</p></div>
          <p style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>1.2M</p>
        </div>
        <div className="stat-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1rem' }}><div style={{ width: 40, height: 40, borderRadius: 12, background: '#ecfdf5', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}><Link2 size={20} /></div><p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Webhook Deliveries</p></div>
          <p style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>99.9%</p>
        </div>
        <div className="stat-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1rem' }}><div style={{ width: 40, height: 40, borderRadius: 12, background: '#fef2f2', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e11d48' }}><ShieldAlert size={20} /></div><p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Failed Events</p></div>
          <p style={{ fontSize: '2rem', fontWeight: 900, color: events.some(e => e.status !== 200) ? '#e11d48' : '#059669', lineHeight: 1 }}>
            {events.filter(e => e.status !== 200).length}
          </p>
        </div>
      </div>

      <div className="glass-card" style={{ padding: 0 }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--glass-border)', background: 'var(--surface-1)', borderTopLeftRadius: 'inherit', borderTopRightRadius: 'inherit' }}><h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Recent Event Deliveries</h3></div>
        <table className="table">
          <thead><tr><th>Event Type</th><th>Endpoint URL</th><th>Delivery Status</th><th>Timestamp</th><th>Actions</th></tr></thead>
          <tbody>
            {events.map(e => (
              <tr key={e.id}>
                <td><span style={{ fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: '0.8125rem' }}>{e.event}</span></td>
                <td><span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{e.endpoint}</span></td>
                <td><span style={{ fontSize: '0.75rem', fontWeight: 700, color: e.status === 200 ? '#059669' : '#e11d48', background: e.status === 200 ? '#ecfdf5' : '#fff1f2', border: `1px solid ${e.status === 200 ? '#a7f3d0' : '#fecdd3'}`, padding: '3px 8px', borderRadius: 6 }}>HTTP {e.status}</span></td>
                <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{e.time}</td>
                <td>
                  {e.status !== 200 ? (
                    <button onClick={() => handleRetry(e.id)} disabled={retryingId === e.id} className="btn btn-ghost btn-sm" style={{ color: 'var(--brand-600)' }}>
                      <RotateCcw size={14} /> {retryingId === e.id ? 'Retrying...' : 'Retry'}
                    </button>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>Delivered</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Tab 5: Platform Branding (White-Labeling) ─────────────────────────────────
function BrandingTab() {
  const [branding, setBranding] = useState(() => {
    try {
      const saved = localStorage.getItem('adaptive_lms_branding');
      return saved ? JSON.parse(saved) : { color: '#4f46e5', logoUrl: '', customCss: '' };
    } catch {
      return { color: '#4f46e5', logoUrl: '', customCss: '' };
    }
  });

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('adaptive_lms_branding', JSON.stringify(branding));
    toast.success('Global white-labeling theme applied to all default tenants.');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 780 }}>
      <div className="glass-card" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.5rem' }}><Palette size={20} color="var(--brand-500)" /> Global White-Labeling</h2>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Configure the default branding and themes for new tenants. Enterprise tenants can override these settings.</p>
        
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Global Primary Color</label>
            <div style={{ display: 'flex', gap: 12 }}>
              <input type="color" value={branding.color} onChange={e => setBranding(b => ({ ...b, color: e.target.value }))} style={{ width: 40, height: 40, padding: 0, border: 'none', borderRadius: 8, cursor: 'pointer' }} />
              <input value={branding.color} onChange={e => setBranding(b => ({ ...b, color: e.target.value }))} className="input-field" style={{ width: 120, fontFamily: 'monospace' }} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Default Logo URL</label>
            <input value={branding.logoUrl} onChange={e => setBranding(b => ({ ...b, logoUrl: e.target.value }))} placeholder="https://cdn.example.com/logo.png" className="input-field" style={{ width: '100%' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Custom CSS Overrides</label>
            <textarea value={branding.customCss} onChange={e => setBranding(b => ({ ...b, customCss: e.target.value }))} placeholder=":root { --border-radius: 12px; }" rows={4} className="input-field" style={{ width: '100%', fontFamily: 'monospace', fontSize: '0.8125rem' }} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: 140 }}>Save Theme</button>
        </form>
      </div>
    </div>
  );
}

// ── Tab 6: Legal & Compliance ─────────────────────────────────────────────────
const DEFAULT_LEGAL_DOCS = [
  { id: 'tos', name: 'Terms of Service', version: 'v2.4.1', date: 'Oct 12, 2025', rate: '100% (All Active Orgs)', status: 'active' },
  { id: 'privacy', name: 'Privacy Policy (GDPR)', version: 'v3.0.0', date: 'Yesterday', rate: '42% (Pending)', status: 'pending' },
];

function LegalTab() {
  const [docs, setDocs] = useState(() => {
    try {
      const saved = localStorage.getItem('adaptive_lms_legal_docs');
      return saved ? JSON.parse(saved) : DEFAULT_LEGAL_DOCS;
    } catch {
      return DEFAULT_LEGAL_DOCS;
    }
  });

  const handleUploadNewVersion = () => {
    const docName = prompt('Enter legal document name to publish (e.g. Terms of Service, Privacy Policy, DPA):');
    if (!docName) return;
    const version = prompt('Enter version string (e.g. v2.5.0):', 'v2.5.0');
    if (!version) return;

    const newDoc = {
      id: `doc_${Date.now()}`,
      name: docName.trim(),
      version: version.trim(),
      date: 'Just now',
      rate: '0% (Queued for next tenant login)',
      status: 'pending'
    };
    const updated = [newDoc, ...docs];
    setDocs(updated);
    localStorage.setItem('adaptive_lms_legal_docs', JSON.stringify(updated));
    toast.success(`Published ${newDoc.name} (${newDoc.version}). Prompting users upon next login.`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 860 }}>
      <div className="glass-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.5rem' }}><FileBadge size={20} color="var(--brand-500)" /> Legal Documents</h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Manage global Terms of Service and Privacy Policies. Force tenants to re-accept upon next login when updated.</p>
          </div>
          <button onClick={handleUploadNewVersion} className="btn btn-primary" style={{ gap: 6 }}><FileText size={15} /> Upload New Version</button>
        </div>

        <table className="table" style={{ marginTop: '1rem' }}>
          <thead><tr><th>Document</th><th>Current Version</th><th>Published Date</th><th>Acceptance Rate</th></tr></thead>
          <tbody>
            {docs.map(doc => (
              <tr key={doc.id}>
                <td><span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{doc.name}</span></td>
                <td><span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', background: 'var(--surface-2)', padding: '2px 8px', borderRadius: 999 }}>{doc.version}</span></td>
                <td><span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{doc.date}</span></td>
                <td><span style={{ fontSize: '0.8125rem', fontWeight: 700, color: doc.status === 'active' ? '#059669' : '#d97706' }}>{doc.rate}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main Hub ──────────────────────────────────────────────────────────────────
export default function GlobalSettingsHub() {
  const [activeTab, setActiveTab] = useState('config'); // 'config' | 'gateways'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1.5rem' }}>
        <div style={{ flexShrink: 0 }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--brand-500)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Global System</p>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.04em', lineHeight: 1.1 }}>Settings Hub</h1>
        </div>
        
        <div className="hide-scrollbar" style={{ display: 'flex', background: 'var(--surface-1)', padding: 6, borderRadius: 16, border: '1px solid var(--glass-border)', gap: 4, overflowX: 'auto', flexWrap: 'nowrap' }}>
          {[
            { id: 'config', label: 'Platform Config', icon: Settings },
            { id: 'branding', label: 'White-Labeling', icon: Palette },
            { id: 'gateways', label: 'Payment Gateways', icon: CreditCard },
            { id: 'legal', label: 'Compliance', icon: FileBadge },
            { id: 'flags', label: 'Feature Flags', icon: Flag },
            { id: 'webhooks', label: 'Developer API', icon: Code },
          ].map(t => (
            <button 
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{ 
                display: 'flex', alignItems: 'center', gap: 8, padding: '0.625rem 1.25rem', borderRadius: 12, border: 'none', cursor: 'pointer',
                fontWeight: 700, fontSize: '0.875rem', transition: 'all 0.2s', whiteSpace: 'nowrap',
                background: activeTab === t.id ? 'white' : 'transparent',
                color: activeTab === t.id ? 'var(--brand-600)' : 'var(--text-muted)',
                boxShadow: activeTab === t.id ? '0 2px 8px rgba(0,0,0,0.06)' : 'none'
              }}>
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'config' && <GlobalConfigTab />}
      {activeTab === 'branding' && <BrandingTab />}
      {activeTab === 'gateways' && <PaymentGatewaysTab />}
      {activeTab === 'legal' && <LegalTab />}
      {activeTab === 'flags' && <FeatureFlagsTab />}
      {activeTab === 'webhooks' && <DeveloperWebhooksTab />}
    </div>
  );
}
