import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { GraduationCap, Building2, User, Mail, Lock, Eye, EyeOff, ArrowRight, Globe } from 'lucide-react';
import AnimeBackground from '../../components/ui/AnimeBackground';

export default function RegisterPage() {
  const [form, setForm] = useState({
    org_name: '', subdomain: '', full_name: '', email: '', password: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Auto-generate subdomain from org name
    if (name === 'org_name') {
      setForm(f => ({
        ...f,
        org_name: value,
        subdomain: value.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''),
      }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.registerOrg(form);
      const { access_token, user_id, role, full_name, tenant_id } = res.data;
      login({ id: user_id, role, full_name, email: form.email, tenant_id }, access_token);
      toast.success(`Welcome, ${full_name}! Your organization is ready. 🎉`);
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { background: 'rgba(255,255,255,0.8)' };

  return (
    <div style={{ minHeight: '100vh', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <AnimeBackground />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 500 }} className="animate-fade-up">
        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(99,102,241,0.3)',
            }}>
              <GraduationCap size={24} color="white" />
            </div>
            <span style={{ fontWeight: 900, fontSize: '1.5rem', color: '#111827', letterSpacing: '-0.02em' }}>
              AdaptiveLMS
            </span>
          </Link>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.75)',
          backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.6)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.06)',
          borderRadius: 24, padding: '2.5rem',
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: 52, height: 52, borderRadius: 16,
              background: 'linear-gradient(135deg, #eef2ff, #f5f3ff)',
              border: '1px solid #c7d2fe',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1rem',
            }}>
              <Building2 size={26} color="#4f46e5" />
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.03em', marginBottom: '0.375rem' }}>
              Create Organization Account
            </h2>
            <p style={{ color: '#6b7280', fontSize: '0.9375rem' }}>
              Set up your institution's workspace. You'll add students & teachers from the dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>

            {/* Org Name */}
            <div>
              <label className="label">Organization / Institution Name</label>
              <div className="input-group">
                <Building2 size={16} className="input-icon" />
                <input
                  name="org_name" value={form.org_name} onChange={handleChange}
                  placeholder="e.g. Sunrise University"
                  className="input" required style={inputStyle}
                />
              </div>
            </div>

            {/* Subdomain */}
            <div>
              <label className="label">Workspace URL</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 0, borderRadius: 12, overflow: 'hidden', border: '1.5px solid #e5e7eb', background: 'rgba(255,255,255,0.8)', transition: 'border-color 0.18s' }}
                onFocusCapture={e => e.currentTarget.style.borderColor = '#6366f1'}
                onBlurCapture={e => e.currentTarget.style.borderColor = '#e5e7eb'}
              >
                <Globe size={15} style={{ marginLeft: '0.875rem', flexShrink: 0, color: '#9ca3af' }} />
                <input
                  name="subdomain" value={form.subdomain} onChange={handleChange}
                  placeholder="your-org"
                  style={{ flex: 1, border: 'none', outline: 'none', padding: '0.6875rem 0.75rem', background: 'transparent', color: '#111827', fontSize: '0.875rem', fontFamily: 'var(--font-body)' }}
                  required
                />
                <span style={{ padding: '0 0.875rem', color: '#9ca3af', fontSize: '0.8125rem', whiteSpace: 'nowrap', borderLeft: '1px solid #f0f1f3', height: '100%', display: 'flex', alignItems: 'center' }}>
                  .adaptiveLMS.com
                </span>
              </div>
            </div>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '0.25rem 0' }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.06)' }} />
              <span style={{ color: '#9ca3af', fontSize: '0.75rem', fontWeight: 600 }}>YOUR ADMIN ACCOUNT</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.06)' }} />
            </div>

            {/* Full Name */}
            <div>
              <label className="label">Your Full Name</label>
              <div className="input-group">
                <User size={16} className="input-icon" />
                <input name="full_name" value={form.full_name} onChange={handleChange} placeholder="Your name" className="input" required style={inputStyle} />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="label">Work Email</label>
              <div className="input-group">
                <Mail size={16} className="input-icon" />
                <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="admin@yourinstitution.edu" className="input" required style={inputStyle} />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="label">Password</label>
              <div className="input-group" style={{ position: 'relative' }}>
                <Lock size={16} className="input-icon" />
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password" value={form.password} onChange={handleChange}
                  placeholder="Min. 8 characters" className="input" required minLength={8}
                  style={{ paddingRight: '2.75rem', ...inputStyle }}
                />
                <button type="button" onClick={() => setShowPass(s => !s)} style={{
                  position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex',
                }}
                  onMouseEnter={e => e.currentTarget.style.color = '#6366f1'}
                  onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', height: 50, fontSize: '1rem', borderRadius: 12, boxShadow: '0 4px 14px rgba(79,70,229,0.3)' }}>
              {loading
                ? <span style={{ width: 18, height: 18, borderRadius: '50%', border: '2.5px solid rgba(255,255,255,0.35)', borderTopColor: 'white', display: 'inline-block' }} className="animate-spin" />
                : <>Create Organization Account <ArrowRight size={16} /></>
              }
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0 1rem' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.06)' }} />
            <span style={{ padding: '0 0.75rem', color: '#9ca3af', fontSize: '0.8125rem' }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.06)' }} />
          </div>

          <p style={{ textAlign: 'center', fontSize: '0.9rem', color: '#6b7280' }}>
            Already have an account?{' '}
            <Link to="/auth/login" style={{ color: '#4f46e5', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
