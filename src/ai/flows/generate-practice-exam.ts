
'use server';

/**
 * @fileOverview Generates a practice exam based on student specifications.
 *
 * - generatePracticeExam - A function that generates practice questions.
 * - GeneratePracticeExamInput - The input type for the function.
 * - GeneratePracticeExamOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const questionTypesEnum = z.enum(['mcq', 'short_answer', 'fillup', 'long-answer']);

const GeneratePracticeExamInputSchema = z.object({
  subject: z.string().describe('The subject for the exam.'),
  lesson: z.string().describe('The specific lesson or topic within the subject.'),
  questionTypes: z.array(questionTypesEnum).min(1, 'At least one question type must be selected.'),
  numberOfQuestions: z.coerce.number().min(1, 'Must be at least 1 question.').max(50, 'Cannot exceed 50 questions.'),
  duration: z.number().int().min(1).max(180, 'Duration cannot exceed 180 minutes.'),
  user_level: z.string().describe("The user's grade or level, e.g., 'grade_8'"),
});
export type GeneratePracticeExamInput = z.infer<typeof GeneratePracticeExamInputSchema>;

const questionSchema = z.object({
    id: z.string().describe("A unique identifier for the question, e.g., 'q_001'."),
    type: questionTypesEnum.describe("The type of the question."),
    difficulty: z.enum(['easy', 'medium', 'hard']).describe("The difficulty level of the question."),
    stem: z.string().describe("The text of the question, phrased simply and without negative phrasing (<= 20 words)."),
    options: z.array(z.string()).optional().describe("An array of 4 plausible options for MCQs."),
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
Create a set of practice questions based on the user's specifications.
1. Create exactly the specified 'num_questions'.
2. For each question, include a type label, difficulty (easy/medium/hard), and a unique 'id' (e.g., "q_001").
3. For "mcq" type, provide exactly 4 options. Include distractors that are plausible but clearly incorrect.
4. The 'answer' must be one of the provided options for MCQs.
5. Provide a concise 'explanation' (<=30 words) for every question.
6. Use simple, dyslexia-friendly phrasing. Keep question 'stem' length to 20 words or less for audio clarity.
7. Avoid negative phrasing in question stems (e.g., "Which of these is NOT...").
8. Return a valid JSON object containing a "questions" array.

Example for one item:
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
  "user_level": "{{user_level}}",
  "subject": "{{subject}}",
  "topic": "{{lesson}}",
  "num_questions": {{numberOfQuestions}},
  "format": "{{#each questionTypes}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}"
}`,
  config: {
    temperature: 0.2,
    maxOutputTokens: 1024,
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
