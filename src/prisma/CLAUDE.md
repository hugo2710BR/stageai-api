# prisma

## Objetivo
Cliente Prisma partilhado por todos os módulos. Ponto único de acesso à base de dados PostgreSQL.

## Ficheiros
| Ficheiro | Responsabilidade |
|---|---|
| `prisma.module.ts` | Módulo global (`@Global()`) — injeta `PrismaService` em toda a app sem imports repetidos |
| `prisma.service.ts` | Extende `PrismaClient`, faz `$connect()` no `onModuleInit` |

## Schema (em `prisma/schema.prisma`)
**User**
- `id` — String @id @default(cuid())
- `email` — String @unique
- `password` — String (bcrypt hash)
- `name` — String?
- `plan` — String @default("free") — valores: `free | starter | pro | agency`
- `createdAt` — DateTime

**Staging**
- `id` — String @id @default(cuid())
- `userId` — String (FK → User)
- `style` — String
- `prompt` — String?
- `imageUrl` — String? (campo legado — não usado activamente)
- `resultUrl` — String? — URL pública no Cloudflare R2
- `status` — String — `processing | completed | failed`
- `createdAt` — DateTime

## Requisitos
- Comandos Prisma sempre com `npx prisma@6` (versão 6 — não omitir a versão)
- Após qualquer alteração ao schema: `npx prisma@6 migrate dev --name <descricao>` + `npx prisma@6 generate`
- Nunca editar ficheiros em `prisma/migrations/` manualmente
- `PrismaService` é `@Global()` — não o adicionar ao `imports[]` de outros módulos
