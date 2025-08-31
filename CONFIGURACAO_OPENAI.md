# 🔑 Configuração das APIs de IA

Para que a geração de imagens funcione corretamente, você pode configurar OpenAI (DALL-E) e/ou Google Gemini.

**✅ PROBLEMA CORRIGIDO**: O erro de segurança do browser foi resolvido. Agora o sistema usa fetch diretamente.

**🎉 NOVIDADE**: Agora você tem CINCO opções para geração de imagens: OpenAI DALL-E, Google Gemini, Leonardo.ai, Vertex AI e IA Gratuita!

## Passos para configuração:

### 1. Obter API Key da OpenAI
1. Acesse [OpenAI Platform](https://platform.openai.com/)
2. Faça login ou crie uma conta
3. Vá em "API Keys" no menu lateral
4. Clique em "Create new secret key"
5. Copie a chave gerada (ela será exibida apenas uma vez)

### 2. Configurar no projeto
1. Na pasta raiz do projeto, crie um arquivo chamado `.env`
2. Adicione a seguinte linha:
```
REACT_APP_OPENAI_API_KEY=sua-api-key-aqui
```
3. Substitua `sua-api-key-aqui` pela sua API key real da OpenAI
4. Salve o arquivo

### 3. Reiniciar o servidor
Após configurar a API key, reinicie o servidor de desenvolvimento:
```bash
npm start
```

## Configuração do Google Gemini (OPCIONAL):

### 1. Obter API Key do Google AI Studio
1. Acesse [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Faça login com sua conta Google
3. Clique em "Create API Key"
4. Copie a chave gerada

### 2. Adicionar no arquivo .env
Adicione esta linha ao seu arquivo `.env`:
```
REACT_APP_GEMINI_API_KEY=sua-api-key-do-gemini-aqui
```

## Exemplo de arquivo .env completo:
```
REACT_APP_OPENAI_API_KEY=sk-proj-abcd1234efgh5678ijkl9012mnop3456qrst7890uvwx
REACT_APP_GEMINI_API_KEY=AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz123456789
```

## ⚠️ Importante:
- **NUNCA** compartilhe sua API key publicamente
- O arquivo `.env` está no `.gitignore` para sua segurança
- Você precisará de créditos na sua conta OpenAI para usar a API
- A geração de imagens consome créditos da OpenAI

## Configuração do Leonardo.ai (RECOMENDADO):

### 1. Obter API Key do Leonardo.ai
1. Acesse [Leonardo.ai](https://leonardo.ai/)
2. Crie uma conta gratuita
3. Vá em "API Access" no seu perfil
4. Gere uma API Key
5. Copie a chave gerada

### 2. Adicionar no arquivo .env
Adicione esta linha ao seu arquivo `.env`:
```
REACT_APP_LEONARDO_API_KEY=sua-api-key-do-leonardo-aqui
```

## 🎯 Vantagens de cada ferramenta:

### 🎨 **OpenAI DALL-E 3:**
- ✅ **Qualidade excepcional** de imagens
- ✅ **Entende prompts complexos** em português
- ✅ **Styles artísticos** variados
- 💰 **Custo**: ~$0.04 por imagem (1024x1024)

### 🎭 **Leonardo.ai:** ⭐ RECOMENDADO
- ✅ **Qualidade profissional** superior
- ✅ **21 estilos diferentes** (Cinematic, Portrait, HDR, etc.)
- ✅ **Controle total** de parâmetros
- ✅ **Geração rápida** e confiável
- 💰 **Custo**: Muito competitivo

### 🟣 **IA Gratuita:**
- ✅ **Totalmente gratuita** 
- ✅ **Gera imagens reais** baseadas no prompt
- ✅ **Sem limites** de uso
- ⚠️ **Qualidade moderada**

### 🔵 **Vertex AI (Google Cloud):** 🏢 EMPRESARIAL
- ✅ **Gemini via Google Cloud** - Mais robusto
- ✅ **SLA empresarial** e suporte
- ✅ **Limites maiores** que AI Studio
- ✅ **Descrição melhorada** por IA + imagem
- 💰 **Custo**: Pay-per-use do GCP
- 🔧 **Requer**: Projeto GCP + Service Account

### 🚀 **Google Gemini (AI Studio):**
- ✅ **Integração simples** com ecosistema Google
- ✅ **Boa qualidade** de geração
- ✅ **Políticas de segurança** rigorosas
- 💰 **Custo**: Varia conforme plano do Google AI

## Verificação:
Após configurar, teste gerando uma imagem na seção "Publicidade > Gerar Imagens" do dashboard.

## Configuração do Vertex AI (EMPRESARIAL):

### 1. Configurar Google Cloud Project
1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou use existente
3. Ative a API "Vertex AI"
4. Configure billing (necessário)

### 2. Criar Service Account
1. Vá em "IAM & Admin" > "Service Accounts"
2. Clique "Create Service Account"
3. Dê permissões "Vertex AI User"
4. Baixe o arquivo JSON da chave

### 3. Obter Access Token
```bash
gcloud auth application-default login
gcloud auth print-access-token
```

### 4. Adicionar no arquivo .env
```
REACT_APP_VERTEX_PROJECT_ID=seu-projeto-gcp-id
REACT_APP_VERTEX_REGION=us-central1
REACT_APP_VERTEX_ACCESS_TOKEN=seu-access-token-aqui
```

**Agora você pode escolher entre:**
- 🔵 **DALL-E (OpenAI)** - Para máxima qualidade
- 🔮 **Leonardo.ai** - ⭐ RECOMENDADO - Qualidade profissional
- 🔵 **Vertex AI** - 🏢 Para uso empresarial robusto
- 🟣 **IA Gratuita** - Sem custo, boa qualidade  
- 🟢 **Gemini (AI Studio)** - Demo com descrição melhorada

## Exemplo de arquivo .env completo:
```
REACT_APP_OPENAI_API_KEY=sk-proj-abcd1234efgh5678ijkl9012mnop3456qrst7890uvwx
REACT_APP_GEMINI_API_KEY=AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz123456789
REACT_APP_LEONARDO_API_KEY=leonardo-api-key-aqui
REACT_APP_VERTEX_PROJECT_ID=meu-projeto-gcp-123456
REACT_APP_VERTEX_REGION=us-central1
REACT_APP_VERTEX_ACCESS_TOKEN=ya29.a0Ad52N0...
```

Se tudo estiver configurado corretamente, você verá imagens reais geradas pela IA escolhida!
