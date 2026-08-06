import { Brain, Target, TrendingUp, AlertTriangle, Zap, Star, Award, RefreshCw } from 'lucide-react';
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
  { key: 'focus_score', label: 'Focus', color: '#6366f1', icon: '🎯' },
  { key: 'learning_speed', label: 'Learning Speed', color: '#8b5cf6', icon: '⚡' },
  { key: 'retention_score', label: 'Retention', color: '#10b981', icon: '🧠' },
  { key: 'confidence_score', label: 'Confidence', color: '#f59e0b', icon: '💪' },
  { key: 'engagement_score', label: 'Engagement', color: '#0ea5e9', icon: '✨' },
  { key: 'consistency_score', label: 'Consistency', color: '#ec4899', icon: '📅' },
];

function AnimatedScoreBar({ label, value, color, icon, delay = 0 }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(value), 300 + delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  const getLabel = (v) => v >= 80 ? 'Excellent' : v >= 60 ? 'Good' : v >= 40 ? 'Average' : 'Needs work';
  const getLabelColor = (v) => v >= 80 ? '#059669' : v >= 60 ? '#0ea5e9' : v >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: `${color}15`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.125rem', flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>{label}</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span className="badge" style={{ background: `${getLabelColor(value)}15`, color: getLabelColor(value), fontSize: '0.6875rem' }}>
              {getLabel(value)}
            </span>
            <span style={{ fontWeight: 800, fontSize: '0.9375rem', color, minWidth: 36, textAlign: 'right' }}>{value}%</span>
          </div>
        </div>
        <div className="score-bar-track">
          <div className="score-bar-fill" style={{ width: `${width}%`, background: `linear-gradient(90deg, ${color}90, ${color})` }} />
        </div>
      </div>
    </div>
  );
}

export default function CognitiveProfilePage() {
  const { user } = useAuthStore();
  const overall = Math.round(scores.reduce((sum, s) => sum + profile[s.key], 0) / scores.length);

  const trackConfig = {
    advanced: { label: 'Advanced Track', badge: 'badge-brand', icon: '🚀' },
    standard: { label: 'Standard Track', badge: 'badge-success', icon: '📘' },
    basic: { label: 'Foundation Track', badge: 'badge-warning', icon: '📗' },
  };
  const track = trackConfig[profile.learning_track];

  return (
    <div style={{ maxWidth: 900, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Cognitive Profile</h1>
          <p className="page-subtitle">AI-generated learning analysis for {user?.full_name}</p>
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
        {/* Overall Score — spans wider visually */}
        <div className="card-brand" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gridRow: 'span 1' }}>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.8125rem', fontWeight: 600, marginBottom: 4 }}>Overall Score</p>
          <p style={{ fontSize: '3rem', fontWeight: 900, color: 'white', letterSpacing: '-0.04em', lineHeight: 1 }}>{overall}%</p>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.75rem', marginTop: 4 }}>Above average</p>
        </div>

        <div className="stat-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '1.5rem', marginBottom: 6 }}>{track.icon}</span>
          <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: 4 }}>Learning Track</p>
          <span className={`badge ${track.badge}`}>{track.label}</span>
        </div>

        <div className="stat-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '1.5rem', marginBottom: 6 }}>👁️</span>
          <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: 4 }}>Preferred Style</p>
          <p style={{ fontWeight: 700, color: '#111827' }}>{profile.recommended_style} Learner</p>
        </div>

        <div className="stat-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '1.5rem', marginBottom: 6 }}>{profile.risk_score < 30 ? '✅' : '⚠️'}</span>
          <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: 4 }}>Dropout Risk</p>
          <p style={{ fontWeight: 700, color: profile.risk_score < 30 ? '#059669' : '#d97706' }}>
            {profile.risk_score}% Risk
          </p>
        </div>
      </div>

      {/* Score Bars */}
      <div className="card" style={{ padding: '1.75rem' }}>
        <h2 style={{ fontWeight: 700, color: '#111827', marginBottom: '1.5rem', fontSize: '1.0625rem', display: 'flex', alignItems: 'center', gap: 8 }}>
          <TrendingUp size={18} color="#6366f1" /> Cognitive Scores
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {scores.map((s, i) => (
            <AnimatedScoreBar key={s.key} label={s.label} value={profile[s.key]} color={s.color} icon={s.icon} delay={i * 100} />
          ))}
        </div>
      </div>

      {/* Strength & Weak Areas */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        <div className="card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontWeight: 700, color: '#111827', marginBottom: '1rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Star size={16} color="#f59e0b" /> Strength Areas
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {profile.strength_areas.map(area => (
              <div key={area} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 14px', borderRadius: 999,
                background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#059669',
                fontSize: '0.8125rem', fontWeight: 600,
              }}>
                ✓ {area}
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontWeight: 700, color: '#111827', marginBottom: '1rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Target size={16} color="#ef4444" /> Focus Areas
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {profile.weak_areas.map(area => (
              <div key={area} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 14px', borderRadius: 999,
                background: '#fffbeb', border: '1px solid #fde68a', color: '#d97706',
                fontSize: '0.8125rem', fontWeight: 600,
              }}>
                ↑ {area}
              </div>
            ))}
          </div>
          <p style={{ fontSize: '0.8125rem', color: '#9ca3af', marginTop: '1rem' }}>
            AI has scheduled extra practice sessions for these topics in your learning path.
          </p>
        </div>
      </div>
    </div>
  );
}
