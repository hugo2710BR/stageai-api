# payments

## Objetivo
Integração com Lemon Squeezy para pagamentos e upgrades de plano. Trata da criação de checkout sessions e receção de webhooks.

## Ficheiros
| Ficheiro | Responsabilidade |
|---|---|
| `payments.module.ts` | Regista controller e service |
| `payments.controller.ts` | `POST /api/payments/checkout` (auth) e `POST /api/payments/webhook` (público) |
| `payments.service.ts` | Lógica de checkout e validação de webhooks |

## Endpoints
| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `POST` | `/payments/checkout` | Sim | Cria checkout session no LS, devolve URL de pagamento |
| `POST` | `/payments/webhook` | Não | Recebe eventos do Lemon Squeezy, atualiza `User.plan` |

## Fluxo de checkout
1. FE envia `{ planName: "starter" }` com JWT
2. BE busca `lsVariantId` da tabela `Plan`
3. Chama `createCheckout(storeId, variantId, { checkoutData: { custom: { user_id } } })`
4. Devolve `{ url }` → FE redireciona com `window.location.href`

## Fluxo de webhook (`order_created`)
1. Lemon Squeezy envia POST com header `x-signature`
2. BE valida HMAC-SHA256 com `LEMONSQUEEZY_WEBHOOK_SECRET`
3. Extrai `user_id` de `payload.meta.custom_data`
4. Extrai `variant_id` de `payload.data.attributes.first_order_item`
5. Busca plano por `lsVariantId` na tabela `Plan`
6. Atualiza `User.plan` no Postgres

## Variáveis de ambiente
```
LEMONSQUEEZY_API_KEY=...       ← API key do dashboard LS
LEMONSQUEEZY_STORE_ID=...      ← ID da store no dashboard LS
LEMONSQUEEZY_WEBHOOK_SECRET=...← Signing secret (max 40 chars) configurado no webhook LS
```

## Requisitos
- `POST /payments/checkout` requer JWT — `@UseGuards(JwtAuthGuard)`
- `POST /payments/webhook` é público — sem guard (o Lemon Squeezy não envia JWT)
- Validar sempre a assinatura do webhook antes de processar — nunca confiar no payload sem validar
- O `user_id` é passado como `custom_data` no checkout e devolvido pelo LS no webhook
- Apenas o evento `order_created` atualiza o plano — outros eventos são ignorados silenciosamente
