import { useState, useEffect, useCallback, useRef } from 'react';
import WhatsAppService, { WhatsAppConnection } from '../services/whatsappService';

interface WhatsAppAgent {
  id: string;
  name: string;
  prompt: string;
  integration: string;
  webhookUrl?: string;
  phoneNumber?: string;
  autoReply: boolean;
  typingIndicator: boolean;
  readReceipts: boolean;
  connection?: WhatsAppConnection;
}

interface UseWhatsAppConnectionProps {
  agentId: string;
  autoConnect?: boolean;
  pollingInterval?: number;
}

interface UseWhatsAppConnectionReturn {
  connection: WhatsAppConnection | null;
  loading: boolean;
  error: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  connect: (agent: Omit<WhatsAppAgent, 'connection'>) => Promise<void>;
  disconnect: () => Promise<void>;
  sendMessage: (to: string, message: string) => Promise<void>;
  refreshStatus: () => Promise<void>;
  clearError: () => void;
}

/**
 * Hook customizado para gerenciar conexões WhatsApp
 * Fornece estado e métodos para conectar/desconectar agentes
 */
export const useWhatsAppConnection = ({
  agentId,
  autoConnect = false,
  pollingInterval = 5000
}: UseWhatsAppConnectionProps): UseWhatsAppConnectionReturn => {
  // Estados
  const [connection, setConnection] = useState<WhatsAppConnection | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs para controle de polling e cleanup
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const stopPollingRef = useRef<(() => void) | null>(null);

  /**
   * Limpa erro
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Para o polling de status
   */
  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    if (stopPollingRef.current) {
      stopPollingRef.current();
      stopPollingRef.current = null;
    }
  }, []);

  /**
   * Inicia polling de status
   */
  const startPolling = useCallback(() => {
    stopPolling(); // Para qualquer polling anterior

    // Iniciar polling de status (simulado)
    const startPolling = () => {
      const interval = setInterval(async () => {
        try {
          const status = await WhatsAppService.getConnectionStatus(agentId);
          setConnection(prevConnection => {
            if (prevConnection) {
              return { ...prevConnection, status: status.status, lastSeen: status.lastSeen };
            }
            return prevConnection;
          });
        } catch (error) {
          console.error('Erro ao verificar status:', error);
        }
      }, pollingInterval);
      
      return () => clearInterval(interval);
    };
    
    const stopPollingFn = startPolling();

    stopPollingRef.current = stopPollingFn;
  }, [agentId, stopPolling]);

  /**
   * Atualiza status da conexão
   */
  const refreshStatus = useCallback(async () => {
    try {
      const status = await WhatsAppService.getConnectionStatus(agentId);
      setConnection(status);
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      setError(err instanceof Error ? err.message : 'Erro ao verificar status');
    }
  }, [agentId]);

  /**
   * Conecta agente ao WhatsApp
   */
  const connect = useCallback(async (agent: Omit<WhatsAppAgent, 'connection'>) => {
    setLoading(true);
    setError(null);

    try {
      const newConnection = await WhatsAppService.connectAgent(agent);
      setConnection(newConnection);
      
      // Inicia polling se a conexão foi criada com sucesso
      if (newConnection) {
        startPolling();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao conectar agente';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [startPolling]);

  /**
   * Desconecta agente do WhatsApp
   */
  const disconnect = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await WhatsAppService.disconnectAgent(agentId);
      setConnection(null);
      stopPolling();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao desconectar agente';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [agentId, stopPolling]);

  /**
   * Envia mensagem através do agente
   */
  const sendMessage = useCallback(async (to: string, message: string) => {
    if (!connection || connection.status !== 'connected') {
      throw new Error('Agente não está conectado ao WhatsApp');
    }

    setError(null);

    try {
      await WhatsAppService.sendMessage({
        agentId,
        to: WhatsAppService.formatPhoneNumber(to),
        message
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao enviar mensagem';
      setError(errorMessage);
      throw err;
    }
  }, [agentId, connection]);

  /**
   * Verifica status inicial ao montar o hook
   */
  useEffect(() => {
    let mounted = true;

    const initializeConnection = async () => {
      try {
        const status = await WhatsAppService.getConnectionStatus(agentId);
        
        if (mounted) {
          setConnection(status);
          
          // Se está conectado ou conectando, inicia polling
          if (status && (status.status === 'connected' || status.status === 'connecting')) {
            startPolling();
          }
          
          // Auto-conectar se solicitado e não há conexão
          if (autoConnect && (!status || status.status === 'disconnected')) {
            // Implementar lógica de auto-connect se necessário
          }
        }
      } catch (err) {
        if (mounted) {
          console.error('Erro ao verificar status inicial:', err);
          // Não define como erro pois pode ser normal não ter conexão inicial
        }
      }
    };

    initializeConnection();

    return () => {
      mounted = false;
      stopPolling();
    };
  }, [agentId, autoConnect, startPolling, stopPolling]);

  /**
   * Cleanup ao desmontar
   */
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  // Estados derivados
  const isConnected = connection?.status === 'connected';
  const isConnecting = connection?.status === 'connecting';

  return {
    connection,
    loading,
    error,
    isConnected,
    isConnecting,
    connect,
    disconnect,
    sendMessage,
    refreshStatus,
    clearError
  };
};

/**
 * Hook simplificado para múltiplas conexões WhatsApp
 * Útil para gerenciar vários agentes simultaneamente
 */
export const useMultipleWhatsAppConnections = (agentIds: string[]) => {
  const [connections, setConnections] = useState<Record<string, WhatsAppConnection | null>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  /**
   * Atualiza conexão específica
   */
  const updateConnection = useCallback((agentId: string, connection: WhatsAppConnection | null) => {
    setConnections(prev => ({ ...prev, [agentId]: connection }));
  }, []);

  /**
   * Atualiza loading específico
   */
  const updateLoading = useCallback((agentId: string, isLoading: boolean) => {
    setLoading(prev => ({ ...prev, [agentId]: isLoading }));
  }, []);

  /**
   * Atualiza erro específico
   */
  const updateError = useCallback((agentId: string, error: string | null) => {
    setErrors(prev => ({ ...prev, [agentId]: error }));
  }, []);

  /**
   * Verifica status de todos os agentes
   */
  const refreshAllStatus = useCallback(async () => {
    const promises = agentIds.map(async (agentId) => {
      try {
        updateLoading(agentId, true);
        const status = await WhatsAppService.getConnectionStatus(agentId);
        updateConnection(agentId, status);
        updateError(agentId, null);
      } catch (err) {
        updateError(agentId, err instanceof Error ? err.message : 'Erro ao verificar status');
      } finally {
        updateLoading(agentId, false);
      }
    });

    await Promise.all(promises);
  }, [agentIds, updateConnection, updateError, updateLoading]);

  /**
   * Conecta agente específico
   */
  const connectAgent = useCallback(async (agentId: string, agent: Omit<WhatsAppAgent, 'connection'>) => {
    try {
      updateLoading(agentId, true);
      updateError(agentId, null);
      
      const connection = await WhatsAppService.connectAgent(agent);
      updateConnection(agentId, connection);
    } catch (err) {
      updateError(agentId, err instanceof Error ? err.message : 'Erro ao conectar agente');
      throw err;
    } finally {
      updateLoading(agentId, false);
    }
  }, [updateConnection, updateError, updateLoading]);

  /**
   * Desconecta agente específico
   */
  const disconnectAgent = useCallback(async (agentId: string) => {
    try {
      updateLoading(agentId, true);
      updateError(agentId, null);
      
      await WhatsAppService.disconnectAgent(agentId);
      updateConnection(agentId, null);
    } catch (err) {
      updateError(agentId, err instanceof Error ? err.message : 'Erro ao desconectar agente');
      throw err;
    } finally {
      updateLoading(agentId, false);
    }
  }, [updateConnection, updateError, updateLoading]);

  /**
   * Inicialização
   */
  useEffect(() => {
    refreshAllStatus();
  }, [refreshAllStatus]);

  return {
    connections,
    loading,
    errors,
    refreshAllStatus,
    connectAgent,
    disconnectAgent,
    updateConnection,
    updateError
  };
};

export default useWhatsAppConnection;
