
'use server';
/**
 * @fileOverview Extracts structured questions from an uploaded document.
 *
 * - extractQuestionsFromDocument - A function that handles the document parsing process.
 * - ExtractQuestionsInput - The input type for the function.
 * - ExtractQuestionsOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractQuestionsInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "The exam document as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  subject: z.string().describe('The subject of the exam.'),
  gradeLevel: z.string().describe('The grade level for the exam.'),
  examType: z.string().optional().describe('The type of exam (e.g., Mid-Term, Final).'),
});
export type ExtractQuestionsInput = z.infer<typeof ExtractQuestionsInputSchema>;


const questionSchema = z.object({
    question: z.string().describe("The text of the question."),
    type: z.enum(['mcq', 'fillup', 'short-answer', 'long-answer']).describe("The type of the question."),
    options: z.array(z.string()).optional().describe("A list of multiple-choice options. Required only for 'mcq' type."),
    marks: z.number().optional().describe("The marks allocated to the question.")
});

const ExtractQuestionsOutputSchema = z.object({
  questions: z.array(questionSchema).describe('An array of extracted exam questions.'),
});
export type ExtractQuestionsOutput = z.infer<typeof ExtractQuestionsOutputSchema>;


export async function extractQuestionsFromDocument(input: ExtractQuestionsInput): Promise<ExtractQuestionsOutput> {
  return extractQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractQuestionsFromDocumentPrompt',
  input: {schema: ExtractQuestionsInputSchema},
  output: {schema: ExtractQuestionsOutputSchema},
  prompt: `You are an expert AI assistant that extracts and structures examination questions from an uploaded document.

  Your task is to parse the provided document for a {{subject}} exam for {{gradeLevel}}.
  {{#if examType}}
  This is a {{examType}} exam.
  {{/if}}

  {{#ifCond examType '==' 'Final Term'}}
  The exam should be for a total of 100 marks and a duration of 3 hours.
  {{else}}
  The exam should be for a total of 50 marks and a duration of 1.5 hours.
  {{/ifCond}}
  
  Distribute the marks among the questions logically if they are not specified in the document.

  Identify all questions and classify them into one of the following types:
  - 'mcq': Multiple Choice Question
  - 'fillup': Fill in the Blanks
  - 'short-answer': Short Answer Question
  - 'long-answer': Long Answer Question

  For each question, extract the following:
  - The full question text.
  - The question type.
  - For MCQs, extract all the options.
  - The marks for the question.
  
  Do NOT include a 'correctAnswer' field in your output. Grading will be done manually.

  Document Content:
  {{media url=documentDataUri}}

  Your output MUST be a valid JSON object matching the required schema.
  `,
});

const extractQuestionsFlow = ai.defineFlow(
  {
    name: 'extractQuestionsFlow',
    inputSchema: ExtractQuestionsInputSchema,
    outputSchema: ExtractQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

    