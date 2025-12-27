
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, Button, Input } from '../components/UI';
import { AppRoutes } from '../types';
import {
    CreditCard, Lock, Shield, ArrowLeft, Check, Star, Crown,
    Calendar, Sparkles, AlertCircle
} from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';

type BillingCycle = 'monthly' | 'yearly';

const Checkout: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { upgradeToPlus, upgradeToPro } = useSubscription();

    const planParam = searchParams.get('plan') as 'plus' | 'pro' || 'pro';

    const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
    const [cardNumber, setCardNumber] = useState('');
    const [cardName, setCardName] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Plan pricing
    const plans = {
        plus: {
            name: 'Reynar Plus',
            icon: Star,
            color: 'primary',
            monthlyPrice: 14.90,
            yearlyPrice: 149.00, // ~17% off
            features: [
                '200 importações/mês',
                '50 scans OCR/mês',
                '10 metas financeiras',
                'Categorização IA',
                'Exportar Excel/PDF'
            ]
        },
        pro: {
            name: 'Reynar Pro',
            icon: Crown,
            color: 'amber-400',
            monthlyPrice: 29.90,
            yearlyPrice: 299.00, // ~17% off
            features: [
                'Tudo ilimitado',
                'Relatórios históricos',
                'Multi-moedas',
                'Suporte prioritário',
                'API Access'
            ]
        }
    };

    const currentPlan = plans[planParam];
    const price = billingCycle === 'monthly' ? currentPlan.monthlyPrice : currentPlan.yearlyPrice;
    const monthlyEquivalent = billingCycle === 'yearly' ? (currentPlan.yearlyPrice / 12) : currentPlan.monthlyPrice;
    const savings = billingCycle === 'yearly'
        ? ((currentPlan.monthlyPrice * 12) - currentPlan.yearlyPrice).toFixed(2)
        : null;

    // Format card number with spaces
    const formatCardNumber = (value: string) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = (matches && matches[0]) || '';
        const parts = [];
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        if (parts.length) {
            return parts.join(' ');
        }
        return v;
    };

    // Format expiry as MM/YY
    const formatExpiry = (value: string) => {
        const v = value.replace(/\D/g, '');
        if (v.length >= 2) {
            return v.substring(0, 2) + '/' + v.substring(2, 4);
        }
        return v;
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
            newErrors.cardNumber = 'Número do cartão inválido';
        }
        if (!cardName || cardName.length < 3) {
            newErrors.cardName = 'Nome obrigatório';
        }
        if (!expiry || expiry.length < 5) {
            newErrors.expiry = 'Validade inválida';
        }
        if (!cvv || cvv.length < 3) {
            newErrors.cvv = 'CVV inválido';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsProcessing(true);

        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Activate plan
        if (planParam === 'plus') {
            upgradeToPlus();
        } else {
            upgradeToPro();
        }

        // Navigate to success
        navigate(`${AppRoutes.CHECKOUT_SUCCESS}?plan=${planParam}`);
    };

    const PlanIcon = currentPlan.icon;
    const isPro = planParam === 'pro';

    return (
        <div className="pb-24 md:pb-0 min-h-[85vh] animate-fade-in">
            {/* Back button */}
            <button
                onClick={() => navigate(AppRoutes.PRICING)}
                className="flex items-center gap-2 text-textMuted hover:text-white mb-6 transition-colors"
            >
                <ArrowLeft size={18} />
                <span className="text-sm">Voltar para planos</span>
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch">

                {/* LEFT: Order Summary */}
                <div className="order-2 lg:order-1 flex flex-col">
                    <Card className={`border-2 h-full flex flex-col ${isPro ? 'border-amber-400/30' : 'border-primary/30'}`}>
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <PlanIcon size={20} className={isPro ? 'text-amber-400 fill-amber-400' : 'text-primary'} />
                            Resumo do Pedido
                        </h2>

                        {/* Plan Info */}
                        <div className="bg-surfaceHighlight rounded-xl p-4 mb-6">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-white font-medium">{currentPlan.name}</span>
                                <span className={`text-xs px-2 py-1 rounded-full ${isPro ? 'bg-amber-400/20 text-amber-400' : 'bg-primary/20 text-primary'}`}>
                                    {billingCycle === 'yearly' ? 'Anual' : 'Mensal'}
                                </span>
                            </div>
                            <ul className="space-y-2">
                                {currentPlan.features.slice(0, 4).map((feature, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-textMuted">
                                        <Check size={14} className={isPro ? 'text-amber-400' : 'text-primary'} />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Billing Cycle Toggle */}
                        <div className="mb-6">
                            <p className="text-xs text-textMuted uppercase mb-3">Ciclo de cobrança</p>
                            <div className="flex bg-surfaceHighlight rounded-xl p-1">
                                <button
                                    onClick={() => setBillingCycle('monthly')}
                                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${billingCycle === 'monthly'
                                        ? 'bg-surface text-white shadow'
                                        : 'text-textMuted hover:text-white'
                                        }`}
                                >
                                    Mensal
                                </button>
                                <button
                                    onClick={() => setBillingCycle('yearly')}
                                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all relative ${billingCycle === 'yearly'
                                        ? 'bg-surface text-white shadow'
                                        : 'text-textMuted hover:text-white'
                                        }`}
                                >
                                    Anual
                                    <span className="absolute -top-2 -right-2 bg-secondary text-[10px] text-black px-1.5 py-0.5 rounded-full font-bold">
                                        -17%
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Price Summary */}
                        <div className="border-t border-surfaceHighlight pt-4 space-y-3 mt-auto">
                            <div className="flex justify-between text-sm">
                                <span className="text-textMuted">Subtotal</span>
                                <span className="text-white">R$ {price.toFixed(2)}</span>
                            </div>
                            {savings && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-secondary flex items-center gap-1">
                                        <Sparkles size={12} /> Economia anual
                                    </span>
                                    <span className="text-secondary">-R$ {savings}</span>
                                </div>
                            )}
                            <div className="h-px bg-surfaceHighlight"></div>
                            <div className="flex justify-between items-end">
                                <div>
                                    <span className="text-textMuted text-sm block">Total</span>
                                    {billingCycle === 'yearly' && (
                                        <span className="text-xs text-textMuted">
                                            (equivale a R$ {monthlyEquivalent.toFixed(2)}/mês)
                                        </span>
                                    )}
                                </div>
                                <span className="text-2xl font-bold text-white">
                                    R$ {price.toFixed(2)}
                                    <span className="text-sm text-textMuted font-normal">
                                        /{billingCycle === 'yearly' ? 'ano' : 'mês'}
                                    </span>
                                </span>
                            </div>
                        </div>

                        {/* Security badges */}
                        <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-surfaceHighlight text-xs text-textMuted">
                            <div className="flex items-center gap-1">
                                <Lock size={12} />
                                <span>SSL 256-bit</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Shield size={12} />
                                <span>Dados seguros</span>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* RIGHT: Payment Form */}
                <div className="order-1 lg:order-2 flex flex-col">
                    <Card className="h-full flex flex-col">
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <CreditCard size={20} className="text-primary" />
                            Dados do Pagamento
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-5 flex-1 flex flex-col">
                            {/* Card Number */}
                            <div>
                                <label className="text-xs font-medium text-textMuted uppercase tracking-wider block mb-1.5">
                                    Número do Cartão
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="1234 5678 9012 3456"
                                        value={cardNumber}
                                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                                        maxLength={19}
                                        className={`w-full bg-surfaceHighlight text-white rounded-xl px-4 py-3 pr-12 border ${errors.cardNumber ? 'border-danger' : 'border-transparent focus:border-primary'
                                            } focus:outline-none transition-colors`}
                                    />
                                    <CreditCard size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-textMuted" />
                                </div>
                                {errors.cardNumber && (
                                    <p className="text-danger text-xs mt-1 flex items-center gap-1">
                                        <AlertCircle size={12} /> {errors.cardNumber}
                                    </p>
                                )}
                            </div>

                            {/* Card Name */}
                            <div>
                                <label className="text-xs font-medium text-textMuted uppercase tracking-wider block mb-1.5">
                                    Nome no Cartão
                                </label>
                                <input
                                    type="text"
                                    placeholder="FULANO DA SILVA"
                                    value={cardName}
                                    onChange={(e) => setCardName(e.target.value.toUpperCase())}
                                    className={`w-full bg-surfaceHighlight text-white rounded-xl px-4 py-3 border ${errors.cardName ? 'border-danger' : 'border-transparent focus:border-primary'
                                        } focus:outline-none transition-colors`}
                                />
                                {errors.cardName && (
                                    <p className="text-danger text-xs mt-1 flex items-center gap-1">
                                        <AlertCircle size={12} /> {errors.cardName}
                                    </p>
                                )}
                            </div>

                            {/* Expiry + CVV */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-textMuted uppercase tracking-wider block mb-1.5">
                                        Validade
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="MM/AA"
                                            value={expiry}
                                            onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                                            maxLength={5}
                                            className={`w-full bg-surfaceHighlight text-white rounded-xl px-4 py-3 border ${errors.expiry ? 'border-danger' : 'border-transparent focus:border-primary'
                                                } focus:outline-none transition-colors`}
                                        />
                                        <Calendar size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-textMuted" />
                                    </div>
                                    {errors.expiry && (
                                        <p className="text-danger text-xs mt-1 flex items-center gap-1">
                                            <AlertCircle size={12} /> {errors.expiry}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-textMuted uppercase tracking-wider block mb-1.5">
                                        CVV
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="123"
                                            value={cvv}
                                            onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                                            maxLength={4}
                                            className={`w-full bg-surfaceHighlight text-white rounded-xl px-4 py-3 border ${errors.cvv ? 'border-danger' : 'border-transparent focus:border-primary'
                                                } focus:outline-none transition-colors`}
                                        />
                                        <Lock size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-textMuted" />
                                    </div>
                                    {errors.cvv && (
                                        <p className="text-danger text-xs mt-1 flex items-center gap-1">
                                            <AlertCircle size={12} /> {errors.cvv}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="mt-auto pt-4">
                                <Button
                                    type="submit"
                                    isLoading={isProcessing}
                                    className={`w-full h-14 text-lg ${isPro
                                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 shadow-lg shadow-amber-500/20'
                                        : ''
                                        }`}
                                >
                                    {isProcessing ? 'Processando...' : `Pagar R$ ${price.toFixed(2)}`}
                                </Button>

                                <p className="text-[10px] text-center text-textMuted mt-4">
                                    Ao clicar em "Pagar", você concorda com nossos Termos de Uso e Política de Privacidade.
                                    Cancele quando quiser.
                                </p>
                            </div>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
