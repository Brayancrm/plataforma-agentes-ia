#!/bin/bash

# 🚀 Deploy VPS - WhatsApp Web OFICIAL
# Script otimizado para WhatsApp Web com QR codes reais

echo "🚀 DEPLOY VPS - WHATSAPP WEB OFICIAL"
echo "===================================="

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_step() { echo -e "\n${BLUE}[PASSO $1]${NC} $2"; }
log_success() { echo -e "${GREEN}✅${NC} $1"; }
log_error() { echo -e "${RED}❌${NC} $1"; exit 1; }

# Verificar se é root
if [ "$EUID" -ne 0 ]; then
    log_error "Execute como root: sudo bash deploy-vps-whatsapp-oficial.sh"
fi

# PASSO 1: Atualizar sistema
log_step "1" "Atualizando Ubuntu..."
apt update && apt upgrade -y || log_error "Falha ao atualizar sistema"
log_success "Sistema atualizado"

# PASSO 2: Instalar dependências básicas
log_step "2" "Instalando ferramentas básicas..."
apt install -y curl wget git nano htop unzip || log_error "Falha ao instalar ferramentas"
log_success "Ferramentas instaladas"

# PASSO 3: Instalar Node.js 22
log_step "3" "Instalando Node.js 22..."
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - || log_error "Falha ao adicionar repositório Node.js"
apt-get install -y nodejs || log_error "Falha ao instalar Node.js"
log_success "Node.js $(node --version) instalado"

# PASSO 4: Instalar dependências WhatsApp Web (CRÍTICO!)
log_step "4" "Instalando dependências WhatsApp Web..."
apt-get install -y \
    chromium-browser \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libatspi2.0-0 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libx11-6 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxrandr2 \
    libxss1 \
    libxtst6 \
    fonts-liberation \
    libappindicator3-1 \
    xdg-utils || log_error "Falha ao instalar dependências WhatsApp"
log_success "Dependências WhatsApp instaladas"

# PASSO 5: Clonar projeto
log_step "5" "Clonando projeto..."
cd /root
rm -rf plataforma-agentes-ia
git clone https://github.com/Brayancrm/plataforma-agentes-ia.git || log_error "Falha ao clonar projeto"
cd plataforma-agentes-ia
log_success "Projeto clonado"

# PASSO 6: Instalar dependências
log_step "6" "Instalando dependências do projeto..."
npm install || log_error "Falha ao instalar dependências"

cd server
npm install || log_error "Falha ao instalar dependências do servidor"
cd ..
log_success "Dependências instaladas"

# PASSO 7: Configurar .env
log_step "7" "Configurando variáveis de ambiente..."
cat > .env << 'EOL'
NODE_ENV=production
PORT=3000
REACT_APP_BACKEND_URL=http://localhost:5000
EOL

cat > server/.env << 'EOL'
NODE_ENV=production
PORT=5000
SESSION_SECRET=whatsapp-oficial-secret-2025
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
VERTEX_AI_PROJECT_ID=
OPENAI_API_KEY=
GEMINI_API_KEY=
EOL
log_success "Arquivos .env configurados"

# PASSO 8: Instalar PM2
log_step "8" "Instalando PM2..."
npm install -g pm2 || log_error "Falha ao instalar PM2"
log_success "PM2 instalado"

# PASSO 9: Parar aplicações existentes
log_step "9" "Limpando aplicações existentes..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true
log_success "Aplicações limpas"

# PASSO 10: Fazer build da aplicação
log_step "10" "Fazendo build da aplicação..."
npm run build || log_error "Falha no build"
log_success "Build concluído"

# PASSO 11: Iniciar backend
log_step "11" "Iniciando backend WhatsApp..."
cd server
pm2 start server.js --name "whatsapp-backend" || log_error "Falha ao iniciar backend"
cd ..
log_success "Backend iniciado"

# PASSO 12: Servir frontend
log_step "12" "Iniciando frontend..."
npm install -g serve
pm2 start "serve -s build -l 3000" --name "whatsapp-frontend" || log_error "Falha ao iniciar frontend"
log_success "Frontend iniciado"

# PASSO 13: Configurar PM2 para iniciar com sistema
log_step "13" "Configurando inicialização automática..."
pm2 startup systemd -u root --hp /root || log_error "Falha ao configurar startup"
pm2 save || log_error "Falha ao salvar configuração PM2"
log_success "Inicialização automática configurada"

# PASSO 14: Configurar firewall
log_step "14" "Configurando firewall..."
ufw allow ssh
ufw allow 3000
ufw allow 5000
ufw --force enable
log_success "Firewall configurado"

# PASSO 15: Aguardar inicialização
log_step "15" "Aguardando aplicação inicializar..."
sleep 15

# PASSO 16: Obter IP público
PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s ipinfo.io/ip 2>/dev/null || echo "SEU_IP_VPS")

# RESULTADOS
echo ""
echo "🎉 WHATSAPP WEB OFICIAL CONFIGURADO!"
echo "====================================="
echo ""
echo "📱 ACESSE SUA APLICAÇÃO:"
echo "   Frontend: http://$PUBLIC_IP:3000"
echo "   Backend:  http://$PUBLIC_IP:5000"
echo ""
echo "🔥 TESTE O WHATSAPP:"
echo "   1. Acesse: http://$PUBLIC_IP:3000"
echo "   2. Vá para seção 'WhatsApp'"
echo "   3. Clique no toggle 'Ativo'"
echo "   4. QR Code OFICIAL aparecerá"
echo "   5. Escaneie com WhatsApp do celular"
echo ""
echo "📊 COMANDOS ÚTEIS:"
echo "   Status:    pm2 status"
echo "   Logs:      pm2 logs"
echo "   Reiniciar: pm2 restart all"
echo "   Monitor:   pm2 monit"
echo ""
echo "🚨 IMPORTANTE:"
echo "   • QR codes agora são 100% oficiais"
echo "   • Sessions são persistentes"
echo "   • Aplicação roda 24/7"
echo ""

log_success "Deploy concluído! Acesse: http://$PUBLIC_IP:3000"
