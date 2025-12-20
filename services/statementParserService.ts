/**
 * Statement Parser Service
 * 
 * Parses bank statements from CSV, OFX, and PDF formats.
 * Supports international banks and multiple currencies.
 */

import { Transaction, TransactionType } from '../types';

// ============================================================================
// TYPES
// ============================================================================

export interface ParsedTransaction {
    date: Date;
    description: string;
    amount: number;
    type: TransactionType;
    category?: string;
    confidence?: number;
    originalLine?: string;
    currency?: string;
    bankReference?: string;
}

export interface ParseResult {
    transactions: ParsedTransaction[];
    bankName?: string;
    accountInfo?: string;
    currency?: string;
    period?: { start: Date; end: Date };
    errors: string[];
    warnings: string[];
}

export interface BankProfile {
    name: string;
    country: string;
    currency: string;
    dateFormat: string;
    decimalSeparator: ',' | '.';
    thousandsSeparator: '.' | ',' | ' ' | '';
    columnMappings: {
        date?: number | string;
        description?: number | string;
        amount?: number | string;
        type?: number | string;
        balance?: number | string;
    };
    skipRows?: number;
    detectPattern?: RegExp;
}

// ============================================================================
// BANK PROFILES - International Support
// ============================================================================

export const BANK_PROFILES: Record<string, BankProfile> = {
    // 🇧🇷 BRAZIL
    nubank: {
        name: 'Nubank',
        country: 'BR',
        currency: 'BRL',
        dateFormat: 'DD/MM/YYYY',
        decimalSeparator: ',',
        thousandsSeparator: '.',
        columnMappings: { date: 0, amount: 1, description: 2 },
        detectPattern: /nubank|nu pagamentos/i,
    },
    itau: {
        name: 'Itaú',
        country: 'BR',
        currency: 'BRL',
        dateFormat: 'DD/MM/YYYY',
        decimalSeparator: ',',
        thousandsSeparator: '.',
        columnMappings: { date: 0, description: 1, amount: 2 },
        detectPattern: /itau|itaú/i,
    },
    bradesco: {
        name: 'Bradesco',
        country: 'BR',
        currency: 'BRL',
        dateFormat: 'DD/MM/YYYY',
        decimalSeparator: ',',
        thousandsSeparator: '.',
        columnMappings: { date: 0, description: 1, amount: 2, balance: 3 },
        detectPattern: /bradesco/i,
    },
    bb: {
        name: 'Banco do Brasil',
        country: 'BR',
        currency: 'BRL',
        dateFormat: 'DD/MM/YYYY',
        decimalSeparator: ',',
        thousandsSeparator: '.',
        columnMappings: { date: 0, description: 2, amount: 3 },
        skipRows: 1,
        detectPattern: /banco do brasil|bb/i,
    },
    inter: {
        name: 'Banco Inter',
        country: 'BR',
        currency: 'BRL',
        dateFormat: 'DD/MM/YYYY',
        decimalSeparator: ',',
        thousandsSeparator: '.',
        columnMappings: { date: 0, description: 1, amount: 2, balance: 3 },
        detectPattern: /inter/i,
    },
    c6: {
        name: 'C6 Bank',
        country: 'BR',
        currency: 'BRL',
        dateFormat: 'DD/MM/YYYY',
        decimalSeparator: ',',
        thousandsSeparator: '.',
        columnMappings: { date: 0, description: 1, amount: 2 },
        detectPattern: /c6/i,
    },
    santander_br: {
        name: 'Santander Brasil',
        country: 'BR',
        currency: 'BRL',
        dateFormat: 'DD/MM/YYYY',
        decimalSeparator: ',',
        thousandsSeparator: '.',
        columnMappings: { date: 0, description: 1, amount: 2 },
        detectPattern: /santander/i,
    },
    caixa: {
        name: 'Caixa Econômica',
        country: 'BR',
        currency: 'BRL',
        dateFormat: 'DD/MM/YYYY',
        decimalSeparator: ',',
        thousandsSeparator: '.',
        columnMappings: { date: 0, description: 1, amount: 2 },
        detectPattern: /caixa|cef/i,
    },

    // 🇺🇸 USA
    chase: {
        name: 'Chase',
        country: 'US',
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        decimalSeparator: '.',
        thousandsSeparator: ',',
        columnMappings: { date: 0, description: 1, amount: 2 },
        detectPattern: /chase/i,
    },
    bofa: {
        name: 'Bank of America',
        country: 'US',
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        decimalSeparator: '.',
        thousandsSeparator: ',',
        columnMappings: { date: 0, description: 1, amount: 2 },
        detectPattern: /bank of america|bofa/i,
    },
    wells_fargo: {
        name: 'Wells Fargo',
        country: 'US',
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        decimalSeparator: '.',
        thousandsSeparator: ',',
        columnMappings: { date: 0, description: 1, amount: 2 },
        detectPattern: /wells fargo/i,
    },
    citi: {
        name: 'Citibank',
        country: 'US',
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        decimalSeparator: '.',
        thousandsSeparator: ',',
        columnMappings: { date: 0, description: 1, amount: 2 },
        detectPattern: /citi/i,
    },

    // 🇪🇺 EUROPE
    revolut: {
        name: 'Revolut',
        country: 'EU',
        currency: 'EUR',
        dateFormat: 'YYYY-MM-DD',
        decimalSeparator: '.',
        thousandsSeparator: ',',
        columnMappings: { date: 0, description: 1, amount: 2 },
        detectPattern: /revolut/i,
    },
    n26: {
        name: 'N26',
        country: 'EU',
        currency: 'EUR',
        dateFormat: 'YYYY-MM-DD',
        decimalSeparator: '.',
        thousandsSeparator: ',',
        columnMappings: { date: 0, description: 1, amount: 2 },
        detectPattern: /n26/i,
    },
    wise: {
        name: 'Wise (TransferWise)',
        country: 'EU',
        currency: 'EUR',
        dateFormat: 'DD-MM-YYYY',
        decimalSeparator: '.',
        thousandsSeparator: ',',
        columnMappings: { date: 0, description: 3, amount: 2 },
        detectPattern: /wise|transferwise/i,
    },

    // 🇬🇧 UK
    hsbc_uk: {
        name: 'HSBC UK',
        country: 'UK',
        currency: 'GBP',
        dateFormat: 'DD/MM/YYYY',
        decimalSeparator: '.',
        thousandsSeparator: ',',
        columnMappings: { date: 0, description: 1, amount: 2 },
        detectPattern: /hsbc/i,
    },
    barclays: {
        name: 'Barclays',
        country: 'UK',
        currency: 'GBP',
        dateFormat: 'DD/MM/YYYY',
        decimalSeparator: '.',
        thousandsSeparator: ',',
        columnMappings: { date: 0, description: 1, amount: 2 },
        detectPattern: /barclays/i,
    },
    monzo: {
        name: 'Monzo',
        country: 'UK',
        currency: 'GBP',
        dateFormat: 'DD/MM/YYYY',
        decimalSeparator: '.',
        thousandsSeparator: ',',
        columnMappings: { date: 0, description: 1, amount: 2 },
        detectPattern: /monzo/i,
    },

    // 🇵🇹 PORTUGAL
    millennium_pt: {
        name: 'Millennium BCP',
        country: 'PT',
        currency: 'EUR',
        dateFormat: 'DD/MM/YYYY',
        decimalSeparator: ',',
        thousandsSeparator: '.',
        columnMappings: { date: 0, description: 1, amount: 2 },
        detectPattern: /millennium|bcp/i,
    },
    caixa_pt: {
        name: 'Caixa Geral de Depósitos',
        country: 'PT',
        currency: 'EUR',
        dateFormat: 'DD/MM/YYYY',
        decimalSeparator: ',',
        thousandsSeparator: '.',
        columnMappings: { date: 0, description: 1, amount: 2 },
        detectPattern: /cgd|caixa geral/i,
    },

    // 🌍 GENERIC/FALLBACK
    generic: {
        name: 'Generic Bank',
        country: 'INTL',
        currency: 'USD',
        dateFormat: 'YYYY-MM-DD',
        decimalSeparator: '.',
        thousandsSeparator: ',',
        columnMappings: { date: 0, description: 1, amount: 2 },
    },
};

// ============================================================================
// CURRENCY CONFIGURATION
// ============================================================================

export const CURRENCY_CONFIG: Record<string, { symbol: string; locale: string; decimalPlaces: number }> = {
    BRL: { symbol: 'R$', locale: 'pt-BR', decimalPlaces: 2 },
    USD: { symbol: '$', locale: 'en-US', decimalPlaces: 2 },
    EUR: { symbol: '€', locale: 'de-DE', decimalPlaces: 2 },
    GBP: { symbol: '£', locale: 'en-GB', decimalPlaces: 2 },
    JPY: { symbol: '¥', locale: 'ja-JP', decimalPlaces: 0 },
    CAD: { symbol: 'C$', locale: 'en-CA', decimalPlaces: 2 },
    AUD: { symbol: 'A$', locale: 'en-AU', decimalPlaces: 2 },
    CHF: { symbol: 'CHF', locale: 'de-CH', decimalPlaces: 2 },
    CNY: { symbol: '¥', locale: 'zh-CN', decimalPlaces: 2 },
    MXN: { symbol: '$', locale: 'es-MX', decimalPlaces: 2 },
    ARS: { symbol: '$', locale: 'es-AR', decimalPlaces: 2 },
    CLP: { symbol: '$', locale: 'es-CL', decimalPlaces: 0 },
    COP: { symbol: '$', locale: 'es-CO', decimalPlaces: 0 },
    PEN: { symbol: 'S/', locale: 'es-PE', decimalPlaces: 2 },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Detect file type from extension and content
 */
export const detectFileType = (file: File): 'csv' | 'ofx' | 'pdf' | 'unknown' => {
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (extension === 'csv' || extension === 'txt') return 'csv';
    if (extension === 'ofx' || extension === 'qfx') return 'ofx';
    if (extension === 'pdf') return 'pdf';

    return 'unknown';
};

/**
 * Detect CSV delimiter
 */
const detectDelimiter = (content: string): string => {
    const firstLines = content.split('\n').slice(0, 5).join('\n');
    const delimiters = [';', ',', '\t', '|'];

    let maxCount = 0;
    let detected = ',';

    for (const delimiter of delimiters) {
        const count = (firstLines.match(new RegExp(`\\${delimiter}`, 'g')) || []).length;
        if (count > maxCount) {
            maxCount = count;
            detected = delimiter;
        }
    }

    return detected;
};

/**
 * Detect bank from file content
 */
const detectBank = (content: string): BankProfile => {
    for (const [, profile] of Object.entries(BANK_PROFILES)) {
        if (profile.detectPattern && profile.detectPattern.test(content)) {
            return profile;
        }
    }
    return BANK_PROFILES.generic;
};

/**
 * Parse date with multiple format support
 */
const parseDate = (dateStr: string, format: string): Date => {
    const cleaned = dateStr.trim();

    // Common date patterns
    const patterns: Record<string, RegExp> = {
        'DD/MM/YYYY': /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
        'MM/DD/YYYY': /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
        'YYYY-MM-DD': /^(\d{4})-(\d{1,2})-(\d{1,2})$/,
        'DD-MM-YYYY': /^(\d{1,2})-(\d{1,2})-(\d{4})$/,
        'YYYYMMDD': /^(\d{4})(\d{2})(\d{2})$/,
    };

    const pattern = patterns[format];
    if (!pattern) {
        // Try to parse naturally
        const parsed = new Date(cleaned);
        return isNaN(parsed.getTime()) ? new Date() : parsed;
    }

    const match = cleaned.match(pattern);
    if (!match) {
        const parsed = new Date(cleaned);
        return isNaN(parsed.getTime()) ? new Date() : parsed;
    }

    let day: number, month: number, year: number;

    if (format === 'DD/MM/YYYY' || format === 'DD-MM-YYYY') {
        [, day, month, year] = match.map(Number) as [number, number, number, number];
    } else if (format === 'MM/DD/YYYY') {
        [, month, day, year] = match.map(Number) as [number, number, number, number];
    } else if (format === 'YYYY-MM-DD') {
        [, year, month, day] = match.map(Number) as [number, number, number, number];
    } else if (format === 'YYYYMMDD') {
        [, year, month, day] = match.map(Number) as [number, number, number, number];
    } else {
        return new Date(cleaned);
    }

    return new Date(year, month - 1, day);
};

/**
 * Parse amount with international format support
 */
const parseAmount = (amountStr: string, decimalSep: ',' | '.', thousandsSep: '.' | ',' | ' ' | ''): number => {
    let cleaned = amountStr.trim();

    // Remove currency symbols
    cleaned = cleaned.replace(/[R$€£¥$₹₽₪₩฿₫]/g, '').trim();

    // Handle parentheses as negative
    const isNegative = cleaned.includes('(') && cleaned.includes(')') || cleaned.includes('-');
    cleaned = cleaned.replace(/[()]/g, '').replace('-', '');

    // Remove thousands separator
    if (thousandsSep) {
        cleaned = cleaned.replace(new RegExp(`\\${thousandsSep}`, 'g'), '');
    }

    // Replace decimal separator with dot
    if (decimalSep === ',') {
        cleaned = cleaned.replace(',', '.');
    }

    // Remove any remaining non-numeric chars except dot
    cleaned = cleaned.replace(/[^\d.]/g, '');

    const amount = parseFloat(cleaned) || 0;
    return isNegative ? -amount : amount;
};

/**
 * Determine transaction type from amount and description
 */
const determineType = (amount: number, description: string): TransactionType => {
    const incomeKeywords = [
        'salário', 'salary', 'pagamento recebido', 'pix recebido', 'transferência recebida',
        'depósito', 'deposit', 'rendimento', 'dividendo', 'dividend', 'reembolso', 'refund',
        'cashback', 'crédito', 'credit', 'income', 'received'
    ];

    const descLower = description.toLowerCase();
    const isIncomeByKeyword = incomeKeywords.some(kw => descLower.includes(kw));

    if (amount > 0 || isIncomeByKeyword) {
        return 'income';
    }
    return 'expense';
};

// ============================================================================
// CSV PARSER
// ============================================================================

export const parseCSV = async (file: File): Promise<ParseResult> => {
    const result: ParseResult = {
        transactions: [],
        errors: [],
        warnings: [],
    };

    try {
        const content = await file.text();
        const delimiter = detectDelimiter(content);
        const bankProfile = detectBank(content);

        result.bankName = bankProfile.name;
        result.currency = bankProfile.currency;

        const lines = content.split('\n').filter(line => line.trim());
        const startRow = bankProfile.skipRows || 0;

        // Try to detect header row
        const firstLine = lines[0]?.toLowerCase() || '';
        const hasHeader = firstLine.includes('data') || firstLine.includes('date') ||
            firstLine.includes('descrição') || firstLine.includes('description') ||
            firstLine.includes('valor') || firstLine.includes('amount');

        const dataStartRow = hasHeader ? Math.max(1, startRow) : startRow;

        for (let i = dataStartRow; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const columns = line.split(delimiter).map(col => col.trim().replace(/^["']|["']$/g, ''));

            const mapping = bankProfile.columnMappings;
            const dateCol = typeof mapping.date === 'number' ? mapping.date : 0;
            const descCol = typeof mapping.description === 'number' ? mapping.description : 1;
            const amountCol = typeof mapping.amount === 'number' ? mapping.amount : 2;

            const dateStr = columns[dateCol] || '';
            const description = columns[descCol] || '';
            const amountStr = columns[amountCol] || '';

            if (!dateStr || !amountStr) {
                result.warnings.push(`Linha ${i + 1}: Dados incompletos, pulando.`);
                continue;
            }

            try {
                const date = parseDate(dateStr, bankProfile.dateFormat);
                const amount = parseAmount(amountStr, bankProfile.decimalSeparator, bankProfile.thousandsSeparator);
                const type = determineType(amount, description);

                result.transactions.push({
                    date,
                    description: description || 'Transação sem descrição',
                    amount: Math.abs(amount),
                    type,
                    currency: bankProfile.currency,
                    originalLine: line,
                });
            } catch (err) {
                result.warnings.push(`Linha ${i + 1}: Erro ao processar - ${err}`);
            }
        }

        // Calculate period
        if (result.transactions.length > 0) {
            const dates = result.transactions.map(t => t.date.getTime());
            result.period = {
                start: new Date(Math.min(...dates)),
                end: new Date(Math.max(...dates)),
            };
        }

    } catch (error) {
        result.errors.push(`Erro ao processar CSV: ${error}`);
    }

    return result;
};

// ============================================================================
// OFX PARSER
// ============================================================================

export const parseOFX = async (file: File): Promise<ParseResult> => {
    const result: ParseResult = {
        transactions: [],
        errors: [],
        warnings: [],
    };

    try {
        const content = await file.text();

        // Extract bank info
        const bankMatch = content.match(/<ORG>([^<]+)/);
        if (bankMatch) {
            result.bankName = bankMatch[1].trim();
        }

        // Extract currency
        const currencyMatch = content.match(/<CURDEF>([^<]+)/);
        result.currency = currencyMatch ? currencyMatch[1].trim() : 'USD';

        // Determine locale settings based on currency
        const currencyConfig = CURRENCY_CONFIG[result.currency] || CURRENCY_CONFIG.USD;

        // Find all transactions using regex (OFX can have inconsistent formatting)
        const transactionPattern = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi;
        let match;

        while ((match = transactionPattern.exec(content)) !== null) {
            const txBlock = match[1];

            // Extract fields
            const typeMatch = txBlock.match(/<TRNTYPE>([^<\n]+)/);
            const dateMatch = txBlock.match(/<DTPOSTED>(\d{8})/);
            const amountMatch = txBlock.match(/<TRNAMT>([^<\n]+)/);
            const nameMatch = txBlock.match(/<NAME>([^<\n]+)/) || txBlock.match(/<MEMO>([^<\n]+)/);
            const refMatch = txBlock.match(/<FITID>([^<\n]+)/);

            if (!dateMatch || !amountMatch) {
                result.warnings.push('Transação OFX com dados incompletos encontrada.');
                continue;
            }

            const date = parseDate(dateMatch[1], 'YYYYMMDD');
            const amount = parseFloat(amountMatch[1].replace(',', '.')) || 0;
            const description = nameMatch ? nameMatch[1].trim() : 'Transação OFX';
            const bankReference = refMatch ? refMatch[1].trim() : undefined;

            const trnType = typeMatch ? typeMatch[1].toUpperCase() : '';
            let type: TransactionType = amount >= 0 ? 'income' : 'expense';

            // OFX type hints
            if (trnType === 'CREDIT' || trnType === 'DEP') {
                type = 'income';
            } else if (trnType === 'DEBIT' || trnType === 'PAYMENT' || trnType === 'CHECK') {
                type = 'expense';
            }

            result.transactions.push({
                date,
                description,
                amount: Math.abs(amount),
                type,
                currency: result.currency,
                bankReference,
            });
        }

        // Calculate period
        if (result.transactions.length > 0) {
            const dates = result.transactions.map(t => t.date.getTime());
            result.period = {
                start: new Date(Math.min(...dates)),
                end: new Date(Math.max(...dates)),
            };
        }

        // Try to get period from OFX headers
        const periodStartMatch = content.match(/<DTSTART>(\d{8})/);
        const periodEndMatch = content.match(/<DTEND>(\d{8})/);

        if (periodStartMatch && periodEndMatch) {
            result.period = {
                start: parseDate(periodStartMatch[1], 'YYYYMMDD'),
                end: parseDate(periodEndMatch[1], 'YYYYMMDD'),
            };
        }

    } catch (error) {
        result.errors.push(`Erro ao processar OFX: ${error}`);
    }

    return result;
};

// ============================================================================
// LOCAL PDF TEXT PARSER (Fallback when AI is unavailable)
// ============================================================================

/**
 * Parse transactions from raw text using regex patterns
 * This is a fallback when AI is not available
 */
const parseTransactionsFromText = (text: string): ParsedTransaction[] => {
    const transactions: ParsedTransaction[] = [];

    // Common patterns for Brazilian bank statements
    const patterns = [
        // Pattern: DD/MM/YYYY or DD/MM/YY - Description - Value
        /(\d{1,2}\/\d{1,2}\/\d{2,4})\s+(.{5,60}?)\s+(-?\s*R?\$?\s*[\d.,]+(?:,\d{2}))/gi,
        // Pattern: DD/MM - Description - Value
        /(\d{1,2}\/\d{1,2})\s+(.{5,60}?)\s+(-?\s*R?\$?\s*[\d.,]+(?:,\d{2}))/gi,
        // Pattern for values like "1.234,56"
        /(\d{1,2}[\/\-]\d{1,2}[\/\-]?\d{0,4})\s+([A-Za-zÀ-ÿ\s\*\-\.]+?)\s+(-?\s*\d{1,3}(?:\.\d{3})*,\d{2})/gi,
    ];

    for (const pattern of patterns) {
        let match;
        const regex = new RegExp(pattern.source, pattern.flags);

        while ((match = regex.exec(text)) !== null) {
            try {
                const dateStr = match[1].trim();
                const description = match[2].trim();
                let valueStr = match[3].trim();

                // Skip headers
                if (description.length < 3 ||
                    /^(data|date|valor|amount|descrição|description|saldo|balance)/i.test(description)) {
                    continue;
                }

                // Parse date
                let date: Date;
                const dateParts = dateStr.split(/[\/\-]/);
                if (dateParts.length >= 2) {
                    const day = parseInt(dateParts[0], 10);
                    const month = parseInt(dateParts[1], 10) - 1;
                    const year = dateParts[2]
                        ? (dateParts[2].length === 2 ? 2000 + parseInt(dateParts[2], 10) : parseInt(dateParts[2], 10))
                        : new Date().getFullYear();
                    date = new Date(year, month, day);
                    if (isNaN(date.getTime())) continue;
                } else {
                    continue;
                }

                // Parse value
                const isNegative = valueStr.includes('-') || valueStr.includes('(');
                valueStr = valueStr.replace(/[R$\s\-()]/g, '');
                valueStr = valueStr.replace(/\./g, '').replace(',', '.');
                const amount = parseFloat(valueStr);

                if (isNaN(amount) || amount === 0) continue;

                // Determine type
                const descLower = description.toLowerCase();
                const type: TransactionType = isNegative ? 'expense' :
                    (descLower.includes('pix recebido') ||
                        descLower.includes('ted recebida') ||
                        descLower.includes('salario') ||
                        descLower.includes('salário') ||
                        descLower.includes('deposito') ||
                        descLower.includes('depósito')) ? 'income' : 'expense';

                transactions.push({
                    date,
                    description: description.substring(0, 100),
                    amount: Math.abs(amount),
                    type,
                    confidence: 60,
                });
            } catch (e) {
                continue;
            }
        }
        if (transactions.length > 0) break;
    }

    // Remove duplicates
    return transactions.filter((tx, index, self) =>
        index === self.findIndex(t =>
            t.date.toDateString() === tx.date.toDateString() &&
            Math.abs(t.amount - tx.amount) < 0.01 &&
            t.description === tx.description
        )
    );
};

// ============================================================================
// PDF PARSER (Uses AI with local fallback)
// ============================================================================


export const parsePDF = async (file: File, extractWithAI: (text: string) => Promise<ParsedTransaction[]>): Promise<ParseResult> => {
    const result: ParseResult = {
        transactions: [],
        errors: [],
        warnings: [],
    };

    try {
        const arrayBuffer = await file.arrayBuffer();
        let text = '';

        try {
            // Use pdfjs-dist for browser-compatible PDF parsing
            const pdfjsLib = await import('pdfjs-dist');

            // Disable worker to avoid CORS/fetch issues - processes on main thread
            pdfjsLib.GlobalWorkerOptions.workerSrc = '';

            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
            const pdf = await loadingTask.promise;

            // Extract text from all pages
            const textParts: string[] = [];
            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                const page = await pdf.getPage(pageNum);
                const textContent = await page.getTextContent();
                const pageText = textContent.items
                    .map((item: any) => item.str)
                    .join(' ');
                textParts.push(pageText);
            }

            text = textParts.join('\n');
            console.log('PDF text extracted successfully:', text.substring(0, 200) + '...');

        } catch (pdfError) {
            // Fallback: try to decode as text (for some PDFs)
            console.warn('pdfjs-dist failed, trying text extraction:', pdfError);
            const decoder = new TextDecoder('utf-8', { fatal: false });
            const rawText = decoder.decode(arrayBuffer);

            // Extract readable text from PDF binary
            text = rawText
                .replace(/[^\x20-\x7E\n\r\t\u00C0-\u00FF]/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
        }

        if (!text || text.trim().length < 50) {
            result.errors.push('PDF não contém texto extraível. Pode ser uma imagem escaneada.');
            result.warnings.push('Dica: Use um PDF de texto, não uma imagem escaneada.');
            return result;
        }

        // Try to detect bank from content
        const bankProfile = detectBank(text);
        result.bankName = bankProfile.name !== 'Generic Bank' ? bankProfile.name : undefined;
        result.currency = bankProfile.currency;

        // First try AI extraction, with local fallback
        try {
            result.warnings.push('Usando IA para interpretar o conteúdo do PDF...');
            const aiTransactions = await extractWithAI(text);

            if (aiTransactions.length > 0) {
                result.transactions = aiTransactions;
                console.log('AI extraction successful:', aiTransactions.length, 'transactions');
            } else {
                throw new Error('AI returned no transactions');
            }
        } catch (aiError) {
            // AI failed - use local fallback parser
            console.warn('AI extraction failed, using local parser:', aiError);
            result.warnings.length = 0; // Clear the AI warning
            result.warnings.push('IA indisponível. Usando parser local (precisão reduzida).');

            const localTransactions = parseTransactionsFromText(text);

            if (localTransactions.length > 0) {
                result.transactions = localTransactions;
                result.warnings.push(`Parser local encontrou ${localTransactions.length} transações. Revise os dados.`);
            } else {
                result.errors.push('Não foi possível identificar transações no PDF.');
                result.warnings.push('O formato do extrato pode não ser suportado pelo parser local.');
            }
        }

        // Calculate period from extracted transactions
        if (result.transactions.length > 0) {
            const dates = result.transactions.map(t => t.date.getTime());
            result.period = {
                start: new Date(Math.min(...dates)),
                end: new Date(Math.max(...dates)),
            };
        }

    } catch (error) {
        result.errors.push(`Erro ao processar PDF: ${error}`);
    }

    return result;
};



// ============================================================================
// DUPLICATE DETECTION
// ============================================================================

export const detectDuplicates = (
    newTransactions: ParsedTransaction[],
    existingTransactions: Transaction[]
): ParsedTransaction[] => {
    return newTransactions.map(newTx => {
        const isDuplicate = existingTransactions.some(existing => {
            const sameDate = existing.date.toDateString() === newTx.date.toDateString();
            const sameAmount = Math.abs(existing.amount - newTx.amount) < 0.01;
            const similarDescription = existing.description.toLowerCase().includes(newTx.description.toLowerCase().substring(0, 10)) ||
                newTx.description.toLowerCase().includes(existing.description.toLowerCase().substring(0, 10));

            return sameDate && sameAmount && similarDescription;
        });

        return {
            ...newTx,
            confidence: isDuplicate ? 0 : (newTx.confidence || 100),
        };
    });
};
