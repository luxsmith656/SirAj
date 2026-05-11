import React, { useState } from 'react';
import AdminLayout from '../components/AdminLayout';

export default function CategoryManagement() {
  const [selectedTopic, setSelectedTopic] = useState('02');
  const [threshold, setThreshold] = useState(75);
  const [lifecycle, setLifecycle] = useState('active');

  return (
    <AdminLayout title="Scholarly Reviewer">
      <div className="flex-1 px-8 py-12 lg:px-12 max-w-7xl mx-auto w-full space-y-12">
        {/* Breadcrumbs & Header */}
        <div className="space-y-6">
          <nav aria-label="Breadcrumb" className="flex text-[10px] items-center gap-3 font-black uppercase tracking-[0.2em] text-on-surface-variant/60">
            <span className="hover:text-primary cursor-pointer transition-colors">Curriculum</span>
            <span className="material-symbols-outlined text-[12px] opacity-40">chevron_right</span>
            <span className="hover:text-primary cursor-pointer transition-colors">Categories</span>
            <span className="material-symbols-outlined text-[12px] opacity-40">chevron_right</span>
            <span className="text-primary">General Education</span>
          </nav>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-3xl">
              <h1 className="text-4xl lg:text-7xl font-headline font-black text-primary tracking-tighter leading-[0.85] mb-4">General Education</h1>
              <p className="text-on-surface-variant text-xl font-medium leading-[1.6] max-w-2xl">Authoritative control over curriculum architecture, taxonomic hierarchies, and objective validation parameters.</p>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => alert('Simulating view...')}
                className="px-8 py-4 rounded-full bg-white text-primary font-black text-[10px] uppercase tracking-widest hover:bg-surface-container-low transition-all ambient-shadow ghost-border flex items-center gap-2 active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px]">visibility</span>
                Simulate View
              </button>
              <button 
                onClick={() => alert('Committing schema to blockchain...')}
                className="px-10 py-5 rounded-full primary-gradient text-white font-black text-[10px] uppercase tracking-widest shadow-2xl hover:shadow-primary/40 transition-all flex items-center gap-2 active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px]">verified</span>
                Commit Schema
              </button>
            </div>
          </div>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Category Details & Settings (4 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-10">
            {/* Category Details Card */}
            <section className="bg-white rounded-[2.5rem] p-10 relative overflow-hidden group ghost-border ambient-shadow">
              <div className="absolute top-0 left-0 w-2 h-full primary-gradient opacity-20 group-hover:opacity-100 transition-opacity"></div>
              <h2 className="text-xl font-headline font-black text-primary mb-10 flex items-center gap-4 tracking-tight">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>edit_document</span>
                Taxonomic Metadata
              </h2>
              <div className="space-y-8 font-body">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1" htmlFor="category_name">Nomenclature</label>
                   <input className="w-full bg-surface-container-low/30 border-none rounded-2xl px-6 py-4 text-primary font-bold ambient-shadow-sm focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all outline-none" id="category_name" type="text" defaultValue="General Education" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1" htmlFor="category_desc">Scholarly Abstract</label>
                   <textarea className="w-full bg-surface-container-low/30 border-none rounded-2xl px-6 py-4 text-on-surface-variant font-medium leading-relaxed ambient-shadow-sm focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all outline-none resize-none" id="category_desc" rows={4} defaultValue="Core knowledge areas foundational to all degree programs, covering mathematics, sciences, and humanities." />
                </div>
                <div className="space-y-4">
                   <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Lifecycle State</label>
                   <div className="grid grid-cols-3 gap-3">
                     {[
                       { id: 'active', label: 'Active' },
                       { id: 'draft', label: 'Draft' },
                       { id: 'archived', label: 'Archived' }
                     ].map(state => (
                        <button 
                          key={state.id} 
                          onClick={() => setLifecycle(state.id)}
                          className={`py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${lifecycle === state.id ? 'bg-primary text-white shadow-xl' : 'bg-surface-container-low text-on-surface-variant/40 hover:bg-surface-container-highest'}`}
                        >
                           {state.label}
                        </button>
                     ))}
                   </div>
                </div>
              </div>
            </section>

            {/* Assessment Settings Card */}
            <section className="bg-white rounded-[2.5rem] p-10 ghost-border ambient-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <h2 className="text-xl font-headline font-black text-primary mb-10 flex items-center gap-4 tracking-tight">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>tune</span>
                Heuristic Constraints
              </h2>
              <div className="space-y-10">
                <div className="space-y-4">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] flex items-center gap-2">
                       Passing Threshold
                    </label>
                    <span className="text-2xl font-black font-headline text-secondary tracking-tighter">{threshold}%</span>
                  </div>
                  <div className="relative h-2 bg-surface-container-low rounded-full overflow-hidden ambient-shadow-sm p-[2px]">
                    <div className="h-full primary-gradient rounded-full shadow-[0_0_10px_rgba(30,136,229,0.3)]" style={{ width: `${threshold}%` }}></div>
                    <input 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                      max="100" min="0" type="range" 
                      value={threshold}
                      onChange={(e) => setThreshold(parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div className="space-y-4 bg-surface-container-low/50 rounded-3xl p-6 ghost-border">
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] flex items-center gap-2 ml-1">
                     Temporal Limit
                  </label>
                  <div className="flex items-center gap-4">
                    <input className="w-24 bg-white border-none rounded-2xl px-6 py-4 text-center font-black text-primary ambient-shadow outline-none focus:ring-4 focus:ring-primary/5" type="number" defaultValue={45} />
                    <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest opacity-60">minutes per session</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-6 bg-surface-container-low/50 rounded-3xl ghost-border">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm ghost-border">
                       <span className="material-symbols-outlined text-[20px]">shuffle</span>
                    </div>
                    <div>
                      <p className="text-xs font-black text-primary uppercase tracking-widest">Entropy Protocol</p>
                      <p className="text-[10px] font-bold text-on-surface-variant opacity-60">Randomize question sequencing</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input className="sr-only peer" type="checkbox" defaultChecked />
                    <div className="w-12 h-6 bg-surface-container-highest rounded-full peer peer-focus:outline-none peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary shadow-inner"></div>
                  </label>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Sub-Topics (7 cols) */}
          <div className="lg:col-span-7 h-full">
            <section className="bg-white rounded-[3rem] p-10 lg:p-12 h-full flex flex-col ghost-border ambient-shadow relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
               
               <div className="flex justify-between items-start mb-12">
                <div className="max-w-md">
                  <h2 className="text-2xl font-headline font-black text-primary flex items-center gap-4 tracking-tight">
                    <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>account_tree</span>
                    Structural Hierarchy
                  </h2>
                  <p className="text-sm text-on-surface-variant mt-2 font-medium leading-relaxed">Dynamic reconfiguration of sub-domains. Positional data dictates student navigation logic.</p>
                </div>
                <button className="primary-gradient text-white rounded-full w-14 h-14 flex items-center justify-center shadow-2xl hover:scale-110 hover:shadow-primary/40 transition-all active:scale-95 group">
                  <span className="material-symbols-outlined text-[24px] group-hover:rotate-90 transition-transform duration-500">add</span>
                </button>
              </div>

              {/* Topic List */}
              <div className="flex-1 space-y-4">
                {[
                  { id: '01', title: 'College Algebra', lessons: 12, quizzes: 4 },
                  { id: '02', title: 'Introduction to Psychology', lessons: 8, timer: '60m' },
                  { id: '03', title: 'World History I', lessons: 15, quizzes: 5 }
                ].map((topic) => (
                  <div 
                    key={topic.id} 
                    onClick={() => setSelectedTopic(topic.id)}
                    className={`rounded-[2rem] p-8 flex items-center gap-8 transition-all group relative overflow-hidden cursor-pointer ${selectedTopic === topic.id ? 'bg-primary text-white shadow-2xl scale-[1.02] z-10' : 'bg-surface-container-low/30 hover:bg-white hover:ambient-shadow ghost-border'}`}
                  >
                    {selectedTopic === topic.id && <div className="absolute inset-0 primary-gradient opacity-10"></div>}
                    <span className={`material-symbols-outlined opacity-20 group-hover:opacity-60 transition-opacity ${selectedTopic === topic.id ? 'text-white' : 'text-on-surface-variant'}`}>drag_indicator</span>
                    
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-headline font-black text-xl transition-all duration-500 ${selectedTopic === topic.id ? 'bg-white text-primary rotate-12 shadow-xl' : 'bg-white text-primary ghost-border'}`}>
                      {topic.id}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className={`text-2xl font-black font-headline tracking-tight truncate ${selectedTopic === topic.id ? 'text-white' : 'text-primary'}`}>{topic.title}</h3>
                      <div className="flex items-center gap-6 mt-3">
                        <span className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${selectedTopic === topic.id ? 'text-white/60' : 'text-on-surface-variant/60'}`}>
                           <span className="material-symbols-outlined text-[16px]">description</span> 
                           {topic.lessons} Lessons
                        </span>
                        {topic.timer ? (
                          <span className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${selectedTopic === topic.id ? 'text-secondary-fixed' : 'text-on-secondary-container bg-secondary/10 px-3 py-1 rounded-full'}`}>
                             <span className="material-symbols-outlined text-[16px]">timer</span> 
                             Target: {topic.timer}
                          </span>
                        ) : (
                          <span className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${selectedTopic === topic.id ? 'text-white/60' : 'text-on-surface-variant/60'}`}>
                             <span className="material-symbols-outlined text-[16px]">quiz</span> 
                             {topic.quizzes} Assessments
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button 
                        onClick={(e) => { e.stopPropagation(); alert('Editing topic...'); }}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${selectedTopic === topic.id ? 'bg-white/10 hover:bg-white/20 text-white' : 'hover:bg-primary/5 text-on-surface-variant hover:text-primary ambient-shadow-sm bg-white'}`}
                      >
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); alert('Archiving topic...'); }}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${selectedTopic === topic.id ? 'bg-white/10 hover:bg-white/20 text-white' : 'hover:bg-error/5 text-on-surface-variant hover:text-error ambient-shadow-sm bg-white'}`}
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  </div>
                ))}

                {/* Drop Zone Placeholder */}
                <div className="border-4 border-dashed border-primary/5 rounded-[2.5rem] p-10 flex flex-col items-center justify-center bg-surface-container-low/20 text-on-surface-variant transition-colors hover:bg-primary/5 hover:border-primary/20">
                   <span className="material-symbols-outlined text-4xl mb-2 opacity-20">south</span>
                   <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Sequential Append Zone</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
