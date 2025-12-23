
import React from 'react';
import { Home, PieChart, LogOut, List, CalendarClock, Target, Settings, HandCoins, FileText, Sparkles, ChevronRight, BarChart3, CreditCard, Wallet } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppRoutes } from '../types';
import { ReynarLogo } from './UI';

interface NavProps {
  onLogout: () => void;
}

export const Navigation: React.FC<NavProps> = ({ onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  // We don't need to check plan here anymore for banners, 
  // as the App.tsx Paywall ensures only paid users see this.

  // HashRouter uses location.pathname correctly, but we need to handle the root path "/" specially
  // Since AppRoutes.DASHBOARD is "/", we check if pathname matches exactly
  const isActive = (path: string) => {
    const currentPath = location.pathname;
    // Handle root path - Dashboard
    if (path === '/' || path === '') {
      return currentPath === '/' || currentPath === '';
    }
    // For other paths, check if it starts with the path (for nested routes)
    return currentPath === path || currentPath.startsWith(path + '/');
  };

  const handleNav = (path: string) => navigate(path);

  const navItems = [
    { icon: <Home size={20} />, label: 'Início', path: AppRoutes.DASHBOARD },
    { icon: <List size={20} />, label: 'Extrato', path: AppRoutes.TRANSACTIONS },
    { icon: <Wallet size={20} />, label: 'Orçamento', path: AppRoutes.BUDGET },
    { icon: <CalendarClock size={20} />, label: 'Contas', path: AppRoutes.BILLS },
    { icon: <Target size={20} />, label: 'Metas', path: AppRoutes.GOALS },
    { icon: <PieChart size={20} />, label: 'Investir', path: AppRoutes.INVESTMENTS },
    { icon: <HandCoins size={20} />, label: 'Me Devem', path: AppRoutes.LOANS },
    { icon: <FileText size={20} />, label: 'Relatórios', path: AppRoutes.REPORTS },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-surface border-r border-surfaceHighlight p-6 z-40">
        <button
          onClick={() => handleNav(AppRoutes.DASHBOARD)}
          className="flex items-center gap-3 mb-10 cursor-pointer hover:opacity-80 transition-opacity group w-full text-left"
          title="Voltar ao Início"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-surfaceHighlight to-black border border-surfaceHighlight flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform shrink-0">
            <ReynarLogo size={24} />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400 group-hover:from-primary group-hover:to-blue-400 transition-all leading-tight">Reynar Wealth</h1>
        </button>

        <nav className="flex-1 space-y-2 overflow-y-auto no-scrollbar pb-4">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleNav(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 border ${isActive(item.path)
                ? 'bg-primary/10 text-primary border-primary/30'
                : 'text-textMuted border-transparent hover:bg-surfaceHighlight hover:text-textMain'
                }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Plan Badge */}
        <div className="mt-4 mb-4 px-4 py-2 rounded-lg bg-surfaceHighlight/50 border border-surfaceHighlight text-xs text-textMuted flex items-center justify-between">
          <span className="font-medium text-white flex items-center gap-1.5"><Sparkles size={12} className="text-amber-400" /> Membro PRO</span>
        </div>

        <div className="mt-auto pt-4 border-t border-surfaceHighlight space-y-2">
          <button
            onClick={() => handleNav(AppRoutes.SETTINGS)}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-200 ${isActive(AppRoutes.SETTINGS) ? 'text-white' : 'text-textMuted hover:text-white'
              }`}
          >
            <Settings size={18} />
            <span className="text-sm">Configurações</span>
          </button>

          <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-2 text-textMuted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors text-sm">
            <LogOut size={18} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-xl border-t border-surfaceHighlight z-40 safe-area-bottom">
        <div className="relative">
          {/* Scrollable Container */}
          <div className="flex items-center gap-5 overflow-x-auto no-scrollbar px-4 py-3 pr-12">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNav(item.path)}
                className={`flex flex-col items-center gap-1 transition-all duration-300 min-w-[60px] shrink-0 ${isActive(item.path) ? 'text-primary -translate-y-1' : 'text-textMuted'
                  }`}
              >
                <div className={`p-1.5 rounded-full transition-colors ${isActive(item.path) ? 'bg-primary/20' : 'bg-transparent'}`}>
                  {item.icon}
                </div>
                <span className="text-[9px] font-medium truncate w-full text-center">{item.label}</span>
              </button>
            ))}

            {/* Settings Button (Mobile) */}
            <button
              onClick={() => handleNav(AppRoutes.SETTINGS)}
              className={`flex flex-col items-center gap-1 transition-all duration-300 min-w-[60px] shrink-0 ${isActive(AppRoutes.SETTINGS) ? 'text-primary -translate-y-1' : 'text-textMuted'
                }`}
            >
              <div className={`p-1.5 rounded-full transition-colors ${isActive(AppRoutes.SETTINGS) ? 'bg-primary/20' : 'bg-transparent'}`}>
                <Settings size={20} />
              </div>
              <span className="text-[9px] font-medium truncate w-full text-center">Ajustes</span>
            </button>
          </div>

          {/* Visual Scroll Indicator (Arrow + Gradient Fade) */}
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-surface to-transparent pointer-events-none flex items-center justify-end pr-2">
            <ChevronRight size={20} className="text-primary animate-pulse-slow opacity-80" />
          </div>
        </div>
      </nav>
    </>
  );
};
