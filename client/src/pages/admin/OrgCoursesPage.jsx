import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tenantsAPI } from '../../services/api.service';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { BookOpen, Globe, Lock, Search, AlertCircle, Eye, EyeOff, LayoutTemplate } from 'lucide-react';
import Loader from '../../components/ui/Loader';

// ── Difficulty badge config ─────────────────────────────────────────────────
const diffBadge = {
  beginner:     { bg: '#ecfdf5', color: '#059669', border: '#bbf7d0', label: 'Beginner' },
  intermediate: { bg: '#fffbeb', color: '#d97706', border: '#fde68a', label: 'Intermediate' },
  advanced:     { bg: '#fff1f2', color: '#e11d48', border: '#fecdd3', label: 'Advanced' },
};

// ── Progress bar for enrollment fill ───────────────────────────────────────
function EnrollBar({ count, max }) {
  const pct = max > 0 ? Math.min(100, Math.round((count / max) * 100)) : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: 140 }}>
      <div style={{ flex: 1, height: 4, borderRadius: 999, background: 'var(--surface-2)', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: 'var(--brand-500)', borderRadius: 999 }} />
      </div>
      <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--text-primary)', width: 24 }}>{count}</span>
    </div>
  );
}

export default function OrgCoursesPage() {
  const { user } = useAuthStore();
  const tenantId = user?.tenant_id;
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDiff, setFilterDiff] = useState('all');

  const { data: courses, isLoading } = useQuery({
    queryKey: ['tenant-courses', tenantId],
    queryFn: () => tenantsAPI.getCourses(tenantId).then(r => r.data),
    enabled: !!tenantId,
  });

  const togglePublish = useMutation({
    mutationFn: (courseId) => tenantsAPI.toggleCoursePublish(tenantId, courseId),
    onSuccess: (res) => {
      qc.invalidateQueries(['tenant-courses', tenantId]);
      toast.success(res.data?.is_published ? 'Course published' : 'Course unpublished');
    },
    onError: () => toast.error('Failed to update course'),
  });

  if (isLoading) return <Loader text="Loading curriculum..." />;

  const allCourses = courses || [];
  const maxEnroll = Math.max(...allCourses.map(c => c.enrollments || 0), 1);

  const filtered = allCourses.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
      (c.teacher_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.category || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || (filterStatus === 'published' ? c.is_published : !c.is_published);
    const matchDiff = filterDiff === 'all' || c.difficulty === filterDiff;
    return matchSearch && matchStatus && matchDiff;
  });

  const published = allCourses.filter(c => c.is_published).length;
  const draft = allCourses.length - published;

  return (
    <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'flex-start' }}>

      {/* ── Left: Curriculum Canvas ── */}
      <div style={{ flex: 1, background: 'var(--surface-1)', borderRadius: 24, border: '1px solid var(--glass-border)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
        
        {/* Unified Header & Toolbar */}
        <div style={{ padding: '2rem 2.5rem 1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Curriculum Library</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginTop: 4 }}>Review, publish, and govern all courses created by your educators.</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--brand-600)', fontWeight: 600 }}>
                  <AlertCircle size={14} /> Quality Control
                </span>
                <span style={{ opacity: 0.5 }}>•</span>
                <span>Courses remain drafts until published by an Admin</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
              <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search courses or topics..."
                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: 12, border: '1px solid var(--surface-3)', background: 'var(--surface-1)', fontSize: '0.9375rem', outline: 'none', color: 'var(--text-primary)', transition: 'all 0.2s' }}
                onFocus={e => { e.target.style.background = 'white'; e.target.style.borderColor = 'var(--brand-400)'; e.target.style.boxShadow = 'var(--glow-brand)'; }}
                onBlur={e => { e.target.style.background = 'var(--surface-1)'; e.target.style.borderColor = 'var(--surface-3)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
            
            <div style={{ display: 'flex', background: 'var(--surface-1)', borderRadius: 12, padding: 4 }}>
              {[['all', 'All Courses'], ['published', 'Published'], ['draft', 'Drafts']].map(([val, lbl]) => (
                <button key={val} onClick={() => setFilterStatus(val)} style={{
                  padding: '0.5rem 1rem', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)',
                  background: filterStatus === val ? 'white' : 'transparent',
                  color: filterStatus === val ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontWeight: 700, fontSize: '0.875rem', borderRadius: 8,
                  boxShadow: filterStatus === val ? '0 2px 6px rgba(0,0,0,0.04)' : 'none',
                }}>{lbl}</button>
              ))}
            </div>

            <div style={{ display: 'flex', background: 'var(--surface-1)', borderRadius: 12, padding: 4 }}>
              {[['all', 'Any Level'], ['beginner', 'Beg'], ['intermediate', 'Int'], ['advanced', 'Adv']].map(([val, lbl]) => (
                <button key={val} onClick={() => setFilterDiff(val)} style={{
                  padding: '0.5rem 0.875rem', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)',
                  background: filterDiff === val ? 'white' : 'transparent',
                  color: filterDiff === val ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontWeight: 700, fontSize: '0.875rem', borderRadius: 8,
                  boxShadow: filterDiff === val ? '0 2px 6px rgba(0,0,0,0.04)' : 'none',
                }}>{lbl}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Seamless Course List */}
        {filtered.length === 0 ? (
          <div style={{ padding: '6rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: 'var(--surface-1)', border: '1px dashed var(--surface-4)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <BookOpen size={28} color="var(--text-muted)" />
            </div>
            <p style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1.125rem', marginBottom: 4 }}>No courses match</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filtered.map((c, i) => {
              const diff = diffBadge[c.difficulty] || diffBadge.beginner;
              const isLast = i === filtered.length - 1;
              
              return (
                <div key={c.id} style={{
                  display: 'grid', gridTemplateColumns: '1fr auto auto auto auto', gap: '2rem', alignItems: 'center',
                  padding: '1.5rem 2.5rem', borderBottom: isLast ? 'none' : '1px solid var(--surface-2)',
                  background: 'transparent', transition: 'background 0.2s'
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--brand-50)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Course Info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 0 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                      background: `linear-gradient(135deg, var(--brand-600), var(--brand-400))`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(8,145,178,0.2)'
                    }}>
                      <BookOpen size={20} color="white" />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 600 }}>By {c.teacher_name || 'Unassigned'}</span>
                        {c.category && <><span style={{ color: 'var(--surface-4)' }}>·</span><span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{c.category}</span></>}
                      </div>
                    </div>
                  </div>

                  {/* Level Badge */}
                  <span style={{ background: diff.bg, color: diff.color, border: `1px solid ${diff.border}`, borderRadius: 8, padding: '4px 10px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {diff.label}
                  </span>

                  {/* Enrollments progress inline */}
                  <div>
                    <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Enrollments</p>
                    <EnrollBar count={c.enrollments} max={maxEnroll} />
                  </div>

                  {/* Status Indicator */}
                  {c.is_published
                    ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', fontWeight: 600, color: '#059669', width: 90 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} /> Published
                      </span>
                    : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', fontWeight: 600, color: '#d97706', width: 90 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b' }} /> Draft
                      </span>
                  }

                  {/* Action */}
                  <button
                    onClick={() => togglePublish.mutate(c.id)}
                    disabled={togglePublish.isPending}
                    style={{
                      background: c.is_published ? 'var(--surface-1)' : 'var(--brand-600)',
                      color: c.is_published ? 'var(--text-secondary)' : 'white',
                      border: c.is_published ? '1px solid var(--surface-3)' : 'none',
                      padding: '0.625rem 1rem', borderRadius: 10, fontSize: '0.8125rem', fontWeight: 700,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                      minWidth: 110, justifyContent: 'center', transition: 'all 0.2s',
                      boxShadow: c.is_published ? 'none' : '0 2px 8px rgba(8,145,178,0.3)'
                    }}
                  >
                    {c.is_published ? <><EyeOff size={14} /> Unpublish</> : <><Eye size={14} /> Publish</>}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Right: Insights Panel ── */}
      <div style={{ width: 340, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: '5.5rem' }}>
        
        {/* Stats Card */}
        <div style={{ background: 'var(--surface-1)', borderRadius: 24, padding: '2.5rem', border: '1px solid var(--glass-border)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <LayoutTemplate size={14} color="var(--brand-500)" /> Library Overview
          </h3>
          
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: '2rem' }}>
            <span style={{ fontSize: '3.5rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-0.04em' }}>{allCourses.length}</span>
            <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-muted)' }}>total courses</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)' }}>
                <Globe size={16} color="#059669" /> <span style={{ fontSize: '0.9375rem', fontWeight: 600 }}>Published</span>
              </div>
              <span style={{ fontSize: '1rem', fontWeight: 800 }}>{published}</span>
            </div>
            <div style={{ height: 1, background: 'var(--surface-2)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)' }}>
                <Lock size={16} color="#d97706" /> <span style={{ fontSize: '0.9375rem', fontWeight: 600 }}>Awaiting Review</span>
              </div>
              <span style={{ fontSize: '1rem', fontWeight: 800 }}>{draft}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
