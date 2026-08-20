import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tenantsAPI } from '../../services/api.service';
import { useAuthStore } from '../../store/authStore';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
import { 
  GraduationCap, Users, BookOpen, Award, TrendingUp, Activity, 
  FileSpreadsheet, Download, Plus, Table2, BarChart3, ScrollText
} from 'lucide-react';
import Loader from '../../components/ui/Loader';

// ── Shared chart tooltip ────────────────────────────────────────────────────
const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--surface-1)', border: '1px solid var(--glass-border)', borderRadius: 12,
      padding: '10px 14px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
    }}>
      <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: 6 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ fontSize: '0.875rem', color: p.color || 'var(--brand-500)', fontWeight: 700 }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

// ── Inline Metric (No Box) ─────────────────────────────────────────────────
function InlineMetric({ label, value, Icon, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={20} color={color} />
      </div>
      <div>
        <p style={{ fontSize: '1.625rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-0.03em' }}>{value}</p>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 4, fontWeight: 500 }}>{label}</p>
      </div>
    </div>
  );
}

// ── Analytics Tab ─────────────────────────────────────────────────────────────
function AnalyticsTab({ tenantId }) {
  const { data, isLoading } = useQuery({
    queryKey: ['tenant-analytics', tenantId],
    queryFn: () => tenantsAPI.getAnalytics(tenantId).then(r => r.data),
    enabled: !!tenantId,
  });

  if (isLoading) return <Loader text="Crunching analytics..." />;

  const ov = data?.overview || {};
  const topCourses = data?.top_courses || [];
  const growth = data?.member_growth || [];

  return (
    <div style={{ background: 'var(--surface-1)', borderRadius: 24, border: '1px solid var(--glass-border)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
      {/* Top Strip: Metrics (No boxes) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2.5rem', borderBottom: '1px solid var(--surface-3)' }}>
        <InlineMetric label="Total Students" value={ov.students ?? 0} Icon={GraduationCap} color="#0e7490" />
        <InlineMetric label="Active Teachers" value={ov.teachers ?? 0} Icon={Users} color="#059669" />
        <InlineMetric label="Published Content" value={ov.published_courses ?? 0} Icon={BookOpen} color="#d97706" />
        <InlineMetric label="Total Enrollments" value={ov.total_enrollments ?? 0} Icon={TrendingUp} color="#7c3aed" />
      </div>

      {/* Middle Section: Charts Canvas */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px' }}>
        {/* Main Chart */}
        <div style={{ padding: '2.5rem', borderRight: '1px solid var(--surface-3)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={18} color="var(--brand-500)" />
            Organization Growth
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>Cumulative students and teachers over the last 6 months.</p>
          
          <div style={{ height: 280 }}>
            {growth.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 12 }}>
                <Users size={28} color="var(--surface-4)" />
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No member data yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="10%" stopColor="var(--brand-500)" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="var(--brand-500)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-2)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)', fontFamily: 'var(--font-body)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)', fontFamily: 'var(--font-body)' }} axisLine={false} tickLine={false} />
                  <RechartsTooltip content={<ChartTip />} />
                  <Area
                    type="monotone" dataKey="members" name="Members"
                    stroke="var(--brand-500)" strokeWidth={3}
                    fill="url(#growthFill)" dot={{ r: 4, fill: 'var(--brand-500)', strokeWidth: 0 }}
                    activeDot={{ r: 7, fill: 'var(--brand-600)', strokeWidth: 0, stroke: 'white', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Side Panel: Top Courses */}
        <div style={{ padding: '2.5rem', background: 'var(--surface-0)' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Top Content
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {topCourses.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No course data yet.</p>
            ) : (
              topCourses.map((c, i) => {
                const max = topCourses[0]?.enrollments || 1;
                const pct = Math.round((c.enrollments / max) * 100);
                const colors = ['#0e7490', '#0891b2', '#06b6d4', '#22d3ee'];
                const color = colors[i % colors.length];
                return (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</p>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 800, color }}>{c.enrollments}</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 999, background: 'var(--surface-2)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 999 }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Reports Tab ───────────────────────────────────────────────────────────────
const DUMMY_REPORTS = [
  { id: 1, name: 'Q3 Student Performance', type: 'CSV Export', frequency: 'Weekly', last_run: 'Oct 10, 2026' },
  { id: 2, name: 'Active Teachers List', type: 'PDF Summary', frequency: 'Monthly', last_run: 'Oct 1, 2026' },
];

function ReportsTab() {
  return (
    <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'flex-start' }}>
      <div style={{ flex: 1, background: 'var(--surface-1)', borderRadius: 24, border: '1px solid var(--glass-border)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
        <div style={{ padding: '2rem 2.5rem 1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Custom Reports Builder</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginTop: 4 }}>Generate and schedule custom tabular reports for compliance.</p>
            </div>
            <button className="btn btn-primary" style={{ gap: 8, height: 44, padding: '0 1.25rem', borderRadius: 12 }}>
              <Plus size={16} /> Create Report
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {DUMMY_REPORTS.map((r, i) => (
            <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '2.5fr 1.5fr 1.5fr auto', gap: '1.5rem', alignItems: 'center', padding: '1.5rem 2.5rem', borderBottom: i === DUMMY_REPORTS.length -1 ? 'none' : '1px solid var(--surface-2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileSpreadsheet size={20} color="var(--text-secondary)" />
                </div>
                <div>
                  <p style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1rem' }}>{r.name}</p>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 4 }}>{r.type}</p>
                </div>
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Schedule</p>
                <p style={{ fontWeight: 800, fontSize: '0.9375rem', color: 'var(--text-primary)', marginTop: 4 }}>{r.frequency}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Last Run</p>
                <p style={{ fontWeight: 800, fontSize: '0.9375rem', color: 'var(--text-primary)', marginTop: 4 }}>{r.last_run}</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-secondary btn-sm" style={{ padding: '0.5rem 1rem', borderRadius: 8, fontWeight: 700, gap: 6 }}>
                  <Download size={14} /> Download
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ width: 340, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ background: 'var(--surface-1)', borderRadius: 24, padding: '2rem', border: '1px solid var(--glass-border)' }}>
          <h3 style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.5rem' }}>
            <Table2 size={14} color="var(--brand-500)" /> Data Export API
          </h3>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
            Looking for real-time data instead of static exports? Connect your BI tool directly to our GraphQL endpoint.
          </p>
          <button className="btn btn-secondary" style={{ width: '100%', gap: 8 }}>
             View Documentation
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Data Hub ─────────────────────────────────────────────────────────────
export default function OrgDataHub() {
  const { user } = useAuthStore();
  const tenantId = user?.tenant_id;
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' | 'reports'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-600)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Data Intelligence</p>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>Data Hub</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginTop: 8 }}>
            Real-time performance data and custom scheduled exports.
          </p>
        </div>
        <div style={{ display: 'flex', background: 'var(--surface-1)', padding: 6, borderRadius: 16, border: '1px solid var(--glass-border)' }}>
          <button 
            onClick={() => setActiveTab('analytics')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: 8, padding: '0.625rem 1.25rem', borderRadius: 12, border: 'none', cursor: 'pointer',
              fontWeight: 700, fontSize: '0.875rem', transition: 'all 0.2s',
              background: activeTab === 'analytics' ? 'white' : 'transparent',
              color: activeTab === 'analytics' ? 'var(--brand-600)' : 'var(--text-muted)',
              boxShadow: activeTab === 'analytics' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none'
            }}>
            <BarChart3 size={16} /> Visual Analytics
          </button>
          <button 
            onClick={() => setActiveTab('reports')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: 8, padding: '0.625rem 1.25rem', borderRadius: 12, border: 'none', cursor: 'pointer',
              fontWeight: 700, fontSize: '0.875rem', transition: 'all 0.2s',
              background: activeTab === 'reports' ? 'white' : 'transparent',
              color: activeTab === 'reports' ? 'var(--brand-600)' : 'var(--text-muted)',
              boxShadow: activeTab === 'reports' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none'
            }}>
            <ScrollText size={16} /> Scheduled Reports
          </button>
        </div>
      </div>

      {activeTab === 'analytics' ? <AnalyticsTab tenantId={tenantId} /> : <ReportsTab />}
    </div>
  );
}
