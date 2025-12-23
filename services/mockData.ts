
import { Achievement } from '../types';

// System configuration: nobility titles based on level
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

// System configuration: default achievements for new users
export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: '1',
    title: 'Primeiros Passos',
    description: 'Registre sua primeira despesa no app.',
    icon: '🚀',
    isUnlocked: false,
    progress: 0,
    xpReward: 100
  },
  {
    id: '2',
    title: 'Poupador Iniciante',
    description: 'Guarde seus primeiros R$ 1.000 em Metas.',
    icon: '🐷',
    isUnlocked: false,
    progress: 0,
    xpReward: 300
  },
  {
    id: '3',
    title: 'Investidor',
    description: 'Crie seu primeiro ativo na carteira de investimentos.',
    icon: '📈',
    isUnlocked: false,
    progress: 0,
    xpReward: 500
  },
  {
    id: '4',
    title: 'Mestre das Contas',
    description: 'Pague 5 contas antes do vencimento.',
    icon: '⚡',
    isUnlocked: false,
    progress: 0,
    xpReward: 800
  },
  {
    id: '5',
    title: 'Liberdade Financeira',
    description: 'Atingir R$ 50k de patrimônio total.',
    icon: '🦅',
    isUnlocked: false,
    progress: 0,
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
    isUnlocked: false,
    progress: 0,
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
