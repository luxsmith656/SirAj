import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { BrainCircuit, Loader2, Save, X, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { collection, addDoc, onSnapshot, doc, deleteDoc, query, orderBy, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';

export default function AIDrafts() {
  const { user } = useAuth();
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Average');
  const [isGenerating, setIsGenerating] = useState(false);
  const [drafts, setDrafts] = useState<any[]>([]);
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);

  const [categories, setCategories] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [selectedMapping, setSelectedMapping] = useState<Record<string, { categoryId: string, topicId: string }>>({});

  useEffect(() => {
    const q = query(collection(db, 'aiDrafts'), where('status', '==', 'pending'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      const ms = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setDrafts(ms);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsubCat = onSnapshot(collection(db, 'categories'), s => {
      setCategories(s.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubTop = onSnapshot(collection(db, 'topics'), s => {
      setTopics(s.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => { unsubCat(); unsubTop(); };
  }, []);

  const handleGenerate = async () => {
    if (!topic) return;
    setIsGenerating(true);
    try {
      const res = await fetch('/api/draft-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, difficulty, count: 5 })
      });
      const data = await res.json();
      if (data.success) {
        const { serverTimestamp } = await import('firebase/firestore');
        for (const q of data.questions) {
          await addDoc(collection(db, 'aiDrafts'), {
            ...q,
            draftTopic: topic,
            difficulty,
            status: 'pending',
            instructorId: user?.uid,
            createdAt: serverTimestamp()
          });
        }
        setToastMsg('Generated and saved to drafts!');
        setShowToast(true);
      } else {
        throw new Error(data.error);
      }
    } catch (e: any) {
      setToastMsg('Failed to generate drafts: ' + e.message);
      setShowToast(true);
    } finally {
      setIsGenerating(false);
    }
  };

  const approveDraft = async (draftId: string) => {
    const mapping = selectedMapping[draftId];
    if (!mapping?.categoryId || !mapping?.topicId) {
      setToastMsg('Please select a category and topic first.');
      setShowToast(true);
      return;
    }

    const draft = drafts.find(d => d.id === draftId);
    if (!draft) return;

    try {
       const { updateDoc, serverTimestamp } = await import('firebase/firestore');
       await addDoc(collection(db, 'questions'), {
          stem: draft.stem,
          options: draft.options,
          correctOptionId: draft.correctOptionId,
          explanation: draft.explanation,
          categoryId: mapping.categoryId,
          topicId: mapping.topicId,
          difficulty: draft.difficulty,
          approved: true,
          isPublished: true,
          aiGenerated: true,
          createdBy: user?.uid,
          version: 1,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
       });

       await updateDoc(doc(db, 'aiDrafts', draftId), {
         status: 'approved',
         reviewedAt: serverTimestamp(),
         reviewedBy: user?.uid,
         assignedCategoryId: mapping.categoryId,
         assignedTopicId: mapping.topicId
       });

       setToastMsg('Question approved and saved to bank!');
       setShowToast(true);
    } catch (e: any) {
       setToastMsg('Failed to approve: ' + e.message);
       setShowToast(true);
    }
  };

  const rejectDraft = async (id: string) => {
    try {
      const { updateDoc, serverTimestamp } = await import('firebase/firestore');
      await updateDoc(doc(db, 'aiDrafts', id), {
        status: 'rejected',
        reviewedAt: serverTimestamp(),
        reviewedBy: user?.uid
      });
      setToastMsg('Draft discarded');
      setShowToast(true);
    } catch (e: any) {
      console.error(e);
    }
  };

  return (
    <DashboardLayout title="AI Question Drafter">
      <div className="p-8 max-w-6xl mx-auto w-full">
        {/* ... (keep header and generator form) */}
        <div className="mb-10">
           <h2 className="text-3xl font-extrabold font-headline text-primary flex items-center gap-3">
             <BrainCircuit /> AI Question Drafter
           </h2>
           <p className="text-on-surface-variant/60 mt-2">Generate high-quality board exam questions instantly using AI.</p>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant p-8 mb-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                 <label className="block text-sm font-bold text-on-surface mb-2">Topic / Standard</label>
                 <input 
                   type="text" 
                   value={topic}
                   onChange={r => setTopic(r.target.value)}
                   placeholder="e.g. Principles of Teaching, Child Development..."
                   className="w-full bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant/30"
                 />
              </div>
              <div>
                 <label className="block text-sm font-bold text-on-surface mb-2">Difficulty</label>
                 <select 
                   value={difficulty}
                   onChange={e => setDifficulty(e.target.value)}
                   className="w-full bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                 >
                   <option>Easy</option>
                   <option>Average</option>
                   <option>Difficult</option>
                   <option>Bloom's Taxonomy: Analysis/Evaluation</option>
                 </select>
              </div>
           </div>
           <div className="mt-6 flex justify-end">
              <button 
                onClick={handleGenerate} 
                disabled={isGenerating || !topic}
                className="bg-primary text-on-primary px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center gap-2 transition-all hover:opacity-90"
              >
                 {isGenerating ? <><Loader2 className="animate-spin" /> Gathering Intel...</> : 'Generate 5 Questions'}
              </button>
           </div>
        </div>

        {drafts.length > 0 && (
          <div className="space-y-6">
             <h3 className="text-xl font-bold text-on-surface">Pending Review ({drafts.length})</h3>
             {drafts.map((draft, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={draft.id} 
                  className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm p-6 relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-100 flex gap-2">
                     <button onClick={() => rejectDraft(draft.id)} className="p-2 bg-error/10 text-error rounded-lg hover:bg-error/20 transition-colors" title="Discard"><Trash2 size={18} /></button>
                     <button onClick={() => approveDraft(draft.id)} className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500/20 transition-colors flex items-center gap-1 font-bold text-sm" title="Approve"><Save size={18}/> Approve</button>
                  </div>
                  <div className="mb-4 flex gap-4">
                     <div className="flex-1">
                        <label className="block text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest mb-1">Target Category</label>
                        <select 
                          value={selectedMapping[draft.id]?.categoryId || ''}
                          onChange={(e) => setSelectedMapping({
                            ...selectedMapping,
                            [draft.id]: { ...selectedMapping[draft.id], categoryId: e.target.value, topicId: '' }
                          })}
                          className="w-full bg-surface-container border border-outline-variant/30 rounded-lg px-3 py-2 text-xs font-bold text-on-surface focus:outline-none"
                        >
                          <option value="">Select Category</option>
                          {categories.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                        </select>
                     </div>
                     <div className="flex-1">
                        <label className="block text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest mb-1">Target Topic</label>
                        <select 
                          value={selectedMapping[draft.id]?.topicId || ''}
                          disabled={!selectedMapping[draft.id]?.categoryId}
                          onChange={(e) => setSelectedMapping({
                            ...selectedMapping,
                            [draft.id]: { ...selectedMapping[draft.id], topicId: e.target.value }
                          })}
                          className="w-full bg-surface-container border border-outline-variant/30 rounded-lg px-3 py-2 text-xs font-bold text-on-surface focus:outline-none disabled:opacity-30"
                        >
                          <option value="">Select Topic</option>
                          {topics.filter(t => t.categoryId === selectedMapping[draft.id]?.categoryId).map(t => (
                            <option key={t.id} value={t.id}>{t.title}</option>
                          ))}
                        </select>
                     </div>
                  </div>
                  <h4 className="font-bold text-lg text-on-surface mb-4 pr-32">{draft.stem}</h4>
                  <div className="space-y-2 mb-4">
                     {draft.options?.map((opt: any) => (
                       <div key={opt.id} className={`p-3 rounded-xl text-sm ${opt.id === draft.correctOptionId ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold' : 'bg-surface-container text-on-surface-variant border border-outline-variant/10'}`}>
                         <span className="inline-block w-6 font-bold">{opt.id}.</span> {opt.text}
                       </div>
                     ))}
                  </div>
                  <div className="text-sm bg-primary/5 border border-primary/10 text-on-surface-variant p-4 rounded-xl">
                    <strong>Explanation:</strong> {draft.explanation}
                  </div>
                </motion.div>
             ))}
          </div>
        )}

        <Toast message={toastMsg} isVisible={showToast} onClose={() => setShowToast(false)} type={toastMsg.includes('Failed') ? 'error' : 'success'} />
      </div>
    </DashboardLayout>
  );
}
