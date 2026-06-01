import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { ArrowLeft, ArrowRight, BookOpenCheck, GraduationCap, School, ShieldCheck, UserRound, Smartphone, Download, Clock } from 'lucide-react';
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
  const [age, setAge] = useState(user?.age?.toString() || '');
  const [gender, setGender] = useState(user?.gender || '');
  const [reviewMode, setReviewMode] = useState<ReviewMode>('self_review');
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
    link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent('LET Mastery Capacitor APK direct installer package placeholder.');
    link.download = 'letmastery.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!user) return null;

  const canContinueStep1 = fullName.trim().length > 1 && age.trim().length > 0 && gender !== '';
  const canContinueStep2 = reviewTrack !== 'secondary' && reviewTrack !== 'specialization'
    ? true
    : specialization.trim().length > 1;

  const completeSetup = async () => {
    if (!agreed || !canContinueStep1 || !canContinueStep2) return;
    setIsSubmitting(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        fullName: fullName.trim(),
        age: parseInt(age),
        gender,
        onboarded: true,
        agreementAccepted: true,
        learningMode: 'self_review',
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

      navigate(diagnosticChoice === 'now' ? '/diagnostic' : '/student/dashboard', { replace: true });
    } catch (error) {
      console.error('Onboarding failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { id: 1, label: 'Profile' },
    { id: 2, label: 'LET Track' },
    { id: 3, label: 'Goal' },
    { id: 4, label: 'App Install' },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-body flex items-center justify-center px-4 py-8">
      <button
        onClick={async () => {
          await signOut();
          navigate('/sign-in');
        }}
        className="fixed top-5 right-5 rounded-full bg-white/80 border border-slate-200 px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-900"
      >
        Sign out
      </button>

      <main className="w-full max-w-2xl">
        <div className="mb-8 text-left">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 mb-6">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-700">Account Setup</span>
          </div>
          <h1 className="text-4xl font-black font-headline tracking-tight text-[#1b366a]">Let's get started</h1>
          <p className="mt-2 text-sm font-medium text-slate-500 italic">Configure your personalized LET review simulator.</p>
        </div>

        <div className="mb-10 flex gap-2">
          {steps.map((item) => (
            <div key={item.id} className="flex-1 flex flex-col gap-2">
              <div className={`h-1.5 rounded-full transition-all duration-500 ${step >= item.id ? 'bg-[#1b366a]' : 'bg-slate-200'}`} />
              <span className={`text-[9px] font-black uppercase tracking-widest ${step >= item.id ? 'text-[#1b366a]' : 'text-slate-400'}`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>

        <section className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-slate-200/50">
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="text-2xl font-black font-headline text-[#1b366a]">Tell us about <u>you</u></h2>
                <p className="mt-2 text-sm font-medium text-slate-500">Basic information to personalize your learning journey.</p>
              </div>

              <div className="space-y-6">
                <div className="group">
                  <label className="block mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400 group-focus-within:text-blue-600 transition-colors">Full name</label>
                  <input
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-6 py-5 text-sm font-bold outline-none focus:border-blue-400 focus:bg-white transition-all"
                    placeholder="e.g. Maria Clara"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="group">
                    <label className="block mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400 group-focus-within:text-blue-600 transition-colors">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as any)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-6 py-5 text-sm font-bold outline-none focus:border-blue-400 focus:bg-white appearance-none transition-all cursor-pointer"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                  </div>
                  <div className="group">
                    <label className="block mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400 group-focus-within:text-blue-600 transition-colors">Age</label>
                    <input
                      type="number"
                      value={age}
                      onChange={(event) => setAge(event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-6 py-5 text-sm font-bold outline-none focus:border-blue-400 focus:bg-white transition-all"
                      placeholder="e.g. 21"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div>
                <h2 className="text-2xl font-black font-headline text-[#1b366a]">Your target exam</h2>
                <p className="mt-2 text-sm font-medium text-slate-500">The dashboard and reviewer categories will follow this track.</p>
              </div>

              <div className="grid gap-3">
                {trackOptions.map((track) => (
                  <button
                    key={track.id}
                    onClick={() => setReviewTrack(track.id)}
                    className={`flex items-center gap-4 rounded-3xl border p-6 text-left transition-all ${reviewTrack === track.id ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600/10' : 'border-slate-200 bg-slate-50 hover:border-blue-200'}`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${reviewTrack === track.id ? 'bg-blue-600 text-white' : 'bg-white text-slate-400 border border-slate-100'}`}>
                      <GraduationCap size={24} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-[#1b366a]">{track.title}</h3>
                      <p className="mt-0.5 text-xs font-medium text-slate-500 leading-relaxed">{track.body}</p>
                    </div>
                  </button>
                ))}
              </div>

              {(reviewTrack === 'secondary' || reviewTrack === 'specialization') && (
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="block">
                    <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">Search for your Specialization</span>
                    <input
                      type="text"
                      value={specializationSearch}
                      onChange={(event) => setSpecializationSearch(event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-6 py-5 text-sm font-bold outline-none focus:border-blue-300 focus:bg-white"
                      placeholder="🔍 e.g. English, Math, Science..."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200">
                    {[
                      { id: 'English', title: 'English', desc: 'Linguistics & Literature' },
                      { id: 'Mathematics', title: 'Mathematics', desc: 'Algebra to Calculus' },
                      { id: 'Science', title: 'General Science', desc: 'Bio, Chem, Physics' },
                      { id: 'Social Studies', title: 'Social Studies', desc: 'History & Econ' },
                      { id: 'Filipino', title: 'Filipino', desc: 'Panitikan at Wika' },
                      { id: 'MAPEH', title: 'MAPEH', desc: 'Music, Arts, PE, Health' },
                      { id: 'TLE', title: 'TLE', desc: 'ICT & Home Economics' }
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
                            className={`flex flex-col p-4 rounded-2xl border text-left transition-all ${
                              isSelected 
                                ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600/10' 
                                : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}
                          >
                            <span className="font-extrabold text-sm text-[#1b366a]">{item.title}</span>
                            <span className="text-[10px] text-slate-500 mt-0.5">{item.desc}</span>
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
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="text-2xl font-black font-headline text-[#1b366a]">The Diagnostic</h2>
                <p className="mt-2 text-sm font-medium text-slate-500">Measure your starting level to enable AI recommendations.</p>
              </div>

              <div className="space-y-6">
                <div className="group">
                  <label className="block mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Target LET exam date, optional</label>
                  <input
                    type="date"
                    value={targetExamDate}
                    onChange={(event) => setTargetExamDate(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-6 py-5 text-sm font-bold outline-none focus:border-blue-400 focus:bg-white active:scale-[0.99] transition-all"
                  />
                  <span className="mt-2 block text-[10px] font-bold text-slate-400 italic">This helps our planner pace your modules.</span>
                </div>

                <div className="grid gap-3">
                  <button
                    onClick={() => setDiagnosticChoice('now')}
                    className={`rounded-3xl border p-6 text-left transition-all flex items-center gap-4 ${diagnosticChoice === 'now' ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600/10' : 'border-slate-200 bg-slate-50 hover:border-blue-200'}`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${diagnosticChoice === 'now' ? 'bg-blue-600 text-white' : 'bg-white text-slate-400 border border-slate-100'}`}>
                      <ShieldCheck size={24} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-[#1b366a]">Take diagnostic now</h3>
                      <p className="mt-0.5 text-xs font-medium text-slate-500">Get instant AI insights about your weak topics.</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setDiagnosticChoice('later')}
                    className={`rounded-3xl border p-6 text-left transition-all flex items-center gap-4 ${diagnosticChoice === 'later' ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-500/10' : 'border-slate-200 bg-slate-50 hover:border-amber-200'}`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${diagnosticChoice === 'later' ? 'bg-amber-500 text-white' : 'bg-white text-slate-400 border border-slate-100'}`}>
                      <Clock size={24} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-[#1b366a]">Skip for later</h3>
                      <p className="mt-0.5 text-xs font-medium text-slate-500">Enter the dashboard with zero data. You can take it later.</p>
                    </div>
                  </button>
                </div>

                <label className="flex cursor-pointer items-start gap-4 p-5 rounded-3xl border border-slate-100 bg-slate-50 group hover:border-blue-200 transition-colors">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(event) => setAgreed(event.target.checked)}
                    className="mt-1.5 h-5 w-5 rounded-lg border-slate-300 text-[#1b366a] focus:ring-[#1b366a] transition-all"
                  />
                  <span className="text-[11px] font-bold text-slate-600 leading-relaxed uppercase tracking-widest">
                    I agree to store my review progress and diagnostic data for learning analytics.
                  </span>
                </label>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="text-center">
                <div className="w-20 h-20 bg-blue-600 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-600/20">
                  <Smartphone size={40} />
                </div>
                <h2 className="text-3xl font-black font-headline text-[#1b366a]">Ready to study</h2>
                <p className="mt-2 text-sm font-medium text-slate-500 max-w-sm mx-auto">
                  LET Mastery operates offline-ready. Install the app on your home screen for the best experience.
                </p>
              </div>

              <div className="grid gap-4">
                <button
                  onClick={handlePwaInstall}
                  className="group relative overflow-hidden rounded-3xl bg-[#1b366a] p-8 text-left text-white shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <div className="relative z-10">
                    <h3 className="text-xl font-black mb-1">Install to Home Screen</h3>
                    <p className="text-xs font-medium opacity-70">Single-tap access, zero storage consumed.</p>
                  </div>
                  <ArrowRight className="absolute right-8 top-1/2 -translate-y-1/2 opacity-20 group-hover:translate-x-2 transition-transform" size={48} />
                </button>
                
                <button
                  onClick={handleDownloadApk}
                  className="rounded-3xl border-2 border-slate-100 p-6 flex items-center justify-between hover:border-blue-600/20 hover:bg-slate-50 transition-all font-black text-[#1b366a] uppercase tracking-widest text-xs"
                >
                  <span>{downloadStarted ? '✓ Downloading Package...' : 'Download Android APK'}</span>
                  <Download size={20} />
                </button>
              </div>
            </div>
          )}

          <div className="mt-12 pt-8 border-t border-slate-100 flex gap-4">
            <button
              onClick={() => setStep((value) => Math.max(1, value - 1))}
              disabled={step === 1 || isSubmitting}
              className="px-8 py-5 rounded-3xl border border-slate-200 bg-white text-xs font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 hover:border-slate-300 disabled:opacity-30 transition-all"
            >
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
                className="flex-1 rounded-3xl bg-[#1b366a] px-8 py-5 text-xs font-black uppercase tracking-[0.2em] text-white shadow-2xl shadow-[#1b366a]/30 hover:bg-[#254b91] disabled:opacity-50 transition-all active:scale-[0.98]"
              >
                Next Step
              </button>
            ) : (
              <button
                onClick={completeSetup}
                disabled={!agreed || !canContinueStep1 || !canContinueStep2 || isSubmitting}
                className="flex-1 rounded-3xl bg-emerald-600 px-8 py-5 text-xs font-black uppercase tracking-[0.2em] text-white shadow-2xl shadow-emerald-600/30 hover:bg-emerald-700 disabled:opacity-50 transition-all active:scale-[0.98]"
              >
                {isSubmitting ? 'Syncing...' : 'Enter Dashboard'}
              </button>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
