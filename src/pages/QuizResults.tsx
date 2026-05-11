import React from 'react';
import { Link } from 'react-router-dom';

export default function QuizResults() {
  return (
    <div className="bg-surface text-on-surface font-body min-h-[100dvh] flex flex-col antialiased relative bg-surface-container-lowest">
       <header className="px-8 py-6 flex items-center justify-between glass-header sticky top-0 z-20 ghost-border-b">
          <Link to="/dashboard" className="w-12 h-12 flex items-center justify-center rounded-full bg-surface-container-low hover:bg-white hover:ambient-shadow transition-all text-on-surface-variant group">
             <span className="material-symbols-outlined text-[20px] group-hover:text-primary transition-colors">close</span>
          </Link>
          <div className="font-headline font-black text-xs uppercase tracking-[0.2em] text-primary/60">Final Outcome</div>
          <div className="w-12"></div>
       </header>

       <div className="flex-1 overflow-y-auto pb-32">
          <div className="bg-primary pt-12 pb-24 px-8 text-white rounded-b-[4rem] relative overflow-hidden ambient-shadow">
             {/* Decorative background */}
             <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
             <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/3"></div>
             
             <div className="relative z-10 max-w-lg mx-auto text-center">
                <span className="inline-block px-6 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">Validation Successful</span>
                <h1 className="text-4xl md:text-5xl font-black font-headline mb-12 tracking-tighter leading-[0.9]">Professional Ed:<br/>Assessment 1</h1>
                
                <div className="flex justify-center">
                   <div className="w-56 h-56 rounded-full flex flex-col items-center justify-center relative bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
                      {/* Fake progress ring */}
                      <svg className="absolute inset-0 w-full h-full transform -rotate-90 p-4" viewBox="0 0 100 100">
                         <circle cx="50" cy="50" r="44" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                         <circle cx="50" cy="50" r="44" fill="transparent" stroke="white" strokeWidth="8" strokeDasharray="276" strokeDashoffset="60" strokeLinecap="round" className="drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                      </svg>
                      <span className="text-7xl font-black font-headline tracking-tighter relative z-10 text-white flex items-start">78<span className="text-2xl mt-3 opacity-60">%</span></span>
                      <span className="text-[10px] font-black text-white/40 relative z-10 mt-1 uppercase tracking-widest">Mastery Index</span>
                   </div>
                </div>
             </div>
          </div>

          <div className="max-w-xl mx-auto px-8 -mt-12 relative z-20">
             <div className="bg-white rounded-[3rem] p-10 ambient-shadow ghost-border grid grid-cols-2 gap-10 mb-12">
                <div className="text-center group">
                   <div className="w-12 h-12 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center mb-4 mx-auto ambient-shadow group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-[20px]" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                   </div>
                   <span className="text-4xl font-black block text-primary tracking-tighter">39</span>
                   <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.15em] opacity-60 block mt-1">Confirmed</span>
                </div>
                <div className="text-center group">
                   <div className="w-12 h-12 bg-error/10 text-error rounded-2xl flex items-center justify-center mb-4 mx-auto ambient-shadow group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-[20px]" style={{fontVariationSettings: "'FILL' 1"}}>cancel</span>
                   </div>
                   <span className="text-4xl font-black block text-error tracking-tighter">11</span>
                   <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.15em] opacity-60 block mt-1">Deficient</span>
                </div>
             </div>

             <div className="space-y-6">
                <h3 className="font-headline font-black text-xl mb-8 text-primary tracking-tight">Psychometric Insights</h3>
                
                <div className="p-8 rounded-3xl bg-surface-container-low ghost-border ambient-shadow relative overflow-hidden group">
                   <div className="absolute top-0 left-0 w-2 h-full bg-secondary group-hover:w-3 transition-all"></div>
                   <div className="flex items-center gap-4 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center">
                         <span className="material-symbols-outlined text-[16px]">verified</span>
                      </div>
                      <h4 className="font-black text-sm uppercase tracking-wider text-primary">Structural Strength</h4>
                   </div>
                   <p className="text-base text-on-surface-variant font-medium leading-[1.6]">You exhibited exceptional cognitive alignment within Educational Philosophies (95th Percentile).</p>
                </div>
                
                <div className="p-8 rounded-3xl bg-surface-container-low ghost-border ambient-shadow relative overflow-hidden group">
                   <div className="absolute top-0 left-0 w-2 h-full bg-error group-hover:w-3 transition-all"></div>
                   <div className="flex items-center gap-4 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-error/10 text-error flex items-center justify-center">
                         <span className="material-symbols-outlined text-[16px]">crisis_alert</span>
                      </div>
                      <h4 className="font-black text-sm uppercase tracking-wider text-primary">Intervention Zone</h4>
                   </div>
                   <p className="text-base text-on-surface-variant font-medium leading-[1.6]">Performance degradation noted in Formative vs Summative heuristics. Targeted review recommended.</p>
                </div>
             </div>
          </div>
       </div>

       <footer className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-xl p-8 ghost-border-t z-30">
          <div className="max-w-xl mx-auto flex gap-6">
             <button className="flex-1 py-5 rounded-full font-black text-primary border-2 border-primary/10 hover:bg-surface-container-low transition-all text-xs uppercase tracking-widest active:scale-95">
                Audit Responses
             </button>
             <button className="flex-1 py-5 rounded-full font-black primary-gradient text-white shadow-2xl hover:shadow-primary/40 transition-all text-xs uppercase tracking-widest active:scale-95">
                Next Evaluation
             </button>
          </div>
       </footer>
    </div>
  );
}
