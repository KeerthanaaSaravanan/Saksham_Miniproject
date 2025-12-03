
'use server';
/**
 * @fileOverview Detects anomalous patterns during exams, such as background speech or rapid screen changes.
 *
 * - detectAnomalousExamPatterns - A function that analyzes exam data for anomalous patterns.
 * - DetectAnomalousExamPatternsInput - The input type for the detectAnomalousExamPatterns function.
 * - DetectAnomalousExamPatternsOutput - The return type for the detectAnomalousExamPatterns function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const DetectAnomalousExamPatternsInputSchema = z.object({
  event_type: z.enum(['focus_lost', 'multiple_faces_detected', 'background_noise']),
  details: z.object({
      timestamp: z.string().describe("The ISO 8601 timestamp of when the event occurred."),
      metadata: z.record(z.any()).optional().describe("Any additional metadata about the event."),
  }).describe("Detailed information about the proctoring event."),
});
export type DetectAnomalousExamPatternsInput = z.infer<typeof DetectAnomalousExamPatternsInputSchema>;

export const DetectAnomalousExamPatternsOutputSchema = z.object({
  severity: z.enum(['low', 'medium', 'high']).describe("The assessed severity of the event."),
  tts_text: z.string().describe("A short, human-friendly notification to be read aloud to the student."),
  incident_record: z.object({
    id: z.string().describe("A unique identifier for this incident record."),
    timestamp: z.string().describe("The ISO 8601 timestamp for the incident."),
    metadata: z.record(zany()).optional().describe("A structured log of the event details."),
  }).describe("A structured record of the detected incident for logging and faculty review.")
});
export type DetectAnomalousExamPatternsOutput = z.infer<typeof DetectAnomalousExamPatternsOutputSchema>;


export async function detectAnomalousExamPatterns(
  input: DetectAnomalousExamPatternsInput
): Promise<DetectAnomalousExamPatternsOutput> {
  return detectAnomalousExamPatternsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectAnomalousExamPatternsPrompt',
  input: {schema: DetectAnomalousExamPatternsInputSchema},
  output: {schema: DetectAnomalousExamPatternsOutputSchema},
  system: `INTENT: "proctor_event"
INSTRUCTIONS:
You are an AI proctoring assistant. Your task is to assess a proctoring event and generate a student-friendly notification and a structured incident record.
1.  Based on the 'event_type', determine the 'severity'. 'focus_lost' is medium, 'background_noise' is low, 'multiple_faces_detected' is high.
2.  Generate a concise, polite 'tts_text' for the student. For 'focus_lost', gently remind them to stay in the exam window.
3.  Create a structured 'incident_record' with a unique ID and a timestamp.
4.  Your response must be a valid JSON object matching the provided schema.
`,
  prompt: `CONTEXT:
{{{json (rootValue)}}}`,
  config: {
    temperature: 0.1,
  },
});

const detectAnomalousExamPatternsFlow = ai.defineFlow(
  {
    name: 'detectAnomalousExamPatternsFlow',
    inputSchema: DetectAnomalousExamPatternsInputSchema,
    outputSchema: DetectAnomalousExamPatternsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    // Add a unique ID to the incident record
    if (output) {
        output.incident_record.id = `inc_${Date.now()}`;
    }
    return output!;
  }
);
