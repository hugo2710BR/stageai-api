# StageAI API — Backend

## O que e este projeto
Backend NestJS que serve a app StageAI. Gere autenticacao, proxy para Replicate API, e historico de stagings.

## Stack
- **Framework**: NestJS 11
- **ORM**: Prisma 6
- **Base de dados**: PostgreSQL (Docker)
- **Auth**: JWT + Passport + bcrypt
- **AI API**: Replicate — `stability-ai/stable-diffusion-inpainting`

## Estrutura do projeto
```
src/
├── main.ts              ← Entry point: CORS, validation, porta 3001
├── app.module.ts        ← Modulo raiz: liga todos os modules
├── prisma/              ← Database client (Global module)
├── auth/                ← Registo, login, JWT, guards
└── staging/             ← Proxy Replicate + historico
```

## Variaveis de ambiente (.env)
```
DATABASE_URL=postgresql://stageai:stageai_local@localhost:5432/stageai?schema=public
JWT_SECRET=change-me-in-production
JWT_EXPIRES_IN=1h
REPLICATE_API_TOKEN=r8_...
FRONTEND_URL=http://localhost:3000   ← para CORS
```

## Endpoints
| Metodo | Rota | Auth | Descricao |
|---|---|---|---|
| POST | /api/auth/register | Nao | Registo (email + password + name?) |
| POST | /api/auth/login | Nao | Login → JWT |
| POST | /api/staging | JWT | Gera staging via Replicate |
| GET  | /api/staging | JWT | Lista historico do user |

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
```
Depois criar `.env` a partir do `.env.example` e preencher os valores.

## Estado atual ✅
- Auth (register/login com bcrypt + JWT) funcional
- Staging ligado ao Replicate com dimensoes normalizadas (snapTo64)
- Historico de stagings por utilizador guardado na DB
- CORS configurado para o frontend

## Proximos passos
1. Deploy — Railway ou Render (BE + PostgreSQL)
2. Variavel FRONTEND_URL em producao apontar para dominio Vercel

## Regras para o agente
- NUNCA expor tokens ou secrets no frontend
- Toda a comunicacao com Replicate passa por este backend
- Passwords sao sempre hashed com bcrypt (cost 10)
- DTOs validam todos os inputs com class-validator
- Guards protegem todas as rotas que requerem auth
- O frontend (Next.js) corre na porta 3000, este backend na 3001
- Prisma deve ser corrido sempre com `npx prisma@6` (projeto usa v6)
- width e height do staging sao normalizados com snapTo64() antes de enviar ao Replicate
