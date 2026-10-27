import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { authAPI } from '../../services/api.service';
import toast from 'react-hot-toast';
import {
  Settings, User, Lock, Bell, Sparkles, Sliders, Shield, Save,
  CheckCircle2, Key, Video, BookOpen, Clock, AlertTriangle, Monitor,
  Smartphone, Award, RotateCcw, Check, Eye, EyeOff
} from 'lucide-react';

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
];

export default function TeacherSettingsHub() {
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');

  // Profile Form State
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [department, setDepartment] = useState(user?.department || 'Computer Science & Engineering');
  const [title, setTitle] = useState(user?.title || 'Faculty Lead / Lecturer');
  const [bio, setBio] = useState(user?.bio || 'Dedicated to cognitive learning models and interactive software engineering curricula.');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar_url || AVATAR_OPTIONS[1]);
  const [savingProfile, setSavingProfile] = useState(false);

  // Teaching Preferences State
  const [teachingPrefs, setTeachingPrefs] = useState(() => {
    try {
      const saved = localStorage.getItem('adaptive_lms_teacher_prefs');
      return saved ? JSON.parse(saved) : {
        autoRecordLive: true,
        confusionAlerts: true,
        aiGradingAssistant: true,
        passingThreshold: 70,
        examAutoBalance: true,
        lateGracePeriodHours: 24,
      };
    } catch {
      return {
        autoRecordLive: true,
        confusionAlerts: true,
        aiGradingAssistant: true,
        passingThreshold: 70,
        examAutoBalance: true,
        lateGracePeriodHours: 24,
      };
    }
  });

  // Notifications State
  const [notifPrefs, setNotifPrefs] = useState(() => {
    try {
      const saved = localStorage.getItem('adaptive_lms_teacher_notifs');
      return saved ? JSON.parse(saved) : {
        assignmentSubmissions: true,
        studentMessages: true,
        liveSessionJoinAlert: true,
        weeklyDigest: false,
      };
    } catch {
      return {
        assignmentSubmissions: true,
        studentMessages: true,
        liveSessionJoinAlert: true,
        weeklyDigest: false,
      };
    }
  });

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Save Profile Handler
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
        department,
        title,
        bio,
      });
      toast.success('Faculty profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  // Save Teaching Preferences
  const handleSaveTeachingPrefs = () => {
    localStorage.setItem('adaptive_lms_teacher_prefs', JSON.stringify(teachingPrefs));
    toast.success('Teaching & AI co-pilot preferences updated.');
  };

  // Save Notification Preferences
  const handleSaveNotifs = () => {
    localStorage.setItem('adaptive_lms_teacher_notifs', JSON.stringify(notifPrefs));
    toast.success('Notification preferences updated.');
  };

  // Change Password Handler
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

  const tabs = [
    { id: 'profile', label: 'Faculty Profile', icon: User },
    { id: 'teaching', label: 'Teaching & AI Co-pilot', icon: Sparkles },
    { id: 'notifications', label: 'Notification Rules', icon: Bell },
    { id: 'security', label: 'Security & Access', icon: Lock },
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
            Faculty Workspace
          </span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)', margin: '4px 0 0' }}>
            Instructor Settings
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
            Manage your teaching persona, real-time AI assistance, and security settings.
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

      {/* ── Tab 1: Faculty Profile ── */}
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
                Profile Avatar
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
                Account Email
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Academic Title / Role
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="input-field"
                style={{ width: '100%', fontSize: '0.875rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Department / Faculty
              </label>
              <input
                type="text"
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="input-field"
                style={{ width: '100%', fontSize: '0.875rem' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Bio & Faculty Description
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

      {/* ── Tab 2: Teaching & AI Co-pilot ── */}
      {activeTab === 'teaching' && (
        <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              AI Co-Pilot & Class Preferences
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              Configure how classroom intelligence models assist you in real time.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* Auto Record */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', background: 'var(--surface-1)', borderRadius: 12, border: '1px solid var(--glass-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Video size={18} />
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)', margin: 0 }}>Auto-record Live Sessions</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Generate AI transcripts, key topic chapters, and searchable audio summaries.</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={teachingPrefs.autoRecordLive}
                onChange={e => setTeachingPrefs(p => ({ ...p, autoRecordLive: e.target.checked }))}
                style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--brand-600)' }}
              />
            </div>

            {/* Confusion Alerts */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', background: 'var(--surface-1)', borderRadius: 12, border: '1px solid var(--glass-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={18} />
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)', margin: 0 }}>Real-Time Student Confusion Detection</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Receive subtle HUD prompts when &gt;25% of attendees exhibit hesitation on a concept.</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={teachingPrefs.confusionAlerts}
                onChange={e => setTeachingPrefs(p => ({ ...p, confusionAlerts: e.target.checked }))}
                style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--brand-600)' }}
              />
            </div>

            {/* AI Grading Assistant */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', background: 'var(--surface-1)', borderRadius: 12, border: '1px solid var(--glass-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Award size={18} />
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)', margin: 0 }}>Automated Rubric Suggestion Engine</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Pre-score essay and coding submissions with confidence intervals for teacher approval.</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={teachingPrefs.aiGradingAssistant}
                onChange={e => setTeachingPrefs(p => ({ ...p, aiGradingAssistant: e.target.checked }))}
                style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--brand-600)' }}
              />
            </div>

            {/* Passing Grade Threshold */}
            <div style={{ padding: '1.25rem', background: 'var(--surface-1)', borderRadius: 12, border: '1px solid var(--glass-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>Default Passing Threshold</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--brand-600)' }}>{teachingPrefs.passingThreshold}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="90"
                value={teachingPrefs.passingThreshold}
                onChange={e => setTeachingPrefs(p => ({ ...p, passingThreshold: Number(e.target.value) }))}
                style={{ width: '100%', accentColor: 'var(--brand-600)', cursor: 'pointer' }}
              />
            </div>

          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
            <button onClick={handleSaveTeachingPrefs} className="btn btn-primary" style={{ gap: 8, fontWeight: 700 }}>
              <Save size={16} /> Save Teaching Preferences
            </button>
          </div>

        </div>
      )}

      {/* ── Tab 3: Notifications ── */}
      {activeTab === 'notifications' && (
        <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Communication & Alerts
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              Choose which events trigger instant notifications.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {[
              { key: 'assignmentSubmissions', title: 'Student Assignment Submissions', desc: 'Notify immediately when a student submits coursework or an exam.' },
              { key: 'studentMessages', title: 'Direct Student Messages & Chat', desc: 'Audio sound and top banner ping when students ask questions.' },
              { key: 'liveSessionJoinAlert', title: 'Live Session Join Chimes', desc: 'Discreet chime when students enter the virtual meeting room.' },
              { key: 'weeklyDigest', title: 'Weekly Cohort Engagement Digest', desc: 'Comprehensive email summary every Monday with dropout risk predictions.' },
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
              <Save size={16} /> Save Notification Preferences
            </button>
          </div>
        </div>
      )}

      {/* ── Tab 4: Security & Access ── */}
      {activeTab === 'security' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Change Password */}
          <form onSubmit={handleChangePassword} className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Update Password
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                Protect your faculty instructor privileges with a strong passphrase.
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
                <Key size={16} /> {savingPassword ? 'Updating Password...' : 'Update Password'}
              </button>
            </div>
          </form>

          {/* Active Devices & Session */}
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 1rem' }}>
              Active Sessions & Device Registry
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--surface-1)', borderRadius: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Monitor size={20} color="var(--brand-600)" />
                <div>
                  <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)', margin: 0 }}>Current Web Browser Session</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Windows 11 · Chrome 130 · IP 127.0.0.1</p>
                </div>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#16a34a', background: '#f0fdf4', padding: '3px 10px', borderRadius: 999 }}>
                Active Now
              </span>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
