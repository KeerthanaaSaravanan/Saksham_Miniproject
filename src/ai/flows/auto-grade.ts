
'use server';
/**
 * @fileOverview An AI assistant for faculty to auto-grade student submissions.
 *
 * - autoGradeAnswer - A function that handles the auto-grading process.
 * - AutoGradeInput - The input type for the function.
 * - AutoGradeOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AutoGradeInputSchema = z.object({
  question: z.string().describe("The full text of the question."),
  correctAnswer: z.string().describe("The reference correct answer key."),
  studentAnswer: z.string().describe("The student's submitted answer."),
  rubric: z.string().optional().describe("An optional grading rubric provided by the faculty."),
  maxScore: z.number().describe("The maximum score this question is worth."),
});
export type AutoGradeInput = z.infer<typeof AutoGradeInputSchema>;

const AutoGradeOutputSchema = z.object({
    score: z.number().describe("The numeric grade awarded out of the max_score."),
    maxScore: z.number().describe("The maximum score this question is worth."),
    justification: z.string().describe("A concise (<=30 words) justification for the awarded score, referencing the rubric or correct answer."),
    human_review: z.boolean().describe("Set to true if the response is ambiguous, partially correct, or AI confidence is low."),
    confidence: z.number().min(0).max(1).describe("The AI's confidence in its grading accuracy."),
});
export type AutoGradeOutput = z.infer<typeof AutoGradeOutputSchema>;

export async function autoGradeAnswer(input: AutoGradeInput): Promise<AutoGradeOutput> {
  return autoGradeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'autoGradePrompt',
  input: {schema: AutoGradeInputSchema},
  output: {schema: AutoGradeOutputSchema},
  system: `INTENT: "auto_grade"
INSTRUCTIONS:
You are an AI grading assistant for educators. Your task is to evaluate a student's response against a correct answer and an optional rubric.
1.  For objective or multiple-choice questions, perform an exact match against the 'correctAnswer'. Award full marks for a match, zero otherwise.
2.  For short-answer or subjective questions, perform a semantic match. Use the provided 'rubric' as the primary basis for scoring.
3.  Calculate the 'score' as a numeric value out of the 'maxScore'.
4.  Provide a concise 'justification' (<=30 words) for your score.
5.  If your confidence in the grading is less than 0.75, or if the answer is ambiguous or partially correct, you MUST set 'human_review' to true.
6.  Your response must be a valid JSON object matching the provided schema.
`,
  prompt: `CONTEXT:
{
    "question": "{{question}}",
    "correct_answer": "{{correctAnswer}}",
    "student_response": "{{studentAnswer}}",
    "rubric": "{{rubric}}",
    "max_score": {{maxScore}}
}`,
  config: {
    temperature: 0.1,
  },
});

const autoGradeFlow = ai.defineFlow(
  {
    name: 'autoGradeFlow',
    inputSchema: AutoGradeInputSchema,
    outputSchema: AutoGradeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    // Ensure the output's maxScore matches the input's maxScore
    if (output) {
        output.maxScore = input.maxScore;
    }
    return output!;
  }
);
