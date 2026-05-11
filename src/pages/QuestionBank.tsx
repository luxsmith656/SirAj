import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Link, useNavigate } from 'react-router-dom';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import Toast from '../components/Toast';

interface Question {
  id: string;
  stem: string;
  categoryId: string;
  correctOptionId: string;
  difficulty: string;
}

interface Category {
  id: string;
  name: string;
}

export default function QuestionBank() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Deletion state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    // Categories for mapping names
    const unsubCats = onSnapshot(collection(db, 'categories'), (snapshot) => {
      setCategories(snapshot.docs.map(d => ({ id: d.id, name: d.data().name })));
    });

    // Questions list
    const q = query(collection(db, 'questions'), orderBy('stem', 'asc'));
    const unsubQs = onSnapshot(q, (snapshot) => {
      setQuestions(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Question)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'questions');
    });

    return () => { unsubCats(); unsubQs(); };
  }, []);

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'questions', deleteId));
      setDeleteId(null);
      setToastMsg('Question deleted successfully');
      setShowToast(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `questions/${deleteId}`);
      setToastMsg('Failed to delete question');
      setShowToast(true);
    } finally {
      setIsDeleting(false);
    }
  };

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || 'Unknown';

  const filteredQuestions = questions.filter(q => 
    q.stem.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout title="Admin Panel">
      <div className="p-8 max-w-6xl mx-auto w-full text-on-surface">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <h2 className="text-4xl font-extrabold text-[#1b366a] font-headline tracking-tight mb-2">Question Bank</h2>
            <p className="text-slate-500 font-medium">Manage board exam multiple choice questions.</p>
          </div>
          <button 
            onClick={() => navigate('/question/new')}
            className="px-6 py-2.5 rounded-xl bg-[#1b366a] text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-blue-900/20"
          >
            <span className="material-symbols-outlined text-[18px]">add</span> Add Question
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
             <span className="material-symbols-outlined text-slate-400">search</span>
             <input 
               type="text" 
               placeholder="Search by keyword or stem..." 
               className="bg-transparent border-none outline-none text-sm w-full font-medium"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/30">
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Question Stem</th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Domain</th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Difficulty</th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuestions.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-slate-400 italic">No questions found.</td>
                  </tr>
                )}
                {filteredQuestions.map((q) => (
                  <tr key={q.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                    <td className="p-4">
                      <p className="text-sm font-bold text-slate-700 line-clamp-1">{q.stem}</p>
                    </td>
                    <td className="p-4">
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{getCategoryName(q.categoryId)}</span>
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        q.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-600' :
                        q.difficulty === 'Medium' ? 'bg-amber-50 text-amber-600' :
                        'bg-red-50 text-red-600'
                      }`}>
                        {q.difficulty}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => navigate(`/question/edit/${q.id}`)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button 
                          onClick={() => setDeleteId(q.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <DeleteConfirmModal 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Question?"
        message="Are you sure you want to permanently remove this question from the bank? This action cannot be undone."
        isDeleting={isDeleting}
      />

      <Toast 
        isVisible={showToast}
        message={toastMsg}
        onClose={() => setShowToast(false)}
        type={toastMsg.includes('failed') ? 'error' : 'success'}
      />
    </AdminLayout>
  );
}
