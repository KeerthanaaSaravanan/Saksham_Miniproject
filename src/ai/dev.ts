
'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/parse-voice-command.ts';
import '@/ai/flows/generate-customized-assessments.ts';
import '@/ai/flows/detect-anomalous-exam-patterns.ts';
import '@/ai/flows/automatically-profile-accessibility-needs.ts';
import '@/ai/flows/text-to-speech.ts';
import '@/ai/flows/generate-practice-exam.ts';
import '@/ai/flows/extract-questions-from-document.ts';
import '@/ai/flows/capture-voice-answer.ts';
import '@/ai/flows/auto-grade.ts';
import '@/ai/flows/detect-anomalous-exam-patterns.ts';
import '@/ai/flows/simplify-text-for-sld.ts';
import '@/ai/flows/recognize-handwriting.ts';
