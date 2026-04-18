# StageAI API — Decision Log

> Ultima atualizacao: 2026-04-18
> Decisoes tecnicas relevantes para o backend.

---

## DEC-001: Modelo de IA — Fal AI flux-pro/v1/fill

**Data:** 2026-04
**Estado:** Implementado e em producao

**Decisao:** Usar Fal AI com modelo `fal-ai/flux-pro/v1/fill` para inpainting.

**Implementacao:**
- `src/fal/fal.service.ts` — converte base64 → upload para Fal storage → chama modelo
- Replicate mantido como fallback comentado em `staging.service.ts`
- Custo: $0.05 por geracao

**Porque Fal e nao Replicate:**
- Melhor qualidade de resultados
- API mais simples (upload + call)
- Velocidade de geracao competitiva

---

## DEC-002: Storage — Cloudflare R2

**Data:** 2026-04
**Estado:** Implementado e em producao

**Decisao:** Upload de imagens geradas para R2 com URLs permanentes.

**Implementacao:**
- `src/r2/r2.service.ts` — S3Client compativel com R2
- Fluxo: Fal gera URL temporaria → R2 faz fetch → upload com key `stagings/{id}.png`
- Delete remove do R2 + DB

**Custos:** $0.015/GB/mes, egress gratis.

---

## DEC-003: Prisma v6 (nao v7)

**Data:** 2026-03
**Estado:** Implementado

**Decisao:** Usar Prisma v6 em vez de v7.

**Porque:** Prisma v7 gera codigo ESM que conflita com o build CommonJS do NestJS. Incompatibilidade ESM/CJS causava erro `exports is not defined`. Prisma v6 funciona sem problemas.

**Comando:** Usar sempre `npx prisma@6` para garantir versao correta.

---

## DEC-004: Monetizacao — Planos e limites

**Data:** 2026-04
**Estado:** Planeado (FEAT-001 + FEAT-004)

**Planos:**
| Plano | Preco | Geracoes/mes |
|---|---|---|
| Gratuito | €0 | 3 |
| Starter | €12/mes | 30 |
| Pro | €29/mes | 100 |
| Agency | €79/mes | Ilimitado |

**Pay-per-use:** 10 creditos por €6.

**Implementacao planeada:**
- Campo `plan` no User (enum string)
- Contagem de geracoes via query com filtro `createdAt >= inicioDoMes`
- Nao criar model Usage separado (complexidade desnecessaria)
- Stripe Checkout para pagamentos
- Webhooks para atualizar plano

---

## DEC-005: Rate limiting como prioridade maxima

**Data:** 2026-04
**Estado:** Ativo

**Decisao:** FEAT-001 deve ser implementada antes de qualquer outra feature.

**Racional:**
- A $0.05/geracao, sem limite = risco financeiro real
- 1000 users x 10 geracoes = $500/dia
- E a unica feature que protege contra custo descontrolado
- Deve estar pronta antes de promover o produto

---

## DEC-006: Infra — Railway + Vercel

**Data:** 2026-04
**Estado:** Em producao

**Backend:** Railway (NestJS + PostgreSQL)
- Monitorizar cold starts
- Considerar plano pago se latencia subir

**Frontend:** Vercel (Next.js)
- Variavel `NEXT_PUBLIC_API_URL` aponta para URL do Railway

**Base de dados:** PostgreSQL no Railway
- Backup automatico incluido
