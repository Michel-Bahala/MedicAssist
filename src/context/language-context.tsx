// @/context/language-context.tsx
"use client";

import React, { createContext, useState, useContext, ReactNode } from 'react';
import en from '@/locales/en.json';
import fr from '@/locales/fr.json';

type Language = 'en' | 'fr';

const translations = { en, fr };

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, options?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function getNestedValue(obj: any, path: string): string {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string, options?: Record<string, string | number>): string => {
    let translation = getNestedValue(translations[language], key) || getNestedValue(translations.en, key) || key;

    if (options) {
      Object.keys(options).forEach((optionKey) => {
        translation = translation.replace(`{{${optionKey}}}`, String(options[optionKey]));
      });
    }

    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
