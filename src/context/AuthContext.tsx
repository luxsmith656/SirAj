import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

type Role = 'admin' | 'instructor' | 'student' | null;

interface UserProfile {
  email: string;
  role: Role;
  uid: string;
  fullName?: string;
  age?: number;
  instructorId?: string;
  onboarded?: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  signOut: () => void;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    if (auth.currentUser) {
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserProfile;
        const isAdminEmail = auth.currentUser.email === 'castanar656@gmail.com';
        const currentRole = isAdminEmail ? 'admin' : userData.role;
        setUser({ ...userData, uid: auth.currentUser.uid, role: currentRole || 'student' });
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const isAdminEmail = firebaseUser.email === 'castanar656@gmail.com';
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data() as UserProfile;
          const currentRole = isAdminEmail ? 'admin' : userData.role;
          
          setUser({ ...userData, uid: firebaseUser.uid, role: (currentRole as Role) || 'student' });

          if (isAdminEmail && userData.role !== 'admin') {
            updateDoc(doc(db, 'users', firebaseUser.uid), { role: 'admin' })
              .catch(err => console.error('Silent role upgrade failed:', err));
          }
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

          const pendingDataStr = localStorage.getItem('pendingRegistrationData');
          let pendingData: any = {};
          if (pendingDataStr) {
            try {
              pendingData = JSON.parse(pendingDataStr);
              localStorage.removeItem('pendingRegistrationData');
            } catch (e) {
              console.error('Failed to parse pending registration data', e);
            }
          }

          const newUser: UserProfile = {
            email: firebaseUser.email || '',
            role: isAdminEmail ? 'admin' : (existingData.role || 'student'),
            uid: firebaseUser.uid,
            onboarded: existingData.onboarded ?? (pendingData.fullName && pendingData.age ? false : false), 
            fullName: pendingData.fullName || existingData.fullName || '',
            age: pendingData.age ? parseInt(pendingData.age) : (existingData.age || undefined),
            instructorId: existingData.instructorId || null
          } as any;
          
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

  return (
    <AuthContext.Provider value={{ user, signOut, isLoading, refreshUser }}>
      {children}
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
