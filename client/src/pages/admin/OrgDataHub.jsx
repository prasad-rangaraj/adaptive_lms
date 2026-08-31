import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import {
  Search, Command, Bell, Sparkles, ArrowRight, Table2, 
  Download, Filter, Key, Database, RefreshCw, FileSpreadsheet, Lock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DUMMY_REPORTS = [
  { id: 1, name: 'Q3 Financial Billing', type: 'CSV Export', frequency: 'Monthly', status: 'Ready', size: '1.2 MB', date: 'Oct 10, 2026' },
  { id: 2, name: 'Compliance & Audit Log', type: 'PDF Summary', frequency: 'Weekly', status: 'Processing', size: '--', date: 'Oct 12, 2026' },
  { id: 3, name: 'Active Cohorts Engagement', type: 'CSV Export', frequency: 'Daily', status: 'Ready', size: '4.5 MB', date: 'Oct 15, 2026' },
  { id: 4, name: 'Inactive Users Report', type: 'CSV Export', frequency: 'Monthly', status: 'Ready', size: '0.8 MB', date: 'Oct 1, 2026' },
];

export default function OrgDataHub() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: 1400, margin: '0 auto' }}>
      
      {/* ── 1. The Decision Intelligence Header (Command Palette Style) ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Command size={18} color="var(--text-muted)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Search reports or type a command (Cmd+K)..." 
            style={{ 
              width: '100%', padding: '0.875rem 1rem 0.875rem 3rem', 
              borderRadius: 16, border: '1px solid var(--glass-border)', background: 'var(--surface-0)',
              fontSize: '0.9375rem', color: 'var(--text-primary)', outline: 'none',
              boxShadow: '0 2px 10px rgba(0,0,0,0.02)', transition: 'all 0.2s'
            }}
            onFocus={e => { e.target.style.borderColor = 'var(--brand-400)'; e.target.style.boxShadow = '0 0 0 4px var(--brand-50)'; }}
            onBlur={e => { e.target.style.borderColor = 'var(--glass-border)'; e.target.style.boxShadow = '0 2px 10px rgba(0,0,0,0.02)'; }}
          />
          <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', background: 'var(--surface-2)', padding: '2px 6px', borderRadius: 6, border: '1px solid var(--glass-border)' }}>
            ⌘K
          </span>
        </div>
        
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-ghost btn-icon"><Bell size={18} /></button>
          <button className="btn btn-primary" style={{ gap: 8 }}>
            <Database size={16} /> New Export
          </button>
        </div>
      </div>

      {/* ── 2. AI Insight Banner ── */}
      <div style={{ 
        background: 'linear-gradient(135deg, var(--surface-0), var(--brand-50))', 
        borderRadius: 24, padding: '2.5rem', border: '1px solid var(--brand-100)',
        boxShadow: '0 12px 30px rgba(0,0,0,0.03)', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', right: -40, top: -60, opacity: 0.05, transform: 'scale(1.5)', pointerEvents: 'none' }}>
          <Sparkles size={300} color="var(--brand-600)" />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem', position: 'relative', zIndex: 1, maxWidth: 900 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, var(--brand-500), var(--brand-700))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 16px var(--brand-500)40' }}>
            <Sparkles size={22} color="white" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.4, letterSpacing: '-0.02em' }}>
              Your data infrastructure is healthy. The <strong style={{ color: 'var(--brand-700)', fontWeight: 800 }}>Q3 Financial Billing</strong> report finished generating 12 minutes ago and is ready for download.
            </h2>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button className="btn btn-secondary btn-sm" style={{ gap: 6, fontSize: '0.8125rem', background: 'white' }}>
                Download Q3 Report <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Table-First Data Canvas (1fr 340px) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'flex-start' }}>
        
        {/* Main Canvas: Reports Table */}
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-0)' }}>
            <div>
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Table2 size={18} color="var(--brand-500)" /> Data Exports & Reports
              </h3>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
               <button className="btn btn-secondary btn-sm" style={{ gap: 6 }}><Filter size={14} /> Filter</button>
               <button className="btn btn-secondary btn-sm" style={{ gap: 6 }}><RefreshCw size={14} /> Sync</button>
            </div>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--surface-1)' }}>
                  <th style={{ padding: '1rem 1.5rem' }}>Report Name</th>
                  <th>Frequency</th>
                  <th>Size</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {DUMMY_REPORTS.map((r, i) => {
                  const isProcessing = r.status === 'Processing';
                  return (
                    <tr key={r.id} style={{ borderBottom: i < DUMMY_REPORTS.length - 1 ? '1px solid var(--glass-border)' : 'none', transition: 'background 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-1)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FileSpreadsheet size={16} color="var(--brand-500)" />
                          </div>
                          <div>
                            <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>{r.name}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{r.type} • {r.date}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{r.frequency}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>{r.size}</span>
                      </td>
                      <td>
                        <span style={{ 
                          display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', 
                          borderRadius: 999, fontSize: '0.75rem', fontWeight: 700,
                          background: isProcessing ? '#fff7ed' : '#ecfdf5',
                          color: isProcessing ? '#d97706' : '#059669',
                          border: `1px solid ${isProcessing ? '#fed7aa' : '#bbf7d0'}`
                        }}>
                          {r.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', paddingRight: '1.5rem' }}>
                         <button className="btn btn-secondary btn-sm" disabled={isProcessing} style={{ padding: '6px 12px', fontSize: '0.75rem', opacity: isProcessing ? 0.5 : 1 }}>
                           <Download size={14} /> Download
                         </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Side Canvas: API Keys */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Developer API Keys
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              Connect your BI tools (Tableau, PowerBI) directly to our GraphQL endpoint for real-time querying.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1rem', background: 'var(--surface-1)', border: '1px solid var(--glass-border)', borderRadius: 12 }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                   <Key size={16} color="var(--brand-600)" />
                   <div>
                     <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>Production Key</p>
                     <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Created Oct 1</p>
                   </div>
                 </div>
                 <button style={{ background: 'transparent', border: 'none', color: 'var(--brand-600)', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}>Revoke</button>
              </div>
            </div>
            <button className="btn btn-secondary" style={{ width: '100%', marginTop: '1rem', fontSize: '0.8125rem', gap: 6 }}>
              <Lock size={14} /> Generate New Key
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
