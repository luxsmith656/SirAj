import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { OfflineData } from '../lib/offline/offlineData';
import { motion } from 'motion/react';

interface Question {
  id: string;
  stem: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
}

export default function DiagnosticAssessment() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [hasStarted, setHasStarted] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // We'll gather 5-10 questions from different categories to assess baseline
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const cats = await OfflineData.getCategories();
        let loaded: Question[] = [];
        for (const cat of cats) {
           const someQs = await OfflineData.getRandomQuestions(cat.id, 2);
           loaded = [...loaded, ...someQs];
        }

        if (loaded.length === 0) {
          // Large sample fallback data to ensure diagnostic is completely functional
          loaded = [
            { id: 'f1', stem: 'Which philosophy of education strongly emphasizes the back-to-basics curriculum?', options: [{id:'A', text:'Essentialism'},{id:'B', text:'Progressivism'},{id:'C', text:'Existentialism'},{id:'D', text:'Perennialism'}], correctOptionId: 'A' },
            { id: 'f2', stem: 'In Piaget’s theory, what is the process of modifying existing schemas to fit new information?', options: [{id:'A', text:'Assimilation'},{id:'B', text:'Accommodation'},{id:'C', text:'Equilibration'},{id:'D', text:'Conservation'}], correctOptionId: 'B' },
            { id: 'f3', stem: 'According to Erikson, what is the primary psychosocial crisis of adolescence?', options: [{id:'A', text:'Trust vs. Mistrust'},{id:'B', text:'Identity vs. Role Confusion'},{id:'C', text:'Intimacy vs. Isolation'},{id:'D', text:'Industry vs. Inferiority'}], correctOptionId: 'B' },
            { id: 'f4', stem: 'What type of assessment is given before instruction to determine students\' entry knowledge and skills?', options: [{id:'A', text:'Formative Assessment'},{id:'B', text:'Summative Assessment'},{id:'C', text:'Diagnostic Assessment'},{id:'D', text:'Placement Assessment'}], correctOptionId: 'C' },
            { id: 'f5', stem: 'Which of the following is an example of an extrinsic motivation?', options: [{id:'A', text:'Learning for the joy of it'},{id:'B', text:'Studying to get a high grade'},{id:'C', text:'Reading a book out of curiosity'},{id:'D', text:'Solving puzzles for fun'}], correctOptionId: 'B' },
            { id: 'f6', stem: 'Who is known as the "Father of Modern Kindergarten"?', options: [{id:'A', text:'John Dewey'},{id:'B', text:'Maria Montessori'},{id:'C', text:'Friedrich Froebel'},{id:'D', text:'Jean Piaget'}], correctOptionId: 'C' },
            { id: 'f7', stem: 'What is the highest level in Bloom\'s Original Taxonomy of the Cognitive Domain?', options: [{id:'A', text:'Synthesis'},{id:'B', text:'Evaluation'},{id:'C', text:'Analysis'},{id:'D', text:'Application'}], correctOptionId: 'B' },
            { id: 'f8', stem: 'Which law professionalized teaching in the Philippines?', options: [{id:'A', text:'RA 7722'},{id:'B', text:'RA 7836'},{id:'C', text:'RA 9293'},{id:'D', text:'RA 10533'}], correctOptionId: 'B' },
            { id: 'f9', stem: 'What learning theory states that learning is a change in observable behavior?', options: [{id:'A', text:'Cognitivism'},{id:'B', text:'Constructivism'},{id:'C', text:'Behaviorism'},{id:'D', text:'Humanism'}], correctOptionId: 'C' },
            { id: 'f10', stem: 'The "Zone of Proximal Development" is a concept introduced by whom?', options: [{id:'A', text:'Lev Vygotsky'},{id:'B', text:'Albert Bandura'},{id:'C', text:'B.F. Skinner'},{id:'D', text:'Ivan Pavlov'}], correctOptionId: 'A' },
          ];
        }

        setQuestions(loaded);
      } catch (error) {
        console.error('Failed to load diagnostic questions', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadQuestions();
  }, []);

  const handleNext = async (optionId: string) => {
    const newAnswers = { ...answers, [questions[currentIndex].id]: optionId };
    setAnswers(newAnswers);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsSubmitting(true);
      // Calculate basic profile
      let correct = 0;
      Object.entries(newAnswers).forEach(([qid, ans]) => {
         const q = questions.find(qu => qu.id === qid);
         if (q && q.correctOptionId === ans) correct++;
      });
      const baselineScore = Math.round((correct / questions.length) * 100);

      try {
        // Save learner profile online since it's a structural thing, but could also be local
        await setDoc(doc(db, 'learnerProfiles', user!.uid), {
           userId: user!.uid,
           baselineScore,
           completedAt: Date.now(),
           weaknesses: [],
           strengths: [],
           recommendedPath: 'Standard'
        });
        await refreshUser();
        navigate('/student/dashboard');
      } catch (err) {
        console.error('Failed to save profile', err);
        // Fallback to offline dash anyway
        navigate('/student/dashboard');
      }
    }
  };

  if (isLoading) return <div className="p-12 text-center text-[#1b366a] font-bold">Loading Diagnostic...</div>;

  if (questions.length === 0) {
    return (
      <div className="p-12 text-center max-w-md mx-auto mt-20">
        <h2 className="text-xl font-bold mb-4">No content available</h2>
        <p className="text-slate-500 mb-6">We don't have enough data to generate a diagnostic test. Talk to your instructor.</p>
        <button onClick={() => navigate('/student/dashboard')} className="bg-[#1b366a] text-white px-6 py-2 rounded-xl font-bold">Skip for now</button>
      </div>
    );
  }

  if (!hasStarted) {
    return (
      <div className="bg-[#f0f2f5] text-slate-800 font-body min-h-screen flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-blue-900/10 border border-slate-100">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-3xl">psychology</span>
          </div>
          <h1 className="text-3xl font-black font-headline text-slate-800 mb-4">Diagnostic Assessment</h1>
          <p className="text-slate-600 font-medium mb-8 leading-relaxed">
            Welcome to the Let Mastery review process! Before you begin, we need to understand your current baseline.
            This diagnostic exam helps the AI tailor your learning path.
          </p>
          
          <div className="space-y-4 mb-10">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex gap-4 items-start">
               <span className="material-symbols-outlined text-slate-400 mt-1">target</span>
               <div>
                 <h3 className="font-bold text-slate-800">Based on your focus</h3>
                 <p className="text-sm text-slate-500">
                   {user?.learningMode === 'class_based' 
                     ? "This assessment uses the curriculum assigned by your instructor." 
                     : "This assessment focuses on your selected study area."}
                 </p>
               </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex gap-4 items-start">
               <span className="material-symbols-outlined text-slate-400 mt-1">analytics</span>
               <div>
                 <h3 className="font-bold text-slate-800">Personalized Learning Path</h3>
                 <p className="text-sm text-slate-500">Your results will not be graded for a score, but will unlock modules based on what you need to study most.</p>
               </div>
            </div>
          </div>

          <button 
            onClick={() => setHasStarted(true)}
            className="w-full bg-[#1b366a] text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:-translate-y-0.5 transition-transform uppercase tracking-widest text-sm flex items-center justify-center gap-2"
          >
            Start Assessment <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
     <div className="bg-[#f0f2f5] text-slate-800 font-body min-h-screen flex flex-col antialiased">
       <header className="px-5 py-4 flex items-center justify-between bg-white border-b border-slate-100 sticky top-0 z-20">
          <div className="font-bold text-[#1b366a]">Diagnostic Assessment {isSubmitting && '- Saving...'}</div>
          <div className="text-xs font-bold text-slate-400">Question {currentIndex + 1} of {questions.length}</div>
       </header>

       <main className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-5 py-8 opacity-100">
         <div className="mb-8">
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
               <div 
                 className="bg-[#1b366a] h-full transition-all duration-300"
                 style={{ width: `${((currentIndex) / questions.length) * 100}%` }}
               />
            </div>
         </div>

         <div className="text-xl font-extrabold font-headline mb-8 text-slate-800">
           {currentQuestion.stem}
         </div>

         <div className="space-y-4">
           {currentQuestion.options.map(opt => (
             <motion.button
               whileHover={{ scale: 1.01 }}
               whileTap={{ scale: 0.99 }}
               key={opt.id}
               onClick={() => !isSubmitting && handleNext(opt.id)}
               className="w-full text-left p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-blue-300 transition-all font-semibold flex items-start gap-4"
             >
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center font-bold">
                   {opt.id}
                </div>
                <div className="pt-1.5 flex-1">{opt.text}</div>
             </motion.button>
           ))}
         </div>
       </main>
     </div>
  );
}
