# Configuração e Uso do Firebase

## 📋 Visão Geral

Este projeto está configurado com Firebase para fornecer:
- **Autenticação** (Firebase Auth)
- **Banco de dados** (Firestore)
- **Armazenamento de arquivos** (Firebase Storage)

## 🚀 Configuração

### 1. Instalação
O Firebase já está instalado no projeto:
```bash
npm install firebase --legacy-peer-deps
```

### 2. Configuração
As credenciais do Firebase estão configuradas em `src/config/firebase.ts`:
- Project ID: `beprojects-836d6`
- Auth Domain: `beprojects-836d6.firebaseapp.com`
- Storage Bucket: `beprojects-836d6.firebasestorage.app`

## 🔧 Hooks Disponíveis

### useFirebaseAuth
Gerencia autenticação de usuários:
```typescript
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';

const { user, login, register, logout, resetPassword } = useFirebaseAuth();
```

**Funcionalidades:**
- `login(email, password)` - Fazer login
- `register(email, password, displayName)` - Criar conta
- `logout()` - Fazer logout
- `resetPassword(email)` - Redefinir senha
- `updateUserProfile(updates)` - Atualizar perfil

### useFirestore
Gerencia operações do banco de dados:
```typescript
import { useFirestore } from '../hooks/useFirestore';

const { createDocument, getDocuments, updateDocument, deleteDocument } = useFirestore();
```

**Funcionalidades:**
- `createDocument(collection, data)` - Criar documento
- `getDocument(collection, id)` - Buscar documento
- `updateDocument(collection, id, data)` - Atualizar documento
- `deleteDocument(collection, id)` - Excluir documento
- `getDocuments(collection, constraints)` - Buscar múltiplos documentos
- `subscribeToCollection(collection, callback, constraints)` - Listener em tempo real
- `batchWrite(operations)` - Operações em lote

### useFirebaseStorage
Gerencia upload e download de arquivos:
```typescript
import { useFirebaseStorage } from '../hooks/useFirebaseStorage';

const { uploadFile, uploadMultipleFiles, deleteFile, getFileURL } = useFirebaseStorage();
```

**Funcionalidades:**
- `uploadFile(file, path, metadata)` - Upload de arquivo único
- `uploadMultipleFiles(files, basePath, metadata)` - Upload múltiplo
- `deleteFile(path)` - Excluir arquivo
- `getFileURL(path)` - Obter URL de download
- `listFiles(path)` - Listar arquivos em diretório

## 📊 Estrutura das Coleções

### Usuários (`usuarios`)
```typescript
{
  id: string,
  name: string,
  email: string,
  category: 'proprietario' | 'admin' | 'empresa' | 'usuario',
  credits: number,
  visibleSections: string[],
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Empresas (`empresas`)
```typescript
{
  id: string,
  name: string,
  cnpj: string,
  email: string,
  phone: string,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Clientes (`clientes`)
```typescript
{
  id: string,
  name: string,
  cpf: string,
  phone: string,
  additionalFields: Record<string, any>,
  groupId?: string,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## 💡 Exemplos de Uso

### Criar um usuário
```typescript
const handleCreateUser = async () => {
  try {
    const userData = {
      name: 'João Silva',
      email: 'joao@email.com',
      category: 'usuario',
      credits: 10,
      visibleSections: ['overview', 'usuarios', 'empresas']
    };

    const result = await createDocument('usuarios', userData);
    console.log('Usuário criado:', result);
  } catch (error) {
    console.error('Erro:', error);
  }
};
```

### Buscar usuários com filtros
```typescript
const handleGetUsers = async () => {
  try {
    const constraints = [
      whereQuery('category', '==', 'usuario'),
      orderByQuery('createdAt', 'desc'),
      limitQuery(10)
    ];
    
    const users = await getDocuments('usuarios', constraints);
    console.log('Usuários:', users);
  } catch (error) {
    console.error('Erro:', error);
  }
};
```

### Upload de arquivo
```typescript
const handleFileUpload = async (file: File) => {
  try {
    const path = `usuarios/${user.uid}/avatar.jpg`;
    const result = await uploadFile(file, path);
    console.log('Arquivo enviado:', result.url);
  } catch (error) {
    console.error('Erro:', error);
  }
};
```

### Listener em tempo real
```typescript
useEffect(() => {
  const unsubscribe = subscribeToCollection('usuarios', (users) => {
    console.log('Usuários atualizados:', users);
  });
  
  return () => unsubscribe();
}, []);
```

## 🔒 Regras de Segurança

### Firestore
Configure as regras de segurança no console do Firebase:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuários podem ler/escrever apenas seus próprios dados
    match /usuarios/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Empresas podem ser lidas por usuários autenticados
    match /empresas/{empresaId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.category in ['proprietario', 'admin'];
    }
  }
}
```

### Storage
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Usuários podem fazer upload em suas pastas
    match /usuarios/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Imagens públicas podem ser lidas por todos
    match /public/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## 🚨 Tratamento de Erros

Todos os hooks incluem tratamento de erro:
```typescript
const { error, loading } = useFirestore();

if (error) {
  console.error('Erro:', error);
  // Mostrar mensagem de erro para o usuário
}

if (loading) {
  // Mostrar spinner ou loading
}
```

## 📱 Integração com o Dashboard

Para integrar com o dashboard existente:

1. **Substitua o localStorage** pelos hooks do Firebase
2. **Use os listeners em tempo real** para atualizações automáticas
3. **Implemente autenticação** antes de mostrar o dashboard
4. **Configure permissões** baseadas no tipo de usuário

## 🔧 Próximos Passos

1. **Configurar regras de segurança** no console do Firebase
2. **Implementar autenticação** no dashboard
3. **Migrar dados** do localStorage para o Firestore
4. **Configurar índices** para consultas complexas
5. **Implementar cache offline** se necessário

## 📚 Recursos Adicionais

- [Documentação oficial do Firebase](https://firebase.google.com/docs)
- [Firebase Console](https://console.firebase.google.com)
- [Firebase Emulator](https://firebase.google.com/docs/emulator-suite) para desenvolvimento local

