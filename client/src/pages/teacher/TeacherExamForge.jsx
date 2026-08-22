import { useState } from 'react';
import { 
  Sparkles, FileText, Upload, Plus, GripVertical, Settings, PlayCircle, ShieldCheck
} from 'lucide-react';

// ── Tab: Question Bank ────────────────────────────────────────────────────
function QuestionBankTab() {
  const [questions, setQuestions] = useState([
    { id: 1, text: 'What is the primary function of a Convolutional Layer?', type: 'Multiple Choice', difficulty: 'Easy', tags: ['CNN', 'Basics'] },
    { id: 2, text: 'Explain the vanishing gradient problem and how LSTMs solve it.', type: 'Subjective', difficulty: 'Hard', tags: ['RNN', 'LSTM'] },
    { id: 3, text: 'Which activation function is most commonly used in hidden layers?', type: 'Multiple Choice', difficulty: 'Medium', tags: ['Activation'] },
  ]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '4rem', alignItems: 'start' }}>
      
      {/* ── Left: Generated Questions ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Question Bank</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>142 questions available for Advanced Machine Learning.</p>
          </div>
          <button style={{ background: 'var(--text-primary)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 999, fontSize: '0.875rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Plus size={16} /> Add Manual Question
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {questions.map(q => (
            <div key={q.id} style={{ background: 'var(--surface-0)', border: '1px solid var(--surface-3)', borderRadius: 16, padding: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
              <div style={{ padding: '0.5rem', cursor: 'grab' }}>
                <GripVertical size={16} color="var(--surface-4)" />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem', lineHeight: 1.5 }}>{q.text}</p>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--brand-700)', background: 'var(--brand-50)', padding: '4px 10px', borderRadius: 8 }}>{q.type}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: q.difficulty === 'Easy' ? '#10b981' : q.difficulty === 'Medium' ? '#f59e0b' : '#ef4444' }}>{q.difficulty}</span>
                  {q.tags.map(t => (
                    <span key={t} style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', background: 'var(--surface-2)', padding: '4px 8px', borderRadius: 6 }}>{t}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right: AI Generator Widget ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ background: 'var(--surface-0)', border: '1px solid #8b5cf6', borderRadius: 20, padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
          
          <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: 100, height: 100, background: '#8b5cf6', opacity: 0.1, borderRadius: '50%', filter: 'blur(30px)' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1rem', position: 'relative' }}>
            <Sparkles size={20} color="#8b5cf6" />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--text-primary)' }}>AI Forge</h3>
          </div>
          
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5, position: 'relative' }}>
            Upload a syllabus, presentation, or paste a transcript. I will instantly generate a tagged Question Bank mapped to cognitive levels.
          </p>

          <div style={{ border: '2px dashed var(--surface-4)', borderRadius: 12, padding: '2rem', textAlign: 'center', marginBottom: '1.5rem', cursor: 'pointer', background: 'var(--surface-1)' }}>
            <Upload size={24} color="var(--text-muted)" style={{ marginBottom: '0.5rem' }} />
            <p style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--text-secondary)' }}>Click to upload PDF or Video</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Generate:</label>
            <select style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--surface-3)', background: 'var(--surface-0)', fontSize: '0.875rem', fontWeight: 700 }}>
              <option>50 Mixed Questions (MCQ & Subjective)</option>
              <option>10 Hard Subjective Questions</option>
              <option>100 Easy MCQs</option>
            </select>
          </div>

          <button style={{ width: '100%', background: '#8b5cf6', color: 'white', border: 'none', padding: '12px', borderRadius: 8, fontSize: '0.9375rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Sparkles size={16} /> Generate Bank
          </button>
        </div>
      </div>

    </div>
  );
}

// ── Tab: Exam Assembler ───────────────────────────────────────────────────
function AssemblerTab() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '4rem', alignItems: 'start' }}>
      
      {/* ── Left: The Exam Canvas ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div>
          <input 
            defaultValue="Midterm: Neural Networks" 
            style={{ width: '100%', padding: '0.5rem 0', background: 'transparent', border: 'none', borderBottom: '2px solid var(--surface-4)', color: 'var(--text-primary)', fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.02em', outline: 'none', marginBottom: '0.5rem' }}
          />
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>45 Questions • 100 Total Marks • 90 Minutes</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '2rem', background: 'var(--surface-1)', border: '2px dashed var(--surface-3)', borderRadius: 16, minHeight: '300px' }}>
          
          <div style={{ background: 'var(--surface-0)', border: '1px solid var(--surface-3)', borderRadius: 12, padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <GripVertical size={16} color="var(--surface-4)" style={{ cursor: 'grab', marginTop: 4 }} />
            <div>
              <p style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>1. What is the primary function of a Convolutional Layer?</p>
              <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--brand-700)', background: 'var(--brand-50)', padding: '2px 8px', borderRadius: 4 }}>1 Mark</span>
            </div>
          </div>

          <div style={{ background: 'var(--surface-0)', border: '1px solid var(--surface-3)', borderRadius: 12, padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <GripVertical size={16} color="var(--surface-4)" style={{ cursor: 'grab', marginTop: 4 }} />
            <div>
              <p style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>2. Explain the vanishing gradient problem and how LSTMs solve it.</p>
              <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#b45309', background: '#fef3c7', padding: '2px 8px', borderRadius: 4 }}>10 Marks</span>
            </div>
          </div>

          <button style={{ alignSelf: 'center', background: 'var(--brand-50)', color: 'var(--brand-700)', border: 'none', padding: '10px 20px', borderRadius: 999, fontSize: '0.875rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, marginTop: '1rem' }}>
            <Plus size={16} /> Drag questions here or Auto-Fill
          </button>

        </div>
      </div>

      {/* ── Right: Exam Settings & Security ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        <div style={{ background: 'var(--surface-0)', border: '1px solid var(--surface-3)', borderRadius: 20, padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.5rem' }}>
            <ShieldCheck size={20} color="#10b981" />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--text-primary)' }}>Security & Integrity</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { label: 'Require AI Webcam Proctoring', active: true },
              { label: 'Lockdown Browser Mode', active: true },
              { label: 'Randomize Question Order', active: true },
              { label: 'Randomize Option Order', active: false },
            ].map((setting, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{setting.label}</span>
                <div style={{ width: 40, height: 24, borderRadius: 999, background: setting.active ? '#10b981' : 'var(--surface-3)', position: 'relative', cursor: 'pointer', transition: 'background 0.2s' }}>
                  <div style={{ position: 'absolute', top: 2, left: setting.active ? 18 : 2, width: 20, height: 20, borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button style={{ width: '100%', background: 'var(--surface-1)', color: 'var(--text-primary)', border: '1px solid var(--surface-3)', padding: '12px', borderRadius: 8, fontSize: '0.9375rem', fontWeight: 800, cursor: 'pointer' }}>
            Save as Draft
          </button>
          <button style={{ width: '100%', background: 'var(--text-primary)', color: 'white', border: 'none', padding: '12px', borderRadius: 8, fontSize: '0.9375rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <PlayCircle size={18} /> Publish Exam
          </button>
        </div>

      </div>

    </div>
  );
}

// ── Main Hub ──────────────────────────────────────────────────────────────
export default function TeacherExamForge() {
  const [activeTab, setActiveTab] = useState('bank');

  return (
    <div style={{ position: 'relative', minHeight: '100%', paddingBottom: '4rem', overflow: 'hidden' }}>
      
      {/* ── Background Organic Orbs ── */}
      <div style={{ position: 'absolute', top: '10%', right: '10%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)', filter: 'blur(80px)', zIndex: 0, pointerEvents: 'none' }} />
      
      <div style={{ position: 'relative', zIndex: 10 }}>

        {/* ── Editorial Header ── */}
        <div style={{ marginBottom: '2rem' }}>
          <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--brand-500)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1rem' }}>
            Evaluation Operations
          </p>
          
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
            Exam Forge
          </h1>

          {/* Borderless Text Tabs */}
          <div style={{ display: 'flex', gap: '3rem', marginTop: '3rem', borderBottom: '1px solid var(--surface-3)' }}>
            {[
              { id: 'bank', label: 'Question Bank' },
              { id: 'assembler', label: 'Exam Assembler' },
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
        <div style={{ minHeight: '600px', paddingTop: '1rem' }}>
          {activeTab === 'bank' && <QuestionBankTab />}
          {activeTab === 'assembler' && <AssemblerTab />}
        </div>

      </div>
    </div>
  );
}
