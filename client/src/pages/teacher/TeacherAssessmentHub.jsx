import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Bot, CheckCircle2, AlertTriangle, Eye, ArrowRight, CornerDownRight, ChevronDown,
  RefreshCw, X, ShieldAlert, Camera, Filter, Check, Clock, User, Plus,
  Calendar, Users, Award, BarChart3, Search, Sparkles, BookOpen, Trash2
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

import { coursesAPI, assignmentsAPI, proctoringAPI, academicAPI } from '../../services/api.service';

// ── Tab: Grading (Editorial Reading Style) ────────────────────────────────
function GradingTab({ courses }) {
  const [activeCourseId, setActiveCourseId] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [activeAssignmentId, setActiveAssignmentId] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [activeSubmissionId, setActiveSubmissionId] = useState(null);
  const [gradeInput, setGradeInput] = useState('');

  // 0. Auto-select first course when loaded
  useEffect(() => {
    if (courses.length > 0 && !activeCourseId) {
      setActiveCourseId(courses[0].id);
    }
  }, [courses, activeCourseId]);

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
      toast.success('Grade approved successfully!');
    } catch (e) {
      console.error(e);
      toast.error('Failed to approve grade');
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

// ── Tab: Proctoring (Organic Risk Profile & Evidence Review) ─────────────
function ProctoringTab() {
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterRisk, setFilterRisk] = useState('all');
  const [selectedFlag, setSelectedFlag] = useState(null);

  const loadFlags = (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    proctoringAPI.getRecentFlags()
      .then(res => setFlags(res.data || []))
      .catch(err => {
        console.error('Failed to load proctoring logs:', err);
        toast.error('Failed to load proctoring reviews');
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    loadFlags();
  }, []);

  const highRiskCount = flags.filter(f => f.risk === 'High').length;
  const medRiskCount = flags.filter(f => f.risk === 'Medium').length;
  const lowRiskCount = flags.filter(f => f.risk === 'Low').length;

  const filteredFlags = flags.filter(f => {
    if (filterRisk === 'high') return f.risk === 'High';
    if (filterRisk === 'medium') return f.risk === 'Medium';
    if (filterRisk === 'low') return f.risk === 'Low';
    return true;
  });

  const handleDismiss = (id) => {
    setFlags(prev => prev.filter(f => f.id !== id));
    if (selectedFlag?.id === id) setSelectedFlag(null);
    toast.success('Incident flag dismissed');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Professional Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        <div 
          onClick={() => setFilterRisk(filterRisk === 'high' ? 'all' : 'high')}
          style={{ background: 'var(--surface-1)', border: filterRisk === 'high' ? '2px solid #ef4444' : '1px solid var(--surface-2)', borderRadius: 12, padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', cursor: 'pointer', transition: 'all 0.2s' }}>
          <p style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>High Risk Flags</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }} />
            <span style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>{highRiskCount}</span>
          </div>
        </div>

        <div 
          onClick={() => setFilterRisk(filterRisk === 'medium' ? 'all' : 'medium')}
          style={{ background: 'var(--surface-1)', border: filterRisk === 'medium' ? '2px solid #f59e0b' : '1px solid var(--surface-2)', borderRadius: 12, padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', cursor: 'pointer', transition: 'all 0.2s' }}>
          <p style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Medium Risk</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#f59e0b' }} />
            <span style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>{medRiskCount}</span>
          </div>
        </div>

        <div 
          onClick={() => setFilterRisk(filterRisk === 'low' ? 'all' : 'low')}
          style={{ background: 'var(--surface-1)', border: filterRisk === 'low' ? '2px solid #10b981' : '1px solid var(--surface-2)', borderRadius: 12, padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', cursor: 'pointer', transition: 'all 0.2s' }}>
          <p style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Low / Clean Logs</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#10b981' }} />
            <span style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>{lowRiskCount}</span>
          </div>
        </div>

        <div 
          onClick={() => setFilterRisk('all')}
          style={{ background: 'var(--surface-1)', border: filterRisk === 'all' ? '2px solid var(--brand-500)' : '1px solid var(--surface-2)', borderRadius: 12, padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', cursor: 'pointer', transition: 'all 0.2s' }}>
          <p style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Total Incidents</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--brand-500)' }} />
            <span style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>{flags.length}</span>
          </div>
        </div>
      </div>

      {/* Professional List Container */}
      <div style={{ background: 'var(--surface-0)', border: '1px solid var(--surface-3)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--surface-3)', background: 'var(--surface-1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>Incident Reports</h2>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, background: 'var(--surface-2)', padding: '2px 8px', borderRadius: 999, color: 'var(--text-secondary)' }}>
              {filteredFlags.length} records
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Filter pills */}
            <div style={{ display: 'flex', background: 'var(--surface-2)', borderRadius: 8, padding: 3 }}>
              {['all', 'high', 'medium', 'low'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilterRisk(f)}
                  style={{
                    border: 'none',
                    background: filterRisk === f ? 'var(--surface-0)' : 'transparent',
                    color: filterRisk === f ? 'var(--text-primary)' : 'var(--text-muted)',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    padding: '4px 10px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                    boxShadow: filterRisk === f ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                    transition: 'all 0.15s',
                  }}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Refresh button */}
            <button 
              onClick={() => loadFlags(true)}
              disabled={refreshing}
              title="Refresh logs"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--surface-3)', color: 'var(--text-primary)', padding: '6px 12px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', fontWeight: 700 }}>
              <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {loading ? (
            <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <RefreshCw size={24} className="spin" color="var(--brand-500)" />
              <span>Loading proctoring logs & student reviews...</span>
            </div>
          ) : filteredFlags.length === 0 ? (
            <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <CheckCircle2 size={36} color="#10b981" />
              <span style={{ fontWeight: 800, fontSize: '1.0625rem', color: 'var(--text-primary)' }}>No incidents found</span>
              <span style={{ fontSize: '0.875rem', maxWidth: 400 }}>
                {filterRisk !== 'all' 
                  ? `No incidents matched the '${filterRisk}' risk filter.` 
                  : 'No student exam violations or proctoring flags logged yet.'}
              </span>
            </div>
          ) : filteredFlags.map((flag, i) => (
            <div 
              key={flag.id} 
              style={{ display: 'grid', gridTemplateColumns: '48px 2fr 1.2fr 1fr auto', alignItems: 'center', gap: '1.5rem', padding: '1.25rem 1.5rem', borderBottom: i === filteredFlags.length - 1 ? 'none' : '1px solid var(--surface-2)', background: 'var(--surface-0)', transition: 'background 0.2s' }} 
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-1)'} 
              onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-0)'}
            >
              <div style={{ width: 40, height: 40, borderRadius: 8, background: `${flag.color}15`, border: `1px solid ${flag.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: flag.color }}>
                <AlertTriangle size={18} />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{flag.student}</span>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', padding: '2px 8px', borderRadius: 999, background: `${flag.color}15`, color: flag.color }}>{flag.risk} Risk</span>
                  {flag.raw_type === 'exam_terminated' && (
                    <span style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', padding: '2px 8px', borderRadius: 999, background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>5 Warnings</span>
                  )}
                </div>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{flag.course}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>{flag.type}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{flag.duration || 'Real-time Event'}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>{flag.time}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{flag.date || 'Timestamp'}</span>
              </div>

              <button 
                onClick={() => setSelectedFlag(flag)} 
                style={{ background: 'var(--surface-2)', border: '1px solid var(--surface-3)', color: 'var(--text-primary)', fontSize: '0.8125rem', fontWeight: 800, padding: '8px 16px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s' }} 
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-3)'; e.currentTarget.style.borderColor = 'var(--text-muted)'; }} 
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.borderColor = 'var(--surface-3)'; }}
              >
                <Eye size={14} /> Review
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Evidence Review Modal ── */}
      {selectedFlag && typeof document !== 'undefined' && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', overflowY: 'auto' }}>
          <div style={{ width: '100%', maxWidth: 640, background: 'var(--surface-0)', borderRadius: 20, border: '1px solid var(--surface-3)', boxShadow: '0 24px 60px rgba(0,0,0,0.3)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            
            {/* Modal Header */}
            <div style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid var(--surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface-1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${selectedFlag.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: selectedFlag.color }}>
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>Incident Evidence Review</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Incident #{selectedFlag.id} • {selectedFlag.date} {selectedFlag.time}</span>
                </div>
              </div>
              <button onClick={() => setSelectedFlag(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: '75vh', overflowY: 'auto' }}>
              
              {/* Student & Exam Info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'var(--surface-1)', padding: '1rem 1.25rem', borderRadius: 12, border: '1px solid var(--surface-2)' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Student</span>
                  <p style={{ margin: '4px 0 0', fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-primary)' }}>{selectedFlag.student}</p>
                  {selectedFlag.student_email && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{selectedFlag.student_email}</span>}
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Exam Assessment</span>
                  <p style={{ margin: '4px 0 0', fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-primary)' }}>{selectedFlag.course}</p>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Exam #{selectedFlag.exam_id || 1}</span>
                </div>
              </div>

              {/* Violation Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Detected Violation</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', padding: '3px 10px', borderRadius: 999, background: `${selectedFlag.color}15`, color: selectedFlag.color, border: `1px solid ${selectedFlag.color}30` }}>
                    {selectedFlag.risk} Risk • {selectedFlag.risk_score || 0}% Score
                  </span>
                </div>
                <div style={{ padding: '1rem', background: 'var(--surface-1)', borderRadius: 12, border: '1px solid var(--surface-3)' }}>
                  <p style={{ margin: '0 0 6px', fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{selectedFlag.type}</p>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{selectedFlag.description}</p>
                </div>
              </div>

              {/* Snapshot / Visual Evidence */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Visual Evidence / Snapshot</span>
                <div style={{ width: '100%', height: 240, background: 'var(--surface-2)', borderRadius: 12, overflow: 'hidden', position: 'relative', border: '1px solid var(--surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {selectedFlag.screenshot_url ? (
                    <>
                      <img src={selectedFlag.screenshot_url} alt="Incident Snapshot" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      <div style={{ position: 'absolute', bottom: 10, left: 10, background: 'rgba(0,0,0,0.7)', color: 'white', padding: '3px 8px', borderRadius: 6, fontSize: '0.6875rem', fontWeight: 800, backdropFilter: 'blur(4px)' }}>
                        CAMERA SNAPSHOT CAPTURED
                      </div>
                    </>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                      <Camera size={36} style={{ marginBottom: 8, opacity: 0.5 }} />
                      <p style={{ margin: '0 0 4px', fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Event-Based Logged Evidence</p>
                      <p style={{ margin: 0, fontSize: '0.75rem' }}>Automated telemetry captured timestamp, tab defocus duration, and device sensors.</p>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Modal Actions */}
            <div style={{ padding: '1.25rem 1.75rem', borderTop: '1px solid var(--surface-3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-1)' }}>
              <button 
                onClick={() => handleDismiss(selectedFlag.id)}
                style={{ padding: '10px 18px', borderRadius: 10, background: 'transparent', border: '1px solid var(--surface-3)', color: 'var(--text-secondary)', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}
              >
                Dismiss Incident
              </button>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button 
                  onClick={() => setSelectedFlag(null)}
                  style={{ padding: '10px 20px', borderRadius: 10, background: 'var(--text-primary)', color: 'white', border: 'none', fontWeight: 800, fontSize: '0.875rem', cursor: 'pointer' }}
                >
                  Mark as Reviewed
                </button>
              </div>
            </div>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
}

// ── Tab: Weekly Assessments ──────────────────────────────────────────────
function WeeklyAssessmentsTab({ courses }) {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courseFilter, setCourseFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [rosterExam, setRosterExam] = useState(null);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const res = await academicAPI.getTeacherWeeklyExams();
      setExams(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load weekly assessments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const filteredExams = exams.filter(e => {
    if (courseFilter !== 'all' && String(e.course_id) !== String(courseFilter)) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return e.title?.toLowerCase().includes(q) || e.course_title?.toLowerCase().includes(q);
    }
    return true;
  });

  // Aggregate KPIs
  const totalTests = exams.length;
  const totalEnrolled = exams.reduce((acc, e) => acc + (e.total_enrolled || 0), 0);
  const totalAttended = exams.reduce((acc, e) => acc + (e.attended_count || 0), 0);
  const overallRate = totalEnrolled > 0 ? Math.round((totalAttended / totalEnrolled) * 100) : 0;
  const avgScoreAll = exams.length > 0
    ? Math.round(exams.reduce((acc, e) => acc + (e.average_score || 0), 0) / exams.length)
    : 0;
  const totalFlags = exams.reduce((acc, e) => acc + (e.flagged_count || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* ── KPI Summary Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1.25rem' }}>
        <div style={{ background: 'var(--surface-0)', padding: '1.5rem', borderRadius: 16, border: '1px solid var(--surface-3)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(59,130,246,0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Calendar size={22} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Weekly Tests</p>
            <p style={{ margin: '4px 0 0', fontSize: '1.625rem', fontWeight: 900, color: 'var(--text-primary)' }}>{totalTests}</p>
          </div>
        </div>

        <div style={{ background: 'var(--surface-0)', padding: '1.5rem', borderRadius: 16, border: '1px solid var(--surface-3)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(16,185,129,0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={22} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Student Compliance</p>
            <p style={{ margin: '4px 0 0', fontSize: '1.625rem', fontWeight: 900, color: '#10b981' }}>{overallRate}%</p>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{totalAttended} / {totalEnrolled} Attended</span>
          </div>
        </div>

        <div style={{ background: 'var(--surface-0)', padding: '1.5rem', borderRadius: 16, border: '1px solid var(--surface-3)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(139,92,246,0.1)', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Award size={22} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Average Score</p>
            <p style={{ margin: '4px 0 0', fontSize: '1.625rem', fontWeight: 900, color: 'var(--text-primary)' }}>{avgScoreAll}%</p>
          </div>
        </div>

        <div style={{ background: 'var(--surface-0)', padding: '1.5rem', borderRadius: 16, border: '1px solid var(--surface-3)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: totalFlags > 0 ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', color: totalFlags > 0 ? '#ef4444' : '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldAlert size={22} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Security Alerts</p>
            <p style={{ margin: '4px 0 0', fontSize: '1.625rem', fontWeight: 900, color: totalFlags > 0 ? '#ef4444' : 'var(--text-primary)' }}>{totalFlags}</p>
          </div>
        </div>
      </div>

      {/* ── Toolbar: Filter & Create ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: 280 }}>
          <div style={{ position: 'relative', width: 220 }}>
            <select
              value={courseFilter}
              onChange={e => setCourseFilter(e.target.value)}
              style={{ width: '100%', padding: '0.625rem 2.25rem 0.625rem 0.875rem', borderRadius: 10, background: 'var(--surface-2)', border: '1px solid var(--surface-3)', color: 'var(--text-primary)', outline: 'none', appearance: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}
            >
              <option value="all">All Assigned Courses</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
            <ChevronDown size={16} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }} />
          </div>

          <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
            <Search size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search weekly tests..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '0.625rem 1rem 0.625rem 2.5rem', borderRadius: 10, background: 'var(--surface-1)', border: '1px solid var(--surface-3)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.875rem' }}
            />
          </div>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--brand-500)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 12, fontWeight: 800, fontSize: '0.875rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(16,185,129,0.3)', transition: 'transform 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <Plus size={16} /> Create Weekly Test
        </button>
      </div>

      {/* ── Tests Grid ── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <RefreshCw size={28} className="spin" style={{ margin: '0 auto 12px' }} />
          <p>Loading weekly assessments...</p>
        </div>
      ) : filteredExams.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--surface-0)', borderRadius: 20, border: '1px dashed var(--surface-3)' }}>
          <Calendar size={44} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px' }}>No Weekly Tests Found</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0 0 1.5rem', maxWidth: 440, marginLeft: 'auto', marginRight: 'auto' }}>
            Enrolled students are required to attend weekly assessments. Create the first weekly test for your course modules.
          </p>
          <button
            onClick={() => setIsCreateOpen(true)}
            style={{ background: 'var(--brand-500)', color: 'white', border: 'none', padding: '10px 22px', borderRadius: 12, fontWeight: 800, fontSize: '0.875rem', cursor: 'pointer' }}
          >
            <Plus size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} /> Create Test Now
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {filteredExams.map(exam => {
            const compRate = exam.completion_rate || 0;
            return (
              <div
                key={exam.id}
                style={{ background: 'var(--surface-0)', borderRadius: 20, border: '1px solid var(--surface-3)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', boxShadow: '0 4px 16px rgba(0,0,0,0.03)', transition: 'all 0.2s' }}
              >
                {/* Header Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: '0.6875rem', fontWeight: 900, textTransform: 'uppercase', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', padding: '3px 8px', borderRadius: 6, letterSpacing: '0.05em' }}>
                        Week {exam.week_number}
                      </span>
                      <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        {exam.course_code || 'COURSE'}
                      </span>
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.0625rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                      {exam.title}
                    </h3>
                    <p style={{ margin: '4px 0 0', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      {exam.course_title}
                    </p>
                  </div>

                  {exam.proctoring_enabled && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '4px 8px', borderRadius: 999, fontSize: '0.6875rem', fontWeight: 800, flexShrink: 0 }}>
                      <ShieldAlert size={12} /> Proctored
                    </span>
                  )}
                </div>

                {/* Exam Details Badges */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  <span style={{ background: 'var(--surface-1)', padding: '4px 10px', borderRadius: 8, fontWeight: 700 }}>
                    ⏱️ {exam.duration_minutes} Mins
                  </span>
                  <span style={{ background: 'var(--surface-1)', padding: '4px 10px', borderRadius: 8, fontWeight: 700 }}>
                    📝 {exam.question_count} Questions
                  </span>
                  <span style={{ background: 'var(--surface-1)', padding: '4px 10px', borderRadius: 8, fontWeight: 700 }}>
                    🏆 {exam.total_marks} Marks
                  </span>
                  {exam.flagged_count > 0 && (
                    <span style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '4px 10px', borderRadius: 8, fontWeight: 800 }}>
                      🚨 {exam.flagged_count} Flagged
                    </span>
                  )}
                </div>

                {/* Student Attendance & Compliance Bar */}
                <div style={{ background: 'var(--surface-1)', padding: '1rem', borderRadius: 14, border: '1px solid var(--surface-2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)' }}>
                      Student Attendance Roster
                    </span>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 900, color: compRate >= 80 ? '#10b981' : compRate >= 50 ? '#f59e0b' : '#ef4444' }}>
                      {exam.attended_count} / {exam.total_enrolled} ({compRate}%)
                    </span>
                  </div>

                  <div style={{ width: '100%', height: 7, background: 'var(--surface-3)', borderRadius: 999, overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${Math.min(100, compRate)}%`,
                        height: '100%',
                        background: compRate >= 80 ? 'linear-gradient(90deg, #10b981, #059669)' : compRate >= 50 ? 'linear-gradient(90deg, #f59e0b, #d97706)' : 'linear-gradient(90deg, #ef4444, #dc2626)',
                        borderRadius: 999,
                        transition: 'width 0.4s ease'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                    <span>Pending: <strong style={{ color: 'var(--text-primary)' }}>{exam.pending_count}</strong></span>
                    <span>Avg Score: <strong style={{ color: 'var(--text-primary)' }}>{exam.average_score}%</strong></span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto' }}>
                  <button
                    onClick={() => setRosterExam(exam)}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 14px', borderRadius: 10, background: 'var(--surface-2)', border: '1px solid var(--surface-3)', color: 'var(--text-primary)', fontWeight: 800, fontSize: '0.8125rem', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-3)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-2)'}
                  >
                    <Users size={15} /> View Attendance Roster
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Create Weekly Test Modal ── */}
      {isCreateOpen && (
        <CreateWeeklyTestModal
          courses={courses}
          onClose={() => setIsCreateOpen(false)}
          onSuccess={() => { setIsCreateOpen(false); fetchExams(); }}
        />
      )}

      {/* ── Student Attendance Roster Modal ── */}
      {rosterExam && (
        <StudentRosterModal
          exam={rosterExam}
          onClose={() => setRosterExam(null)}
        />
      )}
    </div>
  );
}

// ── Modal: Create Weekly Assessment ───────────────────────────────────────
function CreateWeeklyTestModal({ courses, onClose, onSuccess }) {
  const [courseId, setCourseId] = useState(courses[0]?.id || '');
  const [weekNumber, setWeekNumber] = useState(1);
  const [title, setTitle] = useState('Week 1: Fundamentals Assessment');
  const [description, setDescription] = useState('Mandatory weekly evaluation covering module core concepts and applications.');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [proctoringEnabled, setProctoringEnabled] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [questions, setQuestions] = useState([
    {
      question: 'Which of the following best describes the primary objective of this module?',
      options: ['Optimizing data throughput', 'Encrypting local storage', 'Managing cloud instances', 'Standardizing schema types'],
      correct_answer: 'A',
      marks: 5
    },
    {
      question: 'What is the theoretical latency impact of sliding window flow control?',
      options: ['Zero delay', 'Bounded round-trip time (RTT)', 'Unbounded linear growth', 'Random distribution'],
      correct_answer: 'B',
      marks: 5
    }
  ]);

  const handleWeekChange = (w) => {
    setWeekNumber(w);
    const selectedC = courses.find(c => String(c.id) === String(courseId));
    const courseName = selectedC ? selectedC.title : 'Course';
    setTitle(`Week ${w} Assessment: ${courseName.split(' ')[0]} Mastery`);
  };

  const handleAddQuestion = () => {
    setQuestions(prev => [
      ...prev,
      {
        question: `Question ${prev.length + 1}: Enter assessment prompt here...`,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correct_answer: 'A',
        marks: 5
      }
    ]);
  };

  const handleRemoveQuestion = (idx) => {
    if (questions.length <= 1) {
      toast.error('Assessment must have at least one question');
      return;
    }
    setQuestions(prev => prev.filter((_, i) => i !== idx));
  };

  const handleQuestionChange = (idx, field, value) => {
    setQuestions(prev => prev.map((q, i) => i === idx ? { ...q, [field]: value } : q));
  };

  const handleOptionChange = (qIdx, optIdx, val) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qIdx) return q;
      const nextOpts = [...q.options];
      nextOpts[optIdx] = val;
      return { ...q, options: nextOpts };
    }));
  };

  const totalMarks = questions.reduce((sum, q) => sum + (parseInt(q.marks) || 0), 0);

  const handleAutoPopulate = () => {
    const selectedC = courses.find(c => String(c.id) === String(courseId));
    const cName = selectedC ? selectedC.title : 'Computer Systems';
    setTitle(`Week ${weekNumber} Assessment: ${cName} Core Verification`);
    setQuestions([
      {
        question: `In the context of ${cName}, which layer is responsible for error-free end-to-end transmission?`,
        options: ['Transport Layer', 'Physical Layer', 'Data Link Layer', 'Session Layer'],
        correct_answer: 'A',
        marks: 5
      },
      {
        question: 'What mechanism prevents buffer overflow on receiving endpoints during peak bandwidth usage?',
        options: ['Sliding Window Flow Control', 'CRC Checksumming', 'DNS Resolution', 'Token Bucket Police'],
        correct_answer: 'A',
        marks: 5
      },
      {
        question: 'Which metric directly quantifies packet transfer variance across jitter-sensitive links?',
        options: ['Inter-packet Delay Variation (IPDV)', 'Mean Opinion Score (MOS)', 'Bandwidth-Delay Product', 'Maximum Transmission Unit'],
        correct_answer: 'A',
        marks: 5
      }
    ]);
    toast.success('Generated weekly questions from syllabus curriculum!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!courseId) {
      toast.error('Please select a course');
      return;
    }
    if (!title.trim()) {
      toast.error('Please enter assessment title');
      return;
    }
    if (questions.length === 0) {
      toast.error('Please include at least one question');
      return;
    }

    try {
      setSubmitting(true);
      await academicAPI.createWeeklyExam({
        course_id: parseInt(courseId),
        week_number: parseInt(weekNumber),
        title: title.trim(),
        description: description.trim(),
        duration_minutes: parseInt(durationMinutes) || 30,
        total_marks: totalMarks,
        proctoring_enabled: Boolean(proctoringEnabled),
        questions
      });
      toast.success('Weekly Assessment published successfully!');
      onSuccess();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || 'Failed to create weekly assessment');
    } finally {
      setSubmitting(false);
    }
  };

  const modalContent = (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', overflowY: 'auto' }}>
      <div style={{ width: '100%', maxWidth: 780, maxHeight: '90vh', background: 'var(--surface-0)', borderRadius: 24, border: '1px solid var(--surface-3)', boxShadow: '0 24px 60px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--surface-3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-1)' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)' }}>
              Create Weekly Assessment
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Mandatory test for enrolled students with automated attendance & proctoring.
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Row 1: Course & Week */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>Target Course *</label>
              <select
                value={courseId}
                onChange={e => { setCourseId(e.target.value); }}
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 10, background: 'var(--surface-1)', border: '1px solid var(--surface-3)', color: 'var(--text-primary)', outline: 'none', fontWeight: 600, fontSize: '0.875rem' }}
                required
              >
                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>Week # *</label>
              <select
                value={weekNumber}
                onChange={e => handleWeekChange(parseInt(e.target.value))}
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 10, background: 'var(--surface-1)', border: '1px solid var(--surface-3)', color: 'var(--text-primary)', outline: 'none', fontWeight: 700, fontSize: '0.875rem' }}
              >
                {Array.from({ length: 16 }, (_, i) => i + 1).map(w => (
                  <option key={w} value={w}>Week {w}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Title */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>Assessment Title *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Week 2: TCP Flow Control & Congestion Assessment"
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 10, background: 'var(--surface-1)', border: '1px solid var(--surface-3)', color: 'var(--text-primary)', outline: 'none', fontWeight: 700, fontSize: '0.9375rem' }}
              required
            />
          </div>

          {/* Row 3: Description */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>Description & Instructions</label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Assessment guidelines, coverage topics, and instructions..."
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 10, background: 'var(--surface-1)', border: '1px solid var(--surface-3)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.875rem', resize: 'vertical' }}
            />
          </div>

          {/* Row 4: Config Settings */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', background: 'var(--surface-1)', padding: '1rem 1.25rem', borderRadius: 14, border: '1px solid var(--surface-2)' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: 4 }}>Duration (Minutes)</label>
              <input
                type="number"
                min={5}
                max={180}
                value={durationMinutes}
                onChange={e => setDurationMinutes(e.target.value)}
                style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 8, background: 'var(--surface-0)', border: '1px solid var(--surface-3)', color: 'var(--text-primary)', fontWeight: 700 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: 4 }}>Total Marks</label>
              <div style={{ padding: '0.5rem 0.75rem', background: 'var(--surface-0)', borderRadius: 8, border: '1px solid var(--surface-3)', fontWeight: 800, color: 'var(--text-primary)' }}>
                {totalMarks} Marks
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 700, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                <input
                  type="checkbox"
                  checked={proctoringEnabled}
                  onChange={e => setProctoringEnabled(e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: '#10b981' }}
                />
                AI Proctoring Active
              </label>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginLeft: 24 }}>Tab lock & gaze sensors</span>
            </div>
          </div>

          {/* Question Builder */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                  Questions ({questions.length})
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Multiple choice questions with automated grading</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={handleAutoPopulate}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: 'rgba(139,92,246,0.1)', color: '#8b5cf6', border: '1px solid rgba(139,92,246,0.2)', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}
                >
                  <Sparkles size={13} /> Quick Curriculum Questions
                </button>
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: 'var(--surface-2)', border: '1px solid var(--surface-3)', color: 'var(--text-primary)', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}
                >
                  <Plus size={13} /> Add Question
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {questions.map((q, qIdx) => (
                <div key={qIdx} style={{ background: 'var(--surface-1)', borderRadius: 14, border: '1px solid var(--surface-3)', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--brand-600)', background: 'var(--brand-50)', padding: '2px 8px', borderRadius: 6 }}>
                      Q{qIdx + 1}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>Marks:</span>
                        <input
                          type="number"
                          min={1}
                          max={50}
                          value={q.marks}
                          onChange={e => handleQuestionChange(qIdx, 'marks', e.target.value)}
                          style={{ width: 48, padding: '3px 6px', borderRadius: 6, border: '1px solid var(--surface-3)', background: 'var(--surface-0)', fontSize: '0.75rem', fontWeight: 800, textAlign: 'center' }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(qIdx)}
                        style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 4 }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <input
                    type="text"
                    value={q.question}
                    onChange={e => handleQuestionChange(qIdx, 'question', e.target.value)}
                    placeholder="Enter question prompt..."
                    style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: 8, background: 'var(--surface-0)', border: '1px solid var(--surface-3)', color: 'var(--text-primary)', outline: 'none', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.75rem' }}
                    required
                  />

                  {/* Options */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    {['A', 'B', 'C', 'D'].map((letter, optIdx) => (
                      <div key={letter} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 22, height: 22, borderRadius: 6, background: q.correct_answer === letter ? '#10b981' : 'var(--surface-3)', color: q.correct_answer === letter ? 'white' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6875rem', fontWeight: 900, flexShrink: 0 }}>
                          {letter}
                        </span>
                        <input
                          type="text"
                          value={q.options[optIdx] || ''}
                          onChange={e => handleOptionChange(qIdx, optIdx, e.target.value)}
                          placeholder={`Option ${letter}`}
                          style={{ flex: 1, padding: '0.45rem 0.75rem', borderRadius: 6, background: 'var(--surface-0)', border: '1px solid var(--surface-3)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                          required
                        />
                      </div>
                    ))}
                  </div>

                  {/* Correct Option Selector */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)' }}>Correct Answer:</span>
                    {['A', 'B', 'C', 'D'].map(letter => (
                      <label key={letter} style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 800, color: q.correct_answer === letter ? '#10b981' : 'var(--text-muted)' }}>
                        <input
                          type="radio"
                          name={`correct_${qIdx}`}
                          value={letter}
                          checked={q.correct_answer === letter}
                          onChange={() => handleQuestionChange(qIdx, 'correct_answer', letter)}
                          style={{ accentColor: '#10b981' }}
                        />
                        {letter}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Submit */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid var(--surface-3)', paddingTop: '1.25rem', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: '10px 20px', borderRadius: 10, background: 'transparent', border: '1px solid var(--surface-3)', color: 'var(--text-secondary)', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{ padding: '10px 24px', borderRadius: 10, background: 'var(--brand-500)', color: 'white', border: 'none', fontWeight: 800, fontSize: '0.875rem', cursor: submitting ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(16,185,129,0.35)', opacity: submitting ? 0.7 : 1 }}
            >
              {submitting ? 'Publishing...' : 'Publish Assessment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
}

// ── Modal: Student Attendance Roster ───────────────────────────────────────
function StudentRosterModal({ exam, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'attended', 'pending'
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchRoster = async () => {
      try {
        setLoading(true);
        const res = await academicAPI.getWeeklyExamRoster(exam.id);
        setData(res.data);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load attendance roster');
      } finally {
        setLoading(false);
      }
    };
    fetchRoster();
  }, [exam.id]);

  const roster = data?.roster || [];
  const filteredRoster = roster.filter(s => {
    if (filter === 'attended' && s.status !== 'attended') return false;
    if (filter === 'pending' && s.status !== 'pending') return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return s.student_name?.toLowerCase().includes(q) || s.student_email?.toLowerCase().includes(q);
    }
    return true;
  });

  const stats = data?.stats || { total_enrolled: 0, attended_count: 0, pending_count: 0, completion_rate: 0, avg_score: 0 };

  const modalContent = (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', overflowY: 'auto' }}>
      <div style={{ width: '100%', maxWidth: 860, maxHeight: '90vh', background: 'var(--surface-0)', borderRadius: 24, border: '1px solid var(--surface-3)', boxShadow: '0 24px 60px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--surface-3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-1)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: '0.6875rem', fontWeight: 900, textTransform: 'uppercase', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', padding: '2px 8px', borderRadius: 6 }}>
                Week {exam.week_number}
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                {exam.course_title}
              </span>
            </div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)' }}>
              {exam.title} — Student Roster
            </h2>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Stats Row */}
        <div style={{ padding: '1rem 2rem', background: 'var(--surface-0)', borderBottom: '1px solid var(--surface-2)', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Enrolled Students</span>
            <p style={{ margin: '2px 0 0', fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)' }}>{stats.total_enrolled}</p>
          </div>
          <div>
            <span style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Attended</span>
            <p style={{ margin: '2px 0 0', fontSize: '1.25rem', fontWeight: 900, color: '#10b981' }}>{stats.attended_count}</p>
          </div>
          <div>
            <span style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Pending</span>
            <p style={{ margin: '2px 0 0', fontSize: '1.25rem', fontWeight: 900, color: '#f59e0b' }}>{stats.pending_count}</p>
          </div>
          <div>
            <span style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Compliance Rate</span>
            <p style={{ margin: '2px 0 0', fontSize: '1.25rem', fontWeight: 900, color: stats.completion_rate >= 80 ? '#10b981' : '#f59e0b' }}>{stats.completion_rate}%</p>
          </div>
        </div>

        {/* Filter & Search */}
        <div style={{ padding: '0.875rem 2rem', background: 'var(--surface-1)', borderBottom: '1px solid var(--surface-3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {[
              { id: 'all', label: `All (${roster.length})` },
              { id: 'attended', label: `Attended (${stats.attended_count})` },
              { id: 'pending', label: `Pending (${stats.pending_count})` },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: filter === tab.id ? 'var(--text-primary)' : 'var(--surface-2)', color: filter === tab.id ? 'white' : 'var(--text-secondary)', fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer' }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative', width: 240 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Filter student..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '5px 10px 5px 30px', borderRadius: 8, background: 'var(--surface-0)', border: '1px solid var(--surface-3)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.8125rem' }}
            />
          </div>
        </div>

        {/* Table Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 2rem' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <RefreshCw size={24} className="spin" style={{ margin: '0 auto 8px' }} />
              <p style={{ fontSize: '0.875rem' }}>Loading roster records...</p>
            </div>
          ) : filteredRoster.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <p style={{ margin: 0, fontWeight: 700 }}>No students found matching current filter.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--surface-3)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Student</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Attendance Status</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Score</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Cheat Risk</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Submitted At</th>
                </tr>
              </thead>
              <tbody>
                {filteredRoster.map(s => {
                  const isAttended = s.status === 'attended';
                  return (
                    <tr key={s.student_id} style={{ borderBottom: '1px solid var(--surface-2)' }}>
                      <td style={{ padding: '0.875rem 0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: isAttended ? 'rgba(16,185,129,0.1)' : 'var(--surface-2)', color: isAttended ? '#10b981' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8125rem' }}>
                            {s.student_name ? s.student_name[0].toUpperCase() : 'S'}
                          </div>
                          <div>
                            <p style={{ margin: 0, fontWeight: 800, color: 'var(--text-primary)' }}>{s.student_name}</p>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.student_email}</span>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '0.875rem 0.5rem' }}>
                        {isAttended ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '4px 10px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 800 }}>
                            <CheckCircle2 size={13} /> Attended
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(245,158,11,0.1)', color: '#f59e0b', padding: '4px 10px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 800 }}>
                            <Clock size={13} /> Pending Attendance
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '0.875rem 0.5rem' }}>
                        {isAttended ? (
                          <div>
                            <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{s.score} / {exam.total_marks}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 6 }}>({s.percentage}%)</span>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>

                      <td style={{ padding: '0.875rem 0.5rem' }}>
                        {isAttended ? (
                          s.cheat_risk_score > 30 ? (
                            <span style={{ color: '#ef4444', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <ShieldAlert size={14} /> {s.cheat_risk_score}% Risk
                            </span>
                          ) : (
                            <span style={{ color: '#10b981', fontWeight: 700 }}>
                              {s.cheat_risk_score || 0}% (Clear)
                            </span>
                          )
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>

                      <td style={{ padding: '0.875rem 0.5rem', color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                        {s.submitted_at ? new Date(s.submitted_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Not submitted yet'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{ padding: '1rem 2rem', borderTop: '1px solid var(--surface-3)', display: 'flex', justifyContent: 'flex-end', background: 'var(--surface-1)' }}>
          <button
            onClick={onClose}
            style={{ padding: '8px 20px', borderRadius: 8, background: 'var(--text-primary)', color: 'white', border: 'none', fontWeight: 800, fontSize: '0.875rem', cursor: 'pointer' }}
          >
            Close Roster
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
}

// ── Main Hub ──────────────────────────────────────────────────────────────
export default function TeacherAssessmentHub() {
  const [activeTab, setActiveTab] = useState('weekly');
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    coursesAPI.myCourses().then(res => setCourses(res.data)).catch(console.error);
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
              { id: 'weekly', label: 'Weekly Assessments' },
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
          {activeTab === 'weekly' && <WeeklyAssessmentsTab courses={courses} />}
          {activeTab === 'grading' && <GradingTab courses={courses} />}
          {activeTab === 'proctoring' && <ProctoringTab />}
        </div>

      </div>
    </div>
  );
}
