import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Investments from './pages/Investments';
import Market from './pages/Market';
import Bills from './pages/Bills';
import Goals from './pages/Goals';
import Loans from './pages/Loans';
import Budget from './pages/Budget';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Pricing from './pages/Pricing';
import CheckoutSuccess from './pages/CheckoutSuccess';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import { Navigation } from './components/Navigation';
import { ReynarLogo } from './components/UI';
import ErrorBoundary from './components/ErrorBoundary';
import { AppRoutes } from './types';
import { GamificationProvider, useGamification } from './context/GamificationContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SubscriptionProvider, useSubscription } from './context/SubscriptionContext';
import { LanguageProvider } from './context/LanguageContext';
import { Star, Trophy, Loader2, Crown } from 'lucide-react';

// Global Gamification Toast Component
const GamificationToast = () => {
  const { toast } = useGamification();

  if (!toast) return null;

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-slide-up">
      <div className={`px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border ${toast.type === 'level'
        ? 'bg-gradient-to-r from-yellow-500 to-amber-600 border-yellow-300 text-black'
        : 'bg-surfaceHighlight/90 backdrop-blur-md border-primary/50 text-white'
        }`}>
        <div className={`p-1.5 rounded-full ${toast.type === 'level' ? 'bg-black/20' : 'bg-primary'}`}>
          {toast.type === 'level' ? <Trophy size={16} /> : <Star size={16} fill="white" />}
        </div>
        <span className="font-bold text-sm tracking-wide">{toast.message}</span>
      </div>
    </div>
  );
};

// Logout Animation Component
const LogoutScreen = () => (
  <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center animate-fade-in">
    <div className="relative mb-8">
      <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse-slow"></div>
      <div className="animate-float">
        <ReynarLogo size={80} />
      </div>
    </div>
    <h2 className="text-2xl font-bold text-white mb-2 animate-slide-up">Até logo, Vossa Majestade</h2>
    <p className="text-textMuted text-sm animate-fade-in" style={{ animationDelay: '200ms' }}>Fechando os portões do reino...</p>
    <div className="mt-8 w-48 h-1 bg-surfaceHighlight rounded-full overflow-hidden">
      <div className="h-full bg-gradient-to-r from-primary to-secondary animate-[loading_1.5s_ease-in-out_forwards] w-0"></div>
    </div>
    <style>{`
      @keyframes loading {
        0% { width: 0%; }
        100% { width: 100%; }
      }
    `}</style>
  </div>
);

// SUBSCRIPTION BANNER - Shows trial/free status
const SubscriptionBanner = () => {
  const { plan, isTrial, daysLeftInTrial, isTrialExpired } = useSubscription();
  const navigate = useNavigate();

  // Pro users don't see banner
  if (plan === 'pro') return null;

  // Trial users see days remaining
  if (isTrial && !isTrialExpired) {
    return (
      <div className="bg-gradient-to-r from-primary/20 to-indigo-500/20 border-b border-primary/30 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Crown size={16} className="text-amber-400" />
            <span className="text-white">Teste Pro: <strong>{daysLeftInTrial} dias restantes</strong></span>
          </div>
          <button
            onClick={() => navigate(AppRoutes.PRICING)}
            className="text-xs bg-primary/20 hover:bg-primary/30 text-primary px-3 py-1 rounded-full transition-colors"
          >
            Fazer Upgrade
          </button>
        </div>
      </div>
    );
  }

  // Trial expired
  if (isTrialExpired) {
    return (
      <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-b border-amber-500/30 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Crown size={16} className="text-amber-400" />
            <span className="text-white">Seu teste terminou. <strong>Algumas funcionalidades estão limitadas.</strong></span>
          </div>
          <button
            onClick={() => navigate(AppRoutes.PRICING)}
            className="text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 px-3 py-1 rounded-full transition-colors"
          >
            Fazer Upgrade
          </button>
        </div>
      </div>
    );
  }

  // Free users see upgrade prompt occasionally
  return null;
};

// No more hard paywall - Freemium model
// Features are limited inside each component using useSubscription

// Loading Screen Component
const LoadingScreen = () => (
  <div className="fixed inset-0 z-[9999] bg-background flex flex-col items-center justify-center">
    <div className="relative mb-8">
      <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse-slow"></div>
      <div className="animate-float">
        <ReynarLogo size={80} />
      </div>
    </div>
    <Loader2 size={32} className="text-primary animate-spin" />
    <p className="text-textMuted text-sm mt-4">Carregando o reino...</p>
  </div>
);

// Internal Layout wrapper
const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading, signOut, isAuthenticated } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Show loading while checking auth state
  if (loading) {
    return <LoadingScreen />;
  }

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setTimeout(async () => {
      await signOut();
      setIsLoggingOut(false);
      navigate(AppRoutes.LOGIN);
    }, 1800);
  };

  return (
    <div className="h-screen w-full bg-background text-textMain font-sans selection:bg-primary selection:text-white overflow-hidden flex flex-col safe-area-top relative">

      {/* Overlays */}
      <GamificationToast />
      {isLoggingOut && <LogoutScreen />}

      {isAuthenticated ? (
        <div className="flex h-full w-full overflow-hidden z-10 relative">
          <Navigation onLogout={handleLogout} />

          <main className="flex-1 md:ml-64 h-full overflow-y-auto scroll-smooth w-full relative no-scrollbar flex flex-col">
            {/* Subscription Banner */}
            <SubscriptionBanner />

            <div className="p-4 md:p-8 lg:p-10 max-w-7xl mx-auto w-full min-h-full pb-28 md:pb-10 flex-1">
              <Routes>
                {/* All routes accessible - limits handled inside components */}
                <Route path={AppRoutes.PRICING} element={<Pricing />} />
                <Route path={AppRoutes.CHECKOUT_SUCCESS} element={<CheckoutSuccess />} />
                <Route path={AppRoutes.DASHBOARD} element={<Dashboard />} />
                <Route path={AppRoutes.TRANSACTIONS} element={<Transactions />} />
                <Route path={AppRoutes.BILLS} element={<Bills />} />
                <Route path={AppRoutes.INVESTMENTS} element={<Investments />} />
                <Route path={AppRoutes.MARKET} element={<Market />} />
                <Route path={AppRoutes.GOALS} element={<Goals />} />
                <Route path={AppRoutes.LOANS} element={<Loans />} />
                <Route path={AppRoutes.BUDGET} element={<Budget />} />
                <Route path={AppRoutes.REPORTS} element={<Reports />} />
                <Route path={AppRoutes.SETTINGS} element={<Settings onLogout={handleLogout} />} />
                <Route path={AppRoutes.NOTIFICATIONS} element={<Notifications />} />
                <Route path={AppRoutes.PROFILE} element={<Profile />} />

                {/* Default redirect */}
                <Route path="/" element={<Navigate to={AppRoutes.DASHBOARD} replace />} />
                <Route path="*" element={<Navigate to={AppRoutes.DASHBOARD} replace />} />
              </Routes>
            </div>
          </main>
        </div>
      ) : (
        <div className="h-full w-full overflow-y-auto z-10 relative">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path={AppRoutes.LOGIN} element={<Login />} />
            <Route path="*" element={<Navigate to={AppRoutes.LOGIN} replace />} />
          </Routes>
        </div>
      )}
    </div>
  );
}

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <AuthProvider>
          <SubscriptionProvider>
            <GamificationProvider>
              <HashRouter>
                <AppLayout />
              </HashRouter>
            </GamificationProvider>
          </SubscriptionProvider>
        </AuthProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
};

export default App;