
'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { createDiagnosisReport } from '@/lib/actions';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Bot, Loader2 } from 'lucide-react';
import { Input } from './ui/input';

const initialState = {
  message: '',
  report: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full sm:w-auto" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
      Generate Report
    </Button>
  );
}

export default function DiagnosisReportGenerator() {
  const [state, formAction] = useActionState(createDiagnosisReport, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.message && state.message !== 'success') {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: state.message,
      });
    }
  }, [state, toast]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>ML-Based Diagnosis Assistant</CardTitle>
        <CardDescription>Enter patient data to generate a preliminary diagnosis report using our AI model. The first line of the ECG/PPG data should be the patient ID.</CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="ecgReadings">ECG Readings</Label>
              <Textarea
                id="ecgReadings"
                name="ecgReadings"
                placeholder="Patient ID on first line, then paste raw ECG data..."
                className="min-h-[120px] font-mono"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ppgReadings">PPG Readings</Label>
              <Textarea
                id="ppgReadings"
                name="ppgReadings"
                placeholder="Patient ID on first line, then paste raw PPG data..."
                className="min-h-[120px] font-mono"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="patientHistory">Patient History</Label>
            <Textarea
              id="patientHistory"
              name="patientHistory"
              placeholder="Provide relevant patient medical history..."
              className="min-h-[100px]"
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <SubmitButton />
        </CardFooter>
      </form>
      {state.report && (
        <CardContent>
            <Card className="bg-muted/50">
                <CardHeader>
                    <CardTitle>Generated Diagnosis Report</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none text-foreground">
                   <p>{state.report}</p>
                </CardContent>
            </Card>
        </CardContent>
      )}
    </Card>
  );
}
