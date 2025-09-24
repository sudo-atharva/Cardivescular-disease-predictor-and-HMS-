/*
  Author: Atharva-Tikle
  Original Author: Atharva Tikle
  License: MIT
  Notice: No permission is granted to patent this code as yourself.
*/

'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import type { Report } from '@/lib/models';
import { Skeleton } from '@/components/ui/skeleton';


const patientId = "pat_001"; // Mock patient ID for the logged in user

export default function PatientReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/patients/${patientId}/reports`);
        if (!res.ok) throw new Error('Failed to fetch reports');
        const data = await res.json();
        setReports(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReports();
  }, []);


  if (isLoading) {
     return (
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
            </CardContent>
        </Card>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>My Reports</CardTitle>
          <CardDescription>Here are your available health reports.</CardDescription>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <p>You do not have any reports yet.</p>
          ) : (
            <Accordion type="multiple" className="w-full space-y-4">
              {reports.map((report) => (
                 <AccordionItem value={`item-${report.reportId}`} key={report.reportId} className="border rounded-lg px-4">
                  <AccordionTrigger className="text-lg font-semibold">
                    Report from {report.patientInfo.visitDate}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="prose prose-sm max-w-none">
                      <h2>Patient Information</h2>
                      <p><strong>Full Name:</strong> {report.patientInfo.fullName}</p>
                      <p><strong>Age:</strong> {report.patientInfo.age}</p>
                      <p><strong>Gender:</strong> {report.patientInfo.gender}</p>
                      <p><strong>Address & Contact:</strong> {report.patientInfo.address}</p>
                      <hr />
                      <h2>Medical Details</h2>
                      <p><strong>Presenting Complaint:</strong> {report.medicalHistory.complaint}</p>
                      <p><strong>History of Present Illness:</strong> {report.medicalHistory.hpi}</p>
                      <hr />
                       <h2>Diagnosis</h2>
                      <p><strong>Diagnosis:</strong> {report.investigations.diagnosis}</p>
                      <hr />
                       <h2>Treatment Plan</h2>
                      <p><strong>Plan & Prescription:</strong> {report.treatmentPlan.plan}</p>
                       <hr />
                       <p>For a detailed analysis and ML-based insights, please consult with your doctor.</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
