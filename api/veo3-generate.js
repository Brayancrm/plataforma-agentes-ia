// Vercel Function para gerar vídeos com Veo 3 via fal.ai
// Integração com a API real da fal.ai que oferece Veo 3



export default async function handler(req, res) {
  // Configurar CORS para aceitar qualquer domínio Vercel
  const origin = req.headers.origin;
  if (origin && (origin.includes('vercel.app') || origin.includes('localhost'))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Start-Time, Authorization');

  // Responder a preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Apenas aceitar POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    console.log('🎬 Iniciando geração Veo 3 via serverless...');
    
    const { prompt, duration, quality, style, mode } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ 
        error: 'Prompt é obrigatório',
        success: false 
      });
    }

    // Obter API Key da fal.ai das variáveis de ambiente
    const falApiKey = process.env.FAL_API_KEY;
    
    if (!falApiKey) {
      return res.status(500).json({ 
        error: 'fal.ai API Key não configurada',
        success: false 
      });
    }

    console.log('🔑 Usando fal.ai API Key para autenticação...');

    // Configurar requisição para fal.ai Veo 3 
    // URL correta da fal.ai para Veo 3 (baseado na documentação oficial)
    const falApiUrl = 'https://fal.run/fal-ai/veo3';
    const requestBody = {
      prompt: prompt,
      aspect_ratio: quality === 'high' ? '16:9' : '9:16',
      duration: duration === '5' ? '8s' : '8s', // fal.ai só suporta 8s
      enhance_prompt: true,
      auto_fix: true,
      resolution: quality === 'high' ? '1080p' : '720p',
      generate_audio: true
    };

    console.log('📤 Enviando requisição para fal.ai Veo 3:', {
      url: falApiUrl,
      prompt: prompt.substring(0, 100) + '...',
      aspect_ratio: requestBody.aspect_ratio,
      duration: requestBody.duration,
      resolution: requestBody.resolution
    });

    // Fazer chamada real para fal.ai API
    const response = await fetch(falApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${falApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    console.log('📡 Resposta da fal.ai:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Erro da fal.ai:', {
        status: response.status,
        error: errorData
      });

      let errorMessage = 'Erro desconhecido da fal.ai';
      
      if (response.status === 401) {
        errorMessage = 'API Key da fal.ai inválida ou expirada';
      } else if (response.status === 429) {
        errorMessage = 'Limite de requisições atingido na fal.ai. Tente novamente em alguns minutos.';
      } else if (response.status === 400) {
        errorMessage = 'Prompt inválido ou parâmetros incorretos';
      } else if (response.status === 402) {
        errorMessage = 'Créditos insuficientes na conta fal.ai';
      }

      return res.status(response.status).json({
        success: false,
        error: errorMessage,
        details: errorData,
        status: response.status,
        provider: 'fal.ai'
      });
    }

    const result = await response.json();
    console.log('✅ Resposta da fal.ai Veo 3 recebida:', result);

    // Retornar resposta formatada baseada na documentação oficial
    return res.status(200).json({
      success: true,
      videoUrl: result.video?.url,
      thumbnailUrl: `https://picsum.photos/480/270?random=${Date.now()}`, // Thumbnail placeholder
      requestId: result.request_id || `fal_veo3_${Date.now()}`,
      status: 'completed',
      provider: 'fal.ai',
      model: 'veo3',
      generationTime: Date.now() - new Date(req.headers['x-start-time'] || Date.now()).getTime(),
      metadata: {
        prompt: prompt,
        aspect_ratio: requestBody.aspect_ratio,
        duration: requestBody.duration,
        resolution: requestBody.resolution
      }
    });



  } catch (error) {
    console.error('❌ Erro interno na função Veo 3:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message,
      type: 'INTERNAL_ERROR'
    });
  }
}
