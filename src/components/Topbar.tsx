import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSidebar } from '../context/SidebarContext';
import { useAuth } from '../context/AuthContext';
import { seedDatabase } from '../lib/db-seed';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface TopbarProps {
  title?: string;
}

import { useTheme } from '../context/ThemeContext';

import { useBranding } from '../context/BrandingContext';

export default function Topbar({ title = 'LET Mastery' }: TopbarProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [openReports, setOpenReports] = useState<any[]>([]);
  const { toggle } = useSidebar();
  const { signOut, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { settings, quotaExceeded } = useBranding();
  const navigate = useNavigate();

  useEffect(() => {
    // Generic notifications or other logic
  }, [user]);

  const handleSignOut = () => {
    signOut();
    navigate('/sign-in');
  };

  const renderLogo = () => {
    if (settings.logo && (settings.logo.startsWith('http') || settings.logo.startsWith('data:'))) {
      return <img src={settings.logo} alt="Logo" className="w-6 h-6 object-contain rounded-full" />;
    }
    return <span className="material-symbols-outlined text-primary text-[20px] font-variation-settings-fill-1">{settings.logo || 'school'}</span>;
  };

  return (
    <>
      {quotaExceeded && (
        <div className="bg-error text-white px-6 py-2 flex items-center justify-between gap-4 sticky top-0 z-[60]">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-sm">report</span>
            <div className="text-[10px] sm:text-xs">
              <span className="font-black uppercase tracking-widest mr-2">System Busy:</span>
              <span className="font-semibold opacity-90">Firestore quota reached. Using local cache for most features. Real-time updates paused.</span>
            </div>
          </div>
          <button onClick={() => window.location.reload()} className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors shrink-0">
            Retry
          </button>
        </div>
      )}
      <header className="flex justify-between items-center w-full px-6 py-3 bg-surface/80 backdrop-blur-md text-on-surface font-headline text-sm tracking-tight sticky top-0 z-40 border-b border-outline-variant">
      {/* Mobile Menu Toggle & Brand */}
      <div className="flex items-center gap-4">
        <button 
          onClick={toggle}
          className="md:hidden text-on-surface-variant p-2 rounded-full hover:bg-surface-container transition-colors focus:outline-none"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <div className="flex items-center gap-2 md:hidden">
           <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              {renderLogo()}
           </div>
           <div className="text-xl font-extrabold tracking-tighter text-primary truncate max-w-[150px]">
             {settings.siteName || title}
           </div>
        </div>
        {/* Search Bar */}
        <div className="hidden sm:flex items-center bg-surface-container rounded-xl px-4 py-2 border border-outline-variant transition-all min-w-[280px] focus-within:ring-2 focus-within:ring-primary/10">
          <span className="material-symbols-outlined text-on-surface-variant/50 mr-2">search</span>
          <input className="bg-transparent border-none outline-none text-sm w-full font-body text-on-surface placeholder:text-on-surface-variant/40 focus:ring-0" placeholder="Search resources..." type="text" />
        </div>
      </div>

      {/* Trailing Actions */}
      <div className="flex items-center gap-2 relative">
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container transition-colors duration-200 w-10 h-10 flex items-center justify-center"
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          <span className="material-symbols-outlined">{theme === 'light' ? 'dark_mode' : 'light_mode'}</span>
        </button>

        <button 
          onClick={() => {
            setNotificationsOpen(!notificationsOpen);
            setProfileOpen(false);
          }}
          className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container transition-colors duration-200 relative w-10 h-10 flex items-center justify-center"
        >
          <span className="material-symbols-outlined">notifications</span>
        </button>

        <ExtractedProfileMenu 
          open={profileOpen} 
          setOpen={setProfileOpen} 
          setNotificationsOpen={setNotificationsOpen} 
          onSignOut={handleSignOut}
          user={user}
        />
      </div>
    </header>
    </>
  );
}

interface ProfileMenuProps {
  open: boolean;
  setOpen: (o: boolean) => void;
  setNotificationsOpen: (o: boolean) => void;
  onSignOut: () => void;
  user: any;
}

function ExtractedProfileMenu({ open, setOpen, setNotificationsOpen, onSignOut, user }: ProfileMenuProps) {
  return (
    <>
      <button 
        onClick={() => {
          setOpen(!open);
          setNotificationsOpen(false);
        }}
        className="w-10 h-10 rounded-xl ml-1 overflow-hidden border border-outline-variant shadow-sm transition-transform active:scale-95 bg-surface-container"
      >
        <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
            {user?.email?.[0].toUpperCase()}
        </div>
      </button>

      {open && (
        <div className="absolute top-12 right-0 w-64 bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant py-2 z-50 transition-all">
          <div className="px-4 py-3 border-b border-outline-variant/10 mb-1">
            <p className="font-bold text-on-surface truncate text-sm">{user?.fullName || 'User'}</p>
            <p className="text-[10px] text-on-surface-variant/60 truncate font-medium lowercase">{user?.email}</p>
          </div>
          <Link to="/settings" className="flex items-center gap-3 px-4 py-2.5 hover:bg-surface-container transition-colors text-xs font-bold text-on-surface-variant uppercase tracking-widest">
            <span className="material-symbols-outlined text-[18px]">account_circle</span>
            Profile
          </Link>
          <div className="h-px bg-outline-variant/10 my-1"></div>
          <button 
            onClick={onSignOut}
            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-error/5 transition-colors text-xs font-bold text-error uppercase tracking-widest"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            Sign out
          </button>
        </div>
      )}
    </>
  );
}
