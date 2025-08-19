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
  ecgReadings: z.string().describe('The ECG readings data.'),
  ppgReadings: z.string().describe('The PPG readings data.'),
  patientHistory: z.string().describe('The patient\'s medical history.'),
});
export type GenerateDiagnosisReportInput = z.infer<typeof GenerateDiagnosisReportInputSchema>;

const GenerateDiagnosisReportOutputSchema = z.object({
  diagnosisReport: z.string().describe('The generated diagnosis report.'),
});
export type GenerateDiagnosisReportOutput = z.infer<typeof GenerateDiagnosisReportOutputSchema>;

export async function generateDiagnosisReport(input: GenerateDiagnosisReportInput): Promise<GenerateDiagnosisReportOutput> {
  return generateDiagnosisReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDiagnosisReportPrompt',
  input: {schema: GenerateDiagnosisReportInputSchema},
  output: {schema: GenerateDiagnosisReportOutputSchema},
  prompt: `You are an AI assistant specialized in generating preliminary diagnosis reports for doctors based on ECG and PPG readings, and the patient's medical history.

  Based on the following information, generate a concise diagnosis report:

  ECG Readings: {{{ecgReadings}}}
  PPG Readings: {{{ppgReadings}}}
  Patient History: {{{patientHistory}}}

  Include potential health risks and recommendations for further assessment.
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
