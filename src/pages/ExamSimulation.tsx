import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ExamSimulation() {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const options = [
    { id: 1, text: "Focuses exclusively on rote memorization without context." },
    { id: 2, text: "Emphasizes the zone of proximal development and scaffolding." },
    { id: 3, text: "Prioritizes classical conditioning in early childhood." },
    { id: 4, text: "Suggests learning is inherently an isolated, internal process." },
  ];

  return (
    <div className="bg-surface text-on-surface font-body min-h-[100dvh] flex flex-col antialiased relative">
       {/* Top Header - Exam Mode */}
       <header className="px-5 py-4 flex items-center justify-between bg-surface-container-lowest border-b border-surface-container sticky top-0 z-20">
          <div className="flex items-center gap-3">
             <button className="text-on-surface-variant hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined">close</span>
             </button>
             <div className="bg-surface-container-high px-3 py-1 rounded-full text-xs font-bold font-mono text-on-surface flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
                01:45:22
             </div>
          </div>
          <div className="font-bold text-sm tracking-widest text-outline">
             <span className="text-on-surface">14</span> / 150
          </div>
       </header>

       <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-5 py-6">
          {/* Question Meta */}
          <div className="flex items-center gap-2 mb-6">
             <span className="bg-primary-fixed text-on-primary-fixed px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest">Prof Ed</span>
             <span className="text-outline text-xs font-semibold">Child & Adolescent Development</span>
          </div>

          {/* Question Stem */}
          <div className="prose text-on-surface font-body text-lg mb-10 leading-relaxed font-medium">
             Which of the following scenarios best illustrates the application of Vygotsky's socio-cultural theory in a classroom setting?
          </div>

          {/* Options */}
          <div className="flex-1 space-y-4">
             {options.map((opt, index) => {
               const labels = ['A', 'B', 'C', 'D'];
               const isSelected = selectedOption === opt.id;
               
               return (
                 <button
                   key={opt.id}
                   onClick={() => setSelectedOption(opt.id)}
                   className={`w-full p-5 rounded-2xl border-2 flex items-start gap-4 transition-all text-left ${
                     isSelected 
                       ? 'border-primary bg-primary-fixed/10' 
                       : 'border-outline-variant/20 bg-surface-container-lowest hover:bg-surface-container-low'
                   }`}
                 >
                   <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-sm transition-colors ${
                     isSelected ? 'bg-primary text-white' : 'bg-surface-container-high text-on-surface-variant'
                   }`}>
                      {labels[index]}
                   </div>
                   <span className="font-medium text-on-surface pt-1 leading-snug">
                     {opt.text}
                   </span>
                 </button>
               );
             })}
          </div>
       </div>

       {/* Bottom Action Bar */}
       <div className="bg-surface-container-lowest border-t border-surface-container p-5 flex justify-between items-center sticky bottom-0 z-20">
          <button className="px-6 py-3 rounded-full font-semibold text-on-surface-variant hover:bg-surface-container-low transition-colors disabled:opacity-30">
             Previous
          </button>
          <Link to="/quiz-results">
            <button 
              disabled={!selectedOption}
              className="px-8 py-3 rounded-full bg-primary text-on-primary font-bold shadow-lg disabled:opacity-50 disabled:shadow-none hover:-translate-y-0.5 transition-all text-sm flex items-center gap-2"
            >
               Next
               <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </Link>
       </div>
    </div>
  );
}
