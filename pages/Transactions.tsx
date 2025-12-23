
import React, { useState, useMemo, useEffect } from 'react';
import { Plus, X, Upload, FileText, ChevronLeft, ChevronRight, PieChart as PieIcon, ArrowUpRight, ArrowDownRight, Search, CalendarClock, Trash2, Edit2, Image, Share, Paperclip, Camera, ScanLine, Sparkles, Loader2, Share2, FileSpreadsheet, Filter, XCircle, RefreshCcw, Crown } from 'lucide-react';
import { Button, Input, Badge } from '../components/UI';
import { Transaction, TransactionType } from '../types';
import { format, addMonths, isSameMonth } from 'date-fns';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useGamification } from '../context/GamificationContext';
import { useSubscription } from '../context/SubscriptionContext';
import { CameraModal } from '../components/CameraModal';
import { AIConsultant } from '../components/AIConsultant';
import { UpgradeModal } from '../components/UpgradeModal';
import { useTransactions } from '../hooks/useDatabase';
import { ImportPreviewModal } from '../components/ImportPreviewModal';
import { parseCSV, parseOFX, parsePDF, detectFileType, detectDuplicates, ParseResult, ParsedTransaction } from '../services/statementParserService';
import { categorizeTransactionsWithAI, extractTransactionsFromPDFText, extractReceiptData, ReceiptData } from '../services/geminiService';

// Paleta de Cores Fixa e Vibrante
const FIXED_PALETTE = [
    '#34d399', // Emerald (Green)
    '#60a5fa', // Blue
    '#facc15', // Yellow
    '#a78bfa', // Purple
    '#f472b6', // Pink
    '#fbbf24', // Amber
    '#2dd4bf', // Teal
    '#818cf8', // Indigo
    '#f87171', // Red
    '#fb923c', // Orange
];

// Função para gerar cor consistente baseada no nome da categoria
const getCategoryColor = (category: string) => {
    let hash = 0;
    for (let i = 0; i < category.length; i++) {
        hash = category.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash % FIXED_PALETTE.length);
    return FIXED_PALETTE[index];
};

const Transactions: React.FC = () => {
    const { addXp } = useGamification();
    const {
        canImportTransactions,
        canScanReceipt,
        canUseAiCategorization,
        recordImport,
        recordOcrScan,
        getRemainingImports,
        getRemainingScans,
        usage,
        limits,
        isPro,
        isTrial
    } = useSubscription();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Upgrade Modal State
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [upgradeFeature, setUpgradeFeature] = useState<'imports' | 'scans' | 'ai' | 'categorization'>('imports');

    // Camera States
    const [showCamera, setShowCamera] = useState(false);
    const [cameraContext, setCameraContext] = useState<'new' | 'details' | 'import'>('new');
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Use database hook for transactions
    const { transactions, loading: transactionsLoading, addTransaction, removeTransaction, updateTransaction } = useTransactions();
    const [localTransactions, setLocalTransactions] = useState<Transaction[]>([]);

    // Edit mode state
    const [isEditing, setIsEditing] = useState(false);
    const [editDesc, setEditDesc] = useState('');
    const [editCategory, setEditCategory] = useState('');
    const [editAmount, setEditAmount] = useState('');

    // Sync database transactions with local state
    useEffect(() => {
        setLocalTransactions(transactions);
    }, [transactions]);

    const [isImporting, setIsImporting] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [searchTerm, setSearchTerm] = useState('');

    // Import Preview Modal State
    const [showImportPreview, setShowImportPreview] = useState(false);
    const [parseResult, setParseResult] = useState<ParseResult | null>(null);

    // FILTERS STATE
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedType, setSelectedType] = useState<'all' | 'income' | 'expense'>('all');

    // CHART STATE (Manual toggle capability)
    const [chartViewMode, setChartViewMode] = useState<'income' | 'expense'>('expense');

    // Update chart view automatically when filter changes
    useEffect(() => {
        if (selectedType === 'income') setChartViewMode('income');
        else if (selectedType === 'expense') setChartViewMode('expense');
    }, [selectedType]);

    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

    const [desc, setDesc] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [type, setType] = useState<TransactionType>('expense');
    const [installments, setInstallments] = useState('1');
    const [receiptImage, setReceiptImage] = useState<string | null>(null);

    // Extract unique categories for the filter list
    const availableCategories = useMemo(() => {
        const cats = new Set(transactions.map(t => t.category));
        return Array.from(cats).sort();
    }, [transactions]);

    const filteredTransactions = transactions.filter(t => {
        const matchesMonth = isSameMonth(t.date, currentDate);
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = t.description.toLowerCase().includes(searchLower) ||
            t.category.toLowerCase().includes(searchLower);

        const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
        const matchesType = selectedType === 'all' || t.type === selectedType;

        return matchesMonth && matchesSearch && matchesCategory && matchesType;
    });

    const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((acc: number, curr: Transaction) => acc + curr.amount, 0);
    const totalExpense = filteredTransactions.filter(t => t.type === 'expense').reduce((acc: number, curr: Transaction) => acc + curr.amount, 0);

    // DYNAMIC CHART DATA LOGIC - Based on Filtered Transactions
    const chartData = useMemo(() => {
        // We use 'filteredTransactions' so the chart reflects exactly what the user sees in the list (search, category filter)
        // We filter by 'chartViewMode' to separate Income vs Expense pies
        const relevantTransactions = filteredTransactions.filter(t => t.type === chartViewMode);

        const grouped = relevantTransactions.reduce((acc: Record<string, number>, curr: Transaction) => {
            const cat = curr.category;
            const val = acc[cat] || 0;
            acc[cat] = val + curr.amount;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(grouped)
            .map(([name, value]) => ({
                name,
                value,
                color: getCategoryColor(name) // Use deterministic color
            }))
            .sort((a, b) => Number(b.value) - Number(a.value))
            .slice(0, 5);
    }, [filteredTransactions, chartViewMode]);

    const handlePrevMonth = () => setCurrentDate(addMonths(currentDate, -1));
    const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

    // --- CAMERA HANDLER ---
    const handleCameraCapture = async (imageData: string) => {
        setShowCamera(false);

        if (cameraContext === 'new') {
            // Check limit for OCR scans
            if (!canScanReceipt()) {
                setUpgradeFeature('scans');
                setShowUpgradeModal(true);
                return;
            }

            setReceiptImage(imageData);

            if (!isModalOpen) setIsModalOpen(true);

            setIsAnalyzing(true);

            try {
                // Use real OCR with Gemini Vision
                const receiptData = await extractReceiptData(imageData);

                if (receiptData) {
                    setDesc(receiptData.establishment);
                    setAmount(receiptData.amount.toFixed(2));
                    setCategory(receiptData.category);

                    // Show confidence feedback
                    if (receiptData.confidence >= 80) {
                        addXp(30); // High confidence = more XP
                    } else {
                        addXp(20);
                    }

                    console.log('Receipt OCR result:', receiptData);
                } else {
                    // Fallback if OCR fails
                    alert('Não consegui ler o comprovante. Tente uma foto mais nítida ou preencha manualmente.');
                    addXp(5);
                }
            } catch (error) {
                console.error('OCR error:', error);
                alert('Erro ao analisar imagem. Por favor, preencha os dados manualmente.');
            } finally {
                setIsAnalyzing(false);
            }

        } else if (cameraContext === 'details' && selectedTransaction) {
            // Attach receipt to existing transaction
            const updated = transactions.map(t =>
                t.id === selectedTransaction.id ? { ...t, receiptUrl: imageData } : t
            );
            setLocalTransactions(updated);
            setSelectedTransaction({ ...selectedTransaction, receiptUrl: imageData });
            addXp(10);
        } else if (cameraContext === 'import') {
            // Check limit for OCR scans
            if (!canScanReceipt()) {
                setUpgradeFeature('scans');
                setShowUpgradeModal(true);
                return;
            }

            // Scan receipt to create new transaction directly
            setIsImporting(true);

            try {
                const receiptData = await extractReceiptData(imageData);

                if (receiptData && receiptData.amount > 0) {
                    const newTx: Transaction = {
                        id: Math.random().toString(),
                        description: receiptData.establishment,
                        amount: receiptData.amount,
                        type: 'expense',
                        category: receiptData.category,
                        date: receiptData.date || new Date(),
                        receiptUrl: imageData,
                    };

                    // Add to database
                    await addTransaction({
                        description: newTx.description,
                        amount: newTx.amount,
                        type: newTx.type,
                        category: newTx.category,
                        date: newTx.date,
                        receiptUrl: newTx.receiptUrl,
                    });

                    alert(`Comprovante escaneado! Adicionado: ${receiptData.establishment} - R$ ${receiptData.amount.toFixed(2)}`);
                    recordOcrScan();
                    addXp(50);
                } else {
                    alert('Não foi possível identificar os dados do comprovante. Tente novamente com uma foto mais clara.');
                }
            } catch (error) {
                console.error('Scan import error:', error);
                alert('Erro ao processar comprovante.');
            } finally {
                setIsImporting(false);
            }
        }
    };

    const handleOpenScan = () => {
        setCameraContext('import');
        setShowCamera(true);
    };

    const handleStatementImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            // Check import limit before starting
            if (!canImportTransactions()) {
                setUpgradeFeature('imports');
                setShowUpgradeModal(true);
                e.target.value = '';
                return;
            }

            const file = e.target.files[0];
            setIsImporting(true);

            try {
                const fileType = detectFileType(file);
                let result: ParseResult;

                switch (fileType) {
                    case 'csv':
                        result = await parseCSV(file);
                        break;
                    case 'ofx':
                        result = await parseOFX(file);
                        break;
                    case 'pdf':
                        result = await parsePDF(file, extractTransactionsFromPDFText);
                        break;
                    default:
                        throw new Error('Formato de arquivo não suportado. Use CSV, OFX ou PDF.');
                }

                if (result.errors.length > 0 && result.transactions.length === 0) {
                    alert('Erro ao processar arquivo: ' + result.errors.join('\n'));
                    return;
                }

                // Detect duplicates against existing transactions
                result.transactions = detectDuplicates(result.transactions, transactions);

                setParseResult(result);
                setShowImportPreview(true);

            } catch (error) {
                console.error('Import error:', error);
                alert('Erro ao processar arquivo: ' + (error instanceof Error ? error.message : String(error)));
            } finally {
                setIsImporting(false);
                // Clear the input so the same file can be selected again
                e.target.value = '';
            }
        }
    };

    // Handle categorization with AI
    const handleCategorizeWithAI = async (txs: ParsedTransaction[]): Promise<ParsedTransaction[]> => {
        // Check if user can use AI categorization
        if (!canUseAiCategorization()) {
            setUpgradeFeature('categorization');
            setShowUpgradeModal(true);
            return txs; // Return unchanged
        }

        const toProcess = txs.map(t => ({ description: t.description, amount: t.amount }));
        const categorized = await categorizeTransactionsWithAI(toProcess);

        return txs.map((tx, index) => ({
            ...tx,
            category: categorized[index]?.category || tx.category,
            confidence: categorized[index]?.confidence || tx.confidence,
        }));
    };

    // Handle confirm import from modal
    const handleConfirmImport = async (selectedTransactions: ParsedTransaction[]) => {
        let successCount = 0;

        for (const tx of selectedTransactions) {
            try {
                await addTransaction({
                    description: tx.description,
                    amount: tx.amount,
                    type: tx.type,
                    category: tx.category || 'Outros',
                    date: tx.date,
                });
                successCount++;
            } catch (error) {
                console.error('Failed to add transaction:', error);
            }
        }

        setShowImportPreview(false);
        setParseResult(null);

        // Record the import usage
        recordImport(successCount);

        // Award XP based on number of transactions imported
        const xpEarned = successCount * 10;
        addXp(xpEarned);

        alert(`${successCount} transações importadas com sucesso! +${xpEarned} XP`);
    };

    const handleDeleteTransaction = () => {
        if (selectedTransaction) {
            if (confirm('Tem certeza que deseja excluir esta transação?')) {
                setLocalTransactions(prev => prev.filter(t => t.id !== selectedTransaction.id));
                setSelectedTransaction(null);
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const totalAmount = parseFloat(amount);
        const numInstallments = parseInt(installments);
        const installmentValue = totalAmount / numInstallments;

        const newTransactions: Transaction[] = [];

        for (let i = 0; i < numInstallments; i++) {
            const newTx: Transaction = {
                id: Math.random().toString(),
                description: numInstallments > 1 ? `${desc} (${i + 1}/${numInstallments})` : desc,
                amount: numInstallments > 1 ? installmentValue : totalAmount,
                category: category || 'Geral',
                type,
                date: addMonths(new Date(), i),
                installmentCurrent: numInstallments > 1 ? i + 1 : undefined,
                installmentTotal: numInstallments > 1 ? numInstallments : undefined,
                receiptUrl: i === 0 ? (receiptImage || undefined) : undefined // Attach only to first if installment
            };
            newTransactions.push(newTx);
        }

        setLocalTransactions(prev => [...newTransactions, ...prev]);
        setIsModalOpen(false);

        addXp(15 * numInstallments);

        setDesc('');
        setAmount('');
        setCategory('');
        setInstallments('1');
        setReceiptImage(null);
    };

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 rounded-lg shadow-xl border border-zinc-200">
                    <p className="text-zinc-900 font-bold text-sm">
                        {payload[0].name}: R$ {payload[0].value.toLocaleString('pt-BR')}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="pb-24 md:pb-0 relative min-h-screen animate-fade-in">
            {showCamera && (
                <CameraModal
                    onCapture={handleCameraCapture}
                    onClose={() => setShowCamera(false)}
                    title={cameraContext === 'import' ? 'Escanear Extrato' : 'Fotografar Comprovante'}
                />
            )}

            {/* Upgrade Modal */}
            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                feature={upgradeFeature}
                currentUsage={
                    upgradeFeature === 'imports' ? usage.importedTransactionsThisMonth :
                        upgradeFeature === 'scans' ? usage.ocrScansThisMonth :
                            undefined
                }
                limit={
                    upgradeFeature === 'imports' ? limits.monthlyImportedTransactions :
                        upgradeFeature === 'scans' ? limits.monthlyOcrScans :
                            undefined
                }
            />

            {/* Import Preview Modal */}
            {showImportPreview && parseResult && (
                <ImportPreviewModal
                    isOpen={showImportPreview}
                    onClose={() => {
                        setShowImportPreview(false);
                        setParseResult(null);
                    }}
                    parseResult={parseResult}
                    onConfirmImport={handleConfirmImport}
                    onCategorize={handleCategorizeWithAI}
                />
            )}


            {/* Header and Month Selector */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-textMain">Extrato</h2>
                    <p className="text-textMuted text-sm">Gerencie todas as suas movimentações</p>
                </div>

                <div className="flex items-center gap-4 bg-surface border border-surfaceHighlight p-1 rounded-xl">
                    <button onClick={handlePrevMonth} className="p-2 hover:text-white text-textMuted"><ChevronLeft size={20} /></button>
                    <span className="font-semibold w-32 text-center capitalize">{format(currentDate, 'MMMM yyyy')}</span>
                    <button onClick={handleNextMonth} className="p-2 hover:text-white text-textMuted"><ChevronRight size={20} /></button>
                </div>

                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    <Button variant="secondary" className="!w-auto px-4 py-2 bg-surface hover:bg-surfaceHighlight border border-surfaceHighlight" onClick={handleOpenScan} isLoading={isImporting}>
                        <ScanLine size={18} />
                        <span className="hidden sm:inline">Escanear</span>
                    </Button>

                    <div className="relative group">
                        <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={handleStatementImport} accept=".pdf,.ofx,.csv" />
                        <Button variant="secondary" className="!w-auto px-4 py-2 bg-surface hover:bg-surfaceHighlight border border-surfaceHighlight text-textMuted hover:text-white group-hover:border-primary">
                            <FileSpreadsheet size={18} />
                            <span className="hidden sm:inline ml-2">Importar</span>
                        </Button>
                    </div>

                    <Button className="!w-auto px-4 py-2" onClick={() => { setReceiptImage(null); setIsModalOpen(true); }}>
                        <Plus size={20} />
                        <span className="hidden sm:inline">Nova Transação</span>
                    </Button>
                </div>
            </div>

            <AIConsultant context="transactions" compact />

            {/* Search Bar & Filters */}
            <div className="space-y-4 mb-6">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por descrição ou categoria..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-surface border border-surfaceHighlight rounded-xl py-3 pl-12 pr-4 text-textMain placeholder-zinc-600 focus:outline-none focus:border-primary transition-all"
                    />
                </div>

                {/* Filter Chips Scrollable Area */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                        <div className="flex items-center gap-1 text-textMuted text-xs font-medium uppercase shrink-0 mr-2">
                            <Filter size={14} /> Filtros:
                        </div>

                        {/* Type Filter */}
                        <button
                            onClick={() => setSelectedType('all')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors border ${selectedType === 'all' ? 'bg-primary/20 border-primary text-white' : 'bg-surface border-surfaceHighlight text-textMuted'}`}
                        >
                            Tudo
                        </button>
                        <button
                            onClick={() => setSelectedType('expense')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors border ${selectedType === 'expense' ? 'bg-danger/20 border-danger text-white' : 'bg-surface border-surfaceHighlight text-textMuted'}`}
                        >
                            Saídas
                        </button>
                        <button
                            onClick={() => setSelectedType('income')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors border ${selectedType === 'income' ? 'bg-secondary/20 border-secondary text-white' : 'bg-surface border-surfaceHighlight text-textMuted'}`}
                        >
                            Entradas
                        </button>

                        <div className="w-px h-6 bg-surfaceHighlight mx-2 shrink-0"></div>

                        {/* Category Filters */}
                        <button
                            onClick={() => setSelectedCategory('all')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors border ${selectedCategory === 'all' ? 'bg-white text-black border-white' : 'bg-surface border-surfaceHighlight text-textMuted'}`}
                        >
                            Todas Categorias
                        </button>
                        {availableCategories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors border ${selectedCategory === cat ? 'bg-primary border-primary text-white' : 'bg-surface border-surfaceHighlight text-textMuted'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {(selectedCategory !== 'all' || selectedType !== 'all') && (
                        <div className="flex items-center gap-2 text-xs text-textMuted animate-fade-in">
                            <span>Exibindo: <strong>{selectedType === 'all' ? 'Tudo' : selectedType === 'expense' ? 'Despesas' : 'Receitas'}</strong> em <strong>{selectedCategory === 'all' ? 'Todas as Categorias' : selectedCategory}</strong></span>
                            <button onClick={() => { setSelectedCategory('all'); setSelectedType('all'); setSearchTerm(''); }} className="text-danger hover:underline flex items-center gap-1">
                                <XCircle size={12} /> Limpar
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Monthly Summary & Chart Grid (Reacts to Filter) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6 animate-slide-up">
                {/* Stats Column */}
                <div className="flex flex-col gap-4 lg:col-span-1">
                    <div className={`bg-surface border border-surfaceHighlight rounded-xl p-5 flex-1 flex flex-col justify-center transition-all ${selectedType === 'income' ? 'opacity-100 scale-105 border-secondary shadow-lg shadow-secondary/10' : selectedType === 'expense' ? 'opacity-50' : ''}`}>
                        <div className="flex justify-between items-start mb-2">
                            <p className="text-xs text-textMuted uppercase tracking-wider">Entradas Filtradas</p>
                            <span className="text-[10px] bg-secondary/10 text-secondary px-2 py-0.5 rounded-full">Soma</span>
                        </div>
                        <p className="text-2xl font-bold text-secondary">R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div className={`bg-surface border border-surfaceHighlight rounded-xl p-5 flex-1 flex flex-col justify-center transition-all ${selectedType === 'expense' ? 'opacity-100 scale-105 border-danger shadow-lg shadow-danger/10' : selectedType === 'income' ? 'opacity-50' : ''}`}>
                        <div className="flex justify-between items-start mb-2">
                            <p className="text-xs text-textMuted uppercase tracking-wider">Saídas Filtradas</p>
                            <span className="text-[10px] bg-danger/10 text-danger px-2 py-0.5 rounded-full">Soma</span>
                        </div>
                        <p className="text-2xl font-bold text-danger">R$ {totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                </div>

                {/* DYNAMIC CHART COLUMN */}
                <div className="bg-surface border border-surfaceHighlight rounded-xl p-5 lg:col-span-2 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-sm font-semibold text-textMain flex items-center gap-2">
                            <PieIcon size={16} className={chartViewMode === 'income' ? 'text-secondary' : 'text-danger'} />
                            {chartViewMode === 'income' ? 'Fontes de Renda' : 'Top Despesas'}
                            {/* Show context about filter */}
                            {(selectedCategory !== 'all' || searchTerm) && <span className="text-xs font-normal text-textMuted">(Filtrado)</span>}
                        </h3>

                        {/* Manual Chart Toggle (Only show if not locked by filter type) */}
                        {selectedType === 'all' && (
                            <div className="flex gap-1 bg-surfaceHighlight p-0.5 rounded-lg">
                                <button
                                    onClick={() => setChartViewMode('expense')}
                                    className={`p-1.5 rounded-md transition-all ${chartViewMode === 'expense' ? 'bg-danger text-white' : 'text-textMuted hover:text-white'}`}
                                    title="Ver Despesas"
                                >
                                    <ArrowDownRight size={14} />
                                </button>
                                <button
                                    onClick={() => setChartViewMode('income')}
                                    className={`p-1.5 rounded-md transition-all ${chartViewMode === 'income' ? 'bg-secondary text-white' : 'text-textMuted hover:text-white'}`}
                                    title="Ver Entradas"
                                >
                                    <ArrowUpRight size={14} />
                                </button>
                            </div>
                        )}
                    </div>

                    {chartData.length > 0 ? (
                        <div className="flex-1 flex flex-col md:flex-row items-center">
                            <div className="w-full md:w-1/2 h-[180px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={chartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={70}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="w-full md:w-1/2 space-y-2 mt-4 md:mt-0">
                                {chartData.map((entry, index) => (
                                    <div key={index} className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }}></div>
                                            <span className="text-textMain">{entry.name}</span>
                                        </div>
                                        <span className="text-textMuted">R$ {entry.value.toLocaleString('pt-BR')}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-textMuted text-xs opacity-50">
                            <PieIcon size={32} className="mb-2" />
                            <p>Sem dados de {chartViewMode === 'income' ? 'receita' : 'despesa'} para exibir.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Transactions List */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-textMain">Histórico Detalhado</h3>
                    <span className="text-xs text-textMuted">{filteredTransactions.length} registros</span>
                </div>

                {filteredTransactions.length === 0 ? (
                    <div className="text-center py-10 text-textMuted bg-surface/30 rounded-2xl border border-dashed border-surfaceHighlight">
                        <p>Nenhuma transação encontrada com os filtros atuais.</p>
                        <button onClick={() => { setSelectedCategory('all'); setSelectedType('all'); setSearchTerm(''); }} className="text-primary text-sm mt-2 hover:underline">
                            Limpar Filtros
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredTransactions.map((t) => (
                            <div
                                key={t.id}
                                onClick={() => { setSelectedTransaction(t); setReceiptImage(t.receiptUrl || null); }}
                                className="flex items-center justify-between p-4 bg-surface border border-surfaceHighlight rounded-xl hover:bg-surfaceHighlight transition-colors cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.type === 'income' ? 'bg-secondary/10 text-secondary' : 'bg-surfaceHighlight text-textMuted'}`}>
                                        {t.type === 'income' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium text-textMain text-sm md:text-base">{t.description}</p>
                                            {t.receiptUrl && <Paperclip size={12} className="text-primary" />}
                                            {t.installmentTotal && (
                                                <span className="text-[10px] bg-surfaceHighlight px-1.5 py-0.5 rounded text-textMuted">
                                                    {t.installmentCurrent}/{t.installmentTotal}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getCategoryColor(t.category) }}></span>
                                            <p className="text-xs text-textMuted">{t.category} • {format(t.date, 'd MMM')}</p>
                                        </div>
                                    </div>
                                </div>
                                <span className={`font-semibold text-sm md:text-base ${t.type === 'income' ? 'text-secondary' : 'text-textMain'}`}>
                                    {t.type === 'income' ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* New Transaction Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm p-0 md:p-4">
                    <div className="bg-surface w-full max-w-md rounded-t-2xl md:rounded-2xl border border-surfaceHighlight shadow-2xl animate-slide-up relative">

                        {/* AI ANALYSIS OVERLAY */}
                        {isAnalyzing && (
                            <div className="absolute inset-0 z-[60] bg-surface/90 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center text-center p-6 animate-fade-in">
                                <div className="relative mb-4">
                                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
                                    <Loader2 size={48} className="text-primary animate-spin relative z-10" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Processando com IA</h3>
                                <p className="text-textMuted text-sm">Identificando estabelecimento, valor e data...</p>
                                <div className="mt-6 flex items-center gap-2 text-xs text-secondary bg-secondary/10 px-3 py-1 rounded-full">
                                    <Sparkles size={12} /> Inteligência Artificial Reynar
                                </div>
                            </div>
                        )}

                        <div className="p-6 border-b border-surfaceHighlight flex justify-between items-center">
                            <h3 className="text-lg font-bold text-white">Nova Transação</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-textMuted hover:text-white"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Toggle Income/Expense */}
                            <div className="flex bg-surfaceHighlight p-1 rounded-xl mb-4">
                                <button
                                    type="button"
                                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${type === 'expense' ? 'bg-surface text-white shadow-sm' : 'text-textMuted hover:text-white'}`}
                                    onClick={() => setType('expense')}
                                >
                                    Despesa
                                </button>
                                <button
                                    type="button"
                                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${type === 'income' ? 'bg-secondary text-white shadow-sm' : 'text-textMuted hover:text-white'}`}
                                    onClick={() => setType('income')}
                                >
                                    Receita
                                </button>
                            </div>

                            <div className="text-center mb-6">
                                <label className="text-xs text-textMuted uppercase mb-1 block">Valor</label>
                                <div className="flex items-center justify-center gap-1 text-3xl font-bold text-white">
                                    <span className="text-textMuted text-lg mt-1">R$</span>
                                    <input
                                        type="number"
                                        placeholder="0,00"
                                        className="bg-transparent border-none outline-none w-40 text-center placeholder-zinc-600 focus:ring-0"
                                        required
                                        value={amount}
                                        onChange={e => setAmount(e.target.value)}
                                    />
                                </div>
                            </div>

                            <Input
                                label="Descrição"
                                placeholder={type === 'expense' ? "Ex: Mercado, Uber" : "Ex: Salário, Freela"}
                                required
                                value={desc}
                                onChange={e => setDesc(e.target.value)}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Categoria"
                                    placeholder="Ex: Lazer"
                                    value={category}
                                    onChange={e => setCategory(e.target.value)}
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
                                    <option value="6">6x</option>
                                    <option value="12">12x</option>
                                </Input>
                            </div>

                            {/* Receipt Attachment */}
                            <div>
                                <label className="text-xs font-medium text-textMuted uppercase tracking-wider ml-1 mb-2 block">Comprovante</label>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => { setCameraContext('new'); setShowCamera(true); }}
                                        className="flex-1 p-3 border-2 border-dashed border-surfaceHighlight rounded-xl flex items-center justify-center gap-2 text-textMuted hover:text-white hover:border-primary transition-colors bg-surfaceHighlight/30"
                                    >
                                        <Camera size={18} />
                                        <span className="text-xs">Câmera</span>
                                    </button>
                                    <div className="relative flex-1">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onload = (event) => {
                                                        setReceiptImage(event.target?.result as string);
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                                e.target.value = '';
                                            }}
                                        />
                                        <button
                                            type="button"
                                            className="w-full p-3 border-2 border-dashed border-surfaceHighlight rounded-xl flex items-center justify-center gap-2 text-textMuted hover:text-white hover:border-primary transition-colors bg-surfaceHighlight/30"
                                        >
                                            <Upload size={18} />
                                            <span className="text-xs">Upload</span>
                                        </button>
                                    </div>
                                </div>
                                {receiptImage && (
                                    <div className="mt-2 relative w-full h-32 rounded-lg overflow-hidden border border-surfaceHighlight group">
                                        <img src={receiptImage} alt="Receipt" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => setReceiptImage(null)}
                                            className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={14} />
                                        </button>
                                        <div className="absolute bottom-2 left-2 px-2 py-1 bg-primary/80 text-white text-[10px] font-bold rounded">
                                            Analisado
                                        </div>
                                    </div>
                                )}
                            </div>

                            <Button type="submit" variant={type === 'expense' ? 'danger' : 'secondary'} className="mt-4">
                                {type === 'expense' ? 'Confirmar Despesa' : 'Confirmar Receita'}
                            </Button>
                        </form>
                    </div>
                </div>
            )}

            {/* Transaction Details Modal with Edit Mode */}
            {selectedTransaction && !isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm p-0 md:p-4">
                    <div className="bg-surface w-full max-w-md rounded-t-2xl md:rounded-2xl border border-surfaceHighlight shadow-2xl animate-slide-up">
                        <div className="p-4 border-b border-surfaceHighlight flex justify-between items-center">
                            <h3 className="font-bold text-white">{isEditing ? 'Editar Transação' : 'Detalhes'}</h3>
                            <button onClick={() => { setSelectedTransaction(null); setIsEditing(false); }} className="text-textMuted hover:text-white"><X size={20} /></button>
                        </div>
                        <div className="p-6">
                            {isEditing ? (
                                // Edit Mode
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-medium text-textMuted uppercase tracking-wider ml-1 mb-2 block">Descrição</label>
                                        <input
                                            type="text"
                                            value={editDesc}
                                            onChange={(e) => setEditDesc(e.target.value)}
                                            className="w-full bg-surfaceHighlight border border-surfaceHighlight rounded-xl py-3 px-4 text-textMain placeholder-zinc-600 focus:outline-none focus:border-primary transition-all"
                                            placeholder="Ex: Mercado, Almoço, Cinema..."
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-medium text-textMuted uppercase tracking-wider ml-1 mb-2 block">Categoria</label>
                                            <input
                                                type="text"
                                                value={editCategory}
                                                onChange={(e) => setEditCategory(e.target.value)}
                                                className="w-full bg-surfaceHighlight border border-surfaceHighlight rounded-xl py-3 px-4 text-textMain placeholder-zinc-600 focus:outline-none focus:border-primary transition-all"
                                                placeholder="Ex: Alimentação"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-textMuted uppercase tracking-wider ml-1 mb-2 block">Valor</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={editAmount}
                                                onChange={(e) => setEditAmount(e.target.value)}
                                                className="w-full bg-surfaceHighlight border border-surfaceHighlight rounded-xl py-3 px-4 text-textMain placeholder-zinc-600 focus:outline-none focus:border-primary transition-all"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <Button
                                            variant="secondary"
                                            className="flex-1"
                                            onClick={() => setIsEditing(false)}
                                        >
                                            Cancelar
                                        </Button>
                                        <Button
                                            className="flex-1"
                                            onClick={async () => {
                                                if (selectedTransaction) {
                                                    try {
                                                        await updateTransaction(selectedTransaction.id, {
                                                            description: editDesc,
                                                            category: editCategory,
                                                            amount: parseFloat(editAmount) || selectedTransaction.amount,
                                                        });
                                                        setSelectedTransaction({
                                                            ...selectedTransaction,
                                                            description: editDesc,
                                                            category: editCategory,
                                                            amount: parseFloat(editAmount) || selectedTransaction.amount,
                                                        });
                                                        setIsEditing(false);
                                                        addXp(10);
                                                    } catch (error) {
                                                        console.error('Error updating transaction:', error);
                                                        alert('Erro ao salvar. Tente novamente.');
                                                    }
                                                }
                                            }}
                                        >
                                            Salvar Alterações
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                // View Mode
                                <>
                                    <div className="text-center mb-6">
                                        <p className="text-textMuted text-sm mb-1">{selectedTransaction.category}</p>
                                        <h2 className={`text-3xl font-bold ${selectedTransaction.type === 'income' ? 'text-secondary' : 'text-textMain'}`}>
                                            R$ {selectedTransaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </h2>
                                        <p className="text-white mt-1 font-medium">{selectedTransaction.description}</p>
                                        <p className="text-textMuted text-xs">{format(selectedTransaction.date, 'dd/MM/yyyy HH:mm')}</p>
                                    </div>

                                    {selectedTransaction.receiptUrl ? (
                                        <div className="mb-6">
                                            <p className="text-xs font-medium text-textMuted uppercase mb-2">Comprovante</p>
                                            <div className="w-full h-48 rounded-xl overflow-hidden border border-surfaceHighlight relative group">
                                                <img src={selectedTransaction.receiptUrl} alt="Comprovante" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button onClick={() => { setCameraContext('details'); setShowCamera(true); }} className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full font-bold text-xs">
                                                        <Camera size={14} /> Alterar
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2 mb-6">
                                            <button
                                                onClick={() => { setCameraContext('details'); setShowCamera(true); }}
                                                className="flex-1 py-3 border-2 border-dashed border-surfaceHighlight rounded-xl flex items-center justify-center gap-2 text-textMuted hover:text-white hover:border-primary transition-all"
                                            >
                                                <Camera size={18} /> Câmera
                                            </button>
                                            <div className="relative flex-1">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file && selectedTransaction) {
                                                            const reader = new FileReader();
                                                            reader.onload = (event) => {
                                                                const imageData = event.target?.result as string;
                                                                const updated = transactions.map(t =>
                                                                    t.id === selectedTransaction.id ? { ...t, receiptUrl: imageData } : t
                                                                );
                                                                setLocalTransactions(updated);
                                                                setSelectedTransaction({ ...selectedTransaction, receiptUrl: imageData });
                                                                addXp(10);
                                                            };
                                                            reader.readAsDataURL(file);
                                                        }
                                                        e.target.value = '';
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    className="w-full py-3 border-2 border-dashed border-surfaceHighlight rounded-xl flex items-center justify-center gap-2 text-textMuted hover:text-white hover:border-primary transition-all"
                                                >
                                                    <Upload size={18} /> Upload
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex gap-3">
                                        <Button
                                            variant="secondary"
                                            className="flex-1"
                                            onClick={() => {
                                                setEditDesc(selectedTransaction.description);
                                                setEditCategory(selectedTransaction.category);
                                                setEditAmount(selectedTransaction.amount.toString());
                                                setIsEditing(true);
                                            }}
                                        >
                                            <Edit2 size={18} /> Editar
                                        </Button>
                                        <button
                                            onClick={handleDeleteTransaction}
                                            className="p-3 bg-danger/10 text-danger rounded-xl hover:bg-danger hover:text-white transition-colors border border-danger/20"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Transactions;
