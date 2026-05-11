import React from 'react';
import AdminLayout from '../components/AdminLayout';

export default function BulkUpload() {
  return (
    <AdminLayout title="Data Import">
      <div className="p-8 max-w-4xl mx-auto py-12">
            <h1 className="text-3xl font-extrabold font-headline mb-2">Bulk Upload</h1>
            <p className="text-on-surface-variant mb-10">Import students or questions via CSV.</p>

            <div className="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/10 shadow-sm mb-8">
               <div className="flex justify-between items-center mb-6 border-b border-surface-container pb-6">
                  <div>
                     <h3 className="font-headline font-bold text-lg">Upload File</h3>
                     <p className="text-sm text-on-surface-variant">Select a .csv or .xlsx file corresponding to our template.</p>
                  </div>
                  <a href="#" className="text-primary text-sm font-semibold flex items-center gap-1 hover:underline">
                     <span className="material-symbols-outlined text-[18px]">download</span> Download Template
                  </a>
               </div>

               <div className="border-2 border-dashed border-primary-fixed-dim/50 rounded-2xl p-12 flex flex-col items-center justify-center bg-primary-fixed/10 hover:bg-primary-fixed/20 transition-colors cursor-pointer group">
                  <div className="w-16 h-16 rounded-full bg-primary-container/20 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                     <span className="material-symbols-outlined text-3xl">cloud_upload</span>
                  </div>
                  <h4 className="font-bold font-headline text-lg mb-1">Drag and drop file here</h4>
                  <p className="text-sm text-on-surface-variant">or <span className="text-primary font-medium">browse your computer</span></p>
               </div>
            </div>

            <div className="bg-surface-container-low rounded-2xl p-6 border-l-4 border-secondary/80">
               <h4 className="font-bold flex items-center gap-2 mb-2 text-on-surface">
                  <span className="material-symbols-outlined text-secondary text-[20px]">info</span> Formatting Rules
               </h4>
               <ul className="text-sm text-on-surface-variant space-y-1 list-disc pl-8">
                  <li>Ensure headers match the template exactly.</li>
                  <li>Maximum file size is 10MB.</li>
                  <li>Duplicate emails will completely fail the row import.</li>
               </ul>
            </div>
         </div>
    </AdminLayout>
  );
}
