/**
 * @file Unit tests for the Cloud Functions.
 * This file uses `firebase-functions-test` to mock the Firebase environment
 * and `jest` to mock the Genkit AI flows, allowing for isolated testing of
 * the function logic (auth, validation, error handling).
 */

import * as test from 'firebase-functions-test';
import { HttpsError } from 'firebase-functions/v2/https';

// Mock the Genkit AI flows before importing the functions
jest.mock('../../src/ai/flows/generate-practice-exam', () => ({
  generatePracticeExam: jest.fn().mockResolvedValue({ questions: [{ id: 'q1', stem: 'Test Question' }] }),
}));
jest.mock('../../src/ai/flows/auto-grade', () => ({
  autoGradeAnswer: jest.fn().mockResolvedValue({ score: 8, maxScore: 10, justification: 'Correct', human_review: false, confidence: 0.9 }),
}));
jest.mock('../../src/ai/flows/parse-voice-command', () => ({
    parseVoiceCommand: jest.fn().mockResolvedValue({ intent: 'navigate', tts_text: 'Navigating.' }),
}));
jest.mock('../../src/ai/flows/simplify-text-for-sld', () => ({
    simplifyTextForSLD: jest.fn().mockResolvedValue({ simplified_text: 'Simple text.' }),
}));
jest.mock('../../src/ai/flows/text-to-speech', () => ({
    textToSpeech: jest.fn().mockResolvedValue({ media: 'data:audio/wav;base64,...' }),
}));
jest.mock('../../src/ai/flows/capture-voice-answer', () => ({
    captureVoiceAnswer: jest.fn().mockResolvedValue({ normalized_text: 'Answer.' }),
}));
jest.mock('../../src/ai/flows/recognize-handwriting', () => ({
    recognizeHandwriting: jest.fn().mockResolvedValue({ text: 'Handwritten text.', confidence: 0.8 }),
}));
jest.mock('../../src/ai/flows/detect-anomalous-exam-patterns', () => ({
    detectAnomalousExamPatterns: jest.fn().mockResolvedValue({ severity: 'low', tts_text: 'Alert.' }),
}));
jest.mock('../../src/ai/flows/extract-questions-from-document', () => ({
  extractQuestionsFromDocument: jest.fn().mockResolvedValue({ questions: [{ id: 'q1', stem: 'Extracted Question' }] }),
}));


// Now, import the functions after mocks are set up
import { 
    generatePracticeExamFunc, 
    autoGradeAnswerFunc,
    parseVoiceCommandFunc,
    simplifyTextForSLDFunc,
    textToSpeechFunc,
    captureVoiceAnswerFunc,
    recognizeHandwritingFunc,
    detectAnomalousExamPatternsFunc,
    extractQuestionsFromDocumentFunc
} from '../src/index';

const { wrap } = test();

describe('Cloud Functions', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generatePracticeExamFunc', () => {
    const validData = { level: '8', subject: 'Math', topic: 'Algebra', numQuestions: 5 };

    it('should throw "unauthenticated" error if user is not logged in', async () => {
      const wrapped = wrap(generatePracticeExamFunc);
      await expect(wrapped(validData)).rejects.toThrow(new HttpsError('unauthenticated', 'You must be logged in to use this feature.'));
    });

    it('should throw "invalid-argument" error for invalid input', async () => {
      const wrapped = wrap(generatePracticeExamFunc);
      const invalidData = { ...validData, numQuestions: -1 }; // Invalid numQuestions
      await expect(wrapped(invalidData, { auth: { uid: 'test-user' } })).rejects.toThrow(new HttpsError('invalid-argument', 'The data provided is invalid.'));
    });

    it('should call the genkit flow with valid data and return the result', async () => {
        const wrapped = wrap(generatePracticeExamFunc);
        const { generatePracticeExam } = require('../../src/ai/flows/generate-practice-exam');
        
        const response = await wrapped(validData, { auth: { uid: 'test-user' } });

        expect(generatePracticeExam).toHaveBeenCalledWith(validData);
        expect(response).toEqual({ data: { questions: [{ id: 'q1', stem: 'Test Question' }] } });
    });
  });

  describe('autoGradeAnswerFunc', () => {
    const validData = { question: 'Q1', correctAnswer: 'A1', studentAnswer: 'A1', maxScore: 10 };
    const { autoGradeAnswer } = require('../../src/ai/flows/auto-grade');

    it('should call the autoGradeAnswer flow and return its result', async () => {
        const wrapped = wrap(autoGradeAnswerFunc);
        const response = await wrapped(validData, { auth: { uid: 'test-user' }});

        expect(autoGradeAnswer).toHaveBeenCalledWith(validData);
        expect(response.data).toHaveProperty('score');
        expect(response.data).toHaveProperty('justification');
    });
  });
  
  // Add similar test blocks for all other exported functions
});
