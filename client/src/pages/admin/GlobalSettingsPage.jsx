import { useState } from 'react';
import { Settings, ShieldAlert, Zap, ToggleLeft, ToggleRight, Save, RotateCcw, Bot, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

function Toggle({ checked, onChange, color = 'var(--brand-500)' }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      style={{
        width: 48, height: 26, borderRadius: 999, padding: 3,
        background: checked ? color : '#d1d5db',
        border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center',
        justifyContent: checked ? 'flex-end' : 'flex-start',
        transition: 'background 0.2s ease',
        flexShrink: 0,
      }}
    >
      <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'all 0.2s ease' }} />
    </button>
  );
}

function SettingRow({ title, description, value, onChange, color, danger }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '2rem', padding: '1.25rem 0', borderBottom: '1px solid var(--glass-border)' }}>
      <div style={{ flex: 1 }}>
        <p style={{ fontWeight: 600, color: danger && value ? '#e11d48' : 'var(--text-primary)', fontSize: '0.9375rem', marginBottom: 4 }}>{title}</p>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{description}</p>
      </div>
      <Toggle checked={value} onChange={onChange} color={danger ? '#e11d48' : color} />
    </div>
  );
}

export default function GlobalSettingsPage() {
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    allowNewRegistrations: true,
    aiTutor: true,
    aiProctoring: true,
    aiRecommendations: true,
    debugMode: false,
  });

  const set = (key) => (val) => setSettings(s => ({ ...s, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 700));
    setSaving(false);
    toast.success('Platform settings saved successfully.');
  };

  const handleReset = () => {
    setSettings({ maintenanceMode: false, allowNewRegistrations: true, aiTutor: true, aiProctoring: true, aiRecommendations: true, debugMode: false });
    toast('Settings reset to defaults.');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: 780 }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title">Platform Settings</h1>
          <p className="page-subtitle">Control global platform behavior and feature availability.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleReset} className="btn btn-secondary" style={{ gap: 6 }}>
            <RotateCcw size={14} /> Reset
          </button>
          <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ gap: 6, minWidth: 120 }}>
            <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Maintenance Mode Banner */}
      {settings.maintenanceMode && (
        <div style={{ padding: '1rem 1.5rem', borderRadius: 14, background: '#fff1f2', border: '1.5px solid #fecdd3', display: 'flex', alignItems: 'center', gap: 10 }}>
          <ShieldAlert size={20} color="#e11d48" />
          <div>
            <p style={{ fontWeight: 700, color: '#e11d48', fontSize: '0.9375rem' }}>Maintenance Mode is ACTIVE</p>
            <p style={{ fontSize: '0.8125rem', color: '#9f1239', marginTop: 2 }}>The platform is locked. Only Super Admins can log in.</p>
          </div>
        </div>
      )}

      {/* Zone 1: Critical Controls */}
      <div className="glass-card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.25rem' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fff1f2', border: '1px solid #fecdd3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldAlert size={16} color="#e11d48" />
          </div>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Critical Controls</h2>
          <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#e11d48', background: '#fff1f2', border: '1px solid #fecdd3', padding: '2px 8px', borderRadius: 999, marginLeft: 2 }}>HIGH IMPACT</span>
        </div>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>These settings affect the entire platform immediately. Use with caution.</p>

        <SettingRow
          title="Maintenance Mode"
          description="Lock down the platform for all users. Only Super Admins can log in. Use during database migrations or critical updates."
          value={settings.maintenanceMode}
          onChange={set('maintenanceMode')}
          danger
        />
        <div style={{ borderBottom: 'none' }}>
          <SettingRow
            title="Allow New Tenant Registrations"
            description="When disabled, new organizations cannot register. Existing tenants are unaffected."
            value={settings.allowNewRegistrations}
            onChange={set('allowNewRegistrations')}
            color="#059669"
          />
        </div>
      </div>

      {/* Zone 2: Feature Flags */}
      <div className="glass-card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.25rem' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--brand-50)', border: '1px solid var(--brand-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={16} color="var(--brand-600)" />
          </div>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>AI Feature Flags</h2>
        </div>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Toggle AI-powered features globally. Individual tenants can further restrict these.</p>

        <SettingRow
          title="AI Tutor Engine"
          description="Enables the generative AI tutor assistant for all students platform-wide. Powered by Gemini."
          value={settings.aiTutor}
          onChange={set('aiTutor')}
          color="var(--brand-500)"
        />
        <SettingRow
          title="AI Exam Proctoring"
          description="Enable webcam-based behavioral monitoring and browser lockdown during exams globally."
          value={settings.aiProctoring}
          onChange={set('aiProctoring')}
          color="var(--brand-500)"
        />
        <div style={{ borderBottom: 'none' }}>
          <SettingRow
            title="AI Course Recommendations"
            description="Serve personalized course recommendations based on each student's cognitive profile and history."
            value={settings.aiRecommendations}
            onChange={set('aiRecommendations')}
            color="var(--brand-500)"
          />
        </div>
      </div>

      {/* Zone 3: Developer Settings */}
      <div className="glass-card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.25rem' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f5f3ff', border: '1px solid #ddd6fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Settings size={16} color="#7c3aed" />
          </div>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Developer Settings</h2>
        </div>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Internal tooling and debugging options.</p>

        <div style={{ borderBottom: 'none' }}>
          <SettingRow
            title="Debug Mode"
            description="Expose verbose API error messages and system logs in the UI. Disable in production."
            value={settings.debugMode}
            onChange={set('debugMode')}
            color="#7c3aed"
          />
        </div>
      </div>
    </div>
  );
}
