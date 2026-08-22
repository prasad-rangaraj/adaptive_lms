import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tenantsAPI } from '../../services/api.service';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import {
  Users, UserPlus, GraduationCap, BookOpen, Search,
  Lock, Eye, Copy, ShieldCheck, Activity, ShieldAlert,
  Users2, Folders, Plus
} from 'lucide-react';
import Loader from '../../components/ui/Loader';

// ── Role config ─────────────────────────────────────────────────────────────
const ROLE = {
  student: { label: 'Student', color: '#0ea5e9', bg: '#e0f2fe', border: '#bae6fd', Icon: GraduationCap },
  teacher: { label: 'Teacher', color: '#10b981', bg: '#d1fae5', border: '#a7f3d0', Icon: BookOpen },
  hr:      { label: 'HR Admin', color: '#8b5cf6', bg: '#ede9fe', border: '#ddd6fe', Icon: Users2 },
  parent:  { label: 'Parent', color: '#f59e0b', bg: '#fef3c7', border: '#fde68a', Icon: Users },
};

// ── Tab 1: Members ────────────────────────────────────────────────────────
function MembersTab() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['org-members', user?.tenant_id],
    queryFn: () => tenantsAPI.getMembers(user?.tenant_id),
  });

  const members = data?.members || [];
  const filtered = members.filter(m => {
    if (filter !== 'all' && m.role !== filter) return false;
    if (search && !m.full_name.toLowerCase().includes(search.toLowerCase()) && !m.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: 300 }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
            <Search size={18} style={{ position: 'absolute', left: 14, top: 11, color: 'var(--text-muted)' }} />
            <input type="text" placeholder="Search members..." value={search} onChange={e => setSearch(e.target.value)} className="input-field" style={{ width: '100%', paddingLeft: 42, background: 'var(--surface-1)' }} />
          </div>
          <select value={filter} onChange={e => setFilter(e.target.value)} className="input-field" style={{ width: 140, background: 'var(--surface-1)' }}>
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="teacher">Teachers</option>
          </select>
        </div>
        <button className="btn btn-primary" style={{ gap: 8 }}><UserPlus size={16} /> Invite Member</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {isLoading ? (
          <div style={{ padding: '4rem', textAlign: 'center' }}><Loader /></div>
        ) : filtered.length ? (
          filtered.map(m => (
            <div key={m.id} className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', transition: 'all 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 2, minWidth: 200 }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg, var(--surface-2), var(--surface-3))', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-secondary)' }}>
                  {m.full_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>{m.full_name}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}><Lock size={10} /> {m.email}</p>
                </div>
              </div>

              <div style={{ flex: 1, minWidth: 120 }}>
                {ROLE[m.role] && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', fontWeight: 800, color: ROLE[m.role].color, background: ROLE[m.role].bg, padding: '4px 10px', borderRadius: 999 }}>
                    {(() => { const I = ROLE[m.role].Icon; return <I size={12} />; })()}
                    {ROLE[m.role].label}
                  </span>
                )}
              </div>

              <div style={{ flex: 1, minWidth: 100 }}>
                {m.is_active ? 
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', fontWeight: 800, color: '#10b981' }}><Activity size={12} /> Active</span> : 
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', fontWeight: 800, color: '#ef4444' }}><Lock size={12} /> Suspended</span>
                }
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, flex: 1, minWidth: 100 }}>
                {new Date(m.created_at).toLocaleDateString()}
              </div>

              <div>
                <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>Manage</button>
              </div>
            </div>
          ))
        ) : (
          <div className="glass-card" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>No members found.</div>
        )}
      </div>
    </div>
  );
}

// ── Tab 2: Cohorts ──────────────────────────────────────────────────────────
function CohortsTab() {
  const { user } = useAuthStore();
  const { data, isLoading } = useQuery({
    queryKey: ['org-cohorts', user?.tenant_id],
    queryFn: () => tenantsAPI.getCohorts(user?.tenant_id),
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-primary" style={{ gap: 8 }}><Plus size={16} /> New Cohort</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
        {data?.cohorts?.map(c => (
          <div key={c.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--brand-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-600)' }}><Folders size={20} /></div>
                <div>
                  <h3 style={{ fontSize: '1.0625rem', fontWeight: 800, color: 'var(--text-primary)' }}>{c.name}</h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Created {new Date(c.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem', marginTop: '0.5rem' }}>
              <div><p style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)' }}>{c.member_count}</p><p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Members</p></div>
              <div><p style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)' }}>{c.course_count}</p><p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Courses</p></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Tab 3: Roles & Permissions (RBAC) ───────────────────────────────────────
function RolesTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="glass-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10 }}><ShieldCheck size={22} color="var(--brand-500)" /> Role-Based Access Control</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 4 }}>Define custom roles and assign specific permissions to users in your organization.</p>
          </div>
          <button className="btn btn-primary" style={{ gap: 8 }}><Plus size={16} /> Create Role</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {[
            { id: 1, name: 'HR Manager', desc: 'Can view cognitive profiles and cohort analytics. Cannot modify courses.', users: 4, color: '#8b5cf6' },
            { id: 2, name: 'Parent / Guardian', desc: 'Read-only access to specific student performance and AI tutor transcripts.', users: 120, color: '#f59e0b' },
            { id: 3, name: 'Guest Lecturer', desc: 'Temporary access to specific live sessions and course materials.', users: 2, color: '#6366f1' },
          ].map(r => (
            <div key={r.id} style={{ padding: '1.5rem', background: 'var(--surface-1)', border: '1px solid var(--glass-border)', borderRadius: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-primary)' }}>{r.name}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: r.color, background: `${r.color}15`, padding: '4px 10px', borderRadius: 999 }}>{r.users} Users</span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>{r.desc}</p>
              <button className="btn btn-secondary" style={{ width: '100%', fontSize: '0.8125rem' }}>Edit Permissions</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Hub ──────────────────────────────────────────────────────────────────
export default function OrgDirectoryHub() {
  const [activeTab, setActiveTab] = useState('members');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1.5rem' }}>
        <div style={{ flexShrink: 0 }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--brand-500)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Organization Management</p>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.04em', lineHeight: 1.1 }}>Directory Hub</h1>
        </div>
        
        <div className="hide-scrollbar" style={{ display: 'flex', background: 'var(--surface-1)', padding: 6, borderRadius: 16, border: '1px solid var(--glass-border)', gap: 4, overflowX: 'auto', flexWrap: 'nowrap' }}>
          {[
            { id: 'members', label: 'Members', icon: Users },
            { id: 'cohorts', label: 'Cohorts', icon: Folders },
            { id: 'roles', label: 'Roles & RBAC', icon: ShieldCheck },
          ].map(t => (
            <button 
              key={t.id} onClick={() => setActiveTab(t.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.625rem 1.25rem', borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '0.875rem', transition: 'all 0.2s', whiteSpace: 'nowrap', background: activeTab === t.id ? 'white' : 'transparent', color: activeTab === t.id ? 'var(--brand-600)' : 'var(--text-muted)', boxShadow: activeTab === t.id ? '0 4px 12px rgba(0,0,0,0.08)' : 'none' }}>
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'members' && <MembersTab />}
      {activeTab === 'cohorts' && <CohortsTab />}
      {activeTab === 'roles' && <RolesTab />}
    </div>
  );
}
