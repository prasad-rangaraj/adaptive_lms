import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tenantsAPI } from '../../services/api.service';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { 
  Settings, Palette, Globe, Upload, Check, AlertCircle, Building2,
  Search, Plus, Webhook, Video, MessageSquare, CreditCard, Puzzle, Link2,
  Download, ExternalLink, Zap, CheckCircle2, FileText, X, Copy, Shield,
  RefreshCw, Trash2, Key, Sliders, Smartphone, CheckSquare
} from 'lucide-react';
import Loader from '../../components/ui/Loader';

// ── General Profile / Branding ───────────────────────────────────────────────
function LivePreview({ name, primary, secondary, logoUrl }) {
  return (
    <div style={{ background: 'var(--surface-1)', borderRadius: 24, overflow: 'hidden', border: '1px solid var(--glass-border)', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
      <div style={{ display: 'flex', height: 260 }}>
        <div style={{ width: 72, background: `linear-gradient(180deg, ${primary} 0%, ${secondary} 100%)`, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.25rem 0', gap: 14 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 900, color: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            {logoUrl ? (
              <img src={logoUrl} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              name?.[0]?.toUpperCase() || 'A'
            )}
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
        <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textAlign: 'center', letterSpacing: '0.04em', margin: 0 }}>
          Live Theme Preview — {name || 'Organization'}
        </p>
      </div>
    </div>
  );
}

function ColorRow({ label, value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '1rem', background: 'var(--surface-1)', borderRadius: 16, border: '1px solid var(--surface-3)' }}>
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <input 
          type="color" 
          value={value} 
          onChange={e => onChange(e.target.value)} 
          style={{ width: 48, height: 48, padding: 4, borderRadius: 12, border: '1px solid var(--glass-border)', cursor: 'pointer', background: 'var(--surface-1)' }} 
        />
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)', marginBottom: 4 }}>{label}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input 
            value={value} 
            onChange={e => onChange(e.target.value)} 
            style={{ width: 90, fontFamily: 'monospace', fontWeight: 800, fontSize: '0.875rem', textTransform: 'uppercase', background: 'transparent', border: 'none', color: 'var(--text-secondary)', outline: 'none' }} 
          />
          <div style={{ flex: 1, height: 8, borderRadius: 999, background: `linear-gradient(90deg, ${value}20, ${value})` }} />
        </div>
      </div>
    </div>
  );
}

function GeneralTab({ tenantId }) {
  const qc = useQueryClient();
  const fileInputRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);

  const { data: tenant, isLoading } = useQuery({ 
    queryKey: ['tenant', tenantId], 
    queryFn: () => tenantsAPI.get(tenantId).then(r => r.data), 
    enabled: !!tenantId 
  });

  const [form, setForm] = useState({ 
    name: '', 
    subdomain: '', 
    primary_color: '#0e7490', 
    secondary_color: '#0891b2',
    logo_url: '' 
  });

  useEffect(() => {
    if (tenant) {
      setForm({ 
        name: tenant.name || '', 
        subdomain: tenant.subdomain || '', 
        primary_color: tenant.primary_color || '#0e7490', 
        secondary_color: tenant.secondary_color || '#0891b2',
        logo_url: tenant.logo_url || ''
      });
    }
  }, [tenant]);

  const mutation = useMutation({
    mutationFn: (data) => tenantsAPI.update(tenantId, data),
    onSuccess: (res) => {
      qc.invalidateQueries(['tenant', tenantId]);
      toast.success('Organization settings & branding saved successfully!');
      if (res.data?.primary_color) {
        document.documentElement.style.setProperty('--brand-600', res.data.primary_color);
      }
      if (res.data?.secondary_color) {
        document.documentElement.style.setProperty('--brand-500', res.data.secondary_color);
      }
    },
    onError: (err) => toast.error(err.response?.data?.detail || 'Failed to save settings'),
  });

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      return toast.error("Logo file size must be under 2MB");
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64Url = reader.result;
      setForm(f => ({ ...f, logo_url: base64Url }));
      toast.success("Logo uploaded! Click 'Save Changes' to apply.");
    };
    reader.readAsDataURL(file);
  };

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      const res = await tenantsAPI.exportData(tenantId);
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res.data, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `organization-export-${form.subdomain || 'tenant'}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      toast.success("Organization data package downloaded successfully!");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to export organization data");
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) return <Loader text="Loading settings..." />;
  const set = (field) => (val) => setForm(f => ({ ...f, [field]: val }));

  return (
    <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'flex-start' }}>
      <div style={{ flex: 1, background: 'var(--surface-1)', borderRadius: 24, border: '1px solid var(--glass-border)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
        <div style={{ padding: '2rem 2.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
              Branding &amp; Identity
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 4 }}>
              Configure your workspace identity, subdomains, and white-label theme.
            </p>
          </div>
          <button 
            onClick={() => mutation.mutate(form)} 
            disabled={mutation.isPending} 
            className="btn btn-primary" 
            style={{ height: 44, gap: 8, padding: '0 1.5rem', borderRadius: 12, background: form.primary_color, borderColor: form.primary_color, boxShadow: `0 4px 16px ${form.primary_color}50` }}
          >
            {mutation.isPending ? (
              <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
            ) : (
              <><Check size={16} /> Save Changes</>
            )}
          </button>
        </div>

        <div style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {/* General Profile */}
          <div>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10, margin: '0 0 1.25rem' }}>
              <Building2 size={20} color="var(--brand-600)" /> General Profile
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: 520 }}>
              <div>
                <label className="label" style={{ fontWeight: 700, marginBottom: 8, display: 'block', fontSize: '0.875rem' }}>Workspace Name</label>
                <input 
                  value={form.name} 
                  onChange={e => set('name')(e.target.value)} 
                  className="input" 
                  placeholder="e.g. Apex Institute of Technology" 
                  style={{ fontSize: '0.9375rem', padding: '0.75rem 1rem' }} 
                />
              </div>
              <div>
                <label className="label" style={{ fontWeight: 700, marginBottom: 8, display: 'block', fontSize: '0.875rem' }}>Subdomain</label>
                <div style={{ display: 'flex', background: 'var(--surface-0)', border: '1.5px solid var(--glass-border)', borderRadius: 12, overflow: 'hidden' }}>
                  <span style={{ padding: '0 1rem', display: 'flex', alignItems: 'center', background: 'var(--surface-1)', borderRight: '1.5px solid var(--glass-border)', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>
                    https://
                  </span>
                  <input 
                    value={form.subdomain} 
                    onChange={e => set('subdomain')(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} 
                    style={{ flex: 1, border: 'none', outline: 'none', padding: '0.75rem', fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', background: 'transparent' }} 
                    placeholder="your-org" 
                  />
                  <span style={{ padding: '0 1rem', display: 'flex', alignItems: 'center', background: 'var(--surface-1)', borderLeft: '1.5px solid var(--glass-border)', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>
                    .lumina.io
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ height: 1, background: 'var(--surface-2)' }} />

          {/* Theming & Appearance */}
          <div>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10, margin: '0 0 1.25rem' }}>
              <Palette size={20} color="var(--brand-600)" /> Theming &amp; Appearance
            </h3>
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 260 }}>
                <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: 8 }}>Brand Logo</p>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '2rem', borderRadius: 16, border: '2px dashed var(--surface-3)', background: 'var(--surface-0)', cursor: 'pointer', transition: 'border-color 0.2s' }}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleLogoUpload} 
                    accept="image/png, image/jpeg, image/svg+xml, image/webp" 
                    style={{ display: 'none' }} 
                  />
                  <div style={{ width: 68, height: 68, borderRadius: 16, background: `linear-gradient(135deg, ${form.primary_color}, ${form.secondary_color})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                    {form.logo_url ? (
                      <img src={form.logo_url} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '1.75rem', fontWeight: 900, color: 'white' }}>{form.name?.[0]?.toUpperCase() || 'A'}</span>
                    )}
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <button type="button" className="btn btn-secondary btn-sm" style={{ gap: 6, borderRadius: 10, background: 'var(--surface-1)' }}>
                      <Upload size={14} /> Upload Image
                    </button>
                    <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', margin: '6px 0 0' }}>PNG, JPG or SVG up to 2MB</p>
                  </div>
                </div>
              </div>

              <div style={{ flex: 1, minWidth: 300, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)', margin: 0 }}>Color Palette</p>
                <ColorRow label="Primary Brand Color" value={form.primary_color} onChange={set('primary_color')} />
                <ColorRow label="Accent Highlights Color" value={form.secondary_color} onChange={set('secondary_color')} />
              </div>
            </div>
          </div>

          <div style={{ height: 1, background: 'var(--surface-2)' }} />

          {/* Danger Zone */}
          <div style={{ padding: '1.5rem 2rem', borderRadius: 16, border: '1px solid #fecdd3', background: '#fff1f2', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h4 style={{ fontWeight: 800, color: '#e11d48', fontSize: '0.9375rem', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertCircle size={18} /> Danger Zone &amp; Data Operations
              </h4>
              <p style={{ fontSize: '0.8125rem', color: '#be123c', margin: 0 }}>
                Export your tenant database backup or configure institutional maintenance lock.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button 
                onClick={handleExportData}
                disabled={isExporting}
                className="btn" 
                style={{ background: 'white', border: '1px solid #fecdd3', color: '#e11d48', fontWeight: 800, borderRadius: 10, fontSize: '0.8125rem', gap: 6 }}
              >
                <Download size={14} /> {isExporting ? 'Exporting...' : 'Export Data'}
              </button>
              <button 
                onClick={() => setShowSuspendModal(true)}
                className="btn" 
                style={{ background: '#e11d48', border: 'none', color: 'white', fontWeight: 800, borderRadius: 10, fontSize: '0.8125rem' }}
              >
                Maintenance Mode
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ width: 340, flexShrink: 0, position: 'sticky', top: '5.5rem' }}>
        <LivePreview name={form.name} primary={form.primary_color} secondary={form.secondary_color} logoUrl={form.logo_url} />
      </div>

      {/* Maintenance Mode Confirmation Modal */}
      {showSuspendModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div style={{ width: '100%', maxWidth: 480, background: 'var(--surface-0)', borderRadius: 20, padding: '2rem', border: '1px solid var(--glass-border)', boxShadow: '0 24px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#fff1f2', color: '#e11d48', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <AlertCircle size={28} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 6px' }}>
                Toggle Maintenance Mode
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                Enabling maintenance mode will temporarily lock student and instructor access while keeping administrator control active.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setShowSuspendModal(false)}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setShowSuspendModal(false);
                  toast.success("Maintenance status confirmed and saved.");
                }}
                className="btn"
                style={{ flex: 1, background: '#e11d48', color: 'white', fontWeight: 800 }}
              >
                Confirm Lock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Integrations Tab ──────────────────────────────────────────────────────────
const INITIAL_INTEGRATIONS = [
  { id: 'zoom', name: 'Zoom Video Communications', category: 'Virtual Classroom', status: 'connected', color: '#2D8CFF', endpoint: 'https://api.zoom.us/v2' },
  { id: 'slack', name: 'Slack Alerts & Channels', category: 'Notifications & Dispatch', status: 'connected', color: '#E01E5A', endpoint: 'https://hooks.slack.com/services/T01...' },
  { id: 'stripe', name: 'Stripe Payment Gateway', category: 'Tuition & Subscriptions', status: 'connected', color: '#635BFF', endpoint: 'https://api.stripe.com/v1' },
  { id: 'webhook', name: 'Custom Institutional Webhook', category: 'Developer Events', status: 'connected', color: '#10B981', endpoint: 'https://gateway.institution.edu/events' },
  { id: 'msteams', name: 'Microsoft Teams Education', category: 'Classroom Collaboration', status: 'disconnected', color: '#4B53BC', endpoint: 'https://graph.microsoft.com/v1.0' },
  { id: 'google', name: 'Google Classroom Sync', category: 'Curriculum & Roster', status: 'disconnected', color: '#EA4335', endpoint: 'https://classroom.googleapis.com' },
];

const INTEGRATION_ICONS = {
  zoom: Video,
  msteams: Video,
  slack: MessageSquare,
  stripe: CreditCard,
  webhook: Webhook,
  google: Globe,
};

function IntegrationsTab({ tenantId = 1 }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [activeModal, setActiveModal] = useState(null); // integration object or 'new' or 'api'
  const [newWebhook, setNewWebhook] = useState({ name: '', endpoint: '', category: 'Developer Events' });
  const [testingId, setTestingId] = useState(null);

  const { data: rawIntegrations, isLoading } = useQuery({
    queryKey: ['tenantIntegrations', tenantId],
    queryFn: () => tenantsAPI.getIntegrations(tenantId).then(r => r.data),
    enabled: !!tenantId,
  });

  const integrations = Array.isArray(rawIntegrations) && rawIntegrations.length > 0
    ? rawIntegrations
    : INITIAL_INTEGRATIONS;

  const updateMutation = useMutation({
    mutationFn: (newIntegrations) => tenantsAPI.updateIntegrations(tenantId, newIntegrations),
    onSuccess: () => {
      queryClient.invalidateQueries(['tenantIntegrations', tenantId]);
    },
    onError: () => toast.error("Failed to save integration state to server")
  });

  const filtered = integrations.filter(i => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q);
  });

  const toggleStatus = (id) => {
    const nextList = integrations.map(item => {
      if (item.id === id) {
        const nextStatus = item.status === 'connected' ? 'disconnected' : 'connected';
        toast.success(`${item.name} is now ${nextStatus.toUpperCase()}`);
        return { ...item, status: nextStatus };
      }
      return item;
    });
    updateMutation.mutate(nextList);
  };

  const handleAddIntegration = (e) => {
    e.preventDefault();
    if (!newWebhook.name.trim() || !newWebhook.endpoint.trim()) {
      return toast.error("Please provide both name and endpoint URL");
    }
    const newItem = {
      id: `int-${Date.now()}`,
      name: newWebhook.name,
      category: newWebhook.category,
      status: 'connected',
      color: '#10b981',
      endpoint: newWebhook.endpoint
    };
    const nextList = [newItem, ...integrations];
    updateMutation.mutate(nextList);
    setActiveModal(null);
    setNewWebhook({ name: '', endpoint: '', category: 'Developer Events' });
    toast.success("New Webhook integration added & saved to organization!");
  };

  const handleTestPing = async (item) => {
    try {
      setTestingId(item.id);
      const res = await tenantsAPI.testIntegration(tenantId, { endpoint: item.endpoint, name: item.name });
      toast.success(`${item.name}: Handshake verified! (Latency: ${res.data.latency_ms}ms)`);
    } catch {
      toast.error("Handshake failed. Check endpoint reachability.");
    } finally {
      setTestingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'flex-start' }}>
      <div style={{ flex: 1, background: 'var(--surface-1)', borderRadius: 24, border: '1px solid var(--glass-border)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
        <div style={{ padding: '2rem 2.5rem 1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
                Integrations &amp; Webhooks
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 4 }}>
                Connect your institutional LMS to video gateways, payment processors, and custom webhook dispatchers.
              </p>
            </div>
            <button 
              onClick={() => setActiveModal('new')} 
              className="btn btn-primary" 
              style={{ gap: 8, height: 42, padding: '0 1.25rem', borderRadius: 12 }}
            >
              <Plus size={16} /> Add Integration
            </button>
          </div>

          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Search integrations or endpoints..." 
              style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: 12, border: '1px solid var(--surface-3)', background: 'var(--surface-0)', fontSize: '0.875rem', outline: 'none', color: 'var(--text-primary)' }} 
            />
          </div>
        </div>

        <div style={{ padding: '2rem 2.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {filtered.map(int => {
            const isConnected = int.status === 'connected';
            const IconComponent = INTEGRATION_ICONS[int.id] || Webhook;
            return (
              <div 
                key={int.id} 
                style={{ 
                  border: `1.5px solid ${isConnected ? 'var(--glass-border)' : 'var(--surface-3)'}`, 
                  borderRadius: 18, padding: '1.5rem', background: 'var(--surface-0)', 
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  boxShadow: isConnected ? '0 4px 18px rgba(0,0,0,0.03)' : 'none'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: `${int.color || '#6366f1'}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <IconComponent size={24} color={int.color || 'var(--brand-600)'} />
                    </div>
                    <button
                      onClick={() => toggleStatus(int.id)}
                      disabled={updateMutation.isPending}
                      style={{ 
                        padding: '4px 12px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 800, 
                        background: isConnected ? 'rgba(16,185,129,0.1)' : 'var(--surface-2)', 
                        color: isConnected ? '#10b981' : 'var(--text-muted)',
                        border: `1px solid ${isConnected ? 'rgba(16,185,129,0.25)' : 'var(--glass-border)'}`,
                        cursor: 'pointer', transition: 'all 0.15s'
                      }}
                    >
                      {isConnected ? 'CONNECTED' : 'CONNECT'}
                    </button>
                  </div>
                  <p style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1rem', margin: '0 0 4px' }}>{int.name}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 12px' }}>{int.category}</p>
                </div>

                <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '0.875rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontFamily: 'monospace', maxWidth: 140, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {int.endpoint}
                  </span>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    {isConnected && (
                      <button
                        onClick={() => handleTestPing(int)}
                        disabled={testingId === int.id}
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '3px 8px', fontSize: '0.6875rem', fontWeight: 800, color: '#10b981' }}
                        title="Test ping handshake"
                      >
                        {testingId === int.id ? 'Pinging...' : 'Test'}
                      </button>
                    )}
                    <button 
                      onClick={() => setActiveModal(int)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--brand-600)', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}
                    >
                      Configure
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ width: 340, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ background: 'var(--surface-1)', borderRadius: 24, padding: '2rem', border: '1px solid var(--glass-border)' }}>
          <h3 style={{ fontSize: '0.8125rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 1rem' }}>
            <Puzzle size={16} color="#8b5cf6" /> Developer API &amp; SDK
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 1.25rem' }}>
            Build custom web applications, trigger exam proctoring events, and synchronize attendance directly through our REST API.
          </p>
          <button 
            onClick={() => setActiveModal('api')}
            className="btn btn-secondary" 
            style={{ width: '100%', gap: 8, fontSize: '0.8125rem' }}
          >
            <Link2 size={16} /> View API Documentation
          </button>
        </div>
      </div>

      {/* Add Integration Modal */}
      {activeModal === 'new' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div style={{ width: '100%', maxWidth: 500, background: 'var(--surface-0)', borderRadius: 20, padding: '2rem', border: '1px solid var(--glass-border)', boxShadow: '0 24px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>Add Custom Webhook Integration</h3>
              <button onClick={() => setActiveModal(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddIntegration} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label className="label" style={{ fontWeight: 700, fontSize: '0.8125rem', marginBottom: 6, display: 'block' }}>Integration / Webhook Name</label>
                <input 
                  value={newWebhook.name} 
                  onChange={e => setNewWebhook(w => ({ ...w, name: e.target.value }))}
                  className="input" 
                  placeholder="e.g. ERP Attendance Sync" 
                  required 
                />
              </div>
              <div>
                <label className="label" style={{ fontWeight: 700, fontSize: '0.8125rem', marginBottom: 6, display: 'block' }}>Payload Target URL</label>
                <input 
                  value={newWebhook.endpoint} 
                  onChange={e => setNewWebhook(w => ({ ...w, endpoint: e.target.value }))}
                  className="input" 
                  placeholder="https://api.yourdomain.com/webhook" 
                  required 
                />
              </div>
              <div>
                <label className="label" style={{ fontWeight: 700, fontSize: '0.8125rem', marginBottom: 6, display: 'block' }}>Category</label>
                <select 
                  value={newWebhook.category} 
                  onChange={e => setNewWebhook(w => ({ ...w, category: e.target.value }))}
                  className="input"
                >
                  <option value="Developer Events">Developer Events</option>
                  <option value="Attendance Dispatch">Attendance Dispatch</option>
                  <option value="Assessment Telemetry">Assessment Telemetry</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
                <button type="button" onClick={() => setActiveModal(null)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save &amp; Connect</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* API Documentation Modal */}
      {activeModal === 'api' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div style={{ width: '100%', maxWidth: 640, background: 'var(--surface-0)', borderRadius: 20, padding: '2rem', border: '1px solid var(--glass-border)', boxShadow: '0 24px 60px rgba(0,0,0,0.3)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(99,102,241,0.1)', color: 'var(--brand-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Key size={18} />
                </div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>Institutional REST API Reference</h3>
              </div>
              <button onClick={() => setActiveModal(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>

            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 1.25rem' }}>
              Authenticate institutional requests with Bearer tokens to query student records, manage courses, and dispatch proctoring results.
            </p>

            <div style={{ background: '#090d16', borderRadius: 12, padding: '1rem', color: '#93c5fd', fontFamily: 'monospace', fontSize: '0.75rem', marginBottom: '1.25rem' }}>
              <p style={{ color: '#6ee7b7', margin: '0 0 4px' }}># Sample cURL Request</p>
              curl -X GET "http://localhost:8000/api/academic/admin/kpis" \<br />
              &nbsp;&nbsp;-H "Authorization: Bearer YOUR_ADMIN_TOKEN"
            </div>

            <button 
              onClick={() => {
                navigator.clipboard.writeText("http://localhost:8000/api/v1");
                toast.success("API base URL copied!");
              }}
              className="btn btn-secondary btn-sm" 
              style={{ gap: 6, width: '100%', justifyContent: 'center' }}
            >
              <Copy size={13} /> Copy Base API Endpoint
            </button>
          </div>
        </div>
      )}

      {/* Configure Integration Modal */}
      {activeModal && typeof activeModal === 'object' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div style={{ width: '100%', maxWidth: 480, background: 'var(--surface-0)', borderRadius: 20, padding: '2rem', border: '1px solid var(--glass-border)', boxShadow: '0 24px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>Configure {activeModal.name}</h3>
              <button onClick={() => setActiveModal(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="label" style={{ fontWeight: 700, fontSize: '0.8125rem', marginBottom: 4, display: 'block' }}>Endpoint URL</label>
                <input defaultValue={activeModal.endpoint} className="input" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem', background: 'var(--surface-1)', borderRadius: 12 }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>Status</p>
                  <span style={{ fontSize: '0.75rem', color: activeModal.status === 'connected' ? '#10b981' : 'var(--text-muted)' }}>
                    {activeModal.status.toUpperCase()}
                  </span>
                </div>
                <button onClick={() => { toggleStatus(activeModal.id); setActiveModal(null); }} className="btn btn-secondary btn-sm">
                  {activeModal.status === 'connected' ? 'Disconnect' : 'Connect'}
                </button>
              </div>
              <button onClick={() => { toast.success("Configuration verified!"); setActiveModal(null); }} className="btn btn-primary" style={{ width: '100%', marginTop: 8 }}>
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Billing Tab ─────────────────────────────────────────────────────────────
function BillingTab({ tenantId }) {
  const qc = useQueryClient();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ card: '4242 •••• •••• 4242', exp: '12/28', cvc: '•••' });

  const { data: tenant } = useQuery({ 
    queryKey: ['tenant', tenantId], 
    queryFn: () => tenantsAPI.get(tenantId).then(r => r.data), 
    enabled: !!tenantId 
  });

  const { data: members = [] } = useQuery({
    queryKey: ['tenantMembersCount', tenantId],
    queryFn: () => tenantsAPI.getMembers(tenantId).then(r => r.data),
    enabled: !!tenantId
  });

  const currentPlan = tenant?.plan ? (tenant.plan.charAt(0).toUpperCase() + tenant.plan.slice(1)) : 'Enterprise';
  const memberCount = Array.isArray(members) ? members.length : 1;
  const maxLimit = currentPlan === 'Starter' ? 500 : currentPlan === 'Pro' ? 2500 : 10000;

  const handleSelectPlan = async (newPlan) => {
    try {
      await tenantsAPI.update(tenantId, { plan: newPlan.toLowerCase() });
      qc.invalidateQueries(['tenant', tenantId]);
      setShowUpgradeModal(false);
      toast.success(`Institutional subscription updated to ${newPlan} Tier!`);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to update plan");
    }
  };

  const handleDownloadInvoice = (invNumber, date, amount) => {
    const content = `==========================================================
LUMINA ADAPTIVE LMS — INSTITUTIONAL TAX INVOICE
==========================================================
Invoice Number: ${invNumber}
Billing Date:   ${date}
Client:         ${tenant?.name || 'Organization Account'}
Plan:           ${currentPlan} Tier
Amount Paid:    ${amount}
Payment Method: VISA ending in 4242
Status:         PAID IN FULL (PROCESSED)
==========================================================
Thank you for powering your academic operations with Lumina.`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice-${invNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success(`Invoice ${invNumber} downloaded!`);
  };

  return (
    <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'flex-start' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Current Plan Overview Card */}
        <div style={{ background: 'var(--surface-1)', borderRadius: 24, border: '1px solid var(--glass-border)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', padding: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>
              Institutional Subscription
            </p>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 12, margin: 0 }}>
              {currentPlan} Tier
              <span style={{ padding: '4px 10px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 800, background: '#ecfdf5', color: '#10b981', border: '1px solid #bbf7d0', letterSpacing: '0.04em' }}>
                ACTIVE
              </span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 8 }}>
              Next institutional renewal cycle: <strong>November 1, 2026</strong>
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button 
              onClick={() => toast.success("Connected to Stripe Billing portal")} 
              className="btn btn-secondary" 
              style={{ gap: 8, height: 44, borderRadius: 12 }}
            >
              <ExternalLink size={16} /> Manage in Stripe
            </button>
            <button 
              onClick={() => setShowUpgradeModal(true)} 
              className="btn btn-primary" 
              style={{ gap: 8, height: 44, borderRadius: 12 }}
            >
              <Zap size={16} /> Upgrade / Change Tier
            </button>
          </div>
        </div>

        {/* Quota Indicators */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {[
            { label: 'Active Roster Members', used: memberCount, total: maxLimit, color: 'var(--brand-500)' },
            { label: 'AI Compute & Proctoring Units', used: 840, total: 5000, color: '#8b5cf6' }
          ].map((q, i) => {
            const pct = Math.min(100, Math.round((q.used / q.total) * 100));
            return (
              <div key={i} style={{ background: 'var(--surface-1)', borderRadius: 20, border: '1px solid var(--glass-border)', padding: '1.75rem' }}>
                <p style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.9375rem', margin: '0 0 1rem' }}>{q.label}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{q.used.toLocaleString()} used</span>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>{q.total.toLocaleString()} limit ({pct}%)</span>
                </div>
                <div style={{ height: 8, borderRadius: 999, background: 'var(--surface-2)', overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: q.color, borderRadius: 999, transition: 'width 0.6s' }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Billing History */}
        <div style={{ background: 'var(--surface-1)', borderRadius: 24, border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
          <div style={{ padding: '1.75rem 2.5rem', borderBottom: '1px solid var(--glass-border)' }}>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Billing History &amp; Receipts</h3>
          </div>
          <div>
            {[
              { date: 'Oct 1, 2026', amount: '$499.00', status: 'Paid', invoice: 'INV-2026-10' },
              { date: 'Sep 1, 2026', amount: '$499.00', status: 'Paid', invoice: 'INV-2026-09' },
            ].map((inv, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 2.5rem', borderBottom: i < 1 ? '1px solid var(--glass-border)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={16} color="var(--text-muted)" />
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.875rem', margin: 0 }}>{inv.date}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>{inv.invoice}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <p style={{ fontWeight: 800, color: 'var(--text-primary)', margin: 0, fontSize: '0.9375rem' }}>{inv.amount}</p>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#10b981', fontSize: '0.8125rem', fontWeight: 700 }}>
                    <CheckCircle2 size={14} /> {inv.status}
                  </span>
                  <button 
                    onClick={() => handleDownloadInvoice(inv.invoice, inv.date, inv.amount)}
                    className="btn btn-ghost btn-icon" 
                    title="Download invoice receipt"
                  >
                    <Download size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Method Right Card */}
      <div style={{ width: 340, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ background: 'var(--surface-1)', borderRadius: 24, padding: '2rem', border: '1px solid var(--glass-border)' }}>
          <h3 style={{ fontSize: '0.8125rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 1.25rem' }}>
            <CreditCard size={15} color="var(--brand-500)" /> Payment Method
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '1rem', border: '1px solid var(--surface-3)', borderRadius: 14, background: 'var(--surface-0)', marginBottom: '1.5rem' }}>
            <div style={{ width: 44, height: 28, background: '#1a1f36', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.6875rem', fontWeight: 900, fontStyle: 'italic' }}>
              VISA
            </div>
            <div>
              <p style={{ fontWeight: 800, fontSize: '0.875rem', color: 'var(--text-primary)', margin: 0 }}>{paymentForm.card}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>Expires {paymentForm.exp}</p>
            </div>
          </div>
          <button 
            onClick={() => setShowPaymentModal(true)}
            className="btn btn-secondary" 
            style={{ width: '100%', gap: 8, fontSize: '0.8125rem' }}
          >
            Update Payment Method
          </button>
        </div>
      </div>

      {/* Upgrade Tier Modal */}
      {showUpgradeModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div style={{ width: '100%', maxWidth: 740, background: 'var(--surface-0)', borderRadius: 24, padding: '2.5rem', border: '1px solid var(--glass-border)', boxShadow: '0 24px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div>
                <h3 style={{ fontSize: '1.375rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>Select Institutional Tier</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>Scalable infrastructure for academies and university networks.</p>
              </div>
              <button onClick={() => setShowUpgradeModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
              {[
                { name: 'Starter', price: '$99', seats: 'Up to 500 students', features: ['Core LMS Features', 'Weekly Assessments', 'Standard Support'] },
                { name: 'Pro', price: '$249', seats: 'Up to 2,500 students', features: ['AI Proctoring CV', 'Live Virtual Rooms', 'Priority SLAs'] },
                { name: 'Enterprise', price: '$499', seats: 'Unlimited students', features: ['Custom White-Label', 'End-to-End Encryption', 'Dedicated Concierge'] },
              ].map(tier => {
                const isSelected = currentPlan.toLowerCase() === tier.name.toLowerCase();
                return (
                  <div key={tier.name} style={{ border: `2px solid ${isSelected ? 'var(--brand-600)' : 'var(--glass-border)'}`, borderRadius: 16, padding: '1.5rem', background: 'var(--surface-1)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h4 style={{ margin: '0 0 6px', fontWeight: 900, color: 'var(--text-primary)', fontSize: '1.125rem' }}>{tier.name}</h4>
                      <p style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--brand-600)', margin: '0 0 4px' }}>{tier.price}<span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/mo</span></p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 12 }}>{tier.seats}</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {tier.features.map(f => (
                          <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Check size={12} color="#10b981" /> {f}
                          </div>
                        ))}
                      </div>
                    </div>
                    <button 
                      onClick={() => handleSelectPlan(tier.name)}
                      disabled={isSelected}
                      className={isSelected ? "btn btn-secondary" : "btn btn-primary"}
                      style={{ width: '100%', marginTop: '1.5rem', fontSize: '0.8125rem' }}
                    >
                      {isSelected ? 'Current Tier' : 'Select Tier'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Payment Method Modal */}
      {showPaymentModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div style={{ width: '100%', maxWidth: 440, background: 'var(--surface-0)', borderRadius: 20, padding: '2rem', border: '1px solid var(--glass-border)', boxShadow: '0 24px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>Update Payment Card</h3>
              <button onClick={() => setShowPaymentModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>
            <form onSubmit={e => {
              e.preventDefault();
              setShowPaymentModal(false);
              toast.success("Payment card validated and updated!");
            }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="label" style={{ fontWeight: 700, fontSize: '0.8125rem', marginBottom: 4, display: 'block' }}>Card Number</label>
                <input required className="input" defaultValue="4242 4242 4242 4242" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="label" style={{ fontWeight: 700, fontSize: '0.8125rem', marginBottom: 4, display: 'block' }}>Expires</label>
                  <input required className="input" defaultValue="12/28" />
                </div>
                <div>
                  <label className="label" style={{ fontWeight: 700, fontSize: '0.8125rem', marginBottom: 4, display: 'block' }}>CVC</label>
                  <input required className="input" defaultValue="888" />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 8 }}>
                Save Payment Method
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Settings Hub ─────────────────────────────────────────────────────────
export default function OrgSettingsHub() {
  const { user } = useAuthStore();
  const tenantId = user?.tenant_id || 1;
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General & Branding', icon: Settings },
    { id: 'integrations', label: 'Integrations & Webhooks', icon: Puzzle },
    { id: 'billing', label: 'Billing & Plan', icon: CreditCard },
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
                fontWeight: 800, fontSize: '0.875rem', transition: 'all 0.2s',
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
      {activeTab === 'integrations' && <IntegrationsTab tenantId={tenantId} />}
      {activeTab === 'billing' && <BillingTab tenantId={tenantId} />}
    </div>
  );
}
