import { useState } from 'react';
import { Send, Search, Users, Mail, BellRing, History, Check, Calendar, Activity } from 'lucide-react';

export default function OrgBroadcastsPage() {
  const [search, setSearch] = useState('');
  
  return (
    <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'flex-start' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Composer Canvas */}
        <div style={{ background: 'var(--surface-1)', borderRadius: 24, border: '1px solid var(--glass-border)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
          <div style={{ padding: '2rem 2.5rem 1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>New Broadcast</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginTop: 4 }}>Send announcements via email or in-app push notifications.</p>
          </div>
          <div style={{ padding: '2rem 2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label className="label">Target Audience</label>
              <select className="input" style={{ padding: '0.75rem 1rem', fontSize: '0.9375rem' }}>
                <option>All Members (1,250 users)</option>
                <option>All Students (1,200 users)</option>
                <option>All Teachers (50 users)</option>
                <option>Specific Cohort...</option>
              </select>
            </div>
            <div>
              <label className="label">Subject / Title</label>
              <input className="input" placeholder="e.g. Scheduled Maintenance Notice" style={{ padding: '0.75rem 1rem', fontSize: '0.9375rem' }} />
            </div>
            <div>
              <label className="label">Message Content</label>
              <textarea className="input" rows={6} placeholder="Write your message here..." style={{ padding: '1rem', fontSize: '0.9375rem', resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
              <div style={{ display: 'flex', gap: 16 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked />
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 600 }}>Send via Email</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked />
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 600 }}>In-App Push</span>
                </label>
              </div>
              <button className="btn btn-primary" style={{ height: 44, padding: '0 1.5rem', borderRadius: 12, gap: 8 }}>
                <Send size={16} /> Send Broadcast
              </button>
            </div>
          </div>
        </div>

        {/* History */}
        <div style={{ background: 'var(--surface-1)', borderRadius: 24, border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem 2.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)' }}>Recent Broadcasts</h3>
            <button className="btn btn-ghost btn-sm" style={{ fontWeight: 600 }}>View All</button>
          </div>
          <div>
            {[
              { title: 'Welcome to the Fall Semester!', target: 'All Students', date: 'Oct 1, 2026', opens: '68%' },
              { title: 'Platform update scheduled', target: 'All Members', date: 'Sep 15, 2026', opens: '42%' },
            ].map((msg, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem 2.5rem', borderBottom: i === 0 ? '1px solid var(--surface-2)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--brand-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Mail size={20} color="var(--brand-600)" />
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>{msg.title}</p>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 4 }}>To: {msg.target} • {msg.date}</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Open Rate</p>
                  <p style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--brand-600)', marginTop: 2 }}>{msg.opens}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ width: 340, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ background: 'var(--surface-1)', borderRadius: 24, padding: '2rem', border: '1px solid var(--glass-border)' }}>
          <h3 style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.5rem' }}>
            <Activity size={14} color="var(--brand-500)" /> Delivery Stats
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Sent this month</span>
              <span style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--text-primary)' }}>12</span>
            </div>
            <div style={{ height: 1, background: 'var(--surface-2)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Average Open Rate</span>
              <span style={{ fontSize: '1.125rem', fontWeight: 900, color: '#10b981' }}>56%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
