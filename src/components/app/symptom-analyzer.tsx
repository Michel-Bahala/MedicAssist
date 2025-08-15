
// @/components/app/symptom-analyzer.tsx
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getMedicalAnalysis, type MedicalAnalysis } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/context/language-context';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AnalysisResults } from '@/components/app/analysis-results';
import { FirstAidAdvice } from '@/components/app/first-aid-advice';
import { Sparkles, Image as ImageIcon, X } from 'lucide-react';
import { Input } from '../ui/input';
import Image from 'next/image';

const formSchema = z.object({
  symptoms: z.string().min(10, { message: 'Please describe your symptoms in at least 10 characters.' }),
  image: z.any().optional(),
});


export function SymptomAnalyzer() {
  const [analysisResult, setAnalysisResult] = useState<MedicalAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();
  const { t, language } = useTranslation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      symptoms: "",
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        form.setValue('image', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const removeImage = () => {
    setImagePreview(null);
    form.setValue('image', null);
    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    if(fileInput) fileInput.value = '';
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setAnalysisResult(null);

    const result = await getMedicalAnalysis(values.symptoms, language, values.image);

    if (result.error) {
      toast({
        variant: "destructive",
        title: t('symptomAnalyzer.analysisFailed'),
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
          <CardTitle className="font-headline text-2xl">{t('symptomAnalyzer.title')}</CardTitle>
          <CardDescription>
            {t('symptomAnalyzer.description')}
            <span className="font-bold block mt-1">{t('symptomAnalyzer.disclaimer')}</span>
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
                    <FormLabel className="sr-only">{t('symptomAnalyzer.symptomsLabel')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('symptomAnalyzer.placeholder')}
                        className="min-h-[150px] text-base"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="image"
                render={() => (
                  <FormItem>
                    <FormLabel htmlFor="image-upload" className="font-medium flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-primary">
                      <ImageIcon className="h-5 w-5" />
                      {t('symptomAnalyzer.uploadImage')}
                    </FormLabel>
                    <FormControl>
                       <Input id="image-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
               />

              {imagePreview && (
                <div className="relative w-48 h-48 border rounded-md overflow-hidden">
                  <Image src={imagePreview} alt="Image preview" layout="fill" objectFit="cover" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-7 w-7"
                    onClick={removeImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <Button type="submit" disabled={isLoading} className="w-full bg-accent hover:bg-accent/90">
                {isLoading ? t('symptomAnalyzer.analyzing') : <> <Sparkles className="mr-2 h-4 w-4" /> {t('symptomAnalyzer.analyzeButton')} </>}
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
