'use client';

import * as React from 'react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { type VitalReading } from '@/lib/http-vitals';
import { Badge } from '@/components/ui/badge';
import { useMonitoringState } from '@/lib/monitoring-state';

// Fallback data generator for when device is disconnected
const generateChartData = (points = 50, amplitude = 5, frequency = 0.2) => {
    return Array.from({ length: points }, (_, i) => ({
      time: i,
      value: Math.sin(i * frequency) * amplitude + Math.random() * (amplitude / 2) - (amplitude / 4),
    }));
};

const ecgData = generateChartData(100, 1, 0.5);

const chartConfig = {
  value: {
    label: 'Value',
  },
  ecg: {
    label: 'ECG',
    color: 'hsl(var(--chart-1))',
  },
  spo2: {
    label: 'SpO2',
    color: 'hsl(var(--chart-2))',
  },
  heartRate: {
    label: 'Heart Rate',
    color: 'hsl(var(--chart-3))',
  }
} satisfies ChartConfig;

interface PatientVitalsChartProps {
    patientId: string;
}

export default function PatientVitalsChart({ patientId }: PatientVitalsChartProps) {
    const [isClient, setIsClient] = React.useState(false);
    const { currentPatientId, getPatientReadings } = useMonitoringState();
    const isMonitoring = currentPatientId === patientId;

    // Get stored readings for this patient
    const readings = getPatientReadings(patientId);
    const ecgData = readings.slice(-100);
    const spo2Data = readings.slice(-100);
    const heartRateData = readings.slice(-100);

    React.useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return <div className="h-[250px] w-full bg-muted animate-pulse rounded-lg" />;
    }

    // Use fallback data if not connected and no historical data
    const currentEcgData = ecgData.length > 0 ? ecgData : generateChartData(100, 1, 0.5).map(d => ({
        timestamp: Date.now() + d.time * 1000,
        ecg: d.value,
        spo2: 0,
        heartRate: 0
    }));

    const currentSpo2Data = spo2Data.length > 0 ? spo2Data : generateChartData(100, 95, 0.1).map(d => ({
        timestamp: Date.now() + d.time * 1000,
        ecg: 0,
        spo2: Math.max(85, Math.min(100, 95 + d.value)),
        heartRate: 0
    }));

    const currentHeartRateData = heartRateData.length > 0 ? heartRateData : generateChartData(100, 75, 0.2).map(d => ({
        timestamp: Date.now() + d.time * 1000,
        ecg: 0,
        spo2: 0,
        heartRate: Math.max(50, Math.min(120, 75 + d.value))
    }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Vital Signs Monitor</h2>
        <Badge variant={isMonitoring ? "default" : "secondary"}>
          {isMonitoring ? "Live Monitoring" : "Historical Data"}
        </Badge>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">ECG (Electrocardiogram)</h3>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <AreaChart data={currentEcgData} margin={{ left: -20, right: 10, top: 5, bottom: 5 }}>
            <defs>
              <linearGradient id="fillEcg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-ecg)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-ecg)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="timestamp" 
              tickLine={false} 
              axisLine={false} 
              tickMargin={8}
              tickFormatter={(value) => new Date(value).toLocaleTimeString()}
            />
            <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                domain={[-2, 2]}
                unit="mV"
            />
            <ChartTooltip 
              cursor={false} 
              content={<ChartTooltipContent indicator="line" />}
              labelFormatter={(value) => new Date(value).toLocaleTimeString()}
            />
            <Area
              dataKey="ecg"
              type="natural"
              fill="url(#fillEcg)"
              stroke="var(--color-ecg)"
              strokeWidth={2}
              isAnimationActive={false}
            />
          </AreaChart>
        </ChartContainer>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">SpO2 (Blood Oxygen Saturation)</h3>
         <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <AreaChart data={currentSpo2Data} margin={{ left: -20, right: 10, top: 5, bottom: 5 }}>
            <defs>
              <linearGradient id="fillSpo2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-spo2)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-spo2)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="timestamp" 
              tickLine={false} 
              axisLine={false} 
              tickMargin={8}
              tickFormatter={(value) => new Date(value).toLocaleTimeString()}
            />
            <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                domain={[85, 100]}
                unit="%"
            />
            <ChartTooltip 
              cursor={false} 
              content={<ChartTooltipContent indicator="line" />}
              labelFormatter={(value) => new Date(value).toLocaleTimeString()}
            />
            <Area
              dataKey="spo2"
              type="natural"
              fill="url(#fillSpo2)"
              stroke="var(--color-spo2)"
              strokeWidth={2}
              isAnimationActive={false}
            />
          </AreaChart>
        </ChartContainer>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Heart Rate (BPM)</h3>
         <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <AreaChart data={currentHeartRateData} margin={{ left: -20, right: 10, top: 5, bottom: 5 }}>
            <defs>
              <linearGradient id="fillHeartRate" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-heartRate)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-heartRate)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="timestamp" 
              tickLine={false} 
              axisLine={false} 
              tickMargin={8}
              tickFormatter={(value) => new Date(value).toLocaleTimeString()}
            />
            <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                domain={[40, 150]}
                unit=" BPM"
            />
            <ChartTooltip 
              cursor={false} 
              content={<ChartTooltipContent indicator="line" />}
              labelFormatter={(value) => new Date(value).toLocaleTimeString()}
            />
            <Area
              dataKey="heartRate"
              type="natural"
              fill="url(#fillHeartRate)"
              stroke="var(--color-heartRate)"
              strokeWidth={2}
              isAnimationActive={false}
            />
          </AreaChart>
        </ChartContainer>
      </div>
    </div>
  );
}
