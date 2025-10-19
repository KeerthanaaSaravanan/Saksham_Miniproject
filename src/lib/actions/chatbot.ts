'use server';

import { provideAccessibilityFirstAIChatbotAssistance, ChatbotInput, ChatbotOutput } from "@/ai/flows/provide-accessibility-first-ai-chatbot-assistance";

export async function getChatbotResponse(
  input: ChatbotInput
): Promise<ChatbotOutput | { error: string }> {
  try {
    const result = await provideAccessibilityFirstAIChatbotAssistance(input);
    return result;
  } catch (e: any) {
    console.error(e);
    return { error: e.message || 'An unknown error occurred in the chatbot.' };
  }
}
