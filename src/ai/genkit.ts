import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import { ollama } from 'genkit/plugins/ollama';

export const ai = genkit({
  plugins: [
    googleAI(),
    ollama(),
  ],
  flow: {
    maxRetries: 3,
  },
});

export const model = process.env.AI_MODEL === 'ollama'
  ? 'ollama/llama3'
  : 'googleai/gemini-2.0-flash';