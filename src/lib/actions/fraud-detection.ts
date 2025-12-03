
'use server';

import { getFunctions, httpsCallable } from 'firebase/functions';
import { getApp } from 'firebase/app';
import { DetectAnomalousExamPatternsInput, DetectAnomalousExamPatternsOutput } from "@/ai/flows/detect-anomalous-exam-patterns";

type FlowOutput<T> = {
  data: T;
};

// Lazily initialize functions to ensure Firebase app is ready.
const getFunctionsInstance = () => {
    const app = getApp();
    return getFunctions(app, 'us-central1'); // Specify region
}


export async function detectAnomalies(
    input: DetectAnomalousExamPatternsInput
): Promise<DetectAnomalousExamPatternsOutput | { error: string }> {
  try {
    const detectAnomaliesFunc = httpsCallable<DetectAnomalousExamPatternsInput, FlowOutput<DetectAnomalousExamPatternsOutput>>(getFunctionsInstance(), 'detectAnomalousExamPatternsFunc');
    const result = await detectAnomaliesFunc(input);
    return result.data.data;
  } catch (e: any) {
    console.error("Anomaly detection action error:", e);
    return { error: e.message || 'An unknown error occurred during anomaly detection.' };
  }
}
