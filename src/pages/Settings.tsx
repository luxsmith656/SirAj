import React from 'react';

export default function Settings() {
  return (
    <div className="bg-surface text-on-surface font-body min-h-screen flex antialiased">
       <nav className="hidden md:flex w-64 bg-surface-container-lowest h-screen fixed z-50 p-6 shadow-sm border-r border-transparent">
        <h1 className="text-xl font-bold font-headline text-primary-container tracking-tighter">Scholarly Reviewer</h1>
      </nav>

      <main className="flex-1 md:ml-64 bg-surface/50 min-h-screen">
         <header className="h-16 flex items-center px-8 bg-surface-container-lowest border-b border-surface-container sticky top-0 z-40 shadow-sm">
            <h2 className="text-lg font-headline font-semibold">System Settings</h2>
         </header>

         <div className="p-8 max-w-4xl mx-auto py-12">
            <h1 className="text-3xl font-extrabold font-headline mb-2 text-on-surface">Platform Configuration</h1>
            <p className="text-on-surface-variant mb-10">Manage visual appearance, integrations, and instance details.</p>

            <div className="space-y-8">
               <section className="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/10 shadow-sm">
                  <h3 className="text-xl font-headline font-bold text-on-surface mb-6 border-b border-surface-container pb-4">General Details</h3>
                  <div className="space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                           <label className="block text-sm font-semibold text-on-surface-variant mb-1">Platform Name</label>
                           <input type="text" className="w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none" defaultValue="Lumina Academy LET Review" />
                        </div>
                        <div>
                           <label className="block text-sm font-semibold text-on-surface-variant mb-1">Contact Email</label>
                           <input type="email" className="w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none" defaultValue="support@luminaacademy.edu" />
                        </div>
                     </div>
                     <div>
                        <label className="block text-sm font-semibold text-on-surface-variant mb-1">Brand Logo</label>
                        <div className="flex items-center gap-4 mt-2">
                           <div className="w-16 h-16 rounded-xl bg-primary-container/20 flex items-center justify-center text-primary-container font-black text-2xl border border-primary-container/30">
                              L
                           </div>
                           <button className="px-4 py-2 rounded-full border border-outline-variant/30 text-sm font-medium hover:bg-surface-container transition-colors">Change Logo</button>
                        </div>
                     </div>
                  </div>
               </section>

               <section className="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/10 shadow-sm">
                  <h3 className="text-xl font-headline font-bold text-on-surface mb-6 border-b border-surface-container pb-4 flex items-center gap-2">
                     <span className="material-symbols-outlined text-primary">translate</span>
                     Localization
                  </h3>
                  <div className="grid grid-cols-1 gap-6">
                     <div>
                        <label className="block text-sm font-semibold text-on-surface-variant mb-1">Default Language</label>
                        <select className="w-full max-w-sm bg-surface-container-highest border-none rounded-lg px-4 py-3 text-sm font-medium outline-none">
                           <option>English (US)</option>
                           <option>Tagalog (PH)</option>
                           <option>Spanish (ES)</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-sm font-semibold text-on-surface-variant mb-1">Timezone</label>
                        <select className="w-full max-w-sm bg-surface-container-highest border-none rounded-lg px-4 py-3 text-sm font-medium outline-none">
                           <option>Asia/Manila (PHT)</option>
                           <option>America/New_York (EST)</option>
                        </select>
                     </div>
                  </div>
               </section>

               <div className="flex justify-end pt-4">
                  <button className="px-8 py-3 rounded-full gradient-primary text-white font-bold shadow-lg hover:shadow-xl transition-all">Save Global Configuration</button>
               </div>
            </div>
         </div>
      </main>
    </div>
  );
}
