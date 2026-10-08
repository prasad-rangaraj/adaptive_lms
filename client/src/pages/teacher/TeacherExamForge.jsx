import { useState, useEffect } from 'react';
import { 
  Sparkles, FileText, Upload, Plus, GripVertical, Settings, PlayCircle, ShieldCheck, X
} from 'lucide-react';

import { academicAPI, aiTutorAPI, coursesAPI } from '../../services/api.service';
import toast from 'react-hot-toast';

// ── Tab: Question Bank ────────────────────────────────────────────────────
function QuestionBankTab({ courses }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generateConfig, setGenerateConfig] = useState('5');
  const [sourceFile, setSourceFile] = useState(null);
  const [subject, setSubject] = useState("");

  useEffect(() => {
    academicAPI.getTeacherQuestions()
      .then(res => setQuestions(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredQs = subject ? questions.filter(q => q.tags && q.tags.includes(subject)) : questions;

  const handleGenerate = async () => {
    if (!subject) {
      toast.error("Please select a Subject before generating questions.");
      return;
    }
    setGenerating(true);
    try {
      let numQs = 5;
      let diff = "medium";
      let topic = sourceFile ? `content from ${sourceFile.name}` : "Advanced Machine Learning Concepts";
      
      if (generateConfig === '10_hard') { numQs = 10; diff = "hard"; }
      else if (generateConfig === '10_easy') { numQs = 10; diff = "easy"; }
      
      const res = await aiTutorAPI.generateQuiz(1, topic, diff, numQs);
      const generatedQs = (res.data.quiz || []).map((q, i) => ({
        id: `gen-${Date.now()}-${i}`,
        text: q.question,
        type: "mcq",
        difficulty: diff,
        tags: ["AI Generated", ...(subject ? [subject] : [])],
        options: q.options ? q.options.map((opt, oIdx) => ({ key: String.fromCharCode(65 + oIdx), text: opt })) : [],
        correct_answer: q.answer || "A"
      }));
      const newQuestionsList = [...generatedQs, ...questions];
      setQuestions(newQuestionsList);
      
      // Auto-save to backend
      try {
        await academicAPI.saveTeacherQuestions(newQuestionsList);
      } catch (saveErr) {
        console.error("Auto-save failed", saveErr);
      }
      
      toast.success("5 questions generated & saved to bank!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate questions");
    } finally {
      setGenerating(false);
    }
  };

  const handleAddManual = () => {
    if (!subject) {
      toast.error("Please select a Subject before adding a question.");
      return;
    }
    const newQ = {
      id: `manual-${Date.now()}`,
      text: "New Custom Question",
      type: "mcq",
      difficulty: "medium",
      tags: ["Manual", ...(subject ? [subject] : [])],
      options: [{key: "A", text: "Option A"}],
      correct_answer: "A"
    };
    const newQuestionsList = [newQ, ...questions];
    setQuestions(newQuestionsList);
    
    // Auto-save to backend
    academicAPI.saveTeacherQuestions(newQuestionsList).catch(err => console.error("Auto-save failed", err));
  };

  const updateQuestion = (index, field, value) => {
    const newQs = [...questions];
    newQs[index] = { ...newQs[index], [field]: value };
    setQuestions(newQs);
  };

  const updateOption = (qIndex, oIndex, value) => {
    const newQs = [...questions];
    newQs[qIndex].options[oIndex].text = value;
    setQuestions(newQs);
  };

  const addOption = (qIndex) => {
    const newQs = [...questions];
    const key = String.fromCharCode(65 + (newQs[qIndex].options?.length || 0));
    if (!newQs[qIndex].options) newQs[qIndex].options = [];
    newQs[qIndex].options.push({ key, text: "New Option" });
    setQuestions(newQs);
  };

  const removeQuestion = (qIndex) => {
    setQuestions(questions.filter((_, i) => i !== qIndex));
  };

  const handleSaveBank = async () => {
    setSaving(true);
    try {
      await academicAPI.saveTeacherQuestions(questions);
      toast.success("Question bank saved successfully!");
    } catch (err) {
      toast.error("Failed to save bank");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '4rem', alignItems: 'start' }}>
      
      {/* ── Left: Generated Questions ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '1rem', background: 'var(--surface-0)', padding: '1.5rem', borderRadius: 16, border: '1px solid var(--surface-3)' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Question Bank</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{filteredQs.length} questions available {subject ? `for ${subject}` : ''}. Configure tags before adding to the bank.</p>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <select value={subject} onChange={e => setSubject(e.target.value)} style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: '1px solid var(--surface-3)', background: 'var(--surface-1)', fontSize: '0.875rem', fontWeight: 700 }}>
              <option value="">Select Course</option>
              {courses.map(c => <option key={c.id} value={c.title}>{c.title}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button 
              onClick={handleAddManual}
              style={{ background: 'var(--surface-0)', color: 'var(--text-primary)', border: '1px solid var(--surface-3)', padding: '10px 20px', borderRadius: 999, fontSize: '0.875rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Plus size={16} /> Add Blank Question
            </button>
            <button 
              onClick={handleSaveBank}
              disabled={saving}
              style={{ background: 'var(--text-primary)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 999, fontSize: '0.875rem', fontWeight: 800, cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8, opacity: saving ? 0.7 : 1 }}>
              <Sparkles size={16} /> {saving ? 'Saving...' : 'Save Bank to Cloud'}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading questions...</div>
          ) : filteredQs.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No questions available {subject ? `for ${subject}` : ''}. Generate or add some.</div>
          ) : filteredQs.map((q, idx) => (
            <div key={q.id || idx} style={{ background: 'var(--surface-0)', border: '1px solid var(--surface-3)', borderRadius: 16, padding: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: 4, alignItems: 'center' }}>
                <GripVertical size={16} color="var(--surface-4)" style={{ cursor: 'grab' }} />
                <button onClick={() => removeQuestion(q.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 4 }}><X size={14} /></button>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <textarea 
                    value={q.text} 
                    onChange={e => updateQuestion(q.id, 'text', e.target.value)}
                    placeholder="Question text..."
                    rows={2}
                    style={{ flex: 1, padding: '0.75rem', background: 'var(--surface-1)', border: '1px solid var(--surface-3)', borderRadius: 8, color: 'var(--text-primary)', fontSize: '0.9375rem', fontWeight: 700, resize: 'vertical' }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <select 
                      value={q.type} 
                      onChange={e => updateQuestion(q.id, 'type', e.target.value)}
                      style={{ padding: '0.5rem', background: 'var(--surface-1)', border: '1px solid var(--surface-3)', borderRadius: 8, color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 700 }}
                    >
                      <option value="mcq">MCQ</option>
                      <option value="text">Written</option>
                    </select>
                    <select 
                      value={q.difficulty} 
                      onChange={e => updateQuestion(q.id, 'difficulty', e.target.value)}
                      style={{ padding: '0.5rem', background: 'var(--surface-1)', border: '1px solid var(--surface-3)', borderRadius: 8, color: q.difficulty === 'Easy' ? '#10b981' : q.difficulty === 'Medium' ? '#f59e0b' : '#ef4444', fontSize: '0.875rem', fontWeight: 700 }}
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>

                {q.type === 'mcq' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingLeft: '1rem', borderLeft: '2px solid var(--surface-3)' }}>
                    {(q.options || []).map((opt, oIdx) => (
                      <div key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input 
                          type="radio" 
                          name={`bank-correct-${idx}`} 
                          checked={q.correct_answer === opt.key}
                          onChange={() => updateQuestion(q.id, 'correct_answer', opt.key)}
                        />
                        <span style={{ fontWeight: 800, fontSize: '0.875rem' }}>{opt.key}.</span>
                        <input 
                          value={opt.text} 
                          onChange={e => updateOption(q.id, oIdx, e.target.value)}
                          style={{ flex: 1, padding: '0.25rem 0.5rem', background: 'transparent', border: '1px solid var(--surface-3)', borderRadius: 4, color: 'var(--text-secondary)', fontSize: '0.875rem' }}
                        />
                      </div>
                    ))}
                    <button onClick={() => addOption(q.id)} style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: 'var(--brand-500)', fontSize: '0.8125rem', fontWeight: 800, cursor: 'pointer' }}>+ Add Option</button>
                  </div>
                )}
                
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {q.tags?.map(t => (
                    <span key={t} style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--brand-700)', background: 'var(--brand-50)', padding: '4px 8px', borderRadius: 6 }}>{t}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right: AI Generator Widget ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ background: 'var(--surface-0)', border: '1px solid #8b5cf6', borderRadius: 20, padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
          
          <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: 100, height: 100, background: '#8b5cf6', opacity: 0.1, borderRadius: '50%', filter: 'blur(30px)' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1rem', position: 'relative' }}>
            <Sparkles size={20} color="#8b5cf6" />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--text-primary)' }}>AI Forge</h3>
          </div>
          
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5, position: 'relative' }}>
            Upload a syllabus, presentation, or paste a transcript. I will instantly generate a tagged Question Bank mapped to cognitive levels.
          </p>

          <label style={{ display: 'block', border: '2px dashed var(--surface-4)', borderRadius: 12, padding: '2rem', textAlign: 'center', marginBottom: '1.5rem', cursor: 'pointer', background: sourceFile ? 'rgba(16, 185, 129, 0.05)' : 'var(--surface-1)', borderColor: sourceFile ? '#10b981' : 'var(--surface-4)', transition: 'all 0.2s' }}>
            <input type="file" style={{ display: 'none' }} onChange={(e) => setSourceFile(e.target.files[0])} />
            {sourceFile ? (
              <>
                <ShieldCheck size={24} color="#10b981" style={{ marginBottom: '0.5rem' }} />
                <p style={{ fontSize: '0.875rem', fontWeight: 800, color: '#10b981', marginBottom: 4 }}>{sourceFile.name}</p>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Ready for analysis</p>
              </>
            ) : (
              <>
                <Upload size={24} color="var(--text-muted)" style={{ marginBottom: '0.5rem' }} />
                <p style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--text-secondary)' }}>Click to upload PDF or Video</p>
              </>
            )}
          </label>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Generate:</label>
            <select 
              value={generateConfig}
              onChange={(e) => setGenerateConfig(e.target.value)}
              style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--surface-3)', background: 'var(--surface-0)', fontSize: '0.875rem', fontWeight: 700 }}>
              <option value="5">5 Mixed Questions (MCQ)</option>
              <option value="10_hard">10 Hard Questions</option>
              <option value="10_easy">10 Easy MCQs</option>
            </select>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={generating}
            style={{ width: '100%', background: '#8b5cf6', color: 'white', border: 'none', padding: '12px', borderRadius: 8, fontSize: '0.9375rem', fontWeight: 800, cursor: generating ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: generating ? 0.7 : 1 }}>
            <Sparkles size={16} /> {generating ? 'Forging Questions...' : 'Generate Bank'}
          </button>
        </div>
      </div>

    </div>
  );
}

// ── Tab: Exam Assembler ───────────────────────────────────────────────────
function AssemblerTab({ courses }) {
  const [title, setTitle] = useState("");
  const [courseId, setCourseId] = useState("");
  const [duration, setDuration] = useState(90);
  const [isPublishing, setIsPublishing] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [bankQuestions, setBankQuestions] = useState([]);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedBankQs, setSelectedBankQs] = useState(new Set());
  const [securitySettings, setSecuritySettings] = useState({
    proctoring: true,
    lockdown: true,
    randomizeQs: true,
    randomizeOpts: false
  });

  const activeCourse = courses.find(c => c.id === courseId);
  const activeSubject = activeCourse ? activeCourse.title : "";
  const filteredBankQs = bankQuestions.filter(q => q.tags && q.tags.includes(activeSubject));

  useEffect(() => {
    if (isImportModalOpen && bankQuestions.length === 0) {
      academicAPI.getTeacherQuestions().then(res => setBankQuestions(res.data)).catch(() => {});
    }
  }, [isImportModalOpen]);

  const importSelectedQuestions = () => {
    const toImport = bankQuestions.filter(q => selectedBankQs.has(q.id));
    const formatted = toImport.map(q => ({ ...q, marks: q.marks || 1, type: q.type || 'mcq', options: q.options || [{key: 'A', text: 'Option A'}], correct_answer: q.correct_answer || 'A' }));
    setQuestions([...questions, ...formatted]);
    setSelectedBankQs(new Set());
    setIsImportModalOpen(false);
    toast.success(`${formatted.length} questions added!`);
  };

  const updateQuestion = (id, field, value) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const updateOption = (id, oIndex, value) => {
    setQuestions(questions.map(q => {
      if (q.id === id) {
        const newOptions = [...q.options];
        newOptions[oIndex] = { ...newOptions[oIndex], text: value };
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const addOption = (id) => {
    setQuestions(questions.map(q => {
      if (q.id === id) {
        const key = String.fromCharCode(65 + q.options.length);
        return { ...q, options: [...q.options, { key, text: "New Option" }] };
      }
      return q;
    }));
  };

  const removeQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const calculatedTotalMarks = questions.reduce((sum, q) => sum + (parseFloat(q.marks) || 0), 0);

  const handlePublish = async (isPublished = true) => {
    setIsPublishing(true);
    try {
      const payload = {
        title: title || (isPublished ? "Untitled Exam" : "Draft Exam"),
        duration_minutes: duration,
        total_marks: calculatedTotalMarks,
        course_id: courseId,
        is_published: isPublished,
        questions
      };
      await academicAPI.createExam(payload);
      toast.success(isPublished ? "Exam published successfully!" : "Exam saved as draft!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save exam");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '4rem', alignItems: 'start' }}>
      
      {/* ── Left: The Exam Canvas ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div>
          <select 
            value={courseId}
            onChange={(e) => setCourseId(parseInt(e.target.value))}
            style={{ marginBottom: '0.5rem', padding: '6px 12px', borderRadius: 8, border: '1px solid var(--surface-3)', background: 'var(--surface-1)', fontSize: '0.875rem', fontWeight: 800, color: 'var(--brand-600)' }}>
            <option value="">Select Course...</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem' }}>
            <input 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter Exam Title..."
              style={{ flex: 1, padding: '0.5rem 0', background: 'transparent', border: 'none', borderBottom: '2px solid var(--surface-4)', color: 'var(--text-primary)', fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.02em', outline: 'none' }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface-1)', border: '1px solid var(--surface-3)', padding: '6px 12px', borderRadius: 8 }}>
              <input 
                type="number"
                value={duration}
                onChange={e => setDuration(parseInt(e.target.value) || 0)}
                style={{ width: 50, background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 800, textAlign: 'right', outline: 'none' }}
              />
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Minutes</span>
            </div>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{questions.length} Questions • {calculatedTotalMarks} Total Marks</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '2rem', background: 'var(--surface-1)', border: '2px dashed var(--surface-3)', borderRadius: 16, minHeight: '300px' }}>
          
          {questions.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', margin: 'auto' }}>
              <p style={{ marginBottom: '1rem' }}>No questions added yet.</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                <button style={{ background: 'var(--brand-50)', color: 'var(--brand-700)', border: 'none', padding: '10px 20px', borderRadius: 999, fontSize: '0.875rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }} onClick={() => setQuestions([...questions, { id: `asm-manual-${Date.now()}`, text: "New question", marks: 1, type: "mcq", options: [{key: "A", text: "Option A"}], correct_answer: "A" }])}>
                  <Plus size={16} /> Add Blank Question
                </button>
                <button style={{ background: 'var(--surface-3)', color: 'var(--text-primary)', border: 'none', padding: '10px 20px', borderRadius: 999, fontSize: '0.875rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }} onClick={() => setIsImportModalOpen(true)}>
                  <PlayCircle size={16} /> Import from Bank
                </button>
              </div>
            </div>
          )}

          {questions.map((q, idx) => (
            <div key={q.id || idx} style={{ background: 'var(--surface-0)', border: '1px solid var(--surface-3)', borderRadius: 12, padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: 4, alignItems: 'center' }}>
                <GripVertical size={16} color="var(--surface-4)" style={{ cursor: 'grab' }} />
                <button onClick={() => removeQuestion(q.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 4 }}><X size={14} /></button>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <input 
                    value={q.text} 
                    onChange={e => updateQuestion(q.id, 'text', e.target.value)}
                    placeholder="Question text..."
                    style={{ flex: 1, padding: '0.5rem', background: 'var(--surface-1)', border: '1px solid var(--surface-3)', borderRadius: 8, color: 'var(--text-primary)', fontSize: '0.9375rem', fontWeight: 700 }}
                  />
                  <input 
                    type="number"
                    value={q.marks} 
                    onChange={e => updateQuestion(q.id, 'marks', parseFloat(e.target.value))}
                    style={{ width: '80px', padding: '0.5rem', background: 'var(--surface-1)', border: '1px solid var(--surface-3)', borderRadius: 8, color: 'var(--text-primary)', fontSize: '0.9375rem', fontWeight: 700 }}
                  />
                  <select 
                    value={q.type} 
                    onChange={e => updateQuestion(q.id, 'type', e.target.value)}
                    style={{ padding: '0.5rem', background: 'var(--surface-1)', border: '1px solid var(--surface-3)', borderRadius: 8, color: 'var(--text-primary)', fontSize: '0.9375rem', fontWeight: 700 }}
                  >
                    <option value="mcq">MCQ</option>
                    <option value="text">Written</option>
                  </select>
                </div>

                {q.type === 'mcq' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingLeft: '1rem', borderLeft: '2px solid var(--surface-3)' }}>
                    {q.options.map((opt, oIdx) => (
                      <div key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input 
                          type="radio" 
                          name={`correct-${q.id}`} 
                          checked={q.correct_answer === opt.key}
                          onChange={() => updateQuestion(q.id, 'correct_answer', opt.key)}
                        />
                        <span style={{ fontWeight: 800, fontSize: '0.875rem' }}>{opt.key}.</span>
                        <input 
                          value={opt.text} 
                          onChange={e => updateOption(q.id, oIdx, e.target.value)}
                          style={{ flex: 1, padding: '0.25rem 0.5rem', background: 'transparent', border: '1px solid var(--surface-3)', borderRadius: 4, color: 'var(--text-secondary)', fontSize: '0.875rem' }}
                        />
                      </div>
                    ))}
                    <button onClick={() => addOption(q.id)} style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: 'var(--brand-500)', fontSize: '0.8125rem', fontWeight: 800, cursor: 'pointer' }}>+ Add Option</button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {questions.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
              <button style={{ background: 'var(--brand-50)', color: 'var(--brand-700)', border: 'none', padding: '10px 20px', borderRadius: 999, fontSize: '0.875rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }} onClick={() => setQuestions([...questions, { text: "New question", marks: 1, type: "mcq", options: [{key: "A", text: "Option A"}], correct_answer: "A" }])}>
                <Plus size={16} /> Add Question
              </button>
              <button style={{ background: 'var(--surface-3)', color: 'var(--text-primary)', border: 'none', padding: '10px 20px', borderRadius: 999, fontSize: '0.875rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }} onClick={() => setIsImportModalOpen(true)}>
                <PlayCircle size={16} /> Import from Bank
              </button>
            </div>
          )}

        </div>
      </div>

      {/* ── Right: Exam Settings & Security ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        <div style={{ background: 'var(--surface-0)', border: '1px solid var(--surface-3)', borderRadius: 20, padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.5rem' }}>
            <ShieldCheck size={20} color="#10b981" />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--text-primary)' }}>Security & Integrity</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { label: 'Require AI Webcam Proctoring', key: 'proctoring' },
              { label: 'Lockdown Browser Mode', key: 'lockdown' },
              { label: 'Randomize Question Order', key: 'randomizeQs' },
              { label: 'Randomize Option Order', key: 'randomizeOpts' },
            ].map((setting) => (
              <div key={setting.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{setting.label}</span>
                <div 
                  onClick={() => setSecuritySettings({...securitySettings, [setting.key]: !securitySettings[setting.key]})}
                  style={{ width: 40, height: 24, borderRadius: 999, background: securitySettings[setting.key] ? '#10b981' : 'var(--surface-3)', position: 'relative', cursor: 'pointer', transition: 'background 0.2s' }}>
                  <div style={{ position: 'absolute', top: 2, left: securitySettings[setting.key] ? 18 : 2, width: 20, height: 20, borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button 
            onClick={() => handlePublish(false)}
            disabled={isPublishing}
            style={{ width: '100%', background: 'var(--surface-1)', color: 'var(--text-primary)', border: '1px solid var(--surface-3)', padding: '12px', borderRadius: 8, fontSize: '0.9375rem', fontWeight: 800, cursor: isPublishing ? 'not-allowed' : 'pointer', opacity: isPublishing ? 0.7 : 1 }}>
            Save as Draft
          </button>
          <button disabled={isPublishing} onClick={() => handlePublish(true)} style={{ width: '100%', background: 'var(--text-primary)', color: 'white', border: 'none', padding: '12px', borderRadius: 8, fontSize: '0.9375rem', fontWeight: 800, cursor: isPublishing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: isPublishing ? 0.7 : 1 }}>
            <PlayCircle size={18} /> {isPublishing ? 'Publishing...' : 'Publish Exam'}
          </button>
        </div>

      </div>

    </div>

    {isImportModalOpen && (
      <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'var(--surface-0)', width: 600, maxHeight: '80vh', borderRadius: 24, padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)' }}>Import from Bank</h2>
            <button onClick={() => setIsImportModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={20} /></button>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{selectedBankQs.size} selected for {activeSubject}</span>
            <button 
              onClick={() => {
                if (selectedBankQs.size === filteredBankQs.length) setSelectedBankQs(new Set());
                else setSelectedBankQs(new Set(filteredBankQs.map(q => q.id)));
              }}
              style={{ background: 'none', border: 'none', color: 'var(--brand-500)', fontSize: '0.875rem', fontWeight: 800, cursor: 'pointer' }}>
              {selectedBankQs.size === filteredBankQs.length && filteredBankQs.length > 0 ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredBankQs.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No questions found in bank for {activeSubject}.</p>
            ) : filteredBankQs.map((q, idx) => (
              <label key={idx} style={{ background: 'var(--surface-1)', border: '1px solid', borderColor: selectedBankQs.has(q.id) ? 'var(--brand-500)' : 'var(--surface-3)', borderRadius: 12, padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'flex-start', cursor: 'pointer', transition: 'all 0.2s' }}>
                <input 
                  type="checkbox" 
                  checked={selectedBankQs.has(q.id)}
                  onChange={(e) => {
                    const newSet = new Set(selectedBankQs);
                    if (e.target.checked) newSet.add(q.id);
                    else newSet.delete(q.id);
                    setSelectedBankQs(newSet);
                  }}
                  style={{ marginTop: 4 }}
                />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem', lineHeight: 1.4 }}>{q.text}</p>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--text-secondary)', background: 'var(--surface-2)', padding: '2px 8px', borderRadius: 4 }}>{q.type}</span>
                </div>
              </label>
            ))}
          </div>

          <button 
            disabled={selectedBankQs.size === 0}
            onClick={importSelectedQuestions} 
            style={{ width: '100%', background: 'var(--brand-500)', color: 'white', border: 'none', padding: '12px', borderRadius: 8, fontSize: '0.9375rem', fontWeight: 800, cursor: selectedBankQs.size === 0 ? 'not-allowed' : 'pointer', opacity: selectedBankQs.size === 0 ? 0.5 : 1 }}>
            Add {selectedBankQs.size} Questions to Exam
          </button>
        </div>
      </div>
    )}
    </>
  );
}

// ── Main Hub ──────────────────────────────────────────────────────────────
export default function TeacherExamForge() {
  const [activeTab, setActiveTab] = useState('bank');
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    coursesAPI.myCourses()
      .then(res => setCourses(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div style={{ position: 'relative', minHeight: '100%', paddingBottom: '4rem', overflow: 'hidden' }}>
      
      {/* ── Background Organic Orbs ── */}
      <div style={{ position: 'absolute', top: '10%', right: '10%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)', filter: 'blur(80px)', zIndex: 0, pointerEvents: 'none' }} />
      
      <div style={{ position: 'relative', zIndex: 10 }}>

        {/* ── Editorial Header ── */}
        <div style={{ marginBottom: '2rem' }}>
          

          {/* Borderless Text Tabs */}
          <div style={{ display: 'flex', gap: '3rem', marginTop: '0', borderBottom: '1px solid var(--surface-3)' }}>
            {[
              { id: 'bank', label: 'Question Bank' },
              { id: 'assembler', label: 'Exam Assembler' },
            ].map(t => (
              <button 
                key={t.id} onClick={() => setActiveTab(t.id)}
                style={{ 
                  background: 'transparent', border: 'none', cursor: 'pointer', 
                  padding: '0 0 1rem 0', 
                  fontSize: '1rem', fontWeight: 800, 
                  color: activeTab === t.id ? 'var(--text-primary)' : 'var(--text-muted)',
                  borderBottom: activeTab === t.id ? '2px solid var(--text-primary)' : '2px solid transparent',
                  transition: 'all 0.2s',
                  marginBottom: '-1px'
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab Content ── */}
        <div style={{ minHeight: '600px', paddingTop: '1rem' }}>
          {activeTab === 'bank' && <QuestionBankTab courses={courses} />}
          {activeTab === 'assembler' && <AssemblerTab courses={courses} />}
        </div>

      </div>
    </div>
  );
}
