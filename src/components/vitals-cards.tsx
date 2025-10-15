/*
  Author: Atharva-Tikle
  Original Author: Atharva Tikle
  License: MIT
  Notice: No permission is granted to patent this code as yourself.
*/

'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useMonitoringState } from '@/lib/monitoring-state';
import { Heart, Activity } from 'lucide-react';

interface VitalCard {
  title: string;
  value: string;
  icon: any;
  color: string;
}

export default function VitalsCards({ patientId }: { patientId: string }) {
  const readings = useMonitoringState(state => state.patientReadings[patientId] || []);
  const latestReading = readings[readings.length - 1];

  // If there are no readings yet, don't render placeholder cards
  if (!latestReading) {
    return null;
  }

  const cards: VitalCard[] = [
    {
      title: 'Heart Rate',
      value: latestReading ? `${Math.round(latestReading.heartRate)} bpm` : '-- bpm',
      icon: Heart,
      color: 'text-red-500',
    },
    {
      title: 'SpO2',
      value: latestReading ? `${Math.round(latestReading.spo2)}%` : '--%',
      icon: Activity,
      color: 'text-green-500',
    },
    {
      title: 'ECG',
      value: latestReading ? `${Number(latestReading.ecg).toFixed(2)} mV` : '-- mV',
      icon: Activity,
      color: 'text-blue-500',
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((vital: VitalCard) => (
        <Card key={vital.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{vital.title}</CardTitle>
            <vital.icon className={`h-4 w-4 text-muted-foreground ${vital.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vital.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}


