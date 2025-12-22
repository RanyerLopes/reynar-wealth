import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Sparkles, FileUp, Target, Wallet, CheckCircle, RocketIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppRoutes } from '../types';
import { Button } from './UI';

const STORAGE_KEY = 'reynar_onboarding';

interface OnboardingState {
    completed: boolean;
    currentStep: number;
    skipped: boolean;
}

const STEPS = [
    {
        title: 'Bem-vindo ao Reynar Wealth! 👑',
        description: 'Seu novo parceiro para organizar suas finanças de forma inteligente e visual.',
        icon: Sparkles,
        color: 'from-primary to-indigo-600',
        action: null,
    },
    {
        title: 'Importe seu Extrato',
        description: 'Conecte seus dados bancários importando extratos em PDF, Excel ou OFX.',
        icon: FileUp,
        color: 'from-green-500 to-emerald-600',
        action: AppRoutes.TRANSACTIONS,
        actionLabel: 'Ir para Transações',
    },
    {
        title: 'Defina seu Orçamento',
        description: 'Estabeleça limites mensais por categoria para manter seus gastos sob controle.',
        icon: Wallet,
        color: 'from-orange-500 to-amber-600',
        action: AppRoutes.BUDGET,
        actionLabel: 'Criar Orçamento',
    },
    {
        title: 'Crie sua Primeira Meta',
        description: 'Defina objetivos financeiros e acompanhe seu progresso para conquistá-los.',
        icon: Target,
        color: 'from-blue-500 to-cyan-600',
        action: AppRoutes.GOALS,
        actionLabel: 'Criar Meta',
    },
    {
        title: 'Tudo Pronto! 🎉',
        description: 'Você está pronto para começar. Explore o app e tome controle das suas finanças!',
        icon: RocketIcon,
        color: 'from-purple-500 to-pink-600',
        action: null,
    },
];

interface OnboardingProps {
    onComplete: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    const step = STEPS[currentStep];
    const isLastStep = currentStep === STEPS.length - 1;
    const isFirstStep = currentStep === 0;

    const handleNext = () => {
        if (isLastStep) {
            completeOnboarding();
        } else {
            setIsAnimating(true);
            setTimeout(() => {
                setCurrentStep(prev => prev + 1);
                setIsAnimating(false);
            }, 200);
        }
    };

    const handlePrev = () => {
        if (!isFirstStep) {
            setIsAnimating(true);
            setTimeout(() => {
                setCurrentStep(prev => prev - 1);
                setIsAnimating(false);
            }, 200);
        }
    };

    const handleSkip = () => {
        const state: OnboardingState = {
            completed: false,
            currentStep: currentStep,
            skipped: true,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        onComplete();
    };

    const completeOnboarding = () => {
        const state: OnboardingState = {
            completed: true,
            currentStep: STEPS.length - 1,
            skipped: false,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        onComplete();
    };

    const handleAction = () => {
        if (step.action) {
            completeOnboarding();
            navigate(step.action);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-lg flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-surface border border-surfaceHighlight rounded-3xl max-w-md w-full overflow-hidden shadow-2xl">
                {/* Header with skip button */}
                <div className="flex justify-between items-center p-4 border-b border-surfaceHighlight">
                    <div className="flex gap-1">
                        {STEPS.map((_, idx) => (
                            <div
                                key={idx}
                                className={`h-1 w-8 rounded-full transition-all ${idx === currentStep
                                        ? 'bg-primary'
                                        : idx < currentStep
                                            ? 'bg-primary/50'
                                            : 'bg-surfaceHighlight'
                                    }`}
                            />
                        ))}
                    </div>
                    <button
                        onClick={handleSkip}
                        className="text-textMuted hover:text-white text-sm"
                    >
                        Pular
                    </button>
                </div>

                {/* Content */}
                <div className={`p-8 text-center transition-opacity duration-200 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                        <step.icon size={40} className="text-white" />
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-3">{step.title}</h2>
                    <p className="text-textMuted leading-relaxed mb-6">{step.description}</p>

                    {step.action && (
                        <button
                            onClick={handleAction}
                            className="text-primary hover:underline text-sm mb-4 flex items-center gap-1 mx-auto"
                        >
                            {step.actionLabel} <ChevronRight size={14} />
                        </button>
                    )}
                </div>

                {/* Navigation */}
                <div className="flex gap-3 p-4 border-t border-surfaceHighlight">
                    <Button
                        variant="secondary"
                        onClick={handlePrev}
                        disabled={isFirstStep}
                        className="!w-auto px-4"
                    >
                        <ChevronLeft size={18} />
                    </Button>
                    <Button onClick={handleNext} className="flex-1">
                        {isLastStep ? (
                            <>
                                <CheckCircle size={18} /> Começar a Usar
                            </>
                        ) : (
                            <>
                                Próximo <ChevronRight size={18} />
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};

// Hook to check if onboarding should be shown
export const useOnboarding = () => {
    const [showOnboarding, setShowOnboarding] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) {
            setShowOnboarding(true);
        } else {
            const state: OnboardingState = JSON.parse(saved);
            setShowOnboarding(!state.completed && !state.skipped);
        }
    }, []);

    const completeOnboarding = () => {
        setShowOnboarding(false);
    };

    const resetOnboarding = () => {
        localStorage.removeItem(STORAGE_KEY);
        setShowOnboarding(true);
    };

    return { showOnboarding, completeOnboarding, resetOnboarding };
};

export default Onboarding;
