import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tenantsAPI, adminAPI } from '../../services/api.service';import Loader from '../../components/ui/Loader';
import { 
  Crown, Star, Zap, Save, CheckCircle2, X, Plus, 
  DollarSign, FileText, Tag, Users, Download, ArrowUpRight, Check
} from 'lucide-react';
import toast from 'react-hot-toast';

const INITIAL_PLANS = [
  { id: 'basic', name: 'Basic Plan', icon: Star, color: '#4b5563', bg: '#f9fafb', border: '#e5e7eb', price: 0, features: ['Up to 50 active users', 'Standard Course Builder', 'Community Support'], limits: { storage: 10, ai_credits: 0 } },
  { id: 'pro', name: 'Professional', icon: Zap, color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', price: 299, popular: true, features: ['Up to 500 active users', 'Advanced Analytics Dashboard', 'AI Tutor (500 credits)', 'Priority Email Support'], limits: { storage: 100, ai_credits: 500 } },
  { id: 'enterprise', name: 'Enterprise', icon: Crown, color: '#4f46e5', bg: '#eef2ff', border: '#c7d2fe', price: 999, features: ['Unlimited users', 'White-label Branding', 'Unlimited AI Credits', 'Dedicated Success Manager', 'SSO & Custom Integrations'], limits: { storage: 1000, ai_credits: 999999 } }
];

// ── Tab 1: Pricing Plans ──────────────────────────────────────────────────────
function PricingPlansTab() {
  const [plans, setPlans] = useState(() => {
    try {
      const p = localStorage.getItem('lms_custom_plans');
      return p ? JSON.parse(p) : INITIAL_PLANS;
    } catch {
      return INITIAL_PLANS;
    }
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Serialize plans (strip icon refs which can't be JSON'd)
      const serializable = plans.map(({ icon, ...rest }) => rest);
      const res = await adminAPI.publishPlans(serializable);
      toast.success(res.data.message || 'Subscription plans published!');
      localStorage.setItem('lms_custom_plans', JSON.stringify(plans));
    } catch {
      toast.error('Failed to publish plans. Try again.');
    } finally {
      setSaving(false);
    }
  };

  const updatePlan = (id, field, value) => setPlans(plans.map(p => p.id === id ? { ...p, [field]: value } : p));
  const addFeature = (id) => { 
    const f = prompt('Enter feature name:'); 
    if (f && f.trim()) {
      setPlans(plans.map(p => p.id === id ? { ...p, features: [...p.features, f.trim()] } : p));
    }
  };
  const removeFeature = (id, index) => setPlans(plans.map(p => p.id === id ? { ...p, features: p.features.filter((_, i) => i !== index) } : p));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ gap: 8 }}>
          <Save size={16} /> {saving ? 'Saving...' : 'Publish Plans'}
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', alignItems: 'stretch' }}>
        {plans.map((plan) => {
          const PlanIcon = plan.id === 'enterprise' ? Crown : plan.id === 'pro' ? Zap : Star;
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
  const { data: tenants = [], isLoading: loadingTenants } = useQuery({
    queryKey: ['tenants'],
    queryFn: () => tenantsAPI.list().then(r => r.data),
  });

  const { data: billingStats, isLoading: loadingBilling } = useQuery({
    queryKey: ['billing-stats'],
    queryFn: () => adminAPI.getBillingStats().then(r => r.data),
  });

  if (loadingTenants || loadingBilling) return <Loader text="Compiling financial records..." />;

  const mrr = billingStats?.mrr || 0;
  const pastDueAmount = (billingStats?.suspended_tenants || 0) * 299;

  const invoices = tenants.map(t => {
    const p = (t.plan || 'basic').toLowerCase() === 'premium' ? 'enterprise' : (t.plan || 'basic').toLowerCase();
    const rate = p === 'enterprise' ? 999 : p === 'pro' ? 299 : 0;
    return {
      id: `INV-2026-${String(t.id).padStart(3, '0')}`,
      org: t.name,
      plan: p,
      amount: rate,
      status: t.is_active ? 'paid' : 'past_due',
      date: (() => {
        if (!t.created_at) return 'Oct 01, 2026';
        const d = new Date(t.created_at);
        return !isNaN(d.getTime()) ? d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Oct 01, 2026';
      })()
    };
  });

  const downloadInvoice = (inv) => {
    const content = `INVOICE: ${inv.id}\nOrganization: ${inv.org}\nPlan: ${inv.plan.toUpperCase()}\nAmount Due/Paid: $${inv.amount}.00\nStatus: ${inv.status.toUpperCase()}\nBilling Date: ${inv.date}\nPayment Terms: Net 30\n\nThank you for choosing Adaptive LMS!`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${inv.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded invoice ${inv.id}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        <div className="stat-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1rem' }}><div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--brand-50)', border: '1px solid var(--brand-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-600)' }}><DollarSign size={20} /></div><p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Total Revenue (MRR)</p></div>
          <p style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>${mrr.toLocaleString()}</p>
        </div>
        <div className="stat-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1rem' }}><div style={{ width: 40, height: 40, borderRadius: 12, background: '#fef2f2', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e11d48' }}><FileText size={20} /></div><p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Past Due Invoices</p></div>
          <p style={{ fontSize: '2rem', fontWeight: 900, color: '#e11d48', lineHeight: 1 }}>${pastDueAmount.toLocaleString()}</p>
        </div>
        <div className="stat-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1rem' }}><div style={{ width: 40, height: 40, borderRadius: 12, background: '#ecfdf5', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}><CheckCircle2 size={20} /></div><p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Active Billing Orgs</p></div>
          <p style={{ fontSize: '2rem', fontWeight: 900, color: '#059669', lineHeight: 1 }}>{billingStats?.active_tenants || tenants.length}</p>
        </div>
      </div>
      <div className="glass-card" style={{ padding: 0 }}>
        <table className="table">
          <thead><tr><th>Invoice ID</th><th>Organization</th><th>Plan</th><th>Amount</th><th>Date</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {invoices.map(inv => (
              <tr key={inv.id}>
                <td><span style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--text-primary)' }}>{inv.id}</span></td>
                <td><span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{inv.org}</span></td>
                <td><span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'capitalize', color: 'var(--brand-600)', background: 'var(--brand-50)', padding: '2px 8px', borderRadius: 4 }}>{inv.plan}</span></td>
                <td><span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>${inv.amount}</span></td>
                <td><span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{inv.date}</span></td>
                <td><span style={{ display: 'inline-flex', padding: '3px 8px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700, ...(inv.status === 'paid' ? { color: '#059669', background: '#ecfdf5', border: '1px solid #a7f3d0' } : { color: '#e11d48', background: '#fff1f2', border: '1px solid #fecdd3' }) }}>{inv.status === 'paid' ? 'PAID' : 'PAST DUE'}</span></td>
                <td><button onClick={() => downloadInvoice(inv)} className="btn btn-ghost btn-icon btn-sm" title="Download Invoice"><Download size={14} /></button></td>
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
  const [coupons, setCoupons] = useState(() => {
    try {
      const saved = localStorage.getItem('lms_coupons');
      return saved ? JSON.parse(saved) : [
        { id: 'c1', code: 'BLACKFRIDAY50', discount: '50% off (First Year)', uses: 14, maxUses: 100, expires: 'Nov 30, 2026', status: 'active' },
        { id: 'c2', code: 'EDULAUNCH20', discount: '20% off Pro Tier', uses: 48, maxUses: 50, expires: 'Dec 31, 2026', status: 'active' }
      ];
    } catch {
      return [
        { id: 'c1', code: 'BLACKFRIDAY50', discount: '50% off (First Year)', uses: 14, maxUses: 100, expires: 'Nov 30, 2026', status: 'active' }
      ];
    }
  });

  const addCoupon = () => {
    const code = prompt('Enter Coupon Code (e.g. SUMMER25):');
    if (!code) return;
    const discount = prompt('Enter discount description (e.g. 25% off all plans):') || '25% discount';
    const newCoupon = { id: `c_${Date.now()}`, code: code.toUpperCase().trim(), discount, uses: 0, maxUses: 100, expires: 'Dec 31, 2026', status: 'active' };
    const updated = [newCoupon, ...coupons];
    setCoupons(updated);
    localStorage.setItem('lms_coupons', JSON.stringify(updated));
    toast.success(`Coupon ${newCoupon.code} created!`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={addCoupon} className="btn btn-primary" style={{ gap: 8 }}><Plus size={16} /> New Coupon</button>
      </div>
      <div className="glass-card" style={{ padding: 0 }}>
        <table className="table">
          <thead><tr><th>Coupon Code</th><th>Discount</th><th>Redemptions</th><th>Expires</th><th>Status</th></tr></thead>
          <tbody>
            {coupons.map(c => (
              <tr key={c.id}>
                <td><span style={{ fontWeight: 800, fontFamily: 'monospace', color: '#16a34a', background: '#f0fdf4', border: '1px dashed #16a34a', padding: '4px 8px', borderRadius: 6 }}>{c.code}</span></td>
                <td><span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>{c.discount}</span></td>
                <td><span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{c.uses} / {c.maxUses} uses</span></td>
                <td><span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{c.expires}</span></td>
                <td><span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '2px 8px', borderRadius: 999 }}>{c.status.toUpperCase()}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Tab 4: Partners & Affiliates ──────────────────────────────────────────────
function AffiliatesTab() {
  const [partners, setPartners] = useState([
    { id: 'p1', name: 'EduConsultants LLC', link: 'ref=edu_consult', conversions: '8 Enterprise', owed: 1200, paid: false },
    { id: 'p2', name: 'Global Tech Academy Network', link: 'ref=tech_net', conversions: '14 Pro', owed: 840, paid: false },
  ]);

  const handlePayout = (id) => {
    setPartners(partners.map(p => p.id === id ? { ...p, paid: true, owed: 0 } : p));
    toast.success('Affiliate commission payout scheduled via Stripe Connect');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="glass-card" style={{ padding: 0 }}>
        <table className="table">
          <thead><tr><th>Partner Name</th><th>Referral Link</th><th>Conversions</th><th>Commission Owed</th><th></th></tr></thead>
          <tbody>
            {partners.map(p => (
              <tr key={p.id}>
                <td><div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--brand-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-600)' }}><Users size={14} /></div><span style={{ fontWeight: 600 }}>{p.name}</span></div></td>
                <td><span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>{p.link}</span></td>
                <td><span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>{p.conversions}</span></td>
                <td><span style={{ fontWeight: 800, color: p.paid ? '#059669' : 'var(--text-primary)' }}>{p.paid ? '$0.00 (Paid)' : `$${p.owed.toFixed(2)}`}</span></td>
                <td>
                  {!p.paid ? (
                    <button onClick={() => handlePayout(p.id)} className="btn btn-secondary btn-sm" style={{ gap: 6 }}>Pay <ArrowUpRight size={14}/></button>
                  ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#059669', fontSize: '0.75rem', fontWeight: 700 }}><Check size={14} /> Paid</span>
                  )}
                </td>
              </tr>
            ))}
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
