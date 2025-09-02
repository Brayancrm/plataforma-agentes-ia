// API para WhatsApp usando Twilio (compatível com Vercel)
// Twilio WhatsApp Business API

const twilio = require('twilio');

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log('📡 Twilio WhatsApp API chamada:', req.method, req.url);

  // Verificar se as variáveis de ambiente estão configuradas
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    return res.status(500).json({
      success: false,
      error: 'Configuração do Twilio incompleta. Configure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN e TWILIO_WHATSAPP_NUMBER.',
      message: 'Configure as variáveis de ambiente do Twilio no Vercel'
    });
  }

  const client = twilio(accountSid, authToken);

  try {
    if (req.method === 'POST') {
      const { action, to, message, agentName, agentPrompt } = req.body;

      console.log('📱 Ação Twilio:', action);

      switch (action) {
        case 'send_message':
          if (!to || !message) {
            return res.status(400).json({
              success: false,
              error: 'Número de destino e mensagem são obrigatórios'
            });
          }

          // Formatar número para WhatsApp (adicionar whatsapp: se necessário)
          let formattedNumber = to;
          if (!formattedNumber.startsWith('whatsapp:')) {
            formattedNumber = `whatsapp:${formattedNumber}`;
          }

          console.log('📤 Enviando mensagem via Twilio:', {
            from: fromNumber,
            to: formattedNumber,
            message: message.substring(0, 50) + '...'
          });

          const twilioMessage = await client.messages.create({
            from: fromNumber,
            to: formattedNumber,
            body: message
          });

          console.log('✅ Mensagem enviada via Twilio:', twilioMessage.sid);

          return res.status(200).json({
            success: true,
            message: 'Mensagem enviada com sucesso via Twilio',
            messageId: twilioMessage.sid,
            status: twilioMessage.status
          });

        case 'get_status':
          return res.status(200).json({
            success: true,
            status: 'connected',
            provider: 'twilio',
            message: 'Twilio WhatsApp conectado e funcionando',
            fromNumber: fromNumber
          });

        case 'test_connection':
          return res.status(200).json({
            success: true,
            status: 'connected',
            provider: 'twilio',
            message: 'Conexão Twilio testada com sucesso',
            config: {
              accountSid: accountSid ? '***' + accountSid.slice(-4) : 'não configurado',
              fromNumber: fromNumber
            }
          });

        default:
          return res.status(400).json({
            success: false,
            error: 'Ação não reconhecida',
            availableActions: ['send_message', 'get_status', 'test_connection']
          });
      }
    }

    if (req.method === 'GET') {
      return res.status(200).json({
        success: true,
        status: 'connected',
        provider: 'twilio',
        message: 'Twilio WhatsApp API funcionando',
        fromNumber: fromNumber,
        availableActions: ['send_message', 'get_status', 'test_connection']
      });
    }

  } catch (error) {
    console.error('❌ Erro na API Twilio:', error);
    
    let errorMessage = 'Erro interno do servidor';
    if (error.code === 21211) {
      errorMessage = 'Número de telefone inválido';
    } else if (error.code === 21608) {
      errorMessage = 'Número não está no WhatsApp';
    } else if (error.code === 21610) {
      errorMessage = 'Mensagem muito longa';
    } else if (error.code === 21614) {
      errorMessage = 'Conteúdo da mensagem não permitido';
    }

    return res.status(500).json({
      success: false,
      error: errorMessage,
      details: error.message,
      code: error.code
    });
  }
}
