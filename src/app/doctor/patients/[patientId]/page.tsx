
'use client';

import { useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Droplets, Thermometer, Activity, PlusCircle } from 'lucide-react';
import PatientVitalsChart from '@/components/patient-charts';
import DiagnosisReportGenerator from '@/components/diagnosis-report-generator';
import { reports, patients, Report } from '@/lib/data';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import CreateReportForm from '@/components/create-report-form';


const vitalsCards = [
    { title: "Heart Rate", value: "98 bpm", icon: Heart, color: "text-red-500" },
    { title: "Blood Pressure", value: "130/85 mmHg", icon: Droplets, color: "text-blue-500" },
    { title: "Temperature", value: "99.1°F", icon: Thermometer, color: "text-orange-500" },
    { title: "SpO2", value: "97%", icon: Activity, color: "text-green-500" },
];

export default function PatientDetailPage() {
  const params = useParams();
  const patientId = params.patientId as string;
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Find the patient and their reports from the mock data
  const patient = useMemo(() => patients.find(p => p.id === patientId), [patientId]);
  const patientReports = useMemo(() => reports.filter(r => r.patientInfo.patientId === patientId).sort((a, b) => new Date(b.patientInfo.visitDate).getTime() - new Date(a.patientInfo.visitDate).getTime()), [patientId]);
  const latestReport = useMemo(() => patientReports.length > 0 ? patientReports[0] : null, [patientReports]);

  if (!patient) {
    return <div>Patient not found.</div>;
  }
  
  const handleDialogClose = () => {
    setIsDialogOpen(false);
    // In a real app, you might want to force a re-render here to see the new report.
    // For our mock data setup, the new report will appear on the main reports page.
  }

  return (
    <div className="flex flex-col gap-6">
       <Card>
        <CardHeader className="flex flex-row items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-3xl">Patient: {patient.name}</CardTitle>
              <CardDescription>
                ID: {patient.id} | Age: {latestReport?.patientInfo.age} | Gender: {latestReport?.patientInfo.gender} | Device ID: {patient.deviceId || 'N/A'}
              </CardDescription>
            </div>
             <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create New Report
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
                 <DialogHeader>
                  <DialogTitle>Create New Report for {patient.name}</DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto -mr-6 pr-6">
                    <CreateReportForm patient={patient} onFormSubmit={handleDialogClose} latestReport={latestReport} />
                </div>
              </DialogContent>
            </Dialog>
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
        {latestReport ? (
             <Card>
                <CardHeader>
                    <CardTitle>Latest Patient History</CardTitle>
                    <CardDescription>From report dated {latestReport.patientInfo.visitDate}. View all reports on the main Reports page.</CardDescription>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none text-sm">
                    <p><strong>Presenting Complaint:</strong> {latestReport.medicalHistory.complaint}</p>
                    <p><strong>History of Present Illness:</strong> {latestReport.medicalHistory.hpi}</p>
                    <p><strong>Past Medical History:</strong> {latestReport.medicalHistory.pastMedicalHistory}</p>
                    <p><strong>Diagnosis:</strong> {latestReport.investigations.diagnosis}</p>
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
