# StageAI API — Backend Backlog

> Ultima atualizacao: 2026-04-18
> Este backlog contem apenas features que requerem alteracoes no backend.
> Para o backlog completo do produto, ver o repositorio frontend (stageai).

---

## P1 — Critico (Semana 1-2)

### FEAT-001: Rate limiting + planos
- **Prioridade:** P1
- **Impacto:** Alto
- **Esforço:** Medio
- **Estado:** Todo
- **Descricao:** Limitar geracoes por mes com base no plano do utilizador. Sem isto, custos descontrolados a $0.05/geracao.
- **Criterios de aceitacao:**
  - Campo `plan` no User (enum: free, starter, pro, agency)
  - Contagem de geracoes do mes corrente antes de processar
  - Rejeitar com 429 quando limite atingido
  - Endpoint GET /staging/usage para frontend consultar
  - Reset automatico mensal (contagem por createdAt)
- **Ficheiros afetados:**
  - `prisma/schema.prisma` — campo `plan` no User (default "free")
  - `src/staging/staging.service.ts` — verificar limite em `create()`
  - `src/staging/staging.controller.ts` — GET /staging/usage
  - Nova migration Prisma
- **Notas tecnicas:** Nao criar model Usage separado — contar diretamente nos Staging com `createdAt >= inicioDoMes`. Limites: free=3, starter=30, pro=100, agency=ilimitado.

---

### FEAT-003: Variacoes no resultado
- **Prioridade:** P1
- **Impacto:** Alto
- **Esforço:** Baixo
- **Estado:** Todo
- **Descricao:** Aceitar campo `seed` opcional no DTO para gerar variacoes com mesmo prompt mas resultado diferente.
- **Criterios de aceitacao:**
  - Campo `seed` opcional no CreateStagingDto
  - Passado ao FalService.inpaint() se presente
  - Resultado diferente com mesmo prompt quando seed muda
- **Ficheiros afetados:**
  - `src/staging/dto/create-staging.dto.ts` — campo seed opcional
  - `src/fal/fal.service.ts` — passar seed ao modelo
- **Notas tecnicas:** Verificar se fal-ai/flux-pro/v1/fill aceita parametro seed. Se nao, variar o prompt ligeiramente.

---

## P2 — Importante (Semana 3-4)

### FEAT-004: Integracao Stripe
- **Prioridade:** P2
- **Impacto:** Alto
- **Esforço:** Alto
- **Estado:** Todo
- **Descricao:** Modulo de billing com Stripe Checkout para subscricoes e pacotes avulso.
- **Criterios de aceitacao:**
  - POST /billing/checkout — cria sessao Stripe Checkout
  - POST /billing/webhook — processa eventos Stripe
  - Atualiza plano do user apos pagamento
  - Cancelamento atualiza plano para free no fim do periodo
  - Pacotes avulso adicionam creditos
- **Ficheiros afetados:**
  - `src/billing/` — novo modulo (service, controller, module)
  - `src/billing/billing.service.ts` — Stripe SDK
  - `src/billing/billing.controller.ts` — checkout + webhook
  - `prisma/schema.prisma` — stripeCustomerId, plan, creditsRemaining no User
  - `src/app.module.ts` — importar BillingModule
  - Nova migration Prisma
- **Notas tecnicas:** Stripe Checkout (hosted) simplifica PCI compliance. Webhook deve validar assinatura Stripe. Usar `stripe` npm package.

---

### FEAT-005: Partilha publica
- **Prioridade:** P2
- **Impacto:** Alto
- **Esforço:** Medio
- **Estado:** Todo
- **Descricao:** Endpoint publico para aceder a staging sem autenticacao.
- **Criterios de aceitacao:**
  - GET /staging/share/:id sem auth
  - Retorna dados do staging (resultUrl, style, createdAt)
  - Apenas stagings marcados como publicos
  - PATCH /staging/:id para toggle isPublic
- **Ficheiros afetados:**
  - `src/staging/staging.controller.ts` — GET /staging/share/:id (sem guard)
  - `src/staging/staging.service.ts` — findPublicById(), togglePublic()
  - `prisma/schema.prisma` — campo isPublic Boolean default false
  - Nova migration Prisma
- **Notas tecnicas:** Garantir que o endpoint publico nao expoe dados sensiveis (sem userId, sem imageUrl original).

---

### FEAT-006: Exportacao PDF
- **Prioridade:** P2
- **Impacto:** Medio
- **Esforço:** Medio
- **Estado:** Todo
- **Descricao:** Gerar PDF server-side com before/after e branding.
- **Criterios de aceitacao:**
  - GET /staging/:id/pdf retorna ficheiro PDF
  - Layout A4 com logo, before/after, estilo, data
  - Protegido por JWT (apenas dono do staging)
- **Ficheiros afetados:**
  - `src/staging/staging.controller.ts` — GET /staging/:id/pdf
  - `src/staging/staging.service.ts` — generatePdf()
  - Dependencia: puppeteer ou pdfkit
- **Notas tecnicas:** Alternativa mais leve: gerar no frontend com jsPDF. Se server-side, cuidado com memoria do Puppeteer no Railway.

---

## P3 — Nice to have (Semana 5-6)

### FEAT-007: Estilos custom
- **Prioridade:** P3
- **Impacto:** Medio
- **Esforço:** Medio
- **Estado:** Todo
- **Descricao:** CRUD de estilos personalizados por utilizador.
- **Ficheiros afetados:**
  - `prisma/schema.prisma` — model CustomStyle
  - `src/staging/staging.controller.ts` ou novo controller
  - `src/staging/staging.service.ts` — CRUD
- **Notas tecnicas:** Maximo 10 por user. Guardar apenas name + prompt.

---

### FEAT-009: Auto-detecao de mascara
- **Prioridade:** P3
- **Impacto:** Alto
- **Esforço:** Alto
- **Estado:** Todo
- **Descricao:** Endpoint que recebe imagem e retorna mascara automatica.
- **Ficheiros afetados:**
  - `src/staging/staging.controller.ts` — POST /staging/auto-mask
  - `src/staging/staging.service.ts` — chamar modelo de segmentacao
  - Dependencia: modelo SAM no Fal AI ou Replicate
- **Notas tecnicas:** Investigar Segment Anything Model. Custo adicional por chamada.

---

### FEAT-012: Favoritos
- **Prioridade:** P3
- **Impacto:** Medio
- **Esforço:** Baixo
- **Estado:** Todo
- **Descricao:** Toggle favorito num staging.
- **Ficheiros afetados:**
  - `prisma/schema.prisma` — campo isFavorite no Staging
  - `src/staging/staging.controller.ts` — PATCH /staging/:id/favorite
  - `src/staging/staging.service.ts` — toggleFavorite()
- **Notas tecnicas:** Migration aditiva simples.

---

## P4 — Futuro

### FEAT-014: Dashboard stats
- **Ficheiros afetados:** `src/staging/staging.controller.ts` — GET /staging/stats
- **Notas tecnicas:** Prisma groupBy para agregacoes por mes e estilo.

### FEAT-015: Integracao portais imobiliarios
- **Ficheiros afetados:** Novo modulo `src/integrations/`
- **Notas tecnicas:** APIs de portais requerem parcerias. Investigar antes.

### FEAT-016: Video / 360
- **Ficheiros afetados:** Novo pipeline completo
- **Notas tecnicas:** Modelos de video AI em evolucao rapida. Reavaliar em 2-3 meses.
