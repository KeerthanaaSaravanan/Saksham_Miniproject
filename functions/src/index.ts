/**
 * @file This file is the main entry point for all of Saksham's backend Cloud Functions.
 * It exports several Firebase Callable Functions that act as secure wrappers around Genkit AI flows.
 *
 * Each function is responsible for:
 * - Authentication: Verifying the user is logged in via the Firebase ID token.
 * - Input Validation: Ensuring the data received from the client matches the expected schema.
 * - Rate Limiting: Preventing abuse by limiting the number of requests per user.
 * - Logging & Auditing: Recording function execution and key events to Firestore.
 * - Calling the appropriate Genkit AI flow and handling the response.
 * - File processing for document extraction.
 *
 * @requires FIREBASE_AUTH_EMULATOR_HOST (for local development)
 * @requires FIRESTORE_EMULATOR_HOST (for local development)
 * @requires GENKIT_API_KEY (for Gemini models)
 * @requires GOOGLE_CLOUD_PROJECT (for Firebase project context)
 * @requires TTS_BUCKET_NAME (for storing temporary files)
 */

import { HttpsError, onCall, type CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { setGlobalOptions } from 'firebase-functions/v2';
import { adminDb, adminStorage } from './firebaseAdmin';
import { z } from 'zod';

// Genkit and local flow imports
import { generatePracticeExam } from '../../src/ai/flows/generate-practice-exam';
import { extractQuestionsFromDocument } from '../../src/ai/flows/extract-questions-from-document';
import { autoGradeAnswer } from '../../src/ai/flows/auto-grade';
import { parseVoiceCommand } from '../../src/ai/flows/parse-voice-command';
import { simplifyTextForSLD } from '../../src/ai/flows/simplify-text-for-sld';
import { textToSpeech } from '../../src/ai/flows/text-to-speech';
import { captureVoiceAnswer } from '../../src/ai/flows/capture-voice-answer';
import { recognizeHandwriting } from '../../src/ai/flows/recognize-handwriting';
import { detectAnomalousExamPatterns } from '../../src/ai/flows/detect-anomalous-exam-patterns';


// Local types
import {
  GeneratePracticeExamInputSchema,
  ExtractQuestionsInputSchema,
  AutoGradeInputSchema,
  ParseVoiceCommandInputSchema,
  SimplifyTextForSLDInputSchema,
  TextToSpeechInputSchema,
  CaptureVoiceAnswerInputSchema,
  RecognizeHandwritingInputSchema,
  DetectAnomalousExamPatternsInputSchema,
  CallableFunction,
  FlowOutput,
} from './types';

// File processing utilities
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';

// Set global options for all functions, including region and rate limits.
setGlobalOptions({
    region: 'us-central1',
    // Apply a default rate limit of 10 requests per user per minute.
    rateLimits: {
        perUser: 10,
        timePeriod: 60,
    }
});

/**
 * A generic factory function to create a callable Cloud Function that wraps a Genkit flow.
 * @param flow The Genkit AI flow to execute.
 * @param inputSchema The Zod schema for validating the function's input.
 * @param funcName The name of the function, used for logging.
 * @returns A Firebase Callable Function.
 */
const createAIEndpoint = <I, O>(
  flow: (input: I) => Promise<O>,
  inputSchema: z.Schema<I>,
  funcName: CallableFunction
): ((request: CallableRequest<any>) => Promise<FlowOutput<O>>) => {
  return onCall(async (request: CallableRequest<any>): Promise<FlowOutput<O>> => {
    const userId = request.auth?.uid || 'anonymous';
    logger.info(`[${funcName}] Invoked by user: ${userId}`, { structuredData: true, input: request.data });

    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'You must be logged in to use this feature.');
    }

    const validation = inputSchema.safeParse(request.data);
    if (!validation.success) {
      logger.error(`[${funcName}] Invalid input for user ${userId}`, { error: validation.error.format(), input: request.data });
      throw new HttpsError('invalid-argument', 'The data provided is invalid.');
    }

    const inputData = validation.data;
    const debugMode = request.data.debug === true;

    try {
      // Simple retry mechanism for transient AI errors
      let result: O | null = null;
      let lastError: any = null;
      const maxRetries = 2;

      for (let i = 0; i < maxRetries; i++) {
        try {
          result = await flow(inputData);
          break; // Success
        } catch (e: any) {
          lastError = e;
          // Only retry on 'unavailable' Genkit errors, which are often transient.
          if (e.name === 'GenkitError' && e.code === 'unavailable') {
            logger.warn(`[${funcName}] AI service unavailable for user ${userId}, retrying (${i + 1}/${maxRetries})...`);
            await new Promise(res => setTimeout(res, 1000 * (i + 1))); // Exponential backoff
          } else {
            throw e; // Non-retryable error
          }
        }
      }

      if (result === null) {
          throw lastError || new Error("AI flow failed after multiple retries.");
      }

      // Log successful event to Firestore for auditing
      await adminDb.collection('events').add({
        userId,
        type: funcName,
        payload: { input: inputData },
        createdAt: new Date().toISOString(),
      });
      
      const response: FlowOutput<O> = { data: result };
      if (debugMode) {
          response.debugInfo = { rawModelResponse: "Sample debug info." };
      }
      
      logger.info(`[${funcName}] Successfully processed request for user: ${userId}`);
      return response;

    } catch (error: any) {
      logger.error(`[${funcName}] Execution failed for user ${userId}:`, {
        errorMessage: error.message,
        errorStack: error.stack,
        input: inputData,
      });

      // Log error event to Firestore
      await adminDb.collection('events').add({
        userId,
        type: 'ai_error',
        payload: { function: funcName, error: error.message, input: inputData },
        createdAt: new Date().toISOString(),
      });
      
      throw new HttpsError('internal', `An error occurred while running the AI flow: ${error.message}`);
    }
  });
};

// Export the callable functions
export const generatePracticeExamFunc = createAIEndpoint(generatePracticeExam, GeneratePracticeExamInputSchema, 'generatePracticeExam');
export const autoGradeAnswerFunc = createAIEndpoint(autoGradeAnswer, AutoGradeInputSchema, 'autoGradeAnswer');
export const parseVoiceCommandFunc = createAIEndpoint(parseVoiceCommand, ParseVoiceCommandInputSchema, 'parseVoiceCommand');
export const simplifyTextForSLDFunc = createAIEndpoint(simplifyTextForSLD, SimplifyTextForSLDInputSchema, 'simplifyTextForSLD');
export const textToSpeechFunc = createAIEndpoint(textToSpeech, TextToSpeechInputSchema, 'textToSpeech');
export const captureVoiceAnswerFunc = createAIEndpoint(captureVoiceAnswer, CaptureVoiceAnswerInputSchema, 'captureVoiceAnswer');
export const recognizeHandwritingFunc = createAIEndpoint(recognizeHandwriting, RecognizeHandwritingInputSchema, 'recognizeHandwriting');
export const detectAnomalousExamPatternsFunc = createAIEndpoint(detectAnomalousExamPatterns, DetectAnomalousExamPatternsInputSchema, 'detectAnomalousExamPatterns');


/**
 * A specialized callable function for extracting questions from a document stored in Cloud Storage.
 */
export const extractQuestionsFromDocumentFunc = onCall(async (request: CallableRequest<any>): Promise<FlowOutput<any>> => {
    const funcName: CallableFunction = 'extractQuestionsFromDocument';
    const userId = request.auth?.uid || 'anonymous';
    logger.info(`[${funcName}] Invoked by user: ${userId}`, { structuredData: true });

    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'You must be logged in.');
    }

    const validation = ExtractQuestionsInputSchema.safeParse(request.data);
    if (!validation.success) {
        logger.error(`[${funcName}] Invalid input for user ${userId}`, { error: validation.error.format(), input: request.data });
        throw new HttpsError('invalid-argument', 'The data provided is invalid.');
    }

    const { filePath, fileType } = validation.data;
    const bucketName = process.env.TTS_BUCKET_NAME;
    if (!bucketName) {
        logger.error(`[${funcName}] TTS_BUCKET_NAME environment variable not set.`);
        throw new HttpsError('internal', 'Server configuration error.');
    }
    const bucket = adminStorage.bucket(bucketName);
    const tempFilePath = path.join(os.tmpdir(), path.basename(filePath));

    try {
        // Download the file from Cloud Storage to a temporary directory
        logger.info(`[${funcName}] Downloading file from gs://${bucketName}/${filePath} for user ${userId}`);
        await bucket.file(filePath).download({ destination: tempFilePath });

        let documentText = '';
        if (fileType === 'pdf') {
            const dataBuffer = fs.readFileSync(tempFilePath);
            const data = await pdf(dataBuffer);
            documentText = data.text;
        } else if (fileType === 'docx') {
            const { value } = await mammoth.extractRawText({ path: tempFilePath });
            documentText = value;
        } else {
             throw new HttpsError('invalid-argument', 'Unsupported file type.');
        }

        fs.unlinkSync(tempFilePath); // Clean up the temp file
        
        logger.info(`[${funcName}] Extracted text from document for user ${userId}. Calling AI flow.`);
        const result = await extractQuestionsFromDocument({ documentText, fileType });
        
        await adminDb.collection('events').add({
            userId: request.auth.uid,
            type: funcName,
            payload: { input: { filePath, fileType } },
            createdAt: new Date().toISOString(),
        });
        
        logger.info(`[${funcName}] Successfully processed request for user: ${request.auth.uid}`);
        return { data: result };

    } catch (error: any) {
        if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
        }
        logger.error(`[${funcName}] Execution failed for user ${userId}:`, {
            errorMessage: error.message,
            errorStack: error.stack,
            input: request.data,
        });
        await adminDb.collection('events').add({
            userId: request.auth.uid,
            type: 'ai_error',
            payload: { function: funcName, error: error.message, input: request.data },
            createdAt: new Date().toISOString(),
        });
        throw new HttpsError('internal', `An error occurred during document processing: ${error.message}`);
    }
});
