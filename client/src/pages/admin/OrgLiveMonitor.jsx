import { useState } from 'react';
import { 
  Video, Users, Search, Filter, ShieldCheck, Eye, EyeOff, Radio
} from 'lucide-react';
import Loader from '../../components/ui/Loader';

function ActiveRoomsTab() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'flex-start' }}>
      <div className="glass-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)' }}>Live Operations Control Room</h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 4 }}>System-wide monitor for all active virtual classrooms.</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input placeholder="Search session..." style={{ padding: '0.5rem 1rem 0.5rem 2.25rem', borderRadius: 8, border: '1px solid var(--surface-3)', background: 'var(--surface-1)', outline: 'none', color: 'var(--text-primary)', fontSize: '0.875rem' }} />
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {[
            { id: 1, title: 'Introduction to Algorithms', teacher: 'Dr. Alan Turing', participants: 42, max: 50, duration: '45m' },
            { id: 2, title: 'Linear Algebra Recitation', teacher: 'Prof. John Nash', participants: 18, max: 20, duration: '1h 10m' },
            { id: 3, title: 'Quantum Physics Lab', teacher: 'Dr. Marie Curie', participants: 12, max: 15, duration: '20m' },
          ].map(room => (
            <div key={room.id} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.25rem', background: 'var(--surface-0)', border: '1px solid var(--surface-2)', borderRadius: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1rem', marginBottom: 4 }}>{room.title}</p>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Host: {room.teacher}</p>
                </div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.6875rem', fontWeight: 800, color: '#ef4444', background: '#fff1f2', padding: '2px 8px', borderRadius: 999, border: '1px solid #fecdd3' }}>
                  <Radio size={10} /> LIVE
                </span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--surface-2)', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: '0.8125rem', fontWeight: 700 }}><Users size={14} /> {room.participants}/{room.max}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: '0.8125rem', fontWeight: 700 }}>Uptime: {room.duration}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-secondary" style={{ flex: 1, padding: '8px', fontSize: '0.75rem', fontWeight: 700, gap: 6, justifyContent: 'center' }}>
                   Join as Admin
                </button>
                <button className="btn btn-primary" style={{ flex: 1, padding: '8px', fontSize: '0.75rem', fontWeight: 700, gap: 6, justifyContent: 'center', background: '#3b82f6', border: 'none' }}>
                  <EyeOff size={14} /> Shadow
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 6 }}>
            <ShieldCheck size={14} color="#10b981" /> System Bandwidth
          </h3>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>24</span>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Active Rooms</span>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Total concurrent users system-wide: <strong>1,402</strong>. All streaming infrastructure is operating normally.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function OrgLiveMonitor() {
  const [activeTab, setActiveTab] = useState('rooms');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'flex-end', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1.5rem' }}>
        <div className="hide-scrollbar" style={{ display: 'flex', background: 'var(--surface-1)', padding: 6, borderRadius: 16, border: '1px solid var(--glass-border)', gap: 4, overflowX: 'auto', flexWrap: 'nowrap' }}>
          {[
            { id: 'rooms', label: 'Active Rooms', icon: Video },
          ].map(t => (
            <button 
              key={t.id} onClick={() => setActiveTab(t.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.625rem 1.25rem', borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '0.875rem', transition: 'all 0.2s', whiteSpace: 'nowrap', background: activeTab === t.id ? 'white' : 'transparent', color: activeTab === t.id ? 'var(--brand-600)' : 'var(--text-muted)', boxShadow: activeTab === t.id ? '0 4px 12px rgba(0,0,0,0.08)' : 'none' }}>
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'rooms' && <ActiveRoomsTab />}
    </div>
  );
}
