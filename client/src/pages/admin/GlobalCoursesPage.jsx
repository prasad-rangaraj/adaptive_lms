import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '../../lib/api';
import { BookOpen, Search, MoreHorizontal, Globe, PlayCircle } from 'lucide-react';
import { useState } from 'react';
import Loader from '../../components/ui/Loader';

export default function GlobalCoursesPage() {
  const [search, setSearch] = useState('');

  const { data: courses, isLoading } = useQuery({
    queryKey: ['global-courses'],
    queryFn: () => adminAPI.listGlobalCourses().then(r => r.data),
  });

  const filteredCourses = courses?.filter(c => 
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={24} color="var(--brand-500)" /> Platform Content
          </h1>
          <p className="page-subtitle">Moderate and manage courses across all organizations.</p>
        </div>
      </div>

      <div className="glass-card table-wrapper">
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface-1)' }}>
          <div style={{ position: 'relative', width: 300 }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 10 }} />
            <input 
              type="text" 
              placeholder="Search by course title..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '2.5rem', width: '100%', height: 36, fontSize: '0.875rem' }} 
            />
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, background: 'var(--surface-0)', padding: '4px 10px', borderRadius: 999, border: '1px solid var(--glass-border)' }}>
            {filteredCourses?.length || 0} Courses Found
          </span>
        </div>

        {isLoading ? (
          <Loader text="Loading global courses..." />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Course Details</th>
                <th>Category</th>
                <th>Tenant ID</th>
                <th>Difficulty</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses?.map(c => (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--brand-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-600)' }}>
                        <PlayCircle size={20} />
                      </div>
                      <div>
                        <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{c.title}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Price: ${c.price.toFixed(2)}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    {c.category ? (
                      <span className="badge badge-gray">{c.category}</span>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Uncategorized</span>
                    )}
                  </td>
                  <td>
                    {c.tenant_id ? (
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Globe size={12} /> #{c.tenant_id}
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--brand-600)', fontWeight: 700 }}>System Template</span>
                    )}
                  </td>
                  <td>
                    <span className="badge badge-gray" style={{ textTransform: 'capitalize' }}>
                      {c.difficulty}
                    </span>
                  </td>
                  <td>
                    {c.is_published ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div className="live-dot" style={{ width: 6, height: 6 }} />
                        <span style={{ fontSize: '0.8125rem', color: '#059669', fontWeight: 500 }}>Published</span>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500 }}>Draft</span>
                    )}
                  </td>
                  <td>
                    <button className="btn btn-ghost btn-icon btn-sm">
                      <MoreHorizontal size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredCourses?.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No courses match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
