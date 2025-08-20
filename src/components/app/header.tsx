
"use client";

import type { FC } from 'react';
import { useRouter } from 'next/navigation';
import { EmergencyButton } from '@/components/app/emergency-button';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Languages, UserPlus, Database } from 'lucide-react';
import { useTranslation } from '@/context/language-context';

const StethoscopeIcon: FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 14a2 2 0 1 0 4 0c0-4.42-3.58-8-8-8" />
    <path d="M12 14a2 2 0 1 0 4 0c0-4.42-3.58-8-8-8" />
    <path d="M22 14a8 8 0 0 0-8-8" />
    <path d="M14 10h-4v4h4v-4Z" />
    <path d="M12 14v6" />
    <circle cx="12" cy="20" r="2" />
  </svg>
);


export function Header() {
  const { setLanguage, t } = useTranslation();
  const router = useRouter();

  return (
    <header className="py-4 px-4 sm:px-6 lg:px-8 bg-card shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/')} className="flex items-center gap-3">
            <StethoscopeIcon className="h-8 w-8 text-primary" />
            <h1 className="font-headline text-3xl md:text-4xl font-bold text-primary">
              {t('header.title')}
            </h1>
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" title={t('header.addPatientHistory')} onClick={() => router.push('/patient-history?action=add')}>
            <UserPlus className="h-5 w-5" />
            <span className="sr-only">{t('header.addPatientHistory')}</span>
          </Button>
          <Button variant="ghost" size="icon" title={t('header.viewPatientHistory')} onClick={() => router.push('/patient-history')}>
            <Database className="h-5 w-5" />
            <span className="sr-only">{t('header.viewPatientHistory')}</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Languages className="h-5 w-5" />
                <span className="sr-only">{t('header.chooseLanguage')}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setLanguage('en')}>
                {t('languages.en')}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setLanguage('fr')}>
                {t('languages.fr')}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setLanguage('es')}>
                {t('languages.es')}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setLanguage('de')}>
                {t('languages.de')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <EmergencyButton />
        </div>
      </div>
    </header>
  );
}
