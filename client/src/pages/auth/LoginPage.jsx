import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import {
  GraduationCap, Mail, Lock, Eye, EyeOff,
  ArrowRight, Sparkles, Brain, Shield, Bot, CheckCircle
} from 'lucide-react';

const highlights = [
  { icon: Brain, text: 'AI-powered cognitive profiling' },
  { icon: Bot, text: 'GPT-4o tutoring on your materials' },
  { icon: Shield, text: 'Automated exam proctoring' },
  { icon: CheckCircle, text: 'Smart assignment evaluation' },
];

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
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* ── Left Panel — Branding ── */}
      <div style={{
        width: '45%',
        background: 'linear-gradient(145deg, #4338ca 0%, #6366f1 50%, #8b5cf6 100%)',
        display: 'flex',
        flexDirection: 'column',
        padding: '3rem',
        position: 'relative',
        overflow: 'hidden',
      }} className="hidden md:flex">
        {/* Decorative circles */}
        <div style={{
          position: 'absolute', top: -120, right: -80,
          width: 400, height: 400, borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)',
        }} />
        <div style={{
          position: 'absolute', bottom: -100, left: -60,
          width: 350, height: 350, borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
        }} />
        <div style={{
          position: 'absolute', top: '40%', left: '55%',
          width: 200, height: 200, borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
        }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative', zIndex: 1 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid rgba(255,255,255,0.3)',
          }}>
            <GraduationCap size={22} color="white" />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.25rem', color: 'white', letterSpacing: '-0.02em' }}>
            AdaptiveLMS
          </span>
        </div>

        {/* Headline */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.25)',
            borderRadius: 999, padding: '5px 14px',
            color: 'white', fontSize: '0.8125rem', fontWeight: 600,
            marginBottom: '1.5rem', width: 'fit-content',
          }}>
            <Sparkles size={12} /> AI-Driven Learning Platform
          </div>
          <h1 style={{
            fontSize: '2.5rem', fontWeight: 900, color: 'white',
            letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: '1.25rem',
          }}>
            Learn Smarter,<br />Not Harder.
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1.0625rem', lineHeight: 1.7, marginBottom: '2.5rem' }}>
            Your AI tutor adapts to your unique cognitive profile and learns alongside you.
          </p>

          {/* Feature pills */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {highlights.map(({ icon: Icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 10,
                  background: 'rgba(255,255,255,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1px solid rgba(255,255,255,0.2)',
                  flexShrink: 0,
                }}>
                  <Icon size={16} color="white" />
                </div>
                <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9375rem', fontWeight: 500 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8125rem' }}>
            Trusted by 140+ institutions worldwide
          </p>
        </div>
      </div>

      {/* ── Right Panel — Login Form ── */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 2rem',
        background: '#fafbff',
      }}>
        <div style={{ width: '100%', maxWidth: 420 }} className="animate-fade-up">
          {/* Mobile logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '2.5rem' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <GraduationCap size={19} color="white" />
            </div>
            <span style={{ fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>AdaptiveLMS</span>
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.03em', marginBottom: '0.375rem' }}>
            Welcome back
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '2rem', fontSize: '0.9375rem' }}>
            Sign in to continue your learning journey
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
            {/* Email */}
            <div>
              <label className="label">Email address</label>
              <div className="input-group">
                <Mail size={16} className="input-icon" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@university.edu"
                  className="input"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="label">Password</label>
              <div className="input-group" style={{ position: 'relative' }}>
                <Lock size={16} className="input-icon" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input"
                  style={{ paddingRight: '2.75rem' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af',
                    display: 'flex', transition: 'color 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#6366f1'}
                  onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.375rem', height: 46 }}
            >
              {loading ? (
                <span style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
              ) : (
                <>Sign In <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <div className="divider-text" style={{ margin: '1.5rem 0' }}>or</div>

          <p style={{ textAlign: 'center', fontSize: '0.9375rem', color: '#6b7280' }}>
            Don't have an account?{' '}
            <Link to="/auth/register" style={{ color: '#6366f1', fontWeight: 600 }}>
              Create one free
            </Link>
          </p>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
