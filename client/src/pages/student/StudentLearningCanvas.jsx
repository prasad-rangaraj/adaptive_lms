import { useState, useEffect } from 'react';
import { 
  Play, Pause, Volume2, Settings, Maximize, ChevronRight, Sparkles, X,
  HelpCircle, FileText, Lightbulb, SkipForward, List, CheckCircle2,
  BookOpen, Download, Search, Users, Loader2, Lock
} from 'lucide-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { coursesAPI, academicAPI } from '../../services/api.service';
import toast from 'react-hot-toast';

import PlacementAssessmentModal from './PlacementAssessmentModal';

// Modules state handled internally now

const aiActions = [
  { icon: HelpCircle, label: 'Explain this concept', color: '#10b981' },
  { icon: FileText, label: 'Summarize transcript', color: '#f59e0b' },
  { icon: Lightbulb, label: 'Generate practice quiz', color: '#8b5cf6' }
];

export default function StudentLearningCanvas() {
  const { courseId } = useParams();
  const [searchParams] = useSearchParams();
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  // Video completion tracking
  const [completedMaterials, setCompletedMaterials] = useState(() => {
    try {
      const stored = localStorage.getItem(`adaptive_completed_${courseId}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (completedMaterials.length > 0) {
      localStorage.setItem(`adaptive_completed_${courseId}`, JSON.stringify(completedMaterials));
    }
  }, [completedMaterials, courseId]);

  const markCompleted = (materialId) => {
    setCompletedMaterials(prev => {
      if (!prev.includes(materialId)) {
        toast.success('Material completed! Great job.', { icon: '🎉' });
        return [...prev, materialId];
      }
      return prev;
    });
  };
  const [showAI, setShowAI] = useState(false);
  const [showPanel, setShowPanel] = useState(true);
  const [activeTab, setActiveTab] = useState('playlist');
  const [aiQuery, setAiQuery] = useState('');
  const [activeItem, setActiveItem] = useState(null); // currently playing material
  const navigate = useNavigate();

  const [transcript, setTranscript] = useState([]);
  
  useEffect(() => {
    if (activeItem && !activeItem.isCheckpoint) {
      coursesAPI.getTranscript(courseId, activeItem.id)
        .then(res => setTranscript(res.data || []))
        .catch(err => {
           console.error(err);
           setTranscript([]);
        });
    } else {
      setTranscript([]);
    }
  }, [activeItem, courseId]);

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [courseModules, setCourseModules] = useState([]);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAssessment, setShowAssessment] = useState(false);
  const [selectedLevelAssessment, setSelectedLevelAssessment] = useState(null);
  const [triggerFetch, setTriggerFetch] = useState(0); // to force refetch

  // Weekly Tests for this course
  const [weeklyTests, setWeeklyTests] = useState([]);
  const [loadingWeekly, setLoadingWeekly] = useState(false);

  useEffect(() => {
    if (courseId) {
      setLoadingWeekly(true);
      academicAPI.getCourseWeeklyExams(courseId)
        .then(res => setWeeklyTests(res.data || []))
        .catch(err => console.error('Failed to load weekly tests for course:', err))
        .finally(() => setLoadingWeekly(false));
    }
  }, [courseId, triggerFetch]);
  
  useEffect(() => {
    if (!courseId) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [courseRes, modulesRes, enrollRes] = await Promise.all([
          coursesAPI.get(courseId),
          coursesAPI.getModules(courseId),
          coursesAPI.getEnrollmentStatus(courseId)
        ]);
        setCourse(courseRes.data);
        setEnrollment(enrollRes.data);
        
        let rawModules = modulesRes.data;
        const userPath = enrollRes.data?.learning_path || 'pending';
        const isPending = userPath === 'pending';
        
        const levelWeights = { fundamentals: 0, beginner: 1, basics: 1, intermediate: 2, advanced: 3 };
        const userWeight = levelWeights[userPath] ?? 0;

        setCourseModules(rawModules);

        const levelOrder = ['fundamentals', 'beginner', 'intermediate', 'advanced'];
        const levelDisplayNames = {
          fundamentals: 'Fundamentals',
          beginner: 'Beginner',
          basics: 'Beginner',
          intermediate: 'Intermediate',
          advanced: 'Advanced'
        };

        const passedLevels = (() => {
          try {
            return JSON.parse(localStorage.getItem(`adaptive_level_passed_${courseId}`) || '[]');
          } catch {
            return [];
          }
        })();

        const prog = enrollRes.data?.progress_percentage || 0;
        if (prog >= 25 && !passedLevels.includes('fundamentals')) passedLevels.push('fundamentals');
        if (prog >= 50 && !passedLevels.includes('beginner')) passedLevels.push('beginner');
        if (prog >= 75 && !passedLevels.includes('intermediate')) passedLevels.push('intermediate');
        if (prog >= 100 && !passedLevels.includes('advanced')) passedLevels.push('advanced');

        // Flatten modules into a list of items for the playlist grouped with level test checkpoints
        const playlistItems = [];
        
        levelOrder.forEach((lvl, lvlIdx) => {
          const lvlMods = rawModules.filter(m => m.level === lvl || (lvl === 'beginner' && m.level === 'basics'));
          if (lvlMods.length === 0) return;

          const modWeight = levelWeights[lvl] ?? 0;
          const prevLvl = lvlIdx > 0 ? levelOrder[lvlIdx - 1] : null;
          const isLevelLocked = isPending 
            ? lvl !== 'fundamentals' 
            : (modWeight > userWeight && (!prevLvl || !passedLevels.includes(prevLvl)));

          const lvlTopics = lvlMods.map(m => m.title.replace(/^Module\s+\d+:\s*/i, ''));

          // Add materials for modules in this level
          lvlMods.forEach((mod) => {
            mod.materials.forEach((m) => {
              playlistItems.push({
                id: m.id,
                moduleId: mod.id,
                moduleTitle: mod.title,
                title: m.title,
                done: m.is_processed,
                type: m.material_type,
                url: m.external_url || m.s3_url,
                locked: isLevelLocked,
                level: lvl
              });
            });
          });

          // Inject Level Test Checkpoint
          const isLvlPassed = passedLevels.includes(lvl);
          playlistItems.push({
            id: `checkpoint-${lvl}`,
            moduleId: `checkpoint-${lvl}`,
            moduleTitle: `${levelDisplayNames[lvl]} Level`,
            title: isLvlPassed
              ? `✅ Level ${lvlIdx + 1} Test: ${levelDisplayNames[lvl]} (Passed)`
              : `🎯 Level ${lvlIdx + 1} Test: ${levelDisplayNames[lvl]} Mastery`,
            done: isLvlPassed,
            active: false,
            type: 'quiz',
            isCheckpoint: true,
            checkpointLevel: lvl,
            checkpointIndex: lvlIdx + 1,
            checkpointTopics: lvlTopics,
            locked: isLevelLocked,
            isPassed: isLvlPassed,
          });
        });

        setModules(playlistItems);
        // Set initial active item — prefer ?module= query param, ignore checkpoints
        const preferModuleId = parseInt(searchParams.get('module'));
        if (playlistItems.length > 0) {
          const preferred = preferModuleId
            ? playlistItems.find(x => x.moduleId === preferModuleId && !x.isCheckpoint)
            : null;
          setActiveItem(preferred || playlistItems.find(x => !x.isCheckpoint) || null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId, triggerFetch]);

  // Helper: extract YouTube video ID from URL
  function getYouTubeId(url) {
    if (!url) return null;
    const match = url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);
    return match ? match[1] : null;
  }

  // Active material display
  const ytId = activeItem?.type === 'youtube' ? getYouTubeId(activeItem.url) : null;
  const isPDF = activeItem?.type === 'pdf';
  const isVideo = activeItem?.type === 'video';

  // Handle YouTube iframe messages
  useEffect(() => {
    if (!ytId) return;
    const handleMessage = (e) => {
      // YouTube IFrame API posts messages with data stringified
      if (e.origin !== 'https://www.youtube-nocookie.com') return;
      try {
        const data = JSON.parse(e.data);
        if (data.event === 'infoDelivery' && data.info?.playerState === 0) {
          // playerState 0 is ENDED
          if (activeItem?.id) markCompleted(activeItem.id);
        }
      } catch (err) {}
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [ytId, activeItem]);

  return (
    <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', margin: '-1.5rem -1.75rem', padding: '0', minHeight: 'calc(100vh - 65px)' }}>

      {/* ── Cinematic Video Stage ── */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>

        {/* ── LEFT: Video + Controls ── */}
        <div style={{ flex: 1, position: 'relative', background: '#090a0f' }}>

          {/* ── Real Media Embed ── */}
          {ytId ? (
            <iframe
              key={ytId}
              src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=0&rel=0&modestbranding=1&enablejsapi=1`}
              title={activeItem?.title || 'Video'}
              style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : isPDF && activeItem?.url ? (
            <iframe
              src={activeItem.url}
              title={activeItem.title}
              style={{ width: '100%', height: '100%', border: 'none', background: 'white' }}
            />
          ) : isVideo && activeItem?.url ? (
            <video
              src={activeItem.url}
              controls
              onEnded={() => markCompleted(activeItem.id)}
              style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000' }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--brand-900), #0f172a)', position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(99,102,241,0.15) 0%, transparent 60%)' }} />
              <div style={{ zIndex: 1, textAlign: 'center', maxWidth: 800, padding: '2rem' }}>
                <div style={{ width: 80, height: 80, borderRadius: '24px', background: 'var(--brand-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 12px 40px rgba(99,102,241,0.4)' }}>
                  <Play size={40} color="white" style={{ marginLeft: 6 }} />
                </div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white', letterSpacing: '-0.02em', marginBottom: '1rem', lineHeight: 1.1 }}>{course?.title || 'Welcome to the Course'}</h1>
                <p style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.7)', marginBottom: '2rem', lineHeight: 1.5 }}>You are on the <strong>{enrollment?.learning_path === 'pending' ? 'Pending' : enrollment?.learning_path || 'Adaptive'}</strong> learning path. Get ready to master the concepts at your own pace.</p>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
                  {courseModules.map((mod, i) => (
                    <div key={mod.id || i} style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 16px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left' }}>
                      <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--brand-300)', background: 'rgba(99,102,241,0.2)', padding: '3px 8px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mod {i + 1}</span>
                      <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'white' }}>{mod.title}</span>
                    </div>
                  ))}
                  {enrollment?.learning_path === 'pending' && (
                    <div style={{ background: 'rgba(245, 158, 11, 0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '10px 16px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left' }}>
                      <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#fcd34d', background: 'rgba(245, 158, 11, 0.2)', padding: '3px 8px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Checkpoint</span>
                      <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'white' }}>Placement Assessment</span>
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => setActiveItem(modules.find(x => !x.isCheckpoint) || modules[0])}
                  style={{ background: 'white', color: 'var(--brand-900)', border: 'none', padding: '14px 32px', borderRadius: 999, fontSize: '1.125rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 8px 30px rgba(0,0,0,0.2)', transition: 'transform 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  Start Learning
                </button>
              </div>
            </div>
          )}

          {/* Dark overlay top (for title visibility) — only for native video */}
          {isVideo && activeItem?.url && (
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 30%, transparent 60%, rgba(0,0,0,0.85) 100%)', pointerEvents: 'none' }} />
          )}

          {/* ── Floating Header (always visible for navigation) ── */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: ytId || isPDF ? 'rgba(0,0,0,0.7)' : 'transparent', backdropFilter: ytId || isPDF ? 'blur(8px)' : 'none' }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>{activeItem?.moduleTitle || course?.category || 'Course Overview'}</p>
              {activeItem ? <p style={{ color: 'white', fontSize: '0.9375rem', fontWeight: 800, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 480 }}>{activeItem.title}</p> : <p style={{ color: 'white', fontSize: '0.9375rem', fontWeight: 800, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 480 }}>{course?.title}</p>}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexShrink: 0 }}>
              <button
                onClick={() => { setShowAI(!showAI); if (!showAI) setShowPanel(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, background: showAI ? '#4f46e5' : 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: 'none', color: 'white', padding: '8px 16px', borderRadius: 999, fontWeight: 800, fontSize: '0.8125rem', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                <Sparkles size={15} /> AI Copilot
              </button>
              <button
                onClick={() => { setShowPanel(!showPanel); if (!showPanel) setShowAI(false); }}
                style={{ background: showPanel ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: 'none', color: 'white', padding: '8px 14px', borderRadius: 999, fontWeight: 800, fontSize: '0.8125rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <List size={15} /> Course Menu
              </button>
            </div>
          </div>



          {/* Play/Pause Center — only for native video */}
          {isVideo && activeItem?.url && (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(20px)', border: '2px solid rgba(255,255,255,0.3)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.2s', fontSize: 0 }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              {isPlaying ? <Pause size={28} fill="white" /> : <Play size={28} fill="white" />}
            </button>
          </div>
          )}

          {/* Bottom Controls Bar — only for native video */}
          {isVideo && activeItem?.url && (
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.5rem 2rem' }}>
            {/* Progress Bar */}
            <div
              style={{ height: 4, background: 'rgba(255,255,255,0.25)', borderRadius: 999, marginBottom: '1rem', cursor: 'pointer' }}
              onClick={e => {
                const rect = e.currentTarget.getBoundingClientRect();
                setProgress(Math.round(((e.clientX - rect.left) / rect.width) * 100));
              }}
            >
              <div style={{ width: `${progress}%`, height: '100%', background: '#4f46e5', borderRadius: 999, position: 'relative' }}>
                <div style={{ position: 'absolute', right: -6, top: -4, width: 12, height: 12, borderRadius: '50%', background: 'white' }} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button onClick={() => setIsPlaying(!isPlaying)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', padding: 0 }}>
                  {isPlaying ? <Pause size={22} fill="white" /> : <Play size={22} fill="white" />}
                </button>
                <button style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', padding: 0 }}>
                  <SkipForward size={20} />
                </button>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8125rem', fontWeight: 700 }}>18:24 / 48:12</span>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', padding: 0 }}><Volume2 size={20} /></button>
                <button style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', padding: 0 }}><Settings size={20} /></button>
                <button style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', padding: 0 }}><Maximize size={20} /></button>
              </div>
            </div>
          </div>
          )}
        </div>

        {/* ── RIGHT: AI Copilot Panel (Sliding) ── */}
        {showAI && (
          <div style={{ width: '360px', background: 'var(--surface-0)', borderLeft: '1px solid var(--surface-3)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
            <div style={{ padding: '1.5rem 1.5rem 1rem', borderBottom: '1px solid var(--surface-3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Sparkles size={18} color="#4f46e5" />
                <h3 style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-primary)' }}>AI Copilot</h3>
              </div>
              <button onClick={() => setShowAI(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                <X size={18} />
              </button>
            </div>

            {/* AI Quick Actions */}
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--surface-3)' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Quick Actions</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {aiActions.map((action, i) => (
                  <button key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0.875rem 1rem', background: 'var(--surface-1)', border: '1px solid var(--surface-3)', borderRadius: 12, cursor: 'pointer', textAlign: 'left', transition: 'border-color 0.2s' }} onMouseEnter={e => e.currentTarget.style.borderColor = action.color} onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--surface-3)'}>
                    <action.icon size={16} color={action.color} />
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>{action.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }} className="hide-scrollbar">
              <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '0 12px 12px 12px', padding: '1rem' }}>
                <p style={{ fontSize: '0.875rem', color: '#5b21b6', lineHeight: 1.6 }}>
                  Hi! I'm watching this lecture alongside you. Ask me anything about Binary Trees — I can explain concepts, generate a quiz, or create flashcards instantly.
                </p>
              </div>
            </div>

            {/* Input + Ask Community */}
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--surface-3)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button onClick={() => navigate('/student/community')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%', background: '#fffbeb', border: '1px solid #fde68a', color: '#d97706', padding: '8px', borderRadius: 12, fontSize: '0.8125rem', fontWeight: 800, cursor: 'pointer' }}>
                <Users size={14} /> Ask Community at 18:24
              </button>
              <div style={{ position: 'relative' }}>
                <input
                  value={aiQuery}
                  onChange={e => setAiQuery(e.target.value)}
                  placeholder="Ask anything about this lesson..."
                  style={{ width: '100%', padding: '0.875rem 3rem 0.875rem 1rem', background: 'var(--surface-1)', border: '1px solid var(--surface-3)', borderRadius: 999, outline: 'none', color: 'var(--text-primary)', fontSize: '0.875rem' }}
                />
                <button style={{ position: 'absolute', right: '1.75rem', top: '50%', transform: 'translateY(-50%)', background: '#4f46e5', border: 'none', color: 'white', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── RIGHT: Multi-Tab Panel (Sliding) ── */}
        {showPanel && !showAI && (
          <div style={{ width: '340px', background: 'var(--surface-0)', borderLeft: '1px solid var(--surface-3)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
            {/* Tabs Header */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--surface-3)', overflowX: 'auto' }} className="hide-scrollbar">
              {[
                { id: 'playlist', label: 'Playlist' },
                { id: 'weekly', label: `Weekly Tests (${weeklyTests.length})` },
                { id: 'transcript', label: 'Transcript' },
                { id: 'resources', label: 'Resources' }
              ].map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ flex: 1, padding: '1.25rem 0.5rem 1rem', background: 'transparent', border: 'none', borderBottom: activeTab === t.id ? '2px solid var(--text-primary)' : '2px solid transparent', color: activeTab === t.id ? 'var(--text-primary)' : 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 0 4rem' }} className="hide-scrollbar">
              
              {/* PLAYLIST */}
              {activeTab === 'playlist' && (
                <>
                  {loading && <div style={{padding: '2rem', display: 'flex', justifyContent: 'center'}}><Loader2 className="animate-spin text-muted" size={24} /></div>}
                  {!loading && modules.map((m, i) => {
                    const isDone = completedMaterials.includes(m.id);
                    return (
                    <div 
                      key={m.id} 
                      onClick={() => {
                        if (m.locked) {
                          toast.error('Complete the previous level assessment to unlock this section!');
                          return;
                        }
                        if (m.isCheckpoint) {
                          setSelectedLevelAssessment({
                            level: m.checkpointLevel,
                            levelTitle: m.title.replace(/^([🎯✅]\s*)/, ''),
                            topics: m.checkpointTopics || [],
                            levelIndex: m.checkpointIndex || 1,
                          });
                          setShowAssessment(true);
                        } else {
                          setActiveItem(m);
                        }
                      }}
                      style={{ 
                        padding: '0.875rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', 
                        background: activeItem?.id === m.id ? 'var(--brand-50)' : m.isCheckpoint ? (m.isPassed ? 'rgba(16,185,129,0.04)' : 'rgba(245,158,11,0.06)') : 'transparent', 
                        borderLeft: activeItem?.id === m.id ? '3px solid var(--brand-500)' : m.isCheckpoint ? (m.isPassed ? '3px solid #10b981' : '3px solid #f59e0b') : '3px solid transparent', 
                        cursor: m.locked ? 'not-allowed' : 'pointer', 
                        transition: 'all 0.2s',
                        opacity: m.locked ? 0.45 : 1
                      }}
                    >
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: m.locked ? 'var(--surface-3)' : m.isPassed ? '#10b981' : activeItem?.id === m.id ? 'var(--brand-500)' : m.isCheckpoint ? '#f59e0b' : 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: m.locked ? 'var(--text-muted)' : m.isPassed || activeItem?.id === m.id || m.isCheckpoint ? 'white' : 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 800 }}>
                        {m.locked ? <Lock size={14} /> : m.isPassed ? <CheckCircle2 size={16} /> : isDone ? <CheckCircle2 size={16} /> : m.isCheckpoint ? '🎯' : (m.type === 'youtube' || m.type === 'video') ? <Play size={12} fill="currentColor" /> : m.type === 'pdf' ? '📄' : m.type === 'article' ? '📝' : i + 1}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: m.active || m.isCheckpoint ? 800 : 600, color: m.isCheckpoint ? (m.isPassed ? '#059669' : '#d97706') : m.active ? 'var(--brand-700)' : isDone ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: isDone && !m.isCheckpoint ? 'line-through' : 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {m.title}
                        </p>
                        <p style={{ margin: '2px 0 0', fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                          {m.isCheckpoint ? (m.checkpointTopics?.length ? `${m.checkpointTopics.length} Topics Evaluated • Test Checkpoint` : 'Level Test Checkpoint') : `${m.moduleTitle} • ${m.type}`}
                        </p>
                      </div>
                      {m.isCheckpoint && !m.locked && (
                        <span style={{ fontSize: '0.6875rem', fontWeight: 800, padding: '3px 8px', borderRadius: 6, background: m.isPassed ? 'rgba(16,185,129,0.1)' : 'linear-gradient(135deg, #f59e0b, #d97706)', color: m.isPassed ? '#10b981' : 'white', flexShrink: 0 }}>
                          {m.isPassed ? 'Passed' : 'Take Test'}
                        </span>
                      )}
                    </div>
                  )})}
                  {!loading && modules.length === 0 && (
                    <p style={{textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', padding: '2rem'}}>No modules uploaded yet.</p>
                  )}
                </>
              )}



              {/* TRANSCRIPT */}
              {activeTab === 'transcript' && (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div style={{ padding: '0 1.5rem', marginBottom: '1rem', position: 'relative' }}>
                    <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '2.25rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input placeholder="Search transcript..." style={{ width: '100%', padding: '0.625rem 1rem 0.625rem 2.25rem', background: 'var(--surface-1)', border: '1px solid var(--surface-3)', borderRadius: 999, color: 'var(--text-primary)', fontSize: '0.8125rem', outline: 'none' }} />
                  </div>
                  <div style={{ flex: 1, overflowY: 'auto', padding: '0 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }} className="hide-scrollbar">
                    {transcript.length > 0 ? transcript.map((t, i) => (
                      <div key={i} style={{ display: 'flex', gap: '1rem', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.opacity = 0.7} onMouseLeave={e => e.currentTarget.style.opacity = 1}>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{t.text}</p>
                      </div>
                    )) : (
                      <p style={{textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', padding: '2rem'}}>Transcript not available.</p>
                    )}
                  </div>
                </div>
              )}

              {/* RESOURCES */}
              {activeTab === 'resources' && (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '0 1.5rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>Module Resources</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {modules.filter(m => m.type === 'pdf').map(m => {
                      const isDone = completedMaterials.includes(m.id);
                      return (
                        <div key={m.id} onClick={() => setActiveItem(m)} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '1rem', background: 'var(--surface-1)', border: '1px solid var(--surface-2)', borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--brand-400)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--surface-2)'}>
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#e0f2fe', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            📄
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, textDecoration: isDone ? 'line-through' : 'none' }}>{m.title}</p>
                            <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', margin: 0 }}>PDF Document</p>
                          </div>
                          <a href={m.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ color: 'var(--brand-500)', fontSize: '0.8125rem', fontWeight: 800, textDecoration: 'none' }}>Open</a>
                        </div>
                      );
                    })}
                    {modules.filter(m => m.type === 'pdf').length === 0 && (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '2rem 0' }}>No resources available.</p>
                    )}
                  </div>
                </div>
              )}

              {/* WEEKLY TESTS */}
              {activeTab === 'weekly' && (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '0 1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '0.9375rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
                      Weekly Assessments
                    </h3>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 800, background: 'rgba(245,158,11,0.1)', color: '#d97706', padding: '2px 8px', borderRadius: 6, textTransform: 'uppercase' }}>
                      Mandatory
                    </span>
                  </div>

                  {loadingWeekly ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      <Loader2 className="animate-spin text-muted" size={20} style={{ margin: '0 auto 8px' }} />
                      <p style={{ fontSize: '0.8125rem' }}>Loading weekly tests...</p>
                    </div>
                  ) : weeklyTests.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2.5rem 1rem', background: 'var(--surface-1)', borderRadius: 14, border: '1px dashed var(--surface-3)' }}>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
                        No weekly tests published yet for this course.
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                      {weeklyTests.map(exam => {
                        const isAttended = exam.has_attended;
                        return (
                          <div
                            key={exam.id}
                            style={{
                              background: 'var(--surface-1)',
                              border: isAttended ? '1px solid var(--surface-3)' : '1px solid rgba(245,158,11,0.4)',
                              borderRadius: 14,
                              padding: '1rem',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.75rem',
                              transition: 'all 0.2s'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <span style={{ fontSize: '0.6875rem', fontWeight: 900, textTransform: 'uppercase', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', padding: '2px 6px', borderRadius: 4 }}>
                                Week {exam.week_number}
                              </span>
                              {isAttended ? (
                                <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <CheckCircle2 size={12} /> Attended
                                </span>
                              ) : (
                                <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#ef4444' }}>
                                  Required
                                </span>
                              )}
                            </div>

                            <div>
                              <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                                {exam.title}
                              </p>
                              <p style={{ margin: '3px 0 0', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                                {exam.duration_minutes} Mins • {exam.question_count} Questions • {exam.total_marks} Marks
                              </p>
                            </div>

                            {isAttended ? (
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid var(--surface-2)' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#10b981' }}>
                                  Score: {exam.student_score} / {exam.total_marks}
                                </span>
                                <button
                                  onClick={() => navigate(`/student/exam/${exam.id}`)}
                                  style={{ padding: '5px 10px', borderRadius: 8, background: 'var(--surface-2)', border: 'none', color: 'var(--text-primary)', fontWeight: 800, fontSize: '0.6875rem', cursor: 'pointer' }}
                                >
                                  Review
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => navigate(`/student/exam/${exam.id}`)}
                                style={{ width: '100%', padding: '8px', borderRadius: 8, background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', border: 'none', fontWeight: 900, fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: '0 2px 8px rgba(217,119,6,0.3)' }}
                              >
                                Take Assessment <ChevronRight size={14} />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        )}
      </div>
      {/* Level / Placement Assessment Modal */}
      {showAssessment && (
        <PlacementAssessmentModal 
          course={course}
          startAtPhase={2}
          assessmentType={selectedLevelAssessment ? 'level' : 'placement'}
          level={selectedLevelAssessment?.level || 'fundamentals'}
          levelTitle={selectedLevelAssessment?.levelTitle}
          topics={selectedLevelAssessment?.topics || []}
          onLevelTestPass={(lvl, scr) => {
            setShowAssessment(false);
            setSelectedLevelAssessment(null);
            setTriggerFetch(f => f + 1);
          }}
          onPlacementComplete={(assignedPath) => {
             setShowAssessment(false);
             setSelectedLevelAssessment(null);
             setTriggerFetch(f => f + 1);
          }}
          onClose={() => {
            setShowAssessment(false);
            setSelectedLevelAssessment(null);
          }}
        />
      )}

    </div>
  );
}
