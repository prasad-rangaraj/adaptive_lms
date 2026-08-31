import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '../../services/api.service';
import { 
  BookOpen, Search, PlayCircle, Globe, Filter, BookX, 
  CheckCircle, Clock, Tag, Library, Blocks, FileVideo, 
  FileText, Database, Plus, Upload, Link, MoreVertical 
} from 'lucide-react';
import Loader from '../../components/ui/Loader';
import toast from 'react-hot-toast';

const DIFFICULTY_META = {
  beginner:     { color: '#059669', bg: '#ecfdf5', border: '#a7f3d0', label: 'Beginner' },
  intermediate: { color: '#d97706', bg: '#fffbeb', border: '#fde68a', label: 'Intermediate' },
  advanced:     { color: '#e11d48', bg: '#fff1f2', border: '#fecdd3', label: 'Advanced' },
};

// ── Tab 1: Syndicated Courses (from old GlobalCoursesPage) ────────────────────
function SyndicatedCoursesTab() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: courses, isLoading } = useQuery({
    queryKey: ['global-courses'],
    queryFn: () => adminAPI.listGlobalCourses().then(r => r.data),
  });

  const filtered = courses?.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || (c.category || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || (statusFilter === 'published' && c.is_published) || (statusFilter === 'draft' && !c.is_published);
    return matchSearch && matchStatus;
  });

  const publishedCount = courses?.filter(c => c.is_published).length || 0;
  const draftCount = courses?.filter(c => !c.is_published).length || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        <div className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--brand-50)', border: '1px solid var(--brand-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-600)' }}><BookOpen size={20} /></div>
          <div><p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{courses?.length || 0}</p><p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500, marginTop: 4 }}>Total Courses</p></div>
        </div>
        <div className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: '#ecfdf5', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}><CheckCircle size={20} /></div>
          <div><p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{publishedCount}</p><p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500, marginTop: 4 }}>Published</p></div>
        </div>
        <div className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: '#fffbeb', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}><Clock size={20} /></div>
          <div><p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{draftCount}</p><p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500, marginTop: 4 }}>In Draft</p></div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: 0 }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', background: 'var(--surface-1)', borderTopLeftRadius: 'inherit', borderTopRightRadius: 'inherit' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
              <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input type="text" placeholder="Search courses..." value={search} onChange={e => setSearch(e.target.value)} className="input-field" style={{ paddingLeft: '2.25rem', width: '100%', height: 36, fontSize: '0.875rem' }} />
            </div>
            {[ { key: 'all', label: 'All' }, { key: 'published', label: '● Published', color: '#059669' }, { key: 'draft', label: '○ Draft', color: '#d97706' } ].map(f => (
              <button key={f.key} onClick={() => setStatusFilter(f.key)} style={{ padding: '5px 12px', borderRadius: 999, border: '1.5px solid', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', borderColor: statusFilter === f.key ? 'var(--brand-500)' : 'var(--glass-border)', background: statusFilter === f.key ? 'var(--brand-50)' : 'transparent', color: statusFilter === f.key ? 'var(--brand-600)' : (f.color || 'var(--text-muted)'), transition: 'all 0.15s' }}>
                {f.label}
              </button>
            ))}
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, background: 'var(--surface-0)', padding: '4px 10px', borderRadius: 999, border: '1px solid var(--glass-border)', flexShrink: 0 }}>{filtered?.length || 0} courses</span>
        </div>

        {isLoading ? (
          <Loader text="Loading platform courses..." />
        ) : !filtered?.length ? (
          <div style={{ padding: '4rem', textAlign: 'center' }}><BookX size={32} color="var(--text-muted)" style={{ margin: '0 auto 1rem', opacity: 0.4 }} /><p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>No courses match your filters.</p></div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead><tr><th>Course</th><th>Category</th><th>Organization</th><th>Difficulty</th><th>Price</th><th>Status</th></tr></thead>
              <tbody>
                {filtered.map(c => {
                  const diff = DIFFICULTY_META[c.difficulty] || DIFFICULTY_META.beginner;
                  return (
                    <tr key={c.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--brand-50)', border: '1px solid var(--brand-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-500)', flexShrink: 0 }}><PlayCircle size={18} /></div>
                          <div><p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</p><p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID #{c.id}</p></div>
                        </div>
                      </td>
                      <td>{c.category ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', background: 'var(--surface-2)', border: '1px solid var(--glass-border)', padding: '3px 8px', borderRadius: 6 }}><Tag size={10} /> {c.category}</span> : <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>—</span>}</td>
                      <td>{c.tenant_id ? <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}><Globe size={12} color="var(--text-muted)" /> Org #{c.tenant_id}</span> : <span style={{ fontSize: '0.75rem', color: 'var(--brand-600)', fontWeight: 700, background: 'var(--brand-50)', padding: '2px 7px', borderRadius: 4 }}>Platform</span>}</td>
                      <td><span style={{ fontSize: '0.75rem', fontWeight: 600, color: diff.color, background: diff.bg, border: `1px solid ${diff.border}`, padding: '3px 8px', borderRadius: 6 }}>{diff.label}</span></td>
                      <td style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{c.price > 0 ? `$${c.price.toFixed(2)}` : <span style={{ color: '#059669', fontWeight: 600 }}>Free</span>}</td>
                      <td>{c.is_published ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.8125rem', fontWeight: 500, color: '#059669' }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} /> Published</span> : <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#d97706' }}>Draft</span>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Tab 2: Master Blueprints ───────────────────────────────────────────────────
function MasterBlueprintsTab() {
  const blueprints = [
    { id: 'bp_1', title: 'Cybersecurity Fundamentals (V2)', version: '2.1.0', syncedTenants: 14, lastSync: '2 hrs ago', status: 'active' },
    { id: 'bp_2', title: 'Data Science Bootcamp', version: '1.4.3', syncedTenants: 8, lastSync: '1 day ago', status: 'active' },
    { id: 'bp_3', title: 'Compliance & Ethics 2024', version: '3.0.0', syncedTenants: 42, lastSync: '12 mins ago', status: 'draft' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-primary" style={{ gap: 8 }}><Plus size={16} /> New Blueprint</button>
      </div>
      <div className="glass-card" style={{ padding: 0 }}>
        <table className="table">
          <thead><tr><th>Master Blueprint</th><th>Version</th><th>Downstream Tenants</th><th>Last Sync</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {blueprints.map(bp => (
              <tr key={bp.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f0fdf4', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a', flexShrink: 0 }}><Blocks size={18} /></div>
                    <div><p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{bp.title}</p><p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}><Link size={12} /> Sync Enabled</p></div>
                  </div>
                </td>
                <td><span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--brand-600)', background: 'var(--brand-50)', padding: '2px 8px', borderRadius: 999 }}>v{bp.version}</span></td>
                <td><span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>{bp.syncedTenants} orgs</span></td>
                <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{bp.lastSync}</td>
                <td>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', fontWeight: 700, color: bp.status === 'active' ? '#059669' : '#d97706', background: bp.status === 'active' ? '#ecfdf5' : '#fffbeb', border: `1px solid ${bp.status === 'active' ? '#a7f3d0' : '#fde68a'}`, padding: '3px 8px', borderRadius: 6 }}>
                    {bp.status === 'active' ? 'Publishing Updates' : 'Draft Mode'}
                  </span>
                </td>
                <td><button className="btn btn-ghost btn-icon btn-sm"><MoreVertical size={16} color="var(--text-muted)" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Tab 3: Global Asset Library ───────────────────────────────────────────────
function GlobalAssetLibraryTab() {
  const assets = [
    { id: 'a1', name: 'corporate_branding_kit.zip', type: 'archive', size: '14.2 MB', uploader: 'System Admin' },
    { id: 'a2', name: 'welcome_video_v3.mp4', type: 'video', size: '240.5 MB', uploader: 'Content Team' },
    { id: 'a3', name: 'compliance_framework_2024.pdf', type: 'pdf', size: '4.1 MB', uploader: 'System Admin' },
  ];

  const getIcon = (type) => {
    if (type === 'video') return <FileVideo size={18} color="#e11d48" />;
    if (type === 'pdf') return <FileText size={18} color="#0284c7" />;
    return <Database size={18} color="#d97706" />;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-secondary" style={{ gap: 8 }}><Upload size={16} /> Upload Asset</button>
      </div>
      <div className="glass-card" style={{ padding: 0 }}>
        <table className="table">
          <thead><tr><th>Asset Name</th><th>Size</th><th>Uploaded By</th><th>Global Access</th><th></th></tr></thead>
          <tbody>
            {assets.map(a => (
              <tr key={a.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--surface-2)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{getIcon(a.type)}</div>
                    <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{a.name}</p>
                  </div>
                </td>
                <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{a.size}</td>
                <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{a.uploader}</td>
                <td><span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#16a34a', background: '#f0fdf4', padding: '3px 8px', borderRadius: 6, border: '1px solid #bbf7d0' }}>Public to all Tenants</span></td>
                <td><button className="btn btn-ghost btn-icon btn-sm"><MoreVertical size={16} color="var(--text-muted)" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main Hub ──────────────────────────────────────────────────────────────────
export default function GlobalContentHub() {
  const [activeTab, setActiveTab] = useState('courses'); // 'courses' | 'blueprints' | 'assets'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1.5rem' }}>
        <div>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-600)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Content & Syndication</p>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>Global Content Hub</h1>
        </div>
        
        <div style={{ display: 'flex', background: 'var(--surface-1)', padding: 6, borderRadius: 16, border: '1px solid var(--glass-border)', gap: 4, overflowX: 'auto' }}>
          {[
            { id: 'courses', label: 'All Courses', icon: BookOpen },
            { id: 'blueprints', label: 'Master Blueprints', icon: Blocks },
            { id: 'assets', label: 'Asset Library', icon: Library },
          ].map(t => (
            <button 
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{ 
                display: 'flex', alignItems: 'center', gap: 8, padding: '0.625rem 1.25rem', borderRadius: 12, border: 'none', cursor: 'pointer',
                fontWeight: 700, fontSize: '0.875rem', transition: 'all 0.2s', whiteSpace: 'nowrap',
                background: activeTab === t.id ? 'white' : 'transparent',
                color: activeTab === t.id ? 'var(--brand-600)' : 'var(--text-muted)',
                boxShadow: activeTab === t.id ? '0 2px 8px rgba(0,0,0,0.06)' : 'none'
              }}>
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'courses' && <SyndicatedCoursesTab />}
      {activeTab === 'blueprints' && <MasterBlueprintsTab />}
      {activeTab === 'assets' && <GlobalAssetLibraryTab />}
    </div>
  );
}
