export interface AIConfig {
  provider: 'googleai' | 'ollama';
  googleAI: {
    model: string;
    apiKey?: string;
  };
  ollama: {
    model: string;
    host: string;
  };
}

export const defaultAIConfig: AIConfig = {
  provider: 'googleai',
  googleAI: {
    model: 'gemini-2.0-flash',
  },
  ollama: {
    model: 'llama3.2',
    host: 'http://localhost:11434',
  },
};

export function getAIConfig(): AIConfig {
  return {
    provider: (process.env.AI_PROVIDER as 'googleai' | 'ollama') || 'googleai',
    googleAI: {
      model: process.env.GOOGLE_AI_MODEL || 'gemini-2.0-flash',
      apiKey: process.env.GOOGLE_AI_API_KEY,
    },
    ollama: {
      model: process.env.OLLAMA_MODEL || 'llama3.2',
      host: process.env.OLLAMA_HOST || 'http://localhost:11434',
    },
  };
}

export function isOllamaAvailable(): boolean {
  return process.env.AI_PROVIDER === 'ollama';
}

export function isGoogleAIAvailable(): boolean {
  return process.env.AI_PROVIDER === 'googleai' && !!process.env.GOOGLE_AI_API_KEY;
}

export function getCurrentProvider(): string {
  const config = getAIConfig();
  return config.provider;
}

export function getCurrentModel(): string {
  const config = getAIConfig();
  if (config.provider === 'ollama') {
    return `ollama/${config.ollama.model}`;
  } else {
    return `googleai/${config.googleAI.model}`;
  }
}
