import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-6">
       <Card>
        <CardHeader>
          <CardTitle>Analytics</CardTitle>
          <CardDescription>Analytics dashboard for patient data.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Analytics page is under construction.</p>
        </CardContent>
      </Card>
    </div>
  );
}
