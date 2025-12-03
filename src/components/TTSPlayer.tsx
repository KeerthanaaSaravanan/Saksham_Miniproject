/**
 * @file This file contains the `TTSPlayer` component.
 * It provides a simple UI to demonstrate the usage of the `useTTS` hook for playing text-to-speech audio.
 * It includes a play/pause button and displays the loading/playing state.
 */

'use client';

import { useTTS } from '@/hooks/use-tts';
import { Button } from './ui/button';
import { Play, Pause, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TTSPlayerProps {
  text: string;
}

export function TTSPlayer({ text }: TTSPlayerProps) {
  const { toast } = useToast();
  const { play, pause, isLoading, isPlaying } = useTTS({
    onStart: () => console.log('TTS playback started.'),
    onEnd: () => console.log('TTS playback finished.'),
    onError: (error) => {
        toast({
            variant: 'destructive',
            title: 'TTS Error',
            description: error.message,
        });
    },
  });

  const handleTogglePlay = () => {
    if (isPlaying) {
      pause();
    } else {
      play(text);
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg bg-card">
      <Button
        onClick={handleTogglePlay}
        disabled={isLoading}
        size="icon"
        aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
      >
        {isLoading ? (
          <Loader2 className="animate-spin" />
        ) : isPlaying ? (
          <Pause />
        ) : (
          <Play />
        )}
      </Button>
      <div className="flex-1">
        <p className="font-semibold">Text to Speech</p>
        <p className="text-sm text-muted-foreground truncate">{text}</p>
      </div>
       {/* The actual audio element is managed within the hook and not rendered here */}
    </div>
  );
}
