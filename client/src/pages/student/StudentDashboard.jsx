import { useAuthStore } from '../../store/authStore';
import { BookOpen, Flame, Star, Clock, Bot, Target, ArrowRight, TrendingUp, Zap, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const stats = [
  { label: 'Courses Enrolled', value: '6', icon: BookOpen, color: '#6366f1', bg: '#eef2ff', trend: '+1 this month' },
  { label: 'Learning Streak', value: '12 days', icon: Flame, color: '#ef4444', bg: '#fef2f2', trend: 'Personal best!' },
  { label: 'Avg. Score', value: '84%', icon: Star, color: '#f59e0b', bg: '#fffbeb', trend: '+6% this week' },
  { label: 'Hours Studied', value: '47h', icon: Clock, color: '#10b981', bg: '#f0fdf4', trend: 'This month' },
];

const courses = [
  { id: 1, title: 'Advanced Python Programming', progress: 72, category: 'Technology', color: '#6366f1', emoji: '🐍' },
  { id: 2, title: 'Data Structures & Algorithms', progress: 45, category: 'CS Fundamentals', color: '#10b981', emoji: '🌲' },
  { id: 3, title: 'Machine Learning Basics', progress: 30, category: 'AI / ML', color: '#f59e0b', emoji: '🤖' },
];

const aiSuggestions = [
  { text: 'Review Chapter 4 of Python — you scored 60% on the last quiz.', icon: '📚', color: '#6366f1' },
  { text: 'Try a flashcard session for Data Structures today.', icon: '🃏', color: '#10b981' },
  { text: 'Your focus score dipped this week. Try a 25-min Pomodoro session.', icon: '🎯', color: '#f59e0b' },
];

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">
            {greeting}, {user?.full_name?.split(' ')[0]} 👋
          </h1>
          <p className="page-subtitle">Here's what's happening on your learning journey today.</p>
        </div>
        <Link to="/student/ai-tutor" className="btn btn-primary" style={{ gap: 8 }}>
          <Bot size={16} /> Ask AI Tutor
        </Link>
      </div>

      {/* ── Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
        {stats.map(({ label, value, icon: Icon, color, bg, trend }, i) => (
          <div key={label} className="stat-card animate-fade-up" style={{ animationDelay: `${i * 0.07}s`, opacity: 0 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={19} color={color} />
              </div>
              <span style={{ fontSize: '0.7rem', color: '#9ca3af', background: '#f9fafb', padding: '2px 8px', borderRadius: 999, border: '1px solid #f0f1f3' }}>
                {trend}
              </span>
            </div>
            <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.03em', lineHeight: 1 }}>
              {value}
            </p>
            <p style={{ fontSize: '0.8125rem', color: '#6b7280', marginTop: 4 }}>{label}</p>
          </div>
        ))}
      </div>

      {/* ── Main Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>

        {/* Continue Learning */}
        <div className="card animate-fade-up delay-200" style={{ padding: '1.5rem', opacity: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h2 style={{ fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: 8 }}>
              <BookOpen size={18} color="#6366f1" /> Continue Learning
            </h2>
            <Link to="/student/courses" style={{ fontSize: '0.8125rem', color: '#6366f1', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              View all <ArrowRight size={13} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {courses.map((course) => (
              <Link key={course.id} to={`/student/course/${course.id}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', gap: '1rem', alignItems: 'center',
                  padding: '1rem', borderRadius: 14,
                  border: '1.5px solid #f0f1f3', background: '#fafbff',
                  transition: 'all 0.2s', cursor: 'pointer',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#c7d2fe'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#f0f1f3'; e.currentTarget.style.transform = 'translateX(0)'; }}
                >
                  <div style={{
                    width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                    background: `${course.color}15`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.5rem',
                  }}>
                    {course.emoji}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                      <p style={{ fontWeight: 600, color: '#111827', fontSize: '0.9375rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '75%' }}>{course.title}</p>
                      <span style={{ fontWeight: 700, fontSize: '0.875rem', color: course.color, flexShrink: 0 }}>{course.progress}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${course.progress}%`, background: `linear-gradient(90deg, ${course.color}, ${course.color}99)` }} />
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: 5 }}>{course.category}</p>
                  </div>
                  <ChevronRight size={16} color="#d1d5db" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* AI Insights */}
          <div className="card animate-fade-up delay-300" style={{ padding: '1.5rem', opacity: 0 }}>
            <h2 style={{ fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
              <Zap size={17} color="#6366f1" /> AI Insights
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {aiSuggestions.map((s, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 12, padding: '0.875rem',
                  borderRadius: 12, background: '#f9fbff',
                  border: `1px solid ${s.color}18`,
                }}>
                  <span style={{ fontSize: '1.25rem', lineHeight: 1, marginTop: 1 }}>{s.icon}</span>
                  <p style={{ fontSize: '0.8125rem', color: '#374151', lineHeight: 1.55 }}>{s.text}</p>
                </div>
              ))}
            </div>
            <Link to="/student/profile/cognitive" className="btn btn-secondary btn-sm" style={{ width: '100%', marginTop: '1rem' }}>
              <Target size={14} /> View Full Profile
            </Link>
          </div>

          {/* Daily Goal */}
          <div className="card-brand animate-fade-up delay-400" style={{ padding: '1.5rem', opacity: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.875rem' }}>
              <Award size={20} color="rgba(255,255,255,0.9)" />
              <p style={{ fontWeight: 700, color: 'white', fontSize: '0.9375rem' }}>Daily Goal</p>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.875rem', marginBottom: '1rem', lineHeight: 1.5 }}>
              Complete 1 module and review flashcards for 15 minutes today.
            </p>
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 999, height: 8, overflow: 'hidden' }}>
              <div style={{ width: '60%', height: '100%', background: 'white', borderRadius: 999, transition: 'width 0.8s' }} />
            </div>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', marginTop: 6 }}>60% complete</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChevronRight({ size, color }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="m9 18 6-6-6-6" /></svg>;
}
