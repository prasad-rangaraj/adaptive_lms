import { useState } from 'react';
import { ArrowRight, Trophy, TrendingUp, Target, Activity, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { cognitiveAPI } from '../../services/api.service';
import Loader from '../../components/ui/Loader';

function ScoreOrb({ domain }) {
  const r = 30;
  const circ = 2 * Math.PI * r;
  const offset = circ - (domain.score / 100) * circ;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
      <div style={{ position: 'relative', width: 76, height: 76 }}>
        <svg width="76" height="76" viewBox="0 0 76 76" fill="none">
          <circle cx="38" cy="38" r={r} stroke="var(--surface-3)" strokeWidth="6" fill="none" />
          <circle
            cx="38" cy="38" r={r}
            stroke={domain.color} strokeWidth="6" fill="none"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            transform="rotate(-90 38 38)"
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--text-primary)' }}>{domain.score}</span>
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 3 }}>{domain.label}</p>
        <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', maxWidth: 100, lineHeight: 1.4 }}>{domain.desc}</p>
      </div>
    </div>
  );
}

export default function StudentCognitiveHub() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('path');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['cognitiveProfile'],
    queryFn: async () => {
      const res = await cognitiveAPI.getProfile();
      return res.data;
    }
  });

  if (isLoading) return <Loader />;
  if (isError) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '3rem', color: 'var(--text-muted)' }}>
      <AlertCircle size={48} style={{ marginBottom: '1rem', color: '#ef4444' }} />
      <p style={{ fontSize: '1.125rem', fontWeight: 700 }}>Failed to load cognitive profile.</p>
    </div>
  );

  const profile = data?.profile;
  const recommendations = data?.recommendations || [];

  const domains = [
    { label: 'Focus',      score: Math.round(profile?.focus_score || 0), color: '#4f46e5', desc: 'Sustained attention.' },
    { label: 'Speed',      score: Math.round(profile?.learning_speed || 0), color: '#10b981', desc: 'Grasping new patterns.' },
    { label: 'Retention',  score: Math.round(profile?.retention_score || 0), color: '#f59e0b', desc: 'Memory over time.' },
    { label: 'Motivation', score: Math.round(profile?.motivation_score || 0), color: '#ef4444', desc: 'Engagement level.' },
    { label: 'Confidence', score: Math.round(profile?.confidence_score || 0), color: '#8b5cf6', desc: 'Hesitation vs Action.' },
    { label: 'Consistency',score: Math.round(profile?.consistency_score || 0), color: '#0891b2', desc: 'Regularity in study.' },
  ];

  const avgScore = Math.round(domains.reduce((s, d) => s + d.score, 0) / domains.length);

  return (
    <div style={{ position: 'relative', minHeight: '100%', paddingBottom: '3rem', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, right: '5%', width: '35vw', height: '35vw', background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)', filter: 'blur(70px)', zIndex: 0, pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 10 }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2.5rem' }}>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-500)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>AI Behaviour Analytics</p>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
              Cognitive Profile
            </h1>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Overall Brain Score</p>
            <p style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-0.03em' }}>
              {avgScore}<span style={{ fontSize: '1.25rem', color: 'var(--text-muted)' }}>/100</span>
            </p>
          </div>
        </div>

        {/* ── Score Orbs Grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '1.5rem', marginBottom: '3rem', padding: '2rem', background: 'var(--surface-0)', borderRadius: 20, border: '1px solid var(--surface-3)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          {domains.map(d => <ScoreOrb key={d.label} domain={d} />)}
        </div>

        {/* ── Adaptive Recommendations + Insights Dashboard ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '3rem', alignItems: 'start' }}>

          {/* Left: Recommendations */}
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '0.375rem' }}>AI Recommendations</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>Curated study actions based on your cognitive data.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {recommendations.map((rec, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.125rem 0', borderBottom: '1px solid var(--surface-3)' }}>
                  <span style={{ fontSize: '1.5rem', lineHeight: 1, flexShrink: 0 }}>{rec.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.125rem' }}>{rec.title}</h3>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{rec.reason}</p>
                  </div>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: rec.urgencyColor, flexShrink: 0 }}>{rec.urgency}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Insights Dashboard (Tabbed) */}
          <div style={{ background: 'var(--surface-0)', border: '1px solid var(--surface-3)', borderRadius: 20, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.03)' }}>
            
            {/* Tabs Header */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--surface-3)' }}>
              {[
                { id: 'path', label: 'Path', icon: Target },
                { id: 'benchmark', label: 'Benchmark', icon: Trophy },
                { id: 'trends', label: 'Trends', icon: TrendingUp },
              ].map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ flex: 1, padding: '1rem 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: activeTab === t.id ? 'var(--surface-1)' : 'transparent', border: 'none', borderBottom: activeTab === t.id ? '2px solid var(--brand-500)' : '2px solid transparent', color: activeTab === t.id ? 'var(--brand-600)' : 'var(--text-muted)', fontSize: '0.8125rem', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' }}>
                  <t.icon size={14} /> {t.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div style={{ padding: '1.75rem', minHeight: '320px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              
              {/* TAB 1: Adaptive Path */}
              {activeTab === 'path' && (
                <div style={{ animation: 'fadeIn 0.3s ease' }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>Your Adaptive Path</h3>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                      You are assigned to the <strong style={{ textTransform: 'capitalize' }}>{profile?.learning_track || 'standard'}</strong> track. 
                      Your recommended learning style is <strong>{profile?.recommended_style || 'Balanced'}</strong>.
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--surface-3)' }}>
                      <p style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Weak Areas (Needs Focus)</p>
                      <p style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#ef4444' }}>
                        {profile?.weak_areas?.length > 0 ? profile.weak_areas.join(', ') : 'None detected yet'}
                      </p>
                    </div>
                    <div style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--surface-3)' }}>
                      <p style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Strong Areas</p>
                      <p style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#10b981' }}>
                        {profile?.strength_areas?.length > 0 ? profile.strength_areas.join(', ') : 'None detected yet'}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => navigate('/student/dashboard')} style={{ width: '100%', background: 'var(--text-primary)', color: 'white', border: 'none', padding: '11px 20px', borderRadius: 12, fontSize: '0.875rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    Continue Learning <ArrowRight size={16} />
                  </button>
                </div>
              )}

              {/* TAB 2: Benchmarks */}
              {activeTab === 'benchmark' && (
                <div style={{ animation: 'fadeIn 0.3s ease', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--brand-50)', borderRadius: 16, border: '1px solid var(--brand-100)' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--brand-600)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Branch Rank</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--brand-700)' }}>Top 12%</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--brand-600)', marginTop: 4 }}>in Computer Science (Batch 2026)</p>
                  </div>

                  <div>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>Key Advantages</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}><strong>Speed:</strong> 24% faster than average</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4f46e5' }} />
                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}><strong>Logic:</strong> Strong alignment with FAANG</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} />
                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}><strong>Retention:</strong> Below average (Needs work)</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Trends */}
              {activeTab === 'trends' && (
                <div style={{ animation: 'fadeIn 0.3s ease', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>4-Week Brain Score Trend</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Steady improvement in logic domains.</p>
                    
                    {/* Simulated SVG Graph */}
                    <div style={{ height: 120, position: 'relative', borderBottom: '1px solid var(--surface-3)', borderLeft: '1px solid var(--surface-3)', paddingBottom: '0.5rem' }}>
                      <svg width="100%" height="100%" viewBox="0 0 100 40" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                        <path d="M0 30 Q 25 35, 50 20 T 100 5" fill="none" stroke="var(--brand-500)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="0" cy="30" r="2" fill="var(--brand-600)" />
                        <circle cx="50" cy="20" r="2" fill="var(--brand-600)" />
                        <circle cx="100" cy="5" r="3" fill="var(--brand-500)" style={{ filter: 'drop-shadow(0 2px 4px rgba(79,70,229,0.5))' }} />
                      </svg>
                      {/* Grid labels */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', position: 'absolute', bottom: -20, left: 0, right: 0 }}>
                        <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>Week 1</span>
                        <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>Week 2</span>
                        <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>Week 4</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '1rem', background: 'var(--surface-1)', padding: '1rem', borderRadius: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Activity size={16} color="#10b981" />
                      <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--text-primary)' }}>+12 Points (30 Days)</span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Your spaced repetition exercises are paying off.</p>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
