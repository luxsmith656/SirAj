import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { collection, onSnapshot, query, addDoc, updateDoc, doc, deleteDoc, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import Toast from '../components/Toast';

interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  questionCount: number;
  reviewTracks?: string[];
}

export default function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editTracks, setEditTracks] = useState<string[]>(['elementary', 'secondary']);

  // Deletion state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

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

  const [isCreating, setIsCreating] = useState(false);

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setEditName('');
    setEditDesc('');
    setEditTracks(['elementary', 'secondary']);
    setIsCreating(true);
  };

  const handleSave = async () => {
    try {
      if (isCreating) {
        if (!editName.trim()) {
           setToastMsg('Domain name is required');
           setShowToast(true);
           return;
        }
        await addDoc(collection(db, 'categories'), {
          name: editName,
          description: editDesc,
          questionCount: 0,
          reviewTracks: editTracks
        });
        setIsCreating(false);
        setToastMsg('New domain added successfully');
        setShowToast(true);
      } else if (selectedCategory) {
        await updateDoc(doc(db, 'categories', selectedCategory.id), {
          name: editName,
          description: editDesc,
          reviewTracks: editTracks
        });
        setIsEditing(false);
        setToastMsg('Domain updated successfully');
        setShowToast(true);
      }
    } catch (error) {
      handleFirestoreError(error, isCreating ? OperationType.CREATE : OperationType.UPDATE, isCreating ? 'categories' : `categories/${selectedCategory?.id}`);
    }
  };

  const confirmDelete = async () => {
    if (!selectedCategory) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'categories', selectedCategory.id));
      setSelectedCategory(null);
      setIsEditing(false);
      setShowDeleteModal(false);
      setToastMsg('Domain deleted successfully');
      setShowToast(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `categories/${selectedCategory.id}`);
      setToastMsg('Failed to delete domain');
      setShowToast(true);
    } finally {
      setIsDeleting(false);
    }
  };

  const selectCategory = (cat: Category) => {
    setSelectedCategory(cat);
    setEditName(cat.name);
    setEditDesc(cat.description || '');
    setEditTracks(cat.reviewTracks || ['elementary', 'secondary']);
    setIsEditing(true);
    setIsCreating(false);
  };

  const rootCategories = categories.filter(c => !c.parentId);

  return (
    <DashboardLayout title="Admin Panel">
      <div className="pt-8 px-8 pb-12 max-w-6xl mx-auto w-full text-on-surface">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <div>
                <h2 className="text-4xl font-extrabold text-primary font-headline tracking-tight mb-2">Curriculum</h2>
                <p className="text-on-surface-variant/60 font-medium">Organize Subjects & Domains.</p>
              </div>
              <div className="flex gap-3">
                 <button onClick={handleAddCategory} className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-sm flex items-center gap-2 shadow-lg shadow-primary/20">
                    <span className="material-symbols-outlined text-[18px]">add</span> Add Domain
                 </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
               <div className="lg:col-span-12 xl:col-span-7 bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant shadow-sm">
                  <h3 className="font-headline font-bold text-xl text-on-surface mb-6">Subject Structure</h3>
                  
                  <div className="space-y-3">
                     {rootCategories.length === 0 && <p className="text-on-surface-variant/40 italic py-4 text-center">No domains created yet...</p>}
                     {rootCategories.map(cat => (
                        <div key={cat.id} className="bg-surface-container/30 rounded-xl p-4 group border border-outline-variant/30 hover:border-primary/50 transition-all cursor-pointer" onClick={() => selectCategory(cat)}>
                           <div className="flex items-center gap-3">
                              <span className="material-symbols-outlined text-primary">book</span>
                              <span className="font-bold text-on-surface">{cat.name}</span>
                              <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full ml-auto uppercase tracking-widest border border-primary/10">{cat.questionCount} Questions</span>
                           </div>
                           {cat.description && <p className="text-xs text-on-surface-variant/60 mt-2 ml-9 line-clamp-1">{cat.description}</p>}
                           {cat.reviewTracks && cat.reviewTracks.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2.5 ml-9">
                                 {cat.reviewTracks.map(t => (
                                    <span key={t} className="px-1.5 py-0.5 bg-surface-container text-on-surface-variant text-[8.5px] font-extrabold uppercase rounded tracking-wider border border-outline-variant/35">
                                       {t}
                                    </span>
                                 ))}
                              </div>
                           )}
                        </div>
                     ))}
                  </div>
               </div>
               
               <div className="lg:col-span-12 xl:col-span-5">
                  <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant sticky top-24">
                     {selectedCategory || isCreating ? (
                        <div className="space-y-6">
                           <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                 <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                    <span className="material-symbols-outlined text-3xl">{isCreating ? 'add_box' : 'edit_note'}</span>
                                 </div>
                                 <div className="min-w-0">
                                    <h4 className="font-headline font-bold text-lg text-on-surface truncate">{isCreating ? 'Create Domain' : 'Edit Domain'}</h4>
                                    {selectedCategory && <p className="text-xs font-bold text-on-surface-variant/40 uppercase tracking-widest">ID: {selectedCategory.id.substring(0, 8)}</p>}
                                 </div>
                              </div>
                              {selectedCategory && (
                                <button 
                                  onClick={() => setShowDeleteModal(true)}
                                  className="w-10 h-10 rounded-xl bg-error/10 text-error flex items-center justify-center hover:bg-error/20 transition-colors"
                                  title="Delete Domain"
                                >
                                   <span className="material-symbols-outlined">delete</span>
                                </button>
                              )}
                           </div>
                           
                           <div className="space-y-4">
                              <div className="space-y-1.5">
                                 <label className="block text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest ml-1">Domain Name</label>
                                 <input 
                                   type="text" 
                                   className="w-full bg-surface-container border border-transparent rounded-xl px-4 py-3 font-medium text-sm text-on-surface focus:bg-surface-container-lowest focus:border-primary/20 outline-none transition-all" 
                                   value={editName}
                                   onChange={(e) => setEditName(e.target.value)}
                                   placeholder="e.g. General Education"
                                 />
                              </div>
                              <div className="space-y-1.5">
                                 <label className="block text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest ml-1">Description</label>
                                 <textarea 
                                   className="w-full bg-surface-container border border-transparent rounded-xl px-4 py-3 font-medium text-sm text-on-surface resize-none focus:bg-surface-container-lowest focus:border-primary/20 outline-none transition-all" 
                                   rows={4} 
                                   value={editDesc}
                                   onChange={(e) => setEditDesc(e.target.value)}
                                   placeholder="Optional description..."
                                 />
                              </div>

                              <div className="space-y-2">
                                 <label className="block text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest ml-1">Track Alignment</label>
                                 <div className="flex flex-wrap gap-2">
                                    {[
                                       { id: 'elementary', label: 'Elementary' },
                                       { id: 'secondary', label: 'Secondary' },
                                       { id: 'gened', label: 'GenEd Only' },
                                       { id: 'profed', label: 'ProfEd Only' }
                                    ].map(trk => {
                                       const active = editTracks.includes(trk.id);
                                       return (
                                          <button
                                             key={trk.id}
                                             type="button"
                                             onClick={() => {
                                                if (active) {
                                                   setEditTracks(editTracks.filter(t => t !== trk.id));
                                                } else {
                                                   setEditTracks([...editTracks, trk.id]);
                                                }
                                             }}
                                             className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                                                active 
                                                   ? 'bg-primary/10 text-primary border-primary/25 shadow-sm' 
                                                   : 'bg-surface-container border-outline-variant/30 text-on-surface-variant/60 hover:border-on-surface-variant/20'
                                             }`}
                                          >
                                             {trk.label}
                                          </button>
                                       );
                                    })}
                                 </div>
                              </div>
                              
                              <div className="flex gap-3 pt-4">
                                 <button onClick={handleSave} className="flex-1 px-6 py-3 rounded-xl bg-primary text-on-primary font-bold text-sm shadow-lg shadow-primary/20">{isCreating ? 'Create Domain' : 'Save Changes'}</button>
                                 <button onClick={() => { setSelectedCategory(null); setIsCreating(false); }} className="px-6 py-3 rounded-xl bg-surface-container text-on-surface-variant font-bold text-sm hover:bg-surface-container/80 transition-colors">Cancel</button>
                               </div>
                           </div>
                        </div>
                     ) : (
                        <div className="py-12 flex flex-col items-center text-center">
                           <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center text-on-surface-variant/20 mb-4">
                              <span className="material-symbols-outlined text-4xl">touch_app</span>
                           </div>
                           <h4 className="font-headline font-bold text-on-surface text-lg">Selection Required</h4>
                           <p className="text-sm text-on-surface-variant/40 max-w-[200px] mt-2">Select a domain from the list to start editing its curriculum details.</p>
                        </div>
                     )}
                  </div>
               </div>
            </div>
         </div>

      <DeleteConfirmModal 
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Domain?"
        message={`Are you sure you want to delete "${selectedCategory?.name}"? This action cannot be undone and may affect associated questions.`}
        isDeleting={isDeleting}
      />

      <Toast 
        isVisible={showToast}
        message={toastMsg}
        onClose={() => setShowToast(false)}
        type={toastMsg.includes('failed') ? 'error' : 'success'}
      />
    </DashboardLayout>
  );
}
