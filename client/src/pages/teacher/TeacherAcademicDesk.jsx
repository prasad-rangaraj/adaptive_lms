import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2, XCircle, Calendar, Search, Filter, UserCheck,
  Radio, Wifi, Sparkles, X, Activity, CheckCircle, Video, VideoOff
} from 'lucide-react';
import { academicAPI } from '../../services/api.service';
import toast from 'react-hot-toast';

// ── Auto-Capture Results Modal ─────────────────────────────────────────────
function AutoCaptureModal({ results, onClose }) {
  if (!results) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ background: 'var(--surface-0)', borderRadius: 24, padding: '2rem', maxWidth: 580, width: '100%', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 32px 80px rgba(0,0,0,0.25)', border: '1px solid var(--surface-3)' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 0 3px rgba(16,185,129,0.2)' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Scan Complete</span>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>Live Class Attendance Capture</h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              {results.session_title ? `Class: "${results.session_title}" • ` : ''}
              {results.captured_count} attendee(s) verified &amp; marked Present
            </p>
            <div style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 999, padding: '3px 10px' }}>
              <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#10b981' }}>
                🔴 Active Live Session Attendees Only
              </span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'var(--surface-2)', border: 'none', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
            <X size={16} />
          </button>
        </div>

        {/* Stats Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Attended', value: results.captured_count, icon: <CheckCircle size={14} />, color: '#10b981' },
            { label: 'Method', value: 'Live Call + BLE', icon: <Wifi size={14} />, color: 'var(--brand-500)' },
            { label: 'Time', value: new Date(results.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }), icon: <Activity size={14} />, color: 'var(--text-muted)' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--surface-1)', borderRadius: 12, padding: '0.875rem', textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: s.color, marginBottom: 4 }}>
                {s.icon}
                <span style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</span>
              </div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 900, color: 'var(--text-primary)' }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Student Telemetry List */}
        {results.students && results.students.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>Attendees Logged</div>
            {results.students.map((s, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '36px 1fr auto', gap: '0.75rem', alignItems: 'center', background: 'var(--surface-1)', borderRadius: 12, padding: '0.75rem 1rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--brand-500), #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '0.875rem', flexShrink: 0 }}>
                  {s.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>{s.name}</div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: 2, display: 'flex', gap: '0.875rem', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Radio size={10} /> {s.beacon_node} &middot; {s.rssi}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Sparkles size={10} /> {s.confidence} match</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 999, padding: '3px 10px', flexShrink: 0 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
                  <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#10b981' }}>Present</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '1.5rem', textAlign: 'center', background: 'var(--surface-1)', borderRadius: 12, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            No students have joined this live session yet. As students join the call, their attendance will be captured.
          </div>
        )}

        {/* Footer */}
        <button onClick={onClose} style={{ marginTop: '1.5rem', width: '100%', background: 'var(--text-primary)', color: 'white', border: 'none', padding: '12px', borderRadius: 12, fontSize: '0.9375rem', fontWeight: 800, cursor: 'pointer' }}>
          Done
        </button>
      </div>
    </div>
  );
}

// ── Tab: Attendance Operations ─────────────────────────────────────────────
function AttendanceTab({ students = [], loading = false, refetch }) {
  const navigate = useNavigate();
  const [filterCourse, setFilterCourse] = useState('all');
  const [scanning, setScanning] = useState(false);
  const [scanResults, setScanResults] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const uniqueCourses = Array.from(new Map(students.map(s => [s.course_id, { id: s.course_id, title: s.course }])).values());
  const filteredStudents = students.filter(s => {
    const matchesCourse = filterCourse === 'all' || s.course_id === parseInt(filterCourse);
    const matchesSearch = !searchQuery.trim() ||
      s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.roll?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCourse && matchesSearch;
  });
  const activeCourseTitle = filterCourse === 'all' ? 'All Active Classes' : uniqueCourses.find(c => c.id === parseInt(filterCourse))?.title;

  const checkLiveSession = async () => {
    try {
      const res = await academicAPI.getTeacherActiveSession(filterCourse);
      setActiveSession(res.data?.active ? res.data.session : null);
    } catch (e) {
      setActiveSession(null);
    }
  };

  useEffect(() => {
    checkLiveSession();
    // Poll every 5 seconds so live session state automatically updates
    const interval = setInterval(checkLiveSession, 5000);
    return () => clearInterval(interval);
  }, [filterCourse]);

  const handleAutoCapture = async () => {
    setScanning(true);
    try {
      const res = await academicAPI.runAutoCapture(filterCourse);
      setScanResults(res.data);
      if (res.data.captured_count > 0) {
        toast.success(`Auto-Capture complete — ${res.data.captured_count} attendee(s) marked Present`);
      } else {
        toast('No students have joined this live session yet.', { icon: 'ℹ️' });
      }
      refetch();
      checkLiveSession();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Auto-Capture failed. Please try again.');
    } finally {
      setScanning(false);
    }
  };

  return (
    <>
      {scanResults && <AutoCaptureModal results={scanResults} onClose={() => setScanResults(null)} />}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '4rem', alignItems: 'start' }}>

        {/* ── Left: Roster ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)' }}>Today's Roster</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{activeCourseTitle} &bull; {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <select
                value={filterCourse}
                onChange={e => setFilterCourse(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--surface-3)', background: 'var(--surface-0)', fontSize: '0.875rem', cursor: 'pointer', outline: 'none' }}
              >
                <option value="all">All Active Classes</option>
                {uniqueCourses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
              <div style={{ position: 'relative' }}>
                <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search Roll or Name..."
                  style={{ padding: '8px 12px 8px 36px', borderRadius: 8, border: '1px solid var(--surface-3)', background: 'var(--surface-0)', fontSize: '0.875rem' }}
                />
              </div>
              <button style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-3)', padding: '8px 12px', borderRadius: 8, cursor: 'pointer' }}><Filter size={16} /></button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 200px', gap: '1rem', paddingBottom: '1rem', borderBottom: '2px solid var(--surface-3)', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Student</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Overall Att %</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'center' }}>Today's Status</span>
            </div>

            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
            ) : filteredStudents.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No students found.</div>
            ) : filteredStudents.map(student => (
              <div key={student.id} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 200px', gap: '1rem', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid var(--surface-2)' }}>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.875rem' }}>
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-primary)' }}>{student.name}</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{student.roll} &bull; {student.course}</p>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.9375rem', fontWeight: 800, color: student.attendance < 75 ? '#ef4444' : 'var(--text-primary)' }}>{student.attendance}%</span>
                </div>

                <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                  <button
                    onClick={async () => {
                      try {
                        await academicAPI.updateTeacherAttendance([{ student_id: student.id, course_id: student.course_id, date: new Date().toISOString().split('T')[0], status: 'present' }]);
                        toast.success('Marked Present');
                        refetch();
                      } catch(e) { toast.error('Failed to update'); }
                    }}
                    style={{ flex: 1, padding: '6px 0', border: 'none', borderRadius: 6, fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', background: student.status === 'present' ? '#10b981' : 'var(--surface-2)', color: student.status === 'present' ? 'white' : 'var(--text-muted)' }}>P</button>
                  <button
                    onClick={async () => {
                      try {
                        await academicAPI.updateTeacherAttendance([{ student_id: student.id, course_id: student.course_id, date: new Date().toISOString().split('T')[0], status: 'absent' }]);
                        toast.success('Marked Absent');
                        refetch();
                      } catch(e) { toast.error('Failed to update'); }
                    }}
                    style={{ flex: 1, padding: '6px 0', border: 'none', borderRadius: 6, fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', background: student.status === 'absent' ? '#ef4444' : 'var(--surface-2)', color: student.status === 'absent' ? 'white' : 'var(--text-muted)' }}>A</button>
                  <button
                    onClick={async () => {
                      try {
                        await academicAPI.updateTeacherAttendance([{ student_id: student.id, course_id: student.course_id, date: new Date().toISOString().split('T')[0], status: 'on_duty' }]);
                        toast.success('Marked On-Duty');
                        refetch();
                      } catch(e) { toast.error('Failed to update'); }
                    }}
                    style={{ flex: 1, padding: '6px 0', border: 'none', borderRadius: 6, fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', background: student.status === 'on_duty' ? 'var(--brand-500)' : 'var(--surface-2)', color: student.status === 'on_duty' ? 'white' : 'var(--text-muted)' }}>OD</button>
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* ── Right: Operations ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          <div style={{ background: 'var(--surface-0)', border: '1px solid var(--surface-3)', borderRadius: 20, padding: '1.5rem', textAlign: 'center' }}>
            
            {activeSession ? (
              <>
                {/* Radar animation when scanning */}
                {scanning && (
                  <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                    <div style={{ position: 'relative', width: 72, height: 72 }}>
                      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid var(--brand-500)', opacity: 0.15 }} />
                      <div style={{ position: 'absolute', inset: 8, borderRadius: '50%', border: '2px solid var(--brand-500)', opacity: 0.3 }} />
                      <div style={{ position: 'absolute', inset: 16, borderRadius: '50%', border: '2px solid var(--brand-500)', opacity: 0.6 }} />
                      <div style={{ position: 'absolute', inset: '50%', transform: 'translate(-50%,-50%)', width: 16, height: 16, borderRadius: '50%', background: 'var(--brand-500)', animation: 'pulse 1s infinite' }} />
                    </div>
                  </div>
                )}

                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: 999, padding: '4px 12px', marginBottom: '0.75rem' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Live Class Active
                  </span>
                </div>

                <h3 style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                  {activeSession.title}
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  {activeSession.course_title || 'Active Course'} &bull; {activeSession.participants_count || 0} student(s) joined
                </p>

                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.4 }}>
                  {scanning ? 'Scanning attendees in this live class and verifying via AI…' : 'Capture attendance for only the students who have actually joined this active live session.'}
                </p>

                <button
                  onClick={handleAutoCapture}
                  disabled={scanning}
                  style={{ width: '100%', background: scanning ? 'var(--surface-2)' : '#10b981', color: 'white', border: 'none', padding: '12px', borderRadius: 12, fontSize: '0.9375rem', fontWeight: 800, cursor: scanning ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)' }}
                >
                  <UserCheck size={18} /> {scanning ? 'Scanning Live Class…' : 'Run Auto-Capture'}
                </button>
              </>
            ) : (
              <>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: 'var(--text-muted)' }}>
                  <VideoOff size={22} />
                </div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Auto-Capture Inactive</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                  Auto-Capture only appears and logs attendance when you have an ongoing live class. Start a live session to enable one-click attendance verification.
                </p>
                <button
                  onClick={() => navigate('/teacher/live')}
                  style={{ width: '100%', background: 'var(--surface-2)', color: 'var(--text-primary)', border: '1px solid var(--surface-3)', padding: '10px 14px', borderRadius: 12, fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s' }}
                >
                  <Video size={16} color="var(--brand-500)" /> Go to Live Sessions
                </button>
              </>
            )}

          </div>

        </div>

      </div>
    </>
  );
}

// ── Tab: Approvals ───────────────────────────────────────────────────────
function ApprovalsTab({ requests = [], loading = false, refetch }) {

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      <div>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Pending Approvals</h2>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Review leave and On-Duty requests from your mentees and class representatives.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
        ) : requests.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No pending requests.</div>
        ) : requests.map(req => (
          <div key={req.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', background: 'var(--surface-0)', border: '1px solid var(--surface-3)', borderRadius: 12 }}>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-primary)' }}>{req.student}</h3>
                <span style={{ fontSize: '0.6875rem', fontWeight: 800, background: 'var(--brand-50)', color: 'var(--brand-700)', padding: '3px 8px', borderRadius: 999 }}>{req.type}</span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>{req.reason}</p>

              <div style={{ display: 'flex', gap: '1.25rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--text-muted)' }}><Calendar size={14} /> {req.dates}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--text-muted)', cursor: 'pointer', textDecoration: 'underline' }}>View Proof Document ({req.docs})</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexShrink: 0 }}>
              {req.status === 'pending' ? (
                <>
                  <button
                    onClick={async () => {
                      try {
                        await academicAPI.updateLeaveRequest(req.id, { status: 'rejected' });
                        toast.success('Request rejected');
                        refetch();
                      } catch (e) { toast.error('Error updating request'); }
                    }}
                    style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '8px 12px', borderRadius: 8, fontSize: '0.8125rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <XCircle size={14} /> Reject
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        await academicAPI.updateLeaveRequest(req.id, { status: 'approved' });
                        toast.success('Request approved');
                        refetch();
                      } catch (e) { toast.error('Error updating request'); }
                    }}
                    style={{ background: '#10b981', border: 'none', color: 'white', padding: '8px 12px', borderRadius: 8, fontSize: '0.8125rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle2 size={14} /> Approve
                  </button>
                </>
              ) : (
                <span style={{ fontSize: '0.875rem', fontWeight: 900, textTransform: 'uppercase', color: req.status === 'approved' ? '#10b981' : '#ef4444', paddingRight: '0.5rem' }}>
                  {req.status}
                </span>
              )}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}

// ── Main Hub ──────────────────────────────────────────────────────────────
export default function TeacherAcademicDesk() {
  const [activeTab, setActiveTab] = useState('attendance');
  const [students, setStudents] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loadingAtt, setLoadingAtt] = useState(true);
  const [loadingReq, setLoadingReq] = useState(true);

  const fetchAttendance = () => {
    academicAPI.getTeacherAttendance()
      .then(res => setStudents(res.data))
      .catch(() => {})
      .finally(() => setLoadingAtt(false));
  };

  const fetchRequests = () => {
    academicAPI.getTeacherLeaveRequests()
      .then(res => setRequests(res.data))
      .catch(() => {})
      .finally(() => setLoadingReq(false));
  };

  useEffect(() => {
    fetchAttendance();
    fetchRequests();
  }, []);

  return (
    <div style={{ position: 'relative', minHeight: '100%', paddingBottom: '4rem', overflow: 'hidden' }}>

      {/* ── Background Organic Orbs ── */}
      <div style={{ position: 'absolute', top: '10%', right: '10%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(139,92,246,0.04) 0%, transparent 70%)', filter: 'blur(80px)', zIndex: 0, pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 10 }}>

        {/* ── Editorial Header ── */}
        <div style={{ marginBottom: '2rem' }}>

          {/* Borderless Text Tabs */}
          <div style={{ display: 'flex', gap: '3rem', marginTop: '0', borderBottom: '1px solid var(--surface-3)' }}>
            {[
              { id: 'attendance', label: 'Attendance Register' },
              { id: 'approvals', label: 'Leave & OD Approvals' },
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
        <div style={{ minHeight: '600px', paddingTop: '1rem' }}>
          {activeTab === 'attendance' && <AttendanceTab students={students} loading={loadingAtt} refetch={fetchAttendance} />}
          {activeTab === 'approvals' && <ApprovalsTab requests={requests} loading={loadingReq} refetch={fetchRequests} />}
        </div>

      </div>
    </div>
  );
}
