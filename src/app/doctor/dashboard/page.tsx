
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users, Activity, AlertCircle, HeartPulse } from 'lucide-react';
import DiagnosisReportGenerator from '@/components/diagnosis-report-generator';
import PatientVitalsChart from '@/components/patient-charts';


const patients = [
  { id: 'pat_001', name: 'John Doe', status: 'Stable', lastCheck: '2 hours ago', risk: 'Low' },
  { id: 'pat_002', name: 'Jane Smith', status: 'Unstable', lastCheck: '15 mins ago', risk: 'High' },
  { id: 'pat_003', name: 'Robert Brown', status: 'Stable', lastCheck: '1 day ago', risk: 'Low' },
  { id: 'pat_004', name: 'Emily White', status: 'Monitoring', lastCheck: '45 mins ago', risk: 'Medium' },
];

const stats = [
    { title: "Total Patients", value: "4", icon: Users, color: "text-blue-500" },
    { title: "Live Monitoring", value: "2", icon: Activity, color: "text-green-500" },
    { title: "High-Risk Alerts", value: "1", icon: AlertCircle, color: "text-red-500" },
    { title: "Avg. Heart Rate", value: "78 bpm", icon: HeartPulse, color: "text-pink-500" },
];


export default function DoctorDashboard() {
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
        <Card className="lg:col-span-2">
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((patient) => (
                  <TableRow key={patient.id}>
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Live Vitals</CardTitle>
                    <CardDescription>Real-time ECG for Jane Smith.</CardDescription>
                </CardHeader>
                <CardContent>
                    <PatientVitalsChart />
                </CardContent>
            </Card>
        </div>
      </div>
      
      <DiagnosisReportGenerator />

    </div>
  );
}
