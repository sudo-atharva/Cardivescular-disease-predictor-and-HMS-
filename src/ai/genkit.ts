import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import { ollama } from 'genkitx-ollama';
import { getCurrentModel } from '@/lib/ai-config';

export const ai = genkit({
  plugins: [
    googleAI(),
    ollama(),
  ],
});

// Function to get the appropriate model based on environment configuration
export function getModel() {
  return getCurrentModel();
}

// Default model for backward compatibility
export const model = getModel();