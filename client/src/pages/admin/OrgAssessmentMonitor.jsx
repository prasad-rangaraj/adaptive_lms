import { useState } from 'react';
import { 
  FileText, AlertTriangle, ShieldAlert, CheckCircle2, 
  Search, Filter, Eye, BellRing, UserX, UserCheck
} from 'lucide-react';
import Loader from '../../components/ui/Loader';

// ── Tab 1: Live Exam Operations ───────────────────────────────────────────────
function LiveExamsTab() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'flex-start' }}>
      <div className="glass-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)' }}>Ongoing Assessments</h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 4 }}>System-wide monitor for exams currently in progress.</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input placeholder="Search course or exam..." style={{ padding: '0.5rem 1rem 0.5rem 2.25rem', borderRadius: 8, border: '1px solid var(--surface-3)', background: 'var(--surface-1)', outline: 'none', color: 'var(--text-primary)', fontSize: '0.875rem' }} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            { id: 1, title: 'Midterm - Advanced Machine Learning', students: 145, active: 142, flagged: 3, teacher: 'Dr. Alan Turing' },
            { id: 2, title: 'Quiz 3 - Data Structures', students: 200, active: 198, flagged: 0, teacher: 'Dr. Ada Lovelace' },
          ].map(exam => (
            <div key={exam.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', background: 'var(--surface-0)', border: '1px solid var(--surface-2)', borderRadius: 12 }}>
              <div style={{ flex: 2 }}>
                <p style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1rem' }}>{exam.title}</p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 4 }}>Proctored by {exam.teacher}</p>
              </div>
              
              <div style={{ flex: 1, textAlign: 'center' }}>
                <p style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Participation</p>
                <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>{exam.active} / {exam.students}</p>
              </div>

              <div style={{ flex: 1, textAlign: 'center' }}>
                <p style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Proctor Alerts</p>
                {exam.flagged > 0 ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.8125rem', fontWeight: 800, color: '#ef4444' }}>
                    <ShieldAlert size={14} /> {exam.flagged} Flagged
                  </span>
                ) : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.8125rem', fontWeight: 800, color: '#10b981' }}>
                    <CheckCircle2 size={14} /> Clear
                  </span>
                )}
              </div>

              <div>
                <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem', fontWeight: 700 }}>Monitor Feed</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 6 }}>
            <BellRing size={14} color="#f59e0b" /> Active Escalations
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
            There are 3 unresolved severe proctoring alerts across all active sessions. 
          </p>
          <button className="btn" style={{ width: '100%', background: '#fffbeb', border: '1px solid #fde68a', color: '#d97706', fontWeight: 700, fontSize: '0.8125rem' }}>
            Review Escalations
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Tab 2: Grading Audits ─────────────────────────────────────────────────────
function GradingAuditTab() {
  return (
    <div className="glass-card" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)' }}>System Grading Audit</h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 4 }}>Review automated grading metrics and flag severe curve deviations.</p>
        </div>
        <button className="btn btn-secondary" style={{ gap: 8, fontSize: '0.8125rem' }}><Filter size={14} /> Filter Dept</button>
      </div>
      
      <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-0)', borderRadius: 12, border: '1px dashed var(--surface-3)' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <FileText size={32} style={{ margin: '0 auto 12px', color: 'var(--surface-4)' }} />
          <p style={{ fontSize: '0.875rem', fontWeight: 700 }}>Select a department to run grading audit.</p>
        </div>
      </div>
    </div>
  );
}

export default function OrgAssessmentMonitor() {
  const [activeTab, setActiveTab] = useState('live');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'flex-end', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1.5rem' }}>
        <div className="hide-scrollbar" style={{ display: 'flex', background: 'var(--surface-1)', padding: 6, borderRadius: 16, border: '1px solid var(--glass-border)', gap: 4, overflowX: 'auto', flexWrap: 'nowrap' }}>
          {[
            { id: 'live', label: 'Live Operations', icon: AlertTriangle },
            { id: 'audit', label: 'Grading Audits', icon: FileText },
          ].map(t => (
            <button 
              key={t.id} onClick={() => setActiveTab(t.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.625rem 1.25rem', borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '0.875rem', transition: 'all 0.2s', whiteSpace: 'nowrap', background: activeTab === t.id ? 'white' : 'transparent', color: activeTab === t.id ? 'var(--brand-600)' : 'var(--text-muted)', boxShadow: activeTab === t.id ? '0 4px 12px rgba(0,0,0,0.08)' : 'none' }}>
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'live' && <LiveExamsTab />}
      {activeTab === 'audit' && <GradingAuditTab />}
    </div>
  );
}
