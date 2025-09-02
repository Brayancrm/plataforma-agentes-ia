// WhatsApp Web Service - Igual ao exemplo da imagem
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode');

class WhatsAppWebService {
    constructor(io) {
        this.io = io;
        this.clients = new Map(); // clientId -> Client instance
        this.connections = new Map(); // clientId -> connection info
        this.qrCodes = new Map(); // clientId -> QR code data
    }

    // Conectar cliente igual ao exemplo
    async connectClient(clientId, clientName, socket) {
        try {
            console.log(`🔗 Conectando WhatsApp Web para: ${clientId}`);

            // Criar cliente com LocalAuth (igual ao exemplo)
            const client = new Client({
                authStrategy: new LocalAuth({ clientId }),
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

            // Status inicial (igual ao exemplo)
            this.updateConnectionStatus(clientId, {
                id: clientId,
                name: clientName,
                status: 'INITIALIZING',
                message: 'Inicializando WhatsApp Web...',
                timestamp: new Date().toISOString()
            });

            // Event: QR Code (igual ao exemplo)
            client.on('qr', async (qr) => {
                try {
                    console.log(`📱 QR Code gerado para: ${clientId}`);
                    
                    // Gerar QR Code como Data URL
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

                    // Salvar QR Code
                    this.qrCodes.set(clientId, {
                        qr: qr,
                        dataURL: qrCodeDataURL,
                        timestamp: Date.now()
                    });

                    // Atualizar status (igual ao exemplo)
                    this.updateConnectionStatus(clientId, {
                        id: clientId,
                        name: clientName,
                        status: 'QRCODE',
                        message: 'Aguardando QR Code',
                        qrCode: qrCodeDataURL,
                        instructions: [
                            'Abra o WhatsApp no seu celular',
                            'Toque em Menu (⋮) > WhatsApp Web',
                            'Aponte a câmera para o QR Code',
                            'Aguarde a conexão ser estabelecida'
                        ]
                    });

                    // Emitir para o cliente (Socket.io)
                    socket.emit('whatsapp:qrcode', {
                        clientId,
                        qrCode: qrCodeDataURL,
                        status: 'QRCODE'
                    });

                    // Broadcast para todos os sockets
                    this.io.emit('whatsapp:status', {
                        clientId,
                        status: 'QRCODE',
                        qrCode: qrCodeDataURL
                    });

                } catch (error) {
                    console.error('❌ Erro ao gerar QR Code:', error);
                    this.handleError(clientId, socket, error);
                }
            });

            // Event: Ready (igual ao exemplo - "WhatsApp configurado")
            client.on('ready', () => {
                console.log(`✅ WhatsApp Web pronto para: ${clientId}`);
                
                // Remover QR Code
                this.qrCodes.delete(clientId);
                
                // Status conectado (igual ao exemplo)
                this.updateConnectionStatus(clientId, {
                    id: clientId,
                    name: clientName,
                    status: 'READY',
                    message: 'WhatsApp configurado',
                    connected: true,
                    timestamp: new Date().toISOString()
                });

                // Emitir sucesso
                socket.emit('whatsapp:ready', {
                    clientId,
                    status: 'READY',
                    message: 'O assistente está salvo e pode ser conectado ao WhatsApp Web'
                });

                // Broadcast
                this.io.emit('whatsapp:status', {
                    clientId,
                    status: 'READY',
                    connected: true
                });
            });

            // Event: Mensagem recebida
            client.on('message', async (message) => {
                await this.handleIncomingMessage(clientId, message);
            });

            // Event: Desconectado
            client.on('disconnected', (reason) => {
                console.log(`❌ WhatsApp desconectado: ${clientId} - ${reason}`);
                
                this.updateConnectionStatus(clientId, {
                    id: clientId,
                    name: clientName,
                    status: 'DISCONNECTED',
                    message: 'WhatsApp desconectado',
                    error: reason
                });

                // Limpar
                this.clients.delete(clientId);
                this.qrCodes.delete(clientId);

                // Emitir desconexão
                socket.emit('whatsapp:disconnected', { clientId, reason });
                this.io.emit('whatsapp:status', { clientId, status: 'DISCONNECTED' });
            });

            // Event: Erro de autenticação
            client.on('auth_failure', (msg) => {
                console.log(`❌ Falha de autenticação: ${clientId} - ${msg}`);
                this.handleError(clientId, socket, new Error('Falha na autenticação do WhatsApp'));
            });

            // Salvar cliente
            this.clients.set(clientId, client);
            
            // Inicializar
            await client.initialize();
            
            return { success: true, clientId, status: 'INITIALIZING' };

        } catch (error) {
            console.error(`❌ Erro ao conectar WhatsApp: ${clientId}`, error);
            this.handleError(clientId, socket, error);
            throw error;
        }
    }

    // Desconectar cliente
    async disconnectClient(clientId, socket) {
        try {
            const client = this.clients.get(clientId);
            if (client) {
                await client.destroy();
                this.clients.delete(clientId);
                this.qrCodes.delete(clientId);
                this.connections.delete(clientId);

                socket.emit('whatsapp:disconnected', { clientId });
                this.io.emit('whatsapp:status', { clientId, status: 'DISCONNECTED' });
            }
            return { success: true, clientId, status: 'DISCONNECTED' };
        } catch (error) {
            console.error('❌ Erro ao desconectar:', error);
            throw error;
        }
    }

    // Enviar mensagem
    async sendMessage(clientId, to, message) {
        try {
            const client = this.clients.get(clientId);
            if (!client) {
                throw new Error('Cliente WhatsApp não encontrado ou não conectado');
            }
            
            const chatId = to.includes('@') ? to : `${to}@c.us`;
            const result = await client.sendMessage(chatId, message);
            
            console.log(`✅ Mensagem enviada: ${clientId} -> ${to}`);
            return { success: true, messageId: result.id.id, to, message };
        } catch (error) {
            console.error('❌ Erro ao enviar mensagem:', error);
            throw error;
        }
    }

    // Processar mensagem recebida
    async handleIncomingMessage(clientId, message) {
        try {
            // Ignorar mensagens próprias
            if (message.fromMe) return;

            console.log(`📨 Mensagem recebida: ${clientId} - ${message.from}: ${message.body}`);

            // Aqui você integraria com IA (OpenAI/Gemini)
            const response = await this.generateAIResponse(message.body, clientId);

            // Responder automaticamente
            await message.reply(response);
            
            console.log(`🤖 Resposta automática enviada: ${response}`);

            // Emitir evento de mensagem
            this.io.emit('whatsapp:message', {
                clientId,
                from: message.from,
                message: message.body,
                response: response,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('❌ Erro ao processar mensagem:', error);
        }
    }

    // Gerar resposta com IA (placeholder)
    async generateAIResponse(userMessage, clientId) {
        const connection = this.connections.get(clientId);
        const assistantName = connection?.name || 'Assistente';
        
        return `Olá! Sou o ${assistantName}, um assistente virtual inteligente. 

Você disse: "${userMessage}"

Como posso ajudar você hoje?`;
    }

    // Atualizar status da conexão
    updateConnectionStatus(clientId, status) {
        this.connections.set(clientId, {
            ...this.connections.get(clientId),
            ...status,
            lastUpdate: new Date().toISOString()
        });
    }

    // Tratar erros
    handleError(clientId, socket, error) {
        const errorStatus = {
            id: clientId,
            status: 'ERROR',
            message: 'Erro na conexão WhatsApp',
            error: error.message,
            timestamp: new Date().toISOString()
        };

        this.updateConnectionStatus(clientId, errorStatus);
        
        socket.emit('whatsapp:error', {
            clientId,
            error: error.message,
            status: 'ERROR'
        });

        this.io.emit('whatsapp:status', {
            clientId,
            status: 'ERROR',
            error: error.message
        });
    }

    // Obter QR Code
    getQRCode(clientId) {
        return this.qrCodes.get(clientId);
    }

    // Obter status da conexão
    getConnectionStatus(clientId) {
        return this.connections.get(clientId);
    }

    // Obter todas as conexões
    getAllConnections() {
        return Array.from(this.connections.values());
    }

    // Verificar se está conectado
    isConnected(clientId) {
        const client = this.clients.get(clientId);
        const connection = this.connections.get(clientId);
        return client && connection?.status === 'READY';
    }
}

module.exports = WhatsAppWebService;
