import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import CategoryManagement from './pages/CategoryManagement';
import QuestionBank from './pages/QuestionBank';
import EditQuestion from './pages/EditQuestion';
import QuestionDetail from './pages/QuestionDetail';
import CurriculumSettings from './pages/CurriculumSettings';
import Analytics from './pages/Analytics';
import Users from './pages/Users';
import BulkUpload from './pages/BulkUpload';
import SyncCenter from './pages/SyncCenter';
import Settings from './pages/Settings';
import SignIn from './pages/SignIn';
import Loading from './pages/Loading';
import Onboarding from './pages/Onboarding';
import Focus from './pages/Focus';
import QuizResults from './pages/QuizResults';
import ExamSimulation from './pages/ExamSimulation';
import ClientDashboard from './pages/ClientDashboard';
import { SidebarProvider } from './context/SidebarContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BrandingProvider, useBranding } from './context/BrandingContext';

function ProtectedRoute({ children, role }: { children: React.ReactNode, role?: 'admin' | 'instructor' | 'student' }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <Loading />;
  }

  if (!user) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  // Handle onboarding for students
  if (!user.onboarded && location.pathname !== '/onboarding' && user.role === 'student' && location.pathname !== '/sign-in') {
    return <Navigate to="/onboarding" replace />;
  }

  if (role && user.role !== role) {
    if (user.role === 'admin') return <Navigate to="/dashboard" replace />;
    if (user.role === 'instructor') return <Navigate to="/analytics" replace />;
    return <Navigate to="/client-home" replace />;
  }

  return <>{children}</>;
}

function DevIndex() {
  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold font-headline">LET Mastery App Navigation</h1>
      <p className="text-on-surface-variant font-body mb-4 shrink-0">Development index mapping all 16 designated views.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-2">
          <h2 className="font-bold text-primary mb-2">Admin Panel</h2>
          <Link to="/dashboard" className="text-blue-600 hover:underline">1. Dashboard</Link>
          <Link to="/categories" className="text-blue-600 hover:underline">2. Category Management</Link>
          <Link to="/question/edit" className="text-blue-600 hover:underline">3. Edit Question</Link>
          <Link to="/question/detail" className="text-blue-600 hover:underline">4. Question Detail</Link>
          <Link to="/curriculum-settings" className="text-blue-600 hover:underline">5. Curriculum Settings</Link>
          <Link to="/analytics" className="text-blue-600 hover:underline">6. Student Analytics</Link>
          <Link to="/users" className="text-blue-600 hover:underline">7. User & Role Management</Link>
          <Link to="/bulk-upload" className="text-blue-600 hover:underline">8. Roster Upload</Link>
          <Link to="/sync" className="text-blue-600 hover:underline">9. Sync Control Center</Link>
          <Link to="/settings" className="text-blue-600 hover:underline">10. System Settings</Link>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-2">
          <h2 className="font-bold text-secondary mb-2">Client Experience</h2>
          <Link to="/client-home" className="text-teal-600 hover:underline">11. Dashboard</Link>
          <Link to="/loading" className="text-teal-600 hover:underline">12. Loading Screen</Link>
          <Link to="/onboarding" className="text-teal-600 hover:underline">13. Onboarding</Link>
          <Link to="/sign-in" className="text-teal-600 hover:underline">14. Sign In</Link>
          <Link to="/focus" className="text-teal-600 hover:underline">15. Choose Focus</Link>
          <Link to="/exam" className="text-teal-600 hover:underline">16. Exam Simulation</Link>
          <Link to="/quiz-results" className="text-teal-600 hover:underline">17. Quiz Results</Link>
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
        <Routes>
            <Route path="/" element={<Navigate to="/sign-in" replace />} />
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/debug" element={<DevIndex />} />
            
            {/* Admin Routes */}
            <Route path="/dashboard" element={<ProtectedRoute role="admin"><Dashboard /></ProtectedRoute>} />
            <Route path="/categories" element={<ProtectedRoute role="admin"><CategoryManagement /></ProtectedRoute>} />
            <Route path="/question/bank" element={<ProtectedRoute role="admin"><QuestionBank /></ProtectedRoute>} />
            <Route path="/question/new" element={<ProtectedRoute role="admin"><EditQuestion /></ProtectedRoute>} />
            <Route path="/question/edit/:id" element={<ProtectedRoute role="admin"><EditQuestion /></ProtectedRoute>} />
            <Route path="/question/detail" element={<ProtectedRoute role="admin"><QuestionDetail /></ProtectedRoute>} />
            <Route path="/curriculum-settings" element={<ProtectedRoute role="admin"><CurriculumSettings /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute role="admin"><Users /></ProtectedRoute>} />
            <Route path="/bulk-upload" element={<ProtectedRoute role="admin"><BulkUpload /></ProtectedRoute>} />
            <Route path="/sync" element={<ProtectedRoute role="admin"><SyncCenter /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute role="admin"><Settings /></ProtectedRoute>} />

            {/* Mobile / App Routes */}
            <Route path="/loading" element={<Loading />} />
            <Route path="/client-home" element={<ProtectedRoute role="student"><ClientDashboard /></ProtectedRoute>} />
            <Route path="/onboarding" element={<ProtectedRoute role="student"><Onboarding /></ProtectedRoute>} />
            <Route path="/focus" element={<ProtectedRoute role="student"><Focus /></ProtectedRoute>} />
            <Route path="/quiz-results" element={<ProtectedRoute role="student"><QuizResults /></ProtectedRoute>} />
            <Route path="/exam" element={<ProtectedRoute role="student"><ExamSimulation /></ProtectedRoute>} />
            
            <Route path="*" element={<Navigate to="/sign-in" replace />} />
        </Routes>
    </Router>
  );
}

export default function App() {
  return (
    <BrandingProvider>
      <AuthProvider>
        <SidebarProvider>
          <AppContent />
        </SidebarProvider>
      </AuthProvider>
    </BrandingProvider>
  );
}


