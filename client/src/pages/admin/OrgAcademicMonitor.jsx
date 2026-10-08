import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tenantsAPI, academicAPI } from '../../services/api.service';
import { useAuthStore } from '../../store/authStore';
import { 
  Calendar, Clock, Users, FileText, Check, X, Search, Filter,
  Building2, GraduationCap, AlertCircle, AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';
import Loader from '../../components/ui/Loader';

// ── Tab 1: Global Attendance ──────────────────────────────────────────────────
function AttendanceTab() {
  const { data: attendance = [] } = useQuery({
    queryKey: ['adminAttendance'],
    queryFn: () => academicAPI.getAdminAttendance().then(res => res.data)
  });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'flex-start' }}>
      <div className="glass-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)' }}>Daily Attendance Registry</h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 4 }}>System-wide attendance completion for today.</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input placeholder="Search cohort or teacher..." style={{ padding: '0.5rem 1rem 0.5rem 2.25rem', borderRadius: 8, border: '1px solid var(--surface-3)', background: 'var(--surface-1)', outline: 'none', color: 'var(--text-primary)', fontSize: '0.875rem' }} />
            </div>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--surface-2)' }}>
              <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Cohort</th>
              <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Assigned Teacher</th>
              <th style={{ textAlign: 'center', padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</th>
              <th style={{ textAlign: 'right', padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {attendance.map(row => (
              <tr key={row.id} style={{ borderBottom: '1px solid var(--surface-1)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-1)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>{row.cohort}</td>
                <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{row.teacher}</td>
                <td style={{ padding: '1rem', textAlign: 'center' }}>
                  {row.status === 'completed' ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', fontWeight: 800, color: '#10b981', background: '#ecfdf5', padding: '4px 8px', borderRadius: 6 }}>
                      <Check size={12} /> Logged {row.time}
                    </span>
                  ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', fontWeight: 800, color: '#f59e0b', background: '#fffbeb', padding: '4px 8px', borderRadius: 6 }}>
                      <AlertTriangle size={12} /> Pending
                    </span>
                  )}
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <button className="btn btn-ghost btn-sm" style={{ fontWeight: 700 }}>Ping Teacher</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1rem' }}>Global Health</h3>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--brand-600)', lineHeight: 1 }}>92%</span>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Attendance Rate</span>
          </div>
          <div style={{ height: 8, borderRadius: 999, background: 'var(--surface-2)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '92%', background: 'var(--brand-500)', borderRadius: 999 }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tab 2: Leave & OD Approvals ───────────────────────────────────────────────
function LeaveTab() {
  const { data: requests = [] } = useQuery({
    queryKey: ['adminLeaveRequests'],
    queryFn: () => academicAPI.getAdminLeaveRequests().then(res => res.data)
  });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'flex-start' }}>
      <div className="glass-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)' }}>Pending Approvals</h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 4 }}>System-wide leave and On-Duty requests awaiting review.</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {requests.map(req => (
            <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', background: 'var(--surface-0)', border: '1px solid var(--surface-2)', borderRadius: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{req.name}</span>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: req.role === 'Teacher' ? '#10b981' : '#3b82f6', background: req.role === 'Teacher' ? '#ecfdf5' : '#eff6ff', padding: '2px 8px', borderRadius: 6 }}>{req.role}</span>
                </div>
                <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--brand-600)' }}>{req.type}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>"{req.reason}" • {req.duration}</p>
                <p style={{ fontSize: '0.75rem', fontWeight: 800, color: req.status === 'Pending' ? '#f59e0b' : '#10b981', marginTop: 4 }}>{req.status}</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button 
                  onClick={async () => {
                     await academicAPI.updateLeaveRequest(req.id, { status: 'Approved' });
                  }}
                  className="btn" style={{ background: '#ecfdf5', color: '#10b981', padding: '8px 12px', borderRadius: 8, fontWeight: 700, border: '1px solid #a7f3d0' }}>Approve Override</button>
                <button 
                  onClick={async () => {
                     await academicAPI.updateLeaveRequest(req.id, { status: 'Rejected' });
                  }}
                  className="btn" style={{ background: '#fff1f2', color: '#ef4444', padding: '8px 12px', borderRadius: 8, fontWeight: 700, border: '1px solid #fecdd3' }}>Deny Override</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1rem' }}>Global Overrides</h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
            As an Org Admin, your approval overrides any teacher-level denials. Use this power carefully.
          </p>
          <button className="btn btn-secondary" style={{ width: '100%', fontSize: '0.8125rem', fontWeight: 700 }}>View Override History</button>
        </div>
      </div>
    </div>
  );
}

// ── Tab 3: Master Timetable ───────────────────────────────────────────────────
function TimetableTab() {
  const [showAdd, setShowAdd] = useState(false);
  const [filterDept, setFilterDept] = useState('');
  const [filterCohort, setFilterCohort] = useState('');
  
  const [deptId, setDeptId] = useState('');
  const [cohortId, setCohortId] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    faculty_id: '',
    day_of_week: 'Monday',
    start_time: '09:00',
    end_time: '10:00',
    venue: 'Room 101'
  });

  const { data: depts = [] } = useQuery({
    queryKey: ['depts'],
    queryFn: () => academicAPI.getDepartments().then(r => r.data)
  });

  const { data: filterCohorts = [] } = useQuery({
    queryKey: ['cohorts', filterDept],
    queryFn: () => academicAPI.getCohorts(filterDept).then(r => r.data),
    enabled: !!filterDept
  });

  const { data: cohorts = [] } = useQuery({
    queryKey: ['cohorts', deptId],
    queryFn: () => academicAPI.getCohorts(deptId).then(r => r.data),
    enabled: !!deptId
  });

  const { data: teachers = [] } = useQuery({
    queryKey: ['allTeachers'],
    queryFn: () => academicAPI.getTeachers().then(r => r.data)
  });

  const { data: timetable = {}, refetch: refetchTimetable } = useQuery({
    queryKey: ['masterTimetable'],
    queryFn: () => academicAPI.getTimetable().then(r => r.data)
  });

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await academicAPI.createTimetable({
        ...formData,
        faculty_id: formData.faculty_id ? parseInt(formData.faculty_id) : null,
        department_id: parseInt(deptId),
        cohort_id: cohortId ? parseInt(cohortId) : null,
      });
      toast.success('Event scheduled successfully!');
      setShowAdd(false);
      refetchTimetable();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to schedule event due to conflict');
    }
  };

  // Filter timetable
  const filteredTimetable = {};
  for (const day of ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']) {
    filteredTimetable[day] = (timetable[day] || []).filter(evt => {
      if (filterDept && evt.department_id !== parseInt(filterDept)) return false;
      if (filterCohort && evt.cohort_id !== parseInt(filterCohort)) return false;
      return true;
    });
  }

  return (
    <div className="glass-card" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)' }}>Master Timetable</h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 4 }}>High-level view of all active classes.</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {!showAdd && (
            <>
              <select value={filterDept} onChange={e => { setFilterDept(e.target.value); setFilterCohort(''); }} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--surface-3)', fontSize: '0.8125rem' }}>
                <option value="">All Departments</option>
                {depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              {filterDept && (
                <select value={filterCohort} onChange={e => setFilterCohort(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--surface-3)', fontSize: '0.8125rem' }}>
                  <option value="">All Cohorts</option>
                  {filterCohorts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              )}
            </>
          )}
          <button className="btn btn-primary" onClick={() => setShowAdd(true)} style={{ gap: 8, fontSize: '0.8125rem' }}>+ Add Event</button>
        </div>
      </div>
      
      {showAdd ? (
        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 400, margin: '0 auto', background: 'var(--surface-0)', padding: 24, borderRadius: 12 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Schedule New Event</h3>
          
          <select value={deptId} onChange={e => setDeptId(e.target.value)} required style={{ padding: 10, borderRadius: 8, border: '1px solid var(--surface-3)' }}>
            <option value="">Select Department</option>
            {depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>

          <select value={cohortId} onChange={e => setCohortId(e.target.value)} style={{ padding: 10, borderRadius: 8, border: '1px solid var(--surface-3)' }}>
            <option value="">Select Cohort (Optional)</option>
            {cohorts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          <select value={formData.faculty_id} onChange={e => setFormData({...formData, faculty_id: e.target.value})} required style={{ padding: 10, borderRadius: 8, border: '1px solid var(--surface-3)' }}>
            <option value="">Select Teacher</option>
            {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>

          <input placeholder="Event Title (e.g. CS101 Lecture)" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={{ padding: 10, borderRadius: 8, border: '1px solid var(--surface-3)' }} />
          
          <select value={formData.day_of_week} onChange={e => setFormData({...formData, day_of_week: e.target.value})} style={{ padding: 10, borderRadius: 8, border: '1px solid var(--surface-3)' }}>
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(d => <option key={d}>{d}</option>)}
          </select>

          <div style={{ display: 'flex', gap: 10 }}>
            <input type="time" required value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid var(--surface-3)' }} />
            <input type="time" required value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})} style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid var(--surface-3)' }} />
          </div>

          <input placeholder="Venue (e.g. Room 101)" required value={formData.venue} onChange={e => setFormData({...formData, venue: e.target.value})} style={{ padding: 10, borderRadius: 8, border: '1px solid var(--surface-3)' }} />

          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            <button type="button" onClick={() => setShowAdd(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Event</button>
          </div>
        </form>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
            <div key={day} style={{ background: 'var(--surface-0)', borderRadius: 16, padding: '1.5rem', border: '1px solid var(--surface-3)' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, marginBottom: '1rem' }}>{day}</h3>
              {!filteredTimetable[day] || filteredTimetable[day].length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No classes scheduled.</p>
              ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {filteredTimetable[day].map(evt => (
                    <div key={evt.id} style={{ padding: '1rem', background: 'var(--surface-1)', borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '1rem' }}>{evt.subject}</div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{evt.faculty} • {evt.venue}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, color: 'var(--brand-600)' }}>{evt.time}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{evt.duration}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrgAcademicMonitor() {
  const [activeTab, setActiveTab] = useState('attendance');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'flex-end', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1.5rem' }}>
        <div className="hide-scrollbar" style={{ display: 'flex', background: 'var(--surface-1)', padding: 6, borderRadius: 16, border: '1px solid var(--glass-border)', gap: 4, overflowX: 'auto', flexWrap: 'nowrap' }}>
          {[
            { id: 'attendance', label: 'Global Attendance', icon: Users },
            { id: 'leave', label: 'Leave & OD', icon: FileText },
            { id: 'timetable', label: 'Master Timetable', icon: Calendar },
          ].map(t => (
            <button 
              key={t.id} onClick={() => setActiveTab(t.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.625rem 1.25rem', borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '0.875rem', transition: 'all 0.2s', whiteSpace: 'nowrap', background: activeTab === t.id ? 'white' : 'transparent', color: activeTab === t.id ? 'var(--brand-600)' : 'var(--text-muted)', boxShadow: activeTab === t.id ? '0 4px 12px rgba(0,0,0,0.08)' : 'none' }}>
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'attendance' && <AttendanceTab />}
      {activeTab === 'leave' && <LeaveTab />}
      {activeTab === 'timetable' && <TimetableTab />}
    </div>
  );
}
