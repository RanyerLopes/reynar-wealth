
import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, ArrowRight, DollarSign, ChevronLeft } from 'lucide-react';
import { Input, Button, ReynarLogo, triggerCoinExplosion } from '../components/UI';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppRoutes } from '../types';
import { useAuth } from '../context/AuthContext';
import { signInWithEmail, signUpWithEmail } from '../services/supabase';

// Google Icon Component
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signInWithGoogle, isAuthenticated } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if coming from "Start Now" button
  useEffect(() => {
    if (location.state && (location.state as any).isRegister) {
      setIsLogin(false);
    }
  }, [location]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(AppRoutes.DASHBOARD);
    }
  }, [isAuthenticated, navigate]);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [salary, setSalary] = useState('');
  const [gender, setGender] = useState('male');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError(null);
    triggerCoinExplosion(window.innerWidth / 2, window.innerHeight / 2);

    try {
      const { error } = await signInWithGoogle();
      if (error) {
        console.error('Google login error:', error);
        setError('Erro ao fazer login com Google. Tente novamente.');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validações para cadastro
    if (!isLogin) {
      if (password.length < 6) {
        setError('A senha deve ter pelo menos 6 caracteres.');
        return;
      }
      if (password !== confirmPassword) {
        setError('As senhas não coincidem.');
        return;
      }
    }

    setLoading(true);

    try {
      if (isLogin) {
        // Login with email/password
        const { data, error } = await signInWithEmail(email, password);

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setError('Email ou senha incorretos.');
          } else {
            setError(error.message);
          }
          return;
        }

        if (data.user) {
          triggerCoinExplosion(window.innerWidth / 2, window.innerHeight / 2);
          navigate(AppRoutes.DASHBOARD);
        }
      } else {
        // Sign up with email/password
        const { data, error } = await signUpWithEmail(email, password);

        if (error) {
          if (error.message.includes('already registered')) {
            setError('Este email já está cadastrado. Faça login.');
          } else {
            setError(error.message);
          }
          return;
        }

        if (data.user) {
          // Save additional user data
          if (name) localStorage.setItem('reynar_user_name', name);
          if (salary) localStorage.setItem('reynar_user_salary', salary);
          if (gender) localStorage.setItem('reynar_user_gender', gender);

          triggerCoinExplosion(window.innerWidth / 2, window.innerHeight / 2);

          if (data.session) {
            navigate(AppRoutes.DASHBOARD);
          } else {
            // Email confirmation required
            alert('Conta criada! Verifique seu email para confirmar o cadastro.');
            setIsLogin(true);
          }
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">

      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 z-50 text-textMuted hover:text-white flex items-center gap-2 transition-colors"
      >
        <ChevronLeft size={20} /> Voltar
      </button>

      {/* --- ANIMATED BACKGROUND (Aurora Effect) --- */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/30 rounded-full blur-[100px] animate-blob mix-blend-screen opacity-70"></div>
        <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-secondary/20 rounded-full blur-[100px] animate-blob animation-delay-2000 mix-blend-screen opacity-60"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] animate-blob animation-delay-4000 mix-blend-screen opacity-50"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
      </div>

      <div className="w-full max-w-md z-10">

        {/* --- HEADER ANIMATION --- */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="relative animate-float">
            <div className="absolute inset-0 bg-primary/50 blur-2xl rounded-full"></div>
            <div className="w-24 h-24 bg-gradient-to-tr from-surfaceHighlight/80 to-black/80 backdrop-blur-xl border border-white/10 rounded-3xl flex items-center justify-center shadow-2xl relative z-10 animate-scale-up">
              <ReynarLogo size={56} />
            </div>
          </div>

          <div className="mt-6 space-y-2 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-zinc-400 tracking-tight drop-shadow-sm">
              Reynar Wealth
            </h1>
            <p className="text-textMuted text-sm max-w-xs mx-auto leading-relaxed font-medium">
              Faça login para acessar seu império financeiro.
            </p>
          </div>
        </div>

        {/* --- FORM ANIMATION --- */}
        <div
          className="space-y-5 bg-surface/40 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] shadow-2xl animate-slide-up relative overflow-hidden group"
          style={{ animationDelay: '200ms' }}
        >
          {/* Google Login Button - PRIMARY */}
          <Button
            onClick={handleGoogleLogin}
            isLoading={googleLoading}
            className="w-full py-4 text-base bg-white hover:bg-gray-100 text-gray-900 shadow-lg transition-all active:scale-[0.98] !from-white !to-gray-100"
          >
            <GoogleIcon />
            Entrar com Google
          </Button>

          {/* Clear Session Button (for debugging) */}
          <button
            onClick={() => {
              localStorage.clear();
              sessionStorage.clear();
              window.location.reload();
            }}
            className="w-full text-xs text-textMuted hover:text-white underline transition-colors py-1"
          >
            Problemas para entrar? Limpar sessão
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-white/10"></div>
            <span className="text-textMuted text-xs">ou</span>
            <div className="flex-1 h-px bg-white/10"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-4 animate-fade-in">
                <Input
                  label="Nome Completo"
                  placeholder="Ex: João Silva"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-black/20 focus:bg-black/40"
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Gênero"
                    as="select"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="bg-black/20 focus:bg-black/40"
                  >
                    <option value="male">Masculino</option>
                    <option value="female">Feminino</option>
                    <option value="other">Outro</option>
                  </Input>

                  <Input
                    label="Salário Mensal"
                    type="number"
                    placeholder="0,00"
                    required
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    className="bg-black/20 focus:bg-black/40"
                    icon={<DollarSign size={14} />}
                  />
                </div>
              </div>
            )}

            <div className="space-y-4">
              <Input
                label="E-mail"
                type="email"
                placeholder="seu@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-black/20 focus:bg-black/40"
              />

              <div className="relative">
                <Input
                  label="Senha"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-black/20 focus:bg-black/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-[34px] text-textMuted hover:text-white transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {!isLogin && (
                <div className="relative animate-fade-in">
                  <Input
                    label="Confirmar Senha"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-black/20 focus:bg-black/40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-[34px] text-textMuted hover:text-white transition-colors p-1"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-red-400 text-xs mt-1">As senhas não coincidem</p>
                  )}
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-lg">
                {error}
              </div>
            )}

            {isLogin && (
              <div className="flex justify-end">
                <button type="button" className="text-xs text-primary hover:text-indigo-400 font-semibold transition-colors">
                  Esqueceu a senha?
                </button>
              </div>
            )}

            <Button type="submit" variant="secondary" isLoading={loading} className="w-full py-4 text-base transition-all active:scale-[0.98]">
              {isLogin ? 'Entrar com Email' : 'Criar minha Conta'} <ArrowRight size={18} />
            </Button>
          </form>

          <div className="text-center pt-2">
            <p className="text-textMuted text-sm">
              {isLogin ? "Ainda não é membro? " : "Já possui conta? "}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-white font-bold hover:text-primary transition-colors underline decoration-primary/50 underline-offset-4"
              >
                {isLogin ? 'Cadastre-se' : 'Acessar'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
