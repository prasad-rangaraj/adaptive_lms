import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tenantsAPI } from '../../services/api.service';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import {
  Users, UserPlus, GraduationCap, BookOpen, Search,
  UserX, UserCheck, Mail, User, Lock, Eye, EyeOff, X, Check, Copy,
  MoreVertical, ShieldCheck, Activity
} from 'lucide-react';
import Loader from '../../components/ui/Loader';

// ── Role config ─────────────────────────────────────────────────────────────
const ROLE = {
  student: { label: 'Student', color: '#0e7490', bg: '#ecfeff', border: '#a5f3fc', Icon: GraduationCap },
  teacher: { label: 'Teacher', color: '#059669', bg: '#ecfdf5', border: '#bbf7d0', Icon: BookOpen },
};

// ── One-time credential reveal card ────────────────────────────────────────
function CredentialCard({ cred, onClose }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(`Email: ${cred.email}\nPassword: ${cred.temp_password}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: 'var(--surface-1)', borderRadius: 24, padding: '2.5rem', maxWidth: 440, width: '100%', boxShadow: '0 32px 80px rgba(0,0,0,0.18)' }}>
        <div style={{ width: 52, height: 52, borderRadius: 16, background: '#ecfdf5', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
          <Check size={26} color="#059669" />
        </div>
        <h3 style={{ textAlign: 'center', fontWeight: 800, color: 'var(--text-primary)', fontSize: '1.25rem', marginBottom: 4 }}>Account Created</h3>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9375rem', marginBottom: '2rem' }}>Share these credentials securely with {cred.full_name}</p>

        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <span style={{ fontSize: '1.125rem' }}>⚠️</span>
          <p style={{ fontSize: '0.875rem', color: '#92400e', lineHeight: 1.5 }}>This password is shown <strong>only once</strong>. Please copy it before closing this window.</p>
        </div>

        <div style={{ background: 'var(--surface-1)', borderRadius: 16, border: '1px solid var(--glass-border)', padding: '1.5rem', marginBottom: '2rem' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Email Address</p>
          <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '1rem', marginBottom: '1.25rem' }}>{cred.email}</p>
          <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Temporary Password</p>
          <p style={{ fontWeight: 900, color: 'var(--brand-600)', fontSize: '1.375rem', letterSpacing: '0.12em', fontFamily: 'monospace' }}>{cred.temp_password}</p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={handleCopy} style={{
            flex: 1, padding: '0.875rem', borderRadius: 12,
            border: '1.5px solid var(--glass-border)', background: copied ? '#ecfdf5' : 'white',
            fontWeight: 700, fontSize: '0.9375rem', color: copied ? '#059669' : 'var(--text-secondary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'var(--font-body)'
          }}>
            {copied ? <><Check size={16} /> Copied!</> : <><Copy size={16} /> Copy Credentials</>}
          </button>
          <button onClick={onClose} className="btn btn-primary" style={{ flex: 1, padding: '0.875rem', borderRadius: 12, fontSize: '0.9375rem' }}>Done</button>
        </div>
      </div>
    </div>
  );
}

// ── Add member modal ─────────────────────────────────────────────────────────
function AddMemberModal({ tenantId, onClose, onSuccess }) {
  const [form, setForm] = useState({ full_name: '', email: '', role: 'student', password: '' });
  const [showPass, setShowPass] = useState(false);
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => tenantsAPI.createUser(tenantId, { ...form, password: form.password || undefined }),
    onSuccess: (res) => { qc.invalidateQueries(['org-members', tenantId]); toast.success('Account created!'); onSuccess(res.data); },
    onError: (err) => toast.error(err.response?.data?.detail || 'Failed to create user'),
  });

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(6px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: 'var(--surface-1)', borderRadius: 24, padding: '2.5rem', maxWidth: 480, width: '100%', boxShadow: '0 32px 80px rgba(0,0,0,0.14)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h3 style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1.25rem' }}>Add New Member</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginTop: 4 }}>Credentials will be generated upon creation.</p>
          </div>
          <button onClick={onClose} style={{ background: 'var(--surface-2)', border: 'none', borderRadius: 10, padding: 8, cursor: 'pointer', display: 'flex', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={e => { e.preventDefault(); mutation.mutate(); }} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label className="label" style={{ marginBottom: '0.75rem' }}>Role Assignment</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[{ value: 'student', emoji: '🎓', label: 'Student', color: 'var(--brand-600)', bg: 'var(--brand-50)', border: 'var(--brand-200)' },
                { value: 'teacher', emoji: '👩‍🏫', label: 'Teacher', color: '#059669', bg: '#ecfdf5', border: '#bbf7d0' }].map(r => (
                <button key={r.value} type="button" onClick={() => setForm(f => ({ ...f, role: r.value }))} style={{
                  padding: '1rem', borderRadius: 14, cursor: 'pointer', textAlign: 'center',
                  border: `2px solid ${form.role === r.value ? r.border : 'var(--glass-border)'}`,
                  background: form.role === r.value ? r.bg : 'var(--surface-0)',
                  transition: 'all 0.15s', fontFamily: 'var(--font-body)',
                }}>
                  <div style={{ fontSize: '1.75rem', marginBottom: 8 }}>{r.emoji}</div>
                  <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: form.role === r.value ? r.color : 'var(--text-secondary)' }}>{r.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div><label className="label">Full Name</label>
            <div className="input-group"><User size={16} className="input-icon" /><input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder="John Doe" className="input" style={{ fontSize: '0.9375rem', padding: '0.75rem 1rem 0.75rem 2.5rem' }} required /></div>
          </div>
          <div><label className="label">Email Address</label>
            <div className="input-group"><Mail size={16} className="input-icon" /><input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="john@organization.edu" className="input" style={{ fontSize: '0.9375rem', padding: '0.75rem 1rem 0.75rem 2.5rem' }} required /></div>
          </div>
          <div>
            <label className="label">Password <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(blank = auto-generate)</span></label>
            <div className="input-group" style={{ position: 'relative' }}>
              <Lock size={16} className="input-icon" />
              <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Auto-generate secure password" className="input" style={{ fontSize: '0.9375rem', padding: '0.75rem 2.75rem 0.75rem 2.5rem' }} />
              <button type="button" onClick={() => setShowPass(s => !s)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: '1rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1, height: 50, fontSize: '0.9375rem' }}>Cancel</button>
            <button type="submit" disabled={mutation.isPending} className="btn btn-primary" style={{ flex: 2, height: 50, borderRadius: 12, fontSize: '0.9375rem' }}>
              {mutation.isPending
                ? <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                : <><UserPlus size={16} /> Create Member</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function OrgMembersPage() {
  const { user } = useAuthStore();
  const tenantId = user?.tenant_id;
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [credential, setCredential] = useState(null);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['org-members', tenantId],
    queryFn: () => tenantsAPI.listUsers(tenantId).then(r => r.data),
    enabled: !!tenantId,
  });

  const deactivateMutation = useMutation({
    mutationFn: (userId) => tenantsAPI.deactivateUser(tenantId, userId),
    onSuccess: (res) => {
      qc.invalidateQueries(['org-members', tenantId]);
      toast.success(res.data.is_active ? 'Member reactivated' : 'Member deactivated');
    },
    onError: () => toast.error('Failed to update member status'),
  });

  if (isLoading) return <Loader text="Loading directory..." />;

  const allUsers = usersData || [];
  const filtered = allUsers.filter(u => {
    const matchSearch = u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === 'all' || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const students = allUsers.filter(u => u.role === 'student').length;
  const teachers = allUsers.filter(u => u.role === 'teacher').length;
  const active = allUsers.filter(u => u.is_active).length;

  return (
    <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'flex-start' }}>
      {showModal && <AddMemberModal tenantId={tenantId} onClose={() => setShowModal(false)} onSuccess={data => { setShowModal(false); setCredential(data); }} />}
      {credential && <CredentialCard cred={credential} onClose={() => setCredential(null)} />}

      {/* ── Left: Directory Canvas ── */}
      <div style={{ flex: 1, background: 'var(--surface-1)', borderRadius: 24, border: '1px solid var(--glass-border)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
        
        {/* Unified Header & Toolbar */}
        <div style={{ padding: '2rem 2.5rem 1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Member Directory</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginTop: 4 }}>Manage people, roles, and access across your organization.</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--brand-600)', fontWeight: 600 }}>
                  <ShieldCheck size={14} /> Access Governance
                </span>
                <span style={{ opacity: 0.5 }}>•</span>
                <span>{active} / {allUsers.length} accounts active</span>
                <span style={{ opacity: 0.5 }}>•</span>
                <span>Deactivated users retain history</span>
              </div>
            </div>
            <button className="btn btn-primary" style={{ gap: 8, height: 44, padding: '0 1.25rem', borderRadius: 12 }} onClick={() => setShowModal(true)}>
              <UserPlus size={16} /> Add Member
            </button>
          </div>

          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search directory..."
                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: 12, border: '1px solid var(--surface-3)', background: 'var(--surface-1)', fontSize: '0.9375rem', outline: 'none', color: 'var(--text-primary)', transition: 'all 0.2s' }}
                onFocus={e => { e.target.style.background = 'white'; e.target.style.borderColor = 'var(--brand-400)'; e.target.style.boxShadow = 'var(--glow-brand)'; }}
                onBlur={e => { e.target.style.background = 'var(--surface-1)'; e.target.style.borderColor = 'var(--surface-3)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
            <div style={{ display: 'flex', background: 'var(--surface-1)', borderRadius: 12, padding: 4 }}>
              {[['all', 'All'], ['student', 'Students'], ['teacher', 'Teachers']].map(([val, lbl]) => (
                <button key={val} onClick={() => setFilterRole(val)} style={{
                  padding: '0.5rem 1.25rem', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)',
                  background: filterRole === val ? 'white' : 'transparent',
                  color: filterRole === val ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontWeight: 700, fontSize: '0.875rem', borderRadius: 8,
                  boxShadow: filterRole === val ? '0 2px 6px rgba(0,0,0,0.04)' : 'none',
                  transition: 'all 0.2s',
                }}>{lbl}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Seamless List */}
        {filtered.length === 0 ? (
          <div style={{ padding: '6rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: 'var(--surface-1)', border: '1px dashed var(--surface-4)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Search size={28} color="var(--text-muted)" />
            </div>
            <p style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1.125rem', marginBottom: 4 }}>No members found</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>Adjust your filters or add a new member.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filtered.map((u, i) => {
              const rb = ROLE[u.role] || ROLE.student;
              const isLast = i === filtered.length - 1;
              return (
                <div key={u.id} style={{
                  display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '2rem', alignItems: 'center',
                  padding: '1.25rem 2.5rem', borderBottom: isLast ? 'none' : '1px solid var(--surface-2)',
                  background: u.is_active ? 'transparent' : 'var(--surface-1)',
                  transition: 'background 0.2s', opacity: u.is_active ? 1 : 0.6,
                }}
                  onMouseEnter={e => { if(u.is_active) e.currentTarget.style.background = 'var(--brand-50)'; }}
                  onMouseLeave={e => { if(u.is_active) e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 0 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                      background: `linear-gradient(135deg, ${rb.color}, ${rb.color}bb)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: 800, fontSize: '1rem',
                      boxShadow: `0 4px 12px ${rb.color}30`
                    }}>
                      {u.full_name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9375rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.full_name}</p>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</p>
                    </div>
                  </div>

                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '4px 10px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700,
                    color: rb.color, background: rb.bg, border: `1px solid ${rb.border}`,
                    whiteSpace: 'nowrap',
                  }}>
                    <rb.Icon size={12} /> {rb.label}
                  </span>

                  {u.is_active
                    ? <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', fontWeight: 600, color: '#059669', width: 90 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} /> Active
                      </span>
                    : <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', width: 90 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-muted)' }} /> Suspended
                      </span>
                  }

                  <button
                    onClick={() => deactivateMutation.mutate(u.id)}
                    disabled={deactivateMutation.isPending}
                    style={{ 
                      background: 'none', border: 'none', cursor: 'pointer', 
                      color: u.is_active ? 'var(--text-muted)' : '#059669',
                      fontWeight: 700, fontSize: '0.8125rem', padding: '0.5rem',
                      borderRadius: 8, transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = u.is_active ? '#fff1f2' : '#ecfdf5'; e.currentTarget.style.color = u.is_active ? '#e11d48' : '#059669'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = u.is_active ? 'var(--text-muted)' : '#059669'; }}
                  >
                    {u.is_active ? 'Deactivate' : 'Reactivate'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Right: Insights Panel ── */}
      <div style={{ width: 340, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: '5.5rem' }}>
        
        {/* Intelligence Card */}
        <div style={{ background: 'var(--surface-1)', borderRadius: 24, padding: '2rem', border: '1px solid var(--glass-border)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={14} color="var(--brand-500)" /> Directory Insights
          </h3>
          
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: '2rem' }}>
            <span style={{ fontSize: '3.5rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-0.04em' }}>{allUsers.length}</span>
            <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-muted)' }}>total members</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)' }}>
                <GraduationCap size={16} color="#0e7490" /> <span style={{ fontSize: '0.9375rem', fontWeight: 600 }}>Students</span>
              </div>
              <span style={{ fontSize: '1rem', fontWeight: 800 }}>{students}</span>
            </div>
            <div style={{ height: 1, background: 'var(--surface-2)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)' }}>
                <BookOpen size={16} color="#059669" /> <span style={{ fontSize: '0.9375rem', fontWeight: 600 }}>Teachers</span>
              </div>
              <span style={{ fontSize: '1rem', fontWeight: 800 }}>{teachers}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
