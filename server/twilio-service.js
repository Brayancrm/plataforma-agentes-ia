// Serviço WhatsApp usando Twilio (Solução Temporária)
// Funciona na Vercel sem problemas de sistema de arquivos

const twilio = require('twilio');

class TwilioWhatsAppService {
    constructor() {
        this.client = twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
        );
        this.fromNumber = process.env.TWILIO_WHATSAPP_NUMBER; // formato: whatsapp:+1234567890
        this.connections = new Map();
    }

    async createConnection(agentId, agentConfig) {
        try {
            console.log(`🔗 Criando conexão Twilio para agente ${agentId}`);

            // Simular processo de conexão (Twilio não usa QR codes)
            const connection = {
                id: `twilio_${agentId}_${Date.now()}`,
                agentId,
                agentName: agentConfig.name,
                status: 'connected', // Twilio já está conectado
                createdAt: new Date().toISOString(),
                message: 'Conexão Twilio ativa! Use o número configurado para enviar mensagens.',
                instructions: [
                    '1. Configure o número Twilio no .env',
                    '2. Envie mensagens para o número: ' + (this.fromNumber || 'NÃO CONFIGURADO'),
                    '3. O agente responderá automaticamente',
                    '4. Não é necessário QR code'
                ]
            };

            this.connections.set(agentId, {
                ...connection,
                config: agentConfig
            });

            return connection;
        } catch (error) {
            console.error('❌ Erro ao criar conexão Twilio:', error);
            throw error;
        }
    }

    async sendMessage(agentId, to, message) {
        try {
            const connection = this.connections.get(agentId);
            if (!connection) {
                throw new Error('Conexão não encontrada');
            }

            // Formatar número para WhatsApp
            const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
            const formattedFrom = this.fromNumber;

            console.log(`📤 Enviando mensagem via Twilio: ${formattedFrom} -> ${formattedTo}`);

            const result = await this.client.messages.create({
                body: message,
                from: formattedFrom,
                to: formattedTo
            });

            console.log(`✅ Mensagem enviada: ${result.sid}`);
            return result;
        } catch (error) {
            console.error('❌ Erro ao enviar mensagem:', error);
            throw error;
        }
    }

    async handleIncomingMessage(messageData) {
        try {
            // Processar mensagem recebida via webhook
            const { From, Body, To } = messageData;
            
            // Encontrar agente baseado no número de destino
            let targetAgent = null;
            for (const [agentId, connection] of this.connections) {
                if (connection.config.phoneNumber === To.replace('whatsapp:', '')) {
                    targetAgent = { agentId, connection };
                    break;
                }
            }

            if (!targetAgent) {
                console.log('❌ Agente não encontrado para:', To);
                return;
            }

            // Gerar resposta usando IA
            const response = await this.generateAIResponse(
                Body,
                targetAgent.connection.config.prompt
            );

            // Enviar resposta
            await this.sendMessage(
                targetAgent.agentId,
                From,
                response
            );

        } catch (error) {
            console.error('❌ Erro ao processar mensagem recebida:', error);
        }
    }

    async generateAIResponse(userMessage, agentPrompt) {
        // Aqui você integraria com OpenAI, Gemini, etc.
        // Por enquanto, uma resposta simples
        return `Olá! Sou um agente IA configurado com: "${agentPrompt}". 
        
Você disse: "${userMessage}"

Como posso ajudar você hoje?`;
    }

    getConnection(agentId) {
        return this.connections.get(agentId);
    }

    async disconnect(agentId) {
        this.connections.delete(agentId);
        console.log(`🔌 Conexão Twilio removida para agente ${agentId}`);
    }

    getAllConnections() {
        return Array.from(this.connections.values());
    }
}

module.exports = new TwilioWhatsAppService();
