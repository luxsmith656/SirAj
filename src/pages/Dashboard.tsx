import React from 'react';

export default function Dashboard() {
  return (
    <div className="bg-surface text-on-surface font-body min-h-screen flex antialiased">
      {/* SideNavBar (Hidden on Mobile) */}
      <nav className="hidden md:flex flex-col h-screen py-6 bg-surface-container-low dark:bg-slate-950 text-primary-container dark:text-blue-400 font-headline font-medium text-sm w-64 fixed left-0 top-0 border-r-0 translate-x-1 duration-300 z-50">
        <div className="px-6 mb-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-lg shadow-sm shadow-blue-900/5">
            L
          </div>
          <div>
            <div className="font-black text-primary-container dark:text-white tracking-tight">Lumina Academy</div>
            <div className="text-xs text-on-surface-variant">Admin Portal</div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-2">
          <a className="bg-surface-container-lowest dark:bg-slate-900 text-primary-container dark:text-blue-300 rounded-full shadow-[0_4px_16px_-4px_rgba(0,35,111,0.08)] my-1 mx-2 py-3 px-4 flex items-center gap-3" href="#">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
            Dashboard
          </a>
          <a className="text-on-surface-variant dark:text-slate-400 my-1 mx-2 py-3 px-4 flex items-center gap-3 transition-all hover:bg-surface-container-lowest/50 dark:hover:bg-slate-900/50 rounded-full" href="#">
            <span className="material-symbols-outlined">group</span>
            Students
          </a>
          <a className="text-on-surface-variant dark:text-slate-400 my-1 mx-2 py-3 px-4 flex items-center gap-3 transition-all hover:bg-surface-container-lowest/50 dark:hover:bg-slate-900/50 rounded-full" href="#">
            <span className="material-symbols-outlined">menu_book</span>
            Courses
          </a>
          <a className="text-on-surface-variant dark:text-slate-400 my-1 mx-2 py-3 px-4 flex items-center gap-3 transition-all hover:bg-surface-container-lowest/50 dark:hover:bg-slate-900/50 rounded-full" href="#">
            <span className="material-symbols-outlined">insights</span>
            Analytics
          </a>
          <a className="text-on-surface-variant dark:text-slate-400 my-1 mx-2 py-3 px-4 flex items-center gap-3 transition-all hover:bg-surface-container-lowest/50 dark:hover:bg-slate-900/50 rounded-full" href="#">
            <span className="material-symbols-outlined">calendar_today</span>
            Schedule
          </a>
          <a className="text-on-surface-variant dark:text-slate-400 my-1 mx-2 py-3 px-4 flex items-center gap-3 transition-all hover:bg-surface-container-lowest/50 dark:hover:bg-slate-900/50 rounded-full mt-auto mb-4" href="#">
            <span className="material-symbols-outlined">settings</span>
            Settings
          </a>
        </div>
        <div className="px-6 mt-auto">
          <button className="w-full bg-secondary-container text-on-secondary-container rounded-full py-3 px-4 font-bold flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]">
            <span className="material-symbols-outlined text-sm">support_agent</span>
            Support Center
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col md:ml-64 relative min-h-screen">
        {/* TopNavBar */}
        <header className="flex justify-between items-center w-full px-6 py-3 bg-surface/70 backdrop-blur-[20px] dark:bg-slate-900/70 text-primary-container dark:text-blue-400 font-headline text-sm tracking-tight sticky top-0 z-40 shadow-[0_2px_12px_-2px_rgba(0,35,111,0.05)] border-none">
          {/* Mobile Menu Toggle & Brand */}
          <div className="flex items-center gap-4">
            <button className="md:hidden text-on-surface-variant p-2 rounded-full hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="text-xl font-extrabold tracking-tighter text-primary-container dark:text-white md:hidden">
              Scholarly Admin
            </div>
            {/* Search Bar */}
            <div className="hidden sm:flex items-center bg-surface-container-lowest rounded-full px-4 py-2 shadow-[0_2px_8px_-2px_rgba(0,35,111,0.05)] border border-outline-variant/10 focus-within:border-primary/20 focus-within:shadow-[0_4px_12px_-2px_rgba(0,35,111,0.08)] transition-all min-w-[280px]">
              <span className="material-symbols-outlined text-on-surface-variant mr-2">search</span>
              <input className="bg-transparent border-none outline-none text-sm w-full font-body text-on-surface placeholder:text-on-surface-variant/60 focus:ring-0" placeholder="Search students, courses..." type="text" />
            </div>
          </div>

          {/* Trailing Actions */}
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-surface-container-low dark:hover:bg-slate-800 transition-colors scale-95 duration-200 ease-in-out relative">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full border-2 border-surface-container-lowest"></span>
            </button>
            <button className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-surface-container-low dark:hover:bg-slate-800 transition-colors scale-95 duration-200 ease-in-out hidden sm:block">
              <span className="material-symbols-outlined">help_outline</span>
            </button>
            <div className="w-8 h-8 rounded-full ml-2 overflow-hidden border border-outline-variant/20 shadow-sm">
              <img alt="Administrator Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" data-alt="professional portrait headshot of an administrator in soft studio lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDAwKbH0aIL4IWnrRmSgvV-T1zY-iZ9g3vvSayMrf3zKTRs2YDu90bNYCDqmRDIy1V7MxxknH8iEIKZnSqc-wpPtp7GklcEQAILGB2QGCgPgaBUB09Vr2o3NNPXL_ShgIzMof2IhZ-kVrOvQexTScDa7zCL3rqT_jrt71OefgsN6lsoFFL0kDmshpoIP4bXcAJqTkHIt8O6XV6NQVqe9p728CqyBa9JjtU-Es_amvnc2dHadh1pim0Xon2o5DDEPOzgjFCJua_mKw" />
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6 md:p-8 flex-1 overflow-y-auto space-y-8 max-w-[1400px] mx-auto w-full">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight mb-1">Overview</h1>
              <p className="font-body text-sm text-on-surface-variant">Here's what's happening with Lumina Academy today.</p>
            </div>
            <div className="flex gap-3">
              <button className="bg-surface-container-lowest text-on-surface font-body font-medium text-sm py-2 px-4 rounded-full border border-outline-variant/15 hover:bg-surface-container-low transition-colors flex items-center gap-2 shadow-sm">
                <span className="material-symbols-outlined text-[18px]">download</span>
                Export Report
              </button>
            </div>
          </div>

          {/* KPI Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* KPI 1: Total Students (Hero Style) */}
            <div className="bg-[linear-gradient(135deg,#00236f_0%,#1e3a8a_100%)] rounded-[1.5rem] p-6 text-on-primary relative overflow-hidden flex flex-col justify-between min-h-[160px] shadow-[0_8px_32px_-8px_rgba(0,35,111,0.2)]">
              <div className="absolute top-0 right-0 p-4 opacity-20">
                <span className="material-symbols-outlined text-6xl">school</span>
              </div>
              <div className="relative z-10 flex justify-between items-start">
                <span className="font-body text-sm font-medium text-primary-fixed-dim">Total Students</span>
                <div className="bg-surface-container-lowest/20 rounded-full px-2.5 py-1 backdrop-blur-md flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-secondary-fixed">trending_up</span>
                  <span className="text-xs font-bold text-surface-container-lowest">+12.5%</span>
                </div>
              </div>
              <div className="relative z-10 mt-4">
                <div className="font-headline text-4xl font-extrabold tracking-tighter">14,209</div>
                <div className="text-xs text-primary-fixed mt-1">Across 42 active courses</div>
              </div>
            </div>

            {/* KPI 2: Active Instructors */}
            <div className="bg-surface-container-low rounded-[1.5rem] p-6 relative overflow-hidden flex flex-col justify-between min-h-[160px]">
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-surface-container-highest/50 to-transparent"></div>
              <div className="relative z-10 flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-on-surface-variant">record_voice_over</span>
                  </div>
                  <span className="font-body text-sm font-semibold text-on-surface-variant">Instructors</span>
                </div>
                <div className="flex items-center gap-1 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[14px]">trending_flat</span>
                  <span className="text-xs font-medium">0%</span>
                </div>
              </div>
              <div className="relative z-10 mt-4 flex items-end justify-between">
                <div className="font-headline text-3xl font-extrabold text-on-surface">342</div>
                <div className="flex -space-x-2">
                  <img alt="Inst 1" className="w-6 h-6 rounded-full border border-surface-container-lowest" referrerPolicy="no-referrer" data-alt="small circular portrait of a professional instructor" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAESqUM1FXjEVVdJpacaEHRk2AwF-ZlfyiWISnedd_JcB7ngvWMGxevMP5-gVIeEkjGlXKif1JJ5Los-Us1lLLJeNsJ23tWUar1zcaWZdJroxdyr7DUtK91XyONxKyFjTYSHmrbNqtl4_4YyHXtSvd9bFjrPM-dD9kpgKRz1atA6pM0TbrohBYDCPtFL8c_B5IDZ8_aqFM-PByUXGkKLFE9P7-9KNozeuA27fo5GhyTmK-RnPF5u87Iyc1TsEDjlm8qNbZ7x0puug" />
                  <img alt="Inst 2" className="w-6 h-6 rounded-full border border-surface-container-lowest" referrerPolicy="no-referrer" data-alt="small circular portrait of a professional instructor" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJ3jwtHdrl0ImI9ZcH_ejhUuIlTP-cmeV0tF2mBbqxv5C7bto6S4yGAQJ0ImArCRDEV9JTMmBzfFbcBTfou0YuCoK-CgTSEvbkGTaV1CUxUAeZEBoDxok6O6DEEEtkaKLS3jx4VZ_bWif1iykYOzgLD1Y2e0IzwU3cfMyJekA5Le3UGQi0KMdb5YsnycOQYJTH9lh1cO14egAp3l7qXs-KtCsYEvRIf6YPs8xNbI3HdiwTbcxrWyLCECFtEjMW2NWUr0D6dAfnuA" />
                  <div className="w-6 h-6 rounded-full bg-surface-container-highest border border-surface-container-lowest flex items-center justify-center text-[10px] font-bold text-on-surface-variant">+5</div>
                </div>
              </div>
            </div>

            {/* KPI 3: System Uptime */}
            <div className="bg-surface-container-low rounded-[1.5rem] p-6 relative overflow-hidden flex flex-col justify-between min-h-[160px]">
              <div className="relative z-10 flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary-container/30 text-on-secondary-container flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dns</span>
                  </div>
                  <span className="font-body text-sm font-semibold text-on-surface-variant">System Uptime</span>
                </div>
              </div>
              <div className="relative z-10 mt-4">
                <div className="font-headline text-3xl font-extrabold text-on-surface flex items-baseline gap-1">
                  99.98<span className="text-xl text-on-surface-variant">%</span>
                </div>
                <div className="w-full bg-surface-container-highest rounded-full h-1.5 mt-3 overflow-hidden">
                  <div className="bg-secondary h-1.5 rounded-full w-[99.98%]"></div>
                </div>
                <div className="text-xs text-on-surface-variant mt-2">Last 30 days</div>
              </div>
            </div>

            {/* KPI 4: Pending Tickets */}
            <div className="bg-surface-container-lowest rounded-[1.5rem] p-6 relative flex flex-col justify-between min-h-[160px] border border-outline-variant/10 shadow-[0_8px_32px_-8px_rgba(0,35,111,0.05)]">
              <div className="relative z-10 flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-tertiary-container/10 text-on-tertiary-container flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined">support</span>
                  </div>
                  <span className="font-body text-sm font-semibold text-on-surface-variant">Pending Support</span>
                </div>
                <div className="bg-error-container/50 text-on-error-container rounded-full px-2 py-0.5 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">warning</span>
                </div>
              </div>
              <div className="relative z-10 mt-4 flex items-end justify-between">
                <div>
                  <div className="font-headline text-3xl font-extrabold text-on-surface">48</div>
                  <div className="text-xs text-on-surface-variant mt-1">Needs attention</div>
                </div>
                <button className="text-primary font-bold text-sm hover:underline flex items-center gap-1">
                  View <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart Area: Engagement Trends */}
            <div className="lg:col-span-2 bg-surface-container-lowest rounded-[2rem] p-6 shadow-[0_8px_32px_-8px_rgba(0,35,111,0.03)] border border-outline-variant/5">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="font-headline text-xl font-bold text-on-surface">Engagement Trends</h2>
                  <p className="text-sm text-on-surface-variant font-body">Daily active users vs. completion rates</p>
                </div>
                <select className="bg-surface-container-low border-none text-sm font-medium rounded-full py-2 pl-4 pr-8 text-on-surface focus:ring-primary/20">
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                  <option>This Quarter</option>
                </select>
              </div>
              {/* Faux Chart Representation */}
              <div className="h-[280px] w-full relative flex items-end gap-2 pb-6">
                {/* Chart Grid Lines */}
                <div className="absolute inset-0 flex flex-col justify-between pb-6 opacity-10 pointer-events-none">
                  <div className="border-b border-on-surface-variant w-full h-0"></div>
                  <div className="border-b border-on-surface-variant w-full h-0"></div>
                  <div className="border-b border-on-surface-variant w-full h-0"></div>
                  <div className="border-b border-on-surface-variant w-full h-0"></div>
                </div>
                {/* Y-Axis Labels */}
                <div className="absolute left-0 inset-y-0 flex flex-col justify-between pb-6 text-[10px] text-on-surface-variant/60 -ml-1 pr-2 z-10 font-medium">
                  <span>10k</span><span>7.5k</span><span>5k</span><span>2.5k</span>
                </div>
                {/* Bars */}
                <div className="flex-1 flex items-end justify-center gap-1 group relative z-10 ml-6">
                  <div className="w-full bg-primary-container/20 rounded-t-sm h-[40%] transition-all group-hover:bg-primary-container/30"></div>
                  <div className="w-full bg-secondary/80 rounded-t-sm h-[30%] transition-all group-hover:bg-secondary"></div>
                  <span className="absolute -bottom-6 text-[10px] text-on-surface-variant font-medium">Mon</span>
                </div>
                <div className="flex-1 flex items-end justify-center gap-1 group relative z-10">
                  <div className="w-full bg-primary-container/20 rounded-t-sm h-[45%] transition-all group-hover:bg-primary-container/30"></div>
                  <div className="w-full bg-secondary/80 rounded-t-sm h-[35%] transition-all group-hover:bg-secondary"></div>
                  <span className="absolute -bottom-6 text-[10px] text-on-surface-variant font-medium">Tue</span>
                </div>
                <div className="flex-1 flex items-end justify-center gap-1 group relative z-10">
                  <div className="w-full bg-primary-container/20 rounded-t-sm h-[60%] transition-all group-hover:bg-primary-container/30"></div>
                  <div className="w-full bg-secondary/80 rounded-t-sm h-[50%] transition-all group-hover:bg-secondary"></div>
                  <span className="absolute -bottom-6 text-[10px] text-on-surface-variant font-medium">Wed</span>
                </div>
                <div className="flex-1 flex items-end justify-center gap-1 group relative z-10">
                  <div className="w-full bg-primary-container/20 rounded-t-sm h-[55%] transition-all group-hover:bg-primary-container/30"></div>
                  <div className="w-full bg-secondary/80 rounded-t-sm h-[65%] transition-all group-hover:bg-secondary"></div>
                  <span className="absolute -bottom-6 text-[10px] text-on-surface-variant font-medium">Thu</span>
                </div>
                <div className="flex-1 flex items-end justify-center gap-1 group relative z-10">
                  <div className="w-full bg-primary-container/20 rounded-t-sm h-[75%] transition-all group-hover:bg-primary-container/30"></div>
                  <div className="w-full bg-secondary/80 rounded-t-sm h-[60%] transition-all group-hover:bg-secondary"></div>
                  <span className="absolute -bottom-6 text-[10px] text-on-surface-variant font-medium">Fri</span>
                </div>
                <div className="flex-1 flex items-end justify-center gap-1 group relative z-10">
                  <div className="w-full bg-primary-container/20 rounded-t-sm h-[40%] transition-all group-hover:bg-primary-container/30"></div>
                  <div className="w-full bg-secondary/80 rounded-t-sm h-[30%] transition-all group-hover:bg-secondary"></div>
                  <span className="absolute -bottom-6 text-[10px] text-on-surface-variant font-medium">Sat</span>
                </div>
                <div className="flex-1 flex items-end justify-center gap-1 group relative z-10">
                  <div className="w-full bg-primary-container/20 rounded-t-sm h-[35%] transition-all group-hover:bg-primary-container/30"></div>
                  <div className="w-full bg-secondary/80 rounded-t-sm h-[45%] transition-all group-hover:bg-secondary"></div>
                  <span className="absolute -bottom-6 text-[10px] text-on-surface-variant font-medium">Sun</span>
                </div>
              </div>
              <div className="flex justify-center gap-6 mt-4 pt-4 border-t border-surface-container-high/50">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary-container/30"></div>
                  <span className="text-xs font-medium text-on-surface-variant">Active Users</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-secondary"></div>
                  <span className="text-xs font-medium text-on-surface-variant">Course Completions</span>
                </div>
              </div>
            </div>

            {/* Recent Activity List */}
            <div className="bg-surface-container-low rounded-[2rem] p-1 flex flex-col">
              <div className="bg-surface-container-lowest rounded-[calc(2rem-4px)] p-6 h-full flex flex-col shadow-[0_8px_32px_-8px_rgba(0,35,111,0.02)]">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-headline text-xl font-bold text-on-surface">Recent Activity</h2>
                  <button className="text-primary font-medium text-sm hover:underline">View All</button>
                </div>
                <div className="space-y-5 flex-1">
                  {/* Activity Item 1 */}
                  <div className="flex gap-4 items-start group">
                    <div className="w-10 h-10 rounded-full bg-secondary-container/20 text-on-secondary-container flex items-center justify-center shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-[20px]">assignment_turned_in</span>
                    </div>
                    <div>
                      <p className="text-sm text-on-surface font-medium leading-snug">New course "Advanced Data Structures" published</p>
                      <p className="text-xs text-on-surface-variant mt-1">By Dr. Alan Turing • 2 hours ago</p>
                    </div>
                  </div>
                  {/* Activity Item 2 */}
                  <div className="flex gap-4 items-start group">
                    <div className="w-10 h-10 rounded-full bg-error-container/20 text-on-error-container flex items-center justify-center shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-[20px]">report</span>
                    </div>
                    <div>
                      <p className="text-sm text-on-surface font-medium leading-snug">Server load spike detected on Node-04</p>
                      <p className="text-xs text-on-surface-variant mt-1">System Alert • 4 hours ago</p>
                    </div>
                  </div>
                  {/* Activity Item 3 */}
                  <div className="flex gap-4 items-start group">
                    <div className="w-10 h-10 rounded-full bg-primary-container/10 text-primary-container flex items-center justify-center shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-[20px]">person_add</span>
                    </div>
                    <div>
                      <p className="text-sm text-on-surface font-medium leading-snug">500+ new student registrations</p>
                      <p className="text-xs text-on-surface-variant mt-1">Admissions • 1 day ago</p>
                    </div>
                  </div>
                  {/* Activity Item 4 */}
                  <div className="flex gap-4 items-start group">
                    <div className="w-10 h-10 rounded-full bg-tertiary-container/10 text-on-tertiary-container flex items-center justify-center shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-[20px]">payment</span>
                    </div>
                    <div>
                      <p className="text-sm text-on-surface font-medium leading-snug">Subscription batch processing completed</p>
                      <p className="text-xs text-on-surface-variant mt-1">Billing • 1 day ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
