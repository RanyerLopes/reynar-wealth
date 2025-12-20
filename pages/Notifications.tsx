
import React from 'react';
import { Bell, AlertTriangle, CheckCircle, Info } from 'lucide-react';

const Notifications: React.FC = () => {
  const notifications = [
    {
      id: 1,
      type: 'warning',
      title: 'Conta de Luz Vencendo',
      message: 'Sua conta de R$ 189,90 vence amanhã. Evite juros!',
      time: 'Há 2 horas',
      icon: AlertTriangle,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10'
    },
    {
      id: 2,
      type: 'success',
      title: 'Meta Atingida! 🏆',
      message: 'Parabéns! Você atingiu 100% da meta "Viagem Disney".',
      time: 'Ontem',
      icon: CheckCircle,
      color: 'text-secondary',
      bg: 'bg-secondary/10'
    },
    {
      id: 3,
      type: 'info',
      title: 'Dica Financeira',
      message: 'Você gastou 20% a menos em Lazer este mês. Continue assim!',
      time: 'Há 2 dias',
      icon: Info,
      color: 'text-primary',
      bg: 'bg-primary/10'
    },
    {
        id: 4,
        type: 'system',
        title: 'Bem-vindo ao PRO',
        message: 'Sua assinatura foi confirmada. Aproveite todos os recursos.',
        time: 'Há 1 semana',
        icon: Bell,
        color: 'text-textMain',
        bg: 'bg-surfaceHighlight'
      }
  ];

  return (
    <div className="space-y-6 animate-fade-in relative max-w-2xl mx-auto">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-textMain">Notificações</h2>
          <p className="text-textMuted text-sm">Fique por dentro de tudo</p>
        </div>
        <button className="text-sm text-primary hover:underline">Marcar todas como lidas</button>
      </header>

      <div className="space-y-3">
        {notifications.map((notif) => (
          <div key={notif.id} className="bg-surface border border-surfaceHighlight p-4 rounded-2xl flex gap-4 hover:bg-surfaceHighlight/50 transition-colors cursor-pointer">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${notif.bg} ${notif.color}`}>
              <notif.icon size={20} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-textMain text-sm">{notif.title}</h4>
                <span className="text-[10px] text-textMuted">{notif.time}</span>
              </div>
              <p className="text-textMuted text-sm mt-1 leading-relaxed">{notif.message}</p>
            </div>
          </div>
        ))}
        
        <div className="text-center pt-8">
            <p className="text-textMuted text-xs uppercase tracking-widest">Fim das notificações</p>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
