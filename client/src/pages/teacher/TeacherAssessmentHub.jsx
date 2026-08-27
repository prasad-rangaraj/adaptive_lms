import { useState, useEffect } from 'react';
import { 
  Bot, CheckCircle2, AlertTriangle, Eye, ArrowRight, CornerDownRight, ChevronDown
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

import { coursesAPI, assignmentsAPI } from '../../services/api.service';

// ── Tab: Grading (Editorial Reading Style) ────────────────────────────────
function GradingTab({ courses }) {
  const [activeCourseId, setActiveCourseId] = useState(courses[0]?.id || null);
  const [assignments, setAssignments] = useState([]);
  const [activeAssignmentId, setActiveAssignmentId] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [activeSubmissionId, setActiveSubmissionId] = useState(null);
  const [gradeInput, setGradeInput] = useState('');

  // 1. Fetch assignments when course changes
  useEffect(() => {
    if (!activeCourseId) return;
    coursesAPI.getAssignments(activeCourseId).then(res => {
      setAssignments(res.data);
      if (res.data.length > 0) setActiveAssignmentId(res.data[0].id);
      else { setActiveAssignmentId(null); setSubmissions([]); }
    }).catch(console.error);
  }, [activeCourseId]);

  // 2. Fetch submissions when assignment changes
  useEffect(() => {
    if (!activeAssignmentId) return;
    assignmentsAPI.getSubmissions(activeAssignmentId).then(res => {
      setSubmissions(res.data);
      if (res.data.length > 0) {
        setActiveSubmissionId(res.data[0].id);
        setGradeInput(res.data[0].final_score || res.data[0].ai_score || 0);
      } else {
        setActiveSubmissionId(null);
      }
    }).catch(console.error);
  }, [activeAssignmentId]);

  const activeSub = submissions.find(s => s.id === activeSubmissionId);

  const handleGrade = async () => {
    if (!activeSub) return;
    try {
      await assignmentsAPI.gradeSubmission(activeSub.assignment_id, activeSub.id, {
        final_score: parseFloat(gradeInput),
        teacher_feedback: "Graded via Teacher Hub",
      });
      // refresh
      const res = await assignmentsAPI.getSubmissions(activeAssignmentId);
      setSubmissions(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '6rem', alignItems: 'start' }}>
      
      {/* ── Left: Submission Roster ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Select Course & Assignment */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <select value={activeCourseId || ''} onChange={e => setActiveCourseId(e.target.value)} style={{ width: '100%', padding: '0.75rem 2.5rem 0.75rem 1rem', borderRadius: 8, background: 'var(--surface-2)', border: 'none', color: 'var(--text-primary)', outline: 'none', appearance: 'none', cursor: 'pointer' }}>
              <option value="" disabled>Select Course...</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
            <ChevronDown size={18} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }} />
          </div>
          <div style={{ position: 'relative' }}>
            <select value={activeAssignmentId || ''} onChange={e => setActiveAssignmentId(e.target.value)} style={{ width: '100%', padding: '0.75rem 2.5rem 0.75rem 1rem', borderRadius: 8, background: 'var(--surface-2)', border: 'none', color: 'var(--text-primary)', outline: 'none', appearance: 'none', cursor: 'pointer' }}>
              <option value="" disabled>Select Assignment...</option>
              {assignments.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
            </select>
            <ChevronDown size={18} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }} />
          </div>
        </div>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Pending Reviews</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {submissions.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No submissions found.</p>}
          {submissions.map(sub => (
            <div 
              key={sub.id} 
              onClick={() => { setActiveSubmissionId(sub.id); setGradeInput(sub.final_score || sub.ai_score || 0); }}
              style={{ position: 'relative', paddingLeft: '1.5rem', cursor: 'pointer', opacity: activeSubmissionId === sub.id ? 1 : 0.6, transition: 'opacity 0.2s' }}
            >
              {activeSubmissionId === sub.id && (
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: 'var(--brand-500)', borderRadius: '999px' }} />
              )}
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Student #{sub.student_id}</h3>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: sub.status === 'evaluated' ? '#10b981' : '#f59e0b' }}>
                  {sub.status}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>AI Score: {sub.ai_score || 'Pending'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right: Editorial Reader View ── */}
      <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '700px' }}>
        {activeSub ? (
          <>
            <div style={{ marginBottom: '3rem' }}>
              <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--brand-500)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>Submission File</p>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '1rem' }}>
                <a href={activeSub.file_url} target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>View Document ↗</a>
              </h2>
            </div>

            <div style={{ fontSize: '1.125rem', color: 'var(--text-primary)', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <p style={{ position: 'relative' }}>
                <span style={{ background: '#fef3c7', padding: '2px 4px', borderRadius: 4 }}>AI Evaluator Feedback:</span>
                
                {/* AI Inline Annotation (Borderless) */}
                <span style={{ display: 'block', marginTop: '1rem', paddingLeft: '1.5rem', borderLeft: '2px solid #8b5cf6', fontSize: '0.9375rem', color: '#6d28d9', fontStyle: 'italic', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <Bot size={16} style={{ marginTop: 4, flexShrink: 0 }} />
                  <span>{activeSub.feedback ? JSON.stringify(activeSub.feedback) : "No detailed AI feedback yet. The document might still be processing."}</span>
                </span>
              </p>
            </div>

            {/* ── Grading Action (Floating bottom) ── */}
            <div style={{ marginTop: '5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '2px solid var(--surface-3)', paddingTop: '2rem' }}>
              <div>
                <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Suggested Grade</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
                  <input type="number" value={gradeInput} onChange={e => setGradeInput(e.target.value)} style={{ width: '80px', background: 'transparent', border: 'none', borderBottom: '3px solid var(--text-primary)', fontSize: '3rem', fontWeight: 900, color: 'var(--text-primary)', outline: 'none', textAlign: 'center', padding: 0 }} />
                  <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-muted)' }}>/ 100</span>
                </div>
              </div>
              
              <button onClick={handleGrade} style={{ background: 'var(--text-primary)', color: 'white', border: 'none', padding: '16px 32px', borderRadius: 999, fontSize: '1.125rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
                Approve Grade <ArrowRight size={20} />
              </button>
            </div>
          </>
        ) : (
          <div style={{ color: 'var(--text-muted)' }}>Select a submission to review.</div>
        )}
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
      
      <div style={{ display: 'flex', gap: '3rem' }}>
        <div>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.1em' }}>High Risk Flags</p>
          <span style={{ fontSize: '2.5rem', fontWeight: 900, color: '#ef4444', lineHeight: 1 }}>1</span>
        </div>
        <div>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Medium Risk</p>
          <span style={{ fontSize: '2.5rem', fontWeight: 900, color: '#f59e0b', lineHeight: 1 }}>4</span>
        </div>
        <div>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Clean Sessions</p>
          <span style={{ fontSize: '2.5rem', fontWeight: 900, color: '#10b981', lineHeight: 1 }}>142</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '2rem' }}>Action Required</h2>
        
        {/* Organic List (No Table) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {flags.map((flag) => (
            <div key={flag.id} style={{ display: 'flex', alignItems: 'center', gap: '2rem', paddingBottom: '2rem', borderBottom: '1px solid var(--surface-3)' }}>
              
              {/* Organic Risk Indicator */}
              <div style={{ position: 'relative', width: 48, height: 48 }}>
                <div style={{ position: 'absolute', inset: 0, borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%', background: flag.color, opacity: 0.1, animation: 'pulse 4s infinite alternate' }} />
                <div style={{ position: 'absolute', inset: '8px', borderRadius: '50%', background: flag.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                  <AlertTriangle size={16} />
                </div>
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--text-primary)' }}>{flag.student}</h3>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: flag.color }}>{flag.risk} Risk</span>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{flag.course}</p>
              </div>

              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{flag.type}</p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{flag.time} • Duration: {flag.duration}</p>
              </div>

              <button style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, padding: 0 }}>
                <Eye size={16} /> Review Evidence
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
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    coursesAPI.list().then(res => setCourses(res.data)).catch(console.error);
  }, []);

  return (
    <div style={{ position: 'relative', minHeight: '100%', paddingBottom: '4rem', overflow: 'hidden' }}>
      
      {/* ── Background Organic Orbs ── */}
      <div style={{ position: 'absolute', top: '10%', right: '10%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(16,185,129,0.04) 0%, transparent 70%)', filter: 'blur(80px)', zIndex: 0, pointerEvents: 'none' }} />
      
      <div style={{ position: 'relative', zIndex: 10 }}>

        {/* ── Editorial Header ── */}
        <div style={{ marginBottom: '2rem' }}>
          

          {/* Borderless Text Tabs */}
          <div style={{ display: 'flex', gap: '3rem', marginTop: '0', borderBottom: '1px solid var(--surface-3)' }}>
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
          {activeTab === 'grading' && <GradingTab courses={courses} />}
          {activeTab === 'proctoring' && <ProctoringTab />}
        </div>

      </div>
    </div>
  );
}
