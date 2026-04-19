# plans

## Objetivo
Expõe os planos de subscrição disponíveis. Fonte de verdade para limites de geração e preços — substitui o `PLAN_LIMITS` que estava hardcoded no `StagingService`.

## Ficheiros
| Ficheiro | Responsabilidade |
|---|---|
| `plans.module.ts` | Regista controller e service |
| `plans.controller.ts` | `GET /api/plans` — rota pública (sem auth) |
| `plans.service.ts` | Consulta a tabela `Plan` no Postgres |

## Endpoint
| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `GET` | `/plans` | Não | Devolve lista de planos activos ordenados por `sortOrder` |

## Modelo Plan (Prisma)
```
id            — String @id
name          — String @unique — slug: "free" | "starter" | "pro" | "agency"
displayName   — String — nome para mostrar: "Free", "Starter", etc.
price         — Float — preço em EUR
currency      — String @default("EUR")
limit         — Int? — null = ilimitado; número = gerações/mês
features      — String[] — lista de funcionalidades para mostrar no UI
highlighted   — Boolean — true = destaque "Popular"
active        — Boolean — false = não aparece no UI
sortOrder     — Int — ordem de exibição
stripePriceId — String? — ID do produto no Stripe (preenchido quando Stripe for integrado)
```

## Seed
Dados iniciais em `prisma/seed.ts`. Para correr:
```bash
npx ts-node --transpile-only prisma/seed.ts
```
Usa `upsert` — pode ser corrido várias vezes sem duplicar.

## Requisitos
- `GET /plans` é público — não aplicar `JwtAuthGuard`
- Para alterar preços ou features, editar directamente no Prisma Studio ou via `prisma/seed.ts` + upsert
- O `StagingService` busca o limite do plano directamente via `prisma.plan.findUnique({ where: { name: planName } })`
- `stripePriceId` fica null até integração com Stripe
