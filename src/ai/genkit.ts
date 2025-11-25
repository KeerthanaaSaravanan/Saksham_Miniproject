
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import { config } from 'dotenv';

// Force load environment variables from .env file
config();

// Directly using the provided API key to ensure it is fetched correctly.
const apiKey = "AIzaSyBfADt4sycISz-SMa3IIohtNLc3H3PQujA";

export const ai = genkit({
  plugins: [googleAI({apiKey: apiKey})],
  model: 'googleai/gemini-2.5-flash',
});
