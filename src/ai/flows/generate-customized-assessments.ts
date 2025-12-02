
'use server';

/**
 * @fileOverview Generates customized assessments based on a student's unique learning needs.
 *
 * - generateCustomizedAssessments - A function that generates customized assessments.
 * - GenerateCustomizedAssessmentsInput - The input type for the generateCustomizedAssessments function.
 * - GenerateCustomizedAssessmentsOutput - The return type for the generateCustomizedAssessments function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCustomizedAssessmentsInputSchema = z.object({
  learningNeeds: z
    .string()
    .describe('A description of the students specific learning needs.'),
  subject: z.string().describe('The subject for which the assessment is being generated.'),
  gradeLevel: z.string().describe('The grade level of the student.'),
  examLengthMinutes: z
    .number()
    .describe('The length of the exam in minutes, used to determine the number of questions.'),
});
export type GenerateCustomizedAssessmentsInput = z.infer<typeof GenerateCustomizedAssessmentsInputSchema>;

const GenerateCustomizedAssessmentsOutputSchema = z.object({
  assessment: z.string().describe('The generated assessment in JSON format.'),
});
export type GenerateCustomizedAssessmentsOutput = z.infer<typeof GenerateCustomizedAssessmentsOutputSchema>;

export async function generateCustomizedAssessments(
  input: GenerateCustomizedAssessmentsInput
): Promise<GenerateCustomizedAssessmentsOutput> {
  return generateCustomizedAssessmentsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCustomizedAssessmentsPrompt',
  input: {schema: GenerateCustomizedAssessmentsInputSchema},
  output: {schema: GenerateCustomizedAssessmentsOutputSchema},
  system: `You are an expert assessment generator for students with learning disabilities.
  You will generate an assessment suited to the students specific learning needs, in the subject and grade level specified.
  The assessment should be in JSON format containing an array of questions. Each question should include the question text, answer options, and the correct answer.
  Your output MUST be valid JSON.`,
  prompt: `Learning Needs: {{{learningNeeds}}}
Subject: {{{subject}}}
Grade Level: {{{gradeLevel}}}
Exam Length (minutes): {{{examLengthMinutes}}}
`,
  config: {
    temperature: 0.2,
    maxOutputTokens: 1024,
  },
});

const generateCustomizedAssessmentsFlow = ai.defineFlow(
  {
    name: 'generateCustomizedAssessmentsFlow',
    inputSchema: GenerateCustomizedAssessmentsInputSchema,
    outputSchema: GenerateCustomizedAssessmentsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
