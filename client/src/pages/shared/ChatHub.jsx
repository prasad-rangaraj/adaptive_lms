import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '../../store/authStore';
import { communityAPI } from '../../services/api.service';
import {
  Search, Send, MoreVertical,
  Paperclip, CheckCheck, MessageSquare, X,
  Smile, Info, Edit, Trash2, BellOff, UserX,
  Star, Archive, Plus
} from 'lucide-react';

/* ════════════════════════════════════════════
   HELPERS
════════════════════════════════════════════ */
function formatTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const now = new Date();
  const diffDays = Math.floor((now - d) / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: 'short' });
  return d.toLocaleDateString([], { day: '2-digit', month: 'short' });
}

function formatDateDivider(ts) {
  const d = new Date(ts);
  const now = new Date();
  const diffDays = Math.floor((now - d) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return d.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' });
}

/* ════════════════════════════════════════════
   ROLE CONFIG — uses Lumina brand cyan for admin,
   keeps unique tones for other roles
════════════════════════════════════════════ */
const ROLE_CFG = {
  teacher:      { color: '#0e7490', bg: '#ecfeff', border: '#a5f3fc', label: 'Teacher' },
  admin:        { color: '#0891b2', bg: '#ecfeff', border: '#a5f3fc', label: 'Admin'   },
  tenant_admin: { color: '#0891b2', bg: '#ecfeff', border: '#a5f3fc', label: 'Admin'   },
  super_admin:  { color: '#0891b2', bg: '#ecfeff', border: '#a5f3fc', label: 'Super Admin' },
  student:      { color: '#155e75', bg: '#cffafe', border: '#67e8f9', label: 'Student' },
};
function getRC(role) {
  return ROLE_CFG[role] || { color: '#64748b', bg: '#f1f5f9', border: '#e2e8f0', label: role };
}

/* ════════════════════════════════════════════
   DROPDOWN MENU
════════════════════════════════════════════ */
function Dropdown({ items, onClose, style = {} }) {
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);
  return (
    <div ref={ref} style={{
      position: 'absolute', zIndex: 999,
      background: 'var(--surface-0)', border: '1px solid var(--surface-2)',
      borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-lg)',
      minWidth: 180, overflow: 'hidden', ...style,
    }}>
      {items.map((item, i) => (
        item === 'divider'
          ? <div key={i} style={{ height: 1, background: 'var(--surface-2)', margin: '3px 0' }} />
          : (
            <button key={i} onClick={() => { item.action?.(); onClose(); }} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 14px', border: 'none', background: 'none', cursor: 'pointer',
              fontSize: '0.875rem', color: item.danger ? 'var(--danger)' : 'var(--text-secondary)',
              textAlign: 'left', transition: 'background 0.12s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = item.danger ? '#fff1f2' : 'var(--surface-1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              {item.icon && <item.icon size={15} />}
              {item.label}
            </button>
          )
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════
   ICON BUTTON
════════════════════════════════════════════ */
function IconBtn({ icon: Icon, onClick, title, active, size = 17 }) {
  return (
    <button title={title} onClick={onClick} style={{
      background: active ? 'var(--brand-50)' : 'none', border: 'none', cursor: 'pointer',
      width: 34, height: 34, borderRadius: 'var(--r-md)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: active ? 'var(--brand-600)' : 'var(--text-muted)', transition: 'all 0.15s',
    }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-1)'; e.currentTarget.style.color = 'var(--brand-600)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = active ? 'var(--brand-50)' : 'none'; e.currentTarget.style.color = active ? 'var(--brand-600)' : 'var(--text-muted)'; }}
    >
      <Icon size={size} />
    </button>
  );
}

/* ════════════════════════════════════════════
   AVATAR
════════════════════════════════════════════ */
function Avatar({ name = '?', role, size = 40, online = false }) {
  const rc = getRC(role);
  const initials = (name || '?').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: `linear-gradient(135deg, ${rc.color}ee, ${rc.color}bb)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontWeight: 700, fontSize: size * 0.375,
        letterSpacing: '0.03em', userSelect: 'none',
        boxShadow: `0 2px 6px ${rc.color}33`,
      }}>
        {initials}
      </div>
      {online && (
        <span style={{
          position: 'absolute', bottom: 1, right: 1,
          width: Math.max(8, size * 0.27), height: Math.max(8, size * 0.27),
          borderRadius: '50%', background: 'var(--success)',
          border: '2px solid var(--surface-0)',
        }} />
      )}
    </div>
  );
}

/* ════════════════════════════════════════════
   ROLE BADGE
════════════════════════════════════════════ */
function RoleBadge({ role }) {
  const rc = getRC(role);
  return (
    <span style={{
      fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: '0.07em', padding: '2px 7px',
      borderRadius: 'var(--r-full)',
      background: rc.bg, color: rc.color,
      border: `1px solid ${rc.border}`,
    }}>
      {rc.label}
    </span>
  );
}

/* ════════════════════════════════════════════
   CONTACT ROW
════════════════════════════════════════════ */
function ContactRow({ contact, isActive, lastMsg, unread, onClick }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  return (
    <div style={{ position: 'relative' }}
      onMouseEnter={e => {
        if (e.currentTarget.querySelector('.row-menu-btn')) e.currentTarget.querySelector('.row-menu-btn').style.opacity = '1';
        e.currentTarget.querySelectorAll('.row-meta').forEach(el => el.style.opacity = '0');
      }}
      onMouseLeave={e => {
        if (e.currentTarget.querySelector('.row-menu-btn')) e.currentTarget.querySelector('.row-menu-btn').style.opacity = '0';
        e.currentTarget.querySelectorAll('.row-meta').forEach(el => el.style.opacity = '1');
      }}
    >
      <button onClick={onClick} style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 11,
        padding: '10px 14px', border: 'none',
        borderLeft: `3px solid ${isActive ? 'var(--brand-500)' : 'transparent'}`,
        background: isActive ? 'var(--brand-50)' : 'transparent',
        textAlign: 'left', cursor: 'pointer', transition: 'all 0.15s',
      }}
        onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--surface-1)'; }}
        onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
      >
        <Avatar name={contact.name} role={contact.role} size={44} online />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 3 }}>
            <span style={{
              fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 135,
            }}>
              {contact.name}
            </span>
            <span className="row-meta" style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', flexShrink: 0, marginLeft: 4, transition: 'opacity 0.15s' }}>
              {lastMsg ? formatTime(lastMsg.timestamp) : ''}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{
              fontSize: '0.8125rem',
              color: unread > 0 ? 'var(--text-secondary)' : 'var(--text-muted)',
              fontWeight: unread > 0 ? 600 : 400,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 155,
            }}>
              {lastMsg ? lastMsg.content : <em style={{ fontStyle: 'italic' }}>Say hello 👋</em>}
            </span>
            {unread > 0 && (
              <span className="row-meta" style={{
                background: 'var(--brand-500)', color: '#fff',
                borderRadius: 'var(--r-full)', padding: '1px 7px',
                fontSize: '0.6875rem', fontWeight: 700, flexShrink: 0, marginLeft: 4,
                transition: 'opacity 0.15s'
              }}>
                {unread}
              </span>
            )}
          </div>
        </div>
      </button>

      {/* Row 3-dot menu */}
      <button
        className="row-menu-btn"
        onClick={e => { e.stopPropagation(); setMenuOpen(p => !p); }}
        style={{
          position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
          background: 'var(--surface-0)', border: '1px solid var(--surface-2)',
          borderRadius: 'var(--r-sm)', width: 26, height: 26,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', opacity: 0, transition: 'opacity 0.15s', zIndex: 2,
          color: 'var(--text-muted)',
        }}
      >
        <MoreVertical size={13} />
      </button>

      {menuOpen && (
        <Dropdown
          onClose={() => setMenuOpen(false)}
          style={{ right: 8, top: '100%' }}
          items={[
            { icon: Star, label: 'Star Contact' },
            { icon: BellOff, label: 'Mute Notifications' },
            { icon: Archive, label: 'Archive Chat' },
            'divider',
            { icon: Trash2, label: 'Delete Chat', danger: true },
          ]}
        />
      )}
    </div>
  );
}

/* ════════════════════════════════════════════
   MESSAGE BUBBLE
════════════════════════════════════════════ */
function Bubble({ msg, isMine, showAvatar, senderName, senderRole }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-end', gap: 8,
      flexDirection: isMine ? 'row-reverse' : 'row',
      marginBottom: 3,
    }}>
      <div style={{ width: 30, flexShrink: 0 }}>
        {!isMine && showAvatar && <Avatar name={senderName} role={senderRole} size={30} />}
      </div>
      <div style={{ maxWidth: '65%', display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start' }}>
        {!isMine && showAvatar && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, paddingLeft: 2 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: getRC(senderRole).color }}>{senderName}</span>
            <RoleBadge role={senderRole} />
          </div>
        )}
        <div style={{
          background: isMine ? 'var(--brand-500)' : 'var(--surface-0)',
          color: isMine ? '#fff' : 'var(--text-primary)',
          borderRadius: isMine ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
          padding: '9px 13px 7px',
          boxShadow: isMine ? 'var(--shadow-brand)' : 'var(--shadow-sm)',
          border: isMine ? 'none' : '1px solid var(--surface-2)',
        }}>
          <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.55, wordBreak: 'break-word' }}>{msg.content}</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginTop: 3 }}>
            <span style={{ fontSize: '0.6rem', opacity: 0.75 }}>
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            {isMine && <CheckCheck size={11} opacity={0.85} />}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════ */
export default function ChatHub() {
  const { user } = useAuthStore();
  const [contacts, setContacts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [active, setActive] = useState(null);
  const [text, setText] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sidebarMenuOpen, setSidebarMenuOpen] = useState(false);
  const [chatMenuOpen, setChatMenuOpen] = useState(false);

  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const [readByContact, setReadByContact] = useState({});

  useEffect(() => {
    if (active) {
      setReadByContact(prev => ({ ...prev, [active.id]: Date.now() }));
    }
  }, [active, messages]);

  /* ── fetch ── */
  const fetchAll = useCallback(async () => {
    try {
      const [r1, r2] = await Promise.all([
        communityAPI.getMessageRecipients(),
        communityAPI.getChatMessages(),
      ]);
      setContacts(r1.data || []);
      setMessages(r2.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchAll();
    const id = setInterval(fetchAll, 8000);
    return () => clearInterval(id);
  }, [fetchAll]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, active]);

  /* ── helpers ── */
  const threadMsgs = useCallback((cid) =>
    messages.filter(m =>
      (m.sender_id === cid && m.receiver_id === user?.id) ||
      (m.sender_id === user?.id && m.receiver_id === cid)
    ), [messages, user]);

  const lastMsg = (cid) => { const t = threadMsgs(cid); return t[t.length - 1] || null; };
  const unreadCnt = (cid) => {
    if (active?.id === cid) return 0;
    const readTime = readByContact[cid] || 0;
    return messages.filter(m => m.sender_id === cid && m.receiver_id === user?.id && new Date(m.timestamp).getTime() > readTime).length;
  };

  /* ── send ── */
  const handleSend = async () => {
    if (!text.trim() || !active || sending) return;
    const content = text.trim();
    const temp = { id: Date.now(), sender_id: user.id, receiver_id: active.id, content, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, temp]);
    setText('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setSending(true);
    try { await communityAPI.sendMessage({ receiver_id: active.id, content }); fetchAll(); }
    catch (e) { console.error(e); }
    finally { setSending(false); }
  };

  /* ── group by date ── */
  const grouped = (active ? threadMsgs(active.id) : []).reduce((acc, m) => {
    const k = formatDateDivider(m.timestamp);
    (acc[k] = acc[k] || []).push(m);
    return acc;
  }, {});

  const sortedContacts = [...contacts]
    .filter(c => c.name.toLowerCase().includes(query.toLowerCase()) || c.role.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => (lastMsg(b.id)?.timestamp || '0').localeCompare(lastMsg(a.id)?.timestamp || '0'));

  /* ══════════════════════════════════════════════════ RENDER */
  return (
    <div style={{
      display: 'flex',
      height: 'calc(100vh - 65px)',
      background: 'var(--surface-1)',
      overflow: 'hidden',
      fontFamily: 'var(--font-body)',
    }}>

      {/* ════════ LEFT SIDEBAR ════════ */}
      <div style={{
        width: 310, display: 'flex', flexDirection: 'column',
        background: 'var(--surface-0)',
        borderRight: '1px solid var(--surface-2)',
        flexShrink: 0,
      }}>

        {/* Sidebar Header */}
        <div style={{
          padding: '14px 14px 12px',
          borderBottom: '1px solid var(--surface-2)',
          background: 'var(--surface-0)',
        }}>
          {/* Top row: avatar + title + menu */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <Avatar name={user?.full_name} role={user?.role} size={36} online />
              <div style={{ lineHeight: 1.25 }}>
                <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', margin: 0 }}>
                  {user?.full_name?.split(' ')[0] || 'Me'}
                </p>
                <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', margin: 0, textTransform: 'capitalize' }}>
                  {(user?.role || '').replace(/_/g, ' ')}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* New Chat */}
              <IconBtn icon={Edit} title="New conversation" size={16} />
              {/* 3-dot Menu */}
              <div style={{ position: 'relative' }}>
                <IconBtn icon={MoreVertical} title="More options" onClick={() => setSidebarMenuOpen(p => !p)} active={sidebarMenuOpen} size={16} />
                {sidebarMenuOpen && (
                  <Dropdown
                    onClose={() => setSidebarMenuOpen(false)}
                    style={{ right: 0, top: '110%' }}
                    items={[
                      { icon: Star, label: 'Starred Messages' },
                      { icon: Archive, label: 'Archived Chats' },
                      { icon: BellOff, label: 'Notification Settings' },
                    ]}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Search */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--surface-1)', border: '1.5px solid var(--surface-2)',
            borderRadius: 'var(--r-lg)', padding: '7px 12px', transition: 'border-color 0.15s',
          }}
            onFocusCapture={e => e.currentTarget.style.borderColor = 'var(--brand-500)'}
            onBlurCapture={e => e.currentTarget.style.borderColor = 'var(--surface-2)'}
          >
            <Search size={14} color="var(--text-muted)" />
            <input
              placeholder="Search people…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{
                background: 'transparent', border: 'none', outline: 'none',
                fontSize: '0.875rem', color: 'var(--text-primary)', width: '100%',
                fontFamily: 'var(--font-body)',
              }}
            />
            {query && (
              <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 0 }}>
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Section Count */}
        <div style={{ padding: '9px 14px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', margin: 0 }}>
            {sortedContacts.length} {sortedContacts.length === 1 ? 'Person' : 'People'}
          </p>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: 'var(--brand-600)', fontSize: '0.75rem', fontWeight: 600, padding: 0 }}>
            <Plus size={13} /> New
          </button>
        </div>

        {/* Contacts */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ padding: 16 }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16, padding: '0 2px' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--surface-2)', flexShrink: 0, animation: 'pulse 1.5s infinite' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 11, background: 'var(--surface-2)', borderRadius: 6, marginBottom: 8, width: '55%' }} />
                    <div style={{ height: 9, background: 'var(--surface-1)', borderRadius: 6, width: '78%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : sortedContacts.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <MessageSquare size={30} color="var(--surface-3)" style={{ margin: '0 auto 10px' }} />
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>No contacts found</p>
            </div>
          ) : (
            sortedContacts.map(c => (
              <ContactRow
                key={c.id} contact={c}
                isActive={active?.id === c.id}
                lastMsg={lastMsg(c.id)}
                unread={unreadCnt(c.id)}
                onClick={() => { setActive(c); textareaRef.current?.focus(); }}
              />
            ))
          )}
        </div>
      </div>

      {/* ════════ RIGHT — CHAT ════════ */}
      {active ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

          {/* Chat Header */}
          <div style={{
            height: 62, flexShrink: 0,
            display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px',
            background: 'var(--surface-0)', borderBottom: '1px solid var(--surface-2)',
            boxShadow: 'var(--shadow-xs)',
          }}>
            <Avatar name={active.name} role={active.role} size={40} online />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                  {active.name}
                </span>
                <RoleBadge role={active.role} />
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600 }}>
                ● Active now
              </span>
            </div>

            {/* Action icons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconBtn icon={Search} title="Search in chat" />
              {/* Chat 3-dot menu */}
              <div style={{ position: 'relative' }}>
                <IconBtn
                  icon={MoreVertical}
                  title="More options"
                  onClick={() => setChatMenuOpen(p => !p)}
                  active={chatMenuOpen}
                />
                {chatMenuOpen && (
                  <Dropdown
                    onClose={() => setChatMenuOpen(false)}
                    style={{ right: 0, top: '110%' }}
                    items={[
                      { icon: Info, label: 'View Profile' },
                      { icon: Star, label: 'Starred Messages' },
                      { icon: Archive, label: 'Archive Chat' },
                      { icon: BellOff, label: 'Mute Notifications' },
                      'divider',
                      { icon: Trash2, label: 'Clear Chat', danger: true },
                      { icon: UserX, label: 'Block User', danger: true },
                    ]}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '18px 24px',
            background: 'var(--surface-1)',
            display: 'flex', flexDirection: 'column',
          }}>
            {Object.keys(grouped).length === 0 ? (
              <div style={{ margin: 'auto', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Avatar name={active.name} role={active.role} size={60} />
                <p style={{ marginTop: 12, fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>{active.name}</p>
                <div style={{ marginTop: 4 }}><RoleBadge role={active.role} /></div>
                <p style={{ marginTop: 10, fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 260, margin: '10px auto 0' }}>
                  No messages yet — start the conversation!
                </p>
                <div style={{
                  marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'var(--brand-50)', border: '1px solid var(--brand-100)',
                  borderRadius: 'var(--r-lg)', padding: '6px 14px',
                  fontSize: '0.8125rem', color: 'var(--brand-700)', fontWeight: 500,
                }}>
                  🔒 Messages are private within Lumina
                </div>
              </div>
            ) : (
              Object.entries(grouped).map(([date, msgs]) => (
                <div key={date}>
                  {/* Date divider */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '14px 0 10px' }}>
                    <div style={{ flex: 1, height: 1, background: 'var(--surface-2)' }} />
                    <span style={{
                      fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)',
                      padding: '3px 12px', border: '1px solid var(--surface-2)',
                      borderRadius: 'var(--r-full)', background: 'var(--surface-1)',
                      textTransform: 'uppercase', letterSpacing: '0.05em',
                    }}>
                      {date}
                    </span>
                    <div style={{ flex: 1, height: 1, background: 'var(--surface-2)' }} />
                  </div>
                  {msgs.map((msg, i) => {
                    const isMine = msg.sender_id === user?.id;
                    const showAvatar = !isMine && (i === 0 || msgs[i - 1]?.sender_id !== msg.sender_id);
                    return (
                      <Bubble
                        key={msg.id} msg={msg} isMine={isMine}
                        showAvatar={showAvatar}
                        senderName={active.name} senderRole={active.role}
                      />
                    );
                  })}
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input Bar */}
          <div style={{
            flexShrink: 0, padding: '10px 16px',
            background: 'var(--surface-0)', borderTop: '1px solid var(--surface-2)',
            display: 'flex', alignItems: 'flex-end', gap: 8,
          }}>
            <IconBtn icon={Paperclip} title="Attach file" size={18} />

            <div style={{
              flex: 1, background: 'var(--surface-1)',
              border: '1.5px solid var(--surface-2)', borderRadius: 'var(--r-xl)',
              padding: '8px 14px', display: 'flex', alignItems: 'flex-end', gap: 8,
              transition: 'border-color 0.15s',
            }}
              onFocusCapture={e => e.currentTarget.style.borderColor = 'var(--brand-500)'}
              onBlurCapture={e => e.currentTarget.style.borderColor = 'var(--surface-2)'}
            >
              <textarea
                ref={textareaRef}
                value={text}
                rows={1}
                onChange={e => {
                  setText(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 110) + 'px';
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
                }}
                placeholder={`Message ${active.name}…`}
                style={{
                  flex: 1, border: 'none', outline: 'none', background: 'transparent',
                  fontSize: '0.9rem', color: 'var(--text-primary)', resize: 'none',
                  lineHeight: 1.5, maxHeight: 110, overflow: 'hidden',
                  fontFamily: 'var(--font-body)',
                }}
              />
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', flexShrink: 0 }}>
                <Smile size={17} />
              </button>
            </div>

            <button
              onClick={handleSend}
              disabled={!text.trim() || sending}
              style={{
                width: 40, height: 40, borderRadius: 'var(--r-lg)', border: 'none',
                cursor: text.trim() ? 'pointer' : 'not-allowed', flexShrink: 0,
                background: text.trim() ? 'var(--brand-500)' : 'var(--surface-2)',
                color: text.trim() ? '#fff' : 'var(--text-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
                boxShadow: text.trim() ? 'var(--shadow-brand)' : 'none',
              }}
              onMouseEnter={e => { if (text.trim()) e.currentTarget.style.background = 'var(--brand-600)'; }}
              onMouseLeave={e => { if (text.trim()) e.currentTarget.style.background = 'var(--brand-500)'; }}
            >
              <Send size={16} style={{ transform: 'translateX(1px)' }} />
            </button>
          </div>
        </div>

      ) : (
        /* Welcome State */
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: 'var(--surface-1)', gap: 14,
        }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'var(--brand-500)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--shadow-brand)',
          }}>
            <MessageSquare size={36} color="#fff" strokeWidth={1.5} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)', margin: '0 0 6px' }}>
              Lumina Messages
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 300, margin: 0 }}>
              Click a conversation to start messaging your {user?.role === 'student' ? 'teachers and admins' : 'team members'}.
            </p>
          </div>
      
        </div>
      )}
    </div>
  );
}
