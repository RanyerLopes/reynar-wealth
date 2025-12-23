
import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCcw, Sparkles, Loader2 } from 'lucide-react';
import { getFinancialAdvice, FinancialContext } from '../services/geminiService';

interface AIConsultantProps {
  context?: 'general' | 'transactions' | 'bills' | 'investments' | 'goals';
  compact?: boolean;
}

// Lista de variações do Mascote (Rei)
const MASCOT_VARIANTS = [
  "https://cdn3d.iconscout.com/3d/premium/thumb/king-5692634-4742465.png",
  "/mascot-crown.png",
];

export const AIConsultant: React.FC<AIConsultantProps> = ({ context = 'general', compact = false }) => {
  const [insight, setInsight] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(true);
  const [currentMascot, setCurrentMascot] = useState(MASCOT_VARIANTS[0]);
  const [isUsingAI, setIsUsingAI] = useState(true);

  // Fallback insights (used when API fails)
  const FALLBACK_INSIGHTS = {
    general: [
      "Vossa Majestade, notei que os banquetes (Alimentação) consumiram muito ouro este mês. Sugiro cautela! 🍗",
      "Um decreto real (Conta) de alto valor vence em breve. O tesouro atual cobre a despesa, meu senhor. 📜",
      "Esplêndido! Vossa Majestade não tocou nas reservas de emergência esta semana. O reino prospera. 🏰",
    ],
    transactions: [
      "Manter os livros contábeis organizados ajuda este Conselheiro a prever o futuro da coroa. 📖",
      "Muitas carruagens (Uber) ultimamente, Majestade. Talvez suas próprias montarias sejam mais econômicas? 🐴",
    ],
    bills: [
      "Pagar o dízimo aos banqueiros evita a fúria dos Juros Rotativos, os piores dragões do reino! 🐉",
      "Dois decretos reais vencem em 3 luas. Ordenei aos guardas que preparem o saldo! ⚔️",
    ],
    investments: [
      "O segredo da riqueza do império é o tempo. Plante moedas hoje para colher barras de ouro amanhã. 🌳",
      "Não coloque todo o tesouro no mesmo baú. Diversificar protege contra dragões de mercado. 🗝️",
    ],
    goals: [
      "Para a construção do 'Castelo Disney', precisamos aumentar os tributos mensais. 🏰",
      "Pague-se primeiro, Majestade! Guarde o ouro antes de gastar com a plebe e mercadores. 💰",
    ]
  };

  // Build financial context from available data
  const buildFinancialContext = useCallback((): FinancialContext => {
    // Get data from localStorage only (no mock data fallback)
    const storedTransactions = localStorage.getItem('finnova_transactions');
    const transactions = storedTransactions
      ? JSON.parse(storedTransactions).map((t: any) => ({ ...t, date: new Date(t.date) }))
      : [];

    const storedBills = localStorage.getItem('finnova_bills');
    const bills = storedBills
      ? JSON.parse(storedBills).map((b: any) => ({ ...b, dueDate: new Date(b.dueDate) }))
      : [];

    const storedInvestments = localStorage.getItem('finnova_investments');
    const investments = storedInvestments ? JSON.parse(storedInvestments) : [];

    const storedGoals = localStorage.getItem('finnova_goals');
    const goals = storedGoals
      ? JSON.parse(storedGoals).map((g: any) => ({ ...g, deadline: new Date(g.deadline) }))
      : [];

    const income = transactions
      .filter((t: any) => t.type === 'income')
      .reduce((acc: number, t: any) => acc + t.amount, 0);

    const totalExpenses = transactions
      .filter((t: any) => t.type === 'expense')
      .reduce((acc: number, t: any) => acc + t.amount, 0);

    const expensesByCategory: Record<string, number> = {};
    transactions
      .filter((t: any) => t.type === 'expense')
      .forEach((t: any) => {
        expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
      });

    const pendingBills = bills.filter((b: any) => !b.isPaid);
    const now = new Date();
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcomingBills = pendingBills.filter((b: any) => new Date(b.dueDate) <= in7Days);

    const savingsRate = income > 0 ? ((income - totalExpenses) / income) * 100 : 0;

    return {
      income,
      totalExpenses,
      expensesByCategory,
      transactions,
      pendingBills,
      upcomingBills,
      investments,
      goals,
      savingsRate
    };
  }, []);

  const getFallbackInsight = useCallback(() => {
    const list = FALLBACK_INSIGHTS[context] || FALLBACK_INSIGHTS['general'];
    return list[Math.floor(Math.random() * list.length)];
  }, [context]);

  const fetchAIInsight = useCallback(async () => {
    setIsAiLoading(true);

    try {
      const financialContext = buildFinancialContext();
      const advice = await getFinancialAdvice(financialContext, context);
      setInsight(advice);
      setIsUsingAI(true);
    } catch (error) {
      console.error('Error fetching AI insight:', error);
      setInsight(getFallbackInsight());
      setIsUsingAI(false);
    } finally {
      setIsAiLoading(false);
    }
  }, [context, buildFinancialContext, getFallbackInsight]);

  const getRandomMascot = () => {
    return MASCOT_VARIANTS[Math.floor(Math.random() * MASCOT_VARIANTS.length)];
  };

  useEffect(() => {
    fetchAIInsight();
    setCurrentMascot(getRandomMascot());
  }, [context, fetchAIInsight]);

  const refreshInsight = () => {
    setCurrentMascot(getRandomMascot());
    fetchAIInsight();
  };

  return (
    <div className={`relative ${compact ? 'mb-4' : ''} group px-2`}>
      {/* Background Aura */}
      <div className="absolute inset-0 bg-primary/5 rounded-2xl blur-xl group-hover:bg-primary/10 transition-all duration-700"></div>

      <div className="bg-surface border border-surfaceHighlight rounded-2xl p-4 md:p-5 relative flex flex-col md:flex-row items-center md:items-start gap-6 shadow-lg overflow-visible mt-6 md:mt-0">

        {/* --- MASCOTE (O REI) --- */}
        <div className="relative shrink-0 -mt-6 md:-mt-2 md:-ml-2 transition-transform duration-500">
          {/* Glow behind mascot */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-20 bg-amber-500/30 rounded-full blur-2xl animate-pulse-slow"></div>

          {/* Character Container */}
          <div className="relative w-24 h-24 md:w-28 md:h-28 z-10 filter drop-shadow-2xl transition-all duration-500 transform hover:scale-105">
            <img
              src={currentMascot}
              alt="Rei Mascote"
              className="w-full h-full object-contain"
            />
          </div>

          {/* Pedestal Shadow */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-16 h-3 bg-black/40 blur-md rounded-full"></div>
        </div>

        {/* --- BALÃO DE FALA (Chat Bubble) --- */}
        <div className="flex-1 w-full relative pt-2">
          {/* Triangle connector for bubble */}
          <div className="hidden md:block absolute top-6 -left-2 w-4 h-4 bg-surfaceHighlight transform rotate-45 border-l border-b border-white/5"></div>
          <div className="md:hidden absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-surfaceHighlight transform rotate-45 border-l border-t border-white/5"></div>

          <div className="bg-surfaceHighlight/50 border border-white/5 rounded-xl p-4 relative backdrop-blur-sm">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2">
                <Sparkles size={12} className="text-amber-400" />
                Conselheiro Real
                {isUsingAI && !isAiLoading && (
                  <span className="text-[10px] text-primary bg-primary/20 px-1.5 py-0.5 rounded-full font-normal normal-case">IA</span>
                )}
                {isAiLoading && (
                  <span className="text-[10px] text-textMuted normal-case font-normal flex items-center gap-1">
                    <Loader2 size={10} className="animate-spin" />
                    Consultando os astros...
                  </span>
                )}
              </h4>
              <button
                onClick={refreshInsight}
                disabled={isAiLoading}
                className="text-textMuted hover:text-white transition-colors disabled:opacity-50 p-1 hover:bg-white/5 rounded-lg"
                title="Pedir outro conselho"
              >
                <RefreshCcw size={14} className={isAiLoading ? "animate-spin" : ""} />
              </button>
            </div>

            <p className="text-sm text-zinc-200 leading-relaxed font-medium italic min-h-[40px]">
              {isAiLoading ? (
                <span className="opacity-50">"Hmmm, deixe-me consultar as estrelas..."</span>
              ) : (
                `"${insight}"`
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
