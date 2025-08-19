
'use client';

import { useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Heart, Droplets, Thermometer, Activity } from 'lucide-react';
import PatientVitalsChart from '@/components/patient-charts';
import DiagnosisReportGenerator from '@/components/diagnosis-report-generator';
import { reports, patients } from '@/lib/data';
import { useMemo } from 'react';

const vitalsCards = [
    { title: "Heart Rate", value: "98 bpm", icon: Heart, color: "text-red-500" },
    { title: "Blood Pressure", value: "130/85 mmHg", icon: Droplets, color: "text-blue-500" },
    { title: "Temperature", value: "99.1°F", icon: Thermometer, color: "text-orange-500" },
    { title: "SpO2", value: "97%", icon: Activity, color: "text-green-500" },
];

export default function PatientDetailPage() {
  const params = useParams<{ patientId: string }>();

  // Find the patient and their report from the mock data
  const patient = useMemo(() => patients.find(p => p.id === params.patientId), [params.patientId]);
  const report = useMemo(() => reports.find(r => r.patientInfo.patientId === params.patientId), [params.patientId]);

  if (!patient) {
    return <div>Patient not found.</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Patient: {patient.name}</CardTitle>
          <CardDescription>
            ID: {patient.id} | Age: {report?.patientInfo.age} | Gender: {report?.patientInfo.gender} | Device ID: {patient.deviceId || 'N/A'}
          </CardDescription>
        </CardHeader>
      </Card>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {vitalsCards.map(vital => (
          <Card key={vital.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{vital.title}</CardTitle>
              <vital.icon className={`h-4 w-4 text-muted-foreground ${vital.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{vital.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
            <CardHeader>
                <CardTitle>Live Vitals</CardTitle>
                <CardDescription>Real-time ECG for {patient.name}.</CardDescription>
            </CardHeader>
            <CardContent>
                <PatientVitalsChart />
            </CardContent>
        </Card>
        {report ? (
             <Card>
                <CardHeader>
                    <CardTitle>Patient History</CardTitle>
                    <CardDescription>From report dated {report.patientInfo.visitDate}.</CardDescription>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none text-sm">
                    <p><strong>Presenting Complaint:</strong> {report.medicalHistory.complaint}</p>
                    <p><strong>History of Present Illness:</strong> {report.medicalHistory.hpi}</p>
                    <p><strong>Past Medical History:</strong> {report.medicalHistory.pastMedicalHistory}</p>
                    <p><strong>Diagnosis:</strong> {report.investigations.diagnosis}</p>
                </CardContent>
            </Card>
        ) : (
             <Card>
                <CardHeader>
                    <CardTitle>No Report Found</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>There is no detailed report for this patient yet.</p>
                </CardContent>
            </Card>
        )}
      </div>

      <DiagnosisReportGenerator patientId={patient.id} />
    </div>
  );
}
