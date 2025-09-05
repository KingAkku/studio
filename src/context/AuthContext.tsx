"use client"

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Player } from '@/types';

interface AuthContextType {
  user: Player | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'players', firebaseUser.uid);
        const unsubscribeSnapshot = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            const playerData = doc.data();
            setUser({
              id: firebaseUser.uid,
              name: firebaseUser.displayName || playerData.name,
              photoURL: firebaseUser.photoURL || playerData.photoURL,
              score: playerData.score,
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

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
