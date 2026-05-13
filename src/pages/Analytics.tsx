import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface MetricData {
  studentCount: number;
  avgPassingScore: number;
}

export default function Analytics() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<MetricData>({ studentCount: 0, avgPassingScore: 78 });
  const [isLoading, setIsLoading] = useState(true);
  const [instructorFilter, setInstructorFilter] = useState('all');
  const [instructors, setInstructors] = useState<{uid: string, fullName: string}[]>([]);

  useEffect(() => {
    // Fetch instructors for admin view
    if (user?.role === 'admin') {
      const q = query(collection(db, 'users'), where('role', '==', 'instructor'));
      onSnapshot(q, (snap) => {
        setInstructors(snap.docs.map(doc => ({ uid: doc.id, fullName: doc.data().fullName || doc.data().email })));
      });
    }

    // Dynamic filtering for metrics
    let q;
    if (user?.role === 'instructor') {
      q = query(collection(db, 'users'), where('instructorId', '==', user.uid), where('role', '==', 'student'));
    } else if (user?.role === 'admin' && instructorFilter !== 'all') {
      q = query(collection(db, 'users'), where('instructorId', '==', instructorFilter), where('role', '==', 'student'));
    } else {
      q = query(collection(db, 'users'), where('role', '==', 'student'));
    }

    const unsubscribe = onSnapshot(q, (snap) => {
      setMetrics(prev => ({
        ...prev,
        studentCount: snap.size
      }));
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user, instructorFilter]);

  return (
    <AdminLayout title="Performance Metrics">
      <div className="p-8 max-w-[1400px] mx-auto space-y-8 text-on-surface">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
               <div>
                  <h1 className="text-3xl font-extrabold text-[#1b366a] font-headline tracking-tight mb-2">Performance Insights</h1>
                  <p className="text-slate-500 font-medium font-body">Analyze {user?.role === 'instructor' ? 'your assigned students\'' : 'platform-wide'} cohort mastery.</p>
               </div>
               
               {user?.role === 'admin' && (
                 <div className="flex bg-slate-100 rounded-xl p-1 border border-slate-200 shadow-sm overflow-hidden">
                    <select 
                      value={instructorFilter}
                      onChange={(e) => setInstructorFilter(e.target.value)}
                      className="bg-transparent border-none outline-none px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#1b366a]"
                    >
                      <option value="all">Global View</option>
                      {instructors.map(inst => (
                        <option key={inst.uid} value={inst.uid}>By: {inst.fullName}</option>
                      ))}
                    </select>
                 </div>
               )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group">
                  <div className="flex justify-between items-start mb-4">
                     <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1b366a] flex items-center justify-center">
                        <span className="material-symbols-outlined text-[20px]">groups</span>
                     </div>
                  </div>
                  <div>
                     <h3 className="text-3xl font-extrabold font-headline text-slate-800 mb-1">{metrics.studentCount}</h3>
                     <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Active Students</p>
                  </div>
               </div>
               
               <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group">
                  <div className="flex justify-between items-start mb-4">
                     <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1b366a] flex items-center justify-center">
                        <span className="material-symbols-outlined text-[20px]">timer</span>
                     </div>
                  </div>
                  <div>
                     <h3 className="text-3xl font-extrabold font-headline text-slate-800 mb-1">42<span className="text-xl">m</span></h3>
                     <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Daily Avg Simulation</p>
                  </div>
               </div>

               <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group">
                  <div className="flex justify-between items-start mb-4">
                     <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[20px]">check_circle</span>
                     </div>
                  </div>
                  <div>
                     <h3 className="text-3xl font-extrabold font-headline text-slate-800 mb-1">{metrics.avgPassingScore}<span className="text-xl">%</span></h3>
                     <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Avg Passing Score</p>
                  </div>
                  <div className="w-full bg-slate-100 mt-4 h-1.5 rounded-full overflow-hidden">
                     <div style={{ width: `${metrics.avgPassingScore}%` }} className="h-full bg-emerald-500 rounded-full"></div>
                  </div>
               </div>

               <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group">
                  <div className="flex justify-between items-start mb-4">
                     <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1b366a] flex items-center justify-center">
                        <span className="material-symbols-outlined text-[20px]">psychology</span>
                     </div>
                  </div>
                  <div>
                     <h3 className="text-3xl font-extrabold font-headline text-slate-800 mb-1">High</h3>
                     <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Mastery Level</p>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
               <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
                  <h3 className="text-xl font-extrabold font-headline mb-6 text-slate-800">Mastery by Subject Area</h3>
                  <div className="space-y-6">
                     <div>
                        <div className="flex justify-between text-xs mb-2 font-bold uppercase tracking-widest">
                           <span className="text-slate-400">Professional Education</span>
                           <span className="text-[#1b366a]">82%</span>
                        </div>
                        <div className="w-full bg-slate-50 h-2.5 rounded-full overflow-hidden border border-slate-100">
                           <div className="h-full bg-[#1b366a] w-[82%] rounded-full shadow-lg shadow-blue-900/20"></div>
                        </div>
                     </div>
                     <div>
                        <div className="flex justify-between text-xs mb-2 font-bold uppercase tracking-widest">
                           <span className="text-slate-400">General Education</span>
                           <span className="text-[#1b366a]">75%</span>
                        </div>
                        <div className="w-full bg-slate-50 h-2.5 rounded-full overflow-hidden border border-slate-100">
                           <div className="h-full bg-blue-400 w-[75%] rounded-full shadow-lg shadow-blue-400/20"></div>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
                  <h3 className="text-xl font-extrabold font-headline mb-6 text-slate-800">Difficult Concepts</h3>
                  <div className="space-y-4">
                     <div className="flex gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/30 hover:border-blue-200 transition-all cursor-pointer group">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1b366a] flex flex-col items-center justify-center shrink-0 border border-blue-100">
                           <span className="text-[9px] uppercase font-bold">Accuracy</span>
                           <span className="text-sm font-black">22%</span>
                        </div>
                        <div>
                           <p className="text-sm font-bold text-slate-700 mb-1 group-hover:text-[#1b366a] transition-colors">Vygotsky's Zone of Proximal Development</p>
                           <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Professional Education</span>
                        </div>
                     </div>
                  </div>
                  <button className="w-full mt-6 py-4 rounded-xl bg-slate-50 text-slate-400 font-bold text-[11px] uppercase tracking-widest hover:bg-slate-100 hover:text-slate-600 transition-all">
                     View Deep Analysis
                  </button>
               </div>
            </div>
         </div>
    </AdminLayout>
  );
}
