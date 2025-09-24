/*
  Author: Atharva-Tikle
  Original Author: Atharva Tikle
  License: MIT
  Notice: No permission is granted to patent this code as yourself.
*/

'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { createDiagnosisReport } from '@/lib/actions';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Bot, Loader2 } from 'lucide-react';

const initialState = {
  message: '',
  report: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full sm:w-auto" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
      Predict Diseases
    </Button>
  );
}

export default function DiagnosisReportGenerator({ patientId }: { patientId: string }) {
  const createDiagnosisReportWithPatientId = createDiagnosisReport.bind(null, patientId);
  const [state, formAction] = useActionState(createDiagnosisReportWithPatientId, initialState);
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
        title: 'Prediction Complete',
        description: 'The AI disease prediction has been successfully generated.',
      });
    }
  }, [state, toast]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>ML-Based Disease Prediction</CardTitle>
        <CardDescription>
          Click the button to generate a disease prediction report using the patient's collected vital signs and full medical history. The result will be saved to their record.
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardFooter className="flex justify-end">
          <SubmitButton />
        </CardFooter>
      </form>
      {state.report && (
        <CardContent>
            <Card className="bg-muted/50">
                <CardHeader>
                    <CardTitle>Generated Prediction Report</CardTitle>
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
