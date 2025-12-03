import {genkit, type GenkitErrorCode, type GenkitError} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import { config } from 'dotenv';

// Force load environment variables from .env file
config();

// Directly using the provided API key to ensure it is fetched correctly.
const apiKey = "AIzaSyA74m2ss-JTe9olFu3xXyxIQDAqFz0wU5k";

export const ai = genkit({
  plugins: [googleAI({apiKey: apiKey})],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

/**
 * A helper function to consistently create GenkitError instances.
 * @param code The Genkit error code.
 * @param message A descriptive error message.
 * @returns A GenkitError instance.
 */
export function createGenkitError(
  code: GenkitErrorCode,
  message: string
): GenkitError {
  return new Error(message) as GenkitError;
}
