
import React, { useState } from 'react';
import { Plus, CreditCard as CardIcon, Trash2, X, Check, Cpu, ShieldCheck, DollarSign, ShoppingBag, CalendarClock, CheckCircle, FileText } from 'lucide-react';
import { Card, Button, Input, triggerCoinExplosion } from '../components/UI';
import { CreditCard, Transaction } from '../types';
import { addMonths, format } from 'date-fns';
import { useGamification } from '../context/GamificationContext';
import { useCards, useTransactions } from '../hooks/useDatabase';

// Presets de Bancos Brasileiros
const BANK_PRESETS = [
    { name: 'Nubank', gradient: 'from-purple-800 to-purple-600', brand: 'mastercard', color: '#820ad1' },
    { name: 'Itaú', gradient: 'from-orange-700 to-orange-500', brand: 'visa', color: '#ec7000' },
    { name: 'Bradesco', gradient: 'from-red-700 to-red-500', brand: 'visa', color: '#cc092f' },
    { name: 'Santander', gradient: 'from-red-800 to-red-600', brand: 'mastercard', color: '#ec0000' },
    { name: 'C6 Bank', gradient: 'from-zinc-900 to-black', brand: 'mastercard', color: '#000000' },
    { name: 'Inter', gradient: 'from-orange-600 to-orange-400', brand: 'mastercard', color: '#ff7a00' },
    { name: 'XP', gradient: 'from-zinc-800 to-black', brand: 'visa', color: '#000000' },
    { name: 'BTG Pactual', gradient: 'from-blue-900 to-blue-800', brand: 'mastercard', color: '#003664' },
    { name: 'Neon', gradient: 'from-cyan-600 to-blue-500', brand: 'visa', color: '#00a3e0' },
    { name: 'Next', gradient: 'from-green-600 to-emerald-500', brand: 'visa', color: '#00ff5f' },
];

const Cards: React.FC = () => {
    const { addXp } = useGamification();
    const { cards: dbCards, addCard: addCardToDb, removeCard } = useCards();
    const { addTransaction } = useTransactions();
    const [cards, setCards] = useState<CreditCard[]>([]);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Sync with database
    React.useEffect(() => {
        setCards(dbCards);
    }, [dbCards]);

    const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [selectedCardForExpense, setSelectedCardForExpense] = useState<CreditCard | null>(null);

    const [newCardName, setNewCardName] = useState('');
    const [newCardGradient, setNewCardGradient] = useState('from-zinc-700 to-zinc-900');
    const [newCardBrand, setNewCardBrand] = useState<'mastercard' | 'visa'>('mastercard');

    const [expenseAmount, setExpenseAmount] = useState('');
    const [expenseDesc, setExpenseDesc] = useState('');
    const [expenseCategory, setExpenseCategory] = useState('');
    const [installments, setInstallments] = useState('1');

    const handleDeleteCard = (id: string) => {
        if (confirm('Remover este cartão da sua carteira?')) {
            setCards(cards.filter(c => c.id !== id));
        }
    };

    const selectBankPreset = (preset: typeof BANK_PRESETS[0]) => {
        setNewCardName(preset.name);
        setNewCardGradient(preset.gradient);
        setNewCardBrand(preset.brand as any);
    };

    const handleCreateCard = (e: React.FormEvent) => {
        e.preventDefault();
        const newCard: CreditCard = {
            id: Math.random().toString(),
            name: newCardName,
            last4Digits: '',
            limit: 0,
            closingDay: 1,
            dueDay: 10,
            brand: newCardBrand,
            colorGradient: newCardGradient
        };

        setCards([...cards, newCard]);
        setIsAddCardModalOpen(false);

        addXp(20); // Bonus for adding a card

        setNewCardName('');
        setNewCardGradient('from-zinc-700 to-zinc-900');
    };

    const openExpenseModal = (card: CreditCard) => {
        setSelectedCardForExpense(card);
        setIsExpenseModalOpen(true);
        setInstallments('1');
    };

    const handleCreateExpense = (e: React.FormEvent) => {
        e.preventDefault();
        const totalAmount = parseFloat(expenseAmount);
        const numInstallments = parseInt(installments);
        const installmentValue = totalAmount / numInstallments;

        const newTransactions: Transaction[] = [];

        for (let i = 0; i < numInstallments; i++) {
            const newTx: Transaction = {
                id: Math.random().toString(),
                description: numInstallments > 1 ? `${expenseDesc} (${i + 1}/${numInstallments})` : expenseDesc,
                amount: numInstallments > 1 ? installmentValue : totalAmount,
                type: 'expense',
                category: expenseCategory || 'Cartão de Crédito',
                date: addMonths(new Date(), i),
                cardId: selectedCardForExpense?.id,
                installmentCurrent: numInstallments > 1 ? i + 1 : undefined,
                installmentTotal: numInstallments > 1 ? numInstallments : undefined,
            };
            newTransactions.push(newTx);
        }

        const storedData = localStorage.getItem('finnova_transactions');
        const currentTransactions = storedData
            ? JSON.parse(storedData).map((t: any) => ({ ...t, date: new Date(t.date) }))
            : [];

        const updatedTransactions = [...newTransactions, ...currentTransactions];
        localStorage.setItem('finnova_transactions', JSON.stringify(updatedTransactions));

        addXp(15 * numInstallments); // XP for the purchase

        triggerCoinExplosion(window.innerWidth / 2, window.innerHeight / 2);
        setSuccessMessage(`${numInstallments > 1 ? 'Compra parcelada' : 'Compra'} registrada!`);
        setTimeout(() => setSuccessMessage(null), 3000);

        setIsExpenseModalOpen(false);
        setExpenseAmount('');
        setExpenseDesc('');
        setExpenseCategory('');
        setInstallments('1');
    };

    return (
        <div className="pb-24 md:pb-0 space-y-8 animate-fade-in relative min-h-full">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-textMain">Minha Carteira</h2>
                    <p className="text-textMuted text-sm">Gerencie seus cartões e registre gastos</p>
                </div>
                <div className="flex gap-2">
                    <label className="flex items-center gap-2 px-4 py-2 bg-surfaceHighlight border border-surfaceHighlight text-textMuted hover:text-white hover:border-primary/50 rounded-xl cursor-pointer transition-colors">
                        <input
                            type="file"
                            accept=".pdf,.csv,.ofx,.xlsx"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    // Navigate to transactions with file
                                    window.location.href = '/transactions';
                                }
                            }}
                        />
                        <FileText size={18} />
                        <span className="hidden sm:inline">Importar</span>
                    </label>
                    <Button className="!w-auto px-4 py-2" onClick={() => setIsAddCardModalOpen(true)}>
                        <Plus size={20} />
                        <span className="hidden sm:inline">Adicionar</span>
                    </Button>
                </div>
            </header>

            {/* Grid de Cartões Visuais */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {cards.map((card) => (
                    <div key={card.id} className="flex flex-col gap-3 group">
                        <div className="relative perspective">
                            {/* Cartão */}
                            <div
                                className={`w-full aspect-[1.586/1] rounded-2xl p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden transition-all duration-300 transform group-hover:-translate-y-1 bg-gradient-to-br ${card.colorGradient}`}
                            >
                                {/* Decorative Elements */}
                                <div className="absolute top-[-50%] right-[-50%] w-[100%] h-[100%] bg-white/5 rounded-full blur-3xl"></div>
                                <div className="absolute bottom-[-50%] left-[-50%] w-[80%] h-[80%] bg-black/10 rounded-full blur-3xl"></div>

                                {/* Top Row */}
                                <div className="flex justify-between items-start z-10">
                                    <Cpu size={40} strokeWidth={1} className="text-yellow-200/60" />
                                    {card.brand === 'mastercard' ? (
                                        <div className="flex -space-x-3 opacity-90">
                                            <div className="w-8 h-8 rounded-full bg-red-500 mix-blend-screen"></div>
                                            <div className="w-8 h-8 rounded-full bg-yellow-500 mix-blend-screen"></div>
                                        </div>
                                    ) : (
                                        <span className="font-bold text-white italic text-2xl opacity-90 tracking-tighter">VISA</span>
                                    )}
                                </div>

                                {/* Bottom Row */}
                                <div className="z-10">
                                    <div className="flex items-center gap-2 mb-2 opacity-60">
                                        <span className="text-white text-[10px] tracking-[0.2em] uppercase">Platinum</span>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <span className="font-bold text-white text-xl tracking-wide text-shadow">{card.name}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => handleDeleteCard(card.id)}
                                className="absolute -top-2 -right-2 bg-surface border border-surfaceHighlight text-textMuted hover:text-danger hover:border-danger p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all z-20 scale-90 group-hover:scale-100"
                                title="Remover Cartão"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>

                        <Button
                            variant="secondary"
                            className="w-full bg-surfaceHighlight border border-surfaceHighlight hover:bg-surfaceHighlight/80 hover:border-textMuted/30 transition-all"
                            onClick={() => openExpenseModal(card)}
                        >
                            <ShoppingBag size={18} />
                            Lançar Compra
                        </Button>
                    </div>
                ))}

                <button
                    onClick={() => setIsAddCardModalOpen(true)}
                    className="w-full aspect-[1.586/1] rounded-2xl border-2 border-dashed border-surfaceHighlight flex flex-col items-center justify-center text-textMuted hover:border-primary hover:text-primary hover:bg-surfaceHighlight/20 transition-all gap-2 bg-surface/30 group"
                >
                    <div className="p-4 rounded-full bg-surfaceHighlight group-hover:bg-primary/20 transition-colors">
                        <Plus size={32} />
                    </div>
                    <span className="font-medium">Adicionar Cartão</span>
                </button>
            </div>

            <div className="flex items-center gap-2 p-4 bg-surfaceHighlight/30 rounded-xl text-xs text-textMuted max-w-lg mx-auto text-center border border-surfaceHighlight">
                <ShieldCheck size={16} className="text-primary shrink-0" />
                <p>Seus dados estão seguros. Não solicitamos números, CVV ou senhas.</p>
            </div>

            {/* Modal ADICIONAR Cartão */}
            {isAddCardModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm p-0 md:p-4">
                    <div className="bg-surface w-full max-w-md rounded-t-2xl md:rounded-2xl border border-surfaceHighlight shadow-2xl animate-slide-up h-[90vh] md:h-auto flex flex-col">
                        <div className="p-6 border-b border-surfaceHighlight flex justify-between items-center sticky top-0 bg-surface z-10 shrink-0">
                            <div>
                                <h3 className="text-lg font-bold text-white">Novo Cartão</h3>
                                <p className="text-xs text-textMuted">Escolha um banco ou personalize</p>
                            </div>
                            <button onClick={() => setIsAddCardModalOpen(false)} className="text-textMuted hover:text-white"><X size={20} /></button>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                            <p className="text-xs font-semibold text-textMuted uppercase mb-3">Bancos Populares</p>
                            <div className="grid grid-cols-4 gap-3 mb-6">
                                {BANK_PRESETS.map((bank) => (
                                    <button
                                        key={bank.name}
                                        type="button"
                                        onClick={() => selectBankPreset(bank)}
                                        className={`flex flex-col items-center gap-2 p-2 rounded-xl border transition-all ${newCardName === bank.name ? 'bg-primary/20 border-primary' : 'bg-surfaceHighlight border-transparent hover:border-textMuted'}`}
                                    >
                                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${bank.gradient} shadow-sm`}></div>
                                        <span className="text-[10px] text-textMain truncate w-full text-center">{bank.name}</span>
                                    </button>
                                ))}
                            </div>

                            <form onSubmit={handleCreateCard} className="space-y-4 pt-4 border-t border-surfaceHighlight">
                                <Input
                                    label="Nome do Cartão (Apelido)"
                                    placeholder="Ex: Nubank Principal"
                                    required
                                    value={newCardName}
                                    onChange={(e) => setNewCardName(e.target.value)}
                                />

                                <div>
                                    <label className="text-xs font-medium text-textMuted uppercase tracking-wider ml-1 mb-2 block">Cor do Cartão</label>
                                    <div className="grid grid-cols-5 gap-2">
                                        {['from-zinc-800 to-black', 'from-purple-800 to-purple-600', 'from-red-700 to-red-500', 'from-orange-600 to-orange-400', 'from-blue-800 to-blue-600', 'from-green-700 to-emerald-600', 'from-pink-700 to-rose-500', 'from-yellow-600 to-amber-500'].map((grad, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => setNewCardGradient(grad)}
                                                className={`w-full aspect-square rounded-full bg-gradient-to-br ${grad} border-2 ${newCardGradient === grad ? 'border-white scale-110' : 'border-transparent hover:scale-105'} transition-all`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-textMuted uppercase tracking-wider ml-1 mb-2 block">Bandeira</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setNewCardBrand('mastercard')}
                                            className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${newCardBrand === 'mastercard' ? 'bg-primary/20 border-primary text-white' : 'bg-surfaceHighlight border-transparent text-textMuted'}`}
                                        >
                                            <div className="flex -space-x-2">
                                                <div className="w-4 h-4 rounded-full bg-red-500"></div>
                                                <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                                            </div>
                                            Mastercard
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setNewCardBrand('visa')}
                                            className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${newCardBrand === 'visa' ? 'bg-primary/20 border-primary text-white' : 'bg-surfaceHighlight border-transparent text-textMuted'}`}
                                        >
                                            <span className="font-bold italic">VISA</span>
                                        </button>
                                    </div>
                                </div>

                                <Button type="submit" className="mt-6">Adicionar à Carteira</Button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal LANÇAR DESPESA */}
            {isExpenseModalOpen && selectedCardForExpense && (
                <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm p-0 md:p-4">
                    <div className="bg-surface w-full max-w-md rounded-t-2xl md:rounded-2xl border border-surfaceHighlight shadow-2xl animate-slide-up">
                        <div className={`p-6 border-b border-surfaceHighlight flex justify-between items-center rounded-t-2xl bg-gradient-to-r ${selectedCardForExpense.colorGradient}`}>
                            <div>
                                <h3 className="text-lg font-bold text-white">Nova Compra</h3>
                                <p className="text-xs text-white/80">Usando: {selectedCardForExpense.name}</p>
                            </div>
                            <button onClick={() => setIsExpenseModalOpen(false)} className="text-white/70 hover:text-white bg-black/20 rounded-full p-1"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleCreateExpense} className="p-6 space-y-4">
                            <div className="bg-surfaceHighlight/50 p-4 rounded-xl text-center mb-2">
                                <label className="text-xs text-textMuted uppercase mb-1 block">Valor Total da Compra</label>
                                <div className="flex items-center justify-center gap-1 text-3xl font-bold text-white">
                                    <span className="text-textMuted text-lg mt-1">R$</span>
                                    <input
                                        type="number"
                                        placeholder="0,00"
                                        className="bg-transparent border-none outline-none w-32 text-center placeholder-zinc-600 focus:ring-0"
                                        autoFocus
                                        required
                                        value={expenseAmount}
                                        onChange={e => setExpenseAmount(e.target.value)}
                                    />
                                </div>
                                {expenseAmount && parseInt(installments) > 1 && (
                                    <p className="text-xs text-secondary mt-1">
                                        {installments}x de R$ {(parseFloat(expenseAmount) / parseInt(installments)).toFixed(2)}
                                    </p>
                                )}
                            </div>

                            <Input
                                label="O que você comprou?"
                                placeholder="Ex: iPhone, Tênis, Viagem"
                                required
                                value={expenseDesc}
                                onChange={e => setExpenseDesc(e.target.value)}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Categoria"
                                    placeholder="Ex: Lazer"
                                    value={expenseCategory}
                                    onChange={e => setExpenseCategory(e.target.value)}
                                />
                                <Input
                                    label="Parcelas"
                                    as="select"
                                    value={installments}
                                    onChange={e => setInstallments(e.target.value)}
                                    icon={<CalendarClock size={16} />}
                                >
                                    <option value="1">À vista (1x)</option>
                                    <option value="2">2x</option>
                                    <option value="3">3x</option>
                                    <option value="4">4x</option>
                                    <option value="5">5x</option>
                                    <option value="6">6x</option>
                                    <option value="9">9x</option>
                                    <option value="10">10x</option>
                                    <option value="12">12x</option>
                                    <option value="18">18x</option>
                                    <option value="24">24x</option>
                                </Input>
                            </div>

                            <Button type="submit" variant="danger" className="mt-4">
                                Confirmar Gasto
                            </Button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cards;
