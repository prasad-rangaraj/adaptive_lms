import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Brain, Shield, Bot, Zap, Users, ArrowRight, Star,
  BarChart3, Sparkles, Award, CheckCircle,
  BookOpen, FlaskConical, ClipboardCheck, TrendingUp,
  ChevronDown, Mail,
  Cpu, Layers, MessageSquare, Play,
  GraduationCap, Building2, UserCheck, Infinity,
  Share2, GitBranch, Globe, Link2, ExternalLink,
} from 'lucide-react';
import AnimeBackground from '../components/ui/AnimeBackground';
import logoUrl from '../assets/logo.png';

// ─── Data ────────────────────────────────────────────────────────────────────

const features = [
  {
    icon: Brain, title: 'Cognitive Profiling',
    desc: 'AI builds a unique cognitive map for every student — tracking focus, retention, engagement, and learning speed in real-time.',
    color: '#4f46e5', bg: '#eef2ff', border: '#c7d2fe', glow: 'rgba(99,102,241,0.12)',
  },
  {
    icon: Bot, title: 'AI Tutor (RAG)',
    desc: 'GPT-4o tutor trained on your course materials via pgvector semantic search. Not generic — hyper-contextual to your syllabus.',
    color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe', glow: 'rgba(124,58,237,0.12)',
  },
  {
    icon: Shield, title: 'Automated Proctoring',
    desc: 'TensorFlow.js + MediaPipe detect face absence, phone usage, tab switching, and background noise. Real-time WebSocket alerts.',
    color: '#0369a1', bg: '#eff6ff', border: '#bfdbfe', glow: 'rgba(3,105,161,0.1)',
  },
  {
    icon: Zap, title: 'Adaptive Engine',
    desc: 'Content difficulty adjusts dynamically. High scorers unlock advanced tracks; at-risk students receive targeted support instantly.',
    color: '#d97706', bg: '#fffbeb', border: '#fde68a', glow: 'rgba(217,119,6,0.1)',
  },
  {
    icon: Users, title: 'Multi-Tenant SaaS',
    desc: 'Fully isolated, white-labeled workspaces for universities, corporates, and institutes on one global platform.',
    color: '#059669', bg: '#ecfdf5', border: '#bbf7d0', glow: 'rgba(5,150,105,0.1)',
  },
  {
    icon: BarChart3, title: 'AI Assignment Grading',
    desc: 'Auto-grades with grammar, plagiarism, AI-detection, and logic analysis. Teachers focus on teaching, not grading.',
    color: '#be185d', bg: '#fdf2f8', border: '#fbcfe8', glow: 'rgba(190,24,93,0.1)',
  },
];

const steps = [
  {
    num: '01', icon: Building2, title: 'Set Up Your Workspace',
    desc: 'Create a multi-tenant workspace for your institution in minutes. Upload your branding, invite admins, and configure your learning environment.',
    color: '#4f46e5',
  },
  {
    num: '02', icon: BookOpen, title: 'Upload Course Materials',
    desc: 'Upload PDFs, videos, and documents. Our AI automatically indexes them into vector embeddings so the AI Tutor can answer student questions with pinpoint accuracy.',
    color: '#7c3aed',
  },
  {
    num: '03', icon: UserCheck, title: 'Enroll Students',
    desc: 'Students join, complete an AI cognitive assessment, and receive a personalized learning track — basic, standard, or advanced — within minutes.',
    color: '#0369a1',
  },
  {
    num: '04', icon: TrendingUp, title: 'Watch AI Adapt in Real-Time',
    desc: 'As students learn, the AI continuously updates their cognitive profile and adjusts content difficulty, scheduling, and recommendations automatically.',
    color: '#059669',
  },
];

const plans = [
  {
    name: 'Starter', price: '₹0', period: 'Free forever',
    desc: 'Perfect for individual teachers or small tutoring setups.',
    color: '#6b7280', gradient: 'linear-gradient(135deg, #f9fafb, #f3f4f6)',
    features: ['Up to 50 students', 'Basic AI Tutor', '2 courses', 'Standard analytics', 'Email support'],
    cta: 'Get Started Free', ctaStyle: { background: '#111827', color: 'white' },
  },
  {
    name: 'Institute', price: '₹4,999', period: '/month',
    desc: 'For colleges, schools, and coaching centres.',
    color: '#4f46e5', gradient: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    features: ['Up to 2,000 students', 'Full RAG AI Tutor', 'Unlimited courses', 'Cognitive profiling', 'Exam proctoring', 'AI grading', 'Priority support'],
    cta: 'Start 14-day Trial', ctaStyle: { background: 'white', color: '#4338ca' },
    popular: true,
  },
  {
    name: 'Enterprise', price: 'Custom', period: 'pricing',
    desc: 'For universities, corporates, and large-scale deployments.',
    color: '#d97706', gradient: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
    features: ['Unlimited students', 'Dedicated infrastructure', 'White-labeling', 'Custom integrations', 'SLA guarantee', 'Onboarding support', 'Audit logs'],
    cta: 'Contact Sales', ctaStyle: { background: '#111827', color: 'white' },
  },
];

const faqs = [
  { q: 'How does the AI Tutor actually work?', a: 'When a student asks a question, we embed it using OpenAI\'s text-embedding-3-small model and perform cosine-distance search in PostgreSQL using pgvector. The top-5 matching chunks from the course material are injected into GPT-4o\'s context as a system prompt, producing highly accurate, course-specific answers.' },
  { q: 'Is the proctoring invasive?', a: 'No. Proctoring runs entirely in the browser using TensorFlow.js and MediaPipe — no data is sent to any third-party service. Only violation events (e.g., "face not detected") are logged, not video recordings. Students are informed and must consent before any monitored exam begins.' },
  { q: 'How is multi-tenancy enforced?', a: 'Every database query is scoped by tenant_id at the data layer. Each institution\'s data — students, courses, embeddings, exams — is fully isolated. White-labeling lets institutions use their own domain, logo, and colors.' },
  { q: 'Can we integrate with our existing LMS?', a: 'Yes. We expose a REST API built with FastAPI. Common integrations include SSO via OAuth2, LTI for existing LMS platforms (Moodle, Canvas), and CSV/Excel bulk student imports. Enterprise plans include custom integration support.' },
  { q: 'What languages and subjects does the AI support?', a: 'The AI Tutor supports any subject and language that GPT-4o supports — effectively multilingual. The cognitive profiling and adaptive engine work with any structured course content regardless of domain.' },
];

const stats = [
  { value: '50K+', label: 'Active Students', icon: '🎓' },
  { value: '98%',  label: 'Satisfaction Rate', icon: '⭐' },
  { value: '3.2x', label: 'Learning Efficiency', icon: '⚡' },
  { value: '140+', label: 'Institutions', icon: '🏛️' },
];

const testimonials = [
  {
    name: 'Dr. Priya Sharma', role: 'Head of EdTech, Sunrise University',
    text: 'AdaptiveLMS transformed how we teach. Our dropout rate dropped by 40% in one semester. The cognitive profiling alone is worth the subscription.',
    avatar: 'P', gradient: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
  },
  {
    name: 'Arjun Mehta', role: 'Student, Computer Science',
    text: "The AI tutor knows my gaps better than I do. It's like having a professor available 24/7 who has read every page of every textbook for my course.",
    avatar: 'A', gradient: 'linear-gradient(135deg, #059669, #0d9488)',
  },
  {
    name: 'Sarah Al-Hassan', role: 'L&D Manager, TechCorp',
    text: 'Corporate training completion rates went from 62% to 94%. The adaptive difficulty keeps employees engaged, not bored or overwhelmed.',
    avatar: 'S', gradient: 'linear-gradient(135deg, #d97706, #ef4444)',
  },
];

const footerLinks = {
  Product:   ['Features', 'How it Works', 'Security', 'Changelog'],
  Solutions: ['Universities', 'Corporate Training', 'Coaching Centres', 'K-12 Schools'],
  Developers:['API Docs', 'REST Reference', 'Webhooks', 'LTI Integration', 'SDKs'],
  Company:   ['About Us', 'Blog', 'Careers', 'Privacy Policy', 'Terms of Service'],
};

// Nav icon links with tooltips
const NAV_ICONS = [
  { href: '#features',      icon: Cpu,           label: 'Features' },
  { href: '#how-it-works',  icon: Layers,        label: 'How it Works' },

  { href: '#testimonials',  icon: MessageSquare, label: 'Testimonials' },
  { href: '#faq',           icon: FlaskConical,  label: 'FAQ' },
];

// ─── FAQ Item ─────────────────────────────────────────────────────────────────
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      onClick={() => setOpen(o => !o)}
      style={{
        borderRadius: 16, cursor: 'pointer',
        background: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.6)',
        padding: '1.5rem 1.75rem',
        boxShadow: open ? '0 8px 32px rgba(99,102,241,0.08)' : '0 2px 12px rgba(0,0,0,0.04)',
        transition: 'all 0.25s ease',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
        <p style={{ fontWeight: 700, color: '#111827', fontSize: '1rem', lineHeight: 1.4 }}>{q}</p>
        <ChevronDown
          size={20} color="#6b7280"
          style={{ flexShrink: 0, transition: 'transform 0.25s', transform: open ? 'rotate(180deg)' : 'none' }}
        />
      </div>
      {open && (
        <p style={{ marginTop: '1rem', color: '#4b5563', fontSize: '0.9375rem', lineHeight: 1.7 }}>{a}</p>
      )}
    </div>
  );
}

// ─── Glass card style ─────────────────────────────────────────────────────────
const glassCard = {
  background: 'rgba(255,255,255,0.72)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255,255,255,0.6)',
  boxShadow: '0 4px 24px rgba(0,0,0,0.05)',
  borderRadius: 20,
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'transparent', color: '#111827' }}>

      <AnimeBackground />

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.72)',
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
        boxShadow: '0 2px 20px rgba(0,0,0,0.04)',
      }}>
        <div style={{ width: '100%', padding: '0 3rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 70, position: 'relative' }}>

          {/* Logo Section */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', flexShrink: 0 }}>
            <img src={logoUrl} alt="AdaptiveLMS Logo" style={{ width: 42, height: 42, objectFit: 'contain', borderRadius: 10, boxShadow: '0 4px 14px rgba(0,0,0,0.07)' }} />
            <span style={{ fontWeight: 900, fontSize: '1.3rem', color: '#111827', letterSpacing: '-0.03em' }}>
              AdaptiveLMS
            </span>
          </Link>

          {/* Perfectly Centered Links */}
          <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
            {['Features', 'How it Works', 'Testimonials', 'FAQ'].map((label) => {
              const href = `#${label.toLowerCase().replace(/ /g, '-')}`;
              return (
                <a
                  key={label} href={href}
                  style={{
                    color: '#4b5563', fontSize: '0.9375rem', fontWeight: 600, textDecoration: 'none', transition: 'color 0.2s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#4f46e5'}
                  onMouseLeave={e => e.currentTarget.style.color = '#4b5563'}
                >
                  {label}
                </a>
              );
            })}
          </div>

          {/* CTA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            <Link to="/auth/login" style={{ fontWeight: 600, fontSize: '0.9rem', color: '#4b5563', textDecoration: 'none' }}>Sign In</Link>
            <Link to="/auth/register" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '0.55rem 1.2rem', borderRadius: 999,
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              color: 'white', fontWeight: 700, fontSize: '0.875rem',
              textDecoration: 'none', boxShadow: '0 4px 16px rgba(79,70,229,0.3)',
              transition: 'all 0.2s ease',
            }}>
              Get Started <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </nav>

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ── HERO ── */}
        <section style={{ padding: '8rem 2rem 6rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', top: -120, left: '5%', width: 600, height: 600,
            borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,70,229,0.12) 0%, transparent 70%)',
            filter: 'blur(70px)', pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', top: 0, right: '-5%', width: 500, height: 500,
            borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%)',
            filter: 'blur(70px)', pointerEvents: 'none',
          }} />

          <div style={{ maxWidth: 860, margin: '0 auto', position: 'relative' }}>
            <div className="animate-fade-up" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 18px',
              borderRadius: 999, background: '#eef2ff', border: '1px solid #c7d2fe',
              color: '#4338ca', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '2rem',
            }}>
              <Sparkles size={13} /> Powered by GPT-4o + pgvector RAG
            </div>

            <h1 className="animate-fade-up delay-100" style={{
              fontSize: 'clamp(2.75rem, 6.5vw, 4.75rem)',
              fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.06, marginBottom: '1.5rem',
            }}>
              The Future of<br />
              <span className="text-gradient">Personalized Learning</span>
            </h1>

            <p className="animate-fade-up delay-200" style={{
              fontSize: '1.2rem', color: '#4b5563', maxWidth: 600,
              margin: '0 auto 2.75rem', lineHeight: 1.7,
            }}>
              An enterprise LMS that uses AI to understand how each student thinks, adapts
              content in real-time, and ensures exam integrity through automated proctoring.
            </p>

            <div className="animate-fade-up delay-300" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/auth/register" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '0.875rem 2rem', borderRadius: 999,
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                color: 'white', fontWeight: 700, fontSize: '1.0625rem',
                textDecoration: 'none', boxShadow: '0 8px 32px rgba(79,70,229,0.35)',
              }}>
                Start for Free <ArrowRight size={18} />
              </Link>
              <a href="#how-it-works" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '0.875rem 2rem', borderRadius: 999,
                background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)',
                border: '1px solid rgba(0,0,0,0.08)',
                color: '#374151', fontWeight: 600, fontSize: '1.0625rem',
                textDecoration: 'none',
              }}>
                <Play size={16} /> See How it Works
              </a>
            </div>

            <div className="animate-fade-up delay-400" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: '2.25rem' }}>
              {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />)}
              <span style={{ fontSize: '0.875rem', color: '#6b7280', marginLeft: 6 }}>Trusted by 50,000+ learners worldwide</span>
            </div>
          </div>
        </section>

        {/* ── STATS ── */}
        <section style={{ borderTop: '1px solid rgba(0,0,0,0.06)', borderBottom: '1px solid rgba(0,0,0,0.06)', background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2rem', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {stats.map(({ value, label, icon }, i) => (
              <div key={label} style={{ textAlign: 'center', padding: '2.25rem 1rem', borderRight: i < 3 ? '1px solid rgba(0,0,0,0.06)' : 'none' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>{icon}</div>
                <p style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1 }} className="text-gradient">{value}</p>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: 6 }}>{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section id="features" style={{ padding: '6rem 2rem', background: 'transparent' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'5px 14px', borderRadius:999, background:'#eef2ff', border:'1px solid #c7d2fe', color:'#4338ca', fontSize:'0.78rem', fontWeight:700, marginBottom:'1.25rem' }}>
                <Zap size={11} /> Full Feature Suite
              </div>
              <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '1rem' }}>
                Everything to learn <span className="text-gradient">smarter</span>
              </h2>
              <p style={{ color: '#4b5563', fontSize: '1.0625rem', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
                Built with enterprise AI for modern education and corporate training at scale.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {features.map(({ icon: Icon, title, desc, color, bg, border, glow }, i) => (
                <div key={title} className="feature-card animate-fade-up" style={{ animationDelay: `${i * 0.08}s` }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: bg, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', boxShadow: `0 4px 16px ${glow}` }}>
                    <Icon size={24} color={color} />
                  </div>
                  <h3 style={{ fontWeight: 700, color: '#111827', marginBottom: '0.625rem', fontSize: '1.0625rem' }}>{title}</h3>
                  <p style={{ color: '#6b7280', fontSize: '0.9375rem', lineHeight: 1.65 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section id="how-it-works" style={{ padding: '6rem 2rem', background: 'rgba(248,249,255,0.6)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'5px 14px', borderRadius:999, background:'#f5f3ff', border:'1px solid #ddd6fe', color:'#6d28d9', fontSize:'0.78rem', fontWeight:700, marginBottom:'1.25rem' }}>
                <ClipboardCheck size={11} /> Simple Onboarding
              </div>
              <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '1rem' }}>
                Up and running in <span className="text-gradient">4 steps</span>
              </h2>
              <p style={{ color: '#4b5563', fontSize: '1.0625rem', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
                From signup to AI-powered adaptive learning in under 30 minutes.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
              {steps.map(({ num, icon: Icon, title, desc, color }) => (
                <div key={num} style={{ ...glassCard, padding: '2rem 1.5rem', position: 'relative' }}>
                  <div style={{
                    position: 'absolute', top: -14, left: 20, fontSize: '0.7rem', fontWeight: 900,
                    letterSpacing: '0.05em', color: color, background: 'white',
                    padding: '2px 10px', borderRadius: 999, border: `1px solid ${color}22`,
                  }}>STEP {num}</div>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', marginTop: '0.5rem' }}>
                    <Icon size={22} color={color} />
                  </div>
                  <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.75rem', color: '#111827' }}>{title}</h3>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem', lineHeight: 1.65 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section id="testimonials" style={{ padding: '5rem 2rem', background: 'transparent' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
              <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>
                Loved by learners & institutions
              </h2>
              <p style={{ color: '#6b7280' }}>Join thousands of educators and students already transforming learning.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
              {testimonials.map(({ name, role, text, avatar, gradient }) => (
                <div key={name} style={{ ...glassCard, padding: '1.75rem' }}>
                  <div style={{ display: 'flex', gap: 4, marginBottom: '1rem' }}>
                    {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />)}
                  </div>
                  <p style={{ color: '#4b5563', fontSize: '0.9375rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>"{text}"</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.875rem' }}>{avatar}</div>
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


        {/* ── FAQ ── */}
        <section id="faq" style={{ padding: '6rem 2rem', background: 'transparent' }}>
          <div style={{ maxWidth: 760, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
              <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>
                Frequently asked questions
              </h2>
              <p style={{ color: '#6b7280' }}>Everything you need to know before getting started.</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {faqs.map(faq => <FaqItem key={faq.q} {...faq} />)}
            </div>
          </div>
        </section>

        {/* ── CTA BANNER ── */}
        <section style={{ padding: '6rem 2rem', background: 'transparent' }}>
          <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
            <div style={{
              borderRadius: 28, padding: '4rem 2.5rem',
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 60%, #a855f7 100%)',
              boxShadow: '0 24px 80px rgba(79,70,229,0.35)',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position:'absolute', top:-60, right:-60, width:200, height:200, borderRadius:'50%', background:'rgba(255,255,255,0.05)' }} />
              <div style={{ position:'absolute', bottom:-40, left:-40, width:160, height:160, borderRadius:'50%', background:'rgba(255,255,255,0.04)' }} />
              <GraduationCap size={44} color="rgba(255,255,255,0.85)" style={{ marginBottom: '1.25rem' }} />
              <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 900, color: 'white', marginBottom: '1rem', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
                Ready to transform your learning?
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.75)', marginBottom: '2.25rem', fontSize: '1.1rem', lineHeight: 1.6, maxWidth: 480, margin: '0 auto 2.25rem' }}>
                Join 50,000+ students and institutions already using AdaptiveLMS. No credit card required.
              </p>
              <Link to="/auth/register" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '0.9rem 2.25rem', borderRadius: 999,
                background: 'white', color: '#4338ca',
                fontWeight: 800, fontSize: '1.0625rem', textDecoration: 'none',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              }}>
                Get Started Free <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          {/* Top footer */}
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '4rem 2rem 3rem', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '2.5rem', flexWrap: 'wrap' }}>

            {/* Brand column */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.25rem' }}>
                <img src={logoUrl} alt="AdaptiveLMS" style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'contain' }} />
                <span style={{ fontWeight: 900, fontSize: '1.1rem', color: '#111827', letterSpacing: '-0.02em' }}>AdaptiveLMS</span>
              </div>
              <p style={{ color: '#6b7280', fontSize: '0.9rem', lineHeight: 1.7, maxWidth: 240, marginBottom: '1.5rem' }}>
                The AI-first learning management system for institutions that demand results.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                {[
                  { Icon: Share2,      label: 'Twitter'  },
                  { Icon: GitBranch,   label: 'GitHub'   },
                  { Icon: Globe,       label: 'LinkedIn' },
                  { Icon: Mail,        label: 'Email'    },
                ].map(({ Icon, label }) => (
                  <button
                    key={label} title={label}
                    style={{
                      width: 36, height: 36, borderRadius: 10, border: '1px solid rgba(0,0,0,0.08)',
                      background: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: '#6b7280', transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.color = '#4f46e5'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)'; e.currentTarget.style.color = '#6b7280'; }}
                  >
                    <Icon size={15} />
                  </button>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {Object.entries(footerLinks).map(([section, links]) => (
              <div key={section}>
                <p style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#111827', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>{section}</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {links.map(link => (
                    <li key={link}>
                      <a href="#" style={{ color: '#6b7280', fontSize: '0.9rem', textDecoration: 'none', transition: 'color 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#4f46e5'}
                        onMouseLeave={e => e.currentTarget.style.color = '#6b7280'}
                      >{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', padding: '1.25rem 2rem' }}>
            <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <p style={{ color: '#9ca3af', fontSize: '0.8125rem' }}>© 2026 AdaptiveLMS · Built with FastAPI, React & OpenAI · Made in India 🇮🇳</p>
              <div style={{ display: 'flex', gap: 20 }}>
                {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(t => (
                  <a key={t} href="#" style={{ color: '#9ca3af', fontSize: '0.8125rem', textDecoration: 'none' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#4f46e5'}
                    onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}
                  >{t}</a>
                ))}
              </div>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
