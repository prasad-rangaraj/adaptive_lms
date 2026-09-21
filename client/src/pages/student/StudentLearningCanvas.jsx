import { useState, useEffect } from 'react';
import { 
  Play, Pause, Volume2, Settings, Maximize, ChevronRight, Sparkles, X,
  HelpCircle, FileText, Lightbulb, SkipForward, List, CheckCircle2,
  BookOpen, Download, Search, Users, Loader2
} from 'lucide-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { coursesAPI } from '../../services/api.service';
import toast from 'react-hot-toast';

import PlacementAssessmentModal from './PlacementAssessmentModal';

// Modules state handled internally now

const aiActions = [];

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

  // Dynamically generate mock resources based on the active item
  const resources = activeItem && !activeItem.isCheckpoint ? [
    { id: 1, title: `${activeItem.title} - Presentation Slides`, type: 'PDF', size: '2.4 MB' },
    { id: 2, title: 'Cheat Sheet & Key Terms', type: 'PDF', size: '1.1 MB' },
    { id: 3, title: 'Practice Exercises & Solutions', type: 'ZIP', size: '5.6 MB' },
  ] : [
    { id: 1, title: 'Full Course Syllabus', type: 'PDF', size: '1.2 MB' },
    { id: 2, title: 'Prerequisites & Setup Guide', type: 'ZIP', size: '14.5 MB' },
  ];

  // Dynamically generate mock transcript based on the active item
  const transcript = activeItem && activeItem.type === 'video' ? [
    { time: '0:00', text: `Welcome to ${activeItem.title}. In this lesson, we're going to dive deep into the core concepts.` },
    { time: '0:45', text: `Let's start by looking at the fundamental architecture and why it's designed this way.` },
    { time: '1:30', text: `As you can see on the screen, the data flows from the client to the server through this API layer.` },
    { time: '2:15', text: `This is a critical pattern that you'll use constantly in your day-to-day development.` },
    { time: '3:00', text: `Make sure to check the resources tab for the cheat sheet on this specific topic!` },
  ] : [];

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [courseModules, setCourseModules] = useState([]);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAssessment, setShowAssessment] = useState(false);
  const [triggerFetch, setTriggerFetch] = useState(0); // to force refetch
  
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
        const isPending = enrollRes.data?.learning_path === 'pending';
        
        // If pending, take only first 2 modules (fundamentals)
        if (isPending) {
          rawModules = rawModules.slice(0, 2);
        }
        
        setCourseModules(rawModules);

        // Flatten modules into a list of items for the playlist
        const playlistItems = [];
        rawModules.forEach((mod, modIdx) => {
          mod.materials.forEach((m, matIdx) => {
            playlistItems.push({
              id: m.id,
              moduleId: mod.id,
              moduleTitle: mod.title,
              title: m.title,
              done: m.is_processed, // AI processing flag (not user completion)
              active: modIdx === 0 && matIdx === 0,
              type: m.material_type,
              url: m.s3_url
            });
          });
        });

        // Inject Assessment Checkpoint
        if (isPending) {
           playlistItems.push({
              id: 'assessment-checkpoint',
              moduleTitle: 'Assessment Checkpoint',
              title: '🎯 Placement Assessment',
              done: false,
              active: false,
              type: 'quiz',
              isCheckpoint: true
           });
        }

        setModules(playlistItems);
        // Set initial active item — prefer ?module= query param
        const preferModuleId = parseInt(searchParams.get('module'));
        if (playlistItems.length > 0) {
          const preferred = preferModuleId
            ? playlistItems.find(x => x.moduleId === preferModuleId)
            : null;
          setActiveItem(preferred || null);
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
    <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', margin: '-1.5rem -1.75rem', padding: '0' }}>

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
            <div style={{ display: 'flex', borderBottom: '1px solid var(--surface-3)' }}>
              {[
                { id: 'playlist', label: 'Playlist' },
                { id: 'resources', label: 'Resources' },
                { id: 'transcript', label: 'Transcript' }
              ].map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ flex: 1, padding: '1.25rem 0 1rem', background: 'transparent', border: 'none', borderBottom: activeTab === t.id ? '2px solid var(--text-primary)' : '2px solid transparent', color: activeTab === t.id ? 'var(--text-primary)' : 'var(--text-muted)', fontSize: '0.8125rem', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' }}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 0' }} className="hide-scrollbar">
              
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
                        if (m.isCheckpoint) {
                          setShowAssessment(true);
                        } else {
                          setActiveItem(m);
                        }
                      }}
                      style={{ padding: '0.875rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', background: activeItem?.id === m.id ? 'var(--brand-50)' : 'transparent', borderLeft: activeItem?.id === m.id ? '3px solid var(--brand-500)' : '3px solid transparent', cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: isDone ? '#10b981' : m.active ? 'var(--brand-500)' : m.isCheckpoint ? '#8b5cf6' : 'var(--surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'white', fontSize: '0.75rem', fontWeight: 800 }}>
                        {isDone ? '✓' : m.isCheckpoint ? '🎯' : i + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '0.875rem', fontWeight: m.active ? 800 : 600, color: m.active ? 'var(--brand-700)' : isDone ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: isDone ? 'line-through' : 'none' }}>
                          {m.title}
                        </p>
                        <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{m.moduleTitle} • {m.type}</p>
                      </div>
                    </div>
                  )})}
                  {!loading && modules.length === 0 && (
                    <p style={{textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', padding: '2rem'}}>No modules uploaded yet.</p>
                  )}
                </>
              )}

              {/* RESOURCES */}
              {activeTab === 'resources' && (
                <div style={{ padding: '0 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {resources.length > 0 ? resources.map(r => (
                    <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem 1rem', background: 'var(--surface-1)', border: '1px solid var(--surface-3)', borderRadius: 12 }}>
                      <BookOpen size={16} color="var(--brand-500)" style={{ flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</h4>
                        <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{r.type} · {r.size}</p>
                      </div>
                      <button style={{ background: 'transparent', border: 'none', color: 'var(--brand-500)', cursor: 'pointer', display: 'flex' }}><Download size={14} /></button>
                    </div>
                  )) : (
                    <p style={{textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', padding: '2rem'}}>No resources available.</p>
                  )}
                </div>
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
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--brand-500)', flexShrink: 0 }}>{t.time}</span>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{t.text}</p>
                      </div>
                    )) : (
                      <p style={{textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', padding: '2rem'}}>Transcript not available.</p>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </div>
      {/* Placement Assessment Modal */}
      {showAssessment && (
        <PlacementAssessmentModal 
          course={course}
          startAtPhase={1}
          onPlacementComplete={(assignedPath) => {
             setShowAssessment(false);
             setTriggerFetch(f => f + 1);
          }}
          onClose={() => setShowAssessment(false)}
        />
      )}

    </div>
  );
}
