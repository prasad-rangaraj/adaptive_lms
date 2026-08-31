import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tenantsAPI } from '../../services/api.service';
import { useAuthStore } from '../../store/authStore';
import { 
  Calendar, Clock, Users, FileText, Check, X, Search, Filter,
  Building2, GraduationCap, AlertCircle, AlertTriangle
} from 'lucide-react';
import Loader from '../../components/ui/Loader';

// ── Tab 1: Global Attendance ──────────────────────────────────────────────────
function AttendanceTab() {
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
            {[
              { id: 1, cohort: 'Computer Science Yr 1', teacher: 'Dr. Alan Turing', status: 'completed', time: '09:05 AM' },
              { id: 2, cohort: 'Mathematics Advanced', teacher: 'Prof. John Nash', status: 'pending', time: '-' },
              { id: 3, cohort: 'Physics Lab Group A', teacher: 'Dr. Marie Curie', status: 'completed', time: '10:15 AM' },
              { id: 4, cohort: 'Software Engineering', teacher: 'Dr. Ada Lovelace', status: 'pending', time: '-' },
            ].map(row => (
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
          {[
            { id: 1, name: 'Alex Chen', role: 'Student', type: 'Medical Leave', duration: 'Oct 12 - Oct 14', reason: 'Fever and cold.', status: 'Pending' },
            { id: 2, name: 'Dr. Marie Curie', role: 'Teacher', type: 'On-Duty (Conference)', duration: 'Oct 15 - Oct 18', reason: 'Attending Physics Summit.', status: 'Pending' }
          ].map(req => (
            <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', background: 'var(--surface-0)', border: '1px solid var(--surface-2)', borderRadius: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{req.name}</span>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: req.role === 'Teacher' ? '#10b981' : '#3b82f6', background: req.role === 'Teacher' ? '#ecfdf5' : '#eff6ff', padding: '2px 8px', borderRadius: 6 }}>{req.role}</span>
                </div>
                <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--brand-600)' }}>{req.type}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>"{req.reason}" • {req.duration}</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn" style={{ background: '#ecfdf5', color: '#10b981', padding: '8px 12px', borderRadius: 8, fontWeight: 700, border: '1px solid #a7f3d0' }}>Approve</button>
                <button className="btn" style={{ background: '#fff1f2', color: '#ef4444', padding: '8px 12px', borderRadius: 8, fontWeight: 700, border: '1px solid #fecdd3' }}>Deny</button>
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
  return (
    <div className="glass-card" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)' }}>Master Timetable</h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 4 }}>High-level view of all active classes.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" style={{ gap: 8, fontSize: '0.8125rem' }}><Filter size={14} /> Filter Cohort</button>
        </div>
      </div>
      
      <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-0)', borderRadius: 12, border: '1px dashed var(--surface-3)' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <Calendar size={32} style={{ margin: '0 auto 12px', color: 'var(--surface-4)' }} />
          <p style={{ fontSize: '0.875rem', fontWeight: 700 }}>Select a cohort or department to view schedule.</p>
        </div>
      </div>
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
