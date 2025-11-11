
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import { config } from 'dotenv';

// Force load environment variables from .env file
config();

// Directly using the provided API key to ensure it is fetched correctly.
const apiKey = "AIzaSyC6p3wySiFx-eyr36X0Fsz5_tTbbH6daaU";

export const ai = genkit({
  plugins: [googleAI({apiKey: apiKey})],
  model: 'googleai/gemini-2.5-flash',
});
