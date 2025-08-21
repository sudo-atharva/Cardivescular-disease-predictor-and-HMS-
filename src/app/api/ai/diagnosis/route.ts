import { NextRequest, NextResponse } from 'next/server';
import { generateDiagnosisReport } from '@/ai/flows/generate-diagnosis-report';
import { isMockMode } from '@/lib/mock-ai';

export async function POST(request: NextRequest) {
  try {
    const { vitalsData, patientHistory } = await request.json();
    
    if (!vitalsData || !patientHistory) {
      return NextResponse.json(
        { message: 'Missing required fields: vitalsData and patientHistory' },
        { status: 400 }
      );
    }

    const result = await generateDiagnosisReport({
      vitalsData: JSON.stringify(vitalsData),
      patientHistory
    });

    return NextResponse.json({
      success: true,
      diagnosisReport: result.diagnosisReport,
      mode: isMockMode() ? 'mock' : 'ai',
      note: isMockMode() 
        ? 'Generated using mock AI. Set up Google AI API key or Ollama for real AI responses.'
        : 'Generated using real AI service.'
    });

  } catch (error) {
    console.error('Diagnosis generation error:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to generate diagnosis report',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
