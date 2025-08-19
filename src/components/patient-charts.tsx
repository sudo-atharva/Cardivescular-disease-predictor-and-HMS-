'use client';

import * as React from 'react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';

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
} satisfies ChartConfig;

export default function PatientVitalsChart() {
    const [isClient, setIsClient] = React.useState(false);

    React.useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return <div className="h-[250px] w-full bg-muted animate-pulse rounded-lg" />;
    }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">ECG (Electrocardiogram)</h3>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <AreaChart data={ecgData} margin={{ left: -20, right: 10, top: 5, bottom: 5 }}>
            <defs>
              <linearGradient id="fillEcg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-ecg)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-ecg)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={8} unit="s" />
            <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                domain={[-2, 2]}
                unit="mV"
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
            <Area
              dataKey="value"
              type="natural"
              fill="url(#fillEcg)"
              stroke="var(--color-ecg)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">PPG (Photoplethysmogram)</h3>
         <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <AreaChart data={ecgData} margin={{ left: -20, right: 10, top: 5, bottom: 5 }}>
            <defs>
              <linearGradient id="fillPpg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-ppg)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-ppg)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={8} unit="s" />
            <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                domain={[-3, 3]}
                unit="%"
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
            <Area
              dataKey="value"
              type="natural"
              fill="url(#fillPpg)"
              stroke="var(--color-ppg)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </div>
    </div>
  );
}
