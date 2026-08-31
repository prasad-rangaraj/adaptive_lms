import { useState } from 'react';
import { 
  ArrowRight, Award, Briefcase, ChevronRight, ExternalLink, 
  Star, TrendingUp, CheckCircle2, Lock, Zap, FileText, 
  Download, Share2, PlayCircle, Clock
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────
const jobs = [
  { id: 1, title: 'Junior Backend Engineer', company: 'Stripe', match: 92, type: 'Full-time', skills: ['Python', 'APIs', 'Data Structures'], aiReady: true },
  { id: 2, title: 'ML Research Intern', company: 'DeepMind', match: 87, type: 'Internship', skills: ['Machine Learning', 'Python', 'Math'], aiReady: true },
  { id: 3, title: 'Data Analyst', company: 'Airbnb', match: 78, type: 'Full-time', skills: ['SQL', 'Statistics', 'Python'], aiReady: false },
];

const applications = [
  { id: 1, role: 'Software Engineer Intern', company: 'Google', status: 'Interviewing', date: 'Applied 2 weeks ago' },
  { id: 2, role: 'Backend Developer', company: 'Zomato', status: 'Under Review', date: 'Applied 4 days ago' },
];

const certificates = [
  { id: 1, title: 'Advanced Python Programming', issued: 'Jul 2026', grade: 'A+', img: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=600&q=80', verified: true },
  { id: 2, title: 'Data Structures & Algorithms', issued: 'In Progress', grade: null, img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=80', verified: false },
];

const skillNodes = [
  { id: 'python', name: 'Python Core', status: 'mastered', score: 95 },
  { id: 'sql', name: 'Database & SQL', status: 'mastered', score: 88 },
  { id: 'api', name: 'REST APIs', status: 'in-progress', score: 45 },
  { id: 'sysdesign', name: 'System Design', status: 'locked', score: 0 },
  { id: 'cloud', name: 'Cloud Deploy', status: 'locked', score: 0 },
];

// ─────────────────────────────────────────────────────────────
// Tab: Career Pipeline & Resume
// ─────────────────────────────────────────────────────────────
function PipelineTab() {
  const [selectedSkills, setSelectedSkills] = useState(['Python Core', 'Database & SQL']);
  const resumeScore = 65 + (selectedSkills.length * 10);

  const toggleSkill = (skill) => {
    setSelectedSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '3rem', alignItems: 'start' }}>
      
      {/* Left: Opportunities & Applications */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        
        {/* AI-Matched Roles */}
        <div>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '0.375rem' }}>AI-Matched Roles</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Tailored to your cognitive profile. Practice interviews instantly.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {jobs.map(job => (
              <div key={job.id} style={{ display: 'flex', flexDirection: 'column', padding: '1.5rem', background: 'var(--surface-0)', border: '1px solid var(--surface-3)', borderRadius: 16, transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand-300)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--surface-3)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                
                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  {/* Match Orb */}
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: `conic-gradient(#10b981 ${job.match}%, var(--surface-2) ${job.match}%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 900, color: '#10b981' }}>{job.match}%</span>
                    </div>
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--text-primary)' }}>{job.title}</h3>
                      <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><ExternalLink size={16} /></button>
                    </div>
                    <p style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>{job.company} <span style={{ color: 'var(--surface-3)', margin: '0 6px' }}>|</span> <span style={{ color: 'var(--brand-600)', fontWeight: 700 }}>{job.type}</span></p>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {job.skills.map(s => (
                        <span key={s} style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--text-muted)', background: 'var(--surface-1)', padding: '3px 8px', borderRadius: 6, border: '1px solid var(--surface-3)' }}>{s}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* AI Mock Interview Action */}
                {job.aiReady && (
                  <div style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px dashed var(--surface-3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}><Zap size={14} color="#f59e0b" /> AI has analyzed the JD for this role.</p>
                    <button style={{ background: 'var(--brand-50)', color: 'var(--brand-700)', border: '1px solid var(--brand-100)', padding: '6px 14px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--brand-500)'; e.currentTarget.style.color = 'white'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'var(--brand-50)'; e.currentTarget.style.color = 'var(--brand-700)'; }}>
                      <PlayCircle size={14} /> Practice Interview
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Resume & Applications */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        
        {/* Dynamic Resume Builder */}
        <div style={{ background: 'var(--surface-0)', border: '1px solid var(--surface-3)', borderRadius: 20, padding: '1.5rem', boxShadow: '0 12px 32px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.5rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--brand-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={18} color="var(--brand-600)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--text-primary)' }}>Resume Builder</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Toggle skills to optimize for ATS</p>
            </div>
          </div>

          <div style={{ background: 'var(--brand-500)', borderRadius: 12, padding: '1.25rem', color: 'white', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.8)' }}>ATS Strength Score</p>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 900, lineHeight: 1, margin: '4px 0' }}>{resumeScore}%</h1>
            </div>
            <div style={{ textAlign: 'right' }}>
              <button style={{ background: 'white', color: 'var(--brand-600)', border: 'none', padding: '8px 16px', borderRadius: 8, fontSize: '0.8125rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Download size={14} /> Generate PDF
              </button>
            </div>
          </div>

          <div>
            <p style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Include Verified Skills:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {['Python Core', 'Database & SQL', 'REST APIs', 'React.js'].map(s => {
                const isSelected = selectedSkills.includes(s);
                return (
                  <div key={s} onClick={() => toggleSkill(s)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: isSelected ? 'var(--brand-50)' : 'var(--surface-1)', border: `1px solid ${isSelected ? 'var(--brand-200)' : 'var(--surface-3)'}`, borderRadius: 10, cursor: 'pointer', transition: 'all 0.15s' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: isSelected ? 'var(--brand-900)' : 'var(--text-secondary)' }}>{s}</span>
                    {isSelected ? <CheckCircle2 size={16} color="var(--brand-500)" /> : <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid var(--surface-3)' }} />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Application Tracker */}
        <div style={{ background: 'var(--surface-0)', border: '1px solid var(--surface-3)', borderRadius: 20, padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>Active Applications</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {applications.map(app => (
              <div key={app.id} style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--surface-2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>{app.role}</h4>
                  <span style={{ fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: app.status === 'Interviewing' ? '#10b981' : '#f59e0b', background: app.status === 'Interviewing' ? '#f0fdf4' : '#fffbeb', padding: '2px 8px', borderRadius: 999 }}>{app.status}</span>
                </div>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{app.company}</p>
                <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} /> {app.date}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Tab: Adaptive Skill Tree
// ─────────────────────────────────────────────────────────────
function SkillTreeTab() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      
      {/* Goal Header */}
      <div style={{ background: 'var(--brand-50)', border: '1px solid var(--brand-100)', borderRadius: 20, padding: '2rem', textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--brand-500)', color: 'white', padding: '4px 12px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
          <Target size={14} /> Target Career
        </div>
        <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--brand-900)', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Backend Engineer</h2>
        <p style={{ fontSize: '0.9375rem', color: 'var(--brand-700)' }}>You are currently <strong>60%</strong> of the way to achieving this career goal.</p>
      </div>

      {/* The Gamified Tree */}
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '3rem', paddingLeft: '2rem' }}>
        {/* Connecting Line */}
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: '3.75rem', width: 4, background: 'var(--surface-2)', borderRadius: 999, zIndex: 0 }} />
        <div style={{ position: 'absolute', top: 0, height: '55%', left: '3.75rem', width: 4, background: '#10b981', borderRadius: 999, zIndex: 1 }} />

        {skillNodes.map((node, index) => {
          const isMastered = node.status === 'mastered';
          const isInProgress = node.status === 'in-progress';
          
          return (
            <div key={node.id} style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
              
              {/* Node Icon */}
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: isMastered ? '#10b981' : isInProgress ? 'white' : 'var(--surface-1)', border: `4px solid ${isMastered ? '#10b981' : isInProgress ? '#f59e0b' : 'var(--surface-3)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: isInProgress ? '0 0 0 6px rgba(245,158,11,0.1)' : 'none', flexShrink: 0 }}>
                {isMastered ? <CheckCircle2 size={24} color="white" /> : isInProgress ? <PlayCircle size={24} color="#f59e0b" /> : <Lock size={24} color="var(--text-muted)" />}
              </div>

              {/* Node Info */}
              <div style={{ flex: 1, background: isMastered ? '#f0fdf4' : isInProgress ? '#fffbeb' : 'var(--surface-0)', border: `1px solid ${isMastered ? '#bbf7d0' : isInProgress ? '#fde68a' : 'var(--surface-3)'}`, padding: '1.25rem 1.5rem', borderRadius: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: node.status === 'locked' ? 0.6 : 1 }}>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 900, color: isMastered ? '#065f46' : isInProgress ? '#92400e' : 'var(--text-primary)', marginBottom: '0.25rem' }}>{node.name}</h3>
                  <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: isMastered ? '#10b981' : isInProgress ? '#f59e0b' : 'var(--text-muted)' }}>
                    {isMastered ? 'Mastery Achieved' : isInProgress ? 'Current Focus Area' : 'Locked'}
                  </p>
                </div>
                
                {isMastered && <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#10b981' }}>{node.score}%</span>}
                {isInProgress && (
                  <button style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 8, fontSize: '0.8125rem', fontWeight: 800, cursor: 'pointer' }}>Continue Learning</button>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Tab: Credentials Vault
// ─────────────────────────────────────────────────────────────
function VaultTab() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '3rem', alignItems: 'start' }}>
      
      {/* Left: Certificates */}
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '1.5rem' }}>Verified Certificates</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {certificates.map(cert => (
            <div key={cert.id} style={{ display: 'flex', gap: '2rem', background: 'var(--surface-0)', border: '1px solid var(--surface-3)', borderRadius: 20, padding: '1.5rem', opacity: cert.grade ? 1 : 0.6 }}>
              
              <div style={{ width: 220, height: 140, borderRadius: 12, overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                <img src={cert.img} alt={cert.title} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: cert.grade ? 'none' : 'grayscale(1)' }} />
                {cert.verified && (
                  <div style={{ position: 'absolute', top: 8, right: 8, background: 'white', padding: 4, borderRadius: '50%' }}>
                    <Award size={16} color="#10b981" />
                  </div>
                )}
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)' }}>{cert.title}</h3>
                  {cert.grade && <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#10b981' }}>{cert.grade}</span>}
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{cert.grade ? `Issued ${cert.issued}` : 'Currently In Progress'}</p>
                
                {cert.verified && (
                  <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto', paddingTop: '1.5rem' }}>
                    <button style={{ background: '#0a66c2', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 8, fontSize: '0.8125rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <ExternalLink size={14} /> Add to Profile
                    </button>
                    <button style={{ background: 'var(--surface-1)', color: 'var(--text-primary)', border: '1px solid var(--surface-3)', padding: '8px 16px', borderRadius: 8, fontSize: '0.8125rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Download size={14} /> Verify PDF
                    </button>
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* Right: Portfolio Link */}
      <div style={{ background: 'var(--brand-50)', border: '1px solid var(--brand-100)', borderRadius: 20, padding: '2rem', textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--brand-500)', margin: '0 auto 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Share2 size={24} color="white" />
        </div>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--brand-900)', marginBottom: '0.5rem' }}>Public Portfolio Link</h3>
        <p style={{ fontSize: '0.8125rem', color: 'var(--brand-700)', lineHeight: 1.5, marginBottom: '1.5rem' }}>Share a single verified link with recruiters containing your resume, cognitive profile, and certificates.</p>
        
        <div style={{ background: 'white', border: '1px solid var(--brand-100)', borderRadius: 12, padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>lumina.edu/p/karthik-r</span>
          <button style={{ background: 'transparent', border: 'none', color: 'var(--brand-600)', fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer' }}>Copy</button>
        </div>
        
        <button style={{ width: '100%', background: 'var(--brand-500)', color: 'white', border: 'none', padding: '10px 0', borderRadius: 8, fontSize: '0.875rem', fontWeight: 800, cursor: 'pointer' }}>Manage Visibility</button>
      </div>

    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Hub
// ─────────────────────────────────────────────────────────────
export default function StudentCareerHub() {
  const [activeTab, setActiveTab] = useState('pipeline');

  const tabs = [
    { id: 'pipeline', label: 'Career Pipeline', icon: Briefcase },
    { id: 'skills',   label: 'Adaptive Skill Tree', icon: TrendingUp },
    { id: 'vault',    label: 'Credentials Vault', icon: Award },
  ];

  return (
    <div style={{ position: 'relative', minHeight: '100%', paddingBottom: '4rem', overflow: 'hidden' }}>

      {/* Organic Orbs */}
      <div style={{ position: 'absolute', bottom: '10%', left: '10%', width: '35vw', height: '35vw', background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)', filter: 'blur(80px)', zIndex: 0, pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 10 }}>

        {/* ── Editorial Header ── */}
        <div style={{ marginBottom: '2rem' }}>
          <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--brand-500)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1rem' }}>Your Future</p>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '0.5rem' }}>
            Career<br /><span style={{ color: 'var(--text-muted)' }}>Horizon.</span>
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>Your achievements and AI-matched opportunities, in one place.</p>

          {/* Borderless Tabs */}
          <div style={{ display: 'flex', gap: '3rem', marginTop: '3rem', borderBottom: '1px solid var(--surface-3)' }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'transparent', border: 'none', cursor: 'pointer', padding: '0 0 1rem 0', fontSize: '0.9375rem', fontWeight: 800, color: activeTab === t.id ? 'var(--text-primary)' : 'var(--text-muted)', borderBottom: activeTab === t.id ? '2px solid var(--text-primary)' : '2px solid transparent', marginBottom: '-1px', transition: 'all 0.2s' }}>
                <t.icon size={16} /> {t.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ paddingTop: '1rem' }}>
          {activeTab === 'pipeline' && <PipelineTab />}
          {activeTab === 'skills'   && <SkillTreeTab />}
          {activeTab === 'vault'    && <VaultTab />}
        </div>

      </div>
    </div>
  );
}
