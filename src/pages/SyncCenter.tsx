import React from 'react';

export default function SyncCenter() {
  return (
    <div className="bg-surface text-on-surface font-body min-h-screen flex antialiased">
       <nav className="hidden md:flex w-64 bg-surface-container-lowest h-screen fixed z-50 p-6 shadow-sm">
        <h1 className="text-xl font-bold font-headline text-primary-container tracking-tighter">Scholarly Reviewer</h1>
      </nav>

      <main className="flex-1 md:ml-64 bg-surface/50 min-h-screen">
         <header className="h-16 flex items-center px-8 bg-surface-container-lowest border-b border-surface-container sticky top-0 z-40 shadow-sm">
            <h2 className="text-lg font-headline font-semibold">Sync Control Center</h2>
         </header>

         <div className="p-8 max-w-5xl mx-auto py-12">
            <div className="flex justify-between items-end mb-8">
               <div>
                  <h1 className="text-3xl font-extrabold font-headline mb-2">Offline Sync</h1>
                  <p className="text-on-surface-variant">Monitor and manage data synchronization across devices.</p>
               </div>
               <button className="bg-surface-container-highest text-on-surface hover:bg-surface-container transition-colors px-4 py-2 rounded-full font-semibold flex items-center gap-2 text-sm shadow-sm">
                  <span className="material-symbols-outlined text-[18px]">refresh</span> Force Master Sync
               </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
               <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/10">
                  <div className="flex items-center gap-3 mb-2">
                     <span className="material-symbols-outlined text-secondary">cloud_done</span>
                     <h3 className="font-headline font-bold text-on-surface">Last Sync Status</h3>
                  </div>
                  <p className="text-2xl font-black text-on-surface mb-1">Success</p>
                  <p className="text-xs text-on-surface-variant">2 minutes ago</p>
               </div>
               <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/10">
                  <div className="flex items-center gap-3 mb-2">
                     <span className="material-symbols-outlined text-primary">data_usage</span>
                     <h3 className="font-headline font-bold text-on-surface">Pending Payloads</h3>
                  </div>
                  <p className="text-2xl font-black text-on-surface mb-1">14</p>
                  <p className="text-xs text-on-surface-variant">Awaiting device connection</p>
               </div>
               <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/10">
                  <div className="flex items-center gap-3 mb-2">
                     <span className="material-symbols-outlined text-error">cloud_off</span>
                     <h3 className="font-headline font-bold text-on-surface">Conflict Errors</h3>
                  </div>
                  <p className="text-2xl font-black text-on-surface mb-1">3</p>
                  <p className="text-xs text-error font-medium">Requires manual resolution</p>
               </div>
            </div>

            <div className="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/10 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-error"></div>
               <h3 className="text-xl font-headline font-bold text-on-surface mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-error">warning</span>
                  Sync Conflicts
               </h3>
               
               <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-error-container/50 bg-error-container/10 flex flex-col md:flex-row md:items-center gap-4">
                     <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                           <span className="text-sm font-bold text-on-surface">Question Edit Conflict</span>
                           <span className="text-[10px] bg-surface-container-high px-2 py-0.5 rounded text-on-surface-variant font-mono">QID: 8492A</span>
                        </div>
                        <p className="text-xs text-on-surface-variant">Modified locally on Device A while updated on Server.</p>
                     </div>
                     <div className="flex gap-2 shrink-0 border-t md:border-none pt-3 md:pt-0 border-error-container/20">
                        <button className="px-4 py-1.5 rounded bg-surface-container-lowest border border-outline-variant/20 text-xs font-semibold hover:bg-surface-container">Keep Local</button>
                        <button className="px-4 py-1.5 rounded gradient-primary text-white text-xs font-semibold shadow-sm">Use Server Data</button>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </main>
    </div>
  );
}
