
export type Patient = {
  id: string;
  name: string;
  status: 'Stable' | 'Unstable' | 'Monitoring';
  lastCheck: string;
  risk: 'Low' | 'Medium' | 'High' | 'N/A';
  deviceId: string | null;
  isLive: boolean;
}

export const patients: Patient[] = [
  { id: 'pat_001', name: 'John Doe', status: 'Stable', lastCheck: '2 hours ago', risk: 'Low', deviceId: 'DEV_A', isLive: false },
  { id: 'pat_002', name: 'Jane Smith', status: 'Unstable', lastCheck: '15 mins ago', risk: 'High', deviceId: 'DEV_B', isLive: true },
  { id: 'pat_003', name: 'Robert Brown', status: 'Stable', lastCheck: '1 day ago', risk: 'Low', deviceId: null, isLive: false },
  { id: 'pat_004', name: 'Emily White', status: 'Monitoring', lastCheck: '45 mins ago', risk: 'Medium', deviceId: 'DEV_D', isLive: true },
];

type Report = {
  id: string;
  patientInfo: {
    fullName: string;
    patientId: string;
    age: string;
    gender: string;
    visitDate: string;
    address: string;
  },
  medicalHistory: {
    complaint: string;
    hpi: string;
    pastMedicalHistory: string;
    medicationHistory: string;
    familyHistory: string;
    socialHistory: string;
  },
  clinicalExam: {
    general: string;
    systemic: string;
  },
  investigations: {
    ordered: string;
    diagnosis: string;
  },
  treatmentPlan: {
    plan: string;
  },
  doctorDetails: {
    name: string;
    regNumber: string;
    signature: string;
  },
  mlDiagnosis: string;
}

export let reports: Report[] = [];

export function addReport(report: Report) {
  reports.unshift(report);
  const patientExists = patients.some(p => p.id === report.patientInfo.patientId);
  if (!patientExists) {
    patients.unshift({
        id: report.patientInfo.patientId,
        name: report.patientInfo.fullName,
        status: 'Monitoring',
        lastCheck: 'Just now',
        risk: 'N/A',
        deviceId: null,
        isLive: false,
    });
  }
}
