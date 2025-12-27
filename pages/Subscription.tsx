
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button } from '../components/UI';
import { AppRoutes } from '../types';
import {
    Crown, Star, Shield, CreditCard, Calendar, Clock,
    AlertTriangle, Check, ArrowRight, RefreshCcw, X, Sparkles
} from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';

const Subscription: React.FC = () => {
    const navigate = useNavigate();
    const {
        subscription,
        isPro,
        isPlus,
        isFree,
        isTrial
    } = useSubscription();

    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelling, setCancelling] = useState(false);

    // Mock data for subscription details
    const subscriptionData = {
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        lastPayment: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        cardLast4: '4242',
        cardBrand: 'Visa',
        monthlyPrice: isPro ? 29.90 : isPlus ? 14.90 : 0,
    };

    const paymentHistory = [
        { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), amount: subscriptionData.monthlyPrice, status: 'paid' },
        { date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000), amount: subscriptionData.monthlyPrice, status: 'paid' },
        { date: new Date(Date.now() - 66 * 24 * 60 * 60 * 1000), amount: subscriptionData.monthlyPrice, status: 'paid' },
    ];

    const handleCancelSubscription = async () => {
        setCancelling(true);
        // Simulate cancellation
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Reset to free plan
        localStorage.setItem('reynar_plan', 'free');
        setCancelling(false);
        setShowCancelModal(false);

        // Refresh page to update context
        window.location.reload();
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    // Determine plan info
    const getPlanInfo = () => {
        if (isPro) return { name: 'Reynar Pro', icon: Crown, color: 'amber-400', bgColor: 'amber-400/20' };
        if (isPlus) return { name: 'Reynar Plus', icon: Star, color: 'primary', bgColor: 'primary/20' };
        return { name: 'Plano Gratuito', icon: Shield, color: 'textMuted', bgColor: 'surfaceHighlight' };
    };

    const planInfo = getPlanInfo();
    const PlanIcon = planInfo.icon;

    return (
        <div className="pb-24 md:pb-0 animate-fade-in max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white mb-1">Minha Assinatura</h1>
                <p className="text-textMuted text-sm">Gerencie seu plano e forma de pagamento</p>
            </div>

            {/* Current Plan Card */}
            <Card className={`border-2 ${isPro ? 'border-amber-400/30' : isPlus ? 'border-primary/30' : 'border-surfaceHighlight'}`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl bg-${planInfo.bgColor} flex items-center justify-center`}>
                            <PlanIcon size={28} className={`text-${planInfo.color} ${isPro ? 'fill-amber-400' : ''}`} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">{planInfo.name}</h2>
                            <p className="text-sm text-textMuted">
                                {isFree ? 'Recursos limitados' :
                                    isTrial ? `Trial - ${subscription.daysLeftInTrial} dias restantes` :
                                        'Assinatura ativa'}
                            </p>
                        </div>
                    </div>

                    {!isFree && (
                        <div className="text-right">
                            <span className="text-2xl font-bold text-white">
                                R$ {subscriptionData.monthlyPrice.toFixed(2)}
                            </span>
                            <span className="text-textMuted text-sm">/mês</span>
                        </div>
                    )}
                </div>

                {/* Trial Warning */}
                {isTrial && subscription.daysLeftInTrial <= 7 && (
                    <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-3">
                        <AlertTriangle size={18} className="text-amber-400" />
                        <p className="text-sm text-amber-200">
                            Seu trial termina em {subscription.daysLeftInTrial} dias.
                            <button className="underline ml-1" onClick={() => navigate(AppRoutes.PRICING)}>
                                Assine agora
                            </button>
                        </p>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="mt-6 flex flex-wrap gap-3">
                    {isFree && (
                        <Button onClick={() => navigate(AppRoutes.PRICING)} className="flex-1 md:flex-none">
                            <Sparkles size={16} /> Fazer Upgrade
                        </Button>
                    )}
                    {isPlus && (
                        <Button onClick={() => navigate(`${AppRoutes.CHECKOUT}?plan=pro`)} className="bg-gradient-to-r from-amber-500 to-amber-600">
                            <Crown size={16} /> Upgrade para Pro
                        </Button>
                    )}
                    {(isPlus || isPro) && (
                        <Button
                            variant="ghost"
                            onClick={() => setShowCancelModal(true)}
                            className="text-danger hover:bg-danger/10 border-danger/30"
                        >
                            Cancelar Assinatura
                        </Button>
                    )}
                </div>
            </Card>

            {/* Payment Method */}
            {(isPlus || isPro) && (
                <Card>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <CreditCard size={18} className="text-primary" />
                        Forma de Pagamento
                    </h3>

                    <div className="flex items-center justify-between p-4 bg-surfaceHighlight rounded-xl">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-8 bg-white/10 rounded flex items-center justify-center">
                                <CreditCard size={18} className="text-white" />
                            </div>
                            <div>
                                <p className="text-white font-medium">{subscriptionData.cardBrand} •••• {subscriptionData.cardLast4}</p>
                                <p className="text-xs text-textMuted">Expira 12/28</p>
                            </div>
                        </div>
                        <Button variant="ghost" className="!w-auto text-sm">
                            <RefreshCcw size={14} /> Alterar
                        </Button>
                    </div>

                    {/* Next Billing */}
                    <div className="mt-4 flex items-center gap-3 text-sm">
                        <Calendar size={16} className="text-textMuted" />
                        <span className="text-textMuted">Próxima cobrança:</span>
                        <span className="text-white font-medium">{formatDate(subscriptionData.nextBillingDate)}</span>
                    </div>
                </Card>
            )}

            {/* Payment History */}
            {(isPlus || isPro) && (
                <Card>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Clock size={18} className="text-primary" />
                        Histórico de Pagamentos
                    </h3>

                    <div className="space-y-3">
                        {paymentHistory.map((payment, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-surfaceHighlight rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-secondary/20 rounded-full flex items-center justify-center">
                                        <Check size={14} className="text-secondary" />
                                    </div>
                                    <div>
                                        <p className="text-white text-sm font-medium">
                                            R$ {payment.amount.toFixed(2)}
                                        </p>
                                        <p className="text-xs text-textMuted">{formatDate(payment.date)}</p>
                                    </div>
                                </div>
                                <span className="text-xs bg-secondary/20 text-secondary px-2 py-1 rounded-full">
                                    Pago
                                </span>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Free Plan Info */}
            {isFree && !isTrial && (
                <Card className="text-center py-8">
                    <Shield size={48} className="mx-auto mb-4 text-textMuted opacity-30" />
                    <h3 className="text-lg font-bold text-white mb-2">Você está no Plano Gratuito</h3>
                    <p className="text-textMuted text-sm mb-6 max-w-md mx-auto">
                        Faça upgrade para desbloquear recursos ilimitados, IA avançada e muito mais.
                    </p>
                    <Button onClick={() => navigate(AppRoutes.PRICING)} className="!w-auto mx-auto">
                        Ver Planos <ArrowRight size={16} />
                    </Button>
                </Card>
            )}

            {/* Cancel Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <Card className="max-w-md w-full animate-scale-up">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-danger/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle size={32} className="text-danger" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Cancelar Assinatura?</h3>
                            <p className="text-textMuted text-sm mb-6">
                                Você perderá acesso aos recursos premium ao final do período atual.
                                Tem certeza que deseja cancelar?
                            </p>

                            <div className="flex gap-3">
                                <Button
                                    variant="ghost"
                                    onClick={() => setShowCancelModal(false)}
                                    className="flex-1"
                                >
                                    Manter Plano
                                </Button>
                                <Button
                                    variant="danger"
                                    onClick={handleCancelSubscription}
                                    isLoading={cancelling}
                                    className="flex-1 bg-danger hover:bg-danger/80"
                                >
                                    Sim, Cancelar
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default Subscription;
