import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSidebar } from '../context/SidebarContext';
import { useBranding } from '../context/BrandingContext';

export default function InstructorSidebar() {
  const location = useLocation();
  const { isOpen, toggle, isCollapsed, toggleCollapse } = useSidebar();
  const { settings } = useBranding();

  const navItems = [
    { name: 'Dashboard', path: '/instructor/dashboard', icon: 'dashboard' },
    { name: 'Classes', path: '/instructor/classes', icon: 'groups' },
    { name: 'Questions', path: '/instructor/questions', icon: 'quiz' },
    { name: 'Bulk Upload', path: '/instructor/bulk-upload', icon: 'upload_file' },
    { name: 'Modules', path: '/instructor/modules', icon: 'book' },
    { name: 'Students', path: '/instructor/students', icon: 'person_search' },
    { name: 'AI Drafts', path: '/instructor/ai-drafts', icon: 'smart_toy' },
    { name: 'Analytics', path: '/instructor/analytics', icon: 'bar_chart' },
  ];

  const renderLogo = () => {
    if (settings.logo.startsWith('http') || settings.logo.startsWith('data:')) {
      return <img src={settings.logo} alt="Logo" className="w-8 h-8 object-contain" />;
    }
    return <span className="material-symbols-outlined text-[24px]">{settings.logo || 'school'}</span>;
  };

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
          <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-sm shrink-0 overflow-hidden">
            {renderLogo()}
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <div className="font-extrabold text-primary text-[20px] tracking-tight leading-tight truncate">{settings.siteName}</div>
              <div className="text-[11px] text-slate-500 font-medium font-body mt-0.5 truncate uppercase tracking-wider">Instructor Panel</div>
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
                    ? 'bg-white text-primary font-bold shadow-sm' 
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
          {/* Desktop Collapse Toggle */}
          <button 
            onClick={toggleCollapse}
            className="hidden md:flex w-full items-center justify-center p-3 text-slate-400 hover:text-primary hover:bg-slate-200/50 rounded-2xl transition-all"
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
