import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Dummy Credentials
    if (email === 'admin@example.com' && password === 'admin123') {
      navigate('/dashboard');
    } else if (email === 'client@example.com' && password === 'client123') {
      navigate('/loading');
    } else {
      setError('Invalid email or password. Try admin@example.com / admin123 or client@example.com / client123');
    }
  };

  return (
    <div className="bg-surface text-on-surface font-body min-h-[100dvh] flex flex-col antialiased relative overflow-hidden bg-surface-container-lowest">
       {/* Background accent */}
       <div className="absolute top-0 right-0 w-full h-[600px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
       <div className="absolute bottom-0 left-0 w-full h-[400px] bg-secondary/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>

       <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full px-8 py-12 z-10 relative">
          <div className="text-center mb-12">
             <div className="w-20 h-20 primary-gradient text-white rounded-[2rem] mx-auto mb-8 flex items-center justify-center text-3xl font-black font-headline ambient-shadow rotate-3 hover:rotate-0 transition-transform duration-500">
               <span className="material-symbols-outlined text-4xl">menu_book</span>
             </div>
             <h1 className="text-5xl font-extrabold font-headline text-primary mb-3 tracking-tighter">Scholarly</h1>
             <p className="text-on-surface-variant text-lg font-medium tracking-tight">The next evolution in academic mastery.</p>
          </div>

          <div className="bg-surface-container-lowest rounded-[2rem] p-10 ambient-shadow ghost-border relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 primary-gradient"></div>
            <form className="space-y-8" onSubmit={handleSignIn}>
               {error && (
                 <div className="bg-error/5 border border-error/10 text-error text-[11px] p-4 rounded-2xl font-bold uppercase tracking-wider animate-in fade-in zoom-in duration-300">
                   {error}
                 </div>
               )}
               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Academic Identifier</label>
                  <input 
                    type="email" 
                    placeholder="name@institution.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-surface-container-low/50 border-none rounded-2xl px-6 py-5 text-base font-bold text-primary ambient-shadow-sm transition-all focus:bg-white focus:ring-4 focus:ring-primary/5 outline-none placeholder:text-on-surface-variant/40"
                    required
                  />
               </div>
               <div className="space-y-2">
                  <div className="flex justify-between items-end ml-1">
                     <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Secret Keyword</label>
                     <a href="#" className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">Reset</a>
                  </div>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-surface-container-low/50 border-none rounded-2xl px-6 py-5 text-base font-bold text-primary ambient-shadow-sm transition-all focus:bg-white focus:ring-4 focus:ring-primary/5 outline-none placeholder:text-on-surface-variant/40"
                    required
                  />
               </div>
               
               <button type="submit" className="w-full primary-gradient text-white font-bold py-5 rounded-full shadow-2xl hover:shadow-primary/30 hover:-translate-y-1 transition-all duration-300 active:scale-95 text-sm uppercase tracking-widest mt-4">
                  Initialize Session
               </button>
            </form>
            
            <div className="mt-10 relative flex items-center justify-center">
               <div className="absolute w-full border-t border-surface-container-low"></div>
               <span className="relative bg-surface-container-lowest px-6 text-[10px] font-bold text-on-surface-variant tracking-widest uppercase">Federated Access</span>
            </div>
            
            <div className="mt-8">
               <button className="w-full bg-surface-container-low/30 border border-white text-on-surface font-bold py-4 rounded-full flex items-center justify-center gap-4 hover:bg-white hover:ambient-shadow transition-all duration-300 active:scale-95 text-xs uppercase tracking-widest">
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5 shadow-sm rounded-full" />
                  Sign in with Google
               </button>
            </div>
          </div>
          
          <div className="mt-8 bg-surface-container-low/40 p-6 rounded-[2rem] ghost-border flex flex-col gap-4">
            <h5 className="text-[9px] uppercase tracking-widest font-black text-primary opacity-60 ml-1">Standard Probing Credentials</h5>
            <div className="grid grid-cols-2 gap-6 px-1">
              <div className="group cursor-pointer" onClick={() => { setEmail('admin@example.com'); setPassword('admin123'); }}>
                <p className="text-[10px] font-black text-primary uppercase tracking-tighter mb-1 group-hover:underline">Authority</p>
                <p className="text-[11px] font-bold text-on-surface tracking-tight">admin@example.com</p>
                <p className="text-[10px] font-medium text-on-surface-variant">admin123</p>
              </div>
              <div className="group cursor-pointer" onClick={() => { setEmail('client@example.com'); setPassword('client123'); }}>
                <p className="text-[10px] font-black text-secondary uppercase tracking-tighter mb-1 group-hover:underline">Candidate</p>
                <p className="text-[11px] font-bold text-on-surface tracking-tight">client@example.com</p>
                <p className="text-[10px] font-medium text-on-surface-variant">client123</p>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-on-surface-variant mt-10 font-bold uppercase tracking-widest">
             Unauthorized access is <span className="text-error">prohibited</span>.
          </p>
       </div>
    </div>
  );
}

