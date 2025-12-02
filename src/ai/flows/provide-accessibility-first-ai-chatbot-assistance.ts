
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
  userMessage: z.string().describe('The message from the user.'),
  modality: z
    .enum(['text', 'voice'])
    .describe('The preferred modality of the user (text or voice).'),
  pastMessages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional().describe('Past messages in the conversation for context.')
});
export type ChatbotInput = z.infer<typeof ChatbotInputSchema>;

const ChatbotOutputSchema = z.object({
  response: z.string().describe('The response from the AI chatbot.'),
  modality: z.enum(['text', 'voice']).describe('The modality of the response (text or voice).'),
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
4) Never invent personal data, exam results, or claims; if information is missing, respond with an explicit "MISSING" field.
5) For any voice output, keep sentences short (≤ 12 words) and phrase instructions positively.
6) Always confirm critical actions (submitting exam, changing accessibility settings) with explicit voice prompt and a one-step undo option.
7) Log only metadata (timestamps, intent, errors), never raw user voice or PII in logs. Ask for consent before recording beyond ephemeral session.
8) If asked about policy or sensitive topics, refuse politely and provide safe alternatives.

When asked to perform an action, respond with JSON strictly matching the schema provided in the user prompt. If unsure or missing data, fill missing fields with "MISSING" and provide a human escalation token.
Your output MUST be in valid JSON format matching the provided schema.`,
  prompt: `{% if pastMessages %}
Conversation History:
{{#each pastMessages}}
  {{this.role}}: {{this.content}}
{{/each}}
{% endif %}

Current User Message (modality: {{modality}}):
"{{{userMessage}}}"
`,
  config: {
    temperature: 0.2,
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
    return {
      response: output!.response,
      modality: input.modality,
    };
  }
);
