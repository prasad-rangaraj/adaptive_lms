import { useState } from 'react';
import { 
  Crown, Star, Zap, Save, CheckCircle2, X, Plus, 
  DollarSign, FileText, Tag, Users, Download, ArrowUpRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const INITIAL_PLANS = [
  { id: 'basic', name: 'Basic Plan', icon: Star, color: '#4b5563', bg: '#f9fafb', border: '#e5e7eb', price: 0, features: ['Up to 50 active users', 'Standard Course Builder', 'Community Support'], limits: { storage: 10, ai_credits: 0 } },
  { id: 'pro', name: 'Professional', icon: Zap, color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', price: 299, popular: true, features: ['Up to 500 active users', 'Advanced Analytics Dashboard', 'AI Tutor (500 credits)', 'Priority Email Support'], limits: { storage: 100, ai_credits: 500 } },
  { id: 'enterprise', name: 'Enterprise', icon: Crown, color: '#4f46e5', bg: '#eef2ff', border: '#c7d2fe', price: 999, features: ['Unlimited users', 'White-label Branding', 'Unlimited AI Credits', 'Dedicated Success Manager', 'SSO & Custom Integrations'], limits: { storage: 1000, ai_credits: 999999 } }
];

// ── Tab 1: Pricing Plans (Old Page) ──────────────────────────────────────────
function PricingPlansTab() {
  const [plans, setPlans] = useState(INITIAL_PLANS);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    toast.success('Subscription plans updated successfully!');
    setSaving(false);
  };

  const updatePlan = (id, field, value) => setPlans(plans.map(p => p.id === id ? { ...p, [field]: value } : p));
  const addFeature = (id) => { const f = prompt('Enter feature:'); if (f) setPlans(plans.map(p => p.id === id ? { ...p, features: [...p.features, f] } : p)); };
  const removeFeature = (id, index) => setPlans(plans.map(p => p.id === id ? { ...p, features: p.features.filter((_, i) => i !== index) } : p));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ gap: 8 }}><Save size={16} /> {saving ? 'Saving...' : 'Publish Plans'}</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', alignItems: 'stretch' }}>
        {plans.map((plan) => {
          const PlanIcon = plan.icon;
          return (
            <div key={plan.id} className="glass-card" style={{ padding: 0, position: 'relative', display: 'flex', flexDirection: 'column' }}>
              {plan.popular && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: plan.color, color: 'white', fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '4px 12px', borderRadius: 999, boxShadow: `0 4px 12px ${plan.color}40` }}>Most Popular</div>}
              <div style={{ padding: '2rem 1.5rem', background: plan.bg, borderBottom: `1px solid ${plan.border}`, borderTopLeftRadius: 'inherit', borderTopRightRadius: 'inherit', textAlign: 'center' }}>
                <div style={{ width: 48, height: 48, margin: '0 auto 1rem', borderRadius: 14, background: 'white', border: `1px solid ${plan.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}><PlanIcon size={24} color={plan.color} /></div>
                <input value={plan.name} onChange={(e) => updatePlan(plan.id, 'name', e.target.value)} style={{ background: 'transparent', border: 'none', textAlign: 'center', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', width: '100%', marginBottom: 8, outline: 'none' }} />
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 4 }}>
                  <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)', paddingBottom: 4 }}>$</span>
                  <input type="number" value={plan.price} onChange={(e) => updatePlan(plan.id, 'price', parseInt(e.target.value) || 0)} style={{ background: 'transparent', border: 'none', textAlign: 'center', fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-primary)', width: 100, padding: 0, outline: 'none' }} />
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', paddingBottom: 8 }}>/mo</span>
                </div>
              </div>
              <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Plan Features</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                  {plan.features.map((feat, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}><CheckCircle2 size={16} color={plan.color} style={{ flexShrink: 0, marginTop: 2 }} /><span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', flex: 1, lineHeight: 1.4 }}>{feat}</span><button onClick={() => removeFeature(plan.id, i)} className="btn btn-ghost btn-icon btn-sm" style={{ opacity: 0.5 }}><X size={14} /></button></li>
                  ))}
                  <li><button onClick={() => addFeature(plan.id)} className="btn btn-ghost" style={{ width: '100%', fontSize: '0.8125rem', color: plan.color, border: `1px dashed ${plan.color}40`, marginTop: '0.5rem' }}>+ Add Feature</button></li>
                </ul>
                <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--glass-border)' }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Usage Quotas</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: 4 }}><span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Storage (GB)</span></div><input type="number" value={plan.limits.storage} onChange={(e) => updatePlan(plan.id, 'limits', { ...plan.limits, storage: e.target.value })} className="input-field" style={{ width: '100%', height: 32, fontSize: '0.8125rem' }} /></div>
                    <div><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: 4 }}><span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>AI Tokens/mo</span></div><input type="number" value={plan.limits.ai_credits} onChange={(e) => updatePlan(plan.id, 'limits', { ...plan.limits, ai_credits: e.target.value })} className="input-field" style={{ width: '100%', height: 32, fontSize: '0.8125rem' }} /></div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Tab 2: Invoices & Ledger ──────────────────────────────────────────────────
function InvoicesLedgerTab() {
  const invoices = [
    { id: 'INV-2024-001', org: 'TechGlobal Inc', amount: 999, status: 'paid', date: 'Oct 01, 2024' },
    { id: 'INV-2024-002', org: 'EduStart', amount: 299, status: 'past_due', date: 'Oct 01, 2024' },
    { id: 'INV-2024-003', org: 'CorpTrain Ltd', amount: 999, status: 'paid', date: 'Oct 01, 2024' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        <div className="stat-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1rem' }}><div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--brand-50)', border: '1px solid var(--brand-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-600)' }}><DollarSign size={20} /></div><p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Total Revenue (MTD)</p></div>
          <p style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>$42,850</p>
        </div>
        <div className="stat-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1rem' }}><div style={{ width: 40, height: 40, borderRadius: 12, background: '#fef2f2', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e11d48' }}><FileText size={20} /></div><p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Past Due Invoices</p></div>
          <p style={{ fontSize: '2rem', fontWeight: 900, color: '#e11d48', lineHeight: 1 }}>$1,196</p>
        </div>
      </div>
      <div className="glass-card" style={{ padding: 0 }}>
        <table className="table">
          <thead><tr><th>Invoice ID</th><th>Organization</th><th>Amount</th><th>Date</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {invoices.map(inv => (
              <tr key={inv.id}>
                <td><span style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--text-primary)' }}>{inv.id}</span></td>
                <td><span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{inv.org}</span></td>
                <td><span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>${inv.amount}</span></td>
                <td><span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{inv.date}</span></td>
                <td><span style={{ display: 'inline-flex', padding: '3px 8px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700, ...(inv.status === 'paid' ? { color: '#059669', background: '#ecfdf5', border: '1px solid #a7f3d0' } : { color: '#e11d48', background: '#fff1f2', border: '1px solid #fecdd3' }) }}>{inv.status === 'paid' ? 'PAID' : 'PAST DUE'}</span></td>
                <td><button className="btn btn-ghost btn-icon btn-sm"><Download size={14} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Tab 3: Discounts & Promos ─────────────────────────────────────────────────
function PromosTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}><button className="btn btn-primary" style={{ gap: 8 }}><Plus size={16} /> New Coupon</button></div>
      <div className="glass-card" style={{ padding: 0 }}>
        <table className="table">
          <thead><tr><th>Coupon Code</th><th>Discount</th><th>Redemptions</th><th>Expires</th><th>Status</th></tr></thead>
          <tbody>
            <tr>
              <td><span style={{ fontWeight: 800, fontFamily: 'monospace', color: '#16a34a', background: '#f0fdf4', border: '1px dashed #16a34a', padding: '4px 8px', borderRadius: 6 }}>BLACKFRIDAY50</span></td>
              <td><span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>50% off (First Year)</span></td>
              <td><span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>14 / 100 uses</span></td>
              <td><span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Nov 30, 2024</span></td>
              <td><span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '2px 8px', borderRadius: 999 }}>Active</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Tab 4: Partners & Affiliates ──────────────────────────────────────────────
function AffiliatesTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="glass-card" style={{ padding: 0 }}>
        <table className="table">
          <thead><tr><th>Partner Name</th><th>Referral Link</th><th>Conversions</th><th>Commission Owed</th><th></th></tr></thead>
          <tbody>
            <tr>
              <td><div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--brand-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-600)' }}><Users size={14} /></div><span style={{ fontWeight: 600 }}>EduConsultants LLC</span></div></td>
              <td><span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>ref=edu_consult</span></td>
              <td><span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>8 Enterprise</span></td>
              <td><span style={{ fontWeight: 800, color: '#059669' }}>$1,200.00</span></td>
              <td><button className="btn btn-secondary btn-sm" style={{ gap: 6 }}>Pay <ArrowUpRight size={14}/></button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main Hub ──────────────────────────────────────────────────────────────────
export default function GlobalMonetizationHub() {
  const [activeTab, setActiveTab] = useState('plans'); // plans, ledger, promos, affiliates

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1.5rem' }}>
        <div>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-600)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Billing & Growth</p>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>Monetization Hub</h1>
        </div>
        
        <div style={{ display: 'flex', background: 'var(--surface-1)', padding: 6, borderRadius: 16, border: '1px solid var(--glass-border)', gap: 4, overflowX: 'auto' }}>
          {[
            { id: 'plans', label: 'Pricing Plans', icon: Crown },
            { id: 'ledger', label: 'Invoices & Ledger', icon: FileText },
            { id: 'promos', label: 'Discounts', icon: Tag },
            { id: 'affiliates', label: 'Partners', icon: Users },
          ].map(t => (
            <button 
              key={t.id} onClick={() => setActiveTab(t.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.625rem 1.25rem', borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem', transition: 'all 0.2s', whiteSpace: 'nowrap', background: activeTab === t.id ? 'white' : 'transparent', color: activeTab === t.id ? 'var(--brand-600)' : 'var(--text-muted)', boxShadow: activeTab === t.id ? '0 2px 8px rgba(0,0,0,0.06)' : 'none' }}>
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'plans' && <PricingPlansTab />}
      {activeTab === 'ledger' && <InvoicesLedgerTab />}
      {activeTab === 'promos' && <PromosTab />}
      {activeTab === 'affiliates' && <AffiliatesTab />}
    </div>
  );
}
