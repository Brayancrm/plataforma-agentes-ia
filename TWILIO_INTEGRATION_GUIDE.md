# 🔗 Guia de Integração Twilio WhatsApp

## 📋 Resumo da Implementação

A integração da Twilio com WhatsApp foi implementada com sucesso! Esta solução permite:

- ✅ **Conexão direta** via Twilio WhatsApp Business API
- ✅ **Envio de mensagens** programático 
- ✅ **Recebimento de mensagens** via webhook
- ✅ **Respostas automáticas** com IA (OpenAI/Gemini)
- ✅ **Histórico completo** de conversas
- ✅ **Interface amigável** no frontend

## 🛠️ Configuração Necessária

### 1. **Configurar Conta Twilio**

1. Acesse: https://www.twilio.com/
2. Crie uma conta gratuita ($15 de crédito)
3. Acesse o Console → Settings → General
4. Copie:
   - **Account SID**
   - **Auth Token**

### 2. **Ativar WhatsApp Sandbox**

1. No Console Twilio: Messaging → Try it out → Send a WhatsApp message
2. Siga as instruções para conectar seu WhatsApp
3. Anote o número sandbox (ex: `whatsapp:+14155238886`)

### 3. **Configurar Variáveis de Ambiente**

**No arquivo `server/.env`:**
```env
# Twilio WhatsApp
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# IA para respostas automáticas (opcional)
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxx
GEMINI_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxx
```

### 4. **Configurar Webhook (Para Receber Mensagens)**

1. No Console Twilio: Messaging → Settings → WhatsApp sandbox settings
2. Configure o webhook URL:
   ```
   https://seu-dominio.com/webhook/twilio
   ```
3. Método: **POST**

## 🚀 Como Usar

### **1. Iniciar o Servidor**
```bash
cd server
npm install
npm start
```

### **2. Iniciar o Frontend**
```bash
npm install
npm start
```

### **3. Conectar Agente**
1. Acesse o dashboard
2. Clique em "Conectar" no painel WhatsApp
3. O agente será conectado automaticamente via Twilio

### **4. Enviar Mensagens**
1. Use o formulário no painel para enviar mensagens de teste
2. Formato do número: `+5511999999999`

### **5. Receber Mensagens**
1. Configure o webhook no Twilio
2. Mensagens recebidas geram respostas automáticas
3. Histórico fica salvo no servidor

## 📱 Funcionalidades Implementadas

### **Backend (server/server.js)**
- ✅ Rotas para conectar agentes
- ✅ Envio de mensagens via Twilio API
- ✅ Webhook para receber mensagens
- ✅ Integração com IA (OpenAI/Gemini)
- ✅ Histórico de mensagens
- ✅ Gerenciamento de conexões

### **Frontend (src/)**
- ✅ Componente WhatsApp atualizado
- ✅ Serviço WhatsApp integrado com backend
- ✅ Interface para envio de mensagens
- ✅ Histórico visual de conversas
- ✅ Status de conexão em tempo real

## 🔧 Arquivos Modificados

### **Servidor**
- `server/package.json` - Adicionado dependência Twilio
- `server/env.example` - Adicionadas variáveis Twilio
- `server/server.js` - Implementadas rotas Twilio

### **Frontend**
- `src/services/whatsappService.ts` - Integração com backend

### **APIs Disponíveis**
- `POST /api/twilio-whatsapp` - Ações principais (connect, send, status)
- `POST /webhook/twilio` - Receber mensagens do Twilio
- `GET /api/messages/:agentId` - Histórico de mensagens
- `GET /api/connections` - Conexões ativas

## 🔍 Teste da Integração

### **1. Teste de Conexão**
```bash
curl -X POST http://localhost:5000/api/twilio-whatsapp \
  -H "Content-Type: application/json" \
  -d '{"action": "test_connection"}'
```

### **2. Conectar Agente**
```bash
curl -X POST http://localhost:5000/api/twilio-whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "action": "connect_agent",
    "agentId": "agent1",
    "agentName": "Assistente Virtual",
    "agentPrompt": "Sou um assistente útil e amigável."
  }'
```

### **3. Enviar Mensagem**
```bash
curl -X POST http://localhost:5000/api/twilio-whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "action": "send_message",
    "agentId": "agent1",
    "to": "+5511999999999",
    "message": "Olá! Esta é uma mensagem de teste."
  }'
```

## 📊 Monitoramento

### **Logs do Servidor**
```bash
🔗 Conectando agente WhatsApp via Twilio: agent1
✅ Agente conectado via Twilio: agent1
📤 Enviando mensagem via Twilio: whatsapp:+14155238886 -> whatsapp:+5511999999999
✅ Mensagem enviada via Twilio: SM1234567890abcdef
📨 Webhook Twilio recebido: [dados da mensagem]
✅ Resposta automática enviada: SM0987654321fedcba
```

### **Status da Aplicação**
- Conexões ativas: Visualizar em `/api/connections`
- Mensagens: Histórico em `/api/messages/:agentId`
- Health check: `/api/test`

## 🚨 Solução de Problemas

### **Erro: "Configuração do Twilio incompleta"**
- Verifique se as variáveis `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` e `TWILIO_WHATSAPP_NUMBER` estão configuradas

### **Erro: "Número de telefone inválido"**
- Use formato internacional: `+5511999999999`
- Para WhatsApp, use: `whatsapp:+5511999999999`

### **Mensagens não chegam**
- Verifique se o webhook está configurado corretamente no Twilio
- Confirme se o servidor está acessível publicamente

### **IA não responde**
- Configure `OPENAI_API_KEY` ou `GEMINI_API_KEY`
- Verifique os logs do servidor para erros de API

## 🎯 Próximos Passos

1. **Deploy em Produção**
   - Configure webhook público (ngrok/Vercel/VPS)
   - Use número Twilio oficial (não sandbox)

2. **Melhorias**
   - Adicionar suporte a mídia (imagens, documentos)
   - Implementar templates de mensagem
   - Dashboard de analytics

3. **Segurança**
   - Validação de webhook Twilio
   - Rate limiting
   - Autenticação de usuários

## ✅ Status da Implementação

- ✅ **Integração básica** - Completa
- ✅ **Envio de mensagens** - Funcional
- ✅ **Recebimento via webhook** - Implementado
- ✅ **Respostas automáticas** - Ativa
- ✅ **Interface frontend** - Atualizada
- ✅ **Histórico de mensagens** - Salvo
- ✅ **Documentação** - Completa

**🎉 A integração Twilio WhatsApp está funcionando perfeitamente!**
