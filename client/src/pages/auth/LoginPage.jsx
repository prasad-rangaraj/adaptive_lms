import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import {
  GraduationCap, Mail, Lock, Eye, EyeOff,
  ArrowRight, Sparkles, Brain, Shield, Bot, CheckCircle, TrendingUp
} from 'lucide-react';

const highlights = [
  { icon: Brain, text: 'AI-powered cognitive profiling', color: '#4f46e5', bg: '#eef2ff' },
  { icon: Bot, text: 'GPT-4o tutoring on your materials', color: '#7c3aed', bg: '#f5f3ff' },
  { icon: Shield, text: 'Automated exam proctoring', color: '#0369a1', bg: '#eff6ff' },
  { icon: CheckCircle, text: 'Smart assignment evaluation', color: '#059669', bg: '#ecfdf5' },
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
    <div style={{ display: 'flex', minHeight: '100vh', background: '#ffffff' }}>

      {/* ── Left Panel — Branding ── */}
      <div style={{
        width: '46%',
        background: 'linear-gradient(145deg, #f8f9ff 0%, #f0f1fe 40%, #f3f0ff 100%)',
        display: 'flex', flexDirection: 'column', padding: '3rem',
        position: 'relative', overflow: 'hidden',
        borderRight: '1px solid #e5e7eb',
      }}>
        {/* Dot grid */}
        <div className="grid-mesh" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
        {/* Gradient blobs */}
        <div className="animate-blob-1" style={{
          position: 'absolute', top: -60, right: -40, width: 350, height: 350,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(238,242,255,0.9), transparent 70%)',
          filter: 'blur(50px)', pointerEvents: 'none',
        }} />
        <div className="animate-blob-2" style={{
          position: 'absolute', bottom: -80, left: -30, width: 300, height: 300,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,243,255,0.8), transparent 70%)',
          filter: 'blur(50px)', pointerEvents: 'none',
        }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative', zIndex: 1 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(99,102,241,0.3)',
          }}>
            <GraduationCap size={22} color="white" />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.25rem', color: '#111827', letterSpacing: '-0.02em' }}>
            AdaptiveLMS
          </span>
        </div>

        {/* Headline */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: '#eef2ff', border: '1px solid #c7d2fe',
            borderRadius: 999, padding: '5px 14px',
            color: '#4338ca', fontSize: '0.8125rem', fontWeight: 600,
            marginBottom: '1.5rem', width: 'fit-content',
          }}>
            <Sparkles size={12} /> AI-Driven Learning Platform
          </div>
          <h1 style={{
            fontSize: '2.75rem', fontWeight: 900,
            letterSpacing: '-0.04em', lineHeight: 1.08, marginBottom: '1.25rem', color: '#111827',
          }}>
            Learn Smarter,<br />
            <span className="text-gradient">Not Harder.</span>
          </h1>
          <p style={{ color: '#4b5563', fontSize: '1.0625rem', lineHeight: 1.7, marginBottom: '2.5rem' }}>
            Your AI tutor adapts to your unique cognitive profile and learns alongside you.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {highlights.map(({ icon: Icon, text, color, bg }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 10,
                  background: bg, border: `1px solid ${color}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Icon size={16} color={color} />
                </div>
                <span style={{ color: '#4b5563', fontSize: '0.9375rem', fontWeight: 500 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, position: 'relative', zIndex: 1 }}>
          {[
            { label: 'Active Learners', value: '50K+', sub: '+12% this month', icon: <TrendingUp size={11} color="#10b981" /> },
            { label: 'Satisfaction', value: '98%', sub: 'Trusted by 140+ institutions', icon: null },
          ].map(({ label, value, sub, icon }) => (
            <div key={label} style={{
              background: 'rgba(255,255,255,0.7)', border: '1px solid #e5e7eb',
              borderRadius: 14, padding: '1rem 1.125rem',
              backdropFilter: 'blur(12px)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}>
              <p style={{ fontSize: '0.6875rem', color: '#9ca3af', marginBottom: 2 }}>{label}</p>
              <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.03em' }}>{value}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                {icon}
                <span style={{ fontSize: '0.6875rem', color: '#9ca3af' }}>{sub}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Panel — Login Form ── */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '3rem 2rem', background: '#ffffff', position: 'relative',
      }}>
        <div style={{ width: '100%', maxWidth: 420 }} className="animate-fade-up">
          {/* Mobile logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '2.75rem' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(99,102,241,0.28)',
            }}>
              <GraduationCap size={19} color="white" />
            </div>
            <span style={{ fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>AdaptiveLMS</span>
          </div>

          <h2 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.03em', marginBottom: '0.375rem' }}>
            Welcome back
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '2.25rem', fontSize: '0.9375rem' }}>
            Sign in to continue your learning journey
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
            <div>
              <label className="label">Email address</label>
              <div className="input-group">
                <Mail size={16} className="input-icon" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@university.edu" className="input" required />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="input-group" style={{ position: 'relative' }}>
                <Lock size={16} className="input-icon" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" className="input" style={{ paddingRight: '2.75rem' }} required
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

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: '0.375rem', height: 48, fontSize: '1rem' }}>
              {loading
                ? <span style={{ width: 18, height: 18, borderRadius: '50%', border: '2.5px solid rgba(255,255,255,0.35)', borderTopColor: 'white', display: 'inline-block' }} className="animate-spin" />
                : <>Sign In <ArrowRight size={16} /></>
              }
            </button>
          </form>

          <div className="divider-text" style={{ margin: '1.75rem 0' }}>or</div>

          <p style={{ textAlign: 'center', fontSize: '0.9375rem', color: '#6b7280' }}>
            Don't have an account?{' '}
            <Link to="/auth/register" style={{ color: '#4f46e5', fontWeight: 600 }}>Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
