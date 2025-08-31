import React from 'react';
import { AuthProvider } from './components/AuthProvider';
import DashboardPage from './pages/DashboardPage';
import { LoginPage } from './components/LoginPage';
import { useAuth } from './components/AuthProvider';
import './index.css';

// Componente principal que decide se mostra login ou dashboard
const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return <DashboardPage />;
};

// App principal com AuthProvider
const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
