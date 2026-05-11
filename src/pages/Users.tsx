import React, { useState } from 'react';
import AdminLayout from '../components/AdminLayout';

export default function Users() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('All Roles');

  const users = [
    { name: 'Jose Rizal', email: 'j.rizal@example.com', role: 'Student', status: 'Active', color: 'bg-primary' },
    { name: 'Andres Bonifacio', email: 'a.bonifacio@example.com', role: 'Premium Student', status: 'Active', color: 'bg-secondary' },
    { name: 'Melchora Aquino', email: 'm.aquino@example.com', role: 'Instructor', status: 'Reviewing', color: 'bg-tertiary' },
    { name: 'Apolinario Mabini', email: 'a.mabini@example.com', role: 'Admin', status: 'Active', color: 'bg-primary-container text-primary' }
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'All Roles' || user.role.includes(selectedRole);
    return matchesSearch && matchesRole;
  });

  return (
    <AdminLayout title="User Management">
      <div className="p-8 md:p-12 max-w-7xl mx-auto space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
               <div>
                  <h1 className="text-4xl md:text-6xl font-black font-headline text-primary tracking-tighter mb-4 leading-[0.9]">Access Control</h1>
                  <p className="text-xl text-on-surface-variant max-w-xl font-medium">Manage your academic community and define administrative privileges.</p>
               </div>
               <button 
                 onClick={() => alert('Launching invitation portal...')}
                 className="primary-gradient text-white px-10 py-5 rounded-full font-black text-[10px] uppercase tracking-widest shadow-2xl hover:shadow-primary/40 active:scale-95 transition-all flex items-center gap-3"
               >
                  <span className="material-symbols-outlined text-[20px]">person_add</span> Invite Member
               </button>
            </div>

            <div className="bg-white rounded-[2.5rem] ambient-shadow ghost-border overflow-hidden">
               <div className="p-8 flex flex-col md:flex-row gap-6 bg-surface-container-low/20 items-center justify-between border-b border-surface-container-low/50">
                  <div className="flex-1 w-full relative group">
                     <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-on-surface-variant/40 group-focus-within:text-primary transition-colors">search</span>
                     <input 
                       type="text" 
                       placeholder="Scan lexicon for active records..." 
                       value={searchQuery}
                       onChange={(e) => setSearchQuery(e.target.value)}
                       className="w-full pl-16 pr-8 py-5 rounded-2xl bg-surface-container-low/30 border-none text-base font-bold text-primary outline-none focus:bg-white focus:ring-4 focus:ring-primary/5 ambient-shadow-sm transition-all placeholder:text-on-surface-variant/30" 
                     />
                  </div>
                  <div className="flex gap-4 w-full md:w-auto self-stretch md:self-auto">
                    <div className="relative flex-1 md:flex-none">
                      <select 
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="w-full bg-surface-container-low/30 border-none rounded-2xl pl-6 pr-12 py-5 text-[10px] font-black text-primary uppercase tracking-widest outline-none ambient-shadow-sm focus:bg-white focus:ring-4 focus:ring-primary/5 appearance-none min-w-[200px] transition-all"
                      >
                         <option>All Roles</option>
                         <option>Student</option>
                         <option>Instructor</option>
                         <option>Admin</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-primary/40 pointer-events-none">unfold_more</span>
                    </div>
                  </div>
               </div>

               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="bg-surface-container-low/10 text-on-surface-variant/60">
                           <th className="px-10 py-8 font-black uppercase tracking-[0.2em] text-[10px]">User Profile</th>
                           <th className="px-10 py-8 font-black uppercase tracking-[0.2em] text-[10px]">Security Role</th>
                           <th className="px-10 py-8 font-black uppercase tracking-[0.2em] text-[10px]">Current Status</th>
                           <th className="px-10 py-8 font-black uppercase tracking-[0.2em] text-[10px] text-right">Directives</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-surface-container-low/50">
                        {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                           <tr key={user.email} className="hover:bg-surface-container-low/20 transition-all group">
                              <td className="px-10 py-8">
                                 <div className="flex items-center gap-6">
                                    <div className={`w-14 h-14 rounded-2xl ${user.color} text-white flex items-center justify-center font-black text-xl ambient-shadow group-hover:rotate-6 transition-transform`}>
                                       {user.name.charAt(0)}
                                    </div>
                                    <div>
                                       <div className="font-black text-primary font-headline text-xl tracking-tight leading-tight">{user.name}</div>
                                       <div className="text-[11px] text-on-surface-variant font-bold uppercase tracking-wider mt-1 opacity-60 group-hover:opacity-100 transition-opacity">{user.email}</div>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-10 py-8">
                                 <span className="bg-surface-container-low text-primary px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ghost-border shadow-sm">{user.role}</span>
                              </td>
                              <td className="px-10 py-8">
                                 <span className={`flex items-center gap-3 text-[10px] font-black uppercase tracking-widest ${user.status === 'Active' ? 'text-secondary' : 'text-on-surface-variant/40'}`}>
                                    <span className={`w-2.5 h-2.5 rounded-full ${user.status === 'Active' ? 'bg-secondary shadow-[0_0_8px_rgba(0,107,92,0.6)] animate-pulse' : 'bg-on-surface-variant/30'}`}></span>
                                    {user.status}
                                 </span>
                              </td>
                              <td className="px-10 py-8 text-right">
                                 <div className="flex justify-end gap-2">
                                   <button className="w-12 h-12 hover:bg-white bg-surface-container-low/50 rounded-2xl text-on-surface-variant transition-all hover:text-primary flex items-center justify-center ambient-shadow-sm group/btn active:scale-90">
                                      <span className="material-symbols-outlined text-[20px] group-hover/btn:scale-110">edit</span>
                                   </button>
                                   <button className="w-12 h-12 hover:bg-white bg-surface-container-low/50 rounded-2xl text-on-surface-variant transition-all hover:text-error flex items-center justify-center ambient-shadow-sm group/btn active:scale-90">
                                      <span className="material-symbols-outlined text-[20px] group-hover/btn:scale-110">shield_lock</span>
                                   </button>
                                 </div>
                              </td>
                           </tr>
                        )) : (
                          <tr>
                            <td colSpan={4} className="px-10 py-32 text-center">
                              <div className="flex flex-col items-center gap-6 opacity-20">
                                <span className="material-symbols-outlined text-8xl">person_search</span>
                                <p className="text-[11px] font-black uppercase tracking-[0.4em]">Zero alignment for specified parameters</p>
                              </div>
                            </td>
                          </tr>
                        )}
                     </tbody>
                  </table>
               </div>
               
               <div className="p-8 bg-surface-container-low/10 flex justify-between items-center">
                  <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Page 1 of 24</span>
                  <div className="flex gap-3">
                     <button className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:bg-primary hover:text-white transition-all disabled:opacity-30" disabled>
                        <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                     </button>
                     <button className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:bg-primary hover:text-white transition-all">
                        <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                     </button>
                  </div>
               </div>
            </div>
         </div>
    </AdminLayout>
  );
}
