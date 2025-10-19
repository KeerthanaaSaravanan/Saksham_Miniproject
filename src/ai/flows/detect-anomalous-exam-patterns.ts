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

const DetectAnomalousExamPatternsInputSchema = z.object({
  audioDataUri: z
    .string()
    .optional()
    .describe(
      "Audio data during the exam, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  screenActivityData: z
    .string()
    .optional()
    .describe(
      'Log of screen activity during the exam (e.g., rapid changes), as a JSON stringified array.'
    ),
  examDetails: z.string().describe('Details about the exam, such as subject and difficulty.'),
  studentDetails: z.string().describe('Details about the student taking the exam.'),
});
export type DetectAnomalousExamPatternsInput = z.infer<typeof DetectAnomalousExamPatternsInputSchema>;

const DetectAnomalousExamPatternsOutputSchema = z.object({
  anomalousPatternsDetected: z
    .boolean()
    .describe('Whether anomalous patterns were detected during the exam.'),
  explanation: z
    .string()
    .describe('Explanation of the detected anomalous patterns and their potential implications.'),
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
  prompt: `You are an AI assistant designed to detect anomalous patterns during online exams.

  Based on the provided data, determine if there are any indications of academic dishonesty.

  Consider the following:
  - Audio data: Analyze for background speech or unusual noises.
  - Screen activity data: Look for rapid screen changes or suspicious patterns.

  Exam Details: {{{examDetails}}}
  Student Details: {{{studentDetails}}}
  {{#if audioDataUri}}Audio Data: {{media url=audioDataUri}}{{/if}}
  {{#if screenActivityData}}Screen Activity Data: {{{screenActivityData}}}{{/if}}

  Based on your analysis, set the anomalousPatternsDetected field to true if you suspect academic dishonesty, and provide a detailed explanation.
`,
});

const detectAnomalousExamPatternsFlow = ai.defineFlow(
  {
    name: 'detectAnomalousExamPatternsFlow',
    inputSchema: DetectAnomalousExamPatternsInputSchema,
    outputSchema: DetectAnomalousExamPatternsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
