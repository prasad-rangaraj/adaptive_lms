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
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

// --- Auth ---
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

// --- Admin (user management) ---
export const adminAPI = {
  listUsers: (tenantId) => api.get(`/api/tenants/${tenantId}/users`),
  createUser: (tenantId, data) => api.post(`/api/tenants/${tenantId}/users`, data),
  listGlobalUsers: () => api.get('/api/admin/users/global'),
  listGlobalCourses: () => api.get('/api/admin/courses/global'),
  listAuditLogs: () => api.get('/api/admin/audit-logs'),
  getBillingStats: () => api.get('/api/admin/billing'),
  getDashboardStats: () => api.get('/api/admin/stats'),
  getSystemHealth: () => api.get('/api/admin/health'),
  getSupportTickets: () => api.get('/api/admin/tickets'),
  suspendUser: (userId) => api.post(`/api/admin/users/${userId}/suspend`),
};

// --- Tenants ---
export const tenantsAPI = {
  list: () => api.get('/api/tenants'),
  create: (data) => api.post('/api/tenants', data),
  get: (id) => api.get(`/api/tenants/${id}`),
  update: (id, data) => api.put(`/api/tenants/${id}`, data),
  deactivate: (id) => api.delete(`/api/tenants/${id}`),
  getDashboardNarrative: (id) => api.get(`/api/tenants/${id}/dashboard-narrative`),
  getCohortsPulse: (id) => api.get(`/api/tenants/${id}/cohorts-pulse`),
  getAnalytics: (id) => api.get(`/api/tenants/${id}/analytics`),
  getCourses: (id) => api.get(`/api/tenants/${id}/courses`),
  toggleCoursePublish: (tenantId, courseId) => api.patch(`/api/tenants/${tenantId}/courses/${courseId}/toggle-publish`),
  getAuditLogs: (id) => api.get(`/api/tenants/${id}/audit-logs`),
  listUsers: (id) => api.get(`/api/tenants/${id}/users`),
  createUser: (id, data) => api.post(`/api/tenants/${id}/users`, data),
  deactivateUser: (tenantId, userId) => api.patch(`/api/tenants/${tenantId}/users/${userId}/deactivate`),
};

// --- Courses ---
export const coursesAPI = {
  list: () => api.get('/api/courses'),
  myCourses: () => api.get('/api/courses/my'),
  getEnrolledCourses: () => api.get('/api/courses/enrolled'),
  get: (id) => api.get(`/api/courses/${id}`),
  create: (data) => api.post('/api/courses', data),
  publish: (id) => api.patch(`/api/courses/${id}/publish`),
  uploadMaterial: (courseId, moduleId, file) => {
    const form = new FormData();
    form.append('file', file);
    return api.post(`/api/courses/${courseId}/modules/${moduleId}/materials/upload`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getModules: (courseId) => api.get(`/api/courses/${courseId}/modules`),
  createModule: (courseId, title) => api.post(`/api/courses/${courseId}/modules`, { title }),
  getAssignments: (courseId) => api.get(`/api/courses/${courseId}/assignments`),
  createAssignment: (courseId, data) => api.post(`/api/courses/${courseId}/assignments`, data),
};

// --- AI Tutor ---
export const aiTutorAPI = {
  ask: (courseId, message, persona = 'tutor') => api.post('/api/ai-tutor/ask', { course_id: courseId, message, persona }),
  generateQuiz: (courseId, topic, difficulty, numQuestions) =>
    api.post('/api/ai-tutor/generate-quiz', null, {
      params: { course_id: courseId, topic, difficulty, num_questions: numQuestions },
    }),
  generateFlashcards: (topic, numCards) =>
    api.post('/api/ai-tutor/generate-flashcards', null, {
      params: { topic, num_cards: numCards },
    }),
};

// --- Assignments ---
export const assignmentsAPI = {
  submit: (assignmentId, file) => {
    const form = new FormData();
    form.append('file', file);
    return api.post(`/api/assignments/${assignmentId}/submit`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getResult: (assignmentId, submissionId) =>
    api.get(`/api/assignments/${assignmentId}/submissions/${submissionId}`),
  getSubmissions: (assignmentId) => api.get(`/api/assignments/${assignmentId}/submissions`),
  gradeSubmission: (assignmentId, submissionId, data) => api.patch(`/api/assignments/${assignmentId}/submissions/${submissionId}/grade`, data),
};

// --- Proctoring ---
export const proctoringAPI = {
  getReport: (examId) => api.get(`/api/proctoring/reports/${examId}`),
};

// --- Live Classes & Meetings ---
export const liveAPI = {
  // Session CRUD
  createSession: (data) => api.post('/api/live/sessions', data),
  listSessions: (status) => api.get('/api/live/sessions', { params: status ? { status } : {} }),
  getSession: (id) => api.get(`/api/live/sessions/${id}`),
  deleteSession: (id) => api.delete(`/api/live/sessions/${id}`),

  // Session Lifecycle
  startSession: (id) => api.post(`/api/live/sessions/${id}/start`),
  joinSession: (id) => api.post(`/api/live/sessions/${id}/join`),
  endSession: (id) => api.post(`/api/live/sessions/${id}/end`),

  // Participants
  getParticipants: (id) => api.get(`/api/live/sessions/${id}/participants`),

  // Legacy: ad-hoc room for office hours / MeetingArena
  createOrGetRoom: (roomName) => api.post(`/api/live/rooms?room_name=${roomName}`),
};

// --- Cognitive Analytics ---
export const cognitiveAPI = {
  getProfile: () => api.get('/api/cognitive/me'),
  evaluate: (performanceData) => api.post('/api/cognitive/evaluate', performanceData),
};

export default api;
