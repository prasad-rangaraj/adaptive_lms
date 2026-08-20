import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { tenantsAPI } from '../../services/api.service';
import { useAuthStore } from '../../store/authStore';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import {
  TrendingUp, TrendingDown, Users, BookOpen, GraduationCap, ArrowRight,
  Sparkles, Bell, FileText, Settings, PlayCircle, MoreHorizontal,
  ChevronRight, Command, LayoutDashboard, ShieldCheck, ClipboardList
} from 'lucide-react';
import Loader from '../../components/ui/Loader';

// ── Sparkline Micro-chart Component ───────────────────────────────────────────
function Sparkline({ data, color, up }) {
  const gradientId = `spark-${color.replace('#', '')}`;
  return (
    <div style={{ width: 120, height: 40 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Tooltip 
            cursor={{ stroke: 'rgba(0,0,0,0.1)', strokeWidth: 1 }}
            contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '0.75rem', padding: '4px 8px' }}
            labelStyle={{ display: 'none' }}
          />
          <Area type="monotone" dataKey="score" stroke={color} strokeWidth={2} fillOpacity={1} fill={`url(#${gradientId})`} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Dashboard Component ───────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const tenantId = user?.tenant_id;

  const { data: narrativeData, isLoading: loadingNarrative } = useQuery({
    queryKey: ['dashboard-narrative', tenantId],
    queryFn: () => tenantsAPI.getDashboardNarrative(tenantId).then(r => r.data),
    enabled: !!tenantId,
  });

  const { data: cohorts, isLoading: loadingCohorts } = useQuery({
    queryKey: ['cohorts-pulse', tenantId],
    queryFn: () => tenantsAPI.getCohortsPulse(tenantId).then(r => r.data),
    enabled: !!tenantId,
  });

  if (loadingNarrative || loadingCohorts) return <Loader text="Assembling workspace..." />;

  // Parse narrative into styled segments (bold text inside **)
  const rawNarrative = narrativeData?.narrative || "Welcome to your Workspace. Everything is operating smoothly today.";
  const parts = rawNarrative.split(/(\*\*.*?\*\*)/g);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: 1400, margin: '0 auto' }}>
      
      {/* ── 1. The Decision Intelligence Header (Command Palette Style) ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Command size={18} color="var(--text-muted)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Search students, courses, or type a command (Cmd+K)..." 
            style={{ 
              width: '100%', padding: '0.875rem 1rem 0.875rem 3rem', 
              borderRadius: 16, border: '1px solid var(--glass-border)', background: 'var(--surface-0)',
              fontSize: '0.9375rem', color: 'var(--text-primary)', outline: 'none',
              boxShadow: '0 2px 10px rgba(0,0,0,0.02)', transition: 'all 0.2s'
            }}
            onFocus={e => { e.target.style.borderColor = 'var(--brand-400)'; e.target.style.boxShadow = '0 0 0 4px var(--brand-50)'; }}
            onBlur={e => { e.target.style.borderColor = 'var(--glass-border)'; e.target.style.boxShadow = '0 2px 10px rgba(0,0,0,0.02)'; }}
          />
          <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', background: 'var(--surface-2)', padding: '2px 6px', borderRadius: 6, border: '1px solid var(--glass-border)' }}>
            ⌘K
          </span>
        </div>
        
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-ghost btn-icon"><Bell size={18} /></button>
          <button className="btn btn-primary" style={{ gap: 8 }} onClick={() => navigate('/admin/members')}>
            <Users size={16} /> Invite Members
          </button>
        </div>
      </div>

      {/* ── 2. AI Narrative Insight Banner ── */}
      <div style={{ 
        background: 'linear-gradient(135deg, var(--surface-0), var(--brand-50))', 
        borderRadius: 24, padding: '2.5rem', border: '1px solid var(--brand-100)',
        boxShadow: '0 12px 30px rgba(0,0,0,0.03)', position: 'relative', overflow: 'hidden'
      }}>
        {/* Background Decorative Graphic */}
        <div style={{ position: 'absolute', right: -40, top: -60, opacity: 0.05, transform: 'scale(1.5)', pointerEvents: 'none' }}>
          <Sparkles size={300} color="var(--brand-600)" />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem', position: 'relative', zIndex: 1, maxWidth: 900 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, var(--brand-500), var(--brand-700))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 16px var(--brand-500)40' }}>
            <Sparkles size={22} color="white" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.4, letterSpacing: '-0.02em' }}>
              {parts.map((p, i) => {
                if (p.startsWith('**') && p.endsWith('**')) {
                  const content = p.replace(/\*\*/g, '');
                  const color = content.toLowerCase().includes('down') || content.toLowerCase().includes('falling') ? '#e11d48' : 'var(--brand-700)';
                  return <strong key={i} style={{ color, fontWeight: 800 }}>{content}</strong>;
                }
                return p;
              })}
            </h2>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button className="btn btn-secondary btn-sm" style={{ gap: 6, fontSize: '0.8125rem', background: 'white' }}>
                View Action Items <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Table-First Data Canvas (Asymmetrical Layout) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'flex-start' }}>
        
        {/* Main Canvas: Cohorts Pulse */}
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-0)' }}>
            <div>
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <ActivityIcon /> Active Cohorts Pulse
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 2 }}>Real-time engagement trends across active cohorts.</p>
            </div>
            <button className="btn btn-ghost btn-sm" style={{ fontWeight: 600 }}>See All</button>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--surface-1)' }}>
                  <th style={{ padding: '1rem 1.5rem' }}>Cohort / Course</th>
                  <th>Instructor</th>
                  <th>7-Day Trend</th>
                  <th>Avg Score</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {cohorts?.map((c, i) => {
                  const isWarning = c.status === 'warning';
                  const trendColor = isWarning ? '#e11d48' : c.avg_score > 60 ? '#10b981' : '#f59e0b';
                  const trendUp = c.avg_score > 50;

                  return (
                    <tr key={c.id} style={{ borderBottom: i < cohorts.length - 1 ? '1px solid var(--glass-border)' : 'none', transition: 'background 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-1)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>{c.name}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                          <Users size={12} /> {c.students} Students
                        </p>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--brand-100)', color: 'var(--brand-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6875rem', fontWeight: 700 }}>
                            {c.instructor[0]}
                          </div>
                          <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{c.instructor}</span>
                        </div>
                      </td>
                      <td>
                        <Sparkline data={c.sparkline} color={trendColor} up={trendUp} />
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>{c.avg_score}</span>
                          <span style={{ fontSize: '0.75rem', color: trendUp ? '#10b981' : '#e11d48', display: 'flex', alignItems: 'center' }}>
                            {trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span style={{ 
                          display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', 
                          borderRadius: 999, fontSize: '0.75rem', fontWeight: 700,
                          background: isWarning ? '#fff1f2' : c.status === 'active' ? '#ecfdf5' : '#f3f4f6',
                          color: isWarning ? '#e11d48' : c.status === 'active' ? '#059669' : '#6b7280',
                          border: `1px solid ${isWarning ? '#fecdd3' : c.status === 'active' ? '#bbf7d0' : '#e5e7eb'}`
                        }}>
                          {isWarning ? 'Warning' : c.status === 'active' ? 'Healthy' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Command Center & Quotas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Quick Actions Panel */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Command Center
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { label: 'Manage Members', icon: Users, color: 'var(--brand-600)', path: '/admin/members' },
                { label: 'Curriculum Library', icon: BookOpen, color: 'var(--brand-600)', path: '/admin/courses' },
                { label: 'View Audit Trail', icon: ClipboardList, color: 'var(--brand-600)', path: '/admin/audit' },
                { label: 'Organization Settings', icon: Settings, color: 'var(--text-muted)', path: '/admin/settings' },
              ].map((action, i) => (
                <button key={i} onClick={() => navigate(action.path)} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.875rem 1rem', background: 'var(--surface-1)', border: '1px solid var(--glass-border)',
                  borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s', width: '100%',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = action.color; e.currentTarget.style.transform = 'translateX(4px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface-1)'; e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.transform = 'none'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ color: action.color }}><action.icon size={18} /></div>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{action.label}</span>
                  </div>
                  <ChevronRight size={14} color="var(--text-muted)" />
                </button>
              ))}
            </div>
          </div>



        </div>
      </div>
    </div>
  );
}

// Activity Icon helper
function ActivityIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--brand-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
    </svg>
  );
}

