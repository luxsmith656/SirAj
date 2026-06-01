import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StudentLayout from '../components/StudentLayout';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function shuffleArray(array: any[]) {
    let newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

export default function MistakeRepairDrill() {
  const { user, recordActivity } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get('category');
  const topicId = searchParams.get('topic');
  
  const [drillQueue, setDrillQueue] = useState<any[]>([]);
  const [masteryState, setMasteryState] = useState<Record<string, number>>({});
  const [mistakeDocIds, setMistakeDocIds] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const [isLoading, setIsLoading] = useState(true);
  const [phase, setPhase] = useState<'loading' | 'in_progress' | 'completed'>('loading');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentOptions, setCurrentOptions] = useState<any[]>([]);

  useEffect(() => {
    // Record current activity for streak on start
    recordActivity();
    
    const fetchMistakes = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        let q = query(collection(db, 'mistakeBank'), where('userId', '==', user.uid));
        if (categoryId) q = query(q, where('categoryId', '==', categoryId));
        if (topicId) q = query(q, where('topicId', '==', topicId));
        
        const snap = await getDocs(q);
        const questionsList: any[] = [];
        const mDocIds: Record<string, string> = {};
        const mState: Record<string, number> = {};
        
        for (const mDoc of snap.docs) {
            const data = mDoc.data();
            if (data.questionId) {
                const qSnap = await getDoc(doc(db, 'questions', data.questionId));
                if (qSnap.exists()) {
                    questionsList.push({ id: qSnap.id, ...qSnap.data(), _mistakeCount: data.mistakeCount || 1 });
                    mDocIds[qSnap.id] = mDoc.id;
                    mState[qSnap.id] = data.masteryCount || 0;
                }
            }
        }
        
        setMistakeDocIds(mDocIds);
        setMasteryState(mState);
        setDrillQueue(shuffleArray(questionsList));
        setPhase(questionsList.length > 0 ? 'in_progress' : 'completed');
      } catch (err) {
        console.error("Failed to fetch mistakes", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMistakes();
  }, [user, categoryId, topicId]);
  
  const currentQuestion = drillQueue[currentIndex];

  useEffect(() => {
      if (currentQuestion && currentQuestion.options) {
          // Reconstruct/shuffle options
          setCurrentOptions(shuffleArray(currentQuestion.options));
      }
  }, [currentQuestion]);

  const handleSelectOption = async (optionId: string) => {
    if (showFeedback) return;
    const isCorrect = optionId === currentQuestion.correctOptionId;
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: optionId }));
    setShowFeedback(true);
    
    // Update mastery
    const mistakeDocId = mistakeDocIds[currentQuestion.id];
    if (!mistakeDocId) return;
    
    let newMastery = masteryState[currentQuestion.id] || 0;
    if (isCorrect) {
        newMastery += 1;
    } else {
        newMastery = 0; // Reset on failure
    }
    
    setMasteryState(prev => ({ ...prev, [currentQuestion.id]: newMastery }));
    
    // Save to firestore
    if (newMastery >= 2) {
        // Mastered! Remove from mistake bank
        await deleteDoc(doc(db, 'mistakeBank', mistakeDocId)).catch(console.error);
    } else {
        // Update mastery count
        await updateDoc(doc(db, 'mistakeBank', mistakeDocId), {
            masteryCount: newMastery,
            lastPracticedAt: serverTimestamp()
        }).catch(console.error);
    }
  };

  const handleSelfAssess = async (isCorrect: boolean) => {
    if (showFeedback) return;
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: isCorrect ? 'correct' : 'wrong' }));
    setShowFeedback(true);
    
    // Update mastery
    const mistakeDocId = mistakeDocIds[currentQuestion.id];
    if (!mistakeDocId) return;
    
    let newMastery = masteryState[currentQuestion.id] || 0;
    if (isCorrect) {
        newMastery += 1;
    } else {
        newMastery = 0; // Reset on failure
    }
    
    setMasteryState(prev => ({ ...prev, [currentQuestion.id]: newMastery }));
    
    // Save to firestore
    if (newMastery >= 2) {
        // Mastered! Remove from mistake bank
        await deleteDoc(doc(db, 'mistakeBank', mistakeDocId)).catch(console.error);
    } else {
        // Update mastery count
        await updateDoc(doc(db, 'mistakeBank', mistakeDocId), {
            masteryCount: newMastery,
            lastPracticedAt: serverTimestamp()
        }).catch(console.error);
    }
  };

  const handleNext = () => {
    setShowFeedback(false);
    
    const isCorrect = currentQuestion.options && currentQuestion.options.length > 0 
      ? answers[currentQuestion.id] === currentQuestion.correctOptionId
      : answers[currentQuestion.id] === 'correct';
      
    const currentMastery = masteryState[currentQuestion.id] || 0;
    
    let nextQueue = [...drillQueue];
    if (currentMastery >= 2) {
        // Remove from queue
        nextQueue = nextQueue.filter((_, i) => i !== currentIndex);
    } else {
        // If not mastered, push it to end of queue to cycle
        // Wait, if we keep navigating by index, maybe we shouldn't push to end but just not remove it,
        // so when we wrap around we see it again.
        // Actually, let's keep the queue length constant if possible, or we can push a duplicate to the end.
        // Easiest is rotation: move to next unmastered question.
    }
    
    if (nextQueue.length === 0) {
        setPhase('completed');
        return;
    }
    
    setDrillQueue(nextQueue);
    
    // If we removed the item at currentIndex, the next item is now at currentIndex.
    // However, if we didn't remove it, we want to go forward.
    // A reliable way is just to advance index by 1, wrapping around if needed.
    let nextIndex = currentIndex;
    if (currentMastery < 2) {
        nextIndex = (currentIndex + 1) % nextQueue.length;
    } else {
        // Item was removed, so nextQueue is smaller. 
        // The element at currentIndex is now the *next* element. Wrap around if we were at the end.
        if (currentIndex >= nextQueue.length) {
            nextIndex = 0;
        }
    }
    
    setCurrentIndex(nextIndex);
  };

  if (phase === 'loading') {
    return (
      <StudentLayout title="Repair Drill">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
             <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
             <p className="text-on-surface-variant font-medium">Gathering your focus areas...</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  if (phase === 'completed' || !currentQuestion) {
    return (
      <StudentLayout title="Repair Drill">
        <div className="max-w-2xl mx-auto py-16 text-center">
           <div className="w-24 h-24 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
             <CheckCircle size={48} />
           </div>
           <h2 className="text-3xl font-extrabold font-headline text-on-surface mb-2">Drill Complete!</h2>
           <p className="text-on-surface-variant mb-8 leading-relaxed">
             Great job! You've mastered all the mistakes in this session. Questions answered correctly twice are permanently removed from your mistake bank.
           </p>
           <button 
             onClick={() => navigate('/mistake-bank')}
             className="px-8 py-4 bg-primary text-on-primary rounded-2xl font-bold uppercase tracking-widest text-sm shadow-lg shadow-primary/20"
           >
             Return to Mistake Bank
           </button>
        </div>
      </StudentLayout>
    );
  }

  const hasAnswered = showFeedback;
  const isCorrect = hasAnswered && (currentOptions.length > 0 ? answers[currentQuestion.id] === currentQuestion.correctOptionId : answers[currentQuestion.id] === 'correct');
  const currentMastery = masteryState[currentQuestion.id] || 0;

  return (
    <StudentLayout title="Repair Drill">
      <div className="max-w-3xl mx-auto py-8">
        
        <div className="mb-6 flex justify-between items-center bg-surface-container rounded-2xl p-4 border border-outline-variant/30">
           <div className="text-sm font-bold text-on-surface-variant uppercase tracking-widest">
               Mistake Repair <span className="opacity-50 mx-2">|</span> {drillQueue.length} remaining
           </div>
           <div className="flex items-center gap-2 text-sm font-bold text-primary">
               Mastery Level: 
               <div className="flex gap-1">
                   <div className={`w-3 h-3 rounded-full ${currentMastery >= 1 ? 'bg-emerald-500' : 'bg-outline-variant/40'}`}></div>
                   <div className={`w-3 h-3 rounded-full ${currentMastery >= 2 ? 'bg-emerald-500' : 'bg-outline-variant/40'}`}></div>
               </div>
           </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-3xl p-8 mb-6 shadow-sm">
          <p className="text-lg text-on-surface font-medium leading-relaxed pb-4">
            {currentQuestion.stem}
          </p>
          {currentOptions.length === 0 && !showFeedback && (
            <div className="text-sm text-on-surface-variant uppercase font-bold tracking-widest bg-surface-container inline-block px-3 py-1 rounded-lg">Flashcard Mode</div>
          )}
        </div>
        
        <div className="space-y-3">
          {currentOptions.length > 0 ? currentOptions.map((opt: any) => {
            const isSelected = answers[currentQuestion.id] === opt.id;
            const isOptionCorrect = opt.id === currentQuestion.correctOptionId;
            let btnClass = "border-outline-variant/30 bg-surface-container hover:border-primary hover:bg-primary/5 text-on-surface";
            
            if (showFeedback) {
                if (isOptionCorrect) btnClass = "border-emerald-500 bg-emerald-500/10 text-emerald-700 font-bold";
                else if (isSelected && !isOptionCorrect) btnClass = "border-error bg-error/10 text-error font-bold";
                else btnClass = "border-outline-variant/20 bg-surface-container/50 opacity-50";
            } else if (isSelected) {
                btnClass = "border-primary bg-primary/10 text-primary font-bold";
            }

            return (
              <button
                key={opt.id}
                onClick={() => handleSelectOption(opt.id)}
                disabled={showFeedback}
                className={`w-full text-left p-5 rounded-2xl border-2 transition-all ${btnClass}`}
              >
                {opt.text}
              </button>
            );
          }) : (
            <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto mt-8">
              <button
                onClick={() => handleSelfAssess(true)}
                disabled={showFeedback}
                className="flex-1 py-4 px-6 rounded-2xl font-bold bg-emerald-500/10 text-emerald-600 border-2 border-emerald-500/30 hover:border-emerald-500 hover:bg-emerald-500/20 disabled:opacity-50 transition-all"
              >
                I knew the answer
              </button>
              <button
                onClick={() => handleSelfAssess(false)}
                disabled={showFeedback}
                className="flex-1 py-4 px-6 rounded-2xl font-bold bg-error/10 text-error border-2 border-error/30 hover:border-error hover:bg-error/20 disabled:opacity-50 transition-all"
              >
                I missed it
              </button>
            </div>
          )}
        </div>

        <AnimatePresence>
          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className={`mt-6 p-6 rounded-3xl border ${isCorrect ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-error/30 bg-error/5'}`}
            >
              <div className="flex justify-between items-start">
                  <div>
                      <h4 className={`text-lg font-bold font-headline mb-2 flex items-center gap-2 ${isCorrect ? 'text-emerald-600' : 'text-error'}`}>
                        {isCorrect ? <CheckCircle size={24} /> : <XCircle size={24} />}
                        {isCorrect ? 'Awesome! Keep it up.' : 'Not quite right. Try again next time.'}
                      </h4>
                      <p className="text-on-surface-variant font-medium leading-relaxed">
                        {currentQuestion.explanation || currentQuestion.rationalization || "Review the material carefully next time."}
                      </p>
                  </div>
                  
                  <button
                    onClick={handleNext}
                    className="flex-shrink-0 bg-primary text-on-primary px-6 py-3 rounded-xl font-bold text-sm tracking-widest uppercase flex items-center gap-2 shadow-lg shadow-primary/20"
                  >
                    Next <ArrowRight size={18} />
                  </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </StudentLayout>
  );
}
