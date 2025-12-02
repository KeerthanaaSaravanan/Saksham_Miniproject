
'use server';

/**
 * @fileOverview Automatically profiles a user's accessibility needs using webcam input and OCR/NLP.
 *
 * - automaticallyProfileAccessibilityNeeds - A function that handles the accessibility profiling process.
 * - AutomaticallyProfileAccessibilityNeedsInput - The input type for the automaticallyProfileAccessibilityNeeds function.
 * - AutomaticallyProfileAccessibilityNeedsOutput - The return type for the automaticallyProfileAccessibilityNeeds function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AutomaticallyProfileAccessibilityNeedsInputSchema = z.object({
  webcamDataUri: z
    .string()
    .describe(
      'A photo captured from the user\'s webcam, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
});
export type AutomaticallyProfileAccessibilityNeedsInput = z.infer<typeof AutomaticallyProfileAccessibilityNeedsInputSchema>;

const AutomaticallyProfileAccessibilityNeedsOutputSchema = z.object({
  needsProfile: z.object({
    visualImpairment: z.boolean().describe('Whether the user has a visual impairment.'),
    sld: z.boolean().describe('Whether the user has a Specific Learning Disability.'),
    additionalNotes: z.string().describe('Any additional notes about the user\'s accessibility needs.'),
  }).describe('The accessibility needs profile of the user based on the webcam input.'),
});
export type AutomaticallyProfileAccessibilityNeedsOutput = z.infer<typeof AutomaticallyProfileAccessibilityNeedsOutputSchema>;

export async function automaticallyProfileAccessibilityNeeds(input: AutomaticallyProfileAccessibilityNeedsInput): Promise<AutomaticallyProfileAccessibilityNeedsOutput> {
  return automaticallyProfileAccessibilityNeedsFlow(input);
}

const automaticallyProfileAccessibilityNeedsPrompt = ai.definePrompt({
  name: 'automaticallyProfileAccessibilityNeedsPrompt',
  input: {schema: AutomaticallyProfileAccessibilityNeedsInputSchema},
  output: {schema: AutomaticallyProfileAccessibilityNeedsOutputSchema},
  system: `You are an AI assistant that analyzes webcam input to automatically profile a user's accessibility needs.
  Analyze the webcam input to determine if the user has any visual or specific learning disabilities (SLD).
  Consider factors such as the user's environment, any assistive devices they may be using, and any observable difficulties they may be experiencing.
  Based on your analysis, generate an accessibility needs profile for the user, setting the appropriate boolean flags (visualImpairment, sld) to true or false. Also provide any additional notes on the user's accessibility needs in additionalNotes field.
  Your output MUST be in valid JSON format matching the provided schema.`,
  prompt: `Webcam Input: {{media url=webcamDataUri}}`,
  config: {
    temperature: 0.2,
    maxOutputTokens: 512,
  },
});

const automaticallyProfileAccessibilityNeedsFlow = ai.defineFlow(
  {
    name: 'automaticallyProfileAccessibilityNeedsFlow',
    inputSchema: AutomaticallyProfileAccessibilityNeedsInputSchema,
    outputSchema: AutomaticallyProfileAccessibilityNeedsOutputSchema,
  },
  async input => {
    const {output} = await automaticallyProfileAccessibilityNeedsPrompt(input);
    return output!;
  }
);
