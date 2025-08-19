
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

export default function SettingsPage() {
  const [userType, setUserType] = useState<'doctor' | 'patient' | null>(null);

  useEffect(() => {
    // In a real app, this would come from a session or context provider.
    // For this prototype, we'll determine it from the URL path.
    if (typeof window !== 'undefined') {
      const isDoctor = window.location.pathname.startsWith('/doctor');
      setUserType(isDoctor ? 'doctor' : 'patient');
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle saving settings
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
                    <Label htmlFor="esp32-ip">ESP32 Static IP Address</Label>
                    <Input id="esp32-ip" type="text" placeholder="e.g., 192.168.1.100" />
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
