import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { BrainCircuit, Loader2, Save, X } from 'lucide-react';
import { motion } from 'motion/react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Toast from '../components/Toast';

export default function AIDrafts() {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Average');
  const [isGenerating, setIsGenerating] = useState(false);
  const [drafts, setDrafts] = useState<any[]>([]);
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);

  const handleGenerate = async () => {
    if (!topic) return;
    setIsGenerating(true);
    try {
      const res = await fetch('/api/draft-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ topic, difficulty, count: 5 })
      });
      const data = await res.json();
      if (data.success) {
        setDrafts(data.questions);
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

  const saveDraft = async (draft: any, index: number) => {
    try {
       await addDoc(collection(db, 'questions'), {
          ...draft,
          categoryId: 'ai-generated',
          createdAt: Date.now()
       });
       setToastMsg('Question saved to bank!');
       setShowToast(true);
       
       // Remove from drafts list
       setDrafts(d => d.filter((_, i) => i !== index));
    } catch (e: any) {
       setToastMsg('Failed to save: ' + e.message);
       setShowToast(true);
    }
  };

  return (
    <DashboardLayout title="AI Question Drafter">
      <div className="p-8 max-w-6xl mx-auto w-full">
        <div className="mb-10">
           <h2 className="text-3xl font-extrabold font-headline text-[#1b366a] flex items-center gap-3">
             <BrainCircuit /> AI Question Drafter
           </h2>
           <p className="text-slate-500 mt-2">Generate high-quality board exam questions instantly using AI.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                 <label className="block text-sm font-bold text-slate-700 mb-2">Topic / Standard</label>
                 <input 
                   type="text" 
                   value={topic}
                   onChange={r => setTopic(r.target.value)}
                   placeholder="e.g. Principles of Teaching, Child Development..."
                   className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1b366a]"
                 />
              </div>
              <div>
                 <label className="block text-sm font-bold text-slate-700 mb-2">Difficulty</label>
                 <select 
                   value={difficulty}
                   onChange={e => setDifficulty(e.target.value)}
                   className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1b366a]"
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
                className="bg-[#1b366a] text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-900/20 disabled:opacity-50 flex items-center gap-2 transition-all hover:bg-[#13264a]"
              >
                 {isGenerating ? <><Loader2 className="animate-spin" /> Gathering Intel...</> : 'Generate 5 Questions'}
              </button>
           </div>
        </div>

        {drafts.length > 0 && (
          <div className="space-y-6">
             <h3 className="text-xl font-bold text-slate-800">Generated Drafts</h3>
             {drafts.map((draft, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={i} 
                  className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6 relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                     <button onClick={() => setDrafts(d => d.filter((_, idx) => idx !== i))} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><X size={18} /></button>
                     <button onClick={() => saveDraft(draft, i)} className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 flex items-center gap-1 font-bold text-sm"><Save size={18}/> Appprove</button>
                  </div>
                  <h4 className="font-bold text-lg text-slate-800 mb-4 pr-32">{draft.stem}</h4>
                  <div className="space-y-2 mb-4">
                     {draft.options?.map((opt: any) => (
                       <div key={opt.id} className={`p-3 rounded-xl text-sm ${opt.id === draft.correctOptionId ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold' : 'bg-slate-50 text-slate-600 border border-slate-100'}`}>
                         <span className="inline-block w-6 font-bold">{opt.id}.</span> {opt.text}
                       </div>
                     ))}
                  </div>
                  <div className="text-sm bg-indigo-50 border border-indigo-100 text-indigo-800 p-4 rounded-xl">
                    <strong>Explanation:</strong> {draft.explanation}
                  </div>
                </motion.div>
             ))}
          </div>
        )}

        {showToast && (
          <Toast message={toastMsg} isVisible={showToast} onClose={() => setShowToast(false)} type={toastMsg.includes('Failed') ? 'error' : 'success'} />
        )}
      </div>
    </DashboardLayout>
  );
}
