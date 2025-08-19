
'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { createDiagnosisReport } from '@/lib/actions';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Bot, Loader2 } from 'lucide-react';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

const initialState = {
  message: '',
  report: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full sm:w-auto" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
      Generate Prediction Report
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
     if (state.message === 'success' && state.report) {
      toast({
        title: 'Report Generated',
        description: 'The AI diagnosis report has been successfully created.',
      });
    }
  }, [state, toast]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>ML-Based Diagnosis Assistant</CardTitle>
        <CardDescription>
          Click the button to generate a preliminary diagnosis report using the patient's collected vital signs data. Please provide a brief summary of the patient's history below.
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent>
          <div className="space-y-2">
              <Label htmlFor="patientHistory">Patient History Summary</Label>
              <Textarea
                id="patientHistory"
                name="patientHistory"
                placeholder="Provide a brief summary of relevant patient medical history (e.g., existing conditions, chief complaint)..."
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
