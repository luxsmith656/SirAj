import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface SiteSettings {
  siteName: string;
  logo: string;
  logoScale?: number;
  primaryColor: string;
}

interface BrandingContextType {
  settings: SiteSettings;
  updateSettings: (newSettings: Partial<SiteSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
  isLoading: boolean;
  quotaExceeded: boolean;
}

export const defaultSettings: SiteSettings = {
  siteName: 'Let Mastery',
  logo: 'school', // Material icon name or URL
  logoScale: 1,
  primaryColor: '#00236f',
};

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'branding'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as SiteSettings;
        setSettings(data);
        updateStyles(data);
        setQuotaExceeded(false);
      } else {
        console.warn('Branding settings not found. Waiting for initialization...');
      }
      setIsLoading(false);
    }, (error) => {
      console.error('Branding query failed:', error);
      const isQuota = error.message?.toLowerCase().includes('quota') || (error as any).code === 'resource-exhausted';
      if (isQuota) setQuotaExceeded(true);
      
      setIsLoading(false);
      updateStyles(defaultSettings);
    });

    return () => unsub();
  }, []);

  const updateStyles = (data: SiteSettings) => {
    document.title = data.siteName;
    const root = document.documentElement;
    root.style.setProperty('--dynamic-primary', data.primaryColor);
    
    // Also update favicon if logo is a URL or base64
    if (data.logo.startsWith('http') || data.logo.startsWith('data:')) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = data.logo;
    }
  };

  const updateSettings = async (newSettings: Partial<SiteSettings>) => {
    await setDoc(doc(db, 'settings', 'branding'), { ...settings, ...newSettings }, { merge: true });
  };

  const resetSettings = async () => {
    await setDoc(doc(db, 'settings', 'branding'), defaultSettings);
  };

  return (
    <BrandingContext.Provider value={{ settings, updateSettings, resetSettings, isLoading, quotaExceeded }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const context = useContext(BrandingContext);
  if (context === undefined) {
    throw new Error('useBranding must be used within a BrandingProvider');
  }
  return context;
}
