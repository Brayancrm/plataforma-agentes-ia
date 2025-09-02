# Guia de Implementação WhatsApp Real

Este documento explica como implementar uma integração real com WhatsApp para os agentes de IA.

## ⚠️ Situação Atual

A implementação atual é uma **demonstração da interface**. O QR Code gerado não é válido para WhatsApp porque não há uma integração real configurada.

## 🚀 Opções de Implementação Real

### 1. WhatsApp Web.js (Recomendado para Desenvolvimento)

**Prós:**
- Gratuito
- QR Code real do WhatsApp Web
- Controle total sobre a automação
- Ideal para desenvolvimento e testes

**Contras:**
- Não oficial (pode quebrar com atualizações do WhatsApp)
- Menos estável que a API oficial
- Requer manutenção constante

**Instalação:**
```bash
npm install whatsapp-web.js qrcode-terminal puppeteer
```

**Implementação Básica:**
```javascript
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', (qr) => {
    // Este é o QR code real que deve ser mostrado na interface
    qrcode.generate(qr, {small: true});
    console.log('QR RECEIVED', qr);
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', msg => {
    // Aqui você processaria com IA e responderia
    if (msg.body == 'ping') {
        msg.reply('pong');
    }
});

client.initialize();
```

### 2. WhatsApp Business API (Recomendado para Produção)

**Prós:**
- Oficial do WhatsApp
- Mais estável e confiável
- Suporte oficial
- Melhor para uso comercial

**Contras:**
- Requer aprovação do Facebook
- Pode ter custos associados
- Processo de configuração mais complexo
- Não usa QR codes (usa números verificados)

**Processo:**
1. Criar conta Facebook Business
2. Solicitar acesso à WhatsApp Business API
3. Aguardar aprovação
4. Configurar webhook e tokens
5. Implementar usando a API oficial

### 3. Serviços Third-Party

**Opções Populares:**
- **Twilio WhatsApp API**
- **ChatAPI**
- **WhatsMate**
- **Maytapi**
- **Chat-API.com**

**Vantagens:**
- Configuração mais simples
- Suporte técnico
- Infraestrutura gerenciada

**Desvantagens:**
- Custos mensais
- Dependência de terceiros
- Menos controle

## 🔧 Implementando WhatsApp Web.js

### Passo 1: Instalar Dependências

```bash
cd server
npm install whatsapp-web.js qrcode qrcode-terminal
```

### Passo 2: Criar Serviço WhatsApp

Crie `server/whatsapp-service.js`:

```javascript
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode');

class WhatsAppService {
    constructor() {
        this.clients = new Map(); // Múltiplos clientes por agente
        this.qrCodes = new Map();
    }

    async createClient(agentId, agentConfig) {
        const client = new Client({
            authStrategy: new LocalAuth({ clientId: agentId }),
            puppeteer: {
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            }
        });

        // QR Code event
        client.on('qr', async (qr) => {
            try {
                const qrCodeDataURL = await qrcode.toDataURL(qr);
                this.qrCodes.set(agentId, {
                    qr: qr,
                    dataURL: qrCodeDataURL,
                    timestamp: Date.now()
                });
                console.log(`QR Code gerado para agente ${agentId}`);
            } catch (error) {
                console.error('Erro ao gerar QR Code:', error);
            }
        });

        // Ready event
        client.on('ready', () => {
            console.log(`Cliente WhatsApp pronto para agente ${agentId}`);
            this.qrCodes.delete(agentId); // Remove QR code após conexão
        });

        // Message event
        client.on('message', async (message) => {
            await this.handleMessage(agentId, message, agentConfig);
        });

        // Disconnect event
        client.on('disconnected', (reason) => {
            console.log(`Cliente ${agentId} desconectado:`, reason);
            this.clients.delete(agentId);
        });

        this.clients.set(agentId, client);
        await client.initialize();
        
        return client;
    }

    async handleMessage(agentId, message, agentConfig) {
        try {
            // Ignorar mensagens próprias
            if (message.fromMe) return;

            // Processar com IA (integrar com OpenAI/Gemini)
            const response = await this.generateAIResponse(
                message.body, 
                agentConfig.prompt
            );

            // Enviar resposta
            await message.reply(response);
            
        } catch (error) {
            console.error('Erro ao processar mensagem:', error);
        }
    }

    async generateAIResponse(userMessage, agentPrompt) {
        // Aqui você integraria com OpenAI, Gemini, etc.
        // Por exemplo:
        /*
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: agentPrompt },
                { role: "user", content: userMessage }
            ],
        });
        return response.choices[0].message.content;
        */
        
        // Resposta de demonstração
        return `Olá! Sou um agente IA. Você disse: "${userMessage}". Como posso ajudar?`;
    }

    getQRCode(agentId) {
        return this.qrCodes.get(agentId);
    }

    async sendMessage(agentId, to, message) {
        const client = this.clients.get(agentId);
        if (!client) throw new Error('Cliente não encontrado');
        
        const chatId = to.includes('@') ? to : `${to}@c.us`;
        await client.sendMessage(chatId, message);
    }

    async disconnect(agentId) {
        const client = this.clients.get(agentId);
        if (client) {
            await client.destroy();
            this.clients.delete(agentId);
        }
    }
}

module.exports = new WhatsAppService();
```

### Passo 3: Atualizar API Endpoint

Modifique `api/whatsapp-connect.js`:

```javascript
const WhatsAppService = require('../server/whatsapp-service');

// ... resto do código ...

// Conectar agente WhatsApp
if (req.method === 'POST' && req.body.action === 'connect') {
    try {
        const { agentId, agentName, agentPrompt, autoReply, typingIndicator, readReceipts } = req.body;

        console.log('🔗 Conectando agente WhatsApp:', agentId);

        // Criar cliente WhatsApp real
        await WhatsAppService.createClient(agentId, {
            name: agentName,
            prompt: agentPrompt,
            autoReply,
            typingIndicator,
            readReceipts
        });

        // Aguardar QR Code ser gerado
        let attempts = 0;
        const maxAttempts = 30; // 30 segundos
        
        while (attempts < maxAttempts) {
            const qrData = WhatsAppService.getQRCode(agentId);
            if (qrData) {
                const connection = {
                    id: `whatsapp_${agentId}_${Date.now()}`,
                    agentId,
                    status: 'connecting',
                    qrCode: qrData.dataURL,
                    createdAt: new Date().toISOString()
                };

                return res.status(200).json({
                    success: true,
                    connection,
                    message: 'QR Code real gerado! Escaneie com seu WhatsApp.'
                });
            }
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            attempts++;
        }

        throw new Error('Timeout ao gerar QR Code');

    } catch (error) {
        console.error('❌ Erro ao conectar agente:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Erro interno do servidor'
        });
    }
}
```

## 🔒 Considerações de Segurança

1. **Sessões**: As sessões do WhatsApp Web são salvas localmente
2. **Rate Limiting**: Implemente limites de mensagens por minuto
3. **Validação**: Valide todas as mensagens recebidas
4. **Logs**: Mantenha logs detalhados para auditoria
5. **Backup**: Faça backup das sessões regularmente

## 📊 Monitoramento e Analytics

1. **Métricas**: Mensagens enviadas/recebidas, tempo de resposta
2. **Saúde**: Status das conexões, reconexões automáticas
3. **Erros**: Log e alertas para falhas
4. **Performance**: Tempo de processamento de IA

## 🚀 Deploy em Produção

### Docker
```dockerfile
FROM node:18-alpine

# Instalar dependências do Puppeteer
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Variáveis de Ambiente
```bash
# .env
WHATSAPP_SESSION_PATH=/app/sessions
OPENAI_API_KEY=your_openai_key
GEMINI_API_KEY=your_gemini_key
NODE_ENV=production
```

## 📝 Próximos Passos

1. **Escolher implementação**: WhatsApp Web.js, Business API ou terceiros
2. **Configurar ambiente**: Instalar dependências e configurar servidor
3. **Implementar serviço**: Criar classes para gerenciar conexões
4. **Testar**: Verificar QR codes reais e troca de mensagens
5. **Integrar IA**: Conectar com OpenAI/Gemini para respostas automáticas
6. **Deploy**: Subir para produção com monitoramento

## 🆘 Suporte

Para implementação completa ou dúvidas técnicas:
- Documentação WhatsApp Web.js: https://wwebjs.dev/
- WhatsApp Business API: https://developers.facebook.com/docs/whatsapp
- Issues do projeto: [GitHub Issues]

---

**Nota**: Esta é uma implementação complexa que requer conhecimento técnico avançado. Considere contratar um desenvolvedor especializado se não tiver experiência com essas tecnologias.
