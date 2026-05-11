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
      <div className="p-4 md:p-6 flex-1 overflow-y-auto space-y-6 max-w-[1400px] mx-auto w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h1 className="font-headline text-2xl font-extrabold text-slate-800 tracking-tight">System Overview</h1>
              <div className="flex items-center gap-2">
                <p className="font-body text-[11px] font-bold text-slate-400 uppercase tracking-widest">Real-time Platform Monitoring</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#1b366a] rounded-2xl p-4 text-white relative overflow-hidden flex flex-col justify-between min-h-[120px] shadow-sm">
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <span className="material-symbols-outlined text-4xl">group</span>
              </div>
              <p className="font-body text-[10px] font-bold uppercase tracking-widest text-white/70">Users Registered</p>
              <div className="relative z-10 flex items-end justify-between">
                <div className="font-headline text-3xl font-extrabold tracking-tighter">{counts.users}</div>
                <div className="bg-white/10 rounded-full px-2 py-0.5 backdrop-blur-md flex items-center gap-1 border border-white/10">
                  <span className="text-[10px] font-bold text-white">Live</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 relative overflow-hidden flex flex-col justify-between min-h-[120px] border border-slate-200 shadow-sm">
              <div className="absolute top-0 right-0 p-3 opacity-5">
                <span className="material-symbols-outlined text-4xl text-blue-600">quiz</span>
              </div>
              <p className="font-body text-[10px] font-bold text-slate-500 uppercase tracking-widest">Questions Bank</p>
              <div className="relative z-10 flex items-end justify-between">
                <div className="font-headline text-3xl font-extrabold text-slate-800 tracking-tighter">{counts.questions}</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 relative flex flex-col justify-between min-h-[120px] border border-slate-200 shadow-sm">
              <div className="absolute top-0 right-0 p-3 opacity-5">
                <span className="material-symbols-outlined text-4xl text-blue-600">book</span>
              </div>
              <p className="font-body text-[10px] font-bold text-slate-500 uppercase tracking-widest">Curriculum Domains</p>
              <div className="relative z-10">
                <div className="font-headline text-3xl font-extrabold text-slate-800 tracking-tighter mb-2">{counts.categories}</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 relative flex flex-col justify-between min-h-[120px] border border-slate-200 shadow-sm">
              <p className="font-body text-[10px] font-bold text-slate-500 uppercase tracking-widest">System Health</p>
              <div className="relative z-10 flex items-end justify-between">
                <div className="font-headline text-3xl font-extrabold text-emerald-600 tracking-tighter uppercase">Optimal</div>
                <span className="material-symbols-outlined text-emerald-500">check_circle</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="font-headline text-lg font-extrabold text-slate-800 tracking-tight">Active Usage</h2>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Student engagement weekly</p>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-blue-100 rounded-full"></div><span className="text-[10px] font-bold uppercase text-slate-400">Previous</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-[#1b366a] rounded-full"></div><span className="text-[10px] font-bold uppercase text-slate-400">Current</span></div>
                </div>
              </div>
              <div className="h-[200px] w-full relative flex items-end gap-3 pb-6 border-b border-slate-50">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1.5 group relative">
                    <div className="w-full bg-blue-50 rounded-t-lg h-[40%] transition-colors group-hover:bg-blue-100"></div>
                    <div className="w-full bg-[#1b366a] rounded-t-lg h-[65%] transition-colors group-hover:bg-[#112349]"></div>
                    <span className="text-[10px] text-slate-400 font-bold mt-2">{day}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-headline text-lg font-extrabold text-slate-800 tracking-tight">Recent Activity</h2>
                <button className="text-[#1b366a] font-bold text-[11px] uppercase tracking-widest hover:underline">View All</button>
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
                      <p className="text-[13px] font-bold text-slate-700 truncate leading-tight mb-0.5">{act.text}</p>
                      <p className="text-[10px] text-slate-400 font-medium tracking-tight leading-none">{act.time} ago</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
    </AdminLayout>
  );
}
