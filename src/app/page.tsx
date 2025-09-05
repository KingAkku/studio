
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
import { Crown, Gamepad2, User as UserIcon } from 'lucide-react';
import { adaptiveLadyMovement } from '@/ai/flows/adaptive-lady-movement';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

const BASE_SUNDARI_WIDTH = 100;
const BASE_SUNDARI_HEIGHT = 150;
const BASE_CANVAS_AREA = 800 * 600;

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
  const isMobile = useIsMobile();

  const getResponsiveSundariSize = useCallback(() => {
    if (!mainContentRef.current) {
      return { width: BASE_SUNDARI_WIDTH, height: BASE_SUNDARI_HEIGHT, forehead: {x: 50, y: 30}};
    }
    const canvasWidth = mainContentRef.current.clientWidth;
    const canvasHeight = mainContentRef.current.clientHeight;
    const currentCanvasArea = canvasWidth * canvasHeight;
    const scaleFactor = Math.sqrt(currentCanvasArea / BASE_CANVAS_AREA);

    const responsiveWidth = Math.max(50, BASE_SUNDARI_WIDTH * scaleFactor);
    const responsiveHeight = Math.max(75, BASE_SUNDARI_HEIGHT * scaleFactor);
    
    return {
      width: responsiveWidth,
      height: responsiveHeight,
      forehead: {
        x: responsiveWidth / 2,
        y: responsiveHeight * (30 / 150),
      }
    };
  }, []);

  const handleNewGame = useCallback(async () => {
    if (!user && !isGuest) {
      toast({
        variant: "destructive",
        title: "Login Required",
        description: "Please log in or play as a guest to start a new game.",
      });
      return;
    }

    setDots([]);
    setLastScore(null);
    setIsProcessing(true); // Start processing for hiding

    const canvasWidth = mainContentRef.current?.clientWidth || 800;
    const canvasHeight = mainContentRef.current?.clientHeight || 600;
    const { width: sundariWidth, height: sundariHeight } = getResponsiveSundariSize();

    const newPosition = await adaptiveLadyMovement({
      canvasWidth,
      canvasHeight,
      imageWidth: sundariWidth,
      imageHeight: sundariHeight,
      consecutiveMisses: consecutiveMisses,
    });
    
    setSundariPosition(newPosition);

    if (isNewGame) {
      setTimeout(() => {
          setIsGameActive(true);
          setIsNewGame(false);
          setIsProcessing(false);
      }, 1500); // Eye-cover animation duration
    } else {
        setIsProcessing(false); 
        setIsGameActive(true);
    }

  }, [user, isGuest, toast, consecutiveMisses, getResponsiveSundariSize, isNewGame]);
  
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

    const { width: sundariWidth, height: sundariHeight, forehead: sundariForehead } = getResponsiveSundariSize();
    const foreheadX = sundariPosition.x + sundariForehead.x;
    const foreheadY = sundariPosition.y + sundariForehead.y;

    const distance = Math.sqrt(Math.pow(x - foreheadX, 2) + Math.pow(y - foreheadY, 2));

    let score = 0;
    const clickIsOnImage = x >= sundariPosition.x && x <= sundariPosition.x + sundariWidth && y >= sundariPosition.y && y <= sundariPosition.y + sundariHeight;
    
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
  
  const { width: sundariWidth, height: sundariHeight } = getResponsiveSundariSize();

  const DesktopSidebar = () => (
    <aside className="w-[320px] flex-col border-r border-border p-4 shadow-lg bg-card/80 hidden md:flex">
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
  );
  
  const MobileNavBar = () => (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-card/80 backdrop-blur-sm border-t border-border z-30 flex items-center justify-around p-2">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" className="flex flex-col h-full items-center justify-center gap-1">
            <UserIcon/>
            <span className="text-xs">Profile</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-4/5">
          <SheetHeader>
            <SheetTitle>Profile</SheetTitle>
          </SheetHeader>
          <div className="p-4"><UserAuth/></div>
        </SheetContent>
      </Sheet>

      <Button
          className="w-24 h-12 text-lg"
          size="lg"
          onClick={handleNewGame}
          disabled={isProcessing || loading || isGameActive}
        >
          {isProcessing ? <Gamepad2 className="animate-spin" /> : 'Play'}
        </Button>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" className="flex flex-col h-full items-center justify-center gap-1">
              <Crown/>
              <span className="text-xs">Scores</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-4/5">
           <SheetHeader><SheetTitle className="flex items-center gap-2 p-4"><Crown className="text-primary"/>Leaderboard</SheetTitle></SheetHeader>
           <div className="overflow-y-auto h-full pb-20">
            <Leaderboard />
           </div>
        </SheetContent>
      </Sheet>

    </div>
  );

  return (
    <div className="flex h-screen bg-background font-body">
      <DesktopSidebar />
      <main ref={mainContentRef} className="flex-1 relative bg-black">
        <GameCanvas
          sundariPosition={sundariPosition}
          sundariWidth={sundariWidth}
          sundariHeight={sundariHeight}
          dots={dots}
          onCanvasClick={handleCanvasClick}
          isGameActive={isGameActive}
          isProcessing={isProcessing}
          isNewGame={isNewGame}
          lastScore={lastScore}
        />
      </main>
      <MobileNavBar />
    </div>
  );
}
