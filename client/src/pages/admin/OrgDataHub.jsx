import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useQuery } from '@tanstack/react-query';
import { tenantsAPI } from '../../services/api.service';
import {
  Search, Command, Bell, Sparkles, ArrowRight, Table2, 
  Download, Filter, Key, Database, RefreshCw, FileSpreadsheet, Lock, X, Check, Copy
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Loader from '../../components/ui/Loader';

export default function OrgDataHub() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const tenantId = user?.tenant_id;

  const [searchQuery, setSearchQuery] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportType, setExportType] = useState('students');
  const [exportFormat, setExportFormat] = useState('csv');
  const [isExporting, setIsExporting] = useState(false);

  const [apiKeys, setApiKeys] = useState([
    { id: 1, name: 'Production Key', key: 'lumina_live_948f21a8bc43', created: 'Oct 1, 2026' }
  ]);

  const { data: reports = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['orgReports', tenantId],
    queryFn: () => tenantsAPI.getReports(tenantId).then(res => res.data),
    enabled: !!tenantId,
  });

  const handleDownloadCSV = (report) => {
    let csvContent = "";
    if (report.name.includes("Billing") || report.name.includes("Financial")) {
      csvContent = "Invoice_ID,Date,Student_Name,Course,Amount,Payment_Status\n" +
        "INV-9021,2026-10-01,Alex Mercer,Fullstack Modern React,$240,Paid\n" +
        "INV-9022,2026-10-02,Sarah Jenkins,AI & Neural Systems,$350,Paid\n" +
        "INV-9023,2026-10-05,David Kumar,Database Engineering,$180,Paid\n" +
        "INV-9024,2026-10-10,Elena Rostova,Cloud Native Microservices,$290,Paid\n";
    } else if (report.name.includes("Cohort") || report.name.includes("Engagement")) {
      csvContent = "Cohort,Department,Enrolled_Students,Avg_Attendance_Rate,Completion_Pct\n" +
        "CS-2026-A,Computer Science,45,94%,82%\n" +
        "CS-2026-B,Computer Science,42,89%,78%\n" +
        "EE-2026-A,Electrical Eng,38,91%,85%\n" +
        "DS-2026-Alpha,Data Science,50,96%,90%\n";
    } else if (report.name.includes("Inactive")) {
      csvContent = "User_ID,Full_Name,Role,Last_Active_Date,Status\n" +
        "USR-109,James Wilson,student,2026-08-15,Suspended\n" +
        "USR-142,Maria Garcia,student,2026-08-20,Inactive\n" +
        "USR-188,Robert Chen,student,2026-09-01,Inactive\n";
    } else {
      csvContent = "ID,Event,Actor,Timestamp,Status\n" +
        "LOG-1,Tenant Policy Modified,Admin,2026-10-12T10:00:00Z,Success\n" +
        "LOG-2,User Onboarded,Admin,2026-10-12T11:20:00Z,Success\n" +
        "LOG-3,AI Guardrails Updated,Admin,2026-10-15T09:15:00Z,Success\n";
    }

    const filename = `${report.name.replace(/\s+/g, '_')}.csv`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Downloaded ${filename}`);
  };

  const handleGenerateExport = (e) => {
    e.preventDefault();
    setIsExporting(true);
    setTimeout(() => {
      let content = "";
      let filename = "";
      if (exportType === 'students') {
        filename = "Students_Directory_Export.csv";
        content = "Student_ID,Full_Name,Email,Department,Status\n" +
          "STD-101,Alex Mercer,alex@lumina.edu,Computer Science,Active\n" +
          "STD-102,Sarah Jenkins,sarah@lumina.edu,Data Science,Active\n" +
          "STD-103,David Kumar,david@lumina.edu,Electrical Eng,Active\n";
      } else if (exportType === 'courses') {
        filename = "Course_Catalog_Export.csv";
        content = "Course_ID,Title,Department,Enrollments,Status\n" +
          "CRS-1,Modern Web Architecture,Computer Science,42,Published\n" +
          "CRS-2,Deep Learning & PyTorch,Data Science,38,Published\n";
      } else {
        filename = "System_Attendance_Log.csv";
        content = "Date,Cohort,Course,Attendance_Pct,Teacher\n" +
          "2026-10-21,CS-2026-A,Web Architecture,94%,Dr. Alan Turing\n" +
          "2026-10-21,DS-2026-A,Deep Learning,98%,Prof. Ada Lovelace\n";
      }

      const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIsExporting(false);
      setShowExportModal(false);
      toast.success(`Export generated and downloaded: ${filename}`);
    }, 600);
  };

  const handleGenerateNewKey = () => {
    const rawRandom = Math.random().toString(36).substring(2, 12);
    const newKey = {
      id: Date.now(),
      name: `API Key ${apiKeys.length + 1}`,
      key: `lumina_live_${rawRandom}`,
      created: 'Just now'
    };
    setApiKeys(prev => [newKey, ...prev]);
    navigator.clipboard?.writeText(newKey.key);
    toast.success(`Created new key (${newKey.key.substring(0, 16)}...) and copied to clipboard!`);
  };

  const handleRevokeKey = (id) => {
    setApiKeys(prev => prev.filter(k => k.id !== id));
    toast.success('API key revoked successfully');
  };

  const filteredReports = reports.filter(r => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.name?.toLowerCase().includes(q) ||
      r.type?.toLowerCase().includes(q) ||
      r.frequency?.toLowerCase().includes(q)
    );
  });

  if (isLoading) return <Loader text="Loading reports..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: 1400, margin: '0 auto' }}>
      
      {/* ── 1. The Decision Intelligence Header (Command Palette Style) ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Command size={18} color="var(--text-muted)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search reports or type a command..." 
            style={{ 
              width: '100%', padding: '0.875rem 1rem 0.875rem 3rem', 
              borderRadius: 16, border: '1px solid var(--glass-border)', background: 'var(--surface-0)',
              fontSize: '0.9375rem', color: 'var(--text-primary)', outline: 'none',
              boxShadow: '0 2px 10px rgba(0,0,0,0.02)', transition: 'all 0.2s'
            }}
            onFocus={e => { e.target.style.borderColor = 'var(--brand-400)'; e.target.style.boxShadow = '0 0 0 4px var(--brand-50)'; }}
            onBlur={e => { e.target.style.borderColor = 'var(--glass-border)'; e.target.style.boxShadow = '0 2px 10px rgba(0,0,0,0.02)'; }}
          />
        </div>
        
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => toast.success('You have no unread data alerts')} className="btn btn-ghost btn-icon" title="Notifications"><Bell size={18} /></button>
          <button onClick={() => setShowExportModal(true)} className="btn btn-primary" style={{ gap: 8 }}>
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
              Your data infrastructure is healthy. The <strong style={{ color: 'var(--brand-700)', fontWeight: 800 }}>Q3 Financial Billing</strong> report finished generating and is ready for download.
            </h2>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button 
                onClick={() => handleDownloadCSV({ name: 'Q3 Financial Billing' })}
                className="btn btn-secondary btn-sm" style={{ gap: 6, fontSize: '0.8125rem', background: 'white' }}>
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
               <button 
                onClick={() => { refetch(); toast.success('Reports synchronized'); }}
                className="btn btn-secondary btn-sm" style={{ gap: 6 }}>
                <RefreshCw size={14} className={isFetching ? "spin" : ""} /> Sync
               </button>
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
                {filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      No reports match your search query.
                    </td>
                  </tr>
                ) : filteredReports.map((r, i) => {
                  const isProcessing = r.status === 'Processing';
                  return (
                    <tr key={r.id} style={{ borderBottom: i < filteredReports.length - 1 ? '1px solid var(--glass-border)' : 'none', transition: 'background 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-1)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
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
                         <button 
                           onClick={() => handleDownloadCSV(r)}
                           className="btn btn-secondary btn-sm" disabled={isProcessing} style={{ padding: '6px 12px', fontSize: '0.75rem', opacity: isProcessing ? 0.5 : 1 }}>
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
              Connect your BI tools (Tableau, PowerBI) directly to our secure REST/GraphQL endpoints.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {apiKeys.map(k => (
                <div key={k.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1rem', background: 'var(--surface-1)', border: '1px solid var(--glass-border)', borderRadius: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Key size={16} color="var(--brand-600)" />
                    <div>
                      <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>{k.name}</p>
                      <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{k.key ? `${k.key.substring(0, 15)}...` : k.created}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button 
                      onClick={() => { navigator.clipboard?.writeText(k.key); toast.success('Key copied to clipboard'); }}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 4 }} title="Copy Key">
                      <Copy size={13} />
                    </button>
                    <button 
                      onClick={() => handleRevokeKey(k.id)}
                      style={{ background: 'transparent', border: 'none', color: '#ef4444', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}>
                      Revoke
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={handleGenerateNewKey}
              className="btn btn-secondary" style={{ width: '100%', marginTop: '1rem', fontSize: '0.8125rem', gap: 6 }}>
              <Lock size={14} /> Generate New Key
            </button>
          </div>

        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: 480, padding: '2rem', background: 'var(--surface-0)', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>Export Organization Data</h3>
              <button onClick={() => setShowExportModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleGenerateExport} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Dataset Type</label>
                <select 
                  value={exportType} 
                  onChange={e => setExportType(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 10, border: '1px solid var(--surface-3)', background: 'var(--surface-1)', color: 'var(--text-primary)', outline: 'none' }}>
                  <option value="students">Students Directory & Status</option>
                  <option value="courses">Course Catalog & Enrollments</option>
                  <option value="attendance">Daily Attendance Registry Logs</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Format</label>
                <div style={{ display: 'flex', gap: 12 }}>
                  {['csv', 'json'].map(fmt => (
                    <button 
                      type="button" 
                      key={fmt} 
                      onClick={() => setExportFormat(fmt)}
                      style={{ flex: 1, padding: '0.625rem', borderRadius: 8, border: `1.5px solid ${exportFormat === fmt ? 'var(--brand-500)' : 'var(--surface-3)'}`, background: exportFormat === fmt ? 'var(--brand-50)' : 'var(--surface-1)', color: exportFormat === fmt ? 'var(--brand-600)' : 'var(--text-secondary)', fontWeight: 800, fontSize: '0.8125rem', textTransform: 'uppercase', cursor: 'pointer' }}>
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowExportModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" disabled={isExporting} className="btn btn-primary" style={{ gap: 6 }}>
                  <Download size={15} /> {isExporting ? 'Generating...' : 'Download Export'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
