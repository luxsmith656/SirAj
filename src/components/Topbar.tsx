import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSidebar } from '../context/SidebarContext';

interface TopbarProps {
  title?: string;
}

export default function Topbar({ title = 'Scholarly Reviewer' }: TopbarProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { toggle } = useSidebar();
  const navigate = useNavigate();

  return (
    <header className="flex justify-between items-center w-full px-8 h-16 glass-header sticky top-0 z-40 shadow-sm shadow-blue-900/5 transition-all">
      <div className="flex items-center gap-4">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="text-on-surface-variant hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-container-low"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        
        {/* Mobile Menu Toggle (only on mobile) */}
        <button 
          onClick={toggle}
          className="md:hidden text-on-surface-variant p-2 rounded-full hover:bg-surface-container-high transition-colors focus:outline-none"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>

        <div className="text-xl font-extrabold text-primary tracking-tighter font-headline">
          {title}
        </div>
      </div>

      <div className="flex items-center gap-6 flex-1 max-w-xl mx-4">
        {/* Global Search Bar */}
        <div className="relative w-full group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-on-surface-variant group-focus-within:text-primary transition-colors">
            <span className="material-symbols-outlined text-[20px]">search</span>
          </div>
          <input 
            type="text" 
            placeholder="Search repository, students, or analytics..."
            className="w-full bg-surface-container-low border-none rounded-full py-2.5 pl-12 pr-4 text-sm font-bold text-primary ambient-shadow-sm focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-on-surface-variant/40"
          />
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
            <span className="text-[10px] font-black text-on-surface-variant/20 uppercase tracking-widest bg-white rounded px-2 py-0.5 border ghost-border">⌘K</span>
          </div>
        </div>
      </div>

      {/* Trailing Actions */}
      <div className="flex items-center gap-2 relative">
        <button 
          onClick={() => {
            setNotificationsOpen(!notificationsOpen);
            setProfileOpen(false);
          }}
          className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container-low transition-colors duration-200 relative w-10 h-10 flex items-center justify-center"
        >
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-surface-container-lowest"></span>
        </button>

        {notificationsOpen && (
          <div className="absolute top-12 right-12 w-80 bg-surface-container-lowest rounded-2xl shadow-lg border border-outline-variant/10 py-2 z-50 animate-in fade-in zoom-in duration-200">
            <div className="px-4 py-2 border-b border-surface-container-high/50 font-bold text-on-surface flex justify-between items-center">
              <span>Notifications</span>
              <button className="text-xs text-primary font-medium hover:underline">Mark all read</button>
            </div>
            <div className="p-2 space-y-1">
              <div className="px-3 py-2 hover:bg-surface-container-low rounded-xl transition-colors cursor-pointer">
                <p className="text-sm font-medium text-on-surface line-clamp-1">New user registered</p>
                <p className="text-xs text-on-surface-variant mt-0.5">2 mins ago</p>
              </div>
            </div>
          </div>
        )}

        <button 
          className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container-low transition-colors duration-200 w-10 h-10 flex items-center justify-center"
          aria-label="Help Center"
        >
          <span className="material-symbols-outlined">help_outline</span>
        </button>

        <Link to="/settings" className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container-low transition-colors duration-200 w-10 h-10 flex items-center justify-center">
          <span className="material-symbols-outlined">settings</span>
        </Link>

        <ExtractedProfileMenu open={profileOpen} setOpen={setProfileOpen} setNotificationsOpen={setNotificationsOpen} />
      </div>
    </header>
  );
}

function ExtractedProfileMenu({ open, setOpen, setNotificationsOpen }: { open: boolean, setOpen: (o: boolean) => void, setNotificationsOpen: (o: boolean) => void }) {
  return (
    <>
      <button 
        onClick={() => {
          setOpen(!open);
          setNotificationsOpen(false);
        }}
        className="w-10 h-10 rounded-full ml-1 overflow-hidden border border-outline-variant/20 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-transform active:scale-95"
      >
        <img alt="Administrator Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDAwKbH0aIL4IWnrRmSgvV-T1zY-iZ9g3vvSayMrf3zKTRs2YDu90bNYCDqmRDIy1V7MxxknH8iEIKZnSqc-wpPtp7GklcEQAILGB2QGCgPgaBUB09Vr2o3NNPXL_ShgIzMof2IhZ-kVrOvQexTScDa7zCL3rqT_jrt71OefgsN6lsoFFL0kDmshpoIP4bXcAJqTkHIt8O6XV6NQVqe9p728CqyBa9JjtU-Es_amvnc2dHadh1pim0Xon2o5DDEPOzgjFCJua_mKw" />
      </button>

      {open && (
        <div className="absolute top-12 right-0 w-56 bg-surface-container-lowest rounded-2xl shadow-lg border border-outline-variant/10 py-2 z-50">
          <div className="px-4 py-3 border-b border-surface-container-high/50 mb-1">
            <p className="font-bold text-on-surface truncate">Admin User</p>
            <p className="text-xs text-on-surface-variant truncate">admin@letmastery.edu</p>
          </div>
          <Link to="/settings" className="flex items-center gap-3 px-4 py-2 hover:bg-surface-container-low transition-colors text-sm font-medium text-on-surface">
            <span className="material-symbols-outlined text-[20px] text-on-surface-variant">account_circle</span>
            My Profile
          </Link>
          <Link to="/settings" className="flex items-center gap-3 px-4 py-2 hover:bg-surface-container-low transition-colors text-sm font-medium text-on-surface">
            <span className="material-symbols-outlined text-[20px] text-on-surface-variant">settings</span>
            Preferences
          </Link>
          <div className="h-px bg-surface-container-high/50 my-1"></div>
          <Link to="/sign-in" className="flex items-center gap-3 px-4 py-2 hover:bg-error/10 transition-colors text-sm font-medium text-error">
            <span className="material-symbols-outlined text-[20px]">logout</span>
            Sign out
          </Link>
        </div>
      )}
    </>
  );
}
