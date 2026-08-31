import { useState, useRef, useEffect } from 'react';
import { aiTutorAPI } from '../../lib/api';
import { Bot, Send, Sparkles, BookOpen, Lightbulb, Hash, FileText, Layers, Cpu } from 'lucide-react';
import toast from 'react-hot-toast';

const COURSE_ID = 1;

const WELCOME = {
  role: 'ai',
  content: "Hello! I'm your AI Tutor powered by GPT-4o. I answer questions based on your specific course materials using semantic search. Ask me anything — or try one of the quick prompts below!",
  type: 'explanation',
};

const quickPrompts = [
  { label: 'Explain simply', icon: Lightbulb, prompt: 'Explain this topic in simple terms for a beginner.', color: '#d97706' },
  { label: 'Generate quiz', icon: Hash, prompt: 'Generate 5 multiple choice quiz questions on this topic.', color: '#059669' },
  { label: 'Flashcards', icon: Layers, prompt: 'Create 8 study flashcards for this topic.', color: '#7c3aed' },
  { label: 'Summarize', icon: FileText, prompt: 'Summarize the key points from the course materials.', color: '#0369a1' },
];

const typeColors = {
  explanation: '#4f46e5',
  quiz: '#059669',
  flashcard: '#7c3aed',
  summary: '#0369a1',
};

export default function AiTutorPage() {
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

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
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 9rem)', gap: '1rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ position: 'relative' }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(99,102,241,0.5)',
            flexShrink: 0,
          }}>
            <Bot size={24} color="white" />
          </div>
          <div style={{
            position: 'absolute', bottom: 0, right: 0,
            width: 12, height: 12, borderRadius: '50%',
            background: '#10b981', border: '2px solid var(--surface-0)',
            boxShadow: '0 0 8px rgba(16,185,129,0.6)',
          }} />
        </div>
        <div style={{ flex: 1 }}>
          <h1 className="page-title" style={{ fontSize: '1.375rem' }}>AI Tutor</h1>
          <p style={{ color: '#9ca3af', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: 5 }}>
            <Cpu size={11} /> GPT-4o · Context from your course via pgvector RAG
          </p>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '5px 14px', borderRadius: 999,
          background: '#ecfdf5', border: '1px solid #bbf7d0',
          color: '#059669', fontSize: '0.8125rem', fontWeight: 600,
        }}>
          <div className="live-dot" style={{ width: 7, height: 7 }} />
          Online
        </div>
      </div>

      {/* Chat Area */}
      <div className="card" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: 0 }}>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.75rem', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}
              className="animate-fade-up">
              {msg.role === 'ai' && (
                <div style={{
                  width: 34, height: 34, borderRadius: 10, flexShrink: 0, marginTop: 2,
                  background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(99,102,241,0.35)',
                }}>
                  <Bot size={17} color="white" />
                </div>
              )}

              <div className={msg.role === 'ai' ? 'chat-bubble-ai' : 'chat-bubble-user'}>
                <p style={{ fontSize: '0.9375rem', lineHeight: 1.7, whiteSpace: 'pre-wrap', color: msg.role === 'user' ? 'white' : 'var(--text-primary)' }}>{msg.content}</p>
                {msg.type && msg.type !== 'explanation' && msg.type !== 'error' && (
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    marginTop: 10, padding: '3px 10px', borderRadius: 999,
                    background: `${typeColors[msg.type]}15`,
                    border: `1px solid ${typeColors[msg.type]}30`,
                    color: typeColors[msg.type], fontSize: '0.75rem', fontWeight: 600,
                  }}>
                    <Sparkles size={11} /> {msg.type}
                  </div>
                )}
                {msg.sources?.length > 0 && (
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <BookOpen size={11} color="var(--text-muted)" />
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>From: {msg.sources.join(', ')}</p>
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="avatar" style={{ width: 34, height: 34, fontSize: '0.8125rem', flexShrink: 0, marginTop: 2 }}>
                  U
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div style={{ display: 'flex', gap: '0.75rem' }} className="animate-fade-in">
              <div style={{
                width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(99,102,241,0.35)',
              }}>
                <Bot size={17} color="white" />
              </div>
              <div className="chat-bubble-ai" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                {[0, 0.15, 0.3].map((delay, j) => (
                  <div key={j} style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #818cf8, #a78bfa)',
                    animation: `bounce 1.2s ease-in-out ${delay}s infinite`,
                  }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick prompts */}
        <div style={{
          padding: '0.875rem 1.5rem',
          borderTop: '1px solid #f0f1f3',
          display: 'flex', gap: 8, overflowX: 'auto',
          background: '#fafbff',
        }}>
          {quickPrompts.map(({ label, icon: Icon, prompt, color }) => (
            <button
              key={label}
              onClick={() => sendMessage(prompt)}
              className="chip"
              style={{ flexShrink: 0 }}
            >
              <Icon size={13} color={color} /> {label}
            </button>
          ))}
        </div>

        {/* Input area */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid #f0f1f3',
          display: 'flex', gap: '0.75rem', alignItems: 'flex-end',
          background: '#ffffff',
        }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Ask anything about your course... (Enter to send)"
            rows={2}
            className="input"
            style={{ resize: 'none', minHeight: 52, maxHeight: 120 }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="btn btn-primary btn-icon"
            style={{ width: 48, height: 48, borderRadius: 13, flexShrink: 0 }}
          >
            <Send size={18} />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
