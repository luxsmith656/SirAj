import React, { useState, useEffect } from 'react';
import HelpSupportButton from '../components/HelpSupportButton';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { useBranding } from '../context/BrandingContext';
import { useSync } from '../context/SyncContext';
import { useTheme } from '../context/ThemeContext';
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
  Flame, Award, Brain, Medal,
  Users
} from 'lucide-react';
import { motion } from 'motion/react';

export default function StudentDashboard() {
  const { user, signOut } = useAuth();
  const { settings } = useBranding();
  const { isSyncing, lastSync, triggerSync } = useSync();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<any>(null);
  const [classData, setClassData] = useState<any>(null);
  const [assignedModules, setAssignedModules] = useState<any[]>([]);
  const [stats, setStats] = useState({
    avgScore: '0%',
    timeSpent: '0 hrs',
    mastery: '0%'
  });
  const [earnedBadges, setEarnedBadges] = useState<any[]>([]);

  enum OperationType {
    CREATE = 'create',
    UPDATE = 'update',
    DELETE = 'delete',
    LIST = 'list',
    GET = 'get',
    WRITE = 'write',
  }

  interface FirestoreErrorInfo {
    error: string;
    operationType: OperationType;
    path: string | null;
    authInfo: {
      userId?: string | null;
      email?: string | null;
      emailVerified?: boolean | null;
      isAnonymous?: boolean | null;
    }
  }

  function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
    const errInfo: FirestoreErrorInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        emailVerified: auth.currentUser?.emailVerified,
        isAnonymous: auth.currentUser?.isAnonymous
      },
      operationType,
      path
    };
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  }

  useEffect(() => {
    const fetchBadges = async () => {
      if (!user?.earnedBadges || user.earnedBadges.length === 0) return;
      try {
        const badgeList: any[] = [];
        for (const bid of user.earnedBadges) {
          const badgePath = `badges/${bid}`;
          try {
            const bdoc = await getDoc(doc(db, 'badges', bid));
            if (bdoc.exists()) badgeList.push({ id: bdoc.id, ...bdoc.data() });
          } catch (e) {
            handleFirestoreError(e, OperationType.GET, badgePath);
          }
        }
        setEarnedBadges(badgeList);
      } catch (e) {
        console.error('Failed to fetch badges', e);
      }
    };
    fetchBadges();
  }, [user?.earnedBadges]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const profileRef = await getDoc(doc(db, 'learnerProfiles', user.uid));
        let baseMastery = 0;
        if (profileRef.exists()) {
          const p = profileRef.data();
          setProfile(p);
          baseMastery = p.baselineScore || 0;
          setStats(prev => ({ ...prev, mastery: `${baseMastery}%` }));
        }

        // Fetch class data if class-based
        if (user.learningMode === 'class_based' && user.activeClassId) {
          const classRef = await getDoc(doc(db, 'classes', user.activeClassId));
          if (classRef.exists()) {
            const data = classRef.data();
            setClassData(data);
            
            // Mock assigned modules if they don't exist yet in DB or fetch them
            if (data.assignedModuleIds && data.assignedModuleIds.length > 0) {
               // In a real app we'd fetch from 'modules' collection
               // For now we'll simulate a fetch
               setAssignedModules(data.assignedModuleIds.map((id: string) => ({
                 id,
                 title: `Module ${id.slice(-4)}`,
                 status: 'Assigned'
               })));
            } else {
               // Default modules for class
               setAssignedModules([
                 { id: 'm1', title: 'Foundations of Education', status: 'In Progress' },
                 { id: 'm2', title: 'The Teaching Profession', status: 'Not Started' }
               ]);
            }
          }
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
    <div className="bg-surface text-on-surface font-body min-h-screen antialiased flex flex-col md:flex-row transition-colors duration-300">
      
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex w-64 bg-surface-container-lowest border-r border-outline-variant flex-col sticky top-0 h-screen shadow-sm">
        <div className="p-6">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                {renderLogo()}
             </div>
             <h1 className="text-primary text-xl font-extrabold font-headline tracking-tight leading-none truncate">{settings.siteName}</h1>
          </div>
          <p className="text-on-surface-variant/40 text-[10px] font-bold uppercase tracking-widest mt-2">Student Portal</p>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 text-primary font-bold transition-all">
            <LayoutDashboard size={18} />
            Dashboard
          </button>
          <button onClick={() => navigate('/focus')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface-variant hover:bg-surface-container transition-colors font-semibold">
            <Target size={18} />
            My Focus
          </button>
          <button onClick={() => navigate('/exam?type=mock')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface-variant hover:bg-surface-container transition-colors font-semibold">
            <GraduationCap size={18} />
            Take Exam
          </button>
          <button onClick={() => navigate('/quiz-results')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface-variant hover:bg-surface-container transition-colors font-semibold">
            <BarChart size={18} />
            Performance
          </button>
        </nav>

        <div className="p-4 mt-auto border-t border-outline-variant">
          <div className="flex items-center gap-3 p-3 bg-surface-container rounded-xl mb-3 border border-outline-variant">
             <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center text-on-primary font-bold text-sm uppercase shrink-0">
                {user?.email?.[0] || 'U'}
             </div>
             <div className="flex-1 min-w-0 pr-2">
                <p className="text-xs font-bold text-on-surface truncate">{user?.fullName || user?.email}</p>
                <p className="text-[10px] text-on-surface-variant/60 font-medium truncate lowercase">{user?.email}</p>
             </div>
          </div>
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-error font-bold hover:bg-error/5 transition-colors text-sm"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="px-6 py-4 flex items-center justify-between bg-surface-container-lowest md:bg-surface/80 md:backdrop-blur-md border-b border-outline-variant sticky top-0 z-30">
          <div className="md:hidden flex items-center gap-2">
             {renderLogo()}
             <h1 className="text-primary text-xl font-extrabold font-headline tracking-tighter truncate max-w-[200px]">{settings.siteName}</h1>
          </div>
          <div className="hidden md:flex items-center bg-surface-container rounded-full px-4 py-2 w-72">
             <Search size={16} className="text-on-surface-variant/40 mr-2" />
             <input type="text" placeholder="Search modules..." className="bg-transparent border-none outline-none text-xs w-full text-on-surface" />
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleTheme}
              className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors w-10 h-10 flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[20px]">{theme === 'light' ? 'dark_mode' : 'light_mode'}</span>
            </button>
            
            <div className="hidden md:flex items-center mr-4 text-xs font-semibold text-on-surface-variant/40">
              {isSyncing ? (
                <>
                   <RefreshCw size={14} className="mr-2 animate-spin text-primary" />
                   Syncing...
                </>
              ) : (
                <button onClick={triggerSync} className="flex items-center hover:text-on-surface-variant transition-colors" title={lastSync ? `Last synced: ${new Date(lastSync).toLocaleString()}` : 'Sync now'}>
                   <RefreshCw size={14} className="mr-2" />
                   Synced
                </button>
              )}
            </div>
            
            <button onClick={() => alert('No new notifications')} className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors">
              <Bell size={20} />
            </button>
            <button onClick={() => navigate('/admin/settings')} className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors hidden md:block">
              <Settings size={20} />
            </button>
            <button 
              onClick={handleSignOut}
              className="p-2 text-on-surface-variant md:hidden"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* Content Wrapper */}
        <div className="p-4 md:p-8 max-w-6xl mx-auto w-full space-y-6">
          
          {/* Banner */}
          <div className="relative overflow-hidden bg-primary text-on-primary p-6 md:p-10 rounded-[2.5rem] shadow-xl md:flex md:items-center md:justify-between group">
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
                  className="bg-white/90 hover:bg-white text-primary px-5 py-2.5 rounded-xl font-bold uppercase tracking-widest text-[11px] shadow-lg shadow-black/10 transition-colors"
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
              { label: 'Study Streak', value: `${user?.streak || 1} Days`, icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-500/10' },
              { label: 'Time Spent', value: stats.timeSpent, icon: Clock, color: 'text-blue-500', bg: 'bg-blue-500/10' },
              { label: 'Avg Score', value: stats.avgScore, icon: BarChart, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
              { 
                label: `Level ${user?.level || 1}`, 
                value: `${user?.xp || 0} XP`, 
                icon: Award, 
                color: 'text-indigo-500', 
                bg: 'bg-indigo-500/10',
                progress: ((user?.xp || 0) % 1000) / 10 
              },
            ].map((stat, i) => (
              <div key={i} className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant shadow-sm flex flex-col gap-3">
                <div className="flex items-center gap-4 text-on-surface">
                  <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center shrink-0`}>
                    <stat.icon size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                    <p className="text-lg font-extrabold tracking-tight leading-none">{stat.value}</p>
                  </div>
                </div>
                {stat.progress !== undefined && (
                  <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500" 
                      style={{ width: `${stat.progress}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

            {/* Quick Actions and Recommended Path / Class Info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-6 md:pb-0">
            <div className="lg:col-span-2 space-y-6">
              
              {user?.learningMode === 'class_based' ? (
                // CLASS BASED VIEW
                <div className="space-y-6">
                  <h2 className="text-lg font-extrabold font-headline flex items-center gap-2 text-on-surface">
                    <Users className="text-primary" size={20} />
                    Class Information
                  </h2>
                  <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                      <div>
                        <h3 className="font-bold text-xl text-on-surface">{classData?.className || 'Loading Class...'}</h3>
                        <p className="text-sm text-on-surface-variant font-medium">Instructor: <span className="text-primary font-bold">{classData?.instructorName || 'Your Instructor'}</span></p>
                      </div>
                      <div className="bg-primary/10 text-primary px-4 py-2 rounded-xl border border-primary/20">
                        <span className="text-[10px] font-bold uppercase tracking-widest block leading-none mb-1">Class Code</span>
                        <span className="font-mono font-bold text-base">{classData?.classCode}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest ml-1">Assigned Modules</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {assignedModules.map(mod => (
                          <div key={mod.id} className="bg-surface-container p-4 rounded-xl border border-outline-variant/10 flex items-center justify-between group hover:border-primary/20 transition-all">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-surface-container-lowest rounded-lg flex items-center justify-center text-primary shadow-sm font-bold text-xs">{mod.id[0].toUpperCase()}</div>
                              <span className="text-sm font-bold text-on-surface">{mod.title}</span>
                            </div>
                            <span className="text-[9px] font-bold px-2 py-1 bg-surface-container-lowest rounded-md text-on-surface-variant/40 uppercase tracking-tighter">{mod.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // SELF REVIEW VIEW
                <div className="space-y-6">
                  <h2 className="text-lg font-extrabold font-headline flex items-center gap-2 text-on-surface">
                    <Target className="text-primary" size={20} />
                    Self-Review Focus
                  </h2>
                  <div className="bg-secondary-container/20 border border-secondary-container/30 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-surface-container rounded-2xl flex items-center justify-center text-primary shadow-sm">
                        <Target size={24} />
                      </div>
                      <div>
                         <h3 className="font-bold text-on-surface text-lg leading-tight">{user?.selectedFocus ? user.selectedFocus.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'General Education'}</h3>
                         <p className="text-xs text-on-surface-variant/80">Currently focusing on your selected curriculum</p>
                      </div>
                    </div>
                    
                    <div className="bg-surface-container-lowest/50 backdrop-blur-sm rounded-xl p-4 border border-outline-variant/30">
                       <h4 className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest mb-2">Weak Topics to Work On</h4>
                       <div className="flex flex-wrap gap-2">
                         {(profile?.weaknesses?.length > 0 ? profile.weaknesses : ['Pedagogical Theories', 'Research Methods']).map((w: string, i: number) => (
                           <span key={i} className="px-2.5 py-1 bg-error-container/30 text-error rounded-lg text-[10px] font-bold border border-error/10">{w}</span>
                         ))}
                       </div>
                    </div>
                  </div>
                </div>
              )}

              <h2 className="text-lg font-extrabold font-headline flex items-center gap-2 text-on-surface mt-6">
                <BookOpen className="text-primary" size={20} />
                Explore Activities
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.button 
                  whileHover={{ y: -4 }}
                  onClick={() => navigate('/library')}
                  className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant flex flex-col gap-4 text-left group hover:border-primary/30 transition-all shadow-sm"
                >
                  <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-on-primary shadow-lg shadow-primary/20">
                    <BookText size={20} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-on-surface leading-tight mb-1">Textbook Library</h3>
                    <p className="text-xs text-on-surface-variant font-medium">Browse thousands of resources.</p>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 text-primary font-bold text-[10px] uppercase tracking-widest group-hover:gap-3 transition-all">
                    Open Library <ChevronRight size={14} />
                  </div>
                </motion.button>

                <motion.button 
                  whileHover={{ y: -4 }}
                  onClick={() => navigate('/quest')}
                  className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant flex flex-col gap-4 text-left group hover:border-tertiary-container transition-all shadow-sm"
                >
                  <div className="w-10 h-10 bg-tertiary rounded-xl flex items-center justify-center text-on-tertiary shadow-lg shadow-tertiary/20">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-on-surface leading-tight mb-1">Learning Quest</h3>
                    <p className="text-xs text-on-surface-variant font-medium">Bite-sized daily lessons.</p>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 text-tertiary font-bold text-[10px] uppercase tracking-widest group-hover:gap-3 transition-all">
                    Start Quest <ChevronRight size={14} />
                  </div>
                </motion.button>

                <motion.button 
                  whileHover={{ y: -4 }}
                  onClick={() => navigate('/flashcards')}
                  className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant flex flex-col gap-4 text-left group hover:border-amber-500/30 transition-all shadow-sm"
                >
                  <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
                    <Brain size={20} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-on-surface leading-tight mb-1">Daily Flashcards</h3>
                    <p className="text-xs text-on-surface-variant font-medium">Quick mastery of key concepts.</p>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 text-amber-600 font-bold text-[10px] uppercase tracking-widest group-hover:gap-3 transition-all">
                    Flip Cards <ChevronRight size={14} />
                  </div>
                </motion.button>
              </div>

               <div className="mt-8 space-y-4 pb-20 md:pb-0">
                 <h2 className="text-lg font-extrabold font-headline flex items-center gap-2 text-on-surface">
                    <Trophy className="text-amber-500" size={20} />
                    Achievement Badges
                 </h2>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {earnedBadges.length > 0 ? (
                      earnedBadges.map((badge) => (
                        <motion.div 
                          key={badge.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-surface-container-lowest rounded-2xl p-4 border border-amber-500/30 shadow-sm flex flex-col items-center justify-center text-center transition-all"
                        >
                           <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mb-2 shadow-inner">
                             <Award className="text-amber-500" size={24} />
                           </div>
                           <p className="font-bold text-xs text-on-surface">{badge.name}</p>
                           <p className="text-[10px] text-on-surface-variant/40 font-medium">{badge.rarity}</p>
                        </motion.div>
                      ))
                    ) : (
                      <>
                        <div className={`bg-surface-container-lowest rounded-2xl p-4 border flex flex-col items-center justify-center text-center transition-all ${user?.streak && user.streak >= 10 ? 'border-amber-500/30 shadow-sm' : 'border-outline-variant opacity-30 grayscale hover:opacity-100 hover:grayscale-0'}`}>
                           <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 shadow-inner border ${user?.streak && user.streak >= 10 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-surface-container border-outline-variant'}`}>
                             <Flame className={user?.streak && user.streak >= 10 ? 'text-amber-500' : 'text-on-surface-variant/40'} size={24} />
                           </div>
                           <p className="font-bold text-xs text-on-surface">10-Day Streak</p>
                        </div>
                        <div className={`bg-surface-container-lowest rounded-2xl p-4 border flex flex-col items-center justify-center text-center transition-all ${user?.diagnosticCompleted ? 'border-primary/20 shadow-sm' : 'border-outline-variant opacity-30 grayscale hover:opacity-100 hover:grayscale-0'}`}>
                           <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 shadow-inner border ${user?.diagnosticCompleted ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-surface-container border-outline-variant'}`}>
                             <Award className={user?.diagnosticCompleted ? 'text-primary' : 'text-on-surface-variant/40'} size={24} />
                           </div>
                           <p className="font-bold text-xs text-on-surface">Diagnostic Done</p>
                        </div>
                        <div className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant flex flex-col items-center justify-center text-center opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all">
                           <div className="w-12 h-12 bg-surface-container rounded-full flex items-center justify-center mb-2">
                             <Brain className="text-on-surface-variant/40" size={24} />
                           </div>
                           <p className="font-bold text-xs text-on-surface">Subject Master</p>
                        </div>
                        <div className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant flex flex-col items-center justify-center text-center opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all">
                           <div className="w-12 h-12 bg-surface-container rounded-full flex items-center justify-center mb-2">
                             <Medal className="text-on-surface-variant/40" size={24} />
                           </div>
                           <p className="font-bold text-xs text-on-surface">Top 10% Rank</p>
                        </div>
                      </>
                    )}
                 </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-extrabold font-headline flex items-center gap-2 text-on-surface">
                <BarChart className="text-on-surface-variant/40" size={20} />
                {user?.learningMode === 'class_based' ? 'Class Progress' : 'Category Progress'}
              </h2>
              <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant shadow-sm space-y-5">
                {(user?.learningMode === 'class_based' ? [
                  { label: 'Weekly Tasks', score: 45, color: 'bg-emerald-500', subtitle: '4/9 tasks completed' },
                  { label: 'Class Participation', score: 80, color: 'bg-primary', subtitle: 'Top tier learner' },
                  { label: 'Quiz Performance', score: 68, color: 'bg-tertiary', subtitle: 'Above class average' },
                ] : [
                  { label: 'General Ed', score: 82, color: 'bg-primary', subtitle: 'Last accessed: 2 days ago' },
                  { label: 'Professional Ed', score: 64, color: 'bg-tertiary', subtitle: 'Last accessed: Today' },
                  { label: 'Specialization', score: 71, color: 'bg-on-surface-variant', subtitle: 'Last accessed: Yesterday' },
                ]).map((item, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between text-[10px] items-center mb-1.5">
                      <div className="flex flex-col">
                        <span className="font-bold uppercase tracking-widest text-on-surface">{item.label}</span>
                        <span className="text-[9px] text-on-surface-variant/40 font-medium">{item.subtitle}</span>
                      </div>
                      <span className="font-bold text-on-surface text-sm">{item.score}% Mastery</span>
                    </div>
                    <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${item.score}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.1 }}
                        className={`h-full ${item.color}`}
                      />
                    </div>
                  </div>
                ))}
                <button onClick={() => navigate('/quiz-results')} className="w-full mt-2 text-primary text-[10px] font-bold uppercase tracking-[0.1em] hover:bg-surface-container py-2 transition-colors rounded-lg">
                  View Full Analytics
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-surface-container-lowest border-t border-outline-variant flex justify-around p-3 z-50 shadow-lg">
        <button className="flex flex-col items-center gap-1 text-primary">
          <LayoutDashboard size={20} />
          <span className="text-[10px] font-bold tracking-tight">Home</span>
        </button>
        <button onClick={() => navigate('/focus')} className="flex flex-col items-center gap-1 text-on-surface-variant/40">
          <Target size={20} />
          <span className="text-[10px] font-bold tracking-tight">Focus</span>
        </button>
        <button onClick={() => navigate('/exam?type=mock')} className="flex flex-col items-center gap-1 text-on-surface-variant/40">
          <GraduationCap size={20} />
          <span className="text-[10px] font-bold tracking-tight">Exam</span>
        </button>
        <button onClick={triggerSync} className="flex flex-col items-center gap-1 text-on-surface-variant/40">
          <RefreshCw size={20} className={isSyncing ? 'animate-spin text-primary' : ''} />
          <span className="text-[10px] font-bold tracking-tight">Sync</span>
        </button>
      </nav>
      <HelpSupportButton />
    </div>
  );
}

