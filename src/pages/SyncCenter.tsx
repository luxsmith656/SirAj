import React, { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { seedDatabase } from '../lib/db-seed';
import Toast from '../components/Toast';

export default function SyncCenter() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      await seedDatabase();
      setToastMsg('System data seeded successfully!');
      setShowToast(true);
    } catch (err: any) {
      setToastMsg(`Seed failed: ${err.message}`);
      setShowToast(true);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <AdminLayout title="Sync Control Center">
      <div className="p-8 max-w-5xl mx-auto py-12">
            <div className="flex justify-between items-end mb-8">
               <div>
                  <h1 className="text-3xl font-extrabold font-headline mb-2">Offline Sync</h1>
                  <p className="text-on-surface-variant">Monitor and manage data synchronization across devices.</p>
               </div>
               <div className="flex gap-3">
                  <button 
                    onClick={handleSeed}
                    disabled={isSeeding}
                    className="bg-blue-600 text-white hover:bg-blue-700 transition-colors px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 text-sm shadow-lg shadow-blue-900/20 disabled:opacity-50"
                  >
                     <span className={`material-symbols-outlined text-[18px] ${isSeeding ? 'animate-spin' : ''}`}>
                       {isSeeding ? 'sync' : 'database'}
                     </span> 
                     {isSeeding ? 'Seeding Data...' : 'Seed System Data'}
                  </button>
                  <button className="bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors px-4 py-2 rounded-xl font-bold flex items-center gap-2 text-sm">
                     <span className="material-symbols-outlined text-[18px]">refresh</span> Force Master Sync
                  </button>
               </div>
            </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant">
                   <div className="flex items-center gap-3 mb-2 text-on-surface">
                      <span className="material-symbols-outlined text-primary">cloud_done</span>
                      <h3 className="font-headline font-bold">Last Sync Status</h3>
                   </div>
                   <p className="text-2xl font-black text-on-surface mb-1">Success</p>
                   <p className="text-xs text-on-surface-variant/40">2 minutes ago</p>
                </div>
                <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant">
                   <div className="flex items-center gap-3 mb-2 text-on-surface">
                      <span className="material-symbols-outlined text-indigo-500">data_usage</span>
                      <h3 className="font-headline font-bold">Pending Payloads</h3>
                   </div>
                   <p className="text-2xl font-black text-on-surface mb-1">14</p>
                   <p className="text-xs text-on-surface-variant/40">Awaiting device connection</p>
                </div>
                <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant">
                   <div className="flex items-center gap-3 mb-2 text-on-surface">
                      <span className="material-symbols-outlined text-error">cloud_off</span>
                      <h3 className="font-headline font-bold">Conflict Errors</h3>
                   </div>
                   <p className="text-2xl font-black text-on-surface mb-1">3</p>
                   <p className="text-xs text-error font-medium">Requires manual resolution</p>
                </div>
             </div>

             <div className="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-error"></div>
                <h3 className="text-xl font-headline font-bold text-on-surface mb-6 flex items-center gap-3">
                   <div className="w-10 h-10 bg-error/10 rounded-xl flex items-center justify-center text-error">
                     <span className="material-symbols-outlined">warning</span>
                   </div>
                   Sync Conflicts
                </h3>
                
                <div className="space-y-4">
                   <div className="p-4 rounded-xl border border-error/10 bg-error/5 flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex-1">
                         <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-bold text-on-surface">Question Edit Conflict</span>
                            <span className="text-[10px] bg-surface-container px-2 py-0.5 rounded text-on-surface-variant/40 font-mono">QID: 8492A</span>
                         </div>
                         <p className="text-xs text-on-surface-variant/60">Modified locally on Device A while updated on Server.</p>
                      </div>
                      <div className="flex gap-2 shrink-0 border-t md:border-none pt-3 md:pt-0 border-outline-variant/10">
                         <button className="px-4 py-1.5 rounded-lg bg-surface-container-lowest border border-outline-variant text-xs font-bold text-on-surface-variant/60 hover:text-on-surface transition-colors">Keep Local</button>
                         <button className="px-4 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-bold shadow-sm">Use Server Data</button>
                      </div>
                   </div>
                </div>
             </div>
         </div>

      <Toast 
        isVisible={showToast}
        message={toastMsg}
        onClose={() => setShowToast(false)}
        type={toastMsg.includes('failed') ? 'error' : 'success'}
      />
    </AdminLayout>
  );
}
