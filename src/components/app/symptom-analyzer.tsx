"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { analyzeSymptoms, AnalyzeSymptomsOutput } from '@/ai/flows/analyze-symptoms';
import { getFirstAidAdvice, FirstAidAdviceOutput } from '@/ai/flows/first-aid-advice';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AnalysisResults } from '@/components/app/analysis-results';
import { FirstAidAdvice } from '@/components/app/first-aid-advice';
import { Sparkles } from 'lucide-react';

const formSchema = z.object({
  symptoms: z.string().min(10, { message: 'Please describe your symptoms in at least 10 characters.' }),
});

type MedicalAnalysis = {
    analysis: AnalyzeSymptomsOutput;
    advice: FirstAidAdviceOutput;
}

async function getMedicalAnalysis(symptoms: string): Promise<{ data?: MedicalAnalysis; error?: string }> {
  "use server";
  try {
    const analysis = await analyzeSymptoms({ symptoms });
    if (!analysis || !analysis.possibleConditions || analysis.possibleConditions.length === 0) {
      return { error: 'Could not analyze symptoms. The model returned an empty result. Please try rephrasing.' };
    }

    const suggestedConditions = analysis.possibleConditions.map(c => c.condition).join(', ');
    const advice = await getFirstAidAdvice({ symptoms, suggestedConditions });

    return { data: { analysis, advice } };
  } catch (e) {
    console.error(e);
    return { error: 'An unexpected error occurred. Please try again later.' };
  }
}

export function SymptomAnalyzer() {
  const [analysisResult, setAnalysisResult] = useState<MedicalAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      symptoms: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setAnalysisResult(null);

    const result = await getMedicalAnalysis(values.symptoms);

    if (result.error) {
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: result.error,
      });
    } else if (result.data) {
      setAnalysisResult(result.data);
    }
    
    setIsLoading(false);
  }

  return (
    <div className="w-full space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Symptom Analyzer</CardTitle>
          <CardDescription>
            Describe your symptoms below, and our AI will provide a preliminary analysis and first aid advice. 
            <span className="font-bold block mt-1">This is not a substitute for professional medical advice.</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="symptoms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">Symptoms</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., I have a sharp headache, fever, and a sore throat..."
                        className="min-h-[150px] text-base"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full bg-accent hover:bg-accent/90">
                {isLoading ? 'Analyzing...' : <> <Sparkles className="mr-2 h-4 w-4" /> Analyze Symptoms </>}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && <LoadingSkeleton />}
      
      {analysisResult && (
        <div className="space-y-8">
          <AnalysisResults analysis={analysisResult.analysis} />
          <FirstAidAdvice advice={analysisResult.advice} />
        </div>
      )}
    </div>
  );
}

function LoadingSkeleton() {
    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-3/4" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-5/6 mt-2" />
                </CardContent>
            </Card>
            <div className="space-y-4">
                <Skeleton className="h-8 w-1/2" />
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-1/2" />
                        <Skeleton className="h-4 w-1/4 mt-2" />
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Skeleton className="h-2 w-full" />
                        <Skeleton className="h-4 w-full mt-2" />
                         <Skeleton className="h-4 w-3/4 mt-1" />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
