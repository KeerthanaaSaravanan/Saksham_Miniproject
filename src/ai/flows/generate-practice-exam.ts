
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
    simplifiedStem: z.string().describe("An ultra-simplified version of the stem for SLD users, using simple vocabulary (<= 15 words)."),
    stepByStepHints: z.array(z.string()).optional().describe("For long-answer questions, a list of 2-4 short, guiding sentences to help the student structure their answer. Each hint should be a distinct step."),
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
You are an expert AI for creating practice exams with a focus on accessibility. Create exactly the specified 'num_questions' based on the user's context.
1. For each question, include a 'type', 'difficulty', and a unique 'id'.
2. For "mcq" type, provide exactly 4 plausible options.
3. The 'answer' must be the full text of the correct answer, exactly matching one of the options for MCQs.
4. Provide a concise 'explanation' (<=30 words) for every question.
5. Use simple, dyslexia-friendly phrasing. Keep the question 'stem' length to 20 words or less. Avoid negative phrasing (e.g., "Which is NOT...").
6. CRITICAL FOR SLD: For EVERY question, you MUST generate a 'simplifiedStem'. This should be an even simpler version of the question, using basic vocabulary, active voice, and be 15 words or less.
7. CRITICAL FOR SLD: For 'long-answer' questions, you MUST provide 'stepByStepHints' as an array of 2-4 short, guiding sentences to help the student structure their answer. For other question types, this field can be omitted.
8. Your final response must be a valid JSON object containing a "questions" array.

EXAMPLE (1 item):
{
 "id":"q_001",
 "type":"long-answer",
 "difficulty":"medium",
 "stem":"Explain the process of photosynthesis.",
 "options": [],
 "answer":"Photosynthesis is the process used by plants, algae, and some bacteria to convert light energy into chemical energy, through a process that converts carbon dioxide and water into glucose (sugar) and oxygen.",
 "explanation":"Plants take in CO2 and water, and using sunlight, create sugar for energy and release oxygen.",
 "simplifiedStem":"How do plants make food?",
 "stepByStepHints": ["First, what do plants take in from the air and ground?", "Second, what energy source do they use?", "Finally, what two things do they produce?"]
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
