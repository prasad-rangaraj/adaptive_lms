import { Link } from 'react-router-dom';
import {
  GraduationCap, Brain, Shield, Bot, Zap, Users,
  ArrowRight, CheckCircle, Star, TrendingUp,
  BookOpen, Award, BarChart3, Sparkles, Globe, MessageCircle, Link2
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'Cognitive Profiling',
    desc: 'AI analyses learning style, focus scores, and retention patterns to build a unique profile for every student.',
    color: '#4f46e5', bg: '#eef2ff', border: '#c7d2fe', glow: 'rgba(99,102,241,0.12)',
  },
  {
    icon: Bot,
    title: 'AI Tutor (RAG)',
    desc: 'Context-aware GPT-4o tutor trained directly on your uploaded course materials — not generic internet data.',
    color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe', glow: 'rgba(124,58,237,0.12)',
  },
  {
    icon: Shield,
    title: 'Automated Proctoring',
    desc: 'Computer vision exam monitoring with real-time alerts, risk scoring, and full violation reports.',
    color: '#0369a1', bg: '#eff6ff', border: '#bfdbfe', glow: 'rgba(3,105,161,0.1)',
  },
  {
    icon: Zap,
    title: 'Adaptive Engine',
    desc: 'Content difficulty adapts in real-time. Strong students unlock challenges; struggling students get guided support.',
    color: '#d97706', bg: '#fffbeb', border: '#fde68a', glow: 'rgba(217,119,6,0.1)',
  },
  {
    icon: Users,
    title: 'Multi-Tenant SaaS',
    desc: 'Isolated, white-labeled workspaces for universities, corporates, and institutes — all on one platform.',
    color: '#059669', bg: '#ecfdf5', border: '#bbf7d0', glow: 'rgba(5,150,105,0.1)',
  },
  {
    icon: BarChart3,
    title: 'Assignment AI',
    desc: 'Automated grading with grammar, plagiarism, AI-detection, and logic analysis. Teachers review, not grade.',
    color: '#be185d', bg: '#fdf2f8', border: '#fbcfe8', glow: 'rgba(190,24,93,0.1)',
  },
];

const stats = [
  { value: '50K+', label: 'Active Students', icon: '🎓' },
  { value: '98%',  label: 'Satisfaction Rate', icon: '⭐' },
  { value: '3.2x', label: 'Learning Efficiency', icon: '⚡' },
  { value: '140+', label: 'Institutions', icon: '🏛️' },
];

const testimonials = [
  {
    name: 'Dr. Priya Sharma',
    role: 'Head of EdTech, Sunrise University',
    text: 'AdaptiveLMS transformed how we teach. Our dropout rate dropped by 40% in one semester. Absolutely revolutionary.',
    avatar: 'P', gradient: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
  },
  {
    name: 'Arjun Mehta',
    role: 'Student, Computer Science',
    text: "The AI tutor feels like a personal mentor who knows exactly what I'm struggling with. It's like having a professor 24/7.",
    avatar: 'A', gradient: 'linear-gradient(135deg, #059669, #0d9488)',
  },
  {
    name: 'Sarah Al-Hassan',
    role: 'L&D Manager, TechCorp',
    text: 'Our corporate training completion rates went from 62% to 94%. The adaptive engine is simply unmatched.',
    avatar: 'S', gradient: 'linear-gradient(135deg, #d97706, #ef4444)',
  },
];

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', color: '#111827' }}>

      {/* Dot grid background */}
      <div className="grid-mesh" style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.6 }} />

      {/* ── Navbar ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid #f0f1f3',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem', display: 'flex', alignItems: 'center', height: 64 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
            }}>
              <GraduationCap size={20} color="white" />
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.125rem', color: '#111827', letterSpacing: '-0.02em' }}>
              AdaptiveLMS
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link to="/auth/login" className="btn btn-ghost btn-sm">Sign In</Link>
            <Link to="/auth/register" className="btn btn-primary btn-sm" style={{ gap: 6 }}>
              Get Started <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ── Hero ── */}
        <section style={{ padding: '7rem 2rem 6rem', position: 'relative', overflow: 'hidden' }}>
          {/* Soft gradient blobs */}
          <div className="animate-blob-1" style={{
            position: 'absolute', top: -100, left: -60, width: 550, height: 550,
            borderRadius: '50%', background: 'radial-gradient(circle, rgba(238,242,255,0.9) 0%, transparent 70%)',
            filter: 'blur(60px)', pointerEvents: 'none',
          }} />
          <div className="animate-blob-2" style={{
            position: 'absolute', bottom: -80, right: -60, width: 450, height: 450,
            borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,243,255,0.8) 0%, transparent 70%)',
            filter: 'blur(60px)', pointerEvents: 'none',
          }} />

          <div style={{ maxWidth: 820, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
            <div className="animate-fade-up" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 18px', borderRadius: 999,
              background: '#eef2ff', border: '1px solid #c7d2fe',
              color: '#4338ca', fontSize: '0.8125rem', fontWeight: 600,
              marginBottom: '2rem',
            }}>
              <Sparkles size={13} />
              Powered by GPT-4o + pgvector RAG
            </div>

            <h1 className="animate-fade-up delay-100" style={{
              fontSize: 'clamp(2.75rem, 6.5vw, 4.5rem)',
              fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.08, marginBottom: '1.5rem',
            }}>
              The Future of<br />
              <span className="text-gradient">Personalized Learning</span>
            </h1>

            <p className="animate-fade-up delay-200" style={{
              fontSize: '1.1875rem', color: '#4b5563',
              maxWidth: 560, margin: '0 auto 2.75rem', lineHeight: 1.7,
            }}>
              An enterprise LMS that uses AI to understand how each student thinks,
              adapts content in real-time, and ensures exam integrity through automated proctoring.
            </p>

            <div className="animate-fade-up delay-300" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/auth/register" className="btn btn-primary btn-xl" style={{ gap: 8 }}>
                Start for Free <ArrowRight size={18} />
              </Link>
              <Link to="/auth/login" className="btn btn-secondary btn-xl">Sign In</Link>
            </div>

            <div className="animate-fade-up delay-400" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: '2.25rem' }}>
              {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />)}
              <span style={{ fontSize: '0.875rem', color: '#6b7280', marginLeft: 6 }}>Trusted by 50,000+ learners worldwide</span>
            </div>
          </div>
        </section>

        {/* ── Stats Bar ── */}
        <section style={{ borderTop: '1px solid #f0f1f3', borderBottom: '1px solid #f0f1f3', background: '#fafbff' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2rem', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {stats.map(({ value, label, icon }, i) => (
              <div key={label} style={{
                textAlign: 'center', padding: '2rem 1rem',
                borderRight: i < 3 ? '1px solid #f0f1f3' : 'none',
              }}>
                <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>{icon}</div>
                <p style={{ fontSize: '2.25rem', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1 }} className="text-gradient">{value}</p>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: 6 }}>{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Features ── */}
        <section style={{ padding: '6rem 2rem', background: '#ffffff' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <div className="badge badge-brand" style={{ marginBottom: '1.25rem', fontSize: '0.75rem' }}>
                <Zap size={11} /> Full Feature Suite
              </div>
              <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '1rem' }}>
                Everything to learn <span className="text-gradient">smarter</span>
              </h2>
              <p style={{ color: '#4b5563', fontSize: '1.0625rem', maxWidth: 500, margin: '0 auto', lineHeight: 1.7 }}>
                Built with enterprise AI technology for modern education and corporate training.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {features.map(({ icon: Icon, title, desc, color, bg, border, glow }, i) => (
                <div key={title} className="feature-card animate-fade-up" style={{ animationDelay: `${i * 0.08}s` }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 14,
                    background: bg, border: `1px solid ${border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '1.25rem',
                    boxShadow: `0 4px 16px ${glow}`,
                  }}>
                    <Icon size={24} color={color} />
                  </div>
                  <h3 style={{ fontWeight: 700, color: '#111827', marginBottom: '0.625rem', fontSize: '1.0625rem' }}>{title}</h3>
                  <p style={{ color: '#6b7280', fontSize: '0.9375rem', lineHeight: 1.65 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section style={{ padding: '5rem 2rem', background: '#fafbff', borderTop: '1px solid #f0f1f3' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
              <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>
                Loved by learners & institutions
              </h2>
              <p style={{ color: '#6b7280' }}>Join thousands of educators and students already transforming learning.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
              {testimonials.map(({ name, role, text, avatar, gradient }) => (
                <div key={name} className="card" style={{ padding: '1.75rem' }}>
                  <div style={{ display: 'flex', gap: 4, marginBottom: '1rem' }}>
                    {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />)}
                  </div>
                  <p style={{ color: '#4b5563', fontSize: '0.9375rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>"{text}"</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="avatar" style={{ width: 40, height: 40, fontSize: '0.875rem', background: gradient }}>
                      {avatar}
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, color: '#111827', fontSize: '0.875rem' }}>{name}</p>
                      <p style={{ color: '#9ca3af', fontSize: '0.8125rem' }}>{role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section style={{ padding: '6rem 2rem', background: '#ffffff' }}>
          <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
            <div className="card-brand" style={{ padding: '4rem 2.5rem' }}>
              <div style={{
                width: 64, height: 64, borderRadius: 18,
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.5rem',
              }}>
                <Award size={32} color="white" />
              </div>
              <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontWeight: 800, color: 'white', marginBottom: '0.875rem', letterSpacing: '-0.03em' }}>
                Ready to transform your learning?
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '2.25rem', fontSize: '1.0625rem', lineHeight: 1.6 }}>
                Join 50,000+ students and institutions already using AdaptiveLMS.
              </p>
              <Link to="/auth/register" className="btn btn-xl" style={{
                background: 'white', color: '#4338ca', gap: 8, fontWeight: 700,
                boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
              }}>
                Get Started Free <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer style={{ borderTop: '1px solid #f0f1f3', padding: '2.5rem 2rem', background: '#fafbff' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <GraduationCap size={15} color="white" />
              </div>
              <span style={{ fontWeight: 700, color: '#111827', fontSize: '0.9375rem' }}>AdaptiveLMS</span>
            </div>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>© 2026 AdaptiveLMS. Built with FastAPI, React & OpenAI.</p>
            <div style={{ display: 'flex', gap: 8 }}>
              {[Globe, MessageCircle, Link2].map((Icon, i) => (
                <button key={i} className="btn btn-ghost btn-icon btn-sm">
                  <Icon size={16} />
                </button>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
