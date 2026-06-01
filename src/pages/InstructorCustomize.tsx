import React, { useState, useRef } from 'react';
import { useBranding } from '../context/BrandingContext';
import { Palette, Upload, Image as ImageIcon, Save, RefreshCw, Type, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import InstructorLayout from '../components/InstructorLayout';

export default function InstructorCustomize() {
  const { settings, updateSettings, resetSettings } = useBranding();
  const [siteName, setSiteName] = useState(settings.siteName);
  const [logo, setLogo] = useState(settings.logo);
  const [primaryColor, setPrimaryColor] = useState(settings.primaryColor);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateSettings({ siteName, logo, primaryColor });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      alert('Failed to update branding.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size too large. Please use an image under 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReset = async () => {
    if (confirm('Are you sure you want to reset branding to defaults?')) {
      await resetSettings();
      window.location.reload();
    }
  };

  return (
    <InstructorLayout title="Identity Settings">
      <div className="max-w-5xl mx-auto p-4 md:p-8 font-body">
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary mb-3">
               <Palette size={14} />
               <span className="text-[10px] font-black uppercase tracking-widest">Platform Branding</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black font-headline text-on-surface tracking-tight">Identity Settings</h1>
            <p className="text-on-surface-variant/60 text-sm mt-1 font-medium">Global customization for your LET review center.</p>
          </div>

          <button 
            onClick={handleReset}
            className="w-fit flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-outline-variant text-[10px] font-black text-on-surface hover:bg-surface-container transition-all uppercase tracking-widest"
          >
            <RefreshCw size={14} />
            Reset Defaults
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Side: Forms */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSave} className="bg-surface-container-lowest rounded-[2.5rem] border border-outline-variant overflow-hidden shadow-2xl shadow-surface-dim/20">
              <div className="p-6 md:p-12 space-y-10">
                {/* Site Name Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-on-surface">
                     <Type size={18} className="text-primary" />
                     <label className="text-[10px] font-black uppercase tracking-[0.2em]">Display Name</label>
                  </div>
                  <input 
                    type="text" 
                    value={siteName} 
                    onChange={(e) => setSiteName(e.target.value)} 
                    className="w-full bg-surface-container border border-transparent rounded-2xl px-6 py-5 text-lg font-bold text-on-surface focus:bg-white focus:border-primary/20 transition-all outline-none"
                    placeholder="e.g. Let Mastery"
                  />
                </div>

                {/* Logo Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-on-surface">
                     <ImageIcon size={18} className="text-primary" />
                     <label className="text-[10px] font-black uppercase tracking-[0.2em]">Platform Logo</label>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-on-surface-variant/40">Upload custom image</p>
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleLogoUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex items-center justify-center gap-3 px-6 py-6 rounded-2xl border-2 border-dashed border-outline-variant hover:border-primary/40 hover:bg-primary/5 transition-all group"
                      >
                        <Upload size={20} className="text-on-surface-variant group-hover:text-primary" />
                        <span className="text-sm font-bold text-on-surface-variant group-hover:text-on-surface">Click to upload</span>
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-on-surface-variant/40">Or use Material Icon</p>
                      <input 
                        type="text" 
                        value={logo.startsWith('data:') || logo.startsWith('http') ? '' : logo} 
                        onChange={(e) => setLogo(e.target.value)} 
                        className="w-full bg-surface-container border border-transparent rounded-2xl px-6 py-5 text-sm font-bold text-on-surface focus:bg-white focus:border-primary/20 transition-all outline-none"
                        placeholder="e.g. school, psychology, public"
                      />
                    </div>
                  </div>
                </div>

                {/* Color Section */}
                <div className="space-y-4 pt-6 border-t border-outline-variant/30 text-left">
                  <div className="flex items-center gap-2 text-on-surface">
                     <Palette size={18} className="text-primary" />
                     <label className="text-[10px] font-black uppercase tracking-[0.2em]">Primary Signature Color</label>
                  </div>
                  <div className="flex gap-4 items-center">
                    <input 
                      type="color" 
                      value={primaryColor} 
                      onChange={(e) => setPrimaryColor(e.target.value)} 
                      className="w-20 h-20 rounded-2xl cursor-pointer bg-surface-container p-1 border border-outline-variant"
                    />
                    <div className="flex-1">
                      <input 
                        type="text" 
                        value={primaryColor} 
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-full bg-surface-container border border-transparent rounded-2xl px-6 py-3 font-mono text-sm font-bold text-on-surface uppercase focus:bg-white transition-all outline-none"
                      />
                      <p className="text-[10px] font-bold text-on-surface-variant/40 mt-2 uppercase tracking-tighter italic">This color will be used for buttons, links, and system accents.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-8 py-6 bg-surface-container/30 border-t border-outline-variant flex items-center justify-between">
                <AnimatePresence>
                  {showSuccess && (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      exit={{ opacity: 0, x: -10 }}
                      className="flex items-center gap-2 text-emerald-600 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-100"
                    >
                      <CheckCircle2 size={16} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Changes Saved Successfully</span>
                    </motion.div>
                  )}
                </AnimatePresence>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="ml-auto flex items-center gap-3 bg-primary text-on-primary px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isSaving ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  {isSaving ? 'Applying...' : 'Push Updates Live'}
                </button>
              </div>
            </form>
          </div>

          {/* Right Side: LIVE Preview */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-on-surface-variant/40 ml-4">Real-time Preview</h3>
            
            <div className="bg-surface rounded-[2.5rem] p-1 border border-outline-variant shadow-xl overflow-hidden pointer-events-none select-none h-fit">
               <div className="bg-white rounded-[2.2rem] h-[400px] flex flex-col items-center justify-center p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-full h-1/2 bg-gradient-to-b from-primary/5 to-transparent"></div>
                  
                  <div 
                    className="w-20 h-20 rounded-[2rem] mb-6 flex items-center justify-center shadow-2xl overflow-hidden transition-all duration-500"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {logo && (logo.startsWith('data:') || logo.startsWith('http')) ? (
                      <img src={logo} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-white text-4xl font-variation-settings-fill-1">{logo || 'school'}</span>
                    )}
                  </div>

                  <h4 className="text-2xl font-black font-headline text-center leading-tight tracking-tight text-on-surface transition-all duration-300">
                    {siteName || 'Let Mastery'}
                  </h4>
                  <p className="text-[10px] font-bold text-on-surface-variant/40 mt-1 uppercase tracking-[0.2em]">Dashboard Preview</p>

                  <div className="mt-10 w-full space-y-3">
                    <div className="h-10 w-full rounded-2xl transition-all duration-300" style={{ backgroundColor: primaryColor }} />
                    <div className="h-10 w-full rounded-2xl bg-surface-container border border-outline-variant" />
                  </div>
               </div>
            </div>

            <div className="bg-primary/5 rounded-3xl p-6 border border-primary/10">
              <h5 className="text-[10px] font-black text-primary uppercase tracking-widest mb-2 italic">Pro Tip</h5>
              <p className="text-xs text-primary/70 font-medium leading-relaxed">
                Updating these settings will immediately affect all users' dashboards, login pages, and mobile home screen icons. Choose colors that represent professional high-stakes review environments.
              </p>
            </div>
          </div>
        </div>
      </div>
    </InstructorLayout>
  );
}
