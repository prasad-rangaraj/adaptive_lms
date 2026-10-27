import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../../services/api.service';
import Loader from '../../components/ui/Loader';
import {
  LifeBuoy, Search, Clock, MessageSquare, AlertTriangle, CheckCircle, 
  Circle, AlertOctagon, User, ChevronRight, ArrowLeft, Send, Tag,
  FileText, Activity, Lightbulb, Plus, ThumbsUp, MoreVertical, LayoutGrid, Loader2
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
  if (!iso) return 'Just now';
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (h < 1) return 'Just now';
  if (h < 24) return `${h}h ago`;
  return `${d}d ago`;
}

// ── Tab 1: Ticket Inbox ───────────────────────────────────────────────────────
function TicketInboxTab() {
  const qc = useQueryClient();
  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['supportTickets'],
    queryFn: () => adminAPI.getSupportTickets().then(r => r.data),
  });

  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [reply, setReply] = useState('');

  const replyMutation = useMutation({
    mutationFn: ({ ticketId, message }) => adminAPI.replyToTicket(ticketId, message),
    onSuccess: (res) => {
      qc.invalidateQueries(['supportTickets']);
      setSelected(prev => prev ? { ...prev, status: res.data.status, replies: res.data.replies } : null);
      setReply('');
      toast.success(res.data.message || 'Reply dispatched');
    },
    onError: () => toast.error('Failed to dispatch reply')
  });

  const statusMutation = useMutation({
    mutationFn: ({ ticketId, status }) => adminAPI.updateTicketStatus(ticketId, status),
    onSuccess: (res) => {
      qc.invalidateQueries(['supportTickets']);
      setSelected(prev => prev ? { ...prev, status: res.data.status } : null);
      toast.success(res.data.message || 'Status updated');
    },
    onError: () => toast.error('Failed to update status')
  });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newCategory, setNewCategory] = useState('General Technical Support');
  const [newPriority, setNewPriority] = useState('medium');
  const [newDescription, setNewDescription] = useState('');

  const createMutation = useMutation({
    mutationFn: (data) => adminAPI.createTicket(data),
    onSuccess: (res) => {
      qc.invalidateQueries(['supportTickets']);
      setShowCreateModal(false);
      setNewSubject('');
      setNewDescription('');
      toast.success(`Ticket ${res.data.id} created.`);
    },
    onError: (err) => {
      const msg = err.response?.data?.detail || 'Failed to create ticket';
      toast.error(msg);
    }
  });

  const filtered = tickets.filter(t => {
    const matchSearch = (t.subject || '').toLowerCase().includes(search.toLowerCase()) || (t.org || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = tickets.reduce((acc, t) => { acc[t.status] = (acc[t.status] || 0) + 1; return acc; }, {});

  const handleReply = (e) => {
    e.preventDefault();
    if (!reply.trim() || !selected) return;
    replyMutation.mutate({ ticketId: selected.id, message: reply });
  };

  const handleResolve = () => {
    if (!selected) return;
    statusMutation.mutate({ ticketId: selected.id, status: 'resolved' });
  };

  if (isLoading) return <Loader text="Loading support tickets..." />;

  if (selected) {
    const priority = PRIORITY_META[selected.priority] || PRIORITY_META.medium;
    const status = STATUS_META[selected.status] || STATUS_META.open;
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}><div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--brand-100)', color: 'var(--brand-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>{selected.raised_by?.[0] || 'T'}</div><span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{selected.raised_by || 'Tenant Admin'}</span><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>· {timeAgo(selected.createdAt)}</span></div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>{selected.description || `Issue relating to ${selected.category}. Needs administrator attention.`}</p>
              </div>
              <form onSubmit={handleReply} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <textarea value={reply} onChange={e => setReply(e.target.value)} placeholder="Write your reply to this ticket..." rows={4} className="input-field" style={{ width: '100%', resize: 'vertical', lineHeight: 1.65 }} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="submit" disabled={replyMutation.isPending || !reply.trim()} className="btn btn-primary" style={{ gap: 6 }}>
                    {replyMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} {replyMutation.isPending ? 'Sending...' : 'Send Reply'}
                  </button>
                  {selected.status !== 'resolved' && (
                    <button type="button" onClick={handleResolve} disabled={statusMutation.isPending} className="btn btn-secondary" style={{ gap: 6, color: '#059669', borderColor: '#a7f3d0' }}>
                      <CheckCircle size={14} /> {statusMutation.isPending ? 'Resolving...' : 'Mark Resolved'}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.875rem', marginBottom: '1rem' }}>Ticket Details</h3>
              {[ ['Organization', selected.org], ['Category', selected.category], ['Opened', selected.createdAt ? new Date(selected.createdAt).toLocaleDateString() : '—'], ['Replies', selected.replies] ].map(([k, v]) => (
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
      {/* Segmented Status Toggle Dock */}
      <div style={{ display: 'inline-flex', background: 'var(--surface-0)', padding: 5, borderRadius: 16, border: '1.5px solid var(--glass-border)', gap: 4, flexWrap: 'wrap', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
        {[
          { key: 'all',        label: 'All Tickets',  count: tickets.length, color: 'var(--brand-600)' },
          { key: 'open',       label: 'Open',         count: counts.open || 0,        color: '#dc2626' },
          { key: 'in_progress',label: 'In Progress',  count: counts.in_progress || 0, color: '#d97706' },
          { key: 'resolved',   label: 'Resolved',     count: counts.resolved || 0,    color: '#16a34a' },
        ].map(({ key, label, count, color }) => {
          const active = statusFilter === key;
          return (
            <button 
              key={key} 
              onClick={() => setStatusFilter(key)} 
              style={{ 
                display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px', borderRadius: 11, 
                border: active ? `1.5px solid ${color}` : '1.5px solid transparent', 
                background: active ? `${color}12` : 'transparent', 
                color: active ? color : 'var(--text-secondary)', 
                fontSize: '0.8125rem', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s',
                boxShadow: active ? `0 2px 8px ${color}20` : 'none'
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--surface-1)'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
            >
              <span>{label}</span>
              <span style={{ 
                background: active ? color : 'var(--surface-2)', 
                color: active ? 'white' : 'var(--text-muted)', 
                borderRadius: 999, padding: '2px 8px', fontSize: '0.6875rem', fontWeight: 800,
                transition: 'all 0.2s'
              }}>
                {count}
              </span>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 'auto' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, background: 'var(--surface-0)', padding: '4px 10px', borderRadius: 999, border: '1px solid var(--glass-border)', flexShrink: 0 }}>{filtered.length} tickets</span>
            <button onClick={() => setShowCreateModal(true)} className="btn btn-primary btn-sm" style={{ gap: 6, fontWeight: 700 }}>
              <Plus size={14} /> New Ticket
            </button>
          </div>
        </div>

        {!filtered.length ? (
          <div style={{ padding: '4rem', textAlign: 'center' }}><LifeBuoy size={32} color="var(--text-muted)" style={{ margin: '0 auto 1rem', opacity: 0.4 }} /><p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>No tickets match your filters.</p></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filtered.map((ticket, i) => {
              const priority = PRIORITY_META[ticket.priority] || PRIORITY_META.medium;
              const status = STATUS_META[ticket.status] || STATUS_META.open;
              const PIcon = priority.icon || Circle;
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

      {/* Super Admin Ticket Creation Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem'
        }}>
          <div className="glass-card animate-scale-in" style={{
            width: '100%', maxWidth: 580, background: 'var(--surface-0)',
            borderRadius: 20, border: '1px solid var(--glass-border)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden'
          }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface-1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--brand-100)', color: 'var(--brand-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Plus size={18} />
                </div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Create Platform Service Ticket
                </h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--text-muted)' }}>
                ✕
              </button>
            </div>

            <form onSubmit={e => {
              e.preventDefault();
              if (!newSubject.trim() || !newDescription.trim()) return;
              createMutation.mutate({
                subject: newSubject.trim(),
                category: newCategory,
                priority: newPriority,
                description: newDescription.trim()
              });
            }} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Scheduled Maintenance for DB Cluster"
                  value={newSubject}
                  onChange={e => setNewSubject(e.target.value)}
                  className="input-field"
                  style={{ width: '100%', fontSize: '0.875rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4 }}>
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    className="input-field"
                    style={{ width: '100%', fontSize: '0.875rem' }}
                  >
                    <option value="General Technical Support">General Technical Support</option>
                    <option value="Authentication & SSO">Authentication & SSO</option>
                    <option value="Infrastructure & Latency">Infrastructure & Latency</option>
                    <option value="AI Features & Engine Tuning">AI Features & Engine Tuning</option>
                    <option value="Billing & Monetization">Billing & Monetization</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4 }}>
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={e => setNewPriority(e.target.value)}
                    className="input-field"
                    style={{ width: '100%', fontSize: '0.875rem' }}
                  >
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  Description *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explain the technical issue or operational task..."
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  className="input-field"
                  style={{ width: '100%', resize: 'vertical', fontSize: '0.875rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={createMutation.isPending} className="btn btn-primary" style={{ gap: 6 }}>
                  {createMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  {createMutation.isPending ? 'Creating...' : 'Create Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tab 2: SLA Monitor ────────────────────────────────────────────────────────
function SLAMonitorTab() {
  const { data: tickets = [] } = useQuery({
    queryKey: ['supportTickets'],
    queryFn: () => adminAPI.getSupportTickets().then(r => r.data),
  });

  const activeTickets = tickets.filter(t => t.status !== 'resolved' && t.status !== 'closed');
  const criticalCount = activeTickets.filter(t => t.priority === 'critical' || t.priority === 'high').length;

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
        <div className="stat-card" style={{ padding: '1.5rem', background: criticalCount > 0 ? '#fff1f2' : '#f0fdf4', borderColor: criticalCount > 0 ? '#fecaca' : '#bbf7d0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1rem' }}><div style={{ width: 40, height: 40, borderRadius: 12, background: criticalCount > 0 ? '#fef2f2' : '#ecfdf5', border: `1px solid ${criticalCount > 0 ? '#fecdd3' : '#a7f3d0'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: criticalCount > 0 ? '#e11d48' : '#059669' }}><AlertOctagon size={20} /></div><p style={{ fontSize: '0.875rem', fontWeight: 600, color: criticalCount > 0 ? '#e11d48' : '#059669' }}>Active Urgent Tickets</p></div>
          <p style={{ fontSize: '2rem', fontWeight: 900, color: criticalCount > 0 ? '#e11d48' : '#059669', lineHeight: 1 }}>{criticalCount} Active</p>
        </div>
      </div>
      <div className="glass-card" style={{ padding: 0 }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--glass-border)', background: 'var(--surface-1)' }}><h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Priority Accounts & Live Tickets</h3></div>
        {!activeTickets.length ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <CheckCircle size={24} color="#16a34a" style={{ margin: '0 auto 0.5rem' }} />
            <p style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>All tickets resolved within SLA targets.</p>
          </div>
        ) : (
          <table className="table">
            <thead><tr><th>Organization</th><th>Ticket ID</th><th>Subject</th><th>Priority</th><th>Opened</th><th>Status</th></tr></thead>
            <tbody>
              {activeTickets.map(t => (
                <tr key={t.id}>
                  <td><span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{t.org}</span></td>
                  <td><span style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>{t.id}</span></td>
                  <td><span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{t.subject}</span></td>
                  <td><span style={{ fontSize: '0.75rem', fontWeight: 700, color: PRIORITY_META[t.priority]?.color || '#d97706', textTransform: 'uppercase' }}>{t.priority}</span></td>
                  <td><span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{timeAgo(t.createdAt)}</span></td>
                  <td><span style={{ fontSize: '0.75rem', fontWeight: 700, color: STATUS_META[t.status]?.color || '#d97706', background: STATUS_META[t.status]?.bg || '#fffbeb', border: '1px solid var(--glass-border)', padding: '2px 8px', borderRadius: 999 }}>{t.status.toUpperCase()}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
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
        
        {/* Segmented Service Command Dock */}
        <div className="hide-scrollbar" style={{
          display: 'flex', background: 'var(--surface-0)', padding: 6,
          borderRadius: 20, border: '1.5px solid var(--glass-border)', gap: 6,
          overflowX: 'auto', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', flexWrap: 'nowrap'
        }}>
          {[
            { id: 'inbox', label: 'Ticket Inbox', icon: MessageSquare },
            { id: 'sla', label: 'SLA Monitor', icon: Activity },
            { id: 'knowledge', label: 'Knowledge Base', icon: LayoutGrid },
            { id: 'feedback', label: 'Feature Requests', icon: Lightbulb },
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
                  boxShadow: isActive ? '0 4px 14px var(--brand-500)20, inset 0 1px 1px white' : 'none' 
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

      {activeTab === 'inbox' && <TicketInboxTab />}
      {activeTab === 'sla' && <SLAMonitorTab />}
      {activeTab === 'knowledge' && <KnowledgeBaseTab />}
      {activeTab === 'feedback' && <FeatureRequestsTab />}
    </div>
  );
}
