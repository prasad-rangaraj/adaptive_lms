import { useState } from 'react';
import { 
  Bot, BrainCircuit, Activity, Eye, ShieldAlert, Cpu, 
  Settings, Database, Zap, Sparkles, TrendingUp, AlertOctagon, LineChart, DollarSign
} from 'lucide-react';

// ── Shared UI ───────────────────────────────────────────────────────────────
function Toggle({ checked, onChange, color = 'var(--brand-500)' }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} style={{ width: 44, height: 24, borderRadius: 999, padding: 3, background: checked ? color : 'var(--surface-3)', border: '1px solid var(--glass-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: checked ? 'flex-end' : 'flex-start', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', flexShrink: 0, boxShadow: checked ? `0 0 12px ${color}40` : 'none' }}>
      <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }} />
    </button>
  );
}

function MiniSparkline({ color, data }) {
  const max = Math.max(...data);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 24 }}>
      {data.map((val, i) => (
        <div key={i} style={{ width: 4, background: color, borderRadius: 2, height: `${(val / max) * 100}%`, opacity: i === data.length - 1 ? 1 : 0.4 }} />
      ))}
    </div>
  );
}

// ── Tab 1: AI Engines (Premium Grid) ─────────────────────────────────────────
function AIEnginesTab() {
  const [agents, setAgents] = useState([
    { id: 'tutor', name: 'AI Tutor', desc: 'Generative interactive assistant.', model: 'gpt-4o', active: true, usage: [10,20,15,40,60,85,90], color: '#3b82f6' },
    { id: 'cognitive', name: 'Cognitive Analyzer', desc: 'Processes behaviour into profiles.', model: 'claude-3.5-sonnet', active: true, usage: [50,60,40,70,90,110,120], color: '#8b5cf6' },
    { id: 'recommendation', name: 'Rec Engine', desc: 'Path personalization algorithm.', model: 'llama-3.1-70b', active: true, usage: [5,8,12,10,15,22,25], color: '#10b981' },
    { id: 'notes', name: 'Notes Generator', desc: 'Auto-generates summaries.', model: 'llama-3.1-8b', active: true, usage: [30,25,35,40,60,75,80], color: '#f59e0b' },
    { id: 'evaluator', name: 'Assignment Eval', desc: 'Grades logic & rubric matching.', model: 'gpt-4o', active: false, usage: [0,0,0,0,0,0,0], color: '#ec4899' },
    { id: 'twin', name: 'Digital Twin', desc: 'Virtual simulated student models.', model: 'claude-3-opus', active: false, usage: [0,0,0,0,0,0,0], color: '#6366f1' },
  ]);

  const toggle = (id) => setAgents(agents.map(a => a.id === id ? { ...a, active: !a.active } : a));

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
      {agents.map(a => (
        <div key={a.id} className="glass-card" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden', border: `1px solid ${a.active ? a.color + '40' : 'var(--glass-border)'}` }}>
          {a.active && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${a.color}, transparent)` }} />}
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: a.active ? `${a.color}15` : 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: a.active ? a.color : 'var(--text-muted)', transition: 'all 0.3s' }}>
                <Bot size={22} style={{ filter: a.active ? `drop-shadow(0 0 8px ${a.color}80)` : 'none' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{a.name}</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{a.desc}</p>
              </div>
            </div>
            <Toggle checked={a.active} onChange={() => toggle(a.id)} color={a.color} />
          </div>

          <div style={{ background: 'var(--surface-1)', borderRadius: 10, padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--glass-border)', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Core Model</span>
            <select disabled={!a.active} value={a.model} onChange={() => {}} style={{ background: 'transparent', border: 'none', color: a.active ? 'var(--text-primary)' : 'var(--text-muted)', fontSize: '0.8125rem', fontWeight: 700, outline: 'none', cursor: a.active ? 'pointer' : 'not-allowed' }}>
              <option value="gpt-4o">GPT-4 Omni</option>
              <option value="claude-3.5-sonnet">Claude 3.5 Sonnet</option>
              <option value="claude-3-opus">Claude 3 Opus</option>
              <option value="llama-3.1-70b">Llama 3.1 70B</option>
              <option value="llama-3.1-8b">Llama 3.1 8B</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: a.active ? 1 : 0.5 }}>
            <div>
              <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>24h Token Burn</p>
              <p style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>{a.usage[6]}k <span style={{ fontSize: '0.75rem', color: a.color, fontWeight: 700 }}>+12%</span></p>
            </div>
            <MiniSparkline data={a.usage} color={a.color} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Tab 2: Behaviour Analytics (Precision Instruments) ─────────────────────
function BehaviourAnalyticsTab() {
  const [metrics, setMetrics] = useState([
    { id: 1, label: 'Focus Score Sensitivity', val: 80, desc: 'Eye-tracking & window switches influence.' },
    { id: 2, label: 'Retention Score Sensitivity', val: 65, desc: 'Spaced repetition quiz decay rate.' },
    { id: 3, label: 'Motivation Score Sensitivity', val: 40, desc: 'Session length and login consistency.' },
    { id: 4, label: 'Risk Calculation Baseline', val: 75, desc: 'Threshold for automated academic warnings.' },
  ]);

  const updateVal = (id, val) => setMetrics(metrics.map(m => m.id === id ? { ...m, val: Number(val) } : m));
  const getColor = (val) => val < 30 ? '#3b82f6' : val < 70 ? '#10b981' : val < 85 ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
      {metrics.map(m => {
        const color = getColor(m.val);
        return (
          <div key={m.id} className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: `linear-gradient(145deg, var(--surface-1), transparent)` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)' }}>{m.label}</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 4 }}>{m.desc}</p>
              </div>
              <div style={{ background: `${color}15`, border: `1px solid ${color}40`, padding: '6px 12px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Activity size={14} color={color} />
                <span style={{ fontSize: '1.125rem', fontWeight: 900, color }}>{m.val}%</span>
              </div>
            </div>
            
            <div style={{ position: 'relative', padding: '10px 0' }}>
              <div style={{ height: 6, background: 'var(--surface-3)', borderRadius: 999, width: '100%', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${m.val}%`, background: color, transition: 'all 0.2s', boxShadow: `0 0 10px ${color}` }} />
              </div>
              <input type="range" min="0" max="100" value={m.val} onChange={e => updateVal(m.id, e.target.value)} style={{ position: 'absolute', top: 3, left: 0, width: '100%', opacity: 0, cursor: 'pointer', height: 20 }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                <span>Relaxed</span><span>Balanced</span><span>Strict</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Tab 3: Telemetry (Server Nodes) ─────────────────────────────────────────
function TelemetryTab() {
  const [nodes, setNodes] = useState([
    { id: 'video', name: 'Video Watch Time', active: true, invasive: false },
    { id: 'mouse', name: 'Mouse & Scroll Engine', active: true, invasive: false },
    { id: 'typing', name: 'Typing Biometrics', active: false, invasive: true },
    { id: 'eye', name: 'Webcam Eye Tracking', active: false, invasive: true },
    { id: 'emotion', name: 'Emotion & Micro-expression', active: false, invasive: true },
    { id: 'voice', name: 'Ambient Voice Data', active: false, invasive: true },
  ]);

  const toggle = (id) => setNodes(nodes.map(n => n.id === id ? { ...n, active: !n.active } : n));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="glass-card" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.5rem' }}>
          <Database size={22} color="var(--brand-500)" /> Global Telemetry Nodes
        </h2>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: 600 }}>
          Enable or disable root data collection pipelines across all tenants. Disabled nodes immediately sever data flow to comply with GDPR/FERPA regulations.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          {nodes.map(n => (
            <div key={n.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', background: 'var(--surface-1)', border: `1px solid ${n.active ? (n.invasive ? '#ef4444' : '#10b981') : 'var(--glass-border)'}`, borderRadius: 12, position: 'relative', overflow: 'hidden', transition: 'all 0.3s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ position: 'relative' }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: n.active ? (n.invasive ? '#ef4444' : '#10b981') : 'var(--surface-3)', zIndex: 2, position: 'relative' }} />
                  {n.active && <div style={{ position: 'absolute', top: -4, left: -4, width: 20, height: 20, borderRadius: '50%', background: n.invasive ? '#ef4444' : '#10b981', animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite', zIndex: 1, opacity: 0.7 }} />}
                </div>
                <div>
                  <p style={{ fontWeight: 800, fontSize: '0.9375rem', color: n.active ? 'var(--text-primary)' : 'var(--text-muted)' }}>{n.name}</p>
                  {n.invasive && <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#ef4444', letterSpacing: '0.5px' }}><ShieldAlert size={10} style={{ display: 'inline', marginRight: 3, position: 'relative', top: 1 }} />INVASIVE DATA</span>}
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

// ── Tab 4: Proctoring (SVG Risk Gauge) ──────────────────────────────────────
function ProctoringTab() {
  const [strictness, setStrictness] = useState(85);
  
  // Gauge math
  const radius = 60;
  const circumference = radius * Math.PI; // half circle
  const offset = circumference - (strictness / 100) * circumference;
  const color = strictness < 60 ? '#10b981' : strictness < 85 ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
      <div className="glass-card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Auto-Terminate Threshold</h2>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>Exams exceeding this risk score are terminated immediately globally.</p>

        <div style={{ position: 'relative', width: 240, height: 120, marginBottom: '2rem' }}>
          {/* Background Arc */}
          <svg width="240" height="120" viewBox="0 0 140 70">
            <path d="M 10 70 A 60 60 0 0 1 130 70" fill="none" stroke="var(--surface-3)" strokeWidth="12" strokeLinecap="round" />
            {/* Foreground Arc */}
            <path d="M 10 70 A 60 60 0 0 1 130 70" fill="none" stroke={color} strokeWidth="12" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} style={{ transition: 'all 0.5s ease' }} />
          </svg>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '3rem', fontWeight: 900, color, lineHeight: 1 }}>{strictness}%</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: 4 }}>Risk Level</span>
          </div>
        </div>

        <input type="range" min="50" max="100" value={strictness} onChange={e => setStrictness(e.target.value)} style={{ width: '100%', accentColor: color }} />
      </div>

      <div className="glass-card" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 8 }}><AlertOctagon size={20} color="#ef4444" /> Detection Rules</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            { label: 'Face Detection Absence', impact: '+25% Risk' },
            { label: 'Multiple Faces Detected', impact: '+40% Risk' },
            { label: 'Ambient Voice/Talking', impact: '+15% Risk' },
            { label: 'Browser Tab Change', impact: '+50% Risk' },
            { label: 'Mobile Phone in Frame', impact: '+60% Risk' },
          ].map((r, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--surface-1)', borderRadius: 10, border: '1px solid var(--glass-border)' }}>
              <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{r.label}</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ef4444', background: '#fef2f2', padding: '4px 8px', borderRadius: 6 }}>{r.impact}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Tab 5: AI Costs (New Tracker) ───────────────────────────────────────────
function CostsTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
        <div className="stat-card" style={{ padding: '2rem', background: 'linear-gradient(135deg, #1e1b4b, #312e81)', border: 'none', color: 'white' }}>
          <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Total AI API Costs (MTD)</p>
          <p style={{ fontSize: '3rem', fontWeight: 900, lineHeight: 1 }}>$4,285<span style={{ fontSize: '1rem', color: '#818cf8' }}>.40</span></p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: '1.5rem', fontSize: '0.8125rem', fontWeight: 600, color: '#34d399' }}><TrendingUp size={14} /> +8% vs last month</div>
        </div>
        
        <div className="stat-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LineChart size={20} /></div>
            <div><p style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>OpenAI (GPT-4o)</p><p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>AI Tutor, Evaluator</p></div>
          </div>
          <p style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)' }}>$2,840.10</p>
          <div style={{ width: '100%', height: 6, background: 'var(--surface-2)', borderRadius: 999, marginTop: '1rem', overflow: 'hidden' }}><div style={{ width: '65%', height: '100%', background: '#16a34a' }} /></div>
        </div>

        <div className="stat-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fdf4ff', color: '#c026d3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Sparkles size={20} /></div>
            <div><p style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>Anthropic (Claude 3.5)</p><p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cognitive Analyzer</p></div>
          </div>
          <p style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)' }}>$1,445.30</p>
          <div style={{ width: '100%', height: 6, background: 'var(--surface-2)', borderRadius: 999, marginTop: '1rem', overflow: 'hidden' }}><div style={{ width: '35%', height: '100%', background: '#c026d3' }} /></div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Top Token Consumers (Orgs)</h3>
        <table className="table">
          <thead><tr><th>Organization</th><th>Plan Tier</th><th>Tokens Processed</th><th>Estimated Cost</th></tr></thead>
          <tbody>
            <tr>
              <td><span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Sunrise University</span></td>
              <td><span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4f46e5', background: '#eef2ff', padding: '3px 8px', borderRadius: 6 }}>Enterprise</span></td>
              <td><span style={{ fontFamily: 'monospace', fontWeight: 600 }}>142,500,000</span></td>
              <td><span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>$1,140.00</span></td>
            </tr>
            <tr>
              <td><span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Tech Institute</span></td>
              <td><span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4f46e5', background: '#eef2ff', padding: '3px 8px', borderRadius: 6 }}>Enterprise</span></td>
              <td><span style={{ fontFamily: 'monospace', fontWeight: 600 }}>98,200,000</span></td>
              <td><span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>$785.60</span></td>
            </tr>
            <tr>
              <td><span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Metro Academy</span></td>
              <td><span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '3px 8px', borderRadius: 6 }}>Pro</span></td>
              <td><span style={{ fontFamily: 'monospace', fontWeight: 600 }}>45,100,000</span></td>
              <td><span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>$360.80</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main Hub ──────────────────────────────────────────────────────────────────
export default function GlobalAiHub() {
  const [activeTab, setActiveTab] = useState('engines'); 

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1.5rem' }}>
        <div style={{ flexShrink: 0 }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--brand-500)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Artificial Intelligence</p>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.04em', lineHeight: 1.1 }}>Global AI Command</h1>
        </div>
        
        <div className="hide-scrollbar" style={{ display: 'flex', background: 'var(--surface-1)', padding: 6, borderRadius: 16, border: '1px solid var(--glass-border)', gap: 4, overflowX: 'auto', flexWrap: 'nowrap' }}>
          {[
            { id: 'engines', label: 'AI Agents', icon: Cpu },
            { id: 'analytics', label: 'Behaviour', icon: BrainCircuit },
            { id: 'telemetry', label: 'Telemetry', icon: Database },
            { id: 'proctoring', label: 'Proctoring', icon: ShieldAlert },
            { id: 'costs', label: 'API Costs', icon: DollarSign },
          ].map(t => (
            <button 
              key={t.id} onClick={() => setActiveTab(t.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.625rem 1.25rem', borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '0.875rem', transition: 'all 0.2s', whiteSpace: 'nowrap', background: activeTab === t.id ? 'white' : 'transparent', color: activeTab === t.id ? 'var(--brand-600)' : 'var(--text-muted)', boxShadow: activeTab === t.id ? '0 4px 12px rgba(0,0,0,0.08)' : 'none' }}>
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'engines' && <AIEnginesTab />}
      {activeTab === 'analytics' && <BehaviourAnalyticsTab />}
      {activeTab === 'telemetry' && <TelemetryTab />}
      {activeTab === 'proctoring' && <ProctoringTab />}
      {activeTab === 'costs' && <CostsTab />}
    </div>
  );
}
