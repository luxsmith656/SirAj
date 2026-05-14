import React, { useState, useEffect } from 'react';
import InstructorLayout from '../components/InstructorLayout';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Users, BookOpen, BrainCircuit, Activity } from 'lucide-react';
import { motion } from 'motion/react';
import { addDoc, collection, serverTimestamp, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function InstructorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    questions: 1248,
    activeStudents: 0,
    aiDrafts: 0,
  });
  const [classes, setClasses] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    
    // Fetch classes and students
    const qClasses = query(collection(db, 'classes'), where('instructorId', '==', user.uid));
    const unsubClasses = onSnapshot(qClasses, async (s) => {
      const classDataPromises = s.docs.map(async (d) => {
          const classData = {id: d.id, ...d.data()};
          const qEnrollments = query(collection(db, 'classEnrollments'), where('classId', '==', d.id));
          const eSnap = await getDocs(qEnrollments);
          return { ...classData, studentCount: eSnap.size };
      });
      const classData = await Promise.all(classDataPromises);
      setClasses(classData);
      
      // Calculate total students
      const totalStudents = classData.reduce((acc, cls) => acc + (cls.studentCount || 0), 0);
      setStats(prev => ({ ...prev, activeStudents: totalStudents }));
    });
    
    return unsubClasses;
  }, [user]);
  
  const handleAIDraft = async () => {
    const topic = prompt('Enter topic:');
    const difficulty = prompt('Enter difficulty (easy/medium/hard):');
    if (topic && difficulty) {
      try {
        const res = await fetch('/api/draft-questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic, difficulty })
        });
        const data = await res.json();
        
        await addDoc(collection(db, 'aiDrafts'), {
          topic,
          difficulty,
          questions: data.questions,
          instructorId: user?.uid,
          createdAt: serverTimestamp()
        });
        alert('Draft saved to AI Drafts!');
      } catch (e) {
        console.error(e);
        alert('Error generating questions.');
      }
    }
  };

  return (
    <InstructorLayout title="Instructor Dashboard">
      <div className="p-8 max-w-6xl mx-auto w-full text-on-surface">
        <h2 className="text-4xl font-extrabold text-primary font-headline tracking-tight mb-2">
           Welcome back, Instructor {user?.fullName?.split(' ')[0] || ''}
        </h2>
        <p className="text-on-surface-variant/60 font-medium mb-8">Manage course content, AI-drafted material, and student progress.</p>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { title: 'Questions Curated', value: '1,248', icon: BookOpen, color: 'text-primary', bg: 'bg-primary/10' },
            { title: 'Active Students', value: stats.activeStudents.toString(), icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            { title: 'AI Drafts Pending', value: stats.aiDrafts.toString(), icon: BrainCircuit, color: 'text-amber-500', bg: 'bg-amber-500/10' },
            { title: 'Pass Rate Est.', value: '84%', icon: Activity, color: 'text-indigo-500', bg: 'bg-indigo-500/10' }
          ].map((stat, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={i} 
              className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm flex items-center gap-4"
            >
               <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${stat.bg} ${stat.color}`}>
                 <stat.icon size={24} />
               </div>
               <div>
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant/40 mb-1">{stat.title}</h3>
                  <p className="text-2xl font-black text-on-surface">{stat.value}</p>
               </div>
            </motion.div>
          ))}
        </div>

        {/* Content Management Blocks */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold font-headline text-on-surface flex items-center gap-2">
                   <BookOpen className="text-primary" /> Content Bank
                </h3>
                <button onClick={() => navigate('/instructor/questions')} className="text-primary text-xs font-bold uppercase tracking-widest hover:underline">View All</button>
              </div>
              <p className="text-sm text-on-surface-variant/60 font-medium mb-6">Create, edit and organize multiple-choice questions for the offline student reviewer.</p>
              <div className="flex gap-4">
                 <button onClick={() => navigate('/instructor/question/new')} className="bg-primary text-on-primary px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
                    + Prepare New Question
                 </button>
                 <button onClick={() => navigate('/instructor/bulk-upload')} className="bg-surface-container text-on-surface-variant px-6 py-3 rounded-xl font-bold text-sm border border-outline-variant/50 hover:bg-surface-container/80 transition-all flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">upload_file</span> Bulk Upload
                 </button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-500 to-primary p-8 rounded-2xl border border-indigo-400/50 shadow-sm text-white">
              <div className="flex items-start justify-between">
                <div>
                   <h3 className="text-xl font-bold font-headline mb-2 flex items-center gap-2 text-white">
                     <BrainCircuit className="text-indigo-200" /> AI Question Drafter
                   </h3>
                   <p className="text-indigo-100 text-sm font-medium mb-6 max-w-md">Use Gemini AI to instantly draft question variants based on current LET standards and domains.</p>
                   <button onClick={handleAIDraft} className="bg-white text-primary px-6 py-3 rounded-xl font-bold text-sm shadow-md hover:bg-white/90 transition-all hover:scale-[1.02] active:scale-[0.98]">
                      Open AI Assistant
                   </button>
                </div>
                <div className="hidden md:block w-32 h-32 opacity-20">
                   <BrainCircuit size={128} className="text-white" />
                </div>
              </div>
            </div>

          </div>

          <div className="space-y-6">
             <div className="bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold font-headline text-on-surface flex items-center gap-2">
                     <Activity className="text-emerald-500" /> Class Monitor
                  </h3>
                </div>
                <div className="space-y-4">
                  {classes.map((cls, idx) => (
                    <div key={idx} className="bg-surface-container/30 p-4 rounded-xl border border-outline-variant/10 flex justify-between items-center">
                       <div>
                         <p className="font-bold text-on-surface text-sm">{cls.className}</p>
                         <p className="text-xs text-on-surface-variant/40 font-medium">{cls.studentCount || 0} students</p>
                       </div>
                       <div className="text-right">
                         <p className={`font-black text-lg ${76 >= 75 ? 'text-emerald-500' : 'text-error'}`}>{76}%</p>
                         <p className="text-[9px] uppercase tracking-widest font-bold text-on-surface-variant/40">Avg</p>
                       </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 text-primary text-xs font-bold uppercase tracking-widest hover:bg-surface-container py-3 rounded-xl transition-all">View Analytics</button>
             </div>
          </div>
        </div>
      </div>
    </InstructorLayout>
  );
}
