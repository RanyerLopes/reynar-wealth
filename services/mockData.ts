
import { Transaction, Investment, CreditCard, Bill, Goal, Loan, User, Achievement } from '../types';
import { addDays, addMonths } from 'date-fns';

// IDs dos cartões para referência
const CARD_NUBANK_ID = '1';
const CARD_XP_ID = '2';

export const mockUser: User = {
    id: '1',
    name: 'Alex Silva',
    email: 'alex@finnova.app',
    monthlySalary: 8500,
    plan: 'basic', 
    privacyMode: false,
    level: 3,
    currentXp: 450,
    nextLevelXp: 1000
};

// Títulos baseados em nível
export const NOBILITY_TITLES = [
    { level: 1, title: 'Plebeu Econômico', icon: '🪵' },
    { level: 2, title: 'Aprendiz de Mercador', icon: '📜' },
    { level: 3, title: 'Cavaleiro das Contas', icon: '⚔️' },
    { level: 5, title: 'Barão da Poupança', icon: '🏰' },
    { level: 8, title: 'Duque dos Investimentos', icon: '💎' },
    { level: 10, title: 'Príncipe do Patrimônio', icon: '👑' },
    { level: 15, title: 'Rei da Prosperidade', icon: '🦁' },
    { level: 20, title: 'Imperador Financeiro', icon: '🌟' },
];

export const mockAchievements: Achievement[] = [
    {
        id: '1',
        title: 'Primeiros Passos',
        description: 'Registre sua primeira despesa no app.',
        icon: '🚀',
        isUnlocked: true,
        progress: 100,
        xpReward: 100
    },
    {
        id: '2',
        title: 'Poupador Iniciante',
        description: 'Guarde seus primeiros R$ 1.000 em Metas.',
        icon: '🐷',
        isUnlocked: true,
        progress: 100,
        xpReward: 300
    },
    {
        id: '3',
        title: 'Investidor',
        description: 'Crie seu primeiro ativo na carteira de investimentos.',
        icon: '📈',
        isUnlocked: true,
        progress: 100,
        xpReward: 500
    },
    {
        id: '4',
        title: 'Mestre das Contas',
        description: 'Pague 5 contas antes do vencimento.',
        icon: '⚡',
        isUnlocked: false,
        progress: 60, // 3/5
        xpReward: 800
    },
    {
        id: '5',
        title: 'Liberdade Financeira',
        description: 'Atingir R$ 50k de patrimônio total.',
        icon: '🦅',
        isUnlocked: false,
        progress: 25,
        xpReward: 5000
    },
    {
        id: '6',
        title: 'Zero Dívidas',
        description: 'Pague todas as faturas de cartão do mês.',
        icon: '🛡️',
        isUnlocked: false,
        progress: 0,
        xpReward: 1000
    },
    {
        id: '7',
        title: 'Sniper de Despesas',
        description: 'Categorize 10 transações corretamente.',
        icon: '🎯',
        isUnlocked: true,
        progress: 100,
        xpReward: 200
    },
    {
        id: '8',
        title: 'Magnata',
        description: 'Registre uma entrada única acima de R$ 10.000.',
        icon: '💼',
        isUnlocked: false,
        progress: 0,
        xpReward: 2000
    }
];

export const mockCards: CreditCard[] = [
  {
    id: CARD_NUBANK_ID,
    name: 'Nubank Platinum',
    last4Digits: '4829',
    limit: 4000, 
    closingDay: 5,
    dueDay: 12,
    brand: 'mastercard',
    colorGradient: 'from-purple-800 to-purple-600'
  },
  {
    id: CARD_XP_ID,
    name: 'XP Visa Infinite',
    last4Digits: '9921',
    limit: 25000,
    closingDay: 10,
    dueDay: 18,
    brand: 'visa',
    colorGradient: 'from-zinc-800 to-black'
  }
];

export const mockTransactions: Transaction[] = [
  {
    id: '1',
    description: 'Salário TechCorp',
    amount: 8500.00,
    type: 'income',
    category: 'Salário',
    date: new Date(new Date().setDate(new Date().getDate() - 2)),
  },
  {
    id: '2',
    description: 'Supermercado Extra',
    amount: 450.50,
    type: 'expense',
    category: 'Alimentação',
    date: new Date(new Date().setDate(new Date().getDate() - 1)),
    cardId: CARD_NUBANK_ID 
  },
  {
    id: '3',
    description: 'Uber Viagem',
    amount: 24.90,
    type: 'expense',
    category: 'Transporte',
    date: new Date(),
    cardId: CARD_NUBANK_ID
  },
  {
    id: '4',
    description: 'Netflix Premium',
    amount: 55.90,
    type: 'expense',
    category: 'Assinatura',
    date: new Date(new Date().setDate(new Date().getDate() - 5)),
    cardId: CARD_NUBANK_ID
  },
  {
    id: '5',
    description: 'Projeto Freelance',
    amount: 1200.00,
    type: 'income',
    category: 'Extra',
    date: new Date(new Date().setDate(new Date().getDate() - 8)),
  },
  {
    id: '6',
    description: 'Aluguel',
    amount: 2200.00,
    type: 'expense',
    category: 'Moradia',
    date: new Date(new Date().setDate(new Date().getDate() - 15)),
  },
  {
    id: '7',
    description: 'Jantar Outback',
    amount: 320.00,
    type: 'expense',
    category: 'Lazer',
    date: new Date(new Date().setDate(new Date().getDate() - 3)),
    cardId: CARD_XP_ID
  }
];

export const mockInvestments: Investment[] = [
  { id: '1', assetName: 'AAPL34', type: 'Ações', amountInvested: 1500, currentValue: 1750, performance: 16.6 },
  { id: '2', assetName: 'BTC', type: 'Cripto', amountInvested: 2000, currentValue: 2400, performance: 20.0 },
  { id: '3', assetName: 'Tesouro Selic', type: 'Renda Fixa', amountInvested: 5000, currentValue: 5100, performance: 2.0 },
  { id: '4', assetName: 'HGLG11', type: 'FIIs', amountInvested: 3000, currentValue: 3150, performance: 5.0 },
];

export const mockBills: Bill[] = [
  {
    id: '1',
    description: 'Conta de Luz',
    amount: 189.90,
    dueDate: addDays(new Date(), -2), 
    isPaid: false,
    category: 'Moradia',
    isRecurrent: true,
    recurrenceFrequency: 'monthly'
  },
  {
    id: '2',
    description: 'Internet Fibra',
    amount: 99.90,
    dueDate: new Date(), 
    isPaid: false,
    category: 'Moradia',
    isRecurrent: true,
    recurrenceFrequency: 'monthly'
  },
  {
    id: '3',
    description: 'Faculdade',
    amount: 850.00,
    dueDate: addDays(new Date(), 5), 
    isPaid: false,
    category: 'Educação',
    isRecurrent: true,
    recurrenceFrequency: 'monthly'
  },
  {
    id: '4',
    description: 'Seguro do Carro',
    amount: 2400.00,
    dueDate: addDays(new Date(), 15),
    isPaid: false,
    category: 'Transporte',
    isRecurrent: false
  },
  {
    id: '5',
    description: 'Academia SmartFit',
    amount: 119.90,
    dueDate: addDays(new Date(), -10),
    isPaid: true,
    category: 'Saúde',
    isRecurrent: true,
    recurrenceFrequency: 'monthly'
  }
];

export const mockGoals: Goal[] = [
  {
    id: '1',
    name: 'Reserva de Emergência',
    targetAmount: 15000,
    currentAmount: 8500,
    deadline: addMonths(new Date(), 6),
    icon: '🛡️',
    color: 'bg-emerald-500',
    notes: 'Manter em CDB de liquidez diária. Idealmente atingir 6 meses de custo de vida.',
    history: [
        { id: 'h1', date: addMonths(new Date(), -2), amount: 5000, note: 'Aporte Inicial' },
        { id: 'h2', date: addMonths(new Date(), -1), amount: 3500, note: 'Parte do 13º Salário' }
    ]
  },
  {
    id: '2',
    name: 'Viagem Disney',
    targetAmount: 25000,
    currentAmount: 4200,
    deadline: addMonths(new Date(), 12),
    icon: '✈️',
    color: 'bg-blue-500',
    notes: 'Comprar passagens com 6 meses de antecedência. Verificar visto.',
    history: [
        { id: 'h3', date: addMonths(new Date(), -3), amount: 2000, note: 'Entrada' },
        { id: 'h4', date: new Date(), amount: 2200, note: 'Economia do mês' }
    ]
  },
  {
    id: '3',
    name: 'Macbook Pro',
    targetAmount: 12000,
    currentAmount: 11500,
    deadline: addMonths(new Date(), 1),
    icon: '💻',
    color: 'bg-purple-500',
    notes: 'Esperar Black Friday para comprar.',
    history: [
        { id: 'h5', date: addMonths(new Date(), -5), amount: 11500, note: 'Venda do notebook antigo + economias' }
    ]
  }
];

export const mockLoans: Loan[] = [
  {
    id: '1',
    borrowerName: 'Bruno Souza',
    description: 'Empréstimo Racha Churrasco',
    amount: 150.00,
    dateLent: addDays(new Date(), -5),
    isPaid: false
  },
  {
    id: '2',
    borrowerName: 'Carla Dias',
    description: 'Ingresso Show Coldplay',
    amount: 480.00,
    dateLent: addDays(new Date(), -20),
    dueDate: addDays(new Date(), 2),
    isPaid: false
  },
  {
    id: '3',
    borrowerName: 'Mãe',
    description: 'Ajuda com a reforma',
    amount: 1200.00,
    dateLent: addDays(new Date(), -45),
    isPaid: true
  }
];

export const mockChartData = [
  { name: 'Jan', income: 4000, expense: 2400 },
  { name: 'Fev', income: 3000, expense: 1398 },
  { name: 'Mar', income: 2000, expense: 9800 },
  { name: 'Abr', income: 2780, expense: 3908 },
  { name: 'Mai', income: 1890, expense: 4800 },
  { name: 'Jun', income: 2390, expense: 3800 },
];
