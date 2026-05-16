import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BrainCircuit, Check, X } from 'lucide-react';

import AIAssistant from '../components/AIAssistant';

export default function QuizResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    attemptId, 
    scorePercent = 0, 
    total = 0, 
    correct = 0,
    questions = [], 
    answers = {} 
  } = location.state || {};
  
  const percentage = scorePercent;
  const incorrect = total - correct;

  return (
    <div className="bg-white text-slate-800 font-body min-h-[100dvh] flex flex-col antialiased">
       <header className="px-6 py-4 flex items-center justify-between bg-white border-b border-slate-100 sticky top-0 z-20">
          <Link to="/student/dashboard" className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 hover:bg-slate-100 transition-colors text-slate-500">
             <span className="material-symbols-outlined text-[20px]">close</span>
          </Link>
          <h2 className="font-headline font-bold text-sm tracking-wide text-slate-800">Exam Results</h2>
          <div className="w-10"></div>
       </header>

       <div className="flex-1 overflow-y-auto pb-24">
          <div className="bg-[#1b366a] pt-8 pb-16 px-6 text-white rounded-b-[2.5rem] relative overflow-hidden">
             <div className="relative z-10 max-w-md mx-auto text-center">
                <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">Simulation Complete</span>
                <h1 className="text-3xl font-black font-headline mb-8 tracking-tight">Great effort!<br/>Keep pushing.</h1>
                
                <div className="flex justify-center">
                   <div className="w-40 h-40 rounded-full border-[12px] border-white/10 flex flex-col items-center justify-center relative shadow-lg bg-[#1b366a]">
                      <span className="text-5xl font-black font-headline tracking-tighter relative z-10 text-white">{percentage}<span className="text-2xl">%</span></span>
                      <span className="text-[10px] font-bold text-blue-200 relative z-10 mt-1 uppercase tracking-widest">Global Score</span>
                   </div>
                </div>
             </div>
          </div>

          <div className="max-w-md mx-auto px-6 -mt-8 relative z-20">
             <div className="bg-white rounded-3xl p-6 shadow-xl shadow-blue-900/10 border border-slate-100 grid grid-cols-2 gap-4 mb-8">
                <div className="text-center p-4 bg-slate-50 rounded-2xl">
                   <span className="material-symbols-outlined text-emerald-600 block mb-2 mx-auto">check_circle</span>
                   <span className="text-2xl font-black block text-slate-800 tabular-nums">{correct}</span>
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Correct</span>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-2xl">
                   <span className="material-symbols-outlined text-red-600 block mb-2 mx-auto">cancel</span>
                   <span className="text-2xl font-black block text-slate-800 tabular-nums">{incorrect}</span>
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Incorrect</span>
                </div>
             </div>

             <div className="space-y-4">
                <h3 className="font-headline font-bold text-lg mb-4 text-slate-800">Historical Insights</h3>
                
                <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm mb-8">
                   <div className="flex items-center gap-3 mb-2">
                       <span className="material-symbols-outlined text-blue-600 text-sm">trending_up</span>
                       <h4 className="font-bold text-sm text-slate-800">Domain Performance</h4>
                   </div>
                   <p className="text-xs text-slate-500 font-medium leading-relaxed">Your answers have been indexed into your mastery profile. Review individual domain performance in your analytics dashboard.</p>
                </div>
             </div>

             {questions.length > 0 && (
                <div className="mt-8 space-y-6">
                   <h3 className="font-headline font-bold text-lg mb-4 text-slate-800">Answer Review</h3>
                   <div className="space-y-4">
                      {questions.map((q: any, i: number) => {
                         const studentAns = answers[q.id];
                         const isCorrect = studentAns === q.correctOptionId;
                         const studentOpt = q.options?.find((o: any) => o.id === studentAns);
                         const correctOpt = q.options?.find((o: any) => o.id === q.correctOptionId);

                         return (
                            <div key={q.id} className={`p-5 rounded-2xl border ${isCorrect ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
                               <div className="flex gap-3 mb-3">
                                  <div className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-white ${isCorrect ? 'bg-emerald-500' : 'bg-red-500'}`}>
                                     {isCorrect ? <Check size={14} /> : <X size={14} />}
                                  </div>
                                  <h4 className="font-bold text-slate-800 text-sm leading-snug">{i + 1}. {q.stem}</h4>
                               </div>
                               
                               <div className="pl-9 space-y-3">
                                  {!isCorrect && (
                                     <div className="text-sm">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-0.5">Your Answer</span>
                                        <p className="text-red-800 font-medium">{studentOpt?.text}</p>
                                     </div>
                                  )}
                                  <div className="text-sm">
                                     <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-0.5">Correct Answer</span>
                                     <p className="text-emerald-800 font-bold">{correctOpt?.text}</p>
                                  </div>

                                  <AIAssistant 
                                    questionTitle={q.stem}
                                    options={q.options}
                                    studentAnswerId={studentAns}
                                    correctAnswerId={q.correctOptionId}
                                  />
                               </div>
                            </div>
                         );
                      })}
                   </div>
                </div>
             )}
          </div>
       </div>

       <div className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-md p-6 border-t border-slate-100 z-30">
          <div className="max-w-md mx-auto flex gap-4">
             <button onClick={() => navigate('/student/dashboard')} className="flex-1 py-4 rounded-2xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors uppercase tracking-widest text-[11px]">
                Home
             </button>
             <button onClick={() => navigate('/focus')} className="flex-1 py-4 rounded-2xl font-bold bg-[#1b366a] text-white shadow-lg hover:bg-[#112349] transition-all uppercase tracking-widest text-[11px]">
                Another Set
             </button>
          </div>
       </div>
    </div>
  );
}
