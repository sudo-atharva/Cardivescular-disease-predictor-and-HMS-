
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users, Activity, AlertCircle, Eye } from 'lucide-react';
import PatientVitalsChart from '@/components/patient-charts';
import { Button } from '@/components/ui/button';

const patients = [
  { id: 'pat_001', name: 'John Doe', status: 'Stable', lastCheck: '2 hours ago', risk: 'Low', deviceId: 'DEV_A', isLive: false },
  { id: 'pat_002', name: 'Jane Smith', status: 'Unstable', lastCheck: '15 mins ago', risk: 'High', deviceId: 'DEV_B', isLive: true },
  { id: 'pat_003', name: 'Robert Brown', status: 'Stable', lastCheck: '1 day ago', risk: 'Low', deviceId: null, isLive: false },
  { id: 'pat_004', name: 'Emily White', status: 'Monitoring', lastCheck: '45 mins ago', risk: 'Medium', deviceId: 'DEV_D', isLive: true },
];

const livePatients = patients.filter(p => p.isLive);

const stats = [
    { title: "Total Patients", value: "4", icon: Users, color: "text-blue-500" },
    { title: "Live Monitoring", value: livePatients.length.toString(), icon: Activity, color: "text-green-500" },
    { title: "High-Risk Alerts", value: "1", icon: AlertCircle, color: "text-red-500" },
];

export default function DoctorDashboard() {
  return (
    <div className="flex flex-col gap-6">
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
                 <Card key={patient.id}>
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
                <TableRow key={patient.id} className="cursor-pointer">
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
                        <Link href={`/doctor/patients/${patient.id}`} target="_blank">
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
