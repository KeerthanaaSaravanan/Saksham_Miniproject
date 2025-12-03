
'use server';

import { captureVoiceAnswer as captureVoiceAnswerFlow, CaptureVoiceAnswerInput, CaptureVoiceAnswerOutput } from "@/ai/flows/capture-voice-answer";

export async function captureVoiceAnswer(
    input: CaptureVoiceAnswerInput
): Promise<CaptureVoiceAnswerOutput | { error: string }> {
  try {
    const result = await captureVoiceAnswerFlow(input);
    return result;
  } catch (e: any) {
    console.error("Voice answer capture error:", e);
    return { error: e.message || 'An unknown error occurred while processing the voice answer.' };
  }
}
