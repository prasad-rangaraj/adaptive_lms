import { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { tenantsAPI, authAPI } from '../../services/api.service';
import { useAuthStore } from '../../store/authStore';
import {
  LayoutDashboard, BookOpen, Bot, Shield, Building2,
  LogOut, GraduationCap, Brain,
  Bell, Search, Settings, ChevronRight, Users, CreditCard,
  BarChart3, Megaphone, ClipboardList, HeartPulse, LifeBuoy, Compass,
  Palette, BarChart2, BookMarked, UserCog, ScrollText, Award, Puzzle, Crown, BrainCircuit, Video, TrendingUp, MessageSquare
} from 'lucide-react';

const navConfig = {
  student: [
    { section: 'My Learning', items: [
      { to: '/student/dashboard', icon: LayoutDashboard, label: 'Nexus' },
      { to: '/student/explore', icon: Compass, label: 'Explore Hub' },
      { to: '/student/course', icon: BookOpen, label: 'Learning Canvas' },
      { to: '/student/ai-tutor', icon: Bot, label: 'AI Tutor' },
    ]},
    { section: 'Performance', items: [
      { to: '/student/cognitive', icon: Brain, label: 'Cognitive Profile' },
      { to: '/student/exam', icon: Shield, label: 'Exam Arena' },
    ]},
    { section: 'Academic', items: [
      { to: '/student/academic', icon: GraduationCap, label: 'Academic Hub' },
    ]},
    { section: 'Community', items: [
      { to: '/student/community', icon: Users, label: 'Community Hub' },
      { to: '/student/chat', icon: MessageSquare, label: 'Messages' },
      { to: '/student/live', icon: Video, label: 'Live Classroom' },
    ]},
    { section: 'Future', items: [
      { to: '/student/career', icon: TrendingUp, label: 'Career Horizon' },
    ]},
    { section: 'Account', items: [
      { to: '/student/settings', icon: Settings, label: 'Settings' },
    ]},
  ],
  teacher: [
    { section: 'Command Center', items: [
      { to: '/teacher/dashboard', icon: LayoutDashboard, label: 'Dashboard & Analytics' },
    ]},
    { section: 'Creator Studio', items: [
      { to: '/teacher/studio', icon: BookOpen, label: 'Course Studio' },
      { to: '/teacher/courses', icon: GraduationCap, label: 'All Courses' },
    ]},
    { section: 'Evaluation & Operations', items: [
      { to: '/teacher/forge', icon: Puzzle, label: 'Exam Forge' },
      { to: '/teacher/assessment', icon: Shield, label: 'Assessment Hub' },
      { to: '/teacher/desk', icon: ClipboardList, label: 'Academic Desk' },
    ]},
    { section: 'Community & Live', items: [
      { to: '/teacher/live', icon: Video, label: 'Live Sessions' },
      { to: '/teacher/mentorship', icon: HeartPulse, label: 'Mentorship Hub' },
      { to: '/teacher/chat', icon: MessageSquare, label: 'Messages' },
    ]},
    { section: 'Preferences', items: [
      { to: '/teacher/settings', icon: Settings, label: 'Settings' },
    ]},
  ],
  admin: [

    { section: 'Organization', items: [
      { to: '/admin/dashboard',     icon: LayoutDashboard, label: 'Overview' },
      { to: '/admin/data-hub',      icon: BarChart3,       label: 'Data Hub' },
    ]},
    { section: 'Operations', items: [
      { to: '/admin/academic',      icon: GraduationCap,   label: 'Academic Monitor' },
      { to: '/admin/assessment',    icon: ClipboardList,   label: 'Assessment Monitor' },
      { to: '/admin/live',          icon: Video,           label: 'Live Monitor' },
    ]},
    { section: 'Intelligence', items: [
      { to: '/admin/ai',            icon: BrainCircuit,    label: 'Org AI Hub' },
    ]},
    { section: 'Management', items: [
      { to: '/admin/directory',     icon: Users,           label: 'Directory Hub' },
      { to: '/admin/content',       icon: BookOpen,        label: 'Content Hub' },
      { to: '/admin/communication', icon: Megaphone,       label: 'Communication Hub' },
      { to: '/admin/chat',          icon: MessageSquare,   label: 'Messages' },
    ]},
    { section: 'Administration', items: [
      { to: '/admin/security',      icon: Shield,          label: 'Security Hub' },
      { to: '/admin/settings',      icon: Settings,        label: 'Settings Hub' },
      { to: '/admin/support',       icon: LifeBuoy,        label: 'Support Desk' },
    ]},
  ],
  super_admin: [
    { section: 'Overview', items: [
      { to: '/super-admin/dashboard',     icon: LayoutDashboard, label: 'Workspace' },
      { to: '/super-admin/system-data',   icon: BarChart3,       label: 'System Data' },
    ]},
    { section: 'Platform', items: [
      { to: '/super-admin/directory',     icon: Users,           label: 'Global Directory' },
      { to: '/super-admin/courses',       icon: BookOpen,        label: 'Content Hub' },
      { to: '/super-admin/plans',         icon: Crown,           label: 'Monetization Hub' },
      { to: '/super-admin/announcements', icon: Megaphone,       label: 'Communication Hub' },
    ]},
    { section: 'Intelligence', items: [
      { to: '/super-admin/ai-hub',        icon: BrainCircuit,    label: 'Global AI Hub' },
    ]},
    { section: 'System', items: [
      { to: '/super-admin/support',       icon: LifeBuoy,        label: 'Service Hub' },
      { to: '/super-admin/audit-logs',    icon: Shield,          label: 'Security & Audit' },
      { to: '/super-admin/settings',      icon: Settings,        label: 'Global Settings' },
    ]},
  ],
};


const roleConfig = {
  student:     { label: 'Student',     gradient: 'linear-gradient(135deg, var(--brand-600), var(--brand-400))', glow: 'var(--glow-brand)' },
  teacher:     { label: 'Teacher',     gradient: 'linear-gradient(135deg, var(--brand-600), var(--brand-400))', glow: 'var(--glow-brand)' },
  admin:       { label: 'Admin',       gradient: 'linear-gradient(135deg, var(--brand-600), var(--brand-400))', glow: 'var(--glow-brand)' },
  super_admin: { label: 'Super Admin', gradient: 'linear-gradient(135deg, var(--brand-600), var(--brand-400))', glow: 'var(--glow-brand)' },
};

// Routes that should use the full page (no max-width, edge-to-edge)
const FULL_PAGE_ROUTES = ['/live', '/live/', '/chat'];
function isFullPage(pathname) {
  if (FULL_PAGE_ROUTES.some(r => pathname.endsWith(r) || pathname.includes('/live/'))) return true;
  if (pathname.match(/\/student\/course\/\d+/)) return true; // Learning Canvas Player
  if (pathname.endsWith('/chat')) return true; // Chat Hub full page
  return false;
}

function isBareFullPage(pathname) {
  // Completely bare — no padding wrapper at all (chat, full canvas)
  return pathname.endsWith('/chat');
}

export default function DashboardLayout({ role }) {
  const authStore = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const sections = navConfig[role] || [];
  const rc = roleConfig[role] || roleConfig.student;
  const fullPage = isFullPage(location.pathname);
  const bareFullPage = isBareFullPage(location.pathname);

  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const mockNotifs = {
    student: [
      { id: 1, text: "Your assignment for 'Data Structures' is due tomorrow.", time: "2h ago", unread: true },
      { id: 2, text: "Professor Smith replied to your Mentorship request.", time: "5h ago", unread: true },
      { id: 3, text: "New Community Bounty matches your skills!", time: "1d ago", unread: false }
    ],
    teacher: [
      { id: 1, text: "Alice Learner submitted an assignment late.", time: "1h ago", unread: true },
      { id: 2, text: "New Office Hours booking from John Doe.", time: "3h ago", unread: true },
      { id: 3, text: "Mentorship request pending approval.", time: "1d ago", unread: false }
    ],
    admin: [
      { id: 1, text: "System anomaly detected in Assessment Server.", time: "10m ago", unread: true },
      { id: 2, text: "New teacher account registration requires approval.", time: "1h ago", unread: true },
      { id: 3, text: "Weekly system report is ready.", time: "2d ago", unread: false }
    ],
    super_admin: [
      { id: 1, text: "Global tenant limits reached for 'Demo Uni'.", time: "5m ago", unread: true },
      { id: 2, text: "New platform update deployed successfully.", time: "2h ago", unread: true }
    ]
  };

  const notifications = mockNotifs[role] || mockNotifs.student;
  const unreadCount = notifications.filter(n => n.unread).length;

  const user = authStore.user || {
    full_name: 'Dev Admin',
    email: 'dev@lms.com',
    role: 'super_admin'
  };

  const tenantId = user?.tenant_id;
  const { data: tenantInfo } = useQuery({
    queryKey: ['tenant-branding-active', tenantId],
    queryFn: () => tenantsAPI.get(tenantId).then(r => r.data),
    enabled: !!tenantId,
    staleTime: 1000 * 60 * 10,
  });

  // Sync latest user profile (avatar, name) from backend on mount
  useEffect(() => {
    if (authStore.isAuthenticated) {
      authAPI.me().then(res => {
        if (res.data) {
          authStore.updateUser({
            full_name: res.data.full_name,
            avatar_url: res.data.avatar_url,
            email: res.data.email,
          });
        }
      }).catch(() => {});
    }
  }, [authStore.isAuthenticated]);

  const handleLogout = () => { authStore.logout(); navigate('/auth/login'); };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--surface-1)' }}>

      {/* ── Light Sidebar ── */}
      <aside className="sidebar">
        {/* Logo */}
        <div style={{ height: 65, display: 'flex', alignItems: 'center', padding: '0 1.25rem', borderBottom: '1px solid var(--sidebar-border)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 9,
              background: rc.gradient,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: rc.glow, flexShrink: 0,
              overflow: 'hidden'
            }}>
              {tenantInfo?.logo_url ? (
                <img src={tenantInfo.logo_url} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <GraduationCap size={18} color="white" />
              )}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.9375rem', letterSpacing: '-0.025em', lineHeight: 1, maxWidth: 135, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={tenantInfo?.name || 'Lumina'}>
                {tenantInfo?.name || 'Lumina'}
              </p>
              <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: 2 }}>{rc.label} Portal</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '1.25rem 0.75rem', overflowY: 'auto', overflowX: 'hidden' }}>
          {sections.map(({ section, items }, si) => (
            <div key={si} style={{ marginBottom: '1rem' }}>
              {section && (
                <p className="section-label">
                  {section}
                </p>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {items.map(({ to, icon: Icon, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  >
                    <Icon size={15} />
                    <span style={{ flex: 1 }}>{label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User Profile */}
        <div style={{ padding: '1rem', borderTop: '1px solid var(--sidebar-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.625rem 0.75rem', borderRadius: 10, background: 'var(--surface-2)', marginBottom: '0.625rem' }}>
            <div style={{ position: 'relative' }}>
              <div className="avatar" style={{ 
                width: 34, height: 34, fontSize: '0.875rem', 
                background: rc.gradient, boxShadow: rc.glow, 
                overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' 
              }}>
                {user?.avatar_url ? (
                  <img 
                    src={user.avatar_url} 
                    alt={user?.full_name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : (
                  user?.full_name?.[0]?.toUpperCase() || 'U'
                )}
              </div>
              <div style={{ position: 'absolute', bottom: 0, right: 0, width: 8, height: 8, borderRadius: '50%', background: '#16a34a', border: '1.5px solid white' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.8125rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.full_name}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.6875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="btn btn-ghost" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '0.5rem', fontSize: '0.8125rem' }}>
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>

        {/* Impersonation Banner */}
        {useAuthStore.getState().isImpersonating() && (
          <div style={{ background: '#fff7ed', borderBottom: '1px solid #fed7aa', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <span style={{ fontSize: '0.875rem', color: '#92400e', fontWeight: 600 }}>
              ⚠️ Impersonating {user?.full_name} ({user?.role})
            </span>
            <button
              onClick={() => { useAuthStore.getState().stopImpersonating(); window.location.href = '/super-admin/dashboard'; }}
              style={{ background: '#d97706', color: 'white', border: 'none', padding: '4px 12px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
            >
              Stop
            </button>
          </div>
        )}

        {/* Top Header */}
        <header style={{
          height: 65,
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--card-border)',
          display: 'flex',
          alignItems: 'center',
          paddingLeft: '2.5rem',
          paddingRight: '2rem',
          gap: '1rem',
          position: 'sticky',
          top: 0,
          zIndex: 30,
        }}>
          {/* Search */}
          <div style={{ flex: 1, maxWidth: 360, position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input
              placeholder="Search courses, topics..."
              className="input-field"
              style={{ paddingLeft: 34, height: 34, fontSize: '0.8125rem', background: 'var(--surface-2)', border: '1.5px solid var(--surface-3)' }}
              onFocus={e => { e.target.style.background = 'white'; e.target.style.borderColor = 'var(--brand-500)'; e.target.style.boxShadow = 'var(--glow-brand)'; }}
              onBlur={e => { e.target.style.background = 'var(--surface-2)'; e.target.style.borderColor = 'var(--surface-3)'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          <div style={{ flex: 1 }} />

          {/* Chat */}
          <button className="btn btn-ghost btn-icon" onClick={() => navigate(`/${role}/chat`)} title="Open Lumina Chat">
            <MessageSquare size={17} color="var(--text-muted)" />
          </button>

          {/* Bell */}
          <div ref={notifRef} style={{ position: 'relative' }}>
            <button className="btn btn-ghost btn-icon" style={{ position: 'relative' }} onClick={() => setShowNotifications(!showNotifications)}>
              <Bell size={17} color="var(--text-muted)" />
              {unreadCount > 0 && <span style={{ position: 'absolute', top: 6, right: 6, width: 6, height: 6, borderRadius: '50%', background: '#e11d48', border: '1.5px solid var(--surface-1)' }} />}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                width: 320, background: 'var(--surface-0)', border: '1px solid var(--surface-2)',
                borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-xl)', zIndex: 100,
                overflow: 'hidden', display: 'flex', flexDirection: 'column'
              }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--surface-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-1)' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>Notifications</span>
                  {unreadCount > 0 && <span style={{ fontSize: '0.6875rem', color: 'var(--brand-600)', fontWeight: 700, cursor: 'pointer' }} onClick={() => setShowNotifications(false)}>Mark all read</span>}
                </div>
                <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                  {notifications.map(n => (
                    <div key={n.id} style={{
                      padding: '12px 16px', borderBottom: '1px solid var(--surface-2)',
                      background: n.unread ? 'var(--brand-50)' : 'transparent',
                      cursor: 'pointer', transition: 'background 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-1)'}
                    onMouseLeave={e => e.currentTarget.style.background = n.unread ? 'var(--brand-50)' : 'transparent'}
                    >
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', margin: '0 0 4px 0', lineHeight: 1.4, fontWeight: n.unread ? 600 : 400 }}>{n.text}</p>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{n.time}</span>
                    </div>
                  ))}
                  {notifications.length === 0 && (
                    <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>No notifications</div>
                  )}
                </div>
                <div style={{ padding: '10px 16px', borderTop: '1px solid var(--surface-2)', textAlign: 'center', background: 'var(--surface-1)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, color: 'var(--brand-600)' }} onClick={() => setShowNotifications(false)}>
                  View all notifications
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill in Navbar */}
          <div 
            onClick={() => {
              const path = role === 'admin' ? '/admin/settings' : role === 'super_admin' ? '/super-admin/settings' : role === 'teacher' ? '/teacher/settings' : '/student/settings';
              navigate(path);
            }}
            style={{ 
              display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer', 
              padding: '3px 10px 3px 4px', borderRadius: 999, border: '1px solid var(--surface-3)',
              background: 'var(--surface-0)', transition: 'all 0.15s',
              boxShadow: 'var(--shadow-xs)'
            }}
            title="Account & Profile Settings"
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--brand-400)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--surface-3)'}
          >
            <div style={{ 
              width: 28, height: 28, borderRadius: '50%', overflow: 'hidden', 
              background: rc.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', 
              color: 'white', fontWeight: 800, fontSize: '0.75rem', flexShrink: 0 
            }}>
              {user?.avatar_url ? (
                <img 
                  src={user.avatar_url} 
                  alt={user?.full_name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              ) : (
                user?.full_name?.[0]?.toUpperCase() || 'U'
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.full_name || 'Profile'}
              </span>
              <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                {role?.replace('_', ' ')}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div style={{ flex: 1, overflowY: fullPage ? 'hidden' : 'auto', display: 'flex', flexDirection: 'column' }}>
          <div
            style={bareFullPage
              ? { flex: 1, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 65px)', boxSizing: 'border-box' }
              : fullPage
                ? { flex: 1, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 65px)', padding: '1.5rem 1.75rem', boxSizing: 'border-box' }
                : { flex: 1, padding: '1.5rem 2.5rem', maxWidth: 1280, width: '100%', boxSizing: 'border-box' }
            }
          >
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

