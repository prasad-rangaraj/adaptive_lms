import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { tenantsAPI } from '../../services/api.service';
import { useAuthStore } from '../../store/authStore';
import {
  Megaphone, MessageSquare, LifeBuoy, Plus, Send, 
  Users, CheckCircle2, Clock, AlertCircle, CornerDownRight, Tag, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import Loader from '../../components/ui/Loader';

// ── Tab 1: Broadcasts ───────────────────────────────────────────────────────
function BroadcastsTab() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [form, setForm] = useState({ title: '', message: '' });

  const { data: rawData, isLoading } = useQuery({
    queryKey: ['org-broadcasts', user?.tenant_id],
    queryFn: () => tenantsAPI.getBroadcasts(user?.tenant_id).then(res => res.data || res),
    enabled: !!user?.tenant_id,
  });

  const broadcasts = rawData?.broadcasts || (Array.isArray(rawData) ? rawData : []);

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) {
      toast.error('Title and message are required');
      return;
    }
    setIsSending(true);
    try {
      await tenantsAPI.sendBroadcast(user.tenant_id, form);
      queryClient.invalidateQueries(['org-broadcasts', user?.tenant_id]);
      toast.success('Broadcast sent to all members!');
      setShowModal(false);
      setForm({ title: '', message: '' });
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to dispatch broadcast');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ gap: 8 }}>
          <Plus size={16} /> New Broadcast
        </button>
      </div>

      {isLoading ? (
        <div style={{ padding: '3rem', textAlign: 'center' }}><Loader text="Loading broadcasts..." /></div>
      ) : broadcasts.length === 0 ? (
        <div style={{ padding: '4rem', textAlign: 'center', background: 'var(--surface-0)', borderRadius: 16, border: '1px dashed var(--surface-3)' }}>
          <Megaphone size={36} style={{ margin: '0 auto 12px', color: 'var(--surface-4)' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>No Broadcasts Sent</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Send high-priority system announcements to reach all students and staff.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {broadcasts.map(b => (
            <div key={b.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--brand-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-600)' }}><Megaphone size={18} /></div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{b.title}</h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sent {b.created_at ? new Date(b.created_at).toLocaleDateString() : 'Recently'}</p>
                  </div>
                </div>
                <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#10b981', background: '#ecfdf5', padding: '2px 8px', borderRadius: 999 }}>DELIVERED</span>
              </div>
              
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, background: 'var(--surface-1)', padding: '1rem', borderRadius: 12 }}>
                {b.message}
              </p>

              <div style={{ display: 'flex', gap: 12, marginTop: 'auto', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-600)', display: 'flex', alignItems: 'center', gap: 4 }}><Users size={14} /> To: {b.target_cohort_id ? 'Specific Cohort' : 'All Students'}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto' }}><CheckCircle2 size={14} color="#10b981" /> 100% Reach</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Broadcast Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: 520, padding: '2rem', background: 'var(--surface-0)', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>New System Broadcast</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSendBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: 6, color: 'var(--text-secondary)' }}>Announcement Title</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Campus Network Maintenance Tonight"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 10, border: '1px solid var(--surface-3)', background: 'var(--surface-1)', color: 'var(--text-primary)', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: 6, color: 'var(--text-secondary)' }}>Broadcast Content</label>
                <textarea
                  required
                  rows={4}
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  placeholder="Type your announcement details here..."
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 10, border: '1px solid var(--surface-3)', background: 'var(--surface-1)', color: 'var(--text-primary)', outline: 'none', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" disabled={isSending} className="btn btn-primary" style={{ gap: 6 }}>
                  <Send size={15} /> {isSending ? 'Transmitting...' : 'Send Broadcast'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tab 2: Community Forums ─────────────────────────────────────────────────
function ForumsTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="glass-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10 }}><MessageSquare size={22} color="var(--brand-500)" /> Community Moderation</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 4 }}>Manage discussion boards and review flagged messages.</p>
          </div>
          <button onClick={() => toast.success('Forum board creation is automated per department')} className="btn btn-primary" style={{ gap: 8 }}><Plus size={16} /> New Board</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {[
            { id: 1, name: 'General Announcements', threads: 142, flagged: 0, color: '#3b82f6' },
            { id: 2, name: 'Q&A Help Desk', threads: 856, flagged: 0, color: '#f59e0b' },
            { id: 3, name: 'Off-Topic & Social', threads: 204, flagged: 0, color: '#10b981' },
          ].map(f => (
            <div key={f.id} style={{ padding: '1.5rem', background: 'var(--surface-1)', border: '1px solid var(--glass-border)', borderRadius: 16, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{f.name}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#10b981', background: '#ecfdf5', padding: '2px 8px', borderRadius: 999 }}>Active</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                <div><p style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)' }}>{f.threads}</p><p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Active Threads</p></div>
                <button onClick={() => toast.success(`Viewing ${f.name} board moderation`)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>Manage</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Tab 3: Support Tickets ──────────────────────────────────────────────────
function SupportTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="glass-card" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10, marginBottom: '2rem' }}><LifeBuoy size={22} color="var(--brand-500)" /> IT & Student Helpdesk</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            { id: '#TK-8041', student: 'Alex Mercer', issue: 'Cannot access Week 3 Module', status: 'Resolved', color: '#10b981', bg: '#ecfdf5', icon: CheckCircle2, priority: 'Normal', pColor: 'var(--text-muted)' },
            { id: '#TK-8039', student: 'Sarah Jenkins', issue: 'Placement assessment score confirmation', status: 'Resolved', color: '#10b981', bg: '#ecfdf5', icon: CheckCircle2, priority: 'Low', pColor: 'var(--text-muted)' },
          ].map(t => (
            <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', background: 'var(--surface-1)', border: '1px solid var(--glass-border)', borderRadius: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ fontFamily: 'monospace', fontWeight: 800, color: 'var(--brand-600)', fontSize: '0.875rem' }}>{t.id}</span>
                <div>
                  <p style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>{t.issue}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>Submitted by <strong>{t.student}</strong></p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: t.color, background: t.bg, padding: '4px 10px', borderRadius: 999, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <t.icon size={12} /> {t.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function OrgCommunicationHub() {
  const [activeTab, setActiveTab] = useState('broadcasts');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'flex-end', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1.5rem' }}>
        <div className="hide-scrollbar" style={{ display: 'flex', background: 'var(--surface-1)', padding: 6, borderRadius: 16, border: '1px solid var(--glass-border)', gap: 4, overflowX: 'auto', flexWrap: 'nowrap' }}>
          {[
            { id: 'broadcasts', label: 'Broadcasts', icon: Megaphone },
            { id: 'forums', label: 'Community Forums', icon: MessageSquare },
            { id: 'support', label: 'Support Tickets', icon: LifeBuoy },
          ].map(t => (
            <button 
              key={t.id} onClick={() => setActiveTab(t.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.625rem 1.25rem', borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '0.875rem', transition: 'all 0.2s', whiteSpace: 'nowrap', background: activeTab === t.id ? 'white' : 'transparent', color: activeTab === t.id ? 'var(--brand-600)' : 'var(--text-muted)', boxShadow: activeTab === t.id ? '0 4px 12px rgba(0,0,0,0.08)' : 'none' }}>
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'broadcasts' && <BroadcastsTab />}
      {activeTab === 'forums' && <ForumsTab />}
      {activeTab === 'support' && <SupportTab />}
    </div>
  );
}
