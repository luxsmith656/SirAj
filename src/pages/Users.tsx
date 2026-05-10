import React from 'react';

export default function Users() {
  return (
    <div className="bg-surface text-on-surface font-body min-h-screen flex antialiased">
       <nav className="hidden md:flex w-64 bg-surface-container-lowest h-screen fixed z-50 p-6 shadow-sm">
        <h1 className="text-xl font-bold font-headline text-primary-container tracking-tighter">Scholarly Reviewer</h1>
      </nav>

      <main className="flex-1 md:ml-64 bg-surface/50 min-h-screen">
         <header className="h-16 flex items-center px-8 bg-surface-container-lowest border-b border-surface-container sticky top-0 z-40 shadow-sm">
            <h2 className="text-lg font-headline font-semibold">User Management</h2>
         </header>

         <div className="p-8 max-w-6xl mx-auto">
            <div className="flex justify-between items-end mb-8">
               <div>
                  <h1 className="text-3xl font-extrabold font-headline mb-2">Access Control</h1>
                  <p className="text-on-surface-variant">Manage students, faculty, and administrators.</p>
               </div>
               <button className="gradient-primary text-white px-6 py-3 rounded-full font-bold shadow flex items-center gap-2">
                  <span className="material-symbols-outlined">person_add</span> Invite User
               </button>
            </div>

            <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/10 overflow-hidden">
               <div className="p-4 border-b border-surface-container flex gap-4 bg-surface">
                  <div className="flex-1 max-w-sm relative">
                     <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
                     <input type="text" placeholder="Search by name or email" className="w-full pl-10 pr-4 py-2 rounded-full bg-surface-container-high border-none text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <select className="bg-surface-container-high border-none rounded-full px-4 text-sm font-medium outline-none">
                     <option>All Roles</option>
                     <option>Student</option>
                     <option>Instructor</option>
                     <option>Admin</option>
                  </select>
               </div>

               <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                     <thead className="bg-surface-container-lowest border-b border-surface-container text-on-surface-variant">
                        <tr>
                           <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">User</th>
                           <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Role</th>
                           <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Status</th>
                           <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-right">Actions</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-surface-container">
                        <tr className="hover:bg-surface-container-lowest/50 transition-colors">
                           <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                 <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs uppercase">J</div>
                                 <div>
                                    <div className="font-semibold text-on-surface">Jose Rizal</div>
                                    <div className="text-xs text-on-surface-variant">j.rizal@example.com</div>
                                 </div>
                              </div>
                           </td>
                           <td className="px-6 py-4">
                              <span className="bg-surface-container-highest px-2.5 py-1 rounded-md text-xs font-semibold">Student</span>
                           </td>
                           <td className="px-6 py-4">
                              <span className="flex items-center gap-1 text-secondary text-xs font-bold">
                                 <span className="w-2 h-2 rounded-full bg-secondary"></span> Active
                              </span>
                           </td>
                           <td className="px-6 py-4 text-right">
                              <button className="p-2 hover:bg-surface-container rounded-full text-outline transition-colors">
                                 <span className="material-symbols-outlined text-[20px]">more_vert</span>
                              </button>
                           </td>
                        </tr>
                     </tbody>
                  </table>
               </div>
               
               <div className="p-4 border-t border-surface-container flex justify-between items-center text-sm text-on-surface-variant bg-surface">
                  <span>Showing 1 to 10 of 248 users</span>
                  <div className="flex gap-2">
                     <button className="px-3 py-1 rounded border border-outline-variant/30 hover:bg-surface-container-low transition-colors disabled:opacity-50" disabled>Prev</button>
                     <button className="px-3 py-1 rounded border border-outline-variant/30 hover:bg-surface-container-low transition-colors">Next</button>
                  </div>
               </div>
            </div>
         </div>
      </main>
    </div>
  );
}
