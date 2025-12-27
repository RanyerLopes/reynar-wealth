
import React from 'react';
import { Check, Star, Shield, CreditCard, Crown, ArrowRight, Lock } from 'lucide-react';
import { Card, Button } from '../components/UI';
import { useNavigate } from 'react-router-dom';
import { AppRoutes } from '../types';
import { PlanId } from '../services/stripeService';

const Pricing: React.FC = () => {
    const navigate = useNavigate();

    const currentPlan = localStorage.getItem('reynar_plan');

    const handleSelectPlan = (plan: PlanId) => {
        navigate(`${AppRoutes.CHECKOUT}?plan=${plan}`);
    };


    // Se o usuário já é PRO, mostra uma tela de status simples
    if (currentPlan === 'pro') {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center animate-fade-in text-center max-w-lg mx-auto">
                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
                    <Shield size={40} className="text-emerald-500" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Você é um Membro Pro</h2>
                <p className="text-textMuted mb-8">Sua assinatura está ativa e você tem acesso ilimitado a todos os recursos.</p>

                <div className="w-full bg-surface border border-surfaceHighlight rounded-2xl p-6 mb-8 text-left">
                    <p className="text-xs text-textMuted uppercase mb-1">Plano Atual</p>
                    <p className="text-white font-medium flex items-center gap-2"><Crown size={16} className="text-amber-400" /> Reynar Pro</p>
                    <div className="h-px bg-white/10 my-4"></div>
                    <p className="text-xs text-textMuted uppercase mb-1">Cartão Vinculado</p>
                    <p className="text-white font-medium flex items-center gap-2"><CreditCard size={14} /> •••• 4242</p>
                </div>

                <Button variant="secondary" onClick={() => navigate(AppRoutes.DASHBOARD)}>
                    Ir para o Dashboard
                </Button>
            </div>
        )
    }

    if (currentPlan === 'plus') {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center animate-fade-in text-center max-w-lg mx-auto">
                <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-6">
                    <Star size={40} className="text-primary" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Você é um Membro Plus</h2>
                <p className="text-textMuted mb-8">Sua assinatura está ativa. Faça upgrade para Pro para acesso ilimitado!</p>

                <div className="w-full bg-surface border border-surfaceHighlight rounded-2xl p-6 mb-8 text-left">
                    <p className="text-xs text-textMuted uppercase mb-1">Plano Atual</p>
                    <p className="text-white font-medium flex items-center gap-2"><Star size={16} className="text-primary" /> Reynar Plus</p>
                    <div className="h-px bg-white/10 my-4"></div>
                    <p className="text-xs text-textMuted uppercase mb-1">Cartão Vinculado</p>
                    <p className="text-white font-medium flex items-center gap-2"><CreditCard size={14} /> •••• 4242</p>
                </div>

                <div className="flex gap-3 w-full">
                    <Button variant="secondary" className="flex-1" onClick={() => navigate(AppRoutes.DASHBOARD)}>
                        Ir para o Dashboard
                    </Button>
                    <Button className="flex-1" onClick={() => handleSelectPlan('pro')}>
                        <Crown size={16} /> Upgrade Pro
                    </Button>
                </div>
            </div>
        )
    }

    const plusPrice = '14,90';
    const proPrice = '29,90';

    return (
        <div className="pb-24 md:pb-0 min-h-[85vh] flex flex-col items-center justify-center animate-fade-in relative px-4">

            {/* Background Glows */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] pointer-events-none"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[128px] pointer-events-none"></div>

            <div className="text-center space-y-4 mb-10 relative z-10 max-w-2xl">
                <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                    Escolha seu <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-400">Plano</span>
                </h2>
                <p className="text-textMuted text-lg">
                    Controle suas finanças com inteligência artificial. <br />
                    <span className="text-white font-semibold">Cancele quando quiser.</span>
                </p>
            </div>

            {/* Monthly pricing - simple and clear */}
            <p className="text-textMuted text-sm mb-8">Cobrança mensal • Sem fidelidade</p>

            {/* PLANS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">

                {/* PLUS PLAN */}
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-b from-primary/50 to-violet-600/50 rounded-[26px] opacity-50 group-hover:opacity-75 transition duration-500"></div>

                    <div className="relative bg-[#0a0a0a] rounded-[24px] p-6 md:p-8 border border-white/10 shadow-2xl h-full flex flex-col">

                        <div className="text-center mb-6">
                            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-4">
                                <Star size={14} /> Plus
                            </div>
                            <div className="flex items-baseline justify-center gap-1">
                                <span className="text-4xl font-bold text-white">{plusPrice}</span>
                                <span className="text-textMuted">/mês</span>
                            </div>
                            <p className="text-xs text-textMuted mt-2">Ideal para uso pessoal</p>
                        </div>

                        <div className="space-y-3 mb-6 flex-1">
                            <FeatureItem text="200 importações/mês" />
                            <FeatureItem text="50 scans OCR/mês" />
                            <FeatureItem text="10 metas financeiras" />
                            <FeatureItem text="3 contas bancárias" />
                            <FeatureItem text="Categorização IA" />
                            <FeatureItem text="Exportar Excel/PDF" />
                            <FeatureItem text="Armazenar comprovantes" />
                        </div>

                        <Button
                            variant="secondary"
                            onClick={() => handleSelectPlan('plus')}
                            isLoading={isRedirecting === 'plus'}
                            className="w-full h-12"
                        >
                            Assinar Plus <ArrowRight size={16} />
                        </Button>
                    </div>
                </div>

                {/* PRO PLAN - Featured */}
                <div className="relative group">
                    {/* MOST POPULAR BADGE */}
                    <div className="absolute -top-4 left-0 right-0 mx-auto w-fit bg-amber-400 text-black text-xs font-extrabold px-4 py-1.5 rounded-full shadow-lg uppercase tracking-wide z-20">
                        Mais Popular
                    </div>

                    <div className="absolute -inset-1 bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 rounded-[30px] opacity-75 group-hover:opacity-100 transition duration-500"></div>

                    <div className="relative bg-[#0a0a0a] rounded-[28px] p-6 md:p-8 border border-amber-400/30 shadow-2xl h-full flex flex-col">

                        <div className="text-center mb-6 pt-2">
                            <div className="inline-flex items-center gap-2 bg-amber-400/10 text-amber-400 px-3 py-1 rounded-full text-sm font-medium mb-4">
                                <Crown size={14} className="fill-amber-400" /> Pro
                            </div>
                            <div className="flex items-baseline justify-center gap-1">
                                <span className="text-4xl font-bold text-white">{proPrice}</span>
                                <span className="text-textMuted">/mês</span>
                            </div>
                            <p className="text-xs text-textMuted mt-2">Para quem quer o máximo</p>
                        </div>

                        <div className="space-y-3 mb-6 flex-1">
                            <FeatureItem text="Importações ilimitadas" highlight />
                            <FeatureItem text="Scans OCR ilimitados" highlight />
                            <FeatureItem text="Metas ilimitadas" highlight />
                            <FeatureItem text="Contas ilimitadas" highlight />
                            <FeatureItem text="Categorização IA" />
                            <FeatureItem text="Exportar Excel/PDF" />
                            <FeatureItem text="Relatórios históricos" highlight />
                            <FeatureItem text="Multi-moedas" highlight />
                            <FeatureItem text="Suporte prioritário" highlight />
                        </div>

                        <Button
                            variant="primary"
                            onClick={() => handleSelectPlan('pro')}
                            isLoading={isRedirecting === 'pro'}
                            className="w-full h-12 shadow-[0_0_20px_rgba(251,191,36,0.3)] group-hover:shadow-[0_0_30px_rgba(251,191,36,0.5)]"
                        >
                            Assinar Pro <Crown size={16} />
                        </Button>
                    </div>
                </div>
            </div>

            <p className="text-[10px] text-center text-textMuted mt-6 flex items-center justify-center gap-1 opacity-60">
                <Lock size={10} /> Pagamento processado com segurança pelo Stripe.
            </p>

            <div className="mt-6 text-center">
                <p className="text-sm text-textMuted">Dúvidas? <span className="text-white underline cursor-pointer">Fale com o suporte.</span></p>
            </div>
        </div>
    );
};

const FeatureItem: React.FC<{ text: string; highlight?: boolean }> = ({ text, highlight }) => (
    <div className="flex items-center gap-3 text-sm">
        <div className={`p-1 rounded-full ${highlight ? 'bg-amber-400/20 text-amber-400' : 'bg-primary/20 text-primary'}`}>
            <Check size={12} />
        </div>
        <span className={`font-medium ${highlight ? 'text-white' : 'text-zinc-400'}`}>{text}</span>
    </div>
);

export default Pricing;
