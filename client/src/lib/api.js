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
};

// --- Tenants ---
export const tenantsAPI = {
  list: () => api.get('/api/tenants'),
  create: (data) => api.post('/api/tenants', data),
  get: (id) => api.get(`/api/tenants/${id}`),
  update: (id, data) => api.put(`/api/tenants/${id}`, data),
  deactivate: (id) => api.delete(`/api/tenants/${id}`),
};

// --- Courses ---
export const coursesAPI = {
  list: () => api.get('/api/courses'),
  get: (id) => api.get(`/api/courses/${id}`),
  create: (data) => api.post('/api/courses', data),
  publish: (id) => api.patch(`/api/courses/${id}/publish`),
  uploadMaterial: (courseId, file) => {
    const form = new FormData();
    form.append('file', file);
    return api.post(`/api/courses/${courseId}/materials/upload`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// --- AI Tutor ---
export const aiTutorAPI = {
  ask: (courseId, message) => api.post('/api/ai-tutor/ask', { course_id: courseId, message }),
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
};

// --- Proctoring ---
export const proctoringAPI = {
  getReport: (examId) => api.get(`/api/proctoring/reports/${examId}`),
};

export default api;
