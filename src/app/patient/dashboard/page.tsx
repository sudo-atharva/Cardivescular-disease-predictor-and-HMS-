import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import PatientVitalsChart from '@/components/patient-charts';

const reports = [
  { id: 'REP-001', date: '2023-10-26', title: 'Routine Check-up', status: 'Viewed' },
  { id: 'REP-002', date: '2023-10-27', title: 'Follow-up ECG Analysis', status: 'New' },
  { id: 'REP-003', date: '2023-10-28', title: 'Quarterly Health Summary', status: 'Viewed' },
];

export default function PatientDashboard() {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Welcome, John!</CardTitle>
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
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{report.id}</TableCell>
                  <TableCell>{report.date}</TableCell>
                  <TableCell>{report.title}</TableCell>
                  <TableCell>
                    <Badge variant={report.status === 'New' ? 'default' : 'secondary'}>
                      {report.status}
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
