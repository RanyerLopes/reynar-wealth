import React, { useState, useEffect, useMemo } from 'react';
import { Bell, AlertTriangle, CheckCircle, Info, Trophy, Wallet, Target, Trash2, CheckCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppNotification } from '../types';
import * as notificationService from '../services/notificationService';
import { useBills, useGoals } from '../hooks/useDatabase';
import { format } from 'date-fns';

const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const { bills } = useBills();
  const { goals } = useGoals();

  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Load notifications and check for new alerts
  useEffect(() => {
    // Check for bill due notifications
    notificationService.checkBillsDueSoon(bills);

    // Check for goal reminders
    notificationService.checkGoalReminders(goals);

    // Load stored budgets and check warnings
    const savedBudgets = localStorage.getItem('reynar_budgets');
    if (savedBudgets) {
      const budgets = JSON.parse(savedBudgets);
      const currentMonth = format(new Date(), 'yyyy-MM');
      const currentBudgets = budgets.filter((b: any) => b.month === currentMonth);

      // Get transaction totals per category for current month
      // This is simplified - in production you'd use the hook
      notificationService.checkBudgetWarnings(currentBudgets);
    }

    // Load all notifications
    setNotifications(notificationService.getNotifications());
  }, [bills, goals]);

  const unreadCount = useMemo(() =>
    notifications.filter(n => !n.isRead).length,
    [notifications]
  );

  const handleMarkAsRead = (id: string) => {
    notificationService.markAsRead(id);
    setNotifications(notificationService.getNotifications());
  };

  const handleMarkAllRead = () => {
    notificationService.markAllAsRead();
    setNotifications(notificationService.getNotifications());
  };

  const handleDelete = (id: string) => {
    notificationService.deleteNotification(id);
    setNotifications(notificationService.getNotifications());
  };

  const handleClick = (notification: AppNotification) => {
    handleMarkAsRead(notification.id);
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const getNotificationIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'bill_due':
        return { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10' };
      case 'budget_warning':
        return { icon: Wallet, color: 'text-orange-500', bg: 'bg-orange-500/10' };
      case 'goal_reminder':
        return { icon: Target, color: 'text-blue-500', bg: 'bg-blue-500/10' };
      case 'achievement':
        return { icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-500/10' };
      case 'info':
      default:
        return { icon: Info, color: 'text-primary', bg: 'bg-primary/10' };
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `Há ${diffMins} minutos`;
    if (diffHours < 24) return `Há ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `Há ${diffDays} dias`;
    return format(new Date(date), 'dd/MM/yyyy');
  };

  return (
    <div className="space-y-6 animate-fade-in relative max-w-2xl mx-auto pb-24 md:pb-0">
      <header className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-textMain">Notificações</h2>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-primary text-white text-xs rounded-full">
                {unreadCount} nova{unreadCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <p className="text-textMuted text-sm">Fique por dentro de tudo</p>
        </div>
        {notifications.length > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            <CheckCheck size={16} />
            Marcar todas como lidas
          </button>
        )}
      </header>

      {notifications.length === 0 ? (
        <div className="text-center py-16 bg-surface border border-surfaceHighlight rounded-2xl">
          <div className="p-4 rounded-full bg-surfaceHighlight w-fit mx-auto mb-4">
            <Bell size={40} className="text-textMuted" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Nenhuma notificação</h3>
          <p className="text-textMuted text-sm">
            Você está em dia! Notificações aparecerão aqui.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => {
            const { icon: Icon, color, bg } = getNotificationIcon(notif.type);

            return (
              <div
                key={notif.id}
                onClick={() => handleClick(notif)}
                className={`bg-surface border border-surfaceHighlight p-4 rounded-2xl flex gap-4 hover:bg-surfaceHighlight/50 transition-colors cursor-pointer group ${!notif.isRead ? 'border-l-4 border-l-primary' : ''
                  }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${bg} ${color}`}>
                  <Icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className={`font-bold text-sm ${notif.isRead ? 'text-textMuted' : 'text-textMain'}`}>
                      {notif.title}
                    </h4>
                    <span className="text-[10px] text-textMuted whitespace-nowrap">
                      {formatTime(notif.createdAt)}
                    </span>
                  </div>
                  <p className="text-textMuted text-sm mt-1 leading-relaxed line-clamp-2">
                    {notif.message}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(notif.id);
                  }}
                  className="p-2 text-textMuted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}

          <div className="text-center pt-8">
            <p className="text-textMuted text-xs uppercase tracking-widest">Fim das notificações</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
