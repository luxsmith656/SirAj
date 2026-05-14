import React, { useState, useRef } from 'react';
import AdminLayout from '../components/AdminLayout';
import { useAuth } from '../context/AuthContext';
import { useBranding, defaultSettings } from '../context/BrandingContext';

export default function Settings() {
  const { user } = useAuth();
  const { settings, updateSettings, resetSettings } = useBranding();
  const [siteName, setSiteName] = useState(settings.siteName);
  const [logo, setLogo] = useState(settings.logo);
  const [primaryColor, setPrimaryColor] = useState(settings.primaryColor);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveBranding = async () => {
    setIsSaving(true);
    setSaveStatus('saving');
    try {
      await updateSettings({ siteName, logo, primaryColor });
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaveStatus('idle');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm('Reset all branding to defaults?')) {
      await resetSettings();
      setSiteName(defaultSettings.siteName);
      setLogo(defaultSettings.logo);
      setPrimaryColor(defaultSettings.primaryColor);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 500) {
        alert('File size too large. Please use an image under 500KB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <AdminLayout title="System Preferences">
      <div className="p-8 max-w-[1400px] mx-auto space-y-8 text-on-surface">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-extrabold text-primary font-headline tracking-tight mb-2">Settings</h1>
              <p className="text-on-surface-variant/60 font-medium font-body leading-relaxed max-w-xl">
                Configure your administrative profile and platform-wide parameters.
              </p>
            </div>
            <button 
              onClick={handleReset}
              className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">restart_alt</span>
              Reset to Defaults
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-10">
            <section className="lg:col-span-12 xl:col-span-8 space-y-6">
              <div className="bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">palette</span>
                  </div>
                  <h3 className="font-headline text-xl font-bold text-on-surface">Site Branding</h3>
                </div>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest ml-1">Site Title</label>
                      <input 
                        type="text"
                        value={siteName}
                        onChange={(e) => setSiteName(e.target.value)}
                        className="w-full bg-surface-container rounded-xl px-5 py-4 text-on-surface font-medium text-sm border border-transparent focus:bg-surface-container-lowest focus:border-primary/20 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest ml-1">Logo (Icon Name or URL)</label>
                      <div className="relative">
                        <input 
                          type="text"
                          value={logo}
                          onChange={(e) => setLogo(e.target.value)}
                          placeholder="e.g. school or https://logo.com/img.png"
                          className="w-full bg-surface-container rounded-xl px-5 py-4 pr-14 text-on-surface font-medium text-sm border border-transparent focus:bg-surface-container-lowest focus:border-primary/20 outline-none transition-all"
                        />
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute right-2 top-2 bottom-2 w-10 bg-surface-container-lowest shadow-sm border border-outline-variant rounded-lg flex items-center justify-center text-on-surface-variant/40 hover:text-primary transition-all"
                          title="Upload Image"
                        >
                          <span className="material-symbols-outlined text-[20px]">upload</span>
                        </button>
                        <input 
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileUpload}
                          accept="image/*"
                          className="hidden"
                        />
                      </div>
                      <p className="text-[10px] text-on-surface-variant/40 font-bold ml-1 mt-1">Use a Material Icon name or a direct image URL/Upload.</p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest ml-1">Primary Brand Color</label>
                    <div className="flex gap-4 items-center">
                      <input 
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-12 h-12 rounded-xl cursor-pointer border-none bg-transparent"
                      />
                      <input 
                        type="text"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="flex-1 bg-surface-container rounded-xl px-5 py-4 text-on-surface font-mono text-sm border border-transparent focus:bg-surface-container-lowest focus:border-primary/20 outline-none transition-all"
                      />
                    </div>
                  </div>
                  
                  <div className="pt-6 border-t border-outline-variant/10 flex justify-end">
                    <button 
                      onClick={handleSaveBranding}
                      disabled={isSaving}
                      className={`px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${
                        saveStatus === 'success' ? 'bg-emerald-500 text-white' : 'bg-primary text-on-primary hover:opacity-90 shadow-lg shadow-primary/20'
                      }`}
                    >
                      {isSaving && <span className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />}
                      {saveStatus === 'success' ? 'Branding Saved' : 'Update Branding'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">person</span>
                  </div>
                  <h3 className="font-headline text-xl font-bold text-on-surface">Admin Account</h3>
                </div>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest ml-1">Account Display Email</label>
                      <div className="w-full bg-surface-container rounded-xl px-5 py-4 text-on-surface font-medium text-sm border border-transparent">
                         {user?.email}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest ml-1">Access Level</label>
                      <div className="w-full bg-primary/10 rounded-xl px-5 py-4 text-primary font-bold text-sm border border-primary/10 flex items-center gap-2">
                         <span className="material-symbols-outlined text-[18px]">verified_user</span>
                         Platform Administrator
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="lg:col-span-12 xl:col-span-4 space-y-6">
              <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-on-surface-variant/40">
                    <span className="material-symbols-outlined">settings_suggest</span>
                  </div>
                  <h3 className="font-headline font-bold text-lg text-on-surface">Preferences</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-surface-container/30 rounded-xl">
                    <div>
                      <p className="font-bold text-on-surface text-sm">Offline Cache</p>
                      <p className="text-[10px] text-on-surface-variant/40 font-bold tracking-widest uppercase">Sync core assets</p>
                    </div>
                    <div className="w-10 h-5 bg-primary rounded-full relative cursor-pointer">
                       <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-surface-container/30 rounded-xl">
                    <div>
                      <p className="font-bold text-on-surface text-sm">Dark Theme</p>
                      <p className="text-[10px] text-on-surface-variant/40 font-bold tracking-widest uppercase">Dynamic override</p>
                    </div>
                    <div className="w-10 h-5 bg-surface-container-low rounded-full relative cursor-default">
                       <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-primary rounded-2xl p-6 shadow-lg shadow-primary/20 text-on-primary group overflow-hidden relative">
                 <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                 <h4 className="font-headline font-bold text-lg mb-2 relative z-10 text-on-primary">Sync Status</h4>
                 <p className="text-xs text-on-primary/70 font-medium mb-4 relative z-10 leading-relaxed">Central server is online and reachable. All local data is successfully indexed in the cloud.</p>
                 <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest relative z-10">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Operational
                 </div>
              </div>
            </section>
          </div>
        </div>
    </AdminLayout>
  );
}
