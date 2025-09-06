
"use client"

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser, signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { getFirebaseAuth, getFirebaseDb } from '@/lib/firebase';
import type { Player } from '@/types';

interface AuthContextType {
  user: Player | null;
  loading: boolean;
  isGuest: boolean;
  setGuest: (isGuest: boolean) => void;
}

export const AuthContext = createContext<AuthContextType>({ user: null, loading: true, isGuest: false, setGuest: () => {} });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  
  useEffect(() => {
    // Firebase initialization is now deferred to the browser,
    // so we get the instances inside useEffect.
    const auth = getFirebaseAuth();
    if (!auth) {
      // If auth is not available (e.g., on server), we can't do anything.
      setLoading(false);
      return;
    }
    
    const db = getFirebaseDb();
    
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      setIsGuest(false); // Reset guest state on auth change
      if (firebaseUser) {
        const userDocRef = doc(db, 'players', firebaseUser.uid);
        
        const unsubscribeSnapshot = onSnapshot(userDocRef, (docSnapshot) => {
          if (docSnapshot.exists()) {
            const playerData = docSnapshot.data();
            setUser({
              id: firebaseUser.uid,
              name: playerData.name || '',
              email: playerData.email || '',
              score: playerData.score,
            });
          } else {
            // This case might happen if doc creation is delayed
            setUser({
              id: firebaseUser.uid,
              name: firebaseUser.displayName || '',
              email: firebaseUser.email || '',
              score: 0,
            });
          }
          setLoading(false);
        }, (error) => {
          console.error("Error on snapshot:", error);
          setLoading(false);
        });

        // Return the snapshot listener's unsubscribe function to be called on cleanup
        return () => unsubscribeSnapshot();
      } else {
        setUser(null);
        setLoading(false);
      }
    }, (error) => {
      console.error("Error on auth state change:", error);
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  const setGuest = (isGuest: boolean) => {
    if (isGuest) {
      const auth = getFirebaseAuth();
      if(auth && auth.currentUser) {
        signOut(auth);
      }
      setUser(null);
    }
    setIsGuest(isGuest);
  }

  return (
    <AuthContext.Provider value={{ user, loading, isGuest, setGuest }}>
      {children}
    </AuthContext.Provider>
  );
};
