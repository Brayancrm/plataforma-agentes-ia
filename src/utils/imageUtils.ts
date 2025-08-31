// Utilitários para manipulação de imagens

export class ImageUtils {
  
  // Converter arquivo para base64
  static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Erro ao converter arquivo para base64'));
        }
      };
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsDataURL(file);
    });
  }

  // Validar se o arquivo é uma imagem válida
  static validateImageFile(file: File): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Verificar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      errors.push('Tipo de arquivo não suportado. Use JPEG, PNG ou WebP.');
    }

    // Verificar tamanho (máximo 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      errors.push('Arquivo muito grande. Máximo 10MB.');
    }

    // Verificar tamanho mínimo (mínimo 1KB)
    const minSize = 1024; // 1KB
    if (file.size < minSize) {
      errors.push('Arquivo muito pequeno. Mínimo 1KB.');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Redimensionar imagem se necessário
  static async resizeImage(file: File, maxWidth: number = 1024, maxHeight: number = 1024): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calcular novo tamanho mantendo proporção
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        // Desenhar imagem redimensionada
        ctx?.drawImage(img, 0, 0, width, height);

        // Converter para blob
        canvas.toBlob((blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(resizedFile);
          } else {
            reject(new Error('Erro ao redimensionar imagem'));
          }
        }, file.type, 0.9);
      };

      img.onerror = () => reject(new Error('Erro ao carregar imagem'));
      img.src = URL.createObjectURL(file);
    });
  }

  // Converter imagem para PNG (necessário para algumas APIs)
  static async convertToPNG(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;

        // Desenhar imagem
        ctx?.drawImage(img, 0, 0);

        // Converter para PNG
        canvas.toBlob((blob) => {
          if (blob) {
            const pngFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.png'), {
              type: 'image/png',
              lastModified: Date.now(),
            });
            resolve(pngFile);
          } else {
            reject(new Error('Erro ao converter para PNG'));
          }
        }, 'image/png');
      };

      img.onerror = () => reject(new Error('Erro ao carregar imagem'));
      img.src = URL.createObjectURL(file);
    });
  }

  // Converter imagem para formato RGBA (necessário para OpenAI DALL-E)
  static async convertToRGBA(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;

        // Criar fundo branco (RGBA)
        ctx!.fillStyle = '#ffffff';
        ctx!.fillRect(0, 0, canvas.width, canvas.height);

        // Desenhar imagem sobre o fundo branco
        ctx!.drawImage(img, 0, 0);

        // Converter para PNG com canal alpha
        canvas.toBlob((blob) => {
          if (blob) {
            const rgbaFile = new File([blob], file.name.replace(/\.[^/.]+$/, '_rgba.png'), {
              type: 'image/png',
              lastModified: Date.now(),
            });
            resolve(rgbaFile);
          } else {
            reject(new Error('Erro ao converter para RGBA'));
          }
        }, 'image/png', 1.0);
      };

      img.onerror = () => reject(new Error('Erro ao carregar imagem'));
      img.src = URL.createObjectURL(file);
    });
  }

  // Validar e converter imagem para formato compatível com OpenAI
  static async prepareImageForOpenAI(file: File): Promise<File> {
    try {
      console.log('🔄 Preparando imagem para OpenAI...');
      
      // Verificar se já é PNG
      if (file.type === 'image/png') {
        console.log('✅ Imagem já é PNG, convertendo para RGBA...');
        return await this.convertToRGBA(file);
      }
      
      // Para outros formatos, converter primeiro para PNG, depois para RGBA
      console.log('🔄 Convertendo para PNG primeiro...');
      const pngFile = await this.convertToPNG(file);
      console.log('🔄 Agora convertendo para RGBA...');
      return await this.convertToRGBA(pngFile);
      
    } catch (error) {
      console.error('❌ Erro ao preparar imagem para OpenAI:', error);
      throw new Error('Não foi possível preparar a imagem para a API da OpenAI');
    }
  }

  // Criar URL de preview segura
  static createPreviewURL(file: File): string {
    return URL.createObjectURL(file);
  }

  // Limpar URL de preview (importante para evitar memory leaks)
  static revokePreviewURL(url: string): void {
    URL.revokeObjectURL(url);
  }

  // Download de imagem da URL
  static async downloadImage(imageUrl: string, filename: string = 'imagem-gerada.png') {
    try {
      console.log('📥 Iniciando download da imagem:', imageUrl);
      
      // Verificar se é uma URL da OpenAI (que tem problemas de CORS)
      const isOpenAIUrl = imageUrl.includes('oaidalleapiprodscus.blob.core.windows.net') || 
                         imageUrl.includes('openai.com') ||
                         imageUrl.includes('dalle');
      
      if (isOpenAIUrl) {
        console.log('🔄 URL da OpenAI detectada, usando método alternativo...');
        return await this.downloadImageViaCanvas(imageUrl, filename);
      }
      
      // Para outras URLs, tentar o método normal primeiro
      try {
        const response = await fetch(imageUrl);
        if (!response.ok) {
          throw new Error('Erro ao baixar a imagem');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        window.URL.revokeObjectURL(url);
        
        console.log('✅ Download concluído:', filename);
        return true;
        
      } catch (fetchError) {
        console.log('⚠️ Fetch direto falhou, tentando método alternativo...');
        return await this.downloadImageViaCanvas(imageUrl, filename);
      }
      
    } catch (error) {
      console.error('❌ Erro no download:', error);
      throw error;
    }
  }

  // Método alternativo usando canvas para contornar CORS
  private static async downloadImageViaCanvas(imageUrl: string, filename: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        console.log('🎨 Usando canvas para download...');
        
        const img = new Image();
        img.crossOrigin = 'anonymous'; // Tentar CORS
        
        img.onload = () => {
          try {
            // Criar canvas
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
              reject(new Error('Não foi possível criar contexto do canvas'));
              return;
            }
            
            // Configurar canvas
            canvas.width = img.width;
            canvas.height = img.height;
            
            // Desenhar imagem
            ctx.drawImage(img, 0, 0);
            
            // Converter para blob
            canvas.toBlob((blob) => {
              if (blob) {
                // Criar URL do blob
                const url = window.URL.createObjectURL(blob);
                
                // Download
                const link = document.createElement('a');
                link.href = url;
                link.download = filename;
                
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                // Limpar
                window.URL.revokeObjectURL(url);
                
                console.log('✅ Download via canvas concluído:', filename);
                resolve(true);
              } else {
                reject(new Error('Erro ao converter canvas para blob'));
              }
            }, 'image/png', 0.9);
            
          } catch (canvasError) {
            console.error('❌ Erro no canvas:', canvasError);
            reject(canvasError);
          }
        };
        
        img.onerror = (error) => {
          console.error('❌ Erro ao carregar imagem no canvas:', error);
          
          // Última tentativa: abrir em nova aba
          console.log('🔄 Tentando abrir em nova aba...');
          try {
            const newWindow = window.open(imageUrl, '_blank');
            if (newWindow) {
              console.log('✅ Imagem aberta em nova aba para download manual');
              resolve(true);
            } else {
              reject(new Error('Não foi possível abrir a imagem em nova aba'));
            }
          } catch (windowError) {
            reject(new Error('Falha em todos os métodos de download'));
          }
        };
        
        // Definir src da imagem
        img.src = imageUrl;
        
      } catch (error) {
        console.error('❌ Erro geral no método canvas:', error);
        reject(error);
      }
    });
  }

  // Converter URL de imagem para File object (para reutilização)
  static async urlToFile(imageUrl: string, filename: string = 'imagem-reutilizada.png'): Promise<File> {
    try {
      console.log('🔄 Convertendo URL para arquivo:', imageUrl);
      
      // Verificar se é uma URL da OpenAI (que tem problemas de CORS)
      const isOpenAIUrl = imageUrl.includes('oaidalleapiprodscus.blob.core.windows.net') || 
                         imageUrl.includes('openai.com') ||
                         imageUrl.includes('dalle');
      
      if (isOpenAIUrl) {
        console.log('🔄 URL da OpenAI detectada, usando método alternativo...');
        return await this.urlToFileViaCanvas(imageUrl, filename);
      }
      
      // Para outras URLs, tentar o método normal primeiro
      try {
        const response = await fetch(imageUrl);
        if (!response.ok) {
          throw new Error('Erro ao carregar a imagem');
        }

        const blob = await response.blob();
        const file = new File([blob], filename, { 
          type: blob.type || 'image/png',
          lastModified: Date.now()
        });
        
        console.log('✅ Arquivo criado:', file.name, file.size, 'bytes');
        return file;
        
      } catch (fetchError) {
        console.log('⚠️ Fetch direto falhou, tentando método alternativo...');
        return await this.urlToFileViaCanvas(imageUrl, filename);
      }
      
    } catch (error) {
      console.error('❌ Erro na conversão:', error);
      throw error;
    }
  }

  // Método alternativo usando canvas para contornar CORS na conversão
  private static async urlToFileViaCanvas(imageUrl: string, filename: string): Promise<File> {
    return new Promise((resolve, reject) => {
      try {
        console.log('🎨 Usando canvas para conversão...');
        
        const img = new Image();
        img.crossOrigin = 'anonymous'; // Tentar CORS
        
        img.onload = () => {
          try {
            // Criar canvas
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
              reject(new Error('Não foi possível criar contexto do canvas'));
              return;
            }
            
            // Configurar canvas
            canvas.width = img.width;
            canvas.height = img.height;
            
            // Desenhar imagem
            ctx.drawImage(img, 0, 0);
            
            // Converter para blob
            canvas.toBlob((blob) => {
              if (blob) {
                const file = new File([blob], filename, { 
                  type: 'image/png',
                  lastModified: Date.now()
                });
                
                console.log('✅ Arquivo criado via canvas:', file.name, file.size, 'bytes');
                resolve(file);
              } else {
                reject(new Error('Erro ao converter canvas para blob'));
              }
            }, 'image/png', 0.9);
            
          } catch (canvasError) {
            console.error('❌ Erro no canvas:', canvasError);
            reject(canvasError);
          }
        };
        
        img.onerror = (error) => {
          console.error('❌ Erro ao carregar imagem no canvas:', error);
          
          // Para imagens da OpenAI, criar um arquivo placeholder
          if (imageUrl.includes('oaidalleapiprodscus.blob.core.windows.net')) {
            console.log('🔄 Imagem da OpenAI detectada, criando placeholder...');
            
            // Criar uma imagem placeholder simples
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            if (ctx) {
              canvas.width = 512;
              canvas.height = 512;
              
              // Fundo branco
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(0, 0, 512, 512);
              
              // Texto explicativo
              ctx.fillStyle = '#000000';
              ctx.font = '24px Arial';
              ctx.textAlign = 'center';
              ctx.fillText('Imagem da OpenAI', 256, 200);
              ctx.fillText('CORS bloqueado', 256, 240);
              ctx.fillText('Use upload manual', 256, 280);
              
              // Converter para blob
              canvas.toBlob((blob) => {
                if (blob) {
                  const file = new File([blob], filename, { 
                    type: 'image/png',
                    lastModified: Date.now()
                  });
                  
                  console.log('✅ Placeholder criado:', file.name, file.size, 'bytes');
                  resolve(file);
                } else {
                  reject(new Error('Erro ao criar placeholder'));
                }
              }, 'image/png', 0.9);
            } else {
              reject(new Error('Não foi possível criar contexto do canvas para placeholder'));
            }
          } else {
            reject(new Error('Não foi possível carregar a imagem para conversão'));
          }
        };
        
        // Definir src da imagem
        img.src = imageUrl;
        
      } catch (error) {
        console.error('❌ Erro geral no método canvas:', error);
        reject(error);
      }
    });
  }

  // Gerar nome de arquivo baseado no prompt e timestamp
  static generateFilename(prompt: string, tool: string): string {
    // Limpar prompt para nome de arquivo
    const cleanPrompt = prompt
      .replace(/[^a-zA-Z0-9\s]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '-') // Substitui espaços por hífen
      .toLowerCase()
      .substring(0, 30); // Máximo 30 caracteres

    const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const toolName = tool.includes('openai') ? 'dalle' :
                    tool.includes('leonardo') ? 'leonardo' :
                    tool.includes('gemini') ? 'gemini' :
                    tool.includes('vertex') ? 'vertex' : 'ia';

    return `${cleanPrompt}-${toolName}-${timestamp}.png`;
  }
}

export default ImageUtils;
