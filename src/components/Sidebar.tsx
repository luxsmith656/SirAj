import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSidebar } from '../context/SidebarContext';

export default function Sidebar() {
  const location = useLocation();
  const { isOpen, toggle, isCollapsed, toggleCollapse } = useSidebar();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { name: 'Curriculum', path: '/categories', icon: 'menu_book' },
    { name: 'Question Bank', path: '/question/bank', icon: 'quiz' },
    { name: 'Analytics', path: '/analytics', icon: 'bar_chart' },
    { name: 'Users', path: '/users', icon: 'group' },
    { name: 'Settings', path: '/settings', icon: 'settings' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-[60] md:hidden"
          onClick={toggle}
        ></div>
      )}

      {/* Sidebar Container */}
      <nav className={`
        fixed left-0 top-0 h-screen bg-[#f4f6f8] text-slate-800 font-body text-sm border-r border-slate-200 z-[70] transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${isCollapsed ? 'w-[80px]' : 'w-[280px]'}
      `}>
        {/* Header / Brand */}
        <div className={`px-6 mt-8 mb-10 flex items-center transition-all duration-300 ${isCollapsed ? 'justify-center px-0' : 'gap-3'}`}>
          <div className="w-12 h-12 rounded-full bg-[#1b366a] text-white flex items-center justify-center shadow-sm shrink-0">
            <span className="material-symbols-outlined text-[24px]">menu_book</span>
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <div className="font-extrabold text-[#1b366a] text-[20px] tracking-tight leading-tight truncate">LET Mastery</div>
              <div className="text-[11px] text-slate-500 font-medium font-body mt-0.5 truncate uppercase tracking-wider">Admin Control Panel</div>
            </div>
          )}
          
          {/* Mobile Close Button */}
          <button 
            onClick={toggle}
            className="md:hidden ml-auto p-2 text-slate-500 hover:bg-slate-200 rounded-full"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Navigation Items */}
        <div className={`flex-1 overflow-y-auto space-y-2 ${isCollapsed ? 'px-2' : 'px-4'}`}>
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => { if (isOpen) toggle(); }}
                className={`py-3.5 flex items-center transition-all duration-200 rounded-2xl ${
                  isCollapsed ? 'justify-center px-0' : 'px-4 gap-4'
                } ${
                  isActive 
                    ? 'bg-white text-[#1b366a] font-bold shadow-sm' 
                    : 'text-slate-600 font-medium hover:bg-slate-200/50 hover:text-slate-900'
                }`}
                title={isCollapsed ? item.name : ''}
              >
                <span 
                  className="material-symbols-outlined text-[22px]" 
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {item.icon}
                </span>
                {!isCollapsed && <span className="text-[15px] tracking-tight">{item.name}</span>}
              </Link>
            );
          })}
        </div>

        {/* Bottom Actions & Collapse Toggle */}
        <div className={`mt-auto pb-8 ${isCollapsed ? 'px-2' : 'px-4'} space-y-4`}>
          <button className={`w-full flex items-center bg-[#1b366a] text-white rounded-full font-bold transition-all hover:bg-[#112349] hover:shadow-lg focus:outline-none ${
            isCollapsed ? 'justify-center p-3' : 'justify-center gap-2 px-4 py-3'
          }`}>
            <span className="material-symbols-outlined text-sm">download</span>
            {!isCollapsed && <span>Export Reports</span>}
          </button>

          {/* Desktop Collapse Toggle */}
          <button 
            onClick={toggleCollapse}
            className="hidden md:flex w-full items-center justify-center p-3 text-slate-400 hover:text-[#1b366a] hover:bg-slate-200/50 rounded-2xl transition-all"
          >
            <span className={`material-symbols-outlined transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}>
              keyboard_double_arrow_left
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}

