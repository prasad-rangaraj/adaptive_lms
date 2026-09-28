import { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, AlertCircle, Camera, Mic, Eye, Clock, ChevronLeft, ChevronRight, 
  Activity, BrainCircuit, Trophy, ArrowRight, ShieldAlert, CheckCircle2, FileText, Lock, 
  Flag, Cloud, CloudOff, RefreshCw, Calculator, Edit3, X, AlignLeft, Volume2, Wifi, Map, Sword,
  BookOpen, Play, GraduationCap, Layers, Target, Sparkles, ChevronDown, ChevronUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProctoring } from '../../hooks/useProctoring';
import { coursesAPI, cognitiveAPI, aiTutorAPI } from '../../services/api.service';
import PlacementAssessmentModal from './PlacementAssessmentModal';
import toast from 'react-hot-toast';

// ── Course Roadmap Modal ─────────────────────────────────────────────────────
function CourseRoadmapModal({ course, enrollment, onClose, onStartLearn }) {
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAssessment, setShowAssessment] = useState(false);
  const [expandedMod, setExpandedMod] = useState(0);

  useEffect(() => {
    coursesAPI.getModules(course.id).then(res => {
      setModules(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [course.id]);

  const isPending = enrollment?.learning_path === 'pending';
  const learningPath = enrollment?.learning_path || 'pending';
  const progress = enrollment?.progress_percentage || 0;

  const pathColors = { pending: '#f59e0b', basics: '#0891b2', intermediate: '#7c3aed', advanced: '#059669' };
  const pathLabels = { pending: '⏳ Assessment Pending', basics: '🌱 Foundation Path', intermediate: '🚀 Core Path', advanced: '⚡ Expert Path' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: 760, maxHeight: '90vh', background: 'var(--surface-0)', borderRadius: 24, border: '1px solid var(--surface-3)', boxShadow: '0 32px 80px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'slideUp 0.3s ease' }}>
        
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', padding: '2rem', position: 'relative', flexShrink: 0 }}>
          <button onClick={onClose} style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
            <X size={18} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Course Roadmap</span>
          </div>
          <h2 style={{ fontSize: '1.625rem', fontWeight: 900, color: 'white', letterSpacing: '-0.02em', marginBottom: '1rem', lineHeight: 1.2 }}>{course.title}</h2>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: pathColors[learningPath] + '33', border: `1px solid ${pathColors[learningPath]}66`, borderRadius: 999, padding: '4px 12px', fontSize: '0.8125rem', fontWeight: 800, color: 'white' }}>
              {pathLabels[learningPath]}
            </span>
            <span style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>{modules.length} modules</span>
          </div>
        </div>

        {/* Placement Assessment Banner */}
        {isPending && (
          <div style={{ background: 'linear-gradient(90deg, #fef3c7, #fffbeb)', borderBottom: '1px solid #fde68a', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#fde68a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, animation: 'breathe 2s ease-in-out infinite' }}>🎯</div>
              <div>
                <p style={{ fontSize: '0.875rem', fontWeight: 800, color: '#92400e', margin: 0 }}>Take Your Placement Assessment</p>
                <p style={{ fontSize: '0.75rem', color: '#b45309', margin: 0 }}>Unlock your personalised learning path — only 5 questions</p>
              </div>
            </div>
            <button
              onClick={() => setShowAssessment(true)}
              style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8, background: '#d97706', color: 'white', border: 'none', borderRadius: 12, padding: '10px 20px', fontWeight: 800, fontSize: '0.875rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(217,119,6,0.3)' }}
            >
              <Target size={15} /> Start Assessment
            </button>
          </div>
        )}

        {/* Roadmap Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2rem' }} className="hide-scrollbar">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading roadmap...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {modules.map((mod, modIdx) => {
                const isExpanded = expandedMod === modIdx;
                const isLocked = isPending && modIdx >= 2;
                const materials = mod.materials || [];
                return (
                  <div key={mod.id} style={{ background: isLocked ? 'var(--surface-1)' : 'var(--surface-0)', border: `1px solid ${isLocked ? 'var(--surface-3)' : 'var(--surface-3)'}`, borderRadius: 16, overflow: 'hidden', opacity: isLocked ? 0.6 : 1, transition: 'all 0.3s' }}>
                    {/* Module header */}
                    <div
                      onClick={() => !isLocked && setExpandedMod(isExpanded ? -1 : modIdx)}
                      style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', cursor: isLocked ? 'not-allowed' : 'pointer', userSelect: 'none' }}
                    >
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: isLocked ? 'var(--surface-2)' : 'var(--brand-50)', border: `2px solid ${isLocked ? 'var(--surface-3)' : 'var(--brand-200)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 900, fontSize: '0.875rem', color: isLocked ? 'var(--text-muted)' : 'var(--brand-600)' }}>
                        {isLocked ? <Lock size={16} /> : modIdx + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{mod.title}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, marginTop: 2 }}>{materials.length} materials{isLocked ? ' · 🔒 Complete assessment to unlock' : ''}</p>
                      </div>
                      {!isLocked && (
                        <>
                          <button
                            onClick={e => { e.stopPropagation(); navigate(`/student/course/${course.id}?module=${mod.id}`); onClose(); }}
                            style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6, background: 'var(--brand-500)', color: 'white', border: 'none', borderRadius: 10, padding: '7px 14px', fontWeight: 800, fontSize: '0.8125rem', cursor: 'pointer' }}
                          >
                            <Play size={13} /> Learn
                          </button>
                          {isExpanded ? <ChevronUp size={18} color="var(--text-muted)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
                        </>
                      )}
                    </div>

                    {/* Materials list */}
                    {isExpanded && materials.length > 0 && (
                      <div style={{ borderTop: '1px solid var(--surface-2)', background: 'var(--surface-1)' }}>
                        {materials.map((mat, mi) => {
                          const isYT = mat.material_type === 'youtube';
                          const isPDF = mat.material_type === 'pdf';
                          
                          // Check local storage for completion
                          let isDone = false;
                          try {
                            const stored = localStorage.getItem(`adaptive_completed_${course.id}`);
                            if (stored) {
                              isDone = JSON.parse(stored).includes(mat.id);
                            }
                          } catch (e) {}

                          return (
                            <div key={mat.id} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.875rem 1.25rem 0.875rem 4.5rem', borderBottom: mi < materials.length - 1 ? '1px solid var(--surface-2)' : 'none' }}>
                              <div style={{ width: 32, height: 32, borderRadius: 8, background: isDone ? '#10b981' : isYT ? '#fee2e2' : isPDF ? '#e0f2fe' : 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                {isDone ? <CheckCircle2 size={16} color="white" /> : isYT ? <span style={{ fontSize: '0.875rem' }}>▶️</span> : isPDF ? <span style={{ fontSize: '0.875rem' }}>📄</span> : <Play size={14} color="var(--text-muted)" />}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: isDone ? 'line-through' : 'none' }}>{mat.title}</p>
                                <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{mat.material_type}</p>
                              </div>
                              {isYT && (
                                <a href={mat.s3_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#dc2626', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
                                  YouTube ↗
                                </a>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {isExpanded && materials.length === 0 && (
                      <div style={{ padding: '1rem 1.25rem 1rem 4.5rem', color: 'var(--text-muted)', fontSize: '0.875rem', borderTop: '1px solid var(--surface-2)' }}>No materials yet</div>
                    )}
                  </div>
                );
              })}

              {/* Assessment checkpoint node */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.5rem 0 0.5rem', gap: '0.75rem' }}>
                <div style={{ width: 2, height: 40, background: 'linear-gradient(to bottom, var(--surface-3), #fbbf24)' }} />
                <div style={{ background: isPending ? 'linear-gradient(135deg, #fef3c7, #fde68a)' : 'linear-gradient(135deg, #d1fae5, #a7f3d0)', border: `2px solid ${isPending ? '#fbbf24' : '#10b981'}`, borderRadius: 16, padding: '1.25rem 1.5rem', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: '1.75rem' }}>{isPending ? '🎯' : '✅'}</span>
                    <div>
                      <p style={{ fontWeight: 900, fontSize: '0.9375rem', color: isPending ? '#92400e' : '#065f46', margin: 0 }}>Placement Assessment</p>
                      <p style={{ fontSize: '0.75rem', color: isPending ? '#b45309' : '#059669', margin: 0 }}>{isPending ? 'Not yet taken — unlock your path' : `Completed · Path: ${pathLabels[learningPath]}`}</p>
                    </div>
                  </div>
                  {isPending && (
                    <button onClick={() => setShowAssessment(true)} style={{ background: '#d97706', color: 'white', border: 'none', borderRadius: 10, padding: '8px 16px', fontWeight: 800, fontSize: '0.8125rem', cursor: 'pointer', flexShrink: 0 }}>Take Now</button>
                  )}
                </div>
              </div>

              {/* Final Assessment node */}
              {progress >= 100 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 0 0.5rem', gap: '0.75rem' }}>
                  <div style={{ width: 2, height: 40, background: 'linear-gradient(to bottom, var(--surface-3), #3b82f6)' }} />
                  <div style={{ background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', border: '2px solid #3b82f6', borderRadius: 16, padding: '1.25rem 1.5rem', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: '1.75rem' }}>🏆</span>
                      <div>
                        <p style={{ fontWeight: 900, fontSize: '0.9375rem', color: '#1e40af', margin: 0 }}>Final Certification Exam</p>
                        <p style={{ fontSize: '0.75rem', color: '#2563eb', margin: 0 }}>You've completed all modules! Take the final exam to get certified.</p>
                      </div>
                    </div>
                    <button onClick={onStartLearn} style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: 10, padding: '8px 16px', fontWeight: 800, fontSize: '0.8125rem', cursor: 'pointer', flexShrink: 0 }}>Take Exam</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '1.25rem 2rem', borderTop: '1px solid var(--surface-3)', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexShrink: 0 }}>
          <button onClick={onClose} style={{ padding: '10px 20px', background: 'var(--surface-1)', border: '1px solid var(--surface-3)', borderRadius: 12, fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>Close</button>
          <button
            onClick={() => { navigate(`/student/course/${course.id}`); onClose(); }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: 'var(--brand-500)', color: 'white', border: 'none', borderRadius: 12, fontWeight: 800, fontSize: '0.875rem', cursor: 'pointer' }}
          >
            <Play size={15} /> Open Learning Canvas
          </button>
        </div>
      </div>

      {showAssessment && (
        <PlacementAssessmentModal
          course={course}
          startAtPhase={1}
          onPlacementComplete={(path) => {
            setShowAssessment(false);
            toast.success(`Learning path set: ${path}!`);
            onClose();
          }}
          onClose={() => setShowAssessment(false)}
        />
      )}

      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(32px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes breathe { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.06); } }
      `}</style>
    </div>
  );
}

export default function StudentExamArena() {
  const navigate = useNavigate();
  // State: 'list' -> 'lobby' -> 'active' -> 'submitted'
  const [examState, setExamState] = useState('list'); 
  const [selectedExam, setSelectedExam] = useState(null);

  // Enrolled courses
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [enrollments, setEnrollments] = useState({});
  const [selectedCourse, setSelectedCourse] = useState(null); // for roadmap modal
  
  // Exam progress state
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(0);
  const [syncState, setSyncState] = useState('saved'); // 'saved', 'syncing', 'error'
  
  // Security state
  const [focusWarning, setFocusWarning] = useState(false);
  const [keyWarning, setKeyWarning] = useState('');
  const [fsWarning, setFsWarning] = useState(false);

  // Violation tracking
  const MAX_VIOLATIONS = 5;
  const [violationCount, setViolationCount] = useState(0);
  const [activeBanner, setActiveBanner] = useState(null); // { type, countdown }
  const violationTimerRef = useRef(null);
  const prevViolationRef = useRef(null);
  
  // Tools state
  const [showScratchpad, setShowScratchpad] = useState(false);
  const [scratchpadText, setScratchpadText] = useState('');
  const [showCalculator, setShowCalculator] = useState(false);
  
  // Lobby state
  const [hardwareChecked, setHardwareChecked] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // References
  const videoRef = useRef(null);
  const hudVideoRef = useRef(null);
  const streamRef = useRef(null);
  const [mediaStream, setMediaStream] = useState(null);
  
  const proctoring = useProctoring();

  // Load enrolled courses + their enrollment status
  useEffect(() => {
    coursesAPI.getEnrolledCourses().then(res => {
      setEnrolledCourses(res.data || []);
      // For each, fetch enrollment status to get learning_path + progress
      (res.data || []).forEach(course => {
        coursesAPI.getEnrollmentStatus(course.id).then(er => {
          setEnrollments(prev => ({ ...prev, [course.id]: er.data }));
        }).catch(() => {});
      });
    }).catch(() => {});
  }, []);

  // YOLO Violation: count, 5s countdown, auto-terminate at 5
  useEffect(() => {
    const violation = proctoring.lastViolation;
    // Only react when a NEW violation appears (not on clear)
    if (violation && violation !== prevViolationRef.current) {
      prevViolationRef.current = violation;

      setViolationCount(prev => {
        const newCount = prev + 1;
        // Start 5-second countdown banner
        let countdown = 5;
        setActiveBanner({ type: violation, countdown });

        // Clear any existing timer
        if (violationTimerRef.current) clearInterval(violationTimerRef.current);

        violationTimerRef.current = setInterval(() => {
          countdown -= 1;
          setActiveBanner(b => b ? { ...b, countdown } : null);
          if (countdown <= 0) {
            clearInterval(violationTimerRef.current);
            setActiveBanner(null);
          }
        }, 1000);

        // Auto-terminate if max violations reached
        if (newCount >= MAX_VIOLATIONS) {
          clearInterval(violationTimerRef.current);
          setActiveBanner({ type: 'terminated', countdown: 0 });
          setTimeout(async () => {
            try { if (document.fullscreenElement) await document.exitFullscreen(); } catch (e) {}
            setExamState('submitted');
          }, 2000);
        }

        return newCount;
      });
    }

    if (!violation) {
      prevViolationRef.current = null;
    }
  }, [proctoring.lastViolation]);

  // Timer logic
  useEffect(() => {
    if (examState !== 'active') return;
    const t = setInterval(() => setTimeLeft(s => Math.max(s - 1, 0)), 1000);
    return () => clearInterval(t);
  }, [examState]);

  // Focus tracking
  useEffect(() => {
    if (examState !== 'active') return;
    const onBlur  = () => setFocusWarning(true);
    const onFocus = () => setFocusWarning(false);
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);
    return () => { window.removeEventListener('blur', onBlur); window.removeEventListener('focus', onFocus); };
  }, [examState]);

  // Key Blocker
  useEffect(() => {
    if (examState !== 'active') return;
    const onKeyDown = (e) => {
      // Block F1-F12
      if (e.key.match(/^F(1[0-2]|[1-9])$/)) {
        e.preventDefault();
        setKeyWarning(`Action Blocked: ${e.key} key is not allowed.`);
        setTimeout(() => setKeyWarning(''), 5000);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [examState]);

  // Fullscreen Exit Warning
  useEffect(() => {
    if (examState !== 'active') return;
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) setFsWarning(true);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, [examState]);

  // Webcam access & Proctoring Lifecycle
  useEffect(() => {
    if (examState === 'list' || examState === 'submitted') {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        setMediaStream(null);
        setHardwareChecked(false);
      }
      proctoring.stopTracking();
    } else if (!mediaStream) {
      navigator.mediaDevices?.getUserMedia({ video: true })
        .then(stream => {
          streamRef.current = stream;
          setMediaStream(stream);
          setHardwareChecked(true);
        })
        .catch(err => {
          console.log('Webcam access denied.', err);
          setHardwareChecked(true); 
        });
    }
  }, [examState, mediaStream, proctoring.stopTracking]);

  // Global Unmount cleanup for webcam
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Start proctoring when active
  useEffect(() => {
    if (examState === 'active' && mediaStream && hudVideoRef.current) {
      if (hudVideoRef.current.srcObject !== mediaStream) {
        hudVideoRef.current.srcObject = mediaStream;
      }
      proctoring.startTracking(hudVideoRef.current);
    }
  }, [examState, mediaStream, proctoring.startTracking]);

  // Mock Cloud Sync
  const handleAnswerChange = (val) => {
    setAnswers(prev => ({ ...prev, [current]: val }));
    setSyncState('syncing');
    setTimeout(() => setSyncState('saved'), 800);
  };

  const toggleFlag = () => {
    setFlagged(prev => {
      const next = new Set(prev);
      if (next.has(current)) next.delete(current);
      else next.add(current);
      return next;
    });
  };

  const startLobby = async (exam) => {
    try { if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen(); } catch (err) {}
    setSelectedExam(exam);
    setTimeLeft(45 * 60);
    setExamState('lobby');
    setQuestions([]); // Clear previous
    aiTutorAPI.generateQuiz(exam.id, exam.title + " comprehensive concepts", "medium", 5)
      .then(res => setQuestions(res.data.quiz || []))
      .catch(err => {
        console.error(err);
        toast.error("Failed to generate exam questions.");
      });
  };

  const exitToList = async () => {
    try { if (document.fullscreenElement && document.exitFullscreen) await document.exitFullscreen(); } catch (err) {}
    setExamState('list');
  };

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const ss = String(timeLeft % 60).padStart(2, '0');
  const isLow = timeLeft < 10 * 60;
  const q = questions[current];
  const answeredCount = Object.keys(answers).length;
  const isFullScreen = examState !== 'list';

  // Gamified Roadmap Math
  const getRoadmapPath = () => {
    let p = `M 80 50`;
    for(let i = 1; i < questions.length; i++) {
       const prevX = (i - 1) % 2 === 0 ? 80 : 180;
       const currX = i % 2 === 0 ? 80 : 180;
       const prevY = (i - 1) * 110 + 50;
       const currY = i * 110 + 50;
       p += ` C ${prevX} ${prevY + 55}, ${currX} ${currY - 55}, ${currX} ${currY}`;
    }
    return p;
  };
  const roadmapPath = getRoadmapPath();
  const roadmapHeight = questions.length * 110 + 40;

  // Basic mock score calculation
  const score = Object.keys(answers).reduce((acc, key) => {
    const q = questions[key];
    if (q.type === 'mcq') return acc + (answers[key] === q.correct ? 1 : 0);
    if (q.type === 'text') return acc + 1; // Assuming manual review required, giving point for demo
    return acc;
  }, 0);

  return (
    <div style={isFullScreen ? { 
      position: 'fixed', inset: 0, background: 'var(--surface-1)', zIndex: 100, display: 'flex', flexDirection: 'column', fontFamily: 'inherit' 
    } : { 
      flex: 1, display: 'flex', flexDirection: 'column', fontFamily: 'inherit', minHeight: '100%', position: 'relative'
    }}>

      {/* ── Focus & Security Warnings ── */}
      {focusWarning && examState === 'active' && (
        <div style={{ background: '#ef4444', color: 'white', padding: '0.625rem 2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 700, animation: 'slideDown 0.3s ease' }}>
          <AlertCircle size={16} /> Focus Warning: You navigated away. This has been recorded.
        </div>
      )}
      {keyWarning && examState === 'active' && (
        <div style={{ background: '#f59e0b', color: 'white', padding: '0.625rem 2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 700, animation: 'slideDown 0.3s ease' }}>
          <AlertCircle size={16} /> {keyWarning}
        </div>
      )}
      {fsWarning && examState === 'active' && (
        <div style={{ background: '#ef4444', color: 'white', padding: '0.625rem 2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 700, animation: 'slideDown 0.3s ease' }}>
          <ShieldAlert size={16} /> Security Warning: Fullscreen mode was exited during the exam!
        </div>
      )}

      {/* ── Top Status Bar ── */}
      {isFullScreen && (
        <div style={{ background: 'var(--surface-0)', borderBottom: '1px solid var(--surface-3)', padding: '0.75rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--brand-500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={18} color="white" />
              </div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                {selectedExam?.title}
              </h2>
            </div>
            
            {(examState === 'active' || examState === 'lobby') && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '1rem', paddingLeft: '1.5rem', borderLeft: '1px solid var(--surface-3)' }}>
                {[
                  { Icon: Camera, label: 'Webcam', active: hardwareChecked },
                  { Icon: Mic,    label: 'Audio', active: true },
                  { Icon: Eye,    label: 'Screen', active: true },
                ].map(({ Icon, label, active }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 8px', background: active ? 'rgba(16,185,129,0.1)' : 'var(--surface-2)', borderRadius: 6, transition: 'background 0.3s' }}>
                    <Icon size={13} color={active ? '#10b981' : 'var(--text-muted)'} />
                    <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: active ? '#10b981' : 'var(--text-muted)', textTransform: 'uppercase' }}>{label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            {examState === 'active' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: syncState === 'saved' ? '#10b981' : 'var(--text-muted)' }}>
                   {syncState === 'saved' ? <Cloud size={16} /> : <RefreshCw size={16} className="spin" />}
                   <span style={{ fontSize: '0.8125rem', fontWeight: 700 }}>{syncState === 'saved' ? 'Saved to Cloud' : 'Syncing...'}</span>
                </div>
                <div style={{ width: 1, height: 24, background: 'var(--surface-3)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: isLow ? 'rgba(239,68,68,0.1)' : 'var(--surface-2)', borderRadius: 8 }}>
                  <Clock size={16} color={isLow ? '#ef4444' : 'var(--text-primary)'} />
                  <span style={{ fontSize: '1.125rem', fontWeight: 900, color: isLow ? '#ef4444' : 'var(--text-primary)', letterSpacing: '0.04em', fontVariantNumeric: 'tabular-nums' }}>
                    {mm}:{ss}
                  </span>
                </div>
              </>
            )}
            {examState === 'lobby' && <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-secondary)' }}>Pre-Exam Verification</span>}
            {examState === 'submitted' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#10b981' }}>
                <ShieldCheck size={18} />
                <span style={{ fontSize: '0.875rem', fontWeight: 800 }}>Exam Secured & Submitted</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Body ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>

        {/* ── LIST STATE: Immersive Level Select ── */}
        {examState === 'list' && (
          <div style={{ flex: 1, overflowY: 'auto', background: 'var(--surface-1)', position: 'relative' }} className="hide-scrollbar">

            {/* ── My Courses Section ── */}
            <div style={{ position: 'relative', zIndex: 1, padding: '2.5rem 3rem 1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.25rem' }}>
                <BookOpen size={18} color="var(--brand-500)" />
                <h2 style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>Available Exams</h2>
              </div>

              {(() => {
                const examCourses = enrolledCourses.filter(c => {
                  const enr = enrollments[c.id];
                  if (!enr) return false;
                  return enr.learning_path === 'pending' || (enr.progress_percentage && enr.progress_percentage >= 100);
                });

                if (examCourses.length === 0) {
                  return (
                    <div style={{ background: 'var(--surface-0)', border: '1px dashed var(--surface-3)', borderRadius: 20, padding: '3rem', textAlign: 'center', maxWidth: 600, margin: '0 auto' }}>
                      <Trophy size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
                      <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>No exams available right now</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>Complete your course modules to unlock final certification exams!</p>
                      <button onClick={() => navigate('/student')} style={{ marginTop: '1.5rem', background: 'var(--brand-500)', color: 'white', border: 'none', borderRadius: 12, padding: '10px 24px', fontWeight: 800, fontSize: '1rem', cursor: 'pointer' }}>Go to Dashboard</button>
                    </div>
                  );
                }

                return (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2rem' }}>
                    {examCourses.map(course => {
                    const enr = enrollments[course.id];
                    const path = enr?.learning_path || 'pending';
                    const progress = enr?.progress_percentage || 0;
                    const pathColor = { pending: '#f59e0b', basics: '#0891b2', intermediate: '#7c3aed', advanced: '#059669' }[path] || '#6b7280';
                    const courseImages = {
                      101: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=600&q=80',
                      102: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=80',
                      103: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&q=80',
                      104: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&q=80',
                      105: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80',
                    };
                    return (
                      <div
                        key={course.id}
                        onClick={() => setSelectedCourse(course)}
                        style={{ background: 'var(--surface-0)', border: '1px solid var(--surface-3)', borderRadius: 24, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.3s', boxShadow: '0 8px 24px rgba(0,0,0,0.04)' }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.1)'; e.currentTarget.style.borderColor = 'var(--brand-300)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.04)'; e.currentTarget.style.borderColor = 'var(--surface-3)'; }}
                      >
                        <div style={{ height: 180, background: `linear-gradient(to bottom right, rgba(0,0,0,0.5), rgba(0,0,0,0.2)), url('${courseImages[course.id] || ''}')`, backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'flex-end', padding: '1.25rem' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, background: pathColor, color: 'white', padding: '4px 12px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {path === 'pending' ? '⏳ Pending' : path === 'basics' ? '🌱 Foundation' : path === 'intermediate' ? '🚀 Core' : '⚡ Expert'}
                          </span>
                        </div>
                        <div style={{ padding: '1.5rem' }}>
                          <p style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem', lineHeight: 1.3 }}>{course.title}</p>
                          <div style={{ marginBottom: '1.25rem', padding: '0.75rem', background: 'var(--surface-1)', borderRadius: 12, border: '1px solid var(--surface-2)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              {path === 'pending' ? (
                                <>
                                  <AlertCircle size={16} color="#f59e0b" />
                                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Placement Assessment Required</span>
                                </>
                              ) : progress >= 100 ? (
                                <>
                                  <CheckCircle2 size={16} color="#10b981" />
                                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 700 }}>All Modules Completed</span>
                                </>
                              ) : (
                                <>
                                  <Activity size={16} color="var(--brand-500)" />
                                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Learning in Progress</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid var(--surface-2)' }}>
                            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}><Layers size={16} color="var(--brand-500)" /> {path === 'pending' ? 'Take Assessment' : 'View Roadmap'}</span>
                            <div style={{ background: 'var(--brand-50)', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <ArrowRight size={16} color="var(--brand-600)" />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
          </div>
        )}


        {/* ── LOBBY STATE ── */}
        {examState === 'lobby' && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', overflowY: 'auto' }}>
            <div style={{ maxWidth: 640, width: '100%', animation: 'fadeIn 0.5s ease' }}>
              
              <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--brand-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                  <ShieldAlert size={32} color="var(--brand-500)" />
                </div>
                <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Exam Waiting Room</h1>
                <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>You are about to start <strong>{selectedExam?.title}</strong>. Please complete verification.</p>
              </div>

              <div style={{ background: 'var(--surface-0)', borderRadius: 20, border: '1px solid var(--surface-3)', boxShadow: '0 8px 30px rgba(0,0,0,0.04)', padding: '2rem', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Hardware & Environment Check</h3>
                
                <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
                  <div style={{ width: 160, height: 120, background: 'var(--surface-2)', borderRadius: 12, overflow: 'hidden', position: 'relative', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: hardwareChecked ? '2px solid #10b981' : '2px solid var(--surface-3)' }}>
                    <video ref={el => { if (el && mediaStream && el.srcObject !== mediaStream) el.srcObject = mediaStream; }} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
                    {!hardwareChecked && <Camera size={24} color="var(--text-muted)" style={{ position: 'absolute' }} />}
                  </div>
                  
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {hardwareChecked ? <CheckCircle2 size={18} color="#10b981" /> : <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid var(--text-muted)' }} />}
                      <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>Camera & Microphone Access</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <CheckCircle2 size={18} color="#10b981" />
                      <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>Stable Internet Connection</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                       <CheckCircle2 size={18} color="#10b981" />
                      <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>Screen Sharing & Fullscreen</span>
                    </div>
                  </div>
                </div>

                <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: 12, border: '1px solid rgba(239, 68, 68, 0.1)', marginBottom: '1.5rem' }}>
                  <h4 style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Academic Integrity Rules</h4>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    <li>Do not navigate away from this tab or exit fullscreen (it will be logged).</li>
                    <li>Ensure your face is clearly visible at all times.</li>
                    <li>No secondary devices or headphones are permitted.</li>
                  </ul>
                </div>

                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
                  <input type="checkbox" checked={agreedToTerms} onChange={e => setAgreedToTerms(e.target.checked)} style={{ marginTop: 3, width: 16, height: 16, accentColor: 'var(--brand-500)', cursor: 'pointer' }} />
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    I agree to the academic integrity rules, consent to being recorded, and allow full-screen locking for proctoring purposes.
                  </span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button onClick={exitToList} style={{ padding: '12px 24px', borderRadius: 999, background: 'var(--surface-0)', border: '1px solid var(--surface-3)', color: 'var(--text-primary)', fontWeight: 800, fontSize: '0.9375rem', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button 
                  onClick={() => { if(hardwareChecked && agreedToTerms) setExamState('active'); }}
                  disabled={!hardwareChecked || !agreedToTerms}
                  style={{ padding: '12px 32px', borderRadius: 999, background: hardwareChecked && agreedToTerms ? 'var(--brand-500)' : 'var(--surface-3)', color: hardwareChecked && agreedToTerms ? 'white' : 'var(--text-muted)', border: 'none', fontWeight: 800, fontSize: '0.9375rem', cursor: hardwareChecked && agreedToTerms ? 'pointer' : 'not-allowed', transition: 'all 0.2s', boxShadow: hardwareChecked && agreedToTerms ? '0 4px 12px rgba(79,70,229,0.3)' : 'none' }}>
                  Start Examination
                </button>
              </div>

            </div>
          </div>
        )}


        {/* ── ACTIVE EXAM STATE ── */}
        {examState === 'active' && (
          <>
            {/* Top Banners for YOLO Violations */}
            {activeBanner && activeBanner.type !== 'terminated' && (
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, zIndex: 200,
                background: activeBanner.type === 'phone_detected' ? '#dc2626' : '#ef4444',
                color: 'white', padding: '14px 20px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                fontWeight: 900, fontSize: '1rem', letterSpacing: '0.03em',
                animation: 'slideDown 0.3s ease', boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <AlertCircle size={24} />
                  {activeBanner.type === 'phone_detected'
                    ? '⚠️ PROHIBITED DEVICE DETECTED — INCIDENT LOGGED!'
                    : '⚠️ MULTIPLE PEOPLE DETECTED IN EXAM AREA!'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: 999, fontSize: '0.875rem' }}>
                    Violation {violationCount}/{MAX_VIOLATIONS}
                  </div>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.25rem', fontWeight: 900
                  }}>
                    {activeBanner.countdown}
                  </div>
                </div>
              </div>
            )}
            {activeBanner?.type === 'terminated' && (
              <div style={{
                position: 'absolute', inset: 0, zIndex: 300,
                background: 'rgba(0,0,0,0.85)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 16, color: 'white', animation: 'fadeIn 0.3s ease'
              }}>
                <AlertCircle size={64} color="#ef4444" />
                <div style={{ fontSize: '2rem', fontWeight: 900 }}>Exam Terminated</div>
                <div style={{ fontSize: '1rem', opacity: 0.8 }}>Maximum violations exceeded. Your session has been flagged.</div>
              </div>
            )}

            {/* Proctoring HUD */}
            <div style={{ position: 'absolute', bottom: '2rem', right: '2rem', zIndex: 100, display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'flex-end', animation: 'fadeIn 0.5s ease' }}>
              {/* Only show bottom popup for MediaPipe face warnings (not YOLO, those go to top) */}
              {proctoring.status === 'tracking' && (proctoring.warnings > 0 || !proctoring.isFaceVisible || proctoring.isLookingAway) && !proctoring.lastViolation && (
                <div style={{ background: '#ef4444', color: 'white', padding: '12px 16px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 8px 30px rgba(239,68,68,0.4)', maxWidth: 280, animation: 'fadeIn 0.3s ease' }}>
                  <AlertCircle size={20} />
                  <div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {proctoring.lastViolation === 'phone_detected' ? 'Prohibited Device' : 'Focus Lost'}
                    </div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                        {proctoring.lastViolation ? 'This incident has been logged.' : `Re-center to maintain multiplier. Warning ${proctoring.warnings}/3`}
                    </div>
                  </div>
                </div>
              )}
              
              <div style={{ position: 'relative', width: 220, height: 140, borderRadius: 16, overflow: 'hidden', border: proctoring.status === 'tracking' && (!proctoring.isFaceVisible || proctoring.isLookingAway || proctoring.lastViolation) ? '3px solid #ef4444' : '3px solid var(--surface-3)', boxShadow: '0 12px 40px rgba(0,0,0,0.15)', background: 'var(--surface-2)' }}>
                <video ref={hudVideoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
                
                {/* YOLO Annotated Frame Overlay */}
                {proctoring.annotatedFrame && proctoring.lastViolation && (
                  <img src={proctoring.annotatedFrame} alt="YOLO Detection" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)', zIndex: 5 }} />
                )}
                
                {/* Status Indicator overlay */}
                <div style={{ position: 'absolute', bottom: 12, right: 12, display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.6)', padding: '4px 10px', borderRadius: 999, backdropFilter: 'blur(4px)' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: proctoring.status !== 'tracking' ? '#f59e0b' : (!proctoring.isFaceVisible || proctoring.isLookingAway || proctoring.lastViolation) ? '#ef4444' : '#10b981', boxShadow: `0 0 10px ${proctoring.status !== 'tracking' ? '#f59e0b' : (!proctoring.isFaceVisible || proctoring.isLookingAway || proctoring.lastViolation) ? '#ef4444' : '#10b981'}` }} />
                  <span style={{ fontSize: '0.625rem', fontWeight: 800, color: 'white', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {proctoring.status !== 'tracking' ? 'Initializing AI' : proctoring.lastViolation ? 'Violation Logged' : (!proctoring.isFaceVisible) ? 'Face Missing' : (proctoring.isLookingAway) ? 'Look Forward' : 'Tracking Active'}
                  </span>
                </div>
              </div>
            </div>

            {/* Question Stage */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', overflowY: 'auto', animation: 'fadeIn 0.3s ease' }}>
              <div style={{ maxWidth: 700, width: '100%' }}>
                
                {/* Progress bar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                      Question {current + 1} of {questions.length}
                    </span>
                    <div style={{ flex: 1, height: 4, background: 'var(--surface-3)', borderRadius: 999, maxWidth: 300 }}>
                      <div style={{ height: '100%', background: 'var(--brand-500)', borderRadius: 999, width: `${((current + 1) / questions.length) * 100}%`, transition: 'width 0.4s ease' }} />
                    </div>
                  </div>
                  <button onClick={toggleFlag} style={{ display: 'flex', alignItems: 'center', gap: 6, background: flagged.has(current) ? '#fef3c7' : 'transparent', border: `1px solid ${flagged.has(current) ? '#fde68a' : 'var(--surface-3)'}`, padding: '6px 12px', borderRadius: 999, color: flagged.has(current) ? '#d97706' : 'var(--text-secondary)', fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                    <Flag size={14} fill={flagged.has(current) ? '#d97706' : 'none'} />
                    {flagged.has(current) ? 'Flagged for Review' : 'Flag Question'}
                  </button>
                </div>

                {/* Question Text */}
                <h2 style={{ fontSize: '1.375rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.45, marginBottom: '2rem' }}>
                  {q.q}
                </h2>

                {/* Question Input (Dynamic Type) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '3rem' }}>
                  
                  {q.type === 'mcq' && q.options.map((opt, idx) => {
                    const isSelected = answers[current] === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleAnswerChange(idx)}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: '1.25rem',
                          padding: '1rem 1.25rem', borderRadius: 14, cursor: 'pointer', textAlign: 'left',
                          background: isSelected ? 'var(--brand-50)' : 'var(--surface-0)',
                          border: `2px solid ${isSelected ? 'var(--brand-500)' : 'var(--surface-3)'}`,
                          transition: 'all 0.15s', color: 'var(--text-primary)',
                        }}
                        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = 'var(--brand-300)'; }}
                        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = 'var(--surface-3)'; }}
                      >
                        <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8125rem', transition: 'all 0.15s',
                          background: isSelected ? 'var(--brand-500)' : 'var(--surface-2)',
                          color: isSelected ? 'white' : 'var(--text-muted)',
                        }}>
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <span style={{ fontSize: '0.9375rem', fontWeight: isSelected ? 700 : 500, lineHeight: 1.4 }}>{opt}</span>
                      </button>
                    );
                  })}

                  {q.type === 'text' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <textarea 
                        value={answers[current] || ''}
                        onChange={e => handleAnswerChange(e.target.value)}
                        placeholder="Type your answer here..."
                        style={{ width: '100%', minHeight: 180, padding: '1rem', borderRadius: 14, border: '2px solid var(--surface-3)', background: 'var(--surface-0)', color: 'var(--text-primary)', fontSize: '0.9375rem', lineHeight: 1.5, resize: 'vertical', outline: 'none', transition: 'border-color 0.2s' }}
                        onFocus={e => e.currentTarget.style.borderColor = 'var(--brand-400)'}
                        onBlur={e => e.currentTarget.style.borderColor = 'var(--surface-3)'}
                      />
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right' }}>{String(answers[current] || '').length} characters</p>
                    </div>
                  )}
                </div>

                {/* Navigation */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button onClick={() => setCurrent(Math.max(0, current - 1))}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: 'none', color: current === 0 ? 'var(--text-muted)' : 'var(--text-primary)', fontWeight: 700, fontSize: '0.875rem', cursor: current === 0 ? 'not-allowed' : 'pointer', padding: 0, opacity: current === 0 ? 0.4 : 1 }}>
                    <ChevronLeft size={18} /> Previous
                  </button>

                  <button onClick={() => setCurrent(Math.min(questions.length - 1, current + 1))}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--text-primary)', color: 'white', border: 'none', padding: '10px 24px', borderRadius: 999, fontWeight: 800, fontSize: '0.9375rem', cursor: current === questions.length - 1 ? 'not-allowed' : 'pointer', opacity: current === questions.length - 1 ? 0.4 : 1 }}>
                    Next <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Sidebar: Gamified Map Pin Roadmap & Tools */}
            <div style={{ width: 400, background: 'var(--surface-0)', borderLeft: '1px solid var(--surface-3)', padding: '1.5rem', display: 'flex', flexDirection: 'column', flexShrink: 0, zIndex: 10 }}>
              
              <div style={{ marginBottom: '1rem', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }} className="hide-scrollbar">
                <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <BrainCircuit size={16} color="var(--brand-500)" /> Exam Quest
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'linear-gradient(135deg, #f59e0b, #ef4444)', padding: '4px 8px', borderRadius: 999, color: 'white', fontSize: '0.6875rem', fontWeight: 800, boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)' }}>
                    🔥 2x Streak
                  </div>
                </div>
                
                <div style={{ position: 'relative', height: roadmapHeight, width: 260, margin: '0 auto' }}>
                  {/* Background Track */}
                  <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                    <path d={roadmapPath} fill="none" stroke="var(--surface-3)" strokeWidth="6" strokeLinecap="round" />
                    
                    {/* Active Track (Animated Clip) */}
                    <clipPath id="progressClip">
                      <rect x="0" y="0" width="100%" height={current * 110 + 50} style={{ transition: 'height 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                    </clipPath>
                    <path d={roadmapPath} fill="none" stroke="#1e3a8a" strokeWidth="6" strokeLinecap="round" clipPath="url(#progressClip)" />
                  </svg>
                  
                  {/* Map Pin Nodes */}
                  {questions.map((q, i) => {
                    const isAnswered = answers[i] !== undefined && answers[i] !== '';
                    const isFlagged = flagged.has(i);
                    const isCurrent = current === i;
                    const isFuture = i > current && !isAnswered;
                    
                    const x = i % 2 === 0 ? 80 : 180;
                    const y = i * 110 + 50;

                    let color = 'var(--surface-3)';
                    let icon = <Lock size={20} color="var(--text-muted)" />;

                    if (isAnswered) { 
                      color = '#10b981'; // Green
                      icon = <CheckCircle2 size={24} color={color} />;
                    }
                    if (isFlagged) { 
                      color = '#f59e0b'; // Yellow/Orange
                      icon = <Flag size={20} fill={color} color={color} />;
                    }
                    if (isCurrent) { 
                      color = '#3b82f6'; // Blue
                      icon = <BrainCircuit size={22} color={color} />;
                    }

                    return (
                      <div key={i} style={{ position: 'absolute', left: x, top: y, cursor: 'pointer' }} onClick={() => setCurrent(i)}>
                        {/* Dot on the path */}
                        <div style={{ position: 'absolute', left: -6, top: -6, width: 12, height: 12, borderRadius: '50%', background: color, zIndex: 3 }} />
                        
                        {/* Map Pin Bubble */}
                        <div className={isCurrent ? 'pulse-pin' : ''} style={{ position: 'absolute', top: -52, left: -24, width: 48, height: 48, borderRadius: '50% 50% 50% 0', transform: 'rotate(-45deg)', border: `4px solid ${color}`, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(0,0,0,0.06)', zIndex: 4, transition: 'all 0.3s' }}>
                          <div style={{ transform: 'rotate(45deg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {icon}
                          </div>
                        </div>

                        {/* Label Text */}
                        <div style={{ 
                          position: 'absolute', top: -30, 
                          ...(i % 2 === 0 ? { right: 36, textAlign: 'right' } : { left: 36, textAlign: 'left' }),
                          width: 140, pointerEvents: 'none'
                        }}>
                          <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>{q.topic}</div>
                          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: 2, fontWeight: 600 }}>Question {i + 1}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ marginBottom: 'auto' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-primary)', marginBottom: '1rem' }}>
                  Tools
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <button onClick={() => setShowScratchpad(!showScratchpad)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', background: showScratchpad ? 'var(--brand-50)' : 'var(--surface-1)', border: `1px solid ${showScratchpad ? 'var(--brand-200)' : 'var(--surface-3)'}`, color: showScratchpad ? 'var(--brand-700)' : 'var(--text-primary)', borderRadius: 12, fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>
                    <Edit3 size={16} /> Digital Scratchpad
                  </button>
                  <button onClick={() => setShowCalculator(!showCalculator)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', background: showCalculator ? 'var(--brand-50)' : 'var(--surface-1)', border: `1px solid ${showCalculator ? 'var(--brand-200)' : 'var(--surface-3)'}`, color: showCalculator ? 'var(--brand-700)' : 'var(--text-primary)', borderRadius: 12, fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>
                    <Calculator size={16} /> Basic Calculator
                  </button>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--surface-3)', paddingTop: '1.5rem', marginTop: '2rem' }}>
                <button onClick={async () => {
                    setExamState('submitted');
                    try { if (document.fullscreenElement && document.exitFullscreen) await document.exitFullscreen(); } catch (err) {}
                    // Compute exam score and trigger cognitive profile update
                    const totalQ = questions.length || 1;
                    const correct = Object.entries(answers).filter(([qi, ans]) => questions[parseInt(qi)]?.answer === ans).length;
                    const pct = Math.round((correct / totalQ) * 100);
                    try {
                      await cognitiveAPI.evaluate({
                        event: 'Exam Completed',
                        score: pct,
                        topic: selectedExam?.title || 'Exam',
                        total_questions: totalQ,
                        correct_answers: correct,
                        flagged_questions: flagged.size,
                        time_taken_seconds: (selectedExam?.duration_minutes || 45) * 60 - timeLeft,
                      });
                    } catch (err) {
                      console.warn('Could not update cognitive profile after exam:', err);
                    }
                  }} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#10b981', color: 'white', border: 'none', padding: '14px', borderRadius: 12, fontWeight: 900, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(16,185,129,0.35)', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                  <ShieldCheck size={18} /> Finish Quest
                </button>
              </div>
            </div>


            {/* Floating Scratchpad */}
            {showScratchpad && (
              <div style={{ position: 'absolute', top: '2rem', right: '340px', width: 300, background: 'var(--surface-0)', borderRadius: 16, border: '1px solid var(--surface-3)', boxShadow: '0 12px 40px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', zIndex: 20, animation: 'fadeIn 0.2s ease' }}>
                <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--surface-3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-1)' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}><Edit3 size={14} /> Scratchpad</span>
                  <button onClick={() => setShowScratchpad(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={14} /></button>
                </div>
                <textarea 
                  value={scratchpadText}
                  onChange={e => setScratchpadText(e.target.value)}
                  placeholder="Type rough notes here..."
                  style={{ width: '100%', height: 200, border: 'none', padding: '1rem', resize: 'none', outline: 'none', background: 'transparent', color: 'var(--text-primary)', fontSize: '0.875rem', fontFamily: 'monospace' }}
                />
              </div>
            )}

            {/* Floating Calculator */}
            {showCalculator && (
              <div style={{ position: 'absolute', top: '18rem', right: '340px', width: 240, background: 'var(--surface-0)', borderRadius: 16, border: '1px solid var(--surface-3)', boxShadow: '0 12px 40px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', zIndex: 20, animation: 'fadeIn 0.2s ease' }}>
                <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--surface-3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-1)' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}><Calculator size={14} /> Calculator</span>
                  <button onClick={() => setShowCalculator(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={14} /></button>
                </div>
                <div style={{ padding: '1rem', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                  <div style={{ gridColumn: '1 / -1', background: 'var(--surface-2)', borderRadius: 8, padding: '0.5rem 0.75rem', textAlign: 'right', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>0</div>
                  {['7','8','9','/','4','5','6','*','1','2','3','-','0','.','=','+'].map(btn => (
                    <button key={btn} style={{ padding: '0.5rem', border: '1px solid var(--surface-3)', background: 'var(--surface-1)', borderRadius: 6, fontWeight: 700, cursor: 'pointer' }}>{btn}</button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ── SUBMITTED STATE ── */}
        {examState === 'submitted' && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', overflowY: 'auto', animation: 'fadeIn 0.5s ease' }}>
            <div style={{ maxWidth: 800, width: '100%' }}>
              
              <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                  <Trophy size={40} color="#10b981" />
                </div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>Exam Completed</h1>
                <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)' }}>You scored <strong>{score} out of {questions.length}</strong> in {selectedExam?.title}.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '3rem' }}>
                <div style={{ background: 'var(--surface-0)', padding: '1.5rem', borderRadius: 20, border: '1px solid var(--surface-3)', boxShadow: '0 8px 24px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1rem' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Activity size={20} color="#f59e0b" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-primary)' }}>Speed Metric</h3>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cognitive Profile Update</p>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    You averaged <strong>45s per question</strong>. This is 15s slower than your benchmark. Your Speed score has been adjusted by <span style={{ color: '#ef4444', fontWeight: 800 }}>-2 points</span>.
                  </p>
                </div>

                <div style={{ background: 'var(--surface-0)', padding: '1.5rem', borderRadius: 20, border: '1px solid var(--surface-3)', boxShadow: '0 8px 24px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1rem' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(79, 70, 229, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <BrainCircuit size={20} color="#4f46e5" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-primary)' }}>Knowledge Gap</h3>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Targeted Weakness</p>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    You struggled with <strong>Tree Traversals</strong>. We have added a 10-minute micro-lesson to your Adaptive Path to address this before the Finals.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                <button onClick={exitToList} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface-0)', border: '1px solid var(--surface-3)', color: 'var(--text-primary)', padding: '12px 28px', borderRadius: 999, fontWeight: 800, fontSize: '0.9375rem', cursor: 'pointer' }}>
                  Return to Exams
                </button>
                <button onClick={() => { exitToList(); navigate('/student/cognitive'); }} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--text-primary)', color: 'white', border: 'none', padding: '12px 28px', borderRadius: 999, fontWeight: 800, fontSize: '0.9375rem', cursor: 'pointer', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                  View Full Cognitive Profile <ArrowRight size={18} />
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
      
      <style>{`
        @keyframes slideDown { from { transform: translateY(-100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
        @keyframes pulsePin {
          0% { box-shadow: 0 8px 16px rgba(0,0,0,0.06), 0 0 0 0 rgba(59,130,246,0.4); }
          70% { box-shadow: 0 8px 16px rgba(0,0,0,0.06), 0 0 0 12px rgba(59,130,246,0); }
          100% { box-shadow: 0 8px 16px rgba(0,0,0,0.06), 0 0 0 0 rgba(59,130,246,0); }
        }
        .pulse-pin { animation: pulsePin 2s infinite cubic-bezier(0.66, 0, 0, 1); }
        @keyframes pulseRing {
          0%   { box-shadow: 0 0 0 0 rgba(79,70,229,0.4), 0 12px 32px rgba(79,70,229,0.25); }
          70%  { box-shadow: 0 0 0 14px rgba(79,70,229,0), 0 12px 32px rgba(79,70,229,0.25); }
          100% { box-shadow: 0 0 0 0 rgba(79,70,229,0), 0 12px 32px rgba(79,70,229,0.25); }
        }
        .pulse-ring { animation: pulseRing 2s infinite cubic-bezier(0.66, 0, 0, 1); }
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.7); }
        }
        }\n        [style*="pulse-dot"] { animation: pulseDot 1.4s infinite; }
        @keyframes breathe {
          0%, 100% { box-shadow: 0 0 0 8px rgba(99,102,241,0.2), 0 0 40px rgba(99,102,241,0.4); }
          50% { box-shadow: 0 0 0 16px rgba(99,102,241,0.1), 0 0 60px rgba(99,102,241,0.6); }
        }
      `}</style>

      {/* Course Roadmap Modal */}
      {selectedCourse && (
        <CourseRoadmapModal
          course={selectedCourse}
          enrollment={enrollments[selectedCourse.id]}
          onClose={() => setSelectedCourse(null)}
        />
      )}
    </div>
  );
}
