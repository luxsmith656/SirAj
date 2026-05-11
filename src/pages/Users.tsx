import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

interface UserProfile {
  uid: string;
  email: string;
  role: 'admin' | 'client' | null;
  displayName?: string;
}

export default function Users() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('email', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const u = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
      setUsers(u);
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
    });
    return () => unsubscribe();
  }, []);

  const handleToggleRole = async (user: UserProfile) => {
    const newRole = user.role === 'admin' ? 'client' : 'admin';
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        role: newRole
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout title="User Management">
      <div className="p-8 max-w-6xl mx-auto w-full text-on-surface">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <h2 className="text-4xl font-extrabold text-[#1b366a] font-headline tracking-tight mb-2">Access Control</h2>
            <p className="text-slate-500 font-medium">Manage user accounts and permissions.</p>
          </div>
          <div className="flex gap-2">
             <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 flex items-center gap-2 shadow-sm">
                <span className="text-sm font-bold text-slate-800 tabular-nums">{users.length}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Users</span>
             </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
             <span className="material-symbols-outlined text-slate-400">search</span>
             <input 
               type="text" 
               placeholder="Filter by email address..." 
               className="bg-transparent border-none outline-none text-sm w-full font-medium"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/30">
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Account</th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Role</th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-slate-400 italic">Syncing accounts...</td>
                  </tr>
                )}
                {!isLoading && filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-slate-400 italic">No accounts found.</td>
                  </tr>
                )}
                {filteredUsers.map((u) => (
                  <tr key={u.uid} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#1b366a] flex items-center justify-center font-bold text-xs uppercase">
                          {u.email.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-700">{u.email}</p>
                          <p className="text-[10px] text-slate-400 font-mono">UID: {u.uid.substring(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                        u.role === 'admin' ? 'bg-[#1b366a]/10 text-[#1b366a]' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {u.role || 'client'}
                      </span>
                    </td>
                    <td className="p-4">
                       <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-50"></span>
                          Online
                       </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2 outline-none">
                        <button 
                          onClick={() => handleToggleRole(u)}
                          className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                        >
                          Change Role
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
