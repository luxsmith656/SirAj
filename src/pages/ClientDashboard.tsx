import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBranding } from '../context/BrandingContext';
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
  Search
} from 'lucide-react';
import { motion } from 'motion/react';

export default function ClientDashboard() {
  const { user, signOut } = useAuth();
  const { settings } = useBranding();
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
    navigate('/sign-in');
  };

  const renderLogo = () => {
    if (settings.logo.startsWith('http')) {
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
          <button onClick={() => navigate('/exam')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors font-semibold">
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
                <p className="text-xs font-bold text-slate-800 truncate">{user?.email}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Candidate</p>
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
            <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
              <Bell size={20} />
            </button>
            <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors hidden md:block">
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
              <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10">Study Session Active</span>
              <h1 className="text-2xl md:text-3xl font-extrabold font-headline tracking-tight leading-tight">Master the LET Professional Education Path</h1>
              <p className="text-blue-100 text-sm font-medium opacity-90 leading-relaxed md:max-w-md">You've reached 68% mastery. Take a simulated exam today to test your readiness for the actual board exam.</p>
              <div className="flex flex-wrap gap-3 pt-2">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/focus')}
                  className="bg-white text-[#1b366a] px-5 py-2.5 rounded-xl font-bold uppercase tracking-widest text-[11px] shadow-lg shadow-black/10"
                >
                  Continue Course
                </motion.button>
              </div>
            </div>

            <div className="hidden lg:block relative z-10 shrink-0">
               <div className="w-36 h-36 rounded-full border-[6px] border-white/10 flex flex-col items-center justify-center bg-white/5 backdrop-blur-sm shadow-inner">
                  <span className="text-4xl font-extrabold font-headline tracking-tighter">68%</span>
                  <span className="text-[9px] font-bold uppercase opacity-60 mt-0.5 tracking-widest">Mastery</span>
               </div>
            </div>
          </div>

          {/* Mini Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Study Streak', value: '12 Days', icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-50' },
              { label: 'Time Spent', value: '14.5 hrs', icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50' },
              { label: 'Avg Score', value: '78%', icon: BarChart, color: 'text-emerald-500', bg: 'bg-emerald-50' },
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

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-20 md:pb-0">
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-lg font-extrabold font-headline flex items-center gap-2 text-slate-800">
                <Target className="text-[#1b366a]" size={20} />
                Recommended Modules
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.button 
                  whileHover={{ y: -4 }}
                  onClick={() => navigate('/exam')}
                  className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col gap-4 text-left group hover:border-[#1b366a]/30 transition-all shadow-sm"
                >
                  <div className="w-10 h-10 bg-[#1b366a] rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-900/20">
                    <GraduationCap size={20} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-800 leading-tight mb-1">Full Simulation</h3>
                    <p className="text-xs text-slate-500 font-medium">150 Questions • Timed Mode</p>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 text-[#1b366a] font-bold text-[10px] uppercase tracking-widest group-hover:gap-3 transition-all">
                    Start Exam <ChevronRight size={14} />
                  </div>
                </motion.button>

                <motion.button 
                  whileHover={{ y: -4 }}
                  onClick={() => navigate('/focus')}
                  className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col gap-4 text-left group hover:border-indigo-200 transition-all shadow-sm"
                >
                  <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-800 leading-tight mb-1">Domain Drills</h3>
                    <p className="text-xs text-slate-500 font-medium">Topic-specific practice sets</p>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 text-indigo-600 font-bold text-[10px] uppercase tracking-widest group-hover:gap-3 transition-all">
                    Choose Subject <ChevronRight size={14} />
                  </div>
                </motion.button>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-extrabold font-headline flex items-center gap-2 text-slate-800">
                <BarChart className="text-slate-400" size={20} />
                Skill Insights
              </h2>
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
                {[
                  { label: 'General Ed', score: 82, color: 'bg-[#1b366a]' },
                  { label: 'Professional Ed', score: 64, color: 'bg-indigo-500' },
                  { label: 'Specialization', score: 71, color: 'bg-slate-800' },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-1.5">
                      <span className="text-slate-400">{item.label}</span>
                      <span className="text-slate-800">{item.score}%</span>
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
                <button className="w-full mt-2 text-[#1b366a] text-[10px] font-bold uppercase tracking-[0.1em] hover:bg-slate-50 py-2 transition-colors">
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
        <button onClick={() => navigate('/exam')} className="flex flex-col items-center gap-1 text-slate-400">
          <GraduationCap size={20} />
          <span className="text-[10px] font-bold tracking-tight">Exam</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-400">
          <Settings size={20} />
          <span className="text-[10px] font-bold tracking-tight">Settings</span>
        </button>
      </nav>
    </div>
  );
}

