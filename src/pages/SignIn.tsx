import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signInWithGoogle } from '../lib/firebase';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/dashboard');
      else navigate('/loading');
    }
  }, [user, navigate]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError('Please use Google Sign-In for this demo.');
  };

  return (
    <div className="bg-[#f0f2f5] text-slate-800 font-body min-h-screen flex items-center justify-center antialiased relative overflow-hidden">
       <div className="absolute top-0 right-0 w-full h-1/2 bg-gradient-to-b from-blue-100/50 to-transparent pointer-events-none"></div>

       <div className="max-w-md w-full px-6 z-10">
          <div className="text-center mb-6">
             <div className="w-12 h-12 bg-[#1b366a] text-white rounded-2xl mx-auto mb-4 flex items-center justify-center text-xl font-extrabold font-headline shadow-lg">L</div>
             <h1 className="text-2xl font-extrabold font-headline text-slate-800 tracking-tight">LET Mastery</h1>
             <p className="text-slate-400 text-xs font-bold leading-tight mt-1 uppercase tracking-widest">Sign in to continue your journey</p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-2xl shadow-blue-900/10 border border-slate-100">
            <form className="space-y-4" onSubmit={handleSignIn}>
               {error && (
                 <div className="bg-red-50 text-red-600 text-[11px] p-3 rounded-xl font-bold uppercase tracking-wider text-center border border-red-100">
                   {error}
                 </div>
               )}
               <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email</label>
                  <input 
                    type="email" 
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-transparent rounded-2xl px-5 py-3 text-sm font-medium focus:bg-white focus:border-blue-200 outline-none transition-all"
                    required
                  />
               </div>
               <div className="space-y-1.5">
                  <div className="flex justify-between items-center ml-1">
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Password</label>
                     <button type="button" className="text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:underline">Forgot?</button>
                  </div>
                  <input 
                    type="password" 
                    placeholder="admin123"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-transparent rounded-2xl px-5 py-3 text-sm font-medium focus:bg-white focus:border-blue-200 outline-none transition-all"
                    required
                  />
               </div>
               
               <button type="submit" className="w-full bg-[#1b366a] text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-900/20 hover:bg-[#112349] transition-all outline-none mt-2 text-xs uppercase tracking-[0.2em]">
                  Sign In
               </button>
            </form>

            <div className="relative my-8">
               <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100"></div>
               </div>
               <div className="relative flex justify-center text-xs uppercase font-bold tracking-widest">
                  <span className="bg-white px-4 text-slate-300">Or continue with</span>
               </div>
            </div>

            <button 
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 py-4 rounded-2xl shadow-sm hover:bg-slate-50 transition-all font-bold text-sm text-slate-700"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              Sign in with Google
            </button>
            
             <div className="mt-8">
                <div className="p-4 bg-[#1b366a]/5 rounded-2xl border border-[#1b366a]/10">
                   <p className="text-[10px] font-black text-[#1b366a] uppercase tracking-widest mb-1 leading-none flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm">verified_user</span>
                      Admin Access
                   </p>
                   <p className="text-[11px] text-slate-500 font-bold leading-tight">Authorize with: <span className="text-slate-800">castanar656@gmail.com</span></p>
                </div>
             </div>
          </div>
          
          <p className="text-center text-[11px] text-slate-400 mt-8 font-bold uppercase tracking-widest">
             Need help? <a href="#" className="text-blue-600 hover:underline">Contact Support</a>
          </p>
       </div>
    </div>
  );
}



