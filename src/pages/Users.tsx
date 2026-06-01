import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import InstructorLayout from '../components/InstructorLayout';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { logActivity } from '../lib/activityLogger';

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

  const handleUpdateUser = async (uid: string, role: string, fullName: string, instructorId?: string | null, className?: string | null) => {
    const confirmed = window.confirm(`Are you sure you want to save changes to this user?`);
    if (!confirmed) return;
    try {
      const userRef = doc(db, 'users', uid);
      const updateData: any = {
        role,
        fullName,
        updatedAt: new Date().toISOString()
      };
      
      if (instructorId !== undefined) updateData.instructorId = instructorId || null;
      if (className !== undefined) updateData.className = className || null;
      
      await updateDoc(userRef, updateData);
      
      await logActivity(currentUser!.uid, currentUser!.email!, 'Updated User', `Updated user details for ${fullName} (${role})`);
      setEditingUser(null);
      alert('User updated successfully.');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
    }
  };

  const handleDeleteUser = async (uid: string, email: string) => {
    if (email === 'castanar656@gmail.com') {
      alert('Cannot delete this user.');
      return;
    }
    const pin = prompt('Enter PIN to delete user:');
    if (pin !== '47254725') {
      alert('Invalid PIN.');
      return;
    }
    try {
      await deleteDoc(doc(db, 'users', uid));
      await logActivity(currentUser!.uid, currentUser!.email!, 'Deleted User', `Deleted user account: ${email}`);
      alert('User deleted successfully.');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${uid}`);
    }
  };

  const instructors = users.filter(u => u.role === 'instructor');

  // RBAC Filter: Instructors see ALL users now to manage them
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (u.fullName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (u.className?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Instructors can see everyone now to facilitate "User Management" as requested
    return matchesSearch;
  });

  const Layout = currentUser?.role === 'instructor' ? InstructorLayout : DashboardLayout;

  return (
    <Layout title="User Management">
      <div className="p-4 md:p-8 max-w-6xl mx-auto w-full text-on-surface">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-primary font-headline tracking-tight mb-2">
              User Management
            </h2>
            <p className="text-on-surface-variant/60 font-medium">
              Manage system roles, permissions, and accounts.
            </p>
          </div>
          <div className="flex gap-2">
             <div className="bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-2 flex items-center gap-2 shadow-sm">
                <span className="text-sm font-bold text-on-surface tabular-nums">{filteredUsers.length}</span>
                <span className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest">
                  Total Users
                </span>
             </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
          <div className="p-4 border-b border-outline-variant bg-surface-container/30 flex items-center gap-3">
             <span className="material-symbols-outlined text-on-surface-variant/40">search</span>
             <input 
               type="text" 
               placeholder="Search by name or email..." 
               className="bg-transparent border-none outline-none text-sm w-full font-medium text-on-surface placeholder:text-on-surface-variant/30"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>

          <div className="space-y-3 px-4 py-4 md:px-0">
            {isLoading && (
              <div className="rounded-[26px] border border-outline-variant/20 bg-surface-container p-6 text-center text-on-surface-variant/40 italic">
                Syncing accounts...
              </div>
            )}
            {!isLoading && filteredUsers.length === 0 && (
              <div className="rounded-[26px] border border-outline-variant/20 bg-surface-container p-6 text-center text-on-surface-variant/40 italic">
                No accounts found matching criteria.
              </div>
            )}
            <div className="block md:hidden space-y-3">
              {filteredUsers.map((u) => (
                <div key={u.uid} className="rounded-[26px] border border-outline-variant/20 bg-surface-container p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-surface-container text-primary flex items-center justify-center font-bold text-xs uppercase overflow-hidden shrink-0">
                      {u.fullName?.charAt(0) || u.email.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-on-surface truncate">{u.fullName || 'Anonymous User'}</p>
                      <p className="text-[10px] text-on-surface-variant/40 truncate">{u.email}</p>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-2 text-xs text-on-surface-variant">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold uppercase tracking-widest">Role</span>
                      <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                        u.role === 'admin' ? 'bg-error/10 text-error' : 
                        u.role === 'instructor' ? 'bg-primary/10 text-primary' : 
                        'bg-surface-container text-on-surface-variant/40'
                      }`}>
                        {u.role || 'student'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold uppercase tracking-widest">Class</span>
                      <span className="text-right text-xs font-semibold text-primary">{u.className || 'None'}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 justify-end">
                    <button 
                      onClick={() => setEditingUser(u)}
                      className="flex-1 min-w-[120px] rounded-2xl bg-surface-container text-on-surface-variant font-bold py-2 text-sm transition hover:bg-surface-container/80"
                    >
                      Edit
                    </button>
                    {(currentUser?.role === 'admin' || currentUser?.role === 'instructor') && u.email !== 'castanar656@gmail.com' && (
                      <button
                        onClick={() => handleDeleteUser(u.uid, u.email)}
                        className="flex-1 min-w-[120px] rounded-2xl bg-error/10 text-error font-bold py-2 text-sm transition hover:bg-error/20"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-outline-variant bg-surface-container/10">
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60">Identity</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60">Role</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60">Class/Group</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.uid} className="hover:bg-surface-container/20 transition-colors border-b border-outline-variant/10">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-surface-container text-primary flex items-center justify-center font-bold text-xs uppercase overflow-hidden shrink-0">
                            {u.fullName?.charAt(0) || u.email.charAt(0)}
                          </div>
                          <div className="truncate">
                            <p className="text-sm font-bold text-on-surface truncate">{u.fullName || 'Anonymous User'}</p>
                            <p className="text-[10px] text-on-surface-variant/40 font-bold truncate">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                          u.role === 'admin' ? 'bg-error/10 text-error' : 
                          u.role === 'instructor' ? 'bg-primary/10 text-primary' : 
                          'bg-surface-container text-on-surface-variant/40'
                        }`}>
                          {u.role || 'student'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-bold text-primary">
                          {u.className || 'None'}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex gap-1 justify-end">
                          <button 
                            onClick={() => setEditingUser(u)}
                            className="p-2 text-on-surface-variant hover:text-primary transition-all hover:scale-110"
                            title="Modify Access"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          {(currentUser?.role === 'admin' || currentUser?.role === 'instructor') && u.email !== 'castanar656@gmail.com' && (
                            <button
                               onClick={() => handleDeleteUser(u.uid, u.email)}
                               className="p-2 text-error hover:text-error/80 transition-all hover:scale-110"
                               title="Delete User"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Access Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-surface-dim/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-surface-container-lowest rounded-[32px] w-full max-w-md p-8 shadow-2xl border border-outline-variant max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-black font-headline text-on-surface mb-6">Modify User</h3>
            <div className="space-y-6">
               <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest ml-1">Full Name</label>
                  <input 
                    type="text"
                    value={editingUser.fullName || ''}
                    onChange={(e) => setEditingUser({...editingUser, fullName: e.target.value})}
                    className="w-full bg-surface-container border border-transparent rounded-2xl px-5 py-3.5 text-sm font-bold text-on-surface focus:bg-white focus:border-primary/20 outline-none transition-all"
                  />
               </div>

               <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest ml-1">Assign System Role</label>
                  <select 
                    value={editingUser.role || 'student'}
                    onChange={(e) => setEditingUser({...editingUser, role: e.target.value as any})}
                    className="w-full bg-surface-container border border-transparent rounded-2xl px-5 py-3.5 text-sm font-bold text-on-surface focus:bg-white focus:border-primary/20 outline-none transition-all appearance-none"
                  >
                    <option value="student">Student Account</option>
                    <option value="instructor">Instructor Account</option>
                    <option value="admin">Platform Administrator</option>
                  </select>
               </div>

               {editingUser.role === 'student' && (
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest ml-1">Assigned Instructor</label>
                     <select 
                      value={editingUser.instructorId || ''}
                      onChange={(e) => setEditingUser({...editingUser, instructorId: e.target.value})}
                      className="w-full bg-surface-container border border-transparent rounded-2xl px-5 py-3.5 text-sm font-bold text-on-surface focus:bg-white focus:border-primary/20 outline-none transition-all appearance-none"
                    >
                      <option value="">Manual/No Instructor</option>
                      {instructors.map(i => (
                        <option key={i.uid} value={i.uid}>{i.fullName || i.email}</option>
                      ))}
                    </select>
                 </div>
               )}

               {editingUser.role === 'student' && (
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest ml-1">Class Name / Section</label>
                    <input 
                      type="text"
                      placeholder="e.g. BSED-4A"
                      value={editingUser.className || ''}
                      onChange={(e) => setEditingUser({...editingUser, className: e.target.value})}
                      className="w-full bg-surface-container border border-transparent rounded-2xl px-5 py-3.5 text-sm font-bold text-on-surface focus:bg-white focus:border-primary/20 outline-none transition-all"
                    />
                 </div>
               )}

               <div className="flex gap-3 pt-4">
                 <button onClick={() => setEditingUser(null)} className="flex-1 bg-surface-container text-on-surface-variant font-bold py-3.5 rounded-2xl transition-all text-xs uppercase tracking-widest hover:bg-surface-container/80">Cancel</button>
                 <button 
                   onClick={() => handleUpdateUser(editingUser.uid, editingUser.role!, editingUser.fullName || '', editingUser.instructorId, editingUser.className)}
                   className="flex-[2] bg-primary text-on-primary font-bold py-3.5 rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl transition-all text-xs uppercase tracking-widest"
                 >
                   Save Changes
                 </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
