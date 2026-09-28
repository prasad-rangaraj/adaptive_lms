import { useAuthStore } from '../../store/authStore';
import { Flame, Sparkles, ArrowRight, ChevronRight, PlayCircle, AlertCircle, Clock, CheckCircle2, FileText, Calendar, Users, HelpCircle, Trophy, Play, Pause, RotateCcw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { dashboardAPI, cognitiveAPI } from '../../services/api.service';

import { getTopicImage } from '../../utils/imageUtils';

import { useQuery } from '@tanstack/react-query';

const typeColors = { video: '#4f46e5', quiz: '#0891b2', live: '#f59e0b', assignment: '#ef4444', urgent_exam: '#ef4444' };

function FocusTimer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [focusPoints, setFocusPoints] = useState(0);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      setFocusPoints(p => p + 50);
      setTimeLeft(25 * 60); // Auto reset
      
      // Sync with backend
      cognitiveAPI.evaluate({
        event: "Focus Timer Completed",
        points_earned: 50,
        time_spent_seconds: 25 * 60,
        completion_status: 'completed'
      }).catch(err => console.error("Failed to sync focus points", err));
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggle = () => setIsActive(!isActive);
  const reset = () => { setIsActive(false); setTimeLeft(25 * 60); };
  
  const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const s = (timeLeft % 60).toString().padStart(2, '0');

  return (
    <div style={{ background: 'var(--surface-0)', border: '1px solid var(--surface-3)', borderRadius: 20, padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: '1rem', alignSelf: 'flex-start' }}>
        <Clock size={16} color="var(--brand-500)" />
        <h3 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>Focus Mode</h3>
      </div>
      <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'monospace', letterSpacing: '-0.05em', lineHeight: 1 }}>
        {m}:{s}
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
        <button onClick={toggle} style={{ display: 'flex', alignItems: 'center', gap: 6, background: isActive ? 'var(--surface-3)' : 'var(--brand-500)', color: isActive ? 'var(--text-primary)' : 'white', border: 'none', padding: '8px 16px', borderRadius: 999, fontSize: '0.8125rem', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' }}>
          {isActive ? <Pause size={14} /> : <Play size={14} fill="currentColor" />} {isActive ? 'Pause' : 'Start Focus'}
        </button>
        <button onClick={reset} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--surface-3)', width: 34, height: 34, borderRadius: '50%', cursor: 'pointer' }}>
          <RotateCcw size={14} />
        </button>
      </div>
      {focusPoints > 0 && (
        <div style={{ marginTop: '1rem', fontSize: '0.75rem', fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Trophy size={14} /> +{focusPoints} Focus Points Earned!
        </div>
      )}
    </div>
  );
}

function DailyTrivia() {
  const [answered, setAnswered] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(null);
  
  const { data, isLoading } = useQuery({
    queryKey: ['dailyTrivia'],
    queryFn: () => cognitiveAPI.getDailyTrivia().then(res => res.data),
    staleTime: 24 * 60 * 60 * 1000 // 24 hours
  });

  if (isLoading) {
    return (
      <div style={{ background: 'var(--surface-0)', border: '1px solid var(--surface-3)', borderRadius: 20, padding: '1.5rem' }}>
        <h3 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>AI Daily Trivia</h3>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Generating today's challenge...</p>
      </div>
    );
  }

  const { question, options, correctIdx } = data || { 
    question: "Failed to load.", 
    options: [], 
    correctIdx: -1 
  };
  const correct = selectedIdx === correctIdx;

  const handleSelect = (idx) => {
    if (answered) return;
    setAnswered(true);
    setSelectedIdx(idx);
    
    if (idx === correctIdx) {
      cognitiveAPI.evaluate({
        event: "Daily Trivia Correct",
        points_earned: 10,
        completion_status: 'completed'
      }).catch(err => console.error(err));
    }
  };

  return (
    <div style={{ background: 'var(--surface-0)', border: '1px solid var(--surface-3)', borderRadius: 20, padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: '1rem' }}>
        <HelpCircle size={16} color="#8b5cf6" />
        <h3 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>AI Daily Trivia</h3>
      </div>
      <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.4 }}>{question}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {options.map((opt, idx) => {
          let bg = 'var(--surface-1)';
          let border = '1px solid var(--surface-2)';
          let textColor = 'var(--text-secondary)';
          if (answered) {
            if (idx === correctIdx) { bg = '#ecfdf5'; border = '1px solid #10b981'; textColor = '#065f46'; }
            else if (idx === selectedIdx && !correct) { bg = '#fef2f2'; border = '1px solid #ef4444'; textColor = '#991b1b'; }
          }
          return (
            <button key={opt} onClick={() => handleSelect(idx)} disabled={answered}
              style={{ padding: '10px 14px', borderRadius: 12, background: bg, border, color: textColor, textAlign: 'left', fontSize: '0.8125rem', fontWeight: 700, cursor: answered ? 'default' : 'pointer', transition: 'all 0.2s' }}>
              {opt}
            </button>
          );
        })}
      </div>
      {answered && (
        <div style={{ marginTop: '1rem', fontSize: '0.8125rem', fontWeight: 800, color: correct ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', gap: 6 }}>
          {correct ? <><Sparkles size={16} /> Correct! +10 XP</> : <><AlertCircle size={16} /> Incorrect.</>}
        </div>
      )}
    </div>
  );
}

function StudyBuddies() {
  const { data: buddies = [] } = useQuery({
    queryKey: ['dashboardStudyBuddies'],
    queryFn: () => dashboardAPI.getStudyBuddies().then(res => res.data)
  });

  return (
    <div style={{ background: 'var(--surface-0)', border: '1px solid var(--surface-3)', borderRadius: 20, padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: '1.25rem' }}>
        <Users size={16} color="#3b82f6" />
        <h3 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>Live Campus</h3>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', marginLeft: 'auto', boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.2)' }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {buddies.map((b, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>
              {b.name[0]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{b.name}</strong> is {b.action}
              </p>
              <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 600 }}>{b.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function StudentNexus() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const { data } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: () => dashboardAPI.getSummary().then(res => res.data),
  });

  const recentItems = data?.recentItems || [];
  const path = data?.path || [];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening';


  return (
    <div style={{ position: 'relative', minHeight: '100%', paddingBottom: '3rem', overflow: 'hidden' }}>

      {/* ── Organic Background Orbs ── */}
      <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(79,70,229,0.05) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '40%', right: '0', width: '25vw', height: '25vw', background: 'radial-gradient(circle, rgba(14,116,144,0.04) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0, pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 10 }}>

        {/* ── Header Row ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-500)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              {greeting}, {user?.full_name?.split(' ')[0] || 'Scholar'}
            </p>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
              Your Learning <span style={{ color: 'var(--text-muted)' }}>Nexus.</span>
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            {/* Streak */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b, #ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Flame size={18} color="white" />
              </div>
              <div>
                <p style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>12</p>
                <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', marginTop: 2 }}>Day Streak</p>
              </div>
            </div>
            <button onClick={() => navigate('/student/ai-tutor')} style={{ background: 'var(--text-primary)', color: 'white', border: 'none', padding: '9px 18px', borderRadius: 999, fontSize: '0.875rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={15} /> Ask AI Tutor
            </button>
          </div>
        </div>

        {/* ── Academic Pulse Strip ── */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 12, padding: '0.875rem 1.25rem', background: 'var(--surface-0)', border: '1px solid var(--surface-3)', borderRadius: 14 }}>
            <Calendar size={18} color="var(--brand-500)" />
            <div>
              <p style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Next Class</p>
              <p style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>OS Theory · 10:00 AM</p>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 12, padding: '0.875rem 1.25rem', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 14 }}>
            <Clock size={18} color="#d97706" />
            <div>
              <p style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Urgent Deadline</p>
              <p style={{ fontSize: '0.875rem', fontWeight: 800, color: '#92400e' }}>DBMS Project · Due Today</p>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 12, padding: '0.875rem 1.25rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 14 }}>
            <AlertCircle size={18} color="#ef4444" />
            <div>
              <p style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Attendance Warning</p>
              <p style={{ fontSize: '0.875rem', fontWeight: 800, color: '#991b1b' }}>Maths III · 72% (Danger)</p>
            </div>
          </div>
        </div>

        {/* ── Main 2-Column Layout ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '3rem', alignItems: 'start' }}>

          {/* LEFT: Pick up where you left off */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', minWidth: 0 }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)' }}>Pick Up Where You Left Off</h2>
              <button style={{ background: 'transparent', border: 'none', color: 'var(--brand-600)', fontSize: '0.8125rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', padding: 0 }}>All Courses <ChevronRight size={14} /></button>
            </div>

            {/* Recent Items Stack */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recentItems.map(item => (
                <Link key={item.id} to={`/student/course/${item.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{ borderRadius: 20, overflow: 'hidden', position: 'relative', height: '120px', cursor: 'pointer', flexShrink: 0, border: '1px solid var(--surface-3)' }}>
                    <img src={getTopicImage(item.title)} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease', opacity: 0.85 }}
                      onError={(e) => { e.target.onerror = null; e.target.src = getTopicImage(item.title); }}
                      onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                      onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 40%, transparent 100%)' }} />

                    <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '1.5rem', right: '7rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.375rem' }}>
                        {item.type === 'video' ? <PlayCircle size={14} color="#818cf8" fill="rgba(129, 140, 248, 0.2)" /> : <FileText size={14} color="#38bdf8" fill="rgba(56, 189, 248, 0.2)" />}
                        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{item.course}</p>
                      </div>
                      <h3 style={{ color: 'white', fontSize: '1rem', fontWeight: 800, lineHeight: 1.25, marginBottom: '0.625rem' }}>{item.title}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ height: 4, borderRadius: 999, background: 'rgba(255,255,255,0.2)', width: '60%' }}>
                          <div style={{ width: `${item.progress}%`, height: '100%', background: 'white', borderRadius: 999 }} />
                        </div>
                        <span style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.8)', fontWeight: 700 }}>{item.timeleft}</span>
                      </div>
                    </div>

                    <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: '1.5rem', width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                      <ChevronRight size={18} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Quick Links */}
            <div style={{ display: 'flex', gap: '1.5rem', paddingTop: '0.5rem' }}>
              <button onClick={() => navigate('/student/cognitive')} style={{ background: 'transparent', border: 'none', padding: 0, color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                Cognitive Profile <ArrowRight size={16} color="var(--brand-500)" />
              </button>
              <button onClick={() => navigate('/student/academic')} style={{ background: 'transparent', border: 'none', padding: 0, color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                Academic Hub <ArrowRight size={16} color="var(--brand-500)" />
              </button>
            </div>
            
            {/* AI Daily Trivia */}
            <div style={{ marginTop: '1rem' }}>
              <DailyTrivia />
            </div>
          </div>

          {/* RIGHT: Today's Path Timeline + Focus + Buddies */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', minWidth: 0 }}>
            
            <FocusTimer />
            
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-primary)' }}>Today's Path</h2>
                <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#ef4444', background: '#fef2f2', border: '1px solid #fecaca', padding: '3px 8px', borderRadius: 999, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Flame size={12} /> Exam Mode
                </span>
              </div>

              <div style={{ position: 'relative', paddingLeft: '1.5rem' }}>
                <div style={{ position: 'absolute', top: 6, bottom: 6, left: '5px', width: 2, background: 'linear-gradient(to bottom, var(--brand-500) 40%, var(--surface-3) 100%)' }} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {path.map((item) => (
                    <div key={item.step} style={{ position: 'relative', opacity: item.done ? 0.45 : 1 }}>
                      <div style={{ position: 'absolute', left: '-1.5rem', width: 12, height: 12, borderRadius: '50%', background: item.done ? 'var(--surface-4)' : item.active ? typeColors[item.type] : 'var(--surface-1)', border: `2px solid ${item.done ? 'var(--surface-4)' : typeColors[item.type]}`, top: 4 }} />

                      <div style={{ padding: '0.75rem', background: item.active ? `${typeColors[item.type]}08` : item.warning ? '#fffbeb' : 'transparent', borderRadius: 10, border: item.active ? `1px solid ${typeColors[item.type]}25` : item.warning ? '1px solid #fde68a' : '1px solid transparent' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.125rem' }}>
                          <span style={{ fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: typeColors[item.type] }}>
                            {item.type === 'urgent_exam' ? 'CRITICAL EXAM' : item.type}
                          </span>
                          {item.active && <span style={{ fontSize: '0.625rem', fontWeight: 800, color: 'white', background: typeColors[item.type], padding: '1px 6px', borderRadius: 999 }}>Up Next</span>}
                          {item.warning && <span style={{ fontSize: '0.625rem', fontWeight: 800, color: '#d97706', background: '#fef3c7', padding: '1px 6px', borderRadius: 999 }}>Warning</span>}
                        </div>
                        <h4 style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: '0.125rem' }}>{item.title}</h4>
                        <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: item.type === 'urgent_exam' ? '#ef4444' : 'var(--text-muted)' }}>{item.course}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <StudyBuddies />
            
          </div>

        </div>
      </div>
    </div>
  );
}
