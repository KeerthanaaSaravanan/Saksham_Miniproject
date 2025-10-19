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
  prompt: `You are an AI assistant designed to provide navigation assistance, answer content-related questions, and offer instant help to students with disabilities.
Your modality ({{modality}}) should match the user's preferred modality. Use universally accessible language and provide clear, concise instructions.

{% if pastMessages %}
  Here is the past conversation history:
  {{#each pastMessages}}
    {{this.role}}: {{this.content}}
  {{/each}}
{% endif %}

User: {{{userMessage}}}
Assistant:`, // Keep the Assistant tag open to ensure the model provides a response.
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
