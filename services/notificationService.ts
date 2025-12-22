/**
 * Notification Service
 * 
 * Manages app notifications for bills due, budget warnings, goal reminders, etc.
 * Persists notifications in localStorage and checks for new alerts periodically.
 */

import { AppNotification } from '../types';

const STORAGE_KEY = 'reynar_notifications';

// Get all notifications from storage
export const getNotifications = (): AppNotification[] => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        const notifications = JSON.parse(saved);
        return notifications.map((n: any) => ({
            ...n,
            createdAt: new Date(n.createdAt),
        }));
    }
    return [];
};

// Save notifications to storage
export const saveNotifications = (notifications: AppNotification[]): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
};

// Add a new notification
export const addNotification = (
    type: AppNotification['type'],
    title: string,
    message: string,
    actionUrl?: string
): AppNotification => {
    const notifications = getNotifications();

    // Check if similar notification already exists (avoid duplicates)
    const existingIndex = notifications.findIndex(
        n => n.type === type && n.title === title && !n.isRead
    );

    if (existingIndex >= 0) {
        // Update existing notification
        notifications[existingIndex].message = message;
        notifications[existingIndex].createdAt = new Date();
        saveNotifications(notifications);
        return notifications[existingIndex];
    }

    const newNotification: AppNotification = {
        id: Math.random().toString(36).substring(2),
        type,
        title,
        message,
        isRead: false,
        createdAt: new Date(),
        actionUrl,
    };

    notifications.unshift(newNotification);

    // Keep only last 50 notifications
    const trimmed = notifications.slice(0, 50);
    saveNotifications(trimmed);

    return newNotification;
};

// Mark notification as read
export const markAsRead = (id: string): void => {
    const notifications = getNotifications();
    const updated = notifications.map(n =>
        n.id === id ? { ...n, isRead: true } : n
    );
    saveNotifications(updated);
};

// Mark all as read
export const markAllAsRead = (): void => {
    const notifications = getNotifications();
    const updated = notifications.map(n => ({ ...n, isRead: true }));
    saveNotifications(updated);
};

// Delete a notification
export const deleteNotification = (id: string): void => {
    const notifications = getNotifications();
    const filtered = notifications.filter(n => n.id !== id);
    saveNotifications(filtered);
};

// Clear all notifications
export const clearAllNotifications = (): void => {
    saveNotifications([]);
};

// Get unread count
export const getUnreadCount = (): number => {
    const notifications = getNotifications();
    return notifications.filter(n => !n.isRead).length;
};

// Check bills due soon and create notifications
export const checkBillsDueSoon = (bills: { id: string; description: string; amount: number; dueDate: Date; isPaid: boolean }[]): void => {
    const now = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    bills.forEach(bill => {
        if (bill.isPaid) return;

        const dueDate = new Date(bill.dueDate);

        // Bill is due within 3 days
        if (dueDate >= now && dueDate <= threeDaysFromNow) {
            const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

            addNotification(
                'bill_due',
                `Conta próxima do vencimento`,
                `${bill.description} vence em ${daysUntilDue} dia${daysUntilDue > 1 ? 's' : ''} (R$ ${bill.amount.toFixed(2)})`,
                '/bills'
            );
        }

        // Bill is overdue
        if (dueDate < now) {
            addNotification(
                'bill_due',
                `Conta vencida!`,
                `${bill.description} venceu (R$ ${bill.amount.toFixed(2)})`,
                '/bills'
            );
        }
    });
};

// Check budget warnings (when spending >= 80%)
export const checkBudgetWarnings = (budgets: { category: string; monthlyLimit: number; spent: number }[]): void => {
    budgets.forEach(budget => {
        const percentage = (budget.spent / budget.monthlyLimit) * 100;

        if (percentage >= 100) {
            addNotification(
                'budget_warning',
                `Orçamento excedido!`,
                `Você ultrapassou o limite de ${budget.category} em R$ ${(budget.spent - budget.monthlyLimit).toFixed(2)}`,
                '/budget'
            );
        } else if (percentage >= 80) {
            addNotification(
                'budget_warning',
                `Orçamento quase no limite`,
                `Você já usou ${percentage.toFixed(0)}% do orçamento de ${budget.category}`,
                '/budget'
            );
        }
    });
};

// Check goals near deadline
export const checkGoalReminders = (goals: { id: string; name: string; targetAmount: number; currentAmount: number; deadline: Date }[]): void => {
    const now = new Date();
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);

    goals.forEach(goal => {
        const deadline = new Date(goal.deadline);
        const progress = (goal.currentAmount / goal.targetAmount) * 100;

        // Goal deadline is within a week and not complete
        if (deadline >= now && deadline <= oneWeekFromNow && progress < 100) {
            const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            const remaining = goal.targetAmount - goal.currentAmount;

            addNotification(
                'goal_reminder',
                `Meta se aproximando do prazo`,
                `${goal.name} termina em ${daysLeft} dias. Faltam R$ ${remaining.toFixed(2)} (${progress.toFixed(0)}% concluído)`,
                '/goals'
            );
        }
    });
};

// Send achievement notification
export const notifyAchievement = (title: string, description: string): void => {
    addNotification(
        'achievement',
        `🏆 ${title}`,
        description
    );
};

// Send general info notification
export const notifyInfo = (title: string, message: string, actionUrl?: string): void => {
    addNotification('info', title, message, actionUrl);
};
