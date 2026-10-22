import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ShieldCheck, AlertCircle, Camera, Mic, Eye, Clock, ChevronLeft, ChevronRight, 
  Activity, BrainCircuit, Trophy, ArrowRight, ShieldAlert, CheckCircle2, FileText, Lock, 
  Flag, Cloud, CloudOff, RefreshCw, Calculator, Edit3, X, AlignLeft, Volume2, Wifi, Map, Sword,
  BookOpen, Play, GraduationCap, Layers, Target, Sparkles, ChevronDown, ChevronUp, Calendar, LayoutGrid
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProctoring } from '../../hooks/useProctoring';
import { coursesAPI, cognitiveAPI, aiTutorAPI, academicAPI, proctoringAPI } from '../../services/api.service';
import PlacementAssessmentModal from './PlacementAssessmentModal';
import toast from 'react-hot-toast';

// ── Course Roadmap Modal ─────────────────────────────────────────────────────
function CourseRoadmapModal({ course, enrollment, onClose, onStartLearn }) {
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAssessment, setShowAssessment] = useState(false);
  const [assessmentConfig, setAssessmentConfig] = useState(null);
  const [expandedMod, setExpandedMod] = useState(0);

  const [passedLevels, setPassedLevels] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(`adaptive_level_passed_${course.id}`) || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    coursesAPI.getModules(course.id).then(res => {
      setModules(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [course.id]);

  useEffect(() => {
    const prog = enrollment?.progress_percentage || 0;
    setPassedLevels(prev => {
      const next = [...prev];
      if (prog >= 25 && !next.includes('fundamentals')) next.push('fundamentals');
      if (prog >= 50 && !next.includes('beginner')) next.push('beginner');
      if (prog >= 75 && !next.includes('intermediate')) next.push('intermediate');
      if (prog >= 100 && !next.includes('advanced')) next.push('advanced');
      return next;
    });
  }, [enrollment?.progress_percentage]);

  const isPending = enrollment?.learning_path === 'pending';
  const learningPath = enrollment?.learning_path || 'pending';
  const progress = enrollment?.progress_percentage || 0;

  const pathColors = { pending: '#f59e0b', basics: '#0891b2', intermediate: '#7c3aed', advanced: '#059669' };
  const pathLabels = { pending: '⏳ Assessment Pending', basics: '🌱 Foundation Path', intermediate: '🚀 Core Path', advanced: '⚡ Expert Path' };

  const levelOrder = ['fundamentals', 'beginner', 'intermediate', 'advanced'];
  const levelMeta = {
    fundamentals: { name: 'Fundamentals', badge: 'LEVEL 1', color: '#0891b2', bg: '#ecfeff', border: '#a5f3fc', icon: '🌱' },
    beginner: { name: 'Beginner', badge: 'LEVEL 2', color: '#059669', bg: '#ecfdf5', border: '#a7f3d0', icon: '🌿' },
    intermediate: { name: 'Intermediate', badge: 'LEVEL 3', color: '#7c3aed', bg: '#faf5ff', border: '#c4b5fd', icon: '🚀' },
    advanced: { name: 'Advanced', badge: 'LEVEL 4', color: '#ea580c', bg: '#fff7ed', border: '#fed7aa', icon: '⚡' },
  };
  const levelWeights = { fundamentals: 0, beginner: 1, basics: 1, intermediate: 2, advanced: 3 };
  const userWeight = levelWeights[learningPath] ?? 0;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: 840, maxHeight: '92vh', background: 'var(--surface-0)', borderRadius: 24, border: '1px solid var(--surface-3)', boxShadow: '0 32px 80px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'slideUp 0.3s ease' }}>
        
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', padding: '1.75rem 2rem', position: 'relative', flexShrink: 0 }}>
          <button onClick={onClose} style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
            <X size={18} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Course Roadmap & Level Tests</span>
          </div>
          <h2 style={{ fontSize: '1.625rem', fontWeight: 900, color: 'white', letterSpacing: '-0.02em', marginBottom: '0.75rem', lineHeight: 1.2 }}>{course.title}</h2>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: pathColors[learningPath] + '33', border: `1px solid ${pathColors[learningPath]}66`, borderRadius: 999, padding: '4px 12px', fontSize: '0.8125rem', fontWeight: 800, color: 'white' }}>
              {pathLabels[learningPath]}
            </span>
            <span style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{modules.length} modules</span>
            <span style={{ fontSize: '0.8125rem', color: '#10b981', fontWeight: 800, background: 'rgba(16,185,129,0.15)', padding: '4px 10px', borderRadius: 999 }}>
              🎯 {passedLevels.length}/4 Levels Mastered
            </span>
          </div>
        </div>

        {/* Placement Assessment Banner */}
        {isPending && (
          <div style={{ background: 'linear-gradient(90deg, #fef3c7, #fffbeb)', borderBottom: '1px solid #fde68a', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#fde68a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, animation: 'breathe 2s ease-in-out infinite' }}>🎯</div>
              <div>
                <p style={{ fontSize: '0.875rem', fontWeight: 800, color: '#92400e', margin: 0 }}>Take Your Placement Assessment</p>
                <p style={{ fontSize: '0.75rem', color: '#b45309', margin: 0 }}>Unlock your personalised learning path — only 5 questions</p>
              </div>
            </div>
            <button
              onClick={() => { setAssessmentConfig(null); setShowAssessment(true); }}
              style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8, background: '#d97706', color: 'white', border: 'none', borderRadius: 12, padding: '10px 20px', fontWeight: 800, fontSize: '0.875rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(217,119,6,0.3)' }}
            >
              <Target size={15} /> Start Assessment
            </button>
          </div>
        )}

        {/* Roadmap Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2rem' }} className="hide-scrollbar">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading roadmap...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              
              {levelOrder.map((lvl, lvlIdx) => {
                const meta = levelMeta[lvl];
                const lvlMods = modules.filter(m => m.level === lvl || (lvl === 'beginner' && m.level === 'basics'));
                if (lvlMods.length === 0) return null;

                const lvlTopics = lvlMods.map(m => m.title.replace(/^Module\s+\d+:\s*/i, ''));
                const modWeight = levelWeights[lvl] ?? 0;
                const prevLvl = lvlIdx > 0 ? levelOrder[lvlIdx - 1] : null;
                const isLevelLocked = isPending 
                  ? lvl !== 'fundamentals' 
                  : (modWeight > userWeight && (!prevLvl || !passedLevels.includes(prevLvl)));
                const isLvlPassed = passedLevels.includes(lvl);

                return (
                  <div key={lvl} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                    
                    {/* Level Group Header */}
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '0.75rem 1rem', borderRadius: 14,
                      background: isLvlPassed ? 'rgba(16,185,129,0.08)' : isLevelLocked ? 'var(--surface-1)' : meta.bg,
                      border: `1.5px solid ${isLvlPassed ? '#a7f3d0' : isLevelLocked ? 'var(--surface-3)' : meta.border}`
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: '1.25rem' }}>{meta.icon}</span>
                        <div>
                          <span style={{ fontSize: '0.6875rem', fontWeight: 900, color: meta.color, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                            {meta.badge}
                          </span>
                          <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                            {meta.name} ({lvlMods.length} Modules)
                          </h4>
                        </div>
                      </div>
                      
                      <div>
                        {isLvlPassed ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 999, background: '#10b981', color: 'white', fontSize: '0.75rem', fontWeight: 800 }}>
                            <CheckCircle2 size={13} /> Level Mastered
                          </span>
                        ) : isLevelLocked ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 999, background: 'var(--surface-2)', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 800 }}>
                            <Lock size={12} /> Locked
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 999, background: meta.color, color: 'white', fontSize: '0.75rem', fontWeight: 800 }}>
                            ⚡ In Progress
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Modules in this Level */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingLeft: '0.5rem' }}>
                      {lvlMods.map((mod) => {
                        const globalIndex = modules.findIndex(m => m.id === mod.id);
                        const isExpanded = expandedMod === globalIndex;
                        const materials = mod.materials || [];
                        return (
                          <div key={mod.id} style={{ background: 'var(--surface-0)', border: '1px solid var(--surface-3)', borderRadius: 14, overflow: 'hidden', opacity: isLevelLocked ? 0.65 : 1 }}>
                            <div onClick={() => !isLevelLocked && setExpandedMod(isExpanded ? -1 : globalIndex)} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.875rem 1.25rem', cursor: isLevelLocked ? 'not-allowed' : 'pointer', userSelect: 'none' }}>
                              <div style={{ width: 34, height: 34, borderRadius: 10, background: isLevelLocked ? 'var(--surface-2)' : meta.bg, border: `1.5px solid ${isLevelLocked ? 'var(--surface-3)' : meta.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 900, fontSize: '0.8125rem', color: isLevelLocked ? 'var(--text-muted)' : meta.color }}>
                                {isLevelLocked ? <Lock size={14} /> : globalIndex + 1}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{mod.title}</p>
                                <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', margin: 0, marginTop: 2 }}>{materials.length} learning materials</p>
                              </div>
                              {!isLevelLocked && (
                                <button onClick={e => { e.stopPropagation(); navigate(`/student/course/${course.id}?module=${mod.id}`); onClose(); }} style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5, background: meta.color, color: 'white', border: 'none', borderRadius: 8, padding: '6px 12px', fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer' }}>
                                  <Play size={12} /> Learn
                                </button>
                              )}
                              {!isLevelLocked && (isExpanded ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />)}
                            </div>

                            {/* Materials list */}
                            {isExpanded && !isLevelLocked && materials.length > 0 && (
                              <div style={{ borderTop: '1px solid var(--surface-2)', background: 'var(--surface-1)' }}>
                                {materials.map((mat, mi) => {
                                  const isYT = mat.material_type === 'youtube';
                                  const isPDF = mat.material_type === 'pdf';
                                  let isDone = false;
                                  try {
                                    const stored = localStorage.getItem(`adaptive_completed_${course.id}`);
                                    if (stored) isDone = JSON.parse(stored).includes(mat.id);
                                  } catch (e) {}

                                  return (
                                    <div key={mat.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1.25rem 0.875rem 3.75rem', borderBottom: mi < materials.length - 1 ? '1px solid var(--surface-2)' : 'none' }}>
                                      <div style={{ width: 28, height: 28, borderRadius: 6, background: isDone ? '#10b981' : isYT ? '#fee2e2' : isPDF ? '#e0f2fe' : 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        {isDone ? <CheckCircle2 size={14} color="white" /> : isYT ? <span style={{ fontSize: '0.75rem' }}>▶️</span> : isPDF ? <span style={{ fontSize: '0.75rem' }}>📄</span> : <Play size={12} color="var(--text-muted)" />}
                                      </div>
                                      <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: isDone ? 'line-through' : 'none' }}>{mat.title}</p>
                                        <p style={{ fontSize: '0.625rem', color: 'var(--text-muted)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{mat.material_type}</p>
                                      </div>
                                      {isYT && mat.s3_url && (
                                        <a href={mat.s3_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#dc2626', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
                                          YouTube ↗
                                        </a>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Level Mastery Test Checkpoint Node */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0.5rem 0 0.5rem', gap: '0.5rem' }}>
                      <div style={{ width: 2, height: 28, background: isLvlPassed ? '#10b981' : isLevelLocked ? 'var(--surface-3)' : meta.color }} />
                      
                      <div style={{
                        background: isLvlPassed 
                          ? 'linear-gradient(135deg, #ecfdf5, #d1fae5)'
                          : isLevelLocked 
                            ? 'var(--surface-1)' 
                            : 'linear-gradient(135deg, #ffffff, #f8fafc)',
                        border: `2px solid ${isLvlPassed ? '#10b981' : isLevelLocked ? 'var(--surface-3)' : meta.color}`,
                        borderRadius: 18,
                        padding: '1.25rem 1.5rem',
                        width: '100%',
                        boxShadow: isLevelLocked ? 'none' : isLvlPassed ? '0 4px 14px rgba(16,185,129,0.12)' : '0 6px 20px rgba(0,0,0,0.06)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.875rem',
                        transition: 'all 0.3s'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{
                              width: 44, height: 44, borderRadius: 12,
                              background: isLvlPassed ? '#10b981' : isLevelLocked ? 'var(--surface-2)' : meta.bg,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '1.25rem', flexShrink: 0,
                              color: isLvlPassed ? 'white' : isLevelLocked ? 'var(--text-muted)' : meta.color
                            }}>
                              {isLvlPassed ? '✅' : isLevelLocked ? '🔒' : '🎯'}
                            </div>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <p style={{ fontWeight: 900, fontSize: '0.9375rem', color: isLevelLocked ? 'var(--text-muted)' : 'var(--text-primary)', margin: 0 }}>
                                  Level {lvlIdx + 1} Milestone Test: {meta.name} Mastery
                                </p>
                                <span style={{ fontSize: '0.6875rem', fontWeight: 800, padding: '2px 8px', borderRadius: 6, background: isLvlPassed ? 'rgba(16,185,129,0.2)' : 'rgba(99,102,241,0.1)', color: isLvlPassed ? '#065f46' : '#4338ca' }}>
                                  🛡️ AI Proctored
                                </span>
                              </div>
                              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                                {isLvlPassed 
                                  ? `Level ${lvlIdx + 1} passed! Benchmark met (≥ 60%). Next level unlocked.` 
                                  : isLevelLocked 
                                    ? `Locked. Complete preceding Level ${lvlIdx} and pass its milestone test first.` 
                                    : `Evaluates your mastery of the completed topics above before unlocking Level ${lvlIdx + 2}.`}
                              </p>
                            </div>
                          </div>

                          {/* Action Button */}
                          <div>
                            {isLevelLocked ? (
                              <button disabled style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--surface-2)', color: 'var(--text-muted)', border: 'none', borderRadius: 10, padding: '8px 16px', fontWeight: 800, fontSize: '0.8125rem', cursor: 'not-allowed' }}>
                                <Lock size={13} /> Locked
                              </button>
                            ) : isLvlPassed ? (
                              <button
                                onClick={() => {
                                  setAssessmentConfig({
                                    level: lvl,
                                    levelTitle: `Level ${lvlIdx + 1} Assessment: ${meta.name} Mastery`,
                                    topics: lvlTopics
                                  });
                                  setShowAssessment(true);
                                }}
                                style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#10b981', color: 'white', border: 'none', borderRadius: 10, padding: '8px 16px', fontWeight: 800, fontSize: '0.8125rem', cursor: 'pointer', boxShadow: '0 2px 8px rgba(16,185,129,0.25)' }}
                              >
                                <CheckCircle2 size={13} /> Passed · Retake Test
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setAssessmentConfig({
                                    level: lvl,
                                    levelTitle: `Level ${lvlIdx + 1} Assessment: ${meta.name} Mastery`,
                                    topics: lvlTopics
                                  });
                                  setShowAssessment(true);
                                }}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: 7,
                                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                                  color: 'white', border: 'none', borderRadius: 10,
                                  padding: '9px 18px', fontWeight: 900, fontSize: '0.8125rem',
                                  cursor: 'pointer', boxShadow: '0 4px 14px rgba(79,70,229,0.3)',
                                  transition: 'transform 0.15s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                              >
                                <Target size={14} /> Take Level {lvlIdx + 1} Test
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Evaluated Topics badges */}
                        {lvlTopics.length > 0 && (
                          <div style={{ paddingTop: '0.625rem', borderTop: '1px solid var(--surface-2)', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                              Evaluated Topics:
                            </span>
                            {lvlTopics.map((tp, tpi) => (
                              <span key={tpi} style={{
                                fontSize: '0.6875rem', fontWeight: 700,
                                background: isLvlPassed ? 'rgba(16,185,129,0.1)' : 'var(--surface-2)',
                                color: isLvlPassed ? '#065f46' : 'var(--text-secondary)',
                                padding: '2px 8px', borderRadius: 6, border: '1px solid var(--surface-3)'
                              }}>
                                {tp}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}

              {/* Final Certification Exam node */}
              {(passedLevels.length >= 4 || progress >= 100) && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 0 0.5rem', gap: '0.75rem' }}>
                  <div style={{ width: 2, height: 40, background: 'linear-gradient(to bottom, var(--surface-3), #3b82f6)' }} />
                  <div style={{ background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', border: '2px solid #3b82f6', borderRadius: 18, padding: '1.5rem', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', boxShadow: '0 8px 24px rgba(59,130,246,0.15)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <span style={{ fontSize: '2rem' }}>🏆</span>
                      <div>
                        <p style={{ fontWeight: 900, fontSize: '1rem', color: '#1e40af', margin: 0 }}>Final Certification Exam</p>
                        <p style={{ fontSize: '0.8125rem', color: '#2563eb', margin: '2px 0 0' }}>All 4 levels mastered! Take the final comprehensive certification exam to graduate.</p>
                      </div>
                    </div>
                    <button onClick={onStartLearn} style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: 10, padding: '10px 20px', fontWeight: 800, fontSize: '0.875rem', cursor: 'pointer', flexShrink: 0, boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}>
                      Take Final Exam
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '1.25rem 2rem', borderTop: '1px solid var(--surface-3)', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexShrink: 0 }}>
          <button onClick={onClose} style={{ padding: '10px 20px', background: 'var(--surface-1)', border: '1px solid var(--surface-3)', borderRadius: 12, fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>Close</button>
          <button
            onClick={() => { navigate(`/student/course/${course.id}`); onClose(); }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: 'var(--brand-500)', color: 'white', border: 'none', borderRadius: 12, fontWeight: 800, fontSize: '0.875rem', cursor: 'pointer' }}
          >
            <Play size={15} /> Open Learning Canvas
          </button>
        </div>
      </div>

      {showAssessment && (
        <PlacementAssessmentModal
          course={course}
          startAtPhase={2}
          assessmentType={assessmentConfig ? 'level' : 'placement'}
          level={assessmentConfig?.level || 'fundamentals'}
          levelTitle={assessmentConfig?.levelTitle}
          topics={assessmentConfig?.topics || []}
          onLevelTestPass={(passedLvl, scr) => {
            setShowAssessment(false);
            setAssessmentConfig(null);
            setPassedLevels(prev => {
              const next = [...new Set([...prev, passedLvl])];
              try {
                localStorage.setItem(`adaptive_level_passed_${course.id}`, JSON.stringify(next));
              } catch (e) {}
              return next;
            });
            toast.success(`🎉 Level ${passedLvl} Test Passed with score ${scr}%! Next level unlocked.`);
          }}
          onPlacementComplete={(path) => {
            setShowAssessment(false);
            setAssessmentConfig(null);
            toast.success(`Learning path set: ${path}!`);
            onClose();
          }}
          onClose={() => {
            setShowAssessment(false);
            setAssessmentConfig(null);
          }}
        />
      )}

      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(32px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes breathe { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.06); } }
      `}</style>
    </div>
  );
}

export default function StudentExamArena() {
  const navigate = useNavigate();
  const { examId: routeExamId } = useParams();
  // State: 'list' -> 'lobby' -> 'active' -> 'submitted'
  const [examState, setExamState] = useState('list'); 
  const [selectedExam, setSelectedExam] = useState(null);

  // Enrolled courses
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [enrollments, setEnrollments] = useState({});
  const [selectedCourse, setSelectedCourse] = useState(null); // for roadmap modal
  
  // Weekly Assessments for enrolled courses
  const [weeklyExams, setWeeklyExams] = useState([]);
  const [weeklyLoading, setWeeklyLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'available' | 'weekly'
  const [weeklyLayout, setWeeklyLayout] = useState('carousel'); // 'carousel' | 'grid'
  const [weeklyCollapsed, setWeeklyCollapsed] = useState(false);

  const fetchWeeklyExams = useCallback(() => {
    setWeeklyLoading(true);
    academicAPI.getStudentWeeklyExams()
      .then(res => setWeeklyExams(res.data || []))
      .catch(err => console.error('Failed to load student weekly exams:', err))
      .finally(() => setWeeklyLoading(false));
  }, []);

  useEffect(() => {
    fetchWeeklyExams();
  }, [fetchWeeklyExams]);
  
  // Published Exam from Teacher Forge
  const [publishedExam, setPublishedExam] = useState(null);
  useEffect(() => {
    academicAPI.getPublishedExam().then(res => {
      if (res.data && res.data.title && res.data.title !== 'Global Question Bank' && Number(res.data.total_marks) > 0) {
        setPublishedExam(res.data);
      } else {
        setPublishedExam(null);
      }
    }).catch(() => {
      setPublishedExam(null);
    });
  }, []);
  
  // Exam progress state
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(0);
  const [syncState, setSyncState] = useState('saved'); // 'saved', 'syncing', 'error'
  
  // Security state
  const [focusWarning, setFocusWarning] = useState(false);
  const [keyWarning, setKeyWarning] = useState('');
  const [fsWarning, setFsWarning] = useState(false);

  // Violation tracking
  // Violation tracking
  const MAX_VIOLATIONS = 5;
  const [violationCount, setViolationCount] = useState(0);
  const violationCountRef = useRef(0);
  const [isAutoTerminated, setIsAutoTerminated] = useState(false);
  const [activeBanner, setActiveBanner] = useState(null); // { type, text, countdown, warningNum, maxWarnings }
  const violationTimerRef = useRef(null);
  const blurIntervalRef = useRef(null);
  const isTerminatingRef = useRef(false);
  const lastViolationTimeRef = useRef({});
  
  // Tools state
  const [showScratchpad, setShowScratchpad] = useState(false);
  const [scratchpadText, setScratchpadText] = useState('');
  const [showCalculator, setShowCalculator] = useState(false);
  
  // Lobby state
  const [hardwareChecked, setHardwareChecked] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // References
  const videoRef = useRef(null);
  const hudVideoRef = useRef(null);
  const streamRef = useRef(null);
  const [mediaStream, setMediaStream] = useState(null);
  const autoSubmittedRef = useRef(false);
  const submitExamRef = useRef(null);
  const handleViolationRef = useRef(null);

  // Submit Exam handler
  const submitExam = useCallback(async (options = {}) => {
    if (examState === 'submitted' || autoSubmittedRef.current) return;
    autoSubmittedRef.current = true;
    setExamState('submitted');
    try { if (document.fullscreenElement && document.exitFullscreen) await document.exitFullscreen(); } catch (err) {}

    const isTerminated = options?.autoTerminated || (violationCountRef.current >= MAX_VIOLATIONS);
    if (isTerminated) setIsAutoTerminated(true);

    const cheatScore = options?.forcedCheatScore !== undefined 
      ? options.forcedCheatScore 
      : (isTerminated ? 100 : Math.min(100, (violationCountRef.current || 0) * 20));

    const totalQ = questions.length || 1;
    let correctMarks = 0;
    Object.entries(answers).forEach(([qi, ans]) => {
      const q = questions[parseInt(qi)];
      const answerLetter = String.fromCharCode(65 + ans);
      if (q && q.correct_answer === answerLetter) {
        correctMarks += q.marks || 1;
      }
    });

    try {
      const examId = selectedExam?.id || 1;
      await academicAPI.submitExam(examId, {
        answers,
        score: correctMarks,
        cheat_risk_score: cheatScore,
      });

      if (isTerminated) {
        toast.error("Test auto-submitted due to 5 proctoring warnings (Review recorded).", { duration: 6000 });
      } else {
        toast.success("Exam submitted successfully!");
      }

      await cognitiveAPI.evaluate({
        event: isTerminated ? 'Exam Auto-Terminated (Proctoring)' : 'Exam Completed',
        score: Math.round((correctMarks / (selectedExam?.total_marks || 100)) * 100),
        topic: selectedExam?.title || 'Exam',
        total_questions: totalQ,
        correct_answers: Object.keys(answers).length,
        flagged_questions: flagged.size,
        time_taken_seconds: (selectedExam?.duration_minutes || 45) * 60 - timeLeft,
      });

      fetchWeeklyExams();
    } catch (err) {
      console.warn('Could not update profile or submit exam:', err);
    }
  }, [examState, questions, answers, selectedExam, flagged, timeLeft, fetchWeeklyExams]);

  useEffect(() => {
    submitExamRef.current = submitExam;
  }, [submitExam]);

  // Centralized Violation Handler
  const handleViolation = useCallback((violationType, description, snapshot = null) => {
    if (examState !== 'active' || isTerminatingRef.current) return;

    // Debounce duplicate violation type within 2.5s
    const now = Date.now();
    const lastTime = lastViolationTimeRef.current[violationType] || 0;
    if (now - lastTime < 2500) return;
    lastViolationTimeRef.current[violationType] = now;

    // Capture snapshot from webcam frame if not provided
    let capturedSnapshot = snapshot;
    if (!capturedSnapshot && hudVideoRef.current && hudVideoRef.current.videoWidth) {
      try {
        const c = document.createElement('canvas');
        c.width = 320;
        c.height = 240;
        const ctx = c.getContext('2d');
        ctx.drawImage(hudVideoRef.current, 0, 0, 320, 240);
        capturedSnapshot = c.toDataURL('image/jpeg', 0.6);
      } catch (e) {}
    }

    violationCountRef.current = (violationCountRef.current || 0) + 1;
    const nextCount = violationCountRef.current;
    setViolationCount(nextCount);

    if (nextCount < MAX_VIOLATIONS) {
      const riskScore = Math.min(100, nextCount * 20);
      proctoringAPI.logViolation({
        exam_id: selectedExam?.id || 1,
        violation_type: violationType,
        severity: nextCount >= 3 ? 'high' : 'medium',
        description: `Warning ${nextCount}/${MAX_VIOLATIONS}: ${description}`,
        cumulative_risk_score: riskScore,
        screenshot: capturedSnapshot,
      }).catch(err => console.error('Failed to log proctoring violation:', err));

      toast.error(`⚠️ Warning ${nextCount}/${MAX_VIOLATIONS}: ${description}`, {
        id: 'proctor-warn-toast',
        duration: 4000,
      });

      let countdown = 5;
      setActiveBanner({
        type: violationType,
        text: description,
        warningNum: nextCount,
        maxWarnings: MAX_VIOLATIONS,
        countdown,
      });

      if (violationTimerRef.current) clearInterval(violationTimerRef.current);
      violationTimerRef.current = setInterval(() => {
        countdown -= 1;
        setActiveBanner(b => (b && b.type !== 'terminated' ? { ...b, countdown } : null));
        if (countdown <= 0) {
          clearInterval(violationTimerRef.current);
          setActiveBanner(null);
        }
      }, 1000);
    } else {
      // 5 WARNINGS REACHED: AUTO-TERMINATE THE TEST IMMEDIATELY!
      isTerminatingRef.current = true;
      setIsAutoTerminated(true);
      if (violationTimerRef.current) clearInterval(violationTimerRef.current);
      if (blurIntervalRef.current) clearInterval(blurIntervalRef.current);

      proctoringAPI.logViolation({
        exam_id: selectedExam?.id || 1,
        violation_type: 'exam_terminated',
        severity: 'critical',
        description: `Maximum warnings limit reached (5/5). Exam automatically terminated. Final violation: ${description}`,
        cumulative_risk_score: 100,
        screenshot: capturedSnapshot,
      }).catch(err => console.error('Failed to log termination:', err));

      toast.error('🚨 MAXIMUM WARNINGS EXCEEDED (5/5). Test automatically ended!', {
        id: 'proctor-term-toast',
        duration: 6000,
      });

      setActiveBanner({
        type: 'terminated',
        text: '5 Proctoring Warnings Exceeded — Test Automatically Ended',
        countdown: 0,
      });

      setTimeout(() => {
        if (submitExamRef.current) {
          submitExamRef.current({
            autoTerminated: true,
            reason: 'Excessive proctoring violations (5 warnings exceeded)',
            forcedCheatScore: 100,
          });
        }
      }, 1200);
    }
  }, [examState, selectedExam]);

  useEffect(() => {
    handleViolationRef.current = handleViolation;
  }, [handleViolation]);

  // Hook into Proctoring Engine
  const proctoring = useProctoring({
    onViolation: (type, desc, snapshot) => {
      if (handleViolationRef.current) {
        handleViolationRef.current(type, desc, snapshot);
      }
    }
  });

  // Load enrolled courses + their enrollment status
  useEffect(() => {
    coursesAPI.getEnrolledCourses().then(res => {
      setEnrolledCourses(res.data || []);
      (res.data || []).forEach(course => {
        coursesAPI.getEnrollmentStatus(course.id).then(er => {
          setEnrollments(prev => ({ ...prev, [course.id]: er.data }));
        }).catch(() => {});
      });
    }).catch(() => {});
  }, []);

  // Timer logic
  useEffect(() => {
    if (examState !== 'active') return;
    const t = setInterval(() => setTimeLeft(s => Math.max(s - 1, 0)), 1000);
    return () => clearInterval(t);
  }, [examState]);

  // Focus tracking (Tab switch & Window Defocus with persistent repeat warnings)
  useEffect(() => {
    if (examState !== 'active') {
      if (blurIntervalRef.current) clearInterval(blurIntervalRef.current);
      return;
    }

    const onBlur = () => {
      setFocusWarning(true);
      if (handleViolationRef.current) {
        handleViolationRef.current('tab_switch', 'Tab switch or window defocus detected');
      }
      if (blurIntervalRef.current) clearInterval(blurIntervalRef.current);
      blurIntervalRef.current = setInterval(() => {
        if (document.hidden || !document.hasFocus()) {
          if (handleViolationRef.current) {
            handleViolationRef.current('tab_switch', 'Continued absence from exam tab');
          }
        } else {
          clearInterval(blurIntervalRef.current);
        }
      }, 4000);
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        setFocusWarning(true);
        if (handleViolationRef.current) {
          handleViolationRef.current('tab_switch', 'Navigated away from assessment tab');
        }
        if (blurIntervalRef.current) clearInterval(blurIntervalRef.current);
        blurIntervalRef.current = setInterval(() => {
          if (document.hidden) {
            if (handleViolationRef.current) {
              handleViolationRef.current('tab_switch', 'Continued absence from exam tab');
            }
          } else {
            clearInterval(blurIntervalRef.current);
          }
        }, 4000);
      } else {
        setFocusWarning(false);
        if (blurIntervalRef.current) clearInterval(blurIntervalRef.current);
      }
    };

    const onFocus = () => {
      setFocusWarning(false);
      if (blurIntervalRef.current) clearInterval(blurIntervalRef.current);
    };

    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      if (blurIntervalRef.current) clearInterval(blurIntervalRef.current);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [examState]);

  // Key Blocker
  useEffect(() => {
    if (examState !== 'active') return;
    const onKeyDown = (e) => {
      if (e.key.match(/^F(1[0-2]|[1-9])$/) || (e.altKey && e.key === 'Tab')) {
        e.preventDefault();
        setKeyWarning(`Action Blocked: ${e.key} key is not allowed.`);
        setTimeout(() => setKeyWarning(''), 5000);
        if (handleViolationRef.current) {
          handleViolationRef.current('forbidden_key', `Prohibited shortcut attempt: ${e.key}`);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [examState]);

  // Fullscreen Exit Warning
  useEffect(() => {
    if (examState !== 'active') return;
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setFsWarning(true);
        if (handleViolationRef.current) {
          handleViolationRef.current('screen_resize', 'Exited fullscreen examination mode');
        }
      }
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, [examState]);

  // Webcam access & Proctoring Lifecycle
  useEffect(() => {
    if (examState === 'list' || examState === 'submitted') {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        setMediaStream(null);
        setHardwareChecked(false);
      }
      proctoring.stopTracking();
    } else if (!mediaStream) {
      navigator.mediaDevices?.getUserMedia({ video: true })
        .then(stream => {
          streamRef.current = stream;
          setMediaStream(stream);
          setHardwareChecked(true);
        })
        .catch(err => {
          console.log('Webcam access denied.', err);
          setHardwareChecked(true); 
        });
    }
  }, [examState, mediaStream, proctoring.stopTracking]);

  // Global Unmount cleanup for webcam
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Start proctoring when active
  useEffect(() => {
    if (examState === 'active' && mediaStream && hudVideoRef.current) {
      if (hudVideoRef.current.srcObject !== mediaStream) {
        hudVideoRef.current.srcObject = mediaStream;
      }
      proctoring.startTracking(hudVideoRef.current, selectedExam?.id || 1);
    }
  }, [examState, mediaStream, proctoring.status, proctoring.startTracking, selectedExam]);

  // Mock Cloud Sync
  const handleAnswerChange = (val) => {
    setAnswers(prev => ({ ...prev, [current]: val }));
    setSyncState('syncing');
    setTimeout(() => setSyncState('saved'), 800);
  };

  const toggleFlag = () => {
    setFlagged(prev => {
      const next = new Set(prev);
      if (next.has(current)) next.delete(current);
      else next.add(current);
      return next;
    });
  };

  const startLobby = async (exam) => {
    try { if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen(); } catch (err) {}
    setSelectedExam(exam);
    setTimeLeft((exam.duration_minutes || 45) * 60);
    setExamState('lobby');
    setQuestions(exam.questions || []);
    setViolationCount(0);
    violationCountRef.current = 0;
    isTerminatingRef.current = false;
    autoSubmittedRef.current = false;
    setIsAutoTerminated(false);
    lastViolationTimeRef.current = {};
    if (blurIntervalRef.current) clearInterval(blurIntervalRef.current);
    if (violationTimerRef.current) clearInterval(violationTimerRef.current);
    setActiveBanner(null);
    proctoring.resetWarnings?.();
  };

  // Auto-launch if routeExamId is provided in URL
  useEffect(() => {
    if (routeExamId) {
      academicAPI.getExamById(routeExamId)
        .then(res => {
          if (res.data) {
            startLobby(res.data);
          }
        })
        .catch(err => {
          console.error('Failed to load exam by ID:', err);
          toast.error('Could not load weekly assessment');
        });
    }
  }, [routeExamId]);

  const exitToList = async () => {
    try { if (document.fullscreenElement && document.exitFullscreen) await document.exitFullscreen(); } catch (err) {}
    setExamState('list');
  };

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const ss = String(timeLeft % 60).padStart(2, '0');
  const isLow = timeLeft < 10 * 60;
  const q = questions[current];
  const answeredCount = Object.keys(answers).length;
  const isFullScreen = examState !== 'list';



  // Basic mock score calculation
  const score = Object.keys(answers).reduce((acc, key) => {
    const q = questions[key];
    if (q.type === 'mcq') return acc + (answers[key] === q.correct ? 1 : 0);
    if (q.type === 'text') return acc + 1;
    return acc;
  }, 0);

  return (
    <div style={isFullScreen ? { 
      position: 'fixed', inset: 0, background: 'var(--surface-1)', zIndex: 100, display: 'flex', flexDirection: 'column', fontFamily: 'inherit' 
    } : { 
      flex: 1, display: 'flex', flexDirection: 'column', fontFamily: 'inherit', minHeight: '100%', position: 'relative'
    }}>

      {/* ── Focus & Security Warnings ── */}
      {focusWarning && examState === 'active' && (
        <div style={{ background: '#ef4444', color: 'white', padding: '0.625rem 2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 700, animation: 'slideDown 0.3s ease' }}>
          <AlertCircle size={16} /> Focus Warning: You navigated away. This has been recorded.
        </div>
      )}
      {keyWarning && examState === 'active' && (
        <div style={{ background: '#f59e0b', color: 'white', padding: '0.625rem 2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 700, animation: 'slideDown 0.3s ease' }}>
          <AlertCircle size={16} /> {keyWarning}
        </div>
      )}
      {fsWarning && examState === 'active' && (
        <div style={{ background: '#ef4444', color: 'white', padding: '0.625rem 2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 700, animation: 'slideDown 0.3s ease' }}>
          <ShieldAlert size={16} /> Security Warning: Fullscreen mode was exited during the exam!
        </div>
      )}

      {/* ── Top Status Bar ── */}
      {isFullScreen && (
        <div style={{ background: 'var(--surface-0)', borderBottom: '1px solid var(--surface-3)', padding: '0.75rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--brand-500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={18} color="white" />
              </div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                {selectedExam?.title}
              </h2>
            </div>
            
            {(examState === 'active' || examState === 'lobby') && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '1rem', paddingLeft: '1.5rem', borderLeft: '1px solid var(--surface-3)' }}>
                {[
                  { Icon: Camera, label: 'Webcam', active: hardwareChecked },
                  { Icon: Mic,    label: 'Audio', active: true },
                  { Icon: Eye,    label: 'Screen', active: true },
                ].map(({ Icon, label, active }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 8px', background: active ? 'rgba(16,185,129,0.1)' : 'var(--surface-2)', borderRadius: 6, transition: 'background 0.3s' }}>
                    <Icon size={13} color={active ? '#10b981' : 'var(--text-muted)'} />
                    <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: active ? '#10b981' : 'var(--text-muted)', textTransform: 'uppercase' }}>{label}</span>
                  </div>
                ))}

                {examState === 'active' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: violationCount === 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.15)', border: `1px solid ${violationCount === 0 ? 'rgba(16,185,129,0.3)' : '#ef4444'}`, borderRadius: 999, marginLeft: '0.5rem' }}>
                    <ShieldAlert size={14} color={violationCount === 0 ? '#10b981' : '#ef4444'} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: violationCount === 0 ? '#10b981' : '#ef4444' }}>
                      {violationCount === 0 ? 'Proctor: 0/5 Warnings' : `Proctor: ${violationCount}/5 Warnings`}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            {examState === 'active' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: syncState === 'saved' ? '#10b981' : 'var(--text-muted)' }}>
                   {syncState === 'saved' ? <Cloud size={16} /> : <RefreshCw size={16} className="spin" />}
                   <span style={{ fontSize: '0.8125rem', fontWeight: 700 }}>{syncState === 'saved' ? 'Saved to Cloud' : 'Syncing...'}</span>
                </div>
                <div style={{ width: 1, height: 24, background: 'var(--surface-3)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: isLow ? 'rgba(239,68,68,0.1)' : 'var(--surface-2)', borderRadius: 8 }}>
                  <Clock size={16} color={isLow ? '#ef4444' : 'var(--text-primary)'} />
                  <span style={{ fontSize: '1.125rem', fontWeight: 900, color: isLow ? '#ef4444' : 'var(--text-primary)', letterSpacing: '0.04em', fontVariantNumeric: 'tabular-nums' }}>
                    {mm}:{ss}
                  </span>
                </div>
              </>
            )}
            {examState === 'lobby' && <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-secondary)' }}>Pre-Exam Verification</span>}
            {examState === 'submitted' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#10b981' }}>
                <ShieldCheck size={18} />
                <span style={{ fontSize: '0.875rem', fontWeight: 800 }}>Exam Secured & Submitted</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── LIST STATE: Immersive Level Select ── */}
      {examState === 'list' && (
          <div style={{ flex: 1, overflowY: 'auto', background: 'var(--surface-1)', position: 'relative' }} className="hide-scrollbar">

            {/* ── Top Header & Tab Controls ── */}
            <div style={{ padding: '1.75rem 3rem 1.25rem', borderBottom: '1px solid var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', background: 'var(--surface-0)', position: 'sticky', top: 0, zIndex: 10, backdropFilter: 'blur(8px)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 12, background: 'var(--brand-50)', border: '1px solid var(--brand-200)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={22} color="var(--brand-600)" />
                </div>
                <div>
                  <h1 style={{ fontSize: '1.375rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                    Exam Arena
                  </h1>
                  <p style={{ margin: '2px 0 0', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    Certification exams, course learning roadmaps, and mandatory weekly evaluations.
                  </p>
                </div>
              </div>

              {/* Navigation Segmented Tabs */}
              <div style={{ display: 'flex', background: 'var(--surface-1)', padding: 4, borderRadius: 12, border: '1px solid var(--surface-3)', gap: 4 }}>
                <button
                  onClick={() => setActiveTab('all')}
                  style={{
                    padding: '7px 15px',
                    borderRadius: 8,
                    border: 'none',
                    background: activeTab === 'all' ? 'var(--surface-0)' : 'transparent',
                    color: activeTab === 'all' ? 'var(--brand-600)' : 'var(--text-secondary)',
                    fontWeight: 800,
                    fontSize: '0.8125rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', gap: 6,
                    boxShadow: activeTab === 'all' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
                  }}
                >
                  <Layers size={14} /> All Assessments
                </button>

                <button
                  onClick={() => setActiveTab('available')}
                  style={{
                    padding: '7px 15px',
                    borderRadius: 8,
                    border: 'none',
                    background: activeTab === 'available' ? 'var(--surface-0)' : 'transparent',
                    color: activeTab === 'available' ? 'var(--brand-600)' : 'var(--text-secondary)',
                    fontWeight: 800,
                    fontSize: '0.8125rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', gap: 6,
                    boxShadow: activeTab === 'available' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
                  }}
                >
                  <BookOpen size={14} /> Available Exams
                </button>

                <button
                  onClick={() => setActiveTab('weekly')}
                  style={{
                    padding: '7px 15px',
                    borderRadius: 8,
                    border: 'none',
                    background: activeTab === 'weekly' ? 'var(--surface-0)' : 'transparent',
                    color: activeTab === 'weekly' ? 'var(--brand-600)' : 'var(--text-secondary)',
                    fontWeight: 800,
                    fontSize: '0.8125rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', gap: 6,
                    boxShadow: activeTab === 'weekly' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
                  }}
                >
                  <Calendar size={14} /> Weekly Assessments
                  {weeklyExams.length > 0 && (
                    <span style={{
                      fontSize: '0.6875rem', fontWeight: 900,
                      background: weeklyExams.some(w => !w.has_attended) ? '#f59e0b' : '#10b981',
                      color: 'white',
                      padding: '1px 6px', borderRadius: 999
                    }}>
                      {weeklyExams.filter(w => !w.has_attended).length > 0
                        ? `${weeklyExams.filter(w => !w.has_attended).length} Pending`
                        : `${weeklyExams.length}`}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* ── Mandatory Weekly Assessments Section ── */}
            {(activeTab === 'all' || activeTab === 'weekly') && (
              <div style={{ position: 'relative', zIndex: 1, padding: activeTab === 'weekly' ? '2rem 3rem 1.5rem' : '1.75rem 3rem 0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                      <Calendar size={17} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <h2 style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
                          Mandatory Course Weekly Assessments
                        </h2>
                        <span style={{ fontSize: '0.6875rem', fontWeight: 900, textTransform: 'uppercase', background: 'rgba(245,158,11,0.12)', color: '#d97706', padding: '2px 7px', borderRadius: 6, letterSpacing: '0.05em' }}>
                          Attendance Monitored
                        </span>
                      </div>
                      <p style={{ margin: '2px 0 0', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                        Instructor evaluations with automated proctoring & attendance verification.
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                      {weeklyExams.filter(w => w.has_attended).length} / {weeklyExams.length} Attended
                    </span>

                    {/* Layout Controls (Only in 'all' view with multiple exams) */}
                    {activeTab === 'all' && weeklyExams.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--surface-0)', border: '1px solid var(--surface-3)', borderRadius: 10, padding: 3 }}>
                        <button
                          onClick={() => setWeeklyLayout(weeklyLayout === 'carousel' ? 'grid' : 'carousel')}
                          title={weeklyLayout === 'carousel' ? "Switch to Grid View" : "Switch to Single-Row Carousel"}
                          style={{
                            padding: '4px 8px', borderRadius: 6, border: 'none',
                            background: 'transparent', color: 'var(--text-secondary)',
                            fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 4
                          }}
                        >
                          <LayoutGrid size={13} /> {weeklyLayout === 'carousel' ? 'Grid' : 'Row'}
                        </button>
                        <div style={{ width: 1, height: 16, background: 'var(--surface-3)' }} />
                        <button
                          onClick={() => setWeeklyCollapsed(!weeklyCollapsed)}
                          title={weeklyCollapsed ? "Expand Section" : "Collapse Section"}
                          style={{
                            padding: '4px 8px', borderRadius: 6, border: 'none',
                            background: 'transparent', color: 'var(--text-secondary)',
                            fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 4
                          }}
                        >
                          {weeklyCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                          {weeklyCollapsed ? 'Expand' : 'Collapse'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {weeklyCollapsed ? (
                  <div
                    onClick={() => setWeeklyCollapsed(false)}
                    style={{
                      background: 'var(--surface-0)', border: '1px dashed var(--surface-3)', borderRadius: 14,
                      padding: '10px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      cursor: 'pointer', marginBottom: '1.25rem', transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--brand-400)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--surface-3)'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
                      <Calendar size={15} color="#f59e0b" />
                      <span>{weeklyExams.length} weekly assessments scheduled ({weeklyExams.filter(w => w.has_attended).length} completed)</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--brand-600)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      Show Assessments <ChevronDown size={14} />
                    </span>
                  </div>
                ) : weeklyLoading ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <RefreshCw size={24} className="spin" style={{ margin: '0 auto 8px' }} />
                    <p style={{ fontSize: '0.875rem' }}>Loading course weekly assessments...</p>
                  </div>
                ) : weeklyExams.length === 0 ? (
                  <div style={{ background: 'var(--surface-0)', border: '1px dashed var(--surface-3)', borderRadius: 16, padding: '1.5rem', textAlign: 'center', marginBottom: '1.5rem' }}>
                    <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                      No weekly assessments scheduled for your enrolled courses yet.
                    </p>
                  </div>
                ) : (
                  <div style={
                    activeTab === 'all' && weeklyLayout === 'carousel' ? {
                      display: 'flex',
                      gap: '1.25rem',
                      overflowX: 'auto',
                      paddingBottom: '0.75rem',
                      marginBottom: '1.5rem'
                    } : {
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                      gap: '1.25rem',
                      marginBottom: '1.5rem'
                    }
                  } className="hide-scrollbar">
                    {weeklyExams.map(exam => {
                      const isAttended = exam.has_attended;
                      const percent = exam.percentage !== undefined ? exam.percentage : (exam.total_marks > 0 ? Math.round((exam.student_score / exam.total_marks) * 100) : 0);
                      return (
                        <div
                          key={exam.id}
                          style={{
                            width: (activeTab === 'all' && weeklyLayout === 'carousel') ? 340 : 'auto',
                            minWidth: (activeTab === 'all' && weeklyLayout === 'carousel') ? 340 : 'auto',
                            flexShrink: 0,
                            background: 'var(--surface-0)',
                            borderRadius: 18,
                            border: isAttended ? '1px solid var(--surface-3)' : '2px solid rgba(245,158,11,0.4)',
                            padding: '1.25rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.75rem',
                            boxShadow: isAttended ? '0 4px 14px rgba(0,0,0,0.03)' : '0 6px 20px rgba(245,158,11,0.1)',
                            position: 'relative',
                            overflow: 'hidden'
                          }}
                        >
                          {/* Status bar top indicator */}
                          <div style={{ height: 4, width: '100%', position: 'absolute', top: 0, left: 0, background: isAttended ? '#10b981' : 'linear-gradient(90deg, #f59e0b, #ef4444)' }} />

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                                <span style={{ fontSize: '0.6875rem', fontWeight: 900, textTransform: 'uppercase', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', padding: '2px 7px', borderRadius: 5 }}>
                                  Week {exam.week_number}
                                </span>
                                <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                                  {exam.course_code || 'COURSE'}
                                </span>
                              </div>
                              <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {exam.title}
                              </h3>
                              <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {exam.course_title}
                              </p>
                            </div>

                            {isAttended ? (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '3px 8px', borderRadius: 999, fontSize: '0.6875rem', fontWeight: 800, flexShrink: 0 }}>
                                <CheckCircle2 size={12} /> Attended
                              </span>
                            ) : (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '3px 8px', borderRadius: 999, fontSize: '0.6875rem', fontWeight: 800, flexShrink: 0 }}>
                                <Clock size={12} /> Mandatory
                              </span>
                            )}
                          </div>

                          {exam.description && (
                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {exam.description}
                            </p>
                          )}

                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>
                            <span style={{ background: 'var(--surface-1)', padding: '2px 6px', borderRadius: 5, fontWeight: 700 }}>
                              ⏱️ {exam.duration_minutes}m
                            </span>
                            <span style={{ background: 'var(--surface-1)', padding: '2px 6px', borderRadius: 5, fontWeight: 700 }}>
                              📝 {exam.question_count}Q
                            </span>
                            <span style={{ background: 'var(--surface-1)', padding: '2px 6px', borderRadius: 5, fontWeight: 700 }}>
                              🏆 {exam.total_marks} Marks
                            </span>
                            {exam.proctoring_enabled && (
                              <span style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '2px 6px', borderRadius: 5, fontWeight: 800 }}>
                                🛡️ Proctored
                              </span>
                            )}
                          </div>

                          {/* Attendance / Score footer */}
                          <div style={{ marginTop: 'auto', paddingTop: '0.625rem', borderTop: '1px solid var(--surface-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            {isAttended ? (
                              <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#10b981' }}>
                                Score: {exam.student_score} / {exam.total_marks} ({percent}%)
                              </span>
                            ) : (
                              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f59e0b' }}>
                                Not Recorded
                              </span>
                            )}

                            {isAttended ? (
                              <button
                                onClick={() => startLobby(exam)}
                                style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 8, background: 'var(--surface-2)', border: '1px solid var(--surface-3)', color: 'var(--text-primary)', fontWeight: 800, fontSize: '0.6875rem', cursor: 'pointer' }}
                              >
                                Retake / Review
                              </button>
                            ) : (
                              <button
                                onClick={() => startLobby(exam)}
                                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 8, background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', border: 'none', fontWeight: 900, fontSize: '0.75rem', cursor: 'pointer', boxShadow: '0 3px 10px rgba(217,119,6,0.3)', transition: 'transform 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                              >
                                Take Assessment <ArrowRight size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── My Courses Section ── */}
            {(activeTab === 'all' || activeTab === 'available') && (
              <div style={{ position: 'relative', zIndex: 1, padding: activeTab === 'available' ? '2rem 3rem 1.5rem' : '0.5rem 3rem 1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.25rem' }}>
                  <BookOpen size={18} color="var(--brand-500)" />
                  <h2 style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>Available Exams</h2>
                </div>

              {publishedExam && publishedExam.title && publishedExam.title !== 'Global Question Bank' && Number(publishedExam.total_marks) > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2rem' }}>
                    <div
                      onClick={() => startLobby(publishedExam)}
                      style={{ background: 'var(--surface-0)', border: '2px solid var(--brand-500)', borderRadius: 24, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.3s', boxShadow: '0 8px 24px rgba(16,185,129,0.15)' }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(16,185,129,0.2)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(16,185,129,0.15)'; }}
                    >
                      <div style={{ height: 180, background: `linear-gradient(to bottom right, rgba(16,185,129,0.8), rgba(6,78,59,0.9))`, display: 'flex', alignItems: 'flex-end', padding: '1.25rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, background: 'white', color: '#064e3b', padding: '4px 12px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Official Exam
                        </span>
                      </div>
                      <div style={{ padding: '1.5rem' }}>
                        <p style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '1rem', lineHeight: 1.3 }}>{publishedExam.title}</p>
                        <div style={{ marginBottom: '1.25rem', padding: '0.75rem', background: 'var(--surface-1)', borderRadius: 12, border: '1px solid var(--surface-2)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <ShieldAlert size={16} color="#ef4444" />
                            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Proctored Assessment</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid var(--surface-2)' }}>
                          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>{publishedExam.total_marks} Marks • {publishedExam.duration_minutes} Mins</span>
                          <div style={{ background: 'var(--brand-50)', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ArrowRight size={16} color="var(--brand-600)" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {(() => {
                const examCourses = enrolledCourses.filter(c => !!enrollments[c.id]);

                if (examCourses.length === 0) {
                  return (
                    <div style={{ background: 'var(--surface-0)', border: '1px dashed var(--surface-3)', borderRadius: 20, padding: '3rem', textAlign: 'center', maxWidth: 600, margin: '0 auto' }}>
                      <Trophy size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
                      <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>No exams available right now</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>Complete your course modules to unlock final certification exams!</p>
                      <button onClick={() => navigate('/student')} style={{ marginTop: '1.5rem', background: 'var(--brand-500)', color: 'white', border: 'none', borderRadius: 12, padding: '10px 24px', fontWeight: 800, fontSize: '1rem', cursor: 'pointer' }}>Go to Dashboard</button>
                    </div>
                  );
                }

                return (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2rem' }}>
                    {examCourses.map(course => {
                    const enr = enrollments[course.id];
                    const path = enr?.learning_path || 'pending';
                    const progress = enr?.progress_percentage || 0;
                    const pathColor = { pending: '#f59e0b', basics: '#0891b2', intermediate: '#7c3aed', advanced: '#059669' }[path] || '#6b7280';
                    const courseImages = {
                      101: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=600&q=80',
                      102: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=80',
                      103: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&q=80',
                      104: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&q=80',
                      105: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80',
                    };
                    return (
                      <div
                        key={course.id}
                        onClick={() => setSelectedCourse(course)}
                        style={{ background: 'var(--surface-0)', border: '1px solid var(--surface-3)', borderRadius: 24, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.3s', boxShadow: '0 8px 24px rgba(0,0,0,0.04)' }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.1)'; e.currentTarget.style.borderColor = 'var(--brand-300)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.04)'; e.currentTarget.style.borderColor = 'var(--surface-3)'; }}
                      >
                        <div style={{ height: 180, background: `linear-gradient(to bottom right, rgba(0,0,0,0.5), rgba(0,0,0,0.2)), url('${course.thumbnail_url || courseImages[course.id] || 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=600&q=80'}')`, backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'flex-end', padding: '1.25rem' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, background: pathColor, color: 'white', padding: '4px 12px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {path === 'pending' ? '⏳ Pending' : path === 'basics' ? '🌱 Foundation' : path === 'intermediate' ? '🚀 Core' : '⚡ Expert'}
                          </span>
                        </div>
                        <div style={{ padding: '1.5rem' }}>
                          <p style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem', lineHeight: 1.3 }}>{course.title}</p>
                          <div style={{ marginBottom: '1.25rem', padding: '0.75rem', background: 'var(--surface-1)', borderRadius: 12, border: '1px solid var(--surface-2)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              {path === 'pending' ? (
                                <>
                                  <AlertCircle size={16} color="#f59e0b" />
                                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Placement Assessment Required</span>
                                </>
                              ) : progress >= 100 ? (
                                <>
                                  <CheckCircle2 size={16} color="#10b981" />
                                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 700 }}>All Modules Completed · Final Exam</span>
                                </>
                              ) : (
                                <>
                                  <Target size={16} color="var(--brand-500)" />
                                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Level Tests & Roadmap ({progress}%)</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid var(--surface-2)' }}>
                            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}><Layers size={16} color="var(--brand-500)" /> {path === 'pending' ? 'Take Placement Test' : 'Roadmap & Level Tests'}</span>
                            <div style={{ background: 'var(--brand-50)', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <ArrowRight size={16} color="var(--brand-600)" />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}
      </div>
    )}


        {/* ── LOBBY STATE ── */}
        {examState === 'lobby' && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', overflowY: 'auto' }}>
            <div style={{ maxWidth: 640, width: '100%', animation: 'fadeIn 0.5s ease' }}>
              
              <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--brand-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                  <ShieldAlert size={32} color="var(--brand-500)" />
                </div>
                <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Exam Waiting Room</h1>
                <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>You are about to start <strong>{selectedExam?.title}</strong>. Please complete verification.</p>
              </div>

              <div style={{ background: 'var(--surface-0)', borderRadius: 20, border: '1px solid var(--surface-3)', boxShadow: '0 8px 30px rgba(0,0,0,0.04)', padding: '2rem', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Hardware & Environment Check</h3>
                
                <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
                  <div style={{ width: 160, height: 120, background: 'var(--surface-2)', borderRadius: 12, overflow: 'hidden', position: 'relative', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: hardwareChecked ? '2px solid #10b981' : '2px solid var(--surface-3)' }}>
                    <video ref={el => { if (el && mediaStream && el.srcObject !== mediaStream) el.srcObject = mediaStream; }} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
                    {!hardwareChecked && <Camera size={24} color="var(--text-muted)" style={{ position: 'absolute' }} />}
                  </div>
                  
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {hardwareChecked ? <CheckCircle2 size={18} color="#10b981" /> : <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid var(--text-muted)' }} />}
                      <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>Camera & Microphone Access</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <CheckCircle2 size={18} color="#10b981" />
                      <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>Stable Internet Connection</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                       <CheckCircle2 size={18} color="#10b981" />
                      <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>Screen Sharing & Fullscreen</span>
                    </div>
                  </div>
                </div>

                <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: 12, border: '1px solid rgba(239, 68, 68, 0.1)', marginBottom: '1.5rem' }}>
                  <h4 style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Academic Integrity Rules</h4>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    <li>Do not navigate away from this tab or exit fullscreen (it will be logged).</li>
                    <li>Ensure your face is clearly visible at all times.</li>
                    <li>No secondary devices or headphones are permitted.</li>
                  </ul>
                </div>

                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
                  <input type="checkbox" checked={agreedToTerms} onChange={e => setAgreedToTerms(e.target.checked)} style={{ marginTop: 3, width: 16, height: 16, accentColor: 'var(--brand-500)', cursor: 'pointer' }} />
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    I agree to the academic integrity rules, consent to being recorded, and allow full-screen locking for proctoring purposes.
                  </span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button onClick={exitToList} style={{ padding: '12px 24px', borderRadius: 999, background: 'var(--surface-0)', border: '1px solid var(--surface-3)', color: 'var(--text-primary)', fontWeight: 800, fontSize: '0.9375rem', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button 
                  onClick={() => { if(hardwareChecked && agreedToTerms) setExamState('active'); }}
                  disabled={!hardwareChecked || !agreedToTerms}
                  style={{ padding: '12px 32px', borderRadius: 999, background: hardwareChecked && agreedToTerms ? 'var(--brand-500)' : 'var(--surface-3)', color: hardwareChecked && agreedToTerms ? 'white' : 'var(--text-muted)', border: 'none', fontWeight: 800, fontSize: '0.9375rem', cursor: hardwareChecked && agreedToTerms ? 'pointer' : 'not-allowed', transition: 'all 0.2s', boxShadow: hardwareChecked && agreedToTerms ? '0 4px 12px rgba(79,70,229,0.3)' : 'none' }}>
                  Start Examination
                </button>
              </div>

            </div>
          </div>
        )}


        {/* ── ACTIVE EXAM STATE ── */}
        {examState === 'active' && (
          <>
            {/* Top Banners for Proctoring Violations */}
            {activeBanner && activeBanner.type !== 'terminated' && (
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, zIndex: 200,
                background: '#dc2626',
                color: 'white', padding: '14px 24px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                fontWeight: 900, fontSize: '1rem', letterSpacing: '0.02em',
                animation: 'slideDown 0.3s ease', boxShadow: '0 8px 30px rgba(220,38,38,0.4)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <AlertCircle size={24} />
                  <div>
                    <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {activeBanner.type === 'phone_detected' ? '⚠️ PROHIBITED DEVICE DETECTED' :
                       activeBanner.type === 'multiple_faces' ? '⚠️ MULTIPLE PEOPLE DETECTED' :
                       activeBanner.type === 'tab_switch' ? '⚠️ TAB SWITCH / DEFOCUS DETECTED' :
                       activeBanner.type === 'no_face' ? '⚠️ FACE NOT DETECTED IN CAMERA' :
                       activeBanner.type === 'eye_off_screen' ? '⚠️ LOOKING AWAY FROM SCREEN' :
                       activeBanner.type === 'screen_resize' ? '⚠️ FULLSCREEN EXITED' :
                       activeBanner.type === 'forbidden_key' ? '⚠️ PROHIBITED KEY DETECTED' :
                       '⚠️ PROCTORING VIOLATION DETECTED'}
                    </span>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, opacity: 0.9 }}>
                      {activeBanner.text}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ background: 'rgba(255,255,255,0.25)', padding: '6px 14px', borderRadius: 999, fontSize: '0.875rem', fontWeight: 800 }}>
                    Warning {activeBanner.warningNum || violationCount}/{MAX_VIOLATIONS}
                  </div>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.25rem', fontWeight: 900
                  }}>
                    {activeBanner.countdown}
                  </div>
                </div>
              </div>
            )}
            {activeBanner?.type === 'terminated' && (
              <div style={{
                position: 'absolute', inset: 0, zIndex: 300,
                background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(8px)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 20, color: 'white', animation: 'fadeIn 0.3s ease', textAlign: 'center', padding: '2rem'
              }}>
                <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'rgba(239,68,68,0.2)', border: '2px solid #ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertCircle size={48} color="#ef4444" />
                </div>
                <div style={{ fontSize: '2.25rem', fontWeight: 900, letterSpacing: '-0.02em' }}>Exam Auto-Terminated</div>
                <div style={{ fontSize: '1.125rem', opacity: 0.85, maxWidth: 500, lineHeight: 1.5 }}>
                  Maximum proctoring limit (5 warnings) reached. Your exam session has been locked, flagged for teacher review, and submitted.
                </div>
                <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', padding: '8px 20px', borderRadius: 999, color: '#f87171', fontWeight: 800, fontSize: '0.875rem' }}>
                  5/5 Security Violations Recorded
                </div>
              </div>
            )}

            {/* Proctoring HUD */}
            <div style={{ position: 'absolute', bottom: '2rem', right: '2rem', zIndex: 100, display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'flex-end', animation: 'fadeIn 0.5s ease' }}>
              {/* Only show bottom popup for MediaPipe face warnings when no top banner active */}
              {proctoring.status === 'tracking' && (violationCount > 0 || !proctoring.isFaceVisible || proctoring.isLookingAway) && !activeBanner && (
                <div style={{ background: '#ef4444', color: 'white', padding: '12px 16px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 8px 30px rgba(239,68,68,0.4)', maxWidth: 280, animation: 'fadeIn 0.3s ease' }}>
                  <AlertCircle size={20} />
                  <div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {!proctoring.isFaceVisible ? 'Face Not Visible' : proctoring.isLookingAway ? 'Gaze Deviation' : 'Proctoring Warning'}
                    </div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                        Re-center face to avoid auto-submission. Warning {violationCount}/{MAX_VIOLATIONS}
                    </div>
                  </div>
                </div>
              )}
              
              <div style={{ position: 'relative', width: 220, height: 140, borderRadius: 16, overflow: 'hidden', border: proctoring.status === 'tracking' && (!proctoring.isFaceVisible || proctoring.isLookingAway || violationCount > 0) ? '3px solid #ef4444' : '3px solid var(--surface-3)', boxShadow: '0 12px 40px rgba(0,0,0,0.15)', background: 'var(--surface-2)' }}>
                <video ref={hudVideoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
                
                {/* YOLO Annotated Frame Overlay */}
                {proctoring.annotatedFrame && proctoring.lastViolation && (
                  <img src={proctoring.annotatedFrame} alt="YOLO Detection" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)', zIndex: 5 }} />
                )}
                
                {/* Status Indicator overlay */}
                <div style={{ position: 'absolute', bottom: 12, right: 12, display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.7)', padding: '4px 10px', borderRadius: 999, backdropFilter: 'blur(4px)' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: violationCount >= 5 ? '#ef4444' : violationCount > 0 ? '#f59e0b' : '#10b981', boxShadow: `0 0 10px ${violationCount >= 5 ? '#ef4444' : violationCount > 0 ? '#f59e0b' : '#10b981'}` }} />
                  <span style={{ fontSize: '0.625rem', fontWeight: 800, color: 'white', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {violationCount > 0 ? `${violationCount}/5 Warnings` : 'Tracking Active'}
                  </span>
                </div>
              </div>
            </div>

            {/* Question Stage */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', overflowY: 'auto', animation: 'fadeIn 0.3s ease' }}>
              <div style={{ maxWidth: 700, width: '100%' }}>
                
                {/* Progress bar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                      Question {current + 1} of {questions.length}
                    </span>
                    <div style={{ flex: 1, height: 4, background: 'var(--surface-3)', borderRadius: 999, maxWidth: 300 }}>
                      <div style={{ height: '100%', background: 'var(--brand-500)', borderRadius: 999, width: `${questions.length > 0 ? ((current + 1) / questions.length) * 100 : 0}%`, transition: 'width 0.4s ease' }} />
                    </div>
                  </div>
                  <button onClick={toggleFlag} style={{ display: 'flex', alignItems: 'center', gap: 6, background: flagged.has(current) ? '#fef3c7' : 'transparent', border: `1px solid ${flagged.has(current) ? '#fde68a' : 'var(--surface-3)'}`, padding: '6px 12px', borderRadius: 999, color: flagged.has(current) ? '#d97706' : 'var(--text-secondary)', fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                    <Flag size={14} fill={flagged.has(current) ? '#d97706' : 'none'} />
                    {flagged.has(current) ? 'Flagged for Review' : 'Flag Question'}
                  </button>
                </div>

                {!q ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    <RefreshCw size={24} className="spin" style={{ marginBottom: 12 }} />
                    <p>Loading examination questions...</p>
                  </div>
                ) : (
                  <>
                    {/* Question Text */}
                    <h2 style={{ fontSize: '1.375rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.45, marginBottom: '2rem' }}>
                      {q.text || q.q || 'Question'}
                    </h2>
                    
                    {/* Question Image (if any) */}
                    {(q.image || q.image_url) && (
                      <div style={{ marginBottom: '2rem', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--surface-3)', display: 'flex', justifyContent: 'center', background: 'var(--surface-1)' }}>
                        <img src={q.image || q.image_url} alt="Question Attachment" style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' }} />
                      </div>
                    )}
                    
                    {/* Code Snippet (if any) */}
                    {(q.code || q.code_snippet) && (
                      <pre style={{ marginBottom: '2rem', padding: '1.25rem', background: '#1e1e1e', color: '#d4d4d4', borderRadius: 12, overflowX: 'auto', fontSize: '0.875rem', border: '1px solid #333' }}>
                        <code>{q.code || q.code_snippet}</code>
                      </pre>
                    )}

                    {/* Question Input (Dynamic Type) */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '3rem' }}>
                      
                      {q.type === 'mcq' && Array.isArray(q.options) && q.options.map((opt, idx) => {
                    const isSelected = answers[current] === idx;
                    const optionText = typeof opt === 'string' ? opt : opt.text;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleAnswerChange(idx)}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: '1.25rem',
                          padding: '1rem 1.25rem', borderRadius: 14, cursor: 'pointer', textAlign: 'left',
                          background: isSelected ? 'var(--brand-50)' : 'var(--surface-0)',
                          border: `2px solid ${isSelected ? 'var(--brand-500)' : 'var(--surface-3)'}`,
                          transition: 'all 0.15s', color: 'var(--text-primary)',
                        }}
                        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = 'var(--brand-300)'; }}
                        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = 'var(--surface-3)'; }}
                      >
                        <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8125rem', transition: 'all 0.15s',
                          background: isSelected ? 'var(--brand-500)' : 'var(--surface-2)',
                          color: isSelected ? 'white' : 'var(--text-muted)',
                        }}>
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <span style={{ fontSize: '0.9375rem', fontWeight: isSelected ? 700 : 500, lineHeight: 1.4 }}>{optionText}</span>
                      </button>
                    );
                  })}

                  {q.type === 'text' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <textarea 
                        value={answers[current] || ''}
                        onChange={e => handleAnswerChange(e.target.value)}
                        placeholder="Type your answer here..."
                        style={{ width: '100%', minHeight: 180, padding: '1rem', borderRadius: 14, border: '2px solid var(--surface-3)', background: 'var(--surface-0)', color: 'var(--text-primary)', fontSize: '0.9375rem', lineHeight: 1.5, resize: 'vertical', outline: 'none', transition: 'border-color 0.2s' }}
                        onFocus={e => e.currentTarget.style.borderColor = 'var(--brand-400)'}
                        onBlur={e => e.currentTarget.style.borderColor = 'var(--surface-3)'}
                      />
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right' }}>{String(answers[current] || '').length} characters</p>
                    </div>
                  )}
                </div>

                {/* Navigation */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button onClick={() => setCurrent(Math.max(0, current - 1))}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: 'none', color: current === 0 ? 'var(--text-muted)' : 'var(--text-primary)', fontWeight: 700, fontSize: '0.875rem', cursor: current === 0 ? 'not-allowed' : 'pointer', padding: 0, opacity: current === 0 ? 0.4 : 1 }}>
                    <ChevronLeft size={18} /> Previous
                  </button>

                  <button onClick={() => setCurrent(Math.min(questions.length - 1, current + 1))}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--text-primary)', color: 'white', border: 'none', padding: '10px 24px', borderRadius: 999, fontWeight: 800, fontSize: '0.9375rem', cursor: current === questions.length - 1 ? 'not-allowed' : 'pointer', opacity: current === questions.length - 1 ? 0.4 : 1 }}>
                    Next <ChevronRight size={18} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

            {/* Right Sidebar: Clean Question Palette & Tools */}
            <div style={{ width: 340, background: 'var(--surface-0)', borderLeft: '1px solid var(--surface-3)', padding: '1.5rem', display: 'flex', flexDirection: 'column', flexShrink: 0, zIndex: 10 }}>
              
              <div style={{ marginBottom: '1.5rem', flex: 1, overflowY: 'auto' }} className="hide-scrollbar">
                {/* Header with counter */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Layers size={16} color="var(--brand-500)" /> Question Palette
                  </h3>
                  <div style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', padding: '3px 10px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 800 }}>
                    {answeredCount}/{questions.length} Answered
                  </div>
                </div>

                {/* Status Legend */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', padding: '0.75rem', background: 'var(--surface-1)', borderRadius: 12, border: '1px solid var(--surface-2)', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: '#10b981' }} /> Answered
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: '#3b82f6', border: '1px solid #1d4ed8' }} /> Current
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: '#f59e0b' }} /> Flagged
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--surface-3)', border: '1px solid var(--surface-3)' }} /> Not Visited
                  </div>
                </div>

                {/* Question Numbers Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.625rem' }}>
                  {questions.map((qItem, i) => {
                    const isAnswered = answers[i] !== undefined && answers[i] !== '';
                    const isFlagged = flagged.has(i);
                    const isCurrent = current === i;

                    let bg = 'var(--surface-1)';
                    let color = 'var(--text-secondary)';
                    let border = '1px solid var(--surface-3)';
                    let boxShadow = 'none';

                    if (isAnswered) {
                      bg = '#10b981';
                      color = 'white';
                      border = '1px solid #059669';
                    }
                    if (isFlagged) {
                      bg = '#f59e0b';
                      color = 'white';
                      border = '1px solid #d97706';
                    }
                    if (isCurrent) {
                      bg = isAnswered ? '#10b981' : '#3b82f6';
                      color = 'white';
                      border = '2px solid #1d4ed8';
                      boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.35)';
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => setCurrent(i)}
                        title={`Question ${i + 1}${isFlagged ? ' (Flagged)' : ''}${isAnswered ? ' (Answered)' : ''}`}
                        style={{
                          height: 42,
                          borderRadius: 10,
                          border,
                          background: bg,
                          color,
                          fontWeight: 800,
                          fontSize: '0.875rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                          transition: 'all 0.15s ease',
                          boxShadow
                        }}
                        onMouseEnter={e => {
                          if (!isCurrent) e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={e => {
                          if (!isCurrent) e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        {i + 1}
                        {isFlagged && (
                          <div style={{ position: 'absolute', top: 2, right: 2, width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '0.8125rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                  Exam Tools
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <button onClick={() => setShowScratchpad(!showScratchpad)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: showScratchpad ? 'var(--brand-50)' : 'var(--surface-1)', border: `1px solid ${showScratchpad ? 'var(--brand-200)' : 'var(--surface-3)'}`, color: showScratchpad ? 'var(--brand-700)' : 'var(--text-primary)', borderRadius: 12, fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>
                    <Edit3 size={15} /> Digital Scratchpad
                  </button>
                  <button onClick={() => setShowCalculator(!showCalculator)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: showCalculator ? 'var(--brand-50)' : 'var(--surface-1)', border: `1px solid ${showCalculator ? 'var(--brand-200)' : 'var(--surface-3)'}`, color: showCalculator ? 'var(--brand-700)' : 'var(--text-primary)', borderRadius: 12, fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>
                    <Calculator size={15} /> Basic Calculator
                  </button>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--surface-3)', paddingTop: '1.25rem' }}>
                <button onClick={submitExam} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#10b981', color: 'white', border: 'none', padding: '12px', borderRadius: 12, fontWeight: 900, fontSize: '0.9375rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(16,185,129,0.3)', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                  <ShieldCheck size={18} /> Submit Assessment
                </button>
              </div>
            </div>


            {/* Floating Scratchpad */}
            {showScratchpad && (
              <div style={{ position: 'absolute', top: '2rem', right: '340px', width: 300, background: 'var(--surface-0)', borderRadius: 16, border: '1px solid var(--surface-3)', boxShadow: '0 12px 40px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', zIndex: 20, animation: 'fadeIn 0.2s ease' }}>
                <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--surface-3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-1)' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}><Edit3 size={14} /> Scratchpad</span>
                  <button onClick={() => setShowScratchpad(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={14} /></button>
                </div>
                <textarea 
                  value={scratchpadText}
                  onChange={e => setScratchpadText(e.target.value)}
                  placeholder="Type rough notes here..."
                  style={{ width: '100%', height: 200, border: 'none', padding: '1rem', resize: 'none', outline: 'none', background: 'transparent', color: 'var(--text-primary)', fontSize: '0.875rem', fontFamily: 'monospace' }}
                />
              </div>
            )}

            {/* Floating Calculator */}
            {showCalculator && (
              <div style={{ position: 'absolute', top: '18rem', right: '340px', width: 240, background: 'var(--surface-0)', borderRadius: 16, border: '1px solid var(--surface-3)', boxShadow: '0 12px 40px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', zIndex: 20, animation: 'fadeIn 0.2s ease' }}>
                <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--surface-3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-1)' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}><Calculator size={14} /> Calculator</span>
                  <button onClick={() => setShowCalculator(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={14} /></button>
                </div>
                <div style={{ padding: '1rem', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                  <div style={{ gridColumn: '1 / -1', background: 'var(--surface-2)', borderRadius: 8, padding: '0.5rem 0.75rem', textAlign: 'right', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>0</div>
                  {['7','8','9','/','4','5','6','*','1','2','3','-','0','.','=','+'].map(btn => (
                    <button key={btn} style={{ padding: '0.5rem', border: '1px solid var(--surface-3)', background: 'var(--surface-1)', borderRadius: 6, fontWeight: 700, cursor: 'pointer' }}>{btn}</button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ── SUBMITTED STATE ── */}
        {examState === 'submitted' && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', overflowY: 'auto', animation: 'fadeIn 0.5s ease' }}>
            <div style={{ maxWidth: 800, width: '100%' }}>
              
              {isAutoTerminated ? (
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                  <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'rgba(239,68,68,0.12)', border: '2px solid #ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', animation: 'breathe 2s infinite' }}>
                    <AlertTriangle size={44} color="#ef4444" />
                  </div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', padding: '6px 16px', borderRadius: 999, color: '#ef4444', fontWeight: 800, fontSize: '0.8125rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <ShieldAlert size={14} /> 5/5 Warnings Exceeded • Test Terminated
                  </div>
                  <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>Exam Auto-Terminated</h1>
                  <p style={{ fontSize: '1.0625rem', color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto', lineHeight: 1.6 }}>
                    Your session was automatically concluded and locked due to 5 proctoring security warnings (e.g., tab switches, leaving camera view, or gaze deviations). Your current answers and full violation audit log have been submitted to your instructor for review.
                  </p>
                </div>
              ) : (
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                  <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                    <Trophy size={40} color="#10b981" />
                  </div>
                  <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>Exam Completed</h1>
                  <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)' }}>You scored <strong>{score} out of {questions.length}</strong> in {selectedExam?.title}.</p>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '3rem' }}>
                <div style={{ background: 'var(--surface-0)', padding: '1.5rem', borderRadius: 20, border: isAutoTerminated ? '1px solid rgba(239,68,68,0.2)' : '1px solid var(--surface-3)', boxShadow: '0 8px 24px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1rem' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: isAutoTerminated ? 'rgba(239,68,68,0.1)' : 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {isAutoTerminated ? <ShieldAlert size={20} color="#ef4444" /> : <Activity size={20} color="#f59e0b" />}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-primary)' }}>{isAutoTerminated ? 'Security Audit' : 'Speed Metric'}</h3>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{isAutoTerminated ? 'Proctoring Log' : 'Cognitive Profile Update'}</p>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {isAutoTerminated ? (
                      <>5 proctoring violations recorded. Evidence frames and audit log sent to <strong style={{ color: '#ef4444' }}>Teacher Assessment Hub</strong>.</>
                    ) : (
                      <>You averaged <strong>45s per question</strong>. This is 15s slower than your benchmark. Your Speed score has been adjusted by <span style={{ color: '#ef4444', fontWeight: 800 }}>-2 points</span>.</>
                    )}
                  </p>
                </div>

                <div style={{ background: 'var(--surface-0)', padding: '1.5rem', borderRadius: 20, border: '1px solid var(--surface-3)', boxShadow: '0 8px 24px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1rem' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(79, 70, 229, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <BrainCircuit size={20} color="#4f46e5" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-primary)' }}>Knowledge Gap</h3>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Targeted Weakness</p>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    You struggled with <strong>Tree Traversals</strong>. We have added a 10-minute micro-lesson to your Adaptive Path to address this before the Finals.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                <button onClick={exitToList} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface-0)', border: '1px solid var(--surface-3)', color: 'var(--text-primary)', padding: '12px 28px', borderRadius: 999, fontWeight: 800, fontSize: '0.9375rem', cursor: 'pointer' }}>
                  Return to Exams
                </button>
                <button onClick={() => { exitToList(); navigate('/student/cognitive'); }} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--text-primary)', color: 'white', border: 'none', padding: '12px 28px', borderRadius: 999, fontWeight: 800, fontSize: '0.9375rem', cursor: 'pointer', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                  View Full Cognitive Profile <ArrowRight size={18} />
                </button>
              </div>

            </div>
          </div>
        )}

      <style>{`
        @keyframes slideDown { from { transform: translateY(-100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
        @keyframes pulsePin {
          0% { box-shadow: 0 8px 16px rgba(0,0,0,0.06), 0 0 0 0 rgba(59,130,246,0.4); }
          70% { box-shadow: 0 8px 16px rgba(0,0,0,0.06), 0 0 0 12px rgba(59,130,246,0); }
          100% { box-shadow: 0 8px 16px rgba(0,0,0,0.06), 0 0 0 0 rgba(59,130,246,0); }
        }
        .pulse-pin { animation: pulsePin 2s infinite cubic-bezier(0.66, 0, 0, 1); }
        @keyframes pulseRing {
          0%   { box-shadow: 0 0 0 0 rgba(79,70,229,0.4), 0 12px 32px rgba(79,70,229,0.25); }
          70%  { box-shadow: 0 0 0 14px rgba(79,70,229,0), 0 12px 32px rgba(79,70,229,0.25); }
          100% { box-shadow: 0 0 0 0 rgba(79,70,229,0), 0 12px 32px rgba(79,70,229,0.25); }
        }
        .pulse-ring { animation: pulseRing 2s infinite cubic-bezier(0.66, 0, 0, 1); }
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.7); }
        }
        [style*="pulse-dot"] { animation: pulseDot 1.4s infinite; }
        @keyframes breathe {
          0%, 100% { box-shadow: 0 0 0 8px rgba(99,102,241,0.2), 0 0 40px rgba(99,102,241,0.4); }
          50% { box-shadow: 0 0 0 16px rgba(99,102,241,0.1), 0 0 60px rgba(99,102,241,0.6); }
        }
      `}</style>

      {/* Course Roadmap Modal */}
      {selectedCourse && (
        <CourseRoadmapModal
          course={selectedCourse}
          enrollment={enrollments[selectedCourse.id]}
          onClose={() => setSelectedCourse(null)}
        />
      )}
    </div>
  );
}
