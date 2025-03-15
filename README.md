# Atende - SaaS de Gestão de Restaurantes e Delivery

Um SaaS robusto e seguro para gestão de restaurantes e deliveries, similar ao iFood e AnotaE. O sistema permite que clientes (restaurantes) se cadastrem, escolham planos de assinatura e gerenciem seus pedidos e clientes.

## 📋 Funcionalidades

### Para Restaurantes
- Cadastro com planos de assinatura
- Definição de horários de funcionamento
- Configuração de métodos de pagamento
- Gestão de cardápio e itens
- Gestão de pedidos (aceitar, recusar, atualizar status)
- Configuração de impressoras para pedidos automáticos
- Comunicação com clientes via WhatsApp

### Para Clientes Finais
- Visualização de cardápios
- Realização de pedidos
- Recebimento de notificações sobre status dos pedidos via WhatsApp
- Acompanhamento em tempo real do status dos pedidos

### Para Administradores do SaaS
- Gestão de restaurantes
- Gerenciamento de planos e usuários
- Monitoramento de métricas e faturamento
- Controle de pagamentos via Stripe

## 🛠️ Stack Tecnológica

### Frontend
- React.js
- TypeScript
- Tailwind CSS
- Socket.IO Client (comunicação em tempo real)
- Stripe JS (pagamentos)

### Backend
- NestJS (Node.js)
- TypeORM
- PostgreSQL
- JWT Authentication
- WebSockets
- Integração com WhatsApp (Evolution API)
- Sistema de Impressão Automática
- Stripe (pagamentos recorrentes)

## 🚀 Instalação e Configuração

### Pré-requisitos
- Node.js 16+
- PostgreSQL 14+
- NPM ou Yarn

### Backend
```bash
cd backend
npm install
npm run start:dev
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## 🛡️ Segurança
- Criptografia de Senhas com Bcrypt
- Autenticação com JWT + Refresh Token
- Proteção contra ataques comuns com Rate Limiting, CORS e Helmet.js
- Conexões seguras com o banco de dados

## 📊 Infraestrutura
- Hospedagem na VPS da Hostinger
- Configuração otimizada do backend NestJS e PostgreSQL
- Utilização do Nginx para servidor web e PM2 para gerenciamento de processos
- Monitoramento de desempenho e escalabilidade

## 📄 Licença
Este projeto está licenciado sob a [Licença MIT](LICENSE).
# Atendejaplus
