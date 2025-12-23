
import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend, AreaChart, Area } from 'recharts';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Calendar, AlertTriangle, ChevronRight, Eye, EyeOff, Trophy, Target, AlertCircle, X, Zap, Star, Lock, BarChart3, Activity } from 'lucide-react';
import { Card, Badge, triggerCoinExplosion } from '../components/UI';
import { NOBILITY_TITLES } from '../services/mockData';
import { useGamification } from '../context/GamificationContext';
import { format, isPast, isToday, addDays, startOfMonth, endOfMonth, subMonths, getMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { AppRoutes } from '../types';
import { AIConsultant } from '../components/AIConsultant';
import { Onboarding, useOnboarding } from '../components/Onboarding';
import { useAuth } from '../context/AuthContext';
import { useTransactions, useBills, useInvestments } from '../hooks/useDatabase';

// Brighter, Neon Pastel Colors for High Contrast & Modern Look
const COLORS = ['#c084fc', '#34d399', '#facc15', '#f87171', '#60a5fa'];

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    // Get Real Gamification Data
    const { user: gamificationUser, achievements } = useGamification();
    // User from Auth
    const { user: authUser } = useAuth();
    // Database hooks
    const { transactions } = useTransactions();
    const { bills } = useBills();
    const { investments } = useInvestments();

    // Onboarding for new users
    const { showOnboarding, completeOnboarding } = useOnboarding();

    // Modal State for Gamification
    const [isGamificationModalOpen, setIsGamificationModalOpen] = useState(false);

    // Chart Type State
    const [chartType, setChartType] = useState<'bar' | 'area'>('bar');

    // Privacy State
    const [isPrivacyMode, setIsPrivacyMode] = useState(false);

    // User Data State - prefer auth user, then localStorage, then default
    const getUserName = () => {
        // From Supabase auth (Google login provides full_name)
        if (authUser?.user_metadata?.full_name) {
            return authUser.user_metadata.full_name;
        }
        // From Supabase auth (email as fallback)
        if (authUser?.email) {
            return authUser.email.split('@')[0];
        }
        // From localStorage
        const storedName = localStorage.getItem('finnova_user_name');
        if (storedName) return storedName;
        // Default
        return 'Usuário';
    };

    const userName = getUserName();
    const storedSalary = localStorage.getItem('finnova_user_salary');
    const userSalary = storedSalary || '0';

    // Retrieve Spending Limit from Settings
    const spendingLimitPercent = parseInt(localStorage.getItem('finnova_spending_limit') || '70');

    // Budget Logic - use real transactions
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
    const remainingBalance = totalIncome - totalExpenses;

    // Total patrimony from investments
    const totalPatrimony = investments.reduce((acc, curr) => acc + curr.currentValue, 0);

    // Budget Calculations
    const baseIncome = userSalary ? parseFloat(userSalary) : totalIncome;
    const maxAllowedExpense = baseIncome * (spendingLimitPercent / 100);

    const currentExpensePercent = maxAllowedExpense > 0 ? (totalExpenses / maxAllowedExpense) * 100 : 0;
    const isOverBudget = totalExpenses > maxAllowedExpense && maxAllowedExpense > 0;

    // Bills Logic for Dashboard Alert - use real bills
    const urgentBills = bills.filter(b => !b.isPaid && (isPast(b.dueDate) || isToday(b.dueDate) || b.dueDate <= addDays(new Date(), 3)));

    // Generate chart data from real transactions (last 6 months)
    const chartData = useMemo(() => {
        const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const data: { name: string; income: number; expense: number }[] = [];

        for (let i = 5; i >= 0; i--) {
            const date = subMonths(new Date(), i);
            const monthStart = startOfMonth(date);
            const monthEnd = endOfMonth(date);

            const monthIncome = transactions
                .filter(t => t.type === 'income' && new Date(t.date) >= monthStart && new Date(t.date) <= monthEnd)
                .reduce((acc, t) => acc + t.amount, 0);

            const monthExpense = transactions
                .filter(t => t.type === 'expense' && new Date(t.date) >= monthStart && new Date(t.date) <= monthEnd)
                .reduce((acc, t) => acc + t.amount, 0);

            data.push({
                name: months[getMonth(date)],
                income: monthIncome,
                expense: monthExpense
            });
        }

        return data;
    }, [transactions]);

    // Expense breakdown by category
    const expenseByCategory = useMemo(() => {
        const categories: { [key: string]: number } = {};
        transactions
            .filter(t => t.type === 'expense')
            .forEach(t => {
                const cat = t.category || 'Outros';
                categories[cat] = (categories[cat] || 0) + t.amount;
            });

        return Object.entries(categories)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
    }, [transactions]);

    const totalExpensesByCategory = expenseByCategory.reduce((acc, c) => acc + c.value, 0);

    // Level Logic from Context
    const currentLevel = gamificationUser.level || 1;
    const currentXp = gamificationUser.currentXp || 0;
    const nextLevelXp = gamificationUser.nextLevelXp || 1000;
    const xpPercentage = Math.min((currentXp / nextLevelXp) * 100, 100);

    // Determine Title based on Level
    const currentTitle = NOBILITY_TITLES.reduce((prev, curr) => {
        return (currentLevel >= curr.level) ? curr : prev;
    }, NOBILITY_TITLES[0]);

    const togglePrivacy = () => setIsPrivacyMode(!isPrivacyMode);

    const formatCurrency = (val: number) => {
        return isPrivacyMode ? 'R$ •••••' : `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    };


    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 rounded-lg shadow-xl border border-zinc-200">
                    <p className="text-zinc-500 text-xs mb-1">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} className="text-zinc-900 font-bold text-sm flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
                            {entry.name}: R$ {entry.value.toLocaleString('pt-BR')}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <>
            {/* Onboarding for new users */}
            {showOnboarding && <Onboarding onComplete={completeOnboarding} />}

            <div className="space-y-6 pb-20 md:pb-0 animate-fade-in relative">
                {/* Header */}
                <header className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-textMain tracking-tight">Olá, {userName.split(' ')[0]}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-textMuted capitalize">
                                {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-3 items-center">
                        <button onClick={togglePrivacy} className="p-2.5 rounded-full bg-surface border border-surfaceHighlight text-textMuted hover:text-white transition-colors active:scale-95">
                            {isPrivacyMode ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                        <div
                            onClick={() => setIsGamificationModalOpen(true)}
                            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-surfaceHighlight border border-surfaceHighlight cursor-pointer hover:border-primary/50 transition-colors"
                        >
                            <div className="w-5 h-5 rounded-full bg-amber-400 text-black flex items-center justify-center text-[10px] font-bold">
                                {currentLevel}
                            </div>
                            <div className="w-20 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" style={{ width: `${xpPercentage}%` }}></div>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Gamification Widget (Simplified for Mobile) */}
                    <div
                        onClick={() => setIsGamificationModalOpen(true)}
                        className="md:hidden bg-gradient-to-r from-indigo-900/40 to-surface border border-indigo-500/20 rounded-xl p-3 flex items-center gap-3 relative overflow-hidden group cursor-pointer active:scale-[0.98]"
                    >
                        <div className="p-2 bg-indigo-500/20 rounded-full text-indigo-400">
                            <Trophy size={18} />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between text-xs mb-1">
                                <span className="font-bold text-white">{currentTitle.title}</span>
                                <span className="text-indigo-300 font-mono">{currentXp}/{nextLevelXp} XP</span>
                            </div>
                            <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" style={{ width: `${xpPercentage}%` }}></div>
                            </div>
                        </div>
                    </div>

                    {/* AI CONSULTANT WIDGET */}
                    <div className="md:col-span-2">
                        <AIConsultant context="general" />
                    </div>
                </div>

                {/* GAMIFICATION MODAL (The Hub) */}
                {isGamificationModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/80 backdrop-blur-md p-0 md:p-4 animate-fade-in">
                        <div className="bg-surface w-full max-w-2xl rounded-t-2xl md:rounded-2xl border border-surfaceHighlight shadow-2xl animate-slide-up max-h-[90vh] flex flex-col">

                            {/* Header */}
                            <div className="p-6 border-b border-surfaceHighlight flex justify-between items-center bg-gradient-to-r from-indigo-900/20 to-purple-900/20 rounded-t-2xl">
                                <div>
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                        <Trophy size={20} className="text-amber-400" /> Sala do Trono
                                    </h3>
                                    <p className="text-xs text-textMuted">Suas conquistas e progresso no reino.</p>
                                </div>
                                <button onClick={() => setIsGamificationModalOpen(false)} className="text-textMuted hover:text-white bg-black/20 rounded-full p-1"><X size={20} /></button>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">

                                {/* Level Progress Section */}
                                <div className="text-center">
                                    <div className="w-24 h-24 mx-auto bg-gradient-to-tr from-amber-400 to-orange-600 rounded-full flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(251,191,36,0.4)] mb-3 animate-float border-4 border-black relative">
                                        {currentTitle.icon}
                                        <div className="absolute -bottom-2 bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-surfaceHighlight">
                                            Nível {currentLevel}
                                        </div>
                                    </div>
                                    <h2 className="text-2xl font-bold text-white">{currentTitle.title}</h2>
                                    <p className="text-sm text-textMuted mb-4">Você está a {nextLevelXp - currentXp} XP do próximo título.</p>

                                    <div className="w-full max-w-md mx-auto bg-surfaceHighlight rounded-full h-4 overflow-hidden relative border border-white/5">
                                        <div
                                            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500 transition-all duration-1000"
                                            style={{ width: `${xpPercentage}%` }}
                                        >
                                            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                        </div>
                                    </div>
                                    <p className="text-xs text-textMuted mt-2 font-mono">{currentXp} / {nextLevelXp} XP</p>
                                </div>

                                {/* How to Earn XP */}
                                <div className="bg-surfaceHighlight/30 border border-surfaceHighlight rounded-xl p-4">
                                    <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                                        <Zap size={16} className="text-yellow-400" /> Como ganhar XP?
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="flex justify-between text-sm p-2 bg-surface rounded-lg">
                                            <span className="text-textMuted">Registrar Transação</span>
                                            <span className="text-secondary font-bold">+15 XP</span>
                                        </div>
                                        <div className="flex justify-between text-sm p-2 bg-surface rounded-lg">
                                            <span className="text-textMuted">Adicionar Meta</span>
                                            <span className="text-secondary font-bold">+20 XP</span>
                                        </div>
                                        <div className="flex justify-between text-sm p-2 bg-surface rounded-lg">
                                            <span className="text-textMuted">Pagar Conta em Dia</span>
                                            <span className="text-secondary font-bold">+50 XP</span>
                                        </div>
                                        <div className="flex justify-between text-sm p-2 bg-surface rounded-lg">
                                            <span className="text-textMuted">Novo Investimento</span>
                                            <span className="text-secondary font-bold">+30 XP</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Achievements Grid */}
                                <div>
                                    <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                                        <Star size={16} className="text-purple-400" /> Galeria de Medalhas
                                    </h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        {achievements.map((ach) => (
                                            <div
                                                key={ach.id}
                                                className={`
                                        relative p-4 rounded-xl border flex flex-col items-center text-center gap-2 transition-all duration-300 group
                                        ${ach.isUnlocked
                                                        ? 'bg-gradient-to-br from-surface to-purple-900/20 border-purple-500/30 shadow-lg shadow-purple-900/20'
                                                        : 'bg-surface border-surfaceHighlight opacity-60 grayscale hover:opacity-100 hover:grayscale-0'
                                                    }
                                    `}
                                            >
                                                <div className={`text-3xl transition-transform group-hover:scale-110 ${ach.isUnlocked ? 'animate-bounce-short' : ''}`}>
                                                    {ach.icon}
                                                </div>

                                                {!ach.isUnlocked && (
                                                    <div className="absolute top-2 right-2 text-textMuted">
                                                        <Lock size={12} />
                                                    </div>
                                                )}

                                                <div>
                                                    <p className={`text-xs font-bold leading-tight ${ach.isUnlocked ? 'text-white' : 'text-textMuted'}`}>
                                                        {ach.title}
                                                    </p>
                                                    <p className="text-[9px] text-textMuted mt-1 leading-tight">
                                                        {ach.description}
                                                    </p>
                                                </div>

                                                {/* XP Reward Badge */}
                                                <div className="mt-auto pt-2">
                                                    <span className={`text-[9px] px-1.5 py-0.5 rounded border ${ach.isUnlocked ? 'bg-amber-400/10 text-amber-400 border-amber-400/30' : 'bg-zinc-800 text-zinc-500 border-zinc-700'}`}>
                                                        +{ach.xpReward} XP
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                )}

                {/* Bill Alerts Widget */}
                {urgentBills.length > 0 && (
                    <div
                        onClick={() => navigate(AppRoutes.BILLS)}
                        className="bg-danger/10 border border-danger/20 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-danger/15 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-danger text-white rounded-lg animate-pulse shadow-lg shadow-danger/20">
                                <AlertTriangle size={20} />
                            </div>
                            <div>
                                <h4 className="text-white font-semibold text-sm">Contas Vencendo</h4>
                                <p className="text-danger/80 text-xs mt-0.5">Você tem {urgentBills.length} conta(s) precisando de atenção.</p>
                            </div>
                        </div>
                        <ChevronRight className="text-danger/50" size={20} />
                    </div>
                )}

                {/* HORIZONTAL SCROLL SNAP CAROUSEL */}
                <div className="flex overflow-x-auto gap-4 pb-4 -mx-4 px-4 snap-x snap-mandatory md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-visible md:pb-0 md:mx-0 md:px-0 no-scrollbar">
                    {/* Income Card */}
                    <div className="snap-center shrink-0 w-[85%] md:w-auto">
                        <Card className="h-full cursor-pointer" onClick={(e) => triggerCoinExplosion(e.clientX, e.clientY)}>
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-2.5 bg-secondary/10 rounded-xl text-secondary border border-secondary/20">
                                    <ArrowUpRight size={22} />
                                </div>
                            </div>
                            <p className="text-textMuted text-xs uppercase tracking-wider font-semibold">Entradas</p>
                            <h3 className="text-2xl font-bold text-white mt-1 tracking-tight">{formatCurrency(totalIncome)}</h3>
                        </Card>
                    </div>

                    {/* Expense Card WITH MINI BUDGET TRACKER */}
                    <div className="snap-center shrink-0 w-[85%] md:w-auto">
                        <Card className={`h-full cursor-pointer transition-all ${isOverBudget ? 'border-danger/50 shadow-lg shadow-danger/10' : ''}`}>
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-2.5 bg-danger/10 rounded-xl text-danger border border-danger/20">
                                    <ArrowDownRight size={22} />
                                </div>
                                {isOverBudget && <Badge type="expense">Acima da Meta</Badge>}
                            </div>
                            <p className="text-textMuted text-xs uppercase tracking-wider font-semibold">Saídas</p>
                            <h3 className="text-2xl font-bold text-white mt-1 tracking-tight">{formatCurrency(totalExpenses)}</h3>

                            {/* Mini Budget Bar - Replaces the huge widget */}
                            <div className="mt-3">
                                <div className="flex justify-between text-[10px] text-textMuted mb-1">
                                    <span>Meta de Gastos</span>
                                    <span>{Math.min(currentExpensePercent, 100).toFixed(0)}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${isOverBudget ? 'bg-danger' : 'bg-zinc-500'} transition-all`}
                                        style={{ width: `${Math.min(currentExpensePercent, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Patrimony Card */}
                    <div className="snap-center shrink-0 w-[85%] md:w-auto">
                        <Card className="h-full cursor-pointer" onClick={(e) => triggerCoinExplosion(e.clientX, e.clientY)}>
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-500 border border-blue-500/20">
                                    <TrendingUp size={22} />
                                </div>
                                <Badge type="neutral">Investido</Badge>
                            </div>
                            <p className="text-textMuted text-xs uppercase tracking-wider font-semibold">Patrimônio</p>
                            <h3 className="text-2xl font-bold text-white mt-1 tracking-tight">{formatCurrency(totalPatrimony)}</h3>
                        </Card>
                    </div>

                    {/* Balance Card */}
                    <div className="snap-center shrink-0 w-[85%] md:hidden">
                        <Card className="h-full bg-surfaceHighlight/50">
                            <div className="flex flex-col items-center justify-center h-full text-center py-4">
                                <p className="text-textMuted text-xs uppercase tracking-wider font-semibold mb-2">Saldo em Conta</p>
                                <h3 className={`text-2xl font-bold tracking-tight ${remainingBalance >= 0 ? 'text-secondary' : 'text-danger'}`}>
                                    {formatCurrency(remainingBalance)}
                                </h3>
                                <p className="text-[10px] text-textMuted mt-2">Previsto até fim do mês</p>
                            </div>
                        </Card>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Flow Chart - TOGGLEABLE */}
                    <Card className="lg:col-span-2 min-h-[300px] flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-semibold text-textMain">Fluxo de Caixa</h3>
                            <div className="flex items-center gap-4">
                                <div className="flex gap-2 bg-surfaceHighlight/50 p-1 rounded-lg">
                                    <button
                                        onClick={() => setChartType('bar')}
                                        className={`p-1.5 rounded transition-all ${chartType === 'bar' ? 'bg-surfaceHighlight text-white shadow-sm' : 'text-textMuted hover:text-white'}`}
                                        title="Gráfico de Barras"
                                    >
                                        <BarChart3 size={16} />
                                    </button>
                                    <button
                                        onClick={() => setChartType('area')}
                                        className={`p-1.5 rounded transition-all ${chartType === 'area' ? 'bg-surfaceHighlight text-white shadow-sm' : 'text-textMuted hover:text-white'}`}
                                        title="Gráfico de Tendência"
                                    >
                                        <Activity size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 w-full min-h-[250px] relative">
                            {isPrivacyMode && (
                                <div className="absolute inset-0 z-10 backdrop-blur-sm bg-black/10 flex items-center justify-center">
                                    <span className="flex items-center gap-2 bg-surfaceHighlight px-4 py-2 rounded-full text-sm text-textMuted border border-white/10 shadow-xl"><EyeOff size={16} /> Oculto</span>
                                </div>
                            )}
                            <ResponsiveContainer width="100%" height="100%">
                                {chartType === 'bar' ? (
                                    <BarChart data={chartData} barGap={4}>
                                        <defs>
                                            <linearGradient id="barIncome" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#34d399" stopOpacity={1} />
                                                <stop offset="95%" stopColor="#059669" stopOpacity={0.8} />
                                            </linearGradient>
                                            <linearGradient id="barExpense" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#f87171" stopOpacity={1} />
                                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.8} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                        <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} tickMargin={10} />
                                        <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value / 1000}k`} />
                                        <Tooltip
                                            cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                                            contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#27272a', borderRadius: '12px' }}
                                            itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                            labelStyle={{ color: '#71717a', marginBottom: '5px' }}
                                        />
                                        <Bar dataKey="income" fill="url(#barIncome)" radius={[4, 4, 0, 0]} name="Receita" maxBarSize={40} />
                                        <Bar dataKey="expense" fill="url(#barExpense)" radius={[4, 4, 0, 0]} name="Despesa" maxBarSize={40} />
                                    </BarChart>
                                ) : (
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} tickMargin={10} />
                                        <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value / 1000}k`} />
                                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#27272a', borderRadius: '12px' }}
                                            itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                            labelStyle={{ color: '#71717a', marginBottom: '5px' }}
                                        />
                                        <Area type="monotone" dataKey="income" stroke="#34d399" fillOpacity={1} fill="url(#colorIncome)" name="Receita" strokeWidth={2} />
                                        <Area type="monotone" dataKey="expense" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpense)" name="Despesa" strokeWidth={2} />
                                    </AreaChart>
                                )}
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Expenses Donut */}
                    <Card className="min-h-[300px] flex flex-col">
                        <h3 className="font-semibold text-textMain mb-2">Para onde foi o dinheiro?</h3>
                        <div className="flex-1 w-full relative">
                            {isPrivacyMode && (
                                <div className="absolute inset-0 z-10 backdrop-blur-sm bg-black/10 flex items-center justify-center">
                                    <EyeOff size={24} className="text-textMuted" />
                                </div>
                            )}
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={expenseByCategory.length > 0 ? expenseByCategory : [{ name: 'Sem dados', value: 1 }]}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={65}
                                        outerRadius={85}
                                        paddingAngle={6}
                                        dataKey="value"
                                        stroke="none"
                                        cornerRadius={6}
                                    >
                                        {(expenseByCategory.length > 0 ? expenseByCategory : [{ name: 'Sem dados', value: 1 }]).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#a1a1aa' }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                                <span className="text-2xl font-bold text-white tracking-tight">{isPrivacyMode ? '••••' : formatCurrency(totalExpensesByCategory)}</span>
                                <span className="text-[10px] text-textMuted uppercase tracking-widest">Total</span>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Recent Transactions List */}
                <div className="space-y-4">
                    <div className="flex justify-between items-end">
                        <h3 className="text-lg font-semibold text-textMain">Últimas Transações</h3>
                        <button className="text-sm text-primary hover:text-white transition-colors" onClick={() => navigate(AppRoutes.TRANSACTIONS)}>Ver Extrato</button>
                    </div>
                    <div className="space-y-3">
                        {transactions.slice(0, 5).map((t) => (
                            <div key={t.id} className="flex items-center justify-between p-4 bg-surface border border-surfaceHighlight rounded-xl hover:bg-surfaceHighlight transition-colors active:scale-[0.99]">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.type === 'income' ? 'bg-secondary/10 text-secondary' : 'bg-surfaceHighlight text-textMuted'}`}>
                                        {t.type === 'income' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                                    </div>
                                    <div>
                                        <p className="font-medium text-textMain text-sm md:text-base">{t.description}</p>
                                        <p className="text-xs text-textMuted">{t.category} • {format(t.date, 'd MMM')}</p>
                                    </div>
                                </div>
                                <span className={`font-semibold text-sm md:text-base ${t.type === 'income' ? 'text-secondary' : 'text-textMain'}`}>
                                    {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Dashboard;
