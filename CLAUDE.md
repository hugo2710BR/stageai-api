# StageAI API — Backend

## O que e este projeto
Backend NestJS que serve a app StageAI. Gere autenticação, geração de imagens via Fal AI, histórico de stagings, planos e pagamentos.

## Stack
- **Framework**: NestJS 11
- **ORM**: Prisma 6
- **Base de dados**: PostgreSQL (Docker local, Railway em produção)
- **Auth**: JWT + Passport + bcrypt
- **AI API**: Fal AI — `fal-ai/flux-pro/v1/fill` (~$0.05/geração)
- **Storage**: Cloudflare R2 (imagens permanentes)
- **Pagamentos**: Lemon Squeezy (Merchant of Record — trata VAT/impostos)

## Estrutura do projeto
```
src/
├── main.ts              ← Entry point: CORS, validation, porta 3001
├── app.module.ts        ← Módulo raiz: liga todos os modules
├── prisma/              ← Database client (Global module)
├── auth/                ← Registo, login, JWT, guards
├── staging/             ← Proxy Fal AI + histórico + rate limiting
├── fal/                 ← Serviço wrapper para Fal AI
├── r2/                  ← Upload de imagens para Cloudflare R2
├── plans/               ← GET /api/plans (público) — lê tabela Plan
└── payments/            ← Checkout Lemon Squeezy + webhook
```

## Variáveis de ambiente (.env)
```
DATABASE_URL=postgresql://stageai:stageai_local@localhost:5432/stageai?schema=public
JWT_SECRET=...
JWT_EXPIRES_IN=1h
FAL_KEY=...                          ← API key da Fal AI
FRONTEND_URL=http://localhost:3000   ← para CORS
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=...
R2_PUBLIC_URL=...                    ← URL pública do bucket
LEMONSQUEEZY_API_KEY=...             ← API key do dashboard LS
LEMONSQUEEZY_STORE_ID=...            ← ID da store no dashboard LS
LEMONSQUEEZY_WEBHOOK_SECRET=...      ← Signing secret (max 40 chars)
```

## Endpoints
| Método | Rota | Auth | Descrição |
|---|---|---|---|
| POST | /api/auth/register | Não | Registo (email + password + name?) |
| POST | /api/auth/login | Não | Login → JWT |
| POST | /api/staging | JWT | Gera staging via Fal AI |
| GET  | /api/staging | JWT | Lista histórico do user (sem deletedAt) |
| DELETE | /api/staging/:id | JWT | Soft delete (define deletedAt, apaga R2) |
| GET  | /api/staging/usage | JWT | Retorna plano, used, limit, remaining |
| GET  | /api/plans | Não | Lista planos ativos (tabela Plan) |
| POST | /api/payments/checkout | JWT | Cria checkout Lemon Squeezy, devolve URL |
| POST | /api/payments/webhook | Não | Recebe eventos LS, atualiza User.plan |

## Arranque ("inicia os motores")
```bash
docker compose up -d          # PostgreSQL
npm run start:dev             # Servidor em http://localhost:3001
```

### Primeira vez num PC novo
```bash
npm install
npx prisma@6 generate
npx prisma@6 migrate dev
npx ts-node --transpile-only prisma/seed.ts
```
Depois criar `.env` a partir do `.env.example` e preencher todos os valores.

## Estado atual ✅
- Auth (register/login com bcrypt + JWT) funcional
- Staging ligado ao Fal AI com dimensões normalizadas (snapTo64)
- Imagens guardadas no Cloudflare R2 (URLs permanentes)
- Histórico de stagings por utilizador com soft delete
- Rate limiting por plano (lido da tabela Plan, não hardcoded)
- Planos dinâmicos via Postgres (seed com free/starter/pro/agency)
- Lemon Squeezy: checkout + webhook + atualização de User.plan
- Deploy em Railway (BE + PostgreSQL)

## Regras para o agente
- NUNCA expor FAL_KEY, R2 secrets ou LEMONSQUEEZY_* no frontend
- Toda a comunicação com Fal AI passa por este backend
- Passwords são sempre hashed com bcrypt (cost 10)
- DTOs validam todos os inputs com class-validator
- Guards protegem todas as rotas que requerem auth
- O frontend (Next.js) corre na porta 3000, este backend na 3001
- Prisma deve ser corrido sempre com `npx prisma@6` (projeto usa v6)
- `tsconfig.build.json` exclude deve incluir `"scripts"` e `"prisma"` — pastas .ts fora de src/ causam falha no Railway
- Soft delete: apagar um staging define `deletedAt`, não remove o registo — protege os limites mensais
- Webhook LS: validar SEMPRE a assinatura HMAC-SHA256 antes de processar
