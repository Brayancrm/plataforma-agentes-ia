# 🔒 Regras de Segurança do Firebase

## Firestore Rules
Copie e cole estas regras no console do Firebase > Firestore > Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Função para verificar se o usuário está autenticado
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Função para verificar se o usuário é proprietário ou admin
    function isOwnerOrAdmin() {
      return isAuthenticated() && 
        (request.auth.token.category == 'proprietario' || 
         request.auth.token.category == 'admin');
    }
    
    // Função para verificar se o usuário é empresa
    function isCompany() {
      return isAuthenticated() && request.auth.token.category == 'empresa';
    }
    
    // Função para verificar se o usuário pode acessar dados da empresa
    function canAccessCompany(companyId) {
      return isAuthenticated() && 
        (request.auth.token.category == 'proprietario' || 
         request.auth.token.category == 'admin' ||
         request.auth.token.companyId == companyId);
    }

    // Usuários - cada usuário pode ler/escrever apenas seus próprios dados
    match /usuarios/{userId} {
      allow read, write: if isAuthenticated() && request.auth.uid == userId;
      allow read: if isOwnerOrAdmin(); // Proprietários e admins podem ver todos
    }
    
    // Empresas - podem ser lidas por usuários autenticados, escritas por proprietários/admins
    match /empresas/{empresaId} {
      allow read: if isAuthenticated();
      allow write: if isOwnerOrAdmin();
    }
    
    // Clientes - podem ser acessados por usuários da empresa correspondente
    match /clientes/{clientId} {
      allow read, write: if canAccessCompany(resource.data.companyId);
    }
    
    // Grupos de clientes - mesmo padrão dos clientes
    match /grupos_clientes/{groupId} {
      allow read, write: if canAccessCompany(resource.data.companyId);
    }
    
    // Campanhas - mesmo padrão
    match /campanhas/{campaignId} {
      allow read, write: if canAccessCompany(resource.data.companyId);
    }
    
    // Planos - podem ser lidos por todos, escritos apenas por proprietários/admins
    match /planos/{planId} {
      allow read: if isAuthenticated();
      allow write: if isOwnerOrAdmin();
    }
    
    // Pagamentos - mesmo padrão dos clientes
    match /pagamentos/{paymentId} {
      allow read, write: if canAccessCompany(resource.data.companyId);
    }
    
    // Notas fiscais - mesmo padrão
    match /notas_fiscais/{invoiceId} {
      allow read, write: if canAccessCompany(resource.data.companyId);
    }
    
    // Integrações - mesmo padrão
    match /integracoes/{integrationId} {
      allow read, write: if canAccessCompany(resource.data.companyId);
    }
    
    // Documentos - mesmo padrão
    match /documentos/{documentId} {
      allow read, write: if canAccessCompany(resource.data.companyId);
    }
    
    // Produtos - mesmo padrão
    match /produtos/{productId} {
      allow read, write: if canAccessCompany(resource.data.companyId);
    }
    
    // Serviços - mesmo padrão
    match /servicos/{serviceId} {
      allow read, write: if canAccessCompany(resource.data.companyId);
    }
    
    // Imagens - mesmo padrão
    match /imagens/{imageId} {
      allow read, write: if canAccessCompany(resource.data.companyId);
    }
    
    // Vídeos - mesmo padrão
    match /videos/{videoId} {
      allow read, write: if canAccessCompany(resource.data.companyId);
    }
    
    // Agentes IA - mesmo padrão
    match /agentes_ia/{agentId} {
      allow read, write: if canAccessCompany(resource.data.companyId);
    }
  }
}
```

## Storage Rules
Copie e cole estas regras no console do Firebase > Storage > Rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Função para verificar se o usuário está autenticado
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Função para verificar se o usuário é proprietário ou admin
    function isOwnerOrAdmin() {
      return isAuthenticated() && 
        (request.auth.token.category == 'proprietario' || 
         request.auth.token.category == 'admin');
    }
    
    // Função para verificar se o usuário pode acessar arquivos da empresa
    function canAccessCompany(companyId) {
      return isAuthenticated() && 
        (request.auth.token.category == 'proprietario' || 
         request.auth.token.category == 'admin' ||
         request.auth.token.companyId == companyId);
    }

    // Usuários podem fazer upload em suas pastas
    match /usuarios/{userId}/{allPaths=**} {
      allow read, write: if isAuthenticated() && request.auth.uid == userId;
    }
    
    // Logos de empresas - podem ser lidos por todos, escritos por proprietários/admins
    match /empresas/{companyId}/logos/{allPaths=**} {
      allow read: if true;
      allow write: if isOwnerOrAdmin();
    }
    
    // Fotos de clientes - podem ser acessadas por usuários da empresa
    match /clientes/{clientId}/fotos/{allPaths=**} {
      allow read, write: if canAccessCompany(clientId.split('_')[0]); // Assumindo formato companyId_clientId
    }
    
    // Imagens de produtos - mesmo padrão
    match /produtos/{productId}/imagens/{allPaths=**} {
      allow read, write: if canAccessCompany(productId.split('_')[0]);
    }
    
    // Imagens de serviços - mesmo padrão
    match /servicos/{serviceId}/imagens/{allPaths=**} {
      allow read, write: if canAccessCompany(serviceId.split('_')[0]);
    }
    
    // Arquivos de documentos - mesmo padrão
    match /documentos/{documentId}/arquivos/{allPaths=**} {
      allow read, write: if canAccessCompany(documentId.split('_')[0]);
    }
    
    // Mídia de campanhas - mesmo padrão
    match /campanhas/{campaignId}/midia/{allPaths=**} {
      allow read, write: if canAccessCompany(campaignId.split('_')[0]);
    }
    
    // Arquivos públicos - podem ser lidos por todos, escritos por usuários autenticados
    match /public/{allPaths=**} {
      allow read: if true;
      allow write: if isAuthenticated();
    }
  }
}
```

## Como Aplicar:

1. **Firestore Rules:**
   - Vá para [Firebase Console](https://console.firebase.google.com)
   - Selecione seu projeto `beprojects-836d6`
   - Clique em "Firestore Database" no menu lateral
   - Clique na aba "Rules"
   - Cole as regras do Firestore acima
   - Clique em "Publish"

2. **Storage Rules:**
   - No mesmo console, clique em "Storage" no menu lateral
   - Clique na aba "Rules"
   - Cole as regras do Storage acima
   - Clique em "Publish"

## ⚠️ Importante:
- Estas regras são **restritivas** por segurança
- Teste bem antes de usar em produção
- Ajuste conforme suas necessidades específicas
- Monitore os logs para identificar problemas de acesso

