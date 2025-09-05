"use client"

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getAuth, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, googleProvider } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogIn, LogOut } from 'lucide-react';

export function UserAuth() {
  const { user, loading } = useAuth();
  const auth = getAuth();

  const handleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      const userDocRef = doc(db, 'players', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          name: user.displayName,
          photoURL: user.photoURL,
          score: 0,
        });
      }
    } catch (error) {
      console.error("Authentication failed:", error);
    }
  };

  const handleSignOut = () => {
    signOut(auth);
  };

  if (loading) {
    return <Button className="w-full" disabled>Loading...</Button>;
  }

  if (!user) {
    return (
      <Button className="w-full" onClick={handleSignIn} variant="default">
        <LogIn className="mr-2 h-4 w-4" /> Login with Google
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-start h-14">
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarImage src={user.photoURL} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="font-semibold truncate">{user.name}</p>
                <p className="text-sm text-muted-foreground">Score: {user.score}</p>
              </div>
            </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
