import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { useBranding } from '../context/BrandingContext';
import { useSync } from '../context/SyncContext';
import { OfflineData } from '../lib/offline/offlineData';
import { 
  BookOpen, 
  GraduationCap, 
  Trophy, 
  Clock, 
  BarChart, 
  LogOut,
  ChevronRight,
  Target,
  LayoutDashboard,
  Settings,
  Bell,
  Search,
  RefreshCw,
  BookText,
  Flame, Award, Brain, Medal
} from 'lucide-react';
import { motion } from 'motion/react';

export default function StudentDashboard() {
  const { user, signOut } = useAuth();
  const { settings } = useBranding();
  const { isSyncing, lastSync, triggerSync } = useSync();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    avgScore: '0%',
    timeSpent: '0 hrs',
    mastery: '0%'
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const profileRef = await getDoc(doc(db, 'learnerProfiles', user.uid));
        let baseMastery = 0;
        if (profileRef.exists()) {
          setProfile(profileRef.data());
          baseMastery = profileRef.data().baselineScore || 0;
          setStats(prev => ({ ...prev, mastery: `${baseMastery}%` }));
        }

        const attemptsQ = query(collection(db, 'quizAttempts'), where('userId', '==', user.uid));
        const attemptsSnap = await getDocs(attemptsQ);
        
        const offlineQ = await OfflineData.getUnsyncedAttempts();
        const allAttempts = [...attemptsSnap.docs.map(d => d.data()), ...offlineQ];

        if (allAttempts.length > 0) {
          let totalScore = 0;
          let totalTime = 0;
          let totalQuestions = 0;
          
          allAttempts.forEach(att => {
            totalScore += att.score || 0;
            totalQuestions += att.total || 0;
            totalTime += att.timeSpent || 0;
          });

          const avg = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;
          // Simple mastery inflation just for demo
          const mastery = Math.round(baseMastery + (avg * 0.2));

          setStats({
            avgScore: `${avg}%`,
            timeSpent: `${(totalTime / 3600).toFixed(1)} hrs`,
            mastery: `${Math.min(100, Math.max(baseMastery, mastery))}%` 
          });
        }
      } catch (e) {
        console.error('Failed to fetch dashboard data', e);
      }
    };
    fetchData();
  }, [user]);

  useEffect(() => {
    // Auto-sync on load if never synced or synced > 24 hours ago
    if (!lastSync || (Date.now() - lastSync > 1000 * 60 * 60 * 24)) {
      if (!isSyncing) {
         triggerSync();
      }
    }
    
    // Streak tracking
    if (user && Object.keys(user).length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const lastLogin = user.lastLoginDate;
      if (lastLogin !== today) {
         // update streak
         let newStreak = user.streak || 0;
         if (lastLogin) {
            const last = new Date(lastLogin);
            const now = new Date(today);
            const diff = (now.getTime() - last.getTime()) / (1000 * 3600 * 24);
            if (diff === 1) newStreak += 1;
            else if (diff > 1) newStreak = 1;
         } else {
            newStreak = 1;
         }
         updateDoc(doc(db, 'users', user.uid), { lastLoginDate: today, streak: newStreak })
           .catch((e: any) => console.error(e));
      }
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastSync, user?.uid]);

  const handleSignOut = () => {
    signOut();
    navigate('/sign-in');
  };

  const renderLogo = () => {
    if (settings.logo.startsWith('http') || settings.logo.startsWith('data:')) {
      return <img src={settings.logo} alt="Logo" className="w-8 h-8 object-contain" />;
    }
    return <span className="material-symbols-outlined text-primary text-[24px]">{settings.logo || 'school'}</span>;
  };

  return (
    <div className="bg-[#f0f2f5] text-slate-800 font-body min-h-screen antialiased flex flex-col md:flex-row">
      
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col sticky top-0 h-screen shadow-sm">
        <div className="p-6">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                {renderLogo()}
             </div>
             <h1 className="text-primary text-xl font-extrabold font-headline tracking-tight leading-none truncate">{settings.siteName}</h1>
          </div>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2">Student Portal</p>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 text-[#1b366a] font-bold transition-all">
            <LayoutDashboard size={18} />
            Dashboard
          </button>
          <button onClick={() => navigate('/focus')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors font-semibold">
            <Target size={18} />
            My Focus
          </button>
          <button onClick={() => navigate('/exam?type=mock')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors font-semibold">
            <GraduationCap size={18} />
            Take Exam
          </button>
          <button onClick={() => navigate('/quiz-results')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors font-semibold">
            <BarChart size={18} />
            Performance
          </button>
        </nav>

        <div className="p-4 mt-auto border-t border-slate-100">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl mb-3 border border-slate-100">
             <div className="w-9 h-9 bg-[#1b366a] rounded-full flex items-center justify-center text-white font-bold text-sm uppercase">
               {user?.email[0]}
             </div>
             <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate">{user?.fullName || user?.email}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase">{user?.email}</p>
             </div>
          </div>
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-600 font-bold hover:bg-red-50 transition-colors text-sm"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="px-6 py-4 flex items-center justify-between bg-white md:bg-white/80 md:backdrop-blur-md border-b border-slate-200 sticky top-0 z-30">
          <div className="md:hidden flex items-center gap-2">
             {renderLogo()}
             <h1 className="text-primary text-xl font-extrabold font-headline tracking-tighter truncate max-w-[200px]">{settings.siteName}</h1>
          </div>
          <div className="hidden md:flex items-center bg-slate-100 rounded-full px-4 py-2 w-72">
             <Search size={16} className="text-slate-400 mr-2" />
             <input type="text" placeholder="Search modules..." className="bg-transparent border-none outline-none text-xs w-full" />
          </div>
          <div className="flex items-center gap-2">
            {/* Sync Indicator */}
            <div className="hidden md:flex items-center mr-4 text-xs font-semibold text-slate-400">
              {isSyncing ? (
                <>
                   <RefreshCw size={14} className="mr-2 animate-spin text-[#1b366a]" />
                   Syncing offline data...
                </>
              ) : (
                <button onClick={triggerSync} className="flex items-center hover:text-slate-600 transition-colors" title={lastSync ? `Last synced: ${new Date(lastSync).toLocaleString()}` : 'Sync now'}>
                   <RefreshCw size={14} className="mr-2" />
                   Synced
                </button>
              )}
            </div>
            
            <button onClick={() => alert('No new notifications')} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
              <Bell size={20} />
            </button>
            <button onClick={() => navigate('/admin/settings')} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors hidden md:block">
              <Settings size={20} />
            </button>
            <button 
              onClick={handleSignOut}
              className="p-2 text-slate-400 md:hidden"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* Content Wrapper */}
        <div className="p-4 md:p-8 max-w-6xl mx-auto w-full space-y-6">
          
          {/* Banner */}
          <div className="relative overflow-hidden bg-[#1b366a] text-white p-6 md:p-10 rounded-3xl shadow-xl md:flex md:items-center md:justify-between group">
            <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
              <BookOpen className="absolute -top-10 -right-10 w-64 h-64 rotate-12" />
              <Target className="absolute -bottom-10 -left-10 w-48 h-48 -rotate-12" />
            </div>
            
            <div className="relative z-10 space-y-4 md:max-w-xl">
              <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10">
                {user?.learningMode === 'class_based' ? 'Class Enrolled' : 'Self Review Mode'}
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold font-headline tracking-tight leading-tight">
                Master the {user?.selectedFocus ? user.selectedFocus.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'LET'} Path
              </h1>
              <p className="text-blue-100 text-sm font-medium opacity-90 leading-relaxed md:max-w-md">You've reached {stats.mastery} mastery. Take a simulated exam today to test your readiness for the actual board exam.</p>
              <div className="flex flex-wrap gap-3 pt-2">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/exam?type=mock')}
                  className="bg-white text-[#1b366a] px-5 py-2.5 rounded-xl font-bold uppercase tracking-widest text-[11px] shadow-lg shadow-black/10"
                >
                  Start Mock Exam
                </motion.button>
              </div>
            </div>

            <div className="hidden lg:block relative z-10 shrink-0">
               <div className="w-36 h-36 rounded-full border-[6px] border-white/10 flex flex-col items-center justify-center bg-white/5 backdrop-blur-sm shadow-inner">
                  <span className="text-4xl font-extrabold font-headline tracking-tighter">{stats.mastery}</span>
                  <span className="text-[9px] font-bold uppercase opacity-60 mt-0.5 tracking-widest">Mastery</span>
               </div>
            </div>
          </div>

          {/* Mini Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Study Streak', value: `${user?.streak || 1} Days`, icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-50' },
              { label: 'Time Spent', value: stats.timeSpent, icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50' },
              { label: 'Avg Score', value: stats.avgScore, icon: BarChart, color: 'text-emerald-500', bg: 'bg-emerald-50' },
              { label: 'Rank', value: '#248', icon: GraduationCap, color: 'text-indigo-500', bg: 'bg-indigo-50' },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center shrink-0`}>
                  <stat.icon size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                  <p className="text-lg font-extrabold text-slate-800 tracking-tight leading-none">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

            {/* Quick Actions and Recommended Path */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-6 md:pb-0">
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-lg font-extrabold font-headline flex items-center gap-2 text-slate-800">
                <Target className="text-[#1b366a]" size={20} />
                Recommended Path
              </h2>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 mb-4 shadow-sm">
                 <h3 className="font-bold text-indigo-900 text-lg mb-2">Focus Area: {profile?.recommendedPath || 'General Foundations'}</h3>
                 <p className="text-sm text-indigo-700 mb-4">Based on your diagnostic assessment and recent activity, mastering this module will yield the highest impact on your overall score.</p>
                 <button onClick={() => navigate('/quest')} className="bg-[#1b366a] text-white px-5 py-2.5 rounded-xl font-bold uppercase tracking-widest text-[11px] hover:bg-[#112244] shadow-md transition-all">Start Recommended Module</button>
              </div>

              <h2 className="text-lg font-extrabold font-headline flex items-center gap-2 text-slate-800 mt-6">
                <BookOpen className="text-[#1b366a]" size={20} />
                Explore Activities
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.button 
                  whileHover={{ y: -4 }}
                  onClick={() => navigate('/library')}
                  className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col gap-4 text-left group hover:border-[#1b366a]/30 transition-all shadow-sm"
                >
                  <div className="w-10 h-10 bg-[#1b366a] rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-900/20">
                    <BookText size={20} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-800 leading-tight mb-1">Textbook Library</h3>
                    <p className="text-xs text-slate-500 font-medium">Browse thousands of resources.</p>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 text-[#1b366a] font-bold text-[10px] uppercase tracking-widest group-hover:gap-3 transition-all">
                    Open Library <ChevronRight size={14} />
                  </div>
                </motion.button>

                <motion.button 
                  whileHover={{ y: -4 }}
                  onClick={() => navigate('/quest')}
                  className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col gap-4 text-left group hover:border-indigo-200 transition-all shadow-sm"
                >
                  <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-800 leading-tight mb-1">Learning Quest</h3>
                    <p className="text-xs text-slate-500 font-medium">Bite-sized daily lessons.</p>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 text-indigo-600 font-bold text-[10px] uppercase tracking-widest group-hover:gap-3 transition-all">
                    Start Quest <ChevronRight size={14} />
                  </div>
                </motion.button>
              </div>

               <div className="mt-8 space-y-4 pb-20 md:pb-0">
                 <h2 className="text-lg font-extrabold font-headline flex items-center gap-2 text-slate-800">
                    <Trophy className="text-amber-500" size={20} />
                    Achievement Badges
                 </h2>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className={`bg-white rounded-2xl p-4 border flex flex-col items-center justify-center text-center transition-all ${user?.streak && user.streak >= 10 ? 'border-amber-200 shadow-sm' : 'border-slate-200 opacity-50 grayscale hover:opacity-100 hover:grayscale-0 cursor-crosshair'}`}>
                       <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 shadow-inner border ${user?.streak && user.streak >= 10 ? 'bg-amber-50 border-amber-100' : 'bg-slate-100 border-slate-200'}`}>
                         <Flame className={user?.streak && user.streak >= 10 ? 'text-amber-500' : 'text-slate-400'} size={24} />
                       </div>
                       <p className="font-bold text-xs text-slate-800">10-Day Streak</p>
                    </div>
                    <div className={`bg-white rounded-2xl p-4 border flex flex-col items-center justify-center text-center transition-all ${user?.diagnosticCompleted ? 'border-indigo-200 shadow-sm' : 'border-slate-200 opacity-50 grayscale hover:opacity-100 hover:grayscale-0 cursor-crosshair'}`}>
                       <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 shadow-inner border ${user?.diagnosticCompleted ? 'bg-indigo-50 border-indigo-100' : 'bg-slate-100 border-slate-200'}`}>
                         <Award className={user?.diagnosticCompleted ? 'text-indigo-500' : 'text-slate-400'} size={24} />
                       </div>
                       <p className="font-bold text-xs text-slate-800">Diagnostic Done</p>
                    </div>
                    <div className="bg-white rounded-2xl p-4 border border-slate-200 flex flex-col items-center justify-center text-center opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all cursor-crosshair">
                       <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-2">
                         <Brain className="text-slate-400" size={24} />
                       </div>
                       <p className="font-bold text-xs text-slate-800">Subject Master</p>
                    </div>
                    <div className="bg-white rounded-2xl p-4 border border-slate-200 flex flex-col items-center justify-center text-center opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all cursor-crosshair">
                       <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-2">
                         <Medal className="text-slate-400" size={24} />
                       </div>
                       <p className="font-bold text-xs text-slate-800">Top 10% Rank</p>
                    </div>
                 </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-extrabold font-headline flex items-center gap-2 text-slate-800">
                <BarChart className="text-slate-400" size={20} />
                Domain Progress
              </h2>
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
                {[
                  { label: 'General Ed', score: 82, color: 'bg-[#1b366a]', lastAccessed: '2 days ago' },
                  { label: 'Professional Ed', score: 64, color: 'bg-indigo-500', lastAccessed: 'Today' },
                  { label: 'Specialization', score: 71, color: 'bg-slate-800', lastAccessed: 'Yesterday' },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between text-[10px] items-center mb-1.5">
                      <div className="flex flex-col">
                        <span className="font-bold uppercase tracking-widest text-slate-800">{item.label}</span>
                        <span className="text-[9px] text-slate-400 font-medium">Last accessed: {item.lastAccessed}</span>
                      </div>
                      <span className="font-bold text-slate-800 text-sm">{item.score}% Mastery</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${item.score}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.1 }}
                        className={`h-full ${item.color}`}
                      />
                    </div>
                  </div>
                ))}
                <button onClick={() => navigate('/quiz-results')} className="w-full mt-2 text-[#1b366a] text-[10px] font-bold uppercase tracking-[0.1em] hover:bg-slate-50 py-2 transition-colors">
                  View Full Analytics
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 flex justify-around p-3 z-50 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        <button className="flex flex-col items-center gap-1 text-[#1b366a]">
          <LayoutDashboard size={20} />
          <span className="text-[10px] font-bold tracking-tight">Home</span>
        </button>
        <button onClick={() => navigate('/focus')} className="flex flex-col items-center gap-1 text-slate-400">
          <Target size={20} />
          <span className="text-[10px] font-bold tracking-tight">Focus</span>
        </button>
        <button onClick={() => navigate('/exam?type=mock')} className="flex flex-col items-center gap-1 text-slate-400">
          <GraduationCap size={20} />
          <span className="text-[10px] font-bold tracking-tight">Exam</span>
        </button>
        <button onClick={() => navigate('/admin/settings')} className="flex flex-col items-center gap-1 text-slate-400">
          <Settings size={20} />
          <span className="text-[10px] font-bold tracking-tight">Settings</span>
        </button>
      </nav>
    </div>
  );
}

