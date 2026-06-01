import React, { useMemo, useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { BrainCircuit, Loader2, Save, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { collection, addDoc, onSnapshot, doc, query, orderBy, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';

function trackLabel(track: string) {
  if (track === 'elementary') return 'Elementary LET';
  if (track === 'secondary') return 'Secondary LET';
  if (track === 'specialization') return 'Field of Specialization';
  return 'LET Review';
}

function normalizeDifficulty(value: string) {
  const raw = String(value || '').toLowerCase();
  if (raw.includes('easy')) return 'Easy';
  if (raw.includes('difficult') || raw.includes('hard') || raw.includes('analysis') || raw.includes('evaluation')) return 'Difficult';
  return 'Average';
}

function slugify(value: string) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

function normalizeWrongChoiceExplanations(question: any) {
  const existing = question?.wrongChoiceExplanations || {};
  return ['A', 'B', 'C', 'D'].reduce<Record<string, string>>((acc, optionId) => {
    if (existing[optionId]) {
      acc[optionId] = existing[optionId];
    } else if (optionId === question?.correctOptionId) {
      acc[optionId] = 'This is the keyed answer because it matches the tested competency.';
    } else {
      acc[optionId] = 'This option is a distractor; review the related concept before using this item in an exam.';
    }
    return acc;
  }, {});
}

export default function AIDrafts() {
  const { user } = useAuth();
  const [topicPrompt, setTopicPrompt] = useState('');
  const [difficulty, setDifficulty] = useState('Average');
  const [isGenerating, setIsGenerating] = useState(false);
  const [drafts, setDrafts] = useState<any[]>([]);
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);

  const [categories, setCategories] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);

  // Pre-generation selections
  const [selectedTrack, setSelectedTrack] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState('');

  // Post-generation mapping override
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

  const visibleCategories = useMemo(() => {
    return categories.filter((category) => {
      if (!selectedTrack) return true;
      const tracks = category.reviewTracks || category.trackIds || (
        category.id === 'major' ? ['secondary', 'specialization'] : ['elementary', 'secondary']
      );
      return tracks.includes(selectedTrack) || tracks.includes('all');
    });
  }, [categories, selectedTrack]);

  const selectedCategory = categories.find(c => c.id === selectedCategoryId);
  const selectedTopic = topics.find(t => t.id === selectedTopicId);

  const handleGenerate = async () => {
    if (!selectedTrack || !topicPrompt || !selectedCategoryId || !selectedTopicId) {
       setToastMsg('Please select a LET track, subject, topic, and subtopic prompt before generating.');
       setShowToast(true);
       return;
    }

    const catName = selectedCategory?.title || selectedCategory?.name || '';
    const topName = selectedTopic?.title || selectedTopic?.name || '';

    setIsGenerating(true);
    try {
      const res = await fetch('/api/draft-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
           topic: `${trackLabel(selectedTrack)} / ${catName} / ${topName}: ${topicPrompt}`,
           reviewTrack: selectedTrack,
           categoryId: selectedCategoryId,
           categoryName: catName,
           topicId: selectedTopicId,
           topicName: topName,
           difficulty, 
           count: 5 
        })
      });
      const data = await res.json();
      if (data.success) {
        for (const q of data.questions) {
          const normalizedDifficulty = normalizeDifficulty(q.difficulty || difficulty);
          const wrongChoiceExplanations = normalizeWrongChoiceExplanations(q);
          const questionPayload = {
            stem: q.stem,
            options: q.options || [],
            correctOptionId: q.correctOptionId,
            explanation: q.explanation || q.rationalization || 'Review the related topic before using this item in an exam.',
            rationalization: q.rationalization || q.explanation || '',
            wrongChoiceExplanations,
            categoryId: selectedCategoryId,
            categoryName: catName,
            topicId: selectedTopicId,
            topicName: topName,
            reviewTrack: selectedTrack,
            reviewTracks: [selectedTrack],
            competencyId: q.competencyId || `${selectedTopicId}-ai-generated`,
            difficulty: normalizedDifficulty,
            misconceptionTags: q.misconceptionTags || [],
            familyId: q.familyId || `${selectedTopicId}-${slugify(topicPrompt) || 'ai-family'}`,
            questionFamilyId: q.familyId || `${selectedTopicId}-${slugify(topicPrompt) || 'ai-family'}`,
            sourceNote: `AI generated from ${trackLabel(selectedTrack)} / ${catName} / ${topName}`,
            status: 'approved',
            approvalStatus: 'approved',
            approved: true,
            isPublished: true,
            aiGenerated: true,
            autoApproved: true,
            createdBy: user?.uid || '',
            approvedBy: user?.uid || '',
            approvedByName: user?.fullName || user?.email || 'AI Drafter',
            version: 1,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            approvedAt: serverTimestamp(),
          };
          await addDoc(collection(db, 'questions'), questionPayload);
          await addDoc(collection(db, 'aiDrafts'), {
            ...questionPayload,
            draftTopic: topicPrompt,
            status: 'approved',
            reviewedAt: serverTimestamp(),
            reviewedBy: user?.uid || '',
            instructorId: user?.uid,
            preAssignedCategoryId: selectedCategoryId,
            preAssignedTopicId: selectedTopicId,
            preAssignedTrack: selectedTrack,
            createdAt: serverTimestamp()
          });
        }
        setToastMsg('Generated and auto-approved into Question Bank.');
        setShowToast(true);
      } else {
        throw new Error(data.error);
      }
    } catch (e: any) {
      setToastMsg('Failed to generate drafts: ' + e.message);
      setShowToast(true);
    } finally {
      setIsGenerating(false);
      setTopicPrompt('');
    }
  };

  const approveDraft = async (draftId: string) => {
    const draft = drafts.find(d => d.id === draftId);
    if (!draft) return;

    const catId = selectedMapping[draftId]?.categoryId || draft.preAssignedCategoryId;
    const topId = selectedMapping[draftId]?.topicId || draft.preAssignedTopicId;

    if (!catId || !topId) {
      setToastMsg('Please select a category and topic for this draft first.');
      setShowToast(true);
      return;
    }

    try {
       await addDoc(collection(db, 'questions'), {
          stem: draft.stem,
          options: draft.options,
          correctOptionId: draft.correctOptionId,
          explanation: draft.explanation,
          rationalization: draft.rationalization || draft.explanation || '',
          wrongChoiceExplanations: draft.wrongChoiceExplanations || normalizeWrongChoiceExplanations(draft),
          categoryId: catId,
          topicId: topId,
          reviewTrack: draft.preAssignedTrack || draft.reviewTrack || selectedTrack || '',
          reviewTracks: [draft.preAssignedTrack || draft.reviewTrack || selectedTrack || ''].filter(Boolean),
          competencyId: draft.competencyId || `${topId}-ai-generated`,
          familyId: draft.familyId || `${topId}-ai-family`,
          questionFamilyId: draft.questionFamilyId || draft.familyId || `${topId}-ai-family`,
          misconceptionTags: draft.misconceptionTags || [],
          difficulty: normalizeDifficulty(draft.difficulty),
          approved: true,
          isPublished: true,
          status: 'approved',
          approvalStatus: 'approved',
          aiGenerated: true,
          autoApproved: true,
          createdBy: user?.uid,
          approvedBy: user?.uid,
          approvedByName: user?.fullName || user?.email || 'AI Drafter',
          version: 1,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          approvedAt: serverTimestamp()
       });

       await updateDoc(doc(db, 'aiDrafts', draftId), {
         status: 'approved',
         reviewedAt: serverTimestamp(),
         reviewedBy: user?.uid,
         assignedCategoryId: catId,
         assignedTopicId: topId
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
        <div className="mb-10">
           <h2 className="text-3xl font-extrabold font-headline text-primary flex items-center gap-3">
             <BrainCircuit /> AI Question Drafter
           </h2>
             <p className="text-on-surface-variant/60 mt-2">Choose track, subject, and topic first. Generated questions are auto-approved into the live Question Bank.</p>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant p-8 mb-8">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 pb-6 border-b border-outline-variant/20">
              <div>
                 <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">1. Select LET Track</label>
                 <select
                   value={selectedTrack}
                   onChange={e => {
                     setSelectedTrack(e.target.value);
                     setSelectedCategoryId('');
                     setSelectedTopicId('');
                   }}
                   className="w-full bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 transition-all font-medium"
                 >
                   <option value="">-- Choose Track --</option>
                   <option value="elementary">Elementary LET</option>
                   <option value="secondary">Secondary LET</option>
                   <option value="specialization">Field of Specialization</option>
                 </select>
              </div>
              <div>
                 <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">2. Select Subject</label>
                 <select 
                   value={selectedCategoryId}
                   onChange={e => { setSelectedCategoryId(e.target.value); setSelectedTopicId(''); }}
                   disabled={!selectedTrack}
                   className="w-full bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 transition-all font-medium"
                 >
                   <option value="">-- Choose Subject --</option>
                   {visibleCategories.map(c => <option key={c.id} value={c.id}>{c.title || c.name}</option>)}
                 </select>
              </div>
              <div className={`${!selectedCategoryId ? 'opacity-50 pointer-events-none' : ''}`}>
                 <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">3. Select Topic Area</label>
                 <select 
                   value={selectedTopicId}
                   onChange={e => setSelectedTopicId(e.target.value)}
                   className="w-full bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 transition-all font-medium"
                 >
                   <option value="">-- Choose Topic --</option>
                   {topics.filter(t => t.categoryId === selectedCategoryId).map(t => (
                     <option key={t.id} value={t.id}>{t.title || t.name}</option>
                   ))}
                 </select>
              </div>
           </div>

           <div className={`transition-opacity duration-300 ${!selectedTopicId ? 'opacity-50 pointer-events-none' : ''}`}>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">4. Subtopic or Specific Standard</label>
                   <input 
                     type="text" 
                     value={topicPrompt}
                     onChange={r => setTopicPrompt(r.target.value)}
                     placeholder="e.g. Cognitive Development stages, K-12 Act..."
                     className="w-full bg-surface-container border border-outline-variant/50 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant/40 font-medium"
                   />
                </div>
                <div>
                   <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">5. Difficulty Level</label>
                   <select 
                     value={difficulty}
                     onChange={e => setDifficulty(e.target.value)}
                     className="w-full bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 transition-all font-medium"
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
                  disabled={isGenerating || !selectedTrack || !topicPrompt || !selectedTopicId}
                  className="bg-primary text-on-primary px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center gap-2 transition-all hover:opacity-90 active:scale-95"
                >
                   {isGenerating ? <><Loader2 className="animate-spin" /> Gathering Intel...</> : 'Generate and Auto-Approve'}
                </button>
             </div>
           </div>
        </div>

        {drafts.length > 0 && (
          <div className="space-y-6">
             <h3 className="text-xl font-bold text-on-surface">Pending Review From Older Drafts ({drafts.length})</h3>
             {drafts.map((draft, i) => {
                const currentCat = selectedMapping[draft.id]?.categoryId || draft.preAssignedCategoryId;
                const currentTop = selectedMapping[draft.id]?.topicId || draft.preAssignedTopicId;

                return (
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
                    
                    <div className="mb-4 flex gap-4 opacity-60 hover:opacity-100 transition-opacity">
                       <div className="flex-1">
                          <label className="block text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest mb-1">Target Category</label>
                          <select 
                            value={currentCat || ''}
                            onChange={(e) => setSelectedMapping({
                              ...selectedMapping,
                              [draft.id]: { ...selectedMapping[draft.id], categoryId: e.target.value, topicId: '' }
                            })}
                            className="w-full bg-surface-container border border-outline-variant/30 rounded-lg px-3 py-2 text-xs font-bold text-on-surface focus:outline-none"
                          >
                            <option value="">Select Category</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.title || c.name}</option>)}
                          </select>
                       </div>
                       <div className="flex-1">
                          <label className="block text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest mb-1">Target Topic</label>
                          <select 
                            value={currentTop || ''}
                            disabled={!currentCat}
                            onChange={(e) => setSelectedMapping({
                              ...selectedMapping,
                              [draft.id]: { categoryId: currentCat, topicId: e.target.value }
                            })}
                            className="w-full bg-surface-container border border-outline-variant/30 rounded-lg px-3 py-2 text-xs font-bold text-on-surface focus:outline-none disabled:opacity-30"
                          >
                            <option value="">Select Topic</option>
                            {topics.filter(t => t.categoryId === currentCat).map(t => (
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
                );
             })}
          </div>
        )}

        <Toast message={toastMsg} isVisible={showToast} onClose={() => setShowToast(false)} type={toastMsg.includes('Failed') ? 'error' : 'success'} />
      </div>
    </DashboardLayout>
  );
}
