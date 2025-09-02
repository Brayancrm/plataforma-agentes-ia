// API para conectar agentes WhatsApp usando whatsapp-web.js
// Gera QR codes reais e gerencia conexões

const WhatsAppService = require('../server/whatsapp-service');

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log('📡 WhatsApp API chamada:', req.method, req.url);

  // Conectar agente WhatsApp
  if (req.method === 'POST' && req.body.action === 'connect') {
    try {
      const { agentId, agentName, agentPrompt, autoReply, typingIndicator, readReceipts } = req.body;

      console.log('🔗 Conectando agente WhatsApp:', agentId);

      // Verificar se já existe uma conexão
      const existingConnection = WhatsAppService.getConnection(agentId);
      if (existingConnection && existingConnection.status === 'connected') {
        return res.status(200).json({
          success: true,
          connection: existingConnection,
          message: 'Agente já está conectado'
        });
      }

      // Criar cliente WhatsApp real
      await WhatsAppService.createClient(agentId, {
        name: agentName,
        prompt: agentPrompt,
        autoReply,
        typingIndicator,
        readReceipts
      });

      // Aguardar QR Code ser gerado
      let attempts = 0;
      const maxAttempts = 30; // 30 segundos
      
      while (attempts < maxAttempts) {
        const connection = WhatsAppService.getConnection(agentId);
        if (connection && connection.status === 'waiting_qr') {
          console.log('✅ QR Code real gerado para agente:', agentId);
          return res.status(200).json({
            success: true,
            connection,
            message: 'QR Code real gerado! Escaneie com seu WhatsApp.'
          });
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
      }

      throw new Error('Timeout ao gerar QR Code');

    } catch (error) {
      console.error('❌ Erro ao conectar agente:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Erro interno do servidor'
      });
    }
  }

  // Desconectar agente WhatsApp
  if (req.method === 'POST' && req.body.action === 'disconnect') {
    try {
      const { agentId } = req.body;

      console.log('🔌 Desconectando agente WhatsApp:', agentId);

      await WhatsAppService.disconnect(agentId);

      return res.status(200).json({
        success: true,
        message: 'Agente desconectado com sucesso'
      });

    } catch (error) {
      console.error('❌ Erro ao desconectar agente:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Erro interno do servidor'
      });
    }
  }

  // Verificar status da conexão
  if (req.method === 'GET') {
    try {
      const { agentId } = req.query;

      if (!agentId) {
        return res.status(400).json({
          success: false,
          error: 'agentId é obrigatório'
        });
      }

      console.log('📊 Verificando status do agente:', agentId);

      const connection = WhatsAppService.getConnection(agentId);
      
      if (!connection) {
        return res.status(200).json({
          success: true,
          status: {
            id: `whatsapp_${agentId}_${Date.now()}`,
            agentId,
            status: 'disconnected',
            createdAt: new Date().toISOString()
          }
        });
      }

      return res.status(200).json({
        success: true,
        status: connection
      });

    } catch (error) {
      console.error('❌ Erro ao verificar status:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Erro interno do servidor'
      });
    }
  }

  // Enviar mensagem
  if (req.method === 'POST' && req.body.action === 'send') {
    try {
      const { agentId, to, message } = req.body;

      console.log('📤 Enviando mensagem via agente:', agentId);

      await WhatsAppService.sendMessage(agentId, to, message);

      return res.status(200).json({
        success: true,
        message: 'Mensagem enviada com sucesso'
      });

    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Erro interno do servidor'
      });
    }
  }

  // Listar todas as conexões
  if (req.method === 'GET' && req.query.action === 'list') {
    try {
      const connections = WhatsAppService.getAllConnections();
      
      return res.status(200).json({
        success: true,
        connections
      });

    } catch (error) {
      console.error('❌ Erro ao listar conexões:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Erro interno do servidor'
      });
    }
  }

  return res.status(405).json({
    success: false,
    error: 'Método não permitido'
  });
}
