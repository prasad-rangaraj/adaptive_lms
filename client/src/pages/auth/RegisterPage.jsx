import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../lib/api';
import toast from 'react-hot-toast';
import {
  GraduationCap, User, Mail, Lock, ArrowRight,
  CheckCircle, Sparkles
} from 'lucide-react';

const roles = [
  { value: 'student', label: 'Student', emoji: '🎓', desc: 'Access courses, AI tutor, and exams' },
  { value: 'teacher', label: 'Teacher', emoji: '👩‍🏫', desc: 'Create courses, grade, and monitor' },
  { value: 'tenant_admin', label: 'Admin / HR', emoji: '🏢', desc: 'Manage your organization' },
];

export default function RegisterPage() {
  const [form, setForm] = useState({ full_name: '', email: '', password: '', role: 'student' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

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

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#fafbff' }}>
      {/* ── Left — Form ── */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '3rem 2rem',
      }}>
        <div style={{ width: '100%', maxWidth: 460 }} className="animate-fade-up">
          {/* Logo */}
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
            Create your account
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '2rem', fontSize: '0.9375rem' }}>
            Start your adaptive learning journey today — free forever.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Full Name */}
            <div>
              <label className="label">Full name</label>
              <div className="input-group">
                <User size={16} className="input-icon" />
                <input name="full_name" value={form.full_name} onChange={handleChange} placeholder="Your full name" className="input" required />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="label">Email address</label>
              <div className="input-group">
                <Mail size={16} className="input-icon" />
                <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@university.edu" className="input" required />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="label">Password</label>
              <div className="input-group">
                <Lock size={16} className="input-icon" />
                <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Min. 8 characters" className="input" required minLength={8} />
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="label">I am a...</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {roles.map(({ value, label, emoji, desc }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm({ ...form, role: value })}
                    style={{
                      padding: '0.75rem 0.5rem',
                      borderRadius: 12,
                      border: `2px solid ${form.role === value ? '#6366f1' : '#e5e7eb'}`,
                      background: form.role === value ? '#eef2ff' : 'white',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.18s',
                    }}
                  >
                    <div style={{ fontSize: '1.375rem', marginBottom: 4 }}>{emoji}</div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: form.role === value ? '#4338ca' : '#374151' }}>{label}</div>
                    <div style={{ fontSize: '0.6875rem', color: '#9ca3af', marginTop: 2, lineHeight: 1.3 }}>{desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.25rem', height: 46 }}
            >
              {loading
                ? <span style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                : <>Create Account <ArrowRight size={16} /></>
              }
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '0.9375rem', color: '#6b7280', marginTop: '1.5rem' }}>
            Already have an account?{' '}
            <Link to="/auth/login" style={{ color: '#6366f1', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>

      {/* ── Right — Visual ── */}
      <div style={{
        width: '42%',
        background: 'linear-gradient(145deg, #f8f9fc, #f0f4ff)',
        padding: '3rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        borderLeft: '1px solid #f0f1f3',
        position: 'relative',
        overflow: 'hidden',
      }} className="hidden md:flex">
        <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, #e0e7ff, transparent 70%)' }} />

        {/* Cards preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, position: 'relative', zIndex: 1 }}>
          <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 16, padding: '1.25rem', boxShadow: '0 4px 16px rgb(0 0 0 / 0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={17} color="#6366f1" />
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: '0.875rem', color: '#111827' }}>AI Tutor Response</p>
                <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>GPT-4o · Just now</p>
              </div>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#374151', lineHeight: 1.6 }}>
              Great question! The mitochondria generates ATP through oxidative phosphorylation.
              Based on your last quiz score, I suggest reviewing Chapter 3...
            </p>
          </div>

          <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 16, padding: '1.25rem', boxShadow: '0 4px 16px rgb(0 0 0 / 0.06)' }}>
            <p style={{ fontWeight: 700, fontSize: '0.875rem', color: '#111827', marginBottom: 12 }}>Cognitive Profile</p>
            {[['Focus', 78, '#6366f1'], ['Retention', 82, '#10b981'], ['Engagement', 85, '#f59e0b']].map(([label, val, color]) => (
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

          <div style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 16, padding: '1.25rem', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <CheckCircle size={18} />
              <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>Assignment Evaluated</span>
            </div>
            <p style={{ fontSize: '0.875rem', opacity: 0.85 }}>Score: 88/100 · Grammar: 94% · Originality: 97%</p>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
