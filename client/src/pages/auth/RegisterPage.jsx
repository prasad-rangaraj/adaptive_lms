import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../lib/api';
import toast from 'react-hot-toast';
import {
  GraduationCap, User, Mail, Lock, ArrowRight,
  CheckCircle, Sparkles, Brain, Bot, Shield, BarChart3
} from 'lucide-react';

const roles = [
  {
    value: 'student', label: 'Student', emoji: '🎓',
    desc: 'Access courses, AI tutor & exams',
    color: '#4f46e5', bg: '#eef2ff', border: '#c7d2fe', activeBorder: '#6366f1',
    gradient: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
  },
  {
    value: 'teacher', label: 'Teacher', emoji: '👩‍🏫',
    desc: 'Create courses, grade & monitor',
    color: '#059669', bg: '#ecfdf5', border: '#bbf7d0', activeBorder: '#059669',
    gradient: 'linear-gradient(135deg, #059669, #0d9488)',
  },
  {
    value: 'tenant_admin', label: 'Admin / HR', emoji: '🏢',
    desc: 'Manage your organization',
    color: '#d97706', bg: '#fffbeb', border: '#fde68a', activeBorder: '#d97706',
    gradient: 'linear-gradient(135deg, #d97706, #ef4444)',
  },
];

const perks = [
  { icon: Brain, text: 'AI analyses your learning style', color: '#4f46e5', bg: '#eef2ff' },
  { icon: Bot, text: 'Personal GPT-4o tutor 24/7', color: '#7c3aed', bg: '#f5f3ff' },
  { icon: Shield, text: 'Secure exam proctoring', color: '#0369a1', bg: '#eff6ff' },
  { icon: BarChart3, text: 'Detailed progress analytics', color: '#059669', bg: '#ecfdf5' },
];

export default function RegisterPage() {
  const [form, setForm] = useState({ full_name: '', email: '', password: '', role: 'student' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const selectedRole = roles.find(r => r.value === form.role);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.register(form);
      toast.success('Account created! Please sign in.');
      navigate('/auth/login');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '0.6875rem 1rem',
    border: '1.5px solid #e5e7eb', borderRadius: 12,
    background: '#ffffff', color: '#111827', fontSize: '0.875rem',
    fontFamily: 'var(--font-body)', outline: 'none', transition: 'all 0.18s',
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#ffffff' }}>

      {/* ── Left — Form ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 2rem', position: 'relative' }}>
        {/* Pastel background glow */}
        <div style={{
          position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)',
          width: 400, height: 400, borderRadius: '50%',
          background: `radial-gradient(circle, ${selectedRole?.bg || '#eef2ff'}, transparent 70%)`,
          pointerEvents: 'none', transition: 'background 0.4s', filter: 'blur(40px)',
        }} />

        <div style={{ width: '100%', maxWidth: 480, position: 'relative' }} className="animate-fade-up">
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '2.5rem' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: selectedRole?.gradient || 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 4px 14px ${selectedRole?.color || '#4f46e5'}35`,
              transition: 'all 0.35s',
            }}>
              <GraduationCap size={19} color="white" />
            </div>
            <span style={{ fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>AdaptiveLMS</span>
          </div>

          <h2 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.03em', marginBottom: '0.375rem' }}>
            Create your account
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '2rem', fontSize: '0.9375rem' }}>
            Start your adaptive learning journey today — free forever.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Role Selection */}
            <div>
              <label className="label">I am a...</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {roles.map(({ value, label, emoji, desc, color, bg, border, activeBorder }) => {
                  const isActive = form.role === value;
                  return (
                    <button key={value} type="button" onClick={() => setForm({ ...form, role: value })} style={{
                      padding: '0.875rem 0.5rem', borderRadius: 14, cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
                      border: `2px solid ${isActive ? activeBorder : '#e5e7eb'}`,
                      background: isActive ? bg : '#ffffff',
                      boxShadow: isActive ? `0 4px 18px ${color}20` : '0 1px 3px rgba(0,0,0,0.06)',
                      transform: isActive ? 'translateY(-2px)' : 'none',
                    }}>
                      <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>{emoji}</div>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: isActive ? color : '#374151' }}>{label}</div>
                      <div style={{ fontSize: '0.6875rem', color: '#9ca3af', marginTop: 3, lineHeight: 1.3 }}>{desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="label">Full name</label>
              <div className="input-group">
                <User size={16} className="input-icon" />
                <input name="full_name" value={form.full_name} onChange={handleChange} placeholder="Your full name" className="input" required />
              </div>
            </div>

            <div>
              <label className="label">Email address</label>
              <div className="input-group">
                <Mail size={16} className="input-icon" />
                <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@university.edu" className="input" required />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="input-group">
                <Lock size={16} className="input-icon" />
                <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Min. 8 characters" className="input" required minLength={8} />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: '0.25rem', height: 48, fontSize: '1rem' }}>
              {loading
                ? <span style={{ width: 18, height: 18, borderRadius: '50%', border: '2.5px solid rgba(255,255,255,0.35)', borderTopColor: 'white', display: 'inline-block' }} className="animate-spin" />
                : <><CheckCircle size={16} /> Create Account <ArrowRight size={16} /></>
              }
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '0.9375rem', color: '#6b7280', marginTop: '1.5rem' }}>
            Already have an account?{' '}
            <Link to="/auth/login" style={{ color: '#4f46e5', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>

      {/* ── Right — Visual Showcase ── */}
      <div style={{
        width: '42%', background: 'linear-gradient(145deg, #fafbff 0%, #f3f4fd 50%, #faf3ff 100%)',
        padding: '3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center',
        borderLeft: '1px solid #e5e7eb', position: 'relative', overflow: 'hidden',
      }}>
        <div className="grid-mesh" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
        <div className="animate-blob-1" style={{
          position: 'absolute', top: -60, right: -40, width: 300, height: 300,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(238,242,255,0.9), transparent 70%)',
          filter: 'blur(50px)', pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}>
            Why choose <span className="text-gradient">AdaptiveLMS?</span>
          </h3>
          <p style={{ color: '#6b7280', fontSize: '0.9375rem', marginBottom: '2rem', lineHeight: 1.6 }}>
            The only LMS that learns how <em>you</em> learn.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: '2rem' }}>
            {perks.map(({ icon: Icon, text, color, bg }) => (
              <div key={text} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '0.875rem 1rem', borderRadius: 12,
                background: 'rgba(255,255,255,0.7)', border: '1px solid #f0f1f3',
                backdropFilter: 'blur(8px)',
              }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={16} color={color} />
                </div>
                <span style={{ color: '#374151', fontSize: '0.9375rem' }}>{text}</span>
              </div>
            ))}
          </div>

          {/* Mini preview card */}
          <div style={{
            background: 'rgba(255,255,255,0.8)', border: '1px solid #e5e7eb',
            borderRadius: 16, padding: '1.25rem', boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
          }}>
            <p style={{ fontWeight: 700, fontSize: '0.875rem', color: '#111827', marginBottom: '0.875rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={14} color="#4f46e5" /> Cognitive Profile Preview
            </p>
            {[['Focus Score', 78, '#6366f1'], ['Retention', 82, '#10b981'], ['Engagement', 85, '#f59e0b']].map(([label, val, color]) => (
              <div key={label} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: '0.8125rem', color: '#6b7280' }}>{label}</span>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color }}>{val}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${val}%`, background: color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
