import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StudentLayout from '../components/StudentLayout';
import { OfflineData } from '../lib/offline/offlineData';
import { ArrowRight, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function PracticeMode() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get('category');
  
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [phase, setPhase] = useState<'loading' | 'in_progress' | 'completed'>('loading');

  useEffect(() => {
    const loadQuestions = async () => {
      setIsLoading(true);
      try {
        const selectedCount = 20; // 20 questions for practice
        const qs = await OfflineData.getRandomQuestions(categoryId, selectedCount);
        setQuestions(qs);
        setPhase('in_progress');
      } catch (err) {
        console.error("Failed to load questions offline", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadQuestions();
  }, [categoryId]);

  const currentQuestion = questions[currentIndex];

  const handleSelectOption = (optionId: string) => {
    if (showFeedback) return;
    setAnswers(prev => ({ ...prev, [currentQuestion?.id]: optionId }));
    setShowFeedback(true);
  };

  const handleNext = () => {
    setShowFeedback(false);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      finishPractice();
    }
  };

  const finishPractice = async () => {
    setPhase('completed');
    if (!user) return;
    
    // Calculate Score
    let correctCount = 0;
    questions.forEach(q => {
        if (answers[q.id] === q.correctOptionId) {
            correctCount++;
        } else if (answers[q.id]) {
            // Mistake bank storage
            if (navigator.onLine) {
                setDoc(doc(db, 'mistakeBank', `${user.uid}_${q.id}`), {
                  userId: user.uid,
                  questionId: q.id,
                  stem: q.stem || '',
                  options: q.options || [],
                  explanation: q.explanation || q.rationalization || '',
                  selectedOptionId: answers[q.id],
                  correctOptionId: q.correctOptionId,
                  timesMissed: 1,
                  lastMissedAt: serverTimestamp(),
                }, { merge: true }).catch(console.warn);
            }
        }
    });
    
    const percentage = Math.round((correctCount / questions.length) * 100);
    const attempt = {
      userId: user.uid,
      type: 'practice',
      categoryId,
      scorePercent: percentage,
      correctCount,
      totalQuestions: questions.length,
      answers,
      submittedAtMillis: Date.now()
    };
    
    await OfflineData.saveQuizAttempt(attempt);
  };

  if (phase === 'loading' || isLoading) {
    return (
      <StudentLayout title="Practice Mode">
         <div className="p-8 text-center bg-surface-container rounded-xl animate-pulse">Loading Practice Drill...</div>
      </StudentLayout>
    );
  }
  
  if (phase === 'completed') {
    let correctCount = 0;
    questions.forEach(q => {
        if (answers[q.id] === q.correctOptionId) correctCount++;
    });
    const percentage = Math.round((correctCount / questions.length) * 100);
    return (
        <StudentLayout title="Practice Complete">
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="bg-surface-container-lowest border border-outline-variant p-8 rounded-2xl text-center">
                    <h2 className="text-3xl font-extrabold text-on-surface">Practice Finished!</h2>
                    <p className="mt-4 text-on-surface-variant">You scored {correctCount} out of {questions.length} ({percentage}%)</p>
                    <button onClick={() => navigate('/student')} className="mt-6 bg-primary text-on-primary px-6 py-3 rounded-xl font-bold">Return to Dashboard</button>
                </div>
            </div>
        </StudentLayout>
    )
  }

  const selectedAnswerId = answers[currentQuestion?.id];
  const isCorrect = selectedAnswerId === currentQuestion?.correctOptionId;

  return (
    <StudentLayout title="Practice Mode">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-black uppercase text-on-surface-variant">
            Question {currentIndex + 1} of {questions.length}
          </p>
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">Untimed</span>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm">
          <p className="text-lg font-bold text-on-surface mb-6 leading-relaxed">
            {currentQuestion?.stem}
          </p>

          <div className="space-y-3">
            {currentQuestion?.options?.map((opt: any) => {
              const isSelected = selectedAnswerId === opt.id;
              const isActualCorrect = currentQuestion.correctOptionId === opt.id;
              
              let styleClass = 'border-outline-variant/30 hover:border-primary/50 hover:bg-surface-container/50';
              if (showFeedback) {
                  if (isActualCorrect) {
                      styleClass = 'border-green-500 bg-green-500/10 text-green-700'; // Correct choice shown
                  } else if (isSelected && !isActualCorrect) {
                      styleClass = 'border-red-500 bg-red-500/10 text-red-700'; // Wrong choice selected
                  } else {
                      styleClass = 'border-outline-variant/20 opacity-50 cursor-not-allowed'; // Default when feedback shown
                  }
              } else if (isSelected) {
                  styleClass = 'border-primary bg-primary/10 text-primary';
              }

              return (
                <button
                  key={opt.id}
                  disabled={showFeedback}
                  onClick={() => handleSelectOption(opt.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${styleClass} flex items-center justify-between`}
                >
                  <span className="font-medium text-sm">{opt.text}</span>
                  {showFeedback && isActualCorrect && <CheckCircle size={20} className="text-green-600 shrink-0" />}
                  {showFeedback && isSelected && !isActualCorrect && <XCircle size={20} className="text-red-600 shrink-0" />}
                </button>
              );
            })}
          </div>
          
          {showFeedback && (
              <div className="mt-6 p-4 rounded-xl bg-surface-container border border-outline-variant">
                  <h4 className="font-extrabold text-sm mb-2 text-on-surface">Explanation</h4>
                  <p className="text-sm text-on-surface-variant">
                      {currentQuestion?.explanation || currentQuestion?.rationalization || "No explanation provided for this question."}
                  </p>
              </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
            <button
              onClick={handleNext}
              disabled={!showFeedback}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${showFeedback ? 'bg-primary text-on-primary hover:bg-primary/90' : 'bg-surface-container text-on-surface-variant opacity-50 cursor-not-allowed'}`}
            >
              {currentIndex < questions.length - 1 ? 'Next Question' : 'Finish Practice'}
              <ArrowRight size={18} />
            </button>
        </div>
      </div>
    </StudentLayout>
  );
}
