import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { ArrowLeft, ArrowRight, BookOpenCheck, GraduationCap, School, ShieldCheck, UserRound, Smartphone, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';

type ReviewMode = 'class_based' | 'self_review';
type ReviewTrack = 'elementary' | 'secondary' | 'specialization' | 'gened' | 'profed';

const trackOptions: { id: ReviewTrack; title: string; body: string }[] = [
  {
    id: 'elementary',
    title: 'Elementary LET',
    body: 'General Education and Professional Education review without a secondary major.',
  },
  {
    id: 'secondary',
    title: 'Secondary LET',
    body: 'General Education, Professional Education, and your selected major or specialization.',
  },
  {
    id: 'gened',
    title: 'GenEd Only',
    body: 'Only General Education modules.',
  },
  {
    id: 'profed',
    title: 'ProfEd Only',
    body: 'Only Professional Education modules.',
  },
];

export default function Onboarding() {
  const { user, refreshUser, signOut } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [reviewMode, setReviewMode] = useState<ReviewMode>((user?.learningMode as ReviewMode) || 'self_review');
  const [classCode, setClassCode] = useState('');
  const [reviewTrack, setReviewTrack] = useState<ReviewTrack>((user?.reviewTrack as ReviewTrack) || 'elementary');
  const [specialization, setSpecialization] = useState(user?.specialization || '');
  const [specializationSearch, setSpecializationSearch] = useState('');
  const [targetExamDate, setTargetExamDate] = useState(user?.targetExamDate || '');
  const [diagnosticChoice, setDiagnosticChoice] = useState<'now' | 'later'>('now');
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // For PWA and APK installation step
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [downloadStarted, setDownloadStarted] = useState(false);

  useEffect(() => {
    const handlePrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handlePrompt);
    return () => window.removeEventListener('beforeinstallprompt', handlePrompt);
  }, []);

  const handlePwaInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      alert("Installation is fully supported on your mobile device browser! Simply tap your browser's options menu (triple dots or share icon) and select 'Add to Home Screen' or 'Install App'.");
    }
  };

  const handleDownloadApk = () => {
    setDownloadStarted(true);
    // Trigger simulated APK direct download
    const link = document.createElement('a');
    link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent('LET Mastery Pro Capacitor APK direct installer package placeholder.');
    link.download = 'letmastery.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!user) return null;

  const canContinueStep1 = fullName.trim().length > 1;
  const canContinueStep2 = reviewTrack !== 'secondary' && reviewTrack !== 'specialization'
    ? true
    : specialization.trim().length > 1;

  const completeSetup = async () => {
    if (!agreed || !canContinueStep1 || !canContinueStep2) return;
    setIsSubmitting(true);
    try {
      const normalizedClassCode = classCode.trim().toUpperCase();
      await updateDoc(doc(db, 'users', user.uid), {
        fullName: fullName.trim(),
        onboarded: true,
        agreementAccepted: true,
        learningMode: reviewMode,
        reviewTrack,
        selectedFocus: reviewTrack === 'secondary' || reviewTrack === 'specialization' ? 'major' : 'full_let_review',
        specialization: specialization.trim(),
        targetExamDate: targetExamDate || null,
        diagnosticCompleted: false,
        diagnosticSkipped: diagnosticChoice === 'later',
        onboardingStep: 4,
        reviewSetupCompletedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      await refreshUser();

      if (reviewMode === 'class_based') {
        navigate(normalizedClassCode ? `/join/${encodeURIComponent(normalizedClassCode)}` : '/join-class', { replace: true });
        return;
      }

      navigate(diagnosticChoice === 'now' ? '/diagnostic' : '/student/dashboard', { replace: true });
    } catch (error) {
      console.error('Onboarding failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { id: 1, label: 'Mode' },
    { id: 2, label: 'Track' },
    { id: 3, label: 'Diagnostic' },
    { id: 4, label: 'Install' },
  ];

  return (
    <div className="min-h-screen bg-[#f0f2f5] text-slate-900 font-body flex items-center justify-center px-4 py-8">
      <button
        onClick={async () => {
          await signOut();
          navigate('/sign-in');
        }}
        className="fixed top-5 right-5 rounded-full bg-white/80 border border-slate-200 px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-900"
      >
        Change account
      </button>

      <main className="w-full max-w-3xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1b366a] text-white shadow-lg">
            <BookOpenCheck size={28} />
          </div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-700">LET Review Setup</p>
          <h1 className="mt-2 text-3xl font-black font-headline">Prepare your review simulator</h1>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Self-study is the base experience. A professor class adds private materials, deadlines, feedback, and monitoring on top.
          </p>
        </div>

        <div className="mb-6 flex justify-center gap-2">
          {steps.map((item) => (
            <div key={item.id} className={`h-2 rounded-full transition-all ${step >= item.id ? 'w-16 bg-[#1b366a]' : 'w-6 bg-white border border-slate-200'}`} />
          ))}
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-xl shadow-slate-900/5">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-blue-700">Step 1</p>
                <h2 className="mt-1 text-2xl font-black font-headline">How are you reviewing?</h2>
                <p className="mt-2 text-sm font-medium text-slate-500">Choose the path you will use first. You can still join a class later from the student top bar.</p>
              </div>

              <label className="block">
                <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">Full name</span>
                <input
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-bold outline-none focus:border-blue-300 focus:bg-white"
                  placeholder="Enter your full name"
                />
              </label>

              <div className="grid gap-3 md:grid-cols-2">
                <button
                  onClick={() => setReviewMode('class_based')}
                  className={`rounded-2xl border p-5 text-left transition-all ${reviewMode === 'class_based' ? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-slate-50 hover:border-blue-200'}`}
                >
                  <School className="mb-4 text-blue-700" size={28} />
                  <h3 className="font-black">Yes, I have a class code</h3>
                  <p className="mt-1 text-sm font-medium text-slate-500">Join a professor-created LET review class after setup.</p>
                </button>
                <button
                  onClick={() => setReviewMode('self_review')}
                  className={`rounded-2xl border p-5 text-left transition-all ${reviewMode === 'self_review' ? 'border-emerald-600 bg-emerald-50' : 'border-slate-200 bg-slate-50 hover:border-emerald-200'}`}
                >
                  <UserRound className="mb-4 text-emerald-700" size={28} />
                  <h3 className="font-black">No, I am reviewing on my own</h3>
                  <p className="mt-1 text-sm font-medium text-slate-500">Use the public AI-powered LET review simulator.</p>
                </button>
              </div>

              {reviewMode === 'class_based' && (
                <label className="block rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
                  <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-blue-700">Class code, optional</span>
                  <input
                    value={classCode}
                    onChange={(event) => setClassCode(event.target.value.toUpperCase())}
                    className="w-full rounded-xl border border-blue-100 bg-white px-4 py-3 font-mono text-sm font-black uppercase outline-none focus:border-blue-400"
                    placeholder="LM-ABC123"
                  />
                  <p className="mt-2 text-xs font-bold text-blue-700/70">You can leave this blank and enter the code on the join page.</p>
                </label>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-blue-700">Step 2</p>
                <h2 className="mt-1 text-2xl font-black font-headline">Select your LET track</h2>
                <p className="mt-2 text-sm font-medium text-slate-500">The dashboard and reviewer categories will follow this track instead of showing every subject at once.</p>
              </div>

              <div className="grid gap-3">
                {trackOptions.map((track) => (
                  <button
                    key={track.id}
                    onClick={() => setReviewTrack(track.id)}
                    className={`flex gap-4 rounded-2xl border p-5 text-left transition-all ${reviewTrack === track.id ? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-slate-50 hover:border-blue-200'}`}
                  >
                    <GraduationCap className="mt-1 shrink-0 text-blue-700" size={24} />
                    <div>
                      <h3 className="font-black">{track.title}</h3>
                      <p className="mt-1 text-sm font-medium text-slate-500">{track.body}</p>
                    </div>
                  </button>
                ))}
              </div>

              {(reviewTrack === 'secondary' || reviewTrack === 'specialization') && (
                <div className="space-y-4">
                  <div className="block">
                    <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">Search and Pick your Specialization / Major</span>
                    <input
                      type="text"
                      value={specializationSearch}
                      onChange={(event) => setSpecializationSearch(event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-bold outline-none focus:border-blue-300 focus:bg-white"
                      placeholder="🔍 Type to search specializations (e.g., english, math, science...)"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                    {[
                      { id: 'English', title: 'BSEd English', desc: 'Grammar, Linguistics, Literature, & Teaching' },
                      { id: 'Mathematics', title: 'BSEd Mathematics', desc: 'Algebra, Geometry, Trigonometry, & Calculus' },
                      { id: 'Science', title: 'BSEd General Science', desc: 'Biology, Chemistry, Physics, & Earth Science' },
                      { id: 'Social Studies', title: 'BSEd Social Studies', desc: 'Philippine & World History, Economics' },
                      { id: 'Filipino', title: 'BSEd Filipino', desc: 'Panitikan at Wika' },
                      { id: 'MAPEH', title: 'BSEd MAPEH', desc: 'Music, Arts, Physical Education, & Health' },
                      { id: 'TLE', title: 'BSEd TLE', desc: 'ICT, Entrepreneurship, & Home Economics' }
                    ]
                      .filter(item => 
                        item.title.toLowerCase().includes(specializationSearch.toLowerCase()) || 
                        item.desc.toLowerCase().includes(specializationSearch.toLowerCase()) ||
                        item.id.toLowerCase().includes(specializationSearch.toLowerCase())
                      )
                      .map((item) => {
                        const isSelected = specialization === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setSpecialization(item.id)}
                            className={`flex flex-col p-4 rounded-xl border text-left transition-all ${
                              isSelected 
                                ? 'border-primary bg-primary/5 ring-2 ring-primary/25' 
                                : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="font-extrabold text-sm text-[#1b366a]">{item.title}</span>
                              {isSelected && (
                                <span className="rounded-full bg-blue-100 text-blue-900 px-2 py-0.5 text-[9px] font-black uppercase">Selected</span>
                              )}
                            </div>
                            <span className="text-xs text-slate-500 mt-1">{item.desc}</span>
                          </button>
                        );
                      })
                    }
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-blue-700">Step 3</p>
                <h2 className="mt-1 text-2xl font-black font-headline">Start with a diagnostic?</h2>
                <p className="mt-2 text-sm font-medium text-slate-500">The diagnostic is optional, but it gives the AI mentor real data for recommendations.</p>
              </div>

              <label className="block">
                <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">Target LET exam date, optional</span>
                <input
                  type="date"
                  value={targetExamDate}
                  onChange={(event) => setTargetExamDate(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-bold outline-none focus:border-blue-300 focus:bg-white"
                />
                <span className="mt-2 block text-xs font-bold text-slate-400">This helps the planner pace reviewer modules and mock exam practice.</span>
              </label>

              <div className="grid gap-3 md:grid-cols-2">
                <button
                  onClick={() => setDiagnosticChoice('now')}
                  className={`rounded-2xl border p-5 text-left transition-all ${diagnosticChoice === 'now' ? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-slate-50 hover:border-blue-200'}`}
                >
                  <h3 className="font-black">Take diagnostic now</h3>
                  <p className="mt-1 text-sm font-medium text-slate-500">Measure your starting level before choosing what to review.</p>
                </button>
                <button
                  onClick={() => setDiagnosticChoice('later')}
                  className={`rounded-2xl border p-5 text-left transition-all ${diagnosticChoice === 'later' ? 'border-amber-500 bg-amber-50' : 'border-slate-200 bg-slate-50 hover:border-amber-200'}`}
                >
                  <h3 className="font-black">Skip for later</h3>
                  <p className="mt-1 text-sm font-medium text-slate-500">Enter with zero progress and take the diagnostic from the dashboard later.</p>
                </button>
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(event) => setAgreed(event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-[#1b366a] focus:ring-[#1b366a]"
                />
                <span className="text-sm font-bold text-slate-600">
                  I agree that LET review progress, attempts, mistakes, notes, and recommendations will be stored for learning analytics and review guidance.
                </span>
              </label>

              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-bold text-emerald-800">
                <ShieldCheck className="mb-2" size={20} />
                New accounts start honestly: zero progress, zero mock exams, zero mistake-bank items, and no active modules until you start or join one.
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-blue-700">Step 4</p>
                <h2 className="mt-1 text-2xl font-black font-headline">Install the Practice App</h2>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  LET Mastery operates offline-ready so you can review anywhere. Install the application on your mobile device home screen or download the APK.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <article className="border border-slate-200 rounded-2xl bg-slate-50 p-5 flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-[#1b366a]/10 text-[#1b366a] flex items-center justify-center mb-4">
                      <Smartphone size={20} />
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-base">Add to Home Screen (PWA)</h3>
                    <p className="text-xs font-medium text-slate-500 mt-2 leading-relaxed">
                      Installs the web practice app version. Perfect for all iOS and Android devices, keeping your storage free of bulky downloads.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handlePwaInstall}
                    className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#1b366a] text-white px-4 py-3 text-xs font-black uppercase tracking-widest hover:bg-[#1b366a]/90 shadow-sm"
                  >
                    Install PWA
                  </button>
                </article>

                <article className="border border-slate-200 rounded-2xl bg-slate-50 p-5 flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-[#1b366a]/10 text-[#1b366a] flex items-center justify-center mb-4">
                      <Download size={20} />
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-base">Download Capacitor APK</h3>
                    <p className="text-xs font-medium text-slate-500 mt-2 leading-relaxed">
                      Direct package format for offline Android simulators. Optimized for reliable persistence and fast response times.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadApk}
                    className={`mt-5 w-full inline-flex items-center justify-center gap-2 rounded-xl border text-xs font-black uppercase tracking-widest px-4 py-3 shadow-sm transition-all ${
                      downloadStarted 
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800' 
                        : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    {downloadStarted ? '✓ Downloading APK' : 'Download APK'}
                  </button>
                </article>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 text-xs font-bold text-slate-600 leading-relaxed">
                📢 <span className="text-[#1b366a]">Pro-tip:</span> Having the app configured on your home screen enables offline exam simulation and ensures answers are cached and auto-synced the moment you get a cellular signal.
              </div>
            </div>
          )}

          <div className="mt-8 flex gap-3">
            <button
              onClick={() => setStep((value) => Math.max(1, value - 1))}
              disabled={step === 1 || isSubmitting}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-black uppercase tracking-widest text-slate-500 disabled:opacity-40"
            >
              <ArrowLeft size={16} />
              Back
            </button>
            {step < 4 ? (
              <button
                onClick={() => setStep((value) => value + 1)}
                disabled={
                  (step === 1 && !canContinueStep1) || 
                  (step === 2 && !canContinueStep2) || 
                  (step === 3 && !agreed)
                }
                className="inline-flex flex-[2] items-center justify-center gap-2 rounded-2xl bg-[#1b366a] px-5 py-4 text-sm font-black uppercase tracking-widest text-white shadow-lg disabled:opacity-50"
              >
                Continue
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={completeSetup}
                disabled={!agreed || !canContinueStep1 || !canContinueStep2 || isSubmitting}
                className="inline-flex flex-[2] items-center justify-center gap-2 rounded-2xl bg-[#1b366a] px-5 py-4 text-sm font-black uppercase tracking-widest text-white shadow-lg disabled:opacity-50"
              >
                {isSubmitting && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />}
                Finish setup
              </button>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
