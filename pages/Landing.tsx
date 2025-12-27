
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppRoutes } from '../types';
import {
    CheckCircle, ChevronUp, Lock, TrendingUp, FileSpreadsheet, X, Zap, Trophy, Target,
    FileText, Landmark, BarChart3, ChevronDown, ArrowRight, ShieldCheck, Home, PieChart,
    Wallet, Camera, Sparkles, Receipt, Upload, CreditCard, Bell, Smartphone, LineChart,
    Users, Star, DollarSign, Percent, Shield, Clock, Globe, Download
} from 'lucide-react';
import { Button, ReynarLogo } from '../components/UI';

const Landing: React.FC = () => {
    const navigate = useNavigate();
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [activePreview, setActivePreview] = useState<'dashboard' | 'investments' | 'goals' | 'transactions' | 'budget'>('dashboard');
    const [currentFeatureTag, setCurrentFeatureTag] = useState(0);

    // Rotating feature tags
    const featureTags = [
        "🤖 IA que lê seus boletos",
        "📊 Cotações em tempo real",
        "🎮 Gamificação que engaja",
        "📱 Funciona como app nativo"
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentFeatureTag(prev => (prev + 1) % featureTags.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const toggleFaq = (index: number) => {
        setOpenFaqIndex(openFaqIndex === index ? null : index);
    };

    const handleLogin = () => {
        navigate(AppRoutes.LOGIN);
    };

    const handleRegister = () => {
        navigate(AppRoutes.LOGIN, { state: { isRegister: true } });
    };

    const faqs = [
        { q: "Como a IA lê meus comprovantes?", a: "Basta tirar uma foto do boleto ou recibo. Nossa IA (Gemini) identifica automaticamente o estabelecimento, valor e data, preenchendo tudo para você." },
        { q: "Meus dados bancários estão seguros?", a: "Sim. Usamos criptografia de ponta a ponta e armazenamento seguro no Supabase. Não pedimos sua senha do banco." },
        { q: "Posso importar meu extrato bancário?", a: "Sim! Suportamos arquivos CSV, OFX e PDF. A IA categoriza automaticamente cada transação." },
        { q: "Funciona no celular?", a: "Sim! Basta acessar pelo navegador do celular e adicionar à tela inicial. Funciona como um app nativo, inclusive offline." },
        { q: "E se eu não gostar?", a: "Você tem 7 dias grátis. Se cancelar dentro desse período, não cobramos absolutamente nada." }
    ];

    // Stats for social proof
    const stats = [
        { value: "10K+", label: "Transações rastreadas" },
        { value: "R$ 2M+", label: "Economizados" },
        { value: "4.9", label: "Avaliação média", icon: Star }
    ];

    return (
        <div className="min-h-screen bg-black text-gray-200 overflow-x-hidden selection:bg-purple-600 selection:text-white font-sans">

            {/* NAVBAR */}
            <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
                <div className="max-w-6xl mx-auto px-4 md:px-6 h-20 flex items-center gap-3">
                    <button
                        onClick={() => document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' })}
                        className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
                    >
                        <div className="bg-gradient-to-tr from-purple-900/50 to-black p-1.5 rounded-lg border border-white/10">
                            <ReynarLogo size={24} />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-white hidden md:block">Reynar Wealth</span>
                    </button>
                    <div className="ml-auto flex items-center gap-3 md:gap-4">
                        <button
                            onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                            className="text-sm font-medium text-zinc-400 hover:text-white transition-colors hidden md:block"
                        >
                            Preços
                        </button>
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
            <section id="hero" className="pt-32 pb-12 md:pb-20 px-4 md:px-6 relative overflow-hidden">
                <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-purple-600/30 rounded-full blur-[100px] md:blur-[120px] pointer-events-none opacity-50"></div>

                <div className="max-w-4xl mx-auto text-center relative z-10 mb-12">
                    {/* Rotating Feature Tag */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-purple-300 mb-6 animate-fade-in backdrop-blur-md h-8 min-w-[280px] justify-center">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                        </span>
                        <span key={currentFeatureTag} className="animate-fade-in">{featureTags[currentFeatureTag]}</span>
                    </div>

                    <h1 className="text-4xl md:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
                        Quanto custa a sua <br />
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
                            onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                        >
                            Ver Planos <ArrowRight size={18} className="ml-2" />
                        </Button>
                        <button
                            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                            className="text-zinc-400 hover:text-white font-medium text-sm px-6 py-4 transition-colors"
                        >
                            Ver recursos
                        </button>
                    </div>
                </div>

                {/* INTERACTIVE APP PREVIEW */}
                <div className="max-w-5xl mx-auto relative perspective-1000 mt-10 md:mt-20">
                    <div className="relative bg-[#0a0a0a] border border-white/10 rounded-xl md:rounded-3xl shadow-2xl overflow-hidden group transition-all duration-700 hover:shadow-[0_0_50px_rgba(124,58,237,0.15)] ring-1 ring-white/5">

                        {/* Window Header */}
                        <div className="h-10 md:h-12 bg-white/5 border-b border-white/5 flex items-center px-4 justify-between backdrop-blur-md">
                            <div className="flex gap-1.5 md:gap-2">
                                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-[#ff5f56]"></div>
                                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-[#ffbd2e]"></div>
                                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-[#27c93f]"></div>
                            </div>
                            <div className="hidden md:flex bg-black/40 px-4 py-1.5 rounded-md text-[10px] text-zinc-500 font-mono border border-white/5 items-center gap-2">
                                <Lock size={10} /> app.reynar.com
                            </div>
                            <div className="w-10"></div>
                        </div>

                        {/* App Interface */}
                        <div className="flex flex-col md:flex-row h-[500px] md:h-[550px]">

                            {/* Sidebar Desktop */}
                            <div className="hidden md:flex w-20 border-r border-white/5 bg-black/40 flex-col items-center py-6 gap-4">
                                <div className="p-2 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg mb-4">
                                    <ReynarLogo size={20} />
                                </div>
                                {[
                                    { key: 'dashboard', icon: Home },
                                    { key: 'transactions', icon: Receipt },
                                    { key: 'budget', icon: PieChart },
                                    { key: 'investments', icon: LineChart },
                                    { key: 'goals', icon: Target }
                                ].map(({ key, icon: Icon }) => (
                                    <button
                                        key={key}
                                        onClick={() => setActivePreview(key as any)}
                                        className={`p-3 rounded-xl transition-all ${activePreview === key ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'text-zinc-600 hover:text-zinc-400'}`}
                                    >
                                        <Icon size={20} />
                                    </button>
                                ))}
                            </div>

                            {/* Sidebar Mobile */}
                            <div className="md:hidden h-14 border-b border-white/5 bg-black/40 flex items-center justify-around px-2">
                                {[
                                    { key: 'dashboard', icon: Home },
                                    { key: 'transactions', icon: Receipt },
                                    { key: 'budget', icon: PieChart },
                                    { key: 'investments', icon: LineChart },
                                    { key: 'goals', icon: Target }
                                ].map(({ key, icon: Icon }) => (
                                    <button
                                        key={key}
                                        onClick={() => setActivePreview(key as any)}
                                        className={`p-2 rounded-lg transition-all ${activePreview === key ? 'bg-white/10 text-white' : 'text-zinc-600'}`}
                                    >
                                        <Icon size={16} />
                                    </button>
                                ))}
                            </div>

                            {/* Main Content Area */}
                            <div className="flex-1 bg-[#050505] p-4 md:p-8 overflow-y-auto no-scrollbar relative">

                                {/* DASHBOARD VIEW */}
                                {activePreview === 'dashboard' && (
                                    <div className="animate-fade-in space-y-4 md:space-y-6">
                                        <div className="flex justify-between items-center mb-2">
                                            <div>
                                                <h3 className="text-xl md:text-2xl font-bold text-white">Olá, Alex 👋</h3>
                                                <p className="text-zinc-500 text-xs md:text-sm">Visão geral do seu império.</p>
                                            </div>
                                            <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/20 rounded-full text-xs text-amber-400">
                                                <Trophy size={12} /> Nível 12
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                                            <div className="bg-white/5 border border-white/5 p-4 md:p-5 rounded-2xl">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="p-2 bg-green-500/20 text-green-500 rounded-lg"><TrendingUp size={16} /></div>
                                                    <span className="text-xs text-zinc-400 uppercase">Receita</span>
                                                </div>
                                                <p className="text-xl md:text-2xl font-bold text-white">R$ 8.500,00</p>
                                            </div>
                                            <div className="bg-white/5 border border-white/5 p-4 md:p-5 rounded-2xl">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="p-2 bg-red-500/20 text-red-500 rounded-lg"><TrendingUp size={16} className="rotate-180" /></div>
                                                    <span className="text-xs text-zinc-400 uppercase">Despesas</span>
                                                </div>
                                                <p className="text-xl md:text-2xl font-bold text-white">R$ 3.240,50</p>
                                            </div>
                                            <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-indigo-500/30 p-4 md:p-5 rounded-2xl">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg"><Wallet size={16} /></div>
                                                    <span className="text-xs text-indigo-200 uppercase">Saldo</span>
                                                </div>
                                                <p className="text-xl md:text-2xl font-bold text-white">R$ 5.259,50</p>
                                            </div>
                                        </div>

                                        {/* XP Bar */}
                                        <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                                            <div className="flex justify-between text-xs mb-2">
                                                <span className="text-zinc-400">Progresso do Nível</span>
                                                <span className="text-purple-400">2.450 / 3.000 XP</span>
                                            </div>
                                            <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 w-[82%]"></div>
                                            </div>
                                        </div>

                                        {/* Recent Activity & Upcoming */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {/* Recent Transactions */}
                                            <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                                                <p className="text-xs text-zinc-400 mb-3">Últimas Transações</p>
                                                <div className="space-y-2">
                                                    {[
                                                        { d: 'iFood', v: -45.90, c: 'text-white' },
                                                        { d: 'Uber', v: -23.50, c: 'text-white' },
                                                        { d: 'Pix Recebido', v: 150, c: 'text-green-500' },
                                                    ].map((t, i) => (
                                                        <div key={i} className="flex justify-between items-center">
                                                            <span className="text-xs text-zinc-300">{t.d}</span>
                                                            <span className={`text-xs font-mono ${t.c}`}>
                                                                {t.v > 0 ? '+' : ''}R$ {Math.abs(t.v).toFixed(2)}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Upcoming Bills */}
                                            <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                                                <p className="text-xs text-zinc-400 mb-3">Próximas Contas</p>
                                                <div className="space-y-2">
                                                    {[
                                                        { d: 'Conta de Luz', v: 180, days: 3 },
                                                        { d: 'Internet', v: 120, days: 7 },
                                                        { d: 'Netflix', v: 55.90, days: 12 },
                                                    ].map((b, i) => (
                                                        <div key={i} className="flex justify-between items-center">
                                                            <span className="text-xs text-zinc-300">{b.d}</span>
                                                            <span className={`text-[10px] px-2 py-0.5 rounded ${b.days <= 5 ? 'bg-red-500/20 text-red-400' : 'bg-zinc-800 text-zinc-400'}`}>
                                                                {b.days}d
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* TRANSACTIONS VIEW */}
                                {activePreview === 'transactions' && (
                                    <div className="animate-fade-in space-y-4">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h3 className="text-xl font-bold text-white">Extrato 📋</h3>
                                                <p className="text-zinc-500 text-xs">Dezembro 2024</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button className="p-2 bg-purple-500/20 text-purple-400 rounded-lg">
                                                    <Camera size={16} />
                                                </button>
                                                <button className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
                                                    <Upload size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            {[
                                                { desc: 'iFood', cat: 'Alimentação', val: -45.90, type: 'expense' },
                                                { desc: 'Salário', cat: 'Renda', val: 8500, type: 'income' },
                                                { desc: 'Uber', cat: 'Transporte', val: -23.50, type: 'expense' },
                                                { desc: 'Freela Website', cat: 'Renda Extra', val: 1500, type: 'income' },
                                                { desc: 'Netflix', cat: 'Assinaturas', val: -55.90, type: 'expense' },
                                            ].map((tx, i) => (
                                                <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === 'income' ? 'bg-green-500/20 text-green-500' : 'bg-zinc-800 text-zinc-400'}`}>
                                                            {tx.type === 'income' ? <TrendingUp size={14} /> : <TrendingUp size={14} className="rotate-180" />}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-white">{tx.desc}</p>
                                                            <p className="text-[10px] text-zinc-500">{tx.cat}</p>
                                                        </div>
                                                    </div>
                                                    <span className={`font-mono text-sm ${tx.type === 'income' ? 'text-green-500' : 'text-white'}`}>
                                                        {tx.type === 'income' ? '+' : ''} R$ {Math.abs(tx.val).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* BUDGET VIEW */}
                                {activePreview === 'budget' && (
                                    <div className="animate-fade-in space-y-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-white">Orçamentos 📊</h3>
                                            <p className="text-zinc-500 text-xs">Controle seus gastos por categoria</p>
                                        </div>

                                        <div className="space-y-3">
                                            {[
                                                { cat: 'Alimentação', spent: 850, limit: 1000, color: 'bg-orange-500' },
                                                { cat: 'Transporte', spent: 280, limit: 400, color: 'bg-blue-500' },
                                                { cat: 'Lazer', spent: 450, limit: 300, color: 'bg-red-500' },
                                                { cat: 'Assinaturas', spent: 120, limit: 200, color: 'bg-purple-500' },
                                            ].map((b, i) => (
                                                <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/5">
                                                    <div className="flex justify-between mb-2">
                                                        <span className="text-sm font-medium text-white">{b.cat}</span>
                                                        <span className={`text-xs ${b.spent > b.limit ? 'text-red-400' : 'text-zinc-400'}`}>
                                                            R$ {b.spent} / R$ {b.limit}
                                                        </span>
                                                    </div>
                                                    <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full ${b.spent > b.limit ? 'bg-red-500' : b.color}`}
                                                            style={{ width: `${Math.min((b.spent / b.limit) * 100, 100)}%` }}
                                                        ></div>
                                                    </div>
                                                    {b.spent > b.limit && (
                                                        <p className="text-[10px] text-red-400 mt-1">⚠️ Orçamento excedido!</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* INVESTMENTS VIEW */}
                                {activePreview === 'investments' && (
                                    <div className="animate-fade-in space-y-4">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h3 className="text-xl font-bold text-white">Investimentos 📈</h3>
                                                <p className="text-zinc-500 text-xs">Cotações em tempo real</p>
                                            </div>
                                        </div>

                                        <div className="bg-gradient-to-br from-emerald-900/30 to-black border border-emerald-500/20 p-5 rounded-2xl">
                                            <span className="text-xs text-zinc-400 uppercase">Patrimônio Total</span>
                                            <p className="text-3xl font-bold text-white mt-1">R$ 42.580,00</p>
                                            <span className="text-xs text-emerald-500 flex items-center gap-1 mt-2">
                                                <TrendingUp size={12} /> +12.5% este ano
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            {[
                                                { t: 'Selic', v: '12.25%', d: 'a.a.' },
                                                { t: 'IPCA', v: '4.87%', d: '12m' },
                                                { t: 'CDI', v: '12.15%', d: 'a.a.' },
                                                { t: 'Poupança', v: '7.09%', d: 'a.a.' },
                                            ].map((ind, i) => (
                                                <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/5 text-center">
                                                    <span className="text-[10px] text-zinc-500">{ind.t}</span>
                                                    <p className="text-lg font-bold text-white">{ind.v}</p>
                                                    <span className="text-[10px] text-zinc-600">{ind.d}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="space-y-2">
                                            {[
                                                { n: 'PETR4', t: 'Ações', v: 'R$ 8.200', p: '+3.2%' },
                                                { n: 'BTC', t: 'Cripto', v: 'R$ 12.000', p: '+5.1%' },
                                                { n: 'XPLG11', t: 'FII', v: 'R$ 5.500', p: '+1.8%' },
                                            ].map((inv, i) => (
                                                <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-[10px]">
                                                            {inv.n.slice(0, 2)}
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

                                {/* GOALS VIEW */}
                                {activePreview === 'goals' && (
                                    <div className="animate-fade-in space-y-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-white">Metas 🎯</h3>
                                            <p className="text-zinc-500 text-xs">Suas caixinhas de sonhos</p>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="bg-gradient-to-br from-blue-900/40 to-black border border-blue-500/20 p-4 rounded-2xl">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <span className="text-xl">✈️</span>
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-white text-sm">Viagem Europa</h4>
                                                        <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
                                                            <span>R$ 10.000</span>
                                                            <span>R$ 15.000</span>
                                                        </div>
                                                        <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden mt-1">
                                                            <div className="h-full bg-blue-500 w-[65%]"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-gradient-to-br from-purple-900/40 to-black border border-purple-500/20 p-4 rounded-2xl">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <span className="text-xl">🚗</span>
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-white text-sm">Carro Novo</h4>
                                                        <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
                                                            <span>R$ 10.000</span>
                                                            <span>R$ 50.000</span>
                                                        </div>
                                                        <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden mt-1">
                                                            <div className="h-full bg-purple-500 w-[20%]"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-gradient-to-br from-emerald-900/40 to-black border border-emerald-500/20 p-4 rounded-2xl">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <span className="text-xl">📱</span>
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-white text-sm">iPhone 16</h4>
                                                        <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
                                                            <span>R$ 6.000</span>
                                                            <span>R$ 8.000</span>
                                                        </div>
                                                        <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden mt-1">
                                                            <div className="h-full bg-emerald-500 w-[75%]"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Stats summary */}
                                        <div className="grid grid-cols-3 gap-2 mt-4">
                                            <div className="bg-white/5 p-3 rounded-xl text-center">
                                                <p className="text-lg font-bold text-white">3</p>
                                                <p className="text-[10px] text-zinc-500">Metas Ativas</p>
                                            </div>
                                            <div className="bg-white/5 p-3 rounded-xl text-center">
                                                <p className="text-lg font-bold text-emerald-500">R$ 26K</p>
                                                <p className="text-[10px] text-zinc-500">Guardado</p>
                                            </div>
                                            <div className="bg-white/5 p-3 rounded-xl text-center">
                                                <p className="text-lg font-bold text-amber-400">53%</p>
                                                <p className="text-[10px] text-zinc-500">Média</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="sticky bottom-0 left-0 w-full h-8 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none"></div>
                            </div>
                        </div>
                    </div>

                    <div className="absolute -bottom-10 left-0 right-0 h-40 bg-gradient-to-t from-black to-transparent z-20"></div>
                </div>


            </section>

            {/* SOCIAL PROOF STATS */}
            <section className="py-12 px-4 border-y border-white/5 bg-zinc-900/30">
                <div className="max-w-4xl mx-auto grid grid-cols-3 gap-4 text-center">
                    {stats.map((stat, i) => (
                        <div key={i} className="p-4">
                            <div className="flex items-center justify-center gap-1 mb-1">
                                {stat.icon && <stat.icon size={16} className="text-amber-500" fill="currentColor" />}
                                <span className="text-2xl md:text-3xl font-bold text-white">{stat.value}</span>
                            </div>
                            <p className="text-xs text-zinc-500">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section className="py-20 px-4 md:px-6 max-w-5xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Como Funciona</h2>
                    <p className="text-zinc-400">3 passos para assumir o controle</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        {
                            step: '01',
                            icon: Upload,
                            title: 'Conecte',
                            desc: 'Importe extratos bancários ou escaneie comprovantes com IA. Suporte para CSV, OFX e PDF.',
                            color: 'from-blue-600 to-cyan-600'
                        },
                        {
                            step: '02',
                            icon: Sparkles,
                            title: 'Organize',
                            desc: 'A IA categoriza automaticamente. Defina orçamentos e acompanhe cada centavo.',
                            color: 'from-purple-600 to-pink-600'
                        },
                        {
                            step: '03',
                            icon: TrendingUp,
                            title: 'Cresça',
                            desc: 'Acompanhe investimentos, bata metas e ganhe XP por cada conquista financeira.',
                            color: 'from-emerald-600 to-teal-600'
                        }
                    ].map((item, i) => (
                        <div key={i} className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity" style={{ backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }}></div>
                            <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 h-full hover:border-white/20 transition-all">
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-6 shadow-lg`}>
                                    <item.icon size={24} className="text-white" />
                                </div>
                                <span className="text-zinc-600 text-xs font-medium">PASSO {item.step}</span>
                                <h3 className="text-xl font-bold text-white mt-2 mb-3">{item.title}</h3>
                                <p className="text-zinc-400 text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* BENTO GRID FEATURES */}
            <section id="features" className="py-16 md:py-24 px-4 md:px-6 max-w-6xl mx-auto">
                <div className="text-center mb-12 md:mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Recursos Poderosos</h2>
                    <p className="text-zinc-400 max-w-xl mx-auto text-base md:text-lg">Tecnologia de ponta para simplificar sua vida financeira.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">

                    {/* AI Scanner (Large) */}
                    <div className="md:col-span-2 bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 md:p-8 relative overflow-hidden group hover:border-purple-500/30 transition-colors min-h-[280px]">
                        <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Camera size={120} className="text-purple-500" />
                        </div>
                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-10 h-10 bg-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center border border-purple-500/20">
                                    <Camera size={20} />
                                </div>
                                <div className="px-2 py-0.5 bg-purple-500/20 rounded-full text-[10px] text-purple-300 font-medium">
                                    GEMINI AI
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Scanner Inteligente</h3>
                            <p className="text-zinc-400 text-sm max-w-md leading-relaxed mb-4">
                                Fotografe boletos e comprovantes. A IA extrai automaticamente estabelecimento, valor e data.
                            </p>
                            <div className="mt-auto flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                                <div className="w-10 h-10 bg-green-500/20 text-green-500 rounded-lg flex items-center justify-center">
                                    <CheckCircle size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-white font-medium">Mercado Livre</p>
                                    <p className="text-[10px] text-zinc-500">R$ 156,90 • Detectado automaticamente</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Gamification */}
                    <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 md:p-8 relative overflow-hidden group hover:border-amber-500/30 transition-colors min-h-[280px]">
                        <div className="absolute -bottom-4 -right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Trophy size={100} className="text-amber-500" />
                        </div>
                        <div className="relative z-10 flex flex-col h-full">
                            <div className="w-10 h-10 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center mb-4 border border-amber-500/20">
                                <Trophy size={20} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Gamificação RPG</h3>
                            <p className="text-zinc-400 text-sm mb-4">
                                Ganhe XP ao pagar contas. Suba de nível e desbloqueie conquistas.
                            </p>
                            <div className="mt-auto space-y-2">
                                <div className="flex items-center gap-2 text-xs">
                                    <Star size={12} className="text-amber-500" fill="currentColor" />
                                    <span className="text-zinc-400">+ 50 XP por boleto pago</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                    <Star size={12} className="text-amber-500" fill="currentColor" />
                                    <span className="text-zinc-400">+ 100 XP por meta batida</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Import */}
                    <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 md:p-8 relative overflow-hidden group hover:border-blue-500/30 transition-colors min-h-[280px]">
                        <div className="relative z-10 flex flex-col h-full">
                            <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center mb-4 border border-blue-500/20">
                                <FileSpreadsheet size={20} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Importação Fácil</h3>
                            <p className="text-zinc-400 text-sm mb-4">
                                Importe extratos do seu banco. Suportamos os principais formatos.
                            </p>
                            <div className="mt-auto flex gap-2">
                                <span className="px-2 py-1 bg-white/5 rounded text-[10px] text-zinc-400 border border-white/10">CSV</span>
                                <span className="px-2 py-1 bg-white/5 rounded text-[10px] text-zinc-400 border border-white/10">OFX</span>
                                <span className="px-2 py-1 bg-white/5 rounded text-[10px] text-zinc-400 border border-white/10">PDF</span>
                            </div>
                        </div>
                    </div>

                    {/* Investments (Large) */}
                    <div className="md:col-span-2 bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 md:p-8 relative overflow-hidden group hover:border-emerald-500/30 transition-colors min-h-[280px]">
                        <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <LineChart size={100} className="text-emerald-500" />
                        </div>
                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center border border-emerald-500/20">
                                    <TrendingUp size={20} />
                                </div>
                                <div className="px-2 py-0.5 bg-emerald-500/20 rounded-full text-[10px] text-emerald-300 font-medium">
                                    TEMPO REAL
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Carteira de Investimentos</h3>
                            <p className="text-zinc-400 text-sm max-w-md leading-relaxed mb-4">
                                Acompanhe ações, FIIs, cripto e renda fixa. Cotações em tempo real via BRAPI.
                            </p>
                            <div className="mt-auto grid grid-cols-4 gap-2">
                                {['Ações', 'FIIs', 'Cripto', 'Renda Fixa'].map(tipo => (
                                    <div key={tipo} className="p-2 bg-white/5 rounded-lg text-center border border-white/5">
                                        <span className="text-[10px] text-zinc-400">{tipo}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Budget */}
                    <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 md:p-8 relative overflow-hidden group hover:border-orange-500/30 transition-colors min-h-[280px]">
                        <div className="relative z-10 flex flex-col h-full">
                            <div className="w-10 h-10 bg-orange-500/20 text-orange-400 rounded-xl flex items-center justify-center mb-4 border border-orange-500/20">
                                <PieChart size={20} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Orçamentos</h3>
                            <p className="text-zinc-400 text-sm mb-4">
                                Defina limites por categoria e receba alertas antes de estourar.
                            </p>
                            <div className="mt-auto space-y-2">
                                <div>
                                    <div className="flex justify-between text-[10px] mb-1">
                                        <span className="text-zinc-400">Alimentação</span>
                                        <span className="text-zinc-500">85%</span>
                                    </div>
                                    <div className="h-1.5 bg-black/40 rounded-full">
                                        <div className="h-full bg-orange-500 rounded-full w-[85%]"></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-[10px] mb-1">
                                        <span className="text-zinc-400">Transporte</span>
                                        <span className="text-zinc-500">40%</span>
                                    </div>
                                    <div className="h-1.5 bg-black/40 rounded-full">
                                        <div className="h-full bg-blue-500 rounded-full w-[40%]"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Goals */}
                    <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 md:p-8 relative overflow-hidden group hover:border-pink-500/30 transition-colors min-h-[280px]">
                        <div className="relative z-10 flex flex-col h-full">
                            <div className="w-10 h-10 bg-pink-500/20 text-pink-400 rounded-xl flex items-center justify-center mb-4 border border-pink-500/20">
                                <Target size={20} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Metas & Caixinhas</h3>
                            <p className="text-zinc-400 text-sm mb-4">
                                Crie caixinhas para seus sonhos e acompanhe o progresso visual.
                            </p>
                            <div className="mt-auto flex gap-2">
                                <span className="text-xl">✈️</span>
                                <span className="text-xl">🚗</span>
                                <span className="text-xl">🏠</span>
                                <span className="text-xl">📱</span>
                            </div>
                        </div>
                    </div>

                    {/* Bills */}
                    <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 md:p-8 relative overflow-hidden group hover:border-red-500/30 transition-colors min-h-[280px]">
                        <div className="relative z-10 flex flex-col h-full">
                            <div className="w-10 h-10 bg-red-500/20 text-red-400 rounded-xl flex items-center justify-center mb-4 border border-red-500/20">
                                <Bell size={20} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Contas a Pagar</h3>
                            <p className="text-zinc-400 text-sm mb-4">
                                Cadastre contas recorrentes e nunca mais pague multa por atraso.
                            </p>
                            <div className="mt-auto flex items-center gap-2 p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                                <Clock size={14} className="text-red-400" />
                                <span className="text-[10px] text-red-300">Conta de Luz vence em 3 dias</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* COMPARISON SECTION */}
            <section className="py-24 px-4 md:px-6 border-y border-white/5 bg-zinc-900/20">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-white">
                        Por que migrar do Excel?
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        {/* OLD WAY */}
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
                                <li className="flex gap-3 text-zinc-500">
                                    <X size={20} className="text-red-900 shrink-0" />
                                    <span>Sem gamificação ou motivação.</span>
                                </li>
                            </ul>
                        </div>

                        {/* NEW WAY */}
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
                                    <span><strong>Importa extratos</strong> CSV, OFX, PDF.</span>
                                </li>
                                <li className="flex gap-3 text-white">
                                    <CheckCircle size={20} className="text-[#10b981] shrink-0" />
                                    <span>Alertas de <strong>vencimento</strong> no celular.</span>
                                </li>
                                <li className="flex gap-3 text-white">
                                    <CheckCircle size={20} className="text-[#10b981] shrink-0" />
                                    <span><strong>Gamificação</strong> que vicia em economizar.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* ROI CALCULATOR */}
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

            {/* PRICING */}
            <section id="pricing" className="py-24 px-4 md:px-6 border-t border-white/5 bg-gradient-to-b from-black to-[#050505]">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
                            Escolha seu <span className="text-purple-500">Plano</span>
                        </h2>
                        <p className="text-zinc-400 text-lg max-w-xl mx-auto">
                            Sem taxas ocultas. Cancele quando quiser.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                        {/* PLUS PLAN */}
                        <div className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-b from-purple-500/50 to-violet-600/50 rounded-[26px] opacity-50 group-hover:opacity-75 transition duration-500"></div>
                            <div className="relative bg-[#050505] rounded-[24px] p-6 md:p-8 border border-white/10 shadow-2xl h-full flex flex-col">
                                <div className="text-center mb-6">
                                    <div className="inline-flex items-center gap-2 bg-purple-500/10 text-purple-400 px-3 py-1 rounded-full text-sm font-medium mb-4">
                                        ⭐ Plus
                                    </div>
                                    <div className="flex items-baseline justify-center gap-1">
                                        <span className="text-4xl font-bold text-white">14,90</span>
                                        <span className="text-zinc-500">R$/mês</span>
                                    </div>
                                    <p className="text-xs text-zinc-500 mt-2">Ideal para uso pessoal</p>
                                </div>

                                <div className="space-y-3 mb-6 flex-1 text-sm">
                                    <div className="flex items-center gap-2 text-zinc-300"><CheckCircle size={14} className="text-purple-500" /> 200 importações/mês</div>
                                    <div className="flex items-center gap-2 text-zinc-300"><CheckCircle size={14} className="text-purple-500" /> 50 scans OCR/mês</div>
                                    <div className="flex items-center gap-2 text-zinc-300"><CheckCircle size={14} className="text-purple-500" /> 10 metas financeiras</div>
                                    <div className="flex items-center gap-2 text-zinc-300"><CheckCircle size={14} className="text-purple-500" /> Categorização com IA</div>
                                    <div className="flex items-center gap-2 text-zinc-300"><CheckCircle size={14} className="text-purple-500" /> Exportar Excel/PDF</div>
                                </div>

                                <Button
                                    variant="secondary"
                                    className="w-full h-12"
                                    onClick={handleRegister}
                                >
                                    Assinar Plus <ArrowRight size={16} />
                                </Button>
                            </div>
                        </div>

                        {/* PRO PLAN */}
                        <div className="relative group">
                            <div className="absolute -top-4 left-0 right-0 mx-auto w-fit bg-amber-400 text-black text-xs font-extrabold px-4 py-1.5 rounded-full shadow-lg uppercase tracking-wide z-20">
                                Mais Popular
                            </div>
                            <div className="absolute -inset-1 bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 rounded-[30px] opacity-75 group-hover:opacity-100 transition duration-500"></div>
                            <div className="relative bg-[#050505] rounded-[28px] p-6 md:p-8 border border-amber-400/30 shadow-2xl h-full flex flex-col">
                                <div className="text-center mb-6 pt-2">
                                    <div className="inline-flex items-center gap-2 bg-amber-400/10 text-amber-400 px-3 py-1 rounded-full text-sm font-medium mb-4">
                                        👑 Pro
                                    </div>
                                    <div className="flex items-baseline justify-center gap-1">
                                        <span className="text-4xl font-bold text-white">29,90</span>
                                        <span className="text-zinc-500">R$/mês</span>
                                    </div>
                                    <p className="text-xs text-zinc-500 mt-2">Para quem quer o máximo</p>
                                </div>

                                <div className="space-y-3 mb-6 flex-1 text-sm">
                                    <div className="flex items-center gap-2 text-white font-medium"><CheckCircle size={14} className="text-amber-400" /> Importações ilimitadas</div>
                                    <div className="flex items-center gap-2 text-white font-medium"><CheckCircle size={14} className="text-amber-400" /> Scans OCR ilimitados</div>
                                    <div className="flex items-center gap-2 text-white font-medium"><CheckCircle size={14} className="text-amber-400" /> Metas ilimitadas</div>
                                    <div className="flex items-center gap-2 text-zinc-300"><CheckCircle size={14} className="text-amber-400" /> Categorização com IA</div>
                                    <div className="flex items-center gap-2 text-zinc-300"><CheckCircle size={14} className="text-amber-400" /> Relatórios históricos</div>
                                    <div className="flex items-center gap-2 text-zinc-300"><CheckCircle size={14} className="text-amber-400" /> Multi-moedas</div>
                                    <div className="flex items-center gap-2 text-zinc-300"><CheckCircle size={14} className="text-amber-400" /> Suporte prioritário</div>
                                </div>

                                <Button
                                    className="w-full h-12 bg-amber-400 hover:bg-amber-500 text-black font-bold border-none shadow-lg shadow-amber-400/20"
                                    onClick={handleRegister}
                                >
                                    Assinar Pro 👑
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="text-center mt-8 space-y-3">
                        <p className="text-[10px] text-zinc-600 flex items-center justify-center gap-1">
                            <Lock size={10} /> Pagamento processado com segurança pelo Stripe.
                        </p>
                        <div className="flex items-center justify-center gap-6 text-xs text-zinc-500">
                            <span className="flex items-center gap-1"><ShieldCheck size={12} /> 7 dias de garantia</span>
                            <span className="flex items-center gap-1"><Zap size={12} /> Cancele quando quiser</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ */}
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
