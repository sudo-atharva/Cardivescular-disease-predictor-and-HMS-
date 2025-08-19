'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a preliminary diagnosis report based on ML analysis of ECG and PPG readings.
 *
 * - generateDiagnosisReport - A function that triggers the diagnosis report generation flow.
 * - GenerateDiagnosisReportInput - The input type for the generateDiagnosisReport function.
 * - GenerateDiagnosisReportOutput - The return type for the generateDiagnosisReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDiagnosisReportInputSchema = z.object({
  vitalsData: z.string().describe('A JSON string containing an array of vital signs readings. Each reading should include ts, id, ppg, ecg, hr, spo2, and ptt.'),
  patientHistory: z.string().describe('The patient\'s comprehensive medical history, including presenting complaints, past illnesses, and clinical examinations.'),
});
export type GenerateDiagnosisReportInput = z.infer<typeof GenerateDiagnosisReportInputSchema>;

const GenerateDiagnosisReportOutputSchema = z.object({
  diagnosisReport: z.string().describe('The generated diagnosis report predicting potential diseases.'),
});
export type GenerateDiagnosisReportOutput = z.infer<typeof GenerateDiagnosisReportOutputSchema>;

export async function generateDiagnosisReport(input: GenerateDiagnosisReportInput): Promise<GenerateDiagnosisReportOutput> {
  return generateDiagnosisReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDiagnosisReportPrompt',
  input: {schema: GenerateDiagnosisReportInputSchema},
  output: {schema: GenerateDiagnosisReportOutputSchema},
  prompt: `You are an AI assistant specialized in predicting potential diseases for doctors based on vital signs data and the patient's medical history.

  Based on the following information, generate a concise disease prediction report. Analyze the provided JSON data for trends, anomalies, or critical values. Correlate these findings with the patient's full medical history.

  Vital Signs Data (JSON):
  {{{vitalsData}}}

  Patient's Full Medical History:
  {{{patientHistory}}}

  Your report should focus on predicting potential diseases, outlining the supporting evidence from the provided data, and suggesting possible next steps for confirmation.
  `,
});

const generateDiagnosisReportFlow = ai.defineFlow(
  {
    name: 'generateDiagnosisReportFlow',
    inputSchema: GenerateDiagnosisReportInputSchema,
    outputSchema: GenerateDiagnosisReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
