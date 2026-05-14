import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, setDoc, getDocs, collection } from 'firebase/firestore';
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
  
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        let qs: Question[] = [];
        
        // Map user selected focus to category name
        let targetCategoryNames: string[] = [];
        if (user?.learningMode === 'class_based') {
           // We could get class details, but since user.selectedFocus is set:
           targetCategoryNames = mapFocusToCategories(user?.selectedFocus);
        } else {
           targetCategoryNames = mapFocusToCategories(user?.selectedFocus);
        }

        const catsSnap = await getDocs(collection(db, 'categories'));
        let targetCatIds: string[] = [];
        catsSnap.forEach(snap => {
          if (targetCategoryNames.length === 0 || targetCategoryNames.includes(snap.data().name)) {
            targetCatIds.push(snap.id);
          }
        });

        // Pull questions. No "IN" operator works easily for large arrays, but we will just query all or a few chunks.
        const qSnap = await getDocs(collection(db, 'questions'));
        let allQuestions: Question[] = [];
        qSnap.forEach(snap => {
          const d = snap.data();
          if (targetCatIds.includes(d.categoryId)) {
            allQuestions.push({
              id: snap.id,
              stem: d.stem,
              options: d.options,
              correctOptionId: d.correctOptionId
            });
          }
        });

        // Shuffle and pick 10
        allQuestions.sort(() => 0.5 - Math.random());
        qs = allQuestions.slice(0, 10);

        if (qs.length === 0) {
          qs = [
            { id: 'f1', stem: 'Which philosophy of education strongly emphasizes the back-to-basics curriculum?', options: [{id:'A', text:'Essentialism'},{id:'B', text:'Progressivism'},{id:'C', text:'Existentialism'},{id:'D', text:'Perennialism'}], correctOptionId: 'A' },
            { id: 'f2', stem: 'In Piaget’s theory, what is the process of modifying existing schemas to fit new information?', options: [{id:'A', text:'Assimilation'},{id:'B', text:'Accommodation'},{id:'C', text:'Equilibration'},{id:'D', text:'Conservation'}], correctOptionId: 'B' },
            { id: 'f3', stem: 'According to Erikson, what is the primary psychosocial crisis of adolescence?', options: [{id:'A', text:'Trust vs. Mistrust'},{id:'B', text:'Identity vs. Role Confusion'},{id:'C', text:'Intimacy vs. Isolation'},{id:'D', text:'Industry vs. Inferiority'}], correctOptionId: 'B' },
            { id: 'f4', stem: 'What type of assessment is given before instruction to determine students\' entry knowledge and skills?', options: [{id:'A', text:'Formative Assessment'},{id:'B', text:'Summative Assessment'},{id:'C', text:'Diagnostic Assessment'},{id:'D', text:'Placement Assessment'}], correctOptionId: 'C' },
            { id: 'f5', stem: 'Which of the following is an example of an extrinsic motivation?', options: [{id:'A', text:'Learning for the joy of it'},{id:'B', text:'Studying to get a high grade'},{id:'C', text:'Reading a book out of curiosity'},{id:'D', text:'Solving puzzles for fun'}], correctOptionId: 'B' },
          ];
        }

        setQuestions(qs);
      } catch (error) {
        console.error('Failed to load diagnostic questions', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadQuestions();
  }, [user]);

  const mapFocusToCategories = (focus?: string) => {
    switch (focus) {
      case 'general_education': return ['General Education'];
      case 'professional_education': return ['Professional Education'];
      case 'major_specialization': return ['Major: English', 'Major: Mathematics', 'Major: Science', 'Major: Social Science'];
      case 'full_let_review': return []; // All
      default: return [];
    }
  };

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
        const attemptRef = doc(collection(db, 'diagnosticAttempts'));
        await setDoc(attemptRef, {
          userId: user!.uid,
          score: baselineScore,
          totalQuestions: questions.length,
          answers: newAnswers,
          completedAt: Date.now()
        });

        const strengths = baselineScore >= 70 ? ['Concept Mastery', 'Quick Learner'] : ['Diligent Reviewer'];
        const weaknesses = baselineScore < 70 ? ['Theoretical Foundations', 'Test Taking Strategy'] : ['Advanced Application'];

        // Badge ID for "Pathfinder"
        const badgeId = 'badge_pioneer';

        // Save learner profile
        await setDoc(doc(db, 'learnerProfiles', user!.uid), {
           userId: user!.uid,
           baselineScore,
           completedAt: Date.now(),
           weaknesses: weaknesses,
           strengths: strengths,
           recommendedPath: baselineScore >= 70 ? 'Advanced Review' : 'Standard Foundation',
           earnedBadges: [badgeId]
        });

        // Update user
        await setDoc(doc(db, 'users', user!.uid), {
           diagnosticCompleted: true,
           earnedBadges: [badgeId],
           updatedAt: Date.now(),
           onboardingStep: 3
        }, { merge: true });

        await refreshUser();
        navigate('/student-dashboard');
      } catch (err: any) {
        console.error('Failed to save profile', err);
        // Fallback to dash anyway
        navigate('/student-dashboard');
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
      <div className="bg-surface text-on-surface font-body min-h-screen flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-surface-container-lowest rounded-3xl p-8 md:p-12 shadow-xl shadow-primary/10 border border-outline-variant/30">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-3xl">psychology</span>
          </div>
          <h1 className="text-3xl font-black font-headline text-on-surface mb-4">Diagnostic Assessment</h1>
          <p className="text-on-surface-variant font-medium mb-8 leading-relaxed">
            Welcome to the Let Mastery review process! Before you begin, we need to understand your current baseline.
            This diagnostic exam helps the AI tailor your learning path.
          </p>
          
          <div className="space-y-4 mb-10">
            <div className="bg-surface-container p-4 rounded-2xl border border-outline-variant/30 flex gap-4 items-start">
               <span className="material-symbols-outlined text-on-surface-variant/40 mt-1">target</span>
               <div>
                 <h3 className="font-bold text-on-surface">Based on your focus</h3>
                 <p className="text-sm text-on-surface-variant/60">
                   {user?.learningMode === 'class_based' 
                     ? "This assessment uses the curriculum assigned by your instructor." 
                     : "This assessment focuses on your selected study area."}
                 </p>
               </div>
            </div>
            <div className="bg-surface-container p-4 rounded-2xl border border-outline-variant/30 flex gap-4 items-start">
               <span className="material-symbols-outlined text-on-surface-variant/40 mt-1">analytics</span>
               <div>
                 <h3 className="font-bold text-on-surface">Personalized Learning Path</h3>
                 <p className="text-sm text-on-surface-variant/60">Your results will not be graded for a score, but will unlock modules based on what you need to study most.</p>
               </div>
            </div>
          </div>

          <button 
            onClick={() => setHasStarted(true)}
            className="w-full bg-primary text-on-primary font-bold py-4 px-6 rounded-2xl shadow-lg hover:-translate-y-0.5 transition-transform uppercase tracking-widest text-sm flex items-center justify-center gap-2"
          >
            Start Assessment <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
     <div className="bg-surface text-on-surface font-body min-h-screen flex flex-col antialiased">
       <header className="px-5 py-4 flex items-center justify-between bg-surface-container-lowest border-b border-outline-variant sticky top-0 z-20">
          <div className="font-bold text-primary">Diagnostic Assessment {isSubmitting && '- Saving...'}</div>
          <div className="text-xs font-bold text-on-surface-variant/40">Question {currentIndex + 1} of {questions.length}</div>
       </header>

       <main className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-5 py-8 opacity-100">
         <div className="mb-8">
            <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
               <div 
                 className="bg-primary h-full transition-all duration-300"
                 style={{ width: `${((currentIndex) / questions.length) * 100}%` }}
               />
            </div>
         </div>

         <div className="text-xl font-extrabold font-headline mb-8 text-on-surface">
           {currentQuestion.stem}
         </div>

         <div className="space-y-4">
           {currentQuestion.options.map(opt => (
             <motion.button
               whileHover={{ scale: 1.01 }}
               whileTap={{ scale: 0.99 }}
               key={opt.id}
               onClick={() => !isSubmitting && handleNext(opt.id)}
               className="w-full text-left p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant shadow-sm hover:border-primary/50 transition-all font-semibold flex items-start gap-4"
             >
                <div className="w-8 h-8 rounded-xl bg-surface-container text-on-surface-variant/60 flex items-center justify-center font-bold">
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
