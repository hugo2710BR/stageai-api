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
| `GET` | `/staging` | Lista stagings com `status = 'completed'` do utilizador, ordenados por data desc |
| `DELETE` | `/staging/:id` | Apaga staging (verifica ownership, deleta do R2 e da DB) |

## Fluxo de criação (POST /staging)
1. Busca `user.plan` na DB
2. `checkLimit()` — conta stagings do mês; lança `HttpException 429` se atingido
3. Cria registo com `status: 'processing'`
4. Chama `FalService.inpaint(image, mask, prompt)` → URL temporária
5. Chama `R2Service.uploadFromUrl(url, key)` → URL permanente
6. Actualiza registo com `resultUrl` e `status: 'completed'`
7. Em caso de erro: actualiza para `status: 'failed'` e relança a excepção

## Limites por plano
| Plano | Gerações/mês |
|---|---|
| free | 3 |
| starter | 30 |
| pro | 100 |
| agency | Ilimitado |

## Requisitos
- Todas as rotas requerem JWT — `@UseGuards(JwtAuthGuard)` aplicado ao nível do controller
- O `userId` vem sempre de `req.user.id` (injectado pelo JwtStrategy) — nunca do body
- A key R2 segue o padrão `stagings/<stagingId>.png`
- Os limites estão definidos uma única vez na constante `PLAN_LIMITS` no topo do `staging.service.ts` — não duplicar
