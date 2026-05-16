import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import AdminLayout from '../components/AdminLayout';

export default function ActivityLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    let q = query(collection(db, 'activityLogs'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
        let data = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
        if (filter !== 'all') {
            data = data.filter((log: any) => log.action === filter);
        }
        setLogs(data);
    });
    return () => unsub();
  }, [filter]);

  return (
    <AdminLayout title="Activity Logs">
      <div className="p-8">
        <div className="bg-surface-container rounded-3xl p-6 border border-outline-variant">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold font-headline">Audit Trail</h2>
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="bg-surface-container-high p-2 rounded-xl text-sm">
                <option value="all">All Activities</option>
                <option value="Updated System Branding">Branding Changes</option>
                <option value="Created Curriculum">Curriculum Additions</option>
            </select>
          </div>
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {logs.map((log) => (
              <div key={log.id} className="p-4 rounded-xl border bg-surface-container-high">
                  <p className="font-bold text-sm tracking-tight">{log.action}</p>
                  <p className="text-xs text-on-surface-variant line-clamp-1">{log.description}</p>
                  <p className="text-[10px] text-on-surface-variant/50 mt-1">User: {log.userEmail} | Time: {log.createdAt?.toDate().toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
