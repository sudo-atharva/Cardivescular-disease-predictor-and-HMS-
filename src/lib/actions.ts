
'use server';

import { generateDiagnosisReport, type GenerateDiagnosisReportInput } from '@/ai/flows/generate-diagnosis-report';

export async function createDiagnosisReport(
  prevState: any,
  formData: FormData,
) {
  // In a real app, you would fetch this data from your database based on a patient ID.
  // For this prototype, we'll use mock data.
  const mockVitalsData = [
    {"ts":"2024-08-19T14:22:35","id":"CAR01","ppg":1023,"ecg":0.85,"hr":72,"spo2":98,"ptt":180},
    {"ts":"2024-08-19T14:22:36","id":"CAR01","ppg":1021,"ecg":0.88,"hr":73,"spo2":98,"ptt":179},
    {"ts":"2024-08-19T14:22:37","id":"CAR01","ppg":1025,"ecg":0.82,"hr":71,"spo2":98,"ptt":181},
    {"ts":"2024-08-19T14:22:38","id":"CAR01","ppg":1100,"ecg":1.10,"hr":95,"spo2":97,"ptt":160},
    {"ts":"2024-08-19T14:22:39","id":"CAR01","ppg":1030,"ecg":0.86,"hr":72,"spo2":98,"ptt":180}
  ];

  const input: GenerateDiagnosisReportInput = {
    vitalsData: JSON.stringify(mockVitalsData),
    patientHistory: formData.get('patientHistory') as string,
  };

  if (!input.patientHistory) {
    return {
      message: 'Please provide some patient history to generate the report.',
      report: '',
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
      report: '',
    };
  }
}
