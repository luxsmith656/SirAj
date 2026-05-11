import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSidebar } from '../context/SidebarContext';

export default function Sidebar() {
  const location = useLocation();
  const { isOpen, toggle, isCollapsed, toggleCollapse } = useSidebar();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { name: 'Question Bank', path: '/categories', icon: 'quiz' },
    { name: 'Curriculum', path: '/curriculum-settings', icon: 'menu_book' },
    { name: 'Analytics', path: '/analytics', icon: 'bar_chart' },
    { name: 'Users', path: '/users', icon: 'group' },
    { name: 'Sync', path: '/sync', icon: 'sync' },
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
        fixed left-0 top-0 h-screen bg-surface-container-low text-on-surface font-body text-sm z-[70] transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${isCollapsed ? 'w-[80px]' : 'w-[280px]'}
      `}>
        {/* Header / Brand */}
        <div className={`px-6 mt-8 mb-12 flex items-center transition-all duration-300 ${isCollapsed ? 'justify-center px-0' : 'gap-3'}`}>
          <div className="w-12 h-12 rounded-full primary-gradient text-white flex items-center justify-center ambient-shadow shrink-0">
            <span className="material-symbols-outlined text-[24px]">menu_book</span>
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <div className="font-extrabold text-primary text-[20px] tracking-tighter leading-tight truncate font-headline">Scholarly</div>
              <div className="text-[10px] text-on-surface-variant font-bold mt-0.5 truncate uppercase tracking-widest">Reviewer Pro</div>
            </div>
          )}
          
          {/* Mobile Close Button */}
          <button 
            onClick={toggle}
            className="md:hidden ml-auto p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Navigation Items */}
        <div className={`flex-1 overflow-y-auto space-y-1 ${isCollapsed ? 'px-2' : 'px-4'}`}>
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => { if (isOpen) toggle(); }}
                className={`py-3 flex items-center transition-all duration-300 rounded-xl ${
                  isCollapsed ? 'justify-center px-0' : 'px-4 gap-4'
                } ${
                  isActive 
                    ? 'bg-surface-container-lowest text-primary font-bold ambient-shadow' 
                    : 'text-on-surface-variant font-medium hover:bg-surface-container-lowest/60 hover:text-on-surface'
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
        <div className={`mt-auto pb-10 ${isCollapsed ? 'px-2' : 'px-4'} space-y-4`}>
          <button className={`w-full flex items-center primary-gradient text-white rounded-full font-bold transition-all hover:opacity-90 active:scale-95 shadow-sm ${
            isCollapsed ? 'justify-center p-3' : 'justify-center gap-2 px-4 py-3.5'
          }`}>
            <span className="material-symbols-outlined text-sm">download</span>
            {!isCollapsed && <span className="tracking-tight text-sm">Export Data</span>}
          </button>

          {/* Desktop Collapse Toggle */}
          <button 
            onClick={toggleCollapse}
            className="hidden md:flex w-full items-center justify-center p-3 text-on-surface-variant hover:text-primary hover:bg-surface-container-lowest/60 rounded-2xl transition-all"
          >
            <span className={`material-symbols-outlined transition-transform duration-500 ${isCollapsed ? 'rotate-180' : ''}`}>
              keyboard_double_arrow_left
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}

