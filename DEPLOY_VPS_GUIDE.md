# 🚀 **Guia Completo - Deploy VPS DigitalOcean**

## **📋 Passo 1: Criar VPS**

### **1.1 Criar conta DigitalOcean**
- Acesse: https://digitalocean.com
- Crie conta gratuita (cartão de crédito necessário)
- Receba $200 de crédito por 60 dias

### **1.2 Criar Droplet**
```
1. Dashboard → Create → Droplets
2. Escolha: Ubuntu 22.04 LTS
3. Plano: Basic → Regular → $5/mês (1GB RAM)
4. Datacenter: São Paulo (mais próximo)
5. Authentication: SSH Key (recomendado) ou Password
6. Hostname: whatsapp-agents
7. Clique "Create Droplet"
```

### **1.3 Conectar via SSH**
```bash
# Se usou SSH Key
ssh root@SEU_IP_DO_DROPLET

# Se usou senha
ssh root@SEU_IP_DO_DROPLET
# Digite a senha quando solicitado
```

## **🔧 Passo 2: Configurar Servidor**

### **2.1 Atualizar Sistema**
```bash
# Atualizar sistema
apt update && apt upgrade -y

# Instalar ferramentas básicas
apt install -y curl wget git nano htop
```

### **2.2 Instalar Node.js**
```bash
# Adicionar repositório Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Instalar Node.js
apt-get install -y nodejs

# Verificar instalação
node --version
npm --version
```

### **2.3 Instalar Dependências do Puppeteer**
```bash
# Instalar dependências necessárias para WhatsApp Web
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

## **📦 Passo 3: Deploy da Aplicação**

### **3.1 Clonar Projeto**
```bash
# Clonar repositório
git clone https://github.com/Brayancrm/plataforma-agentes-ia.git
cd plataforma-agentes-ia

# Instalar dependências
npm install
```

### **3.2 Configurar Variáveis de Ambiente**
```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar variáveis
nano .env
```

**Conteúdo do .env:**
```env
# Configurações básicas
NODE_ENV=production
PORT=3000

# Firebase (se usar)
REACT_APP_FIREBASE_API_KEY=sua_chave
REACT_APP_FIREBASE_AUTH_DOMAIN=seu_dominio
REACT_APP_FIREBASE_PROJECT_ID=seu_projeto

# OpenAI (se usar)
REACT_APP_OPENAI_API_KEY=sua_chave_openai

# Google (se usar)
REACT_APP_GOOGLE_CLIENT_ID=sua_chave_google
REACT_APP_GOOGLE_CLIENT_SECRET=sua_chave_google

# Outras APIs conforme necessário
```

### **3.3 Instalar PM2 (Gerenciador de Processos)**
```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar aplicação com PM2
pm2 start npm --name "whatsapp-agents" -- start

# Configurar para iniciar com o sistema
pm2 startup
pm2 save
```

### **3.4 Verificar Status**
```bash
# Verificar se está rodando
pm2 status

# Ver logs
pm2 logs whatsapp-agents

# Reiniciar se necessário
pm2 restart whatsapp-agents
```

## **🌐 Passo 4: Configurar Nginx (Opcional)**

### **4.1 Instalar Nginx**
```bash
apt install nginx
```

### **4.2 Configurar Site**
```bash
# Criar configuração do site
nano /etc/nginx/sites-available/whatsapp-agents
```

**Conteúdo:**
```nginx
server {
    listen 80;
    server_name SEU_IP_DO_DROPLET;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### **4.3 Ativar Site**
```bash
# Criar link simbólico
ln -s /etc/nginx/sites-available/whatsapp-agents /etc/nginx/sites-enabled/

# Testar configuração
nginx -t

# Reiniciar Nginx
systemctl restart nginx

# Habilitar para iniciar com sistema
systemctl enable nginx
```

## **🔒 Passo 5: Configurar Firewall**

```bash
# Permitir SSH
ufw allow ssh

# Permitir HTTP
ufw allow 80

# Permitir HTTPS (se usar SSL)
ufw allow 443

# Ativar firewall
ufw enable

# Verificar status
ufw status
```

## **✅ Passo 6: Testar Aplicação**

### **6.1 Acessar via IP**
```
http://SEU_IP_DO_DROPLET:3000
```

### **6.2 Testar WhatsApp**
1. Acesse a aplicação
2. Vá para seção "WhatsApp"
3. Crie um agente
4. Clique "Conectar WhatsApp"
5. Aguarde QR code real aparecer
6. Escaneie com seu WhatsApp

## **📊 Passo 7: Monitoramento**

### **7.1 Comandos Úteis**
```bash
# Ver status da aplicação
pm2 status

# Ver logs em tempo real
pm2 logs whatsapp-agents --lines 100

# Ver uso de recursos
htop

# Ver espaço em disco
df -h

# Ver memória
free -h
```

### **7.2 Logs do WhatsApp**
```bash
# Ver logs específicos do WhatsApp
pm2 logs whatsapp-agents | grep -i whatsapp

# Ver logs de erro
pm2 logs whatsapp-agents --err
```

## **🔧 Passo 8: Manutenção**

### **8.1 Atualizar Aplicação**
```bash
# Parar aplicação
pm2 stop whatsapp-agents

# Fazer pull das mudanças
git pull origin master

# Instalar novas dependências
npm install

# Reiniciar aplicação
pm2 start whatsapp-agents
```

### **8.2 Backup**
```bash
# Backup do diretório da aplicação
tar -czf backup-$(date +%Y%m%d).tar.gz /root/plataforma-agentes-ia

# Backup das sessões WhatsApp (se existirem)
tar -czf whatsapp-sessions-$(date +%Y%m%d).tar.gz /root/.wwebjs_auth
```

## **🎯 Próximos Passos**

1. **Configurar domínio** (opcional)
2. **Configurar SSL** (recomendado)
3. **Configurar backup automático**
4. **Monitoramento avançado**

## **💡 Dicas Importantes**

- **Sempre use PM2** para gerenciar a aplicação
- **Monitore os logs** regularmente
- **Faça backups** das sessões WhatsApp
- **Mantenha o sistema atualizado**
- **Use firewall** para segurança

## **🚨 Troubleshooting**

### **Problema: QR Code não aparece**
```bash
# Verificar logs
pm2 logs whatsapp-agents

# Verificar se Puppeteer está funcionando
node -e "console.log('Puppeteer OK')"
```

### **Problema: Aplicação não inicia**
```bash
# Verificar portas
netstat -tulpn | grep :3000

# Verificar logs de erro
pm2 logs whatsapp-agents --err
```

### **Problema: WhatsApp desconecta**
```bash
# Verificar sessões
ls -la /root/.wwebjs_auth

# Limpar sessões corrompidas
rm -rf /root/.wwebjs_auth/*
```

---

**🎉 Parabéns! Sua aplicação WhatsApp está rodando no VPS!**
