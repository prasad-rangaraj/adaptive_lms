import { useEffect, useState, useRef } from 'react';
import { Shield, AlertTriangle, Eye, Users, Wifi } from 'lucide-react';
import { TeacherMonitorWebSocket } from '../../lib/websocket';
import { useAuthStore } from '../../store/authStore';

const EXAM_ID = 1; // In production, get from route params

const violationColors = {
  tab_switch: '#f59e0b',
  no_face: '#ef4444',
  multiple_faces: '#dc2626',
  phone_detected: '#dc2626',
  clipboard_use: '#f97316',
  eye_off_screen: '#f59e0b',
  screen_resize: '#94a3b8',
  background_noise: '#8b5cf6',
};

export default function ProctoringReportsPage() {
  const { token } = useAuthStore();
  const wsRef = useRef(null);
  const [liveAlerts, setLiveAlerts] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    wsRef.current = new TeacherMonitorWebSocket(EXAM_ID, token, (alert) => {
      setLiveAlerts((prev) => [{ ...alert, timestamp: new Date().toLocaleTimeString() }, ...prev.slice(0, 49)]);
    });
    wsRef.current.connect();
    setConnected(true);
    return () => wsRef.current?.disconnect();
  }, [token]);

  const getRiskColor = (score) => score > 60 ? '#ef4444' : score > 30 ? '#f59e0b' : '#10b981';

  // Group alerts by student
  const studentMap = {};
  liveAlerts.forEach((a) => {
    if (!studentMap[a.student_id]) studentMap[a.student_id] = { violations: [], maxRisk: 0 };
    studentMap[a.student_id].violations.push(a);
    studentMap[a.student_id].maxRisk = Math.max(studentMap[a.student_id].maxRisk, a.risk_score || 0);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Shield size={24} style={{ color: '#ef4444' }} /> Live Proctoring Monitor</h1>
          <p className="text-slate-400 text-sm mt-1">Real-time exam integrity dashboard — Exam #{EXAM_ID}</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: connected ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', border: `1px solid ${connected ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
          <Wifi size={14} style={{ color: connected ? '#10b981' : '#ef4444' }} />
          <span className="text-xs font-medium" style={{ color: connected ? '#34d399' : '#f87171' }}>{connected ? 'Live Connected' : 'Disconnected'}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2"><Users size={16} style={{ color: '#6366f1' }} /><p className="text-xs text-slate-400">Active Students</p></div>
          <p className="text-2xl font-bold text-white">{Object.keys(studentMap).length}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2"><AlertTriangle size={16} style={{ color: '#f59e0b' }} /><p className="text-xs text-slate-400">Total Violations</p></div>
          <p className="text-2xl font-bold text-white">{liveAlerts.length}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2"><Eye size={16} style={{ color: '#ef4444' }} /><p className="text-xs text-slate-400">High Risk Students</p></div>
          <p className="text-2xl font-bold" style={{ color: '#ef4444' }}>{Object.values(studentMap).filter(s => s.maxRisk > 60).length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Violations Feed */}
        <div className="glass-card p-5">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            Live Violation Feed
          </h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {liveAlerts.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-8">No violations detected yet.<br />Waiting for student events...</p>
            ) : liveAlerts.map((alert, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${(violationColors[alert.violation_type] || '#64748b')}22` }}>
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: violationColors[alert.violation_type] || '#64748b' }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white">Student #{alert.student_id}</p>
                  <p className="text-xs text-slate-400">{alert.violation_type?.replace(/_/g, ' ')}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold" style={{ color: getRiskColor(alert.risk_score) }}>{alert.risk_score?.toFixed(0)}%</p>
                  <p className="text-xs text-slate-500">{alert.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Student Risk Summary */}
        <div className="glass-card p-5">
          <h2 className="font-semibold text-white mb-4">Student Risk Summary</h2>
          <div className="space-y-3">
            {Object.entries(studentMap).map(([studentId, data]) => (
              <div key={studentId} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <div className="flex justify-between mb-2">
                  <p className="text-sm text-white">Student #{studentId}</p>
                  <span className="text-xs font-bold" style={{ color: getRiskColor(data.maxRisk) }}>{data.maxRisk.toFixed(0)}% Risk</span>
                </div>
                <div className="h-1.5 rounded-full mb-1" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <div className="h-1.5 rounded-full" style={{ width: `${data.maxRisk}%`, background: getRiskColor(data.maxRisk) }} />
                </div>
                <p className="text-xs text-slate-500">{data.violations.length} violations</p>
              </div>
            ))}
            {Object.keys(studentMap).length === 0 && (
              <p className="text-slate-500 text-sm text-center py-8">No students connected yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
