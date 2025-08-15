
// @/components/app/symptom-analyzer.tsx
"use client";

import { useState, useEffect, useRef } from 'react';
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
import { Sparkles, Image as ImageIcon, X, User, Mic } from 'lucide-react';
import { Input } from '../ui/input';
import Image from 'next/image';

const formSchema = z.object({
  symptoms: z.string().min(10, { message: 'Please describe your symptoms in at least 10 characters.' }),
  image: z.any().optional(),
  patientName: z.string().optional(),
});

type Patient = {
  id: string;
  fullName: string;
  email?: string;
  analyses?: any[];
}

export function SymptomAnalyzer() {
  const [analysisResult, setAnalysisResult] = useState<MedicalAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [suggestions, setSuggestions] = useState<Patient[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const { toast } = useToast();
  const { t, language } = useTranslation();
  
  const recognitionRef = useRef<any>(null);
  const patientInputRef = useRef<HTMLDivElement>(null);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      symptoms: "",
      patientName: "",
    },
  });
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = language;

        recognition.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map((result) => result[0])
            .map((result) => result.transcript)
            .join('');
          form.setValue('symptoms', form.getValues('symptoms') + transcript);
        };
        
        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [language, form]);


  useEffect(() => {
    try {
      const savedData = localStorage.getItem('patientHistory');
      if (savedData) {
        setPatients(JSON.parse(savedData));
      }
    } catch (error) {
      console.error("Failed to parse patient history from localStorage", error);
      setPatients([]);
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (patientInputRef.current && !patientInputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

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
  
  const saveAnalysisToPatient = (patientId: string, symptoms: string, analysisData: MedicalAnalysis) => {
    const updatedPatients = patients.map(p => {
        if (p.id === patientId) {
            const newAnalysis = {
                analysisDate: new Date().toISOString(),
                symptoms: symptoms,
                analysis: analysisData.analysis,
                advice: analysisData.advice,
            };
            const existingAnalyses = p.analyses || [];
            return { ...p, analyses: [...existingAnalyses, newAnalysis] };
        }
        return p;
    });

    localStorage.setItem('patientHistory', JSON.stringify(updatedPatients));
    setPatients(updatedPatients);
  };

  const addNewPatientAndSaveAnalysis = (fullName: string, symptoms: string, analysisData: MedicalAnalysis) => {
    const newPatient: Patient = {
        id: new Date().toISOString(),
        fullName: fullName,
        analyses: [{
            analysisDate: new Date().toISOString(),
            symptoms: symptoms,
            analysis: analysisData.analysis,
            advice: analysisData.advice,
        }]
    };
    const updatedPatients = [...patients, newPatient];
    localStorage.setItem('patientHistory', JSON.stringify(updatedPatients));
    setPatients(updatedPatients);
    return newPatient;
  };


  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setAnalysisResult(null);

    let patientToUpdate: Patient | undefined | null = null;
    if (values.patientName) {
        patientToUpdate = patients.find(p => p.fullName.toLowerCase() === values.patientName?.toLowerCase());
    }

    const result = await getMedicalAnalysis(values.symptoms, language, values.image, patientToUpdate?.email);

    if (result.error) {
      toast({
        variant: "destructive",
        title: t('symptomAnalyzer.analysisFailed'),
        description: result.error,
      });
    } else if (result.data) {
      setAnalysisResult(result.data);

      if (values.patientName) {
        if (patientToUpdate) {
            saveAnalysisToPatient(patientToUpdate.id, values.symptoms, result.data);
            toast({
              title: t('symptomAnalyzer.saveSuccessTitle'),
              description: t('symptomAnalyzer.saveSuccessDescription'),
            });
        } else {
            // Patient does not exist, create a new one
            const newPatient = addNewPatientAndSaveAnalysis(values.patientName, values.symptoms, result.data);
            toast({
              title: t('patientHistory.newPatientCreatedTitle'),
              description: t('patientHistory.newPatientCreatedDescription', { name: newPatient.fullName }),
            });
        }
      }
    }
    
    setIsLoading(false);
  }

  const handlePatientNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    form.setValue('patientName', value);
    if (value.length > 0) {
      const filtered = patients.filter(p => p.fullName.toLowerCase().includes(value.toLowerCase()));
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };
  
  const handleSuggestionClick = (patient: Patient) => {
    form.setValue('patientName', patient.fullName);
    setShowSuggestions(false);
  };


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
                  name="patientName"
                  render={({ field }) => (
                    <FormItem ref={patientInputRef}>
                      <FormLabel className="flex items-center gap-2 font-medium">
                        <User className="h-5 w-5" />
                        {t('symptomAnalyzer.selectPatient')}
                      </FormLabel>
                       <FormControl>
                          <div className="relative">
                            <Input 
                              placeholder={t('patientHistory.form.fullNamePlaceholder')}
                              {...field}
                              onChange={handlePatientNameChange}
                              onFocus={() => { if(field.value) setShowSuggestions(true); }}
                              autoComplete="off"
                            />
                            {showSuggestions && suggestions.length > 0 && (
                              <Card className="absolute z-10 w-full mt-1 bg-card border border-border">
                                <ul className="py-1">
                                  {suggestions.map((patient) => (
                                    <li 
                                      key={patient.id} 
                                      className="px-3 py-2 cursor-pointer hover:bg-accent"
                                      onClick={() => handleSuggestionClick(patient)}
                                    >
                                      {patient.fullName}
                                    </li>
                                  ))}
                                </ul>
                              </Card>
                            )}
                          </div>
                       </FormControl>
                       <FormMessage />
                    </FormItem>
                  )}
                />

              <FormField
                control={form.control}
                name="symptoms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">{t('symptomAnalyzer.symptomsLabel')}</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Textarea
                          placeholder={t('symptomAnalyzer.placeholder')}
                          className="min-h-[150px] text-base pr-12"
                          {...field}
                        />
                      </FormControl>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className={`absolute right-2 top-1/2 -translate-y-1/2 ${isListening ? 'text-destructive' : ''}`}
                        onClick={handleListen}
                      >
                        <Mic className="h-5 w-5" />
                      </Button>
                    </div>
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

    