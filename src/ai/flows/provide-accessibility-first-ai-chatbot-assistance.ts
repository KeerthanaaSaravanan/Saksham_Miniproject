
'use server';
/**
 * @fileOverview An AI chatbot that provides accessibility-first assistance by mapping spoken language to structured commands.
 *
 * - provideAccessibilityFirstAIChatbotAssistance - A function that handles chatbot interactions.
 * - ChatbotInput - The input type for the provideAccessibilityFirstAIChatbotAssistance function.
 * - ChatbotOutput - The return type for the provideAccessibilityFirstAIChatbotAssistance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatbotInputSchema = z.object({
  user_id: z.string().describe("A unique identifier for the user session."),
  current_page: z.string().describe("The current page the user is on (e.g., 'dashboard', 'assessment')."),
  spoken_text: z.string().describe("The raw transcribed text from the user's voice input."),
  accessibility: z.object({
    font: z.string().optional().describe("The currently active font setting."),
    tts_speed: z.string().optional().describe("The user's preferred text-to-speech speed.")
  }).optional().describe("The user's current accessibility settings.")
});
export type ChatbotInput = z.infer<typeof ChatbotInputSchema>;

const ChatbotOutputSchema = z.object({
  intent: z.enum([
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
export type ChatbotOutput = z.infer<typeof ChatbotOutputSchema>;


export async function provideAccessibilityFirstAIChatbotAssistance(
  input: ChatbotInput
): Promise<ChatbotOutput> {
  return provideAccessibilityFirstAIChatbotAssistanceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'accessibilityFirstAIChatbotPrompt',
  input: {schema: ChatbotInputSchema},
  output: {schema: ChatbotOutputSchema},
  system: `You are SAKSHAM Assistant — a secure, dignity-first conversational AI assistant for differently-abled students (blind & SLD) and faculty. Your primary goals:
1) Enable full hands-free navigation, learning, and exam-taking with maximum reliability and privacy.
2) Always return machine-parseable JSON when asked for structured output. Validate and reformat to match requested schema exactly.
3) Respect user accessibility preferences and persist them during the session.
4. Never invent personal data, exam results, or claims; if information is missing, respond with an explicit "MISSING" field.
5) For any voice output in 'tts_text', keep sentences short (<= 12 words) and phrase instructions positively.
6) Always confirm critical actions (submitting exam, changing accessibility settings) with explicit voice prompt and a one-step undo option.
7) Log only metadata (timestamps, intent, errors), never raw user voice or PII in logs. Ask for consent before recording beyond ephemeral session.
8) If asked about policy or sensitive topics, refuse politely and provide safe alternatives.
9) Map the user's spoken text to one of the canonical commands in the 'intent' field. If the user's request is ambiguous, ask one simple clarifying question and set 'clarify' to true.
10) Your response MUST be valid JSON that strictly matches the provided output schema.

Pro-tips:
- Always normalize numbers from words ("five" -> 5), and handle ordinal forms ("5th").
- If confidence in the intent is < 0.7, set clarify=true and ask a short yes/no confirmation question in tts_text.

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
{{{json (rootValue)}}}

INSTRUCTIONS:
Map the spoken_text from the context to one canonical command. If ambiguous, ask one clarifying question. Return JSON with canonical intent, slot values, and follow_up_text.`,
  config: {
    temperature: 0.1,
    maxOutputTokens: 512,
  },
});

const provideAccessibilityFirstAIChatbotAssistanceFlow = ai.defineFlow(
  {
    name: 'provideAccessibilityFirstAIChatbotAssistanceFlow',
    inputSchema: ChatbotInputSchema,
    outputSchema: ChatbotOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
