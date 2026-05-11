import React from 'react';
import AdminLayout from '../components/AdminLayout';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { user } = useAuth();

  return (
    <AdminLayout title="System Preferences">
      <div className="p-8 max-w-[1400px] mx-auto space-y-8 text-on-surface">
          <div>
            <h1 className="text-3xl font-extrabold text-[#1b366a] font-headline tracking-tight mb-2">Settings</h1>
            <p className="text-slate-500 font-medium font-body leading-relaxed max-w-xl">
              Configure your administrative profile and platform-wide parameters.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-10">
            <section className="lg:col-span-12 xl:col-span-8 bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#1b366a]">
                  <span className="material-symbols-outlined">person</span>
                </div>
                <h3 className="font-headline text-xl font-bold text-slate-800">Admin Account</h3>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Account Display Email</label>
                    <div className="w-full bg-slate-50 rounded-xl px-5 py-4 text-slate-700 font-medium text-sm border border-transparent">
                       {user?.email}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Access Level</label>
                    <div className="w-full bg-blue-50 rounded-xl px-5 py-4 text-[#1b366a] font-bold text-sm border border-blue-100 flex items-center gap-2">
                       <span className="material-symbols-outlined text-[18px]">verified_user</span>
                       Platform Administrator
                    </div>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-slate-100">
                  <h4 className="font-bold text-sm text-slate-800 mb-4">Account Security</h4>
                  <p className="text-xs text-slate-400 mb-4 leading-relaxed">Your account is secured via Google Authentication. To change passwords or security settings, please visit your Google Account dashboard.</p>
                  <button className="px-6 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold text-[11px] uppercase tracking-widest hover:bg-slate-200 transition-all">
                    Manage Security
                  </button>
                </div>
              </div>
            </section>

            <section className="lg:col-span-12 xl:col-span-4 space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                    <span className="material-symbols-outlined">settings_suggest</span>
                  </div>
                  <h3 className="font-headline font-bold text-lg text-slate-800">Preferences</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <p className="font-bold text-slate-700 text-sm">Offline Cache</p>
                      <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Sync core assets</p>
                    </div>
                    <div className="w-10 h-5 bg-[#1b366a] rounded-full relative cursor-pointer">
                       <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <p className="font-bold text-slate-700 text-sm">Dark Theme</p>
                      <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Dynamic override</p>
                    </div>
                    <div className="w-10 h-5 bg-slate-200 rounded-full relative cursor-default">
                       <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#1b366a] rounded-2xl p-6 shadow-lg shadow-blue-900/20 text-white group overflow-hidden relative">
                 <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                 <h4 className="font-headline font-bold text-lg mb-2 relative z-10">Sync Status</h4>
                 <p className="text-xs text-blue-200 font-medium mb-4 relative z-10 leading-relaxed">Central server is online and reachable. All local data is successfully indexed in the cloud.</p>
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
