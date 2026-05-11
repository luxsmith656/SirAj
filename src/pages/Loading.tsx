import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Loading() {
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => navigate('/onboarding'), 500); // Redirect after loading
          return 100;
        }
        return prev + Math.floor(Math.random() * 15) + 5;
      });
    }, 200);
    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="bg-surface text-on-surface font-body min-h-[100dvh] flex flex-col items-center justify-center relative overflow-hidden antialiased bg-surface-container-lowest">
       {/* Background decorative elements */}
       <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] opacity-60"></div>
       <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[100px] opacity-60"></div>
       
       <div className="z-10 flex flex-col items-center max-w-sm w-full px-8 text-center">
          <div className="w-24 h-24 primary-gradient rounded-[2rem] mb-12 flex items-center justify-center border border-white shadow-2xl ambient-shadow rotate-6 animate-pulse">
             <span className="text-4xl font-black font-headline tracking-tighter text-white">S</span>
          </div>
          <h1 className="text-4xl font-black font-headline mb-4 tracking-tighter text-primary">Scholarly Reviewer</h1>
          <p className="text-on-surface-variant text-base font-bold uppercase tracking-[0.2em] mb-12 opacity-60">Synchronizing Repository</p>
          
          <div className="w-full max-w-[240px] space-y-4">
            <div className="w-full bg-surface-container-low h-2 rounded-full overflow-hidden ghost-border ambient-shadow-sm p-[2px]">
               <div 
                 className="h-full primary-gradient transition-all duration-300 ease-out rounded-full shadow-[0_0_10px_rgba(30,136,229,0.5)]"
                 style={{ width: `${progress}%` }}
               ></div>
            </div>
            <div className="flex justify-between items-center px-1">
               <div className="flex gap-1">
                  <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${progress > 20 ? 'bg-primary' : 'bg-surface-container'}`}></div>
                  <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${progress > 50 ? 'bg-primary' : 'bg-surface-container'}`}></div>
                  <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${progress > 80 ? 'bg-primary' : 'bg-surface-container'}`}></div>
               </div>
               <div className="text-[10px] font-black text-primary tracking-widest">{progress}%</div>
            </div>
          </div>
       </div>

       <div className="absolute bottom-12 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em] opacity-40">
          Advanced Pedagogical Engine v4.0
       </div>
    </div>
  );
}
