import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ArrowLeft, Check, Users, Search } from 'lucide-react';
import Toast from '../components/Toast';

export default function JoinClass() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const { classCodeFromUrl } = useParams<{ classCodeFromUrl: string }>();
  
  const [code, setCode] = useState(classCodeFromUrl || '');
  const [loading, setLoading] = useState(false);
  const [classInfo, setClassInfo] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (classCodeFromUrl) {
      handleSearch(classCodeFromUrl);
    }
  }, [classCodeFromUrl]);

  const handleSearch = async (searchCode: string = code) => {
    if (!searchCode.trim()) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const q = query(collection(db, 'classes'), where('classCode', '==', searchCode.toUpperCase()), where('status', '==', 'active'));
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        setErrorMsg('Invalid class code or class is inactive.');
        setClassInfo(null);
      } else {
        const docSnap = snapshot.docs[0];
        setClassInfo({ id: docSnap.id, ...docSnap.data() });
      }
    } catch (e: any) {
      setErrorMsg(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!user || !classInfo) return;
    setJoining(true);
    setErrorMsg('');
    try {
      const enrollmentId = `${classInfo.id}_${user.uid}`;
      const enrollmentRef = doc(db, 'classEnrollments', enrollmentId);
      
      const { runTransaction, serverTimestamp } = await import('firebase/firestore');
      
      await runTransaction(db, async (transaction) => {
        const enrollmentSnap = await transaction.get(enrollmentRef);
        if (enrollmentSnap.exists()) {
           throw new Error('You are already enrolled in this class.');
        }

        const classRef = doc(db, 'classes', classInfo.id);
        const classSnap = await transaction.get(classRef);
        if (!classSnap.exists()) {
          throw new Error('Class no longer exists.');
        }

        const currentCount = classSnap.data().studentCount || 0;
        
        // Create enrollment
        transaction.set(enrollmentRef, {
          id: enrollmentId,
          classId: classInfo.id,
          studentId: user.uid,
          instructorId: classInfo.instructorId,
          joinedAt: serverTimestamp(),
          status: 'active',
          focus: classInfo.focus,
          diagnosticCompleted: user.diagnosticCompleted || false
        });

        // Update class student count
        transaction.update(classRef, {
          studentCount: currentCount + 1,
          updatedAt: serverTimestamp()
        });

        // Update user profile
        const userRef = doc(db, 'users', user.uid);
        const currentClassIds = user.classIds || [];
        transaction.update(userRef, {
          learningMode: 'class_based',
          activeClassId: classInfo.id,
          instructorId: classInfo.instructorId,
          selectedFocus: classInfo.focus,
          onboardingStep: 2,
          classIds: currentClassIds.includes(classInfo.id) ? currentClassIds : [...currentClassIds, classInfo.id],
          updatedAt: serverTimestamp()
        });
      });

      await refreshUser();
      
      if (!user.diagnosticCompleted) {
        navigate('/diagnostic');
      } else {
        navigate('/student/dashboard');
      }
    } catch (e: any) {
      setErrorMsg(e.message);
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="bg-[#f0f2f5] min-h-screen text-slate-800 font-body py-12 px-6 flex flex-col items-center">
      <div className="max-w-md w-full">
        {!classCodeFromUrl && (
          <button onClick={() => navigate('/choose-learning-mode')} className="mb-6 flex items-center gap-2 text-slate-400 hover:text-slate-800 font-bold text-sm tracking-widest uppercase transition-colors">
            <ArrowLeft size={16} /> Back
          </button>
        )}
        
        <h1 className="text-3xl font-black font-headline text-slate-800 mb-2">Join a Class</h1>
        <p className="text-slate-500 font-medium mb-8">Enter the class code provided by your instructor.</p>

        {!classInfo ? (
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Class Code</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="e.g. LM-ABC123"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 font-mono font-bold text-lg focus:bg-white focus:border-blue-300 outline-none transition-all uppercase"
              />
              <button 
                onClick={() => handleSearch(code)}
                disabled={loading || !code.trim()}
                className="bg-[#1b366a] text-white px-6 rounded-xl hover:bg-[#112349] disabled:opacity-50 transition-colors flex justify-center items-center"
              >
                {loading ? <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"/> : <Search size={20} />}
              </button>
            </div>
            {errorMsg && <p className="text-red-500 text-sm font-bold mt-4">{errorMsg}</p>}
          </div>
        ) : (
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
              <Users size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-1">{classInfo.className}</h2>
            <p className="text-slate-500 font-medium mb-6">Instructor: <span className="font-bold text-slate-700">{classInfo.instructorName}</span></p>
            
            <div className="space-y-3 mb-8">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-3">
                 <div className="text-xs font-bold uppercase tracking-widest text-slate-400 w-20">Focus</div>
                 <div className="text-sm font-bold text-slate-700 capitalize">{classInfo.focus.replace('_', ' ')}</div>
              </div>
              {classInfo.specializationName && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-3">
                   <div className="text-xs font-bold uppercase tracking-widest text-slate-400 w-20">Spec</div>
                   <div className="text-sm font-bold text-slate-700">{classInfo.specializationName}</div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
               <button onClick={() => setClassInfo(null)} className="flex-1 py-4 font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
               <button 
                 onClick={handleJoin}
                 disabled={joining}
                 className="flex-[2] bg-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
               >
                 {joining ? <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"/> : <Check size={20} />}
                 Confirm Join
               </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
