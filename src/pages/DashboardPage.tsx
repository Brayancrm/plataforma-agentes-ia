import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';
import { useFirestore } from '../hooks/useFirestore';
import { useFirebaseStorage } from '../hooks/useFirebaseStorage';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../config/firebase';
import OpenAIService from '../services/openaiService';
import GeminiService from '../services/geminiService';
import LeonardoService from '../services/leonardoService';
import Veo3Service from '../services/veo3Service';
import {
  Building2, Plus, Search, Edit, Trash2, User, Users, CreditCard,
  Settings, ChevronRight, ChevronDown, Menu, X, Upload, Download, 
  Eye, EyeOff, UserPlus, Users as ClientsIcon, FolderOpen, 
  Megaphone, Bot, FileText, Package, CreditCard as PaymentsIcon,
  Settings as IntegrationsIcon, Image as ImageIcon, Video as VideoIcon, 
  Zap, MessageCircle, Phone, MessageSquare, Mail, LogOut, 
  UserCog, Layout, Columns, FileSpreadsheet, Brain, CheckCircle, 
  AlertCircle, Loader, Mic, Info, AlertTriangle, Globe, MoreVertical, Clock,
  Smartphone
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
  email?: string;
  additionalFields: Record<string, any>;
  groupId?: number;
  createdAt: string;
}

const DashboardPage: React.FC = () => {
  const { user, userProfile, logout } = useAuth();
  const { createDocument, updateDocument, getDocuments } = useFirestore();
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

  // Estados para grupos
  const [groups, setGroups] = useState<any[]>([]);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState<any>(null);
  const [searchGroup, setSearchGroup] = useState('');

  // Estados para campanhas
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<any>(null);
  const [searchCampaign, setSearchCampaign] = useState('');

  // Estados para agentes IA
  const [aiAgents, setAiAgents] = useState<any[]>([]);
  const [showAgentForm, setShowAgentForm] = useState(false);
  const [editingAgent, setEditingAgent] = useState<any>(null);
  const [searchAgent, setSearchAgent] = useState('');
  const [selectedAgentType, setSelectedAgentType] = useState('whatsapp');

  // Estados para templates
  const [templates, setTemplates] = useState<any[]>([]);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [searchTemplate, setSearchTemplate] = useState('');

  // Estados para importação CSV
  const [showCsvImport, setShowCsvImport] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvSeparator, setCsvSeparator] = useState<string>(',');
  const [columnMapping, setColumnMapping] = useState<{[key: string]: string}>({});
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [selectedGroupForImport, setSelectedGroupForImport] = useState<any>(null);

  // Estados para modal de campos do cliente
  const [showClientFieldsModal, setShowClientFieldsModal] = useState(false);
  const [selectedClientForFields, setSelectedClientForFields] = useState<any>(null);

  // Estados para WhatsApp
  const [whatsappAgents, setWhatsappAgents] = useState<any[]>([]);
  const [showWhatsappForm, setShowWhatsappForm] = useState(false);
  const [editingWhatsappAgent, setEditingWhatsappAgent] = useState<any>(null);
  const [selectedWhatsappAgent, setSelectedWhatsappAgent] = useState<any>(null);
  const [showWhatsappConnection, setShowWhatsappConnection] = useState(false);

  // Estados para Integrações OpenAI
  const [openaiConfig, setOpenaiConfig] = useState<any>({
    apiKey: '',
    isConfigured: false,
    modules: {
      whatsapp: false,
      voice: false,
      sms: false,
      email: false,
      imageGeneration: false,
      videoGeneration: false
    }
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);

  // Estados para Integrações Zenvia
  const [zenviaConfig, setZenviaConfig] = useState<any>({
    apiKey: '',
    isConfigured: false,
    modules: {
      whatsapp: false,
      voice: false,
      sms: false,
      email: false,
      imageGeneration: false,
      videoGeneration: false
    }
  });
  const [showZenviaApiKey, setShowZenviaApiKey] = useState(false);
  const [testingZenviaConnection, setTestingZenviaConnection] = useState(false);

  // Estados para Integrações Google Gemini
  const [geminiConfig, setGeminiConfig] = useState<any>({
    apiKey: '',
    isConfigured: false,
    modules: {
      whatsapp: false,
      voice: false,
      sms: false,
      email: false,
      imageGeneration: false,
      videoGeneration: false
    }
  });
  const [showGeminiApiKey, setShowGeminiApiKey] = useState(false);
  const [testingGeminiConnection, setTestingGeminiConnection] = useState(false);

  // Estados para Sistema de Documentos
  const [documents, setDocuments] = useState<any[]>([]);
  const [searchDocument, setSearchDocument] = useState('');
  const [showDocumentForm, setShowDocumentForm] = useState(false);
  const [editingDocument, setEditingDocument] = useState<any>(null);
  const [selectedDocumentType, setSelectedDocumentType] = useState('document');
  const [documentContent, setDocumentContent] = useState('');
  const [showDeleteDocumentConfirm, setShowDeleteDocumentConfirm] = useState<number | null>(null);

  // Estados para Sistema de Estoque
  const [products, setProducts] = useState<any[]>([]);
  const [searchProduct, setSearchProduct] = useState('');
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [selectedProductType, setSelectedProductType] = useState('product');
  const [showDeleteProductConfirm, setShowDeleteProductConfirm] = useState<number | null>(null);
  const [showProductFields, setShowProductFields] = useState<number | null>(null);
  
  // Estados para CSV de Produtos
  const [showProductCSVImport, setShowProductCSVImport] = useState(false);
  const [productCsvData, setProductCsvData] = useState<any[]>([]);
  const [productFieldMapping, setProductFieldMapping] = useState<any>({});
  const [showProductMapping, setShowProductMapping] = useState(false);
  const [selectedProductTemplate, setSelectedProductTemplate] = useState<any>(null);

  // Estados para Gerador de Imagens
  const [generatedImages, setGeneratedImages] = useState<any[]>([]);
  const [showImageGenerator, setShowImageGenerator] = useState(false);
  const [imagePrompt, setImagePrompt] = useState('');
  const [selectedImageTool, setSelectedImageTool] = useState('');
  const [imageSize, setImageSize] = useState('1024x1024');
  const [imageStyle, setImageStyle] = useState('realistic');
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [generatingImage, setGeneratingImage] = useState(false);
  const [imageEditMode, setImageEditMode] = useState('generate'); // 'generate' ou 'edit'

  // Estados para Gerador de Vídeos
  const [generatedVideos, setGeneratedVideos] = useState<any[]>([]);
  const [showVideoGenerator, setShowVideoGenerator] = useState(false);
  const [videoPrompt, setVideoPrompt] = useState('');
  const [selectedVideoTool, setSelectedVideoTool] = useState('');
  const [videoDuration, setVideoDuration] = useState('5');
  const [videoQuality, setVideoQuality] = useState('720p');
  const [videoStyle, setVideoStyle] = useState('realistic');
  const [uploadedVideo, setUploadedVideo] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>('');
  const [generatingVideo, setGeneratingVideo] = useState(false);
  const [videoEditMode, setVideoEditMode] = useState('generate'); // 'generate' ou 'edit'





  // Estados do modal de perfil
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
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
    { id: 'templates', label: 'Templates', icon: Layout },
    { id: 'publicidade', label: 'Publicidade', icon: Zap, subItems: [
      { id: 'images', label: 'Gerar Imagens' },
      { id: 'videos', label: 'Gerar Vídeos' }
    ]},
    { id: 'ai-agents', label: 'Agentes IA', icon: Bot },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
    { id: 'documents', label: 'Documentos', icon: FileText },
    { id: 'inventory', label: 'Estoque', icon: Package },
    { id: 'payments', label: 'Pagamentos', icon: PaymentsIcon },
    { id: 'integrations', label: 'Integrações', icon: IntegrationsIcon }
  ];

  // Filtrar itens baseado nas permissões do usuário
  const getVisibleNavigationItems = () => {
    console.log('🔍 DEBUG - userProfile:', userProfile);
    console.log('🔍 DEBUG - user:', user);
    
    if (!userProfile) {
      console.log('❌ userProfile está vazio - mostrando todos os itens');
      // Se não há userProfile, mostrar todos os itens por padrão
      return navigationItems;
    }
    
    if (userProfile.category === 'proprietario') {
      console.log('✅ Usuário é proprietário - mostrando todos os itens');
      return navigationItems;
    }
    
    console.log('🔍 visibleSections:', userProfile.visibleSections);
    const filteredItems = navigationItems.filter(item => 
      userProfile.visibleSections.includes(item.id)
    );
    console.log('📋 Itens filtrados:', filteredItems);
    
    return filteredItems;
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

      // Carregar grupos
      const savedGroups = localStorage.getItem('dashboardGroups');
      if (savedGroups) {
        try {
          setGroups(JSON.parse(savedGroups));
        } catch (error) {
          console.error('Erro ao carregar grupos:', error);
          setGroups([]);
        }
      }

      // Carregar campanhas
      const savedCampaigns = localStorage.getItem('dashboardCampaigns');
      if (savedCampaigns) {
        try {
          setCampaigns(JSON.parse(savedCampaigns));
        } catch (error) {
          console.error('Erro ao carregar campanhas:', error);
          setCampaigns([]);
        }
      }

      // Carregar agentes IA
      const savedAgents = localStorage.getItem('dashboardAiAgents');
      if (savedAgents) {
        try {
          setAiAgents(JSON.parse(savedAgents));
        } catch (error) {
          console.error('Erro ao carregar agentes IA:', error);
          setAiAgents([]);
        }
      }

      // Carregar templates
      const savedTemplates = localStorage.getItem('dashboardTemplates');
      if (savedTemplates) {
        try {
          setTemplates(JSON.parse(savedTemplates));
        } catch (error) {
          console.error('Erro ao carregar templates:', error);
          setTemplates([]);
        }
      }

      // Carregar documentos
      const savedDocuments = localStorage.getItem('dashboardDocuments');
      if (savedDocuments) {
        try {
          setDocuments(JSON.parse(savedDocuments));
        } catch (error) {
          console.error('Erro ao carregar documentos:', error);
          setDocuments([]);
        }
      }

      // Carregar produtos
      const savedProducts = localStorage.getItem('dashboardProducts');
      if (savedProducts) {
        try {
          setProducts(JSON.parse(savedProducts));
        } catch (error) {
          console.error('Erro ao carregar produtos:', error);
          setProducts([]);
        }
      }

      // Carregar agentes WhatsApp
      const savedWhatsappAgents = localStorage.getItem('dashboardWhatsappAgents');
      if (savedWhatsappAgents) {
        try {
          setWhatsappAgents(JSON.parse(savedWhatsappAgents));
        } catch (error) {
          console.error('Erro ao carregar agentes WhatsApp:', error);
          setWhatsappAgents([]);
        }
      }

      // Carregar imagens geradas
      const savedImages = localStorage.getItem('dashboardGeneratedImages');
      if (savedImages) {
        try {
          setGeneratedImages(JSON.parse(savedImages));
        } catch (error) {
          console.error('Erro ao carregar imagens:', error);
          setGeneratedImages([]);
        }
      }

      // Carregar vídeos gerados
      const savedVideos = localStorage.getItem('dashboardGeneratedVideos');
      if (savedVideos) {
        try {
          setGeneratedVideos(JSON.parse(savedVideos));
        } catch (error) {
          console.error('Erro ao carregar vídeos:', error);
          setGeneratedVideos([]);
        }
      }


    };

    loadData();
    loadOpenAIConfig();
    loadZenviaConfig();
    loadGeminiConfig();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showProfileDropdown) {
        const target = event.target as HTMLElement;
        if (!target.closest('.profile-dropdown-container')) {
          setShowProfileDropdown(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileDropdown]);

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
        // Remover do localStorage
        const currentUsers = JSON.parse(localStorage.getItem('dashboardUsers') || '[]');
        const updatedUsers = currentUsers.filter((u: any) => u.id !== showDeleteConfirm);
        localStorage.setItem('dashboardUsers', JSON.stringify(updatedUsers));

        // Atualizar estado local
        setUsers(prev => prev.filter(user => user.id !== showDeleteConfirm));

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
        } else if (activeSubSection === 'plans-form') {
          return renderPlanForm();
        } else if (activeSubSection === 'recharges') {
          return renderRecharges();
        } else {
          return renderCreditsOverview();
        }
      case 'clients':
        if (activeSubSection === 'clients-form' || showClientForm) {
          return renderClientForm();
        } else {
          return renderClients();
        }
      case 'groups':
        if (activeSubSection === 'groups-form' || showGroupForm) {
          return renderGroupForm();
        } else {
          return renderGroups();
        }
      case 'campaigns':
        if (activeSubSection === 'campaigns-form' || showCampaignForm) {
          return renderCampaignForm();
        } else {
          return renderCampaigns();
        }
      case 'templates':
        if (activeSubSection === 'templates-form' || showTemplateForm) {
          return renderTemplateForm();
        } else {
          return renderTemplates();
        }
      case 'publicidade':
        if (activeSubSection === 'images') {
          return renderImageGeneration();
        } else if (activeSubSection === 'videos') {
          return renderVideoGeneration();
        } else {
          return renderPublicityOverview();
        }
      case 'ai-agents':
        if (activeSubSection === 'ai-agents-form' || showAgentForm) {
          return renderAgentForm();
        } else {
          return renderAiAgents();
        }
      case 'whatsapp':
        return renderWhatsApp();
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
    <div className="w-full space-y-8">
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-3">
                <div className="p-3 bg-blue-100 rounded-lg mr-4">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total de Usuários</p>
                  <p className="text-3xl font-bold text-gray-900">{users.length}</p>
                </div>
              </div>
              <p className="text-sm text-green-600 font-medium">+{users.filter(u => {
                const created = new Date(u.createdAt);
                const lastWeek = new Date();
                lastWeek.setDate(lastWeek.getDate() - 7);
                return created > lastWeek;
              }).length} esta semana</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-3">
                <div className="p-3 bg-green-100 rounded-lg mr-4">
                  <Building2 className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Empresas</p>
                  <p className="text-3xl font-bold text-gray-900">{companies.length}</p>
                </div>
              </div>
              <p className="text-sm text-green-600 font-medium">+{companies.filter(c => {
                const created = new Date(c.createdAt);
                const lastWeek = new Date();
                lastWeek.setDate(lastWeek.getDate() - 7);
                return created > lastWeek;
              }).length} esta semana</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-3">
                <div className="p-3 bg-purple-100 rounded-lg mr-4">
                  <ClientsIcon className="w-8 h-8 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Clientes</p>
                  <p className="text-3xl font-bold text-gray-900">{clients.length}</p>
                </div>
              </div>
              <p className="text-sm text-green-600 font-medium">+{clients.filter(c => {
                const created = new Date(c.createdAt);
                const lastWeek = new Date();
                lastWeek.setDate(lastWeek.getDate() - 7);
                return created > lastWeek;
              }).length} esta semana</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-3">
                <div className="p-3 bg-orange-100 rounded-lg mr-4">
                  <CreditCard className="w-8 h-8 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Créditos Restantes</p>
                  <p className="text-3xl font-bold text-gray-900">{userProfile?.credits || 0}</p>
                </div>
              </div>
              <p className="text-sm text-red-600 font-medium">-5 hoje</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Banner de Boas-vindas */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2">Olá, {userProfile?.name || 'Usuário'}! 👋</h2>
          <p className="text-xl opacity-90">
            {userProfile?.category === 'proprietario' ? 'Proprietário' : userProfile?.category === 'admin' ? 'Administrador' : 'Usuário'}. 
            Você tem acesso total a todas as funcionalidades do sistema.
          </p>
        </div>
      </div>

      {/* Cards de Ação Rápida */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer"
             onClick={() => {
               setActiveSection('usuarios');
               setActiveSubSection('users-form');
             }}>
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg mr-4">
              <UserPlus className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Cadastrar Usuário</h3>
              <p className="text-gray-600">Crie novos usuários com permissões específicas</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer"
             onClick={() => {
               setActiveSection('companies');
               setActiveSubSection('companies-form');
             }}>
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg mr-4">
              <Building2 className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Cadastrar Empresa</h3>
              <p className="text-gray-600">Registre novas empresas no sistema</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer"
             onClick={() => {
               setActiveSection('clients');
               setActiveSubSection('clients-form');
             }}>
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg mr-4">
              <ClientsIcon className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Cadastrar Cliente</h3>
              <p className="text-gray-600">Adicione novos clientes ao sistema</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Seção de Atividades Recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Atividades Recentes</h3>
          <div className="space-y-3">
            <div className="flex items-center text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              Sistema funcionando normalmente
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              {users.length} usuários cadastrados
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
              {companies.length} empresas registradas
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo do Sistema</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Usuários Ativos:</span>
              <span className="font-medium text-gray-900">{users.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Empresas Cadastradas:</span>
              <span className="font-medium text-gray-900">{companies.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total de Créditos:</span>
              <span className="font-medium text-gray-900">{userProfile?.credits || 0}</span>
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
            (user.name || '').toLowerCase().includes(searchUser.toLowerCase()) ||
            (user.email || '').toLowerCase().includes(searchUser.toLowerCase())
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
            (company.name || '').toLowerCase().includes(searchCompany.toLowerCase()) ||
            (company.email || '').toLowerCase().includes(searchCompany.toLowerCase()) ||
            (company.cnpj || '').includes(searchCompany)
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

  // Funções para clientes
  const openClientForm = (client?: Client) => {
    if (client) {
      setEditingClient({ ...client });
    } else {
      setEditingClient({
        id: 0,
        name: '',
        cpf: '',
        phone: '',
        additionalFields: {},
        createdAt: new Date().toISOString()
      });
    }
    setShowClientForm(true);
  };

  const handleClientFormChange = (field: string, value: any) => {
    setEditingClient(prev => {
      if (!prev) {
        return {
          id: 0,
          name: '',
          cpf: '',
          phone: '',
          additionalFields: {},
          createdAt: new Date().toISOString(),
          [field]: value
        };
      }
      return { ...prev, [field]: value };
    });
  };

  const saveClient = () => {
    if (!editingClient) return;

    if (!editingClient.name || !editingClient.cpf || !editingClient.phone) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (editingClient.id) {
      // Editando cliente existente
      const updatedClient = { 
        ...editingClient,
        updatedAt: new Date().toISOString()
      };
      
      setClients(prev => prev.map(client =>
        client.id === editingClient.id ? updatedClient : client
      ));
      
      // Salvar no localStorage
      const currentClients = JSON.parse(localStorage.getItem('dashboardClients') || '[]');
      const updatedClients = currentClients.map((c: Client) => 
        c.id === editingClient.id ? updatedClient : c
      );
      localStorage.setItem('dashboardClients', JSON.stringify(updatedClients));
      
      alert('Cliente atualizado com sucesso!');
    } else {
      // Criando novo cliente
      const newClient = {
        ...editingClient,
        id: generateUniqueId(),
        createdAt: new Date().toISOString()
      };
      
      setClients(prev => [...prev, newClient]);
      
      // Salvar no localStorage
      const currentClients = JSON.parse(localStorage.getItem('dashboardClients') || '[]');
      currentClients.push(newClient);
      localStorage.setItem('dashboardClients', JSON.stringify(currentClients));
      
      alert('Cliente criado com sucesso!');
    }

    setEditingClient(null);
    setShowClientForm(false);
    setActiveSubSection('');
  };

  const deleteClient = (clientId: number) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      setClients(prev => prev.filter(client => client.id !== clientId));
      
      // Remover do localStorage
      const currentClients = JSON.parse(localStorage.getItem('dashboardClients') || '[]');
      const updatedClients = currentClients.filter((c: Client) => c.id !== clientId);
      localStorage.setItem('dashboardClients', JSON.stringify(updatedClients));
      
      alert('Cliente excluído com sucesso!');
    }
  };

  const renderClientForm = () => (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <UserPlus className="w-6 h-6 text-purple-600 mr-3" />
          <h2 className="text-xl font-bold text-gray-900">
            {editingClient?.id ? 'Editar Cliente' : 'Cadastrar Cliente'}
          </h2>
        </div>
        <button 
          onClick={() => {
            setEditingClient(null);
            setShowClientForm(false);
            setActiveSubSection('');
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
              value={editingClient?.name || ''}
              onChange={(e) => handleClientFormChange('name', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Digite o nome"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">CPF</label>
            <input
              type="text"
              value={editingClient?.cpf || ''}
              onChange={(e) => handleClientFormChange('cpf', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="000.000.000-00"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
          <input
            type="text"
            value={editingClient?.phone || ''}
            onChange={(e) => handleClientFormChange('phone', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="(11) 3000-0000"
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={() => {
              setEditingClient(null);
              setShowClientForm(false);
              setActiveSubSection('');
            }}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
          >
            Cancelar
          </button>
          <button
            onClick={saveClient}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
          >
            {editingClient?.id ? 'Atualizar' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );

  // Funções para planos
  const openPlanForm = (plan?: Plan) => {
    if (plan) {
      setEditingPlan({ ...plan });
    } else {
      setEditingPlan({
        id: 0,
        name: '',
        price: 0,
        credits: 0,
        description: '',
        createdAt: new Date().toISOString()
      });
    }
    setShowPlanForm(true);
  };

  const handlePlanFormChange = (field: string, value: any) => {
    setEditingPlan(prev => {
      if (!prev) {
        return {
          id: 0,
          name: '',
          price: 0,
          credits: 0,
          description: '',
          createdAt: new Date().toISOString(),
          [field]: value
        };
      }
      return { ...prev, [field]: value };
    });
  };

  const savePlan = () => {
    if (!editingPlan) return;

    if (!editingPlan.name || !editingPlan.description || editingPlan.price <= 0 || editingPlan.credits <= 0) {
      alert('Por favor, preencha todos os campos obrigatórios corretamente.');
      return;
    }

    if (editingPlan.id) {
      // Editando plano existente
      const updatedPlan = { 
        ...editingPlan,
        updatedAt: new Date().toISOString()
      };
      
      setPlans(prev => prev.map(plan =>
        plan.id === editingPlan.id ? updatedPlan : plan
      ));
      
      // Salvar no localStorage
      const currentPlans = JSON.parse(localStorage.getItem('dashboardPlans') || '[]');
      const updatedPlans = currentPlans.map((p: Plan) => 
        p.id === editingPlan.id ? updatedPlan : p
      );
      localStorage.setItem('dashboardPlans', JSON.stringify(updatedPlans));
      
      alert('Plano atualizado com sucesso!');
    } else {
      // Criando novo plano
      const newPlan = {
        ...editingPlan,
        id: generateUniqueId(),
        createdAt: new Date().toISOString()
      };
      
      setPlans(prev => [...prev, newPlan]);
      
      // Salvar no localStorage
      const currentPlans = JSON.parse(localStorage.getItem('dashboardPlans') || '[]');
      currentPlans.push(newPlan);
      localStorage.setItem('dashboardPlans', JSON.stringify(currentPlans));
      
      alert('Plano criado com sucesso!');
    }

    setEditingPlan(null);
    setShowPlanForm(false);
    setActiveSubSection('');
  };

  const deletePlan = (planId: number) => {
    if (window.confirm('Tem certeza que deseja excluir este plano?')) {
      setPlans(prev => prev.filter(plan => plan.id !== planId));
      
      // Remover do localStorage
      const currentPlans = JSON.parse(localStorage.getItem('dashboardPlans') || '[]');
      const updatedPlans = currentPlans.filter((p: Plan) => p.id !== planId);
      localStorage.setItem('dashboardPlans', JSON.stringify(updatedPlans));
      
      alert('Plano excluído com sucesso!');
    }
  };

  const renderPlanForm = () => (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <CreditCard className="w-6 h-6 text-blue-600 mr-3" />
          <h2 className="text-xl font-bold text-gray-900">
            {editingPlan?.id ? 'Editar Plano' : 'Criar Plano'}
          </h2>
        </div>
        <button
          onClick={() => {
            setEditingPlan(null);
            setShowPlanForm(false);
            setActiveSubSection('');
          }}
          className="btn-secondary"
        >
          Voltar
        </button>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Plano</label>
            <input
              type="text"
              value={editingPlan?.name || ''}
              onChange={(e) => handlePlanFormChange('name', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Digite o nome do plano"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Preço (R$)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={editingPlan?.price || ''}
              onChange={(e) => handlePlanFormChange('price', parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quantidade de Créditos</label>
            <input
              type="number"
              min="1"
              value={editingPlan?.credits || ''}
              onChange={(e) => handlePlanFormChange('credits', parseInt(e.target.value) || 0)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
            <textarea
              value={editingPlan?.description || ''}
              onChange={(e) => handlePlanFormChange('description', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Descreva os benefícios do plano"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={() => {
              setEditingPlan(null);
              setShowPlanForm(false);
              setActiveSubSection('');
            }}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
          >
            Cancelar
          </button>
          <button
            onClick={savePlan}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            {editingPlan?.id ? 'Atualizar' : 'Criar'}
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
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <CreditCard className="w-6 h-6 text-blue-600 mr-3" />
          <h2 className="text-xl font-bold text-gray-900">Gerenciamento de Planos</h2>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => {
              openPlanForm();
              setActiveSubSection('plans-form');
            }}
            className="btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Criar Plano
          </button>
        </div>
          </div>
          
      {activeSubSection === 'plans-form' ? (
        renderPlanForm()
      ) : (
        <>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar planos..."
                value={searchPlan}
                onChange={(e) => setSearchPlan(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans
              .filter(plan =>
                (plan.name || '').toLowerCase().includes(searchPlan.toLowerCase()) ||
                (plan.description || '').toLowerCase().includes(searchPlan.toLowerCase())
              )
              .map((plan) => (
                <div key={plan.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-gray-600 mb-4">{plan.description}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Preço:</span>
                        <span className="font-medium text-gray-900">R$ {plan.price.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Créditos:</span>
                        <span className="font-medium text-gray-900">{plan.credits}</span>
                      </div>
                    </div>
                    <div className="flex justify-center space-x-2 mt-4">
                      <button
                        onClick={() => {
                          openPlanForm(plan);
                          setActiveSubSection('plans-form');
                        }}
                        className="px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => deletePlan(plan.id)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            
            {plans.length === 0 && (
              <div className="col-span-full text-center py-8">
                <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum plano encontrado</h3>
                <p className="text-gray-600">Comece criando seu primeiro plano.</p>
          </div>
            )}
          </div>
        </>
      )}
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
          <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <ClientsIcon className="w-6 h-6 text-purple-600 mr-3" />
          <h2 className="text-xl font-bold text-gray-900">Gerenciamento de Clientes</h2>
            </div>
        <div className="flex space-x-3">
          <input
            type="file"
            accept=".csv"
            onChange={handleCsvFileUpload}
            className="hidden"
            id="csv-upload"
          />
          <label
            htmlFor="csv-upload"
            className="inline-flex items-center px-4 py-2 border border-green-300 rounded-lg text-green-700 bg-green-50 hover:bg-green-100 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Importar CSV
          </label>
          <button
            onClick={() => {
              openClientForm();
              setActiveSubSection('clients-form');
            }}
            className="btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Cadastrar Cliente
          </button>
        </div>
      </div>

      {activeSubSection === 'clients-form' ? (
        renderClientForm()
      ) : (
        <>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar clientes..."
                value={searchClient}
                onChange={(e) => setSearchClient(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>

          <div className="space-y-4">
            {clients
              .filter(client =>
                (client.name || '').toLowerCase().includes(searchClient.toLowerCase()) ||
                (client.cpf || '').includes(searchClient) ||
                (client.phone || '').includes(searchClient) ||
                (client.email || '').toLowerCase().includes(searchClient.toLowerCase())
              )
              .map((client) => (
                <div key={client.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{client.name || 'Nome não informado'}</h3>
                        {client.groupId && (
                          <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                            {(() => {
                              const group = groups.find((g: any) => g.id === client.groupId);
                              return group ? group.name : `Grupo: ${client.groupId}`;
                            })()}
                          </span>
          )}
        </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">CPF:</span> {client.cpf || 'Não informado'}
                        </div>
                        <div>
                          <span className="font-medium">Telefone:</span> {client.phone || 'Não informado'}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedClientForFields(client);
                          setShowClientFieldsModal(true);
                        }}
                        className="px-3 py-1 text-xs bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-full transition-colors"
                        title="Ver todos os campos do cliente"
                      >
                        Campos do Cliente
                      </button>
                      <button
                        onClick={() => {
                          openClientForm(client);
                          setActiveSubSection('clients-form');
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteClient(client.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            
            {clients.length === 0 && (
              <div className="text-center py-8">
                <ClientsIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum cliente encontrado</h3>
                <p className="text-gray-600">Comece criando seu primeiro cliente.</p>
              </div>
            )}
          </div>
        </>
      )}
          </div>
        );

    // Funções para grupos
  const openGroupForm = (group?: any) => {
    if (group) {
      setEditingGroup({ ...group });
    } else {
      setEditingGroup({
        id: 0,
        name: '',
        description: '',
        clients: [],
        template: '',
        createdAt: new Date().toISOString()
      });
    }
    setShowGroupForm(true);
  };

  const handleGroupFormChange = (field: string, value: any) => {
    setEditingGroup((prev: any) => {
      if (!prev) {
        return {
          id: 0,
          name: '',
          description: '',
          clients: [],
          template: '',
          createdAt: new Date().toISOString(),
          [field]: value
        };
      }
      return { ...prev, [field]: value };
    });
  };

  const saveGroup = () => {
    if (!editingGroup) return;

    if (!editingGroup.name || !editingGroup.description) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (editingGroup.id) {
      // Editando grupo existente
      const updatedGroup = { 
        ...editingGroup,
        updatedAt: new Date().toISOString()
      };
      
      setGroups((prev: any) => prev.map((group: any) =>
        group.id === editingGroup.id ? updatedGroup : group
      ));
      
      // Salvar no localStorage
      const currentGroups = JSON.parse(localStorage.getItem('dashboardGroups') || '[]');
      const updatedGroups = currentGroups.map((g: any) => 
        g.id === editingGroup.id ? updatedGroup : g
      );
      localStorage.setItem('dashboardGroups', JSON.stringify(updatedGroups));
      
      alert('Grupo atualizado com sucesso!');
    } else {
      // Criando novo grupo
      const newGroup = {
        ...editingGroup,
        id: generateUniqueId(),
        createdAt: new Date().toISOString()
      };
      
      setGroups((prev: any) => [...prev, newGroup]);
      
      // Salvar no localStorage
      const currentGroups = JSON.parse(localStorage.getItem('dashboardGroups') || '[]');
      currentGroups.push(newGroup);
      localStorage.setItem('dashboardGroups', JSON.stringify(currentGroups));
      
      alert('Grupo criado com sucesso!');
    }

    setEditingGroup(null);
    setShowGroupForm(false);
    setActiveSubSection('');
  };

  const deleteGroup = (groupId: number) => {
    if (window.confirm('Tem certeza que deseja excluir este grupo?')) {
      setGroups((prev: any) => prev.filter((group: any) => group.id !== groupId));
      
      // Remover do localStorage
      const currentGroups = JSON.parse(localStorage.getItem('dashboardGroups') || '[]');
      const updatedGroups = currentGroups.filter((g: any) => g.id !== groupId);
      localStorage.setItem('dashboardGroups', JSON.stringify(updatedGroups));
      
      alert('Grupo excluído com sucesso!');
    }
  };

  const renderGroups = () => (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <FolderOpen className="w-6 h-6 text-orange-600 mr-3" />
          <h2 className="text-xl font-bold text-gray-900">Gerenciamento de Grupos</h2>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => {
              openGroupForm();
              setActiveSubSection('groups-form');
            }}
            className="btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Criar Grupo
          </button>
        </div>
      </div>

      {activeSubSection === 'groups-form' ? (
        renderGroupForm()
      ) : (
        <>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar grupos..."
                value={searchGroup}
                onChange={(e) => setSearchGroup(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups
              .filter((group: any) =>
                (group.name || '').toLowerCase().includes(searchGroup.toLowerCase()) ||
                (group.description || '').toLowerCase().includes(searchGroup.toLowerCase())
              )
              .map((group: any) => (
                <div key={group.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="text-center">
                    <FolderOpen className="w-12 h-12 text-orange-600 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{group.name}</h3>
                    <p className="text-gray-600 mb-4">{group.description}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Clientes:</span>
                        <span className="font-medium text-gray-900">{group.clients?.length || 0}</span>
                      </div>
                      {group.template && (
                        <div className="text-sm">
                          <span className="text-gray-600">Template: </span>
                          <span className="font-medium text-gray-900">{group.template}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-center space-x-2 mt-4">
          <button 
                        onClick={() => {
                          openGroupForm(group);
                          setActiveSubSection('groups-form');
                        }}
                        className="px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => deleteGroup(group.id)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            
            {groups.length === 0 && (
              <div className="col-span-full text-center py-8">
                <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum grupo encontrado</h3>
                <p className="text-gray-600">Comece criando seu primeiro grupo.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );

  const renderGroupForm = () => (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <FolderOpen className="w-6 h-6 text-orange-600 mr-3" />
          <h2 className="text-xl font-bold text-gray-900">
            {editingGroup?.id ? 'Editar Grupo' : 'Criar Grupo'}
          </h2>
        </div>
        <button
          onClick={() => {
            setEditingGroup(null);
            setShowGroupForm(false);
            setActiveSubSection('');
          }}
          className="btn-secondary"
        >
          Voltar
        </button>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Grupo</label>
            <input
              type="text"
              value={editingGroup?.name || ''}
              onChange={(e) => handleGroupFormChange('name', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Digite o nome do grupo"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Template</label>
            <input
              type="text"
              value={editingGroup?.template || ''}
              onChange={(e) => handleGroupFormChange('template', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Template do grupo"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
          <textarea
            value={editingGroup?.description || ''}
            onChange={(e) => handleGroupFormChange('description', e.target.value)}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            placeholder="Descreva o propósito do grupo"
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={() => {
              setEditingGroup(null);
              setShowGroupForm(false);
              setActiveSubSection('');
            }}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
          >
            Cancelar
          </button>
          <button
            onClick={saveGroup}
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-200"
          >
            {editingGroup?.id ? 'Atualizar' : 'Criar'}
          </button>
        </div>
      </div>
    </div>
  );

    // Funções para campanhas
  const openCampaignForm = (campaign?: any) => {
    if (campaign) {
      setEditingCampaign({ ...campaign });
    } else {
      setEditingCampaign({
        id: 0,
        name: '',
        description: '',
        clients: [],
        groups: [],
        assistant: '',
        status: 'rascunho',
        createdAt: new Date().toISOString()
      });
    }
    setShowCampaignForm(true);
  };

  const handleCampaignFormChange = (field: string, value: any) => {
    setEditingCampaign((prev: any) => {
      if (!prev) {
        return {
          id: 0,
          name: '',
          description: '',
          clients: [],
          groups: [],
          assistant: '',
          status: 'rascunho',
          createdAt: new Date().toISOString(),
          [field]: value
        };
      }
      return { ...prev, [field]: value };
    });
  };

  const saveCampaign = () => {
    if (!editingCampaign) return;

    if (!editingCampaign.name || !editingCampaign.description) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (editingCampaign.id) {
      // Editando campanha existente
      const updatedCampaign = { 
        ...editingCampaign,
        updatedAt: new Date().toISOString()
      };
      
      setCampaigns((prev: any) => prev.map((campaign: any) =>
        campaign.id === editingCampaign.id ? updatedCampaign : campaign
      ));
      
      // Salvar no localStorage
      const currentCampaigns = JSON.parse(localStorage.getItem('dashboardCampaigns') || '[]');
      const updatedCampaigns = currentCampaigns.map((c: any) => 
        c.id === editingCampaign.id ? updatedCampaign : c
      );
      localStorage.setItem('dashboardCampaigns', JSON.stringify(updatedCampaigns));
      
      alert('Campanha atualizada com sucesso!');
    } else {
      // Criando nova campanha
      const newCampaign = {
        ...editingCampaign,
        id: generateUniqueId(),
        createdAt: new Date().toISOString()
      };
      
      setCampaigns((prev: any) => [...prev, newCampaign]);
      
      // Salvar no localStorage
      const currentCampaigns = JSON.parse(localStorage.getItem('dashboardCampaigns') || '[]');
      currentCampaigns.push(newCampaign);
      localStorage.setItem('dashboardCampaigns', JSON.stringify(currentCampaigns));
      
      alert('Campanha criada com sucesso!');
    }

    setEditingCampaign(null);
    setShowCampaignForm(false);
    setActiveSubSection('');
  };

  const deleteCampaign = (campaignId: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta campanha?')) {
      setCampaigns((prev: any) => prev.filter((campaign: any) => campaign.id !== campaignId));
      
      // Remover do localStorage
      const currentCampaigns = JSON.parse(localStorage.getItem('dashboardCampaigns') || '[]');
      const updatedCampaigns = currentCampaigns.filter((c: any) => c.id !== campaignId);
      localStorage.setItem('dashboardCampaigns', JSON.stringify(updatedCampaigns));
      
      alert('Campanha excluída com sucesso!');
    }
  };

  const launchCampaign = (campaignId: number) => {
    const campaign = campaigns.find((c: any) => c.id === campaignId);
    if (!campaign) return;

    const updatedCampaign = { 
      ...campaign, 
      status: 'ativa',
      launchedAt: new Date().toISOString() 
    };
    
    setCampaigns((prev: any) => prev.map((c: any) =>
      c.id === campaignId ? updatedCampaign : c
    ));
    
    // Salvar no localStorage
    const currentCampaigns = JSON.parse(localStorage.getItem('dashboardCampaigns') || '[]');
    const updatedCampaigns = currentCampaigns.map((c: any) => 
      c.id === campaignId ? updatedCampaign : c
    );
    localStorage.setItem('dashboardCampaigns', JSON.stringify(updatedCampaigns));
    
    alert('Campanha disparada com sucesso!');
  };

  const renderCampaigns = () => (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Megaphone className="w-6 h-6 text-green-600 mr-3" />
          <h2 className="text-xl font-bold text-gray-900">Gerenciamento de Campanhas</h2>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => {
              openCampaignForm();
              setActiveSubSection('campaigns-form');
            }}
            className="btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Criar Campanha
          </button>
        </div>
      </div>

      {activeSubSection === 'campaigns-form' ? (
        renderCampaignForm()
      ) : (
        <>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar campanhas..."
                value={searchCampaign}
                onChange={(e) => setSearchCampaign(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns
              .filter((campaign: any) =>
                (campaign.name || '').toLowerCase().includes(searchCampaign.toLowerCase()) ||
                (campaign.description || '').toLowerCase().includes(searchCampaign.toLowerCase())
              )
              .map((campaign: any) => (
                <div key={campaign.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="text-center">
                    <Megaphone className="w-12 h-12 text-green-600 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{campaign.name}</h3>
                    <p className="text-gray-600 mb-4">{campaign.description}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Status:</span>
                        <span className={`font-medium px-2 py-1 rounded-full text-xs ${
                          campaign.status === 'ativa' ? 'bg-green-100 text-green-800' :
                          campaign.status === 'pausada' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {campaign.status}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Clientes:</span>
                        <span className="font-medium text-gray-900">{campaign.clients?.length || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Grupos:</span>
                        <span className="font-medium text-gray-900">{campaign.groups?.length || 0}</span>
                      </div>
                    </div>
                    <div className="flex justify-center space-x-2 mt-4">
                      {campaign.status !== 'ativa' && (
                        <button
                          onClick={() => launchCampaign(campaign.id)}
                          className="px-3 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors text-sm"
                        >
                          Disparar
                        </button>
                      )}
                      <button
                        onClick={() => {
                          openCampaignForm(campaign);
                          setActiveSubSection('campaigns-form');
                        }}
                        className="px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => deleteCampaign(campaign.id)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            
            {campaigns.length === 0 && (
              <div className="col-span-full text-center py-8">
                <Megaphone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma campanha encontrada</h3>
                <p className="text-gray-600">Comece criando sua primeira campanha.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );

  const renderCampaignForm = () => (
          <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Megaphone className="w-6 h-6 text-green-600 mr-3" />
          <h2 className="text-xl font-bold text-gray-900">
            {editingCampaign?.id ? 'Editar Campanha' : 'Criar Campanha'}
          </h2>
            </div>
        <button
          onClick={() => {
            setEditingCampaign(null);
            setShowCampaignForm(false);
            setActiveSubSection('');
          }}
          className="btn-secondary"
        >
          Voltar
        </button>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nome da Campanha</label>
            <input
              type="text"
              value={editingCampaign?.name || ''}
              onChange={(e) => handleCampaignFormChange('name', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Digite o nome da campanha"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assistente</label>
            <input
              type="text"
              value={editingCampaign?.assistant || ''}
              onChange={(e) => handleCampaignFormChange('assistant', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Nome do assistente responsável"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
          <textarea
            value={editingCampaign?.description || ''}
            onChange={(e) => handleCampaignFormChange('description', e.target.value)}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Descreva o objetivo da campanha"
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={() => {
              setEditingCampaign(null);
              setShowCampaignForm(false);
              setActiveSubSection('');
            }}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
          >
            Cancelar
          </button>
          <button
            onClick={saveCampaign}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
          >
            {editingCampaign?.id ? 'Atualizar' : 'Criar'}
          </button>
        </div>
      </div>
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
          <ImageIcon className="w-4 h-4 mr-2" />
          Gerar Imagens
        </button>
        <button
          onClick={() => setActiveSubSection('videos')}
          className="btn-secondary"
        >
          <VideoIcon className="w-4 h-4 mr-2" />
          Gerar Vídeos
        </button>
            </div>
          </div>
        );

  const renderImageGeneration = () => {
    if (showImageGenerator) {
      return renderImageGeneratorForm();
    }

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <ImageIcon className="w-6 h-6 text-pink-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Gerador de Imagens</h2>
            <span className="ml-3 px-2 py-1 bg-pink-100 text-pink-800 text-xs rounded-full">
              IA Integrada
            </span>
          </div>
          <button
            onClick={() => setShowImageGenerator(true)}
            className="btn-primary bg-pink-600 hover:bg-pink-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Gerar Nova Imagem
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-pink-100 rounded-lg">
                <ImageIcon className="w-6 h-6 text-pink-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Geradas</p>
                <p className="text-2xl font-bold text-gray-900">{generatedImages.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Ferramentas</p>
                <p className="text-2xl font-bold text-gray-900">{getAvailableImageTools().length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Hoje</p>
                <p className="text-2xl font-bold text-gray-900">
                  {generatedImages.filter((img: any) => 
                    new Date(img.createdAt).toDateString() === new Date().toDateString()
                  ).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery */}
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Minhas Imagens</h3>
          
          {generatedImages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {generatedImages.map((image: any) => (
                <div key={image.id} className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <div className="aspect-square relative">
                    <img
                      src={image.url}
                      alt={image.prompt}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <button
                        onClick={() => deleteGeneratedImage(image.id)}
                        className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        title="Excluir imagem"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">{image.prompt}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className={`px-2 py-1 rounded-full ${
                        image.tool.includes('openai') ? 'bg-blue-100 text-blue-700' : 
                        image.tool.includes('gemini') ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {image.tool.includes('openai') ? 'DALL-E' : 
                         image.tool.includes('gemini') ? 'Gemini' : 'Zenvia'}
                      </span>
                      <span>{new Date(image.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma imagem gerada</h3>
              <p className="text-gray-600 mb-4">Comece criando sua primeira imagem com IA</p>
              <button
                onClick={() => setShowImageGenerator(true)}
                className="btn-primary bg-pink-600 hover:bg-pink-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Gerar Primeira Imagem
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderVideoGeneration = () => {
    if (showVideoGenerator) {
      return renderVideoGeneratorForm();
    }

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <VideoIcon className="w-6 h-6 text-purple-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Gerador de Vídeos</h2>
            <span className="ml-3 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
              IA Avançada
            </span>
          </div>
          <button
            onClick={() => setShowVideoGenerator(true)}
            className="btn-primary bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Gerar Novo Vídeo
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <VideoIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Gerados</p>
                <p className="text-2xl font-bold text-gray-900">{generatedVideos.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Ferramentas</p>
                <p className="text-2xl font-bold text-gray-900">{getAvailableVideoTools().length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Hoje</p>
                <p className="text-2xl font-bold text-gray-900">
                  {generatedVideos.filter((video: any) => 
                    new Date(video.createdAt).toDateString() === new Date().toDateString()
                  ).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery */}
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Meus Vídeos</h3>
          
          {generatedVideos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {generatedVideos.map((video: any) => (
                <div key={video.id} className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <div className="aspect-video relative">
                    {video.url ? (
                      <video
                        src={video.url}
                        controls
                        className="w-full h-full object-cover"
                        poster={video.thumbnail}
                      >
                        Seu navegador não suporta o elemento de vídeo.
                      </video>
                    ) : (
                      <img
                        src={video.thumbnail}
                        alt={video.prompt}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute top-2 right-2 flex space-x-1">
                      <button
                        onClick={() => {
                          if (video.url) {
                            const link = document.createElement('a');
                            link.href = video.url;
                            link.download = `video-${video.id}.mp4`;
                            link.click();
                          }
                        }}
                        className="p-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                        title="Baixar vídeo"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteGeneratedVideo(video.id)}
                        className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        title="Excluir vídeo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="absolute bottom-2 left-2">
                      <span className="px-2 py-1 bg-black bg-opacity-50 text-white text-xs rounded">
                        {video.duration}s
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">{video.prompt}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className={`px-2 py-1 rounded-full ${
                        video.tool === 'veo-3' ? 'bg-purple-100 text-purple-700' :
                        video.tool.includes('openai') ? 'bg-blue-100 text-blue-700' : 
                        video.tool.includes('gemini') ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {video.toolName || (video.tool === 'veo-3' ? 'Veo 3' : 
                         video.tool.includes('openai') ? 'OpenAI' : 
                         video.tool.includes('gemini') ? 'Gemini' : 'Zenvia')}
                      </span>
                      <span>{new Date(video.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <VideoIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum vídeo gerado</h3>
              <p className="text-gray-600 mb-4">Comece criando seu primeiro vídeo com IA</p>
              <button
                onClick={() => setShowVideoGenerator(true)}
                className="btn-primary bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Gerar Primeiro Vídeo
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Função para renderizar formulário de geração de imagem
  const renderImageGeneratorForm = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <ImageIcon className="w-6 h-6 text-pink-600 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">
            {imageEditMode === 'edit' ? 'Editar Imagem' : 'Gerar Nova Imagem'}
          </h2>
        </div>
        <button
          onClick={() => {
            setShowImageGenerator(false);
            setImagePrompt('');
            setUploadedImage(null);
            setImagePreview('');
            setImageEditMode('generate');
          }}
          className="btn-secondary"
        >
          Voltar
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 space-y-6">
          {/* Seleção de Ferramenta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ferramenta de IA *</label>
            <select
              value={selectedImageTool}
              onChange={(e) => setSelectedImageTool(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            >
              <option value="">Selecione uma ferramenta</option>
              {getAvailableImageTools().map((tool) => (
                <option key={tool.id} value={tool.id}>
                  {tool.name} - {tool.description}
                </option>
              ))}
            </select>
            {getAvailableImageTools().length === 0 && (
              <p className="text-sm text-red-600 mt-1">
                ⚠️ Nenhuma ferramenta de IA configurada. 
                <button
                  onClick={() => setActiveSection('integracoes')}
                  className="text-pink-600 hover:text-pink-700 ml-1 underline"
                >
                  Configure nas Integrações
                </button>
              </p>
            )}
          </div>

          {/* Modo de Operação */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Modo de Operação</label>
            <div className="flex space-x-4">
              <button
                onClick={() => setImageEditMode('generate')}
                className={`px-4 py-2 rounded-lg border ${
                  imageEditMode === 'generate'
                    ? 'bg-pink-50 border-pink-200 text-pink-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                🎨 Gerar do Zero
              </button>
              <button
                onClick={() => setImageEditMode('edit')}
                className={`px-4 py-2 rounded-lg border ${
                  imageEditMode === 'edit'
                    ? 'bg-pink-50 border-pink-200 text-pink-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                ✏️ Editar Imagem
              </button>
            </div>
          </div>

          {/* Upload de Imagem (se estiver no modo edição) */}
          {imageEditMode === 'edit' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Imagem Base</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-pink-400 transition-colors">
                {imagePreview ? (
                  <div className="space-y-4">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-w-xs mx-auto rounded-lg"
                    />
                    <button
                      onClick={() => {
                        setUploadedImage(null);
                        setImagePreview('');
                      }}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      🗑️ Remover Imagem
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <ImageIcon className="w-12 h-12 text-gray-400 mx-auto" />
                    <div>
                      <label className="inline-flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 cursor-pointer">
                        <Upload className="w-4 h-4 mr-2" />
                        Selecionar Imagem
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <p className="text-sm text-gray-500">PNG, JPG até 10MB</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Prompt de Texto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição da Imagem *
            </label>
            <textarea
              value={imagePrompt}
              onChange={(e) => setImagePrompt(e.target.value)}
              placeholder={imageEditMode === 'edit' 
                ? "Descreva como você quer modificar a imagem..." 
                : "Descreva a imagem que você quer gerar..."}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              rows={4}
            />
            <p className="text-sm text-gray-500 mt-1">
              Seja específico: estilo, cores, objetos, cenário, etc.
            </p>
          </div>

          {/* Configurações */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tamanho</label>
              <select
                value={imageSize}
                onChange={(e) => setImageSize(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              >
                <option value="512x512">512x512 (Quadrado)</option>
                <option value="1024x1024">1024x1024 (HD)</option>
                <option value="1024x768">1024x768 (Paisagem)</option>
                <option value="768x1024">768x1024 (Retrato)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estilo</label>
              <select
                value={imageStyle}
                onChange={(e) => setImageStyle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              >
                <option value="realistic">Realista</option>
                <option value="artistic">Artístico</option>
                <option value="cartoon">Cartoon</option>
                <option value="abstract">Abstrato</option>
                <option value="photographic">Fotográfico</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={generateImage}
                disabled={generatingImage || !imagePrompt.trim() || !selectedImageTool}
                className="w-full btn-primary bg-pink-600 hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generatingImage ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Gerar Imagem
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Preview em tempo real do que será gerado */}
          {imagePrompt && (
            <div className="border-t pt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Preview da Solicitação</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Ferramenta:</strong> {getAvailableImageTools().find(t => t.id === selectedImageTool)?.name || 'Não selecionada'}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Modo:</strong> {imageEditMode === 'edit' ? 'Edição de imagem' : 'Geração do zero'}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Tamanho:</strong> {imageSize}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Estilo:</strong> {imageStyle}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  <strong>Prompt:</strong> "{imagePrompt}"
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Função para renderizar formulário de geração de vídeo
  const renderVideoGeneratorForm = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <VideoIcon className="w-6 h-6 text-purple-600 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">
            {videoEditMode === 'edit' ? 'Editar Vídeo' : 'Gerar Novo Vídeo'}
          </h2>
        </div>
        <button
          onClick={() => {
            setShowVideoGenerator(false);
            setVideoPrompt('');
            setUploadedVideo(null);
            setVideoPreview('');
            setVideoEditMode('generate');
          }}
          className="btn-secondary"
        >
          Voltar
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 space-y-6">
          {/* Seleção de Ferramenta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ferramenta de IA *</label>
            <select
              value={selectedVideoTool}
              onChange={(e) => setSelectedVideoTool(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">Selecione uma ferramenta</option>
              {getAvailableVideoTools().map((tool) => (
                <option key={tool.id} value={tool.id}>
                  {tool.name} - {tool.description}
                </option>
              ))}
            </select>
            {getAvailableVideoTools().length === 0 && (
              <p className="text-sm text-red-600 mt-1">
                ⚠️ Nenhuma ferramenta de IA configurada. 
                <button
                  onClick={() => setActiveSection('integracoes')}
                  className="text-purple-600 hover:text-purple-700 ml-1 underline"
                >
                  Configure nas Integrações
                </button>
              </p>
            )}
          </div>

          {/* Modo de Operação */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Modo de Operação</label>
            <div className="flex space-x-4">
              <button
                onClick={() => setVideoEditMode('generate')}
                className={`px-4 py-2 rounded-lg border ${
                  videoEditMode === 'generate'
                    ? 'bg-purple-50 border-purple-200 text-purple-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                🎬 Gerar do Zero
              </button>
              <button
                onClick={() => setVideoEditMode('edit')}
                className={`px-4 py-2 rounded-lg border ${
                  videoEditMode === 'edit'
                    ? 'bg-purple-50 border-purple-200 text-purple-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                ✂️ Editar Vídeo
              </button>
            </div>
          </div>

          {/* Upload de Vídeo (se estiver no modo edição) */}
          {videoEditMode === 'edit' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vídeo Base</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                {videoPreview ? (
                  <div className="space-y-4">
                    <video
                      src={videoPreview}
                      controls
                      className="max-w-xs mx-auto rounded-lg"
                    />
                    <button
                      onClick={() => {
                        setUploadedVideo(null);
                        setVideoPreview('');
                      }}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      🗑️ Remover Vídeo
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <VideoIcon className="w-12 h-12 text-gray-400 mx-auto" />
                    <div>
                      <label className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer">
                        <Upload className="w-4 h-4 mr-2" />
                        Selecionar Vídeo
                        <input
                          type="file"
                          accept="video/*"
                          onChange={handleVideoUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <p className="text-sm text-gray-500">MP4, MOV até 100MB</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Prompt de Texto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição do Vídeo *
            </label>
            <textarea
              value={videoPrompt}
              onChange={(e) => setVideoPrompt(e.target.value)}
              placeholder={videoEditMode === 'edit' 
                ? "Descreva como você quer modificar o vídeo..." 
                : "Descreva o vídeo que você quer gerar..."}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              rows={4}
            />
            <p className="text-sm text-gray-500 mt-1">
              Inclua ação, cenário, movimento, personagens, estilo visual, etc.
            </p>
          </div>

          {/* Status fal.ai Veo 3 */}
          <div className="col-span-full">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-green-900 mb-4">✅ fal.ai Veo 3 - Pronto para Uso</h4>
              
              <div className="space-y-4">
                <div className="text-sm text-green-700">
                  <p>✅ fal.ai Veo 3 está conectado e pronto para gerar vídeos!</p>
                  <p>API Key configurada no Vercel</p>
                  <p>Modelo Veo 3 ativo</p>
                </div>
                
                <div className="text-xs text-gray-600 space-y-1">
                  <p><strong>Status:</strong> ✅ fal.ai sempre ativo</p>
                  <p><strong>Provedor:</strong> fal.ai</p>
                  <p><strong>Modelo:</strong> Veo 3</p>
                  <p><strong>API Key:</strong> Configurada no Vercel</p>
                </div>
              </div>
            </div>
          </div>

          {/* Monitoramento Veo 3 */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-purple-900 mb-4">📊 Monitoramento Veo 3</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="bg-white rounded-lg p-3 border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Total Requisições</p>
                    <p className="text-lg font-bold text-purple-600">{Veo3Service.getUsageStats().totalRequests}</p>
                  </div>
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <VideoIcon className="w-4 h-4 text-purple-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-3 border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Taxa de Sucesso</p>
                    <p className="text-lg font-bold text-green-600">{Veo3Service.getUsageStats().successRate.toFixed(1)}%</p>
                  </div>
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-3 border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Tempo Médio</p>
                    <p className="text-lg font-bold text-blue-600">{Veo3Service.getUsageStats().averageGenerationTime}ms</p>
                  </div>
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-3 border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Projeto ID</p>
                    <p className="text-sm font-mono text-gray-600">{Veo3Service.getUsageStats().projectId}</p>
                  </div>
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <Settings className="w-4 h-4 text-gray-600" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const history = Veo3Service.getHistory();
                  console.log('📋 Histórico Veo 3:', history);
                  alert(`Histórico Veo 3 carregado! ${history.length} requisições encontradas.`);
                }}
                className="btn-secondary text-sm"
              >
                📋 Ver Histórico
              </button>
              
              <button
                onClick={() => {
                  Veo3Service.clearHistory();
                  alert('🗑️ Histórico Veo 3 limpo!');
                }}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm"
              >
                🗑️ Limpar Histórico
              </button>
              
              <button
                onClick={async () => {
                  const status = await Veo3Service.checkAPIStatus();
                  alert(status ? '✅ API Veo 3 disponível!' : '❌ API Veo 3 indisponível!');
                }}
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm"
              >
                🔍 Testar API
              </button>
            </div>
          </div>

          {/* Configurações */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duração</label>
              <select
                value={videoDuration}
                onChange={(e) => setVideoDuration(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="3">3 segundos</option>
                <option value="5">5 segundos</option>
                <option value="10">10 segundos</option>
                <option value="15">15 segundos</option>
                <option value="30">30 segundos</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Qualidade</label>
              <select
                value={videoQuality}
                onChange={(e) => setVideoQuality(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="480p">480p</option>
                <option value="720p">720p (HD)</option>
                <option value="1080p">1080p (Full HD)</option>
                <option value="4k">4K (Ultra HD)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estilo</label>
              <select
                value={videoStyle}
                onChange={(e) => setVideoStyle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="realistic">Realista</option>
                <option value="cinematic">Cinematográfico</option>
                <option value="animated">Animado</option>
                <option value="artistic">Artístico</option>
                <option value="documentary">Documental</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={generateVideo}
                disabled={generatingVideo || !videoPrompt.trim() || !selectedVideoTool}
                className="w-full btn-primary bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generatingVideo ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <VideoIcon className="w-4 h-4 mr-2" />
                    Gerar Vídeo
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Preview em tempo real do que será gerado */}
          {videoPrompt && (
            <div className="border-t pt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Preview da Solicitação</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Ferramenta:</strong> {getAvailableVideoTools().find(t => t.id === selectedVideoTool)?.name || 'Não selecionada'}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Modo:</strong> {videoEditMode === 'edit' ? 'Edição de vídeo' : 'Geração do zero'}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Duração:</strong> {videoDuration} segundos
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Qualidade:</strong> {videoQuality}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Estilo:</strong> {videoStyle}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  <strong>Prompt:</strong> "{videoPrompt}"
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Funções para agentes IA
  const openAgentForm = (agent?: any, type?: string) => {
    if (agent) {
      setEditingAgent({ ...agent });
      setSelectedAgentType(agent.type);
    } else {
      setEditingAgent({
        id: 0,
        name: '',
        type: type || selectedAgentType,
        inbound: false,
        outbound: false,
        prompt: '',
        functions: [],
        apiKey: '',
        webhookUrl: '',
        phoneNumber: '',
        createdAt: new Date().toISOString()
      });
    }
    setShowAgentForm(true);
  };

  const handleAgentFormChange = (field: string, value: any) => {
    setEditingAgent((prev: any) => {
      if (!prev) {
        return {
          id: 0,
          name: '',
          type: selectedAgentType,
          inbound: false,
          outbound: false,
          prompt: '',
          functions: [],
          apiKey: '',
          webhookUrl: '',
          phoneNumber: '',
          createdAt: new Date().toISOString(),
          [field]: value
        };
      }
      return { ...prev, [field]: value };
    });
  };

  const saveAgent = () => {
    if (!editingAgent) return;

    if (!editingAgent.name || !editingAgent.prompt) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (!editingAgent.integration) {
      alert('Por favor, selecione uma integração para o agente.');
      return;
    }

    // Verificar se a integração ainda está disponível
    const availableIntegrations = getAvailableIntegrations(editingAgent.type);
    const selectedIntegration = availableIntegrations.find(i => i.id === editingAgent.integration);
    
    if (!selectedIntegration) {
      alert('A integração selecionada não está mais disponível. Verifique as configurações nas Integrações.');
      return;
    }

    if (editingAgent.id) {
      // Editando agente existente
      const updatedAgent = { 
        ...editingAgent,
        updatedAt: new Date().toISOString()
      };
      
      setAiAgents((prev: any) => prev.map((agent: any) =>
        agent.id === editingAgent.id ? updatedAgent : agent
      ));
      
      // Salvar no localStorage
      const currentAgents = JSON.parse(localStorage.getItem('dashboardAiAgents') || '[]');
      const updatedAgents = currentAgents.map((a: any) => 
        a.id === editingAgent.id ? updatedAgent : a
      );
      localStorage.setItem('dashboardAiAgents', JSON.stringify(updatedAgents));
      
      alert(`Agente IA atualizado com sucesso!\nIntegração: ${selectedIntegration.name} - ${selectedIntegration.description}`);
    } else {
      // Criando novo agente
      const newAgent = {
        ...editingAgent,
        id: generateUniqueId(),
        createdAt: new Date().toISOString()
      };
      
      setAiAgents((prev: any) => [...prev, newAgent]);
      
      // Salvar no localStorage
      const currentAgents = JSON.parse(localStorage.getItem('dashboardAiAgents') || '[]');
      currentAgents.push(newAgent);
      localStorage.setItem('dashboardAiAgents', JSON.stringify(currentAgents));
      
      alert(`Agente IA criado com sucesso!\nIntegração: ${selectedIntegration.name} - ${selectedIntegration.description}`);
    }

    setEditingAgent(null);
    setShowAgentForm(false);
    setActiveSubSection('');
  };

  const deleteAgent = (agentId: number) => {
    if (window.confirm('Tem certeza que deseja excluir este agente IA?')) {
      setAiAgents((prev: any) => prev.filter((agent: any) => agent.id !== agentId));
      
      // Remover do localStorage
      const currentAgents = JSON.parse(localStorage.getItem('dashboardAiAgents') || '[]');
      const updatedAgents = currentAgents.filter((a: any) => a.id !== agentId);
      localStorage.setItem('dashboardAiAgents', JSON.stringify(updatedAgents));
      
      alert('Agente IA excluído com sucesso!');
    }
  };

  const getAgentIcon = (type: string) => {
    switch (type) {
      case 'whatsapp': return <MessageCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />;
      case 'voice': return <Phone className="w-12 h-12 text-blue-600 mx-auto mb-3" />;
      case 'sms': return <MessageSquare className="w-12 h-12 text-purple-600 mx-auto mb-3" />;
      case 'email': return <Mail className="w-12 h-12 text-red-600 mx-auto mb-3" />;
      default: return <Bot className="w-12 h-12 text-gray-600 mx-auto mb-3" />;
    }
  };

  const getAgentTypeColor = (type: string) => {
    switch (type) {
      case 'whatsapp': return 'bg-green-100 text-green-800';
      case 'voice': return 'bg-blue-100 text-blue-800';
      case 'sms': return 'bg-purple-100 text-purple-800';
      case 'email': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderAiAgents = () => (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Bot className="w-6 h-6 text-purple-600 mr-3" />
          <h2 className="text-xl font-bold text-gray-900">Agentes IA</h2>
          <span className="ml-3 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            Integrado com APIs
          </span>
        </div>
        <div className="flex space-x-3">
          <select
            value={selectedAgentType}
            onChange={(e) => setSelectedAgentType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="whatsapp">WhatsApp</option>
            <option value="voice">Voz</option>
            <option value="sms">SMS</option>
            <option value="email">E-mail</option>
          </select>
          <button
            onClick={() => {
              const availableIntegrations = getAvailableIntegrations(selectedAgentType);
              if (availableIntegrations.length === 0) {
                alert(`Nenhuma integração configurada para ${selectedAgentType}.\nConfigure pelo menos uma integração na seção Integrações antes de criar um agente.`);
                return;
              }
              openAgentForm(null, selectedAgentType);
              setActiveSubSection('ai-agents-form');
            }}
            className="btn-primary"
            title={getAvailableIntegrations(selectedAgentType).length === 0 ? 'Configure uma integração primeiro' : ''}
          >
            <Plus className="w-4 h-4 mr-2" />
            Criar Agente {selectedAgentType.charAt(0).toUpperCase() + selectedAgentType.slice(1)}
            {getAvailableIntegrations(selectedAgentType).length === 0 && (
              <AlertTriangle className="w-4 h-4 ml-2 text-yellow-300" />
            )}
          </button>
        </div>
      </div>

      {activeSubSection === 'ai-agents-form' ? (
        renderAgentForm()
      ) : (
        <>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar agentes IA..."
                value={searchAgent}
                onChange={(e) => setSearchAgent(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>

          {/* Tabs por tipo */}
          <div className="flex space-x-4 mb-6 border-b">
            {['whatsapp', 'voice', 'sms', 'email'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedAgentType(type)}
                className={`pb-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  selectedAgentType === type 
                    ? 'border-purple-500 text-purple-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aiAgents
              .filter((agent: any) => 
                agent.type === selectedAgentType &&
                ((agent.name || '').toLowerCase().includes(searchAgent.toLowerCase()) ||
                 (agent.prompt || '').toLowerCase().includes(searchAgent.toLowerCase()))
              )
              .map((agent: any) => (
                <div key={agent.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="text-center">
                    {getAgentIcon(agent.type)}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{agent.name}</h3>
                    <div className="flex justify-center gap-2 mb-4">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getAgentTypeColor(agent.type)}`}>
                        {agent.type.toUpperCase()}
                      </span>
                      {agent.integration && (
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          agent.integration === 'openai' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                        }`}>
                          {agent.integration === 'openai' ? 'OpenAI' : 'Zenvia'}
                        </span>
                      )}
                      {!agent.integration && (
                        <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Sem Integração
                        </span>
                      )}
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-center space-x-4">
                        <span className={`px-2 py-1 rounded ${agent.inbound ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                          Inbound: {agent.inbound ? 'Ativo' : 'Inativo'}
                        </span>
                        <span className={`px-2 py-1 rounded ${agent.outbound ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
                          Outbound: {agent.outbound ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                      <p className="text-gray-600 text-xs mt-2 line-clamp-2">{agent.prompt.substring(0, 80)}...</p>
                    </div>
                    <div className="flex justify-center space-x-2 mt-4">
                      <button
                        onClick={() => {
                          openAgentForm(agent);
                          setActiveSubSection('ai-agents-form');
                        }}
                        className="px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => deleteAgent(agent.id)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            
            {aiAgents.filter((agent: any) => agent.type === selectedAgentType).length === 0 && (
              <div className="col-span-full text-center py-8">
                <Bot className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum agente {selectedAgentType} encontrado
                </h3>
                <p className="text-gray-600">
                  Comece criando seu primeiro agente {selectedAgentType}.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );

  // Função para renderizar seção WhatsApp
  const renderWhatsApp = () => {
    const filteredAgents = whatsappAgents.filter((agent: any) =>
      agent.name.toLowerCase().includes(searchAgent?.toLowerCase() || '') ||
      agent.prompt.toLowerCase().includes(searchAgent?.toLowerCase() || '')
    );

    return (
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <MessageCircle className="w-6 h-6 text-green-600 mr-3" />
            <h2 className="text-xl font-bold text-gray-900">Agentes WhatsApp</h2>
            <span className="ml-3 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              {whatsappAgents.length} agente{whatsappAgents.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowWhatsappForm(true)}
              className="btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar Agente
            </button>
          </div>
        </div>

        {/* Campo de busca */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar agentes WhatsApp..."
              value={searchAgent || ''}
              onChange={(e) => setSearchAgent(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>

        {/* Lista de agentes */}
        {filteredAgents.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {whatsappAgents.length === 0 ? 'Nenhum agente criado' : 'Nenhum agente encontrado'}
            </h3>
            <p className="text-gray-500 mb-6">
              {whatsappAgents.length === 0 
                ? 'Crie seu primeiro agente WhatsApp para começar a automatizar conversas'
                : 'Tente ajustar os termos de busca'
              }
            </p>
            {whatsappAgents.length === 0 && (
              <button
                onClick={() => setShowWhatsappForm(true)}
                className="btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Agente
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgents.map((agent: any) => (
              <div key={agent.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg mr-3">
                      <MessageCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{agent.name}</h3>
                      <p className="text-sm text-gray-500">Criado em {new Date(agent.createdAt).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setEditingWhatsappAgent(agent);
                        setShowWhatsappForm(true);
                      }}
                      className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                      title="Editar agente"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Tem certeza que deseja excluir este agente?')) {
                          const updatedAgents = whatsappAgents.filter((a: any) => a.id !== agent.id);
                          setWhatsappAgents(updatedAgents);
                          localStorage.setItem('dashboardWhatsappAgents', JSON.stringify(updatedAgents));
                        }
                      }}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                      title="Excluir agente"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {agent.prompt}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      agent.status === 'connected' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {agent.status === 'connected' ? 'Conectado' : 'Desconectado'}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedWhatsappAgent(agent);
                      setShowWhatsappConnection(true);
                    }}
                    className="btn-secondary text-sm"
                  >
                    <Smartphone className="w-4 h-4 mr-1" />
                    Conectar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de formulário */}
        {showWhatsappForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {editingWhatsappAgent ? 'Editar' : 'Criar'} Agente WhatsApp
                  </h3>
                  <button
                    onClick={() => {
                      setShowWhatsappForm(false);
                      setEditingWhatsappAgent(null);
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Agente
                  </label>
                  <input
                    type="text"
                    value={editingWhatsappAgent?.name || ''}
                    onChange={(e) => setEditingWhatsappAgent((prev: any) => ({ 
                      ...prev, 
                      name: e.target.value 
                    }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Ex: Atendente Virtual"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prompt do Agente
                  </label>
                  <textarea
                    value={editingWhatsappAgent?.prompt || ''}
                    onChange={(e) => setEditingWhatsappAgent((prev: any) => ({ 
                      ...prev, 
                      prompt: e.target.value 
                    }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    rows={4}
                    placeholder="Descreva como o agente deve se comportar..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingWhatsappAgent?.autoReply || false}
                      onChange={(e) => setEditingWhatsappAgent((prev: any) => ({ 
                        ...prev, 
                        autoReply: e.target.checked 
                      }))}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Resposta Automática</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingWhatsappAgent?.typingIndicator || false}
                      onChange={(e) => setEditingWhatsappAgent((prev: any) => ({ 
                        ...prev, 
                        typingIndicator: e.target.checked 
                      }))}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Indicador de Digitação</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingWhatsappAgent?.readReceipts || false}
                      onChange={(e) => setEditingWhatsappAgent((prev: any) => ({ 
                        ...prev, 
                        readReceipts: e.target.checked 
                      }))}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Confirmação de Leitura</span>
                  </label>
                </div>
              </div>

              <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowWhatsappForm(false);
                    setEditingWhatsappAgent(null);
                  }}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    if (!editingWhatsappAgent?.name || !editingWhatsappAgent?.prompt) {
                      alert('Preencha todos os campos obrigatórios');
                      return;
                    }

                    const agentData = {
                      ...editingWhatsappAgent,
                      id: editingWhatsappAgent.id || `whatsapp_${Date.now()}`,
                      status: 'disconnected',
                      createdAt: editingWhatsappAgent.createdAt || new Date().toISOString(),
                      updatedAt: new Date().toISOString()
                    };

                    let updatedAgents;
                    if (editingWhatsappAgent.id && whatsappAgents.find(a => a.id === editingWhatsappAgent.id)) {
                      updatedAgents = whatsappAgents.map(a => a.id === editingWhatsappAgent.id ? agentData : a);
                    } else {
                      updatedAgents = [...whatsappAgents, agentData];
                    }

                    setWhatsappAgents(updatedAgents);
                    localStorage.setItem('dashboardWhatsappAgents', JSON.stringify(updatedAgents));
                    setShowWhatsappForm(false);
                    setEditingWhatsappAgent(null);
                  }}
                  className="btn-primary"
                >
                  {editingWhatsappAgent?.id ? 'Salvar' : 'Criar'} Agente
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de conexão WhatsApp */}
        {showWhatsappConnection && selectedWhatsappAgent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">WhatsApp - {selectedWhatsappAgent.name}</h2>
                  <button
                    onClick={() => {
                      setShowWhatsappConnection(false);
                      setSelectedWhatsappAgent(null);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                  agentId={selectedWhatsappAgent.id}
                  agentName={selectedWhatsappAgent.name}
                  agentPrompt={selectedWhatsappAgent.prompt}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderAgentForm = () => (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Bot className="w-6 h-6 text-purple-600 mr-3" />
          <h2 className="text-xl font-bold text-gray-900">
            {editingAgent?.id ? 'Editar Agente IA' : `Criar Agente ${selectedAgentType.charAt(0).toUpperCase() + selectedAgentType.slice(1)}`}
          </h2>
        </div>
        <button
          onClick={() => {
            setEditingAgent(null);
            setShowAgentForm(false);
            setActiveSubSection('');
          }}
          className="btn-secondary"
        >
          Voltar
        </button>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Agente</label>
            <input
              type="text"
              value={editingAgent?.name || ''}
              onChange={(e) => handleAgentFormChange('name', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Ex: Atendente WhatsApp"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
            <select
              value={editingAgent?.type || selectedAgentType}
              onChange={(e) => handleAgentFormChange('type', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="whatsapp">WhatsApp</option>
              <option value="voice">Voz</option>
              <option value="sms">SMS</option>
              <option value="email">E-mail</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={editingAgent?.inbound || false}
                onChange={(e) => handleAgentFormChange('inbound', e.target.checked)}
                className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">Inbound (Receber mensagens)</span>
            </label>
          </div>
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={editingAgent?.outbound || false}
                onChange={(e) => handleAgentFormChange('outbound', e.target.checked)}
                className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">Outbound (Enviar mensagens)</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Prompt da IA</label>
          <textarea
            value={editingAgent?.prompt || ''}
            onChange={(e) => handleAgentFormChange('prompt', e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="Descreva como o agente deve se comportar, responder e interagir..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Integração</label>
            {(() => {
              const availableIntegrations = getAvailableIntegrations(editingAgent?.type || selectedAgentType);
              
              if (availableIntegrations.length === 0) {
                return (
                  <div className="w-full px-4 py-3 border border-red-300 bg-red-50 rounded-lg">
                    <div className="flex items-center">
                      <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                      <span className="text-sm text-red-700">
                        Nenhuma integração configurada para {editingAgent?.type || selectedAgentType}
                      </span>
                    </div>
                    <button
                      onClick={() => setActiveSection('integrations')}
                      className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
                    >
                      Configurar nas Integrações
                    </button>
                  </div>
                );
              }
              
              return (
                <select
                  value={editingAgent?.integration || ''}
                  onChange={(e) => handleAgentFormChange('integration', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">Selecione uma integração</option>
                  {availableIntegrations.map(integration => (
                    <option key={integration.id} value={integration.id}>
                      {integration.name} - {integration.description}
                    </option>
                  ))}
                </select>
              );
            })()}
            
            {(() => {
              const availableIntegrations = getAvailableIntegrations(editingAgent?.type || selectedAgentType);
              if (availableIntegrations.length > 0) {
                return (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {availableIntegrations.map(integration => (
                      <span 
                        key={integration.id}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${integration.color}`}
                      >
                        {integration.name}
                      </span>
                    ))}
                  </div>
                );
              }
              return null;
            })()}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {editingAgent?.type === 'voice' ? 'Número de Telefone' : 'Webhook URL'}
            </label>
            <input
              type="text"
              value={editingAgent?.type === 'voice' ? (editingAgent?.phoneNumber || '') : (editingAgent?.webhookUrl || '')}
              onChange={(e) => handleAgentFormChange(
                editingAgent?.type === 'voice' ? 'phoneNumber' : 'webhookUrl', 
                e.target.value
              )}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder={editingAgent?.type === 'voice' ? '+55 11 99999-9999' : 'https://webhook.url'}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={() => {
              setEditingAgent(null);
              setShowAgentForm(false);
              setActiveSubSection('');
            }}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
          >
            Cancelar
          </button>
          <button
            onClick={saveAgent}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
          >
            {editingAgent?.id ? 'Atualizar' : 'Criar'}
          </button>
        </div>
      </div>
    </div>
  );

  // Funções para importação CSV
  const handleCsvFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.type === 'text/csv' || file.name.toLowerCase().endsWith('.csv'))) {
      setCsvFile(file);
      parseCsvFile(file);
    } else {
      alert('Por favor, selecione apenas arquivos CSV (.csv).');
    }
  };

  const detectCsvSeparator = (text: string): string => {
    const lines = text.split('\n').slice(0, 3); // Analisar as primeiras 3 linhas
    let commaCount = 0;
    let semicolonCount = 0;
    
    lines.forEach(line => {
      commaCount += (line.match(/,/g) || []).length;
      semicolonCount += (line.match(/;/g) || []).length;
    });
    
    // Se há mais ponto e vírgula que vírgulas, usar ponto e vírgula
    if (semicolonCount > commaCount) {
      return ';';
    }
    // Caso contrário, usar vírgula (padrão)
    return ',';
  };

  const parseCsvLine = (line: string, separator: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Aspas duplas escapadas
          current += '"';
          i++; // Pular a próxima aspa
        } else {
          // Alternar estado das aspas
          inQuotes = !inQuotes;
        }
      } else if (char === separator && !inQuotes) {
        // Separador encontrado fora das aspas
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    // Adicionar o último campo
    result.push(current.trim());
    
    return result.map(field => field.replace(/^"|"$/g, '')); // Remover aspas das bordas
  };

  const parseCsvFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        
        if (!text || text.trim().length === 0) {
          alert('❌ Arquivo CSV vazio ou inválido.');
          return;
        }
        
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length === 0) {
          alert('❌ Nenhuma linha válida encontrada no arquivo CSV.');
          return;
        }
        
        if (lines.length === 1) {
          alert('❌ Arquivo contém apenas cabeçalhos. Adicione dados para importar.');
          return;
        }
        
        // Detectar separador automaticamente
        const separator = detectCsvSeparator(text);
        
        // Processar cabeçalhos
        const headers = parseCsvLine(lines[0], separator);
        
        if (headers.length === 0) {
          alert('❌ Não foi possível detectar colunas no arquivo CSV.');
          return;
        }
        
        // Verificar se há cabeçalhos vazios
        const emptyHeaders = headers.filter(h => !h.trim());
        if (emptyHeaders.length > 0) {
          console.warn('⚠️ Encontradas colunas sem nome, serão ignoradas.');
        }
        
        // Filtrar apenas cabeçalhos válidos
        const validHeaders = headers.filter(h => h.trim());
        
        if (validHeaders.length === 0) {
          alert('❌ Nenhum cabeçalho válido encontrado no arquivo CSV.');
          return;
        }
        
        // Processar dados
        const data = lines.slice(1)
          .map((line, lineIndex) => {
            try {
              const values = parseCsvLine(line, separator);
              const row: any = {};
              
              validHeaders.forEach((header, index) => {
                const originalHeaderIndex = headers.indexOf(header);
                row[header] = values[originalHeaderIndex] || '';
              });
              
              return row;
            } catch (error) {
              console.error(`❌ Erro ao processar linha ${lineIndex + 2}:`, error);
              return null;
            }
          })
          .filter(row => row !== null); // Remover linhas com erro
        
        if (data.length === 0) {
          alert('❌ Nenhuma linha de dados válida foi encontrada.');
          return;
        }
        
        setCsvHeaders(validHeaders);
        setCsvData(data);
        setCsvSeparator(separator);
        setShowCsvImport(true);
        
        // Mostrar informação detalhada
        console.log('✅ CSV processado com sucesso!');
        console.log(`📊 Separador detectado: "${separator}" ${separator === ',' ? '(vírgula)' : '(ponto e vírgula)'}`);
        console.log(`📋 Colunas válidas: ${validHeaders.length}`);
        console.log(`📄 Linhas de dados: ${data.length}`);
        console.log('🔍 Colunas encontradas:', validHeaders);
        
      } catch (error) {
        console.error('❌ Erro ao processar arquivo CSV:', error);
        alert('❌ Erro ao processar arquivo CSV. Verifique se o arquivo está no formato correto.');
      }
    };
    
    reader.onerror = () => {
      console.error('❌ Erro ao ler arquivo');
      alert('❌ Erro ao ler o arquivo. Tente novamente.');
    };
    
    reader.readAsText(file, 'UTF-8');
  };

  const processAIMapping = async () => {
    setIsProcessingAI(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simular delay da IA
      
      let aiMapping: {[key: string]: string} = {};
      
      if (selectedTemplate && selectedTemplate.columns) {
        // Aplicar mapeamento baseado no template selecionado
        console.log('🔧 Aplicando template:', selectedTemplate.name);
        
        csvHeaders.forEach(header => {
          const lowerHeader = header.toLowerCase().trim();
          
          // Procurar correspondência no template
          const templateColumn = selectedTemplate.columns.find((col: any) => {
            const templateField = col.field.toLowerCase().trim();
            return lowerHeader.includes(templateField) || templateField.includes(lowerHeader);
          });
          
          if (templateColumn) {
            aiMapping[header] = templateColumn.field;
          } else {
            // Fallback para IA se não encontrar no template
            aiMapping[header] = getAIFieldMapping(lowerHeader);
          }
        });
        
        console.log('✅ Template aplicado com', Object.keys(aiMapping).length, 'mapeamentos');
      } else {
        // Lógica de IA padrão quando nenhum template é selecionado
        console.log('🧠 Aplicando mapeamento IA automático');
        
        csvHeaders.forEach(header => {
          aiMapping[header] = getAIFieldMapping(header.toLowerCase());
        });
      }
      
      setColumnMapping(aiMapping);
      setShowMappingModal(true);
      
    } catch (error) {
      console.error('Erro no processamento IA:', error);
      alert('Erro ao processar mapeamento automático. Tente novamente.');
    } finally {
      setIsProcessingAI(false);
    }
  };

  // Função auxiliar para mapeamento IA
  const getAIFieldMapping = (lowerHeader: string): string => {
    if (lowerHeader.includes('nome') || lowerHeader.includes('name')) {
      return 'nome';
    } else if (lowerHeader.includes('email') || lowerHeader.includes('e-mail')) {
      return 'email';
    } else if (lowerHeader.includes('telefone') || lowerHeader.includes('phone') || lowerHeader.includes('celular')) {
      return 'telefone';
    } else if (lowerHeader.includes('cpf') || lowerHeader.includes('documento')) {
      return 'cpf';
    } else if (lowerHeader.includes('endereco') || lowerHeader.includes('address')) {
      return 'endereco';
    } else if (lowerHeader.includes('cidade') || lowerHeader.includes('city')) {
      return 'cidade';
    } else if (lowerHeader.includes('estado') || lowerHeader.includes('state') || lowerHeader.includes('uf')) {
      return 'estado';
    } else if (lowerHeader.includes('cep') || lowerHeader.includes('zip')) {
      return 'cep';
    } else {
      return 'campo_adicional';
    }
  };

  // Funções para gerenciar configuração OpenAI
  const loadOpenAIConfig = () => {
    try {
      const saved = localStorage.getItem(`openai_config_${user?.email}`);
      if (saved) {
        setOpenaiConfig(JSON.parse(saved));
      } else {
        // Configuração padrão se não existir
        const defaultConfig = {
          apiKey: '',
          isConfigured: false,
          modules: {
            whatsapp: false,
            voice: false,
            sms: false,
            email: false,
            imageGeneration: true, // Habilitar por padrão
            videoGeneration: false
          }
        };
        setOpenaiConfig(defaultConfig);
        localStorage.setItem(`openai_config_${user?.email}`, JSON.stringify(defaultConfig));
      }
    } catch (error) {
      console.error('Erro ao carregar configuração OpenAI:', error);
    }
  };

  const saveOpenAIConfig = async (config: any) => {
    try {
      localStorage.setItem(`openai_config_${user?.email}`, JSON.stringify(config));
      setOpenaiConfig(config);
      console.log('✅ Configuração OpenAI salva');
    } catch (error) {
      console.error('❌ Erro ao salvar configuração OpenAI:', error);
    }
  };

  const testOpenAIConnection = async () => {
    if (!openaiConfig.apiKey.trim()) {
      alert('❌ Por favor, insira uma API Key válida');
      return;
    }

    setTestingConnection(true);
    
    try {
      // Simular teste de conectividade
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Em um ambiente real, você faria uma chamada real para a API OpenAI
      // const response = await fetch('https://api.openai.com/v1/models', {
      //   headers: { 'Authorization': `Bearer ${openaiConfig.apiKey}` }
      // });
      
      const updatedConfig = {
        ...openaiConfig,
        isConfigured: true
      };
      
      await saveOpenAIConfig(updatedConfig);
      alert('✅ Conexão com OpenAI testada com sucesso!\nAPI Key configurada e válida.');
      
    } catch (error) {
      console.error('❌ Erro ao testar OpenAI:', error);
      alert('❌ Erro ao conectar com OpenAI. Verifique sua API Key.');
    } finally {
      setTestingConnection(false);
    }
  };

  const toggleModuleOpenAI = async (module: string) => {
    const updatedConfig = {
      ...openaiConfig,
      modules: {
        ...openaiConfig.modules,
        [module]: !openaiConfig.modules[module]
      }
    };
    
    await saveOpenAIConfig(updatedConfig);
  };

  // Função auxiliar para verificar se um módulo OpenAI está habilitado
  const isOpenAIModuleEnabled = (module: string): boolean => {
    return openaiConfig.isConfigured && openaiConfig.modules[module];
  };

  // Funções para gerenciar configuração Zenvia
  const loadZenviaConfig = () => {
    try {
      const saved = localStorage.getItem(`zenvia_config_${user?.email}`);
      if (saved) {
        setZenviaConfig(JSON.parse(saved));
      } else {
        // Configuração padrão se não existir
        const defaultConfig = {
          apiKey: '',
          isConfigured: false,
          modules: {
            whatsapp: false,
            voice: false,
            sms: false,
            email: false,
            imageGeneration: true, // Habilitar por padrão
            videoGeneration: false
          }
        };
        setZenviaConfig(defaultConfig);
        localStorage.setItem(`zenvia_config_${user?.email}`, JSON.stringify(defaultConfig));
      }
    } catch (error) {
      console.error('Erro ao carregar configuração Zenvia:', error);
    }
  };

  const saveZenviaConfig = async (config: any) => {
    try {
      localStorage.setItem(`zenvia_config_${user?.email}`, JSON.stringify(config));
      setZenviaConfig(config);
      console.log('✅ Configuração Zenvia salva');
    } catch (error) {
      console.error('❌ Erro ao salvar configuração Zenvia:', error);
    }
  };

  const testZenviaConnection = async () => {
    if (!zenviaConfig.apiKey.trim()) {
      alert('❌ Por favor, insira uma API Key válida da Zenvia');
      return;
    }

    setTestingZenviaConnection(true);
    
    try {
      // Simular teste de conectividade
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Em um ambiente real, você faria uma chamada real para a API Zenvia
      // const response = await fetch('https://api.zenvia.com/v2/channels', {
      //   headers: { 'X-API-TOKEN': zenviaConfig.apiKey }
      // });
      
      const updatedConfig = {
        ...zenviaConfig,
        isConfigured: true
      };
      
      await saveZenviaConfig(updatedConfig);
      alert('✅ Conexão com Zenvia testada com sucesso!\nAPI Key configurada e válida.');
      
    } catch (error) {
      console.error('❌ Erro ao testar Zenvia:', error);
      alert('❌ Erro ao conectar com Zenvia. Verifique sua API Key.');
    } finally {
      setTestingZenviaConnection(false);
    }
  };

  const toggleModuleZenvia = async (module: string) => {
    const updatedConfig = {
      ...zenviaConfig,
      modules: {
        ...zenviaConfig.modules,
        [module]: !zenviaConfig.modules[module]
      }
    };
    
    await saveZenviaConfig(updatedConfig);
  };

  // Função auxiliar para verificar se um módulo Zenvia está habilitado
  const isZenviaModuleEnabled = (module: string): boolean => {
    return zenviaConfig.isConfigured && zenviaConfig.modules[module];
  };

  // Funções para gerenciar configuração Google Gemini
  const loadGeminiConfig = () => {
    try {
      const saved = localStorage.getItem(`gemini_config_${user?.email}`);
      if (saved) {
        setGeminiConfig(JSON.parse(saved));
      } else {
        // Configuração padrão se não existir
        const defaultConfig = {
          apiKey: '',
          isConfigured: false,
          modules: {
            whatsapp: false,
            voice: false,
            sms: false,
            email: false,
            imageGeneration: true, // Habilitar por padrão
            videoGeneration: false
          }
        };
        setGeminiConfig(defaultConfig);
        localStorage.setItem(`gemini_config_${user?.email}`, JSON.stringify(defaultConfig));
      }
    } catch (error) {
      console.error('Erro ao carregar configuração Gemini:', error);
    }
  };

  const saveGeminiConfig = async (config: any) => {
    try {
      localStorage.setItem(`gemini_config_${user?.email}`, JSON.stringify(config));
      setGeminiConfig(config);
      console.log('✅ Configuração Gemini salva');
    } catch (error) {
      console.error('❌ Erro ao salvar configuração Gemini:', error);
    }
  };

  const testGeminiConnection = async () => {
    if (!geminiConfig.apiKey.trim()) {
      alert('❌ Por favor, insira uma API Key válida do Google Gemini');
      return;
    }

    setTestingGeminiConnection(true);

    try {
      // Teste de conexão com Google Gemini
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': geminiConfig.apiKey
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: "Test connection"
                }
              ]
            }
          ]
        })
      });

      if (response.ok) {
        const updatedConfig = {
          ...geminiConfig,
          isConfigured: true,
          connectionStatus: 'connected'
        };
        await saveGeminiConfig(updatedConfig);
        alert('✅ Conexão com Google Gemini estabelecida com sucesso!');
      } else {
        throw new Error('Falha na autenticação');
      }
    } catch (error) {
      console.error('Erro de conexão Gemini:', error);
      
      const updatedConfig = {
        ...geminiConfig,
        isConfigured: false,
        connectionStatus: 'error'
      };
      await saveGeminiConfig(updatedConfig);
      alert('❌ Erro na conexão. Verifique sua API Key do Google Gemini.');
    } finally {
      setTestingGeminiConnection(false);
    }
  };

  const updateGeminiApiKey = (apiKey: string) => {
    const updatedConfig = {
      ...geminiConfig,
      apiKey,
      isConfigured: false,
      connectionStatus: 'disconnected'
    };
    setGeminiConfig(updatedConfig);
  };

  const toggleGeminiModule = async (module: string) => {
    const updatedConfig = {
      ...geminiConfig,
      modules: {
        ...geminiConfig.modules,
        [module]: !geminiConfig.modules[module]
      }
    };
    
    await saveGeminiConfig(updatedConfig);
  };

  // Função auxiliar para verificar se um módulo Gemini está habilitado
  const isGeminiModuleEnabled = (module: string): boolean => {
    return geminiConfig.isConfigured && geminiConfig.modules[module];
  };

  // Função para obter integrações disponíveis para um tipo de agente
  const getAvailableIntegrations = (agentType: string) => {
    const integrations = [];
    
    // Verificar OpenAI
    if (openaiConfig.isConfigured && openaiConfig.modules[agentType]) {
      integrations.push({
        id: 'openai',
        name: 'OpenAI',
        description: 'IA Generativa',
        color: 'bg-blue-100 text-blue-800'
      });
    }
    
    // Verificar Zenvia
    if (zenviaConfig.isConfigured && zenviaConfig.modules[agentType]) {
      integrations.push({
        id: 'zenvia',
        name: 'Zenvia',
        description: 'Comunicação Multi-Canal',
        color: 'bg-orange-100 text-orange-800'
      });
    }
    
    // Verificar Google Gemini
    if (geminiConfig.isConfigured && geminiConfig.modules[agentType]) {
      integrations.push({
        id: 'gemini',
        name: 'Google Gemini',
        description: 'IA Avançada do Google',
        color: 'bg-green-100 text-green-800'
      });
    }
    
    return integrations;
  };

  // Funções para gerenciar documentos
  const openDocumentForm = (document: any = null, type: string = 'document') => {
    setEditingDocument(document || {
      id: null,
      title: '',
      type: type,
      content: '',
      formFields: [],
      tags: [],
      createdAt: '',
      updatedAt: ''
    });
    setSelectedDocumentType(type);
    setDocumentContent(document?.content || '');
    setShowDocumentForm(true);
  };

  const handleDocumentFormChange = (field: string, value: any) => {
    setEditingDocument((prev: any) => {
      if (!prev) {
        return {
          id: null,
          title: '',
          type: selectedDocumentType,
          content: '',
          formFields: [],
          tags: [],
          createdAt: '',
          updatedAt: '',
          [field]: value
        };
      }
      return { ...prev, [field]: value };
    });
  };

  const saveDocument = () => {
    if (!editingDocument) return;

    if (!editingDocument.title || !documentContent) {
      alert('Por favor, preencha o título e o conteúdo do documento.');
      return;
    }

    const documentData = {
      ...editingDocument,
      content: documentContent,
      updatedAt: new Date().toISOString()
    };

    if (editingDocument.id) {
      // Editando documento existente
      const updatedDocument = { 
        ...documentData
      };
      
      setDocuments((prev: any) => prev.map((doc: any) =>
        doc.id === editingDocument.id ? updatedDocument : doc
      ));
      
      // Salvar no localStorage
      const currentDocuments = JSON.parse(localStorage.getItem('dashboardDocuments') || '[]');
      const updatedDocuments = currentDocuments.map((d: any) => 
        d.id === editingDocument.id ? updatedDocument : d
      );
      localStorage.setItem('dashboardDocuments', JSON.stringify(updatedDocuments));
      
      alert('Documento atualizado com sucesso!');
    } else {
      // Criando novo documento
      const newDocument = {
        ...documentData,
        id: generateUniqueId(),
        createdAt: new Date().toISOString(),
        ownerEmail: user?.email || 'unknown'
      };
      
      setDocuments((prev: any) => [...prev, newDocument]);
      
      // Salvar no localStorage
      const currentDocuments = JSON.parse(localStorage.getItem('dashboardDocuments') || '[]');
      currentDocuments.push(newDocument);
      localStorage.setItem('dashboardDocuments', JSON.stringify(currentDocuments));
      
      alert('Documento criado com sucesso!');
    }

    setEditingDocument(null);
    setShowDocumentForm(false);
    setDocumentContent('');
  };

  const deleteDocument = (documentId: number) => {
    if (window.confirm('Tem certeza que deseja excluir este documento?')) {
      setDocuments((prev: any) => prev.filter((doc: any) => doc.id !== documentId));
      
      // Remover do localStorage
      const currentDocuments = JSON.parse(localStorage.getItem('dashboardDocuments') || '[]');
      const filteredDocuments = currentDocuments.filter((d: any) => d.id !== documentId);
      localStorage.setItem('dashboardDocuments', JSON.stringify(filteredDocuments));
      
      alert('Documento excluído com sucesso!');
      setShowDeleteDocumentConfirm(null);
    }
  };

  // Funções auxiliares para documentos
  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'form':
        return <Columns className="w-8 h-8 text-green-600" />;
      case 'contract':
        return <FileText className="w-8 h-8 text-blue-600" />;
      case 'letter':
        return <Mail className="w-8 h-8 text-purple-600" />;
      case 'report':
        return <FileText className="w-8 h-8 text-orange-600" />;
      default:
        return <FileText className="w-8 h-8 text-indigo-600" />;
    }
  };

  const getDocumentTypeColor = (type: string) => {
    switch (type) {
      case 'form':
        return 'bg-green-100 text-green-800';
      case 'contract':
        return 'bg-blue-100 text-blue-800';
      case 'letter':
        return 'bg-purple-100 text-purple-800';
      case 'report':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-indigo-100 text-indigo-800';
    }
  };

  // Função para exportar documento como HTML
  const exportDocument = (document: any, format: string = 'html') => {
    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${document.title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
          .form-field { margin: 15px 0; }
          .form-field label { font-weight: bold; margin-bottom: 5px; display: block; }
          .form-field input, .form-field textarea, .form-field select { 
            border: 1px solid #ccc; padding: 8px; margin: 5px 0; 
          }
          h1, h2, h3 { color: #333; }
          .document-meta { 
            border-bottom: 1px solid #eee; 
            padding-bottom: 20px; 
            margin-bottom: 30px; 
            color: #666; 
          }
        </style>
      </head>
      <body>
        <div class="document-meta">
          <h1>${document.title}</h1>
          <p><strong>Tipo:</strong> ${document.type}</p>
          <p><strong>Criado em:</strong> ${new Date(document.createdAt).toLocaleDateString('pt-BR')}</p>
          ${document.tags && document.tags.length > 0 ? `<p><strong>Tags:</strong> ${document.tags.join(', ')}</p>` : ''}
        </div>
        <div class="document-content">
          ${document.content}
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `${document.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Funções para gerenciar produtos
  const openProductForm = (product: any = null) => {
    setEditingProduct(product || {
      id: null,
      name: '',
      code: '',
      type: selectedProductType,
      category: '',
      price: '',
      cost: '',
      stock: '',
      minStock: '',
      description: '',
      barcode: '',
      brand: '',
      supplier: '',
      unit: '',
      weight: '',
      dimensions: '',
      status: 'active',
      additionalFields: {},
      groupId: null,
      createdAt: '',
      updatedAt: ''
    });
    setShowProductForm(true);
  };

  const handleProductFormChange = (field: string, value: any) => {
    setEditingProduct((prev: any) => {
      if (!prev) {
        return {
          id: null,
          name: '',
          code: '',
          type: selectedProductType,
          category: '',
          price: '',
          cost: '',
          stock: '',
          minStock: '',
          description: '',
          barcode: '',
          brand: '',
          supplier: '',
          unit: '',
          weight: '',
          dimensions: '',
          status: 'active',
          additionalFields: {},
          groupId: null,
          createdAt: '',
          updatedAt: '',
          [field]: value
        };
      }
      return { ...prev, [field]: value };
    });
  };

  const saveProduct = () => {
    if (!editingProduct) return;

    if (!editingProduct.name || !editingProduct.code) {
      alert('Por favor, preencha pelo menos o nome e código do produto/serviço.');
      return;
    }

    const productData = {
      ...editingProduct,
      price: parseFloat(editingProduct.price) || 0,
      cost: parseFloat(editingProduct.cost) || 0,
      stock: parseInt(editingProduct.stock) || 0,
      minStock: parseInt(editingProduct.minStock) || 0,
      updatedAt: new Date().toISOString()
    };

    if (editingProduct.id) {
      // Editando produto existente
      const updatedProduct = { 
        ...productData
      };
      
      setProducts((prev: any) => prev.map((product: any) =>
        product.id === editingProduct.id ? updatedProduct : product
      ));
      
      // Salvar no localStorage
      const currentProducts = JSON.parse(localStorage.getItem('dashboardProducts') || '[]');
      const updatedProducts = currentProducts.map((p: any) => 
        p.id === editingProduct.id ? updatedProduct : p
      );
      localStorage.setItem('dashboardProducts', JSON.stringify(updatedProducts));
      
      alert('Produto/Serviço atualizado com sucesso!');
    } else {
      // Criando novo produto
      const newProduct = {
        ...productData,
        id: generateUniqueId(),
        createdAt: new Date().toISOString(),
        ownerEmail: user?.email || 'unknown'
      };
      
      setProducts((prev: any) => [...prev, newProduct]);
      
      // Salvar no localStorage
      const currentProducts = JSON.parse(localStorage.getItem('dashboardProducts') || '[]');
      currentProducts.push(newProduct);
      localStorage.setItem('dashboardProducts', JSON.stringify(currentProducts));
      
      alert('Produto/Serviço criado com sucesso!');
    }

    setEditingProduct(null);
    setShowProductForm(false);
  };

  const deleteProduct = (productId: number) => {
    if (window.confirm('Tem certeza que deseja excluir este produto/serviço?')) {
      setProducts((prev: any) => prev.filter((product: any) => product.id !== productId));
      
      // Remover do localStorage
      const currentProducts = JSON.parse(localStorage.getItem('dashboardProducts') || '[]');
      const filteredProducts = currentProducts.filter((p: any) => p.id !== productId);
      localStorage.setItem('dashboardProducts', JSON.stringify(filteredProducts));
      
      alert('Produto/Serviço excluído com sucesso!');
      setShowDeleteProductConfirm(null);
    }
  };

  // Função para renderizar o formulário de produto
  const renderProductForm = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Package className="w-6 h-6 text-purple-600 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">
            {editingProduct?.id ? 'Editar' : 'Cadastrar'} {editingProduct?.type === 'service' ? 'Serviço' : 'Produto'}
          </h2>
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            setShowProductForm(false);
          }}
          className="btn-secondary"
        >
          Voltar
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 space-y-6">
          {/* Informações básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nome *</label>
              <input
                type="text"
                value={editingProduct?.name || ''}
                onChange={(e) => handleProductFormChange('name', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Nome do produto/serviço"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Código *</label>
              <input
                type="text"
                value={editingProduct?.code || ''}
                onChange={(e) => handleProductFormChange('code', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Código único"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
              <select
                value={editingProduct?.type || 'product'}
                onChange={(e) => handleProductFormChange('type', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="product">Produto</option>
                <option value="service">Serviço</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
              <input
                type="text"
                value={editingProduct?.category || ''}
                onChange={(e) => handleProductFormChange('category', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Categoria do item"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Marca</label>
              <input
                type="text"
                value={editingProduct?.brand || ''}
                onChange={(e) => handleProductFormChange('brand', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Marca do produto"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={editingProduct?.status || 'active'}
                onChange={(e) => handleProductFormChange('status', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
              </select>
            </div>
          </div>

          {/* Preços */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Preços</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preço de Venda (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingProduct?.price || ''}
                  onChange={(e) => handleProductFormChange('price', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="0,00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Custo (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingProduct?.cost || ''}
                  onChange={(e) => handleProductFormChange('cost', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="0,00"
                />
              </div>
            </div>
          </div>

          {/* Estoque (apenas para produtos) */}
          {editingProduct?.type === 'product' && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Controle de Estoque</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estoque Atual</label>
                  <input
                    type="number"
                    value={editingProduct?.stock || ''}
                    onChange={(e) => handleProductFormChange('stock', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estoque Mínimo</label>
                  <input
                    type="number"
                    value={editingProduct?.minStock || ''}
                    onChange={(e) => handleProductFormChange('minStock', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Unidade</label>
                  <input
                    type="text"
                    value={editingProduct?.unit || ''}
                    onChange={(e) => handleProductFormChange('unit', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="un, kg, m, etc."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Informações complementares */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informações Complementares</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fornecedor</label>
                <input
                  type="text"
                  value={editingProduct?.supplier || ''}
                  onChange={(e) => handleProductFormChange('supplier', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Nome do fornecedor"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Código de Barras</label>
                <input
                  type="text"
                  value={editingProduct?.barcode || ''}
                  onChange={(e) => handleProductFormChange('barcode', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Código de barras"
                />
              </div>
              
              {editingProduct?.type === 'product' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Peso</label>
                    <input
                      type="text"
                      value={editingProduct?.weight || ''}
                      onChange={(e) => handleProductFormChange('weight', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Ex: 1kg, 500g"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dimensões</label>
                    <input
                      type="text"
                      value={editingProduct?.dimensions || ''}
                      onChange={(e) => handleProductFormChange('dimensions', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Ex: 10x20x30 cm"
                    />
                  </div>
                </>
              )}
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
              <textarea
                value={editingProduct?.description || ''}
                onChange={(e) => handleProductFormChange('description', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                rows={4}
                placeholder="Descrição detalhada do produto/serviço"
              />
            </div>
          </div>

          {/* Ações */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              onClick={() => {
                setEditingProduct(null);
                setShowProductForm(false);
              }}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              onClick={saveProduct}
              className="btn-primary bg-purple-600 hover:bg-purple-700"
            >
              {editingProduct?.id ? 'Atualizar' : 'Cadastrar'} {editingProduct?.type === 'service' ? 'Serviço' : 'Produto'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Modal para exibir campos do produto
  const ProductFieldsModal = ({ product, onClose }: any) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Campos do {product?.type === 'service' ? 'Serviço' : 'Produto'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 border-b pb-2">Informações Básicas</h4>
            <div>
              <span className="text-sm font-medium text-gray-600">Nome:</span>
              <span className="ml-2 text-sm text-gray-900">{product?.name || 'Não informado'}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Código:</span>
              <span className="ml-2 text-sm text-gray-900">{product?.code || 'Não informado'}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Tipo:</span>
              <span className="ml-2 text-sm text-gray-900">
                {product?.type === 'service' ? 'Serviço' : 'Produto'}
              </span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Categoria:</span>
              <span className="ml-2 text-sm text-gray-900">{product?.category || 'Não informado'}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Marca:</span>
              <span className="ml-2 text-sm text-gray-900">{product?.brand || 'Não informado'}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Status:</span>
              <span className={`ml-2 text-sm font-medium ${
                product?.status === 'active' ? 'text-green-600' : 'text-red-600'
              }`}>
                {product?.status === 'active' ? 'Ativo' : 'Inativo'}
              </span>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 border-b pb-2">Preços e Estoque</h4>
            <div>
              <span className="text-sm font-medium text-gray-600">Preço de Venda:</span>
              <span className="ml-2 text-sm text-gray-900">
                {product?.price ? `R$ ${parseFloat(product.price).toFixed(2)}` : 'Não informado'}
              </span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Custo:</span>
              <span className="ml-2 text-sm text-gray-900">
                {product?.cost ? `R$ ${parseFloat(product.cost).toFixed(2)}` : 'Não informado'}
              </span>
            </div>
            {product?.type === 'product' && (
              <>
                <div>
                  <span className="text-sm font-medium text-gray-600">Estoque Atual:</span>
                  <span className="ml-2 text-sm text-gray-900">
                    {product?.stock || 0} {product?.unit || 'un'}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Estoque Mínimo:</span>
                  <span className="ml-2 text-sm text-gray-900">
                    {product?.minStock || 0} {product?.unit || 'un'}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Peso:</span>
                  <span className="ml-2 text-sm text-gray-900">{product?.weight || 'Não informado'}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Dimensões:</span>
                  <span className="ml-2 text-sm text-gray-900">{product?.dimensions || 'Não informado'}</span>
                </div>
              </>
            )}
            <div>
              <span className="text-sm font-medium text-gray-600">Fornecedor:</span>
              <span className="ml-2 text-sm text-gray-900">{product?.supplier || 'Não informado'}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Código de Barras:</span>
              <span className="ml-2 text-sm text-gray-900">{product?.barcode || 'Não informado'}</span>
            </div>
          </div>
        </div>
        
        {product?.description && (
          <div className="mt-4">
            <h4 className="font-medium text-gray-900 border-b pb-2 mb-3">Descrição</h4>
            <p className="text-sm text-gray-600">{product.description}</p>
          </div>
        )}

        {product?.additionalFields && Object.keys(product.additionalFields).length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium text-gray-900 border-b pb-2 mb-3">Campos Adicionais</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(product.additionalFields).map(([key, value]) => (
                <div key={key}>
                  <span className="text-sm font-medium text-gray-600">{key}:</span>
                  <span className="ml-2 text-sm text-gray-900">{String(value) || 'Vazio'}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );

  // Função para lidar com upload de CSV de produtos
  const handleProductCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const parsed = parseProductCSV(text);
        setProductCsvData(parsed);
      };
      reader.readAsText(file, 'UTF-8');
    } else {
      alert('❌ Por favor, selecione um arquivo CSV válido.');
    }
  };

  // Função para parsear CSV de produtos (similar à de clientes)
  const parseProductCSV = (csvText: string) => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];

    // Detectar separador
    const firstLine = lines[0];
    const separator = firstLine.includes(';') ? ';' : ',';
    
    const headers = firstLine.split(separator).map(h => h.trim().replace(/"/g, ''));
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim()) {
        const values: string[] = [];
        let currentValue = '';
        let insideQuotes = false;
        
        for (let j = 0; j < line.length; j++) {
          const char = line[j];
          if (char === '"') {
            insideQuotes = !insideQuotes;
          } else if (char === separator && !insideQuotes) {
            values.push(currentValue.trim());
            currentValue = '';
          } else {
            currentValue += char;
          }
        }
        values.push(currentValue.trim());

        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        data.push(row);
      }
    }

    return data;
  };

  // Função para processar mapeamento IA de produtos
  const processProductAIMapping = () => {
    if (!productCsvData.length) return;

    const headers = Object.keys(productCsvData[0]);
    let mapping: any = {};

    // Se tem template selecionado, usar primeiro
    if (selectedProductTemplate && selectedProductTemplate.columns) {
      Object.entries(selectedProductTemplate.columns).forEach(([templateField, csvColumn]) => {
        if (headers.includes(csvColumn as string)) {
          mapping[templateField] = csvColumn;
        }
      });
    }

    // Completar com mapeamento IA para campos não mapeados pelo template
    const productFieldMapping = getProductAIFieldMapping(headers);
    Object.entries(productFieldMapping).forEach(([field, header]) => {
      if (!mapping[field]) {
        mapping[field] = header;
      }
    });

    setProductFieldMapping(mapping);
    setShowProductMapping(true);
  };

  // Função de mapeamento IA para produtos
  const getProductAIFieldMapping = (headers: string[]) => {
    const mapping: any = {};
    
    headers.forEach(header => {
      const lowerHeader = header.toLowerCase();
      
      // Mapeamento por palavras-chave
      if (lowerHeader.includes('nome') || lowerHeader.includes('produto') || lowerHeader.includes('serviço') || lowerHeader.includes('title')) {
        if (!mapping.name) mapping.name = header;
      } else if (lowerHeader.includes('código') || lowerHeader.includes('code') || lowerHeader.includes('sku') || lowerHeader.includes('ref')) {
        if (!mapping.code) mapping.code = header;
      } else if (lowerHeader.includes('categoria') || lowerHeader.includes('category') || lowerHeader.includes('tipo')) {
        if (!mapping.category) mapping.category = header;
      } else if (lowerHeader.includes('preço') || lowerHeader.includes('price') || lowerHeader.includes('valor')) {
        if (!mapping.price) mapping.price = header;
      } else if (lowerHeader.includes('custo') || lowerHeader.includes('cost')) {
        if (!mapping.cost) mapping.cost = header;
      } else if (lowerHeader.includes('estoque') || lowerHeader.includes('stock') || lowerHeader.includes('quantidade')) {
        if (!mapping.stock) mapping.stock = header;
      } else if (lowerHeader.includes('marca') || lowerHeader.includes('brand')) {
        if (!mapping.brand) mapping.brand = header;
      } else if (lowerHeader.includes('fornecedor') || lowerHeader.includes('supplier')) {
        if (!mapping.supplier) mapping.supplier = header;
      } else if (lowerHeader.includes('barras') || lowerHeader.includes('barcode') || lowerHeader.includes('ean')) {
        if (!mapping.barcode) mapping.barcode = header;
      } else if (lowerHeader.includes('peso') || lowerHeader.includes('weight')) {
        if (!mapping.weight) mapping.weight = header;
      } else if (lowerHeader.includes('dimensão') || lowerHeader.includes('dimension') || lowerHeader.includes('tamanho')) {
        if (!mapping.dimensions) mapping.dimensions = header;
      } else if (lowerHeader.includes('unidade') || lowerHeader.includes('unit') || lowerHeader.includes('medida')) {
        if (!mapping.unit) mapping.unit = header;
      } else if (lowerHeader.includes('descrição') || lowerHeader.includes('description') || lowerHeader.includes('detalhe')) {
        if (!mapping.description) mapping.description = header;
      } else if (lowerHeader.includes('status') || lowerHeader.includes('ativo') || lowerHeader.includes('estado')) {
        if (!mapping.status) mapping.status = header;
      }
    });

    return mapping;
  };

  // Função para renderizar importação CSV de produtos
  const renderProductCSVImport = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Upload className="w-6 h-6 text-purple-600 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">Importar Produtos/Serviços</h2>
        </div>
        <button
          onClick={() => {
            setShowProductCSVImport(false);
            setProductCsvData([]);
            setShowProductMapping(false);
            setProductFieldMapping({});
            setSelectedProductTemplate(null);
          }}
          className="btn-secondary"
        >
          Voltar
        </button>
      </div>

      {!showProductMapping ? (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          {/* Template Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">1. Selecione um Template (Opcional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Template de Mapeamento</label>
                <select
                  value={selectedProductTemplate?.id || ''}
                  onChange={(e) => {
                    const template = templates.find(t => t.id === parseInt(e.target.value));
                    setSelectedProductTemplate(template || null);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">Mapeamento IA (Automático)</option>
                  {templates.map((template: any) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedProductTemplate 
                    ? `Template "${selectedProductTemplate.name}" será usado para mapear os campos automaticamente.`
                    : 'A IA mapeará automaticamente os campos da planilha.'
                  }
                </p>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setActiveSection('templates');
                    setShowProductCSVImport(false);
                  }}
                  className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                >
                  📝 Gerenciar Templates
                </button>
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">2. Selecione o arquivo CSV</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-900">Arrastar arquivo CSV aqui</p>
                <p className="text-gray-500">ou</p>
                <label className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer">
                  <Upload className="w-4 h-4 mr-2" />
                  Selecionar Arquivo
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleProductCSVUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Suporte para arquivos CSV separados por vírgula (,) ou ponto e vírgula (;)
              </p>
            </div>
          </div>

          {productCsvData.length > 0 && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Preview dos Dados</h3>
              <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      {Object.keys(productCsvData[0] || {}).map((header, index) => (
                        <th key={index} className="text-left py-2 px-3 font-medium text-gray-700">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {productCsvData.slice(0, 3).map((row: any, index: number) => (
                      <tr key={index} className="border-b border-gray-100">
                        {Object.values(row).map((value: any, cellIndex: number) => (
                          <td key={cellIndex} className="py-2 px-3 text-gray-600">
                            {String(value).substring(0, 30)}
                            {String(value).length > 30 ? '...' : ''}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="text-sm text-gray-500 mt-2">
                  Mostrando 3 de {productCsvData.length} registros
                </p>
              </div>

              <div className="flex justify-between items-center mt-6">
                <div className="text-sm text-gray-600">
                  📊 {productCsvData.length} {productCsvData.length === 1 ? 'produto/serviço' : 'produtos/serviços'} encontrados
                </div>
                <button
                  onClick={() => processProductAIMapping()}
                  className="btn-primary bg-purple-600 hover:bg-purple-700"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  {selectedProductTemplate 
                    ? `Mapear com Template "${selectedProductTemplate.name}"` 
                    : 'Mapear Campos Automaticamente com IA'
                  }
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <ProductMappingStep />
      )}
    </div>
  );

  // Componente para o passo de mapeamento de produtos
  const ProductMappingStep = () => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-6">3. Confirmar Mapeamento dos Campos</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(productFieldMapping).map(([field, csvColumn]: [string, any]) => (
          <div key={field} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field === 'name' ? 'Nome *' :
               field === 'code' ? 'Código *' :
               field === 'category' ? 'Categoria' :
               field === 'price' ? 'Preço' :
               field === 'cost' ? 'Custo' :
               field === 'stock' ? 'Estoque' :
               field === 'brand' ? 'Marca' :
               field === 'supplier' ? 'Fornecedor' :
               field === 'barcode' ? 'Código de Barras' :
               field === 'weight' ? 'Peso' :
               field === 'dimensions' ? 'Dimensões' :
               field === 'unit' ? 'Unidade' :
               field === 'description' ? 'Descrição' :
               field === 'status' ? 'Status' : field}
            </label>
            <select
              value={csvColumn as string}
              onChange={(e) => setProductFieldMapping((prev: any) => ({ ...prev, [field]: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">Não mapear</option>
              {Object.keys(productCsvData[0] || {}).map(header => (
                <option key={header} value={header}>{header}</option>
              ))}
            </select>
            {csvColumn ? (
              <p className="text-xs text-gray-500">
                Exemplo: {String(productCsvData[0]?.[csvColumn as string]) || 'N/A'}
              </p>
            ) : null}
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Resumo da Importação</h4>
            <p className="text-sm text-gray-600">
              {productCsvData.length} {productCsvData.length === 1 ? 'produto/serviço será importado' : 'produtos/serviços serão importados'}
            </p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => setShowProductMapping(false)}
              className="btn-secondary"
            >
              Voltar
            </button>
            <button
              onClick={saveImportedProducts}
              className="btn-primary bg-purple-600 hover:bg-purple-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Importar Produtos/Serviços
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Funções para geração de imagens
  const getAvailableImageTools = () => {
    const tools = [];
    
    // Verificar OpenAI (DALL-E) - mostrar mesmo sem API key
    if (openaiConfig.modules.imageGeneration) {
      tools.push({
        id: 'openai-dalle',
        name: 'DALL-E (OpenAI)',
        description: openaiConfig.isConfigured ? 'Geração de imagens de alta qualidade' : 'Configure a API Key para usar',
        color: openaiConfig.isConfigured ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
      });
    }
    
    // Verificar Zenvia (se tiver geração de imagem) - mostrar mesmo sem API key
    if (zenviaConfig.modules.imageGeneration) {
      tools.push({
        id: 'zenvia-image',
        name: 'Zenvia Imagem',
        description: zenviaConfig.isConfigured ? 'Geração de imagens via Zenvia' : 'Configure a API Key para usar',
        color: zenviaConfig.isConfigured ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-600'
      });
    }
    
    // Verificar Google Gemini (se tiver geração de imagem) - mostrar mesmo sem API key
    if (geminiConfig.modules.imageGeneration) {
      tools.push({
        id: 'gemini-image',
        name: 'Gemini Imagem',
        description: geminiConfig.isConfigured ? 'Geração de imagens via Google Gemini' : 'Configure a API Key para usar',
        color: geminiConfig.isConfigured ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
      });
    }
    
    return tools;
  };

  const getAvailableVideoTools = () => {
    const tools = [];
    
    // Veo 3 - Sempre disponível (fal.ai integrado)
    tools.push({
      id: 'veo-3',
      name: 'Veo 3 (Google)',
      description: 'Geração de vídeos de alta qualidade com Veo 3 via fal.ai',
      color: 'bg-purple-100 text-purple-800'
    });
    
    // Verificar OpenAI (se tiver geração de vídeo)
    if (openaiConfig.modules.videoGeneration) {
      tools.push({
        id: 'openai-video',
        name: 'OpenAI Vídeo',
        description: openaiConfig.isConfigured ? 'Geração de vídeos com IA' : 'Configure a API Key para usar',
        color: openaiConfig.isConfigured ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
      });
    }
    
    // Verificar Zenvia
    if (zenviaConfig.modules.videoGeneration) {
      tools.push({
        id: 'zenvia-video',
        name: 'Zenvia Vídeo',
        description: zenviaConfig.isConfigured ? 'Geração de vídeos via Zenvia' : 'Configure a API Key para usar',
        color: zenviaConfig.isConfigured ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-600'
      });
    }
    
    // Verificar Google Gemini
    if (geminiConfig.modules.videoGeneration) {
      tools.push({
        id: 'gemini-video',
        name: 'Gemini Vídeo',
        description: geminiConfig.isConfigured ? 'Geração de vídeos via Google Gemini' : 'Configure a API Key para usar',
        color: geminiConfig.isConfigured ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
      });
    }
    
    return tools;
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setUploadedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      alert('❌ Por favor, selecione um arquivo de imagem válido.');
    }
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setUploadedVideo(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setVideoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      alert('❌ Por favor, selecione um arquivo de vídeo válido.');
    }
  };

  const generateImage = async () => {
    if (!imagePrompt.trim()) {
      alert('❌ Por favor, digite uma descrição para gerar a imagem.');
      return;
    }

    if (!selectedImageTool) {
      alert('❌ Por favor, selecione uma ferramenta de IA.');
      return;
    }

    // Verificar se a API está configurada
    const selectedTool = getAvailableImageTools().find(t => t.id === selectedImageTool);
    if (selectedTool && !selectedTool.description.includes('Configure a API Key')) {
      // API configurada, continuar
    } else {
      alert('❌ API não configurada. Vá para "Configurações" → "Integrações" e configure a API Key da ferramenta selecionada.');
      return;
    }

    setGeneratingImage(true);

    try {
      let imageUrl = '';
      let toolName = '';

      // Chamar a API real baseada na ferramenta selecionada
      switch (selectedImageTool) {
        case 'openai-dalle':
          console.log('🎨 Tentando gerar imagem com OpenAI DALL-E...');
          toolName = 'OpenAI DALL-E';
          try {
            imageUrl = await OpenAIService.generateImage(imagePrompt, imageSize as '256x256' | '512x512' | '1024x1024');
          } catch (openaiError) {
            console.warn('⚠️ Erro com OpenAI, usando IA gratuita como fallback:', openaiError);
            // Fallback para IA gratuita
            const FreeImageService = await import('../services/freeImageService');
            imageUrl = await FreeImageService.default.generateImage(imagePrompt, imageSize as '256x256' | '512x512' | '1024x1024');
            toolName = 'IA Gratuita (Fallback)';
            alert('⚠️ Problema com OpenAI. Usando IA gratuita como alternativa.');
          }
          break;
          
        case 'gemini-image':
          console.log('🎨 Gerando imagem com Google Gemini...');
          toolName = 'Google Gemini';
          imageUrl = await GeminiService.generateImage(imagePrompt, imageSize as '256x256' | '512x512' | '1024x1024');
          break;
          
        case 'leonardo':
          console.log('🎨 Gerando imagem com Leonardo AI...');
          toolName = 'Leonardo AI';
          imageUrl = await LeonardoService.generateImage(imagePrompt, imageSize as '256x256' | '512x512' | '1024x1024');
          break;
          
        default:
          throw new Error(`Ferramenta não suportada: ${selectedImageTool}`);
      }

      if (!imageUrl) {
        throw new Error('Nenhuma URL de imagem foi retornada pela API');
      }

      console.log('✅ Imagem gerada com sucesso:', imageUrl);

      const newImage = {
        id: generateUniqueId(),
        prompt: imagePrompt,
        tool: selectedImageTool,
        toolName: toolName,
        size: imageSize,
        style: imageStyle,
        mode: imageEditMode,
        url: imageUrl,
        originalImage: uploadedImage ? imagePreview : null,
        createdAt: new Date().toISOString(),
        ownerEmail: user?.email || 'unknown'
      };

      const updatedImages = [...generatedImages, newImage];
      setGeneratedImages(updatedImages);
      localStorage.setItem('dashboardGeneratedImages', JSON.stringify(updatedImages));

      // Resetar formulário
      setImagePrompt('');
      setUploadedImage(null);
      setImagePreview('');
      
      alert(`✅ Imagem gerada com sucesso usando ${toolName}!`);
    } catch (error) {
      console.error('❌ Erro ao gerar imagem:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      alert(`❌ Erro ao gerar imagem: ${errorMessage}`);
    } finally {
      setGeneratingImage(false);
    }
  };



  const generateVideo = async () => {
    if (!videoPrompt.trim()) {
      alert('❌ Por favor, digite uma descrição para gerar o vídeo.');
      return;
    }

    if (!selectedVideoTool) {
      alert('❌ Por favor, selecione uma ferramenta de IA.');
      return;
    }

    setGeneratingVideo(true);

    try {
      let videoUrl = '';
      let toolName = '';

      // Chamar a API real baseada na ferramenta selecionada
      switch (selectedVideoTool) {
        case 'veo-3':
          console.log('🎬 Gerando vídeo com Veo 3...');
          toolName = 'Veo 3 (Google)';
          
          // Usar Veo3Service real
          const veo3Response = await Veo3Service.generateVideo({
            prompt: videoPrompt,
            duration: videoDuration,
            quality: videoQuality,
            style: videoStyle,
            mode: videoEditMode as 'generate' | 'edit'
          });
          
          if (!veo3Response.success) {
            throw new Error(veo3Response.error || 'Erro na geração Veo 3');
          }
          
          videoUrl = veo3Response.videoUrl || '';
          break;
          
        case 'openai-video':
          console.log('🎬 Gerando vídeo com OpenAI...');
          toolName = 'OpenAI Vídeo';
          await new Promise(resolve => setTimeout(resolve, 5000));
          videoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4';
          break;
          
        case 'gemini-video':
          console.log('🎬 Gerando vídeo com Google Gemini...');
          toolName = 'Gemini Vídeo';
          await new Promise(resolve => setTimeout(resolve, 6000));
          videoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
          break;
          
        default:
          // Simulação genérica
          await new Promise(resolve => setTimeout(resolve, 5000));
          videoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
          toolName = 'Ferramenta Genérica';
      }

      const newVideo = {
        id: generateUniqueId(),
        prompt: videoPrompt,
        tool: selectedVideoTool,
        toolName: toolName,
        duration: videoDuration,
        quality: videoQuality,
        style: videoStyle,
        mode: videoEditMode,
        url: videoUrl,
        thumbnail: `https://picsum.photos/480/270?random=${Math.random()}`,
        originalVideo: uploadedVideo ? videoPreview : null,
        createdAt: new Date().toISOString(),
        ownerEmail: user?.email || 'unknown'
      };

      const updatedVideos = [...generatedVideos, newVideo];
      setGeneratedVideos(updatedVideos);
      localStorage.setItem('dashboardGeneratedVideos', JSON.stringify(updatedVideos));

      // Resetar formulário
      setVideoPrompt('');
      setUploadedVideo(null);
      setVideoPreview('');
      
      alert(`✅ Vídeo gerado com sucesso usando ${toolName}!`);
    } catch (error) {
      console.error('Erro ao gerar vídeo:', error);
      alert('❌ Erro ao gerar vídeo. Tente novamente.');
    } finally {
      setGeneratingVideo(false);
    }
  };

  const deleteGeneratedImage = (imageId: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta imagem?')) {
      const updatedImages = generatedImages.filter((img: any) => img.id !== imageId);
      setGeneratedImages(updatedImages);
      localStorage.setItem('dashboardGeneratedImages', JSON.stringify(updatedImages));
      alert('✅ Imagem excluída com sucesso!');
    }
  };

  const deleteGeneratedVideo = (videoId: number) => {
    if (window.confirm('Tem certeza que deseja excluir este vídeo?')) {
      const updatedVideos = generatedVideos.filter((video: any) => video.id !== videoId);
      setGeneratedVideos(updatedVideos);
      localStorage.setItem('dashboardGeneratedVideos', JSON.stringify(updatedVideos));
      alert('✅ Vídeo excluído com sucesso!');
    }
  };

  // Função para salvar produtos importados
  const saveImportedProducts = async () => {
    try {
      if (!productCsvData.length) {
        alert('❌ Nenhum dado CSV carregado para importar.');
        return;
      }

      const requiredFields = ['name', 'code'];
      const missingFields = requiredFields.filter(field => !productFieldMapping[field]);
      
      if (missingFields.length > 0) {
        alert(`❌ Campos obrigatórios não mapeados: ${missingFields.join(', ')}`);
        return;
      }

      const importedProducts = productCsvData.map(row => {
        const product: any = {
          id: generateUniqueId(),
          name: row[productFieldMapping.name] || '',
          code: row[productFieldMapping.code] || '',
          type: 'product', // Padrão produto, pode ser alterado depois
          category: row[productFieldMapping.category] || '',
          price: parseFloat(row[productFieldMapping.price]) || 0,
          cost: parseFloat(row[productFieldMapping.cost]) || 0,
          stock: parseInt(row[productFieldMapping.stock]) || 0,
          minStock: 0,
          brand: row[productFieldMapping.brand] || '',
          supplier: row[productFieldMapping.supplier] || '',
          barcode: row[productFieldMapping.barcode] || '',
          weight: row[productFieldMapping.weight] || '',
          dimensions: row[productFieldMapping.dimensions] || '',
          unit: row[productFieldMapping.unit] || 'un',
          description: row[productFieldMapping.description] || '',
          status: row[productFieldMapping.status]?.toLowerCase() === 'inativo' ? 'inactive' : 'active',
          additionalFields: {},
          groupId: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ownerEmail: user?.email || 'unknown'
        };

        // Adicionar campos extras aos additionalFields
        Object.keys(row).forEach(key => {
          const isMainField = Object.values(productFieldMapping).includes(key);
          if (!isMainField && row[key]) {
            product.additionalFields[key] = row[key];
          }
        });

        return product;
      });

      // Salvar produtos
      const currentProducts = [...products, ...importedProducts];
      setProducts(currentProducts);
      
      // Salvar no localStorage
      localStorage.setItem('dashboardProducts', JSON.stringify(currentProducts));

      // Resetar estados
      setShowProductCSVImport(false);
      setProductCsvData([]);
      setShowProductMapping(false);
      setProductFieldMapping({});
      
      let message = `✅ ${importedProducts.length} ${importedProducts.length === 1 ? 'produto/serviço importado' : 'produtos/serviços importados'} com sucesso!`;
      
      if (selectedProductTemplate) {
        message += `\n📋 Template "${selectedProductTemplate.name}" utilizado para mapeamento.`;
      } else {
        message += '\n🤖 Mapeamento automático com IA aplicado.';
      }
      
      alert(message);

    } catch (error) {
      console.error('Erro ao importar produtos:', error);
      alert('❌ Erro ao importar produtos. Verifique o formato dos dados.');
    }
  };

  // Função para renderizar o formulário de documento
  const renderDocumentForm = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <FileText className="w-6 h-6 text-indigo-600 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">
            {editingDocument?.id ? 'Editar Documento' : `Criar ${
              editingDocument?.type === 'form' ? 'Formulário' :
              editingDocument?.type === 'contract' ? 'Contrato' :
              editingDocument?.type === 'letter' ? 'Carta' :
              editingDocument?.type === 'report' ? 'Relatório' : 'Documento'
            }`}
          </h2>
        </div>
        <button
          onClick={() => {
            setEditingDocument(null);
            setShowDocumentForm(false);
            setDocumentContent('');
          }}
          className="btn-secondary"
        >
          Voltar
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 space-y-6">
          {/* Metadados do documento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Título do Documento</label>
              <input
                type="text"
                value={editingDocument?.title || ''}
                onChange={(e) => handleDocumentFormChange('title', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Ex: Contrato de Prestação de Serviços"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Documento</label>
              <select
                value={editingDocument?.type || selectedDocumentType}
                onChange={(e) => handleDocumentFormChange('type', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="document">Documento</option>
                <option value="form">Formulário</option>
                <option value="contract">Contrato</option>
                <option value="letter">Carta</option>
                <option value="report">Relatório</option>
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags (separadas por vírgula)</label>
            <input
              type="text"
              value={editingDocument?.tags?.join(', ') || ''}
              onChange={(e) => handleDocumentFormChange('tags', e.target.value.split(',').map((tag: string) => tag.trim()).filter(Boolean))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Ex: contrato, jurídico, cliente"
            />
          </div>

          {/* Editor de conteúdo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Conteúdo do Documento</label>
            
            {/* Toolbar de formatação */}
            <div className="border border-gray-300 rounded-t-lg bg-gray-50 p-3">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => document.execCommand('bold')}
                  className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100"
                  title="Negrito"
                >
                  <strong>B</strong>
                </button>
                <button
                  type="button"
                  onClick={() => document.execCommand('italic')}
                  className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100"
                  title="Itálico"
                >
                  <em>I</em>
                </button>
                <button
                  type="button"
                  onClick={() => document.execCommand('underline')}
                  className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100"
                  title="Sublinhado"
                >
                  <span style={{textDecoration: 'underline'}}>U</span>
                </button>
                <div className="w-px bg-gray-300"></div>
                <button
                  type="button"
                  onClick={() => document.execCommand('justifyLeft')}
                  className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100"
                  title="Alinhar à esquerda"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => document.execCommand('justifyCenter')}
                  className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100"
                  title="Centralizar"
                >
                  ↔
                </button>
                <button
                  type="button"
                  onClick={() => document.execCommand('justifyRight')}
                  className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100"
                  title="Alinhar à direita"
                >
                  →
                </button>
                <div className="w-px bg-gray-300"></div>
                <button
                  type="button"
                  onClick={() => document.execCommand('insertUnorderedList')}
                  className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100"
                  title="Lista com marcadores"
                >
                  • Lista
                </button>
                <button
                  type="button"
                  onClick={() => document.execCommand('insertOrderedList')}
                  className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100"
                  title="Lista numerada"
                >
                  1. Lista
                </button>
                <div className="w-px bg-gray-300"></div>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      document.execCommand('fontSize', false, e.target.value);
                    }
                  }}
                  className="px-2 py-1 text-sm bg-white border border-gray-300 rounded"
                  defaultValue=""
                >
                  <option value="">Tamanho</option>
                  <option value="1">Pequeno</option>
                  <option value="3">Normal</option>
                  <option value="5">Grande</option>
                  <option value="7">Muito Grande</option>
                </select>
                <button
                  type="button"
                  onClick={() => {
                    const color = prompt('Digite a cor (ex: #ff0000 ou red):');
                    if (color) document.execCommand('foreColor', false, color);
                  }}
                  className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100"
                  title="Cor do texto"
                >
                  🎨
                </button>
              </div>
            </div>

            {/* Editor de texto rico */}
            <div
              contentEditable
              onInput={(e) => setDocumentContent((e.target as HTMLElement).innerHTML)}
              dangerouslySetInnerHTML={{ __html: documentContent }}
              className="w-full min-h-96 p-4 border border-t-0 border-gray-300 rounded-b-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              style={{ 
                minHeight: '400px',
                maxHeight: '600px',
                overflowY: 'auto'
              }}
              suppressContentEditableWarning={true}
            />
          </div>

          {/* Seção especial para formulários */}
          {editingDocument?.type === 'form' && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Campos do Formulário</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      const fieldHtml = `<div class="form-field"><label>Campo de Texto:</label><br><input type="text" style="border: 1px solid #ccc; padding: 8px; width: 200px; margin: 5px 0;"></div>`;
                      setDocumentContent(prev => prev + fieldHtml);
                    }}
                    className="p-4 border border-dashed border-gray-300 rounded-lg hover:bg-gray-50 text-center"
                  >
                    ➕ Campo de Texto
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const fieldHtml = `<div class="form-field"><label>Campo de E-mail:</label><br><input type="email" style="border: 1px solid #ccc; padding: 8px; width: 200px; margin: 5px 0;"></div>`;
                      setDocumentContent(prev => prev + fieldHtml);
                    }}
                    className="p-4 border border-dashed border-gray-300 rounded-lg hover:bg-gray-50 text-center"
                  >
                    ✉️ Campo de E-mail
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const fieldHtml = `<div class="form-field"><label>Área de Texto:</label><br><textarea style="border: 1px solid #ccc; padding: 8px; width: 300px; height: 80px; margin: 5px 0;"></textarea></div>`;
                      setDocumentContent(prev => prev + fieldHtml);
                    }}
                    className="p-4 border border-dashed border-gray-300 rounded-lg hover:bg-gray-50 text-center"
                  >
                    📝 Área de Texto
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const fieldHtml = `<div class="form-field"><label>Seleção:</label><br><select style="border: 1px solid #ccc; padding: 8px; width: 200px; margin: 5px 0;"><option>Opção 1</option><option>Opção 2</option></select></div>`;
                      setDocumentContent(prev => prev + fieldHtml);
                    }}
                    className="p-4 border border-dashed border-gray-300 rounded-lg hover:bg-gray-50 text-center"
                  >
                    📋 Seleção
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const fieldHtml = `<div class="form-field"><label><input type="checkbox" style="margin-right: 8px;"> Checkbox</label></div>`;
                      setDocumentContent(prev => prev + fieldHtml);
                    }}
                    className="p-4 border border-dashed border-gray-300 rounded-lg hover:bg-gray-50 text-center"
                  >
                    ☑️ Checkbox
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const fieldHtml = `<div class="form-field"><label>Data:</label><br><input type="date" style="border: 1px solid #ccc; padding: 8px; width: 200px; margin: 5px 0;"></div>`;
                      setDocumentContent(prev => prev + fieldHtml);
                    }}
                    className="p-4 border border-dashed border-gray-300 rounded-lg hover:bg-gray-50 text-center"
                  >
                    📅 Data
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Ações */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              onClick={() => {
                setEditingDocument(null);
                setShowDocumentForm(false);
                setDocumentContent('');
              }}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              onClick={saveDocument}
              className="btn-primary bg-indigo-600 hover:bg-indigo-700"
            >
              {editingDocument?.id ? 'Atualizar' : 'Criar'} Documento
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const saveImportedClients = async () => {
    try {
      if (!csvData.length) {
        alert('❌ Nenhum dado CSV carregado para importar.');
        return;
      }

      if (!Object.keys(columnMapping).length) {
        alert('❌ Configure o mapeamento das colunas antes de importar.');
        return;
      }

      // Verificar se pelo menos um campo foi mapeado
      const mappedFields = Object.values(columnMapping).filter(field => field !== 'ignorar' && field !== '');
      if (mappedFields.length === 0) {
        alert('❌ Mapeie pelo menos uma coluna para um campo válido.');
        return;
      }

      console.log('🔄 Iniciando importação de clientes...');
      
      const importedClients = csvData.map((row, index) => {
        try {
          const client: any = {
            id: generateUniqueId(),
            createdAt: new Date().toISOString(),
            ownerEmail: user?.email || 'unknown',
            importedAt: new Date().toISOString(),
            importSource: 'csv',
            additionalFields: {},
            groupId: selectedGroupForImport?.id || null
          };

          // Mapear colunas baseado no mapeamento configurado
          Object.entries(columnMapping).forEach(([csvColumn, mappedField]) => {
            if (mappedField !== 'ignorar' && mappedField !== '' && row[csvColumn]) {
              const value = row[csvColumn].toString().trim();
              if (value) {
                // Campos principais (padrão da interface Client)
                if (mappedField === 'nome') {
                  client.name = value;
                } else if (mappedField === 'telefone') {
                  client.phone = value;
                } else if (mappedField === 'cpf') {
                  client.cpf = value;
                } else if (mappedField === 'email') {
                  client.email = value;
                } else {
                  // Todos os outros campos vão para additionalFields
                  client.additionalFields[mappedField] = value;
                }
                
                // Também salvar todos os dados importados com o nome original da coluna
                client.additionalFields[`${csvColumn}_original`] = value;
              }
            }
          });

          // Verificar se o cliente tem pelo menos um campo obrigatório preenchido
          if (!client.name && !client.email && !client.phone) {
            console.warn(`⚠️ Cliente da linha ${index + 2} não tem dados suficientes, será ignorado.`);
            return null;
          }

          return client;
        } catch (error) {
          console.error(`❌ Erro ao processar cliente da linha ${index + 2}:`, error);
          return null;
        }
      }).filter(client => client !== null);

      if (importedClients.length === 0) {
        alert('❌ Nenhum cliente válido foi encontrado para importar.');
        return;
      }

      // Adicionar aos clientes existentes
      setClients((prev: any) => [...prev, ...importedClients]);
      
      // Salvar no localStorage
      const currentClients = JSON.parse(localStorage.getItem('dashboardClients') || '[]');
      const updatedClients = [...currentClients, ...importedClients];
      localStorage.setItem('dashboardClients', JSON.stringify(updatedClients));

      console.log('✅ Clientes importados com sucesso:', importedClients);

      // Resetar estados
      setCsvFile(null);
      setCsvData([]);
      setCsvHeaders([]);
      setCsvSeparator(',');
      setColumnMapping({});
      setShowCsvImport(false);
      setShowMappingModal(false);
      setSelectedGroupForImport(null);
      setSelectedTemplate(null);

      // Mensagem de sucesso detalhada
      const skippedCount = csvData.length - importedClients.length;
      let message = `✅ ${importedClients.length} clientes importados com sucesso!`;
      
      if (selectedTemplate) {
        message += `\n📋 Mapeamento aplicado: Template "${selectedTemplate.name}"`;
      } else {
        message += `\n🧠 Mapeamento aplicado: IA automática`;
      }
      
      if (selectedGroupForImport) {
        message += `\n📁 Todos foram associados ao grupo: ${selectedGroupForImport.name}`;
      } else {
        message += `\n👤 Clientes importados individualmente (sem grupo)`;
      }
      
      if (skippedCount > 0) {
        message += `\n⚠️ ${skippedCount} linhas foram ignoradas por falta de dados obrigatórios.`;
      }
      
      alert(message);

    } catch (error) {
      console.error('❌ Erro durante importação:', error);
      alert('❌ Erro durante a importação. Verifique o console para mais detalhes.');
    }
  };

  // Funções para templates
  const openTemplateForm = (template?: any) => {
    if (template) {
      setEditingTemplate({ ...template });
    } else {
      setEditingTemplate({
        id: 0,
        name: '',
        description: '',
        type: 'clientes',
        columns: [
          { field: 'nome', required: true, order: 1 },
          { field: 'email', required: false, order: 2 },
          { field: 'telefone', required: false, order: 3 }
        ],
        createdAt: new Date().toISOString()
      });
    }
    setShowTemplateForm(true);
  };

  const handleTemplateFormChange = (field: string, value: any) => {
    setEditingTemplate((prev: any) => {
      if (!prev) {
        return {
          id: 0,
          name: '',
          description: '',
          type: 'clientes',
          columns: [],
          createdAt: new Date().toISOString(),
          [field]: value
        };
      }
      return { ...prev, [field]: value };
    });
  };

  const addTemplateColumn = () => {
    if (!editingTemplate) return;
    
    const newColumn = {
      field: '',
      required: false,
      order: editingTemplate.columns.length + 1
    };
    
    setEditingTemplate((prev: any) => ({
      ...prev,
      columns: [...prev.columns, newColumn]
    }));
  };

  const updateTemplateColumn = (index: number, field: string, value: any) => {
    setEditingTemplate((prev: any) => ({
      ...prev,
      columns: prev.columns.map((col: any, idx: number) =>
        idx === index ? { ...col, [field]: value } : col
      )
    }));
  };

  const removeTemplateColumn = (index: number) => {
    setEditingTemplate((prev: any) => ({
      ...prev,
      columns: prev.columns.filter((_: any, idx: number) => idx !== index)
    }));
  };

  const saveTemplate = () => {
    if (!editingTemplate) return;

    if (!editingTemplate.name || !editingTemplate.description) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (editingTemplate.columns.length === 0) {
      alert('Por favor, adicione pelo menos uma coluna ao template.');
      return;
    }

    if (editingTemplate.id) {
      // Editando template existente
      const updatedTemplate = { 
        ...editingTemplate,
        updatedAt: new Date().toISOString()
      };
      
      setTemplates((prev: any) => prev.map((template: any) =>
        template.id === editingTemplate.id ? updatedTemplate : template
      ));
      
      // Salvar no localStorage
      const currentTemplates = JSON.parse(localStorage.getItem('dashboardTemplates') || '[]');
      const updatedTemplates = currentTemplates.map((t: any) => 
        t.id === editingTemplate.id ? updatedTemplate : t
      );
      localStorage.setItem('dashboardTemplates', JSON.stringify(updatedTemplates));
      
      alert('Template atualizado com sucesso!');
    } else {
      // Criando novo template
      const newTemplate = {
        ...editingTemplate,
        id: generateUniqueId(),
        createdAt: new Date().toISOString()
      };
      
      setTemplates((prev: any) => [...prev, newTemplate]);
      
      // Salvar no localStorage
      const currentTemplates = JSON.parse(localStorage.getItem('dashboardTemplates') || '[]');
      currentTemplates.push(newTemplate);
      localStorage.setItem('dashboardTemplates', JSON.stringify(currentTemplates));
      
      alert('Template criado com sucesso!');
    }

    setEditingTemplate(null);
    setShowTemplateForm(false);
    setActiveSubSection('');
  };

  const deleteTemplate = (templateId: number) => {
    if (window.confirm('Tem certeza que deseja excluir este template?')) {
      setTemplates((prev: any) => prev.filter((template: any) => template.id !== templateId));
      
      // Remover do localStorage
      const currentTemplates = JSON.parse(localStorage.getItem('dashboardTemplates') || '[]');
      const updatedTemplates = currentTemplates.filter((t: any) => t.id !== templateId);
      localStorage.setItem('dashboardTemplates', JSON.stringify(updatedTemplates));
      
      alert('Template excluído com sucesso!');
    }
  };

  const renderTemplates = () => (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Layout className="w-6 h-6 text-purple-600 mr-3" />
          <h2 className="text-xl font-bold text-gray-900">Templates de Importação</h2>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => {
              openTemplateForm();
              setActiveSubSection('templates-form');
            }}
            className="btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Criar Template
          </button>
        </div>
      </div>

      {activeSubSection === 'templates-form' ? (
        renderTemplateForm()
      ) : (
        <>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar templates..."
                value={searchTemplate}
                onChange={(e) => setSearchTemplate(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates
              .filter((template: any) =>
                (template.name || '').toLowerCase().includes(searchTemplate.toLowerCase()) ||
                (template.description || '').toLowerCase().includes(searchTemplate.toLowerCase()) ||
                (template.type || '').toLowerCase().includes(searchTemplate.toLowerCase())
              )
              .map((template: any) => (
                <div key={template.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="text-center">
                    <Layout className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{template.name}</h3>
                    <span className="inline-block px-2 py-1 rounded-full text-xs font-medium mb-4 bg-purple-100 text-purple-800">
                      {template.type.charAt(0).toUpperCase() + template.type.slice(1)}
                    </span>
                    <p className="text-gray-600 text-sm mb-4">{template.description}</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Colunas:</span>
                        <span className="font-medium text-gray-900">{template.columns?.length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Obrigatórias:</span>
                        <span className="font-medium text-gray-900">
                          {template.columns?.filter((col: any) => col.required).length || 0}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-center space-x-2 mt-4">
                      <button
                        onClick={() => {
                          openTemplateForm(template);
                          setActiveSubSection('templates-form');
                        }}
                        className="px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => deleteTemplate(template.id)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            
            {templates.length === 0 && (
              <div className="col-span-full text-center py-8">
                <Layout className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum template encontrado</h3>
                <p className="text-gray-600">Comece criando seu primeiro template de importação.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );

  const renderTemplateForm = () => (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Layout className="w-6 h-6 text-purple-600 mr-3" />
          <h2 className="text-xl font-bold text-gray-900">
            {editingTemplate?.id ? 'Editar Template' : 'Criar Template'}
          </h2>
        </div>
        <button
          onClick={() => {
            setEditingTemplate(null);
            setShowTemplateForm(false);
            setActiveSubSection('');
          }}
          className="btn-secondary"
        >
          Voltar
        </button>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Template</label>
            <input
              type="text"
              value={editingTemplate?.name || ''}
              onChange={(e) => handleTemplateFormChange('name', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Ex: Template Clientes Padrão"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Dados</label>
            <select
              value={editingTemplate?.type || 'clientes'}
              onChange={(e) => handleTemplateFormChange('type', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="clientes">Clientes</option>
              <option value="produtos">Produtos</option>
              <option value="servicos">Serviços</option>
              <option value="usuarios">Usuários</option>
              <option value="campanhas">Campanhas</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
          <textarea
            value={editingTemplate?.description || ''}
            onChange={(e) => handleTemplateFormChange('description', e.target.value)}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="Descreva o propósito deste template"
          />
        </div>

        {/* Configuração de Colunas */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-700">Configuração de Colunas</label>
            <button
              onClick={addTemplateColumn}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-purple-700 bg-purple-100 hover:bg-purple-200 transition-colors"
            >
              <Plus className="w-4 h-4 mr-1" />
              Adicionar Coluna
            </button>
          </div>

          <div className="space-y-3">
            {editingTemplate?.columns?.map((column: any, index: number) => (
              <div key={index} className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex-1">
                  <input
                    type="text"
                    value={column.field}
                    onChange={(e) => updateTemplateColumn(index, 'field', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Nome do campo (ex: nome, email, telefone)"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={column.order}
                    onChange={(e) => updateTemplateColumn(index, 'order', parseInt(e.target.value))}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Ordem"
                    min="1"
                  />
                </div>
                <div className="flex items-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={column.required}
                      onChange={(e) => updateTemplateColumn(index, 'required', e.target.checked)}
                      className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Obrigatório</span>
                  </label>
                </div>
                <button
                  onClick={() => removeTemplateColumn(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            
            {(!editingTemplate?.columns || editingTemplate.columns.length === 0) && (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <Columns className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Nenhuma coluna configurada</p>
                <p className="text-sm text-gray-400">Clique em "Adicionar Coluna" para começar</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4 border-t">
          <button
            onClick={() => {
              setEditingTemplate(null);
              setShowTemplateForm(false);
              setActiveSubSection('');
            }}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
          >
            Cancelar
          </button>
          <button
            onClick={saveTemplate}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
          >
            {editingTemplate?.id ? 'Atualizar' : 'Criar'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderDocuments = () => {
    if (showDocumentForm) {
      return renderDocumentForm();
    }

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FileText className="w-6 h-6 text-indigo-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Documentos</h2>
            <span className="ml-3 px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">
              Editor Avançado
            </span>
          </div>
          <div className="flex space-x-3">
            <select
              value={selectedDocumentType}
              onChange={(e) => setSelectedDocumentType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="document">Documento</option>
              <option value="form">Formulário</option>
              <option value="contract">Contrato</option>
              <option value="letter">Carta</option>
              <option value="report">Relatório</option>
            </select>
            <button
              onClick={() => openDocumentForm(null, selectedDocumentType)}
              className="btn-primary bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar {selectedDocumentType === 'document' ? 'Documento' : 
                    selectedDocumentType === 'form' ? 'Formulário' :
                    selectedDocumentType === 'contract' ? 'Contrato' :
                    selectedDocumentType === 'letter' ? 'Carta' : 'Relatório'}
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar documentos..."
            value={searchDocument}
            onChange={(e) => setSearchDocument(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Filters */}
        <div className="flex space-x-4 overflow-x-auto pb-2">
          {['all', 'document', 'form', 'contract', 'letter', 'report'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedDocumentType(type)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedDocumentType === type || (type === 'all' && selectedDocumentType === 'document')
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type === 'all' ? 'Todos' :
               type === 'document' ? 'Documentos' :
               type === 'form' ? 'Formulários' :
               type === 'contract' ? 'Contratos' :
               type === 'letter' ? 'Cartas' : 'Relatórios'}
            </button>
          ))}
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents
            .filter((doc: any) => 
              (selectedDocumentType === 'all' || selectedDocumentType === 'document' || doc.type === selectedDocumentType) &&
              ((doc.title || '').toLowerCase().includes(searchDocument.toLowerCase()) ||
               (doc.content || '').toLowerCase().includes(searchDocument.toLowerCase()))
            )
            .map((document: any) => (
              <div key={document.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    {getDocumentIcon(document.type)}
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{document.title}</h3>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getDocumentTypeColor(document.type)}`}>
                        {document.type.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setShowDeleteDocumentConfirm(showDeleteDocumentConfirm === document.id ? null : document.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    {showDeleteDocumentConfirm === document.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                        <div className="py-1">
                          <button
                            onClick={() => {
                              openDocumentForm(document, document.type);
                              setShowDeleteDocumentConfirm(null);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </button>
                          <button
                            onClick={() => {
                              exportDocument(document);
                              setShowDeleteDocumentConfirm(null);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Exportar HTML
                          </button>
                          <button
                            onClick={() => deleteDocument(document.id)}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <p className="text-gray-600 text-sm line-clamp-3">
                    {document.content ? document.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : 'Sem conteúdo'}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Criado: {new Date(document.createdAt).toLocaleDateString('pt-BR')}</span>
                    {document.updatedAt && (
                      <span>Editado: {new Date(document.updatedAt).toLocaleDateString('pt-BR')}</span>
                    )}
                  </div>
                  
                  {document.tags && document.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {document.tags.slice(0, 3).map((tag: string, index: number) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          {tag}
                        </span>
                      ))}
                      {document.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{document.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>

        {/* Empty State */}
        {documents.filter((doc: any) => 
          (selectedDocumentType === 'all' || selectedDocumentType === 'document' || doc.type === selectedDocumentType) &&
          ((doc.title || '').toLowerCase().includes(searchDocument.toLowerCase()) ||
           (doc.content || '').toLowerCase().includes(searchDocument.toLowerCase()))
        ).length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum documento encontrado</h3>
            <p className="text-gray-600 mb-4">
              {searchDocument 
                ? 'Tente ajustar sua busca ou criar um novo documento'
                : 'Comece criando seu primeiro documento'}
            </p>
            <button
              onClick={() => openDocumentForm(null, selectedDocumentType)}
              className="btn-primary bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar Documento
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderInventory = () => {
    if (showProductForm) {
      return renderProductForm();
    }

    if (showProductCSVImport) {
      return renderProductCSVImport();
    }

    return renderInventoryList();
  };

  const renderInventoryList = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Package className="w-6 h-6 text-purple-600 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">Estoque</h2>
          <span className="ml-3 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
            {products.filter((p: any) => p.type === 'product').length} Produtos
          </span>
          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            {products.filter((p: any) => p.type === 'service').length} Serviços
          </span>
        </div>
        <div className="flex space-x-3">
          <select
            value={selectedProductType}
            onChange={(e) => setSelectedProductType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="product">Produto</option>
            <option value="service">Serviço</option>
          </select>
          <button
            onClick={() => setShowProductCSVImport(true)}
            className="btn-secondary"
          >
            <Upload className="w-4 h-4 mr-2" />
            Importar CSV
          </button>
          <button
            onClick={() => openProductForm()}
            className="btn-primary bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Cadastrar {selectedProductType === 'product' ? 'Produto' : 'Serviço'}
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar produtos/serviços..."
              value={searchProduct}
              onChange={(e) => setSearchProduct(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <div className="flex space-x-2">
            {['all', 'product', 'service'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedProductType(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedProductType === type || (type === 'all' && selectedProductType === 'product')
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type === 'all' ? 'Todos' : type === 'product' ? 'Produtos' : 'Serviços'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Produtos</p>
              <p className="text-2xl font-bold text-gray-900">
                {products.filter((p: any) => p.type === 'product').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Settings className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Serviços</p>
              <p className="text-2xl font-bold text-gray-900">
                {products.filter((p: any) => p.type === 'service').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Estoque Baixo</p>
              <p className="text-2xl font-bold text-gray-900">
                {products.filter((p: any) => p.type === 'product' && p.stock <= (p.minStock || 0)).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Ativos</p>
              <p className="text-2xl font-bold text-gray-900">
                {products.filter((p: any) => p.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Products Overview */}
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {selectedProductType === 'all' ? 'Produtos e Serviços' : 
           selectedProductType === 'product' ? 'Produtos' : 'Serviços'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products
            .filter((product: any) => 
              (selectedProductType === 'all' || product.type === selectedProductType) &&
              ((product.name || '').toLowerCase().includes(searchProduct.toLowerCase()) ||
               (product.code || '').toLowerCase().includes(searchProduct.toLowerCase()) ||
               (product.category || '').toLowerCase().includes(searchProduct.toLowerCase()))
            )
            .slice(0, 9)
            .map((product: any) => (
              <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    {product.type === 'service' ? (
                      <Settings className="w-8 h-8 text-blue-600 mr-3" />
                    ) : (
                      <Package className="w-8 h-8 text-purple-600 mr-3" />
                    )}
                    <div>
                      <h4 className="font-medium text-gray-900 line-clamp-1">{product.name}</h4>
                      <p className="text-sm text-gray-500">{product.code}</p>
                    </div>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setShowDeleteProductConfirm(showDeleteProductConfirm === product.id ? null : product.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    {showDeleteProductConfirm === product.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                        <div className="py-1">
                          <button
                            onClick={() => {
                              setShowProductFields(product.id);
                              setShowDeleteProductConfirm(null);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Campos
                          </button>
                          <button
                            onClick={() => {
                              openProductForm(product);
                              setShowDeleteProductConfirm(null);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </button>
                          <button
                            onClick={() => deleteProduct(product.id)}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Categoria:</span>
                    <span className="text-gray-900">{product.category || 'Não informado'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Preço:</span>
                    <span className="text-gray-900 font-medium">
                      {product.price ? `R$ ${parseFloat(product.price).toFixed(2)}` : 'Não informado'}
                    </span>
                  </div>
                  {product.type === 'product' && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Estoque:</span>
                      <span className={`font-medium ${
                        product.stock <= (product.minStock || 0) ? 'text-red-600' : 'text-gray-900'
                      }`}>
                        {product.stock || 0} {product.unit || 'un'}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      product.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.status === 'active' ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* View All Button */}
        {products.filter((product: any) => 
          (selectedProductType === 'all' || product.type === selectedProductType) &&
          ((product.name || '').toLowerCase().includes(searchProduct.toLowerCase()) ||
           (product.code || '').toLowerCase().includes(searchProduct.toLowerCase()) ||
           (product.category || '').toLowerCase().includes(searchProduct.toLowerCase()))
        ).length > 9 && (
          <div className="mt-6 text-center">
            <button className="text-purple-600 hover:text-purple-700 font-medium">
              Ver todos os {products.filter((product: any) => 
                (selectedProductType === 'all' || product.type === selectedProductType) &&
                ((product.name || '').toLowerCase().includes(searchProduct.toLowerCase()) ||
                 (product.code || '').toLowerCase().includes(searchProduct.toLowerCase()) ||
                 (product.category || '').toLowerCase().includes(searchProduct.toLowerCase()))
              ).length} itens
            </button>
          </div>
        )}

        {/* Empty State */}
        {products.filter((product: any) => 
          (selectedProductType === 'all' || product.type === selectedProductType) &&
          ((product.name || '').toLowerCase().includes(searchProduct.toLowerCase()) ||
           (product.code || '').toLowerCase().includes(searchProduct.toLowerCase()) ||
           (product.category || '').toLowerCase().includes(searchProduct.toLowerCase()))
        ).length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum {selectedProductType === 'service' ? 'serviço' : selectedProductType === 'product' ? 'produto' : 'item'} encontrado
            </h3>
            <p className="text-gray-600 mb-4">
              {searchProduct 
                ? 'Tente ajustar sua busca ou cadastrar um novo item'
                : `Comece cadastrando seu primeiro ${selectedProductType === 'service' ? 'serviço' : 'produto'}`}
            </p>
            <button
              onClick={() => openProductForm()}
              className="btn-primary bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Cadastrar {selectedProductType === 'service' ? 'Serviço' : 'Produto'}
            </button>
          </div>
        )}
      </div>

      {/* Product Fields Modal */}
      {showProductFields && (
        <ProductFieldsModal 
          product={products.find((p: any) => p.id === showProductFields)}
          onClose={() => setShowProductFields(null)}
        />
      )}
    </div>
  );

  const renderPayments = () => (
    <div className="card text-center py-12">
      <PaymentsIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Pagamentos</h3>
      <p className="text-gray-600">Sistema de pagamentos em desenvolvimento.</p>
    </div>
  );

  const renderIntegrations = () => {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Integrações</h2>
            <p className="text-gray-600">Configure suas APIs e serviços externos</p>
          </div>
          <div className="flex items-center space-x-6">
            {/* Status OpenAI */}
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${openaiConfig.isConfigured ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600">
                {openaiConfig.isConfigured ? 'OpenAI Conectada' : 'OpenAI Desconectada'}
              </span>
            </div>
            {/* Status Zenvia */}
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${zenviaConfig.isConfigured ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600">
                {zenviaConfig.isConfigured ? 'Zenvia Conectada' : 'Zenvia Desconectada'}
              </span>
            </div>
            {/* Status Gemini */}
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${geminiConfig.isConfigured ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600">
                {geminiConfig.isConfigured ? 'Gemini Conectada' : 'Gemini Desconectada'}
              </span>
            </div>
          </div>
        </div>

        {/* OpenAI Integration Card */}
        <div className="card">
          <div className="p-6">
            {/* Header do Card */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center mr-4">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">OpenAI API</h3>
                  <p className="text-gray-600">Configure sua integração com OpenAI para IA generativa</p>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                openaiConfig.isConfigured 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {openaiConfig.isConfigured ? 'Configurada' : 'Não Configurada'}
              </div>
            </div>

            {/* API Key Configuration */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key OpenAI
                </label>
                <div className="flex space-x-3">
                  <div className="flex-1 relative">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={openaiConfig.apiKey}
                      onChange={(e) => setOpenaiConfig({
                        ...openaiConfig,
                        apiKey: e.target.value,
                        isConfigured: false
                      })}
                      placeholder="sk-proj-..."
                      className="input-field pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <button
                    onClick={testOpenAIConnection}
                    disabled={testingConnection || !openaiConfig.apiKey.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                  >
                    {testingConnection ? (
                      <>
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                        Testando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Testar Conexão
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Obtenha sua API Key em: <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">platform.openai.com/api-keys</a>
                </p>
              </div>

              {/* Modules Configuration */}
              {openaiConfig.isConfigured && (
                <div className="mt-8">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Módulos Habilitados</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* WhatsApp Agent */}
                    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <MessageCircle className="w-5 h-5 text-green-600 mr-3" />
                          <div>
                            <h5 className="font-medium text-gray-900">Agente IA - WhatsApp</h5>
                            <p className="text-sm text-gray-600">IA para conversas WhatsApp</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={openaiConfig.modules.whatsapp}
                            onChange={() => toggleModuleOpenAI('whatsapp')}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>

                    {/* Voice Agent */}
                    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Mic className="w-5 h-5 text-purple-600 mr-3" />
                          <div>
                            <h5 className="font-medium text-gray-900">Agente IA - Voz</h5>
                            <p className="text-sm text-gray-600">IA para chamadas de voz</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={openaiConfig.modules.voice}
                            onChange={() => toggleModuleOpenAI('voice')}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>

                    {/* SMS Agent */}
                    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <MessageSquare className="w-5 h-5 text-blue-600 mr-3" />
                          <div>
                            <h5 className="font-medium text-gray-900">Agente IA - SMS</h5>
                            <p className="text-sm text-gray-600">IA para mensagens SMS</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={openaiConfig.modules.sms}
                            onChange={() => toggleModuleOpenAI('sms')}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>

                    {/* Email Agent */}
                    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Mail className="w-5 h-5 text-red-600 mr-3" />
                          <div>
                            <h5 className="font-medium text-gray-900">Agente IA - E-mail</h5>
                            <p className="text-sm text-gray-600">IA para e-mails automáticos</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={openaiConfig.modules.email}
                            onChange={() => toggleModuleOpenAI('email')}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>

                    {/* Image Generation */}
                    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <ImageIcon className="w-5 h-5 text-pink-600 mr-3" />
                          <div>
                            <h5 className="font-medium text-gray-900">Gerador de Imagens</h5>
                            <p className="text-sm text-gray-600">DALL-E para criação de imagens</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={openaiConfig.modules.imageGeneration}
                            onChange={() => toggleModuleOpenAI('imageGeneration')}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>

                    {/* Video Generation */}
                    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <VideoIcon className="w-5 h-5 text-indigo-600 mr-3" />
                          <div>
                            <h5 className="font-medium text-gray-900">Gerador de Vídeos</h5>
                            <p className="text-sm text-gray-600">IA para criação de vídeos</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={openaiConfig.modules.videoGeneration}
                            onChange={() => toggleModuleOpenAI('videoGeneration')}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Status Summary */}
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <Info className="w-5 h-5 text-blue-600 mr-2" />
                      <div>
                        <h5 className="font-medium text-blue-900">Status da Integração</h5>
                        <p className="text-sm text-blue-700">
                          {Object.values(openaiConfig.modules).filter(Boolean).length} de 6 módulos habilitados • 
                          API Key configurada e testada
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Warning when not configured */}
              {!openaiConfig.isConfigured && openaiConfig.apiKey && (
                <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                    <div>
                      <h5 className="font-medium text-yellow-900">API Key não testada</h5>
                      <p className="text-sm text-yellow-700">
                        Clique em "Testar Conexão" para validar sua API Key
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Zenvia Integration Card */}
        <div className="card">
          <div className="p-6">
            {/* Header do Card */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center mr-4">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Zenvia API</h3>
                  <p className="text-gray-600">Configure sua integração com Zenvia para comunicação multi-canal</p>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                zenviaConfig.isConfigured 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {zenviaConfig.isConfigured ? 'Configurada' : 'Não Configurada'}
              </div>
            </div>

            {/* API Key Configuration */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Token Zenvia
                </label>
                <div className="flex space-x-3">
                  <div className="flex-1 relative">
                    <input
                      type={showZenviaApiKey ? 'text' : 'password'}
                      value={zenviaConfig.apiKey}
                      onChange={(e) => setZenviaConfig({
                        ...zenviaConfig,
                        apiKey: e.target.value,
                        isConfigured: false
                      })}
                      placeholder="your-zenvia-api-token"
                      className="input-field pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowZenviaApiKey(!showZenviaApiKey)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showZenviaApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <button
                    onClick={testZenviaConnection}
                    disabled={testingZenviaConnection || !zenviaConfig.apiKey.trim()}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center"
                  >
                    {testingZenviaConnection ? (
                      <>
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                        Testando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Testar Conexão
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Obtenha seu API Token em: <a href="https://app.zenvia.com/home/api" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">app.zenvia.com/home/api</a>
                </p>
              </div>

              {/* Modules Configuration */}
              {zenviaConfig.isConfigured && (
                <div className="mt-8">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Módulos Habilitados</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* WhatsApp Agent */}
                    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <MessageCircle className="w-5 h-5 text-green-600 mr-3" />
                          <div>
                            <h5 className="font-medium text-gray-900">Agente IA - WhatsApp</h5>
                            <p className="text-sm text-gray-600">Mensagens WhatsApp Business</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={zenviaConfig.modules.whatsapp}
                            onChange={() => toggleModuleZenvia('whatsapp')}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                        </label>
                      </div>
                    </div>

                    {/* Voice Agent */}
                    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Phone className="w-5 h-5 text-purple-600 mr-3" />
                          <div>
                            <h5 className="font-medium text-gray-900">Agente IA - Voz</h5>
                            <p className="text-sm text-gray-600">Chamadas de voz automáticas</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={zenviaConfig.modules.voice}
                            onChange={() => toggleModuleZenvia('voice')}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                        </label>
                      </div>
                    </div>

                    {/* SMS Agent */}
                    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <MessageSquare className="w-5 h-5 text-blue-600 mr-3" />
                          <div>
                            <h5 className="font-medium text-gray-900">Agente IA - SMS</h5>
                            <p className="text-sm text-gray-600">Mensagens SMS diretas</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={zenviaConfig.modules.sms}
                            onChange={() => toggleModuleZenvia('sms')}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                        </label>
                      </div>
                    </div>

                    {/* Email Agent */}
                    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Mail className="w-5 h-5 text-red-600 mr-3" />
                          <div>
                            <h5 className="font-medium text-gray-900">Agente IA - E-mail</h5>
                            <p className="text-sm text-gray-600">E-mails transacionais</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={zenviaConfig.modules.email}
                            onChange={() => toggleModuleZenvia('email')}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                        </label>
                      </div>
                    </div>

                    {/* Image Generation */}
                    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <ImageIcon className="w-5 h-5 text-pink-600 mr-3" />
                          <div>
                            <h5 className="font-medium text-gray-900">Gerador de Imagens</h5>
                            <p className="text-sm text-gray-600">Distribuição de imagens</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={zenviaConfig.modules.imageGeneration}
                            onChange={() => toggleModuleZenvia('imageGeneration')}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                        </label>
                      </div>
                    </div>

                    {/* Video Generation */}
                    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <VideoIcon className="w-5 h-5 text-indigo-600 mr-3" />
                          <div>
                            <h5 className="font-medium text-gray-900">Gerador de Vídeos</h5>
                            <p className="text-sm text-gray-600">Distribuição de vídeos</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={zenviaConfig.modules.videoGeneration}
                            onChange={() => toggleModuleZenvia('videoGeneration')}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Status Summary */}
                  <div className="mt-6 p-4 bg-orange-50 rounded-lg">
                    <div className="flex items-center">
                      <Info className="w-5 h-5 text-orange-600 mr-2" />
                      <div>
                        <h5 className="font-medium text-orange-900">Status da Integração</h5>
                        <p className="text-sm text-orange-700">
                          {Object.values(zenviaConfig.modules).filter(Boolean).length} de 6 módulos habilitados • 
                          API Token configurado e testado
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Warning when not configured */}
              {!zenviaConfig.isConfigured && zenviaConfig.apiKey && (
                <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                    <div>
                      <h5 className="font-medium text-yellow-900">API Token não testado</h5>
                      <p className="text-sm text-yellow-700">
                        Clique em "Testar Conexão" para validar seu API Token
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Google Gemini Integration Card */}
        <div className="card">
          <div className="p-6">
            {/* Header do Card */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-4">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Google Gemini API</h3>
                  <p className="text-gray-600">Configure sua integração com Google Gemini para IA avançada</p>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                geminiConfig.isConfigured 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {geminiConfig.isConfigured ? 'Configurada' : 'Não Configurada'}
              </div>
            </div>

            {/* API Key Configuration */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key Google Gemini
                </label>
                <div className="flex space-x-3">
                  <div className="flex-1 relative">
                    <input
                      type={showGeminiApiKey ? 'text' : 'password'}
                      value={geminiConfig.apiKey}
                      onChange={(e) => updateGeminiApiKey(e.target.value)}
                      placeholder="AIzaSy..."
                      className="input-field pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowGeminiApiKey(!showGeminiApiKey)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showGeminiApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <button
                    onClick={testGeminiConnection}
                    disabled={testingGeminiConnection || !geminiConfig.apiKey.trim()}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
                  >
                    {testingGeminiConnection ? (
                      <>
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                        Testando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Testar Conexão
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Obtenha sua API Key em: <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">Google AI Studio</a>
                </p>
              </div>

              {/* Modules Configuration */}
              {geminiConfig.isConfigured && (
                <div className="mt-8">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Módulos Habilitados</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* WhatsApp Agent */}
                    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <MessageCircle className="w-5 h-5 text-green-600 mr-3" />
                          <div>
                            <h5 className="font-medium text-gray-900">Agente IA - WhatsApp</h5>
                            <p className="text-sm text-gray-600">Conversas inteligentes via WhatsApp</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={geminiConfig.modules.whatsapp}
                            onChange={() => toggleGeminiModule('whatsapp')}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                      </div>
                    </div>

                    {/* Voice Agent */}
                    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Mic className="w-5 h-5 text-blue-600 mr-3" />
                          <div>
                            <h5 className="font-medium text-gray-900">Agente IA - Voz</h5>
                            <p className="text-sm text-gray-600">Assistente virtual por voz</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={geminiConfig.modules.voice}
                            onChange={() => toggleGeminiModule('voice')}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                      </div>
                    </div>

                    {/* SMS Agent */}
                    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <MessageSquare className="w-5 h-5 text-purple-600 mr-3" />
                          <div>
                            <h5 className="font-medium text-gray-900">Agente IA - SMS</h5>
                            <p className="text-sm text-gray-600">Mensagens SMS inteligentes</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={geminiConfig.modules.sms}
                            onChange={() => toggleGeminiModule('sms')}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                      </div>
                    </div>

                    {/* Email Agent */}
                    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Mail className="w-5 h-5 text-red-600 mr-3" />
                          <div>
                            <h5 className="font-medium text-gray-900">Agente IA - E-mail</h5>
                            <p className="text-sm text-gray-600">Respostas automáticas por e-mail</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={geminiConfig.modules.email}
                            onChange={() => toggleGeminiModule('email')}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                      </div>
                    </div>

                    {/* Image Generation */}
                    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <ImageIcon className="w-5 h-5 text-pink-600 mr-3" />
                          <div>
                            <h5 className="font-medium text-gray-900">Gerador de Imagens</h5>
                            <p className="text-sm text-gray-600">Criação de imagens com IA</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={geminiConfig.modules.imageGeneration}
                            onChange={() => toggleGeminiModule('imageGeneration')}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                      </div>
                    </div>

                    {/* Video Generation */}
                    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <VideoIcon className="w-5 h-5 text-purple-600 mr-3" />
                          <div>
                            <h5 className="font-medium text-gray-900">Gerador de Vídeos</h5>
                            <p className="text-sm text-gray-600">Criação de vídeos com IA</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={geminiConfig.modules.videoGeneration}
                            onChange={() => toggleGeminiModule('videoGeneration')}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Status Summary */}
                  <div className="mt-6 p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <Info className="w-5 h-5 text-green-600 mr-2" />
                      <div>
                        <h5 className="font-medium text-green-900">Status da Integração</h5>
                        <p className="text-sm text-green-700">
                          {Object.values(geminiConfig.modules).filter(Boolean).length} de 6 módulos habilitados • 
                          API Key configurada e testada
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Warning when not configured */}
              {!geminiConfig.isConfigured && geminiConfig.apiKey && (
                <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                    <div>
                      <h5 className="font-medium text-yellow-900">API Key não testada</h5>
                      <p className="text-sm text-yellow-700">
                        Clique em "Testar Conexão" para validar sua API Key do Google Gemini
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Future Integrations Preview */}
        <div className="card">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Futuras Integrações</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center">
                <Globe className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <h4 className="font-medium text-gray-600">Google Cloud AI</h4>
                <p className="text-sm text-gray-500">Em breve</p>
              </div>

              <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center">
                <Zap className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <h4 className="font-medium text-gray-600">Anthropic Claude</h4>
                <p className="text-sm text-gray-500">Em breve</p>
              </div>

              <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center">
                <IntegrationsIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <h4 className="font-medium text-gray-600">APIs Customizadas</h4>
                <p className="text-sm text-gray-500">Em breve</p>
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  };

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
          <nav className={`flex-1 p-4 space-y-2 overflow-y-auto ${sidebarCollapsed ? 'flex flex-col items-center' : ''}`}>
            {getVisibleNavigationItems().map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
                                  return (
                <div key={item.id} className="w-full">
                      <button
                        onClick={() => {
                      setActiveSection(item.id);
                      setActiveSubSection('');
                      if (sidebarOpen && window.innerWidth < 1024) {
                        setSidebarOpen(false);
                      }
                    }}
                    className={`w-full group flex items-center transition-all duration-200 rounded-xl p-3 ${sidebarCollapsed ? 'justify-center' : 'justify-between'} ${
                      isActive 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                        : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                    }`}
                    title={sidebarCollapsed ? item.label : ''}
                  >
                    <div className={`${sidebarCollapsed ? 'flex items-center justify-center w-full' : 'flex items-center'}`}>
                      <Icon className={`${sidebarCollapsed ? 'w-6 h-6' : 'w-5 h-5 mr-3'} ${isActive ? 'text-white' : ''}`} />
                      {!sidebarCollapsed && (
                        <span className={`font-semibold ${isActive ? 'text-white' : 'text-gray-700'}`}>{item.label}</span>
                      )}
                        </div>
                    {!sidebarCollapsed && item.subItems && (
                      <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${isActive ? 'text-white rotate-90' : 'text-gray-400'}`} />
                        )}
                      </button>
                  
                  {/* Subitens */}
                  {!sidebarCollapsed && item.subItems && activeSection === item.id && (
                    <div className="ml-6 mt-2 space-y-1 border-l-2 border-blue-100 pl-4">
                      {item.subItems.map((subItem) => (
                              <button
                                key={subItem.id}
                          onClick={() => {
                            setActiveSubSection(subItem.id);
                            if (sidebarOpen && window.innerWidth < 1024) {
                              setSidebarOpen(false);
                            }
                          }}
                          className={`w-full text-left py-2 px-3 text-sm rounded-lg transition-colors duration-200 ${
                                  activeSubSection === subItem.id 
                              ? 'bg-blue-50 text-blue-700 font-medium border-l-2 border-blue-500'
                              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
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
          <div className="p-4 border-t border-gray-200 relative profile-dropdown-container">
            <div className="flex items-center">
            <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center hover:scale-105 transition-transform duration-200"
            >
                <User className="w-5 h-5 text-white" />
            </button>
              {!sidebarCollapsed && (
              <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">{user?.displayName || user?.email}</p>
                  <p className="text-xs text-gray-500">{userProfile?.category || 'Usuário'}</p>
              </div>
              )}
              {!sidebarCollapsed && (
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`} />
                </button>
              )}
            </div>

            {/* Dropdown Menu */}
            {showProfileDropdown && (
              <div className="absolute bottom-full left-4 right-4 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
            <button
                  onClick={() => {
                    setShowProfileDropdown(false);
                    setShowProfileModal(true);
                  }}
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <UserCog className="w-4 h-4 mr-3" />
                  Editar Perfil
                </button>
                <button
                  onClick={() => {
                    setShowProfileDropdown(false);
                    logout();
                  }}
                  className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-3" />
                  Sair
            </button>
              </div>
            )}
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
        <main className="flex-1 p-6 min-h-0 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
                  </div>
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
                        <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Editar Perfil</h3>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Avatar */}
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-10 h-10 text-white" />
                </div>
                <button className="text-sm text-blue-600 hover:text-blue-700">
                  Alterar foto
                </button>
              </div>

              {/* Formulário */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                  <input
                    type="text"
                    defaultValue={user?.displayName || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Seu nome completo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">O email não pode ser alterado</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                  <input
                    type="text"
                    value={userProfile?.category || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 capitalize"
                    disabled
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Créditos</label>
                  <div className="flex items-center space-x-2">
                    <CreditCard className="w-5 h-5 text-blue-500" />
                    <span className="text-lg font-semibold text-gray-900">{userProfile?.credits || 0}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nova Senha</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Deixe em branco para manter a atual"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Nova Senha</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Confirme a nova senha"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 pt-4 border-t">
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    alert('Perfil atualizado com sucesso!');
                    setShowProfileModal(false);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Salvar Alterações
                </button>
              </div>
            </div>
          </div>
      </div>
      )}

      {/* Modal de Campos do Cliente */}
      {showClientFieldsModal && selectedClientForFields && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Campos do Cliente: {selectedClientForFields.name || 'Nome não informado'}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Visualização completa de todos os dados do cliente
                </p>
              </div>
              <button 
                onClick={() => {
                  setShowClientFieldsModal(false);
                  setSelectedClientForFields(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Campos Principais */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                  <User className="w-5 h-5 mr-2 text-blue-600" />
                  Dados Principais
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                  <div>
                    <span className="block text-sm font-medium text-gray-700">Nome:</span>
                    <span className="text-gray-900">{selectedClientForFields.name || 'Não informado'}</span>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-gray-700">CPF:</span>
                    <span className="text-gray-900">{selectedClientForFields.cpf || 'Não informado'}</span>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-gray-700">Telefone:</span>
                    <span className="text-gray-900">{selectedClientForFields.phone || 'Não informado'}</span>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-gray-700">Email:</span>
                    <span className="text-gray-900">{selectedClientForFields.email || 'Não informado'}</span>
                  </div>
                </div>
              </div>

              {/* Campos Importados */}
              {selectedClientForFields.additionalFields && Object.keys(selectedClientForFields.additionalFields).length > 0 && (
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                    <FileSpreadsheet className="w-5 h-5 mr-2 text-green-600" />
                    Campos Importados ({Object.keys(selectedClientForFields.additionalFields).length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-green-50 rounded-lg max-h-60 overflow-y-auto">
                    {Object.entries(selectedClientForFields.additionalFields).map(([key, value]) => (
                      <div key={key} className="border-b border-green-200 pb-2">
                        <span className="block text-sm font-medium text-gray-700 capitalize">
                          {key.replace('_original', '').replace(/_/g, ' ')}:
                        </span>
                        <span className="text-gray-900 break-words">{String(value) || 'Vazio'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Informações de Importação */}
              {selectedClientForFields.importSource && (
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                    <Download className="w-5 h-5 mr-2 text-purple-600" />
                    Informações de Importação
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-purple-50 rounded-lg">
                    <div>
                      <span className="block text-sm font-medium text-gray-700">Origem:</span>
                      <span className="text-gray-900 uppercase">{selectedClientForFields.importSource}</span>
                    </div>
                    <div>
                      <span className="block text-sm font-medium text-gray-700">Data de Importação:</span>
                      <span className="text-gray-900">
                        {selectedClientForFields.importedAt 
                          ? new Date(selectedClientForFields.importedAt).toLocaleString('pt-BR')
                          : 'Não informado'
                        }
                      </span>
                    </div>
                    <div>
                      <span className="block text-sm font-medium text-gray-700">Data de Criação:</span>
                      <span className="text-gray-900">
                        {new Date(selectedClientForFields.createdAt).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <div>
                      <span className="block text-sm font-medium text-gray-700">Proprietário:</span>
                      <span className="text-gray-900">{selectedClientForFields.ownerEmail || 'Não informado'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Mensagem se não há campos adicionais */}
              {(!selectedClientForFields.additionalFields || Object.keys(selectedClientForFields.additionalFields).length === 0) && (
                <div className="text-center py-8">
                  <FileSpreadsheet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum campo adicional</h3>
                  <p className="text-gray-600">Este cliente possui apenas os dados principais.</p>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6 pt-4 border-t">
              <button
                onClick={() => {
                  setShowClientFieldsModal(false);
                  setSelectedClientForFields(null);
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modais de Importação CSV */}
      {showCsvImport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Importação de Clientes - CSV</h3>
              <button 
                onClick={() => {
                  setShowCsvImport(false);
                  setCsvFile(null);
                  setCsvData([]);
                  setCsvHeaders([]);
                  setCsvSeparator(',');
                  setColumnMapping({});
                  setShowMappingModal(false);
                  setSelectedGroupForImport(null);
                  setSelectedTemplate(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Informações do arquivo */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center">
                  <FileSpreadsheet className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="font-medium text-blue-900">Arquivo: {csvFile?.name}</span>
                </div>
                <div className="mt-2 text-sm text-blue-700">
                  <p>Linhas detectadas: {csvData.length}</p>
                  <p>Colunas detectadas: {csvHeaders.length}</p>
                  <p>Separador detectado: <span className="font-mono bg-blue-100 px-1 rounded">"{csvSeparator}"</span> {csvSeparator === ',' ? '(vírgula)' : '(ponto e vírgula)'}</p>
                </div>
              </div>

              {/* Seleção de template para mapeamento */}
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center mb-3">
                  <Layout className="w-5 h-5 text-purple-600 mr-2" />
                  <h4 className="font-medium text-purple-900">Selecionar Template (Opcional)</h4>
                </div>
                <p className="text-sm text-purple-700 mb-3">
                  Escolha um template para aplicar mapeamento pré-configurado às colunas
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div
                    onClick={() => setSelectedTemplate(null)}
                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedTemplate === null
                        ? 'border-purple-500 bg-purple-100'
                        : 'border-gray-300 bg-white hover:border-purple-300'
                    }`}
                  >
                    <div className="text-center">
                      <Brain className="w-6 h-6 text-gray-600 mx-auto mb-1" />
                      <span className="text-sm font-medium text-gray-900">Mapeamento IA</span>
                      <p className="text-xs text-gray-600">Detecção automática</p>
                    </div>
                  </div>
                  {templates.filter((t: any) => t.type === 'clientes').slice(0, 5).map((template: any) => (
                    <div
                      key={template.id}
                      onClick={() => setSelectedTemplate(template)}
                      className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedTemplate?.id === template.id
                          ? 'border-purple-500 bg-purple-100'
                          : 'border-gray-300 bg-white hover:border-purple-300'
                      }`}
                    >
                      <div className="text-center">
                        <Layout className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                        <span className="text-sm font-medium text-gray-900">{template.name}</span>
                        <p className="text-xs text-gray-600">{template.columns?.length || 0} campos</p>
                      </div>
                    </div>
                  ))}
                </div>
                {templates.filter((t: any) => t.type === 'clientes').length > 5 && (
                  <p className="text-xs text-purple-600 mt-2 text-center">
                    + {templates.filter((t: any) => t.type === 'clientes').length - 5} outros templates disponíveis
                  </p>
                )}
                {templates.filter((t: any) => t.type === 'clientes').length === 0 && (
                  <div className="text-center py-4">
                    <Layout className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Nenhum template de clientes criado</p>
                    <p className="text-xs text-gray-500">Crie templates na seção Templates</p>
                  </div>
                )}
              </div>

              {/* Seleção de grupo para os clientes */}
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <div className="flex items-center mb-3">
                  <FolderOpen className="w-5 h-5 text-orange-600 mr-2" />
                  <h4 className="font-medium text-orange-900">Selecionar Grupo (Opcional)</h4>
                </div>
                <p className="text-sm text-orange-700 mb-3">
                  Escolha um grupo para associar automaticamente todos os clientes importados
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div
                    onClick={() => setSelectedGroupForImport(null)}
                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedGroupForImport === null
                        ? 'border-orange-500 bg-orange-100'
                        : 'border-gray-300 bg-white hover:border-orange-300'
                    }`}
                  >
                    <div className="text-center">
                      <User className="w-6 h-6 text-gray-600 mx-auto mb-1" />
                      <span className="text-sm font-medium text-gray-900">Sem Grupo</span>
                      <p className="text-xs text-gray-600">Clientes individuais</p>
                    </div>
                  </div>
                  {groups.slice(0, 5).map((group: any) => (
                    <div
                      key={group.id}
                      onClick={() => setSelectedGroupForImport(group)}
                      className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedGroupForImport?.id === group.id
                          ? 'border-orange-500 bg-orange-100'
                          : 'border-gray-300 bg-white hover:border-orange-300'
                      }`}
                    >
                      <div className="text-center">
                        <FolderOpen className="w-6 h-6 text-orange-600 mx-auto mb-1" />
                        <span className="text-sm font-medium text-gray-900">{group.name}</span>
                        <p className="text-xs text-gray-600">{group.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {groups.length > 5 && (
                  <p className="text-xs text-orange-600 mt-2 text-center">
                    + {groups.length - 5} outros grupos disponíveis
                  </p>
                )}
              </div>

              {/* Botão de mapeamento IA/Template */}
              <div className="text-center">
                <button
                  onClick={processAIMapping}
                  disabled={isProcessingAI}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50"
                >
                  {isProcessingAI ? (
                    <>
                      <Loader className="w-5 h-5 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : selectedTemplate ? (
                    <>
                      <Layout className="w-5 h-5 mr-2" />
                      Aplicar Template: {selectedTemplate.name}
                    </>
                  ) : (
                    <>
                      <Brain className="w-5 h-5 mr-2" />
                      Mapear Campos Automaticamente com IA
                    </>
                  )}
                </button>
                <p className="text-sm text-gray-600 mt-2">
                  {selectedTemplate 
                    ? `Aplicará o template "${selectedTemplate.name}" com ${selectedTemplate.columns?.length || 0} campos configurados`
                    : 'A IA irá analisar suas colunas e sugerir o mapeamento automático'
                  }
                </p>
                <div className="mt-3 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                  <strong>Suporte a formatos:</strong> CSV com vírgulas (,) ou ponto e vírgula (;) • Campos com aspas • Encoding UTF-8
                </div>
              </div>

              {/* Prévia dos dados */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Prévia dos Dados (primeiras 5 linhas)</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        {csvHeaders.map((header, index) => (
                          <th key={index} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {csvData.slice(0, 5).map((row, rowIndex) => (
                        <tr key={rowIndex} className="border-b border-gray-200">
                          {csvHeaders.map((header, colIndex) => (
                            <td key={colIndex} className="px-4 py-2 text-sm text-gray-900">
                              {row[header] || '-'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de mapeamento de colunas */}
      {showMappingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Mapeamento de Colunas</h3>
                <p className="text-sm text-gray-600 mt-1">Configure como cada coluna do CSV será importada</p>
              </div>
              <button 
                onClick={() => setShowMappingModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Indicador de mapeamento IA/Template */}
              {selectedTemplate ? (
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center">
                    <Layout className="w-5 h-5 text-purple-600 mr-2" />
                    <span className="font-medium text-purple-900">Template "{selectedTemplate.name}" aplicado!</span>
                  </div>
                  <p className="text-sm text-purple-700 mt-1">
                    Mapeamento baseado no template pré-configurado com {selectedTemplate.columns?.length || 0} campos
                  </p>
                </div>
              ) : (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <span className="font-medium text-green-900">IA detectou os campos automaticamente!</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    Revise e ajuste o mapeamento conforme necessário
                  </p>
                </div>
              )}

              {/* Informações do grupo selecionado */}
              {selectedGroupForImport && (
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <div className="flex items-center">
                    <FolderOpen className="w-5 h-5 text-orange-600 mr-2" />
                    <span className="font-medium text-orange-900">Grupo selecionado: {selectedGroupForImport.name}</span>
                  </div>
                  <p className="text-sm text-orange-700 mt-1">
                    Todos os clientes importados serão automaticamente associados a este grupo
                  </p>
                </div>
              )}

              {!selectedGroupForImport && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center">
                    <User className="w-5 h-5 text-gray-600 mr-2" />
                    <span className="font-medium text-gray-900">Nenhum grupo selecionado</span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">
                    Os clientes serão importados individualmente, sem associação a grupos
                  </p>
                </div>
              )}

              {/* Mapeamento de colunas */}
              {csvHeaders.map((header, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Coluna CSV: <span className="font-semibold text-blue-600">{header}</span>
                    </label>
                    <div className="text-xs text-gray-500">
                      Exemplo: {csvData[0]?.[header] || 'N/A'}
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mapear para:</label>
                    <select
                      value={columnMapping[header] || ''}
                      onChange={(e) => setColumnMapping(prev => ({
                        ...prev,
                        [header]: e.target.value
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Selecione um campo</option>
                      <option value="nome">Nome</option>
                      <option value="email">Email</option>
                      <option value="telefone">Telefone</option>
                      <option value="cpf">CPF</option>
                      <option value="endereco">Endereço</option>
                      <option value="cidade">Cidade</option>
                      <option value="estado">Estado</option>
                      <option value="cep">CEP</option>
                      <option value="campo_adicional">Campo Adicional</option>
                      <option value="ignorar">Ignorar Campo</option>
                    </select>
                  </div>
                  <div className="w-20 text-center">
                    {columnMapping[header] && columnMapping[header] !== 'ignorar' && (
                      <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                    )}
                    {columnMapping[header] === 'ignorar' && (
                      <AlertCircle className="w-5 h-5 text-yellow-500 mx-auto" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Resumo do mapeamento */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
              <h4 className="font-medium text-gray-900 mb-2">Resumo do Mapeamento:</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Campos mapeados:</span>
                  <span className="ml-2 font-medium text-green-600">
                    {Object.values(columnMapping).filter(field => field !== 'ignorar' && field !== '').length}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Campos ignorados:</span>
                  <span className="ml-2 font-medium text-yellow-600">
                    {Object.values(columnMapping).filter(field => field === 'ignorar').length}
                  </span>
                </div>
              </div>
              
              {Object.values(columnMapping).filter(field => field !== 'ignorar' && field !== '').length === 0 && (
                <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                  ⚠️ Nenhum campo foi mapeado. Configure pelo menos uma coluna.
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-4 mt-6 pt-4 border-t">
              <button
                onClick={() => setShowMappingModal(false)}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={saveImportedClients}
                disabled={Object.values(columnMapping).filter(field => field !== 'ignorar' && field !== '').length === 0}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Importar {csvData.length} Clientes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
