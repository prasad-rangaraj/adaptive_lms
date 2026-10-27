import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../../services/api.service';
import { Bell, X, CheckCircle, Zap, Crown, Star, ChevronRight, Package } from 'lucide-react';

const PLAN_COLORS = {
  basic:      { color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb', icon: Star },
  pro:        { color: '#059669', bg: '#ecfdf5', border: '#6ee7b7', icon: Zap },
  enterprise: { color: '#7c3aed', bg: '#f5f3ff', border: '#c4b5fd', icon: Crown },
};

// ─── Full Plan Details Modal ──────────────────────────────────────────────────
export function PlanModal({ notification, onClose, onRead }) {
  const plans = notification?.plan_config?.plans || [];
  const version = notification?.plan_config?.version;
  const publishedAt = notification?.plan_config?.published_at;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
          backdropFilter: 'blur(4px)', zIndex: 200
        }}
      />
      {/* Modal */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 'min(96vw, 860px)', maxHeight: '90vh',
        background: 'var(--surface-0)',
        borderRadius: 20, border: '1px solid var(--glass-border)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.2)',
        zIndex: 210, display: 'flex', flexDirection: 'column', overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem 2rem', borderBottom: '1px solid var(--glass-border)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Package size={18} color="rgba(255,255,255,0.9)" />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.75)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Platform Update · v{version}
              </span>
            </div>
            <h2 style={{ fontSize: '1.375rem', fontWeight: 900, color: 'white' }}>
              New Subscription Plans Published
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>
              Published {publishedAt ? new Date(publishedAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              border: 'none', background: 'rgba(255,255,255,0.15)', borderRadius: 10,
              width: 34, height: 34, display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer', color: 'white', flexShrink: 0
            }}
          >
            <X size={17} />
          </button>
        </div>

        {/* Plan Cards */}
        <div style={{ padding: '2rem', overflowY: 'auto', flex: 1 }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            Your platform administrator has updated the subscription plans. Review the latest pricing and features below.
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${Math.min(plans.length, 3)}, 1fr)`,
            gap: '1rem'
          }}>
            {plans.map((plan) => {
              const meta = PLAN_COLORS[plan.id] || PLAN_COLORS.basic;
              const Icon = meta.icon;
              return (
                <div
                  key={plan.id}
                  style={{
                    borderRadius: 16, border: `2px solid ${plan.popular ? meta.color : meta.border}`,
                    overflow: 'hidden', position: 'relative',
                    boxShadow: plan.popular ? `0 8px 24px ${meta.color}25` : 'none'
                  }}
                >
                  {plan.popular && (
                    <div style={{
                      background: meta.color, color: 'white',
                      textAlign: 'center', padding: '4px',
                      fontSize: '0.6875rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase'
                    }}>
                      ⭐ Most Popular
                    </div>
                  )}
                  {/* Plan header */}
                  <div style={{
                    padding: '1.5rem 1.25rem 1.25rem',
                    background: meta.bg, borderBottom: `1px solid ${meta.border}`,
                    textAlign: 'center'
                  }}>
                    <div style={{
                      width: 44, height: 44, margin: '0 auto 0.875rem',
                      borderRadius: 12, background: 'white', border: `1px solid ${meta.border}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                    }}>
                      <Icon size={22} color={meta.color} />
                    </div>
                    <p style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 8 }}>
                      {plan.name}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 3 }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)', paddingBottom: 3 }}>$</span>
                      <span style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>
                        {plan.price}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', paddingBottom: 3 }}>/mo</span>
                    </div>
                  </div>
                  {/* Features */}
                  <div style={{ padding: '1.125rem 1.25rem' }}>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                      {(plan.features || []).map((feat, idx) => (
                        <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                          <CheckCircle size={14} color={meta.color} style={{ flexShrink: 0, marginTop: 2 }} />
                          <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{feat}</span>
                        </li>
                      ))}
                    </ul>
                    {plan.limits && (
                      <div style={{
                        marginTop: '1rem', paddingTop: '0.875rem',
                        borderTop: `1px solid ${meta.border}`,
                        display: 'flex', flexDirection: 'column', gap: 4
                      }}>
                        <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                          Quotas
                        </p>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                          💾 Storage: <strong>{plan.limits.storage} GB</strong>
                        </p>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                          🤖 AI Credits: <strong>{plan.limits.ai_credits >= 999999 ? 'Unlimited' : plan.limits.ai_credits.toLocaleString()}/mo</strong>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '1.25rem 2rem', borderTop: '1px solid var(--glass-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--surface-1)'
        }}>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Contact support if you have billing questions.
          </p>
          <button
            onClick={() => { onRead(); onClose(); }}
            className="btn btn-primary"
            style={{ gap: 7 }}
          >
            <CheckCircle size={15} /> Got it
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Notification Bell (main export) ─────────────────────────────────────────
export default function PlanNotificationBell() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState(null);

  const { data: notifications = [] } = useQuery({
    queryKey: ['plan-notifications'],
    queryFn: () => adminAPI.getPlanNotifications().then(r => r.data),
    refetchInterval: 60_000, // poll every minute
  });

  const markRead = useMutation({
    mutationFn: (id) => adminAPI.markPlanNotificationRead(id),
    onSuccess: () => qc.invalidateQueries(['plan-notifications']),
  });

  const unread = notifications.filter(n => !n.is_read);

  const handleOpen = (notif) => {
    setSelectedNotif(notif);
    setOpen(false);
    // Mark as read immediately on open
    if (!notif.is_read) {
      markRead.mutate(notif.id);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'relative', border: 'none', background: 'var(--surface-1)',
          borderRadius: 10, width: 38, height: 38,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: 'var(--text-secondary)',
          border: '1px solid var(--glass-border)',
          transition: 'all 0.15s'
        }}
        title="Plan Notifications"
      >
        <Bell size={17} />
        {unread.length > 0 && (
          <span style={{
            position: 'absolute', top: -4, right: -4,
            width: 18, height: 18, borderRadius: '50%',
            background: '#ef4444', border: '2px solid var(--surface-0)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.6rem', fontWeight: 900, color: 'white'
          }}>
            {unread.length > 9 ? '9+' : unread.length}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 90 }} />
          <div style={{
            position: 'absolute', top: 'calc(100% + 10px)', right: 0,
            width: 340, borderRadius: 16,
            background: 'var(--surface-0)', border: '1px solid var(--glass-border)',
            boxShadow: '0 16px 48px rgba(0,0,0,0.14)', zIndex: 100,
            overflow: 'hidden'
          }}>
            {/* Dropdown header */}
            <div style={{
              padding: '1rem 1.25rem', borderBottom: '1px solid var(--glass-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Package size={16} color="var(--brand-600, #4f46e5)" />
                <p style={{ fontWeight: 800, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                  Plan Updates
                </p>
              </div>
              {unread.length > 0 && (
                <span style={{
                  fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: 999,
                  background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca'
                }}>
                  {unread.length} new
                </span>
              )}
            </div>

            {/* Notification list */}
            <div style={{ maxHeight: 320, overflowY: 'auto' }}>
              {notifications.length === 0 ? (
                <div style={{ padding: '2.5rem', textAlign: 'center' }}>
                  <Bell size={28} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem', opacity: 0.3 }} />
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                    No plan updates yet
                  </p>
                </div>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => handleOpen(n)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                      padding: '0.875rem 1.25rem', border: 'none', cursor: 'pointer',
                      borderBottom: '1px solid var(--glass-border)',
                      background: n.is_read ? 'transparent' : 'rgba(99,102,241,0.04)',
                      textAlign: 'left', transition: 'background 0.1s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-1)'}
                    onMouseLeave={e => e.currentTarget.style.background = n.is_read ? 'transparent' : 'rgba(99,102,241,0.04)'}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                      background: n.is_read ? 'var(--surface-2)' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <Package size={16} color={n.is_read ? 'var(--text-muted)' : 'white'} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                        <p style={{
                          fontWeight: n.is_read ? 600 : 800,
                          fontSize: '0.875rem',
                          color: n.is_read ? 'var(--text-secondary)' : 'var(--text-primary)',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                        }}>
                          Plans v{n.plan_config.version} Published
                        </p>
                        {!n.is_read && (
                          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#6366f1', flexShrink: 0 }} />
                        )}
                      </div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        {new Date(n.created_at).toLocaleString('en-GB', {
                          day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <ChevronRight size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* Plan detail modal */}
      {selectedNotif && (
        <PlanModal
          notification={selectedNotif}
          onClose={() => setSelectedNotif(null)}
          onRead={() => {
            if (!selectedNotif.is_read) markRead.mutate(selectedNotif.id);
          }}
        />
      )}
    </div>
  );
}

