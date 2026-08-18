import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { tenantsAPI, adminAPI, authAPI } from '../../lib/api';
import toast from 'react-hot-toast';
import {
  Building2, Globe, Palette, Activity, ShieldAlert,
  Users, User, GraduationCap, BookOpen, ChevronLeft, Save,
} from 'lucide-react';
import Loader from '../../components/ui/Loader';

export default function TenantDetailsPage() {
  const { id } = useParams();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { impersonate } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);

  const handleImpersonate = async (targetUserId) => {
    try {
      const res = await authAPI.impersonate(targetUserId);
      const { access_token, user_id, role, full_name, tenant_id } = res.data;
      impersonate({ id: user_id, role, full_name, tenant_id }, access_token);
      toast.success(`Now impersonating ${full_name}`);
      
      if (role === 'student') navigate('/student/dashboard');
      else if (role === 'teacher') navigate('/teacher/dashboard');
      else if (role === 'tenant_admin') navigate('/admin/dashboard');
      else navigate('/');
    } catch (err) {
      toast.error('Failed to impersonate user');
    }
  };

  const { data: tenant, isLoading: loadingTenant } = useQuery({
    queryKey: ['tenant', id],
    queryFn: () => tenantsAPI.get(id).then(r => r.data),
  });

  useEffect(() => {
    if (tenant && !form) {
      setForm({
        name: tenant.name, subdomain: tenant.subdomain,
        plan: tenant.plan, primary_color: tenant.primary_color,
        secondary_color: tenant.secondary_color,
      });
    }
  }, [tenant, form]);

  const { data: users, isLoading: loadingUsers } = useQuery({
    queryKey: ['tenant-users', id],
    queryFn: () => adminAPI.listUsers(id).then(r => r.data),
  });

  const updateMutation = useMutation({
    mutationFn: (data) => tenantsAPI.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries(['tenant', id]);
      toast.success('Tenant settings updated');
      setEditing(false);
    },
    onError: (err) => toast.error(err.response?.data?.detail || 'Failed to update tenant'),
  });

  if (loadingTenant) return <Loader text="Loading tenant details..." />;
  if (!tenant) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Tenant not found.</div>;
  if (!form) return <Loader text="Initializing form..." />;

  const handleSave = (e) => {
    e.preventDefault();
    updateMutation.mutate(form);
  };

  const badgeClass = tenant.plan === 'enterprise' ? 'badge-brand' : tenant.plan === 'pro' ? 'badge-success' : 'badge-gray';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => navigate('/super-admin/dashboard')} className="btn btn-ghost btn-icon" style={{ background: 'var(--surface-0)', border: '1px solid var(--glass-border)' }}>
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building2 size={24} color={tenant.primary_color} />
              {tenant.name}
            </h1>
            <p className="page-subtitle" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Globe size={14} /> {tenant.subdomain}.lms.com
            </p>
          </div>
        </div>
        <div>
          <span className={`badge ${tenant.is_active ? 'badge-success' : 'badge-gray'}`} style={{ fontSize: '0.875rem' }}>
            {tenant.is_active ? 'Active' : 'Suspended'}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Left Column: Settings & Danger Zone */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Activity size={18} color="var(--brand-500)" /> Settings
              </h2>
              <button 
                onClick={() => setEditing(!editing)}
                style={{ background: 'none', border: 'none', color: 'var(--brand-500)', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}
              >
                {editing ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {editing ? (
              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>Org Name</label>
                  <input className="input-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>Subdomain</label>
                  <input className="input-field" value={form.subdomain} onChange={e => setForm({...form, subdomain: e.target.value})} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>Plan</label>
                  <select className="input-field" value={form.plan} onChange={e => setForm({...form, plan: e.target.value})}>
                    <option value="basic">Basic</option>
                    <option value="pro">Pro</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>Primary Color</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input type="color" value={form.primary_color} onChange={e => setForm({...form, primary_color: e.target.value})} style={{ width: 32, height: 32, padding: 0, border: 'none', borderRadius: 8, cursor: 'pointer' }} />
                      <input className="input-field" value={form.primary_color} onChange={e => setForm({...form, primary_color: e.target.value})} style={{ flex: 1 }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>Secondary Color</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input type="color" value={form.secondary_color} onChange={e => setForm({...form, secondary_color: e.target.value})} style={{ width: 32, height: 32, padding: 0, border: 'none', borderRadius: 8, cursor: 'pointer' }} />
                      <input className="input-field" value={form.secondary_color} onChange={e => setForm({...form, secondary_color: e.target.value})} style={{ flex: 1 }} />
                    </div>
                  </div>
                </div>
                <button type="submit" disabled={updateMutation.isPending} className="btn btn-primary" style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }}>
                  <Save size={16} /> Save Changes
                </button>
              </form>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Plan</p>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', textTransform: 'capitalize' }}><span className={`badge ${badgeClass}`}>{tenant.plan}</span></p>
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Subdomain</p>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{tenant.subdomain}.lms.com</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Theme Colors</p>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: 4 }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: tenant.primary_color, border: '1px solid var(--glass-border)' }} title="Primary" />
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: tenant.secondary_color, border: '1px solid var(--glass-border)' }} title="Secondary" />
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Created</p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{new Date(tenant.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            )}
          </div>

          <div className="glass-card" style={{ padding: '1.5rem', background: '#fff1f2', borderColor: '#fecdd3' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#be185d', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <ShieldAlert size={18} /> Danger Zone
            </h2>
            <p style={{ fontSize: '0.75rem', color: '#9f1239', marginBottom: '1rem' }}>Suspending a tenant prevents all their users from logging in.</p>
            <button className="btn" style={{ background: '#ffffff', color: '#e11d48', border: '1px solid #fecdd3', width: '100%', justifyContent: 'center' }}>
              {tenant.is_active ? 'Suspend Tenant' : 'Reactivate Tenant'}
            </button>
          </div>

        </div>

        {/* Right Column: Member Roster */}
        <div className="glass-card table-wrapper" style={{ height: '100%', padding: 0 }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface-1)' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={18} color="var(--brand-500)" /> Member Roster
            </h2>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, background: 'var(--surface-0)', padding: '4px 10px', borderRadius: 999, border: '1px solid var(--glass-border)' }}>
              {users?.length || 0} Total
            </span>
          </div>

          <div style={{ padding: '0', overflowX: 'auto' }}>
            {loadingUsers ? (
              <Loader text="Loading roster..." />
            ) : !users?.length ? (
              <div style={{ padding: '4rem', textAlign: 'center' }}>
                <Users size={32} color="var(--text-muted)" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>No members in this organization yet.</p>
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Role</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
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
                        {u.role === 'student' ? (
                          <span className="badge badge-brand" style={{ background: '#eef2ff', color: '#4f46e5', borderColor: '#c7d2fe' }}>
                            <GraduationCap size={12} /> Student
                          </span>
                        ) : u.role === 'teacher' ? (
                          <span className="badge badge-success">
                            <BookOpen size={12} /> Teacher
                          </span>
                        ) : (
                          <span className="badge badge-gray">
                            <User size={12} /> {u.role}
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          onClick={() => handleImpersonate(u.id)}
                          className="btn btn-sm"
                          style={{ background: 'var(--brand-50)', color: 'var(--brand-600)', border: '1px solid var(--brand-200)' }}
                        >
                          Impersonate
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
