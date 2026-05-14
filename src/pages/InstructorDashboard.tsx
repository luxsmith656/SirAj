import React from 'react';
import InstructorLayout from '../components/InstructorLayout';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Users, BookOpen, BrainCircuit, Activity } from 'lucide-react';
import { motion } from 'motion/react';

export default function InstructorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <InstructorLayout title="Instructor Dashboard">
      <div className="p-8 max-w-6xl mx-auto w-full text-on-surface">
        <h2 className="text-4xl font-extrabold text-[#1b366a] font-headline tracking-tight mb-2">
           Welcome back, Instructor {user?.fullName?.split(' ')[0] || ''}
        </h2>
        <p className="text-slate-500 font-medium mb-8">Manage course content, AI-drafted material, and student progress.</p>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { title: 'Questions Curated', value: '1,248', icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-50' },
            { title: 'Active Students', value: '432', icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-50' },
            { title: 'AI Drafts Pending', value: '14', icon: BrainCircuit, color: 'text-amber-500', bg: 'bg-amber-50' },
            { title: 'Pass Rate Est.', value: '84%', icon: Activity, color: 'text-indigo-500', bg: 'bg-indigo-50' }
          ].map((stat, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={i} 
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4"
            >
               <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${stat.bg} ${stat.color}`}>
                 <stat.icon size={24} />
               </div>
               <div>
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">{stat.title}</h3>
                  <p className="text-2xl font-black text-slate-800">{stat.value}</p>
               </div>
            </motion.div>
          ))}
        </div>

        {/* Content Management Blocks */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold font-headline text-slate-800 flex items-center gap-2">
                   <BookOpen className="text-blue-600" /> Content Bank
                </h3>
                <button onClick={() => navigate('/instructor/questions')} className="text-blue-600 text-xs font-bold uppercase tracking-widest hover:underline">View All</button>
              </div>
              <p className="text-sm text-slate-500 font-medium mb-6">Create, edit and organize multiple-choice questions for the offline student reviewer.</p>
              <div className="flex gap-4">
                 <button onClick={() => navigate('/instructor/question/new')} className="bg-[#1b366a] text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all">
                    + Prepare New Question
                 </button>
                 <button onClick={() => navigate('/instructor/bulk-upload')} className="bg-slate-50 text-slate-600 px-6 py-3 rounded-xl font-bold text-sm border border-slate-100 hover:bg-slate-100 transition-all flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">upload_file</span> Bulk Upload
                 </button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-500 to-[#1b366a] p-8 rounded-2xl border border-indigo-400 shadow-sm text-white">
              <div className="flex items-start justify-between">
                <div>
                   <h3 className="text-xl font-bold font-headline mb-2 flex items-center gap-2">
                     <BrainCircuit className="text-indigo-200" /> AI Question Drafter
                   </h3>
                   <p className="text-indigo-100 text-sm font-medium mb-6 max-w-md">Use Gemini AI to instantly draft question variants based on current LET standards and domains.</p>
                   <button onClick={() => navigate('/instructor/ai-drafts')} className="bg-white text-[#1b366a] px-6 py-3 rounded-xl font-bold text-sm shadow-md hover:bg-white/90 transition-all">
                      Open AI Assistant
                   </button>
                </div>
                <div className="hidden md:block w-32 h-32 opacity-20">
                   <BrainCircuit size={128} />
                </div>
              </div>
            </div>

          </div>

          <div className="space-y-6">
             <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold font-headline text-slate-800 flex items-center gap-2">
                     <Activity className="text-emerald-500" /> Class Monitor
                  </h3>
                </div>
                <div className="space-y-4">
                  {[
                    { name: 'LEPT Cohort A', score: 82, students: 120 },
                    { name: 'Self-Study Batch 3', score: 76, students: 84 },
                    { name: 'Remedial Group', score: 58, students: 28 },
                  ].map((cls, idx) => (
                    <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between items-center">
                       <div>
                         <p className="font-bold text-slate-800 text-sm">{cls.name}</p>
                         <p className="text-xs text-slate-400 font-medium">{cls.students} students</p>
                       </div>
                       <div className="text-right">
                         <p className={`font-black text-lg ${cls.score >= 75 ? 'text-emerald-600' : 'text-red-500'}`}>{cls.score}%</p>
                         <p className="text-[9px] uppercase tracking-widest font-bold text-slate-400">Avg</p>
                       </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 text-[#1b366a] text-xs font-bold uppercase tracking-widest hover:bg-slate-50 py-3 rounded-xl transition-all">View Analytics</button>
             </div>
          </div>
        </div>
      </div>
    </InstructorLayout>
  );
}
