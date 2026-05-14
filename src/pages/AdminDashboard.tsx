import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { seedDatabase } from '../lib/db-seed';

export default function Dashboard() {
  const [counts, setCounts] = useState({
    users: 0,
    questions: 0,
    categories: 0
  });

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, 'users'), (s) => {
      setCounts(prev => ({ ...prev, users: s.size }));
    });
    const unsubQs = onSnapshot(collection(db, 'questions'), (s) => {
      setCounts(prev => ({ ...prev, questions: s.size }));
    });
    const unsubCats = onSnapshot(collection(db, 'categories'), (s) => {
      setCounts(prev => ({ ...prev, categories: s.size }));
    });
    return () => { unsubUsers(); unsubQs(); unsubCats(); };
  }, []);

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 flex-1 overflow-y-auto space-y-6 max-w-[1400px] mx-auto w-full relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-container py-4">
            <div>
              <h1 className="font-headline text-2xl font-extrabold text-on-surface tracking-tight">System Overview</h1>
              <div className="flex items-center gap-2">
                <p className="font-body text-[11px] font-bold text-on-surface-variant/60 uppercase tracking-widest">Real-time Platform Monitoring</p>
              </div>
            </div>
            <div className="flex gap-3">
               <button 
                onClick={async (e) => {
                  e.preventDefault();
                  try {
                    const confirmed = window.confirm('Populate database with curriculum seed data?');
                    if (confirmed) {
                      console.log('Seeding database...');
                      await seedDatabase();
                      window.alert('Database seeded successfully!');
                    }
                  } catch (e: any) {
                    console.error('Seed Error:', e);
                    window.alert('Error seeding database: ' + e.message);
                  }
                }}
                className="bg-surface-container-lowest border border-outline-variant px-5 py-2.5 rounded-2xl text-xs font-bold text-on-surface hover:bg-surface-container transition-all flex items-center gap-2 shadow-sm active:scale-95 cursor-pointer z-20"
               >
                 <span className="material-symbols-outlined text-[18px]">database</span>
                 Seed Database
               </button>
               <button className="bg-primary px-6 py-2.5 rounded-2xl text-xs font-bold text-on-primary shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">Export Reports</button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-2">
            <div className="bg-primary rounded-3xl p-5 text-on-primary relative overflow-hidden flex flex-col justify-between min-h-[140px] shadow-2xl shadow-primary/20">
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-3xl"></div>
              <p className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-on-primary/70">Users Registered</p>
              <div className="relative z-10 flex items-end justify-between">
                <div className="font-headline text-4xl font-extrabold tracking-tighter">{counts.users}</div>
                <div className="bg-white/10 rounded-full px-3 py-1 backdrop-blur-md flex items-center gap-1.5 border border-white/10">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                  <span className="text-[10px] font-bold text-on-primary uppercase tracking-widest">Live</span>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-3xl p-5 relative overflow-hidden flex flex-col justify-between min-h-[140px] border border-outline-variant/30 shadow-sm transition-all hover:border-primary/50 group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <span className="material-symbols-outlined text-4xl text-primary">quiz</span>
              </div>
              <p className="font-body text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-[0.2em]">Questions Bank</p>
              <div className="relative z-10 flex items-end justify-between">
                <div className="font-headline text-4xl font-extrabold text-on-surface tracking-tighter">{counts.questions}</div>
                <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary/40 group-hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-[18px]">trending_up</span>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-3xl p-5 relative flex flex-col justify-between min-h-[140px] border border-outline-variant/30 shadow-sm transition-all hover:border-primary/50 group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <span className="material-symbols-outlined text-4xl text-primary">book</span>
              </div>
              <p className="font-body text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-[0.2em]">Curriculum Domains</p>
              <div className="relative z-10">
                <div className="font-headline text-4xl font-extrabold text-on-surface tracking-tighter">{counts.categories}</div>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-3xl p-5 relative flex flex-col justify-between min-h-[140px] border border-outline-variant/30 shadow-sm transition-all hover:border-primary/50 group">
              <p className="font-body text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-[0.2em]">System Health</p>
              <div className="relative z-10 flex items-end justify-between">
                <div className="font-headline text-4xl font-extrabold text-emerald-500 tracking-tighter">Optimal</div>
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <span className="material-symbols-outlined text-[24px]">verified</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-surface-container-lowest rounded-3xl p-6 shadow-sm border border-outline-variant/30">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="font-headline text-lg font-extrabold text-on-surface tracking-tight">Active Usage</h2>
                  <p className="text-[11px] text-on-surface-variant/40 font-bold uppercase tracking-widest">Student engagement weekly</p>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-surface-container rounded-full"></div><span className="text-[10px] font-bold uppercase text-on-surface-variant/40">Previous</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-primary rounded-full"></div><span className="text-[10px] font-bold uppercase text-on-surface-variant/40">Current</span></div>
                </div>
              </div>
              <div className="h-[200px] w-full relative flex items-end gap-3 pb-6 border-b border-outline-variant/5">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1.5 group relative">
                    <div className="w-full bg-surface-container rounded-t-lg h-[40%] transition-colors group-hover:bg-surface-container/80"></div>
                    <div className="w-full bg-primary rounded-t-lg h-[65%] transition-colors group-hover:opacity-80"></div>
                    <span className="text-[10px] text-on-surface-variant/40 font-bold mt-2">{day}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-sm border border-outline-variant/30">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-headline text-lg font-extrabold text-on-surface tracking-tight">Recent Activity</h2>
                <button className="text-primary font-bold text-[11px] uppercase tracking-widest hover:underline">View All</button>
              </div>
              <div className="space-y-5">
                {[
                  { text: 'Professional Education module updated', time: '2h', color: 'bg-blue-500' },
                  { text: 'Server sync process completed', time: '5h', color: 'bg-emerald-500' },
                  { text: 'Bulk student import successful', time: '8h', color: 'bg-purple-500' },
                  { text: 'Database backup stored', time: '1d', color: 'bg-amber-500' },
                ].map((act, i) => (
                  <div key={i} className="flex gap-4 items-center">
                    <div className={`w-1.5 h-6 rounded-full ${act.color}`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-on-surface truncate leading-tight mb-0.5">{act.text}</p>
                      <p className="text-[10px] text-on-surface-variant/40 font-medium tracking-tight leading-none">{act.time} ago</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 pb-20">
            <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-sm border border-outline-variant/30">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-headline text-lg font-extrabold text-on-surface tracking-tight">Pending User Approvals</h2>
                <button className="text-primary font-bold text-[11px] uppercase tracking-widest hover:underline">Manage</button>
              </div>
              <div className="space-y-4">
                 {[
                   { name: 'Juan Dela Cruz', email: 'juan@example.com', role: 'Instructor' },
                   { name: 'Maria Clara', email: 'maria@example.com', role: 'Instructor' },
                   { name: 'Jose Rizal', email: 'jose@example.com', role: 'Admin' }
                 ].map((pending, i) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-surface-container/20 rounded-2xl border border-outline-variant/10 hover:border-primary/20 transition-all transition-colors">
                       <div>
                          <p className="font-bold text-sm text-on-surface">{pending.name}</p>
                          <p className="text-xs text-on-surface-variant/60">{pending.email} • <span className="font-semibold text-primary">{pending.role}</span></p>
                       </div>
                       <div className="flex gap-2">
                          <button className="p-2 text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-xl transition-colors"><span className="material-symbols-outlined text-[18px]">check</span></button>
                          <button className="p-2 text-error bg-error/10 hover:bg-error/20 rounded-xl transition-colors"><span className="material-symbols-outlined text-[18px]">close</span></button>
                       </div>
                    </div>
                 ))}
                 <button className="w-full text-center text-xs font-bold text-on-surface-variant/40 uppercase tracking-widest mt-2 py-3 hover:bg-surface-container/40 rounded-xl transition-all">View All 12 Pending</button>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-sm border border-outline-variant/30">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-headline text-lg font-extrabold text-on-surface tracking-tight">Content Approvals</h2>
                 <button className="text-primary font-bold text-[11px] uppercase tracking-widest hover:underline">Review AI Drafts</button>
              </div>
              <div className="space-y-4">
                 {[
                   { title: '15 Questions on Child Dev', author: 'AI Drafter', status: 'Pending Review' },
                   { title: 'New Module: Assessment of Learning', author: 'Inst. Cruz', status: 'Pending Review' },
                 ].map((content, i) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-tertiary-container/5 rounded-2xl border border-outline-variant/10 hover:border-tertiary/20 transition-all">
                       <div className="flex-1 min-w-0 pr-4">
                          <p className="font-bold text-sm text-on-surface truncate">{content.title}</p>
                          <p className="text-xs text-on-surface-variant/60">By {content.author} • {content.status}</p>
                       </div>
                       <div className="flex gap-2 shrink-0">
                          <button className="px-4 py-2 text-xs font-bold text-on-tertiary-container bg-tertiary-container/10 hover:bg-tertiary-container/20 rounded-xl transition-colors">Review</button>
                       </div>
                    </div>
                 ))}
                 <div className="p-4 bg-surface-container/30 rounded-2xl border border-outline-variant/10 flex items-center justify-center text-sm font-bold text-on-surface-variant/20 italic">
                    No other pending content
                 </div>
              </div>
            </div>
          </div>
        </div>
    </AdminLayout>
  );
}
