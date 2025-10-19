'use server';

import { automaticallyProfileAccessibilityNeeds, AutomaticallyProfileAccessibilityNeedsInput, AutomaticallyProfileAccessibilityNeedsOutput } from "@/ai/flows/automatically-profile-accessibility-needs";

export async function profileNeeds(
    input: AutomaticallyProfileAccessibilityNeedsInput
): Promise<AutomaticallyProfileAccessibilityNeedsOutput | { error: string }> {
  try {
    const result = await automaticallyProfileAccessibilityNeeds(input);
    return result;
  } catch (e: any) {
    console.error(e);
    return { error: e.message || 'An unknown error occurred.' };
  }
}
