# 🚀 Configuração do Google Vertex AI para Geração de Vídeo

## ✅ **PASSO A PASSO COMPLETO**

### 1️⃣ **Criar Projeto no Google Cloud Platform**

1. **Acesse:** https://console.cloud.google.com/
2. **Crie um novo projeto** ou use um existente
3. **Anote o Project ID** (exemplo: `meu-projeto-ia-123`)

### 2️⃣ **Ativar APIs Necessárias**

No Google Cloud Console:
1. **Navegue para:** "APIs & Services" > "Library"
2. **Ative estas APIs:**
   - ✅ **Vertex AI API**
   - ✅ **AI Platform API** 
   - ✅ **Cloud Storage API** (opcional, para vídeos grandes)

### 3️⃣ **Criar API Key**

**Opção A - API Key (mais simples):**
1. **Vá para:** "APIs & Services" > "Credentials"
2. **Clique:** "Create Credentials" > "API Key"
3. **Copie a chave** gerada
4. **Configure restrições** (opcional, mas recomendado)

**Opção B - Service Account (mais seguro):**
1. **Vá para:** "IAM & Admin" > "Service Accounts"
2. **Crie uma nova service account**
3. **Baixe o arquivo JSON**
4. **Use o conteúdo do arquivo para autenticação**

### 4️⃣ **Configurar Variáveis de Ambiente**

Crie um arquivo `.env` na raiz do projeto:

```env
# Google Vertex AI Configuration
REACT_APP_VERTEX_AI_PROJECT_ID=seu-project-id-aqui
REACT_APP_VERTEX_AI_API_KEY=sua-api-key-aqui

# Outras configurações existentes
REACT_APP_OPENAI_API_KEY=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
REACT_APP_GEMINI_API_KEY=AIzaSyCO0-ePTIhKA5BIV8TPSurLt-Xscdn2zak
REACT_APP_LEONARDO_API_KEY=758abaac-48b3-427c-b0b7-2651244706a5
```

### 5️⃣ **Testar a Configuração**

1. **Reinicie o servidor:** `npm start`
2. **Acesse a aplicação**
3. **Vá para:** Geração de Vídeo
4. **Selecione:** "Vertex AI (Veo)"
5. **Digite um prompt:** "Um gato brincando com uma bola"
6. **Clique:** "Gerar Vídeo"

---

## 🎯 **EXEMPLO DE CONFIGURAÇÃO**

```env
# Substitua pelos seus valores reais
REACT_APP_VERTEX_AI_PROJECT_ID=minha-empresa-ia-2024
REACT_APP_VERTEX_AI_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 🔧 **TROUBLESHOOTING**

### ❌ **Erro: "Project ID não configurado"**
- Verifique se `REACT_APP_VERTEX_AI_PROJECT_ID` está correto
- Reinicie o servidor após alterar `.env`

### ❌ **Erro: "API key inválida"**
- Verifique se a API key está correta
- Confirme se as APIs estão ativadas no GCP

### ❌ **Erro: "Permission denied"**
- Verifique permissões da API key
- Confirme se a Vertex AI API está ativada

### ❌ **Erro: "Quota exceeded"**
- Verifique cotas no Google Cloud Console
- Considere upgrade do plano se necessário

---

## 💰 **CUSTOS ESTIMADOS**

**Modelo Veo (Vertex AI):**
- **Vídeo 5s:** ~$0.10 - $0.30 USD
- **Vídeo 10s:** ~$0.20 - $0.60 USD
- **Vídeo 30s:** ~$0.60 - $1.80 USD

**Dica:** Comece com vídeos curtos para testar!

---

## 🎬 **RECURSOS DISPONÍVEIS**

✅ **Aspect Ratios:** 16:9, 9:16, 1:1  
✅ **Durações:** 2-30 segundos  
✅ **Qualidade:** Até 4K (dependendo do plano)  
✅ **Formatos:** MP4, WebM  
✅ **Download:** Arquivos reais  
✅ **Compartilhamento:** URLs diretas  

---

## 📞 **SUPORTE**

Se tiver problemas:
1. **Verifique logs** no console do navegador
2. **Teste conectividade** com outros serviços
3. **Consulte documentação** oficial do Google Cloud
4. **Entre em contato** se precisar de ajuda específica

**Documentação oficial:** https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/veo-video-generation

