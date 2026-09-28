import { useState, useEffect } from 'react';
import { 
  Bot, BrainCircuit, Activity, ShieldAlert, Cpu, 
  Settings, Sparkles, CheckCircle2, LayoutDashboard, EyeOff, FileText, MessageSquare,
  Database, Server, Shield, Coins, AlertOctagon, ChevronDown, Network
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orgAIAPI } from '../../services/api.service';
import toast from 'react-hot-toast';

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
  const queryClient = useQueryClient();
  
  const [localPrompt, setLocalPrompt] = useState("");

  const { data: settings, isLoading } = useQuery({
    queryKey: ['orgAISettings', user.tenant_id],
    queryFn: () => orgAIAPI.getSettings(user.tenant_id).then(res => res.data)
  });

  // Sync local prompt when settings load
  useEffect(() => {
    if (settings?.system_prompt) {
      setLocalPrompt(settings.system_prompt);
    }
  }, [settings?.system_prompt]);

  const mutation = useMutation({
    mutationFn: (data) => orgAIAPI.updateSettings(user.tenant_id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['orgAISettings', user.tenant_id]);
      toast.success('AI Settings updated');
    },
    onError: () => toast.error('Failed to update settings')
  });

  if (isLoading || !settings) return <div style={{ padding: '2rem' }}>Loading AI settings...</div>;

  const strictness = settings.strictness_threshold ?? 70;
  const systemPrompt = settings.system_prompt ?? "";
  
  const features = [
    { id: 'tutor', name: 'AI Tutor Assistant', active: settings.tutor_active, model: settings.tutor_model, icon: Bot },
    { id: 'evaluator', name: 'AI Assignment Grading', active: settings.evaluator_active, model: settings.evaluator_model, icon: CheckCircle2 },
    { id: 'generator', name: 'Course Content Generation', active: settings.generator_active, model: settings.generator_model, icon: FileText },
    { id: 'community', name: 'Forum Moderation', active: settings.community_active, model: settings.community_model, icon: MessageSquare },
  ];

  const toggleFeature = (id) => mutation.mutate({ [`${id}_active`]: !settings[`${id}_active`] });
  const changeModel = (id, model) => mutation.mutate({ [`${id}_model`]: model });

  const privacy = { 
    piiMasking: settings.pii_masking, 
    zeroRetention: settings.zero_retention 
  };
  const togglePrivacy = (key) => mutation.mutate({ 
    pii_masking: key === 'piiMasking' ? !privacy.piiMasking : privacy.piiMasking,
    zero_retention: key === 'zeroRetention' ? !privacy.zeroRetention : privacy.zeroRetention,
  });

  const models = [
    { id: 'gpt-4o', label: 'GPT-4o (Fast)' },
    { id: 'claude-3-5', label: 'Claude 3.5 (Accurate)' },
    { id: 'gemini-1-5', label: 'Gemini 1.5 Pro' }
  ];

  const riskColor = strictness < 50 ? '#10b981' : strictness < 80 ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1.5rem' }}>
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
               value={localPrompt} 
               onChange={e => setLocalPrompt(e.target.value)}
               onBlur={() => mutation.mutate({ system_prompt: localPrompt })}
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
              <input type="range" min="30" max="85" value={strictness} onChange={e => mutation.mutate({ strictness_threshold: parseInt(e.target.value) })} style={{ width: '100%', accentColor: riskColor }} />
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
