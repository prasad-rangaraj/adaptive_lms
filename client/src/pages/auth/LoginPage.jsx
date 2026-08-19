import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api.service';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { GraduationCap, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import AnimeBackground from '../../components/ui/AnimeBackground';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.login(email, password);
      const { access_token, user_id, role, full_name, tenant_id } = res.data;
      login({ id: user_id, role, full_name, email, tenant_id }, access_token);
      toast.success(`Welcome back, ${full_name}! 👋`);
      if (role === 'student') navigate('/student/dashboard');
      else if (role === 'teacher') navigate('/teacher/dashboard');
      else navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Incorrect email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      
      <AnimeBackground />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 440 }} className="animate-fade-up">
        {/* Header Logo */}
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

        {/* Form Card */}
        <div style={{
          background: 'rgba(255,255,255,0.75)',
          backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.6)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.06)',
          borderRadius: 24, padding: '2.5rem',
        }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.03em', marginBottom: '0.375rem', textAlign: 'center' }}>
            Welcome back
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '2.25rem', fontSize: '0.9375rem', textAlign: 'center' }}>
            Sign in to continue your learning journey
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
            <div>
              <label className="label">Email address</label>
              <div className="input-group">
                <Mail size={16} className="input-icon" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@university.edu" className="input" required style={{ background: 'rgba(255,255,255,0.8)' }} />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="input-group" style={{ position: 'relative' }}>
                <Lock size={16} className="input-icon" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" className="input" required
                  style={{ paddingRight: '2.75rem', background: 'rgba(255,255,255,0.8)' }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{
                  position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', transition: 'color 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.color = '#6366f1'}
                  onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', height: 48, fontSize: '1rem', borderRadius: 12, boxShadow: '0 4px 14px rgba(79,70,229,0.3)' }}>
              {loading
                ? <span style={{ width: 18, height: 18, borderRadius: '50%', border: '2.5px solid rgba(255,255,255,0.35)', borderTopColor: 'white', display: 'inline-block' }} className="animate-spin" />
                : <>Sign In <ArrowRight size={16} /></>
              }
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', margin: '1.75rem 0' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.06)' }} />
            <span style={{ padding: '0 0.75rem', color: '#9ca3af', fontSize: '0.8125rem' }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.06)' }} />
          </div>

          <p style={{ textAlign: 'center', fontSize: '0.9375rem', color: '#6b7280' }}>
            Don't have an account?{' '}
            <Link to="/auth/register" style={{ color: '#4f46e5', fontWeight: 600, textDecoration: 'none' }}>Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
