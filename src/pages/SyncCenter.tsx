import React, { useState } from 'react';
import AdminLayout from '../components/AdminLayout';

export default function SyncCenter() {
  const [isSyncing, setIsSyncing] = useState(false);

  const triggerSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      alert('Synchronization finalized. Cloud topology updated.');
    }, 2500);
  };

  return (
    <AdminLayout title="Sync Control Center">
      <div className="p-8 md:p-12 max-w-5xl mx-auto space-y-12 pb-24">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
               <div>
                  <h1 className="text-4xl md:text-6xl font-black font-headline text-primary tracking-tighter mb-4 leading-[0.9]">Cloud Synchro</h1>
                  <p className="text-xl text-on-surface-variant max-w-md font-medium leading-relaxed">Seamlessly bridge your offline progress with any primary institutional database.</p>
               </div>
               <button 
                 onClick={triggerSync}
                 disabled={isSyncing}
                 className={`primary-gradient text-white transition-all px-10 py-5 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-2xl hover:shadow-primary/40 active:scale-95 disabled:opacity-50 disabled:pointer-events-none`}
               >
                  <span className={`material-symbols-outlined text-[20px] ${isSyncing ? 'animate-spin' : ''}`}>sync</span> 
                  {isSyncing ? 'Accessing Data Nodes...' : 'Re-Synchronize Master'}
               </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="bg-surface-container-low p-8 rounded-xl ghost-border ambient-shadow transition-all hover:scale-[1.02]">
                  <div className="flex items-center gap-4 mb-6">
                     <div className="w-10 h-10 rounded-full bg-secondary/10 text-secondary flex items-center justify-center">
                        <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>cloud_done</span>
                     </div>
                     <span className="font-label text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Connectivity</span>
                  </div>
                  <p className="text-4xl font-extrabold text-primary tracking-tighter mb-2">Stable</p>
                  <p className="text-xs text-on-surface-variant font-medium">Last sync verified 2m ago</p>
               </div>
               <div className="bg-surface-container-low p-8 rounded-xl ghost-border ambient-shadow transition-all hover:scale-[1.02]">
                  <div className="flex items-center gap-4 mb-6">
                     <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                        <span className="material-symbols-outlined">dataset</span>
                     </div>
                     <span className="font-label text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Awaiting Upload</span>
                  </div>
                  <p className="text-4xl font-extrabold text-primary tracking-tighter mb-2">14</p>
                  <p className="text-xs text-on-surface-variant font-medium">Batched packets ready for transmission</p>
               </div>
               <div className="bg-surface-container-lowest p-8 rounded-xl ghost-border ambient-shadow transition-all hover:scale-[1.02] border-2 border-error/5">
                  <div className="flex items-center gap-4 mb-6">
                     <div className="w-10 h-10 rounded-full bg-error/10 text-error flex items-center justify-center">
                        <span className="material-symbols-outlined">crisis_alert</span>
                     </div>
                     <span className="font-label text-[10px] font-bold text-error uppercase tracking-widest">Attention Needed</span>
                  </div>
                  <p className="text-4xl font-extrabold text-error tracking-tighter mb-2">03</p>
                  <p className="text-xs text-error font-bold">Manual collision resolution required</p>
               </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-10 ghost-border ambient-shadow relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-error/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
               <h3 className="text-2xl font-extrabold font-headline text-primary mb-8 flex items-center gap-3 tracking-tight">
                  <span className="material-symbols-outlined text-error">rule</span>
                  Collision Audit
               </h3>
               
               <div className="space-y-6">
                  <div className="p-6 rounded-2xl bg-surface-container-low/40 flex flex-col lg:flex-row lg:items-center gap-6 relative group overflow-hidden">
                     <div className="absolute left-0 top-0 w-1.5 h-full bg-error transition-all group-hover:w-2"></div>
                     <div className="flex-1 lg:pl-4">
                        <div className="flex items-center gap-3 mb-2">
                           <span className="text-lg font-bold text-primary font-headline tracking-tight">Schema Divergence</span>
                           <span className="text-[10px] bg-white px-2 py-1 rounded-full text-on-surface-variant font-bold uppercase tracking-widest ambient-shadow">QID: 8492A</span>
                        </div>
                        <p className="text-sm text-on-surface-variant font-medium leading-relaxed">Modified locally on Device "Admin-Pad-01" while parallel updates were committed to production server.</p>
                     </div>
                     <div className="flex gap-3 shrink-0 relative z-10">
                        <button className="px-6 py-3 rounded-full bg-surface-container-lowest text-on-surface-variant text-xs font-bold uppercase tracking-widest hover:text-primary transition-all ambient-shadow active:scale-95">Discard Local</button>
                        <button className="px-6 py-3 rounded-full primary-gradient text-white text-xs font-bold uppercase tracking-widest shadow-md active:scale-95">Resolve to Server</button>
                     </div>
                  </div>
               </div>
            </div>
         </div>
    </AdminLayout>
  );
}
