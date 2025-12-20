
import React, { useEffect, useState } from 'react';
import { PartyPopper, Check, Star, FileText, LayoutDashboard, Loader2 } from 'lucide-react';
import { Card, Button } from '../components/UI';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppRoutes } from '../types';

const CheckoutSuccess: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [verifying, setVerifying] = useState(true);

  // Simular verificação do Session ID do Stripe
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const sessionId = queryParams.get('session_id');

    if (sessionId) {
        // Simular chamada ao backend para validar a sessão
        setTimeout(() => {
            localStorage.setItem('finnova_plan', 'pro');
            setVerifying(false);
        }, 1500);
    } else {
        // Se não tiver session_id, é acesso inválido ou direto
        // Em dev, permitimos para teste, mas em prod redirecionaria
        localStorage.setItem('finnova_plan', 'pro'); // Force pro for demo
        setVerifying(false);
    }
  }, [location, navigate]);

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

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center animate-fade-in space-y-6 max-w-lg mx-auto relative z-10">
        <div className="w-24 h-24 bg-gradient-to-tr from-primary to-indigo-600 rounded-full flex items-center justify-center shadow-2xl shadow-primary/40 animate-scale-up mb-4 relative">
            <PartyPopper size={48} className="text-white relative z-10" />
            <div className="absolute inset-0 bg-white/20 rounded-full animate-ping"></div>
        </div>
        
        <div>
            <h2 className="text-3xl font-bold text-white mb-2">Pagamento Confirmado!</h2>
            <p className="text-textMuted text-lg">Bem-vindo ao clube <span className="text-primary font-bold">Reynar PRO</span>.</p>
        </div>

        <Card className="w-full text-left bg-surface/50 border-primary/30">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <Star size={18} className="text-yellow-500 fill-yellow-500" /> Recursos Desbloqueados:
            </h3>
            <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm text-textMain">
                    <div className="p-1 bg-secondary/20 rounded-full"><Check size={12} className="text-secondary" /></div>
                    Relatório IRPF Completo
                </li>
                <li className="flex items-center gap-3 text-sm text-textMain">
                    <div className="p-1 bg-secondary/20 rounded-full"><Check size={12} className="text-secondary" /></div>
                    Metas Ilimitadas
                </li>
                <li className="flex items-center gap-3 text-sm text-textMain">
                    <div className="p-1 bg-secondary/20 rounded-full"><Check size={12} className="text-secondary" /></div>
                    Suporte Prioritário
                </li>
            </ul>
        </Card>

        <div className="w-full space-y-3">
            <Button onClick={handleGoToReports} className="w-full py-4 text-lg shadow-lg shadow-primary/20">
                <FileText size={20} /> Acessar Relatórios
            </Button>
            
            <Button variant="ghost" onClick={handleGoToDashboard} className="w-full border border-surfaceHighlight text-textMuted hover:text-white">
                <LayoutDashboard size={18} /> Ir para o Início
            </Button>
        </div>
        
        {/* Confetti effect elements */}
        <div className="absolute top-10 left-10 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
        <div className="absolute top-20 right-20 w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
        <div className="absolute bottom-10 left-1/4 w-2 h-2 bg-yellow-500 rounded-full animate-ping"></div>
    </div>
  );
};

export default CheckoutSuccess;
