import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { collection, onSnapshot, query, addDoc, updateDoc, doc, deleteDoc, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  questionCount: number;
}

export default function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'categories'), orderBy('name', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const cats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
      setCategories(cats);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'categories');
    });
    return () => unsubscribe();
  }, []);

  const handleAddCategory = async () => {
    try {
      await addDoc(collection(db, 'categories'), {
        name: 'New Category',
        description: '',
        questionCount: 0
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'categories');
    }
  };

  const handleSave = async () => {
    if (!selectedCategory) return;
    try {
      await updateDoc(doc(db, 'categories', selectedCategory.id), {
        name: editName,
        description: editDesc
      });
      setIsEditing(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `categories/${selectedCategory.id}`);
    }
  };

  const selectCategory = (cat: Category) => {
    setSelectedCategory(cat);
    setEditName(cat.name);
    setEditDesc(cat.description || '');
    setIsEditing(true);
  };

  const rootCategories = categories.filter(c => !c.parentId);

  return (
    <AdminLayout title="Admin Panel">
      <div className="pt-8 px-8 pb-12 max-w-6xl mx-auto w-full text-on-surface">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-4xl font-extrabold text-[#1b366a] font-headline tracking-tight mb-2">Curriculum</h2>
                <p className="text-slate-500 font-medium">Organize Subjects & Domains.</p>
              </div>
              <div className="flex gap-3">
                 <button onClick={handleAddCategory} className="px-6 py-2.5 rounded-xl bg-[#1b366a] text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-blue-900/20">
                    <span className="material-symbols-outlined text-[18px]">add</span> Add Domain
                 </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
               <div className="lg:col-span-12 xl:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                  <h3 className="font-headline font-bold text-xl text-slate-800 mb-6">Subject Structure</h3>
                  
                  <div className="space-y-3">
                     {rootCategories.length === 0 && <p className="text-slate-400 italic py-4">No domains created yet...</p>}
                     {rootCategories.map(cat => (
                        <div key={cat.id} className="bg-slate-50 rounded-xl p-4 group border border-slate-100 hover:border-blue-200 transition-all cursor-pointer" onClick={() => selectCategory(cat)}>
                           <div className="flex items-center gap-3">
                              <span className="material-symbols-outlined text-blue-600">book</span>
                              <span className="font-bold text-slate-800">{cat.name}</span>
                              <span className="px-2 py-0.5 bg-blue-100 text-[#1b366a] text-[10px] font-bold rounded-full ml-auto uppercase tracking-widest">{cat.questionCount} Questions</span>
                           </div>
                           {cat.description && <p className="text-xs text-slate-500 mt-2 ml-9 line-clamp-1">{cat.description}</p>}
                        </div>
                     ))}
                  </div>
               </div>
               
               <div className="lg:col-span-12 xl:col-span-5">
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 sticky top-24">
                     {selectedCategory ? (
                        <div className="space-y-6">
                           <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                 <span className="material-symbols-outlined text-3xl">edit_note</span>
                              </div>
                              <div>
                                 <h4 className="font-headline font-bold text-lg text-slate-800">Edit Domain</h4>
                                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">ID: {selectedCategory.id.substring(0, 8)}</p>
                              </div>
                           </div>
                           
                           <div className="space-y-4">
                              <div className="space-y-1.5">
                                 <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Domain Name</label>
                                 <input 
                                   type="text" 
                                   className="w-full bg-slate-50 border border-transparent rounded-xl px-4 py-3 font-medium text-sm focus:bg-white focus:border-blue-200 outline-none transition-all" 
                                   value={editName}
                                   onChange={(e) => setEditName(e.target.value)}
                                 />
                              </div>
                              <div className="space-y-1.5">
                                 <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Description</label>
                                 <textarea 
                                   className="w-full bg-slate-50 border border-transparent rounded-xl px-4 py-3 font-medium text-sm resize-none focus:bg-white focus:border-blue-200 outline-none transition-all" 
                                   rows={4} 
                                   value={editDesc}
                                   onChange={(e) => setEditDesc(e.target.value)}
                                 />
                              </div>
                              
                              <div className="flex gap-3 pt-4">
                                 <button onClick={handleSave} className="flex-1 px-6 py-3 rounded-xl bg-[#1b366a] text-white font-bold text-sm shadow-lg shadow-blue-900/10">Save Changes</button>
                                 <button onClick={() => setSelectedCategory(null)} className="px-6 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-200 transition-colors">Close</button>
                              </div>
                           </div>
                        </div>
                     ) : (
                        <div className="py-12 flex flex-col items-center text-center">
                           <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                              <span className="material-symbols-outlined text-4xl">touch_app</span>
                           </div>
                           <h4 className="font-headline font-bold text-slate-800 text-lg">Selection Required</h4>
                           <p className="text-sm text-slate-400 max-w-[200px] mt-2">Select a domain from the list to start editing its curriculum details.</p>
                        </div>
                     )}
                  </div>
               </div>
            </div>
         </div>
    </AdminLayout>
  );
}
