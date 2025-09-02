import React, { useState, useEffect, useCallback } from 'react';
import {
  MessageCircle,
  QrCode,
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
import whatsappService, { WhatsAppConnection, WhatsAppMessage } from '../services/whatsappService';

interface WhatsAppConnectionProps {
  agentId: string;
  agentName: string;
  agentPrompt?: string;
  onConnectionChange?: (connection: WhatsAppConnection | null) => void;
}

const WhatsAppConnectionComponent: React.FC<WhatsAppConnectionProps> = ({
  agentId,
  agentName,
  agentPrompt,
  onConnectionChange
}) => {
  const [connection, setConnection] = useState<WhatsAppConnection | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [recipientNumber, setRecipientNumber] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  // Status indicators
  const statusConfig = {
    disconnected: {
      icon: Power,
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
    error: {
      icon: AlertCircle,
      color: 'text-red-500',
      bg: 'bg-red-100',
      text: 'Erro'
    }
  };

  // Conectar agente
  const handleConnect = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔗 Conectando agente WhatsApp:', agentId);
      const newConnection = await whatsappService.connectAgent(agentId, agentName, agentPrompt);
      setConnection(newConnection);
      onConnectionChange?.(newConnection);
      
      // Carregar mensagens existentes
      const agentMessages = whatsappService.getAgentMessages(agentId);
      setMessages(agentMessages);
      
    } catch (err) {
      console.error('❌ Erro ao conectar:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [agentId, agentName, agentPrompt, onConnectionChange]);

  // Desconectar agente
  const handleDisconnect = useCallback(async () => {
    try {
      await whatsappService.disconnectAgent(agentId);
      setConnection(null);
      onConnectionChange?.(null);
      setMessages([]);
    } catch (err) {
      console.error('❌ Erro ao desconectar:', err);
      setError(err instanceof Error ? err.message : 'Erro ao desconectar');
    }
  }, [agentId, onConnectionChange]);

  // Enviar mensagem
  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !recipientNumber.trim()) {
      setError('Preencha o número e a mensagem');
      return;
    }

    setSendingMessage(true);
    setError(null);

    try {
      const sentMessage = await whatsappService.sendMessage(agentId, recipientNumber, newMessage);
      setMessages(prev => [sentMessage, ...prev]);
      setNewMessage('');
      console.log('✅ Mensagem enviada:', sentMessage);
    } catch (err) {
      console.error('❌ Erro ao enviar mensagem:', err);
      setError(err instanceof Error ? err.message : 'Erro ao enviar mensagem');
    } finally {
      setSendingMessage(false);
    }
  }, [agentId, newMessage, recipientNumber]);

  // Verificar status periodicamente
  useEffect(() => {
    if (connection?.status === 'connected') {
      const interval = setInterval(async () => {
        try {
          const updatedConnection = await whatsappService.getConnectionStatus(agentId);
          if (updatedConnection) {
            setConnection(updatedConnection);
            onConnectionChange?.(updatedConnection);
          }
        } catch (err) {
          console.error('❌ Erro ao verificar status:', err);
        }
      }, 10000); // Verificar a cada 10 segundos

      return () => clearInterval(interval);
    }
  }, [connection?.status, agentId, onConnectionChange]);

  // Carregar conexão existente ao montar
  useEffect(() => {
    const existingConnection = whatsappService.getAllConnections().find(c => c.agentId === agentId);
    if (existingConnection) {
      setConnection(existingConnection);
      onConnectionChange?.(existingConnection);
      
      // Carregar mensagens
      const agentMessages = whatsappService.getAgentMessages(agentId);
      setMessages(agentMessages);
    }
  }, [agentId, onConnectionChange]);

  const currentStatus = connection?.status || 'disconnected';
  const StatusIcon = statusConfig[currentStatus].icon;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <MessageCircle className="w-6 h-6 text-green-600" />
          <div>
            <h3 className="font-semibold text-gray-900">WhatsApp - {agentName}</h3>
            <p className="text-sm text-gray-600">Twilio WhatsApp Business API</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${statusConfig[currentStatus].bg}`}>
            <StatusIcon className={`w-4 h-4 ${statusConfig[currentStatus].color}`} />
            <span className={`text-sm font-medium ${statusConfig[currentStatus].color}`}>
              {statusConfig[currentStatus].text}
            </span>
          </div>
          
          {connection?.status === 'connected' ? (
            <button
              onClick={handleDisconnect}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
            >
              <Power className="w-4 h-4" />
              Desconectar
            </button>
          ) : (
            <button
              onClick={handleConnect}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors disabled:opacity-50"
            >
              {loading ? <Loader className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              {loading ? 'Conectando...' : 'Conectar'}
            </button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-800">Erro de Conexão</h4>
              <p className="text-red-700 mt-1">{error}</p>
              <button
                onClick={() => setError(null)}
                className="mt-2 text-red-600 hover:text-red-700 text-sm"
              >
                <X className="w-4 h-4 inline mr-1" />
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Connection Status */}
      {connection?.status === 'connected' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center mb-6">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            WhatsApp Conectado via Twilio!
          </h3>
          <p className="text-green-700 mb-4">
            {connection.message}
          </p>
          {connection.fromNumber && (
            <p className="text-sm text-green-600">
              Número: {connection.fromNumber}
            </p>
          )}
        </div>
      )}

      {/* Instructions */}
      {connection?.status === 'connected' && connection.instructions && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Instruções:</h4>
          <ul className="space-y-1">
            {connection.instructions.map((instruction, index) => (
              <li key={index} className="text-blue-700 text-sm flex items-start gap-2">
                <span className="text-blue-500">•</span>
                {instruction}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Send Message Form */}
      {connection?.status === 'connected' && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-4">Enviar Mensagem de Teste</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de Destino
              </label>
              <input
                type="text"
                value={recipientNumber}
                onChange={(e) => setRecipientNumber(e.target.value)}
                placeholder="+5511999999999"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Formato: +5511999999999 (com código do país)
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mensagem
              </label>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <button
              onClick={handleSendMessage}
              disabled={sendingMessage || !newMessage.trim() || !recipientNumber.trim()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {sendingMessage ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Enviar Mensagem
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Messages History */}
      {messages.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-4">Histórico de Mensagens</h4>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`p-3 rounded-lg border ${
                  message.status === 'sent' || message.status === 'delivered'
                    ? 'bg-green-50 border-green-200'
                    : message.status === 'failed'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-yellow-50 border-yellow-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Para: {message.to}
                    </p>
                    <p className="text-sm text-gray-700 mt-1">{message.message}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(message.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {message.status === 'sending' && <Loader className="w-4 h-4 animate-spin text-yellow-500" />}
                    {message.status === 'sent' && <CheckCircle className="w-4 h-4 text-green-500" />}
                    {message.status === 'delivered' && <CheckCircle className="w-4 h-4 text-blue-500" />}
                    {message.status === 'failed' && <AlertCircle className="w-4 h-4 text-red-500" />}
                  </div>
                </div>
                {message.error && (
                  <p className="text-xs text-red-600 mt-2">{message.error}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsAppConnectionComponent;
