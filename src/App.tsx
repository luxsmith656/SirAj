import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import CategoryManagement from './pages/CategoryManagement';
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
          <Link to="/loading" className="text-teal-600 hover:underline">11. Loading Screen</Link>
          <Link to="/onboarding" className="text-teal-600 hover:underline">12. Onboarding</Link>
          <Link to="/sign-in" className="text-teal-600 hover:underline">13. Sign In</Link>
          <Link to="/focus" className="text-teal-600 hover:underline">14. Choose Focus</Link>
          <Link to="/exam" className="text-teal-600 hover:underline">15. Exam Simulation</Link>
          <Link to="/quiz-results" className="text-teal-600 hover:underline">16. Quiz Results</Link>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
        <Routes>
            <Route path="/" element={<DevIndex />} />
            {/* Admin Routes */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/categories" element={<CategoryManagement />} />
            <Route path="/question/edit" element={<EditQuestion />} />
            <Route path="/question/detail" element={<QuestionDetail />} />
            <Route path="/curriculum-settings" element={<CurriculumSettings />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/users" element={<Users />} />
            <Route path="/bulk-upload" element={<BulkUpload />} />
            <Route path="/sync" element={<SyncCenter />} />
            <Route path="/settings" element={<Settings />} />

            {/* Mobile / App Routes */}
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/loading" element={<Loading />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/focus" element={<Focus />} />
            <Route path="/quiz-results" element={<QuizResults />} />
            <Route path="/exam" element={<ExamSimulation />} />
        </Routes>
    </Router>
  );
}
