import React from 'react';
import AdminLayout from '../components/AdminLayout';

export default function CurriculumSettings() {
  return (
    <AdminLayout title="Curriculum Settings">
      <div className="p-8 max-w-4xl mx-auto py-12">
            <h1 className="text-3xl font-extrabold font-headline mb-2 text-primary-container tracking-tight">Curriculum Rules</h1>
            <p className="text-on-surface-variant mb-10">Configure how assessments and modules behave globally.</p>

            <div className="space-y-8">
               <section className="bg-surface p-8 rounded-3xl border border-outline-variant/10 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary"></div>
                  <h3 className="text-xl font-headline font-bold text-on-surface mb-6 flex items-center gap-2">
                     <span className="material-symbols-outlined text-primary">psychology</span>
                     Assessment Settings
                  </h3>
                  
                  <div className="space-y-6">
                     <div className="flex items-start justify-between p-4 rounded-xl hover:bg-surface-container-lowest transition-colors border border-transparent hover:border-outline-variant/10">
                        <div>
                           <h4 className="font-semibold text-on-surface">Randomize Options</h4>
                           <p className="text-sm text-on-surface-variant mt-1">Shuffle A-D choices on every attempt to prevent pattern memorization.</p>
                        </div>
                        <div className="w-12 h-6 bg-secondary rounded-full relative cursor-pointer shadow-inner">
                           <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 shadow-sm"></div>
                        </div>
                     </div>
                     <hr className="border-outline-variant/10" />
                     <div className="flex items-start justify-between p-4 rounded-xl hover:bg-surface-container-lowest transition-colors border border-transparent hover:border-outline-variant/10">
                        <div>
                           <h4 className="font-semibold text-on-surface">Immediate Rationale Reveal</h4>
                           <p className="text-sm text-on-surface-variant mt-1">Show rationale immediately after a student answers a question during practice.</p>
                        </div>
                        <div className="w-12 h-6 bg-secondary rounded-full relative cursor-pointer shadow-inner">
                           <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 shadow-sm"></div>
                        </div>
                     </div>
                  </div>
               </section>

               <section className="bg-surface p-8 rounded-3xl border border-outline-variant/10 shadow-sm">
                  <h3 className="text-xl font-headline font-bold text-on-surface mb-6">Grading & Thresholds</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-sm font-semibold text-on-surface-variant block">Passing Score (%)</label>
                        <input type="number" defaultValue={75} className="w-full bg-surface-container-highest border-none rounded-lg p-3 text-lg font-bold font-headline focus:ring-2 focus:ring-primary/20 transition-all outline-none" />
                        <p className="text-xs text-outline">Minimum score to mark a module as completed.</p>
                     </div>
                     <div className="space-y-2">
                        <label className="text-sm font-semibold text-on-surface-variant block">Max Retakes</label>
                        <input type="number" defaultValue={3} className="w-full bg-surface-container-highest border-none rounded-lg p-3 text-lg font-bold font-headline focus:ring-2 focus:ring-primary/20 transition-all outline-none" />
                        <p className="text-xs text-outline">Limit attempts before instructor review required.</p>
                     </div>
                  </div>
               </section>

               <div className="flex justify-end gap-4 pt-6">
                  <button className="px-6 py-3 rounded-full text-on-surface font-medium hover:bg-surface-container transition-colors">Discard</button>
                  <button className="px-8 py-3 rounded-full gradient-primary text-white font-bold shadow-lg hover:shadow-xl transition-all">Save Global Rules</button>
               </div>
            </div>
         </div>
    </AdminLayout>
  );
}
