
'use server';

import { generateDiagnosisReport, type GenerateDiagnosisReportInput } from '@/ai/flows/generate-diagnosis-report';
import clientPromise from './mongodb';
import type { Report } from './models';

async function getPatientHistoryAsString(patientId: string): Promise<string> {
    const client = await clientPromise;
    const db = client.db();
    const reportsCollection = db.collection<Report>('reports');

    const report = await reportsCollection.findOne({ patientId: patientId }, { sort: { createdAt: -1 } });

    if (!report) {
        return "No patient history found.";
    }

    const historyParts = [
        `Patient ID: ${report.patientId}`,
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

    return historyParts.filter(part => part.split(/:(.*)/s)[1]?.trim()).join('\n');
}


export async function createDiagnosisReport(
  patientId: string,
  prevState: any,
  formData: FormData,
) {
  // In a real app, you would fetch this data from your database based on a patient ID.
  // Try to get latest vitals from ESP32 if configured; otherwise fall back to mock data so it works offline.
  const mockVitalsData = [
    {"ts":"2024-08-19T14:22:35","id":"CAR01","ppg":1023,"ecg":0.85,"hr":72,"spo2":98,"ptt":180},
    {"ts":"2024-08-19T14:22:36","id":"CAR01","ppg":1021,"ecg":0.88,"hr":73,"spo2":98,"ptt":179},
    {"ts":"2024-08-19T14:22:37","id":"CAR01","ppg":1025,"ecg":0.82,"hr":71,"spo2":98,"ptt":181},
    {"ts":"2024-08-19T14:22:38","id":"CAR01","ppg":1100,"ecg":1.10,"hr":95,"spo2":97,"ptt":160},
    {"ts":"2024-08-19T14:22:39","id":"CAR01","ppg":1030,"ecg":0.86,"hr":72,"spo2":98,"ptt":180}
  ];

  async function getLatestVitalsFromESP32(): Promise<any[] | null> {
    try {
      const baseUrl = process.env.ESP32_BASE_URL || (process.env.ESP32_IP ? `http://${process.env.ESP32_IP}` : '');
      if (!baseUrl) return null;
      const url = `${baseUrl.replace(/\/$/, '')}/vitals?samples=20`;
      const res = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        // AbortSignal.timeout is available in Node 18+, cast to any for TS compatibility
        signal: (AbortSignal as any).timeout ? (AbortSignal as any).timeout(5000) : undefined,
      });
      if (!res.ok) return null;
      const data = await res.json();
      const arr = Array.isArray(data) ? data : [data];
      const normalized = arr.map((d: any) => ({
        ts: new Date(d.timestamp ?? d.ts ?? Date.now()).toISOString(),
        id: 'ESP32',
        ppg: d.ppg ?? 0,
        ecg: d.ecg ?? 0,
        hr: d.heartRate ?? d.hr ?? 0,
        spo2: d.spo2 ?? 0,
        ptt: d.ptt ?? 0,
      }));
      return normalized;
    } catch (error) {
      console.error('Failed to fetch latest vitals from ESP32:', error);
      return null;
    }
  }

  const patientHistory = await getPatientHistoryAsString(patientId);

  if (patientHistory === "No patient history found.") {
    return {
      message: 'Could not find the patient\'s report to generate a prediction.',
      report: '',
    };
  }

  let vitalsDataForAI = await getLatestVitalsFromESP32();
  if (!vitalsDataForAI || vitalsDataForAI.length === 0) {
    vitalsDataForAI = mockVitalsData;
  }

  const input: GenerateDiagnosisReportInput = {
    vitalsData: JSON.stringify(vitalsDataForAI),
    patientHistory: patientHistory,
  };

  try {
    const output = await generateDiagnosisReport(input);

    const client = await clientPromise;
    const db = client.db();
    const reportsCollection = db.collection<Report>('reports');
    
    // Find the latest report and update the mlDiagnosis field
    const latestReport = await reportsCollection.findOne({ patientId: patientId }, { sort: { createdAt: -1 } });

    if (latestReport) {
        await reportsCollection.updateOne(
            { _id: latestReport._id },
            { $set: { mlDiagnosis: output.diagnosisReport } }
        );
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
