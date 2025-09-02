// WhatsApp Service usando Twilio (compatível com Vercel)
// Interface para WhatsApp Business API via Twilio

export interface WhatsAppConnection {
  id: string;
  agentId: string;
  agentName: string;
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  lastSeen?: string;
  error?: string;
  createdAt: string;
  message?: string;
  instructions?: string[];
  provider: 'twilio';
  fromNumber?: string;
}

export interface WhatsAppMessage {
  id: string;
  to: string;
  message: string;
  agentId: string;
  agentName: string;
  timestamp: string;
  status: 'sending' | 'sent' | 'delivered' | 'failed';
  error?: string;
}

class WhatsAppService {
  private connections: Map<string, WhatsAppConnection> = new Map();
  private messages: Map<string, WhatsAppMessage> = new Map();

  // Conectar agente ao WhatsApp via Twilio
  async connectAgent(agentId: string, agentName: string, agentPrompt?: string): Promise<WhatsAppConnection> {
    try {
      console.log('🔗 Conectando agente WhatsApp via Twilio:', agentId);

      // Verificar se já existe uma conexão
      const existingConnection = this.connections.get(agentId);
      if (existingConnection && existingConnection.status === 'connected') {
        return existingConnection;
      }

      // Testar conexão com Twilio
      const testResponse = await fetch('/api/twilio-whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'test_connection'
        })
      });

      if (!testResponse.ok) {
        throw new Error('Falha ao conectar com Twilio. Verifique as configurações.');
      }

      const testData = await testResponse.json();
      
      if (!testData.success) {
        throw new Error(testData.error || 'Erro na configuração do Twilio');
      }

      // Criar conexão
      const connection: WhatsAppConnection = {
        id: `twilio_${agentId}_${Date.now()}`,
        agentId,
        agentName,
        status: 'connected',
        createdAt: new Date().toISOString(),
        message: 'Conectado via Twilio WhatsApp Business API',
        provider: 'twilio',
        fromNumber: testData.config?.fromNumber,
        instructions: [
          '✅ Conectado via Twilio WhatsApp Business API',
          '📱 Envie mensagens para números no formato: +5511999999999',
          '🤖 O agente responderá automaticamente baseado no prompt configurado',
          '💬 Use o painel para enviar mensagens de teste'
        ]
      };

      this.connections.set(agentId, connection);
      console.log('✅ Agente conectado via Twilio:', connection);
      
      return connection;

    } catch (error) {
      console.error('❌ Erro ao conectar agente:', error);
      
      const errorConnection: WhatsAppConnection = {
        id: `error_${agentId}_${Date.now()}`,
        agentId,
        agentName,
        status: 'error',
        createdAt: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        provider: 'twilio',
        message: 'Falha na conexão com Twilio'
      };

      this.connections.set(agentId, errorConnection);
      throw error;
    }
  }

  // Desconectar agente
  async disconnectAgent(agentId: string): Promise<void> {
    console.log('🔌 Desconectando agente:', agentId);
    this.connections.delete(agentId);
  }

  // Enviar mensagem via Twilio
  async sendMessage(agentId: string, to: string, message: string): Promise<WhatsAppMessage> {
    try {
      console.log('📤 Enviando mensagem via Twilio:', { agentId, to, message: message.substring(0, 50) + '...' });

      const connection = this.connections.get(agentId);
      if (!connection || connection.status !== 'connected') {
        throw new Error('Agente não está conectado');
      }

      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Criar mensagem com status inicial
      const whatsappMessage: WhatsAppMessage = {
        id: messageId,
        to,
        message,
        agentId,
        agentName: connection.agentName,
        timestamp: new Date().toISOString(),
        status: 'sending'
      };

      this.messages.set(messageId, whatsappMessage);

      // Enviar via API Twilio
      const response = await fetch('/api/twilio-whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'send_message',
          to,
          message
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        whatsappMessage.status = 'failed';
        whatsappMessage.error = data.error || 'Erro ao enviar mensagem';
        throw new Error(data.error || 'Falha ao enviar mensagem');
      }

      // Atualizar status da mensagem
      whatsappMessage.status = 'sent';
      console.log('✅ Mensagem enviada via Twilio:', data.messageId);

      return whatsappMessage;

    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      throw error;
    }
  }

  // Obter status da conexão
  async getConnectionStatus(agentId: string): Promise<WhatsAppConnection | null> {
    const connection = this.connections.get(agentId);
    
    if (!connection) {
      return null;
    }

    // Se estiver conectado, verificar status atual
    if (connection.status === 'connected') {
      try {
        const response = await fetch('/api/twilio-whatsapp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'get_status'
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            connection.lastSeen = new Date().toISOString();
            return connection;
          }
        }
      } catch (error) {
        console.error('❌ Erro ao verificar status:', error);
      }
    }

    return connection;
  }

  // Obter todas as conexões
  getAllConnections(): WhatsAppConnection[] {
    return Array.from(this.connections.values());
  }

  // Obter mensagens de um agente
  getAgentMessages(agentId: string): WhatsAppMessage[] {
    return Array.from(this.messages.values())
      .filter(msg => msg.agentId === agentId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // Limpar mensagens antigas
  clearOldMessages(hours: number = 24): void {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    for (const [id, message] of this.messages.entries()) {
      if (new Date(message.timestamp) < cutoff) {
        this.messages.delete(id);
      }
    }
  }
}

// Exportar instância única
const whatsappService = new WhatsAppService();
export default whatsappService;
