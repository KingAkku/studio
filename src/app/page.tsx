
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GameCanvas } from '@/components/GameCanvas';
import { Leaderboard } from '@/components/Leaderboard';
import { UserAuth } from '@/components/UserAuth';
import { useAuth } from '@/hooks/useAuth';
import { updateUserScore } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';
import { Crown } from 'lucide-react';
import { adaptiveLadyMovement } from '@/ai/flows/adaptive-lady-movement';

const SUNDARI_IMAGE_WIDTH = 100;
const SUNDARI_IMAGE_HEIGHT = 150;
const SUNDARI_FOREHEAD_POS = { x: 50, y: 30 }; // Relative to image top-left

export default function Home() {
  const { user, loading, isGuest } = useAuth();
  const { toast } = useToast();
  const [sundariPosition, setSundariPosition] = useState<{ x: number; y: number } | null>(null);
  const [dots, setDots] = useState<{ x: number; y: number; score: number }[]>([]);
  const [isGameActive, setIsGameActive] = useState(false);
  const [isNewGame, setIsNewGame] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [consecutiveMisses, setConsecutiveMisses] = useState(0);
  const mainContentRef = useRef<HTMLDivElement>(null);

  const handleNewGame = useCallback(async () => {
    if (!user && !isGuest) {
      toast({
        variant: "destructive",
        title: "Login Required",
        description: "Please log in or play as a guest to start a new game.",
      });
      return;
    }

    setIsProcessing(true);
    setDots([]);
    setLastScore(null);
    setIsNewGame(true);

    const canvasWidth = mainContentRef.current?.clientWidth || 800;
    const canvasHeight = mainContentRef.current?.clientHeight || 600;

    const newPosition = await adaptiveLadyMovement({
      canvasWidth,
      canvasHeight,
      imageWidth: SUNDARI_IMAGE_WIDTH,
      imageHeight: SUNDARI_IMAGE_HEIGHT,
      consecutiveMisses: consecutiveMisses,
    });

    setSundariPosition(newPosition);

    setTimeout(() => {
        setIsGameActive(true);
        setIsNewGame(false);
        setIsProcessing(false);
    }, 1500);

  }, [user, isGuest, toast, consecutiveMisses]);
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space' && !isGameActive && !isProcessing) {
        event.preventDefault();
        handleNewGame();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isGameActive, isProcessing, handleNewGame]);

  const handleCanvasClick = (x: number, y: number) => {
    if (!isGameActive || !sundariPosition || isProcessing || dots.length > 0) return;

    const foreheadX = sundariPosition.x + SUNDARI_FOREHEAD_POS.x;
    const foreheadY = sundariPosition.y + SUNDARI_FOREHEAD_POS.y;

    const distance = Math.sqrt(Math.pow(x - foreheadX, 2) + Math.pow(y - foreheadY, 2));

    let score = 0;
    const clickIsOnImage = x >= sundariPosition.x && x <= sundariPosition.x + SUNDARI_IMAGE_WIDTH && y >= sundariPosition.y && y <= sundariPosition.y + SUNDARI_IMAGE_HEIGHT;
    
    if (clickIsOnImage) {
        score = 10;
        if (distance <= 5) score += 10;
        else if (distance <= 15) score += 7;
        else if (distance <= 30) score += 4;
        else if (distance <= 50) score += 2;
    }

    if (score > 0) {
      setConsecutiveMisses(0);
      if (user) {
        updateUserScore(user.id, score);
      }
    } else {
      setConsecutiveMisses(prev => prev + 1);
    }


    setDots(prevDots => [...prevDots, { x, y, score }]);
    setLastScore(score);
    setIsGameActive(false);
  };

  return (
    <div className="flex h-screen bg-background font-body">
      <aside className="w-[320px] flex flex-col border-r border-border p-4 shadow-lg bg-card/80">
        <header className="mb-6 text-center">
          <h1 className="font-headline text-4xl font-bold text-primary">Sundari</h1>
          <p className="text-muted-foreground">Find the hidden lady.</p>
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
            disabled={isProcessing || loading || isGameActive}
          >
            {isProcessing ? 'Starting...' : 'New Game'}
          </Button>
        </div>
      </aside>

      <main ref={mainContentRef} className="flex-1 relative bg-black">
        <GameCanvas
          sundariPosition={sundariPosition}
          dots={dots}
          onCanvasClick={handleCanvasClick}
          isGameActive={isGameActive}
          isProcessing={isProcessing}
          isNewGame={isNewGame}
          lastScore={lastScore}
        />
      </main>
    </div>
  );
}
