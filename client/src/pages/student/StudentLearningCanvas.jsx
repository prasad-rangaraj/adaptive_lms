import { useState, useEffect } from 'react';
import { 
  Play, Pause, Volume2, Settings, Maximize, ChevronRight, Sparkles, X,
  HelpCircle, FileText, Lightbulb, SkipForward, List,
  BookOpen, Download, Search, Users, Loader2
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { coursesAPI } from '../../services/api.service';

// Modules state handled internally now

const aiActions = [
  { icon: HelpCircle, label: 'Explain this concept', color: '#4f46e5' },
  { icon: FileText, label: 'Summarize transcript', color: '#0891b2' },
  { icon: Lightbulb, label: 'Generate flashcards', color: '#f59e0b' },
  { icon: HelpCircle, label: 'Create practice quiz', color: '#8b5cf6' },
];

const resources = [
  { id: 1, title: 'Prof. Meenakshi PPT (Unit 2)', size: '2.4 MB', type: 'PDF' },
  { id: 2, title: 'Tree Node C++ Implementation', size: '2 KB', type: 'Code' },
  { id: 3, title: 'PYQ 2023 Solved: Binary Trees', size: '1.1 MB', type: 'PDF' },
];

const transcript = [
  { time: '00:00', text: 'Welcome to this session on Binary Trees.' },
  { time: '02:14', text: 'Unlike arrays or linked lists, trees are non-linear.' },
  { time: '05:30', text: 'A binary tree can have at most two children.' },
  { time: '12:45', text: 'Let us look at AVL tree rotations, which is crucial for your exams.' },
  { time: '18:20', text: 'Left-Left and Right-Right are single rotations.' },
];

export default function StudentLearningCanvas() {
  const { courseId } = useParams();
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(38);
  const [showAI, setShowAI] = useState(false);
  const [showPanel, setShowPanel] = useState(true);
  const [activeTab, setActiveTab] = useState('playlist');
  const [aiQuery, setAiQuery] = useState('');
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!courseId) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [courseRes, modulesRes] = await Promise.all([
          coursesAPI.get(courseId),
          coursesAPI.getModules(courseId)
        ]);
        setCourse(courseRes.data);
        
        // Flatten modules into a list of items for the playlist
        const playlistItems = [];
        modulesRes.data.forEach((mod, modIdx) => {
          mod.materials.forEach((m, matIdx) => {
            playlistItems.push({
              id: m.id,
              moduleTitle: mod.title,
              title: m.title,
              done: m.is_processed, // Mocking done state with is_processed
              active: modIdx === 0 && matIdx === 0, // Mock first as active
              type: m.material_type,
              url: m.s3_url
            });
          });
        });
        setModules(playlistItems);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId]);

  return (
    <div style={{ position: 'relative', height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', overflow: 'hidden', margin: '-2rem -2.5rem', padding: '0' }}>

      {/* ── Cinematic Video Stage ── */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>

        {/* ── LEFT: Video + Controls ── */}
        <div style={{ flex: 1, position: 'relative', background: '#090a0f' }}>

          {/* Fake Video Background */}
          <img
            src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1400&q=80"
            alt="Course Video"
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }}
          />

          {/* Dark overlay top (for title visibility) */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 30%, transparent 60%, rgba(0,0,0,0.85) 100%)' }} />

          {/* Top Bar (Course Title) */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{course ? course.category || 'Course' : 'Loading...'}</p>
              <h2 style={{ color: 'white', fontSize: '1.25rem', fontWeight: 800, marginTop: 4 }}>{course ? course.title : 'Loading...'}</h2>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => { setShowAI(!showAI); if (!showAI) setShowPanel(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, background: showAI ? '#4f46e5' : 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: 'none', color: 'white', padding: '8px 16px', borderRadius: 999, fontWeight: 800, fontSize: '0.8125rem', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                <Sparkles size={15} /> AI Copilot
              </button>
              <button
                onClick={() => { setShowPanel(!showPanel); if (!showPanel) setShowAI(false); }}
                style={{ background: showPanel ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: 'none', color: 'white', padding: '8px 14px', borderRadius: 999, fontWeight: 800, fontSize: '0.8125rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <List size={15} /> Course Menu
              </button>
            </div>
          </div>

          {/* Play/Pause Center */}
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

          {/* Bottom Controls Bar */}
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
                  {!loading && modules.map((m, i) => (
                    <div key={m.id} style={{ padding: '0.875rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', background: m.active ? 'var(--brand-50)' : 'transparent', borderLeft: m.active ? '3px solid var(--brand-500)' : '3px solid transparent', cursor: 'pointer', transition: 'all 0.2s' }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: m.done ? '#10b981' : m.active ? 'var(--brand-500)' : 'var(--surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'white', fontSize: '0.75rem', fontWeight: 800 }}>
                        {m.done ? '✓' : i + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '0.875rem', fontWeight: m.active ? 800 : 600, color: m.active ? 'var(--brand-700)' : m.done ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: m.done ? 'line-through' : 'none' }}>
                          {m.title}
                        </p>
                        <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{m.moduleTitle} • {m.type}</p>
                      </div>
                    </div>
                  ))}
                  {!loading && modules.length === 0 && (
                    <p style={{textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', padding: '2rem'}}>No modules uploaded yet.</p>
                  )}
                </>
              )}

              {/* RESOURCES */}
              {activeTab === 'resources' && (
                <div style={{ padding: '0 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {resources.map(r => (
                    <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem 1rem', background: 'var(--surface-1)', border: '1px solid var(--surface-3)', borderRadius: 12 }}>
                      <BookOpen size={16} color="var(--brand-500)" style={{ flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</h4>
                        <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{r.type} · {r.size}</p>
                      </div>
                      <button style={{ background: 'transparent', border: 'none', color: 'var(--brand-500)', cursor: 'pointer', display: 'flex' }}><Download size={14} /></button>
                    </div>
                  ))}
                </div>
              )}

              {/* TRANSCRIPT */}
              {activeTab === 'transcript' && (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div style={{ padding: '0 1.5rem 1rem', position: 'relative' }}>
                    <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '2.25rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input placeholder="Search transcript..." style={{ width: '100%', padding: '0.625rem 1rem 0.625rem 2.25rem', background: 'var(--surface-1)', border: '1px solid var(--surface-3)', borderRadius: 999, color: 'var(--text-primary)', fontSize: '0.8125rem', outline: 'none' }} />
                  </div>
                  <div style={{ flex: 1, overflowY: 'auto', padding: '0 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }} className="hide-scrollbar">
                    {transcript.map((t, i) => (
                      <div key={i} style={{ display: 'flex', gap: '1rem', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.opacity = 0.7} onMouseLeave={e => e.currentTarget.style.opacity = 1}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--brand-500)', flexShrink: 0 }}>{t.time}</span>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{t.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
