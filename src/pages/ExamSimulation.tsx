import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';

interface Question {
  id: string;
  stem: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  categoryId: string;
}

export default function ExamSimulation() {
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get('category');
  const navigate = useNavigate();
  const { user } = useAuth();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(3600); // 1 hour

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const q = categoryId 
          ? query(collection(db, 'questions'), where('categoryId', '==', categoryId))
          : collection(db, 'questions');
        
        const snapshot = await getDocs(q);
        const fetched = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Question));
        setQuestions(fetched);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'questions');
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestions();
  }, [categoryId]);

  useEffect(() => {
    if (questions.length > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [questions]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentIndex];

  const handleNext = async () => {
    if (!selectedOption || !currentQuestion) return;

    const isCorrect = selectedOption === currentQuestion.correctOptionId;
    const newAnswers = { ...userAnswers, [currentQuestion.id]: selectedOption };
    setUserAnswers(newAnswers);

    // Track submission in Firestore
    try {
      await addDoc(collection(db, 'submissions'), {
        userId: user?.uid,
        questionId: currentQuestion.id,
        selectedOptionId: selectedOption,
        isCorrect,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to log submission', error);
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(newAnswers[questions[currentIndex + 1]?.id] || null);
    } else {
      // Calculate score and navigate to results
      const score = Object.entries(newAnswers).reduce((acc, [qid, ans]) => {
        const q = questions.find(qu => qu.id === qid);
        return q && ans === q.correctOptionId ? acc + 1 : acc;
      }, 0);
      
      navigate('/quiz-results', { state: { score, total: questions.length } });
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setSelectedOption(userAnswers[questions[currentIndex - 1].id] || null);
    }
  };

  if (isLoading) return <div className="p-12 text-center">Loading questions...</div>;
  if (questions.length === 0) return (
    <div className="p-12 text-center max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">No questions found</h2>
      <p className="text-slate-500 mb-6">There are no questions in this category yet.</p>
      <button onClick={() => navigate('/focus')} className="bg-[#1b366a] text-white px-6 py-2 rounded-xl font-bold">Go Back</button>
    </div>
  );

  return (
    <div className="bg-white text-slate-800 font-body min-h-[100dvh] flex flex-col antialiased relative">
       <header className="px-5 py-4 flex items-center justify-between bg-white border-b border-slate-100 sticky top-0 z-20">
          <div className="flex items-center gap-3">
             <button onClick={() => navigate('/focus')} className="text-slate-400 hover:text-slate-600 transition-colors">
                <span className="material-symbols-outlined">close</span>
             </button>
             <div className="bg-slate-50 px-3 py-1.5 rounded-xl text-xs font-bold font-mono text-slate-700 flex items-center gap-1.5 border border-slate-100">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                {formatTime(timeRemaining)}
             </div>
          </div>
          <div className="font-bold text-[11px] tracking-widest text-[#1b366a] uppercase">
             Question <span className="text-lg tabular-nums">{currentIndex + 1}</span> / {questions.length}
          </div>
       </header>

       <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-5 py-8">
          <div className="flex items-center gap-2 mb-6">
             <span className="bg-blue-50 text-[#1b366a] px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-100">Simulation Mode</span>
          </div>

          <div className="text-slate-800 font-headline text-xl mb-10 leading-snug font-extrabold tracking-tight">
             {currentQuestion.stem}
          </div>

          <div className="flex-1 space-y-4">
             {currentQuestion.options.map((opt) => {
               const isSelected = selectedOption === opt.id;
               return (
                 <button
                   key={opt.id}
                   onClick={() => setSelectedOption(opt.id)}
                   className={`w-full p-5 rounded-2xl border-2 flex items-start gap-4 transition-all text-left ${
                     isSelected 
                       ? 'border-[#1b366a] bg-blue-50/50 shadow-sm' 
                       : 'border-slate-100 bg-slate-50 hover:border-blue-200'
                   }`}
                 >
                   <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm transition-colors ${
                     isSelected ? 'bg-[#1b366a] text-white' : 'bg-slate-200 text-slate-500'
                   }`}>
                      {opt.id}
                   </div>
                   <span className={`font-bold text-[15px] pt-1 leading-snug ${isSelected ? 'text-[#1b366a]' : 'text-slate-700'}`}>
                     {opt.text}
                   </span>
                 </button>
               );
             })}
          </div>
       </div>

       <div className="bg-white border-t border-slate-100 p-5 flex justify-between items-center sticky bottom-0 z-20">
          <button 
            disabled={currentIndex === 0}
            onClick={handlePrevious}
            className="px-6 py-3 rounded-xl font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
          >
             Previous
          </button>
          <button 
            disabled={!selectedOption}
            onClick={handleNext}
            className="px-10 py-4 rounded-2xl bg-[#1b366a] text-white font-bold shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:shadow-none hover:bg-[#112349] transition-all text-xs uppercase tracking-widest flex items-center gap-2"
          >
             {currentIndex === questions.length - 1 ? 'Finish Exam' : 'Next Question'}
             <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
       </div>
    </div>
  );
}
