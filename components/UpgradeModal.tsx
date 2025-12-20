/**
 * Upgrade Modal Component
 * 
 * Shows when user hits a limit on the free plan.
 * Encourages upgrade to Pro.
 */

import React from 'react';
import { X, Crown, Sparkles, Zap, Infinity, Check, ArrowRight } from 'lucide-react';
import { Button } from './UI';
import { useNavigate } from 'react-router-dom';
import { AppRoutes } from '../types';
import { useSubscription } from '../context/SubscriptionContext';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    feature: 'imports' | 'scans' | 'ai' | 'goals' | 'categorization' | 'reports' | 'export';
    currentUsage?: number;
    limit?: number;
}

const FEATURE_MESSAGES: Record<string, { title: string; description: string; icon: React.ReactNode }> = {
    imports: {
        title: 'Limite de Importações Atingido',
        description: 'Você atingiu o limite de 50 transações importadas este mês.',
        icon: <Sparkles className="text-amber-400" size={24} />,
    },
    scans: {
        title: 'Limite de Escaneamentos Atingido',
        description: 'Você atingiu o limite de 10 comprovantes escaneados este mês.',
        icon: <Sparkles className="text-amber-400" size={24} />,
    },
    ai: {
        title: 'Consultas com IA Esgotadas',
        description: 'Você usou suas 15 consultas gratuitas com o Conselheiro IA este mês.',
        icon: <Zap className="text-amber-400" size={24} />,
    },
    goals: {
        title: 'Limite de Metas Atingido',
        description: 'O plano gratuito permite até 3 metas. Faça upgrade para metas ilimitadas!',
        icon: <Sparkles className="text-amber-400" size={24} />,
    },
    categorization: {
        title: 'Recurso Exclusivo Pro',
        description: 'A categorização automática com IA está disponível apenas no plano Pro.',
        icon: <Zap className="text-amber-400" size={24} />,
    },
    reports: {
        title: 'Recurso Exclusivo Pro',
        description: 'Relatórios históricos (anos anteriores) estão disponíveis apenas no plano Pro.',
        icon: <Sparkles className="text-amber-400" size={24} />,
    },
    export: {
        title: 'Recurso Exclusivo Pro',
        description: 'A exportação de dados está disponível apenas no plano Pro.',
        icon: <Sparkles className="text-amber-400" size={24} />,
    },
};

const PRO_BENEFITS = [
    'Importações ilimitadas de extratos',
    'Escaneamento ilimitado de comprovantes',
    'Consultor IA sem limites',
    'Categorização automática com IA',
    'Metas ilimitadas',
    'Relatórios históricos',
    'Exportação de dados',
    'Suporte prioritário',
];

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
    isOpen,
    onClose,
    feature,
    currentUsage,
    limit,
}) => {
    const navigate = useNavigate();
    const { startTrial, plan } = useSubscription();

    const featureInfo = FEATURE_MESSAGES[feature] || FEATURE_MESSAGES.imports;

    const handleUpgrade = () => {
        onClose();
        navigate(AppRoutes.PRICING);
    };

    const handleStartTrial = () => {
        startTrial();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-surface w-full max-w-md rounded-2xl border border-surfaceHighlight shadow-2xl animate-slide-up overflow-hidden">

                {/* Header Gradient */}
                <div className="relative bg-gradient-to-br from-primary/20 via-indigo-500/10 to-purple-500/20 p-6 pb-8">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-textMuted hover:text-white p-1"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-surface/80 flex items-center justify-center">
                            {featureInfo.icon}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">{featureInfo.title}</h3>
                            {currentUsage !== undefined && limit !== undefined && (
                                <p className="text-sm text-textMuted">{currentUsage}/{limit} usados</p>
                            )}
                        </div>
                    </div>

                    <p className="text-textMuted text-sm">{featureInfo.description}</p>
                </div>

                {/* Pro Benefits */}
                <div className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Crown size={18} className="text-amber-400" />
                        <h4 className="font-semibold text-white">Desbloqueie com o Plano Pro</h4>
                    </div>

                    <div className="space-y-2 mb-6">
                        {PRO_BENEFITS.slice(0, 5).map((benefit, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                                <Check size={14} className="text-primary shrink-0" />
                                <span className="text-zinc-300">{benefit}</span>
                            </div>
                        ))}
                        <div className="flex items-center gap-2 text-sm">
                            <Infinity size={14} className="text-primary shrink-0" />
                            <span className="text-zinc-300">E muito mais...</span>
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="bg-surfaceHighlight/50 rounded-xl p-4 mb-6 border border-white/5">
                        <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-3xl font-bold text-white">R$ 29,90</span>
                            <span className="text-textMuted text-sm">/mês</span>
                        </div>
                        <p className="text-xs text-textMuted">ou R$ 299/ano (economize 17%)</p>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                        <Button
                            variant="primary"
                            onClick={handleUpgrade}
                            className="w-full"
                        >
                            <Crown size={18} />
                            Fazer Upgrade para Pro
                            <ArrowRight size={16} />
                        </Button>

                        {plan === 'free' && (
                            <Button
                                variant="secondary"
                                onClick={handleStartTrial}
                                className="w-full"
                            >
                                Experimentar 14 dias grátis
                            </Button>
                        )}
                    </div>

                    <p className="text-[10px] text-center text-textMuted mt-4">
                        Cancele quando quiser. Sem compromisso.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default UpgradeModal;
