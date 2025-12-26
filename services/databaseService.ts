import { supabase } from './supabase';
import { Transaction, Bill, Investment, Goal, Loan, CreditCard } from '../types';

// ==================== TRANSACTIONS ====================
export const getTransactions = async (userId: string): Promise<Transaction[]> => {
    const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

    if (error) throw error;
    return data?.map(t => ({ ...t, date: new Date(t.date) })) || [];
};

export const addTransaction = async (userId: string, transaction: Omit<Transaction, 'id'>) => {
    const { data, error } = await supabase
        .from('transactions')
        .insert([{ ...transaction, user_id: userId }])
        .select()
        .single();

    if (error) throw error;
    return { ...data, date: new Date(data.date) };
};

export const deleteTransaction = async (id: string) => {
    const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

    if (error) throw error;
};

export const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    const dbUpdates: any = {};
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.type !== undefined) dbUpdates.type = updates.type;
    if (updates.date !== undefined) dbUpdates.date = updates.date;

    const { data, error } = await supabase
        .from('transactions')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return { ...data, date: new Date(data.date) };
};

// ==================== BILLS ====================
export const getBills = async (userId: string): Promise<Bill[]> => {
    const { data, error } = await supabase
        .from('bills')
        .select('*')
        .eq('user_id', userId)
        .order('due_date', { ascending: true });

    if (error) throw error;
    return data?.map(b => ({
        ...b,
        dueDate: new Date(b.due_date),
        isPaid: b.is_paid,
        isRecurrent: b.is_recurrent,
        recurrenceFrequency: b.recurrence_frequency,
        attachmentUrl: b.attachment_url
    })) || [];
};

export const addBill = async (userId: string, bill: Omit<Bill, 'id'>) => {
    const { data, error } = await supabase
        .from('bills')
        .insert([{
            user_id: userId,
            description: bill.description,
            amount: bill.amount,
            due_date: bill.dueDate,
            is_paid: bill.isPaid,
            category: bill.category,
            is_recurrent: bill.isRecurrent,
            recurrence_frequency: bill.recurrenceFrequency,
            attachment_url: bill.attachmentUrl
        }])
        .select()
        .single();

    if (error) throw error;
    return { ...data, dueDate: new Date(data.due_date), isPaid: data.is_paid, isRecurrent: data.is_recurrent };
};

export const updateBill = async (id: string, updates: Partial<Bill>) => {
    const dbUpdates: any = {};
    if (updates.isPaid !== undefined) dbUpdates.is_paid = updates.isPaid;
    if (updates.description) dbUpdates.description = updates.description;
    if (updates.amount) dbUpdates.amount = updates.amount;
    if (updates.dueDate) dbUpdates.due_date = updates.dueDate;
    if (updates.attachmentUrl) dbUpdates.attachment_url = updates.attachmentUrl;

    const { error } = await supabase
        .from('bills')
        .update(dbUpdates)
        .eq('id', id);

    if (error) throw error;
};

// ==================== INVESTMENTS ====================
export const getInvestments = async (userId: string): Promise<Investment[]> => {
    const { data, error } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', userId);

    if (error) throw error;
    return data?.map(i => ({
        id: i.id,
        assetName: i.asset_name,
        type: i.type,
        quantity: i.quantity,
        purchasePrice: i.purchase_price,
        amountInvested: i.amount_invested,
        currentValue: i.current_value,
        performance: i.performance
    })) || [];
};

export const addInvestment = async (userId: string, investment: Omit<Investment, 'id'>) => {
    const { data, error } = await supabase
        .from('investments')
        .insert([{
            user_id: userId,
            asset_name: investment.assetName,
            type: investment.type,
            quantity: investment.quantity,
            purchase_price: investment.purchasePrice,
            amount_invested: investment.amountInvested,
            current_value: investment.currentValue,
            performance: investment.performance
        }])
        .select()
        .single();

    if (error) throw error;
    return {
        ...data,
        assetName: data.asset_name,
        quantity: data.quantity,
        purchasePrice: data.purchase_price,
        amountInvested: data.amount_invested,
        currentValue: data.current_value
    };
};

export const updateInvestment = async (id: string, updates: Partial<Investment>) => {
    const dbUpdates: any = {};
    if (updates.currentValue !== undefined) dbUpdates.current_value = updates.currentValue;
    if (updates.performance !== undefined) dbUpdates.performance = updates.performance;
    if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;
    if (updates.amountInvested !== undefined) dbUpdates.amount_invested = updates.amountInvested;
    if (updates.purchasePrice !== undefined) dbUpdates.purchase_price = updates.purchasePrice;

    const { error } = await supabase
        .from('investments')
        .update(dbUpdates)
        .eq('id', id);

    if (error) throw error;
};

export const deleteInvestment = async (id: string, userId: string) => {
    const { error } = await supabase
        .from('investments')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

    if (error) throw error;
};

// ==================== GOALS ====================
export const getGoals = async (userId: string): Promise<Goal[]> => {
    const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId);

    if (error) throw error;
    return data?.map(g => ({
        id: g.id,
        name: g.name,
        targetAmount: g.target_amount,
        currentAmount: g.current_amount,
        deadline: new Date(g.deadline),
        icon: g.icon,
        color: g.color,
        notes: g.notes,
        history: g.history || []
    })) || [];
};

export const addGoal = async (userId: string, goal: Omit<Goal, 'id'>) => {
    const { data, error } = await supabase
        .from('goals')
        .insert([{
            user_id: userId,
            name: goal.name,
            target_amount: goal.targetAmount,
            current_amount: goal.currentAmount,
            deadline: goal.deadline,
            icon: goal.icon,
            color: goal.color,
            notes: goal.notes,
            history: goal.history
        }])
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const updateGoal = async (id: string, updates: Partial<Goal>) => {
    const dbUpdates: any = {};
    if (updates.currentAmount !== undefined) dbUpdates.current_amount = updates.currentAmount;
    if (updates.history) dbUpdates.history = updates.history;
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.notes) dbUpdates.notes = updates.notes;

    const { error } = await supabase
        .from('goals')
        .update(dbUpdates)
        .eq('id', id);

    if (error) throw error;
};

// ==================== CREDIT CARDS ====================
export const getCards = async (userId: string): Promise<CreditCard[]> => {
    const { data, error } = await supabase
        .from('cards')
        .select('*')
        .eq('user_id', userId);

    if (error) throw error;
    return data?.map(c => ({
        id: c.id,
        name: c.name,
        last4Digits: c.last4_digits,
        limit: c.card_limit,
        closingDay: c.closing_day,
        dueDay: c.due_day,
        brand: c.brand,
        colorGradient: c.color_gradient
    })) || [];
};

export const addCard = async (userId: string, card: Omit<CreditCard, 'id'>) => {
    const { data, error } = await supabase
        .from('cards')
        .insert([{
            user_id: userId,
            name: card.name,
            last4_digits: card.last4Digits,
            card_limit: card.limit,
            closing_day: card.closingDay,
            due_day: card.dueDay,
            brand: card.brand,
            color_gradient: card.colorGradient
        }])
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const deleteCard = async (id: string) => {
    const { error } = await supabase
        .from('cards')
        .delete()
        .eq('id', id);

    if (error) throw error;
};

// ==================== LOANS ====================
export const getLoans = async (userId: string): Promise<Loan[]> => {
    const { data, error } = await supabase
        .from('loans')
        .select('*')
        .eq('user_id', userId);

    if (error) throw error;
    return data?.map(l => ({
        id: l.id,
        borrowerName: l.borrower_name,
        description: l.description,
        amount: l.amount,
        dateLent: new Date(l.date_lent),
        dueDate: l.due_date ? new Date(l.due_date) : undefined,
        isPaid: l.is_paid
    })) || [];
};

export const addLoan = async (userId: string, loan: Omit<Loan, 'id'>) => {
    const { data, error } = await supabase
        .from('loans')
        .insert([{
            user_id: userId,
            borrower_name: loan.borrowerName,
            description: loan.description,
            amount: loan.amount,
            date_lent: loan.dateLent,
            due_date: loan.dueDate,
            is_paid: loan.isPaid
        }])
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const updateLoan = async (id: string, updates: Partial<Loan>) => {
    const dbUpdates: any = {};
    if (updates.isPaid !== undefined) dbUpdates.is_paid = updates.isPaid;

    const { error } = await supabase
        .from('loans')
        .update(dbUpdates)
        .eq('id', id);

    if (error) throw error;
};

// ==================== USER PROFILE ====================
export const getUserProfile = async (userId: string) => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
    return data;
};

export const upsertUserProfile = async (userId: string, profile: any) => {
    const { data, error } = await supabase
        .from('profiles')
        .upsert({
            id: userId,
            ...profile,
            updated_at: new Date().toISOString()
        })
        .select()
        .single();

    if (error) throw error;
    return data;
};
