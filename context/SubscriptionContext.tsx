/**
 * Subscription Context
 * 
 * Manages user subscription plans, usage limits, and trial status.
 * Implements Freemium model with Pro upgrade.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { isAdminUser } from '../services/supabase';

// ============================================================================
// TYPES
// ============================================================================

export type PlanType = 'free' | 'pro' | 'trial';

export interface PlanLimits {
    // Transações
    monthlyImportedTransactions: number;      // Importadas via CSV/OFX/PDF
    monthlyOcrScans: number;                  // Escaneamentos de comprovantes

    // Features
    maxGoals: number;                         // Número de metas
    maxBankAccounts: number;                  // Contas bancárias

    // AI
    monthlyAiConsultations: number;           // Consultas ao consultor IA
    aiCategorization: boolean;                // Categorização automática

    // Reports
    historicalReports: boolean;               // Relatórios históricos (anos anteriores)
    exportData: boolean;                      // Exportar dados

    // Other
    multiCurrency: boolean;                   // Suporte a múltiplas moedas
    receiptStorage: boolean;                  // Armazenar fotos de comprovantes
    prioritySupport: boolean;                 // Suporte prioritário
}

export interface UsageStats {
    importedTransactionsThisMonth: number;
    ocrScansThisMonth: number;
    aiConsultationsThisMonth: number;
    currentGoals: number;
    lastResetDate: string; // ISO date
}

export interface SubscriptionState {
    plan: PlanType;
    limits: PlanLimits;
    usage: UsageStats;
    trialEndsAt: Date | null;
    isTrialExpired: boolean;
    daysLeftInTrial: number;
    isAdmin: boolean;
}

export interface SubscriptionContextType extends SubscriptionState {
    // Check functions
    canImportTransactions: () => boolean;
    canScanReceipt: () => boolean;
    canCreateGoal: () => boolean;
    canUseAiConsultant: () => boolean;
    canUseAiCategorization: () => boolean;
    canAccessHistoricalReports: () => boolean;
    canExportData: () => boolean;

    // Usage tracking
    recordImport: (count: number) => void;
    recordOcrScan: () => void;
    recordAiConsultation: () => void;

    // Plan management
    upgradeToPro: () => void;
    startTrial: () => void;
    isPro: boolean;
    isFree: boolean;
    isTrial: boolean;

    // UI Helpers
    getRemainingImports: () => number;
    getRemainingScans: () => number;
    getRemainingAiConsultations: () => number;
    getUsagePercentage: (feature: 'imports' | 'scans' | 'ai') => number;
}

// ============================================================================
// PLAN CONFIGURATIONS
// ============================================================================

const FREE_LIMITS: PlanLimits = {
    monthlyImportedTransactions: 50,
    monthlyOcrScans: 10,
    maxGoals: 3,
    maxBankAccounts: 1,
    monthlyAiConsultations: 15,
    aiCategorization: false,
    historicalReports: false,
    exportData: false,
    multiCurrency: false,
    receiptStorage: false,
    prioritySupport: false,
};

const PRO_LIMITS: PlanLimits = {
    monthlyImportedTransactions: Infinity,
    monthlyOcrScans: Infinity,
    maxGoals: Infinity,
    maxBankAccounts: Infinity,
    monthlyAiConsultations: Infinity,
    aiCategorization: true,
    historicalReports: true,
    exportData: true,
    multiCurrency: true,
    receiptStorage: true,
    prioritySupport: true,
};

const TRIAL_DAYS = 14;

// ============================================================================
// CONTEXT
// ============================================================================

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
    const context = useContext(SubscriptionContext);
    if (context === undefined) {
        throw new Error('useSubscription must be used within a SubscriptionProvider');
    }
    return context;
};

// ============================================================================
// STORAGE KEYS
// ============================================================================

const STORAGE_KEYS = {
    PLAN: 'reynar_plan',
    TRIAL_START: 'reynar_trial_start',
    USAGE: 'reynar_usage',
};

// ============================================================================
// PROVIDER
// ============================================================================

interface SubscriptionProviderProps {
    children: ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
    const { user, isAuthenticated } = useAuth();

    // Check if current user is admin
    const isAdmin = isAdminUser(user?.email);

    // State
    const [plan, setPlan] = useState<PlanType>('free');
    const [trialStartDate, setTrialStartDate] = useState<Date | null>(null);
    const [usage, setUsage] = useState<UsageStats>({
        importedTransactionsThisMonth: 0,
        ocrScansThisMonth: 0,
        aiConsultationsThisMonth: 0,
        currentGoals: 0,
        lastResetDate: new Date().toISOString().slice(0, 7), // YYYY-MM
    });

    // Auto-set Pro for admin users
    useEffect(() => {
        if (isAdmin && plan !== 'pro') {
            setPlan('pro');
            localStorage.setItem(STORAGE_KEYS.PLAN, 'pro');
            console.log('🔑 Admin user detected - Pro access granted');
        }
    }, [isAdmin, plan]);

    // Load subscription data from localStorage
    useEffect(() => {
        const savedPlan = localStorage.getItem(STORAGE_KEYS.PLAN) as PlanType | null;
        const savedTrialStart = localStorage.getItem(STORAGE_KEYS.TRIAL_START);
        const savedUsage = localStorage.getItem(STORAGE_KEYS.USAGE);

        if (savedPlan) {
            setPlan(savedPlan);
        }

        if (savedTrialStart) {
            setTrialStartDate(new Date(savedTrialStart));
        }

        if (savedUsage) {
            const parsedUsage = JSON.parse(savedUsage) as UsageStats;

            // Check if we need to reset monthly counters
            const currentMonth = new Date().toISOString().slice(0, 7);
            if (parsedUsage.lastResetDate !== currentMonth) {
                // New month - reset counters
                setUsage({
                    ...parsedUsage,
                    importedTransactionsThisMonth: 0,
                    ocrScansThisMonth: 0,
                    aiConsultationsThisMonth: 0,
                    lastResetDate: currentMonth,
                });
            } else {
                setUsage(parsedUsage);
            }
        }
    }, []);

    // Save usage to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.USAGE, JSON.stringify(usage));
    }, [usage]);

    // Calculate trial status
    const calculateTrialStatus = () => {
        if (plan !== 'trial' || !trialStartDate) {
            return { isExpired: false, daysLeft: 0 };
        }

        const now = new Date();
        const trialEnd = new Date(trialStartDate);
        trialEnd.setDate(trialEnd.getDate() + TRIAL_DAYS);

        const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        return {
            isExpired: daysLeft <= 0,
            daysLeft: Math.max(0, daysLeft),
        };
    };

    const trialStatus = calculateTrialStatus();

    // Get current limits based on plan
    const getCurrentLimits = (): PlanLimits => {
        if (plan === 'pro') return PRO_LIMITS;
        if (plan === 'trial' && !trialStatus.isExpired) return PRO_LIMITS;
        return FREE_LIMITS;
    };

    const limits = getCurrentLimits();

    // ========================================================================
    // CHECK FUNCTIONS
    // ========================================================================

    const canImportTransactions = () => {
        if (plan === 'pro' || (plan === 'trial' && !trialStatus.isExpired)) return true;
        return usage.importedTransactionsThisMonth < limits.monthlyImportedTransactions;
    };

    const canScanReceipt = () => {
        if (plan === 'pro' || (plan === 'trial' && !trialStatus.isExpired)) return true;
        return usage.ocrScansThisMonth < limits.monthlyOcrScans;
    };

    const canCreateGoal = () => {
        if (plan === 'pro' || (plan === 'trial' && !trialStatus.isExpired)) return true;
        return usage.currentGoals < limits.maxGoals;
    };

    const canUseAiConsultant = () => {
        if (plan === 'pro' || (plan === 'trial' && !trialStatus.isExpired)) return true;
        return usage.aiConsultationsThisMonth < limits.monthlyAiConsultations;
    };

    const canUseAiCategorization = () => {
        return limits.aiCategorization;
    };

    const canAccessHistoricalReports = () => {
        return limits.historicalReports;
    };

    const canExportData = () => {
        return limits.exportData;
    };

    // ========================================================================
    // USAGE TRACKING
    // ========================================================================

    const recordImport = (count: number) => {
        setUsage(prev => ({
            ...prev,
            importedTransactionsThisMonth: prev.importedTransactionsThisMonth + count,
        }));
    };

    const recordOcrScan = () => {
        setUsage(prev => ({
            ...prev,
            ocrScansThisMonth: prev.ocrScansThisMonth + 1,
        }));
    };

    const recordAiConsultation = () => {
        setUsage(prev => ({
            ...prev,
            aiConsultationsThisMonth: prev.aiConsultationsThisMonth + 1,
        }));
    };

    // ========================================================================
    // PLAN MANAGEMENT
    // ========================================================================

    const upgradeToPro = () => {
        setPlan('pro');
        localStorage.setItem(STORAGE_KEYS.PLAN, 'pro');
        // In production, this would be called after successful Stripe payment
    };

    const startTrial = () => {
        const now = new Date();
        setPlan('trial');
        setTrialStartDate(now);
        localStorage.setItem(STORAGE_KEYS.PLAN, 'trial');
        localStorage.setItem(STORAGE_KEYS.TRIAL_START, now.toISOString());
    };

    // ========================================================================
    // UI HELPERS
    // ========================================================================

    const getRemainingImports = () => {
        if (plan === 'pro' || (plan === 'trial' && !trialStatus.isExpired)) return Infinity;
        return Math.max(0, limits.monthlyImportedTransactions - usage.importedTransactionsThisMonth);
    };

    const getRemainingScans = () => {
        if (plan === 'pro' || (plan === 'trial' && !trialStatus.isExpired)) return Infinity;
        return Math.max(0, limits.monthlyOcrScans - usage.ocrScansThisMonth);
    };

    const getRemainingAiConsultations = () => {
        if (plan === 'pro' || (plan === 'trial' && !trialStatus.isExpired)) return Infinity;
        return Math.max(0, limits.monthlyAiConsultations - usage.aiConsultationsThisMonth);
    };

    const getUsagePercentage = (feature: 'imports' | 'scans' | 'ai') => {
        if (plan === 'pro' || (plan === 'trial' && !trialStatus.isExpired)) return 0;

        switch (feature) {
            case 'imports':
                return (usage.importedTransactionsThisMonth / limits.monthlyImportedTransactions) * 100;
            case 'scans':
                return (usage.ocrScansThisMonth / limits.monthlyOcrScans) * 100;
            case 'ai':
                return (usage.aiConsultationsThisMonth / limits.monthlyAiConsultations) * 100;
            default:
                return 0;
        }
    };

    // ========================================================================
    // CONTEXT VALUE
    // ========================================================================

    const value: SubscriptionContextType = {
        plan,
        limits,
        usage,
        trialEndsAt: trialStartDate ? new Date(trialStartDate.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000) : null,
        isTrialExpired: trialStatus.isExpired,
        daysLeftInTrial: trialStatus.daysLeft,
        isAdmin,

        // Check functions
        canImportTransactions,
        canScanReceipt,
        canCreateGoal,
        canUseAiConsultant,
        canUseAiCategorization,
        canAccessHistoricalReports,
        canExportData,

        // Usage tracking
        recordImport,
        recordOcrScan,
        recordAiConsultation,

        // Plan management
        upgradeToPro,
        startTrial,
        isPro: plan === 'pro',
        isFree: plan === 'free',
        isTrial: plan === 'trial' && !trialStatus.isExpired,

        // UI Helpers
        getRemainingImports,
        getRemainingScans,
        getRemainingAiConsultations,
        getUsagePercentage,
    };

    return (
        <SubscriptionContext.Provider value={value}>
            {children}
        </SubscriptionContext.Provider>
    );
};
