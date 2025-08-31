// Configurações e constantes do Firebase
export const FIREBASE_CONFIG = {
  // Coleções do Firestore
  COLLECTIONS: {
    USERS: 'usuarios',
    COMPANIES: 'empresas',
    CLIENTS: 'clientes',
    CLIENT_GROUPS: 'grupos_clientes',
    CAMPAIGNS: 'campanhas',
    PLANS: 'planos',
    PAYMENTS: 'pagamentos',
    INVOICES: 'notas_fiscais',
    INTEGRATIONS: 'integracoes',
    DOCUMENTS: 'documentos',
    PRODUCTS: 'produtos',
    SERVICES: 'servicos',
    IMAGES: 'imagens',
    VIDEOS: 'videos',
    AGENTS: 'agentes_ia'
  },

  // Caminhos do Storage
  STORAGE_PATHS: {
    USER_AVATARS: 'usuarios/{userId}/avatars',
    COMPANY_LOGOS: 'empresas/{companyId}/logos',
    CLIENT_PHOTOS: 'clientes/{clientId}/fotos',
    PRODUCT_IMAGES: 'produtos/{productId}/imagens',
    SERVICE_IMAGES: 'servicos/{serviceId}/imagens',
    DOCUMENT_FILES: 'documentos/{documentId}/arquivos',
    CAMPAIGN_MEDIA: 'campanhas/{campaignId}/midia'
  },

  // Tipos de usuário
  USER_CATEGORIES: {
    OWNER: 'proprietario',
    ADMIN: 'admin',
    COMPANY: 'empresa',
    USER: 'usuario'
  } as const,

  // Seções visíveis do sistema
  SYSTEM_SECTIONS: [
    'overview',
    'usuarios',
    'empresas',
    'planos',
    'clientes',
    'grupos',
    'campanhas',
    'publicidade',
    'agentes',
    'documentos',
    'produtos',
    'servicos',
    'pagamentos',
    'integracoes'
  ] as const,

  // Status de pagamento
  PAYMENT_STATUS: {
    PENDING: 'pendente',
    APPROVED: 'aprovado',
    REJECTED: 'rejeitado',
    CANCELLED: 'cancelado'
  } as const,

  // Status de nota fiscal
  INVOICE_STATUS: {
    DRAFT: 'rascunho',
    SENT: 'enviada',
    PAID: 'paga',
    OVERDUE: 'vencida'
  } as const,

  // Tipos de integração
  INTEGRATION_TYPES: {
    API: 'api',
    WEBHOOK: 'webhook',
    OAUTH: 'oauth',
    CUSTOM: 'custom'
  } as const,

  // Tipos de agente IA
  AGENT_TYPES: {
    WHATSAPP: 'whatsapp',
    VOICE: 'voz',
    SMS: 'sms',
    EMAIL: 'email'
  } as const,

  // Configurações padrão
  DEFAULTS: {
    USER_CREDITS: 10,
    PAGINATION_LIMIT: 20,
    UPLOAD_MAX_SIZE: 10 * 1024 * 1024, // 10MB
    SUPPORTED_IMAGE_FORMATS: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    SUPPORTED_VIDEO_FORMATS: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv'],
    SUPPORTED_DOCUMENT_FORMATS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  }
};

// Tipos TypeScript baseados nas configurações
export type UserCategory = typeof FIREBASE_CONFIG.USER_CATEGORIES[keyof typeof FIREBASE_CONFIG.USER_CATEGORIES];
export type SystemSection = typeof FIREBASE_CONFIG.SYSTEM_SECTIONS[number];
export type PaymentStatus = typeof FIREBASE_CONFIG.PAYMENT_STATUS[keyof typeof FIREBASE_CONFIG.PAYMENT_STATUS];
export type InvoiceStatus = typeof FIREBASE_CONFIG.INVOICE_STATUS[keyof typeof FIREBASE_CONFIG.INVOICE_STATUS];
export type IntegrationType = typeof FIREBASE_CONFIG.INTEGRATION_TYPES[keyof typeof FIREBASE_CONFIG.INTEGRATION_TYPES];
export type AgentType = typeof FIREBASE_CONFIG.AGENT_TYPES[keyof typeof FIREBASE_CONFIG.AGENT_TYPES];

// Interfaces base para as entidades
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User extends BaseEntity {
  name: string;
  email: string;
  category: UserCategory;
  credits: number;
  visibleSections: SystemSection[];
  phone?: string;
  cpf?: string;
  cnpj?: string;
}

export interface Company extends BaseEntity {
  name: string;
  cnpj: string;
  email: string;
  phone: string;
  logo?: string;
  address?: string;
  credits: number;
}

export interface Client extends BaseEntity {
  name: string;
  cpf: string;
  phone: string;
  email?: string;
  additionalFields: Record<string, any>;
  groupId?: string;
  companyId: string;
}

export interface ClientGroup extends BaseEntity {
  name: string;
  description?: string;
  template?: string;
  clientIds: string[];
  companyId: string;
}

export interface Campaign extends BaseEntity {
  name: string;
  description?: string;
  targetType: 'clients' | 'groups';
  targetIds: string[];
  agentId: string;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  companyId: string;
}

export interface Plan extends BaseEntity {
  name: string;
  description?: string;
  price: number;
  credits: number;
  features: string[];
  isActive: boolean;
}

export interface Payment extends BaseEntity {
  amount: number;
  description: string;
  companyId: string;
  status: PaymentStatus;
  dueDate: Date;
  paidDate?: Date;
}

export interface Invoice extends BaseEntity {
  number: string;
  amount: number;
  description: string;
  companyId: string;
  status: InvoiceStatus;
  dueDate: Date;
  items: InvoiceItem[];
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Integration extends BaseEntity {
  name: string;
  type: IntegrationType;
  description?: string;
  apiKey?: string;
  apiSecret?: string;
  endpoint?: string;
  permissions: string[];
  configuration: Record<string, any>;
  isActive: boolean;
  companyId: string;
}

export interface DocumentTemplate extends BaseEntity {
  name: string;
  type: string;
  content: string;
  variables: string[];
  companyId: string;
}

export interface Product extends BaseEntity {
  name: string;
  type: string;
  description?: string;
  price: number;
  quantity: number;
  category: string;
  validity?: Date;
  image?: string;
  companyId: string;
}

export interface Service extends BaseEntity {
  name: string;
  type: string;
  description?: string;
  price: number;
  category: string;
  validity?: Date;
  image?: string;
  companyId: string;
}

export interface Agent extends BaseEntity {
  name: string;
  type: AgentType;
  description?: string;
  inbound: boolean;
  outbound: boolean;
  aiConfig: Record<string, any>;
  prompt: string;
  functions: string[];
  isActive: boolean;
  companyId: string;
}

export interface GeneratedImage extends BaseEntity {
  prompt: string;
  imageUrl: string;
  aiModel: string;
  settings: Record<string, any>;
  companyId: string;
}

export interface GeneratedVideo extends BaseEntity {
  prompt: string;
  videoUrl: string;
  aiModel: string;
  settings: Record<string, any>;
  companyId: string;
}

