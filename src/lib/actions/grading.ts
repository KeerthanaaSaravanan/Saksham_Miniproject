
'use server';

import { autoGradeAnswer, AutoGradeInput, AutoGradeOutput } from "@/ai/flows/auto-grade";

export async function runAutoGrader(
    input: AutoGradeInput
): Promise<AutoGradeOutput | { error: string }> {
  try {
    const result = await autoGradeAnswer(input);
    return result;
  } catch (e: any) {
    console.error("Auto-grading error:", e);
    return { error: e.message || 'An unknown error occurred during auto-grading.' };
  }
}
