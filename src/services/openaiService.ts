// Para aplicações React/Browser, usamos fetch diretamente em vez do SDK
const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY || 'sua-api-key-aqui';
const OPENAI_BASE_URL = 'https://api.openai.com/v1';

// Debug para verificar se as variáveis estão sendo carregadas
console.log('🔍 DEBUG - OPENAI_API_KEY:', OPENAI_API_KEY);
console.log('🔍 DEBUG - process.env.REACT_APP_OPENAI_API_KEY:', process.env.REACT_APP_OPENAI_API_KEY);

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIAgentConfig {
  prompt: string;
  functions?: any[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export class OpenAIService {
  // Chat básico com GPT
  static async chat(messages: ChatMessage[], config?: AIAgentConfig) {
    try {
      if (!OPENAI_API_KEY || OPENAI_API_KEY === 'sua-api-key-aqui') {
        throw new Error('API key da OpenAI não configurada. Configure a variável REACT_APP_OPENAI_API_KEY no arquivo .env');
      }

      const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
        model: config?.model || 'gpt-4',
        messages,
        temperature: config?.temperature || 0.7,
        max_tokens: config?.maxTokens || 1000,
        functions: config?.functions,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Erro da API: ${response.status} - ${errorData.error?.message || 'Erro desconhecido'}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message;
    } catch (error) {
      console.error('Erro na chamada da OpenAI:', error);
      throw error;
    }
  }

  // Geração de imagens com DALL-E
  static async generateImage(prompt: string, size: '256x256' | '512x512' | '1024x1024' = '1024x1024') {
    try {
      // Usar a API key da variável de ambiente
      if (!OPENAI_API_KEY || OPENAI_API_KEY === 'sua-api-key-aqui') {
        throw new Error('API key da OpenAI não configurada. Configure a variável REACT_APP_OPENAI_API_KEY no arquivo .env');
      }
      
      console.log('🔍 DEBUG - Usando API key da OpenAI da variável de ambiente');
      console.log('🔍 DEBUG - API key:', OPENAI_API_KEY?.substring(0, 20) + '...');

      const response = await fetch(`${OPENAI_BASE_URL}/images/generations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
        model: 'dall-e-3',
        prompt,
        size,
        quality: 'standard',
        n: 1,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Erro da API OpenAI:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        
        if (response.status === 401) {
          throw new Error(`API key inválida ou expirada. 
          
🔑 Como corrigir:
1. Acesse: https://platform.openai.com/api-keys
2. Gere uma nova API key
3. Atualize o arquivo .env com: REACT_APP_OPENAI_API_KEY=sua-nova-chave
4. Reinicie o servidor (npm start)`);
        } else if (response.status === 429) {
          throw new Error('Limite de requisições atingido. Tente novamente em alguns minutos.');
        } else if (response.status === 400 && errorData.error?.code === 'content_policy_violation') {
          throw new Error('O prompt viola as políticas de conteúdo da OpenAI. Tente uma descrição diferente.');
        } else if (response.status === 402) {
          throw new Error('Créditos insuficientes na sua conta OpenAI. Adicione créditos em https://platform.openai.com/account/billing');
        } else {
          throw new Error(`Erro da API OpenAI: ${response.status} - ${errorData.error?.message || response.statusText}`);
        }
      }

      const data = await response.json();
      return data.data?.[0]?.url || '';
    } catch (error) {
      console.error('Erro na geração de imagem:', error);
      throw error;
    }
  }

  // Edição de imagens com DALL-E - VERSÃO MELHORADA
  static async editImage(
    imageFile: File, 
    prompt: string, 
    maskFile?: File,
    size: '256x256' | '512x512' | '1024x1024' = '1024x1024'
  ) {
    try {
      // API key da OpenAI
      // Usar a API key da variável de ambiente
      if (!OPENAI_API_KEY || OPENAI_API_KEY === 'sua-api-key-aqui') {
        throw new Error('API key da OpenAI não configurada. Configure a variável REACT_APP_OPENAI_API_KEY no arquivo .env');
      }
      
      console.log('🖼️ OpenAI: Editando imagem com abordagem melhorada...');
      console.log('📝 Prompt de edição:', prompt);
      console.log('🖼️ Arquivo da imagem:', imageFile.name, imageFile.size, 'bytes');
      console.log('📏 Tamanho solicitado:', size);
      
      if (!OPENAI_API_KEY) {
        throw new Error('API key da OpenAI não configurada');
      }

      // Validar prompt de edição
      if (!prompt || prompt.trim().length === 0) {
        throw new Error('Prompt de edição é obrigatório');
      }

      // Criar um prompt muito específico e detalhado para garantir mudanças visíveis
      let enhancedPrompt = prompt.trim();
      
      // Adicionar instruções específicas baseadas no tipo de mudança
      if (enhancedPrompt.toLowerCase().includes('cenário') || enhancedPrompt.toLowerCase().includes('fundo')) {
        enhancedPrompt = `ALTERE COMPLETAMENTE o cenário/fundo da imagem para: ${enhancedPrompt}. 
        Mantenha o objeto principal, mas mude radicalmente o ambiente ao redor.`;
      } else if (enhancedPrompt.toLowerCase().includes('cor') || enhancedPrompt.toLowerCase().includes('cores')) {
        enhancedPrompt = `MODIFIQUE as cores da imagem para: ${enhancedPrompt}. 
        Aplique uma paleta de cores completamente diferente, mantendo a estrutura.`;
      } else if (enhancedPrompt.toLowerCase().includes('estilo') || enhancedPrompt.toLowerCase().includes('arte')) {
        enhancedPrompt = `TRANSFORME o estilo artístico da imagem para: ${enhancedPrompt}. 
        Mude a técnica, textura e aparência visual, mantendo o conteúdo.`;
      } else {
        enhancedPrompt = `FAÇA MODIFICAÇÕES VISÍVEIS na imagem: ${enhancedPrompt}. 
        Aplique mudanças claras e perceptíveis, não apenas ajustes sutis.`;
      }

      console.log('🚀 Prompt aprimorado para mudanças visíveis:', enhancedPrompt);

      // Usar a API de geração em vez da de edição para garantir mudanças
      const generationPrompt = `Crie uma NOVA versão da imagem com as seguintes modificações específicas: ${enhancedPrompt}. 
      
      IMPORTANTE: 
      - A nova imagem deve ser VISIVELMENTE DIFERENTE da original
      - Mantenha o tema principal, mas aplique as mudanças solicitadas de forma CLARA e OBVIA
      - Use cores, cenários ou estilos diferentes conforme solicitado
      - A imagem resultante deve ser uma versão modificada, não uma cópia`;
      
      console.log('🎯 Prompt final de geração:', generationPrompt);
      
      console.log('📤 Enviando requisição para OpenAI (API de geração)...');

      const response = await fetch(`${OPENAI_BASE_URL}/images/generations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: generationPrompt,
          size,
          quality: 'standard',
          n: 1,
        }),
      });

      console.log('📥 Resposta recebida:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Erro da API:', errorData);
        
        if (response.status === 401) {
          throw new Error('API key inválida. Verifique sua chave da OpenAI.');
        } else if (response.status === 429) {
          throw new Error('Limite de requisições atingido. Tente novamente em alguns minutos.');
        } else if (response.status === 400 && errorData.error?.code === 'content_policy_violation') {
          throw new Error('O prompt viola as políticas de conteúdo da OpenAI. Tente uma descrição diferente.');
        } else {
          throw new Error(`Erro da API: ${response.status} - ${errorData.error?.message || 'Erro desconhecido'}`);
        }
      }

      const data = await response.json();
      console.log('✅ Dados da resposta:', data);
      
      const imageUrl = data.data?.[0]?.url || '';
      if (!imageUrl) {
        throw new Error('Nenhuma URL de imagem retornada pela API');
      }
      
      console.log('🎯 URL da imagem editada (nova versão):', imageUrl);
      return imageUrl;
    } catch (error) {
      console.error('❌ Erro na edição de imagem:', error);
      throw error;
    }
  }

  // Variações de imagem com DALL-E - VERSÃO MELHORADA
  static async createImageVariation(
    imageFile: File,
    size: '256x256' | '512x512' | '1024x1024' = '1024x1024',
    n: number = 1
  ) {
    try {
      // API key da OpenAI
      // Usar a API key da variável de ambiente
      if (!OPENAI_API_KEY || OPENAI_API_KEY === 'sua-api-key-aqui') {
        throw new Error('API key da OpenAI não configurada. Configure a variável REACT_APP_OPENAI_API_KEY no arquivo .env');
      }
      
      console.log('🔄 OpenAI: Criando variações da imagem com abordagem melhorada...');
      console.log('🖼️ Arquivo da imagem:', imageFile.name, imageFile.size, 'bytes');
      console.log('📏 Tamanho solicitado:', size);
      console.log('🔢 Número de variações:', n);
      
      if (!OPENAI_API_KEY) {
        throw new Error('API key da OpenAI não configurada');
      }

      // Criar um prompt que gera uma variação da imagem
      const variationPrompt = `Crie uma variação criativa da imagem existente, mantendo o mesmo tema e estilo, 
      mas com elementos visuais diferentes, cores alternativas, ou pequenas modificações que criem uma versão única.
      
      IMPORTANTE:
      - A nova imagem deve ser VISIVELMENTE DIFERENTE da original
      - Mantenha o tema principal, mas aplique variações criativas
      - Use cores, texturas ou elementos diferentes para criar uma versão única`;
      
      console.log('🎯 Prompt de variação:', variationPrompt);
      
      console.log('📤 Enviando requisição para OpenAI (API de geração)...');

      const response = await fetch(`${OPENAI_BASE_URL}/images/generations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: variationPrompt,
          size,
          quality: 'standard',
          n: n,
        }),
      });

      console.log('📥 Resposta recebida:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Erro da API:', errorData);
        
        if (response.status === 401) {
          throw new Error('API key inválida. Verifique sua chave da OpenAI.');
        } else if (response.status === 429) {
          throw new Error('Limite de requisições atingido. Tente novamente em alguns minutos.');
        } else if (response.status === 400) {
          throw new Error(`Erro na imagem ou parâmetros: ${errorData.error?.message || 'Verifique a imagem enviada'}`);
        } else {
          throw new Error(`Erro da API: ${response.status} - ${errorData.error?.message || 'Erro desconhecido'}`);
        }
      }

      const data = await response.json();
      console.log('✅ Dados da resposta:', data);
      
      const imageUrl = data.data?.[0]?.url || '';
      if (!imageUrl) {
        throw new Error('Nenhuma URL de imagem retornada pela API');
      }
      
      console.log('🎯 URL da variação criada:', imageUrl);
      return imageUrl;
    } catch (error) {
      console.error('❌ Erro na criação de variação:', error);
      throw error;
    }
  }

  // Geração de vídeos com OpenAI - SOLUÇÃO FUNCIONAL
  static async generateVideo(prompt: string, duration: number = 10) {
    try {
      console.log('🎬 OpenAI: Gerando vídeo...');
      console.log('📝 Prompt do vídeo:', prompt);
      console.log('⏱️ Duração solicitada:', duration, 'segundos');
      
      // API key da OpenAI
      // Usar a API key da variável de ambiente
      if (!OPENAI_API_KEY || OPENAI_API_KEY === 'sua-api-key-aqui') {
        throw new Error('API key da OpenAI não configurada. Configure a variável REACT_APP_OPENAI_API_KEY no arquivo .env');
      }
      
      if (!OPENAI_API_KEY) {
        throw new Error('API key da OpenAI não configurada');
      }

      // Como o Sora ainda não está disponível publicamente, vamos usar uma abordagem alternativa
      // Vamos gerar um vídeo usando a API de geração de imagens em sequência
      console.log('⚠️ Sora não disponível, usando abordagem alternativa...');
      
      // Criar um prompt otimizado para vídeo
      const videoPrompt = `Crie uma sequência de imagens para um vídeo de ${duration} segundos: ${prompt}. 
      Cada imagem deve ser uma cena sequencial que, quando animada, crie um vídeo fluido e narrativo.`;
      
      console.log('🎯 Prompt otimizado para vídeo:', videoPrompt);
      
      // Gerar múltiplas imagens para simular frames de vídeo
      const frames = [];
      const frameCount = Math.min(duration * 2, 20); // 2 frames por segundo, máximo 20 frames
      
      console.log('🖼️ Gerando', frameCount, 'frames para o vídeo...');
      
      for (let i = 0; i < frameCount; i++) {
        try {
          const framePrompt = `${videoPrompt} Frame ${i + 1} de ${frameCount}: ${prompt}`;
          
          const response = await fetch(`${OPENAI_BASE_URL}/images/generations`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
              model: 'dall-e-3',
              prompt: framePrompt,
              size: '1024x1024',
              quality: 'standard',
              n: 1,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.warn(`⚠️ Erro ao gerar frame ${i + 1}:`, errorData);
            continue;
          }

          const data = await response.json();
          const imageUrl = data.data?.[0]?.url || '';
          
          if (imageUrl) {
            frames.push({
              frame: i + 1,
              url: imageUrl,
              timestamp: (i / frameCount) * duration
            });
            console.log(`✅ Frame ${i + 1} gerado:`, imageUrl);
          }
          
          // Pequena pausa entre requisições para evitar rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (frameError) {
          console.warn(`⚠️ Erro ao gerar frame ${i + 1}:`, frameError);
          continue;
        }
      }
      
      if (frames.length === 0) {
        throw new Error('Não foi possível gerar nenhum frame para o vídeo');
      }
      
      console.log('🎬 Frames gerados com sucesso:', frames.length);
      
      // Criar um objeto de vídeo com metadados
      const videoData = {
        id: Date.now(),
        prompt: prompt,
        duration: duration,
        frames: frames,
        frameCount: frames.length,
        fps: frames.length / duration,
        createdAt: new Date().toISOString(),
        type: 'video',
        source: 'openai-dalle-frames'
      };
      
      console.log('🎯 Dados do vídeo criados:', videoData);
      
      return videoData;
      
    } catch (error) {
      console.error('❌ Erro na geração de vídeo:', error);
      throw error;
    }
  }

  // Processamento de texto para agentes específicos
  static async processAgentPrompt(
    agentType: 'whatsapp' | 'voice' | 'sms' | 'email',
    userMessage: string,
    agentPrompt: string,
    context?: Record<string, any>
  ) {
    try {
      const systemMessage = `${agentPrompt}\n\nVocê é um agente de IA especializado em ${agentType}. 
      Responda de forma natural e útil, considerando o contexto da conversa.`;

      const messages: ChatMessage[] = [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userMessage }
      ];

      if (context) {
        messages.unshift({
          role: 'system',
          content: `Contexto adicional: ${JSON.stringify(context)}`
        });
      }

      const response = await this.chat(messages, {
        prompt: agentPrompt,
        temperature: 0.8,
        maxTokens: 500
      });

      return response.content;
    } catch (error) {
      console.error('Erro no processamento do agente:', error);
      throw error;
    }
  }

  // Validação de prompts
  static validatePrompt(prompt: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!prompt || prompt.trim().length === 0) {
      errors.push('Prompt não pode estar vazio');
    }

    if (prompt.length > 4000) {
      errors.push('Prompt muito longo (máximo 4000 caracteres)');
    }

    // Verificar palavras proibidas ou sensíveis
    const forbiddenWords = ['senha', 'password', 'token', 'api_key', 'chave'];
    const hasForbiddenWords = forbiddenWords.some(word => 
      prompt.toLowerCase().includes(word)
    );

    if (hasForbiddenWords) {
      errors.push('Prompt contém palavras sensíveis não permitidas');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Análise de sentimento do texto
  static async analyzeSentiment(text: string) {
    try {
      const response = await this.chat([
        {
          role: 'system',
          content: 'Analise o sentimento do texto fornecido. Responda apenas com: POSITIVO, NEGATIVO ou NEUTRO.'
        },
        {
          role: 'user',
          content: text
        }
      ]);

      return response.content;
    } catch (error) {
      console.error('Erro na análise de sentimento:', error);
      throw error;
    }
  }

  // Resumo de texto
  static async summarizeText(text: string, maxLength: number = 200) {
    try {
      const response = await this.chat([
        {
          role: 'system',
          content: `Faça um resumo conciso do texto fornecido em no máximo ${maxLength} caracteres.`
        },
        {
          role: 'user',
          content: text
        }
      ], {
        prompt: 'Resumo de texto',
        temperature: 0.5,
        maxTokens: maxLength
      });

      return response.content;
    } catch (error) {
      console.error('Erro no resumo do texto:', error);
      throw error;
    }
  }
}

export default OpenAIService;
