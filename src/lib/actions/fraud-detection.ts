
'use server';

import { detectAnomalousExamPatterns, DetectAnomalousExamPatternsInput, DetectAnomalousExamPatternsOutput } from "@/ai/flows/detect-anomalous-exam-patterns";

export async function detectAnomalies(
    input: DetectAnomalousExamPatternsInput
): Promise<DetectAnomalousExamPatternsOutput | { error: string }> {
  try {
    const result = await detectAnomalousExamPatterns(input);
    return result;
  } catch (e: any) {
    console.error(e);
    return { error: e.message || 'An unknown error occurred during anomaly detection.' };
  }
}
