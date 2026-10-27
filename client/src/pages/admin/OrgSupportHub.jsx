import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tenantsAPI } from '../../services/api.service';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import {
  LifeBuoy, Plus, Search, Filter, Clock, MessageSquare, AlertTriangle,
  CheckCircle2, Circle, AlertOctagon, User, ArrowLeft, Send, Tag,
  FileText, Activity, ShieldCheck, ChevronRight, X, ExternalLink,
  HelpCircle, RefreshCw, Sparkles, Check, Copy, ChevronDown, CheckCircle
} from 'lucide-react';
import Loader from '../../components/ui/Loader';

const PRIORITY_META = {
  critical: { label: 'Critical', color: '#dc2626', bg: '#fef2f2', border: '#fecaca', icon: AlertOctagon, sla: '< 15 mins' },
  high:     { label: 'High',     color: '#d97706', bg: '#fffbeb', border: '#fde68a', icon: AlertTriangle, sla: '< 1 hour' },
  medium:   { label: 'Medium',   color: '#0284c7', bg: '#f0f9ff', border: '#bae6fd', icon: Circle,        sla: '< 4 hours' },
  low:      { label: 'Low',      color: '#4b5563', bg: '#f9fafb', border: '#e5e7eb', icon: Circle,        sla: '< 24 hours' },
};

const STATUS_META = {
  open:        { label: 'Open',        color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
  in_progress: { label: 'In Progress', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  resolved:    { label: 'Resolved',    color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  closed:      { label: 'Closed',      color: '#6b7280', bg: '#f3f4f6', border: '#e5e7eb' },
};

const CATEGORIES = [
  'All Categories',
  'Authentication & SSO',
  'Infrastructure & Latency',
  'AI Features & Engine Tuning',
  'Billing & Monetization',
  'Curriculum & Player',
  'General Technical Support'
];

function timeAgo(iso) {
  if (!iso) return 'Just now';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${d}d ago`;
}

export default function OrgSupportHub() {
  const { user } = useAuthStore();
  const tenantId = user?.tenant_id || 1;
  const qc = useQueryClient();

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedPriority, setSelectedPriority] = useState('all');

  const [activeTicket, setActiveTicket] = useState(null);
  const [showRaiseModal, setShowRaiseModal] = useState(false);
  const [replyText, setReplyText] = useState('');

  // Form state for raising ticket
  const [formSubject, setFormSubject] = useState('');
  const [formCategory, setFormCategory] = useState('General Technical Support');
  const [formPriority, setFormPriority] = useState('medium');
  const [formDescription, setFormDescription] = useState('');

  // Fetch Tickets
  const { data: tickets = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['tenantTickets', tenantId],
    queryFn: () => tenantsAPI.getTickets(tenantId).then(r => r.data),
    enabled: !!tenantId,
  });

  // Raise Ticket Mutation
  const createMutation = useMutation({
    mutationFn: (data) => tenantsAPI.createTicket(tenantId, data),
    onSuccess: (res) => {
      qc.invalidateQueries(['tenantTickets', tenantId]);
      qc.invalidateQueries(['supportTickets']); // Invalidate super admin tickets query if cached
      setShowRaiseModal(false);
      setFormSubject('');
      setFormDescription('');
      setFormPriority('medium');
      setFormCategory('General Technical Support');
      toast.success(`Support Ticket ${res.data.id} raised successfully! Platform operations alerted.`);
    },
    onError: (err) => {
      const msg = err.response?.data?.detail || 'Failed to submit support ticket.';
      toast.error(msg);
    }
  });

  // Reply Mutation
  const replyMutation = useMutation({
    mutationFn: ({ ticketId, message }) => tenantsAPI.replyTicket(tenantId, ticketId, message),
    onSuccess: (res) => {
      qc.invalidateQueries(['tenantTickets', tenantId]);
      qc.invalidateQueries(['supportTickets']);
      setReplyText('');
      setActiveTicket(prev => prev ? {
        ...prev,
        replies: res.data.replies,
        status: res.data.status
      } : null);
      toast.success('Your message was dispatched to platform engineering.');
    },
    onError: () => toast.error('Failed to dispatch message.')
  });

  // Filtered Tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      const matchSearch = 
        (t.subject || '').toLowerCase().includes(search.toLowerCase()) ||
        (t.id || '').toLowerCase().includes(search.toLowerCase()) ||
        (t.description || '').toLowerCase().includes(search.toLowerCase());
      const matchStatus = selectedStatus === 'all' || t.status === selectedStatus;
      const matchCategory = selectedCategory === 'All Categories' || t.category === selectedCategory;
      const matchPriority = selectedPriority === 'all' || t.priority === selectedPriority;
      return matchSearch && matchStatus && matchCategory && matchPriority;
    });
  }, [tickets, search, selectedStatus, selectedCategory, selectedPriority]);

  // Statistics
  const stats = useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter(t => t.status === 'open').length;
    const inProgress = tickets.filter(t => t.status === 'in_progress').length;
    const resolved = tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;
    return { total, open, inProgress, resolved };
  }, [tickets]);

  const handleRaiseSubmit = (e) => {
    e.preventDefault();
    if (!formSubject.trim() || !formDescription.trim()) {
      toast.error('Please enter both subject and description.');
      return;
    }
    createMutation.mutate({
      subject: formSubject.trim(),
      category: formCategory,
      priority: formPriority,
      description: formDescription.trim(),
    });
  };

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim() || !activeTicket) return;
    replyMutation.mutate({
      ticketId: activeTicket.id,
      message: replyText.trim()
    });
  };

  if (isLoading) return <Loader text="Loading support desk..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: 1400, margin: '0 auto' }}>
      
      {/* ── 1. Top Header Banner ── */}
      <div style={{
        background: 'linear-gradient(135deg, var(--surface-0), var(--brand-50))',
        borderRadius: 24,
        padding: '2.25rem 2.5rem',
        border: '1px solid var(--brand-100)',
        boxShadow: '0 8px 30px rgba(0,0,0,0.03)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: 700, position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 12px', background: 'var(--brand-100)', color: 'var(--brand-700)', borderRadius: 999, fontSize: '0.75rem', fontWeight: 800, marginBottom: 12 }}>
            <Activity size={14} className="animate-pulse" />
            24/7 SLA Platform Desk Active
          </div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
            Organization Support Desk
          </h1>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.6 }}>
            Raise operational issues, report outages, request AI quota upgrades, or inquire about custom LMS features directly with platform engineering.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 1 }}>
          <button 
            onClick={() => refetch()} 
            className="btn btn-secondary" 
            style={{ gap: 6 }} 
            disabled={isRefetching}
            title="Refresh tickets"
          >
            <RefreshCw size={15} className={isRefetching ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button 
            onClick={() => setShowRaiseModal(true)} 
            className="btn btn-primary" 
            style={{ 
              gap: 8, 
              padding: '0.75rem 1.5rem', 
              boxShadow: '0 4px 16px var(--brand-500)40',
              fontWeight: 800
            }}
          >
            <Plus size={18} />
            Raise Support Ticket
          </button>
        </div>
      </div>

      {/* ── 2. Stat KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        
        {/* Total Tickets */}
        <div className="glass-card" style={{ padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>All Tickets</span>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
              <LifeBuoy size={16} />
            </div>
          </div>
          <p style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0, lineHeight: 1 }}>
            {stats.total}
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>Total tickets logged</p>
        </div>

        {/* Open Tickets */}
        <div className="glass-card" style={{ 
          padding: '1.25rem 1.5rem',
          background: stats.open > 0 ? 'linear-gradient(135deg, var(--surface-0), #fff5f5)' : 'var(--surface-0)',
          borderColor: stats.open > 0 ? '#fecaca' : 'var(--glass-border)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: stats.open > 0 ? '#dc2626' : 'var(--text-muted)' }}>Open</span>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }}>
              <AlertOctagon size={16} />
            </div>
          </div>
          <p style={{ fontSize: '2rem', fontWeight: 900, color: stats.open > 0 ? '#dc2626' : 'var(--text-primary)', margin: 0, lineHeight: 1 }}>
            {stats.open}
          </p>
          <p style={{ fontSize: '0.75rem', color: stats.open > 0 ? '#dc2626' : 'var(--text-muted)', marginTop: 6 }}>
            {stats.open > 0 ? 'Awaiting response' : 'No pending tickets'}
          </p>
        </div>

        {/* In Progress */}
        <div className="glass-card" style={{ 
          padding: '1.25rem 1.5rem',
          background: stats.inProgress > 0 ? 'linear-gradient(135deg, var(--surface-0), #fffbeb)' : 'var(--surface-0)',
          borderColor: stats.inProgress > 0 ? '#fde68a' : 'var(--glass-border)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: stats.inProgress > 0 ? '#d97706' : 'var(--text-muted)' }}>In Progress</span>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
              <Clock size={16} />
            </div>
          </div>
          <p style={{ fontSize: '2rem', fontWeight: 900, color: stats.inProgress > 0 ? '#d97706' : 'var(--text-primary)', margin: 0, lineHeight: 1 }}>
            {stats.inProgress}
          </p>
          <p style={{ fontSize: '0.75rem', color: stats.inProgress > 0 ? '#d97706' : 'var(--text-muted)', marginTop: 6 }}>
            Active investigations
          </p>
        </div>

        {/* Resolved */}
        <div className="glass-card" style={{ padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>Resolved</span>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <p style={{ fontSize: '2rem', fontWeight: 900, color: '#16a34a', margin: 0, lineHeight: 1 }}>
            {stats.resolved}
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>Successfully closed</p>
        </div>

      </div>

      {/* ── 3. Filters & Controls ── */}
      <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          
          {/* Status Tabs */}
          <div style={{ display: 'flex', background: 'var(--surface-1)', padding: 4, borderRadius: 12, border: '1px solid var(--glass-border)', gap: 4 }}>
            {[
              { id: 'all', label: 'All Tickets', count: stats.total },
              { id: 'open', label: 'Open', count: stats.open },
              { id: 'in_progress', label: 'In Progress', count: stats.inProgress },
              { id: 'resolved', label: 'Resolved', count: stats.resolved },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '0.45rem 0.875rem', borderRadius: 8,
                  border: 'none', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 700, transition: 'all 0.15s',
                  background: selectedStatus === tab.id ? 'white' : 'transparent',
                  color: selectedStatus === tab.id ? 'var(--brand-600)' : 'var(--text-muted)',
                  boxShadow: selectedStatus === tab.id ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
                }}
              >
                <span>{tab.label}</span>
                <span style={{
                  fontSize: '0.6875rem', padding: '1px 6px', borderRadius: 999,
                  background: selectedStatus === tab.id ? 'var(--brand-100)' : 'var(--surface-2)',
                  color: selectedStatus === tab.id ? 'var(--brand-700)' : 'var(--text-muted)'
                }}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', width: 280 }}>
            <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by ID, subject..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field"
              style={{ width: '100%', paddingLeft: '2.25rem', paddingRight: '1rem', fontSize: '0.8125rem' }}
            />
          </div>

        </div>

        {/* Dropdown Filters row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', paddingTop: '0.5rem', borderTop: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Filter size={14} color="var(--text-muted)" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Filter:</span>
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            style={{
              padding: '0.375rem 0.75rem', borderRadius: 8, border: '1px solid var(--glass-border)',
              background: 'var(--surface-0)', fontSize: '0.8125rem', color: 'var(--text-primary)', outline: 'none'
            }}
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* Priority Dropdown */}
          <select
            value={selectedPriority}
            onChange={e => setSelectedPriority(e.target.value)}
            style={{
              padding: '0.375rem 0.75rem', borderRadius: 8, border: '1px solid var(--glass-border)',
              background: 'var(--surface-0)', fontSize: '0.8125rem', color: 'var(--text-primary)', outline: 'none'
            }}
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {(search || selectedStatus !== 'all' || selectedCategory !== 'All Categories' || selectedPriority !== 'all') && (
            <button
              onClick={() => { setSearch(''); setSelectedStatus('all'); setSelectedCategory('All Categories'); setSelectedPriority('all'); }}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '2px 8px' }}
            >
              Reset Filters
            </button>
          )}
        </div>

      </div>

      {/* ── 4. Main Tickets List ── */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        
        {filteredTickets.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--brand-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-600)' }}>
              <LifeBuoy size={26} />
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              No Support Tickets Found
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: 440, lineHeight: 1.6, margin: 0 }}>
              {tickets.length === 0 
                ? 'Your organization has not raised any support tickets yet. Click the button below if you need technical assistance or SLA escalation.'
                : 'No tickets matched your current search filters. Try clearing filters or search terms.'}
            </p>
            <button
              onClick={() => setShowRaiseModal(true)}
              className="btn btn-primary"
              style={{ gap: 8, marginTop: 8 }}
            >
              <Plus size={16} /> Raise Support Ticket
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filteredTickets.map((ticket, index) => {
              const priority = PRIORITY_META[ticket.priority] || PRIORITY_META.medium;
              const status = STATUS_META[ticket.status] || STATUS_META.open;
              const PriorityIcon = priority.icon;

              return (
                <div
                  key={ticket.id}
                  onClick={() => setActiveTicket(ticket)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.25rem',
                    padding: '1.25rem 1.5rem',
                    cursor: 'pointer',
                    borderBottom: index < filteredTickets.length - 1 ? '1px solid var(--glass-border)' : 'none',
                    transition: 'all 0.15s ease',
                    background: 'var(--surface-0)'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-0)'}
                >
                  {/* Priority icon badge */}
                  <div style={{
                    width: 40, height: 40, borderRadius: 12,
                    background: priority.bg, border: `1px solid ${priority.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: priority.color, flexShrink: 0
                  }}>
                    <PriorityIcon size={18} />
                  </div>

                  {/* Ticket Summary */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)',
                        fontFamily: 'monospace', background: 'var(--surface-2)', padding: '2px 8px', borderRadius: 4
                      }}>
                        {ticket.id}
                      </span>
                      <span style={{
                        fontSize: '0.6875rem', fontWeight: 800, color: priority.color,
                        background: priority.bg, border: `1px solid ${priority.border}`,
                        padding: '1px 8px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 4
                      }}>
                        {priority.label} ({priority.sla})
                      </span>
                      <span style={{
                        fontSize: '0.6875rem', fontWeight: 800, color: status.color,
                        background: status.bg, border: `1px solid ${status.border}`,
                        padding: '1px 8px', borderRadius: 999
                      }}>
                        {status.label}
                      </span>
                    </div>

                    <p style={{
                      fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)',
                      margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                    }}>
                      {ticket.subject}
                    </p>

                    <p style={{
                      fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 700
                    }}>
                      {ticket.description}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Tag size={12} /> {ticket.category}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <User size={12} /> Raised by {ticket.raised_by || 'Org Admin'}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={12} /> {timeAgo(ticket.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Responses & Arrow */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexShrink: 0 }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px',
                      borderRadius: 999, background: 'var(--surface-1)', border: '1px solid var(--glass-border)',
                      fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)'
                    }}>
                      <MessageSquare size={13} color="var(--brand-600)" />
                      {ticket.replies || 0} {ticket.replies === 1 ? 'reply' : 'replies'}
                    </div>
                    <ChevronRight size={18} color="var(--text-muted)" />
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* ── 5. Quick Knowledge Base / Self-Serve Help ── */}
      <div className="glass-card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.25rem' }}>
          <HelpCircle size={20} color="var(--brand-600)" />
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Self-Service Technical Guidance & FAQs
          </h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {[
            {
              title: 'SSO & Identity Configuration',
              text: 'Ensure your SAML metadata entity ID points to platform callback URL. New certs take 5 minutes to propagate across edges.'
            },
            {
              title: 'AI Proctoring & Camera Latency',
              text: 'Recommended client bandwidth is minimum 2.5 Mbps upload per exam candidate for 720p gaze detection frames.'
            },
            {
              title: 'Bulk Member CSV Imports',
              text: 'CSV headers must include email, full_name, role. Roles can be student, teacher, or tenant_admin.'
            },
            {
              title: 'Custom Domain SSL Validation',
              text: 'Add CNAME pointing to cname.adaptive-lms.com. Platform auto-issues Let\'s Encrypt certificates within 10 minutes.'
            }
          ].map((item, i) => (
            <div key={i} style={{ padding: '1rem 1.25rem', background: 'var(--surface-1)', borderRadius: 12, border: '1px solid var(--glass-border)' }}>
              <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)', margin: '0 0 4px' }}>{item.title}</p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 6. Raise Ticket Modal ── */}
      {showRaiseModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem'
        }}>
          <div className="glass-card animate-scale-in" style={{
            width: '100%', maxWidth: 640, background: 'var(--surface-0)',
            borderRadius: 20, border: '1px solid var(--glass-border)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden'
          }}>
            
            {/* Modal Header */}
            <div style={{
              padding: '1.5rem 1.75rem', borderBottom: '1px solid var(--glass-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'var(--surface-1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--brand-100)', color: 'var(--brand-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <LifeBuoy size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    Raise Support Escalation Ticket
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                    Sent directly to Platform Engineering Operations
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowRaiseModal(false)}
                className="btn btn-ghost btn-icon btn-sm"
                style={{ color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleRaiseSubmit} style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Subject */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Issue Subject <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., SAML 2.0 Auth Failure during Cohort Sign-In"
                  value={formSubject}
                  onChange={e => setFormSubject(e.target.value)}
                  className="input-field"
                  style={{ width: '100%', fontSize: '0.875rem' }}
                />
              </div>

              {/* Category */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Problem Category
                </label>
                <select
                  value={formCategory}
                  onChange={e => setFormCategory(e.target.value)}
                  className="input-field"
                  style={{ width: '100%', fontSize: '0.875rem' }}
                >
                  {CATEGORIES.filter(c => c !== 'All Categories').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Priority Selector Cards */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Urgency / Priority Level
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {['critical', 'high', 'medium', 'low'].map(pKey => {
                    const meta = PRIORITY_META[pKey];
                    const isSelected = formPriority === pKey;
                    const Icon = meta.icon;
                    return (
                      <div
                        key={pKey}
                        onClick={() => setFormPriority(pKey)}
                        style={{
                          padding: '0.75rem 0.5rem',
                          borderRadius: 12,
                          cursor: 'pointer',
                          textAlign: 'center',
                          border: isSelected ? `2px solid ${meta.color}` : '1px solid var(--glass-border)',
                          background: isSelected ? meta.bg : 'var(--surface-1)',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ color: meta.color, display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
                          <Icon size={16} />
                        </div>
                        <p style={{ fontWeight: 800, fontSize: '0.8125rem', color: isSelected ? meta.color : 'var(--text-primary)', margin: '0 0 2px' }}>
                          {meta.label}
                        </p>
                        <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                          {meta.sla}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Detailed Problem Description <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide complete details: steps to reproduce, affected user email addresses, error codes, or browser environment..."
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  className="input-field"
                  style={{ width: '100%', resize: 'vertical', fontSize: '0.875rem', lineHeight: 1.6 }}
                />
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', display: 'block', marginTop: 4 }}>
                  Include timestamps, candidate IDs, or console error messages to speed up resolution.
                </span>
              </div>

              {/* SLA Expectation Banner */}
              <div style={{
                padding: '0.75rem 1rem', borderRadius: 10,
                background: PRIORITY_META[formPriority]?.bg || 'var(--surface-1)',
                border: `1px solid ${PRIORITY_META[formPriority]?.border || 'var(--glass-border)'}`,
                display: 'flex', alignItems: 'center', gap: 10
              }}>
                <ShieldCheck size={18} color={PRIORITY_META[formPriority]?.color} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Platform SLA Guarantee: <strong>{PRIORITY_META[formPriority]?.label}</strong> priority tickets receive primary triage within <strong>{PRIORITY_META[formPriority]?.sla}</strong>.
                </span>
              </div>

              {/* Modal Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowRaiseModal(false)}
                  className="btn btn-secondary"
                  disabled={createMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ gap: 8, padding: '0.625rem 1.5rem', fontWeight: 800 }}
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Dispatching Ticket...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Submit Escalation Ticket
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ── 7. Active Ticket Conversation Thread Modal / Drawer ── */}
      {activeTicket && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem'
        }}>
          <div className="glass-card animate-scale-in" style={{
            width: '100%', maxWidth: 760, maxHeight: '90vh', display: 'flex', flexDirection: 'column',
            background: 'var(--surface-0)', borderRadius: 20, border: '1px solid var(--glass-border)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden'
          }}>
            
            {/* Header */}
            <div style={{
              padding: '1.5rem 1.75rem', borderBottom: '1px solid var(--glass-border)',
              display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
              background: 'var(--surface-1)'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', background: 'var(--surface-2)', padding: '2px 8px', borderRadius: 4, fontFamily: 'monospace' }}>
                    {activeTicket.id}
                  </span>
                  {(() => {
                    const p = PRIORITY_META[activeTicket.priority] || PRIORITY_META.medium;
                    const s = STATUS_META[activeTicket.status] || STATUS_META.open;
                    const Icon = p.icon;
                    return (
                      <>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: p.color, background: p.bg, border: `1px solid ${p.border}`, padding: '2px 8px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <Icon size={12} /> {p.label}
                        </span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: s.color, background: s.bg, border: `1px solid ${s.border}`, padding: '2px 8px', borderRadius: 999 }}>
                          {s.label}
                        </span>
                      </>
                    );
                  })()}
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  {activeTicket.subject}
                </h2>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  Category: <strong style={{ color: 'var(--text-secondary)' }}>{activeTicket.category}</strong> · Created {timeAgo(activeTicket.createdAt)}
                </p>
              </div>
              
              <button 
                onClick={() => setActiveTicket(null)}
                className="btn btn-ghost btn-icon btn-sm"
                style={{ color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Conversation Content */}
            <div style={{ padding: '1.75rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1 }}>
              
              {/* Original Ticket Description */}
              <div style={{
                background: 'var(--surface-1)', borderRadius: 14, padding: '1.25rem',
                border: '1px solid var(--glass-border)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--brand-600)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8125rem' }}>
                      {activeTicket.raised_by?.[0] || 'A'}
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)', margin: 0 }}>
                        {activeTicket.raised_by || 'Organization Administrator'}
                      </p>
                      <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', margin: 0 }}>
                        Ticket Creator · {timeAgo(activeTicket.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0, whiteSpace: 'pre-wrap' }}>
                  {activeTicket.description}
                </p>
              </div>

              {/* Thread Status Banner */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.75rem 1rem', background: 'var(--surface-1)', borderRadius: 10, border: '1px dashed var(--glass-border)' }}>
                <Activity size={14} color="var(--brand-600)" />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Platform engineering responses and updates will appear chronologically below. Total updates: <strong>{activeTicket.replies || 0}</strong>.
                </span>
              </div>

              {/* Discussion Reply Box */}
              <form onSubmit={handleSendReply} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: 'auto' }}>
                <textarea
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Post an update, add logs, or ask a question to Platform Operations..."
                  rows={3}
                  className="input-field"
                  style={{ width: '100%', resize: 'vertical', fontSize: '0.875rem', lineHeight: 1.6 }}
                />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Replies notify the on-call platform engineer in real time.
                  </span>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={replyMutation.isPending || !replyText.trim()}
                    style={{ gap: 6, fontWeight: 700 }}
                  >
                    {replyMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    {replyMutation.isPending ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              </form>

            </div>

            {/* Modal Footer */}
            <div style={{ padding: '1rem 1.75rem', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'flex-end', background: 'var(--surface-1)' }}>
              <button onClick={() => setActiveTicket(null)} className="btn btn-secondary btn-sm">
                Close Ticket View
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

// Helper Loader2
function Loader2({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
