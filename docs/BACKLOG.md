# StageAI API — Backend Backlog

> Ultima atualizacao: 2026-04-22
> Features que requerem alteracoes no backend.
> Para backlog completo do produto, ver repositorio frontend (stageai/docs/BACKLOG.md).

---

## Concluido ✅

### FEAT-001: Rate limiting + planos
- Campo `plan` no User + tabela `Plan` dinamica no Postgres
- GET /staging/usage com { plan, used, limit, remaining }
- Soft delete (deletedAt) — apagar nao repoe creditos
- `planUpgradedAt` — reset do contador ao fazer upgrade
- Limites lidos da tabela Plan (nao hardcoded)

### FEAT-004: Pagamentos — Lemon Squeezy
- PaymentsModule com POST /payments/checkout + POST /payments/webhook
- HMAC-SHA256 com raw body (nao JSON.stringify)
- Webhook atualiza User.plan + planUpgradedAt
- Env vars no Railway, webhook configurado no dashboard LS

---

## P1 — A fazer

### FEAT-NEW-001: Diferenciacao free vs pago (modelo + masking)
- **Prioridade:** P1
- **Esforco:** Medio
- **Estado:** Todo
- **Descricao:** Plano free usa modelo sem inpainting. Starter+ usa flux-pro/v1/fill. Mask torna-se opcional no DTO.
- **Criterios de aceitacao:**
  - `src/fal/fal.service.ts` suporta dois metodos: `generate()` (full-room) e `inpaint()` (com mascara)
  - `src/staging/staging.service.ts` escolhe metodo conforme `user.plan`
  - DTO aceita `mask` como opcional — obrigatorio apenas para planos pagos
  - Modelo free configuravel via variavel de ambiente ou tabela Plan
- **Ficheiros afetados:**
  - `src/fal/fal.service.ts`
  - `src/staging/staging.service.ts`
  - `src/staging/dto/create-staging.dto.ts`
- **Notas tecnicas:** Verificar parametros do modelo free escolhido. Garantir que staging free nao aceita mask mesmo que FE envie.

### FEAT-003: Variacoes no resultado (seed opcional)
- **Prioridade:** P1
- **Esforco:** Baixo
- **Estado:** Todo
- **Descricao:** Campo `seed` opcional no DTO para variacoes com mesmo prompt.
- **Ficheiros afetados:**
  - `src/staging/dto/create-staging.dto.ts`
  - `src/fal/fal.service.ts`

---

## P2 — Importante

### FEAT-NEW-002: Pagina de conta — DELETE /account
- **Prioridade:** P2
- **Esforco:** Medio
- **Estado:** Todo
- **Descricao:** Novo modulo Account com GET, PATCH e DELETE. DELETE apaga todos os ficheiros R2 do user antes de apagar o User no Postgres.
- **Criterios de aceitacao:**
  - GET /account devolve { name, email, plan, planUpgradedAt, createdAt }
  - PATCH /account atualiza name
  - DELETE /account: apaga R2 de todos os stagings → hard delete User (cascata apaga Stagings)
  - Requer confirmacao (password no body)
- **Ficheiros afetados:**
  - `src/account/` — novo modulo
  - `src/app.module.ts` — importar AccountModule
- **Notas tecnicas:** Apagar R2 antes de DB. Se algum delete R2 falhar, continuar (partial cleanup). Prisma onDelete Cascade no User→Staging.

### FEAT-005: Partilha publica
- **Prioridade:** P2
- **Esforco:** Medio
- **Estado:** Todo
- **Descricao:** GET /staging/share/:id sem auth. Campo isPublic no Staging.
- **Ficheiros afetados:**
  - `src/staging/staging.controller.ts`
  - `src/staging/staging.service.ts`
  - `prisma/schema.prisma` — isPublic Boolean default false
  - Nova migration

### FEAT-006: Exportacao PDF
- **Prioridade:** P2
- **Esforco:** Baixo (FE-side)
- **Estado:** Todo
- **Notas tecnicas:** Implementar no frontend com jsPDF. Sem alteracoes no BE.

---

## P3 — Nice to have

### FEAT-009: Auto-detecao de mascara (SAM)
- POST /staging/auto-mask — chama modelo de segmentacao (SAM no Fal AI)
- Feature premium, custo adicional por chamada

### FEAT-007: Estilos custom
- Model CustomStyle (name, prompt, userId), maximo 10 por user
- CRUD endpoints

### FEAT-012: Favoritos
- Campo isFavorite Boolean no Staging
- PATCH /staging/:id/favorite

### FEAT-014: Dashboard stats
- GET /staging/stats — groupBy mes e estilo (Prisma aggregations)

---

## P4 — Futuro

### FEAT-016: Video / 360
- Novo pipeline: image-to-video via Fal AI
- Guardar MP4 no R2
- Contar como geracao separada
- Feature starter+ minimo
- Reavaliar modelos disponiveis em 2-3 meses

### FEAT-015: Integracao portais imobiliarios
- Novo modulo src/integrations/
- Requer investigacao de APIs (Idealista, Imovirtual)
