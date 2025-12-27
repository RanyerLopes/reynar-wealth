import React, { useState, useEffect } from 'react';
import {
    X, ChevronRight, ChevronLeft, Sparkles, FileUp, Target, Wallet,
    CheckCircle, RocketIcon, PieChart, TrendingUp, Receipt, Bot,
    Lightbulb, Crown, Shield, Calendar, CreditCard, Camera
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppRoutes } from '../types';
import { Button } from './UI';

const STORAGE_KEY = 'reynar_onboarding';

interface OnboardingState {
    completed: boolean;
    currentStep: number;
    skipped: boolean;
}

// Tutorial steps with detailed explanations
const STEPS = [
    {
        title: 'Bem-vindo ao Reynar Wealth! 👑',
        subtitle: 'Seu assistente financeiro pessoal',
        description: 'O Reynar Wealth vai te ajudar a organizar suas finanças de forma simples e visual. Você vai poder controlar seus gastos, criar metas e muito mais!',
        tips: [
            'Acompanhe para onde vai seu dinheiro',
            'Crie metas e veja seu progresso',
            'Receba dicas personalizadas da nossa IA'
        ],
        icon: Sparkles,
        color: 'from-primary to-indigo-600',
        action: null,
    },
    {
        title: '📊 Dashboard: Sua Visão Geral',
        subtitle: 'Tudo num só lugar',
        description: 'O Dashboard é sua página inicial. Aqui você vê um resumo de tudo: saldo, gastos do mês, metas e muito mais. É como um "painel de controle" das suas finanças.',
        tips: [
            'Veja quanto gastou vs quanto ganhou',
            'Acompanhe suas metas principais',
            'Gráficos mostram para onde vai seu dinheiro'
        ],
        icon: PieChart,
        color: 'from-blue-500 to-cyan-600',
        action: AppRoutes.DASHBOARD,
        actionLabel: 'Ver Dashboard',
    },
    {
        title: '💳 Transações: Registre seus Gastos',
        subtitle: 'Anote tudo o que entra e sai',
        description: 'Na página de Transações você registra o que gastou ou recebeu. Pode adicionar manualmente ou importar automaticamente do seu banco!',
        tips: [
            'Toque no + para adicionar gasto ou receita',
            'Use a câmera para escanear comprovantes',
            'Importe extratos do banco (PDF, CSV, OFX)'
        ],
        icon: Receipt,
        color: 'from-green-500 to-emerald-600',
        action: AppRoutes.TRANSACTIONS,
        actionLabel: 'Ver Transações',
    },
    {
        title: '📷 Escaneie Comprovantes',
        subtitle: 'A câmera lê o valor pra você',
        description: 'Tirou foto de um cupom fiscal? O Reynar usa inteligência artificial para ler automaticamente o valor, nome da loja e categoria. Muito mais rápido!',
        tips: [
            'Aponte a câmera para o cupom',
            'A IA lê o valor automaticamente',
            'Também pode fazer upload de uma foto da galeria'
        ],
        icon: Camera,
        color: 'from-purple-500 to-violet-600',
        action: null,
    },
    {
        title: '💰 Orçamento: Controle seus Limites',
        subtitle: 'Defina quanto pode gastar',
        description: 'No Orçamento você define quanto quer gastar por categoria (alimentação, transporte, lazer...). O app avisa quando você está chegando no limite!',
        tips: [
            'Defina limites mensais por categoria',
            'Veja barras de progresso coloridas',
            'Vermelho = passou do limite!'
        ],
        icon: Wallet,
        color: 'from-orange-500 to-amber-600',
        action: AppRoutes.BUDGET,
        actionLabel: 'Ver Orçamento',
    },
    {
        title: '🎯 Metas: Realize seus Sonhos',
        subtitle: 'Poupe para objetivos específicos',
        description: 'Quer comprar algo especial? Viajar? Criar um fundo de emergência? Crie uma Meta, defina o valor e acompanhe seu progresso até conquistar!',
        tips: [
            'Crie metas com nome, valor e prazo',
            'Adicione dinheiro quando conseguir poupar',
            'Calendário mostra quando cada meta vence'
        ],
        icon: Target,
        color: 'from-pink-500 to-rose-600',
        action: AppRoutes.GOALS,
        actionLabel: 'Ver Metas',
    },
    {
        title: '🤖 Consultor IA: Dicas Inteligentes',
        subtitle: 'Um conselheiro financeiro no seu bolso',
        description: 'O Consultor Reynar é uma inteligência artificial que analisa suas finanças e dá dicas personalizadas. Ele fala de um jeito divertido e fácil de entender!',
        tips: [
            'Pergunte onde está gastando muito',
            'Peça sugestões de economia',
            'Ele conhece seus dados e dá dicas certeiras'
        ],
        icon: Bot,
        color: 'from-cyan-500 to-teal-600',
        action: null,
    },
    {
        title: '🚀 Pronto para Começar!',
        subtitle: 'O controle está em suas mãos',
        description: 'Você está pronto! Comece registrando seus gastos de hoje e veja a mágica acontecer. Em poucos dias você vai ter uma visão clara das suas finanças.',
        tips: [
            'Dica: Comece adicionando 3 gastos de hoje',
            'Use diariamente para melhores resultados',
            'Se tiver dúvidas, volte a este tutorial em Configurações'
        ],
        icon: RocketIcon,
        color: 'from-amber-500 to-yellow-500',
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

    const goToStep = (idx: number) => {
        setIsAnimating(true);
        setTimeout(() => {
            setCurrentStep(idx);
            setIsAnimating(false);
        }, 200);
    };

    return (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-lg flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
            <div className="bg-surface border border-surfaceHighlight rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl my-4">
                {/* Header with progress */}
                <div className="p-4 border-b border-surfaceHighlight">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-xs text-textMuted">
                            Passo {currentStep + 1} de {STEPS.length}
                        </span>
                        <button
                            onClick={handleSkip}
                            className="text-textMuted hover:text-white text-sm flex items-center gap-1"
                        >
                            <X size={14} /> Pular tutorial
                        </button>
                    </div>

                    {/* Progress bar with clickable steps */}
                    <div className="flex gap-1">
                        {STEPS.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => goToStep(idx)}
                                className={`h-1.5 flex-1 rounded-full transition-all ${idx === currentStep
                                        ? 'bg-primary'
                                        : idx < currentStep
                                            ? 'bg-primary/50'
                                            : 'bg-surfaceHighlight hover:bg-surfaceHighlight/80'
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className={`p-6 transition-opacity duration-200 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
                    {/* Icon */}
                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mx-auto mb-5 shadow-lg shadow-primary/20`}>
                        <step.icon size={40} className="text-white" />
                    </div>

                    {/* Title & Subtitle */}
                    <h2 className="text-xl font-bold text-white text-center mb-1">{step.title}</h2>
                    <p className="text-sm text-primary text-center mb-4">{step.subtitle}</p>

                    {/* Description */}
                    <p className="text-textMuted text-sm leading-relaxed text-center mb-5">
                        {step.description}
                    </p>

                    {/* Tips List */}
                    <div className="bg-surfaceHighlight/50 rounded-xl p-4 mb-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Lightbulb size={16} className="text-amber-400" />
                            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wide">Dicas</span>
                        </div>
                        <ul className="space-y-2">
                            {step.tips.map((tip, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-zinc-300">
                                    <CheckCircle size={14} className="text-secondary mt-0.5 shrink-0" />
                                    <span>{tip}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Action button */}
                    {step.action && (
                        <button
                            onClick={handleAction}
                            className="w-full py-3 bg-surfaceHighlight hover:bg-primary/20 border border-primary/30 rounded-xl text-primary text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                        >
                            {step.actionLabel} <ChevronRight size={16} />
                        </button>
                    )}
                </div>

                {/* Navigation */}
                <div className="flex gap-3 p-4 border-t border-surfaceHighlight bg-surface/50">
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
                                <RocketIcon size={18} /> Começar a Usar!
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
