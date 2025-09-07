
import React, { useState, useEffect } from 'react';
import { getFirebaseDb } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import type { Player } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { User } from 'lucide-react';
import { Button } from './ui/button';

const dummyPlayers: Player[] = [
  { id: '1', name: 'Mystic Seeker', email: '', score: 1500 },
  { id: '2', name: 'Shadow Striker', email: '', score: 1420 },
  { id: '3', name: 'Silent Phantom', email: '', score: 1350 },
  { id: '4', name: 'Crimson Ghost', email: '', score: 1280 },
  { id: '5', name: 'Veiled Vixen', email: '', score: 1100 },
  { id: '6', name: 'Nightshade', email: '', score: 1050 },
];

const PlayerRow = ({ player, rank, isCurrentUser }: { player: Player; rank: number | string; isCurrentUser?: boolean }) => (
  <li
    className={cn(
      "flex items-center gap-2 p-1 rounded-lg transition-all text-xs",
      isCurrentUser ? "bg-primary/20" : ""
    )}
  >
    <span className="font-bold text-sm w-5 text-center text-muted-foreground">{rank}</span>
    <Avatar className="h-6 w-6">
      <AvatarFallback><User className="h-3 w-3" /></AvatarFallback>
    </Avatar>
    <div className="flex-1 overflow-hidden">
      <p className="font-medium truncate">{player.name || 'Anonymous'}</p>
    </div>
    <p className="font-bold text-sm text-primary">{player.score}</p>
  </li>
);

export function Leaderboard() {
  const [players, setPlayers] = useState<Player[]>([]);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  
  useEffect(() => {
    const db = getFirebaseDb();
    if (!db) {
      setPlayers(dummyPlayers);
      setLoading(false);
      return;
    }
    const q = query(collection(db, 'players'), orderBy('score', 'desc'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const playersData: Player[] = [];
      querySnapshot.forEach((doc) => {
        playersData.push({ id: doc.id, ...doc.data() } as Player);
      });

      setPlayers(playersData.length > 0 ? playersData : dummyPlayers);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching leaderboard: ", error);
      setPlayers(dummyPlayers);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const toggleExpanded = () => setIsExpanded(!isExpanded);

  if (loading) {
    return (
      <div className="space-y-3 p-2">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-1">
            <Skeleton className="h-6 w-6 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const visiblePlayerCount = isExpanded ? players.length : 10;
  const topPlayers = players.slice(0, visiblePlayerCount);
  
  let currentUserData: { player: Player; rank: number } | null = null;
  if (user) {
    const rank = players.findIndex(p => p.id === user.id);
    if (rank !== -1) {
      currentUserData = { player: players[rank], rank: rank + 1 };
    }
  }
  
  const isCurrentUserInTop = topPlayers.some(p => p.id === user?.id);

  return (
    <div className="h-full px-2 flex flex-col">
        <ul className="space-y-2">
          {topPlayers.map((player, index) => (
            <PlayerRow 
                key={player.id} 
                player={player} 
                rank={index + 1}
                isCurrentUser={user?.id === player.id}
            />
          ))}
        </ul>
        
        <div className="flex-grow" />
        
        {players.length > 10 && (
          <div className="py-2 text-center">
            <Button variant="link" size="sm" onClick={toggleExpanded}>
              {isExpanded ? 'Show Less' : 'Show More'}
            </Button>
          </div>
        )}
        
        {currentUserData && !isCurrentUserInTop && (
          <div className="mt-auto pt-2 border-t border-border">
             <PlayerRow 
                key={currentUserData.player.id} 
                player={currentUserData.player} 
                rank={currentUserData.rank}
                isCurrentUser={true}
            />
          </div>
        )}
    </div>
  );
}
