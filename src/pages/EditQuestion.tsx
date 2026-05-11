import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc, addDoc, collection, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

interface Option {
  id: string;
  text: string;
}

interface Category {
  id: string;
  name: string;
}

export default function EditQuestion() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  const [stem, setStem] = useState('');
  const [options, setOptions] = useState<Option[]>([
    { id: 'A', text: '' },
    { id: 'B', text: '' },
    { id: 'C', text: '' },
    { id: 'D', text: '' }
  ]);
  const [correctOptionId, setCorrectOptionId] = useState('A');
  const [categoryId, setCategoryId] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(!isNew);

  useEffect(() => {
    // Fetch categories
    const unsub = onSnapshot(collection(db, 'categories'), (snapshot) => {
      const cats = snapshot.docs.map(d => ({ id: d.id, name: d.data().name }));
      setCategories(cats);
      if (cats.length > 0 && !categoryId) setCategoryId(cats[0].id);
    });

    if (!isNew) {
      const fetchQuestion = async () => {
        try {
          const qDoc = await getDoc(doc(db, 'questions', id));
          if (qDoc.exists()) {
            const data = qDoc.data();
            setStem(data.stem);
            setOptions(data.options);
            setCorrectOptionId(data.correctOptionId);
            setCategoryId(data.categoryId);
            setDifficulty(data.difficulty || 'Medium');
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `questions/${id}`);
        } finally {
          setIsLoading(false);
        }
      };
      fetchQuestion();
    }

    return () => unsub();
  }, [id, isNew]);

  const handleSave = async () => {
    if (!stem || !categoryId) {
      alert('Please fill in required fields');
      return;
    }

    const questionData = {
      stem,
      options,
      correctOptionId,
      categoryId,
      difficulty,
      updatedAt: new Date().toISOString()
    };

    try {
      if (isNew) {
        await addDoc(collection(db, 'questions'), questionData);
      } else {
        await setDoc(doc(db, 'questions', id), questionData);
      }
      navigate('/question/bank');
    } catch (error) {
      handleFirestoreError(error, isNew ? OperationType.CREATE : OperationType.UPDATE, 'questions');
    }
  };

  const updateOptionText = (idx: number, text: string) => {
    const newOptions = [...options];
    newOptions[idx].text = text;
    setOptions(newOptions);
  };

  if (isLoading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <AdminLayout title="Scholarly Reviewer">
      <div className="mt-8 p-8 max-w-5xl mx-auto w-full flex-1">
            <nav className="flex items-center gap-2 text-xs text-slate-400 font-bold uppercase tracking-widest mb-6">
              <span className="cursor-pointer hover:text-blue-600" onClick={() => navigate('/question/bank')}>Question Bank</span>
              <span className="material-symbols-outlined text-sm">chevron_right</span>
              <span className="text-[#1b366a]">{isNew ? 'New Question' : 'Edit Question'}</span>
            </nav>

            <div className="flex justify-between items-end mb-8">
               <div>
                  <h2 className="text-3xl font-headline font-extrabold text-[#1b366a] mb-2">{isNew ? 'Create MCQ' : 'Edit MCQ'}</h2>
                  <p className="text-slate-500 text-sm font-medium">Define question stem, choices, and classification.</p>
               </div>
               <div className="flex gap-3">
                  <button onClick={() => navigate('/question/bank')} className="px-6 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-bold text-sm">Cancel</button>
                  <button onClick={handleSave} className="px-8 py-2.5 rounded-xl text-white bg-[#1b366a] font-bold text-sm shadow-lg shadow-blue-900/20">Save Question</button>
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-10">
               <div className="lg:col-span-8 space-y-8">
                  <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
                     <h3 className="font-headline font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-600">edit_note</span> Question Stem
                     </h3>
                     <textarea 
                        className="w-full h-32 bg-slate-50 border border-transparent rounded-xl resize-none p-4 text-sm font-medium focus:bg-white focus:border-blue-200 outline-none transition-all" 
                        placeholder="Type the question content here..."
                        value={stem}
                        onChange={(e) => setStem(e.target.value)}
                     />
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                     <h3 className="font-headline font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-emerald-600">checklist</span> Answer Options
                     </h3>
                     <div className="space-y-4">
                        {options.map((opt, idx) => (
                           <div key={opt.id} className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${correctOptionId === opt.id ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-transparent'}`}>
                              <input 
                                type="radio" 
                                name="answer" 
                                checked={correctOptionId === opt.id}
                                onChange={() => setCorrectOptionId(opt.id!)}
                                className="mt-1 w-5 h-5 accent-emerald-600" 
                              />
                              <div className="flex-1">
                                 <span className="block font-bold text-[10px] uppercase tracking-widest text-slate-400 mb-1">Option {opt.id} {correctOptionId === opt.id && <span className="ml-2 text-emerald-600">(Correct)</span>}</span>
                                 <textarea 
                                    className="w-full h-12 bg-transparent border-none p-0 text-sm font-medium resize-none outline-none" 
                                    placeholder={`Enter text for option ${opt.id}...`}
                                    value={opt.text}
                                    onChange={(e) => updateOptionText(idx, e.target.value)}
                                 />
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>

               <div className="lg:col-span-4 space-y-8">
                  <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                     <h3 className="font-headline font-bold text-base text-slate-800 mb-4">Meta Information</h3>
                     <div className="space-y-6">
                        <div className="space-y-1.5">
                           <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Curriculum Domain</label>
                           <select 
                             className="w-full bg-slate-50 border border-transparent rounded-xl text-sm font-bold py-3 px-4 outline-none focus:bg-white focus:border-blue-200 transition-all"
                             value={categoryId}
                             onChange={(e) => setCategoryId(e.target.value)}
                           >
                              <option value="">Select Domain</option>
                              {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                           </select>
                        </div>
                        <div className="space-y-1.5">
                           <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Difficulty Level</label>
                           <div className="grid grid-cols-3 gap-2">
                              {['Easy', 'Medium', 'Hard'].map(level => (
                                <button 
                                  key={level}
                                  onClick={() => setDifficulty(level)}
                                  className={`py-2 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all border ${
                                    difficulty === level 
                                    ? 'bg-[#1b366a] text-white border-[#1b366a]' 
                                    : 'bg-slate-50 text-slate-400 border-transparent hover:bg-slate-100'
                                  }`}
                                >
                                  {level}
                                </button>
                              ))}
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
    </AdminLayout>
  );
}
