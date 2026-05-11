import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';

export default function Dashboard() {
  const [filterActive, setFilterActive] = useState('All');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => setIsExporting(false), 2000);
  };

  return (
    <AdminLayout>
      {/* Dashboard Content */}
      <div className="p-8 md:p-12 flex-1 overflow-y-auto space-y-12 max-w-[1400px] mx-auto w-full">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <h1 className="font-headline text-4xl md:text-6xl font-extrabold text-primary tracking-tighter mb-4 leading-none">Overview</h1>
              <p className="font-body text-lg text-on-surface-variant max-w-xl font-medium tracking-tight">Authoritative command center for institutional performance and pedagogical synchronization.</p>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={handleExport}
                className={`bg-white text-primary font-body font-black text-[10px] uppercase tracking-widest py-4 px-8 rounded-full transition-all flex items-center gap-3 ambient-shadow ghost-border active:scale-95 ${isExporting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-surface-container-low'}`}
              >
                <span className={`material-symbols-outlined text-[18px] ${isExporting ? 'animate-spin' : ''}`}>
                  {isExporting ? 'sync' : 'download'}
                </span>
                {isExporting ? 'Compiling Dataset...' : 'Generate Intelligence Report'}
              </button>
            </div>
          </div>

          {/* KPI Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* KPI 1: Total Students (Hero Style) */}
            <Link to="/analytics" className="primary-gradient rounded-[2rem] p-10 text-on-primary relative overflow-hidden flex flex-col justify-between min-h-[240px] shadow-2xl hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-500 group">
              <div className="absolute -top-4 -right-4 p-4 opacity-10 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-1000">
                <span className="material-symbols-outlined text-9xl">school</span>
              </div>
              <div className="relative z-10 flex justify-between items-start">
                <span className="font-label text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Total Enrollment</span>
                <div className="bg-white/10 rounded-full px-4 py-1.5 backdrop-blur-xl flex items-center gap-2 border border-white/10 group-hover:bg-white group-hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-[16px] text-secondary-fixed">trending_up</span>
                  <span className="text-[10px] font-black">+12.5%</span>
                </div>
              </div>
              <div className="relative z-10">
                <div className="font-headline text-6xl font-black tracking-tighter mb-2">14,209</div>
                <div className="text-xs font-bold opacity-60 uppercase tracking-widest">Active across 42 sectors</div>
              </div>
            </Link>

            {/* KPI 2: Active Instructors */}
            <Link to="/users" className="bg-white rounded-[2rem] p-10 relative overflow-hidden flex flex-col justify-between min-h-[240px] ghost-border ambient-shadow hover:bg-surface-container-low hover:-translate-y-1 transition-all duration-500 group">
              <div className="relative z-10 flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center ambient-shadow group-hover:rotate-6 transition-transform">
                    <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>person_check</span>
                  </div>
                </div>
                <span className="font-label text-[10px] font-black text-primary uppercase tracking-[0.2em] opacity-40 group-hover:opacity-100 transition-opacity">Staffing</span>
              </div>
              <div className="relative z-10 flex items-end justify-between">
                <div>
                  <div className="font-headline text-5xl font-black text-primary tracking-tighter">342</div>
                  <div className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mt-2 opacity-60">Verified Educators</div>
                </div>
                <div className="flex -space-x-4 mb-2 group-hover:space-x-1 transition-all duration-500">
                  <img alt="Inst 1" className="w-10 h-10 rounded-xl border-4 border-white ambient-shadow-sm grayscale group-hover:grayscale-0 transition-all object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAESqUM1FXjEVVdJpacaEHRk2AwF-ZlfyiWISnedd_JcB7ngvWMGxevMP5-gVIeEkjGlXKif1JJ5Los-Us1lLLJeNsJ23tWUar1zcaWZdJroxdyr7DUtK91XyONxKyFjTYSHmrbNqtl4_4YyHXtSvd9bFjrPM-dD9kpgKRz1atA6pM0TbrohBYDCPtFL8c_B5IDZ8_aqFM-PByUXGkKLFE9P7-9KNozeuA27fo5GhyTmK-RnPF5u87Iyc1TsEDjlm8qNbZ7x0puug" />
                  <img alt="Inst 2" className="w-10 h-10 rounded-xl border-4 border-white ambient-shadow-sm grayscale group-hover:grayscale-0 transition-all object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJ3jwtHdrl0ImI9ZcH_ejhUuIlTP-cmeV0tF2mBbqxv5C7bto6S4yGAQJ0ImArCRDEV9JTMmBzfFbcBTfou0YuCoK-CgTSEvbkGTaV1CUxUAeZEBoDxok6O6DEEEtkaKLS3jx4VZ_bWif1iykYOzgLD1Y2e0IzwU3cfMyJekA5Le3UGQi0KMdb5YsnycOQYJTH9lh1cO14egAp3l7qXs-KtCsYEvRIf6YPs8xNbI3HdiwTbcxrWyLCECFtEjMW2NWUr0D6dAfnuA" />
                </div>
              </div>
            </Link>

            {/* KPI 3: System Health */}
            <Link to="/sync" className="bg-white rounded-[2rem] p-10 relative overflow-hidden flex flex-col justify-between min-h-[240px] ghost-border ambient-shadow hover:bg-surface-container-low hover:-translate-y-1 transition-all duration-500 group">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center ambient-shadow">
                    <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                  </div>
                  <span className="bg-secondary text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-secondary/20">Operational</span>
                </div>
                <div className="font-headline text-5xl font-black text-primary tracking-tighter mb-4">99.98%</div>
                <div className="w-full bg-surface-container-low rounded-full h-2.5 overflow-hidden p-0.5 ghost-border">
                  <div className="bg-secondary h-full rounded-full w-[99.98%] shadow-[0_0_15px_rgba(0,107,95,0.5)]"></div>
                </div>
              </div>
            </Link>

            {/* KPI 4: Pending Tickets */}
            <Link to="/settings" className="bg-white rounded-[2rem] p-10 relative flex flex-col justify-between min-h-[240px] ghost-border ambient-shadow group overflow-hidden hover:-translate-y-1 transition-all duration-500">
               <div className="absolute top-0 right-0 w-48 h-48 bg-error/5 rounded-full -mr-24 -mt-24 group-hover:scale-150 transition-transform duration-1000"></div>
              <div className="relative z-10 flex justify-between items-start">
                <div className="w-14 h-14 rounded-2xl bg-error/10 text-error flex items-center justify-center ambient-shadow group-hover:rotate-[-6deg] transition-transform">
                  <span className="material-symbols-outlined text-3xl">forum</span>
                </div>
                <span className="font-label text-[10px] font-black text-error uppercase tracking-[0.2em] opacity-40 group-hover:opacity-100">Critical</span>
              </div>
              <div className="relative z-10 flex items-end justify-between">
                <div>
                  <div className="font-headline text-5xl font-black text-on-surface tracking-tighter">48</div>
                  <p className="text-[10px] font-black text-error uppercase tracking-widest mt-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">crisis_alert</span> Awaiting Response
                  </p>
                </div>
                <div className="w-12 h-12 bg-surface-container-low text-primary rounded-full hover:bg-primary hover:text-white transition-all active:scale-95 flex items-center justify-center ambient-shadow-sm border border-white">
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
            {/* Chart Area: Engagement Trends */}
            <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl p-10 ambient-shadow ghost-border relative overflow-hidden">
               <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full -mr-48 -mt-48 blur-[100px] pointer-events-none"></div>
              <div className="flex justify-between items-start mb-10 relative z-10">
                <div>
                  <h2 className="font-headline text-3xl font-extrabold text-primary tracking-tight">Active Learning</h2>
                  <p className="text-lg text-on-surface-variant font-body mt-1">Platform engagement & course completion velocity</p>
                </div>
                <button className="flex items-center gap-2 bg-surface-container-low px-5 py-2.5 rounded-full text-sm font-bold text-on-surface transition-all hover:bg-surface-container-high active:scale-95">
                  May 2024
                  <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                </button>
              </div>
              {/* Faux Chart */}
              <div className="h-[320px] w-full relative flex items-end gap-3 pb-8 z-10">
                {[40, 55, 45, 70, 60, 85, 50, 65, 75, 45, 60, 90, 70, 80].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col justify-end gap-1 group h-full">
                    <div className="w-full bg-primary/5 rounded-t-lg h-[80%] transition-all overflow-hidden relative">
                       <div className="absolute bottom-0 left-0 w-full bg-primary/20 transition-all duration-700" style={{ height: `${h}%` }}></div>
                       <div className="absolute bottom-0 left-0 w-full bg-secondary shadow-[0_-4px_12px_rgba(0,107,95,0.2)] transition-all duration-700 delay-100" style={{ height: `${h-20}%` }}></div>
                    </div>
                    {i % 2 === 0 && <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][Math.floor(i/2)]}</span>}
                  </div>
                ))}
              </div>
              <div className="flex justify-start gap-10 mt-4 pt-8 border-t border-surface-container-high/40 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-primary/20"></div>
                  <span className="text-sm font-bold text-on-surface tracking-tight">Platform Load</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-secondary"></div>
                  <span className="text-sm font-bold text-on-surface tracking-tight">Student Throughput</span>
                </div>
              </div>
            </div>

            {/* Right: Quick Actions & Recent Activity */}
            <div className="flex flex-col gap-8">
               <div className="bg-surface-container-low rounded-xl p-8 ghost-border">
                  <h3 className="font-headline text-xl font-bold mb-6 text-primary tracking-tight">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-3">
                     <Link to="/question/edit" className="flex flex-col gap-3 p-4 bg-surface-container-lowest rounded-2xl hover:scale-[1.02] transition-all hover:ambient-shadow group">
                        <span className="material-symbols-outlined text-secondary group-hover:scale-110 transition-transform">add_circle</span>
                        <span className="text-xs font-bold font-label uppercase tracking-widest text-on-surface-variant">Add Question</span>
                     </Link>
                     <Link to="/bulk-upload" className="flex flex-col gap-3 p-4 bg-surface-container-lowest rounded-2xl hover:scale-[1.02] transition-all hover:ambient-shadow group">
                        <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">cloud_upload</span>
                        <span className="text-xs font-bold font-label uppercase tracking-widest text-on-surface-variant">Bulk Import</span>
                     </Link>
                  </div>
               </div>

              <div className="bg-white rounded-[2.5rem] p-10 ambient-shadow ghost-border flex-1 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="flex justify-between items-center mb-10">
                  <h2 className="font-headline text-2xl font-extrabold text-primary tracking-tight">Intelligence Log</h2>
                  <div className="flex bg-surface-container-low p-1 rounded-full ghost-border">
                    {['All', 'System', 'Users'].map((type) => (
                      <button 
                        key={type}
                        onClick={() => setFilterActive(type)}
                        className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${filterActive === type ? 'bg-primary text-white shadow-lg' : 'text-on-surface-variant/40 hover:text-primary'}`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-8">
                  {/* Activity Item */}
                  <div className={`flex gap-6 items-start transition-opacity duration-500 ${(filterActive === 'All' || filterActive === 'System') ? 'opacity-100' : 'opacity-20 pointer-events-none'}`}>
                    <div className="w-14 h-14 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0 ambient-shadow group-hover:scale-105 transition-transform">
                      <span className="material-symbols-outlined text-[24px]" style={{fontVariationSettings: "'FILL' 1"}}>verified</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-base text-on-surface font-bold leading-tight">Relational Sync Completed</p>
                      <p className="text-sm text-on-surface-variant mt-2 font-medium leading-relaxed">Global database schema re-indexed successfully. Security rules validated across all active nodes.</p>
                      <div className="flex items-center gap-3 mt-3">
                         <span className="text-[10px] text-on-surface-variant/40 uppercase font-black tracking-widest">12:45 PM</span>
                         <span className="w-1 h-1 rounded-full bg-surface-container-highest"></span>
                         <span className="text-[10px] text-secondary font-black uppercase tracking-widest">Protocol Success</span>
                      </div>
                    </div>
                  </div>
                  {/* Activity Item */}
                  <div className={`flex gap-6 items-start transition-opacity duration-500 ${(filterActive === 'All' || filterActive === 'Users') ? 'opacity-100' : 'opacity-20 pointer-events-none'}`}>
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 ambient-shadow">
                      <span className="material-symbols-outlined text-[24px]" style={{fontVariationSettings: "'FILL' 1"}}>stars</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-base text-on-surface font-bold leading-tight">Critical Adoption Milestone</p>
                      <p className="text-sm text-on-surface-variant mt-2 font-medium leading-relaxed">10,000 active concurrent sessions detected. Systematic peak performance maintained.</p>
                      <div className="flex items-center gap-3 mt-3">
                         <span className="text-[10px] text-on-surface-variant/40 uppercase font-black tracking-widest">09:12 AM</span>
                         <span className="w-1 h-1 rounded-full bg-surface-container-highest"></span>
                         <span className="text-[10px] text-primary font-black uppercase tracking-widest">Growth Vector</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
      </div>
    </AdminLayout>
  );
}
