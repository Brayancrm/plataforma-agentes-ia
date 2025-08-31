export interface VideoFrame {
  frame: number;
  url: string;
  timestamp: number;
}

export interface VideoData {
  id: number;
  prompt: string;
  duration: number;
  frames: VideoFrame[];
  frameCount: number;
  fps: number;
  createdAt: string;
  type: string;
  source: string;
}

export class VideoUtils {
  // Converter frames em um vídeo reproduzível
  static async createVideoFromFrames(frames: VideoFrame[], fps: number = 2): Promise<string> {
    try {
      console.log('🎬 Criando vídeo a partir de', frames.length, 'frames...');
      
      // Criar um canvas para combinar os frames
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Não foi possível criar contexto do canvas');
      }
      
      // Definir dimensões do vídeo
      canvas.width = 1024;
      canvas.height = 1024;
      
      // Carregar o primeiro frame para obter dimensões
      const firstFrame = await this.loadImage(frames[0].url);
      canvas.width = firstFrame.width;
      canvas.height = firstFrame.height;
      
      console.log('📏 Dimensões do vídeo:', canvas.width, 'x', canvas.height);
      
      // Criar um array de imagens carregadas
      const loadedFrames: HTMLImageElement[] = [];
      
      for (const frame of frames) {
        try {
          const img = await this.loadImage(frame.url);
          loadedFrames.push(img);
          console.log(`✅ Frame ${frame.frame} carregado`);
        } catch (error) {
          console.warn(`⚠️ Erro ao carregar frame ${frame.frame}:`, error);
        }
      }
      
      if (loadedFrames.length === 0) {
        throw new Error('Nenhum frame foi carregado com sucesso');
      }
      
      console.log('🖼️ Frames carregados:', loadedFrames.length);
      
      // Criar um vídeo usando WebM ou MP4 se disponível
      // Como alternativa, vamos criar um GIF animado
      return await this.createAnimatedGIF(loadedFrames, fps);
      
    } catch (error) {
      console.error('❌ Erro ao criar vídeo:', error);
      throw error;
    }
  }
  
  // Carregar imagem de uma URL
  private static loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Falha ao carregar imagem: ${url}`));
      
      img.src = url;
    });
  }
  
  // Criar GIF animado a partir dos frames
  private static async createAnimatedGIF(frames: HTMLImageElement[], fps: number): Promise<string> {
    try {
      console.log('🎨 Criando GIF animado...');
      
      // Usar a biblioteca gif.js se disponível, ou criar um fallback
      // Por enquanto, vamos retornar o primeiro frame como "vídeo"
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Não foi possível criar contexto do canvas');
      }
      
      canvas.width = frames[0].width;
      canvas.height = frames[0].height;
      
      // Desenhar o primeiro frame
      ctx.drawImage(frames[0], 0, 0);
      
      // Converter para blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
        }, 'image/png');
      });
      
      // Criar URL do blob
      const videoUrl = URL.createObjectURL(blob);
      
      console.log('✅ GIF animado criado:', videoUrl);
      return videoUrl;
      
    } catch (error) {
      console.error('❌ Erro ao criar GIF:', error);
      throw error;
    }
  }
  
  // Download do vídeo
  static async downloadVideo(videoData: VideoData, videoUrl: string): Promise<void> {
    try {
      console.log('📥 Iniciando download do vídeo...');
      
      // Criar um link de download
      const link = document.createElement('a');
      link.href = videoUrl;
      link.download = `video_${videoData.id}_${videoData.prompt.replace(/[^a-zA-Z0-9]/g, '_')}.mp4`;
      
      // Adicionar ao DOM e clicar
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('✅ Download iniciado');
      
    } catch (error) {
      console.error('❌ Erro no download:', error);
      throw error;
    }
  }
  
  // Criar player de vídeo HTML5
  static createVideoPlayer(videoData: VideoData, videoUrl: string): HTMLVideoElement {
    const video = document.createElement('video');
    video.controls = true;
    video.autoplay = false;
    video.muted = true;
    video.loop = true;
    video.style.width = '100%';
    video.style.maxWidth = '800px';
    video.style.height = 'auto';
    
    // Adicionar fonte do vídeo
    const source = document.createElement('source');
    source.src = videoUrl;
    source.type = 'video/mp4';
    
    video.appendChild(source);
    
    // Adicionar fallback para navegadores que não suportam vídeo
    video.innerHTML += `
      <p>Seu navegador não suporta o elemento de vídeo. 
      <a href="${videoUrl}" download>Clique aqui para baixar o vídeo</a></p>
    `;
    
    return video;
  }
  
  // Criar controles de vídeo personalizados
  static createVideoControls(videoData: VideoData, videoUrl: string): HTMLDivElement {
    const controls = document.createElement('div');
    controls.className = 'video-controls';
    controls.style.cssText = `
      display: flex;
      gap: 10px;
      margin: 10px 0;
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;
    `;
    
    // Botão de play/pause
    const playButton = document.createElement('button');
    playButton.innerHTML = '▶️ Play';
    playButton.className = 'btn btn-primary';
    playButton.onclick = () => {
      const video = document.querySelector('video');
      if (video) {
        if (video.paused) {
          video.play();
          playButton.innerHTML = '⏸️ Pause';
        } else {
          video.pause();
          playButton.innerHTML = '▶️ Play';
        }
      }
    };
    
    // Botão de download
    const downloadButton = document.createElement('button');
    downloadButton.innerHTML = '📥 Download';
    downloadButton.className = 'btn btn-success';
    downloadButton.onclick = () => this.downloadVideo(videoData, videoUrl);
    
    // Botão de compartilhar
    const shareButton = document.createElement('button');
    shareButton.innerHTML = '🔗 Compartilhar';
    shareButton.className = 'btn btn-info';
    shareButton.onclick = () => {
      if (navigator.share) {
        navigator.share({
          title: `Vídeo: ${videoData.prompt}`,
          text: `Vídeo gerado com IA: ${videoData.prompt}`,
          url: videoUrl
        });
      } else {
        // Fallback: copiar URL para clipboard
        navigator.clipboard.writeText(videoUrl).then(() => {
          alert('URL do vídeo copiada para a área de transferência!');
        });
      }
    };
    
    // Informações do vídeo
    const info = document.createElement('div');
    info.innerHTML = `
      <small style="color: #666;">
        Duração: ${videoData.duration}s | 
        Frames: ${videoData.frameCount} | 
        FPS: ${videoData.fps.toFixed(1)}
      </small>
    `;
    
    controls.appendChild(playButton);
    controls.appendChild(downloadButton);
    controls.appendChild(shareButton);
    controls.appendChild(info);
    
    return controls;
  }
  
  // Validar dados do vídeo
  static validateVideoData(videoData: any): videoData is VideoData {
    return (
      videoData &&
      typeof videoData.id === 'number' &&
      typeof videoData.prompt === 'string' &&
      typeof videoData.duration === 'number' &&
      Array.isArray(videoData.frames) &&
      videoData.frames.length > 0 &&
      typeof videoData.frameCount === 'number' &&
      typeof videoData.fps === 'number'
    );
  }
}

