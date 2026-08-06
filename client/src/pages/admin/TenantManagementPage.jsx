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
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Building2 size={24} style={{ color: '#6366f1' }} /> Tenant Management</h1>
        <p className="text-slate-400 text-sm mt-1">Create and manage tenant organizations on the platform.</p>
      </div>

      <div className="glass-card p-6">
        <h2 className="font-semibold text-white mb-5 flex items-center gap-2"><Plus size={18} /> Create New Tenant</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-slate-300 mb-1.5">Organization Name</label>
            <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Sunrise University" className="input-field" required />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1.5 flex items-center gap-2"><Globe size={14} /> Subdomain</label>
            <div className="flex items-center gap-2">
              <input name="subdomain" value={form.subdomain} onChange={handleChange} placeholder="sunrise-univ" className="input-field flex-1" required />
              <span className="text-slate-400 text-sm whitespace-nowrap">.lms.com</span>
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1.5">Plan</label>
            <select name="plan" value={form.plan} onChange={handleChange} className="input-field">
              <option value="basic">Basic</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1.5 flex items-center gap-2"><Palette size={14} /> Primary Color</label>
              <div className="flex items-center gap-2">
                <input type="color" name="primary_color" value={form.primary_color} onChange={handleChange} className="w-10 h-10 rounded-lg cursor-pointer border-0" style={{ background: 'none' }} />
                <input value={form.primary_color} onChange={(e) => setForm({ ...form, primary_color: e.target.value })} className="input-field flex-1 text-xs" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Secondary Color</label>
              <div className="flex items-center gap-2">
                <input type="color" name="secondary_color" value={form.secondary_color} onChange={handleChange} className="w-10 h-10 rounded-lg cursor-pointer border-0" style={{ background: 'none' }} />
                <input value={form.secondary_color} onChange={(e) => setForm({ ...form, secondary_color: e.target.value })} className="input-field flex-1 text-xs" />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="p-4 rounded-xl" style={{ background: form.primary_color + '15', border: `1px solid ${form.primary_color}33` }}>
            <p className="text-xs text-slate-400 mb-2">Brand Preview</p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg" style={{ background: `linear-gradient(135deg, ${form.primary_color}, ${form.secondary_color})` }} />
              <span className="text-sm font-semibold text-white">{form.name || 'Organization Name'}</span>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            Create Tenant
          </button>
        </form>
      </div>

      {created && (
        <div className="glass-card p-6" style={{ border: '1px solid rgba(16,185,129,0.3)' }}>
          <h2 className="font-semibold text-emerald-400 mb-3 flex items-center gap-2"><CheckCircle size={18} /> Tenant Created Successfully</h2>
          <div className="space-y-2 text-sm">
            <p className="text-slate-300"><span className="text-slate-500">ID:</span> #{created.id}</p>
            <p className="text-slate-300"><span className="text-slate-500">Name:</span> {created.name}</p>
            <p className="text-slate-300"><span className="text-slate-500">URL:</span> {created.subdomain}.lms.com</p>
            <p className="text-slate-300"><span className="text-slate-500">Plan:</span> {created.plan}</p>
          </div>
        </div>
      )}
    </div>
  );
}
