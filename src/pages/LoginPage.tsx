import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Bot, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles, 
  Shield, 
  Zap,
  Users,
  Building,
  Crown
} from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Email ou senha inválidos');
    } finally {
      setLoading(false);
    }
  };

  const testAccounts = [
    {
      type: 'Proprietário',
      email: 'admin@teste.com',
      password: '123456',
      icon: Crown,
      gradient: 'from-purple-500 to-pink-500',
      description: 'Acesso total ao sistema'
    },
    {
      type: 'Empresa',
      email: 'empresa@teste.com',
      password: '123456',
      icon: Building,
      gradient: 'from-blue-500 to-cyan-500',
      description: 'Acesso empresarial'
    }
  ];

  const features = [
    {
      icon: Bot,
      title: 'Agentes de IA Avançados',
      description: 'Crie e gerencie agentes inteligentes para WhatsApp, SMS, Email e Voz'
    },
    {
      icon: Zap,
      title: 'Campanhas Automatizadas',
      description: 'Dispare campanhas personalizadas com inteligência artificial'
    },
    {
      icon: Sparkles,
      title: 'Geração de Conteúdo',
      description: 'Use IA para criar imagens, vídeos e textos únicos'
    }
  ];

  const quickLogin = (email: string, password: string) => {
    setEmail(email);
    setPassword(password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex">
      {/* Left Panel - Features */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600"></div>
        <div className="absolute inset-0 bg-black/10"></div>
        
        {/* Decorative shapes */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full -translate-x-36 -translate-y-36"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-48 translate-y-48"></div>
        
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="mb-12">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Bot className="w-7 h-7 text-white" />
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold">Plataforma IA</h1>
                <p className="text-blue-100">Agentes Inteligentes</p>
              </div>
            </div>
            
            <h2 className="text-4xl font-bold mb-4 leading-tight">
              Transforme seu negócio com
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">
                Inteligência Artificial
              </span>
            </h2>
            
            <p className="text-blue-100 text-lg leading-relaxed">
              Crie agentes de IA personalizados, automatize campanhas e gere conteúdo único 
              para revolucionar sua comunicação com clientes.
            </p>
          </div>

          <div className="space-y-6">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                    <p className="text-blue-100 text-sm">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 lg:px-16">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <div className="ml-3">
              <h1 className="text-xl font-bold gradient-text">Plataforma IA</h1>
              <p className="text-gray-500 text-sm">Agentes Inteligentes</p>
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Bem-vindo de volta!
            </h2>
            <p className="text-gray-600">
              Faça login para acessar sua plataforma de IA
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10 pr-10"
                  placeholder="Sua senha"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Lembrar de mim
                </label>
              </div>

              <button type="button" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                Esqueceu a senha?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Entrar
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </button>
          </form>

          {/* Test Accounts */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">Contas de teste</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {testAccounts.map((account, index) => {
                const IconComponent = account.icon;
                return (
                  <button
                    key={index}
                    onClick={() => quickLogin(account.email, account.password)}
                    className="p-4 border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-md transition-all duration-200 text-left group"
                  >
                    <div className="flex items-center mb-3">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${account.gradient} flex items-center justify-center`}>
                        <IconComponent className="w-4 h-4 text-white" />
                      </div>
                      <div className="ml-3">
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {account.type}
                        </h3>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{account.description}</p>
                    <p className="text-xs text-gray-500 font-mono">
                      {account.email}
                    </p>
                  </button>
                );
              })}
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
              Clique em uma conta para login automático
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;