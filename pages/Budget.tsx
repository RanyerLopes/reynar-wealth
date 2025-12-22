import React, { useState, useMemo } from 'react';
import { PiggyBank, Plus, Trash2, X, AlertTriangle, CheckCircle, TrendingUp, Edit2 } from 'lucide-react';
import { Card, Button, Input } from '../components/UI';
import { Budget } from '../types';
import { useTransactions } from '../hooks/useDatabase';
import { format } from 'date-fns';

// Categories available for budgeting
const BUDGET_CATEGORIES = [
    { name: 'Alimentação', icon: '🍽️', color: 'from-orange-500 to-red-500' },
    { name: 'Transporte', icon: '🚗', color: 'from-blue-500 to-cyan-500' },
    { name: 'Moradia', icon: '🏠', color: 'from-green-500 to-emerald-500' },
    { name: 'Lazer', icon: '🎮', color: 'from-purple-500 to-pink-500' },
    { name: 'Saúde', icon: '💊', color: 'from-red-500 to-rose-500' },
    { name: 'Educação', icon: '📚', color: 'from-indigo-500 to-blue-500' },
    { name: 'Compras', icon: '🛒', color: 'from-yellow-500 to-amber-500' },
    { name: 'Assinaturas', icon: '📺', color: 'from-teal-500 to-green-500' },
    { name: 'Outros', icon: '📦', color: 'from-zinc-500 to-zinc-600' },
];

const STORAGE_KEY = 'reynar_budgets';

const BudgetPage: React.FC = () => {
    const { transactions } = useTransactions();
    const currentMonth = format(new Date(), 'yyyy-MM');

    // Load budgets from localStorage
    const [budgets, setBudgets] = useState<Budget[]>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            return JSON.parse(saved);
        }
        return [];
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [monthlyLimit, setMonthlyLimit] = useState('');

    // Save budgets to localStorage whenever they change
    const saveBudgets = (newBudgets: Budget[]) => {
        setBudgets(newBudgets);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newBudgets));
    };

    // Calculate spending per category from transactions
    const categorySpending = useMemo(() => {
        const spending: Record<string, number> = {};
        const monthStart = new Date(currentMonth + '-01');
        const monthEnd = new Date(monthStart);
        monthEnd.setMonth(monthEnd.getMonth() + 1);

        transactions
            .filter(t => t.type === 'expense')
            .filter(t => {
                const txDate = new Date(t.date);
                return txDate >= monthStart && txDate < monthEnd;
            })
            .forEach(t => {
                const cat = t.category || 'Outros';
                spending[cat] = (spending[cat] || 0) + t.amount;
            });

        return spending;
    }, [transactions, currentMonth]);

    // Get budgets for current month with calculated spending
    const currentBudgets = useMemo(() => {
        return budgets
            .filter(b => b.month === currentMonth)
            .map(b => ({
                ...b,
                spent: categorySpending[b.category] || 0,
            }));
    }, [budgets, currentMonth, categorySpending]);

    // Calculate totals
    const totalBudget = currentBudgets.reduce((sum, b) => sum + b.monthlyLimit, 0);
    const totalSpent = currentBudgets.reduce((sum, b) => sum + b.spent, 0);
    const totalRemaining = totalBudget - totalSpent;

    const handleSaveBudget = () => {
        if (!selectedCategory || !monthlyLimit) return;

        const newBudget: Budget = {
            id: editingBudget?.id || Math.random().toString(),
            category: selectedCategory,
            monthlyLimit: parseFloat(monthlyLimit),
            spent: 0,
            month: currentMonth,
        };

        let updatedBudgets: Budget[];
        if (editingBudget) {
            updatedBudgets = budgets.map(b => b.id === editingBudget.id ? newBudget : b);
        } else {
            // Remove any existing budget for this category/month
            updatedBudgets = budgets.filter(
                b => !(b.category === selectedCategory && b.month === currentMonth)
            );
            updatedBudgets.push(newBudget);
        }

        saveBudgets(updatedBudgets);
        closeModal();
    };

    const handleDeleteBudget = (id: string) => {
        if (confirm('Remover este orçamento?')) {
            saveBudgets(budgets.filter(b => b.id !== id));
        }
    };

    const openEditModal = (budget: Budget) => {
        setEditingBudget(budget);
        setSelectedCategory(budget.category);
        setMonthlyLimit(budget.monthlyLimit.toString());
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingBudget(null);
        setSelectedCategory('');
        setMonthlyLimit('');
    };

    const getProgressColor = (percentage: number) => {
        if (percentage >= 100) return 'bg-danger';
        if (percentage >= 80) return 'bg-amber-500';
        return 'bg-primary';
    };

    const getCategoryInfo = (categoryName: string) => {
        return BUDGET_CATEGORIES.find(c => c.name === categoryName) || BUDGET_CATEGORIES[BUDGET_CATEGORIES.length - 1];
    };

    // Categories not yet budgeted
    const availableCategories = BUDGET_CATEGORIES.filter(
        cat => !currentBudgets.some(b => b.category === cat.name)
    );

    return (
        <div className="pb-24 md:pb-0 space-y-8 animate-fade-in">
            {/* Header */}
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-textMain">Orçamento Mensal</h2>
                    <p className="text-textMuted text-sm">Defina limites por categoria e acompanhe seus gastos</p>
                </div>
                <Button className="!w-auto px-4 py-2" onClick={() => setIsModalOpen(true)}>
                    <Plus size={20} />
                    <span className="hidden sm:inline">Novo Limite</span>
                </Button>
            </header>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/20">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-primary/20">
                            <PiggyBank size={24} className="text-primary" />
                        </div>
                        <div>
                            <p className="text-textMuted text-xs uppercase">Orçamento Total</p>
                            <p className="text-xl font-bold text-white">
                                R$ {totalBudget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>
                </Card>

                <Card className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 border-amber-500/20">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-amber-500/20">
                            <TrendingUp size={24} className="text-amber-500" />
                        </div>
                        <div>
                            <p className="text-textMuted text-xs uppercase">Gasto no Mês</p>
                            <p className="text-xl font-bold text-white">
                                R$ {totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>
                </Card>

                <Card className={`bg-gradient-to-br ${totalRemaining >= 0 ? 'from-green-500/20 to-green-500/5 border-green-500/20' : 'from-danger/20 to-danger/5 border-danger/20'}`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-xl ${totalRemaining >= 0 ? 'bg-green-500/20' : 'bg-danger/20'}`}>
                            {totalRemaining >= 0 ? (
                                <CheckCircle size={24} className="text-green-500" />
                            ) : (
                                <AlertTriangle size={24} className="text-danger" />
                            )}
                        </div>
                        <div>
                            <p className="text-textMuted text-xs uppercase">
                                {totalRemaining >= 0 ? 'Disponível' : 'Excedido'}
                            </p>
                            <p className={`text-xl font-bold ${totalRemaining >= 0 ? 'text-green-500' : 'text-danger'}`}>
                                R$ {Math.abs(totalRemaining).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Budget List */}
            {currentBudgets.length === 0 ? (
                <Card className="text-center py-12">
                    <div className="p-4 rounded-full bg-surfaceHighlight w-fit mx-auto mb-4">
                        <PiggyBank size={40} className="text-textMuted" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Nenhum orçamento definido</h3>
                    <p className="text-textMuted text-sm mb-4">
                        Defina limites mensais por categoria para controlar seus gastos
                    </p>
                    <Button className="!w-auto px-6 mx-auto" onClick={() => setIsModalOpen(true)}>
                        <Plus size={18} /> Criar Primeiro Orçamento
                    </Button>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {currentBudgets.map(budget => {
                        const catInfo = getCategoryInfo(budget.category);
                        const percentage = Math.min((budget.spent / budget.monthlyLimit) * 100, 100);
                        const isOverBudget = budget.spent > budget.monthlyLimit;
                        const isWarning = percentage >= 80 && !isOverBudget;

                        return (
                            <Card key={budget.id} className="group hover:border-primary/30 transition-all">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{catInfo.icon}</span>
                                        <div>
                                            <h4 className="font-semibold text-white">{budget.category}</h4>
                                            <p className="text-xs text-textMuted">
                                                R$ {budget.spent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / R$ {budget.monthlyLimit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {isOverBudget && (
                                            <span className="px-2 py-1 bg-danger/20 text-danger text-xs rounded-full flex items-center gap-1">
                                                <AlertTriangle size={12} /> Excedido
                                            </span>
                                        )}
                                        {isWarning && (
                                            <span className="px-2 py-1 bg-amber-500/20 text-amber-500 text-xs rounded-full flex items-center gap-1">
                                                <AlertTriangle size={12} /> Atenção
                                            </span>
                                        )}

                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                            <button
                                                onClick={() => openEditModal(budget)}
                                                className="p-2 text-textMuted hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteBudget(budget.id)}
                                                className="p-2 text-textMuted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="h-3 bg-surfaceHighlight rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${getProgressColor(percentage)} transition-all duration-500 rounded-full`}
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>

                                <div className="flex justify-between mt-2 text-xs text-textMuted">
                                    <span>{percentage.toFixed(0)}% usado</span>
                                    <span>
                                        Resta: R$ {Math.max(0, budget.monthlyLimit - budget.spent).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Add/Edit Budget Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm p-0 md:p-4">
                    <div className="bg-surface w-full max-w-md rounded-t-2xl md:rounded-2xl border border-surfaceHighlight shadow-2xl animate-slide-up">
                        <div className="p-6 border-b border-surfaceHighlight flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold text-white">
                                    {editingBudget ? 'Editar Orçamento' : 'Novo Orçamento'}
                                </h3>
                                <p className="text-xs text-textMuted">
                                    Defina um limite mensal para a categoria
                                </p>
                            </div>
                            <button onClick={closeModal} className="text-textMuted hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-xs font-medium text-textMuted uppercase tracking-wider ml-1 mb-2 block">
                                    Categoria
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(editingBudget ? BUDGET_CATEGORIES : availableCategories).map(cat => (
                                        <button
                                            key={cat.name}
                                            type="button"
                                            onClick={() => setSelectedCategory(cat.name)}
                                            className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all ${selectedCategory === cat.name
                                                    ? 'bg-primary/20 border-primary'
                                                    : 'bg-surfaceHighlight border-transparent hover:border-textMuted'
                                                }`}
                                        >
                                            <span className="text-xl">{cat.icon}</span>
                                            <span className="text-[10px] text-textMain truncate w-full text-center">
                                                {cat.name}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <Input
                                label="Limite Mensal (R$)"
                                type="number"
                                placeholder="1000.00"
                                value={monthlyLimit}
                                onChange={(e) => setMonthlyLimit(e.target.value)}
                                required
                            />

                            <Button
                                onClick={handleSaveBudget}
                                disabled={!selectedCategory || !monthlyLimit}
                                className="mt-4"
                            >
                                {editingBudget ? 'Salvar Alterações' : 'Criar Orçamento'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BudgetPage;
