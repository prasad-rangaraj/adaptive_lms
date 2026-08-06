import { useState } from 'react';
import { coursesAPI } from '../../lib/api';
import { Upload, BookOpen, Plus, CheckCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CourseBuilderPage() {
  const [form, setForm] = useState({ title: '', description: '', category: '', difficulty: 'beginner' });
  const [courseId, setCourseId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await coursesAPI.create(form);
      setCourseId(res.data.id);
      toast.success('Course created! Now upload materials.');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create course');
    } finally {
      setCreating(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !courseId) return;
    setUploading(true);
    try {
      await coursesAPI.uploadMaterial(courseId, file);
      setUploadedFiles((f) => [...f, { name: file.name, status: 'processing' }]);
      toast.success(`"${file.name}" uploaded. AI indexing in progress...`);
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><BookOpen size={24} style={{ color: '#10b981' }} /> Course Builder</h1>
        <p className="text-slate-400 text-sm mt-1">Create a course and upload materials. AI will automatically index them for the tutor.</p>
      </div>

      {/* Step 1: Create Course */}
      <div className="glass-card p-6">
        <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: courseId ? '#10b981' : '#6366f1' }}>1</span>
          Course Details
        </h2>
        <form onSubmit={handleCreateCourse} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1.5">Course Title</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Advanced Python Programming" className="input-field" required />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1.5">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What will students learn?" className="input-field" rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Category</label>
              <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Technology, Science..." className="input-field" />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Difficulty</label>
              <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} className="input-field">
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>
          <button type="submit" disabled={creating || !!courseId} className="btn-primary flex items-center gap-2">
            {creating ? <Loader2 size={16} className="animate-spin" /> : courseId ? <CheckCircle size={16} /> : <Plus size={16} />}
            {courseId ? 'Course Created ✓' : 'Create Course'}
          </button>
        </form>
      </div>

      {/* Step 2: Upload Materials */}
      {courseId && (
        <div className="glass-card p-6">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: '#6366f1' }}>2</span>
            Upload Course Materials
          </h2>
          <p className="text-slate-400 text-xs mb-4">Upload PDFs or documents. The AI will automatically read them and make them searchable for the AI Tutor.</p>

          <label className="flex flex-col items-center justify-center p-8 rounded-xl cursor-pointer transition-all" style={{ border: '2px dashed rgba(99,102,241,0.4)', background: 'rgba(99,102,241,0.05)' }}>
            <Upload size={32} style={{ color: '#6366f1' }} className="mb-3" />
            <p className="text-slate-300 text-sm font-medium">Click to upload PDF or Document</p>
            <p className="text-slate-500 text-xs mt-1">PDF, DOCX supported</p>
            <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFileUpload} disabled={uploading} />
          </label>

          {uploadedFiles.length > 0 && (
            <div className="mt-4 space-y-2">
              {uploadedFiles.map((f, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <Loader2 size={14} className="animate-spin" style={{ color: '#6366f1' }} />
                  <p className="text-xs text-slate-300 flex-1">{f.name}</p>
                  <span className="text-xs text-indigo-400">AI Indexing...</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
