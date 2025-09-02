# 🚀 **INSTRUÇÕES FINAIS - Deploy VPS**

## **📋 PASSO 1: Criar VPS (FAÇA AGORA)**

### **🔗 Acesse:** https://digitalocean.com

### **⚙️ Configurações do Droplet:**
- **SO:** Ubuntu 22.04 (LTS) x64
- **Plano:** $5/mês (1GB RAM, 1 vCPU, 25GB SSD)
- **Região:** São Paulo 1
- **Nome:** whatsapp-agents

### **📝 Anote o IP do seu VPS:** `___.___.___.___ `

---

## **🔧 PASSO 2: Deploy Automatizado**

### **Opção A: Script Automatizado (RECOMENDADO)**

**1. Conecte no VPS:**
```bash
ssh root@SEU_IP_DO_VPS
```

**2. Execute o script:**
```bash
curl -sSL https://raw.githubusercontent.com/Brayancrm/plataforma-agentes-ia/master/deploy-vps.sh | bash
```

### **Opção B: Comandos Manuais**

**Se preferir executar passo a passo, use o arquivo:** `VPS_SETUP_GUIDE.md`

---

## **✅ VERIFICAÇÃO**

### **Após o deploy, verifique:**

**1. Status da aplicação:**
```bash
pm2 status
```

**2. Logs da aplicação:**
```bash
pm2 logs whatsapp-agents --lines 20
```

**3. Acesse a aplicação:**
```
http://SEU_IP_DO_VPS:3000
```

---

## **🎯 TESTE WHATSAPP**

### **1. Acessar Interface:**
- Abra: `http://SEU_IP_DO_VPS:3000`
- Clique em "WhatsApp" no menu

### **2. Criar Agente:**
- Nome: "Meu Primeiro Agente"
- Prompt: "Você é um assistente útil"
- Clique "Salvar"

### **3. Conectar WhatsApp:**
- Clique "Conectar WhatsApp"
- Aguarde QR code aparecer
- Abra WhatsApp no celular
- Menu > WhatsApp Web
- Escaneie o QR code

### **4. Teste:**
- Envie uma mensagem para o número conectado
- Verifique se o agente responde

---

## **📊 MONITORAMENTO**

### **Comandos Úteis:**
```bash
# Ver status
pm2 status

# Ver logs em tempo real
pm2 logs whatsapp-agents

# Reiniciar aplicação
pm2 restart whatsapp-agents

# Ver uso de recursos
htop

# Ver sessões WhatsApp
ls -la ~/.wwebjs_auth/
```

---

## **🚨 TROUBLESHOOTING**

### **Aplicação não carrega:**
```bash
pm2 logs whatsapp-agents
pm2 restart whatsapp-agents
netstat -tulpn | grep :3000
```

### **QR Code não aparece:**
```bash
pm2 logs whatsapp-agents | grep -i whatsapp
pm2 logs whatsapp-agents | grep -i error
```

### **WhatsApp desconecta:**
```bash
# Limpar sessões corrompidas
rm -rf ~/.wwebjs_auth/*
pm2 restart whatsapp-agents
```

### **Firewall bloqueando:**
```bash
ufw status
ufw allow 3000
```

---

## **🎉 RESULTADO FINAL**

### **✅ Você terá:**
- 🌐 Aplicação rodando 24/7
- 📱 QR codes reais do WhatsApp
- 🤖 Agentes IA funcionando
- 💬 Mensagens automáticas
- 📊 Interface de gerenciamento

### **💰 Custo:**
- **VPS:** $5/mês (40 meses grátis com crédito)
- **Total:** Praticamente gratuito por 3+ anos!

---

## **📞 SUPORTE**

### **Se precisar de ajuda:**
1. Verifique os logs: `pm2 logs whatsapp-agents`
2. Consulte o troubleshooting acima
3. Reinicie a aplicação: `pm2 restart whatsapp-agents`

---

**🚀 Boa sorte com seu deploy! Seus agentes WhatsApp estarão funcionando em breve!**
