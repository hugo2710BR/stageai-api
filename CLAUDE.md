# StageAI API — Backend

## O que e este projeto
Backend NestJS que serve a app StageAI. Gere autenticacao, proxy para Replicate API, e historico de stagings.

## Stack
- **Framework**: NestJS 11
- **ORM**: Prisma
- **Base de dados**: PostgreSQL
- **Auth**: JWT + Passport + bcrypt
- **AI API**: Replicate (stable-diffusion-inpainting)

## Estrutura do projeto
```
src/
├── main.ts              ← Entry point: CORS, validation, porta 3001
├── app.module.ts        ← Modulo raiz: liga todos os modules
├── prisma/              ← Database client (Global module)
├── auth/                ← Registo, login, JWT, guards
└── staging/             ← Proxy Replicate + historico
```

## Variaveis de ambiente obrigatorias
```
DATABASE_URL=postgresql://stageai:stageai_local@localhost:5432/stageai?schema=public
JWT_SECRET=change-me-in-production
JWT_EXPIRES_IN=7d
REPLICATE_API_TOKEN=r8_...
```

## Endpoints
| Metodo | Rota | Auth | Descricao |
|---|---|---|---|
| POST | /api/auth/register | Nao | Registo (email + password) |
| POST | /api/auth/login | Nao | Login → JWT |
| POST | /api/staging | JWT | Gera staging via Replicate |
| GET  | /api/staging | JWT | Lista historico do user |

## Como correr
```bash
docker compose up -d          # PostgreSQL
npx prisma generate           # Gera Prisma Client
npx prisma migrate dev        # Corre migrations
npm run start:dev             # Servidor em http://localhost:3001
```

## Regras para o agente
- NUNCA expor tokens ou secrets no frontend
- Toda a comunicacao com Replicate passa por este backend
- Passwords sao sempre hashed com bcrypt (cost 10)
- DTOs validam todos os inputs com class-validator
- Guards protegem todas as rotas que requerem auth
- O frontend (Next.js) corre na porta 3000, este backend na 3001
