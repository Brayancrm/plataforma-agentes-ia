const express = require('express');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Configurações OAuth 2.0
const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Armazenar tokens (em produção, use banco de dados)
let accessToken = null;
let refreshToken = null;

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

// Iniciar servidor
app.listen(PORT, () => {
  console.log('🚀 Servidor OAuth 2.0 iniciado na porta', PORT);
  console.log('🔑 Project ID:', process.env.VERTEX_AI_PROJECT_ID);
  console.log('🌍 Location:', process.env.VERTEX_AI_LOCATION);
  console.log('📝 Configure as variáveis de ambiente em .env');
  console.log('🌐 Servidor rodando em: http://localhost:' + PORT);
});

module.exports = app;

