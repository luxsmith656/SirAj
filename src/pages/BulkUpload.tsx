import React from 'react';
import DashboardLayout from '../components/DashboardLayout';

export default function BulkUpload() {
  return (
    <DashboardLayout title="Data Import">
      <div className="p-8 max-w-4xl mx-auto py-12">
            <h1 className="text-3xl font-extrabold font-headline mb-2 text-[#1b366a]">Bulk Upload</h1>
            <p className="text-slate-500 mb-10">Import students or questions via CSV.</p>

            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm mb-8">
               <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-6">
                  <div>
                     <h3 className="font-headline font-bold text-lg text-slate-800">Upload File</h3>
                     <p className="text-sm text-slate-500">Select a .csv or .xlsx file corresponding to our template.</p>
                  </div>
                  <a href="#" className="text-[#1b366a] text-sm font-semibold flex items-center gap-1 hover:underline">
                     <span className="material-symbols-outlined text-[18px]">download</span> Download Template
                  </a>
               </div>

               <div className="border-2 border-dashed border-blue-200 rounded-2xl p-12 flex flex-col items-center justify-center bg-blue-50/50 hover:bg-blue-50 transition-colors cursor-pointer group">
                  <div className="w-16 h-16 rounded-full bg-blue-100 text-[#1b366a] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                     <span className="material-symbols-outlined text-3xl">cloud_upload</span>
                  </div>
                  <h4 className="font-bold font-headline text-lg mb-1 text-slate-800">Drag and drop file here</h4>
                  <p className="text-sm text-slate-500">or <span className="text-[#1b366a] font-medium">browse your computer</span></p>
               </div>
            </div>

            <div className="bg-indigo-50 rounded-2xl p-6 border-l-4 border-indigo-500 mb-8">
               <h4 className="font-bold flex items-center gap-2 mb-2 text-indigo-900">
                  <span className="material-symbols-outlined text-indigo-500 text-[20px]">info</span> Formatting Rules
               </h4>
               <ul className="text-sm text-indigo-800 space-y-1 list-disc pl-8">
                  <li>Ensure headers match the template exactly.</li>
                  <li>Maximum file size is 10MB.</li>
                  <li>Duplicate emails will completely fail the row import.</li>
               </ul>
            </div>

            <div className="flex justify-end gap-3 font-medium">
               <button className="px-6 py-2.5 rounded-xl text-slate-600 bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200">Cancel</button>
               <button className="px-6 py-2.5 rounded-xl text-white bg-[#1b366a] shadow-lg shadow-blue-900/20">Process Upload</button>
            </div>
         </div>
    </DashboardLayout>
  );
}
