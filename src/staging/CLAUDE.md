# staging

## Objetivo
Módulo principal de negócio — orquestra geração de imagens via Fal AI, armazenamento no R2, histórico e rate limiting por plano.

## Ficheiros
| Ficheiro | Responsabilidade |
|---|---|
| `staging.module.ts` | Regista controller, service, importa `FalModule` e `R2Module` |
| `staging.controller.ts` | Rotas HTTP — todas protegidas por `JwtAuthGuard` |
| `staging.service.ts` | Lógica de negócio — limites, geração, persistência |
| `dto/create-staging.dto.ts` | Valida body do POST /staging |

## Endpoints
| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/staging` | Cria um novo staging (verifica limite → gera → persiste) |
| `GET` | `/staging/usage` | Devolve `{ plan, used, limit, remaining }` do mês corrente |
| `GET` | `/staging` | Lista stagings com `status = 'completed'` e `deletedAt = null`, ordenados por data desc |
| `DELETE` | `/staging/:id` | Soft delete — apaga ficheiro do R2, marca `deletedAt` no Postgres |

## Fluxo de criação (POST /staging)
1. Busca `user.plan` na DB
2. `checkLimit()` — busca limite na tabela `Plan`; conta stagings do mês (incluindo soft-deleted); lança 429 se atingido
3. Cria registo com `status: 'processing'`
4. Chama `FalService.inpaint(image, mask, prompt)` → URL temporária
5. Chama `R2Service.uploadFromUrl(url, key)` → URL permanente no R2
6. Actualiza registo com `resultUrl` e `status: 'completed'`
7. Em caso de erro: actualiza para `status: 'failed'` e relança a excepção

## Soft delete (DELETE /staging/:id)
- Apaga o ficheiro do R2 (para não ocupar espaço)
- Marca `deletedAt = now()` no registo Postgres — **não apaga o registo**
- O registo continua a contar para o limite mensal do utilizador
- O histórico (`GET /staging`) filtra por `deletedAt: null`

## Limites por plano
Os limites são lidos da tabela `Plan` no Postgres via `prisma.plan.findUnique({ where: { name: planName } })`.
Não existe `PLAN_LIMITS` hardcoded — alterar limites no Prisma Studio ou via seed.

| Plano | Gerações/mês |
|---|---|
| free | 3 |
| starter | 30 |
| pro | 100 |
| agency | Ilimitado (limit = null) |

## Requisitos
- Todas as rotas requerem JWT — `@UseGuards(JwtAuthGuard)` aplicado ao nível do controller
- O `userId` vem sempre de `req.user.id` (injectado pelo JwtStrategy) — nunca do body
- A key R2 segue o padrão `stagings/<stagingId>.png`
- Limites vêm sempre da tabela `Plan` — nunca hardcoded
