# 🎬 Configuração Completa do Veo 3

## 📋 Pré-requisitos

1. **Conta Google Cloud** com billing ativo
2. **Projeto Google Cloud** criado
3. **Veo 3 API** habilitada
4. **OAuth 2.0** configurado

## 🚀 Passo a Passo Completo

### 1. **Configurar Google Cloud Console**

#### 1.1 Acessar o Console
```
https://console.cloud.google.com/
```

#### 1.2 Criar/Selecionar Projeto
- Clique no seletor de projeto no topo
- Clique em "Novo Projeto" ou selecione um existente
- Nome sugerido: `beprojects-veo3`

#### 1.3 Habilitar APIs Necessárias
```
https://console.cloud.google.com/apis/library
```

Habilite estas APIs:
- ✅ **Veo 3 API** (se disponível)
- ✅ **Google AI Studio API**
- ✅ **Vertex AI API**
- ✅ **Cloud Storage API**

### 2. **Configurar OAuth 2.0**

#### 2.1 Criar Credenciais OAuth
```
https://console.cloud.google.com/apis/credentials
```

1. Clique em "Criar Credenciais" → "ID do Cliente OAuth 2.0"
2. Configure:
   - **Tipo**: Aplicativo da Web
   - **Nome**: Plataforma IA - Veo 3
   - **URIs de redirecionamento autorizados**:
     ```
     http://localhost:3000/api/auth/google/callback
     https://plataforma-agentes-fshm3wxq0-brayans-projects-1ba18e6d.vercel.app/api/auth/google/callback
     ```

#### 2.2 Salvar Credenciais
- **ID do Cliente**: `seu-client-id.apps.googleusercontent.com`
- **Segredo do Cliente**: `seu-client-secret`

### 3. **Configurar Variáveis de Ambiente**

#### 3.1 Local (.env)
```env
REACT_APP_GOOGLE_CLIENT_ID=seu-client-id.apps.googleusercontent.com
REACT_APP_GOOGLE_CLIENT_SECRET=seu-client-secret
REACT_APP_GOOGLE_PROJECT_ID=beprojects-veo3
```

#### 3.2 Vercel (Produção)
```
https://vercel.com/dashboard/seu-projeto/settings/environment-variables
```

Adicione as mesmas variáveis:
- `REACT_APP_GOOGLE_CLIENT_ID`
- `REACT_APP_GOOGLE_CLIENT_SECRET`
- `REACT_APP_GOOGLE_PROJECT_ID`

### 4. **Visualizar Solicitações no Veo 3 Flow**

#### 4.1 Google Cloud Console - Logs
```
https://console.cloud.google.com/logs
```

**Filtros úteis:**
```
resource.type="cloud_run_revision"
resource.labels.service_name="veo3-api"
```

#### 4.2 Google AI Studio
```
https://aistudio.google.com/app/veo
```

1. Faça login com sua conta Google
2. Vá para "Histórico" ou "Meus Vídeos"
3. Veja todas as solicitações feitas

#### 4.3 Vertex AI Console
```
https://console.cloud.google.com/vertex-ai
```

1. Navegue para "Model Garden"
2. Procure por "Veo 3"
3. Clique em "Histórico de uso"

#### 4.4 Cloud Monitoring
```
https://console.cloud.google.com/monitoring
```

**Métricas importantes:**
- Requisições por minuto
- Latência de resposta
- Erros de API
- Uso de quota

### 5. **Implementar Logging Detalhado**

#### 5.1 Adicionar ao código
```typescript
// Em src/services/veo3Service.ts
const logVeo3Request = (prompt: string, response: any) => {
  console.log('🎬 Veo 3 Request:', {
    timestamp: new Date().toISOString(),
    prompt,
    response,
    user: user?.email,
    session: sessionId
  });
  
  // Enviar para Google Analytics ou Cloud Logging
  gtag('event', 'veo3_request', {
    prompt_length: prompt.length,
    response_status: response.status,
    user_email: user?.email
  });
};
```

#### 5.2 Google Analytics 4
```
https://analytics.google.com/
```

Configure eventos customizados:
- `veo3_request`
- `veo3_success`
- `veo3_error`

### 6. **Monitoramento em Tempo Real**

#### 6.1 Cloud Logging Query
```
resource.type="cloud_run_revision"
resource.labels.service_name="veo3-api"
severity>=INFO
timestamp>="2025-01-01T00:00:00Z"
```

#### 6.2 Alertas
```
https://console.cloud.google.com/monitoring/alerting
```

Configure alertas para:
- Erro rate > 5%
- Latência > 30s
- Quota usage > 80%

### 7. **Dashboard de Monitoramento**

#### 7.1 Criar Dashboard
```
https://console.cloud.google.com/monitoring/dashboards
```

**Widgets sugeridos:**
1. **Requisições por hora**
2. **Latência média**
3. **Taxa de erro**
4. **Uso de quota**
5. **Vídeos gerados por dia**

#### 7.2 Métricas personalizadas
```yaml
# custom_metrics.yaml
metrics:
  - name: veo3_requests_total
    type: COUNTER
    description: "Total de requisições Veo 3"
    
  - name: veo3_generation_time
    type: GAUGE
    description: "Tempo de geração em segundos"
    
  - name: veo3_success_rate
    type: GAUGE
    description: "Taxa de sucesso (%)"
```

### 8. **Troubleshooting**

#### 8.1 Logs de Erro Comuns
```bash
# Erro de quota
"quota_exceeded": "Daily quota exceeded"

# Erro de autenticação
"unauthorized": "Invalid OAuth token"

# Erro de conteúdo
"content_policy_violation": "Prompt violates content policy"
```

#### 8.2 Comandos Úteis
```bash
# Ver logs em tempo real
gcloud logging tail "resource.type=cloud_run_revision"

# Ver quota usage
gcloud compute regions describe us-central1 --format="value(quotas)"

# Testar API
curl -H "Authorization: Bearer $TOKEN" \
  https://veo3.googleapis.com/v1/videos:generate
```

### 9. **Melhores Práticas**

#### 9.1 Rate Limiting
```typescript
const RATE_LIMIT = {
  requestsPerMinute: 10,
  requestsPerHour: 100,
  requestsPerDay: 1000
};
```

#### 9.2 Caching
```typescript
// Cache de prompts similares
const promptCache = new Map();
const cacheKey = hash(prompt);
```

#### 9.3 Retry Logic
```typescript
const retryWithBackoff = async (fn: Function, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 2 ** i * 1000));
    }
  }
};
```

## 📊 **Visualização de Dados**

### Dashboard Principal
```
https://console.cloud.google.com/monitoring/dashboards/custom/veo3-dashboard
```

### Relatórios Automáticos
- **Diário**: Resumo de uso
- **Semanal**: Tendências e performance
- **Mensal**: Análise de custos e ROI

### Exportação de Dados
```sql
-- BigQuery para análise avançada
SELECT 
  DATE(timestamp) as date,
  COUNT(*) as requests,
  AVG(generation_time) as avg_time,
  SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successes
FROM veo3_requests
GROUP BY date
ORDER BY date DESC;
```

## 🔗 **Links Úteis**

- **Google Cloud Console**: https://console.cloud.google.com/
- **Veo 3 Documentation**: https://ai.google.dev/veo
- **OAuth 2.0 Guide**: https://developers.google.com/identity/protocols/oauth2
- **Cloud Logging**: https://console.cloud.google.com/logs
- **Monitoring**: https://console.cloud.google.com/monitoring

## ✅ **Checklist de Configuração**

- [ ] Projeto Google Cloud criado
- [ ] APIs habilitadas
- [ ] OAuth 2.0 configurado
- [ ] Variáveis de ambiente definidas
- [ ] Logging implementado
- [ ] Monitoramento ativo
- [ ] Alertas configurados
- [ ] Dashboard criado
- [ ] Testes realizados
- [ ] Documentação atualizada
