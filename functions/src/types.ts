/**
 * @file This file defines the shared TypeScript types and Zod schemas for the inputs
 * and outputs of the Cloud Functions. This ensures type safety and validation
 * between the client and the backend.
 */

import { z } from 'zod';
import { 
    GeneratePracticeExamInputSchema as GenkitGeneratePracticeExam, 
    ExtractQuestionsInputSchema as GenkitExtractQuestions,
    AutoGradeInputSchema as GenkitAutoGrade,
    ParseVoiceCommandInputSchema as GenkitParseVoice,
    SimplifyTextForSLDInputSchema as GenkitSimplifyText,
    TextToSpeechInputSchema as GenkitTextToSpeech,
    CaptureVoiceAnswerInputSchema as GenkitCaptureVoice,
    RecognizeHandwritingInputSchema as GenkitRecognizeHandwriting,
    DetectAnomalousExamPatternsInputSchema as GenkitDetectAnomalies,
} from './ai/flows'; // Adjust path based on your final structure

// Re-export Zod schemas for validation in the cloud function
export const GeneratePracticeExamInputSchema = GenkitGeneratePracticeExam;
export const AutoGradeInputSchema = GenkitAutoGrade;
export const ParseVoiceCommandInputSchema = GenkitParseVoice;
export const SimplifyTextForSLDInputSchema = GenkitSimplifyText;
export const TextToSpeechInputSchema = GenkitTextToSpeech;
export const CaptureVoiceAnswerInputSchema = GenkitCaptureVoice;
export const RecognizeHandwritingInputSchema = GenkitRecognizeHandwriting;
export const DetectAnomalousExamPatternsInputSchema = GenkitDetectAnomalies;


// Special schema for the document extraction function, which takes a file path
export const ExtractQuestionsInputSchema = z.object({
  filePath: z.string().startsWith('uploads/', { message: 'File path must be a valid path in the storage bucket.' }),
  fileType: z.enum(['pdf', 'docx']),
});


// Re-export TypeScript types for convenience
export type {
    GeneratePracticeExamInput,
    GeneratePracticeExamOutput,
    AutoGradeInput,
    AutoGradeOutput,
    ParseVoiceCommandInput,
    ParseVoiceCommandOutput,
    SimplifyTextForSLDInput,
    SimplifyTextForSLDOutput,
    TextToSpeechInput,
    TextToSpeechOutput,
    CaptureVoiceAnswerInput,
    CaptureVoiceAnswerOutput,
    RecognizeHandwritingInput,
    RecognizeHandwritingOutput,
    DetectAnomalousExamPatternsInput,
    DetectAnomalousExamPatternsOutput,
} from './ai/flows';

export type ExtractQuestionsInput = z.infer<typeof ExtractQuestionsInputSchema>;
export type { ExtractQuestionsOutput } from './ai/flows';

// A generic wrapper for the output of all callable functions
export type FlowOutput<T> = {
  data: T;
  debugInfo?: {
    rawModelResponse?: any;
    [key: string]: any;
  };
};

// A union type of all possible function names for logging/auditing
export type CallableFunction =
  | 'generatePracticeExam'
  | 'extractQuestionsFromDocument'
  | 'autoGradeAnswer'
  | 'parseVoiceCommand'
  | 'simplifyTextForSLD'
  | 'textToSpeech'
  | 'captureVoiceAnswer'
  | 'recognizeHandwriting'
  | 'detectAnomalousExamPatterns';
