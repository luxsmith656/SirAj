import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface SiteSettings {
  siteName: string;
  logo: string;
  primaryColor: string;
  logoScale: number;
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
  primaryColor: '#00236f',
  logoScale: 1,
};

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const manifestUrlRef = useRef<string | null>(null);

  const normalizeIconType = (src: string) => {
    if (typeof src !== 'string') return 'image/png';
    if (src.startsWith('data:')) {
      const match = src.match(/^data:(image\/[a-zA-Z0-9.+-]+);/);
      return match?.[1] ?? 'image/png';
    }
    if (src.endsWith('.svg')) return 'image/svg+xml';
    if (src.endsWith('.png')) return 'image/png';
    if (src.endsWith('.jpg') || src.endsWith('.jpeg')) return 'image/jpeg';
    return 'image/png';
  };

  const getManifestIconSrc = (logo: string) => {
    if (typeof logo === 'string' && (logo.startsWith('http') || logo.startsWith('data:'))) return logo;
    return '/pwa-icon.svg';
  };

  const updateManifest = (data: SiteSettings) => {
    const iconSrc = getManifestIconSrc(data.logo);
    const manifest = {
      name: data.siteName,
      short_name: data.siteName.split(' ')[0] || data.siteName,
      description: 'Offline-capable LET Review platform',
      start_url: '.',
      display: 'standalone',
      theme_color: data.primaryColor,
      background_color: '#ffffff',
      icons: [
        { src: iconSrc, sizes: '192x192', type: normalizeIconType(iconSrc), purpose: 'any maskable' },
        { src: iconSrc, sizes: '512x512', type: normalizeIconType(iconSrc), purpose: 'any maskable' }
      ]
    };

    const manifestBlob = new Blob([JSON.stringify(manifest)], { type: 'application/manifest+json' });
    const manifestUrl = URL.createObjectURL(manifestBlob);
    if (manifestUrlRef.current) {
      URL.revokeObjectURL(manifestUrlRef.current);
    }
    manifestUrlRef.current = manifestUrl;

    let manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement | null;
    if (!manifestLink) {
      manifestLink = document.createElement('link');
      manifestLink.rel = 'manifest';
      manifestLink.id = 'dynamic-manifest';
      document.head.appendChild(manifestLink);
    }
    manifestLink.href = manifestUrl;
  };

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'branding'), (snapshot) => {
      if (snapshot.exists()) {
        const data = { ...defaultSettings, ...(snapshot.data() as Partial<SiteSettings>) } as SiteSettings;
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
    if (typeof data.logo === 'string' && (data.logo.startsWith('http') || data.logo.startsWith('data:'))) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = data.logo;
    }

    updateManifest(data);
    try {
      window.localStorage.setItem('letmastery-branding', JSON.stringify(data));
    } catch (error) {
      console.warn('Unable to save branding to localStorage', error);
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
