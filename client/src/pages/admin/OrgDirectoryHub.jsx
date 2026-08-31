import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tenantsAPI } from '../../services/api.service';
import { useAuthStore } from '../../store/authStore';
import {
  Search, Command, Bell, Sparkles, ArrowRight, Table2, 
  Filter, Users, UserPlus, ShieldCheck, Activity, Lock, Mail, Folders
} from 'lucide-react';
import Loader from '../../components/ui/Loader';

// ── Role config ─────────────────────────────────────────────────────────────
const ROLE = {
  student: { label: 'Student', color: '#0ea5e9', bg: '#e0f2fe', border: '#bae6fd' },
  teacher: { label: 'Teacher', color: '#10b981', bg: '#d1fae5', border: '#a7f3d0' },
  hr:      { label: 'HR Admin', color: '#8b5cf6', bg: '#ede9fe', border: '#ddd6fe' },
  parent:  { label: 'Parent', color: '#f59e0b', bg: '#fef3c7', border: '#fde68a' },
};

export default function OrgDirectoryHub() {
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['org-members', user?.tenant_id],
    queryFn: () => tenantsAPI.getMembers(user?.tenant_id),
  });

  const members = data?.members || [];
  const filtered = members.filter(m => {
    if (search && !m.full_name.toLowerCase().includes(search.toLowerCase()) && !m.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: 1400, margin: '0 auto' }}>
      
      {/* ── 1. The Decision Intelligence Header (Command Palette Style) ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Command size={18} color="var(--text-muted)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search directory by name, email, or role (Cmd+K)..." 
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
          <button className="btn btn-primary" style={{ gap: 8 }}>
            <UserPlus size={16} /> Invite Member
          </button>
        </div>
      </div>

      {/* ── 2. AI Insight Banner ── */}
      <div style={{ 
        background: 'linear-gradient(135deg, var(--surface-0), var(--brand-50))', 
        borderRadius: 24, padding: '2.5rem', border: '1px solid var(--brand-100)',
        boxShadow: '0 12px 30px rgba(0,0,0,0.03)', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', right: -40, top: -60, opacity: 0.05, transform: 'scale(1.5)', pointerEvents: 'none' }}>
          <Sparkles size={300} color="var(--brand-600)" />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem', position: 'relative', zIndex: 1, maxWidth: 900 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, var(--brand-500), var(--brand-700))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 16px var(--brand-500)40' }}>
            <Sparkles size={22} color="white" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.4, letterSpacing: '-0.02em' }}>
              Directory is stable. There are <strong style={{ color: '#ef4444', fontWeight: 800 }}>3 inactive student accounts</strong> that haven't logged in for over 30 days. 
            </h2>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button className="btn btn-secondary btn-sm" style={{ gap: 6, fontSize: '0.8125rem', background: 'white' }}>
                View Inactive Users <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Table-First Data Canvas (1fr 340px) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'flex-start' }}>
        
        {/* Main Canvas: Users Table */}
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-0)' }}>
            <div>
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Table2 size={18} color="var(--brand-500)" /> Member Directory
              </h3>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
               <button className="btn btn-secondary btn-sm" style={{ gap: 6 }}><Filter size={14} /> Filter</button>
            </div>
          </div>
          
          <div style={{ overflowX: 'auto', maxHeight: 500 }} className="hide-scrollbar">
            {isLoading ? (
               <div style={{ padding: '3rem' }}><Loader /></div>
            ) : (
              <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                  <tr style={{ background: 'var(--surface-1)' }}>
                    <th style={{ padding: '1rem 1.5rem' }}>Member</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No members found.</td>
                    </tr>
                  ) : filtered.map((m, i) => (
                    <tr key={m.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--glass-border)' : 'none', transition: 'background 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-1)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--surface-2), var(--surface-3))', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-secondary)' }}>
                            {m.full_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>{m.full_name}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{m.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        {ROLE[m.role] && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', fontWeight: 800, color: ROLE[m.role].color, background: ROLE[m.role].bg, padding: '4px 10px', borderRadius: 999 }}>
                            {ROLE[m.role].label}
                          </span>
                        )}
                      </td>
                      <td>
                        {m.is_active ? 
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', fontWeight: 800, color: '#10b981' }}><Activity size={12} /> Active</span> : 
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', fontWeight: 800, color: '#ef4444' }}><Lock size={12} /> Suspended</span>
                        }
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                          {new Date(m.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', paddingRight: '1.5rem' }}>
                         <button className="btn btn-secondary btn-sm" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                           Manage
                         </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Side Canvas: Quick Actions & Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Command Center
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.875rem 1rem', background: 'var(--surface-1)', border: '1px solid var(--glass-border)', borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s' }}>
                 <UserPlus size={16} color="var(--brand-600)" />
                 <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>Invite Member</span>
              </button>
              <button style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.875rem 1rem', background: 'var(--surface-1)', border: '1px solid var(--glass-border)', borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s' }}>
                 <Folders size={16} color="var(--brand-600)" />
                 <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>Manage Cohorts</span>
              </button>
              <button style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.875rem 1rem', background: 'var(--surface-1)', border: '1px solid var(--glass-border)', borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s' }}>
                 <ShieldCheck size={16} color="var(--brand-600)" />
                 <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>RBAC Settings</span>
              </button>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Role Distribution
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Students</span>
                 <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--brand-600)' }}>1,482</span>
               </div>
               <div style={{ height: 4, borderRadius: 999, background: 'var(--surface-2)' }}>
                 <div style={{ height: '100%', borderRadius: 999, background: '#0ea5e9', width: '85%' }} />
               </div>
               
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                 <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Teachers</span>
                 <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--brand-600)' }}>145</span>
               </div>
               <div style={{ height: 4, borderRadius: 999, background: 'var(--surface-2)' }}>
                 <div style={{ height: '100%', borderRadius: 999, background: '#10b981', width: '10%' }} />
               </div>
               
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                 <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)' }}>HR & Parents</span>
                 <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--brand-600)' }}>32</span>
               </div>
               <div style={{ height: 4, borderRadius: 999, background: 'var(--surface-2)' }}>
                 <div style={{ height: '100%', borderRadius: 999, background: '#8b5cf6', width: '5%' }} />
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
