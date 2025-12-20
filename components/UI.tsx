
import React from 'react';

// --- HAPTIC FEEDBACK UTILITY ---
export const vibrate = (pattern: number | number[] = 10) => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
};

// --- VISUAL EFFECT UTILITY: COIN EXPLOSION ---
export const triggerCoinExplosion = (x: number, y: number) => {
  // Heavy vibration for the "reward" feeling
  vibrate([50, 30, 50]);

  const coins = ['🪙', '💰', '✨', '💎', '👑'];
  const particleCount = 12;

  for (let i = 0; i < particleCount; i++) {
    const el = document.createElement('div');
    const randomCoin = coins[Math.floor(Math.random() * coins.length)];
    el.innerText = randomCoin;
    el.className = 'coin-particle';
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    
    // Random trajectory variables used in CSS
    const tx = (Math.random() - 0.5) * 200; // Spread X
    const ty = (Math.random() - 1) * 200 - 50; // Spread Y (mostly up)
    const r = (Math.random() - 0.5) * 360; // Rotation
    
    el.style.setProperty('--tx', `${tx}px`);
    el.style.setProperty('--ty', `${ty}px`);
    el.style.setProperty('--r', `${r}deg`);

    document.body.appendChild(el);

    // Cleanup
    setTimeout(() => {
      el.remove();
    }, 1000);
  }
};

// --- Card Component ---
// Alterado para bg-surface com menor opacidade e efeitos de hover de levitação/neon
export const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: (e: React.MouseEvent) => void }> = ({ children, className = '', onClick }) => (
  <div 
    onClick={onClick} 
    className={`bg-surface/60 border border-surfaceHighlight rounded-2xl shadow-lg p-5 backdrop-blur-md 
    transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_30px_-10px_rgba(124,58,237,0.3)] 
    group ${className}`}
  >
    {children}
  </div>
);

// --- Button Component ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', isLoading, className = '', onClick, ...props }) => {
  const baseStyles = "relative w-full py-3 rounded-xl font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-gradient-to-r from-primary to-violet-800 text-white shadow-[0_0_20px_rgba(124,58,237,0.2)] hover:shadow-[0_0_30px_rgba(124,58,237,0.4)]",
    secondary: "bg-surfaceHighlight text-white hover:bg-zinc-800 border border-zinc-800",
    danger: "bg-danger text-white shadow-[0_0_15px_rgba(225,29,72,0.3)]",
    ghost: "bg-transparent text-textMuted hover:text-white"
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Light vibration on click
    vibrate(10);
    if (onClick) onClick(e);
  };

  return (
    <button onClick={handleClick} className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {isLoading ? (
        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : children}
    </button>
  );
};

// --- Input Component ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLSelectElement> {
  label: string;
  icon?: React.ReactNode;
  as?: 'input' | 'select';
  children?: React.ReactNode; // For select options
}

export const Input: React.FC<InputProps> = ({ label, icon, as = 'input', className = '', children, ...props }) => {
  const Component = as as any;
  
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-textMuted uppercase tracking-wider ml-1">{label}</label>
      <div className="relative group">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted group-focus-within:text-primary transition-colors">
            {icon}
          </div>
        )}
        <Component
          className={`w-full bg-surfaceHighlight/50 border border-surfaceHighlight rounded-xl px-4 py-3 text-textMain placeholder-zinc-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all ${icon ? 'pl-10' : ''} ${className}`}
          {...props}
        >
          {children}
        </Component>
      </div>
    </div>
  );
};

// --- Badge Component ---
export const Badge: React.FC<{ type: 'income' | 'expense' | 'neutral'; children: React.ReactNode }> = ({ type, children }) => {
  const styles = {
    income: "bg-secondary/10 text-secondary border-secondary/20",
    expense: "bg-danger/10 text-danger border-danger/20",
    neutral: "bg-zinc-800 text-zinc-400 border-zinc-700"
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-md text-xs font-medium border ${styles[type]}`}>
      {children}
    </span>
  );
};

// --- BRAND NEW LOGO COMPONENT ---
export const ReynarLogo: React.FC<{ size?: number; className?: string }> = ({ size = 32, className = '' }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path 
        d="M2 6L5 15H19L22 6L15 11L12 4L9 11L2 6Z" 
        fill="url(#reynar-gradient)" 
        stroke="white" 
        strokeWidth="1.5" 
        strokeLinejoin="round"
      />
      <path 
        d="M5 15H19V18C19 19.1046 18.1046 20 17 20H7C5.89543 20 5 19.1046 5 18V15Z" 
        fill="url(#reynar-gradient-dark)" 
        stroke="white" 
        strokeWidth="1.5" 
        strokeLinejoin="round"
      />
      <circle cx="12" cy="17" r="1.5" fill="white" />
      <defs>
        <linearGradient id="reynar-gradient" x1="2" y1="4" x2="22" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#c084fc" /> {/* Purple */}
          <stop offset="1" stopColor="#fbbf24" /> {/* Gold */}
        </linearGradient>
        <linearGradient id="reynar-gradient-dark" x1="5" y1="15" x2="19" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7e22ce" />
          <stop offset="1" stopColor="#b45309" />
        </linearGradient>
      </defs>
    </svg>
  );
};
