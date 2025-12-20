
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Achievement } from '../types';
import { mockUser, mockAchievements } from '../services/mockData';
import { triggerCoinExplosion } from '../components/UI';

interface GamificationContextType {
  user: User;
  achievements: Achievement[];
  addXp: (amount: number) => void;
  toast: { message: string, type: 'xp' | 'level', id: number } | null;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export const GamificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load User from LocalStorage or fallback to Mock
  const [user, setUser] = useState<User>(() => {
    const stored = localStorage.getItem('finnova_gamification_user');
    return stored ? JSON.parse(stored) : { ...mockUser, currentXp: 0, level: 1, nextLevelXp: 1000 };
  });

  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    const stored = localStorage.getItem('finnova_gamification_achievements');
    return stored ? JSON.parse(stored) : mockAchievements;
  });

  const [toast, setToast] = useState<{ message: string, type: 'xp' | 'level', id: number } | null>(null);

  // Persistence
  useEffect(() => {
    localStorage.setItem('finnova_gamification_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('finnova_gamification_achievements', JSON.stringify(achievements));
  }, [achievements]);

  const showToast = (message: string, type: 'xp' | 'level' = 'xp') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 3000);
  };

  const addXp = (amount: number) => {
    setUser(prev => {
      let newXp = (prev.currentXp || 0) + amount;
      let newLevel = prev.level || 1;
      let nextLevelXp = prev.nextLevelXp || 1000;
      let leveledUp = false;

      // Level Up Logic
      while (newXp >= nextLevelXp) {
        newXp -= nextLevelXp;
        newLevel += 1;
        // Increase difficulty by 50% each level
        nextLevelXp = Math.floor(nextLevelXp * 1.5);
        leveledUp = true;
      }

      if (leveledUp) {
        setTimeout(() => {
            showToast(`Nível ${newLevel} Alcançado! 👑`, 'level');
            triggerCoinExplosion(window.innerWidth / 2, window.innerHeight / 2);
        }, 500);
      } else {
          showToast(`+${amount} XP`, 'xp');
      }

      return {
        ...prev,
        currentXp: newXp,
        level: newLevel,
        nextLevelXp: nextLevelXp
      };
    });
  };

  return (
    <GamificationContext.Provider value={{ user, achievements, addXp, toast }}>
      {children}
    </GamificationContext.Provider>
  );
};

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (!context) throw new Error('useGamification must be used within a GamificationProvider');
  return context;
};
