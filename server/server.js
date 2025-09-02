const express = require('express');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');
const http = require('http');
const socketIo = require('socket.io');
const WhatsAppWebService = require('./whatsapp-web-service');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Inicializar WhatsApp Web Service
const whatsappService = new WhatsAppWebService(io);

// Configurações OAuth 2.0
const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Armazenar tokens (em produção, use banco de dados)
let accessToken = null;
let refreshToken = null;

// Socket.io handlers para WhatsApp Web (igual ao exemplo)
io.on('connection', (socket) => {
  console.log('🔌 Cliente conectado:', socket.id);

  // Conectar WhatsApp (igual ao exemplo)
  socket.on('whatsapp:connect', async (data) => {
    try {
      const { clientId, clientName, agentPrompt } = data;
      console.log('📱 Solicitação de conexão WhatsApp:', clientId);
      
      const result = await whatsappService.connectClient(clientId, clientName, socket);
      socket.emit('whatsapp:connect_result', result);
    } catch (error) {
      console.error('❌ Erro ao conectar WhatsApp:', error);
      socket.emit('whatsapp:error', { error: error.message });
    }
  });

  // Desconectar WhatsApp
  socket.on('whatsapp:disconnect', async (data) => {
    try {
      const { clientId } = data;
      const result = await whatsappService.disconnectClient(clientId, socket);
      socket.emit('whatsapp:disconnect_result', result);
    } catch (error) {
      console.error('❌ Erro ao desconectar WhatsApp:', error);
      socket.emit('whatsapp:error', { error: error.message });
    }
  });

  // Enviar mensagem
  socket.on('whatsapp:send_message', async (data) => {
    try {
      const { clientId, to, message } = data;
      const result = await whatsappService.sendMessage(clientId, to, message);
      socket.emit('whatsapp:message_sent', result);
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      socket.emit('whatsapp:error', { error: error.message });
    }
  });

  // Obter status
  socket.on('whatsapp:get_status', (data) => {
    const { clientId } = data;
    const status = whatsappService.getConnectionStatus(clientId);
    const qrCode = whatsappService.getQRCode(clientId);
    
    socket.emit('whatsapp:status', {
      clientId,
      status: status?.status || 'DISCONNECTED',
      qrCode: qrCode?.dataURL,
      connection: status
    });
  });

  socket.on('disconnect', () => {
    console.log('🔌 Cliente desconectado:', socket.id);
  });
});

// Rota para iniciar autenticação OAuth 2.0
app.get('/auth/google', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/cloud-platform'
    ],
    prompt: 'consent'
  });
  
  console.log('🔐 URL de autenticação gerada:', authUrl);
  res.json({ authUrl });
});

// Callback OAuth 2.0
app.get('/auth/google/callback', async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).json({ error: 'Código de autorização não fornecido' });
    }

    console.log('🔄 Recebido código de autorização, trocando por tokens...');
    
    // Trocar código por tokens
    const { tokens } = await oauth2Client.getToken(code);
    
    accessToken = tokens.access_token;
    refreshToken = tokens.refresh_token;
    
    console.log('✅ Tokens obtidos com sucesso!');
    console.log('🔑 Access Token:', accessToken ? '✅ Presente' : '❌ Ausente');
    console.log('🔄 Refresh Token:', refreshToken ? '✅ Presente' : '❌ Ausente');
    
    res.json({ 
      success: true, 
      message: 'Autenticação OAuth 2.0 concluída com sucesso!',
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken
    });
    
  } catch (error) {
    console.error('❌ Erro no callback OAuth:', error);
    res.status(500).json({ 
      error: 'Erro na autenticação OAuth 2.0',
      details: error.message 
    });
  }
});

// Rota para verificar status da autenticação
app.get('/auth/status', (req, res) => {
  res.json({
    isAuthenticated: !!accessToken,
    hasAccessToken: !!accessToken,
    hasRefreshToken: !!refreshToken,
    projectId: process.env.VERTEX_AI_PROJECT_ID,
    location: process.env.VERTEX_AI_LOCATION
  });
});

// Rota para gerar vídeo via Veo 3
app.post('/api/generate-video', async (req, res) => {
  try {
    if (!accessToken) {
      return res.status(401).json({ 
        error: 'Não autenticado. Execute o fluxo OAuth 2.0 primeiro.' 
      });
    }

    const { prompt, duration, aspectRatio } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt é obrigatório' });
    }

    console.log('🎬 Iniciando geração de vídeo via Veo 3...');
    console.log('📝 Prompt:', prompt);
    console.log('⏱️ Duração:', duration);
    console.log('📐 Aspect Ratio:', aspectRatio);

    // Converter duração para formato esperado pela API
    const videoLength = duration <= 5 ? '5s' : duration <= 10 ? '10s' : '15s';
    
    // Converter aspect ratio para formato da API
    const videoAspectRatio = aspectRatio === '16:9' ? '16:9' : aspectRatio === '9:16' ? '9:16' : '1:1';

    const requestBody = {
      instances: [{
        prompt: prompt,
        video_length: videoLength,
        video_quality: '1080p',
        video_format: 'mp4',
        video_aspect_ratio: videoAspectRatio
      }],
      parameters: {
        sample_count: 1,
        video_model: 'veo-3'
      }
    };

    console.log('📤 Enviando para API Veo 3...');
    console.log('📋 Request body:', JSON.stringify(requestBody, null, 2));

    // Chamar API Veo 3 com token OAuth 2.0
    const response = await axios.post(
      `https://${process.env.VERTEX_AI_LOCATION}-aiplatform.googleapis.com/v1/projects/${process.env.VERTEX_AI_PROJECT_ID}/locations/${process.env.VERTEX_AI_LOCATION}/publishers/google/models/veo-3:generateVideo`,
      requestBody,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        }
      }
    );

    console.log('✅ Resposta da API Veo 3:', response.data);
    
    const operationName = response.data.name;
    
    res.json({
      success: true,
      operationName: operationName,
      message: 'Vídeo enviado para processamento. Use o operationName para verificar o status.',
      status: 'processing'
    });

  } catch (error) {
    console.error('❌ Erro na geração de vídeo:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      // Token expirado, tentar refresh
      console.log('🔄 Token expirado, tentando refresh...');
      try {
        await refreshAccessToken();
        res.status(401).json({ 
          error: 'Token expirado. Execute o fluxo OAuth 2.0 novamente.' 
        });
      } catch (refreshError) {
        res.status(401).json({ 
          error: 'Token expirado e refresh falhou. Execute o fluxo OAuth 2.0 novamente.' 
        });
      }
    } else {
      res.status(500).json({ 
        error: 'Erro na geração de vídeo',
        details: error.response?.data || error.message
      });
    }
  }
});

// Rota para verificar status da operação
app.get('/api/operation/:operationName', async (req, res) => {
  try {
    if (!accessToken) {
      return res.status(401).json({ 
        error: 'Não autenticado. Execute o fluxo OAuth 2.0 primeiro.' 
      });
    }

    const { operationName } = req.params;
    
    console.log('🔄 Verificando status da operação:', operationName);

    const response = await axios.get(
      `https://${process.env.VERTEX_AI_LOCATION}-aiplatform.googleapis.com/v1/projects/${process.env.VERTEX_AI_PROJECT_ID}/locations/${process.env.VERTEX_AI_LOCATION}/operations/${operationName}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        }
      }
    );

    const operation = response.data;
    console.log('📊 Status da operação:', operation.done ? 'Concluída' : 'Em processamento');

    if (operation.done) {
      if (operation.error) {
        console.error('❌ Erro na operação:', operation.error);
        res.json({
          success: false,
          status: 'error',
          error: operation.error
        });
      } else if (operation.response) {
        console.log('✅ Operação concluída com sucesso:', operation.response);
        res.json({
          success: true,
          status: 'completed',
          videoData: operation.response.instances[0],
          operation: operation
        });
      } else {
        res.json({
          success: false,
          status: 'completed_no_response',
          operation: operation
        });
      }
    } else {
      res.json({
        success: true,
        status: 'processing',
        operation: operation
      });
    }

  } catch (error) {
    console.error('❌ Erro ao verificar operação:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Erro ao verificar operação',
      details: error.response?.data || error.message
    });
  }
});

// Função para refresh do token
async function refreshAccessToken() {
  try {
    if (!refreshToken) {
      throw new Error('Refresh token não disponível');
    }

    console.log('🔄 Atualizando access token...');
    
    oauth2Client.setCredentials({
      refresh_token: refreshToken
    });

    const { credentials } = await oauth2Client.refreshAccessToken();
    accessToken = credentials.access_token;
    
    console.log('✅ Access token atualizado com sucesso!');
    return true;
    
  } catch (error) {
    console.error('❌ Erro ao atualizar access token:', error);
    accessToken = null;
    refreshToken = null;
    throw error;
  }
}

// Rota de teste
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Servidor OAuth 2.0 funcionando!',
    timestamp: new Date().toISOString(),
    projectId: process.env.VERTEX_AI_PROJECT_ID,
    location: process.env.VERTEX_AI_LOCATION
  });
});

// ==================== WHATSAPP WEB ROUTES ====================

// Rota para WhatsApp Web (igual ao exemplo)
app.post('/api/whatsapp-web', async (req, res) => {
  try {
    const { action, to, message, clientId, clientName, agentPrompt } = req.body;

    console.log('📱 Ação WhatsApp Web:', action);

    switch (action) {
      case 'test_connection':
        return res.json({
          success: true,
          status: 'ready',
          provider: 'whatsapp-web',
          message: 'WhatsApp Web pronto para conectar',
          service: 'WhatsApp Web API'
        });

      case 'connect_agent':
        if (!agentId || !agentName) {
          return res.status(400).json({
            success: false,
            error: 'agentId e agentName são obrigatórios'
          });
        }

        const connection = {
          id: `twilio_${agentId}_${Date.now()}`,
          agentId,
          agentName,
          agentPrompt: agentPrompt || 'Sou um assistente virtual inteligente.',
          status: 'connected',
          provider: 'twilio',
          fromNumber: twilioWhatsAppNumber,
          createdAt: new Date().toISOString(),
          lastSeen: new Date().toISOString()
        };

        agentConnections.set(agentId, connection);
        console.log('✅ Agente conectado via Twilio:', agentId);

        return res.json({
          success: true,
          connection: connection,
          message: 'Agente conectado com sucesso via Twilio'
        });

      case 'send_message':
        if (!to || !message) {
          return res.status(400).json({
            success: false,
            error: 'Número de destino e mensagem são obrigatórios'
          });
        }

        let formattedNumber = to;
        if (!formattedNumber.startsWith('whatsapp:')) {
          formattedNumber = `whatsapp:${formattedNumber}`;
        }

        console.log('📤 Enviando mensagem via Twilio:', {
          from: twilioWhatsAppNumber,
          to: formattedNumber,
          message: message.substring(0, 50) + '...'
        });

        const twilioMessage = await twilioClient.messages.create({
          from: twilioWhatsAppNumber,
          to: formattedNumber,
          body: message
        });

        // Salvar no histórico
        const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const messageData = {
          id: messageId,
          agentId: agentId || 'unknown',
          to: formattedNumber,
          message,
          timestamp: new Date().toISOString(),
          status: 'sent',
          twilioSid: twilioMessage.sid,
          direction: 'outbound'
        };

        if (!messageHistory.has(agentId)) {
          messageHistory.set(agentId, []);
        }
        messageHistory.get(agentId).push(messageData);

        console.log('✅ Mensagem enviada via Twilio:', twilioMessage.sid);

        return res.json({
          success: true,
          message: 'Mensagem enviada com sucesso',
          messageId: twilioMessage.sid,
          status: twilioMessage.status
        });

      case 'get_status':
        return res.json({
          success: true,
          status: 'connected',
          provider: 'twilio',
          message: 'Twilio WhatsApp conectado e funcionando',
          fromNumber: twilioWhatsAppNumber,
          activeConnections: agentConnections.size
        });

      default:
        return res.status(400).json({
          success: false,
          error: 'Ação não reconhecida',
          availableActions: ['test_connection', 'connect_agent', 'send_message', 'get_status']
        });
    }

  } catch (error) {
    console.error('❌ Erro na API Twilio WhatsApp:', error);
    
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
});

// Webhook para receber mensagens do Twilio
app.post('/webhook/twilio', express.raw({type: 'application/x-www-form-urlencoded'}), async (req, res) => {
  try {
    console.log('📨 Webhook Twilio recebido:', req.body);

    // Parse do corpo da requisição (Twilio envia como form-urlencoded)
    const body = new URLSearchParams(req.body.toString());
    const messageData = {
      from: body.get('From'),
      to: body.get('To'),
      body: body.get('Body'),
      messageSid: body.get('MessageSid'),
      accountSid: body.get('AccountSid')
    };

    console.log('📱 Mensagem recebida:', messageData);

    // Encontrar agente responsável por este número
    let targetAgent = null;
    for (const [agentId, connection] of agentConnections) {
      if (connection.fromNumber === messageData.to) {
        targetAgent = { agentId, connection };
        break;
      }
    }

    if (!targetAgent) {
      console.log('❌ Agente não encontrado para:', messageData.to);
      return res.status(200).send('OK'); // Sempre retornar 200 para Twilio
    }

    // Gerar resposta usando IA
    const aiResponse = await generateAIResponse(
      messageData.body,
      targetAgent.connection.agentPrompt
    );

    // Enviar resposta automática
    const responseMessage = await twilioClient.messages.create({
      from: twilioWhatsAppNumber,
      to: messageData.from,
      body: aiResponse
    });

    // Salvar no histórico
    const agentId = targetAgent.agentId;
    if (!messageHistory.has(agentId)) {
      messageHistory.set(agentId, []);
    }

    // Mensagem recebida
    messageHistory.get(agentId).push({
      id: messageData.messageSid,
      agentId,
      from: messageData.from,
      message: messageData.body,
      timestamp: new Date().toISOString(),
      direction: 'inbound',
      status: 'received'
    });

    // Resposta enviada
    messageHistory.get(agentId).push({
      id: responseMessage.sid,
      agentId,
      to: messageData.from,
      message: aiResponse,
      timestamp: new Date().toISOString(),
      direction: 'outbound',
      status: 'sent'
    });

    console.log('✅ Resposta automática enviada:', responseMessage.sid);
    res.status(200).send('OK');

  } catch (error) {
    console.error('❌ Erro no webhook Twilio:', error);
    res.status(200).send('OK'); // Sempre retornar 200 para evitar reenvios
  }
});

// Rota para obter histórico de mensagens
app.get('/api/messages/:agentId', (req, res) => {
  try {
    const { agentId } = req.params;
    const messages = messageHistory.get(agentId) || [];
    
    res.json({
      success: true,
      agentId,
      messages: messages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
      count: messages.length
    });
  } catch (error) {
    console.error('❌ Erro ao obter mensagens:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter histórico de mensagens'
    });
  }
});

// Rota para obter conexões ativas
app.get('/api/connections', (req, res) => {
  try {
    const connections = Array.from(agentConnections.values());
    res.json({
      success: true,
      connections,
      count: connections.length
    });
  } catch (error) {
    console.error('❌ Erro ao obter conexões:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter conexões'
    });
  }
});

// Função para gerar resposta com IA
async function generateAIResponse(userMessage, agentPrompt) {
  try {
    // Integração com OpenAI (se configurado)
    if (process.env.OPENAI_API_KEY) {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: agentPrompt
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        max_tokens: 150,
        temperature: 0.7
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.choices[0].message.content.trim();
    }

    // Integração com Gemini (se configurado)
    if (process.env.GEMINI_API_KEY) {
      const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        contents: [{
          parts: [{
            text: `${agentPrompt}\n\nUsuário: ${userMessage}\n\nResponda de forma útil e concisa:`
          }]
        }]
      });

      return response.data.candidates[0].content.parts[0].text.trim();
    }

    // Resposta padrão se não houver IA configurada
    return `Olá! Sou um assistente virtual configurado com: "${agentPrompt}"\n\nVocê disse: "${userMessage}"\n\nComo posso ajudar você hoje?`;

  } catch (error) {
    console.error('❌ Erro ao gerar resposta IA:', error);
    return `Olá! Recebi sua mensagem: "${userMessage}"\n\nNo momento estou com dificuldades para processar sua solicitação, mas em breve retornarei com uma resposta mais elaborada.`;
  }
}

// Iniciar servidor com Socket.io
server.listen(PORT, () => {
  console.log('🚀 Servidor WhatsApp Web + OAuth 2.0 iniciado na porta', PORT);
  console.log('📱 WhatsApp Web API: Ativo');
  console.log('🔌 Socket.io: Ativo');
  console.log('🔑 Project ID:', process.env.VERTEX_AI_PROJECT_ID);
  console.log('🌍 Location:', process.env.VERTEX_AI_LOCATION);
  console.log('🌐 Servidor rodando em: http://localhost:' + PORT);
});

module.exports = { app, server, io };

