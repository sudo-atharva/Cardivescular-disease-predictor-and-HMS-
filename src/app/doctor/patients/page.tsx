'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlusCircle, Link as LinkIcon, Save } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { patients, reports, addReport } from '@/lib/data';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';


export default function PatientsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newReport = {
      id: `rep_${Date.now()}`,
      patientInfo: {
        fullName: formData.get('fullName') as string,
        patientId: formData.get('patientId') as string,
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
      mlDiagnosis: "Awaiting ML model analysis. Generate from the patient's detail page.",
    };
    
    addReport(newReport);
    
    toast({
      title: "Patient Saved",
      description: `${newReport.patientInfo.fullName} has been added and a report created.`,
    });
    
    setIsDialogOpen(false);
    // This is a way to trigger a re-render to show the new report in lists
    router.refresh(); 
  };


  return (
    <div className="flex flex-col gap-6">
       <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Patient Records</CardTitle>
            <CardDescription>Overview of all currently admitted patients.</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Patient
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-4xl">
              <DialogHeader>
                <DialogTitle>Add New Patient</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
              <ScrollArea className="max-h-[70vh] p-4">
                  <Accordion type="multiple" defaultValue={['item-1']} className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>Patient Information</AccordionTrigger>
                      <AccordionContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input id="fullName" name="fullName" placeholder="John Doe" required />
                          </div>
                           <div className="space-y-2">
                            <Label htmlFor="patientId">Patient ID / UHID</Label>
                            <Input id="patientId" name="patientId" placeholder="e.g., pat_005" required />
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
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" type="button">Cancel</Button>
                </DialogClose>
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  Save Patient
                </Button>
              </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient ID</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Device ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead>Last Check-in</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-mono">{patient.id}</TableCell>
                  <TableCell className="font-medium">{patient.name}</TableCell>
                  <TableCell className="font-mono">{patient.deviceId || 'N/A'}</TableCell>
                  <TableCell>
                     <Badge variant={patient.status === 'Unstable' ? 'destructive' : 'secondary'}>
                      {patient.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={patient.risk === 'High' ? 'destructive' : (patient.risk === 'Medium' ? 'default' : 'secondary')}
                      className={patient.risk === 'Medium' ? 'bg-yellow-400 text-white' : ''}
                    >
                      {patient.risk}
                    </Badge>
                  </TableCell>
                  <TableCell>{patient.lastCheck}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      <LinkIcon className="mr-2 h-4 w-4" />
                      Assign Device
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
