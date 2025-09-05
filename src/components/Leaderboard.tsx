import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, limit, where, getDocs } from 'firebase/firestore';
import type { Player } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { User } from 'lucide-react';

const dummyPlayers: Player[] = [
  { id: '1', name: 'Mystic Seeker', email: '', score: 1500 },
  { id: '2', name: 'Shadow Striker', email: '', score: 1420 },
  { id: '3', name: 'Silent Phantom', email: '', score: 1350 },
  { id: '4', name: 'Crimson Ghost', email: '', score: 1280 },
  { id: '5', name: 'Veiled Vixen', email: '', score: 1100 },
  { id: '6', name: 'Nightshade', email: '', score: 1050 },
  { id: '7', name: 'Wraith', email: '', score: 980 },
  { id: '8', name: 'Specter', email: '', score: 920 },
  { id: '9', name: 'Abyss', email: '', score: 850 },
  { id: '10', name: 'Shade', email: '', score: 780 },
];

const PlayerRow = ({ player, rank, isCurrentUser }: { player: Player; rank: number; isCurrentUser?: boolean }) => (
  <li
    className={cn(
      "flex items-center gap-2 p-1 rounded-lg transition-all text-xs",
      isCurrentUser ? "bg-primary/20 scale-105" : ""
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
  const [userRank, setUserRank] = useState<number | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'players'), orderBy('score', 'desc'), limit(10));
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const playersData: Player[] = [];
      querySnapshot.forEach((doc) => {
        playersData.push({ id: doc.id, ...doc.data() } as Player);
      });
      
      if (playersData.length > 0) {
        setPlayers(playersData);
      } else {
        setPlayers(dummyPlayers.slice(0, 10));
      }

      if (user) {
        const userInTop10 = playersData.find(p => p.id === user.id);
        if (userInTop10) {
            setUserRank(playersData.indexOf(userInTop10) + 1);
        } else {
            // Fetch all players to determine rank
            const allPlayersQuery = query(collection(db, 'players'), orderBy('score', 'desc'));
            const allPlayersSnapshot = await getDocs(allPlayersQuery);
            const allPlayers = allPlayersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as Player }));
            const userIndex = allPlayers.findIndex(p => p.id === user.id);
            if (userIndex !== -1) {
                setUserRank(userIndex + 1);
            } else {
                setUserRank(null);
            }
        }
      }


      setLoading(false);
    }, (error) => {
      console.error("Error fetching leaderboard: ", error);
      setPlayers(dummyPlayers.slice(0, 10)); // Fallback to dummies
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const isUserInTop10 = user && players.some(p => p.id === user.id);

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {players.map((player, index) => (
        <PlayerRow 
            key={player.id} 
            player={player} 
            rank={index + 1}
            isCurrentUser={user?.id === player.id}
        />
      ))}
       {user && !isUserInTop10 && userRank !== null && (
        <>
            <li className="flex justify-center items-center my-2">
                <div className="w-full border-t border-dashed border-border"></div>
                <span className="mx-2 text-muted-foreground text-xs">...</span>
                <div className="w-full border-t border-dashed border-border"></div>
            </li>
            <PlayerRow player={user} rank={userRank} isCurrentUser={true} />
        </>
       )}
    </ul>
  );
}
