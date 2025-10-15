/*
  Author: Atharva-Tikle
  Original Author: Atharva Tikle
  License: MIT
  Notice: No permission is granted to patent this code as yourself.
*/

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

import { useToast } from '@/components/ui/use-toast';
import { useSettings } from '@/lib/settings';
import { httpVitalsClient } from '@/lib/http-vitals';

export default function SettingsPage() {
  const { toast } = useToast();
  const [userType, setUserType] = useState<'doctor' | 'patient' | null>(null);
  const { esp32IpAddress, setEsp32IpAddress } = useSettings();
  const [esp32Ip, setEsp32Ip] = useState(esp32IpAddress);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Update connection status periodically and handle connection
    const updateConnectionStatus = () => {
      const connected = httpVitalsClient.isDeviceConnected();
      setIsConnected(connected);
    };

    // Update immediately
    updateConnectionStatus();

    // Set up periodic check
    const interval = setInterval(updateConnectionStatus, 1000);

    // Set up HTTP client event handlers
    httpVitalsClient.setHandlers({
      onConnect: () => {
        setIsConnected(true);
        toast({
          title: "Connected",
          description: "Successfully connected to ESP32 device via HTTP.",
        });
      },
      onDisconnect: () => {
        setIsConnected(false);
        toast({
          title: "Disconnected",
          description: "Lost connection to ESP32 device.",
          variant: "destructive",
        });
      },
      onError: (error) => {
        console.error('HTTP vitals error:', error);
      }
    });

    return () => {
      clearInterval(interval);
      httpVitalsClient.setHandlers({});
    };
  }, [toast]);

  useEffect(() => {
    // In a real app, this would come from a session or context provider.
    // For this prototype, we'll determine it from the URL path.
    if (typeof window !== 'undefined') {
      const isDoctor = window.location.pathname.startsWith('/doctor');
      setUserType(isDoctor ? 'doctor' : 'patient');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isValidIp = /^(https?:\/\/)?([a-zA-Z0-9][-a-zA-Z0-9_.]*)(:[0-9]+)?$/.test(esp32Ip);
    
    if (!isValidIp) {
      toast({
        title: "Invalid IP Address",
        description: "Please enter a valid IP address or hostname (e.g., 192.168.31.111 or 192.168.1.100)",
        variant: "destructive",
      });
      return;
    }

    try {
      // Update the settings first
      setEsp32IpAddress(esp32Ip);
      
      // Clean up the IP (remove protocol if present)
      let cleanIp = esp32Ip;
      if (cleanIp.startsWith('http://')) cleanIp = cleanIp.substring(7);
      if (cleanIp.startsWith('https://')) cleanIp = cleanIp.substring(8);
      
      // Set the base URL (without protocol)
      httpVitalsClient.setBaseUrl(cleanIp);
      
      // Test the connection with a direct fetch to bypass any client-side caching
      const testUrl = `http://${cleanIp}/vitals`;
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        mode: 'cors',
        cache: 'no-cache'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Test connection successful:', data);
      
      toast({
        title: "Connection Successful",
        description: `Successfully connected to ESP32 at ${cleanIp}`,
      });
      
    } catch (error) {
      console.error('Connection test failed:', error);
      toast({
        title: "Connection Failed",
        description: `Could not connect to ESP32 at ${esp32Ip}. ${error instanceof Error ? error.message : 'Please check the IP and try again.'}`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>Manage your account and application settings.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {userType === 'doctor' && (
              <Card>
                <CardHeader>
                  <CardTitle>Device Configuration</CardTitle>
                  <CardDescription>
                    Configure the static IP address for your ESP32 device to stream ECG and PPG data.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="esp32-ip">ESP32 IP Address and Port</Label>
                    <Input
                      id="esp32-ip"
                      type="text"
                      value={esp32Ip}
                      onChange={(e) => setEsp32Ip(e.target.value)}
                      placeholder="e.g., 192.168.1.100 or 192.168.1.50:80"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Current connection status: {isConnected ? (
                        <span className="text-green-500">Connected</span>
                      ) : (
                        <span className="text-red-500">Disconnected</span>
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
             <Card>
              <CardHeader>
                <CardTitle>Account</CardTitle>
                <CardDescription>
                  Update your personal information.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" type="text" defaultValue={userType === 'doctor' ? 'Dr. Evelyn Reed' : 'John Doe'} />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue={userType === 'doctor' ? 'e.reed@health.io' : 'john.doe@email.com'} />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="password">Change Password</Label>
                  <Input id="password" type="password" placeholder="Enter new password" />
                </div>
              </CardContent>
            </Card>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button type="submit">
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
