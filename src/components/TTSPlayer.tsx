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
import { useState } from 'react';
import type { TextToSpeechInput } from '@/ai/flows/text-to-speech';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';

interface TTSPlayerProps {
  text: string;
}

export function TTSPlayer({ text }: TTSPlayerProps) {
  const { toast } = useToast();
  const [profile, setProfile] = useState<TextToSpeechInput['profile']>('normal');
  
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
      play(text, profile);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-lg bg-card">
      <div className="flex items-center gap-4">
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
      </div>
      <div className="pt-4 border-t">
        <Label className="font-semibold mb-2 block">Voice Profile</Label>
        <RadioGroup
            value={profile}
            onValueChange={(val) => setProfile(val as TextToSpeechInput['profile'])}
            className="flex gap-4"
            >
            <div className="flex items-center space-x-2">
                <RadioGroupItem value="slow_sld" id="p-slow" />
                <Label htmlFor="p-slow">Slow (SLD)</Label>
            </div>
            <div className="flex items-center space-x-2">
                <RadioGroupItem value="normal" id="p-normal" />
                <Label htmlFor="p-normal">Normal</Label>
            </div>
            <div className="flex items-center space-x-2">
                <RadioGroupItem value="fast" id="p-fast" />
                <Label htmlFor="p-fast">Fast</Label>
            </div>
        </RadioGroup>
      </div>
       {/* The actual audio element is managed within the hook and not rendered here */}
    </div>
  );
}
