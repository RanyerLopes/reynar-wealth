import i18n from 'i18next';

// Import translation files
import ptBR from './locales/pt-BR.json';
import enUS from './locales/en-US.json';
import esES from './locales/es-ES.json';

// Language configurations with currency info
export const languages = {
    'pt-BR': {
        name: 'Português',
        flag: '🇧🇷',
        currency: { symbol: 'R$', code: 'BRL', locale: 'pt-BR' },
        dateFormat: 'DD/MM/YYYY'
    },
    'en-US': {
        name: 'English',
        flag: '🇺🇸',
        currency: { symbol: '$', code: 'USD', locale: 'en-US' },
        dateFormat: 'MM/DD/YYYY'
    },
    'es-ES': {
        name: 'Español',
        flag: '🇪🇸',
        currency: { symbol: '€', code: 'EUR', locale: 'es-ES' },
        dateFormat: 'DD/MM/YYYY'
    }
};

export type SupportedLanguage = keyof typeof languages;

// Detect browser language
function detectLanguage(): SupportedLanguage {
    const stored = localStorage.getItem('reynar-language');
    if (stored && languages[stored as SupportedLanguage]) {
        return stored as SupportedLanguage;
    }

    const browserLang = navigator.language;
    if (languages[browserLang as SupportedLanguage]) {
        return browserLang as SupportedLanguage;
    }

    if (browserLang.startsWith('pt')) return 'pt-BR';
    if (browserLang.startsWith('es')) return 'es-ES';
    if (browserLang.startsWith('en')) return 'en-US';

    return 'pt-BR';
}

// Initialize i18next (without React integration)
i18n.init({
    resources: {
        'pt-BR': { translation: ptBR },
        'en-US': { translation: enUS },
        'es-ES': { translation: esES }
    },
    lng: detectLanguage(),
    fallbackLng: 'pt-BR',
    supportedLngs: ['pt-BR', 'en-US', 'es-ES'],
    interpolation: {
        escapeValue: false
    }
});

// Helper function to format currency based on current language
export function formatCurrency(value: number, languageCode?: string): string {
    const lang = languageCode || i18n.language;
    const config = languages[lang as SupportedLanguage] || languages['pt-BR'];

    return new Intl.NumberFormat(config.currency.locale, {
        style: 'currency',
        currency: config.currency.code,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
}

// Helper function to format date based on current language
export function formatDate(date: Date | string, languageCode?: string): string {
    const lang = languageCode || i18n.language;
    const config = languages[lang as SupportedLanguage] || languages['pt-BR'];

    const dateObj = typeof date === 'string' ? new Date(date) : date;

    return new Intl.DateTimeFormat(config.currency.locale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).format(dateObj);
}

// Helper to get current language config
export function getLanguageConfig(languageCode?: string) {
    const lang = languageCode || i18n.language;
    return languages[lang as SupportedLanguage] || languages['pt-BR'];
}

// Function to change language
export function changeLanguage(lang: SupportedLanguage) {
    i18n.changeLanguage(lang);
    localStorage.setItem('reynar-language', lang);
    document.documentElement.lang = lang;
}

// Translation function
export function t(key: string, options?: object): string {
    return i18n.t(key, options as any) as string;
}


export default i18n;
