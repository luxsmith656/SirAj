import React from 'react';
import { Link } from 'react-router-dom';

export default function Onboarding() {
  return (
    <div className="bg-surface text-on-surface font-body min-h-[100dvh] flex flex-col antialiased relative bg-surface-container-lowest">
       {/* Background accent */}
       <div className="absolute top-0 right-0 w-full h-[600px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>

       <div className="flex-1 flex flex-col max-w-xl mx-auto w-full px-8 py-16 z-10 relative">
          
          {/* Progress indicators */}
          <div className="flex justify-center gap-3 mb-16">
             <div className="h-1.5 w-12 primary-gradient rounded-full ambient-shadow"></div>
             <div className="h-1.5 w-4 bg-surface-container rounded-full"></div>
             <div className="h-1.5 w-4 bg-surface-container rounded-full"></div>
          </div>

          <div className="text-center mb-10 flex-1 flex flex-col justify-center items-center">
             <div className="w-32 h-32 bg-white rounded-[2.5rem] flex items-center justify-center mb-12 relative ambient-shadow ghost-border group hover:scale-105 transition-transform duration-500">
               <span className="material-symbols-outlined text-5xl text-primary group-hover:rotate-12 transition-transform duration-500" style={{fontVariationSettings: "'FILL' 1"}}>school</span>
               <div className="absolute -bottom-4 -right-4 w-12 h-12 primary-gradient rounded-full flex items-center justify-center border-4 border-white shadow-xl">
                  <span className="material-symbols-outlined text-white text-xl">verified</span>
               </div>
             </div>
             <h1 className="text-4xl md:text-5xl font-extrabold font-headline mb-6 tracking-tighter text-primary">Scholarly Genesis</h1>
             <p className="text-on-surface-variant text-lg leading-relaxed max-w-sm mx-auto font-medium tracking-tight">
                Calibrate your academic trajectory. Define your specialization and timeline for optimal simulation accuracy.
             </p>
          </div>

          <div className="space-y-6 w-full max-w-md mx-auto">
             <Link to="/focus" className="block w-full">
               <button className="w-full primary-gradient text-white font-black py-6 rounded-full shadow-2xl hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300 active:scale-95 text-xs uppercase tracking-widest">
                  Begin Calibration
               </button>
             </Link>
             <button className="w-full bg-surface-container-low text-on-surface-variant font-black py-5 rounded-full hover:bg-white hover:ambient-shadow transition-all duration-300 text-[10px] uppercase tracking-[0.2em] opacity-80 active:scale-95">
                Defer to Defaults
             </button>
          </div>
       </div>
    </div>
  );
}
