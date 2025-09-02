const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode');

class WhatsAppService {
    constructor() {
        this.clients = new Map(); // Múltiplos clientes por agente
        this.qrCodes = new Map();
        this.connections = new Map();
    }

    async createClient(agentId, agentConfig) {
        try {
            console.log(`🔗 Criando cliente WhatsApp para agente ${agentId}`);

            const client = new Client({
                authStrategy: new LocalAuth({ clientId: agentId }),
                puppeteer: {
                    headless: true,
                    args: [
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-dev-shm-usage',
                        '--disable-accelerated-2d-canvas',
                        '--no-first-run',
                        '--no-zygote',
                        '--disable-gpu'
                    ]
                }
            });

            // QR Code event
            client.on('qr', async (qr) => {
                try {
                    console.log(`📱 QR Code recebido para agente ${agentId}`);
                    
                    // Gerar QR Code como Data URL para exibir na interface
                    const qrCodeDataURL = await qrcode.toDataURL(qr, {
                        errorCorrectionLevel: 'M',
                        type: 'image/png',
                        quality: 0.92,
                        margin: 1,
                        color: {
                            dark: '#000000',
                            light: '#FFFFFF'
                        }
                    });

                    this.qrCodes.set(agentId, {
                        qr: qr,
                        dataURL: qrCodeDataURL,
                        timestamp: Date.now()
                    });

                    // Atualizar status da conexão
                    this.connections.set(agentId, {
                        id: `whatsapp_${agentId}_${Date.now()}`,
                        agentId,
                        agentName: agentConfig.name,
                        status: 'waiting_qr',
                        qrCode: qrCodeDataURL,
                        createdAt: new Date().toISOString(),
                        message: 'QR Code real gerado! Escaneie com seu WhatsApp.',
                        instructions: [
                            '1. Abra o WhatsApp no seu celular',
                            '2. Toque em Menu (⋮) > WhatsApp Web',
                            '3. Aponte a câmera para o QR Code',
                            '4. Aguarde a conexão ser estabelecida'
                        ]
                    });

                    console.log(`✅ QR Code gerado e salvo para agente ${agentId}`);
                } catch (error) {
                    console.error('❌ Erro ao gerar QR Code:', error);
                }
            });

            // Ready event
            client.on('ready', () => {
                console.log(`✅ Cliente WhatsApp pronto para agente ${agentId}`);
                
                // Remover QR code após conexão
                this.qrCodes.delete(agentId);
                
                // Atualizar status para conectado
                this.connections.set(agentId, {
                    id: `whatsapp_${agentId}_${Date.now()}`,
                    agentId,
                    agentName: agentConfig.name,
                    status: 'connected',
                    createdAt: new Date().toISOString(),
                    lastSeen: new Date().toISOString(),
                    message: 'WhatsApp conectado com sucesso!'
                });
            });

            // Message event
            client.on('message', async (message) => {
                await this.handleMessage(agentId, message, agentConfig);
            });

            // Disconnect event
            client.on('disconnected', (reason) => {
                console.log(`❌ Cliente ${agentId} desconectado:`, reason);
                this.clients.delete(agentId);
                this.qrCodes.delete(agentId);
                
                // Atualizar status para desconectado
                this.connections.set(agentId, {
                    id: `whatsapp_${agentId}_${Date.now()}`,
                    agentId,
                    agentName: agentConfig.name,
                    status: 'disconnected',
                    createdAt: new Date().toISOString(),
                    error: reason
                });
            });

            // Authentication failure
            client.on('auth_failure', (msg) => {
                console.log(`❌ Falha de autenticação para agente ${agentId}:`, msg);
                this.connections.set(agentId, {
                    id: `whatsapp_${agentId}_${Date.now()}`,
                    agentId,
                    agentName: agentConfig.name,
                    status: 'error',
                    createdAt: new Date().toISOString(),
                    error: 'Falha na autenticação do WhatsApp'
                });
            });

            this.clients.set(agentId, client);
            await client.initialize();
            
            return client;
        } catch (error) {
            console.error(`❌ Erro ao criar cliente para agente ${agentId}:`, error);
            throw error;
        }
    }

    async handleMessage(agentId, message, agentConfig) {
        try {
            // Ignorar mensagens próprias
            if (message.fromMe) return;

            console.log(`📨 Mensagem recebida do agente ${agentId}:`, {
                from: message.from,
                body: message.body,
                timestamp: message.timestamp
            });

            // Processar com IA (aqui você integraria com OpenAI/Gemini)
            const response = await this.generateAIResponse(
                message.body, 
                agentConfig.prompt
            );

            // Enviar resposta
            await message.reply(response);
            
            console.log(`✅ Resposta enviada pelo agente ${agentId}:`, response);
            
        } catch (error) {
            console.error('❌ Erro ao processar mensagem:', error);
        }
    }

    async generateAIResponse(userMessage, agentPrompt) {
        // Aqui você integraria com OpenAI, Gemini, etc.
        // Por enquanto, uma resposta simples baseada no prompt
        
        const baseResponse = `Olá! Sou um agente IA configurado com o seguinte comportamento: "${agentPrompt}". 
        
Você disse: "${userMessage}"

Como posso ajudar você hoje?`;

        return baseResponse;
    }

    getQRCode(agentId) {
        return this.qrCodes.get(agentId);
    }

    getConnection(agentId) {
        return this.connections.get(agentId);
    }

    async sendMessage(agentId, to, message) {
        const client = this.clients.get(agentId);
        if (!client) {
            throw new Error('Cliente não encontrado ou não conectado');
        }
        
        const chatId = to.includes('@') ? to : `${to}@c.us`;
        await client.sendMessage(chatId, message);
    }

    async disconnect(agentId) {
        const client = this.clients.get(agentId);
        if (client) {
            await client.destroy();
            this.clients.delete(agentId);
            this.qrCodes.delete(agentId);
            this.connections.delete(agentId);
        }
    }

    isConnected(agentId) {
        return this.clients.has(agentId);
    }

    getAllConnections() {
        return Array.from(this.connections.values());
    }
}

module.exports = new WhatsAppService();
