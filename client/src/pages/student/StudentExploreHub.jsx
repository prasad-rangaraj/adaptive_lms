import { useState } from 'react';
import { Search, Compass, Target, GraduationCap, ArrowRight, Play, Star, ChevronRight, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const recommendedPaths = [
  { id: 1, title: 'Crack Top Tier Product Placements', target: 'Placements', duration: '12 Weeks', courses: 4, img: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80', color: '#4f46e5' },
  { id: 2, title: 'AI & Machine Learning Foundation', target: 'Specialization', duration: '8 Weeks', courses: 3, img: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80', color: '#8b5cf6' },
];

const catalog = [
  { id: 101, title: 'Data Structures in C++', category: 'Core CS', rating: 4.8, students: '1.2k', tags: ['High Weightage', 'Placements'], image: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&w=600&q=80' },
  { id: 102, title: 'Operating Systems — Deep Dive', category: 'Core CS', rating: 4.6, students: '850', tags: ['University Exam Prep'], image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80' },
  { id: 103, title: 'Quantitative Aptitude Masterclass', category: 'Aptitude', rating: 4.9, students: '3.4k', tags: ['TCS NQT', 'Wipro'], image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80' },
  { id: 104, title: 'Full Stack React & Node', category: 'Web Dev', rating: 4.7, students: '2.1k', tags: ['Project Based'], image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=600&q=80' },
  { id: 105, title: 'System Design for Freshers', category: 'Advanced', rating: 4.9, students: '920', tags: ['Product Companies'], image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80' },
];

export default function StudentExploreHub() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  return (
    <div style={{ position: 'relative', minHeight: '100%', paddingBottom: '3rem', overflow: 'hidden' }}>
      
      {/* ── Background Orbs ── */}
      <div style={{ position: 'absolute', top: 0, right: '5%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)', filter: 'blur(70px)', zIndex: 0, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '10%', left: '-5%', width: '30vw', height: '30vw', background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)', filter: 'blur(70px)', zIndex: 0, pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 10 }}>

        {/* ── Header & Search ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '2rem', marginBottom: '3rem' }}>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-500)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Course Catalog</p>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
              Explore Hub.
            </h1>
          </div>
          <div style={{ flex: 1, maxWidth: 400, position: 'relative' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              value={search} onChange={e => setSearch(e.target.value)} 
              placeholder="Search courses, skills, or paths..." 
              style={{ width: '100%', padding: '0.875rem 1.25rem 0.875rem 3rem', background: 'var(--surface-0)', border: '1.5px solid var(--surface-3)', borderRadius: 999, color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none', transition: 'border-color 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }} 
              onFocus={e => e.target.style.borderColor = 'var(--brand-500)'} 
              onBlur={e => e.target.style.borderColor = 'var(--surface-3)'} 
            />
          </div>
        </div>

        {/* ── AI Recommended Paths (Hero) ── */}
        <div style={{ marginBottom: '4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.5rem' }}>
            <Zap size={18} color="var(--brand-500)" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)' }}>AI Recommended Paths</h2>
            <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--brand-600)', background: 'var(--brand-50)', padding: '2px 8px', borderRadius: 999, marginLeft: 8 }}>Based on your profile</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
            {recommendedPaths.map(path => (
              <div key={path.id} style={{ borderRadius: 24, overflow: 'hidden', position: 'relative', height: '220px', cursor: 'pointer', border: '1px solid var(--surface-3)' }}
                onMouseEnter={e => e.currentTarget.querySelector('.bg-img').style.transform = 'scale(1.05)'}
                onMouseLeave={e => e.currentTarget.querySelector('.bg-img').style.transform = 'scale(1)'}>
                
                <img className="bg-img" src={path.img} alt={path.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)' }} />

                <div style={{ position: 'absolute', inset: '0', padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'white', background: path.color, padding: '4px 10px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'inline-block', marginBottom: '1rem' }}>
                      {path.target}
                    </span>
                    <h3 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 900, lineHeight: 1.2, maxWidth: '80%' }}>{path.title}</h3>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Target size={14} color="rgba(255,255,255,0.7)" />
                        <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.8125rem', fontWeight: 700 }}>{path.courses} Courses</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Compass size={14} color="rgba(255,255,255,0.7)" />
                        <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.8125rem', fontWeight: 700 }}>{path.duration}</span>
                      </div>
                    </div>
                    <button style={{ background: 'white', color: 'black', border: 'none', padding: '8px 16px', borderRadius: 999, fontSize: '0.8125rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                      Start Path <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Full Catalog ── */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)' }}>All Courses</h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['All', 'Core CS', 'Aptitude', 'Web Dev'].map(filter => (
                <button key={filter} style={{ padding: '6px 14px', borderRadius: 999, border: filter === 'All' ? 'none' : '1px solid var(--surface-3)', background: filter === 'All' ? 'var(--brand-500)' : 'var(--surface-0)', color: filter === 'All' ? 'white' : 'var(--text-secondary)', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer' }}>
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
            {catalog.filter(c => c.title.toLowerCase().includes(search.toLowerCase())).map(course => (
              <div key={course.id} style={{ background: 'var(--surface-0)', border: '1px solid var(--surface-3)', borderRadius: 20, overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'all 0.2s', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand-300)'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--surface-3)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.02)'; }}>
                
                {/* Course Thumbnail Image */}
                <div style={{ height: 140, position: 'relative', background: `linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 50%), url('${course.image}')`, backgroundSize: 'cover', backgroundPosition: 'center', padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                      <GraduationCap size={18} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.9)', padding: '4px 8px', borderRadius: 999 }}>
                      <Star size={12} color="#d97706" fill="#d97706" />
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#d97706' }}>{course.rating}</span>
                    </div>
                  </div>
                </div>

                {/* Course Content */}
                <div style={{ padding: '1.25rem 1.5rem 1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <p style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--brand-600)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>{course.category}</p>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: '1rem', flex: 1 }}>{course.title}</h3>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    {course.tags.map(tag => (
                      <span key={tag} style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-secondary)', background: 'var(--surface-1)', padding: '4px 10px', borderRadius: 6 }}>
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.25rem', borderTop: '1px solid var(--surface-2)' }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>{course.students} enrolled</span>
                    <button style={{ background: 'transparent', border: 'none', color: 'var(--brand-600)', fontWeight: 800, fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}>
                      Enroll <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
