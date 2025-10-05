/*
  Author: Atharva-Tikle
  Original Author: Atharva Tikle
  License: MIT
  Notice: No permission is granted to patent this code as yourself.
*/
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { Report } from '@/lib/models';

export async function POST(request: NextRequest) {
  try {
    const db = await getDb();
    
    // Check if reports already exist
    const existingReports = await db.collection<Report>('reports').countDocuments();
    
    if (existingReports > 0) {
      return NextResponse.json(
        { message: 'Reports already seeded' },
        { status: 200 }
      );
    }

    // Create sample reports
    const reports: Omit<Report, '_id'>[] = [
      {
        reportId: 'rep_001',
        patientId: 'pat_001',
        patientInfo: {
          fullName: 'John Smith',
          age: '45',
          gender: 'Male',
          visitDate: '2024-01-15',
          address: '123 Main St, City, State'
        },
        medicalHistory: {
          complaint: 'Chest pain and shortness of breath',
          hpi: 'Patient reports chest pain for the past 2 days, worse with exertion',
          pastMedicalHistory: 'Hypertension, Diabetes Type 2',
          medicationHistory: 'Metformin, Lisinopril',
          familyHistory: 'Father had heart attack at age 50',
          socialHistory: 'Non-smoker, occasional alcohol'
        },
        clinicalExam: {
          general: 'Patient appears anxious, vital signs stable',
          systemic: 'Cardiovascular: Regular rate and rhythm, no murmurs'
        },
        investigations: {
          ordered: 'ECG, Chest X-ray, Cardiac enzymes',
          diagnosis: 'Suspected angina, rule out myocardial infarction'
        },
        treatmentPlan: {
          plan: 'Admit for observation, cardiac monitoring, aspirin therapy'
        },
        doctorDetails: {
          name: 'Dr. Sarah Johnson',
          regNumber: 'MD12345',
          signature: 'Dr. S. Johnson'
        },
        mlDiagnosis: 'High probability of coronary artery disease',
        createdAt: new Date('2024-01-15')
      },
      {
        reportId: 'rep_002',
        patientId: 'pat_002',
        patientInfo: {
          fullName: 'Mary Wilson',
          age: '32',
          gender: 'Female',
          visitDate: '2024-01-16',
          address: '456 Oak Ave, City, State'
        },
        medicalHistory: {
          complaint: 'Fever and cough for 5 days',
          hpi: 'Patient developed fever 5 days ago, followed by dry cough',
          pastMedicalHistory: 'Asthma, Seasonal allergies',
          medicationHistory: 'Albuterol inhaler, Flonase',
          familyHistory: 'Mother has asthma',
          socialHistory: 'Non-smoker, works as teacher'
        },
        clinicalExam: {
          general: 'Patient appears tired but alert, temperature 101.2°F',
          systemic: 'Respiratory: Wheezing on auscultation, clear breath sounds'
        },
        investigations: {
          ordered: 'Chest X-ray, CBC, COVID-19 test',
          diagnosis: 'Acute bronchitis, possible COVID-19'
        },
        treatmentPlan: {
          plan: 'Supportive care, increased albuterol use, follow up in 1 week'
        },
        doctorDetails: {
          name: 'Dr. Sarah Johnson',
          regNumber: 'MD12345',
          signature: 'Dr. S. Johnson'
        },
        mlDiagnosis: 'Moderate probability of viral respiratory infection',
        createdAt: new Date('2024-01-16')
      }
    ];

    // Insert reports
    const result = await db.collection<Report>('reports').insertMany(reports);

    return NextResponse.json({
      message: 'Reports seeded successfully',
      insertedCount: result.insertedCount
    }, { status: 201 });

  } catch (error) {
    console.error('Seed reports error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
