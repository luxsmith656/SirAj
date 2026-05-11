import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSidebar } from '../context/SidebarContext';
import { useAuth } from '../context/AuthContext';

interface TopbarProps {
  title?: string;
}

export default function Topbar({ title = 'LET Mastery' }: TopbarProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { toggle } = useSidebar();
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
    navigate('/sign-in');
  };

  return (
    <header className="flex justify-between items-center w-full px-6 py-3 bg-white/80 backdrop-blur-md text-slate-800 font-headline text-sm tracking-tight sticky top-0 z-40 border-b border-slate-100">
      {/* Mobile Menu Toggle & Brand */}
      <div className="flex items-center gap-4">
        <button 
          onClick={toggle}
          className="md:hidden text-slate-500 p-2 rounded-full hover:bg-slate-100 transition-colors focus:outline-none"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <div className="text-xl font-extrabold tracking-tighter text-[#1b366a] md:hidden">
          {title}
        </div>
        {/* Search Bar */}
        <div className="hidden sm:flex items-center bg-slate-50 rounded-xl px-4 py-2 border border-slate-200 transition-all min-w-[280px] focus-within:ring-2 focus-within:ring-[#1b366a]/10">
          <span className="material-symbols-outlined text-slate-400 mr-2">search</span>
          <input className="bg-transparent border-none outline-none text-sm w-full font-body text-slate-700 placeholder:text-slate-400 focus:ring-0" placeholder="Search resources..." type="text" />
        </div>
      </div>

      {/* Trailing Actions */}
      <div className="flex items-center gap-2 relative">
        <button 
          onClick={() => {
            setNotificationsOpen(!notificationsOpen);
            setProfileOpen(false);
          }}
          className="p-2 rounded-full text-slate-400 hover:bg-slate-100 transition-colors duration-200 relative w-10 h-10 flex items-center justify-center"
        >
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        {notificationsOpen && (
          <div className="absolute top-12 right-0 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
            <div className="px-4 py-2 border-b border-slate-50 font-bold text-slate-800 flex justify-between items-center">
              <span className="text-sm">Notifications</span>
              <button className="text-[10px] text-[#1b366a] font-bold uppercase tracking-widest hover:underline">Mark all read</button>
            </div>
            <div className="p-2 space-y-1">
              <div className="px-3 py-2 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer">
                <p className="text-xs font-bold text-slate-700 truncate">System sync completed</p>
                <p className="text-[10px] text-slate-400 font-medium">Just now</p>
              </div>
            </div>
          </div>
        )}

        <button className="p-2 rounded-full text-slate-400 hover:bg-slate-100 transition-colors hidden sm:flex w-10 h-10 items-center justify-center">
          <span className="material-symbols-outlined">help_outline</span>
        </button>

        <ExtractedProfileMenu 
          open={profileOpen} 
          setOpen={setProfileOpen} 
          setNotificationsOpen={setNotificationsOpen} 
          onSignOut={handleSignOut}
          userEmail={user?.email}
        />
      </div>
    </header>
  );
}

interface ProfileMenuProps {
  open: boolean;
  setOpen: (o: boolean) => void;
  setNotificationsOpen: (o: boolean) => void;
  onSignOut: () => void;
  userEmail?: string;
}

function ExtractedProfileMenu({ open, setOpen, setNotificationsOpen, onSignOut, userEmail }: ProfileMenuProps) {
  return (
    <>
      <button 
        onClick={() => {
          setOpen(!open);
          setNotificationsOpen(false);
        }}
        className="w-10 h-10 rounded-xl ml-1 overflow-hidden border border-slate-200 shadow-sm transition-transform active:scale-95"
      >
        <img alt="Administrator Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDAwKbH0aIL4IWnrRmSgvV-T1zY-iZ9g3vvSayMrf3zKTRs2YDu90bNYCDqmRDIy1V7MxxknH8iEIKZnSqc-wpPtp7GklcEQAILGB2QGCgPgaBUB09Vr2o3NNPXL_ShgIzMof2IhZ-kVrOvQexTScDa7zCL3rqT_jrt71OefgsN6lsoFFL0kDmshpoIP4bXcAJqTkHIt8O6XV6NQVqe9p728CqyBa9JjtU-Es_amvnc2dHadh1pim0Xon2o5DDEPOzgjFCJua_mKw" />
      </button>

      {open && (
        <div className="absolute top-12 right-0 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
          <div className="px-4 py-3 border-b border-slate-50 mb-1">
            <p className="font-bold text-slate-800 truncate text-sm">Administrator</p>
            <p className="text-[10px] text-slate-400 truncate font-medium">{userEmail || 'admin@portal.edu'}</p>
          </div>
          <Link to="/settings" className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-xs font-bold text-slate-600 uppercase tracking-widest">
            <span className="material-symbols-outlined text-[18px]">account_circle</span>
            Profile
          </Link>
          <div className="h-px bg-slate-50 my-1"></div>
          <button 
            onClick={onSignOut}
            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors text-xs font-bold text-red-600 uppercase tracking-widest"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            Sign out
          </button>
        </div>
      )}
    </>
  );
}
