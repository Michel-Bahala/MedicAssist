'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Header } from '@/components/app/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/context/language-context';

const formSchema = z.object({
  fullName: z.string().min(1, { message: 'Full name is required.' }),
  dateOfBirth: z.string().min(1, { message: 'Date of birth is required.' }),
  allergies: z.string().optional(),
  medications: z.string().optional(),
  chronicConditions: z.string().optional(),
  previousSurgeries: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function PatientHistoryPage() {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      dateOfBirth: '',
      allergies: '',
      medications: '',
      chronicConditions: '',
      previousSurgeries: '',
    },
  });

  useEffect(() => {
    setIsMounted(true);
    const savedData = localStorage.getItem('patientHistory');
    if (savedData) {
      form.reset(JSON.parse(savedData));
    }
  }, [form]);

  const onSubmit = (data: FormData) => {
    localStorage.setItem('patientHistory', JSON.stringify(data));
    toast({
      title: t('patientHistory.saveSuccessTitle'),
      description: t('patientHistory.saveSuccessDescription'),
    });
  };

  if (!isMounted) {
    return null; // or a loading spinner
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container mx-auto p-4 sm:p-6 lg:p-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="font-headline text-3xl">{t('patientHistory.title')}</CardTitle>
            <CardDescription>{t('patientHistory.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('patientHistory.form.fullName')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('patientHistory.form.fullNamePlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('patientHistory.form.dateOfBirth')}</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="allergies"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('patientHistory.form.allergies')}</FormLabel>
                      <FormControl>
                        <Textarea placeholder={t('patientHistory.form.allergiesPlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="medications"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('patientHistory.form.medications')}</FormLabel>
                      <FormControl>
                        <Textarea placeholder={t('patientHistory.form.medicationsPlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="chronicConditions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('patientHistory.form.chronicConditions')}</FormLabel>
                      <FormControl>
                        <Textarea placeholder={t('patientHistory.form.chronicConditionsPlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="previousSurgeries"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('patientHistory.form.previousSurgeries')}</FormLabel>
                      <FormControl>
                        <Textarea placeholder={t('patientHistory.form.previousSurgeriesPlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">{t('patientHistory.form.saveButton')}</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
