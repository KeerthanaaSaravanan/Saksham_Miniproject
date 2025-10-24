
'use server';

import { generatePracticeExam, GeneratePracticeExamInput } from "@/ai/flows/generate-practice-exam";

// The AI can sometimes return a stringified JSON. We handle both cases.
const parseAssessment = (assessment: string | object) => {
    if (typeof assessment === 'string') {
        try {
            return JSON.parse(assessment);
        } catch (e) {
            console.error("Failed to parse stringified JSON from AI", e);
            throw new Error("The AI returned an invalid format. Please try again.");
        }
    }
    return assessment;
}

export async function createPracticeExam(
    input: GeneratePracticeExamInput
): Promise<{ exam: any[] } | { error: string }> {
  try {
    const result = await generatePracticeExam(input);
    const examData = parseAssessment(result.questions as any);
    return { exam: examData };
  } catch (e: any) {
    console.error(e);
    let errorMessage = 'An unknown error occurred while generating the practice exam.';
    if (e.message) {
      errorMessage = e.message;
    }
    return { error: errorMessage };
  }
}
