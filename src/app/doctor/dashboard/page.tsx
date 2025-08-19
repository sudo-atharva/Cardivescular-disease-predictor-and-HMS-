
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users, Activity, AlertCircle, Eye } from 'lucide-react';
import PatientVitalsChart from '@/components/patient-charts';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import type { User } from '@/lib/models';
import { Skeleton } from '@/components/ui/skeleton';


export default function DoctorDashboard() {
  const [patients, setPatients] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/patients');
        if (!res.ok) {
          throw new Error('Failed to fetch patients');
        }
        const data = await res.json();
        setPatients(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const livePatients = patients.filter(p => p.isLive);
  const highRiskPatients = patients.filter(p => p.status === 'Unstable' || p.risk === 'High');

   const stats = [
    { title: "Total Patients", value: patients.length, icon: Users, color: "text-blue-500" },
    { title: "Live Monitoring", value: livePatients.length.toString(), icon: Activity, color: "text-green-500" },
    { title: "High-Risk Alerts", value: highRiskPatients.length, icon: AlertCircle, color: "text-red-500" },
];

  useEffect(() => {
    if (!isLoading && highRiskPatients.length > 0) {
      setShowAlert(true);
    }
  }, [isLoading, highRiskPatients.length]);

  if (isLoading) {
    return (
        <div className="flex flex-col gap-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
            </div>
            <Skeleton className="h-96" />
        </div>
    )
  }

  return (
    <div className={cn("flex flex-col gap-6", showAlert && 'animate-pulse-red-bg')}>
      <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-destructive" />
              Critical Patient Alert!
            </AlertDialogTitle>
            <AlertDialogDescription>
              The following patient(s) require immediate attention due to unstable vitals or high-risk status:
            </AlertDialogDescription>
             <ul className="list-disc pl-5 pt-2 text-sm font-semibold text-destructive">
                {highRiskPatients.map(p => <li key={p.userId}>{p.name}</li>)}
              </ul>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowAlert(false)}>Acknowledge</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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

      {livePatients.length > 0 && (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">Live Vitals</h2>
            {livePatients.map(patient => (
                 <Card key={patient.userId}>
                    <CardHeader>
                        <CardTitle>{patient.name}</CardTitle>
                        <CardDescription>Device ID: {patient.deviceId}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <PatientVitalsChart />
                    </CardContent>
                </Card>
            ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Patient Records</CardTitle>
          <CardDescription>Overview of all currently admitted patients.</CardDescription>
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
                <TableRow key={patient.userId} className={cn("cursor-pointer", patient.risk === 'High' && 'bg-destructive/10 hover:bg-destructive/20')}>
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
                      <Button asChild variant="ghost" size="icon">
                        <Link href={`/doctor/patients/${patient.userId}`} target="_blank">
                           <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
