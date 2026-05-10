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
    <div className="bg-surface text-on-surface font-body min-h-[100dvh] flex flex-col antialiased">
       <header className="px-6 py-4 flex items-center justify-between sticky top-0 bg-surface/80 backdrop-blur-md z-10">
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface-variant">
             <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <div className="flex gap-1.5">
             <div className="h-1.5 w-4 bg-surface-container-highest rounded-full"></div>
             <div className="h-1.5 w-8 bg-primary rounded-full"></div>
             <div className="h-1.5 w-4 bg-surface-container-highest rounded-full"></div>
          </div>
          <div className="w-10"></div> {/* Spacer for symmetry */}
       </header>

       <div className="flex-1 px-6 py-6 max-w-md mx-auto w-full flex flex-col">
          <div className="mb-8">
             <h1 className="text-2xl font-extrabold font-headline mb-2 tracking-tight">Select your Major</h1>
             <p className="text-on-surface-variant text-sm font-medium">This customizes your Professional Education track.</p>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto pb-4 no-scrollbar">
             {majors.map((major) => (
               <button
                 key={major.id}
                 onClick={() => setSelectedMajor(major.id)}
                 className={`w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all text-left ${
                   selectedMajor === major.id 
                     ? 'border-primary bg-primary-fixed/20 shadow-md' 
                     : 'border-outline-variant/20 bg-surface-container-lowest hover:border-primary/40'
                 }`}
               >
                 <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                   selectedMajor === major.id ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant'
                 }`}>
                    <span className="material-symbols-outlined">{major.icon}</span>
                 </div>
                 <span className={`font-semibold ${selectedMajor === major.id ? 'text-primary' : 'text-on-surface'}`}>
                   {major.label}
                 </span>
                 {selectedMajor === major.id && (
                   <span className="material-symbols-outlined text-primary ml-auto" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                 )}
               </button>
             ))}
          </div>

          <div className="pt-6 pb-4 bg-surface">
             <Link to="/exam" className="block w-full">
               <button 
                 disabled={!selectedMajor}
                 className="w-full bg-primary text-on-primary font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed"
               >
                  Continue
               </button>
             </Link>
          </div>
       </div>
    </div>
  );
}
