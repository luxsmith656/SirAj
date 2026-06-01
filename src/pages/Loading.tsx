import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBranding } from '../context/BrandingContext';

export default function Loading() {
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const { settings } = useBranding();

  // Smoothly increment progress to 100% regardless of authentication latency
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.floor(Math.random() * 12) + 6;
      });
    }, 120);
    return () => clearInterval(interval);
  }, []);

  // Safe navigation redirect once progress completes AND Auth state resolves
  useEffect(() => {
    if (progress >= 100 && !isLoading) {
      if (!user) {
        navigate('/sign-in', { replace: true });
        return;
      }
      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (user.role === 'instructor') {
        navigate('/instructor/dashboard', { replace: true });
      } else if (!user.onboarded) {
        navigate('/onboarding', { replace: true });
      } else {
        navigate('/student/dashboard', { replace: true });
      }
    }
  }, [progress, isLoading, user, navigate]);

  const getLogoDisplay = () => {
    // If logo is a URL (starts with http or data:), display as image
    if (settings?.logo && typeof settings.logo === 'string' && (settings.logo.startsWith('http') || settings.logo.startsWith('data:'))) {
      return (
        <img src={settings.logo} alt="Logo" className="w-full h-full object-contain" style={{ transform: `scale(${settings.logoScale ?? 1})`, transformOrigin: 'center center' }} />
      );
    }
    // Otherwise, display the first letter of site name
    return (
      <span className="text-4xl font-black font-headline tracking-tighter">
        {settings?.siteName ? settings.siteName.charAt(0).toUpperCase() : 'L'}
      </span>
    );
  };

  return (
    <div className="bg-primary text-on-primary font-body min-h-[100dvh] flex flex-col items-center justify-center relative overflow-hidden antialiased">
       {/* Background decorative elements */}
       <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary-container rounded-full blur-[100px] opacity-60"></div>
       <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-secondary-container/30 rounded-full blur-[100px] opacity-60"></div>
       
       <div className="z-10 flex flex-col items-center max-w-sm w-full px-8 text-center">
          <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-full mb-8 flex items-center justify-center border border-white/20 shadow-2xl overflow-hidden">
             {getLogoDisplay()}
          </div>
          <h1 className="text-3xl font-extrabold font-headline mb-2 tracking-tight">{settings.siteName}</h1>
          <p className="text-primary-fixed-dim text-sm font-medium mb-12">Preparing your study environment...</p>
          
          <div className="w-full max-w-[200px] space-y-3">
            <div className="w-full bg-primary-container/50 h-1.5 rounded-full overflow-hidden backdrop-blur-sm">
               <div 
                 className="h-full bg-secondary-fixed transition-all duration-300 ease-out rounded-full"
                 style={{ width: `${progress}%` }}
               ></div>
            </div>
            <div className="text-xs font-bold text-secondary-fixed-dim text-right tracking-widest">{progress}%</div>
          </div>
       </div>
    </div>
  );
}
