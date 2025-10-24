
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

const questionTypesEnum = z.enum(['mcq', 'fillup', 'short-answer', 'long-answer']);

const GeneratePracticeExamInputSchema = z.object({
  subject: z.string().describe('The subject for the exam.'),
  lesson: z.string().describe('The specific lesson or topic within the subject.'),
  questionTypes: z.array(questionTypesEnum).min(1, 'At least one question type must be selected.'),
  questionCount: z.number().int().min(1).max(20).describe('The number of questions to generate.'),
  duration: z.number().int().min(1).describe('The suggested duration for the exam in minutes.'),
});
export type GeneratePracticeExamInput = z.infer<typeof GeneratePracticeExamInputSchema>;

const questionSchema = z.object({
    question: z.string().describe("The text of the question."),
    type: questionTypesEnum.describe("The type of the question."),
    options: z.array(z.string()).optional().describe("A list of multiple-choice options. Required only for 'mcq' type."),
    correctAnswer: z.string().describe("The correct answer to the question."),
    explanation: z.string().describe("A brief explanation of how to arrive at the correct answer."),
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
  prompt: `You are an expert exam creator for students. Your task is to generate a set of practice questions based on the user's specifications.

  Specifications:
  - Subject: {{{subject}}}
  - Lesson/Topic: {{{lesson}}}
  - Question Types: {{#each questionTypes}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  - Number of Questions: {{{questionCount}}}

  Instructions:
  1. Generate exactly {{{questionCount}}} questions.
  2. Distribute the questions among the selected types: {{#each questionTypes}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}.
  3. For 'mcq' (multiple choice) questions, you MUST provide an 'options' array with at least 3 distinct options.
  4. For ALL question types, you MUST provide the 'correctAnswer'. For MCQs, the correct answer must be one of the provided options.
  5. For ALL question types, you MUST provide a concise 'explanation' detailing how to arrive at the correct answer.
  6. The questions should be relevant to the specified subject and lesson.
  7. Ensure the output is a valid JSON object matching the required schema.

  Your output MUST be valid JSON.
`,
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
