
import { ObjectId } from 'mongodb';

export interface User {
  _id?: ObjectId;
  userId: string; // e.g., pat_001 or doc_001
  name: string;
  email?: string; // Optional for patients
  role: 'doctor' | 'patient';
  passwordHash: string;
  createdAt: Date;
  // Doctor specific
  patients?: string[]; // Array of patient userIds
  // Patient specific
  status?: 'Stable' | 'Unstable' | 'Monitoring';
  lastCheck?: string;
  risk?: 'Low' | 'Medium' | 'High' | 'N/A';
  deviceId?: string | null;
  isLive?: boolean;
}

export interface Report {
  _id?: ObjectId;
  reportId: string; // e.g., rep_12345
  patientId: string; // The patient's userId
  patientInfo: {
    fullName: string;
    age: string;
    gender: string;
    visitDate: string;
    address: string;
  };
  medicalHistory: {
    complaint: string;
    hpi: string;
    pastMedicalHistory: string;
    medicationHistory: string;
    familyHistory: string;
    socialHistory: string;
  };
  clinicalExam: {
    general: string;
    systemic: string;
  };
  investigations: {
    ordered: string;
    diagnosis: string;
  };
  treatmentPlan: {
    plan: string;
  };
  doctorDetails: {
    name: string;
    regNumber: string;
    signature: string;
  };
  mlDiagnosis: string;
  createdAt: Date;
}
