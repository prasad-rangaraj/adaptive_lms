import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { academicAPI, liveAPI } from '../../services/api.service';
import {
  Calendar, UserCheck, MapPin, Plus, X, Clock, CheckCircle2,
  Video, Coffee, Send, Zap
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─── Pill badge ───────────────────────────────────────────────────────────────
function Pill({ children, color = '#10b981', bg = '#ecfdf5', border = '#a7f3d0' }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 10px', borderRadius: 999,
      fontSize: '0.6875rem', fontWeight: 800,
      color, background: bg, border: `1px solid ${border}`
    }}>{children}</span>
  );
}

// ─── Mini stat ────────────────────────────────────────────────────────────────
function MiniStat({ label, value, icon: Icon, color }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 6,
      padding: '1rem 1.25rem', background: 'var(--surface-0)',
      border: '1px solid var(--glass-border)', borderRadius: 14,
      flex: 1, minWidth: 120
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Icon size={14} color={color} />
        </div>
        <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
      </div>
      <span style={{ fontSize: '1.375rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</span>
    </div>
  );
}



// ─────────────────────────────────────────────────────────────────────────────
// TAB 1: MASTER TIMETABLE — visual weekly calendar with add event & conflict check
// ─────────────────────────────────────────────────────────────────────────────
const DAY_COLORS = {
  Monday:    { dot: '#3b82f6', bg: '#eff6ff' },
  Tuesday:   { dot: '#8b5cf6', bg: '#f5f3ff' },
  Wednesday: { dot: '#10b981', bg: '#ecfdf5' },
  Thursday:  { dot: '#f59e0b', bg: '#fffbeb' },
  Friday:    { dot: '#ef4444', bg: '#fff1f2' },
};

function TimetableTab() {
  const [showAdd, setShowAdd] = useState(false);
  const [filterDept, setFilterDept] = useState('');
  const [deptId, setDeptId] = useState('');
  const [cohortId, setCohortId] = useState('');
  const [formData, setFormData] = useState({
    title: '', faculty_id: '', day_of_week: 'Monday',
    start_time: '09:00', end_time: '10:00', venue: 'Hall 101'
  });

  const { data: depts = [] } = useQuery({ queryKey: ['depts'], queryFn: () => academicAPI.getDepartments().then(r => r.data) });
  const { data: cohorts = [] } = useQuery({ queryKey: ['cohorts', deptId], queryFn: () => academicAPI.getCohorts(deptId).then(r => r.data), enabled: !!deptId });
  const { data: teachers = [] } = useQuery({ queryKey: ['allTeachers'], queryFn: () => academicAPI.getTeachers().then(r => r.data) });
  const { data: timetable = {}, refetch: refetchTimetable } = useQuery({ queryKey: ['masterTimetable'], queryFn: () => academicAPI.getTimetable().then(r => r.data) });

  const handleAdd = async e => {
    e.preventDefault();
    try {
      await academicAPI.createTimetable({
        ...formData,
        faculty_id: formData.faculty_id ? parseInt(formData.faculty_id) : null,
        department_id: parseInt(deptId),
        cohort_id: cohortId ? parseInt(cohortId) : null,
      });
      toast.success('Master timetable event scheduled!');
      setShowAdd(false);
      setFormData({ title: '', faculty_id: '', day_of_week: 'Monday', start_time: '09:00', end_time: '10:00', venue: 'Hall 101' });
      refetchTimetable();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Scheduling conflict — please check timing or venue');
    }
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const totalSlots = days.reduce((s, d) => s + (Array.isArray(timetable[d]) ? timetable[d].length : 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>Master Timetable</h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
            {totalSlots} class slots scheduled this week across all organization departments
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <select
            value={filterDept}
            onChange={e => setFilterDept(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid var(--glass-border)', background: 'var(--surface-0)', color: 'var(--text-primary)', fontSize: '0.8125rem', outline: 'none' }}
          >
            <option value="">All Departments</option>
            {depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="btn btn-primary"
            style={{ gap: 8, fontSize: '0.875rem' }}
          >
            {showAdd ? <><X size={15} /> Cancel</> : <><Plus size={15} /> Add Event</>}
          </button>
        </div>
      </div>

      {/* Add form */}
      {showAdd && (
        <div style={{
          background: 'var(--surface-0)', border: '1px solid var(--glass-border)',
          borderRadius: 16, padding: '1.75rem',
          boxShadow: '0 8px 30px rgba(0,0,0,0.06)'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Zap size={18} color="var(--brand-500)" /> Schedule Master Class Event
          </h3>
          <form onSubmit={handleAdd}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              {[
                { label: 'Event / Course Title', comp: <input placeholder="e.g. Advanced AI Lecture" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} style={inputStyle} /> },
                { label: 'Day of Week', comp: <select value={formData.day_of_week} onChange={e => setFormData({ ...formData, day_of_week: e.target.value })} style={inputStyle}>{days.map(d => <option key={d}>{d}</option>)}</select> },
                { label: 'Start Time', comp: <input type="time" required value={formData.start_time} onChange={e => setFormData({ ...formData, start_time: e.target.value })} style={inputStyle} /> },
                { label: 'End Time', comp: <input type="time" required value={formData.end_time} onChange={e => setFormData({ ...formData, end_time: e.target.value })} style={inputStyle} /> },
                { label: 'Venue / Room', comp: <input placeholder="Room 204 or Lab B" required value={formData.venue} onChange={e => setFormData({ ...formData, venue: e.target.value })} style={inputStyle} /> },
                {
                  label: 'Department', comp: (
                    <select value={deptId} onChange={e => setDeptId(e.target.value)} required style={inputStyle}>
                      <option value="">Select Department</option>
                      {depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  )
                },
                {
                  label: 'Cohort (optional)', comp: (
                    <select value={cohortId} onChange={e => setCohortId(e.target.value)} style={inputStyle} disabled={!deptId}>
                      <option value="">All Cohorts</option>
                      {cohorts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  )
                },
                {
                  label: 'Assigned Faculty', comp: (
                    <select value={formData.faculty_id} onChange={e => setFormData({ ...formData, faculty_id: e.target.value })} required style={inputStyle}>
                      <option value="">Select Teacher</option>
                      {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  )
                },
              ].map(({ label, comp }) => (
                <div key={label}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>{label}</label>
                  {comp}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowAdd(false)} className="btn btn-secondary">Cancel</button>
              <button type="submit" className="btn btn-primary" style={{ gap: 6 }}>
                <CheckCircle2 size={15} /> Save to Master Timetable
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Calendar Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
        {days.map(day => {
          const { dot, bg } = DAY_COLORS[day];
          const rawEvents = timetable[day] || [];
          const events = rawEvents.filter(e =>
            !filterDept || e.department_id === parseInt(filterDept)
          );
          return (
            <div key={day} style={{
              background: 'var(--surface-0)', border: '1px solid var(--glass-border)',
              borderRadius: 14, overflow: 'hidden'
            }}>
              {/* Day header */}
              <div style={{
                padding: '0.75rem 1rem', background: bg,
                borderBottom: `2px solid ${dot}20`,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div>
                  <p style={{ fontWeight: 900, fontSize: '0.9375rem', color: 'var(--text-primary)', margin: 0 }}>{day}</p>
                  <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>{events.length} class{events.length !== 1 ? 'es' : ''}</p>
                </div>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: dot }} />
              </div>

              {/* Events */}
              <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: 8, minHeight: 140 }}>
                {events.length === 0 ? (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: 24 }}>No classes</p>
                ) : events.map(evt => (
                  <div key={evt.id} style={{
                    padding: '0.625rem 0.75rem', borderRadius: 10,
                    background: `${dot}10`, border: `1px solid ${dot}30`
                  }}>
                    <p style={{ fontWeight: 800, fontSize: '0.8125rem', color: 'var(--text-primary)', margin: 0 }}>{evt.subject || evt.title}</p>
                    <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', margin: '3px 0 0' }}>
                      {evt.faculty || 'TBD'} · {evt.time || `${evt.start_time}–${evt.end_time}`}
                    </p>
                    {evt.venue && (
                      <p style={{ fontSize: '0.6875rem', color: dot, fontWeight: 700, margin: '2px 0 0', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <MapPin size={9} /> {evt.venue}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 3: TEACHER MANAGEMENT — Leave & OD for teachers ONLY + meeting scheduler
// ─────────────────────────────────────────────────────────────────────────────
function TeacherManagementTab() {
  const queryClient = useQueryClient();
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [meetingForm, setMeetingForm] = useState({ title: '', date: '', time: '10:00', agenda: '', platform: 'Google Meet' });
  const [leaveFilter, setLeaveFilter] = useState('Pending');

  // Teacher leave requests from backend
  const { data: allRequests = [], isLoading } = useQuery({
    queryKey: ['adminLeaveRequests'],
    queryFn: () => academicAPI.getAdminLeaveRequests().then(res => res.data)
  });

  const { data: teachers = [] } = useQuery({
    queryKey: ['allTeachers'],
    queryFn: () => academicAPI.getTeachers().then(r => r.data)
  });

  // Filter strictly for TEACHER requests
  const teacherRequests = allRequests.filter(r => r.role === 'Teacher');
  const filtered = teacherRequests.filter(r => leaveFilter === 'all' || r.status === leaveFilter);

  const handleReview = async (id, status) => {
    try {
      await academicAPI.updateLeaveRequest(id, { status });
      queryClient.invalidateQueries(['adminLeaveRequests']);
      toast.success(`Teacher request ${status.toLowerCase()} successfully`);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to update request");
    }
  };

  const handleScheduleMeeting = async (e) => {
    e.preventDefault();
    try {
      const scheduledAt = meetingForm.date && meetingForm.time ? `${meetingForm.date}T${meetingForm.time}:00` : null;
      const res = await liveAPI.createSession({
        title: meetingForm.title,
        description: `Faculty sync with ${selectedTeacher?.name || 'Instructor'} (${meetingForm.platform}): ${meetingForm.agenda || 'No agenda provided'}`,
        scheduled_at: scheduledAt
      });
      const roomName = res.data.room_name || `session-${res.data.id}`;
      toast.success(`Meeting created & sync dispatched to ${selectedTeacher?.name || 'Faculty Member'}! Room ID: ${roomName}`, { duration: 5000 });
      setShowMeetingModal(false);
      setMeetingForm({ title: '', date: '', time: '10:00', agenda: '', platform: 'Google Meet' });
      setSelectedTeacher(null);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to schedule live meeting");
    }
  };

  const pending = teacherRequests.filter(r => r.status === 'Pending').length;
  const approved = teacherRequests.filter(r => r.status === 'Approved').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <MiniStat label="Total Faculty" value={teachers.length || 6} icon={UserCheck} color="#3b82f6" />
        <MiniStat label="Pending Teacher Requests" value={pending} icon={Clock} color="#f59e0b" />
        <MiniStat label="Approved This Month" value={approved} icon={CheckCircle2} color="#10b981" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.75rem', alignItems: 'flex-start' }}>

        {/* Teacher Leave & OD requests */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
                Faculty Leave &amp; On-Duty (OD) Requests
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                Review and approve teacher absence &amp; conference applications (Teachers only)
              </p>
            </div>
            <div style={{ display: 'flex', background: 'var(--surface-1)', borderRadius: 10, border: '1px solid var(--glass-border)', padding: 3, gap: 2 }}>
              {['Pending', 'Approved', 'Rejected', 'all'].map(s => (
                <button
                  key={s} onClick={() => setLeaveFilter(s)}
                  style={{
                    padding: '4px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    fontWeight: 700, fontSize: '0.75rem',
                    background: leaveFilter === s ? 'white' : 'transparent',
                    color: leaveFilter === s ? 'var(--brand-600)' : 'var(--text-muted)',
                    boxShadow: leaveFilter === s ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                  }}
                >{s === 'all' ? 'All' : s}</button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading faculty requests...</div>
          ) : filtered.length === 0 ? (
            <div style={{
              padding: '3rem', textAlign: 'center',
              background: 'var(--surface-0)', border: '1px dashed var(--glass-border)',
              borderRadius: 14, color: 'var(--text-muted)'
            }}>
              <Coffee size={28} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
              <p style={{ fontWeight: 700 }}>No {leaveFilter === 'all' ? '' : leaveFilter.toLowerCase()} requests from teachers.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {filtered.map(req => {
                const isPending = req.status === 'Pending';
                const typeColor = req.type?.toLowerCase().includes('duty') ? '#8b5cf6' : '#f59e0b';
                const typeBg = req.type?.toLowerCase().includes('duty') ? '#f5f3ff' : '#fffbeb';
                return (
                  <div key={req.id} style={{
                    background: 'var(--surface-0)', border: '1px solid var(--glass-border)',
                    borderRadius: 14, padding: '1.25rem',
                    boxShadow: isPending ? '0 0 0 1px #f59e0b25' : 'none'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                          <div style={{
                            width: 34, height: 34, borderRadius: '50%',
                            background: 'linear-gradient(135deg, #0891b2, #0e7490)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.875rem', fontWeight: 800, color: 'white', flexShrink: 0
                          }}>
                            {req.name?.charAt(0)}
                          </div>
                          <div>
                            <p style={{ fontWeight: 800, color: 'var(--text-primary)', margin: 0, fontSize: '0.9375rem' }}>{req.name}</p>
                            <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#0891b2', background: '#ecfeff', padding: '1px 7px', borderRadius: 999, border: '1px solid #a5f3fc' }}>Teacher</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '8px 0' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: typeColor, background: typeBg, padding: '3px 10px', borderRadius: 999 }}>{req.type}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📅 {req.duration}</span>
                        </div>

                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>
                          "{req.reason}"
                        </p>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                        {/* Status badge */}
                        {req.status === 'Pending' && <Pill color="#d97706" bg="#fff7ed" border="#fed7aa">Pending</Pill>}
                        {req.status === 'Approved' && <Pill color="#059669" bg="#ecfdf5" border="#bbf7d0">Approved</Pill>}
                        {req.status === 'Rejected' && <Pill color="#dc2626" bg="#fff1f2" border="#fecdd3">Rejected</Pill>}

                        {isPending && (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              onClick={() => handleReview(req.id, 'Approved')}
                              style={{
                                padding: '6px 14px', borderRadius: 8, border: '1px solid #a7f3d0',
                                background: '#ecfdf5', color: '#10b981', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer'
                              }}
                            ><CheckCircle2 size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />Approve</button>
                            <button
                              onClick={() => handleReview(req.id, 'Rejected')}
                              style={{
                                padding: '6px 14px', borderRadius: 8, border: '1px solid #fecdd3',
                                background: '#fff1f2', color: '#ef4444', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer'
                              }}
                            ><X size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />Reject</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right sidebar: Faculty Roster + Arrange Meetings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Arrange Meeting trigger banner */}
          <div style={{
            background: 'linear-gradient(135deg, var(--brand-500), var(--brand-700))',
            borderRadius: 14, padding: '1.5rem', color: 'white',
            boxShadow: '0 8px 24px rgba(99,102,241,0.25)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <Video size={20} />
              <h4 style={{ fontWeight: 800, fontSize: '0.9375rem', margin: 0 }}>Arrange Faculty Meeting</h4>
            </div>
            <p style={{ fontSize: '0.8125rem', opacity: 0.9, margin: '0 0 14px', lineHeight: 1.5 }}>
              Coordinate academic reviews, performance syncs, or department briefings with teachers.
            </p>
            <button
              onClick={() => { setSelectedTeacher(null); setShowMeetingModal(true); }}
              style={{
                width: '100%', padding: '0.625rem', borderRadius: 10,
                background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.35)',
                color: 'white', fontWeight: 800, fontSize: '0.875rem', cursor: 'pointer',
                backdropFilter: 'blur(4px)', transition: 'background 0.2s'
              }}
            >
              <Plus size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              Schedule Meeting
            </button>
          </div>

          {/* Teacher roster */}
          <div style={{ background: 'var(--surface-0)', border: '1px solid var(--glass-border)', borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ fontWeight: 800, fontSize: '0.875rem', color: 'var(--text-primary)', margin: 0 }}>Faculty Roster</h4>
              <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--text-muted)' }}>{teachers.length} onboarded</span>
            </div>
            <div style={{ maxHeight: 340, overflowY: 'auto' }}>
              {teachers.length === 0 ? (
                <p style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>No teachers onboarded yet.</p>
              ) : teachers.map(t => (
                <div
                  key={t.id}
                  onClick={() => { setSelectedTeacher(t); setShowMeetingModal(true); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '0.75rem 1.25rem', cursor: 'pointer',
                    borderTop: '1px solid var(--glass-border)', transition: 'background 0.15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0891b2, #0e7490)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.8125rem', fontWeight: 800, color: 'white', flexShrink: 0
                  }}>
                    {t.name?.charAt(0)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.name}</p>
                    <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', margin: 0 }}>{t.department || 'Academic Faculty'}</p>
                  </div>
                  <button
                    style={{
                      background: 'none', border: '1px solid var(--glass-border)',
                      padding: '4px 8px', borderRadius: 6, fontSize: '0.6875rem',
                      fontWeight: 700, color: 'var(--brand-600)', cursor: 'pointer'
                    }}
                  >
                    Meet
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Meeting Modal */}
      {showMeetingModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div style={{
            width: '100%', maxWidth: 500, background: 'var(--surface-0)',
            borderRadius: 20, padding: '2rem', boxShadow: '0 20px 60px rgba(0,0,0,0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
                  Arrange Teacher Meeting
                </h3>
                {selectedTeacher && (
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                    Scheduling sync with <strong>{selectedTeacher.name}</strong>
                  </p>
                )}
              </div>
              <button onClick={() => { setShowMeetingModal(false); setSelectedTeacher(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleScheduleMeeting} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {!selectedTeacher && (
                <div>
                  <label style={labelStyle}>Select Faculty Member</label>
                  <select
                    required
                    onChange={e => setSelectedTeacher(teachers.find(t => t.id === parseInt(e.target.value)))}
                    style={inputStyle}
                  >
                    <option value="">Choose teacher...</option>
                    {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              )}

              <div>
                <label style={labelStyle}>Meeting Title</label>
                <input
                  required placeholder="e.g. Q3 Curriculum Evaluation, Performance Sync"
                  value={meetingForm.title}
                  onChange={e => setMeetingForm({ ...meetingForm, title: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Date</label>
                  <input type="date" required value={meetingForm.date} onChange={e => setMeetingForm({ ...meetingForm, date: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Time</label>
                  <input type="time" required value={meetingForm.time} onChange={e => setMeetingForm({ ...meetingForm, time: e.target.value })} style={inputStyle} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Platform / Location</label>
                <select value={meetingForm.platform} onChange={e => setMeetingForm({ ...meetingForm, platform: e.target.value })} style={inputStyle}>
                  {['Google Meet', 'Zoom', 'Microsoft Teams', 'Campus Dean Office'].map(p => <option key={p}>{p}</option>)}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Agenda / Notes (optional)</label>
                <textarea
                  placeholder="Key discussion topics, syllabus review, student feedback..."
                  value={meetingForm.agenda}
                  onChange={e => setMeetingForm({ ...meetingForm, agenda: e.target.value })}
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="button" onClick={() => { setShowMeetingModal(false); setSelectedTeacher(null); }} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, gap: 8 }}>
                  <Send size={15} /> Send Meeting Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Shared styles
const inputStyle = {
  width: '100%', padding: '0.625rem 0.875rem', borderRadius: 10,
  border: '1px solid var(--glass-border)', background: 'var(--surface-1)',
  color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none',
  boxSizing: 'border-box'
};
const labelStyle = { fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 };

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'timetable', label: 'Master Timetable', icon: Calendar },
  { id: 'teachers', label: 'Teacher Management', icon: UserCheck },
];

export default function OrgAcademicMonitor() {
  const [activeTab, setActiveTab] = useState('timetable');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top tab bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid var(--glass-border)', paddingBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
            Academic Monitor
          </h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
            Master timetable conflict auditing &amp; faculty coordination
          </p>
        </div>

        <div style={{
          display: 'flex', background: 'var(--surface-1)', padding: 5,
          borderRadius: 14, border: '1px solid var(--glass-border)', gap: 3
        }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '0.5625rem 1.125rem', borderRadius: 11,
                border: 'none', cursor: 'pointer',
                fontWeight: 800, fontSize: '0.875rem',
                transition: 'all 0.2s', whiteSpace: 'nowrap',
                background: activeTab === t.id
                  ? 'white'
                  : 'transparent',
                color: activeTab === t.id ? 'var(--brand-600)' : 'var(--text-muted)',
                boxShadow: activeTab === t.id ? '0 4px 14px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              <t.icon size={15} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'timetable' && <TimetableTab />}
      {activeTab === 'teachers'  && <TeacherManagementTab />}
    </div>
  );
}
