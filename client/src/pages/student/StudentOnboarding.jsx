import { useState } from 'react';
import { Target, Brain, ArrowRight, CheckCircle2, ChevronRight, Activity, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const goals = [
  { id: 'placement', title: 'Campus Placements', desc: 'Aiming for top product and service companies.' },
  { id: 'gate', title: 'GATE / Higher Studies', desc: 'Focusing on core subjects for competitive exams.' },
  { id: 'skills', title: 'Skill Development', desc: 'Building projects and learning new tech stacks.' },
  { id: 'pass', title: 'University Exams', desc: 'Just want to clear subjects with good grades.' },
];

const styles = [
  { id: 'visual', title: 'Visual Learner', desc: 'Prefers diagrams, videos, and flowcharts.' },
  { id: 'reading', title: 'Text & Reading', desc: 'Prefers detailed notes, PDFs, and documentation.' },
  { id: 'kinesthetic', title: 'Hands-on', desc: 'Prefers coding immediately and learning by doing.' },
];

const baselineQuiz = [
  { q: "If A is taller than B, and B is taller than C, who is the shortest?", options: ["A", "B", "C", "Cannot be determined"] },
  { q: "What comes next in the sequence: 2, 6, 12, 20, __?", options: ["24", "30", "36", "42"] },
  { q: "Which data structure uses LIFO?", options: ["Queue", "Stack", "Tree", "Graph"] },
];

export default function StudentOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [analyzing, setAnalyzing] = useState(false);

  const handleFinish = () => {
    setAnalyzing(true);
    setTimeout(() => {
      // In a real app, this would save to the backend and redirect to the dashboard
      navigate('/student/dashboard');
    }, 2000);
  };

  if (analyzing) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-0)', color: 'var(--text-primary)' }}>
        <div style={{ position: 'relative', width: 80, height: 80, marginBottom: '2rem' }}>
          <div style={{ position: 'absolute', inset: 0, border: '4px solid var(--surface-3)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', inset: 0, border: '4px solid var(--brand-500)', borderRadius: '50%', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Brain size={32} color="var(--brand-500)" />
          </div>
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>Generating Cognitive Profile...</h2>
        <p style={{ color: 'var(--text-muted)' }}>Calibrating AI recommendations based on your baseline.</p>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-0)', display: 'flex', flexDirection: 'column' }}>
      
      {/* ── Header Progress ── */}
      <div style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--surface-3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--brand-500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={20} color="white" />
          </div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)' }}>Adaptive LMS</h1>
        </div>
        
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: step >= s ? 'var(--brand-500)' : 'var(--surface-2)', color: step >= s ? 'white' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8125rem' }}>
                {step > s ? <CheckCircle2 size={16} /> : s}
              </div>
              {s < 3 && <div style={{ width: 40, height: 2, background: step > s ? 'var(--brand-500)' : 'var(--surface-3)' }} />}
            </div>
          ))}
        </div>
        <div style={{ width: 140 }} /> {/* Balancer */}
      </div>

      {/* ── Main Content ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 2rem' }}>
        <div style={{ maxWidth: 640, width: '100%' }}>

          {/* Step 1: Goals */}
          {step === 1 && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>What is your primary goal?</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>This helps the AI tailor your learning path and deadlines.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '3rem' }}>
                {goals.map(g => (
                  <div key={g.id} onClick={() => setSelectedGoal(g.id)} style={{ padding: '1.5rem', borderRadius: 20, border: `2px solid ${selectedGoal === g.id ? 'var(--brand-500)' : 'var(--surface-3)'}`, background: selectedGoal === g.id ? 'var(--brand-50)' : 'var(--surface-1)', cursor: 'pointer', transition: 'all 0.2s' }}>
                    <Target size={24} color={selectedGoal === g.id ? 'var(--brand-600)' : 'var(--text-muted)'} style={{ marginBottom: '1rem' }} />
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{g.title}</h3>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{g.desc}</p>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button disabled={!selectedGoal} onClick={() => setStep(2)} style={{ background: 'var(--brand-500)', color: 'white', border: 'none', padding: '12px 28px', borderRadius: 999, fontSize: '0.9375rem', fontWeight: 800, cursor: selectedGoal ? 'pointer' : 'not-allowed', opacity: selectedGoal ? 1 : 0.5, display: 'flex', alignItems: 'center', gap: 8 }}>
                  Next Step <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Learning Style */}
          {step === 2 && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>How do you prefer to learn?</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>We will prioritize this type of content in your feed.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem' }}>
                {styles.map(s => (
                  <div key={s.id} onClick={() => setSelectedStyle(s.id)} style={{ padding: '1.5rem', borderRadius: 20, border: `2px solid ${selectedStyle === s.id ? 'var(--brand-500)' : 'var(--surface-3)'}`, background: selectedStyle === s.id ? 'var(--brand-50)' : 'var(--surface-1)', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: selectedStyle === s.id ? 'var(--brand-100)' : 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Brain size={24} color={selectedStyle === s.id ? 'var(--brand-600)' : 'var(--text-muted)'} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{s.title}</h3>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button onClick={() => setStep(1)} style={{ background: 'transparent', color: 'var(--text-secondary)', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Back</button>
                <button disabled={!selectedStyle} onClick={() => setStep(3)} style={{ background: 'var(--brand-500)', color: 'white', border: 'none', padding: '12px 28px', borderRadius: 999, fontSize: '0.9375rem', fontWeight: 800, cursor: selectedStyle ? 'pointer' : 'not-allowed', opacity: selectedStyle ? 1 : 0.5, display: 'flex', alignItems: 'center', gap: 8 }}>
                  Next Step <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Baseline Quiz */}
          {step === 3 && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>Baseline Assessment</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>A quick check to set your initial cognitive profile score.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', marginBottom: '3rem' }}>
                {baselineQuiz.map((q, idx) => (
                  <div key={idx}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--brand-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Question {idx + 1}</p>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.25rem', lineHeight: 1.4 }}>{q.q}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      {q.options.map((opt, oIdx) => (
                        <button key={oIdx} onClick={() => setQuizAnswers(p => ({ ...p, [idx]: oIdx }))}
                          style={{ padding: '1rem 1.25rem', borderRadius: 14, textAlign: 'left', border: `2px solid ${quizAnswers[idx] === oIdx ? 'var(--brand-500)' : 'var(--surface-3)'}`, background: quizAnswers[idx] === oIdx ? 'var(--brand-50)' : 'var(--surface-1)', color: quizAnswers[idx] === oIdx ? 'var(--brand-700)' : 'var(--text-primary)', fontSize: '0.875rem', fontWeight: quizAnswers[idx] === oIdx ? 800 : 600, cursor: 'pointer', transition: 'all 0.15s' }}>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button onClick={() => setStep(2)} style={{ background: 'transparent', color: 'var(--text-secondary)', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Back</button>
                <button disabled={Object.keys(quizAnswers).length < 3} onClick={handleFinish} style={{ background: '#10b981', color: 'white', border: 'none', padding: '12px 28px', borderRadius: 999, fontSize: '0.9375rem', fontWeight: 800, cursor: Object.keys(quizAnswers).length === 3 ? 'pointer' : 'not-allowed', opacity: Object.keys(quizAnswers).length === 3 ? 1 : 0.5, display: 'flex', alignItems: 'center', gap: 8, boxShadow: Object.keys(quizAnswers).length === 3 ? '0 4px 14px rgba(16,185,129,0.35)' : 'none' }}>
                  Generate Profile <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
