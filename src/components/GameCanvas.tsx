import React, { useRef, useEffect } from 'react';
import { Lady } from './Lady';

interface GameCanvasProps {
  ladyPosition: { x: number; y: number } | null;
  dots: { x: number; y: number; score: number }[];
  onCanvasClick: (x: number, y: number) => void;
  isGameActive: boolean;
  isProcessing: boolean;
}

export function GameCanvas({ ladyPosition, dots, onCanvasClick, isGameActive, isProcessing }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ladyRef = useRef<HTMLDivElement>(null);

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
    });

  }, [dots]);

  const handleMouseClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isGameActive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    onCanvasClick(x, y);
  };
  
  const showOverlay = !isGameActive && !ladyPosition;

  return (
    <div className="w-full h-full relative">
      {ladyPosition && (
        <div
          ref={ladyRef}
          style={{
            position: 'absolute',
            left: `${ladyPosition.x}px`,
            top: `${ladyPosition.y}px`,
            opacity: isProcessing ? 0.5 : 1.0,
          }}
        >
          <Lady />
        </div>
      )}
      <canvas
        ref={canvasRef}
        onClick={handleMouseClick}
        className="absolute top-0 left-0 w-full h-full cursor-crosshair"
      />
      {showOverlay && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50">
          <div className="text-center p-8 bg-card rounded-lg shadow-2xl">
            <h2 className="text-3xl font-headline text-primary mb-2">Welcome to Dotty Dame!</h2>
            <p className="text-muted-foreground">Click 'New Game' to begin.</p>
          </div>
        </div>
      )}
      {isProcessing && (
         <div className="absolute inset-0 flex items-center justify-center bg-background/50">
            <div className="text-2xl font-headline text-primary animate-pulse">Placing the Dame...</div>
         </div>
      )}
    </div>
  );
}
