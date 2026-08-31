import { useState } from 'react';
import { 
  CheckCircle2, XCircle, Clock, Calendar, Search, Filter, UserCheck, ShieldAlert
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

// ── Tab: Attendance Operations ─────────────────────────────────────────────
function AttendanceTab() {
  const students = [
    { id: 1, name: 'Alex Chen', roll: '26CS01', status: 'present', attendance: 92 },
    { id: 2, name: 'Sarah Jenkins', roll: '26CS02', status: 'absent', attendance: 71 },
    { id: 3, name: 'Michael Chang', roll: '26CS03', status: 'on_duty', attendance: 85 },
    { id: 4, name: 'Priya Sharma', roll: '26CS04', status: 'present', attendance: 98 },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '4rem', alignItems: 'start' }}>
      
      {/* ── Left: Roster ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)' }}>Today's Roster</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Advanced Machine Learning • Aug 22, 2026</p>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input placeholder="Search Roll No..." style={{ padding: '8px 12px 8px 36px', borderRadius: 8, border: '1px solid var(--surface-3)', background: 'var(--surface-0)', fontSize: '0.875rem' }} />
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

          {students.map(student => (
            <div key={student.id} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 200px', gap: '1rem', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid var(--surface-2)' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.875rem' }}>
                  {student.name.charAt(0)}
                </div>
                <div>
                  <h4 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-primary)' }}>{student.name}</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{student.roll}</p>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.9375rem', fontWeight: 800, color: student.attendance < 75 ? '#ef4444' : 'var(--text-primary)' }}>{student.attendance}%</span>
              </div>

              <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                <button style={{ flex: 1, padding: '6px 0', border: 'none', borderRadius: 6, fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', background: student.status === 'present' ? '#10b981' : 'var(--surface-2)', color: student.status === 'present' ? 'white' : 'var(--text-muted)' }}>P</button>
                <button style={{ flex: 1, padding: '6px 0', border: 'none', borderRadius: 6, fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', background: student.status === 'absent' ? '#ef4444' : 'var(--surface-2)', color: student.status === 'absent' ? 'white' : 'var(--text-muted)' }}>A</button>
                <button style={{ flex: 1, padding: '6px 0', border: 'none', borderRadius: 6, fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', background: student.status === 'on_duty' ? 'var(--brand-500)' : 'var(--surface-2)', color: student.status === 'on_duty' ? 'white' : 'var(--text-muted)' }}>OD</button>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* ── Right: Operations ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        <div style={{ background: 'var(--surface-0)', border: '1px solid var(--surface-3)', borderRadius: 20, padding: '1.5rem', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Auto-Capture</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Use the live session's AI or classroom beacons to automatically log attendance.</p>
          <button style={{ width: '100%', background: 'var(--text-primary)', color: 'white', border: 'none', padding: '12px', borderRadius: 12, fontSize: '0.9375rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <UserCheck size={18} /> Run Auto-Capture
          </button>
        </div>

        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 20, padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
            <ShieldAlert size={18} color="#ef4444" />
            <h3 style={{ fontSize: '1rem', fontWeight: 900, color: '#991b1b' }}>Defaulters List</h3>
          </div>
          <p style={{ fontSize: '0.8125rem', color: '#b91c1c', marginBottom: '1.25rem', lineHeight: 1.5 }}>
            3 students in this batch have dropped below the 75% mandatory attendance threshold.
          </p>
          <button style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 8, fontSize: '0.8125rem', fontWeight: 800, cursor: 'pointer' }}>Generate Warning Letters</button>
        </div>

      </div>

    </div>
  );
}

// ── Tab: Approvals ───────────────────────────────────────────────────────
function ApprovalsTab() {
  const requests = [
    { id: 1, student: 'Sarah Jenkins', type: 'On-Duty (Hackathon)', dates: 'Aug 24 - Aug 25', reason: 'Representing the university at TechCrunch Disrupt', docs: 1, status: 'pending' },
    { id: 2, student: 'Michael Chang', type: 'Medical Leave', dates: 'Aug 20 - Aug 22', reason: 'Viral Fever', docs: 1, status: 'pending' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Pending Approvals</h2>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Review leave and On-Duty requests from your mentees and class representatives.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {requests.map(req => (
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
              <button style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '8px 12px', borderRadius: 8, fontSize: '0.8125rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <XCircle size={14} /> Reject
              </button>
              <button style={{ background: '#10b981', border: 'none', color: 'white', padding: '8px 12px', borderRadius: 8, fontSize: '0.8125rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={14} /> Approve
              </button>
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
          {activeTab === 'attendance' && <AttendanceTab />}
          {activeTab === 'approvals' && <ApprovalsTab />}
        </div>

      </div>
    </div>
  );
}
