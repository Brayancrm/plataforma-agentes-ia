# 🚀 Deploy Completo - Plataforma Agentes WhatsApp com Twilio

## 🎯 Visão Geral

Este guia mostra como fazer o deploy completo da plataforma com integração Twilio WhatsApp Business API.

### ✅ O que será deployado:
- ✅ **Frontend React** (porta 3000)
- ✅ **Backend Node.js** (porta 5000) 
- ✅ **API Twilio WhatsApp** integrada
- ✅ **Respostas automáticas** com IA
- ✅ **Webhooks** para receber mensagens
- ✅ **Interface completa** de gerenciamento

---

## 🔧 Opção 1: Deploy VPS (Recomendado)

### **Passo 1: Criar VPS**
1. **DigitalOcean:** https://digitalocean.com
2. **Configuração:**
   - OS: Ubuntu 22.04 LTS
   - Plano: $5/mês (1GB RAM)
   - Região: São Paulo
   - Nome: whatsapp-agents

### **Passo 2: Deploy Automatizado**
```bash
# Conectar no VPS
ssh root@SEU_IP_DO_VPS

# Executar script de deploy
curl -sSL https://raw.githubusercontent.com/Brayancrm/plataforma-agentes-ia/master/vps-deploy-complete.sh | bash
```

### **Passo 3: Configurar Twilio**
```bash
# Editar configurações
nano plataforma-agentes-ia/server/.env

# Adicionar suas credenciais Twilio:
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Reiniciar backend
pm2 restart whatsapp-agents-backend
```

### **Passo 4: Configurar Webhook Twilio**
1. **Console Twilio:** https://console.twilio.com
2. **Messaging → Settings → WhatsApp sandbox**
3. **Webhook URL:** `http://SEU_IP_VPS:5000/webhook/twilio`
4. **Método:** POST

---

## 🌐 Opção 2: Deploy Vercel (Frontend + APIs)

### **Passo 1: Preparar Repositório**
```bash
# Fazer commit das alterações
git add .
git commit -m "Deploy com integração Twilio"
git push origin main
```

### **Passo 2: Deploy na Vercel**
1. **Acesse:** https://vercel.com
2. **Import Project** do GitHub
3. **Configure variáveis de ambiente:**

```env
# Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# IA (opcional)
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxx
GEMINI_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxx

# Google Cloud (se usar Veo 3)
GOOGLE_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxx
GOOGLE_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxx
VERTEX_AI_PROJECT_ID=beprojects-836d6
VERTEX_AI_LOCATION=us-central1
```

### **Passo 3: Configurar Webhook**
- **URL:** `https://seu-app.vercel.app/api/webhook-twilio`

---

## ⚙️ Configuração Pós-Deploy

### **1. Obter Credenciais Twilio**
1. **Criar conta:** https://www.twilio.com/try-twilio
2. **Console → Account Info:**
   - Account SID
   - Auth Token
3. **Messaging → Try it out → WhatsApp:**
   - Ativar sandbox
   - Anotar número (ex: whatsapp:+14155238886)

### **2. Configurar IA (Opcional)**
```bash
# OpenAI
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxx

# Ou Gemini
GEMINI_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxx
```

### **3. Configurar Webhook**
```bash
# URL do webhook (substitua pelo seu IP/domínio)
http://SEU_IP:5000/webhook/twilio
https://seu-app.vercel.app/api/webhook-twilio
```

---

## 🧪 Teste da Integração

### **1. Teste Frontend**
```bash
# Acesse: http://SEU_IP:3000
# ou: https://seu-app.vercel.app

1. Clique em "WhatsApp"
2. Conecte um agente
3. Envie mensagem de teste
```

### **2. Teste API**
```bash
# Teste conexão Twilio
curl -X POST http://SEU_IP:5000/api/twilio-whatsapp \
  -H "Content-Type: application/json" \
  -d '{"action": "test_connection"}'

# Enviar mensagem
curl -X POST http://SEU_IP:5000/api/twilio-whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "action": "send_message",
    "to": "+5511999999999",
    "message": "Teste da API Twilio!"
  }'
```

### **3. Teste Webhook**
1. Configure webhook no Twilio
2. Envie mensagem para número sandbox
3. Verifique se recebe resposta automática

---

## 📊 Monitoramento

### **VPS:**
```bash
# Status das aplicações
pm2 status

# Logs em tempo real
pm2 logs whatsapp-agents-backend
pm2 logs whatsapp-agents-frontend

# Uso de recursos
htop

# Reiniciar aplicações
pm2 restart all
```

### **Vercel:**
- **Dashboard:** https://vercel.com/dashboard
- **Functions:** Ver logs das APIs
- **Analytics:** Monitorar uso

---

## 🔧 APIs Disponíveis

### **Twilio WhatsApp:**
- `POST /api/twilio-whatsapp` - Ações principais
- `POST /webhook/twilio` - Receber mensagens
- `GET /api/messages/:agentId` - Histórico
- `GET /api/connections` - Conexões ativas

### **Outras APIs:**
- `GET /api/test` - Health check
- `POST /api/generate-video` - Veo 3 (se configurado)

---

## 🚨 Troubleshooting

### **Aplicação não carrega:**
```bash
# VPS
pm2 status
pm2 logs whatsapp-agents-frontend
pm2 restart all

# Vercel
# Verificar logs no dashboard
```

### **Twilio não funciona:**
```bash
# Verificar configurações
cat server/.env | grep TWILIO

# Testar API
curl http://SEU_IP:5000/api/twilio-whatsapp \
  -d '{"action": "test_connection"}'

# Ver logs
pm2 logs whatsapp-agents-backend | grep -i twilio
```

### **Webhook não recebe mensagens:**
1. **Verificar URL:** Deve estar acessível publicamente
2. **Testar conectividade:** `curl http://SEU_IP:5000/webhook/twilio`
3. **Logs do Twilio:** Console → Monitor → Logs

### **IA não responde:**
```bash
# Verificar chaves
cat server/.env | grep -E "(OPENAI|GEMINI)"

# Ver logs de erro
pm2 logs whatsapp-agents-backend | grep -i error
```

---

## 🎉 Resultado Final

### **✅ VPS Deploy:**
- **Frontend:** http://SEU_IP:3000
- **Backend:** http://SEU_IP:5000
- **Custo:** $5/mês (DigitalOcean)

### **✅ Vercel Deploy:**
- **App:** https://seu-app.vercel.app
- **APIs:** https://seu-app.vercel.app/api/*
- **Custo:** Gratuito (até limites)

### **🚀 Funcionalidades:**
- ✅ Interface web completa
- ✅ Conexão Twilio WhatsApp
- ✅ Envio/recebimento de mensagens
- ✅ Respostas automáticas com IA
- ✅ Histórico de conversas
- ✅ Webhook funcionando
- ✅ Monitoramento em tempo real

---

## 📞 Suporte

### **Logs importantes:**
```bash
# Backend (APIs/Twilio)
pm2 logs whatsapp-agents-backend

# Frontend (Interface)
pm2 logs whatsapp-agents-frontend

# Sistema
journalctl -f
```

### **Comandos úteis:**
```bash
# Status geral
pm2 status && pm2 monit

# Reiniciar tudo
pm2 restart all && pm2 save

# Limpar logs
pm2 flush
```

---

**🎯 Sua plataforma de agentes WhatsApp com Twilio está funcionando!**

**Acesse agora:** http://SEU_IP:3000 ou https://seu-app.vercel.app
