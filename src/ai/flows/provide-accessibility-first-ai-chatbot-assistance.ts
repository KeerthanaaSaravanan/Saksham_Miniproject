
'use server';
/**
 * @fileOverview An AI chatbot that provides accessibility-first assistance.
 *
 * - provideAccessibilityFirstAIChatbotAssistance - A function that handles chatbot interactions.
 * - ChatbotInput - The input type for the provideAccessibilityFirstAIChatbotAssistance function.
 * - ChatbotOutput - The return type for the provideAccessibilityFirstAIChatbotAssistance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatbotInputSchema = z.object({
  userMessage: z.string().describe('The message or transcribed spoken text from the user.'),
  modality: z
    .enum(['text', 'voice'])
    .describe('The preferred modality of the user (text or voice).'),
  pastMessages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional().describe('Past messages in the conversation for context.'),
  context: z.object({
    current_page: z.string().describe("The current page the user is on (e.g., 'dashboard', 'assessment').")
  }).optional().describe("Additional context about the user's current state.")
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
  confidence: z.number().describe('A score from 0.0 to 1.0 indicating the AI\'s confidence in its interpretation of the intent.')
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
4) Never invent personal data, exam results, or claims; if information is missing, respond with an "MISSING" field.
5) For any voice output, keep sentences short (≤ 12 words) and phrase instructions positively. Your response in the 'tts_text' field MUST follow this rule strictly.
6) Always confirm critical actions (submitting exam, changing accessibility settings) with explicit voice prompt and a one-step undo option.
7) Log only metadata (timestamps, intent, errors), never raw user voice or PII in logs. Ask for consent before recording beyond ephemeral session.
8) If asked about policy or sensitive topics, refuse politely and provide safe alternatives.
9) Map the user's spoken text to one of the canonical commands in the 'intent' field. If the user's request is ambiguous, ask one simple clarifying question and set 'clarify' to true.
10) Your response MUST be valid JSON that strictly matches the provided output schema.

Current Page Context: {{context.current_page}}
`,
  prompt: `User message (modality: {{modality}}):
"{{{userMessage}}}"
`,
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
