
import React from 'react';
import Image from 'next/image';

interface GameCanvasProps {
  sundariPosition: { x: number; y: number } | null;
  sundariWidth: number;
  sundariHeight: number;
  dots: { x: number; y: number; score: number }[];
  onCanvasClick: (x: number, y: number) => void;
  isGameActive: boolean;
  isProcessing: boolean;
  lastScore: number | null;
}

export function GameCanvas({ sundariPosition, sundariWidth, sundariHeight, dots, onCanvasClick, isGameActive, lastScore }: GameCanvasProps) {
  
  const handleMouseClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isGameActive) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    onCanvasClick(x, y);
  };
  
  const showInitialOverlay = !sundariPosition && dots.length === 0;
  const showGameOverMessage = lastScore !== null && !isGameActive;
  const showSundari = sundariPosition && !isGameActive && dots.length > 0;

  return (
    <div className="w-full h-full relative" onClick={handleMouseClick}>
      {showSundari && (
        <div
          style={{
            position: 'absolute',
            left: `${sundariPosition.x}px`,
            top: `${sundariPosition.y}px`,
            width: sundariWidth,
            height: sundariHeight,
          }}
        >
          <Image 
            src="/sundari.svg"
            alt="Sundari"
            width={sundariWidth}
            height={sundariHeight}
          />
        </div>
      )}
      
      {dots.map((dot, index) => (
         <div key={index} className="red-dot" style={{
            position: 'absolute',
            left: dot.x - 5,
            top: dot.y - 5,
            width: 10,
            height: 10,
            backgroundColor: 'red',
            borderRadius: '50%',
            border: '2px solid #8B0000',
         }}/>
      ))}

      {showInitialOverlay && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-20">
          <div className="text-center p-8 bg-card rounded-lg shadow-2xl">
            <h2 className="text-3xl font-headline text-primary mb-2">Welcome to Sundari!</h2>
            <p className="text-muted-foreground md:hidden">Tap 'Play' to begin.</p>
            <p className="text-muted-foreground hidden md:block">Click 'New Game' or press Space to begin.</p>
          </div>
        </div>
      )}
      
      {showGameOverMessage && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div className="game-over-message rounded-lg border-2 border-primary bg-card/90 p-6 shadow-2xl text-center">
              <p className="text-4xl font-headline text-primary">Your score: {lastScore}</p>
              <p className="text-xl font-body text-muted-foreground mt-2 md:hidden">Tap 'Play' to try again!</p>
              <p className="text-xl font-body text-muted-foreground mt-2 hidden md:block">Press Space bar to try again!</p>
          </div>
        </div>
      )}
    </div>
  );
}
