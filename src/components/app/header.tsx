
"use client";

import type { FC } from 'react';
import Link from 'next/link';
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
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14c3.866 0 7 3.134 7 7H5c0-3.866 3.134-7 7-7zm0-2a5 5 0 100-10 5 5 0 000 10z" />
  </svg>
);


export function Header() {
  const { setLanguage, t } = useTranslation();
  const router = useRouter();

  return (
    <header className="py-4 px-4 sm:px-6 lg:px-8 bg-card shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <StethoscopeIcon className="h-8 w-8 text-primary" />
            <h1 className="font-headline text-3xl md:text-4xl font-bold text-primary">
              {t('header.title')}
            </h1>
          </Link>
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
