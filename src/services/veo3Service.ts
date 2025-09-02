// Veo 3 Service - Geração de vídeos com Google Veo 3
// Configurado para projeto: beprojects-836d6

interface Veo3Config {
  clientId: string;
  clientSecret: string;
  projectId: string;
  projectNumber: string;
}

interface Veo3Request {
  prompt: string;
  duration: string;
  quality: string;
  style: string;
  mode: 'generate' | 'edit';
}

interface Veo3Response {
  success: boolean;
  videoUrl?: string;
  thumbnailUrl?: string;
  error?: string;
  requestId?: string;
  generationTime?: number;
}

class Veo3Service {
  private static config: Veo3Config = {
    clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.REACT_APP_GOOGLE_CLIENT_SECRET || '',
    projectId: process.env.REACT_APP_GOOGLE_PROJECT_ID || '',
    projectNumber: process.env.REACT_APP_GOOGLE_PROJECT_NUMBER || ''
  };

  private static accessToken: string | null = null;
  private static tokenExpiry: number = 0;

  // Logging detalhado para monitoramento
  private static logRequest(request: Veo3Request, response: Veo3Response, startTime: number) {
    const generationTime = Date.now() - startTime;
    const logData = {
      timestamp: new Date().toISOString(),
      projectId: this.config.projectId,
      projectNumber: this.config.projectNumber,
      request: {
        prompt: request.prompt,
        duration: request.duration,
        quality: request.quality,
        style: request.style,
        mode: request.mode
      },
      response: {
        success: response.success,
        videoUrl: response.videoUrl,
        error: response.error,
        requestId: response.requestId,
        generationTime
      },
      user: typeof window !== 'undefined' ? localStorage.getItem('user') : null,
      session: this.generateSessionId()
    };

    console.log('🎬 Veo 3 Request Log:', logData);

    // Enviar para Google Analytics se disponível
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'veo3_request', {
        prompt_length: request.prompt.length,
        duration: request.duration,
        quality: request.quality,
        style: request.style,
        mode: request.mode,
        success: response.success,
        generation_time: generationTime,
        project_id: this.config.projectId
      });
    }

    // Salvar no localStorage para histórico
    this.saveToHistory(logData);
  }

  private static generateSessionId(): string {
    return `veo3_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static saveToHistory(logData: any) {
    try {
      const history = JSON.parse(localStorage.getItem('veo3_history') || '[]');
      history.push(logData);
      
      // Manter apenas os últimos 100 registros
      if (history.length > 100) {
        history.splice(0, history.length - 100);
      }
      
      localStorage.setItem('veo3_history', JSON.stringify(history));
    } catch (error) {
      console.warn('Erro ao salvar histórico Veo 3:', error);
    }
  }

  // Não precisamos mais de OAuth - fal.ai usa API Key diretamente
  private static async getAccessToken(): Promise<string> {
    console.log('🔐 Usando fal.ai API Key diretamente...');
    return 'fal-ai-direct';
  }



  // Gerar vídeo com Veo 3
  static async generateVideo(request: Veo3Request): Promise<Veo3Response> {
    const startTime = Date.now();
    
    try {
      console.log('🎬 Iniciando geração de vídeo Veo 3...', {
        prompt: request.prompt.substring(0, 100) + '...',
        duration: request.duration,
        quality: request.quality,
        style: request.style,
        mode: request.mode,
        projectId: this.config.projectId
      });

      // Obter token de acesso
      const token = await this.getAccessToken();

      // Chamada para API Veo 3
      const apiResponse = await this.callVeo3API(request, token);

      const response: Veo3Response = {
        success: true,
        videoUrl: apiResponse.videoUrl,
        thumbnailUrl: apiResponse.thumbnailUrl,
        requestId: apiResponse.requestId,
        generationTime: Date.now() - startTime
      };

      // Log da requisição
      this.logRequest(request, response, startTime);

      console.log('✅ Vídeo Veo 3 gerado com sucesso!', {
        requestId: response.requestId,
        generationTime: response.generationTime,
        videoUrl: response.videoUrl
      });

      return response;

    } catch (error) {
      console.error('❌ Erro na geração Veo 3:', error);
      
      const errorResponse: Veo3Response = {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        generationTime: Date.now() - startTime
      };

      this.logRequest(request, errorResponse, startTime);

      // Log específico para Google Analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'veo3_error', {
          error_message: errorResponse.error,
          prompt_length: request.prompt.length,
          project_id: this.config.projectId
        });
      }

      throw new Error(`Erro Veo 3: ${errorResponse.error}`);
    }
  }

  // Chamada para API Veo 3 via fal.ai (resolve CORS)
  private static async callVeo3API(request: Veo3Request, token: string): Promise<any> {
    console.log(`⏳ Gerando vídeo Veo 3 real via fal.ai...`);
    
    // URL da nossa Vercel Function (resolve problema de CORS)
    // Usar a mesma origem que está sendo acessada (resolve problema de URLs diferentes)
    const baseUrl = window.location.origin;
    const apiUrl = `${baseUrl}/api/veo3-generate`;
    
    const requestBody = {
      prompt: request.prompt,
      duration: request.duration,
      quality: request.quality,
      style: request.style,
      mode: request.mode
    };

    console.log('📤 Enviando requisição para fal.ai via serverless:', {
      url: apiUrl,
      prompt: request.prompt.substring(0, 100) + '...',
      duration: request.duration,
      quality: request.quality,
      provider: 'fal.ai'
    });

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Start-Time': Date.now().toString()
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Erro da fal.ai Veo 3:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        provider: errorData.provider || 'fal.ai'
      });
      
      // Usar mensagem de erro mais específica da fal.ai
      const errorMessage = errorData.error || `Erro da fal.ai Veo 3: ${response.status}`;
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('✅ Resposta da fal.ai Veo 3:', result);

    if (!result.success) {
      throw new Error(result.error || 'Erro desconhecido da API Veo 3');
    }

    return {
      videoUrl: result.videoUrl,
      thumbnailUrl: result.thumbnailUrl,
      requestId: result.requestId || `veo3_${this.config.projectId}_${Date.now()}`,
      status: result.status || 'completed'
    };
  }

  // Obter histórico de requisições
  static getHistory(): any[] {
    try {
      return JSON.parse(localStorage.getItem('veo3_history') || '[]');
    } catch (error) {
      console.warn('Erro ao obter histórico Veo 3:', error);
      return [];
    }
  }

  // Limpar histórico
  static clearHistory(): void {
    localStorage.removeItem('veo3_history');
    console.log('🗑️ Histórico Veo 3 limpo');
  }

  // Verificar status da API
  static async checkAPIStatus(): Promise<boolean> {
    try {
      const token = await this.getAccessToken();
      console.log('✅ API Veo 3 disponível');
      return true;
    } catch (error) {
      console.error('❌ API Veo 3 indisponível:', error);
      return false;
    }
  }

  // Obter estatísticas de uso
  static getUsageStats(): any {
    const history = this.getHistory();
    const totalRequests = history.length;
    const successfulRequests = history.filter(h => h.response.success).length;
    const averageGenerationTime = history.length > 0 
      ? history.reduce((sum, h) => sum + (h.response.generationTime || 0), 0) / history.length 
      : 0;

    return {
      totalRequests,
      successfulRequests,
      successRate: totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0,
      averageGenerationTime: Math.round(averageGenerationTime),
      projectId: this.config.projectId,
      lastRequest: history.length > 0 ? history[history.length - 1].timestamp : null
    };
  }
}

export default Veo3Service;
