import React, { useState, useEffect, useCallback } from 'react';
import { 
  MessageCircle, 
  QrCode, 
  Smartphone, 
  CheckCircle, 
  AlertCircle, 
  Loader, 
  X, 
  RefreshCw,
  Send,
  Settings,
  Power,
  Clock
} from 'lucide-react';
import WhatsAppService, { WhatsAppConnection, WhatsAppAgent } from '../services/whatsappService';

interface WhatsAppConnectionProps {
  agentId: string;
  agentName: string;
  onClose?: () => void;
  className?: string;
}

const WhatsAppConnectionComponent: React.FC<WhatsAppConnectionProps> = ({
  agentId,
  agentName,
  onClose,
  className = ''
}) => {
  // Estados principais
  const [connection, setConnection] = useState<WhatsAppConnection | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qrCodeVisible, setQrCodeVisible] = useState(false);

  // Estados para configurações do agente
  const [agentConfig, setAgentConfig] = useState({
    prompt: 'Você é um assistente virtual inteligente e prestativo. Responda de forma clara e objetiva.',
    autoReply: true,
    typingIndicator: true,
    readReceipts: true
  });

  // Estados para envio de mensagem manual
  const [showSendMessage, setShowSendMessage] = useState(false);
  const [messageData, setMessageData] = useState({
    to: '',
    message: ''
  });
  const [sendingMessage, setSendingMessage] = useState(false);

  // Polling para verificar status
  const [pollingInterval, setPollingInterval] = useState<(() => void) | null>(null);

  /**
   * Inicia conexão com WhatsApp
   */
  const handleConnect = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const agent: Omit<WhatsAppAgent, 'connection'> = {
        id: agentId,
        name: agentName,
        ...agentConfig
      };

      const newConnection = await WhatsAppService.connectAgent(agent);
      setConnection(newConnection);
      setQrCodeVisible(true);

      // Inicia polling para verificar status
      const stopPolling = WhatsAppService.startStatusPolling(agentId, (status) => {
        setConnection(prev => prev ? { ...prev, ...status } : status);
        
        // Se conectou com sucesso, esconde QR Code
        if (status.status === 'connected') {
          setQrCodeVisible(false);
        }
      });

      setPollingInterval(() => stopPolling);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao conectar');
    } finally {
      setLoading(false);
    }
  }, [agentId, agentName, agentConfig]);

  /**
   * Desconecta do WhatsApp
   */
  const handleDisconnect = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await WhatsAppService.disconnectAgent(agentId);
      setConnection(null);
      setQrCodeVisible(false);

      // Para o polling
      if (pollingInterval) {
        pollingInterval();
        setPollingInterval(null);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao desconectar');
    } finally {
      setLoading(false);
    }
  }, [agentId, pollingInterval]);

  /**
   * Envia mensagem manual
   */
  const handleSendMessage = useCallback(async () => {
    if (!messageData.to || !messageData.message) {
      setError('Preencha todos os campos da mensagem');
      return;
    }

    setSendingMessage(true);
    setError(null);

    try {
      await WhatsAppService.sendMessage({
        agentId,
        to: WhatsAppService.formatPhoneNumber(messageData.to),
        message: messageData.message
      });

      setMessageData({ to: '', message: '' });
      setShowSendMessage(false);
      
      // Feedback de sucesso
      alert('Mensagem enviada com sucesso!');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar mensagem');
    } finally {
      setSendingMessage(false);
    }
  }, [agentId, messageData]);

  /**
   * Atualiza QR Code
   */
  const handleRefreshQR = useCallback(async () => {
    if (connection?.status === 'connecting') {
      await handleConnect();
    }
  }, [connection?.status, handleConnect]);

  /**
   * Verifica status ao montar componente
   */
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const status = await WhatsAppService.getConnectionStatus(agentId);
        setConnection(status);
      } catch (err) {
        console.error('Erro ao verificar status inicial:', err);
      }
    };

    checkStatus();

    // Cleanup polling ao desmontar
    return () => {
      if (pollingInterval) {
        pollingInterval();
      }
    };
  }, [agentId, pollingInterval]);

  /**
   * Renderiza indicador de status
   */
  const renderStatusIndicator = () => {
    if (!connection) return null;

    const statusConfig = {
      disconnected: { 
        icon: AlertCircle, 
        color: 'text-gray-500', 
        bg: 'bg-gray-100', 
        text: 'Desconectado' 
      },
      connecting: { 
        icon: Loader, 
        color: 'text-yellow-500', 
        bg: 'bg-yellow-100', 
        text: 'Conectando...' 
      },
      connected: { 
        icon: CheckCircle, 
        color: 'text-green-500', 
        bg: 'bg-green-100', 
        text: 'Conectado' 
      },
      waiting_qr: { 
        icon: QrCode, 
        color: 'text-blue-500', 
        bg: 'bg-blue-100', 
        text: 'Aguardando QR Code' 
      },
      demo_connected: { 
        icon: CheckCircle, 
        color: 'text-green-500', 
        bg: 'bg-green-100', 
        text: 'Demo Conectado' 
      },
      error: { 
        icon: AlertCircle, 
        color: 'text-red-500', 
        bg: 'bg-red-100', 
        text: 'Erro' 
      }
    };

    const config = statusConfig[connection.status];
    const IconComponent = config.icon;

    return (
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${config.bg}`}>
        <IconComponent className={`w-4 h-4 ${config.color} ${connection.status === 'connecting' ? 'animate-spin' : ''}`} />
        <span className={`text-sm font-medium ${config.color}`}>
          {config.text}
        </span>
        {connection.lastSeen && (
          <span className="text-xs text-gray-500 ml-2">
            <Clock className="w-3 h-3 inline mr-1" />
            {new Date(connection.lastSeen).toLocaleTimeString()}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg border ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <MessageCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Conexão WhatsApp
            </h3>
            <p className="text-sm text-gray-500">
              Agente: {agentName}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {renderStatusIndicator()}
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="p-6 space-y-6">
        {/* Erro */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Erro</span>
            </div>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Instruções de Implementação */}
        {connection?.status === 'waiting_qr' && (
          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-800 mb-2">
                    Modo Demonstração
                  </h3>
                  <p className="text-yellow-700 mb-4">
                    {connection.message}
                  </p>
                  
                  {connection.instructions && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-yellow-800">
                        Para implementação em produção:
                      </h4>
                      <ul className="space-y-1 text-sm text-yellow-700">
                        {connection.instructions.map((instruction: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-yellow-500">•</span>
                            <span>{instruction}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                <Info className="w-5 h-5" />
                Opções de Implementação Real
              </h3>
              
              <div className="space-y-4 text-sm text-blue-700">
                <div>
                  <h4 className="font-medium text-blue-800 mb-2">1. WhatsApp Web.js (Recomendado para desenvolvimento)</h4>
                  <div className="bg-gray-800 text-green-400 p-3 rounded font-mono text-xs overflow-x-auto">
                    npm install whatsapp-web.js qrcode-terminal
                  </div>
                  <p className="mt-2">
                    Biblioteca não oficial que simula o WhatsApp Web. Gera QR codes reais e permite automação completa.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-blue-800 mb-2">2. WhatsApp Business API (Recomendado para produção)</h4>
                  <p>
                    API oficial do WhatsApp para empresas. Requer aprovação do Facebook e não usa QR codes.
                    Mais estável e confiável para uso comercial.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-blue-800 mb-2">3. Serviços Third-Party</h4>
                  <p>
                    Plataformas como Twilio, ChatAPI, ou WhatsMate que fornecem APIs para WhatsApp.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => {
                  // Simular "conexão" após alguns segundos
                  setTimeout(() => {
                    setConnection(prev => prev ? { ...prev, status: 'demo_connected' } : null);
                    setQrCodeVisible(false);
                  }, 2000);
                }}
                className="btn-primary"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Simular Conexão (Demo)
              </button>
            </div>
          </div>
        )}

        {/* Status de Demo Conectado */}
        {connection?.status === 'demo_connected' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              Demo Conectado!
            </h3>
            <p className="text-green-700 mb-4">
              Esta é uma simulação. Em produção, aqui você teria uma conexão real com WhatsApp.
            </p>
            <div className="bg-white border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-2">Funcionalidades que estariam disponíveis:</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Receber mensagens dos usuários</li>
                <li>• Enviar respostas automáticas usando IA</li>
                <li>• Gerenciar múltiplas conversas</li>
                <li>• Histórico de conversas</li>
                <li>• Analytics e relatórios</li>
              </ul>
            </div>
          </div>
        )}

        {/* Configurações do Agente */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-gray-700">
            <Settings className="w-5 h-5" />
            <span className="font-medium">Configurações do Agente</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Prompt do Agente
              </label>
              <textarea
                value={agentConfig.prompt}
                onChange={(e) => setAgentConfig(prev => ({ ...prev, prompt: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                placeholder="Defina como o agente deve se comportar..."
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Opções
              </label>
              
              {[
                { key: 'autoReply', label: 'Resposta Automática' },
                { key: 'typingIndicator', label: 'Indicador de Digitação' },
                { key: 'readReceipts', label: 'Confirmação de Leitura' }
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={agentConfig[key as keyof typeof agentConfig] as boolean}
                    onChange={(e) => setAgentConfig(prev => ({ 
                      ...prev, 
                      [key]: e.target.checked 
                    }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="flex flex-wrap gap-3">
          {!connection || connection.status === 'disconnected' ? (
            <button
              onClick={handleConnect}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Power className="w-4 h-4" />
              )}
              {loading ? 'Conectando...' : 'Conectar WhatsApp'}
            </button>
          ) : (
            <button
              onClick={handleDisconnect}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Power className="w-4 h-4" />
              )}
              {loading ? 'Desconectando...' : 'Desconectar'}
            </button>
          )}

          {connection?.status === 'connected' && (
            <button
              onClick={() => setShowSendMessage(!showSendMessage)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Send className="w-4 h-4" />
              Enviar Mensagem
            </button>
          )}
        </div>

        {/* Formulário de envio de mensagem */}
        {showSendMessage && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900">Enviar Mensagem Manual</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Número de Destino
                </label>
                <input
                  type="tel"
                  value={messageData.to}
                  onChange={(e) => setMessageData(prev => ({ ...prev, to: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Mensagem
                </label>
                <textarea
                  value={messageData.message}
                  onChange={(e) => setMessageData(prev => ({ ...prev, message: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Digite sua mensagem..."
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSendMessage}
                disabled={sendingMessage || !messageData.to || !messageData.message}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sendingMessage ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {sendingMessage ? 'Enviando...' : 'Enviar'}
              </button>

              <button
                onClick={() => setShowSendMessage(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WhatsAppConnectionComponent;
