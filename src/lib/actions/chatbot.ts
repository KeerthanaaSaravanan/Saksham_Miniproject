/**
 * @file This file contains server actions for interacting with AI chatbot and TTS flows.
 * It acts as a bridge between the client-side components and the backend Genkit flows,
 * using Firebase Callable Functions.
 *
 * - getChatbotResponse: Gets a response from the main conversational AI.
 * - getTTS: Converts text to speech audio.
 */

'use client';

import { getFunctions, httpsCallable } from 'firebase/functions';
import { getApp } from 'firebase/app';
import {
  ParseVoiceCommandInput,
  ParseVoiceCommandOutput,
  TextToSpeechInput,
  TextToSpeechOutput,
} from '../../functions/src/types';

type FlowOutput<T> = {
  data: T;
};

// Lazily initialize functions to ensure Firebase app is ready.
const getFunctionsInstance = () => {
    const app = getApp(); // Assumes Firebase is initialized elsewhere, e.g., in FirebaseClientProvider
    return getFunctions(app, 'us-central1');
}

export async function parseVoiceCommand(
  input: ParseVoiceCommandInput
): Promise<ParseVoiceCommandOutput | { error: string }> {
  try {
    const parseVoiceCommandFunc = httpsCallable<ParseVoiceCommandInput, FlowOutput<ParseVoiceCommandOutput>>(getFunctionsInstance(), 'parseVoiceCommandFunc');
    const result = await parseVoiceCommandFunc(input);
    return result.data.data;
  } catch (e: any) {
    console.error('Chatbot Action Error:', e);
    return { error: e.message || 'An unknown error occurred in the chatbot.' };
  }
}

export async function getTTS(
  input: TextToSpeechInput
): Promise<{ media: string } | { error: string }> {
  try {
    const textToSpeechFunc = httpsCallable<TextToSpeechInput, FlowOutput<TextToSpeechOutput>>(getFunctionsInstance(), 'textToSpeechFunc');
    const result = await textToSpeechFunc(input);
    return result.data.data;
  } catch (e: any) {
    console.error('TTS Action Error:', e);
    return {
      error: e.message || 'An unknown error occurred during TTS processing.',
    };
  }
}
