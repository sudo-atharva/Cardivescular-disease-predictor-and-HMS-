
'use client';

import * as React from 'react';
import { useToast } from '@/components/ui/use-toast';
import { addReport, Patient } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

type CreateReportFormProps = {
  patient: Patient;
  onFormSubmit: () => void;
};

export default function CreateReportForm({ patient, onFormSubmit }: CreateReportFormProps) {
  const { toast } = useToast();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newReport = {
      id: `rep_${Date.now()}`,
      patientInfo: {
        fullName: patient.name,
        patientId: patient.id,
        age: formData.get('age') as string,
        gender: formData.get('gender') as string,
        visitDate: formData.get('visitDate') as string,
        address: formData.get('address') as string,
      },
      medicalHistory: {
        complaint: formData.get('complaint') as string,
        hpi: formData.get('hpi') as string,
        pastMedicalHistory: formData.get('pastMedicalHistory') as string,
        medicationHistory: formData.get('medicationHistory') as string,
        familyHistory: formData.get('familyHistory') as string,
        socialHistory: formData.get('socialHistory') as string,
      },
      clinicalExam: {
        general: formData.get('generalExam') as string,
        systemic: formData.get('systemicExam') as string,
      },
      investigations: {
        ordered: formData.get('investigations') as string,
        diagnosis: formData.get('diagnosis') as string,
      },
      treatmentPlan: {
        plan: formData.get('treatment') as string,
      },
      doctorDetails: {
        name: formData.get('doctorName') as string,
        regNumber: formData.get('regNumber') as string,
        signature: formData.get('signature') as string,
      },
      mlDiagnosis: "Awaiting ML model analysis.",
    };
    
    addReport(newReport);
    
    toast({
      title: "Report Saved",
      description: `A new report for ${patient.name} has been created.`,
    });
    
    onFormSubmit();
  };

  return (
    <form onSubmit={handleSubmit}>
      <ScrollArea className="max-h-[70vh] p-4">
        <Accordion type="multiple" defaultValue={['item-1', 'item-2']} className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>Patient Information</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" name="fullName" defaultValue={patient.name} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="patientId">Patient ID / UHID</Label>
                  <Input id="patientId" name="patientId" defaultValue={patient.id} disabled />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age / Date of Birth</Label>
                  <Input id="age" name="age" placeholder="35" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Sex / Gender</Label>
                  <Input id="gender" name="gender" placeholder="Male" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="visitDate">Date of Visit</Label>
                  <Input id="visitDate" name="visitDate" type="date" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address & Contact</Label>
                <Textarea id="address" name="address" placeholder="123 Health St, Medcity..." required />
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-2">
            <AccordionTrigger>Medical History</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="complaint">Presenting Complaint (PC)</Label>
                <Textarea id="complaint" name="complaint" placeholder="e.g., “Chest pain since 2 days”, “Fever with cough”" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hpi">History of Present Illness (HPI)</Label>
                <Textarea id="hpi" name="hpi" placeholder="Details about how the problem started, duration, progression..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pastMedicalHistory">Past Medical History</Label>
                <Textarea id="pastMedicalHistory" name="pastMedicalHistory" placeholder="Previous illnesses (diabetes, hypertension, TB...)" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="medicationHistory">Medication History</Label>
                <Textarea id="medicationHistory" name="medicationHistory" placeholder="All current medications being taken and known drug allergies" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="familyHistory">Family History</Label>
                <Textarea id="familyHistory" name="familyHistory" placeholder="Any hereditary illnesses in family (heart disease, cancers, etc.)" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="socialHistory">Personal / Social History</Label>
                <Textarea id="socialHistory" name="socialHistory" placeholder="Smoking, alcohol, tobacco, occupation, lifestyle" />
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-3">
            <AccordionTrigger>Clinical Examination</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="generalExam">General Examination</Label>
                <Textarea id="generalExam" name="generalExam" placeholder="Vitals: Pulse, Blood Pressure, Temperature, Respiratory Rate, SpO₂, General condition, pallor, icterus, cyanosis, edema" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="systemicExam">Systemic Examination</Label>
                <Textarea id="systemicExam" name="systemicExam" placeholder="CVS (heart), RS (lungs), CNS (nervous system), Abdomen" />
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger>Investigations & Diagnosis</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="investigations">Investigations Ordered / Lab Reports</Label>
                <Textarea id="investigations" name="investigations" placeholder="Blood tests, Radiology (X-Ray, CT, MRI, ECG, USG), Special tests" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="diagnosis">Diagnosis</Label>
                <Textarea id="diagnosis" name="diagnosis" placeholder="Provisional Diagnosis and Final Diagnosis" />
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-5">
            <AccordionTrigger>Treatment Plan</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="treatment">Treatment Plan / Prescription</Label>
                <Textarea id="treatment" name="treatment" placeholder="Medications prescribed with dose & duration, Procedures done, Follow-up advice" />
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-6">
            <AccordionTrigger>Doctor's Details</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="doctorName">Name of doctor</Label>
                  <Input id="doctorName" name="doctorName" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="regNumber">Registration number</Label>
                  <Input id="regNumber" name="regNumber" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="signature">Signature & Date</Label>
                <Input id="signature" name="signature" placeholder="Signature and today's date" />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </ScrollArea>
      <div className="flex justify-end pt-4 pr-4">
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" />
            Save New Report
          </Button>
      </div>
    </form>
  );
}
