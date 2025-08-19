
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import PatientVitalsChart from '@/components/patient-charts';
import { reports } from '@/lib/data';
import { useMemo } from 'react';

const patientName = "John Doe";
const patientId = "pat_001";

export default function PatientDashboard() {

  const patientReports = useMemo(() => reports.filter(r => r.patientInfo.patientId === patientId), []);

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
            <PatientVitalsChart />
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
              {patientReports.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">You have no reports yet.</TableCell>
                </TableRow>
              )}
              {patientReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{report.id}</TableCell>
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
