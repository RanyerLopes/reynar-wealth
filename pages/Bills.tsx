

import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle, AlertTriangle, Calendar as CalendarIcon, Clock, RotateCw, X, List, ChevronLeft, ChevronRight, Camera, FileText, ScanLine, Loader2, Sparkles, CreditCard as CardIcon, ShoppingBag, Trash2, Cpu, ShieldCheck, CalendarClock, ArrowLeft, Wallet, PieChart, ExternalLink, Copy, Smartphone, Banknote } from 'lucide-react';
import { Card, Button, Input, Badge } from '../components/UI';
import { Bill, CreditCard, Transaction } from '../types';
import { useGamification } from '../context/GamificationContext';
import {
    format, isPast, isToday, isTomorrow, addDays, isSameDay,
    endOfMonth, endOfWeek, eachDayOfInterval,
    isSameMonth, addMonths
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CameraModal } from '../components/CameraModal';
import { AIConsultant } from '../components/AIConsultant';
import { useBills, useCards, useTransactions } from '../hooks/useDatabase';

// Presets de Bancos Brasileiros (Moved from Cards.tsx)
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

const Bills: React.FC = () => {
    const { addXp } = useGamification();

    // MAIN VIEW STATE: 'bills' or 'cards'
    const [activeSection, setActiveSection] = useState<'bills' | 'cards'>('bills');

    // --- DATABASE HOOKS ---
    const { bills: dbBills, loading: billsLoading, addBill: addBillToDb, toggleBillPaid } = useBills();
    const { cards: dbCards, loading: cardsLoading, addCard: addCardToDb, removeCard: removeCardFromDb } = useCards();
    const { transactions: dbTransactions, loading: transactionsLoading } = useTransactions();

    // --- STATE FOR BILLS ---
    const [bills, setBills] = useState<Bill[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
    const [activeTab, setActiveTab] = useState<'pending' | 'paid'>('pending');
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [category, setCategory] = useState('');
    const [isRecurrent, setIsRecurrent] = useState(false);

    // --- STATE FOR CARDS ---
    const [cards, setCards] = useState<CreditCard[]>([]);
    const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [selectedCardForExpense, setSelectedCardForExpense] = useState<CreditCard | null>(null);
    const [selectedCardInvoice, setSelectedCardInvoice] = useState<CreditCard | null>(null); // Controls Detail View

    const [newCardName, setNewCardName] = useState('');
    const [newCardGradient, setNewCardGradient] = useState('from-zinc-700 to-zinc-900');
    const [newCardBrand, setNewCardBrand] = useState<'mastercard' | 'visa'>('mastercard');
    const [newCardLimit, setNewCardLimit] = useState('');

    const [expenseAmount, setExpenseAmount] = useState('');
    const [expenseDesc, setExpenseDesc] = useState('');
    const [expenseCategory, setExpenseCategory] = useState('');
    const [installments, setInstallments] = useState('1');

    // --- GLOBAL TRANSACTIONS (For Invoice Filtering) ---
    const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);

    // --- SHARED STATE ---
    const [showCamera, setShowCamera] = useState(false);
    const [billImage, setBillImage] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Sync database data with local state
    useEffect(() => {
        setBills(dbBills);
    }, [dbBills]);

    useEffect(() => {
        setCards(dbCards);
    }, [dbCards]);

    useEffect(() => {
        setAllTransactions(dbTransactions);
    }, [dbTransactions]);

    // --- LOGIC FOR BILLS ---
    const pendingBills = bills.filter(b => !b.isPaid).sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
    const paidBills = bills.filter(b => b.isPaid).sort((a, b) => b.dueDate.getTime() - a.dueDate.getTime());

    // Calendar Logic
    const startCurrentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const calendarStart = addDays(startCurrentMonth, -startCurrentMonth.getDay());
    const calendarEnd = endOfWeek(endOfMonth(currentMonth));
    const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    const billsOnSelectedDate = bills.filter(b => isSameDay(b.dueDate, selectedDate));

    const handleTogglePaid = (id: string) => {
        setBills(prev => prev.map(b => {
            if (b.id === id) {
                // Se está marcando como PAGA (era não paga)
                if (!b.isPaid) {
                    addXp(50);

                    // Criar transação correspondente se ainda não existe
                    if (!b.linkedTransactionId) {
                        const newTransactionId = Math.random().toString();
                        const newTransaction: Transaction = {
                            id: newTransactionId,
                            description: b.description,
                            amount: b.amount,
                            type: 'expense',
                            category: b.category || 'Outros',
                            date: new Date(), // Data do pagamento
                        };

                        // Atualizar lista de transações
                        const updatedTransactions = [newTransaction, ...allTransactions];
                        setAllTransactions(updatedTransactions);
                        localStorage.setItem('finnova_transactions', JSON.stringify(updatedTransactions));

                        return { ...b, isPaid: true, linkedTransactionId: newTransactionId };
                    }

                    return { ...b, isPaid: true };
                } else {
                    // Se está desmarcando (era paga, voltando a não paga)
                    // Remover a transação correspondente se existir
                    if (b.linkedTransactionId) {
                        const updatedTransactions = allTransactions.filter(t => t.id !== b.linkedTransactionId);
                        setAllTransactions(updatedTransactions);
                        localStorage.setItem('finnova_transactions', JSON.stringify(updatedTransactions));
                    }
                    return { ...b, isPaid: false, linkedTransactionId: undefined };
                }
            }
            return b;
        }));
    };

    const handleCameraCapture = (imageData: string) => {
        setBillImage(imageData);
        setShowCamera(false);

        // Open modal if not open (e.g. from banner)
        if (!isModalOpen) setIsModalOpen(true);

        setIsAnalyzing(true);

        // Simulate AI processing
        setTimeout(() => {
            setIsAnalyzing(false);
            // Mock data read from invoice
            setDescription('Conta de Energia Elétrica');
            setAmount('154.30');
            setCategory('Moradia');
            setDueDate(new Date().toISOString().split('T')[0]); // Sets today as due date for demo
            addXp(15);
        }, 2000);
    };

    const handleSubmitBill = (e: React.FormEvent) => {
        e.preventDefault();
        const [year, month, day] = dueDate.split('-').map(Number);
        const dateObj = new Date(year, month - 1, day, 12, 0, 0);

        const newBill: Bill = {
            id: Math.random().toString(),
            description,
            amount: parseFloat(amount),
            dueDate: dateObj,
            isPaid: false,
            category,
            isRecurrent,
            recurrenceFrequency: isRecurrent ? 'monthly' : undefined,
            attachmentUrl: billImage || undefined
        };
        setBills([...bills, newBill]);
        setIsModalOpen(false);

        // Reset Form
        setDescription('');
        setAmount('');
        setDueDate('');
        setCategory('');
        setIsRecurrent(false);
        setBillImage(null);
    };

    const getStatusInfo = (date: Date) => {
        if (isPast(date) && !isToday(date)) return { color: 'text-danger', bg: 'bg-danger/10', border: 'border-danger/30', label: 'Atrasada', icon: AlertTriangle };
        if (isToday(date)) return { color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30', label: 'Vence Hoje', icon: Clock };
        if (isTomorrow(date)) return { color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30', label: 'Vence Amanhã', icon: Clock };
        return { color: 'text-textMuted', bg: 'bg-surfaceHighlight', border: 'border-surfaceHighlight', label: format(date, 'dd/MM'), icon: CalendarIcon };
    };

    const BillItem: React.FC<{ bill: Bill }> = ({ bill }) => {
        const status = getStatusInfo(bill.dueDate);
        const StatusIcon = status.icon;

        return (
            <div className={`flex items-center justify-between p-4 bg-surface border ${status.border} rounded-xl mb-3 animate-fade-in-up transition-all hover:bg-opacity-80`}>
                <div className="flex items-center gap-4">
                    <div
                        onClick={() => handleTogglePaid(bill.id)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors ${bill.isPaid ? 'bg-secondary border-secondary' : 'border-zinc-600 hover:border-secondary'}`}
                    >
                        {bill.isPaid && <CheckCircle size={14} className="text-white" />}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <p className={`font-semibold ${bill.isPaid ? 'text-textMuted line-through' : 'text-textMain'}`}>{bill.description}</p>
                            {bill.isRecurrent && <RotateCw size={12} className="text-textMuted" />}
                            {bill.attachmentUrl && <FileText size={12} className="text-primary" />}
                        </div>
                        <div className={`flex items-center gap-1 text-xs font-medium mt-0.5 ${!bill.isPaid ? status.color : 'text-textMuted'}`}>
                            <StatusIcon size={12} />
                            <span>{bill.isPaid ? `Paga em ${format(bill.dueDate, 'dd/MM')}` : status.label}</span>
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <p className={`font-bold ${bill.isPaid ? 'text-textMuted' : 'text-textMain'}`}>R$ {bill.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    <p className="text-[10px] text-textMuted uppercase">{bill.category}</p>
                </div>
            </div>
        );
    };


    // --- LOGIC FOR CARDS ---
    const handleDeleteCard = (id: string) => {
        if (confirm('Remover este cartão da sua carteira?')) {
            setCards(cards.filter(c => c.id !== id));
            if (selectedCardInvoice?.id === id) setSelectedCardInvoice(null);
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
            last4Digits: '****',
            limit: parseFloat(newCardLimit) || 1000,
            closingDay: 1,
            dueDay: 10,
            brand: newCardBrand,
            colorGradient: newCardGradient
        };

        setCards([...cards, newCard]);
        setIsAddCardModalOpen(false);
        addXp(20);

        setNewCardName('');
        setNewCardLimit('');
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

        const updatedTransactions = [...newTransactions, ...allTransactions];

        // Update State
        setAllTransactions(updatedTransactions);
        // Persist
        localStorage.setItem('finnova_transactions', JSON.stringify(updatedTransactions));

        addXp(15 * numInstallments); // XP for the purchase

        setIsExpenseModalOpen(false);
        setExpenseAmount('');
        setExpenseDesc('');
        setExpenseCategory('');
        setInstallments('1');
    };

    // --- BANK DEEP LINKS ---
    const BANK_DEEP_LINKS: Record<string, { ios: string; android: string; web: string }> = {
        'Nubank': { ios: 'nubank://', android: 'com.nu.production', web: 'https://app.nubank.com.br' },
        'Itaú': { ios: 'itau://', android: 'com.itau', web: 'https://www.itau.com.br/app' },
        'Bradesco': { ios: 'bradesco://', android: 'com.bradesco', web: 'https://banco.bradesco/app' },
        'Santander': { ios: 'santander://', android: 'com.santander.app', web: 'https://www.santander.com.br/app' },
        'BB': { ios: 'bb://', android: 'br.com.bb.android', web: 'https://www.bb.com.br/app' },
        'Caixa': { ios: 'caixa://', android: 'br.com.gabba.Caixa', web: 'https://www.caixa.gov.br/app' },
        'Inter': { ios: 'bancointer://', android: 'br.com.intermedium', web: 'https://www.bancointer.com.br/app' },
        'C6': { ios: 'c6bank://', android: 'com.c6bank.app', web: 'https://www.c6bank.com.br/app' },
        'PicPay': { ios: 'picpay://', android: 'com.picpay', web: 'https://www.picpay.com/app' },
        'PagBank': { ios: 'pagseguro://', android: 'br.com.uol.ps.myaccount', web: 'https://pagseguro.uol.com.br/app' },
    };

    const openBankApp = (bankName: string) => {
        const links = BANK_DEEP_LINKS[bankName];
        if (!links) {
            alert(`Não temos o link para o app do ${bankName}. Abra manualmente o app do seu banco.`);
            return;
        }

        // Detect platform
        const userAgent = navigator.userAgent.toLowerCase();
        const isIOS = /iphone|ipad|ipod/.test(userAgent);
        const isAndroid = /android/.test(userAgent);

        if (isIOS) {
            window.location.href = links.ios;
            setTimeout(() => window.open(links.web, '_blank'), 500);
        } else if (isAndroid) {
            window.location.href = `intent://#Intent;package=${links.android};end`;
            setTimeout(() => window.open(links.web, '_blank'), 500);
        } else {
            window.open(links.web, '_blank');
        }
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch {
            return false;
        }
    };

    // --- INVOICE VIEW COMPONENT ---
    const InvoiceView = ({ card }: { card: CreditCard }) => {
        const [showPaymentOptions, setShowPaymentOptions] = useState(false);
        const [barcodeInput, setBarcodeInput] = useState('');
        const [showBarcodeModal, setShowBarcodeModal] = useState(false);
        const [invoicePaid, setInvoicePaid] = useState(false);
        const [copiedBarcode, setCopiedBarcode] = useState(false);

        // Filter transactions for this card
        const cardTransactions = allTransactions.filter(t => t.cardId === card.id).sort((a, b) => b.date.getTime() - a.date.getTime());
        const invoiceTotal = cardTransactions.reduce((acc, t) => acc + t.amount, 0);
        const limitUsedPercent = Math.min((invoiceTotal / card.limit) * 100, 100);
        const availableLimit = Math.max(0, card.limit - invoiceTotal);

        // Get stored barcode for this card
        const storedBarcode = localStorage.getItem(`invoice_barcode_${card.id}`) || '';

        const handlePayInvoice = () => {
            // Clear all transactions for this card (simulate payment)
            const clearedTransactions = allTransactions.filter(t => t.cardId !== card.id);
            setAllTransactions(clearedTransactions);
            localStorage.setItem('finnova_transactions', JSON.stringify(clearedTransactions));

            // Clear barcode
            localStorage.removeItem(`invoice_barcode_${card.id}`);

            setInvoicePaid(true);
            addXp(100);

            setTimeout(() => {
                setShowPaymentOptions(false);
                setInvoicePaid(false);
            }, 2000);
        };

        const handleSaveBarcode = () => {
            if (barcodeInput.trim()) {
                localStorage.setItem(`invoice_barcode_${card.id}`, barcodeInput.trim());
                setShowBarcodeModal(false);
                setBarcodeInput('');
            }
        };

        const handleCopyBarcode = async () => {
            const barcode = storedBarcode || barcodeInput;
            if (barcode) {
                const success = await copyToClipboard(barcode);
                if (success) {
                    setCopiedBarcode(true);
                    setTimeout(() => setCopiedBarcode(false), 2000);
                }
            }
        };

        return (
            <div className="animate-slide-up space-y-6">
                <div className="flex items-center gap-3">
                    <button onClick={() => setSelectedCardInvoice(null)} className="p-2 bg-surfaceHighlight rounded-full text-white hover:bg-primary transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <h3 className="text-xl font-bold text-white">{card.name}</h3>
                    {invoicePaid && <Badge className="bg-secondary text-black">✓ Paga</Badge>}
                </div>

                {/* Card Summary Header */}
                <div className={`w-full rounded-2xl p-6 bg-gradient-to-br ${card.colorGradient} shadow-2xl relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 p-6 opacity-20">
                        <Cpu size={64} className="text-white" />
                    </div>

                    <div className="relative z-10">
                        <p className="text-white/80 text-xs font-medium uppercase tracking-wider mb-1">Fatura Atual</p>
                        <h2 className={`text-4xl font-bold text-white mb-6 ${invoicePaid ? 'line-through opacity-50' : ''}`}>
                            R$ {invoiceTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </h2>

                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-white/90">
                                <span>Limite Utilizado</span>
                                <span>{invoicePaid ? '0' : limitUsedPercent.toFixed(0)}%</span>
                            </div>
                            <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden">
                                <div className="h-full bg-white transition-all duration-1000" style={{ width: invoicePaid ? '0%' : `${limitUsedPercent}%` }}></div>
                            </div>
                            <p className="text-xs text-white/70 text-right pt-1">Disponível: R$ {(invoicePaid ? card.limit : availableLimit).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-3">
                    <Button
                        className="flex-1"
                        variant="secondary"
                        onClick={() => openExpenseModal(card)}
                    >
                        <Plus size={18} /> Lançar Compra
                    </Button>
                    <Button
                        className="flex-1"
                        onClick={() => setShowPaymentOptions(!showPaymentOptions)}
                        disabled={invoiceTotal === 0}
                    >
                        <Banknote size={18} /> Pagar Fatura
                    </Button>
                </div>

                {/* Payment Options Panel */}
                {showPaymentOptions && invoiceTotal > 0 && (
                    <div className="bg-surface border border-surfaceHighlight rounded-2xl p-4 space-y-4 animate-slide-up">
                        <h4 className="font-bold text-white flex items-center gap-2">
                            <Wallet size={18} className="text-primary" /> Opções de Pagamento
                        </h4>

                        {/* Open Bank App */}
                        <button
                            onClick={() => openBankApp(card.name)}
                            className="w-full flex items-center gap-4 p-4 bg-surfaceHighlight hover:bg-primary/20 rounded-xl transition-all group"
                        >
                            <div className="p-3 bg-primary/20 rounded-xl text-primary group-hover:bg-primary group-hover:text-black transition-colors">
                                <Smartphone size={24} />
                            </div>
                            <div className="text-left flex-1">
                                <p className="font-semibold text-white">Abrir App do Banco</p>
                                <p className="text-xs text-textMuted">Ir para o app {card.name} para pagar</p>
                            </div>
                            <ExternalLink size={18} className="text-textMuted group-hover:text-primary" />
                        </button>

                        {/* Barcode Section */}
                        <div className="space-y-2">
                            {storedBarcode ? (
                                <div className="w-full flex items-center gap-3 p-4 bg-surfaceHighlight rounded-xl">
                                    <div className="p-3 bg-secondary/20 rounded-xl text-secondary">
                                        <ScanLine size={24} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-textMuted">Código de Barras</p>
                                        <p className="text-sm text-white font-mono truncate">{storedBarcode}</p>
                                    </div>
                                    <button
                                        onClick={handleCopyBarcode}
                                        className={`p-2 rounded-lg transition-all ${copiedBarcode ? 'bg-secondary text-black' : 'bg-surface hover:bg-primary/20 text-textMuted hover:text-primary'}`}
                                    >
                                        {copiedBarcode ? <CheckCircle size={18} /> : <Copy size={18} />}
                                    </button>
                                    <button
                                        onClick={() => setShowBarcodeModal(true)}
                                        className="p-2 bg-surface hover:bg-primary/20 rounded-lg text-textMuted hover:text-primary transition-all"
                                    >
                                        <FileText size={18} />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowBarcodeModal(true)}
                                    className="w-full flex items-center gap-4 p-4 bg-surfaceHighlight hover:bg-primary/20 rounded-xl transition-all group"
                                >
                                    <div className="p-3 bg-secondary/20 rounded-xl text-secondary">
                                        <ScanLine size={24} />
                                    </div>
                                    <div className="text-left flex-1">
                                        <p className="font-semibold text-white">Adicionar Código de Barras</p>
                                        <p className="text-xs text-textMuted">Cole o código para copiar depois</p>
                                    </div>
                                    <Plus size={18} className="text-textMuted" />
                                </button>
                            )}
                        </div>

                        {/* Mark as Paid */}
                        <button
                            onClick={handlePayInvoice}
                            className="w-full flex items-center gap-4 p-4 bg-secondary/10 hover:bg-secondary/20 border border-secondary/30 rounded-xl transition-all group"
                        >
                            <div className="p-3 bg-secondary/20 rounded-xl text-secondary group-hover:bg-secondary group-hover:text-black transition-colors">
                                <CheckCircle size={24} />
                            </div>
                            <div className="text-left flex-1">
                                <p className="font-semibold text-white">Marcar como Paga</p>
                                <p className="text-xs text-textMuted">Limpar fatura e ganhar +100 XP</p>
                            </div>
                        </button>
                    </div>
                )}

                {/* Barcode Input Modal */}
                {showBarcodeModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
                        <div className="bg-surface w-full max-w-md rounded-2xl border border-surfaceHighlight shadow-2xl animate-slide-up">
                            <div className="p-6 border-b border-surfaceHighlight flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-bold text-white">Código de Barras</h3>
                                    <p className="text-xs text-textMuted">Cole o código da fatura</p>
                                </div>
                                <button onClick={() => setShowBarcodeModal(false)} className="text-textMuted hover:text-white p-2 hover:bg-surfaceHighlight rounded-lg transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="text-xs font-medium text-textMuted uppercase tracking-wider ml-1 mb-2 block">Código de Barras / Linha Digitável</label>
                                    <textarea
                                        value={barcodeInput}
                                        onChange={(e) => setBarcodeInput(e.target.value)}
                                        placeholder="Cole aqui o código de barras ou linha digitável da sua fatura..."
                                        className="w-full bg-surfaceHighlight border border-surfaceHighlight rounded-xl p-4 text-white font-mono text-sm resize-none h-24 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <Button variant="secondary" className="flex-1" onClick={() => setShowBarcodeModal(false)}>
                                        Cancelar
                                    </Button>
                                    <Button className="flex-1" onClick={handleSaveBarcode} disabled={!barcodeInput.trim()}>
                                        <CheckCircle size={18} /> Salvar
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Transactions List */}
                <div className="bg-surface border border-surfaceHighlight rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-surfaceHighlight flex justify-between items-center">
                        <h4 className="font-bold text-textMain flex items-center gap-2">
                            <List size={18} className="text-primary" /> Histórico da Fatura
                        </h4>
                        <span className="text-xs text-textMuted">{cardTransactions.length} lançamentos</span>
                    </div>

                    <div className="divide-y divide-surfaceHighlight">
                        {cardTransactions.length === 0 ? (
                            <div className="p-8 text-center text-textMuted text-sm">
                                <ShoppingBag size={32} className="mx-auto mb-2 opacity-20" />
                                Nenhuma compra registrada neste cartão.
                            </div>
                        ) : (
                            cardTransactions.map(t => (
                                <div key={t.id} className="p-4 flex justify-between items-center hover:bg-surfaceHighlight/30 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-surfaceHighlight rounded-lg text-textMuted">
                                            <ShoppingBag size={16} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-textMain">{t.description}</p>
                                            <p className="text-xs text-textMuted">{format(t.date, 'dd/MM')} • {t.category}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-bold text-textMain">R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                        {t.installmentTotal && (
                                            <p className="text-[10px] text-textMuted">{t.installmentCurrent}/{t.installmentTotal}</p>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        );
    };


    return (
        <div className="pb-24 md:pb-0 space-y-6 animate-fade-in relative min-h-screen">
            {/* CAMERA MODAL (Shared) */}
            {showCamera && (
                <CameraModal
                    onCapture={handleCameraCapture}
                    onClose={() => setShowCamera(false)}
                    title="Fotografar Fatura"
                />
            )}

            {/* HEADER */}
            {!selectedCardInvoice && (
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-textMain">Contas & Cartões</h2>
                        <p className="text-textMuted text-sm">Centralize suas dívidas e vencimentos</p>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto no-scrollbar">
                        {/* Main Section Switcher */}
                        <div className="flex bg-surfaceHighlight p-1 rounded-xl shrink-0">
                            <button
                                onClick={() => setActiveSection('bills')}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${activeSection === 'bills' ? 'bg-surface shadow-sm text-white' : 'text-textMuted hover:text-white'}`}
                            >
                                <CalendarIcon size={16} /> Contas Fixas
                            </button>
                            <button
                                onClick={() => setActiveSection('cards')}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${activeSection === 'cards' ? 'bg-surface shadow-sm text-white' : 'text-textMuted hover:text-white'}`}
                            >
                                <CardIcon size={16} /> Cartões
                            </button>
                        </div>
                    </div>
                </header>
            )}

            <AIConsultant context="bills" compact />

            {/* --- SECTION: BILLS --- */}
            {activeSection === 'bills' && !selectedCardInvoice && (
                <div className="space-y-6 animate-slide-up">
                    {/* Actions & Filters */}
                    <div className="flex justify-between items-center">
                        <div className="flex bg-surfaceHighlight p-1 rounded-xl">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-surface text-white shadow-sm' : 'text-textMuted hover:text-white'}`}
                                title="Lista"
                            >
                                <List size={20} />
                            </button>
                            <button
                                onClick={() => setViewMode('calendar')}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'calendar' ? 'bg-surface text-white shadow-sm' : 'text-textMuted hover:text-white'}`}
                                title="Calendário"
                            >
                                <CalendarIcon size={20} />
                            </button>
                        </div>

                        <Button className="!w-auto px-4 py-2" onClick={() => { setBillImage(null); setIsModalOpen(true); }}>
                            <Plus size={20} />
                            <span className="hidden sm:inline">Nova Conta</span>
                        </Button>
                    </div>

                    {/* Total Summary */}
                    <div className="grid grid-cols-2 gap-4">
                        <Card className="bg-gradient-to-br from-surface to-surfaceHighlight">
                            <p className="text-textMuted text-xs uppercase mb-1">A Pagar (Total)</p>
                            <h3 className="text-2xl font-bold text-white">R$ {pendingBills.reduce((acc, b) => acc + b.amount, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                        </Card>
                        <Card>
                            <p className="text-textMuted text-xs uppercase mb-1">Próximos 7 dias</p>
                            <h3 className="text-2xl font-bold text-amber-500">R$ {pendingBills.filter(b => b.dueDate <= addDays(new Date(), 7)).reduce((acc, b) => acc + b.amount, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                        </Card>
                    </div>

                    {/* EXPLANATORY CAMERA BANNER */}
                    <div className="bg-gradient-to-r from-primary/10 to-indigo-900/20 border border-primary/20 rounded-xl p-4 flex items-center justify-between relative overflow-hidden group shadow-lg">
                        <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Camera size={80} />
                        </div>
                        <div className="relative z-10 flex-1 pr-4">
                            <h4 className="font-bold text-white flex items-center gap-2 mb-1">
                                <ScanLine size={18} className="text-primary" /> Digitalize Boletos
                            </h4>
                            <p className="text-xs text-textMuted leading-relaxed">
                                Use a câmera para anexar contas físicas e manter tudo centralizado.
                            </p>
                        </div>
                        <Button
                            variant="secondary"
                            className="!w-auto h-10 w-10 !p-0 rounded-full flex items-center justify-center shrink-0 z-10 shadow-md shadow-black/50"
                            onClick={() => { setBillImage(null); setShowCamera(true); }}
                            title="Abrir Câmera"
                        >
                            <Camera size={18} />
                        </Button>
                    </div>

                    {/* CONTENT AREA */}
                    {viewMode === 'list' ? (
                        <>
                            <div className="flex gap-2 bg-surfaceHighlight p-1 rounded-xl w-fit">
                                <button
                                    onClick={() => setActiveTab('pending')}
                                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'pending' ? 'bg-surface shadow-sm text-textMain' : 'text-textMuted hover:text-white'}`}
                                >
                                    Pendentes ({pendingBills.length})
                                </button>
                                <button
                                    onClick={() => setActiveTab('paid')}
                                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'paid' ? 'bg-surface shadow-sm text-textMain' : 'text-textMuted hover:text-white'}`}
                                >
                                    Pagas
                                </button>
                            </div>

                            <div>
                                {activeTab === 'pending' ? (
                                    <>
                                        {pendingBills.length === 0 ? (
                                            <div className="text-center py-20 text-textMuted">
                                                <CheckCircle size={48} className="mx-auto mb-4 text-secondary/50" />
                                                <p>Tudo pago! Nenhuma conta pendente.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {pendingBills.some(b => isPast(b.dueDate) && !isToday(b.dueDate)) && (
                                                    <div>
                                                        <h4 className="text-danger font-semibold text-sm mb-2 flex items-center gap-2"><AlertTriangle size={14} /> Atrasadas</h4>
                                                        {pendingBills.filter(b => isPast(b.dueDate) && !isToday(b.dueDate)).map(b => <BillItem key={b.id} bill={b} />)}
                                                    </div>
                                                )}
                                                {pendingBills.some(b => isToday(b.dueDate) || isTomorrow(b.dueDate)) && (
                                                    <div>
                                                        <h4 className="text-amber-500 font-semibold text-sm mb-2 flex items-center gap-2"><Clock size={14} /> Vencendo Agora</h4>
                                                        {pendingBills.filter(b => isToday(b.dueDate) || isTomorrow(b.dueDate)).map(b => <BillItem key={b.id} bill={b} />)}
                                                    </div>
                                                )}
                                                {pendingBills.some(b => !isPast(b.dueDate) && !isToday(b.dueDate) && !isTomorrow(b.dueDate)) && (
                                                    <div>
                                                        <h4 className="text-textMuted font-semibold text-sm mb-2 flex items-center gap-2"><CalendarIcon size={14} /> Próximas</h4>
                                                        {pendingBills.filter(b => !isPast(b.dueDate) && !isToday(b.dueDate) && !isTomorrow(b.dueDate)).map(b => <BillItem key={b.id} bill={b} />)}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="space-y-2 opacity-60">
                                        {paidBills.map(b => <BillItem key={b.id} bill={b} />)}
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        // CALENDAR VIEW (AGENDA STYLE)
                        <div className="space-y-6 animate-fade-in">
                            <Card className="p-4">
                                <div className="flex justify-between items-center mb-6">
                                    <button onClick={() => setCurrentMonth(addMonths(currentMonth, -1))} className="p-2 hover:bg-surfaceHighlight rounded-lg text-textMuted hover:text-white">
                                        <ChevronLeft size={20} />
                                    </button>
                                    <h3 className="font-bold text-lg capitalize">{format(currentMonth, 'MMMM yyyy', { locale: ptBR })}</h3>
                                    <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-surfaceHighlight rounded-lg text-textMuted hover:text-white">
                                        <ChevronRight size={20} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-7 mb-2">
                                    {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
                                        <div key={i} className="text-center text-xs text-textMuted font-medium py-1 uppercase tracking-wider">
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-7 gap-1">
                                    {calendarDays.map((day, i) => {
                                        const isSelected = isSameDay(day, selectedDate);
                                        const isCurrentMonth = isSameMonth(day, currentMonth);
                                        const isTodayDate = isToday(day);

                                        const daysBills = bills.filter(b => isSameDay(b.dueDate, day));

                                        return (
                                            <button
                                                key={i}
                                                onClick={() => setSelectedDate(day)}
                                                className={`
                                                min-h-[100px] rounded-lg flex flex-col items-start justify-start p-1.5 relative transition-all border
                                                ${isSelected ? 'bg-surfaceHighlight border-primary/50' : 'border-surfaceHighlight/50 bg-surface/30 hover:bg-surfaceHighlight'}
                                                ${!isCurrentMonth ? 'opacity-30' : ''}
                                            `}
                                            >
                                                <span className={`text-xs font-medium self-end mb-1 ${isTodayDate ? 'text-primary bg-primary/20 px-1.5 rounded-full' : 'text-textMuted'}`}>
                                                    {format(day, 'd')}
                                                </span>

                                                {/* LISTA DE CONTAS NO DIA */}
                                                <div className="w-full flex flex-col gap-1 overflow-hidden">
                                                    {daysBills.slice(0, 3).map((bill) => {
                                                        let styleClass = "bg-surfaceHighlight text-textMuted"; // Default: Future

                                                        if (bill.isPaid) {
                                                            styleClass = "bg-secondary/10 text-secondary line-through opacity-70";
                                                        } else if (isPast(bill.dueDate) && !isToday(bill.dueDate)) {
                                                            styleClass = "bg-danger/20 text-danger font-medium";
                                                        } else if (isToday(bill.dueDate)) {
                                                            styleClass = "bg-amber-500/20 text-amber-500 font-medium";
                                                        }

                                                        return (
                                                            <div key={bill.id} className={`text-[9px] px-1.5 py-0.5 rounded w-full text-left truncate leading-tight ${styleClass}`}>
                                                                {bill.description}
                                                            </div>
                                                        );
                                                    })}

                                                    {daysBills.length > 3 && (
                                                        <span className="text-[9px] text-textMuted px-1">+ {daysBills.length - 3} mais</span>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </Card>

                            <div className="space-y-2">
                                <h4 className="text-sm font-semibold text-textMuted uppercase flex items-center gap-2">
                                    <List size={14} /> Detalhes de {format(selectedDate, 'dd/MM')}
                                </h4>

                                {billsOnSelectedDate.length > 0 ? (
                                    billsOnSelectedDate.map(bill => <BillItem key={bill.id} bill={bill} />)
                                ) : (
                                    <div className="p-6 bg-surface border border-dashed border-surfaceHighlight rounded-xl text-center text-textMuted text-sm">
                                        Nenhuma conta vence neste dia.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* --- SECTION: CARDS --- */}
            {activeSection === 'cards' && (
                <>
                    {/* INVOICE DETAIL VIEW */}
                    {selectedCardInvoice ? (
                        <InvoiceView card={selectedCardInvoice} />
                    ) : (
                        // CARD GRID VIEW
                        <div className="space-y-6 animate-slide-up">
                            {/* Grid de Cartões Visuais */}
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {cards.map((card) => (
                                    <div key={card.id} className="flex flex-col gap-3 group">
                                        <div className="relative perspective cursor-pointer" onClick={() => setSelectedCardInvoice(card)}>
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
                                                        <p className="text-xs text-white/70">Toque para ver fatura</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDeleteCard(card.id); }}
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
                                            Lançar Compra Rápida
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

                            {/* Import Card Statement Banner */}
                            <div className="bg-gradient-to-r from-indigo-900/30 to-primary/10 border border-primary/20 rounded-xl p-4 flex items-center justify-between relative overflow-hidden group shadow-lg max-w-lg mx-auto">
                                <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <FileText size={60} />
                                </div>
                                <div className="relative z-10 flex-1 pr-4">
                                    <h4 className="font-bold text-white flex items-center gap-2 mb-1">
                                        <FileText size={18} className="text-primary" /> Importar Extrato
                                    </h4>
                                    <p className="text-xs text-textMuted leading-relaxed">
                                        Envie o extrato do cartão (PDF) para importar suas compras automaticamente.
                                    </p>
                                </div>
                                <label className="shrink-0 z-10 cursor-pointer">
                                    <input
                                        type="file"
                                        accept=".pdf,.csv,.ofx,.xlsx"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                // Navigate to transactions page for import processing
                                                window.location.href = '/#/transactions';
                                            }
                                        }}
                                    />
                                    <div className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-xl font-medium text-sm transition-colors shadow-md shadow-primary/30">
                                        <Plus size={16} /> Enviar Arquivo
                                    </div>
                                </label>
                            </div>

                            <div className="flex items-center gap-2 p-4 bg-surfaceHighlight/30 rounded-xl text-xs text-textMuted max-w-lg mx-auto text-center border border-surfaceHighlight">
                                <ShieldCheck size={16} className="text-primary shrink-0" />
                                <p>Toque em um cartão para ver o histórico detalhado de compras.</p>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* --- MODALS --- */}

            {/* ADD BILL MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm p-0 md:p-4 animate-fade-in">
                    <div className="bg-surface w-full max-w-md rounded-t-2xl md:rounded-2xl border border-surfaceHighlight shadow-2xl animate-slide-up relative">

                        {isAnalyzing && (
                            <div className="absolute inset-0 z-[60] bg-surface/90 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center text-center p-6 animate-fade-in">
                                <div className="relative mb-4">
                                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
                                    <Loader2 size={48} className="text-primary animate-spin relative z-10" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Lendo Boleto</h3>
                                <p className="text-textMuted text-sm">Nossa IA está extraindo os dados do papel...</p>
                                <div className="mt-6 flex items-center gap-2 text-xs text-secondary bg-secondary/10 px-3 py-1 rounded-full">
                                    <Sparkles size={12} /> Inteligência Artificial Reynar
                                </div>
                            </div>
                        )}

                        <div className="p-6 border-b border-surfaceHighlight flex justify-between items-center">
                            <h3 className="text-lg font-bold text-white">Adicionar Conta</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-textMuted hover:text-white"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmitBill} className="p-6 space-y-4">
                            <Input
                                label="Descrição"
                                placeholder="Ex: Aluguel, Internet"
                                required
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                            />
                            <Input
                                label="Valor"
                                type="number"
                                placeholder="0,00"
                                required
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                            />
                            <Input
                                label="Data de Vencimento"
                                type="date"
                                required
                                value={dueDate}
                                onChange={e => setDueDate(e.target.value)}
                            />
                            <Input
                                label="Categoria"
                                placeholder="Ex: Moradia"
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                            />

                            {/* Invoice Scan Button */}
                            <div>
                                <label className="text-xs font-medium text-textMuted uppercase tracking-wider ml-1 mb-2 block">Foto da Fatura / Boleto</label>
                                <button
                                    type="button"
                                    onClick={() => setShowCamera(true)}
                                    className="w-full p-3 border-2 border-dashed border-surfaceHighlight rounded-xl flex items-center justify-center gap-2 text-textMuted hover:text-white hover:border-primary transition-colors bg-surfaceHighlight/30"
                                >
                                    {billImage ? (
                                        <div className="relative w-full">
                                            <img src={billImage} alt="Fatura" className="h-32 w-full object-cover rounded-lg" />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                                                <Camera size={24} className="text-white" />
                                                <span className="ml-2 font-bold text-white">Refazer</span>
                                            </div>
                                            <div className="absolute bottom-2 left-2 px-2 py-1 bg-primary/80 text-white text-[10px] font-bold rounded">
                                                Processado
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <Camera size={20} />
                                            <span>Tirar Foto</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-surfaceHighlight rounded-xl cursor-pointer" onClick={() => setIsRecurrent(!isRecurrent)}>
                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isRecurrent ? 'bg-primary border-primary' : 'border-zinc-500'}`}>
                                    {isRecurrent && <CheckCircle size={14} className="text-white" />}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-textMain">Conta Recorrente</p>
                                    <p className="text-xs text-textMuted">Repetir todo mês</p>
                                </div>
                            </div>

                            <Button type="submit" className="mt-4">Salvar Conta</Button>
                        </form>
                    </div>
                </div>
            )}

            {/* ADD CARD MODAL - Improved UI/UX */}
            {isAddCardModalOpen && (
                <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm p-0 md:p-4 animate-fade-in">
                    <div className="bg-surface w-full max-w-md rounded-t-2xl md:rounded-2xl border border-surfaceHighlight shadow-2xl animate-slide-up max-h-[85vh] md:max-h-[90vh] flex flex-col">
                        {/* Header */}
                        <div className="p-4 md:p-6 border-b border-surfaceHighlight flex justify-between items-center shrink-0">
                            <div>
                                <h3 className="text-lg font-bold text-white">Novo Cartão</h3>
                                <p className="text-xs text-textMuted">Escolha um banco ou personalize</p>
                            </div>
                            <button onClick={() => setIsAddCardModalOpen(false)} className="text-textMuted hover:text-white p-2 hover:bg-surfaceHighlight rounded-lg transition-colors"><X size={20} /></button>
                        </div>

                        {/* Scrollable Content Area */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6">
                            <p className="text-xs font-semibold text-textMuted uppercase mb-3">Bancos Populares</p>
                            <div className="grid grid-cols-5 gap-2 mb-6">
                                {BANK_PRESETS.map((bank) => (
                                    <button
                                        key={bank.name}
                                        type="button"
                                        onClick={() => selectBankPreset(bank)}
                                        className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all ${newCardName === bank.name ? 'bg-primary/20 border-primary scale-105' : 'bg-surfaceHighlight border-transparent hover:border-textMuted hover:scale-105'}`}
                                    >
                                        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br ${bank.gradient} shadow-sm`}></div>
                                        <span className="text-[9px] md:text-[10px] text-textMain truncate w-full text-center leading-tight">{bank.name}</span>
                                    </button>
                                ))}
                            </div>

                            <form id="add-card-form" onSubmit={handleCreateCard} className="space-y-4 pt-4 border-t border-surfaceHighlight">
                                <Input
                                    label="Nome do Cartão (Apelido)"
                                    placeholder="Ex: Nubank Principal"
                                    required
                                    value={newCardName}
                                    onChange={(e) => setNewCardName(e.target.value)}
                                />
                                <Input
                                    label="Limite Total (R$)"
                                    type="number"
                                    placeholder="Ex: 5000"
                                    required
                                    value={newCardLimit}
                                    onChange={(e) => setNewCardLimit(e.target.value)}
                                />

                                {/* Color Selection */}
                                <div>
                                    <label className="text-xs font-medium text-textMuted uppercase tracking-wider ml-1 mb-2 block">Cor do Cartão</label>
                                    <div className="grid grid-cols-8 gap-2">
                                        {['from-zinc-800 to-black', 'from-purple-800 to-purple-600', 'from-red-700 to-red-500', 'from-orange-600 to-orange-400', 'from-blue-800 to-blue-600', 'from-green-700 to-emerald-600', 'from-pink-700 to-rose-500', 'from-yellow-600 to-amber-500'].map((grad, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => setNewCardGradient(grad)}
                                                className={`w-full aspect-square rounded-full bg-gradient-to-br ${grad} border-2 ${newCardGradient === grad ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:scale-105'} transition-all`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Brand Selection - Larger for visibility */}
                                <div>
                                    <label className="text-xs font-medium text-textMuted uppercase tracking-wider ml-1 mb-2 block">Bandeira do Cartão</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setNewCardBrand('mastercard')}
                                            className={`p-4 rounded-xl border-2 flex items-center justify-center gap-3 transition-all ${newCardBrand === 'mastercard' ? 'bg-primary/20 border-primary text-white shadow-lg shadow-primary/20' : 'bg-surfaceHighlight border-surfaceHighlight text-textMuted hover:border-textMuted'}`}
                                        >
                                            <div className="flex -space-x-2">
                                                <div className="w-6 h-6 rounded-full bg-red-500"></div>
                                                <div className="w-6 h-6 rounded-full bg-yellow-500"></div>
                                            </div>
                                            <span className="font-semibold">Mastercard</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setNewCardBrand('visa')}
                                            className={`p-4 rounded-xl border-2 flex items-center justify-center gap-3 transition-all ${newCardBrand === 'visa' ? 'bg-primary/20 border-primary text-white shadow-lg shadow-primary/20' : 'bg-surfaceHighlight border-surfaceHighlight text-textMuted hover:border-textMuted'}`}
                                        >
                                            <span className="font-bold italic text-lg">VISA</span>
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Sticky Footer with Submit Button */}
                        <div className="p-4 md:p-6 border-t border-surfaceHighlight bg-surface shrink-0">
                            <Button type="submit" form="add-card-form" className="w-full">
                                <Plus size={18} /> Adicionar à Carteira
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* EXPENSE MODAL */}
            {isExpenseModalOpen && selectedCardForExpense && (
                <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm p-0 md:p-4 animate-fade-in">
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

export default Bills;
