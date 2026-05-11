import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { doc, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

interface Question {
  id: string;
  stem: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  categoryId: string;
}

export default function QuestionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [question, setQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchQuestion = async () => {
      if (!id) return;
      try {
        const docSnap = await getDoc(doc(db, 'questions', id));
        if (docSnap.exists()) {
          setQuestion({ id: docSnap.id, ...docSnap.data() } as Question);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `questions/${id}`);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestion();
  }, [id]);

  if (isLoading) return <AdminLayout><div className="p-12 text-center text-slate-400">Loading details...</div></AdminLayout>;
  if (!question) return <AdminLayout><div className="p-12 text-center text-red-400">Question not found.</div></AdminLayout>;

  return (
    <AdminLayout title="Question Review">
      <div className="pt-8 pb-12 px-8 max-w-5xl mx-auto flex flex-col gap-8">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
               <div>
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Document ID: {question.id}</span>
                   <h2 className="text-3xl font-extrabold text-[#1b366a] font-headline tracking-tight max-w-3xl">Question Inspection</h2>
               </div>
               <div className="flex gap-3">
                   <Link 
                     to={`/edit/question/${question.id}`}
                     className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-100 text-[#1b366a] font-bold hover:bg-slate-200 transition-all text-xs uppercase tracking-widest shadow-sm"
                   >
                     <span className="material-symbols-outlined text-[18px]">edit</span> Edit Entry
                   </Link>
               </div>
           </div>

           <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[400px]">
              <div className="flex-1 p-8 md:border-r border-slate-100">
                <div className="mb-8">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-3 block">Question Stem</span>
                  <div className="text-xl font-bold text-slate-800 leading-relaxed font-headline">
                    {question.stem}
                  </div>
                </div>

                <div className="space-y-4">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-1 block">Response Options</span>
                  {question.options.map((opt) => (
                    <div 
                      key={opt.id}
                      className={`p-5 rounded-2xl border-2 flex items-start gap-4 transition-all ${
                        opt.id === question.correctOptionId 
                          ? 'border-emerald-100 bg-emerald-50/50' 
                          : 'border-slate-50 bg-slate-50/30'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm ${
                        opt.id === question.correctOptionId ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-200 text-slate-500'
                      }`}>
                        {opt.id}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-bold ${opt.id === question.correctOptionId ? 'text-emerald-700' : 'text-slate-600'}`}>
                          {opt.text}
                        </p>
                        {opt.id === question.correctOptionId && (
                           <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600/60 mt-1 block">Marked as Correct</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-full md:w-80 bg-slate-50/50 p-8 flex flex-col gap-6">
                <div>
                   <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4 block">Question Metadata</span>
                   <div className="space-y-4">
                      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                         <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Index Domain</p>
                         <p className="text-xs font-bold text-[#1b366a]">Professional Education</p>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                         <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Difficulty</p>
                         <div className="flex items-center gap-1.5 mt-1">
                            <div className="flex gap-0.5">
                               {[1,2,3,4,5].map(i => (
                                  <div key={i} className={`w-1.5 h-3 rounded-full ${i <= 3 ? 'bg-blue-400' : 'bg-slate-100'}`}></div>
                               ))}
                            </div>
                            <span className="text-[10px] font-bold text-slate-500 ml-1">Standard</span>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="mt-auto pt-6 border-t border-slate-200">
                   <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-2 leading-relaxed">
                      Questions are encrypted at rest and indexed for optimal retrieval during sim simulations.
                   </p>
                </div>
              </div>
           </div>
        </div>
    </AdminLayout>
  );
}
