
'use client';

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/app/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/context/language-context';
import { PlusCircle, Edit, Trash2, Stethoscope, LifeBuoy, Search } from 'lucide-react';
import type { MedicalAnalysis } from '@/app/actions';

const analysisSchema = z.object({
  analysisDate: z.string(),
  symptoms: z.string(),
  analysis: z.any(),
  advice: z.any(),
});

const patientSchema = z.object({
  id: z.string().optional(),
  fullName: z.string().min(1, { message: 'Full name is required.' }),
  email: z.string().email({ message: 'Invalid email address.' }).optional().or(z.literal('')),
  dateOfBirth: z.string().optional(),
  allergies: z.string().optional(),
  medications: z.string().optional(),
  chronicConditions: z.string().optional(),
  previousSurgeries: z.string().optional(),
  analyses: z.array(analysisSchema).optional(),
});

type PatientData = z.infer<typeof patientSchema>;
type AnalysisRecord = z.infer<typeof analysisSchema>;

function PatientHistoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { t } = useTranslation();

  const [isMounted, setIsMounted] = useState(false);
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const action = useMemo(() => searchParams.get('action'), [searchParams]);
  const patientId = useMemo(() => searchParams.get('id'), [searchParams]);
  const showForm = useMemo(() => action === 'add' || action === 'edit', [action]);


  const form = useForm<PatientData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      id: '',
      fullName: '',
      email: '',
      dateOfBirth: '',
      allergies: '',
      medications: '',
      chronicConditions: '',
      previousSurgeries: '',
      analyses: [],
    },
  });

  useEffect(() => {
    // This effect runs only on the client, after the component has mounted.
    // This is the correct place to access localStorage.
    setIsMounted(true);
    try {
      const savedData = localStorage.getItem('patientHistory');
      const parsedData = savedData ? JSON.parse(savedData) : [];
      if (Array.isArray(parsedData)) {
        setPatients(parsedData);
      } else {
        setPatients([]);
      }
    } catch (error) {
      console.error("Failed to parse patient history from localStorage", error);
      setPatients([]);
      toast({
        variant: "destructive",
        title: "Error loading data",
        description: "Could not load patient history from your device.",
      });
    }
  }, [toast]);
  
  useEffect(() => {
    if (showForm && patients.length > 0) {
      if (action === 'edit' && patientId) {
          const patientToEdit = patients.find(p => p.id === patientId);
          if (patientToEdit) {
              form.reset(patientToEdit);
          } else {
              router.push('/patient-history');
          }
      }
    } else if (action === 'add') {
      form.reset({
        id: '',
        fullName: '',
        email: '',
        dateOfBirth: '',
        allergies: '',
        medications: '',
        chronicConditions: '',
        previousSurgeries: '',
        analyses: [],
      });
    }
  }, [action, patientId, patients, form, router, showForm]);
  

  const savePatientsToLocalStorage = (updatedPatients: PatientData[]) => {
    try {
      localStorage.setItem('patientHistory', JSON.stringify(updatedPatients));
      setPatients(updatedPatients);
    } catch (error) {
       console.error("Failed to save patient history to localStorage", error);
       toast({
        variant: "destructive",
        title: "Error saving data",
        description: "Could not save patient history to your device.",
      });
    }
  };

  const onSubmit = (data: PatientData) => {
    let updatedPatients;
    if (action === 'edit' && patientId) {
        const existingPatient = patients.find(p => p.id === patientId);
        updatedPatients = patients.map(p => (p.id === patientId ? { ...data, id: p.id, analyses: existingPatient?.analyses || [] } : p));
    } else {
        const newPatient = { ...data, id: new Date().toISOString(), analyses: [] };
        updatedPatients = [...patients, newPatient];
    }
    
    savePatientsToLocalStorage(updatedPatients);
    
    toast({
      title: t('patientHistory.saveSuccessTitle'),
      description: t('patientHistory.saveSuccessDescription'),
    });

    router.push('/patient-history');
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t('patientHistory.confirmDelete'))) {
        const updatedPatients = patients.filter(p => p.id !== id);
        savePatientsToLocalStorage(updatedPatients);
        toast({
            title: t('patientHistory.deleteSuccessTitle'),
        });
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );


  if (!isMounted) {
    // Show a loading state until the component is mounted and data is loaded
    return (
      <div className="flex justify-center items-center p-8">
        <p>Loading Patient History...</p>
      </div>
    );
  }

  if (showForm) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">{action === 'edit' ? t('patientHistory.editTitle') : t('patientHistory.addTitle')}</CardTitle>
          <CardDescription>{t('patientHistory.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="fullName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('patientHistory.form.fullName')}</FormLabel>
                    <FormControl><Input placeholder={t('patientHistory.form.fullNamePlaceholder')} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>
                 <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('patientHistory.form.email')}</FormLabel>
                    <FormControl><Input type="email" placeholder={t('patientHistory.form.emailPlaceholder')} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>
                <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('patientHistory.form.dateOfBirth')}</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>
              </div>
              <FormField control={form.control} name="allergies" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('patientHistory.form.allergies')}</FormLabel>
                  <FormControl><Textarea placeholder={t('patientHistory.form.allergiesPlaceholder')} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}/>
              <FormField control={form.control} name="medications" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('patientHistory.form.medications')}</FormLabel>
                  <FormControl><Textarea placeholder={t('patientHistory.form.medicationsPlaceholder')} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}/>
              <FormField control={form.control} name="chronicConditions" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('patientHistory.form.chronicConditions')}</FormLabel>
                  <FormControl><Textarea placeholder={t('patientHistory.form.chronicConditionsPlaceholder')} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}/>
              <FormField control={form.control} name="previousSurgeries" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('patientHistory.form.previousSurgeries')}</FormLabel>
                  <FormControl><Textarea placeholder={t('patientHistory.form.previousSurgeriesPlaceholder')} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}/>
              <div className="flex gap-4">
                  <Button type="button" variant="outline" onClick={() => router.push('/patient-history')}>{t('patientHistory.form.cancelButton')}</Button>
                  <Button type="submit" className="flex-grow">{t('patientHistory.form.saveButton')}</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-6xl mx-auto">
        <CardHeader>
            <div className="flex justify-between items-center mb-4">
                <div>
                    <CardTitle className="font-headline text-3xl">{t('patientHistory.title')}</CardTitle>
                    <CardDescription>{t('patientHistory.listDescription')}</CardDescription>
                </div>
                <Button onClick={() => router.push('/patient-history?action=add')}>
                    <PlusCircle className="mr-2 h-4 w-4" /> {t('patientHistory.addPatientButton')}
                </Button>
            </div>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder={t('patientHistory.searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10"
                />
            </div>
        </CardHeader>
        <CardContent>
          <TooltipProvider>
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('patientHistory.table.fullName')}</TableHead>
                            <TableHead>{t('patientHistory.table.email')}</TableHead>
                            <TableHead>{t('patientHistory.table.dateOfBirth')}</TableHead>
                            <TableHead>{t('patientHistory.table.analysesCount')}</TableHead>
                            <TableHead className="text-right">{t('patientHistory.table.actions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredPatients.length > 0 ? (
                            filteredPatients.map((patient) => (
                              <React.Fragment key={patient.id}>
                                <TableRow>
                                    <TableCell className="font-medium">{patient.fullName}</TableCell>
                                    <TableCell>{patient.email || '-'}</TableCell>
                                    <TableCell>{patient.dateOfBirth || '-'}</TableCell>
                                    <TableCell>{patient.analyses?.length || 0}</TableCell>
                                    <TableCell className="text-right">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="ghost" size="icon" onClick={() => router.push(`/patient-history?action=edit&id=${patient.id}`)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{t('patientHistory.table.editAction')}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(patient.id!)}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{t('patientHistory.table.deleteAction')}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                                {patient.analyses && patient.analyses.length > 0 && (
                                  <TableRow>
                                      <TableCell colSpan={6}>
                                          <Accordion type="single" collapsible className="w-full">
                                              <AccordionItem value={`history-${patient.id}`}>
                                                  <AccordionTrigger>{t('patientHistory.analysisHistory.title')}</AccordionTrigger>
                                                  <AccordionContent>
                                                      <div className="space-y-4 p-4 bg-muted/20">
                                                          {patient.analyses.map((record: AnalysisRecord, index) => (
                                                              <Card key={index} className="bg-card">
                                                                  <CardHeader>
                                                                      <CardTitle className="text-lg">{t('patientHistory.analysisHistory.date')}: {new Date(record.analysisDate).toLocaleString()}</CardTitle>
                                                                      <CardDescription>{t('patientHistory.analysisHistory.symptoms')}: {record.symptoms}</CardDescription>
                                                                  </CardHeader>
                                                                  <CardContent className="space-y-4">
                                                                      <div>
                                                                          <h4 className="font-bold flex items-center gap-2 mb-2"><Stethoscope className="h-5 w-5 text-primary" /> {t('analysisResults.summaryTitle')}</h4>
                                                                          <p className="text-sm">{record.analysis.summary}</p>
                                                                      </div>
                                                                      <div>
                                                                          <h4 className="font-bold flex items-center gap-2 mb-2"><LifeBuoy className="h-5 w-5 text-primary" /> {t('firstAid.title')}</h4>
                                                                           <ul className="space-y-2 list-decimal list-outside ml-5 text-sm">
                                                                            {record.advice.advice.split('\n').map((item: string, i: number) => item.trim().length > 0 && <li key={i} className="pl-2">{item.replace(/^\d+\.\s*/, '')}</li>)}
                                                                          </ul>
                                                                      </div>
                                                                  </CardContent>
                                                              </Card>
                                                          ))}
                                                      </div>
                                                  </AccordionContent>
                                              </AccordionItem>
                                          </Accordion>
                                      </TableCell>
                                  </TableRow>
                                )}
                              </React.Fragment>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24">{t('patientHistory.noRecords')}</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
          </TooltipProvider>
        </CardContent>
    </Card>
  );
}


export default function PatientHistoryPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Header />
            <main className="flex-1 container mx-auto p-4 sm:p-6 lg:p-8">
                <Suspense fallback={<div>Loading...</div>}>
                    <PatientHistoryContent />
                </Suspense>
            </main>
        </div>
    );
}
