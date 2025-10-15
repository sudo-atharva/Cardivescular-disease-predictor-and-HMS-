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
import PatientVitalsChart from '@/components/patient-charts';
import { Button } from '@/components/ui/button';
import { Printer, Trash2 } from 'lucide-react';
import type { Report } from '@/lib/models';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('/api/reports', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reportId }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete report');
      }

      // Remove the deleted report from the state
      setReports(prevReports => prevReports.filter(report => report.reportId !== reportId));
      toast.success('Report deleted successfully');
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error('Failed to delete report');
    }
  };

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/reports');
      if (!res.ok) throw new Error('Failed to fetch reports');
      const data = await res.json();
      setReports(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load reports');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleCreateNewReport = (patientId: string) => {
    router.push(`/doctor/reports/new?patientId=${patientId}`);
  };

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
    );
  }

  // Group reports by patient
  const reportsByPatient = reports.reduce((acc, report) => {
    if (!acc[report.patientId]) {
      acc[report.patientId] = [];
    }
    acc[report.patientId].push(report);
    return acc;
  }, {} as Record<string, Report[]>);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Patient Reports</CardTitle>
              <CardDescription>View and manage all patient reports</CardDescription>
            </div>
            <Button onClick={() => router.push('/doctor/reports/new')}>
              Create New Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {Object.entries(reportsByPatient).length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No reports have been generated yet.</p>
              <Button 
                className="mt-4" 
                onClick={() => router.push('/doctor/reports/new')}
              >
                Create Your First Report
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(reportsByPatient).map(([patientId, patientReports]) => {
                const latestReport = patientReports[0];
                const reportCount = patientReports.length;
                
                return (
                  <Card key={patientId} className="overflow-hidden">
                    <div className="bg-muted/50 p-4 border-b">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {latestReport.patientInfo.fullName}
                            <span className="text-muted-foreground ml-2 text-sm font-normal">
                              (ID: {patientId})
                            </span>
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {reportCount} report{reportCount !== 1 ? 's' : ''} • Last visit: {new Date(latestReport.patientInfo.visitDate).toLocaleDateString()}
                          </p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleCreateNewReport(patientId)}
                        >
                          New Report
                        </Button>
                      </div>
                    </div>
                    
                    <Accordion type="multiple" className="w-full">
                      {patientReports.map((report) => (
                        <AccordionItem 
                          key={report.reportId} 
                          value={report.reportId}
                          className="border-b-0"
                        >
                          <div className="flex items-center justify-between p-4 hover:bg-muted/50">
                            <AccordionTrigger className="hover:no-underline [&>svg]:hover:translate-x-1 [&>svg]:transition-transform">
                              <div className="text-left">
                                <p className="font-medium">
                                  {new Date(report.patientInfo.visitDate).toLocaleDateString()}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {report.medicalHistory?.complaint?.substring(0, 100) || 'No complaint recorded'}
                                  {report.medicalHistory?.complaint?.length > 100 ? '...' : ''}
                                </p>
                              </div>
                            </AccordionTrigger>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteReport(report.reportId);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete report</span>
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => window.print()}
                              >
                                <Printer className="h-4 w-4" />
                                <span className="sr-only">Print report</span>
                              </Button>
                            </div>
                          </div>
                          
                          <AccordionContent className="p-4 pt-0">
                            <div className="prose prose-sm max-w-none">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div>
                                  <h4 className="font-semibold mb-2">Patient Information</h4>
                                  <div className="space-y-1 text-sm">
                                    <p><span className="text-muted-foreground">Name:</span> {report.patientInfo.fullName}</p>
                                    <p><span className="text-muted-foreground">Age:</span> {report.patientInfo.age}</p>
                                    <p><span className="text-muted-foreground">Gender:</span> {report.patientInfo.gender}</p>
                                    <p><span className="text-muted-foreground">Visit Date:</span> {new Date(report.patientInfo.visitDate).toLocaleDateString()}</p>
                                    <p><span className="text-muted-foreground">Address:</span> {report.patientInfo.address}</p>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-2">Medical Summary</h4>
                                  <div className="space-y-1 text-sm">
                                    <p><span className="text-muted-foreground">Complaint:</span> {report.medicalHistory?.complaint || 'Not specified'}</p>
                                    <p><span className="text-muted-foreground">Diagnosis:</span> {report.investigations?.diagnosis || 'Not specified'}</p>
                                    <p><span className="text-muted-foreground">Treatment:</span> {report.treatmentPlan?.plan ? 'Prescribed' : 'Not specified'}</p>
                                  </div>
                                </div>
                              </div>

                              <div className="mt-6">
                                <h4 className="font-semibold mb-2">Full Report</h4>
                                <div className="space-y-6">
                                  <div>
                                    <h5 className="font-medium mb-1">Presenting Complaint</h5>
                                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                                      {report.medicalHistory?.complaint || 'Not specified'}
                                    </p>
                                  </div>

                                  <div>
                                    <h5 className="font-medium mb-1">History of Present Illness</h5>
                                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                                      {report.medicalHistory?.hpi || 'Not specified'}
                                    </p>
                                  </div>

                                  <div>
                                    <h5 className="font-medium mb-1">Clinical Examination</h5>
                                    <div className="space-y-2">
                                      <div>
                                        <span className="text-sm font-medium">General:</span>
                                        <p className="text-sm text-muted-foreground whitespace-pre-line">
                                          {report.clinicalExam?.general || 'Not documented'}
                                        </p>
                                      </div>
                                      <div>
                                        <span className="text-sm font-medium">Systemic:</span>
                                        <p className="text-sm text-muted-foreground whitespace-pre-line">
                                          {report.clinicalExam?.systemic || 'Not documented'}
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  <div>
                                    <h5 className="font-medium mb-1">Investigations</h5>
                                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                                      {report.investigations?.ordered || 'No investigations ordered'}
                                    </p>
                                  </div>

                                  <div>
                                    <h5 className="font-medium mb-1">Diagnosis</h5>
                                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                                      {report.investigations?.diagnosis || 'No diagnosis recorded'}
                                    </p>
                                  </div>

                                  <div>
                                    <h5 className="font-medium mb-1">Treatment Plan</h5>
                                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                                      {report.treatmentPlan?.plan || 'No treatment plan specified'}
                                    </p>
                                  </div>

                                  {report.mlDiagnosis && (
                                    <div className="bg-muted/50 p-4 rounded-lg">
                                      <h5 className="font-medium mb-1">ML-Based Analysis</h5>
                                      <p className="text-sm text-muted-foreground whitespace-pre-line">
                                        {report.mlDiagnosis}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
