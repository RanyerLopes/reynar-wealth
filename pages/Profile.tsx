
import React, { useState, useRef } from 'react';
import { User, Mail, Camera, Lock, Save, Shield, CheckCircle, Crown, CreditCard, Sparkles, Receipt, Plus, Trash2, X, Globe, Banknote } from 'lucide-react';
import { Card, Button, Input, triggerCoinExplosion } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { useLanguage, SupportedLanguage, SupportedCurrency } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { AppRoutes } from '../types';

const Profile: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { language, setLanguage, languages, currency, setCurrency, currencies, currentCurrency, t, formatCurrency, syncPreferencesToDb } = useLanguage();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // User data state
    const [name, setName] = useState(localStorage.getItem('reynar_user_name') || user?.email?.split('@')[0] || 'Usuário');
    const [nickname, setNickname] = useState(localStorage.getItem('reynar_user_nickname') || '');
    const [email, setEmail] = useState(user?.email || 'usuario@email.com');
    const [avatar, setAvatar] = useState(localStorage.getItem('reynar_user_avatar') || '');
    const [gender, setGender] = useState(localStorage.getItem('reynar_user_gender') || 'male');

    // UI state
    const [showSuccess, setShowSuccess] = useState(false);
    const [showAddExpense, setShowAddExpense] = useState(false);

    // Plan
    const currentPlan = localStorage.getItem('finnova_plan') || 'basic';
    const isPro = currentPlan === 'pro';

    // Fixed expenses (contas fixas)
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
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        localStorage.setItem('reynar_user_name', name);
        localStorage.setItem('reynar_user_nickname', nickname);
        localStorage.setItem('reynar_user_gender', gender);
        localStorage.setItem('reynar_fixed_expenses', JSON.stringify(fixedExpenses));

        // Sync language and currency preferences to Supabase
        if (user?.id) {
            await syncPreferencesToDb(user.id);
        }

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

    const totalFixed = fixedExpenses.reduce((acc, e) => acc + e.amount, 0);

    return (
        <div className="space-y-6 animate-fade-in max-w-xl mx-auto pb-24 md:pb-0">
            {/* Success Toast */}
            {showSuccess && (
                <div className="fixed top-4 right-4 z-50 bg-secondary text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg animate-slide-up">
                    <CheckCircle size={18} />
                    Perfil salvo com sucesso!
                </div>
            )}

            <header>
                <h2 className="text-2xl font-bold text-textMain">Meu Perfil</h2>
                <p className="text-textMuted text-sm">Personalize sua experiência</p>
            </header>

            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-4 py-6">
                <div className="relative group cursor-pointer" onClick={handlePhotoClick}>
                    <div className="w-28 h-28 rounded-full bg-surfaceHighlight border-4 border-surface overflow-hidden shadow-xl">
                        {avatar ? (
                            <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-indigo-600 text-white text-3xl font-bold">
                                {(nickname || name || 'U').charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="text-white" size={24} />
                    </div>
                    {isPro && (
                        <div className="absolute bottom-0 right-0 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-surface shadow-lg flex items-center gap-1">
                            <Crown size={10} /> PRO
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
                <p className="text-textMuted text-sm">Toque para alterar a foto</p>
            </div>

            <div className="space-y-6">
                {/* Basic Info Card */}
                <Card>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <User size={20} className="text-secondary" /> Dados Pessoais
                    </h3>
                    <div className="space-y-4">
                        <Input
                            label="Nome Completo"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            icon={<User size={16} />}
                        />
                        <Input
                            label="Apelido (como quer ser chamado)"
                            value={nickname}
                            onChange={e => setNickname(e.target.value)}
                            placeholder="Ex: João, Jojo, Majestade..."
                            icon={<Sparkles size={16} />}
                        />
                        <Input
                            label="E-mail"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            icon={<Mail size={16} />}
                            disabled
                        />

                        {/* Gender Selection */}
                        <div>
                            <label className="text-sm text-textMuted mb-2 block">Gênero (para personalização)</label>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setGender('male')}
                                    className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${gender === 'male'
                                        ? 'bg-primary/20 border-primary text-primary'
                                        : 'bg-surfaceHighlight border-surfaceHighlight text-textMuted hover:border-primary/50'
                                        }`}
                                >
                                    👑 Masculino
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setGender('female')}
                                    className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${gender === 'female'
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

                {/* Language Settings Card */}
                <Card>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Globe size={20} className="text-blue-400" /> {t('profile.language')}
                    </h3>
                    <p className="text-xs text-textMuted mb-4">
                        Escolha o idioma da interface.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                        {(Object.entries(languages) as [SupportedLanguage, typeof languages['pt-BR']][]).map(([code, config]) => (
                            <button
                                key={code}
                                type="button"
                                onClick={() => setLanguage(code)}
                                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${language === code
                                    ? 'bg-primary/20 border-primary text-white'
                                    : 'bg-surfaceHighlight border-surfaceHighlight text-textMuted hover:border-primary/50'
                                    }`}
                            >
                                <span className="text-2xl">{config.flag}</span>
                                <span className="text-xs font-medium">{config.name}</span>
                                {language === code && (
                                    <CheckCircle size={14} className="text-primary" />
                                )}
                            </button>
                        ))}
                    </div>
                </Card>

                {/* Currency Settings Card */}
                <Card>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Banknote size={20} className="text-green-400" /> {t('profile.currency')}
                    </h3>
                    <p className="text-xs text-textMuted mb-4">
                        Escolha a moeda para exibição dos valores.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                        {(Object.entries(currencies) as [SupportedCurrency, typeof currencies['BRL']][]).map(([code, config]) => (
                            <button
                                key={code}
                                type="button"
                                onClick={() => setCurrency(code)}
                                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${currency === code
                                    ? 'bg-green-500/20 border-green-500 text-white'
                                    : 'bg-surfaceHighlight border-surfaceHighlight text-textMuted hover:border-green-500/50'
                                    }`}
                            >
                                <span className="text-2xl">{config.flag}</span>
                                <div className="text-center">
                                    <span className="text-xs font-medium block">{config.symbol} {config.code}</span>
                                    <span className="text-[10px] text-textMuted">{config.name}</span>
                                </div>
                                {currency === code && (
                                    <CheckCircle size={14} className="text-green-400" />
                                )}
                            </button>
                        ))}
                    </div>
                    <div className="mt-4 p-3 bg-surfaceHighlight rounded-xl text-xs text-textMuted">
                        <p>
                            <strong className="text-white">Exemplo:</strong> {formatCurrency(1234.56)}
                        </p>
                    </div>
                </Card>

                {/* Subscription Card */}
                <Card className={`${isPro ? 'bg-gradient-to-br from-amber-900/30 to-surface border-amber-500/30' : ''}`}>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Crown size={20} className={isPro ? 'text-amber-400' : 'text-primary'} /> Assinatura
                    </h3>

                    {isPro ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
                                <div className="p-2 bg-amber-500/20 rounded-lg">
                                    <Crown className="text-amber-400" size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-amber-300">Plano PRO Ativo</h4>
                                    <p className="text-xs text-amber-200/70">Você tem acesso a todos os recursos premium!</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <div className="flex items-center gap-2 text-secondary">
                                    <CheckCircle size={14} /> Importação ilimitada
                                </div>
                                <div className="flex items-center gap-2 text-secondary">
                                    <CheckCircle size={14} /> Scanner ilimitado
                                </div>
                                <div className="flex items-center gap-2 text-secondary">
                                    <CheckCircle size={14} /> Relatórios IRPF
                                </div>
                                <div className="flex items-center gap-2 text-secondary">
                                    <CheckCircle size={14} /> IA Avançada
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-4 bg-surfaceHighlight rounded-xl">
                                <div className="p-2 bg-primary/20 rounded-lg">
                                    <CreditCard className="text-primary" size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white">Plano Básico</h4>
                                    <p className="text-xs text-textMuted">Limite de 3 importações e 5 scans/mês</p>
                                </div>
                            </div>
                            <Button onClick={() => navigate(AppRoutes.PRICING)}>
                                <Crown size={18} /> Assinar PRO - R$ 29,90/mês
                            </Button>
                        </div>
                    )}
                </Card>

                {/* Fixed Expenses Card */}
                <Card>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Receipt size={20} className="text-danger" /> Contas Fixas
                        </h3>
                        <button
                            onClick={() => setShowAddExpense(true)}
                            className="p-2 rounded-lg bg-surfaceHighlight text-textMuted hover:text-white hover:bg-primary transition-colors"
                        >
                            <Plus size={18} />
                        </button>
                    </div>

                    <p className="text-xs text-textMuted mb-4">
                        Cadastre suas despesas mensais fixas para melhor controle do orçamento.
                    </p>

                    {fixedExpenses.length === 0 ? (
                        <div className="text-center py-8 text-textMuted">
                            <Receipt size={32} className="mx-auto mb-2 opacity-30" />
                            <p className="text-sm">Nenhuma conta fixa cadastrada</p>
                            <button
                                onClick={() => setShowAddExpense(true)}
                                className="text-primary text-sm mt-2 hover:underline"
                            >
                                + Adicionar primeira conta
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {fixedExpenses.map(expense => (
                                <div key={expense.id} className="flex items-center justify-between p-3 bg-surfaceHighlight rounded-xl">
                                    <div>
                                        <p className="text-sm font-medium text-white">{expense.name}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-danger font-semibold">
                                            {formatCurrency(expense.amount)}
                                        </span>
                                        <button
                                            onClick={() => handleRemoveFixedExpense(expense.id)}
                                            className="p-1 text-textMuted hover:text-danger transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <div className="flex justify-between items-center pt-3 border-t border-surfaceHighlight">
                                <span className="text-sm text-textMuted">Total Mensal:</span>
                                <span className="text-lg font-bold text-danger">
                                    {formatCurrency(totalFixed)}
                                </span>
                            </div>
                        </div>
                    )}
                </Card>

                {/* Security Card */}
                <Card>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Shield size={20} className="text-primary" /> Segurança
                    </h3>
                    <div className="space-y-4">
                        <Input label="Nova Senha" type="password" placeholder="••••••" icon={<Lock size={16} />} />
                        <Input label="Confirmar Nova Senha" type="password" placeholder="••••••" icon={<Lock size={16} />} />
                    </div>
                </Card>

                <Button type="button" onClick={handleSave}>
                    <Save size={18} /> Salvar Alterações
                </Button>
            </div>

            {/* Add Fixed Expense Modal */}
            {showAddExpense && (
                <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm p-0 md:p-4">
                    <div className="bg-surface w-full max-w-sm rounded-t-2xl md:rounded-2xl border border-surfaceHighlight shadow-2xl animate-slide-up">
                        <div className="p-6 border-b border-surfaceHighlight flex justify-between items-center">
                            <h3 className="text-lg font-bold text-white">Nova Conta Fixa</h3>
                            <button onClick={() => setShowAddExpense(false)} className="text-textMuted hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <Input
                                label="Nome da Conta"
                                placeholder="Ex: Aluguel, Netflix, Academia..."
                                value={newExpenseName}
                                onChange={e => setNewExpenseName(e.target.value)}
                            />
                            <Input
                                label="Valor Mensal (R$)"
                                type="number"
                                placeholder="0,00"
                                value={newExpenseAmount}
                                onChange={e => setNewExpenseAmount(e.target.value)}
                            />
                            <Button onClick={handleAddFixedExpense}>
                                <Plus size={18} /> Adicionar Conta Fixa
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
