'use client';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useMonitoringState } from '@/lib/monitoring-state';
import { httpVitalsClient } from '@/lib/http-vitals';
import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface MonitoringControlProps {
  patientId: string;
  patientName: string;
}

export function MonitoringControl({ patientId, patientName }: MonitoringControlProps) {
  const { currentPatientId, setCurrentPatientId, addReading } = useMonitoringState();
  const [isMonitoring, setIsMonitoring] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Set up monitoring handlers when this patient is selected
    if (currentPatientId === patientId) {
      setIsMonitoring(true);
      
      httpVitalsClient.setHandlers({
        onData: (readings) => {
          // Store each reading for the current patient
          readings.forEach(reading => {
            addReading(patientId, reading);
          });
        },
        onDisconnect: () => {
          toast({
            title: "Device Disconnected",
            description: "Lost connection to ESP32 device. Readings paused.",
            variant: "destructive",
          });
          setIsMonitoring(false);
        }
      });
    } else {
      setIsMonitoring(false);
    }
  }, [currentPatientId, patientId, addReading, toast]);

  const handleStartMonitoring = () => {
    // Stop any existing monitoring
    if (currentPatientId && currentPatientId !== patientId) {
      httpVitalsClient.setHandlers({});
      httpVitalsClient.disconnect();
    }
    
    // Set this patient as current and start polling
    setCurrentPatientId(patientId);
    setIsMonitoring(true);
    httpVitalsClient.connect();
    
    toast({
      title: "Monitoring Started",
      description: `Now monitoring vital signs for ${patientName}`,
    });
  };

  const handleStopMonitoring = () => {
    setCurrentPatientId(null);
    setIsMonitoring(false);
    httpVitalsClient.setHandlers({});
    httpVitalsClient.disconnect();
    
    toast({
      title: "Monitoring Stopped",
      description: `Stopped monitoring vital signs for ${patientName}`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Real-time Monitoring</CardTitle>
        <CardDescription>
          Monitor vital signs in real-time using ESP32 device
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">Status</p>
            <p className="text-sm text-muted-foreground">
              {isMonitoring ? (
                <span className="text-green-500">●</span>
              ) : (
                <span className="text-gray-500">○</span>
              )}
              {' '}
              {isMonitoring ? 'Actively Monitoring' : 'Not Monitoring'}
            </p>
          </div>
          <Button
            variant={isMonitoring ? "destructive" : "default"}
            onClick={isMonitoring ? handleStopMonitoring : handleStartMonitoring}
          >
            {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
