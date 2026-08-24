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
import MeetingArena from './pages/shared/MeetingArena';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentCognitiveHub from './pages/student/StudentCognitiveHub';
import StudentLearningCanvas from './pages/student/StudentLearningCanvas';
import StudentExamArena from './pages/student/StudentExamArena';
import StudentCareerHub from './pages/student/StudentCareerHub';
import AiTutorPage from './pages/student/AiTutorPage';
import StudentAcademicHub from './pages/student/StudentAcademicHub';
import StudentCommunityHub from './pages/student/StudentCommunityHub';
import StudentExploreHub from './pages/student/StudentExploreHub';
import StudentLiveArena from './pages/student/StudentLiveArena';
import StudentOnboarding from './pages/student/StudentOnboarding';

// Teacher Pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherStudioHub from './pages/teacher/TeacherStudioHub';
import TeacherAssessmentHub from './pages/teacher/TeacherAssessmentHub';
import TeacherLiveHub from './pages/teacher/TeacherLiveHub';
import TeacherAcademicDesk from './pages/teacher/TeacherAcademicDesk';
import TeacherMentorshipHub from './pages/teacher/TeacherMentorshipHub';
import TeacherExamForge from './pages/teacher/TeacherExamForge';
import TeacherCommunicationHub from './pages/teacher/TeacherCommunicationHub';

// Admin Pages
import OrgDashboard from './pages/admin/AdminDashboard'; // Assuming AdminDashboard is the org dashboard
import OrgDataHub from './pages/admin/OrgDataHub';
import OrgDirectoryHub from './pages/admin/OrgDirectoryHub';
import OrgContentHub from './pages/admin/OrgContentHub';
import OrgCommunicationHub from './pages/admin/OrgCommunicationHub';
import OrgSecurityHub from './pages/admin/OrgSecurityHub';
import OrgAiHub from './pages/admin/OrgAiHub';
import OrgSettingsHub from './pages/admin/OrgSettingsHub';

// Super Admin Pages
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';
import TenantDetailsPage from './pages/superadmin/TenantDetailsPage';
import GlobalContentHub from './pages/superadmin/GlobalContentHub';
import GlobalSecurityHub from './pages/superadmin/GlobalSecurityHub';
import GlobalAiHub from './pages/superadmin/GlobalAiHub';
import GlobalCommunicationHub from './pages/superadmin/GlobalCommunicationHub';
import GlobalServiceHub from './pages/superadmin/GlobalServiceHub';
import SystemDataHub from './pages/superadmin/SystemDataHub';
import GlobalSettingsHub from './pages/superadmin/GlobalSettingsHub';
import GlobalDirectoryHub from './pages/superadmin/GlobalDirectoryHub';
import GlobalMonetizationHub from './pages/superadmin/GlobalMonetizationHub';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 30000 },
  },
});

// Protected route wrapper
function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user?.role)) return <Navigate to="/" replace />;
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
              background: '#ffffff',
              color: '#0f172a',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              fontSize: '0.875rem',
              fontWeight: 500,
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            },
            success: { iconTheme: { primary: '#16a34a', secondary: '#fff' } },
            error: { iconTheme: { primary: '#dc2626', secondary: '#fff' } },
          }}
        />
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
          <Route path="/meet/:meetingId" element={
            <ProtectedRoute>
              <MeetingArena />
            </ProtectedRoute>
          } />

          {/* Student Routes */}
          <Route path="/student" element={
            <ProtectedRoute allowedRoles={['student']}>
              <DashboardLayout role="student" />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="ai-tutor" element={<AiTutorPage />} />
            <Route path="course/:courseId" element={<StudentLearningCanvas />} />
            <Route path="exam/:examId" element={<StudentExamArena />} />
            <Route path="cognitive" element={<StudentCognitiveHub />} />
            <Route path="explore" element={<StudentExploreHub />} />
            <Route path="academic" element={<StudentAcademicHub />} />
            <Route path="community" element={<StudentCommunityHub />} />
            <Route path="career" element={<StudentCareerHub />} />
            <Route path="live/:courseId" element={<StudentLiveArena />} />
            <Route path="live" element={<StudentLiveArena />} /> {/* default for testing */}
          </Route>
          
          {/* Onboarding is outside the main dashboard layout but protected */}
          <Route path="/student/onboarding" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentOnboarding />
            </ProtectedRoute>
          } />

          {/* Teacher Routes */}
          <Route path="/teacher" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <DashboardLayout role="teacher" />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<TeacherDashboard />} />
            <Route path="studio" element={<TeacherStudioHub />} />
            <Route path="assessment" element={<TeacherAssessmentHub />} />
            <Route path="live" element={<TeacherLiveHub />} />
            <Route path="desk" element={<TeacherAcademicDesk />} />
            <Route path="mentorship" element={<TeacherMentorshipHub />} />
            <Route path="forge" element={<TeacherExamForge />} />
            <Route path="inbox" element={<TeacherCommunicationHub />} />
          </Route>

          {/* Admin Routes (Tenant Admin) */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['tenant_admin']}>
              <DashboardLayout role="admin" />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<OrgDashboard />} />
            <Route path="data-hub" element={<OrgDataHub />} />
            <Route path="ai" element={<OrgAiHub />} />
            <Route path="directory" element={<OrgDirectoryHub />} />
            <Route path="content" element={<OrgContentHub />} />
            <Route path="communication" element={<OrgCommunicationHub />} />
            <Route path="security" element={<OrgSecurityHub />} />
            <Route path="settings" element={<OrgSettingsHub />} />
          </Route>

          {/* Super Admin Routes */}
          <Route path="/super-admin" element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <DashboardLayout role="super_admin" />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<SuperAdminDashboard />} />
            <Route path="system-data" element={<SystemDataHub />} />
            <Route path="directory" element={<GlobalDirectoryHub />} />
            <Route path="tenants/:id" element={<TenantDetailsPage />} />
            <Route path="courses" element={<GlobalContentHub />} />
            <Route path="plans" element={<GlobalMonetizationHub />} />
            <Route path="announcements" element={<GlobalCommunicationHub />} />
            <Route path="support" element={<GlobalServiceHub />} />
            <Route path="audit-logs" element={<GlobalSecurityHub />} />
            <Route path="ai-hub" element={<GlobalAiHub />} />
            <Route path="settings" element={<GlobalSettingsHub />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
