
'use client';

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

const patients = [
  { id: 'pat_001', name: 'John Doe', status: 'Stable', lastCheck: '2 hours ago', risk: 'Low', deviceId: 'DEV_A' },
  { id: 'pat_002', name: 'Jane Smith', status: 'Unstable', lastCheck: '15 mins ago', risk: 'High', deviceId: 'DEV_B' },
  { id: 'pat_003', name: 'Robert Brown', status: 'Stable', lastCheck: '1 day ago', risk: 'Low', deviceId: null },
  { id: 'pat_004', name: 'Emily White', status: 'Monitoring', lastCheck: '45 mins ago', risk: 'Medium', deviceId: 'DEV_D' },
];

export default function PatientsPage() {
  return (
    <div className="flex flex-col gap-6">
       <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Patient Records</CardTitle>
            <CardDescription>Overview of all currently admitted patients.</CardDescription>
          </div>
          <Dialog>
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
              <ScrollArea className="max-h-[70vh] p-4">
                <form className="space-y-6">
                  <Accordion type="multiple" defaultValue={['item-1']} className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>Patient Information</AccordionTrigger>
                      <AccordionContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input id="fullName" placeholder="John Doe" />
                          </div>
                           <div className="space-y-2">
                            <Label htmlFor="patientId">Patient ID / UHID</Label>
                            <Input id="patientId" placeholder="e.g., pat_005" />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                           <div className="space-y-2">
                            <Label htmlFor="age">Age / Date of Birth</Label>
                            <Input id="age" placeholder="35" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="gender">Sex / Gender</Label>
                            <Input id="gender" placeholder="Male" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="visitDate">Date of Visit</Label>
                            <Input id="visitDate" type="date" />
                          </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="address">Address & Contact</Label>
                            <Textarea id="address" placeholder="123 Health St, Medcity..." />
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="item-2">
                      <AccordionTrigger>Medical History</AccordionTrigger>
                      <AccordionContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="complaint">Presenting Complaint (PC)</Label>
                          <Textarea id="complaint" placeholder="e.g., “Chest pain since 2 days”, “Fever with cough”" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="hpi">History of Present Illness (HPI)</Label>
                          <Textarea id="hpi" placeholder="Details about how the problem started, duration, progression..." />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="pastMedicalHistory">Past Medical History</Label>
                          <Textarea id="pastMedicalHistory" placeholder="Previous illnesses (diabetes, hypertension, TB...)" />
                        </div>
                         <div className="space-y-2">
                          <Label htmlFor="medicationHistory">Medication History</Label>
                          <Textarea id="medicationHistory" placeholder="All current medications being taken and known drug allergies" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="familyHistory">Family History</Label>
                          <Textarea id="familyHistory" placeholder="Any hereditary illnesses in family (heart disease, cancers, etc.)" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="socialHistory">Personal / Social History</Label>
                          <Textarea id="socialHistory" placeholder="Smoking, alcohol, tobacco, occupation, lifestyle" />
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    
                     <AccordionItem value="item-3">
                      <AccordionTrigger>Clinical Examination</AccordionTrigger>
                      <AccordionContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>General Examination</Label>
                          <Textarea placeholder="Vitals: Pulse, Blood Pressure, Temperature, Respiratory Rate, SpO₂, General condition, pallor, icterus, cyanosis, edema" />
                        </div>
                         <div className="space-y-2">
                          <Label>Systemic Examination</Label>
                          <Textarea placeholder="CVS (heart), RS (lungs), CNS (nervous system), Abdomen" />
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                     <AccordionItem value="item-4">
                      <AccordionTrigger>Investigations & Diagnosis</AccordionTrigger>
                      <AccordionContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="investigations">Investigations Ordered / Lab Reports</Label>
                          <Textarea id="investigations" placeholder="Blood tests, Radiology (X-Ray, CT, MRI, ECG, USG), Special tests" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="diagnosis">Diagnosis</Label>
                          <Textarea id="diagnosis" placeholder="Provisional Diagnosis and Final Diagnosis" />
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="item-5">
                      <AccordionTrigger>Treatment Plan</AccordionTrigger>
                      <AccordionContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="treatment">Treatment Plan / Prescription</Label>
                          <Textarea id="treatment" placeholder="Medications prescribed with dose & duration, Procedures done, Follow-up advice" />
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-6">
                      <AccordionTrigger>Doctor's Details</AccordionTrigger>
                      <AccordionContent className="space-y-4">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div className="space-y-2">
                            <Label htmlFor="doctorName">Name of doctor</Label>
                            <Input id="doctorName" />
                          </div>
                           <div className="space-y-2">
                            <Label htmlFor="regNumber">Registration number</Label>
                            <Input id="regNumber" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signature">Signature & Date</Label>
                          <Input id="signature" placeholder="Signature and today's date" />
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </form>
              </ScrollArea>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  Save Patient
                </Button>
              </DialogFooter>
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
