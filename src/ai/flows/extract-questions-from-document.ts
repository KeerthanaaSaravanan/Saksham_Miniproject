
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
  file_type: z.enum(['pdf', 'docx', 'doc', 'txt']).describe("The file type of the document."),
});
export type ExtractQuestionsInput = z.infer<typeof ExtractQuestionsInputSchema>;


const questionSchema = z.object({
    id: z.string().describe("A unique identifier for the question, e.g., 'q_001'."),
    type: z.enum(['mcq', 'short_answer', 'long_answer']).describe("The detected type of the question."),
    stem: z.string().describe("The main text of the question."),
    options: z.array(z.string()).nullable().describe("An array of options if the question is an MCQ, otherwise null."),
    images: z.array(z.object({
        id: z.string().describe("The placeholder tag for the image, e.g., '[FIG_1]'."),
        caption: z.string().describe("The caption for the image, or 'MISSING' if not found."),
    })).nullable().describe("An array of image objects, or null if no images are referenced."),
    source_page: z.number().int().describe("The page number in the document where the question was found."),
    ambiguous: z.boolean().describe("Set to true if the content is unclear or cannot be confidently parsed."),
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
  system: `INTENT: "extract_questions"
INSTRUCTIONS:
You are an expert AI assistant that extracts and structures examination questions from a document.
1. Detect numbered question blocks and parse them.
2. For each question, determine its type: 'mcq', 'short_answer', or 'long_answer'.
3. Extract the question text into the 'stem'.
4. For MCQs, extract the options into the 'options' array. If not an MCQ, 'options' must be null.
5. Identify image placeholder tags (e.g., "[FIG_1]", "[Image 1]") and map them to the 'images' array. If no caption is present, set it to "MISSING".
6. If the structure or content of a question is unclear, set 'ambiguous' to true.
7. Return a valid JSON object containing a "questions" array.

FEW-SHOT EXAMPLES:
[Example 1: MCQ]
Document Text: "1. What is the capital of France? (a) Berlin (b) Madrid (c) Paris (d) Rome"
Your JSON for this item: { "id": "q_001", "type": "mcq", "stem": "What is the capital of France?", "options": ["Berlin", "Madrid", "Paris", "Rome"], "images": null, "source_page": 1, "ambiguous": false }

[Example 2: Short Answer]
Document Text: "2. Who wrote the play 'Hamlet'?"
Your JSON for this item: { "id": "q_002", "type": "short_answer", "stem": "Who wrote the play 'Hamlet'?", "options": null, "images": null, "source_page": 1, "ambiguous": false }
`,
  prompt: `CONTEXT:
{
    "document_text": "{{media url=documentDataUri}}",
    "file_type": "{{file_type}}"
}`,
  config: {
    temperature: 0.0,
    maxOutputTokens: 2048,
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
  - File Type: {{originalInput.file_type}}

  Invalid output that you provided:
  {{{invalidOutput}}}
  
  Correct this and provide a valid JSON output.
  `,
  config: {
    temperature: 0.0,
    maxOutputTokens: 2048,
  },
});

const extractQuestionsFlow = ai.defineFlow(
  {
    name: 'extractQuestionsFlow',
    inputSchema: ExtractQuestionsInputSchema,
    outputSchema: ExtractQuestionsOutputSchema,
  },
  async (input) => {
    let result: ExtractQuestionsOutput | null = null;
    let attempts = 0;
    const maxAttempts = 2;
    let lastError: any = null;

    while (attempts < maxAttempts) {
      attempts++;
      const { text: rawOutput, output } = await extractQuestionsPrompt(input);

      try {
        // Zod parsing is automatically handled by the 'output' field if schema is provided.
        // We explicitly parse here to be absolutely sure and catch the error for retry.
        result = ExtractQuestionsOutputSchema.parse(output!);
        return result;
      } catch (e: any) {
        lastError = e;
        console.warn(`Attempt ${attempts} failed schema validation. Retrying...`);
        if (attempts < maxAttempts) {
            try {
                const { output: retryOutput } = await validationPrompt({ originalInput: input, invalidOutput: rawOutput });
                result = ExtractQuestionsOutputSchema.parse(retryOutput!);
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
