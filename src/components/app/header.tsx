import type { FC } from 'react';
import { EmergencyButton } from '@/components/app/emergency-button';

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
    <path d="M4 14a2 2 0 1 0 4 0V6a2 2 0 1 0-4 0v8Z" />
    <path d="M6 4V2" />
    <path d="M6 20v-4" />
    <path d="M12 4h4a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-4" />
    <path d="M14 10V8" />
    <path d="M14 12v8a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-4a2 2 0 1 0-4 0Z" />
  </svg>
);

export function Header() {
  return (
    <header className="py-4 px-4 sm:px-6 lg:px-8 bg-card shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <StethoscopeIcon className="h-8 w-8 text-primary" />
          <h1 className="font-headline text-3xl md:text-4xl font-bold text-primary">
            MedicAssist
          </h1>
        </div>
        <EmergencyButton />
      </div>
    </header>
  );
}
