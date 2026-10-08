import re

file_path = r'c:\projects\adaptive_lms\client\src\pages\student\StudentExamArena.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find the block we want to replace
start_str = '''          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading roadmap...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>'''

end_str = '''              {/* Final Assessment node */}
              {progress >= 100 && ('''

start_idx = content.find(start_str)
end_idx = content.find(end_str)

if start_idx == -1 or end_idx == -1:
    print("Could not find blocks!")
    exit(1)

new_block = '''          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading roadmap...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* Phase 1: Fundamentals */}
              {modules.filter(m => m.level === 'fundamentals').map((mod, modIdx) => {
                const isExpanded = expandedMod === modIdx;
                const materials = mod.materials || [];
                return (
                  <div key={mod.id} style={{ background: 'var(--surface-0)', border: '1px solid var(--surface-3)', borderRadius: 16, overflow: 'hidden', transition: 'all 0.3s' }}>
                    <div onClick={() => setExpandedMod(isExpanded ? -1 : modIdx)} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', cursor: 'pointer', userSelect: 'none' }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--brand-50)', border: '2px solid var(--brand-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 900, fontSize: '0.875rem', color: 'var(--brand-600)' }}>
                        {modIdx + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{mod.title}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, marginTop: 2 }}>{materials.length} materials</p>
                      </div>
                      <button onClick={e => { e.stopPropagation(); navigate(/student/course/?module=); onClose(); }} style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6, background: 'var(--brand-500)', color: 'white', border: 'none', borderRadius: 10, padding: '7px 14px', fontWeight: 800, fontSize: '0.8125rem', cursor: 'pointer' }}>
                        <Play size={13} /> Learn
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Assessment checkpoint node */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.5rem 0 0.5rem', gap: '0.75rem' }}>
                <div style={{ width: 2, height: 40, background: 'linear-gradient(to bottom, var(--surface-3), #fbbf24)' }} />
                <div style={{ background: isPending ? 'linear-gradient(135deg, #fef3c7, #fde68a)' : 'linear-gradient(135deg, #d1fae5, #a7f3d0)', border: 2px solid , borderRadius: 16, padding: '1.25rem 1.5rem', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: '1.75rem' }}>{isPending ? '??' : '?'}</span>
                    <div>
                      <p style={{ fontWeight: 900, fontSize: '0.9375rem', color: isPending ? '#92400e' : '#065f46', margin: 0 }}>Placement Assessment</p>
                      <p style={{ fontSize: '0.75rem', color: isPending ? '#b45309' : '#059669', margin: 0 }}>{isPending ? 'Not yet taken — unlock your path' : Completed · Path: }</p>
                    </div>
                  </div>
                  {isPending && (
                    <button onClick={() => setShowAssessment(true)} style={{ background: '#d97706', color: 'white', border: 'none', borderRadius: 10, padding: '8px 16px', fontWeight: 800, fontSize: '0.8125rem', cursor: 'pointer', flexShrink: 0 }}>Take Now</button>
                  )}
                </div>
              </div>

              {/* Phase 2: Assigned Level */}
              {!isPending && modules.filter(m => {
                if (learningPath === 'basics' && m.level === 'beginner') return true;
                if (learningPath === 'intermediate' && m.level === 'intermediate') return true;
                if (learningPath === 'advanced' && m.level === 'advanced') return true;
                return false;
              }).map((mod, index) => {
                const modIdx = index + 5;
                const isExpanded = expandedMod === modIdx;
                const materials = mod.materials || [];
                return (
                  <div key={mod.id} style={{ background: 'var(--surface-0)', border: '1px solid var(--surface-3)', borderRadius: 16, overflow: 'hidden', transition: 'all 0.3s' }}>
                    <div onClick={() => setExpandedMod(isExpanded ? -1 : modIdx)} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', cursor: 'pointer', userSelect: 'none' }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--brand-50)', border: '2px solid var(--brand-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 900, fontSize: '0.875rem', color: 'var(--brand-600)' }}>
                        {modIdx + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{mod.title}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, marginTop: 2 }}>{materials.length} materials</p>
                      </div>
                      <button onClick={e => { e.stopPropagation(); navigate(/student/course/?module=); onClose(); }} style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6, background: 'var(--brand-500)', color: 'white', border: 'none', borderRadius: 10, padding: '7px 14px', fontWeight: 800, fontSize: '0.8125rem', cursor: 'pointer' }}>
                        <Play size={13} /> Learn
                      </button>
                    </div>
                  </div>
                );
              })}

'''

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content[:start_idx] + new_block + content[end_idx:])

print("Patched Roadmap successfully!")
