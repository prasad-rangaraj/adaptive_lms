import { useState } from 'react';
import { Award, Search, Plus, MoreHorizontal, FileCheck, Check, Settings, ShieldCheck, Download } from 'lucide-react';

const DUMMY_CERTS = [
  { id: 1, name: 'Foundation of AI Certificate', type: 'Course Completion', issued: 432, status: 'active' },
  { id: 2, name: 'Advanced Machine Learning', type: 'Specialization', issued: 128, status: 'active' },
  { id: 3, name: 'Enterprise Onboarding Badge', type: 'Internal', issued: 856, status: 'archived' },
];

export default function OrgCertificatesPage() {
  const [search, setSearch] = useState('');
  
  return (
    <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'flex-start' }}>
      {/* ── Left: Certificates Canvas ── */}
      <div style={{ flex: 1, background: 'var(--surface-1)', borderRadius: 24, border: '1px solid var(--glass-border)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
        
        {/* Header */}
        <div style={{ padding: '2rem 2.5rem 1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Certificates & Badging</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginTop: 4 }}>Design, issue, and verify official credentials for your learners.</p>
            </div>
            <button className="btn btn-primary" style={{ gap: 8, height: 44, padding: '0 1.25rem', borderRadius: 12 }}>
              <Plus size={16} /> New Template
            </button>
          </div>

          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search certificates..."
                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: 12, border: '1px solid var(--surface-3)', background: 'var(--surface-1)', fontSize: '0.9375rem', outline: 'none', color: 'var(--text-primary)' }}
              />
            </div>
          </div>
        </div>

        {/* List */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {DUMMY_CERTS.map((c, i) => (
            <div key={c.id} style={{ display: 'grid', gridTemplateColumns: '2.5fr 1.5fr 1.5fr auto', gap: '1.5rem', alignItems: 'center', padding: '1.5rem 2.5rem', borderBottom: i === DUMMY_CERTS.length -1 ? 'none' : '1px solid var(--surface-2)' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                  <Award size={20} />
                </div>
                <div>
                  <p style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1rem' }}>{c.name}</p>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 4 }}>{c.type}</p>
                </div>
              </div>

              <div>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Issued</p>
                <p style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', marginTop: 4 }}>{c.issued}</p>
              </div>

              <span style={{ display: 'inline-flex', padding: '4px 10px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 800, background: c.status === 'active' ? '#ecfdf5' : '#f3f4f6', color: c.status === 'active' ? '#10b981' : '#6b7280', border: `1px solid ${c.status === 'active' ? '#bbf7d0' : '#e5e7eb'}` }}>
                {c.status.toUpperCase()}
              </span>

              <button className="btn btn-ghost btn-icon"><MoreHorizontal size={18} /></button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right: Insights Panel ── */}
      <div style={{ width: 340, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ background: 'var(--surface-1)', borderRadius: 24, padding: '2rem', border: '1px solid var(--glass-border)' }}>
          <h3 style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.5rem' }}>
            <ShieldCheck size={14} color="#10b981" /> Verification Engine
          </h3>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
            All certificates issued via this platform include a cryptographic signature and a public validation URL for LinkedIn sharing.
          </p>
          <button className="btn btn-secondary" style={{ width: '100%', gap: 8 }}>
            <FileCheck size={16} /> Configure Verification
          </button>
        </div>
      </div>
    </div>
  );
}
