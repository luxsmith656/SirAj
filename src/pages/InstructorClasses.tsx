import React, { useState, useEffect } from 'react';
import InstructorLayout from '../components/InstructorLayout';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Users, Plus, Copy, Search, ArrowRight, Settings } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export default function InstructorClasses() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewDetailsId, setViewDetailsId] = useState<string | null>(null);

  // New class form
  const [newClass, setNewClass] = useState({
    className: '',
    description: '',
    focus: 'general_education',
    specializationName: ''
  });

  const generateClassCode = () => {
    return 'LM-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const loadClasses = async () => {
    if (!user) return;
    try {
      const q = query(collection(db, 'classes'), where('instructorId', '==', user.uid), where('status', '==', 'active'));
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({id: d.id, ...d.data()}));
      setClasses(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, [user]);

  const handleCreate = async () => {
    if (!user || !newClass.className) return;
    try {
      setLoading(true);
      const classRef = doc(collection(db, 'classes'));
      const code = generateClassCode();
      const payload = {
        classId: classRef.id,
        className: newClass.className,
        description: newClass.description,
        instructorId: user.uid,
        instructorName: user.fullName || user.email,
        classCode: code,
        inviteLink: `${window.location.origin}/join/${code}`,
        focus: newClass.focus,
        specializationName: newClass.specializationName,
        assignedModuleIds: [],
        assignedQuestionSetIds: [],
        studentCount: 0,
        status: 'active',
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      await setDoc(classRef, payload);
      setShowCreateModal(false);
      setNewClass({ className: '', description: '', focus: 'general_education', specializationName: '' });
      await loadClasses();
    } catch (e) {
      console.error(e);
      alert('Failed to create class');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    alert('Invite link copied!');
  };

  return (
    <InstructorLayout title="Class Management">
      <div className="p-8 max-w-6xl mx-auto w-full text-on-surface">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-[#1b366a] font-headline tracking-tight">My Classes</h2>
            <p className="text-slate-500 font-medium">Manage your enrolled students and class curriculum.</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-[#1b366a] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#112349] transition-all shadow-md"
          >
            <Plus size={20} /> Create Class
          </button>
        </div>

        {loading ? (
          <div className="text-center p-12 text-slate-500 font-bold">Loading classes...</div>
        ) : classes.length === 0 ? (
           <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-sm text-center">
             <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users size={40} />
             </div>
             <h3 className="text-xl font-bold text-slate-800 mb-2">No Classes Yet</h3>
             <p className="text-slate-500 mb-8 max-w-sm mx-auto">Create your first class to generate an invite code and start enrolling students.</p>
             <button 
               onClick={() => setShowCreateModal(true)}
               className="bg-[#1b366a] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md inline-flex"
             >
               Create Class
             </button>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map(cls => (
               <div key={cls.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group">
                 <div className="p-6 border-b border-slate-100 flex-1">
                   <div className="flex justify-between items-start mb-4">
                     <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest">{cls.focus.replace('_', ' ')}</div>
                     <button className="text-slate-300 hover:text-slate-600 transition-colors"><Settings size={18} /></button>
                   </div>
                   <h3 className="font-bold text-xl text-slate-800 mb-1">{cls.className}</h3>
                   <p className="text-sm text-slate-500 mb-6 line-clamp-2">{cls.description || 'No description provided.'}</p>
                   
                   <div className="flex items-center justify-between text-sm">
                     <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                       <Users size={16} className="text-slate-400" />
                       {cls.studentCount} Enrolled
                     </span>
                   </div>
                 </div>
                 <div className="bg-slate-50 p-4 flex items-center justify-between">
                   <div className="flex flex-col">
                     <span className="text-[10px] font-bold uppercase text-slate-400 tracking-widest leading-none mb-1">Class Code</span>
                     <span className="font-mono font-bold text-slate-800 text-lg leading-none">{cls.classCode}</span>
                   </div>
                   <button 
                     onClick={() => handleCopyLink(cls.inviteLink)}
                     className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm flex items-center gap-2"
                     title="Copy Invite Link"
                   >
                     <Copy size={16} /> <span className="text-xs font-bold sm:hidden md:inline">Link</span>
                   </button>
                 </div>
               </div>
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-slate-100"
          >
            <h3 className="text-2xl font-extrabold text-slate-800 mb-2">Create New Class</h3>
            <p className="text-slate-500 text-sm font-medium mb-6">Fill in the details to setup your virtual classroom.</p>
            
            <div className="space-y-4 mb-8">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Class Name</label>
                <input 
                  type="text" 
                  value={newClass.className}
                  onChange={e => setNewClass({...newClass, className: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:bg-white focus:border-blue-300 outline-none transition-all"
                  placeholder="e.g. LET Professional Ed 2026 Cohort"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Description</label>
                <textarea 
                  value={newClass.description}
                  onChange={e => setNewClass({...newClass, description: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-blue-300 outline-none transition-all resize-none h-24"
                  placeholder="Optional class description..."
                ></textarea>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Primary Focus</label>
                <select 
                  value={newClass.focus}
                  onChange={e => setNewClass({...newClass, focus: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:bg-white focus:border-blue-300 outline-none transition-all"
                >
                  <option value="general_education">General Education</option>
                  <option value="professional_education">Professional Education</option>
                  <option value="major_specialization">Major / Specialization</option>
                  <option value="full_let_review">Full LET Review</option>
                </select>
              </div>
              {newClass.focus === 'major_specialization' && (
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Specialization Name</label>
                  <input 
                    type="text" 
                    value={newClass.specializationName}
                    onChange={e => setNewClass({...newClass, specializationName: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:bg-white focus:border-blue-300 outline-none transition-all"
                    placeholder="e.g. Major in English"
                  />
                </div>
              )}
            </div>
            
            <div className="flex gap-3">
               <button 
                 onClick={() => setShowCreateModal(false)}
                 className="flex-1 font-bold text-slate-500 py-3 hover:bg-slate-50 rounded-xl transition-colors"
               >
                 Cancel
               </button>
               <button 
                 onClick={handleCreate}
                 disabled={!newClass.className}
                 className="flex-[2] bg-[#1b366a] text-white font-bold py-3 rounded-xl shadow-lg hover:bg-[#112349] transition-all disabled:opacity-50"
               >
                 Create Class
               </button>
            </div>
          </motion.div>
        </div>
      )}
    </InstructorLayout>
  );
}
