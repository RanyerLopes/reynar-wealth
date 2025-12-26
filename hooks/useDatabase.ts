import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import * as db from '../services/databaseService';
import { Transaction, Bill, Investment, Goal, Loan, CreditCard } from '../types';

// Hook for managing transactions
export const useTransactions = () => {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTransactions = useCallback(async () => {
        if (!user) {
            setTransactions([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const data = await db.getTransactions(user.id);
            setTransactions(data);
        } catch (err) {
            console.error('Error fetching transactions:', err);
            setError('Erro ao carregar transações');
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
        if (!user) {
            const newTx = { ...transaction, id: Math.random().toString() };
            setTransactions(prev => [newTx, ...prev]);
            return newTx;
        }

        try {
            const newTx = await db.addTransaction(user.id, transaction);
            setTransactions(prev => [newTx, ...prev]);
            return newTx;
        } catch (err) {
            console.error('Error adding transaction:', err);
            throw err;
        }
    };

    const removeTransaction = async (id: string) => {
        try {
            if (user) {
                await db.deleteTransaction(id);
            }
            setTransactions(prev => prev.filter(t => t.id !== id));
        } catch (err) {
            console.error('Error deleting transaction:', err);
            throw err;
        }
    };

    const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
        try {
            if (user) {
                const updated = await db.updateTransaction(id, updates);
                setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updated } : t));
                return updated;
            } else {
                setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
                return { id, ...updates };
            }
        } catch (err) {
            console.error('Error updating transaction:', err);
            throw err;
        }
    };

    return { transactions, loading, error, addTransaction, removeTransaction, updateTransaction, refetch: fetchTransactions };
};

// Hook for managing bills
export const useBills = () => {
    const { user } = useAuth();
    const [bills, setBills] = useState<Bill[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchBills = useCallback(async () => {
        if (!user) {
            setBills([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const data = await db.getBills(user.id);
            setBills(data);
        } catch (err) {
            console.error('Error fetching bills:', err);
            setBills([]);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchBills();
    }, [fetchBills]);

    const addBill = async (bill: Omit<Bill, 'id'>) => {
        if (!user) {
            const newBill = { ...bill, id: Math.random().toString() };
            setBills(prev => [...prev, newBill]);
            return newBill;
        }

        try {
            const newBill = await db.addBill(user.id, bill);
            setBills(prev => [...prev, newBill]);
            return newBill;
        } catch (err) {
            console.error('Error adding bill:', err);
            throw err;
        }
    };

    const toggleBillPaid = async (id: string) => {
        const bill = bills.find(b => b.id === id);
        if (!bill) return;

        const newIsPaid = !bill.isPaid;

        try {
            if (user) {
                await db.updateBill(id, { isPaid: newIsPaid });
            }
            setBills(prev => prev.map(b => b.id === id ? { ...b, isPaid: newIsPaid } : b));
        } catch (err) {
            console.error('Error updating bill:', err);
            throw err;
        }
    };

    return { bills, loading, addBill, toggleBillPaid, refetch: fetchBills };
};

// Hook for managing investments
export const useInvestments = () => {
    const { user } = useAuth();
    const [investments, setInvestments] = useState<Investment[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchInvestments = useCallback(async () => {
        if (!user) {
            setInvestments([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const data = await db.getInvestments(user.id);
            setInvestments(data);
        } catch (err) {
            console.error('Error fetching investments:', err);
            setInvestments([]);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchInvestments();
    }, [fetchInvestments]);

    const addInvestment = async (investment: Omit<Investment, 'id'>) => {
        if (!user) {
            const newInv = { ...investment, id: Math.random().toString() };
            setInvestments(prev => [...prev, newInv]);
            return newInv;
        }

        try {
            const newInv = await db.addInvestment(user.id, investment);
            setInvestments(prev => [...prev, newInv]);
            return newInv;
        } catch (err) {
            console.error('Error adding investment:', err);
            throw err;
        }
    };

    const updateInvestmentValues = async (updates: { id: string; currentValue: number; performance: number }[]) => {
        try {
            for (const update of updates) {
                if (user) {
                    await db.updateInvestment(update.id, { currentValue: update.currentValue, performance: update.performance });
                }
            }
            setInvestments(prev => prev.map(inv => {
                const update = updates.find(u => u.id === inv.id);
                return update ? { ...inv, currentValue: update.currentValue, performance: update.performance } : inv;
            }));
        } catch (err) {
            console.error('Error updating investments:', err);
            throw err;
        }
    };

    const editInvestment = async (id: string, updates: Partial<Investment>) => {
        try {
            if (user) {
                await db.updateInvestment(id, updates);
            }
            setInvestments(prev => prev.map(inv =>
                inv.id === id ? { ...inv, ...updates } : inv
            ));
        } catch (err) {
            console.error('Error editing investment:', err);
            throw err;
        }
    };

    const removeInvestment = async (id: string) => {
        try {
            if (user) {
                await db.deleteInvestment(id, user.id);
            }
            setInvestments(prev => prev.filter(i => i.id !== id));
        } catch (err) {
            console.error('Error deleting investment:', err);
            throw err;
        }
    };

    return { investments, loading, addInvestment, removeInvestment, editInvestment, updateInvestmentValues, refetch: fetchInvestments };
};

// Hook for managing goals
export const useGoals = () => {
    const { user } = useAuth();
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchGoals = useCallback(async () => {
        if (!user) {
            setGoals([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const data = await db.getGoals(user.id);
            setGoals(data);
        } catch (err) {
            console.error('Error fetching goals:', err);
            setGoals([]);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchGoals();
    }, [fetchGoals]);

    const addGoal = async (goal: Omit<Goal, 'id'>) => {
        if (!user) {
            const newGoal = { ...goal, id: Math.random().toString() };
            setGoals(prev => [...prev, newGoal]);
            return newGoal;
        }

        try {
            const newGoal = await db.addGoal(user.id, goal);
            setGoals(prev => [...prev, newGoal]);
            return newGoal;
        } catch (err) {
            console.error('Error adding goal:', err);
            throw err;
        }
    };

    const updateGoal = async (id: string, updates: Partial<Goal>) => {
        try {
            if (user) {
                await db.updateGoal(id, updates);
            }
            setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
        } catch (err) {
            console.error('Error updating goal:', err);
            throw err;
        }
    };

    return { goals, loading, addGoal, updateGoal, refetch: fetchGoals };
};

// Hook for managing credit cards
export const useCards = () => {
    const { user } = useAuth();
    const [cards, setCards] = useState<CreditCard[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCards = useCallback(async () => {
        if (!user) {
            setCards([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const data = await db.getCards(user.id);
            setCards(data);
        } catch (err) {
            console.error('Error fetching cards:', err);
            setCards([]);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchCards();
    }, [fetchCards]);

    const addCard = async (card: Omit<CreditCard, 'id'>) => {
        if (!user) {
            const newCard = { ...card, id: Math.random().toString() };
            setCards(prev => [...prev, newCard]);
            return newCard;
        }

        try {
            const newCard = await db.addCard(user.id, card);
            setCards(prev => [...prev, newCard]);
            return newCard;
        } catch (err) {
            console.error('Error adding card:', err);
            throw err;
        }
    };

    const removeCard = async (id: string) => {
        try {
            if (user) {
                await db.deleteCard(id);
            }
            setCards(prev => prev.filter(c => c.id !== id));
        } catch (err) {
            console.error('Error deleting card:', err);
            throw err;
        }
    };

    return { cards, loading, addCard, removeCard, refetch: fetchCards };
};

// Hook for managing loans
export const useLoans = () => {
    const { user } = useAuth();
    const [loans, setLoans] = useState<Loan[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchLoans = useCallback(async () => {
        if (!user) {
            setLoans([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const data = await db.getLoans(user.id);
            setLoans(data);
        } catch (err) {
            console.error('Error fetching loans:', err);
            setLoans([]);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchLoans();
    }, [fetchLoans]);

    const addLoan = async (loan: Omit<Loan, 'id'>) => {
        if (!user) {
            const newLoan = { ...loan, id: Math.random().toString() };
            setLoans(prev => [...prev, newLoan]);
            return newLoan;
        }

        try {
            const newLoan = await db.addLoan(user.id, loan);
            setLoans(prev => [...prev, newLoan]);
            return newLoan;
        } catch (err) {
            console.error('Error adding loan:', err);
            throw err;
        }
    };

    const toggleLoanPaid = async (id: string) => {
        const loan = loans.find(l => l.id === id);
        if (!loan) return;

        const newIsPaid = !loan.isPaid;

        try {
            if (user) {
                await db.updateLoan(id, { isPaid: newIsPaid });
            }
            setLoans(prev => prev.map(l => l.id === id ? { ...l, isPaid: newIsPaid } : l));
        } catch (err) {
            console.error('Error updating loan:', err);
            throw err;
        }
    };

    return { loans, loading, addLoan, toggleLoanPaid, refetch: fetchLoans };
};
