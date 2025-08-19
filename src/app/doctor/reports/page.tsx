import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-6">
       <Card>
        <CardHeader>
          <CardTitle>Reports</CardTitle>
          <CardDescription>View and manage patient reports.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Reports page is under construction.</p>
        </CardContent>
      </Card>
    </div>
  );
}
