import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';

export default function Onboarding() {
  const { user, refreshUser, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/choose-learning-mode';

  // Logic to determine initial step and pre-fill
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [age, setAge] = useState(user?.age?.toString() || '');

  const getInitialStep = () => {
    if (!user?.fullName) return 1;
    if (!user?.age) return 2;
    return 3;
  };

  const [step, setStep] = useState(getInitialStep());
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let newStep = step;
    
    if (user?.fullName && !fullName) {
      setFullName(user.fullName);
      if (newStep === 1) newStep = 2;
    }
    if (user?.age && !age) {
      setAge(user.age.toString());
      if (newStep === 2) newStep = 3;
    }
    if (user?.fullName && user?.age && newStep < 3) {
      newStep = 3;
    }
    
    if (newStep !== step) {
       setStep(newStep);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.fullName, user?.age]);

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        fullName,
        age: parseInt(age),
        onboarded: true,
        agreementAccepted: true
      });
      await refreshUser();
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Onboarding failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="bg-[#f0f2f5] text-slate-800 font-body min-h-screen flex items-center justify-center antialiased relative">
      <button 
        onClick={() => {
          signOut();
          navigate('/sign-in');
        }}
        className="fixed top-6 right-6 p-3 text-slate-400 hover:text-[#1b366a] hover:bg-white rounded-full transition-all flex items-center gap-2 group"
      >
        <span className="text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Change Account</span>
        <span className="material-symbols-outlined">logout</span>
      </button>
      
      <div className="max-w-md w-full px-6 py-12">
        <div className="mb-12 flex justify-center gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${step >= i ? 'w-8 bg-[#1b366a]' : 'w-2 bg-slate-200'}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white p-8 rounded-3xl shadow-xl shadow-blue-900/10 border border-slate-100"
            >
              <h1 className="text-2xl font-black font-headline text-slate-800 mb-2">Welcome!</h1>
              <p className="text-slate-500 text-sm font-medium mb-8 italic">Let's start with your official name.</p>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input 
                    autoFocus
                    type="text" 
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-50 border border-transparent rounded-2xl px-5 py-4 text-sm font-medium focus:bg-white focus:border-blue-200 outline-none transition-all"
                  />
                </div>
                <button 
                  onClick={handleNext}
                  disabled={!fullName.trim()}
                  className="w-full bg-[#1b366a] text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm uppercase tracking-widest disabled:opacity-50 disabled:translate-y-0"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white p-8 rounded-3xl shadow-xl shadow-blue-900/10 border border-slate-100"
            >
              <h1 className="text-2xl font-black font-headline text-slate-800 mb-2">Your Age</h1>
              <p className="text-slate-500 text-sm font-medium mb-8">We need this for data profiling purposes.</p>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Current Age</label>
                  <input 
                    autoFocus
                    type="number" 
                    placeholder="Age"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full bg-slate-50 border border-transparent rounded-2xl px-5 py-4 text-sm font-medium focus:bg-white focus:border-blue-200 outline-none transition-all"
                  />
                </div>
                <div className="flex gap-3">
                  <button onClick={handleBack} className="flex-1 bg-slate-50 text-slate-600 font-bold py-4 rounded-2xl transition-all text-sm uppercase tracking-widest border border-slate-100 hover:bg-slate-100">Back</button>
                  <button 
                    onClick={handleNext}
                    disabled={!age}
                    className="flex-[2] bg-[#1b366a] text-white font-bold py-4 rounded-2xl shadow-lg transition-all text-sm uppercase tracking-widest disabled:opacity-50"
                  >
                    Next Step
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white p-8 rounded-3xl shadow-xl shadow-blue-900/10 border border-slate-100"
            >
              <h1 className="text-2xl font-black font-headline text-slate-800 mb-2">Data Privacy</h1>
              <p className="text-slate-500 text-sm font-medium mb-6">Final step before you begin.</p>
              
              <div className="bg-slate-50 rounded-2xl p-4 h-48 overflow-y-auto mb-6 text-xs text-slate-500 leading-relaxed font-medium scrollbar-thin scrollbar-thumb-slate-200">
                <h4 className="font-bold text-slate-700 mb-2">Terms and Conditions</h4>
                By using LET Mastery, you agree to allow us to store and process your exam results for performance tracking. 
                We value your privacy and implement industry-standard security. 
                Your personal data (Name, Age) will be used solely for educational profiling and will not be shared with third parties without your explicit consent.
                <br/><br/>
                We use Google Firestore for real-time data synchronization.
                By proceeding, you explicitly give consent to these data processing activities.
              </div>

              <div className="space-y-4">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-slate-300 text-[#1b366a] focus:ring-[#1b366a]"
                  />
                  <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">I accept the data privacy agreement and terms of use.</span>
                </label>
                
                <div className="flex gap-3">
                  <button onClick={handleBack} disabled={isSubmitting} className="flex-1 bg-slate-50 text-slate-600 font-bold py-4 rounded-2xl transition-all text-sm uppercase tracking-widest border border-slate-100 disabled:opacity-50">Back</button>
                  <button 
                    onClick={handleSubmit}
                    disabled={!agreed || isSubmitting}
                    className="flex-[2] bg-[#1b366a] text-white font-bold py-4 rounded-2xl shadow-lg transition-all text-sm uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting && <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />}
                    Complete Setup
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
