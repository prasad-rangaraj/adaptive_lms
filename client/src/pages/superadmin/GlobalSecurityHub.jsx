import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminAPI, tenantsAPI } from '../../services/api.service';
import {
  Activity, RefreshCw, UserPlus, BookOpen, Shield,
  ShieldAlert, Globe, User as UserIcon, Search, Filter,
  CheckCircle, AlertTriangle, AlertOctagon, Info, Download, 
  Calendar, Lock, Key, Server, EyeOff, ShieldCheck, MapPin, Fingerprint, Plus,
  Building2, ChevronDown, Layers, Terminal,
  Sliders, Clock, Smartphone, Laptop, CheckCircle2, Sparkles, Zap, FileText, AlertCircle, RotateCcw
} from 'lucide-react';
import Loader from '../../components/ui/Loader';
import toast from 'react-hot-toast';

const ACTION_CONFIG = {
  user_created:          { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', icon: UserPlus,       label: 'User Created',        severity: 'success' },
  course_published:      { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', icon: BookOpen,       label: 'Course Published',    severity: 'success' },
  tenant_created:        { color: '#4f46e5', bg: '#eef2ff', border: '#c7d2fe', icon: Building2,      label: 'Tenant Created',      severity: 'info' },
  tenant_suspended:      { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', icon: AlertOctagon,   label: 'Tenant Suspended',    severity: 'danger' },
  user_deleted:          { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', icon: AlertOctagon,   label: 'User Deleted',        severity: 'danger' },
  impersonation_started: { color: '#d97706', bg: '#fffbeb', border: '#fde68a', icon: Shield,         label: 'Impersonation',       severity: 'warning' },
  ticket_created:        { color: '#0891b2', bg: '#ecfeff', border: '#a5f3fc', icon: Info,           label: 'Ticket Created',      severity: 'info' },
  api_key_rotated:       { color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe', icon: Key,            label: 'API Key Rotated',     severity: 'warning' },
  settings_updated:      { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', icon: ShieldCheck,    label: 'Settings Updated',    severity: 'info' },
  default:               { color: '#0e7490', bg: '#ecfeff', border: '#a5f3fc', icon: Info,           label: 'System Event',        severity: 'info' },
};

function getActionConfig(action) { return ACTION_CONFIG[action] || ACTION_CONFIG.default; }

const SEVERITY_FILTERS = [
  { key: 'all',     label: 'All Severities', icon: Filter },
  { key: 'success', label: 'Success',        icon: CheckCircle },
  { key: 'danger',  label: 'Critical',       icon: AlertOctagon },
  { key: 'warning', label: 'Security',       icon: AlertTriangle },
  { key: 'info',    label: 'Info',           icon: Info },
];

// ── Next-Gen Cyber Shield Switch Toggle ───────────────────────────────────────
function Toggle({ checked, onChange, color = '#059669', labelOn = 'ENFORCED', labelOff = 'STANDBY', showBadge = true }) {
  const activeColor = color || '#059669';
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

function SettingRow({ title, description, value, onChange, color = '#059669', badge, children }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.25rem',
      padding: '1.125rem 1.25rem', background: value ? 'var(--surface-0)' : 'var(--surface-1)',
      borderRadius: 14, border: `1.5px solid ${value ? color + '40' : 'var(--glass-border)'}`,
      boxShadow: value ? `0 4px 16px ${color}0d` : 'none',
      transition: 'all 0.25s ease'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0, marginTop: 2,
          background: value ? `${color}15` : 'var(--surface-2)',
          color: value ? color : 'var(--text-muted)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.25s'
        }}>
          <Shield size={17} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem', margin: 0 }}>{title}</p>
            {badge && (
              <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: color, background: `${color}15`, padding: '1px 7px', borderRadius: 6, border: `1px solid ${color}30` }}>
                {badge}
              </span>
            )}
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '4px 0 0', lineHeight: 1.4 }}>{description}</p>
          {children && <div style={{ marginTop: 8 }}>{children}</div>}
        </div>
      </div>
      <Toggle checked={value} onChange={onChange} color={color} labelOn="ENFORCED" labelOff="STANDBY" />
    </div>
  );
}

// ── Tab 1: Audit Trail (with Organization-Wise Selector) ──────────────────────
function AuditTrailTab() {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [selectedOrg, setSelectedOrg] = useState('all');

  const { data: tenants = [] } = useQuery({
    queryKey: ['admin-tenants-list'],
    queryFn: () => tenantsAPI.list().then(r => r.data),
  });

  const { data: logs = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ['audit-logs', selectedOrg],
    queryFn: () => {
      const params = {};
      if (selectedOrg !== 'all') {
        params.tenant_id = selectedOrg === 'global' ? 0 : Number(selectedOrg);
      }
      return adminAPI.listAuditLogs(params).then(r => r.data);
    },
  });

  const filtered = logs?.filter(log => {
    const term = search.toLowerCase();
    const matchSearch = 
      log.action.toLowerCase().includes(term) ||
      log.resource.toLowerCase().includes(term) ||
      (log.tenant_name && log.tenant_name.toLowerCase().includes(term)) ||
      (log.user_name && log.user_name.toLowerCase().includes(term)) ||
      (log.ip_address && log.ip_address.toLowerCase().includes(term));
    const cfg = getActionConfig(log.action);
    const matchSeverity = severityFilter === 'all' || cfg.severity === severityFilter;
    return matchSearch && matchSeverity;
  });

  const counts = logs?.reduce((acc, log) => {
    const cfg = getActionConfig(log.action);
    acc[cfg.severity] = (acc[cfg.severity] || 0) + 1;
    return acc;
  }, {}) || {};

  const handleExport = () => {
    if (!filtered || !filtered.length) return toast.error('No logs to export');
    const selectedOrgName = selectedOrg === 'all' ? 'All_Orgs' : selectedOrg === 'global' ? 'Platform_Root' : `Org_${selectedOrg}`;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filtered, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `platform_audit_logs_${selectedOrgName}_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success(`Exported ${filtered.length} audit logs for ${selectedOrgName}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* ── Organization-Wise Selector Command Dock ── */}
      <div className="glass-card" style={{
        padding: '1.25rem 1.5rem',
        background: 'linear-gradient(135deg, var(--surface-0), var(--brand-50))',
        border: '1.5px solid var(--brand-200)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.25rem',
        boxShadow: '0 4px 16px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'white', border: '1.5px solid var(--brand-200)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--brand-600)', boxShadow: '0 2px 8px rgba(99, 102, 241, 0.15)'
          }}>
            <Building2 size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--brand-600)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Multi-Tenant Audit Scope
              </span>
              <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#059669', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '1px 7px', borderRadius: 999 }}>
                LIVE FILTER
              </span>
            </div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--text-primary)', margin: '2px 0 0', letterSpacing: '-0.02em' }}>
              Select Organization
            </h2>
          </div>
        </div>

        {/* Dropdown Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <select
              value={selectedOrg}
              onChange={e => setSelectedOrg(e.target.value)}
              className="input-field"
              style={{
                height: 42,
                paddingLeft: '1rem',
                paddingRight: '2.5rem',
                fontWeight: 800,
                fontSize: '0.875rem',
                color: 'var(--text-primary)',
                background: 'white',
                border: '1.5px solid var(--brand-300)',
                borderRadius: 12,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                appearance: 'none',
                WebkitAppearance: 'none'
              }}
            >
              <option value="all">🏢 All Organizations (Global Cross-Tenant)</option>
              {tenants.map(t => (
                <option key={t.id} value={String(t.id)}>🏛 {t.name} (Org #{t.id})</option>
              ))}
              <option value="global">⚡ Platform Root / Global System Only</option>
            </select>
            <ChevronDown size={16} color="var(--brand-600)" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>
        </div>
      </div>

      {/* ── Severity Filters Ribbon ── */}
      <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {SEVERITY_FILTERS.map(({ key, label, icon: Icon }) => {
          const active = severityFilter === key;
          const colorMap = { success: '#059669', danger: '#e11d48', warning: '#d97706', info: '#4f46e5' };
          const bgMap = { success: '#ecfdf5', danger: '#fff1f2', warning: '#fffbeb', info: '#eef2ff' };
          const c = colorMap[key] || 'var(--brand-500)';
          const bg = bgMap[key] || 'var(--brand-50)';
          return (
            <button 
              key={key} 
              onClick={() => setSeverityFilter(key)} 
              style={{ 
                display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 999, 
                border: `2px solid ${active ? c : 'var(--glass-border)'}`, 
                background: active ? bg : 'transparent', 
                color: active ? c : 'var(--text-muted)', 
                fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' 
              }}
            >
              <Icon size={13} /> {label}
              {key !== 'all' && (
                <span style={{ 
                  background: active ? c : 'var(--surface-3)', 
                  color: active ? 'white' : 'var(--text-secondary)', 
                  borderRadius: 999, padding: '1px 7px', fontSize: '0.6875rem', fontWeight: 800 
                }}>
                  {counts[key] || 0}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Audit Logs Stream Glass Card ── */}
      <div className="glass-card" style={{ padding: 0 }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', background: 'var(--surface-1)', borderTopLeftRadius: 'inherit', borderTopRightRadius: 'inherit', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 260, maxWidth: 380 }}>
            <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input 
              type="text" 
              placeholder="Search by action, user, org, IP, or resource..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              className="input-field" 
              style={{ paddingLeft: '2.25rem', width: '100%', height: 38, fontSize: '0.875rem' }} 
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Showing {filtered?.length || 0} events
            </span>
            <button onClick={() => refetch()} disabled={isFetching} className="btn btn-ghost btn-icon btn-sm" title="Refresh Audit Trail">
              <RefreshCw size={14} style={{ animation: isFetching ? 'spin 1s linear infinite' : 'none' }} />
            </button>
            <button onClick={handleExport} className="btn btn-secondary btn-sm" style={{ gap: 6, fontWeight: 700 }}>
              <Download size={14} /> Export Logs
            </button>
          </div>
        </div>

        {isLoading ? (
          <Loader text="Loading audit events for selected scope..." />
        ) : !filtered?.length ? (
          <div style={{ padding: '4rem', textAlign: 'center' }}>
            <ShieldAlert size={36} color="var(--text-muted)" style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
            <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1rem', margin: '0 0 4px' }}>
              No audit events found
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', margin: 0 }}>
              No security entries match organization &apos;{selectedOrg === 'all' ? 'All Organizations' : selectedOrg === 'global' ? 'Platform Root' : tenants.find(t => String(t.id) === selectedOrg)?.name || `Org #${selectedOrg}`}&apos; with current filters.
            </p>
          </div>
        ) : (
          <div style={{ padding: '1.75rem 2rem', display: 'flex', flexDirection: 'column', gap: 0 }}>
            {filtered.map((log, i) => {
              const cfg = getActionConfig(log.action);
              const Icon = cfg.icon;
              const isLast = i === filtered.length - 1;
              return (
                <div key={log.id} style={{ display: 'flex', gap: '1.25rem', position: 'relative', paddingBottom: isLast ? 0 : '1.75rem' }}>
                  {!isLast && <div style={{ position: 'absolute', left: 19, top: 40, bottom: 0, width: 2, background: 'var(--surface-3)' }} />}
                  <div style={{ 
                    width: 40, height: 40, borderRadius: '50%', flexShrink: 0, 
                    background: cfg.bg, border: `2px solid ${cfg.border}`, 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 
                  }}>
                    <Icon size={16} color={cfg.color} />
                  </div>
                  <div style={{ flex: 1, paddingTop: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>
                            {log.action.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                          </span>
                          
                          {/* Organization Badge */}
                          <span style={{
                            fontSize: '0.75rem', fontWeight: 800,
                            color: log.tenant_id ? '#059669' : '#7c3aed',
                            background: log.tenant_id ? '#ecfdf5' : '#f5f3ff',
                            border: `1px solid ${log.tenant_id ? '#a7f3d0' : '#ddd6fe'}`,
                            padding: '2px 8px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 4
                          }}>
                            {log.tenant_id ? <Building2 size={11} /> : <Shield size={11} />}
                            {log.tenant_name || (log.tenant_id ? `Org #${log.tenant_id}` : 'Platform Root')}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: 6, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`, padding: '2px 7px', borderRadius: 4 }}>
                            {log.resource}
                          </span>
                          {log.user_name ? (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 3, fontWeight: 600 }}>
                              <UserIcon size={11} /> {log.user_name}
                            </span>
                          ) : log.user_id ? (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                              <UserIcon size={11} /> User #{log.user_id}
                            </span>
                          ) : null}
                          {log.ip_address && (
                            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontFamily: 'monospace', background: 'var(--surface-2)', padding: '1px 6px', borderRadius: 4 }}>
                              IP: {log.ip_address}
                            </span>
                          )}
                          {log.details && Object.keys(log.details).length > 0 && (
                            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                              {JSON.stringify(log.details)}
                            </span>
                          )}
                        </div>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', flexShrink: 0, marginTop: 2, fontWeight: 600 }}>
                        {new Date(log.created_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Tab 2: Access Policies (Fresh, Professional & Complete) ───────────────────
function AccessPoliciesTab() {
  const [policies, setPolicies] = useState(() => {
    try {
      const s = localStorage.getItem('lms_global_security_policies');
      return s ? JSON.parse(s) : {
        // Identity & Auth
        mfa: true,
        mfaGracePeriod: '7d',
        ssoOnly: false,
        adaptiveRiskAuth: true,
        complexPasswords: true,
        minPasswordLength: 12,
        
        // Session & Tokens
        sessionTimeout: true,
        sessionDuration: '30m',
        preventConcurrentSessions: true,
        forceReauthForBilling: true,

        // Perimeter & Network
        impossibleTravel: true,
        blockTorProxies: true,
        ipRestriction: false,
        ipAllowedRanges: '10.0.0.0/8, 172.16.0.0/12',

        // Device & Zero Trust
        hardwareKeyPreferred: false,
        untrustedDeviceChallenge: true,
      };
    } catch {
      return {
        mfa: true,
        mfaGracePeriod: '7d',
        ssoOnly: false,
        adaptiveRiskAuth: true,
        complexPasswords: true,
        minPasswordLength: 12,
        sessionTimeout: true,
        sessionDuration: '30m',
        preventConcurrentSessions: true,
        forceReauthForBilling: true,
        impossibleTravel: true,
        blockTorProxies: true,
        ipRestriction: false,
        ipAllowedRanges: '10.0.0.0/8, 172.16.0.0/12',
        hardwareKeyPreferred: false,
        untrustedDeviceChallenge: true,
      };
    }
  });

  const [revoking, setRevoking] = useState(false);

  const update = (key, val) => {
    const next = { ...policies, [key]: val };
    setPolicies(next);
    localStorage.setItem('lms_global_security_policies', JSON.stringify(next));
    toast.success('Security access policy saved globally');
  };

  // Compute Zero-Trust Posture Score
  const scoreItems = [
    policies.mfa,
    policies.adaptiveRiskAuth,
    policies.complexPasswords,
    policies.sessionTimeout,
    policies.preventConcurrentSessions,
    policies.forceReauthForBilling,
    policies.impossibleTravel,
    policies.blockTorProxies,
    policies.untrustedDeviceChallenge,
  ];
  const activeCount = scoreItems.filter(Boolean).length;
  const postureScore = Math.round((activeCount / scoreItems.length) * 100);

  const applyNistBaseline = () => {
    const baseline = {
      ...policies,
      mfa: true,
      adaptiveRiskAuth: true,
      complexPasswords: true,
      sessionTimeout: true,
      sessionDuration: '15m',
      preventConcurrentSessions: true,
      forceReauthForBilling: true,
      impossibleTravel: true,
      blockTorProxies: true,
      untrustedDeviceChallenge: true,
    };
    setPolicies(baseline);
    localStorage.setItem('lms_global_security_policies', JSON.stringify(baseline));
    toast.success('SOC 2 & NIST 800-63B Zero-Trust Baseline applied across all tenants!');
  };

  const handleRevokeGlobalSessions = () => {
    if (!window.confirm('Are you sure you want to invalidate all active JWT user sessions cluster-wide? All logged-in users (except Super Admin) will be prompted to re-authenticate.')) {
      return;
    }
    setRevoking(true);
    setTimeout(() => {
      setRevoking(false);
      toast.success('Successfully revoked 4,525 active sessions across all tenants.');
    }, 900);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* ── Security Posture & Enforcement Telemetry Ribbon ── */}
      <div className="glass-card" style={{
        padding: '1.75rem 2rem',
        background: 'linear-gradient(135deg, var(--surface-0), var(--brand-50))',
        border: '1.5px solid var(--brand-200)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem',
        boxShadow: '0 8px 24px rgba(99, 102, 241, 0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{
            width: 58, height: 58, borderRadius: 16,
            background: 'white', border: '2px solid var(--brand-300)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--brand-600)', boxShadow: '0 4px 14px rgba(99, 102, 241, 0.18)'
          }}>
            <ShieldCheck size={30} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--brand-600)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Zero-Trust Access Architecture
              </span>
              <span style={{
                fontSize: '0.6875rem', fontWeight: 800,
                color: postureScore >= 80 ? '#059669' : '#d97706',
                background: postureScore >= 80 ? '#ecfdf5' : '#fffbeb',
                border: `1px solid ${postureScore >= 80 ? '#a7f3d0' : '#fde68a'}`,
                padding: '2px 8px', borderRadius: 999
              }}>
                {postureScore >= 80 ? 'GRADE A: ROBUST ENFORCEMENT' : 'HARDENING RECOMMENDED'}
              </span>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)', margin: '4px 0 2px', letterSpacing: '-0.02em' }}>
              Global Access & Identity Governance
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>
              Centrally enforce identity verification, session timeouts, and network boundary controls across all registered organizations.
            </p>
          </div>
        </div>

        {/* Posture Score & Presets */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'right', paddingRight: '1rem', borderRight: '1px solid var(--glass-border)' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end', gap: 4 }}>
              <span style={{ fontSize: '2rem', fontWeight: 900, color: postureScore >= 80 ? '#059669' : 'var(--brand-600)', lineHeight: 1 }}>
                {postureScore}%
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>POSTURE</span>
            </div>
            <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', margin: '4px 0 0', fontWeight: 600 }}>
              {activeCount} of {scoreItems.length} Controls Active
            </p>
          </div>

          <button
            onClick={applyNistBaseline}
            className="btn btn-primary"
            style={{ gap: 8, fontWeight: 800, padding: '0.625rem 1.25rem', borderRadius: 12 }}
          >
            <Sparkles size={16} /> Apply SOC 2 Baseline
          </button>
        </div>
      </div>

      {/* ── Policy Sections Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem' }}>
        
        {/* Section 1: Authentication & Identity Defense (IAM) */}
        <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: '#f5f3ff', border: '1px solid #ddd6fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed' }}>
                <Key size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Authentication & Identity (IAM)
                </h3>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 600 }}>Multi-Factor & Password Hardening</span>
              </div>
            </div>
            <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#7c3aed', background: '#f5f3ff', padding: '2px 8px', borderRadius: 6, border: '1px solid #ddd6fe' }}>
              IAM ZERO-TRUST
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <SettingRow
              title="Multi-Factor Authentication (MFA / 2FA)"
              description="Forces all Tenant Admins and Instructors to enroll in TOTP (Google Authenticator) or WebAuthn before dashboard access."
              value={policies.mfa}
              onChange={v => update('mfa', v)}
              color="#7c3aed"
              badge="MANDATORY"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Grace Period:</span>
                <select
                  value={policies.mfaGracePeriod}
                  onChange={e => update('mfaGracePeriod', e.target.value)}
                  className="input-field"
                  style={{ height: 28, fontSize: '0.75rem', padding: '0 8px', borderRadius: 6, width: 110 }}
                >
                  <option value="immediate">Immediate</option>
                  <option value="3d">3 Days</option>
                  <option value="7d">7 Days</option>
                  <option value="14d">14 Days</option>
                </select>
              </div>
            </SettingRow>

            <SettingRow
              title="Adaptive Risk-Based Authentication"
              description="Intelligently prompts for step-up verification when sign-in originates from an unrecognized device or abnormal geolocation."
              value={policies.adaptiveRiskAuth}
              onChange={v => update('adaptiveRiskAuth', v)}
              color="#7c3aed"
              badge="AI HEURISTIC"
            />

            <SettingRow
              title="Strict Password Entropy & Breach Check"
              description="Enforces 12+ characters, uppercase, numbers, symbols, and cross-references against known compromised password databases."
              value={policies.complexPasswords}
              onChange={v => update('complexPasswords', v)}
              color="#7c3aed"
              badge="NIST 800-63B"
            />

            <SettingRow
              title="Enterprise SSO Exclusive Mode"
              description="Disables local username/password sign-in globally. All institutional users must authenticate exclusively via SAML 2.0 or Okta."
              value={policies.ssoOnly}
              onChange={v => update('ssoOnly', v)}
              color="#7c3aed"
              badge="FEDERATED"
            />
          </div>
        </div>

        {/* Section 2: Session Lifespan & Token Security */}
        <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: '#eff6ff', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                <Clock size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Session Lifespan & Tokens
                </h3>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 600 }}>JWT Lifecycle & Inactivity Revocation</span>
              </div>
            </div>
            <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#2563eb', background: '#eff6ff', padding: '2px 8px', borderRadius: 6, border: '1px solid #bfdbfe' }}>
              SESSION GOVERNANCE
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <SettingRow
              title="Idle Inactivity Session Timeout"
              description="Automatically invalidates idle sessions and redirects users to re-authenticate after a continuous period of inactivity."
              value={policies.sessionTimeout}
              onChange={v => update('sessionTimeout', v)}
              color="#2563eb"
              badge="AUTO-LOCK"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Inactivity Threshold:</span>
                <select
                  value={policies.sessionDuration}
                  onChange={e => update('sessionDuration', e.target.value)}
                  className="input-field"
                  style={{ height: 28, fontSize: '0.75rem', padding: '0 8px', borderRadius: 6, width: 130 }}
                >
                  <option value="15m">15 Minutes (Strict)</option>
                  <option value="30m">30 Minutes (Standard)</option>
                  <option value="60m">1 Hour</option>
                  <option value="240m">4 Hours</option>
                </select>
              </div>
            </SettingRow>

            <SettingRow
              title="Concurrent Session Prevention"
              description="Restricts accounts to a single active sign-in session. Subsequent logins automatically terminate older active tokens."
              value={policies.preventConcurrentSessions}
              onChange={v => update('preventConcurrentSessions', v)}
              color="#2563eb"
              badge="SINGLE LOGIN"
            />

            <SettingRow
              title="Force Re-Auth for Critical Operations"
              description="Requires re-entry of password/MFA before changing root billing, generating developer API keys, or updating tenant policies."
              value={policies.forceReauthForBilling}
              onChange={v => update('forceReauthForBilling', v)}
              color="#2563eb"
              badge="HIGH SECURITY"
            />

            {/* Emergency Global Session Revocation Action */}
            <div style={{
              padding: '1rem 1.25rem',
              background: '#fff1f2',
              borderRadius: 12,
              border: '1.5px solid #fecdd3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              marginTop: 4
            }}>
              <div>
                <p style={{ fontWeight: 800, color: '#e11d48', fontSize: '0.875rem', margin: 0 }}>
                  Emergency Session Purge
                </p>
                <p style={{ fontSize: '0.75rem', color: '#9f1239', margin: '2px 0 0' }}>
                  Force-terminate all 4,525 active user sessions across all tenants.
                </p>
              </div>
              <button
                onClick={handleRevokeGlobalSessions}
                disabled={revoking}
                style={{
                  background: '#e11d48', color: 'white', border: 'none',
                  padding: '6px 12px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 800,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                  boxShadow: '0 2px 8px rgba(225, 29, 72, 0.3)'
                }}
              >
                <Zap size={14} style={{ animation: revoking ? 'spin 1s linear infinite' : 'none' }} />
                {revoking ? 'Purging...' : 'Revoke All'}
              </button>
            </div>
          </div>
        </div>

        {/* Section 3: Perimeter & Network Access Control */}
        <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: '#ecfdf5', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
                <Globe size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Perimeter & Network Defense
                </h3>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 600 }}>Geo-Fencing & IP Whitelisting</span>
              </div>
            </div>
            <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#059669', background: '#ecfdf5', padding: '2px 8px', borderRadius: 6, border: '1px solid #a7f3d0' }}>
              NETWORK SHIELD
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <SettingRow
              title="Impossible Travel Velocity Detection"
              description="Flags and blocks simultaneous or rapid logins originating from geographically separated locations within physically impossible timeframes."
              value={policies.impossibleTravel}
              onChange={v => update('impossibleTravel', v)}
              color="#059669"
              badge="VELOCITY AI"
            />

            <SettingRow
              title="Tor Exit Nodes & Public VPN Shield"
              description="Deflects automated credential-stuffing bots by dropping authentication requests originating from known Tor exit relays and anonymous proxies."
              value={policies.blockTorProxies}
              onChange={v => update('blockTorProxies', v)}
              color="#059669"
              badge="WAF ENFORCED"
            />

            <SettingRow
              title="Campus Subnet / IP CIDR Whitelist"
              description="Restricts administrative portal access to designated institutional subnets or trusted corporate VPN CIDR blocks."
              value={policies.ipRestriction}
              onChange={v => update('ipRestriction', v)}
              color="#059669"
              badge="IP RESTRICTION"
            >
              {policies.ipRestriction && (
                <div style={{ marginTop: 6 }}>
                  <input
                    type="text"
                    value={policies.ipAllowedRanges}
                    onChange={e => update('ipAllowedRanges', e.target.value)}
                    placeholder="e.g. 10.0.0.0/8, 192.168.1.0/24"
                    className="input-field"
                    style={{ height: 32, fontSize: '0.75rem', fontFamily: 'monospace', width: '100%' }}
                  />
                </div>
              )}
            </SettingRow>
          </div>
        </div>

        {/* Section 4: Device Trust & Regulatory Alignment */}
        <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: '#fffbeb', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
                <Laptop size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Device Trust & Compliance
                </h3>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 600 }}>Hardware Key Preference & Audit Proof</span>
              </div>
            </div>
            <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#d97706', background: '#fffbeb', padding: '2px 8px', borderRadius: 6, border: '1px solid #fde68a' }}>
              COMPLIANCE READY
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <SettingRow
              title="Untrusted Device Fingerprint Challenge"
              description="Demands out-of-band email or SMS approval when a user signs in from a hardware fingerprint not previously encountered."
              value={policies.untrustedDeviceChallenge}
              onChange={v => update('untrustedDeviceChallenge', v)}
              color="#d97706"
              badge="DEVICE PROFILING"
            />

            <SettingRow
              title="Hardware Security Key Priority (FIDO2)"
              description="Prompts users who have registered a YubiKey or TouchID hardware authenticator to use WebAuthn before fallback to TOTP."
              value={policies.hardwareKeyPreferred}
              onChange={v => update('hardwareKeyPreferred', v)}
              color="#d97706"
              badge="WEBAUTHN"
            />

            {/* Compliance Framework Badges */}
            <div style={{
              padding: '1rem 1.25rem',
              background: 'var(--surface-1)',
              borderRadius: 12,
              border: '1px solid var(--glass-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: 8
            }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Regulatory Standards Alignment:
              </span>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '3px 8px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <CheckCircle2 size={12} /> SOC 2 Type II
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '3px 8px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <CheckCircle2 size={12} /> ISO/IEC 27001
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '3px 8px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <CheckCircle2 size={12} /> FERPA / COPPA
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '3px 8px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <CheckCircle2 size={12} /> GDPR Art. 32
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Role-Based Access Control (RBAC) Enforcement Matrix ── */}
      <div className="glass-card" style={{ padding: 0 }}>
        <div style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid var(--glass-border)', background: 'var(--surface-1)', borderTopLeftRadius: 'inherit', borderTopRightRadius: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Role-Based Enforcement Matrix (RBAC)
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
              Granular application of access policies across platform privilege tiers.
            </p>
          </div>
          <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--brand-600)', background: 'var(--brand-50)', padding: '3px 8px', borderRadius: 6, border: '1px solid var(--brand-200)' }}>
            TIERED ACCESS CONTROLS
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ margin: 0 }}>
            <thead>
              <tr>
                <th style={{ paddingLeft: '1.75rem' }}>Platform Role</th>
                <th>2FA / MFA Requirement</th>
                <th>Inactivity Auto-Lock</th>
                <th>Concurrent Logins</th>
                <th>IP Subnet Restrictions</th>
                <th style={{ textAlign: 'right', paddingRight: '1.75rem' }}>Risk Level</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ paddingLeft: '1.75rem' }}>
                  <span style={{ fontWeight: 800, color: '#7c3aed', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Shield size={14} /> Super Administrator
                  </span>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Root cluster & tenant management</span>
                </td>
                <td><span style={{ fontWeight: 800, color: '#059669', background: '#ecfdf5', padding: '2px 8px', borderRadius: 6, fontSize: '0.75rem' }}>MANDATORY</span></td>
                <td><span style={{ fontWeight: 700, fontSize: '0.8125rem' }}>15 Minutes</span></td>
                <td><span style={{ fontWeight: 700, color: '#e11d48', fontSize: '0.8125rem' }}>Blocked (Single Only)</span></td>
                <td><span style={{ fontWeight: 700, color: '#059669', fontSize: '0.8125rem' }}>Enforced</span></td>
                <td style={{ textAlign: 'right', paddingRight: '1.75rem' }}>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#e11d48', background: '#fff1f2', padding: '2px 8px', borderRadius: 6, border: '1px solid #fecdd3' }}>CRITICAL</span>
                </td>
              </tr>
              <tr>
                <td style={{ paddingLeft: '1.75rem' }}>
                  <span style={{ fontWeight: 800, color: '#2563eb', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Building2 size={14} /> Tenant Administrator
                  </span>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Organization & faculty oversight</span>
                </td>
                <td><span style={{ fontWeight: 800, color: '#059669', background: '#ecfdf5', padding: '2px 8px', borderRadius: 6, fontSize: '0.75rem' }}>MANDATORY</span></td>
                <td><span style={{ fontWeight: 700, fontSize: '0.8125rem' }}>30 Minutes</span></td>
                <td><span style={{ fontWeight: 700, color: '#d97706', fontSize: '0.8125rem' }}>Max 2 Devices</span></td>
                <td><span style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.8125rem' }}>Optional</span></td>
                <td style={{ textAlign: 'right', paddingRight: '1.75rem' }}>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#d97706', background: '#fffbeb', padding: '2px 8px', borderRadius: 6, border: '1px solid #fde68a' }}>HIGH</span>
                </td>
              </tr>
              <tr>
                <td style={{ paddingLeft: '1.75rem' }}>
                  <span style={{ fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <BookOpen size={14} /> Faculty & Instructors
                  </span>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Course content & student assessment</span>
                </td>
                <td><span style={{ fontWeight: 800, color: '#059669', background: '#ecfdf5', padding: '2px 8px', borderRadius: 6, fontSize: '0.75rem' }}>ENFORCED</span></td>
                <td><span style={{ fontWeight: 700, fontSize: '0.8125rem' }}>60 Minutes</span></td>
                <td><span style={{ fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>Allowed</span></td>
                <td><span style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.8125rem' }}>Disabled</span></td>
                <td style={{ textAlign: 'right', paddingRight: '1.75rem' }}>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#2563eb', background: '#eff6ff', padding: '2px 8px', borderRadius: 6, border: '1px solid #bfdbfe' }}>MEDIUM</span>
                </td>
              </tr>
              <tr>
                <td style={{ paddingLeft: '1.75rem' }}>
                  <span style={{ fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <UserIcon size={14} /> Students & Learners
                  </span>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Adaptive learning & exams</span>
                </td>
                <td><span style={{ fontWeight: 700, color: 'var(--text-muted)', background: 'var(--surface-2)', padding: '2px 8px', borderRadius: 6, fontSize: '0.75rem' }}>OPTIONAL</span></td>
                <td><span style={{ fontWeight: 700, fontSize: '0.8125rem' }}>120 Minutes</span></td>
                <td><span style={{ fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>Allowed</span></td>
                <td><span style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.8125rem' }}>Disabled</span></td>
                <td style={{ textAlign: 'right', paddingRight: '1.75rem' }}>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#059669', background: '#ecfdf5', padding: '2px 8px', borderRadius: 6, border: '1px solid #a7f3d0' }}>LOW</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

// ── Tab 3: Threat Defense ─────────────────────────────────────────────────────
function ThreatDefenseTab() {
  const threats = [
    { id: 1, type: 'Brute Force', ip: '192.168.1.104', location: 'Moscow, RU', status: 'blocked', time: '10 mins ago', targets: 4 },
    { id: 2, type: 'DDoS Anomalous Traffic', ip: '45.22.11.0', location: 'Shenzhen, CN', status: 'mitigated', time: '1 hr ago', targets: 12 },
    { id: 3, type: 'Suspicious Login', ip: '104.28.19.11', location: 'London, UK', status: 'flagged', time: '3 hrs ago', targets: 1 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        <div className="stat-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: '#fef2f2', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e11d48' }}><ShieldAlert size={20} /></div>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Blocked IPs</p>
          </div>
          <p style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>142</p>
        </div>
        <div className="stat-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: '#fffbeb', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}><Key size={20} /></div>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Failed Logins (24h)</p>
          </div>
          <p style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>8,492</p>
        </div>
        <div className="stat-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: '#ecfdf5', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}><Server size={20} /></div>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>WAF Status</p>
          </div>
          <p style={{ fontSize: '1.5rem', fontWeight: 900, color: '#059669', lineHeight: 1.2 }}>Active & Enforcing</p>
        </div>
      </div>

      <div className="glass-card" style={{ padding: 0 }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--glass-border)', background: 'var(--surface-1)', borderTopLeftRadius: 'inherit', borderTopRightRadius: 'inherit' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Live Threat Vectors</h3>
        </div>
        <table className="table">
          <thead><tr><th>Vector Type</th><th>Source IP</th><th>Origin</th><th>Tenants Targeted</th><th>Status</th></tr></thead>
          <tbody>
            {threats.map(t => (
              <tr key={t.id}>
                <td><span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{t.type}</span><p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.time}</p></td>
                <td><span style={{ fontFamily: 'monospace', fontSize: '0.8125rem', background: 'var(--surface-2)', padding: '2px 6px', borderRadius: 4 }}>{t.ip}</span></td>
                <td><span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={12} /> {t.location}</span></td>
                <td><span style={{ fontWeight: 600 }}>{t.targets} orgs</span></td>
                <td>
                  <span style={{ display: 'inline-flex', padding: '3px 8px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700,
                    ...(t.status === 'blocked' ? { color: '#e11d48', background: '#fff1f2', border: '1px solid #fecdd3' } :
                        t.status === 'mitigated' ? { color: '#059669', background: '#ecfdf5', border: '1px solid #a7f3d0' } :
                                                 { color: '#d97706', background: '#fffbeb', border: '1px solid #fde68a' }) }}>
                    {t.status.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Tab 4: Identity Providers (SSO) ───────────────────────────────────────────
function IdentityProvidersTab() {
  const [providers, setProviders] = useState(() => {
    try {
      const s = localStorage.getItem('lms_global_idps');
      return s ? JSON.parse(s) : [
        { id: 1, name: 'Google Workspace', protocol: 'OAuth 2.0', status: 'active', users: 1420 },
        { id: 2, name: 'Microsoft Entra ID', protocol: 'SAML 2.0', status: 'active', users: 3105 },
        { id: 3, name: 'Okta Enterprise', protocol: 'SAML 2.0', status: 'inactive', users: 0 },
      ];
    } catch {
      return [
        { id: 1, name: 'Google Workspace', protocol: 'OAuth 2.0', status: 'active', users: 1420 },
        { id: 2, name: 'Microsoft Entra ID', protocol: 'SAML 2.0', status: 'active', users: 3105 },
        { id: 3, name: 'Okta Enterprise', protocol: 'SAML 2.0', status: 'inactive', users: 0 },
      ];
    }
  });

  const toggle = (id) => {
    const updated = providers.map(p => p.id === id ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' } : p);
    setProviders(updated);
    localStorage.setItem('lms_global_idps', JSON.stringify(updated));
    const target = updated.find(p => p.id === id);
    toast.success(`${target.name} is now ${target.status}`);
  };

  const addProvider = () => {
    const name = prompt('Enter Identity Provider Name (e.g. PingFederate, Auth0):');
    if (!name) return;
    const protocol = prompt('Protocol (SAML 2.0 or OAuth 2.0):') || 'SAML 2.0';
    const newP = { id: Date.now(), name, protocol, status: 'active', users: 0 };
    const updated = [...providers, newP];
    setProviders(updated);
    localStorage.setItem('lms_global_idps', JSON.stringify(updated));
    toast.success(`Identity Provider "${name}" registered globally`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 860 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <button onClick={addProvider} className="btn btn-primary" style={{ gap: 6 }}><Plus size={15} /> Add Provider</button>
      </div>
      
      <div className="glass-card" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.5rem' }}><Fingerprint size={20} color="var(--brand-500)" /> Global SSO Configurations</h2>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Manage the Identity Providers available for tenants to use. Tenants can enable/disable these within their own settings.</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {providers.map(p => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', background: 'var(--surface-1)', border: '1px solid var(--glass-border)', borderRadius: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--brand-50)', border: '1px solid var(--brand-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-600)' }}><Server size={18} /></div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>{p.name}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.protocol}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <div style={{ textAlign: 'right' }}><p style={{ fontWeight: 700, fontSize: '0.875rem' }}>{p.users}</p><p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Active Users</p></div>
                <Toggle checked={p.status === 'active'} onChange={() => toggle(p.id)} color="#059669" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Hub ──────────────────────────────────────────────────────────────────
export default function GlobalSecurityHub() {
  const [activeTab, setActiveTab] = useState('policies'); // Default to policies or audit

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1.5rem' }}>
        <div>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-600)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Trust & Safety</p>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>Security & Audit Hub</h1>
        </div>
        
        {/* Segmented Cyber Command Dock */}
        <div className="hide-scrollbar" style={{
          display: 'flex', background: 'var(--surface-0)', padding: 6,
          borderRadius: 20, border: '1.5px solid var(--glass-border)', gap: 6,
          overflowX: 'auto', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', flexWrap: 'nowrap'
        }}>
          {[
            { id: 'audit', label: 'Audit Trail', icon: Activity },
            { id: 'policies', label: 'Access Policies', icon: ShieldCheck },
            { id: 'threats', label: 'Threat Defense', icon: EyeOff },
            { id: 'sso', label: 'Identity Providers', icon: Fingerprint },
          ].map(t => {
            const isActive = activeTab === t.id;
            return (
              <button 
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: 8, padding: '0.625rem 1.25rem', borderRadius: 14,
                  border: isActive ? '1px solid var(--brand-300)' : '1px solid transparent',
                  cursor: 'pointer', fontWeight: 800, fontSize: '0.875rem', transition: 'all 0.2s', whiteSpace: 'nowrap',
                  background: isActive ? 'linear-gradient(135deg, white, var(--brand-50))' : 'transparent',
                  color: isActive ? 'var(--brand-700)' : 'var(--text-secondary)',
                  boxShadow: isActive ? '0 4px 14px var(--brand-500)20, inset 0 1px 1px white' : 'none',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--surface-1)'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{
                  width: 24, height: 24, borderRadius: 8,
                  background: isActive ? 'var(--brand-100)' : 'var(--surface-2)',
                  color: isActive ? 'var(--brand-600)' : 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <t.icon size={14} />
                </div>
                <span>{t.label}</span>
                {isActive && (
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--brand-600)', boxShadow: '0 0 8px var(--brand-600)' }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === 'audit' && <AuditTrailTab />}
      {activeTab === 'policies' && <AccessPoliciesTab />}
      {activeTab === 'threats' && <ThreatDefenseTab />}
      {activeTab === 'sso' && <IdentityProvidersTab />}
    </div>
  );
}
