import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import AdminLayout from '../components/AdminLayout';

export default function Notifications() {
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setReports(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const handleResolve = async (id: string) => {
    try {
      await updateDoc(doc(db, 'reports', id), { status: 'resolved' });
    } catch (err) {
      console.error(err);
      alert('Error updating report status.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'reports', id));
    } catch (err) {
      console.error(err);
      alert('Error deleting report.');
    }
  };

  return (
    <AdminLayout title="Notifications">
      <div className="p-8">
        <div className="bg-surface-container rounded-3xl p-6 border border-outline-variant">
          <h2 className="text-xl font-bold mb-4 font-headline">All Notifications</h2>
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className={`p-4 rounded-xl border ${report.status === 'resolved' ? 'bg-surface-container-lowest' : 'bg-surface-container-high'}`}>
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold">{report.subject}</h3>
                        <p className="text-sm text-on-surface-variant line-clamp-2">{report.description}</p>
                        <p className="text-xs text-on-surface-variant/50 mt-2">From: {report.userEmail} | Status: {report.status}</p>
                    </div>
                    <div className="flex gap-2">
                        {report.status !== 'resolved' && (
                            <button onClick={() => handleResolve(report.id)} className="text-xs bg-primary text-on-primary px-3 py-1 rounded-lg">Resolve</button>
                        )}
                        <button onClick={() => handleDelete(report.id)} className="text-xs bg-error text-on-error px-3 py-1 rounded-lg">Delete</button>
                    </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
