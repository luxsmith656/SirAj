import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import SignIn from './pages/SignIn';
import ForgotPassword from './pages/ForgotPassword';
import Loading from './pages/Loading';
import CertificateVerify from './pages/CertificateVerify';
import { SidebarProvider } from './context/SidebarContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BrandingProvider, useBranding } from './context/BrandingContext';
import { SyncProvider } from './context/SyncContext';

const QuestionBank = React.lazy(() => import('./pages/QuestionBank'));
const EditQuestion = React.lazy(() => import('./pages/EditQuestion'));
const Analytics = React.lazy(() => import('./pages/Analytics'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const Users = React.lazy(() => import('./pages/Users'));
const Notifications = React.lazy(() => import('./pages/Notifications'));
const BulkUpload = React.lazy(() => import('./pages/BulkUpload'));
const Settings = React.lazy(() => import('./pages/Settings'));
const Onboarding = React.lazy(() => import('./pages/Onboarding'));
const Focus = React.lazy(() => import('./pages/Focus'));
const ExamSimulation = React.lazy(() => import('./pages/ExamSimulation'));
const PracticeMode = React.lazy(() => import('./pages/PracticeMode'));
const StudentDashboard = React.lazy(() => import('./pages/StudentDashboard'));
const StudentCourses = React.lazy(() => import('./pages/StudentCourses'));
const InstructorDashboard = React.lazy(() => import('./pages/InstructorDashboard'));
const InstructorModules = React.lazy(() => import('./pages/InstructorModules'));
const DiagnosticAssessment = React.lazy(() => import('./pages/DiagnosticAssessment'));
const AIDrafts = React.lazy(() => import('./pages/AIDrafts'));
const LearningQuest = React.lazy(() => import('./pages/LearningQuest'));
const InstructorClasses = React.lazy(() => import('./pages/InstructorClasses'));
const InstructorGradebook = React.lazy(() => import('./pages/InstructorGradebook'));
const InstructorCertificates = React.lazy(() => import('./pages/InstructorCertificates'));
const InstructorCustomize = React.lazy(() => import('./pages/InstructorCustomize'));
const TextbookLibrary = React.lazy(() => import('./pages/TextbookLibrary'));
const ChooseLearningMode = React.lazy(() => import('./pages/ChooseLearningMode'));
const ChooseFocus = React.lazy(() => import('./pages/ChooseFocus'));
const JoinClass = React.lazy(() => import('./pages/JoinClass'));
const Flashcards = React.lazy(() => import('./pages/Flashcards'));
const ProfileSettings = React.lazy(() => import('./pages/ProfileSettings'));
const StudentTodo = React.lazy(() => import('./pages/StudentTodo'));
const MistakeBank = React.lazy(() => import('./pages/MistakeBank'));
const MistakeRepairDrill = React.lazy(() => import('./pages/MistakeRepairDrill'));

function ProtectedRoute({ children, role, requireOnboarded = true }: { children: React.ReactNode, role?: 'admin' | 'instructor' | 'student', requireOnboarded?: boolean }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <Loading />;
  }

  if (!user) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  // Handle onboarding for students
  if (requireOnboarded && !user.onboarded && location.pathname !== '/onboarding' && user.role === 'student' && location.pathname !== '/sign-in') {
    return <Navigate to="/onboarding" state={{ from: location }} replace />;
  }

  if (role && user.role !== role) {
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'instructor') return <Navigate to="/instructor/dashboard" replace />;
    return <Navigate to="/student/dashboard" replace />;
  }

  return <>{children}</>;
}

function DevIndex() {
  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold font-headline">Let Mastery App Navigation</h1>
      <p className="text-on-surface-variant font-body mb-4 shrink-0">Development index mapping early routes.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-2">
          <h2 className="font-bold text-primary mb-2">Admin Panel</h2>
          <Link to="/admin/dashboard" className="text-blue-600 hover:underline">0. Admin Dashboard (Seed here)</Link>
          <Link to="/instructor/dashboard" className="text-blue-600 hover:underline">1. Instructor Dashboard</Link>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-2">
          <h2 className="font-bold text-secondary mb-2">Client Experience</h2>
          <Link to="/student/dashboard" className="text-teal-600 hover:underline">11. Dashboard</Link>
          <Link to="/loading" className="text-teal-600 hover:underline">12. Loading Screen</Link>
          <Link to="/onboarding" className="text-teal-600 hover:underline">13. Onboarding</Link>
          <Link to="/sign-in" className="text-teal-600 hover:underline">14. Sign In</Link>
          <Link to="/focus" className="text-teal-600 hover:underline">15. Choose Focus</Link>
          <Link to="/exam" className="text-teal-600 hover:underline">16. Exam Simulation</Link>
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const { settings } = useBranding();

  React.useEffect(() => {
    if (settings.siteName) {
      document.title = settings.siteName;
    }
  }, [settings.siteName]);

  return (
    <Router>
      <React.Suspense fallback={<Loading />}>
        <Routes>
            <Route path="/" element={<Navigate to="/sign-in" replace />} />
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify/:certificateId" element={<CertificateVerify />} />
            <Route path="/debug" element={<DevIndex />} />
            
            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />

            {/* Instructor Routes */}
            <Route path="/instructor/dashboard" element={<ProtectedRoute role="instructor"><InstructorDashboard /></ProtectedRoute>} />
            <Route path="/instructor/questions" element={<ProtectedRoute role="instructor"><QuestionBank /></ProtectedRoute>} />
            <Route path="/instructor/question/new" element={<ProtectedRoute role="instructor"><EditQuestion /></ProtectedRoute>} />
            <Route path="/instructor/question/edit/:id" element={<ProtectedRoute role="instructor"><EditQuestion /></ProtectedRoute>} />
            <Route path="/instructor/bulk-upload" element={<ProtectedRoute role="instructor"><BulkUpload /></ProtectedRoute>} />
            <Route path="/instructor/modules" element={<ProtectedRoute role="instructor"><InstructorModules /></ProtectedRoute>} />
            <Route path="/instructor/grades" element={<ProtectedRoute role="instructor"><InstructorGradebook /></ProtectedRoute>} />
            <Route path="/instructor/certificates" element={<ProtectedRoute role="instructor"><InstructorCertificates /></ProtectedRoute>} />
            <Route path="/instructor/users" element={<ProtectedRoute role="instructor"><Users /></ProtectedRoute>} />
            <Route path="/instructor/ai-drafts" element={<ProtectedRoute role="instructor"><AIDrafts /></ProtectedRoute>} />
            <Route path="/instructor/analytics" element={<ProtectedRoute role="instructor"><Analytics /></ProtectedRoute>} />
            <Route path="/instructor/customize" element={<ProtectedRoute role="instructor"><InstructorCustomize /></ProtectedRoute>} />

            {/* Mobile / App Routes */}
            <Route path="/loading" element={<Loading />} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/student/dashboard" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
            <Route path="/student/courses" element={<ProtectedRoute role="student"><StudentCourses /></ProtectedRoute>} />
            <Route path="/student/todo" element={<ProtectedRoute role="student"><StudentTodo /></ProtectedRoute>} />
            <Route path="/onboarding" element={<ProtectedRoute role="student"><Onboarding /></ProtectedRoute>} />
            <Route path="/choose-learning-mode" element={<ProtectedRoute role="student"><ChooseLearningMode /></ProtectedRoute>} />
            <Route path="/choose-focus" element={<ProtectedRoute role="student"><ChooseFocus /></ProtectedRoute>} />
            <Route path="/join-class" element={<ProtectedRoute role="student"><JoinClass /></ProtectedRoute>} />
            <Route path="/join/:classCodeFromUrl" element={<ProtectedRoute role="student" requireOnboarded={false}><JoinClass /></ProtectedRoute>} />
            <Route path="/quest" element={<ProtectedRoute role="student"><LearningQuest /></ProtectedRoute>} />
            <Route path="/library" element={<ProtectedRoute role="student"><TextbookLibrary /></ProtectedRoute>} />
            <Route path="/diagnostic" element={<ProtectedRoute role="student"><DiagnosticAssessment /></ProtectedRoute>} />
            <Route path="/focus" element={<ProtectedRoute role="student"><Focus /></ProtectedRoute>} />
            <Route path="/exam" element={<ProtectedRoute role="student"><ExamSimulation /></ProtectedRoute>} />
            <Route path="/practice" element={<ProtectedRoute role="student"><PracticeMode /></ProtectedRoute>} />
            <Route path="/mistakes/drill" element={<ProtectedRoute role="student"><MistakeRepairDrill /></ProtectedRoute>} />
            <Route path="/flashcards" element={<ProtectedRoute role="student"><Flashcards /></ProtectedRoute>} />
            <Route path="/mistake-bank" element={<ProtectedRoute role="student"><MistakeBank /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
            
            <Route path="*" element={<Navigate to="/sign-in" replace />} />
        </Routes>
      </React.Suspense>
    </Router>
  );
}

import { ThemeProvider } from './context/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      <BrandingProvider>
        <AuthProvider>
          <SyncProvider>
            <SidebarProvider>
              <AppContent />
            </SidebarProvider>
          </SyncProvider>
        </AuthProvider>
      </BrandingProvider>
    </ThemeProvider>
  );
}


