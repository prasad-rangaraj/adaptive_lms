import { useState } from 'react';
import { 
  Bot, BrainCircuit, Activity, ShieldAlert, Cpu, 
  Settings, Sparkles, CheckCircle2, LayoutDashboard, EyeOff, FileText, MessageSquare,
  Database, Server, Shield, Coins, AlertOctagon, ChevronDown, Network
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

// ── Custom UI Components ──────────────────────────────────────────────────
function Switch({ checked, onChange, color = 'var(--brand-500)' }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} style={{ width: 44, height: 24, borderRadius: 999, padding: 3, background: checked ? color : 'var(--surface-3)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: checked ? 'flex-end' : 'flex-start', transition: 'all 0.3s ease', flexShrink: 0, boxShadow: checked ? `inset 0 1px 3px rgba(0,0,0,0.1), 0 0 10px ${color}30` : 'inset 0 1px 3px rgba(0,0,0,0.1)' }}>
      <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'white', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', transition: 'all 0.3s ease' }} />
    </button>
  );
}

function SelectMenu({ value, options, onChange }) {
  return (
    <div style={{ position: 'relative', width: '130px' }}>
      <select value={value} onChange={e => onChange(e.target.value)} style={{ width: '100%', appearance: 'none', background: 'var(--surface-2)', border: '1px solid var(--glass-border)', borderRadius: 8, padding: '6px 30px 6px 12px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', cursor: 'pointer', outline: 'none' }}>
        {options.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
      </select>
      <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }} />
    </div>
  );
}

// ── Main Hub ──────────────────────────────────────────────────────────────
export default function OrgAiHub() {
  const { user } = useAuthStore();
  
  // State
  const [strictness, setStrictness] = useState(70);
  const [systemPrompt, setSystemPrompt] = useState("Maintain a highly academic, encouraging tone. Never provide direct answers to quiz questions; guide the student using Socratic questioning.");
  
  const [features, setFeatures] = useState([
    { id: 'tutor', name: 'AI Tutor Assistant', active: true, model: 'gpt-4o', icon: Bot },
    { id: 'evaluator', name: 'AI Assignment Grading', active: true, model: 'claude-3-5', icon: CheckCircle2 },
    { id: 'generator', name: 'Course Content Generation', active: false, model: 'gpt-4o', icon: FileText },
    { id: 'community', name: 'Forum Moderation', active: true, model: 'gemini-1-5', icon: MessageSquare },
  ]);

  const toggleFeature = (id) => setFeatures(features.map(f => f.id === id ? { ...f, active: !f.active } : f));
  const changeModel = (id, model) => setFeatures(features.map(f => f.id === id ? { ...f, model } : f));

  const [privacy, setPrivacy] = useState({ piiMasking: true, zeroRetention: true, shadowMode: false });
  const togglePrivacy = (key) => setPrivacy(p => ({ ...p, [key]: !p[key] }));

  const models = [
    { id: 'gpt-4o', label: 'GPT-4o (Fast)' },
    { id: 'claude-3-5', label: 'Claude 3.5 (Accurate)' },
    { id: 'gemini-1-5', label: 'Gemini 1.5 Pro' }
  ];

  const riskColor = strictness < 50 ? '#10b981' : strictness < 80 ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1.5rem' }}>
        <div>
          <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--brand-500)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>{user?.tenant_id} Administration</p>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.04em', lineHeight: 1.1 }}>AI Orchestration</h1>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Left Column: Tokens, Models, Privacy */}
        <div style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Top Bar: Token Quota & Budgeting */}
          <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(16,185,129,0.3)' }}><Coins size={22} /></div>
              <div>
                <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Monthly Quota</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1, marginTop: 4 }}>4.2M <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ 10M Tokens</span></p>
              </div>
            </div>
            
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Current Usage: 42%</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#10b981' }}>Est. Cost: $42.50</span>
              </div>
              <div style={{ height: 8, background: 'var(--surface-2)', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ width: '42%', height: '100%', background: 'linear-gradient(90deg, #10b981, #059669)', borderRadius: 999 }} />
              </div>
            </div>
          </div>

          {/* Core Feature Routing */}
          <div className="glass-card" style={{ padding: '2rem' }}>
             <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 10 }}>
               <Network size={20} color="var(--brand-500)" />
               Model Routing & Logic
             </h2>
             <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>Enable specific AI capabilities for your organization and assign dedicated LLMs to power each function for optimal cost/performance.</p>
             
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {features.map((f, i) => (
                  <div key={f.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', background: 'var(--surface-0)', border: '1px solid var(--glass-border)', borderRadius: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <f.icon size={18} color={f.active ? 'var(--brand-500)' : 'var(--text-muted)'} />
                      <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: f.active ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{f.name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      <SelectMenu value={f.model} options={models} onChange={(val) => changeModel(f.id, val)} />
                      <div style={{ width: 1, height: 24, background: 'var(--surface-3)' }} />
                      <Switch checked={f.active} onChange={() => toggleFeature(f.id)} />
                    </div>
                  </div>
                ))}
             </div>
          </div>

          {/* Guardrails */}
          <div className="glass-card" style={{ padding: '2rem' }}>
             <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 10 }}>
               <Bot size={20} color="#8b5cf6" />
               Global System Persona
             </h2>
             <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Define universal instructions injected into every AI request made by users within your organization.</p>
             <textarea 
               value={systemPrompt} 
               onChange={e => setSystemPrompt(e.target.value)}
               style={{ width: '100%', minHeight: 100, padding: '1rem', background: 'var(--surface-0)', border: '1px solid var(--glass-border)', borderRadius: 12, color: 'var(--text-primary)', fontSize: '0.875rem', lineHeight: 1.5, resize: 'vertical', outline: 'none' }}
             />
          </div>

        </div>

        {/* Right Column: Compliance & Proctoring */}
        <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Privacy & Compliance */}
          <div className="glass-card" style={{ padding: '2rem', border: '1px solid #10b98130', boxShadow: 'inset 0 0 20px rgba(16,185,129,0.02)' }}>
             <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 10 }}>
               <Shield size={20} color="#10b981" />
               Data Governance
             </h2>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>PII Masking</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2, maxWidth: 180 }}>Auto-redact student names.</p>
                  </div>
                  <Switch checked={privacy.piiMasking} onChange={() => togglePrivacy('piiMasking')} color="#10b981" />
                </div>
                <div style={{ width: '100%', height: 1, background: 'var(--surface-2)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>Zero-Retention</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2, maxWidth: 180 }}>Opt-out of model training.</p>
                  </div>
                  <Switch checked={privacy.zeroRetention} onChange={() => togglePrivacy('zeroRetention')} color="#10b981" />
                </div>
             </div>
          </div>

          {/* Proctoring */}
          <div className="glass-card" style={{ padding: '2rem', border: '1px solid #ef444430' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 10 }}>
               <AlertOctagon size={20} color="#ef4444" />
               Risk Threshold
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>Flag students during exams if telemetry risk exceeds this global limit.</p>
            
            <div style={{ background: 'var(--surface-0)', padding: '1.5rem', borderRadius: 12, border: '1px solid var(--glass-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Lenient</span>
                <span style={{ fontSize: '2.5rem', fontWeight: 900, color: riskColor, lineHeight: 1 }}>{strictness}%</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Strict</span>
              </div>
              <input type="range" min="30" max="85" value={strictness} onChange={e => setStrictness(e.target.value)} style={{ width: '100%', accentColor: riskColor }} />
            </div>

            <div style={{ marginTop: '2rem' }}>
              <p style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12 }}>Active Telemetry</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {['Webcam Face Tracking', 'Microphone Noise', 'Browser Focus'].map((t, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444' }} /> {t}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
