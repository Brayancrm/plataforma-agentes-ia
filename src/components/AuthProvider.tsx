import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';
import { FIREBASE_CONFIG } from '../config/firebaseConfig';

interface AuthContextType {
  user: any;
  userProfile: any;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string, category: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (updates: any) => Promise<void>;
  isOwner: boolean;
  isAdmin: boolean;
  isCompany: boolean;
  isUser: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { 
    user, 
    loading: authLoading, 
    error: authError, 
    login: firebaseLogin, 
    register: firebaseRegister, 
    logout: firebaseLogout, 
    resetPassword: firebaseResetPassword, 
    updateUserProfile: firebaseUpdateProfile 
  } = useFirebaseAuth();
  
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Computed properties para verificar tipos de usuário
  const isOwner = userProfile?.category === FIREBASE_CONFIG.USER_CATEGORIES.OWNER;
  const isAdmin = userProfile?.category === FIREBASE_CONFIG.USER_CATEGORIES.ADMIN;
  const isCompany = userProfile?.category === FIREBASE_CONFIG.USER_CATEGORIES.COMPANY;
  const isUser = userProfile?.category === FIREBASE_CONFIG.USER_CATEGORIES.USER;

  // Carregar perfil do usuário baseado nos dados salvos
  useEffect(() => {
    if (user) {
      console.log('🔍 AuthProvider - Carregando perfil para:', user.email);
      
      // Buscar dados do usuário no localStorage
      const savedUsers = localStorage.getItem('dashboardUsers');
      let userData = null;
      
      if (savedUsers) {
        try {
          const users = JSON.parse(savedUsers);
          userData = users.find((u: any) => u.email === user.email);
          console.log('👤 Dados encontrados no localStorage:', userData);
        } catch (error) {
          console.error('Erro ao carregar dados do localStorage:', error);
        }
      }
      
      // Criar perfil baseado nos dados salvos ou padrão
      const basicProfile = {
        id: user.uid,
        name: user.displayName || userData?.name || 'Usuário',
        email: user.email,
        category: userData?.category || 'proprietario', // Definir como proprietário por padrão
        credits: userData?.credits || 10,
        visibleSections: userData?.visibleSections || [
          'overview', 'usuarios', 'companies', 'creditos', 'clients', 'groups', 
          'campaigns', 'publicidade', 'ai-agents', 'documents', 'inventory', 
          'payments', 'integrations'
        ],
        createdAt: userData?.createdAt || new Date(),
        updatedAt: new Date()
      };
      
      console.log('📊 Perfil criado:', basicProfile);
      console.log('🔍 FIREBASE_CONFIG:', FIREBASE_CONFIG);
      setUserProfile(basicProfile);
      setLoading(false);
    } else {
      // Usuário não autenticado
      setUserProfile(null);
      setLoading(false);
    }
  }, [user]);

  // Atualizar loading state
  useEffect(() => {
    setLoading(authLoading);
  }, [authLoading]);

  // Atualizar error state
  useEffect(() => {
    setError(authError);
  }, [authError]);

  // Função de login
  const login = async (email: string, password: string) => {
    try {
      setError(null);
      await firebaseLogin(email, password);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Função de registro
  const register = async (email: string, password: string, displayName: string, category: string) => {
    try {
      setError(null);
      
      // Registrar no Firebase Auth
      await firebaseRegister(email, password, displayName);
      
      // Perfil será criado automaticamente no useEffect acima
      
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Função de logout
  const logout = async () => {
    try {
      setError(null);
      await firebaseLogout();
      setUserProfile(null);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Função de reset de senha
  const resetPassword = async (email: string) => {
    try {
      setError(null);
      await firebaseResetPassword(email);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Função de atualização de perfil
  const updateUserProfile = async (updates: any) => {
    try {
      setError(null);
      
      if (userProfile) {
        // Atualizar perfil local
        const updatedProfile = { ...userProfile, ...updates, updatedAt: new Date() };
        setUserProfile(updatedProfile);
        
        // Atualizar no Firebase Auth se necessário
        if (updates.displayName) {
          await firebaseUpdateProfile({ displayName: updates.displayName });
        }
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    error,
    login,
    register,
    logout,
    resetPassword,
    updateUserProfile,
    isOwner,
    isAdmin,
    isCompany,
    isUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
