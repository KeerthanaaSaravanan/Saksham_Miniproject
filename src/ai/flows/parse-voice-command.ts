
'use server';
/**
 * @fileOverview An AI chatbot that provides accessibility-first assistance by mapping spoken language to structured commands.
 *
 * - parseVoiceCommand - A function that handles chatbot interactions.
 * - ParseVoiceCommandInput - The input type for the parseVoiceCommand function.
 * - ParseVoiceCommandOutput - The return type for the parseVoiceCommand function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ParseVoiceCommandInputSchema = z.object({
  transcript: z.string().describe("The raw transcribed text from the user's voice input."),
  pageContext: z.string().describe("The current page the user is on (e.g., 'dashboard', 'assessment')."),
});
export type ParseVoiceCommandInput = z.infer<typeof ParseVoiceCommandInputSchema>;

const ParseVoiceCommandOutputSchema = z.object({
  intent: z.enum([
      "open_dashboard",
      "open_exams",
      "open_practice",
      "open_profile",
      "go_to_question",
      "select_option",
      "flag_question",
      "repeat_question",
      "help",
      "unknown"
    ]).describe('The canonical command intent mapped from the user\'s spoken text.'),
  slots: z.object({
      question_number: z.number().nullable().describe('The question number extracted, if any.'),
      option: z.enum(['A', 'B', 'C', 'D']).nullable().describe('The selected option letter, if any.'),
  }).describe('Extracted parameters from the user\'s command.'),
  tts_text: z.string().describe('The text the AI should speak back to the user. This is the primary output for voice interactions.'),
  clarify: z.boolean().describe('True if the AI is asking a clarifying question due to ambiguity.'),
  confidence: z.number().min(0).max(1).describe('A score from 0.0 to 1.0 indicating the AI\'s confidence in its interpretation of the intent.')
});
export type ParseVoiceCommandOutput = z.infer<typeof ParseVoiceCommandOutputSchema>;


export async function parseVoiceCommand(
  input: ParseVoiceCommandInput
): Promise<ParseVoiceCommandOutput> {
  return parseVoiceCommandFlow(input);
}

const prompt = ai.definePrompt({
  name: 'parseVoiceCommandPrompt',
  input: {schema: ParseVoiceCommandInputSchema},
  output: {schema: ParseVoiceCommandOutputSchema},
  system: `You are SAKSHAM Assistant — a secure, dignity-first conversational AI assistant.
Your core task is to map the user's spoken text to one of the canonical commands in the 'intent' field. If the user's request is ambiguous or your confidence is low, you must ask one simple clarifying question and set 'clarify' to true.
Keep sentences for 'tts_text' short (<= 12 words) and phrase instructions positively.
Normalize numbers from words ("five" -> 5) and handle ordinal forms ("5th").
If confidence in the intent is < 0.7, set clarify=true and ask a short yes/no confirmation question in tts_text.

Example of a perfect response:
User Input transcript: "Go to question five"
Your Output:
{
 "intent":"go_to_question",
 "slots":{"question_number":5,"option":null},
 "tts_text":"Opening question five. Say 'repeat' to hear it again.",
 "clarify":false,
 "confidence":0.97
}
`,
  prompt: `CONTEXT:
{
    "transcript": "{{transcript}}",
    "pageContext": "{{pageContext}}"
}

INSTRUCTIONS:
Map the transcript from the context to one canonical command. If ambiguous, ask one clarifying question. Return JSON with canonical intent, slot values, and a tts_text response.`,
  config: {
    temperature: 0.1,
    maxOutputTokens: 512,
  },
});

const parseVoiceCommandFlow = ai.defineFlow(
  {
    name: 'parseVoiceCommandFlow',
    inputSchema: ParseVoiceCommandInputSchema,
    outputSchema: ParseVoiceCommandOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
