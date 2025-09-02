// Vercel Function para gerenciar conexões WhatsApp com QR Code
// Gerencia conexões de agentes IA com WhatsApp pessoal

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Responder a preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Conectar agente WhatsApp
  if (req.method === 'POST' && req.body.action === 'connect') {
    try {
      const { agentId, agentName, agentPrompt, autoReply, typingIndicator, readReceipts } = req.body;

      console.log('🔗 Conectando agente WhatsApp:', agentId);

      // AVISO: Esta é uma implementação de demonstração
      // Para produção, você precisa usar whatsapp-web.js ou WhatsApp Business API
      
      // Simular processo de conexão WhatsApp Web
      const sessionId = `session_${agentId}_${Date.now()}`;
      
      // Em uma implementação real, aqui você iniciaria o whatsapp-web.js
      // e obteria o QR Code real do WhatsApp Web
      
      const connection = {
        id: `whatsapp_${agentId}_${Date.now()}`,
        agentId,
        status: 'waiting_qr',
        sessionId,
        message: 'Esta é uma demonstração. Para usar em produção, configure whatsapp-web.js ou WhatsApp Business API.',
        createdAt: new Date().toISOString(),
        instructions: [
          '1. Para implementação real, instale: npm install whatsapp-web.js',
          '2. Configure um cliente WhatsApp Web real',
          '3. Obtenha QR Code válido do WhatsApp',
          '4. Esta versão é apenas para demonstração da interface'
        ]
      };

      console.log('⚠️ Demonstração - QR Code simulado para agente:', agentId);

      return res.status(200).json({
        success: true,
        connection,
        message: 'Demonstração iniciada. Para produção, configure WhatsApp Business API.',
        isDemo: true
      });

    } catch (error) {
      console.error('❌ Erro ao conectar agente:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Desconectar agente WhatsApp
  if (req.method === 'POST' && req.body.action === 'disconnect') {
    try {
      const { agentId } = req.body;

      console.log('❌ Desconectando agente WhatsApp:', agentId);

      // Em produção, aqui você destruiria a conexão real
      return res.status(200).json({
        success: true,
        message: 'Agente desconectado com sucesso!'
      });

    } catch (error) {
      console.error('❌ Erro ao desconectar agente:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Obter status da conexão
  if (req.method === 'GET') {
    try {
      const { agentId } = req.query;

      console.log('📊 Verificando status do agente:', agentId);

      // Em produção, aqui você verificaria o status real da conexão
      const status = {
        agentId,
        status: 'disconnected', // ou 'connecting', 'connected', 'error'
        lastSeen: null,
        error: null
      };

      return res.status(200).json({
        success: true,
        status
      });

    } catch (error) {
      console.error('❌ Erro ao verificar status:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Enviar mensagem manual
  if (req.method === 'POST' && req.body.action === 'send') {
    try {
      const { agentId, to, message } = req.body;

      console.log('📤 Enviando mensagem:', { agentId, to, message });

      // Em produção, aqui você enviaria a mensagem real
      return res.status(200).json({
        success: true,
        message: 'Mensagem enviada com sucesso!'
      });

    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Método não permitido
  return res.status(405).json({ error: 'Método não permitido' });
}
