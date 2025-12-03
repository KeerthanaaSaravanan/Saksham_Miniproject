
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
import {
  ParseVoiceCommandInput,
  ParseVoiceCommandOutput,
  TextToSpeechInput,
  TextToSpeechOutput,
} from '../../functions/src/types'; // Corrected import path

type FlowOutput<T> = {
  data: T;
};

// Create references to the callable functions
const functions = getFunctions();
const parseVoiceCommandFunc = httpsCallable<ParseVoiceCommandInput, FlowOutput<ParseVoiceCommandOutput>>('parseVoiceCommandFunc');
const textToSpeechFunc = httpsCallable<TextToSpeechInput, FlowOutput<TextToSpeechOutput>>('textToSpeechFunc');


export async function parseVoiceCommand(
  input: ParseVoiceCommandInput
): Promise<ParseVoiceCommandOutput | { error: string }> {
  try {
    const result = await parseVoiceCommandFunc(input);
    return result.data.data;
  } catch (e: any) {
    console.error('Chatbot Action Error:', e);
    return { error: e.message || 'An unknown error occurred in the chatbot.' };
  }
}

export async function getTTS(
  text: string
): Promise<{ media: string } | { error: string }> {
  try {
    const result = await textToSpeechFunc(text);
    return result.data.data;
  } catch (e: any) {
    console.error('TTS Action Error:', e);
    return {
      error: e.message || 'An unknown error occurred during TTS processing.',
    };
  }
}
