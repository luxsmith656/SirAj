import React from 'react';

export default function Analytics() {
  return (
    <div className="bg-surface text-on-surface font-body min-h-screen flex antialiased">
      {/* SideNavBar Nav Placeholder */}
      <nav className="hidden md:flex w-64 bg-surface-container-lowest h-screen fixed z-50 p-6 shadow-sm">
        <h1 className="text-xl font-bold font-headline text-primary-container tracking-tighter">Scholarly Reviewer</h1>
      </nav>

      <main className="flex-1 md:ml-64 bg-surface/50 min-h-screen">
         <header className="h-16 flex items-center px-8 bg-surface-container-lowest border-b border-surface-container sticky top-0 z-40 shadow-sm">
            <h2 className="text-lg font-headline font-semibold text-primary">Student Analytics</h2>
         </header>

         <div className="p-8 max-w-[1400px] mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
               <div>
                  <h1 className="text-3xl font-extrabold font-headline mb-2">Performance Insights</h1>
                  <p className="text-on-surface-variant font-body">Analyze cohort mastery across subjects and modules.</p>
               </div>
               <div className="flex bg-surface-container-low rounded-full p-1 border border-outline-variant/20 shadow-sm">
                  <button className="px-6 py-2 rounded-full bg-surface-container-lowest text-primary font-semibold shadow text-sm">Overview</button>
                  <button className="px-6 py-2 rounded-full text-on-surface-variant font-medium hover:bg-surface-container-highest transition-colors text-sm">By Individual</button>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               <div className="elevated-card rounded-[1.5rem] p-6 ghost-border relative overflow-hidden group">
                  <div className="flex justify-between items-start mb-4">
                     <div className="w-10 h-10 rounded-full bg-primary-container/20 text-on-primary-container flex items-center justify-center">
                        <span className="material-symbols-outlined text-[20px]">groups</span>
                     </div>
                     <span className="text-xs font-bold text-secondary bg-secondary-container/30 px-2 py-1 rounded-md">+4%</span>
                  </div>
                  <div>
                     <h3 className="text-3xl font-extrabold font-headline text-on-surface mb-1">2,845</h3>
                     <p className="text-xs text-on-surface-variant uppercase font-semibold tracking-wider">Active Students</p>
                  </div>
               </div>
               
               <div className="bg-surface-container-lowest rounded-[1.5rem] p-6 shadow-sm border border-outline-variant/10 relative overflow-hidden group">
                  <div className="flex justify-between items-start mb-4">
                     <div className="w-10 h-10 rounded-full bg-tertiary-container/20 text-on-tertiary-container flex items-center justify-center">
                        <span className="material-symbols-outlined text-[20px]">timer</span>
                     </div>
                  </div>
                  <div>
                     <h3 className="text-3xl font-extrabold font-headline text-on-surface mb-1">42<span className="text-xl">m</span></h3>
                     <p className="text-xs text-on-surface-variant uppercase font-semibold tracking-wider">Daily Avg Time</p>
                  </div>
               </div>

               <div className="bg-surface-container-lowest rounded-[1.5rem] p-6 shadow-sm border border-outline-variant/10 relative overflow-hidden group">
                  <div className="flex justify-between items-start mb-4">
                     <div className="w-10 h-10 rounded-full bg-secondary-container/30 text-on-secondary-container flex items-center justify-center">
                        <span className="material-symbols-outlined text-[20px]">check_circle</span>
                     </div>
                  </div>
                  <div>
                     <h3 className="text-3xl font-extrabold font-headline text-on-surface mb-1">78<span className="text-xl">%</span></h3>
                     <p className="text-xs text-on-surface-variant uppercase font-semibold tracking-wider">Avg Assessment Score</p>
                  </div>
                  <div className="w-full bg-surface-container mt-4 h-1.5 rounded-full overflow-hidden">
                     <div className="w-[78%] h-full bg-secondary rounded-full"></div>
                  </div>
               </div>

               <div className="bg-surface-container-lowest rounded-[1.5rem] p-6 shadow-sm border border-outline-variant/10 relative overflow-hidden group">
                  <div className="flex justify-between items-start mb-4">
                     <div className="w-10 h-10 rounded-full bg-error-container/30 text-on-error-container flex items-center justify-center">
                        <span className="material-symbols-outlined text-[20px]">warning</span>
                     </div>
                  </div>
                  <div>
                     <h3 className="text-3xl font-extrabold font-headline text-on-surface mb-1">12</h3>
                     <p className="text-xs text-on-surface-variant uppercase font-semibold tracking-wider">At-Risk Students</p>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               <div className="bg-surface-container-lowest rounded-[2rem] p-8 shadow-sm border border-outline-variant/5">
                  <h3 className="text-xl font-bold font-headline mb-6 text-primary">Mastery by Subject Area</h3>
                  <div className="space-y-6">
                     <div>
                        <div className="flex justify-between text-sm mb-2 font-medium">
                           <span>Professional Education</span>
                           <span className="text-secondary font-bold">82%</span>
                        </div>
                        <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                           <div className="h-full bg-secondary w-[82%] rounded-full"></div>
                        </div>
                     </div>
                     <div>
                        <div className="flex justify-between text-sm mb-2 font-medium">
                           <span>General Education</span>
                           <span className="text-primary font-bold">75%</span>
                        </div>
                        <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                           <div className="h-full bg-primary-fixed-dim w-[75%] rounded-full"></div>
                        </div>
                     </div>
                     <div>
                        <div className="flex justify-between text-sm mb-2 font-medium">
                           <span>Major: Mathematics</span>
                           <span className="text-error font-bold">58%</span>
                        </div>
                        <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                           <div className="h-full bg-error-container w-[58%] rounded-full border border-error"></div>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="bg-surface-container-lowest rounded-[2rem] p-8 shadow-sm border border-outline-variant/5">
                  <h3 className="text-xl font-bold font-headline mb-6 text-primary">Problematic Questions</h3>
                  <div className="space-y-4">
                     <div className="flex gap-4 p-4 rounded-xl border border-outline-variant/15 hover:bg-surface-container-low transition-colors cursor-pointer">
                        <div className="w-12 h-12 rounded-lg bg-error-container/20 flex flex-col items-center justify-center shrink-0">
                           <span className="text-[10px] uppercase font-bold text-on-error-container">Pass Rate</span>
                           <span className="text-sm font-extrabold text-error">22%</span>
                        </div>
                        <div>
                           <p className="text-sm font-semibold mb-1 line-clamp-1">According to Vygotsky's socio-cultural theory...</p>
                           <span className="text-xs text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-md">ID: PED-102</span>
                        </div>
                     </div>
                  </div>
                  <button className="w-full mt-6 py-3 rounded-xl border border-primary/20 text-primary font-semibold hover:bg-primary/5 transition-colors">
                     View All Analysis
                  </button>
               </div>
            </div>
         </div>
      </main>
    </div>
  );
}
