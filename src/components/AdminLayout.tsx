import React, { ReactNode, useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useSidebar } from '../context/SidebarContext';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { seedDatabase } from '../lib/db-seed';

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const { isCollapsed } = useSidebar();
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    // Shared auto-seed logic for any admin page if the platform is empty or incomplete
    const unsub = onSnapshot(collection(db, 'categories'), (snapshot) => {
      // If we have fewer than 3 categories, it's likely a fresh or broken install
      if (snapshot.size < 3 && !isSeeding) {
        setIsSeeding(true);
        console.log('Admin Platform: Data missing or incomplete. Initializing preset data...');
        seedDatabase()
          .then(() => console.log('System initialized with preset curriculum and questions.'))
          .catch(err => {
            console.error('Admin Platform: Initialization failed:', err);
          })
          .finally(() => setIsSeeding(false));
      }
    });

    return () => unsub();
  }, [isSeeding]);

  return (
    <div className="bg-slate-50 text-slate-800 font-body min-h-screen flex antialiased">
      <Sidebar />
      <main className={`flex-1 flex flex-col relative min-h-screen transition-all duration-300 ${isCollapsed ? 'md:ml-[80px]' : 'md:ml-[280px]'}`}>
        <Topbar title={title} />
        {isSeeding && (
          <div className="bg-blue-600 text-white text-[10px] font-bold uppercase tracking-[0.2em] py-1 text-center animate-pulse z-50">
            System Initializing: Seeding Preset Curriculum & Questions...
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
