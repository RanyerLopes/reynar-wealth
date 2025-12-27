
import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Input, triggerCoinExplosion } from '../components/UI';
import { Investment } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, DollarSign, Wallet, Calendar, PiggyBank, Briefcase, Plus, Loader2, Search, X, Trash2, RefreshCw, AlertCircle, Calculator, ArrowRight, Percent, Banknote, Scale, ChevronLeft, ChevronRight, Flame, Snowflake, Pencil } from 'lucide-react';
import { useGamification } from '../context/GamificationContext';
import { AIConsultant } from '../components/AIConsultant';
import { useInvestments } from '../hooks/useDatabase';
import { getMultipleQuotes, searchStocks, formatBRL, formatPercentChange, getChangeColor, POPULAR_STOCKS, StockQuote } from '../services/stockService';
import { searchAssets, KnownAsset } from '../services/knownAssetsService';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { getColorForInvestmentType } from '../utils/investmentUtils';

// Known crypto tickers for auto-detection
const KNOWN_CRYPTOS = [
    'BTC', 'BITCOIN', 'ETH', 'ETHEREUM', 'SOL', 'SOLANA', 'ADA', 'CARDANO',
    'DOT', 'POLKADOT', 'XRP', 'RIPPLE', 'DOGE', 'DOGECOIN', 'SHIB', 'SHIBA',
    'MATIC', 'POLYGON', 'LTC', 'LITECOIN', 'LINK', 'CHAINLINK', 'UNI', 'UNISWAP',
    'AVAX', 'AVALANCHE', 'ATOM', 'COSMOS', 'FTM', 'FANTOM', 'NEAR', 'ALGO',
    'BNB', 'BINANCE', 'USDT', 'TETHER', 'USDC', 'BUSD', 'DAI', 'APE', 'APT',
    'ARB', 'ARBITRUM', 'OP', 'OPTIMISM', 'PEPE', 'SAND', 'MANA', 'AXS', 'SLP',
    'TRX', 'TRON', 'VET', 'VECHAIN', 'EOS', 'XLM', 'STELLAR', 'XMR', 'MONERO',
    'NEO', 'IOTA', 'ETC', 'LUNA', 'FIL', 'FILECOIN', 'THETA', 'XTZ', 'TEZOS',
    'AAVE', 'MKR', 'MAKER', 'COMP', 'COMPOUND', 'SNX', 'CRV', 'CURVE', 'SUSHI',
    'YFI', 'YEARN', '1INCH', 'BAT', 'ENJ', 'ENJIN', 'CHZ', 'CHILIZ'
];

// Popular Brazilian stock tickers for validation
const KNOWN_STOCKS = [
    'PETR', 'VALE', 'ITUB', 'BBDC', 'BBAS', 'ABEV', 'WEGE', 'RENT', 'SUZB',
    'GGBR', 'CSNA', 'USIM', 'BRAP', 'CPLE', 'ELET', 'CMIG', 'SBSP', 'SAPR',
    'RADL', 'LREN', 'MGLU', 'VVAR', 'PCAR', 'BTOW', 'NTCO', 'HYPE', 'QUAL',
    'HAPV', 'GNDI', 'FLRY', 'CIEL', 'B3SA', 'CVCB', 'GOLL', 'AZUL', 'EMBR',
    'JBSS', 'MRFG', 'BEEF', 'BRFS', 'MRVE', 'CYRE', 'EZTC', 'EVEN', 'DIRR',
    'TOTS', 'POSI', 'LWSA', 'MODL', 'INTB', 'CASH', 'BPAC', 'SANB', 'BIDI',
    'MULT', 'BRML', 'IGTI', 'ALSO', 'LOGG', 'TRPL', 'TAEE', 'ENEV', 'ENBR',
    'KLBN', 'PRIO', 'RRRP', 'RECV', 'CSAN', 'UGPA', 'VBBR', 'RAIZ', 'SLCE',
    'AGRO', 'SMTO', 'ARZZ', 'SOMA', 'VIVT', 'TIMS', 'OIBR'
];

// Function to auto-detect asset type based on ticker
const detectAssetType = (ticker: string): 'Ações' | 'Cripto' | 'Renda Fixa' | 'FIIs' | 'Outros' => {
    const upperTicker = ticker.toUpperCase().trim();

    // Check if it's a known crypto
    if (KNOWN_CRYPTOS.some(crypto =>
        upperTicker === crypto ||
        upperTicker.includes(crypto) ||
        upperTicker.startsWith(crypto)
    )) {
        return 'Cripto';
    }

    // Brazilian stock patterns - ends with number (PETR4, VALE3, ITUB4)
    if (/^[A-Z]{4}[0-9]{1,2}$/.test(upperTicker)) {
        const baseSymbol = upperTicker.slice(0, 4);
        // FIIs typically end with 11
        if (upperTicker.endsWith('11')) {
            return 'FIIs';
        }
        // Validate it's a known stock base
        if (KNOWN_STOCKS.includes(baseSymbol)) {
            return 'Ações';
        }
        // If ends with 3, 4, 5, 6 - likely a stock even if not in our list
        if (/[3-6]$/.test(upperTicker)) {
            return 'Ações';
        }
    }

    // Brazilian stock patterns - BDRs end with 34, 35
    if (/^[A-Z]{4}(34|35)$/.test(upperTicker)) {
        return 'Ações';
    }

    // Renda Fixa patterns
    const rendaFixaKeywords = ['CDB', 'LCI', 'LCA', 'TESOURO', 'SELIC', 'IPCA+', 'CDI', 'DEBENTURE', 'POUPANCA', 'POUPANÇA'];
    if (rendaFixaKeywords.some(kw => upperTicker.includes(kw))) {
        return 'Renda Fixa';
    }

    // If nothing matches a valid pattern, return "Outros"
    return 'Outros';
};

// Helper function to get color based on asset type
const getAssetColor = (type: string | undefined): string => {
    const t = (type || '').trim().toLowerCase();
    if (t.includes('cripto')) return '#f59e0b'; // Laranja/Amber
    if (t.includes('renda') || t.includes('fixa')) return '#34d399'; // Verde
    if (t.includes('fii')) return '#60a5fa'; // Azul
    if (t.includes('outro')) return '#f472b6'; // Rosa
    return '#8b5cf6'; // Roxo (Ações - default)
};

const Investments: React.FC = () => {
    const { user } = useAuth();
    const { addXp } = useGamification();
    const { t, formatCurrency } = useLanguage();

    // Use database hook for investments
    const { investments: dbInvestments, loading: investmentsLoading, addInvestment: addInvestmentToDb, removeInvestment, editInvestment: editInvestmentInDb, updateInvestmentValues } = useInvestments();
    const [investments, setInvestments] = useState<Investment[]>([]);

    // Sync database investments with local state
    useEffect(() => {
        setInvestments(dbInvestments);
    }, [dbInvestments]);

    // UI States
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isLoadingQuotes, setIsLoadingQuotes] = useState(false);

    // Edit Modal States
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState<Investment | null>(null);
    const [editQuantity, setEditQuantity] = useState('');
    const [editAmountInvested, setEditAmountInvested] = useState('');

    // Form States
    const [assetName, setAssetName] = useState('');
    const [assetType, setAssetType] = useState('Ações');
    const [amountInvested, setAmountInvested] = useState('');
    const [quantity, setQuantity] = useState('');

    // Autocomplete States
    const [suggestions, setSuggestions] = useState<KnownAsset[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const autocompleteRef = useRef<HTMLDivElement>(null);

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (autocompleteRef.current && !autocompleteRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Search for assets as user types
    const handleAssetSearch = async (query: string) => {
        setAssetName(query);

        if (query.length >= 2) {
            const detectedType = detectAssetType(query);
            setAssetType(detectedType);

            setIsSearching(true);
            try {
                const results = await searchAssets(query, 8);
                setSuggestions(results);
                setShowSuggestions(results.length > 0);
            } catch (error) {
                console.error('Error searching assets:', error);
                setSuggestions([]);
            } finally {
                setIsSearching(false);
            }
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    // Select suggestion
    const handleSelectSuggestion = (asset: KnownAsset) => {
        setAssetName(asset.symbol);
        setAssetType(asset.type);
        setShowSuggestions(false);
        setSuggestions([]);
    };

    // Simulator State
    const [simMonthly, setSimMonthly] = useState('500');
    const [simYears, setSimYears] = useState('10');
    const [simRate, setSimRate] = useState('10');
    const [simResult, setSimResult] = useState<number | null>(null);

    // Market carousel state
    const [marketQuotes, setMarketQuotes] = useState<StockQuote[]>([]);
    const [isLoadingMarket, setIsLoadingMarket] = useState(false);

    // Calculations
    const totalValue = investments.reduce((acc, curr) => acc + curr.currentValue, 0);
    const totalInvested = investments.reduce((acc, curr) => acc + curr.amountInvested, 0);
    const totalReturn = totalValue - totalInvested;
    const returnPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

    // Group investments by type and sum values
    const data = Object.entries(
        investments.reduce((acc, inv) => {
            const type = inv.type || 'Outros';
            acc[type] = (acc[type] || 0) + inv.currentValue;
            return acc;
        }, {} as Record<string, number>)
    ).map(([name, value]) => ({ name, value })).filter(item => item.value > 0);


    const COLORS = ['#a78bfa', '#f59e0b', '#34d399', '#60a5fa', '#f472b6'];

    // Handlers
    const handleAddAsset = async (e: React.FormEvent) => {
        e.preventDefault();
        const invested = parseFloat(amountInvested.replace(',', '.'));

        // Validar se o valor é válido
        if (isNaN(invested) || invested <= 0) {
            alert('Por favor, insira um valor válido para o investimento.');
            return;
        }

        const qty = quantity ? parseFloat(quantity.replace(',', '.')) : undefined;
        const pricePerUnit = qty && qty > 0 ? invested / qty : undefined;

        const newAsset: Omit<Investment, 'id'> = {
            assetName: assetName.toUpperCase(),
            type: assetType as any,
            quantity: qty,
            purchasePrice: pricePerUnit,
            amountInvested: invested,
            currentValue: invested, // Starts equal to invested
            performance: 0
        };

        try {
            await addInvestmentToDb(newAsset);
            setIsAddModalOpen(false);
            addXp(30); // Reward for investing

            setAssetName('');
            setAmountInvested('');
            setQuantity('');
            triggerCoinExplosion(window.innerWidth / 2, window.innerHeight / 2);
        } catch (error) {
            console.error('Error adding investment:', error);
            alert('Erro ao salvar investimento. Verifique se você está logado e se as colunas "quantity" e "purchase_price" existem no banco de dados.');
        }
    };

    // Open edit modal with asset data
    const openEditModal = (asset: Investment) => {
        setEditingAsset(asset);
        setEditQuantity(asset.quantity?.toString() || '');
        setEditAmountInvested(asset.amountInvested.toString());
        setIsEditModalOpen(true);
    };

    // Handle edit asset submission
    const handleEditAsset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingAsset) return;

        const newAmountInvested = parseFloat(editAmountInvested.replace(',', '.'));
        const newQuantity = editQuantity ? parseFloat(editQuantity.replace(',', '.')) : undefined;

        if (isNaN(newAmountInvested) || newAmountInvested <= 0) {
            alert('Por favor, insira um valor válido.');
            return;
        }

        const pricePerUnit = newQuantity && newQuantity > 0 ? newAmountInvested / newQuantity : undefined;

        const updates = {
            quantity: newQuantity,
            amountInvested: newAmountInvested,
            currentValue: newAmountInvested,
            purchasePrice: pricePerUnit
        };

        try {
            await editInvestmentInDb(editingAsset.id, updates);
            // Also update local state immediately to reflect changes in UI
            setInvestments(prev => prev.map(inv =>
                inv.id === editingAsset.id ? { ...inv, ...updates } : inv
            ));
            setIsEditModalOpen(false);
            setEditingAsset(null);
            addXp(10); // Small reward for updating
        } catch (error) {
            console.error('Error editing investment:', error);
            alert('Erro ao editar investimento.');
        }
    };

    // Live stock quotes state
    const [stockQuotes, setStockQuotes] = useState<Map<string, StockQuote>>(new Map());
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    // Fetch real quotes from BRAPI
    // Track if we've already auto-fetched quotes to prevent loop
    const hasFetchedQuotesRef = useRef(false);

    const handleUpdateQuotes = async (isManual: boolean = false) => {
        setIsLoadingQuotes(true);

        try {
            // Get all stock symbols from investments (type "Ações" or "FIIs")
            const stockSymbols = investments
                .filter(inv => inv.type === 'Ações' || inv.type === 'FIIs')
                .map(inv => inv.assetName.toUpperCase());

            if (stockSymbols.length === 0) {
                setIsLoadingQuotes(false);
                return;
            }

            // Fetch real quotes from BRAPI
            const quotes = await getMultipleQuotes(stockSymbols);

            // Update quotes map
            const quotesMap = new Map<string, StockQuote>();
            quotes.forEach(quote => {
                quotesMap.set(quote.symbol.toUpperCase(), quote);
            });
            setStockQuotes(quotesMap);

            // Update investment values based on real quotes
            const updatedInvestments: { id: string; currentValue: number; performance: number }[] = [];

            const newInvestments = investments.map(inv => {
                const quote = quotesMap.get(inv.assetName.toUpperCase());
                if (quote && inv.quantity && inv.quantity > 0) {
                    // Calculate new current value: quantity × current price
                    const newCurrentValue = inv.quantity * quote.regularMarketPrice;
                    // Calculate performance: (current - invested) / invested × 100
                    const newPerformance = inv.amountInvested > 0
                        ? ((newCurrentValue - inv.amountInvested) / inv.amountInvested) * 100
                        : 0;

                    updatedInvestments.push({
                        id: inv.id,
                        currentValue: newCurrentValue,
                        performance: newPerformance
                    });

                    return {
                        ...inv,
                        currentValue: newCurrentValue,
                        performance: newPerformance
                    };
                }
                return inv;
            });

            // Update local state immediately
            setInvestments(newInvestments);

            // Only persist to database and give XP on manual updates (to avoid loop)
            if (isManual && updatedInvestments.length > 0) {
                await updateInvestmentValues(updatedInvestments);
                addXp(10); // Reward for checking real market data
            }

            setLastUpdated(new Date());
        } catch (error) {
            console.error('Error fetching quotes:', error);
        } finally {
            setIsLoadingQuotes(false);
        }
    };

    // Auto-fetch quotes on mount if there are stock investments (only once)
    useEffect(() => {
        if (hasFetchedQuotesRef.current) return;
        const hasStocks = investments.some(inv => inv.type === 'Ações' || inv.type === 'FIIs');
        if (hasStocks && investments.length > 0) {
            hasFetchedQuotesRef.current = true;
            handleUpdateQuotes(false); // false = auto fetch, no XP
        }
    }, [investments.length]); // Only run when investments are loaded

    // Fetch popular stocks for the carousel
    const fetchMarketQuotes = async () => {
        setIsLoadingMarket(true);
        try {
            const symbols = POPULAR_STOCKS.map(s => s.symbol);
            const quotes = await getMultipleQuotes(symbols);
            setMarketQuotes(quotes.sort((a, b) => b.regularMarketChangePercent - a.regularMarketChangePercent));
        } catch (error) {
            console.error('Error fetching market quotes:', error);
        } finally {
            setIsLoadingMarket(false);
        }
    };

    // Auto-fetch market quotes on mount
    useEffect(() => {
        fetchMarketQuotes();
    }, []);


    const calculateCompoundInterest = () => {
        const p = 0; // Initial Principal (assume starting from scratch or use totalValue)
        const pmt = parseFloat(simMonthly);
        const r = parseFloat(simRate) / 100;
        const n = 1; // Compounded annually
        const t = parseFloat(simYears);

        // FV = PMT * (((1 + r/n)^(nt) - 1) / (r/n))
        // Simplified for annual contribution/compounding approx
        let futureValue = 0;
        let current = totalValue; // Start with current portfolio

        for (let i = 0; i < t; i++) {
            current = current * (1 + r); // Grow current amount
            current += pmt * 12; // Add yearly contributions (approx)
        }

        setSimResult(current);
        triggerCoinExplosion(window.innerWidth / 2, window.innerHeight / 2);
    };

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 rounded-lg shadow-xl border border-zinc-200">
                    <p className="text-zinc-900 font-bold text-sm">
                        {payload[0].name}: {formatCurrency(payload[0].value)}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="pb-24 md:pb-0 space-y-6 animate-fade-in relative">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-textMain">{t('investments.title')}</h2>
                    <p className="text-textMuted text-sm">{t('investments.subtitle')}</p>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <Button
                        variant="secondary"
                        className="!w-auto px-4 py-2 bg-surface border border-surfaceHighlight hover:bg-surfaceHighlight text-textMuted hover:text-white"
                        onClick={() => handleUpdateQuotes(true)}
                        isLoading={isLoadingQuotes}
                    >
                        <RefreshCw size={18} className={isLoadingQuotes ? 'animate-spin' : ''} />
                    </Button>
                    <Button className="!w-auto px-4 py-2" onClick={() => setIsAddModalOpen(true)}>
                        <Plus size={20} />
                        <span className="hidden sm:inline">{t('investments.addAsset')}</span>
                    </Button>
                </div>
            </header>

            <AIConsultant context="investments" compact />

            {/* Indicadores Econômicos */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <Percent size={16} className="text-blue-400" />
                        </div>
                        <div>
                            <p className="text-[10px] text-textMuted uppercase">Taxa Selic</p>
                            <p className="text-lg font-bold text-white">12.25%</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-amber-500/20 rounded-lg">
                            <TrendingUp size={16} className="text-amber-400" />
                        </div>
                        <div>
                            <p className="text-[10px] text-textMuted uppercase">IPCA (12m)</p>
                            <p className="text-lg font-bold text-white">4.83%</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-green-500/20 rounded-lg">
                            <Banknote size={16} className="text-green-400" />
                        </div>
                        <div>
                            <p className="text-[10px] text-textMuted uppercase">CDI (a.a.)</p>
                            <p className="text-lg font-bold text-white">12.15%</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                            <DollarSign size={16} className="text-purple-400" />
                        </div>
                        <div>
                            <p className="text-[10px] text-textMuted uppercase">Poupança</p>
                            <p className="text-lg font-bold text-white">7.26%</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stock Market Carousel */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <TrendingUp size={20} className="text-primary" />
                        <h3 className="font-semibold text-textMain">Mercado em Tempo Real</h3>
                        {isLoadingMarket && <Loader2 size={16} className="text-primary animate-spin" />}
                    </div>
                    <button
                        onClick={fetchMarketQuotes}
                        className="text-xs text-textMuted hover:text-primary flex items-center gap-1 transition-colors"
                        disabled={isLoadingMarket}
                    >
                        <RefreshCw size={14} className={isLoadingMarket ? 'animate-spin' : ''} />
                        Atualizar
                    </button>
                </div>

                {/* Gainers Section */}
                {marketQuotes.filter(q => q.regularMarketChangePercent > 0).length > 0 && (
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Flame size={14} className="text-secondary" />
                            <span className="text-xs font-semibold text-secondary uppercase">Em Alta</span>
                        </div>
                        <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar snap-x snap-mandatory">
                            {marketQuotes
                                .filter(q => q.regularMarketChangePercent > 0)
                                .map((quote) => (
                                    <div
                                        key={quote.symbol}
                                        onClick={() => {
                                            setAssetName(quote.symbol);
                                            setAssetType('Ações');
                                            setIsAddModalOpen(true);
                                        }}
                                        className="flex-shrink-0 w-[160px] md:w-[180px] snap-start bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20 rounded-xl p-4 cursor-pointer hover:scale-105 hover:border-secondary/50 transition-all group"
                                    >
                                        <div className="flex items-center gap-2 mb-3">
                                            {quote.logourl ? (
                                                <img src={quote.logourl} alt={quote.symbol} className="w-8 h-8 rounded-lg bg-white p-0.5 object-contain" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center">
                                                    <DollarSign size={16} className="text-secondary" />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-white text-sm truncate">{quote.symbol}</p>
                                                <p className="text-[10px] text-textMuted truncate">{quote.shortName}</p>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <p className="text-lg font-bold text-white">{formatBRL(quote.regularMarketPrice)}</p>
                                            <div className="flex items-center gap-1 text-secondary text-xs font-semibold bg-secondary/20 px-2 py-0.5 rounded-full">
                                                <TrendingUp size={12} />
                                                +{quote.regularMarketChangePercent.toFixed(2)}%
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-textMuted mt-2 opacity-0 group-hover:opacity-100 transition-opacity">Clique para investir</p>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}

                {/* Losers Section */}
                {marketQuotes.filter(q => q.regularMarketChangePercent < 0).length > 0 && (
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Snowflake size={14} className="text-red-400" />
                            <span className="text-xs font-semibold text-red-400 uppercase">Em Baixa</span>
                        </div>
                        <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar snap-x snap-mandatory">
                            {marketQuotes
                                .filter(q => q.regularMarketChangePercent < 0)
                                .map((quote) => (
                                    <div
                                        key={quote.symbol}
                                        onClick={() => {
                                            setAssetName(quote.symbol);
                                            setAssetType('Ações');
                                            setIsAddModalOpen(true);
                                        }}
                                        className="flex-shrink-0 w-[160px] md:w-[180px] snap-start bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/20 rounded-xl p-4 cursor-pointer hover:scale-105 hover:border-red-500/50 transition-all group"
                                    >
                                        <div className="flex items-center gap-2 mb-3">
                                            {quote.logourl ? (
                                                <img src={quote.logourl} alt={quote.symbol} className="w-8 h-8 rounded-lg bg-white p-0.5 object-contain" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                                                    <DollarSign size={16} className="text-red-400" />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-white text-sm truncate">{quote.symbol}</p>
                                                <p className="text-[10px] text-textMuted truncate">{quote.shortName}</p>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <p className="text-lg font-bold text-white">{formatBRL(quote.regularMarketPrice)}</p>
                                            <div className="flex items-center gap-1 text-red-400 text-xs font-semibold bg-red-500/20 px-2 py-0.5 rounded-full">
                                                <TrendingDown size={12} />
                                                {quote.regularMarketChangePercent.toFixed(2)}%
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-textMuted mt-2 opacity-0 group-hover:opacity-100 transition-opacity">Clique para investir</p>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}

                {/* Empty state */}
                {marketQuotes.length === 0 && !isLoadingMarket && (
                    <div className="text-center py-8 text-textMuted">
                        <TrendingUp size={32} className="mx-auto mb-2 opacity-20" />
                        <p className="text-sm">Clique em "Atualizar" para ver cotações</p>
                    </div>
                )}
            </div>

            {/* Comparador de Rendimentos */}
            {totalInvested > 0 && (
                <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
                    <div className="flex items-center gap-2 mb-4">
                        <Scale size={20} className="text-primary" />
                        <h3 className="font-semibold text-textMain">Comparador de Rendimentos</h3>
                        <span className="text-xs text-textMuted ml-auto">Se você tivesse investido R$ {totalInvested.toLocaleString('pt-BR')} há 1 ano</span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Sua Carteira */}
                        <div className={`p-4 rounded-xl border ${returnPercentage >= 12.15 ? 'bg-secondary/10 border-secondary/30' : 'bg-surfaceHighlight border-surfaceHighlight'}`}>
                            <p className="text-xs text-textMuted mb-1">Sua Carteira</p>
                            <p className="text-xl font-bold text-white">
                                R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </p>
                            <p className={`text-sm font-medium ${returnPercentage >= 0 ? 'text-secondary' : 'text-danger'}`}>
                                {returnPercentage >= 0 ? '+' : ''}{returnPercentage.toFixed(2)}%
                            </p>
                            {returnPercentage >= 12.15 && (
                                <span className="text-[10px] bg-secondary/20 text-secondary px-2 py-0.5 rounded-full mt-2 inline-block">🏆 Melhor</span>
                            )}
                        </div>

                        {/* CDI */}
                        <div className={`p-4 rounded-xl border ${returnPercentage < 12.15 && returnPercentage < 12.25 ? 'bg-blue-500/10 border-blue-500/30' : 'bg-surfaceHighlight border-surfaceHighlight'}`}>
                            <p className="text-xs text-textMuted mb-1">CDI (100%)</p>
                            <p className="text-xl font-bold text-white">
                                R$ {(totalInvested * 1.1215).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </p>
                            <p className="text-sm font-medium text-blue-400">+12.15%</p>
                        </div>

                        {/* Poupança */}
                        <div className="p-4 rounded-xl bg-surfaceHighlight border border-surfaceHighlight">
                            <p className="text-xs text-textMuted mb-1">Poupança</p>
                            <p className="text-xl font-bold text-white">
                                R$ {(totalInvested * 1.0726).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </p>
                            <p className="text-sm font-medium text-green-400">+7.26%</p>
                        </div>

                        {/* IPCA */}
                        <div className="p-4 rounded-xl bg-surfaceHighlight border border-surfaceHighlight">
                            <p className="text-xs text-textMuted mb-1">Inflação (IPCA)</p>
                            <p className="text-xl font-bold text-white">
                                R$ {(totalInvested * 1.0483).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </p>
                            <p className="text-sm font-medium text-amber-400">+4.83%</p>
                            {returnPercentage < 4.83 && (
                                <span className="text-[10px] bg-danger/20 text-danger px-2 py-0.5 rounded-full mt-2 inline-block">⚠️ Perdendo p/ inflação</span>
                            )}
                        </div>
                    </div>

                    {returnPercentage >= 12.15 && (
                        <p className="text-center text-sm text-secondary mt-4 bg-secondary/10 py-2 rounded-lg">
                            🎉 Parabéns! Sua carteira está rendendo acima do CDI!
                        </p>
                    )}
                    {returnPercentage < 4.83 && (
                        <p className="text-center text-sm text-amber-400 mt-4 bg-amber-500/10 py-2 rounded-lg">
                            ⚠️ Atenção: Sua carteira está rendendo abaixo da inflação. Considere diversificar.
                        </p>
                    )}
                </Card>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-surface relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-10">
                        <TrendingUp size={80} />
                    </div>
                    <p className="text-textMuted text-xs uppercase">Saldo Total</p>
                    <h3 className="text-3xl font-bold text-white mt-1">R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                    <div className="mt-2 flex items-center gap-2">
                        <span className={`${returnPercentage >= 0 ? 'text-secondary' : 'text-danger'} text - sm font - medium flex items - center gap - 1`}>
                            <TrendingUp size={14} /> {returnPercentage >= 0 ? '+' : ''}{returnPercentage.toFixed(1)}%
                        </span>
                        <span className="text-zinc-500 text-xs">Rentabilidade Geral</span>
                    </div>
                </Card>

                <Card>
                    <p className="text-textMuted text-xs uppercase">Total Investido</p>
                    <h3 className="text-2xl font-bold text-white mt-1">R$ {totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                </Card>

                <Card>
                    <p className="text-textMuted text-xs uppercase">Lucro/Prejuízo</p>
                    <h3 className={`text - 2xl font - bold mt - 1 ${totalReturn >= 0 ? 'text-secondary' : 'text-danger'} `}>
                        {totalReturn >= 0 ? '+' : ''} R$ {totalReturn.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </h3>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Allocation Chart */}
                <Card className="min-h-[300px] flex flex-col">
                    <h3 className="font-semibold text-textMain mb-4">Alocação de Ativos</h3>
                    <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={getColorForInvestmentType(entry.name)} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center mt-4">
                        {data.map((entry, index) => (
                            <div key={index} className="flex items-center gap-1 text-xs text-textMuted">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getColorForInvestmentType(entry.name) }}></div>
                                {entry.name}
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Asset List */}
                <Card className="lg:col-span-2 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-textMain">Seus Ativos</h3>
                        {isLoadingQuotes && <span className="text-xs text-secondary animate-pulse">Atualizando valores...</span>}
                    </div>

                    <div className="space-y-4 flex-1 overflow-y-auto max-h-[400px] custom-scrollbar">
                        {investments.length === 0 ? (
                            <div className="text-center py-10 text-textMuted">
                                <DollarSign size={40} className="mx-auto mb-2 opacity-20" />
                                <p>Nenhum investimento cadastrado.</p>
                            </div>
                        ) : (
                            investments.map((asset) => {
                                const quote = stockQuotes.get(asset.assetName.toUpperCase());
                                const hasLogo = quote?.logourl && (asset.type === 'Ações' || asset.type === 'FIIs');

                                return (
                                    <div key={asset.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-surfaceHighlight transition-colors group cursor-pointer border border-transparent hover:border-surfaceHighlight">
                                        <div className="flex items-center gap-4">
                                            {hasLogo ? (
                                                <img
                                                    src={quote.logourl}
                                                    alt={asset.assetName}
                                                    className="w-10 h-10 rounded-xl bg-white p-1 object-contain"
                                                    onError={(e) => {
                                                        // Fallback to icon if image fails
                                                        e.currentTarget.style.display = 'none';
                                                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                    }}
                                                />
                                            ) : null}
                                            {/* Dynamic Icon with Color based on Asset Type */}
                                            <div
                                                className={`p-3 rounded-xl ${hasLogo ? 'hidden' : ''}`}
                                                style={{
                                                    backgroundColor: `${getAssetColor(asset.type)}20`,
                                                    color: getAssetColor(asset.type),
                                                    border: `1px solid ${getAssetColor(asset.type)}40`
                                                }}
                                            >
                                                <DollarSign size={20} />
                                            </div>
                                            <div>
                                                <p
                                                    className="font-bold"
                                                    style={{ color: getAssetColor(asset.type) }}
                                                >
                                                    {asset.assetName}
                                                </p>
                                                <p className="text-xs text-textMuted">
                                                    {asset.type}
                                                    {asset.quantity && <span className="ml-1 text-primary">• {asset.quantity} {asset.type === 'Cripto' ? 'moedas' : 'cotas'}</span>}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-white">R$ {asset.currentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                            <p className={`text-xs ${asset.performance >= 0 ? 'text-secondary' : 'text-danger'}`}>
                                                {asset.performance >= 0 ? '+' : ''}{asset.performance.toFixed(2)}%
                                            </p>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openEditModal(asset);
                                            }}
                                            className="ml-4 p-2 text-zinc-600 hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
                                            title="Editar ativo"
                                        >
                                            <Pencil size={18} />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (window.confirm(`Deseja remover ${asset.assetName}?`)) {
                                                    removeInvestment(asset.id);
                                                }
                                            }}
                                            className="p-2 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                                            title="Remover ativo"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="w-full mt-6 py-3 border border-dashed border-zinc-700 text-zinc-500 rounded-xl hover:border-primary hover:text-primary transition-all text-sm font-medium"
                    >
                        + Adicionar Novo Ativo
                    </button>
                </Card>
            </div>

            {/* Wealth Simulator - NEW SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-gradient-to-br from-indigo-900/50 to-primary/10 border border-primary/20 rounded-2xl p-6">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
                        <Calculator className="text-secondary" /> Simulador de Riqueza
                    </h3>
                    <p className="text-textMuted text-sm mb-6">
                        Projete seu futuro. Veja quanto você pode acumular investindo mensalmente.
                    </p>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Aporte Mensal (R$)"
                                type="number"
                                value={simMonthly}
                                onChange={(e) => setSimMonthly(e.target.value)}
                                className="bg-black/40"
                                isCurrency
                            />
                            <Input
                                label="Anos Investindo"
                                type="number"
                                value={simYears}
                                onChange={(e) => setSimYears(e.target.value)}
                                className="bg-black/40"
                            />
                        </div>
                        <Input
                            label="Taxa de Juros Anual (%)"
                            type="number"
                            value={simRate}
                            onChange={(e) => setSimRate(e.target.value)}
                            className="bg-black/40"
                        />
                        <Button onClick={calculateCompoundInterest} variant="secondary">
                            Calcular Futuro <ArrowRight size={18} />
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center text-center p-6 bg-black/20 rounded-xl border border-white/5 min-h-[250px]">
                    {simResult !== null ? (
                        <div className="animate-scale-up">
                            <p className="text-textMuted text-sm uppercase tracking-widest mb-2">Em {simYears} anos você terá</p>
                            <h2 className="text-4xl md:text-5xl font-bold text-white mb-2 text-shadow-glow">
                                R$ {simResult.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                            </h2>
                            <p className="text-xs text-secondary bg-secondary/10 px-3 py-1 rounded-full inline-block">
                                O poder dos juros compostos
                            </p>
                        </div>
                    ) : (
                        <div className="text-textMuted/50">
                            <Calculator size={64} className="mx-auto mb-4 opacity-20" />
                            <p>Preencha os dados ao lado para simular.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm p-0 md:p-4" onClick={() => setIsAddModalOpen(false)}>
                    <div className="bg-surface w-full max-w-md rounded-t-2xl md:rounded-2xl border border-surfaceHighlight shadow-2xl animate-slide-up" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-surfaceHighlight flex justify-between items-center">
                            <h3 className="text-lg font-bold text-white">Novo Investimento</h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-textMuted hover:text-white"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleAddAsset} className="p-6 space-y-4">
                            <div ref={autocompleteRef} className="relative">
                                <label className="text-sm font-medium text-textMuted mb-1.5 block">Ticker ou Nome</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Ex: PETR4, Bitcoin, XPML11"
                                        required
                                        value={assetName}
                                        onChange={e => handleAssetSearch(e.target.value)}
                                        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                                        className="w-full px-4 py-3 bg-inputBg border border-inputBorder rounded-xl text-white placeholder-textMuted focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                        autoComplete="off"
                                    />
                                    {isSearching && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <Loader2 size={16} className="animate-spin text-textMuted" />
                                        </div>
                                    )}
                                </div>

                                {/* Autocomplete Dropdown */}
                                {showSuggestions && suggestions.length > 0 && (
                                    <div className="absolute z-50 w-full mt-1 bg-surface border border-surfaceHighlight rounded-xl shadow-2xl max-h-64 overflow-y-auto">
                                        {suggestions.map((asset, index) => (
                                            <button
                                                key={asset.id || index}
                                                type="button"
                                                onClick={() => handleSelectSuggestion(asset)}
                                                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-surfaceHighlight transition-colors text-left border-b border-surfaceHighlight/50 last:border-0"
                                            >
                                                <span className={`text - lg ${asset.type === 'Cripto' ? 'text-amber-400' :
                                                    asset.type === 'FIIs' ? 'text-blue-400' :
                                                        asset.type === 'Renda Fixa' ? 'text-green-400' :
                                                            'text-purple-400'
                                                    } `}>
                                                    {asset.type === 'Cripto' && '₿'}
                                                    {asset.type === 'FIIs' && '🏢'}
                                                    {asset.type === 'Renda Fixa' && '💵'}
                                                    {asset.type === 'Ações' && '📈'}
                                                </span>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-white">{asset.symbol}</span>
                                                        <span className={`text - xs px - 1.5 py - 0.5 rounded ${asset.type === 'Cripto' ? 'bg-amber-500/20 text-amber-400' :
                                                            asset.type === 'FIIs' ? 'bg-blue-500/20 text-blue-400' :
                                                                asset.type === 'Renda Fixa' ? 'bg-green-500/20 text-green-400' :
                                                                    'bg-purple-500/20 text-purple-400'
                                                            } `}>
                                                            {asset.type}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-textMuted truncate">{asset.name}</p>
                                                    {asset.sector && (
                                                        <p className="text-xs text-textMuted/60">{asset.sector}</p>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Type badge */}
                                {assetName.length >= 2 && !showSuggestions && (
                                    <div className="mt-2 flex items-center gap-2">
                                        <span className={`text - xs px - 2 py - 1 rounded - full ${assetType === 'Cripto' ? 'bg-amber-500/20 text-amber-400' :
                                            assetType === 'FIIs' ? 'bg-blue-500/20 text-blue-400' :
                                                assetType === 'Renda Fixa' ? 'bg-green-500/20 text-green-400' :
                                                    assetType === 'Outros' ? 'bg-red-500/20 text-red-400' :
                                                        'bg-purple-500/20 text-purple-400'
                                            } `}>
                                            {assetType === 'Cripto' && '₿ '}
                                            {assetType === 'FIIs' && '🏢 '}
                                            {assetType === 'Renda Fixa' && '💵 '}
                                            {assetType === 'Ações' && '📈 '}
                                            {assetType === 'Outros' && '❓ '}
                                            {assetType === 'Outros' ? 'Não reconhecido' : `Detectado: ${assetType} `}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Tipo de Ativo - Read-only, auto-detected */}
                            <div>
                                <label className="text-sm font-medium text-textMuted mb-1.5 block">Tipo de Ativo</label>
                                <div className={`w - full px - 4 py - 3 rounded - xl border flex items - center gap - 3 transition - all ${assetType === 'Cripto' ? 'bg-amber-500/10 border-amber-500/30' :
                                    assetType === 'FIIs' ? 'bg-blue-500/10 border-blue-500/30' :
                                        assetType === 'Renda Fixa' ? 'bg-green-500/10 border-green-500/30' :
                                            assetType === 'Outros' ? 'bg-red-500/10 border-red-500/30' :
                                                'bg-purple-500/10 border-purple-500/30'
                                    } `}>
                                    <span className="text-xl">
                                        {assetType === 'Cripto' && '₿'}
                                        {assetType === 'FIIs' && '🏢'}
                                        {assetType === 'Renda Fixa' && '💵'}
                                        {assetType === 'Ações' && '📈'}
                                        {assetType === 'Outros' && '❓'}
                                    </span>
                                    <span className={`font - semibold ${assetType === 'Cripto' ? 'text-amber-400' :
                                        assetType === 'FIIs' ? 'text-blue-400' :
                                            assetType === 'Renda Fixa' ? 'text-green-400' :
                                                assetType === 'Outros' ? 'text-red-400' :
                                                    'text-purple-400'
                                        } `}>
                                        {assetType}
                                    </span>
                                    <span className="text-[10px] text-textMuted ml-auto bg-black/20 px-2 py-0.5 rounded-full">Automático</span>
                                </div>
                                {assetType === 'Outros' && (
                                    <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                                        ⚠️ Ticker não reconhecido. Use formato brasileiro (PETR4) ou nome de crypto (Bitcoin).
                                    </p>
                                )}
                            </div>

                            {/* Quantidade (para ações/cripto/FIIs) */}
                            {(assetType === 'Ações' || assetType === 'Cripto' || assetType === 'FIIs') && (
                                <Input
                                    label={`Quantidade de ${assetType === 'Cripto' ? 'moedas' : 'cotas/ações'} (opcional)`}
                                    type="number"
                                    placeholder="Ex: 100"
                                    value={quantity}
                                    onChange={e => setQuantity(e.target.value)}
                                />
                            )}

                            <Input
                                label="Valor Total Investido (R$)"
                                type="number"
                                placeholder="0,00"
                                required
                                value={amountInvested}
                                onChange={e => setAmountInvested(e.target.value)}
                                isCurrency
                            />

                            <div className="p-3 bg-surfaceHighlight rounded-xl text-xs text-textMuted">
                                <p className="text-[10px] opacity-70">🔍 PETR4, VALE3 → Ações | XPML11 → FIIs | Bitcoin, ETH → Cripto | CDB, Tesouro → Renda Fixa</p>
                            </div>

                            <Button type="submit" className="mt-4">Salvar na Carteira</Button>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {isEditModalOpen && editingAsset && (
                <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm p-0 md:p-4" onClick={() => setIsEditModalOpen(false)}>
                    <div className="bg-surface w-full max-w-md rounded-t-2xl md:rounded-2xl border border-surfaceHighlight shadow-2xl animate-slide-up" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-surfaceHighlight flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold text-white">Editar {editingAsset.assetName}</h3>
                                <p className="text-xs text-textMuted">{editingAsset.type}</p>
                            </div>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-textMuted hover:text-white"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleEditAsset} className="p-6 space-y-4">
                            {/* Show quantity field for stocks, crypto and FIIs */}
                            {(editingAsset.type === 'Ações' || editingAsset.type === 'Cripto' || editingAsset.type === 'FIIs') && (
                                <Input
                                    label={`Quantidade de ${editingAsset.type === 'Cripto' ? 'moedas' : 'cotas/ações'}`}
                                    type="number"
                                    placeholder="Ex: 100"
                                    value={editQuantity}
                                    onChange={e => setEditQuantity(e.target.value)}
                                />
                            )}

                            <Input
                                label="Valor Total Investido (R$)"
                                type="number"
                                placeholder="0,00"
                                required
                                value={editAmountInvested}
                                onChange={e => setEditAmountInvested(e.target.value)}
                                isCurrency
                            />

                            <div className="p-3 bg-surfaceHighlight rounded-xl text-xs text-textMuted">
                                <p>💡 Atualize os valores conforme suas operações na corretora.</p>
                            </div>

                            <Button type="submit" className="mt-4">Salvar Alterações</Button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Investments;
