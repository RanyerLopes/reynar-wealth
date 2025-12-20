import React, { useState, useEffect } from 'react';
import { Card, Button } from '../components/UI';
import {
    TrendingUp, TrendingDown, RefreshCw, DollarSign, Bitcoin,
    BarChart3, Percent, Building2, Coins, Loader2, AlertCircle
} from 'lucide-react';
import {
    getCurrencyRates,
    getCryptoQuotes,
    getIPCA,
    getTaxaSelic,
    getStockQuote,
    POPULAR_STOCKS,
    POPULAR_CRYPTOS,
    formatBRL,
    formatPercentChange,
    getChangeColor,
    CurrencyRate,
    CryptoQuote,
    InflationData,
    StockQuote
} from '../services/stockService';

const Market: React.FC = () => {
    // Loading states
    const [isLoading, setIsLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    // Data states
    const [currencies, setCurrencies] = useState<CurrencyRate[]>([]);
    const [cryptos, setCryptos] = useState<CryptoQuote[]>([]);
    const [ipca, setIpca] = useState<InflationData[]>([]);
    const [selic, setSelic] = useState<InflationData[]>([]);
    const [stocks, setStocks] = useState<(StockQuote | null)[]>([]);

    // Fetch all market data
    const fetchMarketData = async () => {
        setIsLoading(true);
        try {
            // Fetch all data in parallel
            const [currencyData, cryptoData, ipcaData, selicData] = await Promise.all([
                getCurrencyRates(['USD-BRL', 'EUR-BRL', 'GBP-BRL', 'BTC-BRL']),
                getCryptoQuotes(['BTC', 'ETH', 'SOL', 'BNB']),
                getIPCA(),
                getTaxaSelic()
            ]);

            // Fetch top stocks
            const stockPromises = POPULAR_STOCKS.slice(0, 6).map(s => getStockQuote(s.symbol));
            const stockData = await Promise.all(stockPromises);

            setCurrencies(currencyData);
            setCryptos(cryptoData);
            setIpca(ipcaData.slice(0, 12)); // Last 12 months
            setSelic(selicData.slice(0, 12));
            setStocks(stockData);
            setLastUpdated(new Date());
        } catch (error) {
            console.error('Error fetching market data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMarketData();
    }, []);

    // Get latest values (using known public values as fallback)
    // Selic atual: 12.25% (Dec 2024), IPCA acumulado 12m: ~4.83%
    const latestIPCA = ipca[0]?.value || 4.83;
    const latestSelic = selic[0]?.value || 12.25;

    return (
        <div className="pb-24 md:pb-0 space-y-6 animate-fade-in">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-textMain">Mercado</h2>
                    <p className="text-textMuted text-sm">
                        Cotações em tempo real •
                        {lastUpdated && ` Atualizado às ${lastUpdated.toLocaleTimeString('pt-BR')}`}
                    </p>
                </div>

                <Button
                    variant="secondary"
                    className="!w-auto px-4 py-2"
                    onClick={fetchMarketData}
                    isLoading={isLoading}
                >
                    <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                    <span className="hidden sm:inline">Atualizar</span>
                </Button>
            </header>

            {isLoading && stocks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 size={40} className="animate-spin text-primary mb-4" />
                    <p className="text-textMuted">Carregando dados do mercado...</p>
                </div>
            ) : (
                <>
                    {/* Indicadores Econômicos */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/20 rounded-xl">
                                    <Percent size={20} className="text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-textMuted">Taxa Selic</p>
                                    <p className="text-xl font-bold text-white">{latestSelic.toFixed(2)}%</p>
                                </div>
                            </div>
                        </Card>

                        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-500/20 rounded-xl">
                                    <TrendingUp size={20} className="text-amber-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-textMuted">IPCA (12m)</p>
                                    <p className="text-xl font-bold text-white">{latestIPCA.toFixed(2)}%</p>
                                </div>
                            </div>
                        </Card>

                        {currencies.slice(0, 2).map((curr, idx) => (
                            <Card key={idx} className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-500/20 rounded-xl">
                                        <DollarSign size={20} className="text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-textMuted">{curr.fromCurrency}/BRL</p>
                                        <p className="text-xl font-bold text-white">R$ {curr.bidPrice.toFixed(2)}</p>
                                        <p className={`text-xs ${getChangeColor(curr.pctChange)}`}>
                                            {formatPercentChange(curr.pctChange)}
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>

                    {/* Ações B3 */}
                    <Card>
                        <div className="flex items-center gap-2 mb-4">
                            <Building2 size={20} className="text-primary" />
                            <h3 className="font-semibold text-textMain">Ações B3</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {stocks.map((stock, idx) => stock && (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between p-3 bg-surfaceHighlight/50 rounded-xl hover:bg-surfaceHighlight transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        {stock.logourl ? (
                                            <img
                                                src={stock.logourl}
                                                alt={stock.symbol}
                                                className="w-8 h-8 rounded-full bg-white p-0.5"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                                <BarChart3 size={16} className="text-primary" />
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-bold text-white">{stock.symbol}</p>
                                            <p className="text-xs text-textMuted truncate max-w-[120px]">
                                                {stock.shortName}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-white">
                                            {formatBRL(stock.regularMarketPrice)}
                                        </p>
                                        <p className={`text-xs flex items-center justify-end gap-1 ${getChangeColor(stock.regularMarketChangePercent)}`}>
                                            {stock.regularMarketChangePercent >= 0 ? (
                                                <TrendingUp size={12} />
                                            ) : (
                                                <TrendingDown size={12} />
                                            )}
                                            {formatPercentChange(stock.regularMarketChangePercent)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Criptomoedas */}
                    <Card>
                        <div className="flex items-center gap-2 mb-4">
                            <Bitcoin size={20} className="text-amber-400" />
                            <h3 className="font-semibold text-textMain">Criptomoedas</h3>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {cryptos.map((crypto, idx) => (
                                <div
                                    key={idx}
                                    className="p-4 bg-surfaceHighlight/50 rounded-xl hover:bg-surfaceHighlight transition-colors"
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                                            <Coins size={16} className="text-amber-400" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-white">{crypto.currency}</p>
                                            <p className="text-xs text-textMuted">{crypto.name}</p>
                                        </div>
                                    </div>
                                    <p className="text-lg font-semibold text-white">
                                        ${crypto.currencyRateFromUSD.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                                    </p>
                                    <p className={`text-xs ${getChangeColor(crypto.change24h)}`}>
                                        24h: {formatPercentChange(crypto.change24h)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Câmbio Completo */}
                    <Card>
                        <div className="flex items-center gap-2 mb-4">
                            <DollarSign size={20} className="text-green-400" />
                            <h3 className="font-semibold text-textMain">Câmbio</h3>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left text-xs text-textMuted border-b border-surfaceHighlight">
                                        <th className="pb-2">Moeda</th>
                                        <th className="pb-2">Compra</th>
                                        <th className="pb-2">Venda</th>
                                        <th className="pb-2">Variação</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currencies.map((curr, idx) => (
                                        <tr key={idx} className="border-b border-surfaceHighlight/50">
                                            <td className="py-3 font-medium text-white">
                                                {curr.fromCurrency}/{curr.toCurrency}
                                            </td>
                                            <td className="py-3 text-textMuted">
                                                R$ {curr.bidPrice.toFixed(4)}
                                            </td>
                                            <td className="py-3 text-textMuted">
                                                R$ {curr.askPrice.toFixed(4)}
                                            </td>
                                            <td className={`py-3 ${getChangeColor(curr.pctChange)}`}>
                                                {formatPercentChange(curr.pctChange)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    {/* Histórico IPCA/Selic */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp size={20} className="text-amber-400" />
                                <h3 className="font-semibold text-textMain">Histórico IPCA</h3>
                            </div>
                            <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                                {ipca.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center py-2 border-b border-surfaceHighlight/50">
                                        <span className="text-textMuted text-sm">{item.date}</span>
                                        <span className={`font-medium ${item.value > 0 ? 'text-amber-400' : 'text-green-400'}`}>
                                            {item.value.toFixed(2)}%
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card>
                            <div className="flex items-center gap-2 mb-4">
                                <Percent size={20} className="text-blue-400" />
                                <h3 className="font-semibold text-textMain">Histórico Selic</h3>
                            </div>
                            <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                                {selic.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center py-2 border-b border-surfaceHighlight/50">
                                        <span className="text-textMuted text-sm">{item.date}</span>
                                        <span className="font-medium text-blue-400">
                                            {item.value.toFixed(2)}%
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </>
            )}
        </div>
    );
};

export default Market;
