
'use client';

import { useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Heart, Droplets, Thermometer, Activity } from 'lucide-react';
import PatientVitalsChart from '@/components/patient-charts';
import DiagnosisReportGenerator from '@/components/diagnosis-report-generator';

// Mock data - in a real app, you'd fetch this based on params.patientId
const patient = {
  id: 'pat_002',
  name: 'Jane Smith',
  age: 45,
  gender: 'Female',
  bloodType: 'O+',
  deviceId: 'DEV_B',
  vitals: {
    heartRate: '98 bpm',
    bloodPressure: '130/85 mmHg',
    temperature: '99.1°F',
    SpO2: '97%',
  },
  history: [
    { id: 'REC-001', date: '2023-10-20', type: 'ECG', result: 'Normal Sinus Rhythm' },
    { id: 'REC-002', date: '2023-10-15', type: 'Blood Test', result: 'Cholesterol High' },
  ],
};

const vitalsCards = [
    { title: "Heart Rate", value: patient.vitals.heartRate, icon: Heart, color: "text-red-500" },
    { title: "Blood Pressure", value: patient.vitals.bloodPressure, icon: Droplets, color: "text-blue-500" },
    { title: "Temperature", value: patient.vitals.temperature, icon: Thermometer, color: "text-orange-500" },
    { title: "SpO2", value: patient.vitals.SpO2, icon: Activity, color: "text-green-500" },
];

export default function PatientDetailPage() {
  const params = useParams<{ patientId: string }>();
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Patient: {patient.name}</CardTitle>
          <CardDescription>
            ID: {params.patientId} | Age: {patient.age} | Gender: {patient.gender} | Device ID: {patient.deviceId}
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
        <Card>
            <CardHeader>
                <CardTitle>Previous Records</CardTitle>
                <CardDescription>Historical data for {patient.name}.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Record ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Result</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {patient.history.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-mono">{record.id}</TableCell>
                          <TableCell>{record.date}</TableCell>
                           <TableCell>{record.type}</TableCell>
                          <TableCell>{record.result}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
            </CardContent>
        </Card>
      </div>

      <DiagnosisReportGenerator />
    </div>
  );
}
