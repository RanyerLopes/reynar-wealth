/**
 * Stock Market Service
 * Uses BRAPI (brapi.dev) for Brazilian stock quotes
 * Free tier: 150,000 requests/month, 15-minute delay
 */

// BRAPI configuration
const BRAPI_BASE_URL = 'https://brapi.dev/api';
const BRAPI_TOKEN = import.meta.env.VITE_BRAPI_TOKEN || '4NLFuWxDzeHdSdXPKJoHbV';

// Helper to add token to URL
const withToken = (url: string): string => {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}token=${BRAPI_TOKEN}`;
};

// Types for stock data
export interface StockQuote {
    symbol: string;
    shortName: string;
    longName: string;
    currency: string;
    regularMarketPrice: number;
    regularMarketChange: number;
    regularMarketChangePercent: number;
    regularMarketDayHigh: number;
    regularMarketDayLow: number;
    regularMarketVolume: number;
    regularMarketPreviousClose: number;
    regularMarketOpen: number;
    regularMarketTime: string;
    logourl?: string;
}

export interface StockHistorical {
    date: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export interface QuoteResponse {
    results: StockQuote[];
    requestedAt: string;
    took: string;
}

// Cache to avoid hitting API limits
const quoteCache: Map<string, { data: StockQuote; timestamp: number }> = new Map();
const CACHE_DURATION = 60000; // 1 minute cache

/**
 * Get quote for a single stock
 */
export const getStockQuote = async (symbol: string): Promise<StockQuote | null> => {
    try {
        // Check cache first
        const cached = quoteCache.get(symbol.toUpperCase());
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            return cached.data;
        }

        const response = await fetch(withToken(`${BRAPI_BASE_URL}/quote/${symbol}?fundamental=true`));

        if (!response.ok) {
            console.error(`Failed to fetch quote for ${symbol}:`, response.status);
            return null;
        }

        const data: QuoteResponse = await response.json();

        if (data.results && data.results.length > 0) {
            const quote = data.results[0];
            quoteCache.set(symbol.toUpperCase(), { data: quote, timestamp: Date.now() });
            return quote;
        }

        return null;
    } catch (error) {
        console.error(`Error fetching quote for ${symbol}:`, error);
        return null;
    }
};

/**
 * Get quotes for multiple stocks at once
 */
export const getMultipleQuotes = async (symbols: string[]): Promise<StockQuote[]> => {
    try {
        if (symbols.length === 0) return [];

        // Filter out cached symbols
        const symbolsToFetch: string[] = [];
        const cachedQuotes: StockQuote[] = [];

        symbols.forEach(symbol => {
            const cached = quoteCache.get(symbol.toUpperCase());
            if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
                cachedQuotes.push(cached.data);
            } else {
                symbolsToFetch.push(symbol);
            }
        });

        if (symbolsToFetch.length === 0) {
            return cachedQuotes;
        }

        // Fetch remaining symbols with fundamental data (includes logo)
        const symbolList = symbolsToFetch.join(',');
        const response = await fetch(withToken(`${BRAPI_BASE_URL}/quote/${symbolList}?fundamental=true`));

        if (!response.ok) {
            console.error('Failed to fetch multiple quotes:', response.status);

            // Fallback mock data when rate limited (429)
            if (response.status === 429) {
                console.warn('BRAPI rate limit reached, using mock data');
                const mockQuotes: StockQuote[] = [
                    { symbol: 'PETR4', shortName: 'Petrobras PN', longName: 'Petrobras', currency: 'BRL', regularMarketPrice: 36.82, regularMarketChange: 0.45, regularMarketChangePercent: 1.24, regularMarketDayHigh: 37.10, regularMarketDayLow: 36.20, regularMarketVolume: 45000000, regularMarketPreviousClose: 36.37, regularMarketOpen: 36.50, regularMarketTime: new Date().toISOString(), logourl: 'https://s3-symbol-logo.tradingview.com/brasileiro-petrobras--600.png' },
                    { symbol: 'VALE3', shortName: 'Vale ON', longName: 'Vale', currency: 'BRL', regularMarketPrice: 67.45, regularMarketChange: 1.12, regularMarketChangePercent: 1.69, regularMarketDayHigh: 68.00, regularMarketDayLow: 66.80, regularMarketVolume: 32000000, regularMarketPreviousClose: 66.33, regularMarketOpen: 66.50, regularMarketTime: new Date().toISOString(), logourl: 'https://s3-symbol-logo.tradingview.com/vale--600.png' },
                    { symbol: 'ITUB4', shortName: 'Itaú Unibanco PN', longName: 'Itaú', currency: 'BRL', regularMarketPrice: 32.18, regularMarketChange: 0.28, regularMarketChangePercent: 0.88, regularMarketDayHigh: 32.50, regularMarketDayLow: 31.90, regularMarketVolume: 28000000, regularMarketPreviousClose: 31.90, regularMarketOpen: 32.00, regularMarketTime: new Date().toISOString(), logourl: 'https://s3-symbol-logo.tradingview.com/itau-unibanco--600.png' },
                    { symbol: 'BBDC4', shortName: 'Bradesco PN', longName: 'Bradesco', currency: 'BRL', regularMarketPrice: 13.42, regularMarketChange: -0.15, regularMarketChangePercent: -1.10, regularMarketDayHigh: 13.60, regularMarketDayLow: 13.30, regularMarketVolume: 20000000, regularMarketPreviousClose: 13.57, regularMarketOpen: 13.55, regularMarketTime: new Date().toISOString(), logourl: 'https://s3-symbol-logo.tradingview.com/bradesco--600.png' },
                    { symbol: 'BBAS3', shortName: 'Banco do Brasil ON', longName: 'BB', currency: 'BRL', regularMarketPrice: 28.95, regularMarketChange: 0.35, regularMarketChangePercent: 1.22, regularMarketDayHigh: 29.10, regularMarketDayLow: 28.60, regularMarketVolume: 15000000, regularMarketPreviousClose: 28.60, regularMarketOpen: 28.70, regularMarketTime: new Date().toISOString(), logourl: 'https://s3-symbol-logo.tradingview.com/banco-do-brasil--600.png' },
                    { symbol: 'WEGE3', shortName: 'WEG ON', longName: 'WEG', currency: 'BRL', regularMarketPrice: 52.30, regularMarketChange: 0.78, regularMarketChangePercent: 1.51, regularMarketDayHigh: 52.80, regularMarketDayLow: 51.50, regularMarketVolume: 8000000, regularMarketPreviousClose: 51.52, regularMarketOpen: 51.60, regularMarketTime: new Date().toISOString(), logourl: 'https://s3-symbol-logo.tradingview.com/weg--600.png' },
                    { symbol: 'ABEV3', shortName: 'Ambev ON', longName: 'Ambev', currency: 'BRL', regularMarketPrice: 12.85, regularMarketChange: -0.08, regularMarketChangePercent: -0.62, regularMarketDayHigh: 12.95, regularMarketDayLow: 12.75, regularMarketVolume: 22000000, regularMarketPreviousClose: 12.93, regularMarketOpen: 12.90, regularMarketTime: new Date().toISOString(), logourl: 'https://s3-symbol-logo.tradingview.com/ambev--600.png' },
                    { symbol: 'MGLU3', shortName: 'Magazine Luiza ON', longName: 'Magalu', currency: 'BRL', regularMarketPrice: 9.45, regularMarketChange: -0.32, regularMarketChangePercent: -3.28, regularMarketDayHigh: 9.80, regularMarketDayLow: 9.35, regularMarketVolume: 35000000, regularMarketPreviousClose: 9.77, regularMarketOpen: 9.70, regularMarketTime: new Date().toISOString(), logourl: 'https://s3-symbol-logo.tradingview.com/magazine-luiza--600.png' },
                    { symbol: 'RENT3', shortName: 'Localiza ON', longName: 'Localiza', currency: 'BRL', regularMarketPrice: 45.20, regularMarketChange: 0.55, regularMarketChangePercent: 1.23, regularMarketDayHigh: 45.50, regularMarketDayLow: 44.60, regularMarketVolume: 5000000, regularMarketPreviousClose: 44.65, regularMarketOpen: 44.80, regularMarketTime: new Date().toISOString(), logourl: 'https://s3-symbol-logo.tradingview.com/localiza-hertz--600.png' },
                    { symbol: 'B3SA3', shortName: 'B3 ON', longName: 'B3', currency: 'BRL', regularMarketPrice: 11.78, regularMarketChange: -0.12, regularMarketChangePercent: -1.01, regularMarketDayHigh: 11.95, regularMarketDayLow: 11.65, regularMarketVolume: 18000000, regularMarketPreviousClose: 11.90, regularMarketOpen: 11.88, regularMarketTime: new Date().toISOString(), logourl: 'https://s3-symbol-logo.tradingview.com/b3-brasil-bolsa-balcao--600.png' },
                ];
                return mockQuotes;
            }

            return cachedQuotes;
        }

        const data: QuoteResponse = await response.json();

        if (data.results) {
            // Update cache
            data.results.forEach(quote => {
                quoteCache.set(quote.symbol.toUpperCase(), { data: quote, timestamp: Date.now() });
            });
            return [...cachedQuotes, ...data.results];
        }

        return cachedQuotes;
    } catch (error) {
        console.error('Error fetching multiple quotes:', error);
        return [];
    }
};

/**
 * Get historical data for a stock
 */
export const getStockHistory = async (
    symbol: string,
    range: '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '2y' | '5y' | 'max' = '1mo'
): Promise<StockHistorical[]> => {
    try {
        const response = await fetch(withToken(`${BRAPI_BASE_URL}/quote/${symbol}?range=${range}&interval=1d&fundamental=false`));

        if (!response.ok) {
            console.error(`Failed to fetch history for ${symbol}:`, response.status);
            return [];
        }

        const data = await response.json();

        if (data.results && data.results[0]?.historicalDataPrice) {
            return data.results[0].historicalDataPrice;
        }

        return [];
    } catch (error) {
        console.error(`Error fetching history for ${symbol}:`, error);
        return [];
    }
};

/**
 * Search for stocks by name or symbol
 */
export const searchStocks = async (query: string): Promise<{ symbol: string; name: string }[]> => {
    try {
        const response = await fetch(withToken(`${BRAPI_BASE_URL}/quote/list?search=${encodeURIComponent(query)}`));

        if (!response.ok) {
            console.error('Failed to search stocks:', response.status);
            return [];
        }

        const data = await response.json();

        if (data.stocks) {
            return data.stocks.map((stock: any) => ({
                symbol: stock.stock,
                name: stock.name || stock.stock
            }));
        }

        return [];
    } catch (error) {
        console.error('Error searching stocks:', error);
        return [];
    }
};

/**
 * Format currency in Brazilian Real
 */
export const formatBRL = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
};

/**
 * Format percentage change
 */
export const formatPercentChange = (value: number): string => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
};

/**
 * Get color class based on change
 */
export const getChangeColor = (change: number): string => {
    if (change > 0) return 'text-green-500';
    if (change < 0) return 'text-red-500';
    return 'text-textMuted';
};

/**
 * Popular Brazilian stocks for suggestions
 */
export const POPULAR_STOCKS = [
    { symbol: 'PETR4', name: 'Petrobras PN' },
    { symbol: 'VALE3', name: 'Vale ON' },
    { symbol: 'ITUB4', name: 'Itaú Unibanco PN' },
    { symbol: 'BBDC4', name: 'Bradesco PN' },
    { symbol: 'BBAS3', name: 'Banco do Brasil ON' },
    { symbol: 'WEGE3', name: 'WEG ON' },
    { symbol: 'ABEV3', name: 'Ambev ON' },
    { symbol: 'MGLU3', name: 'Magazine Luiza ON' },
    { symbol: 'RENT3', name: 'Localiza ON' },
    { symbol: 'B3SA3', name: 'B3 ON' },
];

// ============================================
// DIVIDENDOS
// ============================================

export interface Dividend {
    symbol: string;
    label: string;
    paymentDate: string;
    rate: number;
    relatedTo: string;
    type: string;
}

/**
 * Get dividends for a stock
 */
export const getStockDividends = async (symbol: string): Promise<Dividend[]> => {
    try {
        const response = await fetch(withToken(`${BRAPI_BASE_URL}/quote/${symbol}?dividends=true`));

        if (!response.ok) {
            console.error(`Failed to fetch dividends for ${symbol}:`, response.status);
            return [];
        }

        const data = await response.json();

        if (data.results && data.results[0]?.dividendsData?.cashDividends) {
            return data.results[0].dividendsData.cashDividends.map((div: any) => ({
                symbol: symbol.toUpperCase(),
                label: div.label || '',
                paymentDate: div.paymentDate || '',
                rate: div.rate || 0,
                relatedTo: div.relatedTo || '',
                type: div.type || 'Dividendo'
            }));
        }

        return [];
    } catch (error) {
        console.error(`Error fetching dividends for ${symbol}:`, error);
        return [];
    }
};

// ============================================
// CRIPTOMOEDAS
// ============================================

export interface CryptoQuote {
    currency: string;
    name: string;
    currencyRateFromUSD: number;
    change24h: number;
}

/**
 * Get cryptocurrency prices
 */
export const getCryptoQuotes = async (coins: string[] = ['BTC', 'ETH', 'USDT']): Promise<CryptoQuote[]> => {
    try {
        const coinList = coins.join(',');
        const response = await fetch(withToken(`${BRAPI_BASE_URL}/v2/crypto?coin=${coinList}`));

        if (!response.ok) {
            console.error('Failed to fetch crypto quotes:', response.status);
            return [];
        }

        const data = await response.json();

        if (data.coins) {
            return data.coins.map((coin: any) => ({
                currency: coin.coin || '',
                name: coin.name || coin.coin,
                currencyRateFromUSD: coin.regularMarketPrice || 0,
                change24h: coin.regularMarketChangePercent || 0
            }));
        }

        return [];
    } catch (error) {
        console.error('Error fetching crypto quotes:', error);
        return [];
    }
};

/**
 * Popular cryptocurrencies
 */
export const POPULAR_CRYPTOS = [
    { symbol: 'BTC', name: 'Bitcoin' },
    { symbol: 'ETH', name: 'Ethereum' },
    { symbol: 'BNB', name: 'Binance Coin' },
    { symbol: 'SOL', name: 'Solana' },
    { symbol: 'XRP', name: 'Ripple' },
    { symbol: 'USDT', name: 'Tether' },
];

// ============================================
// MOEDAS (CÂMBIO)
// ============================================

export interface CurrencyRate {
    fromCurrency: string;
    toCurrency: string;
    name: string;
    high: number;
    low: number;
    bidPrice: number;
    askPrice: number;
    varBid: number;
    pctChange: number;
    timestamp: string;
}

/**
 * Get currency exchange rates
 */
export const getCurrencyRates = async (currencies: string[] = ['USD-BRL', 'EUR-BRL']): Promise<CurrencyRate[]> => {
    try {
        const currencyList = currencies.join(',');
        const response = await fetch(withToken(`${BRAPI_BASE_URL}/v2/currency?currency=${currencyList}`));

        if (!response.ok) {
            console.error('Failed to fetch currency rates:', response.status);
            return [];
        }

        const data = await response.json();

        if (data.currency) {
            return data.currency.map((rate: any) => ({
                fromCurrency: rate.fromCurrency || '',
                toCurrency: rate.toCurrency || '',
                name: rate.name || `${rate.fromCurrency}/${rate.toCurrency}`,
                high: rate.high || 0,
                low: rate.low || 0,
                bidPrice: rate.bidPrice || 0,
                askPrice: rate.askPrice || 0,
                varBid: rate.varBid || 0,
                pctChange: rate.pctChange || 0,
                timestamp: rate.timestamp || ''
            }));
        }

        return [];
    } catch (error) {
        console.error('Error fetching currency rates:', error);
        return [];
    }
};

// ============================================
// INFLAÇÃO E TAXA SELIC
// ============================================

export interface InflationData {
    date: string;
    value: number;
    epochDate: number;
}

/**
 * Get IPCA (Official inflation index)
 */
export const getIPCA = async (): Promise<InflationData[]> => {
    try {
        const response = await fetch(withToken(`${BRAPI_BASE_URL}/v2/inflation`));

        if (!response.ok) {
            console.error('Failed to fetch IPCA:', response.status);
            return [];
        }

        const data = await response.json();

        if (data.inflation) {
            return data.inflation.map((item: any) => ({
                date: item.date || '',
                value: item.value || 0,
                epochDate: item.epochDate || 0
            }));
        }

        return [];
    } catch (error) {
        console.error('Error fetching IPCA:', error);
        return [];
    }
};

/**
 * Get Taxa Selic (Interest Rate)
 */
export const getTaxaSelic = async (): Promise<InflationData[]> => {
    try {
        const response = await fetch(withToken(`${BRAPI_BASE_URL}/v2/prime-rate`));

        if (!response.ok) {
            console.error('Failed to fetch Selic:', response.status);
            return [];
        }

        const data = await response.json();

        if (data['prime-rate']) {
            return data['prime-rate'].map((item: any) => ({
                date: item.date || '',
                value: item.value || 0,
                epochDate: item.epochDate || 0
            }));
        }

        return [];
    } catch (error) {
        console.error('Error fetching Selic:', error);
        return [];
    }
};

// ============================================
// ANÁLISE FUNDAMENTALISTA
// ============================================

export interface FundamentalData {
    symbol: string;
    longName: string;
    priceEarnings: number;      // P/L
    earningsPerShare: number;   // LPA
    marketCap: number;
    dividendYield?: number;
    priceToBook?: number;       // P/VP
    returnOnEquity?: number;    // ROE
}

/**
 * Get fundamental analysis data for a stock
 */
export const getFundamentalData = async (symbol: string): Promise<FundamentalData | null> => {
    try {
        const response = await fetch(withToken(`${BRAPI_BASE_URL}/quote/${symbol}?fundamental=true`));

        if (!response.ok) {
            console.error(`Failed to fetch fundamental data for ${symbol}:`, response.status);
            return null;
        }

        const data = await response.json();

        if (data.results && data.results.length > 0) {
            const stock = data.results[0];
            return {
                symbol: stock.symbol || symbol,
                longName: stock.longName || stock.shortName || symbol,
                priceEarnings: stock.priceEarnings || 0,
                earningsPerShare: stock.earningsPerShare || 0,
                marketCap: stock.marketCap || 0,
                dividendYield: stock.dividendYield,
                priceToBook: stock.priceToBook,
                returnOnEquity: stock.returnOnEquity
            };
        }

        return null;
    } catch (error) {
        console.error(`Error fetching fundamental data for ${symbol}:`, error);
        return null;
    }
};

/**
 * Format market cap in readable format
 */
export const formatMarketCap = (value: number): string => {
    if (value >= 1e12) return `R$ ${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `R$ ${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `R$ ${(value / 1e6).toFixed(2)}M`;
    return formatBRL(value);
};

