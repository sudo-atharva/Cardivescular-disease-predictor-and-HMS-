/*
  Author: Atharva-Tikle
  Original Author: Atharva Tikle
  License: MIT
  Notice: No permission is granted to patent this code as yourself.
*/
import { NextResponse } from 'next/server';
import { ai, getModel } from '@/ai/genkit';
import { getAIConfig } from '@/lib/ai-config';
import { z } from 'genkit';
import { generateMockDiagnosisReport, isMockMode } from '@/lib/mock-ai';

export async function GET() {
  try {
    const config = getAIConfig();
    const currentModel = getModel();
    
    // Test the AI configuration
    const testPrompt = ai.definePrompt({
      name: 'testPrompt',
      input: { schema: z.object({ test: z.string() }) },
      output: { schema: z.object({ response: z.string() }) },
      model: currentModel,
      prompt: 'Say "Hello from {{test}}" and nothing else.',
    });

    // Check if we should use mock mode
    if (isMockMode()) {
      const mockResult = await generateMockDiagnosisReport({
        vitalsData: '{"test": "sample"}',
        patientHistory: 'Sample patient history for testing'
      });
      
      return NextResponse.json({
        success: true,
        message: 'AI integration working (Mock Mode)',
        currentProvider: 'mock',
        currentModel: 'mock-ai',
        testResponse: mockResult.diagnosisReport,
        config: config,
        note: 'Running in mock mode. Set up Google AI API key or Ollama for real AI responses.',
      });
    }

    try {
      const result = await testPrompt({ test: 'HealthLink AI' });
      
      return NextResponse.json({
        success: true,
        message: 'AI integration working',
        currentProvider: config.provider,
        currentModel: currentModel,
        testResponse: result.output?.response || 'No response',
        config: config,
      });
    } catch (aiError) {
      return NextResponse.json({
        success: false,
        message: 'AI integration failed',
        currentProvider: config.provider,
        currentModel: currentModel,
        error: aiError instanceof Error ? aiError.message : 'Unknown error',
        config: config,
        note: 'Check your API keys or Ollama installation',
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('AI test error:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to test AI integration',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
