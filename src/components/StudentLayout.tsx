import React, { ReactNode, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBranding } from '../context/BrandingContext';
import { useTheme } from '../context/ThemeContext';
import { useSync } from '../context/SyncContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Library, 
  BookOpen, 
  CalendarDays, 
  BarChart, 
  AlertTriangle,
  LogOut, 
  Settings, 
  Bell, 
  Search,
  Target,
  WifiOff,
  UserPlus,
  Wifi,
  Download,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import HelpSupportButton from './HelpSupportButton';
import { useNotifications } from '../hooks/useNotifications';
import UpdateModal from './UpdateModal';

export default function StudentLayout({ children, title }: { children: ReactNode, title?: string }) {
  const { user, signOut } = useAuth();
  const { settings, quotaExceeded } = useBranding();
  const { theme, toggleTheme } = useTheme();
  const { unreadCount } = useNotifications();
  const { isSyncing, lastSync, triggerSync } = useSync();
  const [lowBandwidth, setLowBandwidth] = useState(() => localStorage.getItem('let-mastery-low-bandwidth') === '1');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isToolbarExpanded, setIsToolbarExpanded] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('let-mastery-low-bandwidth', lowBandwidth ? '1' : '0');
    window.dispatchEvent(new Event('let-mastery-low-bandwidth'));
  }, [lowBandwidth]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      alert("Installation is not supported or the app is already installed.");
    }
  };

  const handleSignOut = () => {
    signOut();
    navigate('/sign-in');
  };

  const navItems = [
    { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { name: 'LET Reviewers', path: '/student/courses', icon: Library },
    { name: 'Planner', path: '/student/todo', icon: CalendarDays },
    { name: 'Mistake Bank', path: '/mistake-bank', icon: AlertTriangle },
    { name: 'Reviewer Notes', path: '/flashcards', icon: BookOpen },
    { name: 'Practice', path: '/practice', icon: Target },
    { name: 'Performance', path: '/quiz-results', icon: BarChart },
  ];

  const renderLogo = () => {
    if (settings.logo && (settings.logo.startsWith('http') || settings.logo.startsWith('data:'))) {
      return <img src={settings.logo} alt="Logo" className="w-8 h-8 object-contain rounded-full" />;
    }
    return <span className="material-symbols-outlined text-primary text-[24px] font-variation-settings-fill-1">{settings.logo || 'school'}</span>;
  };

  return (
    <div className="bg-surface text-on-surface font-body min-h-screen antialiased flex flex-col md:flex-row transition-colors duration-300">
      
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex w-64 bg-surface-container-lowest border-r border-outline-variant flex-col sticky top-0 h-screen shadow-sm z-40">
        <div className="p-6">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                {renderLogo()}
             </div>
             <h1 className="text-primary text-xl font-extrabold font-headline tracking-tight leading-none truncate">{settings.siteName || 'Let Mastery'}</h1>
          </div>
          <p className="text-on-surface-variant/40 text-[10px] font-bold uppercase tracking-widest mt-2">{user?.learningMode === 'class_based' ? 'Classroom Mode' : 'Self-Paced Learning'}</p>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map(item => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <button 
                key={item.name}
                onClick={() => navigate(item.path)} 
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${isActive ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container'}`}
              >
                <item.icon size={18} />
                {item.name}
              </button>
            )
          })}
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
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="px-3 md:px-6 py-4 flex items-center justify-between bg-surface-container-lowest md:bg-surface/80 md:backdrop-blur-md border-b border-outline-variant sticky top-0 z-30">
          <div className="md:hidden flex items-center gap-2">
             {renderLogo()}
             <h1 className="text-primary text-xl font-extrabold font-headline tracking-tighter truncate max-w-[112px] sm:max-w-[200px]">{settings.siteName || 'Let Mastery'}</h1>
          </div>
          <div className="hidden md:flex items-center flex-1 ml-4 justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold font-headline text-on-surface tracking-tight">{title || 'Dashboard'}</h2>
            </div>
            <div className="flex items-center bg-surface-container rounded-full px-4 py-2 w-80 shadow-inner border border-outline-variant/30">
               <Search size={16} className="text-on-surface-variant/60 mr-2" />
               <input type="text" placeholder="Search courses, modules, lessons..." className="bg-transparent border-none outline-none text-xs w-full text-on-surface font-medium placeholder:text-on-surface-variant/40" />
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 ml-2 md:ml-4">
            {/* Collapsible Utility Row */}
            <div className={`flex items-center gap-1 sm:gap-1.5 transition-all duration-300 overflow-hidden ${
              isToolbarExpanded 
                ? 'max-w-xs md:max-w-md opacity-100 mr-1' 
                : 'max-w-0 opacity-0 pointer-events-none'
            }`}>
              {/* Sync / Online Status indicator */}
              <div 
                onClick={isOnline ? triggerSync : undefined}
                className="hidden lg:flex items-center gap-1.5 mr-1 bg-surface-container hover:bg-surface-container-high px-2.5 py-1 rounded-full text-[10px] font-extrabold text-on-surface-variant cursor-pointer select-none shrink-0" 
              >
                 {isOnline ? (
                    isSyncing ? (
                       <><span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span> Syncing</>
                    ) : (
                       <><Wifi size={12} className="text-primary" /> Synced</>
                    )
                 ) : (
                    <><WifiOff size={12} className="text-error" /> Offline</>
                 )}
              </div>

              {deferredPrompt && (
                <button 
                  onClick={handleInstallClick}
                  className="hidden md:flex items-center gap-1.5 bg-tertiary text-on-tertiary px-2.5 py-1 rounded-full text-[10px] font-extrabold hover:bg-tertiary/90 transition-colors shrink-0"
                >
                  <Download size={12} /> Install PWA
                </button>
              )}

              <button 
                onClick={toggleTheme}
                className="p-1.5 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors w-8 h-8 md:w-9 md:h-9 flex items-center justify-center shrink-0"
                title="Toggle theme"
              >
                <span className="material-symbols-outlined text-[18px]">{theme === 'light' ? 'dark_mode' : 'light_mode'}</span>
              </button>

              <button
                onClick={() => navigate('/join-class')}
                className="p-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-on-primary rounded-full transition-colors w-8 h-8 md:w-9 md:h-9 flex items-center justify-center shrink-0"
                title="Join class"
                aria-label="Join class"
              >
                <UserPlus size={16} />
              </button>

              <button
                onClick={() => setLowBandwidth((value) => !value)}
                className={`p-1.5 rounded-full transition-colors w-8 h-8 md:w-9 md:h-9 flex items-center justify-center shrink-0 ${lowBandwidth ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container'}`}
                title="Low-bandwidth mode"
              >
                <WifiOff size={16} />
              </button>

              <button
                onClick={() => setIsUpdateOpen(true)}
                className="p-1.5 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors w-8 h-8 md:w-9 md:h-9 flex items-center justify-center shrink-0"
                title="Check for updates"
              >
                <span className="material-symbols-outlined text-[18px]">refresh</span>
              </button>


            </div>

            {/* Collapse / Uncollapse Button */}
            <button
              onClick={() => setIsToolbarExpanded((prev) => !prev)}
              className={`p-1.5 rounded-full transition-all w-8 h-8 md:w-9 md:h-9 flex items-center justify-center ${
                isToolbarExpanded 
                  ? 'bg-primary text-on-primary' 
                  : 'text-on-surface-variant hover:bg-surface-container bg-surface-container/40'
              }`}
              title={isToolbarExpanded ? "Collapse settings toolbar" : "Expand settings toolbar"}
            >
              {isToolbarExpanded ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
            {/* Notification Bell (Always Visible) */}
            <button 
              onClick={() => navigate('/notifications')} 
              className="p-1.5 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors relative w-8 h-8 md:w-9 md:h-9 flex items-center justify-center shrink-0"
            >
               {unreadCount > 0 && (
                 <span className="absolute top-0 right-0 min-w-3.5 h-3.5 px-1 bg-error rounded-full text-[8.5px] leading-3.5 text-white font-black pointer-events-none text-center animate-bounce">
                   {unreadCount > 9 ? '9+' : unreadCount}
                 </span>
               )}
               <Bell size={18} />
            </button>

            <button 
                onClick={() => navigate('/profile')} 
                className="p-1.5 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors flex items-center justify-center w-8 h-8 md:w-9 md:h-9 shrink-0"
                title="Profile & Settings"
            >
                <Settings size={16} />
            </button>

            {/* Mobile-only Logout button (Always Visible) */}
            <button 
              onClick={handleSignOut}
              className="p-1.5 text-on-surface-variant md:hidden shrink-0"
              title="Sign Out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Content Wrapper */}
        <div className="p-4 md:p-8 w-full max-w-7xl mx-auto space-y-8 flex-1">
          {quotaExceeded && (
            <div className="bg-error/10 border border-error/20 rounded-2xl p-4 flex items-center gap-3">
              <AlertTriangle className="text-error shrink-0" size={20} />
              <div>
                <p className="text-xs font-black text-error uppercase tracking-widest">System Overload</p>
                <p className="text-[10px] font-bold text-error/60 leading-tight">Local cache is active while we wait for resources to reset. Some real-time updates may be delayed.</p>
              </div>
              <button 
                onClick={() => window.location.reload()}
                className="ml-auto px-3 py-1.5 bg-error text-white text-[10px] font-black uppercase rounded-lg"
              >
                Retry
              </button>
            </div>
          )}
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-surface-container-lowest border-t border-outline-variant flex justify-around p-3 z-50 shadow-lg">
        {navItems.slice(0, 4).map(item => {
           const isActive = location.pathname.startsWith(item.path);
           return (
              <button key={item.name} onClick={() => navigate(item.path)} className={`flex flex-col items-center gap-1 ${isActive ? 'text-primary' : 'text-on-surface-variant/40'}`}>
                <item.icon size={20} />
                <span className="text-[10px] font-bold tracking-tight">{item.name}</span>
              </button>
           )
        })}
      </nav>
      <HelpSupportButton />
      <UpdateModal isOpen={isUpdateOpen} onClose={() => setIsUpdateOpen(false)} />
    </div>
  );
}
