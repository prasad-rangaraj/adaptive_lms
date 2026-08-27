import { useState, useEffect, useRef } from 'react';
import { ShieldCheck, AlertCircle, Camera, Mic, Eye, Clock, ChevronLeft, ChevronRight, Activity, BrainCircuit, Trophy, ArrowRight, ShieldAlert, CheckCircle2, FileText, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const questions = [
  {
    id: 1,
    q: 'What is the time complexity of searching in a balanced Binary Search Tree?',
    options: ['O(1)', 'O(n)', 'O(log n)', 'O(n log n)'],
    correct: 2,
    topic: 'Algorithmic Complexity',
  },
  {
    id: 2,
    q: 'Which traversal visits the root node first?',
    options: ['In-order', 'Pre-order', 'Post-order', 'Level-order'],
    correct: 1,
    topic: 'Tree Traversal',
  },
  {
    id: 3,
    q: 'A complete binary tree of height h has at most __ nodes.',
    options: ['2^h', '2^h - 1', '2^(h+1) - 1', 'h^2'],
    correct: 2,
    topic: 'Binary Tree Properties',
  },
];

const availableExams = [
  { id: 1, title: 'Data Structures — Midterm', course: 'Computer Science', date: 'Today', duration: '45 mins', questions: 3, status: 'active' },
  { id: 2, title: 'Operating Systems — CA2', course: 'Computer Science', date: 'Oct 15', duration: '60 mins', questions: 50, status: 'upcoming' },
  { id: 3, title: 'Database Systems — CA1', course: 'Computer Science', date: 'Sep 2', duration: '30 mins', questions: 25, status: 'completed', score: '22/25' },
];

export default function StudentExamArena() {
  const navigate = useNavigate();
  // State: 'list' -> 'lobby' -> 'active' -> 'submitted'
  const [examState, setExamState] = useState('list'); 
  const [selectedExam, setSelectedExam] = useState(null);
  
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [focusWarning, setFocusWarning] = useState(false);
  const [keyWarning, setKeyWarning] = useState('');
  const [fsWarning, setFsWarning] = useState(false);
  
  const [hardwareChecked, setHardwareChecked] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Simulated webcam PiP reference
  const videoRef = useRef(null);

  // Timer logic
  useEffect(() => {
    if (examState !== 'active') return;
    const t = setInterval(() => setTimeLeft(s => Math.max(s - 1, 0)), 1000);
    return () => clearInterval(t);
  }, [examState]);

  // Focus blur tracking
  useEffect(() => {
    if (examState !== 'active') return;
    const onBlur  = () => setFocusWarning(true);
    const onFocus = () => setFocusWarning(false);
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);
    return () => { window.removeEventListener('blur', onBlur); window.removeEventListener('focus', onFocus); };
  }, [examState]);

  // Functional Key Blocker
  useEffect(() => {
    if (examState !== 'active') return;
    const onKeyDown = (e) => {
      // Block F1 - F12
      if (e.key.match(/^F(1[0-2]|[1-9])$/)) {
        e.preventDefault();
        setKeyWarning(`Action Blocked: ${e.key} key is not allowed during the exam.`);
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
      if (!document.fullscreenElement) {
        setFsWarning(true);
      }
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, [examState]);

  // Webcam access - Only request when in Lobby or Active!
  useEffect(() => {
    if (examState === 'list' || examState === 'submitted') {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
        setHardwareChecked(false);
      }
      return;
    }
    
    // Request camera ONLY when they enter the lobby to verify.
    navigator.mediaDevices?.getUserMedia({ video: true })
      .then(stream => {
        if (videoRef.current) videoRef.current.srcObject = stream;
        setHardwareChecked(true); 
      })
      .catch(err => {
        console.log('Webcam access denied/unavailable, using simulated visual.', err);
        setHardwareChecked(true); 
      });
  }, [examState]);

  const startLobby = async (exam) => {
    // Attempt to enter true fullscreen mode
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) {
      console.log('Fullscreen API failed or blocked:', err);
    }
    
    setSelectedExam(exam);
    setTimeLeft(45 * 60); // 45 mins in seconds (mocked for demo)
    setExamState('lobby');
  };

  const exitToList = async () => {
    // Attempt to exit true fullscreen mode
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.log('Exit Fullscreen API failed:', err);
    }
    setExamState('list');
  };

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const ss = String(timeLeft % 60).padStart(2, '0');
  const isLow = timeLeft < 10 * 60;
  const q = questions[current];
  const answered = Object.keys(answers).length;

  const score = Object.keys(answers).reduce((acc, key) => {
    return acc + (answers[key] === questions[key].correct ? 1 : 0);
  }, 0);

  const isFullScreen = examState !== 'list';

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

      {/* ── Top Status Bar (Only visible in full screen exam modes) ── */}
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
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>{answered}/{questions.length} Answered</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: isLow ? 'rgba(239,68,68,0.1)' : 'var(--surface-2)', borderRadius: 8 }}>
                  <Clock size={16} color={isLow ? '#ef4444' : 'var(--text-primary)'} />
                  <span style={{ fontSize: '1.125rem', fontWeight: 900, color: isLow ? '#ef4444' : 'var(--text-primary)', letterSpacing: '0.04em', fontVariantNumeric: 'tabular-nums' }}>
                    {mm}:{ss}
                  </span>
                </div>
              </>
            )}
            {examState === 'lobby' && (
              <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-secondary)' }}>Pre-Exam Verification</span>
            )}
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

        {/* ── LIST STATE (Exam Dashboard) ── */}
        {examState === 'list' && (
          <div style={{ flex: 1, paddingBottom: '3rem', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '2rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--brand-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-brand)' }}>
                <ShieldCheck size={22} color="white" />
              </div>
              <div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1 }}>Exam Arena</h1>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Select an active exam to enter the secure proctoring environment.</p>
              </div>
            </div>

            <div style={{ maxWidth: 900, width: '100%', animation: 'fadeIn 0.3s ease' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {availableExams.map(exam => (
                  <div key={exam.id} style={{ background: 'var(--surface-0)', border: '1px solid var(--surface-3)', borderRadius: 16, padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--brand-300)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--surface-3)'}>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      <div style={{ width: 48, height: 48, borderRadius: 12, background: exam.status === 'active' ? 'var(--brand-50)' : 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {exam.status === 'completed' ? <CheckCircle2 size={24} color="#10b981" /> : exam.status === 'upcoming' ? <Lock size={24} color="var(--text-muted)" /> : <FileText size={24} color="var(--brand-500)" />}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                          <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)' }}>{exam.title}</h3>
                          {exam.status === 'active' && <span style={{ padding: '2px 8px', background: '#10b981', color: 'white', fontSize: '0.6875rem', fontWeight: 800, borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Live</span>}
                        </div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{exam.course} • {exam.questions} Questions • {exam.duration}</p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>{exam.status === 'completed' ? 'Score' : 'Date'}</p>
                        <p style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-primary)' }}>{exam.status === 'completed' ? exam.score : exam.date}</p>
                      </div>
                      
                      {exam.status === 'active' ? (
                        <button onClick={() => startLobby(exam)} style={{ background: 'var(--text-primary)', color: 'white', border: 'none', padding: '10px 24px', borderRadius: 999, fontSize: '0.9375rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                          Enter Lobby
                        </button>
                      ) : (
                        <button disabled style={{ background: 'var(--surface-2)', color: 'var(--text-muted)', border: 'none', padding: '10px 24px', borderRadius: 999, fontSize: '0.9375rem', fontWeight: 800, cursor: 'not-allowed' }}>
                          {exam.status === 'completed' ? 'View Details' : 'Locked'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
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
                  {/* Local PiP Preview in Lobby */}
                  <div style={{ width: 160, height: 120, background: 'var(--surface-2)', borderRadius: 12, overflow: 'hidden', position: 'relative', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: hardwareChecked ? '2px solid #10b981' : '2px solid var(--surface-3)' }}>
                    <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
            {/* Question Sidebar */}
            <div style={{ width: 72, background: 'var(--surface-0)', borderRight: '1px solid var(--surface-3)', padding: '1.5rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.625rem', alignItems: 'center', flexShrink: 0 }}>
              <p style={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.5rem', textAlign: 'center' }}>Q#</p>
              {questions.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  style={{ width: 36, height: 36, borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '0.8125rem',
                    background: current === i ? 'var(--brand-500)' : answers[i] !== undefined ? '#10b981' : 'var(--surface-2)',
                    color: current === i || answers[i] !== undefined ? 'white' : 'var(--text-secondary)',
                    transition: 'all 0.15s', boxShadow: current === i ? '0 2px 8px rgba(79,70,229,0.3)' : 'none',
                  }}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            {/* Question Stage */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', overflowY: 'auto', animation: 'fadeIn 0.3s ease' }}>
              <div style={{ maxWidth: 640, width: '100%' }}>
                {/* Progress bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                    Q {current + 1} / {questions.length}
                  </span>
                  <div style={{ flex: 1, height: 4, background: 'var(--surface-3)', borderRadius: 999 }}>
                    <div style={{ height: '100%', background: 'var(--brand-500)', borderRadius: 999, width: `${((current + 1) / questions.length) * 100}%`, transition: 'width 0.4s ease' }} />
                  </div>
                </div>

                {/* Question */}
                <h2 style={{ fontSize: '1.375rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.45, marginBottom: '2rem' }}>
                  {q.q}
                </h2>

                {/* Options */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '2.5rem' }}>
                  {q.options.map((opt, idx) => {
                    const isSelected = answers[current] === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => setAnswers(prev => ({ ...prev, [current]: idx }))}
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
                </div>

                {/* Navigation */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button onClick={() => setCurrent(Math.max(0, current - 1))}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: 'none', color: current === 0 ? 'var(--text-muted)' : 'var(--text-primary)', fontWeight: 700, fontSize: '0.875rem', cursor: current === 0 ? 'not-allowed' : 'pointer', padding: 0, opacity: current === 0 ? 0.4 : 1 }}>
                    <ChevronLeft size={18} /> Previous
                  </button>

                  {current < questions.length - 1 ? (
                    <button onClick={() => setCurrent(current + 1)}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--text-primary)', color: 'white', border: 'none', padding: '10px 24px', borderRadius: 999, fontWeight: 800, fontSize: '0.9375rem', cursor: 'pointer' }}>
                      Next <ChevronRight size={18} />
                    </button>
                  ) : (
                    <button onClick={async () => {
                      setExamState('submitted');
                      try {
                        if (document.fullscreenElement && document.exitFullscreen) {
                          await document.exitFullscreen();
                        }
                      } catch (err) {}
                    }} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#10b981', color: 'white', border: 'none', padding: '10px 24px', borderRadius: 999, fontWeight: 800, fontSize: '0.9375rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(16,185,129,0.35)' }}>
                      <ShieldCheck size={18} /> Submit Exam
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Floating PiP Webcam (Active State Only) */}
            <div style={{ position: 'absolute', bottom: '2rem', right: '2rem', width: 200, height: 150, background: 'var(--surface-0)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 12px 40px rgba(0,0,0,0.15), 0 0 0 2px rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, animation: 'fadeIn 0.5s ease' }}>
              <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-2)', zIndex: -1 }}>
                <Camera size={24} color="var(--text-muted)" style={{ marginBottom: 8 }} />
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)' }}>Proctoring Active</span>
              </div>
              <div style={{ position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
            </div>
          </>
        )}

        {/* ── SUBMITTED STATE (Analysis View) ── */}
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

              {/* AI Analysis Grid */}
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

              {/* Navigation Back */}
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
      `}</style>
    </div>
  );
}
