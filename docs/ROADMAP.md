# StageAI API — Backend Roadmap

> Ultima atualizacao: 2026-04-18
> Calendarizacao alinhada com o roadmap do frontend.

---

## Semana 1-2 — Converter e proteger

| Feature | ID | Esforço | Descricao |
|---|---|---|---|
| Rate limiting + planos | FEAT-001 | Medio | Campo plan no User, contagem mensal, endpoint usage |

**Tarefas BE:**
1. Migration: adicionar campo `plan` (default "free") ao User
2. Logica em `staging.service.ts`: contar geracoes do mes, rejeitar se >= limite
3. Novo endpoint GET /staging/usage → { used: number, limit: number, plan: string }
4. Testar: user free bloqueado apos 3, outros planos com limites corretos

---

## Semana 3-4 — Monetizar

| Feature | ID | Esforço | Descricao |
|---|---|---|---|
| Integracao Stripe | FEAT-004 | Alto | Novo modulo billing, checkout, webhooks |
| Partilha publica | FEAT-005 | Medio | Endpoint publico, campo isPublic |
| Variacoes | FEAT-003 | Baixo | Campo seed no DTO, passar ao Fal |

**Tarefas BE:**
1. Criar modulo `src/billing/` com Stripe SDK
2. POST /billing/checkout → Stripe Checkout session
3. POST /billing/webhook → processar payment events, atualizar plano
4. Migration: stripeCustomerId, creditsRemaining no User
5. Migration: isPublic no Staging
6. GET /staging/share/:id sem auth
7. PATCH /staging/:id (toggle isPublic)
8. Campo seed opcional no CreateStagingDto
9. Passar seed ao FalService.inpaint()

---

## Semana 5-6 — Reter e expandir

| Feature | ID | Esforço | Descricao |
|---|---|---|---|
| Exportacao PDF | FEAT-006 | Medio | GET /staging/:id/pdf |
| Estilos custom | FEAT-007 | Medio | CRUD custom styles |

**Tarefas BE:**
1. GET /staging/:id/pdf → gerar PDF com before/after
2. Migration: model CustomStyle (name, prompt, userId)
3. CRUD endpoints para custom styles
4. Limitar a 10 custom styles por user

---

## Apos Semana 6

Priorizar com base em metricas e feedback:
- FEAT-009: Auto-detecao de mascara (investigar SAM)
- FEAT-012: Favoritos (migration simples)
- FEAT-014: Dashboard stats (Prisma groupBy)
- FEAT-015: Portais imobiliarios (requer parcerias)
- FEAT-016: Video 360 (investigacao de modelos)
