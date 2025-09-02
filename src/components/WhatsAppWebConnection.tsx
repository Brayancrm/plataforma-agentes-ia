import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  MessageCircle,
  CheckCircle,
  AlertCircle,
  Loader,
  Power,
  Send,
  Wifi,
  WifiOff
} from 'lucide-react';

interface WhatsAppWebConnectionProps {
  agentId: string;
  agentName: string;
  agentPrompt?: string;
  onConnectionChange?: (status: any) => void;
}

const WhatsAppWebConnection: React.FC<WhatsAppWebConnectionProps> = ({
  agentId,
  agentName,
  agentPrompt,
  onConnectionChange
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState<string>('DISCONNECTED');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [testMessage, setTestMessage] = useState('');
  const [testNumber, setTestNumber] = useState('');

  // Status config (igual ao exemplo)
  const statusConfig = {
    DISCONNECTED: {
      icon: WifiOff,
      color: 'text-red-500',
      bg: 'bg-red-100',
      text: 'WhatsApp Não Oficial',
      subtext: 'Status: Desconectado',
      dot: 'bg-red-500'
    },
    INITIALIZING: {
      icon: Loader,
      color: 'text-yellow-500',
      bg: 'bg-yellow-100',
      text: 'WhatsApp Não Oficial',
      subtext: 'Status: Inicializando...',
      dot: 'bg-yellow-500'
    },
    QRCODE: {
      icon: Wifi,
      color: 'text-blue-500',
      bg: 'bg-blue-100',
      text: 'WhatsApp Não Oficial',
      subtext: 'Status: Aguardando QR Code',
      dot: 'bg-blue-500'
    },
    READY: {
      icon: CheckCircle,
      color: 'text-green-500',
      bg: 'bg-green-100',
      text: 'WhatsApp Configurado',
      subtext: 'Status: Conectado',
      dot: 'bg-green-500'
    },
    ERROR: {
      icon: AlertCircle,
      color: 'text-red-500',
      bg: 'bg-red-100',
      text: 'WhatsApp Não Oficial',
      subtext: 'Status: Erro',
      dot: 'bg-red-500'
    }
  };

  // Conectar Socket.io
  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    // Event listeners (igual ao exemplo)
    newSocket.on('whatsapp:qrcode', (data) => {
      console.log('📱 QR Code recebido:', data);
      if (data.clientId === agentId) {
        setQrCode(data.qrCode);
        setStatus('QRCODE');
        setLoading(false);
      }
    });

    newSocket.on('whatsapp:ready', (data) => {
      console.log('✅ WhatsApp pronto:', data);
      if (data.clientId === agentId) {
        setStatus('READY');
        setQrCode(null);
        setLoading(false);
        setError(null);
        onConnectionChange?.({ status: 'READY', message: data.message });
      }
    });

    newSocket.on('whatsapp:error', (data) => {
      console.error('❌ Erro WhatsApp:', data);
      if (data.clientId === agentId) {
        setStatus('ERROR');
        setError(data.error);
        setLoading(false);
        setQrCode(null);
      }
    });

    newSocket.on('whatsapp:disconnected', (data) => {
      console.log('🔌 WhatsApp desconectado:', data);
      if (data.clientId === agentId) {
        setStatus('DISCONNECTED');
        setIsActive(false);
        setQrCode(null);
        setLoading(false);
      }
    });

    newSocket.on('whatsapp:message', (data) => {
      console.log('💬 Nova mensagem:', data);
      if (data.clientId === agentId) {
        setMessages(prev => [...prev, data]);
      }
    });

    newSocket.on('whatsapp:message_sent', (data) => {
      console.log('✅ Mensagem enviada:', data);
      setTestMessage('');
      setTestNumber('');
    });

    return () => {
      newSocket.disconnect();
    };
  }, [agentId, onConnectionChange]);

  // Toggle WhatsApp/Ativo (igual ao exemplo)
  const handleToggle = async () => {
    if (!socket) return;

    if (isActive && status !== 'DISCONNECTED') {
      // Desconectar
      setLoading(true);
      socket.emit('whatsapp:disconnect', { clientId: agentId });
      setIsActive(false);
    } else {
      // Conectar
      setLoading(true);
      setError(null);
      socket.emit('whatsapp:connect', {
        clientId: agentId,
        clientName: agentName,
        agentPrompt: agentPrompt || 'Sou um assistente virtual inteligente.'
      });
      setIsActive(true);
    }
  };

  // Enviar mensagem de teste
  const handleSendTest = () => {
    if (!socket || !testNumber || !testMessage) return;

    socket.emit('whatsapp:send_message', {
      clientId: agentId,
      to: testNumber,
      message: testMessage
    });
  };

  const currentStatus = statusConfig[status as keyof typeof statusConfig] || statusConfig.DISCONNECTED;
  const StatusIcon = currentStatus.icon;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header com Toggle (igual ao exemplo) */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <MessageCircle className="w-6 h-6 text-green-600" />
          <span className="font-medium text-gray-900">WhatsApp</span>
          
          {/* Toggle Switch */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggle}
              disabled={loading}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isActive ? 'bg-blue-600' : 'bg-gray-200'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isActive ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className="text-sm font-medium text-gray-700">Ativo</span>
          </div>
        </div>

        {loading && <Loader className="w-5 h-5 animate-spin text-blue-500" />}
      </div>

      {/* Título e descrição */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">WhatsApp</h3>
        <p className="text-gray-600 text-sm mb-4">Configure o WhatsApp do assistente</p>

        {/* Status Badge (igual ao exemplo) */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <div className={`w-2 h-2 rounded-full ${currentStatus.dot}`}></div>
          <div className="flex-1">
            <span className={`font-medium ${currentStatus.color}`}>
              {currentStatus.text}
            </span>
            <p className="text-xs text-gray-500 mt-1">
              {currentStatus.subtext}
            </p>
          </div>
          <StatusIcon className={`w-4 h-4 ${currentStatus.color}`} />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-800">Erro de Conexão</h4>
              <p className="text-red-700 mt-1 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* QR Code (igual ao exemplo) */}
      {status === 'QRCODE' && qrCode && (
        <div className="mb-6 text-center">
          <p className="text-gray-700 mb-4">Escaneie o QR Code com seu WhatsApp:</p>
          <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
            <img 
              src={qrCode} 
              alt="QR Code WhatsApp" 
              className="w-64 h-64 mx-auto"
            />
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p>• Abra o WhatsApp no seu celular</p>
            <p>• Toque em Menu (⋮) → WhatsApp Web</p>
            <p>• Aponte a câmera para o QR Code</p>
            <p>• Aguarde a conexão ser estabelecida</p>
          </div>
        </div>
      )}

      {/* Success State (igual ao exemplo) */}
      {status === 'READY' && (
        <div className="mb-6 p-6 bg-green-50 border border-green-200 rounded-lg text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            ✅ WhatsApp configurado
          </h3>
          <p className="text-green-700">
            O assistente está salvo e pode ser conectado ao WhatsApp Web
          </p>
        </div>
      )}

      {/* Inbound/Outbound (igual ao exemplo) */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
          <h4 className="font-semibold text-blue-800 mb-2">Inbound</h4>
          <p className="text-sm text-blue-700">
            Esse assistente será direcionado para o Inbound
          </p>
        </div>
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg text-center">
          <h4 className="font-semibold text-orange-800 mb-2">Outbound</h4>
          <p className="text-sm text-orange-700">
            Esse assistente será direcionado para Outbound
          </p>
        </div>
      </div>

      {/* Campo Nome (igual ao exemplo) */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Nome *"
          value={agentName}
          disabled
          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
        />
      </div>

      {/* Teste de Mensagem (se conectado) */}
      {status === 'READY' && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-4">Enviar Mensagem de Teste</h4>
          
          <div className="space-y-3">
            <input
              type="text"
              value={testNumber}
              onChange={(e) => setTestNumber(e.target.value)}
              placeholder="+5511999999999"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <textarea
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <button
              onClick={handleSendTest}
              disabled={!testNumber || !testMessage}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              Enviar Teste
            </button>
          </div>
        </div>
      )}

      {/* Botão Principal (igual ao exemplo) */}
      <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors">
        <MessageCircle className="w-5 h-5" />
        🤖 Assistente WhatsApp
      </button>

      {/* Histórico de mensagens */}
      {messages.length > 0 && (
        <div className="mt-6">
          <h4 className="font-medium text-gray-900 mb-4">Mensagens Recentes</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {messages.slice(-5).map((msg, index) => (
              <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                <div className="font-medium text-gray-800">
                  {msg.from}: {msg.message}
                </div>
                <div className="text-green-600 mt-1">
                  Resposta: {msg.response}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsAppWebConnection;
