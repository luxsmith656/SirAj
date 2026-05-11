import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useSidebar } from '../context/SidebarContext';

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="bg-surface text-on-surface font-body min-h-screen flex antialiased">
      <Sidebar />
      <main className={`flex-1 flex flex-col relative min-h-screen transition-all duration-300 ${isCollapsed ? 'md:ml-[80px]' : 'md:ml-[280px]'}`}>
        <Topbar title={title} />
        {children}
      </main>
    </div>
  );
}
