'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { reports } from '@/lib/data';

// In a real app, we'd filter reports for the logged-in user.
// Here we'll show the first report as an example for "John Doe"
const patientReports = reports.filter(r => r.patientInfo.fullName === 'John Doe' || reports.indexOf(r) === 0);

export default function PatientReportsPage() {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>My Reports</CardTitle>
          <CardDescription>Here are your available health reports.</CardDescription>
        </CardHeader>
        <CardContent>
          {patientReports.length === 0 ? (
            <p>You do not have any reports yet.</p>
          ) : (
            <Accordion type="multiple" className="w-full space-y-4">
              {patientReports.map((report) => (
                 <AccordionItem value={`item-${report.id}`} key={report.id} className="border rounded-lg px-4">
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
