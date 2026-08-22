import { useState, useRef, useEffect } from 'react';
import { aiTutorAPI } from '../../services/api.service';
import { Send, Sparkles, Lightbulb, Hash, FileText, Layers, BookOpen, Paperclip, MessageSquare, History, UserCheck, TerminalSquare, ChevronDown, X } from 'lucide-react';
import toast from 'react-hot-toast';

const COURSE_ID = 1;

const WELCOME = {
  role: 'ai',
  content: "Hi! I'm your AI Tutor. I have full context of your course materials and can explain concepts, generate quizzes, build flashcards, or summarize any topic. What would you like to explore?",
  type: 'explanation',
};

const quickPrompts = [
  { label: 'Explain simply', icon: Lightbulb, prompt: 'Explain this topic in simple terms for a beginner.', color: '#f59e0b' },
  { label: 'Generate quiz', icon: Hash, prompt: 'Generate 5 multiple choice quiz questions on this topic.', color: '#10b981' },
  { label: 'Flashcards', icon: Layers, prompt: 'Create 8 study flashcards for this topic.', color: '#8b5cf6' },
  { label: 'Summarize', icon: FileText, prompt: 'Summarize the key points from the course materials.', color: '#0891b2' },
];

const historySessions = [
  { id: 1, title: 'Normalization Doubts', time: 'Yesterday', context: 'DBMS' },
  { id: 2, title: 'OS Deadlock Prep', time: '2 days ago', context: 'OS Theory' },
  { id: 3, title: 'Pointer Concepts', time: 'Last week', context: 'Data Structures' },
];

const personas = [
  { id: 'tutor', label: 'Tutor Mode', icon: Sparkles },
  { id: 'viva', label: 'Viva Examiner', icon: UserCheck },
  { id: 'debug', label: 'Code Debugger', icon: TerminalSquare },
];

// ── AI Avatar SVG (custom, modern) ────────────────────────────────────────
function AIAvatar({ size = 34 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: 'linear-gradient(135deg, #4f46e5 0%, #8b5cf6 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 4px 12px rgba(79,70,229,0.3)',
    }}>
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none">
        <path d="M12 2L2 7l10 5 10-5-10-5z" fill="rgba(255,255,255,0.9)" />
        <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export default function AiTutorPage() {
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activePersona, setActivePersona] = useState('tutor');
  const [attachedContext, setAttachedContext] = useState(null); 
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setLoading(true);

    try {
      const res = await aiTutorAPI.ask(COURSE_ID, msg);
      const { answer, response_type, sources } = res.data;
      setMessages(prev => [...prev, { role: 'ai', content: answer, type: response_type, sources }]);
    } catch {
      toast.error('AI Tutor unavailable. Check your API key.');
      setMessages(prev => [...prev, { role: 'ai', content: 'Sorry, I ran into an error. Please check your connection and try again.', type: 'error' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 60px)', overflow: 'hidden', margin: '-2rem -2.5rem', background: 'var(--surface-0)' }}>

      {/* ── Left Sidebar (History) ── */}
      <div style={{ width: 280, background: 'var(--surface-0)', borderRight: '1px solid var(--surface-3)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <History size={16} /> Chat History
          </h2>
        </div>
        
        {/* New Chat Button */}
        <div style={{ padding: '0 1rem 1rem' }}>
          <button style={{ width: '100%', padding: '0.75rem', background: 'var(--surface-1)', border: '1px solid var(--surface-3)', borderRadius: 12, color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-1)'}>
            <MessageSquare size={16} /> New Chat
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0 1rem 1rem' }} className="hide-scrollbar">
          <p style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', paddingLeft: '0.5rem' }}>Recent</p>
          {historySessions.map(session => (
            <div key={session.id} style={{ padding: '0.875rem 1rem', borderRadius: 12, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.25rem', transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-1)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{session.title}</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{session.context}</span>
                <span style={{ fontSize: '0.625rem', color: 'var(--text-tertiary)' }}>{session.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main Chat Area ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 10, minWidth: 0 }}>
        
        {/* Subtle Mesh Background */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(at 0% 0%, rgba(79, 70, 229, 0.05) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(139, 92, 246, 0.05) 0px, transparent 50%)', zIndex: -1, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(var(--surface-3) 1px, transparent 1px)', backgroundSize: '32px 32px', opacity: 0.3, zIndex: -1, pointerEvents: 'none' }} />

        {/* ── Top Bar (Floating Personas) ── */}
        <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 10 }}>
          <div style={{ background: 'var(--surface-0)', border: '1px solid var(--surface-3)', borderRadius: 999, padding: '0.375rem', display: 'flex', gap: '0.25rem', boxShadow: '0 8px 24px rgba(0,0,0,0.04)' }}>
            {personas.map(p => (
              <button key={p.id} onClick={() => setActivePersona(p.id)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 999, border: 'none', background: activePersona === p.id ? 'var(--brand-50)' : 'transparent', color: activePersona === p.id ? 'var(--brand-700)' : 'var(--text-secondary)', fontWeight: 800, fontSize: '0.8125rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                <p.icon size={14} /> {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Messages ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 4rem', display: 'flex', flexDirection: 'column', gap: '2rem', position: 'relative', zIndex: 10 }} className="hide-scrollbar">
          <div style={{ height: '2rem' }} /> {/* Spacer */}
          
          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', gap: '1.25rem', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-start' }}>

              {msg.role === 'ai' && <AIAvatar size={36} />}

              <div style={{
                maxWidth: '75%',
                padding: '1.25rem 1.5rem',
                borderRadius: msg.role === 'ai' ? '4px 20px 20px 20px' : '20px 4px 20px 20px',
                background: msg.role === 'ai' ? 'rgba(255, 255, 255, 0.7)' : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                backdropFilter: msg.role === 'ai' ? 'blur(12px)' : 'none',
                border: msg.role === 'ai' ? '1px solid rgba(255, 255, 255, 0.5)' : 'none',
                boxShadow: msg.role === 'ai' ? '0 8px 32px rgba(0,0,0,0.03)' : '0 8px 24px rgba(79,70,229,0.25)',
              }}>
                <p style={{ fontSize: '0.9375rem', lineHeight: 1.65, whiteSpace: 'pre-wrap', color: msg.role === 'user' ? 'white' : 'var(--text-primary)', margin: 0 }}>
                  {msg.content}
                </p>
                {msg.sources?.length > 0 && (
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: msg.role === 'user' ? '1px solid rgba(255,255,255,0.2)' : '1px solid var(--surface-3)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <BookOpen size={12} color={msg.role === 'user' ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)'} />
                    <p style={{ fontSize: '0.75rem', color: msg.role === 'user' ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)' }}>Sources: {msg.sources.join(', ')}</p>
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--surface-1)', border: '1px solid var(--surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'var(--text-secondary)', fontSize: '0.8125rem', flexShrink: 0 }}>
                  U
                </div>
              )}
            </div>
          ))}

          {/* ── Typing Indicator ── */}
          {loading && (
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
              <AIAvatar size={36} />
              <div style={{ padding: '1.25rem 1.5rem', borderRadius: '4px 20px 20px 20px', background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.5)', display: 'flex', gap: 6, alignItems: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.03)' }}>
                {[0, 0.15, 0.3].map((delay, j) => (
                  <div key={j} style={{ width: 8, height: 8, borderRadius: '50%', background: '#8b5cf6', animation: `bounce 1.2s ease-in-out ${delay}s infinite` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} style={{ height: '1rem' }} />
        </div>

        {/* ── Input Area ── */}
        <div style={{ padding: '0 4rem 0', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Quick Prompts (Floating above input) */}
          <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }} className="hide-scrollbar">
            {quickPrompts.map(({ label, icon: Icon, prompt, color }) => (
              <button
                key={label}
                onClick={() => sendMessage(prompt)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 999, flexShrink: 0, background: 'var(--surface-0)', border: '1px solid var(--surface-3)', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 800, color: 'var(--text-secondary)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.color = color; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--surface-3)'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>

          {/* Context Attachment Badge */}
          {attachedContext && (
            <div style={{ alignSelf: 'flex-start', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '6px 14px', borderRadius: 999, display: 'flex', alignItems: 'center', gap: 8, marginBottom: '-0.5rem' }}>
              <FileText size={14} color="#059669" />
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#059669' }}>Context: {attachedContext.name}</span>
              <button onClick={() => setAttachedContext(null)} style={{ background: 'transparent', border: 'none', color: '#059669', cursor: 'pointer', display: 'flex', padding: 0, marginLeft: 4 }}>
                <X size={14} />
              </button>
            </div>
          )}

          {/* Main Input Box */}
          <div style={{ background: 'var(--surface-0)', border: '1.5px solid var(--surface-3)', borderRadius: 24, padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'flex-end', gap: '0.75rem', boxShadow: '0 12px 40px rgba(0,0,0,0.06)', transition: 'border-color 0.2s' }}
               onFocusCapture={e => e.currentTarget.style.borderColor = 'var(--brand-400)'}
               onBlurCapture={e => e.currentTarget.style.borderColor = 'var(--surface-3)'}>
            
            <button onClick={() => setAttachedContext({ name: 'CA1 Exam Syllabus' })} style={{ width: 44, height: 44, borderRadius: 16, flexShrink: 0, border: 'none', background: 'var(--surface-1)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', marginBottom: 2 }} onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-1)'} title="Attach Context">
              <Paperclip size={20} />
            </button>

            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="Ask anything... (Shift + Enter for new line)"
              rows={1}
              style={{ flex: 1, padding: '0.875rem 0.5rem', background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '0.9375rem', outline: 'none', resize: 'none', minHeight: 48, maxHeight: 150, fontFamily: 'inherit', lineHeight: 1.5 }}
            />

            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              style={{
                width: 44, height: 44, borderRadius: 16, flexShrink: 0, border: 'none',
                background: loading || !input.trim() ? 'var(--surface-2)' : 'var(--text-primary)',
                color: loading || !input.trim() ? 'var(--text-muted)' : 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                boxShadow: loading || !input.trim() ? 'none' : '0 4px 12px rgba(0,0,0,0.15)',
                transition: 'all 0.2s',
                marginBottom: 2
              }}
            >
              <Send size={18} />
            </button>
          </div>
          <p style={{ textAlign: 'center', fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>AI Tutor can make mistakes. Verify important information.</p>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
