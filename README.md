# AgendaPro

SaaS de agendamento e gestão financeira para prestadores de serviço autônomos. Permite cadastrar clientes, criar agendamentos, gerar cobranças Pix via AbacatePay e acompanhar o resumo financeiro mensal.

## Stack

- **Framework:** Next.js 14 (Pages Router)
- **Banco de dados:** PostgreSQL + Prisma ORM
- **Pagamentos:** AbacatePay (Pix)
- **Estilização:** Tailwind CSS
- **Infra local:** Docker Compose

## Funcionalidades

- Agenda visual por dia/semana
- CRUD de clientes
- CRUD de agendamentos com status (`agendado`, `concluido`, `cancelado`)
- Geração de cobrança Pix por agendamento
- Atualização automática de status de pagamento via webhook
- Resumo financeiro mensal (total faturado, recebido, pendente)

## Estrutura de pastas

```
.
├── prisma/
│   └── schema.prisma          # Modelos Cliente e Agendamento
├── components/
│   └── Layout.js              # Nav + estrutura de página
├── lib/
│   ├── prisma.js              # Singleton do PrismaClient
│   ├── db.js                  # Funções de acesso ao banco
│   └── abacatepay.js          # Cliente HTTP AbacatePay
├── pages/
│   ├── index.js               # Agenda (visão dia/semana)
│   ├── clientes.js            # CRUD de clientes
│   ├── resumo.js              # Resumo financeiro mensal
│   ├── agendamentos/
│   │   ├── index.js           # Lista de agendamentos
│   │   ├── novo.js            # Criar agendamento
│   │   └── [id].js            # Detalhe + gerar Pix
│   └── api/
│       ├── clientes/          # GET, POST, PUT, DELETE /api/clientes
│       ├── agendamentos/      # GET, POST, PUT, DELETE /api/agendamentos
│       ├── pagamentos/gerar.js    # POST → cria cobrança Pix
│       ├── pagamentos/webhook.js  # POST ← AbacatePay notifica pagamento
│       └── resumo.js              # GET /api/resumo?mes=&ano=
├── styles/globals.css
├── docker-compose.yml
├── .env.local.example
└── package.json
```

## Modelos de dados

### Cliente
```prisma
model Cliente {
  id        String        @id @default(uuid())
  nome      String
  telefone  String        @default("")
  email     String        @default("")
  criadoEm DateTime       @default(now())
  agendamentos Agendamento[]
}
```

### Agendamento
```prisma
model Agendamento {
  id              String   @id @default(uuid())
  clienteId       String?
  clienteNome     String
  servico         String
  valor           Float
  dataHora        DateTime
  status          String   @default("agendado")   // agendado | concluido | cancelado
  pagamentoStatus String   @default("pendente")   // pendente | pago
  pagamentoId     String?
  pixCode         String?
  pixQrCodeUrl    String?
  criadoEm        DateTime @default(now())
}
```

## Fluxo de pagamento Pix

```
1. Criar agendamento  →  POST /api/agendamentos
2. Clicar "Gerar Pix" →  POST /api/pagamentos/gerar
3. AbacatePay retorna pixCode + QR Code
4. Cliente paga
5. AbacatePay chama  →  POST /api/pagamentos/webhook
6. Status atualiza para "pago" automaticamente
```

## Pré-requisitos

- Node.js 18+
- PostgreSQL (local via Docker ou hospedado)
- Conta na [AbacatePay](https://abacatepay.com)

## Instalação local

```bash
# 1. Instalar dependências
npm install

# 2. Copiar e preencher variáveis de ambiente
cp .env.local.example .env.local
```

Editar `.env.local`:

```env
DATABASE_URL="postgresql://agendapro:agendapro@localhost:5432/agendapro?schema=public"
ABACATE_API_KEY=sua_chave_aqui
ABACATE_WEBHOOK_SECRET=seu_secret_aqui
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

```bash
# 3. Subir o banco via Docker
docker compose up -d

# 4. Gerar o Prisma Client e criar as tabelas
npm run db:generate
npm run db:migrate

# 5. Rodar em desenvolvimento
npm run dev
# Acesse: http://localhost:3000
```

## Scripts disponíveis

| Comando | O que faz |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera o build de produção |
| `npm run start` | Inicia o servidor em produção |
| `npm run db:generate` | Gera o Prisma Client a partir do schema |
| `npm run db:migrate` | Cria/atualiza tabelas (gera arquivo de migration) |
| `npm run db:push` | Sincroniza o schema sem criar migration |
| `npm run db:studio` | Abre o Prisma Studio (UI visual do banco) |

## Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | Connection string do PostgreSQL |
| `ABACATE_API_KEY` | Chave da API AbacatePay (Painel → API Keys) |
| `ABACATE_WEBHOOK_SECRET` | Secret para validar webhooks (Painel → Webhooks) |
| `NEXT_PUBLIC_APP_URL` | URL pública da aplicação |

## Opções de banco de dados

### Local com Docker (recomendado para desenvolvimento)
```bash
docker compose up -d
# PostgreSQL disponível em localhost:5432
# Usuário, senha e banco: agendapro
```

### Hospedado (produção — opções gratuitas)

| Serviço | Free tier |
|---|---|
| [Neon](https://neon.tech) | 512 MB |
| [Supabase](https://supabase.com) | 500 MB |
| [Railway](https://railway.app) | $5 crédito/mês |

## Deploy na Vercel

```bash
npm i -g vercel
vercel --prod
```

Adicionar no painel da Vercel as variáveis:
- `DATABASE_URL` — connection string do banco de produção
- `ABACATE_API_KEY`
- `ABACATE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_APP_URL` — URL gerada pela Vercel

Após o primeiro deploy, rodar as migrations:
```bash
npx prisma migrate deploy
```

### Configurar Webhook no AbacatePay

URL:
```
https://SEU-APP.vercel.app/api/pagamentos/webhook
```
Evento: `billing.paid`

## Limitações (MVP)

- **Sem autenticação** — qualquer pessoa com a URL tem acesso. Adicionar NextAuth.js antes de ir a público.
- **Single-tenant** — sem suporte a múltiplos prestadores ainda.

## Próximos passos

- [ ] Autenticação com NextAuth.js
- [ ] Suporte multi-tenant
- [ ] Notificação por WhatsApp/SMS ao cliente
- [ ] Editar agendamento existente
- [ ] Filtro de agendamentos por status
