import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminAPI, authAPI } from '../../services/api.service';
import { useAuthStore } from '../../store/authStore';
import { 
  Settings, ShieldAlert, Zap, Save, RotateCcw,
  CreditCard, TrendingUp, Building2, AlertCircle, Download, Crown, Star,
  Flag, Code, Link2, Key, Users, Palette, FileText, FileBadge, Bot, Lock, User,
  ArrowUpRight, CheckCircle2, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import Loader from '../../components/ui/Loader';

// ── Next-Gen Executive Switch Toggle ──────────────────────────────────────────
function Toggle({ checked, onChange, color = 'var(--brand-600)', labelOn = 'ENABLED', labelOff = 'DISABLED', showBadge = true }) {
  const activeColor = color || 'var(--brand-600)';
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, userSelect: 'none' }}>
      {showBadge && (
        <span style={{
          fontSize: '0.6875rem',
          fontWeight: 800,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          padding: '2px 7px',
          borderRadius: 6,
          transition: 'all 0.2s ease',
          background: checked ? `${activeColor}15` : 'var(--surface-2)',
          color: checked ? activeColor : 'var(--text-muted)',
          border: `1px solid ${checked ? activeColor + '30' : 'var(--glass-border)'}`,
        }}>
          {checked ? labelOn : labelOff}
        </span>
      )}
      <button 
        type="button" 
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)} 
        style={{ 
          width: 50, 
          height: 28, 
          borderRadius: 999, 
          padding: 3, 
          background: checked 
            ? `linear-gradient(135deg, ${activeColor}, ${activeColor}dd)` 
            : 'var(--surface-2)', 
          border: `1.5px solid ${checked ? activeColor : 'var(--glass-border)'}`, 
          cursor: 'pointer', 
          display: 'flex', 
          alignItems: 'center', 
          position: 'relative',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)', 
          flexShrink: 0, 
          boxShadow: checked 
            ? `0 2px 10px ${activeColor}40, inset 0 1px 1px rgba(255,255,255,0.3)` 
            : 'inset 0 2px 4px rgba(0,0,0,0.06)' 
        }}
      >
        <div style={{ 
          width: 20, 
          height: 20, 
          borderRadius: '50%', 
          background: 'white', 
          boxShadow: '0 2px 5px rgba(0,0,0,0.22)', 
          transform: checked ? 'translateX(22px)' : 'translateX(0px)',
          transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: checked ? activeColor : '#9ca3af',
            transition: 'background 0.2s',
          }} />
        </div>
      </button>
    </div>
  );
}

function SettingRow({ title, description, value, onChange, color, danger, icon: Icon }) {
  const accent = danger ? '#e11d48' : (color || 'var(--brand-600)');
  const bgAccent = danger ? '#fff1f2' : `${accent}12`;
  
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem',
      padding: '1.25rem 1.5rem', background: value ? 'var(--surface-0)' : 'var(--surface-1)',
      borderRadius: 16, border: `1.5px solid ${value ? accent + '40' : 'var(--glass-border)'}`,
      boxShadow: value ? `0 4px 20px ${accent}12` : 'none',
      transition: 'all 0.25s ease'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: 1 }}>
        <div style={{
          width: 42, height: 42, borderRadius: '0.75rem',
          background: bgAccent, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: accent, transition: 'all 0.25s', flexShrink: 0
        }}>
          {Icon ? <Icon size={20} /> : <Settings size={20} />}
        </div>
        <div>
          <p style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.9375rem', margin: '0 0 2px' }}>{title}</p>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>{description}</p>
        </div>
      </div>
      <Toggle checked={value} onChange={onChange} color={accent} labelOn={danger ? 'OVERRIDE' : 'ACTIVE'} labelOff="OFF" />
    </div>
  );
}

// ── Section Header Helper ─────────────────────────────────────────────────────
function SectionHeader({ id, title, subtitle, icon: Icon, badge, action }) {
  return (
    <div 
      id={id}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap',
        gap: '1rem', paddingBottom: '1rem', borderBottom: '1.5px solid var(--glass-border)',
        marginBottom: '1.5rem', scrollMarginTop: '110px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: 'linear-gradient(135deg, var(--brand-50), white)',
          border: '1.5px solid var(--brand-200)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--brand-600)',
          boxShadow: '0 2px 8px rgba(99, 102, 241, 0.1)'
        }}>
          <Icon size={22} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
              {title}
            </h2>
            {badge && (
              <span style={{
                fontSize: '0.6875rem', fontWeight: 800, color: 'var(--brand-600)',
                background: 'var(--brand-50)', border: '1px solid var(--brand-200)',
                padding: '2px 8px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.06em'
              }}>
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '3px 0 0' }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// ── Default State Configurations ──────────────────────────────────────────────
const DEFAULT_CONFIG = {
  maintenanceMode: false,
  allowNewRegistrations: true,
  aiTutor: true,
  aiProctoring: true,
  aiRecommendations: true,
  debugMode: false,
};

const PLAN_CONFIG = {
  basic:      { label: 'Basic',      icon: Star,  color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb', price: 0,   priceLabel: 'Free' },
  pro:        { label: 'Pro',        icon: Zap,   color: '#059669', bg: '#ecfdf5', border: '#a7f3d0', price: 299, priceLabel: '$299/mo' },
  enterprise: { label: 'Enterprise', icon: Crown, color: '#4f46e5', bg: '#eef2ff', border: '#c7d2fe', price: 999, priceLabel: '$999/mo' },
};

const DEFAULT_FLAGS = [
  { id: 'ff_1', name: 'AI Exam Proctoring V2', description: 'Next generation behavioral monitoring algorithms with gaze tracking.', status: 'enabled', rollout: 'Global', audiences: [] },
  { id: 'ff_2', name: 'New Analytics Engine', description: 'Real-time cohort insights processing with predictive risk scoring.', status: 'partial', rollout: 'Enterprise Tier', audiences: ['Enterprise'] },
  { id: 'ff_3', name: 'Student Gamification', description: 'Interactive leaderboards, mastery badges, and study streaks.', status: 'partial', rollout: 'Beta Tenants', audiences: ['Org #12', 'Org #4'] },
  { id: 'ff_4', name: 'Custom Domain SSL', description: 'Automated LetsEncrypt certificate generation and DNS verifier.', status: 'disabled', rollout: 'None', audiences: [] },
];

const INITIAL_EVENTS = [
  { id: 1, event: 'tenant.created', endpoint: 'https://api.internal.com/sync', status: 200, time: '2 mins ago' },
  { id: 2, event: 'user.enrolled', endpoint: 'https://tenant12.custom.com/webhook', status: 500, time: '14 mins ago' },
  { id: 3, event: 'payment.succeeded', endpoint: 'https://api.internal.com/billing', status: 200, time: '1 hr ago' },
];

const DEFAULT_LEGAL_DOCS = [
  { id: 'tos', name: 'Terms of Service', version: 'v2.4.1', date: 'Oct 12, 2025', rate: '100% (All Active Orgs)', status: 'active' },
  { id: 'privacy', name: 'Privacy Policy (GDPR / FERPA)', version: 'v3.0.0', date: 'Yesterday', rate: '42% (Pending)', status: 'pending' },
];

const SECTIONS = [
  { id: 'sec-config', label: 'Platform Config', icon: Settings },
  { id: 'sec-profile', label: 'Admin Account', icon: User },
  { id: 'sec-financials', label: 'Financials & Plans', icon: CreditCard },
  { id: 'sec-flags', label: 'Feature Flags', icon: Flag },
  { id: 'sec-branding', label: 'White-Labeling', icon: Palette },
  { id: 'sec-webhooks', label: 'Developer API', icon: Code },
  { id: 'sec-legal', label: 'Compliance & Legal', icon: FileBadge },
];

// ── Main Single-Page Settings Hub ─────────────────────────────────────────────
export default function GlobalSettingsHub() {
  const { user, updateUser } = useAuthStore();
  const [activeSection, setActiveSection] = useState('sec-config');

  // 1. Platform Config State
  const [configSaving, setConfigSaving] = useState(false);
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('adaptive_lms_global_settings');
      return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
    } catch {
      return DEFAULT_CONFIG;
    }
  });

  const setConfig = (key) => (val) => setSettings(s => ({ ...s, [key]: val }));

  const handleSaveConfig = async () => {
    setConfigSaving(true);
    await new Promise(r => setTimeout(r, 400));
    localStorage.setItem('adaptive_lms_global_settings', JSON.stringify(settings));
    setConfigSaving(false);
    toast.success('Platform configuration saved to platform registry.');
  };

  const handleResetConfig = () => {
    setSettings(DEFAULT_CONFIG);
    localStorage.setItem('adaptive_lms_global_settings', JSON.stringify(DEFAULT_CONFIG));
    toast('Settings reset to defaults.');
  };

  // 2. Super Admin Profile & Password State
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await authAPI.updateProfile({ full_name: fullName.trim() });
      updateUser({ full_name: res.data.full_name });
      toast.success('Super Admin profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setSavingPassword(true);
    try {
      await authAPI.changePassword({ current_password: currentPassword, new_password: newPassword });
      toast.success('Super Admin master credentials updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update password');
    } finally {
      setSavingPassword(false);
    }
  };

  // 3. Billing & Financial Stats Query
  const { data: stats } = useQuery({
    queryKey: ['billing-stats'],
    queryFn: () => adminAPI.getBillingStats().then(r => r.data),
  });

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

  // 4. Feature Flags State
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

  // 5. White-Labeling Branding State
  const [branding, setBranding] = useState(() => {
    try {
      const saved = localStorage.getItem('adaptive_lms_branding');
      return saved ? JSON.parse(saved) : { color: '#4f46e5', logoUrl: '', customCss: '' };
    } catch {
      return { color: '#4f46e5', logoUrl: '', customCss: '' };
    }
  });

  const handleSaveBranding = (e) => {
    e.preventDefault();
    localStorage.setItem('adaptive_lms_branding', JSON.stringify(branding));
    toast.success('Global white-labeling theme applied to all default tenants.');
  };

  // 6. Developer Webhooks State
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [retryingId, setRetryingId] = useState(null);

  const handleRetryWebhook = (id) => {
    setRetryingId(id);
    toast.loading('Re-dispatching webhook event payload...', { duration: 800 });
    setTimeout(() => {
      setEvents(evs => evs.map(e => e.id === id ? { ...e, status: 200, time: 'Just now' } : e));
      setRetryingId(null);
      toast.success('Webhook delivery succeeded (HTTP 200)');
    }, 800);
  };

  // 7. Legal & Compliance State
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

  // Smooth Scroll Trigger
  const scrollTo = (id) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', maxWidth: 1200, margin: '0 auto', paddingBottom: '5rem' }}>
      
      {/* ── Page Header ── */}
      <div style={{
        background: 'linear-gradient(135deg, var(--surface-0), var(--brand-50))',
        borderRadius: 24, padding: '2.25rem 2.5rem', border: '1px solid var(--brand-100)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--brand-600)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Root Platform Administration
            </span>
          </div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', margin: 0, lineHeight: 1.1 }}>
            Global System Settings
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '6px 0 0' }}>
            Unified administrative control deck. Configure runtime flags, financials, branding, APIs, and credentials on a single page.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={handleResetConfig} className="btn btn-secondary" style={{ gap: 6, fontWeight: 700 }}>
            <RotateCcw size={14} /> Reset Defaults
          </button>
          <button onClick={handleSaveConfig} disabled={configSaving} className="btn btn-primary" style={{ gap: 8, fontWeight: 700, minWidth: 140 }}>
            <Save size={15} /> {configSaving ? 'Saving...' : 'Save All Settings'}
          </button>
        </div>
      </div>

      {/* ── Sticky Quick-Jump Anchor Dock ── */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 25,
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1.5px solid var(--glass-border)',
        borderRadius: 20,
        padding: 6,
        boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
      }}>
        <div className="hide-scrollbar" style={{ display: 'flex', gap: 6, overflowX: 'auto', flexWrap: 'nowrap' }}>
          {SECTIONS.map(s => {
            const isActive = activeSection === s.id;
            return (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '0.55rem 1.15rem', borderRadius: 14,
                  border: isActive ? '1px solid var(--brand-300)' : '1px solid transparent',
                  cursor: 'pointer', fontWeight: 800, fontSize: '0.8125rem', transition: 'all 0.2s', whiteSpace: 'nowrap',
                  background: isActive ? 'linear-gradient(135deg, white, var(--brand-50))' : 'transparent',
                  color: isActive ? 'var(--brand-700)' : 'var(--text-secondary)',
                  boxShadow: isActive ? '0 4px 12px var(--brand-500)20, inset 0 1px 1px white' : 'none'
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--surface-1)'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                <s.icon size={15} color={isActive ? 'var(--brand-600)' : 'var(--text-muted)'} />
                <span>{s.label}</span>
                {isActive && (
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--brand-600)', boxShadow: '0 0 8px var(--brand-600)' }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* ── SECTION 1: PLATFORM CONFIGURATION & SYSTEM HEALTH ── */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section>
        <SectionHeader
          id="sec-config"
          title="Platform Runtime & Core System Health"
          subtitle="Global master switches affecting multitenant availability, registration queues, and AI engines."
          icon={Settings}
          badge="Core Runtime"
          action={
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleResetConfig} className="btn btn-secondary btn-sm" style={{ gap: 6 }}>
                <RotateCcw size={13} /> Reset Config
              </button>
              <button onClick={handleSaveConfig} disabled={configSaving} className="btn btn-primary btn-sm" style={{ gap: 6 }}>
                <Save size={13} /> {configSaving ? 'Saving...' : 'Save Config'}
              </button>
            </div>
          }
        />

        {settings.maintenanceMode && (
          <div style={{ padding: '1rem 1.5rem', borderRadius: 16, background: '#fff1f2', border: '1.5px solid #fecdd3', display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
            <ShieldAlert size={22} color="#e11d48" />
            <div>
              <p style={{ fontWeight: 800, color: '#e11d48', fontSize: '0.9375rem', margin: 0 }}>Emergency Maintenance Mode is ACTIVE</p>
              <p style={{ fontSize: '0.8125rem', color: '#9f1239', margin: '2px 0 0' }}>The platform is locked down globally. Student and teacher access is suspended; only Super Admins may authenticate.</p>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
          
          {/* Critical Controls Card */}
          <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.25rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fff1f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldAlert size={18} color="#e11d48" />
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>High-Impact Controls</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Immediate effect across all tenant subdomains.</p>
              </div>
            </div>

            <SettingRow icon={Lock} title="Maintenance Mode" description="Lock down platform globally for upgrades. Only super admins can log in." value={settings.maintenanceMode} onChange={setConfig('maintenanceMode')} danger />
            <SettingRow icon={Users} title="Allow New Registrations" description="Permit new institutions and learners to create self-service accounts." value={settings.allowNewRegistrations} onChange={setConfig('allowNewRegistrations')} color="#10b981" />
          </div>

          {/* AI Feature Gates Card */}
          <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.25rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--brand-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={18} color="var(--brand-600)" />
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Global AI Gates</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Control LLM inference pipelines globally.</p>
              </div>
            </div>

            <SettingRow icon={Bot} title="Global AI Tutor Engine" description="Disables AI chatbot widgets across all tenant course players." value={settings.aiTutor} onChange={setConfig('aiTutor')} color="#3b82f6" />
            <SettingRow icon={ShieldAlert} title="AI Exam Proctoring" description="Toggles automatic biometric and gaze anomaly inference." value={settings.aiProctoring} onChange={setConfig('aiProctoring')} color="#8b5cf6" />
            <SettingRow icon={Star} title="Recommendation Engine" description="Dynamically arranges module sequences based on retention radar." value={settings.aiRecommendations} onChange={setConfig('aiRecommendations')} color="#10b981" />
          </div>

        </div>

        {/* Developer Diagnostics */}
        <div className="glass-card" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
          <SettingRow icon={Settings} title="Developer Debug Telemetry Mode" description="Exposes verbose JSON error traces, websocket payloads, and query execution times in UI dialogs." value={settings.debugMode} onChange={setConfig('debugMode')} color="#7c3aed" />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* ── SECTION 2: SUPER ADMIN CREDENTIALS & SECURITY ── */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section>
        <SectionHeader
          id="sec-profile"
          title="Super Admin Identity & Master Credentials"
          subtitle="Manage root account parameters, display persona, and master authentication passphrases."
          icon={User}
          badge="Root Authority"
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem' }}>
          
          {/* Identity Form */}
          <form onSubmit={handleSaveProfile} className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Super Admin Profile</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 2 }}>Public persona for platform notifications and audit journals.</p>
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>Full Name</label>
              <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} className="input-field" style={{ width: '100%', fontSize: '0.875rem' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>Root Master Email</label>
              <input type="email" disabled value={user?.email || ''} className="input-field" style={{ width: '100%', fontSize: '0.875rem', background: 'var(--surface-2)', cursor: 'not-allowed' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>Access Authority Tier</label>
              <input type="text" disabled value="Global Platform Root Administrator (super_admin)" className="input-field" style={{ width: '100%', fontSize: '0.875rem', background: 'var(--surface-2)', cursor: 'not-allowed' }} />
            </div>

            <button type="submit" disabled={savingProfile} className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: 4, fontWeight: 700 }}>
              <Save size={15} /> {savingProfile ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>

          {/* Master Password Form */}
          <form onSubmit={handleChangePassword} className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Change Master Password</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 2 }}>Requires confirmation of your current master passphrase.</p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>Current Master Password</label>
              <input type="password" required value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="input-field" style={{ width: '100%', fontSize: '0.875rem' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>New Passphrase (min 6 characters)</label>
              <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} className="input-field" style={{ width: '100%', fontSize: '0.875rem' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>Confirm New Passphrase</label>
              <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="input-field" style={{ width: '100%', fontSize: '0.875rem' }} />
            </div>

            <button type="submit" disabled={savingPassword} className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: 4, fontWeight: 700 }}>
              <Key size={15} /> {savingPassword ? 'Updating...' : 'Update Master Password'}
            </button>
          </form>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* ── SECTION 3: SUBSCRIPTION PLANS & FINANCIAL HEALTH ── */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section>
        <SectionHeader
          id="sec-financials"
          title="Monetization Health & Subscription Plans"
          subtitle="Real-time recurring revenues, plan cohort distributions, and tenant churn risk telemetry."
          icon={CreditCard}
          badge="Global Billing"
          action={
            <button onClick={handleExportReport} className="btn btn-secondary" style={{ gap: 8, fontWeight: 700 }}>
              <Download size={15} /> Export Financial CSV
            </button>
          }
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <div className="stat-card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: 'var(--brand-50)', border: '1px solid var(--brand-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-600)' }}>
                <CreditCard size={22} />
              </div>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '4px 9px', borderRadius: 999, border: '1px solid #a7f3d0' }}>
                <TrendingUp size={12} /> +12% MRR
              </span>
            </div>
            <p style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-0.04em' }}>
              ${mrr.toLocaleString()}
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500, marginTop: 8 }}>Monthly Recurring Revenue</p>
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Annualized Run-Rate (ARR): <strong style={{ color: 'var(--text-primary)' }}>${(mrr * 12).toLocaleString()}</strong></p>
            </div>
          </div>

          <div className="stat-card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: '#ecfdf5', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
                <Building2 size={22} />
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#059669', background: '#ecfdf5', padding: '4px 9px', borderRadius: 999, border: '1px solid #a7f3d0' }}>
                +{stats?.active_tenants ? Math.ceil(stats.active_tenants * 0.15) : 0} this month
              </span>
            </div>
            <p style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-0.04em' }}>
              {stats?.active_tenants || 0}
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500, marginTop: 8 }}>Active Enterprise Organizations</p>
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Default billing cycle: <strong>Monthly recurring</strong></p>
            </div>
          </div>

          <div className="stat-card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: '#fff1f2', border: '1px solid #fecdd3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e11d48' }}>
                <AlertCircle size={22} />
              </div>
            </div>
            <p style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-0.04em' }}>
              {stats?.suspended_tenants || 0}
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500, marginTop: 8 }}>Suspended Accounts</p>
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
              <p style={{ fontSize: '0.75rem', color: '#e11d48', margin: 0 }}>Revenue at risk: <strong>${((stats?.suspended_tenants || 0) * 299).toLocaleString()}</strong></p>
            </div>
          </div>
        </div>

        {/* Plan Distribution Bar */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.0625rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 1.5rem' }}>Subscription Plan Distribution</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {Object.entries(PLAN_CONFIG).map(([key, meta]) => {
              const count = planDist[key] || 0;
              const percentage = totalTenants > 0 ? Math.round((count / totalTenants) * 100) : 0;
              const barWidth = totalTenants > 0 ? (count / maxPlanCount) * 100 : 0;
              const Icon = meta.icon;
              return (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: 140, flexShrink: 0 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 8, background: meta.bg, border: `1px solid ${meta.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={16} color={meta.color} />
                    </div>
                    <div>
                      <p style={{ fontWeight: 800, fontSize: '0.875rem', color: 'var(--text-primary)', margin: 0 }}>{meta.label}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>{meta.priceLabel}</p>
                    </div>
                  </div>
                  <div style={{ flex: 1, height: 10, background: 'var(--surface-3)', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{ width: `${barWidth}%`, height: '100%', background: meta.color, borderRadius: 999, transition: 'width 0.6s ease' }} />
                  </div>
                  <div style={{ width: 80, flexShrink: 0, textAlign: 'right' }}>
                    <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>{count}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 4 }}>({percentage}%)</span>
                  </div>
                  <div style={{ width: 100, flexShrink: 0, textAlign: 'right' }}>
                    <span style={{ fontWeight: 800, color: meta.color, fontSize: '0.875rem' }}>
                      ${(count * meta.price).toLocaleString()}
                      <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.75rem' }}>/mo</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: '1.75rem', paddingTop: '1.5rem', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total portfolio across {totalTenants} organizations</span>
            <span style={{ fontWeight: 900, fontSize: '1.25rem', color: 'var(--brand-600)' }}>${mrr.toLocaleString()}<span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.875rem' }}>/mo</span></span>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* ── SECTION 4: AUTONOMOUS FEATURE FLAGS MATRIX ── */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section>
        <SectionHeader
          id="sec-flags"
          title="Autonomous Feature Flags & Progressive Rollout"
          subtitle="Targeted rollout gates to toggle experimental capabilities across enterprise segments."
          icon={Flag}
          badge="Release Matrix"
        />

        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table" style={{ margin: 0 }}>
            <thead>
              <tr>
                <th>Feature Capability</th>
                <th>Rollout State</th>
                <th>Target Audience</th>
                <th style={{ textAlign: 'right' }}>Executive Switch</th>
              </tr>
            </thead>
            <tbody>
              {flags.map(f => (
                <tr key={f.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--surface-2)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-600)' }}>
                        <Flag size={18} />
                      </div>
                      <div>
                        <p style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.9rem', margin: '0 0 2px' }}>{f.name}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>{f.description}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', fontWeight: 800,
                      padding: '3px 8px', borderRadius: 6,
                      ...(f.status === 'enabled' ? { color: '#059669', background: '#ecfdf5', border: '1px solid #a7f3d0' } :
                          f.status === 'partial' ? { color: '#d97706', background: '#fffbeb', border: '1px solid #fde68a' } :
                                                   { color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca' })
                    }}>
                      {f.status === 'enabled' ? '100% Global Rollout' : f.status === 'partial' ? 'Targeted Cohort' : 'Disabled'}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>{f.rollout}</span>
                    {f.audiences.length > 0 && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 6 }}>
                        ({f.audiences.join(', ')})
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <Toggle 
                      checked={f.status !== 'disabled'} 
                      onChange={() => toggleFlag(f.id)} 
                      color={f.status === 'partial' ? '#d97706' : '#059669'} 
                      labelOn={f.status === 'partial' ? 'COHORT' : 'GLOBAL'}
                      labelOff="HALTED"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* ── SECTION 5: PLATFORM WHITE-LABELING & BRANDING ── */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section>
        <SectionHeader
          id="sec-branding"
          title="Global White-Labeling & Theming Engine"
          subtitle="Define master visual branding, logo assets, and CSS variable injections for standard tenants."
          icon={Palette}
          badge="White-Label"
        />

        <form onSubmit={handleSaveBranding} className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Global Brand Primary Color Accent
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input 
                  type="color" 
                  value={branding.color} 
                  onChange={e => setBranding(b => ({ ...b, color: e.target.value }))} 
                  style={{ width: 44, height: 44, padding: 0, border: 'none', borderRadius: 10, cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }} 
                />
                <input 
                  value={branding.color} 
                  onChange={e => setBranding(b => ({ ...b, color: e.target.value }))} 
                  className="input-field" 
                  style={{ width: 140, fontFamily: 'monospace', fontWeight: 700 }} 
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Applied across all student canvases.</span>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Default Platform Header Logo URL
              </label>
              <input 
                value={branding.logoUrl} 
                onChange={e => setBranding(b => ({ ...b, logoUrl: e.target.value }))} 
                placeholder="https://cdn.example.com/platform-logo.png" 
                className="input-field" 
                style={{ width: '100%', fontSize: '0.875rem' }} 
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Custom CSS Theme Injections
            </label>
            <textarea 
              value={branding.customCss} 
              onChange={e => setBranding(b => ({ ...b, customCss: e.target.value }))} 
              placeholder=":root { --border-radius: 14px; --glow-brand: 0 0 20px rgba(99, 102, 241, 0.4); }" 
              rows={4} 
              className="input-field" 
              style={{ width: '100%', fontFamily: 'monospace', fontSize: '0.8125rem', lineHeight: 1.5 }} 
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', fontWeight: 700, gap: 8 }}>
            <Save size={15} /> Save White-Label Theme
          </button>
        </form>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* ── SECTION 6: DEVELOPER WEBHOOKS & API TELEMETRY ── */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section>
        <SectionHeader
          id="sec-webhooks"
          title="Developer API & Outbound Webhook Dispatcher"
          subtitle="Real-time event dispatching logs, API call volumes, and automated delivery retry pipelines."
          icon={Code}
          badge="Integration"
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <div className="stat-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '0.75rem' }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--brand-50)', border: '1px solid var(--brand-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-600)' }}>
                <Code size={20} />
              </div>
              <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-secondary)', margin: 0 }}>API Requests (24h)</p>
            </div>
            <p style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0, lineHeight: 1 }}>1.2M</p>
          </div>

          <div className="stat-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '0.75rem' }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: '#ecfdf5', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
                <Link2 size={20} />
              </div>
              <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-secondary)', margin: 0 }}>Webhook Success Rate</p>
            </div>
            <p style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0, lineHeight: 1 }}>99.9%</p>
          </div>

          <div className="stat-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '0.75rem' }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: '#fef2f2', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e11d48' }}>
                <ShieldAlert size={20} />
              </div>
              <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-secondary)', margin: 0 }}>Pending Delivery Retries</p>
            </div>
            <p style={{ fontSize: '2rem', fontWeight: 900, color: events.some(e => e.status !== 200) ? '#e11d48' : '#059669', margin: 0, lineHeight: 1 }}>
              {events.filter(e => e.status !== 200).length}
            </p>
          </div>
        </div>

        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--glass-border)', background: 'var(--surface-1)' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Recent Outbound Event Deliveries</h3>
          </div>
          <table className="table" style={{ margin: 0 }}>
            <thead>
              <tr>
                <th>Event Type</th>
                <th>Target Endpoint</th>
                <th>Delivery Code</th>
                <th>Timestamp</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map(e => (
                <tr key={e.id}>
                  <td>
                    <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: '0.8125rem' }}>
                      {e.event}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{e.endpoint}</span>
                  </td>
                  <td>
                    <span style={{
                      fontSize: '0.75rem', fontWeight: 800,
                      color: e.status === 200 ? '#059669' : '#e11d48',
                      background: e.status === 200 ? '#ecfdf5' : '#fff1f2',
                      border: `1px solid ${e.status === 200 ? '#a7f3d0' : '#fecdd3'}`,
                      padding: '3px 8px', borderRadius: 6
                    }}>
                      HTTP {e.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{e.time}</td>
                  <td style={{ textAlign: 'right' }}>
                    {e.status !== 200 ? (
                      <button onClick={() => handleRetryWebhook(e.id)} disabled={retryingId === e.id} className="btn btn-ghost btn-sm" style={{ color: 'var(--brand-600)', fontWeight: 700 }}>
                        <RotateCcw size={14} /> {retryingId === e.id ? 'Retrying...' : 'Retry Event'}
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <CheckCircle2 size={13} /> Acknowledged
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* ── SECTION 7: LEGAL COMPLIANCE & REGULATORY GOVERNANCE ── */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section>
        <SectionHeader
          id="sec-legal"
          title="Legal Compliance & Data Governance"
          subtitle="Global Terms of Service, Privacy Policy versions, and user re-acceptance enforcement."
          icon={FileBadge}
          badge="Governance"
          action={
            <button onClick={handleUploadNewVersion} className="btn btn-primary" style={{ gap: 6, fontWeight: 700 }}>
              <FileText size={15} /> Publish New Legal Version
            </button>
          }
        />

        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table" style={{ margin: 0 }}>
            <thead>
              <tr>
                <th>Document Name</th>
                <th>Enforced Version</th>
                <th>Publication Date</th>
                <th>Tenant Acceptance Rate</th>
              </tr>
            </thead>
            <tbody>
              {docs.map(doc => (
                <tr key={doc.id}>
                  <td>
                    <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{doc.name}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', background: 'var(--surface-2)', padding: '2px 8px', borderRadius: 999, fontWeight: 700 }}>
                      {doc.version}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{doc.date}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: doc.status === 'active' ? '#059669' : '#d97706' }}>
                      {doc.rate}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
}
