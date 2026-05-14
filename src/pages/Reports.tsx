import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import AdminLayout from '../components/AdminLayout';

export default function Reports() {
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    const q = collection(db, 'reports');
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

  return (
    <AdminLayout title="Reports">
      <div className="p-8">
        <div className="bg-surface-container rounded-3xl p-6 border border-outline-variant">
          <h2 className="text-xl font-bold mb-4 font-headline">User Reports</h2>
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className={`p-4 rounded-xl border ${report.status === 'resolved' ? 'bg-surface-container-lowest' : 'bg-surface-container-high'}`}>
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold">{report.subject}</h3>
                        <p className="text-sm text-on-surface-variant">{report.description}</p>
                        <p className="text-xs text-on-surface-variant/50 mt-2">From: {report.userEmail}</p>
                    </div>
                    {report.status !== 'resolved' && (
                        <button onClick={() => handleResolve(report.id)} className="text-xs bg-primary text-on-primary px-3 py-1 rounded-lg">Resolve</button>
                    )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
