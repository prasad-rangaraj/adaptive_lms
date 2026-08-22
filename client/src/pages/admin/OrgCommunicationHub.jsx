import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tenantsAPI } from '../../services/api.service';
import { useAuthStore } from '../../store/authStore';
import {
  Megaphone, MessageSquare, LifeBuoy, Plus, Send, 
  Users, CheckCircle2, Clock, AlertCircle, CornerDownRight, Tag
} from 'lucide-react';

// ── Tab 1: Broadcasts ───────────────────────────────────────────────────────
function BroadcastsTab() {
  const { user } = useAuthStore();
  const { data, isLoading } = useQuery({
    queryKey: ['org-broadcasts', user?.tenant_id],
    queryFn: () => tenantsAPI.getBroadcasts(user?.tenant_id),
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-primary" style={{ gap: 8 }}><Plus size={16} /> New Broadcast</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {data?.broadcasts?.map(b => (
          <div key={b.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--brand-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-600)' }}><Megaphone size={18} /></div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{b.title}</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sent {new Date(b.created_at).toLocaleDateString()}</p>
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
          <button className="btn btn-primary" style={{ gap: 8 }}><Plus size={16} /> New Board</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {[
            { id: 1, name: 'General Announcements', threads: 142, flagged: 0, color: '#3b82f6' },
            { id: 2, name: 'Q&A Help Desk', threads: 856, flagged: 3, color: '#f59e0b' },
            { id: 3, name: 'Off-Topic & Social', threads: 204, flagged: 12, color: '#ef4444' },
          ].map(f => (
            <div key={f.id} style={{ padding: '1.5rem', background: 'var(--surface-1)', border: '1px solid var(--glass-border)', borderRadius: 16, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{f.name}</span>
                {f.flagged > 0 && <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ef4444', background: '#fef2f2', padding: '2px 8px', borderRadius: 999, display: 'flex', alignItems: 'center', gap: 4 }}><AlertCircle size={12} /> {f.flagged} Flagged</span>}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                <div><p style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)' }}>{f.threads}</p><p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Active Threads</p></div>
                <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>Manage</button>
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
            { id: '#TK-8041', student: 'Alex Mercer', issue: 'Cannot access Week 3 Module', status: 'Open', color: '#f59e0b', bg: '#fffbeb', icon: Clock, priority: 'High', pColor: '#ef4444' },
            { id: '#TK-8039', student: 'Sarah Jenkins', issue: 'Billing receipt requested', status: 'Resolved', color: '#10b981', bg: '#ecfdf5', icon: CheckCircle2, priority: 'Low', pColor: 'var(--text-muted)' },
          ].map(t => (
            <div key={t.id} className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', transition: 'all 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: 2 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.color }}>
                  <t.icon size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-primary)' }}>{t.issue}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--brand-500)' }}>{t.id}</span>
                    <span style={{ color: 'var(--glass-border)' }}>•</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t.student}</span>
                  </div>
                </div>
              </div>

              <div style={{ flex: 1, minWidth: 100 }}>
                <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: t.color, background: t.bg, padding: '4px 10px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t.status}</span>
              </div>

              <div style={{ flex: 1, minWidth: 100 }}>
                <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 2 }}>Priority</p>
                <p style={{ fontSize: '0.8125rem', fontWeight: 800, color: t.pColor }}>{t.priority}</p>
              </div>

              <div>
                <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>{t.status === 'Open' ? 'Reply' : 'View'} <CornerDownRight size={14} style={{ marginLeft: 4 }} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Hub ──────────────────────────────────────────────────────────────────
export default function OrgCommunicationHub() {
  const [activeTab, setActiveTab] = useState('broadcasts');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1.5rem' }}>
        <div style={{ flexShrink: 0 }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--brand-500)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Internal Communications</p>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.04em', lineHeight: 1.1 }}>Communication Hub</h1>
        </div>
        
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
