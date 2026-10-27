import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { authAPI } from '../../services/api.service';
import toast from 'react-hot-toast';
import {
  Settings, User, Brain, Bell, Shield, Lock, Save,
  CheckCircle2, Key, Download, Sparkles, BookOpen, Volume2,
  Eye, EyeOff, Monitor, Laptop, FileText, Check, ShieldCheck
} from 'lucide-react';

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
];

const TUTOR_STYLES = [
  { id: 'socratic', name: 'Socratic Mentor', desc: 'Asks probing questions to help you arrive at the answer independently.', icon: '🤔' },
  { id: 'coach', name: 'Encouraging Coach', desc: 'Step-by-step guidance with encouraging praise and positive reinforcement.', icon: '🎯' },
  { id: 'scholar', name: 'Deep-Dive Scholar', desc: 'Detailed theoretical explanations, research references, and proofs.', icon: '📚' },
  { id: 'concise', name: 'Concise & Exam-Focused', desc: 'Direct, bullet-point summaries highlighting high-yield test topics.', icon: '⚡' },
];

export default function StudentSettingsHub() {
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');

  // Profile State
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [major, setMajor] = useState(user?.major || 'Computer Science & Artificial Intelligence');
  const [bio, setBio] = useState(user?.bio || 'Undergraduate student exploring machine learning architectures and adaptive neural systems.');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar_url || AVATAR_OPTIONS[0]);
  const [savingProfile, setSavingProfile] = useState(false);

  // Cognitive Preferences
  const [tutorStyle, setTutorStyle] = useState(() => {
    return localStorage.getItem('adaptive_lms_tutor_style') || 'coach';
  });
  const [cognitivePrefs, setCognitivePrefs] = useState(() => {
    try {
      const saved = localStorage.getItem('adaptive_lms_student_cognitive_prefs');
      return saved ? JSON.parse(saved) : {
        adaptivePacing: true,
        soundEffects: true,
        dyslexiaFont: false,
        telemetryOptIn: true,
      };
    } catch {
      return {
        adaptivePacing: true,
        soundEffects: true,
        dyslexiaFont: false,
        telemetryOptIn: true,
      };
    }
  });

  // Notifications State
  const [notifPrefs, setNotifPrefs] = useState(() => {
    try {
      const saved = localStorage.getItem('adaptive_lms_student_notifs');
      return saved ? JSON.parse(saved) : {
        examReminders: true,
        liveClassReminders: true,
        aiStudyRecommendations: true,
        peerReplies: true,
      };
    } catch {
      return {
        examReminders: true,
        liveClassReminders: true,
        aiStudyRecommendations: true,
        peerReplies: true,
      };
    }
  });

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Save Profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await authAPI.updateProfile({
        full_name: fullName.trim(),
        avatar_url: selectedAvatar,
      });
      updateUser({
        full_name: res.data.full_name,
        avatar_url: res.data.avatar_url,
        major,
        bio,
      });
      toast.success('Student profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  // Save Cognitive Preferences
  const handleSaveCognitive = () => {
    localStorage.setItem('adaptive_lms_tutor_style', tutorStyle);
    localStorage.setItem('adaptive_lms_student_cognitive_prefs', JSON.stringify(cognitivePrefs));
    toast.success('Cognitive & AI Tutor preferences saved!');
  };

  // Save Notification Preferences
  const handleSaveNotifs = () => {
    localStorage.setItem('adaptive_lms_student_notifs', JSON.stringify(notifPrefs));
    toast.success('Notification settings saved!');
  };

  // Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    setSavingPassword(true);
    try {
      await authAPI.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      toast.success('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to change password.');
    } finally {
      setSavingPassword(false);
    }
  };

  // Export Data
  const handleExportData = () => {
    const data = {
      user: {
        id: user?.id,
        email: user?.email,
        full_name: user?.full_name,
        role: user?.role,
        major,
      },
      cognitive_preferences: cognitivePrefs,
      tutor_style: tutorStyle,
      export_date: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `academic-profile-${user?.id || 'export'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Academic profile archive downloaded.');
  };

  const tabs = [
    { id: 'profile', label: 'Student Persona', icon: User },
    { id: 'cognitive', label: 'AI Tutor & Pacing', icon: Brain },
    { id: 'notifications', label: 'Study Alerts', icon: Bell },
    { id: 'security', label: 'Security & Privacy', icon: Lock },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: 1080, margin: '0 auto' }}>
      
      {/* ── Header ── */}
      <div style={{
        background: 'linear-gradient(135deg, var(--surface-0), var(--brand-50))',
        borderRadius: 24, padding: '2rem 2.5rem', border: '1px solid var(--brand-100)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem'
      }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--brand-600)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Learner Workspace
          </span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)', margin: '4px 0 0' }}>
            Student Account Settings
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
            Customize your learning canvas, AI tutor style, study pacing, and privacy controls.
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', background: 'var(--surface-1)', padding: 5, borderRadius: 14, border: '1px solid var(--glass-border)', gap: 4 }}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '0.5rem 1rem', borderRadius: 10,
                border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.8125rem', transition: 'all 0.15s',
                background: activeTab === t.id ? 'white' : 'transparent',
                color: activeTab === t.id ? 'var(--brand-600)' : 'var(--text-muted)',
                boxShadow: activeTab === t.id ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
              }}
            >
              <t.icon size={15} /> {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab 1: Profile ── */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
            <img
              src={selectedAvatar}
              alt="Avatar"
              style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--brand-400)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px' }}>
                Select Student Avatar
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                {AVATAR_OPTIONS.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`Avatar ${i}`}
                    onClick={() => setSelectedAvatar(url)}
                    style={{
                      width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', cursor: 'pointer',
                      border: selectedAvatar === url ? '2px solid var(--brand-600)' : '1px solid var(--glass-border)',
                      transform: selectedAvatar === url ? 'scale(1.15)' : 'none', transition: 'all 0.15s'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="input-field"
                style={{ width: '100%', fontSize: '0.875rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Student Email
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="input-field"
                style={{ width: '100%', fontSize: '0.875rem', background: 'var(--surface-2)', cursor: 'not-allowed' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Major / Academic Specialization
            </label>
            <input
              type="text"
              value={major}
              onChange={e => setMajor(e.target.value)}
              className="input-field"
              style={{ width: '100%', fontSize: '0.875rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Student Bio & Learning Goals
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={e => setBio(e.target.value)}
              className="input-field"
              style={{ width: '100%', fontSize: '0.875rem', resize: 'vertical', lineHeight: 1.6 }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
            <button type="submit" disabled={savingProfile} className="btn btn-primary" style={{ gap: 8, fontWeight: 700 }}>
              <Save size={16} /> {savingProfile ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>

        </form>
      )}

      {/* ── Tab 2: Cognitive & AI Tutor ── */}
      {activeTab === 'cognitive' && (
        <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              AI Tutor Persona & Adaptive Pacing
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              Customize how the AI Tutor explains concepts and regulates course pacing.
            </p>
          </div>

          {/* Persona Selection */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>
              Preferred AI Tutor Teaching Style
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
              {TUTOR_STYLES.map(style => (
                <div
                  key={style.id}
                  onClick={() => setTutorStyle(style.id)}
                  style={{
                    padding: '1rem', borderRadius: 12, cursor: 'pointer',
                    border: tutorStyle === style.id ? '2px solid var(--brand-600)' : '1px solid var(--glass-border)',
                    background: tutorStyle === style.id ? 'var(--brand-50)' : 'var(--surface-1)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>{style.icon}</div>
                  <p style={{ fontWeight: 800, fontSize: '0.875rem', color: 'var(--text-primary)', margin: '0 0 4px' }}>
                    {style.name}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4, margin: 0 }}>
                    {style.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', background: 'var(--surface-1)', borderRadius: 12, border: '1px solid var(--glass-border)' }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)', margin: 0 }}>Real-time Cognitive Pacing</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Automatically slows video or breaks lessons into micro-steps when quizzes detect hesitation.</p>
              </div>
              <input
                type="checkbox"
                checked={cognitivePrefs.adaptivePacing}
                onChange={e => setCognitivePrefs(p => ({ ...p, adaptivePacing: e.target.checked }))}
                style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--brand-600)' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', background: 'var(--surface-1)', borderRadius: 12, border: '1px solid var(--glass-border)' }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)', margin: 0 }}>Sound Effects on Achievement</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Play celebration chimes when finishing exercises, streaks, and milestone modules.</p>
              </div>
              <input
                type="checkbox"
                checked={cognitivePrefs.soundEffects}
                onChange={e => setCognitivePrefs(p => ({ ...p, soundEffects: e.target.checked }))}
                style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--brand-600)' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', background: 'var(--surface-1)', borderRadius: 12, border: '1px solid var(--glass-border)' }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)', margin: 0 }}>Dyslexia-Friendly Typography</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Increases letter spacing and contrast across all lesson canvases for enhanced readability.</p>
              </div>
              <input
                type="checkbox"
                checked={cognitivePrefs.dyslexiaFont}
                onChange={e => setCognitivePrefs(p => ({ ...p, dyslexiaFont: e.target.checked }))}
                style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--brand-600)' }}
              />
            </div>

          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
            <button onClick={handleSaveCognitive} className="btn btn-primary" style={{ gap: 8, fontWeight: 700 }}>
              <Save size={16} /> Save Cognitive Preferences
            </button>
          </div>

        </div>
      )}

      {/* ── Tab 3: Study Alerts ── */}
      {activeTab === 'notifications' && (
        <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Study Reminders & Notifications
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              Stay on schedule with intelligent reminder pings.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {[
              { key: 'examReminders', title: 'Upcoming Exam & Assignment Deadlines', desc: 'Alerts 24 hours and 2 hours before scheduled due dates.' },
              { key: 'liveClassReminders', title: 'Live Virtual Classroom Starting Alerts', desc: 'Notification 10 minutes before an instructor live lecture begins.' },
              { key: 'aiStudyRecommendations', title: 'Personalized AI Study Tips', desc: 'Daily recommendations based on your cognitive retention curve.' },
              { key: 'peerReplies', title: 'Community Discussion Mentions', desc: 'Alerts when classmates or mentors reply to your forum posts.' },
            ].map(item => (
              <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', background: 'var(--surface-1)', borderRadius: 12, border: '1px solid var(--glass-border)' }}>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)', margin: 0 }}>{item.title}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>{item.desc}</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifPrefs[item.key]}
                  onChange={e => setNotifPrefs(p => ({ ...p, [item.key]: e.target.checked }))}
                  style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--brand-600)' }}
                />
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
            <button onClick={handleSaveNotifs} className="btn btn-primary" style={{ gap: 8, fontWeight: 700 }}>
              <Save size={16} /> Save Study Alerts
            </button>
          </div>
        </div>
      )}

      {/* ── Tab 4: Security & Privacy ── */}
      {activeTab === 'security' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Password */}
          <form onSubmit={handleChangePassword} className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Change Password
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                Keep your student learning records and exams secure.
              </p>
            </div>

            <div style={{ maxWidth: 440, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Current Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    className="input-field"
                    style={{ width: '100%', fontSize: '0.875rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  New Password (min 6 characters)
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="input-field"
                  style={{ width: '100%', fontSize: '0.875rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Confirm New Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="input-field"
                  style={{ width: '100%', fontSize: '0.875rem' }}
                />
              </div>

              <button
                type="submit"
                disabled={savingPassword}
                className="btn btn-primary"
                style={{ gap: 8, fontWeight: 700, alignSelf: 'flex-start', marginTop: 4 }}
              >
                <Key size={16} /> {savingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>

          {/* Privacy & Data Export */}
          <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Academic Data Export & Privacy Rights
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>
              Download a full portable archive of your cognitive mastery graphs, quiz transcripts, and course completion certificates.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
              <button onClick={handleExportData} className="btn btn-secondary" style={{ gap: 8, fontWeight: 700 }}>
                <Download size={16} /> Export Learning Data (JSON)
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
