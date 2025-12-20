


export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: Date;
  receiptUrl?: string;
  isPending?: boolean;
  cardId?: string;
  installmentCurrent?: number; // Ex: 1
  installmentTotal?: number;   // Ex: 12
}

export interface Investment {
  id: string;
  assetName: string;
  type: 'Ações' | 'Cripto' | 'Renda Fixa' | 'FIIs';
  amountInvested: number;
  currentValue: number;
  performance: number; // percentage
}

export interface GoalTransaction {
  id: string;
  date: Date;
  amount: number;
  note?: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: Date;
  icon: string; // emoji or icon name
  color: string;
  notes?: string;
  history: GoalTransaction[];
}

export interface CreditCard {
  id: string;
  name: string;
  last4Digits: string;
  limit: number;
  closingDay: number;
  dueDay: number;
  brand: 'mastercard' | 'visa' | 'amex';
  colorGradient: string;
}

export interface Bill {
  id: string;
  description: string;
  amount: number;
  dueDate: Date;
  isPaid: boolean;
  category: string;
  isRecurrent: boolean;
  recurrenceFrequency?: 'monthly' | 'yearly';
  attachmentUrl?: string; // Foto da fatura/boleto
}

export interface Loan {
  id: string;
  borrowerName: string; // Quem deve
  description: string;  // Motivo
  amount: number;
  dateLent: Date;
  dueDate?: Date;
  isPaid: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  progress: number; // 0 a 100
  xpReward: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  monthlySalary?: number;
  privacyMode?: boolean;
  plan: 'basic' | 'pro';
  level?: number;
  currentXp?: number;
  nextLevelXp?: number;
}

export enum AppRoutes {
  LOGIN = '/login',
  DASHBOARD = '/',
  TRANSACTIONS = '/transactions',
  INVESTMENTS = '/investments',
  MARKET = '/market',
  CARDS = '/cards',
  BILLS = '/bills',
  GOALS = '/goals',
  LOANS = '/loans',
  REPORTS = '/reports',
  SETTINGS = '/settings',
  PRICING = '/pricing',
  CHECKOUT_SUCCESS = '/success', // Rota simplificada
  NOTIFICATIONS = '/notifications',
  PROFILE = '/profile',
}
