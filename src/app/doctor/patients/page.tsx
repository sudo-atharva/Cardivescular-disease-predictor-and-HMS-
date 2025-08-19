
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlusCircle, Link } from 'lucide-react';

const patients = [
  { id: 'pat_001', name: 'John Doe', status: 'Stable', lastCheck: '2 hours ago', risk: 'Low', deviceId: 'DEV_A' },
  { id: 'pat_002', name: 'Jane Smith', status: 'Unstable', lastCheck: '15 mins ago', risk: 'High', deviceId: 'DEV_B' },
  { id: 'pat_003', name: 'Robert Brown', status: 'Stable', lastCheck: '1 day ago', risk: 'Low', deviceId: null },
  { id: 'pat_004', name: 'Emily White', status: 'Monitoring', lastCheck: '45 mins ago', risk: 'Medium', deviceId: 'DEV_D' },
];

export default function PatientsPage() {
  return (
    <div className="flex flex-col gap-6">
       <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Patient Records</CardTitle>
            <CardDescription>Overview of all currently admitted patients.</CardDescription>
          </div>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Patient
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient ID</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Device ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead>Last Check-in</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-mono">{patient.id}</TableCell>
                  <TableCell className="font-medium">{patient.name}</TableCell>
                  <TableCell className="font-mono">{patient.deviceId || 'N/A'}</TableCell>
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
                  <TableCell>
                    <Button variant="outline" size="sm">
                      <Link className="mr-2 h-4 w-4" />
                      Assign Device
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
