import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Focus() {
  const [selectedMajor, setSelectedMajor] = useState<string | null>(null);

  const majors = [
    { id: 'english', label: 'English', icon: 'menu_book' },
    { id: 'math', label: 'Mathematics', icon: 'calculate' },
    { id: 'science', label: 'Science', icon: 'science' },
    { id: 'filipino', label: 'Filipino', icon: 'translate' },
    { id: 'socsci', label: 'Social Sciences', icon: 'public' },
    { id: 'values', label: 'Values Education', icon: 'favorite' },
  ];

  return (
    <div className="bg-surface text-on-surface font-body min-h-[100dvh] flex flex-col antialiased relative bg-surface-container-lowest">
       {/* Background accent */}
       <div className="absolute top-0 right-0 w-full h-[600px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>

       <header className="px-8 py-8 flex items-center justify-between sticky top-0 z-20">
          <Link to="/dashboard" className="w-12 h-12 flex items-center justify-center rounded-full bg-surface-container-low hover:bg-white hover:ambient-shadow transition-all text-on-surface-variant group">
             <span className="material-symbols-outlined text-[20px] group-hover:text-primary transition-colors">arrow_back</span>
          </Link>
          <div className="flex gap-2">
             <div className="h-1.5 w-6 bg-surface-container rounded-full"></div>
             <div className="h-1.5 w-12 primary-gradient rounded-full ambient-shadow"></div>
             <div className="h-1.5 w-6 bg-surface-container rounded-full"></div>
          </div>
          <div className="w-12"></div>
       </header>

       <div className="flex-1 px-8 py-8 max-w-xl mx-auto w-full flex flex-col z-10">
          <div className="mb-12">
             <h1 className="text-4xl md:text-5xl font-extrabold font-headline mb-4 tracking-tighter text-primary">Specialized Domain</h1>
             <p className="text-on-surface-variant text-lg font-medium tracking-tight">Select your academic concentration to influence the simulation depth.</p>
          </div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 pb-12 no-scrollbar">
             {majors.map((major) => (
               <button
                 key={major.id}
                 onClick={() => setSelectedMajor(major.id)}
                 className={`group p-6 rounded-2xl flex flex-col items-center gap-4 transition-all text-center relative overflow-hidden ${
                   selectedMajor === major.id 
                     ? 'bg-primary text-white ambient-shadow scale-[1.05] z-10' 
                     : 'bg-surface-container-low hover:bg-white hover:ambient-shadow ghost-border'
                 }`}
               >
                 <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500 ${
                   selectedMajor === major.id ? 'bg-white text-primary rotate-6' : 'bg-surface-container-high text-on-surface-variant group-hover:bg-primary/5 group-hover:text-primary'
                 }`}>
                    <span className="material-symbols-outlined text-3xl" style={{fontVariationSettings: selectedMajor === major.id ? "'FILL' 1" : ""}}>{major.icon}</span>
                 </div>
                 <div className="space-y-1">
                    <span className={`font-black text-sm uppercase tracking-widest ${selectedMajor === major.id ? 'text-white' : 'text-primary'}`}>
                      {major.label}
                    </span>
                 </div>
                 {selectedMajor === major.id && (
                   <span className="material-symbols-outlined text-white absolute top-4 right-4 text-[18px]">verified</span>
                 )}
               </button>
             ))}
          </div>

          <div className="bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/80 to-transparent pt-12 pb-12 sticky bottom-0">
             <Link to="/exam" className="block w-full">
               <button 
                 disabled={!selectedMajor}
                 className="w-full primary-gradient text-white font-black py-6 rounded-full shadow-2xl hover:shadow-primary/40 transition-all disabled:opacity-50 disabled:shadow-none active:scale-95 text-xs uppercase tracking-widest"
               >
                  Verify Specialization & Launch
               </button>
             </Link>
          </div>
       </div>
    </div>
  );
}
