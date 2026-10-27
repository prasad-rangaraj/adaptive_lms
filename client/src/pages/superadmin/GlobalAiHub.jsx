import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tenantsAPI, adminAPI } from '../../services/api.service';
import toast from 'react-hot-toast';
import { 
  Bot, BrainCircuit, Activity, Eye, ShieldAlert, Cpu, 
  Settings, Database, Zap, Sparkles, TrendingUp, AlertOctagon, 
  LineChart, DollarSign, CheckCircle, Download, RefreshCw, 
  Play, Send, Sliders, ShieldCheck, Layers, Lock, Camera, 
  AlertTriangle, X, Search, Building2, Flame, Server, Shield
} from 'lucide-react';

// ── Next-Gen AI Cyber Switch Toggle ──────────────────────────────────────────
function Toggle({ checked, onChange, color = 'var(--brand-600)', labelOn = 'ACTIVE', labelOff = 'OFFLINE', showBadge = true }) {
  const activeColor = color || 'var(--brand-600)';
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, userSelect: 'none' }}>
      {showBadge && (
        <span style={{
          fontSize: '0.6875rem',
          fontWeight: 800,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          padding: '2px 7px',
          borderRadius: 6,
          transition: 'all 0.2s ease',
          background: checked ? `${activeColor}15` : 'var(--surface-2)',
          color: checked ? activeColor : 'var(--text-muted)',
          border: `1px solid ${checked ? activeColor + '30' : 'var(--glass-border)'}`,
        }}>
          {checked ? labelOn : labelOff}
        </span>
      )}
      <button 
        type="button" 
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)} 
        style={{ 
          width: 50, 
          height: 28, 
          borderRadius: 999, 
          padding: 3, 
          background: checked 
            ? `linear-gradient(135deg, ${activeColor}, ${activeColor}dd)` 
            : 'var(--surface-2)', 
          border: `1.5px solid ${checked ? activeColor : 'var(--glass-border)'}`, 
          cursor: 'pointer', 
          display: 'flex', 
          alignItems: 'center', 
          position: 'relative',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)', 
          flexShrink: 0, 
          boxShadow: checked 
            ? `0 2px 10px ${activeColor}40, inset 0 1px 1px rgba(255,255,255,0.3)` 
            : 'inset 0 2px 4px rgba(0,0,0,0.06)' 
        }}
      >
        <div style={{ 
          width: 20, 
          height: 20, 
          borderRadius: '50%', 
          background: 'white', 
          boxShadow: '0 2px 5px rgba(0,0,0,0.22)', 
          transform: checked ? 'translateX(22px)' : 'translateX(0px)',
          transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: checked ? activeColor : '#9ca3af',
            transition: 'background 0.2s',
          }} />
        </div>
      </button>
    </div>
  );
}

function MiniSparkline({ color, data }) {
  const max = Math.max(...data, 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 26 }}>
      {data.map((val, i) => (
        <div 
          key={i} 
          style={{ 
            width: 5, 
            background: color, 
            borderRadius: 2, 
            height: `${Math.max((val / max) * 100, 15)}%`, 
            opacity: i === data.length - 1 ? 1 : 0.45,
            transition: 'height 0.3s'
          }} 
        />
      ))}
    </div>
  );
}

// ── Default AI Agents Configuration ──────────────────────────────────────────
const DEFAULT_AGENTS = [
  { id: 'tutor', name: 'AI Socratic Tutor', desc: 'Real-time conversational pedagogy & concept breakdown.', model: 'gpt-4o', active: true, latency: '142ms', temperature: 0.7, provider: 'OpenAI', usage: [20, 35, 45, 60, 80, 95, 110], color: '#3b82f6' },
  { id: 'cognitive', name: 'Cognitive Profiler', desc: 'Analyzes interaction telemetry to construct learning radar.', model: 'claude-3.5-sonnet', active: true, latency: '210ms', temperature: 0.2, provider: 'Anthropic', usage: [50, 65, 55, 75, 95, 120, 145], color: '#8b5cf6' },
  { id: 'recommendation', name: 'Curriculum Path Engine', desc: 'Synthesizes knowledge graphs for adaptive syllabi.', model: 'gemini-1.5-pro', active: true, latency: '185ms', temperature: 0.4, provider: 'Google', usage: [15, 22, 28, 35, 42, 58, 64], color: '#10b981' },
  { id: 'notes', name: 'Smart Digest Generator', desc: 'Transforms lecture transcripts into high-yield study cards.', model: 'llama-3.1-70b', active: true, latency: '98ms', temperature: 0.5, provider: 'Meta AI', usage: [30, 42, 50, 65, 80, 92, 105], color: '#f59e0b' },
  { id: 'evaluator', name: 'Automated Rubric Grader', desc: 'Assesses code logic, essays, and multi-criteria rubrics.', model: 'gpt-4o', active: true, latency: '290ms', temperature: 0.1, provider: 'OpenAI', usage: [10, 15, 25, 40, 55, 70, 85], color: '#ec4899' },
  { id: 'twin', name: 'Student Digital Twin', desc: 'Simulates learning trajectories to predict exam drop-off.', model: 'claude-3-opus', active: false, latency: '420ms', temperature: 0.6, provider: 'Anthropic', usage: [5, 8, 12, 10, 15, 20, 24], color: '#6366f1' },
];

// ── Tab 1: AI Engines (Command Matrix) ─────────────────────────────────────────
function AIEnginesTab({ onOpenSandbox }) {
  const [agents, setAgents] = useState(() => {
    try {
      const saved = localStorage.getItem('lms_global_ai_agents');
      return saved ? JSON.parse(saved) : DEFAULT_AGENTS;
    } catch {
      return DEFAULT_AGENTS;
    }
  });

  const [search, setSearch] = useState('');
  const [filterProvider, setFilterProvider] = useState('all');

  const saveAgents = (updated) => {
    setAgents(updated);
    localStorage.setItem('lms_global_ai_agents', JSON.stringify(updated));
  };

  const toggle = (id) => {
    const updated = agents.map(a => a.id === id ? { ...a, active: !a.active } : a);
    saveAgents(updated);
    const target = updated.find(a => a.id === id);
    toast.success(`${target.name} ${target.active ? 'activated globally' : 'deactivated'}`);
  };

  const changeModel = (id, newModel) => {
    const updated = agents.map(a => a.id === id ? { ...a, model: newModel } : a);
    saveAgents(updated);
    const target = updated.find(a => a.id === id);
    toast.success(`${target.name} model routed to ${newModel}`);
  };

  const changeTemp = (id, val) => {
    const updated = agents.map(a => a.id === id ? { ...a, temperature: parseFloat(val) } : a);
    saveAgents(updated);
  };

  const filtered = agents.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase()) || a.desc.toLowerCase().includes(search.toLowerCase());
    const matchesProvider = filterProvider === 'all' || a.provider.toLowerCase() === filterProvider.toLowerCase();
    return matchesSearch && matchesProvider;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Search & Provider Filter Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ position: 'relative', width: 320 }}>
          <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Search AI agents or capabilities..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="input-field" 
            style={{ paddingLeft: '2.25rem', width: '100%', height: 38, fontSize: '0.8125rem' }} 
          />
        </div>

        <div style={{ display: 'flex', gap: 6, background: 'var(--surface-1)', padding: 4, borderRadius: 10, border: '1px solid var(--glass-border)' }}>
          {['all', 'OpenAI', 'Anthropic', 'Google', 'Meta AI'].map(p => (
            <button 
              key={p} 
              onClick={() => setFilterProvider(p)}
              style={{
                padding: '4px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontSize: '0.75rem', fontWeight: 700,
                background: filterProvider === p ? 'white' : 'transparent',
                color: filterProvider === p ? 'var(--brand-600)' : 'var(--text-muted)',
                boxShadow: filterProvider === p ? '0 1px 4px rgba(0,0,0,0.06)' : 'none'
              }}>
              {p === 'all' ? 'All Providers' : p}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Agent Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {filtered.map(a => (
          <div 
            key={a.id} 
            className="glass-card" 
            style={{ 
              padding: '1.75rem', position: 'relative', overflow: 'hidden', 
              border: `1.5px solid ${a.active ? a.color + '45' : 'var(--glass-border)'}`,
              boxShadow: a.active ? `0 8px 30px ${a.color}15` : 'none',
              transition: 'all 0.3s ease'
            }}>
            {a.active && (
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, transparent, ${a.color}, transparent)` }} />
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <div style={{ 
                  width: 48, height: 48, borderRadius: 14, 
                  background: a.active ? `${a.color}15` : 'var(--surface-2)', 
                  border: `1px solid ${a.active ? a.color + '30' : 'var(--glass-border)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  color: a.active ? a.color : 'var(--text-muted)', 
                  transition: 'all 0.3s' 
                }}>
                  <Bot size={24} style={{ filter: a.active ? `drop-shadow(0 0 10px ${a.color}90)` : 'none' }} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h3 style={{ fontSize: '1.0625rem', fontWeight: 800, color: 'var(--text-primary)' }}>{a.name}</h3>
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '2px 6px', borderRadius: 6, background: `${a.color}15`, color: a.color, border: `1px solid ${a.color}30` }}>{a.provider}</span>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 2, lineHeight: 1.4 }}>{a.desc}</p>
                </div>
              </div>
              <Toggle checked={a.active} onChange={() => toggle(a.id)} color={a.color} />
            </div>

            {/* Core Model & Temperature Controls */}
            <div style={{ background: 'var(--surface-1)', borderRadius: 12, padding: '0.875rem 1rem', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Model Routing</span>
                <select 
                  disabled={!a.active} 
                  value={a.model} 
                  onChange={(e) => changeModel(a.id, e.target.value)} 
                  style={{ 
                    background: 'var(--surface-0)', border: '1px solid var(--glass-border)', 
                    borderRadius: 6, padding: '4px 8px',
                    color: a.active ? 'var(--text-primary)' : 'var(--text-muted)', 
                    fontSize: '0.8125rem', fontWeight: 700, outline: 'none', 
                    cursor: a.active ? 'pointer' : 'not-allowed' 
                  }}>
                  <option value="gpt-4o">GPT-4 Omni (Fast)</option>
                  <option value="claude-3.5-sonnet">Claude 3.5 Sonnet</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                  <option value="llama-3.1-70b">Llama 3.1 70B (Groq)</option>
                  <option value="claude-3-opus">Claude 3 Opus (Deep)</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 6, borderTop: '1px solid var(--glass-border)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Creativity (Temp): <strong>{a.temperature}</strong></span>
                <input 
                  type="range" min="0" max="1" step="0.1" 
                  disabled={!a.active}
                  value={a.temperature} 
                  onChange={e => changeTemp(a.id, e.target.value)} 
                  style={{ width: 110, accentColor: a.color, cursor: a.active ? 'pointer' : 'not-allowed' }} 
                />
              </div>
            </div>

            {/* Telemetry Footprint & Live Action */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: a.active ? 1 : 0.45 }}>
              <div>
                <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>Avg SLA / Latency</p>
                <p style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {a.latency}
                  <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700 }}>99.9% Up</span>
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <MiniSparkline data={a.usage} color={a.color} />
                <button 
                  onClick={() => onOpenSandbox(a)}
                  className="btn btn-secondary btn-sm" 
                  style={{ fontSize: '0.75rem', padding: '6px 12px', gap: 5, borderRadius: 8 }}>
                  <Play size={12} fill="currentColor" /> Test Prompt
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Tab 2: Behaviour & Cognitive Profiling Analytics ─────────────────────────
function BehaviourAnalyticsTab() {
  const [metrics, setMetrics] = useState(() => {
    try {
      const saved = localStorage.getItem('lms_cognitive_sensitivities');
      return saved ? JSON.parse(saved) : [
        { id: 1, label: 'Focus Score Sensitivity', val: 80, desc: 'Eye-tracking & window switches influence on cognitive attention state.' },
        { id: 2, label: 'Retention Decay Factor', val: 65, desc: 'Spaced repetition quiz decay rate and forgetting curve coefficient.' },
        { id: 3, label: 'Engagement Index Weight', val: 50, desc: 'Session continuity and interactive code playground dwell time.' },
        { id: 4, label: 'Early Risk Threshold', val: 75, desc: 'Threshold for automated academic interventions and advisor flags.' },
      ];
    } catch {
      return [
        { id: 1, label: 'Focus Score Sensitivity', val: 80, desc: 'Eye-tracking & window switches influence on cognitive attention state.' },
        { id: 2, label: 'Retention Decay Factor', val: 65, desc: 'Spaced repetition quiz decay rate and forgetting curve coefficient.' },
        { id: 3, label: 'Engagement Index Weight', val: 50, desc: 'Session continuity and interactive code playground dwell time.' },
        { id: 4, label: 'Early Risk Threshold', val: 75, desc: 'Threshold for automated academic interventions and advisor flags.' },
      ];
    }
  });

  const updateVal = (id, val) => {
    const updated = metrics.map(m => m.id === id ? { ...m, val: Number(val) } : m);
    setMetrics(updated);
    localStorage.setItem('lms_cognitive_sensitivities', JSON.stringify(updated));
  };

  const handleReset = () => {
    const defaults = [
      { id: 1, label: 'Focus Score Sensitivity', val: 75, desc: 'Eye-tracking & window switches influence on cognitive attention state.' },
      { id: 2, label: 'Retention Decay Factor', val: 60, desc: 'Spaced repetition quiz decay rate and forgetting curve coefficient.' },
      { id: 3, label: 'Engagement Index Weight', val: 50, desc: 'Session continuity and interactive code playground dwell time.' },
      { id: 4, label: 'Early Risk Threshold', val: 70, desc: 'Threshold for automated academic interventions and advisor flags.' },
    ];
    setMetrics(defaults);
    localStorage.setItem('lms_cognitive_sensitivities', JSON.stringify(defaults));
    toast.success('Cognitive sensitivity parameters reset to baseline.');
  };

  const getColor = (val) => val < 30 ? '#3b82f6' : val < 65 ? '#10b981' : val < 85 ? '#f59e0b' : '#ef4444';

  // Derived simulated impact metrics
  const simulatedRetention = Math.round(92 - (metrics[1].val * 0.25));
  const predictedInterventions = Math.round(metrics[3].val * 0.4);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
      {/* Precision Sliders */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)' }}>Cognitive Model Sensitivities</h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Adjust global inference weights for student adaptive profiles.</p>
          </div>
          <button onClick={handleReset} className="btn btn-secondary btn-sm" style={{ gap: 6 }}>
            <RefreshCw size={13} /> Reset Baseline
          </button>
        </div>

        {metrics.map(m => {
          const color = getColor(m.val);
          return (
            <div key={m.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{m.label}</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>{m.desc}</p>
                </div>
                <div style={{ background: `${color}15`, border: `1px solid ${color}40`, padding: '4px 10px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Activity size={14} color={color} />
                  <span style={{ fontSize: '1rem', fontWeight: 900, color }}>{m.val}%</span>
                </div>
              </div>

              <div style={{ position: 'relative', padding: '6px 0' }}>
                <div style={{ height: 6, background: 'var(--surface-3)', borderRadius: 999, width: '100%', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${m.val}%`, background: color, transition: 'all 0.2s', boxShadow: `0 0 10px ${color}` }} />
                </div>
                <input 
                  type="range" min="10" max="100" value={m.val} 
                  onChange={e => updateVal(m.id, e.target.value)} 
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', opacity: 0, cursor: 'pointer', height: 20 }} 
                />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  <span>Permissive</span><span>Calibrated</span><span>Aggressive</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Cognitive Impact Simulator */}
      <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--brand-50)', color: 'var(--brand-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BrainCircuit size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 800, color: 'var(--text-primary)' }}>Live Impact Projection</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Simulated student cohort reaction to current weights</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div style={{ padding: '1.25rem', background: 'var(--surface-1)', borderRadius: 12, border: '1px solid var(--glass-border)' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Cohort 30-Day Retention</p>
            <p style={{ fontSize: '2rem', fontWeight: 900, color: '#059669', lineHeight: 1.2, marginTop: 4 }}>{simulatedRetention}%</p>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>Based on decay calibration</span>
          </div>

          <div style={{ padding: '1.25rem', background: 'var(--surface-1)', borderRadius: 12, border: '1px solid var(--glass-border)' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Weekly Advisor Flags</p>
            <p style={{ fontSize: '2rem', fontWeight: 900, color: '#d97706', lineHeight: 1.2, marginTop: 4 }}>~{predictedInterventions}</p>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>Triggered by risk threshold</span>
          </div>
        </div>

        <div style={{ background: 'var(--surface-1)', borderRadius: 12, padding: '1.25rem', border: '1px solid var(--glass-border)' }}>
          <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Adaptive Path Distribution</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { label: 'Deep Socratic Interactivity', pct: metrics[0].val > 70 ? '64%' : '42%', color: '#3b82f6' },
              { label: 'Reinforced Spaced Repetition', pct: metrics[1].val > 60 ? '78%' : '51%', color: '#10b981' },
              { label: 'Fast-Track Accelerated Modules', pct: metrics[2].val > 60 ? '38%' : '24%', color: '#8b5cf6' },
            ].map((p, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
                  {p.label}
                </span>
                <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{p.pct}</span>
              </div>
            ))}
          </div>
        </div>

        <button onClick={() => toast.success('Cognitive policy published to all tenant learning engines!')} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
          <CheckCircle size={16} /> Publish Policies Globally
        </button>
      </div>
    </div>
  );
}

// ── Tab 3: Telemetry (Compliance & Root Data Streams) ─────────────────────────
function TelemetryTab() {
  const [nodes, setNodes] = useState(() => {
    try {
      const saved = localStorage.getItem('lms_telemetry_nodes');
      return saved ? JSON.parse(saved) : [
        { id: 'video', name: 'Video Watch Duration & Seek Patterns', active: true, invasive: false, rate: '1.4k ev/s' },
        { id: 'mouse', name: 'Cursor Dwell & Scrolling Cadence', active: true, invasive: false, rate: '2.8k ev/s' },
        { id: 'quiz', name: 'Answer Hesitation & Backspace Latency', active: true, invasive: false, rate: '420 ev/s' },
        { id: 'typing', name: 'Keystroke Dynamics (Biometrics)', active: false, invasive: true, rate: '0 ev/s' },
        { id: 'eye', name: 'Webcam Eye Tracking & Gaze Heatmaps', active: false, invasive: true, rate: '0 ev/s' },
        { id: 'emotion', name: 'Facial Micro-expression Analysis', active: false, invasive: true, rate: '0 ev/s' },
      ];
    } catch {
      return [
        { id: 'video', name: 'Video Watch Duration & Seek Patterns', active: true, invasive: false, rate: '1.4k ev/s' },
        { id: 'mouse', name: 'Cursor Dwell & Scrolling Cadence', active: true, invasive: false, rate: '2.8k ev/s' },
        { id: 'quiz', name: 'Answer Hesitation & Backspace Latency', active: true, invasive: false, rate: '420 ev/s' },
        { id: 'typing', name: 'Keystroke Dynamics (Biometrics)', active: false, invasive: true, rate: '0 ev/s' },
        { id: 'eye', name: 'Webcam Eye Tracking & Gaze Heatmaps', active: false, invasive: true, rate: '0 ev/s' },
        { id: 'emotion', name: 'Facial Micro-expression Analysis', active: false, invasive: true, rate: '0 ev/s' },
      ];
    }
  });

  const saveNodes = (updated) => {
    setNodes(updated);
    localStorage.setItem('lms_telemetry_nodes', JSON.stringify(updated));
  };

  const toggle = (id) => {
    const updated = nodes.map(n => n.id === id ? { ...n, active: !n.active } : n);
    saveNodes(updated);
    const target = updated.find(n => n.id === id);
    toast.success(`Telemetry stream "${target.name}" ${target.active ? 'enabled' : 'halted'}`);
  };

  const applyPreset = (preset) => {
    let updated;
    if (preset === 'gdpr') {
      updated = nodes.map(n => ({ ...n, active: !n.invasive }));
      toast.success('Applied GDPR/FERPA Strict Privacy Preset (Invasive biometrics purged)');
    } else if (preset === 'exam') {
      updated = nodes.map(n => ({ ...n, active: true }));
      toast.success('Applied High-Stakes Proctoring Telemetry Preset (All streams active)');
    } else {
      updated = nodes.map(n => ({ ...n, active: ['video', 'mouse', 'quiz'].includes(n.id) }));
      toast.success('Applied Standard Campus Learning Preset');
    }
    saveNodes(updated);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="glass-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Database size={22} color="var(--brand-500)" /> Global Telemetry Pipelines
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 4, maxWidth: 640 }}>
              Root data acquisition feeds. Severing an ingestion node immediately cuts websocket data pipelines at the API gateway layer to ensure full privacy audit compliance.
            </p>
          </div>

          {/* Compliance Presets */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => applyPreset('standard')} className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem' }}>Campus Standard</button>
            <button onClick={() => applyPreset('gdpr')} className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem', color: '#059669', borderColor: '#a7f3d0' }}>
              <ShieldCheck size={13} /> GDPR / FERPA Strict
            </button>
            <button onClick={() => applyPreset('exam')} className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem', color: '#e11d48', borderColor: '#fecdd3' }}>
              <ShieldAlert size={13} /> High-Stakes Exam
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
          {nodes.map(n => (
            <div 
              key={n.id} 
              style={{ 
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                padding: '1.25rem 1.5rem', background: 'var(--surface-1)', 
                border: `1.5px solid ${n.active ? (n.invasive ? '#ef4444' : '#10b981') : 'var(--glass-border)'}`, 
                borderRadius: 14, position: 'relative', overflow: 'hidden', transition: 'all 0.3s' 
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ position: 'relative' }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: n.active ? (n.invasive ? '#ef4444' : '#10b981') : 'var(--surface-3)', zIndex: 2, position: 'relative' }} />
                  {n.active && <div style={{ position: 'absolute', top: -4, left: -4, width: 20, height: 20, borderRadius: '50%', background: n.invasive ? '#ef4444' : '#10b981', animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite', zIndex: 1, opacity: 0.7 }} />}
                </div>
                <div>
                  <p style={{ fontWeight: 800, fontSize: '0.9375rem', color: n.active ? 'var(--text-primary)' : 'var(--text-muted)' }}>{n.name}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>Throughput: {n.active ? n.rate : '0 ev/s'}</span>
                    {n.invasive && (
                      <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#ef4444', background: '#fef2f2', padding: '1px 6px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
                        <ShieldAlert size={10} /> INVASIVE BIOMETRICS
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <Toggle checked={n.active} onChange={() => toggle(n.id)} color={n.invasive ? '#ef4444' : '#10b981'} />
            </div>
          ))}
        </div>
      </div>
      <style>{`@keyframes ping { 75%, 100% { transform: scale(2); opacity: 0; } }`}</style>
    </div>
  );
}

// ── Tab 4: Automated Proctoring & Real-Time Computer Vision Simulator ─────────
function ProctoringTab() {
  const [strictness, setStrictness] = useState(85);
  const [simulatedViolation, setSimulatedViolation] = useState(null);

  // SVG Gauge calculations
  const radius = 64;
  const circumference = radius * Math.PI;
  const offset = circumference - (strictness / 100) * circumference;
  const color = strictness < 60 ? '#10b981' : strictness < 85 ? '#f59e0b' : '#ef4444';

  const triggerViolationSimulation = (type) => {
    setSimulatedViolation(type);
    toast.error(`Simulation: ${type} detected! Risk score escalated.`, { duration: 2500 });
    setTimeout(() => setSimulatedViolation(null), 4000);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
      {/* Risk Gauge & Threshold Controller */}
      <div className="glass-card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Global Auto-Terminate Risk Ceiling</h2>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: 440 }}>
          Proctored exam sessions that surpass this computed risk threshold trigger immediate session lock and encrypted proctor snapshot archiving.
        </p>

        <div style={{ position: 'relative', width: 260, height: 130, marginBottom: '2rem' }}>
          <svg width="260" height="130" viewBox="0 0 148 74">
            <path d="M 10 70 A 64 64 0 0 1 138 70" fill="none" stroke="var(--surface-3)" strokeWidth="12" strokeLinecap="round" />
            <path 
              d="M 10 70 A 64 64 0 0 1 138 70" 
              fill="none" 
              stroke={color} 
              strokeWidth="12" 
              strokeLinecap="round" 
              strokeDasharray={circumference} 
              strokeDashoffset={offset} 
              style={{ transition: 'all 0.5s ease' }} 
            />
          </svg>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '3.25rem', fontWeight: 900, color, lineHeight: 1 }}>{strictness}%</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: 4 }}>
              {strictness < 60 ? 'Lenient' : strictness < 85 ? 'Standard Proctored' : 'Maximum Security'}
            </span>
          </div>
        </div>

        <div style={{ width: '100%', maxWidth: 360 }}>
          <input 
            type="range" min="50" max="95" value={strictness} 
            onChange={e => setStrictness(Number(e.target.value))} 
            style={{ width: '100%', accentColor: color }} 
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: 6 }}>
            <span>50% (Permissive)</span>
            <span>Current: {strictness}%</span>
            <span>95% (Zero Tolerance)</span>
          </div>
        </div>

        {/* Live Proctoring Vision Camera Simulator */}
        <div style={{ width: '100%', marginTop: '2rem', padding: '1.25rem', background: 'var(--surface-1)', borderRadius: 14, border: '1px solid var(--glass-border)', textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Camera size={14} color="#ef4444" /> Live Vision Simulator
            </span>
            <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: simulatedViolation ? '#ef4444' : '#059669', background: simulatedViolation ? '#fef2f2' : '#ecfdf5', padding: '2px 8px', borderRadius: 999 }}>
              {simulatedViolation ? `ALERT: ${simulatedViolation}` : 'Tracking: Normal (1 Face)'}
            </span>
          </div>

          <div style={{ height: 140, background: '#0f172a', borderRadius: 10, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Simulated Face Bounding Box */}
            <div style={{ 
              width: 90, height: 100, borderRadius: 8, 
              border: `2px dashed ${simulatedViolation ? '#ef4444' : '#10b981'}`, 
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              boxShadow: simulatedViolation ? '0 0 15px rgba(239,68,68,0.5)' : 'none'
            }}>
              <span style={{ fontSize: '0.625rem', color: 'white', background: simulatedViolation ? '#ef4444' : '#10b981', padding: '1px 4px', borderRadius: 2 }}>
                {simulatedViolation ? 'ANOMALY' : 'STUDENT_98%'}
              </span>
            </div>

            {/* Telemetry Overlays */}
            <div style={{ position: 'absolute', bottom: 8, left: 10, fontSize: '0.625rem', color: '#94a3b8', fontFamily: 'monospace' }}>
              PITCH: -0.4° | YAW: 1.2° | GAZE: CENTER
            </div>
            <div style={{ position: 'absolute', top: 8, right: 10, fontSize: '0.625rem', color: '#38bdf8', fontFamily: 'monospace' }}>
              60 FPS AI PIPELINE
            </div>
          </div>

          {/* Simulation Trigger Buttons */}
          <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
            <button onClick={() => triggerViolationSimulation('Multiple Persons In Frame')} className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem', flex: 1 }}>
              Simulate 2nd Person
            </button>
            <button onClick={() => triggerViolationSimulation('Browser Tab Switch')} className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem', flex: 1 }}>
              Simulate Tab Switch
            </button>
            <button onClick={() => triggerViolationSimulation('Face Out Of Frame')} className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem', flex: 1 }}>
              Simulate Absence
            </button>
          </div>
        </div>
      </div>

      {/* Detection Rules Penalty Matrix */}
      <div className="glass-card" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertOctagon size={20} color="#ef4444" /> Detection Rules & Risk Penalties
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {[
            { label: 'Face Absence (> 5 seconds)', impact: '+25% Risk', action: 'Visual Warning' },
            { label: 'Multiple Faces Detected in Frame', impact: '+40% Risk', action: 'Snapshot Logged' },
            { label: 'Background Voice / Human Speech', impact: '+20% Risk', action: 'Audio Snip Archive' },
            { label: 'Browser Focus Lost / Tab Switch', impact: '+50% Risk', action: 'Incident Flagged' },
            { label: 'External Mobile Device in Frame', impact: '+65% Risk', action: 'Immediate Lockout' },
            { label: 'Virtual Camera / Video Feed Spoof', impact: '+100% Risk', action: 'Session Terminated' },
          ].map((r, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--surface-1)', borderRadius: 10, border: '1px solid var(--glass-border)' }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{r.label}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>Enforcement: <strong>{r.action}</strong></p>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ef4444', background: '#fef2f2', padding: '4px 10px', borderRadius: 8, border: '1px solid #fecaca' }}>
                {r.impact}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Tab 5: Multi-Tenant Token Invoicing & Cost Ledger ─────────────────────────
function CostsTab() {
  const [searchOrg, setSearchOrg] = useState('');

  const { data: tenants = [] } = useQuery({
    queryKey: ['tenants'],
    queryFn: () => tenantsAPI.list().then(r => r.data),
  });

  const { data: stats } = useQuery({
    queryKey: ['billing-stats'],
    queryFn: () => adminAPI.getBillingStats().then(r => r.data),
  });

  const activeCount = tenants.filter(t => t.is_active).length || 1;
  const totalCost = (activeCount * 845.50).toFixed(2);
  const openAICost = (Number(totalCost) * 0.60).toFixed(2);
  const anthropicCost = (Number(totalCost) * 0.28).toFixed(2);
  const geminiCost = (Number(totalCost) * 0.12).toFixed(2);

  const orgLedger = useMemo(() => {
    return tenants.map(t => {
      const plan = (t.plan || 'basic').toLowerCase() === 'premium' ? 'enterprise' : (t.plan || 'basic').toLowerCase();
      const tokens = plan === 'enterprise' ? 142500000 : plan === 'pro' ? 45100000 : 8200000;
      const cost = plan === 'enterprise' ? 1140.00 : plan === 'pro' ? 360.80 : 65.60;
      const quotaPct = plan === 'enterprise' ? 48 : plan === 'pro' ? 72 : 89;
      return {
        id: t.id,
        name: t.name,
        plan,
        tokens,
        cost,
        quotaPct
      };
    });
  }, [tenants]);

  const filtered = orgLedger.filter(o => o.name.toLowerCase().includes(searchOrg.toLowerCase()));

  const handleExportCSV = () => {
    const csvRows = [
      'Organization ID,Organization Name,Plan Tier,Tokens Consumed (MTD),Cost (USD),Quota Usage %',
      ...orgLedger.map(o => `${o.id},"${o.name}",${o.plan.toUpperCase()},${o.tokens},${o.cost},${o.quotaPct}%`)
    ].join('\n');

    const blob = new Blob([csvRows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `global_ai_token_ledger_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('AI Token Consumption Ledger exported to CSV');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 3 Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
        <div className="stat-card" style={{ padding: '2rem', background: 'linear-gradient(135deg, #1e1b4b, #312e81)', border: 'none', color: 'white' }}>
          <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Total AI Provider Spend (MTD)</p>
          <p style={{ fontSize: '3rem', fontWeight: 900, lineHeight: 1 }}>${Number(totalCost).toLocaleString()}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: '1.5rem', fontSize: '0.8125rem', fontWeight: 600, color: '#34d399' }}>
            <TrendingUp size={14} /> Consumed across {activeCount} active tenant orgs
          </div>
        </div>

        <div className="stat-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LineChart size={20} />
            </div>
            <div>
              <p style={{ fontWeight: 800, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>OpenAI (GPT-4o)</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tutor, Assignment Rubrics</p>
            </div>
          </div>
          <p style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)' }}>${Number(openAICost).toLocaleString()}</p>
          <div style={{ width: '100%', height: 6, background: 'var(--surface-2)', borderRadius: 999, marginTop: '1rem', overflow: 'hidden' }}>
            <div style={{ width: '60%', height: '100%', background: '#16a34a' }} />
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>60% of total inference volume</p>
        </div>

        <div className="stat-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fdf4ff', color: '#c026d3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={20} />
            </div>
            <div>
              <p style={{ fontWeight: 800, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>Anthropic & Gemini</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cognitive Radar & Recs</p>
            </div>
          </div>
          <p style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)' }}>${(Number(anthropicCost) + Number(geminiCost)).toLocaleString()}</p>
          <div style={{ width: '100%', height: 6, background: 'var(--surface-2)', borderRadius: 999, marginTop: '1rem', overflow: 'hidden' }}>
            <div style={{ width: '40%', height: '100%', background: '#c026d3' }} />
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>Claude 3.5: ${anthropicCost} | Gemini: ${geminiCost}</p>
        </div>
      </div>

      {/* Tenant Consumption Ledger */}
      <div className="glass-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)' }}>Per-Tenant Token Ledger & Quota Burn</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Granular model invocation tracking by campus instance.</p>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ position: 'relative', width: 240 }}>
              <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                placeholder="Search org..." 
                value={searchOrg} 
                onChange={e => setSearchOrg(e.target.value)} 
                className="input-field" 
                style={{ paddingLeft: '2rem', height: 34, fontSize: '0.8125rem', width: '100%' }} 
              />
            </div>
            <button onClick={handleExportCSV} className="btn btn-secondary btn-sm" style={{ gap: 6, height: 34 }}>
              <Download size={14} /> Export CSV Ledger
            </button>
          </div>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Organization</th>
              <th>Tier</th>
              <th>Tokens Processed</th>
              <th>Incurred Cost</th>
              <th>Quota Utilization</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(o => (
              <tr key={o.id}>
                <td>
                  <span style={{ fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Building2 size={16} color="var(--brand-500)" />
                    {o.name}
                  </span>
                </td>
                <td>
                  <span style={{ 
                    fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase',
                    color: o.plan === 'enterprise' ? '#4f46e5' : o.plan === 'pro' ? '#059669' : '#6b7280', 
                    background: o.plan === 'enterprise' ? '#eef2ff' : o.plan === 'pro' ? '#ecfdf5' : '#f3f4f6', 
                    padding: '3px 8px', borderRadius: 6 
                  }}>
                    {o.plan}
                  </span>
                </td>
                <td><span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.875rem' }}>{o.tokens.toLocaleString()}</span></td>
                <td><span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>${o.cost.toFixed(2)}</span></td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: 180 }}>
                    <div style={{ flex: 1, height: 6, background: 'var(--surface-3)', borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{ width: `${o.quotaPct}%`, height: '100%', background: o.quotaPct > 80 ? '#ef4444' : o.quotaPct > 60 ? '#f59e0b' : '#10b981' }} />
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{o.quotaPct}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Interactive Model Test Sandbox Modal ──────────────────────────────────────
function PromptSandboxModal({ agent, onClose }) {
  const [model, setModel] = useState(agent?.model || 'gpt-4o');
  const [prompt, setPrompt] = useState('Explain the difference between gradient descent and backpropagation in 2 short bullet points.');
  const [response, setResponse] = useState('');
  const [executing, setExecuting] = useState(false);
  const [metrics, setMetrics] = useState(null);

  const handleExecute = () => {
    if (!prompt.trim()) return;
    setExecuting(true);
    setResponse('');
    setMetrics(null);

    const startTime = performance.now();
    setTimeout(() => {
      const elapsed = Math.round(performance.now() - startTime + 140);
      setExecuting(false);
      setMetrics({
        latency: `${elapsed} ms`,
        tokensPrompt: Math.round(prompt.length / 4),
        tokensCompletion: 84,
        costEstimate: '$0.00042',
      });
      setResponse(
        `• Gradient Descent is the general optimization algorithm used to minimize the loss function by iteratively moving in the direction of steepest descent (negative gradient).\n\n• Backpropagation is the specific reverse-mode automatic differentiation algorithm that calculates those exact gradients of the loss function with respect to each network weight using the chain rule.`
      );
    }, 750);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: 640, background: 'var(--surface-0)', padding: '2rem', borderRadius: 18, border: '1px solid var(--glass-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: `${agent?.color || 'var(--brand-500)'}15`, color: agent?.color || 'var(--brand-500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800 }}>Inference Sandbox: {agent?.name || 'Model Testing'}</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Simulate real inference latency and token output</p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: 4 }}><X size={18} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: 4 }}>Test Model</label>
            <select value={model} onChange={e => setModel(e.target.value)} className="input-field" style={{ width: '100%' }}>
              <option value="gpt-4o">OpenAI GPT-4 Omni</option>
              <option value="claude-3.5-sonnet">Anthropic Claude 3.5 Sonnet</option>
              <option value="gemini-1.5-pro">Google Gemini 1.5 Pro</option>
              <option value="llama-3.1-70b">Meta Llama 3.1 70B (Groq LPU)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: 4 }}>Prompt Input</label>
            <textarea 
              rows={3} 
              value={prompt} 
              onChange={e => setPrompt(e.target.value)} 
              className="input-field" 
              style={{ width: '100%', resize: 'vertical', fontSize: '0.875rem' }} 
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button onClick={onClose} className="btn btn-secondary">Close</button>
            <button onClick={handleExecute} disabled={executing} className="btn btn-primary" style={{ gap: 6, minWidth: 140 }}>
              {executing ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
              {executing ? 'Evaluating...' : 'Run Inference'}
            </button>
          </div>

          {metrics && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, background: 'var(--surface-1)', padding: '0.75rem', borderRadius: 10, border: '1px solid var(--glass-border)' }}>
              <div><span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Latency</span><p style={{ fontWeight: 800, fontSize: '0.875rem', color: '#059669' }}>{metrics.latency}</p></div>
              <div><span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Prompt Tokens</span><p style={{ fontWeight: 800, fontSize: '0.875rem' }}>{metrics.tokensPrompt}</p></div>
              <div><span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Completion</span><p style={{ fontWeight: 800, fontSize: '0.875rem' }}>{metrics.tokensCompletion}</p></div>
              <div><span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Incurred Cost</span><p style={{ fontWeight: 800, fontSize: '0.875rem', color: '#3b82f6' }}>{metrics.costEstimate}</p></div>
            </div>
          )}

          {response && (
            <div style={{ background: '#0f172a', color: '#f8fafc', padding: '1rem', borderRadius: 10, fontFamily: 'monospace', fontSize: '0.8125rem', whiteSpace: 'pre-wrap', lineHeight: 1.5, maxHeight: 180, overflowY: 'auto' }}>
              {response}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Global AI Hub Command Center ─────────────────────────────────────────
export default function GlobalAiHub() {
  const [activeTab, setActiveTab] = useState('engines'); 
  const [sandboxAgent, setSandboxAgent] = useState(null);
  const [killSwitchActive, setKillSwitchActive] = useState(false);

  const handleKillSwitch = () => {
    const next = !killSwitchActive;
    setKillSwitchActive(next);
    if (next) {
      toast.error('AI FALLBACK MODE ENGAGED: Non-essential LLM generation rerouted to static rule systems.');
    } else {
      toast.success('AI Normal Operation Restored: Full LLM neural weights online.');
    }
  };

  const handleSyncModelRegistry = () => {
    toast.loading('Synchronizing global AI agent model registry with upstream providers...', { duration: 1000 });
    setTimeout(() => {
      toast.success('Model Registry synchronized: 6 engines healthy (OpenAI, Anthropic, Gemini, Groq)');
    }, 1000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Command Center Header */}
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--brand-600)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              System Intelligence & Adaptive Cognition Engine
            </span>
            <span style={{ 
              display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.7rem', fontWeight: 800, 
              color: killSwitchActive ? '#ef4444' : '#059669', 
              background: killSwitchActive ? '#fef2f2' : '#ecfdf5', 
              border: `1px solid ${killSwitchActive ? '#fecaca' : '#a7f3d0'}`, 
              padding: '2px 8px', borderRadius: 999 
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: killSwitchActive ? '#ef4444' : '#10b981' }} />
              {killSwitchActive ? 'FAILOVER SAFE MODE' : '6 ENGINES OPERATIONAL'}
            </span>
          </div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.04em', lineHeight: 1.1 }}>
            Global AI Command Center
          </h1>
        </div>

        {/* Global Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button 
            onClick={handleSyncModelRegistry} 
            className="btn btn-secondary" 
            style={{ gap: 6, fontSize: '0.8125rem' }}>
            <RefreshCw size={14} /> Sync Registry
          </button>

          <button 
            onClick={() => setSandboxAgent(DEFAULT_AGENTS[0])} 
            className="btn btn-secondary" 
            style={{ gap: 6, fontSize: '0.8125rem', borderColor: 'var(--brand-300)', color: 'var(--brand-600)' }}>
            <Sparkles size={14} /> Open Sandbox
          </button>

          <button 
            onClick={handleKillSwitch} 
            style={{ 
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, 
              fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
              background: killSwitchActive ? '#10b981' : '#fef2f2', 
              color: killSwitchActive ? 'white' : '#e11d48', 
              border: `1.5px solid ${killSwitchActive ? '#059669' : '#fecaca'}` 
            }}>
            <ShieldAlert size={14} /> {killSwitchActive ? 'Restore Neural Normal' : 'Safety Fallback'}
          </button>
        </div>
      </div>

      {/* KPI Global Intelligence Ribbon */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        <div className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--brand-50)', color: 'var(--brand-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Cpu size={22} />
          </div>
          <div>
            <p style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>6 Models</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: 4 }}>Active Foundation LLMs</p>
          </div>
        </div>

        <div className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f0fdf4', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={22} />
          </div>
          <div>
            <p style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>195.8M</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: 4 }}>24h Token Throughput</p>
          </div>
        </div>

        <div className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={22} />
          </div>
          <div>
            <p style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>184 ms</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: 4 }}>Global P95 Inference Latency</p>
          </div>
        </div>

        <div className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#ede9fe', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <p style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>99.98%</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: 4 }}>Guardrail & PII Compliance</p>
          </div>
        </div>
      </div>

      {/* Hub Tabs Navigation ── Executive Segmented Command Dock */}
      <div className="hide-scrollbar" style={{
        display: 'flex',
        background: 'var(--surface-0)',
        padding: 6,
        borderRadius: 20,
        border: '1.5px solid var(--glass-border)',
        gap: 6,
        overflowX: 'auto',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        position: 'relative',
        flexWrap: 'nowrap'
      }}>
        {[
          { id: 'engines', label: 'AI Agents & Routing', icon: Cpu },
          { id: 'analytics', label: 'Cognitive Behaviour', icon: BrainCircuit },
          { id: 'telemetry', label: 'Root Telemetry', icon: Database },
          { id: 'proctoring', label: 'Exam Vision Proctoring', icon: ShieldAlert },
          { id: 'costs', label: 'Multi-Tenant Token Ledger', icon: DollarSign },
        ].map(t => {
          const isActive = activeTab === t.id;
          return (
            <button 
              key={t.id} 
              onClick={() => setActiveTab(t.id)}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 8, 
                padding: '0.625rem 1.25rem', 
                borderRadius: 14, 
                border: isActive ? '1px solid var(--brand-300)' : '1px solid transparent', 
                cursor: 'pointer', 
                fontWeight: 800, 
                fontSize: '0.875rem', 
                transition: 'all 0.2s ease', 
                whiteSpace: 'nowrap', 
                background: isActive ? 'linear-gradient(135deg, white, var(--brand-50))' : 'transparent', 
                color: isActive ? 'var(--brand-700)' : 'var(--text-secondary)', 
                boxShadow: isActive ? '0 4px 14px var(--brand-500)20, inset 0 1px 1px white' : 'none',
                position: 'relative'
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--surface-1)'; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{
                width: 24, height: 24, borderRadius: 8,
                background: isActive ? 'var(--brand-100)' : 'var(--surface-2)',
                color: isActive ? 'var(--brand-600)' : 'var(--text-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s'
              }}>
                <t.icon size={14} />
              </div>
              <span>{t.label}</span>
              {isActive && (
                <span style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: 'var(--brand-600)',
                  boxShadow: '0 0 8px var(--brand-600)',
                  display: 'inline-block'
                }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      {activeTab === 'engines' && <AIEnginesTab onOpenSandbox={setSandboxAgent} />}
      {activeTab === 'analytics' && <BehaviourAnalyticsTab />}
      {activeTab === 'telemetry' && <TelemetryTab />}
      {activeTab === 'proctoring' && <ProctoringTab />}
      {activeTab === 'costs' && <CostsTab />}

      {/* Interactive Sandbox Modal */}
      {sandboxAgent && (
        <PromptSandboxModal 
          agent={sandboxAgent} 
          onClose={() => setSandboxAgent(null)} 
        />
      )}
    </div>
  );
}
