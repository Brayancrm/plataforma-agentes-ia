// Tipos de usuário e autenticação
export interface User {
  id: string;
  name: string;
  cpf: string;
  email: string;
  phone: string;
  category: UserCategory;
  password?: string;
  companyId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type UserCategory = 'proprietario' | 'empresa' | 'usuario';

// Tipos de empresa
export interface Company {
  id: string;
  name: string;
  cnpj: string;
  email: string;
  phone: string;
  credits: number;
  plan: Plan;
  createdAt: Date;
  updatedAt: Date;
}

export interface Plan {
  id: string;
  name: string;
  value: number;
  credits: number;
  features: string[];
}

// Tipos de cliente
export interface Client {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  email?: string;
  group?: string;
  observations?: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos de grupo
export interface Group {
  id: string;
  name: string;
  description?: string;
  companyId: string;
  clientIds: string[];
  aiTemplate?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos de campanha
export interface Campaign {
  id: string;
  name: string;
  description?: string;
  companyId: string;
  targetType: 'clients' | 'group';
  targetIds: string[];
  aiAgentId: string;
  status: CampaignStatus;
  scheduledAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type CampaignStatus = 'draft' | 'scheduled' | 'running' | 'completed' | 'cancelled';

// Tipos de agente de IA
export interface AIAgent {
  id: string;
  name: string;
  type: AgentType;
  companyId: string;
  prompt: string;
  functions: AgentFunction[];
  inbound: boolean;
  outbound: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type AgentType = 'whatsapp' | 'voice' | 'sms' | 'email';

export interface AgentFunction {
  id: string;
  name: string;
  description: string;
  parameters: Record<string, any>;
}

// Tipos de publicidade
export interface Advertisement {
  id: string;
  name: string;
  type: 'image' | 'video';
  prompt: string;
  companyId: string;
  fileUrl?: string;
  status: 'generating' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

// Tipos de documento
export interface Document {
  id: string;
  name: string;
  type: 'template' | 'signed';
  content: string;
  companyId: string;
  templateId?: string;
  signedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos de inventário
export interface InventoryItem {
  id: string;
  name: string;
  type: 'product' | 'service';
  description?: string;
  value: number;
  quantity: number;
  category: string;
  validity?: Date;
  photos: string[];
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos de pagamento
export interface Payment {
  id: string;
  description: string;
  value: number;
  dueDate: Date;
  status: 'pending' | 'paid' | 'overdue';
  companyId: string;
  invoiceId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  number: string;
  value: number;
  status: 'draft' | 'sent' | 'paid';
  companyId: string;
  clientId?: string;
  sentAt?: Date;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos de integração
export interface Integration {
  id: string;
  name: string;
  type: 'crm' | 'erp' | 'other';
  config: Record<string, any>;
  companyId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos de recarga
export interface Recharge {
  id: string;
  companyId: string;
  planId: string;
  value: number;
  credits: number;
  status: 'pending' | 'completed' | 'failed';
  paymentMethod: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos de importação CSV
export interface CSVImport {
  id: string;
  companyId: string;
  fileName: string;
  totalRows: number;
  processedRows: number;
  successRows: number;
  errorRows: number;
  status: 'processing' | 'completed' | 'failed';
  errors: CSVError[];
  startedAt: Date;
  completedAt?: Date;
  createdAt: Date;
}

export interface CSVError {
  row: number;
  field: string;
  message: string;
  value?: string;
}

// Tipos de resposta da API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
