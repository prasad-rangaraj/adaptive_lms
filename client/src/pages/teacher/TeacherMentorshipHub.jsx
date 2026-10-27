import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { 
  CheckCircle2, Target, HeartHandshake, Users, ArrowUpRight, MessageSquare, ShieldCheck, 
  Clock, Video, Calendar as CalendarIcon, UserPlus, X, Plus, ExternalLink, Sparkles, BookOpen
} from 'lucide-react';
import { communityAPI } from '../../services/api.service';

// ── Tab: Bounty Board Moderation ──────────────────────────────────────────
function BountyTab() {
  const [bounties, setBounties] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      communityAPI.getTeacherBounties(),
      communityAPI.getLeaderboard()
    ]).then(([bountiesRes, leaderboardRes]) => {
      setBounties(bountiesRes.data);
      setLeaderboard(leaderboardRes.data.slice(0, 5)); // top 5
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '4rem', alignItems: 'start' }}>
      
      {/* ── Left: Bounties ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Bounty Board Moderation</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Endorse correct answers to grant students bonus reputation points.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
          ) : bounties.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No bounties available.</div>
          ) : bounties.map(bounty => (
            <div key={bounty.id} style={{ background: 'var(--surface-0)', border: '1px solid var(--surface-3)', borderRadius: 16, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.4 }}>{bounty.title}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fef3c7', padding: '4px 10px', borderRadius: 999 }}>
                  <Target size={14} color="#d97706" />
                  <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#b45309' }}>{bounty.bounty} REP</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {bounty.tags.map(t => (
                  <span key={t} style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', background: 'var(--surface-2)', padding: '4px 10px', borderRadius: 8 }}>{t}</span>
                ))}
              </div>

              {/* Proposed Solution Section */}
              <div style={{ marginTop: '1rem', borderTop: '1px solid var(--surface-3)', paddingTop: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
                  <MessageSquare size={16} color="var(--text-muted)" />
                  <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>Proposed Solution</span>
                </div>
                <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem', background: 'var(--surface-1)', padding: '1rem', borderRadius: 12 }}>
                  This bounty requires teacher endorsement to award the reputation points and close out the thread.
                </p>
                
                <button 
                  onClick={async () => {
                    await communityAPI.endorseBounty(bounty.id);
                    setBounties(bounties.map(b => b.id === bounty.id ? { ...b, status: 'Solved' } : b));
                  }}
                  disabled={bounty.status === 'Solved'}
                  style={{ background: bounty.status === 'Solved' ? 'var(--surface-2)' : '#10b981', color: bounty.status === 'Solved' ? 'var(--text-muted)' : 'white', border: 'none', padding: '10px 20px', borderRadius: 8, fontSize: '0.875rem', fontWeight: 800, cursor: bounty.status === 'Solved' ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShieldCheck size={16} /> {bounty.status === 'Solved' ? 'Endorsed' : 'Endorse Answer (Awards 2x Rep)'}
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* ── Right: AI Insights ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ background: 'var(--brand-50)', border: '1px solid var(--brand-100)', borderRadius: 20, padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--brand-900)', marginBottom: '1rem' }}>Top Contributors</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--brand-700)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            These students are actively helping peers in your courses.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {leaderboard.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--brand-700)', fontSize: '0.8125rem' }}>No contributors yet.</div>
            ) : leaderboard.map(student => (
              <div key={student.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '12px', borderRadius: 12 }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>{student.name}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#10b981' }}>+{student.reputation} REP</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}

// ── Tab: Mentorship ───────────────────────────────────────────────────────
function MentorshipTab() {
  const navigate = useNavigate();
  const [mentees, setMentees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMentee, setSelectedMentee] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [assignForm, setAssignForm] = useState({ studentId: '', focusArea: 'Software Engineering & Cloud Architecture' });
  const [assigning, setAssigning] = useState(false);

  const fetchMentees = () => {
    setLoading(true);
    communityAPI.getTeacherMentees()
      .then(res => setMentees(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMentees();
  }, []);

  const openAssignModal = () => {
    communityAPI.getAvailableStudents().then(res => {
      setAvailableStudents(res.data);
      if (res.data.length > 0) {
        setAssignForm(prev => ({ ...prev, studentId: res.data[0].id }));
      }
      setShowAssignModal(true);
    }).catch(() => {
      toast.error('Unable to fetch students list');
    });
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!assignForm.studentId) return;
    setAssigning(true);
    try {
      await communityAPI.assignMentee({
        student_id: parseInt(assignForm.studentId),
        focus_area: assignForm.focusArea.trim() || 'Academic Mentorship',
      });
      toast.success('Mentee assigned to your roster!');
      setShowAssignModal(false);
      fetchMentees();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to assign mentee');
    } finally {
      setAssigning(false);
    }
  };

  const activeMentees = mentees.filter(m => m.status === 'active');
  const pendingRequests = mentees.filter(m => m.status === 'pending');

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '3rem', alignItems: 'start' }}>
      
      {/* ── Left: Mentees ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Your Assigned Mentees</h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Track their career goals, academic progress, and schedule 1-on-1 sessions.</p>
          </div>
          <button 
            onClick={openAssignModal}
            className="btn btn-primary btn-sm"
            style={{ gap: 6, fontWeight: 800 }}
          >
            <UserPlus size={15} /> Assign Mentee
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading mentees...</div>
          ) : activeMentees.length === 0 ? (
            <div style={{ padding: '3rem 2rem', textAlign: 'center', background: 'var(--surface-0)', borderRadius: 16, border: '2px dashed var(--surface-3)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <HeartHandshake size={36} color="var(--brand-500)" />
              <p style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>No Assigned Mentees Yet</p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0, maxWidth: 360 }}>
                You have no active student mentees. You can assign a student directly or accept pending requests on the right.
              </p>
              <button onClick={openAssignModal} className="btn btn-secondary btn-sm" style={{ gap: 6, marginTop: 4 }}>
                <UserPlus size={14} /> Assign Student Now
              </button>
            </div>
          ) : activeMentees.map(mentee => (
            <div key={mentee.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface-0)', border: '1px solid var(--surface-3)', borderRadius: 14, padding: '1.25rem', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, var(--brand-500), var(--brand-700))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1rem', color: 'white', flexShrink: 0, overflow: 'hidden' }}>
                  {mentee.avatar_url ? (
                    <img src={mentee.avatar_url} alt={mentee.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    mentee.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 2px' }}>{mentee.name}</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Track: <span style={{ fontWeight: 700, color: 'var(--brand-600)' }}>{mentee.goal}</span>
                  </p>
                  <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>{mentee.email}</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '1.125rem', fontWeight: 900, color: mentee.progress < 30 ? '#e11d48' : 'var(--brand-600)' }}>{mentee.progress}%</span>
                  <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', margin: 0, fontWeight: 700 }}>Avg Progress</p>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button 
                    onClick={() => setSelectedMentee(mentee)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.75rem', fontWeight: 700, padding: '6px 12px' }}
                  >
                    Review Profile
                  </button>
                  <button 
                    onClick={() => window.open(`/meet/mentorship-${mentee.id}`, '_blank')}
                    className="btn btn-primary btn-sm"
                    style={{ fontSize: '0.75rem', fontWeight: 700, padding: '6px 12px', gap: 5 }}
                    title="Start Live 1-on-1 Video Session"
                  >
                    <Video size={13} /> 1-on-1 Meet
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* ── Right: Incoming Requests ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ background: 'var(--surface-0)', border: '1px solid var(--surface-3)', borderRadius: 16, padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Mentorship Requests</h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
            {pendingRequests.length} student{pendingRequests.length !== 1 ? 's' : ''} requested you as their primary faculty mentor.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {pendingRequests.length === 0 ? (
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>No pending requests.</p>
            ) : pendingRequests.map(req => (
              <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--surface-2)', paddingBottom: '0.75rem' }}>
                <div>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--text-primary)', display: 'block' }}>{req.name}</span>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{req.goal}</span>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button 
                    onClick={async () => {
                      await communityAPI.acceptMentorship(req.id);
                      toast.success(`Accepted ${req.name} as mentee!`);
                      fetchMentees();
                    }}
                    style={{ background: '#10b981', color: 'white', border: 'none', padding: '5px 10px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}>
                    Accept
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Assign Mentee Modal ── */}
      {showAssignModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: 460, background: 'var(--surface-0)', borderRadius: 20, padding: '2rem', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <UserPlus size={20} color="var(--brand-600)" />
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Assign Student as Mentee</h3>
              </div>
              <button onClick={() => setShowAssignModal(false)} className="btn btn-ghost btn-sm" style={{ padding: 4 }}><X size={16} /></button>
            </div>

            <form onSubmit={handleAssignSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label className="label" style={{ fontWeight: 700, marginBottom: 6, display: 'block', fontSize: '0.8125rem' }}>Select Student</label>
                {availableStudents.length === 0 ? (
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>No students enrolled in your workspace.</p>
                ) : (
                  <select 
                    value={assignForm.studentId}
                    onChange={e => setAssignForm(f => ({ ...f, studentId: e.target.value }))}
                    className="input-field"
                    style={{ width: '100%', fontSize: '0.875rem' }}
                    required
                  >
                    {availableStudents.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="label" style={{ fontWeight: 700, marginBottom: 6, display: 'block', fontSize: '0.8125rem' }}>Career / Research Focus Area</label>
                <input 
                  type="text"
                  value={assignForm.focusArea}
                  onChange={e => setAssignForm(f => ({ ...f, focusArea: e.target.value }))}
                  placeholder="e.g. Distributed Systems & Cloud Architecture"
                  className="input-field"
                  style={{ width: '100%', fontSize: '0.875rem' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowAssignModal(false)} className="btn btn-ghost btn-sm">Cancel</button>
                <button type="submit" disabled={assigning || !assignForm.studentId} className="btn btn-primary btn-sm" style={{ fontWeight: 800 }}>
                  {assigning ? 'Assigning...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Review Mentee Profile Modal ── */}
      {selectedMentee && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: 520, background: 'var(--surface-0)', borderRadius: 20, padding: '2rem', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Mentee Academic Dossier</h3>
              <button onClick={() => setSelectedMentee(null)} className="btn btn-ghost btn-sm" style={{ padding: 4 }}><X size={16} /></button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: '1.5rem', padding: '1.25rem', background: 'var(--surface-1)', borderRadius: 14 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, var(--brand-500), var(--brand-700))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '1.25rem', overflow: 'hidden' }}>
                {selectedMentee.avatar_url ? (
                  <img src={selectedMentee.avatar_url} alt={selectedMentee.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  selectedMentee.name.charAt(0).toUpperCase()
                )}
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{selectedMentee.name}</h4>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>{selectedMentee.email}</p>
                <span style={{ display: 'inline-block', marginTop: 6, fontSize: '0.6875rem', fontWeight: 800, color: 'var(--brand-700)', background: 'var(--brand-50)', padding: '2px 8px', borderRadius: 6, border: '1px solid var(--brand-200)' }}>
                  Active Mentee
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '1rem', background: 'var(--surface-1)', borderRadius: 12 }}>
                <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', margin: 0 }}>Career Horizon</p>
                <p style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0 0' }}>{selectedMentee.goal}</p>
              </div>
              <div style={{ padding: '1rem', background: 'var(--surface-1)', borderRadius: 12 }}>
                <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', margin: 0 }}>Course Progress</p>
                <p style={{ fontSize: '0.875rem', fontWeight: 800, color: selectedMentee.progress < 30 ? '#e11d48' : '#16a34a', margin: '4px 0 0' }}>
                  {selectedMentee.progress}% Completed
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
              <button 
                onClick={() => { setSelectedMentee(null); navigate('/teacher/chat'); }}
                className="btn btn-secondary btn-sm"
                style={{ gap: 6, fontWeight: 700 }}
              >
                <MessageSquare size={14} /> Send Message
              </button>
              <button 
                onClick={() => {
                  window.open(`/meet/mentorship-${selectedMentee.id}`, '_blank');
                  setSelectedMentee(null);
                }}
                className="btn btn-primary btn-sm"
                style={{ gap: 6, fontWeight: 800 }}
              >
                <Video size={14} /> Launch 1-on-1 Video Meet
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ── Tab 3: Office Hours Scheduler ─────────────────────────────────────────
function OfficeHoursTab() {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [students, setStudents] = useState([]);
  const [scheduleForm, setScheduleForm] = useState({ studentId: '', topic: '1-on-1 Mentorship & Career Review', date: new Date().toISOString().split('T')[0], time: '14:00' });
  const [bookingLoading, setBookingLoading] = useState(false);

  const fetchBookings = () => {
    setLoading(true);
    communityAPI.getTeacherOfficeHours()
      .then(res => setBookings(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const openScheduleModal = () => {
    communityAPI.getAvailableStudents().then(res => {
      setStudents(res.data);
      if (res.data.length > 0) {
        setScheduleForm(prev => ({ ...prev, studentId: res.data[0].id }));
      }
      setShowScheduleModal(true);
    }).catch(() => {
      toast.error('Unable to fetch students');
    });
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    if (!scheduleForm.topic || !scheduleForm.date || !scheduleForm.time) return;
    setBookingLoading(true);
    try {
      await communityAPI.bookOfficeHour({
        teacher_id: user?.id,
        topic: scheduleForm.topic,
        date: scheduleForm.date,
        time: scheduleForm.time,
      });
      toast.success('1-on-1 Session Scheduled in Calendar!');
      setShowScheduleModal(false);
      fetchBookings();
    } catch (err) {
      toast.error('Failed to schedule session');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '4rem', alignItems: 'start' }}>
      
      {/* ── Left: Scheduler & Rules ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Office Hours Configuration</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Set your availability. Students can automatically book open slots.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'var(--surface-0)', border: '1px solid var(--surface-3)', borderRadius: 20, padding: '2rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1.5rem', borderBottom: '1px solid var(--surface-2)' }}>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Weekly Availability</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Tuesdays & Thursdays, 2 PM - 4 PM</p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={openScheduleModal} className="btn btn-primary btn-sm" style={{ gap: 6, fontWeight: 800 }}>
                <Plus size={14} /> Schedule 1-on-1
              </button>
              <button style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-3)', padding: '8px 16px', borderRadius: 8, fontSize: '0.8125rem', fontWeight: 800, cursor: 'pointer' }}>Edit Rules</button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1.5rem', borderBottom: '1px solid var(--surface-2)' }}>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Slot Duration</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>15 minutes</p>
            </div>
            <button style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-3)', padding: '8px 16px', borderRadius: 8, fontSize: '0.8125rem', fontWeight: 800, cursor: 'pointer' }}>Edit Duration</button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Meeting Location</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Lumina Built-in Video Conf</p>
            </div>
            <button style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-3)', padding: '8px 16px', borderRadius: 8, fontSize: '0.8125rem', fontWeight: 800, cursor: 'pointer' }}>Edit Location</button>
          </div>

        </div>
      </div>

      {/* ── Right: Today's Schedule ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        <div style={{ background: 'var(--brand-50)', border: '1px solid var(--brand-100)', borderRadius: 20, padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.5rem' }}>
            <CalendarIcon size={20} color="var(--brand-600)" />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--brand-900)' }}>Today's Bookings</h3>
          </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading bookings...</div>
          ) : bookings.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No upcoming bookings</div>
          ) : bookings.map(b => (
              <div key={b.id} style={{ background: 'white', borderRadius: 12, padding: '1rem', border: '1px solid var(--brand-100)' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--brand-600)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: '0.5rem' }}>
                  <Clock size={12} /> {b.time}
                </p>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{b.student}</h4>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>{b.topic}</p>
                <button onClick={() => window.location.href = `/meet/booking-${b.id}`} style={{ width: '100%', background: 'var(--brand-500)', color: 'white', border: 'none', padding: '8px', borderRadius: 8, fontSize: '0.8125rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <Video size={14} /> Join Meeting
                </button>
              </div>
            ))}
            
            {bookings.length === 0 && (
              <p style={{ fontSize: '0.875rem', color: 'var(--brand-700)', textAlign: 'center', padding: '1rem 0' }}>No bookings for today.</p>
            )}
          </div>
        </div>

      </div>


      {/* ── Schedule 1-on-1 Modal ── */}
      {showScheduleModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: 460, background: 'var(--surface-0)', borderRadius: 20, padding: '2rem', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <CalendarIcon size={20} color="var(--brand-600)" />
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Schedule 1-on-1 Session</h3>
              </div>
              <button onClick={() => setShowScheduleModal(false)} className="btn btn-ghost btn-sm" style={{ padding: 4 }}><X size={16} /></button>
            </div>

            <form onSubmit={handleCreateBooking} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label className="label" style={{ fontWeight: 700, marginBottom: 6, display: 'block', fontSize: '0.8125rem' }}>Student</label>
                <select 
                  value={scheduleForm.studentId}
                  onChange={e => setScheduleForm(f => ({ ...f, studentId: e.target.value }))}
                  className="input-field"
                  style={{ width: '100%', fontSize: '0.875rem' }}
                  required
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label" style={{ fontWeight: 700, marginBottom: 6, display: 'block', fontSize: '0.8125rem' }}>Session Topic</label>
                <input 
                  type="text"
                  value={scheduleForm.topic}
                  onChange={e => setScheduleForm(f => ({ ...f, topic: e.target.value }))}
                  className="input-field"
                  style={{ width: '100%', fontSize: '0.875rem' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="label" style={{ fontWeight: 700, marginBottom: 6, display: 'block', fontSize: '0.8125rem' }}>Date</label>
                  <input 
                    type="date"
                    value={scheduleForm.date}
                    onChange={e => setScheduleForm(f => ({ ...f, date: e.target.value }))}
                    className="input-field"
                    style={{ width: '100%', fontSize: '0.875rem' }}
                    required
                  />
                </div>
                <div>
                  <label className="label" style={{ fontWeight: 700, marginBottom: 6, display: 'block', fontSize: '0.8125rem' }}>Time</label>
                  <input 
                    type="time"
                    value={scheduleForm.time}
                    onChange={e => setScheduleForm(f => ({ ...f, time: e.target.value }))}
                    className="input-field"
                    style={{ width: '100%', fontSize: '0.875rem' }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowScheduleModal(false)} className="btn btn-ghost btn-sm">Cancel</button>
                <button type="submit" disabled={bookingLoading} className="btn btn-primary btn-sm" style={{ fontWeight: 800 }}>
                  {bookingLoading ? 'Scheduling...' : 'Schedule & Send Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Hub ──────────────────────────────────────────────────────────────
export default function TeacherMentorshipHub() {
  const [activeTab, setActiveTab] = useState('bounty');

  return (
    <div style={{ position: 'relative', minHeight: '100%', paddingBottom: '4rem', overflow: 'hidden' }}>
      
      {/* ── Background Organic Orbs ── */}
      <div style={{ position: 'absolute', top: '10%', right: '10%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(217,119,6,0.04) 0%, transparent 70%)', filter: 'blur(80px)', zIndex: 0, pointerEvents: 'none' }} />
      
      <div style={{ position: 'relative', zIndex: 10 }}>

        {/* ── Editorial Header ── */}
        <div style={{ marginBottom: '2rem' }}>
          

          {/* Borderless Text Tabs */}
          <div style={{ display: 'flex', gap: '3rem', marginTop: '0', borderBottom: '1px solid var(--surface-3)' }}>
            {[
              { id: 'bounty', label: 'Bounty Board Moderation' },
              { id: 'mentorship', label: 'My Mentees' },
              { id: 'office_hours', label: 'Office Hours Scheduler' },
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
          {activeTab === 'bounty' && <BountyTab />}
          {activeTab === 'mentorship' && <MentorshipTab />}
          {activeTab === 'office_hours' && <OfficeHoursTab />}
        </div>

      </div>
    </div>
  );
}
