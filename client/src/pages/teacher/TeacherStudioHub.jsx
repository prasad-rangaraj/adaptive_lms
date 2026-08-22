import { useState } from 'react';
import { 
  Plus, Settings, PlayCircle, GripVertical, CheckCircle2, ChevronRight,
  Video, FileText, HelpCircle, UserX, MessageSquare, Send, Sparkles, BrainCircuit, Mic
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

// ── Tab: Course Builder (Editorial Style) ─────────────────────────────────
function BuilderTab() {
  const [activeModule, setActiveModule] = useState(1);
  const modules = [
    { id: 1, title: 'Introduction to Neural Networks', duration: '1h 24m', items: [
      { id: 101, type: 'video', title: 'What is a Perceptron?', duration: '12:30', status: 'Published' },
      { id: 102, type: 'document', title: 'Reading: Activation Functions', status: 'Published' },
      { id: 103, type: 'quiz', title: 'Knowledge Check 1', questions: 5, status: 'Draft' }
    ]},
    { id: 2, title: 'Deep Learning Architectures', duration: '2h 10m', items: [
      { id: 201, type: 'video', title: 'Convolutional Neural Networks', duration: '24:15', status: 'Draft' }
    ]}
  ];

  const getTypeIcon = (type) => {
    switch(type) {
      case 'video': return <Video size={14} color="var(--brand-500)" />;
      case 'document': return <FileText size={14} color="#10b981" />;
      case 'quiz': return <HelpCircle size={14} color="#8b5cf6" />;
      default: return <FileText size={14} />;
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '6rem', alignItems: 'start' }}>
      
      {/* ── Left: Organic Outline ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>Curriculum</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 8 }}>Drag modules to reorganize your syllabus.</p>
          </div>
          <button style={{ background: 'var(--text-primary)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 999, fontSize: '0.8125rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Plus size={16} /> Add Module
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {modules.map((mod, index) => (
            <div key={mod.id} style={{ position: 'relative' }}>
              
              {/* Module Header (Borderless) */}
              <div 
                onClick={() => setActiveModule(activeModule === mod.id ? null : mod.id)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 0', cursor: 'pointer', borderBottom: '2px solid var(--surface-3)', transition: 'border-color 0.3s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--text-primary)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--surface-3)'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--surface-4)', width: '30px' }}>{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>{mod.title}</h3>
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginTop: 4, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{mod.duration} • {mod.items.length} Lessons</p>
                  </div>
                </div>
                <ChevronRight size={20} color="var(--text-muted)" style={{ transform: activeModule === mod.id ? 'rotate(90deg)' : 'none', transition: 'transform 0.3s ease' }} />
              </div>

              {/* Module Content */}
              <div style={{ height: activeModule === mod.id ? 'auto' : 0, overflow: 'hidden', opacity: activeModule === mod.id ? 1 : 0, transition: 'opacity 0.3s' }}>
                <div style={{ padding: '1.5rem 0 1.5rem 4rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  
                  {mod.items.map(item => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', group: 'lesson' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        <GripVertical size={14} color="var(--surface-4)" style={{ cursor: 'grab' }} />
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--surface-1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {getTypeIcon(item.type)}
                        </div>
                        <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>{item.title}</span>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                        {item.duration && <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>{item.duration}</span>}
                        <span style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: item.status === 'Published' ? '#10b981' : '#d97706' }}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))}

                  <button style={{ alignSelf: 'flex-start', background: 'transparent', border: 'none', color: 'var(--brand-600)', fontSize: '0.875rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '0.5rem 0', marginTop: '0.5rem' }}>
                    <Plus size={16} /> Add Material
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* ── Right: Studio Co-Pilot ── */}
      <div style={{ position: 'sticky', top: '100px', display: 'flex', flexDirection: 'column' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '2rem' }}>
          <Sparkles size={24} color="#8b5cf6" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Studio Copilot</h2>
        </div>
        
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2.5rem' }}>
          I can help you construct this module. Need a quiz generated from the video transcript? Or reading materials summarized? Just ask.
        </p>

        {/* AI Action Suggestions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
          {[
            { label: 'Auto-Generate Quiz', icon: HelpCircle },
            { label: 'Draft Lesson Summary', icon: FileText },
            { label: 'Suggest Learning Objectives', icon: BrainCircuit },
          ].map((action, i) => (
            <button key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 0', background: 'transparent', border: 'none', borderBottom: '1px solid var(--surface-3)', cursor: 'pointer', textAlign: 'left', transition: 'padding-left 0.2s' }} onMouseEnter={e => { e.currentTarget.style.paddingLeft = '0.5rem'; e.currentTarget.style.borderColor = '#8b5cf6' }} onMouseLeave={e => { e.currentTarget.style.paddingLeft = '0'; e.currentTarget.style.borderColor = 'var(--surface-3)' }}>
              <action.icon size={16} color="#8b5cf6" />
              <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>{action.label}</span>
            </button>
          ))}
        </div>

        {/* Input Field */}
        <div style={{ position: 'relative' }}>
          <input 
            placeholder="Type your command..." 
            style={{ width: '100%', padding: '1rem 1rem 1rem 0', background: 'transparent', border: 'none', borderBottom: '2px solid var(--text-primary)', color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 600, outline: 'none' }}
          />
          <button style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#8b5cf6', cursor: 'pointer' }}>
            <Mic size={20} />
          </button>
        </div>

      </div>
    </div>
  );
}

// ── Tab: Cohort Management ────────────────────────────────────────────────
function CohortTab() {
  const students = [
    { id: 1, name: 'Alex Chen', email: 'alex@example.com', progress: 92, status: 'On Track', lastActive: '2 hrs ago' },
    { id: 2, name: 'Sarah Jenkins', email: 'sarah@example.com', progress: 45, status: 'Falling Behind', lastActive: '3 days ago' },
    { id: 3, name: 'Michael Chang', email: 'mike@example.com', progress: 78, status: 'On Track', lastActive: '1 hr ago' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>Active Roster</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 8 }}>124 students currently enrolled.</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Table Header (Minimal) */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '2rem', paddingBottom: '1rem', borderBottom: '2px solid var(--surface-4)', marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Student</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Progress</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Last Active</span>
          <span style={{ width: 80 }}></span>
        </div>

        {/* Student Rows */}
        {students.map((student) => (
          <div key={student.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '2rem', alignItems: 'center', padding: '1.5rem 0', borderBottom: '1px solid var(--surface-3)', transition: 'background 0.3s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-1)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 800, color: 'var(--text-secondary)' }}>
                {student.name.charAt(0)}
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{student.name}</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{student.email}</p>
              </div>
            </div>

            <div>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)' }}>{student.progress}%</span>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: student.status === 'On Track' ? '#10b981' : '#ef4444' }}>
                {student.status}
              </span>
            </div>

            <div>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{student.lastActive}</span>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 8 }}><MessageSquare size={18} /></button>
              <button style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 8 }}><UserX size={18} /></button>
            </div>
            
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Tab: Announcements ────────────────────────────────────────────────────
function AnnouncementsTab() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '6rem', alignItems: 'start' }}>
      
      {/* ── Left: Composer ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>Broadcast</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 8 }}>Send an update to all 124 enrolled students.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '2rem' }}>
          <input 
            placeholder="Subject Title" 
            style={{ width: '100%', padding: '1rem 0', background: 'transparent', border: 'none', borderBottom: '2px solid var(--surface-4)', color: 'var(--text-primary)', fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.02em', outline: 'none' }}
          />
          
          <textarea 
            placeholder="Write your announcement here... Use Markdown if needed." 
            style={{ width: '100%', minHeight: '300px', padding: '1rem 0', background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '1.125rem', lineHeight: 1.6, resize: 'vertical', outline: 'none' }}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '2px solid var(--surface-3)', paddingTop: '1.5rem' }}>
            <button style={{ background: 'var(--text-primary)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: 999, fontSize: '0.9375rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Send size={16} /> Broadcast Message
            </button>
          </div>
        </div>
      </div>

      {/* ── Right: History ── */}
      <div style={{ position: 'sticky', top: '100px', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2rem' }}>Previous Broadcasts</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-500)', marginBottom: 4, display: 'block' }}>Aug 12, 2026</span>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>Welcome to Advanced ML</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.5 }}>Please make sure you have reviewed the syllabus before our first live session...</p>
          </div>
          
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-500)', marginBottom: 4, display: 'block' }}>Aug 15, 2026</span>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>Assignment 1 Deadline Extended</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.5 }}>Due to a system outage, I am extending the deadline by 48 hours...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Hub ──────────────────────────────────────────────────────────────
export default function TeacherStudioHub() {
  const [activeTab, setActiveTab] = useState('builder');

  return (
    <div style={{ position: 'relative', minHeight: '100%', paddingBottom: '4rem', overflow: 'hidden' }}>
      
      {/* ── Background Organic Orbs ── */}
      <div style={{ position: 'absolute', top: '20%', left: '40%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(139,92,246,0.04) 0%, transparent 70%)', filter: 'blur(80px)', zIndex: 0, pointerEvents: 'none' }} />
      
      <div style={{ position: 'relative', zIndex: 10 }}>

        {/* ── Editorial Header & Minimal Tabs ── */}
        <div style={{ marginBottom: '2rem' }}>
          <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--brand-500)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1rem' }}>
            Advanced Machine Learning
          </p>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
              Course Studio
            </h1>
            
            <button style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: 0 }}>
              <Settings size={18} /> Course Settings
            </button>
          </div>

          {/* Borderless Text Tabs */}
          <div style={{ display: 'flex', gap: '3rem', marginTop: '3rem', borderBottom: '1px solid var(--surface-3)' }}>
            {[
              { id: 'builder', label: 'Curriculum Builder' },
              { id: 'cohort', label: 'Student Cohort' },
              { id: 'announcements', label: 'Announcements' },
            ].map(t => (
              <button 
                key={t.id} onClick={() => setActiveTab(t.id)}
                style={{ 
                  background: 'transparent', border: 'none', cursor: 'pointer', 
                  padding: '0 0 1rem 0', 
                  fontSize: '1rem', fontWeight: 800, 
                  color: activeTab === t.id ? 'var(--text-primary)' : 'var(--text-muted)',
                  borderBottom: activeTab === t.id ? '2px solid var(--text-primary)' : '2px solid transparent',
                  transition: 'all 0.2s',
                  marginBottom: '-1px'
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab Content ── */}
        <div style={{ minHeight: '600px' }}>
          {activeTab === 'builder' && <BuilderTab />}
          {activeTab === 'cohort' && <CohortTab />}
          {activeTab === 'announcements' && <AnnouncementsTab />}
        </div>

      </div>
    </div>
  );
}
