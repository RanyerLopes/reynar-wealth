import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getUserProfile, upsertUserProfile } from '../services/databaseService';

// Import translation files directly
import ptBR from '../i18n/locales/pt-BR.json';
import enUS from '../i18n/locales/en-US.json';
import esES from '../i18n/locales/es-ES.json';

// Language configurations
export const languages = {
    'pt-BR': {
        name: 'Português (Brasil)',
        flag: '🇧🇷',
        dateFormat: 'DD/MM/YYYY',
        translations: ptBR
    },
    'pt-PT': {
        name: 'Português (Portugal)',
        flag: '🇵🇹',
        dateFormat: 'DD/MM/YYYY',
        translations: ptBR // Same translations, different locale
    },
    'en-US': {
        name: 'English',
        flag: '🇺🇸',
        dateFormat: 'MM/DD/YYYY',
        translations: enUS
    },
    'es-ES': {
        name: 'Español',
        flag: '🇪🇸',
        dateFormat: 'DD/MM/YYYY',
        translations: esES
    }
};

// Currency configurations - independent from language
export const currencies = {
    'BRL': { symbol: 'R$', code: 'BRL', locale: 'pt-BR', name: 'Real Brasileiro', flag: '🇧🇷' },
    'USD': { symbol: '$', code: 'USD', locale: 'en-US', name: 'US Dollar', flag: '🇺🇸' },
    'EUR': { symbol: '€', code: 'EUR', locale: 'de-DE', name: 'Euro', flag: '🇪🇺' },
    'GBP': { symbol: '£', code: 'GBP', locale: 'en-GB', name: 'British Pound', flag: '🇬🇧' }
};

export type SupportedLanguage = keyof typeof languages;
export type SupportedCurrency = keyof typeof currencies;

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
    currency: SupportedCurrency;
    setCurrency: (curr: SupportedCurrency) => void;
    t: (key: string, options?: Record<string, any>) => string;
    formatCurrency: (value: number) => string;
    formatDate: (date: Date | string) => string;
    languages: typeof languages;
    currencies: typeof currencies;
    currentConfig: typeof languages['pt-BR'];
    currentCurrency: typeof currencies['BRL'];
    // Sync functions for database
    syncPreferencesFromDb: (userId: string) => Promise<void>;
    syncPreferencesToDb: (userId: string) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

// Detect browser language
function detectLanguage(): SupportedLanguage {
    const stored = localStorage.getItem('reynar-language');
    if (stored && languages[stored as SupportedLanguage]) {
        return stored as SupportedLanguage;
    }

    const browserLang = navigator.language;
    if (browserLang === 'pt-PT') return 'pt-PT';
    if (browserLang.startsWith('pt')) return 'pt-BR';
    if (browserLang.startsWith('es')) return 'es-ES';
    if (browserLang.startsWith('en')) return 'en-US';

    return 'pt-BR';
}

// Detect default currency based on language
function detectCurrency(): SupportedCurrency {
    const stored = localStorage.getItem('reynar-currency');
    if (stored && currencies[stored as SupportedCurrency]) {
        return stored as SupportedCurrency;
    }
    return 'BRL'; // Default to BRL
}

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<SupportedLanguage>(detectLanguage);
    const [currency, setCurrencyState] = useState<SupportedCurrency>(detectCurrency);

    useEffect(() => {
        document.documentElement.lang = language;
    }, [language]);

    const setLanguage = useCallback((lang: SupportedLanguage) => {
        setLanguageState(lang);
        localStorage.setItem('reynar-language', lang);
        document.documentElement.lang = lang;
    }, []);

    const setCurrency = useCallback((curr: SupportedCurrency) => {
        setCurrencyState(curr);
        localStorage.setItem('reynar-currency', curr);
    }, []);

    // Sync preferences from database (call on login)
    const syncPreferencesFromDb = useCallback(async (userId: string) => {
        try {
            const profile = await getUserProfile(userId);
            if (profile) {
                if (profile.language && languages[profile.language as SupportedLanguage]) {
                    setLanguageState(profile.language as SupportedLanguage);
                    localStorage.setItem('reynar-language', profile.language);
                    document.documentElement.lang = profile.language;
                }
                if (profile.currency && currencies[profile.currency as SupportedCurrency]) {
                    setCurrencyState(profile.currency as SupportedCurrency);
                    localStorage.setItem('reynar-currency', profile.currency);
                }
            }
        } catch (error) {
            console.error('Error syncing preferences from DB:', error);
        }
    }, []);

    // Sync preferences to database (call on preference change or profile save)
    const syncPreferencesToDb = useCallback(async (userId: string) => {
        try {
            await upsertUserProfile(userId, {
                language,
                currency
            });
        } catch (error) {
            console.error('Error syncing preferences to DB:', error);
        }
    }, [language, currency]);

    // Translation function
    const t = useCallback((key: string, options?: Record<string, any>): string => {
        const translations = languages[language].translations;
        const text = getNestedValue(translations, key);
        return interpolate(text, options);
    }, [language]);

    // Format currency - uses independent currency setting
    const formatCurrency = useCallback((value: number): string => {
        const config = currencies[currency];
        return new Intl.NumberFormat(config.locale, {
            style: 'currency',
            currency: config.code,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    }, [currency]);

    // Format date - uses language locale
    const formatDate = useCallback((date: Date | string): string => {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        // Use language for date locale
        const locale = language === 'pt-PT' ? 'pt-PT' : language;
        return new Intl.DateTimeFormat(locale, {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).format(dateObj);
    }, [language]);

    const value: LanguageContextType = {
        language,
        setLanguage,
        currency,
        setCurrency,
        t,
        formatCurrency,
        formatDate,
        languages,
        currencies,
        currentConfig: languages[language],
        currentCurrency: currencies[currency],
        syncPreferencesFromDb,
        syncPreferencesToDb
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
        const defaultCurrency = 'BRL';
        return {
            language: defaultLang as SupportedLanguage,
            setLanguage: () => { },
            currency: defaultCurrency as SupportedCurrency,
            setCurrency: () => { },
            t: (key: string) => key,
            formatCurrency: (value: number) => `R$ ${value.toFixed(2)}`,
            formatDate: (date: Date | string) => new Date(date).toLocaleDateString('pt-BR'),
            languages,
            currencies,
            currentConfig: languages[defaultLang],
            currentCurrency: currencies[defaultCurrency],
            syncPreferencesFromDb: async () => { },
            syncPreferencesToDb: async () => { }
        };
    }
    return context;
}

// Export types for Profile page
export type { SupportedLanguage as SupportedLanguageType, SupportedCurrency as SupportedCurrencyType };
