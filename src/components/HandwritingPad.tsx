
'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Undo, Redo, Eraser, Check, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface HandwritingPadProps {
  onConfirm: (text: string, imageDataUri: string) => void;
  isProcessing: boolean;
}

type Point = {
  x: number;
  y: number;
};

type Stroke = Point[];

export function HandwritingPad({ onConfirm, isProcessing }: HandwritingPadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [redoStack, setRedoStack] = useState<Stroke[]>([]);
  const { toast } = useToast();

  const getCanvasContext = () => {
    const canvas = canvasRef.current;
    return canvas ? canvas.getContext('2d') : null;
  };
  
  const redrawCanvas = useCallback(() => {
    const ctx = getCanvasContext();
    if (!ctx || !canvasRef.current) return;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'hsl(var(--foreground))';
    ctx.lineWidth = 3;

    strokes.forEach(stroke => {
      if (stroke.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length; i++) {
        ctx.lineTo(stroke[i].x, stroke[i].y);
      }
      ctx.stroke();
    });
  }, [strokes]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Set initial canvas size
    const rect = canvas.parentElement!.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    redrawCanvas();
  }, [redrawCanvas]);

  const getPoint = (e: React.MouseEvent | React.TouchEvent): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    const point = getPoint(e);
    if (!point) return;
    setIsDrawing(true);
    setStrokes(prev => [...prev, [point]]);
    setRedoStack([]); // Clear redo stack on new drawing
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const point = getPoint(e);
    if (!point) return;
    setStrokes(prev => {
      const newStrokes = [...prev];
      const lastStroke = newStrokes[newStrokes.length - 1];
      lastStroke.push(point);
      return newStrokes;
    });
    redrawCanvas();
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const handleUndo = () => {
    if (strokes.length === 0) return;
    const lastStroke = strokes[strokes.length - 1];
    setRedoStack(prev => [lastStroke, ...prev]);
    setStrokes(prev => prev.slice(0, -1));
  };
  
  useEffect(() => {
      redrawCanvas();
  }, [strokes, redrawCanvas])

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const nextStroke = redoStack[0];
    setStrokes(prev => [...prev, nextStroke]);
    setRedoStack(prev => prev.slice(1));
  };

  const handleClear = () => {
    setStrokes([]);
    setRedoStack([]);
  };

  const handleSubmit = () => {
    const canvas = canvasRef.current;
    if (!canvas || strokes.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Empty Canvas',
        description: 'Please write something before submitting.',
      });
      return;
    }
    const imageDataUri = canvas.toDataURL('image/png');
    // For now, we pass a placeholder for text recognition
    onConfirm('Handwritten answer submitted.', imageDataUri);
  };

  return (
    <Card>
      <CardContent className="p-2">
        <canvas
          ref={canvasRef}
          className="w-full h-64 bg-muted rounded-md cursor-crosshair touch-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
        />
      </CardContent>
      <CardFooter className="justify-between p-2">
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handleUndo} disabled={strokes.length === 0 || isProcessing}>
            <Undo className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleRedo} disabled={redoStack.length === 0 || isProcessing}>
            <Redo className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleClear} disabled={strokes.length === 0 || isProcessing}>
            <Eraser className="h-4 w-4" />
          </Button>
        </div>
        <Button onClick={handleSubmit} disabled={strokes.length === 0 || isProcessing}>
          {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
          Confirm Answer
        </Button>
      </CardFooter>
    </Card>
  );
}
