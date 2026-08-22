import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '../../services/api.service';
import {
  Activity, RefreshCw, UserPlus, BookOpen, Shield,
  ShieldAlert, Globe, User as UserIcon, Search, Filter,
  CheckCircle, AlertTriangle, AlertOctagon, Info, Download, 
  Calendar, Lock, Key, Server, EyeOff, ShieldCheck, MapPin, Fingerprint, Plus
} from 'lucide-react';
import Loader from '../../components/ui/Loader';

const ACTION_CONFIG = {
  user_created:       { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', icon: UserPlus,       label: 'User Created',        severity: 'success' },
  course_published:   { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', icon: BookOpen,       label: 'Course Published',    severity: 'success' },
  tenant_suspended:   { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', icon: AlertOctagon,   label: 'Tenant Suspended',    severity: 'danger' },
  user_deleted:       { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', icon: AlertOctagon,   label: 'User Deleted',        severity: 'danger' },
  impersonation_started: { color: '#d97706', bg: '#fffbeb', border: '#fde68a', icon: Shield,      label: 'Impersonation',       severity: 'warning' },
  default:            { color: '#0e7490', bg: '#ecfeff', border: '#a5f3fc', icon: Info,           label: 'System Event',        severity: 'info' },
};

function getActionConfig(action) { return ACTION_CONFIG[action] || ACTION_CONFIG.default; }

const SEVERITY_FILTERS = [
  { key: 'all',     label: 'All Events',  icon: Filter },
  { key: 'success', label: 'Success',     icon: CheckCircle },
  { key: 'danger',  label: 'Critical',    icon: AlertOctagon },
  { key: 'warning', label: 'Security',    icon: AlertTriangle },
  { key: 'info',    label: 'Info',        icon: Info },
];

function Toggle({ checked, onChange, color = 'var(--brand-500)' }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} style={{ width: 48, height: 26, borderRadius: 999, padding: 3, background: checked ? color : '#d1d5db', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: checked ? 'flex-end' : 'flex-start', transition: 'background 0.2s ease', flexShrink: 0 }}>
      <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'all 0.2s ease' }} />
    </button>
  );
}

function SettingRow({ title, description, value, onChange, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '2rem', padding: '1.25rem 0', borderBottom: '1px solid var(--glass-border)' }}>
      <div style={{ flex: 1 }}>
        <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9375rem', marginBottom: 4 }}>{title}</p>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{description}</p>
      </div>
      <Toggle checked={value} onChange={onChange} color={color} />
    </div>
  );
}

// ── Tab 1: Audit Trail ────────────────────────────────────────────────────────
function AuditTrailTab() {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');

  const { data: logs, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => adminAPI.listAuditLogs().then(r => r.data),
  });

  const filtered = logs?.filter(log => {
    const matchSearch = log.action.toLowerCase().includes(search.toLowerCase()) || log.resource.toLowerCase().includes(search.toLowerCase());
    const cfg = getActionConfig(log.action);
    const matchSeverity = severityFilter === 'all' || cfg.severity === severityFilter;
    return matchSearch && matchSeverity;
  });

  const counts = logs?.reduce((acc, log) => {
    const cfg = getActionConfig(log.action);
    acc[cfg.severity] = (acc[cfg.severity] || 0) + 1;
    return acc;
  }, {}) || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
        {SEVERITY_FILTERS.map(({ key, label, icon: Icon }) => {
          const active = severityFilter === key;
          const colorMap = { success: '#059669', danger: '#e11d48', warning: '#d97706', info: '#4f46e5' };
          const bgMap = { success: '#ecfdf5', danger: '#fff1f2', warning: '#fffbeb', info: '#eef2ff' };
          const c = colorMap[key] || 'var(--brand-500)';
          const bg = bgMap[key] || 'var(--brand-50)';
          return (
            <button key={key} onClick={() => setSeverityFilter(key)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 999, border: `2px solid ${active ? c : 'var(--glass-border)'}`, background: active ? bg : 'transparent', color: active ? c : 'var(--text-muted)', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}>
              <Icon size={13} /> {label}
              {key !== 'all' && <span style={{ background: active ? c : 'var(--surface-3)', color: active ? 'white' : 'var(--text-secondary)', borderRadius: 999, padding: '1px 7px', fontSize: '0.6875rem', fontWeight: 700 }}>{counts[key] || 0}</span>}
            </button>
          );
        })}
      </div>

      <div className="glass-card" style={{ padding: 0 }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', background: 'var(--surface-1)', borderTopLeftRadius: 'inherit', borderTopRightRadius: 'inherit' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
            <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input type="text" placeholder="Filter by action or resource..." value={search} onChange={e => setSearch(e.target.value)} className="input-field" style={{ paddingLeft: '2.25rem', width: '100%', height: 36, fontSize: '0.875rem' }} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => refetch()} disabled={isFetching} className="btn btn-ghost btn-icon btn-sm"><RefreshCw size={14} style={{ animation: isFetching ? 'spin 1s linear infinite' : 'none' }} /></button>
            <button className="btn btn-secondary btn-sm" style={{ gap: 6 }}><Download size={14} /> Export</button>
          </div>
        </div>

        {isLoading ? (
          <Loader text="Loading audit events..." />
        ) : !filtered?.length ? (
          <div style={{ padding: '4rem', textAlign: 'center' }}><ShieldAlert size={32} color="var(--text-muted)" style={{ margin: '0 auto 1rem', opacity: 0.4 }} /><p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>No events match your filters.</p></div>
        ) : (
          <div style={{ padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: 0 }}>
            {filtered.map((log, i) => {
              const cfg = getActionConfig(log.action);
              const Icon = cfg.icon;
              const isLast = i === filtered.length - 1;
              return (
                <div key={log.id} style={{ display: 'flex', gap: '1.25rem', position: 'relative', paddingBottom: isLast ? 0 : '1.5rem' }}>
                  {!isLast && <div style={{ position: 'absolute', left: 19, top: 40, bottom: 0, width: 2, background: 'var(--surface-3)' }} />}
                  <div style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0, background: cfg.bg, border: `2px solid ${cfg.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}><Icon size={16} color={cfg.color} /></div>
                  <div style={{ flex: 1, paddingTop: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                      <div>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{log.action.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: 4, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`, padding: '2px 7px', borderRadius: 4 }}>{log.resource}</span>
                          {log.user_id && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}><UserIcon size={11} /> User #{log.user_id}</span>}
                          {log.tenant_id && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}><Globe size={11} /> Org #{log.tenant_id}</span>}
                        </div>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', flexShrink: 0, marginTop: 2 }}>
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

// ── Tab 2: Access Policies ────────────────────────────────────────────────────
function AccessPoliciesTab() {
  const [settings, setSettings] = useState({ mfa: true, ssoOnly: false, complexPasswords: true, sessionTimeout: true });
  const set = (key) => (val) => setSettings(s => ({ ...s, [key]: val }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 780 }}>
      <div className="glass-card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.25rem' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f5f3ff', border: '1px solid #ddd6fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ShieldCheck size={16} color="#7c3aed" /></div>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Global Identity Policies</h2>
        </div>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>These security policies are enforced on all tenants across the platform.</p>

        <SettingRow title="Require Multi-Factor Authentication (MFA)" description="Forces all Tenant Admins and Teachers to configure 2FA before accessing their dashboards." value={settings.mfa} onChange={set('mfa')} color="#7c3aed" />
        <SettingRow title="Enterprise SSO Only" description="Disables username/password login globally. Users must authenticate via an identity provider (Okta, Azure AD)." value={settings.ssoOnly} onChange={set('ssoOnly')} color="#7c3aed" />
        <SettingRow title="Strict Password Complexity" description="Requires 12+ characters, upper/lowercase, numbers, and symbols for all local accounts." value={settings.complexPasswords} onChange={set('complexPasswords')} color="#7c3aed" />
        <div style={{ borderBottom: 'none' }}>
          <SettingRow title="Idle Session Timeout" description="Automatically log users out after 30 minutes of inactivity to prevent unauthorized access." value={settings.sessionTimeout} onChange={set('sessionTimeout')} color="#7c3aed" />
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
  const [providers, setProviders] = useState([
    { id: 1, name: 'Google Workspace', protocol: 'OAuth 2.0', status: 'active', users: 1420 },
    { id: 2, name: 'Microsoft Entra ID', protocol: 'SAML 2.0', status: 'active', users: 3105 },
    { id: 3, name: 'Okta Enterprise', protocol: 'SAML 2.0', status: 'inactive', users: 0 },
  ]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 860 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <button className="btn btn-primary" style={{ gap: 6 }}><Plus size={15} /> Add Provider</button>
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
                <Toggle checked={p.status === 'active'} onChange={() => {}} color="#059669" />
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
  const [activeTab, setActiveTab] = useState('audit'); // 'audit' | 'policies' | 'threats'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1.5rem' }}>
        <div>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-600)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Trust & Safety</p>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>Security & Audit Hub</h1>
        </div>
        
        <div style={{ display: 'flex', background: 'var(--surface-1)', padding: 6, borderRadius: 16, border: '1px solid var(--glass-border)', gap: 4, overflowX: 'auto' }}>
          {[
            { id: 'audit', label: 'Audit Trail', icon: Activity },
            { id: 'policies', label: 'Access Policies', icon: ShieldCheck },
            { id: 'threats', label: 'Threat Defense', icon: EyeOff },
            { id: 'sso', label: 'Identity Providers', icon: Fingerprint },
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

      {activeTab === 'audit' && <AuditTrailTab />}
      {activeTab === 'policies' && <AccessPoliciesTab />}
      {activeTab === 'threats' && <ThreatDefenseTab />}
      {activeTab === 'sso' && <IdentityProvidersTab />}
    </div>
  );
}
