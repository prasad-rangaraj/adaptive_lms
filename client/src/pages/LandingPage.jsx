import { Link } from 'react-router-dom';
import {
  GraduationCap, Brain, Shield, Bot, Zap, Users,
  ArrowRight, CheckCircle, Star, TrendingUp,
  BookOpen, Award, BarChart3, Sparkles
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'Cognitive Profiling',
    desc: 'AI analyses learning style, focus scores, and retention patterns to build a unique learning profile for every student.',
    color: '#6366f1',
    bg: '#eef2ff',
  },
  {
    icon: Bot,
    title: 'AI Tutor (RAG)',
    desc: 'Context-aware GPT-4o tutor trained directly on your uploaded course materials — not generic internet data.',
    color: '#8b5cf6',
    bg: '#f5f3ff',
  },
  {
    icon: Shield,
    title: 'Automated Proctoring',
    desc: 'Computer vision exam monitoring with real-time teacher alerts, risk scoring, and full violation reports.',
    color: '#0ea5e9',
    bg: '#f0f9ff',
  },
  {
    icon: Zap,
    title: 'Adaptive Engine',
    desc: 'Content difficulty adapts in real-time. Strong students unlock advanced challenges; weak students get hints and support.',
    color: '#f59e0b',
    bg: '#fffbeb',
  },
  {
    icon: Users,
    title: 'Multi-Tenant SaaS',
    desc: 'Isolated, white-labeled workspaces for universities, corporates, and institutes — all on one platform.',
    color: '#10b981',
    bg: '#f0fdf4',
  },
  {
    icon: BarChart3,
    title: 'Assignment AI',
    desc: 'Automated grading with grammar, plagiarism, AI-detection, and logic analysis. Teachers review, not grade.',
    color: '#ef4444',
    bg: '#fef2f2',
  },
];

const stats = [
  { value: '50K+', label: 'Active Students' },
  { value: '98%', label: 'Satisfaction Rate' },
  { value: '3.2x', label: 'Learning Efficiency' },
  { value: '140+', label: 'Institutions' },
];

const testimonials = [
  {
    name: 'Dr. Priya Sharma',
    role: 'Head of EdTech, Sunrise University',
    text: 'AdaptiveLMS transformed how we teach. Our dropout rate dropped by 40% in one semester.',
    avatar: 'P',
    color: '#6366f1',
  },
  {
    name: 'Arjun Mehta',
    role: 'Student, Computer Science',
    text: 'The AI tutor feels like a personal mentor who knows exactly what I\'m struggling with.',
    avatar: 'A',
    color: '#10b981',
  },
  {
    name: 'Sarah Al-Hassan',
    role: 'L&D Manager, TechCorp',
    text: 'Our corporate training completion rates went from 62% to 94%. Simply incredible.',
    avatar: 'S',
    color: '#f59e0b',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ── Navbar ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #f0f1f3',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem', display: 'flex', alignItems: 'center', height: 64 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgb(99 102 241 / 0.3)',
            }}>
              <GraduationCap size={20} color="white" />
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.125rem', color: '#111827', letterSpacing: '-0.02em' }}>
              AdaptiveLMS
            </span>
          </div>

          {/* Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link to="/auth/login" className="btn btn-ghost btn-sm">Sign In</Link>
            <Link to="/auth/register" className="btn btn-primary btn-sm" style={{ gap: 6 }}>
              Get Started Free <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="bg-hero" style={{ padding: '6rem 2rem 5rem', overflow: 'hidden', position: 'relative' }}>
        {/* Animated blobs */}
        <div className="animate-blob-1" style={{
          position: 'absolute', top: -80, left: -80, width: 500, height: 500,
          borderRadius: '50%', background: 'radial-gradient(circle, #e0e7ff 0%, transparent 70%)',
          filter: 'blur(40px)', opacity: 0.6, pointerEvents: 'none',
        }} />
        <div className="animate-blob-2" style={{
          position: 'absolute', bottom: -100, right: -80, width: 500, height: 500,
          borderRadius: '50%', background: 'radial-gradient(circle, #f3e8ff 0%, transparent 70%)',
          filter: 'blur(40px)', opacity: 0.5, pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          {/* Pill badge */}
          <div className="animate-fade-up" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 16px', borderRadius: 999,
            background: '#eef2ff', border: '1px solid #c7d2fe',
            color: '#4338ca', fontSize: '0.8125rem', fontWeight: 600,
            marginBottom: '1.75rem',
          }}>
            <Sparkles size={13} />
            Powered by GPT-4o + pgvector RAG
          </div>

          <h1 className="animate-fade-up delay-100" style={{
            fontSize: 'clamp(2.5rem, 6vw, 4rem)',
            fontWeight: 900,
            color: '#111827',
            letterSpacing: '-0.04em',
            lineHeight: 1.1,
            marginBottom: '1.5rem',
          }}>
            The Future of<br />
            <span className="text-gradient">Personalized Learning</span>
          </h1>

          <p className="animate-fade-up delay-200" style={{
            fontSize: '1.1875rem',
            color: '#6b7280',
            maxWidth: 580,
            margin: '0 auto 2.5rem',
            lineHeight: 1.7,
          }}>
            An enterprise LMS that uses AI to understand how each student thinks,
            adapts content in real-time, and ensures exam integrity through automated proctoring.
          </p>

          <div className="animate-fade-up delay-300" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/auth/register" className="btn btn-primary btn-xl" style={{ gap: 8 }}>
              Start for Free <ArrowRight size={18} />
            </Link>
            <Link to="/auth/login" className="btn btn-secondary btn-xl">
              Sign In
            </Link>
          </div>

          {/* Trust line */}
          <div className="animate-fade-up delay-400" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: '2rem' }}>
            {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />)}
            <span style={{ fontSize: '0.875rem', color: '#6b7280', marginLeft: 4 }}>Trusted by 50,000+ learners</span>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section style={{ borderTop: '1px solid #f0f1f3', borderBottom: '1px solid #f0f1f3', background: '#fafbff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
          {stats.map(({ value, label }) => (
            <div key={label} style={{ textAlign: 'center', padding: '1rem' }}>
              <p style={{ fontSize: '2rem', fontWeight: 900, color: '#111827', letterSpacing: '-0.03em' }} className="text-gradient">{value}</p>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: 4 }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: '5rem 2rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div className="badge badge-brand" style={{ marginBottom: '1rem' }}>
              <Zap size={11} /> Full Feature Suite
            </div>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.03em' }}>
              Everything to learn <span className="text-gradient">smarter</span>
            </h2>
            <p style={{ color: '#6b7280', fontSize: '1.0625rem', marginTop: '0.75rem', maxWidth: 500, margin: '0.75rem auto 0' }}>
              Built with enterprise AI technology for modern education and corporate training.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {features.map(({ icon: Icon, title, desc, color, bg }, i) => (
              <div key={title} className="feature-card animate-fade-up" style={{ animationDelay: `${i * 0.08}s`, opacity: 0 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}>
                  <Icon size={24} color={color} />
                </div>
                <h3 style={{ fontWeight: 700, color: '#111827', marginBottom: '0.5rem', fontSize: '1.0625rem' }}>{title}</h3>
                <p style={{ color: '#6b7280', fontSize: '0.9375rem', lineHeight: 1.65 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section style={{ padding: '5rem 2rem', background: '#fafbff', borderTop: '1px solid #f0f1f3' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.03em' }}>
              Loved by learners & institutions
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {testimonials.map(({ name, role, text, avatar, color }) => (
              <div key={name} className="card" style={{ padding: '1.75rem' }}>
                <div style={{ display: 'flex', gap: 6, marginBottom: '1rem' }}>
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />)}
                </div>
                <p style={{ color: '#374151', fontSize: '0.9375rem', lineHeight: 1.65, marginBottom: '1.25rem' }}>"{text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="avatar" style={{ width: 38, height: 38, fontSize: '0.875rem', background: `linear-gradient(135deg, ${color}, ${color}99)` }}>
                    {avatar}
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>{name}</p>
                    <p style={{ color: '#9ca3af', fontSize: '0.8125rem' }}>{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '5rem 2rem' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
          <div className="card-brand" style={{ padding: '3.5rem 2rem' }}>
            <Award size={40} color="rgba(255,255,255,0.9)" style={{ margin: '0 auto 1rem' }} />
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'white', marginBottom: '0.75rem', letterSpacing: '-0.03em' }}>
              Ready to transform your learning?
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '2rem', fontSize: '1rem' }}>
              Join 50,000+ students and institutions already using AdaptiveLMS.
            </p>
            <Link to="/auth/register" className="btn btn-xl" style={{
              background: 'white', color: '#4338ca', gap: 8,
              boxShadow: '0 8px 25px rgb(0 0 0 / 0.15)',
            }}>
              Get Started Free <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid #f0f1f3', padding: '2rem', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <GraduationCap size={14} color="white" />
          </div>
          <span style={{ fontWeight: 700, color: '#111827' }}>AdaptiveLMS</span>
        </div>
        <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>© 2026 AdaptiveLMS. Built with FastAPI, React & OpenAI.</p>
      </footer>
    </div>
  );
}
