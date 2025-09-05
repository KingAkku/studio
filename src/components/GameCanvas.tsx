import React, { useRef, useEffect } from 'react';
import { Sundari } from './Sundari';
import { cn } from '@/lib/utils';

interface GameCanvasProps {
  sundariPosition: { x: number; y: number } | null;
  dots: { x: number; y: number; score: number }[];
  onCanvasClick: (x: number, y: number) => void;
  isGameActive: boolean;
  isProcessing: boolean;
  isNewGame: boolean;
}

export function GameCanvas({ sundariPosition, dots, onCanvasClick, isGameActive, isProcessing, isNewGame }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sundariRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    // Resize canvas to fit parent
    const parent = canvas.parentElement;
    if (parent) {
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    }

    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw dots
    dots.forEach(dot => {
      context.beginPath();
      context.arc(dot.x, dot.y, 5, 0, 2 * Math.PI, false);
      context.fillStyle = 'red';
      context.fill();
      context.lineWidth = 2;
      context.strokeStyle = '#8B0000';
      context.stroke();
      
      // Add red-dot class for animation
      // This is tricky with canvas, we'd manage state to do this
      // For simplicity, we animate via CSS on a div instead.
    });

  }, [dots]);

  const handleMouseClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isGameActive) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    onCanvasClick(x, y);
  };
  
  const showInitialOverlay = !isGameActive && !sundariPosition && dots.length === 0;

  return (
    <div className="w-full h-full relative" onClick={handleMouseClick}>
      {sundariPosition && (
        <div
          ref={sundariRef}
          style={{
            position: 'absolute',
            left: `${sundariPosition.x}px`,
            top: `${sundariPosition.y}px`,
            // Hide the image visually, but keep it in the DOM for logic
            visibility: isGameActive ? 'hidden' : 'visible',
            opacity: isProcessing || isGameActive ? 0 : 1.0,
          }}
        >
          <Sundari />
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

      {isNewGame && <div className="absolute inset-0 eye-cover-overlay z-10" />}

      {showInitialOverlay && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-20">
          <div className="text-center p-8 bg-card rounded-lg shadow-2xl">
            <h2 className="text-3xl font-headline text-primary mb-2">Welcome to Sundari!</h2>
            <p className="text-muted-foreground">Click 'New Game' to begin.</p>
          </div>
        </div>
      )}

      {isProcessing && !isNewGame && (
         <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-20">
            <div className="text-2xl font-headline text-primary animate-pulse">Hiding the Dame...</div>
         </div>
      )}
    </div>
  );
}
