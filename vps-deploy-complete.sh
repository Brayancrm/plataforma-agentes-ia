#!/bin/bash

# 🚀 Script Completo de Deploy VPS - Plataforma Agentes WhatsApp
# Execute este script no seu VPS Ubuntu 22.04

echo "🚀 INICIANDO DEPLOY COMPLETO DA PLATAFORMA AGENTES WHATSAPP"
echo "=============================================================="

# Cores para logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_step() { echo -e "\n${BLUE}[PASSO $1]${NC} $2"; }
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCESSO]${NC} $1"; }
log_error() { echo -e "${RED}[ERRO]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[AVISO]${NC} $1"; }

# Função para verificar se comando foi executado com sucesso
check_success() {
    if [ $? -eq 0 ]; then
        log_success "$1"
    else
        log_error "$1 - Falhou!"
        exit 1
    fi
}

# PASSO 1: Verificar sistema
log_step "1" "Verificando sistema Ubuntu..."
if ! grep -q "Ubuntu" /etc/os-release; then
    log_error "Este script é para Ubuntu. Sistema detectado: $(lsb_release -d)"
    exit 1
fi
log_success "Sistema Ubuntu confirmado!"

# PASSO 2: Atualizar sistema
log_step "2" "Atualizando sistema Ubuntu..."
apt update && apt upgrade -y
check_success "Sistema atualizado"

# PASSO 3: Instalar ferramentas básicas
log_step "3" "Instalando ferramentas básicas..."
apt install -y curl wget git nano htop unzip
check_success "Ferramentas básicas instaladas"

# PASSO 4: Instalar Node.js 18
log_step "4" "Instalando Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
check_success "Repositório Node.js adicionado"

apt-get install -y nodejs
check_success "Node.js instalado"

NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
log_success "Node.js $NODE_VERSION instalado!"
log_success "NPM $NPM_VERSION instalado!"

# PASSO 5: Instalar dependências do WhatsApp (CRÍTICO!)
log_step "5" "Instalando dependências do WhatsApp Web (Puppeteer)..."
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
check_success "Dependências do WhatsApp instaladas"

# PASSO 6: Clonar projeto
log_step "6" "Clonando projeto do GitHub..."
if [ -d "plataforma-agentes-ia" ]; then
    log_warning "Diretório já existe. Removendo e clonando novamente..."
    rm -rf plataforma-agentes-ia
fi

git clone https://github.com/Brayancrm/plataforma-agentes-ia.git
check_success "Projeto clonado"

cd plataforma-agentes-ia
log_success "Entrando no diretório do projeto"

# PASSO 7: Instalar dependências do projeto
log_step "7" "Instalando dependências do projeto..."
npm install
check_success "Dependências do projeto instaladas"

# PASSO 8: Configurar arquivo .env
log_step "8" "Configurando arquivo .env..."
cat > .env << 'EOL'
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

# Twilio WhatsApp (IMPORTANTE - Configure após deploy!)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_NUMBER=

# IA para respostas automáticas (opcional)
OPENAI_API_KEY=
GEMINI_API_KEY=
EOL
check_success "Arquivo .env criado"

# PASSO 8.1: Configurar .env do servidor
log_step "8.1" "Configurando .env do servidor..."
cd server
cat > .env << 'EOL'
# Google Cloud OAuth 2.0
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:5000/auth/google/callback

# Vertex AI
VERTEX_AI_PROJECT_ID=beprojects-836d6
VERTEX_AI_LOCATION=us-central1

# Servidor
PORT=5000
NODE_ENV=production
SESSION_SECRET=sua-chave-secreta-aqui

# Twilio WhatsApp (IMPORTANTE - Configure após deploy!)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# IA para respostas automáticas (opcional)
OPENAI_API_KEY=
GEMINI_API_KEY=
EOL
cd ..
check_success "Arquivo .env do servidor criado"

# PASSO 9: Instalar PM2
log_step "9" "Instalando PM2 (Process Manager)..."
npm install -g pm2
check_success "PM2 instalado"

# PASSO 9.1: Instalar dependências do servidor
log_step "9.1" "Instalando dependências do servidor..."
cd server
npm install
check_success "Dependências do servidor instaladas"
cd ..

# PASSO 10: Parar aplicações existentes se houver
log_step "10" "Verificando aplicações existentes..."
if pm2 list | grep -q "whatsapp-agents-frontend"; then
    log_info "Parando frontend existente..."
    pm2 stop whatsapp-agents-frontend
    pm2 delete whatsapp-agents-frontend
fi

if pm2 list | grep -q "whatsapp-agents-backend"; then
    log_info "Parando backend existente..."
    pm2 stop whatsapp-agents-backend
    pm2 delete whatsapp-agents-backend
fi

log_success "Aplicações existentes removidas"

# PASSO 11: Iniciar aplicações
log_step "11" "Iniciando backend (servidor OAuth/Twilio)..."
pm2 start server/server.js --name "whatsapp-agents-backend"
check_success "Backend iniciado com PM2"

log_step "11.1" "Iniciando frontend (React)..."
pm2 start npm --name "whatsapp-agents-frontend" -- start
check_success "Frontend iniciado com PM2"

# PASSO 12: Configurar PM2 para iniciar com sistema
log_step "12" "Configurando PM2 para iniciar automaticamente..."
pm2 startup
pm2 save
check_success "PM2 configurado para iniciar com sistema"

# PASSO 13: Configurar firewall
log_step "13" "Configurando firewall..."
ufw allow ssh
ufw allow 3000
ufw allow 5000
ufw --force enable
check_success "Firewall configurado (portas 3000 e 5000 abertas)"

# PASSO 14: Aguardar aplicação inicializar
log_step "14" "Aguardando aplicação inicializar..."
sleep 10

# PASSO 15: Verificar status final
log_step "15" "Verificando status final..."
pm2 status

# PASSO 16: Obter IP público
PUBLIC_IP=$(curl -s ifconfig.me || curl -s ipinfo.io/ip || echo "159.89.136.240")

# RESULTADOS FINAIS
echo ""
echo "🎉 DEPLOY CONCLUÍDO COM SUCESSO!"
echo "=============================================="
echo ""
echo "📋 INFORMAÇÕES DA APLICAÇÃO:"
echo "   • Frontend: http://$PUBLIC_IP:3000"
echo "   • Backend API: http://$PUBLIC_IP:5000"
echo "   • Status: pm2 status"
echo "   • Logs Frontend: pm2 logs whatsapp-agents-frontend"
echo "   • Logs Backend: pm2 logs whatsapp-agents-backend"
echo "   • Reiniciar: pm2 restart all"
echo ""
echo "🔥 PRÓXIMOS PASSOS:"
echo "   1. Acesse: http://$PUBLIC_IP:3000"
echo "   2. Clique em 'WhatsApp' no menu"
echo "   3. Crie um novo agente"
echo "   4. Clique 'Conectar WhatsApp'"
echo "   5. Escaneie o QR code com seu celular"
echo ""
echo "📊 COMANDOS ÚTEIS:"
echo "   • Ver logs: pm2 logs whatsapp-agents"
echo "   • Ver status: pm2 status"
echo "   • Monitorar: pm2 monit"
echo "   • Ver uso de recursos: htop"
echo ""
echo "🚨 TROUBLESHOOTING:"
echo "   • Se aplicação não carregar: pm2 restart whatsapp-agents"
echo "   • Ver erros: pm2 logs whatsapp-agents --err"
echo "   • Verificar porta: netstat -tulpn | grep :3000"
echo ""

log_success "Plataforma de Agentes WhatsApp está funcionando!"
log_success "Acesse: http://$PUBLIC_IP:3000"

echo ""
echo "🎯 TESTE AGORA:"
echo "   1. Abra: http://$PUBLIC_IP:3000"
echo "   2. Vá para 'WhatsApp'"
echo "   3. Crie um agente"
echo "   4. Conecte via QR code real!"
echo ""
