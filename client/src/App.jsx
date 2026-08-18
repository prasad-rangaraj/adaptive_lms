import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';

// Layouts
import DashboardLayout from './components/layout/DashboardLayout';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Public
import LandingPage from './pages/LandingPage';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import AiTutorPage from './pages/student/AiTutorPage';
import CoursePlayerPage from './pages/student/CoursePlayerPage';
import ExamProctoringPage from './pages/student/ExamProctoringPage';
import CognitiveProfilePage from './pages/student/CognitiveProfilePage';

// Teacher Pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import CourseBuilderPage from './pages/teacher/CourseBuilderPage';
import ProctoringReportsPage from './pages/teacher/ProctoringReportsPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import SuperAdminDashboard from './pages/admin/SuperAdminDashboard';
import TenantManagementPage from './pages/admin/TenantManagementPage';
import TenantDetailsPage from './pages/admin/TenantDetailsPage';
import GlobalUsersPage from './pages/admin/GlobalUsersPage';
import GlobalCoursesPage from './pages/admin/GlobalCoursesPage';
import AuditLogsPage from './pages/admin/AuditLogsPage';
import BillingPage from './pages/admin/BillingPage';
import GlobalSettingsPage from './pages/admin/GlobalSettingsPage';
import ManageUsersPage from './pages/admin/ManageUsersPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 30000 },
  },
});

// Protected route wrapper
function ProtectedRoute({ children, allowedRoles }) {
  // Bypassed for now: making all routes public
  // const { isAuthenticated, user } = useAuthStore();
  // if (!isAuthenticated) return <Navigate to="/auth/login" replace />;
  // if (allowedRoles && !allowedRoles.includes(user?.role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1a2e',
              color: '#e2e8f0',
              border: '1px solid rgba(255,255,255,0.1)',
            },
          }}
        />
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />

          {/* Student Routes */}
          <Route path="/student" element={
            <ProtectedRoute allowedRoles={['student']}>
              <DashboardLayout role="student" />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="ai-tutor" element={<AiTutorPage />} />
            <Route path="course/:courseId" element={<CoursePlayerPage />} />
            <Route path="exam/:examId" element={<ExamProctoringPage />} />
            <Route path="profile/cognitive" element={<CognitiveProfilePage />} />
          </Route>

          {/* Teacher Routes */}
          <Route path="/teacher" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <DashboardLayout role="teacher" />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<TeacherDashboard />} />
            <Route path="courses/builder" element={<CourseBuilderPage />} />
            <Route path="proctoring/reports" element={<ProctoringReportsPage />} />
          </Route>

          {/* Admin Routes (Tenant Admin) */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['tenant_admin']}>
              <DashboardLayout role="admin" />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<ManageUsersPage />} />
          </Route>

          {/* Super Admin Routes */}
          <Route path="/super-admin" element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <DashboardLayout role="super_admin" />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<SuperAdminDashboard />} />
            <Route path="tenants" element={<TenantManagementPage />} />
            <Route path="tenants/:id" element={<TenantDetailsPage />} />
            <Route path="users" element={<GlobalUsersPage />} />
            <Route path="courses" element={<GlobalCoursesPage />} />
            <Route path="audit-logs" element={<AuditLogsPage />} />
            <Route path="billing" element={<BillingPage />} />
            <Route path="settings" element={<GlobalSettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
