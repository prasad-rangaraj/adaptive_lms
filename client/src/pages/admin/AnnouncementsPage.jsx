import { useState } from 'react';
import { Megaphone, Send, Building2, Globe, Clock, CheckCheck, ChevronDown, AlertCircle, Info, Star } from 'lucide-react';
import toast from 'react-hot-toast';

const TYPE_OPTIONS = [
  { key: 'info',        label: 'Informational', icon: Info,         color: '#4f46e5', bg: '#eef2ff', border: '#c7d2fe' },
  { key: 'maintenance', label: 'Maintenance',   icon: AlertCircle,  color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  { key: 'feature',     label: 'New Feature',   icon: Star,         color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
];

// Mock sent announcements
const MOCK_HISTORY = [
  {
    id: 1, type: 'info', subject: 'Platform Update v2.4 Released',
    message: 'We have deployed several performance improvements and bug fixes.',
    audience: 'all', sentAt: new Date(Date.now() - 86400000 * 2).toISOString(), readCount: 342,
  },
  {
    id: 2, type: 'maintenance', subject: 'Scheduled Maintenance — Sunday 2AM UTC',
    message: 'The platform will be unavailable for approximately 30 minutes for database migration.',
    audience: 'all', sentAt: new Date(Date.now() - 86400000 * 5).toISOString(), readCount: 501,
  },
  {
    id: 3, type: 'feature', subject: 'AI Proctoring v2 Now Available',
    message: 'Enterprise tenants now have access to our upgraded behavioral analysis engine.',
    audience: 'enterprise', sentAt: new Date(Date.now() - 86400000 * 9).toISOString(), readCount: 88,
  },
];

export default function AnnouncementsPage() {
  const [form, setForm] = useState({ type: 'info', subject: '', message: '', audience: 'all' });
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState(MOCK_HISTORY);

  const selectedType = TYPE_OPTIONS.find(t => t.key === form.type) || TYPE_OPTIONS[0];

  const handleSend = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) {
      toast.error('Subject and message are required.');
      return;
    }
    setSending(true);
    await new Promise(r => setTimeout(r, 800));
    const newAnnouncement = {
      id: history.length + 1,
      ...form,
      sentAt: new Date().toISOString(),
      readCount: 0,
    };
    setHistory([newAnnouncement, ...history]);
    setForm({ type: 'info', subject: '', message: '', audience: 'all' });
    setSending(false);
    toast.success('Announcement broadcast successfully!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title">Platform Announcements</h1>
          <p className="page-subtitle">Broadcast messages to all tenant organizations and users.</p>
        </div>
      </div>

      {/* Split layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: '1.5rem', alignItems: 'start' }}>

        {/* Left — History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Sent Announcements ({history.length})</h2>
          {history.map(a => {
            const typeMeta = TYPE_OPTIONS.find(t => t.key === a.type) || TYPE_OPTIONS[0];
            const TypeIcon = typeMeta.icon;
            return (
              <div key={a.id} className="glass-card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  {/* Icon */}
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: typeMeta.bg, border: `1px solid ${typeMeta.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <TypeIcon size={18} color={typeMeta.color} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                      <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>{a.subject}</p>
                      <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: typeMeta.color, background: typeMeta.bg, border: `1px solid ${typeMeta.border}`, padding: '2px 7px', borderRadius: 999 }}>
                        {typeMeta.label}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', lineHeight: 1.5 }}>{a.message}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Globe size={11} /> {a.audience === 'all' ? 'All Organizations' : `${a.audience} tier`}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={11} /> {new Date(a.sentAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>
                        <CheckCheck size={13} /> {a.readCount} reads
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right — Compose Form */}
        <div style={{ position: 'sticky', top: '1rem' }}>
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.5rem' }}>
              <Megaphone size={20} color="var(--brand-500)" /> New Announcement
            </h2>

            <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Type selector */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Type</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {TYPE_OPTIONS.map(t => {
                    const Icon = t.icon;
                    const active = form.type === t.key;
                    return (
                      <button key={t.key} type="button" onClick={() => setForm(f => ({ ...f, type: t.key }))} style={{
                        flex: 1, padding: '8px', borderRadius: 10, cursor: 'pointer',
                        border: `2px solid ${active ? t.color : 'var(--glass-border)'}`,
                        background: active ? t.bg : 'transparent',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                        transition: 'all 0.15s',
                      }}>
                        <Icon size={15} color={active ? t.color : 'var(--text-muted)'} />
                        <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: active ? t.color : 'var(--text-muted)' }}>{t.label.split(' ')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Audience */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  <Building2 size={13} style={{ display: 'inline', marginRight: 4 }} />Target Audience
                </label>
                <select value={form.audience} onChange={e => setForm(f => ({ ...f, audience: e.target.value }))} className="input-field" style={{ width: '100%' }}>
                  <option value="all">All Organizations</option>
                  <option value="enterprise">Enterprise Tier Only</option>
                  <option value="pro">Pro Tier Only</option>
                  <option value="basic">Basic Tier Only</option>
                </select>
              </div>

              {/* Subject */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Subject *</label>
                <input
                  value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  placeholder="e.g. Scheduled Maintenance Notice"
                  className="input-field"
                  style={{ width: '100%' }}
                  required
                />
              </div>

              {/* Message */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Message *</label>
                <textarea
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  placeholder="Write your announcement here..."
                  rows={4}
                  className="input-field"
                  style={{ width: '100%', resize: 'vertical', lineHeight: 1.6 }}
                  required
                />
              </div>

              {/* Preview strip */}
              {form.subject && (
                <div style={{ padding: '1rem', borderRadius: 10, background: selectedType.bg, border: `1px solid ${selectedType.border}` }}>
                  <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: selectedType.color, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Preview</p>
                  <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{form.subject}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 3, lineHeight: 1.5 }}>{form.message || '...'}</p>
                </div>
              )}

              <button type="submit" disabled={sending} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                <Send size={15} /> {sending ? 'Sending...' : 'Broadcast Announcement'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
