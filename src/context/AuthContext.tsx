"use client"

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, User as FirebaseUser, signOut } from 'firebase/auth';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
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
  const auth = getAuth();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      setIsGuest(false); // Reset guest state on auth change
      if (firebaseUser) {
        const userDocRef = doc(db, 'players', firebaseUser.uid);
        
        const unsubscribeSnapshot = onSnapshot(userDocRef, (docSnapshot) => {
          if (docSnapshot.exists()) {
            const playerData = docSnapshot.data();
            setUser({
              id: firebaseUser.uid,
              name: firebaseUser.displayName || playerData.name,
              photoURL: firebaseUser.photoURL || playerData.photoURL,
              score: playerData.score,
            });
          } else {
            // This case can happen for a brief moment if the document is not yet created after sign up.
            // The UserAuth component handles creating the document. We can set a temporary user state here
            // or wait for the doc to be created.
            setUser({
              id: firebaseUser.uid,
              name: firebaseUser.displayName || firebaseUser.email || 'New Player',
              photoURL: firebaseUser.photoURL || '',
              score: 0,
            });
          }
          setLoading(false);
        });
        return () => unsubscribeSnapshot();
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, [auth]);

  const setGuest = (isGuest: boolean) => {
    if (isGuest) {
      if(auth.currentUser) {
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
