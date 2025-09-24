/*
  Author: Atharva-Tikle
  Original Author: Atharva Tikle
  License: MIT
  Notice: No permission is granted to patent this code as yourself.
*/

'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import PatientVitalsChart from '@/components/patient-charts';

export default function VitalsHistoryPage() {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Vitals History</CardTitle>
          <CardDescription>
            Review your historical ECG and PPG readings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PatientVitalsChart />
        </CardContent>
      </Card>
    </div>
  );
}
