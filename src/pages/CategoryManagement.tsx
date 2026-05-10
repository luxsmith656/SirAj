import React from 'react';

export default function CategoryManagement() {
  return (
    <div className="bg-surface text-on-surface font-body min-h-screen flex antialiased">
      {/* SideNavBar mock */}
      <nav className="hidden lg:flex flex-col h-full bg-surface-container-low w-64 p-6 space-y-4 fixed left-0 top-0 border-r border-transparent">
        <div className="mb-8">
           <h1 className="text-2xl font-extrabold text-primary-container font-headline">LET Mastery</h1>
           <p className="text-sm font-medium text-on-surface-variant">Admin Console</p>
        </div>
        <button className="gradient-primary text-on-primary rounded-full py-3 font-semibold mb-6 flex justify-center items-center gap-2">
           <span className="material-symbols-outlined">add</span> New Entry
        </button>
        <ul className="flex-1 space-y-2">
            <li><a href="#" className="flex items-center gap-3 px-4 py-3 rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors"><span className="material-symbols-outlined">dashboard</span> Dashboard</a></li>
            <li><a href="#" className="flex items-center gap-3 px-4 py-3 rounded-full bg-surface-container-lowest text-secondary font-bold shadow-sm"><span className="material-symbols-outlined">menu_book</span> Curriculum</a></li>
        </ul>
      </nav>

      <main className="lg:ml-64 flex-1 flex flex-col min-h-screen w-full relative">
         <header className="fixed top-0 right-0 lg:left-64 h-16 flex items-center justify-between px-8 bg-surface/70 backdrop-blur-xl z-40">
           <div className="flex items-center gap-4">
             <span className="text-lg font-bold text-primary-container font-headline">Admin Panel</span>
             <span className="text-outline font-label text-sm">/ Curriculum</span>
           </div>
         </header>

         <div className="pt-24 px-8 pb-12 max-w-6xl mx-auto w-full">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-container font-headline tracking-tight mb-2">Category Management</h2>
                <p className="text-on-surface-variant font-body">Organize curriculum hierarchy.</p>
              </div>
              <div className="flex gap-3">
                 <button className="px-6 py-2.5 rounded-full bg-secondary-container text-on-secondary-container font-semibold text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">download</span> Export Tree
                 </button>
                 <button className="px-6 py-2.5 rounded-full gradient-primary text-on-primary font-semibold text-sm flex items-center gap-2 shadow-lg">
                    <span className="material-symbols-outlined text-[18px]">create_new_folder</span> Add Root Category
                 </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
               <div className="lg:col-span-8 bg-surface-container-low rounded-xl p-6 relative overflow-hidden">
                  <div className="flex items-center justify-between z-10 relative mb-4">
                    <h3 className="font-headline font-bold text-xl text-primary-container">Curriculum Structure</h3>
                    <div className="flex gap-2">
                      <button className="p-2 text-on-surface-variant bg-surface-container-highest rounded-full"><span className="material-symbols-outlined">unfold_more</span></button>
                    </div>
                  </div>
                  
                  <div className="space-y-3 z-10 relative">
                     <div className="bg-surface-container-lowest rounded-lg p-3 group">
                        <div className="flex items-center gap-3 cursor-pointer">
                           <span className="material-symbols-outlined text-secondary" style={{fontVariationSettings: "'FILL' 1"}}>folder_open</span>
                           <span className="font-semibold text-on-surface">General Education (GenEd)</span>
                           <span className="px-2 py-0.5 bg-surface-container text-xs rounded-full ml-2">4 Subjects</span>
                        </div>
                        <div className="ml-8 mt-2 pl-4 border-l-2 border-surface-container-high space-y-2">
                           <div className="flex items-center justify-between py-2 px-3 rounded-md bg-surface-container-highest/30">
                              <div className="flex items-center gap-3">
                                 <span className="material-symbols-outlined text-primary-fixed-dim text-[18px]">folder</span>
                                 <span className="font-medium text-sm text-on-surface">English Communication</span>
                                 <span className="text-xs text-on-surface-variant ml-2">120 Questions</span>
                              </div>
                           </div>
                           <div className="flex items-center justify-between py-2 px-3 rounded-md">
                              <div className="flex items-center gap-3">
                                 <span className="material-symbols-outlined text-primary-fixed-dim text-[18px]">folder</span>
                                 <span className="font-medium text-sm text-on-surface">Mathematics</span>
                                 <span className="text-xs text-on-surface-variant ml-2">85 Questions</span>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
               
               <div className="lg:col-span-4 flex flex-col gap-8">
                  <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/10">
                     <div className="flex items-center gap-3 mb-6">
                        <span className="material-symbols-outlined text-secondary text-3xl" style={{fontVariationSettings: "'FILL' 1"}}>folder</span>
                        <div>
                           <h4 className="font-headline font-bold text-lg">English Communication</h4>
                           <p className="text-xs font-label text-outline uppercase tracking-wider">Subcategory of GenEd</p>
                        </div>
                     </div>
                     <div className="space-y-4">
                        <div>
                           <label className="block text-xs font-label text-on-surface-variant mb-1">Category Name</label>
                           <input type="text" className="w-full bg-surface-container-high border-none rounded-md px-4 py-2 font-body text-sm" defaultValue="English Communication" />
                        </div>
                        <div>
                           <label className="block text-xs font-label text-on-surface-variant mb-1">Description (Optional)</label>
                           <textarea className="w-full bg-surface-container-high border-none rounded-md px-4 py-2 font-body text-sm resize-none" rows={3} defaultValue="Covers grammar, reading comprehension, and literature." />
                        </div>
                        <div className="flex gap-4 pt-2">
                           <div className="flex-1 bg-surface-container py-3 rounded-md text-center">
                              <span className="block text-2xl font-bold text-primary font-headline">120</span>
                              <span className="text-xs text-on-surface-variant uppercase">Questions</span>
                           </div>
                           <div className="flex-1 bg-surface-container py-3 rounded-md text-center">
                              <span className="block text-2xl font-bold text-secondary font-headline">Active</span>
                              <span className="text-xs text-on-surface-variant uppercase">Status</span>
                           </div>
                        </div>
                        <div className="mt-6 pt-4 border-t border-surface-container-high flex justify-end gap-3">
                           <button className="px-4 py-2 rounded-full text-primary font-medium text-sm">Cancel</button>
                           <button className="px-6 py-2 rounded-full gradient-primary text-white font-semibold text-sm shadow-sm">Save Changes</button>
                        </div>
                     </div>
                  </div>
                  
                  <div className="bg-primary-container text-on-primary-container rounded-xl p-6">
                     <div className="flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined">lightbulb</span>
                        <h4 className="font-headline font-bold">Taxonomy Tips</h4>
                     </div>
                     <p className="text-sm leading-relaxed opacity-90">Keep hierarchy shallow to ensure seamless navigation for students in the app.</p>
                  </div>
               </div>
            </div>
         </div>
      </main>
    </div>
  );
}
