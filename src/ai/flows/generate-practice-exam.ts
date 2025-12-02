
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
  numberOfQuestions: z.coerce.number().min(1, 'Must be at least 1 question.').max(50, 'Cannot exceed 50 questions.'),
  duration: z.number().int().min(1).max(180, 'Duration cannot exceed 180 minutes.'),
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
  system: `You are an expert exam creator for students. Your task is to generate a set of practice questions based on the user's specifications.
  Instructions:
  1. Generate exactly the requested number of questions.
  2. Distribute the questions among the selected types.
  3. For 'mcq' questions, you MUST provide an 'options' array with at least 3 distinct options.
  4. For ALL question types, you MUST provide the 'correctAnswer'. For MCQs, the correct answer must be one of the provided options.
  5. For ALL question types, you MUST provide a concise 'explanation' detailing how to arrive at the correct answer.
  6. The questions should be relevant to the specified subject and lesson.
  7. Your output MUST be a valid JSON object matching the required schema. Do not add any commentary or extra text.`,
  prompt: `Generate a practice exam with the following specifications:
  - Subject: {{{subject}}}
  - Lesson/Topic: {{{lesson}}}
  - Number of Questions: {{{numberOfQuestions}}}
  - Question Types: {{#each questionTypes}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  `,
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
