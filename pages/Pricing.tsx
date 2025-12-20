
import React, { useState } from 'react';
import { Check, Star, Shield, Zap, CreditCard, Crown, ArrowRight, Lock, X } from 'lucide-react';
import { Card, Button } from '../components/UI';
import { useNavigate } from 'react-router-dom';
import { AppRoutes } from '../types';

const Pricing: React.FC = () => {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isRedirecting, setIsRedirecting] = useState(false);

  const currentPlan = localStorage.getItem('finnova_plan');

  const handleStripeCheckout = async () => {
    setIsRedirecting(true);
    // Simulação de redirecionamento para Stripe
    setTimeout(() => {
        navigate(`${AppRoutes.CHECKOUT_SUCCESS}?session_id=cs_test_mock_123456`);
    }, 2000);
  };

  // Se o usuário já é PRO, mostra uma tela de status simples
  if (currentPlan === 'pro') {
      return (
          <div className="min-h-[70vh] flex flex-col items-center justify-center animate-fade-in text-center max-w-lg mx-auto">
              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
                  <Shield size={40} className="text-emerald-500" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Você é um Membro Reynar</h2>
              <p className="text-textMuted mb-8">Sua assinatura está ativa e você tem acesso ilimitado a todos os recursos.</p>
              
              <div className="w-full bg-surface border border-surfaceHighlight rounded-2xl p-6 mb-8 text-left">
                  <p className="text-xs text-textMuted uppercase mb-1">Próxima Cobrança</p>
                  <p className="text-white font-medium">10 de Novembro, 2024</p>
                  <div className="h-px bg-white/10 my-4"></div>
                  <p className="text-xs text-textMuted uppercase mb-1">Cartão Vinculado</p>
                  <p className="text-white font-medium flex items-center gap-2"><CreditCard size={14}/> •••• 4242</p>
              </div>

              <Button variant="secondary" onClick={() => navigate(AppRoutes.DASHBOARD)}>
                  Ir para o Dashboard
              </Button>
          </div>
      )
  }

  return (
    <div className="pb-24 md:pb-0 min-h-[85vh] flex flex-col items-center justify-center animate-fade-in relative px-4">
        
        {/* Background Glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] pointer-events-none"></div>

        <div className="text-center space-y-4 mb-10 relative z-10 max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                Complete sua <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-400">Jornada</span>
            </h2>
            <p className="text-textMuted text-lg">
                Para acessar o Reynar Wealth, escolha seu plano abaixo. <br/>
                <span className="text-white font-semibold">Cancele quando quiser.</span>
            </p>
        </div>

        {/* SINGLE ULTRA CARD PAYWALL */}
        <div className="w-full max-w-md relative group">
             {/* Glow Effect */}
             <div className="absolute -inset-1 bg-gradient-to-b from-primary via-indigo-500 to-purple-600 rounded-[30px] opacity-75 blur-md group-hover:opacity-100 transition duration-500"></div>
            
            <div className="relative bg-[#0a0a0a] rounded-[28px] p-8 md:p-10 border border-white/10 shadow-2xl">
                
                {/* 7 DAYS FREE BADGE */}
                <div className="absolute -top-4 left-0 right-0 mx-auto w-fit bg-[#fbbf24] text-black text-xs font-extrabold px-4 py-1.5 rounded-full shadow-lg uppercase tracking-wide z-20">
                    Teste Grátis por 7 Dias
                </div>

                <div className="text-center mb-8 pt-2">
                    <h3 className="text-xl font-bold text-white flex items-center justify-center gap-2">
                        Membro Reynar <Crown size={20} className="text-amber-400 fill-amber-400" />
                    </h3>
                    
                    {/* Billing Toggle Small */}
                    <div className="flex items-center justify-center gap-3 mt-4 mb-4">
                        <button onClick={() => setBillingCycle('monthly')} className={`text-sm ${billingCycle === 'monthly' ? 'text-white font-bold' : 'text-textMuted'}`}>Mensal</button>
                        <div 
                            className="w-10 h-5 bg-surfaceHighlight rounded-full relative cursor-pointer border border-white/10"
                            onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
                        >
                            <div className={`absolute top-0.5 w-4 h-4 bg-primary rounded-full transition-all ${billingCycle === 'monthly' ? 'left-0.5' : 'left-[22px]'}`}></div>
                        </div>
                        <button onClick={() => setBillingCycle('yearly')} className={`text-sm ${billingCycle === 'yearly' ? 'text-white font-bold' : 'text-textMuted'}`}>Anual (-17%)</button>
                    </div>

                    <div className="flex items-baseline justify-center gap-1">
                        <span className="text-5xl font-bold text-white tracking-tight">
                            {billingCycle === 'monthly' ? '29,90' : '299,00'}
                        </span>
                        <span className="text-lg text-textMuted">Reais</span>
                    </div>
                </div>

                <div className="space-y-4 mb-8">
                    <FeatureItem text="Acesso Ilimitado ao App" active />
                    <FeatureItem text="Inteligência Artificial (Leitor de Notas)" active />
                    <FeatureItem text="Gerador de Imposto de Renda" active />
                    <FeatureItem text="Gestão de Metas & Investimentos" active />
                </div>

                <Button 
                    variant="primary" 
                    onClick={handleStripeCheckout}
                    isLoading={isRedirecting}
                    className="w-full h-14 text-base font-bold shadow-[0_0_20px_rgba(124,58,237,0.4)] group-hover:shadow-[0_0_30px_rgba(124,58,237,0.6)]"
                >
                    Começar 7 Dias Grátis <ArrowRight size={18} />
                </Button>

                <p className="text-[10px] text-center text-textMuted mt-4 flex items-center justify-center gap-1 opacity-60">
                    <Lock size={10} /> Pagamento processado com segurança pelo Stripe.
                </p>
            </div>
        </div>

        <div className="mt-8 text-center">
            <p className="text-sm text-textMuted">Dúvidas? <span className="text-white underline cursor-pointer">Fale com o suporte.</span></p>
        </div>
    </div>
  );
};

const FeatureItem: React.FC<{ text: string; active?: boolean }> = ({ text, active }) => (
    <div className="flex items-center gap-3 text-sm">
        <div className={`p-1 rounded-full bg-primary/20 text-primary`}>
            <Check size={14} />
        </div>
        <span className="font-medium text-zinc-300">{text}</span>
    </div>
);

export default Pricing;
