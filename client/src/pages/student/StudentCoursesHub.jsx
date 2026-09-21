import { useState, useEffect } from 'react';
import { BookOpen, GraduationCap, Layers, ArrowRight, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { coursesAPI } from '../../services/api.service';
import { getTopicImage } from '../../utils/imageUtils';
import { useQuery } from '@tanstack/react-query';

export default function StudentCoursesHub() {
  const navigate = useNavigate();
  const { data, isLoading: loading } = useQuery({
    queryKey: ['enrolledCoursesData'],
    queryFn: async () => {
      const res = await coursesAPI.getEnrolledCourses();
      const enrolled = res.data;
      const statusMap = {};
      await Promise.all(
        enrolled.map(async (c) => {
          try {
            const st = await coursesAPI.getEnrollmentStatus(c.id);
            statusMap[c.id] = st.data;
          } catch (e) {
            console.error(e);
          }
        })
      );
      return { enrolled, statusMap };
    }
  });

  const enrolledCourses = data?.enrolled || [];
  const enrollments = data?.statusMap || {};

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
        Loading your courses...
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: 'var(--surface-1)', position: 'relative', height: '100%', margin: '-2rem -2.5rem', padding: '2.5rem 3rem' }} className="hide-scrollbar">
      
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '2.5rem' }}>
        <BookOpen size={24} color="var(--brand-500)" />
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>Learning Canvas</h1>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-600)', background: 'var(--brand-50)', padding: '4px 10px', borderRadius: 999, marginLeft: '0.5rem' }}>{enrolledCourses.length} enrolled</span>
      </div>

      {enrolledCourses.length === 0 ? (
        <div style={{ background: 'var(--surface-0)', border: '1px dashed var(--surface-3)', borderRadius: 24, padding: '4rem 2rem', textAlign: 'center', maxWidth: 600, margin: '4rem auto' }}>
          <GraduationCap size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.5rem' }}>Your Canvas is Empty</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', margin: 0, lineHeight: 1.5 }}>You haven't enrolled in any courses yet. Discover new topics and start your learning journey today.</p>
          <button onClick={() => navigate('/student/explore')} style={{ marginTop: '2rem', background: 'var(--brand-500)', color: 'white', border: 'none', borderRadius: 12, padding: '12px 28px', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(99,102,241,0.2)' }}>Explore Courses</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2rem' }}>
          {enrolledCourses.map(course => {
            const enr = enrollments[course.id];
            const path = enr?.learning_path || 'pending';
            const progress = enr?.progress_percentage || 0;
            const pathColor = { pending: '#f59e0b', basics: '#0891b2', intermediate: '#7c3aed', advanced: '#059669' }[path] || '#6b7280';
            return (
              <div
                key={course.id}
                onClick={() => navigate('/student/course/' + course.id)}
                style={{ background: 'var(--surface-0)', border: '1px solid var(--surface-3)', borderRadius: 24, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.3s', boxShadow: '0 8px 24px rgba(0,0,0,0.04)' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.1)'; e.currentTarget.style.borderColor = 'var(--brand-300)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.04)'; e.currentTarget.style.borderColor = 'var(--surface-3)'; }}
              >
                <div style={{ height: 180, background: `linear-gradient(to bottom right, rgba(0,0,0,0.5), rgba(0,0,0,0.2)), url('${getTopicImage(course.title)}')`, backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'flex-end', padding: '1.25rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, background: pathColor, color: 'white', padding: '4px 12px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {path === 'pending' ? '⏳ Pending' : path === 'basics' ? '🌱 Foundation' : path === 'intermediate' ? '🚀 Core' : '⚡ Expert'}
                  </span>
                </div>
                <div style={{ padding: '1.5rem' }}>
                  <p style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem', lineHeight: 1.3 }}>{course.title}</p>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>Progress</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>{Math.round(progress)}%</span>
                    </div>
                    <div style={{ height: 6, background: 'var(--surface-2)', borderRadius: 999 }}>
                      <div style={{ height: '100%', background: pathColor, borderRadius: 999, width: `${progress}%`, transition: 'width 0.5s ease' }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid var(--surface-2)' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}><Play size={16} color="var(--brand-500)" /> Watch Lessons</span>
                    <div style={{ background: 'var(--brand-50)', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ArrowRight size={16} color="var(--brand-600)" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
