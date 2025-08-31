// Serviço para geração de imagens usando APIs gratuitas
export class FreeImageService {
  
  // Usar Pollinations.ai - API gratuita para geração de imagens
  static async generateImage(prompt: string, size: '256x256' | '512x512' | '1024x1024' = '1024x1024') {
    try {
      // Pollinations.ai é uma API gratuita que gera imagens reais baseadas em texto
      const dimensions = size.split('x');
      const width = parseInt(dimensions[0]);
      const height = parseInt(dimensions[1]);
      
      // Limpar e preparar o prompt
      const cleanPrompt = prompt.replace(/[^a-zA-Z0-9\s]/g, '').trim();
      const encodedPrompt = encodeURIComponent(cleanPrompt);
      
      // Gerar URL da Pollinations
      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${Math.floor(Math.random() * 1000000)}`;
      
      console.log('🎨 FreeImageService: URL gerada:', imageUrl);
      console.log('🎨 FreeImageService: Prompt usado:', cleanPrompt);
      
      // Testar se a URL é válida fazendo uma requisição HEAD
      try {
        const response = await fetch(imageUrl, { method: 'HEAD' });
        if (response.ok) {
          return imageUrl;
        } else {
          throw new Error('Serviço de imagem não disponível');
        }
      } catch (error) {
        // Se Pollinations falhar, usar outro serviço
        return this.generateImageFallback(prompt, size);
      }
      
    } catch (error) {
      console.error('Erro na geração de imagem gratuita:', error);
      return this.generateImageFallback(prompt, size);
    }
  }
  
  // Fallback usando outro serviço gratuito
  static generateImageFallback(prompt: string, size: '256x256' | '512x512' | '1024x1024') {
    const dimensions = size.split('x');
    const width = dimensions[0];
    const height = dimensions[1];
    
    // Usar ThisPersonDoesNotExist style API ou similar
    const seed = prompt.replace(/\s+/g, '').toLowerCase().substring(0, 20);
    return `https://picsum.photos/seed/${seed}/${width}/${height}`;
  }
  
  // Validação de prompt para serviços gratuitos
  static validatePrompt(prompt: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!prompt || prompt.trim().length === 0) {
      errors.push('Prompt não pode estar vazio');
    }

    if (prompt.length > 500) {
      errors.push('Prompt muito longo (máximo 500 caracteres para serviços gratuitos)');
    }

    // Verificar palavras que podem não funcionar bem em APIs gratuitas
    const problematicWords = ['nude', 'sexual', 'violence', 'weapon', 'drug'];
    const hasProblematicWords = problematicWords.some(word => 
      prompt.toLowerCase().includes(word)
    );

    if (hasProblematicWords) {
      errors.push('Prompt pode não funcionar em serviços gratuitos');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default FreeImageService;

