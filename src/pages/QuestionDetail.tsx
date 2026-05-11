import React, { useState } from 'react';
import AdminLayout from '../components/AdminLayout';

export default function QuestionDetail() {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  return (
    <AdminLayout title="Scholarly Reviewer">
      <div className="p-8 md:p-12 max-w-7xl mx-auto w-full flex-1 space-y-12 pb-24">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
                <div className="max-w-4xl">
                    <div className="flex items-center gap-3 mb-4">
                       <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] bg-primary/5 px-4 py-1.5 rounded-full border border-primary/10">Reference ID: BIO-402</span>
                       <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                       <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Verified Curriculum</span>
                    </div>
                    <h2 className="text-4xl md:text-7xl font-extrabold font-headline text-primary tracking-tighter leading-[0.85]">Cellular Respiration:<br/>ATP Yield Analysis</h2>
                </div>
                <div className="flex gap-4">
                    <button className="flex items-center gap-3 px-10 py-5 rounded-full primary-gradient text-white font-black text-[11px] uppercase tracking-widest shadow-2xl hover:shadow-primary/40 hover:-translate-y-1 transition-all active:scale-95">
                      <span className="material-symbols-outlined text-[18px]">edit</span> Modify Directive
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
               <div className="lg:col-span-8 flex flex-col gap-12">
                  <section className="bg-white rounded-[3rem] p-12 ghost-border ambient-shadow relative overflow-hidden group">
                     <div className="absolute top-0 left-0 w-full h-2 primary-gradient"></div>
                     <div className="flex items-center gap-4 mb-10">
                        {['Biology', 'Advanced', 'Cognitive Analysis'].map(tag => (
                           <span key={tag} className="bg-surface-container-low text-primary px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ghost-border shadow-sm">{tag}</span>
                        ))}
                     </div>
                     <div className="prose text-on-surface font-body mb-12 text-3xl font-bold leading-relaxed tracking-tight text-primary">
                        <p>During cellular respiration, a single molecule of glucose is completely oxidized to carbon dioxide and water. Assuming a perfectly efficient electron transport chain... what is the theoretical maximum net yield of ATP produced exclusively via oxidative phosphorylation?</p>
                     </div>
                     <div className="rounded-[3rem] overflow-hidden mb-12 bg-surface-container-low p-2 h-96 flex items-center justify-center ghost-border ambient-shadow-sm group-hover:scale-[1.005] transition-transform duration-700">
                        <div className="flex flex-col items-center gap-6 opacity-40">
                           <span className="material-symbols-outlined text-8xl">biology</span>
                           <span className="text-[10px] font-black uppercase tracking-[0.3em]">Scientific Visualization Subsystem</span>
                        </div>
                     </div>

                     <div className="space-y-6">
                        <h3 className="text-[11px] font-black text-on-surface-variant uppercase tracking-[0.4em] mb-10 opacity-60">Objective Response Matrix</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           {[
                             { label: 'A', value: '2 ATP', correct: false },
                             { label: 'B', value: '4 ATP', correct: false },
                             { label: 'C', value: '34 ATP', correct: true },
                             { label: 'D', value: '38 ATP', correct: false }
                           ].map((item) => (
                             <div 
                               key={item.label} 
                               onClick={() => setSelectedOption(item.label)}
                               className={`p-10 rounded-[2.5rem] transition-all relative overflow-hidden group cursor-pointer ${selectedOption === item.label ? (item.correct ? 'bg-secondary text-white shadow-2xl scale-105' : 'bg-error/10 text-error ghost-border scale-95 opacity-80') : 'bg-surface-container-low/50 ghost-border hover:bg-white hover:ambient-shadow active:scale-95'}`}
                             >
                                {(selectedOption === item.label && item.correct) && <div className="absolute inset-0 primary-gradient opacity-10"></div>}
                                <div className="flex items-start gap-8 relative z-10">
                                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 font-black text-sm ambient-shadow transition-all duration-500 ${selectedOption === item.label ? (item.correct ? 'bg-white text-secondary scale-110 rotate-12' : 'bg-white text-error rotate-[-12deg]') : 'bg-white text-on-surface-variant group-hover:bg-primary group-hover:text-white group-hover:rotate-6'}`}>
                                      {item.label}
                                   </div>
                                   <div className="flex-1 mt-1">
                                      <p className="font-bold text-xl tracking-tight leading-tight">{item.value}</p>
                                      {(selectedOption === item.label && item.correct) && <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mt-3 block">Validated Empirical Truth</span>}
                                   </div>
                                   {(selectedOption === item.label && item.correct) && <span className="material-symbols-outlined text-white text-3xl animate-in zoom-in spin-in-12 duration-500" style={{fontVariationSettings: "'FILL' 1"}}>verified</span>}
                                   {(selectedOption === item.label && !item.correct) && <span className="material-symbols-outlined text-error text-3xl animate-in zoom-in duration-500">cancel</span>}
                                </div>
                             </div>
                           ))}
                        </div>
                     </div>
                  </section>

                  <section className="bg-surface-container-low rounded-[3rem] p-12 ghost-border ambient-shadow relative overflow-hidden group">
                     <div className="absolute top-0 left-0 w-2 h-full primary-gradient opacity-20 group-hover:opacity-100 transition-opacity"></div>
                     <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm ghost-border">
                           <span className="material-symbols-outlined text-[24px]" style={{fontVariationSettings: "'FILL' 1"}}>lightbulb</span>
                        </div>
                        <h3 className="font-headline text-2xl font-extrabold text-primary tracking-tight">Pedagogical Rationale</h3>
                     </div>
                     <p className="text-lg text-on-surface-variant leading-relaxed font-medium">
                        While the total theoretical yield of cellular respiration is often cited as 38 ATP... The question specifically asks for the yield produced exclusively via oxidative phosphorylation.
                     </p>
                  </section>
               </div>

               <div className="lg:col-span-4 flex flex-col gap-10">
                  <section className="bg-white rounded-[3rem] p-10 ghost-border ambient-shadow text-center relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-full h-1 bg-secondary opacity-20"></div>
                     <h3 className="font-headline text-lg font-black text-primary mb-10 tracking-[0.1em] uppercase opacity-60">Candidate Performance</h3>
                     <div className="relative inline-block mb-10">
                        <svg className="w-48 h-48 transform -rotate-90">
                           <circle cx="96" cy="96" r="88" fill="transparent" stroke="rgba(0,0,0,0.03)" strokeWidth="16" />
                           <circle cx="96" cy="96" r="88" fill="transparent" stroke="var(--color-secondary)" strokeWidth="16" strokeDasharray="552" strokeDashoffset={552 * (1 - 0.68)} strokeLinecap="round" className="drop-shadow-[0_0_10px_rgba(var(--color-secondary-rgb),0.3)]" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                           <span className="text-5xl font-black font-headline text-primary tracking-tighter">68%</span>
                           <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-60">Accuracy</span>
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-4 text-left">
                        <div className="p-4 bg-surface-container-low rounded-2xl">
                           <p className="text-[10px] font-black text-on-surface-variant uppercase mb-2 opacity-50">Total Attempts</p>
                           <p className="text-2xl font-black text-primary tracking-tighter">1,402</p>
                        </div>
                        <div className="p-4 bg-surface-container-low rounded-2xl">
                           <p className="text-[10px] font-black text-on-surface-variant uppercase mb-2 opacity-50">Avg. Time</p>
                           <p className="text-2xl font-black text-primary tracking-tighter">42s</p>
                        </div>
                     </div>
                  </section>

                  <section className="bg-surface-container-low rounded-[3rem] p-10 ghost-border ambient-shadow">
                     <h3 className="font-headline text-lg font-black text-primary mb-8 tracking-[0.1em] uppercase opacity-60">Subject Authority</h3>
                     <div className="space-y-6">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black shadow-sm">Dr</div>
                           <div>
                              <p className="font-bold text-sm text-primary">Dr. Julian Scholarly</p>
                              <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-60">Biology Content Lead</p>
                           </div>
                        </div>
                        <p className="text-xs text-on-surface-variant font-medium leading-relaxed italic opacity-80">
                           "This question calibrates a student's ability to distinguish between substrate-level and oxidative pathways."
                        </p>
                     </div>
                  </section>
               </div>
            </div>
         </div>
    </AdminLayout>
  );
}
