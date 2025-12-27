
import React, { useState, useEffect } from 'react';
import { Target, Plus, ChevronRight, ChevronLeft, Trophy, X, TrendingUp, Wallet, CheckCircle, FileText, Calendar, ArrowUpRight, StickyNote, Save, Trash2 } from 'lucide-react';
import { Card, Button, Input, triggerCoinExplosion } from '../components/UI';
import { Goal, GoalTransaction } from '../types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameMonth, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useGamification } from '../context/GamificationContext';
import { AIConsultant } from '../components/AIConsultant';
import { useGoals } from '../hooks/useDatabase';
import { useLanguage } from '../context/LanguageContext';

const Goals: React.FC = () => {
    const { addXp } = useGamification();
    const { t, formatCurrency } = useLanguage();
    const { goals: dbGoals, loading: goalsLoading, addGoal: addGoalToDb, updateGoal: updateGoalInDb } = useGoals();
    const [goals, setGoals] = useState<Goal[]>([]);

    // Sync database goals with local state
    useEffect(() => {
        setGoals(dbGoals);
    }, [dbGoals]);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

    const [name, setName] = useState('');
    const [target, setTarget] = useState('');
    const [initial, setInitial] = useState('');
    const [deadline, setDeadline] = useState('');
    const [icon, setIcon] = useState('💰');

    const [depositAmount, setDepositAmount] = useState('');
    const [depositNote, setDepositNote] = useState('');

    const [editingNotes, setEditingNotes] = useState('');

    // Calendar state
    const [calendarMonth, setCalendarMonth] = useState(new Date());

    const totalSaved = goals.reduce((acc, g) => acc + g.currentAmount, 0);

    // Calendar helper functions
    const getDaysInMonth = () => {
        const start = startOfMonth(calendarMonth);
        const end = endOfMonth(calendarMonth);
        return eachDayOfInterval({ start, end });
    };

    const getGoalsForDay = (day: Date) => {
        return goals.filter(g => isSameDay(new Date(g.deadline), day));
    };

    const getGoalsForMonth = () => {
        return goals.filter(g => isSameMonth(new Date(g.deadline), calendarMonth));
    };

    const handleAddGoal = (e: React.FormEvent) => {
        e.preventDefault();
        const initialAmount = parseFloat(initial) || 0;

        const history: GoalTransaction[] = initialAmount > 0 ? [{
            id: Math.random().toString(),
            date: new Date(),
            amount: initialAmount,
            note: t('goals.initialBalance')
        }] : [];

        const newGoal: Goal = {
            id: Math.random().toString(),
            name,
            targetAmount: parseFloat(target),
            currentAmount: initialAmount,
            deadline: new Date(deadline),
            icon,
            color: 'bg-primary',
            history,
            notes: ''
        };
        setGoals([...goals, newGoal]);
        setIsAddModalOpen(false);

        // XP Reward
        addXp(20);
        if (initialAmount > 0) addXp(10); // Bonus for starting with money

        setName(''); setTarget(''); setInitial(''); setDeadline('');
    };

    const openDepositModal = (goal: Goal, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedGoal(goal);
        setDepositAmount('');
        setDepositNote('');
        setIsDepositModalOpen(true);
    };

    const openDetailModal = (goal: Goal) => {
        setSelectedGoal(goal);
        setEditingNotes(goal.notes || '');
        setIsDetailModalOpen(true);
    };

    const handleDeposit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedGoal || !depositAmount) return;

        const amountToAdd = parseFloat(depositAmount);
        const newTransaction: GoalTransaction = {
            id: Math.random().toString(),
            date: new Date(),
            amount: amountToAdd,
            note: depositNote || t('goals.manualDeposit')
        };

        const updatedGoals = goals.map(g => {
            if (g.id === selectedGoal.id) {
                return {
                    ...g,
                    currentAmount: g.currentAmount + amountToAdd,
                    history: [newTransaction, ...g.history]
                };
            }
            return g;
        });

        setGoals(updatedGoals);

        if (isDetailModalOpen) {
            const updated = updatedGoals.find(g => g.id === selectedGoal.id);
            if (updated) setSelectedGoal(updated);
        }

        setIsDepositModalOpen(false);
        triggerCoinExplosion(window.innerWidth / 2, window.innerHeight / 2);

        // XP Reward for Deposit
        addXp(50);
    };

    const handleSaveNotes = () => {
        if (!selectedGoal) return;

        const updatedGoals = goals.map(g => {
            if (g.id === selectedGoal.id) {
                return { ...g, notes: editingNotes };
            }
            return g;
        });
        setGoals(updatedGoals);

        const updated = updatedGoals.find(g => g.id === selectedGoal.id);
        if (updated) setSelectedGoal(updated);

        triggerCoinExplosion(window.innerWidth / 2, window.innerHeight / 2);
    };

    const handleDeleteGoal = (goalId: string) => {
        if (confirm(t('goals.deleteConfirm'))) {
            setGoals(goals.filter(g => g.id !== goalId));
            setIsDetailModalOpen(false);
            setSelectedGoal(null);
        }
    };

    return (
        <div className="pb-24 md:pb-0 space-y-6 animate-fade-in relative">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-textMain">{t('goals.title')}</h2>
                    <p className="text-textMuted text-sm">{t('goals.subtitle')}</p>
                </div>
                <Button className="!w-auto px-4 py-2" onClick={() => setIsAddModalOpen(true)}>
                    <Plus size={20} />
                    <span className="hidden sm:inline">{t('goals.newGoal')}</span>
                </Button>
            </header>

            <AIConsultant context="goals" compact />

            {/* Hero Card */}
            <div
                onClick={(e) => triggerCoinExplosion(e.clientX, e.clientY)}
                className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-6 shadow-2xl relative overflow-hidden cursor-pointer hover:shadow-primary/50 transition-all active:scale-[0.98]"
            >
                <div className="absolute right-0 top-0 p-8 opacity-10">
                    <Trophy size={120} className="text-white" />
                </div>
                <p className="text-indigo-200 text-sm font-medium uppercase tracking-wider mb-1">{t('goals.totalSaved')}</p>
                <h3 className="text-4xl font-bold text-white mb-2">{formatCurrency(totalSaved)}</h3>
                <p className="text-white/80 text-sm max-w-md">{t('goals.buildingFuture')}</p>
            </div>

            {/* Calendar Section */}
            <Card className="overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg text-white flex items-center gap-2">
                        <Calendar size={20} className="text-primary" />
                        Calendário de Metas
                    </h3>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))}
                            className="p-2 rounded-lg bg-surfaceHighlight text-textMuted hover:text-white hover:bg-primary/20 transition-colors"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <span className="text-sm font-semibold text-white min-w-[140px] text-center capitalize">
                            {format(calendarMonth, 'MMMM yyyy', { locale: ptBR })}
                        </span>
                        <button
                            onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}
                            className="p-2 rounded-lg bg-surfaceHighlight text-textMuted hover:text-white hover:bg-primary/20 transition-colors"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap items-center gap-4 mb-4 p-3 bg-surfaceHighlight/30 rounded-xl text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full ring-2 ring-secondary"></div>
                        <span className="text-textMuted">Hoje</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-danger"></div>
                        <span className="text-textMuted">Urgente (≤7 dias)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                        <span className="text-textMuted">Próximo (≤30 dias)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-primary"></div>
                        <span className="text-textMuted">Meta marcada</span>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 mb-4">
                    {/* Day headers */}
                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                        <div key={day} className="text-center text-xs text-textMuted font-medium py-2">
                            {day}
                        </div>
                    ))}

                    {/* Empty cells for days before month start */}
                    {Array.from({ length: getDay(startOfMonth(calendarMonth)) }).map((_, i) => (
                        <div key={`empty-${i}`} className="aspect-square"></div>
                    ))}

                    {/* Days of month */}
                    {getDaysInMonth().map(day => {
                        const dayGoals = getGoalsForDay(day);
                        const hasGoals = dayGoals.length > 0;
                        const isToday = isSameDay(day, new Date());

                        // Calculate urgency based on days until deadline
                        const daysUntil = Math.ceil((day.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                        const isUrgent = hasGoals && daysUntil >= 0 && daysUntil <= 7;
                        const isNear = hasGoals && daysUntil > 7 && daysUntil <= 30;

                        // Get progress for tooltip
                        const goalProgress = hasGoals ? dayGoals.map(g => {
                            const pct = Math.min((g.currentAmount / g.targetAmount) * 100, 100).toFixed(0);
                            return `${g.icon} ${g.name} (${pct}%)`;
                        }).join('\n') : '';

                        return (
                            <div
                                key={day.toISOString()}
                                className={`aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-all relative group
                                    ${isUrgent ? 'bg-danger/20 text-danger font-bold cursor-pointer hover:bg-danger/30' :
                                        isNear ? 'bg-amber-500/20 text-amber-400 font-bold cursor-pointer hover:bg-amber-500/30' :
                                            hasGoals ? 'bg-primary/20 text-primary font-bold cursor-pointer hover:bg-primary/30' :
                                                'text-textMuted hover:bg-surfaceHighlight'}
                                    ${isToday ? 'ring-2 ring-secondary' : ''}
                                `}
                                onClick={() => hasGoals && openDetailModal(dayGoals[0])}
                                title={goalProgress}
                            >
                                {format(day, 'd')}
                                {hasGoals && (
                                    <div className="absolute bottom-1 flex gap-0.5">
                                        {dayGoals.slice(0, 3).map((g, i) => (
                                            <div
                                                key={i}
                                                className={`w-1.5 h-1.5 rounded-full ${isUrgent ? 'bg-danger' :
                                                        isNear ? 'bg-amber-500' : 'bg-primary'
                                                    }`}
                                            ></div>
                                        ))}
                                    </div>
                                )}

                                {/* Hover tooltip for desktop */}
                                {hasGoals && (
                                    <div className="hidden group-hover:block absolute z-20 bottom-full mb-2 left-1/2 -translate-x-1/2 bg-surface border border-surfaceHighlight rounded-lg p-2 shadow-xl whitespace-nowrap text-xs">
                                        {dayGoals.map(g => (
                                            <div key={g.id} className="flex items-center gap-2 py-0.5">
                                                <span>{g.icon}</span>
                                                <span className="text-white">{g.name}</span>
                                                <span className="text-textMuted">
                                                    {Math.min((g.currentAmount / g.targetAmount) * 100, 100).toFixed(0)}%
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Goals for this month OR empty state */}
                {getGoalsForMonth().length > 0 ? (
                    <div className="border-t border-surfaceHighlight pt-4">
                        <p className="text-xs text-textMuted mb-2 uppercase tracking-wider font-semibold">
                            Metas deste mês ({getGoalsForMonth().length})
                        </p>
                        <div className="space-y-2">
                            {getGoalsForMonth().map(goal => {
                                const daysUntil = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                                const isUrgent = daysUntil >= 0 && daysUntil <= 7;
                                const isNear = daysUntil > 7 && daysUntil <= 30;
                                const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);

                                return (
                                    <div
                                        key={goal.id}
                                        onClick={() => openDetailModal(goal)}
                                        className={`flex items-center justify-between p-3 rounded-xl cursor-pointer border transition-all
                                            ${isUrgent ? 'bg-danger/10 border-danger/30 hover:border-danger' :
                                                isNear ? 'bg-amber-500/10 border-amber-500/30 hover:border-amber-500' :
                                                    'bg-surfaceHighlight border-transparent hover:border-primary'}
                                        `}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl">{goal.icon}</span>
                                            <div>
                                                <p className="text-sm font-medium text-white flex items-center gap-2">
                                                    {goal.name}
                                                    {isUrgent && <span className="text-[10px] bg-danger/20 text-danger px-1.5 py-0.5 rounded">URGENTE</span>}
                                                </p>
                                                <p className="text-xs text-textMuted">
                                                    Vence em {format(new Date(goal.deadline), 'dd/MM')} • {progress.toFixed(0)}% concluído
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-sm font-semibold ${isUrgent ? 'text-danger' : isNear ? 'text-amber-400' : 'text-primary'}`}>
                                                {formatCurrency(goal.targetAmount)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="border-t border-surfaceHighlight pt-6 pb-2 text-center">
                        <Calendar size={32} className="mx-auto mb-2 text-textMuted opacity-30" />
                        <p className="text-textMuted text-sm">Nenhuma meta vence neste mês</p>
                        <p className="text-xs text-textMuted mt-1">Use os botões ◀ ▶ para navegar</p>
                    </div>
                )}
            </Card>

            {/* Goals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {goals.map((goal) => {
                    const percent = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
                    const isCompleted = percent >= 100;

                    return (
                        <Card
                            key={goal.id}
                            onClick={() => openDetailModal(goal)}
                            className={`transition-all duration-300 relative overflow-hidden flex flex-col cursor-pointer ${isCompleted ? 'border-secondary/50 bg-secondary/5' : ''}`}
                        >
                            <div className={`absolute top-0 left-0 w-1 h-full ${isCompleted ? 'bg-secondary' : goal.color}`}></div>

                            <div className="flex justify-between items-start mb-4 pl-2">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-inner ${isCompleted ? 'bg-secondary/20' : 'bg-surfaceHighlight'}`}>
                                    {isCompleted ? '🏆' : goal.icon}
                                </div>
                                <div className="bg-surfaceHighlight px-2 py-1 rounded-md text-[10px] text-textMuted flex items-center gap-1">
                                    {isCompleted ? <CheckCircle size={10} className="text-secondary" /> : <Target size={10} />}
                                    {isCompleted ? t('goals.completed') + '!' : format(goal.deadline, 'MMM yyyy')}
                                </div>
                            </div>

                            <div className="pl-2 flex-1">
                                <h3 className="font-bold text-lg text-textMain mb-1">{goal.name}</h3>
                                <div className="flex justify-between items-end mb-2">
                                    <span className={`text-2xl font-semibold ${isCompleted ? 'text-secondary' : 'text-white'}`}>
                                        {formatCurrency(goal.currentAmount)}
                                    </span>
                                    <span className="text-xs text-textMuted mb-1">{t('goals.targetAmount')}: {formatCurrency(goal.targetAmount)}</span>
                                </div>

                                <div className="w-full bg-surfaceHighlight h-2.5 rounded-full overflow-hidden mb-4">
                                    <div
                                        className={`h-full ${isCompleted ? 'bg-secondary' : goal.color} transition-all duration-1000`}
                                        style={{ width: `${percent}%` }}
                                    ></div>
                                </div>

                                <div className="flex justify-between items-center text-xs text-textMuted font-medium mb-4">
                                    <span>{isCompleted ? 'Objetivo alcançado!' : 'Falta pouco!'}</span>
                                    <span>{percent.toFixed(0)}%</span>
                                </div>
                            </div>

                            <Button
                                variant="secondary"
                                className={`mt-auto text-sm py-2 ${isCompleted ? 'bg-surfaceHighlight text-textMuted cursor-not-allowed' : ''}`}
                                onClick={(e) => !isCompleted && openDepositModal(goal, e)}
                                disabled={isCompleted}
                            >
                                {isCompleted ? t('goals.completed') : (
                                    <>
                                        <Plus size={16} /> {t('goals.deposit')}
                                    </>
                                )}
                            </Button>
                        </Card>
                    );
                })}
            </div>

            {/* Modal: Create Goal */}
            {
                isAddModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm p-0 md:p-4" onClick={() => setIsAddModalOpen(false)}>
                        <div className="bg-surface w-full max-w-md rounded-t-2xl md:rounded-2xl border border-surfaceHighlight shadow-2xl animate-slide-up" onClick={(e) => e.stopPropagation()}>
                            <div className="p-6 border-b border-surfaceHighlight flex justify-between items-center">
                                <h3 className="text-lg font-bold text-white">{t('goals.newGoal')}</h3>
                                <button onClick={() => setIsAddModalOpen(false)} className="text-textMuted hover:text-white"><X size={20} /></button>
                            </div>
                            <form onSubmit={handleAddGoal} className="p-6 space-y-4">
                                <div className="grid grid-cols-4 gap-2 mb-4">
                                    {['✈️', '🚗', '🏠', '💻', '🛡️', '🎓', '💍', '💰'].map(emoji => (
                                        <button
                                            type="button"
                                            key={emoji}
                                            onClick={() => setIcon(emoji)}
                                            className={`text-2xl py-2 rounded-lg border ${icon === emoji ? 'border-primary bg-primary/20' : 'border-surfaceHighlight hover:bg-surfaceHighlight'}`}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                                <Input label={t('goals.goalName')} placeholder={t('goals.goalNamePlaceholder')} required value={name} onChange={e => setName(e.target.value)} />
                                <Input label={t('goals.targetAmount')} type="number" placeholder="0,00" required value={target} onChange={e => setTarget(e.target.value)} isCurrency />
                                <Input label={t('goals.initialAmount')} type="number" placeholder="0,00" value={initial} onChange={e => setInitial(e.target.value)} isCurrency />
                                <Input label={t('goals.deadline')} type="date" required value={deadline} onChange={e => setDeadline(e.target.value)} />
                                <Button type="submit" className="mt-4">{t('goals.createGoal')}</Button>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Modal: Deposit */}
            {
                isDepositModalOpen && selectedGoal && (
                    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm p-0 md:p-4" onClick={() => setIsDepositModalOpen(false)}>
                        <div className="bg-surface w-full max-w-sm rounded-t-2xl md:rounded-2xl border border-surfaceHighlight shadow-2xl animate-slide-up" onClick={(e) => e.stopPropagation()}>
                            <div className={`p-6 border-b border-surfaceHighlight flex justify-between items-center bg-gradient-to-r from-surface to-surfaceHighlight rounded-t-2xl`}>
                                <div>
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        <Wallet size={18} className="text-secondary" /> {t('goals.depositModal')}
                                    </h3>
                                    <p className="text-xs text-textMuted">{selectedGoal.name}</p>
                                </div>
                                <button onClick={() => setIsDepositModalOpen(false)} className="text-textMuted hover:text-white"><X size={20} /></button>
                            </div>
                            <form onSubmit={handleDeposit} className="p-6 space-y-6">
                                <div className="text-center">
                                    <label className="text-sm font-medium text-textMuted uppercase block mb-2">{t('goals.depositAmount')}</label>
                                    <div className="flex items-center justify-center gap-1">
                                        <span className="text-2xl font-bold text-textMuted">R$</span>
                                        <input
                                            type="number"
                                            autoFocus
                                            className="bg-transparent border-b-2 border-surfaceHighlight text-4xl font-bold text-white w-40 text-center outline-none focus:border-secondary transition-colors"
                                            placeholder="0"
                                            value={depositAmount}
                                            onChange={e => setDepositAmount(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <Input
                                    label="Nota (Opcional)"
                                    placeholder="Ex: Economia do mercado"
                                    value={depositNote}
                                    onChange={e => setDepositNote(e.target.value)}
                                />

                                <div className="bg-surfaceHighlight/30 p-4 rounded-xl text-center">
                                    <p className="text-xs text-textMuted mb-1">Novo Saldo Estimado</p>
                                    <p className="text-xl font-bold text-white">
                                        R$ {(selectedGoal.currentAmount + (parseFloat(depositAmount) || 0)).toLocaleString('pt-BR')}
                                    </p>
                                </div>

                                <Button type="submit" variant="secondary" className="w-full">
                                    Confirmar Depósito
                                </Button>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Modal: Detailed Goal View */}
            {
                isDetailModalOpen && selectedGoal && (
                    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm p-0 md:p-4" onClick={() => setIsDetailModalOpen(false)}>
                        <div className="bg-surface w-full max-w-lg rounded-t-2xl md:rounded-2xl border border-surfaceHighlight shadow-2xl animate-slide-up max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                            {/* Header */}
                            <div className={`p-6 border-b border-surfaceHighlight flex justify-between items-start rounded-t-2xl relative overflow-hidden`}>
                                <div className={`absolute inset-0 opacity-20 ${selectedGoal.color.replace('bg-', 'bg-gradient-to-br from-black to-')}`}></div>
                                <div className="relative z-10 flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-surface/50 backdrop-blur-md flex items-center justify-center text-3xl shadow-lg">
                                        {selectedGoal.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">{selectedGoal.name}</h3>
                                        <p className="text-sm text-white/70">Alvo: R$ {selectedGoal.targetAmount.toLocaleString('pt-BR')}</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsDetailModalOpen(false)} className="text-white/70 hover:text-white bg-black/20 rounded-full p-1 relative z-10">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                                {/* Status Card */}
                                <div className="bg-surfaceHighlight/20 border border-surfaceHighlight rounded-2xl p-5">
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-sm text-textMuted">Progresso Atual</span>
                                        <span className="text-2xl font-bold text-white">
                                            {Math.min((selectedGoal.currentAmount / selectedGoal.targetAmount) * 100, 100).toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-surfaceHighlight h-3 rounded-full overflow-hidden mb-2">
                                        <div
                                            className={`h-full ${selectedGoal.color} transition-all duration-1000`}
                                            style={{ width: `${Math.min((selectedGoal.currentAmount / selectedGoal.targetAmount) * 100, 100)}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between text-xs text-textMuted">
                                        <span>R$ {selectedGoal.currentAmount.toLocaleString('pt-BR')} guardados</span>
                                        <span>Faltam R$ {Math.max(0, selectedGoal.targetAmount - selectedGoal.currentAmount).toLocaleString('pt-BR')}</span>
                                    </div>
                                </div>

                                {/* History Section */}
                                <div>
                                    <h4 className="text-sm font-bold text-textMain uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <TrendingUp size={16} className="text-secondary" /> Histórico de Aportes
                                    </h4>
                                    <div className="space-y-3">
                                        {selectedGoal.history && selectedGoal.history.length > 0 ? (
                                            selectedGoal.history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(tx => (
                                                <div key={tx.id} className="flex justify-between items-center p-3 bg-surface border border-surfaceHighlight rounded-xl">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-secondary/10 text-secondary rounded-lg">
                                                            <ArrowUpRight size={16} />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-textMain">{tx.note || 'Depósito'}</p>
                                                            <p className="text-xs text-textMuted">{format(new Date(tx.date), 'dd/MM/yyyy')}</p>
                                                        </div>
                                                    </div>
                                                    <span className="font-bold text-secondary">+ R$ {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-center text-sm text-textMuted py-4">Nenhum aporte registrado ainda.</p>
                                        )}
                                    </div>
                                </div>

                                {/* Notes Section */}
                                <div>
                                    <h4 className="text-sm font-bold text-textMain uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <StickyNote size={16} className="text-primary" /> Anotações & Lembretes
                                    </h4>
                                    <div className="relative">
                                        <textarea
                                            className="w-full bg-surfaceHighlight/30 border border-surfaceHighlight rounded-xl p-4 text-sm text-textMain placeholder-zinc-600 focus:outline-none focus:border-primary min-h-[100px]"
                                            placeholder="Escreva suas estratégias aqui..."
                                            value={editingNotes}
                                            onChange={(e) => setEditingNotes(e.target.value)}
                                        ></textarea>
                                        <button
                                            onClick={handleSaveNotes}
                                            className="absolute bottom-3 right-3 p-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-lg"
                                            title="Salvar Notas"
                                        >
                                            <Save size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 border-t border-surfaceHighlight bg-surface flex gap-3">
                                <Button
                                    variant="secondary"
                                    onClick={(e) => openDepositModal(selectedGoal, e as any)}
                                    disabled={selectedGoal.currentAmount >= selectedGoal.targetAmount}
                                    className="flex-1"
                                >
                                    <Plus size={18} /> Novo Aporte
                                </Button>
                                <button
                                    onClick={() => handleDeleteGoal(selectedGoal.id)}
                                    className="p-3 rounded-xl border border-danger/30 bg-danger/10 text-danger hover:bg-danger/20 transition-colors"
                                    title="Excluir meta"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default Goals;
