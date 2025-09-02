// Serviço para gerenciar conexões WhatsApp com agentes IA
// Integra com as APIs do backend para conectar dispositivos

interface WhatsAppConnection {
  id: string;
  agentId: string;
  agentName: string;
  status: 'disconnected' | 'connecting' | 'connected' | 'error' | 'waiting_qr';
  qrCode?: string;
  lastSeen?: string;
  error?: string;
  createdAt: string;
  message?: string;
  instructions?: string[];
  sessionId?: string;
}

interface WhatsAppAgent {
  id: string;
  name: string;
  prompt: string;
  autoReply: boolean;
  typingIndicator: boolean;
  readReceipts: boolean;
  connection?: WhatsAppConnection;
}

interface SendMessageData {
  agentId: string;
  to: string;
  message: string;
}

class WhatsAppService {
  private baseUrl: string;

  constructor() {
    // Sempre usar a URL da Vercel para as APIs
    this.baseUrl = 'https://plataforma-agentes-ia.vercel.app';
  }

  /**
   * Conecta um agente ao WhatsApp gerando QR Code
   */
  async connectAgent(agent: Omit<WhatsAppAgent, 'connection'>): Promise<WhatsAppConnection> {
    try {
      console.log('🔗 Tentando conectar agente:', agent.id);
      console.log('📡 URL da API:', `${this.baseUrl}/api/whatsapp-connect`);

      const response = await fetch(`${this.baseUrl}/api/whatsapp-connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'connect',
          agentId: agent.id,
          agentName: agent.name,
          agentPrompt: agent.prompt,
          autoReply: agent.autoReply,
          typingIndicator: agent.typingIndicator,
          readReceipts: agent.readReceipts,
        }),
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro HTTP:', response.status, errorText);
        throw new Error(`Erro HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Resposta da API:', data);
      
      if (!data.success) {
        throw new Error(data.error || 'Erro ao conectar agente');
      }

      return data.connection;
    } catch (error) {
      console.error('❌ Erro ao conectar agente WhatsApp:', error);
      
      // Se for erro de rede, mostrar mensagem mais amigável
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Erro de conexão com o servidor. Verifique sua internet.');
      }
      
      throw error;
    }
  }

  /**
   * Desconecta um agente do WhatsApp
   */
  async disconnectAgent(agentId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/whatsapp-connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'disconnect',
          agentId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Erro ao desconectar agente');
      }
    } catch (error) {
      console.error('Erro ao desconectar agente WhatsApp:', error);
      throw error;
    }
  }

  /**
   * Verifica o status de conexão de um agente
   */
  async getConnectionStatus(agentId: string): Promise<WhatsAppConnection> {
    try {
      const response = await fetch(`${this.baseUrl}/api/whatsapp-connect?agentId=${agentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Erro ao verificar status');
      }

      return data.status;
    } catch (error) {
      console.error('Erro ao verificar status da conexão:', error);
      throw error;
    }
  }

  /**
   * Envia mensagem manual através do agente
   */
  async sendMessage(messageData: SendMessageData): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/whatsapp-connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'send',
          ...messageData,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Erro ao enviar mensagem');
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      throw error;
    }
  }

  /**
   * Simula verificação periódica do status (polling)
   */
  startStatusPolling(agentId: string, callback: (status: WhatsAppConnection) => void): () => void {
    const interval = setInterval(async () => {
      try {
        const status = await this.getConnectionStatus(agentId);
        callback(status);
      } catch (error) {
        console.error('Erro no polling de status:', error);
      }
    }, 5000); // Verifica a cada 5 segundos

    // Retorna função para parar o polling
    return () => clearInterval(interval);
  }

  /**
   * Formata número de telefone para o padrão WhatsApp
   */
  formatPhoneNumber(phone: string): string {
    // Remove todos os caracteres não numéricos
    const cleaned = phone.replace(/\D/g, '');
    
    // Se não tem código do país, adiciona +55 (Brasil)
    if (cleaned.length === 11 && cleaned.startsWith('11')) {
      return `55${cleaned}`;
    }
    
    if (cleaned.length === 10 || cleaned.length === 11) {
      return `55${cleaned}`;
    }
    
    return cleaned;
  }

  /**
   * Valida se o número está no formato correto
   */
  isValidPhoneNumber(phone: string): boolean {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 15;
  }
}

const whatsAppService = new WhatsAppService();
export default whatsAppService;
export type { WhatsAppConnection, WhatsAppAgent, SendMessageData };
