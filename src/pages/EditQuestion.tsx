import React from 'react';

export default function EditQuestion() {
  return (
    <div className="bg-surface text-on-surface min-h-screen flex antialiased">
      {/* SideNavBar Nav Area Hidden */}
      <nav className="hidden lg:flex w-64 flex-col bg-surface-container-low fixed h-screen z-50 p-6 border-r border-transparent">
        <h1 className="text-lg font-bold text-primary-container font-headline">Admin Portal</h1>
      </nav>

      <main className="flex-1 lg:ml-64 flex flex-col min-h-screen relative">
         <header className="fixed top-0 right-0 w-full lg:w-[calc(100%-16rem)] z-40 bg-surface/70 backdrop-blur-xl h-16 flex items-center px-8 border-b border-surface-container">
            <h1 className="text-xl font-extrabold text-primary-container font-headline tracking-tight">Scholarly Reviewer</h1>
         </header>

         <div className="mt-16 p-8 max-w-5xl mx-auto w-full flex-1">
            <nav className="flex items-center gap-2 text-sm text-on-surface-variant font-label mb-6">
              <span>Question Bank</span>
              <span className="material-symbols-outlined text-sm">chevron_right</span>
              <span className="text-primary font-medium">Edit Question</span>
            </nav>

            <div className="flex justify-between items-end mb-8">
               <div>
                  <h2 className="text-3xl font-headline font-bold text-primary mb-2">Edit MCQ</h2>
                  <p className="text-on-surface-variant text-sm">Update question content, options, and rationales.</p>
               </div>
               <div className="flex gap-3">
                  <button className="px-6 py-2.5 rounded-full text-primary font-medium">Cancel</button>
                  <button className="px-6 py-2.5 rounded-full text-white gradient-primary font-medium shadow-sm">Save Changes</button>
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               <div className="lg:col-span-2 space-y-8">
                  <div className="bg-surface-container-low rounded-xl p-6 relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                     <h3 className="font-headline font-semibold text-lg text-primary mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined">edit_note</span> Question Stem
                     </h3>
                     <div className="flex items-center gap-2 mb-3 pb-3 border-b border-outline-variant/30 text-outline">
                        <button className="p-1"><span className="material-symbols-outlined">format_bold</span></button>
                        <button className="p-1"><span className="material-symbols-outlined">format_italic</span></button>
                        <button className="p-1"><span className="material-symbols-outlined">format_underlined</span></button>
                        <div className="w-px h-5 bg-outline-variant/50 mx-1"></div>
                        <button className="p-1"><span className="material-symbols-outlined">format_list_bulleted</span></button>
                     </div>
                     <textarea className="w-full h-32 bg-surface-container-lowest border-none rounded-md resize-none p-3 text-sm font-body" defaultValue="The cognitive domain of Bloom's Taxonomy focuses on intellectual skills..."></textarea>
                  </div>

                  <div className="bg-surface-container-low rounded-xl p-6">
                     <h3 className="font-headline font-semibold text-lg text-primary mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined">checklist</span> Answer Options
                     </h3>
                     <div className="space-y-4">
                        <div className="flex items-start gap-4 p-4 rounded-md bg-surface-container-lowest outline outline-1 outline-outline-variant/20">
                           <input type="radio" name="answer" className="mt-1 w-5 h-5 text-secondary accent-secondary" />
                           <div className="flex-1">
                              <span className="block font-semibold text-sm mb-1">Option A</span>
                              <textarea className="w-full h-12 bg-transparent border-none p-0 text-sm resize-none" defaultValue="Reciting a poem from memory."></textarea>
                           </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 rounded-md bg-secondary/5 border-l-4 border-secondary/80">
                           <input type="radio" name="answer" defaultChecked className="mt-1 w-5 h-5 text-secondary accent-secondary" />
                           <div className="flex-1">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-semibold text-sm">Option B <span className="ml-2 text-[10px] uppercase bg-secondary/20 text-secondary px-2 rounded-full">Correct</span></span>
                              </div>
                              <textarea className="w-full h-12 bg-transparent border-none p-0 text-sm resize-none" defaultValue="Critiquing a peer's essay based on a rubric."></textarea>
                           </div>
                        </div>
                     </div>
                     <button className="mt-4 flex items-center gap-2 text-primary font-medium text-sm px-4 py-2 hover:bg-primary/5 rounded-full">
                        <span className="material-symbols-outlined text-[20px]">add</span> Add Option
                     </button>
                  </div>
               </div>

               <div className="space-y-8">
                  <div className="bg-surface-container-low rounded-xl p-6">
                     <h3 className="font-headline font-semibold text-base text-primary mb-4">Metadata</h3>
                     <div className="space-y-4">
                        <div>
                           <label className="block text-xs font-semibold text-on-surface-variant mb-1">Subject / Domain</label>
                           <select className="w-full bg-surface-container-lowest border-none rounded-md text-sm py-2 px-3">
                              <option>Professional Education</option>
                           </select>
                        </div>
                        <div>
                           <label className="block text-xs font-semibold text-on-surface-variant mb-1">Difficulty Level</label>
                           <div className="flex gap-2">
                              <button className="flex-1 py-1.5 text-xs rounded-md bg-surface-container-lowest text-outline">Easy</button>
                              <button className="flex-1 py-1.5 text-xs rounded-md bg-primary/10 text-primary">Medium</button>
                              <button className="flex-1 py-1.5 text-xs rounded-md bg-surface-container-lowest text-outline">Hard</button>
                           </div>
                        </div>
                     </div>
                  </div>
                  <div className="bg-surface-container-low rounded-xl p-6">
                     <h3 className="font-headline font-semibold text-base text-primary mb-4">Publishing</h3>
                     <button className="w-full py-2 border border-error/50 text-error rounded-full text-sm font-medium hover:bg-error/5 flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">archive</span> Archive Question
                     </button>
                  </div>
               </div>
            </div>
         </div>
      </main>
    </div>
  );
}
