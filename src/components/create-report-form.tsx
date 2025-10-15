/*
  Author: Atharva-Tikle
  Original Author: Atharva Tikle
  License: MIT
  Notice: No permission is granted to patent this code as yourself.
*/

'use client';

import * as React from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { User, Report } from '@/lib/models';

type CreateReportFormProps = {
  patient: User;
  onFormSubmit: (newReport?: Report) => void;
  onCancel: () => void;
  latestReport: Report | null;
};

export default function CreateReportForm({ patient, onFormSubmit, onCancel, latestReport }: CreateReportFormProps) {          
  const { toast } = useToast();
  const formRef = React.useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const getFormValue = (formData: FormData, key: string): string => {
    const value = formData.get(key);
    return value ? value.toString() : '';
  };

  // Helper function to safely access nested properties
  const getDefaultValue = (path: string, defaultValue: any = '') => {
    if (!latestReport) return defaultValue;
    
    const parts = path.split('.');
    let value = latestReport as any;
    
    for (const part of parts) {
      if (value == null) return defaultValue;
      value = value[part];
    }
    
    return value ?? defaultValue;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(event.currentTarget);
    
    // Basic form validation
    const requiredFields = ['age', 'gender', 'complaint', 'hpi'];
    const missingFields = requiredFields.filter(field => !formData.get(field)?.toString().trim());
    
    if (missingFields.length > 0) {
      setIsSubmitting(false);
      toast({
        variant: 'destructive',
        title: 'Missing required fields',
        description: `Please fill in all required fields: ${missingFields.join(', ')}`,
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      const newReportPayload = {
        patientInfo: {
          fullName: patient.name || '',
          patientId: patient.userId || patient._id?.toString() || '',
          age: getFormValue(formData, 'age'),
          gender: getFormValue(formData, 'gender') || 'Not specified',
          visitDate: getFormValue(formData, 'visitDate') || new Date().toISOString().split('T')[0],
          address: getFormValue(formData, 'address') || 'Not provided',
          password: 'defaultPassword123' // This should be changed in production
        },
        medicalHistory: {
          complaint: getFormValue(formData, 'complaint'),
          hpi: getFormValue(formData, 'hpi'),
          pastMedicalHistory: getFormValue(formData, 'pastMedicalHistory'),
          medicationHistory: getFormValue(formData, 'medicationHistory'),
          familyHistory: getFormValue(formData, 'familyHistory'),
          socialHistory: getFormValue(formData, 'socialHistory'),
        },
        clinicalExam: {
          general: getFormValue(formData, 'generalExam'),
          systemic: getFormValue(formData, 'systemicExam'),
        },
        investigations: {
          ordered: getFormValue(formData, 'investigations'),
          diagnosis: getFormValue(formData, 'diagnosis'),
        },
        treatmentPlan: {
          plan: getFormValue(formData, 'treatment'),
        },
        doctorDetails: {
          name: getFormValue(formData, 'doctorName'),
          regNumber: getFormValue(formData, 'regNumber'),
          signature: getFormValue(formData, 'signature'),
        },
        mlDiagnosis: "Awaiting ML model analysis.",
        // Add device ID for ESP32 device tracking
        deviceId: patient.deviceId || 'default-device',
    };
    
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReportPayload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to save report. Please try again.');
      }

      const createdReport = await res.json();
      
      // Reset form after successful submission
      if (formRef.current) {
        formRef.current.reset();
      }
      
      toast({
        title: "Report Saved Successfully",
        description: `A new report for ${patient.name} has been created.`,
      });
      
      onFormSubmit(createdReport);
    } catch (err: any) {
      console.error('Error creating report:', err);
      toast({
        variant: 'destructive',
        title: "Error Creating Report",
        description: err.message || 'An unexpected error occurred. Please try again.',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} ref={formRef} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Create New Report</h2>
        <div className="space-x-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Report
              </>
            )}
          </Button>
        </div>
      </div>

      <Accordion type="multiple" defaultValue={['patient-info', 'medical-history', 'clinical-exam', 'investigations', 'treatment', 'doctor-details']}>
        <AccordionItem value="patient-info">
          <AccordionTrigger>Patient Information</AccordionTrigger>
          <AccordionContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" name="fullName" defaultValue={patient.name} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patientId">Patient ID / UHID</Label>
                <Input id="patientId" name="patientId" defaultValue={patient.userId} disabled />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age / Date of Birth</Label>
                <Input 
                  id="age" 
                  name="age" 
                  placeholder="35" 
                  defaultValue={getDefaultValue('patientInfo.age')} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Sex / Gender</Label>
                <Input 
                  id="gender" 
                  name="gender" 
                  placeholder="Male" 
                  defaultValue={getDefaultValue('patientInfo.gender')} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="visitDate">Date of Visit</Label>
                <Input 
                  id="visitDate" 
                  name="visitDate" 
                  type="date" 
                  defaultValue={getDefaultValue('patientInfo.visitDate', new Date().toISOString().split('T')[0])} 
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address & Contact</Label>
              <Textarea 
                id="address" 
                name="address" 
                placeholder="123 Health St, Medcity..." 
                defaultValue={getDefaultValue('patientInfo.address')} 
                required 
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="medical-history">
          <AccordionTrigger>Medical History</AccordionTrigger>
          <AccordionContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="complaint">Presenting Complaint (PC)</Label>
              <Textarea 
                id="complaint" 
                name="complaint" 
                placeholder='e.g., "Chest pain since 2 days", "Fever with cough"' 
                defaultValue={getDefaultValue('medicalHistory.complaint')} 
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hpi">History of Present Illness (HPI)</Label>
              <Textarea 
                id="hpi" 
                name="hpi" 
                placeholder="Details about how the problem started, duration, progression..." 
                defaultValue={getDefaultValue('medicalHistory.hpi')} 
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pastMedicalHistory">Past Medical History</Label>
              <Textarea 
                id="pastMedicalHistory" 
                name="pastMedicalHistory" 
                placeholder="Previous illnesses (diabetes, hypertension, TB...)" 
                defaultValue={getDefaultValue('medicalHistory.pastMedicalHistory')} 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="medicationHistory">Medication History</Label>
              <Textarea 
                id="medicationHistory" 
                name="medicationHistory" 
                placeholder="All current medications being taken and known drug allergies" 
                defaultValue={getDefaultValue('medicalHistory.medicationHistory')} 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="familyHistory">Family History</Label>
              <Textarea 
                id="familyHistory" 
                name="familyHistory" 
                placeholder="Any hereditary illnesses in family (heart disease, cancers, etc.)" 
                defaultValue={getDefaultValue('medicalHistory.familyHistory')} 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="socialHistory">Personal / Social History</Label>
              <Textarea 
                id="socialHistory" 
                name="socialHistory" 
                placeholder="Smoking, alcohol, tobacco, occupation, lifestyle" 
                defaultValue={getDefaultValue('medicalHistory.socialHistory')} 
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="clinical-exam">
          <AccordionTrigger>Clinical Examination</AccordionTrigger>
          <AccordionContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="generalExam">General Examination</Label>
              <Textarea 
                id="generalExam" 
                name="generalExam" 
                placeholder="Vitals: Pulse, Blood Pressure, Temperature, Respiratory Rate, SpO₂, General condition, pallor, icterus, cyanosis, edema" 
                defaultValue={getDefaultValue('clinicalExam.general')} 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="systemicExam">Systemic Examination</Label>
              <Textarea 
                id="systemicExam" 
                name="systemicExam" 
                placeholder="CVS (heart), RS (lungs), CNS (nervous system), Abdomen" 
                defaultValue={getDefaultValue('clinicalExam.systemic')} 
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="investigations">
          <AccordionTrigger>Investigations & Diagnosis</AccordionTrigger>
          <AccordionContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="investigations">Investigations Ordered / Lab Reports</Label>
              <Textarea 
                id="investigations" 
                name="investigations" 
                placeholder="Blood tests, Radiology (X-Ray, CT, MRI, ECG, USG), Special tests" 
                defaultValue={getDefaultValue('investigations.ordered')} 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="diagnosis">Diagnosis</Label>
              <Textarea 
                id="diagnosis" 
                name="diagnosis" 
                placeholder="Provisional Diagnosis and Final Diagnosis" 
                defaultValue={getDefaultValue('investigations.diagnosis')} 
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="treatment">
          <AccordionTrigger>Treatment Plan</AccordionTrigger>
          <AccordionContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="treatment">Treatment Plan</Label>
              <Textarea 
                id="treatment" 
                name="treatment" 
                placeholder="Medications, procedures, follow-up plan, lifestyle modifications" 
                defaultValue={getDefaultValue('treatmentPlan.plan')} 
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="doctor-details">
          <AccordionTrigger>Doctor's Details</AccordionTrigger>
          <AccordionContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="doctorName">Doctor's Name</Label>
                <Input 
                  id="doctorName" 
                  name="doctorName" 
                  placeholder="Dr. John Doe" 
                  defaultValue={getDefaultValue('doctorDetails.name')} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="regNumber">Registration Number</Label>
                <Input 
                  id="regNumber" 
                  name="regNumber" 
                  placeholder="Medical Council Registration Number" 
                  defaultValue={getDefaultValue('doctorDetails.regNumber')} 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="signature">Signature</Label>
              <Input 
                id="signature" 
                name="signature" 
                placeholder="Doctor's Signature" 
                defaultValue={getDefaultValue('doctorDetails.signature')} 
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </form>
  );
