
'use server';

import { generateDiagnosisReport, type GenerateDiagnosisReportInput } from '@/ai/flows/generate-diagnosis-report';

export async function createDiagnosisReport(
  prevState: any,
  formData: FormData,
) {
  const input: GenerateDiagnosisReportInput = {
    ecgReadings: formData.get('ecgReadings') as string,
    ppgReadings: formData.get('ppgReadings') as string,
    patientHistory: formData.get('patientHistory') as string,
  };

  if (!input.ecgReadings || !input.ppgReadings || !input.patientHistory) {
    return {
      message: 'Please fill out all fields.',
    };
  }

  try {
    const output = await generateDiagnosisReport(input);
    return {
      message: 'success',
      report: output.diagnosisReport,
    };
  } catch (e) {
    return {
      message: 'An error occurred while generating the report.',
    };
  }
}
