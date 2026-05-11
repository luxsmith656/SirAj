import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

type Role = 'admin' | 'client' | null;

interface UserProfile {
  email: string;
  role: Role;
  uid: string;
}

interface AuthContextType {
  user: UserProfile | null;
  signIn: (email: string, role: Role) => void; // Keep for transitions
  signOut: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const isAdminEmail = firebaseUser.email === 'castanar656@gmail.com';
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data() as UserProfile;
          // Force upgrade to admin if email matches
          if (isAdminEmail && userData.role !== 'admin') {
            try {
              await updateDoc(doc(db, 'users', firebaseUser.uid), { role: 'admin' });
              setUser({ ...userData, uid: firebaseUser.uid, role: 'admin' });
            } catch (err) {
              console.error('Failed to upgrade user role:', err);
              setUser({ ...userData, uid: firebaseUser.uid });
            }
          } else {
            setUser({ ...userData, uid: firebaseUser.uid });
          }
        } else {
          // Default role for new users
          const newUser: UserProfile = {
            email: firebaseUser.email || '',
            role: isAdminEmail ? 'admin' : 'client',
            uid: firebaseUser.uid
          };
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

  const signIn = (email: string, role: Role) => {
    // This is now handled by Firebase Auth flows, 
    // but we can leave it as a mock or remove it.
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, isLoading }}>
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
