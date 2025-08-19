
'use client';

import { useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Heart, Droplets, Thermometer, Activity, PlusCircle } from 'lucide-react';
import PatientVitalsChart from '@/components/patient-charts';
import DiagnosisReportGenerator from '@/components/diagnosis-report-generator';
import { useMemo, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import CreateReportForm from '@/components/create-report-form';
import type { Report, User } from '@/lib/models';
import { Skeleton } from '@/components/ui/skeleton';


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
  const [patient, setPatient] = useState<User | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!patientId) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [patientRes, reportsRes] = await Promise.all([
          fetch(`/api/patients/${patientId}`),
          fetch(`/api/patients/${patientId}/reports`)
        ]);

        if (patientRes.ok) {
          const patientData = await patientRes.json();
          setPatient(patientData);
        } else {
           console.error('Failed to fetch patient data');
        }

        if (reportsRes.ok) {
           const reportsData = await reportsRes.json();
           setReports(reportsData);
        } else {
            console.error('Failed to fetch reports data');
        }
      } catch (error) {
        console.error('Error fetching data', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [patientId]);

  const latestReport = useMemo(() => (reports.length > 0 ? reports[0] : null), [reports]);

  const handleDialogClose = (newReport?: Report) => {
    setIsDialogOpen(false);
    if(newReport) {
        setReports(prev => [newReport, ...prev]);
    }
  }

  if (isLoading) {
    return (
        <div className="flex flex-col gap-6">
            <Skeleton className="h-32" />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
            </div>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Skeleton className="h-96" />
                <Skeleton className="h-96" />
             </div>
        </div>
    )
  }

  if (!patient) {
    return <div>Patient not found.</div>;
  }

  return (
    <div className="flex flex-col gap-6">
       <Card>
        <CardHeader className="flex flex-row items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-3xl">Patient: {patient.name}</CardTitle>
              <CardDescription>
                ID: {patient.userId} | Age: {latestReport?.patientInfo.age} | Gender: {latestReport?.patientInfo.gender} | Device ID: {patient.deviceId || 'N/A'}
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

      <DiagnosisReportGenerator patientId={patient.userId} />
    </div>
  );
}
