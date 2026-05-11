import React from 'react';
import AdminLayout from '../components/AdminLayout';

export default function BulkUpload() {
  return (
    <AdminLayout title="Data Import">
      <div className="p-8 md:p-12 max-w-5xl mx-auto space-y-12 pb-24">
            <div>
               <h1 className="text-4xl md:text-5xl font-extrabold font-headline text-primary tracking-tighter mb-2">Mass Import</h1>
               <p className="text-lg text-on-surface-variant max-w-xl">Efficiently onboard students or synchronize your question archives via standard datasets.</p>
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-10 ambient-shadow ghost-border mb-12 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
               <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6 relative z-10">
                  <div>
                     <h3 className="font-headline font-bold text-2xl text-primary tracking-tight">Upload Dataset</h3>
                     <p className="text-sm text-on-surface-variant font-medium mt-1">Accepting .csv, .xlsx or standard school rosters.</p>
                  </div>
                  <a href="#" className="bg-surface-container-low text-primary text-sm font-bold px-6 py-3 rounded-full flex items-center gap-2 hover:bg-surface-container transition-all shadow-sm active:scale-95">
                     <span className="material-symbols-outlined text-[18px]">download</span> Get Template
                  </a>
               </div>

               <div className="border-2 border-dashed border-primary/20 rounded-2xl p-16 flex flex-col items-center justify-center bg-surface-container-low/40 hover:bg-surface-container-low/60 transition-all cursor-pointer group/upload relative z-10">
                  <div className="w-20 h-20 rounded-2xl primary-gradient text-white flex items-center justify-center mb-6 ambient-shadow group-hover/upload:scale-110 group-hover/upload:rotate-6 transition-all duration-500">
                     <span className="material-symbols-outlined text-4xl">cloud_upload</span>
                  </div>
                  <h4 className="font-bold font-headline text-xl mb-2 text-on-surface">Drop your file here</h4>
                  <p className="text-sm text-on-surface-variant font-medium">Drag a spreadsheet here or <span className="text-primary font-bold">browse local files</span></p>
               </div>
            </div>

            <div className="bg-surface-container-low rounded-xl p-8 ghost-border ambient-shadow">
               <h4 className="font-bold flex items-center gap-3 mb-4 text-primary tracking-tight uppercase text-xs tracking-widest">
                  <span className="material-symbols-outlined text-secondary text-[20px]" style={{fontVariationSettings: "'FILL' 1"}}>verified</span> 
                  Compliance Rules
               </h4>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-on-surface-variant font-medium">
                  <div className="flex gap-4">
                     <span className="text-secondary font-bold">01</span>
                     <p>Headers must precisely match the provided Scholarly template.</p>
                  </div>
                  <div className="flex gap-4">
                     <span className="text-secondary font-bold">02</span>
                     <p>Maximum entry limit of 5,000 rows per individual upload session.</p>
                  </div>
                  <div className="flex gap-4">
                     <span className="text-secondary font-bold">03</span>
                     <p>Duplicate unique identifiers will halt the entire batch process.</p>
                  </div>
                  <div className="flex gap-4">
                     <span className="text-secondary font-bold">04</span>
                     <p>Supported character encoding: UTF-8 only.</p>
                  </div>
               </div>
            </div>
         </div>
    </AdminLayout>
  );
}
