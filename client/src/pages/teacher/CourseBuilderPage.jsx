import { useState } from 'react';
import { coursesAPI } from '../../lib/api';
import { Upload, BookOpen, Plus, CheckCircle, Loader2, Zap } from 'lucide-react';
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

  const inputStyle = {
    width: '100%', padding: '0.6875rem 1rem',
    border: '1px solid var(--glass-border)',
    borderRadius: 12, background: 'var(--surface-3)',
    color: 'var(--text-primary)', fontSize: '0.875rem',
    fontFamily: 'var(--font-body)', outline: 'none',
    transition: 'all 0.18s',
  };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      <div>
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <BookOpen size={24} color="#6ee7b7" /> Course Builder
        </h1>
        <p className="page-subtitle">Create a course and upload materials. AI will automatically index them for the tutor.</p>
      </div>

      {/* Step 1: Create Course */}
      <div className="card" style={{ padding: '1.75rem' }}>
        <h2 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            width: 26, height: 26, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.75rem', fontWeight: 800, color: 'white',
            background: courseId ? 'linear-gradient(135deg, #059669, #0d9488)' : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            boxShadow: courseId ? '0 4px 10px rgba(16,185,129,0.4)' : '0 4px 10px rgba(99,102,241,0.4)',
          }}>1</span>
          Course Details
        </h2>
        <form onSubmit={handleCreateCourse} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="label">Course Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Advanced Python Programming"
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--glass-border)'; e.target.style.boxShadow = 'none'; }}
              required
            />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What will students learn?"
              rows={3}
              style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
              onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--glass-border)'; e.target.style.boxShadow = 'none'; }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="label">Category</label>
              <input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="Technology, Science..."
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.5)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--glass-border)'; }}
              />
            </div>
            <div>
              <label className="label">Difficulty</label>
              <select
                value={form.difficulty}
                onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={creating || !!courseId}
            className="btn btn-primary"
            style={{ gap: 8, alignSelf: 'flex-start', height: 44 }}
          >
            {creating ? <Loader2 size={16} className="animate-spin" /> : courseId ? <CheckCircle size={16} /> : <Plus size={16} />}
            {courseId ? 'Course Created ✓' : 'Create Course'}
          </button>
        </form>
      </div>

      {/* Step 2: Upload Materials */}
      {courseId && (
        <div className="card" style={{ padding: '1.75rem' }}>
          <h2 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              width: 26, height: 26, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.75rem', fontWeight: 800, color: 'white',
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              boxShadow: '0 4px 10px rgba(99,102,241,0.4)',
            }}>2</span>
            Upload Course Materials
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginBottom: '1.25rem' }}>
            Upload PDFs or documents. AI will automatically read them and make them searchable for the AI Tutor.
          </p>

          <label style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '2.5rem', borderRadius: 16, cursor: 'pointer', transition: 'all 0.2s',
            border: '2px dashed rgba(99,102,241,0.3)',
            background: 'rgba(99,102,241,0.04)',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.6)'; e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'; e.currentTarget.style.background = 'rgba(99,102,241,0.04)'; }}
          >
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', boxShadow: '0 4px 16px rgba(99,102,241,0.2)' }}>
              <Upload size={24} color="#818cf8" />
            </div>
            <p style={{ color: 'var(--text-primary)', fontSize: '0.9375rem', fontWeight: 600 }}>Click to upload PDF or Document</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: 4 }}>PDF, DOCX supported</p>
            <input type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={handleFileUpload} disabled={uploading} />
          </label>

          {uploadedFiles.length > 0 && (
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {uploadedFiles.map((f, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '0.875rem',
                  borderRadius: 12, background: 'var(--surface-3)',
                  border: '1px solid rgba(99,102,241,0.2)',
                }}>
                  <Zap size={14} color="#818cf8" />
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', flex: 1 }}>{f.name}</p>
                  <span style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 600 }}>AI Indexing...</span>
                  <Loader2 size={14} color="#818cf8" className="animate-spin" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
