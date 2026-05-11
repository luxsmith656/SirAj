import React from 'react';
import AdminLayout from '../components/AdminLayout';

export default function CurriculumSettings() {
  return (
    <AdminLayout title="Curriculum Settings">
      <div className="p-8 md:p-12 max-w-5xl mx-auto space-y-12 pb-24">
            <div>
               <h1 className="text-4xl md:text-5xl font-extrabold font-headline text-primary tracking-tighter mb-2">Global Rules</h1>
               <p className="text-lg text-on-surface-variant max-w-xl font-body">Centralized control for examination logic and grading heuristics.</p>
            </div>

            <div className="space-y-10">
               <section className="bg-surface-container-low p-10 rounded-xl ghost-border ambient-shadow relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1.5 primary-gradient"></div>
                  <h3 className="text-2xl font-headline font-extrabold text-primary mb-10 flex items-center gap-3 tracking-tight">
                     <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>psychology</span>
                     Cognitive Heuristics
                  </h3>
                  
                  <div className="space-y-4 font-body">
                     {[
                       { label: 'Radical Randomization', desc: 'Shuffle options A-D dynamically to prevent positional memorization.', active: true },
                       { label: 'Immediate Pedagogy', desc: 'Reveal complete rationale instantly after each practice response.', active: true }
                     ].map((toggle) => (
                        <div key={toggle.label} className="flex items-center justify-between p-6 rounded-2xl bg-surface-container-lowest transition-all hover:scale-[1.01] ambient-shadow group">
                           <div>
                              <h4 className="font-bold text-on-surface text-base group-hover:text-primary transition-colors">{toggle.label}</h4>
                              <p className="text-sm text-on-surface-variant font-medium mt-1">{toggle.desc}</p>
                           </div>
                           <div className={`w-14 h-7 ${toggle.active ? 'bg-secondary shadow-inner' : 'bg-surface-container-high'} rounded-full relative cursor-pointer transition-colors duration-500`}>
                              <div className={`w-5 h-5 bg-white rounded-full absolute top-1 shadow-md transition-all duration-500 ${toggle.active ? 'right-1' : 'left-1'}`}></div>
                           </div>
                        </div>
                     ))}
                  </div>
               </section>

               <section className="bg-surface-container-low p-10 rounded-xl ghost-border ambient-shadow">
                  <h3 className="text-2xl font-headline font-extrabold text-primary mb-10 tracking-tight">Thresholds & Mastery</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 font-body">
                     <div className="space-y-3">
                        <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Success Threshold (%)</label>
                        <input type="number" defaultValue={75} className="w-full bg-surface-container-lowest border-none rounded-2xl p-5 text-2xl font-black text-primary ambient-shadow focus:ring-4 focus:ring-primary/10 outline-none transition-all" />
                        <p className="text-xs font-medium text-on-surface-variant mt-2 ml-1">Target accuracy before cohort promotion.</p>
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Attempt Cap</label>
                        <input type="number" defaultValue={3} className="w-full bg-surface-container-lowest border-none rounded-2xl p-5 text-2xl font-black text-primary ambient-shadow focus:ring-4 focus:ring-primary/10 outline-none transition-all" />
                        <p className="text-xs font-medium text-on-surface-variant mt-2 ml-1">Maximum retries before locked intervention.</p>
                     </div>
                  </div>
               </section>

               <div className="flex justify-end gap-6 pt-6">
                  <button className="px-8 py-4 rounded-full text-primary font-bold text-sm uppercase tracking-widest hover:bg-surface-container transition-all active:scale-95">Discard</button>
                  <button className="px-12 py-4 rounded-full primary-gradient text-white font-bold text-sm uppercase tracking-widest shadow-xl hover:shadow-2xl transition-all active:scale-95">Verify & Commit</button>
               </div>
            </div>
         </div>
    </AdminLayout>
  );
}
