import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';

interface Category {
  id: string;
  name: string;
}

export default function Focus() {
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleSignOut = () => {
    signOut();
    navigate('/sign-in');
  };

  useEffect(() => {
    const q = query(collection(db, 'categories'), orderBy('name', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCategories(snapshot.docs.map(d => ({ id: d.id, name: d.data().name })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'categories');
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="bg-white text-slate-800 font-body min-h-[100dvh] flex flex-col antialiased">
       <header className="px-6 py-4 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-slate-100">
          <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 hover:bg-slate-100 transition-colors text-slate-500">
             <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <div className="flex items-center gap-2">
             <div className="flex gap-1.5 mr-2">
                <div className="h-1.5 w-4 bg-slate-100 rounded-full"></div>
                <div className="h-1.5 w-8 bg-[#1b366a] rounded-full"></div>
                <div className="h-1.5 w-4 bg-slate-100 rounded-full"></div>
             </div>
             <button 
               onClick={handleSignOut}
               className="w-10 h-10 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 transition-colors"
               title="Sign Out"
             >
                <span className="material-symbols-outlined">logout</span>
             </button>
          </div>
       </header>

       <div className="flex-1 px-6 py-6 max-w-md mx-auto w-full flex flex-col">
          <div className="mb-8">
             <div className="w-10 h-10 bg-blue-50 text-[#1b366a] rounded-xl flex items-center justify-center mb-4">
                <span className="material-symbols-outlined">psychology</span>
             </div>
             <h1 className="text-2xl font-extrabold font-headline mb-2 tracking-tight text-slate-800">Select Focus</h1>
             <p className="text-slate-500 text-sm font-medium">Choose a domain to start your review simulation.</p>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto pb-4 no-scrollbar">
             {categories.length === 0 && <p className="text-center text-slate-400 py-10 italic">Your curriculum will appear here...</p>}
             {categories.map((cat) => (
               <button
                 key={cat.id}
                 onClick={() => setSelectedDomain(cat.id)}
                 className={`w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all text-left ${
                   selectedDomain === cat.id 
                     ? 'border-[#1b366a] bg-blue-50/50' 
                     : 'border-slate-100 bg-slate-50/50 hover:border-blue-200'
                 }`}
               >
                 <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                   selectedDomain === cat.id ? 'bg-[#1b366a] text-white' : 'bg-slate-200 text-slate-500'
                 }`}>
                    <span className="material-symbols-outlined">menu_book</span>
                 </div>
                 <span className={`font-bold text-[15px] ${selectedDomain === cat.id ? 'text-[#1b366a]' : 'text-slate-700'}`}>
                   {cat.name}
                 </span>
                 {selectedDomain === cat.id && (
                   <span className="material-symbols-outlined text-[#1b366a] ml-auto" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                 )}
               </button>
             ))}
          </div>

          <div className="pt-6 pb-4 bg-white">
             <button 
               onClick={() => navigate(`/exam?category=${selectedDomain}`)}
               disabled={!selectedDomain}
               className="w-full bg-[#1b366a] text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-900/10 hover:bg-[#112349] transition-all disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed uppercase tracking-widest text-[11px]"
             >
                Start Simulation
             </button>
          </div>
       </div>
    </div>
  );
}
