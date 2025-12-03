
'use server';

/**
 * @fileOverview Generates a practice exam based on student specifications.
 *
 * - generatePracticeExam - A function that generates practice questions.
 * - GeneratePracticeExamInput - The input type for the function.
 * - GeneratePracticeamOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GeneratePracticeExamInputSchema = z.object({
  level: z.string().describe("The user's grade or level, e.g., 'grade_8'"),
  subject: z.string().describe('The subject for the exam.'),
  topic: z.string().describe('The specific lesson or topic within the subject.'),
  numQuestions: z.coerce.number().min(1, 'Must be at least 1 question.').max(50, 'Cannot exceed 50 questions.'),
});
export type GeneratePracticeExamInput = z.infer<typeof GeneratePracticeExamInputSchema>;

const questionSchema = z.object({
    id: z.string().describe("A unique identifier for the question, e.g., 'q_001'."),
    type: z.enum(['mcq', 'short_answer', 'fillup', 'long-answer']).describe("The type of the question."),
    difficulty: z.enum(['easy', 'medium', 'hard']).describe("The difficulty level of the question."),
    stem: z.string().describe("The text of the question, phrased simply and without negative phrasing (<= 20 words)."),
    options: z.array(z.string().nullable()).optional().describe("An array of 4 plausible options for MCQs."),
    answer: z.string().describe("The correct answer to the question."),
    explanation: z.string().describe("A brief explanation of how to arrive at the correct answer (<=30 words)."),
});

const GeneratePracticeExamOutputSchema = z.object({
  questions: z.array(questionSchema).describe('An array of generated exam questions.'),
});
type GeneratePracticeExamOutput = z.infer<typeof GeneratePracticeExamOutputSchema>;

export async function generatePracticeExam(
  input: GeneratePracticeExamInput
): Promise<GeneratePracticeExamOutput> {
  return generatePracticeExamFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePracticeExamPrompt',
  input: { schema: GeneratePracticeExamInputSchema },
  output: { schema: GeneratePracticeExamOutputSchema },
  system: `INTENT: "generate_practice_exam"
INSTRUCTIONS:
You are an expert AI for creating practice exams. Create exactly the specified 'num_questions' based on the user's context.
1. For each question, include a 'type' label, a 'difficulty' (easy/medium/hard), and a unique 'id' (e.g., "q_001").
2. For "mcq" type, provide exactly 4 options. Include distractors that are plausible but clearly incorrect.
3. The 'answer' must be the full text of the correct answer, not the letter. For MCQs, it must exactly match one of the provided options.
4. Provide a concise 'explanation' (<=30 words) for every question.
5. Use simple, dyslexia-friendly phrasing. Keep the question 'stem' length to 20 words or less for audio clarity.
6. Avoid negative phrasing in question stems (e.g., "Which of these is NOT...").
7. Your final response must be a valid JSON object containing a "questions" array.

EXAMPLE (1 item):
{
 "id":"q_001",
 "type":"mcq",
 "difficulty":"easy",
 "stem":"What is pressure?",
 "options":["Force per unit area","Weight of object","Speed of object","Distance moved"],
 "answer":"Force per unit area",
 "explanation":"Pressure is defined as the force applied perpendicular to the surface of an object per unit area."
}`,
  prompt: `CONTEXT:
{
  "user_level": "{{level}}",
  "subject": "{{subject}}",
  "topic": "{{topic}}",
  "num_questions": {{numQuestions}}
}`,
  config: {
    temperature: 0.2,
    maxOutputTokens: 2048,
  },
});

const generatePracticeExamFlow = ai.defineFlow(
  {
    name: 'generatePracticeExamFlow',
    inputSchema: GeneratePracticeExamInputSchema,
    outputSchema: GeneratePracticeExamOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
