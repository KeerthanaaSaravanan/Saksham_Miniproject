
'use server';

import { getFunctions, httpsCallable } from 'firebase/functions';
import { getApp } from 'firebase/app';
import { RecognizeHandwritingInput, RecognizeHandwritingOutput } from "@/functions/src/types";

type FlowOutput<T> = {
  data: T;
};

// Lazily initialize functions to ensure Firebase app is ready.
const getFunctionsInstance = () => {
    const app = getApp();
    return getFunctions(app, 'us-central1'); // Specify region
}

export async function recognizeHandwritingAction(
    input: RecognizeHandwritingInput
): Promise<RecognizeHandwritingOutput | { error: string }> {
  try {
    const recognizeFunc = httpsCallable<RecognizeHandwritingInput, FlowOutput<RecognizeHandwritingOutput>>(getFunctionsInstance(), 'recognizeHandwritingFunc');
    const result = await recognizeFunc(input);
    return result.data.data;
  } catch (e: any) {
    console.error("Handwriting recognition action error:", e);
    return { error: e.message || 'An unknown error occurred while recognizing handwriting.' };
  }
}
