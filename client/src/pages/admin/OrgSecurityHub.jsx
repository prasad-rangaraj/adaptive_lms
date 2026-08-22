import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tenantsAPI } from '../../services/api.service';
import { useAuthStore } from '../../store/authStore';
import {
  ShieldCheck, History, Key, Lock, Search, AlertCircle, 
  Smartphone, MapPin, Monitor, Globe, CheckCircle2, ShieldAlert
} from 'lucide-react';
import Loader from '../../components/ui/Loader';

// ── Shared UI ───────────────────────────────────────────────────────────────
function Toggle({ checked, onChange, color = 'var(--brand-500)' }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} style={{ width: 44, height: 24, borderRadius: 999, padding: 3, background: checked ? color : 'var(--surface-3)', border: '1px solid var(--glass-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: checked ? 'flex-end' : 'flex-start', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', flexShrink: 0, boxShadow: checked ? `0 0 12px ${color}40` : 'none' }}>
      <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }} />
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
          {Icon ? <Icon size={20} /> : <ShieldCheck size={20} />}
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

// ── Tab 1: Access Policies ──────────────────────────────────────────────────
function AccessPoliciesTab() {
  const [settings, setSettings] = useState({ mfa: true, strictIp: false, geoBlock: true });
  const set = (k) => (v) => setSettings(s => ({ ...s, [k]: v }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.5rem' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Lock size={18} color="#4f46e5" /></div>
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)' }}>Identity & Access</h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>Enforce strict login requirements for your organization.</p>
          </div>
        </div>

        <SettingRow icon={Smartphone} title="Require Multi-Factor Authentication (MFA)" description="Force all users in this tenant to configure 2FA before accessing courses." value={settings.mfa} onChange={set('mfa')} color="#4f46e5" />
        <SettingRow icon={Monitor} title="IP Whitelisting" description="Restrict logins exclusively to the campus IP addresses listed below." value={settings.strictIp} onChange={set('strictIp')} color="#059669" />
        <SettingRow icon={Globe} title="Geo-Blocking" description="Prevent logins from high-risk countries based on global threat intel." value={settings.geoBlock} onChange={set('geoBlock')} color="#3b82f6" />
      </div>

      {settings.strictIp && (
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>Whitelisted IP Ranges</h3>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <input type="text" placeholder="e.g. 192.168.1.0/24" className="input-field" style={{ flex: 1 }} />
            <button className="btn btn-primary">Add Range</button>
          </div>
          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'var(--surface-1)', borderRadius: 8, border: '1px solid var(--glass-border)' }}>
              <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>142.250.0.0/15</span>
              <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700 }}>Active (Main Campus)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tab 2: Audit Logs ───────────────────────────────────────────────────────
function AuditLogsTab() {
  const { user } = useAuthStore();
  const { data, isLoading } = useQuery({
    queryKey: ['org-audit', user?.tenant_id],
    queryFn: () => tenantsAPI.getAuditLogs(user?.tenant_id),
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: 14, top: 11, color: 'var(--text-muted)' }} />
          <input type="text" placeholder="Search events..." className="input-field" style={{ width: '100%', paddingLeft: 42, background: 'var(--surface-1)' }} />
        </div>
        <select className="input-field" style={{ width: 160, background: 'var(--surface-1)' }}>
          <option>All Severities</option>
          <option>High (Alerts)</option>
          <option>Medium (Warnings)</option>
          <option>Low (Info)</option>
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem 0' }}>
        {isLoading ? (
          <div style={{ padding: '4rem', textAlign: 'center' }}><Loader /></div>
        ) : data?.logs?.length ? (
          data.logs.map((log, i) => (
            <div key={log.id} style={{ display: 'flex', gap: '1.5rem', position: 'relative' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 40, flexShrink: 0 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--surface-1)', border: '2px solid var(--brand-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
                  <History size={16} color="var(--brand-500)" />
                </div>
                {i !== data.logs.length - 1 && <div style={{ width: 2, flex: 1, background: 'var(--glass-border)', marginTop: 8 }} />}
              </div>
              
              <div className="glass-card" style={{ flex: 1, padding: '1.25rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-primary)' }}>{log.action}</span>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--brand-600)', background: 'var(--brand-50)', padding: '2px 8px', borderRadius: 6 }}>{log.target_resource}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    <span style={{ fontWeight: 600 }}>{log.actor_name}</span>
                    <span style={{ color: 'var(--glass-border)' }}>•</span>
                    <span>{log.ip_address}</span>
                  </div>
                </div>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>{new Date(log.created_at).toLocaleString()}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No audit logs found.</div>
        )}
      </div>
    </div>
  );
}

// ── Tab 3: API Keys ─────────────────────────────────────────────────────────
function ApiKeysTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="glass-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10 }}><Key size={22} color="var(--brand-500)" /> Developer API Keys</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 4 }}>Manage API keys to integrate your internal systems with Adaptive LMS.</p>
          </div>
          <button className="btn btn-primary" style={{ gap: 8 }}>Generate New Key</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          <div style={{ padding: '1.5rem', background: 'linear-gradient(145deg, var(--surface-1), transparent)', border: '1px solid var(--glass-border)', borderRadius: 16, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 4, background: '#10b981' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>SIS Integration (Banner)</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>Created Jan 12, 2026</p>
              </div>
              <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#10b981', background: '#ecfdf5', padding: '2px 8px', borderRadius: 999 }}>ACTIVE</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface-2)', padding: '0.75rem 1rem', borderRadius: 8, marginBottom: '1rem' }}>
              <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>sk_live_8f92••••••••••••••</span>
              <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>Copy</button>
            </div>
            
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}><CheckCircle2 size={12} color="#10b981" /> Last used 2 mins ago</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Hub ──────────────────────────────────────────────────────────────────
export default function OrgSecurityHub() {
  const [activeTab, setActiveTab] = useState('policies');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1.5rem' }}>
        <div style={{ flexShrink: 0 }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--brand-500)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Trust & Safety</p>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.04em', lineHeight: 1.1 }}>Security Hub</h1>
        </div>
        
        <div className="hide-scrollbar" style={{ display: 'flex', background: 'var(--surface-1)', padding: 6, borderRadius: 16, border: '1px solid var(--glass-border)', gap: 4, overflowX: 'auto', flexWrap: 'nowrap' }}>
          {[
            { id: 'policies', label: 'Access Policies', icon: ShieldCheck },
            { id: 'audit', label: 'Audit Logs', icon: History },
            { id: 'api', label: 'API Keys', icon: Key },
          ].map(t => (
            <button 
              key={t.id} onClick={() => setActiveTab(t.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.625rem 1.25rem', borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '0.875rem', transition: 'all 0.2s', whiteSpace: 'nowrap', background: activeTab === t.id ? 'white' : 'transparent', color: activeTab === t.id ? 'var(--brand-600)' : 'var(--text-muted)', boxShadow: activeTab === t.id ? '0 4px 12px rgba(0,0,0,0.08)' : 'none' }}>
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'policies' && <AccessPoliciesTab />}
      {activeTab === 'audit' && <AuditLogsTab />}
      {activeTab === 'api' && <ApiKeysTab />}
    </div>
  );
}
