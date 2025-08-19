'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { reports } from '@/lib/data';
import PatientVitalsChart from '@/components/patient-charts';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Patient Reports</CardTitle>
          <CardDescription>View and manage all patient reports.</CardDescription>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <p>No reports have been generated yet.</p>
          ) : (
            <Accordion type="multiple" className="w-full space-y-4">
              {reports.map((report) => (
                <AccordionItem value={`item-${report.id}`} key={report.id} className="border rounded-lg px-4">
                  <AccordionTrigger className="text-lg font-semibold">
                    Report for {report.patientInfo.fullName} (ID: {report.patientInfo.patientId}) - {report.patientInfo.visitDate}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="prose prose-sm max-w-none printable-content">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold">Medical Report</h2>
                        <Button variant="outline" size="sm" onClick={() => window.print()} className="print:hidden">
                          <Printer className="mr-2 h-4 w-4" />
                          Print Report
                        </Button>
                      </div>

                      <h2>Patient Information</h2>
                      <p><strong>Full Name:</strong> {report.patientInfo.fullName}</p>
                      <p><strong>Age:</strong> {report.patientInfo.age}</p>
                      <p><strong>Gender:</strong> {report.patientInfo.gender}</p>
                      <p><strong>Address & Contact:</strong> {report.patientInfo.address}</p>
                      <hr />

                      <h2>Medical Details</h2>
                      <p><strong>Presenting Complaint:</strong> {report.medicalHistory.complaint}</p>
                      <p><strong>History of Present Illness:</strong> {report.medicalHistory.hpi}</p>
                      <p><strong>Past Medical History:</strong> {report.medicalHistory.pastMedicalHistory}</p>
                       <p><strong>Medication History:</strong> {report.medicalHistory.medicationHistory}</p>
                       <p><strong>Family History:</strong> {report.medicalHistory.familyHistory}</p>
                       <p><strong>Personal/Social History:</strong> {report.medicalHistory.socialHistory}</p>
                      <hr />

                       <h2>Clinical Examination</h2>
                      <p><strong>General Examination:</strong> {report.clinicalExam.general}</p>
                      <p><strong>Systemic Examination:</strong> {report.clinicalExam.systemic}</p>
                      <hr />

                      <h2>Live Vitals Waveform</h2>
                      <div className="not-prose">
                        <PatientVitalsChart />
                      </div>
                      <hr />

                       <h2>Investigations & Diagnosis</h2>
                      <p><strong>Investigations Ordered:</strong> {report.investigations.ordered}</p>
                      <p><strong>Diagnosis:</strong> {report.investigations.diagnosis}</p>
                      <hr />

                       <h2>Treatment Plan</h2>
                      <p><strong>Plan & Prescription:</strong> {report.treatmentPlan.plan}</p>
                       <hr />

                       <Card className="bg-primary/10 mt-4 break-inside-avoid">
                        <CardHeader>
                          <CardTitle>ML-Based Diagnosis Report</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p>{report.mlDiagnosis}</p>
                        </CardContent>
                       </Card>
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
