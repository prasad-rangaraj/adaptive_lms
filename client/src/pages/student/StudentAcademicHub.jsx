import { useState, useEffect } from 'react';
import { 
  Clock, CheckCircle2, AlertCircle, Upload, BookOpen, 
  ChevronRight, TrendingUp, Calendar, FileText, Plus,
  MapPin, User, Download, FileArchive, Target, ShieldAlert
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────
const timetable = {
  Monday: [
    { time: '8:00 AM', subject: 'Data Structures', type: 'Theory', faculty: 'Dr. Alan Turing', venue: 'Block A, Room 402' },
    { time: '9:00 AM', subject: 'Mathematics III', type: 'Theory', faculty: 'Dr. Ramanujan', venue: 'Block A, Room 402' },
    { time: '10:00 AM', subject: 'OS Lab', type: 'Lab', faculty: 'Prof. Linus', venue: 'CS Lab 3' },
    null,
    { time: '2:00 PM', subject: 'DBMS', type: 'Theory', faculty: 'Dr. Codd', venue: 'Block B, Room 305' },
    { time: '3:00 PM', subject: 'Networks', type: 'Theory', faculty: 'Prof. Cerf', venue: 'Block B, Room 305' },
  ],
  Tuesday: [
    { time: '8:00 AM', subject: 'Networks', type: 'Theory', faculty: 'Prof. Cerf', venue: 'Block B, Room 305' },
    { time: '9:00 AM', subject: 'Data Structures', type: 'Theory', faculty: 'Dr. Alan Turing', venue: 'Block A, Room 402' },
    null,
    { time: '11:00 AM', subject: 'OS Theory', type: 'Theory', faculty: 'Prof. Linus', venue: 'Block C, Room 101' },
    { time: '2:00 PM', subject: 'Mathematics III', type: 'Theory', faculty: 'Dr. Ramanujan', venue: 'Block A, Room 402' },
    null,
  ],
  Wednesday: [
    { time: '8:00 AM', subject: 'DBMS', type: 'Theory', faculty: 'Dr. Codd', venue: 'Block B, Room 305' },
    { time: '9:00 AM', subject: 'OS Theory', type: 'Theory', faculty: 'Prof. Linus', venue: 'Block C, Room 101' },
    { time: '10:00 AM', subject: 'DS Lab', type: 'Lab', faculty: 'Dr. Alan Turing', venue: 'CS Lab 1' },
    null,
    { time: '2:00 PM', subject: 'Networks', type: 'Theory', faculty: 'Prof. Cerf', venue: 'Block B, Room 305' },
    { time: '3:00 PM', subject: 'Mathematics III', type: 'Theory', faculty: 'Dr. Ramanujan', venue: 'Block A, Room 402' },
  ],
  Thursday: [
    { time: '8:00 AM', subject: 'Mathematics III', type: 'Theory', faculty: 'Dr. Ramanujan', venue: 'Block A, Room 402' },
    { time: '9:00 AM', subject: 'DBMS', type: 'Theory', faculty: 'Dr. Codd', venue: 'Block B, Room 305' },
    null,
    { time: '11:00 AM', subject: 'Data Structures', type: 'Theory', faculty: 'Dr. Alan Turing', venue: 'Block A, Room 402' },
    null,
    { time: '3:00 PM', subject: 'OS Theory', type: 'Theory', faculty: 'Prof. Linus', venue: 'Block C, Room 101' },
  ],
  Friday: [
    { time: '8:00 AM', subject: 'OS Theory', type: 'Theory', faculty: 'Prof. Linus', venue: 'Block C, Room 101' },
    { time: '9:00 AM', subject: 'Networks', type: 'Theory', faculty: 'Prof. Cerf', venue: 'Block B, Room 305' },
    { time: '10:00 AM', subject: 'DBMS Lab', type: 'Lab', faculty: 'Dr. Codd', venue: 'DB Lab' },
    null,
    { time: '2:00 PM', subject: 'Data Structures', type: 'Theory', faculty: 'Dr. Alan Turing', venue: 'Block A, Room 402' },
    null,
  ],
};
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const periods = ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM'];

const attendance = [
  { subject: 'Data Structures',  held: 42, attended: 38, color: '#4f46e5' },
  { subject: 'Mathematics III',  held: 38, attended: 26, color: '#ef4444' }, // Danger!
  { subject: 'OS Theory',        held: 36, attended: 34, color: '#10b981' },
  { subject: 'DBMS',             held: 40, attended: 36, color: '#0891b2' },
  { subject: 'Networks',         held: 35, attended: 30, color: '#f59e0b' },
  { subject: 'DS Lab',           held: 20, attended: 19, color: '#8b5cf6' },
];

const leaveRequests = [
  { type: 'On-Duty (Hackathon)', date: 'Aug 14 - Aug 15', status: 'Approved', days: 2 },
  { type: 'Medical Leave', date: 'Aug 20', status: 'Pending', days: 1 },
];

const assignments = [
  { id: 1, title: 'AVL Tree Implementation',       subject: 'Data Structures', due: 'Aug 25, 2026', submitted: false, priority: 'high' },
  { id: 2, title: 'SQL Mini Project',               subject: 'DBMS',           due: 'Aug 28, 2026', submitted: false, priority: 'medium' },
  { id: 3, title: 'Process Scheduling Simulation', subject: 'OS Theory',       due: 'Sep 2, 2026',  submitted: true,  priority: 'low' },
  { id: 4, title: 'TCP/IP Protocol Report',        subject: 'Networks',        due: 'Sep 5, 2026',  submitted: false, priority: 'medium' },
];

const pyqs = [
  { title: 'Data Structures — Sem 5 2025', type: 'PYQ', size: '1.2 MB' },
  { title: 'Data Structures — Sem 5 2024', type: 'PYQ', size: '1.1 MB' },
  { title: 'Mathematics III — Sem 5 2025', type: 'PYQ', size: '2.4 MB' },
  { title: 'Sem 5 Official Syllabus & Blueprint', type: 'Syllabus', size: '450 KB' },
];

const marks = [
  { subject: 'Data Structures', ca1: 28, ca2: 30, ca3: 27, model: 72, credits: 4 },
  { subject: 'Mathematics III', ca1: 22, ca2: 25, ca3: 24, model: 58, credits: 4 },
  { subject: 'OS Theory',       ca1: 29, ca2: 28, ca3: 30, model: 81, credits: 3 },
  { subject: 'DBMS',            ca1: 26, ca2: 27, ca3: 25, model: 68, credits: 3 },
  { subject: 'Networks',        ca1: 24, ca2: 26, ca3: 28, model: 74, credits: 3 },
  { subject: 'DS Lab',          ca1: 30, ca2: 30, ca3: 30, model: 95, credits: 2 },
];

const priorityColors = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' };

const gradePoints = { 'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'U': 0 };

// ─────────────────────────────────────────────────────────────
// Tab: Timetable
// ─────────────────────────────────────────────────────────────
function TimetableTab() {
  const today = days[new Date().getDay() - 1] || 'Monday';
  const [selectedDay, setSelectedDay] = useState(today);

  // Mocking live class (e.g., 9:45 AM on Monday)
  const isLiveDay = selectedDay === 'Monday';
  const liveClassIndex = 1; // 9:00 AM class

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Live Class Tracker Banner */}
      {isLiveDay && (
        <div style={{ background: 'var(--brand-500)', borderRadius: 16, padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'white', boxShadow: 'var(--shadow-brand)', animation: 'fadeIn 0.5s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={28} color="white" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981', animation: 'pulse 2s infinite' }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.9 }}>Happening Now</span>
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.2 }}>Mathematics III</h2>
              <p style={{ fontSize: '0.9375rem', opacity: 0.9, display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <User size={14} /> Dr. Ramanujan &nbsp;•&nbsp; <MapPin size={14} /> Block A, Room 402
              </p>
            </div>
          </div>
          <div style={{ textAlign: 'right', background: 'rgba(0,0,0,0.15)', padding: '0.75rem 1.25rem', borderRadius: 12 }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Time Remaining</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '0.02em', fontVariantNumeric: 'tabular-nums' }}>15:00</p>
          </div>
        </div>
      )}

      {/* Day Selector */}
      <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--surface-0)', padding: '0.375rem', borderRadius: 14, border: '1px solid var(--surface-3)', alignSelf: 'flex-start' }}>
        {days.map(d => (
          <button key={d} onClick={() => setSelectedDay(d)} style={{ padding: '0.5rem 1.125rem', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.8125rem', transition: 'all 0.15s',
            background: selectedDay === d ? 'var(--brand-500)' : 'transparent',
            color: selectedDay === d ? 'white' : 'var(--text-muted)',
          }}>{d.slice(0,3)}</button>
        ))}
      </div>

      {/* Period Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        {timetable[selectedDay].map((cls, i) => {
          const isLive = isLiveDay && i === liveClassIndex;
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.25rem', background: isLive ? 'rgba(8,145,178,0.05)' : 'var(--surface-0)', border: isLive ? '1px solid var(--brand-300)' : '1px solid var(--surface-3)', borderRadius: 14, borderLeft: cls ? (isLive ? '4px solid var(--brand-500)' : '4px solid var(--surface-4)') : '4px solid var(--surface-2)', transition: 'all 0.2s' }}>
              <div style={{ width: 72, flexShrink: 0 }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 800, color: isLive ? 'var(--brand-600)' : 'var(--text-muted)' }}>{periods[i]}</p>
              </div>
              {cls ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      {isLive && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--brand-500)' }} />}
                      <p style={{ fontWeight: 800, color: isLive ? 'var(--brand-600)' : 'var(--text-primary)', fontSize: '1rem' }}>{cls.subject}</p>
                      <span style={{ fontSize: '0.625rem', fontWeight: 800, color: cls.type === 'Lab' ? '#8b5cf6' : 'var(--text-muted)', background: cls.type === 'Lab' ? '#ede9fe' : 'var(--surface-2)', padding: '2px 8px', borderRadius: 999, textTransform: 'uppercase' }}>{cls.type}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><User size={13} /> {cls.faculty}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={13} /> {cls.venue}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontStyle: 'italic', opacity: 0.7 }}>Free Period</p>
              )}
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes pulse { 0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); } 70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); } 100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); } }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Tab: Attendance
// ─────────────────────────────────────────────────────────────
function AttendanceTab() {
  const [targetPct, setTargetPct] = useState(75);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '3rem', alignItems: 'start' }}>
      {/* Left: Per Subject */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: '1rem', padding: '0 0 0.75rem', borderBottom: '2px solid var(--surface-4)' }}>
          {['Subject', 'Attended / Held', 'Percentage', 'Status'].map(h => (
            <p key={h} style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</p>
          ))}
        </div>
        {attendance.map(a => {
          const pct = Math.round((a.attended / a.held) * 100);
          const canSkip = Math.max(0, Math.floor(a.attended / 0.75) - a.held);
          const needToAttend = pct < 75 ? Math.ceil((0.75 * a.held - a.attended) / 0.25) : 0;
          const safe = pct >= 75;
          return (
            <div key={a.subject} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: '1rem', padding: '1.125rem 0', borderBottom: '1px solid var(--surface-3)', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: a.color, flexShrink: 0 }} />
                <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>{a.subject}</p>
              </div>
              <p style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{a.attended} / {a.held}</p>
              <div>
                <p style={{ fontWeight: 900, color: safe ? 'var(--text-primary)' : '#ef4444', fontSize: '1.125rem', letterSpacing: '-0.02em' }}>{pct}%</p>
                <div style={{ height: 4, background: 'var(--surface-3)', borderRadius: 999, marginTop: 4, width: 80 }}>
                  <div style={{ height: '100%', background: safe ? a.color : '#ef4444', borderRadius: 999, width: `${Math.min(pct, 100)}%` }} />
                </div>
              </div>
              <div>
                {safe ? (
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle2 size={14}/> Can skip {canSkip}</p>
                ) : (
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 4, background: '#fef2f2', padding: '4px 8px', borderRadius: 6, border: '1px solid #fca5a5' }}><ShieldAlert size={14}/> Attend {needToAttend}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Right Sidebar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Bunk Calculator */}
        <div style={{ background: 'var(--surface-0)', border: '1px solid var(--surface-3)', borderRadius: 20, padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-primary)' }}>Bunk Calculator</h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>Set your target attendance % and see exactly how many classes you can miss.</p>
          
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Target: {targetPct}%</p>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: targetPct <= 75 ? '#ef4444' : '#10b981' }}>{targetPct <= 75 ? 'Risky' : 'Safe'}</p>
            </div>
            <input type="range" min={50} max={100} value={targetPct} onChange={e => setTargetPct(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--brand-500)', cursor: 'pointer' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {attendance.map(a => {
              const canSkip = Math.max(0, Math.floor(a.attended / (targetPct / 100)) - a.held);
              return (
                <div key={a.subject} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.625rem 0', borderBottom: '1px solid var(--surface-3)' }}>
                  <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>{a.subject.split(' ')[0]}</p>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: canSkip > 0 ? '#10b981' : '#ef4444', background: canSkip > 0 ? '#f0fdf4' : '#fef2f2', padding: '2px 10px', borderRadius: 999 }}>
                    {canSkip > 0 ? `Skip ${canSkip}` : 'Don\'t skip'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Leave Requests Widget */}
        <div style={{ background: 'var(--surface-0)', border: '1px solid var(--surface-3)', borderRadius: 20, padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-primary)' }}>Leave Requests</h3>
            <button style={{ background: 'transparent', border: 'none', color: 'var(--brand-600)', cursor: 'pointer', padding: 4 }}><Plus size={16} /></button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {leaveRequests.map((lr, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', border: '1px solid var(--surface-3)', borderRadius: 12, background: 'var(--surface-1)' }}>
                <div>
                  <p style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--text-primary)' }}>{lr.type}</p>
                  <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{lr.date} • {lr.days} Day(s)</p>
                </div>
                <span style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', color: lr.status === 'Approved' ? '#10b981' : '#f59e0b' }}>{lr.status}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Tab: Coursework & PYQs
// ─────────────────────────────────────────────────────────────
function CourseworkTab() {
  const pending = assignments.filter(a => !a.submitted);
  const done    = assignments.filter(a =>  a.submitted);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '3rem', alignItems: 'start' }}>
      
      {/* Left: Assignments */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        {/* Pending */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--text-primary)' }}>Pending Assignments</h2>
            <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--text-primary)', color: 'white', border: 'none', padding: '7px 16px', borderRadius: 999, fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer' }}>
              <Plus size={14} /> New
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {pending.map(a => (
              <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.125rem 1.25rem', background: 'var(--surface-0)', border: '1px solid var(--surface-3)', borderRadius: 14, borderLeft: `4px solid ${priorityColors[a.priority]}` }}>
                <AlertCircle size={18} color={priorityColors[a.priority]} style={{ flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.9375rem', marginBottom: '0.125rem' }}>{a.title}</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{a.subject}</p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 800, color: priorityColors[a.priority], textTransform: 'uppercase', letterSpacing: '0.05em' }}>{a.priority}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>Due {a.due}</p>
                </div>
                <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: '1px solid var(--surface-3)', color: 'var(--text-secondary)', padding: '6px 14px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>
                  <Upload size={13} /> Submit
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Submitted */}
        <div>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Submitted ({done.length})</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {done.map(a => (
              <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '0.875rem 1.25rem', background: 'var(--surface-1)', border: '1px solid var(--surface-3)', borderRadius: 14, opacity: 0.7 }}>
                <CheckCircle2 size={18} color="#10b981" style={{ flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.875rem', textDecoration: 'line-through' }}>{a.title}</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{a.subject}</p>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>Submitted</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: PYQ & Syllabus Vault */}
      <div style={{ background: 'var(--brand-50)', border: '1px solid var(--brand-100)', borderRadius: 20, padding: '1.75rem', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.5rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--brand-500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileArchive size={20} color="white" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--brand-700)' }}>PYQ & Syllabus Vault</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--brand-600)' }}>Previous year papers & docs</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {pyqs.map((p, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'white', borderRadius: 12, boxShadow: '0 2px 8px rgba(8,145,178,0.05)' }}>
              <div>
                <p style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>{p.title}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <span style={{ fontSize: '0.625rem', fontWeight: 800, background: p.type === 'PYQ' ? '#f0fdf4' : '#eff6ff', color: p.type === 'PYQ' ? '#16a34a' : '#2563eb', padding: '2px 8px', borderRadius: 999, textTransform: 'uppercase' }}>{p.type}</span>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{p.size}</span>
                </div>
              </div>
              <button style={{ background: 'var(--surface-1)', border: 'none', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--brand-600)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--brand-100)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-1)'}>
                <Download size={15} />
              </button>
            </div>
          ))}
        </div>
        <button style={{ width: '100%', padding: '0.875rem', marginTop: '1.5rem', background: 'transparent', border: '1.5px dashed var(--brand-300)', color: 'var(--brand-600)', borderRadius: 12, fontWeight: 800, fontSize: '0.875rem', cursor: 'pointer' }}>Browse All Documents</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Tab: Marks & CGPA
// ─────────────────────────────────────────────────────────────
function MarksTab() {
  const [targetMarks, setTargetMarks] = useState(60);
  
  // CGPA Forecaster State
  const [expectedGrades, setExpectedGrades] = useState(
    marks.reduce((acc, m) => ({ ...acc, [m.subject]: 'A' }), {})
  );

  const calculatePredictedSGPA = () => {
    let totalCredits = 0;
    let earnedPoints = 0;
    marks.forEach(m => {
      totalCredits += m.credits;
      earnedPoints += (gradePoints[expectedGrades[m.subject]] || 0) * m.credits;
    });
    return (earnedPoints / totalCredits).toFixed(2);
  };

  const currentCGPA = 8.24; // Mock previous CGPA
  const predictedSGPA = parseFloat(calculatePredictedSGPA());
  const newCGPA = ((currentCGPA * 4 + predictedSGPA) / 5).toFixed(2); // Assuming sem 5

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '3rem', alignItems: 'start' }}>
      
      {/* Left: Mark Sheet */}
      <div>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '1.75rem' }}>Internal Marks & Continuous Assessment</h2>
        
        <div style={{ overflowX: 'auto', marginBottom: '3rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--surface-4)' }}>
                {['Subject', 'CA1 /30', 'CA2 /30', 'CA3 /30', 'Internal /90', 'Model /100', 'Current Grade'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '0 1rem 0.875rem 0', fontSize: '0.6875rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {marks.map(m => {
                const internal = m.ca1 + m.ca2 + m.ca3;
                const pct = Math.round((internal / 90) * 100);
                const grade = internal >= 81 ? 'O' : internal >= 72 ? 'A+' : internal >= 63 ? 'A' : internal >= 54 ? 'B+' : 'B';
                return (
                  <tr key={m.subject} style={{ borderBottom: '1px solid var(--surface-3)' }}>
                    <td style={{ padding: '1.25rem 1rem 1.25rem 0', fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>{m.subject}</td>
                    <td style={{ padding: '1.25rem 1rem 1.25rem 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{m.ca1}</td>
                    <td style={{ padding: '1.25rem 1rem 1.25rem 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{m.ca2}</td>
                    <td style={{ padding: '1.25rem 1rem 1.25rem 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{m.ca3}</td>
                    <td style={{ padding: '1.25rem 1rem 1.25rem 0' }}>
                      <span style={{ fontWeight: 900, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>{internal}</span>
                      <div style={{ width: 60, height: 3, background: 'var(--surface-3)', borderRadius: 999, marginTop: 4 }}>
                        <div style={{ height: '100%', background: pct >= 80 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#ef4444', borderRadius: 999, width: `${pct}%` }} />
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 1rem 1.25rem 0', fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{m.model}</td>
                    <td style={{ padding: '1.25rem 0' }}>
                      <span style={{ fontWeight: 900, fontSize: '0.875rem', color: '#10b981', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '4px 12px', borderRadius: 999 }}>{grade}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Final Exam Calculator inline */}
        <div style={{ background: 'var(--surface-0)', border: '1px solid var(--surface-3)', borderRadius: 16, padding: '1.5rem', display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <div style={{ flexShrink: 0 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-primary)' }}>Final Exam Targets</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 4 }}>Marks needed in finals for {targetMarks}% overall.</p>
            <input type="range" min={40} max={100} value={targetMarks} onChange={e => setTargetMarks(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--brand-500)', cursor: 'pointer', marginTop: 12 }} />
          </div>
          <div style={{ flex: 1, display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {marks.map(m => {
              const internal = m.ca1 + m.ca2 + m.ca3;
              const internalScaled = (internal / 90) * 25; 
              const needed = Math.ceil(((targetMarks / 100) * 100 - internalScaled) * (75 / 75));
              const clamped = Math.min(Math.max(needed, 0), 75);
              return (
                <div key={m.subject} style={{ padding: '0.5rem 0.75rem', background: 'var(--surface-1)', borderRadius: 10, border: '1px solid var(--surface-3)', minWidth: 90 }}>
                  <p style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.subject.split(' ')[0]}</p>
                  <p style={{ fontSize: '1rem', fontWeight: 900, color: clamped <= 50 ? '#10b981' : clamped <= 65 ? '#f59e0b' : '#ef4444' }}>{clamped}/75</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right: CGPA Forecaster */}
      <div style={{ background: 'var(--brand-50)', border: '1px solid var(--brand-100)', borderRadius: 20, padding: '1.75rem', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.5rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--brand-500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Target size={20} color="white" />
          </div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--brand-700)' }}>CGPA Forecaster</h3>
        </div>
        
        {/* The Indicator */}
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: 16, textAlign: 'center', marginBottom: '1.5rem', position: 'relative', overflow: 'hidden', border: '1px solid var(--brand-100)', boxShadow: '0 4px 14px rgba(8,145,178,0.05)' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--brand-600)' }}>Predicted Cumulative GPA</p>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 900, color: newCGPA >= 8.5 ? '#10b981' : newCGPA >= 8.0 ? '#f59e0b' : '#ef4444', lineHeight: 1.1, margin: '0.5rem 0' }}>{newCGPA}</h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--brand-700)' }}>Predicted SGPA: <strong style={{ color: 'var(--brand-900)' }}>{predictedSGPA}</strong></p>
          
          {/* Placement cutoff visual line */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, background: 'var(--brand-100)' }}>
            <div style={{ height: '100%', background: 'var(--brand-500)', width: `${(newCGPA / 10) * 100}%`, transition: 'width 0.3s ease' }} />
            <div style={{ position: 'absolute', top: -12, left: '85%', transform: 'translateX(-50%)', background: 'var(--brand-500)', color: 'white', fontSize: '0.625rem', fontWeight: 900, padding: '2px 6px', borderRadius: 4 }}>8.5 CUTOFF</div>
            <div style={{ position: 'absolute', top: -4, left: '85%', width: 2, height: 8, background: 'var(--brand-500)' }} />
          </div>
        </div>

        <p style={{ fontSize: '0.8125rem', color: 'var(--brand-600)', marginBottom: '1.5rem', lineHeight: 1.5 }}>Adjust your expected grades for this semester to see how it impacts your final CGPA.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {marks.map(m => (
            <div key={m.subject} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--brand-100)', paddingBottom: '0.5rem' }}>
              <div>
                <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--brand-900)' }}>{m.subject.split(' ')[0]}</p>
                <p style={{ fontSize: '0.6875rem', color: 'var(--brand-600)' }}>{m.credits} Credits</p>
              </div>
              <select 
                value={expectedGrades[m.subject]} 
                onChange={(e) => setExpectedGrades({ ...expectedGrades, [m.subject]: e.target.value })}
                style={{ background: 'white', border: '1.5px solid var(--brand-100)', color: 'var(--brand-700)', padding: '6px 12px', borderRadius: 8, fontSize: '0.875rem', fontWeight: 800, outline: 'none', cursor: 'pointer' }}
              >
                {Object.keys(gradePoints).map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Hub
// ─────────────────────────────────────────────────────────────
export default function StudentAcademicHub() {
  const [activeTab, setActiveTab] = useState('timetable');

  const tabs = [
    { id: 'timetable',   label: 'Timetable',   icon: Calendar },
    { id: 'attendance',  label: 'Attendance',  icon: CheckCircle2 },
    { id: 'coursework',  label: 'Coursework & PYQs', icon: FileText },
    { id: 'marks',       label: 'Marks & CGPA', icon: TrendingUp },
  ];

  return (
    <div style={{ position: 'relative', minHeight: '100%', paddingBottom: '3rem', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-5%', left: '-5%', width: '30vw', height: '30vw', background: 'radial-gradient(circle, rgba(14,116,144,0.05) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0, pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 10 }}>
        
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-500)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Semester 5 · B.E Computer Science</p>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>Academic Hub</h1>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0.25rem', marginTop: '2rem', borderBottom: '1px solid var(--surface-3)' }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'transparent', border: 'none', cursor: 'pointer',
                  padding: '0.625rem 1rem 0.875rem', fontSize: '0.875rem', fontWeight: 700, marginBottom: '-1px',
                  color: activeTab === t.id ? 'var(--text-primary)' : 'var(--text-muted)',
                  borderBottom: activeTab === t.id ? '2px solid var(--text-primary)' : '2px solid transparent',
                  transition: 'all 0.2s',
                }}>
                <t.icon size={15} /> {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'timetable'   && <TimetableTab />}
          {activeTab === 'attendance'  && <AttendanceTab />}
          {activeTab === 'coursework'  && <CourseworkTab />}
          {activeTab === 'marks'       && <MarksTab />}
        </div>
      </div>
    </div>
  );
}
