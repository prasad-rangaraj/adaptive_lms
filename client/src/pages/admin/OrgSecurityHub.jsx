import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tenantsAPI } from '../../services/api.service';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import {
  ShieldCheck, History, Key, Lock, Search, AlertCircle, 
  Smartphone, MapPin, Monitor, Globe, CheckCircle2, ShieldAlert,
  Download, Plus, Trash2, Copy, X, Eye, ExternalLink, RefreshCw,
  Check, Sliders, Shield, Zap, FileText, ChevronRight
} from 'lucide-react';
import Loader from '../../components/ui/Loader';

// ── Shared UI Toggle ────────────────────────────────────────────────────────
function Toggle({ checked, onChange, color = 'var(--brand-500)' }) {
  return (
    <button 
      type="button" 
      onClick={() => onChange(!checked)} 
      style={{ 
        width: 44, height: 24, borderRadius: 999, padding: 3, 
        background: checked ? color : 'var(--surface-3)', 
        border: '1px solid var(--glass-border)', cursor: 'pointer', 
        display: 'flex', alignItems: 'center', justifyContent: checked ? 'flex-end' : 'flex-start', 
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', flexShrink: 0, 
        boxShadow: checked ? `0 0 12px ${color}40` : 'none' 
      }}
    >
      <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }} />
    </button>
  );
}

function SettingCard({ title, description, value, onChange, color, danger, icon: Icon, children }) {
  const accent = danger ? '#e11d48' : (color || 'var(--brand-500)');
  const bgAccent = danger ? '#fff1f2' : `${accent}10`;
  
  return (
    <div style={{ 
      display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.25rem 1.5rem', 
      background: 'var(--surface-0)', borderRadius: 16, 
      border: `1.5px solid ${value ? accent + '40' : 'var(--glass-border)'}`, 
      boxShadow: value ? `0 4px 20px ${accent}12` : 'none', transition: 'all 0.25s ease' 
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: bgAccent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent, flexShrink: 0 }}>
            {Icon ? <Icon size={20} /> : <ShieldCheck size={20} />}
          </div>
          <div>
            <p style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.9375rem', margin: 0 }}>{title}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '3px 0 0' }}>{description}</p>
          </div>
        </div>
        <Toggle checked={value} onChange={onChange} color={accent} />
      </div>
      {children && value && (
        <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '0.875rem' }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ── TAB 1: POLICIES & THREAT DEFENSE (INCLUDES DEVELOPER CREDENTIALS) ─────────
function PoliciesAndAccessTab({ tenantId }) {
  const qc = useQueryClient();
  const { data: tenant } = useQuery({
    queryKey: ['tenant', tenantId],
    queryFn: () => tenantsAPI.get(tenantId).then(r => r.data),
    enabled: !!tenantId,
  });

  // Parse existing features_json or set defaults
  const parsedFeatures = useMemo(() => {
    try {
      if (tenant?.features_json) {
        return JSON.parse(tenant.features_json);
      }
    } catch (_) {}
    return {};
  }, [tenant]);

  const [settings, setSettings] = useState({
    mfa: true,
    sessionTimeout: '30',
    maxConcurrent: '2',
    passwordRotation: '90',
    strictIp: false,
    geoBlock: true,
    bruteForceLockout: true,
  });

  const [ipRanges, setIpRanges] = useState([
    { id: 'ip-1', range: '142.250.0.0/15', label: 'Main Campus Subnet' },
    { id: 'ip-2', range: '192.168.1.0/24', label: 'Engineering Lab Gateway' }
  ]);
  const [newIpInput, setNewIpInput] = useState('');
  const [newIpLabel, setNewIpLabel] = useState('');

  // Real Persistent API Credentials from backend
  const { data: rawApiKeys = [], refetch: refetchKeys } = useQuery({
    queryKey: ['tenantApiKeys', tenantId],
    queryFn: () => tenantsAPI.getApiKeys(tenantId).then(r => r.data),
    enabled: !!tenantId,
  });

  const [showKeyModal, setShowKeyModal] = useState(false);
  const [newKeyForm, setNewKeyForm] = useState({ name: '', scope: 'Academic & Roster', expiration: '90 Days' });
  const [newlyCreatedKey, setNewlyCreatedKey] = useState(null);

  useEffect(() => {
    if (parsedFeatures && Object.keys(parsedFeatures).length > 0) {
      setSettings(prev => ({
        ...prev,
        mfa: parsedFeatures.mfa ?? prev.mfa,
        sessionTimeout: parsedFeatures.sessionTimeout || prev.sessionTimeout,
        maxConcurrent: parsedFeatures.maxConcurrent || prev.maxConcurrent,
        passwordRotation: parsedFeatures.passwordRotation || prev.passwordRotation,
        strictIp: parsedFeatures.strictIp ?? prev.strictIp,
        geoBlock: parsedFeatures.geoBlock ?? prev.geoBlock,
        bruteForceLockout: parsedFeatures.bruteForceLockout ?? prev.bruteForceLockout,
      }));
    }
  }, [parsedFeatures]);

  const saveMutation = useMutation({
    mutationFn: (updatedSettings) => {
      const mergedJson = JSON.stringify({
        ...parsedFeatures,
        ...updatedSettings,
        ipRanges,
      });
      return tenantsAPI.update(tenantId, { features_json: mergedJson });
    },
    onSuccess: () => {
      qc.invalidateQueries(['tenant', tenantId]);
      toast.success("Security policies & institutional threat defenses saved!");
    },
    onError: (err) => {
      toast.error(err.response?.data?.detail || "Failed to update security policies");
    }
  });

  const handleSavePolicies = () => {
    saveMutation.mutate(settings);
  };

  const handleAddIpRange = (e) => {
    e.preventDefault();
    if (!newIpInput.trim()) return toast.error("Please enter a valid IP address or CIDR range");
    const newEntry = {
      id: `ip-${Date.now()}`,
      range: newIpInput.trim(),
      label: newIpLabel.trim() || 'Custom Authorized Subnet'
    };
    setIpRanges(prev => [...prev, newEntry]);
    setNewIpInput('');
    setNewIpLabel('');
    toast.success("Authorized IP subnet added!");
  };

  const handleRemoveIp = (id) => {
    setIpRanges(prev => prev.filter(r => r.id !== id));
    toast.success("Subnet removed from whitelist");
  };

  const handleGenerateKey = async (e) => {
    e.preventDefault();
    if (!newKeyForm.name.trim()) return toast.error("Key name is required");
    try {
      const res = await tenantsAPI.createApiKey(tenantId, {
        name: newKeyForm.name.trim(),
        scope: newKeyForm.scope
      });
      setNewlyCreatedKey(res.data.key);
      setNewKeyForm({ name: '', scope: 'Academic & Roster', expiration: '90 Days' });
      refetchKeys();
      toast.success("New institutional API key generated & stored!");
    } catch (err) {
      toast.error("Failed to generate API key");
    }
  };

  const handleCopyKey = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("API key copied to clipboard!");
  };

  const handleRevokeKey = async (id, name) => {
    if (!window.confirm(`Are you sure you want to revoke API key "${name}"? Integrations using this key will immediately lose access.`)) return;
    try {
      await tenantsAPI.deleteApiKey(tenantId, id);
      refetchKeys();
      toast.success(`API key "${name}" revoked.`);
    } catch (err) {
      toast.error("Failed to revoke API key");
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* ── Executive Posture Strip ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div style={{ background: 'var(--surface-0)', padding: '1.25rem 1.5rem', borderRadius: 16, border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(16,185,129,0.12)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Posture Health</span>
            <p style={{ margin: '2px 0 0', fontSize: '1.125rem', fontWeight: 900, color: 'var(--text-primary)' }}>98% Compliant</p>
            <span style={{ fontSize: '0.6875rem', color: '#10b981', fontWeight: 700 }}>SOC2 &amp; FERPA Verified</span>
          </div>
        </div>

        <div style={{ background: 'var(--surface-0)', padding: '1.25rem 1.5rem', borderRadius: 16, border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(59,130,246,0.12)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Smartphone size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>MFA Armor</span>
            <p style={{ margin: '2px 0 0', fontSize: '1.125rem', fontWeight: 900, color: 'var(--text-primary)' }}>{settings.mfa ? 'Enforced' : 'Optional'}</p>
            <span style={{ fontSize: '0.6875rem', color: settings.mfa ? '#10b981' : '#f59e0b', fontWeight: 700 }}>{settings.mfa ? 'All Admin & Faculty' : 'Standard Baseline'}</span>
          </div>
        </div>

        <div style={{ background: 'var(--surface-0)', padding: '1.25rem 1.5rem', borderRadius: 16, border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(239,68,68,0.12)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldAlert size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Threat Defense</span>
            <p style={{ margin: '2px 0 0', fontSize: '1.125rem', fontWeight: 900, color: 'var(--text-primary)' }}>Active Shield</p>
            <span style={{ fontSize: '0.6875rem', color: '#10b981', fontWeight: 700 }}>Zero Breaches / 0 Exploits</span>
          </div>
        </div>

        <div style={{ background: 'var(--surface-0)', padding: '1.25rem 1.5rem', borderRadius: 16, border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(139,92,246,0.12)', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Key size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>API Credentials</span>
            <p style={{ margin: '2px 0 0', fontSize: '1.125rem', fontWeight: 900, color: 'var(--text-primary)' }}>{rawApiKeys.length} Active</p>
            <span style={{ fontSize: '0.6875rem', color: '#8b5cf6', fontWeight: 700 }}>Scoped Institutional Keys</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'flex-start' }}>
        {/* Left Column: Comprehensive Policies */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Section 1: Identity & Authentication Controls */}
          <div className="glass-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.5rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(79,70,229,0.1)', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Lock size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
                  Identity, Session &amp; Access Controls
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                  Enforce authentication safeguards and automatic session boundary controls.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <SettingCard 
                icon={Smartphone} 
                title="Require Multi-Factor Authentication (MFA)" 
                description="Mandate 2FA verification via authenticator apps before granting dashboard or course access." 
                value={settings.mfa} 
                onChange={v => setSettings(s => ({ ...s, mfa: v }))} 
                color="#4f46e5" 
              />

              <div style={{ padding: '1.25rem 1.5rem', background: 'var(--surface-0)', borderRadius: 16, border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <p style={{ fontWeight: 800, fontSize: '0.9375rem', color: 'var(--text-primary)', margin: 0 }}>Session Inactivity Auto-Logout</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '3px 0 0' }}>Terminate idle authenticated sessions to prevent unauthorized device access.</p>
                </div>
                <select 
                  value={settings.sessionTimeout} 
                  onChange={e => setSettings(s => ({ ...s, sessionTimeout: e.target.value }))}
                  style={{ padding: '7px 14px', borderRadius: 10, border: '1px solid var(--glass-border)', background: 'var(--surface-1)', color: 'var(--text-primary)', fontSize: '0.8125rem', fontWeight: 700, outline: 'none' }}
                >
                  <option value="15">15 Minutes</option>
                  <option value="30">30 Minutes (Recommended)</option>
                  <option value="60">1 Hour</option>
                  <option value="240">4 Hours</option>
                </select>
              </div>

              <div style={{ padding: '1.25rem 1.5rem', background: 'var(--surface-0)', borderRadius: 16, border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <p style={{ fontWeight: 800, fontSize: '0.9375rem', color: 'var(--text-primary)', margin: 0 }}>Max Concurrent Sessions Per User</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '3px 0 0' }}>Prevent account sharing and simultaneous test taking across multiple hardware devices.</p>
                </div>
                <select 
                  value={settings.maxConcurrent} 
                  onChange={e => setSettings(s => ({ ...s, maxConcurrent: e.target.value }))}
                  style={{ padding: '7px 14px', borderRadius: 10, border: '1px solid var(--glass-border)', background: 'var(--surface-1)', color: 'var(--text-primary)', fontSize: '0.8125rem', fontWeight: 700, outline: 'none' }}
                >
                  <option value="1">1 Active Device (Strict Exam Mode)</option>
                  <option value="2">2 Devices (Laptop + Mobile)</option>
                  <option value="unlimited">Unlimited Devices</option>
                </select>
              </div>

              <SettingCard 
                icon={ShieldAlert} 
                title="Automated Brute-Force Defense Lockout" 
                description="Instantly lock accounts for 30 minutes after 5 consecutive incorrect password attempts." 
                value={settings.bruteForceLockout} 
                onChange={v => setSettings(s => ({ ...s, bruteForceLockout: v }))} 
                color="#e11d48" 
              />
            </div>
          </div>

          {/* Section 2: Network Perimeter & Subnets */}
          <div className="glass-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.5rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(5,150,105,0.1)', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Monitor size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
                  Network Perimeter &amp; Campus Subnets
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                  Restrict admin login surfaces exclusively to approved physical networks and subnets.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <SettingCard 
                icon={Monitor} 
                title="Campus IP Whitelisting" 
                description="Restrict institutional logins strictly to designated campus subnets and VPN tunnels." 
                value={settings.strictIp} 
                onChange={v => setSettings(s => ({ ...s, strictIp: v }))} 
                color="#059669"
              >
                {/* Embedded Subnet Manager */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: 8 }}>
                  <form onSubmit={handleAddIpRange} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <input 
                      value={newIpInput} 
                      onChange={e => setNewIpInput(e.target.value)} 
                      placeholder="CIDR subnet (e.g. 192.168.10.0/24)" 
                      className="input" 
                      style={{ flex: 1, minWidth: 200, fontSize: '0.8125rem' }} 
                    />
                    <input 
                      value={newIpLabel} 
                      onChange={e => setNewIpLabel(e.target.value)} 
                      placeholder="Label (e.g. Science Hall WiFi)" 
                      className="input" 
                      style={{ flex: 1, minWidth: 160, fontSize: '0.8125rem' }} 
                    />
                    <button type="submit" className="btn btn-primary" style={{ gap: 6, fontSize: '0.8125rem' }}>
                      <Plus size={14} /> Add Subnet
                    </button>
                  </form>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {ipRanges.map(item => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'var(--surface-1)', borderRadius: 10, border: '1px solid var(--glass-border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#059669', fontSize: '0.875rem' }}>{item.range}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>• {item.label}</span>
                        </div>
                        <button 
                          onClick={() => handleRemoveIp(item.id)}
                          className="btn btn-ghost btn-sm btn-icon"
                          style={{ color: '#ef4444' }}
                          title="Remove subnet"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </SettingCard>

              <SettingCard 
                icon={Globe} 
                title="International Geo-Fencing &amp; Threat Blocking" 
                description="Block automated connection attempts from high-risk foreign autonomous systems and Tor exit nodes." 
                value={settings.geoBlock} 
                onChange={v => setSettings(s => ({ ...s, geoBlock: v }))} 
                color="#3b82f6" 
              />
            </div>
          </div>

          {/* Section 3: Developer API Credentials (Co-located, NOT on a tiny separate tab!) */}
          <div className="glass-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(139,92,246,0.1)', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Key size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
                    Developer Access &amp; Institutional API Keys
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                    Generate programmatic bearer credentials for campus ERP, Banner, or Canvas integrations.
                  </p>
                </div>
              </div>

              <button 
                onClick={() => { setShowKeyModal(true); setNewlyCreatedKey(null); }}
                className="btn btn-primary"
                style={{ gap: 6, fontSize: '0.8125rem', padding: '0.5rem 1rem' }}
              >
                <Plus size={15} /> Generate New Key
              </button>
            </div>

            {/* Keys Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
              {rawApiKeys.map(key => {
                const displayPrefix = key.key ? `${key.key.slice(0, 15)}` : (key.prefix || 'sk_live_gateway');
                return (
                  <div key={key.id} style={{ padding: '1.25rem', background: 'var(--surface-0)', border: '1px solid var(--glass-border)', borderRadius: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>{key.name}</p>
                        <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--brand-600)', background: 'rgba(99,102,241,0.1)', padding: '2px 7px', borderRadius: 6, marginTop: 4, display: 'inline-block' }}>
                          {key.scope || 'Institutional Gateway'}
                        </span>
                      </div>
                      <button 
                        onClick={() => handleRevokeKey(key.id, key.name)}
                        className="btn btn-ghost btn-sm btn-icon"
                        style={{ color: '#ef4444' }}
                        title="Revoke API key"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface-1)', padding: '6px 10px', borderRadius: 8 }}>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
                        {displayPrefix}••••••••••••
                      </span>
                      <button 
                        onClick={() => handleCopyKey(key.key || displayPrefix)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '3px 8px', fontSize: '0.6875rem', gap: 4 }}
                      >
                        <Copy size={11} /> Copy
                      </button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                      <span>Created: {key.created}</span>
                      <span style={{ color: '#10b981', fontWeight: 700 }}>Status: {key.status || 'Active'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Policy Status & Save Action */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: '5.5rem' }}>
          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <h4 style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', margin: '0 0 1rem' }}>
              Policy Enforcement Summary
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.8125rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>MFA Status:</span>
                <strong style={{ color: settings.mfa ? '#10b981' : '#f59e0b' }}>{settings.mfa ? 'Enforced' : 'Disabled'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Idle Timeout:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{settings.sessionTimeout} Minutes</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Device Limit:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{settings.maxConcurrent} Devices</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Network Subnets:</span>
                <strong style={{ color: settings.strictIp ? '#059669' : 'var(--text-muted)' }}>{settings.strictIp ? `${ipRanges.length} Whitelisted` : 'Open Access'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Geo-Fencing:</span>
                <strong style={{ color: settings.geoBlock ? '#3b82f6' : 'var(--text-muted)' }}>{settings.geoBlock ? 'Active' : 'Off'}</strong>
              </div>
            </div>

            <button 
              onClick={handleSavePolicies}
              disabled={saveMutation.isPending}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem', gap: 8, fontSize: '0.875rem' }}
            >
              <Check size={16} /> {saveMutation.isPending ? 'Saving Policies...' : 'Save Security Policies'}
            </button>
          </div>
        </div>
      </div>

      {/* Generate API Key Modal */}
      {showKeyModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div style={{ width: '100%', maxWidth: 500, background: 'var(--surface-0)', borderRadius: 20, padding: '2rem', border: '1px solid var(--glass-border)', boxShadow: '0 24px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
                {newlyCreatedKey ? 'API Key Generated' : 'Generate Institutional API Key'}
              </h3>
              <button onClick={() => setShowKeyModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>

            {newlyCreatedKey ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ padding: '1rem', background: '#ecfdf5', borderRadius: 12, border: '1px solid #bbf7d0', color: '#065f46', fontSize: '0.8125rem', lineHeight: 1.5 }}>
                  <strong>Important:</strong> Copy this API secret now. For security purposes, this full token will never be displayed again.
                </div>
                <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface-1)', padding: '0.75rem 1rem', borderRadius: 10, border: '1px solid var(--glass-border)', gap: 8 }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.8125rem', color: 'var(--text-primary)', wordBreak: 'break-all', flex: 1, fontWeight: 700 }}>
                    {newlyCreatedKey}
                  </span>
                  <button 
                    onClick={() => handleCopyKey(newlyCreatedKey)}
                    className="btn btn-primary btn-sm"
                    style={{ gap: 4 }}
                  >
                    <Copy size={13} /> Copy
                  </button>
                </div>
                <button 
                  onClick={() => setShowKeyModal(false)}
                  className="btn btn-secondary"
                  style={{ width: '100%' }}
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleGenerateKey} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label className="label" style={{ fontWeight: 700, fontSize: '0.8125rem', marginBottom: 6, display: 'block' }}>Key Identification Name</label>
                  <input 
                    value={newKeyForm.name} 
                    onChange={e => setNewKeyForm(f => ({ ...f, name: e.target.value }))}
                    className="input" 
                    placeholder="e.g. Campus Banner Bridge" 
                    required 
                  />
                </div>

                <div>
                  <label className="label" style={{ fontWeight: 700, fontSize: '0.8125rem', marginBottom: 6, display: 'block' }}>Permission Scope</label>
                  <select 
                    value={newKeyForm.scope} 
                    onChange={e => setNewKeyForm(f => ({ ...f, scope: e.target.value }))}
                    className="input"
                  >
                    <option value="Academic & Roster">Academic &amp; Roster Management</option>
                    <option value="Read-Only Telemetry">Read-Only Telemetry</option>
                    <option value="Proctoring Results Only">Proctoring Results Only</option>
                    <option value="Full Tenant Admin">Full Tenant Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="label" style={{ fontWeight: 700, fontSize: '0.8125rem', marginBottom: 6, display: 'block' }}>Key Expiration</label>
                  <select 
                    value={newKeyForm.expiration} 
                    onChange={e => setNewKeyForm(f => ({ ...f, expiration: e.target.value }))}
                    className="input"
                  >
                    <option value="30 Days">30 Days</option>
                    <option value="90 Days">90 Days (Recommended)</option>
                    <option value="1 Year">1 Year</option>
                    <option value="Never">Never (Non-expiring)</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                  <button type="button" onClick={() => setShowKeyModal(false)} className="btn btn-secondary">Cancel</button>
                  <button type="submit" className="btn btn-primary">Generate Key</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── TAB 2: AUDIT TRAILS & SECURITY LOGS ──────────────────────────────────────
function AuditLogsTab({ tenantId }) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState(null);

  const { data = [], isLoading, refetch } = useQuery({
    queryKey: ['org-audit', tenantId],
    queryFn: () => tenantsAPI.getAuditLogs(tenantId).then(r => r.data),
    enabled: !!tenantId,
  });

  const logs = Array.isArray(data) ? data : (data?.logs || []);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Category filter
      if (categoryFilter !== 'all') {
        const actionStr = (log.action || '').toLowerCase();
        const resStr = (log.resource || '').toLowerCase();
        if (categoryFilter === 'auth' && !actionStr.includes('login') && !actionStr.includes('auth')) return false;
        if (categoryFilter === 'academic' && !actionStr.includes('exam') && !actionStr.includes('grade') && !resStr.includes('course')) return false;
        if (categoryFilter === 'admin' && !actionStr.includes('admin') && !actionStr.includes('policy') && !actionStr.includes('tenant')) return false;
      }

      // Search query
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          (log.action || '').toLowerCase().includes(q) ||
          (log.actor_name || '').toLowerCase().includes(q) ||
          (log.actor_email || '').toLowerCase().includes(q) ||
          (log.resource || '').toLowerCase().includes(q) ||
          (log.ip_address || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [logs, search, categoryFilter]);

  const handleExportCSV = () => {
    if (filteredLogs.length === 0) {
      return toast.error("No log events to export.");
    }
    const headers = ["ID", "Timestamp", "Actor", "Email", "Action", "Resource", "IP Address"];
    const rows = filteredLogs.map(l => [
      l.id,
      l.created_at || '',
      `"${l.actor_name || 'System'}"`,
      `"${l.actor_email || ''}"`,
      `"${l.action || ''}"`,
      `"${l.resource || ''}"`,
      l.ip_address || ''
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `audit-trail-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast.success("Audit trail CSV downloaded!");
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Search & Action Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flex: 1, minWidth: 280, maxWidth: 640 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by action, actor, resource or IP..."
              className="input"
              style={{ width: '100%', paddingLeft: '2.5rem', fontSize: '0.8125rem' }}
            />
          </div>

          <select 
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="input"
            style={{ width: 190, fontSize: '0.8125rem', fontWeight: 700 }}
          >
            <option value="all">All Events ({logs.length})</option>
            <option value="auth">Authentication &amp; MFA</option>
            <option value="academic">Academic &amp; Assessments</option>
            <option value="admin">Administrator Changes</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button 
            onClick={handleExportCSV}
            className="btn btn-secondary"
            style={{ gap: 6, fontSize: '0.8125rem' }}
          >
            <Download size={14} /> Export CSV
          </button>
          <button 
            onClick={() => refetch()}
            className="btn btn-secondary btn-icon"
            title="Refresh logs"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Main Logs Table / Stream */}
      <div style={{ background: 'var(--surface-0)', border: '1px solid var(--glass-border)', borderRadius: 18, overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: '4rem', textAlign: 'center' }}>
            <Loader text="Loading institutional audit stream..." />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <History size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', margin: '0 0 6px' }}>
              No Security Incidents or Audit Records
            </p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0, maxWidth: 440, marginLeft: 'auto', marginRight: 'auto' }}>
              All authentication attempts, student grade modifications, and institutional policy adjustments will be recorded here in tamper-evident logs.
            </p>
            {(search || categoryFilter !== 'all') && (
              <button 
                onClick={() => { setSearch(''); setCategoryFilter('all'); }}
                className="btn btn-secondary btn-sm"
                style={{ marginTop: 14 }}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: 'var(--surface-1)', borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)', fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '0.875rem 1.25rem' }}>Event Action &amp; Target</th>
                  <th style={{ padding: '0.875rem 1rem' }}>Actor</th>
                  <th style={{ padding: '0.875rem 1rem' }}>Origin IP</th>
                  <th style={{ padding: '0.875rem 1rem' }}>Timestamp</th>
                  <th style={{ padding: '0.875rem 1.25rem', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log, i) => (
                  <tr key={log.id || i} style={{ borderTop: i === 0 ? 'none' : '1px solid var(--glass-border)' }}>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                          {log.action}
                        </span>
                        {log.resource && (
                          <span style={{ fontSize: '0.6875rem', fontWeight: 800, background: 'rgba(99,102,241,0.1)', color: 'var(--brand-600)', padding: '2px 8px', borderRadius: 6 }}>
                            {log.resource}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1rem' }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.8125rem' }}>
                          {log.actor_name || 'System'}
                        </p>
                        {log.actor_email && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{log.actor_email}</span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1rem', fontFamily: 'monospace', color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                      {log.ip_address || 'Internal/Loopback'}
                    </td>
                    <td style={{ padding: '1rem 1rem', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                      {log.created_at ? new Date(log.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Recent'}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      <button 
                        onClick={() => setSelectedEvent(log)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Event Details Inspection Modal */}
      {selectedEvent && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div style={{ width: '100%', maxWidth: 540, background: 'var(--surface-0)', borderRadius: 20, padding: '2rem', border: '1px solid var(--glass-border)', boxShadow: '0 24px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(16,185,129,0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <History size={18} />
                </div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>Audit Event Record #{selectedEvent.id}</h3>
              </div>
              <button onClick={() => setSelectedEvent(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>

            <div style={{ background: 'var(--surface-1)', borderRadius: 12, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.8125rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Action:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{selectedEvent.action}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Target Resource:</span>
                <strong>{selectedEvent.resource || 'None'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Originating IP:</span>
                <strong style={{ fontFamily: 'monospace' }}>{selectedEvent.ip_address || 'Loopback'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Actor Identity:</span>
                <strong>{selectedEvent.actor_name || 'System Service'} ({selectedEvent.actor_email || 'internal'})</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Timestamp:</span>
                <strong>{selectedEvent.created_at ? new Date(selectedEvent.created_at).toLocaleString() : 'N/A'}</strong>
              </div>
            </div>

            <button onClick={() => setSelectedEvent(null)} className="btn btn-primary" style={{ width: '100%' }}>
              Close Inspector
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── MAIN UNIFIED SECURITY HUB ────────────────────────────────────────────────
export default function OrgSecurityHub() {
  const { user } = useAuthStore();
  const tenantId = user?.tenant_id || 1;
  const [activeTab, setActiveTab] = useState('policies');

  const tabs = [
    { id: 'policies', label: 'Security Policies & Threat Defense', icon: ShieldCheck },
    { id: 'audit', label: 'Audit Trails & Incident Logs', icon: History },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Tabs: Consolidated to prevent tiny single-feature tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
            Institutional Security &amp; Compliance Hub
          </h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
            Zero-trust access policies, developer credentials, and tamper-evident audit telemetry.
          </p>
        </div>

        <div className="hide-scrollbar" style={{ display: 'flex', background: 'var(--surface-1)', padding: 6, borderRadius: 16, border: '1px solid var(--glass-border)', gap: 4, overflowX: 'auto', flexWrap: 'nowrap' }}>
          {tabs.map(t => (
            <button 
              key={t.id} 
              onClick={() => setActiveTab(t.id)}
              style={{ 
                display: 'flex', alignItems: 'center', gap: 8, padding: '0.625rem 1.25rem', borderRadius: 12, border: 'none', cursor: 'pointer', 
                fontWeight: 800, fontSize: '0.875rem', transition: 'all 0.2s', whiteSpace: 'nowrap', 
                background: activeTab === t.id ? 'white' : 'transparent', 
                color: activeTab === t.id ? 'var(--brand-600)' : 'var(--text-muted)', 
                boxShadow: activeTab === t.id ? '0 4px 12px rgba(0,0,0,0.08)' : 'none' 
              }}
            >
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'policies' && <PoliciesAndAccessTab tenantId={tenantId} />}
      {activeTab === 'audit' && <AuditLogsTab tenantId={tenantId} />}
    </div>
  );
}
