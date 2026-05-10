import React from 'react';
import { Link } from 'react-router-dom';

export default function QuizResults() {
  return (
    <div className="bg-surface text-on-surface font-body min-h-[100dvh] flex flex-col antialiased">
       <header className="px-6 py-4 flex items-center justify-between bg-surface-container-lowest border-b border-surface-container sticky top-0 z-20">
          <Link to="/dashboard" className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface-variant">
             <span className="material-symbols-outlined text-[20px]">close</span>
          </Link>
          <h2 className="font-headline font-bold text-sm tracking-wide text-on-surface">Results</h2>
          <div className="w-10"></div>
       </header>

       <div className="flex-1 overflow-y-auto pb-24">
          <div className="bg-primary pt-8 pb-16 px-6 text-on-primary rounded-b-[2.5rem] relative overflow-hidden">
             {/* Decorative background */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3"></div>
             
             <div className="relative z-10 max-w-md mx-auto text-center">
                <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-widest mb-4">Module Complete</span>
                <h1 className="text-3xl font-black font-headline mb-8">Professional Ed:<br/>Assessment 1</h1>
                
                <div className="flex justify-center">
                   <div className="w-40 h-40 rounded-full border-[12px] border-white/20 flex flex-col items-center justify-center relative shadow-lg bg-primary">
                      {/* Fake progress ring */}
                      <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                         <circle cx="50" cy="50" r="44" fill="transparent" stroke="white" strokeWidth="12" strokeDasharray="276" strokeDashoffset="60" className="drop-shadow-md" />
                      </svg>
                      <span className="text-5xl font-black font-headline tracking-tighter relative z-10 text-white">78<span className="text-2xl">%</span></span>
                      <span className="text-xs font-bold text-primary-fixed-dim relative z-10 mt-1 uppercase tracking-widest">Score</span>
                   </div>
                </div>
             </div>
          </div>

          <div className="max-w-md mx-auto px-6 -mt-8 relative z-20">
             <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-xl border border-outline-variant/10 grid grid-cols-2 gap-4 mb-8">
                <div className="text-center p-4 bg-surface rounded-2xl">
                   <span className="material-symbols-outlined text-secondary block mb-2 mx-auto">check_circle</span>
                   <span className="text-2xl font-black block text-on-surface">39</span>
                   <span className="text-xs font-bold text-outline uppercase tracking-wider">Correct</span>
                </div>
                <div className="text-center p-4 bg-surface rounded-2xl">
                   <span className="material-symbols-outlined text-error block mb-2 mx-auto">cancel</span>
                   <span className="text-2xl font-black block text-on-surface">11</span>
                   <span className="text-xs font-bold text-outline uppercase tracking-wider">Incorrect</span>
                </div>
             </div>

             <div className="space-y-4">
                <h3 className="font-headline font-bold text-lg mb-4 text-on-surface">Key Takeaways</h3>
                
                <div className="p-5 rounded-2xl bg-surface-container-lowest border-l-4 border-l-secondary shadow-sm">
                   <div className="flex items-center gap-3 mb-2">
                      <span className="material-symbols-outlined text-secondary text-sm">trending_up</span>
                      <h4 className="font-bold text-sm">Strength: Philosophies</h4>
                   </div>
                   <p className="text-sm text-on-surface-variant font-medium leading-relaxed">You showed excellent mastery in identifying educational philosophies (95% accuracy).</p>
                </div>
                
                <div className="p-5 rounded-2xl bg-surface-container-lowest border-l-4 border-l-error shadow-sm">
                   <div className="flex items-center gap-3 mb-2">
                      <span className="material-symbols-outlined text-error text-sm">trending_down</span>
                      <h4 className="font-bold text-sm">Needs Work: Assessment</h4>
                   </div>
                   <p className="text-sm text-on-surface-variant font-medium leading-relaxed">Review concepts around formative vs summative evaluation methods.</p>
                </div>
             </div>
          </div>
       </div>

       <div className="fixed bottom-0 left-0 w-full bg-surface-container-lowest p-6 border-t border-surface-container z-30">
          <div className="max-w-md mx-auto flex gap-4">
             <button className="flex-1 py-4 rounded-xl font-bold bg-surface-container-high text-on-surface hover:bg-surface-container transition-colors">
                Review Answers
             </button>
             <button className="flex-1 py-4 rounded-xl font-bold bg-primary text-on-primary shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                Next Module
             </button>
          </div>
       </div>
    </div>
  );
}
