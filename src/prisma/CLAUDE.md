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
| Campo | Tipo | Notas |
|---|---|---|
| `id` | String @id @default(uuid()) | |
| `email` | String @unique | |
| `password` | String | bcrypt hash |
| `name` | String? | |
| `plan` | String @default("free") | valores: `free \| starter \| pro \| agency` — referencia `Plan.name` |
| `createdAt` | DateTime | |
| `updatedAt` | DateTime @updatedAt | |

**Staging**
| Campo | Tipo | Notas |
|---|---|---|
| `id` | String @id @default(uuid()) | |
| `userId` | String | FK → User |
| `style` | String | |
| `prompt` | String? | |
| `imageUrl` | String? | campo legado — não usado activamente |
| `resultUrl` | String? | URL pública no Cloudflare R2 |
| `status` | String | `processing \| completed \| failed` |
| `createdAt` | DateTime | usado para contagem do limite mensal |
| `deletedAt` | DateTime? | null = visível; preenchido = soft delete (conta para o limite mensal) |

**Plan**
| Campo | Tipo | Notas |
|---|---|---|
| `id` | String @id @default(uuid()) | |
| `name` | String @unique | slug: `free \| starter \| pro \| agency` |
| `displayName` | String | nome para UI |
| `price` | Float | preço em EUR |
| `currency` | String @default("EUR") | |
| `limit` | Int? | null = ilimitado; número = gerações/mês |
| `features` | String[] | lista de features para UI |
| `highlighted` | Boolean | destaque "Popular" |
| `active` | Boolean | false = não aparece no UI |
| `sortOrder` | Int | ordem de exibição |
| `stripePriceId` | String? | para futura integração Stripe |

## Requisitos
- Comandos Prisma sempre com `npx prisma@6` (versão 6 — não omitir a versão)
- Após qualquer alteração ao schema: `npx prisma@6 migrate dev --name <descricao>` + `npx prisma@6 generate`
- Nunca editar ficheiros em `prisma/migrations/` manualmente
- `PrismaService` é `@Global()` — não o adicionar ao `imports[]` de outros módulos
- Seed dos planos: `npx ts-node --transpile-only prisma/seed.ts`
