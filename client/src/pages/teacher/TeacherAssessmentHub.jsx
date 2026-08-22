import { useState } from 'react';
import { 
  Bot, CheckCircle2, AlertTriangle, Eye, ArrowRight, CornerDownRight
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

// ── Tab: Grading (Editorial Reading Style) ────────────────────────────────
function GradingTab() {
  const [activeSubmission, setActiveSubmission] = useState(1);

  const submissions = [
    { id: 1, student: 'Alex Chen', course: 'Machine Learning', assignment: 'Final Essay: Ethical AI', aiScore: 88, status: 'Needs Review', submittedAt: '2 hours ago' },
    { id: 2, student: 'Sarah Jenkins', course: 'Data Structures', assignment: 'Binary Tree Implementation', aiScore: 95, status: 'Graded', submittedAt: '1 day ago' },
    { id: 3, student: 'Michael Chang', course: 'Machine Learning', assignment: 'Final Essay: Ethical AI', aiScore: 72, status: 'Needs Review', submittedAt: '5 hours ago' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '6rem', alignItems: 'start' }}>
      
      {/* ── Left: Submission Roster ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Pending Reviews</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {submissions.map(sub => (
            <div 
              key={sub.id} 
              onClick={() => setActiveSubmission(sub.id)}
              style={{ position: 'relative', paddingLeft: '1.5rem', cursor: 'pointer', opacity: activeSubmission === sub.id ? 1 : 0.6, transition: 'opacity 0.2s' }}
            >
              {activeSubmission === sub.id && (
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: 'var(--brand-500)', borderRadius: '999px' }} />
              )}
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{sub.student}</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{sub.assignment}</p>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: sub.status === 'Graded' ? '#10b981' : '#f59e0b' }}>
                  {sub.status}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sub.submittedAt}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right: Editorial Reader View ── */}
      <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '700px' }}>
        
        <div style={{ marginBottom: '3rem' }}>
          <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--brand-500)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>Final Essay: Ethical AI</p>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '1rem' }}>The Bias Within Algorithms</h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>By Alex Chen • Submitted 2 hours ago</p>
        </div>

        <div style={{ fontSize: '1.125rem', color: 'var(--text-primary)', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <p>
            Artificial Intelligence presents numerous ethical challenges, chief among them being bias in machine learning models and the lack of transparency in "black box" algorithms.
          </p>
          
          <p style={{ position: 'relative' }}>
            <span style={{ background: '#fef3c7', padding: '2px 4px', borderRadius: 4 }}>Furthermore, the automation of cognitive labor threatens to displace significant segments of the workforce.</span>
            
            {/* AI Inline Annotation (Borderless) */}
            <span style={{ display: 'block', marginTop: '1rem', paddingLeft: '1.5rem', borderLeft: '2px solid #8b5cf6', fontSize: '0.9375rem', color: '#6d28d9', fontStyle: 'italic', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <Bot size={16} style={{ marginTop: 4, flexShrink: 0 }} />
              <span>AI Evaluator: This section makes strong claims about workforce displacement but lacks concrete citations to back them up. Consider penalizing slightly for lack of sources.</span>
            </span>
          </p>

          <p>
            If we are to deploy these systems in critical areas such as criminal justice, we must ensure they are interpretable and fair by design.
          </p>
        </div>

        {/* ── Grading Action (Floating bottom) ── */}
        <div style={{ marginTop: '5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '2px solid var(--surface-3)', paddingTop: '2rem' }}>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Suggested Grade</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
              <input type="number" defaultValue={88} style={{ width: '80px', background: 'transparent', border: 'none', borderBottom: '3px solid var(--text-primary)', fontSize: '3rem', fontWeight: 900, color: 'var(--text-primary)', outline: 'none', textAlign: 'center', padding: 0 }} />
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-muted)' }}>/ 100</span>
            </div>
          </div>
          
          <button style={{ background: 'var(--text-primary)', color: 'white', border: 'none', padding: '16px 32px', borderRadius: 999, fontSize: '1.125rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
            Approve Grade <ArrowRight size={20} />
          </button>
        </div>
      </div>

    </div>
  );
}

// ── Tab: Proctoring (Organic Risk Profile) ────────────────────────────────
function ProctoringTab() {
  const flags = [
    { id: 1, student: 'Michael Chang', course: 'Machine Learning Midterm', risk: 'High', type: 'Multiple Faces Detected', time: '10:42 AM', duration: '45s', color: '#ef4444' },
    { id: 2, student: 'Alex Chen', course: 'Data Structures Final', risk: 'Medium', type: 'Audio Anomaly (Talking)', time: '11:15 AM', duration: '12s', color: '#f59e0b' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
      
      <div style={{ display: 'flex', gap: '4rem' }}>
        <div>
          <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.1em' }}>High Risk Flags</p>
          <span style={{ fontSize: '4rem', fontWeight: 900, color: '#ef4444', lineHeight: 1 }}>1</span>
        </div>
        <div>
          <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Medium Risk</p>
          <span style={{ fontSize: '4rem', fontWeight: 900, color: '#f59e0b', lineHeight: 1 }}>4</span>
        </div>
        <div>
          <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Clean Sessions</p>
          <span style={{ fontSize: '4rem', fontWeight: 900, color: '#10b981', lineHeight: 1 }}>142</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '2rem' }}>Action Required</h2>
        
        {/* Organic List (No Table) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {flags.map((flag) => (
            <div key={flag.id} style={{ display: 'flex', alignItems: 'center', gap: '3rem', paddingBottom: '2rem', borderBottom: '1px solid var(--surface-3)' }}>
              
              {/* Organic Risk Indicator */}
              <div style={{ position: 'relative', width: 64, height: 64 }}>
                <div style={{ position: 'absolute', inset: 0, borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%', background: flag.color, opacity: 0.1, animation: 'pulse 4s infinite alternate' }} />
                <div style={{ position: 'absolute', inset: '10px', borderRadius: '50%', background: flag.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                  <AlertTriangle size={20} />
                </div>
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)' }}>{flag.student}</h3>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: flag.color }}>{flag.risk} Risk</span>
                </div>
                <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>{flag.course}</p>
              </div>

              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{flag.type}</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{flag.time} • Duration: {flag.duration}</p>
              </div>

              <button style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '0.9375rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, padding: 0 }}>
                <Eye size={18} /> Review Evidence
              </button>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Hub ──────────────────────────────────────────────────────────────
export default function TeacherAssessmentHub() {
  const [activeTab, setActiveTab] = useState('grading');

  return (
    <div style={{ position: 'relative', minHeight: '100%', paddingBottom: '4rem', overflow: 'hidden' }}>
      
      {/* ── Background Organic Orbs ── */}
      <div style={{ position: 'absolute', top: '10%', right: '10%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(16,185,129,0.04) 0%, transparent 70%)', filter: 'blur(80px)', zIndex: 0, pointerEvents: 'none' }} />
      
      <div style={{ position: 'relative', zIndex: 10 }}>

        {/* ── Editorial Header ── */}
        <div style={{ marginBottom: '2rem' }}>
          <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--brand-500)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1rem' }}>
            Student Evaluation
          </p>
          
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
            Assessment Hub
          </h1>

          {/* Borderless Text Tabs */}
          <div style={{ display: 'flex', gap: '3rem', marginTop: '3rem', borderBottom: '1px solid var(--surface-3)' }}>
            {[
              { id: 'grading', label: 'Grading & Feedback' },
              { id: 'proctoring', label: 'Proctoring Reviews' },
            ].map(t => (
              <button 
                key={t.id} onClick={() => setActiveTab(t.id)}
                style={{ 
                  background: 'transparent', border: 'none', cursor: 'pointer', 
                  padding: '0 0 1rem 0', 
                  fontSize: '1rem', fontWeight: 800, 
                  color: activeTab === t.id ? 'var(--text-primary)' : 'var(--text-muted)',
                  borderBottom: activeTab === t.id ? '2px solid var(--text-primary)' : '2px solid transparent',
                  transition: 'all 0.2s',
                  marginBottom: '-1px'
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab Content ── */}
        <div style={{ minHeight: '600px' }}>
          {activeTab === 'grading' && <GradingTab />}
          {activeTab === 'proctoring' && <ProctoringTab />}
        </div>

      </div>
    </div>
  );
}
