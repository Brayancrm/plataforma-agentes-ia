# 🔐 CONFIGURAÇÃO OAUTH 2.0 COMPLETA - VEO 3 REAL

## 🎯 **OBJETIVO:**

Implementar **OAuth 2.0 completo** para gerar **vídeos reais** via Google Vertex AI Veo 3, não mais simulações.

## 🔧 **PASSO 1: CONFIGURAR GOOGLE CLOUD**

### **1.1 Acessar Google Cloud Console:**
```
https://console.cloud.google.com/
```

### **1.2 Selecionar Projeto:**
- **Projeto:** `beprojects-836d6`
- **Verificar:** Estar no projeto correto

### **1.3 Ativar APIs Necessárias:**
```
Vertex AI API: https://console.cloud.google.com/vertex-ai
Generative Language API: https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com
```

### **1.4 Criar Credenciais OAuth 2.0:**
```
1. Menu → "APIs & Services" → "Credentials"
2. Clique "CREATE CREDENTIALS" → "OAuth 2.0 Client IDs"
3. Selecione "Web application"
4. Nome: "DATI.IA Veo 3 OAuth"
5. URIs autorizados: http://localhost:5000
6. URIs de redirecionamento: http://localhost:5000/auth/google/callback
7. Clique "CREATE"
```

### **1.5 Salvar Credenciais:**
```
Client ID: [copiar]
Client Secret: [copiar]
```

## 🔧 **PASSO 2: CONFIGURAR SERVIDOR**

### **2.1 Instalar Dependências:**
```bash
cd server
npm install
```

### **2.2 Criar Arquivo .env:**
```bash
# Copiar env.example para .env
cp env.example .env
```

### **2.3 Editar .env:**
```env
# Configurações do Google Cloud OAuth 2.0
GOOGLE_CLIENT_ID=SEU_CLIENT_ID_AQUI
GOOGLE_CLIENT_SECRET=SEU_CLIENT_SECRET_AQUI
GOOGLE_REDIRECT_URI=http://localhost:5000/auth/google/callback

# Configurações do Vertex AI
VERTEX_AI_PROJECT_ID=beprojects-836d6
VERTEX_AI_LOCATION=us-central1

# Configurações do servidor
PORT=5000
NODE_ENV=development

# Chave secreta para sessões
SESSION_SECRET=chave-secreta-aleatoria-aqui
```

## 🔧 **PASSO 3: ATUALIZAR FRONTEND**

### **3.1 Modificar vertexAIService.ts:**
- Remover simulação
- Integrar com servidor OAuth 2.0
- Implementar geração real de vídeo

### **3.2 Atualizar DashboardPage.tsx:**
- Adicionar botão de autenticação OAuth 2.0
- Mostrar status da autenticação
- Integrar com geração real de vídeo

## 🚀 **PASSO 4: TESTAR IMPLEMENTAÇÃO**

### **4.1 Iniciar Servidor:**
```bash
cd server
npm start
```

### **4.2 Verificar Servidor:**
```
http://localhost:5000/api/test
```

### **4.3 Testar Autenticação:**
```
http://localhost:5000/auth/google
```

## 📊 **FLUXO OAUTH 2.0 COMPLETO:**

```
1. Usuário clica "🔐 Autenticar Google Cloud"
2. Redireciona para Google OAuth
3. Usuário autoriza aplicação
4. Google retorna código de autorização
5. Servidor troca código por tokens
6. Access Token + Refresh Token salvos
7. Usuário pode gerar vídeos reais
8. Servidor usa tokens para API Veo 3
9. Vídeo real gerado e retornado
```

## 🎬 **GERAÇÃO REAL DE VÍDEO:**

### **Antes (Simulação):**
```
Prompt → Gemini → Canvas HTML5 → JPEG
```

### **Depois (Real):**
```
Prompt → Gemini → API Veo 3 → MP4 Real
```

## 🔍 **ENDPOINTS DO SERVIDOR:**

### **Autenticação:**
```
GET /auth/google - Iniciar OAuth 2.0
GET /auth/google/callback - Callback OAuth 2.0
GET /auth/status - Status da autenticação
```

### **Geração de Vídeo:**
```
POST /api/generate-video - Enviar para Veo 3
GET /api/operation/:name - Verificar status
```

### **Teste:**
```
GET /api/test - Testar servidor
```

## 🎯 **RESULTADO ESPERADO:**

**✅ Vídeo real gerado:**
- **Arquivo:** MP4 reproduzível
- **Qualidade:** 1080p profissional
- **Duração:** Exata conforme solicitado
- **Download:** Funcional e rápido

**✅ Autenticação OAuth 2.0:**
- **Fluxo completo** implementado
- **Tokens gerenciados** automaticamente
- **Refresh automático** quando necessário
- **Segurança** profissional

## 🚀 **PRÓXIMOS PASSOS:**

1. **Configurar Google Cloud** OAuth 2.0
2. **Instalar servidor** e dependências
3. **Configurar variáveis** de ambiente
4. **Atualizar frontend** para usar OAuth 2.0
5. **Testar geração** real de vídeo

## 💡 **VANTAGENS DA IMPLEMENTAÇÃO:**

- ✅ **Vídeo real** via Veo 3
- ✅ **Autenticação segura** OAuth 2.0
- ✅ **Tokens gerenciados** automaticamente
- ✅ **Interface consistente** com usuário
- ✅ **Logs detalhados** para debug
- ✅ **Escalável** para produção

---

**🔐 OAuth 2.0 completo = Vídeos reais do Veo 3!** 🚀✨

**Siga os passos e tenha geração profissional de vídeo!** 🎬



