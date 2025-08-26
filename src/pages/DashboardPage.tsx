import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import CSVImportComponent from '../components/CSVImportComponent';
import {
  BarChart3,
  Users,
  Building,
  UserPlus,
  MessageSquare,
  Image,
  FileText,
  Package,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  Upload,
  TrendingUp,
  Activity,
  Zap,
  Clock,
  Star,
  ArrowUpRight,
  Bot,
  Sparkles,
  Globe,
  Shield,
  Bell,
  Search,
  Filter,
  Plus,
  Calendar,
  Target,
  Phone,
  Mail,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Client } from '../types';

const DashboardPage: React.FC = () => {
  const { user, userCategory, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [activeSubSection, setActiveSubSection] = useState('');
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [importedClients, setImportedClients] = useState<Client[]>([]);

  const handleImportComplete = (clients: Client[]) => {
    setImportedClients(clients);
    setActiveSection('clients');
    setActiveSubSection('clients-list');
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleNavigation = (sectionId: string, subSectionId?: string) => {
    setActiveSection(sectionId);
    if (subSectionId) {
      setActiveSubSection(subSectionId);
    } else {
      setActiveSubSection('');
    }
    setSidebarOpen(false);
  };

  const navigationItems = [
    { id: 'overview', label: 'Visão Geral', icon: BarChart3, gradient: 'from-blue-500 to-cyan-500' },
    { 
      id: 'users', 
      label: 'Usuários', 
      icon: Users, 
      adminOnly: true, 
      gradient: 'from-purple-500 to-pink-500',
      subItems: [
        { id: 'users-create', label: 'Cadastrar Usuário', icon: UserPlus },
        { id: 'users-list', label: 'Lista Usuários', icon: Users }
      ]
    },
    { 
      id: 'companies', 
      label: 'Empresas', 
      icon: Building, 
      adminOnly: true, 
      gradient: 'from-green-500 to-emerald-500',
      subItems: [
        { id: 'companies-create', label: 'Cadastrar Empresa', icon: Building },
        { id: 'companies-list', label: 'Lista Empresas', icon: Building }
      ]
    },
    { 
      id: 'credits', 
      label: 'Créditos', 
      icon: Star, 
      gradient: 'from-amber-500 to-yellow-500',
      subItems: [
        { id: 'credits-plans', label: 'Planos', icon: CreditCard },
        { id: 'credits-recharge', label: 'Recargas', icon: TrendingUp }
      ]
    },
    { 
      id: 'clients', 
      label: 'Clientes', 
      icon: UserPlus, 
      gradient: 'from-orange-500 to-red-500',
      subItems: [
        { id: 'clients-create', label: 'Cadastrar Clientes', icon: UserPlus },
        { id: 'clients-list', label: 'Lista de Clientes', icon: Users }
      ]
    },
    { 
      id: 'groups', 
      label: 'Grupos', 
      icon: Target, 
      gradient: 'from-indigo-500 to-purple-500',
      subItems: [
        { id: 'groups-create', label: 'Cadastrar Grupos', icon: Target },
        { id: 'groups-list', label: 'Lista de Grupos', icon: Target }
      ]
    },
    { 
      id: 'campaigns', 
      label: 'Campanhas', 
      icon: MessageSquare, 
      gradient: 'from-pink-500 to-rose-500',
      subItems: [
        { id: 'campaigns-create', label: 'Cadastrar Campanhas', icon: MessageSquare },
        { id: 'campaigns-send', label: 'Disparar Campanhas', icon: TrendingUp }
      ]
    },
    { 
      id: 'advertising', 
      label: 'Publicidade', 
      icon: Sparkles, 
      gradient: 'from-yellow-500 to-orange-500',
      subItems: [
        { id: 'advertising-images', label: 'Gerador de Imagens', icon: Image },
        { id: 'advertising-videos', label: 'Gerador de Vídeos', icon: Image }
      ]
    },
    { 
      id: 'ai-agents', 
      label: 'Agentes de IA', 
      icon: Bot, 
      gradient: 'from-cyan-500 to-blue-500',
      subItems: [
        { id: 'ai-agents-whatsapp', label: 'WhatsApp', icon: MessageSquare },
        { id: 'ai-agents-voice', label: 'Voz', icon: Phone },
        { id: 'ai-agents-sms', label: 'SMS', icon: MessageSquare },
        { id: 'ai-agents-email', label: 'Email', icon: Mail }
      ]
    },
    { 
      id: 'documents', 
      label: 'Documentos', 
      icon: FileText, 
      gradient: 'from-gray-500 to-slate-500',
      subItems: [
        { id: 'documents-templates', label: 'Modelos', icon: FileText },
        { id: 'documents-signed', label: 'Assinados', icon: FileText }
      ]
    },
    { 
      id: 'inventory', 
      label: 'Inventário', 
      icon: Package, 
      gradient: 'from-teal-500 to-green-500',
      subItems: [
        { id: 'inventory-products', label: 'Produtos', icon: Package },
        { id: 'inventory-services', label: 'Serviços', icon: Package }
      ]
    },
    { 
      id: 'payments', 
      label: 'Pagamentos', 
      icon: CreditCard, 
      gradient: 'from-emerald-500 to-teal-500',
      subItems: [
        { id: 'payments-my-payments', label: 'Meus Pagamentos', icon: CreditCard },
        { id: 'payments-invoices', label: 'Minhas Notas Fiscais', icon: CreditCard }
      ]
    },
    { 
      id: 'integrations', 
      label: 'Integrações', 
      icon: Globe, 
      gradient: 'from-violet-500 to-purple-500',
      subItems: [
        { id: 'integrations-my-integrations', label: 'Minhas Integrações', icon: Globe }
      ]
    },
    { id: 'csv-import', label: 'Importar CSV', icon: Upload, gradient: 'from-blue-500 to-indigo-500' },
  ];

  const isAdmin = userCategory === 'proprietario';

  // Dados de demonstração
  const stats = [
    { 
      label: 'Total de Clientes', 
      value: '1,234', 
      change: '+12%', 
      trend: 'up',
      icon: Users,
      gradient: 'from-blue-500 to-cyan-500'
    },
    { 
      label: 'Campanhas Ativas', 
      value: '8', 
      change: '+2', 
      trend: 'up',
      icon: Activity,
      gradient: 'from-green-500 to-emerald-500'
    },
    { 
      label: 'Agentes de IA', 
      value: '15', 
      change: '+3', 
      trend: 'up',
      icon: Bot,
      gradient: 'from-purple-500 to-pink-500'
    },
    { 
      label: 'Créditos Restantes', 
      value: '150', 
      change: '-25', 
      trend: 'down',
      icon: Star,
      gradient: 'from-orange-500 to-red-500'
    },
  ];

  const recentActivities = [
    { id: 1, action: 'Campanha "Black Friday" iniciada', time: '2h atrás', icon: MessageSquare, color: 'text-green-600' },
    { id: 2, action: '50 novos clientes importados', time: '4h atrás', icon: UserPlus, color: 'text-blue-600' },
    { id: 3, action: 'Agente WhatsApp configurado', time: '6h atrás', icon: Bot, color: 'text-purple-600' },
    { id: 4, action: 'Pagamento de R$ 500 processado', time: '1d atrás', icon: CreditCard, color: 'text-emerald-600' },
  ];

  const quickActions = [
    { 
      label: 'Criar Nova Campanha', 
      description: 'Configure e dispare campanhas automatizadas',
      icon: Plus,
      gradient: 'from-blue-500 to-purple-500',
      onClick: () => setActiveSection('campaigns')
    },
    { 
      label: 'Importar Clientes', 
      description: 'Importe clientes via CSV rapidamente',
      icon: Upload,
      gradient: 'from-green-500 to-emerald-500',
      onClick: () => setActiveSection('csv-import')
    },
    { 
      label: 'Novo Agente IA', 
      description: 'Crie agentes inteligentes personalizados',
      icon: Bot,
      gradient: 'from-purple-500 to-pink-500',
      onClick: () => setActiveSection('ai-agents')
    },
    { 
      label: 'Gerar Conteúdo', 
      description: 'Use IA para criar imagens e vídeos',
      icon: Sparkles,
      gradient: 'from-orange-500 to-red-500',
      onClick: () => setActiveSection('advertising')
    },
  ];

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Header com boas-vindas */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2">
            Bem-vindo, {user?.name || 'Usuário'} ! 👋
          </h1>
          <p className="text-blue-100 text-lg">
            Você está logado como <span className="font-semibold">{userCategory === 'proprietario' ? 'Proprietário' : 'Empresa'}</span>. 
            Você tem acesso total a todas as funcionalidades.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-16 -translate-x-16"></div>
      </div>

      {/* Ações Rápidas e Atividades */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Ações Rápidas */}
        <div className="card">
          <div className="flex items-center mb-6">
            <Zap className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-bold text-gray-900">Ações Rápidas</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <button
                  key={index}
                  onClick={action.onClick}
                  className="p-4 rounded-xl border border-gray-200 hover:border-gray-300 bg-gradient-to-br from-white to-gray-50 hover:shadow-lg transition-all duration-300 text-left group"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${action.gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{action.label}</h3>
                  <p className="text-gray-600 text-sm">{action.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Atividades Recentes */}
        <div className="card">
          <div className="flex items-center mb-6">
            <Clock className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-bold text-gray-900">Atividades Recentes</h2>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity) => {
              const IconComponent = activity.icon;
              return (
                <div key={activity.id} className="activity-item">
                  <div className={`p-2 rounded-lg bg-gray-100 ${activity.color}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium">{activity.action}</p>
                    <p className="text-gray-500 text-sm">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <button className="w-full mt-4 py-2 px-4 text-blue-600 font-semibold hover:bg-blue-50 rounded-lg transition-colors duration-200">
            Ver todas as atividades
          </button>
        </div>
      </div>
    </div>
  );

  const renderClientsList = () => (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Users className="w-6 h-6 text-blue-600 mr-3" />
          <h2 className="text-xl font-bold text-gray-900">Clientes</h2>
        </div>
        <button 
          onClick={() => setActiveSection('csv-import')}
          className="btn-primary"
        >
          <Upload className="w-4 h-4 mr-2" />
          Importar CSV
        </button>
      </div>
      
      {importedClients.length > 0 ? (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-green-800 font-semibold">
              ✅ {importedClients.length} clientes importados com sucesso!
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Nome</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">CPF</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Telefone</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Grupo</th>
                </tr>
              </thead>
              <tbody>
                {importedClients.slice(0, 10).map((client, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-900">{client.name}</td>
                    <td className="py-3 px-4 text-gray-600">{client.cpf}</td>
                    <td className="py-3 px-4 text-gray-600">{client.phone}</td>
                    <td className="py-3 px-4 text-gray-600">{client.email || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-lg text-sm font-medium">
                        {client.group || 'Sem grupo'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {importedClients.length > 10 && (
            <p className="text-gray-600 text-center">
              Mostrando 10 de {importedClients.length} clientes. 
              <button className="text-blue-600 hover:underline ml-1">Ver todos</button>
            </p>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum cliente encontrado</h3>
          <p className="text-gray-600 mb-6">Comece importando seus clientes via CSV</p>
          <button 
            onClick={() => setActiveSection('csv-import')}
            className="btn-primary"
          >
            Importar Clientes
          </button>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverview();
      case 'clients':
        return renderClientsList();
      case 'csv-import':
        return (
          <div className="card">
            <div className="flex items-center mb-6">
              <Upload className="w-6 h-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">Importar Clientes via CSV</h2>
            </div>
            <CSVImportComponent onImportComplete={handleImportComplete} />
          </div>
        );
      default:
        return (
          <div className="card text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {navigationItems.find(item => item.id === activeSection)?.label}
            </h3>
            <p className="text-gray-600">Esta seção está em desenvolvimento.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 m-0 p-0">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold gradient-text">Plataforma IA</h1>
                <p className="text-gray-500 text-sm">Agentes Inteligentes</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navigationItems
              .filter(item => !item.adminOnly || isAdmin)
              .map((item) => {
                const IconComponent = item.icon;
                const isExpanded = expandedSections.includes(item.id);
                                  return (
                    <div key={item.id}>
                      <button
                        onClick={() => {
                          if (item.subItems && item.subItems.length > 0) {
                            toggleSection(item.id);
                          } else {
                            handleNavigation(item.id);
                          }
                        }}
                        className={`sidebar-item w-full group flex items-center justify-between ${
                          activeSection === item.id ? 'active' : ''
                        }`}
                      >
                        <div className="flex items-center">
                          <IconComponent className="w-5 h-5 mr-3" />
                          <span className="font-medium">{item.label}</span>
                        </div>
                        {item.subItems && item.subItems.length > 0 && (
                          <ChevronDown className={`w-4 h-4 transition-transform duration-300 text-gray-400 ${
                            isExpanded ? 'rotate-180' : ''
                          }`} />
                        )}
                      </button>
                      {isExpanded && item.subItems && item.subItems.length > 0 && (
                        <div className="ml-6 mt-2 space-y-1 border-l-2 border-gray-100 pl-4">
                          {item.subItems.map((subItem) => {
                            const SubIconComponent = subItem.icon;
                            return (
                              <button
                                key={subItem.id}
                                onClick={() => handleNavigation(item.id, subItem.id)}
                                className={`sidebar-item w-full group flex items-center text-sm py-2 px-3 rounded-lg transition-colors duration-200 ${
                                  activeSubSection === subItem.id 
                                    ? 'bg-blue-100 text-blue-800 font-semibold' 
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                              >
                                <SubIconComponent className="w-4 h-4 mr-3" />
                                <span className="font-medium">{subItem.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                );
              })}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-semibold text-gray-900">{user?.name || 'Usuário Teste'}</p>
                <p className="text-xs text-gray-500 flex items-center">
                  <Star className="w-3 h-3 mr-1" />
                  Créditos: 150
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors duration-200"
            >
              <LogOut className="w-4 h-4 mr-3" />
              <span className="font-medium">Sair</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Top Bar */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40 m-0">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors duration-200"
                >
                  {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
                <div className="ml-4 lg:ml-0">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {navigationItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
                  </h1>
                  <p className="text-gray-600">
                    {new Date().toLocaleDateString('pt-BR', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <button className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors duration-200 relative">
                  <Bell className="w-6 h-6" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    3
                  </span>
                </button>
                <button className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors duration-200">
                  <Search className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Fixed Stats Bar */}
        <div className="bg-white border-b border-gray-200 sticky top-16 z-30 px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="flex items-center bg-gradient-to-r from-gray-50 to-white rounded-xl p-3 border border-gray-100 hover:shadow-md transition-all duration-200">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.gradient} mr-3`}>
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-bold text-gray-900">{stat.value}</div>
                    <div className="text-xs text-gray-600 font-medium">{stat.label}</div>
                  </div>
                  <div className={`flex items-center text-xs font-semibold ${
                    stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Page Content */}
        <main className="px-6 pb-6 pt-6">
          {/* Overview Section - Always visible */}
          <div className="space-y-8 mb-8">
            {/* Header com boas-vindas */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <h1 className="text-4xl font-bold mb-2">
                  Bem-vindo, {user?.name || 'Usuário'} ! 👋
                </h1>
                <p className="text-blue-100 text-lg">
                  Você está logado como <span className="font-semibold">{userCategory === 'proprietario' ? 'Proprietário' : 'Empresa'}</span>. 
                  Você tem acesso total a todas as funcionalidades.
                </p>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-16 -translate-x-16"></div>
            </div>

            {/* Ações Rápidas e Atividades */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Ações Rápidas */}
              <div className="card">
                <div className="flex items-center mb-6">
                  <Zap className="w-6 h-6 text-blue-600 mr-3" />
                  <h2 className="text-xl font-bold text-gray-900">Ações Rápidas</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {quickActions.map((action, index) => {
                    const IconComponent = action.icon;
                    return (
                      <button
                        key={index}
                        onClick={action.onClick}
                        className="p-4 rounded-xl border border-gray-200 hover:border-gray-300 bg-gradient-to-br from-white to-gray-50 hover:shadow-lg transition-all duration-300 text-left group"
                      >
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${action.gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">{action.label}</h3>
                        <p className="text-gray-600 text-sm">{action.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Atividades Recentes */}
              <div className="card">
                <div className="flex items-center mb-6">
                  <Clock className="w-6 h-6 text-blue-600 mr-3" />
                  <h2 className="text-xl font-bold text-gray-900">Atividades Recentes</h2>
                </div>
                <div className="space-y-4">
                  {recentActivities.map((activity) => {
                    const IconComponent = activity.icon;
                    return (
                      <div key={activity.id} className="activity-item">
                        <div className={`p-2 rounded-lg bg-gray-100 ${activity.color}`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-900 font-medium">{activity.action}</p>
                          <p className="text-gray-500 text-sm">{activity.time}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <button className="w-full mt-4 py-2 px-4 text-blue-600 font-semibold hover:bg-blue-50 rounded-lg transition-colors duration-200">
                  Ver todas as atividades
                </button>
              </div>
            </div>
          </div>

          {/* Dynamic Content */}
          {activeSection !== 'overview' && renderContent()}
        </main>
      </div>

      {/* Sidebar Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardPage;