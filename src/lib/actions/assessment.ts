'use server';

import { generateCustomizedAssessments, GenerateCustomizedAssessmentsInput } from "@/ai/flows/generate-customized-assessments";

export async function createAssessment(
    input: GenerateCustomizedAssessmentsInput
): Promise<{ assessment: any } | { error: string }> {
  try {
    const result = await generateCustomizedAssessments(input);
    // The result.assessment is a JSON string, so we parse it here.
    const assessmentData = JSON.parse(result.assessment);
    return { assessment: assessmentData };
  } catch (e: any) {
    console.error(e);
    let errorMessage = 'An unknown error occurred while generating the assessment.';
    if (e instanceof SyntaxError) {
      errorMessage = 'The AI returned an invalid assessment format. Please try again.';
    } else if (e.message) {
      errorMessage = e.message;
    }
    return { error: errorMessage };
  }
}
