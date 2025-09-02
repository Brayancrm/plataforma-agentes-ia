#!/bin/bash

# 🚀 Script Automatizado de Deploy VPS
# Execute este script no seu VPS Ubuntu 22.04

echo "🚀 Iniciando deploy da Plataforma de Agentes WhatsApp..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para logs coloridos
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se é Ubuntu
if ! grep -q "Ubuntu" /etc/os-release; then
    log_error "Este script é para Ubuntu. Sistema detectado: $(lsb_release -d)"
    exit 1
fi

log_success "Sistema Ubuntu detectado!"

# 1. Atualizar sistema
log_info "Atualizando sistema..."
apt update && apt upgrade -y
apt install -y curl wget git nano htop unzip

log_success "Sistema atualizado!"

# 2. Instalar Node.js 18
log_info "Instalando Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Verificar instalação
NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
log_success "Node.js $NODE_VERSION instalado!"
log_success "NPM $NPM_VERSION instalado!"

# 3. Instalar dependências do Puppeteer/WhatsApp
log_info "Instalando dependências do WhatsApp Web..."
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

log_success "Dependências do WhatsApp instaladas!"

# 4. Clonar projeto
log_info "Clonando projeto do GitHub..."
if [ -d "plataforma-agentes-ia" ]; then
    log_warning "Diretório já existe. Atualizando..."
    cd plataforma-agentes-ia
    git pull origin master
else
    git clone https://github.com/Brayancrm/plataforma-agentes-ia.git
    cd plataforma-agentes-ia
fi

log_success "Projeto clonado/atualizado!"

# 5. Instalar dependências
log_info "Instalando dependências do projeto..."
npm install

log_success "Dependências instaladas!"

# 6. Configurar arquivo .env
log_info "Configurando arquivo .env..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    cat > .env << EOL
NODE_ENV=production
PORT=3000

# Firebase (opcional)
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=

# OpenAI (opcional)
REACT_APP_OPENAI_API_KEY=

# Google (opcional)
REACT_APP_GOOGLE_CLIENT_ID=
REACT_APP_GOOGLE_CLIENT_SECRET=
EOL
    log_success "Arquivo .env criado!"
else
    log_warning "Arquivo .env já existe. Mantendo configurações atuais."
fi

# 7. Instalar PM2
log_info "Instalando PM2..."
npm install -g pm2

# 8. Parar aplicação se estiver rodando
if pm2 list | grep -q "whatsapp-agents"; then
    log_info "Parando aplicação existente..."
    pm2 stop whatsapp-agents
    pm2 delete whatsapp-agents
fi

# 9. Iniciar aplicação
log_info "Iniciando aplicação..."
pm2 start npm --name "whatsapp-agents" -- start

# 10. Configurar PM2 para iniciar com sistema
log_info "Configurando PM2 para iniciar com o sistema..."
pm2 startup
pm2 save

log_success "PM2 configurado!"

# 11. Configurar firewall
log_info "Configurando firewall..."
ufw allow ssh
ufw allow 3000
ufw --force enable

log_success "Firewall configurado!"

# 12. Verificar status
log_info "Verificando status da aplicação..."
sleep 5
pm2 status

# 13. Mostrar informações finais
echo ""
echo "🎉 DEPLOY CONCLUÍDO COM SUCESSO!"
echo ""
echo "📋 INFORMAÇÕES:"
echo "   • Aplicação: http://$(curl -s ifconfig.me):3000"
echo "   • Status: pm2 status"
echo "   • Logs: pm2 logs whatsapp-agents"
echo "   • Reiniciar: pm2 restart whatsapp-agents"
echo ""
echo "🔥 PRÓXIMOS PASSOS:"
echo "   1. Acesse: http://$(curl -s ifconfig.me):3000"
echo "   2. Vá para seção 'WhatsApp'"
echo "   3. Crie um agente"
echo "   4. Conecte seu WhatsApp via QR code"
echo ""
echo "📞 SUPORTE:"
echo "   • Logs em tempo real: pm2 logs whatsapp-agents --lines 100"
echo "   • Monitoramento: pm2 monit"
echo ""

log_success "Plataforma de Agentes WhatsApp está funcionando!"
