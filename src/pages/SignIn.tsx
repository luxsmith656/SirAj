import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBranding } from '../context/BrandingContext';
import { signInWithGoogle, loginWithEmail, registerWithEmail } from '../lib/firebase';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { settings } = useBranding();

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'instructor') navigate('/instructor/dashboard');
      else {
        if (!user.onboarded) navigate('/onboarding');
        else navigate('/student/dashboard');
      }
    }
  }, [user, navigate]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
        if (isSignUp) {
          if (!fullName || !age) {
            setError('Please fill in Name and Age');
            setIsLoading(false);
            return;
          }
          // Save for AuthContext logic
          try {
            localStorage.setItem('pendingRegistrationData', JSON.stringify({ fullName, age }));
          } catch(e) { console.warn(e); }
          await registerWithEmail(email, password);
        } else {
        await loginWithEmail(email, password);
      }
    } catch (err: any) {
      console.error('Auth error:', err.code, err.message);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password login is not enabled in Firebase. Please enable it in the Firebase Console.');
      } else {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#f0f2f5] text-slate-800 font-body min-h-screen flex items-center justify-center antialiased relative overflow-hidden">
       <div className="absolute top-0 right-0 w-full h-1/2 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none"></div>

       <div className="max-w-md w-full px-6 z-10">
          <div className="text-center mb-6">
             <div className="w-16 h-16 bg-primary text-white rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-lg">
                {settings.logo.startsWith('http') ? (
                  <img src={settings.logo} alt="Logo" className="w-10 h-10 object-contain" />
                ) : (
                  <span className="material-symbols-outlined text-3xl font-variation-settings-fill-1">{settings.logo}</span>
                )}
             </div>
             <h1 className="text-3xl font-extrabold font-headline text-slate-800 tracking-tight">{settings.siteName}</h1>
             <p className="text-slate-400 text-[10px] font-bold leading-tight mt-1 uppercase tracking-[0.2em]">{isSignUp ? 'Create your professional account' : 'Sign in to your learning dashboard'}</p>
          </div>

          <div className="bg-white rounded-[32px] p-8 shadow-2xl shadow-blue-900/10 border border-slate-100">
            <form className="space-y-4" onSubmit={handleAuthAction}>
               {error && (
                 <div className="bg-red-50 text-red-600 text-[11px] p-4 rounded-2xl font-bold uppercase tracking-wider text-center border border-red-100 animate-shake">
                   {error}
                 </div>
               )}

               {isSignUp && (
                 <>
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                      <input 
                        type="text" 
                        placeholder="Juana Dela Cruz"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-slate-50 border border-transparent rounded-2xl px-5 py-3.5 text-sm font-medium focus:bg-white focus:border-primary/20 outline-none transition-all"
                        required
                      />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Age</label>
                      <input 
                        type="number" 
                        placeholder="21"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className="w-full bg-slate-50 border border-transparent rounded-2xl px-5 py-3.5 text-sm font-medium focus:bg-white focus:border-primary/20 outline-none transition-all"
                        required
                      />
                   </div>
                 </>
               )}

               <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                  <input 
                    type="email" 
                    placeholder={isSignUp ? "your@email.com" : "admin@example.com"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-transparent rounded-2xl px-5 py-3.5 text-sm font-medium focus:bg-white focus:border-primary/20 outline-none transition-all"
                    required
                  />
               </div>
               <div className="space-y-1.5">
                  <div className="flex justify-between items-center ml-1">
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Password</label>
                     {!isSignUp && <button type="button" className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">Forgot?</button>}
                  </div>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-transparent rounded-2xl px-5 py-3.5 text-sm font-medium focus:bg-white focus:border-primary/20 outline-none transition-all"
                    required
                  />
               </div>
               
               <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-900/10 hover:shadow-xl hover:-translate-y-0.5 transition-all outline-none mt-2 text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3"
              >
                  {isLoading && <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />}
                  {isSignUp ? 'Create Account' : 'Sign In Now'}
               </button>
            </form>

            <div className="relative my-8">
               <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100"></div>
               </div>
               <div className="relative flex justify-center text-[10px] uppercase font-black tracking-[0.2em]">
                  <span className="bg-white px-6 text-slate-300">Fast Connect</span>
               </div>
            </div>

            <button 
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 py-4 rounded-2xl shadow-sm hover:bg-slate-50 transition-all font-bold text-sm text-slate-700 disabled:opacity-50"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              Continue with Google
            </button>
            
            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="w-full mt-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-primary transition-colors text-center"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>
          
          <p className="text-center text-[10px] text-slate-400 mt-8 font-black uppercase tracking-[0.2em]">
             Authorized for <span className="text-slate-600">Teacher Professionalism</span>
          </p>
       </div>
    </div>
  );
}



