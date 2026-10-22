import { useState, useEffect, useRef, useCallback } from 'react';
import { coursesAPI, aiTutorAPI, cognitiveAPI, proctoringAPI } from '../../services/api.service';
import { useProctoring } from '../../hooks/useProctoring';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  BookOpen, Zap, Target, ArrowRight, X, CheckCircle2, Circle, ChevronRight,
  Brain, Sparkles, Trophy, ArrowLeft, Clock, RotateCcw, GraduationCap, AlertCircle,
  Settings, Camera, ShieldAlert
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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '0.5rem', flex: 1 }}>
      <div style={{ width: 80, height: 80, borderRadius: 24, background: 'var(--surface-1)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', transition: 'all 0.3s' }}>
        {current.icon}
      </div>

      <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '0.75rem', lineHeight: 1.2 }}>{current.heading}</h2>
      <p style={{ fontSize: '1.0625rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 520, marginBottom: '2rem' }}>{current.body}</p>

      {/* Dot indicators */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '2rem' }}>
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

const FALLBACK_TOPIC_QUESTIONS = (courseTitle, level, topics) => {
  const safeTopics = (topics && topics.length > 0) ? topics : [
    'Core Syntax & Semantics',
    'Data Structures & Algorithms',
    'Architecture & Control Flow',
    'Error Handling & Exceptions',
    'State & Lifecycle Management'
  ];
  return safeTopics.map((topic, i) => ({
    question: `In ${courseTitle || 'software engineering'}, which best applies to "${topic}" at the ${level || 'curriculum'} level?`,
    options: [
      `It establishes essential modularity, predictability, and efficiency in ${topic}.`,
      `It is an optional syntax extension rarely utilized in production code.`,
      `It bypasses error handling and directly operates with unchecked parameters.`,
      `It executes only during offline compilation phases.`
    ],
    correct: 0,
    weight: null,
  }));
};

function PhaseAssessment({ course, courseId, onComplete, prefetchedQuestions, initialStream, assessmentTitle }) {
  const [questions, setQuestions] = useState(prefetchedQuestions || []);
  const [loading, setLoading] = useState(!prefetchedQuestions || prefetchedQuestions.length === 0);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionIdx: selectedIdx }
  const [selected, setSelected] = useState(null);
  const [animating, setAnimating] = useState(false);

  // Security states & Violation Tracking
  const MAX_VIOLATIONS = 5;
  const [violationCount, setViolationCount] = useState(0);
  const violationCountRef = useRef(0);
  const [focusWarning, setFocusWarning] = useState(false);
  const [keyWarning, setKeyWarning] = useState('');
  const [fsWarning, setFsWarning] = useState(false);
  const [activeBanner, setActiveBanner] = useState(null);
  const violationTimerRef = useRef(null);
  const isTerminatingRef = useRef(false);
  const lastViolationTimeRef = useRef({});

  const hudVideoRef = useRef(null);
  const streamRef = useRef(initialStream || null);

  // Centralized Violation Handler for Placement Assessment
  const handleViolation = useCallback((violationType, description, snapshot = null) => {
    if (loading || isTerminatingRef.current) return;

    const now = Date.now();
    const lastTime = lastViolationTimeRef.current[violationType] || 0;
    if (now - lastTime < 2500) return;
    lastViolationTimeRef.current[violationType] = now;

    let capturedSnapshot = snapshot;
    if (!capturedSnapshot && hudVideoRef.current && hudVideoRef.current.videoWidth) {
      try {
        const c = document.createElement('canvas');
        c.width = 320;
        c.height = 240;
        const ctx = c.getContext('2d');
        ctx.drawImage(hudVideoRef.current, 0, 0, 320, 240);
        capturedSnapshot = c.toDataURL('image/jpeg', 0.6);
      } catch (e) {}
    }

    violationCountRef.current = (violationCountRef.current || 0) + 1;
    const nextCount = violationCountRef.current;
    setViolationCount(nextCount);

    if (nextCount < MAX_VIOLATIONS) {
      const riskScore = Math.min(100, nextCount * 20);
      proctoringAPI.logViolation({
        exam_id: courseId || 1,
        violation_type: violationType,
        severity: nextCount >= 3 ? 'high' : 'medium',
        description: `Warning ${nextCount}/${MAX_VIOLATIONS}: ${description}`,
        cumulative_risk_score: riskScore,
        screenshot: capturedSnapshot,
      }).catch(err => console.error('Failed to log violation:', err));

      toast.error(`⚠️ Warning ${nextCount}/${MAX_VIOLATIONS}: ${description}`, {
        id: 'placement-warn-toast',
        duration: 4000,
      });

      let countdown = 5;
      setActiveBanner({
        type: violationType,
        text: description,
        warningNum: nextCount,
        maxWarnings: MAX_VIOLATIONS,
        countdown,
      });

      if (violationTimerRef.current) clearInterval(violationTimerRef.current);
      violationTimerRef.current = setInterval(() => {
        countdown -= 1;
        setActiveBanner(b => (b && b.type !== 'terminated' ? { ...b, countdown } : null));
        if (countdown <= 0) {
          clearInterval(violationTimerRef.current);
          setActiveBanner(null);
        }
      }, 1000);
    } else {
      isTerminatingRef.current = true;
      if (violationTimerRef.current) clearInterval(violationTimerRef.current);

      proctoringAPI.logViolation({
        exam_id: courseId || 1,
        violation_type: 'exam_terminated',
        severity: 'critical',
        description: `Maximum warnings limit reached (5/5). Assessment auto-terminated. Reason: ${description}`,
        cumulative_risk_score: 100,
        screenshot: capturedSnapshot,
      }).catch(err => console.error('Failed to log violation:', err));

      toast.error('🚨 MAXIMUM WARNINGS EXCEEDED (5/5). Assessment automatically ended!', {
        id: 'placement-term-toast',
        duration: 6000,
      });

      setActiveBanner({
        type: 'terminated',
        text: '5 Proctoring Warnings Exceeded — Assessment Terminated',
        countdown: 0,
      });

      setTimeout(() => {
        try { if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen(); } catch {}
        onComplete(0);
      }, 1200);
    }
  }, [loading, courseId, onComplete]);

  const proctoring = useProctoring({
    onViolation: (type, desc, snapshot) => {
      handleViolation(type, desc, snapshot);
    }
  });

  // Handle initialStream from waiting room or fallback camera init
  useEffect(() => {
    if (initialStream) {
      streamRef.current = initialStream;
      if (hudVideoRef.current && hudVideoRef.current.srcObject !== initialStream) {
        hudVideoRef.current.srcObject = initialStream;
      }
      return () => {
        if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
        proctoring.stopTracking();
      };
    }

    let active = true;
    const initCamera = async () => {
      try {
        if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
        }
      } catch {}
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (!active) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }
        streamRef.current = stream;
        if (hudVideoRef.current) {
          hudVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn("Camera auto-init: device not found or denied:", err);
      }
    };
    initCamera();
    return () => {
      active = false;
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      proctoring.stopTracking();
    };
  }, [initialStream]);

  // Start MediaPipe tracking when video or questions become ready
  useEffect(() => {
    if (!loading && streamRef.current && hudVideoRef.current) {
      if (hudVideoRef.current.srcObject !== streamRef.current) {
        hudVideoRef.current.srcObject = streamRef.current;
      }
      proctoring.startTracking(hudVideoRef.current, courseId || 1);
    }
  }, [loading, proctoring.startTracking, courseId]);

  // Load prefetched questions
  useEffect(() => {
    if (prefetchedQuestions && prefetchedQuestions.length > 0) {
      setQuestions(prefetchedQuestions);
      setLoading(false);
    }
  }, [prefetchedQuestions]);

  // Fullscreen cleanup
  useEffect(() => {
    return () => { try { if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen(); } catch {} };
  }, []);

  // Blur & Tab Switch
  useEffect(() => {
    const onBlur = () => {
      setFocusWarning(true);
      handleViolation('tab_switch', 'Tab switch or window defocus detected');
    };
    const onVisibility = () => {
      if (document.hidden) {
        setFocusWarning(true);
        handleViolation('tab_switch', 'Navigated away from assessment window');
      }
    };
    const onFocus = () => setFocusWarning(false);
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [handleViolation]);

  // Keys
  useEffect(() => {
    const onKey = (e) => {
      if (e.key.match(/^F(1[0-2]|[1-9])$/) || (e.altKey && e.key === 'Tab')) {
        e.preventDefault();
        setKeyWarning(`Blocked: ${e.key} is not allowed during assessment.`);
        setTimeout(() => setKeyWarning(''), 4000);
        handleViolation('forbidden_key', `Prohibited key shortcut attempt: ${e.key}`);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleViolation]);

  // Fullscreen Exit
  useEffect(() => {
    const onChange = () => {
      if (!document.fullscreenElement) {
        setFsWarning(true);
        handleViolation('screen_resize', 'Exited fullscreen examination mode');
      }
    };
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, [handleViolation]);

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
            <p style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--brand-600)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>{assessmentTitle || 'Placement Assessment'}</p>
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
// Phase 3 (Alt): Level Test Completion & Topic Mastery Screen
// ────────────────────────────────────────────────────────────────────────────
function PhaseLevelResult({ result, courseId, level, levelTitle, topics, onPass, onClose }) {
  const [submitting, setSubmitting] = useState(false);
  const score = Math.round(result?.score || 0);
  const passed = score >= 60;
  const scoreColor = passed ? '#10b981' : '#ef4444';

  const handleFinish = async () => {
    setSubmitting(true);
    try {
      if (passed) {
        await coursesAPI.submitLevelTestResult(courseId, { level, score, passed: true });
        try {
          const key = `adaptive_level_passed_${courseId}`;
          const current = JSON.parse(localStorage.getItem(key) || '[]');
          if (!current.includes(level)) {
            localStorage.setItem(key, JSON.stringify([...current, level]));
          }
        } catch (e) {}

        toast.success(`🎉 ${levelTitle || level} Passed! Next level unlocked.`, { duration: 4000 });
        if (onPass) onPass(level, score);
      }
    } catch (e) {
      console.error('Failed to submit level test result:', e);
      if (onPass) onPass(level, score);
    } finally {
      setSubmitting(false);
      onClose();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', flex: 1, padding: '1rem 0' }}>
      {/* Circular score gauge */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ position: 'relative', width: 130, height: 130, margin: '0 auto 1.25rem' }}>
          <svg width="130" height="130" viewBox="0 0 130 130">
            <circle cx="65" cy="65" r="54" fill="none" stroke="var(--surface-2)" strokeWidth="10" />
            <circle cx="65" cy="65" r="54" fill="none" stroke={scoreColor} strokeWidth="10"
              strokeDasharray={`${2 * Math.PI * 54}`}
              strokeDashoffset={`${2 * Math.PI * 54 * (1 - score / 100)}`}
              strokeLinecap="round" transform="rotate(-90 65 65)"
              style={{ transition: 'stroke-dashoffset 1s ease' }}
            />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>{score}%</span>
            <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: scoreColor, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>
              {passed ? 'Passed' : 'Needs Review'}
            </span>
          </div>
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 999, background: passed ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: scoreColor, fontWeight: 800, fontSize: '0.8125rem', marginBottom: '0.75rem' }}>
          {passed ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {passed ? 'Level Benchmark Met (≥ 60%)' : 'Passing Threshold is 60%'}
        </div>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 0.5rem' }}>
          {passed ? `🎉 ${levelTitle || `${level.toUpperCase()} Test`} Cleared!` : 'Review Topics and Try Again'}
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', margin: 0, maxWidth: 480 }}>
          {passed
            ? 'Great job! You demonstrated mastery of all core topics tested in this level.'
            : 'You are close, but need at least 60% to officially clear this level. Take some time to review the materials.'}
        </p>
      </div>

      {/* Completed Topics Evaluated Breakdown */}
      {topics && topics.length > 0 && (
        <div style={{ width: '100%', maxWidth: 520, background: 'var(--surface-0)', border: '1px solid var(--surface-3)', borderRadius: 16, padding: '1.25rem', marginBottom: '2rem' }}>
          <p style={{ margin: '0 0 0.75rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Evaluated Curriculum Topics ({topics.length})
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {topics.map((t, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: 'var(--surface-1)', borderRadius: 10 }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>{t}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: passed ? '#10b981' : '#f59e0b', display: 'flex', alignItems: 'center', gap: 4 }}>
                  {passed ? <CheckCircle2 size={14} color="#10b981" /> : <Circle size={12} color="#f59e0b" />}
                  {passed ? 'Mastered' : 'Reviewed'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '1rem', width: '100%', maxWidth: 420 }}>
        {passed ? (
          <button
            onClick={handleFinish}
            disabled={submitting}
            style={{
              flex: 1, height: 48, borderRadius: 14, fontSize: '0.9375rem', fontWeight: 800,
              border: 'none', background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: '0 4px 16px rgba(16,185,129,0.3)', transition: 'transform 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            {submitting ? 'Updating...' : 'Unlock Next Level & Continue'} <ArrowRight size={18} />
          </button>
        ) : (
          <>
            <button
              onClick={onClose}
              style={{
                flex: 1, height: 48, borderRadius: 14, fontSize: '0.875rem', fontWeight: 700,
                border: '1px solid var(--surface-3)', background: 'var(--surface-0)',
                color: 'var(--text-secondary)', cursor: 'pointer'
              }}
            >
              Review Lessons
            </button>
            <button
              onClick={() => {
                window.location.reload();
              }}
              style={{
                flex: 1, height: 48, borderRadius: 14, fontSize: '0.875rem', fontWeight: 800,
                border: 'none', background: 'var(--brand-500)',
                color: 'white', cursor: 'pointer'
              }}
            >
              Retake Assessment
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Main Orchestrator
// ────────────────────────────────────────────────────────────────────────────
export default function PlacementAssessmentModal({ 
  course, 
  startAtPhase = 1, 
  onPlacementComplete, 
  onClose,
  assessmentType = 'placement', // 'placement' | 'level'
  level = 'fundamentals',
  levelTitle = '',
  topics = [],
  onLevelTestPass,
}) {
  const navigate = useNavigate();
  const [phase, setPhase] = useState(startAtPhase);      // 1 = Foundation, 2 = Assessment, 3 = PathReveal / LevelResult
  const [placementResult, setPlacementResult] = useState(null);
  const [showLobby, setShowLobby] = useState(startAtPhase === 2);
  const [hardwareChecked, setHardwareChecked] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [mediaStream, setMediaStream] = useState(null);
  const lobbyVideoRef = useRef(null);
  const [prefetchedQuestions, setPrefetchedQuestions] = useState(null);

  const courseId = course?.id;

  const defaultLevelTitles = {
    fundamentals: 'Level 1: Fundamentals Mastery Test',
    beginner: 'Level 2: Beginner Mastery Test',
    basics: 'Level 2: Beginner Mastery Test',
    intermediate: 'Level 3: Intermediate Mastery Test',
    advanced: 'Level 4: Advanced Mastery Test',
  };
  const displayLevelTitle = levelTitle || defaultLevelTitles[level] || `${level.toUpperCase()} Mastery Test`;

  // Pre-fetch questions in background as soon as modal opens
  useEffect(() => {
    let isMounted = true;
    const fetchQuestions = async () => {
      try {
        const queryTopic = topics && topics.length > 0
          ? `${course?.title || 'Course'} - ${level.toUpperCase()} Level: ${topics.join(', ')}`
          : `${course?.title || 'Course'} ${level} concepts`;
        const diff = level === 'advanced' ? 'hard' : level === 'intermediate' ? 'medium' : 'easy';
        const numQ = assessmentType === 'level' ? 10 : 20;

        const res = await aiTutorAPI.generateQuiz(courseId, queryTopic, diff, numQ);
        const raw = res.data;
        let loaded = [];
        if (raw?.questions?.length) {
          loaded = raw.questions;
        } else if (Array.isArray(raw) && raw.length > 0) {
          loaded = raw;
        }
        
        if (!isMounted) return;

        if (loaded.length >= 3) {
          setPrefetchedQuestions(loaded.map(q => ({
            question: q.question,
            options: q.options || ['Option A', 'Option B', 'Option C', 'Option D'],
            correct: q.correct_index ?? (typeof q.answer === 'number' ? q.answer : (q.options?.indexOf(q.answer) >= 0 ? q.options.indexOf(q.answer) : 0)),
            weight: null,
          })));
        } else {
          setPrefetchedQuestions(
            assessmentType === 'level'
              ? FALLBACK_TOPIC_QUESTIONS(course?.title || 'this course', level, topics)
              : FALLBACK_QUESTIONS(course?.title || 'this course')
          );
        }
      } catch {
        if (isMounted) {
          setPrefetchedQuestions(
            assessmentType === 'level'
              ? FALLBACK_TOPIC_QUESTIONS(course?.title || 'this course', level, topics)
              : FALLBACK_QUESTIONS(course?.title || 'this course')
          );
        }
      }
    };
    fetchQuestions();
    return () => { isMounted = false; };
  }, [courseId, course?.title, assessmentType, level, topics]);

  // Hardware & Camera check for Waiting Room
  useEffect(() => {
    if (showLobby) {
      let active = true;
      navigator.mediaDevices?.getUserMedia({ video: true, audio: true })
        .then(stream => {
          if (!active) {
            stream.getTracks().forEach(t => t.stop());
            return;
          }
          setMediaStream(stream);
          setHardwareChecked(true);
        })
        .catch(() => {
          navigator.mediaDevices?.getUserMedia({ video: true })
            .then(stream => {
              if (!active) {
                stream.getTracks().forEach(t => t.stop());
                return;
              }
              setMediaStream(stream);
              setHardwareChecked(true);
            })
            .catch(err => {
              console.warn('Webcam access unavailable or denied:', err);
              setHardwareChecked(true);
            });
        });
      return () => {
        active = false;
      };
    }
  }, [showLobby]);

  useEffect(() => {
    if (lobbyVideoRef.current && mediaStream && lobbyVideoRef.current.srcObject !== mediaStream) {
      lobbyVideoRef.current.srcObject = mediaStream;
    }
  }, [mediaStream, showLobby]);

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

  // If Phase 2 and lobby completed, render full-screen Exam Arena directly without modal box wrapper
  if (phase === 2 && !showLobby) {
    return (
      <PhaseAssessment
        course={course}
        courseId={courseId}
        onComplete={handleAssessmentComplete}
        prefetchedQuestions={prefetchedQuestions}
        initialStream={mediaStream}
        assessmentTitle={displayLevelTitle}
      />
    );
  }

  // ── Exam Waiting Room / Lobby (Identical to Exam Arena) ──
  if (showLobby) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'var(--surface-1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '2rem', overflowY: 'auto',
        fontFamily: 'var(--font-body)',
        animation: 'fadeIn 0.3s ease'
      }}>
        <div style={{ maxWidth: 640, width: '100%' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--brand-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <ShieldAlert size={32} color="var(--brand-500)" />
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Exam Waiting Room</h1>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
              You are about to start <strong>{displayLevelTitle}</strong> for <strong>{course?.title || 'Course'}</strong>. Please complete verification.
            </p>
            {assessmentType === 'level' && topics && topics.length > 0 && (
              <div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', maxWidth: 520, margin: '0.75rem auto 0' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>Tested Topics:</span>
                {topics.map((t, idx) => (
                  <span key={idx} style={{ fontSize: '0.6875rem', fontWeight: 800, background: 'var(--surface-2)', padding: '2px 8px', borderRadius: 999, color: 'var(--brand-700)', border: '1px solid var(--surface-3)' }}>
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div style={{ background: 'var(--surface-0)', borderRadius: 20, border: '1px solid var(--surface-3)', boxShadow: '0 8px 30px rgba(0,0,0,0.04)', padding: '2rem', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Hardware & Environment Check</h3>
            
            <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
              <div style={{ width: 160, height: 120, background: 'var(--surface-2)', borderRadius: 12, overflow: 'hidden', position: 'relative', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: hardwareChecked ? '2px solid #10b981' : '2px solid var(--surface-3)' }}>
                <video
                  ref={el => {
                    lobbyVideoRef.current = el;
                    if (el && mediaStream && el.srcObject !== mediaStream) el.srcObject = mediaStream;
                  }}
                  autoPlay playsInline muted
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
                />
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
            <button
              onClick={() => {
                if (mediaStream) mediaStream.getTracks().forEach(t => t.stop());
                setShowLobby(false);
                onClose();
              }}
              style={{ padding: '12px 24px', borderRadius: 999, background: 'var(--surface-0)', border: '1px solid var(--surface-3)', color: 'var(--text-primary)', fontWeight: 800, fontSize: '0.9375rem', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button 
              onClick={async () => {
                if (!hardwareChecked || !agreedToTerms) return;
                try {
                  if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
                    await document.documentElement.requestFullscreen();
                  }
                } catch (err) {}
                setShowLobby(false);
                setPhase(2);
              }}
              disabled={!hardwareChecked || !agreedToTerms}
              style={{
                padding: '12px 32px',
                borderRadius: 999,
                background: hardwareChecked && agreedToTerms ? 'var(--brand-500)' : 'var(--surface-3)',
                color: hardwareChecked && agreedToTerms ? 'white' : 'var(--text-muted)',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.9375rem',
                cursor: hardwareChecked && agreedToTerms ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
                boxShadow: hardwareChecked && agreedToTerms ? '0 4px 12px rgba(79,70,229,0.3)' : 'none'
              }}
            >
              Start Examination
            </button>
          </div>

        </div>
      </div>
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
        <div style={{ padding: '1.5rem 2.5rem 2rem', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {phase === 1 && (
            <PhaseFoundation
              course={course}
              onNext={() => setShowLobby(true)}
              onClose={onClose}
            />
          )}
          {phase === 3 && placementResult && (
            assessmentType === 'level' ? (
              <PhaseLevelResult
                result={placementResult}
                courseId={courseId}
                level={level}
                levelTitle={displayLevelTitle}
                topics={topics}
                onPass={onLevelTestPass}
                onClose={onClose}
              />
            ) : (
              <PhasePathReveal
                result={placementResult}
                courseId={courseId}
                onConfirm={handlePathConfirmed}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}
