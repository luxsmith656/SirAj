import React from 'react';
import { Link } from 'react-router-dom';

export default function Onboarding() {
  return (
    <div className="bg-surface text-on-surface font-body min-h-[100dvh] flex flex-col antialiased">
       <div className="flex-1 flex flex-col max-w-md mx-auto w-full px-6 py-12">
          
          {/* Progress indicators */}
          <div className="flex justify-center gap-2 mb-12">
             <div className="h-1.5 w-8 bg-primary rounded-full"></div>
             <div className="h-1.5 w-2 bg-surface-container-highest rounded-full"></div>
             <div className="h-1.5 w-2 bg-surface-container-highest rounded-full"></div>
          </div>

          <div className="text-center mb-10 flex-1 flex flex-col justify-center">
             <div className="w-24 h-24 mx-auto bg-primary-fixed rounded-full flex items-center justify-center mb-8 relative">
               <span className="material-symbols-outlined text-4xl text-primary" style={{fontVariationSettings: "'FILL' 1"}}>school</span>
               <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-secondary-container rounded-full flex items-center justify-center border-4 border-surface">
                  <span className="material-symbols-outlined text-secondary text-lg">check</span>
               </div>
             </div>
             <h1 className="text-3xl font-extrabold font-headline mb-4 tracking-tight">Personalize Your Path</h1>
             <p className="text-on-surface-variant text-base leading-relaxed max-w-[280px] mx-auto font-medium">
                Tell us about your major and target exam date so we can tailor your study schedule.
             </p>
          </div>

          <div className="space-y-4">
             <Link to="/focus" className="block w-full">
               <button className="w-full bg-primary text-on-primary font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-lg">
                  Let's Get Started
               </button>
             </Link>
             <button className="w-full bg-transparent text-outline font-semibold py-4 rounded-xl hover:bg-surface-container-low transition-colors">
                Skip for now
             </button>
          </div>
       </div>
    </div>
  );
}
