import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { adminAPI } from '../../services/api.service';
import { Users, Search, Filter, ShieldCheck, GraduationCap, BookOpen, Building2, UserX, Ban, CheckCircle } from 'lucide-react';
import Loader from '../../components/ui/Loader';

const ROLE_META = {
  student:     { label: 'Student',     icon: GraduationCap, color: '#0e7490', bg: '#ecfeff', border: '#a5f3fc' },
  teacher:     { label: 'Teacher',     icon: BookOpen,      color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  tenant_admin:{ label: 'Admin',       icon: Building2,     color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  super_admin: { label: 'Super Admin', icon: ShieldCheck,   color: '#db2777', bg: '#fdf2f8', border: '#fbcfe8' },
};

export default function GlobalUsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const { data: users, isLoading } = useQuery({
    queryKey: ['global-users'],
    queryFn: () => adminAPI.listGlobalUsers().then(r => r.data),
  });

  const toggleStatus = useMutation({
    mutationFn: (userId) => adminAPI.suspendUser(userId),
    onSuccess: (data) => {
      toast.success(data.data.message);
      queryClient.invalidateQueries(['global-users']);
    },
    onError: () => toast.error('Failed to update user status'),
  });

  const filtered = users?.filter(u => {
    const matchSearch = u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const roleCounts = users?.reduce((acc, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1;
    return acc;
  }, {}) || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title">Global Users Directory</h1>
          <p className="page-subtitle">Every user across all organizations on the platform.</p>
        </div>
        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-secondary)', background: 'var(--surface-2)', padding: '6px 14px', borderRadius: 999, border: '1px solid var(--glass-border)' }}>
          {users?.length || 0} Total Users
        </span>
      </div>

      {/* Role Distribution Pills */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setRoleFilter('all')}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 14px', borderRadius: 999, border: '2px solid',
            fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer',
            borderColor: roleFilter === 'all' ? 'var(--brand-500)' : 'var(--glass-border)',
            background: roleFilter === 'all' ? 'var(--brand-50)' : 'transparent',
            color: roleFilter === 'all' ? 'var(--brand-600)' : 'var(--text-muted)',
            transition: 'all 0.15s',
          }}
        >
          <Filter size={13} /> All Roles
          <span style={{ background: roleFilter === 'all' ? 'var(--brand-500)' : 'var(--surface-3)', color: roleFilter === 'all' ? 'white' : 'var(--text-secondary)', borderRadius: 999, padding: '1px 7px', fontSize: '0.6875rem', fontWeight: 700 }}>
            {users?.length || 0}
          </span>
        </button>
        {Object.entries(ROLE_META).map(([key, meta]) => {
          const Icon = meta.icon;
          const count = roleCounts[key] || 0;
          const active = roleFilter === key;
          return (
            <button
              key={key}
              onClick={() => setRoleFilter(key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 14px', borderRadius: 999, border: '2px solid',
                fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer',
                borderColor: active ? meta.color : 'var(--glass-border)',
                background: active ? meta.bg : 'transparent',
                color: active ? meta.color : 'var(--text-muted)',
                transition: 'all 0.15s',
              }}
            >
              <Icon size={13} /> {meta.label}
              <span style={{ background: active ? meta.color : 'var(--surface-3)', color: active ? 'white' : 'var(--text-secondary)', borderRadius: 999, padding: '1px 7px', fontSize: '0.6875rem', fontWeight: 700 }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Table Card */}
      <div className="glass-card" style={{ padding: 0 }}>
        {/* Header with Search */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', background: 'var(--surface-1)', borderTopLeftRadius: 'inherit', borderTopRightRadius: 'inherit' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 340 }}>
            <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '2.25rem', width: '100%', height: 36, fontSize: '0.875rem' }}
            />
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, background: 'var(--surface-0)', padding: '4px 10px', borderRadius: 999, border: '1px solid var(--glass-border)', flexShrink: 0 }}>
            {filtered?.length || 0} shown
          </span>
        </div>

        {isLoading ? (
          <Loader text="Loading global users..." />
        ) : !filtered?.length ? (
          <div style={{ padding: '4rem', textAlign: 'center' }}>
            <UserX size={32} color="var(--text-muted)" style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
            <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>No users match your filters.</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 4 }}>Try adjusting the role filter or search query.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Organization</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => {
                  const role = ROLE_META[u.role] || ROLE_META.student;
                  const RoleIcon = role.icon;
                  return (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 38, height: 38, borderRadius: 12, flexShrink: 0,
                            background: role.bg, border: `1px solid ${role.border}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: role.color, fontWeight: 700, fontSize: '0.9375rem',
                          }}>
                            {u.full_name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{u.full_name}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', fontWeight: 700, color: role.color, background: role.bg, border: `1px solid ${role.border}`, padding: '3px 8px', borderRadius: 6 }}>
                          <RoleIcon size={11} /> {role.label}
                        </span>
                      </td>
                      <td>
                        {u.tenant_id ? (
                          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Building2 size={12} color="var(--text-muted)" /> Org #{u.tenant_id}
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--brand-600)', fontWeight: 700, background: 'var(--brand-50)', padding: '2px 7px', borderRadius: 4 }}>Platform</span>
                        )}
                      </td>
                      <td>
                        {u.is_active ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.8125rem', fontWeight: 500, color: '#16a34a' }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} /> Active
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#dc2626' }}>Suspended</span>
                        )}
                      </td>
                      <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        {new Date(u.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td>
                        <button
                          onClick={() => toggleStatus.mutate(u.id)}
                          className="btn btn-ghost btn-icon btn-sm"
                          title={u.is_active ? "Suspend User" : "Activate User"}
                          disabled={toggleStatus.isLoading || u.role === 'super_admin'}
                        >
                          {u.is_active ? <Ban size={16} color="var(--text-muted)" /> : <CheckCircle size={16} color="var(--text-muted)" />}
                        </button>
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
