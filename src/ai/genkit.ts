/*
  Author: Atharva-Tikle
  Original Author: Atharva Tikle
  License: MIT
  Notice: No permission is granted to patent this code as yourself.
*/
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import { ollama } from 'genkitx-ollama';
import { getCurrentModel, getAIConfig } from '@/lib/ai-config';

const cfg = getAIConfig();
const googleKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_AI_API_KEY;
if (googleKey && !process.env.GOOGLE_GENAI_API_KEY) {
  process.env.GOOGLE_GENAI_API_KEY = googleKey;
}
if (!process.env.OLLAMA_HOST && cfg.ollama.host) {
  process.env.OLLAMA_HOST = cfg.ollama.host;
}

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