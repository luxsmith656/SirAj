import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ShieldAlert, Users, Calendar, Ban } from 'lucide-react';

export default function AdminClasses() {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadClasses = async () => {
    try {
      const snap = await getDocs(collection(db, 'classes'));
      const data = snap.docs.map(d => ({id: d.id, ...d.data()}));
      setClasses(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  const toggleStatus = async (classId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'archived' : 'active';
    try {
      await updateDoc(doc(db, 'classes', classId), { status: newStatus });
      await loadClasses();
    } catch (e) {
      alert('Failed to update class status');
    }
  };

  return (
    <AdminLayout title="Global Class Management">
      <div className="p-8 max-w-6xl mx-auto w-full text-on-surface">
        <h2 className="text-3xl font-extrabold text-primary font-headline tracking-tight mb-2">Platform Classes</h2>
        <p className="text-on-surface-variant/60 font-medium mb-8">Oversee all instructor-led classes across the platform.</p>

        {loading ? (
          <div className="text-center p-12 text-on-surface-variant/60 font-bold">Loading classes...</div>
        ) : (
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-container border-b border-outline-variant/30 text-on-surface-variant/40 uppercase tracking-widest text-[10px] font-bold">
                  <tr>
                    <th className="px-6 py-4">Class Code & Name</th>
                    <th className="px-6 py-4">Instructor</th>
                    <th className="px-6 py-4">Focus</th>
                    <th className="px-6 py-4 text-center">Students</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/5 font-medium text-on-surface">
                  {classes.map(cls => (
                    <tr key={cls.id} className="hover:bg-surface-container/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-on-surface">{cls.className}</div>
                        <div className="font-mono text-on-surface-variant/40 text-xs mt-0.5">{cls.classCode}</div>
                      </td>
                      <td className="px-6 py-4">{cls.instructorName}</td>
                      <td className="px-6 py-4">
                        <span className="bg-primary/10 text-primary px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-primary/10">
                          {cls.focus?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center items-center gap-1.5 opacity-80">
                           <Users size={14} /> {cls.studentCount || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {cls.status === 'active' ? (
                          <span className="text-emerald-500 font-bold flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Active</span>
                        ) : (
                          <span className="text-on-surface-variant/40 font-bold flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-outline-variant"></span> Archived</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => toggleStatus(cls.id, cls.status)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors ${
                            cls.status === 'active' ? 'bg-error/10 text-error hover:bg-error/20' : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
                          }`}
                        >
                          {cls.status === 'active' ? 'Archive' : 'Restore'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {classes.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-on-surface-variant/40 font-medium">No classes found on the platform.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
