import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ArrowLeft, BookOpen } from 'lucide-react';

export default function ChooseFocus() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const handleSelectFocus = async (focus: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        learningMode: 'self_review',
        selectedFocus: focus,
      });
      await refreshUser();
      navigate('/diagnostic');
    } catch (e) {
      console.error(e);
      alert('Failed to set focus');
    }
  };

  const focusOptions = [
    { id: 'general_education', title: 'General Education', desc: 'Focus on Gen Ed foundations' },
    { id: 'professional_education', title: 'Professional Education', desc: 'Core teaching principles' },
    { id: 'major_specialization', title: 'Major / Specialization', desc: 'Your specific field of expertise' },
    { id: 'full_let_review', title: 'Full LET Review', desc: 'Comprehensive coverage' }
  ];

  return (
    <div className="bg-[#f0f2f5] min-h-screen text-slate-800 font-body py-12 px-6 flex flex-col items-center">
      <div className="max-w-2xl w-full">
        <button onClick={() => navigate('/choose-learning-mode')} className="mb-6 flex items-center gap-2 text-slate-400 hover:text-slate-800 font-bold text-sm tracking-widest uppercase transition-colors">
          <ArrowLeft size={16} /> Back
        </button>
        <h1 className="text-3xl font-black font-headline text-slate-800 mb-2">Select Your Focus</h1>
        <p className="text-slate-500 font-medium mb-8">What part of the LET are you prioritizing right now?</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {focusOptions.map(opt => (
            <button 
              key={opt.id}
              onClick={() => handleSelectFocus(opt.id)}
              className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all text-left flex flex-col gap-4 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <BookOpen size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800">{opt.title}</h3>
                <p className="text-sm text-slate-500 font-medium">{opt.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
