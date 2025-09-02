// Serviço para integração com Google Gemini
const GEMINI_API_KEY = 'AIzaSyCO0-ePTIhKA5BIV8TPSurLt-Xscdn2zak';
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

export interface GeminiImageRequest {
  prompt: string;
  aspectRatio?: 'ASPECT_RATIO_1_1' | 'ASPECT_RATIO_16_9' | 'ASPECT_RATIO_9_16';
  safetySettings?: Array<{
    category: string;
    threshold: string;
  }>;
}

export class GeminiService {
  // Geração de imagens com Gemini (NOTA: Gemini não suporta geração de imagens ainda)
  // Esta função usa o Gemini para gerar uma descrição detalhada e depois usa uma API de placeholder
  static async generateImage(prompt: string, size: '256x256' | '512x512' | '1024x1024' = '1024x1024') {
    try {
      if (!GEMINI_API_KEY) {
        throw new Error('API key do Gemini não configurada');
      }

      console.log('🔍 Gemini: Gerando descrição melhorada para:', prompt);

      // Usar Gemini para melhorar a descrição da imagem
      const enhancedDescription = await this.chat(
        `Melhore esta descrição de imagem para ser mais detalhada e visual: "${prompt}". 
         Responda apenas com a descrição melhorada, sem explicações adicionais.`,
        'gemini-1.5-flash'
      );

      console.log('✨ Gemini: Descrição melhorada:', enhancedDescription);

      // Como o Gemini não suporta geração de imagens ainda, usamos uma API de placeholder
      // mas com a descrição melhorada pelo Gemini
      const dimensions = size.split('x');
      const width = dimensions[0];
      const height = dimensions[1];
      
      // Usar Picsum (mais confiável) com seed baseado no prompt para consistência
      const seed = prompt.replace(/\s+/g, '').toLowerCase().substring(0, 20);
      const placeholderUrl = `https://picsum.photos/seed/${seed}/${width}/${height}`;
      
      console.log('🎨 Gemini: URL gerada:', placeholderUrl);
      return placeholderUrl;
      
    } catch (error) {
      console.error('Erro na geração de imagem com Gemini:', error);
      
      // Fallback para placeholder simples se o Gemini falhar
      const dimensions = size.split('x');
      const width = dimensions[0];
      const height = dimensions[1];
      const seed = 'gemini-error-' + Math.random().toString(36).substring(7);
      return `https://picsum.photos/seed/${seed}/${width}/${height}`;
    }
  }

  // Chat com Gemini
  static async chat(prompt: string, model: string = 'gemini-1.5-flash') {
    try {
      if (!GEMINI_API_KEY) {
        throw new Error('API key do Gemini não configurada');
      }

      const response = await fetch(`${GEMINI_BASE_URL}/models/${model}:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Erro da API Gemini: ${response.status} - ${errorData.error?.message || 'Erro desconhecido'}`);
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
    } catch (error) {
      console.error('Erro no chat com Gemini:', error);
      throw error;
    }
  }

  // Geração de vídeo com Gemini Veo 3 Flow
  static async generateVideo(prompt: string, duration: number = 10) {
    try {
      console.log('🎬 Gemini: Gerando vídeo com Veo 3 Flow...');
      console.log('📝 Prompt do vídeo:', prompt);
      console.log('⏱️ Duração solicitada:', duration, 'segundos');
      
      if (!GEMINI_API_KEY) {
        throw new Error('API key do Gemini não configurada');
      }

      // Usar Gemini para melhorar o prompt do vídeo
      const enhancedPrompt = await this.chat(
        `Melhore esta descrição para geração de vídeo com Veo 3 Flow: "${prompt}". 
         Torne-a mais detalhada, visual e cinematográfica. 
         Responda apenas com a descrição melhorada, sem explicações.`,
        'gemini-1.5-flash'
      );

      console.log('✨ Gemini: Prompt melhorado:', enhancedPrompt);

      // API do Veo 3 Flow (Google AI Studio)
      const veoApiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/veo-3-flow:generateContent';
      
      const response = await fetch(`${veoApiUrl}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: enhancedPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Erro da API Veo 3 Flow:', errorData);
        
        if (response.status === 400) {
          throw new Error('Prompt não é adequado para geração de vídeo. Tente uma descrição diferente.');
        } else if (response.status === 429) {
          throw new Error('Limite de requisições atingido. Tente novamente em alguns minutos.');
        } else {
          throw new Error(`Erro da API: ${response.status} - ${errorData.error?.message || 'Erro desconhecido'}`);
        }
      }

      const data = await response.json();
      console.log('✅ Resposta da API Veo 3 Flow:', data);

      // Extrair o vídeo da resposta
      const videoContent = data.candidates?.[0]?.content?.parts?.find((part: any) => part.inlineData?.mimeType?.startsWith('video/'));
      
      if (!videoContent?.inlineData) {
        throw new Error('Nenhum vídeo foi gerado pela API Veo 3 Flow');
      }

      // Converter base64 para blob
      const videoBlob = new Blob(
        [Uint8Array.from(atob(videoContent.inlineData.data), c => c.charCodeAt(0))],
        { type: videoContent.inlineData.mimeType }
      );

      // Criar URL do blob
      const videoUrl = URL.createObjectURL(videoBlob);

      // Criar objeto de vídeo compatível
      const videoData = {
        id: Date.now(),
        prompt: enhancedPrompt,
        duration: duration,
        url: videoUrl,
        mimeType: videoContent.inlineData.mimeType,
        size: videoBlob.size,
        createdAt: new Date().toISOString(),
        source: 'gemini-veo-3-flow'
      };

      console.log('🎬 Vídeo gerado com sucesso:', videoData);
      return videoData;

    } catch (error) {
      console.error('❌ Erro na geração de vídeo com Gemini:', error);
      
      // Se a API do Veo 3 Flow falhar, tentar abordagem alternativa
      console.log('⚠️ Tentando abordagem alternativa...');
      
      try {
        // Usar Gemini para criar um storyboard e simular vídeo
        const storyboardPrompt = `Crie um storyboard detalhado para um vídeo de ${duration} segundos baseado em: "${prompt}". 
         Descreva cada cena em detalhes visuais.`;
        
        const storyboard = await this.chat(storyboardPrompt, 'gemini-1.5-flash');
        console.log('📋 Storyboard criado:', storyboard);
        
        // Criar um vídeo placeholder baseado no storyboard
        const placeholderVideo = {
          id: Date.now(),
          prompt: prompt,
          duration: duration,
          url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4', // Placeholder
          thumbnail: `https://picsum.photos/seed/${prompt.substring(0, 20)}/480/270`,
          storyboard: storyboard,
          createdAt: new Date().toISOString(),
          source: 'gemini-storyboard-placeholder'
        };
        
        return placeholderVideo;
        
      } catch (fallbackError) {
        console.error('❌ Fallback também falhou:', fallbackError);
        throw new Error('Não foi possível gerar vídeo com Gemini. Tente novamente.');
      }
    }
  }

  // Edição de imagem com Gemini 2.5 Flash
  static async editImage(imageBase64: string, editPrompt: string) {
    try {
      if (!GEMINI_API_KEY) {
        throw new Error('API key do Gemini não configurada');
      }

      console.log('🎨 Gemini 2.5 Flash: Analisando imagem para edição...');

      // Usar Gemini 2.5 Flash para analisar a imagem e gerar instruções de edição
      const analysisPrompt = `Analise esta imagem e crie instruções detalhadas de edição baseadas nesta solicitação: "${editPrompt}".
      
      Forneça:
      1. Descrição atual da imagem
      2. Modificações específicas necessárias
      3. Prompt otimizado para regenerar a imagem com as edições
      
      Responda em formato JSON:
      {
        "currentDescription": "descrição atual",
        "modifications": "modificações necessárias",
        "editedPrompt": "prompt otimizado para regenerar"
      }`;

      const response = await fetch(`${GEMINI_BASE_URL}/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: analysisPrompt
              },
              {
                inlineData: {
                  mimeType: 'image/jpeg',
                  data: imageBase64.replace('data:image/jpeg;base64,', '').replace('data:image/png;base64,', '')
                }
              }
            ]
          }]
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Erro da API Gemini 2.5 Flash: ${response.status} - ${errorData.error?.message || 'Erro desconhecido'}`);
      }

      const data = await response.json();
      const analysisText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      console.log('🔍 Análise do Gemini 2.5 Flash:', analysisText);

      // Tentar extrair JSON da resposta
      let analysisResult;
      try {
        // Procurar por JSON na resposta
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysisResult = JSON.parse(jsonMatch[0]);
        } else {
          // Se não encontrar JSON, criar estrutura baseada no texto
          analysisResult = {
            currentDescription: "Imagem analisada pelo Gemini",
            modifications: editPrompt,
            editedPrompt: `${analysisText} ${editPrompt}`
          };
        }
      } catch (parseError) {
        // Fallback se não conseguir parsear JSON
        analysisResult = {
          currentDescription: "Imagem analisada pelo Gemini",
          modifications: editPrompt,
          editedPrompt: `${analysisText} ${editPrompt}`
        };
      }

      return {
        success: true,
        analysis: analysisResult,
        editedPrompt: analysisResult.editedPrompt,
        originalAnalysis: analysisText
      };
      
    } catch (error) {
      console.error('Erro na edição de imagem com Gemini 2.5 Flash:', error);
      throw error;
    }
  }
  static async analyzeImage(imageBase64: string, prompt: string = 'Descreva esta imagem') {
    try {
      if (!GEMINI_API_KEY) {
        throw new Error('API key do Gemini não configurada');
      }

      const response = await fetch(`${GEMINI_BASE_URL}/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: prompt
              },
              {
                inlineData: {
                  mimeType: 'image/jpeg',
                  data: imageBase64.replace('data:image/jpeg;base64,', '').replace('data:image/png;base64,', '')
                }
              }
            ]
          }]
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Erro da API Gemini Vision: ${response.status} - ${errorData.error?.message || 'Erro desconhecido'}`);
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
    } catch (error) {
      console.error('Erro na análise de imagem com Gemini:', error);
      throw error;
    }
  }

  // Validação de prompt para Gemini
  static validatePrompt(prompt: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!prompt || prompt.trim().length === 0) {
      errors.push('Prompt não pode estar vazio');
    }

    if (prompt.length > 2000) {
      errors.push('Prompt muito longo (máximo 2000 caracteres para Gemini)');
    }

    // Palavras que podem violar políticas do Gemini
    const restrictedWords = ['violência', 'arma', 'droga', 'nudez', 'sexual'];
    const hasRestrictedWords = restrictedWords.some(word => 
      prompt.toLowerCase().includes(word)
    );

    if (hasRestrictedWords) {
      errors.push('Prompt pode violar as políticas de segurança do Gemini');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default GeminiService;
