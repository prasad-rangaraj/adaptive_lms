import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '../../services/api.service';
import { BookOpen, Search, PlayCircle, Globe, Filter, BookX, CheckCircle, Clock, Tag } from 'lucide-react';
import Loader from '../../components/ui/Loader';
import toast from 'react-hot-toast';

const DIFFICULTY_META = {
  beginner:     { color: '#059669', bg: '#ecfdf5', border: '#a7f3d0', label: 'Beginner' },
  intermediate: { color: '#d97706', bg: '#fffbeb', border: '#fde68a', label: 'Intermediate' },
  advanced:     { color: '#e11d48', bg: '#fff1f2', border: '#fecdd3', label: 'Advanced' },
};

export default function GlobalCoursesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: courses, isLoading } = useQuery({
    queryKey: ['global-courses'],
    queryFn: () => adminAPI.listGlobalCourses().then(r => r.data),
  });

  const filtered = courses?.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
      (c.category || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' ||
      (statusFilter === 'published' && c.is_published) ||
      (statusFilter === 'draft' && !c.is_published);
    return matchSearch && matchStatus;
  });

  const publishedCount = courses?.filter(c => c.is_published).length || 0;
  const draftCount = courses?.filter(c => !c.is_published).length || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title">Platform Content Library</h1>
          <p className="page-subtitle">Moderate and manage all courses across every organization.</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        <div className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--brand-50)', border: '1px solid var(--brand-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-600)' }}>
            <BookOpen size={20} />
          </div>
          <div>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{courses?.length || 0}</p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500, marginTop: 4 }}>Total Courses</p>
          </div>
        </div>
        <div className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: '#ecfdf5', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
            <CheckCircle size={20} />
          </div>
          <div>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{publishedCount}</p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500, marginTop: 4 }}>Published</p>
          </div>
        </div>
        <div className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: '#fffbeb', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
            <Clock size={20} />
          </div>
          <div>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{draftCount}</p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500, marginTop: 4 }}>In Draft</p>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="glass-card" style={{ padding: 0 }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', background: 'var(--surface-1)', borderTopLeftRadius: 'inherit', borderTopRightRadius: 'inherit' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
              <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder="Search courses..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '2.25rem', width: '100%', height: 36, fontSize: '0.875rem' }}
              />
            </div>
            {/* Status Filters */}
            {[
              { key: 'all', label: 'All' },
              { key: 'published', label: '● Published', color: '#059669' },
              { key: 'draft', label: '○ Draft', color: '#d97706' },
            ].map(f => (
              <button key={f.key} onClick={() => setStatusFilter(f.key)} style={{
                padding: '5px 12px', borderRadius: 999, border: '1.5px solid',
                fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer',
                borderColor: statusFilter === f.key ? 'var(--brand-500)' : 'var(--glass-border)',
                background: statusFilter === f.key ? 'var(--brand-50)' : 'transparent',
                color: statusFilter === f.key ? 'var(--brand-600)' : (f.color || 'var(--text-muted)'),
                transition: 'all 0.15s',
              }}>
                {f.label}
              </button>
            ))}
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, background: 'var(--surface-0)', padding: '4px 10px', borderRadius: 999, border: '1px solid var(--glass-border)', flexShrink: 0 }}>
            {filtered?.length || 0} courses
          </span>
        </div>

        {isLoading ? (
          <Loader text="Loading platform courses..." />
        ) : !filtered?.length ? (
          <div style={{ padding: '4rem', textAlign: 'center' }}>
            <BookX size={32} color="var(--text-muted)" style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
            <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>No courses match your filters.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Category</th>
                  <th>Organization</th>
                  <th>Difficulty</th>
                  <th>Price</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => {
                  const diff = DIFFICULTY_META[c.difficulty] || DIFFICULTY_META.beginner;
                  return (
                    <tr key={c.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--brand-50)', border: '1px solid var(--brand-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-500)', flexShrink: 0 }}>
                            <PlayCircle size={18} />
                          </div>
                          <div>
                            <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID #{c.id}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        {c.category ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', background: 'var(--surface-2)', border: '1px solid var(--glass-border)', padding: '3px 8px', borderRadius: 6 }}>
                            <Tag size={10} /> {c.category}
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>
                      <td>
                        {c.tenant_id ? (
                          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Globe size={12} color="var(--text-muted)" /> Org #{c.tenant_id}
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--brand-600)', fontWeight: 700, background: 'var(--brand-50)', padding: '2px 7px', borderRadius: 4 }}>Platform</span>
                        )}
                      </td>
                      <td>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: diff.color, background: diff.bg, border: `1px solid ${diff.border}`, padding: '3px 8px', borderRadius: 6 }}>
                          {diff.label}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                        {c.price > 0 ? `$${c.price.toFixed(2)}` : <span style={{ color: '#059669', fontWeight: 600 }}>Free</span>}
                      </td>
                      <td>
                        {c.is_published ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.8125rem', fontWeight: 500, color: '#059669' }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} /> Published
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#d97706' }}>Draft</span>
                        )}
                      </td>
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
