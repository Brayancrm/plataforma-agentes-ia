import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../components/AuthProvider';
import { useFirestore } from '../hooks/useFirestore';
import { useFirebaseStorage } from '../hooks/useFirebaseStorage';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../config/firebase';
import {
  Building2, Plus, Search, Edit, Trash2, User, Users, CreditCard,
  Settings, ChevronRight, ChevronDown, Menu, X, Upload, Download, 
  Eye, EyeOff, UserPlus, Users as ClientsIcon, FolderOpen, 
  Megaphone, Bot, FileText, Package, CreditCard as PaymentsIcon,
  Settings as IntegrationsIcon, Image, Video, Zap, Loader, Globe
} from 'lucide-react';

// Interfaces
interface UserProfile {
  id: string;
  name: string;
  email: string;
  category: 'proprietario' | 'admin' | 'empresa' | 'usuario';
  credits: number;
  visibleSections: string[];
  createdAt: string;
  updatedAt: string;
}

interface Company {
  id: number;
  name: string;
  cnpj: string;
  email: string;
  phone: string;
  ownerEmail: string;
  createdAt: string;
  updatedAt: string;
}

interface Plan {
  id: number;
  name: string;
  price: number;
  credits: number;
  description: string;
  createdAt: string;
}

interface Client {
  id: number;
  name: string;
  cpf: string;
  phone: string;
  additionalFields: Record<string, any>;
  groupId?: number;
  createdAt: string;
}

const DashboardPage: React.FC = () => {
  const { user, userProfile, logout } = useAuth();
  const { createDocument, updateDocument, getDocuments, deleteDocument } = useFirestore();
  const { uploadFile } = useFirebaseStorage();

  // Estados principais
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [activeSubSection, setActiveSubSection] = useState('');

  // Estados para usuários
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [searchUser, setSearchUser] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Estados para empresas
  const [companies, setCompanies] = useState<Company[]>([]);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [searchCompany, setSearchCompany] = useState('');
  const [showCompanyDeleteConfirm, setShowCompanyDeleteConfirm] = useState<number | null>(null);

  // Estados para planos
  const [plans, setPlans] = useState<Plan[]>([]);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [searchPlan, setSearchPlan] = useState('');

  // Estados para clientes
  const [clients, setClients] = useState<Client[]>([]);
  const [showClientForm, setShowClientForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [searchClient, setSearchClient] = useState('');

  // Estados do modal de perfil
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);

  // Função para gerar ID único
  const generateUniqueId = () => {
    return Date.now() + Math.random();
  };

  // Navegação
  const navigationItems = [
    { id: 'overview', label: 'Visão Geral', icon: User },
    { id: 'usuarios', label: 'Usuários', icon: Users },
    { id: 'companies', label: 'Empresas', icon: Building2 },
    { id: 'creditos', label: 'Créditos', icon: CreditCard, subItems: [
      { id: 'plans', label: 'Planos' },
      { id: 'recharges', label: 'Recargas' }
    ]},
    { id: 'clients', label: 'Clientes', icon: ClientsIcon },
    { id: 'groups', label: 'Grupos', icon: FolderOpen },
    { id: 'campaigns', label: 'Campanhas', icon: Megaphone },
    { id: 'publicidade', label: 'Publicidade', icon: Zap, subItems: [
      { id: 'images', label: 'Gerar Imagens' },
      { id: 'videos', label: 'Gerar Vídeos' }
    ]},
    { id: 'ai-agents', label: 'Agentes IA', icon: Bot },
    { id: 'documents', label: 'Documentos', icon: FileText },
    { id: 'inventory', label: 'Estoque', icon: Package },
    { id: 'payments', label: 'Pagamentos', icon: PaymentsIcon },
    { id: 'integrations', label: 'Integrações', icon: IntegrationsIcon }
  ];

  // Filtrar itens baseado nas permissões do usuário
  const getVisibleNavigationItems = () => {
    if (!userProfile) return [];
    
    if (userProfile.category === 'proprietario') {
      return navigationItems;
    }
    
    return navigationItems.filter(item => 
      userProfile.visibleSections.includes(item.id)
    );
  };

  // Carregar dados do localStorage
  useEffect(() => {
    const loadData = () => {
      // Carregar usuários
      const savedUsers = localStorage.getItem('dashboardUsers');
      if (savedUsers) {
        try {
          setUsers(JSON.parse(savedUsers));
        } catch (error) {
          console.error('Erro ao carregar usuários:', error);
          setUsers([]);
        }
      }

      // Carregar empresas
      const savedCompanies = localStorage.getItem('dashboardCompanies');
      if (savedCompanies) {
        try {
          const allCompanies = JSON.parse(savedCompanies);
          // Filtrar empresas do usuário atual
          const userCompanies = allCompanies.filter((company: Company) => 
            company.ownerEmail === user?.email
          );
          setCompanies(userCompanies);
        } catch (error) {
          console.error('Erro ao carregar empresas:', error);
          setCompanies([]);
        }
      }

      // Carregar planos
      const savedPlans = localStorage.getItem('dashboardPlans');
      if (savedPlans) {
        try {
          setPlans(JSON.parse(savedPlans));
        } catch (error) {
          console.error('Erro ao carregar planos:', error);
          setPlans([]);
        }
      }

      // Carregar clientes
      const savedClients = localStorage.getItem('dashboardClients');
      if (savedClients) {
        try {
          setClients(JSON.parse(savedClients));
        } catch (error) {
          console.error('Erro ao carregar clientes:', error);
          setClients([]);
        }
      }
    };

    loadData();
  }, [user]);

  // Funções para usuários
  const openUserForm = (user?: UserProfile) => {
    if (user) {
      setEditingUser({ ...user });
    } else {
      setEditingUser({
        id: '',
        name: '',
        email: '',
        category: 'usuario',
        credits: 10,
        visibleSections: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    setShowUserForm(true);
  };

  const handleUserFormChange = (field: string, value: any) => {
    setEditingUser(prev => {
      if (!prev) {
        return {
          id: '',
          name: '',
          email: '',
          category: 'usuario' as const,
          credits: 10,
          visibleSections: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          [field]: value
        };
      }
      return { ...prev, [field]: value };
    });
  };

  const saveUser = async () => {
    if (!editingUser) return;

    if (!editingUser.name || !editingUser.email) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      if (editingUser.id) {
        // Editando usuário existente
        const updatedUser = { 
          ...editingUser, 
          updatedAt: new Date().toISOString() 
        };
        
        setUsers(prev => prev.map(user =>
          user.id === editingUser.id ? updatedUser : user
        ));
        
        // Salvar no localStorage
        const currentUsers = JSON.parse(localStorage.getItem('dashboardUsers') || '[]');
        const updatedUsers = currentUsers.map((u: UserProfile) => 
          u.id === editingUser.id ? updatedUser : u
        );
        localStorage.setItem('dashboardUsers', JSON.stringify(updatedUsers));
        
        alert('Usuário atualizado com sucesso!');
      } else {
        // Criando novo usuário
        try {
          // Criar usuário no Firebase Auth
          const userCredential = await createUserWithEmailAndPassword(
            auth,
            editingUser.email,
            'senha123' // Senha padrão
          );

          // Atualizar perfil do usuário
          await updateProfile(userCredential.user, {
            displayName: editingUser.name
          });

          const newUser = {
            ...editingUser,
            id: userCredential.user.uid,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          // Salvar dados do usuário no Firestore
          await createDocument('usuarios', newUser);

          // Atualizar estado local
          setUsers(prev => [...prev, newUser]);
          
          // Salvar no localStorage
          const currentUsers = JSON.parse(localStorage.getItem('dashboardUsers') || '[]');
          currentUsers.push(newUser);
          localStorage.setItem('dashboardUsers', JSON.stringify(currentUsers));

          alert('Usuário criado com sucesso!');
        } catch (error: any) {
          console.error('Erro ao criar usuário:', error);
          alert(`Erro ao criar usuário: ${error.message}`);
          return;
        }
      }

      setEditingUser(null);
      setShowUserForm(false);
      setActiveSubSection('users-list');
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      alert('Erro ao salvar usuário');
    }
  };

  const deleteUser = (userId: string) => {
    setShowDeleteConfirm(userId);
  };

  const confirmDeleteUser = async () => {
    if (showDeleteConfirm) {
      try {
        // Deletar do Firebase
        await deleteDocument('usuarios', showDeleteConfirm);

        // Atualizar estado local
        setUsers(prev => prev.filter(user => user.id !== showDeleteConfirm));
        
        // Atualizar localStorage
        const currentUsers = JSON.parse(localStorage.getItem('dashboardUsers') || '[]');
        const updatedUsers = currentUsers.filter((u: UserProfile) => u.id !== showDeleteConfirm);
        localStorage.setItem('dashboardUsers', JSON.stringify(updatedUsers));

        alert('Usuário excluído com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        alert('Erro ao excluir usuário');
      }
      
      setShowDeleteConfirm(null);
    }
  };

  // Função para corrigir permissões de usuários existentes
  const fixUserPermissions = () => {
    const currentUsers = JSON.parse(localStorage.getItem('dashboardUsers') || '[]');
    const updatedUsers = currentUsers.map((user: UserProfile) => {
      if (user.category === 'proprietario') {
        return {
          ...user,
          visibleSections: navigationItems.map(item => item.id)
        };
      }
      return user;
    });
    
    localStorage.setItem('dashboardUsers', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
    alert('Permissões corrigidas com sucesso!');
  };

  // Funções para empresas
  const openCompanyForm = (company?: Company) => {
    if (company) {
      setEditingCompany({ ...company });
    } else {
      setEditingCompany({
        id: 0,
        name: '',
        cnpj: '',
        email: '',
        phone: '',
        ownerEmail: user?.email || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    setShowCompanyForm(true);
  };

  const handleCompanyFormChange = (field: string, value: string) => {
    setEditingCompany(prev => {
      if (!prev) {
        return {
          id: 0,
          name: '',
          cnpj: '',
          email: '',
          phone: '',
          ownerEmail: user?.email || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          [field]: value
        };
      }
      return { ...prev, [field]: value };
    });
  };

  const saveCompany = () => {
    if (!editingCompany) return;

    if (!editingCompany.name || !editingCompany.cnpj || !editingCompany.email || !editingCompany.phone) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (editingCompany.id) {
      // Editando empresa existente
      const updatedCompany = { 
        ...editingCompany,
        // GARANTIR que a empresa continue pertencendo ao usuário atual
        ownerEmail: user?.email || editingCompany.ownerEmail,
        updatedAt: new Date().toISOString()
      };
      
      setCompanies(prev => prev.map(company =>
        company.id === editingCompany.id ? updatedCompany : company
      ));
      
      // Salvar no localStorage
      const currentCompanies = JSON.parse(localStorage.getItem('dashboardCompanies') || '[]');
      const updatedCompanies = currentCompanies.map((c: Company) => 
        c.id === editingCompany.id ? updatedCompany : c
      );
      localStorage.setItem('dashboardCompanies', JSON.stringify(updatedCompanies));
      
      alert('Empresa atualizada com sucesso!');
    } else {
      // Criando nova empresa
      const newCompany = {
        ...editingCompany,
        id: generateUniqueId(),
        // IMPORTANTE: Definir o usuário atual como proprietário
        ownerEmail: user?.email || 'unknown',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setCompanies(prev => [...prev, newCompany]);
      
      // Salvar no localStorage
      const currentCompanies = JSON.parse(localStorage.getItem('dashboardCompanies') || '[]');
      currentCompanies.push(newCompany);
      localStorage.setItem('dashboardCompanies', JSON.stringify(currentCompanies));
      
      alert('Empresa criada com sucesso!');
    }

    setEditingCompany(null);
    setShowCompanyForm(false);
    setActiveSubSection('companies-list');
  };

  const editCompany = (company: Company) => {
    openCompanyForm(company);
  };

  const deleteCompany = (companyId: number) => {
    // VERIFICAR se a empresa pertence ao usuário atual
    const companyToDelete = companies.find(c => c.id === companyId);
    if (!companyToDelete) {
      alert('❌ Empresa não encontrada');
      return;
    }
    
    if (companyToDelete.ownerEmail !== user?.email) {
      alert('❌ Você não tem permissão para excluir esta empresa');
      return;
    }
    
    setShowCompanyDeleteConfirm(companyId);
  };

  const confirmDeleteCompany = () => {
    if (showCompanyDeleteConfirm) {
      // VERIFICAR novamente a propriedade antes de excluir
      const companyToDelete = companies.find(c => c.id === showCompanyDeleteConfirm);
      if (!companyToDelete || companyToDelete.ownerEmail !== user?.email) {
        alert('❌ Você não tem permissão para excluir esta empresa');
        setShowCompanyDeleteConfirm(null);
        return;
      }
      
      setCompanies(prev => prev.filter(company => company.id !== showCompanyDeleteConfirm));
      
      // Remover do localStorage
      const currentCompanies = JSON.parse(localStorage.getItem('dashboardCompanies') || '[]');
      const updatedCompanies = currentCompanies.filter((c: Company) => c.id !== showCompanyDeleteConfirm);
      localStorage.setItem('dashboardCompanies', JSON.stringify(updatedCompanies));
      
      alert('Empresa excluída com sucesso!');
      setShowCompanyDeleteConfirm(null);
    }
  };

  // Verificar se o usuário é proprietário da empresa
  const isCompanyOwner = (company: Company) => {
    return company.ownerEmail === user?.email;
  };

  // Função para limpar dados antigos
  const clearOldData = () => {
    // Salvar dados do usuário atual antes de limpar
    const currentUserProfile = localStorage.getItem('userProfile');
    const currentAuthUser = localStorage.getItem('authUser');
    const currentUserVisibleSections = localStorage.getItem('userVisibleSections');
    const currentUserCategory = localStorage.getItem('userCategory');
    
    // Limpar outros dados
    const keysToKeep = ['userProfile', 'authUser', 'userVisibleSections', 'userCategory'];
    const allKeys = Object.keys(localStorage);
    
    allKeys.forEach(key => {
      if (!keysToKeep.includes(key)) {
        localStorage.removeItem(key);
      }
    });
    
    // Restaurar dados do usuário
    if (currentUserProfile) localStorage.setItem('userProfile', currentUserProfile);
    if (currentAuthUser) localStorage.setItem('authUser', currentAuthUser);
    if (currentUserVisibleSections) localStorage.setItem('userVisibleSections', currentUserVisibleSections);
    if (currentUserCategory) localStorage.setItem('userCategory', currentUserCategory);
    
    // Resetar estados
    setUsers([]);
    setCompanies([]);
    setPlans([]);
    setClients([]);
    
    alert('Cache limpo com sucesso!');
  };

  // Upload de foto do perfil
  const handlePhotoUpload = async (file: File) => {
    if (!user) return;

    try {
      setProfileLoading(true);
      const path = `usuarios/${user.uid}/avatar.jpg`;
      const result = await uploadFile(file, path);
      
      if (result.url) {
        // Atualizar perfil do usuário
        await updateProfile(user, { photoURL: result.url });
        setProfilePhotoPreview(result.url);
        alert('Foto atualizada com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      alert('Erro ao atualizar foto');
    } finally {
      setProfileLoading(false);
    }
  };

  // Renderizar conteúdo baseado na seção ativa
  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverview();
      case 'usuarios':
        if (activeSubSection === 'users-form' || showUserForm) {
          return renderUserForm();
        } else {
          return renderUsersList();
        }
      case 'companies':
        if (activeSubSection === 'companies-form' || showCompanyForm) {
          return renderCompanyForm();
        } else {
          return renderCompaniesList();
        }
      case 'creditos':
        if (activeSubSection === 'plans') {
          return renderPlans();
        } else if (activeSubSection === 'recharges') {
          return renderRecharges();
        } else {
          return renderCreditsOverview();
        }
      case 'clients':
        return renderClients();
      case 'groups':
        return renderGroups();
      case 'campaigns':
        return renderCampaigns();
      case 'publicidade':
        if (activeSubSection === 'images') {
          return renderImageGeneration();
        } else if (activeSubSection === 'videos') {
          return renderVideoGeneration();
        } else {
          return renderPublicityOverview();
        }
      case 'ai-agents':
        return renderAiAgents();
      case 'documents':
        return renderDocuments();
      case 'inventory':
        return renderInventory();
      case 'payments':
        return renderPayments();
      case 'integrations':
        return renderIntegrations();
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

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total de Usuários</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              <p className="text-sm text-green-600">+{users.filter(u => {
                const created = new Date(u.createdAt);
                const lastWeek = new Date();
                lastWeek.setDate(lastWeek.getDate() - 7);
                return created > lastWeek;
              }).length} esta semana</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Building2 className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Empresas</p>
              <p className="text-2xl font-bold text-gray-900">{companies.length}</p>
              <p className="text-sm text-green-600">+{companies.filter(c => {
                const created = new Date(c.createdAt);
                const lastWeek = new Date();
                lastWeek.setDate(lastWeek.getDate() - 7);
                return created > lastWeek;
              }).length} esta semana</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <ClientsIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Clientes</p>
              <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
              <p className="text-sm text-green-600">+{clients.filter(c => {
                const created = new Date(c.createdAt);
                const lastWeek = new Date();
                lastWeek.setDate(lastWeek.getDate() - 7);
                return created > lastWeek;
              }).length} esta semana</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <CreditCard className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Créditos Restantes</p>
              <p className="text-2xl font-bold text-gray-900">{userProfile?.credits || 0}</p>
              <p className="text-sm text-red-600">-5 hoje</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsersList = () => (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Users className="w-6 h-6 text-blue-600 mr-3" />
          <h2 className="text-xl font-bold text-gray-900">Lista de Usuários</h2>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={fixUserPermissions}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors duration-200"
          >
            Corrigir Permissões
          </button>
          <button
            onClick={() => {
              openUserForm();
              setActiveSubSection('users-form');
            }}
            className="btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Cadastrar Usuário
          </button>
        </div>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar usuários..."
            value={searchUser}
            onChange={(e) => setSearchUser(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="space-y-4">
        {users
          .filter(user =>
            user.name.toLowerCase().includes(searchUser.toLowerCase()) ||
            user.email.toLowerCase().includes(searchUser.toLowerCase())
          )
          .map((user) => (
            <div key={user.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                      user.category === 'proprietario' ? 'bg-purple-100 text-purple-800' :
                      user.category === 'admin' ? 'bg-blue-100 text-blue-800' :
                      user.category === 'empresa' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.category}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Email:</span> {user.email}
                    </div>
                    <div>
                      <span className="font-medium">Créditos:</span> {user.credits}
                    </div>
                    <div>
                      <span className="font-medium">Seções visíveis:</span> {user.visibleSections.length}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      openUserForm(user);
                      setActiveSubSection('users-form');
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteUser(user.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        
        {users.length === 0 && (
          <div className="text-center py-8">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum usuário encontrado</h3>
            <p className="text-gray-600">Comece criando seu primeiro usuário.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderUserForm = () => (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <UserPlus className="w-6 h-6 text-blue-600 mr-3" />
          <h2 className="text-xl font-bold text-gray-900">
            {editingUser?.id ? 'Editar Usuário' : 'Cadastrar Usuário'}
          </h2>
        </div>
        <button
          onClick={() => {
            setEditingUser(null);
            setShowUserForm(false);
            setActiveSubSection('users-list');
          }}
          className="btn-secondary"
        >
          Voltar
        </button>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
            <input
              type="text"
              value={editingUser?.name || ''}
              onChange={(e) => handleUserFormChange('name', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Digite o nome"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={editingUser?.email || ''}
              onChange={(e) => handleUserFormChange('email', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="email@exemplo.com"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
            <select
              value={editingUser?.category || 'usuario'}
              onChange={(e) => handleUserFormChange('category', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="usuario">Usuário</option>
              <option value="empresa">Empresa</option>
              <option value="admin">Admin</option>
              <option value="proprietario">Proprietário</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Créditos</label>
            <input
              type="number"
              value={editingUser?.credits || 0}
              onChange={(e) => handleUserFormChange('credits', parseInt(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="10"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Permissões de Visibilidade</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 border border-gray-300 rounded-lg bg-gray-50">
            {navigationItems.map((item) => (
              <label key={item.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={editingUser?.visibleSections.includes(item.id) || false}
                  onChange={(e) => {
                    const currentSections = editingUser?.visibleSections || [];
                    if (e.target.checked) {
                      handleUserFormChange('visibleSections', [...currentSections, item.id]);
                    } else {
                      handleUserFormChange('visibleSections', currentSections.filter(s => s !== item.id));
                    }
                  }}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={() => {
              setEditingUser(null);
              setShowUserForm(false);
              setActiveSubSection('users-list');
            }}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
          >
            Cancelar
          </button>
          <button
            onClick={saveUser}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            {editingUser?.id ? 'Atualizar' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderCompaniesList = () => (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Building2 className="w-6 h-6 text-green-600 mr-3" />
          <h2 className="text-xl font-bold text-gray-900">Lista de Empresas</h2>
        </div>
        <button
          onClick={() => {
            openCompanyForm();
            setActiveSubSection('companies-form');
          }}
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Cadastrar Empresa
        </button>
      </div>

      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-800">
              <strong>🔒 Isolamento de Dados:</strong> Cada usuário vê apenas suas próprias empresas. 
              As empresas criadas por outros usuários não aparecem nesta lista.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar empresas..."
            value={searchCompany}
            onChange={(e) => setSearchCompany(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
      </div>

      <div className="space-y-4">
        {companies
          .filter(company =>
            company.name.toLowerCase().includes(searchCompany.toLowerCase()) ||
            company.email.toLowerCase().includes(searchCompany.toLowerCase()) ||
            company.cnpj.includes(searchCompany)
          )
          .map((company) => (
            <div key={company.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{company.name}</h3>
                    {isCompanyOwner(company) && (
                      <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                        👑 Minha
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">CNPJ:</span> {company.cnpj}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span> {company.email}
                    </div>
                    <div>
                      <span className="font-medium">Telefone:</span> {company.phone}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => editCompany(company)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteCompany(company.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        
        {companies.length === 0 && (
          <div className="text-center py-8">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma empresa encontrada</h3>
            <p className="text-gray-600">Comece criando sua primeira empresa.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderCompanyForm = () => (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Building2 className="w-6 h-6 text-green-600 mr-3" />
          <h2 className="text-xl font-bold text-gray-900">
            {editingCompany?.id ? 'Editar Empresa' : 'Cadastrar Empresa'}
          </h2>
        </div>
        <button
          onClick={() => {
            setEditingCompany(null);
            setShowCompanyForm(false);
            setActiveSubSection('companies-list');
          }}
          className="btn-secondary"
        >
          Voltar
        </button>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nome da Empresa</label>
            <input
              type="text"
              value={editingCompany?.name || ''}
              onChange={(e) => handleCompanyFormChange('name', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Digite o nome da empresa"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">CNPJ</label>
            <input
              type="text"
              value={editingCompany?.cnpj || ''}
              onChange={(e) => handleCompanyFormChange('cnpj', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="00.000.000/0000-00"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={editingCompany?.email || ''}
              onChange={(e) => handleCompanyFormChange('email', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="email@empresa.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
            <input
              type="text"
              value={editingCompany?.phone || ''}
              onChange={(e) => handleCompanyFormChange('phone', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="(11) 3000-0000"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={() => {
              setEditingCompany(null);
              setShowCompanyForm(false);
              setActiveSubSection('companies-list');
            }}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
          >
            Cancelar
          </button>
          <button
            onClick={saveCompany}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
          >
            {editingCompany?.id ? 'Atualizar' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );

  // Funções placeholder para outras seções
  const renderCreditsOverview = () => (
    <div className="card text-center py-12">
      <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Gerenciamento de Créditos</h3>
      <p className="text-gray-600 mb-6">Gerencie planos e recargas de créditos.</p>
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => setActiveSubSection('plans')}
          className="btn-primary"
        >
          Ver Planos
        </button>
        <button
          onClick={() => setActiveSubSection('recharges')}
          className="btn-secondary"
        >
          Ver Recargas
        </button>
      </div>
    </div>
  );

  const renderPlans = () => (
    <div className="card text-center py-12">
      <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Planos</h3>
      <p className="text-gray-600">Gerenciamento de planos em desenvolvimento.</p>
    </div>
  );

  const renderRecharges = () => (
    <div className="card text-center py-12">
      <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Recargas</h3>
      <p className="text-gray-600">Sistema de recargas em desenvolvimento.</p>
    </div>
  );

  const renderClients = () => (
    <div className="card text-center py-12">
      <ClientsIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Clientes</h3>
      <p className="text-gray-600">Gerenciamento de clientes em desenvolvimento.</p>
    </div>
  );

  const renderGroups = () => (
    <div className="card text-center py-12">
      <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Grupos</h3>
      <p className="text-gray-600">Gerenciamento de grupos em desenvolvimento.</p>
    </div>
  );

  const renderCampaigns = () => (
    <div className="card text-center py-12">
      <Megaphone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Campanhas</h3>
      <p className="text-gray-600">Sistema de campanhas em desenvolvimento.</p>
    </div>
  );

  const renderPublicityOverview = () => (
    <div className="card text-center py-12">
      <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Publicidade</h3>
      <p className="text-gray-600 mb-6">Ferramentas de geração de conteúdo.</p>
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => setActiveSubSection('images')}
          className="btn-primary"
        >
          <Image className="w-4 h-4 mr-2" />
          Gerar Imagens
        </button>
        <button
          onClick={() => setActiveSubSection('videos')}
          className="btn-secondary"
        >
          <Video className="w-4 h-4 mr-2" />
          Gerar Vídeos
        </button>
      </div>
    </div>
  );

  const renderImageGeneration = () => (
    <div className="card text-center py-12">
      <Image className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Geração de Imagens</h3>
      <p className="text-gray-600">Ferramenta de geração de imagens em desenvolvimento.</p>
    </div>
  );

  const renderVideoGeneration = () => {
    const [oauthStatus, setOauthStatus] = useState<string>('idle');
    const [testResult, setTestResult] = useState<string>('');
    const [isTesting, setIsTesting] = useState(false);
    const [videoPrompt, setVideoPrompt] = useState<string>('');
    const [videoDuration, setVideoDuration] = useState<string>('5');
    const [videoAspectRatio, setVideoAspectRatio] = useState<string>('16:9');
    const [isGenerating, setIsGenerating] = useState(false);

    const testOAuthConnection = async () => {
      setIsTesting(true);
      setOauthStatus('testing');
      setTestResult('');

      try {
        console.log('🧪 Testando conexão OAuth 2.0...');
        
        // Testar servidor OAuth 2.0
        const response = await fetch('http://localhost:5000/api/test');
        console.log('📊 Status da resposta:', response.status);
        
        if (!response.ok) {
          throw new Error(`Servidor OAuth não respondeu: ${response.status}`);
        }
        
        const serverData = await response.json();
        console.log('✅ Servidor OAuth funcionando:', serverData);
        
        // Verificar status da autenticação
        const authResponse = await fetch('http://localhost:5000/auth/status');
        const authData = await authResponse.json();
        console.log('🔐 Status da autenticação:', authData);
        
        if (authData.isAuthenticated) {
          setOauthStatus('authenticated');
          setTestResult('✅ OAuth 2.0 autenticado! Pronto para gerar vídeos reais.');
        } else {
          setOauthStatus('not_authenticated');
          setTestResult('⚠️ OAuth 2.0 não autenticado. Clique em "Autenticar" para continuar.');
        }
        
      } catch (error) {
        console.error('❌ Erro ao testar OAuth:', error);
        setOauthStatus('error');
        setTestResult(`❌ Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      } finally {
        setIsTesting(false);
      }
    };

    const startOAuthFlow = async () => {
      try {
        setOauthStatus('authenticating');
        setTestResult('🔄 Iniciando autenticação OAuth 2.0...');
        
        const response = await fetch('http://localhost:5000/auth/google');
        const data = await response.json();
        
        if (data.authUrl) {
          setTestResult(`🔐 Acesse esta URL para autenticar: ${data.authUrl}`);
          window.open(data.authUrl, '_blank');
        } else {
          throw new Error('URL de autenticação não recebida');
        }
        
      } catch (error) {
        console.error('❌ Erro ao iniciar OAuth:', error);
        setOauthStatus('error');
        setTestResult(`❌ Erro ao iniciar autenticação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      }
    };

    const generateVideo = async () => {
      if (!videoPrompt.trim()) {
        alert('Por favor, insira uma descrição do vídeo.');
        return;
      }

      setIsGenerating(true);
      try {
        console.log('🎬 Iniciando geração de vídeo...');
        console.log('📝 Prompt:', videoPrompt);
        console.log('⏱️ Duração:', videoDuration);
        console.log('📐 Aspect Ratio:', videoAspectRatio);

        // Aqui você pode integrar com o serviço de geração de vídeo
        // Por enquanto, vamos simular
        setTimeout(() => {
          alert('🎬 Vídeo gerado com sucesso! (Simulação)');
          setIsGenerating(false);
        }, 3000);

      } catch (error) {
        console.error('❌ Erro ao gerar vídeo:', error);
        alert('Erro ao gerar vídeo');
        setIsGenerating(false);
      }
    };

    return (
      <div className="space-y-6">
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Video className="w-8 h-8 text-blue-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">Geração de Vídeos com Veo 3</h3>
            </div>
            <button
              onClick={() => setActiveSubSection('')}
              className="btn-secondary"
            >
              Voltar
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Teste OAuth 2.0 */}
            <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
              <h4 className="text-lg font-semibold text-blue-900 mb-4">🔐 Teste OAuth 2.0</h4>
              
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={testOAuthConnection}
                    disabled={isTesting}
                    className="btn-primary flex items-center justify-center"
                  >
                    {isTesting ? (
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Zap className="w-4 h-4 mr-2" />
                    )}
                    {isTesting ? 'Testando...' : '🧪 Testar Conexão'}
                  </button>
                  
                  <button
                    onClick={startOAuthFlow}
                    disabled={oauthStatus === 'authenticating'}
                    className="btn-secondary flex items-center justify-center"
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    🔐 Autenticar
                  </button>
                </div>
                
                {testResult && (
                  <div className={`p-3 rounded-lg text-sm ${
                    oauthStatus === 'authenticated' ? 'bg-green-100 text-green-800' :
                    oauthStatus === 'error' ? 'bg-red-100 text-red-800' :
                    oauthStatus === 'not_authenticated' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {testResult}
                  </div>
                )}
                
                <div className="text-xs text-gray-600 space-y-1">
                  <p><strong>Status:</strong> {oauthStatus}</p>
                  <p><strong>Servidor:</strong> http://localhost:5000</p>
                  <p><strong>Projeto:</strong> beprojects-836d6</p>
                </div>
              </div>
            </div>
            
            {/* Geração de Vídeo */}
            <div className="card bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
              <h4 className="text-lg font-semibold text-purple-900 mb-4">🎬 Gerar Vídeo</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prompt do Vídeo
                  </label>
                  <textarea
                    value={videoPrompt}
                    onChange={(e) => setVideoPrompt(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={3}
                    placeholder="Descreva o vídeo que você quer gerar..."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duração
                    </label>
                    <select 
                      value={videoDuration}
                      onChange={(e) => setVideoDuration(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    >
                      <option value="5">5 segundos</option>
                      <option value="10">10 segundos</option>
                      <option value="15">15 segundos</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Aspect Ratio
                    </label>
                    <select 
                      value={videoAspectRatio}
                      onChange={(e) => setVideoAspectRatio(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    >
                      <option value="16:9">16:9 (Landscape)</option>
                      <option value="9:16">9:16 (Portrait)</option>
                      <option value="1:1">1:1 (Square)</option>
                    </select>
                  </div>
                </div>
                
                <button
                  onClick={generateVideo}
                  disabled={oauthStatus !== 'authenticated' || isGenerating || !videoPrompt.trim()}
                  className="btn-primary w-full flex items-center justify-center"
                >
                  {isGenerating ? (
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Video className="w-4 h-4 mr-2" />
                  )}
                  {isGenerating ? 'Gerando...' : '🎬 Gerar Vídeo com Veo 3'}
                </button>
                
                {oauthStatus !== 'authenticated' && (
                  <p className="text-xs text-yellow-600 text-center">
                    ⚠️ Autentique-se primeiro para gerar vídeos reais
                  </p>
                )}
                
                {!videoPrompt.trim() && (
                  <p className="text-xs text-gray-500 text-center">
                    💡 Digite uma descrição do vídeo para habilitar a geração
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
    </div>
  );
  };

  const renderAiAgents = () => (
    <div className="card text-center py-12">
      <Bot className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Agentes de IA</h3>
      <p className="text-gray-600">Sistema de agentes de IA em desenvolvimento.</p>
    </div>
  );

  const renderDocuments = () => (
    <div className="card text-center py-12">
      <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Documentos</h3>
      <p className="text-gray-600">Gerenciamento de documentos em desenvolvimento.</p>
    </div>
  );

  const renderInventory = () => (
    <div className="card text-center py-12">
      <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Estoque</h3>
      <p className="text-gray-600">Sistema de estoque em desenvolvimento.</p>
    </div>
  );

  const renderPayments = () => (
    <div className="card text-center py-12">
      <PaymentsIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Pagamentos</h3>
      <p className="text-gray-600">Sistema de pagamentos em desenvolvimento.</p>
    </div>
  );

  const renderIntegrations = () => (
    <div className="card text-center py-12">
      <IntegrationsIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Integrações</h3>
      <p className="text-gray-600">Sistema de integrações em desenvolvimento.</p>
    </div>
  );

  return (
    <div className="app bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <div className={`sidebar fixed inset-y-0 left-0 z-50 bg-white shadow-2xl transform transition-all duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:relative lg:inset-0 ${
        sidebarCollapsed ? 'minimized' : ''
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="p-6 border-b border-gray-200 relative bg-gradient-to-r from-gray-50 to-white">
            <div className={`flex ${sidebarCollapsed ? 'items-center justify-center' : 'items-center'}`}>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Bot className="w-7 h-7 text-white" />
              </div>
              {!sidebarCollapsed && (
                <div className="ml-4">
                  <h1 className="text-2xl font-bold gradient-text leading-tight">Plataforma IA</h1>
                  <p className="text-gray-600 text-sm font-medium">Agentes Inteligentes</p>
                </div>
              )}
            </div>
            
            {/* Botão para minimizar/maximizar sidebar */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="absolute bottom-2 right-2 w-5 h-5 p-0 rounded-full border-2 border-current bg-transparent hover:bg-white/10 transition-all duration-200 lg:block z-10 text-purple-600"
              title={sidebarCollapsed ? "Expandir sidebar" : "Minimizar sidebar"}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-3 h-3 mx-auto my-auto" />
              ) : (
                <ChevronDown className="w-3 h-3 mx-auto my-auto" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className={`flex-1 p-4 space-y-3 overflow-y-auto ${sidebarCollapsed ? 'flex flex-col items-center' : ''}`}>
            {getVisibleNavigationItems().map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.id}>
                  <button
                    onClick={() => {
                      setActiveSection(item.id);
                      setActiveSubSection('');
                    }}
                    className={`sidebar-item w-full group flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'justify-between'} ${
                      activeSection === item.id ? 'active' : ''
                    }`}
                  >
                    <div className={`${sidebarCollapsed ? 'flex items-center justify-center w-full' : 'flex items-center'}`}>
                      <Icon className={`${sidebarCollapsed ? 'w-6 h-6' : 'w-5 h-5 mr-3'}`} />
                      {!sidebarCollapsed && (
                        <span className="font-semibold text-gray-700">{item.label}</span>
                      )}
                    </div>
                    {!sidebarCollapsed && item.subItems && (
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                  
                  {/* Subitens */}
                  {!sidebarCollapsed && item.subItems && activeSection === item.id && (
                    <div className="ml-8 mt-2 space-y-1">
                      {item.subItems.map((subItem) => (
                        <button
                          key={subItem.id}
                          onClick={() => setActiveSubSection(subItem.id)}
                          className={`w-full text-left py-2 px-3 text-sm rounded-lg transition-colors duration-200 ${
                            activeSubSection === subItem.id
                              ? 'bg-blue-50 text-blue-700 font-medium'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {subItem.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center">
              <button
                onClick={() => setShowProfileModal(true)}
                className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center hover:scale-105 transition-transform duration-200"
              >
                <User className="w-5 h-5 text-white" />
              </button>
              {!sidebarCollapsed && (
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{user?.displayName || user?.email}</p>
                  <p className="text-xs text-gray-500">{userProfile?.category || 'Usuário'}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`main-content transition-all duration-300 ${
        sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
      }`}>
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900 ml-4">
                {navigationItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={clearOldData}
                className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors"
              >
                Limpar Cache
              </button>
              <div className="text-sm text-gray-600">
                {new Date().toLocaleDateString('pt-BR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-6">
          {renderContent()}
        </main>
      </div>

      {/* Modals */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirmar Exclusão</h3>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteUser}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {showCompanyDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirmar Exclusão</h3>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja excluir esta empresa? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowCompanyDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteCompany}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Perfil */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Perfil do Usuário</h3>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-10 h-10 text-white" />
                </div>
                <h4 className="text-lg font-medium text-gray-900">{user?.displayName || user?.email}</h4>
                <p className="text-sm text-gray-500">{userProfile?.category || 'Usuário'}</p>
              </div>
              
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-700">Email:</span>
                  <span className="ml-2 text-sm text-gray-600">{user?.email}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Créditos:</span>
                  <span className="ml-2 text-sm text-gray-600">{userProfile?.credits || 0}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Seções visíveis:</span>
                  <span className="ml-2 text-sm text-gray-600">{userProfile?.visibleSections?.length || 0}</span>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Fechar
                </button>
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Sair
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;

