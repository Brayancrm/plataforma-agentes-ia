# 🚀 DEPLOY DATI.IA NA VERCEL

## 📋 PRÉ-REQUISITOS

1. **Conta na Vercel:** https://vercel.com/signup
2. **Conta no GitHub:** https://github.com
3. **Projeto no Google Cloud:** beprojects-836d6

## 🔧 CONFIGURAÇÃO PASSO A PASSO

### **1️⃣ PREPARAR O REPOSITÓRIO**

```bash
# Fazer commit das alterações
git add .
git commit -m "Configuração para deploy Vercel"
git push origin main
```

### **2️⃣ CONECTAR COM A VERCEL**

1. **Acesse:** https://vercel.com
2. **Clique:** "New Project"
3. **Importe** seu repositório do GitHub
4. **Configure** as variáveis de ambiente

### **3️⃣ CONFIGURAR VARIÁVEIS DE AMBIENTE**

No painel da Vercel, adicione estas variáveis:

```
GOOGLE_CLIENT_ID=221105450106-9e6ktkr9pmgn353ag4nici65ivu3be02.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
VERTEX_AI_PROJECT_ID=beprojects-836d6
VERTEX_AI_LOCATION=us-central1
SESSION_SECRET=dati-ia-veo3-oauth-secret-key-2024
```

### **4️⃣ CONFIGURAR GOOGLE CLOUD**

1. **Acesse:** https://console.cloud.google.com/apis/credentials
2. **Edite** suas credenciais OAuth 2.0
3. **Adicione** URLs de redirecionamento:
   - `https://dati-ia.vercel.app/auth/google/callback`
   - `https://dati-ia-git-main-brayan.vercel.app/auth/google/callback`

### **5️⃣ FAZER DEPLOY**

1. **Clique:** "Deploy" na Vercel
2. **Aguarde** o build completar
3. **Acesse** sua URL: `https://dati-ia.vercel.app`

## 🎯 ESTRUTURA DO PROJETO

```
plataforma-agentes-ia/
├── src/                    # Frontend React
├── server/                 # Backend Node.js
├── vercel.json            # Configuração Vercel
├── package.json           # Dependências
└── env-production.txt     # Variáveis de exemplo
```

## 🔍 TROUBLESHOOTING

### **Erro de Build:**
- Verifique se todas as dependências estão no package.json
- Confirme se o vercel.json está correto

### **Erro de OAuth:**
- Verifique se as URLs de redirecionamento estão corretas
- Confirme se as variáveis de ambiente estão configuradas

### **Erro de API:**
- Verifique se o servidor está rodando
- Confirme se as rotas estão configuradas no vercel.json

## 🎉 RESULTADO FINAL

Após o deploy, você terá:
- ✅ **Frontend:** https://dati-ia.vercel.app
- ✅ **API:** https://dati-ia.vercel.app/api/*
- ✅ **OAuth 2.0:** Funcionando
- ✅ **Veo 3:** Integrado
- ✅ **SSL:** Automático
- ✅ **CDN:** Global

## 📞 SUPORTE

Se precisar de ajuda:
1. **Logs da Vercel:** Painel do projeto → Functions
2. **Console do Google Cloud:** Para logs do OAuth
3. **GitHub Issues:** Para bugs do código
