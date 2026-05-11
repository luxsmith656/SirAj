import React from 'react';
import AdminLayout from '../components/AdminLayout';

export default function EditQuestion() {
  return (
    <AdminLayout title="Scholarly Reviewer">
      <div className="p-8 md:p-12 max-w-7xl mx-auto w-full flex-1 space-y-12 pb-24">
            <nav className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/60">
              <span className="hover:text-primary cursor-pointer transition-colors">Question Repository</span>
              <span className="material-symbols-outlined text-[12px] opacity-40">chevron_right</span>
              <span className="text-primary">Schema Editor</span>
            </nav>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
               <div className="max-w-2xl">
                  <h2 className="text-4xl md:text-5xl font-extrabold font-headline text-primary tracking-tighter mb-4">Edit MCQ Directive</h2>
                  <p className="text-lg text-on-surface-variant font-body">Refine the pedagogical intent, linguistic structure, and objective validation criteria.</p>
               </div>
               <div className="flex gap-4">
                  <button className="px-8 py-4 rounded-full text-on-surface-variant font-bold text-[11px] uppercase tracking-widest hover:bg-surface-container transition-all active:scale-95">Discard</button>
                  <button className="px-10 py-4 rounded-full primary-gradient text-white font-bold text-[11px] uppercase tracking-widest shadow-xl hover:shadow-2xl transition-all active:scale-95">Verify & Commit</button>
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
               <div className="lg:col-span-8 space-y-10">
                  <div className="bg-white rounded-[2rem] p-10 relative overflow-hidden group ghost-border ambient-shadow">
                     <div className="absolute top-0 left-0 w-full h-1.5 primary-gradient"></div>
                     <h3 className="font-headline text-2xl font-extrabold text-primary mb-8 flex items-center gap-4 tracking-tight">
                        <span className="material-symbols-outlined text-primary" style={{fontVariationSettings: "'FILL' 1"}}>edit_note</span> 
                        Cognitive Nucleus
                     </h3>
                     <div className="flex items-center gap-3 mb-6 pb-6 border-b border-surface-container-low text-on-surface-variant">
                        {['format_bold', 'format_italic', 'format_list_bulleted'].map(icon => (
                          <button key={icon} className="w-10 h-10 rounded-xl hover:bg-white hover:text-primary transition-all flex items-center justify-center ambient-shadow-sm">
                            <span className="material-symbols-outlined text-[20px]">{icon}</span>
                          </button>
                        ))}
                     </div>
                     <textarea className="w-full h-48 bg-surface-container-lowest border-none rounded-2xl p-8 text-lg font-body font-bold text-primary ambient-shadow-sm focus:ring-4 focus:ring-primary/5 outline-none resize-none transition-all" defaultValue="The cognitive domain of Bloom's Taxonomy focuses on intellectual skills..."></textarea>
                  </div>

                  <div className="bg-white rounded-[2rem] p-10 ghost-border ambient-shadow">
                     <h3 className="font-headline text-2xl font-extrabold text-primary mb-8 flex items-center gap-4 tracking-tight">
                        <span className="material-symbols-outlined text-primary" style={{fontVariationSettings: "'FILL' 1"}}>checklist</span> 
                        Distractor Calibration
                     </h3>
                     <div className="space-y-6">
                        {[
                          { label: 'A', text: 'Reciting a poem from memory.', correct: false },
                          { label: 'B', text: 'Critiquing a peer\'s essay based on a rubric.', correct: true }
                        ].map((opt) => (
                           <div key={opt.label} className={`flex items-start gap-6 p-8 rounded-2xl transition-all group ${opt.correct ? 'bg-secondary/5 border-l-8 border-secondary active:scale-[1.01]' : 'bg-surface-container-lowest ghost-border'}`}>
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-black text-sm ambient-shadow ${opt.correct ? 'bg-secondary text-white' : 'bg-surface-container-high text-on-surface-variant group-hover:bg-primary/5 group-hover:text-primary'}`}>
                                 {opt.label}
                              </div>
                              <div className="flex-1">
                                 <div className="flex justify-between items-center mb-4">
                                   <span className="font-headline text-sm font-black tracking-widest text-on-surface-variant uppercase flex items-center gap-3">
                                     Option {opt.label}
                                     {opt.correct && <span className="text-[10px] bg-secondary text-white px-3 py-1 rounded-full shadow-sm">Validated Truth</span>}
                                   </span>
                                 </div>
                                 <textarea className="w-full h-16 bg-transparent border-none p-0 text-lg font-body font-bold text-primary outline-none resize-none" defaultValue={opt.text}></textarea>
                              </div>
                           </div>
                        ))}
                     </div>
                     <button className="mt-8 flex items-center gap-3 text-secondary font-black text-[10px] uppercase tracking-[0.2em] px-8 py-4 bg-white rounded-full ambient-shadow hover:-translate-y-1 transition-all active:scale-95">
                        <span className="material-symbols-outlined text-[18px]">add</span> Insert Hypothesis
                     </button>
                  </div>
               </div>

               <div className="lg:col-span-4 space-y-10">
                  <div className="bg-white rounded-[2rem] p-10 ghost-border ambient-shadow">
                     <h3 className="font-headline text-xl font-extrabold text-primary mb-8 tracking-tight">Taxonomic Data</h3>
                     <div className="space-y-10 font-body">
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Domain Classification</label>
                           <div className="relative">
                              <select className="w-full appearance-none bg-surface-container-lowest border-none rounded-2xl px-6 py-4 text-xs font-bold text-primary ambient-shadow outline-none pr-12 cursor-pointer">
                                 <option>Professional Education</option>
                              </select>
                              <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 text-primary pointer-events-none">expand_more</span>
                           </div>
                        </div>
                        <div className="space-y-4">
                           <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Complexity Vector</label>
                           <div className="grid grid-cols-3 gap-3">
                              {['Easy', 'Medium', 'Hard'].map(level => (
                                <button key={level} className={`py-4 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${level === 'Medium' ? 'bg-primary text-white shadow-xl scale-105' : 'bg-surface-container-lowest text-on-surface-variant/40 hover:bg-white'}`}>
                                  {level}
                                </button>
                              ))}
                           </div>
                        </div>
                     </div>
                  </div>
                  <div className="bg-white rounded-[2rem] p-10 ghost-border ambient-shadow">
                     <h3 className="font-headline text-xl font-extrabold text-primary mb-8 tracking-tight">Management</h3>
                     <button className="w-full py-5 border-2 border-error/10 text-error rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-error hover:text-white transition-all flex items-center justify-center gap-3 active:scale-95">
                        <span className="material-symbols-outlined text-[20px]">archive</span> Archive Directive
                     </button>
                  </div>
               </div>
            </div>
         </div>
    </AdminLayout>
  );
}
