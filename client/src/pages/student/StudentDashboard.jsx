import { useAuthStore } from '../../store/authStore';
import { BookOpen, Flame, Star, Clock, Bot, Target, ArrowRight, TrendingUp, Zap, Award, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const stats = [
  { label: 'Courses Enrolled', value: '6', icon: BookOpen, color: '#4f46e5', bg: '#eef2ff', border: '#c7d2fe', trend: '+1 this month', trendUp: true },
  { label: 'Learning Streak', value: '12 days', icon: Flame, color: '#be185d', bg: '#fdf2f8', border: '#fbcfe8', trend: 'Personal best!', trendUp: true },
  { label: 'Avg. Score', value: '84%', icon: Star, color: '#d97706', bg: '#fffbeb', border: '#fde68a', trend: '+6% this week', trendUp: true },
  { label: 'Hours Studied', value: '47h', icon: Clock, color: '#059669', bg: '#ecfdf5', border: '#bbf7d0', trend: 'This month', trendUp: false },
];

const courses = [
  { id: 1, title: 'Advanced Python Programming', progress: 72, category: 'Technology', color: '#4f46e5', emoji: '🐍' },
  { id: 2, title: 'Data Structures & Algorithms', progress: 45, category: 'CS Fundamentals', color: '#059669', emoji: '🌲' },
  { id: 3, title: 'Machine Learning Basics', progress: 30, category: 'AI / ML', color: '#d97706', emoji: '🤖' },
];

const aiSuggestions = [
  { text: 'Review Chapter 4 of Python — you scored 60% on the last quiz.', icon: '📚', color: '#4f46e5' },
  { text: 'Try a flashcard session for Data Structures today.', icon: '🃏', color: '#059669' },
  { text: 'Your focus score dipped this week. Try a 25-min Pomodoro session.', icon: '🎯', color: '#d97706' },
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
            {greeting}, <span className="text-gradient">{user?.full_name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="page-subtitle">Here's what's happening on your learning journey today.</p>
        </div>
        <Link to="/student/ai-tutor" className="btn btn-primary" style={{ gap: 8 }}>
          <Bot size={16} /> Ask AI Tutor
        </Link>
      </div>

      {/* ── Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
        {stats.map(({ label, value, icon: Icon, color, bg, border, trend, trendUp }, i) => (
          <div key={label} className="stat-card animate-fade-up" style={{ animationDelay: `${i * 0.07}s` }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{
                width: 42, height: 42, borderRadius: 12, background: bg,
                border: `1px solid ${border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={20} color={color} />
              </div>
              <span style={{
                fontSize: '0.7rem', color: trendUp ? '#059669' : '#6b7280',
                background: trendUp ? '#ecfdf5' : '#f3f4f6',
                padding: '2px 8px', borderRadius: 999,
                border: `1px solid ${trendUp ? '#bbf7d0' : '#e5e7eb'}`,
              }}>
                {trend}
              </span>
            </div>
            <p style={{ fontSize: '1.875rem', fontWeight: 900, color: '#111827', letterSpacing: '-0.04em', lineHeight: 1 }}>
              {value}
            </p>
            <p style={{ fontSize: '0.8125rem', color: '#6b7280', marginTop: 6 }}>{label}</p>
          </div>
        ))}
      </div>

      {/* ── Main Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>

        {/* Continue Learning */}
        <div className="card animate-fade-up delay-200" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h2 style={{ fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: 8 }}>
              <BookOpen size={18} color="#4f46e5" /> Continue Learning
            </h2>
            <Link to="/student/courses" style={{ fontSize: '0.8125rem', color: '#4f46e5', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              View all <ArrowRight size={13} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {courses.map((course) => (
              <Link key={course.id} to={`/student/course/${course.id}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', gap: '1rem', alignItems: 'center',
                  padding: '1rem', borderRadius: 14,
                  border: '1px solid #f0f1f3', background: '#fafbff',
                  transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)', cursor: 'pointer',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = `${course.color}40`; e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.background = '#f5f7ff'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#f0f1f3'; e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.background = '#fafbff'; }}
                >
                  <div style={{
                    width: 50, height: 50, borderRadius: 13, flexShrink: 0,
                    background: `${course.color}15`,
                    border: `1px solid ${course.color}25`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.5rem',
                  }}>
                    {course.emoji}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                      <p style={{ fontWeight: 600, color: '#111827', fontSize: '0.9375rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '75%' }}>{course.title}</p>
                      <span style={{ fontWeight: 800, fontSize: '0.875rem', color: course.color, flexShrink: 0 }}>{course.progress}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${course.progress}%`, background: `linear-gradient(90deg, ${course.color}80, ${course.color})` }} />
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: 6 }}>{course.category}</p>
                  </div>
                  <ChevronRight size={16} color="var(--text-muted)" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* AI Insights */}
          <div className="card animate-fade-up delay-300" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
              <Zap size={17} color="#4f46e5" /> AI Insights
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {aiSuggestions.map((s, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 12, padding: '0.875rem',
                  borderRadius: 12, background: '#fafbff',
                  border: `1px solid ${s.color}20`,
                  borderLeft: `3px solid ${s.color}80`,
                }}>
                  <span style={{ fontSize: '1.125rem', lineHeight: 1, marginTop: 1, flexShrink: 0 }}>{s.icon}</span>
                  <p style={{ fontSize: '0.8125rem', color: '#4b5563', lineHeight: 1.55 }}>{s.text}</p>
                </div>
              ))}
            </div>
            <Link to="/student/profile/cognitive" className="btn btn-secondary btn-sm" style={{ width: '100%', marginTop: '1rem' }}>
              <Target size={14} /> View Full Profile
            </Link>
          </div>

          {/* Daily Goal */}
          <div className="card-brand animate-fade-up delay-400" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.875rem' }}>
              <Award size={20} color="rgba(255,255,255,0.9)" />
              <p style={{ fontWeight: 700, color: 'white', fontSize: '0.9375rem' }}>Daily Goal</p>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', marginBottom: '1rem', lineHeight: 1.55 }}>
              Complete 1 module and review flashcards for 15 minutes today.
            </p>
            <div style={{ background: 'rgba(255,255,255,0.25)', borderRadius: 999, height: 7, overflow: 'hidden', marginBottom: 6 }}>
              <div style={{ width: '60%', height: '100%', background: 'white', borderRadius: 999, transition: 'width 0.8s' }} />
            </div>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.75rem' }}>60% complete — keep it up!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
