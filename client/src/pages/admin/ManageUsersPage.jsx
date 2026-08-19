import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../../services/api.service';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import {
  Users, UserPlus, GraduationCap, BookOpen,
  X, Copy, Check, Mail, User, Lock, Eye, EyeOff,
  TrendingUp, Search, Filter, MoreHorizontal,
} from 'lucide-react';

// ── Credential Card (shown once after user creation) ─────────────────────────
function CredentialCard({ cred, onClose }) {
  const [copied, setCopied] = useState(false);

  const copyAll = () => {
    navigator.clipboard.writeText(`Email: ${cred.email}\nPassword: ${cred.temp_password}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
      backdropFilter: 'blur(4px)', zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
    }}>
      <div style={{
        background: 'white', borderRadius: 20, padding: '2rem', maxWidth: 420, width: '100%',
        boxShadow: '0 24px 60px rgba(0,0,0,0.15)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#ecfdf5', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Check size={22} color="#059669" />
          </div>
          <div>
            <p style={{ fontWeight: 700, color: '#111827', fontSize: '1rem' }}>Account Created!</p>
            <p style={{ color: '#6b7280', fontSize: '0.8125rem' }}>Share these credentials with {cred.full_name}</p>
          </div>
        </div>

        {/* Warning */}
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1.25rem', display: 'flex', gap: 8 }}>
          <span style={{ fontSize: '1rem', flexShrink: 0 }}>⚠️</span>
          <p style={{ fontSize: '0.8125rem', color: '#92400e', lineHeight: 1.5 }}>
            This password is shown <strong>only once</strong>. Copy and share it securely before closing.
          </p>
        </div>

        {/* Credentials */}
        <div style={{ background: '#f9fafb', borderRadius: 12, border: '1px solid #e5e7eb', padding: '1.125rem', marginBottom: '1.25rem' }}>
          <div style={{ marginBottom: '0.75rem' }}>
            <p style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</p>
            <p style={{ fontWeight: 600, color: '#111827', fontSize: '0.9375rem' }}>{cred.email}</p>
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Temporary Password</p>
            <p style={{ fontWeight: 700, color: '#4f46e5', fontSize: '1.125rem', letterSpacing: '0.1em', fontFamily: 'monospace' }}>{cred.temp_password}</p>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={copyAll}
            style={{
              flex: 1, padding: '0.75rem', borderRadius: 10, border: '1.5px solid #e5e7eb',
              background: copied ? '#ecfdf5' : 'white', cursor: 'pointer',
              fontWeight: 600, fontSize: '0.875rem', color: copied ? '#059669' : '#374151',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.2s',
            }}
          >
            {copied ? <><Check size={15} /> Copied!</> : <><Copy size={15} /> Copy Credentials</>}
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '0.75rem', borderRadius: 10, border: 'none',
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', cursor: 'pointer',
              fontWeight: 600, fontSize: '0.875rem', color: 'white',
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Add User Modal ────────────────────────────────────────────────────────────
function AddUserModal({ tenantId, onClose, onSuccess }) {
  const [form, setForm] = useState({ full_name: '', email: '', role: 'student', password: '' });
  const [showPass, setShowPass] = useState(false);
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => adminAPI.createUser(tenantId, {
      full_name: form.full_name,
      email: form.email,
      role: form.role,
      password: form.password || undefined,
    }),
    onSuccess: (res) => {
      qc.invalidateQueries(['tenant-users', tenantId]);
      toast.success(`${form.role === 'student' ? 'Student' : 'Teacher'} account created!`);
      onSuccess(res.data);
    },
    onError: (err) => toast.error(err.response?.data?.detail || 'Failed to create user'),
  });

  const roleOptions = [
    { value: 'student', label: 'Student', emoji: '🎓', color: '#4f46e5', bg: '#eef2ff', border: '#c7d2fe' },
    { value: 'teacher', label: 'Teacher', emoji: '👩‍🏫', color: '#059669', bg: '#ecfdf5', border: '#bbf7d0' },
  ];

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)',
      backdropFilter: 'blur(4px)', zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
    }}>
      <div style={{ background: 'white', borderRadius: 20, padding: '2rem', maxWidth: 440, width: '100%', boxShadow: '0 24px 60px rgba(0,0,0,0.12)' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
          <div>
            <h3 style={{ fontWeight: 800, color: '#111827', fontSize: '1.125rem' }}>Add New Member</h3>
            <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: 2 }}>Credentials will be shown once after creation</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 4 }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={e => { e.preventDefault(); mutation.mutate(); }} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
          {/* Role */}
          <div>
            <label className="label">Role</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {roleOptions.map(({ value, label, emoji, color, bg, border }) => {
                const active = form.role === value;
                return (
                  <button key={value} type="button" onClick={() => setForm(f => ({ ...f, role: value }))} style={{
                    padding: '0.875rem', borderRadius: 12, cursor: 'pointer', textAlign: 'center',
                    border: `2px solid ${active ? border : '#e5e7eb'}`,
                    background: active ? bg : 'white',
                    transition: 'all 0.2s',
                    transform: active ? 'translateY(-1px)' : 'none',
                    boxShadow: active ? `0 4px 12px ${color}20` : 'none',
                  }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>{emoji}</div>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: active ? color : '#374151' }}>{label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="label">Full Name</label>
            <div className="input-group">
              <User size={16} className="input-icon" />
              <input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder="Full name" className="input" required />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="label">Email Address</label>
            <div className="input-group">
              <Mail size={16} className="input-icon" />
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="member@yourinstitution.edu" className="input" required />
            </div>
          </div>

          {/* Password (optional) */}
          <div>
            <label className="label">Password <span style={{ color: '#9ca3af', fontWeight: 400 }}>(leave blank to auto-generate)</span></label>
            <div className="input-group" style={{ position: 'relative' }}>
              <Lock size={16} className="input-icon" />
              <input
                type={showPass ? 'text' : 'password'}
                value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="Auto-generate" className="input" style={{ paddingRight: '2.75rem' }}
              />
              <button type="button" onClick={() => setShowPass(s => !s)} style={{
                position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex',
              }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} style={{
              flex: 1, padding: '0.75rem', borderRadius: 12, border: '1.5px solid #e5e7eb',
              background: 'white', fontWeight: 600, cursor: 'pointer', color: '#374151',
            }}>Cancel</button>
            <button type="submit" disabled={mutation.isPending} className="btn btn-primary" style={{ flex: 2, height: 46, borderRadius: 12, fontSize: '0.9375rem' }}>
              {mutation.isPending
                ? <span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.35)', borderTopColor: 'white', display: 'inline-block' }} className="animate-spin" />
                : <><UserPlus size={15} /> Create Account</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Role badge ────────────────────────────────────────────────────────────────
const roleBadge = {
  student: { label: 'Student', color: '#4f46e5', bg: '#eef2ff', border: '#c7d2fe', Icon: GraduationCap },
  teacher: { label: 'Teacher', color: '#059669', bg: '#ecfdf5', border: '#bbf7d0', Icon: BookOpen },
};

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ManageUsersPage() {
  const { user } = useAuthStore();
  const [showModal, setShowModal] = useState(false);
  const [credential, setCredential] = useState(null);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  const tenantId = user?.tenant_id;

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['tenant-users', tenantId],
    queryFn: () => adminAPI.listUsers(tenantId).then(r => r.data),
    enabled: !!tenantId,
  });

  const users = (usersData || []).filter(u => {
    const matchesSearch = u.full_name.toLowerCase().includes(search.toLowerCase()) ||
                          u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const students = (usersData || []).filter(u => u.role === 'student').length;
  const teachers = (usersData || []).filter(u => u.role === 'teacher').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Modals */}
      {showModal && (
        <AddUserModal
          tenantId={tenantId}
          onClose={() => setShowModal(false)}
          onSuccess={(data) => { setShowModal(false); setCredential(data); }}
        />
      )}
      {credential && <CredentialCard cred={credential} onClose={() => setCredential(null)} />}

      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Manage Members</h1>
          <p className="page-subtitle">Add students and teachers to your organization.</p>
        </div>
        <button className="btn btn-primary" style={{ gap: 8 }} onClick={() => setShowModal(true)}>
          <UserPlus size={16} /> Add Member
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        {[
          { label: 'Total Members', value: (usersData || []).length, icon: Users, color: '#4f46e5', bg: '#eef2ff', border: '#c7d2fe' },
          { label: 'Students', value: students, icon: GraduationCap, color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
          { label: 'Teachers', value: teachers, icon: BookOpen, color: '#059669', bg: '#ecfdf5', border: '#bbf7d0' },
        ].map(({ label, value, icon: Icon, color, bg, border }) => (
          <div key={label} className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: bg, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={20} color={color} />
              </div>
            </div>
            <p style={{ fontSize: '1.875rem', fontWeight: 900, color: '#111827', letterSpacing: '-0.04em', lineHeight: 1 }}>{value}</p>
            <p style={{ fontSize: '0.8125rem', color: '#6b7280', marginTop: 6 }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            style={{ width: '100%', padding: '0.625rem 0.875rem 0.625rem 2.25rem', borderRadius: 10, border: '1.5px solid #e5e7eb', background: 'white', outline: 'none', fontSize: '0.875rem', color: '#111827', fontFamily: 'var(--font-body)' }}
          />
        </div>
        {['all', 'student', 'teacher'].map(r => (
          <button key={r} onClick={() => setFilterRole(r)} style={{
            padding: '0.5rem 1rem', borderRadius: 8, border: '1.5px solid',
            borderColor: filterRole === r ? '#6366f1' : '#e5e7eb',
            background: filterRole === r ? '#eef2ff' : 'white',
            color: filterRole === r ? '#4f46e5' : '#6b7280',
            fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer', transition: 'all 0.15s', textTransform: 'capitalize',
          }}>{r === 'all' ? 'All Members' : r + 's'}</button>
        ))}
      </div>

      {/* Table */}
      <div>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>Loading members…</div>
        ) : users.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <div style={{ width: 64, height: 64, borderRadius: 18, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <Users size={28} color="#4f46e5" />
            </div>
            <p style={{ fontWeight: 700, color: '#111827', marginBottom: 8 }}>No members yet</p>
            <p style={{ color: '#6b7280', fontSize: '0.9375rem', marginBottom: '1.5rem' }}>Add your first student or teacher to get started.</p>
            <button className="btn btn-primary" style={{ gap: 8 }} onClick={() => setShowModal(true)}>
              <UserPlus size={16} /> Add First Member
            </button>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Role</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => {
                  const rb = roleBadge[u.role] || roleBadge.student;
                  return (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.875rem',
                            background: `linear-gradient(135deg, ${rb.color}, ${rb.color}cc)`,
                            flexShrink: 0,
                          }}>
                            {u.full_name?.[0]?.toUpperCase()}
                          </div>
                          <p style={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>{u.full_name}</p>
                        </div>
                      </td>
                      <td>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px',
                          borderRadius: 999, fontSize: '0.75rem', fontWeight: 700,
                          color: rb.color, background: rb.bg, border: `1px solid ${rb.border}`,
                        }}>
                          <rb.Icon size={11} /> {rb.label}
                        </span>
                      </td>
                      <td style={{ color: '#6b7280', fontSize: '0.875rem' }}>{u.email}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div className="live-dot" style={{ width: 7, height: 7 }} />
                          <span style={{ fontSize: '0.8125rem', color: '#059669', fontWeight: 500 }}>Active</span>
                        </div>
                      </td>
                      <td style={{ color: '#9ca3af', fontSize: '0.8125rem' }}>
                        {new Date(u.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td>
                        <button className="btn btn-ghost btn-icon btn-sm"><MoreHorizontal size={16} /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
