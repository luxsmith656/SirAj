import React from 'react';
import AdminLayout from '../components/AdminLayout';

export default function Settings() {
  return (
    <AdminLayout title="System Settings">
      {/* Content */}
      <div className="pt-8 px-6 md:px-12 w-full max-w-7xl mx-auto space-y-12 pb-24">
          {/* Page Header */}
          <div className="max-w-2xl">
            <h2 className="font-headline text-4xl md:text-5xl font-extrabold text-primary tracking-tight mb-3">System Settings</h2>
            <p className="font-body text-lg text-on-surface-variant leading-relaxed max-w-xl">
              Configure core application parameters, security protocols, and global preferences for the LET Mastery environment.
            </p>
          </div>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* General Settings (Spans 8 cols) */}
            <section className="lg:col-span-8 bg-surface-container-low rounded-[2rem] p-8 md:p-10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center shadow-[0_8px_32px_rgba(25,28,30,0.04)]">
                  <span className="material-symbols-outlined text-primary">tune</span>
                </div>
                <h3 className="font-headline text-2xl font-bold text-on-surface">General Configuration</h3>
              </div>
              
              <div className="space-y-8 relative z-10">
                <div className="space-y-2">
                  <label className="font-label text-sm font-semibold text-on-surface-variant uppercase tracking-wide">Application Name</label>
                  <input className="w-full bg-surface-container-high border-none rounded-xl px-5 py-4 text-on-surface font-body font-medium placeholder:text-outline transition-all duration-300 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 outline-none" type="text" defaultValue="LET Mastery Platform" />
                </div>
                
                <div className="space-y-2">
                  <label className="font-label text-sm font-semibold text-on-surface-variant uppercase tracking-wide">Brand Identity</label>
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-6 p-6 bg-surface-container-lowest rounded-xl">
                    <div className="w-20 h-20 rounded-2xl bg-surface-container-high flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-3xl text-primary">image</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-on-surface font-medium mb-1">Platform Logo</p>
                      <p className="text-xs text-outline mb-4">Recommended: 512x512px transparent PNG.</p>
                      <button className="bg-secondary-container text-on-secondary-container px-5 py-2.5 rounded-full font-label font-semibold text-sm hover:opacity-90 transition-opacity">
                        Upload New Asset
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 flex justify-end">
                  <button className="bg-primary text-on-primary px-8 py-3.5 rounded-full font-label font-bold tracking-wide hover:shadow-[0_8px_32px_rgba(0,35,111,0.15)] transition-all duration-300 active:scale-95">
                    Save General Settings
                  </button>
                </div>
              </div>
            </section>

            {/* System Preferences (Spans 4 cols) */}
            <section className="lg:col-span-4 flex flex-col gap-8">
              <div className="bg-surface-container-low rounded-[2rem] p-8 flex-1">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center shadow-[0_8px_32px_rgba(25,28,30,0.04)]">
                    <span className="material-symbols-outlined text-secondary">wifi_tethering</span>
                  </div>
                  <h3 className="font-headline text-xl font-bold text-on-surface">Preferences</h3>
                </div>
                
                <div className="space-y-6">
                  {/* Toggle */}
                  <div className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-xl">
                    <div>
                      <p className="font-body font-semibold text-on-surface text-sm">Offline Mode Default</p>
                      <p className="font-label text-xs text-outline mt-0.5">Pre-download core modules</p>
                    </div>
                    <div className="relative w-12 h-6 bg-secondary rounded-full cursor-pointer shrink-0 transition-colors">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform"></div>
                    </div>
                  </div>
                  
                  {/* Select */}
                  <div className="space-y-2">
                    <label className="font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Sync Frequency</label>
                    <div className="relative">
                      <select defaultValue="Every 15 Minutes" className="w-full appearance-none bg-surface-container-lowest border-none rounded-xl px-5 py-3.5 text-on-surface font-body text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer">
                        <option>Real-time (High Battery)</option>
                        <option>Every 15 Minutes</option>
                        <option>Hourly</option>
                        <option>Manual Only</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Security Protocol (Spans 6 cols) */}
            <section className="lg:col-span-6 bg-surface-container-low rounded-[2rem] p-8 md:p-10 relative overflow-hidden">
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-secondary/5 rounded-full blur-3xl"></div>
              
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center shadow-[0_8px_32px_rgba(25,28,30,0.04)]">
                  <span className="material-symbols-outlined text-primary">security</span>
                </div>
                <h3 className="font-headline text-2xl font-bold text-on-surface">Security Protocol</h3>
              </div>
              
              <div className="space-y-6 relative z-10">
                <div className="p-5 bg-surface-container-lowest rounded-xl flex items-start gap-4">
                  <div className="mt-0.5 text-secondary">
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-body font-semibold text-sm text-on-surface mb-1">Strict Password Policy</h4>
                    <p className="font-label text-xs text-outline leading-relaxed">Requires minimum 12 characters, including uppercase, numbers, and special symbols for all admin accounts.</p>
                  </div>
                  <div className="relative w-10 h-5 bg-secondary rounded-full cursor-pointer shrink-0 transition-colors mt-1">
                    <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform"></div>
                  </div>
                </div>
                
                <div className="p-5 bg-surface-container-lowest rounded-xl flex items-start gap-4">
                  <div className="mt-0.5 text-outline">
                    <span className="material-symbols-outlined text-[20px]">phonelink_lock</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-body font-semibold text-sm text-on-surface mb-1">Two-Factor Authentication (2FA)</h4>
                    <p className="font-label text-xs text-outline leading-relaxed mb-3">Enforce mandatory TOTP verification for all user roles above 'Student'.</p>
                    <button className="text-primary font-label font-bold text-xs uppercase tracking-wider hover:text-primary-container transition-colors">Configure Roles</button>
                  </div>
                  <div className="relative w-10 h-5 bg-surface-container-high rounded-full cursor-pointer shrink-0 transition-colors mt-1">
                    <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform"></div>
                  </div>
                </div>
              </div>
            </section>

            {/* Data Management (Spans 6 cols) */}
            <section className="lg:col-span-6 bg-surface-container-low rounded-[2rem] p-8 md:p-10 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center shadow-[0_8px_32px_rgba(25,28,30,0.04)]">
                    <span className="material-symbols-outlined text-[20px] text-primary">storage</span>
                  </div>
                  <h3 className="font-headline text-2xl font-bold text-on-surface">Data & Architecture</h3>
                </div>
                <p className="font-body text-sm text-on-surface-variant mb-8 max-w-md">
                  Manage critical system data, execute manual backups, and maintain optimal performance through cache regulation.
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button className="flex flex-col items-start p-5 bg-surface-container-lowest rounded-xl hover:bg-white hover:shadow-[0_8px_32px_rgba(25,28,30,0.06)] transition-all duration-300 text-left group">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary/10 mb-3 group-hover:-translate-y-1 transition-transform">
                    <span className="material-symbols-outlined text-primary">cloud_download</span>
                  </div>
                  <span className="font-body font-semibold text-sm text-on-surface block mb-1">Download Database</span>
                  <span className="font-label text-xs text-outline block">Generate full JSON snapshot</span>
                </button>
                <button className="flex flex-col items-start p-5 bg-surface-container-lowest rounded-xl hover:bg-error/5 hover:shadow-[0_8px_32px_rgba(186,26,26,0.06)] transition-all duration-300 text-left group border border-transparent hover:border-error/10">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-error/10 mb-3 group-hover:-translate-y-1 transition-transform group-hover:rotate-180 duration-500">
                    <span className="material-symbols-outlined text-error">cached</span>
                  </div>
                  <span className="font-body font-semibold text-sm text-error block mb-1">Reset System Cache</span>
                  <span className="font-label text-xs text-outline block">Clear all temporary visual assets</span>
                </button>
              </div>
            </section>
          </div>
        </div>
    </AdminLayout>
  );
}
