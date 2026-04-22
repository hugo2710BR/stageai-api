# StageAI API — Decision Log

> Ultima atualizacao: 2026-04-22

---

## DEC-001: Modelo de IA — Fal AI flux-pro/v1/fill

**Data:** 2026-04
**Estado:** Implementado e em producao

**Decisao:** Usar Fal AI com modelo `fal-ai/flux-pro/v1/fill` para inpainting (planos pagos).

**Implementacao:**
- `src/fal/fal.service.ts` — converte base64 → upload Fal storage → chama modelo
- Custo: $0.05 por geracao

**Porque Fal e nao Replicate:**
- Melhor qualidade de resultados
- API mais simples (upload + call)

---

## DEC-002: Storage — Cloudflare R2

**Data:** 2026-04
**Estado:** Implementado e em producao

**Decisao:** Upload de imagens geradas para R2 com URLs permanentes.

**Implementacao:**
- `src/r2/r2.service.ts` — S3Client compativel com R2
- Fluxo: Fal gera URL temporaria → R2 faz fetch → upload com key `stagings/{id}.png`
- ContentType: `image/jpeg` (Fal devolve JPEG)

**Custos:** $0.015/GB/mes, egress gratis.

---

## DEC-003: Prisma v6 (nao v7)

**Data:** 2026-03
**Estado:** Implementado

**Decisao:** Usar Prisma v6. Comando sempre com `npx prisma@6`.

**Porque:** Prisma v7 gera codigo ESM que conflita com build CommonJS do NestJS.

---

## DEC-004: Monetizacao — Lemon Squeezy (nao Stripe)

**Data:** 2026-04
**Estado:** Implementado e em producao

**Decisao:** Lemon Squeezy como plataforma de pagamentos. Stripe foi descartado.

**Porque:**
- Merchant of Record — trata VAT automaticamente (critico para Europa)
- Plano futuro: migrar para Paddle

**Implementacao:**
- `src/payments/` — PaymentsModule
- POST /payments/checkout — cria sessao LS, devolve URL
- POST /payments/webhook — valida HMAC-SHA256 com raw body, atualiza User.plan + planUpgradedAt
- CRITICO: validar webhook com raw body (nao JSON.stringify) — LS assina bytes exatos

**Planos:**
| Plano | Geracoes/mes | lsVariantId |
|---|---|---|
| free | 3 | — |
| starter | 30 | 1549528 |
| pro | 100 | 1549619 |
| agency | Ilimitado | — |

---

## DEC-005: Rate limiting — sem model Usage separado

**Data:** 2026-04
**Estado:** Implementado

**Decisao:** Contar geracoes diretamente na tabela Staging com filtro `createdAt >= inicioDoMes`. Sem model Usage separado.

**Adicional — planUpgradedAt:**
- Ao fazer upgrade, `planUpgradedAt` e gravado no User
- `getUsage` conta a partir de `max(inicioDoMes, planUpgradedAt)` — utilizador tem limite completo imediatamente apos upgrade

**Soft delete:**
- Apagar staging define `deletedAt`, nao remove registo
- Registo continua a contar para o limite mensal — previne abuso

---

## DEC-006: tsconfig.build.json — excluir pastas .ts fora de src/

**Data:** 2026-04
**Estado:** Ativo — regra permanente

**Decisao:** Qualquer pasta com ficheiros .ts fora de `src/` (ex: `prisma/`, `scripts/`) deve estar no `exclude` do `tsconfig.build.json`.

**Porque:** `nest build` compila tudo o que nao esta excluido. Ficheiros fora de `src/` causam erro silencioso no Railway (`Cannot find module '/app/dist/main'`).

**Estado atual do exclude:** `["node_modules", "test", "dist", "**/*spec.ts", "scripts", "prisma"]`

---

## DEC-007: Diferenciacao free vs pago — masking como feature paga

**Data:** 2026-04
**Estado:** Decisao tomada — implementacao futura (FEAT-NEW-001)

**Decisao:** Plano free nao tem masking. Usa modelo mais barato (full-room generation). Starter+ usa `flux-pro/v1/fill` com inpainting preciso.

**Racional:**
- O masking E o diferenciador do produto para profissionais
- `flux-pro/v1/fill` e o unico modelo Fal com inpainting real — custo $0.05/geracao
- Free users experimentam o resultado, pagam para ter controlo preciso
- Justifica upgrade de forma tangivel e clara

**Impacto no fluxo:**
- Free: Upload → Estilo → Gerar (modelo flux/schnell ou similar, ~$0.003/geracao)
- Starter+: Upload → Mascara → Estilo → Gerar (flux-pro/v1/fill, $0.05/geracao)

**Modelo free escolhido:** `fal-ai/flux/schnell` (~$0.003/geracao). Diferenca de qualidade clara vs flux-pro/v1/fill — argumento de upgrade forte e custo minimo no plano gratuito.
