import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '../../services/api.service';
import Loader from '../../components/ui/Loader';
import {
  LifeBuoy, Search, Clock, MessageSquare, AlertTriangle, CheckCircle, 
  Circle, AlertOctagon, User, ChevronRight, ArrowLeft, Send, Tag,
  FileText, Activity, Lightbulb, Plus, ThumbsUp, MoreVertical, LayoutGrid
} from 'lucide-react';
import toast from 'react-hot-toast';

const PRIORITY_META = {
  critical: { label: 'Critical',  color: '#dc2626', bg: '#fef2f2', border: '#fecaca', icon: AlertOctagon },
  high:     { label: 'High',      color: '#d97706', bg: '#fffbeb', border: '#fde68a', icon: AlertTriangle },
  medium:   { label: 'Medium',    color: '#0e7490', bg: '#ecfeff', border: '#a5f3fc', icon: Circle },
  low:      { label: 'Low',       color: '#4b5563', bg: '#f9fafb', border: '#e5e7eb', icon: Circle },
};

const STATUS_META = {
  open:        { label: 'Open',        color: '#dc2626', bg: '#fef2f2' },
  in_progress: { label: 'In Progress', color: '#d97706', bg: '#fffbeb' },
  resolved:    { label: 'Resolved',    color: '#16a34a', bg: '#f0fdf4' },
};

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (h < 1) return 'Just now';
  if (h < 24) return `${h}h ago`;
  return `${d}d ago`;
}

// ── Tab 1: Ticket Inbox (Old Page) ───────────────────────────────────────────
function TicketInboxTab() {
  const [tickets, setTickets] = useState([
    { id: 'TKT-104', subject: 'Database sync failure', org: 'TechGlobal Inc', category: 'Infrastructure', priority: 'critical', status: 'open', createdAt: new Date(Date.now() - 3600000).toISOString(), replies: 1 },
    { id: 'TKT-105', subject: 'How to add co-teachers?', org: 'EduStart', category: 'General', priority: 'low', status: 'resolved', createdAt: new Date(Date.now() - 86400000).toISOString(), replies: 4 },
  ]);

  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);

  const filtered = tickets.filter(t => {
    const matchSearch = t.subject.toLowerCase().includes(search.toLowerCase()) || t.org.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = tickets.reduce((acc, t) => { acc[t.status] = (acc[t.status] || 0) + 1; return acc; }, {});

  const handleReply = async (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    setSending(true);
    await new Promise(r => setTimeout(r, 600));
    setTickets(prev => prev.map(t => t.id === selected.id ? { ...t, status: 'in_progress', replies: t.replies + 1 } : t));
    setSelected(prev => ({ ...prev, status: 'in_progress', replies: prev.replies + 1 }));
    setReply('');
    setSending(false);
    toast.success('Reply sent');
  };

  const handleResolve = () => {
    setTickets(prev => prev.map(t => t.id === selected.id ? { ...t, status: 'resolved' } : t));
    setSelected(prev => ({ ...prev, status: 'resolved' }));
    toast.success('Ticket marked as resolved');
  };

  if (selected) {
    const priority = PRIORITY_META[selected.priority];
    const status = STATUS_META[selected.status];
    const PriorityIcon = priority.icon;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <button onClick={() => setSelected(null)} className="btn btn-ghost btn-sm" style={{ gap: 6, alignSelf: 'flex-start', color: 'var(--text-muted)' }}><ArrowLeft size={15} /> Back to Tickets</button>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1.5rem', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="glass-card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', background: 'var(--surface-2)', padding: '2px 8px', borderRadius: 4, fontFamily: 'monospace' }}>{selected.id}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: priority.color, background: priority.bg, border: `1px solid ${priority.border}`, padding: '2px 8px', borderRadius: 999, display: 'flex', alignItems: 'center', gap: 4 }}><PriorityIcon size={11} /> {priority.label}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: status.color, background: status.bg, padding: '2px 8px', borderRadius: 999 }}>{status.label}</span>
                  </div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>{selected.subject}</h2>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 6 }}>From <strong style={{ color: 'var(--text-secondary)' }}>{selected.org}</strong> · {timeAgo(selected.createdAt)}</p>
                </div>
              </div>
              <div style={{ background: 'var(--surface-1)', borderRadius: 12, padding: '1.25rem', marginBottom: '1.25rem', border: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}><div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--brand-100)', color: 'var(--brand-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>T</div><span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>Tenant Admin</span><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>· {timeAgo(selected.createdAt)}</span></div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>We are experiencing issues with <strong>{selected.category}</strong>. Our users are reporting problems. Please advise urgently.</p>
              </div>
              <form onSubmit={handleReply} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <textarea value={reply} onChange={e => setReply(e.target.value)} placeholder="Write your reply..." rows={4} className="input-field" style={{ width: '100%', resize: 'vertical', lineHeight: 1.65 }} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="submit" disabled={sending || !reply.trim()} className="btn btn-primary" style={{ gap: 6 }}><Send size={14} /> {sending ? 'Sending...' : 'Send Reply'}</button>
                  {selected.status !== 'resolved' && <button type="button" onClick={handleResolve} className="btn btn-secondary" style={{ gap: 6, color: '#059669', borderColor: '#a7f3d0' }}><CheckCircle size={14} /> Mark Resolved</button>}
                </div>
              </form>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.875rem', marginBottom: '1rem' }}>Ticket Details</h3>
              {[ ['Organization', selected.org], ['Category', selected.category], ['Opened', new Date(selected.createdAt).toLocaleDateString()], ['Replies', selected.replies] ].map(([k, v]) => (
                <div key={k} style={{ marginBottom: '0.875rem' }}><p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 3 }}>{k}</p><p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 600 }}>{v}</p></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
        {[
          { key: 'all',        label: 'All Tickets',  count: tickets.length },
          { key: 'open',       label: 'Open',         count: counts.open || 0,        color: '#dc2626', bg: '#fef2f2' },
          { key: 'in_progress',label: 'In Progress',  count: counts.in_progress || 0, color: '#d97706', bg: '#fffbeb' },
          { key: 'resolved',   label: 'Resolved',     count: counts.resolved || 0,    color: '#16a34a', bg: '#f0fdf4' },
        ].map(({ key, label, count, color, bg }) => {
          const active = statusFilter === key;
          const c = color || 'var(--brand-500)';
          const b = bg || 'var(--brand-50)';
          return (
            <button key={key} onClick={() => setStatusFilter(key)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 999, border: `2px solid ${active ? c : 'var(--glass-border)'}`, background: active ? b : 'transparent', color: active ? c : 'var(--text-muted)', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}>
              {label} <span style={{ background: active ? c : 'var(--surface-3)', color: active ? 'white' : 'var(--text-secondary)', borderRadius: 999, padding: '1px 7px', fontSize: '0.6875rem', fontWeight: 700 }}>{count}</span>
            </button>
          );
        })}
      </div>

      <div className="glass-card" style={{ padding: 0 }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--surface-1)', borderTopLeftRadius: 'inherit', borderTopRightRadius: 'inherit' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 340 }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input type="text" placeholder="Search tickets..." value={search} onChange={e => setSearch(e.target.value)} className="input-field" style={{ paddingLeft: '2.25rem', width: '100%', height: 36, fontSize: '0.875rem' }} />
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, background: 'var(--surface-0)', padding: '4px 10px', borderRadius: 999, border: '1px solid var(--glass-border)', flexShrink: 0 }}>{filtered.length} tickets</span>
        </div>

        {!filtered.length ? (
          <div style={{ padding: '4rem', textAlign: 'center' }}><LifeBuoy size={32} color="var(--text-muted)" style={{ margin: '0 auto 1rem', opacity: 0.4 }} /><p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>No tickets match your filters.</p></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filtered.map((ticket, i) => {
              const priority = PRIORITY_META[ticket.priority];
              const status = STATUS_META[ticket.status];
              const PIcon = priority.icon;
              return (
                <div key={ticket.id} onClick={() => setSelected(ticket)} style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.25rem 1.5rem', cursor: 'pointer', borderBottom: i < filtered.length - 1 ? '1px solid var(--glass-border)' : 'none', transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-1)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: priority.bg, border: `1px solid ${priority.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><PIcon size={16} color={priority.color} /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{ticket.id}</span>
                      <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: priority.color, background: priority.bg, border: `1px solid ${priority.border}`, padding: '1px 6px', borderRadius: 999 }}>{priority.label}</span>
                      <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: status.color, background: status.bg, padding: '1px 6px', borderRadius: 999 }}>{status.label}</span>
                    </div>
                    <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ticket.subject}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginTop: 4 }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}><User size={11} /> {ticket.org}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}><Tag size={11} /> {ticket.category}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={11} /> {timeAgo(ticket.createdAt)}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8125rem', color: 'var(--text-muted)' }}><MessageSquare size={13} /> {ticket.replies}</span><ChevronRight size={16} color="var(--text-muted)" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Tab 2: SLA Monitor ────────────────────────────────────────────────────────
function SLAMonitorTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        <div className="stat-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1rem' }}><div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--brand-50)', border: '1px solid var(--brand-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-600)' }}><Activity size={20} /></div><p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Avg Response Time</p></div>
          <p style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>1.4 hrs</p>
        </div>
        <div className="stat-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1rem' }}><div style={{ width: 40, height: 40, borderRadius: 12, background: '#ecfdf5', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}><CheckCircle size={20} /></div><p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>SLA Compliance</p></div>
          <p style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>98.2%</p>
        </div>
        <div className="stat-card" style={{ padding: '1.5rem', background: '#fff1f2', borderColor: '#fecaca' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1rem' }}><div style={{ width: 40, height: 40, borderRadius: 12, background: '#fef2f2', border: '1px solid #fecdd3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e11d48' }}><AlertOctagon size={20} /></div><p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e11d48' }}>SLA Breaches (VIP)</p></div>
          <p style={{ fontSize: '2rem', fontWeight: 900, color: '#e11d48', lineHeight: 1 }}>1 Active</p>
        </div>
      </div>
      <div className="glass-card" style={{ padding: 0 }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--glass-border)', background: 'var(--surface-1)' }}><h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Priority Accounts at Risk</h3></div>
        <table className="table">
          <thead><tr><th>Organization</th><th>Plan Tier</th><th>Ticket ID</th><th>Time Elapsed</th><th>Status</th></tr></thead>
          <tbody>
            <tr>
              <td><span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>TechGlobal Inc</span></td>
              <td><span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4f46e5', background: '#eef2ff', padding: '2px 8px', borderRadius: 999 }}>Enterprise</span></td>
              <td><span style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>TKT-104</span></td>
              <td><span style={{ fontWeight: 800, color: '#e11d48' }}>26.4 hrs</span> <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>(SLA: 24h)</span></td>
              <td><span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#e11d48', background: '#fff1f2', border: '1px solid #fecdd3', padding: '2px 8px', borderRadius: 999 }}>BREACHED</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Tab 3: Knowledge Base ─────────────────────────────────────────────────────
function KnowledgeBaseTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}><button className="btn btn-primary" style={{ gap: 8 }}><Plus size={16} /> New Article</button></div>
      <div className="glass-card" style={{ padding: 0 }}>
        <table className="table">
          <thead><tr><th>Article Title</th><th>Category</th><th>Views</th><th>Helpful Rating</th><th>Status</th><th></th></tr></thead>
          <tbody>
            <tr>
              <td><div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FileText size={14} /></div><span style={{ fontWeight: 600 }}>Configuring Custom SSL Domains</span></div></td>
              <td><span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Infrastructure</span></td>
              <td><span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>4.2k</span></td>
              <td><span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#059669' }}>94%</span></td>
              <td><span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '2px 8px', borderRadius: 999 }}>Published</span></td>
              <td><button className="btn btn-ghost btn-icon btn-sm"><MoreVertical size={14} /></button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Tab 4: Feature Requests ───────────────────────────────────────────────────
function FeatureRequestsTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="glass-card" style={{ padding: 0 }}>
        <table className="table">
          <thead><tr><th>Feature Proposal</th><th>Submitted By</th><th>Votes</th><th>Status</th></tr></thead>
          <tbody>
            <tr>
              <td><div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><div style={{ width: 32, height: 32, borderRadius: 8, background: '#fffbeb', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}><Lightbulb size={14} /></div><div><p style={{ fontWeight: 600 }}>SSO Integration with Okta</p><p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Support SAML 2.0 for enterprise tenants.</p></div></div></td>
              <td><span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>EduStart</span></td>
              <td><span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, color: 'var(--brand-600)' }}><ThumbsUp size={14}/> 142</span></td>
              <td><span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1d4ed8', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: 999 }}>PLANNED</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main Hub ──────────────────────────────────────────────────────────────────
export default function GlobalServiceHub() {
  const [activeTab, setActiveTab] = useState('inbox');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1.5rem' }}>
        <div>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-600)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Support & Community</p>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>Service & Helpdesk Hub</h1>
        </div>
        
        <div style={{ display: 'flex', background: 'var(--surface-1)', padding: 6, borderRadius: 16, border: '1px solid var(--glass-border)', gap: 4, overflowX: 'auto' }}>
          {[
            { id: 'inbox', label: 'Ticket Inbox', icon: MessageSquare },
            { id: 'sla', label: 'SLA Monitor', icon: Activity },
            { id: 'knowledge', label: 'Knowledge Base', icon: LayoutGrid },
            { id: 'feedback', label: 'Feature Requests', icon: Lightbulb },
          ].map(t => (
            <button 
              key={t.id} onClick={() => setActiveTab(t.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.625rem 1.25rem', borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem', transition: 'all 0.2s', whiteSpace: 'nowrap', background: activeTab === t.id ? 'white' : 'transparent', color: activeTab === t.id ? 'var(--brand-600)' : 'var(--text-muted)', boxShadow: activeTab === t.id ? '0 2px 8px rgba(0,0,0,0.06)' : 'none' }}>
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'inbox' && <TicketInboxTab />}
      {activeTab === 'sla' && <SLAMonitorTab />}
      {activeTab === 'knowledge' && <KnowledgeBaseTab />}
      {activeTab === 'feedback' && <FeatureRequestsTab />}
    </div>
  );
}
