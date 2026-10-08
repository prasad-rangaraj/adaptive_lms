import { useState, useEffect } from 'react';
import { 
  Plus, Settings, PlayCircle, GripVertical, CheckCircle2, ChevronRight, Trash2,
  Video, FileText, HelpCircle, UserX, MessageSquare, Send, Sparkles, BrainCircuit, Mic, Loader2, BookOpen
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { coursesAPI } from '../../services/api.service';

// ── Tab: Course Builder (Editorial Style) ─────────────────────────────────
function BuilderTab({ courseId }) {
  const [activeModule, setActiveModule] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newModuleName, setNewModuleName] = useState('');
  const [newModuleLevel, setNewModuleLevel] = useState('fundamentals');
  const [isAddingModule, setIsAddingModule] = useState(false);
  const [editingModuleTitle, setEditingModuleTitle] = useState('');
  const [editingMaterialId, setEditingMaterialId] = useState(null);
  const [editingMaterialTitle, setEditingMaterialTitle] = useState('');
  const [draggedItem, setDraggedItem] = useState(null);

  const [addingMaterialToModule, setAddingMaterialToModule] = useState(null);
  const [newMaterialTitle, setNewMaterialTitle] = useState('');
  const [newMaterialType, setNewMaterialType] = useState('video');
  const [newMaterialUrl, setNewMaterialUrl] = useState('');
  const [editingModuleId, setEditingModuleId] = useState(null);
  
  const [copilotPrompt, setCopilotPrompt] = useState('');
  const [copilotMessages, setCopilotMessages] = useState([]);
  const [copilotLoading, setCopilotLoading] = useState(false);
  
  const loadModules = async () => {
    if (!courseId) return;
    try {
      setLoading(true);
      const res = await coursesAPI.getModules(courseId);
      setModules(res.data.map(m => ({
        id: m.id,
        title: m.title,
        duration: '-',
        items: m.materials.map(mat => ({
          id: mat.id,
          type: mat.material_type,
          title: mat.title,
          duration: mat.duration_seconds ? `${Math.floor(mat.duration_seconds/60)}m` : null,
          status: mat.is_processed ? 'Processed' : 'Draft'
        }))
      })));
    } catch (err) {
      console.error("Failed to fetch modules", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModules();
  }, [courseId]);

  const handleAddModule = async () => {
    if (!newModuleName.trim()) return;
    try {
      await coursesAPI.createModule(courseId, newModuleName, newModuleLevel);
      setNewModuleName('');
      setNewModuleLevel('fundamentals');
      setIsAddingModule(false);
      loadModules();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateModule = async (moduleId) => {
    if (!editingModuleTitle.trim()) return;
    try {
      await coursesAPI.updateModule(courseId, moduleId, { title: editingModuleTitle });
      setEditingModuleId(null);
      loadModules();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateMaterial = async (materialId) => {
    if (!editingMaterialTitle.trim()) return;
    try {
      await coursesAPI.updateMaterial(courseId, materialId, { title: editingMaterialTitle });
      setEditingMaterialId(null);
      loadModules();
    } catch (e) {
      console.error(e);
    }
  };

  const handleFileUpload = async (moduleId, e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      await coursesAPI.uploadMaterial(courseId, moduleId, file);
      loadModules();
      setAddingMaterialToModule(null);
    } catch (err) {
      console.error("Upload failed", err);
    }
  };

  const handleAddMaterialUrl = async (moduleId) => {
    if (!newMaterialTitle.trim() || !newMaterialUrl.trim()) return;
    try {
      await coursesAPI.addMaterial(courseId, moduleId, {
        title: newMaterialTitle,
        type: newMaterialType,
        url: newMaterialUrl,
      });
      setAddingMaterialToModule(null);
      setNewMaterialTitle('');
      setNewMaterialUrl('');
      loadModules();
    } catch (err) {
      console.error("Failed to add material", err);
    }
  };

  const handleCopilotSend = async (presetPrompt = null) => {
    const text = presetPrompt || copilotPrompt;
    if (!text.trim()) return;
    
    setCopilotPrompt('');
    setCopilotMessages(prev => [...prev, { role: 'user', content: text }]);
    setCopilotLoading(true);
    
    try {
      const res = await coursesAPI.askCopilot(courseId, text);
      setCopilotMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch (err) {
      setCopilotMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setCopilotLoading(false);
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'video': return <Video size={14} color="var(--brand-500)" />;
      case 'document': return <FileText size={14} color="#10b981" />;
      case 'quiz': return <HelpCircle size={14} color="#8b5cf6" />;
      default: return <FileText size={14} />;
    }
  };

  const handleDeleteModule = async (moduleId, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this module?")) return;
    try {
      await coursesAPI.deleteModule(courseId, moduleId);
      loadModules();
    } catch (err) {
      console.error("Failed to delete module", err);
    }
  };

  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, targetItem, moduleId) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.id === targetItem.id) return;
    
    setModules(prev => prev.map(mod => {
      if (mod.id !== moduleId) return mod;
      const items = [...mod.items];
      const draggedIndex = items.findIndex(i => i.id === draggedItem.id);
      const targetIndex = items.findIndex(i => i.id === targetItem.id);
      
      if (draggedIndex > -1 && targetIndex > -1) {
        items.splice(draggedIndex, 1);
        items.splice(targetIndex, 0, draggedItem);
      }
      return { ...mod, items };
    }));
  };

  const handleDragEnd = async (moduleId) => {
    if (!draggedItem) return;
    setDraggedItem(null);
    const mod = modules.find(m => m.id === moduleId);
    if (!mod) return;
    
    try {
      await coursesAPI.reorderMaterials(courseId, moduleId, { itemIds: mod.items.map(i => i.id) });
    } catch (err) {
      console.error("Failed to save reorder", err);
      loadModules(); // revert
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '6rem', alignItems: 'start' }}>
      
      {/* ── Left: Organic Outline ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>Curriculum</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 8 }}>Drag modules to reorganize your syllabus.</p>
          </div>
          <button onClick={() => setIsAddingModule(!isAddingModule)} style={{ background: 'var(--text-primary)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 999, fontSize: '0.8125rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Plus size={16} /> {isAddingModule ? 'Cancel' : 'Add Module'}
          </button>
        </div>

        {isAddingModule && (
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.5rem', borderRadius: 16, border: '1px solid var(--text-primary)', boxShadow: '0 8px 30px rgba(0, 0, 0, 0.05)', background: 'var(--surface-0)' }}>
            <h4 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Plus size={18} /> Create New Module
            </h4>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <input value={newModuleName} onChange={e => setNewModuleName(e.target.value)} placeholder="Module Title..." className="input-field" style={{ flex: 1, padding: '0.875rem 1.25rem', fontSize: '0.9375rem', fontWeight: 600, borderRadius: 12, border: '1px solid var(--surface-3)', background: 'transparent', color: 'var(--text-primary)' }} autoFocus />
              <div style={{ position: 'relative', minWidth: 200 }}>
                <select value={newModuleLevel} onChange={e => setNewModuleLevel(e.target.value)} className="input-field" style={{ width: '100%', padding: '0.875rem 1.25rem', fontSize: '0.9375rem', fontWeight: 600, borderRadius: 12, border: '1px solid var(--surface-3)', background: 'var(--surface-0)', color: 'var(--text-primary)', appearance: 'none', cursor: 'pointer' }}>
                  <option value="fundamentals">🌱 Fundamentals</option>
                  <option value="beginner">🚀 Beginner</option>
                  <option value="intermediate">⚡ Intermediate</option>
                  <option value="advanced">🏆 Advanced</option>
                </select>
                <ChevronRight size={16} color="var(--text-muted)" style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%) rotate(90deg)', pointerEvents: 'none' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button onClick={() => setIsAddingModule(false)} className="btn btn-secondary" style={{ padding: '0.75rem 1.5rem', borderRadius: 10, fontWeight: 700 }}>Cancel</button>
              <button onClick={handleAddModule} className="btn" style={{ background: 'var(--text-primary)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: 10, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}><CheckCircle2 size={16} /> Save Module</button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {loading && <div style={{display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)'}}><Loader2 size={16} className="animate-spin" /> Loading curriculum...</div>}
          {!loading && modules.map((mod, index) => (
            <div key={mod.id} style={{ position: 'relative' }}>
              
              {/* Module Header (Borderless) */}
              <div 
                onClick={() => setActiveModule(activeModule === mod.id ? null : mod.id)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 0', cursor: 'pointer', borderBottom: '2px solid var(--surface-3)', transition: 'border-color 0.3s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--text-primary)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--surface-3)'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--surface-4)', width: '30px' }}>{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    {editingModuleId === mod.id ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} onClick={e => e.stopPropagation()}>
                        <input
                          autoFocus
                          value={editingModuleTitle}
                          onChange={e => setEditingModuleTitle(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleUpdateModule(mod.id)}
                          style={{
                            fontSize: '1.125rem', fontWeight: 800, padding: '4px 8px', borderRadius: 6,
                            border: '1px solid var(--brand-500)', background: 'var(--surface-0)', color: 'var(--text-primary)', outline: 'none'
                          }}
                        />
                        <button onClick={() => handleUpdateModule(mod.id)} style={{ background: 'var(--brand-500)', color: 'white', border: 'none', borderRadius: 4, padding: '4px 10px', fontSize: '0.75rem', cursor: 'pointer' }}>Save</button>
                        <button onClick={() => setEditingModuleId(null)} style={{ background: 'var(--surface-2)', color: 'var(--text-primary)', border: 'none', borderRadius: 4, padding: '4px 10px', fontSize: '0.75rem', cursor: 'pointer' }}>Cancel</button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>{mod.title}</h3>
                        <button onClick={(e) => { e.stopPropagation(); setEditingModuleId(mod.id); setEditingModuleTitle(mod.title); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} title="Edit Module Name">
                          <Settings size={14} />
                        </button>
                        <button onClick={(e) => handleDeleteModule(mod.id, e)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444' }} title="Delete Module">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginTop: 4, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{mod.duration} • {mod.items.length} Lessons</p>
                  </div>
                </div>
                <ChevronRight size={20} color="var(--text-muted)" style={{ transform: activeModule === mod.id ? 'rotate(90deg)' : 'none', transition: 'transform 0.3s ease' }} />
              </div>

              {/* Module Content */}
              <div style={{ height: activeModule === mod.id ? 'auto' : 0, overflow: 'hidden', opacity: activeModule === mod.id ? 1 : 0, transition: 'opacity 0.3s' }}>
                <div style={{ padding: '1.5rem 0 1.5rem 4rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  
                  {mod.items.map(item => (
                    <div 
                      key={item.id} 
                      draggable
                      onDragStart={(e) => handleDragStart(e, item)}
                      onDragOver={(e) => handleDragOver(e, item, mod.id)}
                      onDragEnd={() => handleDragEnd(mod.id)}
                      style={{ 
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                        opacity: draggedItem?.id === item.id ? 0.5 : 1,
                        background: 'transparent', transition: 'opacity 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        <GripVertical size={14} color="var(--surface-4)" style={{ cursor: 'grab' }} />
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--surface-1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {getTypeIcon(item.type)}
                        </div>
                        {editingMaterialId === item.id ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} onClick={e => e.stopPropagation()}>
                            <input
                              autoFocus
                              value={editingMaterialTitle}
                              onChange={e => setEditingMaterialTitle(e.target.value)}
                              onKeyDown={e => e.key === 'Enter' && handleUpdateMaterial(item.id)}
                              style={{
                                fontSize: '0.9375rem', fontWeight: 700, padding: '2px 8px', borderRadius: 4,
                                border: '1px solid var(--brand-500)', background: 'var(--surface-0)', color: 'var(--text-primary)', outline: 'none'
                              }}
                            />
                            <button onClick={() => handleUpdateMaterial(item.id)} style={{ background: 'var(--brand-500)', color: 'white', border: 'none', borderRadius: 4, padding: '2px 8px', fontSize: '0.75rem', cursor: 'pointer' }}>Save</button>
                            <button onClick={() => setEditingMaterialId(null)} style={{ background: 'var(--surface-2)', color: 'var(--text-primary)', border: 'none', borderRadius: 4, padding: '2px 8px', fontSize: '0.75rem', cursor: 'pointer' }}>Cancel</button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>{item.title}</span>
                            <button onClick={(e) => { e.stopPropagation(); setEditingMaterialId(item.id); setEditingMaterialTitle(item.title); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--surface-3)' }} title="Edit Material Name" onMouseEnter={e => e.currentTarget.style.color = 'var(--text-muted)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--surface-3)'}>
                              <Settings size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                        {item.duration && <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>{item.duration}</span>}
                        <span style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: item.status === 'Published' ? '#10b981' : '#d97706' }}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  {addingMaterialToModule === mod.id ? (
                    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.5rem', borderRadius: 16, border: '1px solid var(--surface-2)', boxShadow: '0 12px 40px rgba(0, 0, 0, 0.08)', background: 'var(--surface-0)' }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Plus size={16} color="var(--brand-500)" /> Add New Material
                      </h4>
                      <input 
                        placeholder="Topic Description / Title..." 
                        value={newMaterialTitle} 
                        onChange={e => setNewMaterialTitle(e.target.value)} 
                        className="input-field"
                        style={{ padding: '0.875rem 1.25rem', fontSize: '0.9375rem', fontWeight: 600, borderRadius: 12, border: '1px solid var(--surface-3)', background: 'var(--surface-1)', color: 'var(--text-primary)', outline: 'none' }} 
                        autoFocus
                      />
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ position: 'relative', width: '200px' }}>
                          <select 
                            value={newMaterialType} 
                            onChange={e => setNewMaterialType(e.target.value)} 
                            className="input-field"
                            style={{ width: '100%', padding: '0.875rem 2.5rem 0.875rem 1.25rem', fontSize: '0.9375rem', fontWeight: 600, borderRadius: 12, border: '1px solid var(--surface-3)', background: 'var(--surface-1)', color: 'var(--text-primary)', appearance: 'none', cursor: 'pointer', outline: 'none' }}
                          >
                            <option value="video">Video URL</option>
                            <option value="pdf">PDF URL</option>
                            <option value="upload">Upload File</option>
                          </select>
                          <ChevronRight size={16} color="var(--text-muted)" style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%) rotate(90deg)', pointerEvents: 'none' }} />
                        </div>
                        
                        {newMaterialType === 'upload' ? (
                          <div style={{ position: 'relative', flex: 1, display: 'flex' }}>
                            <input type="file" onChange={(e) => handleFileUpload(mod.id, e)} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', zIndex: 10 }} />
                            <div className="input-field" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.875rem', borderRadius: 12, border: '2px dashed var(--brand-300)', background: 'var(--surface-1)', color: 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
                              <Plus size={18} style={{ marginRight: 8, color: 'var(--brand-500)' }} /> Click to browse or drag file here
                            </div>
                          </div>
                        ) : (
                          <input 
                            placeholder={`Enter ${newMaterialType.toUpperCase()} URL here...`}
                            value={newMaterialUrl}
                            onChange={e => setNewMaterialUrl(e.target.value)}
                            className="input-field"
                            style={{ flex: 1, padding: '0.875rem 1.25rem', fontSize: '0.9375rem', fontWeight: 500, borderRadius: 12, border: '1px solid var(--surface-3)', background: 'var(--surface-1)', color: 'var(--text-primary)', outline: 'none' }} 
                          />
                        )}
                      </div>
                      
                      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                        <button onClick={() => setAddingMaterialToModule(null)} className="btn btn-secondary" style={{ padding: '0.75rem 1.5rem', borderRadius: 10, fontWeight: 700 }}>Cancel</button>
                        {newMaterialType !== 'upload' && (
                          <button onClick={() => handleAddMaterialUrl(mod.id)} className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', borderRadius: 10, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <CheckCircle2 size={16} /> Save Material
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setAddingMaterialToModule(mod.id)} style={{ alignSelf: 'flex-start', background: 'transparent', border: 'none', color: 'var(--brand-600)', fontSize: '0.875rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '0.5rem 0', marginTop: '0.5rem' }}>
                      <Plus size={16} /> Add Material
                    </button>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* ── Right: Studio Co-Pilot ── */}
      <div style={{ position: 'sticky', top: '100px', display: 'flex', flexDirection: 'column' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '2rem' }}>
          <Sparkles size={24} color="#8b5cf6" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Studio Copilot</h2>
        </div>
        
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2.5rem' }}>
          I can help you construct this module. Need a quiz generated from the video transcript? Or reading materials summarized? Just ask.
        </p>

        {copilotMessages.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem', maxHeight: '400px', overflowY: 'auto' }}>
            {copilotMessages.map((msg, idx) => (
              <div key={idx} style={{ padding: '1rem', borderRadius: 12, background: msg.role === 'user' ? 'var(--surface-1)' : '#f5f3ff', border: msg.role === 'user' ? '1px solid var(--surface-3)' : '1px solid #ddd6fe', color: msg.role === 'user' ? 'var(--text-primary)' : '#4c1d95', fontSize: '0.875rem', lineHeight: 1.5 }}>
                {msg.content}
              </div>
            ))}
            {copilotLoading && (
              <div style={{ padding: '1rem', borderRadius: 12, background: '#f5f3ff', border: '1px solid #ddd6fe', display: 'flex', gap: 8, color: '#4c1d95', fontSize: '0.875rem' }}>
                <Loader2 size={16} className="animate-spin" /> Thinking...
              </div>
            )}
          </div>
        )}

        {/* AI Action Suggestions */}
        {copilotMessages.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
            {[
              { label: 'Auto-Generate Quiz', icon: HelpCircle },
              { label: 'Draft Lesson Summary', icon: FileText },
              { label: 'Suggest Learning Objectives', icon: BrainCircuit },
            ].map((action, i) => (
              <button key={i} onClick={() => handleCopilotSend(action.label)} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 0', background: 'transparent', border: 'none', borderBottom: '1px solid var(--surface-3)', cursor: 'pointer', textAlign: 'left', transition: 'padding-left 0.2s' }} onMouseEnter={e => { e.currentTarget.style.paddingLeft = '0.5rem'; e.currentTarget.style.borderColor = '#8b5cf6' }} onMouseLeave={e => { e.currentTarget.style.paddingLeft = '0'; e.currentTarget.style.borderColor = 'var(--surface-3)' }}>
                <action.icon size={16} color="#8b5cf6" />
                <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>{action.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Input Field */}
        <div style={{ position: 'relative' }}>
          <input 
            placeholder="Type your command..." 
            value={copilotPrompt}
            onChange={e => setCopilotPrompt(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCopilotSend()}
            disabled={copilotLoading}
            style={{ width: '100%', padding: '1rem 3rem 1rem 0', background: 'transparent', border: 'none', borderBottom: '2px solid var(--text-primary)', color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 600, outline: 'none' }}
          />
          <button onClick={() => handleCopilotSend()} disabled={copilotLoading} style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#8b5cf6', cursor: 'pointer' }}>
            <Send size={20} />
          </button>
        </div>

      </div>
    </div>
  );
}

// ── Tab: Cohort Management ────────────────────────────────────────────────
function CohortTab({ courseId }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!courseId) return;
    coursesAPI.getStudents(courseId)
      .then(res => setStudents(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [courseId]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>Active Roster</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 8 }}>{students.length} students currently enrolled.</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Table Header (Minimal) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr auto', gap: '1rem', paddingBottom: '1rem', borderBottom: '2px solid var(--surface-4)', marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Student</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Level</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Progress</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Assessment</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</span>
          <span style={{ width: 80 }}></span>
        </div>

        {/* Student Rows */}
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}><Loader2 size={16} className="animate-spin" /> Loading students...</div>
        ) : students.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No students enrolled in this course yet.</div>
        ) : students.map((student) => (
          <div key={student.id} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr auto', gap: '1rem', alignItems: 'center', padding: '1.5rem 0', borderBottom: '1px solid var(--surface-3)', transition: 'background 0.3s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-1)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 800, color: 'var(--text-secondary)' }}>
                {student.name ? student.name.charAt(0) : 'U'}
              </div>
              <div style={{ minWidth: 0, overflow: 'hidden' }}>
                <h4 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{student.name}</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{student.email}</p>
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--brand-500)' }}>
                {student.learning_path === 'pending' ? 'Pending' : student.learning_path}
              </span>
            </div>

            <div>
              <span style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--text-primary)' }}>{student.progress}%</span>
            </div>

            <div>
              <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-secondary)' }}>
                {student.placement_score !== null ? `${student.placement_score}/100` : 'N/A'}
              </span>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: student.status === 'On Track' ? '#10b981' : '#ef4444' }}>
                {student.status}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 8 }}><MessageSquare size={18} /></button>
            </div>
            
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Tab: Announcements ────────────────────────────────────────────────────
function AnnouncementsTab() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '6rem', alignItems: 'start' }}>
      
      {/* ── Left: Composer ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>Broadcast</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 8 }}>Send an update to all 124 enrolled students.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '2rem' }}>
          <input 
            placeholder="Subject Title" 
            style={{ width: '100%', padding: '1rem 0', background: 'transparent', border: 'none', borderBottom: '2px solid var(--surface-4)', color: 'var(--text-primary)', fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.02em', outline: 'none' }}
          />
          
          <textarea 
            placeholder="Write your announcement here... Use Markdown if needed." 
            style={{ width: '100%', minHeight: '300px', padding: '1rem 0', background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '1.125rem', lineHeight: 1.6, resize: 'vertical', outline: 'none' }}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '2px solid var(--surface-3)', paddingTop: '1.5rem' }}>
            <button style={{ background: 'var(--text-primary)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: 999, fontSize: '0.9375rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Send size={16} /> Broadcast Message
            </button>
          </div>
        </div>
      </div>

      {/* ── Right: History ── */}
      <div style={{ position: 'sticky', top: '100px', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2rem' }}>Previous Broadcasts</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-500)', marginBottom: 4, display: 'block' }}>Aug 12, 2026</span>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>Welcome to Advanced ML</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.5 }}>Please make sure you have reviewed the syllabus before our first live session...</p>
          </div>
          
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-500)', marginBottom: 4, display: 'block' }}>Aug 15, 2026</span>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>Assignment 1 Deadline Extended</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.5 }}>Due to a system outage, I am extending the deadline by 48 hours...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tab: Assignments (Editorial Style) ─────────────────────────────────
function AssignmentsTab({ courseId }) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  
  const loadAssignments = async () => {
    try {
      const res = await coursesAPI.getAssignments(courseId);
      setAssignments(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAssignments(); }, [courseId]);

  const handleCreate = async () => {
    if (!title.trim()) return;
    try {
      await coursesAPI.createAssignment(courseId, {
        title,
        description: desc,
        // Default due date to 1 week from now
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        total_marks: 100
      });
      setTitle('');
      setDesc('');
      loadAssignments();
    } catch(e) { console.error(e); }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '4rem', alignItems: 'start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)' }}>Active Assignments</h2>
        {loading ? (
          <div style={{ color: 'var(--text-muted)' }}>Loading assignments...</div>
        ) : assignments.length === 0 ? (
          <div style={{ color: 'var(--text-muted)' }}>No assignments assigned yet.</div>
        ) : assignments.map(a => (
          <div key={a.id} className="card" style={{ padding: '1.5rem', borderRadius: 16 }}>
            <h4 style={{ fontSize: '1.125rem', fontWeight: 800 }}>{a.title}</h4>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.9375rem' }}>{a.description}</p>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 700 }}>
              <span>Due: {new Date(a.due_date).toLocaleDateString()}</span>
              <span>Marks: {a.total_marks}</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="card" style={{ padding: '1.5rem', borderRadius: 16, background: 'var(--surface-1)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1.5rem' }}>Create New Assignment</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="label">Title <span style={{ color: '#dc2626' }}>*</span></label>
            <input value={title} onChange={e => setTitle(e.target.value)} className="input" placeholder="e.g. Final Case Study" />
          </div>
          <div>
            <label className="label">Instructions / Description</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} className="input" placeholder="What should the students do?" rows={4} style={{ resize: 'vertical' }} />
          </div>
          <button onClick={handleCreate} disabled={!title.trim()} className="btn btn-primary" style={{ marginTop: '1rem', width: '100%' }}>
            <Plus size={16} /> Assign to Students
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Hub ──────────────────────────────────────────────────────────────
export default function TeacherStudioHub() {
  const [activeTab, setActiveTab] = useState('builder');
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [showNewCourse, setShowNewCourse] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseDesc, setNewCourseDesc] = useState('');
  const [creating, setCreating] = useState(false);

  const loadCourses = async () => {
    try {
      let res = await coursesAPI.myCourses();
      if (res.data.length === 0) {
        res = await coursesAPI.list();
      }
      setCourses(res.data);
      if (res.data.length > 0 && !selectedCourseId) setSelectedCourseId(res.data[0].id);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { loadCourses(); }, []);
  
  const activeCourse = courses.find(c => c.id === selectedCourseId) || courses[0] || null;

  const handleCreateCourse = async () => {
    if (!newCourseTitle.trim()) return;
    try {
      setCreating(true);
      const res = await coursesAPI.create({ title: newCourseTitle, description: newCourseDesc || null });
      setNewCourseTitle(''); setNewCourseDesc(''); setShowNewCourse(false);
      await loadCourses();
      setSelectedCourseId(res.data.id);
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  const handlePublish = async () => {
    if (!activeCourse) return;
    try {
      await coursesAPI.publish(activeCourse.id);
      await loadCourses();
    } catch (e) { console.error(e); }
  };

  return (
    <div style={{ position: 'relative', minHeight: '100%', paddingBottom: '4rem', overflow: 'hidden' }}>
      
      {/* ── Background Organic Orbs ── */}
      <div style={{ position: 'absolute', top: '20%', left: '40%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(139,92,246,0.04) 0%, transparent 70%)', filter: 'blur(80px)', zIndex: 0, pointerEvents: 'none' }} />
      
      <div style={{ position: 'relative', zIndex: 10 }}>

        {/* ── Create Course Modal ── */}
        {showNewCourse && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setShowNewCourse(false)}>
            <div className="card animate-scale-in" style={{ width: '100%', maxWidth: 460, padding: '1.75rem', borderRadius: 20 }} onClick={e => e.stopPropagation()}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '1.5rem' }}>Create New Course</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label className="label">Course Title <span style={{ color: '#dc2626' }}>*</span></label>
                  <input autoFocus value={newCourseTitle} onChange={e => setNewCourseTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCreateCourse()} placeholder="e.g. Advanced Machine Learning" className="input" />
                </div>
                <div>
                  <label className="label">Description <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
                  <textarea value={newCourseDesc} onChange={e => setNewCourseDesc(e.target.value)} placeholder="Brief overview of what students will learn..." className="input" rows={3} style={{ resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5 }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                <button onClick={() => setShowNewCourse(false)} className="btn btn-secondary">Cancel</button>
                <button onClick={handleCreateCourse} disabled={creating || !newCourseTitle.trim()} className="btn btn-primary" style={{ minWidth: 130 }}>
                  {creating ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
                  {creating ? 'Creating…' : 'Create Course'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Editorial Header & Minimal Tabs ── */}
        <div style={{ marginBottom: '2rem' }}>
          

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              {/* Course Selector */}
              {courses.length > 0 && (
                <select
                  value={selectedCourseId || ''}
                  onChange={e => setSelectedCourseId(parseInt(e.target.value))}
                  className="input"
                  style={{ width: 'auto', minWidth: 180, padding: '0.5rem 2rem 0.5rem 0.75rem', fontSize: '0.875rem', fontWeight: 700 }}
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title}{!c.is_published ? ' (Draft)' : ''}</option>
                  ))}
                </select>
              )}
              {/* Publish button */}
              {activeCourse && !activeCourse.is_published && (
                <button onClick={handlePublish} className="btn btn-secondary" style={{ fontSize: '0.8125rem' }}>
                  <PlayCircle size={14} /> Publish
                </button>
              )}
              <button onClick={() => setShowNewCourse(true)} style={{ background: 'var(--text-primary)', color: 'white', border: 'none', padding: '8px 18px', borderRadius: 999, fontSize: '0.8125rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Plus size={15} /> New Course
              </button>
            </div>
          </div>

          {/* Borderless Text Tabs */}
          <div style={{ display: 'flex', gap: '3rem', marginTop: '3rem', borderBottom: '1px solid var(--surface-3)' }}>
            {[
              { id: 'builder', label: 'Curriculum Builder' },
              { id: 'cohort', label: 'Student Cohort' },
              { id: 'assignments', label: 'Assignments' },
              { id: 'announcements', label: 'Announcements' },
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

        {/* ── No courses state ── */}
        {courses.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '1rem' }}>
            <BookOpen size={48} color="var(--surface-4)" />
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>No Courses Yet</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>Create your first course to get started.</p>
            <button onClick={() => setShowNewCourse(true)} className="btn btn-primary btn-lg" style={{ marginTop: '0.5rem' }}>
              <Plus size={18} /> Create First Course
            </button>
          </div>
        )}

        {/* ── Tab Content ── */}
        {activeCourse && (
          <div style={{ minHeight: '600px' }}>
            {activeTab === 'builder' && <BuilderTab courseId={activeCourse?.id} />}
            {activeTab === 'cohort' && <CohortTab courseId={activeCourse?.id} />}
            {activeTab === 'assignments' && <AssignmentsTab courseId={activeCourse?.id} />}
            {activeTab === 'announcements' && <AnnouncementsTab courseId={activeCourse?.id} />}
          </div>
        )}

      </div>
    </div>
  );
}
