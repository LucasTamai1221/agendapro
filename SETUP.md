# AgendaPro — Setup & Progresso

## Status Geral

| Módulo | Status |
|---|---|
| Estrutura do projeto | ✅ Concluído |
| Banco de dados — PostgreSQL + Prisma | ✅ Concluído |
| API — Clientes CRUD | ✅ Concluído |
| API — Agendamentos CRUD | ✅ Concluído |
| API — Resumo mensal | ✅ Concluído |
| API — Pagamentos (AbacatePay) | ✅ Concluído |
| API — Webhook AbacatePay | ✅ Concluído |
| Frontend — Agenda (dia/semana) | ✅ Concluído |
| Frontend — Clientes | ✅ Concluído |
| Frontend — Agendamentos | ✅ Concluído |
| Frontend — Detalhe + Pix | ✅ Concluído |
| Frontend — Resumo mensal | ✅ Concluído |
| Deploy Vercel | ⏳ Pendente |
| Testes com AbacatePay real | ⏳ Pendente |

---

## Pré-requisitos

- Node.js 18+
- PostgreSQL (local ou hospedado — ver opções abaixo)
- Conta na [AbacatePay](https://abacatepay.com)
- Conta na [Vercel](https://vercel.com)

---

## Instalação local

```bash
# 1. Entrar na pasta do projeto
cd "02 - SaaS para Prestadores de Serviço"

# 2. Instalar dependências
npm install

# 3. Copiar e preencher variáveis de ambiente
cp .env.local.example .env.local
```

Editar `.env.local`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/agendapro?schema=public"

ABACATE_API_KEY=sua_chave_aqui
ABACATE_WEBHOOK_SECRET=seu_secret_aqui
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

```bash
# 4. Subir o banco via Docker
docker compose up -d

# 5. Gerar o Prisma Client
npm run db:generate

# 6. Criar as tabelas no banco
npm run db:migrate
# (Pedirá um nome para a migration, ex: "init")

# 7. Rodar em desenvolvimento
npm run dev
# Acesse: http://localhost:3000
```

---

## Scripts de banco de dados

| Comando | O que faz |
|---|---|
| `npm run db:generate` | Gera o Prisma Client a partir do schema |
| `npm run db:migrate` | Cria/atualiza tabelas (cria arquivo de migration) |
| `npm run db:push` | Sincroniza o schema sem criar migration (útil em dev) |
| `npm run db:studio` | Abre o Prisma Studio (UI visual do banco) |

---

## Opções de PostgreSQL

### Local com Docker (recomendado)
```bash
docker compose up -d
```
Isso sobe um PostgreSQL na porta `5432` com usuário/senha/banco `agendapro`.
A `DATABASE_URL` já está configurada no `.env` para apontar para ele.

### Local sem Docker
Instalar o [PostgreSQL](https://www.postgresql.org/download/) e criar o banco:
```sql
CREATE DATABASE agendapro;
```

### Hospedado (produção — gratuito)
| Serviço | Free tier | Link |
|---|---|---|
| Neon | 512 MB | neon.tech |
| Supabase | 500 MB | supabase.com |
| Railway | $5 crédito/mês | railway.app |

Após criar o banco, copiar a `DATABASE_URL` fornecida pelo serviço.

---

## Variáveis de ambiente

| Variável | Descrição | Onde obter |
|---|---|---|
| `DATABASE_URL` | Connection string do PostgreSQL | Painel do serviço de banco ou local |
| `ABACATE_API_KEY` | Chave da API AbacatePay | Painel AbacatePay → API Keys |
| `ABACATE_WEBHOOK_SECRET` | Secret para validar webhooks | Painel AbacatePay → Webhooks |
| `NEXT_PUBLIC_APP_URL` | URL pública da aplicação | `http://localhost:3000` local / URL Vercel em prod |

---

## Deploy na Vercel

```bash
# 1. Instalar CLI da Vercel (se necessário)
npm i -g vercel

# 2. Fazer deploy
vercel --prod
```

No painel da Vercel, adicionar as variáveis de ambiente:
- `DATABASE_URL` → connection string do banco de produção
- `ABACATE_API_KEY`
- `ABACATE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_APP_URL` → URL gerada pela Vercel (ex: `https://agendapro.vercel.app`)

> **Importante:** após o primeiro deploy, rodar as migrations:
> ```bash
> npx prisma migrate deploy
> ```

### Configurar Webhook no AbacatePay

URL do webhook:
```
https://SEU-APP.vercel.app/api/pagamentos/webhook
```

Evento a escutar: `billing.paid`

---

## Estrutura de pastas

```
.
├── prisma/
│   └── schema.prisma          # Modelos Cliente e Agendamento
├── components/
│   └── Layout.js              # Nav + estrutura de página
├── lib/
│   ├── prisma.js              # Singleton do PrismaClient
│   ├── db.js                  # Funções de acesso ao banco (async)
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
│       ├── clientes/index.js  # GET /api/clientes, POST /api/clientes
│       ├── clientes/[id].js   # GET/PUT/DELETE /api/clientes/:id
│       ├── agendamentos/index.js
│       ├── agendamentos/[id].js
│       ├── pagamentos/gerar.js    # POST → cria cobrança Pix
│       ├── pagamentos/webhook.js  # POST ← AbacatePay notifica pagamento
│       └── resumo.js              # GET /api/resumo?mes=&ano=
├── styles/globals.css
├── .env.local.example
├── package.json
└── next.config.js
```

---

## Fluxo de pagamento Pix

```
1. Criar agendamento  →  POST /api/agendamentos
2. Clicar "Gerar Pix" →  POST /api/pagamentos/gerar
3. AbacatePay retorna pixCode + QR Code
4. Cliente paga
5. AbacatePay chama  →  POST /api/pagamentos/webhook
6. Status atualiza para "pago" automaticamente
```

---

## Modelos de dados (Prisma)

### Cliente
```prisma
model Cliente {
  id        String   @id @default(uuid())
  nome      String
  telefone  String   @default("")
  email     String   @default("")
  criadoEm DateTime @default(now())
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
  status          String   @default("agendado")      // agendado | concluido | cancelado
  pagamentoStatus String   @default("pendente")      // pendente | pago
  pagamentoId     String?
  pixCode         String?
  pixQrCodeUrl    String?
  criadoEm        DateTime @default(now())
}
```

---

## Limitações conhecidas (MVP)

- **Sem autenticação**: qualquer pessoa com a URL tem acesso. Adicionar auth (NextAuth.js) antes de ir a público.
- **Um único prestador**: sem suporte multi-tenant ainda.

---

## Próximos passos sugeridos

- [ ] Autenticação com NextAuth.js
- [ ] Notificação por WhatsApp/SMS ao cliente
- [ ] Editar agendamento existente
- [ ] Filtro de agendamentos por status
