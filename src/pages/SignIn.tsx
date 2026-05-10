import React from 'react';
import { Link } from 'react-router-dom';

export default function SignIn() {
  return (
    <div className="bg-surface text-on-surface font-body min-h-[100dvh] flex flex-col antialiased relative overflow-hidden">
       {/* Background accent */}
       <div className="absolute top-0 right-0 w-full h-64 bg-gradient-to-b from-primary-fixed/40 to-transparent pointer-events-none"></div>

       <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full px-6 py-12 z-10 relative">
          <div className="text-center mb-10">
             <div className="w-16 h-16 bg-primary text-white rounded-2xl mx-auto mb-6 flex items-center justify-center text-2xl font-black font-headline shadow-lg">L</div>
             <h1 className="text-3xl font-extrabold font-headline text-on-surface mb-2 tracking-tight">Welcome Back</h1>
             <p className="text-on-surface-variant text-sm font-medium">Sign in to continue your mastery journey.</p>
          </div>

          <div className="bg-surface-container-lowest rounded-3xl p-8 shadow-sm border border-outline-variant/10">
            <form className="space-y-6">
               <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">Email Address</label>
                  <input 
                    type="email" 
                    placeholder="name@university.edu"
                    className="w-full bg-surface-container-high border-none rounded-xl px-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-primary/30 outline-none transition-all placeholder:text-outline/70"
                  />
               </div>
               <div className="space-y-1.5">
                  <div className="flex justify-between items-end ml-1">
                     <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Password</label>
                     <a href="#" className="text-xs font-semibold text-primary hover:underline">Forgot?</a>
                  </div>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className="w-full bg-surface-container-high border-none rounded-xl px-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-primary/30 outline-none transition-all placeholder:text-outline/70"
                  />
               </div>
               
               <Link to="/onboarding" className="block w-full">
                  <button type="button" className="w-full bg-primary text-on-primary font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary mt-2">
                     Sign In
                  </button>
               </Link>
            </form>
            
            <div className="mt-8 relative flex items-center justify-center">
               <div className="absolute w-full border-t border-outline-variant/20"></div>
               <span className="relative bg-surface-container-lowest px-4 text-xs font-semibold text-outline tracking-widest uppercase">Or</span>
            </div>
            
            <div className="mt-6">
               <button className="w-full bg-surface-container-lowest border border-outline-variant/30 text-on-surface font-semibold py-3 rounded-xl flex items-center justify-center gap-3 hover:bg-surface-container-low transition-colors">
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                  Continue with Google
               </button>
            </div>
          </div>
          
          <p className="text-center text-sm text-on-surface-variant mt-8 font-medium">
             Don't have an account? <a href="#" className="text-primary font-bold hover:underline">Request Access</a>
          </p>
       </div>
    </div>
  );
}
