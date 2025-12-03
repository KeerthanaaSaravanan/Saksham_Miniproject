/**
 * @file This file contains the `useTTS` React hook for handling Text-to-Speech functionality.
 *
 * - Manages audio state (loading, playing).
 * - Caches audio data in IndexedDB to minimize network requests.
 * - Fetches TTS audio from a Cloud Function if not found in cache.
 * - Provides controls for playing, pausing, and resuming audio.
 */

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { getTTS } from '@/lib/actions/chatbot';
import { cache } from '@/lib/idb-cache';
import type { TextToSpeechInput } from '@/ai/flows/text-to-speech';

interface UseTTSProps {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
}

interface UseTTSResult {
  play: (text: string, profile?: TextToSpeechInput['profile']) => void;
  pause: () => void;
  resume: () => void;
  isLoading: boolean;
  isPlaying: boolean;
}

export function useTTS({ onStart, onEnd, onError }: UseTTSProps): UseTTSResult {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentTextRef = useRef<string>('');

  useEffect(() => {
    // Initialize Audio element on client-side
    if (!audioRef.current) {
        audioRef.current = new Audio();
    }
    const audioElement = audioRef.current;

    const handlePlay = () => {
        setIsPlaying(true);
        onStart?.();
    };
    const handleEnded = () => {
        setIsPlaying(false);
        onEnd?.();
    };
    const handlePause = () => {
        setIsPlaying(false);
    };
     const handleError = () => {
        setIsPlaying(false);
        setIsLoading(false);
        const error = new Error('Audio playback failed');
        console.error(error);
        onError?.(error);
    };


    audioElement.addEventListener('play', handlePlay);
    audioElement.addEventListener('ended', handleEnded);
    audioElement.addEventListener('pause', handlePause);
    audioElement.addEventListener('error', handleError);

    return () => {
      audioElement.removeEventListener('play', handlePlay);
      audioElement.removeEventListener('ended', handleEnded);
      audioElement.removeEventListener('pause', handlePause);
      audioElement.removeEventListener('error', handleError);
      audioElement.pause();
    };
  }, [onStart, onEnd, onError]);

  const play = useCallback(async (text: string, profile: TextToSpeechInput['profile'] = 'normal') => {
    if (!text || !audioRef.current) return;
    
    // If currently playing, stop it before starting new audio
    if (isPlaying) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
    }

    currentTextRef.current = text;
    setIsLoading(true);
    
    const cacheKey = `${profile}:${text}`;

    try {
      // 1. Check cache
      const cachedAudio = await cache.get<string>(cacheKey);
      if (cachedAudio) {
        console.log('Playing from cache');
        audioRef.current.src = cachedAudio;
        audioRef.current.play();
        setIsLoading(false);
        return;
      }

      // 2. Fetch from server
      console.log('Fetching from server');
      const result = await getTTS({ text, profile });

      if ('error' in result) {
        throw new Error(result.error);
      }

      // 3. Play and cache
      audioRef.current.src = result.media;
      audioRef.current.play();
      await cache.set(cacheKey, result.media);

    } catch (e: any) {
      console.error('TTS Error:', e);
      onError?.(e);
    } finally {
      setIsLoading(false);
    }
  }, [isPlaying, onError]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  const resume = useCallback(() => {
    if (audioRef.current && !isPlaying) {
      audioRef.current.play();
    }
  }, [isPlaying]);

  return { play, pause, resume, isLoading, isPlaying };
}
