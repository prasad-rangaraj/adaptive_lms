import { Outlet, NavLink, useNavigate } from 'react-router-dom';
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
      { to: '/student/course/1', icon: BookOpen, label: 'Learning Canvas' },
      { to: '/student/ai-tutor', icon: Bot, label: 'AI Tutor' },
    ]},
    { section: 'Performance', items: [
      { to: '/student/cognitive', icon: Brain, label: 'Cognitive Profile' },
      { to: '/student/exam/1', icon: Shield, label: 'Exam Arena' },
    ]},
    { section: 'Academic', items: [
      { to: '/student/academic', icon: GraduationCap, label: 'Academic Hub' },
    ]},
    { section: 'Community', items: [
      { to: '/student/community', icon: Users, label: 'Community Hub' },
    ]},
    { section: 'Future', items: [
      { to: '/student/career', icon: TrendingUp, label: 'Career Horizon' },
    ]},
  ],
  teacher: [
    { section: 'Command Center', items: [
      { to: '/teacher/dashboard', icon: LayoutDashboard, label: 'Dashboard & Analytics' },
    ]},
    { section: 'Creator Studio', items: [
      { to: '/teacher/studio', icon: BookOpen, label: 'Course Studio' },
      { to: '/teacher/inbox', icon: MessageSquare, label: 'Faculty Inbox' },
    ]},
    { section: 'Evaluation & Operations', items: [
      { to: '/teacher/forge', icon: Puzzle, label: 'Exam Forge' },
      { to: '/teacher/assessment', icon: Shield, label: 'Assessment Hub' },
      { to: '/teacher/desk', icon: ClipboardList, label: 'Academic Desk' },
    ]},
    { section: 'Community & Live', items: [
      { to: '/teacher/live', icon: Video, label: 'Live Sessions' },
      { to: '/teacher/mentorship', icon: HeartPulse, label: 'Mentorship Hub' },
    ]},
  ],
  admin: [

    { section: 'Organization', items: [
      { to: '/admin/dashboard',     icon: LayoutDashboard, label: 'Overview' },
      { to: '/admin/data-hub',      icon: BarChart3,       label: 'Data Hub' },
    ]},
    { section: 'Intelligence', items: [
      { to: '/admin/ai',            icon: BrainCircuit,    label: 'Org AI Hub' },
    ]},
    { section: 'Management', items: [
      { to: '/admin/directory',     icon: Users,           label: 'Directory Hub' },
      { to: '/admin/content',       icon: BookOpen,        label: 'Content Hub' },
      { to: '/admin/communication', icon: Megaphone,       label: 'Communication Hub' },
    ]},
    { section: 'Administration', items: [
      { to: '/admin/security',      icon: Shield,          label: 'Security Hub' },
      { to: '/admin/settings',      icon: Settings,        label: 'Settings Hub' },
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

export default function DashboardLayout({ role }) {
  const authStore = useAuthStore();
  const navigate = useNavigate();
  const sections = navConfig[role] || [];
  const rc = roleConfig[role] || roleConfig.student;

  const user = authStore.user || {
    full_name: 'Dev Admin',
    email: 'dev@lms.com',
    role: 'super_admin'
  };

  const handleLogout = () => { authStore.logout(); navigate('/auth/login'); };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--surface-1)' }}>

      {/* ── Light Sidebar ── */}
      <aside className="sidebar">
        {/* Logo */}
        <div style={{ height: 60, display: 'flex', alignItems: 'center', padding: '0 1.25rem', borderBottom: '1px solid var(--sidebar-border)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 9,
              background: rc.gradient,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: rc.glow, flexShrink: 0,
            }}>
              <GraduationCap size={18} color="white" />
            </div>
            <div>
              <p style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.9375rem', letterSpacing: '-0.025em', lineHeight: 1 }}>Lumina</p>
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
              <div className="avatar" style={{ width: 32, height: 32, fontSize: '0.875rem', background: rc.gradient, boxShadow: rc.glow }}>
                {user?.full_name?.[0]?.toUpperCase()}
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
      <div className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

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
          height: 60,
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

          {/* Bell */}
          <button className="btn btn-ghost btn-icon" style={{ position: 'relative' }}>
            <Bell size={17} color="var(--text-muted)" />
            <span style={{ position: 'absolute', top: 6, right: 6, width: 6, height: 6, borderRadius: '50%', background: '#e11d48', border: '1.5px solid var(--surface-1)' }} />
          </button>

          <button className="btn btn-ghost btn-icon">
            <Settings size={17} color="var(--text-muted)" />
          </button>
        </header>

        {/* Page Content */}
        <div className="content-area" style={{ padding: '2rem 2.5rem' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

