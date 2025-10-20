'use server';

import { extractQuestionsFromDocument as extractQuestionsFlow, ExtractQuestionsInput } from "@/ai/flows/extract-questions-from-document";

const parseExtractedQuestions = (questions: any[]) => {
    // The AI might return a stringified JSON inside the array.
    if (Array.isArray(questions)) {
        return questions.map(q => {
            if (typeof q === 'string') {
                try { return JSON.parse(q); } catch { return q; }
            }
            return q;
        }).flat();
    }
    return questions;
}


export async function extractQuestionsFromDocument(
    input: ExtractQuestionsInput
): Promise<{ questions: any[] } | { error: string }> {
  try {
    const result = await extractQuestionsFlow(input);
    const parsedQuestions = parseExtractedQuestions(result.questions);
    return { questions: parsedQuestions };
  } catch (e: any) {
    console.error("Document parsing error:", e);
    return { error: e.message || 'An unknown error occurred while parsing the document.' };
  }
}
