
'use server';

import { getFunctions, httpsCallable } from 'firebase/functions';
import { getApp } from 'firebase/app';
import { CaptureVoiceAnswerInput, CaptureVoiceAnswerOutput } from "@/functions/src/types";

type FlowOutput<T> = {
  data: T;
};

// Lazily initialize functions to ensure Firebase app is ready.
const getFunctionsInstance = () => {
    const app = getApp();
    return getFunctions(app, 'us-central1'); // Specify region
}

export async function captureVoiceAnswer(
    input: CaptureVoiceAnswerInput
): Promise<CaptureVoiceAnswerOutput | { error: string }> {
  try {
    const captureVoiceFunc = httpsCallable<CaptureVoiceAnswerInput, FlowOutput<CaptureVoiceAnswerOutput>>(getFunctionsInstance(), 'captureVoiceAnswerFunc');
    const result = await captureVoiceFunc(input);
    return result.data.data;
  } catch (e: any) {
    console.error("Voice answer capture error:", e);
    return { error: e.message || 'An unknown error occurred while processing the voice answer.' };
  }
}
