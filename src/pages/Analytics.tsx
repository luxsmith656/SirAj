import React from 'react';
import AdminLayout from '../components/AdminLayout';

export default function Analytics() {
  return (
    <AdminLayout title="Student Analytics">
      <div className="p-8 md:p-12 max-w-7xl mx-auto space-y-12 pb-24">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
               <div>
                  <h1 className="text-4xl md:text-5xl font-extrabold font-headline text-primary tracking-tighter mb-2">Performance</h1>
                  <p className="text-lg text-on-surface-variant max-w-xl font-body">Deep dive into cohort mastery across subjects and module progression velocity.</p>
               </div>
               <div className="flex bg-surface-container-low rounded-full p-1.5 ambient-shadow">
                  <button className="px-8 py-3 rounded-full bg-surface-container-lowest text-primary font-bold shadow-sm text-xs uppercase tracking-widest">Global</button>
                  <button className="px-8 py-3 rounded-full text-on-surface-variant font-bold hover:text-on-surface transition-all text-xs uppercase tracking-widest">Individual</button>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
               <div className="bg-surface-container-low rounded-xl p-8 ghost-border ambient-shadow relative overflow-hidden group">
                  <div className="flex justify-between items-start mb-6">
                     <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-[24px]">groups</span>
                     </div>
                     <span className="text-[10px] font-bold text-secondary bg-secondary/10 px-2 py-1 rounded-full uppercase">+4.2%</span>
                  </div>
                  <div>
                     <h3 className="text-4xl font-extrabold font-headline text-primary tracking-tighter mb-1">2,845</h3>
                     <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">Active Candidates</p>
                  </div>
               </div>
               
               <div className="bg-surface-container-low rounded-xl p-8 ghost-border relative overflow-hidden group">
                  <div className="flex justify-between items-start mb-6">
                     <div className="w-12 h-12 rounded-full bg-secondary/10 text-secondary flex items-center justify-center">
                        <span className="material-symbols-outlined text-[24px]">timer</span>
                     </div>
                  </div>
                  <div>
                     <h3 className="text-4xl font-extrabold font-headline text-primary tracking-tighter mb-1">42<span className="text-xl">m</span></h3>
                     <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">Engagement Avg.</p>
                  </div>
               </div>

               <div className="bg-surface-container-lowest rounded-xl p-8 shadow-lg ghost-border relative overflow-hidden group border-2 border-primary/5">
                  <div className="flex justify-between items-start mb-6">
                     <div className="w-12 h-12 rounded-full bg-primary primary-gradient text-white flex items-center justify-center ambient-shadow">
                        <span className="material-symbols-outlined text-[24px]">verified</span>
                     </div>
                  </div>
                  <div>
                     <h3 className="text-4xl font-extrabold font-headline text-primary tracking-tighter mb-1">78<span className="text-xl">%</span></h3>
                     <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">Mastery Level</p>
                  </div>
                  <div className="w-full bg-surface-container-high mt-4 h-2 rounded-full overflow-hidden">
                     <div className="w-[78%] h-full bg-secondary rounded-full shadow-[0_0_8px_rgba(0,107,95,0.4)] transition-all duration-1000"></div>
                  </div>
               </div>

               <div className="bg-surface-container-low rounded-xl p-8 ghost-border relative overflow-hidden group">
                  <div className="flex justify-between items-start mb-6">
                     <div className="w-12 h-12 rounded-full bg-error/10 text-error flex items-center justify-center animate-pulse">
                        <span className="material-symbols-outlined text-[24px]">warning</span>
                     </div>
                  </div>
                  <div>
                     <h3 className="text-4xl font-extrabold font-headline text-primary tracking-tighter mb-1">12</h3>
                     <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">Needs Assistance</p>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <div className="bg-surface-container-lowest rounded-xl p-10 ambient-shadow ghost-border">
                  <h3 className="text-2xl font-extrabold font-headline mb-10 text-primary tracking-tight">Mastery Distribution</h3>
                  <div className="space-y-8">
                     {[
                       { label: 'Professional Education', value: 82, color: 'bg-secondary' },
                       { label: 'General Education', value: 75, color: 'bg-primary' },
                       { label: 'Major: Mathematics', value: 58, color: 'bg-error' }
                     ].map((item) => (
                        <div key={item.label}>
                           <div className="flex justify-between text-sm mb-3 font-bold text-on-surface tracking-tight">
                              <span>{item.label}</span>
                              <span className={item.value < 60 ? 'text-error' : 'text-primary'}>{item.value}%</span>
                           </div>
                           <div className="w-full bg-surface-container-low h-3 rounded-full overflow-hidden">
                              <div className={`h-full ${item.color} rounded-full transition-all duration-1000`} style={{ width: `${item.value}%` }}></div>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="bg-surface-container-low rounded-xl p-10 ghost-border flex flex-col">
                  <h3 className="text-2xl font-extrabold font-headline mb-10 text-primary tracking-tight">Focus Points</h3>
                  <div className="space-y-4 flex-1">
                     <div className="flex gap-5 p-5 bg-surface-container-lowest rounded-2xl ambient-shadow hover:scale-[1.02] transition-all cursor-pointer group">
                        <div className="w-14 h-14 rounded-xl bg-error/10 flex flex-col items-center justify-center shrink-0 border border-error/10">
                           <span className="text-[9px] uppercase font-heavy tracking-tighter text-error">Success</span>
                           <span className="text-lg font-black text-error">22%</span>
                        </div>
                        <div>
                           <p className="text-sm font-bold text-on-surface mb-2 leading-tight group-hover:text-primary transition-colors">Vygotsky's socio-cultural theory application in classroom...</p>
                           <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest bg-surface-container-low px-2 py-1 rounded">Module: PED-102</span>
                        </div>
                     </div>
                  </div>
                  <button className="w-full mt-8 py-4 rounded-full bg-surface-container-lowest text-primary font-bold text-sm uppercase tracking-widest ambient-shadow hover:bg-primary hover:text-white transition-all active:scale-95">
                     Open Detailed Audit
                  </button>
               </div>
            </div>
         </div>
    </AdminLayout>
  );
}
