
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

import { useToast } from '@/components/ui/use-toast';
import { useSettings } from '@/lib/settings';
import { vitalsSocket } from '@/lib/websocket';

export default function SettingsPage() {
  const { toast } = useToast();
  const [userType, setUserType] = useState<'doctor' | 'patient' | null>(null);
  const { esp32IpAddress, setEsp32IpAddress } = useSettings();
  const [esp32Ip, setEsp32Ip] = useState(esp32IpAddress);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Update connection status periodically and handle connection
    const updateConnectionStatus = () => {
      const connected = vitalsSocket.isDeviceConnected();
      setIsConnected(connected);
    };

    // Update immediately
    updateConnectionStatus();

    // Set up periodic check
    const interval = setInterval(updateConnectionStatus, 1000);

    // Set up WebSocket event handlers
    vitalsSocket.setHandlers({
      onConnect: () => {
        setIsConnected(true);
        toast({
          title: "Connected",
          description: "Successfully connected to ESP32 device.",
        });
      },
      onDisconnect: () => {
        setIsConnected(false);
        toast({
          title: "Disconnected",
          description: "Lost connection to ESP32 device.",
          variant: "destructive",
        });
      }
    });

    return () => {
      clearInterval(interval);
      vitalsSocket.setHandlers({});
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
    
    // Validate IP/URL format: allow host:port, ws://host:port[/path], wss://...
    const isValidIp = /^(ws[s]?:\/\/)?([a-zA-Z0-9][-a-zA-Z0-9_.]*)(:[0-9]+)?(\/[\w-./]*)?$/.test(esp32Ip);
    
    if (!isValidIp) {
      toast({
        title: "Invalid IP Address",
        description: "Please enter a valid IP address or hostname (e.g., 192.168.1.100:81 or localhost:81)",
        variant: "destructive",
      });
      return;
    }

    try {
      // Update the settings
      setEsp32IpAddress(esp32Ip);
      
      // Attempt to reconnect the WebSocket with new IP
      vitalsSocket.reconnect();

      // Start checking connection status
      let connectionTimeout = setTimeout(() => {
        if (!vitalsSocket.isDeviceConnected()) {
          toast({
            title: "Connection Warning",
            description: "Could not connect to ESP32. Please check if the device is online and the IP is correct.",
            variant: "default",
          });
        }
      }, 3000);

      // Clean up the timeout
      setTimeout(() => clearTimeout(connectionTimeout), 3100);

      toast({
        title: "Settings Saved",
        description: "ESP32 connection settings have been updated.",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please check the console for details.",
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
                      placeholder="e.g., 192.168.1.100:81"
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
