import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '../../lib/api';
import { Users, Search, MoreHorizontal, ShieldAlert, CheckCircle, Mail } from 'lucide-react';
import { useState } from 'react';
import Loader from '../../components/ui/Loader';

export default function GlobalUsersPage() {
  const [search, setSearch] = useState('');

  const { data: users, isLoading } = useQuery({
    queryKey: ['global-users'],
    queryFn: () => adminAPI.listGlobalUsers().then(r => r.data),
  });

  const filteredUsers = users?.filter(u => 
    u.full_name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={24} color="var(--brand-500)" /> Global Users Directory
          </h1>
          <p className="page-subtitle">Manage all users across the entire platform.</p>
        </div>
      </div>

      <div className="glass-card table-wrapper">
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface-1)' }}>
          <div style={{ position: 'relative', width: 300 }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 10 }} />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '2.5rem', width: '100%', height: 36, fontSize: '0.875rem' }} 
            />
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, background: 'var(--surface-0)', padding: '4px 10px', borderRadius: 999, border: '1px solid var(--glass-border)' }}>
            {filteredUsers?.length || 0} Users Found
          </span>
        </div>

        {isLoading ? (
          <Loader text="Loading global users..." />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Tenant ID</th>
                <th>Status</th>
                <th>Created At</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers?.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="avatar" style={{ width: 34, height: 34, fontSize: '0.875rem', background: 'var(--brand-100)', color: 'var(--brand-700)' }}>
                        {u.full_name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{u.full_name}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-gray" style={{ textTransform: 'capitalize' }}>
                      {u.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    {u.tenant_id ? (
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        #{u.tenant_id}
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>System</span>
                    )}
                  </td>
                  <td>
                    {u.is_active ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div className="live-dot" style={{ width: 6, height: 6 }} />
                        <span style={{ fontSize: '0.8125rem', color: '#059669', fontWeight: 500 }}>Active</span>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500 }}>Banned</span>
                    )}
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <button className="btn btn-ghost btn-icon btn-sm">
                      <MoreHorizontal size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredUsers?.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No users match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
