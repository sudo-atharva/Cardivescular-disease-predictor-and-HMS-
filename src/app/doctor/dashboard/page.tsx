
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users, Activity, AlertCircle, HeartPulse, Eye } from 'lucide-react';
import DiagnosisReportGenerator from '@/components/diagnosis-report-generator';
import PatientVitalsChart from '@/components/patient-charts';
import { Button } from '@/components/ui/button';

const patients = [
  { id: 'pat_001', name: 'John Doe', status: 'Stable', lastCheck: '2 hours ago', risk: 'Low', deviceId: 'DEV_A' },
  { id: 'pat_002', name: 'Jane Smith', status: 'Unstable', lastCheck: '15 mins ago', risk: 'High', deviceId: 'DEV_B' },
  { id: 'pat_003', name: 'Robert Brown', status: 'Stable', lastCheck: '1 day ago', risk: 'Low', deviceId: null },
  { id: 'pat_004', name: 'Emily White', status: 'Monitoring', lastCheck: '45 mins ago', risk: 'Medium', deviceId: 'DEV_D' },
];

const stats = [
    { title: "Total Patients", value: "4", icon: Users, color: "text-blue-500" },
    { title: "Live Monitoring", value: "2", icon: Activity, color: "text-green-500" },
    { title: "High-Risk Alerts", value: "1", icon: AlertCircle, color: "text-red-500" },
    { title: "Avg. Heart Rate", value: "78 bpm", icon: HeartPulse, color: "text-pink-500" },
];

export default function DoctorDashboard() {
  const [selectedPatient, setSelectedPatient] = useState(patients[1]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map(stat => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 text-muted-foreground ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
           <Card>
            <CardHeader>
              <CardTitle>Patient Records</CardTitle>
              <CardDescription>Overview of all currently admitted patients. Click a patient to view their vitals.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead>Last Check-in</TableHead>
                    <TableHead>Device ID</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patients.map((patient) => (
                    <TableRow key={patient.id} onClick={() => setSelectedPatient(patient)} className="cursor-pointer">
                      <TableCell className="font-medium">{patient.name}</TableCell>
                      <TableCell>
                         <Badge variant={patient.status === 'Unstable' ? 'destructive' : 'secondary'}>
                          {patient.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={patient.risk === 'High' ? 'destructive' : (patient.risk === 'Medium' ? 'default' : 'secondary')}
                          className={patient.risk === 'Medium' ? 'bg-yellow-400 text-white' : ''}
                        >
                          {patient.risk}
                        </Badge>
                      </TableCell>
                      <TableCell>{patient.lastCheck}</TableCell>
                      <TableCell className="font-mono">{patient.deviceId || 'N/A'}</TableCell>
                       <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => setSelectedPatient(patient)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <DiagnosisReportGenerator />
        </div>
        
        <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Live Vitals</CardTitle>
                    <CardDescription>
                      {selectedPatient ? `Real-time ECG for ${selectedPatient.name}.` : 'Select a patient to view vitals.'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {selectedPatient ? <PatientVitalsChart /> : <div className="text-center text-muted-foreground">No patient selected</div>}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}

