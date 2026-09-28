import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, GraduationCap, Play, ArrowRight, Users, BarChart2,
  CheckCircle2, Clock, Eye, Edit, ToggleRight, ToggleLeft, Plus,
  Search, Layers, Award, AlertTriangle, TrendingUp, Target,
  X, BookMarked, Cpu, ChevronRight, Hash, Video, FileText
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { coursesAPI, tenantsAPI } from '../../services/api.service';
import { getTopicImage } from '../../utils/imageUtils';
import toast from 'react-hot-toast';

// ─── Shared Stat Badge ────────────────────────────────────────────────────────
function StatBadge({ icon: Icon, label, value, color = 'var(--brand-500)' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'var(--surface-1)', borderRadius: 12, padding: '0.75rem 1.25rem', border: '1px solid var(--glass-border)', minWidth: 100 }}>
      <Icon size={18} color={color} />
      <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</span>
      <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
    </div>
  );
}

// ─── STATUS PILL ─────────────────────────────────────────────────────────────
function StatusPill({ published }) {
  return published ? (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700, background: '#ecfdf5', color: '#059669', border: '1px solid #bbf7d0' }}>
      <CheckCircle2 size={11} /> Published
    </span>
  ) : (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700, background: '#fff7ed', color: '#d97706', border: '1px solid #fed7aa' }}>
      <Clock size={11} /> Draft
    </span>
  );
}

// ─── LEVEL CONFIG ─────────────────────────────────────────────────────────────
const LEVELS = [
  { key: 'fundamentals', label: 'Fundamentals', emoji: '🌱', color: '#0891b2', bg: '#e0f2fe', border: '#bae6fd' },
  { key: 'beginner',     label: 'Beginner',     emoji: '🚀', color: '#7c3aed', bg: '#ede9fe', border: '#ddd6fe' },
  { key: 'intermediate', label: 'Intermediate', emoji: '⚡', color: '#d97706', bg: '#fef3c7', border: '#fde68a' },
  { key: 'advanced',     label: 'Advanced',     emoji: '🏆', color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
];

const PATH_CONFIG = {
  pending:       { label: 'Pending',       emoji: '⏳', color: '#6b7280', bg: '#f3f4f6' },
  fundamentals:  { label: 'Fundamentals',  emoji: '🌱', color: '#0891b2', bg: '#e0f2fe' },
  basics:        { label: 'Basics',        emoji: '🌱', color: '#0891b2', bg: '#e0f2fe' },
  intermediate:  { label: 'Intermediate',  emoji: '⚡', color: '#d97706', bg: '#fef3c7' },
  advanced:      { label: 'Advanced',      emoji: '🏆', color: '#059669', bg: '#ecfdf5' },
};

// ─── COURSE DETAIL MODAL ──────────────────────────────────────────────────────
function CourseDetailModal({ courseId, courseTitle, onClose }) {
  const [tab, setTab] = useState('modules'); // 'modules' | 'students'
  const [expandedMod, setExpandedMod] = useState(null);
  
  const user = useAuthStore(s => s.user);
  const canEdit = ['teacher', 'tenant_admin', 'super_admin'].includes(user?.role);
  const queryClient = useQueryClient();
  
  const [editingCourseTitle, setEditingCourseTitle] = useState(false);
  const [editCourseTitleVal, setEditCourseTitleVal] = useState('');

  const [editingCourseDesc, setEditingCourseDesc] = useState(false);
  const [editCourseDescVal, setEditCourseDescVal] = useState('');

  const [editingModuleId, setEditingModuleId] = useState(null);
  const [editModuleTitleVal, setEditModuleTitleVal] = useState('');
  const [editModuleLevelVal, setEditModuleLevelVal] = useState('');

  const handleUpdateCourseTitle = async () => {
    if (!editCourseTitleVal.trim()) return setEditingCourseTitle(false);
    try {
      await coursesAPI.updateCourse(courseId, { title: editCourseTitleVal });
      queryClient.invalidateQueries(['courseDetail', courseId]);
    } catch (e) {}
    setEditingCourseTitle(false);
  };

  const handleUpdateCourseDesc = async () => {
    if (!editCourseDescVal.trim()) return setEditingCourseDesc(false);
    try {
      await coursesAPI.updateCourse(courseId, { description: editCourseDescVal });
      queryClient.invalidateQueries(['courseDetail', courseId]);
    } catch (e) {}
    setEditingCourseDesc(false);
  };

  const handleUpdateModule = async (modId) => {
    if (!editModuleTitleVal.trim()) return setEditingModuleId(null);
    try {
      await coursesAPI.updateModule(courseId, modId, { title: editModuleTitleVal, level: editModuleLevelVal });
      queryClient.invalidateQueries(['courseDetail', courseId]);
    } catch (e) {}
    setEditingModuleId(null);
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['courseDetail', courseId],
    queryFn: () => coursesAPI.getCourseDetail(courseId).then(r => r.data),
    enabled: !!courseId,
  });

  const modulesByLevel = data?.modules_by_level || {};
  const studentsByPath = data?.students_by_path || {};
  const totalStudents = data?.total_students || 0;
  const levelCounts = data?.level_counts || {};

  const allStudents = Object.values(studentsByPath).flat();

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }} />

      {/* Modal Card */}
      <div style={{ position: 'relative', width: '100%', maxWidth: 860, height: '85vh', background: 'var(--surface-0)', borderRadius: 24, border: '1px solid var(--glass-border)', boxShadow: '0 32px 80px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Header */}
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'flex-start', gap: '1rem', background: 'linear-gradient(135deg, var(--brand-50), var(--surface-0))' }}>
          <div style={{ width: 56, height: 56, borderRadius: 12, background: `url('${getTopicImage(data?.course?.title || courseTitle)}')`, backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            {editingCourseTitle ? (
              <input 
                autoFocus 
                value={editCourseTitleVal} 
                onChange={e => setEditCourseTitleVal(e.target.value)} 
                onBlur={handleUpdateCourseTitle} 
                onKeyDown={e => e.key === 'Enter' && handleUpdateCourseTitle()} 
                style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 4px', background: 'var(--surface-0)', border: '1px solid var(--brand-500)', outline: 'none', borderRadius: 6, padding: '2px 8px', width: '100%', maxWidth: 400 }} 
              />
            ) : (
              <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 4px', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: 8 }}>
                {data?.course?.title || courseTitle}
                {canEdit && <button onClick={() => { setEditCourseTitleVal(data?.course?.title || courseTitle); setEditingCourseTitle(true); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><Edit size={14}/></button>}
              </h2>
            )}
            
            {editingCourseDesc ? (
              <textarea
                autoFocus
                value={editCourseDescVal}
                onChange={e => setEditCourseDescVal(e.target.value)}
                onBlur={handleUpdateCourseDesc}
                style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', background: 'var(--surface-0)', border: '1px solid var(--brand-500)', outline: 'none', borderRadius: 6, padding: '4px 8px', width: '100%', maxWidth: 500, minHeight: 60, resize: 'vertical', display: 'block', marginBottom: 8 }}
              />
            ) : (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 8, maxWidth: 600 }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                  {data?.course?.description || 'No description provided.'}
                </p>
                {canEdit && <button onClick={() => { setEditCourseDescVal(data?.course?.description || ''); setEditingCourseDesc(true); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><Edit size={12}/></button>}
              </div>
            )}

            {data && (
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, fontWeight: 700 }}>
                {Object.values(modulesByLevel).flat().length} modules across {LEVELS.length} levels · {totalStudents} students enrolled
              </p>
            )}
          </div>
          <button onClick={onClose} style={{ padding: 8, borderRadius: 10, border: 'none', background: 'var(--surface-2)', cursor: 'pointer', color: 'var(--text-muted)', flexShrink: 0 }}><X size={18} /></button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, padding: '1rem 2rem 0', borderBottom: '1px solid var(--glass-border)' }}>
          {[['modules', `📚 Modules by Level`], ['students', `👥 Enrolled Students (${totalStudents})`]].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{ padding: '8px 20px', borderRadius: '10px 10px 0 0', border: '1px solid', borderBottom: 'none', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.2s', borderColor: tab === key ? 'var(--glass-border)' : 'transparent', background: tab === key ? 'var(--surface-0)' : 'transparent', color: tab === key ? 'var(--brand-600)' : 'var(--text-muted)', marginBottom: tab === key ? '-1px' : 0 }}>
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem 2rem', flex: 1, overflowY: 'auto' }} className="hide-scrollbar">
          {isLoading && <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading course details...</div>}
          {error && <div style={{ textAlign: 'center', padding: '3rem', color: '#ef4444' }}>Failed to load details.</div>}

          {/* ── MODULES TAB ── */}
          {!isLoading && !error && tab === 'modules' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {LEVELS.map(lv => {
                const mods = modulesByLevel[lv.key] || [];
                return (
                  <div key={lv.key}>
                    {/* Level Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.75rem' }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: lv.bg, border: `1px solid ${lv.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>{lv.emoji}</div>
                      <div>
                        <span style={{ fontWeight: 800, fontSize: '0.9375rem', color: lv.color }}>{lv.label}</span>
                        <span style={{ marginLeft: 8, fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', background: 'var(--surface-2)', padding: '2px 8px', borderRadius: 999 }}>{mods.length} module{mods.length !== 1 ? 's' : ''}</span>
                      </div>
                    </div>

                    {/* Module Cards */}
                    {mods.length === 0 ? (
                      <div style={{ padding: '1rem', background: 'var(--surface-1)', borderRadius: 10, border: '1px dashed var(--glass-border)', textAlign: 'center', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>No modules at this level yet</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {mods.map((m, idx) => (
                          <div key={m.id} style={{ display: 'flex', flexDirection: 'column', background: 'var(--surface-1)', borderRadius: 10, border: `1px solid ${expandedMod === m.id ? lv.color : lv.border}`, transition: 'border-color 0.2s', overflow: 'hidden' }}>
                            <div onClick={() => setExpandedMod(expandedMod === m.id ? null : m.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', cursor: 'pointer' }}>
                              <span style={{ width: 24, height: 24, borderRadius: 6, background: lv.bg, color: lv.color, fontWeight: 800, fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{idx + 1}</span>
                              {editingModuleId === m.id ? (
                                <div style={{ flex: 1, display: 'flex', gap: 8, alignItems: 'center' }} onClick={e => e.stopPropagation()}>
                                  <input
                                    autoFocus
                                    value={editModuleTitleVal}
                                    onChange={e => setEditModuleTitleVal(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleUpdateModule(m.id)}
                                    style={{ flex: 1, fontWeight: 700, fontSize: '0.875rem', background: 'var(--surface-0)', border: '1px solid var(--brand-500)', outline: 'none', borderRadius: 4, padding: '4px 8px', color: 'var(--text-primary)' }}
                                  />
                                  <select 
                                    value={editModuleLevelVal} 
                                    onChange={e => setEditModuleLevelVal(e.target.value)}
                                    style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid var(--brand-500)', background: 'var(--surface-0)', fontSize: '0.75rem', fontWeight: 700, outline: 'none' }}
                                  >
                                    <option value="fundamentals">Fundamentals</option>
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                  </select>
                                  <button onClick={() => handleUpdateModule(m.id)} style={{ background: 'var(--brand-500)', color: 'white', border: 'none', padding: '4px 8px', borderRadius: 4, cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}>Save</button>
                                </div>
                              ) : (
                                <span style={{ flex: 1, fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                  {m.title}
                                  {canEdit && (
                                    <button onClick={(e) => { e.stopPropagation(); setEditModuleTitleVal(m.title); setEditModuleLevelVal(m.level || lv.key); setEditingModuleId(m.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                                      <Edit size={12}/>
                                    </button>
                                  )}
                                </span>
                              )}
                              <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <BookMarked size={12} /> {m.materials_count} material{m.materials_count !== 1 ? 's' : ''}
                              </span>
                              <ChevronRight size={16} color="var(--text-muted)" style={{ transform: expandedMod === m.id ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                            </div>
                            
                            {expandedMod === m.id && m.materials && m.materials.length > 0 && (
                              <div style={{ padding: '0 1rem 1rem 3rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid var(--glass-border)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
                                {m.materials.map(mat => (
                                  <div key={mat.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', borderRadius: 8, background: 'var(--surface-0)' }}>
                                    <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                      {mat.type === 'video' ? <Video size={14} color="var(--brand-500)" /> : <FileText size={14} color="#10b981" />}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                      <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>{mat.title}</div>
                                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: 2 }}>{mat.type}{mat.duration ? ` • ${mat.duration}` : ''}</div>
                                    </div>
                                    <a href={mat.url} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-600)', textDecoration: 'none', padding: '4px 12px', background: 'var(--surface-2)', borderRadius: 999 }}>View</a>
                                  </div>
                                ))}
                              </div>
                            )}
                            {expandedMod === m.id && (!m.materials || m.materials.length === 0) && (
                              <div style={{ padding: '0 1rem 1rem 3rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>No resources uploaded yet.</div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── STUDENTS TAB ── */}
          {!isLoading && !error && tab === 'students' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {totalStudents === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No students enrolled yet.</div>
              ) : (
                Object.entries(PATH_CONFIG).map(([pathKey, pathCfg]) => {
                  const group = studentsByPath[pathKey] || [];
                  if (group.length === 0) return null;
                  return (
                    <div key={pathKey}>
                      {/* Path Header */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '1rem' }}>{pathCfg.emoji}</span>
                        <span style={{ fontWeight: 800, fontSize: '0.9375rem', color: pathCfg.color }}>{pathCfg.label}</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', background: 'var(--surface-2)', padding: '2px 8px', borderRadius: 999 }}>{group.length} student{group.length !== 1 ? 's' : ''}</span>
                      </div>

                      {/* Student Rows */}
                      <div style={{ background: 'var(--surface-0)', border: '1px solid var(--glass-border)', borderRadius: 12, overflow: 'hidden' }}>
                        {/* Table header */}
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 1fr', padding: '0.5rem 1rem', background: 'var(--surface-2)', fontSize: '0.6875rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                          <span>Student</span><span>Progress</span><span>Placement</span><span>Status</span>
                        </div>
                        {group.map(s => (
                          <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 1fr', padding: '0.75rem 1rem', borderTop: '1px solid var(--glass-border)', alignItems: 'center' }}>
                            <div>
                              <p style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--text-primary)', margin: 0 }}>{s.name}</p>
                              <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', margin: 0 }}>{s.email}</p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <div style={{ flex: 1, height: 5, background: 'var(--surface-3)', borderRadius: 999 }}>
                                <div style={{ height: '100%', background: s.progress >= 70 ? '#10b981' : s.progress >= 40 ? '#f59e0b' : '#ef4444', borderRadius: 999, width: `${s.progress}%` }} />
                              </div>
                              <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--text-secondary)', minWidth: 32 }}>{s.progress}%</span>
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{s.placement_score != null ? `${s.placement_score}%` : '—'}</span>
                            <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: s.status === 'On Track' ? '#10b981' : '#ef4444' }}>{s.status === 'On Track' ? '✅' : '⚠️'} {s.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── STUDENT VIEW ─────────────────────────────────────────────────────────────
function StudentView() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');

  const { data, isLoading } = useQuery({
    queryKey: ['enrolledCoursesData'],
    queryFn: async () => {
      const res = await coursesAPI.getEnrolledCourses();
      const enrolled = res.data;
      const statusMap = {};
      await Promise.all(
        enrolled.map(async (c) => {
          try {
            const st = await coursesAPI.getEnrollmentStatus(c.id);
            statusMap[c.id] = st.data;
          } catch (e) { /* ignore */ }
        })
      );
      return { enrolled, statusMap };
    }
  });

  const all = data?.enrolled || [];
  const statusMap = data?.statusMap || {};

  const filtered = filter === 'all' ? all
    : filter === 'completed' ? all.filter(c => (statusMap[c.id]?.progress_percentage || 0) >= 90)
    : all.filter(c => (statusMap[c.id]?.progress_percentage || 0) < 90 && (statusMap[c.id]?.progress_percentage || 0) > 0);

  const totalCompleted = all.filter(c => (statusMap[c.id]?.progress_percentage || 0) >= 90).length;

  if (isLoading) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading your courses...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Stats */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <StatBadge icon={BookOpen} label="Enrolled" value={all.length} color="var(--brand-500)" />
        <StatBadge icon={CheckCircle2} label="Completed" value={totalCompleted} color="#10b981" />
        <StatBadge icon={TrendingUp} label="In Progress" value={all.length - totalCompleted} color="#f59e0b" />
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
        {[['all', 'All Courses'], ['active', 'In Progress'], ['completed', 'Completed']].map(([key, label]) => (
          <button key={key} onClick={() => setFilter(key)} style={{ padding: '6px 18px', borderRadius: 999, border: 'none', fontWeight: 700, fontSize: '0.8125rem', cursor: 'pointer', background: filter === key ? 'var(--brand-500)' : 'var(--surface-2)', color: filter === key ? 'white' : 'var(--text-secondary)', transition: 'all 0.2s' }}>
            {label}
          </button>
        ))}
        <button onClick={() => navigate('/student/explore')} style={{ marginLeft: 'auto', padding: '6px 18px', borderRadius: 999, border: '1px solid var(--brand-300)', fontWeight: 700, fontSize: '0.8125rem', cursor: 'pointer', background: 'var(--brand-50)', color: 'var(--brand-700)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={14} /> Explore More
        </button>
      </div>

      {filtered.length === 0 ? (
        <div style={{ background: 'var(--surface-0)', border: '1px dashed var(--surface-3)', borderRadius: 24, padding: '4rem 2rem', textAlign: 'center' }}>
          <GraduationCap size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.5rem' }}>
            {filter === 'all' ? 'No courses enrolled yet' : `No ${filter} courses`}
          </h3>
          <button onClick={() => navigate('/student/explore')} style={{ marginTop: '1.5rem', background: 'var(--brand-500)', color: 'white', border: 'none', borderRadius: 12, padding: '12px 28px', fontWeight: 800, cursor: 'pointer' }}>
            Explore Courses
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {filtered.map(course => {
            const enr = statusMap[course.id];
            const path = enr?.learning_path || 'pending';
            const progress = enr?.progress_percentage || 0;
            const pathColor = { pending: '#f59e0b', basics: '#0891b2', intermediate: '#7c3aed', advanced: '#059669' }[path] || '#6b7280';
            const pathLabel = { pending: '⏳ Pending', basics: '🌱 Foundation', intermediate: '🚀 Core', advanced: '⚡ Expert' }[path] || path;
            return (
              <div
                key={course.id}
                onClick={() => navigate('/student/course/' + course.id)}
                style={{ background: 'var(--surface-0)', border: '1px solid var(--surface-3)', borderRadius: 20, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.25s', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 32px rgba(0,0,0,0.1)'; e.currentTarget.style.borderColor = 'var(--brand-300)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.04)'; e.currentTarget.style.borderColor = 'var(--surface-3)'; }}
              >
                <div style={{ height: 160, background: `linear-gradient(to bottom right, rgba(0,0,0,0.55), rgba(0,0,0,0.15)), url('${getTopicImage(course.title)}')`, backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'flex-end', padding: '1rem' }}>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 800, background: pathColor, color: 'white', padding: '3px 10px', borderRadius: 999, textTransform: 'uppercase' }}>{pathLabel}</span>
                </div>
                <div style={{ padding: '1.25rem' }}>
                  <p style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{course.title}</p>
                  {/* Progress Bar */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>Progress</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 900, color: pathColor }}>{Math.round(progress)}%</span>
                    </div>
                    <div style={{ height: 6, background: 'var(--surface-2)', borderRadius: 999 }}>
                      <div style={{ height: '100%', background: pathColor, borderRadius: 999, width: `${progress}%`, transition: 'width 0.5s ease' }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid var(--surface-2)' }}>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}><Play size={14} color="var(--brand-500)" /> Continue Learning</span>
                    <ArrowRight size={16} color="var(--brand-500)" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── TEACHER VIEW ─────────────────────────────────────────────────────────────
function TeacherView() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'mine'
  const [modalCourse, setModalCourse] = useState(null);
  const queryClient = useQueryClient();

  // Fetch ALL courses in the tenant (same data students see) so teachers can
  // manage any course, not just ones they personally created.
  const { data: allCourses = [], isLoading, error } = useQuery({
    queryKey: ['allTenantCourses', user?.tenant_id],
    queryFn: () => tenantsAPI.getCourses(user?.tenant_id).then(r => Array.isArray(r.data) ? r.data : r.data?.courses || [])
  });

  const publishMutation = useMutation({
    mutationFn: (courseId) => tenantsAPI.toggleCoursePublish(user?.tenant_id, courseId),
    onSuccess: () => { queryClient.invalidateQueries(['allTenantCourses', user?.tenant_id]); toast.success('Course status updated'); },
    onError: () => toast.error('Failed to update course')
  });

  const mineCourses = allCourses.filter(c => c.teacher_email === user?.email);
  const courses = filter === 'mine' ? mineCourses : allCourses;
  const filtered = courses.filter(c => !search || c.title?.toLowerCase().includes(search.toLowerCase()));
  const published = allCourses.filter(c => c.is_published).length;
  const totalStudents = allCourses.reduce((sum, c) => sum + (c.enrollments || 0), 0);

  if (isLoading) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading courses...</div>;
  if (error) return <div style={{ padding: '3rem', textAlign: 'center', color: '#ef4444' }}>Failed to load courses. {error.response?.data?.detail || error.message}</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Stats */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <StatBadge icon={Layers} label="All Courses" value={allCourses.length} color="var(--brand-500)" />
        <StatBadge icon={CheckCircle2} label="Published" value={published} color="#10b981" />
        <StatBadge icon={Clock} label="Drafts" value={allCourses.length - published} color="#f59e0b" />
        <StatBadge icon={Users} label="Total Enrollments" value={totalStudents} color="#8b5cf6" />
        <StatBadge icon={Award} label="My Courses" value={mineCourses.length} color="#0891b2" />
      </div>

      {/* Filter Tabs + Search */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {[['all', 'All Courses'], ['mine', 'My Courses']].map(([key, label]) => (
            <button key={key} onClick={() => setFilter(key)} style={{ padding: '6px 16px', borderRadius: 999, border: 'none', fontWeight: 700, fontSize: '0.8125rem', cursor: 'pointer', background: filter === key ? 'var(--brand-500)' : 'var(--surface-2)', color: filter === key ? 'white' : 'var(--text-secondary)', transition: 'all 0.2s' }}>
              {label}
            </button>
          ))}
        </div>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={filter === 'mine' ? 'Search your courses...' : 'Search all courses...'} style={{ width: '100%', padding: '0.625rem 1rem 0.625rem 2.5rem', borderRadius: 10, border: '1px solid var(--glass-border)', background: 'var(--surface-1)', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none' }} />
        </div>
        <button onClick={() => navigate('/teacher/studio')} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.625rem 1.25rem', borderRadius: 10, border: 'none', background: 'var(--brand-500)', color: 'white', fontWeight: 800, fontSize: '0.875rem', cursor: 'pointer' }}>
          <Plus size={16} /> New Course
        </button>
      </div>

      {/* Course List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', border: '1px dashed var(--glass-border)', borderRadius: 16 }}>
            {filter === 'mine'
              ? <>You haven't created any courses yet. <button onClick={() => navigate('/teacher/studio')} style={{ color: 'var(--brand-500)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Create one →</button></>
              : 'No courses found in this organization.'}
          </div>
        )}
        {filtered.map(course => (
          <div key={course.id} style={{ background: 'var(--surface-0)', border: '1px solid var(--glass-border)', borderRadius: 16, overflow: 'hidden' }}>
            {/* Course Header Row */}
            <div 
              style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', cursor: 'pointer', transition: 'background 0.15s' }}
              onClick={() => setModalCourse({ id: course.id, title: course.title })}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ width: 52, height: 52, borderRadius: 10, background: `url('${getTopicImage(course.title)}')`, backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <p style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.9375rem', marginBottom: 3 }}>{course.title}</p>
                  {course.teacher_email === user?.email && (
                    <span style={{ fontSize: '0.6875rem', fontWeight: 800, background: 'var(--brand-50)', color: 'var(--brand-700)', padding: '2px 8px', borderRadius: 999, border: '1px solid var(--brand-200)', flexShrink: 0 }}>Mine</span>
                  )}
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{course.teacher_name} • {course.description}</p>
              </div>
              {/* Metrics */}
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexShrink: 0 }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '0.625rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Students</p>
                  <p style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-primary)' }}>{course.enrollments || course.enrollment_count || 0}</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '0.625rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Modules</p>
                  <p style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-primary)' }}>{course.modules_count || 0}</p>
                </div>
                <StatusPill published={course.is_published} />
              </div>
              {/* Actions */}
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button
                  onClick={(e) => { e.stopPropagation(); publishMutation.mutate(course.id); }}
                  title={course.is_published ? 'Unpublish' : 'Publish'}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, border: 'none', background: course.is_published ? '#fff7ed' : '#ecfdf5', color: course.is_published ? '#d97706' : '#059669', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}>
                  {course.is_published ? <ToggleLeft size={14} /> : <ToggleRight size={14} />}
                  {course.is_published ? 'Unpublish' : 'Publish'}
                </button>
                <button onClick={(e) => { e.stopPropagation(); setModalCourse({ id: course.id, title: course.title }); }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, border: '1px solid var(--glass-border)', background: 'var(--surface-1)', color: 'var(--text-secondary)', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}>
                  <Eye size={14} /> Details
                </button>
                {course.teacher_email === user?.email && (
                  <button onClick={(e) => { e.stopPropagation(); navigate(`/teacher/studio`); }} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid var(--glass-border)', background: 'var(--surface-1)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <Edit size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalCourse && (
        <CourseDetailModal 
          courseId={modalCourse.id} 
          courseTitle={modalCourse.title} 
          onClose={() => setModalCourse(null)} 
        />
      )}
    </div>
  );
}

// ─── ORG ADMIN VIEW ───────────────────────────────────────────────────────────
function OrgAdminView() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [modalCourse, setModalCourse] = useState(null);

  const { data: courses = [], isLoading, error } = useQuery({
    queryKey: ['orgCourses', user.tenant_id],
    queryFn: async () => {
      // super_admin may not have a tenant_id — fall back to all-courses list
      if (!user.tenant_id) {
        const r = await coursesAPI.list();
        return r.data;
      }
      const r = await tenantsAPI.getCourses(user.tenant_id);
      return Array.isArray(r.data) ? r.data : r.data?.courses || [];
    }
  });

  const togglePublish = useMutation({
    mutationFn: ({ courseId }) => tenantsAPI.toggleCoursePublish(user.tenant_id, courseId),
    onSuccess: () => { queryClient.invalidateQueries(['orgCourses', user.tenant_id]); toast.success('Course status updated'); },
    onError: () => toast.error('Failed to update course')
  });

  const filtered = courses.filter(c => !search || c.title?.toLowerCase().includes(search.toLowerCase()));
  const published = courses.filter(c => c.is_published).length;
  const totalEnrollments = courses.reduce((sum, c) => sum + (c.enrollments || 0), 0);
  const avgCompletion = courses.length ? Math.round(courses.reduce((sum, c) => sum + (c.avg_completion || 0), 0) / courses.length) : 0;

  if (isLoading) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading courses...</div>;
  if (error) return <div style={{ padding: '3rem', textAlign: 'center', color: '#ef4444' }}>Failed to load courses. {error.response?.data?.detail || error.message}</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Stats */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <StatBadge icon={Layers} label="Total Courses" value={courses.length} color="var(--brand-500)" />
        <StatBadge icon={CheckCircle2} label="Published" value={published} color="#10b981" />
        <StatBadge icon={Clock} label="Drafts" value={courses.length - published} color="#f59e0b" />
        <StatBadge icon={Users} label="Total Enrollments" value={totalEnrollments} color="#8b5cf6" />
        <StatBadge icon={Target} label="Avg Completion" value={`${avgCompletion}%`} color="#0891b2" />
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search all courses in this organization..." style={{ width: '100%', padding: '0.625rem 1rem 0.625rem 2.5rem', borderRadius: 10, border: '1px solid var(--glass-border)', background: 'var(--surface-1)', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none' }} />
        </div>
        <button onClick={() => navigate('/teacher/courses/builder')} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.625rem 1.25rem', borderRadius: 10, border: 'none', background: 'var(--brand-500)', color: 'white', fontWeight: 800, fontSize: '0.875rem', cursor: 'pointer' }}>
          <Plus size={16} /> Create Course
        </button>
      </div>

      {/* Course Table */}
      <div style={{ background: 'var(--surface-0)', border: '1px solid var(--glass-border)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 1fr 1fr 0.8fr 0.8fr 1.5fr', padding: '0.75rem 1.25rem', background: 'var(--surface-2)', fontSize: '0.6875rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <span>Course</span>
          <span>Teacher</span>
          <span>Enrollments</span>
          <span>Avg Progress</span>
          <span>Category</span>
          <span>Status</span>
          <span style={{ textAlign: 'right' }}>Actions</span>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No courses found in this organization.</div>
        ) : filtered.map((c, i) => (
          <div key={c.id} style={{ borderTop: i === 0 ? 'none' : '1px solid var(--glass-border)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 1fr 1fr 0.8fr 0.8fr 1.5fr', padding: '1rem 1.25rem', alignItems: 'center', transition: 'background 0.15s', cursor: 'pointer' }}
              onClick={() => setModalCourse({ id: c.id, title: c.title })}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 44, height: 44, borderRadius: 8, background: `url('${getTopicImage(c.title)}')`, backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0 }} />
                <div>
                  <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{c.title}</p>
                  <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{c.description}</p>
                </div>
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{c.teacher_name || '—'}</p>
                <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{c.teacher_email || ''}</p>
              </div>
              <span style={{ fontWeight: 800, fontSize: '0.9375rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 5 }}><Users size={13} color="var(--text-muted)" /> {c.enrollments || 0}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1, height: 6, background: 'var(--surface-3)', borderRadius: 999 }}>
                  <div style={{ height: '100%', background: (c.avg_completion || 0) >= 60 ? '#10b981' : '#f59e0b', borderRadius: 999, width: `${c.avg_completion || 0}%` }} />
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', minWidth: 36 }}>{c.avg_completion || 0}%</span>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', background: 'var(--surface-2)', padding: '2px 8px', borderRadius: 6 }}>{c.category || 'General'}</span>
              <StatusPill published={c.is_published} />
              <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                <button onClick={(e) => { e.stopPropagation(); setModalCourse({ id: c.id, title: c.title }); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 7, border: '1px solid var(--glass-border)', background: 'var(--surface-1)', color: 'var(--text-secondary)', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}>
                  <Eye size={12} /> Details
                </button>
                <button onClick={(e) => { e.stopPropagation(); togglePublish.mutate({ courseId: c.id }); }}
                  style={{ padding: '5px 10px', borderRadius: 7, border: 'none', background: c.is_published ? '#fff7ed' : '#ecfdf5', color: c.is_published ? '#d97706' : '#059669', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}>
                  {c.is_published ? 'Unpublish' : 'Publish'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalCourse && (
        <CourseDetailModal 
          courseId={modalCourse.id} 
          courseTitle={modalCourse.title} 
          onClose={() => setModalCourse(null)} 
        />
      )}
    </div>
  );
}

// ─── MAIN UNIFIED COMPONENT ───────────────────────────────────────────────────
export default function CoursesHub() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const role = user?.role;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '0.5rem 0' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 4 }}>
            {role === 'student' && 'Track your enrolled courses, progress, and adaptive learning paths.'}
            {role === 'teacher' && 'Manage your courses, monitor student progress, and control publishing.'}
            {role === 'tenant_admin' && 'Full visibility into all courses across your organization — publish, monitor, and manage rosters.'}
          </p>
        </div>
      </div>

      {/* Role-Based View */}
      {role === 'student' && <StudentView />}
      {role === 'teacher' && <TeacherView />}
      {role === 'tenant_admin' && <OrgAdminView />}
      {role === 'super_admin' && <OrgAdminView />}
    </div>
  );
}
