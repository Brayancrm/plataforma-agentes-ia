// Vercel Function para webhook do WhatsApp
// Recebe mensagens e processa com agentes IA

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Responder a preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Verificação do webhook (GET)
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    // Token de verificação (deve ser configurado no WhatsApp Business)
    const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'webhook_verify_token_123';

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('✅ Webhook WhatsApp verificado com sucesso');
      return res.status(200).send(challenge);
    } else {
      console.log('❌ Falha na verificação do webhook WhatsApp');
      return res.status(403).send('Forbidden');
    }
  }

  // Processar mensagens recebidas (POST)
  if (req.method === 'POST') {
    try {
      console.log('📱 Mensagem WhatsApp recebida:', JSON.stringify(req.body, null, 2));

      const entry = req.body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const messages = value?.messages?.[0];

      if (!messages) {
        console.log('ℹ️ Webhook recebido sem mensagens');
        return res.status(200).json({ status: 'ok', message: 'No messages to process' });
      }

      // Extrair dados da mensagem
      const messageData = {
        id: messages.id,
        from: messages.from,
        to: value.metadata?.phone_number_id || '',
        text: messages.text?.body || '',
        timestamp: new Date(parseInt(messages.timestamp) * 1000).toISOString(),
        type: messages.type || 'text'
      };

      console.log('📝 Dados da mensagem processados:', messageData);

      // Aqui você pode adicionar lógica para:
      // 1. Buscar o agente IA configurado para este número
      // 2. Gerar resposta usando OpenAI/Gemini
      // 3. Enviar resposta de volta

      // Por enquanto, apenas log
      console.log('🤖 Processando com agente IA...');

      // Resposta de sucesso para o WhatsApp
      return res.status(200).json({
        status: 'success',
        message: 'Mensagem processada com sucesso',
        messageId: messageData.id
      });

    } catch (error) {
      console.error('❌ Erro ao processar webhook WhatsApp:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Erro interno do servidor'
      });
    }
  }

  // Método não permitido
  return res.status(405).json({ error: 'Método não permitido' });
}

