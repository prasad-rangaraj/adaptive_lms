import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { ProctoringWebSocket } from '../../lib/websocket';
import { Shield, AlertTriangle, Camera, Eye, Mic, Clock, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

// Mock exam data — in production, fetch from API
const MOCK_EXAM = {
  id: 1,
  title: 'Midterm Examination: Python Programming',
  duration_minutes: 60,
  questions: [
    { id: 1, text: 'What is the output of print(type([]))?', options: ['<class list>', '<class array>', 'None', 'Error'], answer: 0 },
    { id: 2, text: 'Which keyword is used to define a function in Python?', options: ['function', 'def', 'fn', 'define'], answer: 1 },
    { id: 3, text: 'What does len("hello") return?', options: ['4', '5', '6', 'Error'], answer: 1 },
  ],
};

export default function ExamProctoringPage() {
  const { examId } = useParams();
  const { token } = useAuthStore();
  const navigate = useNavigate();
  const wsRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [answers, setAnswers] = useState({});
  const [riskScore, setRiskScore] = useState(0);
  const [violations, setViolations] = useState([]);
  const [timeLeft, setTimeLeft] = useState(MOCK_EXAM.duration_minutes * 60);
  const [examStarted, setExamStarted] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  // Format time
  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  // Request camera access
  const initCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraReady(true);
    } catch {
      toast.error('Camera access is required for proctored exams.');
    }
  };

  // Connect WebSocket
  const initWebSocket = useCallback(() => {
    wsRef.current = new ProctoringWebSocket(
      examId,
      token,
      (ack) => setRiskScore(ack.risk_score || 0),
      (err) => console.error('WS Error:', err),
    );
    wsRef.current.connect();
  }, [examId, token]);

  // Browser-side violation detection hooks
  useEffect(() => {
    if (!examStarted) return;

    // Tab switch detection
    const handleVisibilityChange = () => {
      if (document.hidden) {
        wsRef.current?.sendViolation('tab_switch', 'high', 'Student switched to another tab');
        setViolations((v) => [...v, { type: 'Tab Switch', time: new Date().toLocaleTimeString() }]);
        toast.error('⚠️ Tab switch detected!');
      }
    };

    // Copy/paste detection
    const handleCopy = () => {
      wsRef.current?.sendViolation('clipboard_use', 'medium', 'Clipboard copy detected');
      setViolations((v) => [...v, { type: 'Copy Detected', time: new Date().toLocaleTimeString() }]);
    };

    // Window resize detection
    const handleResize = () => {
      wsRef.current?.sendViolation('screen_resize', 'low', 'Window resized');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('copy', handleCopy);
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('copy', handleCopy);
      window.removeEventListener('resize', handleResize);
    };
  }, [examStarted]);

  // Timer countdown
  useEffect(() => {
    if (!examStarted) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 0) { clearInterval(interval); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [examStarted]);

  const startExam = async () => {
    await initCamera();
    initWebSocket();
    setExamStarted(true);
    toast.success('Exam started. Good luck!');
  };

  const submitExam = () => {
    wsRef.current?.disconnect();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    toast.success('Exam submitted successfully!');
    navigate('/student/dashboard');
  };

  const getRiskColor = () => {
    if (riskScore < 30) return '#10b981';
    if (riskScore < 60) return '#f59e0b';
    return '#ef4444';
  };

  if (!examStarted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="glass-card p-8 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <Shield size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">{MOCK_EXAM.title}</h1>
          <p className="text-slate-400 mb-6">Duration: {MOCK_EXAM.duration_minutes} minutes · {MOCK_EXAM.questions.length} Questions</p>

          <div className="text-left space-y-3 mb-8 p-4 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <p className="text-red-400 font-semibold flex items-center gap-2"><AlertTriangle size={16} /> Proctoring Rules</p>
            {['Do not switch tabs during the exam', 'Keep your face visible to the camera', 'Do not copy text from other sources', 'No other persons should be visible'].map((r, i) => (
              <p key={i} className="text-slate-300 text-sm flex items-center gap-2"><XCircle size={14} style={{ color: '#ef4444' }} /> {r}</p>
            ))}
          </div>

          <button onClick={startExam} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
            <Camera size={18} /> Enable Camera & Start Exam
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-8rem)]">
      {/* Main Exam Panel */}
      <div className="lg:col-span-3 flex flex-col gap-4 overflow-y-auto">
        {/* Exam Header */}
        <div className="glass-card p-4 flex items-center justify-between">
          <h2 className="font-semibold text-white text-sm">{MOCK_EXAM.title}</h2>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: timeLeft < 300 ? 'rgba(239,68,68,0.2)' : 'rgba(99,102,241,0.2)' }}>
            <Clock size={14} style={{ color: timeLeft < 300 ? '#ef4444' : '#a5b4fc' }} />
            <span className="font-mono font-bold text-sm" style={{ color: timeLeft < 300 ? '#ef4444' : '#a5b4fc' }}>{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* Questions */}
        {MOCK_EXAM.questions.map((q, qi) => (
          <div key={q.id} className="glass-card p-6">
            <p className="text-slate-300 text-sm font-medium mb-4">Q{qi + 1}. {q.text}</p>
            <div className="space-y-2">
              {q.options.map((opt, oi) => (
                <button
                  key={oi}
                  onClick={() => setAnswers({ ...answers, [q.id]: oi })}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all ${answers[q.id] === oi ? 'border-indigo-500' : 'border-transparent'}`}
                  style={{
                    background: answers[q.id] === oi ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${answers[q.id] === oi ? '#6366f1' : 'rgba(255,255,255,0.08)'}`,
                    color: answers[q.id] === oi ? '#a5b4fc' : '#94a3b8',
                  }}
                >
                  <span className="font-medium mr-3">{String.fromCharCode(65 + oi)}.</span>{opt}
                </button>
              ))}
            </div>
          </div>
        ))}

        <button onClick={submitExam} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
          <CheckCircle size={18} /> Submit Exam
        </button>
      </div>

      {/* Proctoring Sidebar */}
      <div className="space-y-4">
        {/* Camera feed */}
        <div className="glass-card p-3">
          <p className="text-xs text-slate-400 mb-2 flex items-center gap-1.5"><Camera size={12} /> Live Camera</p>
          <video ref={videoRef} autoPlay muted playsInline className="w-full rounded-lg aspect-video object-cover" style={{ background: '#0f0f1a' }} />
        </div>

        {/* Risk Score */}
        <div className="glass-card p-4">
          <p className="text-xs text-slate-400 mb-2 flex items-center gap-1.5"><Shield size={12} /> Integrity Score</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold" style={{ color: getRiskColor() }}>{Math.round(riskScore)}%</span>
            <span className="text-xs text-slate-400 mb-1">risk</span>
          </div>
          <div className="h-2 rounded-full mt-2" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <div className="h-2 rounded-full transition-all" style={{ width: `${riskScore}%`, background: getRiskColor() }} />
          </div>
        </div>

        {/* Violations */}
        <div className="glass-card p-4">
          <p className="text-xs text-slate-400 mb-3 flex items-center gap-1.5"><AlertTriangle size={12} /> Violations ({violations.length})</p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {violations.length === 0 ? (
              <p className="text-xs text-emerald-400 flex items-center gap-1"><CheckCircle size={12} /> No violations</p>
            ) : violations.map((v, i) => (
              <div key={i} className="flex items-center justify-between py-1 px-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)' }}>
                <span className="text-xs text-red-400">{v.type}</span>
                <span className="text-xs text-slate-500">{v.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
