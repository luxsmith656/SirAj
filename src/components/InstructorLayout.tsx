import React, { ReactNode } from 'react';
import InstructorSidebar from './InstructorSidebar';
import Topbar from './Topbar';
import { useSidebar } from '../context/SidebarContext';

interface InstructorLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function InstructorLayout({ children, title }: InstructorLayoutProps) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="bg-surface text-on-surface font-body min-h-screen flex antialiased transition-colors duration-300">
      <InstructorSidebar />
      <main className={`flex-1 flex flex-col relative min-h-screen transition-all duration-300 ${isCollapsed ? 'md:ml-[80px]' : 'md:ml-[280px]'}`}>
        <Topbar title={title} />
        {children}
      </main>
    </div>
  );
}
