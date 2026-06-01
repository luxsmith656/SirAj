import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StudentLayout from '../components/StudentLayout';
import { OfflineData } from '../lib/offline/offlineData';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Play,
  RotateCcw,
  BookOpen,
  ClipboardCheck,
  Target,
  Sparkles,
  Award
} from 'lucide-react';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import ExamSimulation from './ExamSimulation';

export default function PracticeMode() {
  const { user, recordActivity } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const mode = searchParams.get('mode'); // 'practice' | 'exam'
  const categoryParam = searchParams.get('category');

  // Selection states
  const [selectedCategory, setSelectedCategory] = useState<string>('gened');
  const [selectedMajor, setSelectedMajor] = useState<string>('all');
  const [questionCount, setQuestionCount] = useState<number>(20);

  useEffect(() => {
    recordActivity();
  }, [recordActivity]);

  useEffect(() => {
    if (user) {
      if (user.reviewTrack === 'secondary' || user.reviewTrack === 'specialization') {
        setSelectedCategory('major');
      } else {
        setSelectedCategory('gened');
      }
      if (user.specialization) {
        setSelectedMajor(String(user.specialization).toLowerCase());
      }
    }
  }, [user]);

  // Drill states
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [drillPhase, setDrillPhase] = useState<'setup' | 'in_progress' | 'completed'>('setup');

  // Trigger loading drill questions
  const startDrill = async () => {
    setIsLoading(true);
    try {
      // Determine correct indexedDB categoryId
      let targetCategoryId = selectedCategory;
      if (selectedCategory === 'major') {
        targetCategoryId = 'major';
      }
      
      const qs = await OfflineData.getRandomQuestions(targetCategoryId, questionCount);
      setQuestions(qs);
      setCurrentIndex(0);
      setAnswers({});
      setShowFeedback(false);
      setDrillPhase('in_progress');
    } catch (err) {
      console.error("Failed to load practice questions", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    setShowFeedback(false);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      finishPractice();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && showFeedback) {
        handleNext();
      } else if (e.key === 'ArrowRight' && showFeedback) {
        handleNext();
      } else if (e.key === 'ArrowLeft' && !showFeedback && currentIndex > 0) {
        // Maybe implement previous? For now, just focus.
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showFeedback, handleNext, currentIndex]);

  const handleSelectOption = (optionId: string) => {
    if (showFeedback) return;
    const currentQ = questions[currentIndex];
    setAnswers(prev => ({ ...prev, [currentQ?.id]: optionId }));
    setShowFeedback(true);
  };

  const finishPractice = async () => {
    setDrillPhase('completed');
    if (!user) return;
    
    // Track mistake bank
    let correctCount = 0;
    questions.forEach(q => {
      const isFlashcardCorrect = (!q.options || q.options.length === 0) && answers[q.id] === 'correct';
      if (answers[q.id] === q.correctOptionId || isFlashcardCorrect) {
        correctCount++;
      } else if (answers[q.id]) {
        if (navigator.onLine) {
          setDoc(doc(db, 'mistakeBank', `${user.uid}_${q.id}`), {
            userId: user.uid,
            questionId: q.id,
            stem: q.stem || '',
            options: q.options || [],
            explanation: q.explanation || q.rationalization || '',
            selectedOptionId: answers[q.id],
            correctOptionId: q.correctOptionId || 'correct', // for flashcard it should be correct
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
      categoryId: selectedCategory === 'major' ? `major_${selectedMajor}` : selectedCategory,
      scorePercent: percentage,
      correctCount,
      totalQuestions: questions.length,
      answers,
      submittedAtMillis: Date.now()
    };
    
    await OfflineData.saveQuizAttempt(attempt);
    if (recordActivity) {
      await recordActivity(true);
    }
  };

  // Switch modes easily via updates to search params
  const switchToMode = (targetMode: 'practice' | 'exam') => {
    setQuestions([]);
    setDrillPhase('setup');
    if (targetMode === 'exam') {
      setSearchParams({ mode: 'exam', type: 'mock' });
    } else {
      setSearchParams({ mode: 'practice' });
    }
  };

  // Render the unified selection hub if mode is not set
  if (!mode) {
    return (
      <StudentLayout title="Practice & Evaluation">
        <div className="max-w-4xl mx-auto py-6">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-extrabold font-headline text-on-surface tracking-tight">Practice & Evaluation</h1>
            <p className="mt-2 text-on-surface-variant/80 text-sm max-w-xl mx-auto leading-relaxed">
              Accelerate your Licensure Examination for Teachers (LET) preparation. Choose your pathway below to begin review.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: Practice Mode */}
            <div className="bg-surface-container-lowest border border-outline-variant/50 p-6 rounded-2xl shadow-sm flex flex-col justify-between hover:border-primary/30 transition-all">
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center mb-5">
                  <Target size={24} />
                </div>
                <h3 className="text-xl font-bold text-on-surface font-headline">Untimed Practice Drills</h3>
                <p className="mt-2 text-xs text-on-surface-variant/70 font-semibold uppercase tracking-widest">Mastery & Feedback</p>
                <p className="mt-3 text-sm text-on-surface-variant leading-relaxed">
                  Practice subject-specific questions with immediate answer validation and comprehensive rationalizations. Perfect for reinforcing knowledge of weak topics.
                </p>
              </div>
              <button
                onClick={() => switchToMode('practice')}
                className="mt-8 w-full bg-primary text-on-primary font-bold px-5 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors"
                id="practice-mode-select"
              >
                Start Practice Mode
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Card 2: Exam Simulator */}
            <div className="bg-surface-container-lowest border border-outline-variant/50 p-6 rounded-2xl shadow-sm flex flex-col justify-between hover:border-primary/30 transition-all">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-700 flex items-center justify-center mb-5">
                  <Sparkles size={24} />
                </div>
                <h3 className="text-xl font-bold text-on-surface font-headline">Board Exam Simulator</h3>
                <p className="mt-2 text-xs text-on-surface-variant/70 font-semibold uppercase tracking-widest">Realistic Exam Pressure</p>
                <p className="mt-3 text-sm text-on-surface-variant leading-relaxed">
                  Take realistic full-length LET simulations under timed, anti-cheat guidelines. Get detailed analytics breakdown on your performance.
                </p>
              </div>
              <button
                onClick={() => switchToMode('exam')}
                className="mt-8 w-full bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface font-bold px-5 py-3 rounded-xl flex items-center justify-center gap-2 border border-outline-variant/30"
                id="exam-simulator-select"
              >
                Launch Exam Simulator
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </StudentLayout>
    );
  }

  // Render Exam Simulation inside when selected
  if (mode === 'exam') {
    return <ExamSimulation />;
  }

  // --- PRACTICE MODE FLOWS ---

  // Phase A: Setup screen for Practice Drills
  if (drillPhase === 'setup') {
    return (
      <StudentLayout title="Practice Drill Setup">
        <div className="max-w-2xl mx-auto py-3 space-y-6">
          {/* Header Switcher */}
          <div className="bg-surface-container/40 rounded-2xl p-4 border border-outline-variant/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div>
              <p className="text-xs font-bold text-on-surface-variant/70">Ready for full simulations under actual LET conditions?</p>
            </div>
            <button
              onClick={() => switchToMode('exam')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 hover:bg-primary/10 border border-primary/20 text-primary rounded-xl font-bold text-xs tracking-wide transition-all"
            >
              Switch to Exam Simulator
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-6 shadow-sm space-y-6">
            <div>
              <p className="text-xs font-black uppercase text-primary tracking-widest">Step 1</p>
              <h2 className="text-xl font-extrabold text-on-surface font-headline mt-1">Practice Track Configured</h2>
              <p className="text-xs text-on-surface-variant/80 mt-1">Focusing your untimed practice sessions to your primary review track.</p>
            </div>

            {user?.reviewTrack ? (
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 space-y-3 animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                    <Target size={20} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-on-surface text-sm">Onboarding Track Preferences Active</h3>
                    <p className="text-xs text-on-surface-variant/70">Your drills have been pre-set to maximize relevance.</p>
                  </div>
                </div>

                <div className="p-4 bg-surface-container-lowest border border-outline-variant/30 rounded-xl space-y-1">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-on-surface-variant/60">Registered Domain:</span>
                    <span className="text-primary uppercase tracking-wider">
                      {user.reviewTrack === 'elementary' ? 'Elementary LET' : 
                       user.reviewTrack === 'secondary' || user.reviewTrack === 'specialization' ? 'Secondary LET' :
                       user.reviewTrack === 'gened' ? 'GenEd Only' :
                       user.reviewTrack === 'profed' ? 'ProfEd Only' : user.reviewTrack}
                    </span>
                  </div>
                  
                  {selectedCategory === 'major' && (
                    <div className="flex justify-between items-center text-xs font-bold pt-1 border-t border-outline-variant/10">
                      <span className="text-on-surface-variant/60">Specialist Major:</span>
                      <span className="text-primary font-bold">
                        {[
                          { id: 'english', title: 'BSEd English' },
                          { id: 'math', title: 'BSEd Mathematics' },
                          { id: 'science', title: 'BSEd General Science' },
                          { id: 'socsci', title: 'BSEd Social Studies' },
                          { id: 'filipino', title: 'BSEd Filipino' },
                          { id: 'mapeh', title: 'BSEd MAPEH' },
                          { id: 'tle', title: 'BSEd TLE' }
                        ].find(m => m.id === String(user.specialization).toLowerCase())?.title || `BSEd ${user.specialization || 'Social Studies'}`}
                      </span>
                    </div>
                  )}

                  {user.reviewTrack === 'elementary' && (
                    <div className="flex justify-between items-center text-xs font-bold pt-1 border-t border-outline-variant/10">
                      <span className="text-on-surface-variant/60">Elementary Components:</span>
                      <span className="text-[#1b366a]">General Education + Professional Education</span>
                    </div>
                  )}
                </div>

                {user.reviewTrack === 'elementary' && (
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-xs font-bold text-on-surface-variant/70">Practice target category:</span>
                    <div className="flex gap-1.5">
                      {['gened', 'profed'].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setSelectedCategory(cat)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all ${
                            selectedCategory === cat
                              ? 'bg-primary text-on-primary border-primary'
                              : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant hover:bg-surface-container'
                          }`}
                        >
                          {cat === 'gened' ? 'General Ed' : 'Prof Ed'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { id: 'gened', title: 'General Education', body: 'English, Filipino, Math, Social Science, ICT, Rizal' },
                    { id: 'profed', title: 'Professional Education', body: 'Learning theories, development, teaching principles, ethics' },
                    { id: 'major', title: 'Specialist Major (BSEd)', body: 'Secondary Education major field drills' }
                  ]
                  .filter(cat => user?.reviewTrack !== 'elementary' || cat.id !== 'major')
                  .map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`p-4 rounded-xl text-left border flex flex-col justify-between transition-all ${
                        selectedCategory === category.id
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-outline-variant/40 bg-surface-container/30 hover:border-outline-variant/70'
                      }`}
                    >
                      <span className="font-bold text-sm block mb-1 text-on-surface">{category.title}</span>
                      <span className="text-[11px] leading-snug line-clamp-3 text-on-surface-variant/70">{category.body}</span>
                    </button>
                  ))}
                </div>

                {/* Specializations list if BSEd (Secondary) major option is chosen */}
                {selectedCategory === 'major' && (
                  <div className="bg-surface-container/35 rounded-2xl p-5 border border-outline-variant/20 space-y-4 animate-fade-in">
                    {user?.specialization ? (
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
                          <Target size={20} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-on-surface">Your Onboarding Specialization is Used</h4>
                          <p className="text-xs text-on-surface-variant/70 mt-1">
                            Consistent with your onboarding setup, your specialist major drills are pre-configured for: <strong className="text-primary font-bold">
                              {[
                                { id: 'english', title: 'BSEd English' },
                                { id: 'math', title: 'BSEd Mathematics' },
                                { id: 'science', title: 'BSEd General Science' },
                                { id: 'socsci', title: 'BSEd Social Studies' },
                                { id: 'filipino', title: 'BSEd Filipino' },
                                { id: 'mapeh', title: 'BSEd MAPEH' },
                                { id: 'tle', title: 'BSEd TLE' }
                              ].find(m => m.id === String(user.specialization).toLowerCase())?.title || `BSEd ${user.specialization}`}
                            </strong>.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div>
                          <h4 className="text-sm font-bold text-on-surface">Select Specialization / Major Field:</h4>
                          <p className="text-xs text-on-surface-variant/70">Under Secondary LET, choose your specific field or test across all majors simultaneously.</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {[
                            { id: 'all', title: 'ALL Specializations / Comprehensive Major Mix' },
                            { id: 'english', title: 'BSEd English' },
                            { id: 'math', title: 'BSEd Mathematics' },
                            { id: 'science', title: 'BSEd General Science' },
                            { id: 'socsci', title: 'BSEd Social Studies' },
                            { id: 'filipino', title: 'BSEd Filipino' },
                            { id: 'mapeh', title: 'BSEd MAPEH' },
                            { id: 'tle', title: 'BSEd TLE' }
                          ].map((major) => (
                            <button
                              key={major.id}
                              onClick={() => setSelectedMajor(major.id)}
                              className={`px-4 py-3 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between ${
                                selectedMajor === major.id
                                  ? 'border-primary bg-primary text-on-primary'
                                  : 'border-outline-variant/30 bg-surface-container-lowest text-on-surface hover:bg-surface-container/60'
                              }`}
                            >
                              <span>{major.title}</span>
                              {selectedMajor === major.id && <CheckCircle size={14} />}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </>
            )}

            <div className="border-t border-outline-variant/30 pt-6">
              <div>
                <p className="text-xs font-black uppercase text-primary tracking-widest">Step 2</p>
                <h3 className="text-base font-bold text-on-surface font-headline mt-1">Select Question Volume</h3>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-3">
                {[
                  { value: 20, label: '20 Quick Items' },
                  { value: 50, label: '50 Standard Items' },
                  { value: 100, label: '100 Marathon Items' },
                ].map((vol) => (
                  <button
                    key={vol.value}
                    onClick={() => setQuestionCount(vol.value)}
                    className={`py-3 rounded-xl border text-xs font-bold transition-all text-center ${
                      questionCount === vol.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-outline-variant/40 bg-surface-container/10 hover:border-outline-variant/70 text-on-surface'
                    }`}
                  >
                    {vol.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={startDrill}
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary-dark transition-colors text-on-primary py-4 rounded-xl font-bold flex items-center justify-center gap-2 text-sm shadow-md"
            >
              {isLoading ? (
                <span>Loading drill questions...</span>
              ) : (
                <>
                  <Play size={16} />
                  Launch Practice Drill
                </>
              )}
            </button>
          </div>
        </div>
      </StudentLayout>
    );
  }

  // Phase B: Completed screen inside Practice mode
  if (drillPhase === 'completed') {
    let correctCount = 0;
    questions.forEach(q => {
      const isFlashcardCorrect = (!q.options || q.options.length === 0) && answers[q.id] === 'correct';
      if (answers[q.id] === q.correctOptionId || isFlashcardCorrect) correctCount++;
    });
    const percentage = Math.round((correctCount / questions.length) * 100);

    return (
      <StudentLayout title="Practice Drill Complete">
        <div className="max-w-xl mx-auto py-6 space-y-6">
          <div className="bg-surface-container-lowest border border-outline-variant/50 p-8 rounded-3xl text-center space-y-6 shadow-sm">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 text-green-700 flex items-center justify-center">
              <Award size={32} />
            </div>

            <div>
              <h2 className="text-3xl font-black font-headline text-on-surface">Drill Finished!</h2>
              <p className="mt-2 text-sm text-on-surface-variant">Review your total score and performance breakdown.</p>
            </div>

            <div className="bg-surface-container p-5 rounded-2xl grid grid-cols-2 gap-4">
              <div className="border-r border-outline-variant/30 text-center">
                <p className="text-[10px] uppercase font-black tracking-widest text-on-surface-variant/60">Correct Answers</p>
                <p className="mt-1 font-headline text-3xl font-black text-on-surface">{correctCount} / {questions.length}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] uppercase font-black tracking-widest text-on-surface-variant/60">Score Percentage</p>
                <p className="mt-1 font-headline text-3xl font-black text-on-surface">{percentage}%</p>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-4">
              <button
                onClick={() => setDrillPhase('setup')}
                className="w-full bg-primary text-on-primary font-bold py-3 rounded-xl hover:bg-primary-dark transition-colors"
              >
                Practice New Subject
              </button>
              <button
                onClick={() => startDrill()}
                className="w-full bg-surface-container text-on-surface border border-outline-variant hover:bg-surface-container-high font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw size={15} />
                Retake Same Setup
              </button>
              <button
                onClick={() => navigate('/student/dashboard')}
                className="w-full text-xs font-black uppercase tracking-widest text-on-surface-variant/60 hover:text-on-surface py-2"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      </StudentLayout>
    );
  }

  // Phase C: Practice Session in Progress
  const currentQuestion = questions[currentIndex];
  const selectedAnswerId = answers[currentQuestion?.id];
  const isCorrect = selectedAnswerId === currentQuestion?.correctOptionId;

  return (
    <StudentLayout title="Practice Mode">
      <div className="max-w-3xl mx-auto py-1 space-y-6">
        {/* Header Ribbon Switcher */}
        <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (window.confirm("Abandon current practice drill? Progress won't be recorded.")) {
                  setDrillPhase('setup');
                }
              }}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-surface-container/60 border border-outline-variant/20 hover:bg-surface-container text-on-surface"
              title="Practice setup"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <p className="text-[11px] uppercase font-black tracking-widest text-primary leading-none">Practice Session</p>
              <p className="text-xs font-bold text-on-surface-variant/70 mt-1">Subject: {selectedCategory === 'major' ? `BSEd Specialization` : selectedCategory === 'profed' ? 'Professional Ed' : 'General Ed'}</p>
            </div>
          </div>
          
          <button
            onClick={() => {
              if (window.confirm("Switching to Exam Simulation will close current practice session. Continue?")) {
                switchToMode('exam');
              }
            }}
            className="hidden sm:inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-primary border border-primary/20 bg-primary/5 hover:bg-primary/10 px-3.5 py-2 rounded-xl transition-all"
          >
            Switch to Exam Simulator
          </button>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs font-black uppercase text-on-surface-variant tracking-wider">
            Item {currentIndex + 1} of {questions.length}
          </p>
          <span className="bg-amber-500/10 text-amber-800 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
            Untimed Drill
          </span>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-6 shadow-sm">
          <p className="text-lg font-bold text-on-surface mb-6 leading-relaxed">
            {currentQuestion?.stem}
          </p>

          <div className="space-y-3">
            {currentQuestion?.options && currentQuestion.options.length > 0 ? currentQuestion.options.map((opt: any) => {
              const isSelected = selectedAnswerId === opt.id;
              const isActualCorrect = currentQuestion.correctOptionId === opt.id;
              
              let styleClass = 'border-outline-variant/40 hover:border-primary/50 hover:bg-surface-container/50';
              if (showFeedback) {
                if (isActualCorrect) {
                  styleClass = 'border-green-500 bg-green-500/10 text-green-700'; // Correct option
                } else if (isSelected && !isActualCorrect) {
                  styleClass = 'border-red-500 bg-red-500/10 text-red-700'; // Selected wrong option
                } else {
                  styleClass = 'border-outline-variant/20 opacity-40 cursor-not-allowed'; // Fallback
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
                  <span className="font-semibold text-sm">{opt.text}</span>
                  {showFeedback && isActualCorrect && <CheckCircle size={20} className="text-green-600 shrink-0" />}
                  {showFeedback && isSelected && !isActualCorrect && <XCircle size={20} className="text-red-600 shrink-0" />}
                </button>
              );
            }) : (
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <button
                  onClick={() => {
                    handleSelectOption('correct');
                  }}
                  disabled={showFeedback}
                  className="flex-1 py-4 px-6 rounded-2xl font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 hover:bg-emerald-500/20 disabled:opacity-50 transition-all text-center"
                >
                  I knew the answer
                </button>
                <button
                  onClick={() => {
                     handleSelectOption('wrong');
                  }}
                  disabled={showFeedback}
                  className="flex-1 py-4 px-6 rounded-2xl font-bold bg-red-500/10 text-red-600 border border-red-500/30 hover:bg-red-500/20 disabled:opacity-50 transition-all text-center"
                >
                  I missed it
                </button>
              </div>
            )}
          </div>
          
          {showFeedback && (
            <div className="mt-6 p-4 rounded-xl bg-surface-container-lowest/80 border border-outline-variant/30">
              <h4 className="font-extrabold text-xs uppercase tracking-wider mb-2 text-primary">Rationalization</h4>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                {currentQuestion?.explanation || currentQuestion?.rationalization || "Comprehensive explanation and rationalization analysis are available for this question item."}
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <button
            onClick={handleNext}
            disabled={!showFeedback}
            className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold transition-all shadow-sm ${
              showFeedback 
                ? 'bg-primary text-on-primary hover:bg-primary/95' 
                : 'bg-surface-container text-on-surface-variant opacity-40 cursor-not-allowed'
            }`}
          >
            {currentIndex < questions.length - 1 ? 'Next Question' : 'Finish Practice'}
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </StudentLayout>
  );
}
