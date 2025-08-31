// Serviço para integração com Leonardo.ai
const LEONARDO_API_KEY = '758abaac-48b3-427c-b0b7-2651244706a5';
const LEONARDO_BASE_URL = 'https://cloud.leonardo.ai/api/rest/v1';

export interface LeonardoModel {
  id: string;
  name: string;
  description: string;
}

export interface LeonardoStyle {
  uuid: string;
  name: string;
  description: string;
}

export class LeonardoService {
  
  // Modelos disponíveis
  static readonly MODELS: LeonardoModel[] = [
    {
      id: '7b592283-e8a7-4c5a-9ba6-d18c31f258b9',
      name: 'Lucid Origin',
      description: 'Modelo padrão de alta qualidade'
    }
  ];

  // Estilos disponíveis
  static readonly STYLES: LeonardoStyle[] = [
    { uuid: '9fdc5e8c-4d13-49b4-9ce6-5a74cbb19177', name: 'Bokeh', description: 'Efeito de desfoque artístico' },
    { uuid: 'a5632c7c-ddbb-4e2f-ba34-8456ab3ac436', name: 'Cinematic', description: 'Estilo cinematográfico' },
    { uuid: 'cc53f935-884c-40a0-b7eb-1f5c42821fb5', name: 'Cinematic Close-Up', description: 'Close-up cinematográfico' },
    { uuid: '6fedbf1f-4a17-45ec-84fb-92fe524a29ef', name: 'Creative', description: 'Estilo criativo e artístico' },
    { uuid: '111dc692-d470-4eec-b791-3475abac4c46', name: 'Dynamic', description: 'Dinâmico e energético' },
    { uuid: '594c4a08-a522-4e0e-b7ff-e4dac4b6b622', name: 'Fashion', description: 'Estilo de moda' },
    { uuid: '85da2dcc-c373-464c-9a7a-5624359be859', name: 'Film', description: 'Estilo de filme analógico' },
    { uuid: 'd574325d-1278-4fe2-974b-768525f253c3', name: 'Food', description: 'Fotografia de comida' },
    { uuid: '97c20e5c-1af6-4d42-b227-54d03d8f0727', name: 'HDR', description: 'Alto contraste dinâmico' },
    { uuid: '335e6010-a75c-45d9-afc5-032c65e9180e', name: 'Long Exposure', description: 'Longa exposição' },
    { uuid: '30c1d34f-e3a9-479a-b56f-c018bbc9c02a', name: 'Macro', description: 'Fotografia macro' },
    { uuid: 'cadc8cd6-7838-4c99-b645-df76be8ba8d8', name: 'Minimalist', description: 'Estilo minimalista' },
    { uuid: 'a2f7ea66-959b-4bbe-b508-6133238b76b6', name: 'Monochrome', description: 'Preto e branco' },
    { uuid: '621e1c9a-6319-4bee-a12d-ae40659162fa', name: 'Moody', description: 'Atmosférico e dramático' },
    { uuid: '0d914779-c822-430a-b976-30075033f1c4', name: 'Neutral', description: 'Estilo neutro' },
    { uuid: '556c1ee5-ec38-42e8-955a-1e82dad0ffa1', name: 'None', description: 'Sem estilo específico' },
    { uuid: '8e2bc543-6ee2-45f9-bcd9-594b6ce84dcd', name: 'Portrait', description: 'Retrato profissional' },
    { uuid: '6105baa2-851b-446e-9db5-08a671a8c42f', name: 'Retro', description: 'Estilo retrô/vintage' },
    { uuid: '5bdc3f2a-1be6-4d1c-8e77-992a30824a2c', name: 'Stock Photo', description: 'Foto profissional' },
    { uuid: '62736842-6e4b-4028-b79a-4f1a1606e893', name: 'Unprocessed', description: 'Sem processamento' },
    { uuid: 'dee282d3-891f-4f73-ba02-7f8131e5541b', name: 'Vibrant', description: 'Cores vibrantes' }
  ];

  // Geração de imagens com Leonardo.ai
  static async generateImage(
    prompt: string, 
    size: '256x256' | '512x512' | '1024x1024' = '1024x1024',
    style: string = 'Dynamic',
    contrast: number = 3.5,
    numImages: number = 1,
    ultra: boolean = false
  ) {
    try {
      if (!LEONARDO_API_KEY) {
        throw new Error('API key do Leonardo.ai não configurada');
      }

      // Mapear tamanho para dimensões
      const dimensions = size.split('x');
      const width = parseInt(dimensions[0]);
      const height = parseInt(dimensions[1]);

      // Encontrar UUID do estilo
      const selectedStyle = this.STYLES.find(s => s.name === style);
      const styleUUID = selectedStyle?.uuid || this.STYLES[0].uuid; // Default para primeiro estilo

      console.log('🎨 Leonardo: Gerando imagem com:', {
        prompt,
        width,
        height,
        style: selectedStyle?.name || 'Dynamic',
        contrast
      });

      const requestBody = {
        alchemy: false,
        height: height,
        modelId: this.MODELS[0].id, // Usando Lucid Origin
        contrast: contrast,
        num_images: numImages,
        styleUUID: styleUUID,
        prompt: prompt,
        width: width,
        ultra: ultra
      };

      const response = await fetch(`${LEONARDO_BASE_URL}/generations`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'authorization': `Bearer ${LEONARDO_API_KEY}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 401) {
          throw new Error('API key do Leonardo.ai inválida. Verifique sua chave.');
        } else if (response.status === 429) {
          throw new Error('Limite de requisições do Leonardo.ai atingido. Tente novamente em alguns minutos.');
        } else if (response.status === 400) {
          throw new Error(`Erro no prompt ou parâmetros: ${errorData.error || 'Verifique a descrição da imagem'}`);
        } else {
          throw new Error(`Erro da API Leonardo.ai: ${response.status} - ${errorData.error || 'Erro desconhecido'}`);
        }
      }

      const data = await response.json();
      
      // Leonardo.ai retorna um ID de geração, precisamos buscar a imagem depois
      if (data.sdGenerationJob && data.sdGenerationJob.generationId) {
        const generationId = data.sdGenerationJob.generationId;
        console.log('🔄 Leonardo: Aguardando geração...', generationId);
        
        // Aguardar mais tempo para a geração completar
        await new Promise(resolve => setTimeout(resolve, 15000)); // 15 segundos
        
        return await this.getGeneratedImage(generationId);
      }
      
      throw new Error('Erro na resposta da API Leonardo.ai');
      
    } catch (error) {
      console.error('Erro na geração de imagem com Leonardo.ai:', error);
      throw error;
    }
  }

  // Buscar imagem gerada pelo ID com retry automático
  static async getGeneratedImage(generationId: string, maxRetries: number = 3): Promise<string> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Leonardo: Tentativa ${attempt}/${maxRetries} - Buscando imagem...`);
        
        const response = await fetch(`${LEONARDO_BASE_URL}/generations/${generationId}`, {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'authorization': `Bearer ${LEONARDO_API_KEY}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Erro ao buscar imagem: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.generations_by_pk && data.generations_by_pk.generated_images && data.generations_by_pk.generated_images.length > 0) {
          const imageUrl = data.generations_by_pk.generated_images[0].url;
          console.log('✅ Leonardo: Imagem gerada com sucesso:', imageUrl);
          return imageUrl;
        }
        
        // Se não tem imagem ainda e não é a última tentativa, aguardar mais
        if (attempt < maxRetries) {
          console.log('⏰ Leonardo: Imagem ainda processando, aguardando mais 5 segundos...');
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
        
      } catch (error) {
        console.error(`❌ Leonardo: Erro na tentativa ${attempt}:`, error);
        
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Aguardar antes da próxima tentativa
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    
    throw new Error('Imagem não foi gerada após múltiplas tentativas');
  }

  // Edição de imagem com Leonardo.ai (Image to Image)
  static async editImage(
    imageFile: File,
    prompt: string, 
    size: '256x256' | '512x512' | '1024x1024' = '1024x1024',
    style: string = 'Dynamic',
    strength: number = 0.7
  ) {
    try {
      if (!LEONARDO_API_KEY) {
        throw new Error('API key do Leonardo.ai não configurada');
      }

      console.log('🖼️ Leonardo: Editando imagem com prompt:', prompt);

      // Primeiro, fazer upload da imagem
      const uploadedImageId = await this.uploadImage(imageFile);
      
      // Mapear tamanho para dimensões
      const dimensions = size.split('x');
      const width = parseInt(dimensions[0]);
      const height = parseInt(dimensions[1]);

      // Encontrar UUID do estilo
      const selectedStyle = this.STYLES.find(s => s.name === style);
      const styleUUID = selectedStyle?.uuid || this.STYLES[0].uuid;

      const requestBody = {
        height: height,
        width: width,
        modelId: this.MODELS[0].id,
        prompt: prompt,
        init_image_id: uploadedImageId,
        init_strength: strength, // 0.1-1.0, quanto menor mais próximo da original
        num_images: 1,
        styleUUID: styleUUID,
        guidance_scale: 7,
        scheduler: 'LEONARDO',
        seed: Math.floor(Math.random() * 1000000)
      };

      const response = await fetch(`${LEONARDO_BASE_URL}/generations`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'authorization': `Bearer ${LEONARDO_API_KEY}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Erro da API Leonardo.ai: ${response.status} - ${errorData.error || 'Erro desconhecido'}`);
      }

      const data = await response.json();
      
      if (data.sdGenerationJob && data.sdGenerationJob.generationId) {
        const generationId = data.sdGenerationJob.generationId;
        console.log('🔄 Leonardo: Aguardando edição da imagem...', generationId);
        
        // Aguardar mais tempo para a edição completar
        await new Promise(resolve => setTimeout(resolve, 20000)); // 20 segundos para edição
        
        return await this.getGeneratedImage(generationId);
      }
      
      throw new Error('Erro na resposta da API Leonardo.ai');
      
    } catch (error) {
      console.error('Erro na edição de imagem com Leonardo.ai:', error);
      throw error;
    }
  }

  // Upload de imagem para Leonardo.ai
  static async uploadImage(imageFile: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('files', imageFile);

      const response = await fetch(`${LEONARDO_BASE_URL}/init-image`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'authorization': `Bearer ${LEONARDO_API_KEY}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Erro no upload: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.uploadInitImage && data.uploadInitImage.length > 0) {
        const imageId = data.uploadInitImage[0].id;
        console.log('📤 Leonardo: Imagem enviada com sucesso:', imageId);
        return imageId;
      }
      
      throw new Error('Erro no upload da imagem');
      
    } catch (error) {
      console.error('Erro no upload da imagem:', error);
      throw error;
    }
  }

  // Validação de prompt para Leonardo.ai
  static validatePrompt(prompt: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!prompt || prompt.trim().length === 0) {
      errors.push('Prompt não pode estar vazio');
    }

    if (prompt.length > 1000) {
      errors.push('Prompt muito longo (máximo 1000 caracteres para Leonardo.ai)');
    }

    // Leonardo.ai tem políticas de conteúdo
    const restrictedWords = ['nude', 'sexual', 'violence', 'weapon', 'drug', 'gore'];
    const hasRestrictedWords = restrictedWords.some(word => 
      prompt.toLowerCase().includes(word)
    );

    if (hasRestrictedWords) {
      errors.push('Prompt pode violar as políticas de conteúdo do Leonardo.ai');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Listar estilos disponíveis
  static getAvailableStyles(): LeonardoStyle[] {
    return this.STYLES;
  }

  // Obter estilo por nome
  static getStyleByName(name: string): LeonardoStyle | undefined {
    return this.STYLES.find(style => style.name === name);
  }
}

export default LeonardoService;
