/*
  Author: Atharva-Tikle
  Original Author: Atharva Tikle
  License: MIT
  Notice: No permission is granted to patent this code as yourself.
*/

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Stethoscope, User, HeartPulse } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/components/ui/use-toast';

export default function AuthPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>, role: 'doctor' | 'patient') => {
    e.preventDefault();
    setError('');
    const formData = new FormData(e.currentTarget);
    const id = formData.get('id') as string;
    const password = formData.get('password') as string;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      toast({
        title: "Login Successful",
        description: `Welcome! Redirecting you to your dashboard.`,
      });

      router.push(`/${role}/dashboard`);
    } catch (err: any) {
      setError(err.message);
      toast({
        variant: 'destructive',
        title: "Login Failed",
        description: err.message,
      });
    }
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/20 via-background to-background -z-10"></div>
      <Card className="w-full max-w-md shadow-2xl border-2 border-primary/10">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary text-primary-foreground rounded-full p-3 w-fit mb-4">
             <HeartPulse className="h-10 w-10" />
          </div>
          <CardTitle className="text-3xl font-headline">HealthLink Vital Signs</CardTitle>
          <CardDescription>Secure access for medical professionals and patients.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="doctor" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="doctor">
                <Stethoscope className="mr-2 h-4 w-4" /> Doctor Login
              </TabsTrigger>
              <TabsTrigger value="patient">
                <User className="mr-2 h-4 w-4" /> Patient Login
              </TabsTrigger>
            </TabsList>
            <TabsContent value="doctor">
              <form onSubmit={(e) => handleLogin(e, 'doctor')} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="doctor-email">Email</Label>
                  <Input id="doctor-email" name="id" type="email" placeholder="doctor@healthlink.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doctor-password">Password</Label>
                  <Input id="doctor-password" name="password" type="password" required />
                </div>
                <Button type="submit" className="w-full">Sign In</Button>
              </form>
            </TabsContent>
            <TabsContent value="patient">
              <form onSubmit={(e) => handleLogin(e, 'patient')} className="space-y-4 pt-4">
                 <div className="space-y-2">
                  <Label htmlFor="patient-id">Patient ID</Label>
                  <Input id="patient-id" name="id" type="text" placeholder="pat_001" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="patient-password">Password</Label>
                  <Input id="patient-password" name="password" type="password" required />
                </div>
                <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Sign In</Button>
              </form>
            </TabsContent>
          </Tabs>
          {error && <p className="text-destructive text-center text-sm pt-4">{error}</p>}
        </CardContent>
      </Card>
       <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} HealthLink Vital Signs. All rights reserved.</p>
      </footer>
    </main>
  );
}
