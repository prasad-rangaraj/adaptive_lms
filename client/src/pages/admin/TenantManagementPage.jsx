import { useState } from 'react';
import { tenantsAPI } from '../../lib/api';
import { Building2, Plus, Loader2, CheckCircle, Globe, Palette } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TenantManagementPage() {
  const [form, setForm] = useState({ name: '', subdomain: '', plan: 'basic', primary_color: '#6366f1', secondary_color: '#8b5cf6' });
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await tenantsAPI.create(form);
      setCreated(res.data);
      toast.success(`Tenant "${res.data.name}" created successfully!`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create tenant');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building2 size={24} color="var(--brand-500)" /> Tenant Management
          </h1>
          <p className="page-subtitle">Create and manage tenant organizations on the platform.</p>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
          <Plus size={20} color="var(--brand-500)" /> Create New Tenant
        </h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Organization Name</label>
            <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Sunrise University" className="input-field" style={{ width: '100%' }} required />
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              <Globe size={16} /> Subdomain
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input name="subdomain" value={form.subdomain} onChange={handleChange} placeholder="sunrise-univ" className="input-field" style={{ flex: 1 }} required />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500, whiteSpace: 'nowrap' }}>.lms.com</span>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Plan</label>
            <select name="plan" value={form.plan} onChange={handleChange} className="input-field" style={{ width: '100%' }}>
              <option value="basic">Basic</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                <Palette size={16} /> Primary Color
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="color" name="primary_color" value={form.primary_color} onChange={handleChange} style={{ width: 42, height: 42, padding: 0, border: 'none', borderRadius: 8, cursor: 'pointer' }} />
                <input value={form.primary_color} onChange={(e) => setForm({ ...form, primary_color: e.target.value })} className="input-field" style={{ flex: 1, fontFamily: 'monospace' }} />
              </div>
            </div>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                <Palette size={16} /> Secondary Color
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="color" name="secondary_color" value={form.secondary_color} onChange={handleChange} style={{ width: 42, height: 42, padding: 0, border: 'none', borderRadius: 8, cursor: 'pointer' }} />
                <input value={form.secondary_color} onChange={(e) => setForm({ ...form, secondary_color: e.target.value })} className="input-field" style={{ flex: 1, fontFamily: 'monospace' }} />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div style={{ padding: '1rem', borderRadius: 12, border: `1px solid ${form.primary_color}40`, background: `${form.primary_color}0A`, marginTop: '0.5rem' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Brand Preview</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `linear-gradient(135deg, ${form.primary_color}, ${form.secondary_color})`, boxShadow: `0 4px 12px ${form.primary_color}40` }} />
              <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{form.name || 'Organization Name'}</span>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
            Create Tenant
          </button>
        </form>
      </div>

      {created && (
        <div className="glass-card" style={{ padding: '1.5rem', border: '1px solid #34d399', background: '#ecfdf5' }}>
          <h2 style={{ fontWeight: 700, color: '#059669', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle size={20} /> Tenant Created Successfully
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
            <p style={{ color: '#065f46' }}><span style={{ fontWeight: 600, width: 80, display: 'inline-block' }}>ID:</span> #{created.id}</p>
            <p style={{ color: '#065f46' }}><span style={{ fontWeight: 600, width: 80, display: 'inline-block' }}>Name:</span> {created.name}</p>
            <p style={{ color: '#065f46' }}><span style={{ fontWeight: 600, width: 80, display: 'inline-block' }}>URL:</span> <a href={`https://${created.subdomain}.lms.com`} target="_blank" rel="noreferrer" style={{ color: '#059669', textDecoration: 'underline' }}>{created.subdomain}.lms.com</a></p>
            <p style={{ color: '#065f46' }}><span style={{ fontWeight: 600, width: 80, display: 'inline-block' }}>Plan:</span> <span style={{ textTransform: 'capitalize' }}>{created.plan}</span></p>
          </div>
        </div>
      )}
    </div>
  );
}
