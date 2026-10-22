import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../../services/api.service';
import Loader from '../../components/ui/Loader';
import { 
  Megaphone, Send, Building2, Globe, Clock, CheckCheck, 
  AlertCircle, Info, Star, Mail, Zap, Calendar, PlayCircle, Plus, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

const TYPE_OPTIONS = [
  { key: 'info',        label: 'Informational', icon: Info,         color: '#4f46e5', bg: '#eef2ff', border: '#c7d2fe' },
  { key: 'maintenance', label: 'Maintenance',   icon: AlertCircle,  color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  { key: 'feature',     label: 'New Feature',   icon: Star,         color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
];

// ── Tab 1: Broadcasts ─────────────────────────────────────────────────────────
function BroadcastsTab() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ type: 'info', subject: '', message: '', audience: 'all' });

  const { data: history = [], isLoading } = useQuery({
    queryKey: ['admin-broadcasts'],
    queryFn: () => adminAPI.listBroadcasts().then(r => r.data),
  });

  const sendMutation = useMutation({
    mutationFn: (payload) => adminAPI.sendBroadcast(payload),
    onSuccess: () => {
      qc.invalidateQueries(['admin-broadcasts']);
      setForm({ type: 'info', subject: '', message: '', audience: 'all' });
      toast.success('Broadcast sent successfully across tenants!');
    },
    onError: () => toast.error('Failed to send broadcast.')
  });

  const handleSend = (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) return toast.error('Required fields missing.');
    sendMutation.mutate(form);
  };

  if (isLoading) return <Loader text="Loading announcements..." />;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: '1.5rem', alignItems: 'start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Sent Announcements ({history.length})</h2>
        {!history.length ? (
          <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Megaphone size={32} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
            <p style={{ fontWeight: 600 }}>No announcements sent yet.</p>
          </div>
        ) : (
          history.map(a => {
            const typeMeta = TYPE_OPTIONS.find(t => t.key === a.type) || TYPE_OPTIONS[0];
            const TypeIcon = typeMeta.icon;
            return (
              <div key={a.id} className="glass-card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: typeMeta.bg, border: `1px solid ${typeMeta.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><TypeIcon size={18} color={typeMeta.color} /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                      <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>{a.subject}</p>
                      <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: typeMeta.color, background: typeMeta.bg, border: `1px solid ${typeMeta.border}`, padding: '2px 7px', borderRadius: 999 }}>{typeMeta.label}</span>
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', lineHeight: 1.5 }}>{a.message}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}><Globe size={11} /> {a.audience === 'all' ? 'All Organizations' : `${a.audience} tier`}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={11} /> {a.sentAt ? new Date(a.sentAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'Today'}</span>
                      <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto' }}><CheckCheck size={13} /> {a.readCount} reach</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      <div style={{ position: 'sticky', top: '1rem' }}>
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.5rem' }}><Megaphone size={20} color="var(--brand-500)" /> New Announcement</h2>
          <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Type</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {TYPE_OPTIONS.map(t => {
                  const Icon = t.icon; const active = form.type === t.key;
                  return (
                    <button key={t.key} type="button" onClick={() => setForm(f => ({ ...f, type: t.key }))} style={{ flex: 1, padding: '8px', borderRadius: 10, cursor: 'pointer', border: `2px solid ${active ? t.color : 'var(--glass-border)'}`, background: active ? t.bg : 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, transition: 'all 0.15s' }}>
                      <Icon size={15} color={active ? t.color : 'var(--text-muted)'} /><span style={{ fontSize: '0.6875rem', fontWeight: 600, color: active ? t.color : 'var(--text-muted)' }}>{t.label.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}><Building2 size={13} style={{ display: 'inline', marginRight: 4 }} />Target Audience</label>
              <select value={form.audience} onChange={e => setForm(f => ({ ...f, audience: e.target.value }))} className="input-field" style={{ width: '100%' }}>
                <option value="all">All Organizations</option>
                <option value="enterprise">Enterprise Tier Only</option>
                <option value="pro">Pro Tier Only</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Subject *</label>
              <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="e.g. Scheduled Maintenance Notice" className="input-field" style={{ width: '100%' }} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Message *</label>
              <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={4} className="input-field" style={{ width: '100%', resize: 'vertical', lineHeight: 1.6 }} required />
            </div>
            <button type="submit" disabled={sendMutation.isPending} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              {sendMutation.isPending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              {sendMutation.isPending ? 'Sending...' : 'Broadcast Announcement'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ── Tab 2: Automated Workflows ────────────────────────────────────────────────
function AutomatedWorkflowsTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}><button className="btn btn-primary" style={{ gap: 8 }} onClick={() => toast.success('New automated lifecycle workflow template opened')}><Plus size={16} /> New Workflow</button></div>
      <div className="glass-card" style={{ padding: 0 }}>
        <table className="table">
          <thead><tr><th>Workflow Name</th><th>Trigger</th><th>Steps</th><th>Audience Enrolled</th><th>Status</th></tr></thead>
          <tbody>
            <tr>
              <td><div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--brand-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-600)' }}><Zap size={14} /></div><span style={{ fontWeight: 600 }}>Tenant Admin Onboarding</span></div></td>
              <td><span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Account Created</span></td>
              <td><span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>4 Emails (7 Days)</span></td>
              <td><span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--brand-600)' }}>14 Active</span></td>
              <td><span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '2px 8px', borderRadius: 999 }}>Active</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Tab 3: Outage Alerts ──────────────────────────────────────────────────────
function OutageAlertsTab() {
  const qc = useQueryClient();
  const [title, setTitle] = useState('');
  const [msg, setMsg] = useState('');
  const [declaring, setDeclaring] = useState(false);

  const handleIncident = async (e) => {
    e.preventDefault();
    if (!title.trim() || !msg.trim()) return toast.error('Please enter incident title and message');
    setDeclaring(true);
    try {
      await adminAPI.sendBroadcast({
        type: 'maintenance',
        subject: `[CRITICAL OUTAGE] ${title}`,
        message: msg,
        audience: 'all'
      });
      qc.invalidateQueries(['admin-broadcasts']);
      toast.success('Platform incident declared & broadcasted to all organizations!');
      setTitle('');
      setMsg('');
    } catch {
      toast.error('Failed to trigger platform incident');
    } finally {
      setDeclaring(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 780 }}>
      <div className="glass-card" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#e11d48', display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.5rem' }}><AlertCircle size={20} /> Trigger Platform Incident</h2>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>This dispatches an emergency notification across all tenant dashboards immediately. Use only for critical outages.</p>
        
        <form onSubmit={handleIncident} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Incident Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Degraded Performance in US-East" className="input-field" style={{ width: '100%' }} required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Status Message</label>
            <textarea value={msg} onChange={e => setMsg(e.target.value)} placeholder="We are currently investigating an issue..." rows={3} className="input-field" style={{ width: '100%', resize: 'none' }} required />
          </div>
          <button type="submit" disabled={declaring} className="btn btn-primary" style={{ background: '#e11d48', borderColor: '#e11d48' }}>
            {declaring ? 'Declaring Incident...' : 'Declare Incident'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Main Hub ──────────────────────────────────────────────────────────────────
export default function GlobalCommunicationHub() {
  const [activeTab, setActiveTab] = useState('broadcasts');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1.5rem' }}>
        <div>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-600)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Marketing & Alerts</p>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>Communication Hub</h1>
        </div>
        
        <div style={{ display: 'flex', background: 'var(--surface-1)', padding: 6, borderRadius: 16, border: '1px solid var(--glass-border)', gap: 4, overflowX: 'auto' }}>
          {[
            { id: 'broadcasts', label: 'Broadcasts', icon: Megaphone },
            { id: 'workflows', label: 'Automated Workflows', icon: Zap },
            { id: 'outages', label: 'Incident Alerts', icon: AlertCircle },
          ].map(t => (
            <button 
              key={t.id} onClick={() => setActiveTab(t.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.625rem 1.25rem', borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem', transition: 'all 0.2s', whiteSpace: 'nowrap', background: activeTab === t.id ? 'white' : 'transparent', color: activeTab === t.id ? 'var(--brand-600)' : 'var(--text-muted)', boxShadow: activeTab === t.id ? '0 2px 8px rgba(0,0,0,0.06)' : 'none' }}>
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'broadcasts' && <BroadcastsTab />}
      {activeTab === 'workflows' && <AutomatedWorkflowsTab />}
      {activeTab === 'outages' && <OutageAlertsTab />}
    </div>
  );
}
