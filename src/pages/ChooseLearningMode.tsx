import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, User, ArrowRight } from 'lucide-react';

export default function ChooseLearningMode() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#f0f2f5] text-slate-800 font-body min-h-screen flex items-center justify-center antialiased">
      <div className="max-w-xl w-full px-6 py-12">
        <h1 className="text-3xl font-black font-headline text-slate-800 mb-2 text-center">How are you reviewing?</h1>
        <p className="text-slate-500 text-sm font-medium mb-12 text-center">Do you have a class code or an instructor invite?</p>

        <div className="space-y-6">
          <button 
            onClick={() => navigate('/join-class')}
            className="w-full bg-white p-6 rounded-3xl shadow-md hover:shadow-xl hover:border-indigo-200 border border-slate-100 flex items-center justify-between group transition-all text-left"
          >
            <div className="flex items-center gap-6">
               <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Users size={28} />
               </div>
               <div>
                  <h3 className="font-bold text-lg text-slate-800">Yes, I have a class code</h3>
                  <p className="text-sm font-medium text-slate-500">Join a professor's Let Mastery class</p>
               </div>
            </div>
            <ArrowRight className="text-slate-300 group-hover:text-indigo-600 transition-colors" />
          </button>

          <button 
            onClick={() => navigate('/choose-focus')}
            className="w-full bg-white p-6 rounded-3xl shadow-md hover:shadow-xl hover:border-emerald-200 border border-slate-100 flex items-center justify-between group transition-all text-left"
          >
            <div className="flex items-center gap-6">
               <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <User size={28} />
               </div>
               <div>
                  <h3 className="font-bold text-lg text-slate-800">No, I am reviewing on my own</h3>
                  <p className="text-sm font-medium text-slate-500">I want to study independently</p>
               </div>
            </div>
            <ArrowRight className="text-slate-300 group-hover:text-emerald-600 transition-colors" />
          </button>
        </div>
      </div>
    </div>
  );
}
