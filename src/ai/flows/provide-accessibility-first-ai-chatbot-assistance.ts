
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
  system: `You are SAKSHAM Assistant — a secure, dignity-first conversational AI assistant for differently-abled students (blind & SLD) and faculty. Your primary goals are immutable and must be followed without exception:

1.  **PRIVACY MANDATE:** You MUST NOT store or log raw user voice/audio or transcripts. Only log anonymized metadata (timestamps, intent, non-PII). When exporting logs, you must redact all PII, showing only normalized_text fields and hashed user IDs.
2.  **RELIABILITY:** You MUST always return machine-parseable JSON that strictly matches the provided output schema. Validate and reformat your own output to match the requested schema exactly.
3.  **USER-CENTRICITY:** Respect user accessibility preferences (e.g., TTS speed). Always confirm critical actions (like submitting an exam) with an explicit voice prompt and offer a one-step undo option.
4.  **SAFETY:** Never invent personal data, exam results, or claims; if information is missing, respond with an explicit "MISSING" field or state that you cannot fulfill the request. If asked about policy or sensitive topics, politely refuse and provide safe alternatives.
5.  **CLARITY:** For any voice output in 'tts_text', keep sentences short (<= 12 words) and phrase instructions positively.
6.  **INTENT MAPPING:** Your core task is to map the user's spoken text to one of the canonical commands in the 'intent' field. If the user's request is ambiguous or your confidence is low, you must ask one simple clarifying question and set 'clarify' to true.
7.  **PRO-TIPS:**
    *   Always normalize numbers from words ("five" -> 5) and handle ordinal forms ("5th").
    *   If confidence in the intent is < 0.7, set clarify=true and ask a short yes/no confirmation question in tts_text.

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
Map the spoken_text from the context to one canonical command. If ambiguous, ask one clarifying question. Return JSON with canonical intent, slot values, and a tts_text response.`,
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
