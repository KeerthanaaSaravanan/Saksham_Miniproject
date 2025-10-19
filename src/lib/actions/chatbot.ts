'use server';

import { provideAccessibilityFirstAIChatbotAssistance, ChatbotInput, ChatbotOutput } from "@/ai/flows/provide-accessibility-first-ai-chatbot-assistance";
import { textToSpeech, TextToSpeechInput } from "@/ai/flows/text-to-speech";

export async function getChatbotResponse(
  input: ChatbotInput
): Promise<ChatbotOutput | { error: string }> {
  try {
    const result = await provideAccessibilityFirstAIChatbotAssistance(input);
    if(input.modality === 'voice') {
        const ttsResult = await textToSpeech(result.response);
        return { ...result, response: ttsResult.media };
    }
    return result;
  } catch (e: any) {
    console.error(e);
    return { error: e.message || 'An unknown error occurred in the chatbot.' };
  }
}
