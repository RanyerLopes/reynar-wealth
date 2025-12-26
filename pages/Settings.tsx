
import React, { useState, useEffect, useRef } from 'react';
import { User, Shield, LogOut, Save, CreditCard, Sparkles, Target, UploadCloud, DownloadCloud, FileSpreadsheet, Check, Camera, Crown, Receipt, Plus, Trash2, X, CheckCircle } from 'lucide-react';
import { Card, Button, Input, triggerCoinExplosion } from '../components/UI';
import { useNavigate } from 'react-router-dom';
import { AppRoutes } from '../types';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface SettingsProps {
    onLogout?: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onLogout }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t, formatCurrency } = useLanguage();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // User data
    const [name, setName] = useState(localStorage.getItem('reynar_user_name') || user?.email?.split('@')[0] || 'Usuário');
    const [nickname, setNickname] = useState(localStorage.getItem('reynar_user_nickname') || '');
    const [avatar, setAvatar] = useState(localStorage.getItem('reynar_user_avatar') || '');
    const [gender, setGender] = useState(localStorage.getItem('reynar_user_gender') || 'male');
    const [salary, setSalary] = useState(localStorage.getItem('reynar_user_salary') || '');
    const [spendingLimit, setSpendingLimit] = useState(localStorage.getItem('finnova_spending_limit') || '70');

    // Plan status
    const currentPlan = localStorage.getItem('finnova_plan') || 'basic';
    const isPro = currentPlan === 'pro';

    // UI State
    const [isImporting, setIsImporting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showAddExpense, setShowAddExpense] = useState(false);

    // Fixed expenses
    const [fixedExpenses, setFixedExpenses] = useState<{ id: string; name: string; amount: number }[]>(() => {
        const stored = localStorage.getItem('reynar_fixed_expenses');
        return stored ? JSON.parse(stored) : [];
    });
    const [newExpenseName, setNewExpenseName] = useState('');
    const [newExpenseAmount, setNewExpenseAmount] = useState('');

    const handlePhotoClick = () => {
        fileInputRef.current?.click();
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setAvatar(base64);
                localStorage.setItem('reynar_user_avatar', base64);
                triggerCoinExplosion(window.innerWidth / 2, window.innerHeight / 2);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        localStorage.setItem('reynar_user_name', name);
        localStorage.setItem('reynar_user_nickname', nickname);
        localStorage.setItem('reynar_user_gender', gender);
        localStorage.setItem('reynar_user_salary', salary);
        localStorage.setItem('finnova_spending_limit', spendingLimit);
        localStorage.setItem('reynar_fixed_expenses', JSON.stringify(fixedExpenses));

        triggerCoinExplosion(window.innerWidth / 2, window.innerHeight / 2);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    const handleAddFixedExpense = () => {
        if (newExpenseName && newExpenseAmount) {
            const newExpense = {
                id: Math.random().toString(),
                name: newExpenseName,
                amount: parseFloat(newExpenseAmount)
            };
            const updated = [...fixedExpenses, newExpense];
            setFixedExpenses(updated);
            localStorage.setItem('reynar_fixed_expenses', JSON.stringify(updated));
            setNewExpenseName('');
            setNewExpenseAmount('');
            setShowAddExpense(false);
        }
    };

    const handleRemoveFixedExpense = (id: string) => {
        const updated = fixedExpenses.filter(e => e.id !== id);
        setFixedExpenses(updated);
        localStorage.setItem('reynar_fixed_expenses', JSON.stringify(updated));
    };

    const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setIsImporting(true);
            setTimeout(() => {
                setIsImporting(false);
                triggerCoinExplosion(window.innerWidth / 2, window.innerHeight / 2);
            }, 2500);
        }
    };

    const handleExportBackup = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(localStorage));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "reynar_backup_completo.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const totalFixed = fixedExpenses.reduce((acc, e) => acc + e.amount, 0);

    return (
        <div className="pb-24 md:pb-0 space-y-6 animate-fade-in max-w-2xl mx-auto">
            {/* Success Toast */}
            {showSuccess && (
                <div className="fixed top-4 right-4 z-50 bg-secondary text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg animate-slide-up">
                    <CheckCircle size={18} />
                    {t('settings.saved')}
                </div>
            )}

            <header>
                <h2 className="text-2xl font-bold text-textMain">{t('settings.title')}</h2>
                <p className="text-textMuted text-sm">{t('settings.subtitle')}</p>
            </header>

            {/* Profile Section with Photo Upload */}
            <Card>
                <div className="flex items-center gap-4 mb-6">
                    <div className="relative group cursor-pointer" onClick={handlePhotoClick}>
                        <div className="w-20 h-20 rounded-full bg-surfaceHighlight border-2 border-primary overflow-hidden">
                            {avatar ? (
                                <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-indigo-600 text-white text-2xl font-bold">
                                    {(nickname || name || 'U').charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="text-white" size={20} />
                        </div>
                        {isPro && (
                            <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full border-2 border-surface flex items-center gap-0.5">
                                <Crown size={8} /> PRO
                            </div>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            className="hidden"
                        />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-lg text-white">{t('settings.profile')}</h3>
                        <p className="text-xs text-textMuted">{t('settings.changePhoto')}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <Input
                        label={t('settings.name')}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        icon={<User size={16} />}
                    />
                    <Input
                        label="Apelido (como quer ser chamado)"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="Ex: Majestade, Jojo..."
                        icon={<Sparkles size={16} />}
                    />

                    {/* Gender Selection */}
                    <div>
                        <label className="text-sm text-textMuted mb-2 block">Gênero (personaliza o consultor AI)</label>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setGender('male')}
                                className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${gender === 'male'
                                    ? 'bg-primary/20 border-primary text-primary'
                                    : 'bg-surfaceHighlight border-surfaceHighlight text-textMuted hover:border-primary/50'
                                    }`}
                            >
                                👑 Masculino
                            </button>
                            <button
                                type="button"
                                onClick={() => setGender('female')}
                                className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${gender === 'female'
                                    ? 'bg-pink-500/20 border-pink-500 text-pink-400'
                                    : 'bg-surfaceHighlight border-surfaceHighlight text-textMuted hover:border-pink-500/50'
                                    }`}
                            >
                                👸 Feminino
                            </button>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Subscription Card */}
            <Card className={`${isPro ? 'border-amber-500/30 bg-gradient-to-br from-amber-900/20 to-surface' : 'border-primary/50 bg-primary/5'}`}>
                <h3 className="font-bold text-lg text-white mb-4 flex items-center gap-2">
                    <Crown size={20} className={isPro ? 'text-amber-400' : 'text-primary'} /> {t('settings.subscription')}
                </h3>
                {isPro ? (
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm font-medium text-amber-300 flex items-center gap-2">
                                Membro PRO <Check size={14} className="text-emerald-500" />
                            </p>
                            <p className="text-xs text-textMuted">Acesso total a todos os recursos!</p>
                        </div>
                        <Button variant="secondary" className="!w-auto text-sm px-4 py-2" onClick={() => navigate(AppRoutes.PRICING)}>
                            Gerenciar
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-surfaceHighlight rounded-xl">
                            <CreditCard className="text-primary" size={20} />
                            <div>
                                <p className="text-sm font-medium text-white">Plano Básico</p>
                                <p className="text-xs text-textMuted">Limite de 3 importações e 5 scans/mês</p>
                            </div>
                        </div>
                        <Button onClick={() => navigate(AppRoutes.PRICING)}>
                            <Crown size={18} /> Assinar PRO - R$ 29,90/mês
                        </Button>
                    </div>
                )}
            </Card>

            {/* Fixed Expenses */}
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg text-white flex items-center gap-2">
                        <Receipt size={20} className="text-danger" /> {t('settings.fixedExpenses')}
                    </h3>
                    <button
                        onClick={() => setShowAddExpense(true)}
                        className="p-2 rounded-lg bg-surfaceHighlight text-textMuted hover:text-white hover:bg-primary transition-colors"
                    >
                        <Plus size={18} />
                    </button>
                </div>

                {fixedExpenses.length === 0 ? (
                    <div className="text-center py-6 text-textMuted">
                        <Receipt size={28} className="mx-auto mb-2 opacity-30" />
                        <p className="text-sm">Nenhuma conta fixa cadastrada</p>
                        <button
                            onClick={() => setShowAddExpense(true)}
                            className="text-primary text-sm mt-2 hover:underline"
                        >
                            + Adicionar primeira
                        </button>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {fixedExpenses.map(expense => (
                            <div key={expense.id} className="flex items-center justify-between p-3 bg-surfaceHighlight rounded-xl">
                                <span className="text-sm text-white">{expense.name}</span>
                                <div className="flex items-center gap-3">
                                    <span className="text-danger font-semibold text-sm">
                                        {formatCurrency(expense.amount)}
                                    </span>
                                    <button
                                        onClick={() => handleRemoveFixedExpense(expense.id)}
                                        className="p-1 text-textMuted hover:text-danger transition-colors"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        <div className="flex justify-between items-center pt-2 border-t border-surfaceHighlight">
                            <span className="text-sm text-textMuted">Total Mensal:</span>
                            <span className="font-bold text-danger">
                                {formatCurrency(totalFixed)}
                            </span>
                        </div>
                    </div>
                )}
            </Card>

            {/* Budget Control */}
            <Card>
                <h3 className="font-bold text-lg text-white mb-4 flex items-center gap-2">
                    <Target size={20} className="text-amber-500" /> {t('settings.income')}
                </h3>
                <div className="space-y-4">
                    <Input
                        label="Salário Mensal Base (R$)"
                        type="number"
                        value={salary}
                        onChange={(e) => setSalary(e.target.value)}
                        placeholder="0,00"
                    />
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm text-textMuted">Limite de Gastos</label>
                            <span className="text-xl font-bold text-white">{spendingLimit}%</span>
                        </div>
                        <input
                            type="range"
                            min="10"
                            max="100"
                            step="5"
                            value={spendingLimit}
                            onChange={(e) => setSpendingLimit(e.target.value)}
                            className="w-full h-2 bg-surfaceHighlight rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                        <p className="text-xs text-textMuted mt-2">
                            O restante ({100 - parseInt(spendingLimit)}%) será sua meta de economia.
                        </p>
                    </div>
                </div>
            </Card>

            {/* Data Migration */}
            <Card className="border-zinc-800 bg-surface/50">
                <h3 className="font-bold text-lg text-white mb-4 flex items-center gap-2">
                    <FileSpreadsheet size={20} className="text-emerald-500" /> {t('settings.importData')}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="relative border border-dashed border-zinc-600 hover:border-emerald-500 bg-surfaceHighlight/20 rounded-xl p-4 flex flex-col items-center text-center transition-all group cursor-pointer">
                        <input
                            type="file"
                            accept=".csv,.xlsx,.xls"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            onChange={handleImportCSV}
                        />
                        <div className={`p-2 rounded-full bg-emerald-500/10 text-emerald-500 mb-2 ${isImporting ? 'animate-bounce' : ''}`}>
                            <UploadCloud size={20} />
                        </div>
                        <p className="font-bold text-white text-xs">
                            {isImporting ? 'Importando...' : 'Importar'}
                        </p>
                    </div>
                    <button
                        onClick={handleExportBackup}
                        className="border border-zinc-700 hover:border-primary bg-surfaceHighlight/20 rounded-xl p-4 flex flex-col items-center text-center transition-all group"
                    >
                        <div className="p-2 rounded-full bg-primary/10 text-primary mb-2">
                            <DownloadCloud size={20} />
                        </div>
                        <p className="font-bold text-white text-xs">Backup</p>
                    </button>
                </div>
            </Card>

            <div className="flex gap-4 pt-4">
                <Button variant="secondary" onClick={handleSave}>
                    <Save size={18} /> {t('settings.save')}
                </Button>
                <Button
                    variant="danger"
                    className="bg-danger/10 text-danger border border-danger/20 hover:bg-danger hover:text-white"
                    onClick={onLogout}
                >
                    <LogOut size={18} /> {t('settings.logout')}
                </Button>
            </div>

            {/* Add Fixed Expense Modal */}
            {showAddExpense && (
                <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm p-0 md:p-4">
                    <div className="bg-surface w-full max-w-sm rounded-t-2xl md:rounded-2xl border border-surfaceHighlight shadow-2xl animate-slide-up">
                        <div className="p-4 border-b border-surfaceHighlight flex justify-between items-center">
                            <h3 className="font-bold text-white">{t('settings.addFixedExpense')}</h3>
                            <button onClick={() => setShowAddExpense(false)} className="text-textMuted hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-4 space-y-4">
                            <Input
                                label={t('settings.expenseName')}
                                placeholder="Ex: Aluguel, Netflix..."
                                value={newExpenseName}
                                onChange={e => setNewExpenseName(e.target.value)}
                            />
                            <Input
                                label={t('settings.expenseAmount')}
                                type="number"
                                placeholder="0,00"
                                value={newExpenseAmount}
                                onChange={e => setNewExpenseAmount(e.target.value)}
                                isCurrency
                            />
                            <Button onClick={handleAddFixedExpense}>
                                <Plus size={18} /> {t('settings.addFixedExpense')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
