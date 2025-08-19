
'use server';

import { generateDiagnosisReport, type GenerateDiagnosisReportInput } from '@/ai/flows/generate-diagnosis-report';
import { reports } from './data';

function getPatientHistoryAsString(patientId: string): string {
    const report = reports.find(r => r.patientInfo.patientId === patientId);
    if (!report) {
        return "No patient history found.";
    }

    const historyParts = [
        `Patient ID: ${report.patientInfo.patientId}`,
        `Full Name: ${report.patientInfo.fullName}`,
        `Age: ${report.patientInfo.age}`,
        `Gender: ${report.patientInfo.gender}`,
        `Visit Date: ${report.patientInfo.visitDate}`,
        `Presenting Complaint: ${report.medicalHistory.complaint}`,
        `History of Present Illness: ${report.medicalHistory.hpi}`,
        `Past Medical History: ${report.medicalHistory.pastMedicalHistory}`,
        `Medication History: ${report.medicalHistory.medicationHistory}`,
        `Family History: ${report.medicalHistory.familyHistory}`,
        `Social History: ${report.medicalHistory.socialHistory}`,
        `General Examination: ${report.clinicalExam.general}`,
        `Systemic Examination: ${report.clinicalExam.systemic}`,
        `Investigations Ordered: ${report.investigations.ordered}`,
        `Diagnosis: ${report.investigations.diagnosis}`,
        `Treatment Plan: ${report.treatmentPlan.plan}`
    ];

    return historyParts.filter(part => part.split(':')[1].trim()).join('\n');
}


export async function createDiagnosisReport(
  patientId: string,
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

  const patientHistory = getPatientHistoryAsString(patientId);

  const input: GenerateDiagnosisReportInput = {
    vitalsData: JSON.stringify(mockVitalsData),
    patientHistory: patientHistory,
  };

  if (patientHistory === "No patient history found.") {
    return {
      message: 'Could not find the patient\'s report to generate a prediction.',
      report: '',
    };
  }

  try {
    const output = await generateDiagnosisReport(input);

    // Find the report and update the mlDiagnosis field
    const reportIndex = reports.findIndex(r => r.patientInfo.patientId === patientId);
    if (reportIndex !== -1) {
        reports[reportIndex].mlDiagnosis = output.diagnosisReport;
    }

    return {
      message: 'success',
      report: output.diagnosisReport,
    };
  } catch (e) {
    console.error(e);
    return {
      message: 'An error occurred while generating the report.',
      report: '',
    };
  }
}
