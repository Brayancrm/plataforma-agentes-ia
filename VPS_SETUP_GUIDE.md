# 🚀 **Guia Prático - Criação VPS DigitalOcean**

## **📋 PASSO 1: Criar Conta e VPS**

### **1.1 Criar Conta DigitalOcean**
👉 **ACESSE AGORA:** https://digitalocean.com

**Benefícios:**
- ✅ $200 de crédito gratuito por 60 dias
- ✅ VPS de $5/mês = 40 meses grátis!
- ✅ Suporte 24/7

### **1.2 Criar Droplet (VPS)**

**Siga exatamente estes passos:**

1. **Dashboard → Create → Droplets**
2. **Choose an image:** Ubuntu 22.04 (LTS) x64
3. **Choose a plan:** 
   - Basic
   - Regular with SSD
   - $5/mês - 1 GB RAM, 1 vCPU, 25 GB SSD
4. **Choose a datacenter region:** São Paulo 1
5. **Authentication:**
   - Recomendado: SSH Key (mais seguro)
   - Alternativa: Password (mais fácil)
6. **Hostname:** `whatsapp-agents`
7. **Clique "Create Droplet"**

### **1.3 Aguardar Criação**
- ⏱️ Tempo: 1-2 minutos
- 📧 Você receberá email com IP e credenciais
- 💡 Anote o IP do seu VPS!

---

## **🔧 PASSO 2: Comandos para Configurar VPS**

### **2.1 Conectar via SSH**

**Windows (PowerShell):**
```powershell
ssh root@SEU_IP_DO_VPS
# Digite "yes" quando perguntado
# Digite a senha se usar password
```

**Alternativa Windows:** Use PuTTY se preferir interface gráfica

### **2.2 Atualizar Sistema**
```bash
# Copie e cole este bloco completo:
apt update && apt upgrade -y
apt install -y curl wget git nano htop unzip
```

### **2.3 Instalar Node.js 18**
```bash
# Copie e cole este bloco completo:
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Verificar instalação:
node --version
npm --version
```

### **2.4 Instalar Dependências do WhatsApp (CRÍTICO!)**
```bash
# Copie e cole este bloco completo:
apt-get install -y \
    gconf-service \
    libasound2 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgcc1 \
    libgconf-2-4 \
    libgdk-pixbuf2.0-0 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    ca-certificates \
    fonts-liberation \
    libappindicator1 \
    libnss3 \
    lsb-release \
    xdg-utils \
    wget
```

### **2.5 Clonar e Configurar Projeto**
```bash
# Copie e cole este bloco completo:
git clone https://github.com/Brayancrm/plataforma-agentes-ia.git
cd plataforma-agentes-ia
npm install
```

### **2.6 Configurar Variáveis de Ambiente**
```bash
# Criar arquivo .env:
cp .env.example .env
nano .env
```

**No editor nano, cole este conteúdo:**
```env
NODE_ENV=production
PORT=3000

# Firebase (opcional - use suas chaves se tiver)
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=

# OpenAI (opcional - use sua chave se tiver)
REACT_APP_OPENAI_API_KEY=

# Google (opcional - use suas chaves se tiver)
REACT_APP_GOOGLE_CLIENT_ID=
REACT_APP_GOOGLE_CLIENT_SECRET=
```

**Para sair do nano:**
- Ctrl + X
- Y (confirmar)
- Enter (salvar)

### **2.7 Instalar e Configurar PM2**
```bash
# Copie e cole este bloco completo:
npm install -g pm2
pm2 start npm --name "whatsapp-agents" -- start
pm2 startup
pm2 save
```

### **2.8 Verificar Status**
```bash
# Verificar se está funcionando:
pm2 status
pm2 logs whatsapp-agents --lines 20
```

### **2.9 Configurar Firewall**
```bash
# Copie e cole este bloco completo:
ufw allow ssh
ufw allow 3000
ufw --force enable
ufw status
```

---

## **✅ TESTE FINAL**

### **Acessar Aplicação:**
```
http://SEU_IP_DO_VPS:3000
```

**Se tudo funcionou:**
- ✅ Você verá a interface da aplicação
- ✅ Poderá acessar a seção "WhatsApp"
- ✅ QR codes reais serão gerados

---

## **📞 PRÓXIMOS PASSOS**

1. **Acesse:** http://SEU_IP_DO_VPS:3000
2. **Vá para:** Seção "WhatsApp"
3. **Crie um agente**
4. **Clique:** "Conectar WhatsApp"
5. **Escaneie o QR code** com seu celular

---

## **🚨 TROUBLESHOOTING**

### **Aplicação não carrega:**
```bash
pm2 logs whatsapp-agents
pm2 restart whatsapp-agents
```

### **Porta bloqueada:**
```bash
netstat -tulpn | grep :3000
ufw status
```

### **QR Code não aparece:**
```bash
pm2 logs whatsapp-agents | grep -i whatsapp
```

---

**🎉 Parabéns! Seu WhatsApp com QR codes reais está funcionando!**
