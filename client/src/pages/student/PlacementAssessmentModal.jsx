import { useState, useEffect, useRef } from 'react';
import { coursesAPI, aiTutorAPI, cognitiveAPI } from '../../services/api.service';
import { useProctoring } from '../../hooks/useProctoring';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  BookOpen, Zap, Target, ArrowRight, X, CheckCircle2, Circle, ChevronRight,
  Brain, Sparkles, Trophy, ArrowLeft, Clock, RotateCcw, GraduationCap, AlertCircle,
  Settings, Camera
} from 'lucide-react';

// ── Path config ───────────────────────────────────────────────────────────
const PATH_CONFIG = {
  basics: {
    label: 'Foundation Path',
    emoji: '🌱',
    color: '#0891b2',
    bg: '#ecfeff',
    border: '#a5f3fc',
    desc: 'Start from the very beginning. Every concept explained from scratch.',
    score: '0–39%',
  },
  intermediate: {
    label: 'Core Path',
    emoji: '🚀',
    color: '#7c3aed',
    bg: '#faf5ff',
    border: '#c4b5fd',
    desc: 'Skip the basics. Jump into core concepts and build toward mastery.',
    score: '40–69%',
  },
  advanced: {
    label: 'Expert Path',
    emoji: '⚡',
    color: '#0e7490',
    bg: '#ecfeff',
    border: '#67e8f9',
    desc: 'Straight to advanced material. Deep dives and complex challenges.',
    score: '70–100%',
  },
};

// ── Animated progress stepper ─────────────────────────────────────────────
function Stepper({ phase }) {
  const steps = ['Foundation', 'Assessment', 'Your Path'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
      {steps.map((step, i) => {
        const stepNum = i + 1;
        const done = phase > stepNum;
        const active = phase === stepNum;
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: done ? 'var(--brand-600)' : active ? 'white' : 'var(--surface-2)',
                border: `2px solid ${done || active ? 'var(--brand-500)' : 'var(--surface-3)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.3s',
                boxShadow: active ? '0 0 0 4px rgba(14,116,144,0.15)' : 'none',
              }}>
                {done
                  ? <CheckCircle2 size={18} color="white" />
                  : <span style={{ fontSize: '0.875rem', fontWeight: 800, color: active ? 'var(--brand-600)' : 'var(--text-muted)' }}>{stepNum}</span>
                }
              </div>
              <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: active ? 'var(--brand-600)' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>{step}</span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ width: 80, height: 2, background: done ? 'var(--brand-400)' : 'var(--surface-3)', margin: '0 8px', marginBottom: 22, transition: 'background 0.4s' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Phase 1: Foundation Gateway
// ────────────────────────────────────────────────────────────────────────────
function PhaseFoundation({ course, onNext, onClose }) {
  const [slide, setSlide] = useState(0);

  const slides = [
    {
      icon: <BookOpen size={32} color="var(--brand-600)" />,
      heading: 'Welcome to the Course',
      body: course?.description || 'This course will take you on a structured learning journey, building skills progressively.',
    },
    {
      icon: <Target size={32} color="#7c3aed" />,
      heading: 'What You\'ll Master',
      body: `This ${course?.category || 'course'} course is tagged as ${course?.difficulty || 'beginner'} level. You'll move from understanding the fundamentals to applying knowledge in real-world scenarios.`,
    },
    {
      icon: <Brain size={32} color="#059669" />,
      heading: 'Adaptive Learning Path',
      body: 'Before we begin, we\'ll run a full 20-question placement assessment. Your answers help us understand your current skill level so we can put you on the exact path to learn most effectively.',
    },
  ];

  const current = slides[slide];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '2rem 1rem', flex: 1 }}>
      <div style={{ width: 80, height: 80, borderRadius: 24, background: 'var(--surface-1)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', transition: 'all 0.3s' }}>
        {current.icon}
      </div>

      <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '1rem', lineHeight: 1.2 }}>{current.heading}</h2>
      <p style={{ fontSize: '1.0625rem', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 520, marginBottom: '3rem' }}>{current.body}</p>

      {/* Dot indicators */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '3rem' }}>
        {slides.map((_, i) => (
          <div key={i} onClick={() => setSlide(i)} style={{
            width: i === slide ? 24 : 8, height: 8, borderRadius: 999,
            background: i === slide ? 'var(--brand-500)' : 'var(--surface-3)',
            cursor: 'pointer', transition: 'all 0.3s',
          }} />
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, width: '100%', maxWidth: 480 }}>
        {slide > 0 && (
          <button onClick={() => setSlide(s => s - 1)} className="btn btn-secondary" style={{ flex: 1, height: 52, borderRadius: 14, fontSize: '1rem', gap: 6 }}>
            <ArrowLeft size={16} /> Back
          </button>
        )}
        <button
          onClick={() => slide < slides.length - 1 ? setSlide(s => s + 1) : onNext()}
          className="btn btn-primary"
          style={{ flex: 2, height: 52, borderRadius: 14, fontSize: '1rem', gap: 8 }}
        >
          {slide < slides.length - 1 ? <>Next <ArrowRight size={16} /></> : <><Zap size={16} /> Start Placement Assessment</>}
        </button>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Phase 2: Full-Screen Pre-Assessment (20 Questions)
// ────────────────────────────────────────────────────────────────────────────

// 20 Comprehensive Fallback Questions
const FALLBACK_QUESTIONS = (courseTitle) => [
  {
    question: `How would you rate your overall familiarity with "${courseTitle}"?`,
    options: ['I am completely new to this topic', 'I have basic theoretical knowledge', 'I have hands-on practical experience', 'I consider myself highly proficient'],
    correct: null,
    weight: [0, 33, 66, 100],
  },
  {
    question: 'How do you prefer to approach learning a new technical concept?',
    options: ['Start from absolute basics and build step-by-step', 'Skim theory quickly and focus on practical exercises', 'Jump straight into advanced scenarios', 'Learn by analyzing complex real-world projects'],
    correct: null,
    weight: [10, 45, 75, 90],
  },
  {
    question: 'Which best describes your prior background in this domain?',
    options: ['No prior background', 'Self-taught via tutorials or introductory courses', 'Academic or professional coursework', 'Extensive industry or project work'],
    correct: null,
    weight: [5, 40, 70, 95],
  },
  {
    question: 'How comfortable are you with domain-specific terminology and core syntax?',
    options: ['Not comfortable at all', 'Slightly comfortable, need constant references', 'Fairly confident in daily usage', 'Fluent and can explain to others'],
    correct: null,
    weight: [5, 35, 65, 95],
  },
  {
    question: 'What is your primary goal for taking this course?',
    options: ['Build solid foundational understanding', 'Strengthen existing skills and fill knowledge gaps', 'Master advanced techniques and best practices', 'Prepare for certification or career transition'],
    correct: null,
    weight: [10, 40, 75, 80],
  },
  {
    question: 'When encountering a complex technical bug or issue, what is your first step?',
    options: ['Ask an instructor or search for direct answers', 'Read error logs and check basic configuration', 'Debug systematically using breakpoints and step-by-step trace', 'Analyze root causes and re-architect the solution'],
    correct: null,
    weight: [10, 40, 75, 95],
  },
  {
    question: 'How do you rate your experience with logical problem solving and data flow?',
    options: ['Novice — still grasping logic structures', 'Beginner — can solve simple logical problems', 'Intermediate — comfortable with multi-step logic', 'Advanced — skilled in optimizing complex data flows'],
    correct: null,
    weight: [5, 35, 70, 95],
  },
  {
    question: 'Have you previously constructed complete projects in this or a related field?',
    options: ['Never built a project yet', 'Built simple follow-along practice tasks', 'Built independent functional projects', 'Built production-ready or deployed applications'],
    correct: null,
    weight: [0, 30, 70, 100],
  },
  {
    question: 'How effectively can you read and apply technical documentation?',
    options: ['Struggle with official docs, prefer video walkthroughs', 'Can understand basic code examples in documentation', 'Comfortable reading technical specs and API references', 'Regularly read open-source source code and architecture guides'],
    correct: null,
    weight: [10, 40, 75, 95],
  },
  {
    question: 'Which learning methodology yields the highest retention for you?',
    options: ['Guided step-by-step visual lessons', 'Interactive quizzes and flashcard drills', 'Hands-on coding labs and challenge prompts', 'Building end-to-end capstone projects'],
    correct: null,
    weight: [15, 35, 70, 90],
  },
  {
    question: 'How familiar are you with design patterns and clean architecture standards?',
    options: ['Unfamiliar with software design patterns', 'Recognize common patterns like MVC or Singleton', 'Apply modular design and SOLID principles regularly', 'Design distributed scalable architectures'],
    correct: null,
    weight: [0, 35, 75, 100],
  },
  {
    question: 'What difficulty level of exercises keeps you most engaged?',
    options: ['Simple, structured exercises with clear hints', 'Moderate challenges that test core concepts', 'Tricky problem sets that require creative thinking', 'Open-ended real-world engineering problems'],
    correct: null,
    weight: [10, 40, 75, 90],
  },
  {
    question: 'How would you rate your ability to troubleshoot runtime errors independently?',
    options: ['Rely heavily on external guidance', 'Can resolve basic syntax errors with effort', 'Can systematically debug runtime exceptions', 'Can diagnose performance bottlenecks and memory leaks'],
    correct: null,
    weight: [5, 35, 70, 95],
  },
  {
    question: 'What is your level of comfort working in developer tooling and CLI environments?',
    options: ['Prefer graphical interfaces only', 'Basic familiarity with terminal commands', 'Comfortable using CLI, git, and dev tools', 'Advanced shell scripting and automation workflows'],
    correct: null,
    weight: [10, 40, 75, 95],
  },
  {
    question: 'How comfortable are you with version control and collaborative workflows?',
    options: ['No experience with Git or version control', 'Know basic commit and push commands', 'Comfortable with branching, merging, and PRs', 'Expert in complex rebase, conflict resolution, and CI/CD'],
    correct: null,
    weight: [0, 30, 70, 100],
  },
  {
    question: 'How do you handle ambiguous requirements when solving a problem?',
    options: ['Wait for explicit instructions', 'Ask clarifying questions before making assumptions', 'Break the problem down into testable assumptions', 'Prototype fast and iteratively refine requirements'],
    correct: null,
    weight: [10, 40, 75, 90],
  },
  {
    question: 'How familiar are you with performance optimization techniques?',
    options: ['Have not explored optimization yet', 'Aware that code performance matters', 'Understand time/space complexity and optimization', 'Profile code to optimize memory, latency, and throughput'],
    correct: null,
    weight: [0, 30, 70, 100],
  },
  {
    question: 'How comfortable are you with API integrations and asynchronous operations?',
    options: ['Not familiar with APIs or async execution', 'Can make basic REST API requests', 'Comfortable handling promises, async/await, and errors', 'Expert in WebSockets, async pipelines, and state sync'],
    correct: null,
    weight: [5, 35, 75, 95],
  },
  {
    question: 'What learning speed feels optimal for your schedule?',
    options: ['Paced — 2-3 hours per week with deep review', 'Steady — 5-7 hours per week', 'Intensive — 10-15 hours per week', 'Accelerated — immersive full-time track'],
    correct: null,
    weight: [20, 50, 75, 90],
  },
  {
    question: 'Which statement best describes your target outcome after this course?',
    options: ['Understand fundamental concepts clearly', 'Build real projects independently', 'Master advanced patterns and best practices', 'Lead technical implementations and mentor others'],
    correct: null,
    weight: [10, 40, 75, 95],
  },
];

function PhaseAssessment({ course, courseId, onComplete, prefetchedQuestions }) {
  const [questions, setQuestions] = useState(prefetchedQuestions || []);
  const [loading, setLoading] = useState(!prefetchedQuestions || prefetchedQuestions.length === 0);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionIdx: selectedIdx }
  const [selected, setSelected] = useState(null);
  const [animating, setAnimating] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState(false);

  // Security states
  const [focusWarning, setFocusWarning] = useState(false);
  const [keyWarning, setKeyWarning] = useState('');
  const [fsWarning, setFsWarning] = useState(false);
  const [activeBanner, setActiveBanner] = useState(null);
  const violationTimerRef = useRef(null);
  const prevViolationRef = useRef(null);

  const proctoring = useProctoring();
  const hudVideoRef = useRef(null);
  const streamRef = useRef(null);

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []);

  // Start MediaPipe tracking when video mounts
  useEffect(() => {
    if (permissionsGranted && !loading && streamRef.current && hudVideoRef.current) {
      if (hudVideoRef.current.srcObject !== streamRef.current) {
        hudVideoRef.current.srcObject = streamRef.current;
      }
      proctoring.startTracking(hudVideoRef.current, courseId || 999999);
    }
  }, [permissionsGranted, loading, proctoring.startTracking]);

  useEffect(() => {
    return () => { proctoring.stopTracking(); };
  }, [proctoring.stopTracking]);

  // YOLO / Mic Violation Tracking
  useEffect(() => {
    const violation = proctoring.lastViolation;
    if (violation && violation !== prevViolationRef.current) {
      prevViolationRef.current = violation;
      let countdown = 5;
      setActiveBanner({ type: violation, countdown });
      if (violationTimerRef.current) clearInterval(violationTimerRef.current);
      violationTimerRef.current = setInterval(() => {
        countdown -= 1;
        setActiveBanner(b => b ? { ...b, countdown } : null);
        if (countdown <= 0) {
          clearInterval(violationTimerRef.current);
          setActiveBanner(null);
        }
      }, 1000);
    }
    if (!violation) {
      prevViolationRef.current = null;
    }
  }, [proctoring.lastViolation]);

  // Load prefetched questions
  useEffect(() => {
    if (prefetchedQuestions && prefetchedQuestions.length > 0) {
      setQuestions(prefetchedQuestions);
      setLoading(false);
    }
  }, [prefetchedQuestions]);

  // (Fullscreen is now requested explicitly via button click)
  useEffect(() => {
    return () => { try { if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen(); } catch {} };
  }, []);

  useEffect(() => {
    const onBlur = () => setFocusWarning(true);
    const onFocus = () => setFocusWarning(false);
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);
    return () => { window.removeEventListener('blur', onBlur); window.removeEventListener('focus', onFocus); };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key.match(/^F(1[0-2]|[1-9])$/)) {
        e.preventDefault();
        setKeyWarning(`Blocked: ${e.key} is not allowed during assessment.`);
        setTimeout(() => setKeyWarning(''), 4000);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const onChange = () => { if (!document.fullscreenElement) setFsWarning(true); };
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const q = questions[current];

  const handleSelect = (idx) => {
    if (selected !== null || animating) return;
    setSelected(idx);
    const newAnswers = { ...answers, [current]: idx };
    setTimeout(() => {
      if (current < questions.length - 1) {
        setAnimating(true);
        setTimeout(() => {
          setAnswers(newAnswers);
          setSelected(null);
          setCurrent(c => c + 1);
          setAnimating(false);
        }, 300);
      } else {
        // Calculate final score
        let totalScore = 0;
        const allAnswers = { ...newAnswers };
        questions.forEach((qItem, i) => {
          const ans = allAnswers[i];
          if (ans === undefined) return;
          if (qItem.weight) {
            totalScore += qItem.weight[ans] || 0;
          } else {
            if (ans === qItem.correct) totalScore += 100;
          }
        });
        const answered = Object.keys(allAnswers).length || 1;
        onComplete(totalScore / answered);
      }
    }, 400);
  };

  const answeredCount = Object.keys(answers).length;
  const progress = Math.round(((answeredCount + (selected !== null && answers[current] === undefined ? 1 : 0)) / questions.length) * 100);

  if (!permissionsGranted) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 600, background: 'var(--surface-1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', fontFamily: 'var(--font-body)' }}>
        <div style={{ width: 72, height: 72, borderRadius: 20, background: 'var(--brand-50)', border: '1px solid var(--brand-200)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Settings size={36} color="var(--brand-600)" />
        </div>
        <div style={{ textAlign: 'center', maxWidth: 420 }}>
          <p style={{ fontWeight: 900, fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>System Check</p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.5, marginBottom: '2rem' }}>
            To begin the proctored assessment, you must grant permission to use your camera and enable full screen mode.
          </p>
          <button 
            onClick={async () => {
              try {
                if (document.documentElement.requestFullscreen) {
                  await document.documentElement.requestFullscreen();
                }
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                streamRef.current = stream;
                if (hudVideoRef.current) hudVideoRef.current.srcObject = stream;
                setPermissionsGranted(true);
              } catch (err) {
                console.error("Permission denied", err);
                alert("You must allow camera access and fullscreen to continue.");
              }
            }}
            style={{ padding: '14px 28px', background: 'var(--brand-500)', color: 'white', border: 'none', borderRadius: 14, fontSize: '1.0625rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, margin: '0 auto', transition: 'all 0.2s', boxShadow: '0 8px 24px rgba(79,70,229,0.25)' }}
          >
            <Camera size={20} /> Grant Permissions & Start
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 600, background: 'var(--surface-1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
        <div style={{ width: 72, height: 72, borderRadius: 20, background: 'var(--brand-50)', border: '1px solid var(--brand-200)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Sparkles size={36} color="var(--brand-600)" style={{ animation: 'pulse 1.5s ease-in-out infinite' }} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontWeight: 900, fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Generating 20 Placement Questions...</p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>AI is customizing an evaluation suite for {course?.title}</p>
        </div>
        <div style={{ width: 200, height: 4, background: 'var(--surface-3)', borderRadius: 999, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: '60%', background: 'linear-gradient(90deg, var(--brand-500), var(--brand-400))', borderRadius: 999, animation: 'shimmer 1.5s ease-in-out infinite' }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 600, background: 'var(--surface-1)', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-body)' }}>

      {/* ── Security Overlays ── */}
      {focusWarning && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 9999, background: '#ef4444', color: 'white', padding: '0.625rem 2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 700, animation: 'slideDown 0.3s ease' }}>
          <AlertCircle size={16} /> Focus Warning: You navigated away from the tab. This has been recorded.
        </div>
      )}
      {fsWarning && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 9999, background: '#f59e0b', color: 'white', padding: '0.625rem 2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 700, animation: 'slideDown 0.3s ease' }}>
          <AlertCircle size={16} /> Security Warning: Fullscreen mode was exited!
          <button onClick={async () => { try { await document.documentElement.requestFullscreen(); } catch {} setFsWarning(false); }} style={{ background: 'white', color: '#f59e0b', border: 'none', padding: '4px 12px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', marginLeft: 16 }}>Return to Fullscreen</button>
        </div>
      )}
      {keyWarning && (
        <div style={{ position: 'fixed', top: '1.5rem', left: '50%', transform: 'translateX(-50%)', zIndex: 9998, background: '#ef4444', color: 'white', padding: '10px 24px', borderRadius: 12, fontWeight: 800, boxShadow: '0 8px 30px rgba(239,68,68,0.4)' }}>
          {keyWarning}
        </div>
      )}
      {activeBanner && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 9999,
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
              : activeBanner.type === 'voice_detected'
                ? '⚠️ BACKGROUND VOICE/AUDIO DETECTED — INCIDENT LOGGED!'
                : '⚠️ MULTIPLE PEOPLE DETECTED IN EXAM AREA!'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
             <span style={{ fontSize: '0.8125rem', opacity: 0.9 }}>WARNING LOGGED</span>
             <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               {activeBanner.countdown}
             </div>
          </div>
        </div>
      )}

      {/* ── Top Header Bar ── */}
      <div style={{ height: 64, background: 'var(--surface-0)', borderBottom: '1px solid var(--surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem', flexShrink: 0, position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--brand-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={18} color="var(--brand-600)" />
          </div>
          <div>
            <p style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--brand-600)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Placement Assessment</p>
            <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{course?.title}</p>
          </div>
        </div>

        {/* Progress Stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>Progress</p>
            <p style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--brand-600)', margin: 0 }}>{progress}%</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>Question</p>
            <p style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>{current + 1}<span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>/{questions.length}</span></p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>Answered</p>
            <p style={{ fontSize: '1.25rem', fontWeight: 900, color: '#10b981', margin: 0 }}>{answeredCount}</p>
          </div>
        </div>

        {/* Progress bar strip */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'var(--surface-2)' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #7c3aed, #a78bfa)', transition: 'width 0.4s ease' }} />
        </div>
      </div>

      {/* ── Body: Sidebar + Main ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* LEFT: Question Map Sidebar */}
        <div style={{ width: 230, background: 'var(--surface-0)', borderRight: '1px solid var(--surface-3)', overflowY: 'auto', padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '1rem', flexShrink: 0 }} className="hide-scrollbar">
          <p style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Question Map (20)</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {questions.map((_, i) => {
              const isAnswered = answers[i] !== undefined;
              const isCurrent = i === current;
              return (
                <button
                  key={i}
                  onClick={() => { if (!animating) { setCurrent(i); setSelected(answers[i] ?? null); } }}
                  style={{
                    width: '100%', aspectRatio: '1', borderRadius: 10,
                    border: isCurrent ? '2px solid var(--brand-500)' : '2px solid transparent',
                    background: isCurrent ? 'var(--brand-500)' : isAnswered ? 'rgba(16,185,129,0.15)' : 'var(--surface-2)',
                    color: isCurrent ? 'white' : isAnswered ? '#10b981' : 'var(--text-muted)',
                    fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {isAnswered && !isCurrent ? '✓' : i + 1}
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 6, paddingTop: '1rem', borderTop: '1px solid var(--surface-2)' }}>
            {[
              { color: 'var(--brand-500)', label: 'Current' },
              { color: 'rgba(16,185,129,0.4)', label: 'Answered' },
              { color: 'var(--surface-2)', label: 'Unanswered' }
            ].map(({ color, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: 4, background: color }} />
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 600 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* MAIN: Question Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '3rem 4rem', display: 'flex', flexDirection: 'column' }} className="hide-scrollbar">
          <div style={{ maxWidth: 740, width: '100%', margin: '0 auto', flex: 1 }}>

            {/* Question badge + text */}
            <div style={{ marginBottom: '2.5rem' }}>
              <span style={{ display: 'inline-block', fontSize: '0.6875rem', fontWeight: 800, color: 'var(--brand-600)', background: 'var(--brand-50)', padding: '4px 12px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.25rem' }}>
                Question {current + 1} of {questions.length}
              </span>
              <h2 style={{ fontSize: '1.625rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.4, letterSpacing: '-0.02em', margin: 0 }}>
                {q?.question}
              </h2>
            </div>

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', opacity: animating ? 0.4 : 1, transition: 'opacity 0.3s' }}>
              {q?.options?.map((option, idx) => {
                const isSelected = selected === idx || answers[current] === idx;
                const isDimmed = selected !== null && !isSelected;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(idx)}
                    disabled={selected !== null || answers[current] !== undefined}
                    style={{
                      padding: '1.25rem 1.75rem',
                      background: isSelected ? 'var(--brand-600)' : 'var(--surface-0)',
                      border: `2px solid ${isSelected ? 'var(--brand-600)' : 'var(--surface-3)'}`,
                      borderRadius: 16,
                      cursor: selected === null && answers[current] === undefined ? 'pointer' : 'default',
                      textAlign: 'left', display: 'flex', alignItems: 'center', gap: 16,
                      transition: 'all 0.2s',
                      opacity: isDimmed ? 0.4 : 1,
                      transform: isSelected ? 'scale(1.01)' : 'scale(1)',
                      fontFamily: 'var(--font-body)',
                      boxShadow: isSelected ? '0 8px 24px rgba(124,58,237,0.25)' : '0 1px 4px rgba(0,0,0,0.04)',
                    }}
                    onMouseEnter={e => { if (selected === null && answers[current] === undefined) { e.currentTarget.style.borderColor = 'var(--brand-400)'; e.currentTarget.style.background = 'var(--brand-50)'; } }}
                    onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.borderColor = 'var(--surface-3)'; e.currentTarget.style.background = 'var(--surface-0)'; } }}
                  >
                    <div style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, background: isSelected ? 'rgba(255,255,255,0.2)' : 'var(--surface-1)', border: `2px solid ${isSelected ? 'rgba(255,255,255,0.4)' : 'var(--surface-3)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {isSelected
                        ? <CheckCircle2 size={18} color="white" />
                        : <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--text-muted)' }}>{String.fromCharCode(65 + idx)}</span>
                      }
                    </div>
                    <span style={{ fontSize: '1.0625rem', fontWeight: 600, color: isSelected ? 'white' : 'var(--text-primary)', lineHeight: 1.4 }}>{option}</span>
                  </button>
                );
              })}
            </div>

            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '2.5rem' }}>
              Select an answer to advance automatically. You can jump to any question using the map on the left.
            </p>
          </div>
        </div>
      </div>

      {/* ── Camera HUD: Fixed Bottom-Right ── */}
      <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9990, display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
        {proctoring.status === 'tracking' && (proctoring.warnings > 0 || !proctoring.isFaceVisible || proctoring.isLookingAway) && !proctoring.lastViolation && (
          <div style={{ background: '#ef4444', color: 'white', padding: '8px 14px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 20px rgba(239,68,68,0.4)', maxWidth: 240 }}>
            <AlertCircle size={15} />
            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase' }}>Face Not Detected</div>
              <div style={{ fontSize: '0.625rem', opacity: 0.9 }}>Warning {proctoring.warnings}/3</div>
            </div>
          </div>
        )}
        <div style={{ position: 'relative', width: 180, height: 120, borderRadius: 14, overflow: 'hidden', border: `3px solid ${proctoring.status === 'tracking' && (!proctoring.isFaceVisible || proctoring.isLookingAway || proctoring.lastViolation) ? '#ef4444' : '#10b981'}`, boxShadow: '0 12px 32px rgba(0,0,0,0.35)', background: '#111' }}>
          <video ref={hudVideoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)', position: 'absolute', top: 0, left: 0 }} />
          {proctoring.annotatedFrame && (
            <img src={proctoring.annotatedFrame} alt="AI" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)', zIndex: 5 }} />
          )}
          <div style={{ position: 'absolute', bottom: 6, left: 6, right: 6, display: 'flex', justifyContent: 'space-between', zIndex: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(0,0,0,0.65)', padding: '3px 8px', borderRadius: 999, backdropFilter: 'blur(6px)' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: proctoring.status !== 'tracking' ? '#f59e0b' : (!proctoring.isFaceVisible || proctoring.lastViolation) ? '#ef4444' : '#10b981' }} />
              <span style={{ fontSize: '0.5625rem', fontWeight: 800, color: 'white', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {proctoring.status !== 'tracking' ? 'AI Init' : proctoring.lastViolation ? 'Violation' : !proctoring.isFaceVisible ? 'No Face' : 'Live'}
              </span>
            </div>
            <div style={{ background: 'rgba(239,68,68,0.85)', padding: '2px 6px', borderRadius: 999, display: 'flex', alignItems: 'center', gap: 3 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'white', animation: 'pulse 1.5s ease-in-out infinite' }} />
              <span style={{ fontSize: '0.5rem', fontWeight: 900, color: 'white' }}>REC</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer { 0%,100% { opacity:0.6; } 50% { opacity:1; } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
      `}</style>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Phase 3: Path Reveal
// ────────────────────────────────────────────────────────────────────────────
function PhasePathReveal({ result, courseId, onConfirm }) {
  const [choosing, setChoosing] = useState(false);
  const recommended = PATH_CONFIG[result?.recommended_path] || PATH_CONFIG.basics;
  const paths = ['basics', 'intermediate', 'advanced'];

  const handleConfirm = async (overrideToBasics) => {
    setChoosing(true);
    try {
      await coursesAPI.submitPlacementResult(courseId, result.score, overrideToBasics);
      onConfirm(overrideToBasics ? 'basics' : result.recommended_path);
    } catch {
      toast.error('Failed to save your path. Please try again.');
      setChoosing(false);
    }
  };

  const scoreColor = result?.score >= 70 ? '#059669' : result?.score >= 40 ? '#7c3aed' : '#0e7490';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', flex: 1 }}>
      {/* Score display */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{ position: 'relative', width: 120, height: 120, margin: '0 auto 1.25rem' }}>
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="50" fill="none" stroke="var(--surface-2)" strokeWidth="10" />
            <circle cx="60" cy="60" r="50" fill="none" stroke={scoreColor} strokeWidth="10"
              strokeDasharray={`${2 * Math.PI * 50}`}
              strokeDashoffset={`${2 * Math.PI * 50 * (1 - (result?.score || 0) / 100)}`}
              strokeLinecap="round" transform="rotate(-90 60 60)"
              style={{ transition: 'stroke-dashoffset 1s ease' }}
            />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>{Math.round(result?.score || 0)}%</span>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Score</span>
          </div>
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: 6 }}>
          Placement Assessment Complete!
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
          Based on your responses, we recommend the <strong style={{ color: recommended.color }}>{recommended.label}</strong>.
        </p>
      </div>

      {/* Path Lane Visual */}
      <div style={{ display: 'flex', gap: '0.875rem', width: '100%', marginBottom: '2.5rem' }}>
        {paths.map(p => {
          const cfg = PATH_CONFIG[p];
          const isRecommended = p === result?.recommended_path;
          return (
            <div key={p} style={{
              flex: isRecommended ? 1.5 : 1,
              padding: '1.25rem',
              borderRadius: 16,
              border: `2px solid ${isRecommended ? cfg.color : 'var(--surface-3)'}`,
              background: isRecommended ? cfg.bg : 'var(--surface-0)',
              transition: 'all 0.4s',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {isRecommended && (
                <div style={{ position: 'absolute', top: 0, right: 0, background: cfg.color, color: 'white', fontSize: '0.625rem', fontWeight: 800, padding: '4px 10px', borderRadius: '0 0 0 8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Recommended
                </div>
              )}
              <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>{cfg.emoji}</div>
              <p style={{ fontWeight: 800, fontSize: '0.875rem', color: isRecommended ? cfg.color : 'var(--text-muted)', marginBottom: 4 }}>{cfg.label}</p>
              {isRecommended && <p style={{ fontSize: '0.75rem', color: cfg.color, lineHeight: 1.4, opacity: 0.8 }}>{cfg.desc}</p>}
              <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', marginTop: 8 }}>{cfg.score}</p>
            </div>
          );
        })}
      </div>

      {/* CTA Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 480 }}>
        <button
          onClick={() => handleConfirm(false)}
          disabled={choosing}
          className="btn btn-primary"
          style={{ height: 54, borderRadius: 14, fontSize: '1.0625rem', gap: 8, background: recommended.color, borderColor: recommended.color, boxShadow: `0 4px 18px ${recommended.color}40` }}
        >
          {choosing
            ? <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
            : <><GraduationCap size={18} /> Start at {recommended.label} <ArrowRight size={16} /></>
          }
        </button>

        {result?.recommended_path !== 'basics' && (
          <button
            onClick={() => handleConfirm(true)}
            disabled={choosing}
            style={{
              height: 48, borderRadius: 14, fontSize: '0.9375rem', fontWeight: 700,
              border: '1.5px solid var(--surface-3)', background: 'white',
              color: 'var(--text-secondary)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              fontFamily: 'var(--font-body)', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand-400)'; e.currentTarget.style.color = 'var(--brand-600)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--surface-3)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <RotateCcw size={16} /> Start from Basics instead
          </button>
        )}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Main Orchestrator
// ────────────────────────────────────────────────────────────────────────────
export default function PlacementAssessmentModal({ course, startAtPhase = 1, onPlacementComplete, onClose }) {
  const navigate = useNavigate();
  const [phase, setPhase] = useState(startAtPhase);      // 1 = Foundation, 2 = Assessment, 3 = PathReveal
  const [placementResult, setPlacementResult] = useState(null);
  const [showDosDonts, setShowDosDonts] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [prefetchedQuestions, setPrefetchedQuestions] = useState(null);

  const courseId = course?.id;

  // Pre-fetch questions in background as soon as modal opens
  useEffect(() => {
    let isMounted = true;
    const fetchQuestions = async () => {
      try {
        const res = await aiTutorAPI.generateQuiz(courseId, course?.title, 'mixed', 20);
        const raw = res.data;
        let loaded = [];
        if (raw?.questions?.length) {
          loaded = raw.questions;
        } else if (Array.isArray(raw) && raw.length > 0) {
          loaded = raw;
        }
        
        if (!isMounted) return;

        if (loaded.length >= 5) {
          setPrefetchedQuestions(loaded.map(q => ({
            question: q.question,
            options: q.options || ['Option A', 'Option B', 'Option C', 'Option D'],
            correct: q.correct_index ?? (typeof q.answer === 'number' ? q.answer : (q.options?.indexOf(q.answer) >= 0 ? q.options.indexOf(q.answer) : 0)),
            weight: null,
          })));
        } else {
          setPrefetchedQuestions(FALLBACK_QUESTIONS(course?.title || 'this course'));
        }
      } catch {
        if (isMounted) setPrefetchedQuestions(FALLBACK_QUESTIONS(course?.title || 'this course'));
      }
    };
    fetchQuestions();
    return () => { isMounted = false; };
  }, [courseId, course?.title]);

  // Start countdown when Do's & Don'ts shown
  useEffect(() => {
    if (!showDosDonts) return;
    setCountdown(5);
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [showDosDonts]);

  const handleAssessmentComplete = (score) => {
    const recommended = score < 40 ? 'basics' : score < 70 ? 'intermediate' : 'advanced';
    setPlacementResult({ score, recommended_path: recommended, assigned_path: recommended });
    setPhase(3);
  };

  const handlePathConfirmed = async (assignedPath) => {
    toast.success(`🎉 ${PATH_CONFIG[assignedPath]?.label} unlocked! Ready to learn.`, { duration: 4000 });
    
    try {
      await cognitiveAPI.evaluate({
        event: 'Placement Assessment Completed',
        score: placementResult?.score || 0,
        topic: course?.title || 'Placement Assessment'
      });
    } catch (err) {
      console.warn('Could not update cognitive profile:', err);
    }

    if (onPlacementComplete) {
      onPlacementComplete(assignedPath);
    }
    setTimeout(() => {
      navigate('/student/cognitive');
    }, 800);
    onClose();
  };

  // If Phase 2, render full-screen Exam Arena directly without modal box wrapper
  if (phase === 2) {
    return (
      <PhaseAssessment
        course={course}
        courseId={courseId}
        onComplete={handleAssessmentComplete}
        prefetchedQuestions={prefetchedQuestions}
      />
    );
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 500,
      background: 'rgba(0,0,0,0.5)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
    }}>
      <div style={{
        background: 'white',
        borderRadius: 28,
        width: '100%',
        maxWidth: 640,
        maxHeight: '95vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 40px 100px rgba(0,0,0,0.2)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '1.75rem 2rem 1.25rem', borderBottom: '1px solid var(--surface-2)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--brand-600)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
              {course?.category || 'Course'} Enrollment
            </p>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.3, maxWidth: 380 }}>{course?.title}</h2>
          </div>
          <button onClick={onClose} style={{ background: 'var(--surface-2)', border: 'none', borderRadius: 10, padding: 8, cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', flexShrink: 0 }}>
            <X size={20} />
          </button>
        </div>

        {/* Stepper */}
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--surface-2)', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
          <Stepper phase={phase} />
        </div>

        {/* Phase Content */}
        <div style={{ padding: '2rem 2.5rem', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {phase === 1 && (
            <PhaseFoundation
              course={course}
              onNext={() => setShowDosDonts(true)}
              onClose={onClose}
            />
          )}
          {phase === 3 && placementResult && (
            <PhasePathReveal
              result={placementResult}
              courseId={courseId}
              onConfirm={handlePathConfirmed}
            />
          )}
        </div>
      </div>

      {/* ── Do's & Don'ts Popup Overlay ── */}
      {showDosDonts && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem',
          animation: 'fadeIn 0.3s ease',
        }}>
          <div style={{
            width: '100%', maxWidth: 580,
            background: 'var(--surface-0)',
            borderRadius: 28,
            boxShadow: '0 40px 100px rgba(0,0,0,0.2)',
            overflow: 'hidden',
            animation: 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}>
            {/* Header */}
            <div style={{
              background: 'var(--brand-50)',
              padding: '2rem 2.5rem 1.5rem',
              borderBottom: '1px solid var(--brand-100)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📋</div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--brand-900)', letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>
                Before You Begin Assessment
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--brand-600)', margin: 0 }}>
                Please review the proctoring guidelines carefully
              </p>
            </div>

            {/* Rules Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', padding: '1.75rem 2.5rem' }}>
              {/* Do's */}
              <div style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: 16,
                padding: '1.25rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem' }}>✅</div>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 900, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Do's</span>
                </div>
                {[
                  '🎥 Keep face visible always',
                  '💡 Stay in a well-lit room',
                  '🖥️ Use only this tab',
                  '📝 Answer all 20 questions',
                  '🎧 Stay quiet & focused',
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: '0.5rem' }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', flexShrink: 0, marginTop: 6 }} />
                    <p style={{ fontSize: '0.8125rem', color: '#166534', margin: 0, lineHeight: 1.5 }}>{item}</p>
                  </div>
                ))}
              </div>

              {/* Don'ts */}
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 16,
                padding: '1.25rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem' }}>🚫</div>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 900, color: '#991b1b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Don'ts</span>
                </div>
                {[
                  '🔀 Switch tabs or windows',
                  '⌨️ Press F1–F12 keys',
                  '🖥️ Exit fullscreen mode',
                  '📱 Use secondary devices',
                  '🗣️ Talk to others around',
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: '0.5rem' }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#ef4444', flexShrink: 0, marginTop: 6 }} />
                    <p style={{ fontSize: '0.8125rem', color: '#991b1b', margin: 0, lineHeight: 1.5 }}>{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Warning strip */}
            <div style={{
              margin: '0 2.5rem',
              padding: '0.875rem 1.25rem',
              background: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: 12,
              display: 'flex', alignItems: 'flex-start', gap: 10,
              marginBottom: '1.5rem',
            }}>
              <span style={{ fontSize: '1.125rem', flexShrink: 0 }}>⚠️</span>
              <p style={{ fontSize: '0.8125rem', color: '#b45309', margin: 0, lineHeight: 1.5 }}>
                <strong>Violations are logged.</strong> Tab switching or face-away detections will flag your assessment for review.
              </p>
            </div>

            {/* CTA */}
            <div style={{ padding: '0 2.5rem 2rem', display: 'flex', gap: 12, alignItems: 'center' }}>
              <button
                onClick={() => setShowDosDonts(false)}
                style={{
                  flex: '0 0 auto',
                  padding: '12px 20px',
                  background: 'var(--surface-1)',
                  border: '1px solid var(--surface-3)',
                  borderRadius: 14,
                  color: 'var(--text-secondary)',
                  fontSize: '0.875rem', fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                }}
              >
                ← Back
              </button>
              <button
                onClick={() => {
                  if (countdown > 0) return;
                  setShowDosDonts(false);
                  setPhase(2);
                }}
                disabled={countdown > 0}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: countdown > 0 ? 'var(--surface-2)' : 'var(--brand-500)',
                  border: 'none',
                  borderRadius: 14,
                  color: countdown > 0 ? 'var(--text-muted)' : 'white',
                  fontSize: '1rem', fontWeight: 900,
                  cursor: countdown > 0 ? 'not-allowed' : 'pointer',
                  fontFamily: 'var(--font-body)',
                  transition: 'all 0.4s ease',
                  boxShadow: countdown > 0 ? 'none' : '0 8px 24px rgba(79,70,229,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                }}
              >
                {countdown > 0 ? (
                  <>
                    <span style={{
                      width: 28, height: 28, borderRadius: '50%',
                      border: '2px solid var(--text-muted)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.875rem', fontWeight: 900, color: 'var(--text-muted)',
                    }}>{countdown}</span>
                    Read rules carefully...
                  </>
                ) : (
                  <>✅ I Understand — Start Quiz</>
                )}
              </button>
            </div>
          </div>

          <style>{`
            @keyframes slideUp { from { opacity: 0; transform: translateY(40px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
          `}</style>
        </div>
      )}
    </div>
  );
}
