'use client';

import * as React from 'react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { vitalsSocket, type VitalReading } from '@/lib/websocket';
import { Badge } from '@/components/ui/badge';

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
  ppg: {
    label: 'PPG',
    color: 'hsl(var(--chart-2))',
  }
} satisfies ChartConfig;

export default function PatientVitalsChart() {
    const [isClient, setIsClient] = React.useState(false);
    const [isConnected, setIsConnected] = React.useState(false);
    const [ecgData, setEcgData] = React.useState<VitalReading[]>([]);
    const [ppgData, setPpgData] = React.useState<VitalReading[]>([]);

    React.useEffect(() => {
        setIsClient(true);
        setIsConnected(vitalsSocket.isDeviceConnected());

        // Set up WebSocket handlers
        vitalsSocket.setHandlers({
            onMessage: (data) => {
                setEcgData(prev => [...prev.slice(-100), data]);
                setPpgData(prev => [...prev.slice(-100), data]);
            },
            onConnect: () => setIsConnected(true),
            onDisconnect: () => setIsConnected(false)
        });

        // Initial data
        const lastReadings = vitalsSocket.getLastReadings();
        if (lastReadings.length > 0) {
            setEcgData(lastReadings);
            setPpgData(lastReadings);
        }

        return () => {
            vitalsSocket.setHandlers({});
        };
    }, []);

    if (!isClient) {
        return <div className="h-[250px] w-full bg-muted animate-pulse rounded-lg" />;
    }

    // Use fallback data if not connected and no historical data
    const currentEcgData = ecgData.length > 0 ? ecgData : generateChartData(100, 1, 0.5).map(d => ({
        timestamp: Date.now() + d.time * 1000,
        ecg: d.value,
        ppg: 0
    }));

    const currentPpgData = ppgData.length > 0 ? ppgData : generateChartData(100, 1, 0.3).map(d => ({
        timestamp: Date.now() + d.time * 1000,
        ecg: 0,
        ppg: d.value
    }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Vital Signs Monitor</h2>
        <Badge variant={isConnected ? "default" : "secondary"}>
          {isConnected ? "Live Data" : "Historical Data"}
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
        <h3 className="text-lg font-semibold mb-2">PPG (Photoplethysmogram)</h3>
         <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <AreaChart data={currentPpgData} margin={{ left: -20, right: 10, top: 5, bottom: 5 }}>
            <defs>
              <linearGradient id="fillPpg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-ppg)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-ppg)" stopOpacity={0.1} />
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
                domain={[-3, 3]}
                unit="%"
            />
            <ChartTooltip 
              cursor={false} 
              content={<ChartTooltipContent indicator="line" />}
              labelFormatter={(value) => new Date(value).toLocaleTimeString()}
            />
            <Area
              dataKey="ppg"
              type="natural"
              fill="url(#fillPpg)"
              stroke="var(--color-ppg)"
              strokeWidth={2}
              isAnimationActive={false}
            />
          </AreaChart>
        </ChartContainer>
      </div>
    </div>
  );
}
