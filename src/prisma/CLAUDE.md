# Prisma Module

## Responsabilidade
Wrapper do Prisma Client como Global module — disponivel em toda a aplicacao sem precisar de importar em cada module.

## Ficheiros
- `prisma.service.ts` — Extende PrismaClient, conecta no init e desconecta no destroy
- `prisma.module.ts` — @Global() module que exporta PrismaService

## Schema (prisma/schema.prisma)
- **User** — id (uuid), email (unique), password (hashed), name, timestamps
- **Staging** — id (uuid), style, prompt, imageUrl, resultUrl, status, timestamps, relacao com User

## Regras
- Nunca aceder ao PrismaClient diretamente — usar sempre PrismaService injetado
- Migrations via `npx prisma migrate dev`
- Regenerar client apos alterar schema: `npx prisma generate`
