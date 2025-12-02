
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

const extractQuestionsPrompt = ai.definePrompt({
  name: 'extractQuestionsFromDocumentPrompt',
  input: {schema: ExtractQuestionsInputSchema},
  output: {schema: ExtractQuestionsOutputSchema},
  system: `You are an expert AI assistant that extracts and structures examination questions from an uploaded document.
  Your task is to parse the provided document and identify all questions.
  
  For each question, you must extract:
  - The full question text.
  - The question type, classified as 'mcq', 'fillup', 'short-answer', or 'long-answer'.
  - For MCQs, extract all the options into an array.
  - The marks for the question. If marks are not specified, distribute them logically based on the exam type.

  You MUST NOT include a 'correctAnswer' field in your output.
  Your output MUST be a valid JSON object matching the required schema.

  Here is an example of the expected interaction:

  [DOCUMENT CONTENT]
  Mid-Term Exam - Physics
  
  Q1. What is the SI unit of force? (2 marks)
  a) Watt
  b) Newton
  c) Joule
  
  Q2. The rate of change of velocity is called ____. (1 mark)
  
  [YOUR JSON OUTPUT]
  {
    "questions": [
      {
        "question": "What is the SI unit of force?",
        "type": "mcq",
        "options": ["Watt", "Newton", "Joule"],
        "marks": 2
      },
      {
        "question": "The rate of change of velocity is called ____.",
        "type": "fillup",
        "marks": 1
      }
    ]
  }
  `,
  prompt: `Parse the following document for a {{subject}} exam for {{gradeLevel}}.
  {{#if examType}}
  This is a {{examType}} exam.
  {{/if}}
  
  {{#if (includes examType 'Annual Exam')}}
  The exam should be for a total of 100 marks and a duration of 3 hours.
  {{else if (includes examType 'Half Yearly')}}
  The exam should be for a total of 100 marks and a duration of 3 hours.
  {{else}}
  The exam should be for a total of 50 marks and a duration of 1.5 hours.
  {{/if}}
  
  Document Content:
  {{media url=documentDataUri}}
  `,
  config: {
    temperature: 0.0,
    maxOutputTokens: 1024,
  },
});

const validationPrompt = ai.definePrompt({
  name: 'extractQuestionsValidationPrompt',
  input: { schema: z.object({ originalInput: ExtractQuestionsInputSchema, invalidOutput: z.string() }) },
  output: { schema: ExtractQuestionsOutputSchema },
  system: `You previously attempted to extract exam questions from a document but returned invalid JSON.
  You MUST correct your mistake and return only a valid JSON object matching the schema.
  Do not add any commentary or explanation. Your entire response must be the JSON object.`,
  prompt: `Original Input:
  - Document Data URI: {{media url=originalInput.documentDataUri}}
  - Subject: {{originalInput.subject}}
  - Grade: {{originalInput.gradeLevel}}

  Invalid output that you provided:
  {{{invalidOutput}}}
  
  Correct this and provide a valid JSON output.
  `,
  config: {
    temperature: 0.0,
    maxOutputTokens: 1024,
  },
});

const extractQuestionsFlow = ai.defineFlow(
  {
    name: 'extractQuestionsFlow',
    inputSchema: ExtractQuestionsInputSchema,
    outputSchema: ExtractQuestionsOutputSchema,
  },
  async (input, streamingCallback) => {
    let result: ExtractQuestionsOutput | null = null;
    let attempts = 0;
    const maxAttempts = 2;
    let lastError: any = null;

    // Helper for Handlebars template
    const includes = (str: string | undefined, substr: string) => str?.includes(substr);
    const handlebarsOptions = { helpers: { includes } };

    while (attempts < maxAttempts) {
      attempts++;
      const { text: rawOutput, output } = await extractQuestionsPrompt(input, handlebarsOptions);

      try {
        // Zod parsing will automatically happen on the 'output' field.
        // If it succeeds, 'output' will be valid.
        result = output!;
        ExtractQuestionsOutputSchema.parse(result); // Explicitly parse to be sure
        return result;
      } catch (e: any) {
        lastError = e;
        console.warn(`Attempt ${attempts} failed schema validation. Retrying...`);
        if (attempts < maxAttempts) {
            const { output: retryOutput } = await validationPrompt({ originalInput: input, invalidOutput: rawOutput });
            try {
                result = retryOutput!;
                ExtractQuestionsOutputSchema.parse(result);
                return result;
            } catch (retryError) {
                lastError = retryError;
                console.warn(`Retry attempt ${attempts} also failed validation.`);
            }
        }
      }
    }

    throw new Error(`Failed to extract valid questions after ${maxAttempts} attempts. Last error: ${lastError.message}`);
  }
);
