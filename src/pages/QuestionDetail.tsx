import React from 'react';

export default function QuestionDetail() {
  return (
    <div className="bg-surface text-on-surface min-h-screen font-body flex">
      {/* SideNavBar Placeholder */}
      <nav className="hidden md:flex flex-col bg-surface-container-low w-64 h-screen fixed z-50 p-6 border-r border-transparent">
        <h2 className="text-lg font-bold text-primary-container font-headline">Admin Portal</h2>
      </nav>

      <main className="flex-1 md:ml-64 relative min-h-screen">
        <header className="fixed top-0 right-0 w-full md:w-[calc(100%-16rem)] h-16 z-40 bg-surface/80 backdrop-blur-lg flex items-center px-8 border-b border-surface-container shadow-sm">
           <button className="text-outline hover:text-primary mr-4"><span className="material-symbols-outlined">arrow_back</span></button>
           <h1 className="text-xl font-extrabold text-primary-container font-headline tracking-tighter">Scholarly Reviewer</h1>
        </header>

        <div className="pt-24 pb-12 px-8 max-w-7xl mx-auto flex flex-col gap-8">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
               <div>
                   <span className="text-xs font-label text-outline uppercase tracking-wider mb-2 block">Question ID: BIO-402</span>
                   <h2 className="text-3xl font-headline font-bold text-on-surface tracking-tight max-w-3xl">Cellular Respiration and ATP Yield Analysis</h2>
               </div>
               <div className="flex gap-3">
                   <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-secondary-container text-on-secondary-container font-medium hover:bg-secondary hover:text-white transition-colors">
                     <span className="material-symbols-outlined text-sm">edit</span> Edit
                   </button>
               </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 flex flex-col gap-8">
                 <section className="elevated-card rounded-2xl p-8 ghost-border relative overflow-hidden bg-surface-container-lowest">
                    <div className="flex items-center gap-3 mb-6">
                       <span className="bg-surface-container-high text-on-surface-variant px-3 py-1 rounded-full text-xs font-medium">Biology</span>
                       <span className="bg-surface-container-high text-on-surface-variant px-3 py-1 rounded-full text-xs font-medium">Advanced</span>
                    </div>
                    <div className="prose text-on-surface font-body mb-8 text-lg">
                       <p>During cellular respiration, a single molecule of glucose is completely oxidized to carbon dioxide and water. Assuming a perfectly efficient electron transport chain... what is the theoretical maximum net yield of ATP produced exclusively via oxidative phosphorylation?</p>
                    </div>
                    <div className="rounded-lg overflow-hidden mb-8 bg-surface-container-low p-2 h-64 flex items-center justify-center border border-outline-variant/20">
                       <span className="text-outline">Image Placeholder</span>
                    </div>

                    <div className="flex flex-col gap-4">
                       <h3 className="text-xl font-headline font-bold text-on-surface mb-2">Options</h3>
                       <div className="p-4 rounded-xl bg-surface-container-low flex items-start gap-4">
                          <span className="text-primary font-bold">A</span>
                          <p>2 ATP</p>
                       </div>
                       <div className="p-4 rounded-xl bg-surface-container-lowest border-l-4 border-l-secondary relative overflow-hidden shadow-sm flex items-start gap-4">
                          <div className="absolute inset-0 bg-secondary/5"></div>
                          <span className="text-secondary font-bold flex items-center gap-2 z-10">C <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span></span>
                          <p className="font-medium z-10 mt-1">34 ATP</p>
                       </div>
                    </div>
                 </section>

                 <section className="bg-surface-container-low rounded-2xl p-8">
                    <div className="flex items-center gap-2 mb-4">
                       <span className="material-symbols-outlined text-primary" style={{fontVariationSettings: "'FILL' 1"}}>lightbulb</span>
                       <h3 className="text-xl font-headline font-bold text-primary">Rationale</h3>
                    </div>
                    <p className="text-on-surface-variant leading-relaxed">
                       While the total theoretical yield of cellular respiration is often cited as 38 ATP... The question specifically asks for the yield produced exclusively via oxidative phosphorylation.
                    </p>
                 </section>
              </div>

              <div className="lg:col-span-4 flex flex-col gap-6">
                 <section className="elevated-card rounded-2xl p-6 ghost-border bg-surface-container-lowest">
                    <h3 className="font-headline font-bold text-lg mb-6 border-b border-surface-variant pb-4">Performance Metrics</h3>
                    <div className="flex justify-center py-6">
                       <div className="w-32 h-32 rounded-full border-8 border-secondary flex flex-col items-center justify-center">
                          <span className="text-3xl font-bold font-headline text-secondary tracking-tighter">68%</span>
                          <span className="text-xs text-outline">Success</span>
                       </div>
                    </div>
                 </section>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
}
