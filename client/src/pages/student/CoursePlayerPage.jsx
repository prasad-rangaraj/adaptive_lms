import { BookOpen, Play, FileText } from 'lucide-react';
import { useParams } from 'react-router-dom';

const MOCK_MATERIALS = [
  { id: 1, title: 'Introduction to Python', type: 'video', duration: '12:34', completed: true },
  { id: 2, title: 'Variables & Data Types', type: 'video', duration: '18:02', completed: true },
  { id: 3, title: 'Course Notes PDF', type: 'pdf', duration: null, completed: false },
  { id: 4, title: 'Control Flow & Loops', type: 'video', duration: '21:15', completed: false },
];

export default function CoursePlayerPage() {
  const { courseId } = useParams();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Video Player */}
      <div className="lg:col-span-2 space-y-4">
        <div className="glass-card p-0 overflow-hidden">
          <div className="w-full aspect-video flex items-center justify-center" style={{ background: '#0f0f1a' }}>
            <div className="text-center">
              <Play size={48} style={{ color: '#6366f1' }} className="mx-auto mb-3" />
              <p className="text-slate-400 text-sm">Video player will render here</p>
              <p className="text-slate-500 text-xs">Integrate with your S3 video URL</p>
            </div>
          </div>
          <div className="p-6">
            <h1 className="text-xl font-bold text-white mb-1">Introduction to Python</h1>
            <p className="text-slate-400 text-sm">Course #{courseId} · Lesson 1 of {MOCK_MATERIALS.length}</p>
          </div>
        </div>
      </div>

      {/* Course Content Sidebar */}
      <div className="glass-card p-4">
        <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
          <BookOpen size={16} style={{ color: '#6366f1' }} /> Course Content
        </h2>
        <div className="space-y-2">
          {MOCK_MATERIALS.map((mat) => (
            <div key={mat.id}
              className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all"
              style={{ background: mat.completed ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.04)', border: `1px solid ${mat.completed ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)'}` }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: mat.type === 'pdf' ? 'rgba(239,68,68,0.15)' : 'rgba(99,102,241,0.15)' }}>
                {mat.type === 'pdf' ? <FileText size={14} style={{ color: '#ef4444' }} /> : <Play size={14} style={{ color: '#6366f1' }} />}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-xs font-medium truncate ${mat.completed ? 'text-emerald-400' : 'text-slate-300'}`}>{mat.title}</p>
                {mat.duration && <p className="text-xs text-slate-500">{mat.duration}</p>}
              </div>
              {mat.completed && <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
