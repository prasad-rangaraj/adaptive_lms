import { useState, useEffect } from 'react';
import { Search, Compass, Target, GraduationCap, ArrowRight, Play, Star, ChevronRight, Zap, X, Clock, BookOpen, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { coursesAPI } from '../../services/api.service';
import toast from 'react-hot-toast';
import { getTopicImage } from '../../utils/imageUtils';
import { useQuery } from '@tanstack/react-query';

function EnrollModal({ course, onConfirm, onClose }) {
  const { data: modules = [], isLoading: loading } = useQuery({
    queryKey: ['courseModules', course.id],
    queryFn: () => coursesAPI.getModules(course.id).then(res => res.data)
  });
  const [enrolling, setEnrolling] = useState(false);

  const handleConfirm = async () => {
    setEnrolling(true);
    await onConfirm(course.id);
    setEnrolling(false);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: 600, background: 'var(--surface-0)', borderRadius: 24, overflow: 'hidden', display: 'flex', flexDirection: 'column', animation: 'slideUp 0.3s ease', boxShadow: '0 32px 80px rgba(0,0,0,0.3)' }}>
        
        {/* Header Image */}
        <div style={{ height: 160, position: 'relative', background: `linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.8) 100%), url('${course.image}')`, backgroundSize: 'cover', backgroundPosition: 'center', padding: '1.5rem', display: 'flex', alignItems: 'flex-end' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer', backdropFilter: 'blur(4px)' }}>
            <X size={16} />
          </button>
          <div>
            <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'white', background: 'var(--brand-500)', padding: '4px 10px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', display: 'inline-block' }}>{course.category}</span>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white', margin: 0, lineHeight: 1.2 }}>{course.title}</h2>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', overflowY: 'auto', maxHeight: '50vh' }} className="hide-scrollbar">
          
          {/* Quick Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <div style={{ background: 'var(--surface-1)', padding: '1rem', borderRadius: 16, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <Clock size={18} color="var(--brand-500)" style={{ marginBottom: '0.25rem' }} />
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Assessment</span>
              <span style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-primary)' }}>~15 mins</span>
            </div>
            <div style={{ background: 'var(--surface-1)', padding: '1rem', borderRadius: 16, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <Layers size={18} color="var(--brand-500)" style={{ marginBottom: '0.25rem' }} />
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Modules</span>
              <span style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-primary)' }}>{loading ? '-' : modules.length}</span>
            </div>
            <div style={{ background: 'var(--surface-1)', padding: '1rem', borderRadius: 16, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <Target size={18} color="var(--brand-500)" style={{ marginBottom: '0.25rem' }} />
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Level</span>
              <span style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-primary)' }}>{course.tags?.[0] || 'Adaptive'}</span>
            </div>
          </div>

          {/* Topics Preview */}
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={18} color="var(--brand-500)" /> Topics Covered
            </h3>
            {loading ? (
              <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading syllabus...</div>
            ) : modules.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {modules.map((m, idx) => (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', background: 'var(--surface-1)', borderRadius: 12, border: '1px solid var(--surface-2)' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--brand-50)', color: 'var(--brand-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, flexShrink: 0 }}>{idx + 1}</div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{m.title}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>Syllabus being finalized.</p>
            )}
          </div>
          
          <div style={{ background: 'rgba(5, 150, 105, 0.1)', padding: '1rem', borderRadius: 12, border: '1px solid rgba(5, 150, 105, 0.2)' }}>
             <p style={{ fontSize: '0.875rem', color: '#065f46', margin: 0, fontWeight: 600 }}>
               <strong>Note:</strong> Enrollment requires an initial diagnostic assessment to personalize your learning path.
             </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid var(--surface-3)', display: 'flex', justifyContent: 'flex-end', gap: '1rem', background: 'var(--surface-1)' }}>
          <button onClick={onClose} disabled={enrolling} style={{ padding: '0.75rem 1.5rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontWeight: 700, cursor: 'pointer', borderRadius: 12 }}>Cancel</button>
          <button onClick={handleConfirm} disabled={enrolling} style={{ padding: '0.75rem 1.5rem', background: 'var(--brand-500)', border: 'none', color: 'white', fontWeight: 800, cursor: 'pointer', borderRadius: 12, display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}>
            {enrolling ? 'Enrolling...' : 'Confirm Enrollment'} <ArrowRight size={16} />
          </button>
        </div>
      </div>
      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

export default function StudentExploreHub() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedCourseForEnroll, setSelectedCourseForEnroll] = useState(null);
  const { data: catalog = [], isLoading: loading } = useQuery({
    queryKey: ['exploreCatalog'],
    queryFn: () => coursesAPI.list().then(res => 
      res.data.map(c => ({
        id: c.id,
        title: c.title,
        category: c.category || 'Course',
        rating: 4.8, 
        students: '1.2k',
        tags: [c.difficulty || 'All Levels'],
        image: getTopicImage(c.title)
      }))
    )
  });

  const { data: rawRecommendedPaths = [], isLoading: loadingPaths } = useQuery({
    queryKey: ['recommendedPaths'],
    queryFn: () => coursesAPI.getRecommendedPaths().then(res => res.data)
  });

  const recommendedPaths = rawRecommendedPaths.map(p => ({
    ...p,
    image: getTopicImage(p.title)
  }));

  const handleEnrollConfirm = async (courseId) => {
    try {
      await coursesAPI.enroll(courseId);
      toast.success('Enrolled successfully!');
      navigate(`/student/exam`); // Or wherever they should go after enrollment
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.detail === "Already enrolled") {
        toast.success('Resuming course...');
        navigate(`/student/exam`);
      } else {
        toast.error('Failed to enroll.');
        console.error(error);
      }
    }
    setSelectedCourseForEnroll(null);
  };

  return (
    <div style={{ position: 'relative', minHeight: '100%', paddingBottom: '3rem', overflow: 'hidden' }}>
      
      {/* ── Background Orbs ── */}
      <div style={{ position: 'absolute', top: 0, left: '-5%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)', filter: 'blur(70px)', zIndex: 0, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '10%', right: '-5%', width: '30vw', height: '30vw', background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)', filter: 'blur(70px)', zIndex: 0, pointerEvents: 'none' }} />

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

          {loadingPaths ? (
            <div style={{ color: 'var(--text-muted)' }}>Generating personalized paths...</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {recommendedPaths.map(path => (
                <div key={path.id} style={{ borderRadius: 20, overflow: 'hidden', position: 'relative', height: '180px', cursor: 'pointer', border: '1px solid var(--surface-3)' }}
                  onMouseEnter={e => e.currentTarget.querySelector('.bg-img').style.transform = 'scale(1.05)'}
                  onMouseLeave={e => e.currentTarget.querySelector('.bg-img').style.transform = 'scale(1)'}>
                  
                  <img className="bg-img" src={path.image} alt={path.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to left, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.3) 65%, transparent 100%)' }} />

                  <div style={{ position: 'absolute', inset: '0', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <span style={{ fontSize: '0.625rem', fontWeight: 800, color: 'white', background: 'var(--brand-500)', padding: '3px 8px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'inline-block', marginBottom: '0.75rem' }}>
                        {path.match}% Match
                      </span>
                      <h3 style={{ color: 'white', fontSize: '1.25rem', fontWeight: 900, lineHeight: 1.2, maxWidth: '85%' }}>{path.title}</h3>
                      <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.8125rem', marginTop: 6, fontWeight: 500 }}>{path.courses} Courses • {path.duration}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'white', color: 'black', border: 'none', padding: '6px 14px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}>
                        <Play size={12} fill="currentColor" /> Start Path
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.02)'; }}>
                
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
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedCourseForEnroll(course); }}
                      style={{ background: 'transparent', border: 'none', color: 'var(--brand-600)', fontWeight: 800, fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}
                    >
                      Enroll <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {selectedCourseForEnroll && (
        <EnrollModal 
          course={selectedCourseForEnroll} 
          onClose={() => setSelectedCourseForEnroll(null)} 
          onConfirm={handleEnrollConfirm} 
        />
      )}
    </div>
  );
}
