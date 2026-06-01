import React, { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

interface Props {
  onClose: () => void;
}

export function HelpSupportModal({ onClose }: Props) {
  const isMobile = window.innerWidth < 768;
  const isPWA = window.matchMedia('(display-mode: standalone)').matches || ('standalone' in navigator && (navigator as any).standalone);
  const isAPK = /wv\b/i.test(navigator.userAgent) || !!(window as any).Android || !!(window as any).ReactNativeWebView;
  const hideFAQ = isMobile || isPWA || isAPK;

  const [mode, setMode] = useState<'report' | 'faq'>('report');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      await addDoc(collection(db, 'reports'), {
        userId: auth.currentUser?.uid,
        userEmail: auth.currentUser?.email,
        subject,
        description,
        status: 'open',
        createdAt: Date.now()
      });
      setStatus('sent');
    } catch (err) {
      console.error(err);
      setStatus('idle');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[10000] flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-headline text-xl font-extrabold">Support</h2>
          <button onClick={onClose} className="text-on-surface-variant">Close</button>
        </div>
        
        {!hideFAQ && (
          <div className="flex gap-4 mb-6">
            <button onClick={() => setMode('report')} className={`font-bold ${mode === 'report' ? 'text-primary' : 'text-on-surface-variant'}`}>Report Problem</button>
            <button onClick={() => setMode('faq')} className={`font-bold ${mode === 'faq' ? 'text-primary' : 'text-on-surface-variant'}`}>FAQ</button>
          </div>
        )}

        {(mode === 'report' || hideFAQ) ? (
          status === 'sent' ? (
            <p className="text-emerald-500">Report sent successfully!</p>
          ) : (
            <form onSubmit={handleReport} className="space-y-4">
              <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" className="w-full p-3 rounded-xl bg-surface-container border border-outline-variant" required />
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="w-full p-3 rounded-xl bg-surface-container border border-outline-variant" required />
              <button disabled={status === 'sending'} type="submit" className="w-full bg-primary text-on-primary py-3 rounded-xl font-bold">{status === 'sending' ? 'Sending...' : 'Submit Report'}</button>
            </form>
          )
        ) : (
          <div className="space-y-4 text-sm text-on-surface-variant">
            <p><strong>Q: How do I change password?</strong> A: Go to settings or use forgot password.</p>
            <p><strong>Q: Why is it offline?</strong> A: We support PWA offline-first.</p>
          </div>
        )}
      </div>
    </div>
  );
}
