# 🚀 Plataforma de Agentes de IA

Uma plataforma web completa para criação, gerenciamento e disparo de agentes de IA com dashboard administrativo e empresarial.

## ✨ Funcionalidades Principais

### 🎯 **Gestão de Usuários e Empresas**
- Sistema de autenticação com controle de acesso
- Dashboard para Proprietário (Admin) com acesso total
- Dashboard para Empresas com funcionalidades restritas
- Gestão de usuários, empresas e permissões

### 📊 **Gestão de Clientes**
- Cadastro manual de clientes
- **Importação em massa via CSV** ✅
- Validação automática de CPF, telefone e email
- Organização em grupos e categorias
- Relatórios de importação com tratamento de erros

### 🤖 **Agentes de IA**
- Criação e configuração de agentes personalizados
- Suporte a múltiplos canais: WhatsApp, Voz, SMS, Email
- Integração com API da OpenAI (GPT-4/5)
- Configuração de prompts e funções específicas
- Modos Inbound (receber) e Outbound (enviar)

### 📢 **Campanhas e Marketing**
- Criação de campanhas automatizadas
- Segmentação por clientes ou grupos
- Agendamento e disparo automático
- Relatórios de performance

### 🎨 **Publicidade com IA**
- Geração de imagens com DALL-E
- Geração de vídeos (quando Sora estiver disponível)
- Galeria de conteúdos gerados
- Prompts personalizáveis

### 📄 **Documentos e Contratos**
- Modelos configuráveis tipo Word
- Assinatura digital
- Exportação em múltiplos formatos

### 📦 **Inventário e Vendas**
- Gestão de produtos e serviços
- Controle de estoque
- Anexo de fotos e documentos

### 💳 **Pagamentos e Faturamento**
- Geração de boletos e notas fiscais
- Controle de créditos e planos
- Histórico de transações

### 🔗 **Integrações**
- APIs para CRMs e ERPs
- Webhooks personalizáveis
- Conectores para sistemas externos

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 18 + TypeScript
- **Styling**: TailwindCSS
- **Roteamento**: React Router v6
- **Estado**: React Context + Hooks
- **Ícones**: Lucide React
- **IA**: OpenAI SDK (GPT-4, DALL-E, Sora)
- **Validação**: Validações customizadas para CPF, telefone, email

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Conta na OpenAI com API key

## 🚀 Instalação

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd plataforma-agentes-ia
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
Crie um arquivo `.env` na raiz do projeto:
```env
REACT_APP_OPENAI_API_KEY=sua-api-key-da-openai-aqui
```

### 4. Inicie o servidor de desenvolvimento
```bash
npm start
```

A aplicação estará disponível em `http://localhost:3000`

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   └── CSVImportComponent.tsx  # Importação CSV
├── contexts/           # Contextos React
│   └── AuthContext.tsx # Autenticação
├── pages/              # Páginas da aplicação
│   ├── LoginPage.tsx   # Página de login
│   └── DashboardPage.tsx # Dashboard principal
├── services/           # Serviços e APIs
│   ├── openaiService.ts # Integração OpenAI
│   └── csvImportService.ts # Processamento CSV
├── types/              # Tipos TypeScript
│   └── index.ts        # Interfaces principais
├── utils/              # Utilitários
├── hooks/              # Hooks customizados
└── App.tsx             # Componente principal
```

## 🔐 Configuração da OpenAI

### 1. Obtenha sua API Key
- Acesse [OpenAI Platform](https://platform.openai.com/)
- Crie uma conta ou faça login
- Gere uma nova API key

### 2. Configure no projeto
```env
REACT_APP_OPENAI_API_KEY=sk-...
```

### 3. Funcionalidades disponíveis
- **Chat GPT**: Processamento de linguagem natural
- **DALL-E**: Geração de imagens
- **Sora**: Geração de vídeos (quando disponível)

## 📥 Importação de Clientes via CSV

### Formato do arquivo
```csv
Nome,CPF,Telefone,Email,Grupo,Observacoes
João da Silva,12345678901,11999999999,joao@email.com,Grupo A,Cliente importante
Maria Lima,98765432100,11988888888,maria@email.com,Grupo B,VIP
```

### Campos obrigatórios
- **Nome**: Nome completo do cliente
- **CPF**: CPF válido (formato: 12345678901)
- **Telefone**: Telefone com DDD (formato: 11999999999)

### Campos opcionais
- **Email**: Email válido
- **Grupo**: Nome do grupo (será criado se não existir)
- **Observacoes**: Notas adicionais

### Validações automáticas
- ✅ CPF brasileiro válido
- ✅ Telefone com formato correto
- ✅ Email válido (se fornecido)
- ✅ Campos obrigatórios preenchidos

## 🎯 Uso da Plataforma

### 1. **Login e Autenticação**
- Acesse `/login`
- Use credenciais de teste ou crie uma conta
- Sistema redireciona para dashboard apropriado

### 2. **Dashboard do Proprietário**
- Gestão completa de usuários e empresas
- Criação de planos e recarga de créditos
- Acesso a todas as funcionalidades

### 3. **Dashboard da Empresa**
- Gestão de clientes e grupos
- Criação de campanhas e agentes de IA
- Controle de inventário e pagamentos

### 4. **Importação de Clientes**
- Acesse "Clientes" → "Importar via CSV"
- Faça upload do arquivo
- Revise validações e erros
- Confirme importação

### 5. **Configuração de Agentes IA**
- Acesse "Agentes de IA"
- Configure prompts e funções
- Teste respostas em tempo real
- Ative para campanhas

## 🔧 Desenvolvimento

### Scripts disponíveis
```bash
npm start          # Servidor de desenvolvimento
npm run build      # Build de produção
npm test           # Executar testes
npm run eject      # Ejetar configurações (irreversível)
```

### Estrutura de desenvolvimento
- **Componentes**: Funcionais com hooks
- **Estado**: Context API para estado global
- **Roteamento**: React Router com proteção de rotas
- **Estilização**: TailwindCSS com classes utilitárias

## 📊 Funcionalidades em Desenvolvimento

- [ ] Sistema de notificações em tempo real
- [ ] Relatórios avançados e analytics
- [ ] Integração com WhatsApp Business API
- [ ] Sistema de templates de campanhas
- [ ] Backup automático de dados
- [ ] API REST para integrações externas

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

- **Email**: suporte@plataforma-ia.com
- **Documentação**: [docs.plataforma-ia.com](https://docs.plataforma-ia.com)
- **Issues**: [GitHub Issues](https://github.com/seu-usuario/plataforma-agentes-ia/issues)

## 🎉 Agradecimentos

- OpenAI pela API de IA
- Comunidade React e TypeScript
- Contribuidores e testadores

---

**Desenvolvido com ❤️ para revolucionar o atendimento ao cliente com IA**
