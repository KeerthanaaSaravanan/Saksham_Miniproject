
'use server';
/**
 * @fileOverview Captures and processes a student's spoken answer.
 *
 * - captureVoiceAnswer - A function that handles the voice answer processing.
 * - CaptureVoiceAnswerInput - The input type for the function.
 * - CaptureVoiceAnswerOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CaptureVoiceAnswerInputSchema = z.object({
  raw_transcript: z.string().describe("The raw transcript from the Speech-to-Text engine."),
  question_type: z.enum(['mcq', 'fillup', 'short-answer', 'long-answer']).describe("The type of question being answered."),
});
export type CaptureVoiceAnswerInput = z.infer<typeof CaptureVoiceAnswerInputSchema>;

const CaptureVoiceAnswerOutputSchema = z.object({
    raw_text: z.string().describe("The original, unprocessed transcript."),
    normalized_text: z.string().describe("The cleaned and corrected version of the answer text."),
    summary: z.string().describe("A short, normalized summary of the answer (<=30 words)."),
    stt_confidence: z.number().min(0).max(1).describe("A score from 0.0 to 1.0 indicating the AI's confidence in the STT accuracy."),
    requires_clarify: z.boolean().describe("True if the AI recommends asking the user to repeat or spell out the answer due to low confidence."),
});
export type CaptureVoiceAnswerOutput = z.infer<typeof CaptureVoiceAnswerOutputSchema>;


export async function captureVoiceAnswer(input: CaptureVoiceAnswerInput): Promise<CaptureVoiceAnswerOutput> {
  return captureVoiceAnswerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'captureVoiceAnswerPrompt',
  input: {schema: CaptureVoiceAnswerInputSchema},
  output: {schema: CaptureVoiceAnswerOutputSchema},
  system: `INTENT: "capture_answer"
INSTRUCTIONS:
You are an AI assistant that processes a raw speech-to-text transcript of a student's answer.
1. Analyze the 'raw_transcript' to extract the student's actual answer. Clean up any filler words (e.g., "um", "ah", "my answer is").
2. Place the cleaned-up answer into the 'normalized_text' field.
3. Create a concise 'summary' of the normalized answer, no more than 30 words.
4. Estimate the 'stt_confidence' on a scale of 0.0 to 1.0 based on the clarity and coherence of the transcript.
5. If the transcript is very unclear, garbled, or confidence is low (< 0.7), set 'requires_clarify' to true. Otherwise, set it to false.
6. Your response must be a valid JSON object matching the provided schema.
`,
  prompt: `CONTEXT:
{
  "raw_transcript": "{{raw_transcript}}",
  "question_type": "{{question_type}}"
}`,
});

const captureVoiceAnswerFlow = ai.defineFlow(
  {
    name: 'captureVoiceAnswerFlow',
    inputSchema: CaptureVoiceAnswerInputSchema,
    outputSchema: CaptureVoiceAnswerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
