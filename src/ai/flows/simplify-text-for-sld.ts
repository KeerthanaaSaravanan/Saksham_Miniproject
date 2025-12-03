
'use server';
/**
 * @fileOverview An AI flow to simplify text for users with Specific Learning Disabilities.
 *
 * - simplifyTextForSLD - A function that handles the text simplification process.
 * - SimplifyTextForSLDInput - The input type for the function.
 * - SimplifyTextForSLDOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SimplifyTextForSLDInputSchema = z.object({
  text: z.string().describe("The original text to be simplified."),
  level: z.enum(["grade_4", "grade_6", "grade_8"]).describe("The target grade level for simplification."),
});
export type SimplifyTextForSLDInput = z.infer<typeof SimplifyTextForSLDInputSchema>;

const SimplifyTextForSLDOutputSchema = z.object({
    simplified_text: z.string().describe("The simplified version of the text, suitable for direct display."),
    audio_lines: z.array(z.string()).describe("The simplified text, broken down into short, speakable lines for TTS."),
    confidence: z.number().min(0).max(1).describe("The AI's confidence in the quality and accuracy of the simplification."),
});
export type SimplifyTextForSLDOutput = z.infer<typeof SimplifyTextForSLDOutputSchema>;

export async function simplifyTextForSLD(input: SimplifyTextForSLDInput): Promise<SimplifyTextForSLDOutput> {
  return simplifyTextForSLDFlow(input);
}

const prompt = ai.definePrompt({
  name: 'simplifyTextForSLDPrompt',
  input: {schema: SimplifyTextForSLDInputSchema},
  output: {schema: SimplifyTextForSLDOutputSchema},
  system: `INTENT: "simplify_text"
INSTRUCTIONS:
You are an expert in educational psychology, specializing in simplifying complex text for students with Specific Learning Disabilities (SLD).
1.  Rewrite the user's 'text' to be easily understandable at the specified grade 'level'.
2.  Use simple vocabulary, short sentences (max 10-12 words), and an active voice.
3.  Ensure the core meaning and any critical information (like numbers or key terms) are preserved.
4.  Populate 'simplified_text' with the full, paragraph-style simplified text.
5.  Populate 'audio_lines' by breaking the 'simplified_text' into an array of short, logically grouped lines suitable for sequential text-to-speech playback.
6.  Your response must be a valid JSON object matching the provided schema.
`,
  prompt: `CONTEXT:
{
    "text_to_simplify": "{{text}}",
    "target_level": "{{level}}"
}`,
  config: {
    temperature: 0.1,
  },
});

const simplifyTextForSLDFlow = ai.defineFlow(
  {
    name: 'simplifyTextForSLDFlow',
    inputSchema: SimplifyTextForSLDInputSchema,
    outputSchema: SimplifyTextForSLDOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
