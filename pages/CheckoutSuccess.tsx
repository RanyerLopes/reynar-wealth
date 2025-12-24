
import React, { useEffect, useState } from 'react';
import { PartyPopper, Check, Star, Crown, FileText, LayoutDashboard, Loader2 } from 'lucide-react';
import { Card, Button } from '../components/UI';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppRoutes } from '../types';
import { verifyCheckoutSession, PlanId } from '../services/stripeService';
import { useSubscription } from '../context/SubscriptionContext';

const CheckoutSuccess: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { upgradeToPlus, upgradeToPro } = useSubscription();
    const [verifying, setVerifying] = useState(true);
    const [plan, setPlan] = useState<PlanId>('pro');

    useEffect(() => {
        const verifyPayment = async () => {
            const queryParams = new URLSearchParams(location.search);
            const sessionId = queryParams.get('session_id');
            const planParam = queryParams.get('plan') as PlanId | null;

            if (sessionId) {
                try {
                    const result = await verifyCheckoutSession(sessionId);

                    if (result.success) {
                        const activePlan = result.plan || planParam || 'pro';
                        setPlan(activePlan);

                        // Activate the plan
                        if (activePlan === 'plus') {
                            upgradeToPlus();
                        } else {
                            upgradeToPro();
                        }
                    }
                } catch (error) {
                    // Fallback to URL param or pro
                    const fallbackPlan = planParam || 'pro';
                    setPlan(fallbackPlan);
                    if (fallbackPlan === 'plus') {
                        upgradeToPlus();
                    } else {
                        upgradeToPro();
                    }
                }
            } else {
                // No session ID - use URL param or default to pro for demo
                const fallbackPlan = planParam || 'pro';
                setPlan(fallbackPlan);
                if (fallbackPlan === 'plus') {
                    upgradeToPlus();
                } else {
                    upgradeToPro();
                }
            }

            setVerifying(false);
        };

        verifyPayment();
    }, [location, upgradeToPlus, upgradeToPro]);

    const handleGoToReports = () => {
        navigate(AppRoutes.REPORTS);
    };

    const handleGoToDashboard = () => {
        navigate(AppRoutes.DASHBOARD);
    };

    if (verifying) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center text-center animate-fade-in">
                <Loader2 size={48} className="text-primary animate-spin mb-4" />
                <h2 className="text-xl font-bold text-white">Confirmando pagamento...</h2>
                <p className="text-textMuted text-sm mt-2">Validando sua sessão segura com o Stripe.</p>
            </div>
        );
    }

    const isPro = plan === 'pro';
    const planName = isPro ? 'PRO' : 'PLUS';
    const planColor = isPro ? 'text-amber-400' : 'text-primary';
    const PlanIcon = isPro ? Crown : Star;

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center text-center animate-fade-in space-y-6 max-w-lg mx-auto relative z-10">
            <div className={`w-24 h-24 bg-gradient-to-tr ${isPro ? 'from-amber-400 to-amber-600' : 'from-primary to-indigo-600'} rounded-full flex items-center justify-center shadow-2xl shadow-primary/40 animate-scale-up mb-4 relative`}>
                <PartyPopper size={48} className="text-white relative z-10" />
                <div className="absolute inset-0 bg-white/20 rounded-full animate-ping"></div>
            </div>

            <div>
                <h2 className="text-3xl font-bold text-white mb-2">Pagamento Confirmado!</h2>
                <p className="text-textMuted text-lg">
                    Bem-vindo ao clube <span className={`${planColor} font-bold`}>Reynar {planName}</span>.
                </p>
            </div>

            <Card className={`w-full text-left bg-surface/50 ${isPro ? 'border-amber-400/30' : 'border-primary/30'}`}>
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                    <PlanIcon size={18} className={isPro ? 'text-amber-400 fill-amber-400' : 'text-primary'} />
                    Recursos Desbloqueados:
                </h3>
                <ul className="space-y-3">
                    {isPro ? (
                        <>
                            <FeatureItem text="Importações Ilimitadas" />
                            <FeatureItem text="Scans OCR Ilimitados" />
                            <FeatureItem text="Metas Ilimitadas" />
                            <FeatureItem text="Relatórios Históricos" />
                            <FeatureItem text="Multi-moedas" />
                            <FeatureItem text="Suporte Prioritário" />
                        </>
                    ) : (
                        <>
                            <FeatureItem text="200 Importações/mês" />
                            <FeatureItem text="50 Scans OCR/mês" />
                            <FeatureItem text="10 Metas Financeiras" />
                            <FeatureItem text="Categorização com IA" />
                            <FeatureItem text="Exportar Excel/PDF" />
                        </>
                    )}
                </ul>
            </Card>

            <div className="w-full space-y-3">
                <Button onClick={handleGoToDashboard} className={`w-full py-4 text-lg shadow-lg ${isPro ? 'shadow-amber-400/20' : 'shadow-primary/20'}`}>
                    <LayoutDashboard size={20} /> Ir para o Dashboard
                </Button>

                <Button variant="ghost" onClick={handleGoToReports} className="w-full border border-surfaceHighlight text-textMuted hover:text-white">
                    <FileText size={18} /> Ver Relatórios
                </Button>
            </div>

            {/* Confetti effect elements */}
            <div className="absolute top-10 left-10 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <div className="absolute top-20 right-20 w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="absolute bottom-10 left-1/4 w-2 h-2 bg-yellow-500 rounded-full animate-ping"></div>
        </div>
    );
};

const FeatureItem: React.FC<{ text: string }> = ({ text }) => (
    <li className="flex items-center gap-3 text-sm text-textMain">
        <div className="p-1 bg-secondary/20 rounded-full"><Check size={12} className="text-secondary" /></div>
        {text}
    </li>
);

export default CheckoutSuccess;
