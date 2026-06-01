import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile, Role } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Sparkles, Trophy } from 'lucide-react';

interface AuthContextType {
  user: UserProfile | null;
  signOut: () => void;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
  recordActivity: () => Promise<{ incremented: boolean; streak: number; reset: boolean } | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [streakCelebration, setStreakCelebration] = useState<{
    show: boolean;
    streak: number;
    incremented: boolean;
    isReset: boolean;
  } | null>(null);

  const getLocalDateStr = () => {
    const date = new Date();
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
  };

  const getYesterdayStr = () => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
  };

  const refreshUser = async () => {
    if (auth.currentUser) {
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserProfile;
        setUser({ ...userData, uid: auth.currentUser.uid, role: userData.role || 'student' });
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data() as UserProfile;
          
          let newStreak = userData.streak || 0;
          const todayStr = getLocalDateStr();
          const yesterdayStr = getYesterdayStr();

          // Duolingo System: If they did not learn yesterday, streak drops to 0!
          // We only reset if they haven't been active today OR yesterday
          const lastActive = userData.lastActiveDate || userData.lastLoginDate || '';
          if (lastActive && lastActive !== todayStr && lastActive !== yesterdayStr) {
             newStreak = 0;
             updateDoc(doc(db, 'users', firebaseUser.uid), {
                streak: 0,
                updatedAt: new Date().toISOString()
             }).catch(err => console.error('Failed to reset streak:', err));
             userData.streak = 0;
          }
          
          let role = (userData.role as Role) || 'student';
          if (firebaseUser.email === 'castanar656@gmail.com') {
            role = 'admin';
          }

          setUser({ ...userData, uid: firebaseUser.uid, role });
        } else {
          // Check if a profile with this email already exists (from seeding)
          const { collection, query, where, getDocs, deleteDoc } = await import('firebase/firestore');
          const emailQuery = query(collection(db, 'users'), where('email', '==', firebaseUser.email));
          const emailSnap = await getDocs(emailQuery);
          
          let existingData: any = {};
          if (!emailSnap.empty) {
            // Claim this profile
            const seedDoc = emailSnap.docs[0];
            existingData = seedDoc.data();
            // Delete the seeded doc with the wrong ID
            await deleteDoc(seedDoc.ref);
          }

          let pendingDataStr = null;
          try {
            pendingDataStr = localStorage.getItem('pendingRegistrationData');
          } catch(e) { console.warn(e); }
          
          let pendingData: any = {};
          if (pendingDataStr) {
            try {
              pendingData = JSON.parse(pendingDataStr);
            } catch (e) {
              console.error('Failed to parse pending registration data', e);
            }
            try {
              localStorage.removeItem('pendingRegistrationData');
            } catch(e) { console.warn(e); }
          }

          const newUser: UserProfile = {
            email: firebaseUser.email || '',
            role: (firebaseUser.email === 'castanar656@gmail.com' ? 'admin' : (existingData.role || 'student')),
            uid: firebaseUser.uid,
            onboarded: existingData.onboarded ?? false, 
            fullName: pendingData.fullName || existingData.fullName || '',
            instructorId: existingData.instructorId || null,
            streak: 1,
            lastLoginDate: new Date().toISOString().split('T')[0],
            earnedBadges: existingData.earnedBadges || [],
            xp: existingData.xp || 0,
            level: existingData.level || 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            diagnosticCompleted: existingData.diagnosticCompleted || false,
          };
          
          if (pendingData.age) {
            const parsedAge = parseInt(pendingData.age);
            if (!isNaN(parsedAge)) newUser.age = parsedAge;
          } else if (existingData.age) {
            newUser.age = existingData.age;
          }

          await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
          setUser(newUser);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
  };

  const recordActivity = async () => {
    if (!auth.currentUser || !user) return null;
    
    const todayStr = getLocalDateStr();
    const yesterdayStr = getYesterdayStr();
    
    const lastActive = user.lastActiveDate || user.lastLoginDate || '';
    const currentHistory = (user as any).streakHistory || [];
    let currentStreak = user.streak || 0;
    
    if (lastActive === todayStr) {
      // Already active today! But make sure today is in history if somehow missing
      if (!currentHistory.includes(todayStr)) {
        const newHistory = [...currentHistory, todayStr];
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          streakHistory: newHistory
        });
        const updatedUser = { ...user, streakHistory: newHistory } as any;
        setUser(updatedUser);
      }
      return { incremented: false, streak: currentStreak, reset: false };
    }
    
    let newStreak = 1;
    let isReset = false;
    let incremented = true;

    if (lastActive === yesterdayStr) {
      newStreak = currentStreak + 1;
    } else {
      isReset = true;
      // If they missed a day, new streak is 1
      newStreak = 1;
    }
    
    const newHistory = [...currentHistory, todayStr];
    
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        streak: newStreak,
        lastActiveDate: todayStr,
        streakHistory: newHistory,
        updatedAt: new Date().toISOString()
      });
    } catch(err) {
      console.error('Failed to save streak update:', err);
    }
    
    const updatedUser = { ...user, streak: newStreak, lastActiveDate: todayStr, streakHistory: newHistory };
    setUser(updatedUser as any);
    
    // Trigger celebration dialog
    setStreakCelebration({
      show: true,
      streak: newStreak,
      incremented,
      isReset
    });
    
    return { incremented, streak: newStreak, reset: isReset };
  };

  return (
    <AuthContext.Provider value={{ user, signOut, isLoading, refreshUser, recordActivity }}>
      {children}
      
      {/* Duolingo-style Streak Celebration */}
      <AnimatePresence>
        {streakCelebration?.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 15 }}
              className="bg-white rounded-[40px] p-10 max-w-sm w-full border-4 border-orange-100 shadow-[0_32px_64px_-16px_rgba(249,115,22,0.3)] text-center relative overflow-hidden"
            >
              {/* Confetti particles effect (simplified) */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ y: 200, x: 0, opacity: 0 }}
                    animate={{ 
                      y: -100, 
                      x: (i - 6) * 40, 
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0.5]
                    }}
                    transition={{ duration: 2, delay: i * 0.1, repeat: Infinity }}
                    className="absolute bottom-0 left-1/2"
                  >
                    <Sparkles size={16} className="text-orange-400" />
                  </motion.div>
                ))}
              </div>

              {/* Big Animated Flame */}
              <motion.div 
                animate={{ 
                  scale: [1, 1.1, 1],
                  filter: ['drop-shadow(0 0 10px rgba(249,115,22,0.4))', 'drop-shadow(0 0 20px rgba(249,115,22,0.6))', 'drop-shadow(0 0 10px rgba(249,115,22,0.4))']
                }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="w-32 h-32 bg-orange-500 rounded-full mx-auto mb-8 flex items-center justify-center relative shadow-inner"
              >
                <Flame size={64} fill="white" className="text-white" />
                <motion.div 
                   animate={{ opacity: [0, 1, 0], scale: [1, 1.5, 2] }}
                   transition={{ duration: 1.5, repeat: Infinity }}
                   className="absolute inset-0 rounded-full border-4 border-orange-400"
                />
              </motion.div>
              
              <h2 className="text-4xl font-black font-headline text-slate-950 tracking-tight leading-none mb-2">
                {streakCelebration.streak} DAY STREAK!
              </h2>
              
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 text-orange-600 mb-6">
                <Trophy size={14} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                  {streakCelebration.isReset ? "New Spark Ignited" : "Consistency King"}
                </span>
              </div>
              
              <p className="text-slate-500 text-sm font-medium leading-relaxed px-2 mb-8">
                {streakCelebration.isReset 
                  ? "You've started a fresh journey today. Practice every day to build your teaching mastery!"
                  : "Impressive work! You've protected your streak for another day. Keep the momentum high!"}
              </p>
              
              <button
                onClick={() => setStreakCelebration(null)}
                className="w-full bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-black text-xs uppercase tracking-[0.25em] py-5 rounded-3xl shadow-xl shadow-orange-500/30 transition-all flex items-center justify-center gap-3"
              >
                Continue Mission
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
