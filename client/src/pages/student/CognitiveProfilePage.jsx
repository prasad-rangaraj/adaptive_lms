import { Brain, Target, TrendingUp, Zap, Star, Award, RefreshCw } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useState, useEffect } from 'react';

const profile = {
  focus_score: 78, learning_speed: 65, retention_score: 82,
  confidence_score: 70, engagement_score: 85, consistency_score: 60,
  motivation_score: 88, risk_score: 22,
  weak_areas: ['Calculus', 'Thermodynamics', 'Graph Algorithms'],
  strength_areas: ['Python', 'Statistics', 'Data Structures'],
  learning_track: 'advanced', recommended_style: 'Visual',
  last_assessed_at: '2026-07-28',
};

const scores = [
  { key: 'focus_score', label: 'Focus', color: '#818cf8', icon: '🎯' },
  { key: 'learning_speed', label: 'Learning Speed', color: '#a78bfa', icon: '⚡' },
  { key: 'retention_score', label: 'Retention', color: '#6ee7b7', icon: '🧠' },
  { key: 'confidence_score', label: 'Confidence', color: '#fcd34d', icon: '💪' },
  { key: 'engagement_score', label: 'Engagement', color: '#38bdf8', icon: '✨' },
  { key: 'consistency_score', label: 'Consistency', color: '#f472b6', icon: '📅' },
];

function AnimatedScoreBar({ label, value, color, icon, delay = 0 }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(value), 300 + delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  const getLabel = (v) => v >= 80 ? 'Excellent' : v >= 60 ? 'Good' : v >= 40 ? 'Average' : 'Needs work';
  const getLabelColor = (v) => v >= 80 ? '#6ee7b7' : v >= 60 ? '#38bdf8' : v >= 40 ? '#fcd34d' : '#f472b6';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div style={{
        width: 42, height: 42, borderRadius: 12,
        background: `${color}12`,
        border: `1px solid ${color}25`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.125rem', flexShrink: 0,
        boxShadow: `0 4px 12px ${color}15`,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>{label}</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{
              padding: '2px 8px', borderRadius: 999,
              background: `${getLabelColor(value)}12`,
              border: `1px solid ${getLabelColor(value)}25`,
              color: getLabelColor(value), fontSize: '0.6875rem', fontWeight: 600,
            }}>
              {getLabel(value)}
            </span>
            <span style={{ fontWeight: 800, fontSize: '0.9375rem', color, minWidth: 36, textAlign: 'right' }}>{value}%</span>
          </div>
        </div>
        <div className="score-bar-track">
          <div className="score-bar-fill" style={{ width: `${width}%`, background: `linear-gradient(90deg, ${color}70, ${color})`, boxShadow: `0 0 10px ${color}40` }} />
        </div>
      </div>
    </div>
  );
}

export default function CognitiveProfilePage() {
  const { user } = useAuthStore();
  const overall = Math.round(scores.reduce((sum, s) => sum + profile[s.key], 0) / scores.length);

  const trackConfig = {
    advanced: { label: 'Advanced Track', badge: 'badge-brand', icon: '🚀', color: '#818cf8' },
    standard: { label: 'Standard Track', badge: 'badge-success', icon: '📘', color: '#6ee7b7' },
    basic: { label: 'Foundation Track', badge: 'badge-warning', icon: '📗', color: '#fcd34d' },
  };
  const track = trackConfig[profile.learning_track];

  return (
    <div style={{ maxWidth: 900, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Cognitive Profile</h1>
          <p className="page-subtitle">AI-generated learning analysis for <span style={{ color: '#818cf8' }}>{user?.full_name}</span></p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span className="badge badge-gray" style={{ fontSize: '0.75rem' }}>
            Last assessed: {profile.last_assessed_at}
          </span>
          <button className="btn btn-secondary btn-sm" style={{ gap: 6 }}>
            <RefreshCw size={13} /> Re-assess
          </button>
        </div>
      </div>

      {/* Top Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>

        {/* Overall Score */}
        <div className="card-brand" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', bottom: -20, right: -20, width: 100, height: 100,
            borderRadius: '50%', background: 'rgba(255,255,255,0.08)',
          }} />
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Overall Score</p>
          <p style={{ fontSize: '3.25rem', fontWeight: 900, color: 'white', letterSpacing: '-0.05em', lineHeight: 1 }}>{overall}%</p>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', marginTop: 6 }}>Above average learner</p>
        </div>

        <div className="stat-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '1.5rem', marginBottom: 8 }}>{track.icon}</span>
          <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Learning Track</p>
          <span className={`badge ${track.badge}`}>{track.label}</span>
        </div>

        <div className="stat-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '1.5rem', marginBottom: 8 }}>👁️</span>
          <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Preferred Style</p>
          <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>{profile.recommended_style} Learner</p>
        </div>

        <div className="stat-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '1.5rem', marginBottom: 8 }}>{profile.risk_score < 30 ? '✅' : '⚠️'}</span>
          <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Dropout Risk</p>
          <p style={{ fontWeight: 800, color: profile.risk_score < 30 ? '#6ee7b7' : '#fcd34d', fontSize: '1.125rem' }}>
            {profile.risk_score}%
          </p>
        </div>
      </div>

      {/* Score Bars */}
      <div className="card" style={{ padding: '1.75rem' }}>
        <h2 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.75rem', fontSize: '1.0625rem', display: 'flex', alignItems: 'center', gap: 8 }}>
          <TrendingUp size={18} color="#818cf8" /> Cognitive Scores
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.375rem' }}>
          {scores.map((s, i) => (
            <AnimatedScoreBar key={s.key} label={s.label} value={profile[s.key]} color={s.color} icon={s.icon} delay={i * 100} />
          ))}
        </div>
      </div>

      {/* Strength & Weak Areas */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        <div className="card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.125rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Star size={16} color="#fcd34d" /> Strength Areas
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {profile.strength_areas.map(area => (
              <div key={area} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 14px', borderRadius: 999,
                background: 'rgba(16,185,129,0.1)',
                border: '1px solid rgba(16,185,129,0.25)',
                color: '#6ee7b7',
                fontSize: '0.8125rem', fontWeight: 600,
              }}>
                ✓ {area}
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.125rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Target size={16} color="#f472b6" /> Focus Areas
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {profile.weak_areas.map(area => (
              <div key={area} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 14px', borderRadius: 999,
                background: 'rgba(245,158,11,0.1)',
                border: '1px solid rgba(245,158,11,0.25)',
                color: '#fcd34d',
                fontSize: '0.8125rem', fontWeight: 600,
              }}>
                ↑ {area}
              </div>
            ))}
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
            AI has scheduled extra practice sessions for these topics in your learning path.
          </p>
        </div>
      </div>
    </div>
  );
}
