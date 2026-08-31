import { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, AlertCircle, Camera, Mic, Eye, Clock, ChevronLeft, ChevronRight, 
  Activity, BrainCircuit, Trophy, ArrowRight, ShieldAlert, CheckCircle2, FileText, Lock, 
  Flag, Cloud, CloudOff, RefreshCw, Calculator, Edit3, X, AlignLeft, Volume2, Wifi, Map, Sword
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProctoring } from '../../hooks/useProctoring';

// ── Mock Data ─────────────────────────────────────────────────────────────
const questions = [
  {
    id: 1,
    type: 'mcq',
    q: 'What is the time complexity of searching in a balanced Binary Search Tree?',
    options: ['O(1)', 'O(n)', 'O(log n)', 'O(n log n)'],
    correct: 2,
    topic: 'Algorithmic Complexity',
  },
  {
    id: 2,
    type: 'mcq',
    q: 'Which traversal visits the root node first?',
    options: ['In-order', 'Pre-order', 'Post-order', 'Level-order'],
    correct: 1,
    topic: 'Tree Traversal',
  },
  {
    id: 3,
    type: 'text',
    q: 'Write a brief definition of a Hash Collision.',
    correctTextKeywords: ['two keys', 'same index', 'same hash', 'bucket'],
    topic: 'Hashing',
  },
  {
    id: 4,
    type: 'mcq',
    q: 'A complete binary tree of height h has at most __ nodes.',
    options: ['2^h', '2^h - 1', '2^(h+1) - 1', 'h^2'],
    correct: 2,
    topic: 'Binary Tree Properties',
  },
];

const availableExams = [
  { id: 3, title: 'Database Systems — CA1', course: 'Computer Science', date: 'Sep 2', duration: '30 mins', questions: 25, status: 'completed', score: '22/25' },
  { id: 4, title: 'Algorithms — Quiz 1', course: 'Computer Science', date: 'Sep 20', duration: '20 mins', questions: 15, status: 'completed', score: '14/15' },
  { id: 1, title: 'Data Structures — Midterm', course: 'Computer Science', date: 'Today', duration: '45 mins', questions: 4, status: 'active' },
  { id: 2, title: 'Operating Systems — CA2', course: 'Computer Science', date: 'Oct 15', duration: '60 mins', questions: 50, status: 'upcoming' },
  { id: 5, title: 'Computer Networks — Final', course: 'Computer Science', date: 'Nov 5', duration: '90 mins', questions: 80, status: 'upcoming' },
  { id: 6, title: 'Software Engineering — Project Review', course: 'Computer Science', date: 'Nov 22', duration: '45 mins', questions: 30, status: 'upcoming' },
];

export default function StudentExamArena() {
  const navigate = useNavigate();
  // State: 'list' -> 'lobby' -> 'active' -> 'submitted'
  const [examState, setExamState] = useState('list'); 
  const [selectedExam, setSelectedExam] = useState(null);
  
  // Exam progress state
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
            
            {/* Subtle grid overlay */}
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, var(--surface-3) 1px, transparent 1px)', backgroundSize: '32px 32px', pointerEvents: 'none', zIndex: 0 }} />

            {/* Top glow blobs */}
            <div style={{ position: 'absolute', top: -100, left: '20%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
            <div style={{ position: 'absolute', top: 200, right: '10%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

            {/* ── Header ── */}
            <div style={{ position: 'relative', zIndex: 1, padding: '3.5rem 3rem 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem', background: 'transparent' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', border: '1px solid var(--brand-200)', borderRadius: 999, marginBottom: '1rem', background: 'transparent' }}>
                  <Trophy size={13} color="var(--brand-600)" />
                  <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--brand-600)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Your Academic Journey</span>
                </div>
                <h1 style={{ fontSize: '3.5rem', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                  Exam Quest
                </h1>
                <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 500, maxWidth: 460, margin: 0 }}>
                  Defeat each challenge to level up. Your mastery grows with every battle.
                </p>
              </div>

              {/* Progress Summary */}
              <div style={{ minWidth: 320 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{availableExams.filter(e=>e.status==='completed').length}/{availableExams.length} Completed</span>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{Math.round((availableExams.filter(e=>e.status==='completed').length / availableExams.length) * 100)}% Mastery</span>
                </div>
                <div style={{ background: 'var(--surface-2)', borderRadius: 999, height: 8, border: '1px solid var(--surface-3)' }}>
                  <div style={{ height: '100%', borderRadius: 999, background: 'linear-gradient(90deg, var(--brand-500), #10b981)', width: `${Math.round((availableExams.filter(e=>e.status==='completed').length / availableExams.length) * 100)}%`, boxShadow: '0 0 12px rgba(99,102,241,0.3)', transition: 'width 1s ease' }} />
                </div>
                
                <div style={{ display: 'flex', gap: '2rem', marginTop: '1.5rem' }}>
                  {[{ val: availableExams.filter(e=>e.status==='completed').length, label: 'Cleared', color: '#10b981' }, { val: availableExams.filter(e=>e.status==='active').length, label: 'Live', color: 'var(--brand-500)' }, { val: availableExams.filter(e=>e.status==='upcoming').length, label: 'Locked', color: 'var(--text-muted)' }].map(({ val, label, color }) => (
                    <div key={label} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 900, color, lineHeight: 1 }}>{val}</div>
                      <div style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 4 }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Level Nodes ── */}
            <div style={{ position: 'relative', zIndex: 1, maxWidth: 860, margin: '0 auto', padding: '3rem 2rem 6rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
              {availableExams.map((exam, i) => {
                const isLeft = i % 2 === 0;
                const isActive = exam.status === 'active';
                const isDone = exam.status === 'completed';
                const isLocked = exam.status === 'upcoming';

                const nodeColor = isDone ? '#10b981' : isActive ? 'var(--brand-500)' : 'var(--surface-2)';
                const nodeBorder = isDone ? '#10b981' : isActive ? 'var(--brand-400)' : 'var(--surface-3)';
                const cardBg = isDone ? 'rgba(16,185,129,0.03)' : isActive ? 'rgba(99,102,241,0.03)' : 'var(--surface-0)';
                const cardBorder = isDone ? 'rgba(16,185,129,0.3)' : isActive ? 'rgba(99,102,241,0.3)' : 'var(--surface-3)';

                const emojis = ['📚', '🧮', '⚡', '🖥️', '🌐', '🏗️'];

                return (
                  <div key={exam.id} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    
                    {/* Connector from previous */}
                    {i > 0 && (
                      <div style={{ width: 3, height: 56, background: i <= availableExams.findIndex(e=>e.status==='active') ? 'linear-gradient(to bottom, var(--brand-500), rgba(99,102,241,0.15))' : 'var(--surface-3)', borderRadius: 999, margin: '0 auto', flexShrink: 0 }} />
                    )}

                    {/* Level Row */}
                    <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '1.5rem', flexDirection: isLeft ? 'row' : 'row-reverse', padding: '0.5rem 0' }}>
                      
                      {/* ── Big Circular Node ── */}
                      <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                        <div
                          onClick={() => { if (isActive) startLobby(exam); }}
                          style={{
                            width: 88, height: 88, borderRadius: '50%',
                            background: nodeColor,
                            border: `3px solid ${nodeBorder}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '2rem',
                            cursor: isActive ? 'pointer' : 'default',
                            boxShadow: isActive ? '0 0 0 8px rgba(99,102,241,0.15), 0 0 40px rgba(99,102,241,0.3)' : isDone ? '0 0 20px rgba(16,185,129,0.2)' : 'none',
                            transition: 'all 0.3s',
                            filter: isLocked ? 'grayscale(0.8)' : 'none',
                            animation: isActive ? 'breathe 3s ease-in-out infinite' : 'none',
                            color: 'white',
                          }}
                          className={isActive ? 'level-node-active' : ''}
                        >
                          {isLocked ? '🔒' : emojis[i] || '📖'}
                        </div>
                        <div style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: isDone ? '#10b981' : isActive ? 'var(--brand-600)' : 'var(--text-muted)' }}>
                          Level {i + 1}
                        </div>
                      </div>

                      {/* ── Info Card ── */}
                      <div style={{
                        flex: 1, maxWidth: 520, padding: '1.25rem 1.5rem', borderRadius: 20,
                        background: cardBg, border: `1px solid ${cardBorder}`,
                        backdropFilter: 'blur(12px)',
                        boxShadow: isActive ? '0 8px 40px rgba(99,102,241,0.08)' : '0 4px 16px rgba(0,0,0,0.03)',
                        transition: 'all 0.3s',
                      }}>
                        {/* Top row */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                          <div>
                            {isActive && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--brand-700)', marginBottom: '0.375rem', padding: '2px 8px', background: 'var(--brand-100)', borderRadius: 999 }}>⚡ Live Now</span>}
                            {isDone && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#059669', marginBottom: '0.375rem', padding: '2px 8px', background: 'rgba(16,185,129,0.15)', borderRadius: 999 }}>✓ Cleared</span>}
                            {isLocked && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.375rem', padding: '2px 8px', background: 'var(--surface-2)', borderRadius: 999 }}>Locked</span>}
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 900, color: isLocked ? 'var(--text-secondary)' : 'var(--text-primary)', letterSpacing: '-0.01em', lineHeight: 1.25, margin: 0 }}>
                              {exam.title}
                            </h3>
                          </div>
                          {isDone && (
                            <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '1rem' }}>
                              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#10b981', lineHeight: 1 }}>{exam.score}</div>
                              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 700 }}>Score</div>
                            </div>
                          )}
                        </div>

                        {/* Meta */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1rem' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}><FileText size={11} /> {exam.questions} Questions</span>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={11} /> {exam.duration}</span>
                          {!isDone && <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>{isActive ? '📅 Today' : `📅 ${exam.date}`}</span>}
                        </div>

                        {/* CTA */}
                        {isActive && (
                          <button onClick={() => startLobby(exam)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: 'linear-gradient(135deg, var(--brand-500), var(--brand-600))', color: 'white', border: 'none', borderRadius: 12, fontSize: '0.9375rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 20px rgba(99,102,241,0.3)', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(99,102,241,0.4)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(99,102,241,0.3)'; }}>
                            <Sword size={16} /> Enter Battle
                          </button>
                        )}
                        {isLocked && (
                          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                            Unlocks {exam.date}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* End Star */}
              <div style={{ width: 3, height: 56, background: 'var(--surface-3)', borderRadius: 999 }} />
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--surface-2)', border: '2px dashed var(--surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem' }}>
                🏆
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 8 }}>
                Mastery Unlocked
              </div>
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
    </div>
  );
}
