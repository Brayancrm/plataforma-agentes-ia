import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import { FIREBASE_CONFIG } from '../config/firebaseConfig';
import { Eye, EyeOff, Mail, Lock, User, Building2, Crown, UserCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, register, loading, error } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [category, setCategory] = useState<string>(FIREBASE_CONFIG.USER_CATEGORIES.USER);
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLogin) {
      // Login
      try {
        await login(email, password);
      } catch (err) {
        // Erro já tratado pelo AuthProvider
      }
    } else {
      // Registro
      if (password !== confirmPassword) {
        alert('As senhas não coincidem!');
        return;
      }
      
      try {
        await register(email, password, displayName, category);
        setIsLogin(true); // Voltar para login após registro
        setEmail('');
        setPassword('');
        setDisplayName('');
        setCategory(FIREBASE_CONFIG.USER_CATEGORIES.USER);
        setConfirmPassword('');
      } catch (err) {
        // Erro já tratado pelo AuthProvider
      }
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case FIREBASE_CONFIG.USER_CATEGORIES.OWNER:
        return <Crown className="w-4 h-4" />;
      case FIREBASE_CONFIG.USER_CATEGORIES.ADMIN:
        return <UserCheck className="w-4 h-4" />;
      case FIREBASE_CONFIG.USER_CATEGORIES.COMPANY:
        return <Building2 className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case FIREBASE_CONFIG.USER_CATEGORIES.OWNER:
        return 'Proprietário';
      case FIREBASE_CONFIG.USER_CATEGORIES.ADMIN:
        return 'Administrador';
      case FIREBASE_CONFIG.USER_CATEGORIES.COMPANY:
        return 'Empresa';
      default:
        return 'Usuário';
    }
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {isLogin ? 'Entrar na sua conta' : 'Criar nova conta'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isLogin ? 'Acesse sua plataforma de agentes IA' : 'Comece a usar nossa plataforma'}
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {!isLogin && (
              <>
                {/* Nome */}
                <div>
                  <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
                    Nome completo
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="displayName"
                      name="displayName"
                      type="text"
                      required={!isLogin}
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      placeholder="Digite seu nome completo"
                    />
                  </div>
                </div>

                {/* Categoria */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                    Tipo de conta
                  </label>
                  <div className="mt-1 relative">
                    <select
                      id="category"
                      name="category"
                      required={!isLogin}
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    >
                      <option value={FIREBASE_CONFIG.USER_CATEGORIES.USER}>
                        Usuário
                      </option>
                      <option value={FIREBASE_CONFIG.USER_CATEGORIES.COMPANY}>
                        Empresa
                      </option>
                      <option value={FIREBASE_CONFIG.USER_CATEGORIES.ADMIN}>
                        Administrador
                      </option>
                      <option value={FIREBASE_CONFIG.USER_CATEGORIES.OWNER}>
                        Proprietário
                      </option>
                    </select>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      {getCategoryIcon(category)}
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {getCategoryLabel(category)} - {category === FIREBASE_CONFIG.USER_CATEGORIES.OWNER ? 'Acesso total ao sistema' : 'Acesso limitado às funcionalidades'}
                  </p>
                </div>
              </>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Digite seu email"
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 pl-10 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Digite sua senha"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirmar Senha (apenas no registro) */}
            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirmar senha
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required={!isLogin}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Confirme sua senha"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                isLogin ? 'Entrar' : 'Criar conta'
              )}
            </button>
          </div>

          {/* Toggle Login/Register */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                // setError(null); // This line was not in the original file, so it's removed.
                setEmail('');
                setPassword('');
                setDisplayName('');
                setCategory(FIREBASE_CONFIG.USER_CATEGORIES.USER);
                setConfirmPassword('');
              }}
              className="text-sm text-blue-600 hover:text-blue-500 transition-colors duration-200"
            >
              {isLogin 
                ? 'Não tem uma conta? Clique aqui para criar' 
                : 'Já tem uma conta? Clique aqui para entrar'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
