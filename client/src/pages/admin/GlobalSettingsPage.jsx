import { useState } from 'react';
import { Settings as SettingsIcon, ShieldAlert, Zap, Globe, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function GlobalSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    aiTutorGlobal: true,
    aiProctoringGlobal: true,
    allowNewRegistrations: true,
  });

  const handleChange = (e) => {
    const { name, checked } = e.target;
    setSettings(s => ({ ...s, [name]: checked }));
  };

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Global settings updated successfully');
    }, 600);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: 800 }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <SettingsIcon size={24} color="var(--brand-500)" /> Platform Settings
          </h1>
          <p className="page-subtitle">Configure global feature flags and maintenance controls.</p>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
          <ShieldAlert size={18} color="#e11d48" /> Critical Controls
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
            <div>
              <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Maintenance Mode</p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Lock down the platform for database migrations. Only Super Admins can log in.</p>
            </div>
            <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24 }}>
              <input type="checkbox" name="maintenanceMode" checked={settings.maintenanceMode} onChange={handleChange} style={{ opacity: 0, width: 0, height: 0 }} />
              <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: settings.maintenanceMode ? '#e11d48' : '#cbd5e1', transition: '.4s', borderRadius: 34 }}>
                <span style={{ position: 'absolute', content: '""', height: 18, width: 18, left: 3, bottom: 3, backgroundColor: 'white', transition: '.4s', borderRadius: '50%', transform: settings.maintenanceMode ? 'translateX(20px)' : 'translateX(0)' }}></span>
              </span>
            </label>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Allow New Tenant Registrations</p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Allow new organizations to sign up for the platform automatically.</p>
            </div>
            <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24 }}>
              <input type="checkbox" name="allowNewRegistrations" checked={settings.allowNewRegistrations} onChange={handleChange} style={{ opacity: 0, width: 0, height: 0 }} />
              <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: settings.allowNewRegistrations ? 'var(--brand-500)' : '#cbd5e1', transition: '.4s', borderRadius: 34 }}>
                <span style={{ position: 'absolute', content: '""', height: 18, width: 18, left: 3, bottom: 3, backgroundColor: 'white', transition: '.4s', borderRadius: '50%', transform: settings.allowNewRegistrations ? 'translateX(20px)' : 'translateX(0)' }}></span>
              </span>
            </label>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
          <Zap size={18} color="var(--brand-500)" /> Feature Flags
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
            <div>
              <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Global AI Tutor Engine</p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Enable the generative AI tutor across all tenants (can be overridden by tenant plans).</p>
            </div>
            <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24 }}>
              <input type="checkbox" name="aiTutorGlobal" checked={settings.aiTutorGlobal} onChange={handleChange} style={{ opacity: 0, width: 0, height: 0 }} />
              <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: settings.aiTutorGlobal ? 'var(--brand-500)' : '#cbd5e1', transition: '.4s', borderRadius: 34 }}>
                <span style={{ position: 'absolute', content: '""', height: 18, width: 18, left: 3, bottom: 3, backgroundColor: 'white', transition: '.4s', borderRadius: '50%', transform: settings.aiTutorGlobal ? 'translateX(20px)' : 'translateX(0)' }}></span>
              </span>
            </label>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Global AI Proctoring</p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Enable webcam and browser monitoring during exams globally.</p>
            </div>
            <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24 }}>
              <input type="checkbox" name="aiProctoringGlobal" checked={settings.aiProctoringGlobal} onChange={handleChange} style={{ opacity: 0, width: 0, height: 0 }} />
              <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: settings.aiProctoringGlobal ? 'var(--brand-500)' : '#cbd5e1', transition: '.4s', borderRadius: 34 }}>
                <span style={{ position: 'absolute', content: '""', height: 18, width: 18, left: 3, bottom: 3, backgroundColor: 'white', transition: '.4s', borderRadius: '50%', transform: settings.aiProctoringGlobal ? 'translateX(20px)' : 'translateX(0)' }}></span>
              </span>
            </label>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-primary" onClick={handleSave} disabled={loading} style={{ width: 200, justifyContent: 'center' }}>
          {loading ? 'Saving...' : <><Save size={16} /> Save Changes</>}
        </button>
      </div>

    </div>
  );
}
