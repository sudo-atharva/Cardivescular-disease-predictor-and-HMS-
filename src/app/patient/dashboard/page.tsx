/*
  Author: Atharva-Tikle
  Original Author: Atharva Tikle
  License: MIT
  Notice: No permission is granted to patent this code as yourself.
*/

'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import PatientVitalsChart from '@/components/patient-charts';
import type { Report } from '@/lib/models';
import { useMemo, useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const patientName = "John Doe";
const patientId = "pat_001"; // Mock patient ID for the logged in user

export default function PatientDashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/patients/${patientId}/reports`);
        if (!res.ok) throw new Error('Failed to fetch reports');
        const data = await res.json();
        setReports(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReports();
  }, []);


  if (isLoading) {
    return (
        <div className="flex flex-col gap-6">
            <Skeleton className="h-24" />
            <Skeleton className="h-96" />
            <Skeleton className="h-64" />
        </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Welcome, {patientName}!</CardTitle>
          <CardDescription>Here is a summary of your recent health data.</CardDescription>
        </CardHeader>
      </Card>
      
      <div className="grid gap-6 md:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Your Vital Signs</CardTitle>
            <CardDescription>Live ECG and PPG readings. These are read-only.</CardDescription>
          </CardHeader>
          <CardContent>
            <PatientVitalsChart patientId={patientId} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
          <CardDescription>Your latest diagnosis and health summary reports.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Diagnosis</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">You have no reports yet.</TableCell>
                </TableRow>
              )}
              {reports.map((report) => (
                <TableRow key={report.reportId}>
                  <TableCell className="font-medium">{report.reportId}</TableCell>
                  <TableCell>{report.patientInfo.visitDate}</TableCell>
                  <TableCell>{report.investigations.diagnosis}</TableCell>
                  <TableCell>
                    <Badge variant={'secondary'}>
                      Viewed
                    </Badge>
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
