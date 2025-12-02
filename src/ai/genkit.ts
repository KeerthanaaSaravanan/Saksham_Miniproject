import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import { config } from 'dotenv';

// Force load environment variables from .env file
config();

// Directly using the provided API key to ensure it is fetched correctly.
const apiKey = "AIzaSyA74m2ss-JTe9olFu3xXyxIQDAqFz0wU5k";

export const ai = genkit({
  plugins: [googleAI({apiKey: apiKey})],
});
