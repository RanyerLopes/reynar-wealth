import { GoogleGenerativeAI } from '@google/generative-ai';
import { Transaction, Bill, Investment, Goal } from '../types';
import { ParsedTransaction } from './statementParserService';

// Use environment variable for API key (Vite uses import.meta.env)
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyDGSc0QuUQ4SYFb9DkDgB8RZNFgUiKJCmg';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Financial context interface
export interface FinancialContext {
    income: number;
    totalExpenses: number;
    expensesByCategory: Record<string, number>;
    transactions: Transaction[];
    pendingBills: Bill[];
    upcomingBills: Bill[];
    investments: Investment[];
    goals: Goal[];
    savingsRate: number;
}

// System prompt for the AI Consultant
const SYSTEM_PROMPT = `Você é o Conselheiro Real Reynar, um sábio assessor financeiro que fala de forma temática medieval/realeza.

REGRAS:
1. Sempre responda em português brasileiro
2. Use linguagem temática de realeza (ex: "Vossa Majestade", "reino", "tesouro", "cofres", etc)
3. Seja breve: máximo 2 frases
4. Baseie-se APENAS nos dados financeiros fornecidos
5. Identifique: instabilidades, padrões, alertas, oportunidades de economia
6. Use emojis relacionados ao tema (🏰👑💰⚔️🛡️📜💎🐉)

EXEMPLOS DE RESPOSTAS:
- "Vossa Majestade, os gastos com banquetes (Alimentação) consumiram 40% do tesouro! Sugiro reduzir R$ 200 este mês. 🍗"
- "Alerta Real! A conta de energia vence em 2 dias e o cofre está preparado. Ordenei aos guardas o pagamento! ⚡"
- "Esplêndido! Sua taxa de poupança de 25% é digna de um verdadeiro imperador. Continue assim, Majestade! 👑"`;

// Build context string from financial data
const buildContextString = (context: FinancialContext): string => {
    const categoryBreakdown = Object.entries(context.expensesByCategory)
        .map(([cat, val]) => `${cat}: R$ ${val.toFixed(2)}`)
        .join(', ');

    const pendingBillsInfo = context.pendingBills
        .slice(0, 5)
        .map(b => `${b.description} (R$ ${b.amount}, vence: ${new Date(b.dueDate).toLocaleDateString('pt-BR')})`)
        .join('; ');

    const goalsInfo = context.goals
        .map(g => `${g.name}: ${((g.currentAmount / g.targetAmount) * 100).toFixed(0)}% completo`)
        .join('; ');

    const investmentsTotal = context.investments.reduce((acc, i) => acc + i.currentValue, 0);
    const investmentsPerformance = context.investments.length > 0
        ? context.investments.reduce((acc, i) => acc + i.performance, 0) / context.investments.length
        : 0;

    return `
DADOS FINANCEIROS DO USUÁRIO:
- Renda mensal: R$ ${context.income.toFixed(2)}
- Gastos totais do mês: R$ ${context.totalExpenses.toFixed(2)}
- Taxa de poupança: ${context.savingsRate.toFixed(1)}%
- Gastos por categoria: ${categoryBreakdown || 'Nenhum registrado'}
- Contas pendentes: ${pendingBillsInfo || 'Nenhuma'}
- Metas: ${goalsInfo || 'Nenhuma meta definida'}
- Total investido: R$ ${investmentsTotal.toFixed(2)}
- Performance média: ${investmentsPerformance.toFixed(1)}%
  `.trim();
};

// Get AI-generated financial advice
export const getFinancialAdvice = async (
    context: FinancialContext,
    specificContext?: 'general' | 'transactions' | 'bills' | 'investments' | 'goals'
): Promise<string> => {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        let focusInstruction = '';
        switch (specificContext) {
            case 'transactions':
                focusInstruction = '\nFOCO: Analise os padrões de gastos e transações recentes.';
                break;
            case 'bills':
                focusInstruction = '\nFOCO: Analise as contas pendentes e vencimentos próximos.';
                break;
            case 'investments':
                focusInstruction = '\nFOCO: Analise a carteira de investimentos e sua performance.';
                break;
            case 'goals':
                focusInstruction = '\nFOCO: Analise o progresso das metas financeiras.';
                break;
            default:
                focusInstruction = '\nFOCO: Dê uma visão geral da saúde financeira.';
        }

        const prompt = `${SYSTEM_PROMPT}${focusInstruction}

${buildContextString(context)}

Dê um conselho financeiro breve e temático:`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up response (remove extra quotes if present)
        return text.replace(/^["']|["']$/g, '').trim();
    } catch (error) {
        console.error('Gemini API error:', error);
        // Return fallback message
        return 'Vossa Majestade, os astros estão nebulosos hoje. Este conselheiro precisa de um momento para meditar. 🔮';
    }
};

// Quick health check for the API
export const testGeminiConnection = async (): Promise<boolean> => {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
        const result = await model.generateContent('Diga apenas: OK');
        return !!result.response.text();
    } catch (error) {
        console.error('Gemini connection test failed:', error);
        return false;
    }
};

// ============================================================================
// TRANSACTION CATEGORIZATION
// ============================================================================

const CATEGORIZATION_PROMPT = `Você é um especialista em finanças pessoais. Categorize cada transação bancária abaixo em UMA das categorias:

CATEGORIAS DISPONÍVEIS:
- Alimentação (restaurantes, supermercados, delivery, cafés)
- Transporte (combustível, uber, transporte público, estacionamento)
- Moradia (aluguel, condomínio, IPTU, manutenção)
- Saúde (farmácia, consultas, plano de saúde, academia)
- Lazer (streaming, jogos, viagens, entretenimento)
- Educação (cursos, livros, mensalidades)
- Vestuário (roupas, calçados, acessórios)
- Transferência (PIX, TED, DOC entre contas)
- Salário (pagamentos recebidos, rendimentos)
- Investimentos (aportes, aplicações)
- Contas (luz, água, internet, telefone, gás)
- Compras (e-commerce, lojas, marketplace)
- Serviços (assinaturas, serviços gerais)
- Outros (quando não se encaixar em nenhuma acima)

REGRAS:
1. Responda APENAS com um array JSON válido
2. Cada item deve ter: description, suggestedCategory, confidence (0-100)
3. Seja preciso: "UBER *TRIP" = Transporte, "IFOOD" = Alimentação
4. Não adicione explicações, apenas o JSON

TRANSAÇÕES PARA CATEGORIZAR:
`;

export const categorizeTransactionsWithAI = async (
    transactions: { description: string; amount: number }[]
): Promise<{ description: string; category: string; confidence: number }[]> => {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        const transactionList = transactions
            .map((t, i) => `${i + 1}. "${t.description}" - R$ ${t.amount.toFixed(2)}`)
            .join('\n');

        const prompt = CATEGORIZATION_PROMPT + transactionList + '\n\nJSON:';

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text().trim();

        // Clean markdown code blocks if present
        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        const parsed = JSON.parse(text);

        return parsed.map((item: any) => ({
            description: item.description || '',
            category: item.suggestedCategory || item.category || 'Outros',
            confidence: item.confidence || 70,
        }));
    } catch (error) {
        console.error('Categorization error:', error);
        // Return default categories
        return transactions.map(t => ({
            description: t.description,
            category: 'Outros',
            confidence: 0,
        }));
    }
};

// ============================================================================
// PDF TEXT EXTRACTION (OCR via AI)
// ============================================================================

const PDF_EXTRACTION_PROMPT = `Você é um especialista em extrair dados de extratos bancários. 
Analise o texto abaixo (extraído de um PDF de extrato bancário) e identifique TODAS as transações.

REGRAS:
1. Extraia: data, descrição e valor de cada transação
2. Valores negativos ou com sinal de menos = despesa (expense)
3. Valores positivos ou créditos = receita (income)
4. Use formato de data: YYYY-MM-DD
5. Retorne APENAS um array JSON válido, sem explicações
6. Se não conseguir identificar transações, retorne []

FORMATO DE RESPOSTA:
[
  {"date": "2024-01-15", "description": "COMPRA SUPERMERCADO", "amount": -150.00, "type": "expense"},
  {"date": "2024-01-16", "description": "PIX RECEBIDO", "amount": 500.00, "type": "income"}
]

TEXTO DO EXTRATO:
`;

export const extractTransactionsFromPDFText = async (pdfText: string): Promise<ParsedTransaction[]> => {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        // Limit text to avoid token limits
        const truncatedText = pdfText.substring(0, 15000);

        const prompt = PDF_EXTRACTION_PROMPT + truncatedText + '\n\nJSON:';

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text().trim();

        // Clean markdown code blocks if present
        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        const parsed = JSON.parse(text);

        return parsed.map((item: any) => ({
            date: new Date(item.date),
            description: item.description || 'Transação',
            amount: Math.abs(parseFloat(item.amount) || 0),
            type: item.type === 'income' ? 'income' : 'expense',
            confidence: 75, // AI extraction has medium confidence
        }));
    } catch (error) {
        console.error('PDF extraction error:', error);
        return [];
    }
};

// ============================================================================
// RECEIPT OCR (Vision API)
// ============================================================================

export interface ReceiptData {
    establishment: string;
    amount: number;
    category: string;
    date?: Date;
    items?: { name: string; price: number }[];
    paymentMethod?: string;
    confidence: number;
}

const RECEIPT_OCR_PROMPT = `Você é um especialista em ler cupons fiscais e recibos brasileiros.
Analise a imagem do cupom/recibo e extraia as informações financeiras.

REGRAS:
1. Identifique o nome do estabelecimento (loja, restaurante, mercado, etc.)
2. Encontre o valor TOTAL da compra
3. Sugira uma categoria baseada no tipo de estabelecimento:
   - Supermercado/Mercado = "Alimentação"
   - Restaurante/Fast Food/Lanchonete = "Alimentação"
   - Posto de Combustível = "Transporte"
   - Farmácia/Drogaria = "Saúde"
   - Loja de Roupas = "Vestuário"
   - Cinema/Teatro/Parque = "Lazer"
   - Livraria/Papelaria = "Educação"
   - Outros = "Compras"
4. Extraia a data se visível (formato brasileiro DD/MM/YYYY)
5. Opcionalmente, liste os principais itens comprados
6. Identifique o método de pagamento se visível (PIX, Débito, Crédito, Dinheiro)

RESPONDA APENAS com um JSON válido neste formato:
{
  "establishment": "Nome do Estabelecimento",
  "amount": 123.45,
  "category": "Alimentação",
  "date": "2024-12-14",
  "items": [{"name": "Item 1", "price": 10.00}],
  "paymentMethod": "Crédito",
  "confidence": 85
}

Se não conseguir ler algo, use valores razoáveis e reduza o confidence.
Se a imagem não for um cupom/recibo, retorne: {"error": "Imagem não é um cupom fiscal"}
`;

export const extractReceiptData = async (imageBase64: string): Promise<ReceiptData | null> => {
    try {
        // Use gemini-1.5-flash with vision capabilities
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        // Remove data URL prefix if present
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

        // Determine mime type
        let mimeType = 'image/jpeg';
        if (imageBase64.includes('data:image/png')) {
            mimeType = 'image/png';
        } else if (imageBase64.includes('data:image/webp')) {
            mimeType = 'image/webp';
        }

        const result = await model.generateContent([
            RECEIPT_OCR_PROMPT,
            {
                inlineData: {
                    data: base64Data,
                    mimeType: mimeType,
                },
            },
        ]);

        const response = await result.response;
        let text = response.text().trim();

        // Clean markdown code blocks if present
        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        const parsed = JSON.parse(text);

        // Check for error response
        if (parsed.error) {
            console.warn('Receipt OCR error:', parsed.error);
            return null;
        }

        return {
            establishment: parsed.establishment || 'Estabelecimento',
            amount: parseFloat(parsed.amount) || 0,
            category: parsed.category || 'Outros',
            date: parsed.date ? new Date(parsed.date) : undefined,
            items: parsed.items || [],
            paymentMethod: parsed.paymentMethod,
            confidence: parsed.confidence || 70,
        };
    } catch (error) {
        console.error('Receipt OCR error:', error);
        return null;
    }
};

// ============================================================================
// QUICK CATEGORIZE SINGLE TRANSACTION
// ============================================================================

export const categorizeTransaction = async (description: string, amount: number): Promise<string> => {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        const prompt = `Categorize esta transação em UMA palavra (categoria):
"${description}" - R$ ${amount.toFixed(2)}

Categorias: Alimentação, Transporte, Moradia, Saúde, Lazer, Educação, Vestuário, Transferência, Salário, Investimentos, Contas, Compras, Serviços, Outros

Responda APENAS com a categoria, sem explicação.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const category = response.text().trim();

        // Validate it's a valid category
        const validCategories = ['Alimentação', 'Transporte', 'Moradia', 'Saúde', 'Lazer', 'Educação', 'Vestuário', 'Transferência', 'Salário', 'Investimentos', 'Contas', 'Compras', 'Serviços', 'Outros'];

        return validCategories.includes(category) ? category : 'Outros';
    } catch (error) {
        console.error('Single categorization error:', error);
        return 'Outros';
    }
};
