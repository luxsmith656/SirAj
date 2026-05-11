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
    <div className="bg-surface text-on-surface font-body min-h-[100dvh] flex flex-col antialiased relative bg-surface-container-lowest">
       {/* Background accent */}
       <div className="absolute top-0 right-0 w-1/2 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>

       {/* Top Header - Exam Mode */}
       <header className="px-8 py-6 flex items-center justify-between glass-header sticky top-0 z-20 ghost-border-b">
          <div className="flex items-center gap-6">
             <Link to="/dashboard" className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:text-primary transition-all hover:ambient-shadow">
                <span className="material-symbols-outlined">close</span>
             </Link>
             <div className="h-10 px-6 bg-surface-container-low rounded-full text-[13px] font-bold text-primary flex items-center gap-3 ambient-shadow">
                <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
                01:45:22
             </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="font-headline font-bold text-lg tracking-tight">
               <span className="text-primary">14</span>
               <span className="text-on-surface-variant/40 mx-2">/</span>
               <span className="text-on-surface-variant">150</span>
            </div>
          </div>
       </header>

       <main className="flex-1 flex flex-col max-w-3xl mx-auto w-full px-8 py-16">
          {/* Question Meta */}
          <div className="flex items-center gap-4 mb-8">
             <span className="primary-gradient text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg">Professional Ed</span>
             <span className="text-on-surface-variant text-[11px] font-bold uppercase tracking-widest opacity-60">Child & Adolescent Development</span>
          </div>

          {/* Question Stem */}
          <div className="text-on-surface font-headline text-3xl font-extrabold mb-16 leading-tight tracking-tight">
             Which of the following scenarios best illustrates the application of Vygotsky's socio-cultural theory in a classroom setting?
          </div>

          {/* Options */}
          <div className="flex-1 space-y-5">
             {options.map((opt, index) => {
               const labels = ['A', 'B', 'C', 'D'];
               const isSelected = selectedOption === opt.id;
               
               return (
                 <button
                   key={opt.id}
                   onClick={() => setSelectedOption(opt.id)}
                   className={`w-full p-8 rounded-2xl flex items-start gap-6 transition-all text-left relative overflow-hidden group ${
                     isSelected 
                       ? 'bg-primary text-white ambient-shadow scale-[1.02]' 
                       : 'bg-surface-container-low hover:bg-white hover:ambient-shadow ghost-border'
                   }`}
                 >
                   {isSelected && <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>}
                   <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-sm transition-all duration-500 ${
                     isSelected ? 'bg-white text-primary rotate-3' : 'bg-surface-container-high text-on-surface-variant group-hover:bg-primary/10 group-hover:text-primary'
                   }`}>
                      {labels[index]}
                   </div>
                   <span className={`font-bold text-lg pt-1.5 leading-snug tracking-tight ${isSelected ? 'text-white' : 'text-primary'}`}>
                     {opt.text}
                   </span>
                 </button>
               );
             })}
          </div>
       </main>

       {/* Bottom Action Bar */}
       <footer className="bg-surface-container-lowest/80 backdrop-blur-xl p-8 flex justify-between items-center sticky bottom-0 z-20 ghost-border-t">
          <button className="px-10 py-4 rounded-full font-bold text-primary hover:bg-surface-container-low transition-all uppercase text-[11px] tracking-widest disabled:opacity-30">
             Previous Segment
          </button>
          <Link to="/quiz-results">
            <button 
              disabled={!selectedOption}
              className="px-14 py-5 rounded-full primary-gradient text-white font-black shadow-2xl disabled:opacity-50 disabled:shadow-none hover:-translate-y-1 transition-all text-[11px] uppercase tracking-widest flex items-center gap-3"
            >
               Forward Navigation
               <span className="material-symbols-outlined text-[18px]">east</span>
            </button>
          </Link>
       </footer>
    </div>
  );
}
