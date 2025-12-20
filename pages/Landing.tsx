
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppRoutes } from '../types';
import { CheckCircle, ChevronUp, Lock, TrendingUp, FileSpreadsheet, X, Zap, Trophy, Target, FileText, Landmark, BarChart3, ChevronDown, ArrowRight, ShieldCheck, Home, PieChart, Wallet, Menu } from 'lucide-react';
import { Button, ReynarLogo } from '../components/UI';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  
  // State for the Interactive App Preview
  const [activePreview, setActivePreview] = useState<'dashboard' | 'investments' | 'goals'>('dashboard');

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const handleLogin = () => {
      navigate(AppRoutes.LOGIN);
  };

  const handleRegister = () => {
      // Pass state to tell Login page to switch to 'Register' mode
      navigate(AppRoutes.LOGIN, { state: { isRegister: true } });
  };

  const faqs = [
    { q: "Por que não usar apenas o Excel?", a: "O Excel não te avisa quando uma conta vai vencer, não lê suas notas fiscais com IA e não te dá feedback emocional (gamificação) para manter a disciplina." },
    { q: "Meus dados bancários estão seguros?", a: "Sim. Usamos criptografia de ponta a ponta. Além disso, não pedimos sua senha do banco, apenas os dados para gestão." },
    { q: "E se eu não gostar?", a: "Você tem 7 dias grátis. Se cancelar dentro desse período, não cobramos absolutamente nada." }
  ];

  return (
    <div className="min-h-screen bg-black text-gray-200 overflow-x-hidden selection:bg-purple-600 selection:text-white font-sans">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-20 flex items-center gap-3">
            <div className="bg-gradient-to-tr from-purple-900/50 to-black p-1.5 rounded-lg border border-white/10">
                <ReynarLogo size={24} />
            </div>
            <span className="font-bold text-xl tracking-tight text-white hidden md:block">Reynar Wealth</span>
            <div className="ml-auto flex items-center gap-3 md:gap-4">
                <button 
                    onClick={handleLogin}
                    className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                >
                    Entrar
                </button>
                <Button 
                    onClick={handleRegister}
                    className="!w-auto px-4 md:px-5 py-2 h-9 text-xs"
                >
                    Começar Agora
                </Button>
            </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="pt-32 pb-12 md:pb-20 px-4 md:px-6 relative overflow-hidden">
         {/* Background Glows (Centered & optimized) */}
         <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-purple-600/30 rounded-full blur-[100px] md:blur-[120px] pointer-events-none opacity-50"></div>

         <div className="max-w-4xl mx-auto text-center relative z-10 mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] md:text-xs font-medium text-purple-300 mb-6 animate-fade-in backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                </span>
                Nova IA de Leitura de Boletos Disponível
            </div>

            <h1 className="text-4xl md:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
                Quanto custa a sua <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-fuchsia-500 to-amber-400 drop-shadow-sm">
                    Paz Financeira?
                </span>
            </h1>
            
            <p className="text-base md:text-xl text-zinc-400 mb-8 max-w-xl mx-auto leading-relaxed">
                Pare de perder dinheiro. O Reynar automatiza, organiza e gamifica sua vida financeira em um único lugar seguro.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-sm mx-auto sm:max-w-none">
                <Button 
                    className="!w-full sm:!w-auto px-8 py-4 text-base h-14 shadow-[0_0_30px_rgba(168,85,247,0.4)] bg-gradient-to-r from-purple-600 to-indigo-600 border-none hover:brightness-110"
                    onClick={handleRegister}
                >
                    Criar Conta Grátis <ArrowRight size={18} className="ml-2"/>
                </Button>
                <button 
                    onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                    className="text-zinc-400 hover:text-white font-medium text-sm px-6 py-4 transition-colors"
                >
                    Ver recursos
                </button>
            </div>
         </div>

         {/* INTERACTIVE APP PREVIEW WINDOW */}
         <div className="max-w-5xl mx-auto relative perspective-1000 mt-10 md:mt-20">
            {/* The Window Frame */}
            <div className="relative bg-[#0a0a0a] border border-white/10 rounded-xl md:rounded-3xl shadow-2xl overflow-hidden group transition-all duration-700 hover:shadow-[0_0_50px_rgba(124,58,237,0.15)] ring-1 ring-white/5">
                
                {/* Window Header */}
                <div className="h-10 md:h-12 bg-white/5 border-b border-white/5 flex items-center px-4 justify-between backdrop-blur-md">
                    <div className="flex gap-1.5 md:gap-2">
                        <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-[#ff5f56]"></div>
                        <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-[#ffbd2e]"></div>
                        <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-[#27c93f]"></div>
                    </div>
                    <div className="hidden md:flex bg-black/40 px-4 py-1.5 rounded-md text-[10px] text-zinc-500 font-mono border border-white/5 items-center gap-2">
                        <Lock size={10} /> app.reynar.com/dashboard
                    </div>
                    <div className="w-10"></div>
                </div>

                {/* Simulated App Interface */}
                <div className="flex flex-col md:flex-row h-[500px] md:h-[600px]">
                    
                    {/* Fake Sidebar (Desktop) */}
                    <div className="hidden md:flex w-20 border-r border-white/5 bg-black/40 flex-col items-center py-6 gap-6">
                         <div className="p-2 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg mb-4">
                             <ReynarLogo size={20} />
                         </div>
                         {['dashboard', 'investments', 'goals'].map(tab => (
                             <button 
                                key={tab}
                                onClick={() => setActivePreview(tab as any)}
                                className={`p-3 rounded-xl transition-all ${activePreview === tab ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'text-zinc-600 hover:text-zinc-400'}`}
                             >
                                 {tab === 'dashboard' && <Home size={20} />}
                                 {tab === 'investments' && <PieChart size={20} />}
                                 {tab === 'goals' && <Target size={20} />}
                             </button>
                         ))}
                    </div>

                    {/* Fake Sidebar (Mobile) */}
                    <div className="md:hidden h-14 border-b border-white/5 bg-black/40 flex items-center justify-around px-4">
                        {['dashboard', 'investments', 'goals'].map(tab => (
                             <button 
                                key={tab}
                                onClick={() => setActivePreview(tab as any)}
                                className={`p-2 rounded-lg transition-all ${activePreview === tab ? 'bg-white/10 text-white' : 'text-zinc-600'}`}
                             >
                                 {tab === 'dashboard' && <Home size={18} />}
                                 {tab === 'investments' && <PieChart size={18} />}
                                 {tab === 'goals' && <Target size={18} />}
                             </button>
                         ))}
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 bg-[#050505] p-4 md:p-8 overflow-y-auto no-scrollbar relative">
                        
                        {/* VIEW: DASHBOARD */}
                        {activePreview === 'dashboard' && (
                            <div className="animate-fade-in space-y-4 md:space-y-6">
                                <div className="flex justify-between items-center mb-2">
                                    <div>
                                        <h3 className="text-xl md:text-2xl font-bold text-white">Olá, Alex 👋</h3>
                                        <p className="text-zinc-500 text-xs md:text-sm">Visão geral do seu império.</p>
                                    </div>
                                    <div className="hidden md:flex px-3 py-1 bg-white/5 rounded-full border border-white/10 text-xs text-zinc-400 items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                        Online
                                    </div>
                                </div>

                                {/* Cards Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                                    <div className="bg-white/5 border border-white/5 p-4 md:p-5 rounded-2xl">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 bg-green-500/20 text-green-500 rounded-lg"><TrendingUp size={16}/></div>
                                            <span className="text-xs text-zinc-400 uppercase">Receita</span>
                                        </div>
                                        <p className="text-xl md:text-2xl font-bold text-white">R$ 8.500,00</p>
                                    </div>
                                    <div className="bg-white/5 border border-white/5 p-4 md:p-5 rounded-2xl">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 bg-red-500/20 text-red-500 rounded-lg"><TrendingUp size={16} className="rotate-180"/></div>
                                            <span className="text-xs text-zinc-400 uppercase">Despesas</span>
                                        </div>
                                        <p className="text-xl md:text-2xl font-bold text-white">R$ 3.240,50</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-indigo-500/30 p-4 md:p-5 rounded-2xl">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg"><Wallet size={16}/></div>
                                            <span className="text-xs text-indigo-200 uppercase">Saldo</span>
                                        </div>
                                        <p className="text-xl md:text-2xl font-bold text-white">R$ 5.259,50</p>
                                    </div>
                                </div>

                                {/* Fake Chart */}
                                <div className="bg-white/5 border border-white/5 rounded-2xl p-4 md:p-6 h-40 md:h-48 flex items-end gap-2">
                                    {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 50, 95].map((h, i) => (
                                        <div key={i} className="flex-1 bg-gradient-to-t from-purple-900/50 to-purple-600 rounded-t-sm hover:to-purple-400 transition-all cursor-pointer group relative" style={{ height: `${h}%` }}></div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* VIEW: INVESTMENTS */}
                        {activePreview === 'investments' && (
                            <div className="animate-fade-in space-y-4 md:space-y-6">
                                <div className="flex justify-between items-center mb-2">
                                    <div>
                                        <h3 className="text-xl md:text-2xl font-bold text-white">Investimentos 📈</h3>
                                        <p className="text-zinc-500 text-xs md:text-sm">Seu dinheiro trabalhando.</p>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                     <div className="bg-white/5 border border-white/5 p-5 rounded-2xl">
                                        <span className="text-xs text-zinc-400 uppercase">Patrimônio</span>
                                        <p className="text-3xl font-bold text-white mt-1">R$ 42.500,00</p>
                                        <span className="text-xs text-emerald-500 flex items-center gap-1 mt-2">
                                            <TrendingUp size={12}/> +12.5% este ano
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {[
                                        { n: 'Bitcoin', t: 'Cripto', v: 'R$ 12.000', p: '+5%', c: 'bg-orange-500' },
                                        { n: 'Apple Inc.', t: 'Ações', v: 'R$ 8.500', p: '+2.1%', c: 'bg-zinc-500' },
                                        { n: 'Tesouro Selic', t: 'Renda Fixa', v: 'R$ 15.000', p: '+1.0%', c: 'bg-blue-500' },
                                    ].map((inv, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full ${inv.c}/20 text-white flex items-center justify-center font-bold text-[10px]`}>
                                                    {inv.n[0]}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white text-sm">{inv.n}</p>
                                                    <p className="text-[10px] text-zinc-500">{inv.t}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-mono text-sm text-white">{inv.v}</p>
                                                <p className="text-[10px] text-emerald-500">{inv.p}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* VIEW: GOALS */}
                        {activePreview === 'goals' && (
                            <div className="animate-fade-in space-y-4 md:space-y-6">
                                <div className="flex justify-between items-center mb-2">
                                    <div>
                                        <h3 className="text-xl md:text-2xl font-bold text-white">Minhas Caixinhas 🎯</h3>
                                        <p className="text-zinc-500 text-xs md:text-sm">Foco nos sonhos.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-gradient-to-br from-blue-900/40 to-black border border-blue-500/20 p-6 rounded-2xl relative overflow-hidden group hover:border-blue-500/40 transition-colors">
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="text-2xl">✈️</span>
                                            <div>
                                                <h4 className="font-bold text-white">Viagem Europa</h4>
                                                <p className="text-xs text-zinc-400">Faltam R$ 5.000</p>
                                            </div>
                                        </div>
                                        <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden mb-2">
                                            <div className="h-full bg-blue-500 w-[65%]"></div>
                                        </div>
                                        <div className="flex justify-between text-xs text-zinc-400">
                                            <span>65%</span>
                                            <span>R$ 15.000 Alvo</span>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-purple-900/40 to-black border border-purple-500/20 p-6 rounded-2xl relative overflow-hidden group hover:border-purple-500/40 transition-colors">
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="text-2xl">🚗</span>
                                            <div>
                                                <h4 className="font-bold text-white">Carro Novo</h4>
                                                <p className="text-xs text-zinc-400">Faltam R$ 30.000</p>
                                            </div>
                                        </div>
                                        <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden mb-2">
                                            <div className="h-full bg-purple-500 w-[20%]"></div>
                                        </div>
                                        <div className="flex justify-between text-xs text-zinc-400">
                                            <span>20%</span>
                                            <span>R$ 50.000 Alvo</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Footer Gradient */}
                        <div className="sticky bottom-0 left-0 w-full h-8 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none"></div>
                    </div>
                </div>
            </div>
            
            {/* Reflection */}
            <div className="absolute -bottom-10 left-0 right-0 h-40 bg-gradient-to-t from-black to-transparent z-20"></div>
         </div>
         
         <div className="text-center mt-8 animate-pulse hidden md:block">
             <p className="text-zinc-600 text-xs uppercase tracking-widest">👆 Interaja com o app</p>
         </div>
      </section>

      {/* BENTO GRID FEATURES */}
      <section id="features" className="py-16 md:py-24 px-4 md:px-6 max-w-6xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Muito mais que uma planilha</h2>
            <p className="text-zinc-400 max-w-xl mx-auto text-base md:text-lg">O Reynar não serve apenas para anotar gastos. Ele serve para multiplicar seu dinheiro usando tecnologia.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {/* Card 1: Gamification (Large) */}
            <div className="md:col-span-2 bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 md:p-8 relative overflow-hidden group hover:border-purple-500/30 transition-colors min-h-[300px] md:h-[320px]">
                <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-700">
                    <Trophy size={180} className="text-purple-500" />
                </div>
                <div className="relative z-10 h-full flex flex-col justify-end">
                    <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center mb-4 border border-purple-500/20">
                        <Trophy size={24} />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Gamificação RPG</h3>
                    <p className="text-zinc-400 text-sm max-w-md leading-relaxed">
                        Transforme a economia em um jogo viciante. Ganhe XP ao pagar contas em dia, suba de nível e desbloqueie conquistas exclusivas.
                    </p>
                </div>
            </div>

            {/* Card 2: Investments */}
            <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 md:p-8 relative overflow-hidden group hover:border-emerald-500/30 transition-colors min-h-[300px] md:h-[320px]">
                <div className="absolute top-4 right-4 text-emerald-500/20 group-hover:text-emerald-500/40 transition-colors">
                    <BarChart3 size={80} />
                </div>
                <div className="relative z-10 pt-4 flex flex-col h-full">
                    <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center mb-4 border border-emerald-500/20">
                        <TrendingUp size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Simulador de Riqueza</h3>
                    <p className="text-zinc-400 text-sm mb-4">
                        Projeção de juros compostos em tempo real. Veja quanto você terá em 20 anos.
                    </p>
                    <div className="mt-auto bg-emerald-900/20 rounded-lg p-3 border border-emerald-500/20">
                        <div className="flex justify-between items-end gap-1">
                            <div className="w-2 bg-emerald-700/50 h-4 rounded-sm"></div>
                            <div className="w-2 bg-emerald-600/50 h-6 rounded-sm"></div>
                            <div className="w-2 bg-emerald-500/50 h-10 rounded-sm"></div>
                            <div className="w-2 bg-emerald-400 h-16 rounded-sm shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Card 3: Tax Report */}
            <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 md:p-8 relative overflow-hidden group hover:border-blue-500/30 transition-colors min-h-[300px] md:h-[320px]">
                 <div className="absolute -bottom-4 -right-4 text-blue-500/10 group-hover:text-blue-500/20 transition-colors">
                    <FileText size={100} />
                </div>
                <div className="relative z-10 flex flex-col h-full">
                    <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center mb-4 border border-blue-500/20">
                        <Landmark size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Contador de Bolso</h3>
                    <p className="text-zinc-400 text-sm mb-6">
                        Relatório pronto para copiar e colar no IRPF. Separação automática de bens e despesas dedutíveis.
                    </p>
                    <div className="mt-auto flex items-center gap-2 p-3 bg-blue-900/20 rounded-lg border border-blue-500/20">
                        <FileText size={16} className="text-blue-400"/>
                        <span className="text-xs text-blue-200 truncate">relatorio_irpf_2024.csv</span>
                    </div>
                </div>
            </div>

            {/* Card 4: Goals (Large) */}
            <div className="md:col-span-2 bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 md:p-8 relative overflow-hidden group hover:border-amber-500/30 transition-colors min-h-[300px] md:h-[320px]">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Target size={150} className="text-amber-500" />
                </div>
                <div className="relative z-10 h-full flex flex-col justify-end">
                    <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center mb-4 border border-amber-500/20">
                        <Target size={24} />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Caixinhas & Metas</h3>
                    <p className="text-zinc-400 text-sm max-w-md leading-relaxed">
                        Crie caixinhas personalizadas para seus sonhos (Viagem, Carro, Casa). Acompanhe o progresso visualmente.
                    </p>
                </div>
            </div>
          </div>
      </section>

      {/* COMPARISON SECTION (APP vs EXCEL) */}
      <section className="py-24 px-4 md:px-6 border-y border-white/5 bg-zinc-900/20">
        <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-white">
                Por que migrar do Excel?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* OLD WAY (EXCEL) */}
                <div className="p-8 rounded-3xl border border-white/5 bg-black/40 grayscale opacity-60 hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-3 mb-6 text-zinc-400">
                        <FileSpreadsheet size={32} />
                        <h3 className="text-xl font-bold">O Jeito Antigo</h3>
                    </div>
                    
                    <ul className="space-y-4">
                        <li className="flex gap-3 text-zinc-500">
                            <X size={20} className="text-red-900 shrink-0" />
                            <span>Entrada manual de cada centavo.</span>
                        </li>
                        <li className="flex gap-3 text-zinc-500">
                            <X size={20} className="text-red-900 shrink-0" />
                            <span>Fórmulas que quebram facilmente.</span>
                        </li>
                        <li className="flex gap-3 text-zinc-500">
                            <X size={20} className="text-red-900 shrink-0" />
                            <span>Zero notificações de vencimento.</span>
                        </li>
                    </ul>
                </div>

                {/* NEW WAY (REYNAR) */}
                <div className="p-8 rounded-3xl border border-purple-500/30 bg-purple-900/5 relative shadow-xl shadow-purple-900/10">
                    <div className="absolute -top-3 -right-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg">
                        RECOMENDADO
                    </div>
                    
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg shadow-lg">
                            <Zap size={20} className="text-white" fill="white" />
                        </div>
                        <h3 className="text-xl font-bold text-white">O Jeito Reynar</h3>
                    </div>

                    <ul className="space-y-4">
                        <li className="flex gap-3 text-white">
                            <CheckCircle size={20} className="text-[#10b981] shrink-0" />
                            <span><strong>IA que lê fotos</strong> de boletos.</span>
                        </li>
                        <li className="flex gap-3 text-white">
                            <CheckCircle size={20} className="text-[#10b981] shrink-0" />
                            <span><strong>Relatórios IRPF</strong> automáticos.</span>
                        </li>
                        <li className="flex gap-3 text-white">
                            <CheckCircle size={20} className="text-[#10b981] shrink-0" />
                            <span>Alertas proativos no celular.</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
      </section>

      {/* ROI CALCULATOR SECTION */}
      <section className="py-24 px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center mb-10">
               <h2 className="text-3xl font-bold text-white mb-4">O App que se paga sozinho</h2>
               <p className="text-zinc-400">Baseado na economia média dos nossos usuários.</p>
          </div>

          <div className="max-w-3xl mx-auto">
              <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 md:p-12 relative overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-white/10">
                      <div className="pb-8 md:pb-0">
                          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Investimento</p>
                          <p className="text-3xl font-bold text-white mb-1">R$ 29,90</p>
                          <p className="text-[10px] text-zinc-500">Assinatura mensal</p>
                      </div>

                      <div className="py-8 md:py-0">
                          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Evitando 1 Multa</p>
                          <p className="text-3xl font-bold text-[#10b981] mb-1">R$ 15,00</p>
                          <p className="text-[10px] text-zinc-500">Economia média</p>
                      </div>

                      <div className="pt-8 md:pt-0">
                          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">1 Compra Evitada</p>
                          <p className="text-3xl font-bold text-[#10b981] mb-1">R$ 50,00</p>
                          <p className="text-[10px] text-zinc-500">Controle emocional</p>
                      </div>
                  </div>

                  <div className="mt-10 bg-zinc-900/50 rounded-xl p-6 text-center border border-white/5">
                      <p className="text-lg text-zinc-300">
                          Resultado Líquido: <span className="text-[#10b981] font-bold text-2xl ml-2">+ R$ 35,10</span> /mês no seu bolso.
                      </p>
                  </div>
              </div>
          </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="py-24 px-4 md:px-6 border-t border-white/5 bg-gradient-to-b from-black to-[#050505]">
         <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16">
             <div className="flex-1 space-y-6 text-center md:text-left">
                <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                    Um preço simples. <br/>
                    <span className="text-purple-500">Acesso ilimitado.</span>
                </h2>
                <p className="text-zinc-400 text-lg">
                    Sem taxas ocultas, sem upgrades surpresa. Você tem acesso a todas as ferramentas do Reynar por um valor menor que um lanche.
                </p>
                <ul className="space-y-3 inline-block text-left pt-4">
                    <li className="flex items-center gap-3 text-zinc-300"><ShieldCheck className="text-purple-500" size={20}/> 7 Dias de Garantia Incondicional</li>
                    <li className="flex items-center gap-3 text-zinc-300"><Lock className="text-purple-500" size={20}/> Criptografia Militar</li>
                    <li className="flex items-center gap-3 text-zinc-300"><Zap className="text-purple-500" size={20}/> Cancelamento em 1 clique</li>
                </ul>
             </div>

             <div className="flex-1 w-full max-w-md">
                 <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-b from-purple-600 via-indigo-600 to-purple-800 rounded-[30px] opacity-75 blur-md group-hover:opacity-100 transition duration-500"></div>
                    <div className="relative bg-[#050505] rounded-[28px] p-8 md:p-10 border border-white/10 shadow-2xl">
                        {/* 7 DAYS FREE BADGE */}
                        <div className="absolute -top-4 left-0 right-0 mx-auto w-fit bg-[#fbbf24] text-black text-xs font-extrabold px-4 py-1.5 rounded-full shadow-lg uppercase tracking-wide z-20">
                            7 Dias Grátis
                        </div>

                        <div className="text-center mb-8 pt-2">
                            <h3 className="text-xl font-bold text-white flex items-center justify-center gap-2 mb-4">
                                Plano Reynar PRO
                            </h3>
                            
                            {/* Billing Toggle */}
                            <div className="flex items-center justify-center gap-3 mb-6 bg-white/5 p-1 rounded-xl w-fit mx-auto">
                                <button 
                                    onClick={() => setBillingCycle('monthly')} 
                                    className={`px-3 py-1 text-xs rounded-lg transition-all ${billingCycle === 'monthly' ? 'bg-purple-600 text-white shadow' : 'text-zinc-400 hover:text-white'}`}
                                >
                                    Mensal
                                </button>
                                <button 
                                    onClick={() => setBillingCycle('yearly')} 
                                    className={`px-3 py-1 text-xs rounded-lg transition-all ${billingCycle === 'yearly' ? 'bg-purple-600 text-white shadow' : 'text-zinc-400 hover:text-white'}`}
                                >
                                    Anual (-17%)
                                </button>
                            </div>

                            <div className="flex items-baseline justify-center gap-1">
                                <span className="text-5xl font-bold text-white tracking-tight">
                                    {billingCycle === 'monthly' ? '29,90' : '299,00'}
                                </span>
                                <span className="text-lg text-textMuted">R$</span>
                            </div>
                            <p className="text-xs text-zinc-500 mt-2">
                                {billingCycle === 'monthly' ? 'Cobrado mensalmente' : 'Cobrado uma vez ao ano'}
                            </p>
                        </div>

                        <Button 
                            className="w-full h-14 text-base font-bold bg-[#7c3aed] hover:bg-[#6d28d9] text-white shadow-lg shadow-purple-900/30 animate-pulse-slow border-none mb-6"
                            onClick={handleRegister}
                        >
                            Começar Agora <ArrowRight size={18} className="ml-2"/>
                        </Button>

                        <div className="text-center">
                            <p className="text-[10px] text-zinc-600 flex items-center justify-center gap-1">
                                <Lock size={10} /> Pagamento processado com segurança pelo Stripe.
                            </p>
                        </div>
                    </div>
                </div>
             </div>
         </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-24 px-4 md:px-6 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10 text-white">Dúvidas Comuns</h2>
          <div className="space-y-3">
              {faqs.map((faq, idx) => (
                  <div key={idx} className="bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden transition-all hover:border-white/20">
                      <button 
                        onClick={() => toggleFaq(idx)}
                        className="w-full p-5 text-left flex justify-between items-center group"
                      >
                          <span className="font-medium text-zinc-300 group-hover:text-white transition-colors text-sm">{faq.q}</span>
                          {openFaqIndex === idx ? <ChevronUp size={16} className="text-purple-500" /> : <ChevronDown size={16} className="text-zinc-500" />}
                      </button>
                      {openFaqIndex === idx && (
                          <div className="px-5 pb-5 text-zinc-400 text-sm leading-relaxed animate-fade-in border-t border-white/5 pt-4">
                              {faq.a}
                          </div>
                      )}
                  </div>
              ))}
          </div>
      </section>
      
      {/* Footer */}
       <footer className="py-10 text-center text-zinc-600 text-xs border-t border-white/5 bg-black">
          <div className="flex items-center justify-center gap-2 mb-4 opacity-50">
             <ReynarLogo size={20} />
             <span className="font-bold text-zinc-500">Reynar Wealth</span>
          </div>
          <p className="mb-4">© 2024 Todos os direitos reservados.</p>
          <div className="flex justify-center gap-6 opacity-50">
              <span className="hover:text-white cursor-pointer transition-colors">Termos de Uso</span>
              <span className="hover:text-white cursor-pointer transition-colors">Privacidade</span>
              <span className="hover:text-white cursor-pointer transition-colors">Suporte</span>
          </div>
      </footer>
    </div>
  );
};

export default Landing;
