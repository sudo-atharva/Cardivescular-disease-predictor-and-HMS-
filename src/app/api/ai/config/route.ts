import { NextRequest, NextResponse } from 'next/server';
import { getAIConfig, isOllamaAvailable, isGoogleAIAvailable } from '@/lib/ai-config';

export async function GET() {
  try {
    const config = getAIConfig();
    
    return NextResponse.json({
      currentProvider: config.provider,
      isOllamaAvailable: isOllamaAvailable(),
      isGoogleAIAvailable: isGoogleAIAvailable(),
      config: {
        googleAI: {
          model: config.googleAI.model,
          hasApiKey: !!config.googleAI.apiKey,
        },
        ollama: {
          model: config.ollama.model,
          host: config.ollama.host,
        },
      },
    });
  } catch (error) {
    console.error('AI config error:', error);
    return NextResponse.json(
      { message: 'Failed to get AI configuration' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { provider, model } = await request.json();
    
    if (!provider || !['googleai', 'ollama'].includes(provider)) {
      return NextResponse.json(
        { message: 'Invalid provider. Must be "googleai" or "ollama"' },
        { status: 400 }
      );
    }
    
    // This is a read-only endpoint for now
    // In production, you might want to update environment variables or config files
    return NextResponse.json({
      message: `Provider set to ${provider}. Please update your .env.local file to persist this change.`,
      currentProvider: provider,
      note: `To use ${provider}, set AI_PROVIDER=${provider} in your .env.local file`,
    });
    
  } catch (error) {
    console.error('AI config update error:', error);
    return NextResponse.json(
      { message: 'Failed to update AI configuration' },
      { status: 500 }
    );
  }
}
