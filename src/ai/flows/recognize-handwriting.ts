
'use server';
/**
 * @fileOverview An AI flow to recognize and transcribe handwritten text from an image.
 *
 * - recognizeHandwriting - A function that handles the handwriting recognition process.
 * - RecognizeHandwritingInput - The input type for the function.
 * - RecognizeHandwritingOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const RecognizeHandwritingInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A PNG image of the handwriting, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:image/png;base64,<encoded_data>'."
    ),
  context: z.string().optional().describe("Optional context, like the question text, to aid recognition."),
});
export type RecognizeHandwritingInput = z.infer<typeof RecognizeHandwritingInputSchema>;

export const RecognizeHandwritingOutputSchema = z.object({
  text: z.string().describe('The recognized text from the image.'),
  confidence: z.number().min(0).max(1).describe("The AI's confidence in the accuracy of the transcription."),
});
export type RecognizeHandwritingOutput = z.infer<typeof RecognizeHandwritingOutputSchema>;

export async function recognizeHandwriting(
  input: RecognizeHandwritingInput
): Promise<RecognizeHandwritingOutput> {
  return recognizeHandwritingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recognizeHandwritingPrompt',
  input: { schema: RecognizeHandwritingInputSchema },
  output: { schema: RecognizeHandwritingOutputSchema },
  system: `INTENT: "handwriting_ocr"
INSTRUCTIONS:
You are an expert at optical character recognition (OCR) for handwritten text, including mathematical formulas and diagrams.
1.  Analyze the provided image and transcribe the handwritten content into text.
2.  If mathematical equations are present, represent them using LaTeX.
3.  Use the provided 'context' to resolve ambiguities if possible.
4.  Estimate your 'confidence' on a scale of 0.0 to 1.0 based on the legibility of the handwriting.
5.  Your response must be a valid JSON object matching the provided schema.
`,
  prompt: `CONTEXT:
{
    "image": {{media url=imageDataUri}},
    "context": "{{context}}"
}`,
  config: {
    temperature: 0.0,
  },
});

const recognizeHandwritingFlow = ai.defineFlow(
  {
    name: 'recognizeHandwritingFlow',
    inputSchema: RecognizeHandwritingInputSchema,
    outputSchema: RecognizeHandwritingOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
