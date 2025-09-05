import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import type { Player } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { User } from 'lucide-react';

export function Leaderboard() {
  const [players, setPlayers] = useState<Player[]>([]);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'players'), orderBy('score', 'desc'), limit(10));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const playersData: Player[] = [];
      querySnapshot.forEach((doc) => {
        playersData.push({ id: doc.id, ...doc.data() } as Player);
      });
      setPlayers(playersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {players.map((player, index) => (
        <li
          key={player.id}
          className={cn(
            "flex items-center gap-4 p-2 rounded-lg transition-all",
            user?.id === player.id ? "bg-primary/20 scale-105" : ""
          )}
        >
          <span className="font-bold text-lg w-6 text-center text-muted-foreground">{index + 1}</span>
          <Avatar>
            <AvatarFallback><User /></AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="font-semibold truncate">{player.name}</p>
          </div>
          <p className="font-bold text-lg text-primary">{player.score}</p>
        </li>
      ))}
    </ul>
  );
}
