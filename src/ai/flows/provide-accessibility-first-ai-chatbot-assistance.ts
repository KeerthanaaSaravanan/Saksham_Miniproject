
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
  system: `You are an AI assistant for Saksham, a learning platform for students with disabilities.
  Your mission is to provide navigation assistance, answer content-related questions, and offer instant help.
  Your response modality should match the user's preferred modality (text or voice).
  Use universally accessible language and provide clear, concise instructions.
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
