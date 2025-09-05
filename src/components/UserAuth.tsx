"use client"

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getAuth, signInWithPopup, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
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
import { LogIn, LogOut, UserPlus, Ghost } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export function UserAuth() {
  const { user, loading, isGuest, setGuest } = useAuth();
  const auth = getAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUpOpen, setSignUpOpen] = useState(false);
  const [isLoginOpen, setLoginOpen] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      const userDocRef = doc(db, 'players', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          id: user.uid,
          name: user.displayName,
          photoURL: user.photoURL,
          score: 0,
        });
      }
    } catch (error) {
      console.error("Authentication failed:", error);
      toast({
        variant: 'destructive',
        title: 'Authentication Failed',
        description: (error as Error).message,
      });
    }
  };

  const handleEmailLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setLoginOpen(false);
    } catch (error) {
      console.error("Login failed:", error);
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: (error as Error).message,
      });
    }
  };
  
  const handleSignUp = async () => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;
      
      const userDocRef = doc(db, 'players', user.uid);
      await setDoc(userDocRef, {
        id: user.uid,
        name: user.email,
        photoURL: '',
        score: 0,
      });
      setSignUpOpen(false);
    } catch (error) {
      console.error("Sign up failed:", error);
      toast({
        variant: 'destructive',
        title: 'Sign Up Failed',
        description: (error as Error).message,
      });
    }
  };


  const handleSignOut = () => {
    signOut(auth);
    setGuest(false);
  };
  
  const handleGuestLogin = () => {
    setGuest(true);
  }

  if (loading) {
    return <Button className="w-full" disabled>Loading...</Button>;
  }

  if (isGuest) {
     return (
        <div className="flex items-center gap-4 p-2 rounded-lg bg-secondary">
          <Avatar>
            <AvatarFallback><Ghost/></AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-semibold">Guest Player</p>
            <p className="text-sm text-muted-foreground">Score not saved</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setGuest(false)}>Exit</Button>
        </div>
     )
  }

  if (!user) {
    return (
      <div className="flex flex-col gap-2">
        <Button className="w-full" onClick={handleGoogleSignIn} variant="default">
          <LogIn className="mr-2 h-4 w-4" /> Login with Google
        </Button>
        <Dialog open={isLoginOpen} onOpenChange={setLoginOpen}>
          <DialogTrigger asChild>
            <Button className="w-full" variant="secondary">
              <LogIn className="mr-2 h-4 w-4" /> Login with Email
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Login</DialogTitle>
              <DialogDescription>
                Enter your credentials to log in.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" /* autocomplete="current-password" */ className="text-right">
                  Password
                </Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleEmailLogin}>Login</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog open={isSignUpOpen} onOpenChange={setSignUpOpen}>
          <DialogTrigger asChild>
            <Button className="w-full" variant="outline">
              <UserPlus className="mr-2 h-4 w-4" /> Sign Up with Email
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Sign Up</DialogTitle>
              <DialogDescription>
                Create an account to save your score and compete on the leaderboard.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email-signup" className="text-right">
                  Email
                </Label>
                <Input id="email-signup" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password-signup" /* autocomplete="new-password" */ className="text-right">
                  Password
                </Label>
                <Input id="password-signup" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleSignUp}>Sign Up</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Button className="w-full" onClick={handleGuestLogin} variant="outline">
            <Ghost className="mr-2 h-4 w-4" /> Play as Guest
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-start h-14">
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarImage src={user.photoURL ?? undefined} alt={user.name} />
                <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="text-left overflow-hidden">
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
