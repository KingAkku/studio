"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GameCanvas } from '@/components/GameCanvas';
import { Leaderboard } from '@/components/Leaderboard';
import { UserAuth } from '@/components/UserAuth';
import { useAuth } from '@/hooks/useAuth';
import { updateUserScore } from '@/lib/firestore';
import type { GameRound } from '@/types';
import { adjustLadyPosition } from '@/ai/flows/adaptive-lady-movement';
import { useToast } from '@/hooks/use-toast';
import { Crown } from 'lucide-react';

const LADY_IMAGE_WIDTH = 100;
const LADY_IMAGE_HEIGHT = 150;
const LADY_FOREHEAD_POS = { x: 50, y: 30 }; // Relative to image top-left

export default function Home() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [ladyPosition, setLadyPosition] = useState<{ x: number; y: number } | null>(null);
  const [dots, setDots] = useState<{ x: number; y: number; score: number }[]>([]);
  const [gameHistory, setGameHistory] = useState<GameRound[]>([]);
  const [isGameActive, setIsGameActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mainContentRef = useRef<HTMLDivElement>(null);
  
  const handleNewGame = useCallback(async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Login Required",
        description: "Please log in to start a new game.",
      });
      return;
    }
    
    setIsProcessing(true);
    setDots([]);
    setIsGameActive(true);

    const canvasWidth = mainContentRef.current?.clientWidth || 800;
    const canvasHeight = mainContentRef.current?.clientHeight || 600;

    try {
      if (gameHistory.length > 0) {
        const { newLadyX, newLadyY } = await adjustLadyPosition({
          gameHistory,
          canvasWidth,
          canvasHeight,
        });
        setLadyPosition({ 
          x: Math.min(newLadyX, canvasWidth - LADY_IMAGE_WIDTH), 
          y: Math.min(newLadyY, canvasHeight - LADY_IMAGE_HEIGHT) 
        });
      } else {
        // First game, random position
        const x = Math.random() * (canvasWidth - LADY_IMAGE_WIDTH);
        const y = Math.random() * (canvasHeight - LADY_IMAGE_HEIGHT);
        setLadyPosition({ x, y });
      }
    } catch (error) {
      console.error("AI Error, falling back to random:", error);
      const x = Math.random() * (canvasWidth - LADY_IMAGE_WIDTH);
      const y = Math.random() * (canvasHeight - LADY_IMAGE_HEIGHT);
      setLadyPosition({ x, y });
      toast({
        variant: "destructive",
        title: "AI Error",
        description: "Could not get AI position, using random placement.",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [user, gameHistory, toast]);

  const handleCanvasClick = (x: number, y: number) => {
    if (!isGameActive || !ladyPosition || isProcessing) return;

    const foreheadX = ladyPosition.x + LADY_FOREHEAD_POS.x;
    const foreheadY = ladyPosition.y + LADY_FOREHEAD_POS.y;

    const distance = Math.sqrt(Math.pow(x - foreheadX, 2) + Math.pow(y - foreheadY, 2));

    let score = 0;
    const clickIsOnImage = x >= ladyPosition.x && x <= ladyPosition.x + LADY_IMAGE_WIDTH && y >= ladyPosition.y && y <= ladyPosition.y + LADY_IMAGE_HEIGHT;

    if (clickIsOnImage) {
      if (distance <= 5) score = 10;
      else if (distance <= 15) score = 7;
      else if (distance <= 30) score = 4;
      else if (distance <= 50) score = 2;
      else score = 1;
    }

    setDots(prevDots => [...prevDots, { x, y, score }]);

    if (user && score > 0) {
      const newTotalScore = (user.score || 0) + score;
      updateUserScore(user.id, newTotalScore);
      toast({
        title: `You scored ${score} points!`,
        description: `Your new total is ${newTotalScore}.`,
      });
    } else if (score === 0) {
        toast({
            title: "Miss!",
            description: "Try to get closer to the lady's forehead.",
        });
    }
    
    const newRound: GameRound = {
      clickX: x,
      clickY: y,
      ladyX: ladyPosition.x,
      ladyY: ladyPosition.y,
      score: score,
    };
    setGameHistory(prev => [...prev, newRound]);
    setIsGameActive(false); // End round after one click
  };

  return (
    <div className="flex h-screen bg-background font-body">
      <aside className="w-[320px] flex flex-col border-r border-border p-4 shadow-lg bg-card/80">
        <header className="mb-6 text-center">
          <h1 className="font-headline text-4xl font-bold text-primary">Dotty Dame</h1>
          <p className="text-muted-foreground">Aim for the forehead!</p>
        </header>

        <div className="mb-4">
          <UserAuth />
        </div>

        <Card className="flex-grow flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="text-primary"/> Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-grow overflow-y-auto">
            <Leaderboard />
          </CardContent>
        </Card>

        <div className="mt-4">
          <Button 
            className="w-full" 
            size="lg"
            onClick={handleNewGame} 
            disabled={isProcessing || loading}
          >
            {isProcessing ? 'Loading...' : 'New Game'}
          </Button>
        </div>
      </aside>

      <main ref={mainContentRef} className="flex-1 relative">
        <GameCanvas 
          ladyPosition={ladyPosition}
          dots={dots}
          onCanvasClick={handleCanvasClick}
          isGameActive={isGameActive}
          isProcessing={isProcessing}
        />
      </main>
    </div>
  );
}
