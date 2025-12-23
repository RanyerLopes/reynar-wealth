import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

// Import translation files directly
import ptBR from '../i18n/locales/pt-BR.json';
import enUS from '../i18n/locales/en-US.json';
import esES from '../i18n/locales/es-ES.json';

// Language configurations
export const languages = {
    'pt-BR': {
        name: 'Português',
        flag: '🇧🇷',
        currency: { symbol: 'R$', code: 'BRL', locale: 'pt-BR' },
        dateFormat: 'DD/MM/YYYY',
        translations: ptBR
    },
    'en-US': {
        name: 'English',
        flag: '🇺🇸',
        currency: { symbol: '$', code: 'USD', locale: 'en-US' },
        dateFormat: 'MM/DD/YYYY',
        translations: enUS
    },
    'es-ES': {
        name: 'Español',
        flag: '🇪🇸',
        currency: { symbol: '€', code: 'EUR', locale: 'es-ES' },
        dateFormat: 'DD/MM/YYYY',
        translations: esES
    }
};

export type SupportedLanguage = keyof typeof languages;

// Get nested value from object by dot-separated path
function getNestedValue(obj: any, path: string): string {
    return path.split('.').reduce((current, key) => current?.[key], obj) || path;
}

// Replace {{variable}} placeholders
function interpolate(text: string, options?: Record<string, any>): string {
    if (!options) return text;
    return text.replace(/\{\{(\w+)\}\}/g, (_, key) => String(options[key] ?? `{{${key}}}`));
}

interface LanguageContextType {
    language: SupportedLanguage;
    setLanguage: (lang: SupportedLanguage) => void;
    t: (key: string, options?: Record<string, any>) => string;
    formatCurrency: (value: number) => string;
    formatDate: (date: Date | string) => string;
    languages: typeof languages;
    currentConfig: typeof languages['pt-BR'];
}

const LanguageContext = createContext<LanguageContextType | null>(null);

// Detect browser language
function detectLanguage(): SupportedLanguage {
    const stored = localStorage.getItem('reynar-language');
    if (stored && languages[stored as SupportedLanguage]) {
        return stored as SupportedLanguage;
    }

    const browserLang = navigator.language;
    if (browserLang.startsWith('pt')) return 'pt-BR';
    if (browserLang.startsWith('es')) return 'es-ES';
    if (browserLang.startsWith('en')) return 'en-US';

    return 'pt-BR';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<SupportedLanguage>(detectLanguage);

    useEffect(() => {
        document.documentElement.lang = language;
    }, [language]);

    const setLanguage = useCallback((lang: SupportedLanguage) => {
        setLanguageState(lang);
        localStorage.setItem('reynar-language', lang);
        document.documentElement.lang = lang;
    }, []);

    // Translation function
    const t = useCallback((key: string, options?: Record<string, any>): string => {
        const translations = languages[language].translations;
        const text = getNestedValue(translations, key);
        return interpolate(text, options);
    }, [language]);

    // Format currency
    const formatCurrency = useCallback((value: number): string => {
        const config = languages[language];
        return new Intl.NumberFormat(config.currency.locale, {
            style: 'currency',
            currency: config.currency.code,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    }, [language]);

    // Format date
    const formatDate = useCallback((date: Date | string): string => {
        const config = languages[language];
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return new Intl.DateTimeFormat(config.currency.locale, {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).format(dateObj);
    }, [language]);

    const value: LanguageContextType = {
        language,
        setLanguage,
        t,
        formatCurrency,
        formatDate,
        languages,
        currentConfig: languages[language]
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        // Return default values if used outside provider
        const defaultLang = 'pt-BR';
        return {
            language: defaultLang as SupportedLanguage,
            setLanguage: () => { },
            t: (key: string) => key,
            formatCurrency: (value: number) => `R$ ${value.toFixed(2)}`,
            formatDate: (date: Date | string) => new Date(date).toLocaleDateString('pt-BR'),
            languages,
            currentConfig: languages[defaultLang]
        };
    }
    return context;
}

// Export types for Profile page
export type { SupportedLanguage as SupportedLanguageType };
