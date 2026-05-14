import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';

interface UserProfile {
  uid: string;
  email: string;
  role: 'admin' | 'instructor' | 'student' | null;
  fullName?: string;
  age?: number;
  instructorId?: string;
  className?: string;
}

export default function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

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

  const handleUpdateRole = async (uid: string, role: string, instructorId?: string, className?: string) => {
    try {
      await updateDoc(doc(db, 'users', uid), {
        role,
        instructorId: instructorId || null,
        className: className || null
      });
      setEditingUser(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
    }
  };

  const instructors = users.filter(u => u.role === 'instructor');

  // RBAC Filter: Instructors only see their students
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (u.fullName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (u.className?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (currentUser?.role === 'instructor') {
      return matchesSearch && u.instructorId === currentUser.uid && u.role === 'student';
    }
    
    return matchesSearch;
  });

  return (
    <DashboardLayout title="User Management">
      <div className="p-8 max-w-6xl mx-auto w-full text-on-surface">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <h2 className="text-4xl font-extrabold text-[#1b366a] font-headline tracking-tight mb-2">
              {currentUser?.role === 'admin' ? 'Access Control' : 'My Students'}
            </h2>
            <p className="text-slate-500 font-medium">
              {currentUser?.role === 'admin' ? 'Manage system roles and permissions.' : 'Monitor and manage your assigned students.'}
            </p>
          </div>
          <div className="flex gap-2">
             <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 flex items-center gap-2 shadow-sm">
                <span className="text-sm font-bold text-slate-800 tabular-nums">{filteredUsers.length}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {currentUser?.role === 'admin' ? 'Total Users' : 'Assigned Students'}
                </span>
             </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
             <span className="material-symbols-outlined text-slate-400">search</span>
             <input 
               type="text" 
               placeholder="Search by name or email..." 
               className="bg-transparent border-none outline-none text-sm w-full font-medium"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/30">
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Identity</th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Role</th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Class/Group</th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Assignment</th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-slate-400 italic">Syncing accounts...</td>
                  </tr>
                )}
                {!isLoading && filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-slate-400 italic">No accounts found matching criteria.</td>
                  </tr>
                )}
                {filteredUsers.map((u) => (
                  <tr key={u.uid} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#1b366a] flex items-center justify-center font-bold text-xs uppercase overflow-hidden">
                          {u.fullName?.charAt(0) || u.email.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-700">{u.fullName || 'Anonymous User'}</p>
                          <p className="text-[10px] text-slate-400 font-bold">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                        u.role === 'admin' ? 'bg-red-50 text-red-600' : 
                        u.role === 'instructor' ? 'bg-blue-50 text-blue-600' : 
                        'bg-slate-100 text-slate-500'
                      }`}>
                        {u.role || 'student'}
                      </span>
                    </td>
                    <td className="p-4">
                       <p className="text-xs font-bold text-emerald-600">
                         {u.className || 'None'}
                       </p>
                    </td>
                    <td className="p-4">
                       <p className="text-xs font-bold text-slate-600">
                         {u.role === 'student' ? (
                           users.find(i => i.uid === u.instructorId)?.fullName || 'Unassigned'
                         ) : 'N/A'}
                       </p>
                    </td>
                    <td className="p-4 text-right">
                      {currentUser?.role === 'admin' && (
                        <button 
                          onClick={() => setEditingUser(u)}
                          className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                        >
                          Modify Access
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Access Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl border border-slate-100">
            <h3 className="text-2xl font-black font-headline text-slate-800 mb-6">Modify Access</h3>
            <div className="space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Assign System Role</label>
                  <select 
                    value={editingUser.role || 'student'}
                    onChange={(e) => setEditingUser({...editingUser, role: e.target.value as any})}
                    className="w-full bg-slate-50 border border-transparent rounded-2xl px-5 py-4 text-sm font-bold focus:bg-white focus:border-primary/20 outline-none transition-all"
                  >
                    <option value="student">Student</option>
                    <option value="instructor">Instructor</option>
                    <option value="admin">Administrator</option>
                  </select>
               </div>

               {editingUser.role === 'student' && (
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Assigned Instructor</label>
                     <select 
                      value={editingUser.instructorId || ''}
                      onChange={(e) => setEditingUser({...editingUser, instructorId: e.target.value})}
                      className="w-full bg-slate-50 border border-transparent rounded-2xl px-5 py-4 text-sm font-bold focus:bg-white focus:border-primary/20 outline-none transition-all"
                    >
                      <option value="">No Instructor</option>
                      {instructors.map(i => (
                        <option key={i.uid} value={i.uid}>{i.fullName || i.email}</option>
                      ))}
                    </select>
                 </div>
               )}

               {editingUser.role === 'student' && (
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Class Name / Section</label>
                    <input 
                      type="text"
                      placeholder="e.g. BSED-4A"
                      value={editingUser.className || ''}
                      onChange={(e) => setEditingUser({...editingUser, className: e.target.value})}
                      className="w-full bg-slate-50 border border-transparent rounded-2xl px-5 py-4 text-sm font-bold focus:bg-white focus:border-primary/20 outline-none transition-all"
                    />
                 </div>
               )}

               <div className="flex gap-3 pt-4">
                 <button onClick={() => setEditingUser(null)} className="flex-1 bg-slate-50 text-slate-600 font-bold py-4 rounded-2xl transition-all text-xs uppercase tracking-widest hover:bg-slate-100">Cancel</button>
                 <button 
                   onClick={() => handleUpdateRole(editingUser.uid, editingUser.role!, editingUser.instructorId, editingUser.className)}
                   className="flex-[2] bg-primary text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all text-xs uppercase tracking-widest"
                 >
                   Save Changes
                 </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
