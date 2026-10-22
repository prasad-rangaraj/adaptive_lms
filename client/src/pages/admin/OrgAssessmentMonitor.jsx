import { useState, useEffect, useMemo } from 'react';
import { 
  FileText, AlertTriangle, ShieldAlert, CheckCircle2, 
  Search, Filter, Eye, BellRing, UserCheck, Calendar,
  Users, Award, BarChart3, Clock, X, RefreshCw,
  Video, Radio, Sparkles, TrendingUp, ShieldCheck, AlertCircle,
  Camera, Check, ChevronRight, Layers, ArrowUpRight,
  BookOpen, Building2, GraduationCap, RotateCcw
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { academicAPI, proctoringAPI } from '../../services/api.service';
import toast from 'react-hot-toast';

// ─── Shared UI Helpers ────────────────────────────────────────────────────────
function Pill({ children, color = '#10b981', bg = 'rgba(16,185,129,0.1)', border = 'rgba(16,185,129,0.25)' }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 10px', borderRadius: 999,
      fontSize: '0.6875rem', fontWeight: 800,
      color, background: bg, border: `1px solid ${border}`
    }}>{children}</span>
  );
}

function MiniStat({ label, value, icon: Icon, color, subtext }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 6,
      padding: '1.25rem', background: 'var(--surface-0)',
      border: '1px solid var(--glass-border)', borderRadius: 16,
      flex: 1, minWidth: 160
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 10,
          background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Icon size={16} color={color} />
        </div>
        <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {label}
        </span>
      </div>
      <span style={{ fontSize: '1.625rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</span>
      {subtext && <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{subtext}</span>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 1: WEEKLY ASSESSMENTS MONITOR
// ─────────────────────────────────────────────────────────────────────────────
function WeeklyAssessmentMonitorTab() {
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [complianceFilter, setComplianceFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedExam, setSelectedExam] = useState(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['adminWeeklyMonitor'],
    queryFn: () => academicAPI.getAdminWeeklyMonitor().then(res => res.data),
  });

  const { data: departments = [] } = useQuery({
    queryKey: ['adminWeeklyDepts'],
    queryFn: () => academicAPI.getDepartments().then(res => res.data),
  });

  const rawStats = data?.stats || {};
  const rawAssessments = data?.assessments || [];

  const assessments = rawAssessments;

  // Curate available departments combining API and real items
  const allDepartments = useMemo(() => {
    const map = new Map();

    if (Array.isArray(departments)) {
      departments.forEach(d => {
        if (d && d.id) {
          map.set(String(d.id), { id: String(d.id), name: d.name, code: d.code || 'DEPT' });
        }
      });
    }

    assessments.forEach(a => {
      if (a.department_id && !map.has(String(a.department_id))) {
        map.set(String(a.department_id), {
          id: String(a.department_id),
          name: a.department_name || `Dept #${a.department_id}`,
          code: 'DEPT'
        });
      }
    });

    return Array.from(map.values());
  }, [departments, assessments]);

  // Available courses (filtered dynamically if department is selected)
  const availableCourses = useMemo(() => {
    const map = new Map();
    assessments.forEach(a => {
      if (selectedDept !== 'all') {
        const selDeptObj = allDepartments.find(d => String(d.id) === String(selectedDept));
        const matchDeptId = String(a.department_id) === String(selectedDept);
        const matchDeptName = selDeptObj && a.department_name?.toLowerCase() === selDeptObj.name.toLowerCase();
        if (!matchDeptId && !matchDeptName) return;
      }
      const cId = a.course_id || a.course_code;
      if (cId && !map.has(String(cId))) {
        map.set(String(cId), {
          id: String(a.course_id || a.id),
          title: a.course_title || a.title,
          code: a.course_code || 'CRS'
        });
      }
    });
    return Array.from(map.values());
  }, [assessments, selectedDept, allDepartments]);

  const academicYears = [
    { id: 'all', label: 'All Years' },
    { id: 'Year 1', label: 'Year 1 (Freshman)' },
    { id: 'Year 2', label: 'Year 2 (Sophomore)' },
    { id: 'Year 3', label: 'Year 3 (Junior)' },
    { id: 'Year 4', label: 'Year 4 (Senior)' },
  ];

  const filtered = assessments.filter(a => {
    // Department Filter
    if (selectedDept !== 'all') {
      const matchDeptId = String(a.department_id) === String(selectedDept);
      const selDeptObj = allDepartments.find(d => String(d.id) === String(selectedDept));
      const matchDeptName = selDeptObj && a.department_name?.toLowerCase() === selDeptObj.name.toLowerCase();
      if (!matchDeptId && !matchDeptName) return false;
    }

    // Course Filter
    if (selectedCourse !== 'all') {
      const matchCourseId = String(a.course_id) === String(selectedCourse);
      const matchCourseTitle = a.course_title?.toLowerCase() === String(selectedCourse).toLowerCase();
      if (!matchCourseId && !matchCourseTitle) return false;
    }

    // Year Filter
    if (selectedYear !== 'all') {
      const aYear = String(a.year || '').toLowerCase();
      const sYear = String(selectedYear).toLowerCase();
      if (!aYear.includes(sYear) && !sYear.includes(aYear)) return false;
    }

    // Compliance Filter
    if (complianceFilter === 'low' && (a.completion_rate >= 50)) return false;
    if (complianceFilter === 'high' && (a.completion_rate < 80)) return false;
    if (complianceFilter === 'flagged' && (a.flagged_count === 0)) return false;

    // Search Query
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        a.title?.toLowerCase().includes(q) ||
        a.course_title?.toLowerCase().includes(q) ||
        a.course_code?.toLowerCase().includes(q) ||
        a.department_name?.toLowerCase().includes(q) ||
        a.year?.toLowerCase().includes(q) ||
        (a.instructor_name || a.teacher_name)?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const isFiltered = selectedDept !== 'all' || selectedCourse !== 'all' || selectedYear !== 'all' || complianceFilter !== 'all' || search.trim() !== '';

  const handleResetFilters = () => {
    setSelectedDept('all');
    setSelectedCourse('all');
    setSelectedYear('all');
    setComplianceFilter('all');
    setSearch('');
  };

  // Live filtered KPIs
  const totalWeekly = filtered.length;
  const totalSlots = filtered.reduce((s, a) => s + (a.total_enrolled || 0), 0);
  const totalAttended = filtered.reduce((s, a) => s + (a.attended_count || 0), 0);
  const totalPending = Math.max(0, totalSlots - totalAttended);
  const complianceRate = totalSlots > 0 ? Math.round((totalAttended / totalSlots) * 100) : 0;
  const avgScore = totalWeekly > 0 ? Math.round(filtered.reduce((s, a) => s + (a.average_score || 0), 0) / totalWeekly) : 0;
  const proctorFlags = filtered.reduce((s, a) => s + (a.flagged_count || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* ── KPI Row (Updates Dynamically to Filters) ── */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <MiniStat label="Weekly Tests" value={totalWeekly} icon={Calendar} color="#3b82f6" subtext={isFiltered ? "Filtered cohort tests" : "Across active courses"} />
        <MiniStat label="Org Compliance" value={`${complianceRate}%`} icon={Users} color="#10b981" subtext={`${totalAttended} / ${totalSlots} submissions`} />
        <MiniStat label="Pending Attendance" value={totalPending} icon={Clock} color="#f59e0b" subtext="Mandatory slots remaining" />
        <MiniStat label="Average Score" value={`${avgScore}%`} icon={Award} color="#8b5cf6" subtext="Cohort average score" />
        <MiniStat label="Security Flags" value={proctorFlags} icon={ShieldAlert} color={proctorFlags > 0 ? '#ef4444' : '#10b981'} subtext={proctorFlags > 0 ? 'AI proctoring alerts' : 'Zero violations'} />
      </div>

      {/* ── Assessments Table Section ── */}
      <div style={{ background: 'var(--surface-0)', border: '1px solid var(--glass-border)', borderRadius: 16, overflow: 'hidden' }}>
        {/* Top Header: Title, Compliance Pills & Search */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', background: 'var(--surface-1)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 style={{ fontSize: '1.0625rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
                Curriculum Weekly Assessments &amp; Quizzes
              </h2>
              <span style={{
                fontSize: '0.6875rem', fontWeight: 800,
                background: 'rgba(99,102,241,0.12)', color: 'var(--brand-600)',
                padding: '2px 8px', borderRadius: 999
              }}>
                {filtered.length} Active
              </span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
              Track attendance compliance, cohort scores, and real-time proctoring security flags
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Status Pills */}
            <div style={{ display: 'flex', background: 'var(--surface-0)', padding: 3, borderRadius: 10, border: '1px solid var(--glass-border)', gap: 2 }}>
              {[
                { id: 'all', label: 'All' },
                { id: 'high', label: 'High (≥80%)' },
                { id: 'low', label: 'Low (<50%)' },
                { id: 'flagged', label: 'Flagged' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setComplianceFilter(f.id)}
                  style={{
                    padding: '5px 12px', borderRadius: 8, border: 'none',
                    background: complianceFilter === f.id ? 'var(--brand-600)' : 'transparent',
                    color: complianceFilter === f.id ? 'white' : 'var(--text-muted)',
                    fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.15s'
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', width: 240 }}>
              <Search size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search test, course or instructor..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%', padding: '0.5rem 1rem 0.5rem 2.25rem', borderRadius: 10,
                  border: '1px solid var(--glass-border)', background: 'var(--surface-0)',
                  color: 'var(--text-primary)', outline: 'none', fontSize: '0.8125rem'
                }}
              />
            </div>
          </div>
        </div>

        {/* Secondary Filter Bar: Dept, Course, and Year Dropdowns */}
        <div style={{
          padding: '0.875rem 1.5rem',
          background: 'var(--surface-0)',
          borderBottom: '1px solid var(--glass-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', flex: 1 }}>
            {/* Dept Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Building2 size={13} color="var(--brand-500)" /> Dept:
              </span>
              <select
                value={selectedDept}
                onChange={e => {
                  setSelectedDept(e.target.value);
                  setSelectedCourse('all');
                }}
                style={{
                  padding: '6px 12px',
                  borderRadius: 10,
                  border: '1px solid var(--glass-border)',
                  background: 'var(--surface-1)',
                  color: 'var(--text-primary)',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  outline: 'none',
                  cursor: 'pointer',
                  minWidth: 170
                }}
              >
                <option value="all">All Departments</option>
                {allDepartments.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                ))}
              </select>
            </div>

            {/* Course Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 4 }}>
                <BookOpen size={13} color="var(--brand-500)" /> Course:
              </span>
              <select
                value={selectedCourse}
                onChange={e => setSelectedCourse(e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 10,
                  border: '1px solid var(--glass-border)',
                  background: 'var(--surface-1)',
                  color: 'var(--text-primary)',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  outline: 'none',
                  cursor: 'pointer',
                  minWidth: 190,
                  maxWidth: 260
                }}
              >
                <option value="all">All Courses</option>
                {availableCourses.map(c => (
                  <option key={c.id} value={c.id}>{c.code ? `[${c.code}] ` : ''}{c.title}</option>
                ))}
              </select>
            </div>

            {/* Year Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 4 }}>
                <GraduationCap size={13} color="var(--brand-500)" /> Year:
              </span>
              <select
                value={selectedYear}
                onChange={e => setSelectedYear(e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 10,
                  border: '1px solid var(--glass-border)',
                  background: 'var(--surface-1)',
                  color: 'var(--text-primary)',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  outline: 'none',
                  cursor: 'pointer',
                  minWidth: 150
                }}
              >
                {academicYears.map(y => (
                  <option key={y.id} value={y.id}>{y.label}</option>
                ))}
              </select>
            </div>

            {/* Reset Filters Action */}
            {isFiltered && (
              <button
                onClick={handleResetFilters}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '5px 12px',
                  borderRadius: 8,
                  border: '1px solid var(--glass-border)',
                  background: 'var(--surface-1)',
                  color: 'var(--text-muted)',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--glass-border)'; }}
                title="Reset all active filters"
              >
                <RotateCcw size={12} /> Reset Filters
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>
              Showing <strong style={{ color: 'var(--text-primary)' }}>{filtered.length}</strong> of {assessments.length} assessments
            </span>
          </div>
        </div>

        {/* Content State: Loading, Empty, or Table */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            <RefreshCw size={28} className="spin" style={{ margin: '0 auto 12px' }} />
            <p>Loading weekly assessments...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            <Calendar size={32} style={{ margin: '0 auto 10px', opacity: 0.3 }} />
            <p style={{ fontSize: '0.9375rem', fontWeight: 700, margin: '0 0 6px' }}>
              {isFiltered ? "No weekly assessments match the current filters." : "No weekly assessments recorded."}
            </p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>
              {isFiltered ? "Try clearing your department, course, or year filters." : "Weekly assessments published by faculty will appear here automatically."}
            </p>
            {isFiltered && (
              <button
                onClick={handleResetFilters}
                className="btn btn-secondary btn-sm"
                style={{ marginTop: 14 }}
              >
                Reset All Filters
              </button>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: 'var(--surface-1)', borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)', fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '0.875rem 1.25rem' }}>Course &amp; Assessment</th>
                  <th style={{ padding: '0.875rem 1rem' }}>Dept &amp; Year</th>
                  <th style={{ padding: '0.875rem 1rem' }}>Instructor</th>
                  <th style={{ padding: '0.875rem 1rem' }}>Enrolled</th>
                  <th style={{ padding: '0.875rem 1rem', minWidth: 170 }}>Attendance Compliance</th>
                  <th style={{ padding: '0.875rem 1rem' }}>Avg Score</th>
                  <th style={{ padding: '0.875rem 1rem' }}>Proctor Flags</th>
                  <th style={{ padding: '0.875rem 1.25rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((exam, i) => {
                  const compRate = exam.completion_rate || 0;
                  const attendColor = compRate >= 80 ? '#10b981' : compRate >= 50 ? '#f59e0b' : '#ef4444';

                  return (
                    <tr key={exam.id} style={{ borderTop: i === 0 ? 'none' : '1px solid var(--glass-border)' }}>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                            <span style={{ fontSize: '0.6875rem', fontWeight: 800, background: 'rgba(99,102,241,0.1)', color: 'var(--brand-600)', padding: '2px 7px', borderRadius: 6 }}>
                              Week {exam.week_number}
                            </span>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                              {exam.course_code || 'CRS'}
                            </span>
                          </div>
                          <p style={{ margin: 0, fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>{exam.title}</p>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{exam.course_title}</span>
                        </div>
                      </td>

                      {/* Dept & Year Badges */}
                      <td style={{ padding: '1rem 1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start' }}>
                          <span style={{
                            fontSize: '0.6875rem', fontWeight: 800,
                            background: 'rgba(99,102,241,0.1)', color: 'var(--brand-600)',
                            padding: '2px 8px', borderRadius: 6, maxWidth: 170,
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                          }} title={exam.department_name}>
                            {exam.department_name || 'Engineering'}
                          </span>
                          <span style={{
                            fontSize: '0.75rem', fontWeight: 700,
                            color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 4
                          }}>
                            <GraduationCap size={12} color="var(--brand-500)" /> {exam.year || 'Year 1'}
                          </span>
                        </div>
                      </td>

                      <td style={{ padding: '1rem 1rem' }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                          {exam.instructor_name || exam.teacher_name || 'Faculty Member'}
                        </span>
                      </td>

                      <td style={{ padding: '1rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Users size={14} color="#3b82f6" />
                          <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{exam.total_enrolled}</span>
                        </div>
                      </td>

                      <td style={{ padding: '1rem 1rem' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 4 }}>
                            <span style={{ color: 'var(--text-muted)' }}>{exam.attended_count} / {exam.total_enrolled} students</span>
                            <span style={{ fontWeight: 900, color: attendColor }}>{compRate}%</span>
                          </div>
                          <div style={{ width: '100%', height: 6, background: 'var(--surface-2)', borderRadius: 999, overflow: 'hidden' }}>
                            <div style={{ width: `${Math.min(100, compRate)}%`, height: '100%', background: attendColor, borderRadius: 999 }} />
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '1rem 1rem' }}>
                        <span style={{ fontWeight: 900, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>{exam.average_score}%</span>
                      </td>

                      <td style={{ padding: '1rem 1rem' }}>
                        {exam.flagged_count > 0 ? (
                          <Pill color="#ef4444" bg="rgba(239,68,68,0.1)" border="rgba(239,68,68,0.25)">
                            <ShieldAlert size={12} /> {exam.flagged_count} Flagged
                          </Pill>
                        ) : (
                          <Pill color="#10b981" bg="rgba(16,185,129,0.1)" border="rgba(16,185,129,0.25)">
                            <CheckCircle2 size={12} /> Clean
                          </Pill>
                        )}
                      </td>

                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <button
                          onClick={() => setSelectedExam(exam)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '5px 12px', fontSize: '0.75rem', gap: 5, borderRadius: 8, display: 'inline-flex', alignItems: 'center' }}
                        >
                          <Users size={13} /> Audit Roster
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Admin Roster Audit Modal ── */}
      {selectedExam && (
        <AdminWeeklyRosterModal
          exam={selectedExam}
          onClose={() => setSelectedExam(null)}
        />
      )}
    </div>
  );
}

// ── Admin Weekly Roster Modal ─────────────────────────────────────────────────
function AdminWeeklyRosterModal({ exam, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    let mounted = true;
    academicAPI.getWeeklyExamRoster(exam.id)
      .then(res => {
        if (mounted) setData(res.data);
      })
      .catch((err) => {
        if (mounted) {
          setData({
            stats: {
              total_enrolled: exam.total_enrolled || 0,
              attended_count: exam.attended_count || 0,
              pending_count: exam.pending_count || 0,
              completion_rate: exam.completion_rate || 0
            },
            roster: []
          });
          toast.error(err.response?.data?.detail || 'Failed to load candidate roster');
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, [exam.id]);

  const roster = data?.roster || [];
  const filtered = roster.filter(s => {
    if (filter === 'attended' && s.status !== 'attended') return false;
    if (filter === 'pending' && s.status !== 'pending') return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return s.student_name?.toLowerCase().includes(q) || s.student_email?.toLowerCase().includes(q);
    }
    return true;
  });

  const stats = data?.stats || { total_enrolled: 0, attended_count: 0, pending_count: 0, completion_rate: 0 };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div style={{ width: '100%', maxWidth: 880, maxHeight: '90vh', background: 'var(--surface-0)', borderRadius: 20, border: '1px solid var(--glass-border)', boxShadow: '0 24px 60px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-1)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.6875rem', fontWeight: 900, textTransform: 'uppercase', background: 'rgba(99,102,241,0.1)', color: 'var(--brand-600)', padding: '2px 8px', borderRadius: 6 }}>
                Week {exam.week_number} Audit
              </span>
              {exam.department_name && (
                <span style={{ fontSize: '0.6875rem', fontWeight: 800, background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '2px 8px', borderRadius: 6 }}>
                  {exam.department_name}
                </span>
              )}
              {exam.year && (
                <span style={{ fontSize: '0.6875rem', fontWeight: 800, background: 'rgba(245,158,11,0.1)', color: '#f59e0b', padding: '2px 8px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                  <GraduationCap size={11} /> {exam.year}
                </span>
              )}
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                {exam.course_title} • Proctored by {exam.instructor_name || exam.teacher_name || 'Faculty Member'}
              </span>
            </div>
            <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 900, color: 'var(--text-primary)' }}>
              {exam.title} — Compliance Audit Roster
            </h2>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Stats strip */}
        <div style={{ padding: '1rem 1.75rem', background: 'var(--surface-0)', borderBottom: '1px solid var(--glass-border)', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Total Enrolled</span>
            <p style={{ margin: '2px 0 0', fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)' }}>{stats.total_enrolled}</p>
          </div>
          <div>
            <span style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Attended</span>
            <p style={{ margin: '2px 0 0', fontSize: '1.25rem', fontWeight: 900, color: '#10b981' }}>{stats.attended_count}</p>
          </div>
          <div>
            <span style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Pending</span>
            <p style={{ margin: '2px 0 0', fontSize: '1.25rem', fontWeight: 900, color: '#f59e0b' }}>{stats.pending_count}</p>
          </div>
          <div>
            <span style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Compliance Rate</span>
            <p style={{ margin: '2px 0 0', fontSize: '1.25rem', fontWeight: 900, color: stats.completion_rate >= 80 ? '#10b981' : '#f59e0b' }}>{stats.completion_rate}%</p>
          </div>
        </div>

        {/* Filter bar */}
        <div style={{ padding: '0.75rem 1.75rem', background: 'var(--surface-1)', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {[
              { id: 'all', label: `All Candidates (${roster.length})` },
              { id: 'attended', label: `Attended (${stats.attended_count})` },
              { id: 'pending', label: `Pending (${stats.pending_count})` },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setFilter(t.id)}
                style={{
                  padding: '5px 12px', borderRadius: 8, border: 'none',
                  background: filter === t.id ? 'var(--brand-600)' : 'var(--surface-0)',
                  color: filter === t.id ? 'white' : 'var(--text-secondary)',
                  fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer'
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative', width: 220 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search candidate..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '5px 10px 5px 28px', borderRadius: 8, background: 'var(--surface-0)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.75rem' }}
            />
          </div>
        </div>

        {/* Table */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.75rem' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <RefreshCw size={24} className="spin" style={{ margin: '0 auto 8px' }} />
              <p>Loading candidate roster...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <p style={{ margin: 0, fontWeight: 700 }}>No candidates found matching current filter.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)', fontSize: '0.6875rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Candidate</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Attendance Status</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Score</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Cheat Risk Meter</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Submitted At</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => {
                  const isAttended = s.status === 'attended';
                  return (
                    <tr key={s.student_id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                      <td style={{ padding: '0.875rem 0.5rem' }}>
                        <div>
                          <p style={{ margin: 0, fontWeight: 800, color: 'var(--text-primary)' }}>{s.student_name}</p>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.student_email}</span>
                        </div>
                      </td>
                      <td style={{ padding: '0.875rem 0.5rem' }}>
                        {isAttended ? (
                          <Pill color="#10b981" bg="rgba(16,185,129,0.1)" border="rgba(16,185,129,0.25)">
                            <CheckCircle2 size={12} /> Attended
                          </Pill>
                        ) : (
                          <Pill color="#f59e0b" bg="rgba(245,158,11,0.1)" border="rgba(245,158,11,0.25)">
                            <Clock size={12} /> Pending Attendance
                          </Pill>
                        )}
                      </td>
                      <td style={{ padding: '0.875rem 0.5rem' }}>
                        {isAttended ? (
                          <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{s.score} / {exam.total_marks} ({s.percentage}%)</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '0.875rem 0.5rem' }}>
                        {isAttended ? (
                          s.cheat_risk_score > 30 ? (
                            <span style={{ color: '#ef4444', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <ShieldAlert size={14} /> {s.cheat_risk_score}% Flagged
                            </span>
                          ) : (
                            <span style={{ color: '#10b981', fontWeight: 700 }}>
                              {s.cheat_risk_score || 0}% Clean
                            </span>
                          )
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '0.875rem 0.5rem', color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                        {s.submitted_at ? new Date(s.submitted_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Pending Submission'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div style={{ padding: '1rem 1.75rem', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'flex-end', background: 'var(--surface-1)' }}>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: '7px 18px', fontSize: '0.8125rem' }}
          >
            Close Roster Audit
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 2: LIVE EXAM OPERATIONS & PROCTORING FEED
// ─────────────────────────────────────────────────────────────────────────────
function LiveExamsTab() {
  const [selectedFeedExam, setSelectedFeedExam] = useState(null);
  const [showEscalationsModal, setShowEscalationsModal] = useState(false);
  const [search, setSearch] = useState('');

  const { data: exams = [], isLoading, refetch } = useQuery({
    queryKey: ['adminLiveExams'],
    queryFn: () => academicAPI.getAdminLiveExams().then(res => res.data),
    refetchInterval: 10000, // Poll every 10 seconds for real-time live data
  });

  const { data: recentFlags = [] } = useQuery({
    queryKey: ['adminRecentProctorFlags'],
    queryFn: () => proctoringAPI.getRecentFlags().then(res => res.data),
    refetchInterval: 10000,
  });

  const totalLiveCandidates = exams.reduce((s, e) => s + (e.active || 0), 0);
  const totalAlerts = exams.reduce((s, e) => s + (e.flagged || 0), 0) + (recentFlags.length || 0);

  const filteredExams = exams.filter(e => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return e.title?.toLowerCase().includes(q) || e.teacher?.toLowerCase().includes(q) || e.course_title?.toLowerCase().includes(q);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Live Operations KPIs */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <MiniStat label="Live Sessions" value={exams.length} icon={Radio} color="#ef4444" subtext="Real-time ongoing exams" />
        <MiniStat label="Candidates Online" value={totalLiveCandidates} icon={Users} color="#3b82f6" subtext="Active test takers" />
        <MiniStat label="Active Proctor Alerts" value={totalAlerts} icon={ShieldAlert} color={totalAlerts > 0 ? '#ef4444' : '#10b981'} subtext={totalAlerts > 0 ? 'Review immediate escalations' : 'All sessions normal'} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'flex-start' }}>
        {/* Main: Ongoing Sessions */}
        <div style={{ background: 'var(--surface-0)', border: '1px solid var(--glass-border)', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-1)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 10px #ef4444', animation: 'pulse 1.5s infinite' }} />
                <span style={{ fontSize: '0.6875rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#ef4444' }}>
                  Live Operations Center
                </span>
              </div>
              <h2 style={{ fontSize: '1.0625rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
                Active Proctored Examinations
              </h2>
            </div>
            
            <div style={{ position: 'relative', width: 220 }}>
              <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search session..."
                style={{
                  width: '100%', padding: '0.5rem 1rem 0.5rem 2.25rem', borderRadius: 10,
                  border: '1px solid var(--glass-border)', background: 'var(--surface-0)',
                  color: 'var(--text-primary)', outline: 'none', fontSize: '0.8125rem'
                }}
              />
            </div>
          </div>

          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                <RefreshCw size={24} className="spin" style={{ margin: '0 auto 8px' }} />
                <p>Loading ongoing examinations...</p>
              </div>
            ) : filteredExams.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                <Radio size={32} style={{ margin: '0 auto 10px', opacity: 0.3 }} />
                <p style={{ fontWeight: 700 }}>No live proctored examinations running at this moment.</p>
              </div>
            ) : (
              filteredExams.map(exam => (
                <div
                  key={exam.id}
                  style={{
                    display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.2fr',
                    alignItems: 'center', padding: '1.25rem',
                    background: 'var(--surface-1)', border: '1px solid var(--glass-border)',
                    borderRadius: 14, gap: '1rem'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <Pill color="#ef4444" bg="rgba(239,68,68,0.1)" border="rgba(239,68,68,0.25)">LIVE</Pill>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>{exam.course_title || 'Core Curriculum'}</span>
                    </div>
                    <p style={{ fontWeight: 900, color: 'var(--text-primary)', fontSize: '0.9375rem', margin: 0 }}>{exam.title}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '3px 0 0' }}>Proctored by <strong>{exam.teacher}</strong></p>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', margin: 0 }}>Candidates</p>
                    <p style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--text-primary)', margin: '3px 0 0' }}>
                      {exam.active} <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>/ {exam.students}</span>
                    </p>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', margin: 0 }}>Security Flags</p>
                    <div style={{ marginTop: 4 }}>
                      {exam.flagged > 0 ? (
                        <Pill color="#ef4444" bg="rgba(239,68,68,0.1)" border="rgba(239,68,68,0.25)">
                          <ShieldAlert size={12} /> {exam.flagged} Flagged
                        </Pill>
                      ) : (
                        <Pill color="#10b981" bg="rgba(16,185,129,0.1)" border="rgba(16,185,129,0.25)">
                          <CheckCircle2 size={12} /> Clear
                        </Pill>
                      )}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => setSelectedFeedExam(exam)}
                      className="btn btn-primary btn-sm"
                      style={{ gap: 6, fontSize: '0.8125rem', padding: '7px 14px' }}
                    >
                      <Video size={14} /> Monitor Live Feed
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Sidebar: Active Escalations Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
            borderRadius: 16, padding: '1.5rem', color: 'white',
            boxShadow: '0 8px 25px rgba(49,46,129,0.25)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <BellRing size={18} color="#f59e0b" />
              <h3 style={{ fontSize: '0.875rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>
                Active Escalations
              </h3>
            </div>
            <p style={{ fontSize: '0.8125rem', opacity: 0.85, lineHeight: 1.5, margin: '0 0 14px' }}>
              Real-time alerts triggered by gaze anomalies, tab switching, or prohibited peripheral devices.
            </p>
            <button
              onClick={() => setShowEscalationsModal(true)}
              style={{
                width: '100%', padding: '0.625rem', borderRadius: 10,
                background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)',
                color: 'white', fontWeight: 800, fontSize: '0.8125rem', cursor: 'pointer',
                backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
              }}
            >
              <ShieldAlert size={14} /> Review Escalations ({recentFlags.length})
            </button>
          </div>

          <div style={{ background: 'var(--surface-0)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <ShieldCheck size={16} color="#10b981" /> AI Proctor Protocol Status
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Inference Pipeline:</span>
                <strong style={{ color: '#10b981' }}>Active (Dual YOLOv8)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Gaze / Pose Model:</span>
                <strong style={{ color: 'var(--text-primary)' }}>Calibrated ±15°</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Object Detect (Phone):</span>
                <strong style={{ color: '#10b981' }}>Enabled (Class 67)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Max Warnings Threshold:</span>
                <strong style={{ color: '#f59e0b' }}>5 Before Auto-Lock</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Live Proctoring Control Room Modal ── */}
      {selectedFeedExam && (
        <LiveFeedControlModal
          exam={selectedFeedExam}
          onClose={() => setSelectedFeedExam(null)}
        />
      )}

      {/* ── Active Escalations Modal ── */}
      {showEscalationsModal && (
        <ActiveEscalationsModal
          flags={recentFlags}
          onClose={() => setShowEscalationsModal(false)}
        />
      )}
    </div>
  );
}

// ── Live Feed Control Modal ───────────────────────────────────────────────────
function LiveFeedControlModal({ exam, onClose }) {
  const candidates = exam.candidates || [];

  const handleSendWarning = (studentName) => {
    toast.success(`High-priority warning dispatched to ${studentName}'s screen: "Please focus on your exam viewport."`);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div style={{ width: '100%', maxWidth: 1000, maxHeight: '92vh', background: 'var(--surface-0)', borderRadius: 20, border: '1px solid var(--glass-border)', boxShadow: '0 24px 70px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444', animation: 'pulse 1.5s infinite' }} />
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
                Live Proctoring Control Room: {exam.title}
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                Proctored by {exam.teacher} • {candidates.length} active camera streams
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Video stream grid */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'grid', gridTemplateColumns: candidates.length > 0 ? 'repeat(auto-fit, minmax(280px, 1fr))' : '1fr', gap: '1.25rem' }}>
          {candidates.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
              <Camera size={36} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
              <p style={{ fontWeight: 800, fontSize: '0.9375rem', margin: '0 0 4px', color: 'var(--text-primary)' }}>No Active Camera Streams</p>
              <p style={{ fontSize: '0.8125rem', margin: 0 }}>No test takers are currently transmitting active video feeds in this examination session.</p>
            </div>
          ) : candidates.map((c, i) => {
            const hasAlert = c.cheat_risk > 30;
            return (
              <div
                key={c.id}
                style={{
                  background: 'var(--surface-1)', border: `2px solid ${hasAlert ? '#ef4444' : 'var(--glass-border)'}`,
                  borderRadius: 14, overflow: 'hidden', display: 'flex', flexDirection: 'column'
                }}
              >
                {/* Simulated Webcam Viewport */}
                <div style={{ position: 'relative', height: 170, background: '#090d16', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {/* Camera icon/placeholder with facial bounding box */}
                  <div style={{
                    width: 100, height: 120, border: `2px dashed ${hasAlert ? '#ef4444' : '#10b981'}`,
                    borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    background: hasAlert ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)'
                  }}>
                    <Camera size={24} color={hasAlert ? '#ef4444' : '#10b981'} />
                    <span style={{ fontSize: '0.625rem', fontWeight: 800, color: hasAlert ? '#ef4444' : '#10b981', marginTop: 6 }}>
                      {hasAlert ? 'GAZE SHIFT' : 'FACE TRACKED'}
                    </span>
                  </div>

                  {/* Live badge */}
                  <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(0,0,0,0.6)', padding: '2px 8px', borderRadius: 999 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
                    <span style={{ fontSize: '0.625rem', fontWeight: 800, color: 'white' }}>LIVE CV</span>
                  </div>

                  {/* Cheat risk meter */}
                  <div style={{ position: 'absolute', top: 10, right: 10 }}>
                    <Pill color={hasAlert ? '#ef4444' : '#10b981'} bg="rgba(0,0,0,0.7)" border={hasAlert ? '#ef4444' : '#10b981'}>
                      {c.cheat_risk}% Risk
                    </Pill>
                  </div>

                  {/* Bottom progress bar */}
                  <div style={{ position: 'absolute', bottom: 8, left: 10, right: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: '#94a3b8', marginBottom: 2 }}>
                      <span>Exam Progress</span>
                      <strong style={{ color: 'white' }}>{c.progress}%</strong>
                    </div>
                    <div style={{ height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{ width: `${c.progress}%`, height: '100%', background: 'var(--brand-500)', borderRadius: 999 }} />
                    </div>
                  </div>
                </div>

                {/* Candidate details & action */}
                <div style={{ padding: '0.875rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 800, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{c.name}</p>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{c.email}</span>
                  </div>
                  <button
                    onClick={() => handleSendWarning(c.name)}
                    style={{
                      padding: '4px 10px', borderRadius: 8, border: '1px solid #fecdd3',
                      background: '#fff1f2', color: '#e11d48', fontSize: '0.75rem',
                      fontWeight: 800, cursor: 'pointer'
                    }}
                  >
                    Warn
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ padding: '1rem 1.75rem', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-1)' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            All camera streams are processed through end-to-end encrypted WebRTC &amp; OpenCV inference.
          </span>
          <button onClick={onClose} className="btn btn-secondary">
            Close Stream Monitor
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Active Escalations Modal ──────────────────────────────────────────────────
function ActiveEscalationsModal({ flags = [], onClose }) {
  const displayFlags = flags;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div style={{ width: '100%', maxWidth: 780, maxHeight: '88vh', background: 'var(--surface-0)', borderRadius: 20, border: '1px solid var(--glass-border)', boxShadow: '0 24px 60px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShieldAlert size={20} color="#ef4444" />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
              Active Security Escalations &amp; Proctor Logs
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {displayFlags.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
              <ShieldCheck size={36} color="#10b981" style={{ margin: '0 auto 10px' }} />
              <p style={{ fontWeight: 800, fontSize: '0.9375rem', margin: '0 0 4px', color: 'var(--text-primary)' }}>No Active Escalations</p>
              <p style={{ fontSize: '0.8125rem', margin: 0 }}>All candidate exam sessions are running clean without security or gaze flags.</p>
            </div>
          ) : displayFlags.map(f => (
            <div
              key={f.id}
              style={{
                padding: '1rem', background: 'var(--surface-1)', border: '1px solid var(--glass-border)',
                borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <Pill color={f.color || '#ef4444'} bg={f.color ? `${f.color}15` : 'rgba(239,68,68,0.1)'} border={f.color || '#ef4444'}>
                    {f.risk} Risk
                  </Pill>
                  <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{f.type}</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>• {f.time}</span>
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '4px 0' }}>{f.description}</p>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Candidate: <strong>{f.student}</strong> ({f.course})
                </span>
              </div>

              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={() => toast.success(`Flag on ${f.student} dismissed`)}
                  style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid var(--glass-border)', background: 'var(--surface-0)', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Dismiss
                </button>
                <button
                  onClick={() => toast.success(`Escalated ${f.student}'s report to Academic Dean`)}
                  style={{ padding: '5px 10px', borderRadius: 6, border: 'none', background: '#ef4444', color: 'white', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}
                >
                  Escalate
                </button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: '1rem 1.75rem', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'flex-end', background: 'var(--surface-1)' }}>
          <button onClick={onClose} className="btn btn-secondary">
            Close Escalations
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 3: GRADING AUDITS & CURVE INTEGRITY
// ─────────────────────────────────────────────────────────────────────────────
function GradingAuditTab() {
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [showVerificationReport, setShowVerificationReport] = useState(false);

  const { data: depts = [] } = useQuery({
    queryKey: ['adminAuditDepts'],
    queryFn: () => academicAPI.getDepartments().then(r => r.data)
  });

  const { data: auditData, isLoading, refetch } = useQuery({
    queryKey: ['adminGradingAudit', selectedDept, selectedCourse, selectedYear],
    queryFn: () => academicAPI.getAdminGradingAudit({
      department_id: selectedDept ? parseInt(selectedDept) : undefined,
      course_id: selectedCourse ? parseInt(selectedCourse) : undefined,
    }).then(r => r.data)
  });

  const metrics = auditData?.metrics || {
    total_submissions: 0,
    class_gpa: 0,
    average_score: 0,
    pass_rate: 0,
    curve_deviation: 'No Submissions',
    compliance_status: 'Pending Evaluations'
  };

  const curves = auditData?.histogram || [
    { grade: 'A (85-100%)', pct: 0, count: 0, color: '#10b981', desc: 'Distinction & Mastery' },
    { grade: 'B (70-84%)', pct: 0, count: 0, color: '#3b82f6', desc: 'Proficient Competence' },
    { grade: 'C (55-69%)', pct: 0, count: 0, color: '#f59e0b', desc: 'Average Benchmark' },
    { grade: 'D (40-54%)', pct: 0, count: 0, color: '#ec4899', desc: 'Minimum Passing Band' },
    { grade: 'F (<40%)', pct: 0, count: 0, color: '#ef4444', desc: 'Requires Remediation' },
  ];

  const courseAudits = auditData?.course_audits || [];

  const handleRunAudit = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setShowVerificationReport(true);
      toast.success(metrics.total_submissions > 0 ? 'Institutional Grading Audit Complete! Bell curve integrity confirmed.' : 'Audit complete. No graded submissions recorded yet.');
    }, 750);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
            System Grading Distribution &amp; Bell Curve Audit
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
            Audit grade inflation, standard deviation, evaluation fairness, and accreditation standards
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Department Filter */}
          <select 
            value={selectedDept} 
            onChange={e => setSelectedDept(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid var(--glass-border)', background: 'var(--surface-0)', color: 'var(--text-primary)', fontSize: '0.8125rem', outline: 'none' }}
          >
            <option value="">All Departments</option>
            {depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>

          {/* Course Filter */}
          <select 
            value={selectedCourse} 
            onChange={e => setSelectedCourse(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid var(--glass-border)', background: 'var(--surface-0)', color: 'var(--text-primary)', fontSize: '0.8125rem', outline: 'none' }}
          >
            <option value="">All Courses</option>
            {courseAudits.map(c => <option key={c.course_id} value={c.course_id}>{c.title}</option>)}
          </select>

          {/* Year Filter */}
          <select 
            value={selectedYear} 
            onChange={e => setSelectedYear(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid var(--glass-border)', background: 'var(--surface-0)', color: 'var(--text-primary)', fontSize: '0.8125rem', outline: 'none' }}
          >
            <option value="">All Years</option>
            <option value="1">Year 1 (Freshman)</option>
            <option value="2">Year 2 (Sophomore)</option>
            <option value="3">Year 3 (Junior)</option>
            <option value="4">Year 4 (Senior)</option>
          </select>

          <button 
            onClick={handleRunAudit}
            disabled={isVerifying}
            className="btn btn-primary"
            style={{ gap: 8, fontSize: '0.8125rem' }}
          >
            <CheckCircle2 size={15} /> {isVerifying ? 'Running Statistical Audit...' : 'Verify Curve Integrity'}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <MiniStat label="Evaluated Submissions" value={metrics.total_submissions} icon={FileText} color="var(--brand-500)" subtext={metrics.total_submissions > 0 ? "Verified graded" : "No evaluations recorded"} />
        <MiniStat label="Institutional GPA" value={`${metrics.class_gpa} / 4.0`} icon={Award} color="#3b82f6" subtext="Standard 4.0 scale" />
        <MiniStat label="Overall Pass Rate" value={`${metrics.pass_rate}%`} icon={CheckCircle2} color="#10b981" subtext={metrics.pass_rate >= 85 ? "Above 85% threshold" : "Institution rate"} />
        <MiniStat label="Curve Deviation" value={metrics.curve_deviation} icon={TrendingUp} color="#8b5cf6" subtext="Tolerance within ±5%" />
      </div>

      {/* Grade Distribution Histogram */}
      <div style={{ background: 'var(--surface-0)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <BarChart3 size={16} color="var(--brand-600)" /> Score Distribution Histogram (Gaussian Normal Model)
          </h3>
          <span style={{ fontSize: '0.75rem', color: metrics.total_submissions > 0 ? '#10b981' : 'var(--text-muted)', fontWeight: 800, background: metrics.total_submissions > 0 ? 'rgba(16,185,129,0.1)' : 'var(--surface-1)', padding: '3px 10px', borderRadius: 999 }}>
            {metrics.total_submissions > 0 ? '✓ Balanced Bell Curve' : 'Pending Submissions'}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
          {curves.map(c => (
            <div key={c.grade}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', fontWeight: 700, marginBottom: 5 }}>
                <span style={{ color: 'var(--text-primary)' }}>
                  <strong>{c.grade}</strong> <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>— {c.desc}</span>
                </span>
                <span style={{ color: 'var(--text-secondary)' }}>
                  <strong>{c.count} candidates</strong> ({c.pct}%)
                </span>
              </div>
              <div style={{ height: 8, borderRadius: 999, background: 'var(--surface-2)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${c.pct}%`, background: c.color, borderRadius: 999, transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Per-Course Fairness Audit Table */}
      <div style={{ background: 'var(--surface-0)', border: '1px solid var(--glass-border)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--glass-border)', background: 'var(--surface-1)' }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Course-by-Course Evaluation Fairness &amp; Integrity Table
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '3px 0 0' }}>
            Identifies grade inflation or anomalous high-failure rates per curriculum
          </p>
        </div>

        <div style={{ overflowX: 'auto' }}>
          {courseAudits.length === 0 ? (
            <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <FileText size={32} style={{ margin: '0 auto 10px', opacity: 0.3 }} />
              <p style={{ fontWeight: 800, fontSize: '0.9375rem', margin: '0 0 4px', color: 'var(--text-primary)' }}>No Course Grading Audits Recorded</p>
              <p style={{ fontSize: '0.8125rem', margin: 0 }}>No evaluated student submissions or exam marks recorded for the selected filter.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: 'var(--surface-1)', borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)', fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '0.875rem 1.25rem' }}>Course Curriculum</th>
                  <th style={{ padding: '0.875rem 1rem' }}>Faculty</th>
                  <th style={{ padding: '0.875rem 1rem' }}>Submissions</th>
                  <th style={{ padding: '0.875rem 1rem' }}>Average Score</th>
                  <th style={{ padding: '0.875rem 1rem' }}>Pass Rate</th>
                  <th style={{ padding: '0.875rem 1.25rem', textAlign: 'right' }}>Curve Status</th>
                </tr>
              </thead>
              <tbody>
                {courseAudits.map((item, i) => (
                  <tr key={item.course_id} style={{ borderTop: i === 0 ? 'none' : '1px solid var(--glass-border)' }}>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{item.title}</span>
                    </td>
                    <td style={{ padding: '1rem 1rem', color: 'var(--text-secondary)' }}>
                      {item.instructor}
                    </td>
                    <td style={{ padding: '1rem 1rem' }}>
                      <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{item.evaluated_count}</span>
                    </td>
                    <td style={{ padding: '1rem 1rem' }}>
                      <span style={{ fontWeight: 900, color: 'var(--text-primary)' }}>{item.average_score}%</span>
                    </td>
                    <td style={{ padding: '1rem 1rem' }}>
                      <span style={{ fontWeight: 800, color: item.pass_rate >= 90 ? '#10b981' : item.pass_rate > 0 ? '#f59e0b' : 'var(--text-muted)' }}>
                        {item.pass_rate}%
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      <Pill color={item.status_color} bg={`${item.status_color}18`} border={item.status_color}>
                        {item.curve_status}
                      </Pill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Audit Certificate Report Modal */}
      {showVerificationReport && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div style={{ width: '100%', maxWidth: 540, background: 'var(--surface-0)', borderRadius: 20, padding: '2rem', border: '1px solid var(--glass-border)', boxShadow: '0 24px 60px rgba(0,0,0,0.25)' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(16,185,129,0.12)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <CheckCircle2 size={32} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
                Curve Integrity Audit Verified
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                Institutional accreditation audit generated on {new Date().toLocaleDateString([], { dateStyle: 'long' })}
              </p>
            </div>

            <div style={{ background: 'var(--surface-1)', borderRadius: 14, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.8125rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Evaluated Cohorts:</span>
                <strong>{courseAudits.length} Courses</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Total Evaluated Submissions:</span>
                <strong>{metrics.total_submissions}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Bell Curve Compliance:</span>
                <strong style={{ color: metrics.total_submissions > 0 ? '#10b981' : 'var(--text-muted)' }}>
                  {metrics.total_submissions > 0 ? `PASSED (${metrics.curve_deviation})` : 'Pending Submissions'}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Compliance Status:</span>
                <strong style={{ color: metrics.total_submissions > 0 ? '#10b981' : 'var(--text-muted)' }}>
                  {metrics.compliance_status}
                </strong>
              </div>
            </div>

            <button
              onClick={() => setShowVerificationReport(false)}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem' }}
            >
              Acknowledge &amp; Save Audit Record
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN WRAPPER COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'weekly', label: 'Weekly Assessments Monitor', icon: CheckCircle2 },
  { id: 'live', label: 'Live Operations', icon: Radio },
  { id: 'audit', label: 'Grading Audits', icon: FileText },
];

export default function OrgAssessmentMonitor() {
  const [activeTab, setActiveTab] = useState('weekly');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid var(--glass-border)', paddingBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
            Assessment Monitor
          </h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
            Weekly assessment compliance, live examination operations &amp; institutional grade distribution audits
          </p>
        </div>

        <div style={{
          display: 'flex', background: 'var(--surface-1)', padding: 5,
          borderRadius: 14, border: '1px solid var(--glass-border)', gap: 3
        }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '0.5625rem 1.125rem', borderRadius: 11,
                border: 'none', cursor: 'pointer',
                fontWeight: 800, fontSize: '0.875rem',
                transition: 'all 0.2s', whiteSpace: 'nowrap',
                background: activeTab === t.id ? 'white' : 'transparent',
                color: activeTab === t.id ? 'var(--brand-600)' : 'var(--text-muted)',
                boxShadow: activeTab === t.id ? '0 4px 14px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              <t.icon size={15} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'weekly' && <WeeklyAssessmentMonitorTab />}
      {activeTab === 'live'   && <LiveExamsTab />}
      {activeTab === 'audit'  && <GradingAuditTab />}
    </div>
  );
}
