'use server';

import { getFunctions, httpsCallable } from 'firebase/functions';
import { getApp } from 'firebase/app';
import type { ExtractQuestionsInput, ExtractQuestionsOutput } from '@/functions/src/types';

type FlowOutput<T> = {
  data: T;
};

// Lazily initialize functions to ensure Firebase app is ready.
const getFunctionsInstance = () => {
    const app = getApp();
    return getFunctions(app, 'us-central1'); // Specify region
}

export async function extractQuestionsFromDocument(
    input: ExtractQuestionsInput
): Promise<ExtractQuestionsOutput | { error: string }> {
  try {
    const extractFunc = httpsCallable<ExtractQuestionsInput, FlowOutput<ExtractQuestionsOutput>>(getFunctionsInstance(), 'extractQuestionsFromDocumentFunc');
    const result = await extractFunc(input);
    return result.data.data;
  } catch (e: any) {
    console.error("Document parsing action error:", e);
    return { error: e.message || 'An unknown error occurred while parsing the document.' };
  }
}
