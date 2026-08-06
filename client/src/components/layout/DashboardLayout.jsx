import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
  LayoutDashboard, BookOpen, Bot, Shield, Building2,
  LogOut, GraduationCap, Brain, ChevronRight,
  Bell, Search, Settings,
} from 'lucide-react';
import { useState } from 'react';

const navConfig = {
  student: [
    { section: null, items: [
      { to: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/student/ai-tutor', icon: Bot, label: 'AI Tutor' },
      { to: '/student/profile/cognitive', icon: Brain, label: 'Cognitive Profile' },
    ]},
  ],
  teacher: [
    { section: null, items: [
      { to: '/teacher/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/teacher/courses/builder', icon: BookOpen, label: 'Course Builder' },
      { to: '/teacher/proctoring/reports', icon: Shield, label: 'Proctor Monitor' },
    ]},
  ],
  admin: [
    { section: null, items: [
      { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/admin/tenants', icon: Building2, label: 'Tenants' },
    ]},
  ],
};

const roleConfig = {
  student: { label: 'Student', gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#6366f1' },
  teacher: { label: 'Teacher', gradient: 'linear-gradient(135deg, #10b981, #059669)', color: '#10b981' },
  admin:   { label: 'Admin',   gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)', color: '#f59e0b' },
};

export default function DashboardLayout({ role }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const sections = navConfig[role] || [];
  const rc = roleConfig[role] || roleConfig.student;

  const handleLogout = () => { logout(); navigate('/auth/login'); };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8f9fc' }}>

      {/* ── Sidebar ── */}
      <aside className="sidebar">
        {/* Logo area */}
        <div style={{ padding: '1.375rem 1.25rem 1rem', borderBottom: '1px solid #f0f1f3' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: rc.gradient,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 4px 12px ${rc.color}40`,
              flexShrink: 0,
            }}>
              <GraduationCap size={20} color="white" />
            </div>
            <div>
              <p style={{ fontWeight: 800, color: '#111827', fontSize: '0.9375rem', letterSpacing: '-0.02em', lineHeight: 1 }}>AdaptiveLMS</p>
              <p style={{ fontSize: '0.6875rem', color: '#9ca3af', marginTop: 2 }}>{rc.label} Portal</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '1rem 0.875rem', overflowY: 'auto' }}>
          {sections.map(({ section, items }, si) => (
            <div key={si} style={{ marginBottom: '1.5rem' }}>
              {section && <p className="section-label" style={{ paddingLeft: '0.875rem', marginBottom: '0.5rem' }}>{section}</p>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {items.map(({ to, icon: Icon, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  >
                    <Icon size={17} />
                    <span style={{ flex: 1 }}>{label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User Profile */}
        <div style={{ padding: '1rem', borderTop: '1px solid #f0f1f3' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '0.75rem',
            borderRadius: 12, background: '#f9fafb', border: '1px solid #f0f1f3',
            marginBottom: '0.625rem',
          }}>
            <div className="avatar" style={{
              width: 34, height: 34, fontSize: '0.875rem',
              background: rc.gradient,
            }}>
              {user?.full_name?.[0]?.toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 600, color: '#111827', fontSize: '0.8125rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.full_name}
              </p>
              <p style={{ color: '#9ca3af', fontSize: '0.6875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.email}
              </p>
            </div>
          </div>
          <button onClick={handleLogout} className="btn btn-ghost btn-sm" style={{ width: '100%' }}>
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="main-content" style={{ flex: 1 }}>
        {/* Top Header */}
        <header style={{
          height: 60,
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #f0f1f3',
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
          <div style={{ flex: 1, maxWidth: 380, position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              placeholder="Search courses, topics..."
              style={{
                width: '100%', height: 36, paddingLeft: 36, paddingRight: 16,
                borderRadius: 10, border: '1.5px solid #f0f1f3',
                background: '#f9fafb', fontSize: '0.875rem', color: '#374151',
                outline: 'none', transition: 'all 0.18s',
              }}
              onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.background = 'white'; }}
              onBlur={e => { e.target.style.borderColor = '#f0f1f3'; e.target.style.background = '#f9fafb'; }}
            />
          </div>

          <div style={{ flex: 1 }} />

          {/* Notification bell */}
          <button className="btn btn-ghost btn-icon" style={{ position: 'relative' }}>
            <Bell size={18} />
            <span style={{
              position: 'absolute', top: 6, right: 6,
              width: 7, height: 7, borderRadius: '50%',
              background: '#ef4444', border: '2px solid white',
            }} />
          </button>

          <button className="btn btn-ghost btn-icon">
            <Settings size={18} />
          </button>

          {/* Avatar */}
          <div className="avatar" style={{
            width: 34, height: 34, fontSize: '0.875rem',
            background: rc.gradient, cursor: 'pointer',
          }}>
            {user?.full_name?.[0]?.toUpperCase()}
          </div>
        </header>

        {/* Page Content */}
        <div className="content-area" style={{ padding: '2rem 2.5rem' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
