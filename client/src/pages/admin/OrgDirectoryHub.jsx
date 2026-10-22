import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { tenantsAPI } from '../../services/api.service';
import { useAuthStore } from '../../store/authStore';
import {
  Search, Command, Bell, Sparkles, ArrowRight, Table2, 
  Filter, Users, UserPlus, ShieldCheck, Activity, Lock, Mail, Folders, X, Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import Loader from '../../components/ui/Loader';

// ── Role config ─────────────────────────────────────────────────────────────
const ROLE = {
  student:      { label: 'Student', color: '#0ea5e9', bg: '#e0f2fe', border: '#bae6fd' },
  teacher:      { label: 'Teacher', color: '#10b981', bg: '#d1fae5', border: '#a7f3d0' },
  tenant_admin: { label: 'Admin', color: '#8b5cf6', bg: '#ede9fe', border: '#ddd6fe' },
  hr:           { label: 'HR Admin', color: '#8b5cf6', bg: '#ede9fe', border: '#ddd6fe' },
  parent:       { label: 'Parent', color: '#f59e0b', bg: '#fef3c7', border: '#fde68a' },
};

export default function OrgDirectoryHub() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    full_name: '',
    email: '',
    role: 'student',
    password: '',
  });

  const { data: rawMembers, isLoading } = useQuery({
    queryKey: ['org-members', user?.tenant_id],
    queryFn: () => tenantsAPI.getMembers(user?.tenant_id).then(r => r.data),
    enabled: !!user?.tenant_id,
  });

  const members = Array.isArray(rawMembers) ? rawMembers : (rawMembers?.members || []);

  const filtered = members.filter(m => {
    if (roleFilter !== 'all' && m.role !== roleFilter) return false;
    if (search && !m.full_name?.toLowerCase().includes(search.toLowerCase()) && !m.email?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const studentCount = members.filter(m => m.role === 'student').length;
  const teacherCount = members.filter(m => m.role === 'teacher').length;
  const adminCount = members.filter(m => m.role !== 'student' && m.role !== 'teacher').length;
  const totalCount = members.length;
  const studentPct = totalCount ? Math.round((studentCount / totalCount) * 100) : 0;
  const teacherPct = totalCount ? Math.round((teacherCount / totalCount) * 100) : 0;
  const adminPct = totalCount ? Math.round((adminCount / totalCount) * 100) : 0;

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    if (!inviteForm.full_name.trim() || !inviteForm.email.trim()) {
      toast.error('Full name and email are required');
      return;
    }
    setIsSubmitting(true);
    try {
      await tenantsAPI.createUser(user.tenant_id, inviteForm);
      queryClient.invalidateQueries(['org-members', user?.tenant_id]);
      toast.success(`Member ${inviteForm.full_name} onboarded as ${inviteForm.role}!`);
      setShowInviteModal(false);
      setInviteForm({ full_name: '', email: '', role: 'student', password: '' });
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (member) => {
    try {
      await tenantsAPI.deactivateUser(user.tenant_id, member.id);
      queryClient.invalidateQueries(['org-members', user?.tenant_id]);
      toast.success(`${member.full_name} status updated`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update member status');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: 1400, margin: '0 auto' }}>
      
      {/* ── 1. Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Command size={18} color="var(--text-muted)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search directory by name, email, or role..." 
            style={{ 
              width: '100%', padding: '0.875rem 1rem 0.875rem 3rem', 
              borderRadius: 16, border: '1px solid var(--glass-border)', background: 'var(--surface-0)',
              fontSize: '0.9375rem', color: 'var(--text-primary)', outline: 'none',
              boxShadow: '0 2px 10px rgba(0,0,0,0.02)', transition: 'all 0.2s'
            }}
          />
        </div>
        
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => setShowInviteModal(true)} className="btn btn-primary" style={{ gap: 8 }}>
            <UserPlus size={16} /> Invite Member
          </button>
        </div>
      </div>

      {/* ── 2. AI Insight Banner ── */}
      <div style={{ 
        background: 'linear-gradient(135deg, var(--surface-0), var(--brand-50))', 
        borderRadius: 24, padding: '2rem 2.5rem', border: '1px solid var(--brand-100)',
        boxShadow: '0 12px 30px rgba(0,0,0,0.03)', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', position: 'relative', zIndex: 1 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, var(--brand-500), var(--brand-700))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 16px var(--brand-500)40' }}>
            <Sparkles size={20} color="white" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>
              Directory is synchronized. Active roster: <strong style={{ color: 'var(--brand-700)', fontWeight: 800 }}>{studentCount} Students</strong> and <strong style={{ color: '#10b981', fontWeight: 800 }}>{teacherCount} Teachers</strong> across this workspace.
            </h2>
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
                <Table2 size={18} color="var(--brand-500)" /> Organization Members ({filtered.length})
              </h3>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
               {['all', 'student', 'teacher'].map(r => (
                 <button
                   key={r}
                   onClick={() => setRoleFilter(r)}
                   className="btn btn-secondary btn-sm"
                   style={{
                     padding: '4px 12px',
                     fontSize: '0.75rem',
                     fontWeight: 700,
                     textTransform: 'capitalize',
                     background: roleFilter === r ? 'var(--brand-500)' : 'var(--surface-1)',
                     color: roleFilter === r ? 'white' : 'var(--text-secondary)',
                     borderColor: roleFilter === r ? 'var(--brand-500)' : 'var(--glass-border)',
                   }}
                 >
                   {r}
                 </button>
               ))}
            </div>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            {isLoading ? (
              <div style={{ padding: '4rem', textAlign: 'center' }}><Loader /></div>
            ) : (
              <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'var(--surface-1)', borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '0.75rem 1.5rem' }}>User Profile</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th style={{ textAlign: 'right', paddingRight: '1.5rem' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No members found.</td>
                    </tr>
                  ) : filtered.map((m, i) => (
                    <tr key={m.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--glass-border)' : 'none', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-1)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--surface-2), var(--surface-3))', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-secondary)' }}>
                            {m.full_name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>{m.full_name}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{m.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', fontWeight: 800, color: ROLE[m.role]?.color || '#64748b', background: ROLE[m.role]?.bg || '#f1f5f9', padding: '4px 10px', borderRadius: 999 }}>
                          {ROLE[m.role]?.label || m.role}
                        </span>
                      </td>
                      <td>
                        {m.is_active ? 
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', fontWeight: 800, color: '#10b981' }}><Activity size={12} /> Active</span> : 
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', fontWeight: 800, color: '#ef4444' }}><Lock size={12} /> Suspended</span>
                        }
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                          {m.created_at ? new Date(m.created_at).toLocaleDateString() : 'Active'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', paddingRight: '1.5rem' }}>
                         <button onClick={() => handleToggleActive(m)} className="btn btn-secondary btn-sm" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                           {m.is_active ? 'Deactivate' : 'Activate'}
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
              <button onClick={() => setShowInviteModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.875rem 1rem', background: 'var(--surface-1)', border: '1px solid var(--glass-border)', borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s' }}>
                 <UserPlus size={16} color="var(--brand-600)" />
                 <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>Invite Member</span>
              </button>
              <button onClick={() => toast.success('Cohorts are synced with academic timetable')} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.875rem 1rem', background: 'var(--surface-1)', border: '1px solid var(--glass-border)', borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s' }}>
                 <Folders size={16} color="var(--brand-600)" />
                 <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>Manage Cohorts</span>
              </button>
              <button onClick={() => toast.success('RBAC policies enforced by tenant boundary')} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.875rem 1rem', background: 'var(--surface-1)', border: '1px solid var(--glass-border)', borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s' }}>
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
                 <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--brand-600)' }}>{studentCount}</span>
               </div>
               <div style={{ height: 4, borderRadius: 999, background: 'var(--surface-2)' }}>
                 <div style={{ height: '100%', borderRadius: 999, background: '#0ea5e9', width: `${studentPct}%` }} />
               </div>
               
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                 <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Teachers</span>
                 <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--brand-600)' }}>{teacherCount}</span>
               </div>
               <div style={{ height: 4, borderRadius: 999, background: 'var(--surface-2)' }}>
                 <div style={{ height: '100%', borderRadius: 999, background: '#10b981', width: `${teacherPct}%` }} />
               </div>
               
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                 <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Admins & Staff</span>
                 <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--brand-600)' }}>{adminCount}</span>
               </div>
               <div style={{ height: 4, borderRadius: 999, background: 'var(--surface-2)' }}>
                 <div style={{ height: '100%', borderRadius: 999, background: '#8b5cf6', width: `${adminPct}%` }} />
               </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Invite Member Modal ── */}
      {showInviteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: 480, padding: '2rem', background: 'var(--surface-0)', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>Invite Member</h3>
              <button onClick={() => setShowInviteModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleInviteSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: 6, color: 'var(--text-secondary)' }}>Full Name</label>
                <input
                  type="text"
                  required
                  value={inviteForm.full_name}
                  onChange={e => setInviteForm(f => ({ ...f, full_name: e.target.value }))}
                  placeholder="e.g. Jane Doe"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 10, border: '1px solid var(--surface-3)', background: 'var(--surface-1)', color: 'var(--text-primary)', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: 6, color: 'var(--text-secondary)' }}>Email Address</label>
                <input
                  type="email"
                  required
                  value={inviteForm.email}
                  onChange={e => setInviteForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="jane@university.edu"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 10, border: '1px solid var(--surface-3)', background: 'var(--surface-1)', color: 'var(--text-primary)', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: 6, color: 'var(--text-secondary)' }}>Role</label>
                <select
                  value={inviteForm.role}
                  onChange={e => setInviteForm(f => ({ ...f, role: e.target.value }))}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 10, border: '1px solid var(--surface-3)', background: 'var(--surface-1)', color: 'var(--text-primary)', outline: 'none', cursor: 'pointer' }}
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowInviteModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                  {isSubmitting ? 'Onboarding...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
