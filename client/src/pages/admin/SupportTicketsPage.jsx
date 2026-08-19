import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '../../services/api.service';
import Loader from '../../components/ui/Loader';
import {
  LifeBuoy, Search, Clock, MessageSquare, AlertTriangle,
  CheckCircle, Circle, AlertOctagon, User, ChevronRight,
  ArrowLeft, Send, Tag,
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

export default function SupportTicketsPage() {
  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['support-tickets'],
    queryFn: () => adminAPI.getSupportTickets().then(r => r.data),
  });

  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);

  if (isLoading) return <Loader text="Loading tickets..." />;

  const filtered = tickets.filter(t => {
    const matchSearch = t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.org.toLowerCase().includes(search.toLowerCase());
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

  // Ticket detail panel
  if (selected) {
    const priority = PRIORITY_META[selected.priority];
    const status = STATUS_META[selected.status];
    const PriorityIcon = priority.icon;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <button onClick={() => setSelected(null)} className="btn btn-ghost btn-sm" style={{ gap: 6, alignSelf: 'flex-start', color: 'var(--text-muted)' }}>
          <ArrowLeft size={15} /> Back to Tickets
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1.5rem', alignItems: 'start' }}>
          {/* Main panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="glass-card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', background: 'var(--surface-2)', padding: '2px 8px', borderRadius: 4, fontFamily: 'monospace' }}>{selected.id}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: priority.color, background: priority.bg, border: `1px solid ${priority.border}`, padding: '2px 8px', borderRadius: 999, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <PriorityIcon size={11} /> {priority.label}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: status.color, background: status.bg, padding: '2px 8px', borderRadius: 999 }}>
                      {status.label}
                    </span>
                  </div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>{selected.subject}</h2>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 6 }}>
                    From <strong style={{ color: 'var(--text-secondary)' }}>{selected.org}</strong> · {timeAgo(selected.createdAt)}
                  </p>
                </div>
              </div>

              {/* Mock conversation thread */}
              <div style={{ background: 'var(--surface-1)', borderRadius: 12, padding: '1.25rem', marginBottom: '1.25rem', border: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--brand-100)', color: 'var(--brand-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>T</div>
                  <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>Tenant Admin</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>· {timeAgo(selected.createdAt)}</span>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                  We are experiencing issues with <strong>{selected.category}</strong>. Our users are reporting problems and this is affecting day-to-day operations. Please advise urgently.
                </p>
              </div>

              {/* Reply form */}
              <form onSubmit={handleReply} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <textarea
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  placeholder="Write your reply..."
                  rows={4}
                  className="input-field"
                  style={{ width: '100%', resize: 'vertical', lineHeight: 1.65 }}
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="submit" disabled={sending || !reply.trim()} className="btn btn-primary" style={{ gap: 6 }}>
                    <Send size={14} /> {sending ? 'Sending...' : 'Send Reply'}
                  </button>
                  {selected.status !== 'resolved' && (
                    <button type="button" onClick={handleResolve} className="btn btn-secondary" style={{ gap: 6, color: '#059669', borderColor: '#a7f3d0' }}>
                      <CheckCircle size={14} /> Mark Resolved
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.875rem', marginBottom: '1rem' }}>Ticket Details</h3>
              {[
                ['Organization', selected.org],
                ['Category', selected.category],
                ['Opened', new Date(selected.createdAt).toLocaleDateString()],
                ['Replies', selected.replies],
              ].map(([k, v]) => (
                <div key={k} style={{ marginBottom: '0.875rem' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 3 }}>{k}</p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 600 }}>{v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title">Support Tickets</h1>
          <p className="page-subtitle">Manage and respond to support requests from tenant organizations.</p>
        </div>
      </div>

      {/* Status filter tabs */}
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
            <button key={key} onClick={() => setStatusFilter(key)} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: 999,
              border: `2px solid ${active ? c : 'var(--glass-border)'}`,
              background: active ? b : 'transparent',
              color: active ? c : 'var(--text-muted)',
              fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
            }}>
              {label}
              <span style={{ background: active ? c : 'var(--surface-3)', color: active ? 'white' : 'var(--text-secondary)', borderRadius: 999, padding: '1px 7px', fontSize: '0.6875rem', fontWeight: 700 }}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Ticket list */}
      <div className="glass-card" style={{ padding: 0 }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--surface-1)', borderTopLeftRadius: 'inherit', borderTopRightRadius: 'inherit' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 340 }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input type="text" placeholder="Search tickets..." value={search} onChange={e => setSearch(e.target.value)} className="input-field" style={{ paddingLeft: '2.25rem', width: '100%', height: 36, fontSize: '0.875rem' }} />
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, background: 'var(--surface-0)', padding: '4px 10px', borderRadius: 999, border: '1px solid var(--glass-border)', flexShrink: 0 }}>
            {filtered.length} tickets
          </span>
        </div>

        {!filtered.length ? (
          <div style={{ padding: '4rem', textAlign: 'center' }}>
            <LifeBuoy size={32} color="var(--text-muted)" style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
            <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>No tickets match your filters.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filtered.map((ticket, i) => {
              const priority = PRIORITY_META[ticket.priority];
              const status = STATUS_META[ticket.status];
              const PIcon = priority.icon;
              return (
                <div
                  key={ticket.id}
                  onClick={() => setSelected(ticket)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '1.25rem',
                    padding: '1.25rem 1.5rem', cursor: 'pointer',
                    borderBottom: i < filtered.length - 1 ? '1px solid var(--glass-border)' : 'none',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Priority icon */}
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: priority.bg, border: `1px solid ${priority.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <PIcon size={16} color={priority.color} />
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{ticket.id}</span>
                      <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: priority.color, background: priority.bg, border: `1px solid ${priority.border}`, padding: '1px 6px', borderRadius: 999 }}>{priority.label}</span>
                      <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: status.color, background: status.bg, padding: '1px 6px', borderRadius: 999 }}>{status.label}</span>
                    </div>
                    <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ticket.subject}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginTop: 4 }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <User size={11} /> {ticket.org}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Tag size={11} /> {ticket.category}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Clock size={11} /> {timeAgo(ticket.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Replies + chevron */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      <MessageSquare size={13} /> {ticket.replies}
                    </span>
                    <ChevronRight size={16} color="var(--text-muted)" />
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
