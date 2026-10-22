import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally — log user out
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// Auth
// ─────────────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (email, password) =>
    api.post('/api/auth/login', new URLSearchParams({ username: email, password }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }),
  register: (data) => api.post('/api/auth/register', data),
  registerOrg: (data) => api.post('/api/auth/register-org', data),
  me: () => api.get('/api/auth/me'),
  impersonate: (userId) => api.post(`/api/auth/impersonate/${userId}`),
};

// ─────────────────────────────────────────────────────────────────────────────
// Super Admin API  (global, cross-tenant)
// ─────────────────────────────────────────────────────────────────────────────
export const adminAPI = {
  // Users
  listUsers: (tenantId) => api.get(`/api/tenants/${tenantId}/users`),
  createUser: (tenantId, data) => api.post(`/api/tenants/${tenantId}/users`, data),
  listGlobalUsers: () => api.get('/api/admin/users/global'),
  suspendUser: (userId) => api.post(`/api/admin/users/${userId}/suspend`),

  // Courses
  listGlobalCourses: () => api.get('/api/admin/courses/global'),

  // Audit & Logs
  listAuditLogs: () => api.get('/api/admin/audit-logs'),

  // Billing & Stats
  getBillingStats: () => api.get('/api/admin/billing'),
  getDashboardStats: () => api.get('/api/admin/stats'),

  // System
  getSystemHealth: () => api.get('/api/admin/health'),

  // Support
  getSupportTickets: () => api.get('/api/admin/tickets'),
  replyToTicket: (ticketId, message) => api.post(`/api/admin/tickets/${ticketId}/reply`, { message }),
  updateTicketStatus: (ticketId, status) => api.patch(`/api/admin/tickets/${ticketId}/status`, { status }),

  // Broadcasts / Communication
  listBroadcasts: () => api.get('/api/admin/broadcasts'),
  sendBroadcast: (data) => api.post('/api/admin/broadcasts', data),
};

// ─────────────────────────────────────────────────────────────────────────────
// Tenants  (org-level, scoped to one tenant)
// ─────────────────────────────────────────────────────────────────────────────
export const tenantsAPI = {
  // CRUD
  list: () => api.get('/api/tenants'),
  create: (data) => api.post('/api/tenants', data),
  get: (id) => api.get(`/api/tenants/${id}`),
  update: (id, data) => api.put(`/api/tenants/${id}`, data),
  deactivate: (id) => api.delete(`/api/tenants/${id}`),

  // Dashboard
  getDashboardNarrative: (id) => api.get(`/api/tenants/${id}/dashboard-narrative`),
  getCohortsPulse: (id) => api.get(`/api/tenants/${id}/cohorts-pulse`),
  getAnalytics: (id) => api.get(`/api/tenants/${id}/analytics`),
  getReports: (id) => api.get(`/api/tenants/${id}/reports`),

  // Users / Directory
  listUsers: (id) => api.get(`/api/tenants/${id}/users`),
  getMembers: (id) => api.get(`/api/tenants/${id}/users`),   // alias – OrgDirectoryHub
  createUser: (id, data) => api.post(`/api/tenants/${id}/users`, data),
  deactivateUser: (tenantId, userId) => api.patch(`/api/tenants/${tenantId}/users/${userId}/deactivate`),

  // Courses / Content
  getCourses: (id) => api.get(`/api/tenants/${id}/courses`),
  getCourseHub: (id) => api.get(`/api/tenants/${id}/course-hub`),
  toggleCoursePublish: (tenantId, courseId) => api.patch(`/api/tenants/${tenantId}/courses/${courseId}/toggle-publish`),


  // Audit / Security
  getAuditLogs: (id) => api.get(`/api/tenants/${id}/audit-logs`),

  // Communication / Broadcasts
  getBroadcasts: (id) => api.get(`/api/tenants/${id}/broadcasts`),
  sendBroadcast: (id, data) => api.post(`/api/tenants/${id}/broadcasts`, data),
  getAnnouncements: (id) => api.get(`/api/tenants/${id}/broadcasts`), // alias

  // Export
  exportData: (id) => api.get(`/api/tenants/${id}/export`),

  // Integrations & Webhooks
  getIntegrations: (tenantId) => api.get(`/api/tenants/${tenantId}/integrations`),
  updateIntegrations: (tenantId, payload) => api.put(`/api/tenants/${tenantId}/integrations`, payload),
  testIntegration: (tenantId, payload) => api.post(`/api/tenants/${tenantId}/integrations/test`, payload),

  // API Keys
  getApiKeys: (tenantId) => api.get(`/api/tenants/${tenantId}/api-keys`),
  createApiKey: (tenantId, payload) => api.post(`/api/tenants/${tenantId}/api-keys`, payload),
  deleteApiKey: (tenantId, keyId) => api.delete(`/api/tenants/${tenantId}/api-keys/${keyId}`),
};

export const orgAIAPI = {
  getSettings: (tenantId) => api.get(`/api/tenants/${tenantId}/ai-settings`),
  updateSettings: (tenantId, data) => api.patch(`/api/tenants/${tenantId}/ai-settings`, data),
};

// ─────────────────────────────────────────────────────────────────────────────
// Courses
// ─────────────────────────────────────────────────────────────────────────────
export const coursesAPI = {
  list: () => api.get('/api/courses'),
  getRecommendedPaths: () => api.get('/api/courses/recommended-paths'),
  myCourses: () => api.get('/api/courses/my'),
  getEnrolledCourses: () => api.get('/api/courses/enrolled'),
  get: (id) => api.get(`/api/courses/${id}`),
  getTranscript: (courseId, materialId) => api.get(`/api/courses/${courseId}/materials/${materialId}/transcript`),
  create: (data) => api.post('/api/courses', data),
  publish: (id) => api.patch(`/api/courses/${id}/publish`),
  addMaterial: (courseId, moduleId, data) => api.post(`/api/courses/${courseId}/modules/${moduleId}/materials`, data),
  uploadMaterial: (courseId, moduleId, file) => {
    const form = new FormData();
    form.append('file', file);
    return api.post(`/api/courses/${courseId}/modules/${moduleId}/materials/upload`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getModules: (courseId) => api.get(`/api/courses/${courseId}/modules`),
  createModule: (courseId, title, level = "fundamentals") => api.post(`/api/courses/${courseId}/modules`, { title, level }),
  updateCourse: (courseId, data) => api.patch(`/api/courses/${courseId}`, data),
  updateModule: (courseId, moduleId, data) => api.patch(`/api/courses/${courseId}/modules/${moduleId}`, data),
  deleteModule: (courseId, moduleId) => api.delete(`/api/courses/${courseId}/modules/${moduleId}`),
  updateMaterial: (courseId, materialId, data) => api.patch(`/api/courses/${courseId}/materials/${materialId}`, data),
  reorderMaterials: (courseId, moduleId, data) => api.patch(`/api/courses/${courseId}/modules/${moduleId}/reorder`, data),
  getAssignments: (courseId) => api.get(`/api/courses/${courseId}/assignments`),
  createAssignment: (courseId, data) => api.post(`/api/courses/${courseId}/assignments`, data),
  askCopilot: (courseId, prompt) => api.post(`/api/courses/${courseId}/copilot`, { prompt }),

  // ── Adaptive Enrollment Flow ──────────────────────────────────────────────
  enroll: (courseId) => api.post(`/api/courses/${courseId}/enroll`),
  getEnrollmentStatus: (courseId) => api.get(`/api/courses/${courseId}/enrollment-status`),
  submitPlacementResult: (courseId, score, overrideToBasics = false) =>
    api.post(`/api/courses/${courseId}/placement-result`, { score, override_to_basics: overrideToBasics }),
  submitLevelTestResult: (courseId, { level, score, passed }) =>
    api.post(`/api/courses/${courseId}/level-test-result`, { level, score, passed }),
  getStudents: (courseId) => api.get(`/api/courses/${courseId}/students`),
  getCourseDetail: (courseId) => api.get(`/api/courses/${courseId}/course-detail`),
};

// ─────────────────────────────────────────────────────────────────────────────
// AI Tutor
// ─────────────────────────────────────────────────────────────────────────────
export const aiTutorAPI = {
  getHistory: () => api.get('/api/ai-tutor/history'),
  ask: (courseId, message, persona = 'tutor') =>
    api.post('/api/ai-tutor/ask', { course_id: courseId, message, persona }),
  generateQuiz: (courseId, topic, difficulty, numQuestions) =>
    api.post('/api/ai-tutor/generate-quiz', null, {
      params: { course_id: courseId, topic, difficulty, num_questions: numQuestions },
    }),
  generateFlashcards: (topic, numCards) =>
    api.post('/api/ai-tutor/generate-flashcards', null, {
      params: { topic, num_cards: numCards },
    }),
};

// ─────────────────────────────────────────────────────────────────────────────
// Assignments
// ─────────────────────────────────────────────────────────────────────────────
export const assignmentsAPI = {
  submit: (assignmentId, file) => {
    const form = new FormData();
    form.append('file', file);
    return api.post(`/api/assignments/${assignmentId}/submit`, form);
  },
  getResult: (assignmentId, submissionId) =>
    api.get(`/api/assignments/${assignmentId}/submissions/${submissionId}`),
  getSubmissions: (assignmentId) => api.get(`/api/assignments/${assignmentId}/submissions`),
  gradeSubmission: (assignmentId, submissionId, data) =>
    api.patch(`/api/assignments/${assignmentId}/submissions/${submissionId}/grade`, data),
};

// ─────────────────────────────────────────────────────────────────────────────
// Proctoring
// ─────────────────────────────────────────────────────────────────────────────
export const proctoringAPI = {
  getReport: (examId) => api.get(`/api/proctoring/reports/${examId}`),
  getRecentFlags: () => api.get(`/api/proctoring/flags/recent`),
  logViolation: (data) => api.post('/api/proctoring/violations', data),
};

// ─────────────────────────────────────────────────────────────────────────────
// Live Classes & Meetings
// ─────────────────────────────────────────────────────────────────────────────
export const liveAPI = {
  createSession: (data) => api.post('/api/live/sessions', data),
  listSessions: (status) => api.get('/api/live/sessions', { params: status ? { status } : {} }),
  getSession: (id) => api.get(`/api/live/sessions/${id}`),
  deleteSession: (id) => api.delete(`/api/live/sessions/${id}`),
  startSession: (id) => api.post(`/api/live/sessions/${id}/start`),
  joinSession: (id) => api.post(`/api/live/sessions/${id}/join`),
  endSession: (id) => api.post(`/api/live/sessions/${id}/end`),
  getParticipants: (id) => api.get(`/api/live/sessions/${id}/participants`),
  createOrGetRoom: (roomName, shadow = false) => api.post(`/api/live/rooms?room_name=${roomName}&shadow=${shadow}`),
  shadowSession: (id) => api.post(`/api/live/sessions/${id}/shadow`),
};

// ─────────────────────────────────────────────────────────────────────────────
// Cognitive Analytics
// ─────────────────────────────────────────────────────────────────────────────
export const cognitiveAPI = {
  getProfile: () => api.get('/api/cognitive/me'),
  evaluate: (performanceData) => api.post('/api/cognitive/evaluate', performanceData),
  getDailyTrivia: () => api.get('/api/cognitive/daily-trivia'),
};

// ─────────────────────────────────────────────────────────────────────────────
// Academic
// ─────────────────────────────────────────────────────────────────────────────
export const academicAPI = {
  getDepartments: () => api.get('/api/academic/departments'),
  getCohorts: (deptId) => api.get(`/api/academic/departments/${deptId}/cohorts`),
  getDeptTeachers: (deptId) => api.get(`/api/academic/departments/${deptId}/teachers`),
  getTeachers: () => api.get('/api/academic/teachers'),
  createTimetable: (data) => api.post('/api/academic/timetable', data),
  getTimetable: () => api.get('/api/academic/timetable'),
  getAttendance: () => api.get('/api/academic/attendance'),
  getLeaveRequests: () => api.get('/api/academic/leave-requests'),
  submitLeaveRequest: (data) => api.post('/api/academic/leave-requests', data),
  
  // Exams & Assessments
  createExam: (data) => api.post('/api/academic/exams', data),
  getPublishedExam: () => api.get('/api/academic/exams/published'),
  submitExam: (examId, data) => api.post(`/api/academic/exams/${examId}/submit`, data),
  getExamById: (examId) => api.get(`/api/academic/exams/${examId}`),

  // Weekly Assessments
  createWeeklyExam: (data) => api.post('/api/academic/exams/weekly', data),
  getTeacherWeeklyExams: () => api.get('/api/academic/exams/teacher/weekly'),
  getWeeklyExamRoster: (examId) => api.get(`/api/academic/exams/weekly/${examId}/roster`),
  getStudentWeeklyExams: () => api.get('/api/academic/exams/student/weekly'),
  getCourseWeeklyExams: (courseId) => api.get(`/api/academic/exams/course/${courseId}/weekly`),
  getAdminWeeklyMonitor: () => api.get('/api/academic/exams/admin/weekly-monitor'),
  getAssignments: () => api.get('/api/academic/assignments'),
  getPYQs: () => api.get('/api/academic/pyqs'),
  getMarks: () => api.get('/api/academic/marks'),
  getTeacherAttendance: () => api.get('/api/academic/teacher/attendance'),
  updateTeacherAttendance: (payload) => api.post('/api/academic/teacher/attendance', payload),
  getTeacherLeaveRequests: () => api.get('/api/academic/teacher/leave-requests'),
  updateLeaveRequest: (id, payload) => api.put(`/api/academic/teacher/leave-requests/${id}`, payload),
  getTeacherQuestions: () => api.get('/api/academic/teacher/questions'),
  saveTeacherQuestions: (payload) => api.post('/api/academic/teacher/questions', payload),
  uploadMarks: (payload) => api.post('/api/academic/teacher/marks', payload),
  uploadResource: (payload) => api.post('/api/academic/teacher/resources', payload),
  getAdminAttendance: () => api.get('/api/academic/admin/attendance'),
  getAdminLeaveRequests: () => api.get('/api/academic/admin/leave-requests'),
  getAdminLiveExams: () => api.get('/api/academic/admin/exams/live'),
  getAdminGradingAudit: (params) => api.get('/api/academic/admin/grading-audit', { params }),
};

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────────────────────────────────────────
export const dashboardAPI = {
  getSummary: () => api.get('/api/dashboard/summary'),
  getStudyBuddies: () => api.get('/api/dashboard/study-buddies'),
  getTeacherSummary: () => api.get('/api/dashboard/teacher-summary'),
  getTeacherStudents: () => api.get('/api/dashboard/teacher-students'),
};

// ─────────────────────────────────────────────────────────────────────────────
// Career
// ─────────────────────────────────────────────────────────────────────────────
export const careerAPI = {
  getSkills: () => api.get('/api/career/skills'),
  getJobs: () => api.get('/api/career/jobs'),
  getApplications: () => api.get('/api/career/applications'),
  getCertificates: () => api.get('/api/career/certificates'),
};

// ─────────────────────────────────────────────────────────────────────────────
// Community
// ─────────────────────────────────────────────────────────────────────────────
export const communityAPI = {
  getBounties: () => api.get('/api/community/bounties'),
  getLeaderboard: () => api.get('/api/community/leaderboard'),
  getSynapseMatches: () => api.get('/api/community/synapse-matches'),
  getEvents: () => api.get('/api/community/events'),
  getTeamRequests: () => api.get('/api/community/team-requests'),
  getClubs: () => api.get('/api/community/clubs'),
  getAlumni: () => api.get('/api/community/alumni'),
  getTeacherInbox: () => api.get('/api/community/teacher/inbox'),
  getTeacherOfficeHours: () => api.get('/api/community/teacher/office-hours'),
  getTeacherBounties: () => api.get('/api/community/teacher/bounties'),
  getTeacherMentees: () => api.get('/api/community/teacher/mentees'),
  acceptMentorship: (id) => api.put(`/api/community/teacher/mentees/${id}/accept`),
  
  sendMessage: (data) => api.post('/api/community/messages', data),
  getMessageRecipients: () => api.get('/api/community/message-recipients'),
  getChatMessages: () => api.get('/api/community/chat/messages'),
  bookOfficeHour: (data) => api.post('/api/community/office-hours/book', data),
  requestMentorship: (data) => api.post('/api/community/mentorships/request', data),
  createBounty: (data) => api.post('/api/community/bounties', data),
  endorseBounty: (bountyId) => api.post(`/api/community/bounties/${bountyId}/endorse`)
};

export default api;
